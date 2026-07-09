import loadContent from '/js/module/loadContent.js';
import utils from './utils.js';


/**
 * 加载tab4内容
 */
export async function xf_init() {
  await xf_loadTab4Content();
  xf_addEventListeners();
  const config = await loadContent.fetchItems('/data/content/trafficConfig.json');
  xf_initTrafficCharts(config);
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
  const apiUrl = 'https://fengyuan.frostlynx.work/api/public/v1/blocklist.json';
  container.innerHTML = '<div class="mdui-spinner"></div>';
  mdui.mutation();

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP错误: ${response.status}`);
      return response.json();
    })
    .then(data => {
      const blocks = data?.data?.blocks;
      if (!Array.isArray(blocks) || blocks.length === 0) {
        container.innerHTML = '<div class="mdui-typo">暂无数据</div>';
        return;
      }

      let tbodyHtml = '';
      for (const block of blocks) {
        tbodyHtml += `
          <tr>
            <td>${utils.xf_escapeHtml(block.entry)}</td>
            <td>${utils.xf_escapeHtml(block.reason || '')}</td>
            <td>${utils.xf_formatISO8601Time(block.blocked_at || '')}</td>
            <td>${utils.xf_escapeHtml(block.attempts_after_block || '')}</td>
          </tr>
        `;
      }

      const tableHtml = `
        <div class="mdui-table-fluid">
          <table class="mdui-table">
            <thead>
              <tr>
                <th>IP</th>
                <th>原因</th>
                <th>封禁时间</th>
                <th>封禁后尝试次数</th>
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
      container.innerHTML = `<div class="mdui-typo" style="color: #f00;">出错：${utils.xf_escapeHtml(error.message)}</div>`;
    });
}

/**
 * 加载线路10封禁信息
 */
export function xf_loadWay10BanInfo() {
  const container = document.getElementById('xf_fclWay10BanInfoBody');
  const apiUrl = 'https://miawa.cn/download/banned_ips.txt';
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
            <td>${utils.xf_escapeHtml(row.ip)}</td>
            <td>${utils.xf_escapeHtml(row.reason)}</td>
            <td>${utils.xf_escapeHtml(row.traffic)}</td>
            <td>${utils.xf_escapeHtml(row.time)}</td>
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
      container.innerHTML = `<div class="mdui-typo" style="color: #f00;">出错：${utils.xf_escapeHtml(error.message)}</div>`;
    });
}


/** 最大保留数据点数 */
const MAX_DATA_POINTS = 114;

/** 所有线路的实时数据记录（按 routeId → chartId → records[]） */
const routeRecords = {};

/** Chart.js 实例缓存 */
const trafficCharts = {};

/**
 * 获取当前时间标签 (HH:MM:SS)
 */
function xf_getTimeLabel() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

/**
 * 向记录数组中追加数据点，超出最大长度时移除最早的点
 * @param {Array} records 记录数组
 * @param {number} value 数值
 */
function xf_pushRecord(records, value) {
  records.push({ time: xf_getTimeLabel(), value });
  if (records.length > MAX_DATA_POINTS) {
    records.shift();
  }
}

/**
 * 创建或更新折线图
 * @param {string} canvasId canvas 元素 ID
 * @param {Array} records 记录数组 [{time, value}, ...]
 * @param {Object} chartConfig 图表的配置对象（含 label、color、style 等）
 * @param {function} [tooltipCallback] 格式化 tooltip 的回调
 * @param {function} [yAxisCallback] 格式化 Y 轴刻度的回调
 */
function xf_createOrUpdateChart(canvasId, records, chartConfig, tooltipCallback, yAxisCallback) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const labels = records.map(r => r.time);
  const data = records.map(r => r.value);
  const s = chartConfig.style || {};
  const color = chartConfig.color;

  if (trafficCharts[canvasId]) {
    const chart = trafficCharts[canvasId];
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update('none');
    return;
  }

  trafficCharts[canvasId] = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: chartConfig.label,
        data: data,
        borderColor: color,
        backgroundColor: s.backgroundColor || color.replace('1)', '0.1)'),
        fill: s.fill !== undefined ? s.fill : true,
        tension: s.tension !== undefined ? s.tension : 0,
        pointRadius: s.pointRadius !== undefined ? s.pointRadius : 2,
        pointHoverRadius: s.pointHoverRadius !== undefined ? s.pointHoverRadius : 5,
        borderWidth: s.borderWidth !== undefined ? s.borderWidth : 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: s.maintainAspectRatio !== undefined ? s.maintainAspectRatio : true,
      animation: false,
      plugins: {
        legend: { display: s.legendDisplay || false },
        tooltip: {
          callbacks: {
            label: tooltipCallback || (ctx => `${ctx.parsed.y}`)
          }
        }
      },
      scales: {
        x: {
          grid: { display: s.xGridDisplay !== undefined ? s.xGridDisplay : false },
          ticks: { maxTicksLimit: s.maxTicksLimit || 10 }
        },
        y: {
          beginAtZero: s.yBeginAtZero || false,
          ticks: {
            callback: yAxisCallback || (value => value)
          }
        }
      }
    }
  });
}

