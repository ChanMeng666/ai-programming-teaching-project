import React from 'react';
import { getTranslations } from './i18n';
import styles from './styles.module.css';

/**
 * 音乐播放器弹窗组件
 *
 * 架构说明：
 * - 头部和底部是独立的固定定位元素
 * - iframe 由 iframeManager 独立管理，位于头部和底部之间
 * - 三者通过 CSS 定位对齐，形成视觉上的完整弹窗
 * - 支持中英文国际化
 */
export default function MusicPopup({ onMinimize, onClose, isMobile, locale }) {
  const t = getTranslations(locale);

  return (
    <>
      {/* 头部 - 独立固定定位 */}
      <div className={`${styles.popupHeader} ${isMobile ? styles.mobileHeader : ''}`}>
        <div className={styles.headerLeft}>
          <div className={styles.waveform}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className={styles.title}>{t.title}</span>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.minimizeButton}
            onClick={onMinimize}
            aria-label={t.minimizeLabel}
            title={t.minimizeLabel}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t.closeLabel}
            title={t.closeLabel}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* 底部提示 - 独立固定定位 */}
      <div className={`${styles.popupFooter} ${isMobile ? styles.mobileFooter : ''}`}>
        <span className={styles.footerTip}>
          {t.footerTip}
        </span>
      </div>
    </>
  );
}
