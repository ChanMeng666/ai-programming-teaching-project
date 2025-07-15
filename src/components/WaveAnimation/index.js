import React from 'react';
import styles from './styles.module.css';

const WaveAnimation = ({ 
  direction = 'down', 
  color = 'primary', 
  height = '100px',
  className = ''
}) => {
  const waveClass = `${styles.wave} ${styles[`wave--${direction}`]} ${styles[`wave--${color}`]} ${className}`;
  
  return (
    <div className={waveClass} style={{ height }}>
      <svg 
        className={styles.waveSvg}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
        shapeRendering="auto"
      >
        <defs>
          <path 
            id={`gentle-wave-${color}`}
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" 
          />
        </defs>
        <g className={styles.parallax}>
          <use xlinkHref={`#gentle-wave-${color}`} x="48" y="0" />
          <use xlinkHref={`#gentle-wave-${color}`} x="48" y="3" />
          <use xlinkHref={`#gentle-wave-${color}`} x="48" y="5" />
          <use xlinkHref={`#gentle-wave-${color}`} x="48" y="7" />
        </g>
      </svg>
    </div>
  );
};

export default WaveAnimation; 