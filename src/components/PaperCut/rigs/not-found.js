// not-found (scenes/not-found.mjs, 560 × 573): a lost explorer with a magnifying glass.
import { edge, face } from './kit';

export default function notFound(api) {
  api.zone('question', { rect: [310, 0, 372, 92] });
  api.zone('glass', { circle: [396, 150, 80] });
  api.zone('map', { poly: [[314, 386], [420, 206], [560, 214], [442, 432]] });
  api.zone('explorer', { rect: [0, 0, 330, 573] });
  const { part, burst, smooth } = api;
  const explorer = face(api, { head: 'e-head', neck: [234, 150], eyes: ['e-eye'], hair: ['e-hair'], zone: ['explorer'], nested: true, hairPivot: [240, 60], nod: 4 });
  const question = part('question', { pivot: [340, 80] });
  const arm = part('arm', { pivot: [226, 168] });
  const glass = part('glass', { pivot: [250, 240] });
  const arm2 = part('arm2', { pivot: [70, 176] });
  const fore2 = part('fore2', { pivot: [40, 262] });
  const map = part('map', { pivot: [320, 390] });
  const qIn = edge(), mapIn = edge(), glassIn = edge();
  let spinFrom = -9, flap = -9;

  return {
    update(t, dt) {
      explorer.update(t, dt);
      if (qIn(api.on('question'))) { spinFrom = t; burst(340, 30, { n: 10, speed: 240 }); }
      question.y += Math.sin(t * 1.7) * 4;
      question.r += Math.sin(t * 1.1) * 8 + smooth((t - spinFrom) / 0.7) * 360;
      // searching: the glass sweeps, shoulder and elbow together; faster when hovered
      const hg = api.hover('glass');
      if (glassIn(api.on('glass'))) burst(396, 150, { n: 10, speed: 220 });
      const sweep = Math.sin(t * (0.9 + 2.2 * hg));
      arm.r += sweep * (2.5 + 2 * hg);
      glass.r += sweep * (3 + 3 * hg);
      // the free hand fidgets, a little lost
      arm2.r += Math.sin(t * 1.3) * 3;
      fore2.r += Math.sin(t * 2.6 + 1) * 8;
      if (mapIn(api.on('map'))) { flap = t; burst(440, 320, { n: 12, speed: 240 }); }
      const f = t - flap;
      map.r += Math.sin(t * 1.3) * 1.5 * api.wind(t, 440) + (f < 1.5 ? Math.sin(f * 12) * Math.exp(-f * 3) * 4 : 0);
      map.sy *= 1 + Math.sin(t * 2.1) * 0.012;
    },
  };
}
