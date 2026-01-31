import { loadModule } from '/js/module/moduleLoader.js';

/**
 * 加载tab5内容并初始化
 */
export async function xf_init() {
  await xf_loadTab5Content();
  xf_addEventListeners();
}

/**
 * 添加事件监听
 */
export function xf_addEventListeners() {
  document.getElementById('tab5CustomRepoSubmit').addEventListener('click', xf_tab5CustomRepoSubmit_click);
  document.getElementById('tab5FclPanelEle').addEventListener('click', xf_tab5FclPanelEle_click, { once: true });
  document.getElementById('tab5ZlPanelEle').addEventListener('click', xf_tab5ZlPanelEle_click, { once: true });
  document.getElementById('tab5Zl2PanelEle').addEventListener('click', xf_tab5Zl2PanelEle_click, { once: true });
}

/**
 * 自定义仓库查询按钮的click
 */
export async function xf_tab5CustomRepoSubmit_click() {
  const loadRelease = await loadModule('/js/module/loadRelease.js');
  await loadRelease.loadReleaseHistory(document.getElementById('tab5CustomRepoInput').value, 'tab5CustomRepoResult');
}

/**
 * fcl面板的click
 */
export async function xf_tab5FclPanelEle_click() {
  const loadRelease = await loadModule('/js/module/loadRelease.js');
  await loadRelease.loadReleaseHistory('FCL-Team/FoldCraftLauncher', 'tab5Fcl');
}

/**
 * zl面板的click
 */
export async function xf_tab5ZlPanelEle_click() {
  const loadRelease = await loadModule('/js/module/loadRelease.js');
  await loadRelease.loadReleaseHistory('ZalithLauncher/ZalithLauncher', 'tab5Zl');
}

/**
 * zl2面板的click
 */
export async function xf_tab5Zl2PanelEle_click() {
  const loadRelease = await loadModule('/js/module/loadRelease.js');
  await loadRelease.loadReleaseHistory('ZalithLauncher/ZalithLauncher2', 'tab5Zl2');
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/** 
 * 加载tab5内容
 */
export async function xf_loadTab5Content() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  await loadContent.xf_loadHtmlContentFromUrl('/page/tab5.html', document.getElementById('tab5'));
}

