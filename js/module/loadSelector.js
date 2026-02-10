import { loadModule } from '/js/module/moduleLoader.js';

/**
 * 通用级联选择器
 * @param {Object} options - 配置选项
 * @param {string} options.containerId - 选择器容器的 ID
 * @param {string|Array} options.dataSource - 初始数据源（URL 或数组）
 * @param {string} options.sourceApiVer - 初始数据源的API Ver
 * @param {boolean} options.disableDebounce - 是否禁用下载按钮点击防抖
 * @param {number} options.debounceDelay - 防抖延迟时间（秒）
 * @param {Function} [options.onCreateSelectElement] - 创建选择元素的回调函数
 * @param {Function} [options.onCreateDescriptionElement] - 创建描述元素的回调函数
 * @param {Function} [options.onCreateDownloadElement] - 创建下载元素的回调函数
 * @param {Function} [options.onItemSelect] - 选择项时的回调函数
 * @param {Function} [options.onDownload] - 下载时的回调函数
 * @param {Function} [options.onRenderError] - 渲染错误时的回调函数
 * @param {Function} [options.onLevelChange] - 层级变化时的回调函数
 */
export async function loadSelector(options) {
  const {
    containerId,
    dataSource,
    sourceApiVer,
    disableDebounce = false,
    debounceDelay = 10,
    onCreateSelectElement = defaultCreateSelectElement,
    onCreateDescriptionElement = defaultCreateDescriptionElement,
    onCreateDownloadElement = defaultCreateDownloadElement,
    onItemSelect,
    onDownload,
    onRenderError = defaultRenderError,
    onLevelChange,
  } = options;

  let rootDataTransform = sourceApiVer;

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
    const loadContent = await loadModule('/js/module/loadContent.js');
    const transformApiData = await loadModule('/js/module/transformApiData.js');

    console.log(`选择器模块：加载层级 ${level}：`, source);
    clearLevelElements(level);

    try {
      const Sourceitems = await loadContent.fetchItems(source);
      const items = await transformApiData.transformDataIfNecessary(Sourceitems, rootDataTransform, container);
      rootDataTransform = undefined;

      validateItems(items); 

      // 检查当前数据是否为最底层
      const isBottom = isBottomLevel(items);

      console.log(`选择器模块：层级 ${level} 是否为最底层：`, isBottom);

      if (isBottom) {
        renderDownloadButtons(items, level);

        // 启用所有选择框
        enableAllSelects();
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
   * @returns {boolean} 是否验证通过
   */
  function validateItems(items) {
    if (!Array.isArray(items)) {
      console.warn('选择器模块：验证数据格式：数据不是数组');
      return false;
    }
    return true;
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
  async function addSelectEventListeners(select, items, level, descDiv) {

    select.addEventListener('change', async () => {
      // 禁用所有选择框
      disableAllSelects();

      const loadContent = await loadModule('/js/module/loadContent.js');
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
        bottomEnableAllSelects(items, selectedIndex);
      }
      if (selectedItem.desUrl) {
        const content = await loadContent.fetchItems(selectedItem.desUrl, 'text');
        descDiv.innerHTML = content;
        if (selectedItem.desJsUrl) {
          const scriptEl = document.createElement('script');
          scriptEl.src = selectedItem.desJsUrl;
          descDiv.appendChild(scriptEl);
        }
        bottomEnableAllSelects(items, selectedIndex);
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
   * 判断是否为最底层并根据情况启用所有选择框
   * @param {Array} items - 当前层级的选项列表
   * @param {number} selectedIndex - 当前选中项的索引
   */
  function bottomEnableAllSelects(items, selectedIndex) {
    if (isBottomLevel(items[selectedIndex])) {
      enableAllSelects();
    }
  }

  /**
   * 处理项目选择后的数据加载
   * @param {Object} selectedItem - 选中的项目
   * @param {number} nextLevel - 下一级层级
   * @param {HTMLDivElement} descDiv - 描述区域元素
   */
  async function handleItemSelection(selectedItem, nextLevel, descDiv) {
    const loadContent = await loadModule('/js/module/loadContent.js');
    const transformApiData = await loadModule('/js/module/transformApiData.js');

    const { children, nextUrl, url, items: itemArray, apiVer, random } = selectedItem;

    // 优先处理 children 数据，其次处理 nextUrl
    if (children && Array.isArray(children)) {
      console.log(`选择器模块：${selectedItem.name}：有children`);
      const transformedData = await transformApiData.transformDataIfNecessary(children, apiVer, container, random);
      loadLevel(transformedData, nextLevel);
    } else if (nextUrl) {
      console.log(`选择器模块：${selectedItem.name}：有nextUrl`);
      try {
        const rawData = await loadContent.fetchItems(nextUrl);
        const transformedData = await transformApiData.transformDataIfNecessary(rawData, apiVer, container, random);
        loadLevel(transformedData, nextLevel);
      } catch (error) {
        console.error(`选择器模块：加载层级 ${nextLevel}：获取数据出错：`, error);
        onRenderError(error.message, nextLevel, container);
      }
    } else if (itemArray && Array.isArray(itemArray)) {
      // 当前项包含多个下载项
      console.log(`选择器模块：层级处理多个下载项：`, selectedItem);
      renderDownloadButtons(itemArray, nextLevel);
    } else if (url) {
      // 处理单个下载项
      console.log(`选择器模块：层级处理单个下载项：`, selectedItem);
      renderDownloadButtons([selectedItem], nextLevel);
    } else {
      // 没有下级数据时的处理
      if (!selectedItem.description && !selectedItem.desUrl) {
        descDiv.innerHTML = '<div class="mdui-typo"><p>此层级既无下一级数据，也无描述信息。</p></div>';
      }
      clearLevelElements(nextLevel);
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

    enableAllSelects();
  }


  /**
   * 禁用全部下拉选择框
   */
  function disableAllSelects() {
    console.log('选择器模块：禁用全部下拉选择框');
    const selects = container.querySelectorAll('select');
    selects.forEach(select => {
      select.disabled = true;
    });
  }

  /**
   * 启用全部下拉选择框
   */
  function enableAllSelects() {
    console.log('选择器模块：启用全部下拉选择框');
    const selects = container.querySelectorAll('select');
    selects.forEach(select => {
      select.disabled = false;
    });
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
      displayName = "通用 架构";
    }

    const originalText = `${displayName}`;
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
    enableAllSelects();
    clearLevelElements(level);
    const errorEl = document.createElement('div');
    errorEl.style.color = '#f00';
    errorEl.textContent = `出错：${message}`;
    container.appendChild(errorEl);
  }

}
