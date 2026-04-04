import utils from '/js/module/utils.js';
import sysInfoJs from '/js/module/sysInfo.js';
import loadContent from '/js/module/loadContent.js';
import loadSelector from '/js/module/loadSelector.js';
const defaultDataSource = '/data/down/root.json';
let sysInfoPanelEle;
let sysInfo;

/**
 * 加载tab2内容并初始化
 */
export async function xf_init() {
  await xf_loadTab2Content();
  xf_loadSysInfoPanelClass();
  xf_addEventListeners();
  xf_showSysInfo();
  xf_loadSelectors();
}

/**
 * 添加事件监听
 */
export function xf_addEventListeners() {
  sysInfoPanelEle.addEventListener('click', xf_sysInfoPanel_Click);
  document.getElementById('tsb2CustomDataSrcUseItem').addEventListener('click', xf_tsb2CustomDataSrcUseItem_Click, { once: true });
  document.getElementById('tsb2CustomDataSrcGuideItem').addEventListener('click', xf_tsb2CustomDataSrcGuideItem_Click, { once: true });
}

/**
 * 系统信息面板的click
 */
export function xf_sysInfoPanel_Click() {
  setTimeout(() => {
    xf_writeSysInfoPanelClass();
  }, 100); // 等待动画完成
}

/**
 * 自定义数据源使用第三方源的click
 */
export async function xf_tsb2CustomDataSrcUseItem_Click() {
  const customDataSrcUse = document.getElementById('tsb2CustomDataSrcUse');
  const customDataSrcUseHtml = await loadContent.fetchItems('/data/content/tsb2CustomDataSrcUse.html', 'text');
  const customDataSrcUseJs = document.createElement('script');
  customDataSrcUse.innerHTML = customDataSrcUseHtml;
  customDataSrcUseJs.src = '/data/content/tsb2CustomDataSrcUse.js';
  customDataSrcUseJs.type = 'module';
  customDataSrcUse.appendChild(customDataSrcUseJs);
  mdui.mutation();
}

/**
 * 自定义数据源开发接入指南的click
 */
export async function xf_tsb2CustomDataSrcGuideItem_Click() {
  const customDataSrcGuide = document.getElementById('tsb2CustomDataSrcGuide');
  customDataSrcGuide.innerHTML = await loadContent.fetchItems('/data/content/tsb2CustomDataSrcGuide.html', 'text');
  hljs.highlightAll();
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/** 
 * 加载tab2内容
 */
export async function xf_loadTab2Content() {
  await loadContent.xf_loadHtmlContentFromUrl('/page/tab2.html', document.getElementById('tab2')); // 加载tab2内容
  sysInfoPanelEle = document.getElementById('xf_sysInfoPanel');
  sysInfo = document.getElementById('xf_sysInfo');
}

/**
 * 读取保存的系统信息面板的class
 */
export async function xf_loadSysInfoPanelClass() {
  sysInfoPanelEle.className = utils.xf_readLocalStorage('xf_sysInfoPanelClass') || 'mdui-panel-item mdui-panel-item-open';
}

/**
 * 写入系统信息面板的class
 */
export async function xf_writeSysInfoPanelClass() {
  utils.xf_writeLocalStorage('xf_sysInfoPanelClass', sysInfoPanelEle.className);
}

/**
 * 展示系统信息
 */
export async function xf_showSysInfo() {
  sysInfoJs.show(sysInfo, document.getElementById('xf_uaInfo'));
}


/**
 * 加载选择器
 */
export async function xf_loadSelectors() {
  loadSelector.loadSelector({
    containerId: 'xf_selectors',
    dataSource: defaultDataSource,
  });
}