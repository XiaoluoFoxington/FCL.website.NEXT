/**
 * 获取 HTML 内容
 * @param {string} url - HTML 文件的 URL
 * @returns {Promise<Element|string>} - 解析后的 HTML 元素，或在失败时返回错误信息元素
 */
export function xf_getHtmlContent(url) {
  // 打印日志
  console.log(`获取 HTML 内容：${url}`);
  // 使用 fetch API 发起网络请求获取指定 URL 的内容
  return fetch(url)
    // 将响应对象转换为文本格式
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }
      return response.text();
    })
    // 将获取到的 HTML 文本字符串解析为 DOM 文档
    .then(html => {
      // 创建 DOMParser 实例用于解析 HTML
      const parser = new DOMParser();
      // 将 HTML 字符串解析为 DOM 文档对象
      const doc = parser.parseFromString(html, 'text/html');
      // 返回文档 body 的第一个子元素
      return doc.body.firstElementChild;
    })
    // 捕获任何可能发生的错误
    .catch(e => {
      // 在控制台输出错误信息
      console.error('获取 HTML 内容：', e);
      // 创建 DOM 元素用于显示错误信息
      const errorElement = document.createElement('span');
      // 设置错误信息文本内容
      errorElement.textContent = `获取 HTML 内容：${e.message}`;
      // 返回错误信息元素
      return errorElement;
    });
}

/**
 * 加载 HTML 内容到指定容器
 * @param {Element} htmlContent - HTML 元素
 * @param {Element} container - 用于加载内容的 DOM 元素容器
 */
export function xf_loadHtmlContent(htmlContent, container) {
  // 打印日志
  console.log(`加载 HTML 内容到指定容器：${container.id}`);
  try {
    // 清空容器内容
    container.innerHTML = '';
    // 将 HTML 内容添加到容器
    container.appendChild(htmlContent);
  } catch (e) {
    // 报错
    console.error('加载 HTML 内容到指定容器：', e);
    // 创建错误信息元素
    const errorElement = document.createElement('span');
    errorElement.textContent = `加载 HTML 内容到指定容器：${e.message}`;
    container.appendChild(errorElement);
  }
}

/**
 * 获取并加载 HTML 内容到指定容器
 * @param {string} url - HTML 文件的 URL
 * @param {Element} container - 用于加载内容的 DOM 元素容器
 */
export async function xf_loadHtmlContentFromUrl(url, container) {
  // 打印日志
  console.log(`获取并加载 HTML 内容到指定容器：${url}；${container.id}`);
  try {
    // 显示加载状态
    container.innerHTML = '<div class="xf-loading"></div>';

    // 获取 HTML 内容
    const htmlContent = await xf_getHtmlContent(url);

    // 如果 HTML 内容存在
    if (htmlContent) {
      // 加载 HTML 内容到指定容器
      xf_loadHtmlContent(htmlContent, container);
    }
  } catch (e) {
    // 报错
    console.error('获取并加载 HTML 内容到指定容器：', e);
    container.innerHTML = `<div class="xf-error-message">获取并加载 HTML 内容到指定容器：${e.message}</div>`;
  }
}