window.__ModuleLoader__.load({
  id: '@local/session-categories',
  factory(require) {
    const React = require('react'), h = React.createElement, ns = 'session-categories';
    const dictionaries = {
      zh: {addWorkspace:'添加工作区',title:'会话分类',stock:'原始列表',switch:'切换会话分类视图',add:'新建分类',newSession:'新建会话',rename:'重命名',remove:'删除分类',deleteHint:'仅删除分类，其中的会话会回到“未分类”。',confirm:'确认删除',cancel:'取消',save:'保存',name:'分类名称',unclassified:'未分类',empty:'暂无会话',loading:'正在读取分类…',search:'搜索会话标题',move:'移动到分类',actions:'会话操作',refresh:'刷新',retry:'重试',fold:'展开或收起工作区',showArchived:'显示已归档会话',noWorkspace:'暂无工作区，请切回原始列表添加。',more:'显示更多',error:'操作失败',open:'打开会话',running:'进行中',noRunning:'暂无进行中的对话',current:'当前打开的对话',completed:'生成完成',waiting:'等待你回答',approval:'等待授权',review:'等待确认计划',unread:'生成完成，尚未查看'},
      en: {addWorkspace:'Add workspace',title:'Session categories',stock:'Original list',switch:'Toggle session categories',add:'New category',newSession:'New session',rename:'Rename',remove:'Delete category',deleteHint:'Sessions in this category will become unclassified.',confirm:'Confirm deletion',cancel:'Cancel',save:'Save',name:'Category name',unclassified:'Unclassified',empty:'No sessions',loading:'Loading categories…',search:'Search session titles',move:'Move to category',actions:'Session actions',refresh:'Refresh',retry:'Retry',fold:'Expand or collapse workspace',showArchived:'Show archived sessions',noWorkspace:'No workspaces. Switch to the original list to add one.',more:'Show more',error:'Operation failed',open:'Open session',running:'In progress',noRunning:'No conversations in progress',current:'Currently open conversation',completed:'Generation complete',waiting:'Waiting for your answer',approval:'Waiting for approval',review:'Waiting for plan review',unread:'Generation complete, unread'}
    };
    function Icon({name='categories',size=18}) {
      const paths={categories:'M3 4h6l2 2h10v13H3z M3 9h18 M8 9v10',chevron:'m9 5 7 7-7 7',down:'m5 9 7 7 7-7',plus:'M12 5v14 M5 12h14',newSession:'M14 5H5v14h14v-9 M13 11l7-7 M15 4h5v5',edit:'m4 16-1 5 5-1L20 8l-4-4z M14 6l4 4',close:'m6 6 12 12 M6 18 18 6',more:'M5 12h.01 M12 12h.01 M19 12h.01'};
      return h('svg',{width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true,className:'sc-icon'},name==='more'?[5,12,19].map(cx=>h('circle',{key:cx,cx,cy:12,r:1.5,fill:'currentColor',stroke:'none'})):h('path',{d:paths[name]||paths.categories}));
    }
    const css = `
.sc-browser{display:flex;flex-direction:column;min-height:0;flex:1;color:var(--dsw-alias-label-primary);font:inherit;padding:8px;gap:8px}
.sc-browser *{box-sizing:border-box}.sc-browser button,.sc-toggle{font:inherit;cursor:pointer;color:inherit;border:0;border-radius:6px;background:transparent;padding:5px 7px}
.sc-browser button:hover,.sc-toggle:hover{background:var(--dsw-alias-bg-layer-2)}.sc-browser button:disabled{opacity:.5;cursor:wait}
.sc-browser :focus-visible,.sc-toggle:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.sc-top,.sc-heading,.sc-row,.sc-form-actions{display:flex;align-items:center;gap:4px;min-width:0}.sc-top strong{flex:1;font-size:13px}.sc-top button{font-size:12px}
.sc-browser input,.sc-browser select{font:inherit;color:inherit;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:6px;padding:6px;min-width:0;max-width:100%}
.sc-browser input[type=search]{width:100%}.sc-scroll{overflow:auto;min-height:0;flex:1}.sc-workspace{margin-bottom:8px}.sc-heading{min-height:32px}.sc-heading>.sc-label{flex:1;min-width:0;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
.sc-group{margin-left:10px;border-left:1px solid var(--dsw-alias-border-l1);padding-left:5px}.sc-group .sc-heading{font-size:12px}.sc-group .sc-label{font-weight:500}.sc-count,.sc-muted{color:var(--dsw-alias-label-secondary);font-size:12px}.sc-count{flex-shrink:0}
.sc-row{min-height:30px;border-radius:6px;position:relative}.sc-row[data-active=true]{background:var(--dsw-alias-bg-layer-2)}.sc-session{flex:1;min-width:0;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sc-dot{color:var(--dsw-alias-brand-primary);width:9px;font-size:14px;flex-shrink:0}
.sc-running{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:6px;margin-bottom:10px}.sc-running-title{font-size:12px;font-weight:600;padding:3px 5px}.sc-badge{flex-shrink:0;color:var(--dsw-alias-brand-primary);font-size:11px;white-space:nowrap;padding:2px 4px}.sc-row[data-running=true] .sc-dot{color:var(--dsw-alias-brand-primary)}
.sc-status{width:16px;flex:none;display:inline-flex;align-items:center;justify-content:center}.sc-spinner{flex:none;color:var(--dsw-alias-label-tertiary)}.sc-spinner-motion{transform-origin:center;animation:sc-state-spin 1.5s linear infinite}.sc-spinner-track,.sc-spinner-arc{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}.sc-spinner-track{opacity:.25}.sc-spinner-arc{stroke-dasharray:12 150;animation:sc-state-dash 1.5s ease-in-out infinite}@keyframes sc-state-spin{to{transform:rotate(360deg)}}@keyframes sc-state-dash{0%{stroke-dasharray:12 150;stroke-dashoffset:0}50%{stroke-dasharray:24 150;stroke-dashoffset:-6}100%{stroke-dasharray:12 150;stroke-dashoffset:0}}@media(prefers-reduced-motion:reduce){.sc-spinner-motion,.sc-spinner-arc{animation:none}.sc-spinner-arc{stroke-dasharray:18 150;stroke-dashoffset:-3}}.sc-completed-dot{width:10px;height:10px;border-radius:50%;background:var(--dsw-alias-state-success-primary)}.sc-completed-label{color:var(--dsw-alias-state-success-primary);font-size:11px;white-space:nowrap;flex:none;padding:2px 4px}
.sc-editor,.sc-menu{padding:8px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);margin:4px 0}.sc-editor input,.sc-menu select{width:100%;margin:5px 0}.sc-form-actions{justify-content:flex-end}.sc-error{color:var(--dsw-alias-state-error-primary);font-size:12px;overflow-wrap:anywhere}.sc-rail{padding:8px;display:flex;justify-content:center}.sc-menu label{font-size:12px}.sc-toggle{display:flex;align-items:center;justify-content:center;min-width:32px;min-height:32px}.sc-muted{padding:4px 7px}.sc-filter{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.sc-icon{display:block;flex:none}.sc-toggle{width:32px;height:32px;min-width:32px;padding:7px;color:var(--dsw-alias-label-secondary);border-radius:8px;transition:background .15s,color .15s}.sc-toggle[aria-pressed=true]{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}
.sc-browser{padding:8px 10px;gap:10px;font-size:13px;line-height:20px}.sc-top{height:28px;padding:0 4px}.sc-top strong{font-weight:600}.sc-browser button{line-height:20px}.sc-browser input[type=search]{height:32px;padding:5px 10px;border-radius:8px;background:var(--dsw-alias-bg-layer-1)}
.sc-heading{gap:4px;min-height:32px;padding:0 4px}.sc-heading>.sc-label{display:flex;align-items:center;gap:6px;padding:4px 0}.sc-heading>button:not(.sc-label),.sc-row>button:not(.sc-session){width:24px;height:24px;padding:4px;display:inline-flex;align-items:center;justify-content:center;flex:none;color:var(--dsw-alias-label-secondary)}
.sc-heading>button:not(.sc-label){opacity:0}.sc-heading:hover>button:not(.sc-label),.sc-heading:focus-within>button:not(.sc-label){opacity:1}.sc-row>button:not(.sc-session){opacity:0}.sc-row:hover>button:not(.sc-session),.sc-row:focus-within>button:not(.sc-session),.sc-row>button[aria-expanded=true]:not(.sc-session){opacity:1}
.sc-workspace{margin-bottom:12px}.sc-group{margin-left:12px;padding-left:8px;border-left:0}.sc-group .sc-heading{color:var(--dsw-alias-label-secondary)}.sc-count{font-size:11px;font-variant-numeric:tabular-nums;opacity:.75;min-width:16px;text-align:center}.sc-row{min-height:32px;padding:0 6px;gap:6px;border-radius:8px}.sc-row:hover{background:var(--dsw-alias-bg-layer-2)}.sc-session{padding:6px 0!important;line-height:20px}.sc-browser .sc-session:hover{background:transparent}.sc-status{width:16px;height:20px}.sc-running{border:0;border-radius:0;padding:0 0 8px;margin-bottom:8px;border-bottom:1px solid var(--dsw-alias-border-l1)}.sc-running-title{padding:4px 6px;color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500}.sc-muted{margin:0;font-size:12px;padding:6px}.sc-completed-label{font-size:11px;padding-right:2px}.sc-rail button{width:32px;height:32px;padding:7px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}.sc-filter{padding:0 4px}.sc-filter input{accent-color:var(--dsw-alias-brand-primary)}
.sc-disclosure{display:inline-flex;align-items:center;justify-content:center;width:16px;min-width:16px;height:20px;flex:0 0 16px;opacity:1;visibility:visible;color:var(--dsw-alias-label-primary)}.sc-disclosure>.sc-icon{display:block;width:16px;height:16px;opacity:1;visibility:visible;stroke:currentColor;stroke-width:1.75;fill:none}.sc-heading-text{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sc-row[draggable=true]{cursor:grab}.sc-row[draggable=true]:active{cursor:grabbing}.sc-category-heading>button:not(.sc-label){opacity:1}
.sc-group{position:relative}.sc-insert-line{position:absolute;left:10px;right:10px;top:var(--sc-drop-y);height:1px;transform:translateY(-.5px);background:linear-gradient(90deg,transparent,var(--dsw-alias-brand-primary) 16%,var(--dsw-alias-brand-primary) 84%,transparent);opacity:.8;pointer-events:none;z-index:4;border-radius:999px}
.sc-scroll{position:relative}.sc-workspace>.sc-heading[draggable=true]{cursor:grab}.sc-workspace>.sc-heading[draggable=true]:active{cursor:grabbing}
.sc-pending-dot{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border:1.5px solid currentColor;border-radius:50%;color:var(--dsw-alias-state-warn-primary);font-size:10px;font-weight:700;line-height:1}.sc-pending-label{color:var(--dsw-alias-state-warn-primary);font-size:11px;white-space:nowrap;flex:none;padding:2px 4px}
@media(hover:none){.sc-heading>button:not(.sc-label),.sc-row>button:not(.sc-session){opacity:1}}
`;
    return {
      inject: ['slots','locale','connection','uiWorkspace','workspaces','sessions'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(ns, dictionaries));
        // Default on every client load; stock remains a temporary escape hatch.
        const foldKey='dsh.session-categories.fold.v1';
        const unclassifiedFoldKey='dsh.session-categories.unclassified-fold.v1';
        let enabled=true;
        const listeners=new Set();
        const mode={getSnapshot:()=>enabled,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}};
        async function rpc(payload, signal) {
          const result=await ctx.connection.rpc.call('/api','session-categories',payload,signal);
          if(!result.ok) throw new Error(result.error.message);
          return result.value;
        }
        function Editor({editor,busy,t,onSave,onCancel}) {
          const [name,setName]=React.useState(editor.name||'');
          return h('form',{className:'sc-editor',onSubmit:e=>{e.preventDefault();if(!busy)onSave(name);}},
            editor.kind==='delete'?h('p',null,t('deleteHint')):h('label',null,t('name'),h('input',{value:name,maxLength:80,autoFocus:true,required:true,onChange:e=>setName(e.target.value)})),
            h('div',{className:'sc-form-actions'},h('button',{type:'button',onClick:onCancel,disabled:busy},t('cancel')),h('button',{type:'submit',disabled:busy||editor.kind!=='delete'&&!name.trim()},t(editor.kind==='delete'?'confirm':'save'))));
        }
        // Native StateDot geometry/timing, scoped locally: plain-JS plugins do not import private Client modules.
        function pendingLabel(pending,t){return pending?t(pending==='approval'?'approval':pending==='plan-review'?'review':'waiting'):null;}
        function StatusIndicator({running,completed,current,pending,t}) {
          const label=pendingLabel(pending,t)||(running?t('running'):completed?t('unread'):current?t('current'):undefined);
          function synchronize(element){if(element)for(const animation of element.getAnimations?.({subtree:true})||[])animation.startTime=0;}
          return h('span',{className:'sc-status',title:label,role:label?'img':undefined,'aria-label':label},pending?h('span',{className:'sc-pending-dot','aria-hidden':true},'?'):running?
            h('svg',{className:'sc-spinner',ref:synchronize,onAnimationStart:e=>synchronize(e.currentTarget),width:14,height:14,viewBox:'0 0 24 24','aria-hidden':true,'data-state':'ongoing'},h('g',{className:'sc-spinner-motion'},h('circle',{className:'sc-spinner-track',cx:12,cy:12,r:9.5}),h('circle',{className:'sc-spinner-arc',cx:12,cy:12,r:9.5}))):
            completed?h('span',{className:'sc-completed-dot','aria-hidden':true}):h('span',{className:'sc-dot','aria-hidden':true},current?'•':''));
        }
        const dragType='application/x-dsh-category-session';
        let draggedSession=null;
        function beginDrag(event,workspaceId,sessionId){draggedSession={workspaceId,sessionId};event.dataTransfer.effectAllowed='move';event.dataTransfer.setData(dragType,JSON.stringify(draggedSession));}
        function endDrag(){draggedSession=null;}
        function Workspace({workspace,summary,statuses,archived,showArchived,query,t,onWorkspaceDragStart,onWorkspaceDragEnd}) {
          const wid=workspace.workspaceId;
          const [data,setData]=React.useState(null),[error,setError]=React.useState(''),[busy,setBusy]=React.useState(false),[editor,setEditor]=React.useState(null),[menu,setMenu]=React.useState(null),[limits,setLimits]=React.useState({});
          const [folded,setFolded]=React.useState(()=>{try{return JSON.parse(localStorage.getItem(foldKey)||'{}')[wid]===true;}catch{return false;}});
          const [unclassifiedFolded,setUnclassifiedFolded]=React.useState(()=>{try{return JSON.parse(localStorage.getItem(unclassifiedFoldKey)||'{}')[wid]===true;}catch{return false;}});
          function toggleUnclassified(){setUnclassifiedFolded(value=>{const next=!value;try{const saved=JSON.parse(localStorage.getItem(unclassifiedFoldKey)||'{}');saved[wid]=next;localStorage.setItem(unclassifiedFoldKey,JSON.stringify(saved));}catch{}return next;});}
          const alive=React.useRef(true),sequence=React.useRef(0),pending=React.useRef(false),mutating=React.useRef(false);
          const refresh=React.useCallback(async(signal)=>{
            if(pending.current||mutating.current)return;
            pending.current=true;const n=++sequence.current;
            try{const value=await rpc({action:'list',workspaceId:wid},signal);if(alive.current&&n===sequence.current){setData(value);setError('');}}
            catch(e){if(alive.current&&!signal?.aborted&&n===sequence.current)setError(String(e.message||e));}
            finally{pending.current=false;}
          },[wid]);
          const membership=workspace.sessionIds.join('\0');
          React.useEffect(()=>{alive.current=true;const ac=new AbortController();refresh(ac.signal);const timer=setInterval(()=>refresh(ac.signal),15000);const onFocus=()=>refresh(ac.signal);window.addEventListener('focus',onFocus);return()=>{alive.current=false;sequence.current++;ac.abort();clearInterval(timer);window.removeEventListener('focus',onFocus);};},[refresh,membership]);
          async function change(payload){
            if(mutating.current)return false;
            mutating.current=true;sequence.current++;setBusy(true);setError('');
            try{const value=await rpc({workspaceId:wid,...payload});if(alive.current){setData(value);setEditor(null);setMenu(null);}return true;}
            catch(e){if(alive.current)setError(String(e.message||e));return false;}
            finally{mutating.current=false;if(alive.current)setBusy(false);}
          }
          function fold(){setFolded(v=>{const next=!v;try{const all=JSON.parse(localStorage.getItem(foldKey)||'{}');all[wid]=next;localStorage.setItem(foldKey,JSON.stringify(all));}catch{}return next;});}
          const categories=data?.categories||[], assignments=data?.assignments||{};
          const created=data?.createdAtBySession||{};
          const chronological=[...workspace.sessionIds].sort((a,b)=>(created[b]||0)-(created[a]||0)||a.localeCompare(b));
          const ids=[...new Set([...chronological.filter(id=>!data?.sessionOrder?.includes(id)),...(data?.sessionOrder||[])])].filter(id=>workspace.sessionIds.includes(id)&&(showArchived||!archived.has(id)));
          const filtered=ids.filter(id=>(summary[id]?.displayTitle||id).toLocaleLowerCase().includes(query));
          const save=name=>change(editor.kind==='delete'?{action:'delete',categoryId:editor.id}:{action:editor.kind==='create'?'create':'rename',...(editor.id?{categoryId:editor.id}:{}),name});
          const [dropTarget,setDropTarget]=React.useState(null);
          React.useEffect(()=>{const clear=()=>setDropTarget(null);window.addEventListener('dragend',clear);window.addEventListener('drop',clear);return()=>{window.removeEventListener('dragend',clear);window.removeEventListener('drop',clear);};},[]);
          function dragOver(event,key){if(!busy&&draggedSession?.workspaceId===wid){event.preventDefault();event.stopPropagation();event.dataTransfer.dropEffect='move';const group=event.currentTarget,rect=group.getBoundingClientRect(),rows=[...group.querySelectorAll('.sc-row[data-session-id]')].filter(row=>row.dataset.sessionId!==draggedSession.sessionId);const before=rows.find(row=>event.clientY<row.getBoundingClientRect().top+row.getBoundingClientRect().height/2);const last=rows.at(-1);const y=before?before.getBoundingClientRect().top-rect.top:last?last.getBoundingClientRect().bottom-rect.top:32;setDropTarget({key,beforeSessionId:before?.dataset.sessionId||null,y});}}
          function drop(event,key){event.preventDefault();event.stopPropagation();const target=dropTarget;setDropTarget(null);const source=draggedSession;endDrag();if(busy||source?.workspaceId!==wid||!workspace.sessionIds.includes(source.sessionId)||target?.key!==key)return;void change({action:'move',sessionId:source.sessionId,categoryId:key||null,beforeSessionId:target.beforeSessionId});}
          function row(id){
            const item=summary[id],title=item?.displayTitle||id,current=(item?.retainedBy?.mainView||0)>0,status=statuses.get(id),pending=status?.pendingInteraction,running=status?.running??item?.running===true,completed=!pending&&!running&&!current&&status?.completionUnread===true;
            return h(React.Fragment,{key:id},h('div',{className:'sc-row','data-session-id':id,draggable:!busy,onDragStart:e=>beginDrag(e,wid,id),onDragEnd:endDrag,'data-active':current,'data-running':running},h(StatusIndicator,{running,completed,current,pending,t}),h('button',{className:'sc-session',title,onClick:()=>ctx.uiWorkspace.openSession(id)},title),pending&&h('span',{className:'sc-pending-label'},pendingLabel(pending,t)),completed&&h('span',{className:'sc-completed-label'},t('completed')),h('button',{title:t('actions'),'aria-label':t('actions')+': '+title,'aria-expanded':menu===id,onClick:()=>setMenu(menu===id?null:id)},h(Icon,{name:'more',size:16}))),
              menu===id&&h('div',{className:'sc-menu'},h('label',null,t('move'),h('select',{'aria-label':t('move'),disabled:busy||!data,value:assignments[id]||'',onChange:e=>change({action:'move',sessionId:id,categoryId:e.target.value||null})},h('option',{value:''},t('unclassified')),categories.map(c=>h('option',{key:c.id,value:c.id},c.name)))),h('div',{className:'sc-form-actions'},h('button',{onClick:()=>setMenu(null)},t('cancel')))));
          }
          function group(category){
            const key=category?.id||'', members=filtered.filter(id=>(assignments[id]||'')===key), collapsed=(category?category.collapsed:unclassifiedFolded)&&!query,limit=limits[key]||20;
            return h('section',{className:'sc-group',key:key||'unclassified','data-drop-target':dropTarget===key,onDragOver:e=>dragOver(e,key),onDragLeave:e=>{if(!e.currentTarget.contains(e.relatedTarget))setDropTarget(null);},onDrop:e=>drop(e,key)},h('div',{className:'sc-heading sc-category-heading'},h('button',{className:'sc-label','aria-expanded':!collapsed,disabled:!!category&&busy,onClick:()=>category?change({action:'collapse',categoryId:key,collapsed:!category.collapsed}):toggleUnclassified()},h('span',{className:'sc-disclosure','aria-hidden':true},h(Icon,{name:collapsed?'chevron':'down',size:16})),h('span',{className:'sc-heading-text'},category?.name||t('unclassified'))),h('span',{className:'sc-count'},members.length),category&&h('button',{title:t('rename'),'aria-label':t('rename')+': '+category.name,onClick:()=>setEditor({kind:'rename',id:key,name:category.name})},h(Icon,{name:'edit',size:14})),category&&h('button',{title:t('remove'),'aria-label':t('remove')+': '+category.name,onClick:()=>setEditor({kind:'delete',id:key})},h(Icon,{name:'close',size:14}))),
              dropTarget?.key===key&&h('div',{className:'sc-insert-line','aria-hidden':true,style:{'--sc-drop-y':dropTarget.y+'px'}}),!collapsed&&(members.length?members.slice(0,limit).map(row):h('p',{className:'sc-muted'},t('empty'))),!collapsed&&members.length>limit&&h('button',{onClick:()=>setLimits(v=>({...v,[key]:limit+50}))},t('more'),' (',members.length-limit,')'));
          }
          return h('section',{className:'sc-workspace','data-workspace-id':wid},h('div',{className:'sc-heading',draggable:true,onDragStart:e=>{if(e.target.closest('button')?.classList.contains('sc-label')===false){e.preventDefault();return;}onWorkspaceDragStart(e,wid);},onDragEnd:onWorkspaceDragEnd},h('button',{className:'sc-label',title:workspace.path,'aria-expanded':!folded,onClick:fold},h(Icon,{name:folded?'chevron':'down',size:14}),workspace.title),h('span',{className:'sc-count'},ids.length),h('button',{title:t('add'),'aria-label':t('add')+': '+workspace.title,disabled:!data,onClick:()=>{setFolded(false);setEditor({kind:'create'});}},h(Icon,{name:'plus',size:16})),h('button',{title:t('newSession'),'aria-label':t('newSession')+': '+workspace.title,onClick:()=>ctx.uiWorkspace.startSession(wid)},h(Icon,{name:'newSession',size:16}))),
            error&&h('div',{className:'sc-error',role:'alert'},error,' ',h('button',{onClick:()=>refresh()},t('retry'))),
            (!folded||query)&&h(React.Fragment,null,editor&&h(Editor,{key:editor.kind+editor.id,editor,busy,t,onSave:save,onCancel:()=>setEditor(null)}),!data?h('p',{className:'sc-muted'},t('loading')):categories.map(group),data&&group(null)));
        }
        function Browser({wide,expandSidebar,useWorkspaces,useSessions,useSessionStatus,renderSlot,t}) {
          const snapshot=useWorkspaces(s=>s), list=useSessions(s=>s),statuses=useSessionStatus(s=>s);
          const [query,setQuery]=React.useState(''),[showArchived,setArchived]=React.useState(false);
          const [addingWorkspace,setAddingWorkspace]=React.useState(false),[workspaceError,setWorkspaceError]=React.useState('');
          const addingRef=React.useRef(false);
          const [directoryOpen,setDirectoryOpen]=React.useState(false);
          const [directoryPath,setDirectoryPath]=React.useState('');
          function addWorkspace(){setWorkspaceError('');setDirectoryOpen(true);}
          async function adoptWorkspace(path){
            if(addingRef.current)return;
            addingRef.current=true;setAddingWorkspace(true);setWorkspaceError('');
            try{if(path){await ctx.workspaces.create({path});setDirectoryOpen(false);}}
            catch(error){setWorkspaceError(String(error.message||error));}
            finally{addingRef.current=false;setAddingWorkspace(false);}
          }
          const workspaceOrderKey='dsh.session-categories.workspace-order.v1';
          const [workspaceOrder,setWorkspaceOrder]=React.useState(()=>{try{const saved=JSON.parse(localStorage.getItem(workspaceOrderKey)||'[]');return Array.isArray(saved)?saved.filter(id=>typeof id==='string'):[];}catch{return[];}});
          const [workspaceDrop,setWorkspaceDrop]=React.useState(null);
          const workspaceDrag=React.useRef(null);
          const orderedWorkspaces=[...new Set([...workspaceOrder,...snapshot.items.map(w=>w.workspaceId)])].map(id=>snapshot.items.find(w=>w.workspaceId===id)).filter(Boolean);
          function workspaceDragEnd(){workspaceDrag.current=null;setWorkspaceDrop(null);}
          function workspaceDragStart(event,id){endDrag();workspaceDrag.current=id;event.stopPropagation();event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('application/x-dsh-workspace-order',id);}
          function workspaceDragOver(event){if(!workspaceDrag.current)return;event.preventDefault();event.stopPropagation();event.dataTransfer.dropEffect='move';const root=event.currentTarget,rect=root.getBoundingClientRect(),rows=[...root.querySelectorAll('.sc-workspace[data-workspace-id]')].filter(row=>row.dataset.workspaceId!==workspaceDrag.current);const before=rows.find(row=>{const heading=row.firstElementChild.getBoundingClientRect();return event.clientY<heading.top+heading.height/2;});const last=rows.at(-1);setWorkspaceDrop({before:before?.dataset.workspaceId||null,y:(before?before.getBoundingClientRect().top:last?last.getBoundingClientRect().bottom:rect.top)-rect.top+root.scrollTop});}
          function workspaceDropAt(event){if(!workspaceDrag.current)return;event.preventDefault();event.stopPropagation();const source=workspaceDrag.current,target=workspaceDrop;workspaceDragEnd();if(!target)return;const ids=orderedWorkspaces.map(w=>w.workspaceId).filter(id=>id!==source);const index=target.before===null?ids.length:ids.indexOf(target.before);if(index<0)return;ids.splice(index,0,source);setWorkspaceOrder(ids);try{localStorage.setItem(workspaceOrderKey,JSON.stringify(ids));}catch{}}
          React.useEffect(()=>{window.addEventListener('dragend',workspaceDragEnd);return()=>window.removeEventListener('dragend',workspaceDragEnd);},[]);
          if(!wide)return h('div',{className:'sc-rail'},h('button',{onClick:expandSidebar,title:t('title'),'aria-label':t('title')},h(Icon,{name:'categories',size:18})));
          const archived=new Set(snapshot.archivedSessionIds),q=query.trim().toLocaleLowerCase();
          const isRunning=id=>statuses.get(id)?.running??list.byId[id]?.running===true;
          const running=list.ids.filter(id=>isRunning(id)||statuses.get(id)?.pendingInteraction);
          const completed=list.ids.filter(id=>!isRunning(id)&&!(list.byId[id]?.retainedBy?.mainView>0)&&statuses.get(id)?.completionUnread===true);
          function statusRow(id,active){const item=list.byId[id],title=item.displayTitle||id,current=(item.retainedBy?.mainView||0)>0,pending=statuses.get(id)?.pendingInteraction;return h('div',{key:id,className:'sc-row','data-active':current,'data-running':active},h(StatusIndicator,{running:active,completed:!active,current,pending,t}),h('button',{className:'sc-session',title,onClick:()=>ctx.uiWorkspace.openSession(id)},title),pending&&h('span',{className:'sc-pending-label'},pendingLabel(pending,t)),!active&&!pending&&h('span',{className:'sc-completed-label'},t('completed')));}
          const runningSection=h('section',{className:'sc-running','aria-label':t('running')},h('div',{className:'sc-running-title'},t('running'),' (',running.length,')'),running.length?running.map(id=>statusRow(id,true)):h('p',{className:'sc-muted'},t('noRunning')));
          const completedSection=completed.length>0&&h('section',{className:'sc-running','aria-label':t('unread')},h('div',{className:'sc-running-title',role:'status','aria-live':'polite'},t('completed'),' (',completed.length,')'),completed.map(id=>statusRow(id,false)));
          return h('div',{className:'sc-browser','data-session-categories':true},h('style',null,css),h('div',{className:'sc-top'},h('strong',null,t('title')),h('button',{onClick:addWorkspace,disabled:addingWorkspace,title:t('addWorkspace'),'aria-label':t('addWorkspace'),style:{display:'inline-flex',alignItems:'center',gap:'4px'}},h(Icon,{name:'plus',size:14}),t('addWorkspace')),h('button',{onClick:()=>setMode(false)},t('stock'))),directoryOpen&&h('form',{className:'sc-editor',onSubmit:e=>{e.preventDefault();if(directoryPath.trim())void adoptWorkspace(directoryPath.trim());}},h('label',null,t('addWorkspace'),h('input',{value:directoryPath,placeholder:'C:\\Projects\\example','aria-label':t('addWorkspace'),required:true,disabled:addingWorkspace,onChange:e=>setDirectoryPath(e.target.value)})),h('div',{className:'sc-form-actions'},h('button',{type:'button',disabled:addingWorkspace,onClick:()=>setDirectoryOpen(false)},t('cancel')),h('button',{type:'submit',disabled:addingWorkspace||!directoryPath.trim()},t('save')))),workspaceError&&h('div',{className:'sc-error',role:'alert'},workspaceError),h('input',{type:'search',value:query,placeholder:t('search'),'aria-label':t('search'),onChange:e=>setQuery(e.target.value)}),h('label',{className:'sc-filter'},h('input',{type:'checkbox',checked:showArchived,onChange:e=>setArchived(e.target.checked)}),t('showArchived')),h('div',{className:'sc-scroll',onDragOver:workspaceDragOver,onDrop:workspaceDropAt,onDragLeave:e=>{if(!e.currentTarget.contains(e.relatedTarget))setWorkspaceDrop(null);}},workspaceDrop&&h('div',{className:'sc-insert-line','aria-hidden':true,style:{'--sc-drop-y':workspaceDrop.y+'px'}}),runningSection,completedSection,snapshot.items.length?orderedWorkspaces.map(w=>h(Workspace,{key:w.workspaceId,workspace:w,summary:list.byId,statuses,archived,showArchived,query:q,t,onWorkspaceDragStart:workspaceDragStart,onWorkspaceDragEnd:workspaceDragEnd})):h('p',{className:'sc-muted'},t('noWorkspace'))));
        }
        let browserDispose=null,available=false;
        function synchronize(){
          if(!available)return;
          if(enabled&&!browserDispose)browserDispose=ctx.slots.register({name:'sidebar.workspaces',priority:-10,locale:ns},Browser);
          if(!enabled&&browserDispose){browserDispose();browserDispose=null;}
        }
        function setMode(value){enabled=value;synchronize();listeners.forEach(fn=>fn());}
        function Toggle({t}){const value=React.useSyncExternalStore(mode.subscribe,mode.getSnapshot,mode.getSnapshot);return h(React.Fragment,null,h('style',null,css),h('button',{className:'sc-toggle',title:t('switch'),'aria-label':t('switch'),'aria-pressed':value,onClick:()=>setMode(!value)},h(Icon,{name:'categories',size:18})));}
        ctx.slots.inject('sidebar.workspaces',()=>{available=true;synchronize();return()=>{available=false;if(browserDispose){browserDispose();browserDispose=null;}};});
        ctx.slots.inject('sidebar.footer.action',()=>ctx.slots.register({name:'sidebar.footer.action',id:'local-session-categories-toggle',order:80,label:()=>ctx.locale.bind(ns)('title'),locale:ns},Toggle));
      }
    };
  }
});
