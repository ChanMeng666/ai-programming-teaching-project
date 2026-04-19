import React from 'react';
import styles from './styles.module.css';

export default function AccordionGroup({children}) {
  return <div className={styles.group}>{children}</div>;
}
