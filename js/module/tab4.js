import { loadModule } from '/js/module/moduleLoader.js';


/**
 * 加载tab4内容
 */
export async function xf_init() {
  await xf_loadTab4Content();
  const contributors = await getContributors();
  xf_generateContributors(contributors);
  xf_generateDownloadLines(contributors);

}

///////////////////////////////////////////////////////////////////////////////////////////////////

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

