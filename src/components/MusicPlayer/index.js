import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import MusicPopup from './MusicPopup';
import MiniPlayer from './MiniPlayer';
import {
  showIframe,
  hideIframe,
  destroyIframe,
  updateIframePosition
} from './iframeManager';
import styles from './styles.module.css';

const STORAGE_KEY_ACTIVATED = 'musicPlayer_isActivated';
const STORAGE_KEY_EXPANDED = 'musicPlayer_isExpanded';

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
 * 1. iframe 由 iframeManager 独立管理，固定在 document.body 中永不移动
 * 2. 弹窗 UI (MusicPopup) 通过 Portal 渲染，与 iframe 位置对齐
 * 3. 使用事件委托处理所有音乐按钮点击
 * 4. 响应式布局：检测屏幕尺寸，调整 iframe 和弹窗位置
 */
export default function MusicPlayer() {
  const [isActivated, setIsActivated] = useState(() =>
    getPersistedState(STORAGE_KEY_ACTIVATED, false)
  );
  const [isExpanded, setIsExpanded] = useState(() =>
    getPersistedState(STORAGE_KEY_EXPANDED, false)
  );
  const [portalContainer, setPortalContainer] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // 更新 iframe 位置以适应屏幕
      if (mobile) {
        updateIframePosition({
          top: '60px',
          right: '10px',
          left: '10px',
          width: 'auto',
          height: '200px',
          borderRadius: '0 0 12px 12px'
        });
      } else {
        updateIframePosition({
          top: '117px',
          right: '20px',
          left: 'auto',
          width: '520px',
          height: '240px',
          borderRadius: '0 0 16px 16px'
        });
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 创建 Portal 容器
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

  // 持久化状态
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_ACTIVATED, JSON.stringify(isActivated));
      sessionStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify(isExpanded));
    } catch {}
  }, [isActivated, isExpanded]);

  // 控制 iframe 显示/隐藏
  useEffect(() => {
    if (isActivated && isExpanded) {
      showIframe();
    } else {
      hideIframe();
    }
  }, [isActivated, isExpanded]);

  // 事件委托处理按钮点击
  useEffect(() => {
    const handleClick = (e) => {
      const button = e.target.closest('.header-music-link');
      if (!button) return;

      e.preventDefault();
      e.stopPropagation();

      // 关闭移动端侧边栏（如果打开）
      const sidebar = document.querySelector('.navbar-sidebar--show');
      if (sidebar) {
        const closeButton = document.querySelector('.navbar-sidebar__close');
        if (closeButton) closeButton.click();
      }

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

  // 更新按钮状态样式
  useEffect(() => {
    const updateButtonState = () => {
      document.querySelectorAll('.header-music-link').forEach(button => {
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
    destroyIframe();
    setIsActivated(false);
    setIsExpanded(false);
  }, []);

  if (!portalContainer || !isActivated) return null;

  return createPortal(
    <div className={styles.musicPlayerWrapper}>
      {/* 弹窗 UI - 与固定的 iframe 位置对齐 */}
      <div
        className={`${styles.musicPlayerContainer} ${isMobile ? styles.mobile : ''} ${isExpanded ? styles.expanded : styles.minimized}`}
      >
        <MusicPopup
          onMinimize={handleMinimize}
          onClose={handleClose}
        />
      </div>

      {/* 迷你播放器 */}
      {!isExpanded && (
        <MiniPlayer
          onExpand={handleExpand}
          onClose={handleClose}
        />
      )}
    </div>,
    portalContainer
  );
}
