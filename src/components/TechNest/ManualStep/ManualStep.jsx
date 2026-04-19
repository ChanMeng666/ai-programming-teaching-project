import React from 'react';
import styles from './styles.module.css';

export default function ManualStep({n, why, children}) {
  return (
    <div className={styles.manualStep}>
      <div className={styles.header}>
        <span className={styles.chip}>MANUAL</span>
        <span className={styles.title}>Step {n} · Manual (human only):</span>
      </div>
      <div className={styles.body}>{children}</div>
      {why && (
        <p className={styles.why}>
          <em>Why manual: {why}</em>
        </p>
      )}
    </div>
  );
}
