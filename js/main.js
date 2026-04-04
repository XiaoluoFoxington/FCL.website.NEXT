import utils from '/js/module/utils.js';
import websiteInfo from '/js/module/websiteInfo.js';
import { xf_init as tab1Init } from '/js/module/tab1.js';
import { xf_init as tab2Init } from '/js/module/tab2.js';
import { xf_init as tab3Init } from '/js/module/tab3.js';
import { xf_init as tab4Init } from '/js/module/tab4.js';
import { xf_init as tab5Init } from '/js/module/tab5.js';

document.addEventListener('DOMContentLoaded', async function () {
  xf_setThemeByLocalStorage(); // 根据本地存储设置主题
  xf_addEventListeners(); // 添加事件监听
  xf_addHashEventListeners();
  xf_loadHashContent();
  xf_loadWebsiteVisitCount(); // 获取访问量
  xf_loadWebsiteVerInfo(); // 加载网站版本信息
  await websiteInfo.xf_increaseUserVisitCount();
});

/**
 * 添加事件监听
 */
function xf_addEventListeners() {
  document.getElementById('xf_fclIcon').addEventListener('click', xf_xf_fclIcon_Click, { once: true });
  document.getElementById('tab1_link').addEventListener('click', xf_tab1_link_Click, { once: true });
  document.getElementById('tab2_link').addEventListener('click', xf_tab2_link_Click, { once: true });
  document.getElementById('tab3_link').addEventListener('click', xf_tab3_link_Click, { once: true });
  document.getElementById('tab4_link').addEventListener('click', xf_tab4_link_Click, { once: true });
  document.getElementById('tab5_link').addEventListener('click', xf_tab5_link_Click, { once: true });
  document.getElementById('xf_themeSwitchBtn').addEventListener('click', xf_themeSwitchBtn_Click);
  document.getElementById('xf_refreshBtn').addEventListener('click', xf_refreshBtn_Click);
  document.getElementById('xf_websiteInfoLink').addEventListener('click', xf_websiteInfoLink_Click);
  document.getElementById('easterEgg').addEventListener('click', openEasterEgg);
}

/**
 * 添加哈希事件
 */
function xf_addHashEventListeners() {
  document.getElementById('tab1_link').addEventListener('click', xf_tab1_link_Click_Hash);
  document.getElementById('tab2_link').addEventListener('click', xf_tab2_link_Click_Hash);
  document.getElementById('tab3_link').addEventListener('click', xf_tab3_link_Click_Hash);
  document.getElementById('tab4_link').addEventListener('click', xf_tab4_link_Click_Hash);
  document.getElementById('tab5_link').addEventListener('click', xf_tab5_link_Click_Hash);
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
  await tab1Init();
}

function xf_tab1_link_Click_Hash() {
  location.hash = '#tab1';
  document.title = '首页 - Fold Craft Launcher 下载站';
}

/**
/**
 * TAB栏上的tab2链接的click
 */
async function xf_tab2_link_Click() {
  await tab2Init();
}

function xf_tab2_link_Click_Hash() {
  location.hash = '#tab2';
  document.title = '下载 - Fold Craft Launcher 下载站';
}

/**
 * TAB栏上的tab3链接的click
 */
async function xf_tab3_link_Click() {
  await tab3Init();
}

function xf_tab3_link_Click_Hash() {
  location.hash = '#tab3';
  document.title = '赞助 - Fold Craft Launcher 下载站';
}

/**
 * TAB栏上的tab4链接的click
 */
async function xf_tab4_link_Click() {
  await tab4Init();
}

function xf_tab4_link_Click_Hash() {
  location.hash = '#tab4';
  document.title = '关于 - Fold Craft Launcher 下载站';
}

/**
 * TAB栏上的tab5链接的click
 */
async function xf_tab5_link_Click() {
  await tab5Init();
}

function xf_tab5_link_Click_Hash() {
  location.hash = '#tab5';
  document.title = '详情 - Fold Craft Launcher 下载站';
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
 * 获取地址栏hash参数并加载内容
 */
function xf_loadHashContent() {
  const hash = location.hash;
  switch (hash) {
    case '#tab1':
      xf_tab1_link_Click();
      xf_tab1_link_Click_Hash();
      break;
    case '#tab2':
      xf_tab2_link_Click();
      xf_tab2_link_Click_Hash();
      break;
    case '#tab3':
      xf_tab3_link_Click();
      xf_tab3_link_Click_Hash();
      break;
    case '#tab4':
      xf_tab4_link_Click();
      xf_tab4_link_Click_Hash();
      break;
    case '#tab5':
      xf_tab5_link_Click();
      xf_tab5_link_Click_Hash();
      break;
    default:
      xf_tab1_link_Click();
      xf_tab1_link_Click_Hash();
      break;
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