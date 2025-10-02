/**
 * 获取 HTML 内容
 * @param {string} url - HTML 文件的 URL
 * @returns {Promise<Element|string>} - 解析后的 HTML 元素，或在失败时返回错误信息元素
 */
export function xf_getHtmlContent(url) {
  console.log(`获取 HTML 内容：${url}`); // 打印日志
  return fetch(url) // 使用 fetch API 发起网络请求获取指定 URL 的内容
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }
      return response.text(); // 将响应对象转换为文本格式
    })
    .then(html => {
      const parser = new DOMParser(); // 创建 DOMParser 实例用于解析 HTML
      const doc = parser.parseFromString(html, 'text/html'); // 将 HTML 字符串解析为 DOM 文档对象
      return doc.body.firstElementChild; // 返回文档 body 的第一个子元素
    })
    .catch(e => {
      console.error('获取 HTML 内容：', e); // 在控制台输出错误信息
      const errorElement = document.createElement('span'); // 创建 DOM 元素用于显示错误信息
      errorElement.textContent = `获取 HTML 内容：${e.message}`; // 设置错误信息文本内容
      return errorElement; // 返回错误信息元素
    });
}

/**
 * 加载 HTML 内容到指定容器
 * @param {Element} htmlContent - HTML 元素
 * @param {Element} container - 用于加载内容的 DOM 元素容器
 */
export function xf_loadHtmlContent(htmlContent, container) {
  console.log(`加载 HTML 内容到指定容器：${container.id}`); // 打印日志
  try {
    while (container.firstChild) {
      container.firstChild.remove(); // 逐个移除子元素
    }
    container.appendChild(htmlContent); // 将 HTML 内容添加到容器
  } catch (e) {
    console.error('加载 HTML 内容到指定容器：', e); // 报错
    const errorElement = document.createElement('span'); // 创建错误信息元素
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
  console.log(`获取并加载 HTML 内容到指定容器：${url}；${container.id}`); // 打印日志
  try {
    container.innerHTML = '<div class="xf-loading"></div>'; // 显示加载状态

    const htmlContent = await xf_getHtmlContent(url); // 获取 HTML 内容

    if (htmlContent) {
      xf_loadHtmlContent(htmlContent, container); // 加载 HTML 内容到指定容器
    }
    mdui.mutation(); // 更新 MDUI
  } catch (e) {
    console.error('获取并加载 HTML 内容到指定容器：', e); // 报错
    container.innerHTML = `<div class="xf-error-message">获取并加载 HTML 内容到指定容器：${e.message}</div>`;
  }
}