import React from 'react';
import styles from './styles.module.css';

export default function VerifyStep({n, children}) {
  return (
    <div className={styles.verifyStep}>
      <div className={styles.header}>
        <span className={styles.chip}>VERIFY</span>
        <span className={styles.title}>Step {n} · Verify:</span>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
