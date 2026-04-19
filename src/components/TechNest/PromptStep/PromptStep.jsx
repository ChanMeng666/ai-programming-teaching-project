import React from 'react';
import styles from './styles.module.css';

export default function PromptStep({n, audience = 'Cursor', children}) {
  return (
    <div className={styles.promptStep}>
      <div className={styles.header}>
        <span className={styles.chip}>PROMPT</span>
        <span className={styles.title}>Step {n} · Say to {audience}:</span>
      </div>
      <blockquote className={styles.body}>{children}</blockquote>
    </div>
  );
}
