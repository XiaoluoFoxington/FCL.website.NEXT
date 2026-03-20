import { loadModule } from '/js/module/moduleLoader.js';
import { xf_escapeHtml } from './utils.js';


/**
 * 加载tab4内容
 */
export async function xf_init() {
  await xf_loadTab4Content();
  xf_addEventListeners();
  xf_loadTrafficInfo();
  const contributors = await getContributors();
  xf_generateContributors(contributors);
  xf_generateDownloadLines(contributors);
  const useProjects = await xf_getUseProjects();
  xf_generateUseProjects(useProjects);
}

/**
 * 添加事件监听
 */
export function xf_addEventListeners() {
  document.getElementById('xf_fclWay2BanInfo').addEventListener('click', xf_loadWay2BanInfo, { once: true });
  document.getElementById('xf_fclWay10BanInfo').addEventListener('click', xf_loadWay10BanInfo, { once: true });
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 加载线路2封禁信息
 */
export function xf_loadWay2BanInfo() {
  const container = document.getElementById('xf_fclWay2BanInfoBody');
  const apiUrl = 'https://mirror.frostlynx.work/api/blocks/export';
  container.innerHTML = '<div class="mdui-spinner"></div>';
  mdui.mutation();

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP错误: ${response.status}`);
      return response.text();
    })
    .then(text => {
      const lines = text.split(/\r?\n/);
      const items = []; // 存储 { ip, reason }
      let currentReason = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '') continue; // 跳过空行

        if (line.startsWith('#')) {
          // 注释行作为原因
          currentReason = line.substring(1).trim();
        } else if (currentReason !== null) {
          // 非注释行且有待配对的原因，作为IP
          items.push({
            ip: line,
            reason: currentReason
          });
          currentReason = null;
        }
        // 其他情况（非注释行但无待配对原因）忽略，防止格式错误
      }

      // 生成表格行
      let tbodyHtml = '';
      for (const item of items) {
        tbodyHtml += `
          <tr>
            <td>${xf_escapeHtml(item.ip)}</td>
            <td>${xf_escapeHtml(item.reason)}</td>
          </tr>
        `;
      }

      if (items.length === 0) {
        container.innerHTML = '<div class="mdui-typo">暂无数据</div>';
        return;
      }

      const tableHtml = `
        <div class="mdui-table-fluid">
          <table class="mdui-table">
            <thead>
              <tr>
                <th>IP</th>
                <th>原因</th>
              </tr>
            </thead>
            <tbody>
              ${tbodyHtml}
            </tbody>
          </table>
        </div>
      `;
      container.innerHTML = tableHtml;
    })
    .catch(error => {
      console.error('获取线路2封禁列表失败：', error);
      container.innerHTML = `<div class="mdui-typo" style="color: #f00;">出错：${xf_escapeHtml(error.message)}</div>`;
    });
}

/**
 * 加载线路10封禁信息
 */
export function xf_loadWay10BanInfo() {
  const container = document.getElementById('xf_fclWay10BanInfoBody');
  const apiUrl = 'https://mirror.lemwood.icu/download/banned_ips.txt';
  container.innerHTML = '<div class="mdui-spinner"></div>';
  mdui.mutation();

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(text => {
      const lines = text.split('\n');
      const rows = [];

      for (const line of lines) {
        const trimmed = line.trim();
        // 跳过空行和注释行
        if (trimmed === '' || trimmed.startsWith('#')) continue;

        // 按 " | " 分割，兼容空格情况
        const parts = trimmed.split('|').map(part => part.trim());
        if (parts.length >= 4) {
          rows.push({
            ip: parts[0],
            time: parts[1],
            reason: parts[2],
            traffic: parts[3]
          });
        }
      }

      if (rows.length === 0) {
        container.innerHTML = '<div class="mdui-typo">暂无数据</div>';
        return;
      }

      // 生成表格 HTML
      let tableHtml = `
        <div class="mdui-table-fluid">
          <table class="mdui-table">
            <thead>
              <tr>
                <th>IP</th>
                <th>原因</th>
                <th>当日流量(GB)</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
      `;

      for (const row of rows) {
        tableHtml += `
          <tr>
            <td>${xf_escapeHtml(row.ip)}</td>
            <td>${xf_escapeHtml(row.reason)}</td>
            <td>${xf_escapeHtml(row.traffic)}</td>
            <td>${xf_escapeHtml(row.time)}</td>
          </tr>
        `;
      }

      tableHtml += `
            </tbody>
          </table>
        </div>
      `;

      container.innerHTML = tableHtml;
    })
    .catch(error => {
      console.error('获取线路10封禁列表失败：', error);
      container.innerHTML = `<div class="mdui-typo" style="color: #f00;">出错：${xf_escapeHtml(error.message)}</div>`;
    });
}


/**
 * 获取所有线路流量信息
 */
export function xf_loadTrafficInfo() {
  xf_loadWay2TrafficInfo('https://mirror.frostlynx.work/stats');
}

/**
 * 获取线2流量信息
 * @param {string} url 流量信息API URL
 */
export async function xf_loadWay2TrafficInfo(url = '/data/content/way2Traffic.json') {
  const loadContent = await loadModule('/js/module/loadContent.js');

  const trafficEl = document.getElementById('xf_fclWay2Traffic');
  const totalEl = document.getElementById('xf_fclWay2Total');
  try {
    const apiData = await loadContent.fetchItems(url);
    trafficEl.textContent = apiData.total_gigabytes_transferred + 'GiB' || 'N/A';
    totalEl.textContent = apiData.total_downloads || 'N/A';
  } catch (error) {
    console.error('获取线2流量信息失败:', error);
    trafficEl.textContent = error.message;
    totalEl.textContent = error.message;
    return;
  }
}

/**
 * 获取贡献者数据
 * @returns {Array} 贡献者数组
 */
export async function getContributors() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  return await loadContent.fetchItems('/data/content/contributors.json');
}

/**
 * 获取所有线路信息
 * @param {Array} contributors 贡献者数组
 * @returns {Array} 线路数组
 */
export function getDownloadLines(contributors) {
  const lines = [];
  contributors.forEach(contributor => {
    if (contributor.lines && contributor.lines.length > 0) {
      contributor.lines.forEach(lineId => {
        lines.push({
          id: lineId,
          provider: contributor.name,
          providerId: contributor.id
        });
      });
    }
  });
  return lines.sort((a, b) => a.id - b.id);
};

/**
 * 动态生成贡献者HTML
 * @param {Array} contributors 贡献者数组
 */
export function xf_generateContributors(contributors) {
  const contributorsContainer = document.getElementById('contributorsPanel');
  if (!contributorsContainer) return;

  // 清空容器
  contributorsContainer.innerHTML = '';

  // 为每个贡献者生成面板
  contributors.forEach(contributor => {
    let linksHtml = '';

    // 生成链接
    if (contributor.github) {
      linksHtml += `<a href="https://github.com/${contributor.github}" target="_blank" class="mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple">GitHub</a>`;
    }
    if (contributor.bilibili) {
      linksHtml += `<a href="https://space.bilibili.com/${contributor.bilibili}" target="_blank" class="mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple">BiliBili</a>`;
    }
    if (contributor.qq) {
      linksHtml += `<a href="https://qm.qq.com/q/${contributor.qq}" target="_blank" class="mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple">QQ</a>`;
    }
    if (contributor.email) {
      linksHtml += `<a href="mailto:${contributor.email}" target="_blank" class="mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple">Email</a>`;
    }
    if (contributor.homepage) {
      linksHtml += `<a href="${contributor.homepage}" target="_blank" class="mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple">Homepage</a>`;
    }

    // 生成贡献列表
    const contributionsHtml = contributor.contributions.map(item => `<li>${item}</li>`).join('');

    // 生成贡献者面板
    const contributorHtml = `
      <a name="${contributor.id}"></a>
      <div class="mdui-panel-item mdui-panel-item-open">
        <div class="mdui-panel-item-header mdui-ripple">
          <div>${contributor.name}</div>
          <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
        </div>
        <div class="mdui-panel-item-body mdui-container-fluid">
          <div class="mdui-row">
            <div class="mdui-col-xs-12 mdui-col-sm-4">
              <div class="mdui-card">
                <div class="mdui-card-media">
                  <img src="${contributor.avatar}" loading="lazy"/>
                  <div class="mdui-card-media-covered">
                    <div class="mdui-card-primary">
                      <div class="mdui-card-primary-title">${contributor.name}</div>
                      ${contributor.id !== contributor.name ? `<div class="mdui-card-primary-subtitle">${contributor.id}</div>` : ''}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                ${linksHtml}
              </div>
            </div>
            <div class="mdui-typo mdui-col-xs-12 mdui-col-sm-8">
              <p>
              <ul>
                ${contributionsHtml}
              </ul>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    contributorsContainer.insertAdjacentHTML('beforeend', contributorHtml);
  });
}

