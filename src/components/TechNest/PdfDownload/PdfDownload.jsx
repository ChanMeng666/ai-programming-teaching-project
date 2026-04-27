import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

// PdfDownload — a polished, prompt-first–styled download card
// for the TECHNEST printable handouts compiled from the
// `technest-curriculum` Typst sources.
//
// Props:
//   href         : path under /static (e.g. "/pdfs/technest/week-01-dev-tools-setup.pdf")
//   title        : main label, shown next to the PDF chip
//   description  : short caption explaining what the PDF covers
//   filename     : optional override for the saved filename (defaults to href basename)
//   size         : optional human-readable file size (e.g. "623 KB")
export default function PdfDownload({href, title, description, filename, size}) {
  const url = useBaseUrl(href);
  const downloadName = filename || (href ? href.split('/').pop() : undefined);

  return (
    <a
      className={styles.card}
      href={url}
      download={downloadName}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className={styles.iconWrap} aria-hidden="true">
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M12 12v6" />
          <polyline points="9 15 12 18 15 15" />
        </svg>
      </span>

      <span className={styles.body}>
        <span className={styles.header}>
          <span className={styles.chip}>PDF</span>
          {title ? <span className={styles.title}>{title}</span> : null}
        </span>
        {description ? (
          <span className={styles.description}>{description}</span>
        ) : null}
        <span className={styles.meta}>
          <span className={styles.cta}>Download PDF</span>
          {size ? <span className={styles.size}>· {size}</span> : null}
        </span>
      </span>
    </a>
  );
}
