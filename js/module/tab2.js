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
    // 清除当前层级及之后的所有元素（每级包含 select + description）
    while (selectorsContainer.children.length > level * 2) {
      selectorsContainer.removeChild(selectorsContainer.lastChild);
    }
    downloadDiv.style.display = 'none';

    let items;
    try {
      if (typeof source === 'string') {
        // 如果 source 是 URL，发起请求
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        items = await response.json();
      } else {
        // 如果 source 是直接的数据，直接使用
        items = source;
      }

      if (!Array.isArray(items)) {
        throw new Error('返回数据不是数组');
      }

      // 检查当前数据是否为最底层（所有项目都包含url字段）
      const isBottomLevel = items.every(item => item.url);

      if (isBottomLevel) {
        // 如果是底层，直接渲染下载按钮（在当前层级位置）
        renderDownloadButtons(items, level);
      } else {
        // 否则渲染选择框
        renderSelect(items, level);
      }
    } catch (error) {
      console.error(`tab2：加载选择器：层${level}：出错：`, error);
      const errorEl = document.createElement('div');
      errorEl.style.color = '#f00';
      errorEl.textContent = `出错：${error.message}`;
      selectorsContainer.appendChild(errorEl);
    }
  }

  /**
   * 渲染一个下拉选择框及其描述区域
   * @param {Array} items - 当前层级的选项列表
   * @param {number} level - 当前层级
   */
  function renderSelect(items, level) {
    // 创建下拉框
    const select = document.createElement('select');
    select.classList.add('mdui-select');
    select.classList.add('mdui-block');

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

    // 创建描述区域
    const descDiv = document.createElement('div');
    descDiv.className = 'description';
    // 初始为空

    // 监听选择变化
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
        descDiv.textContent = selectedItem.description;
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

    // 添加到容器
    selectorsContainer.appendChild(select);
    selectorsContainer.appendChild(descDiv);

    // 自动选择逻辑
    if (items.length > 0) {
      let autoSelectIndex;

      // 如果有默认选项，优先选择默认选项；否则选择第一项
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
  }

  /**
   * 渲染下载按钮列表
   * @param {Array} items - 包含下载信息的项目列表
   * @param {number} level - 当前层级（用于日志和清理）
   */
  function renderDownloadButtons(items, level) {
    console.log(`tab2：渲染下载按钮：层${level}：共${items.length}个按钮`);

    // 清除当前层级及之后的所有元素（每级包含 select + description）
    while (selectorsContainer.children.length > level * 2) {
      selectorsContainer.removeChild(selectorsContainer.lastChild);
    }

    // 创建一个容器来放置下载按钮
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'download-buttons-container';

    // 遍历所有可下载项并创建按钮
    items.forEach(item => {
      if (item.url) {
        // 创建单个下载链接
        const link = document.createElement('a');
        link.href = item.url;
        if (item.name === "all 架构") {
          link.textContent = `下载 通用架构`;
        } else {
          link.textContent = `下载 ${item.name || '文件'}`;
        }
        link.className = 'mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple';
        link.target = '_blank'; // 可选：在新标签页打开
        buttonsContainer.appendChild(link);
      }
    });

    // 添加到容器（在当前层级位置）
    selectorsContainer.appendChild(buttonsContainer);

    // 隐藏下载链接区域，因为我们已经在当前层级显示了按钮
    downloadDiv.style.display = 'none';
  }
}
