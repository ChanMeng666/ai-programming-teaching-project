import React from 'react';
import styles from './styles.module.css';

const SUNO_EMBED_URL = 'https://suno.com/embed/da76e35e-d870-4eca-831a-22885d088ffc';

/**
 * 音乐播放器弹窗组件
 * 包含 Suno 音乐嵌入播放器
 *
 * 设计说明：
 * - 最小化按钮：隐藏弹窗但保持音乐播放
 * - 关闭按钮：完全停止音乐并关闭播放器
 */
export default function MusicPopup({ onMinimize, onClose }) {
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

      <div className={styles.content}>
        <iframe
          src={SUNO_EMBED_URL}
          className={styles.iframe}
          title="Suno Music Player"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* 底部提示 */}
      <div className={styles.footer}>
        <span className={styles.footerTip}>
          点击最小化按钮可隐藏窗口，音乐将继续播放
        </span>
      </div>
    </div>
  );
}
