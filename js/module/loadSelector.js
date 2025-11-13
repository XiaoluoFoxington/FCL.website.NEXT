/**
 * 通用级联选择器
 * @param {Object} options - 配置选项
 * @param {string} options.containerId - 选择器容器的 ID
 * @param {string|Array} options.dataSource - 初始数据源（URL 或数组）
 * @param {Function} [options.onCreateSelectElement] - 创建选择元素的回调函数
 * @param {Function} [options.onCreateDescriptionElement] - 创建描述元素的回调函数
 * @param {Function} [options.onCreateDownloadElement] - 创建下载元素的回调函数
 * @param {Function} [options.onItemSelect] - 选择项时的回调函数
 * @param {Function} [options.onDownload] - 下载时的回调函数
 * @param {Function} [options.onRenderError] - 渲染错误时的回调函数
 * @param {Function} [options.onLevelChange] - 层级变化时的回调函数
 * @param {Function} [options.transformWay2oldApiData] - 转换“Way2old”版 API 数据的回调函数
 * @param {Function} [options.transformLemwoodApiData] - 转换“Lemwood”版 API 数据的回调函数
 */
export function loadSelector(options) {
  const {
    containerId,
    dataSource,
    onCreateSelectElement = defaultCreateSelectElement,
    onCreateDescriptionElement = defaultCreateDescriptionElement,
    onCreateDownloadElement = defaultCreateDownloadElement,
    onItemSelect,
    onDownload,
    onRenderError = defaultRenderError,
    onLevelChange,
    transformWay2oldApiData = defaulttransformWay2oldApiData,
    transformLemwoodApiData = defaultTransformLemwoodApiData,
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`选择器模块：找不到：${containerId}`);
    return;
  }

  // 初始加载根数据
  loadLevel(dataSource, 0);

  /*
（是时进入横杠，否则继续往下，横杠执行完成后不会继续往下）

当前层全部为url
- 渲染按钮
渲染选择器

存在children数组
- apiVer为Way2old
- - 调用函数转换
- - 加载一级
- apiVer为Lemwood
- - 调用函数转换
- - 加载一级
- 加载一级
存在nextUrl
- apiVer为Way2old
- - 调用函数转换
- - 加载一级
- apiVer为Lemwood
- - 调用函数转换
- - 加载一级
- 加载一级
存在url
- 渲染按钮
存在items数组
- 渲染按钮
显示提示
  */

  /**
   * 加载一级：加载某一级的数据
   * @param {string|Array} source - JSON 数据的 URL 或直接的数组数据
   * @param {number} level - 当前层级（从 0 开始）
   */
  async function loadLevel(source, level) {
    console.log(`选择器模块：加载一级：层${level}：`, source);
    clearLevelElements(level);

    try {
      const items = await fetchItems(source);
      validateItems(items);

      // 检查当前数据是否为最底层（所有项目都包含url字段）
      const isBottomLevel = items.every(item => item.url);

      console.log(`选择器模块：加载一级：层${level}：为最底层：`, isBottomLevel);

      if (isBottomLevel) {
        renderDownloadButtons(items, level);
      } else {
        renderSelect(items, level);
      }
    } catch (error) {
      console.error(`选择器模块：加载一级：层${level}：出错：`, error);
      onRenderError(error.message, level, container);
    }
  }

  /**
   * 清除指定层级及之后的所有元素
   * @param {number} level - 当前层级
   */
  function clearLevelElements(level) {
    while (container.children.length > level * 2) {
      container.removeChild(container.lastChild);
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
   * 渲染一个下拉选择框及其描述区域
   * @param {Array} items - 当前层级的选项列表
   * @param {number} level - 当前层级
   */
  function renderSelect(items, level) {
    // 创建下拉框
    const select = onCreateSelectElement(items, level);

    // 创建描述区域
    const descDiv = onCreateDescriptionElement();

    // 添加事件监听器
    addSelectEventListeners(select, items, level, descDiv);

    // 添加到容器
    container.appendChild(select);
    container.appendChild(descDiv);

    // 自动选择逻辑
    autoSelectOption(select, items, level);
  }

  /**
   * 添加监听器：为选择框添加事件监听器
   * @param {HTMLSelectElement} select - 选择框元素
   * @param {Array} items - 选项列表
   * @param {number} level - 当前层级
   * @param {HTMLDivElement} descDiv - 描述区域元素
   */
  function addSelectEventListeners(select, items, level, descDiv) {
    select.addEventListener('change', async () => {
      const selectedIndex = parseInt(select.value);
      descDiv.innerHTML = ''; // 先清空

      if (isNaN(selectedIndex) || selectedIndex < 0) {
        return;
      }

      const selectedItem = items[selectedIndex];
      console.log('选择器模块：添加监听器：当前选择项名称：' + selectedItem.name);

      // 显示描述
      if (selectedItem.description) {
        descDiv.innerHTML = selectedItem.description;
      }

      // 调用外部回调
      if (onItemSelect) {
        const result = onItemSelect(selectedItem, level);
        if (result) return; // 如果回调返回了结果，说明已经处理了，不再执行默认逻辑
      }

      const Way2old = "Way2old";
      const Lemwood = "Lemwood";

      // 优先处理 children 数据，其次处理 nextUrl
      if (selectedItem.children && Array.isArray(selectedItem.children)) {
        console.log(`选择器模块：添加监听器：${selectedItem.name}：有children`);
        // 检查是否存在 apiVer: "Way2old"
        if (selectedItem.apiVer === Way2old) {
          // 使用线路2旧版解析逻辑转换 children 数据
          const transformedChildren = transformWay2oldApiData(selectedItem.children);
          loadLevel(transformedChildren, level + 1);
        } else if (selectedItem.apiVer === Lemwood) {
          // 使用Lemwood解析逻辑转换 children 数据
          const transformedChildren = transformLemwoodApiData(selectedItem.children);
          loadLevel(transformedChildren, level + 1);
        } else {
          // 直接使用内联的 children 数据
          loadLevel(selectedItem.children, level + 1);
        }
      } else if (selectedItem.nextUrl) {
        console.log(`选择器模块：添加监听器：${selectedItem.name}：有nextUrl`);
        // 检查是否存在 apiVer: "Way2old"
        if (selectedItem.apiVer === Way2old) {
          // 获取线路2旧版 API 数据并转换
          try {
            const oldApiData = await fetchItems(selectedItem.nextUrl);
            const transformedData = transformWay2oldApiData(oldApiData);
            loadLevel(transformedData, level + 1);
          } catch (error) {
            console.error(`选择器模块：加载一级：层${level}：获取Way2old版数据：出错：`, error);
            onRenderError(error.message, level + 1, container);
          }
        } else if (selectedItem.apiVer === Lemwood) {
          // 获取Lemwood版 API 数据并转换
          try {
            const lemwoodApiData = await fetchItems(selectedItem.nextUrl);
            const transformedData = transformLemwoodApiData(lemwoodApiData);
            loadLevel(transformedData, level + 1);
          } catch (error) {
            console.error(`选择器模块：加载一级：层${level}：获取Lemwood版数据：出错：`, error);
            onRenderError(error.message, level + 1, container);
          }
        } else {
          // 使用源逻辑加载 nextUrl
          loadLevel(selectedItem.nextUrl, level + 1);
        }
      } else if (selectedItem.url) {
        // 处理单个下载项（当前项有URL）
        console.log(`选择器模块：添加监听器：层${level}：处理单个下载项（当前项有URL）：`, selectedItem);
        renderDownloadButtons([selectedItem], level + 1);
      } else if (selectedItem.items && Array.isArray(selectedItem.items)) {
        // 当前项包含多个下载项
        console.log(`选择器模块：添加监听器：层${level}：处理多个下载项（当前项有items）：`, selectedItem);
        renderDownloadButtons(selectedItem.items, level + 1);
      } else {
        if (!selectedItem.description) {
          descDiv.innerHTML = '<div class="mdui-typo"><p>此层级既无 nextUrl、children 下一层数据，也无 description 描述信息。</p></div>';
        }
        clearLevelElements(level + 1);
      }

      // 调用层级变化回调
      if (onLevelChange) {
        onLevelChange(level + 1);
      }
    });
  }

  /**
   * 自动选择
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
      console.log(`选择器模块：自动选择：层${level}：有默认选项：选择索引：${defaultIndex}`);
    } else {
      autoSelectIndex = 0;
      console.log(`选择器模块：自动选择：层${level}：无默认选项：选择索引：0`);
    }

    select.value = autoSelectIndex.toString();

    // 手动触发 change 事件以加载下一级
    const event = new Event('change', { bubbles: true });
    select.dispatchEvent(event);
  }

  /**
   * 渲染按钮：渲染下载按钮列表
   * @param {Array} items - 包含下载信息的项目列表
   * @param {number} level - 当前层级（用于日志和清理）
   */
  function renderDownloadButtons(items, level) {
    console.log(`选择器模块：渲染按钮：层${level}：按钮个数：${items.length}`);

    clearLevelElements(level);

    // 创建一个容器来放置下载按钮
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'download-buttons-container';

    // 遍历所有可下载项并创建按钮
    items.forEach(item => {
      if (item.url) {
        const link = onCreateDownloadElement(item, onDownload);
        buttonsContainer.appendChild(link);
      }
    });

    // 添加到容器（在当前层级位置）
    container.appendChild(buttonsContainer);
  }

  // 默认实现函数
  function defaultCreateSelectElement(items, level) {
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

  function defaultCreateDescriptionElement() {
    const descDiv = document.createElement('div');
    descDiv.className = 'description';
    return descDiv;
  }

  function defaultCreateDownloadElement(item, onDownload) {
    const link = document.createElement('a');
    link.href = item.url;

    let displayName = item.name || '文件';
    if (displayName === "all 架构") {
      displayName = "通用架构";
    }

    link.textContent = `下载 ${displayName}`;
    link.className = 'mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple';
    link.target = '_blank';

    if (onDownload) {
      link.addEventListener('click', (e) => {
        onDownload(item, e);
      });
    }

    return link;
  }

  function defaultRenderError(message, level, container) {
    const errorEl = document.createElement('div');
    errorEl.style.color = '#f00';
    errorEl.textContent = `出错：${message}`;
    container.appendChild(errorEl);
  }

  function defaulttransformWay2oldApiData(data) {
    const result = [];

    // 根对象通常包含 children，而数组直接是 children 内容
    const itemsToProcess = Array.isArray(data) ? data : (data.children || []);

    itemsToProcess.forEach(item => {
      if (item.type === "directory") {
        // 目录：转换为新版结构，保留 name, description, children
        const newItem = {
          name: item.name,
          description: item.description || '',
          // 递归转换子目录/文件
          children: item.children ? defaulttransformWay2oldApiData(item.children) : [],
        };
        result.push(newItem);
      } else if (item.type === "file") {
        // 文件：转换为新版结构，使用 download_link 作为 url
        const newItem = {
          name: item.arch + ' 架构',
          url: item.download_link,
          arch: item.arch || ''
        };
        result.push(newItem);
      } else {
        // 忽略未知类型的项
        console.warn("选择器模块：转换Way2old：忽略未知类型项：", item);
      }
    });

    return result;
  }

  function defaultTransformLemwoodApiData(data) {
    const result = [];

    // Lemwood API 数据是一个数组，每个元素代表一个版本
    data.forEach(item => {
      // 每个版本项转换为一个目录结构
      const versionItem = {
        name: item.name,
        // 将 assets 转换为 items 数组
        items: item.assets.map(asset => ({
          name: asset.name,
          url: asset.url,
          size: asset.size
        }))
      };
      result.push(versionItem);
    });

    return result;
  }

}