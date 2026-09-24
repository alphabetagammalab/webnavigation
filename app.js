const STORAGE="minimal_itab_v2";
const state=JSON.parse(localStorage.getItem(STORAGE)||'{"items":[],"engine":"google"}');
const engines={
  google:{
    label:"Google",
    icon:"icons/google.svg",
    placeholder:"Search with Google or enter address",
    url:q=>"https://www.google.com/search?q="+encodeURIComponent(q)
  },
  bing:{
    label:"Bing",
    icon:"icons/bing.svg",
    placeholder:"Search with Bing or enter address",
    url:q=>"https://www.bing.com/search?q="+encodeURIComponent(q)
  },
  baidu:{
    label:"百度",
    icon:"icons/baidu.svg",
    placeholder:"使用百度搜索或输入网址",
    url:q=>"https://www.baidu.com/s?wd="+encodeURIComponent(q)
  },
  duck:{
    label:"DuckDuckGo",
    icon:"icons/duckduckgo.svg",
    placeholder:"Search with DuckDuckGo or enter address",
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

// 搜索历史
const SEARCH_HISTORY="minimal_itab_search_history";
const MAX_SEARCH_HISTORY=10;
let searchHistory=JSON.parse(
  localStorage.getItem(SEARCH_HISTORY)||"[]"
);

const searchHistoryEl=$("#searchHistory");

let searchHistoryActiveIndex=-1;

let contextId=null, currentFolderId=null;

function save(){localStorage.setItem(STORAGE,JSON.stringify(state))}

function saveSearchHistory(){
  localStorage.setItem(
    SEARCH_HISTORY,
    JSON.stringify(searchHistory)
  );
}

function addSearchHistory(query){
  query=query.trim();
  if(!query) return;

  searchHistory=searchHistory.filter(
    item=>item.toLowerCase()!==query.toLowerCase()
  );

  searchHistory.unshift(query);
  searchHistory=searchHistory.slice(0,MAX_SEARCH_HISTORY);

  saveSearchHistory();
}

function escapeHtml(str){
  return str.replace(/[&<>"']/g,char=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[char]));
}

function highlightSearchText(text,keyword){
  const safeText=escapeHtml(text);
  const safeKeyword=escapeHtml(keyword);

  if(!safeKeyword) return safeText;

  const regex=new RegExp(
    safeKeyword.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),
    "gi"
  );

  return safeText.replace(
    regex,
    match=>`<mark class="search-history-highlight">${match}</mark>`
  );
}

/*
function renderSearchHistory(){
  if(!searchHistory.length){
    searchHistoryEl.classList.add("hidden");
    searchHistoryEl.innerHTML="";
    return;
  }

  searchHistoryEl.innerHTML=`
    ${searchHistory.map((query,index)=>`
      <div class="search-history-item" data-index="${index}">
        <span class="search-history-icon">◷</span>
        <span class="search-history-text">${escapeHtml(query)}</span>
        <button
          type="button"
          class="search-history-delete"
          data-delete="${index}"
          title="删除">
          ×
        </button>
      </div>
    `).join("")}

    <div class="search-history-footer">
      <button
        type="button"
        class="search-history-clear">
        清空搜索历史
      </button>
    </div>
  `;

  searchHistoryEl.classList.remove("hidden");
}
*/


function renderSearchHistory(filter=""){
  searchHistoryActiveIndex=-1;
  
  const keyword=filter.trim().toLowerCase();

  const filteredHistory=searchHistory.filter(query=>
    query.toLowerCase().includes(keyword)
  );

  if(!filteredHistory.length){
    searchHistoryEl.classList.add("hidden");
    searchHistoryEl.innerHTML="";
    return;
  }

  searchHistoryEl.innerHTML=`
    ${filteredHistory.map(query=>{
      const index=searchHistory.indexOf(query);

      return `
        <div class="search-history-item" data-index="${index}">
          <span class="search-history-icon">◷</span>
          <span class="search-history-text">${highlightSearchText(query,filter)}</span>
          <button
            type="button"
            class="search-history-delete"
            data-delete="${index}"
            title="删除">
            ×
          </button>
        </div>
      `;
    }).join("")}

    <div class="search-history-footer">
      <button
        type="button"
        class="search-history-clear">
        清空搜索历史
      </button>
    </div>
  `;

  searchHistoryEl.classList.remove("hidden");
}

/*
$("#searchInput").addEventListener("focus",()=>{
  renderSearchHistory();
});
*/

$("#searchInput").addEventListener("focus",()=>{
  renderSearchHistory($("#searchInput").value);
});

$("#searchInput").addEventListener("input",()=>{
  renderSearchHistory($("#searchInput").value);
});



$("#searchInput").addEventListener("keydown",e=>{

    if(e.key==="Escape"){
    e.preventDefault();

    searchHistoryEl.classList.add("hidden");
    searchHistoryActiveIndex=-1;

    return;
  }
  
  const items=[
    ...searchHistoryEl.querySelectorAll(".search-history-item")
  ];

  if(searchHistoryEl.classList.contains("hidden") || !items.length){
    return;
  }

  if(e.key==="ArrowDown"){
    e.preventDefault();

    searchHistoryActiveIndex++;

    if(searchHistoryActiveIndex>=items.length){
      searchHistoryActiveIndex=0;
    }

    updateSearchHistoryActive(items);
    return;
  }

  if(e.key==="ArrowUp"){
    e.preventDefault();

    searchHistoryActiveIndex--;

    if(searchHistoryActiveIndex<0){
      searchHistoryActiveIndex=items.length-1;
    }

    updateSearchHistoryActive(items);
    return;
  }

  if(e.key==="Enter" && searchHistoryActiveIndex>=0){
    e.preventDefault();

    const item=items[searchHistoryActiveIndex];
    const index=Number(item.dataset.index);
    const query=searchHistory[index];

    if(query){
      $("#searchInput").value=query;
      searchHistoryEl.classList.add("hidden");
      searchHistoryActiveIndex=-1;
    }
  }
});

function updateSearchHistoryActive(items){
  items.forEach((item,index)=>{
    item.classList.toggle(
      "active",
      index===searchHistoryActiveIndex
    );
  });

  if(searchHistoryActiveIndex>=0){
    items[searchHistoryActiveIndex].scrollIntoView({
      block:"nearest"
    });
  }
}

searchHistoryEl.addEventListener("click",e=>{
  const deleteButton=e.target.closest("[data-delete]");

  if(deleteButton){
    const index=Number(deleteButton.dataset.delete);

    searchHistory.splice(index,1);
    saveSearchHistory();
    renderSearchHistory();

    return;
  }

  if(e.target.closest(".search-history-clear")){
    searchHistory=[];
    saveSearchHistory();
    renderSearchHistory();

    return;
  }

  const item=e.target.closest(".search-history-item");

  if(!item) return;

  const index=Number(item.dataset.index);
  const query=searchHistory[index];

  if(!query) return;

  $("#searchInput").value=query;
  searchHistoryEl.classList.add("hidden");
  $("#searchInput").focus();
});

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
  /*
  $("#date").textContent =
    now.toLocaleDateString("zh-CN",{
      year:"numeric",
      month:"long",
      day:"numeric"
    }) + " " +
    now.toLocaleDateString("zh-CN",{
      weekday:"long"
    }) + " " + "农历" + lunarText;
    */

  $("#dateSolar").textContent =
  now.toLocaleDateString("zh-CN",{
    year:"numeric",
    month:"long",
    day:"numeric"
  });

  $("#dateWeekday").textContent =
    now.toLocaleDateString("zh-CN",{
      weekday:"long"
    });

  $("#dateLunar").textContent = "农历" + lunarText;
  
}
setInterval(tick,1000);tick();

/*
function favicon(url){
  try{return "https://www.google.com/s2/favicons?sz=128&domain="+encodeURIComponent(new URL(url).hostname)}
  catch{return ""}
}
*/

function favicon(url){
  try{
    const u=new URL(url);
    const host=u.hostname;

    // 优先使用 Google favicon 服务的较大尺寸
    return "https://www.google.com/s2/favicons?sz=256&domain="
      + encodeURIComponent(host);
  }catch{
    return "";
  }
}

function normalizeUrl(url){
  url=url.trim();
  if(!/^https?:\/\//i.test(url)) url="https://"+url;
  return url;
}

function folderPreview(folder){
  const children=folder.children||[];

  if(!children.length){
    return `<div class="folder-icon">📁</div>`;
  }

  const preview=children.slice(0,4);

  return `
    <div class="folder-preview">
      ${preview.map(ch=>`
        <div class="folder-preview-cell">
          <img
            src="${ch.icon||favicon(ch.url)}"
            onerror="this.style.visibility='hidden'"
            alt="">
        </div>
      `).join("")}
    </div>
  `;
}

/*
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
*/

/*
function render(){
  itemsEl.innerHTML="";

  if(!state.items.length){
    itemsEl.innerHTML='<div class="empty">点击右下角 ＋ 添加网站或文件夹</div>';
    return;
  }

  state.items.forEach(it=>{
    const el=document.createElement("div");

    el.className="item";
    el.draggable=true;
    el.dataset.id=it.id;

    el.innerHTML=it.type==="folder"
      ? `${folderPreview(it)}<div class="item-name"></div>`
      : `<img class="icon" src="${it.icon||favicon(it.url)}" onerror="this.style.visibility='hidden'"><div class="item-name"></div>`;

    el.querySelector(".item-name").textContent=it.name;

    el.onclick=()=>openItem(it);

    el.oncontextmenu=e=>{
      e.preventDefault();
      showContext(e.clientX,e.clientY,it.id);
    };

    el.ondragstart=()=>{
      el.classList.add("dragging");
    };

    el.ondragend=()=>{
      el.classList.remove("dragging");
    };

    el.ondragover=e=>e.preventDefault();

    el.ondrop=e=>{
      e.preventDefault();

      const id=el.dataset.id;
      const dragged=document.querySelector(".dragging");

      if(!dragged||dragged.dataset.id===id)return;

      const old=state.items.findIndex(
        x=>x.id===dragged.dataset.id
      );

      const target=state.items.findIndex(
        x=>x.id===id
      );

      if(old<0||target<0)return;

      const [x]=state.items.splice(old,1);

      state.items.splice(target,0,x);

      save();
      render();
    };

    itemsEl.appendChild(el);
  });
}
*/

function render(){
  itemsEl.innerHTML="";

  if(!state.items.length){
    itemsEl.innerHTML='<div class="empty">点击右下角 ＋ 添加网站或文件夹</div>';
    return;
  }

  let draggedId=null;
  let dragMoved=false;

  state.items.forEach(it=>{
    const el=document.createElement("div");

    el.className="item";
    el.draggable=true;
    el.dataset.id=it.id;

    el.innerHTML=it.type==="folder"
      ? `${folderPreview(it)}<div class="item-name"></div>`
      : `<img class="icon" src="${it.icon||favicon(it.url)}" onerror="this.style.visibility='hidden'"><div class="item-name"></div>`;

    el.querySelector(".item-name").textContent=it.name;

    // 点击打开
    el.onclick=e=>{
      if(dragMoved){
        e.preventDefault();
        e.stopPropagation();
        dragMoved=false;
        return;
      }

      openItem(it);
    };

    // 右键菜单
    el.oncontextmenu=e=>{
      e.preventDefault();
      showContext(e.clientX,e.clientY,it.id);
    };

    // 开始拖动
    el.ondragstart=e=>{
      draggedId=it.id;
      dragMoved=false;

      el.classList.add("dragging");

      e.dataTransfer.effectAllowed="move";
      e.dataTransfer.setData("text/plain",it.id);
    };

    // 拖动结束
    el.ondragend=()=>{
      el.classList.remove("dragging");

      itemsEl.querySelectorAll(".item.drag-over")
        .forEach(x=>x.classList.remove("drag-over"));

      draggedId=null;

      // 防止拖动结束后紧接着触发 click
      setTimeout(()=>{
        dragMoved=false;
      },100);
    };

    // 拖到图标上
    el.ondragover=e=>{
      e.preventDefault();

      if(!draggedId || draggedId===it.id)return;

      e.dataTransfer.dropEffect="move";

      itemsEl.querySelectorAll(".item.drag-over")
        .forEach(x=>x.classList.remove("drag-over"));

      el.classList.add("drag-over");
    };

    // 离开目标
    el.ondragleave=()=>{
      el.classList.remove("drag-over");
    };

    // 松开鼠标，重新排序
    el.ondrop=e=>{
      e.preventDefault();
      e.stopPropagation();

      el.classList.remove("drag-over");

      const fromId=
        draggedId ||
        e.dataTransfer.getData("text/plain");

      const toId=it.id;

      if(!fromId || fromId===toId)return;

      const old=state.items.findIndex(
        x=>x.id===fromId
      );

      const target=state.items.findIndex(
        x=>x.id===toId
      );

      if(old<0 || target<0)return;

      const [moved]=state.items.splice(old,1);

      state.items.splice(target,0,moved);

      dragMoved=true;

      save();
      render();
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
/*
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
*/

function renderFolderItems(folder){
  const box=$("#folderItems");
  box.innerHTML="";

  if(!folder.children?.length){
    box.innerHTML='<div class="empty">文件夹为空，点击“＋ 网站”添加</div>';
    return;
  }

  folder.children.forEach(ch=>{
    const el=document.createElement("div");

    el.className="collection-item";
    el.title="右键编辑";

    el.innerHTML=`
      <div class="collection-icon">
        <img
          src="${ch.icon||favicon(ch.url)}"
          onerror="this.style.visibility='hidden'"
          alt="">
      </div>
      <div class="collection-name"></div>
    `;

    el.querySelector(".collection-name").textContent=ch.name;

    // 点击网站直接打开
    el.onclick=()=>{
      location.href=ch.url;
    };

    // 保留原来的右键编辑功能
    el.oncontextmenu=e=>{
      e.preventDefault();
      showFolderContext(
        e.clientX,
        e.clientY,
        folder.id,
        ch.id
      );
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
/*
function hideMenus(){menu.classList.add("hidden");contextMenu.classList.add("hidden")}
*/
function hideMenus(){
  menu.classList.add("hidden");
  contextMenu.classList.add("hidden");
  engineMenu.classList.add("hidden");
  $("#engineButton").setAttribute("aria-expanded","false");
}

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

/*
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
*/

$("#editorForm").onsubmit=e=>{
  e.preventDefault();

  const id=$("#itemId").value;
  const type=$("#itemType").value;

  let name=$("#nameInput").value.trim();
  let url=$("#urlInput").value.trim();
  let icon=$("#iconInput").value.trim();

  if(!name)return;

  if(type==="site"){
    if(!url)return;

    url=normalizeUrl(url);

    // 没有手动填写图标时，自动使用高清 favicon
    if(!icon){
      icon=favicon(url);
    }
  }

  if(id){
    const it=state.items.find(x=>x.id===id);

    if(!it)return;

    Object.assign(it,{
      name,
      url,
      icon
    });
  }else{
    state.items.push({
      id:crypto.randomUUID(),
      type,
      name,
      url,
      icon,
      children:[]
    });
  }

  save();
  render();
  editor.close();
};

function updateEngineButton(){
  const engine=engines[state.engine];
  $("#engineButton").innerHTML=
    `<img src="${engine.icon}" alt="${engine.label}">`;
}

/*
$("#engineButton").onclick=()=>{
  const keys=Object.keys(engines);
  const i=keys.indexOf(state.engine);
  const next=keys[(i+1)%keys.length];

  state.engine=next;
  save();
  updateEngineButton();
};
updateEngineButton();
*/
/*
$("#engineButton").onclick=()=>{
  const keys=Object.keys(engines),i=keys.indexOf(state.engine),next=keys[(i+1)%keys.length];
  state.engine=next;save();$("#engineButton").textContent=engines[next].label;
};
$("#engineButton").textContent=engines[state.engine].label;
*/

const engineMenu = $("#engineMenu");

function updateEngineButton(){
  const engine = engines[state.engine];

  $("#engineButton").innerHTML = `
    <img src="${engine.icon}" alt="">
    <span>${engine.label}</span>
    <span class="engine-chevron">⌄</span>
  `;

  $("#searchInput").placeholder = engine.placeholder;
}

function renderEngineMenu(){
  engineMenu.innerHTML = Object.entries(engines).map(([key, engine]) => `
    <button type="button" data-engine="${key}">
      <img src="${engine.icon}" alt="">
      <span>${engine.label}</span>
      ${key === state.engine ? '<span class="engine-check">✓</span>' : ''}
    </button>
  `).join("");
}

$("#engineButton").onclick = e => {
  e.stopPropagation();

  const isOpen = !engineMenu.classList.contains("hidden");

  engineMenu.classList.toggle("hidden", isOpen);
  $("#engineButton").setAttribute(
    "aria-expanded",
    String(!isOpen)
  );
};

engineMenu.onclick = e => {
  const button = e.target.closest("[data-engine]");
  if(!button) return;

  state.engine = button.dataset.engine;
  save();

  updateEngineButton();
  renderEngineMenu();

  engineMenu.classList.add("hidden");
  $("#engineButton").setAttribute("aria-expanded", "false");
};

updateEngineButton();
renderEngineMenu();

$("#searchForm").onsubmit=e=>{
  e.preventDefault();

  const q=$("#searchInput").value.trim();

  if(!q)return;

  const isUrl =
    /^https?:\/\//i.test(q) ||
    /^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(q);

  // 只有真正的搜索关键词才保存
  if(!isUrl){
    addSearchHistory(q);
  }

  // 搜索后关闭历史记录
  searchHistoryEl.classList.add("hidden");

  if(/^https?:\/\//i.test(q)){
    location.href=q;
  }
  else if(/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(q)){
    location.href=normalizeUrl(q);
  }
  else{
    location.href=engines[state.engine].url(q);
  }
};

/*
$("#searchForm").onsubmit=e=>{
  e.preventDefault();const q=$("#searchInput").value.trim();if(!q)return;
  if(/^https?:\/\//i.test(q))location.href=q;
  else if(/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(q))location.href=normalizeUrl(q);
  else location.href=engines[state.engine].url(q);
};
*/


/*
document.addEventListener("click",e=>{
  if(!e.target.closest("#contextMenu"))contextMenu.classList.add("hidden");
  if(!e.target.closest("#addButton")&&!e.target.closest("#menu"))menu.classList.add("hidden");
});
document.addEventListener("keydown",e=>{
  if(e.key==="/"&&document.activeElement.tagName!=="INPUT"){e.preventDefault();$("#searchInput").focus()}
  if(e.key==="Escape"){hideMenus();if(editor.open)editor.close();if(folderDialog.open)folderDialog.close()}
});
render();
*/

/*
document.addEventListener("click",e=>{
  if(!e.target.closest("#contextMenu"))
    contextMenu.classList.add("hidden");

  if(!e.target.closest("#addButton") && !e.target.closest("#menu"))
    menu.classList.add("hidden");

  // 点击搜索引擎下拉框和按钮以外的地方，关闭下拉框
  if(!e.target.closest("#engineMenu") && !e.target.closest("#engineButton")){
    engineMenu.classList.add("hidden");
    $("#engineButton").setAttribute("aria-expanded","false");
  }
});
*/

document.addEventListener("click",e=>{
  if(!e.target.closest("#contextMenu"))
    contextMenu.classList.add("hidden");

  if(!e.target.closest("#addButton") && !e.target.closest("#menu"))
    menu.classList.add("hidden");

  // 点击搜索引擎下拉框和按钮以外的地方，关闭下拉框
  if(!e.target.closest("#engineMenu") && !e.target.closest("#engineButton")){
    engineMenu.classList.add("hidden");
    $("#engineButton").setAttribute("aria-expanded","false");
  }

  // 点击搜索框和历史记录以外的地方，关闭搜索历史
  if(
    !e.target.closest("#searchInput") &&
    !e.target.closest("#searchHistory")
  ){
    searchHistoryEl.classList.add("hidden");
  }
});

document.addEventListener("keydown",e=>{
  if(e.key==="/" && document.activeElement.tagName!=="INPUT"){
    e.preventDefault();
    $("#searchInput").focus();
  }

  if(e.key==="Escape"){
    hideMenus();

    // ESC 同样关闭搜索引擎下拉框
    engineMenu.classList.add("hidden");
    $("#engineButton").setAttribute("aria-expanded","false");

    if(editor.open) editor.close();
    if(folderDialog.open) folderDialog.close();
  }
});

render();
