import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
import { TIERS, awardBySlug, certificatePath } from '@site/src/data/awards';
import { trackClassName } from './tracks';
import styles from './styles.module.css';

// Award tier label. Covers all four tiers, not just the podium — every awarded
// project carries a badge now, so 4th onward needs a name too.
function tierLabel(tier) {
  if (tier === 'first')
    return translate({ id: 'capstoneShowcase.rank.first', message: '1st' });
  if (tier === 'second')
    return translate({ id: 'capstoneShowcase.rank.second', message: '2nd' });
  if (tier === 'third')
    return translate({ id: 'capstoneShowcase.rank.third', message: '3rd' });
  return translate({
    id: 'capstoneShowcase.rank.excellence',
    message: 'Excellence',
  });
}

// Flat paper-cut laurel, matching the one on the certificates. Deliberately an
// inline SVG and not an emoji: emoji medals render as someone else's artwork at
// someone else's whim, and they undercut the formality of a credential.
function Laurel({ className }) {
  return (
    <svg className={className} viewBox="0 0 110 150" fill="none" aria-hidden="true">
      <path
        d="M92 142 C 62 124, 40 94, 33 40"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <g fill="currentColor">
        <ellipse cx="-18" cy="0" rx="18" ry="7.5" transform="translate(72,124) rotate(-30)" />
        <ellipse cx="-18" cy="0" rx="18" ry="7.5" transform="translate(58,104) rotate(-42)" />
        <ellipse cx="-18" cy="0" rx="18" ry="7.5" transform="translate(47,82) rotate(-54)" />
        <ellipse cx="-18" cy="0" rx="18" ry="7.5" transform="translate(39,60) rotate(-66)" />
        <ellipse cx="-16" cy="0" rx="16" ry="6.5" transform="translate(34,38) rotate(-80)" />
      </g>
    </svg>
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

export default function ProjectCard({
  project,
  rank,
  trackLabels,
  voted,
  onToggleVote,
  busy,
  spotlight,
}) {
  // Rank and tier come from the frozen award record, never from the live vote
  // order — a card must never contradict the certificate it links to.
  const award = awardBySlug(project.slug);
  const tier = award ? TIERS[award.tier] : null;
  const isTop = spotlight && award && award.rank <= 3;
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
            {award.rank}
          </span>
          <span className={`mm-chip ${styles.rankChip}`}>
            {tierLabel(award.tier)}
          </span>
        </div>
      )}
      {award && !isTop && (
        // Accent tints the laurel only; the tier is always named in the chip
        // beside it, so colour never carries the meaning on its own.
        <div className={styles.awardBadge} style={{ color: tier.accent }}>
          <Laurel className={styles.awardLaurel} />
          <span className={`mm-chip ${styles.awardChip}`}>{tierLabel(award.tier)}</span>
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
          {award && (
            <Link
              to={certificatePath(award)}
              className={`mm-chip ${styles.linkChip} ${styles.certChip}`}
            >
              <span
                className={`${styles.linkDot} ${styles.linkDotGreen}`}
                aria-hidden="true"
              />
              {translate({
                id: 'capstoneShowcase.link.certificate',
                message: 'Certificate',
              })}
            </Link>
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
