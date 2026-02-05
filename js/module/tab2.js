import { loadModule } from '/js/module/moduleLoader.js';
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
  document.getElementById('tsb2CustomDataSrcSubmit').addEventListener('click', xf_tsb2CustomDataSrcSubmit_Click);
  document.getElementById('tsb2CustomDataSrcReset').addEventListener('click', xf_tsb2CustomDataSrcReset_Click);
  document.getElementById('tsb2CustomDataSrcGuideItem').addEventListener('click', xf_tsb2CustomDataSrcGuideItem_Click);
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
 * 自定义数据源提交按钮的click
 */
export async function xf_tsb2CustomDataSrcSubmit_Click() {
  const customDataSrcInput = document.getElementById('tsb2CustomDataSrcInput');
  const loadSelector = await loadModule('/js/module/loadSelector.js');
  loadSelector.loadSelector({
    containerId: 'xf_selectors',
    dataSource: customDataSrcInput.value,
  });
}

/**
 * 自定义数据源还原默认按钮的click
 */
export function xf_tsb2CustomDataSrcReset_Click() {
  const customDataSrcInput = document.getElementById('tsb2CustomDataSrcInput');
  customDataSrcInput.value = defaultDataSource;
  xf_loadSelectors();
}

/**
 * 自定义数据源开发接入指南的click
 */
export async function xf_tsb2CustomDataSrcGuideItem_Click() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  const customDataSrcGuide = document.getElementById('tsb2CustomDataSrcGuide');
  customDataSrcGuide.innerHTML = await loadContent.fetchItems('/data/content/tsb2CustomDataSrcGuide.html', 'text');
  hljs.highlightAll();
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
    dataSource: defaultDataSource,
  });
}