const STORAGE = 'minimal_nav_local_v2';

/* 搜索历史显示相关 */
const SEARCH_HISTORY_STORAGE = 'minimal_nav_search_history_v1';
const MAX_SEARCH_HISTORY = 10;

function loadSearchHistory() {
  try {
    const data =
      JSON.parse(
        localStorage.getItem(
          SEARCH_HISTORY_STORAGE
        )
      );

    return Array.isArray(data)
      ? data
      : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(history) {
  localStorage.setItem(
    SEARCH_HISTORY_STORAGE,
    JSON.stringify(history)
  );
}

function addSearchHistory(query) {
  query = query.trim();

  if (!query) {
    return;
  }

  let history =
    loadSearchHistory();

  history =
    history.filter(
      item => item !== query
    );

  history.unshift(query);

  history =
    history.slice(
      0,
      MAX_SEARCH_HISTORY
    );

  saveSearchHistory(history);
}

function renderSearchHistory(keyword = '') {
  const box =
    document.querySelector(
      '#suggestions'
    );

  if (!box) {
    return;
  }

  const history =
    loadSearchHistory();

  keyword = keyword.trim().toLowerCase();

  const filteredHistory =
    keyword
      ? history.filter(
          item =>
            item
              .toLowerCase()
              .includes(keyword)
        )
      : history;

  if (!filteredHistory.length) {
    box.innerHTML = '';
    box.classList.add('hidden');
    return;
  }

  box.innerHTML =
    filteredHistory
      .map(
        item => `
          <div class="search-history-row">
            <button
              class="search-history-item"
              type="button"
              data-query="${encodeURIComponent(item)}"
            >
              <span class="search-history-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="8"></circle>
                  <path d="M12 7v5l3 2"></path>
                </svg>
              </span>

              <span class="search-history-text">${item}</span>
            </button>

            <button
              class="search-history-delete"
              type="button"
              data-history-delete="${encodeURIComponent(item)}"
              aria-label="删除这条搜索历史"
              title="删除"
            >
              ×
            </button>
          </div>
        `
      )
      .join('') +
    `
      <div class="search-history-footer">
        <button
          class="search-history-clear"
          type="button"
          data-history-action="clear"
        >
          清空搜索历史
        </button>
      </div>
    `;

  box.classList.remove('hidden');
}

function showSearchHistory() {
  const box =
    document.querySelector(
      '#searchHistory'
    );

  if (!box) {
    return;
  }

  renderSearchHistory();

  box.classList.remove(
    'hidden'
  );
}

function hideSearchHistory() {
  document.querySelector(
    '#searchHistory'
  )?.classList.add(
    'hidden'
  );
}

document
  .querySelector('#suggestions')
  ?.addEventListener(
    'click',
    e => {

      e.stopPropagation();
      
      const clear =
        e.target.closest(
          '[data-history-action="clear"]'
        );

      if (clear) {
        localStorage.removeItem(
          SEARCH_HISTORY_STORAGE
        );

        renderSearchHistory();
        return;
      }

      const deleteButton =
        e.target.closest(
          '[data-history-delete]'
        );
      
      if (deleteButton) {
        const query =
          decodeURIComponent(
            deleteButton.dataset.historyDelete
          );
        const history =
          loadSearchHistory().filter(
            item => item !== query
          );
        saveSearchHistory(history);
        renderSearchHistory();
        return;
      }

      const item =
        e.target.closest(
          '.search-history-item'
        );

      if (!item) {
        return;
      }

      const query =
        decodeURIComponent(
          item.dataset.query
        );

      searchInput.value = query;

      hideSearchHistory();

      search(query);
    }
  );

document.querySelector(
  '#suggestions'
).addEventListener(
  'click',
  e => {
    const clear =
      e.target.closest(
        '[data-history-action="clear"]'
      );

    if (clear) {
      localStorage.removeItem(
        SEARCH_HISTORY_STORAGE
      );

      renderSearchHistory();
      return;
    }

    const item =
      e.target.closest(
        '.search-history-item'
      );

    if (!item) {
      return;
    }

    const query =
      decodeURIComponent(
        item.dataset.query
      );

    searchInput.value = query;

    hideSearchHistory();

    search(query);
  }
);

document.addEventListener(
  'click',
  e => {
    const suggestions =
      document.querySelector(
        '#suggestions'
      );

    if (!suggestions) {
      return;
    }

    if (
      e.target.closest(
        '.search-wrap'
      )
    ) {
      return;
    }

    suggestions.classList.add(
      'hidden'
    );
  }
);


/*
document.addEventListener(
  'click',
  e => {
    const suggestions =
      document.querySelector(
        '#suggestions'
      );

    const searchWrap =
      e.target.closest(
        '.search-wrap'
      );

    if (
      suggestions &&
      !searchWrap
    ) {
      suggestions.classList.add(
        'hidden'
      );
    }
  }
);
*/

/*
searchInput.addEventListener(
  'focus',
  () => {
    renderSearchHistory();
  }
);
*/
/* 搜索历史显示相关 */


const ENGINES = {
  google: {
    name: 'Google',
    short: 'G',
    url: 'https://www.google.com/search?q=',
    placeholder:'Search with Google or enter address'
  },
  bing: {
    name: 'Bing',
    short: 'B',
    url: 'https://www.bing.com/search?q=',
    placeholder:'Search with Bing or enter address'
  },
  baidu: {
    name: 'Baidu',
    short: '百',
    url: 'https://www.baidu.com/s?wd=',
    placeholder:'使用百度搜索或输入网址'
  },
  duck: {
    name: 'DuckDuckGo',
    short: 'D',
    url: 'https://duckduckgo.com/?q=',
    placeholder:'Search with DuckDuckGo or enter address'
  }
};

const uid = () => crypto.randomUUID();

const site = (name, url, icon = '') => ({
  id: uid(),
  type: 'site',
  name,
  url,
  icon
});

/*处理添加网址时的地址*/
function normalizeUrl(url){
  url = url.trim();

  if (!url) return '';

  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  return url;
}
/* 搜索历史显示相关 */

const defaultSites = [
  site('Google', 'https://www.google.com'),
  site('YouTube', 'https://www.youtube.com'),
  site('GitHub', 'https://github.com'),
  site('ChatGPT', 'https://chatgpt.com'),
  site('Google Scholar', 'https://scholar.google.com'),
  site('Nature', 'https://www.nature.com'),
  site('PNAS', 'https://www.pnas.org'),
  site('Cloudflare', 'https://www.cloudflare.com'),
  site('Wikipedia', 'https://www.wikipedia.org')
];

const defaultState = () => ({
  version: 3,
  engine: 'google',
  theme: 'auto',
  showDate: true,
  sites: defaultSites
});

let state = loadState();

let editingId = null;
let contextId = null;

let currentCollectionId = null;
let currentCollectionCard = null;

let calendarDate = new Date();
let calendarHasNavigated = false;
let selectedDate = new Date();

function loadState() {
  try {
    const raw = JSON.parse(
      localStorage.getItem(STORAGE) || 'null'
    );

    if (raw) {
      return sanitize(raw);
    }
  } catch {}

  try {
    const old = JSON.parse(
      localStorage.getItem('minimal_nav_local_v1') ||
      localStorage.getItem('minimal_nav_local') ||
      'null'
    );

    if (old) {
      return sanitize(old);
    }
  } catch {}

  return defaultState();
}

function normalizeItem(i) {
  if (!i) {
    return null;
  }

  if (
    i.type === 'folder' ||
    Array.isArray(i.children) ||
    Array.isArray(i.items)
  ) {
    const children =
      Array.isArray(i.children)
        ? i.children
        : Array.isArray(i.items)
          ? i.items
          : [];

    return {
      id: i.id || uid(),
      type: 'folder',
      name: i.name || '聚合',
      children: children
        .map(normalizeItem)
        .filter(Boolean)
    };
  }

  return {
    id: i.id || uid(),
    type: 'site',
    name: i.name || i.title || '未命名',
    url: i.url || '',
    icon: i.icon || i.iconUrl || ''
  };
}

function sanitize(x) {
  let sites = [];

  if (Array.isArray(x.sites)) {
    sites = x.sites
      .map(normalizeItem)
      .filter(Boolean);
  } else if (Array.isArray(x.groups)) {
    sites = x.groups
      .flatMap(
        g => Array.isArray(g.items) ? g.items : []
      )
      .map(normalizeItem)
      .filter(Boolean);
  }

  return {
    version: 3,
    engine: ENGINES[x.engine]
      ? x.engine
      : 'google',
    theme: ['auto', 'dark', 'light'].includes(x.theme)
      ? x.theme
      : 'auto',
    showDate: x.showDate !== false,
    sites: sites.filter(
      i => i.type === 'folder'
        ? i.children.length
        : i.url
    )
  };
}

function save() {
  localStorage.setItem(
    STORAGE,
    JSON.stringify(state)
  );
}

function favicon(url){
  try{
    const u = new URL(url);
    return u.origin + '/favicon.ico';
  }catch{
    return '';
  }
}

/*
function favicon(url) {
  try {
    return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(url)}`;
  } catch {
    return '';
  }
}
*/

function applyTheme() {
  let dark = state.theme === 'dark';

  if (state.theme === 'auto') {
    dark = matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
  }

  document.documentElement.classList.toggle(
    'dark',
    dark
  );

  document.querySelector(
    '#date'
  ).style.display =
    state.showDate ? '' : 'none';
}

/*
function siteIconHtml(i) {
  return `<img class="favicon" alt="" src="${i.icon || favicon(i.url)}">`;
}
*/

function siteIconHtml(i) {
  const src = i.icon || favicon(i.url);

  return `
    <img
      class="favicon"
      alt=""
      src="${src}"
      data-url="${i.url}"
    >
  `;
}

function render(){
  applyTheme();
  renderEngines();

  const root=document.querySelector('#sites');
  root.innerHTML='';

  state.sites.forEach(i=>root.appendChild(createCard(i)));

  const addCard=document.createElement('article');
  addCard.className='site-card add-site-card';
  addCard.innerHTML='<div class="add-site-icon">＋</div><div class="site-name">添加网站</div>';
  addCard.addEventListener('click',()=>openEditor());

  root.appendChild(addCard);

  initSortable(root);
}

function createCard(i) {
  const card =
    document.createElement('article');

  card.className = 'site-card';
  card.dataset.id = i.id;

  if (i.type === 'folder') {
    const children =
      (i.children || [])
        .filter(
          ch => ch.type === 'site'
        )
        .slice(0, 4);

    const icons =
      children
        .map(ch => {
          const src =
            ch.icon ||
            favicon(ch.url);

          return `
            <img
              class="favicon"
              alt=""
              src="${src}"
              data-url="${ch.url}"
            >
          `;
        })
        .join('');

    card.innerHTML = `
      <div class="folder-icon">
        ${icons || '<span>＋</span>'}
      </div>
      <div class="site-name"></div>
    `;

    card
      .querySelectorAll(
        '.folder-icon .favicon'
      )
      .forEach(img => {
        img.onerror = () => {
          img.style.visibility =
            'hidden';
        };
      });

    card.querySelector(
      '.site-name'
    ).textContent = i.name;

    card.addEventListener(
      'click',
      () => openCollection(i, card)
    );

  } else {
    card.innerHTML =
      `${siteIconHtml(i)}<div class="site-name"></div>`;

    const img =
      card.querySelector('.favicon');

    img.onerror = () => {
      img.style.visibility =
        'hidden';
    };

    card.querySelector(
      '.site-name'
    ).textContent = i.name;

    card.addEventListener(
      'click',
      () => location.href = i.url
    );
  }

  card.addEventListener(
    'contextmenu',
    e => {
      e.preventDefault();

      showContext(
        e.clientX,
        e.clientY,
        i.id
      );
    }
  );

  return card;
}




let mergeTimer = null;
let mergeSourceId = null;
let mergeTargetId = null;
let pendingMerge = null;

/*
let mergeSourceId = null;
let mergeTargetId = null;
let pendingMerge = null;
*/
/*
let mergeTimer = null;
let mergeSourceId = null;
let mergeTargetId = null;
let mergeTriggered = false;
let pendingMerge = null;
*/

/*
function clearMergeTimer(root) {
  if (mergeTimer) {
    clearTimeout(mergeTimer);
    mergeTimer = null;
  }

  mergeSourceId = null;
  mergeTargetId = null;

  root?.querySelectorAll(
    '.merge-target'
  ).forEach(
    el => el.classList.remove(
      'merge-target'
    )
  );
}
*/
/*
function startMergeTimer(
  root,
  sourceId,
  targetId,
  targetEl
) {
  if (
    !sourceId ||
    !targetId ||
    sourceId === targetId
  ) {
    return;
  }

  if (
    mergeSourceId === sourceId &&
    mergeTargetId === targetId &&
    mergeTimer
  ) {
    return;
  }

  clearMergeTimer(root);

  mergeSourceId = sourceId;
  mergeTargetId = targetId;

  targetEl?.classList.add(
    'merge-target'
  );

  mergeTimer = setTimeout(
    () => {
      const source =
        state.sites.find(
          x => x.id === sourceId
        );

      const target =
        state.sites.find(
          x => x.id === targetId
        );

      if (
        !source ||
        !target
      ) {
        return;
      }

      // Do not rebuild the DOM while SortableJS is still dragging.
      // Queue the merge and apply it from onEnd instead.
      pendingMerge = {
        sourceId,
        targetId
      };

      mergeTriggered = true;
    },
    600
  );
}
*/

function clearMergePreview(root) {
  if (mergeTimer) {
    clearTimeout(mergeTimer);
    mergeTimer = null;
  }

  mergeSourceId = null;
  mergeTargetId = null;
  pendingMerge = null;

  root
    ?.querySelectorAll(
      '.merge-target'
    )
    .forEach(
      el =>
        el.classList.remove(
          'merge-target'
        )
    );
}

/*
function clearMergePreview(root) {
  mergeSourceId = null;
  mergeTargetId = null;
  pendingMerge = null;

  root
    ?.querySelectorAll('.merge-target')
    .forEach(
      el =>
        el.classList.remove(
          'merge-target'
        )
    );
}
*/

function showMergePreview(
  root,
  sourceId,
  targetId,
  targetEl
) {
  if (
    !sourceId ||
    !targetId ||
    sourceId === targetId
  ) {
    clearMergePreview(root);
    return;
  }

  if (
    mergeSourceId === sourceId &&
    mergeTargetId === targetId &&
    pendingMerge
  ) {
    return;
  }

  clearMergePreview(root);

  mergeSourceId = sourceId;
  mergeTargetId = targetId;

  targetEl?.classList.add(
    'merge-target'
  );

  pendingMerge = {
    sourceId,
    targetId
  };
}


/*
function showMergePreview(
  root,
  sourceId,
  targetId,
  targetEl
) {
  if (
    !sourceId ||
    !targetId ||
    sourceId === targetId
  ) {
    clearMergePreview(root);
    return;
  }

  if (
    mergeSourceId === sourceId &&
    mergeTargetId === targetId
  ) {
    return;
  }

  clearMergePreview(root);

  mergeSourceId = sourceId;
  mergeTargetId = targetId;

  targetEl?.classList.add(
    'merge-target'
  );

  pendingMerge = {
    sourceId,
    targetId
  };
}
*/

function initSortable(root) {
  if (root._sortable) {
    root._sortable.destroy();
  }

  clearMergePreview(root);

  root._sortable =
    new Sortable(
      root,
      {
        animation: 150,
        forceFallback: true,
        fallbackOnBody: true,
        swapThreshold: .65,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        filter: '.add-site-card',

        onStart: e => {
          clearMergePreview(root);
        },


        
onMove: e => {
  const sourceId =
    e.dragged?.dataset?.id;

  if (!sourceId) {
    return true;
  }

  const oe =
    e.originalEvent;

  if (
    !oe ||
    typeof oe.clientX !== 'number' ||
    typeof oe.clientY !== 'number'
  ) {
    return true;
  }

  /*
   * 已经进入聚合预览后，
   * 只要鼠标仍然位于目标卡片附近，
   * 就保持聚合状态。
   */
  if (pendingMerge) {
    const targetEl =
      root.querySelector(
        `[data-id="${mergeTargetId}"]`
      );

    if (!targetEl) {
      clearMergePreview(root);
      return true;
    }

    const rect =
      targetEl.getBoundingClientRect();

    /*
     * 给目标卡片增加一点有效范围，
     * 让拖拽不需要特别精准。
     */
    const padding =
      Math.max(
        8,
        Math.min(
          rect.width,
          rect.height
        ) * 0.18
      );

    const inside =
      oe.clientX >= rect.left - padding &&
      oe.clientX <= rect.right + padding &&
      oe.clientY >= rect.top - padding &&
      oe.clientY <= rect.bottom + padding;

    if (inside) {
      /*
       * 保持目标位置，
       * 不让 Sortable 继续交换。
       */
      return false;
    }

    /*
     * 离开目标区域，
     * 取消聚合预览。
     */
    clearMergePreview(root);

    return true;
  }

  /*
   * 不依赖 e.related，
   * 直接寻找鼠标当前位置下面的 site-card。
   */
  const targetEl =
    document
      .elementFromPoint(
        oe.clientX,
        oe.clientY
      )
      ?.closest(
        '.site-card'
      );

  const targetId =
    targetEl?.dataset?.id;

  /*
   * 没有目标，或者目标就是自己，
   * 保持普通排序。
   */
  if (
    !targetEl ||
    !targetId ||
    targetId === sourceId ||
    targetEl.classList.contains(
      'add-site-card'
    )
  ) {
    clearMergePreview(root);
    return true;
  }

  const rect =
    targetEl.getBoundingClientRect();

  /*
   * 聚合有效区域扩大。
   *
   * 不再要求进入中央 80%，
   * 目标卡片大部分区域都可以触发聚合。
   */
  const mergeLeft =
    rect.left +
    rect.width * 0.07;

  const mergeRight =
    rect.right -
    rect.width * 0.07;

  const mergeTop =
    rect.top +
    rect.height * 0.07;

  const mergeBottom =
    rect.bottom -
    rect.height * 0.07;

  const insideMergeArea =
    oe.clientX >= mergeLeft &&
    oe.clientX <= mergeRight &&
    oe.clientY >= mergeTop &&
    oe.clientY <= mergeBottom;

  /*
   * 鼠标没有进入目标区域：
   * 正常拖拽排序。
   */
  if (!insideMergeArea) {
    clearMergePreview(root);
    return true;
  }

  /*
   * 进入目标区域后，
   * 立即显示聚合预览。
   */
  showMergePreview(
    root,
    sourceId,
    targetId,
    targetEl
  );

  /*
   * 阻止 Sortable 交换目标位置。
   */
  return false;
},





        onEnd: e => {
          /*
           * 已经出现聚合预览，
           * 松手后执行聚合。
           */
          if (pendingMerge) {
            const {
              sourceId,
              targetId
            } = pendingMerge;

            const source =
              state.sites.find(
                x =>
                  x.id === sourceId
              );

            const target =
              state.sites.find(
                x =>
                  x.id === targetId
              );

            clearMergePreview(root);

            if (
              source &&
              target &&
              source.id !== target.id
            ) {
              mergeItems(
                source,
                target
              );

              return;
            }
          }

          /*
           * 没有聚合：
           * 保存普通排序结果。
           */
          clearMergePreview(root);

          const ids = [
            ...root.children
          ]
            .filter(
              x =>
                x.dataset.id
            )
            .map(
              x =>
                x.dataset.id
            );

          const byId =
            new Map(
              state.sites.map(
                x => [
                  x.id,
                  x
                ]
              )
            );

          state.sites =
            ids
              .map(
                id =>
                  byId.get(id)
              )
              .filter(Boolean);

          save();
          render();
        }
      }
    );
}

/*
function initSortable(root) {
  if (root._sortable) {
    root._sortable.destroy();
  }

  clearMergeTimer(root);

  root._sortable = new Sortable(
    root,
    {
      animation: 150,
      forceFallback: true,
      fallbackOnBody: true,
      filter: '.add-site-card',
      swapThreshold: .65,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',

      onStart: e => {
        mergeTriggered = false;
        pendingMerge = null;
        clearMergeTimer(root);
      },

      onMove: e => {
        const sourceId =
          e.dragged?.dataset?.id;

        const related =
          e.related?.closest?.(
            '.site-card'
          );

        const targetId =
          related?.dataset?.id;

        if (
          !sourceId ||
          !targetId ||
          sourceId === targetId
        ) {
          clearMergeTimer(root);
          return true;
        }

        startMergeTimer(
          root,
          sourceId,
          targetId,
          related
        );

        return true;
        
      },

      onEnd: e => {
        if (pendingMerge) {
          const {
            sourceId,
            targetId
          } = pendingMerge;

          pendingMerge = null;

          clearMergeTimer(root);

          mergeTriggered = false;

          const source =
            state.sites.find(
              x => x.id === sourceId
            );

          const target =
            state.sites.find(
              x => x.id === targetId
            );

          if (
            source &&
            target &&
            source.id !== target.id
          ) {
            mergeItems(
              source,
              target
            );

            return;
          }
        }

        if (mergeTriggered) {
          clearMergeTimer(root);
          mergeTriggered = false;
          return;
        }

        clearMergeTimer(root);

        const ids = [
          ...root.children
        ]
          .filter(
            x => x.dataset.id
          )
          .map(
            x => x.dataset.id
          );

        const byId =
          new Map(
            state.sites.map(
              x => [x.id, x]
            )
          );

        state.sites =
          ids
            .map(
              id => byId.get(id)
            )
            .filter(Boolean);

        save();
        render();
      }
    }
  );
}
*/

function dropTargetFromEvent(e) {
  const oe =
    e.originalEvent;

  if (
    !oe ||
    typeof oe.clientX !== 'number'
  ) {
    return null;
  }

  const el =
    document
      .elementFromPoint(
        oe.clientX,
        oe.clientY
      )
      ?.closest('.site-card');

  return el || null;
}


function mergeItems(
  source,
  target
) {
  if (source.id === target.id) {
    return;
  }

  let animationId = null;

  if (
    source.type === 'folder' &&
    target.type === 'folder'
  ) {
    target.children = [
      ...(target.children || []),
      ...(source.children || [])
    ];

    animationId = target.id;

  } else if (
    source.type === 'site' &&
    target.type === 'folder'
  ) {
    target.children = [
      ...(target.children || []),
      source
    ];

    animationId = target.id;

  } else if (
    source.type === 'folder' &&
    target.type === 'site'
  ) {
    const folder = {
      id: uid(),
      type: 'folder',
      name: '未命名',
      children: [
        target,
        ...(source.children || [])
      ]
    };

    const idx =
      state.sites.findIndex(
        x => x.id === target.id
      );

    state.sites =
      state.sites.filter(
        x =>
          x.id !== source.id &&
          x.id !== target.id
      );

    state.sites.splice(
      idx,
      0,
      folder
    );

    animationId = folder.id;

    save();
    render();

    requestAnimationFrame(() => {
      document
        .querySelector(
          `.site-card[data-id="${animationId}"]`
        )
        ?.classList.add(
          'merge-complete'
        );
    });

    return;

  } else {
    const folder = {
      id: uid(),
      type: 'folder',
      name: '未命名',
      children: [
        target,
        source
      ]
    };

    const idx =
      state.sites.findIndex(
        x => x.id === target.id
      );

    state.sites =
      state.sites.filter(
        x =>
          x.id !== source.id &&
          x.id !== target.id
      );

    state.sites.splice(
      Math.max(0, idx),
      0,
      folder
    );

    animationId = folder.id;

    save();
    render();

    requestAnimationFrame(() => {
      document
        .querySelector(
          `.site-card[data-id="${animationId}"]`
        )
        ?.classList.add(
          'merge-complete'
        );
    });

    return;
  }

  state.sites =
    state.sites.filter(
      x => x.id !== source.id
    );

  save();
  render();

  requestAnimationFrame(() => {
    document
      .querySelector(
        `.site-card[data-id="${animationId}"]`
      )
      ?.classList.add(
        'merge-complete'
      );
  });

  toast('已聚合');
}

function openCollection(
  folder,
  card = null
) {
  currentCollectionId = folder.id;
  currentCollectionCard = card;

  currentCollectionCard?.classList.add(
    'collection-source'
  );

  document.querySelector(
    '#collectionTitle'
  ).textContent = folder.name;

  renderCollectionItems(folder);

  document.querySelector(
    '#collectionDialog'
  ).show();
}

function renderCollectionItems(folder) {
  const box =
    document.querySelector(
      '#collectionItems'
    );

  box.innerHTML = '';

  (folder.children || []).forEach(
    ch => {
      const el =
        document.createElement(
          'div'
        );

      el.className =
        'collection-item';

      el.dataset.id =
        ch.id;

      el.innerHTML =
        `${ch.type === 'site' ? siteIconHtml(ch) : '<div class="mini-folder">＋</div>'}<div class="collection-name"></div>`;

      el.querySelector(
        '.collection-name'
      ).textContent = ch.name;

      if (ch.type === 'site') {
        const img =
          el.querySelector(
            '.favicon'
          );

        img.onerror = () => {
          if (ch.icon) {
            img.src =
              favicon(ch.url);
          } else {
            img.style.visibility =
              'hidden';
          }
        };

        el.onclick =
          () => location.href = ch.url;
      } else {
        el.onclick =
          () => openCollection(ch);
      }

      el.addEventListener(
        'contextmenu',
        e => {
          e.preventDefault();

          openEditor(
            ch.id,
            folder.id
          );
        }
      );

      box.appendChild(el);
    }
  );

  const back =
    document.createElement(
      'button'
    );

  back.className =
    'collection-add';

  back.textContent =
    '＋ 添加网站';

  back.onclick =
    () => openEditor(
      null,
      folder.id
    );

  box.appendChild(back);


  if (box._sortable) {
    box._sortable.destroy();
    box._sortable = null;
  }

  if (!box._sortable) {
    box._sortable =
      new Sortable(
        box,
        {
          animation: 150,
          forceFallback: true,
          fallbackOnBody: true,
          filter: '.collection-add',
          ghostClass: 'sortable-ghost',

          onEnd: e => {
            if (
              e.item.classList.contains(
                'collection-add'
              )
            ) {
              return;
            }

            const oe =
              e.originalEvent;

            console.log(
              '拆分拖拽:',
              e.originalEvent?.clientX,
              e.originalEvent?.clientY
            );

            const dlg =
              document.querySelector(
                '#collectionDialog'
              );

            if (
              oe &&
              typeof oe.clientX === 'number' &&
              typeof oe.clientY === 'number'
            ) {
              const r =
                dlg.getBoundingClientRect();

              const inside =
                oe.clientX >= r.left &&
                oe.clientX <= r.right &&
                oe.clientY >= r.top &&
                oe.clientY <= r.bottom;

              if (!inside) {
                const childId =
                  e.item.dataset.id;

                const idx =
                  folder.children.findIndex(
                    x => x.id === childId
                  );

                if (idx >= 0) {
                  const [child] =
                    folder.children.splice(
                      idx,
                      1
                    );

                  state.sites.push(
                    child
                  );

                  if (
                    folder.children.length === 1
                  ) {
                    const last =
                      folder.children[0];

                    const fi =
                      state.sites.findIndex(
                        x => x.id === folder.id
                      );

                    state.sites =
                      state.sites.filter(
                        x =>
                          x.id !== folder.id
                      );

                    state.sites.splice(
                      Math.max(0, fi),
                      0,
                      last
                    );
                  } else if (
                    folder.children.length === 0
                  ) {
                    state.sites =
                      state.sites.filter(
                        x =>
                          x.id !== folder.id
                      );
                  }

                  save();

                  dclose(
                    'collectionDialog'
                  );

                  currentCollectionId =
                    null;

                  render();

                  toast(
                    '已拆分到首页'
                  );

                  return;
                }
              }
            }

            const ids = [
              ...box.querySelectorAll(
                '.collection-item'
              )
            ].map(
              x => x.dataset.id
            );

            const byId =
              new Map(
                folder.children.map(
                  x => [x.id, x]
                )
              );

            folder.children =
              ids
                .map(
                  id => byId.get(id)
                )
                .filter(Boolean);

            save();

            renderCollectionItems(
              folder
            );

            render();
          }
        }
      );
  } else {
    box._sortable.option(
      'disabled',
      false
    );
  }
}

function openEditor(
  id = null,
  parentId = null
) {
  editingId = id;
  window.editParentId =
    parentId;

  const d =
    document.querySelector(
      '#editorDialog'
    );

  const item =
    findItem(
      state.sites,
      id
    );

  const isFolder =
    item?.type === 'folder';

  document.querySelector(
    '#editorTitle'
  ).textContent =
    id
      ? isFolder
        ? '编辑聚合'
        : '编辑网站'
      : '添加网站';

  document.querySelector(
    '#nameInput'
  ).value =
    item?.name || '';

  document.querySelector(
    '#urlInput'
  ).value =
    item?.url || '';

  document.querySelector(
    '#iconInput'
  ).value =
    item?.icon || '';

  document.querySelector(
    '#urlRow'
  ).style.display =
    isFolder ? 'none' : '';

  document.querySelector(
    '#iconRow'
  ).style.display =
    isFolder ? 'none' : '';

  document.querySelector(
    '#deleteBtn'
  ).classList.toggle(
    'hidden',
    !id
  );

  d.showModal();
}

/*
function openEditor(
  id = null,
  parentId = null
) {
  editingId = id;
  window.editParentId =
    parentId;

  const d =
    document.querySelector(
      '#editorDialog'
    );

  let item =
    findItem(
      state.sites,
      id
    );

  document.querySelector(
    '#editorTitle'
  ).textContent =
    id
      ? '编辑网站'
      : '添加网站';

  document.querySelector(
    '#nameInput'
  ).value =
    item?.name || '';

  document.querySelector(
    '#urlInput'
  ).value =
    item?.url || '';

  document.querySelector(
    '#iconInput'
  ).value =
    item?.icon || '';

  document.querySelector(
    '#deleteBtn'
  ).classList.toggle(
    'hidden',
    !id
  );

  d.showModal();
}
*/

function findItem(
  list,
  id
) {
  for (const i of list) {
    if (i.id === id) {
      return i;
    }

    if (i.type === 'folder') {
      const found =
        findItem(
          i.children || [],
          id
        );

      if (found) {
        return found;
      }
    }
  }

  return null;
}

function removeItem(
  list,
  id
) {
  for (
    let n = list.length - 1;
    n >= 0;
    n--
  ) {
    if (list[n].id === id) {
      list.splice(
        n,
        1
      );

      return true;
    }

    if (
      list[n].type === 'folder' &&
      removeItem(
        list[n].children || [],
        id
      )
    ) {
      return true;
    }
  }

  return false;
}

document
  .querySelector(
    '#editorForm'
  )
  .addEventListener(
    'submit',
    e => {
      e.preventDefault();

      const name =
        document.querySelector(
          '#nameInput'
        ).value.trim();

      /*
      const url =
        document.querySelector(
          '#urlInput'
        ).value.trim();
      */

      /*
      const url =
        document.querySelector(
          '#urlInput'
        ).value.trim();
      */
      
      const url =
        normalizeUrl(
          document.querySelector(
            '#urlInput'
          ).value
        );

      /*
      let url =
        document.querySelector(
          '#urlInput'
        ).value.trim();
      
      if (
        url &&
        !/^https?:\/\//i.test(url)
      ) {
        url = 'https://' + url;
      }
      */
      const icon =
        document.querySelector(
          '#iconInput'
        ).value.trim();

      if (!name) {
        return;
      }

      const editingItem =
        editingId
          ? findItem(
            state.sites,
            editingId
          )
        : null;

      if (
        editingItem?.type !== 'folder' &&
        !/^https?:\/\//i.test(url)
      ) {
        toast(
          '网址请以 http:// 或 https:// 开头'
        );
        return;
      }

      /*
      if (
        !/^https?:\/\//i.test(url)
      ) {
        toast(
          '网址请以 http:// 或 https:// 开头'
        );

        return;
      }
      */

      if (editingId) {
        const item =
          findItem(
            state.sites,
            editingId);
        if (
          item &&
          item.type === 'folder'
        ) {
          item.name = name;
        } else if (
          item &&
          item.type === 'site'
        ) {
          item.name = name;
          item.url = url;
          item.icon = icon;
        }
      } else {
        const item =
          site(
            name,
            url,
            icon
          );
        
        if (window.editParentId) {
          const p =
            findItem(
              state.sites,
              window.editParentId
            );
          if (p?.type === 'folder') {
            p.children.push(
              item);
          } else {
            state.sites.push(
              item);
          }
        } else {
          state.sites.push(
            item
          );
        }
      }

      
      /*
      if (editingId) {
        const item =
          findItem(
            state.sites,
            editingId
          );

        if (
          item &&
          item.type === 'site'
        ) {
          item.name = name;
          item.url = url;
          item.icon = icon;
        }
      } else {
        const item =
          site(
            name,
            url,
            icon
          );

        if (window.editParentId) {
          const p =
            findItem(
              state.sites,
              window.editParentId
            );

          if (p?.type === 'folder') {
            p.children.push(
              item
            );
          } else {
            state.sites.push(
              item
            );
          }
        } else {
          state.sites.push(
            item
          );
        }
      }
      */

      save();

      dclose(
        'editorDialog'
      );

      render();

      if (currentCollectionId) {
        const f =
          findItem(
            state.sites,
            currentCollectionId
          );

        if (
          f?.type === 'folder'
        ) {
          renderCollectionItems(
            f
          );
        }
      }
    }
  );

document.querySelector(
  '#deleteBtn'
).onclick = () => {
  if (!editingId) {
    return;
  }

  removeItem(
    state.sites,
    editingId
  );

  save();

  dclose(
    'editorDialog'
  );

  render();

  const f =
    findItem(
      state.sites,
      currentCollectionId
    );

  if (
    f?.type === 'folder'
  ) {
    renderCollectionItems(
      f
    );
  }
};

function showContext(
  x,
  y,
  id
) {
  contextId = id;

  const m =
    document.querySelector(
      '#contextMenu'
    );

  m.classList.remove(
    'hidden'
  );

  const rect =
    m.getBoundingClientRect();

  const left =
    Math.min(
      x,
      innerWidth - rect.width - 8
    );

  const top =
    Math.min(
      y,
      innerHeight - rect.height - 8
    );

  m.style.left =
    Math.max(8, left) + 'px';

  m.style.top =
    Math.max(8, top) + 'px';
}

/*
function showContext(
  x,
  y,
  id
) {
  contextId = id;

  const m =
    document.querySelector(
      '#contextMenu'
    );

  m.classList.remove(
    'hidden'
  );

  m.style.left =
    Math.min(
      x,
      innerWidth - 160
    ) + 'px';

  m.style.top =
    Math.min(
      y,
      innerHeight - 100
    ) + 'px';
}
*/

function hideContext() {
  document.querySelector(
    '#contextMenu'
  ).classList.add(
    'hidden'
  );
}

document.querySelector(
  '#contextMenu'
).onclick = e => {
  const a =
    e.target.dataset.action;

  if (!a) {
    return;
  }

  const item =
    findItem(
      state.sites,
      contextId
    );

  hideContext();

  if (!item) {
    return;
  }

  if (
    a === 'open' &&
    item.type === 'site'
  ) {
    location.href = item.url;
  }

  if (
    a === 'newtab' &&
    item.type === 'site'
  ) {
    window.open(
      item.url,
      '_blank'
    );
  }

  if (a === 'edit') {
    openEditor(
      contextId
    );
  }

  if (a === 'delete') {
    removeItem(
      state.sites,
      contextId
    );

    save();
    render();
  }
};

/* 点击页面其他位置时自动关闭右键菜单 */
document.addEventListener('click', e => {
  if (
    !e.target.closest('#contextMenu')
  ) {
    hideContext();
  }
});

/*
document.querySelector(
  '#contextMenu'
).onclick = e => {
  const a =
    e.target.dataset.action;

  if (!a) {
    return;
  }

  hideContext();

  if (a === 'edit') {
    openEditor(
      contextId
    );
  }

  if (a === 'delete') {
    removeItem(
      state.sites,
      contextId
    );

    save();
    render();
  }
};
*/


document.addEventListener(
  'click',
  e => {
    if (
      !e.target.closest(
        '#contextMenu'
      )
    ) {
      hideContext();
    }
  }
);

function search(q) {
  q = q.trim();

  if (!q) {
    return;
  }

  addSearchHistory(q);

  if (
    /^https?:\/\//i.test(q)
  ) {
    location.href = q;
    return;
  }

  if (
    /^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(q)
  ) {
    location.href =
      'https://' + q;

    return;
  }

  location.href =
    ENGINES[state.engine].url +
    encodeURIComponent(q);
}

const searchInput =
  document.querySelector(
    '#search'
  );

searchInput.addEventListener(
  'focus',
  () => {
    renderSearchHistory();
  }
);

searchInput.addEventListener(
  'input',
  () => {
    renderSearchHistory(
      searchInput.value
    );
  }
);

searchInput.addEventListener(
  'keydown',
  e => {
    if (e.key === 'Enter') {
      search(
        searchInput.value
      );
    }
  }
);

/*搜索框添加搜索按钮*/
document.querySelector('#searchBtn').addEventListener('click', () => {
  search(searchInput.value);
});
/*搜索框添加搜索按钮*/

function engineIconUrl(key) {
  const domains = {
    google: 'google.com',
    bing: 'bing.com',
    duck: 'duckduckgo.com',
    baidu: 'baidu.com'
  };

  return `https://www.google.com/s2/favicons?sz=64&domain=${domains[key] || 'google.com'}`;
}

function renderEngines(){
  const icon=document.querySelector('#engineIcon');
  const input=document.querySelector('#search');
  const current=ENGINES[state.engine]||ENGINES.google;

  icon.src=engineIconUrl(state.engine);
  icon.alt=current.name;
  icon.title=current.name;

  input.placeholder=current.placeholder;
}

/*
function renderEngines() {
  const icon =
    document.querySelector(
      '#engineIcon'
    );

  const current =
    ENGINES[state.engine] ||
    ENGINES.google;

  icon.src =
    engineIconUrl(
      state.engine
    );

  icon.alt =
    current.name;

  icon.title =
    current.name;
}
*/

document
  .querySelector(
    '#engineBtn'
  )
  .addEventListener(
    'click',
    () => {
      const keys =
        Object.keys(
          ENGINES
        );

      const i =
        keys.indexOf(
          state.engine
        );

      state.engine =
        keys[
          (i + 1) % keys.length
        ];

      save();

      renderEngines();
    }
  );


/*日期显示为中文并显示农历*/

function tick(){
  const now=new Date();

  document.querySelector('#clock').textContent=
    now.toLocaleTimeString('zh-CN',{
      hour:'2-digit',
      minute:'2-digit',
      second:'2-digit'
    });

  const solar=Solar.fromYmd(
    now.getFullYear(),
    now.getMonth()+1,
    now.getDate()
  );

  const lunar=solar.getLunar();

  const lunarText=
    lunar.getMonthInChinese()+
    '月'+
    lunar.getDayInChinese();

  document.querySelector('#dateSolar').textContent=
    now.toLocaleDateString('zh-CN',{
      year:'numeric',
      month:'long',
      day:'numeric'
    });

  document.querySelector('#dateWeekday').textContent=
    now.toLocaleDateString('zh-CN',{
      weekday:'long'
    });

  document.querySelector('#dateLunar').textContent=
    '农历'+
    lunar.getYearInGanZhi()+
    '年'+
    lunarText;
}

/*
function tick(){
  const now=new Date();

  document.querySelector('#clock').textContent=
    now.toLocaleTimeString('zh-CN',{
      hour:'2-digit',
      minute:'2-digit',
      second:'2-digit'
    });

  const solar=Solar.fromYmd(
    now.getFullYear(),
    now.getMonth()+1,
    now.getDate()
  );

  const lunar=solar.getLunar();

  const lunarText=
    lunar.getMonthInChinese()+
    '月'+
    lunar.getDayInChinese();

  document.querySelector('#date').textContent=
    now.toLocaleDateString('zh-CN',{
      year:'numeric',
      month:'long',
      day:'numeric',
      weekday:'long'
    })+
    ' · 农历'+
    lunar.getYearInGanZhi()+
    '年'+
    lunarText;
}
*/
/*
function tick(){
  const now=new Date();

  document.querySelector('#clock').textContent=
    now.toLocaleTimeString('zh-CN',{
      hour:'2-digit',
      minute:'2-digit',
      second:'2-digit',
      hour12:false
    });

  document.querySelector('#date').textContent=
    now.toLocaleDateString('zh-CN',{
      year:'numeric',
      month:'long',
      day:'numeric',
      weekday:'long'
    });
}
*/
/*
function tick() {
  const d =
    new Date();

  document.querySelector(
    '#clock'
  ).textContent =
    d.toLocaleTimeString(
      'zh-CN',
      {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }
    );

  document.querySelector(
    '#date'
  ).textContent =
    d.toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }
    );
}
*/

function toast(t) {
  const x = document.querySelector('#toast');
  const openDialog = document.querySelector('dialog[open]');

  if (openDialog && x.parentElement !== openDialog) {
    openDialog.appendChild(x);
  }

  x.textContent = t;
  x.classList.add('show');

  clearTimeout(window.__toast);

  window.__toast = setTimeout(() => {
    x.classList.remove('show');

    if (x.parentElement !== document.body) {
      document.body.appendChild(x);
    }
  }, 1800);
}

function dclose(id) {
  const dialog =
    document.querySelector(
      '#' + id
    );

  if (!dialog) {
    return;
  }

  if (
  id === 'collectionDialog' &&
  dialog.open
) {
  dialog.classList.add(
    'closing'
  );

  setTimeout(() => {
    dialog.classList.remove(
      'closing'
    );

    dialog.close();

    currentCollectionCard?.classList.remove(
      'collection-source'
    );

    currentCollectionCard = null;
    currentCollectionId = null;
  }, 160);

  return;
}

  dialog.close();
}

document
  .querySelector('#collectionDialog')
  ?.addEventListener(
    'close',
    () => {
      currentCollectionCard?.classList.remove(
        'collection-source'
      );

      currentCollectionCard = null;
      currentCollectionId = null;
    }
  );


/*
document.querySelector(
  '#addBtn'
).onclick =
  () => openEditor();
*/
document.querySelector(
  '#settingsBtn'
).onclick = () => {
  document.querySelector(
    '#settingsEngine'
  ).innerHTML =
    Object.entries(
      ENGINES
    )
      .map(
        ([k, v]) =>
          `<option value="${k}">${v.name}</option>`
      )
      .join('');

  document.querySelector(
    '#settingsEngine'
  ).value =
    state.engine;

  document.querySelector(
    '#themeSelect'
  ).value =
    state.theme;

  document.querySelector(
    '#showDate'
  ).checked =
    state.showDate;

  document.querySelector(
    '#settingsDialog'
  ).showModal();
};

document
  .querySelector(
    '#settingsForm'
  )
  .addEventListener(
    'submit',
    e => {
      e.preventDefault();

      state.engine =
        document.querySelector(
          '#settingsEngine'
        ).value;

      state.theme =
        document.querySelector(
          '#themeSelect'
        ).value;

      state.showDate =
        document.querySelector(
          '#showDate'
        ).checked;

      save();

      document.querySelector(
        '#settingsDialog'
      ).close();

      render();
    }
  );

document.querySelector(
  '#exportBtn'
).onclick = () => {
  const blob =
    new Blob(
      [
        JSON.stringify(
          state,
          null,
          2
        )
      ],
      {
        type: 'application/json'
      }
    );

  const a =
    document.createElement(
      'a'
    );

  a.href =
    URL.createObjectURL(
      blob
    );

  a.download =
    'my-navigation-backup.json';

  a.click();

  URL.revokeObjectURL(
    a.href
  );

  toast(
    '已导出'
  );
};

document.querySelector(
  '#importBtn'
).onclick =
  () =>
    document.querySelector(
      '#importFile'
    ).click();

document.querySelector(
  '#importFile'
).onchange =
  async e => {
    const f =
      e.target.files[0];

    if (!f) {
      return;
    }

    try {
      state =
        sanitize(
          JSON.parse(
            await f.text()
          )
        );

      save();
      render();

      toast(
        '导入成功'
      );
    } catch {
      toast(
        'JSON 文件无效'
      );
    }

    e.target.value = '';
  };


document.querySelector(
  '#resetSitesBtn'
).onclick = () => {
  const ok =
    confirm(
      '确定恢复默认网站吗？\n\n当前网站、聚合和文件夹都会被替换。'
    );

  if (!ok) {
    return;
  }

  state.sites =
    defaultSites.map(
      i => site(
        i.name,
        i.url,
        i.icon
      )
    );

  save();
  render();

  toast(
    '已恢复默认网站'
  );
};


function renderCalendar() {

  const y =
  calendarDate.getFullYear();

const m =
  calendarDate.getMonth();

const today =
  new Date();

  const displayDate =
  selectedDate;

  /*
const displayDate =
  calendarHasNavigated
    ? new Date(y, m, 1)
    : today;
  */

  /*
  const y =
    calendarDate.getFullYear();

  const m =
    calendarDate.getMonth();

  const today =
    new Date();

  const selected =
    calendarDate;
  */

  /*
   * 左侧大日期
   */

  document.querySelector(
    '#calendarYearMonth'
  ).textContent =
    `${y}年${m + 1}月`;

  document.querySelector(
    '#calendarDay'
  ).textContent =
    displayDate.getDate();

  /*
   * 一年中的第几天
   */

  const startOfYear =
  new Date(
    displayDate.getFullYear(),
    0,
    1
  );

const startOfDisplayDate =
  new Date(
    displayDate.getFullYear(),
    displayDate.getMonth(),
    displayDate.getDate()
  );

const dayOfYear =
  Math.floor(
    (
      startOfDisplayDate -
      startOfYear
    ) / 86400000
  ) + 1;

  const isoDate =
  new Date(
    Date.UTC(
      displayDate.getFullYear(),
      displayDate.getMonth(),
      displayDate.getDate()
    )
  );

const isoDay =
  isoDate.getUTCDay() || 7;

isoDate.setUTCDate(
  isoDate.getUTCDate() +
  4 -
  isoDay
);

const isoYear =
  isoDate.getUTCFullYear();

const yearStart =
  new Date(
    Date.UTC(
      isoYear,
      0,
      1
    )
  );

const weekNumber =
  Math.ceil(
    (
      (
        isoDate -
        yearStart
      ) / 86400000 + 1
    ) / 7
  );

  document.querySelector(
    '#calendarWeekInfo'
  ).textContent =
    `第${dayOfYear}天 第${weekNumber}周`;

  /*
   * 农历
   */

  const lunar =
  getLunarText(displayDate);

  const weekday =
  displayDate.toLocaleDateString(
    'zh-CN',
    {
      weekday: 'long'
    }
  );

  document.querySelector(
    '#calendarLunar'
  ).textContent =
    `${lunar} ${weekday}`;

  /*
   * 右侧月份标题
   */

  document.querySelector(
    '#calendarTitle'
  ).textContent =
    `${y}年${m + 1}月`;

  /*
   * 日历主体
   */

  const box =
    document.querySelector(
      '#calendar'
    );

  box.innerHTML = '';

  [
    '一',
    '二',
    '三',
    '四',
    '五',
    '六',
    '日'
  ].forEach(
    x => {
      const d =
        document.createElement(
          'div'
        );

      d.className =
        'weekday';

      d.textContent =
        x;

      box.appendChild(d);
    }
  );

  /*
   * 当月第一天是星期几
   *
   * JS:
   * 0 = 日
   * 1 = 一
   * ...
   * 6 = 六
   *
   * 转换成：
   * 0 = 一
   * ...
   * 6 = 日
   */

  const first =
    (
      new Date(
        y,
        m,
        1
      ).getDay() + 6
    ) % 7;

  const days =
    new Date(
      y,
      m + 1,
      0
    ).getDate();

  const prev =
    new Date(
      y,
      m,
      0
    ).getDate();

  /*
   * 上个月末尾日期
   */

  for (
  let i = 0;
  i < first;
  i++
) {
  const d =
    document.createElement(
      'div'
    );

  d.className =
    'day other';

  const day =
    prev - first + i + 1;

  d.textContent =
    day;

  /*
   * 点击上个月日期
   */

  d.onclick = () => {
    calendarDate.setMonth(
      calendarDate.getMonth() - 1
    );

    selectedDate =
      new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth(),
        day
      );

    calendarHasNavigated =
      true;

    renderCalendar();
  };

  box.appendChild(d);
}

  /*
   * 当前月份
   */

  for (
  let day = 1;
  day <= days;
  day++
) {
  const d =
    document.createElement(
      'div'
    );

  d.className =
    'day';

  d.textContent =
    day;

  const thisDate =
    new Date(
      y,
      m,
      day
    );

    /*
 * 当前选中的日期
 */

if (
  thisDate.getFullYear() ===
    selectedDate.getFullYear() &&
  thisDate.getMonth() ===
    selectedDate.getMonth() &&
  thisDate.getDate() ===
    selectedDate.getDate()
) {
  d.classList.add(
    'selected'
  );
}

  /*
   * 点击日期
   */

  d.onclick = () => {
    selectedDate =
      new Date(
        thisDate
      );

    renderCalendar();
  };

  /*
   * 今天
   */

  if (
    day === today.getDate() &&
    m === today.getMonth() &&
    y === today.getFullYear()
  ) {
    d.classList.add(
      'today'
    );
  }

  box.appendChild(d);
}

  /*
   * 下个月开头日期
   */

  const totalCells =
    box.children.length;

  const remaining =
    (
      7 -
      (
        totalCells % 7
      )
    ) % 7;

  for (
  let day = 1;
  day <= remaining;
  day++
) {
  const d =
    document.createElement(
      'div'
    );

  d.className =
    'day other';

  d.textContent =
    day;

  /*
   * 点击下个月日期
   */

  d.onclick = () => {
    calendarDate.setMonth(
      calendarDate.getMonth() + 1
    );

    selectedDate =
      new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth(),
        day
      );

    calendarHasNavigated =
      true;

    renderCalendar();
  };

  box.appendChild(d);
}

  
}

