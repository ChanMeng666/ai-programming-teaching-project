import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

// Mintlify 的 <Card title icon href color> 常用来做入口卡片。
// 这里做朴素实现：有 href 就整体点击跳转，icon 原样作字符/类名显示，color 改边框色。
export default function Card({title, icon, href, color, horizontal, children}) {
  const style = color ? {borderColor: color} : undefined;

  const body = (
    <div className={styles.card} style={style} data-horizontal={horizontal ? 'true' : undefined}>
      {(title || icon) && (
        <div className={styles.header}>
          {icon && <span className={styles.icon} aria-hidden="true">{typeof icon === 'string' ? '●' : icon}</span>}
          {title && <span className={styles.title}>{title}</span>}
        </div>
      )}
      {children && <div className={styles.body}>{children}</div>}
    </div>
  );

  if (href) {
    return (
      <Link to={href} className={styles.link}>
        {body}
      </Link>
    );
  }
  return body;
}
