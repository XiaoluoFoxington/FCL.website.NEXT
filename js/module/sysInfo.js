// 架构映射表，包含正则、架构名称和提示信息
const ARCH_MAP = [
  { reg: /aarch64|arm64|armv8/i, name: 'arm64-v8a', msg: '请选择all（通用）架构或arm64-v8a架构。' },
  { reg: /armeabi-v7a|(arm$)|armv7/i, name: 'armeabi-v7a', msg: '请选择all（通用）架构或armeabi-v7a架构。' },
  { reg: /x86_64|x64|amd64/i, name: 'x86_64', msg: '请选择all（通用）架构或x86_64架构。' },
  { reg: /x86|i[36]86/i, name: 'x86', msg: '请选择all（通用）架构或x86架构。' }
];

export default class sysInfo {
  /**
   * 检测系统信息
   * @returns {Object} 包含操作系统名称(osn)、版本(osv)、原始CPU架构(cpuarch)、
   *                   浏览器名称(bn)、解析后的架构名称(matchedArch)、
   *                   匹配的提示信息(matchedMsg)等
   */
  static detectSystemInfo() {
    const uap = new UAParser();
    const result = uap.getResult();
    console.log('系统检测：', result);
    const osn = result.os.name;
    const osv = result.os.version;
    const cpuarch = result.cpu.architecture || navigator.platform;
    const bn = result.browser.name;

    // 匹配架构
    let matchedArch = null;
    let matchedMsg = null;
    const matchItem = ARCH_MAP.find(item => item.reg.test(cpuarch));
    if (matchItem) {
      matchedArch = matchItem.name;
      matchedMsg = matchItem.msg;
    }

    return { osn, osv, cpuarch, bn, matchedArch, matchedMsg, result };
  }

  /**
   * 展示系统信息
   * @param {HTMLElement} sysInfoEle - 系统信息元素
   * @param {HTMLElement} uaInfoEle - User-Agent 信息元素
   */
  static show(sysInfoEle, uaInfoEle) {
    const { osn, osv, cpuarch, bn, matchedArch, matchedMsg } = this.detectSystemInfo();

    sysInfoEle.innerHTML = '';

    uaInfoEle.innerHTML = navigator.userAgent;

    if (osn !== 'Android') {
      this.addSysErrItem(sysInfoEle, `当前系统（${osn}）不是安卓系统。（仅供参考，不一定准）`);
    } else if (parseInt(osv) < 9 && osn === 'Android') {
      this.addSysErrItem(sysInfoEle, `当前安卓系统版本（${osv}）过低。`);
    } else if (cpuarch) {
      // windows 系统不要根据平台来判断架构!!!
      // windows 系统不管是 64 位还是 32 位始终为 win32 平台
      // 再乱改我就炸了!!!
      //                                            晚梦
      if (matchedArch) {
        this.addSysGreenItem(sysInfoEle, matchedMsg);
      } else {
        this.addSysInfoItem(sysInfoEle, '请选择all（通用）架构。');
      }
    }
    if (!['Chrome', 'Mobile Chrome', 'Firefox', 'Mobile Firefox', 'Edge', 'Opera', 'Safari', 'Mobile Safari'].includes(bn)) {
      this.addSysWarnItem(sysInfoEle, '建议使用常用浏览器（例如 Chrome、Firefox、Edge），因为某些浏览器会“掉包”下载内容。');
    }
    if (bn === 'Vivo Browser') {
      this.addSysErrItem(sysInfoEle, 'vivo品牌手机自带浏览器会“掉包”下载内容。');
    }
    if (bn === 'WeChat' || this.isAndroidQQInnerWebView(navigator.userAgent)) {
      this.addSysErrItem(sysInfoEle, '不建议使用微信/QQ自带浏览器，请复制网址到浏览器中打开！');
    }
  }
  /**
   * 添加系统信息项
   * @param {HTMLElement} sysInfoEle - 系统信息元素
   * @param {string} content - 系统信息项内容
   */
  static addSysInfoItem(sysInfoEle, content) {
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
  static addSysWarnItem(sysInfoEle, content) {
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
  static addSysErrItem(sysInfoEle, content) {
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
  static addSysGreenItem(sysInfoEle, content) {
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
  static isAndroidQQInnerWebView(userAgent) {
    // 校验参数：若传入非字符串（如undefined、null），直接返回false
    if (typeof userAgent !== 'string') {
      return false;
    }

    // 转为小写，避免大小写匹配问题（部分UA可能存在大写/混合写）
    const ua = userAgent.toLowerCase();

    /*
    核心判断条件：
    包含安卓标识（android）
    包含某些特殊标识（v1_and_sq_）
    （貌似不是每个都有）包含QQ内置浏览器内核标识（mqqbrowser）
    包含QQ主题标识（qqtheme）
    包含QQ版本标识（qq/）
    包含WebView标识（wv）（区别于独立版QQ浏览器）
    */
    const hasAndroid = ua.includes('android');
    const hasVAS = ua.includes('v1_and_sq_');
    // const hasMQQBrowser = ua.includes('mqqbrowser');
    const hasQQTheme = ua.includes('qqtheme/');
    const hasQQVersion = ua.includes('qq/');
    const hasWebView = ua.includes('wv');

    const isQQInnerWebView = hasAndroid && hasVAS && hasQQTheme && hasQQVersion && hasWebView;
    console.log('系统检测：是安卓版QQ内置WebView：', isQQInnerWebView);
    return isQQInnerWebView;
  }
}
