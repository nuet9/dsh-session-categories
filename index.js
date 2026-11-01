import { z } from 'zod';
import { CategoryError, SessionCategories, createDomainSpec, parameters } from './model.js';

export const inject = ['storageDomain', 'workspaceRegistry', 'connection', 'tools', 'sessionPersistence'];
export const RPC_ENDPOINT = 'session-categories';

export async function apply(ctx) {
  const domain = await ctx.storageDomain.open(createDomainSpec(z));
  const service = new SessionCategories(domain.table('workspaces'), ctx.workspaceRegistry);
  const createdTimes = new Map();
  async function clientState(payload) {
    const state = await service.execute(payload);
    await Promise.all(state.sessionIds.map(async id => {
      if (createdTimes.has(id)) return;
      const snapshot = await ctx.sessionPersistence.stat(id);
      if (snapshot) createdTimes.set(id, snapshot.header.createdAt);
    }));
    return { ...state, createdAtBySession: Object.fromEntries(state.sessionIds.filter(id => createdTimes.has(id)).map(id => [id, createdTimes.get(id)])) };
  }
  const disposers = [];
  let disposal;
  const dispose = () => disposal ??= (async () => {
    try { for (const unregister of disposers.reverse()) await unregister(); }
    finally { try { await service.close(); } finally { await domain.close(); } }
  })();
  ctx.effect(() => dispose);
  const failure = error => ({ ok: false, error: {
    code: error instanceof CategoryError ? error.code : 'STORAGE_ERROR',
    message: error instanceof Error ? error.message : String(error), details: {},
  } });
  try {
    // Exact API routes inherit Connection's browser trust, authentication and
    // owner checks without taking the Gateway's sole shared RPC interceptor.
    disposers.push(ctx.connection.fetch.register({
      path: '/api/session-categories', methods: ['POST'], requestBody: 'buffered',
      async fetch(request) {
        if (request.headers.get('content-type')?.split(';', 1)[0].trim() !== 'application/json') return new Response('Expected application/json', { status: 415 });
        let envelope;
        try { envelope = await request.json(); } catch { return new Response('Invalid JSON', { status: 400 }); }
        if (!envelope || envelope.type !== 'client-request' || typeof envelope.rpcId !== 'string' || envelope.method !== RPC_ENDPOINT) return new Response('Invalid category request', { status: 400 });
        let result;
        try {
          if (request.signal.aborted) throw new CategoryError('ABORTED', 'Request was cancelled.');
          result = { ok: true, value: await clientState(envelope.payload) };
        } catch (error) { result = failure(error); }
        return Response.json({ type: 'server-response', rpcId: envelope.rpcId, result });
      },
    }));
    disposers.push(ctx.tools.register({
      name: 'session_categories',
      description: 'List and manage persistent session categories within a Harness workspace. Create, rename, delete, move sessions, or collapse categories. Deleting a category returns its sessions to Unclassified. Returns the complete workspace category state and current member session IDs.',
      parameters,
      output: {
        schema: {
          type: 'object', required: ['workspaceId', 'categories', 'assignments', 'sessionIds'], additionalProperties: false,
          properties: {
            workspaceId: { type: 'string' }, categoryId: { type: 'string' },
            categories: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'name', 'collapsed'], properties: { id: { type: 'string' }, name: { type: 'string' }, collapsed: { type: 'boolean' } } } },
            assignments: { type: 'object', additionalProperties: true },
            sessionOrder: { type: 'array', items: { type: 'string' } },
            sessionIds: { type: 'array', items: { type: 'string' } },
          },
        },
        render(_args, value) { return [{ type: 'text', text: JSON.stringify(value) }]; },
      },
      isConcurrencySafe: args => args?.action === 'list',
      async execute(args, exec) {
        if (exec.signal.aborted) throw new CategoryError('ABORTED', 'Request was cancelled.');
        return service.execute(args);
      },
    }));
  } catch (error) { await dispose(); throw error; }
}
