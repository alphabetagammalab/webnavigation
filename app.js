const STORAGE="minimal_itab_v2";
const state=JSON.parse(localStorage.getItem(STORAGE)||'{"items":[],"engine":"google"}');
const engines={
  google:{
    label:"Google",
    icon:"https://www.google.com/favicon.ico",
    url:q=>"https://www.google.com/search?q="+encodeURIComponent(q)
  },
  bing:{
    label:"Bing",
    icon:"https://www.bing.com/favicon.ico",
    url:q=>"https://www.bing.com/search?q="+encodeURIComponent(q)
  },
  baidu:{
    label:"百度",
    icon:"https://www.baidu.com/favicon.ico",
    url:q=>"https://www.baidu.com/s?wd="+encodeURIComponent(q)
  },
  duck:{
    label:"DuckDuckGo",
    icon:"https://duckduckgo.com/favicon.ico",
    url:q=>"https://duckduckgo.com/?q="+encodeURIComponent(q)
  }
};
/*
const engines={
  google:{label:"G",url:q=>"https://www.google.com/search?q="+encodeURIComponent(q)},
  bing:{label:"B",url:q=>"https://www.bing.com/search?q="+encodeURIComponent(q)},
  baidu:{label:"百",url:q=>"https://www.baidu.com/s?wd="+encodeURIComponent(q)},
  duck:{label:"D",url:q=>"https://duckduckgo.com/?q="+encodeURIComponent(q)}
};
*/

const $=s=>document.querySelector(s), itemsEl=$("#items"), menu=$("#menu");
const editor=$("#editor"), folderDialog=$("#folderDialog"), contextMenu=$("#contextMenu");
let contextId=null, currentFolderId=null;

function save(){localStorage.setItem(STORAGE,JSON.stringify(state))}
/*function tick(){
  const now=new Date();
  $("#clock").textContent=now.toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
  $("#date").textContent=now.toLocaleDateString("zh-CN",{year:"numeric",month:"long",day:"numeric",weekday:"long"});
}*/
function tick(){
  const now=new Date();
  $("#clock").textContent=now.toLocaleTimeString("zh-CN",{
    hour:"2-digit",
    minute:"2-digit",
    second:"2-digit"
  });
  const solar = Solar.fromYmd(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  );
  const lunar = solar.getLunar();
  const lunarText = lunar.getMonthInChinese() + "月" + lunar.getDayInChinese();
  /*
  $("#date").textContent =
    now.toLocaleDateString("zh-CN",{
      year:"numeric",
      month:"long",
      day:"numeric",
      weekday:"long"
    }) + " " + lunarText;
  */
  $("#date").textContent =
    now.toLocaleDateString("zh-CN",{
      year:"numeric",
      month:"long",
      day:"numeric"
    }) + " " +
    now.toLocaleDateString("zh-CN",{
      weekday:"long"
    }) + " " + "农历" + lunarText;
}
setInterval(tick,1000);tick();

