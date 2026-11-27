// home-learn (scenes/home-learn.mjs, 640 × 654): a reader with an open book, sparks rising.
import { bob, edge, face, twinkle } from './kit';

export default function homeLearn(api) {
  api.zone('book', { rect: [300, 0, 590, 250] });
  api.zone('book', { rect: [176, 170, 646, 460] });
  api.zone('reader', { rect: [0, 0, 640, 654] });
  const { part, burst, clamp } = api;
  const reader = face(api, { head: 'r-head', neck: [130, 236], eyes: ['r-eye'], hair: ['r-hair'], zone: ['reader'], nested: true, hairPivot: [110, 110], nod: 3 });
  // the book rides on the forearm: it tips at the elbow as she reads
  const book = part('book', { pivot: [232, 456] });
  const stars = ['star-big', 'star-small'].map((id) => part(id));
  const bits = ['dot-1', 'dot-2', 'dot-3', 'dot-4', 'gem', 'diamond', 'tri'].map((id) => part(id));
  const rays = ['ray-1', 'ray-2', 'ray-3', 'ray-4'].map((id) => {
    const p = part(id);
    if (p.box) p.pivot = [(p.box.x0 + p.box.x1) / 2, p.box.y1];
    return p;
  });
  const bookIn = edge();
  const phase = [...stars, ...bits, ...rays].map(() => api.rand() * 6.3);
  let fountain = 0, turnAt = -9, nextTurn = 4;

  return {
    update(t, dt) {
      reader.update(t, dt);
      const on = api.on('book');
      const h = api.hover('book');
      if (bookIn(on)) { burst(440, 220, { n: 16, speed: 320, spread: 1.6 }); fountain = 0; turnAt = t; }
      if (on && (fountain += dt) > 0.55) { fountain = 0; burst(440, 230, { n: 5, speed: 300, spread: 1.2 }); }
      // reading: the book lifts a touch now and then, as if a page were turned
      if (t > nextTurn) { turnAt = t; nextTurn = t + 5 + api.rand() * 4; }
      const tu = t - turnAt;
      book.r += Math.sin(t * 0.9) * 0.8 - (tu < 0.8 ? Math.sin((tu / 0.8) * Math.PI) * 2.5 : 0) - 2 * h;
      stars.forEach((p, i) => { twinkle(p, t, phase[i], { amp: 0.09, turn: 7 }, h); p.y -= 8 * h; });
      bits.forEach((p, i) => {
        bob(p, t, phase[i + 2], { y: 4 + (i % 3), x: 2 });
        p.r += Math.sin(t * 0.8 + phase[i + 2]) * 12;
        p.y -= 10 * h;
      });
      rays.forEach((p, i) => {
        const f = 0.5 + 0.5 * Math.sin(t * 3.1 + phase[i + 9] * 2);
        const s = 0.78 + 0.22 * f + 0.25 * h;
        p.sx *= s; p.sy *= s;
        p.o *= clamp(0.55 + 0.45 * f + h, 0, 1);
      });
    },
  };
}
