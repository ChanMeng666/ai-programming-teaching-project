// message-board (scenes/message-board.mjs, 560 × 511): posting a big envelope into a mailbox.
import { edge, face, pulse } from './kit';

export default function messageBoard(api) {
  api.zone('letter', { poly: [[218, 166], [404, 100], [474, 236], [286, 300]] });
  api.zone('mailbox', { rect: [300, 0, 560, 490] });
  api.zone('sender', { rect: [0, 50, 300, 511] });
  const { part, burst } = api;
  const sender = face(api, { head: 's-head', neck: [140, 168], eyes: ['s-eye'], hair: ['s-hair'], zone: ['sender'], nested: true, hairPivot: [120, 90] });
  const letter = part('letter', { pivot: [346, 214] });
  const mailbox = part('mailbox', { pivot: [384, 490] });
  const slot = part('slot');
  const legs = [part('s-leg1', { pivot: [112, 292] }), part('s-leg2', { pivot: [164, 292] })];
  const boxIn = edge(), senderIn = edge(), letterIn = edge();
  const gulp = pulse(0.45);
  let nextGulp = 4, spray = 0;
  const notes = ['#ff705d', '#f5e211', '#2ba0ff', '#8ed462'];

  return {
    update(t, dt) {
      sender.update(t, dt);
      if (senderIn(sender.hovered())) burst(140, 40, { n: 8, speed: 200 });
      // pushing: the letter (and the hand on it) nudges toward the slot, the legs brace
      const hl = api.hover('letter');
      const push = Math.pow(Math.sin(t * 1.4) * 0.5 + 0.5, 2) * (1 + 1.5 * hl);
      letter.x += 6 * push;
      letter.y -= 3 * push;
      legs[0].r -= 2 * push;
      legs[1].r += 1.5 * push;
      if (letterIn(api.on('letter'))) burst(400, 120, { n: 10, speed: 240 });
      // the mailbox gulps: a squash, the slot opening wide, notes flying out
      const on = api.on('mailbox');
      if (boxIn(on)) { gulp.fire(); burst(384, 86, { n: 14, speed: 320, spread: 1.4, colours: notes }); spray = 0; }
      if (on && (spray += dt) > 0.7) { spray = 0; gulp.fire(); burst(384, 86, { n: 5, speed: 300, spread: 1.2, colours: notes }); }
      if (t > nextGulp) { gulp.fire(); nextGulp = t + 5 + api.rand() * 4; }
      const g = gulp.step(dt);
      mailbox.sy *= 1 - 0.035 * g;
      mailbox.sx *= 1 + 0.02 * g;
      slot.sy *= 1 + 0.9 * g;
      slot.sx *= 1 + 0.06 * g;
    },
  };
}
