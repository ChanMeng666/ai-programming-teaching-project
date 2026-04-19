import React from 'react';
import styles from './styles.module.css';

export default function Steps({children}) {
  return <ol className={styles.steps}>{children}</ol>;
}
