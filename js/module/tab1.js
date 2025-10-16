import { loadModule } from '/js/module/moduleLoader.js';

/**
 * 加载tab1内容并初始化
 */
export async function xf_init() {
  console.log('xf_init()');
  await xf_loadTab1Content(); // 加载tab1内容
  xf_addEventListeners(); // 添加事件监听
  xf_loadAnnouncement();
}

/**
 * 添加事件监听
 */
export function xf_addEventListeners() {
  document.getElementById('loadIntroFclBtn').addEventListener('click', xf_loadIntroFclBtn_Click);
}

/**
 * 加载“介绍FCL”按钮的click
 */
export async function xf_loadIntroFclBtn_Click() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  loadContent.xf_loadHtmlContentFromUrl('/page/introFcl.html', document.getElementById('introFcl')); // 加载introFcl内容
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/** 
 * 加载tab1内容
 */
export async function xf_loadTab1Content() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  await loadContent.xf_loadHtmlContentFromUrl('/page/tab1.html', document.getElementById('tab1')); // 加载tab1内容
}

/**
 * 加载公告内容
 */
export async function xf_loadAnnouncement() {
  const loadContent = await loadModule('/js/module/loadContent.js');
  const utils = await loadModule('/js/module/utils.js');

  const CHECKSUM_STORAGE_KEY = 'xf_announcement_checksum';

  const savedChecksum = localStorage.getItem(CHECKSUM_STORAGE_KEY);
  console.log('tab1：加载公告内容：已存校验值：', savedChecksum);

  const contentElement = await loadContent.xf_getHtmlContent('/data/content/announcement.html');

  if (contentElement instanceof HTMLSpanElement && contentElement.textContent.startsWith('获取 HTML 内容：出错：')) {
    console.error('tab1：加载公告内容：出错：', contentElement.textContent);
    return;
  }

  const currentContentText = contentElement?.innerHTML || '';
  const currentChecksum = utils.xf_calculateChecksum(currentContentText);
  console.log('tab1：加载公告内容：当前校验值：', currentChecksum);

  const contentContainer = document.getElementById('xf_announcementContent');
  const titleElement = document.getElementById('xf_announcementTitle');

  if (!contentContainer || !titleElement) {
    console.error('tab1：加载公告内容：出错：找不到容器');
    return;
  }

  contentContainer.innerHTML = '';
  if (contentElement) {
    contentContainer.appendChild(contentElement);
  }

  if (savedChecksum !== null && parseInt(savedChecksum, 10) === currentChecksum) {
    console.log('tab1：加载公告内容：公告为旧');
    titleElement.innerHTML = '公告';
  } else {
    console.log('tab1：加载公告内容：公告为新');
    titleElement.innerHTML = '公告 <span style="color: #ff0;">●</span>';
  }

  const panelItem = document.getElementById('xf_announcement');
  if (panelItem) {
    if (!panelItem.dataset.xfAnnouncementListenerAdded) {
      panelItem.addEventListener('click', function () {
        titleElement.innerHTML = '公告';
        localStorage.setItem(CHECKSUM_STORAGE_KEY, currentChecksum.toString());
      });
      panelItem.dataset.xfAnnouncementListenerAdded = 'true';
    }
  }
}