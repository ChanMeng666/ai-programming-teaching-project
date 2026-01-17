import React, { useEffect, useRef } from 'react';
import { mountIframe } from './iframeManager';
import styles from './styles.module.css';

/**
 * 音乐播放器弹窗组件
 *
 * 使用 iframeManager 来管理 iframe，确保 iframe 不会因组件重新挂载而被销毁
 * 这样可以保持音乐播放状态
 */
export default function MusicPopup({ onMinimize, onClose }) {
  const iframeContainerRef = useRef(null);

  // 挂载 iframe 到容器
  useEffect(() => {
    if (iframeContainerRef.current) {
      mountIframe(iframeContainerRef.current);
    }
  }, []);

  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {/* 音乐波形动画 */}
          <div className={styles.waveform}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className={styles.title}>背景音乐</span>
        </div>

        <div className={styles.headerActions}>
          {/* 最小化按钮 */}
          <button
            className={styles.minimizeButton}
            onClick={onMinimize}
            aria-label="最小化（音乐继续播放）"
            title="最小化（音乐继续播放）"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* 关闭按钮 */}
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="关闭播放器（停止音乐）"
            title="关闭播放器（停止音乐）"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* iframe 容器 - 使用 ref 让 iframeManager 挂载 iframe */}
      <div className={styles.content} ref={iframeContainerRef} />

      {/* 底部提示 */}
      <div className={styles.footer}>
        <span className={styles.footerTip}>
          点击最小化按钮可隐藏窗口，音乐将继续播放
        </span>
      </div>
    </div>
  );
}
