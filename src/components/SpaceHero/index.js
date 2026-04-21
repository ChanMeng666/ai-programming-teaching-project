import React from 'react';
import Translate, { translate } from '@docusaurus/Translate';
import GlassPanel from '../GlassPanel';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

// 火箭图标组件
function RocketIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

export default function SpaceHero() {
  return (
    <header className={styles.spaceHero}>
      <div className={styles.heroContainer}>
        {/* 左侧：主内容面板 */}
        <GlassPanel highlight className={styles.heroPanel} padding="large">
          {/* 主标题 */}
          <h1 className={styles.title}>
            <Translate id="homepage.hero.welcome">Welcome to</Translate>
            <span className={styles.highlightText}>
              <Translate id="homepage.hero.platform">AI Programming Universe</Translate>
            </span>
          </h1>

          {/* 描述 */}
          <p className={styles.subtitle}>
            <Translate id="homepage.hero.description2">
              Embark on a journey through the programming galaxy. Whether you're a beginner or an experienced developer,
              AI will be your co-pilot, helping you explore the infinite possibilities of the code universe.
            </Translate>
          </p>

          {/* 按钮组 */}
          <div className={styles.actions}>
            <Link to="/docs/curriculum-outline" className={styles.primaryButton}>
              <RocketIcon />
              <Translate id="homepage.hero.startButton">Start Exploring</Translate>
            </Link>
            <Link to="/blog" className={styles.secondaryButton}>
              <Translate id="homepage.hero.blogButton">Latest Updates</Translate>
            </Link>
          </div>
        </GlassPanel>

        {/* 右侧：火箭视觉 */}
        <div className={styles.heroVisual}>
          <div className={styles.rocketWrapper}>
            <img
              src="/img/space/rocket-side-blue.png"
              alt=""
              className={styles.rocket}
            />
            <div className={styles.rocketGlow} />
          </div>
        </div>
      </div>
    </header>
  );
}
