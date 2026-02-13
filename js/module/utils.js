/**
 * 格式化字节大小为可读字符串
 * @param {number} bytes - 字节数
 * @returns {string} - 格式化后的字符串
 */
export function xf_formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * 将多个Uint8Array合并为一个将多个Uint8Array合并为一个
 */
export function xf_concatChunks(chunks) {
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
export function xf_calculateChecksum(str) {
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
export function xf_readLocalStorage(key) {
  const value = localStorage.getItem(key);
  console.log(`工具：读取本地存储：键：${key}：读到值：${value}`);
  return value;
}

/**
 * 写入本地存储
 * @param {string} key - 本地存储的键
 * @param {string} value - 对应的值
 */
export function xf_writeLocalStorage(key, value) {
  console.log(`工具：写入本地存储：键：${key}，值：${value}`);
  localStorage.setItem(key, value);
}

/**
 * 判断一个数是否是10的倍数
 * @param {number} num - 需要判断的数字
 * @returns {boolean} 如果是10的倍数返回true，否则返回false
 */
export function isMultipleOfTen(num) {
  if (typeof num !== 'number' || isNaN(num)) {
    return false;
  }

  return num % 10 === 0;
}