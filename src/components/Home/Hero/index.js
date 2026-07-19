import React from 'react';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import styles from './styles.module.css';

/**
 * Hero — centered display headline on the cream canvas, twin CTAs, and a
 * paper-cut illustration that bleeds from the bottom edge into the next section
 * (no frame, no clipping, per the MindMarket spec).
 */
export default function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.inner}>
        <span className={`mm-eyebrow ${styles.eyebrow} mm-reveal`}>
          <Translate id="homepage.hero.eyebrow">AI Programming Education</Translate>
        </span>

        <h1 className={`mm-display ${styles.title} mm-reveal`}>
          <Translate id="homepage.hero.platform">Learn to build with AI.</Translate>
        </h1>

        <p className={`${styles.subtitle} mm-reveal`}>
          <Translate id="homepage.hero.description2">
            A hands-on, beginner-friendly path from your first line of code to a
            live project — with AI as your co-pilot the whole way.
          </Translate>
        </p>

        <div className={`${styles.actions} mm-reveal`}>
          <Link
            className={`mm-btn mm-btn-coral ${styles.cta}`}
            to="/docs/programme/about-technest"
          >
            <Translate id="homepage.hero.startButton">Start Learning</Translate>
          </Link>
          <Link className={`mm-btn mm-btn-ghost ${styles.cta}`} to="/blog">
            <span className="mm-btn-dot mm-btn-dot--blue" aria-hidden="true" />
            <Translate id="homepage.hero.blogButton">Read the Blog</Translate>
          </Link>
        </div>
      </div>

      <div className={styles.illustration}>
        <img
          src="/img/illustrations/hero.webp"
          alt={translate({
            id: 'homepage.hero.imageAlt',
            message:
              'Three friends building a website out of oversized code blocks',
          })}
          width={1200}
          height={800}
          loading="eager"
          fetchpriority="high"
          className={styles.illustrationImg}
        />
      </div>
    </header>
  );
}
