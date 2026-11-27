// capstone — a winner on the podium, trophy up, confetti in the air.
// 560 × 560, the artboard of the old capstone.png.
import { blob, card, circle, hand, part, poly, profileHead, shoe, stroke, svg } from './draw.mjs';

const C = {
  skin: '#f5b47f', hair: '#2d3a4a', shirt: '#f26d4f', pants: '#857dc9', shoe: '#f9bf27',
  podium: ['#6fa936', '#78b33e', '#6aa234'], gold: '#f9bf27', base: '#36414d', ink: '#2d3a4a',
  coral: '#f26d4f', purple: '#857dc9',
};

const confetti = () =>
  part('conf-1', stroke([[150, 66], [164, 82], [148, 96], [166, 112]], C.gold, 9)) +
  part('conf-2', card(225, 72, 18, 40, 3, C.coral, -40)) +
  part('conf-3', card(132, 155, 16, 34, 3, C.purple, -55)) +
  part('conf-4', card(141, 260, 14, 30, 3, C.coral, 30)) +
  part('conf-5', card(433, 122, 14, 32, 3, C.purple, 60)) +
  part('conf-6', circle(390, 196, 11, C.gold)) +
  part('conf-7', poly([[396, 268], [404, 234], [436, 220], [450, 232], [430, 240], [440, 252], [420, 252], [418, 268], [404, 256]], C.purple));

const podium = () =>
  card(198, 482, 118, 86, 3, C.podium[0]) + card(314, 452, 116, 146, 3, C.podium[1]) + card(416, 486, 90, 72, 3, C.podium[2]);

const winner = () =>
  stroke([[244, 244], [226, 330], [214, 418]], C.pants, 50) + shoe(220, 428, 0, C.shoe, 56, 28) +
  stroke([[292, 246], [346, 292], [334, 366]], C.pants, 50) + shoe(338, 374, 6, C.shoe, 56, 28) +
  part('arm2', stroke([[196, 208], [180, 242], [216, 256]], C.shirt, 34), hand(226, 256, 10, C.skin, 15, 1)) +
  stroke([[256, 172], [254, 198]], C.skin, 26) +
  blob([[196, 202], [284, 184], [312, 200], [296, 246], [236, 250], [204, 228]], C.shirt) +
  profileHead('w', 256, 148, 28, 34, C.skin, 1, C.ink, {
    cap: C.hair,
  });

// the raised arm carries the trophy: shoulder → elbow → trophy
const trophyArm = () =>
  part('t-arm', stroke([[300, 196], [344, 150]], C.shirt, 34),
    part('trophy',
      stroke([[344, 150], [360, 118]], C.skin, 26),
      stroke([[312, 56], [290, 64], [300, 88], [326, 92]], C.gold, 10),
      stroke([[404, 56], [426, 64], [416, 88], [390, 92]], C.gold, 10),
      `<path d="M304,40 L412,40 Q410,98 358,104 Q306,98 304,40 Z" fill="${C.gold}"/>`,
      card(358, 116, 14, 26, 3, C.gold),
      card(366, 144, 48, 18, 4, C.base),
      hand(358, 128, -70, C.skin, 15, 1)));

export default function capstoneScene(label) {
  return svg(560, 560, confetti() + podium() + winner() + trophyArm(), label);
}
