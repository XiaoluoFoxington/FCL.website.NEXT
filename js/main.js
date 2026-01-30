import { loadModule } from '/js/module/moduleLoader.js';

document.addEventListener('DOMContentLoaded', async function () {
  const tab1 = await loadModule('/js/module/tab1.js'); // 加载tab1模块
  xf_addEventListeners(); // 添加事件监听
  tab1.xf_init(); // 初始化tab1内容
  xf_loadWebsiteVisitCount(); // 获取访问量
  xf_loadWebsiteVerInfo(); // 加载网站版本信息
});

/**
 * 添加事件监听
 */
function xf_addEventListeners() {
  document.getElementById('xf_fclIcon').addEventListener('click', xf_xf_fclIcon_Click, {once: true});
  document.getElementById('tab1_link').addEventListener('click', xf_tab1_link_Click);
  document.getElementById('tab2_link').addEventListener('click', xf_tab2_link_Click);
  document.getElementById('tab3_link').addEventListener('click', xf_tab3_link_Click);
  document.getElementById('tab4_link').addEventListener('click', xf_tab4_link_Click);
  document.getElementById('tab5_link').addEventListener('click', xf_tab5_link_Click);
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
