const STORAGE='minimal_nav_local_v2';
const ENGINES={
  google:{name:'Google',short:'G',url:'https://www.google.com/search?q='},
  bing:{name:'Bing',short:'B',url:'https://www.bing.com/search?q='},
  duck:{name:'DuckDuckGo',short:'D',url:'https://duckduckgo.com/?q='},
  baidu:{name:'Baidu',short:'百',url:'https://www.baidu.com/s?wd='}
};
const uid=()=>crypto.randomUUID();
const site=(name,url,icon='')=>({id:uid(),name,url,icon});
const defaultSites=[
  site('Google','https://www.google.com'),
  site('YouTube','https://www.youtube.com'),
  site('GitHub','https://github.com'),
  site('ChatGPT','https://chatgpt.com'),
  site('Google Scholar','https://scholar.google.com'),
  site('Nature','https://www.nature.com'),
  site('PNAS','https://www.pnas.org'),
  site('Cloudflare','https://www.cloudflare.com'),
  site('Wikipedia','https://www.wikipedia.org')
];
const defaultState=()=>({version:2,engine:'google',theme:'auto',showDate:true,sites:defaultSites});
let state=loadState();
let editingId=null,contextId=null,calendarDate=new Date();

function loadState(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');
    if(raw)return sanitize(raw);
  }catch{}
  // Migrate the previous grouped version automatically.
  try{
    const old=JSON.parse(localStorage.getItem('minimal_nav_local_v1')||localStorage.getItem('minimal_nav_local')||'null');
    if(old)return sanitize(old);
  }catch{}
  return defaultState();
}
function sanitize(x){
  let sites=[];
  if(Array.isArray(x.sites)) sites=x.sites;
  else if(Array.isArray(x.groups)) sites=x.groups.flatMap(g=>Array.isArray(g.items)?g.items:[]);
  else sites=[];
  sites=sites.map(i=>({id:i.id||uid(),name:i.name||i.title||'未命名',url:i.url||'',icon:i.icon||i.iconUrl||''})).filter(i=>i.url);
  return {
    version:2,
    engine:ENGINES[x.engine]?x.engine:'google',
    theme:['auto','dark','light'].includes(x.theme)?x.theme:'auto',
    showDate:x.showDate!==false,
    sites
  };
}
function save(){localStorage.setItem(STORAGE,JSON.stringify(state));}
function favicon(url){try{return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(url)}`}catch{return ''}}
function applyTheme(){
  let dark=state.theme==='dark';
  if(state.theme==='auto')dark=matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark',dark);
  document.querySelector('#date').style.display=state.showDate?'':'none';
}
function render(){
  applyTheme();
  renderEngines();
  const root=document.querySelector('#sites');
  root.innerHTML='';
  state.sites.forEach(i=>{
    const card=document.createElement('article');
    card.className='site-card';
    card.dataset.id=i.id;
    card.draggable=false;
    card.innerHTML='<img class="favicon" alt=""><div class="site-name"></div>';
    const img=card.querySelector('.favicon');
    img.src=i.icon||favicon(i.url);
    img.onerror=()=>{if(i.icon){img.src=favicon(i.url)}else img.style.visibility='hidden'};
    card.querySelector('.site-name').textContent=i.name;
    card.addEventListener('click',()=>location.href=i.url);
    card.addEventListener('contextmenu',e=>{e.preventDefault();showContext(e.clientX,e.clientY,i.id)});
    root.appendChild(card);
  });
  initSortable(root);
}
function initSortable(root){
  if(root._sortable)root._sortable.destroy();
  root._sortable=new Sortable(root,{
    animation:150,
    forceFallback:true,
    fallbackOnBody:true,
    swapThreshold:.65,
    ghostClass:'sortable-ghost',
    chosenClass:'sortable-chosen',
    onEnd:e=>{
      const ids=[...root.children].map(x=>x.dataset.id);
      const byId=new Map(state.sites.map(x=>[x.id,x]));
      state.sites=ids.map(id=>byId.get(id)).filter(Boolean);
      save();
    }
  });
}
function openEditor(id=null){
  editingId=id;
  const d=document.querySelector('#editorDialog');
  const item=state.sites.find(x=>x.id===id);
  document.querySelector('#editorTitle').textContent=id?'编辑网站':'添加网站';
  document.querySelector('#nameInput').value=item?.name||'';
  document.querySelector('#urlInput').value=item?.url||'';
  document.querySelector('#iconInput').value=item?.icon||'';
  document.querySelector('#deleteBtn').classList.toggle('hidden',!id);
  d.showModal();
}
document.querySelector('#editorForm').addEventListener('submit',e=>{
  e.preventDefault();
  const name=document.querySelector('#nameInput').value.trim();
  const url=document.querySelector('#urlInput').value.trim();
  const icon=document.querySelector('#iconInput').value.trim();
  if(!name)return;
  if(!/^https?:\/\//i.test(url)){toast('网址请以 http:// 或 https:// 开头');return}
  if(editingId){
    const item=state.sites.find(x=>x.id===editingId);
    if(item){item.name=name;item.url=url;item.icon=icon}
  }else state.sites.push(site(name,url,icon));
  save();document.querySelector('#editorDialog').close();render();
});
document.querySelector('#deleteBtn').onclick=()=>{
  if(!editingId)return;
  state.sites=state.sites.filter(x=>x.id!==editingId);
  save();document.querySelector('#editorDialog').close();render();
};
function showContext(x,y,id){
  contextId=id;
  const m=document.querySelector('#contextMenu');
  m.classList.remove('hidden');
  m.style.left=Math.min(x,innerWidth-160)+'px';
  m.style.top=Math.min(y,innerHeight-100)+'px';
}
function hideContext(){document.querySelector('#contextMenu').classList.add('hidden')}
document.querySelector('#contextMenu').onclick=e=>{
  const a=e.target.dataset.action;if(!a)return;hideContext();
  if(a==='edit')openEditor(contextId);
  if(a==='delete'){state.sites=state.sites.filter(x=>x.id!==contextId);save();render();}
};
document.addEventListener('click',e=>{if(!e.target.closest('#contextMenu'))hideContext()});
function search(q){
  q=q.trim();if(!q)return;
  if(/^https?:\/\//i.test(q)){location.href=q;return}
  if(/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(q)){location.href='https://'+q;return}
  location.href=ENGINES[state.engine].url+encodeURIComponent(q);
}
const searchInput=document.querySelector('#search');
searchInput.addEventListener('keydown',e=>{if(e.key==='Enter')search(searchInput.value)});
function renderEngines(){
  const select=document.querySelector('#engineSelect');
  select.innerHTML='';
  Object.entries(ENGINES).forEach(([k,v])=>{
    const option=document.createElement('option');
    option.value=k;
    option.textContent=v.name;
    select.appendChild(option);
  });
  select.value=state.engine;
}

document.querySelector('#engineSelect').addEventListener('change',e=>{
  state.engine=e.target.value;
  save();
});
function tick(){
  const d=new Date();
  document.querySelector('#clock').textContent=d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});
  document.querySelector('#date').textContent=d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
}
function toast(t){const x=document.querySelector('#toast');x.textContent=t;x.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>x.classList.remove('show'),1800)}
document.querySelector('#addBtn').onclick=()=>openEditor();
document.querySelector('#settingsBtn').onclick=()=>{
  document.querySelector('#settingsEngine').innerHTML=Object.entries(ENGINES).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('');
  document.querySelector('#settingsEngine').value=state.engine;
  document.querySelector('#themeSelect').value=state.theme;
  document.querySelector('#showDate').checked=state.showDate;
  document.querySelector('#settingsDialog').showModal();
};
document.querySelector('#settingsForm').addEventListener('submit',e=>{
  e.preventDefault();state.engine=document.querySelector('#settingsEngine').value;state.theme=document.querySelector('#themeSelect').value;state.showDate=document.querySelector('#showDate').checked;save();document.querySelector('#settingsDialog').close();render();
});
document.querySelector('#exportBtn').onclick=()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='my-navigation-backup.json';a.click();URL.revokeObjectURL(a.href);toast('已导出');
};
document.querySelector('#importBtn').onclick=()=>document.querySelector('#importFile').click();
document.querySelector('#importFile').onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{state=sanitize(JSON.parse(await f.text()));save();render();toast('导入成功')}catch{toast('JSON 文件无效')}e.target.value='';
};
function renderCalendar(){
  const y=calendarDate.getFullYear(),m=calendarDate.getMonth();
  document.querySelector('#calendarTitle').textContent=new Date(y,m,1).toLocaleDateString('zh-CN',{year:'numeric',month:'long'});
  const box=document.querySelector('#calendar');box.innerHTML='';
  ['一','二','三','四','五','六','日'].forEach(x=>{const d=document.createElement('div');d.className='weekday';d.textContent=x;box.appendChild(d)});
  const first=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate(),prev=new Date(y,m,0).getDate();
  for(let i=0;i<first;i++){const d=document.createElement('div');d.className='day other';d.textContent=prev-first+i+1;box.appendChild(d)}
  for(let day=1;day<=days;day++){const d=document.createElement('div');d.className='day';d.textContent=day;const now=new Date();if(day===now.getDate()&&m===now.getMonth()&&y===now.getFullYear())d.classList.add('today');box.appendChild(d)}
}
document.querySelector('#calendarBtn').onclick=()=>{calendarDate=new Date();renderCalendar();document.querySelector('#calendarDialog').showModal()};
document.querySelector('#prevMonth').onclick=()=>{calendarDate.setMonth(calendarDate.getMonth()-1);renderCalendar()};
document.querySelector('#nextMonth').onclick=()=>{calendarDate.setMonth(calendarDate.getMonth()+1);renderCalendar()};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.querySelector('#'+b.dataset.close).close());
window.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();searchInput.focus()}if(e.key==='Escape')hideContext()});
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',applyTheme);
tick();setInterval(tick,1000);render();