/**
 * 按路径表达式从对象中取值，支持 p[1]、total_visits 等格式
 * @param {Object} obj 源对象
 * @param {string} path 路径表达式
 * @returns {*}
 */
function xf_getValueByPath(obj, path) {
  if (!path) return undefined;

  // 先尝试用方括号匹配：p[1] → obj.p[1]
  const bracketMatch = path.match(/^([^[]+)\[(\d+)\]$/);
  if (bracketMatch) {
    const key = bracketMatch[1];
    const index = parseInt(bracketMatch[2], 10);
    return obj?.[key]?.[index];
  }

  // 支持点号路径：data.total_visits
  if (path.includes('.')) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // 否则直接当属性名
  return obj?.[path];
}

/**
 * 动态生成流量监控面板 HTML（flex 布局）
 * @param {Array} config 流量配置
 * @returns {string}
 */
function xf_generateTrafficHtml(config) {
  let html = '<div class="mdui-panel" mdui-panel>';

  config.forEach(route => {
    html += `
      <div class="mdui-panel-item mdui-panel-item-open">
        <div class="mdui-panel-item-header mdui-ripple">
          <div>${route.name} （${route.refreshLabel}）</div>
          <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
        </div>
        <div class="mdui-panel-item-body">
          <div class="mdui-container-fluid">
            <div style="display: flex; flex-wrap: wrap; gap: 16px;">`;

    route.charts.forEach(chart => {
      html += `
              <div style="flex: 1 1 300px; min-width: 260px;">
                <div class="mdui-panel" mdui-panel>
                  <div class="mdui-panel-item mdui-panel-item-open">
                    <div class="mdui-panel-item-header mdui-ripple">
                      <div>${chart.label}</div>
                      <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
                    </div>
                    <div class="mdui-panel-item-body">
                      <canvas id="xf_${chart.id}Chart"></canvas>
                    </div>
                  </div>
                </div>
              </div>`;
    });

    html += `
            </div>
          </div>
        </div>
      </div>`;
  });

  html += '</div>';
  return html;
}

/**
 * 根据配置获取并更新某条线路的所有图表
 * @param {Object} route 线路配置
 */
async function xf_fetchRouteData(route) {
  try {
    const apiData = await loadContent.fetchItems(route.apiUrl);
    const records = routeRecords[route.id];

    route.charts.forEach(chart => {
      const value = xf_getValueByPath(apiData, chart.dataPath);
      if (value === null || value === undefined) return;

      xf_pushRecord(records[chart.id], value);

      xf_createOrUpdateChart(
        `xf_${chart.id}Chart`,
        records[chart.id],
        chart,
        chart.formatBytes ? ctx => utils.xf_formatBytes(ctx.parsed.y) : undefined,
        chart.formatBytes ? v => utils.xf_formatBytes(v) : undefined
      );
    });
  } catch (error) {
    console.error(`获取${route.name}流量信息失败:`, error);
  }
}

/**
 * 初始化流量监控：生成 HTML + 初始化数据记录 + 首次加载 + 启动定时轮询
 * @param {Array} config 流量配置
 */
export function xf_initTrafficCharts(config) {
  const container = document.getElementById('xf_trafficInfoBody');
  if (!container || !config) return;

  // 1. 动态生成 HTML
  container.innerHTML = xf_generateTrafficHtml(config);
  mdui.mutation();

  // 2. 初始化数据记录结构
  config.forEach(route => {
    routeRecords[route.id] = {};
    route.charts.forEach(chart => {
      routeRecords[route.id][chart.id] = [];
    });
  });

  // 3. 首次加载 & 启动定时轮询
  config.forEach(route => {
    xf_fetchRouteData(route);
    setInterval(() => xf_fetchRouteData(route), route.refreshInterval);
  });
}


/**
 * 获取贡献者数据
 * @returns {Array} 贡献者数组
 */
export async function getContributors() {
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
  await loadContent.xf_loadHtmlContentFromUrl('/page/tab4.html', document.getElementById('tab4')); // 加载tab4内容
}

/**
 * 获取使用的开源项目数组
 * @returns {Promise<Array>} 使用的开源项目数组
 */
export async function xf_getUseProjects() {
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
