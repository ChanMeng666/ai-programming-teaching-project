import React from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

/**
 * Instructor — "who is actually teaching this". Answers the question raised by
 * HowItWorks and hands the visitor off to Chan's own site.
 *
 * Uses `mm-section` (contained), NOT `mm-band`: Community directly below is the
 * homepage's only full-bleed sandstone band, and a second one stacked against it
 * would read as one undifferentiated slab.
 *
 * The art column is her existing personal mark rather than a portrait — no photo
 * asset exists, all four homepage illustrations are already spent, and a
 * generated paper-cut "person" would read as a character, not as her. The mark is
 * already established as her avatar in ChatWidget.
 */
export default function Instructor() {
  return (
    <section className={`mm-section ${styles.section}`}>
      <div className={styles.inner}>
        <div className={`${styles.copy} mm-reveal`}>
          <span className="mm-eyebrow">
            <Translate id="homepage.instructor.eyebrow">Your instructor</Translate>
          </span>
          <h2 className={`mm-heading-lg ${styles.heading}`}>
            <Translate id="homepage.instructor.heading">
              Taught by someone who still ships.
            </Translate>
          </h2>
          <p className={styles.body}>
            <Translate id="homepage.instructor.body">
              Chan Meng builds production AI systems for paying customers, then
              teaches the same methods here. She has run five cohorts since 2024
              and keeps every lesson free and in both languages — because the
              material that got her started was free too.
            </Translate>
          </p>
          <div className={`${styles.links} mm-reveal-stagger`}>
            <Link
              className={`mm-btn mm-btn-coral ${styles.link}`}
              href="https://chanmeng.org/teaching"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Translate id="homepage.instructor.why">Why this is free</Translate>
            </Link>
            <Link
              className={`mm-btn mm-btn-ghost ${styles.link}`}
              href="https://chanmeng.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="mm-btn-dot mm-btn-dot--blue" aria-hidden="true" />
              <Translate id="homepage.instructor.portfolio">
                Her work and writing
              </Translate>
            </Link>
          </div>
        </div>

        <div className={styles.art}>
          <div className={`mm-card ${styles.idCard} mm-reveal`}>
            <img
              src="/img/chan_logo_without_brand_black.svg"
              alt=""
              aria-hidden="true"
              width={72}
              height={72}
              loading="lazy"
              className={styles.mark}
            />
            <p className={styles.name}>Chan Meng</p>
            <p className={styles.role}>
              <Translate id="homepage.instructor.role">
                AI Agent Architect &amp; Full-stack Engineer &middot; Auckland, NZ
              </Translate>
            </p>
            <div className={styles.chips}>
              <span className="mm-chip">
                <Translate id="homepage.instructor.chip.cohorts">
                  5 cohorts since 2024
                </Translate>
              </span>
              <span className="mm-chip">
                <Translate id="homepage.instructor.chip.bilingual">
                  153 lessons &times; 2 languages
                </Translate>
              </span>
              <span className="mm-chip">
                <Translate id="homepage.instructor.chip.license">
                  Apache-2.0 open source
                </Translate>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
