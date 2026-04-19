import React from 'react';
import styles from './styles.module.css';

export default function Frame({caption, children}) {
  return (
    <figure className={styles.frame}>
      <div className={styles.frameBody}>{children}</div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
