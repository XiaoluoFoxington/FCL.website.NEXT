import utils from '/js/module/utils.js';
import websiteInfo from '/js/module/websiteInfo.js';
import { xf_init as tab1Init } from '/js/module/tab1.js';
import { xf_init as tab2Init } from '/js/module/tab2.js';
import { xf_init as tab3Init } from '/js/module/tab3.js';
import { xf_init as tab4Init } from '/js/module/tab4.js';
import { xf_init as tab5Init } from '/js/module/tab5.js';

const _routeMap = {
  tab1: { init: tab1Init, title: '首页 - Fold Craft Launcher 下载站', index: 0 },
  tab2: { init: tab2Init, title: '下载 - Fold Craft Launcher 下载站', index: 1 },
  tab3: { init: tab3Init, title: '赞助 - Fold Craft Launcher 下载站', index: 3 },
  tab4: { init: tab4Init, title: '关于 - Fold Craft Launcher 下载站', index: 4 },
  tab5: { init: tab5Init, title: '详情 - Fold Craft Launcher 下载站', index: 2 },
};

const _defaultRoute = 'tab1';

const _loaded = {};
let _tabInstance = null;

window.addEventListener('hashchange', xf_handleHashChange);

document.addEventListener('DOMContentLoaded', async function () {
  xf_setThemeByLocalStorage(); // 根据本地存储设置主题
  xf_addEventListeners(); // 添加事件监听
  xf_initTabComponent(); // 初始化MDUI tab组件
  
  // 如果当前没有hash，自动跳转到默认tab
  if (!location.hash || !_routeMap[location.hash.slice(1)]) {
    location.hash = _defaultRoute;
  } else {
    xf_handleHashChange();
  }
  
  xf_loadWebsiteVisitCount(); // 获取访问量
  xf_loadWebsiteVerInfo(); // 加载网站版本信息
  await websiteInfo.xf_increaseUserVisitCount();
});

/**
 * 添加事件监听
 */
function xf_addEventListeners() {
  document.getElementById('xf_fclIcon').addEventListener('click', xf_xf_fclIcon_Click, { once: true });
  document.getElementById('xf_themeSwitchBtn').addEventListener('click', xf_themeSwitchBtn_Click);
  document.getElementById('xf_refreshBtn').addEventListener('click', xf_refreshBtn_Click);
  document.getElementById('xf_websiteInfoLink').addEventListener('click', xf_websiteInfoLink_Click);
  document.getElementById('easterEgg').addEventListener('click', openEasterEgg);
  
  // 重新绑定tab链接点击事件，因为MDUI会阻止默认的hash导航
  document.getElementById('tab1_link').addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = 'tab1';
  });
  document.getElementById('tab2_link').addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = 'tab2';
  });
  document.getElementById('tab3_link').addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = 'tab3';
  });
  document.getElementById('tab4_link').addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = 'tab4';
  });
  document.getElementById('tab5_link').addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = 'tab5';
  });
}

/**
 * 工具栏上的FCL图标的click
 */
function xf_xf_fclIcon_Click() {
  xf_loadWebsiteInfo(); // 加载网站信息
}

///////////////////////////////////////////////////////////////////////////////////////////////////
async function xf_themeSwitchBtn_Click() {
  const currentTheme = await xf_getCurrentTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  xf_setTheme(newTheme);
}

/**
 * 工具栏三点菜单中的刷新按钮的click
 */
function xf_refreshBtn_Click() {
  location.reload(true); // 刷新页面
}

/**
 * 工具栏三点菜单中的网站信息按钮的click
 */
function xf_websiteInfoLink_Click() {
  console.log('xf_websiteInfoLink_Click()');
  document.getElementById('xf_fclIcon').click();
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function xf_handleHashChange() {
  const name = location.hash.slice(1);

  // 如果是已知的tab路由，才进行处理
  if (_routeMap[name]) {
    const cfg = _routeMap[name];
    document.title = cfg.title;

    // 同步MDUI tab组件状态
    if (_tabInstance) {
      _tabInstance.show(cfg.index);
    }

    if (!_loaded[name]) {
      _loaded[name] = true;
      cfg.init();
    }
  }
  // 如果是其他hash（如页面内锚点），保持原样不处理
}

function xf_initTabComponent() {
  if (_tabInstance) {
    return; // 已经初始化过，直接返回
  }

  const tabElement = document.querySelector('.mdui-tab');
  if (tabElement) {
    _tabInstance = new mdui.Tab(tabElement);
  }
}

/**
 * 获取当前主题
 * @returns {string} - 当前主题，'dark'或'light'
 */
async function xf_getCurrentTheme() {
  const isDarkTheme = document.body.classList.value.includes('mdui-theme-layout-dark');
  const theme = isDarkTheme ? 'dark' : 'light';
  console.log('主题：当前主题：' + theme);
  return theme;
}

/**
 * 获取本地存储主题
 * @returns {string} - 本地存储中的主题，'dark'或'light'
 */
async function xf_getLocalStorageTheme() {
  const theme = utils.xf_readLocalStorage('theme') || 'dark';
  console.log('主题：本地存储中主题：' + theme);
  return theme;
}

/**
 * 设置主题
 * @param {string} theme - 要设置的主题，'dark'或'light'
 */
async function xf_setTheme(theme) {
  if (theme !== 'dark' && theme !== 'light') {
    console.error('主题：设置主题：参数错误');
    return;
  }
  const body = document.body;
  const icon = document.getElementById('xf_themeSwitchBtn_icon');
  const text = document.getElementById('xf_themeSwitchBtn_text');
  utils.xf_writeLocalStorage('theme', theme);
  console.log('主题：设置主题：' + theme);
  switch (theme) {
    case 'dark': {
      body.classList.remove('mdui-theme-layout.auto');
      body.classList.add('mdui-theme-layout-dark');
      icon.textContent = 'brightness_6';
      text.textContent = '切到浅色';
      break;
    }
    case 'light': {
      body.classList.remove('mdui-theme-layout-auto');
      body.classList.remove('mdui-theme-layout-dark');
      icon.textContent = 'brightness_2';
      text.textContent = '切到深色';
      break;
    }
  }
}

/**
 * 根据本地存储设置主题
 */
async function xf_setThemeByLocalStorage() {
  const localStorageTheme = await xf_getLocalStorageTheme();
  const currentTheme = await xf_getCurrentTheme();
  if (localStorageTheme !== currentTheme) {
    console.log('主题：载入本地存储主题：' + localStorageTheme);
    xf_setTheme(localStorageTheme);
  }
}

/**
 * 加载网站信息
 */
async function xf_loadWebsiteInfo() {
  websiteInfo.loadAll();
}

/**
 * 获取访问量
 */
function xf_loadWebsiteVisitCount() {
  const scriptElement = document.createElement('script');
  scriptElement.src = 'https://vercount.one/js';
  document.head.appendChild(scriptElement);
}

/**
 * 加载网站版本信息
 */
async function xf_loadWebsiteVerInfo() {
  const response = await fetch('/versionInfo.json');
  const data = await response.json();
  document.getElementById('xf_websiteVer_git').textContent = data.git;
}

/**
 * 彩蛋
*/
function openEasterEgg() {

  mdui.dialog({
    title: '',
    content: '<img src="/media/img/NEXT.FCL下载站-彩蛋.avif" alt="一只面带微笑的Q版拟人狐狸，白色外套，竖起大拇指，神情得意。">',
    buttons: [
      {
        text: '关闭'
      }],
    history: false
  });
}