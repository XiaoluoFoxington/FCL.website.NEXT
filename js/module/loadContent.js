import { loadModule } from '/js/module/moduleLoader.js';

 /**
 * 获取 HTML 内容
 * @param {string} url - HTML 文件的 URL
 * @param {function} onProgress - 进度回调函数
 * @returns {Promise<Element|string>} - 解析后的 HTML 元素，或在失败时返回错误信息元素
 */
export function xf_getHtmlContent(url, onProgress) {
  console.log(`获取 HTML 内容：${url}`); // 打印日志
  return fetch(url) // 使用 fetch API 发起网络请求获取指定 URL 的内容
    .then(response => {
      if (!response.ok) {
        throw new Error(`获取 HTML 内容：出错：HTTP：${response.status}`);
      }
      
      const contentLength = response.headers.get('Content-Length');
      let loaded = 0;
      
      // 如果没有进度回调或不知道内容长度，直接返回文本
      if (!onProgress || !contentLength) {
        return response.text();
      }
      
      const reader = response.body.getReader();
      const chunks = [];
      const total = parseInt(contentLength, 10);
      
      return new Promise((resolve, reject) => {
        function read() {
          reader.read().then(({ done, value }) => {
            if (done) {
              // 将所有chunk合并为完整文本
              const html = new TextDecoder().decode(concatChunks(chunks));
              resolve(html);
              return;
            }
            
            chunks.push(value);
            loaded += value.length;
            // 调用进度回调
            onProgress(loaded, total);
            read();
          }).catch(reject);
        }
        read();
      });
    })
    .then(html => {
      const parser = new DOMParser(); // 创建 DOMParser 实例用于解析 HTML
      const doc = parser.parseFromString(html, 'text/html'); // 将 HTML 字符串解析为 DOM 文档对象
      return doc.body.firstElementChild; // 返回文档 body 的第一个子元素
    })
    .catch(e => {
      console.error('获取 HTML 内容：出错：', e); // 在控制台输出错误信息
      const errorElement = document.createElement('span'); // 创建 DOM 元素用于显示错误信息
      errorElement.textContent = `获取 HTML 内容：出错：${e.message}`; // 设置错误信息文本内容
      return errorElement; // 返回错误信息元素
    });
}

// 辅助函数：将多个Uint8Array合并为一个
function concatChunks(chunks) {
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
 * 加载 HTML 内容到指定容器
 * @param {Element} htmlContent - HTML 元素
 * @param {Element} container - 用于加载内容的 DOM 元素容器
 */
export function xf_loadHtmlContent(htmlContent, container) {
  console.log(`加载 HTML 内容到指定容器：容器：${container.id}`); // 打印日志
  try {
    while (container.firstChild) {
      container.firstChild.remove(); // 逐个移除子元素
    }
    container.appendChild(htmlContent); // 将 HTML 内容添加到容器
  } catch (e) {
    console.error('加载 HTML 内容到指定容器：出错：', e); // 报错
    const errorElement = document.createElement('span'); // 创建错误信息元素
    errorElement.textContent = `加载 HTML 内容到指定容器：出错：${e.message}`;
    container.appendChild(errorElement);
  }
}

/**
 * 获取并加载 HTML 内容到指定容器
 * @param {string} url - HTML 文件的 URL
 * @param {Element} container - 用于加载内容的 DOM 元素容器
 */
export async function xf_loadHtmlContentFromUrl(url, container) {
  console.log(`获取并加载 HTML 内容到指定容器：内容：${url}；容器：${container.id}`); // 打印日志
  const utils = await loadModule('/js/module/utils.js');
  try {
    // 创建加载状态元素
    const loadingElement = document.createElement('div');
    loadingElement.className = 'xf-loading';
    loadingElement.id = 'xf-loading-progress';
    loadingElement.innerHTML = '正在加载<br>0%<br>0 / ?';
    
    container.innerHTML = '';
    container.appendChild(loadingElement);
    
    const htmlContent = await xf_getHtmlContent(url, (loaded, total) => {
      // 更新进度信息
      const percent = total ? Math.round((loaded / total) * 100) : 0;
      const loadedFormatted = utils.formatBytes(loaded);
      const totalFormatted = total ? utils.formatBytes(total) : '?';
      
      const progressElement = document.getElementById('xf-loading-progress');
      if (progressElement) {
        progressElement.innerHTML = `正在加载<br>${percent}%<br>${loadedFormatted} / ${totalFormatted}`;
      }
    });
    
    if (htmlContent) {
      xf_loadHtmlContent(htmlContent, container); // 加载 HTML 内容到指定容器
    }
    mdui.mutation(); // 更新 MDUI
  } catch (e) {
    console.error('获取并加载 HTML 内容到指定容器：', e); // 报错
    container.innerHTML = `<div class="xf-error-text">获取并加载 HTML 内容到指定容器：出错：${e.message}</div>`;
  }
}
