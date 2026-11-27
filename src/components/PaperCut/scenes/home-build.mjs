// home-build — a builder lifting a checked card onto a stack of blocks.
// 640 × 640, the artboard of the old home-build.png.
import { blob, card, circle, hand, part, profileHead, shoe, stroke, svg } from './draw.mjs';

const C = {
  helmet: '#fdcb3d', hair: '#43394d', skin: '#fd9373', shirt: '#fe645c', sleeve: '#cf8ad8',
  pants: '#4bbf5c', shoe: '#f56e5a', belt: '#43394d', wrench: '#b07ad6',
  card: '#fecb3d', ink: '#43394d', purple: '#af83d8', pink: '#dc96d5', blue: '#4cb4e9', red: '#fe645c', cream: '#fde3c0',
};

const stack = () =>
  part('stack',
    card(404, 572, 134, 116, 8, C.red),
    part('square', card(404, 572, 62, 58, 6, C.cream)),
    card(430, 462, 186, 106, 8, C.blue),
    part('line-1', stroke([[438, 452], [496, 452]], C.ink, 10)),
    part('line-2', stroke([[438, 480], [496, 480]], C.ink, 10)),
    card(480, 342, 138, 136, 8, C.purple),
    part('dot', circle(480, 342, 32, C.pink)),
  );

const builder = () =>
  // legs: the back one braced, the front one bent under him
  stroke([[176, 316], [116, 430], [70, 540]], C.pants, 64) + shoe(62, 562, 150, C.shoe, 78, 40) +
  stroke([[224, 318], [312, 396], [252, 540]], C.pants, 64) + shoe(254, 566, 6, C.shoe, 78, 40) +
  // the back arm (purple sleeve) up under the card
  part('b-arm', stroke([[268, 236], [380, 236], [456, 178]], C.sleeve, 42),
    hand(470, 164, -40, C.skin, 20, 1)) +
  // body, belt, pouch, wrench
  stroke([[240, 136], [240, 170]], C.skin, 36) +
  blob([[168, 168], [296, 150], [312, 196], [250, 296], [158, 298], [148, 228]], C.shirt) +
  stroke([[148, 280], [242, 290]], C.belt, 26) +
  blob([[138, 296], [196, 300], [200, 354], [170, 372], [136, 352]], C.belt) +
  part('wrench', stroke([[182, 300], [176, 262]], C.wrench, 12), circle(176, 258, 13, C.wrench), circle(176, 248, 6, C.shirt)) +
  stroke([[252, 206], [262, 222]], C.ink, 4) +
  profileHead('b', 246, 104, 40, 46, C.skin, 1, C.ink, {
    back: blob([[206, 112], [232, 100], [236, 150], [214, 156], [200, 132]], C.hair),
    front: part('helmet', `<path d="M200,92 Q204,44 250,44 Q294,46 294,92 Z" fill="${C.helmet}"/>`, stroke([[194, 92], [302, 86]], C.helmet, 12)),
  }) +
  // the front arm reaching up to the card
  part('f-arm', stroke([[292, 176], [356, 146]], C.shirt, 40),
    part('f-fore', stroke([[356, 146], [410, 96]], C.skin, 32), hand(422, 84, -42, C.skin, 22, -1)));

const checkCard = () =>
  part('card', `<g transform="rotate(-4 470 94)">${card(470, 94, 142, 146, 10, C.card)}${part('check', stroke([[452, 98], [474, 116], [508, 70]], C.ink, 13))}</g>`);

export default function homeBuildScene(label) {
  return svg(640, 640, stack() + checkCard() + builder(), label);
}
