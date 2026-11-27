/**
 * engine.js — brings a paper-cut scene to life.
 *
 * The scene (./scenes/<name>.mjs) wraps every moving piece in <g class="pt-<part>">, nested
 * the way it hangs (shoulder → elbow → hand). A choreography (./rigs/<name>.js) declares
 * hover zones and moves parts through handles:
 *
 *   const head = api.part('a-head', { pivot: [180, 126] });   // artboard px
 *   return { update(t, dt) { head.r = Math.sin(t) * 2; } };
 *
 * Every frame each handle is reset to rest, the choreography ADDS its motions (so a nod, a
 * hover reaction and a blink compose), and the engine writes one matrix per part into a CSS
 * variable on the <svg>: `.pt-a-head { transform: var(--pt-a-head) }`. A part nested in
 * another's <g> inherits its motion from the DOM, so it needs no `parent`.
 *
 * One shared requestAnimationFrame loop drives every illustration on the page; an
 * illustration runs only while it is on screen and the tab is visible. dt is clamped, and a
 * choreography that throws is switched off without taking the page down.
 */

// ------------------------------------------------------------------ maths and helpers
export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const smooth = (u) => {
  const t = clamp(u, 0, 1);
  return t * t * (3 - 2 * t);
};
/** 0 → 1 → 0 over u ∈ [0, 1]. */
export const bump = (u) => (u <= 0 || u >= 1 ? 0 : Math.sin(u * Math.PI));
export const outBack = (u) => {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2);
};

/** Seeded xorshift32, so two illustrations never act in unison but replay the same. */
export function rand(seed) {
  let s = Math.imul(seed | 0, 2654435761) >>> 0 || 7;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

/** A damped spring, stepped in fixed substeps so long frames never blow it up. */
export function spring(k = 120, d = 14, x = 0) {
  return {
    x, v: 0, target: x,
    step(dt) {
      const n = Math.max(1, Math.ceil(dt / (1 / 240)));
      const h = dt / n;
      for (let i = 0; i < n; i++) {
        this.v += (-k * (this.x - this.target) - d * this.v) * h;
        this.x += this.v * h;
      }
      return this.x;
    },
  };
}

/** Blinks at irregular intervals, one in five doubled. `open`: 1 open → 0 shut. */
export function blinker(r) {
  let wait = 0.8 + r() * 3, ph = -1;
  return {
    open: 1,
    step(dt) {
      if (ph < 0) {
        if ((wait -= dt) <= 0) ph = 0;
        return this.open;
      }
      ph += dt / 0.17;
      this.open = Math.abs(1 - 2 * Math.min(ph, 1));
      if (ph >= 1) {
        ph = -1;
        this.open = 1;
        wait = r() < 0.22 ? 0.14 : 1.8 + r() * 4.2;
      }
      return this.open;
    },
    force() { if (ph < 0) wait = 0; },
  };
}

/**
 * A random small action every few seconds: actions = [[name, seconds], …].
 * `is(name)` gives its progress 0..1 while it plays, else -1.
 */
export function actor(r, actions, gap = [3, 8]) {
  let wait = gap[0] * 0.4 + r() * gap[1] * 0.6;
  return {
    name: null, u: 0, dur: 1, side: 1,
    step(dt, allowed = true) {
      if (this.name) {
        this.u += dt / this.dur;
        if (this.u >= 1) { this.name = null; wait = gap[0] + r() * (gap[1] - gap[0]); }
      } else if ((wait -= dt) <= 0) {
        if (!allowed) { wait = 1.2; return; }
        [this.name, this.dur] = actions[Math.floor(r() * actions.length)];
        this.u = 0;
        this.side = r() < 0.5 ? -1 : 1;
      }
    },
    is(n) { return this.name === n ? this.u : -1; },
    play(n, dur) { this.name = n; this.dur = dur; this.u = 0; },
  };
}

/**
 * Squash-and-stretch hops while `want` is true: crouch → parabolic leap → land.
 * Pose out: y (up is negative, in units of `height`), sx, sy; `onApex(n)` at each top.
 */
export function hopper(height, airTime = 0.5, onApex) {
  let ph = 'rest', u = 0, n = 0, wait = 0, apexed = false;
  const h = {
    y: 0, sx: 1, sy: 1, busy: false,
    step(dt, want) {
      if (ph === 'rest') { if (want && (wait -= dt) <= 0) { ph = 'crouch'; u = 0; } }
      else if (ph === 'crouch') { u += dt / 0.12; if (u >= 1) { ph = 'air'; u = 0; n++; apexed = false; } }
      else if (ph === 'air') {
        u += dt / airTime;
        if (!apexed && u >= 0.5) { apexed = true; if (onApex) onApex(n); }
        if (u >= 1) { ph = 'land'; u = 0; }
      } else { u += dt / 0.2; if (u >= 1) { ph = 'rest'; u = 0; wait = 0.08 + Math.random() * 0.2; } }
      let sq = 0;
      h.y = 0;
      if (ph === 'crouch') sq = 0.16 * Math.sin((u * Math.PI) / 2);
      else if (ph === 'air') { h.y = -height * 4 * u * (1 - u); sq = -(0.12 * (1 - u) ** 3 + 0.04 * u ** 3); }
      else if (ph === 'land') sq = 0.16 * Math.sin(u * Math.PI) * (1 - u * 0.3);
      h.sy = 1 - sq;
      h.sx = 1 + sq * 0.7;
      h.busy = ph !== 'rest';
    },
  };
  return h;
}

// ------------------------------------------------------------------ the shared loop
const live = new Set();
let raf = 0;
let last = 0;
function tick(ms) {
  raf = 0;
  const dt = Math.min(0.05, last ? (ms - last) / 1000 : 1 / 60);
  last = ms;
  for (const inst of live) inst.frame(dt);
  if (live.size) raf = requestAnimationFrame(tick);
  else last = 0;
}
function wake() {
  if (!raf && live.size) raf = requestAnimationFrame(tick);
}
// Development only: advance every running illustration by hand, for checking poses where the
// browser throttles requestAnimationFrame (background tabs, automation).
//   window.__paperCut.step(seconds, fps = 60)
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  window.__paperCut = {
    step(seconds, fps = 60) {
      for (let i = 0; i < seconds * fps; i++) for (const inst of live) inst.frame(1 / fps);
    },
    count: () => live.size,
  };
}

