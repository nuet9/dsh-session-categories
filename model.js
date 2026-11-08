import { randomUUID } from 'node:crypto';

export class CategoryError extends Error {
  constructor(code, message) { super(message); this.name = 'CategoryError'; this.code = code; }
}
const fail = (code, message) => { throw new CategoryError(code, message); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const identifier = value => typeof value === 'string' && value.length > 0 && value.length <= 256 && !['__proto__', 'constructor', 'prototype'].includes(value);
const nameOf = value => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 100 || /[\u0000-\u001f\u007f]/u.test(value)) fail('INVALID_INPUT', 'name must contain 1–100 visible characters.');
  return value.trim();
};
const fields = {
  list: [], create: ['name'], rename: ['categoryId', 'name'], delete: ['categoryId'],
  move: ['sessionId', 'categoryId', 'beforeSessionId'], collapse: ['categoryId', 'collapsed'],
};
export const parameters = {
  type: 'object', additionalProperties: false, required: ['action', 'workspaceId'],
  properties: {
    action: { type: 'string', enum: Object.keys(fields) },
    workspaceId: { type: 'string', description: 'Harness workspace ID, available in the workspace UI.' },
    categoryId: { type: ['string', 'null'], description: 'Required for rename/delete/move/collapse. Use null with move to return a session to Unclassified.' },
    name: { type: 'string', description: 'Required for create/rename; 1–100 visible characters, unique within the workspace.' },
    sessionId: { type: 'string', description: 'Required for move; must belong to the specified workspace.' },
    collapsed: { type: 'boolean', description: 'Required for collapse; true folds the category.' },
  },
};
export function validateInput(input) {
  if (!object(input) || !Object.hasOwn(fields, input.action)) fail('INVALID_INPUT', 'Expected a supported action.');
  if (!identifier(input.workspaceId)) fail('INVALID_INPUT', 'workspaceId must be a nonempty ID of at most 256 characters.');
  const allowed = ['action', 'workspaceId', ...fields[input.action]];
  if (Object.keys(input).some(key => !allowed.includes(key) && ![undefined, null, '', false].includes(input[key]))) fail('INVALID_INPUT', `Unexpected field for ${input.action}.`);
  input = Object.fromEntries(Object.entries(input).filter(([key]) => allowed.includes(key)));
  for (const key of fields[input.action].filter(key => key !== 'beforeSessionId')) if (!Object.hasOwn(input, key)) fail('INVALID_INPUT', `${key} is required for ${input.action}.`);
  if ('categoryId' in input && !(input.action === 'move' && input.categoryId === null) && !identifier(input.categoryId)) fail('INVALID_INPUT', 'categoryId must be a category ID.');
  if ('sessionId' in input && !identifier(input.sessionId)) fail('INVALID_INPUT', 'sessionId must be a session ID.');
  if ('collapsed' in input && typeof input.collapsed !== 'boolean') fail('INVALID_INPUT', 'collapsed must be boolean.');
  return { ...input, ...('name' in input ? { name: nameOf(input.name) } : {}) };
}
export function validRecord(value) {
  if (value?.sessionOrder !== undefined && (!Array.isArray(value.sessionOrder) || value.sessionOrder.some(id => !identifier(id)) || new Set(value.sessionOrder).size !== value.sessionOrder.length)) return false;
  if (value?.manualGroupOrders !== undefined && (!object(value.manualGroupOrders) || Object.values(value.manualGroupOrders).some(order => !Array.isArray(order) || order.some(id => !identifier(id)) || new Set(order).size !== order.length))) return false;
  if (!object(value) || Object.keys(value).some(key => !['categories', 'assignments', 'sessionOrder', 'manualGroupOrders'].includes(key)) || !Array.isArray(value.categories) || value.categories.length > 200 || !object(value.assignments)) return false;
  const ids = new Set(), names = new Set();
  for (const category of value.categories) {
    if (!object(category) || Object.keys(category).length !== 3 || !identifier(category.id) || typeof category.collapsed !== 'boolean') return false;
    try { if (nameOf(category.name) !== category.name) return false; } catch { return false; }
    const name = category.name.toLowerCase();
    if (ids.has(category.id) || names.has(name)) return false;
    ids.add(category.id); names.add(name);
  }
  return Object.entries(value.assignments).every(([sessionId, categoryId]) => identifier(sessionId) && ids.has(categoryId));
}
export function createDomainSpec(z) {
  return {
    name: 'session_categories', version: 1, layout: 'per-record',
    tables: { workspaces: { valueSchema: z.custom(validRecord, { message: 'Invalid workspace category record' }) } },
  };
}

