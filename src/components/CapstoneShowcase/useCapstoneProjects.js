import { useState, useEffect, useCallback, useRef } from 'react';
import { translate } from '@docusaurus/Translate';
import { API_BASE } from '@site/src/config/api';
import { getOrCreateClientId, readVotedSet, writeVotedSet } from './voteStorage';

const POLL_INTERVAL_MS = 60_000;
// A tab left open on this page used to poll forever, including while hidden.
// Backgrounded overnight that was enough to exhaust the Worker's daily KV write
// quota on its own, so polling now stops once the page has been sitting
// untouched this long. Any interaction — or switching back to the tab — resumes it.
const IDLE_TIMEOUT_MS = 10 * 60_000;

/**
 * Live project list plus optimistic voting. Owns every network call the
 * showcase makes; the components around it only render.
 */
export default function useCapstoneProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [voted, setVoted] = useState(() => readVotedSet());
  const [busySlugs, setBusySlugs] = useState(() => new Set());
  const [toast, setToast] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const clientIdRef = useRef('');
  const abortRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  // Set by the polling effect so an interaction can restart a poll that the
  // idle timeout already stopped — otherwise a viewer who sits still for
  // IDLE_TIMEOUT_MS and then votes would never see live counts again without
  // leaving and re-entering the tab.
  const resumePollRef = useRef(null);

  const markActive = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (resumePollRef.current) resumePollRef.current();
  }, []);

  // Bootstrap clientId once on mount
  useEffect(() => {
    clientIdRef.current = getOrCreateClientId();
  }, []);

  // The endpoint now sends Cache-Control: max-age=20, which is what we want for
  // routine polling. `fresh` bypasses that browser cache for the one case that
  // needs an authoritative answer: resyncing counts after a failed vote.
  const fetchList = useCallback(async ({ signal, fresh = false } = {}) => {
    try {
      const res = await fetch(`${API_BASE}/api/capstones`, {
        signal,
        cache: fresh ? 'no-store' : 'default',
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return await res.json();
    } catch (err) {
      if (err && err.name === 'AbortError') return null;
      return null;
    }
  }, []);

  // Initial load + polling. Deliberately conservative: we only poll while the
  // tab is actually visible, and give up entirely once the page has been idle,
  // because every poll costs the Worker KV operations against a daily quota.
  useEffect(() => {
    let cancelled = false;
    let interval = null;

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
    const start = () => {
      if (!interval) interval = setInterval(tick, POLL_INTERVAL_MS);
    };

    const fetchNow = async () => {
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

    function tick() {
      if (cancelled) return;
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastActivityRef.current > IDLE_TIMEOUT_MS) {
        stop();
        return;
      }
      fetchNow();
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Coming back to the tab counts as activity: refresh at once, then resume.
        markActive();
        tick();
        start();
      } else {
        stop();
      }
    };

    // The very first load must run even if the tab is hidden (e.g. restored
    // session), otherwise the page would render empty until it is focused.
    fetchNow();
    start();
    resumePollRef.current = start;
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      stop();
      resumePollRef.current = null;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchList, markActive]);

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
    markActive();
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
        const fresh = await fetchList({ fresh: true });
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

  return {
    projects,
    loading,
    error,
    updatedAt,
    voted,
    busySlugs,
    toast,
    dismissToast: () => setToast(null),
    markActive,
    toggleVote: handleToggleVote,
  };
}
