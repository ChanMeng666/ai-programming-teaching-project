import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './capstone-showcase.module.css';

const API_BASE = 'https://ai-chat-worker.chanmeng-dev.workers.dev';
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
      className={`${styles.voteButton} ${voted ? styles.voteButtonActive : ''}`}
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
      <span className={styles.voteCount}>{votes}</span>
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

function ProjectCard({
  project,
  rank,
  trackLabels,
  voted,
  onToggleVote,
  busy,
  spotlight,
}) {
  return (
    <article
      className={`${styles.card} ${
        spotlight ? styles.cardSpotlight : ''
      } ${rank === 1 ? styles.rankGold : ''} ${
        rank === 2 ? styles.rankSilver : ''
      } ${rank === 3 ? styles.rankBronze : ''}`}
    >
      {spotlight && rank && rank <= 3 && (
        <div className={styles.rankBadge} aria-hidden="true">
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
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
              className={`${styles.trackPill} ${trackClassName(project.track)}`}
            >
              {trackLabels[project.track] || project.track}
            </span>
          )}
        </header>
        {project.team && (
          <p className={styles.team}>
            <span className={styles.teamLabel}>
              {translate({
                id: 'capstoneShowcase.teamLabel',
                message: 'Team',
              })}
              :
            </span>{' '}
            {project.team}
          </p>
        )}
        {project.pitch && <p className={styles.pitch}>{project.pitch}</p>}
        <div className={styles.linkRow}>
          {project.liveURL && (
            <a
              href={project.liveURL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkPrimary}
            >
              {translate({
                id: 'capstoneShowcase.link.live',
                message: 'Visit site',
              })}{' '}
              →
            </a>
          )}
          {project.repoURL && (
            <a
              href={project.repoURL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkSecondary}
            >
              GitHub
            </a>
          )}
          {project.postMortemURL && (
            <a
              href={project.postMortemURL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkSecondary}
            >
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
  const rest = sorted.slice(3);

  const filtered =
    activeTrack === '__all__'
      ? rest
      : rest.filter((p) => p.track === activeTrack);

  // When filter is active, also re-filter the spotlight context-wise: keep top3 always
  // (per plan: filter applies to grid only; spotlight always shows global top 3).

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

        <div className={styles.heroSection}>
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
              {translate({
                id: 'capstoneShowcase.lastUpdated',
                message: 'Last updated',
              })}
              : {lastUpdatedLabel}
            </p>
          )}
        </div>

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
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>⚠️</span>
            <p>
              {translate({
                id: 'capstoneShowcase.fetchError',
                message:
                  "Couldn't load capstone projects. Please refresh in a moment.",
              })}
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🎓</span>
            <p>
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
                    message: '🏆 Current Top 3',
                  })}
                </h2>
                <div className={styles.spotlightGrid}>
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

              {top3.length < 3 ? (
                <div className={styles.cardGrid}>
                  {sorted
                    .filter((p) =>
                      activeTrack === '__all__' ? true : p.track === activeTrack
                    )
                    .map((p, i) => (
                      <ProjectCard
                        key={p.id || p.slug}
                        project={p}
                        rank={i + 1}
                        trackLabels={trackLabels}
                        voted={voted.has(p.slug)}
                        busy={busySlugs.has(p.slug)}
                        onToggleVote={handleToggleVote}
                      />
                    ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>🔍</span>
                  <p>
                    {translate({
                      id: 'capstoneShowcase.emptyTrack',
                      message: 'No projects in this track yet.',
                    })}
                  </p>
                </div>
              ) : (
                <div className={styles.cardGrid}>
                  {filtered.map((p) => {
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
