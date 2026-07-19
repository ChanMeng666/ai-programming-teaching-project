import React from 'react';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

const STEPS = [
  {
    id: 'homepage.how.step1',
    title: <Translate id="homepage.how.step1.title">Set up your tools</Translate>,
    desc: (
      <Translate id="homepage.how.step1.desc">
        Get a working dev environment and meet the AI assistants you'll build
        alongside — no prior experience needed.
      </Translate>
    ),
  },
  {
    id: 'homepage.how.step2',
    title: <Translate id="homepage.how.step2.title">Build real projects</Translate>,
    desc: (
      <Translate id="homepage.how.step2.desc">
        Follow project-first lessons where every concept lands in something you
        actually make, not just read about.
      </Translate>
    ),
  },
  {
    id: 'homepage.how.step3',
    title: <Translate id="homepage.how.step3.title">Ship it live</Translate>,
    desc: (
      <Translate id="homepage.how.step3.desc">
        Deploy your capstone to the web and share it — then showcase it to the
        community.
      </Translate>
    ),
  },
];

/**
 * HowItWorks — a white content card of three numbered steps (green circle
 * numerals) sitting beside a spot illustration on the cream canvas.
 */
export default function HowItWorks() {
  return (
    <section className={`mm-section ${styles.section}`}>
      <div className={styles.layout}>
        <div className={`mm-card ${styles.card} mm-reveal`}>
          <span className="mm-eyebrow">
            <Translate id="homepage.how.eyebrow">How it works</Translate>
          </span>
          <h2 className={`mm-heading ${styles.heading}`}>
            <Translate id="homepage.how.heading">
              Three steps to shipped.
            </Translate>
          </h2>
          <ol className={styles.steps}>
            {STEPS.map((step, i) => (
              <li key={step.id} className={styles.step}>
                <span className={styles.numeral} aria-hidden="true">
                  {i + 1}
                </span>
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className={`${styles.art} mm-reveal`} aria-hidden="true">
          <img
            src="/img/illustrations/home-learn.webp"
            alt=""
            width={520}
            height={520}
            loading="lazy"
            className={styles.artImg}
          />
        </div>
      </div>
    </section>
  );
}
