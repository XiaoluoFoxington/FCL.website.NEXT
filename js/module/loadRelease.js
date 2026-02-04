import { loadModule } from '/js/module/moduleLoader.js';

/**
 * 通用Release历史加载器
 * @param {string} repoFullName - 仓库全名（例如：'XiaoluoFoxington/FCL.website.NEXT'）
 * @param {string} targetElementId - 目标元素ID，用于插入加载的内容
 */
export async function loadReleaseHistory(repoFullName, targetElementId) {
  console.log('加载Release历史：', repoFullName, targetElementId);
  
  try {
    await fetchAndRenderReleases();
  } catch (error) {
    onError(error);
  }

  async function fetchAndRenderReleases() {
    try {
      if (!isValidRepoFullName(repoFullName)) {
        onError('仓库全名非法');
        return;
      }
      
      const containerElement = document.getElementById(targetElementId);
      if (!containerElement) {
        onError('目标元素不存在');
        return;
      }
      
      const releaseData = await getReleaseData(repoFullName);
      if (releaseData.length === 0) {
        onError('没有Release数据');
        return;
      }
      
      renderReleasesToContainer(releaseData, containerElement);
    } catch (error) {
      onError(error);
    }
  }

  /**
   * 渲染Release数据到容器
   * @param {Array} releases Release数据数组
   * @param {HTMLElement} container 渲染容器
   */
  function renderReleasesToContainer(releases, container) {
    container.innerHTML = '';

    const containerHaderStr = `
      <div class="mdui-panel-item-header mdui-ripple">
        <div class="mdui-panel-item-title">版本名称</div>
        <div class="mdui-panel-item-summary">版本Tag</div>
        <div class="mdui-panel-item-summary">发布时间</div>
        <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
      </div>
      <div class="mdui-panel-item-body mdui-typo">
        <p>我是表头~</p>
      </div>`;
    const containerHader = document.createElement('div');
    containerHader.classList.add('mdui-panel-item');
    containerHader.innerHTML = containerHaderStr;

    const panelContainer = document.createElement('div');
    panelContainer.id = 'release-panel-container';
    panelContainer.classList.add('mdui-panel');
    panelContainer.setAttribute('mdui-panel', '');
    
    // 使用DocumentFragment批量处理DOM操作
    const fragment = document.createDocumentFragment();
    
    releases.forEach((release, index) => {
      const panelHtml = `
        <div class="mdui-panel-item ${index === 0 ? 'mdui-panel-item-open' : ''}" id="release-panel-${index}">
          <div class="mdui-panel-item-header mdui-ripple">
            <div class="mdui-panel-item-title">${release.name || '未命名版本'}</div>
            <div class="mdui-panel-item-summary">${release.tag_name}</div>
            <div class="mdui-panel-item-summary">${new Date(release.published_at).toLocaleString()}</div>
            <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
          </div>
          <div class="mdui-panel-item-body">
            <div class="mdui-panel" mdui-panel>
              <div class="mdui-panel-item mdui-panel-item-open">
                <div class="mdui-panel-item-header mdui-ripple">
                  <div class="mdui-panel-item-title">内容</div>
                  <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
                </div>
                <div class="mdui-panel-item-body">
                  <div class="mdui-typo">
                    ${marked.parse(release.body || '无发布说明')}
                  </div>
                </div>
              </div>
            </div>
            <div class="mdui-panel" mdui-panel>
              <div class="mdui-panel-item">
                <div class="mdui-panel-item-header mdui-ripple">
                  <div class="mdui-panel-item-title">资源（${release.assets.length}）</div>
                  <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
                </div>
                <div class="mdui-panel-item-body">
                  <div class="mdui-typo">
                    ${renderReleasesAssets(release.assets)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;

      const panelElementWrapper = document.createElement('div');
      panelElementWrapper.innerHTML = panelHtml;
      
      fragment.appendChild(panelElementWrapper.firstElementChild);
    });
    
    panelContainer.appendChild(containerHader);
    panelContainer.appendChild(fragment);
    container.appendChild(panelContainer);

    mdui.mutation();
  }

  /**
   * 渲染Release资源
   * @param {Array} assets - Release资源数组
   * @returns {string} - 渲染后的HTML字符串
   */
  function renderReleasesAssets(assets) {
    if (assets.length === 0) {
      return '<div class="mdui-typo">无资源</div>';
    }
    
    return assets.map(asset => `
      <div class="mdui-table-fluid">
        <table class="mdui-table">
          <thead>
            <tr>
              <th colspan="2">${asset.name}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>大小</td>
              <td>${asset.size}字节</td>
            </tr>
            <tr>
              <td>校验</td>
              <td>${asset.digest}</td>
            </tr>
            <tr>
              <td>原始下载URL</td>
              <td><a href="${asset.browser_download_url}" target="_blank">${asset.browser_download_url}</a></td>
            </tr>
          </tbody>
        </table>
      </div>
      `).join('');
  }

  /**
   * 获取Release数据
   * @param {string} repoFullName - 仓库全名
   * @returns {Promise<Array>} - Release数据数组
   */
  async function getReleaseData(repoFullName) {
    const apiUrl = `https://api.github.com/repos/${repoFullName}/releases`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorMsg = {
          404: '404：找不到仓库',
          403: '403：API请求超限',
          500: '500：GH内部错误'
        }[response.status] || `${response.status}：${response.statusText}`;
      throw new Error(errorMsg);
    }
    
    const data = await response.json();
    return data;
  }

  /**
   * 检查仓库全名是否合法
   * @param {string} repoFullName - 仓库全名
   * @returns {boolean} - 是否合法
   */
  function isValidRepoFullName(repoFullName) {
    if (typeof repoFullName !== 'string') {
      return false;
    }
    
    const parts = repoFullName.split('/');
    if (parts.length !== 2) {
      return false;
    }
    
    const [owner, repo] = parts;
    return owner.trim() !== '' && repo.trim() !== '';
  }

  /**
   * 处理加载错误
   * @param {Error|string} e - 错误内容
   */
  function onError(e) {
    const errorMessage = typeof e === 'string' ? e : e.message;
    const fullErrorMessage = '加载Release历史：出错：' + errorMessage;
    
    // 打印详细错误日志
    if (e instanceof Error) {
      console.error(fullErrorMessage, e);
    } else {
      console.error(fullErrorMessage);
    }
    
    const containerElement = document.getElementById(targetElementId);
    if (containerElement) {
      containerElement.innerHTML = `
      <div class="mdui-panel" mdui-panel>
        <div class="mdui-panel-item mdui-panel-item-open" style="background-color: #ff000040;">
          <div class="mdui-panel-item-header mdui-ripple">
            <div>加载出错</div>
            <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
          </div>
          <div class="mdui-panel-item-body mdui-typo">
            <p>${fullErrorMessage}</p>
          </div>
        </div>
      </div>`;
      mdui.mutation();
    }
  }
  
}