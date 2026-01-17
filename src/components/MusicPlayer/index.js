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
import { getCurrentLocale } from './i18n';
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
 * 1. 头部和底部是独立的固定定位元素（由 MusicPopup 渲染）
 * 2. iframe 由 iframeManager 独立管理，位于头部和底部之间
 * 3. 三者通过 CSS 定位对齐，形成视觉上的完整弹窗
 * 4. iframe 永不移动，只用 CSS visibility 控制显示/隐藏
 * 5. 支持中英文国际化
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
  const [locale, setLocale] = useState(() => getCurrentLocale());

  // 检测移动端并更新 iframe 位置
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // 更新 iframe 位置
      // 头部高度约 47px，底部高度约 37px
      if (mobile) {
        updateIframePosition({
          top: '57px',      // 10px (container top) + 47px (header height)
          right: '10px',
          left: '10px',
          width: 'auto',
          height: '200px',
          borderRadius: '0'
        });
      } else {
        updateIframePosition({
          top: '117px',     // 70px (container top) + 47px (header height)
          right: '20px',
          left: 'auto',
          width: '520px',
          height: '240px',
          borderRadius: '0'
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

  // 检测语言变化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateLocale = () => {
      setLocale(getCurrentLocale());
    };

    // 监听 URL 变化（用于 SPA 导航）
    window.addEventListener('popstate', updateLocale);

    return () => window.removeEventListener('popstate', updateLocale);
  }, []);

  // 持久化状态
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_ACTIVATED, JSON.stringify(isActivated));
      sessionStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify(isExpanded));
    } catch {}
  }, [isActivated, isExpanded]);

  // 控制 iframe 显示/隐藏，并确保位置正确
  useEffect(() => {
    if (isActivated && isExpanded) {
      showIframe();
      // iframe 创建后更新位置
      if (isMobile) {
        updateIframePosition({
          top: '57px',
          right: '10px',
          left: '10px',
          width: 'auto',
          height: '200px',
          borderRadius: '0'
        });
      } else {
        updateIframePosition({
          top: '117px',
          right: '20px',
          left: 'auto',
          width: '520px',
          height: '240px',
          borderRadius: '0'
        });
      }
    } else {
      hideIframe();
    }
  }, [isActivated, isExpanded, isMobile]);

  // 事件委托处理按钮点击
  useEffect(() => {
    const handleClick = (e) => {
      const button = e.target.closest('.header-music-link');
      if (!button) return;

      e.preventDefault();
      e.stopPropagation();

      // 关闭移动端侧边栏
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
      {/* 弹窗 UI（头部 + 底部） */}
      <div
        className={`${styles.popupContainer} ${isExpanded ? styles.expanded : styles.minimized}`}
      >
        <MusicPopup
          onMinimize={handleMinimize}
          onClose={handleClose}
          isMobile={isMobile}
          locale={locale}
        />
      </div>

      {/* 迷你播放器 */}
      {!isExpanded && (
        <MiniPlayer
          onExpand={handleExpand}
          onClose={handleClose}
          locale={locale}
        />
      )}
    </div>,
    portalContainer
  );
}
