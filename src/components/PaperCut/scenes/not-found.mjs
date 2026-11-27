// not-found — a lost explorer with a magnifying glass over a map.
// 560 × 573, the artboard of the old not-found.png.
import { blob, circle, hand, part, poly, profileHead, shoe, stroke, svg } from './draw.mjs';

const C = {
  skin: '#f2b27d', hair: '#f0744f', top: '#916497', pants: '#f0b43a', shoe: '#4d8a3e',
  ring: '#2f2f33', rim: '#6a6a70', lens: '#9cc4dc', map: '#f6cf9c', mapFold: '#efbf86', road: '#ef5a3c', ink: '#2f2f33',
};

const map = () =>
  part('map',
    poly([[314, 386], [420, 206], [560, 214], [442, 432]], C.map),
    poly([[420, 206], [490, 210], [376, 412], [314, 386]], C.mapFold),
    stroke([[352, 330], [400, 318], [430, 350], [478, 336], [516, 296]], C.road, 9),
    stroke([[420, 230], [436, 270], [416, 310], [442, 360], [430, 420]], C.road, 9),
    stroke([[470, 214], [478, 250], [500, 268], [540, 262]], C.road, 9),
    stroke([[336, 370], [372, 380], [398, 410]], C.road, 9));

const question = () =>
  part('question',
    `<path d="M320,32 Q324,6 346,8 Q370,12 364,36 Q358,52 342,58 L340,66" fill="none" stroke="${C.ink}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`,
    circle(340, 82, 8, C.ink));

const explorer = () =>
  stroke([[132, 286], [116, 392], [72, 498]], C.pants, 64) + shoe(64, 520, 150, C.shoe, 72, 36) +
  stroke([[212, 286], [250, 392], [300, 516]], C.pants, 64) + shoe(306, 536, 6, C.shoe, 72, 36) +
  part('arm2', stroke([[70, 176], [40, 262]], C.top, 42), part('fore2', stroke([[40, 262], [34, 318]], C.skin, 32), hand(34, 334, 96, C.skin, 22, 1))) +
  stroke([[236, 134], [232, 160]], C.skin, 34) +
  blob([[74, 160], [214, 144], [252, 190], [244, 282], [116, 286], [56, 248]], C.top) +
  stroke([[148, 182], [136, 206]], C.ink, 5) +
  profileHead('e', 244, 92, 46, 54, C.skin, 1, C.ink, {
    back: part('e-hair', circle(206, 54, 26, C.hair), circle(238, 40, 26, C.hair), circle(272, 44, 22, C.hair), circle(194, 82, 20, C.hair), circle(292, 58, 14, C.hair)),
  }, { smile: -0.9, eyes: 2, extra: stroke([[258, 58], [290, 66]], C.ink, 5) });

// the glass and the arm holding it: shoulder → elbow → glass
const glass = () =>
  part('arm', stroke([[226, 168], [250, 240]], C.top, 40),
    part('glass',
      stroke([[250, 240], [296, 254]], C.skin, 30),
      stroke([[276, 304], [338, 212]], C.ring, 20),
      circle(396, 150, 74, C.ring), circle(396, 150, 62, C.rim),
      part('lens', circle(396, 150, 52, C.lens)),
      hand(306, 258, -50, C.skin, 22, 1)));

export default function notFoundScene(label) {
  return svg(560, 573, map() + question() + explorer() + glass(), label);
}
