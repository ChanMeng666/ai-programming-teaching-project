import React from 'react';
import styles from './styles.module.css';

export default function Accordion({title, defaultOpen, children}) {
  return (
    <details className={styles.accordion} open={defaultOpen || undefined}>
      {title && <summary className={styles.summary}>{title}</summary>}
      <div className={styles.body}>{children}</div>
    </details>
  );
}
