import React, { useState, useEffect, useCallback } from 'react';
import MusicPopup from './MusicPopup';
import MiniPlayer from './MiniPlayer';
import styles from './styles.module.css';

/**
 * 音乐播放器组件
 *
 * 设计理念：
 * - iframe 一旦激活就保持挂载（音乐不中断）
 * - 弹窗可展开/最小化，但不会卸载播放器
 * - 最小化时显示迷你播放器条
 * - 导航栏按钮显示激活状态
 */
export default function MusicPlayer() {
  // 是否已激活（首次打开后为 true，iframe 保持挂载）
  const [isActivated, setIsActivated] = useState(false);
  // 弹窗是否展开
  const [isExpanded, setIsExpanded] = useState(false);

  // 监听导航栏按钮点击
  useEffect(() => {
    const handleToggle = (e) => {
      e.preventDefault();

      if (!isActivated) {
        // 首次点击：激活播放器并展开
        setIsActivated(true);
        setIsExpanded(true);
      } else {
        // 已激活：切换展开/最小化
        setIsExpanded(prev => !prev);
      }
    };

    // 使用 MutationObserver 等待按钮渲染
    const attachListener = () => {
      const buttons = document.querySelectorAll('.header-music-link');
      buttons.forEach(button => {
        button.addEventListener('click', handleToggle);
      });
      return buttons.length > 0;
    };

    // 尝试立即附加监听器
    if (!attachListener()) {
      const observer = new MutationObserver(() => {
        if (attachListener()) {
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }

    return () => {
      const buttons = document.querySelectorAll('.header-music-link');
      buttons.forEach(button => {
        button.removeEventListener('click', handleToggle);
      });
    };
  }, [isActivated]);

  // 更新导航栏按钮状态
  useEffect(() => {
    const buttons = document.querySelectorAll('.header-music-link');
    buttons.forEach(button => {
      // 激活状态（播放器已打开过）
      if (isActivated) {
        button.classList.add('header-music-link--activated');
      } else {
        button.classList.remove('header-music-link--activated');
      }
      // 展开状态
      if (isExpanded) {
        button.classList.add('header-music-link--expanded');
      } else {
        button.classList.remove('header-music-link--expanded');
      }
    });
  }, [isActivated, isExpanded]);

  // 最小化弹窗（但保持 iframe 挂载）
  const handleMinimize = useCallback(() => {
    setIsExpanded(false);
  }, []);

  // 从迷你播放器展开
  const handleExpand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  // 完全关闭播放器（停止音乐）
  const handleClose = useCallback(() => {
    setIsActivated(false);
    setIsExpanded(false);
  }, []);

  // 未激活时不渲染任何内容
  if (!isActivated) return null;

  return (
    <div className={styles.musicPlayerWrapper}>
      {/* 弹窗 - 始终挂载，通过 CSS 控制显示/隐藏 */}
      <div className={`${styles.musicPlayerContainer} ${isExpanded ? styles.expanded : styles.minimized}`}>
        <MusicPopup
          onMinimize={handleMinimize}
          onClose={handleClose}
        />
      </div>

      {/* 迷你播放器 - 最小化时显示 */}
      {!isExpanded && (
        <MiniPlayer
          onExpand={handleExpand}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
