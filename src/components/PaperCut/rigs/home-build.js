// home-build (scenes/home-build.mjs, 640 × 640): a builder lifting a checked card onto blocks.
import { edge, face, pulse } from './kit';

export default function homeBuild(api) {
  api.zone('card', { rect: [390, 10, 550, 175] });
  api.zone('stack', { rect: [330, 268, 556, 632] });
  api.zone('builder', { rect: [0, 30, 400, 640] });
  const { part, burst, clamp } = api;
  const builder = face(api, { head: 'b-head', neck: [242, 156], eyes: ['b-eye'], zone: ['builder'], nested: true });
  const helmet = part('helmet', { pivot: [248, 92] });
  const wrench = part('wrench', { pivot: [182, 300] });
  // both arms heave the card up together: the card rides with the hands
  const fArm = part('f-arm', { pivot: [292, 176] });
  const fFore = part('f-fore', { pivot: [356, 146] });
  const bArm = part('b-arm', { pivot: [268, 236] });
  const card = part('card', { pivot: [470, 160] });
  const check = part('check');
  const stack = part('stack', { pivot: [430, 630] });
  const dot = part('dot');
  const lines = ['line-1', 'line-2'].map((id) => {
    const p = part(id);
    if (p.box) p.pivot = [p.box.x0, p.pivot[1]];
    return p;
  });
  const square = part('square');
  const cardIn = edge(), stackIn = edge(), builderIn = edge();
  const tick = pulse(0.5);
  let nextTick = 2.5, boing = -9, written = -9, nextWrite = 6;

  return {
    update(t, dt) {
      builder.update(t, dt);
      const hb = api.hover('builder');
      if (builderIn(api.on('builder'))) burst(240, 30, { n: 8, speed: 200 });
      helmet.y -= 5 * hb * Math.abs(Math.sin(api.since() * 6));
      helmet.r -= 6 * hb;
      wrench.r += Math.sin(t * 0.7) * 4 + Math.sin(api.since() * 10) * 18 * hb;

      const hc = api.hover('card');
      const heave = (Math.sin(t * 1.6) * 0.5 + 0.5) * (1 + hc);
      fArm.r -= 3 * heave;
      fFore.r -= 2 * heave;
      bArm.r -= 2.5 * heave;
      card.y -= 6 * heave;
      card.x += 2 * heave;

      // the check ticks: a quick shrink and an overshooting pop
      if (cardIn(api.on('card'))) { tick.fire(); burst(478, 90, { n: 14, speed: 280 }); }
      if (t > nextTick || (api.on('card') && !tick.running && api.since() > 0.6)) { tick.fire(); nextTick = t + 5 + api.rand() * 3; }
      const k = tick.step(dt);
      check.sx *= 1 - 0.35 * k; check.sy *= 1 - 0.35 * k; check.r -= 12 * k;

      // the stack: a jelly boing when touched
      if (stackIn(api.on('stack'))) { boing = t; burst(480, 270, { n: 12, speed: 260 }); }
      const b = t - boing;
      const jelly = b < 1.4 ? Math.sin(b * 16) * Math.exp(-b * 3.2) : 0;
      stack.sy *= 1 - 0.07 * jelly;
      stack.sx *= 1 + 0.05 * jelly;
      stack.r += b < 1.4 ? Math.sin(b * 9) * Math.exp(-b * 3) * 1.5 : 0;

      const breathe = 1 + 0.06 * Math.sin(t * 2.1);
      dot.sx *= breathe; dot.sy *= breathe;
      if (t > nextWrite || (api.on('stack') && t - written > 2)) { written = t; nextWrite = t + 7 + api.rand() * 4; }
      lines.forEach((p, i) => {
        const u = t - written;
        if (u > 1.6) return;
        const erase = clamp(u / 0.2, 0, 1);
        const type = clamp((u - 0.3 - i * 0.4) / 0.4, 0, 1);
        p.sx *= Math.max(0.02, 1 - erase + type * erase);
      });
      const sq = 1 + 0.08 * Math.pow(Math.max(0, Math.sin(t * 1.7 + 1)), 6);
      square.sx *= sq; square.sy *= sq;
    },
  };
}