function favicon(url){
  try{return "https://www.google.com/s2/favicons?sz=128&domain="+encodeURIComponent(new URL(url).hostname)}
  catch{return ""}
}
function normalizeUrl(url){
  url=url.trim();
  if(!/^https?:\/\//i.test(url)) url="https://"+url;
  return url;
}
function render(){
  itemsEl.innerHTML="";
  if(!state.items.length){
    itemsEl.innerHTML='<div class="empty">点击右下角 ＋ 添加网站或文件夹</div>'; return;
  }
  state.items.forEach(it=>{
    const el=document.createElement("div");
    el.className="item";el.draggable=true;el.dataset.id=it.id;
    el.innerHTML=it.type==="folder"
      ? `<div class="folder-icon">📁</div><div class="item-name"></div>`
      : `<img class="icon" src="${it.icon||favicon(it.url)}" onerror="this.style.visibility='hidden'"><div class="item-name"></div>`;
    el.querySelector(".item-name").textContent=it.name;
    el.onclick=()=>openItem(it);
    el.oncontextmenu=e=>{e.preventDefault();showContext(e.clientX,e.clientY,it.id)};
    el.ondragstart=()=>el.classList.add("dragging");
    el.ondragend=()=>el.classList.remove("dragging");
    el.ondragover=e=>e.preventDefault();
    el.ondrop=e=>{
      e.preventDefault();
      const id=el.dataset.id, dragged=document.querySelector(".dragging");
      if(!dragged||dragged.dataset.id===id)return;
      const old=state.items.findIndex(x=>x.id===dragged.dataset.id);
      const target=state.items.findIndex(x=>x.id===id);
      if(old<0||target<0)return;
      const [x]=state.items.splice(old,1);state.items.splice(target,0,x);
      save();render();
    };
    itemsEl.appendChild(el);
  });
}
function openItem(it){
  if(it.type==="folder") openFolder(it);
  else location.href=it.url;
}
function openFolder(folder){
  currentFolderId=folder.id;
  $("#folderTitle").textContent=folder.name;
  renderFolderItems(folder);
  folderDialog.showModal();
}
function renderFolderItems(folder){
  const box=$("#folderItems");box.innerHTML="";
  if(!folder.children?.length){
    box.innerHTML='<div class="empty">文件夹为空，点击“＋ 网站”添加</div>';return;
  }
  folder.children.forEach(ch=>{
    const el=document.createElement("div");el.className="item";el.title="右键编辑";
    el.innerHTML=`<img class="icon" src="${ch.icon||favicon(ch.url)}" onerror="this.style.visibility='hidden'"><div class="item-name"></div>`;
    el.querySelector(".item-name").textContent=ch.name;
    el.onclick=()=>location.href=ch.url;
    el.oncontextmenu=e=>{
      e.preventDefault();
      showFolderContext(e.clientX,e.clientY,folder.id,ch.id);
    };
    box.appendChild(el);
  });
}
function showContext(x,y,id){
  contextId=id;
  contextMenu.style.left=Math.min(x,innerWidth-140)+"px";
  contextMenu.style.top=Math.min(y,innerHeight-90)+"px";
  contextMenu.classList.remove("hidden");
}
function showFolderContext(x,y,folderId,childId){
  contextId=folderId+"|"+childId;
  contextMenu.style.left=Math.min(x,innerWidth-140)+"px";
  contextMenu.style.top=Math.min(y,innerHeight-90)+"px";
  contextMenu.classList.remove("hidden");
}
function hideMenus(){menu.classList.add("hidden");contextMenu.classList.add("hidden")}

function editItem(id){
  const it=state.items.find(x=>x.id===id);if(!it)return;
  $("#dialogTitle").textContent="编辑";
  $("#itemId").value=it.id;$("#itemType").value=it.type;
  $("#nameInput").value=it.name;$("#urlInput").value=it.url||"";$("#iconInput").value=it.icon||"";
  $("#urlLabel").style.display=it.type==="site"?"block":"none";
  $("#iconLabel").style.display=it.type==="site"?"block":"none";
  editor.showModal();
}
function newItem(type){
  $("#dialogTitle").textContent=type==="site"?"添加网站":"添加文件夹";
  $("#itemId").value="";$("#itemType").value=type;
  $("#nameInput").value="";$("#urlInput").value="";$("#iconInput").value="";
  $("#urlLabel").style.display=type==="site"?"block":"none";
  $("#iconLabel").style.display=type==="site"?"block":"none";
  editor.showModal();
}
function deleteItem(id){
  const i=state.items.findIndex(x=>x.id===id);if(i<0)return;
  if(confirm("确定删除“"+state.items[i].name+"”？")){
    state.items.splice(i,1);save();render();
  }
}
function addSiteToFolder(){
  const folder=state.items.find(x=>x.id===currentFolderId);if(!folder)return;
  const name=prompt("网站名称");
  if(!name)return;
  let url=prompt("网站地址");
  if(!url)return;
  folder.children=folder.children||[];
  folder.children.push({id:crypto.randomUUID(),name:name.trim(),url:normalizeUrl(url),icon:""});
  save();renderFolderItems(folder);
}

$("#addButton").onclick=()=>{contextMenu.classList.add("hidden");menu.classList.toggle("hidden")};
menu.onclick=e=>{
  const a=e.target.dataset.action;if(!a)return;
  menu.classList.add("hidden");newItem(a);
};
contextMenu.onclick=e=>{
  const a=e.target.dataset.action;if(!a)return;
  const raw=contextId;contextMenu.classList.add("hidden");
  if(raw.includes("|")){
    const [folderId,childId]=raw.split("|"),folder=state.items.find(x=>x.id===folderId);
    if(!folder)return;
    const child=folder.children?.find(x=>x.id===childId);if(!child)return;
    if(a==="delete"){
      if(confirm("确定删除“"+child.name+"”？")){
        folder.children=folder.children.filter(x=>x.id!==childId);save();renderFolderItems(folder);
      }
    }else{
      const name=prompt("网站名称",child.name),url=prompt("网站地址",child.url);
      if(name&&url){child.name=name.trim();child.url=normalizeUrl(url);save();renderFolderItems(folder)}
    }
    return;
  }
  if(a==="edit")editItem(raw);else if(a==="delete")deleteItem(raw);
};
$("#cancelButton").onclick=()=>editor.close();
$("#closeFolder").onclick=()=>folderDialog.close();
$("#folderAdd").onclick=addSiteToFolder;

$("#editorForm").onsubmit=e=>{
  e.preventDefault();
  const id=$("#itemId").value,type=$("#itemType").value;
  let name=$("#nameInput").value.trim(),url=$("#urlInput").value.trim(),icon=$("#iconInput").value.trim();
  if(!name)return;
  if(type==="site"){if(!url)return;url=normalizeUrl(url)}
  if(id){
    const it=state.items.find(x=>x.id===id);Object.assign(it,{name,url,icon});
  }else{
    state.items.push({id:crypto.randomUUID(),type,name,url,icon,children:[]});
  }
  save();render();editor.close();
};

function updateEngineButton(){
  const engine=engines[state.engine];
  $("#engineButton").innerHTML=
    `<img src="${engine.icon}" alt="${engine.label}">`;
}

$("#engineButton").onclick=()=>{
  const keys=Object.keys(engines);
  const i=keys.indexOf(state.engine);
  const next=keys[(i+1)%keys.length];

  state.engine=next;
  save();
  updateEngineButton();
};
updateEngineButton();
/*
$("#engineButton").onclick=()=>{
  const keys=Object.keys(engines),i=keys.indexOf(state.engine),next=keys[(i+1)%keys.length];
  state.engine=next;save();$("#engineButton").textContent=engines[next].label;
};
$("#engineButton").textContent=engines[state.engine].label;
*/

$("#searchForm").onsubmit=e=>{
  e.preventDefault();const q=$("#searchInput").value.trim();if(!q)return;
  if(/^https?:\/\//i.test(q))location.href=q;
  else if(/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(q))location.href=normalizeUrl(q);
  else location.href=engines[state.engine].url(q);
};

document.addEventListener("click",e=>{
  if(!e.target.closest("#contextMenu"))contextMenu.classList.add("hidden");
  if(!e.target.closest("#addButton")&&!e.target.closest("#menu"))menu.classList.add("hidden");
});
document.addEventListener("keydown",e=>{
  if(e.key==="/"&&document.activeElement.tagName!=="INPUT"){e.preventDefault();$("#searchInput").focus()}
  if(e.key==="Escape"){hideMenus();if(editor.open)editor.close();if(folderDialog.open)folderDialog.close()}
});
render();