/**
 * 动态生成线路对照表HTML
 * @param {Array} contributors 贡献者数组
 */
export function xf_generateDownloadLines(contributors) {
  const linesContainer = document.getElementById('downloadLinesTableBody');
  if (!linesContainer) return;

  // 清空容器
  linesContainer.innerHTML = '';

  // 获取线路信息
  const downloadLines = getDownloadLines(contributors);

  // 为每个线路生成行
  downloadLines.forEach(line => {
    const lineHtml = `
      <tr>
        <td>线路${line.id}</td>
        <td><a href="#${line.providerId}">${line.provider}</a></td>
      </tr>
    `;

    linesContainer.insertAdjacentHTML('beforeend', lineHtml);
  });
}

/** 
 * 加载tab4内容
 */
export async function xf_loadTab4Content() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  await loadContent.xf_loadHtmlContentFromUrl('/page/tab4.html', document.getElementById('tab4')); // 加载tab4内容
}

/**
 * 获取使用的开源项目数组
 * @returns {Promise<Array>} 使用的开源项目数组
 */
export async function xf_getUseProjects() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  return loadContent.fetchItems('/data/content/useProject.json');
}

/**
 * 动态生成使用的开源项目HTML
 * @param {Array} useProjects 使用的开源项目数组
 */
export function xf_generateUseProjects(useProjects) {
  const useProjectsContainer = document.getElementById('useProjectTableBody');
  if (!useProjectsContainer) return;

  // 清空容器
  useProjectsContainer.innerHTML = '';

  // 为每个项目生成行
  useProjects.forEach(project => {
    const projectHtml = `
      <tr>
        <td>${project.name}</td>
        <td>${project.description}</td>
        <td>${project.useDescription}</td>
        <td>${project.useVersion}</td>
        <td><a href="${project.link}" target="_blank">${project.link}</a></td>
        <td><a href="${project.licenseLink}" target="_blank">${project.license}</a></td>
      </tr>
    `;

    useProjectsContainer.insertAdjacentHTML('beforeend', projectHtml);
  });
}
