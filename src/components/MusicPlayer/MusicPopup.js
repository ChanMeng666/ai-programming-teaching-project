import React from 'react';
import styles from './styles.module.css';

const SUNO_EMBED_URL = 'https://suno.com/embed/da76e35e-d870-4eca-831a-22885d088ffc';

/**
 * 音乐播放器弹窗组件
 * 包含 Suno 音乐嵌入播放器
 */
export default function MusicPopup({ onClose }) {
  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <span className={styles.title}>🎵 背景音乐</span>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="关闭音乐播放器"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
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
    </div>
  );
}
