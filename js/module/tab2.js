import { loadModule } from '/js/module/moduleLoader.js';

/**
 * 加载tab2内容并初始化
 */
export async function xf_init() {
  await xf_loadTab2Content();
  xf_loadSelectors();
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/** 
 * 加载tab2内容
 */
export async function xf_loadTab2Content() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  await loadContent.xf_loadHtmlContentFromUrl('/page/tab2.html', document.getElementById('tab2')); // 加载tab2内容
}

/**
 * 加载选择器
 */
export function xf_loadSelectors() {
  // 获取 DOM 元素
  const selectorsContainer = document.getElementById('xf_selectors');
  const downloadDiv = document.getElementById('xf_download');
  const downloadLink = document.getElementById('xf_download_link');
  
  // 初始加载根数据
  loadLevel('/data/down/root.json', 0);
  
  /**
   * 加载某一级的数据
   * @param {string|Array} source - JSON 数据的 URL 或直接的数组数据
   * @param {number} level - 当前层级（从 0 开始）
   */
  async function loadLevel(source, level) {
    console.log(`tab2：加载选择器：层${level}：${source}`);
    clearLevelElements(level);
    downloadDiv.style.display = 'none';
    
    let items;
    try {
      items = await fetchItems(source);
      validateItems(items);
      
      // 检查当前数据是否为最底层（所有项目都包含url字段）
      const isBottomLevel = items.every(item => item.url);
      
      if (isBottomLevel) {
        renderDownloadButtons(items, level);
      } else {
        renderSelect(items, level);
      }
    } catch (error) {
      console.error(`tab2：加载选择器：层${level}：出错：`, error);
      renderError(error.message, level);
    }
  }
  
  /**
   * 清除指定层级及之后的所有元素
   * @param {number} level - 当前层级
   */
  function clearLevelElements(level) {
    while (selectorsContainer.children.length > level * 2) {
      selectorsContainer.removeChild(selectorsContainer.lastChild);
    }
  }
  
  /**
   * 获取数据
   * @param {string|Array} source - JSON 数据的 URL 或直接的数组数据
   * @returns {Promise<Array>} 数据数组
   */
  async function fetchItems(source) {
    if (typeof source === 'string') {
      // 如果 source 是 URL，发起请求
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } else {
      // 如果 source 是直接的数据，直接使用
      return source;
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
   * 渲染错误信息
   * @param {string} message - 错误信息
   * @param {number} level - 当前层级
   */
  function renderError(message, level) {
    const errorEl = document.createElement('div');
    errorEl.style.color = '#f00';
    errorEl.textContent = `出错：${message}`;
    selectorsContainer.appendChild(errorEl);
  }
  
  /**
   * 渲染一个下拉选择框及其描述区域
   * @param {Array} items - 当前层级的选项列表
   * @param {number} level - 当前层级
   */
  function renderSelect(items, level) {
    // 创建下拉框
    const select = createSelectElement(items, level);
    
    // 创建描述区域
    const descDiv = createDescriptionElement();
    
    // 添加事件监听器
    addSelectEventListeners(select, items, level, descDiv);
    
    // 添加到容器
    selectorsContainer.appendChild(select);
    selectorsContainer.appendChild(descDiv);
    
    // 自动选择逻辑
    autoSelectOption(select, items, level);
  }
  
  /**
   * 创建下拉选择框元素
   * @param {Array} items - 选项列表
   * @param {number} level - 当前层级
   * @returns {HTMLSelectElement} 选择框元素
   */
  function createSelectElement(items, level) {
    const select = document.createElement('select');
    select.classList.add('mdui-select', 'mdui-block');
    
    // 查找默认选项的索引
    let defaultIndex = -1;
    items.forEach((item, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = item.name || '(无名称)';
      
      // 检查是否有 default: true 字段
      if (item.default === true && defaultIndex === -1) {
        defaultIndex = index;
      }
      
      select.appendChild(option);
    });
    
    return select;
  }
  
  /**
   * 创建描述区域元素
   * @returns {HTMLDivElement} 描述区域元素
   */
  function createDescriptionElement() {
    const descDiv = document.createElement('div');
    descDiv.className = 'description';
    return descDiv;
  }
  
  /**
   * 为选择框添加事件监听器
   * @param {HTMLSelectElement} select - 选择框元素
   * @param {Array} items - 选项列表
   * @param {number} level - 当前层级
   * @param {HTMLDivElement} descDiv - 描述区域元素
   */
  function addSelectEventListeners(select, items, level, descDiv) {
    select.addEventListener('change', () => {
      const selectedIndex = parseInt(select.value); // 确保转换为整数
      descDiv.textContent = ''; // 先清空
      
      if (isNaN(selectedIndex) || selectedIndex < 0) {
        downloadDiv.style.display = 'none';
        return;
      }
      
      const selectedItem = items[selectedIndex];
      
      // 显示描述
      if (selectedItem.description) {
        descDiv.innerHTML = selectedItem.description;
      } else {
        descDiv.textContent = '';
      }
      
      // 优先处理 children 数据，其次处理 nextUrl
      if (selectedItem.children && Array.isArray(selectedItem.children)) {
        // 直接使用内联的 children 数据
        loadLevel(selectedItem.children, level + 1);
      } else if (selectedItem.nextUrl) {
        // 使用源逻辑加载 nextUrl
        loadLevel(selectedItem.nextUrl, level + 1);
      } else if (selectedItem.url) {
        // 处理单个下载项（当前项有URL）
        downloadLink.href = selectedItem.url;
        downloadLink.textContent = `下载 ${selectedItem.name}`;
        downloadDiv.style.display = 'block';
      } else if (selectedItem.items && Array.isArray(selectedItem.items)) {
        // 当前项包含多个下载项
        renderDownloadButtons(selectedItem.items, level + 1);
      } else {
        downloadDiv.style.display = 'none';
        console.warn(`tab2：加载选择器：层${level}：选项既无 children、nextUrl 也无 url 或 items:`);
      }
    });
  }
  
  /**
   * 自动选择选项
   * @param {HTMLSelectElement} select - 选择框元素
   * @param {Array} items - 选项列表
   * @param {number} level - 当前层级
   */
  function autoSelectOption(select, items, level) {
    if (items.length === 0) return;
    
    let autoSelectIndex;
    
    // 如果有默认选项，优先选择默认选项；否则选择第一项
    const defaultIndex = items.findIndex(item => item.default === true);
    if (defaultIndex !== -1) {
      autoSelectIndex = defaultIndex;
      console.log(`tab2：加载选择器：层${level}：找到默认选项，索引：${defaultIndex}`);
    } else {
      autoSelectIndex = 0;
      console.log(`tab2：加载选择器：层${level}：无默认选项，选择第一项，索引：0`);
    }
    
    select.value = autoSelectIndex.toString(); // 设置选中项
    
    // 手动触发 change 事件以加载下一级
    const event = new Event('change', { bubbles: true });
    select.dispatchEvent(event);
  }
  
  /**
   * 渲染下载按钮列表
   * @param {Array} items - 包含下载信息的项目列表
   * @param {number} level - 当前层级（用于日志和清理）
   */
  function renderDownloadButtons(items, level) {
    console.log(`tab2：渲染下载按钮：层${level}：共${items.length}个按钮`);
    
    clearLevelElements(level);
    
    // 创建一个容器来放置下载按钮
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'download-buttons-container';
    
    // 遍历所有可下载项并创建按钮
    items.forEach(item => {
      if (item.url) {
        const link = createDownloadLink(item);
        buttonsContainer.appendChild(link);
      }
    });
    
    // 添加到容器（在当前层级位置）
    selectorsContainer.appendChild(buttonsContainer);
    
    // 隐藏下载链接区域，因为已经在当前层级显示了按钮
    downloadDiv.style.display = 'none';
  }
  
  /**
   * 创建下载链接元素
   * @param {Object} item - 下载项信息
   * @returns {HTMLAnchorElement} 下载链接元素
   */
  function createDownloadLink(item) {
    const link = document.createElement('a');
    link.href = item.url;
    
    let displayName = item.name || '文件';
    if (displayName === "all 架构") {
      displayName = "通用架构";
    }
    
    link.textContent = `下载 ${displayName}`;
    link.className = 'mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple';
    link.target = '_blank';
    return link;
  }
}