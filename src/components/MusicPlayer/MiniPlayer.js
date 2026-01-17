import React from 'react';
import styles from './styles.module.css';

/**
 * 迷你播放器组件
 * 当主弹窗最小化时显示，提供快捷操作
 */
export default function MiniPlayer({ onExpand, onClose }) {
  return (
    <div className={styles.miniPlayer}>
      {/* 音乐波形动画指示器 */}
      <div className={styles.miniWaveform}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* 点击展开 */}
      <button
        className={styles.miniExpandArea}
        onClick={onExpand}
        aria-label="展开音乐播放器"
      >
        <span className={styles.miniTitle}>背景音乐播放中</span>
        <svg
          className={styles.miniExpandIcon}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* 关闭按钮（停止音乐） */}
      <button
        className={styles.miniCloseButton}
        onClick={onClose}
        aria-label="停止音乐"
        title="停止音乐"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
