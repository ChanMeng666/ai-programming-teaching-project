import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import styles from './styles.module.css';

/**
 * Swizzled NotFound/Content — MindMarket 404.
 *
 * We replace the stock content entirely (no @theme-original render). The parent
 * @theme/NotFound (theme-classic) still wraps this in <Layout> and sets the
 * PageMetadata title, so the floating nav and yellow footer render around us.
 */
export default function NotFoundContent({ className }) {
  return (
    <main className={clsx('mm-section', styles.wrapper, className)}>
      <div className={styles.inner}>
        <p className="mm-404-code" aria-hidden="true">404</p>

        <h1 className={styles.headline}>
          <Translate
            id="theme.NotFound.headline"
            description="Playful headline on the MindMarket 404 page">
            This page wandered off.
          </Translate>
        </h1>

        <p className={styles.subline}>
          <Translate
            id="theme.NotFound.subline"
            description="Sub-line under the 404 headline">
            The link may be broken or the page may have moved. Let's get you back on track.
          </Translate>
        </p>

        <img
          className={styles.art}
          src="/img/illustrations/not-found.webp"
          alt={translate({
            id: 'theme.NotFound.imageAlt',
            message: 'A paper-cut character searching with a magnifying glass',
            description: 'Alt text for the 404 illustration',
          })}
          width="420"
          height="420"
          loading="eager"
        />

        <div className={styles.actions}>
          <Link className="mm-btn mm-btn-coral" to="/">
            <Translate
              id="theme.NotFound.cta.home"
              description="Primary CTA on the 404 page">
              Take me home
            </Translate>
          </Link>
          <Link className="mm-btn mm-btn-ghost" to="/docs/programme/about-technest">
            <Translate
              id="theme.NotFound.cta.tutorials"
              description="Secondary CTA on the 404 page">
              Browse tutorials
            </Translate>
            <span className="mm-btn-dot mm-btn-dot--green" />
          </Link>
        </div>
      </div>
    </main>
  );
}
