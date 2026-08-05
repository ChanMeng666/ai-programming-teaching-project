/**
 * /certificate — index of every TECHNEST 2026 capstone credential.
 *
 * English only, like the individual credential pages — see the note in
 * src/components/Certificate/index.js.
 */
import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useScrollReveal from '@site/src/hooks/useScrollReveal';
import {
  AWARDS,
  COHORT,
  INSTRUCTOR,
  ISSUED_ON,
  ISSUED_ON_LABEL,
  ISSUER,
  TIERS,
  certificatePath,
} from '@site/src/data/awards';
import styles from '@site/src/components/Certificate/styles.module.css';

export default function CertificateIndex() {
  useScrollReveal();

  const description = `Every credential issued for the ${COHORT} capstone — ${AWARDS.length} projects, awarded ${ISSUED_ON_LABEL} by ${ISSUER}.`;

  return (
    <Layout title={`${COHORT} Capstone Credentials`} description={description}>
      <div className={styles.page}>
        <div className="mm-section">
          <header className={`mm-reveal ${styles.header}`}>
            <span className="mm-eyebrow">Credentials</span>
            <h1 className={`mm-heading-lg ${styles.title}`}>{COHORT} Capstone</h1>
            <p className={styles.subtitle}>
              {AWARDS.length} projects, awarded{' '}
              <time dateTime={ISSUED_ON}>{ISSUED_ON_LABEL}</time> by {ISSUER}.
            </p>
            <p className={styles.citation}>
              Each credential has its own permanent page — that page is the verification.
              Placements were decided by community vote on the{' '}
              <Link to="/capstone-showcase">capstone showcase</Link>; technical review by{' '}
              {INSTRUCTOR}.
            </p>
          </header>

          <div className={`mm-reveal mm-reveal-stagger ${styles.indexGrid}`}>
            {AWARDS.map((award) => {
              const tier = TIERS[award.tier];
              return (
                <Link
                  key={award.slug}
                  to={certificatePath(award)}
                  className={`mm-card ${styles.indexCard}`}
                >
                  <img
                    className={styles.indexThumb}
                    src={`/img/certificates/${award.slug}.webp`}
                    width={1584}
                    height={1120}
                    loading="lazy"
                    alt={`${tier.label} certificate awarded to ${award.team} for ${award.title}.`}
                  />
                  <span className={styles.indexTier}>
                    <span
                      className={styles.indexAccent}
                      style={{ background: tier.accent }}
                      aria-hidden="true"
                    />
                    {tier.label}
                  </span>
                  <span className={styles.indexName}>{award.team}</span>
                  <span className={styles.indexProject}>
                    {award.title} · {award.certId}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
