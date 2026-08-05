/**
 * Public verification page for one TECHNEST 2026 capstone credential.
 *
 * This page is the thing a recruiter actually clicks: it is what LinkedIn's
 * "Credential URL" field points at, and its og:image is what renders in the
 * feed when a student shares the link. So it has to state the facts plainly
 * and be verifiable by a stranger.
 *
 * Deliberately NOT internationalised. Every other page in src/pages wraps its
 * copy in translate(); these credentials are issued in English only, so
 * translating the chrome around an English certificate would imply a Chinese
 * credential exists. See CLAUDE.md.
 *
 * The certificate image is rendered by scripts/render-certificates.mjs from
 * scripts/certificate-template.html — this page displays that exact PNG rather
 * than re-implementing the layout in React, so the page and the download can
 * never drift apart.
 */
import React, { useCallback, useState } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useScrollReveal from '@site/src/hooks/useScrollReveal';
import {
  AWARDS,
  COHORT,
  FROZEN_AT,
  INSTRUCTOR,
  ISSUED_ON,
  ISSUED_ON_LABEL,
  ISSUER,
  SITE_URL,
  TIERS,
  awardBySlug,
  certificatePath,
  credentialName,
  linkedInAddUrl,
  socialImageUrl,
} from '@site/src/data/awards';
import styles from './styles.module.css';

const RANK_ORDINAL = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th' };

function suggestedPost(award, tier) {
  return [
    `I'm happy to share that ${award.title} received ${tier.label} in the ${COHORT} Capstone.`,
    '',
    award.citation,
    '',
    `Live: ${award.liveURL}`,
    `Code: ${award.repoURL}`,
    `Credential: ${SITE_URL}${certificatePath(award)}`,
    '',
    `Thank you to ${INSTRUCTOR} and to everyone who voted.`,
  ].join('\n');
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      },
      () => {
        /* clipboard denied — the text is selectable on the page anyway */
      }
    );
  }, [text]);

  return (
    <button type="button" className={`mm-btn mm-btn-ghost ${styles.copyBtn}`} onClick={onCopy}>
      {copied ? 'Copied' : 'Copy text'}
      <span className="mm-btn-dot mm-btn-dot--green" />
    </button>
  );
}

