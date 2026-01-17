import React from 'react';
import styles from './styles.module.css';

/**
 * 音乐播放器弹窗组件
 *
 * 注意：iframe 由 iframeManager 独立管理，不在此组件中渲染
 * 此组件只渲染弹窗的头部和底部，iframe 通过 CSS 定位显示在中间
 */
export default function MusicPopup({ onMinimize, onClose }) {
  return (
    <div className={styles.popup}>
      {/* 头部 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.waveform}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className={styles.title}>背景音乐</span>
        </div>

        <div className={styles.headerActions}>
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

      {/* 中间区域 - 占位，iframe 通过 iframeManager 独立渲染并定位在此处 */}
      <div className={styles.content} />

      {/* 底部提示 */}
      <div className={styles.footer}>
        <span className={styles.footerTip}>
          点击最小化按钮可隐藏窗口，音乐将继续播放
        </span>
      </div>
    </div>
  );
}
