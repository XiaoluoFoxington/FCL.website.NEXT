import { loadModule } from '/js/module/moduleLoader.js';

/**
 * 加载tab2内容并初始化
 */
export async function xf_init() {
  await xf_loadTab2Content();
  xf_loadSelectors();
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/** 
 * 加载tab2内容
 */
export async function xf_loadTab2Content() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  await loadContent.xf_loadHtmlContentFromUrl('/page/tab2.html', document.getElementById('tab2')); // 加载tab2内容
}

/**
 * 加载选择器
 */
export async function xf_loadSelectors() {
  const loadSelector = await loadModule('/js/module/loadSelector.js');
  loadSelector.loadSelector({
    containerId: 'xf_selectors',
    dataSource: '/data/down/root.json',
  });
}