export default function Certificate({ slug }) {
  useScrollReveal();

  const award = awardBySlug(slug);
  if (!award) {
    // Only reachable if a page file is added without a matching awards.json entry.
    return (
      <Layout title="Credential not found">
        <div className="mm-section">
          <h1 className="mm-heading">Credential not found</h1>
          <p>
            No award is recorded for “{slug}”. See{' '}
            <Link to="/certificate">all TECHNEST 2026 credentials</Link>.
          </p>
        </div>
      </Layout>
    );
  }

  const tier = TIERS[award.tier];
  const name = credentialName(award);
  const pageUrl = `${SITE_URL}${certificatePath(award)}`;
  const ogImage = socialImageUrl(award);
  const pngPath = `/img/certificates/${award.slug}.png`;
  const webpPath = `/img/certificates/${award.slug}.webp`;
  const description = `${award.team} received ${tier.label} in the ${COHORT} Capstone for ${award.title}. Credential ${award.certId}, issued ${ISSUED_ON_LABEL} by ${ISSUER}.`;
  const post = suggestedPost(award, tier);

  return (
    <Layout title={`${award.team} — ${tier.label}, ${COHORT} Capstone`} description={description}>
      <Head>
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${award.team} — ${tier.label}, ${COHORT} Capstone`} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
        {/* Always the English URL, including on the /zh-Hans route: the
            credential itself is English-only, so the two routes serve identical
            content and the English one is genuinely canonical. It is also the
            URL written on the certificate, in the QR, and in LinkedIn's
            Credential URL field. */}
        <link rel="canonical" href={pageUrl} />
      </Head>

      <div className={styles.page}>
        <div className="mm-section">
          {/* ---- header ---- */}
          <header className={`mm-reveal ${styles.header}`}>
            <span className="mm-eyebrow">{COHORT} Capstone</span>
            <h1 className={`mm-heading-lg ${styles.title}`}>{tier.label}</h1>
            <p className={styles.subtitle}>
              Awarded to <strong>{award.team}</strong> for <strong>{award.title}</strong>
            </p>
            <p className={styles.citation}>{award.citation}</p>
          </header>

          {/* ---- the certificate ---- */}
          <figure className={`mm-card mm-reveal ${styles.certCard}`}>
            <a href={pngPath} className={styles.certLink} download>
              <img
                className={styles.certImage}
                src={webpPath}
                width={1584}
                height={1120}
                alt={`Certificate of achievement: ${tier.label} awarded to ${award.team} for ${award.title}, ${COHORT} Capstone.`}
              />
            </a>
            <figcaption className={styles.certCaption}>
              Credential {award.certId} · issued {ISSUED_ON_LABEL}
            </figcaption>
          </figure>

          {/* ---- actions ---- */}
          <div className={`mm-reveal mm-reveal-stagger ${styles.actions}`}>
            <a
              className="mm-btn mm-btn-coral"
              href={linkedInAddUrl(award)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Add to LinkedIn profile
            </a>
            <a className="mm-btn mm-btn-ghost" href={pngPath} download>
              Download certificate
              <span className="mm-btn-dot mm-btn-dot--green" />
            </a>
            <a
              className="mm-btn mm-btn-ghost"
              href={award.liveURL}
              target="_blank"
              rel="noopener noreferrer"
            >
              View the project
              <span className="mm-btn-dot mm-btn-dot--blue" />
            </a>
            <a
              className="mm-btn mm-btn-ghost"
              href={award.repoURL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Source code
              <span className="mm-btn-dot mm-btn-dot--coral" />
            </a>
          </div>

          {/* ---- credential facts ---- */}
          <section className={`mm-card mm-reveal ${styles.facts}`} aria-labelledby="cert-facts">
            <h2 id="cert-facts" className={`mm-heading ${styles.sectionTitle}`}>
              Credential details
            </h2>
            <dl className={styles.dl}>
              <div className={styles.row}>
                <dt>Credential</dt>
                <dd>{name}</dd>
              </div>
              <div className={styles.row}>
                <dt>Awarded to</dt>
                <dd>{award.team}</dd>
              </div>
              <div className={styles.row}>
                <dt>Project</dt>
                <dd>
                  {award.title} <span className={styles.muted}>· {award.track} track</span>
                </dd>
              </div>
              <div className={styles.row}>
                <dt>Issued by</dt>
                <dd>
                  {ISSUER} — {INSTRUCTOR}, instructor
                </dd>
              </div>
              <div className={styles.row}>
                <dt>Date of issue</dt>
                <dd>
                  <time dateTime={ISSUED_ON}>{ISSUED_ON_LABEL}</time>
                </dd>
              </div>
              <div className={styles.row}>
                <dt>Credential ID</dt>
                <dd>
                  <code className={styles.code}>{award.certId}</code>
                </dd>
              </div>
              <div className={styles.row}>
                <dt>Credential URL</dt>
                <dd>
                  <code className={styles.code}>{pageUrl}</code>
                </dd>
              </div>
              <div className={styles.row}>
                <dt>Result</dt>
                <dd>
                  Placed {RANK_ORDINAL[award.rank]} of {AWARDS.length} with {award.votes} community{' '}
                  {award.votes === 1 ? 'vote' : 'votes'}
                </dd>
              </div>
              <div className={styles.row}>
                <dt>Expires</dt>
                <dd>Does not expire</dd>
              </div>
            </dl>

            <p className={styles.verifyNote}>
              This page is the official record of this credential. Award voting closed on{' '}
              <time dateTime={FROZEN_AT}>{ISSUED_ON_LABEL}</time> and the result is final —
              likes on the{' '}
              <Link to="/capstone-showcase">showcase</Link> keep counting but no longer affect
              any award.
            </p>
          </section>

          {/* ---- share helper ---- */}
          <section className={`mm-card mm-reveal ${styles.share}`} aria-labelledby="cert-share">
            <h2 id="cert-share" className={`mm-heading ${styles.sectionTitle}`}>
              Share it
            </h2>
            <p className={styles.shareLead}>
              A starting point for a LinkedIn post — edit it into your own words. Posting the
              credential link on its own also works: the preview card shows the certificate.
            </p>
            <pre className={styles.postText}>{post}</pre>
            <CopyButton text={post} />
          </section>

          <p className={`mm-reveal ${styles.back}`}>
            <Link to="/certificate">All {COHORT} credentials</Link>
            {' · '}
            <Link to="/capstone-showcase">Capstone showcase</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
