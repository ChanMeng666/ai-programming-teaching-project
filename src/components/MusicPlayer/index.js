import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import MusicPopup from './MusicPopup';
import MiniPlayer from './MiniPlayer';
import { destroyIframe } from './iframeManager';
import styles from './styles.module.css';

// sessionStorage keys for persisting state across page navigations
const STORAGE_KEY_ACTIVATED = 'musicPlayer_isActivated';
const STORAGE_KEY_EXPANDED = 'musicPlayer_isExpanded';

/**
 * 获取持久化的状态
 */
function getPersistedState(key, defaultValue) {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const saved = sessionStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * 音乐播放器组件
 *
 * 架构设计：
 * 1. 使用 Portal 将播放器渲染到独立的 DOM 节点，与 React 页面路由解耦
 * 2. 使用 iframeManager 管理 iframe 的创建和销毁，确保 iframe 在页面切换时不被重新挂载
 * 3. 使用事件委托处理所有音乐按钮点击（包括移动端侧边栏动态创建的按钮）
 * 4. 使用 sessionStorage 持久化状态
 */
export default function MusicPlayer() {
  const [isActivated, setIsActivated] = useState(() =>
    getPersistedState(STORAGE_KEY_ACTIVATED, false)
  );
  const [isExpanded, setIsExpanded] = useState(() =>
    getPersistedState(STORAGE_KEY_EXPANDED, false)
  );
  const [portalContainer, setPortalContainer] = useState(null);

  // 创建 Portal 容器（独立于 React 路由）
  useEffect(() => {
    if (typeof document === 'undefined') return;

    let container = document.getElementById('music-player-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'music-player-portal';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  // 持久化状态到 sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_ACTIVATED, JSON.stringify(isActivated));
      sessionStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify(isExpanded));
    } catch {
      // sessionStorage 不可用时忽略
    }
  }, [isActivated, isExpanded]);

  // 使用事件委托监听所有音乐按钮点击
  useEffect(() => {
    const handleClick = (e) => {
      const button = e.target.closest('.header-music-link');
      if (!button) return;

      e.preventDefault();
      e.stopPropagation();

      if (!isActivated) {
        setIsActivated(true);
        setIsExpanded(true);
      } else {
        setIsExpanded(prev => !prev);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isActivated]);

  // 更新所有音乐按钮的状态样式
  useEffect(() => {
    const updateButtonState = () => {
      const buttons = document.querySelectorAll('.header-music-link');
      buttons.forEach(button => {
        button.classList.toggle('header-music-link--activated', isActivated);
        button.classList.toggle('header-music-link--expanded', isExpanded);
      });
    };

    updateButtonState();

    const observer = new MutationObserver(updateButtonState);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isActivated, isExpanded]);

  const handleMinimize = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleClose = useCallback(() => {
    // 销毁 iframe（停止音乐）
    destroyIframe();
    setIsActivated(false);
    setIsExpanded(false);
  }, []);

  if (!portalContainer) return null;

  return createPortal(
    <div
      className={styles.musicPlayerWrapper}
      style={{ display: isActivated ? 'block' : 'none' }}
    >
      {/* 弹窗容器 */}
      <div
        className={`${styles.musicPlayerContainer} ${isExpanded ? styles.expanded : styles.minimized}`}
      >
        <MusicPopup
          onMinimize={handleMinimize}
          onClose={handleClose}
        />
      </div>

      {/* 迷你播放器 */}
      <div style={{ display: isExpanded ? 'none' : 'block' }}>
        <MiniPlayer
          onExpand={handleExpand}
          onClose={handleClose}
        />
      </div>
    </div>,
    portalContainer
  );
}
