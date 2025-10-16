import { loadModule } from '/js/module/moduleLoader.js';

/**
 * 加载tab4内容
 */
export async function xf_init() {
  await xf_loadTab4Content();
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/** 
 * 加载tab4内容
 */
export async function xf_loadTab4Content() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  await loadContent.xf_loadHtmlContentFromUrl('/page/tab4.html', document.getElementById('tab4')); // 加载tab4内容
}

