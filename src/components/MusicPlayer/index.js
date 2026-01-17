import React, { useState, useEffect, useCallback } from 'react';
import MusicPopup from './MusicPopup';
import styles from './styles.module.css';

/**
 * 音乐播放器组件
 * 监听导航栏中的音乐按钮点击，显示/隐藏 Suno 音乐播放器弹窗
 */
export default function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);

  // 监听导航栏按钮点击
  useEffect(() => {
    const handleToggle = (e) => {
      e.preventDefault();
      setIsOpen(prev => !prev);
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
      // 如果按钮还未渲染，使用 MutationObserver
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
  }, []);

  // 更新按钮激活状态
  useEffect(() => {
    const buttons = document.querySelectorAll('.header-music-link');
    buttons.forEach(button => {
      if (isOpen) {
        button.classList.add('header-music-link--active');
      } else {
        button.classList.remove('header-music-link--active');
      }
    });
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className={styles.musicPlayerContainer}>
      <MusicPopup onClose={handleClose} />
    </div>
  );
}
