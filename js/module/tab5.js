import { loadModule } from '/js/module/moduleLoader.js';

/**
 * 仓库配置数组
 */
export const repoConfig = [
  {
    id: 'Fcl',
    name: 'Fold Craft Launcher',
    repoFullName: 'FCL-Team/FoldCraftLauncher',
    containerId: 'tab5Fcl',
    panelId: 'tab5FclPanelEle'
  },
  {
    id: 'Zl',
    name: 'Zalith Launcher',
    repoFullName: 'ZalithLauncher/ZalithLauncher',
    containerId: 'tab5Zl',
    panelId: 'tab5ZlPanelEle'
  },
  {
    id: 'Zl2',
    name: 'Zalith Launcher 2',
    repoFullName: 'ZalithLauncher/ZalithLauncher2',
    containerId: 'tab5Zl2',
    panelId: 'tab5Zl2PanelEle'
  },
  {
    id: 'Pojav',
    name: 'Pojav Launcher',
    repoFullName: 'PojavLauncherTeam/PojavLauncher',
    containerId: 'tab5Pojav',
    panelId: 'tab5PojavPanelEle'
  },
  {
    id: 'Hmcl',
    name: 'HMCL',
    repoFullName: 'HMCL-dev/HMCL',
    containerId: 'tab5Hmcl',
    panelId: 'tab5HmclPanelEle'
  },
  {
    id: 'HmclPe',
    name: 'HMCL-PE',
    repoFullName: 'HMCL-dev/HMCL-PE',
    containerId: 'tab5HmclPe',
    panelId: 'tab5HmclPePanelEle'
  },
  {
    id: 'AmethystAndroid',
    name: 'Amethyst-Android',
    repoFullName: 'AngelAuraMC/Amethyst-Android',
    containerId: 'tab5AmethystAndroid',
    panelId: 'tab5AmethystAndroidPanelEle'
  },
  {
    id: 'Mg',
    name: 'MobileGlues',
    repoFullName: 'MobileGL-Dev/MobileGlues-release',
    containerId: 'tab5Mg',
    panelId: 'tab5MgPanelEle'
  }
];

/**
 * 加载tab5内容并初始化
 */
export async function xf_init() {
  await xf_loadTab5Content();
  await xf_generateRepoPanels();
  xf_addEventListeners();
}

/**
 * 添加事件监听
 */
export function xf_addEventListeners() {
  // 自定义仓库查询按钮
  document.getElementById('tab5CustomRepoSubmit').addEventListener('click', xf_tab5CustomRepoSubmit_click);
  
  // 为每个仓库面板添加事件监听
  repoConfig.forEach(config => {
    const panelElement = document.getElementById(config.panelId);
    if (panelElement) {
      panelElement.addEventListener('click', () => {
        xf_loadRepoRelease(config.repoFullName, config.containerId);
      }, { once: true });
    }
  });
}

/**
 * 自定义仓库查询按钮的click
 */
export async function xf_tab5CustomRepoSubmit_click() {
  const loadRelease = await loadModule('/js/module/loadRelease.js');
  await loadRelease.loadReleaseHistory(document.getElementById('tab5CustomRepoInput').value, 'tab5CustomRepoResult');
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 加载仓库Release信息
 */
export async function xf_loadRepoRelease(repoFullName, containerId) {
  const loadRelease = await loadModule('/js/module/loadRelease.js');
  await loadRelease.loadReleaseHistory(repoFullName, containerId);
}

/**
 * 动态生成仓库面板HTML
 */
export function xf_generateRepoPanels() {
  const panelContainer = document.getElementById('tab5RepoInfo');
  if (!panelContainer) return;
  
  // 为每个仓库生成面板
  repoConfig.forEach(config => {
    // 跳过FCL，因为它有特殊的注意事项面板
    if (config.id === 'Fcl') {
      return;
    }
    
    const panelHtml = `
      <div class="mdui-panel-item" id="${config.panelId}">
        <div class="mdui-panel-item-header mdui-ripple">
          <div>${config.name}</div>
          <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
        </div>
        <div class="mdui-panel-item-body" id="${config.containerId}">
          <div class="mdui-spinner"></div>
        </div>
      </div>
    `;
    
    panelContainer.insertAdjacentHTML('beforeend', panelHtml);
  });
}

/**
 * 加载tab5内容
 */
export async function xf_loadTab5Content() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  await loadContent.xf_loadHtmlContentFromUrl('/page/tab5.html', document.getElementById('tab5'));
}

