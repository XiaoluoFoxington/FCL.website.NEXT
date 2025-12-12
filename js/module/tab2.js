import { loadModule } from '/js/module/moduleLoader.js';
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
}

/**
 * 系统信息面板的click
 */
export function xf_sysInfoPanel_Click() {
  setTimeout(() => {
    xf_writeSysInfoPanelClass();
  }, 100); // 等待动画完成
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/** 
 * 加载tab2内容
 */
export async function xf_loadTab2Content() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  await loadContent.xf_loadHtmlContentFromUrl('/page/tab2.html', document.getElementById('tab2')); // 加载tab2内容
  sysInfoPanelEle = document.getElementById('xf_sysInfoPanel');
  sysInfo = document.getElementById('xf_sysInfo');
}

/**
 * 读取保存的系统信息面板的class
 */
export async function xf_loadSysInfoPanelClass() {
  const utils = await loadModule('/js/module/utils.js');
  sysInfoPanelEle.className = utils.xf_readLocalStorage('xf_sysInfoPanelClass') || 'mdui-panel-item mdui-panel-item-open';
}

/**
 * 写入系统信息面板的class
 */
export async function xf_writeSysInfoPanelClass() {
  const utils = await loadModule('/js/module/utils.js');
  utils.xf_writeLocalStorage('xf_sysInfoPanelClass', sysInfoPanelEle.className);
}

/**
 * 展示系统信息
 */
export async function xf_showSysInfo() {
  const sysInfoJs = await loadModule('/js/module/sysInfo.js');
  sysInfoJs.show(sysInfo);
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