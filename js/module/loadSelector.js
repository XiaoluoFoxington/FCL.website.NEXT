import { loadModule } from '/js/module/moduleLoader.js';
const loadContent = await loadModule('/js/module/loadContent.js');

/**
 * 通用级联选择器
 * @param {Object} options - 配置选项
 * @param {string} options.containerId - 选择器容器的 ID
 * @param {string|Array} options.dataSource - 初始数据源（URL 或数组）
 * @param {boolean} options.disableDebounce - 是否禁用下载按钮点击防抖
 * @param {number} options.debounceDelay - 防抖延迟时间（秒）
 * @param {Function} [options.onCreateSelectElement] - 创建选择元素的回调函数
 * @param {Function} [options.onCreateDescriptionElement] - 创建描述元素的回调函数
 * @param {Function} [options.onCreateDownloadElement] - 创建下载元素的回调函数
 * @param {Function} [options.onItemSelect] - 选择项时的回调函数
 * @param {Function} [options.onDownload] - 下载时的回调函数
 * @param {Function} [options.onRenderError] - 渲染错误时的回调函数
 * @param {Function} [options.onLevelChange] - 层级变化时的回调函数
 * @param {Function} [options.transformWay2oldApiData] - 转换“Way2old”版 API 数据的回调函数
 * @param {Function} [options.transformLemwoodApiData] - 转换“Lemwood”版 API 数据的回调函数
 * @param {Function} [options.transformLemwoodLatestApiData] - 转换“LemwoodLatest”版 API 数据的回调函数
 */
