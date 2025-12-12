import { loadModule } from '/js/module/moduleLoader.js';

/**
 * 展示系统信息
 * @param {HTMLElement} sysInfoEle - 系统信息元素
 */
export function show(sysInfoEle) {
  const uap = new UAParser();
  const result = uap.getResult();
  console.log('系统检测：', result);
  const osn = result.os.name;
  const osv = result.os.version;
  const cpuarch = result.cpu.architecture || navigator.platform;
  const bn = result.browser.name;

  sysInfoEle.innerHTML = '';

  addSysInfoItem(sysInfoEle, navigator.userAgent);

  if (osn !== 'Android') {
    addSysErrItem(sysInfoEle, '当前系统不是安卓系统，无法运行。');
  } else if (parseInt(osv) < 9) {
    addSysErrItem(sysInfoEle, '当前系统版本过低，无法运行。');
  } else if (cpuarch) {
    const archMap = [
      { reg: /aarch64|arm64|armv8/i, msg: '请选择通用架构或“arm64-v8a”架构。' },
      { reg: /armeabi-v7a|(arm$)|armv7/i, msg: '请选择通用架构或“armeabi-v7a”架构。' },
      { reg: /x86_64|x64|amd64/i, msg: '请选择通用架构或“x86_64”架构。' },
      { reg: /x86|i[36]86/i, msg: '请选择通用架构或“x86”架构。' }
    ];
    // windows 系统不要根据平台来判断架构!!!
    // windows 系统不管是 64 位还是 32 位始终为 win32 平台
    // 再乱改我就炸了!!!
    //                                            晚梦
    const matchItem = archMap.find(item => item.reg.test(cpuarch));
    if (matchItem) {
      addSysGreenItem(sysInfoEle, matchItem.msg);
    } else {
      addSysInfoItem(sysInfoEle, '请选择通用架构。');
    }
  }
  if (!['Chrome', 'Mobile Chrome', 'Firefox', 'Mobile Firefox', 'Edge', 'Opera'].includes(bn)) {
    addSysWarnItem(sysInfoEle, '当前浏览器不是常用浏览器。部分浏览器会识别下载内容并引流至下载其它软件。');
  }
  if (bn === 'Vivo Browser') {
    addSysErrItem(sysInfoEle, 'vivo品牌手机自带浏览器会识别下载内容并引流至下载其它软件。');
  }
  if (bn === 'WeChat' || isAndroidQQInnerWebView(navigator.userAgent)) {
    addSysErrItem(sysInfoEle, '请复制网址到浏览器中打开！');
  }
}

/**
 * 添加系统信息项
 * @param {HTMLElement} sysInfoEle - 系统信息元素
 * @param {string} content - 系统信息项内容
 */
export function addSysInfoItem(sysInfoEle, content) {
  const itemEle = document.createElement('div');
  itemEle.innerHTML = `
  <div class="mdui-panel-item mdui-panel-item-open">
    <div class="mdui-panel-item-body mdui-typo" style='padding: 12px; padding-bottom: 0px;'>
      <p><i class="mdui-icon material-icons">info</i>${content}</p>
    </div>
  </div>
  `;
  sysInfoEle.appendChild(itemEle);
}

/**
 * 添加系统警告项
 * @param {HTMLElement} sysInfoEle - 系统信息元素
 * @param {string} content - 系统信息项内容
 */
export function addSysWarnItem(sysInfoEle, content) {
  const itemEle = document.createElement('div');
  itemEle.innerHTML = `
  <div class="mdui-panel-item mdui-panel-item-open" style="background-color: #ffff0040;">
    <div class="mdui-panel-item-body mdui-typo" style='padding: 12px; padding-bottom: 0px;'>
      <p><i class="mdui-icon material-icons">warning</i>${content}</p>
    </div>
  </div>
  `;
  sysInfoEle.appendChild(itemEle);
}

/**
 * 添加系统错误项
 * @param {HTMLElement} sysInfoEle - 系统信息元素
 * @param {string} content - 系统信息项内容
 */
export function addSysErrItem(sysInfoEle, content) {
  const itemEle = document.createElement('div');
  itemEle.innerHTML = `
  <div class="mdui-panel-item mdui-panel-item-open" style="background-color: #ff000040;">
    <div class="mdui-panel-item-body mdui-typo" style='padding: 12px; padding-bottom: 0px;'>
      <p><i class="mdui-icon material-icons">cancel</i>${content}</p>
    </div>
  </div>
  `;
  sysInfoEle.appendChild(itemEle);
}

/**
 * 添加系统绿色项
 * @param {HTMLElement} sysInfoEle - 系统信息元素
 * @param {string} content - 系统信息项内容
 */
export function addSysGreenItem(sysInfoEle, content) {
  const itemEle = document.createElement('div');
  itemEle.innerHTML = `
  <div class="mdui-panel-item mdui-panel-item-open" style="background-color: #00ff0040;">
    <div class="mdui-panel-item-body mdui-typo" style='padding: 12px; padding-bottom: 0px;'>
      <p><i class="mdui-icon material-icons">check_circle</i>${content}</p>
    </div>
  </div>
  `;
  sysInfoEle.appendChild(itemEle);
}

/**
 * 判断传入的UA是否为安卓版QQ内置WebView
 * @param {string} userAgent - 待判断的User-Agent字符串
 * @returns {boolean} - 是则返回true，否则返回false
 */
function isAndroidQQInnerWebView(userAgent) {
  // 校验参数：若传入非字符串（如undefined、null），直接返回false
  if (typeof userAgent !== 'string') {
    return false;
  }

  // 转为小写，避免大小写匹配问题（部分UA可能存在大写/混合写）
  const ua = userAgent.toLowerCase();

  // 核心判断条件：
  // 包含安卓标识（android）
  // （貌似不是每个都有）包含QQ内置浏览器内核标识（mqqbrowser）
  // 包含QQ主题标识（qqtheme）
  // 包含QQ版本标识（qq/）
  // 包含WebView标识（wv）（区别于独立版QQ浏览器）
  const hasAndroid = ua.includes('android');
  // const hasMQQBrowser = ua.includes('mqqbrowser');
  const hasQQTheme = ua.includes('qqtheme');
  const hasQQVersion = ua.includes('qq/');
  const hasWebView = ua.includes('wv');

  const isQQInnerWebView = hasAndroid && hasQQTheme && hasQQVersion && hasWebView;
  console.log('系统检测：是安卓版QQ内置WebView：', isQQInnerWebView);
  return isQQInnerWebView;
}
