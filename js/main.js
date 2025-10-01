var loadContent;

document.addEventListener('DOMContentLoaded', async function () {
  // 销毁提示
  xf_removeDownloadingTip();
  // 添加事件监听
  xf_addEventListeners();
  // 加载loadContent模块
  loadContent = await import('./modal/loadContent.js');
  // 加载tab1
  xf_loadTab1Content();
});

/**
 * 销毁“网页正在下载”提示
 */
function xf_removeDownloadingTip() {
  try {
    // 获取提示元素
    tipElement = document.getElementById('xf_downloadingTip');
    // 添加渐隐动画
    tipElement.classList.add('scale-out');
    // 等待动画结束
    tipElement.addEventListener('transitionend', () => {
      // 移除提示元素
      tipElement.remove();
    });
  } catch (e) {
    // 报错
    console.error('销毁“网页正在下载”提示：', e);
  }
}

/**
 * 添加事件监听
 */
function xf_addEventListeners() {
  document.getElementById('xf_fclIcon').addEventListener('click', () => {xf_loadWebsiteInfo();}, {once: true});
  document.getElementById('tab1-link').addEventListener('click', () => {xf_loadTab1Content();});
}

/**
 * 加载网站信息
 */
async function xf_loadWebsiteInfo() {
  const websiteInfo = await import('./modal/websiteInfo.js');
  websiteInfo.loadAll();
}

/**
 * 加载tab1内容
 */
function xf_loadTab1Content() {
  // 加载tab1内容
  loadContent.xf_loadHtmlContentFromUrl('/page/tab1.html', document.getElementById('tab1'));
}