export function loadSelector(options) {
  const {
    containerId,
    dataSource,
    disableDebounce = false,
    debounceDelay = 10,
    onCreateSelectElement = defaultCreateSelectElement,
    onCreateDescriptionElement = defaultCreateDescriptionElement,
    onCreateDownloadElement = defaultCreateDownloadElement,
    onItemSelect,
    onDownload,
    onRenderError = defaultRenderError,
    onLevelChange,
    transformWay2oldApiData = defaultTransformWay2oldApiData,
    transformLemwoodApiData = defaultTransformLemwoodApiData,
    transformLemwoodLatestApiData = defaultTransformLemwoodLatestApiData,
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`选择器模块：找不到容器：${containerId}`);
    return;
  }

  // 初始加载根数据
  loadLevel(dataSource, 0);

  /**
   * 加载某一级的数据
   * @param {string|Array} source - JSON 数据的 URL 或直接的数组数据
   * @param {number} level - 当前层级（从 0 开始）
   */
  async function loadLevel(source, level) {
    console.log(`选择器模块：加载层级 ${level}：`, source);
    clearLevelElements(level);

    try {
      const items = await loadContent.fetchItems(source);
      validateItems(items);

      // 检查当前数据是否为最底层
      const isBottom = isBottomLevel(items);

      console.log(`选择器模块：层级 ${level} 是否为最底层：`, isBottom);

      if (isBottom) {
        renderDownloadButtons(items, level);
      } else {
        renderSelect(items, level);
      }
    } catch (error) {
      console.error(`选择器模块：加载层级 ${level} 出错：`, error);
      onRenderError(error.message, level, container);
    }
  }

  /**
   * 检查当前数据是否为最底层
   * @param {Array} items - 当前层级的选项列表
   * @returns {boolean} 是否为最底层
   */
  function isBottomLevel(items) {
    // 如果没有项目，则认为是底层
    if (!items || !Array.isArray(items) || items.length === 0) {
      return true;
    }
    
    // 检查是否有任何项目具有子项或下一URL
    return !items.some(item => {
      return (item.children && Array.isArray(item.children) && item.children.length > 0) ||
             (item.nextUrl && typeof item.nextUrl === 'string');
    });
  }

  /**
   * 清除指定层级及之后的所有元素
   * @param {number} level - 当前层级
   */
  function clearLevelElements(level) {
    // 移除当前层级及之后的所有元素
    while (container.children.length > level * 2) {
      container.removeChild(container.lastChild);
    }
  }

  /**
   * 验证数据格式
   * @param {*} items - 待验证的数据
   */
  function validateItems(items) {
    if (!Array.isArray(items)) {
      throw new Error('返回数据不是数组');
    }
  }

  /**
   * 渲染选择器
   * @param {Array} items - 当前层级的选项列表
   * @param {number} level - 当前层级
   */
  function renderSelect(items, level) {
    const select = onCreateSelectElement(items, level);
    const descDiv = onCreateDescriptionElement();

    addSelectEventListeners(select, items, level, descDiv);

    container.appendChild(select);
    container.appendChild(descDiv);

    // 自动选择默认选项
    autoSelectOption(select, items, level);
  }

  /**
   * 添加选择框事件监听器
   * @param {HTMLSelectElement} select - 选择框元素
   * @param {Array} items - 选项列表
   * @param {number} level - 当前层级
   * @param {HTMLDivElement} descDiv - 描述区域元素
   */
  function addSelectEventListeners(select, items, level, descDiv) {
    select.addEventListener('change', async () => {
      const selectedIndex = parseInt(select.value);
      descDiv.innerHTML = '';

      if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= items.length) {
        return;
      }

      const selectedItem = items[selectedIndex];
      console.log('选择器模块：当前选择项名称：' + selectedItem.name);

      // 显示描述
      if (selectedItem.description) {
        descDiv.innerHTML = selectedItem.description;
      }

      // 调用外部回调
      if (onItemSelect) {
        const result = onItemSelect(selectedItem, level);
        if (result) return; // 如果回调返回了结果，说明已经处理了，不再执行默认逻辑
      }

      // 处理数据加载逻辑
      await handleItemSelection(selectedItem, level + 1, descDiv);

      // 调用层级变化回调
      if (onLevelChange) {
        onLevelChange(level + 1);
      }
    });
  }

  /**
   * 处理项目选择后的数据加载
   * @param {Object} selectedItem - 选中的项目
   * @param {number} nextLevel - 下一级层级
   * @param {HTMLDivElement} descDiv - 描述区域元素
   */
  async function handleItemSelection(selectedItem, nextLevel, descDiv) {
    const { children, nextUrl, url, items: itemArray, apiVer } = selectedItem;

    // 优先处理 children 数据，其次处理 nextUrl
    if (children && Array.isArray(children)) {
      console.log(`选择器模块：${selectedItem.name}：有children`);
      const transformedData = transformDataIfNecessary(children, apiVer);
      loadLevel(transformedData, nextLevel);
    } else if (nextUrl) {
      console.log(`选择器模块：${selectedItem.name}：有nextUrl`);
      try {
        const rawData = await loadContent.fetchItems(nextUrl);
        const transformedData = transformDataIfNecessary(rawData, apiVer);
        loadLevel(transformedData, nextLevel);
      } catch (error) {
        console.error(`选择器模块：加载层级 ${nextLevel}：获取数据出错：`, error);
        onRenderError(error.message, nextLevel, container);
      }
    } else if (url) {
      // 处理单个下载项
      console.log(`选择器模块：层级处理单个下载项：`, selectedItem);
      renderDownloadButtons([selectedItem], nextLevel);
    } else if (itemArray && Array.isArray(itemArray)) {
      // 当前项包含多个下载项
      console.log(`选择器模块：层级处理多个下载项：`, selectedItem);
      renderDownloadButtons(itemArray, nextLevel);
    } else {
      // 没有下级数据时的处理
      if (!selectedItem.description) {
        descDiv.innerHTML = '<div class="mdui-typo"><p>此层级既无下一级数据，也无描述信息。</p></div>';
      }
      clearLevelElements(nextLevel);
    }
  }

  /**
   * 根据 apiVer 转换数据
   * @param {Array} data - 原始数据
   * @param {string} apiVer - API 版本
   * @returns {Array} 转换后的数据
   */
  async function transformDataIfNecessary(data, apiVer) {
    switch (apiVer) {
      case "Way2old":
        const latestWay2old = getWay2oldApiLatestVersion(data);
        return transformWay2oldApiData(data, latestWay2old);
      case "Lemwood":
        const latestLemwood = await getLemwoodApiLatestVersion();
        return transformLemwoodApiData(data, latestLemwood);
      case "LemwoodLatest":
        return transformLemwoodLatestApiData(data);
      default:
        return data;
    }
  }

  /**
   * 自动选择选项
   * @param {HTMLSelectElement} select - 选择框元素
   * @param {Array} items - 选项列表
   * @param {number} level - 当前层级
   */
  function autoSelectOption(select, items, level) {
    if (items.length === 0) return;

    // 查找默认选项或选择第一项
    const defaultIndex = items.findIndex(item => item.default === true);
    const autoSelectIndex = defaultIndex !== -1 ? defaultIndex : 0;

    console.log(`选择器模块：层级 ${level}：原始索引：${defaultIndex}`);
    console.log(`选择器模块：层级 ${level}：自动选择索引：${autoSelectIndex}`);

    select.value = autoSelectIndex.toString();

    // 手动触发 change 事件以加载下一级
    const event = new Event('change', { bubbles: true });
    select.dispatchEvent(event);
  }

  /**
   * 渲染下载按钮
   * @param {Array} items - 包含下载信息的项目列表
   * @param {number} level - 当前层级
   */
  function renderDownloadButtons(items, level) {
    console.log(`选择器模块：渲染下载按钮，数量：${items.length}`);

    clearLevelElements(level);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'download-buttons-container';

    items.forEach(item => {
      if (item.url) {
        // 根据 disableDebounce 决定是否传递倒计时延迟
        const delayToUse = disableDebounce ? 0 : debounceDelay;
        const link = onCreateDownloadElement(item, onDownload, delayToUse);
        buttonsContainer.appendChild(link);
      }
    });

    container.appendChild(buttonsContainer);
  }

  /**
   * 获取Way2old API最新版本
   * @param {Object} data - 原始数据
   * @returns {string} 最新版本名称
   */
  function getWay2oldApiLatestVersion(data) {
    console.log(`选择器模块：Way2old线：latest：${data.latest}`);
    return data.latest;
  }

  /**
   * 获取Lemwood API最新版本
   * @returns {string} 最新版本名称
   */
  async function getLemwoodApiLatestVersion() {
    // 获取选择器容器的第一个选择器（软件选择）的当前选中项的文本
    const firstSelect = container.firstElementChild;
    if (!firstSelect || !firstSelect.selectedOptions || firstSelect.selectedOptions.length === 0) {
      console.error('选择器模块：Lemwood线：无法获取第一个选择器的选中项');
      return null;
    }
    let selectName = firstSelect.selectedOptions[0].innerText;
    switch (selectName) {
      case 'Fold Craft Launcher':
        selectName = 'fcl';
        break;
      case 'Zalith Launcher':
        selectName = 'zl';
        break;
      case 'Zalith Launcher 2':
        selectName = 'zl2';
        break;
      case 'HMCL':
        selectName = 'hmcl';
        break;
      case 'Vulkan 驱动':
        selectName = 'FCL_Turnip';
        break;
      default:
        console.warn(`选择器模块：Lemwood线：未知选择器名称：${selectName}`);
        return null;
    }
    const latest = await loadContent.fetchItems(`https://mirror.lemwood.icu/api/latest/${selectName}`, 'text');
    console.log(`选择器模块：Lemwood线：latest：${latest}`);
    return latest;
  }

  // 默认实现函数
  function defaultCreateSelectElement(items, level) {
    const select = document.createElement('select');
    select.classList.add('mdui-select', 'mdui-block');

    // 使用 DocumentFragment 批量添加选项，减少 DOM 操作次数
    const fragment = document.createDocumentFragment();
    
    const groupOptions = {};

    items.forEach((item, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = item.name || '(无名称)';
      const groupName = item.type || '';
      if (!groupOptions[groupName]) {
        groupOptions[groupName] = [];
      }
      groupOptions[groupName].push(option);
    });// 把选项先分类存储在 groupOptions 对象中

    // 创建并添加分组选项
    for (const [groupName, options] of Object.entries(groupOptions)) {
      if(groupName) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = groupName;
        options.forEach(option => optgroup.appendChild(option));
        fragment.appendChild(optgroup);
      } else {
        options.forEach(option => fragment.appendChild(option));
      }
    }

    // 一次性将所有选项添加到 select 元素中
    select.appendChild(fragment);
    
    return select;
  }

  function defaultCreateDescriptionElement() {
    const descDiv = document.createElement('div');
    descDiv.className = 'description';
    return descDiv;
  }

  function defaultCreateDownloadElement(item, onDownload, debounceDelay) {
    const link = document.createElement('a');
    link.href = item.url;

    let displayName = item.name || '文件';
    if (displayName === "all 架构") {
      displayName = "通用架构";
    }

    const originalText = `下载 ${displayName}`;
    link.textContent = originalText;
    link.className = 'mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple';
    link.target = '_blank';
    
    // 存储原始文本和倒计时延迟时间
    link.dataset.originalText = originalText;
    link.dataset.debounceDelay = debounceDelay;
    
    // 处理点击事件
    const handleClick = (e) => {
      if (link.disabled) {
        e.preventDefault();
        return;
      }
      
      // 调用原始的 onDownload 回调
      if (onDownload) {
        onDownload(item, e);
      }
      
      // 开始倒计时
      startCountdown(link);
    };
    
    link.addEventListener('click', handleClick);
    
    return link;
  }
  
  /**
   * 开始下载按钮的倒计时
   * @param {HTMLAnchorElement} link - 下载按钮元素
   */
  function startCountdown(link) {
    const debounceDelay = parseInt(link.dataset.debounceDelay) || 3;
    
    // 如果 debounceDelay 为 0，则不执行倒计时
    if (debounceDelay <= 0) {
      return;
    }
    
    let remainingTime = debounceDelay;
    
    // 禁用按钮
    link.disabled = true;
    link.style.opacity = '0.5';
    link.style.cursor = 'not-allowed';
    
    // 更新按钮文本
    link.textContent = `请勿重复点击：${remainingTime}秒`;
    
    // 开始倒计时
    const timer = setInterval(() => {
      remainingTime--;
      
      if (remainingTime > 0) {
        link.textContent = `请勿重复点击：${remainingTime}秒`;
      } else {
        // 倒计时结束，恢复按钮
        clearInterval(timer);
        link.disabled = false;
        link.style.opacity = '1';
        link.style.cursor = 'pointer';
        link.textContent = link.dataset.originalText;
      }
    }, 1000);
  }

  /**
   * 创建一个防抖函数
   * @param {Function} func - 要执行的函数
   * @param {number} delay - 延迟时间（秒）
   * @returns {Function} 防抖处理后的函数
   */
  function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      const context = this;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(context, args), delay * 1000);
    };
  }

  function defaultRenderError(message, level, container) {
    const errorEl = document.createElement('div');
    errorEl.style.color = '#f00';
    errorEl.textContent = `出错：${message}`;
    container.appendChild(errorEl);
  }

  function defaultTransformWay2oldApiData(data, latest) {
    const result = [];
    const itemsToProcess = Array.isArray(data) ? data : (data.children || []);

    itemsToProcess.forEach(item => {
      if (item.type === "directory") {
        result.push({
          name: item.name,
          description: item.description || '',
          children: item.children ? defaultTransformWay2oldApiData(item.children, latest) : [],
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

  function defaultTransformLemwoodApiData(data, latest) {
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

  function defaultTransformLemwoodLatestApiData(data) {
    return defaultTransformLemwoodApiData([data]);
  }
}
