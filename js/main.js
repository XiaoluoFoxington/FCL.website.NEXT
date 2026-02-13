import { loadModule } from '/js/module/moduleLoader.js';

document.addEventListener('DOMContentLoaded', async function () {
  const tab1 = await loadModule('/js/module/tab1.js'); // 加载tab1模块
  xf_setThemeByLocalStorage(); // 根据本地存储设置主题
  xf_addEventListeners(); // 添加事件监听
  tab1.xf_init(); // 初始化tab1内容
  xf_loadWebsiteVisitCount(); // 获取访问量
  xf_loadWebsiteVerInfo(); // 加载网站版本信息
  xf_increaseUserVisitCount();
});

/**
 * 添加事件监听
 */
function xf_addEventListeners() {
  document.getElementById('xf_fclIcon').addEventListener('click', xf_xf_fclIcon_Click, {once: true});
  document.getElementById('tab1_link').addEventListener('click', xf_tab1_link_Click, { once: true });
  document.getElementById('tab2_link').addEventListener('click', xf_tab2_link_Click, { once: true });
  document.getElementById('tab3_link').addEventListener('click', xf_tab3_link_Click, { once: true });
  document.getElementById('tab4_link').addEventListener('click', xf_tab4_link_Click, { once: true });
  document.getElementById('tab5_link').addEventListener('click', xf_tab5_link_Click, { once: true });
  document.getElementById('xf_themeSwitchBtn').addEventListener('click', xf_themeSwitchBtn_Click);
  document.getElementById('xf_refreshBtn').addEventListener('click', xf_refreshBtn_Click);
  document.getElementById('xf_websiteInfoLink').addEventListener('click', xf_websiteInfoLink_Click);
}

/**
 * 工具栏上的FCL图标的click
 */
function xf_xf_fclIcon_Click() {
  xf_loadWebsiteInfo(); // 加载网站信息
}

/**
 * TAB栏上的tab1链接的click
 */
async function xf_tab1_link_Click() {
  const tab1 = await loadModule('/js/module/tab1.js')
  tab1.xf_init();
}

/**
 * TAB栏上的tab2链接的click
 */
async function xf_tab2_link_Click() {
  const tab2 = await loadModule('/js/module/tab2.js')
  tab2.xf_init();
}

/**
 * TAB栏上的tab3链接的click
 */
async function xf_tab3_link_Click() {
  const tab3 = await loadModule('/js/module/tab3.js')
  tab3.xf_init();
}

/**
 * TAB栏上的tab4链接的click
 */
async function xf_tab4_link_Click() {
  const tab4 = await loadModule('/js/module/tab4.js')
  tab4.xf_init();
}

/**
 * TAB栏上的tab5链接的click
 */
async function xf_tab5_link_Click() {
  const tab5 = await loadModule('/js/module/tab5.js')
  tab5.xf_init();
}

/**
 * 工具栏三点菜单中的主题切换按钮的click
 */
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
  const utils = await loadModule('/js/module/utils.js');
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
  const utils = await loadModule('/js/module/utils.js');
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
  const websiteInfo = await loadModule('/js/module/websiteInfo.js');
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
 * 获取用户访问次数
 * @returns {number} - 访问次数
 */
export async function xf_getUserVisitCount() {
  const utils = await loadModule('/js/module/utils.js');
  const visitCount = utils.xf_readLocalStorage('visitCount') || 0;
  const visitCountInt = parseInt(visitCount);
  console.log('用户访问次数：' + visitCountInt);
  return visitCountInt;
}

/**
 * 增加用户访问次数
 */
async function xf_increaseUserVisitCount() {
  const visitCountInt = await xf_getUserVisitCount();
  const utils = await loadModule('/js/module/utils.js');
  utils.xf_writeLocalStorage('visitCount', (visitCountInt + 1).toString());
}
