// hero (scenes/hero.mjs, 1200 × 837): three friends building a site out of oversized blocks.
// Every arm is jointed (shoulder → elbow), so the choreography can really move people.
import { edge, face, pulse } from './kit';

export default function hero(api) {
  // hover zones (artboard px), most specific first
  api.zone('card-code', { poly: [[372, 40], [730, 2], [748, 236], [392, 276]] });
  api.zone('card-layout', { poly: [[805, 0], [1040, 50], [985, 315], [748, 262]] });
  api.zone('block-text', { rect: [320, 270, 545, 512] });
  api.zone('block-play', { rect: [218, 505, 552, 805] });
  api.zone('kid-a', { rect: [0, 0, 330, 837] });
  api.zone('kid-c', { rect: [835, 280, 1200, 837] });
  api.zone('kid-b', { rect: [560, 170, 835, 837] });
  const { part, burst, bump, smooth, clamp } = api;

  const kids = [
    face(api, { head: 'a-head', neck: [180, 126], eyes: ['a-eye'], hair: ['a-hair'], zone: ['kid-a'], nested: true, hairPivot: [180, 60] }),
    face(api, { head: 'b-head', neck: [700, 424], eyes: ['b-eye'], zone: ['kid-b'], nested: true }),
    face(api, { head: 'c-head', neck: [886, 390], eyes: ['c-eye'], hair: ['c-hair'], zone: ['kid-c'], nested: true, hairPivot: [900, 330] }),
  ];
  const kidIn = kids.map(() => edge());
  const kidTops = [[185, 10], [690, 300], [880, 280]];

  // A: the reaching arm pushes the card into place
  const aArm = part('a-arm', { pivot: [206, 148] });
  const aFore = part('a-fore', { pivot: [300, 204] });
  const aArm2 = part('a-arm2', { pivot: [126, 170] });
  // B: waves with her free arm; her long hair swings
  const bArm = part('b-arm', { pivot: [652, 412] });
  const bFore = part('b-fore', { pivot: [604, 340] });
  const bArm2 = part('b-arm2', { pivot: [772, 400] });
  const bHair = part('b-hair', { pivot: [716, 352] });
  const waveAct = api.actor([['wave', 2.4]], [3, 7]);
  // C: jogs on the spot carrying the layout card, reaching back to B
  const c = part('c', { pivot: [940, 800] });
  const cArm2 = part('c-arm2', { pivot: [906, 432] });

  // the props
  const lt = part('code-lt'), slash = part('code-slash'), gt = part('code-gt');
  const codeIn = edge();
  const tiles = [1, 2, 3, 4, 5].map((i) => part(`tile-${i}`));
  const layoutIn = edge();
  let wave = -9, nextWave = 3;
  const bars = [1, 2, 3].map((i) => {
    const p = part(`bar-${i}`);
    if (p.box) p.pivot = [p.box.x0, p.pivot[1]];
    return p;
  });
  const textIn = edge();
  let typed = -9, nextType = 5;
  const al = part('arrow-l'), ar = part('arrow-r');
  const playIn = edge();
  const thump = pulse(0.35);

  return {
    update(t, dt) {
      kids.forEach((k, i) => {
        k.update(t, dt);
        if (kidIn[i](k.hovered())) burst(kidTops[i][0], kidTops[i][1], { n: 10, speed: 220 });
      });
      const hA = api.hover('kid-a'), hB = api.hover('kid-b'), hC = api.hover('kid-c');

      // A — a slow push on the card; hovered, an eager double tap on it
      const push = Math.sin(t * 1.3) * 0.5 + 0.5;
      aArm.r += -2 + 3 * push + Math.sin(api.since() * 12) * 4 * hA;
      aFore.r += 3 * push - 4 * hA * Math.abs(Math.sin(api.since() * 12));
      aArm2.r += Math.sin(t * 1.3 + 1) * 1.5;

      // B — waves now and then, and the whole time she is hovered
      waveAct.step(dt, hB < 0.1);
      const w = waveAct.is('wave');
      const waving = Math.max(w >= 0 ? smooth(w / 0.15) * (1 - smooth((w - 0.85) / 0.15)) : 0, hB);
      bArm.r += -14 * waving + Math.sin(t * 1.1) * 2;
      bFore.r += Math.sin(t * 11) * 22 * waving;
      bArm2.r += Math.sin(t * 1.4) * 1.5;
      bHair.r += Math.sin(t * 1.8) * 2.2 * api.wind(t, 760) + Math.sin(t * 11) * 2 * waving;

      // C — a jog on the spot (the card rides along); hovered, he hops
      const stride = Math.abs(Math.sin(t * 2.6));
      c.y -= 4 * stride + 14 * hC * Math.abs(Math.sin(api.since() * 7));
      c.r += Math.sin(t * 2.6) * 0.8;
      cArm2.r += Math.sin(t * 2.6) * 4;

      // < / >: breathe; hovered they spread, the slash spins once
      const hc = api.hover('card-code');
      if (codeIn(api.on('card-code'))) burst(560, 130, { n: 16, speed: 300 });
      const br = Math.sin(t * 1.8) * 0.5 + 0.5;
      lt.x -= 2 * br + 12 * hc;
      gt.x += 2 * br + 12 * hc;
      if (api.on('card-code')) slash.r += smooth(api.since() / 0.6) * 360;
      slash.r += Math.sin(t * 1.1) * 3;
      for (const p of [lt, gt]) { p.sx *= 1 + 0.12 * hc; p.sy *= 1 + 0.12 * hc; }

      // tiles light up in a wave every few seconds, and keep waving while hovered
      if (layoutIn(api.on('card-layout'))) { wave = t; burst(890, 150, { n: 12, speed: 240 }); }
      if (t > nextWave || (api.on('card-layout') && t - wave > 1.1)) { wave = t; nextWave = t + 6 + api.rand() * 4; }
      tiles.forEach((p, i) => {
        const u = (t - wave - i * 0.12) / 0.45;
        const k = u > 0 && u < 1 ? bump(u) : 0;
        p.sx *= 1 + 0.16 * k; p.sy *= 1 + 0.16 * k; p.r += 4 * k;
      });

      // the text block retypes its lines every few seconds, and on hover
      if (textIn(api.on('block-text'))) { typed = t; burst(430, 300, { n: 10, speed: 220 }); }
      if (t > nextType) { typed = t; nextType = t + 8 + api.rand() * 5; }
      bars.forEach((p, i) => {
        const u = t - typed;
        if (u > 2.2) return;
        const erase = clamp(u / 0.25, 0, 1);
        const type = clamp((u - 0.35 - i * 0.45) / 0.4, 0, 1);
        p.sx *= Math.max(0.02, 1 - erase + type * erase);
      });

      // play arrows: a slow heartbeat; hovered they press apart and thump
      const hp = api.hover('block-play');
      if (playIn(api.on('block-play'))) { thump.fire(); burst(385, 650, { n: 12, speed: 240 }); }
      if (api.on('block-play') && !thump.running && api.since() > 0.5) thump.fire();
      const beat = Math.pow(Math.max(0, Math.sin(t * 2.4)), 8);
      const th = thump.step(dt);
      al.x -= 2 * beat + 8 * hp + 4 * th;
      ar.x += 2 * beat + 8 * hp + 4 * th;
      const grow = 1 + 0.04 * beat + 0.1 * th;
      for (const p of [al, ar]) { p.sx *= grow; p.sy *= grow; }
    },
  };
}
