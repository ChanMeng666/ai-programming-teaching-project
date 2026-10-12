// A visitor's identity and votes, kept in localStorage. The authoritative count
// lives in the Worker; this only remembers which hearts to fill in.
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

export function getOrCreateClientId() {
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

export function readVotedSet() {
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

export function writeVotedSet(set) {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    ls.setItem(VOTED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore quota */
  }
}
