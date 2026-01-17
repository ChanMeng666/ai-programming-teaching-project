import React, { useMemo } from 'react';
import styles from './styles.module.css';

// 生成随机星星数据
function generateStars(count) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
    });
  }
  return stars;
}

export default function StarField({ count = 100 }) {
  const stars = useMemo(() => generateStars(count), [count]);

  return (
    <div className={styles.starField}>
      {stars.map((star) => (
        <div
          key={star.id}
          className={styles.star}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
      {/* 添加几颗大的闪烁星星 */}
      <div className={`${styles.star} ${styles.starLarge}`} style={{ left: '15%', top: '20%' }} />
      <div className={`${styles.star} ${styles.starLarge}`} style={{ left: '85%', top: '15%' }} />
      <div className={`${styles.star} ${styles.starLarge}`} style={{ left: '70%', top: '60%' }} />
      <div className={`${styles.star} ${styles.starLarge}`} style={{ left: '25%', top: '75%' }} />
      <div className={`${styles.star} ${styles.starLarge}`} style={{ left: '50%', top: '40%' }} />
    </div>
  );
}
