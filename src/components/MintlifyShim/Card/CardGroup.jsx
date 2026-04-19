import React from 'react';
import styles from './styles.module.css';

export default function CardGroup({cols = 2, children}) {
  const numericCols = Number(cols) || 2;
  const clamped = Math.min(Math.max(numericCols, 1), 4);
  return (
    <div className={styles.group} data-cols={clamped}>
      {children}
    </div>
  );
}
