// feeds (scenes/feeds.mjs, 480 × 555): calling out through a megaphone, paper planes flying off.
import { edge, face } from './kit';

export default function feeds(api) {
  api.zone('horn', { rect: [220, 20, 380, 250] });
  api.zone('caller', { rect: [0, 80, 330, 555] });
  const { part, burst, smooth, clamp } = api;
  const caller = face(api, { head: 'c-head', neck: [160, 172], eyes: ['c-eye'], hair: ['c-hair'], zone: ['caller'], nested: true, hairPivot: [140, 110] });
  const arm = part('arm', { pivot: [232, 200] });
  const horn = part('horn', { pivot: [258, 238] });
  const arm2 = part('arm2', { pivot: [120, 204] });
  const fore2 = part('fore2', { pivot: [70, 262] });
  const legs = [part('leg1', { pivot: [150, 284] }), part('leg2', { pivot: [222, 288] })];
  const waves = ['wave-1', 'wave-2'].map((id) => part(id, { pivot: [306, 104] }));
  const planes = ['plane-1', 'plane-2'].map((id) => part(id));
  const flight = planes.map((_, i) => i * 0.45);
  const hornIn = edge(), callerIn = edge();

  return {
    update(t, dt) {
      caller.update(t, dt);
      if (callerIn(caller.hovered())) burst(160, 60, { n: 8, speed: 200 });
      const hh = api.hover('horn');
      if (hornIn(api.on('horn'))) burst(340, 70, { n: 14, speed: 320, angle: -0.6, spread: 1.4 });
      // each call: the horn kicks up, the arm braces, the free arm swings
      const call = (t * (1.1 + 1.4 * hh)) % 1;
      const kick = Math.exp(-call * 8);
      arm.r -= 3 * kick;
      horn.r -= 4 * kick + Math.sin(t * 30) * 1.5 * hh;
      arm2.r += Math.sin(t * 2.2) * 6;
      fore2.r += Math.sin(t * 2.2 - 0.6) * 10;
      legs[0].r += Math.sin(t * 2.2) * 2;
      legs[1].r -= Math.sin(t * 2.2) * 2;
      waves.forEach((p, i) => {
        const u = (call + 1 - i * 0.18) % 1;
        const s = 0.85 + 0.3 * smooth(u);
        p.sx *= s; p.sy *= s;
        p.o *= clamp(1.3 - u, 0.25, 1);
      });
      planes.forEach((p, i) => {
        flight[i] = (flight[i] + dt * (0.16 + 0.22 * hh)) % 1;
        const u = flight[i];
        p.x += u * 60;
        p.y -= u * 34 + Math.sin(u * 9 + i) * 3;
        p.r -= u * 6;
        p.o *= smooth(u / 0.15) * (1 - smooth((u - 0.7) / 0.3));
      });
    },
  };
}
