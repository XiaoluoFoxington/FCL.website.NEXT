import { loadModule } from '/js/module/moduleLoader.js';

/**
 * 加载tab1内容并初始化
 */
export async function xf_init() {
  console.log('xf_init()');
  await xf_loadTab1Content(); // 加载tab1内容
  xf_addEventListeners(); // 添加事件监听
}

/**
 * 添加事件监听
 */
export function xf_addEventListeners() {
  document.getElementById('loadIntroFclBtn').addEventListener('click', xf_loadIntroFclBtn_Click);
}

/**
 * 加载“介绍FCL”按钮的click
 */
export async function xf_loadIntroFclBtn_Click() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  loadContent.xf_loadHtmlContentFromUrl('/page/introFcl.html', document.getElementById('introFcl')); // 加载introFcl内容
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/** 
 * 加载tab1内容
 */
export async function xf_loadTab1Content() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  await loadContent.xf_loadHtmlContentFromUrl('/page/tab1.html', document.getElementById('tab1')); // 加载tab1内容
}