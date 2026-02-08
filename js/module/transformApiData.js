import { loadModule } from '/js/module/moduleLoader.js';

  /**
   * 获取Way2old API最新版本
   * @param {Object} data - 原始数据
   * @param {Object} container - 选择器容器元素
   * @returns {string} 最新版本名称
   */
  export async function getWay2oldApiLatestVersion(data, container) {
    const loadContent = await loadModule('/js/module/loadContent.js');

    const repoMap = {
      'Fold Craft Launcher': 'FCL-Team/FoldCraftLauncher',
      'Zalith Launcher 2': 'ZalithLauncher/ZalithLauncher2',
    };

    console.log(`选择器模块：Way2Old线：latest：通过原始数据获取：${data.latest}`);

    const firstSelect = container.firstElementChild;
    if (!firstSelect || !firstSelect.selectedOptions || firstSelect.selectedOptions.length === 0) {
      console.error('选择器模块：Way2Old线：无法获取第一个选择器的选中项');
      return null;
    }
    let selectName = firstSelect.selectedOptions[0].innerText;
    selectName = repoMap[selectName] || selectName;
    const repoRelInfo = await loadContent.fetchItems(`https://api.github.com/repos/${selectName}/releases/latest`, 'json');
    const latest = repoRelInfo.tag_name;
    if (latest) {
      console.log(`选择器模块：Way2Old线：latest：通过GH获取成功，将忽略原始数据。`);
      console.log(`选择器模块：Way2Old线：latest：通过GH获取：${latest}`);
      return latest;
    } else {
      return data.latest;
    }

  }


/**
 * 获取Lemwood API最新版本
 * @param {Object} container - 选择器容器元素
 * @returns {string} 最新版本名称
 */
export async function getLemwoodApiLatestVersion(container) {
  const loadContent = await loadModule('/js/module/loadContent.js');

  const apiMap = {
    'Fold Craft Launcher': 'fcl',
    'Zalith Launcher': 'zl',
    'Zalith Launcher 2': 'zl2',
    'HMCL': 'hmcl',
    'Vulkan 驱动': 'FCL_Turnip',
    '渲染器': 'MG',
  };

  // 获取选择器容器的第一个选择器（软件选择）的当前选中项的文本
  const firstSelect = container.firstElementChild;
  if (!firstSelect || !firstSelect.selectedOptions || firstSelect.selectedOptions.length === 0) {
    console.warn('选择器模块：Lemwood线：无法获取第一个选择器的选中项');
    return null;
  }
  let selectName = firstSelect.selectedOptions[0].innerText;
  selectName = apiMap[selectName] || null;
  if (selectName === null) {
    console.warn('选择器模块：Lemwood线：latest：选择器的文本不在映射中');
    return null;
  }
  const latest = await loadContent.fetchItems(`https://mirror.lemwood.icu/api/latest/${selectName}`, 'text');
  console.log(`选择器模块：Lemwood线：latest：${latest}`);
  return latest;
}

/**
 * 转换Way2old API数据
 * @param {Object} data - 原始数据
 * @param {string} latest - 最新版本名称
 * @returns {Array} 转换后的数据
 */
export function transformWay2oldApiData(data, latest) {
  const result = [];
  const itemsToProcess = Array.isArray(data) ? data : (data.children || []);

  itemsToProcess.forEach(item => {
    if (item.type === "directory") {
      result.push({
        name: item.name,
        description: item.description || '',
        children: item.children ? transformWay2oldApiData(item.children, latest) : [],
        default: item.name === latest
      });
    } else if (item.type === "file") {
      result.push({
        name: item.arch + ' 架构',
        url: item.download_link,
        arch: item.arch || ''
      });
    } else {
      console.warn("选择器模块：转换Way2old：忽略未知类型项：", item);
    }
  });

  return result;
}

/**
 * 转换Lemwood API数据
 * @param {Object} data - 原始数据
 * @param {string} latest - 最新版本名称
 * @returns {Array} 转换后的数据
 */
export function transformLemwoodApiData(data, latest) {
  return data.map(item => ({
    name: item.name,
    default: item.name === latest,
    children: item.assets?.map(asset => ({
      name: asset.name,
      url: asset.url,
      size: asset.size
    })) || []
  }));
}

/**
 * 转换Lemwood（最有最新条目）API数据
 * @param {Object} data - 原始数据
 * @returns {Array} 转换后的数据
 */
export function transformLemwoodLatestApiData(data) {
  return transformLemwoodApiData([data]);
}
