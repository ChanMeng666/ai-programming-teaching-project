import React from 'react';
import styles from './styles.module.css';

export default function RecoverStep({n, children}) {
  return (
    <div className={styles.recoverStep}>
      <div className={styles.header}>
        <span className={styles.chip}>RECOVER</span>
        <span className={styles.title}>Step {n} · If stuck, say to AI:</span>
      </div>
      <blockquote className={styles.body}>{children}</blockquote>
    </div>
  );
}
