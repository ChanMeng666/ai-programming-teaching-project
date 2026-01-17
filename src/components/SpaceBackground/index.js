import React from 'react';
import StarField from '../StarField';
import OrbitingPlanet from '../OrbitingPlanet';
import styles from './styles.module.css';

export default function SpaceBackground() {
  return (
    <div className={styles.spaceBackground}>
      {/* 渐变背景 */}
      <div className={styles.gradientOverlay} />

      {/* 星星 */}
      <StarField count={80} />

      {/* 装饰性光晕 */}
      <div className={styles.glowOrb} style={{ top: '10%', right: '20%' }} />
      <div className={styles.glowOrb} style={{ bottom: '30%', left: '10%' }} />

      {/* 轨道行星 */}
      <OrbitingPlanet
        image="/img/space/planet-ice.png"
        size={100}
        orbitDuration={180}
        orbitRadiusX={40}
        orbitRadiusY={8}
        startOffset={0.2}
        className={styles.planet1}
      />
      <OrbitingPlanet
        image="/img/space/planet-gold.png"
        size={60}
        orbitDuration={240}
        orbitRadiusX={35}
        orbitRadiusY={12}
        startOffset={0.7}
        className={styles.planet2}
      />

      {/* 小型装饰球体 */}
      <div className={styles.floatingOrb} style={{ top: '15%', left: '8%' }}>
        <img src="/img/space/orb1.png" alt="" />
      </div>
      <div className={styles.floatingOrb} style={{ bottom: '20%', right: '12%' }}>
        <img src="/img/space/orb2.png" alt="" />
      </div>
      <div className={styles.floatingOrb} style={{ top: '60%', left: '5%' }}>
        <img src="/img/space/orb3.png" alt="" />
      </div>
    </div>
  );
}
