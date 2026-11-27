// capstone (scenes/capstone.mjs, 560 × 560): a winner on the podium, trophy up, confetti.
import { bob, edge, face } from './kit';

export default function capstone(api) {
  api.zone('trophy', { rect: [286, 30, 430, 170] });
  api.zone('winner', { rect: [100, 40, 460, 530] });
  const { part, burst } = api;
  const winner = face(api, { head: 'w-head', neck: [254, 180], eyes: ['w-eye'], zone: ['winner'], nested: true, nod: 3 });
  // the raised arm pumps the trophy: shoulder and elbow both work
  const tArm = part('t-arm', { pivot: [300, 196] });
  const trophy = part('trophy', { pivot: [344, 150] });
  const arm2 = part('arm2', { pivot: [196, 208] });
  const confetti = [1, 2, 3, 4, 5, 6, 7].map((i) => part(`conf-${i}`));
  const phase = confetti.map(() => api.rand() * 6.3);
  const spin = confetti.map(() => (api.rand() - 0.5) * 40);
  const trophyIn = edge(), winnerIn = edge();
  let cheer = 0;

  return {
    update(t, dt) {
      winner.update(t, dt);
      if (winnerIn(winner.hovered())) burst(300, 20, { n: 14, speed: 300 });
      const ht = api.hover('trophy');
      if (trophyIn(api.on('trophy'))) burst(358, 40, { n: 18, speed: 340 });
      if (api.on('trophy') && (cheer += dt) > 0.6) { cheer = 0; burst(358, 40, { n: 6, speed: 300, spread: 1.6 }); }
      // a proud slow sway; hovered, a triumphant pump
      const pump = Math.abs(Math.sin(api.since() * 6)) * ht;
      tArm.r += Math.sin(t * 1.4) * 2 - 8 * pump;
      trophy.r += Math.sin(t * 1.6 + 1) * 3 - 10 * pump + Math.sin(api.since() * 13) * 4 * ht;
      arm2.r += Math.sin(t * 1.4 + 2) * 3;
      confetti.forEach((p, i) => {
        bob(p, t, phase[i], { y: 5, x: 3, speed: 1 + (i % 3) * 0.2 });
        p.r += Math.sin(t * 0.9 + phase[i]) * 14 + t * spin[i] * 0.2;
        p.y -= 6 * ht;
      });
    },
  };
}
