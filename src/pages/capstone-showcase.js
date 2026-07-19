import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useScrollReveal from '@site/src/hooks/useScrollReveal';
import styles from './capstone-showcase.module.css';

const API_BASE = 'https://programming-api.chanmeng.org';
const POLL_INTERVAL_MS = 30_000;
const TRACKS = ['Campus Life', 'Personal Growth', 'Creative Tools'];

const CLIENT_ID_KEY = 'capstoneShowcase.clientId';
const VOTED_KEY = 'capstoneShowcase.voted';

function safeLocalStorage() {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function getOrCreateClientId() {
  const ls = safeLocalStorage();
  if (!ls) return '';
  let id = ls.getItem(CLIENT_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `c-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    try {
      ls.setItem(CLIENT_ID_KEY, id);
    } catch {
      /* ignore quota */
    }
  }
  return id;
}

function readVotedSet() {
  const ls = safeLocalStorage();
  if (!ls) return new Set();
  try {
    const raw = ls.getItem(VOTED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeVotedSet(set) {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    ls.setItem(VOTED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore quota */
  }
}

function useTrackLabels() {
  return {
    'Campus Life': translate({
      id: 'capstoneShowcase.track.campusLife',
      message: 'Campus Life',
    }),
    'Personal Growth': translate({
      id: 'capstoneShowcase.track.personalGrowth',
      message: 'Personal Growth',
    }),
    'Creative Tools': translate({
      id: 'capstoneShowcase.track.creativeTools',
      message: 'Creative Tools',
    }),
  };
}

function trackClassName(track) {
  if (track === 'Campus Life') return styles.trackCampus;
  if (track === 'Personal Growth') return styles.trackGrowth;
  if (track === 'Creative Tools') return styles.trackCreative;
  return styles.trackOther;
}

function rankLabel(rank) {
  if (rank === 1)
    return translate({ id: 'capstoneShowcase.rank.first', message: '1st' });
  if (rank === 2)
    return translate({ id: 'capstoneShowcase.rank.second', message: '2nd' });
  return translate({ id: 'capstoneShowcase.rank.third', message: '3rd' });
}

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

function VoteButton({ slug, votes, voted, onToggle, busy }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    onToggle(slug, !voted);
  };
  return (
    <button
      type="button"
      className={`mm-btn ${styles.voteButton} ${
        voted
          ? `mm-btn-ghost ${styles.voteButtonActive}`
          : 'mm-btn-coral'
      }`}
      onClick={handleClick}
      disabled={busy}
      aria-pressed={voted}
      aria-label={
        voted
          ? translate({
              id: 'capstoneShowcase.voteButton.aria.unlike',
              message: 'Remove vote',
            })
          : translate({
              id: 'capstoneShowcase.voteButton.aria.like',
              message: 'Vote for this project',
            })
      }
    >
      <span className={styles.voteHeart} aria-hidden="true">
        {voted ? '❤' : '♡'}
      </span>
      <span className={styles.voteCountCircle}>
        <span className={styles.voteCount}>{votes}</span>
      </span>
    </button>
  );
}

function VideoPlayer({ youTubeId, heroImage, title }) {
  const [playing, setPlaying] = useState(false);
  if (!youTubeId) {
    if (heroImage) {
      return (
        <div className={styles.media}>
          <img
            src={heroImage}
            alt={title}
            loading="lazy"
            className={styles.mediaImage}
          />
        </div>
      );
    }
    return (
      <div className={`${styles.media} ${styles.mediaPlaceholder}`}>
        <span>{title}</span>
      </div>
    );
  }
  if (!playing) {
    const thumb =
      heroImage ||
      `https://i.ytimg.com/vi/${youTubeId}/hqdefault.jpg`;
    return (
      <button
        type="button"
        className={`${styles.media} ${styles.mediaThumb}`}
        onClick={() => setPlaying(true)}
        aria-label={translate({
          id: 'capstoneShowcase.video.play',
          message: 'Play demo video',
        })}
      >
        <img
          src={thumb}
          alt={title}
          loading="lazy"
          className={styles.mediaImage}
        />
        <span className={styles.playIcon} aria-hidden="true">
          ▶
        </span>
      </button>
    );
  }
  return (
    <div className={styles.media}>
      <iframe
        className={styles.mediaIframe}
        src={`https://www.youtube-nocookie.com/embed/${youTubeId}?autoplay=1&rel=0`}
        title={title}
        loading="lazy"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function TeamLine({ project }) {
  const content = (
    <>
      {project.avatar && (
        <img
          className={styles.avatar}
          src={project.avatar}
          alt={project.team || project.title}
          loading="lazy"
          width={36}
          height={36}
        />
      )}
      {project.team && (
        <span className={styles.teamText}>
          <span className={styles.teamLabel}>
            {translate({
              id: 'capstoneShowcase.teamLabel',
              message: 'Team',
            })}
            :
          </span>{' '}
          {project.team}
        </span>
      )}
    </>
  );

  if (!project.profileURL) {
    return <div className={styles.team}>{content}</div>;
  }
  return (
    <a
      className={`${styles.team} ${styles.teamLink}`}
      href={project.profileURL}
      target="_blank"
      rel="noopener noreferrer"
    >
      {content}
    </a>
  );
}

function ProjectCard({
  project,
  rank,
  trackLabels,
  voted,
  onToggleVote,
  busy,
  spotlight,
}) {
  const isTop = spotlight && rank && rank <= 3;
  return (
    <article
      className={`${styles.card} ${
        spotlight ? `mm-card ${styles.cardSpotlight}` : 'mm-card mm-card--sm'
      } ${spotlight && rank === 1 ? styles.rank1 : ''} ${
        spotlight && rank === 2 ? styles.rank2 : ''
      } ${spotlight && rank === 3 ? styles.rank3 : ''}`}
    >
      {isTop && (
        <div className={styles.spotlightRank}>
          <span
            className={`mm-heading-lg ${styles.rankNumeral}`}
            aria-hidden="true"
          >
            {rank}
          </span>
          <span className={`mm-chip ${styles.rankChip}`}>
            {rankLabel(rank)}
          </span>
        </div>
      )}
      <VideoPlayer
        youTubeId={project.youTubeId}
        heroImage={project.heroImage}
        title={project.title}
      />
      <div className={styles.cardBody}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{project.title}</h3>
          {project.track && (
            <span
              className={`mm-chip ${styles.trackPill} ${trackClassName(
                project.track
              )}`}
            >
              {trackLabels[project.track] || project.track}
            </span>
          )}
        </header>
        {(project.team || project.avatar) && (
          <TeamLine project={project} />
        )}
        {project.pitch && <p className={styles.pitch}>{project.pitch}</p>}
        <div className={styles.linkRow}>
          {project.liveURL && (
            <a
              href={project.liveURL}
              target="_blank"
              rel="noopener noreferrer"
              className={`mm-chip ${styles.linkChip}`}
            >
              <span
                className={`${styles.linkDot} ${styles.linkDotGreen}`}
                aria-hidden="true"
              />
              {translate({
                id: 'capstoneShowcase.link.live',
                message: 'Visit site',
              })}
            </a>
          )}
          {project.repoURL && (
            <a
              href={project.repoURL}
              target="_blank"
              rel="noopener noreferrer"
              className={`mm-chip ${styles.linkChip}`}
            >
              <span
                className={`${styles.linkDot} ${styles.linkDotBlue}`}
                aria-hidden="true"
              />
              GitHub
            </a>
          )}
          {!project.youTubeId && project.demoURL && (
            <a
              href={project.demoURL}
              target="_blank"
              rel="noopener noreferrer"
              className={`mm-chip ${styles.linkChip}`}
            >
              <span
                className={`${styles.linkDot} ${styles.linkDotCoral}`}
                aria-hidden="true"
              />
              {translate({
                id: 'capstoneShowcase.link.demo',
                message: 'Watch demo',
              })}
            </a>
          )}
          {project.postMortemURL && (
            <a
              href={project.postMortemURL}
              target="_blank"
              rel="noopener noreferrer"
              className={`mm-chip ${styles.linkChip}`}
            >
              <span
                className={`${styles.linkDot} ${styles.linkDotBlue}`}
                aria-hidden="true"
              />
              {translate({
                id: 'capstoneShowcase.link.postmortem',
                message: 'Post-mortem',
              })}
            </a>
          )}
          <div className={styles.voteSlot}>
            <VoteButton
              slug={project.slug}
              votes={project.votes ?? 0}
              voted={voted}
              busy={busy}
              onToggle={onToggleVote}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function ShowcaseInner() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [voted, setVoted] = useState(() => readVotedSet());
  const [busySlugs, setBusySlugs] = useState(() => new Set());
  const [activeTrack, setActiveTrack] = useState('__all__');
  const [toast, setToast] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const clientIdRef = useRef('');
  const abortRef = useRef(null);
  const trackLabels = useTrackLabels();

  // Re-scan .mm-reveal elements whenever the project list changes (the grids
  // only mount once data arrives). Presentation only — no data dependency.
  useScrollReveal([projects]);

  const filterAllLabel = translate({
    id: 'capstoneShowcase.filterAll',
    message: 'All',
  });

  // Bootstrap clientId once on mount
  useEffect(() => {
    clientIdRef.current = getOrCreateClientId();
  }, []);

  const fetchList = useCallback(async ({ signal } = {}) => {
    try {
      const res = await fetch(`${API_BASE}/api/capstones`, { signal });
      if (!res.ok) throw new Error('Failed to fetch');
      return await res.json();
    } catch (err) {
      if (err && err.name === 'AbortError') return null;
      return null;
    }
  }, []);

  // Initial load + 30s polling
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const data = await fetchList({ signal: ctrl.signal });
      if (cancelled) return;
      if (!data) {
        setError(true);
        setLoading(false);
        return;
      }
      setError(false);
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setUpdatedAt(data.updatedAt || null);
      setLoading(false);
    };
    tick();
    const interval = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchList]);

  const showToast = (type, message) => setToast({ type, message });

  const setBusy = (slug, busy) => {
    setBusySlugs((prev) => {
      const next = new Set(prev);
      if (busy) next.add(slug);
      else next.delete(slug);
      return next;
    });
  };

  const handleToggleVote = async (slug, wantVoted) => {
    if (!clientIdRef.current) return;
    setBusy(slug, true);

    // Optimistic update
    const prevVoted = new Set(voted);
    setVoted((prev) => {
      const next = new Set(prev);
      if (wantVoted) next.add(slug);
      else next.delete(slug);
      writeVotedSet(next);
      return next;
    });
    setProjects((prev) =>
      prev.map((p) =>
        p.slug === slug
          ? { ...p, votes: Math.max(0, (p.votes || 0) + (wantVoted ? 1 : -1)) }
          : p
      )
    );

    try {
      const res = await fetch(`${API_BASE}/api/capstones/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          clientId: clientIdRef.current,
          action: wantVoted ? 'add' : 'remove',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Roll back optimistic update
        setVoted(() => {
          writeVotedSet(prevVoted);
          return prevVoted;
        });
        // Refetch authoritative count
        const fresh = await fetchList();
        if (fresh && Array.isArray(fresh.projects)) setProjects(fresh.projects);
        showToast(
          'error',
          data.error ||
            translate({
              id: 'capstoneShowcase.network.error',
              message: 'Network error, please try again later',
            })
        );
      } else if (typeof data.votes === 'number') {
        // Reconcile to authoritative count
        setProjects((prev) =>
          prev.map((p) => (p.slug === slug ? { ...p, votes: data.votes } : p))
        );
      }
    } catch {
      setVoted(() => {
        writeVotedSet(prevVoted);
        return prevVoted;
      });
      showToast(
        'error',
        translate({
          id: 'capstoneShowcase.network.error',
          message: 'Network error, please try again later',
        })
      );
    } finally {
      setBusy(slug, false);
    }
  };

  // Sort by votes desc, then submittedAt asc (stable tiebreak)
  const sorted = [...projects].sort((a, b) => {
    const va = a.votes ?? 0;
    const vb = b.votes ?? 0;
    if (vb !== va) return vb - va;
    return (a.submittedAt || '').localeCompare(b.submittedAt || '');
  });

  const top3 = sorted.slice(0, 3);

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
            onClose={() => setToast(null)}
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
                  'Capstone projects from TECHNEST 2026 Weeks 9–12. Vote for your favorites — leaderboard refreshes every 30 seconds.',
              })}
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
                    message: 'Current Top 3',
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
                      onToggleVote={handleToggleVote}
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
                    onClick={() => setActiveTrack('__all__')}
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
                      onClick={() => setActiveTrack(track)}
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
                        onToggleVote={handleToggleVote}
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

export default function CapstoneShowcasePage() {
  return (
    <Layout
      title={translate({
        id: 'capstoneShowcase.pageTitle',
        message: 'TECHNEST 2026 Capstone Showcase',
      })}
      description={translate({
        id: 'capstoneShowcase.pageDescription',
        message:
          'Live showcase of TECHNEST 2026 capstone projects. Vote for your favorites — top 3 highlighted, refreshed every 30 seconds.',
      })}
    >
      <BrowserOnly fallback={<div className={styles.pageWrapper} />}>
        {() => <ShowcaseInner />}
      </BrowserOnly>
    </Layout>
  );
}
