export default class utils {

  /**
   * 格式化字节大小为可读字符串
   * @param {number} bytes - 字节数
   * @returns {string} - 格式化后的字符串
   */
  static xf_formatBytes(bytes) {
    if (bytes === null || bytes === undefined) return '';
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 格式化ISO 8601为中文字符串
   * @param {string} iso8601 - ISO 8601字符串
   * @returns {string} - 格式化后的字符串
   */
  static xf_formatISO8601Time(isoString) {
    const date = new Date(isoString);
    const nanoMatch = isoString.match(/\.(\d+)Z?$/);
    const ns = nanoMatch ? parseInt(nanoMatch[1].padEnd(9, '0')) : 0;

    // 北京时间 (UTC+8)
    const h = (date.getUTCHours() + 8) % 24;
    const m = date.getUTCMinutes();
    const s = date.getUTCSeconds();

    // 构建时间部分，过滤掉尾部的0
    const timeArr = [
      { value: h, label: '时' },
      { value: m, label: '分' },
      { value: s, label: '秒' },
      { value: ns, label: '纳秒' }
    ];

    // 找到最后一个非零值的索引
    let lastNonZero = 0;
    for (let i = timeArr.length - 1; i >= 0; i--) {
      if (timeArr[i].value > 0) {
        lastNonZero = i;
        break;
      }
    }

    // 只取到最后一个非零值
    const displayParts = timeArr.slice(0, lastNonZero + 1);
    const timeStr = displayParts.map(p => p.value + p.label).join('');

    return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日${timeStr || '0时'}`;
  }

  /**
   * 将多个Uint8Array合并为一个将多个Uint8Array合并为一个
   */
  static xf_concatChunks(chunks) {
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  /**
   * 计算字符串的校验值
   * @param {string} str - 输入字符串
   * @returns {number} - 校验值
   */
  static xf_calculateChecksum(str) {
    let checksum = 0;
    for (let i = 0; i < str.length; i++) {
      checksum = (checksum << 5) - checksum + str.charCodeAt(i);
      checksum |= 0; // 转换为32位整数
    }
    return checksum;
  }

  /**
   * 读取本地存储
   * @param {string} key - 本地存储的键
   * @returns {string|null} - 对应的值
   */
  static xf_readLocalStorage(key) {
    const value = localStorage.getItem(key);
    console.log(`工具：读取本地存储：键：${key}：读到值：${value}`);
    return value;
  }

  /**
   * 写入本地存储
   * @param {string} key - 本地存储的键
   * @param {string} value - 对应的值
   */
  static xf_writeLocalStorage(key, value) {
    console.log(`工具：写入本地存储：键：${key}，值：${value}`);
    localStorage.setItem(key, value);
  }

  /**
   * 判断一个数是否是10的倍数
   * @param {number} num - 需要判断的数字
   * @returns {boolean} 如果是10的倍数返回true，否则返回false
   */
  static isMultipleOfTen(num) {
    if (typeof num !== 'number' || isNaN(num)) {
      return false;
    }

    return num % 10 === 0;
  }

  /**
   * 转义html
   * @param {string} str - 输入字符串
   * @returns {string} - 转义后的字符串
   */
  static xf_escapeHtml(str) {
    if (!str) return '';
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * 下载按钮点击防抖倒计时
   * @param {HTMLAnchorElement} link - 下载按钮元素
   */
  static xf_startCountdown(link) {
    const delay = parseInt(link.dataset.debounceDelay) || 3;
    if (delay <= 0) return;

    const originalText = link.dataset.originalText || link.innerText;
    let remaining = delay;

    link.disabled = true;
    link.style.opacity = '0.5';
    link.style.cursor = 'not-allowed';
    link.innerText = `${remaining}秒后可再次下载`;

    const timer = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(timer);
        link.disabled = false;
        link.style.opacity = '';
        link.style.cursor = '';
        link.innerText = originalText;
      } else {
        link.innerText = `${remaining}秒后可再次下载`;
      }
    }, 1000);
  }

  /**
   * 统一的错误处理函数
   * @param {Error} error - 错误对象
   * @param {Object} options - 配置选项
   * @param {string} [options.defaultMessage] - 默认错误消息
   * @param {boolean} [options.isUserFriendly] - 是否返回用户友好的消息
   * @returns {Object} - 处理后的错误信息
   */
  static xf_handleError(error, options = {}) {
    const {
      defaultMessage = '出错：' + error.message,
      isUserFriendly = true
    } = options;

    // 检查是否为取消操作导致的错误
    const isAbortError = error.name === 'AbortError' ||
      error.message.includes('The operation was aborted');

    if (isAbortError && isUserFriendly) {
      return {
        message: '强行终止加载。（' + defaultMessage + '）',
        isAbort: true,
        isUserFriendly: true,
      };
    }

    // 其他类型的错误
    return {
      message: defaultMessage,
      isAbort: false,
      isUserFriendly: false,
      color: '#f00',
      originalError: error
    };
  }
}