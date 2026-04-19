import React from 'react';
import styles from './styles.module.css';

export default function Step({title, children}) {
  return (
    <li className={styles.step}>
      {title && <h3 className={styles.stepTitle}>{title}</h3>}
      <div className={styles.stepBody}>{children}</div>
    </li>
  );
}
