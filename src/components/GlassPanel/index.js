import React from 'react';
import styles from './styles.module.css';

export default function GlassPanel({
  children,
  className = '',
  highlight = false,
  padding = 'normal',
}) {
  const paddingClass = {
    none: styles.paddingNone,
    small: styles.paddingSmall,
    normal: styles.paddingNormal,
    large: styles.paddingLarge,
  }[padding] || styles.paddingNormal;

  return (
    <div className={`${styles.glassPanel} ${paddingClass} ${className}`}>
      {highlight && <div className={styles.highlightGlow} />}
      <div className={styles.glassInner}>
        {children}
      </div>
    </div>
  );
}
