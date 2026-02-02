import { loadModule } from '/js/module/moduleLoader.js';

/**
 * 贡献者配置数组
 */
export const contributors = [
  {
    id: 'XiaoluoFoxington',
    name: '洛狐',
    github: 'XiaoluoFoxington',
    bilibili: '1561166904',
    qq: '1MHMKdCWzS',
    avatar: '/media/img/awatar/XiaoluoFoxington.avif',
    contributions: [
      '网站编写',
      '提供下载线路1'
    ],
    lines: [1]
  },
  {
    id: 'Lemwood',
    name: '柠枺',
    github: 'ning-g-mo',
    bilibili: '3537106787896067',
    avatar: '/media/img/awatar/Lemonwood.avif',
    contributions: [
      '提供下载线路10',
      '提供域名'
    ],
    lines: [10]
  },
  {
    id: 'LateDream',
    name: '晚梦',
    github: 'LateDreamXD',
    bilibili: '1988506301',
    homepage: 'https://about.latedream.cn',
    avatar: 'https://assets.latedream.qzz.io/avatars/latedream/current.webp',
    contributions: [
      '代码贡献（初版与mdui版）'
    ],
    lines: []
  },
  {
    id: 'YShenZe',
    name: '梦泽',
    github: 'YShenZe',
    avatar: 'https://q2.qlogo.cn/headimg_dl?dst_uin=417158478&spec=640',
    contributions: [
      '提供下载线路7'
    ],
    lines: [7]
  },
  {
    id: 'haha66623332',
    name: '哈哈66623332',
    github: 'haha252',
    bilibili: '451017007',
    avatar: 'https://frostlynx.work/images/haha.jpg',
    contributions: [
      '提供下载线路2'
    ],
    lines: [2]
  },
  {
    id: 'fishcpy',
    name: '咬一口的鱼py',
    github: 'fishcpy',
    bilibili: '1879898443',
    homepage: 'https://www.fis.ink',
    avatar: 'https://www.fis.ink/img/logo.png',
    contributions: [
      '提供下载线路3'
    ],
    lines: [3]
  },
  {
    id: 'MLFKWMC',
    name: 'MLFKWMC',
    bilibili: '494958603',
    qq: 'naMuNOEAXC',
    homepage: 'https://www.mcddos.top',
    avatar: 'https://mcddos.top/logo.jpg',
    contributions: [
      '提供下载线路8'
    ],
    lines: [8]
  },
  {
    id: 'Linkong',
    name: 'Linkong',
    avatar: '/media/img/awatar/Linkong.svg',
    contributions: [
      '提供下载线路5'
    ],
    lines: [5]
  },
  {
    id: '广告哥',
    name: '广告哥',
    github: 'cdyAI',
    email: '153145404@qq.com',
    avatar: '/media/img/awatar/广告哥.avif',
    contributions: [
      '提供下载线路6'
    ],
    lines: [6]
  },
  {
    id: 'lisongyun',
    name: 'lisongyun',
    bilibili: '3493107991579439',
    avatar: 'https://download.shiyanzhongxue666.top/?file=oip-c.png',
    contributions: [
      '提供下载线路9'
    ],
    lines: [9]
  },
  {
    id: 'ongllluv',
    name: 'ongllluv',
    github: 'songllluv',
    avatar: 'https://avatars.githubusercontent.com/u/197053278',
    contributions: [
      '代码贡献'
    ],
    lines: []
  }
];


/**
 * 加载tab4内容
 */
export async function xf_init() {
  await xf_loadTab4Content();
  xf_generateContributors();
  xf_generateDownloadLines();

}

///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 获取所有线路信息
 */
export function getDownloadLines() {
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
 */
export function xf_generateContributors() {
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
 */
export function xf_generateDownloadLines() {
  const linesContainer = document.getElementById('downloadLinesTableBody');
  if (!linesContainer) return;

  // 清空容器
  linesContainer.innerHTML = '';

  // 获取线路信息
  const downloadLines = getDownloadLines();

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