// Brand confetti (DESIGN.md accents) and the shapes it is cut into, in source px.
const CONFETTI = ['#ff705d', '#f5e211', '#2ba0ff', '#8ed462', '#c9a7e8'];
const SHAPES = [
  'M-5,-3h10v6h-10z', // strip
  'M0,-5L5,4H-5Z', // triangle
  'M-4,0a4,4 0 1,0 8,0a4,4 0 1,0 -8,0', // dot
  'M-6,0q3,-5 6,0t6,0', // squiggle (stroked)
];

// ------------------------------------------------------------------ one illustration
export function createInstance(svg, choreography, { seed = 1 } = {}) {
  const k = +svg.getAttribute('data-k') || 2; // svg units per source px
  const NS = 'http://www.w3.org/2000/svg';
  const handles = new Map();
  const style = document.createElementNS(NS, 'style');
  let css = '';

  // ---- parts ----
  function part(id, { pivot, parent } = {}) {
    if (handles.has(id)) return handles.get(id);
    const els = svg.querySelectorAll(`.pt-${id}`);
    let cx = 0, cy = 0, box = null;
    if (els.length) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      els.forEach((el) => {
        const b = el.getBBox();
        x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
        x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
      });
      box = { x0: x0 / k, y0: y0 / k, x1: x1 / k, y1: y1 / k };
      cx = (box.x0 + box.x1) / 2; cy = (box.y0 + box.y1) / 2;
    }
    const h = {
      id, box, empty: !els.length,
      pivot: pivot || [cx, cy],
      parent: parent ? part(parent) : null,
      x: 0, y: 0, r: 0, sx: 1, sy: 1, o: 1,
      m: [1, 0, 0, 1, 0, 0], out: '', outO: '',
    };
    handles.set(id, h);
    css += `.pt-${id}{transform:var(--pt-${id},none);transform-origin:0 0;transform-box:view-box;opacity:var(--po-${id},1)}`;
    style.textContent = css;
    return h;
  }

  // ---- hover zones ----
  // Hover follows declared zones rather than the shape under the pointer (a hand over a card
  // should count as the card, a sleeve as its character), most specific first:
  //   api.zone('card', { rect: [x0, y0, x1, y1] } | { poly: [[x, y], …] } | { circle: [cx, cy, r] })
  // A zone is hovered while the pointer is over painted artwork and inside the zone.
  const zones = [];
  function zone(id, shape) { zones.push({ id, ...shape }); }
  const inZone = (z, x, y) => {
    if (z.rect) return x >= z.rect[0] && x <= z.rect[2] && y >= z.rect[1] && y <= z.rect[3];
    if (z.circle) return Math.hypot(x - z.circle[0], y - z.circle[1]) <= z.circle[2];
    let inside = false;
    for (let i = 0, j = z.poly.length - 1; i < z.poly.length; j = i++) {
      const [xi, yi] = z.poly[i], [xj, yj] = z.poly[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const zoneAt = (e) => {
    if (!e.target || e.target.tagName !== 'path' || e.target.closest('.fx')) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const x = p.x / k, y = p.y / k;
    const z = zones.find((q) => inZone(q, x, y));
    return z ? z.id : null;
  };
  let hovered = null, enteredAt = 0, holdUntil = 0, clearTimer = 0;
  const hoverEase = new Map();
  const setHovered = (id) => {
    if (id === hovered) return;
    hovered = id;
    enteredAt = time;
  };
  const onMove = (e) => {
    if (e.pointerType !== 'mouse' && performance.now() < holdUntil) return;
    const id = zoneAt(e);
    clearTimeout(clearTimer);
    if (id) setHovered(id);
    // off the artwork: let go after a beat, so a part moving out from under the pointer
    // does not flicker
    else clearTimer = setTimeout(() => setHovered(null), 180);
  };
  const onLeave = (e) => {
    if (e.pointerType !== 'mouse' && performance.now() < holdUntil) return;
    clearTimeout(clearTimer);
    setHovered(null);
  };
  const onDown = (e) => {
    const id = zoneAt(e);
    if (e.pointerType !== 'mouse') holdUntil = performance.now() + 2600; // a tap holds the hover
    if (id) { setHovered(id); tapped = id; }
  };
  let tapped = null;
  svg.addEventListener('pointermove', onMove, { passive: true });
  svg.addEventListener('pointerleave', onLeave, { passive: true });
  svg.addEventListener('pointerdown', onDown, { passive: true });

  // ---- confetti ----
  const fx = document.createElementNS(NS, 'g');
  fx.setAttribute('class', 'fx');
  fx.setAttribute('pointer-events', 'none');
  const pool = [];
  const particles = [];
  function burst(x, y, { n = 12, speed = 260, up = 0.9, spread = TAU, angle = -Math.PI / 2, colours = CONFETTI, size = 1.35, life = 1.5 } = {}) {
    for (let i = 0; i < n; i++) {
      let el = pool.pop();
      if (!el) { el = document.createElementNS(NS, 'path'); fx.appendChild(el); }
      const s = Math.floor(R() * SHAPES.length);
      const col = colours[Math.floor(R() * colours.length)];
      el.setAttribute('d', SHAPES[s]);
      if (s === 3) { el.setAttribute('fill', 'none'); el.setAttribute('stroke', col); el.setAttribute('stroke-width', '2.4'); el.setAttribute('stroke-linecap', 'round'); }
      else { el.setAttribute('fill', col); el.removeAttribute('stroke'); }
      el.style.display = '';
      const a = angle + (R() - 0.5) * spread;
      const v = speed * (0.45 + 0.55 * R());
      particles.push({
        el, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * up,
        r: R() * 360, vr: (R() - 0.5) * 720, age: 0, life: life * (0.7 + 0.5 * R()),
        s: size * (0.8 + 0.6 * R()), ph: R() * TAU,
      });
    }
    if (particles.length > 80) particles.splice(0, particles.length - 80).forEach(retire);
  }
  function retire(p) { p.el.style.display = 'none'; pool.push(p.el); }
  function stepParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += dt;
      if (p.age >= p.life) { retire(p); particles.splice(i, 1); continue; }
      // paper: a quick burst that drags into a fluttering fall
      const drag = Math.exp(-2.6 * dt);
      p.vx = p.vx * drag + Math.sin(p.age * 7 + p.ph) * 40 * dt;
      p.vy = p.vy * drag + 420 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      const pop = p.age < 0.18 ? outBack(p.age / 0.18) : 1;
      const fade = 1 - smooth((p.age / p.life - 0.65) / 0.35);
      const flip = Math.cos(p.age * 9 + p.ph); // turning paper: scaleY flips through 0
      p.el.setAttribute('transform', `translate(${(p.x * k).toFixed(1)} ${(p.y * k).toFixed(1)}) rotate(${p.r.toFixed(0)}) scale(${(k * p.s * pop).toFixed(2)} ${(k * p.s * pop * flip).toFixed(2)})`);
      p.el.setAttribute('opacity', fade.toFixed(2));
    }
  }

  // ---- the choreography ----
  const R = rand(seed);
  let time = 0;
  const api = {
    part, zone, burst, rand: R, spring, blinker: () => blinker(R), actor: (a, g) => actor(R, a, g), hopper,
    bump, smooth, outBack, clamp, TAU,
    /** Eased 0..1: is the pointer on any of these parts? Faster in than out. */
    hover(...ids) {
      const key = ids.join(' ');
      const on = hovered && ids.includes(hovered) ? 1 : 0;
      let e = hoverEase.get(key);
      if (!e) { e = { v: 0, t: -1 }; hoverEase.set(key, e); }
      if (e.t !== time) {
        e.v += (on - e.v) * (1 - Math.exp(-(on ? 6 : 2.6) * frameDt));
        e.t = time;
      }
      return e.v;
    },
    /** True while the pointer is on any of these parts. */
    on: (...ids) => !!hovered && ids.includes(hovered),
    /** Seconds since the pointer arrived on the current part. */
    since: () => time - enteredAt,
    /** The part tapped (touch or click) this frame, once. */
    takeTap() { const t = tapped; tapped = null; return t; },
    /** A shared breeze ~0.4…1.4: gusts that travel across the picture, right to left. */
    wind(t, x = 0) {
      const u = t * 0.25 + (1 - x / ((svg.viewBox.baseVal.width || 1) / k)) * 0.8;
      return 0.9 + 0.35 * Math.sin(u * 2.1) * Math.sin(u * 0.73 + 1.3) + 0.15 * Math.sin(u * 5.3);
    },
  };
  let frameDt = 1 / 60;
  let script = null;
  let broken = false;

  style.textContent = css;
  svg.appendChild(fx);
  svg.insertBefore(style, svg.firstChild);
  try {
    script = choreography(api) || {};
  } catch (err) {
    broken = true;
    console.error('[PaperCut] choreography failed to start:', err);
  }

  const mul = (a, b) => [
    a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
  ];
  function compose(h, seen) {
    if (seen.has(h)) return h.m;
    seen.add(h);
    const [px, py] = [h.pivot[0] * k, h.pivot[1] * k];
    const c = Math.cos((h.r * Math.PI) / 180), s = Math.sin((h.r * Math.PI) / 180);
    // T(pivot + offset) · R · S · T(-pivot)
    const a = c * h.sx, b = s * h.sx, cc = -s * h.sy, d = c * h.sy;
    const local = [a, b, cc, d, px + h.x * k - (a * px + cc * py), py + h.y * k - (b * px + d * py)];
    h.m = h.parent ? mul(compose(h.parent, seen), local) : local;
    return h.m;
  }

  const inst = {
    frame(dt) {
      if (broken) return;
      frameDt = dt;
      time += dt;
      for (const h of handles.values()) { h.x = 0; h.y = 0; h.r = 0; h.sx = 1; h.sy = 1; h.o = 1; }
      try {
        if (script.update) script.update(time, dt);
      } catch (err) {
        broken = true;
        console.error('[PaperCut] choreography stopped:', err);
        return;
      }
      stepParticles(dt);
      const seen = new Set();
      for (const h of handles.values()) {
        const m = compose(h, seen);
        const identity = Math.abs(m[0] - 1) < 1e-4 && Math.abs(m[1]) < 1e-4 && Math.abs(m[2]) < 1e-4 && Math.abs(m[3] - 1) < 1e-4 && Math.abs(m[4]) < 0.01 && Math.abs(m[5]) < 0.01;
        const out = identity ? 'none' : `matrix(${m.map((v, i) => v.toFixed(i < 4 ? 4 : 2)).join(',')})`;
        if (out !== h.out) { svg.style.setProperty(`--pt-${h.id}`, out); h.out = out; }
        const o = h.o.toFixed(2);
        if (o !== h.outO) { svg.style.setProperty(`--po-${h.id}`, o); h.outO = o; }
      }
    },
    start() { live.add(inst); wake(); },
    stop() { live.delete(inst); },
    destroy() {
      live.delete(inst);
      clearTimeout(clearTimer);
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerleave', onLeave);
      svg.removeEventListener('pointerdown', onDown);
    },
  };
  return inst;
}
