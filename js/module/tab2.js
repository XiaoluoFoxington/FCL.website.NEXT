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
  const downloadLink = document.getElementById('xf_download-link');

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

      renderSelect(items, level);
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

    items.forEach((item, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = item.name || '(无名称)';
      select.appendChild(option);
    });

    // 创建描述区域
    const descDiv = document.createElement('div');
    descDiv.className = 'description';
    // 初始为空

    // 监听选择变化
    select.addEventListener('change', () => {
      const selectedIndex = select.value;
      descDiv.textContent = ''; // 先清空

      if (selectedIndex === '') {
        downloadDiv.style.display = 'none';
        return;
      }

      const selectedItem = items[selectedIndex];

      // 显示描述
      if (selectedItem.description) {
        descDiv.textContent = selectedItem.description;
      } else {
        descDiv.textContent = '没有描述。';
      }

      // 优先处理 children 数据，其次处理 nextUrl
      if (selectedItem.children && Array.isArray(selectedItem.children)) {
        // 直接使用内联的 children 数据
        loadLevel(selectedItem.children, level + 1);
      } else if (selectedItem.nextUrl) {
        // 使用源逻辑加载 nextUrl
        loadLevel(selectedItem.nextUrl, level + 1);
      } else if (selectedItem.url) {
        // 处理下载
        downloadLink.href = selectedItem.url;
        downloadLink.textContent = `下载 ${selectedItem.name}`;
        downloadDiv.style.display = 'block';
      } else {
        downloadDiv.style.display = 'none';
        console.warn(`tab2：加载选择器：层${level}：选项既无 children、nextUrl 也无 url:`);
      }
    });

    // 添加到容器
    selectorsContainer.appendChild(select);
    selectorsContainer.appendChild(descDiv);
  }
}
