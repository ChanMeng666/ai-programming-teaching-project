import React from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

/**
 * Community — a full-bleed sandstone band with a heading, three ghost-pill
 * links (each with a colored dot), and a spot illustration. Discord + GitHub
 * mirror the footer/navbar links; the message board is an internal route.
 */
export default function Community() {
  return (
    <section className={`mm-band ${styles.band}`}>
      <div className={`mm-section ${styles.inner}`}>
        <div className={`${styles.copy} mm-reveal`}>
          <span className="mm-eyebrow">
            <Translate id="homepage.community.eyebrow">Community</Translate>
          </span>
          <h2 className={`mm-heading-lg ${styles.heading}`}>
            <Translate id="homepage.community.heading">
              You're not learning alone.
            </Translate>
          </h2>
          <p className={styles.body}>
            <Translate id="homepage.community.body">
              Ask questions, share what you're building, and cheer each other on.
            </Translate>
          </p>
          <div className={`${styles.links} mm-reveal-stagger`}>
            <Link
              className={`mm-btn mm-btn-ghost ${styles.link}`}
              href="https://discord.gg/T3NJG5n98a"
            >
              <span className="mm-btn-dot mm-btn-dot--blue" aria-hidden="true" />
              <Translate id="homepage.community.discord">Join Discord</Translate>
            </Link>
            <Link
              className={`mm-btn mm-btn-ghost ${styles.link}`}
              to="/message-board/"
            >
              <span className="mm-btn-dot mm-btn-dot--green" aria-hidden="true" />
              <Translate id="homepage.community.board">Message Board</Translate>
            </Link>
            <Link
              className={`mm-btn mm-btn-ghost ${styles.link}`}
              href="https://github.com/ChanMeng666/ai-programming-teaching-project"
            >
              <span className="mm-btn-dot mm-btn-dot--coral" aria-hidden="true" />
              <Translate id="homepage.community.github">GitHub Repo</Translate>
            </Link>
          </div>
        </div>

        <div className={`${styles.art} mm-reveal`} aria-hidden="true">
          <img
            src="/img/illustrations/home-community.webp"
            alt=""
            width={480}
            height={480}
            loading="lazy"
            className={styles.artImg}
          />
        </div>
      </div>
    </section>
  );
}
