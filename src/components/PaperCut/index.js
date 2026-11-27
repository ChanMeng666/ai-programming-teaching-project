import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { createInstance } from './engine';
import RIGS from './rigs';
import SCENES from './scenes';
import styles from './styles.module.css';

/**
 * <PaperCut name="hero" alt="…" className={…} /> — a paper-cut illustration.
 *
 * - A name with a scene drawn as code (./scenes/<name>.mjs) renders that SVG inline, from the
 *   server on: sharp at any size, no image request. Its choreography (./rigs/<name>.js) runs
 *   on the shared loop while it is on screen and the tab is visible; prefers-reduced-motion
 *   keeps it still.
 * - Any other name renders its original WebP from static/img/illustrations/, unchanged.
 */
let instances = 0;

export default function PaperCut({ name, alt = '', className, width, height, loading = 'lazy', fetchPriority }) {
  const webp = useBaseUrl(`/img/illustrations/${name}.webp`);
  const scene = SCENES[name];
  const holder = useRef(null);

  useEffect(() => {
    const el = holder.current && holder.current.querySelector('svg');
    if (!scene || !el) return undefined;
    el.removeAttribute('role');
    el.removeAttribute('aria-label');
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('focusable', 'false');
    el.setAttribute('class', styles.svg);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const rig = RIGS[name];
    if (!rig || reduce.matches) return undefined;

    const inst = createInstance(el, rig, { seed: 7 + instances++ * 131 });
    let visible = false;
    const sync = () => (visible && !document.hidden && !reduce.matches ? inst.start() : inst.stop());
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); });
    io.observe(el);
    document.addEventListener('visibilitychange', sync);
    reduce.addEventListener?.('change', sync);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reduce.removeEventListener?.('change', sync);
      inst.destroy();
    };
  }, [scene, name]);

  if (scene) {
    const label = alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true };
    return (
      <span
        ref={holder}
        className={clsx(styles.holder, className)}
        {...label}
        // our own scene, drawn by ./scenes/<name>.mjs
        dangerouslySetInnerHTML={{ __html: scene() }}
      />
    );
  }
  return (
    <img
      src={webp}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      fetchpriority={fetchPriority}
      className={className}
      {...(alt ? {} : { 'aria-hidden': true })}
    />
  );
}
