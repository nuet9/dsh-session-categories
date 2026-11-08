import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('./client.js',import.meta.url),'utf8');
test('add workspace uses composed directory flow and handles adoption failures',async()=>{
  assert.doesNotMatch(source,/ctx\.uiWorkspace\.pickDirectory\(/);
  assert.ok(!source.includes("children:{'sidebar.workspaces.directoryFlow'"));
  assert.ok(source.includes('void adoptWorkspace(directoryPath.trim())'));
  const body=source.match(/async function adoptWorkspace\(path\)\{([\s\S]*?)\n          \}/)[1];
  const calls=[],addingRef={current:false};let failure=false;
  const ctx={workspaces:{create:async input=>{if(failure)throw new Error('create failed');calls.push(input.path);}}};
  const errors=[],opened=[];
  const run=vm.runInNewContext('(async(path)=>{'+body+'})',{ctx,addingRef,setAddingWorkspace:()=>{},setWorkspaceError:value=>errors.push(value),setDirectoryOpen:value=>opened.push(value)});
  await run('/example');assert.deepEqual(calls,['/example']);assert.equal(addingRef.current,false);assert.equal(opened.at(-1),false);
  await run(null);assert.equal(calls.length,1);
  failure=true;await run('/failed');assert.equal(errors.at(-1),'create failed');assert.equal(addingRef.current,false);
  addingRef.current=true;await run('/duplicate');assert.equal(calls.length,1);
});
test('automatic order uses immutable creation time, independent of activity and membership order',()=>{
  const expression=source.match(/const chronological=(.*);/)[1];
  const rank=source.match(/const creationRank=(.*);/)[1];
  const order=(sessionIds,created,known=sessionIds)=>Array.from(vm.runInNewContext('const creationRank='+rank+';'+expression,{workspace:{sessionIds},created,data:{sessionIds:known}}));
  const created={old:100,middle:200,new:300};
  assert.deepEqual(order(['old','new','middle'],created),['new','middle','old']);
  assert.deepEqual(order(['middle','old','new'],created),['new','middle','old']);
  assert.deepEqual(order(['old','new','middle','newest'],{...created,newest:400}),['newest','new','middle','old']);
  assert.deepEqual(order(['b','a'],{}),['a','b']);
  assert.deepEqual(order(['old','remote'],{old:100},['old']),['remote','old']);
  assert.deepEqual(order(['old','remote'],{old:100,remote:200}),['remote','old']);
  assert.ok(!source.includes('if(pending.current||mutating.current)return;'));
  assert.doesNotMatch(expression,/updatedAt|lastPrompt|reverse/);
});
function fixture(){
  let plugin,Browser;
  const React={createElement:(type,props,...children)=>({type,props:props||{},children}),useRef:v=>({current:v}),useEffect:()=>{},useState:v=>[typeof v==='function'?v():v,()=>{}]};
  vm.runInNewContext(source,{window:{__ModuleLoader__:{load:m=>{plugin=m.factory(()=>React);}}},localStorage:{getItem:()=>null},Set,Map,console});
  plugin.apply({effect:()=>{},locale:{},slots:{inject:(name,fn)=>{if(name==='sidebar.workspaces')fn();},register:(options,component)=>{Browser=component;return()=>{};}}});
  const byId={one:{displayTitle:'One',running:true,retainedBy:{}},two:{displayTitle:'Two',running:false,retainedBy:{}}};
  let statuses=new Map([['one',{running:true,completionUnread:false}],['two',{running:false,completionUnread:false}]]);
  const list={ids:['one','two'],byId},snapshot={items:[],archivedSessionIds:[]};
  const render=()=>Browser({wide:true,useWorkspaces:f=>f(snapshot),useSessions:f=>f(list),useSessionStatus:f=>f(statuses),t:key=>key});
  return {render,byId,snapshot,setStatuses:v=>{statuses=v;}};
}
function nodes(node){if(!node||typeof node!=='object')return[];if(Array.isArray(node))return node.flatMap(nodes);if(typeof node.type==='function'&&node.type.name==='StatusIndicator')return nodes(node.type(node.props));return[node,...node.children.flatMap(nodes)];}
const sections=tree=>nodes(tree).filter(n=>n.type==='section');
test('running rows use native StateDot geometry, not text badges',()=>{
  const f=fixture(),tree=f.render(),all=nodes(tree);
  assert.equal(all.filter(n=>n.type==='svg'&&n.props['data-state']==='ongoing').length,1);
  assert.equal(all.filter(n=>n.type==='circle'&&n.props.r===9.5).length,2);
  assert.equal(all.filter(n=>n.props.className==='sc-badge').length,0);
  assert.equal(sections(tree).length,1);
});
test('native completionUnread appears in separate section and clears when read',()=>{
  const f=fixture();f.byId.one.running=false;
  f.setStatuses(new Map([['one',{running:false,completionUnread:true}]]));
  assert.equal(sections(f.render()).length,2);
  assert.equal(nodes(f.render()).filter(n=>n.props.className==='sc-completed-dot').length,1);
  f.setStatuses(new Map([['one',{running:false,completionUnread:false}]]));
  assert.equal(sections(f.render()).length,1);
});
test('current conversation and restarted generation never display stale completion',()=>{
  const f=fixture();f.setStatuses(new Map([['one',{running:true,completionUnread:true}],['two',{running:false,completionUnread:true}]]));
  f.byId.two.retainedBy.mainView=1;
  assert.equal(sections(f.render()).length,1);
});
test('completion section is independent of archived membership and workspace groups',()=>{
  const f=fixture();f.snapshot.archivedSessionIds=['two'];f.setStatuses(new Map([['two',{running:false,completionUnread:true}]]));
  assert.equal(sections(f.render()).length,2);
});
test('category view defaults on even when legacy preference selected original',()=>{
  assert.doesNotMatch(source,/getItem\(preferenceKey\)/);
  assert.match(source,/let enabled=true/);
  assert.doesNotMatch(source,/▤|▸|▾|✎|↗/);
  assert.match(source,/function Icon/);
  assert.match(source,/name:'categories',size:18/);
  assert.match(source,/\.sc-row\{min-height:32px/);
});
test('menu actions override hidden opacity on hover, focus and expanded state',()=>{
  assert.ok(source.includes('.sc-row:hover>button:not(.sc-session),.sc-row:focus-within>button:not(.sc-session),.sc-row>button[aria-expanded=true]:not(.sc-session){opacity:1}'));
  assert.ok(source.includes('.sc-heading:hover>button:not(.sc-label),.sc-heading:focus-within>button:not(.sc-label){opacity:1}'));
  assert.ok(source.includes("name==='more'?[5,12,19].map"));
});
test('session drag delegates to shared move operation within its workspace',()=>{
  assert.ok(source.includes('draggable:!busy,onDragStart:e=>beginDrag(e,wid,id)'));
  assert.ok(source.includes("source?.workspaceId!==wid||!workspace.sessionIds.includes(source.sessionId)"));
  assert.ok(source.includes("categoryId:key||null,beforeSessionId:target.beforeSessionId"));
  assert.ok(source.includes("className:'sc-insert-line'"));
  assert.ok(!source.includes('sc-drop-hint'));
  assert.ok(!source.includes('outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px'));
  assert.ok(source.includes('onDrop:e=>drop(e,key)'));
  assert.ok(source.includes('.sc-category-heading>button:not(.sc-label){opacity:1}'));
});
test('pending questions stay visible in activity list and replace spinner',()=>{
  const f=fixture();f.byId.one.running=false;
  f.setStatuses(new Map([['one',{running:false,pendingInteraction:'question'}]]));
  const all=nodes(f.render());
  assert.equal(all.filter(n=>n.props.className==='sc-pending-dot').length,1);
  assert.equal(all.filter(n=>n.props.className==='sc-pending-label').length,1);
  assert.equal(all.filter(n=>n.props['data-state']==='ongoing').length,0);
});
test('native animation timing and reduced motion are retained in scoped CSS',()=>{
  assert.match(source,/sc-state-spin 1\.5s linear infinite/);
  assert.match(source,/sc-state-dash 1\.5s ease-in-out infinite/);
  assert.match(source,/@media\(prefers-reduced-motion:reduce\)/);
});

test('legacy global order does not suppress chronological unclassified sessions',()=>{
 const expression=source.match(/const key=category\?\.id\|\|'', (.*), collapsed=/)?.[1];
 assert.ok(source.includes("saved=data?.manualGroupOrders?.[key||'unclassified']||(category?data?.sessionOrder:[])||[]"));
 assert.ok(source.includes('const ids=chronological.filter'));
 const choose=(category,data)=>data.manualGroupOrders?.[category?.id||'unclassified']||(category?data.sessionOrder:[])||[];
 assert.deepEqual(choose(null,{sessionOrder:['old','newest']}),[]);
 assert.deepEqual(choose({id:'c'},{sessionOrder:['old']}),['old']);
 assert.deepEqual(choose(null,{manualGroupOrders:{unclassified:['two','one']}}),['two','one']);
});
