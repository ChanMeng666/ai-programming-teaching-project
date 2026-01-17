import React from 'react';
import styles from './styles.module.css';

export default function OrbitingPlanet({
  image = '/img/space/planet-ice.png',
  size = 120,
  orbitDuration = 120,
  orbitRadiusX = 45,
  orbitRadiusY = 10,
  startOffset = 0,
  className = '',
}) {
  return (
    <div
      className={`${styles.orbitContainer} ${className}`}
      style={{
        '--orbit-duration': `${orbitDuration}s`,
        '--orbit-radius-x': `${orbitRadiusX}vw`,
        '--orbit-radius-y': `${orbitRadiusY}vw`,
        '--start-offset': startOffset,
      }}
    >
      <div className={styles.planet}>
        <img
          src={image}
          alt="Orbiting planet"
          className={styles.planetImage}
          style={{
            width: `${size}px`,
            height: `${size}px`,
          }}
        />
        {/* 行星光晕 */}
        <div
          className={styles.planetGlow}
          style={{
            width: `${size * 1.5}px`,
            height: `${size * 1.5}px`,
          }}
        />
      </div>
    </div>
  );
}
