import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useScrollReveal from '@site/src/hooks/useScrollReveal';
import { awardBySlug, issuedOnFor } from '@site/src/data/awards';
import ProjectCard from './ProjectCard';
import useCapstoneProjects from './useCapstoneProjects';
import { TRACKS, useTrackLabels } from './tracks';
import styles from './styles.module.css';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div
      className={`${styles.toast} ${
        type === 'success' ? styles.toastSuccess : styles.toastError
      }`}
    >
      {message}
    </div>
  );
}

// Browser-only: reads localStorage and polls the API. The page mounts it inside
// <BrowserOnly>.
export default function CapstoneShowcase() {
  const {
    i18n: { currentLocale },
  } = useDocusaurusContext();
  const {
    projects,
    loading,
    error,
    updatedAt,
    voted,
    busySlugs,
    toast,
    dismissToast,
    markActive,
    toggleVote,
  } = useCapstoneProjects();
  const [activeTrack, setActiveTrack] = useState('__all__');
  const trackLabels = useTrackLabels();

  // Filtering is the main "I'm still here" signal from a passive viewer, so it
  // keeps the live poll alive alongside voting.
  const selectTrack = (track) => {
    markActive();
    setActiveTrack(track);
  };

  // Re-scan .mm-reveal elements whenever the project list changes (the grids
  // only mount once data arrives). Presentation only — no data dependency.
  useScrollReveal([projects]);

  const filterAllLabel = translate({
    id: 'capstoneShowcase.filterAll',
    message: 'All',
  });

  // Order by frozen award rank. Award voting closed on FROZEN_AT and the
  // certificates are permanent, so ordering by the still-climbing live vote
  // count would eventually show a non-medalist above a medalist and quietly
  // contradict the credentials. Likes keep counting; they just no longer
  // reorder anything.
  //
  // Any project without an award record (i.e. published after the freeze) falls
  // below every awarded one, ordered by the original votes-desc / submittedAt-asc
  // rule so the page still behaves sensibly.
  const sorted = [...projects].sort((a, b) => {
    const ra = awardBySlug(a.slug)?.rank ?? Infinity;
    const rb = awardBySlug(b.slug)?.rank ?? Infinity;
    if (ra !== rb) return ra - rb;
    const va = a.votes ?? 0;
    const vb = b.votes ?? 0;
    if (vb !== va) return vb - va;
    return (a.submittedAt || '').localeCompare(b.submittedAt || '');
  });

  // The podium, from the frozen results — not "whoever is on top right now".
  const top3 = sorted.filter((p) => (awardBySlug(p.slug)?.rank ?? Infinity) <= 3);

  // "All Projects" is a complete, filterable list of every project — the Top 3
  // spotlight above is an additive highlight, not a slice removed from the grid.
  // So the grid always renders the full sorted list (filtered by track), which
  // keeps it non-empty whenever there are projects and makes the track filters
  // behave correctly regardless of how many are in the spotlight.
  const gridProjects =
    activeTrack === '__all__'
      ? sorted
      : sorted.filter((p) => p.track === activeTrack);

  const lastUpdatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '';

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={dismissToast}
          />
        )}

        <header className={styles.heroSection}>
          <div className={styles.heroCopy}>
            <span className={`mm-eyebrow ${styles.heroEyebrow}`}>
              {translate({
                id: 'capstoneShowcase.eyebrow',
                message: 'Live Showcase',
              })}
            </span>
            <h1 className={styles.title}>
              {translate({
                id: 'capstoneShowcase.heroTitle',
                message: 'TECHNEST 2026 Capstone Showcase',
              })}
            </h1>
            <p className={styles.subtitle}>
              {translate({
                id: 'capstoneShowcase.heroSubtitle',
                message:
                  'Capstone projects from TECHNEST 2026 Weeks 9–12. Awards are final — likes stay open, so keep showing these builders some support.',
              })}
            </p>
            <p className={styles.awardsNote}>
              {translate(
                {
                  id: 'capstoneShowcase.awardsClosed',
                  message:
                    'Award voting closed {date}. Every project earned a credential —',
                },
                { date: issuedOnFor(currentLocale) }
              )}{' '}
              <Link to="/certificate">
                {translate({
                  id: 'capstoneShowcase.awardsLink',
                  message: 'view all certificates',
                })}
              </Link>
              .
            </p>
            {updatedAt && (
              <p className={styles.updatedAt}>
                <span className={styles.pollDot} aria-hidden="true" />
                <span className={styles.liveLabel}>
                  {translate({
                    id: 'capstoneShowcase.live',
                    message: 'Live',
                  })}
                </span>
                <span className={styles.updatedText}>
                  {translate({
                    id: 'capstoneShowcase.lastUpdated',
                    message: 'Last updated',
                  })}
                  : {lastUpdatedLabel}
                </span>
              </p>
            )}
          </div>
          <img
            className={styles.heroArt}
            src="/img/illustrations/capstone.webp"
            alt={translate({
              id: 'capstoneShowcase.heroImageAlt',
              message: 'Paper-cut illustration of a winners’ podium',
            })}
            width={480}
            height={480}
            loading="lazy"
          />
        </header>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingDots}>
              <span />
              <span />
              <span />
            </div>
            <p>
              {translate({
                id: 'capstoneShowcase.loading',
                message: 'Loading projects…',
              })}
            </p>
          </div>
        ) : error && projects.length === 0 ? (
          <div className={`mm-card ${styles.stateCard}`}>
            <span className={`mm-chip ${styles.errorChip}`}>
              <span
                className={`${styles.linkDot} ${styles.linkDotCoral}`}
                aria-hidden="true"
              />
              {translate({
                id: 'capstoneShowcase.errorLabel',
                message: 'Error',
              })}
            </span>
            <p className={styles.stateText}>
              {translate({
                id: 'capstoneShowcase.fetchError',
                message:
                  "Couldn't load capstone projects. Please refresh in a moment.",
              })}
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className={`mm-card ${styles.stateCard}`}>
            <img
              className={styles.stateArt}
              src="/img/illustrations/capstone.webp"
              alt=""
              aria-hidden="true"
              width={200}
              height={200}
              loading="lazy"
            />
            <p className={styles.stateText}>
              {translate({
                id: 'capstoneShowcase.empty',
                message:
                  'No published capstone projects yet — please check back closer to Demo Day.',
              })}
            </p>
          </div>
        ) : (
          <>
            {top3.length >= 3 && (
              <section
                className={styles.spotlightSection}
                aria-labelledby="capstone-spotlight"
              >
                <h2
                  id="capstone-spotlight"
                  className={styles.sectionTitle}
                >
                  {translate({
                    id: 'capstoneShowcase.spotlight.title',
                    message: 'Award Winners',
                  })}
                </h2>
                <div
                  className={`mm-reveal mm-reveal-stagger ${styles.spotlightGrid}`}
                >
                  {top3.map((p, i) => (
                    <ProjectCard
                      key={p.id || p.slug}
                      project={p}
                      rank={i + 1}
                      spotlight
                      trackLabels={trackLabels}
                      voted={voted.has(p.slug)}
                      busy={busySlugs.has(p.slug)}
                      onToggleVote={toggleVote}
                    />
                  ))}
                </div>
              </section>
            )}

            <section
              className={styles.gridSection}
              aria-labelledby="capstone-grid"
            >
              <div className={styles.gridHeader}>
                <h2 id="capstone-grid" className={styles.sectionTitle}>
                  {top3.length >= 3
                    ? translate({
                        id: 'capstoneShowcase.grid.title.more',
                        message: 'All Projects',
                      })
                    : translate({
                        id: 'capstoneShowcase.grid.title',
                        message: 'Projects',
                      })}
                </h2>
                <div className={styles.filterTabs} role="tablist">
                  <button
                    role="tab"
                    aria-selected={activeTrack === '__all__'}
                    className={`${styles.filterTab} ${
                      activeTrack === '__all__' ? styles.filterTabActive : ''
                    }`}
                    onClick={() => selectTrack('__all__')}
                  >
                    {filterAllLabel}
                  </button>
                  {TRACKS.map((track) => (
                    <button
                      key={track}
                      role="tab"
                      aria-selected={activeTrack === track}
                      className={`${styles.filterTab} ${
                        activeTrack === track ? styles.filterTabActive : ''
                      }`}
                      onClick={() => selectTrack(track)}
                    >
                      {trackLabels[track]}
                    </button>
                  ))}
                </div>
              </div>

              {gridProjects.length === 0 ? (
                <div className={`mm-card ${styles.stateCard}`}>
                  <img
                    className={styles.stateArt}
                    src="/img/illustrations/capstone.webp"
                    alt=""
                    aria-hidden="true"
                    width={200}
                    height={200}
                    loading="lazy"
                  />
                  <p className={styles.stateText}>
                    {translate({
                      id: 'capstoneShowcase.emptyTrack',
                      message: 'No projects in this track yet.',
                    })}
                  </p>
                </div>
              ) : (
                <div
                  className={`mm-reveal mm-reveal-stagger ${styles.cardGrid}`}
                >
                  {gridProjects.map((p) => {
                    const idx = sorted.indexOf(p);
                    return (
                      <ProjectCard
                        key={p.id || p.slug}
                        project={p}
                        rank={idx + 1}
                        trackLabels={trackLabels}
                        voted={voted.has(p.slug)}
                        busy={busySlugs.has(p.slug)}
                        onToggleVote={toggleVote}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
