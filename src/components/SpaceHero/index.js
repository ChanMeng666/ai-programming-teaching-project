import React from 'react';
import Translate, { translate } from '@docusaurus/Translate';
import GlassPanel from '../GlassPanel';
import SpaceButton from '../SpaceButton';
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
          {/* 徽章 */}
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>🚀</span>
            <Translate id="homepage.hero.badge">Code to the Stars</Translate>
          </div>

          {/* 主标题 */}
          <h1 className={styles.title}>
            <Translate id="homepage.hero.welcome">欢迎来到</Translate>
            <span className={styles.gradientText}>
              <Translate id="homepage.hero.platform">AI 编程宇宙</Translate>
            </span>
          </h1>

          {/* 描述 */}
          <p className={styles.subtitle}>
            <Translate id="homepage.hero.description2">
              在这里，你将踏上一段星际编程之旅。无论你是编程新手还是经验开发者，
              AI 都将成为你最强大的副驾驶，带你探索代码宇宙的无限可能。
            </Translate>
          </p>

          {/* 按钮组 */}
          <div className={styles.actions}>
            <SpaceButton to="/docs/intro" primary>
              <RocketIcon />
              <Translate id="homepage.hero.startButton">开始探索</Translate>
            </SpaceButton>
            <SpaceButton to="/blog">
              <Translate id="homepage.hero.blogButton">最新动态</Translate>
            </SpaceButton>
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
          {/* 高光装饰 */}
          <img
            src="/img/space/PinkHighlight.png"
            alt=""
            className={styles.highlight}
          />
        </div>
      </div>
    </header>
  );
}
