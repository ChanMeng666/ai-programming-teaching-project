// home-community (scenes/home-community.mjs, 640 × 627): two friends mid-air in a high five.
// Joined at the hands, they float as one pair; legs kick, hair streams; hovered, they jump.
import { bob, edge, face, pulse } from './kit';

export default function homeCommunity(api) {
  api.zone('bubble-1', { rect: [56, 36, 180, 140] });
  api.zone('bubble-2', { rect: [378, 0, 494, 94] });
  api.zone('bubble-3', { rect: [524, 370, 634, 457] });
  api.zone('pair', { rect: [0, 0, 640, 627] });
  const { part, burst, hopper } = api;
  const him = face(api, { head: 'm-head', neck: [212, 176], eyes: ['m-eye'], hair: ['m-hair'], zone: ['pair'], nested: true, hairPivot: [210, 110] });
  const her = face(api, { head: 'w-head', neck: [432, 168], eyes: ['w-eye'], zone: ['pair'], nested: true });
  const pair = part('pair', { pivot: [330, 600] });
  const legs = [['m-leg1', 176, 300], ['m-leg2', 226, 300], ['w-leg1', 424, 344], ['w-leg2', 478, 344]].map(([id, x, y]) => part(id, { pivot: [x, y] }));
  const arms = [['m-arm2', 156, 214], ['w-arm2', 500, 214]].map(([id, x, y]) => part(id, { pivot: [x, y] }));
  const wHair = part('w-hair', { pivot: [440, 110] });
  const bubbles = ['bubble-1', 'bubble-2', 'bubble-3'].map((id) => part(id));
  const bubbleIn = bubbles.map(() => edge());
  const talk = bubbles.map(() => pulse(0.45));
  const phase = bubbles.map(() => api.rand() * 6.3);
  const pairIn = edge();
  const jump = hopper(22, 0.55, () => burst(322, 24, { n: 14, speed: 300 }));
  let nextTalk = 2;

  return {
    update(t, dt) {
      him.update(t, dt);
      her.update(t, dt);
      // airborne: a slow float; the legs kick in turn, the free arms flap a little
      pair.y += Math.sin(t * 1.5) * 6;
      pair.r += Math.sin(t * 0.75) * 0.8;
      const on = api.on('pair');
      if (pairIn(on)) burst(322, 24, { n: 12, speed: 260 });
      jump.step(dt, on);
      pair.y += jump.y;
      pair.sx *= jump.sx;
      pair.sy *= jump.sy;
      legs.forEach((p, i) => { p.r += Math.sin(t * 1.5 + i * 1.7) * 5 - jump.y * 0.3 * (i % 2 ? 1 : -1); });
      arms.forEach((p, i) => { p.r += Math.sin(t * 1.5 + i * 3) * 6 + (i ? 1 : -1) * jump.y * 0.4; });
      wHair.r += Math.sin(t * 1.7) * 2.5 * api.wind(t, 480) - jump.y * 0.25;

      if (t > nextTalk) { talk[Math.floor(api.rand() * 3)].fire(); nextTalk = t + 2.5 + api.rand() * 3; }
      bubbles.forEach((p, i) => {
        bob(p, t, phase[i], { y: 5, x: 2, speed: 1.1 });
        if (bubbleIn[i](api.on(p.id))) { talk[i].fire(); burst(p.pivot[0], p.pivot[1], { n: 8, speed: 200 }); }
        const k = talk[i].step(dt) + 0.12 * api.hover(p.id);
        p.sx *= 1 + 0.12 * k; p.sy *= 1 + 0.12 * k;
        p.r += Math.sin(t * 9) * 5 * k;
      });
    },
  };
}
