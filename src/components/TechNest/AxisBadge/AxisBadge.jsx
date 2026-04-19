import React from 'react';
import styles from './styles.module.css';

const AXIS_CLASS = {
  JOB: styles.job,
  LIFE: styles.life,
  FUN: styles.fun,
  COOL: styles.cool,
};

export default function AxisBadge({axis, axes}) {
  const list = axes ?? (axis ? [axis] : []);
  if (list.length === 0) return null;
  return (
    <span className={styles.row}>
      {list.map((a) => (
        <span key={a} className={`${styles.badge} ${AXIS_CLASS[a] ?? ''}`}>
          {a}
        </span>
      ))}
    </span>
  );
}
