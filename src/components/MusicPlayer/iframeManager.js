/**
 * 全局 iframe 管理器
 *
 * 核心设计原则：
 * - iframe 一旦创建就固定在 document.body 中，永不移动
 * - 移动 iframe 到新的父节点会导致浏览器重新加载 iframe，必须避免
 * - 使用 CSS 控制 iframe 的显示/隐藏和定位
 */

const SUNO_EMBED_URL = 'https://suno.com/embed/da76e35e-d870-4eca-831a-22885d088ffc';
const CONTAINER_ID = 'suno-music-iframe-container';

let containerElement = null;
let iframeElement = null;
let isVisible = false;

/**
 * 初始化 iframe 容器和 iframe
 * 只会执行一次
 */
function initialize() {
  if (typeof document === 'undefined') return;
  if (containerElement && document.body.contains(containerElement)) return;

  // 检查是否已存在（页面刷新后可能遗留）
  const existing = document.getElementById(CONTAINER_ID);
  if (existing) {
    containerElement = existing;
    iframeElement = existing.querySelector('iframe');
    return;
  }

  // 创建容器 - 固定定位，永不移动
  containerElement = document.createElement('div');
  containerElement.id = CONTAINER_ID;
  containerElement.style.cssText = `
    position: fixed;
    top: 117px;
    right: 20px;
    width: 520px;
    height: 240px;
    z-index: 997;
    border-radius: 0 0 16px 16px;
    overflow: hidden;
    visibility: hidden;
    pointer-events: none;
    background: linear-gradient(180deg, #f8f9fa 0%, #f0f0f0 100%);
  `;

  // 创建 iframe
  iframeElement = document.createElement('iframe');
  iframeElement.src = SUNO_EMBED_URL;
  iframeElement.title = 'Suno Music Player';
  iframeElement.frameBorder = '0';
  iframeElement.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen';
  iframeElement.allowFullscreen = true;
  iframeElement.referrerPolicy = 'no-referrer-when-downgrade';
  iframeElement.style.cssText = 'width: 100%; height: 100%; border: none;';

  containerElement.appendChild(iframeElement);
  document.body.appendChild(containerElement);
}

/**
 * 显示 iframe
 */
export function showIframe() {
  initialize();
  if (containerElement) {
    containerElement.style.visibility = 'visible';
    containerElement.style.pointerEvents = 'auto';
    isVisible = true;
  }
}

/**
 * 隐藏 iframe（不销毁，音乐继续播放）
 */
export function hideIframe() {
  if (containerElement) {
    containerElement.style.visibility = 'hidden';
    containerElement.style.pointerEvents = 'none';
    isVisible = false;
  }
}

/**
 * 销毁 iframe（完全停止音乐）
 */
export function destroyIframe() {
  if (containerElement && containerElement.parentNode) {
    containerElement.parentNode.removeChild(containerElement);
  }
  containerElement = null;
  iframeElement = null;
  isVisible = false;
}

/**
 * 检查 iframe 是否可见
 */
export function isIframeVisible() {
  return isVisible;
}

/**
 * 检查 iframe 是否已初始化
 */
export function isIframeInitialized() {
  return containerElement !== null && document.body.contains(containerElement);
}

/**
 * 更新 iframe 容器位置（用于响应式布局）
 */
export function updateIframePosition(styles) {
  if (containerElement) {
    Object.assign(containerElement.style, styles);
  }
}

/**
 * 获取当前位置信息
 */
export function getIframePosition() {
  return {
    top: '117px',
    right: '20px',
    width: '520px',
    height: '240px'
  };
}
