import test from 'node:test';
import assert from 'node:assert/strict';
import { SessionCategories, validRecord, validateInput, createDomainSpec } from './model.js';

function fixture() {
  const records = new Map();
  const workspaces = new Map([['w1', { sessionIds: ['s1', 's2'] }], ['w2', { sessionIds: ['s3'] }]]);
  let count = 0, fail = false;
  const table = { get: key => records.get(key), async put(key, value) { await Promise.resolve(); if (fail) throw new Error('disk failure'); records.set(key, structuredClone(value)); } };
  const registry = { get: key => workspaces.get(key) };
  return { records, workspaces, table, registry, service: new SessionCategories(table, registry, () => `c${++count}`), setFail: value => { fail = value; } };
}
const run = (f, action, extra = {}, workspaceId = 'w1') => f.service.execute({ action, workspaceId, ...extra });

test('create/rename/collapse/move/delete survive service recreation without touching membership', async () => {
  const f = fixture();
  assert.deepEqual((await run(f, 'list')).categories, []);
  assert.equal(f.records.size, 0);
  const { categoryId } = await run(f, 'create', { name: ' Research ' });
  await run(f, 'rename', { categoryId, name: 'Reading' });
  await run(f, 'collapse', { categoryId, collapsed: true });
  await run(f, 'move', { categoryId, sessionId: 's1' });
  const reopened = new SessionCategories(f.table, f.registry);
  assert.deepEqual((await reopened.execute({ action: 'list', workspaceId: 'w1' })).categories, [{ id: categoryId, name: 'Reading', collapsed: true }]);
  assert.deepEqual((await run(f, 'list')).assignments, { s1: categoryId });
  assert.deepEqual((await run(f, 'delete', { categoryId })).assignments, {});
  assert.deepEqual(f.workspaces.get('w1').sessionIds, ['s1', 's2']);
});
test('workspace isolation, membership validation and null move', async () => {
  const f = fixture();
  const { categoryId } = await run(f, 'create', { name: 'Same' });
  await run(f, 'create', { name: 'Same' }, 'w2');
  await assert.rejects(run(f, 'move', { categoryId, sessionId: 's3' }), { code: 'SESSION_NOT_IN_WORKSPACE' });
  await assert.rejects(run(f, 'move', { categoryId, sessionId: 's3' }, 'w2'), { code: 'CATEGORY_NOT_FOUND' });
  await assert.rejects(run(f, 'list', {}, 'missing'), { code: 'WORKSPACE_NOT_FOUND' });
  await run(f, 'move', { categoryId, sessionId: 's1' });
  assert.deepEqual((await run(f, 'move', { categoryId: null, sessionId: 's1' })).assignments, {});
  await run(f, 'move', { categoryId, sessionId: 's1' });
  f.workspaces.get('w1').sessionIds = ['s2'];
  assert.deepEqual((await run(f, 'list')).assignments, {});
});
test('serialized concurrent writes do not lose updates and failures do not poison queue', async () => {
  const f = fixture();
  await Promise.all(Array.from({ length: 30 }, (_, i) => run(f, 'create', { name: `Category ${i}` })));
  assert.equal((await run(f, 'list')).categories.length, 30);
  f.setFail(true);
  await assert.rejects(run(f, 'create', { name: 'Failed' }), /disk failure/);
  f.setFail(false);
  assert.equal((await run(f, 'create', { name: 'After failure' })).categories.length, 31);
  await assert.rejects(run(f, 'create', { name: 'category 0' }), { code: 'DUPLICATE_NAME' });
  assert.equal((await run(f, 'list')).categories.length, 31);
});
test('reject malformed actions and stored records before persistence', async () => {
  for (const input of [null, {}, { action: '__proto__', workspaceId: 'w1' }, { action: 'list', workspaceId: 'w1', name: 'extra' }, { action: 'create', workspaceId: 'w1', name: ' ' }, { action: 'collapse', workspaceId: 'w1', categoryId: 'c1', collapsed: 'true' }, { action: 'move', workspaceId: 'w1', sessionId: 's1' }]) assert.throws(() => validateInput(input), { code: 'INVALID_INPUT' });
  assert.deepEqual(validateInput({ action: 'list', workspaceId: 'w1', categoryId: null, collapsed: false, name: '', sessionId: '' }), { action: 'list', workspaceId: 'w1' });
  assert.equal(validRecord({ categories: [], assignments: {} }), true);
  for (const value of [null, {}, { categories: [], assignments: { s1: 'missing' } }, { categories: [{ id: 'c1', name: 'One', collapsed: false }, { id: 'c1', name: 'Two', collapsed: false }], assignments: {} }]) assert.equal(validRecord(value), false);
  const f = fixture(); f.records.set('w1', { categories: [], assignments: { s1: 'missing' } });
  await assert.rejects(run(f, 'list'), { code: 'INVALID_RECORD' });
});
test('drop insertion order persists and invalid destination rows are rejected', async () => {
  const f=fixture();
  await run(f,'move',{sessionId:'s2',categoryId:null,beforeSessionId:'s1'});
  assert.deepEqual((await run(f,'list')).manualGroupOrders.unclassified,['s2','s1']);
  await run(f,'move',{sessionId:'s2',categoryId:null,beforeSessionId:null});
  assert.deepEqual((await run(f,'list')).manualGroupOrders.unclassified,['s1','s2']);
  await assert.rejects(run(f,'move',{sessionId:'s1',categoryId:null,beforeSessionId:'s3'}),{code:'INVALID_INPUT'});
  assert.deepEqual((await run(f,'list')).manualGroupOrders.unclassified,['s1','s2']);
});
test('domain declaration supplies the persisted record validator and closes after draining', async () => {
  let validator;
  const spec = createDomainSpec({ custom(fn) { validator = fn; return { safeParse: value => ({ success: fn(value) }) }; } });
  assert.equal(spec.name, 'session_categories'); assert.match(spec.name, /^[a-z][a-z0-9_]*$/); assert.equal(spec.version, 1);
  assert.equal(validator({ categories: [], assignments: {} }), true);
  const f = fixture();
  const pending = run(f, 'create', { name: 'Queued' });
  await f.service.close(); await pending;
  await assert.rejects(run(f, 'list'), { code: 'CLOSED' });
  assert.equal(f.records.get('w1').categories.length, 1);
});

test('dragging another category never captures new unclassified members', async()=>{
 const f=fixture();const {categoryId}=await run(f,'create',{name:'Work'});
 await run(f,'move',{sessionId:'s1',categoryId,beforeSessionId:null});
 f.workspaces.get('w1').sessionIds.push('newest');
 await run(f,'move',{sessionId:'s1',categoryId,beforeSessionId:null});
 const state=await run(f,'list');
 assert.equal(state.manualGroupOrders.unclassified,undefined);
 assert.deepEqual(state.manualGroupOrders[categoryId],['s1']);
 assert.ok(!state.sessionOrder.includes('newest'));
});
