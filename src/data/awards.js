// Frontend accessor for the frozen TECHNEST 2026 capstone awards.
//
// The data itself lives in awards.json so that webpack (this site) and plain
// Node (scripts/render-certificates.mjs) read the identical source of truth —
// a .js ES module cannot be imported by a Node script in a CommonJS package,
// and a certificate whose PNG disagreed with its verification page would be
// worse than no certificate at all.
//
// See awards.json for why the results are frozen and what must not be edited.

import data from './awards.json';

export const COHORT = data.cohort;
export const ISSUER = data.issuer;
export const INSTRUCTOR = data.instructor;
export const INSTRUCTOR_TITLE = data.instructorTitle;

/** Date award voting closed and the vote counts were frozen. */
export const FROZEN_AT = data.frozenAt;
/** Date printed on every certificate. */
export const ISSUED_ON = data.issuedOn;
export const ISSUED_ON_LABEL = data.issuedOnLabel;

/**
 * The issue date written for a locale, falling back to the English label.
 * See the note in awards.json for why these are stored rather than formatted.
 */
export function issuedOnFor(locale) {
  return data.issuedOnLabelByLocale[locale] || data.issuedOnLabel;
}
/** Split out because LinkedIn's add-to-profile deep link wants them separately. */
export const ISSUE_YEAR = data.issueYear;
export const ISSUE_MONTH = data.issueMonth;

export const SITE_URL = data.siteUrl;

/**
 * Tier metadata. `accent` is decorative only — every certificate and badge
 * states its award in words, so colour never carries the meaning on its own
 * (DESIGN.md: accent colours are never semantic states).
 */
export const TIERS = data.tiers;

/** Awards ordered by frozen rank, 1..6. */
export const AWARDS = data.awards;

/** Award record for a project slug, or undefined if the project was not awarded. */
export function awardBySlug(slug) {
  return AWARDS.find((a) => a.slug === slug);
}

/** `{ label, accent, short }` for an award record. */
export function tierOf(award) {
  return TIERS[award.tier];
}

/** What the credential is called — on the certificate and on LinkedIn. */
export function credentialName(award) {
  return `${COHORT} Capstone — ${TIERS[award.tier].label}`;
}

/** Public verification page. Relative; prefix SITE_URL to absolutise. */
export function certificatePath(award) {
  return `/certificate/${award.slug}`;
}

/** Absolute URL of the og:image card for a credential. */
export function socialImageUrl(award) {
  return `${SITE_URL}/img/certificates/${award.slug}-social.png`;
}

/**
 * LinkedIn "Add to profile" deep link. Pre-fills the Licenses & Certifications
 * form with the credential name, issuer, issue date, verification URL and
 * credential ID. No expiration params — these credentials do not expire.
 */
export function linkedInAddUrl(award) {
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: credentialName(award),
    organizationName: ISSUER,
    issueYear: String(ISSUE_YEAR),
    issueMonth: String(ISSUE_MONTH),
    certUrl: `${SITE_URL}${certificatePath(award)}`,
    certId: award.certId,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}
