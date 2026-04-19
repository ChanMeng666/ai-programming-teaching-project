import React from 'react';
import styles from './styles.module.css';

const FEATURES = [
  [1, 'Dev toolkit installed — Cursor, Claude Code, Gemini CLI, MCPs, Typst skill'],
  [2, 'Personal website deployed to Vercel'],
  [3, 'AI chat widget (Gemini 2.5 Flash) emulating you'],
  [4, 'Neon Postgres + Neon Auth + Drizzle guestbook'],
  [5, 'Vercel Blob image uploads in guestbook'],
  [6, 'MDX blog system with RSS'],
  [7, 'Real-time Slack notifications on contact form'],
  [8, 'Typst-powered CV & cover-letter PDFs from Neon profile'],
];

export default function SiteEvolution({thisWeek}) {
  const visible = FEATURES.filter(([wk]) => wk <= thisWeek);
  return (
    <aside className={styles.siteEvolution}>
      <p className={styles.heading}>
        Your personal site — cumulative features through this week:
      </p>
      <ul className={styles.list}>
        {visible.map(([wk, label]) => {
          const isNew = wk === thisWeek;
          return (
            <li key={wk} className={styles.item}>
              <code className={styles.weekTag}>Wk {wk}</code>
              {isNew ? (
                <>
                  <strong className={styles.newLabel}>{label}</strong>
                  <span className={styles.newPill}>← NEW</span>
                </>
              ) : (
                <span className={styles.label}>{label}</span>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
