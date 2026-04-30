import sysInfo from '/js/module/sysInfo.js';
import utils from '/js/module/utils.js';
import loadContent from '/js/module/loadContent.js';
import transformApiData from '/js/module/transformApiData.js';

export default class loadSelector {

  /**
   * 通用级联选择器
   * @param {Object} options - 配置选项
   * @param {string} options.containerId - 选择器容器的 ID
   * @param {string|Array} options.dataSource - 初始数据源（URL 或数组）
   * @param {string} options.sourceApiVer - 初始数据源的API Ver
   * @param {boolean} options.disableDebounce - 是否禁用下载按钮点击防抖
   * @param {number} options.debounceDelay - 防抖延迟时间（秒）
   * @param {string} [options.forceStopLoadBtnId] - 强行终止加载按钮的ID
   * @param {Function} [options.onCreateSelectElement] - 创建选择元素的回调函数
   * @param {Function} [options.onCreateDescriptionElement] - 创建描述元素的回调函数
   * @param {Function} [options.onCreateDownloadElement] - 创建下载元素的回调函数
   * @param {Function} [options.onItemSelect] - 选择项时的回调函数
   * @param {Function} [options.onDownload] - 下载时的回调函数
   * @param {Function} [options.onRenderError] - 渲染错误时的回调函数
   * @param {Function} [options.onLevelChange] - 层级变化时的回调函数
   */
  static async loadSelector(options) {
    const {
      containerId,
      dataSource,
      sourceApiVer,
      disableDebounce = false,
      debounceDelay = 10,
      forceStopLoadBtnId,
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

    const sysInfoa = sysInfo.detectSystemInfo();

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

      const buttonsContainerContainer = document.createElement('div');
      buttonsContainerContainer.classList.value = 'mdui-table-fluid';

      const buttonsContainer = document.createElement('table');
      buttonsContainer.classList.value = 'mdui-table download-buttons-container';
      buttonsContainerContainer.appendChild(buttonsContainer);

      // 创建临时tbody来收集所有行数据，用于分析列是否为空
      const tempBody = document.createElement('tbody');
      const rows = [];

      items.forEach(item => {
        if (item.url) {
          const delayToUse = disableDebounce ? 0 : debounceDelay;
          const row = onCreateDownloadElement(item, onDownload, delayToUse);
          rows.push(row);
          tempBody.appendChild(row);
        }
      });

      // 检查是否有匹配到系统架构的项（通过已渲染的行数据判断）
      const hasMatchedArch = rows.some(row => {
        const archCell = row.querySelector('.arch-cell');
        return archCell && archCell.style.color === 'rgb(0, 255, 0)';
      });

      // 如果匹配到系统架构，添加描述文本
      if (hasMatchedArch) {
        const matchDesc = defaultCreateDescriptionElement();
        matchDesc.textContent = '已匹配到当前架构，请注意架构列的绿色字段。';
        container.appendChild(matchDesc);
      }

      // 分析哪些列是空的
      const columnIndicesToKeep = [];
      const columnHeaders = ['操作', '架构', '描述', '大小', '显示名称', 'URL'];

      // 检查每一列是否全部为空
      for (let colIndex = 0; colIndex < 6; colIndex++) {
        let hasContent = false;

        for (const row of rows) {
          const cell = row.children[colIndex];
          if (cell) {
            const text = cell.textContent || cell.innerText || '';
            if (text.trim() !== '') {
              hasContent = true;
              break;
            }
          }
        }

        if (hasContent) {
          columnIndicesToKeep.push(colIndex);
        }
      }

      // 创建表头
      const buttonsContainerHead = document.createElement('thead');
      const headerRow = document.createElement('tr');

      columnIndicesToKeep.forEach(colIndex => {
        const th = document.createElement('th');
        th.textContent = columnHeaders[colIndex];
        headerRow.appendChild(th);
      });

      buttonsContainerHead.appendChild(headerRow);
      buttonsContainer.appendChild(buttonsContainerHead);

      // 创建正式tbody并添加处理后的行
      const buttonsContainerBody = document.createElement('tbody');
      buttonsContainer.appendChild(buttonsContainerBody);

      rows.forEach(row => {
        const newRow = document.createElement('tr');

        columnIndicesToKeep.forEach(colIndex => {
          const originalCell = row.children[colIndex];
          if (originalCell) {
            const newCell = originalCell.cloneNode(true);
            newRow.appendChild(newCell);
          }
        });

        buttonsContainerBody.appendChild(newRow);
      });

      container.appendChild(buttonsContainerContainer);
      mdui.mutation();

      enableAllSelects();
    }


    /**
     * 禁用全部下拉选择框和按钮
     */
    function disableAllSelects() {
      console.log('选择器模块：禁用全部下拉选择框和按钮');
      const selects = container.querySelectorAll('select');
      const buttons = container.querySelectorAll('a');

      selects.forEach(select => {
        select.disabled = true;
        select.classList.add('disabled');
      });
      buttons.forEach(button => {
        button.disabled = true;
        button.classList.add('disabled'); // 意义不明，虽然<a>没有disabled属性，但明明有样式，添加disabled属性后样式竟然没变。只好直接添加disabled类名了。
      });
      
      // 显示强行终止加载按钮
      if (forceStopLoadBtnId) {
        const forceStopBtn = document.getElementById(forceStopLoadBtnId);
        if (forceStopBtn) {
          forceStopBtn.classList.remove('xf-hide');
        }
      }
    }

    /**
     * 启用全部下拉选择框和按钮
     */
    function enableAllSelects() {
      console.log('选择器模块：启用全部下拉选择框和按钮');
      const selects = container.querySelectorAll('select');
      const buttons = container.querySelectorAll('a');

      selects.forEach(select => {
        select.disabled = false;
        select.classList.remove('disabled');
      });
      buttons.forEach(button => {
        button.disabled = false;
        button.classList.remove('disabled');
      });
      
      // 隐藏强行终止加载按钮
      if (forceStopLoadBtnId) {
        const forceStopBtn = document.getElementById(forceStopLoadBtnId);
        if (forceStopBtn) {
          forceStopBtn.classList.add('xf-hide');
        }
      }
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
        if (groupName) {
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
      const archMap = {
        'all': 'all',
        'arm64-v8a': 'arm64-v8a',
        'armeabi-v7a': 'armeabi-v7a',
        'x86_64': 'x86_64',
        'x86': 'x86'
      };

      const tr = document.createElement('tr');
      const tdOperation = document.createElement('td');
      const tdArch = document.createElement('td');
      const tdDes = document.createElement('td');
      const tdSize = document.createElement('td');
      const tdName = document.createElement('td');
      const tdUrl = document.createElement('td');

      const btnDl = document.createElement('a');
      btnDl.innerText = "下载";
      btnDl.href = item.url;
      btnDl.target = '_blank';
      btnDl.className = 'mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple';
      tdOperation.appendChild(btnDl);

      tdArch.innerText = item.arch || inferArchFromStr(item.url) || inferArchFromStr(item.name) || inferArchForZL(item.url) || '';
      tdArch.classList.add('arch-cell');

      function inferArchFromStr(str) {
        if (!str) return '';
        const key = Object.keys(archMap).find(k => str.includes(k));
        return archMap[key] || '';
      }

      function inferArchForZL(url) {
        // 如果链接中包含“ZalithLauncher”且没有匹配到archMap，返回all。
        if (url.includes('ZalithLauncher') && !Object.values(archMap).includes(url)) {
          return 'all';
        }
        return '';
      }

      if (tdArch.innerText === sysInfoa.matchedArch) {
        tdArch.style.color = '#00ff00';
      }

      tdDes.innerText = item.description || '';

      tdSize.innerText = utils.xf_formatBytes(item.size) || '';

      tdName.innerText = item.name || '';

      const tdUrlA = document.createElement('a');
      tdUrlA.innerText = item.url;
      tdUrlA.href = item.url;
      tdUrlA.target = '_blank';

      tdUrl.appendChild(tdUrlA);
      tdUrl.classList.value = 'mdui-typo';

      tr.appendChild(tdOperation);
      tr.appendChild(tdArch);
      tr.appendChild(tdDes);
      tr.appendChild(tdSize);
      tr.appendChild(tdName);
      tr.appendChild(tdUrl);

      // 存储原始文本和倒计时延迟时间
      btnDl.dataset.originalText = btnDl.innerText;
      btnDl.dataset.debounceDelay = debounceDelay;

      // 处理点击事件
      const handleClick = (e) => {
        if (btnDl.disabled) {
          e.preventDefault();
          return;
        }

        // 调用原始的 onDownload 回调
        if (onDownload) {
          onDownload(item, e);
        }

        // 开始倒计时
        startCountdown(btnDl);
      };

      btnDl.addEventListener('click', handleClick);

      return tr;
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
      return function (...args) {
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay * 1000);
      };
    }

    function defaultRenderError(message, level, container) {
      enableAllSelects();
      clearLevelElements(level);
      const errorEl = document.createElement('div');
      
      // 使用统一的错误处理函数
      const errorInfo = utils.xf_handleError(new Error(message), {
        defaultMessage: `出错：${message}`
      });
      
      errorEl.textContent = errorInfo.message;
      errorEl.style.color = errorInfo.color;
      
      container.appendChild(errorEl);
    }

  }
}