function getLunarText(date) {
  try {
    const formatter =
      new Intl.DateTimeFormat(
        'zh-CN-u-ca-chinese',
        {
          month: 'long',
          day: 'numeric'
        }
      );

    const parts =
      formatter.formatToParts(date);

    const month =
      parts.find(
        p => p.type === 'month'
      )?.value || '';

    const day =
      parts.find(
        p => p.type === 'day'
      )?.value || '';

    const lunarDays = [
      '',
      '初一',
      '初二',
      '初三',
      '初四',
      '初五',
      '初六',
      '初七',
      '初八',
      '初九',
      '初十',
      '十一',
      '十二',
      '十三',
      '十四',
      '十五',
      '十六',
      '十七',
      '十八',
      '十九',
      '二十',
      '廿一',
      '廿二',
      '廿三',
      '廿四',
      '廿五',
      '廿六',
      '廿七',
      '廿八',
      '廿九',
      '三十'
    ];

    const dayText =
      lunarDays[
        Number(day)
      ] || day;

    return `${month}${dayText}`;
  } catch {
    return '';
  }
}

document.querySelector(
  '#calendarBtn'
).onclick = () => {
  calendarDate =
    new Date();

  calendarHasNavigated =
    false;

  selectedDate =
    new Date();

  renderCalendar();

  document.querySelector(
    '#calendarDialog'
  ).showModal();
};

