import React from 'react';
import styles from './styles.module.css';

// 使用基于时间的伪随机数生成器，确保每次刷新位置不同但动画连续
const getRandomStartAngle = (seed) => {
  // 使用当前时间戳和种子生成随机角度
  const now = Date.now();
  const hash = ((now * seed) % 360 + (now % 1000) * seed) % 360;
  return hash;
};

// 行星配置 - 模拟太阳系中行星绕太阳运动
// 每个行星的起始角度基于页面加载时间随机生成，模拟真实太阳系中行星的随机分布
const planets = [
  {
    name: 'Mercury',
    image: '/img/space/planets/Mercury.jpg',
    size: 20,
    orbitRadius: 70,
    duration: 180,  // 3分钟
    startAngle: getRandomStartAngle(7),
    color: '#c9a227',
  },
  {
    name: 'Venus',
    image: '/img/space/planets/Venus.jpg',
    size: 28,
    orbitRadius: 105,
    duration: 240,  // 4分钟
    startAngle: getRandomStartAngle(13),
    color: '#8c5d23',
  },
  {
    name: 'Earth',
    image: '/img/space/planets/Earth.jpg',
    size: 30,
    orbitRadius: 145,
    duration: 300,  // 5分钟
    startAngle: getRandomStartAngle(23),
    color: '#0496ff',
  },
  {
    name: 'Mars',
    image: '/img/space/planets/Mars.jpg',
    size: 24,
    orbitRadius: 185,
    duration: 360,  // 6分钟
    startAngle: getRandomStartAngle(37),
    color: '#db3a34',
  },
  {
    name: 'Jupiter',
    image: '/img/space/planets/Jupiter.jpg',
    size: 48,
    orbitRadius: 235,
    duration: 480,  // 8分钟
    startAngle: getRandomStartAngle(47),
    color: '#ff9100',
  },
  {
    name: 'Saturn',
    image: '/img/space/planets/Saturn.jpg',
    size: 42,
    orbitRadius: 290,
    duration: 600,  // 10分钟
    startAngle: getRandomStartAngle(59),
    color: '#a81510',
  },
  {
    name: 'Uranus',
    image: '/img/space/planets/Uranus.jpg',
    size: 34,
    orbitRadius: 340,
    duration: 720,  // 12分钟
    startAngle: getRandomStartAngle(71),
    color: '#004e89',
  },
];

export default function FeedsSpaceBackground() {
  return (
    <div className={styles.spaceBackground}>
      {/* 星空背景 */}
      <div className={styles.starsLayer} />
      <div className={styles.twinklingLayer} />
      
      {/* 渐变叠加层 */}
      <div className={styles.gradientOverlay} />

      {/* 太阳系容器 */}
      <div className={styles.solarSystem}>
        {/* 太阳 */}
        <div className={styles.sun}>
          <img src="/img/space/planets/Sun.jpg" alt="Sun" />
          <div className={styles.sunGlow} />
        </div>

        {/* 轨道和行星 */}
        {planets.map((planet) => (
          <div key={planet.name} className={styles.orbitContainer}>
            {/* 轨道环 */}
            <div
              className={styles.orbit}
              style={{
                width: `${planet.orbitRadius * 2}px`,
                height: `${planet.orbitRadius * 2}px`,
                boxShadow: `0 0 8px ${planet.color}40`,
              }}
            />
            {/* 行星 */}
            <div
              className={styles.planetOrbit}
              style={{
                '--orbit-radius': `${planet.orbitRadius}px`,
                '--duration': `${planet.duration}s`,
                '--start-angle': `${planet.startAngle}deg`,
              }}
            >
              <div
                className={styles.planet}
                style={{
                  width: `${planet.size}px`,
                  height: `${planet.size}px`,
                  boxShadow: `0 0 ${planet.size}px ${planet.color}80`,
                }}
              >
                <img src={planet.image} alt={planet.name} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
