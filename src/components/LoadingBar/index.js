import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

export default function LoadingBar() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          setTimeout(() => setIsVisible(false), 200);
          return 100;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={styles.loadingBarContainer}>
      <div 
        className={styles.loadingBar} 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
} 