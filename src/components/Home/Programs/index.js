import React from 'react';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import styles from './styles.module.css';

/**
 * Programs — the five curriculum versions as white cards on the cream canvas.
 * TECHNEST 2026 is featured (spans the full width, carries spot art + a coral
 * pill CTA); the remaining four are a collapsing grid of ghost-link cards.
 * Labels/paths mirror docusaurus.config.js `versions` + footer links.
 */
export default function Programs() {
  return (
    <section className={`mm-section ${styles.section}`}>
      <div className={`${styles.head} mm-reveal`}>
        <span className="mm-eyebrow">
          <Translate id="homepage.programs.eyebrow">Curriculum</Translate>
        </span>
        <h2 className="mm-heading-lg">
          <Translate id="homepage.programs.heading">
            Pick your programme.
          </Translate>
        </h2>
      </div>

      <div className={`${styles.grid} mm-reveal-stagger`}>
        {/* Featured — TECHNEST 2026 */}
        <article className={`mm-card ${styles.card} ${styles.featured}`}>
          <div className={styles.featuredBody}>
            <span className={`mm-chip ${styles.badge}`}>
              <Translate id="homepage.programs.featuredBadge">
                Now enrolling
              </Translate>
            </span>
            <h3 className={`mm-heading ${styles.cardTitle}`}>
              <Translate id="homepage.programs.technest.title">
                TECHNEST 2026
              </Translate>
            </h3>
            <p className={styles.cardDesc}>
              <Translate id="homepage.programs.technest.desc">
                Our flagship 2026 programme — an eight-week, project-first path
                from dev-tools setup to a deployed capstone.
              </Translate>
            </p>
            <Link
              className={`mm-btn mm-btn-coral ${styles.featuredCta}`}
              to="/docs/programme/about-technest"
            >
              <Translate id="homepage.programs.technest.cta">
                Start the programme
              </Translate>
            </Link>
          </div>
          <div className={styles.featuredArt} aria-hidden="true">
            <img
              src="/img/illustrations/home-build.webp"
              alt=""
              width={520}
              height={420}
              loading="lazy"
              className={styles.featuredArtImg}
            />
          </div>
        </article>

        {/* Peyvand Academy 2026 */}
        <ProgramCard
          title={
            <Translate id="homepage.programs.peyvand.title">
              Peyvand Academy 2026
            </Translate>
          }
          desc={
            <Translate id="homepage.programs.peyvand.desc">
              A focused workshop series pairing newcomers with AI tooling to ship
              real work fast.
            </Translate>
          }
          to="/docs/2026-peyvand-academy/programme/about-workshop"
        />

        {/* HER WAKA 2026 */}
        <ProgramCard
          title={
            <Translate id="homepage.programs.herwaka.title">
              HER WAKA 2026
            </Translate>
          }
          desc={
            <Translate id="homepage.programs.herwaka.desc">
              A supportive on-ramp into tech, guiding first-time coders from idea
              to a working project.
            </Translate>
          }
          to="/docs/2026-her-waka/programme/about-her-waka"
        />

        {/* Summer 2025 */}
        <ProgramCard
          title={
            <Translate id="homepage.programs.summer2025.title">
              Summer 2025
            </Translate>
          }
          desc={
            <Translate id="homepage.programs.summer2025.desc">
              The Forward with Her summer curriculum — basics, personal website,
              and hands-on practice.
            </Translate>
          }
          to="/docs/2025-summer/intro"
        />

        {/* Winter 2024 */}
        <ProgramCard
          title={
            <Translate id="homepage.programs.winter2024.title">
              Winter 2024
            </Translate>
          }
          desc={
            <Translate id="homepage.programs.winter2024.desc">
              The original Forward with Her archive — the complete beginner track
              from setup to deployment.
            </Translate>
          }
          to="/docs/2024-winter/intro"
        />
      </div>
    </section>
  );
}

function ProgramCard({ title, desc, to }) {
  return (
    <article className={`mm-card ${styles.card}`}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{desc}</p>
      <Link className={styles.explore} to={to}>
        <Translate id="homepage.programs.explore">Explore</Translate>
        <span aria-hidden="true"> →</span>
      </Link>
    </article>
  );
}
