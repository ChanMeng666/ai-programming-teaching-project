/**
 * 全局 iframe 管理器
 *
 * 使用原生 JavaScript 创建和管理 Suno 播放器 iframe
 * 确保 iframe 一旦创建就不会被销毁，即使 React 组件重新挂载
 */

const SUNO_EMBED_URL = 'https://suno.com/embed/da76e35e-d870-4eca-831a-22885d088ffc';
const IFRAME_ID = 'suno-music-iframe';

let iframeElement = null;
let currentContainer = null;

/**
 * 获取或创建 iframe 元素
 */
export function getOrCreateIframe() {
  if (typeof document === 'undefined') return null;

  // 如果已存在，直接返回
  if (iframeElement && document.body.contains(iframeElement)) {
    return iframeElement;
  }

  // 尝试从 DOM 中查找（可能是页面刷新后遗留的）
  const existing = document.getElementById(IFRAME_ID);
  if (existing) {
    iframeElement = existing;
    return iframeElement;
  }

  // 创建新的 iframe
  iframeElement = document.createElement('iframe');
  iframeElement.id = IFRAME_ID;
  iframeElement.src = SUNO_EMBED_URL;
  iframeElement.title = 'Suno Music Player';
  iframeElement.frameBorder = '0';
  iframeElement.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen';
  iframeElement.allowFullscreen = true;
  iframeElement.loading = 'lazy';
  iframeElement.referrerPolicy = 'no-referrer-when-downgrade';
  iframeElement.style.cssText = 'width: 100%; height: 100%; border: none;';

  return iframeElement;
}

/**
 * 将 iframe 挂载到指定容器
 */
export function mountIframe(container) {
  if (!container) return;

  const iframe = getOrCreateIframe();
  if (!iframe) return;

  // 如果 iframe 已经在目标容器中，不需要移动
  if (currentContainer === container && container.contains(iframe)) {
    return;
  }

  // 移动 iframe 到新容器（不会中断播放）
  container.appendChild(iframe);
  currentContainer = container;
}

/**
 * 检查 iframe 是否已创建
 */
export function isIframeCreated() {
  return iframeElement !== null && document.body.contains(iframeElement);
}

/**
 * 销毁 iframe（仅在完全关闭播放器时调用）
 */
export function destroyIframe() {
  if (iframeElement && iframeElement.parentNode) {
    iframeElement.parentNode.removeChild(iframeElement);
  }
  iframeElement = null;
  currentContainer = null;
}
