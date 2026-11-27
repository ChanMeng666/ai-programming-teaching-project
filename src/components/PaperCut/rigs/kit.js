/**
 * kit.js — behaviours shared by the choreographies. Coordinates are SOURCE-PNG pixels
 * (open static/img/illustrations/<name>.png to read them). Every behaviour ADDS to a part's
 * pose, so several can drive the same part in one frame.
 */

/** Detects the frame something becomes true: const entered = edge(); if (entered(on)) … */
export function edge() {
  let was = false;
  return (on) => {
    const fire = on && !was;
    was = on;
    return fire;
  };
}

/**
 * A face: random blinks (one in five doubled), an idle actor (nod / tilt / look aside every
 * few seconds), hair that sways with the breeze, and a happy reaction while its character is
 * hovered (a blink on arrival, then an eager nodding bounce).
 *   head: part id · neck: [x, y] pivot · eyes / hair: part ids · zone: hover ids of the body
 *   nested: the scene nests eyes / hair inside the head's <g> (code-drawn scenes)
 */
export function face(api, { head, neck, eyes = [], hair = [], zone = [], nod = 3.5, hairSway = 1.4, parent, nested = false, hairPivot }) {
  // nested: a code-drawn scene already nests eyes and hair inside the head's <g>
  const under = nested ? undefined : head;
  const H = api.part(head, { pivot: neck, parent });
  const E = eyes.map((id) => api.part(id, { parent: under }));
  const F = hair.map((id) => api.part(id, { parent: under, pivot: hairPivot }));
  const blink = api.blinker();
  const act = api.actor([['nod', 1.1], ['tilt', 1.7], ['look', 2.2]], [3, 8]);
  const ids = [head, ...eyes, ...hair, ...zone];
  const entered = edge();
  const ph = api.rand() * 6;
  return {
    hovered: () => api.on(...ids),
    update(t, dt) {
      const h = api.hover(...ids);
      const on = api.on(...ids);
      if (entered(on)) blink.force();
      act.step(dt, !on);
      const open = blink.step(dt);
      for (const e of E) e.sy *= 0.1 + 0.9 * open;
      const { bump, smooth } = api;
      let nodU = act.is('nod');
      if (nodU >= 0) H.r += Math.sin(nodU * Math.PI * 2) * bump(nodU) * nod;
      const tilt = act.is('tilt');
      if (tilt >= 0) H.r += bump(tilt) * nod * 1.3 * act.side;
      const look = act.is('look');
      if (look >= 0) {
        const hold = smooth(look / 0.2) * (1 - smooth((look - 0.75) / 0.25));
        H.r += hold * nod * 0.8 * act.side;
        H.x += hold * 1.5 * act.side;
      }
      // hovered: an eager little nodding bounce
      const s = api.since();
      H.r += Math.sin(s * 9) * nod * 0.7 * h;
      H.y -= Math.abs(Math.sin(s * 9)) * 2.2 * h;
      H.r += Math.sin(t * 0.9 + ph) * 0.6; // never quite still
      const w = api.wind(t, neck[0]);
      F.forEach((f, i) => {
        f.r += Math.sin(t * 1.9 + i + ph) * hairSway * w + Math.sin(s * 14) * 2 * h * Math.exp(-s * 2);
      });
    },
  };
}

/** A star / sparkle: breathes in size and turns a little; `kick` (0..1) makes it flare. */
export function twinkle(P, t, phase, { amp = 0.1, turn = 8, speed = 2.2 } = {}, kick = 0) {
  const s = 1 + amp * Math.sin(t * speed + phase) + 0.3 * kick;
  P.sx *= s;
  P.sy *= s;
  P.r += Math.sin(t * speed * 0.5 + phase) * turn + kick * 25;
}

/** Floats up and down (and drifts a touch sideways) on its own phase. */
export function bob(P, t, phase, { y = 4, x = 1.5, speed = 1.3 } = {}) {
  P.y += Math.sin(t * speed + phase) * y;
  P.x += Math.sin(t * speed * 0.6 + phase * 1.7) * x;
}

/** A one-shot 0..1..0 pulse of `dur` seconds, restarted by `fire()`. */
export function pulse(dur = 0.5) {
  let u = 1;
  return {
    fire() { u = 0; },
    step(dt) { u = Math.min(1, u + dt / dur); return u < 1 ? Math.sin(u * Math.PI) : 0; },
    get running() { return u < 1; },
  };
}
