import { loadModule } from '/js/module/moduleLoader.js';

/**
 * 加载tab3内容
 */
export async function xf_init() {
  await xf_loadTab3Content();
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/** 
 * 加载tab3内容
 */
export async function xf_loadTab3Content() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  await loadContent.xf_loadHtmlContentFromUrl('/page/tab3.html', document.getElementById('tab3')); // 加载tab3内容
}