document.querySelector(
  '#prevMonth'
).onclick = () => {
  calendarHasNavigated = true;

  calendarDate.setMonth(
    calendarDate.getMonth() - 1
  );

  selectedDate =
    new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      1
    );

  renderCalendar();
};

document.querySelector(
  '#nextMonth'
).onclick = () => {
  calendarHasNavigated = true;

  calendarDate.setMonth(
    calendarDate.getMonth() + 1
  );

  selectedDate =
    new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      1
    );

  renderCalendar();
};

/* 今天 */

document.querySelector(
  '#calendarToday'
).onclick = () => {
  calendarDate =
    new Date();

  calendarHasNavigated =
    false;

  selectedDate =
    new Date();

  renderCalendar();
};

document
  .querySelectorAll(
    '[data-close]'
  )
  .forEach(
    b =>
      b.onclick = () =>
        dclose(
          b.dataset.close
        )
  );

window.addEventListener(
  'keydown',
  e => {
    if (
      e.key === '/' &&
      ![
        'INPUT',
        'TEXTAREA'
      ].includes(
        document.activeElement.tagName
      )
    ) {
      e.preventDefault();
      searchInput.focus();
    }

    if (
      e.key === 'Escape'
    ) {
      hideContext();
    }
  }
);

matchMedia(
  '(prefers-color-scheme: dark)'
)
  .addEventListener?.(
    'change',
    applyTheme
  );

tick();

setInterval(
  tick,
  1000
);

render();