// This domain service is the sole implementation called by both RPC and tools.
export class SessionCategories {
  constructor(table, registry, makeId = randomUUID) {
    this.table = table; this.registry = registry; this.makeId = makeId;
    this.tail = Promise.resolve(); this.closed = false;
  }
  execute(raw) {
    if (this.closed) return Promise.reject(new CategoryError('CLOSED', 'Category service is unloading.'));
    const operation = this.tail.then(() => this.run(validateInput(raw)));
    this.tail = operation.catch(() => {});
    return operation;
  }
  async close() { this.closed = true; await this.tail; }
  async run(input) {
    const workspace = this.registry.get(input.workspaceId);
    if (!workspace) fail('WORKSPACE_NOT_FOUND', 'Workspace does not exist.');
    const sessionIds = [...workspace.sessionIds];
    const members = new Set(sessionIds);
    const stored = this.table.get(input.workspaceId) ?? { categories: [], assignments: {} };
    if (!validRecord(stored)) fail('INVALID_RECORD', 'Stored category record is invalid.');
    const state = structuredClone(stored);
    // Ignore stale associations after membership changes; never change membership itself.
    state.assignments = Object.fromEntries(Object.entries(state.assignments).filter(([id]) => members.has(id)));
    let categoryId;
    const category = 'categoryId' in input && input.categoryId !== null ? state.categories.find(item => item.id === input.categoryId) : undefined;
    if ('categoryId' in input && input.categoryId !== null && !category) fail('CATEGORY_NOT_FOUND', 'Category does not exist in this workspace.');
    if (input.action === 'create' || input.action === 'rename') {
      if (state.categories.some(item => item.id !== category?.id && item.name.toLowerCase() === input.name.toLowerCase())) fail('DUPLICATE_NAME', 'A category with that name already exists in this workspace.');
    }
    switch (input.action) {
      case 'create':
        if (state.categories.length >= 200) fail('CATEGORY_LIMIT', 'A workspace supports at most 200 categories.');
        categoryId = this.makeId();
        if (!identifier(categoryId) || state.categories.some(item => item.id === categoryId)) fail('INVALID_ID', 'Could not generate a unique category ID.');
        state.categories.push({ id: categoryId, name: input.name, collapsed: false });
        break;
      case 'rename': category.name = input.name; break;
      case 'delete':
        state.categories = state.categories.filter(item => item.id !== input.categoryId);
        state.assignments = Object.fromEntries(Object.entries(state.assignments).filter(([, id]) => id !== input.categoryId));
        break;
      case 'move':
        if (!members.has(input.sessionId)) fail('SESSION_NOT_IN_WORKSPACE', 'Session does not belong to this workspace.');
        if (input.categoryId === null) delete state.assignments[input.sessionId];
        else state.assignments[input.sessionId] = input.categoryId;
        break;
      case 'collapse': category.collapsed = input.collapsed; break;
    }
    if (input.action === 'move' && input.beforeSessionId !== undefined && input.beforeSessionId !== null && !identifier(input.beforeSessionId)) fail('INVALID_INPUT', 'beforeSessionId must be a session ID or null.');
    if (input.action === 'move' && input.beforeSessionId !== undefined && input.beforeSessionId !== input.sessionId) {
      const targetIds = sessionIds.filter(id => members.has(id) && (state.assignments[id] || null) === input.categoryId && id !== input.sessionId);
      if (input.beforeSessionId !== null && !targetIds.includes(input.beforeSessionId)) fail('INVALID_INPUT', 'Drop target must belong to the destination category.');
      // Save only the destination group's explicit layout. Other groups stay automatic.
      const key = input.categoryId || 'unclassified';
      const orders = state.manualGroupOrders || {};
      const prior = orders[key] || [];
      const destination = sessionIds.filter(id => (state.assignments[id] || null) === input.categoryId && id !== input.sessionId);
      const base = [...new Set([...destination.filter(id => !prior.includes(id)).reverse(), ...prior])].filter(id => destination.includes(id));
      const index = input.beforeSessionId === null ? base.length : base.indexOf(input.beforeSessionId);
      base.splice(index, 0, input.sessionId);
      state.manualGroupOrders = { ...orders, [key]: base };
      // Retain the legacy field for older readers; current UI uses group orders.
      if (!state.sessionOrder) state.sessionOrder = [];

    }
    if (input.action !== 'list') await this.table.put(input.workspaceId, state);
    return structuredClone({ workspaceId: input.workspaceId, ...state, sessionIds, ...(categoryId ? { categoryId } : {}) });
  }
}
