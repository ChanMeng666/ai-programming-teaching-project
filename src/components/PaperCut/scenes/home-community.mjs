// home-community — two friends mid-air in a high five, speech bubbles around them.
// 640 × 627, the artboard of the old home-community.png.
import { blob, circle, hand, part, poly, profileHead, shoe, stroke, svg } from './draw.mjs';

const C = {
  navy: '#2c3a57', hair: '#1f2a40', shirt: '#fbc93f', pants: '#f37159', green: '#1b9b80',
  coral: '#f37159', purple: '#6c62ad', top: '#f5dfb0', ink: '#1f2a40',
  b1: '#fbc93f', b2: '#a99bd0', b3: '#6bbcd8',
};

const bubble = (id, x, y, w, h, fill, tail) =>
  part(id, `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.32}" fill="${fill}"/>`, poly(tail, fill));

const him = () =>
  // legs: one kicked back, one tucked under
  part('m-leg1', stroke([[176, 300], [120, 410], [52, 402]], C.pants, 58), shoe(40, 402, 200, C.green, 62, 34)) +
  part('m-leg2', stroke([[226, 300], [286, 400], [214, 512]], C.pants, 58), shoe(206, 528, 112, C.green, 62, 34)) +
  part('m-arm2', stroke([[156, 214], [96, 262], [52, 316]], C.navy, 34), hand(42, 330, 120, C.navy, 18, 1)) +
  stroke([[212, 172], [210, 196]], C.navy, 30) +
  blob([[150, 200], [246, 180], [278, 196], [248, 302], [160, 298]], C.shirt) +
  profileHead('m', 214, 134, 34, 42, C.navy, 1, '#f7f2e6', {
    back: part('m-hair', circle(194, 102, 22, C.hair), circle(216, 92, 20, C.hair), circle(182, 128, 18, C.hair), circle(236, 98, 14, C.hair)),
  }) +
  part('m-arm', stroke([[252, 190], [290, 116]], C.navy, 34), part('m-fore', stroke([[290, 116], [312, 46]], C.navy, 30), hand(316, 28, -78, C.navy, 19, 1)));

const her = () =>
  part('w-leg1', stroke([[424, 344], [372, 440], [458, 556]], C.green, 52), shoe(462, 574, 80, C.coral, 60, 30)) +
  part('w-leg2', stroke([[478, 344], [534, 446], [590, 528]], C.green, 52), shoe(596, 548, 70, C.coral, 60, 30)) +
  part('w-hair', blob([[418, 98], [468, 90], [540, 124], [574, 150], [562, 196], [520, 190], [470, 162], [440, 140]], C.purple)) +
  part('w-arm2', stroke([[500, 214], [568, 262]], C.coral, 30), part('w-fore2', stroke([[568, 262], [612, 306]], C.coral, 28), hand(622, 318, 46, C.coral, 18, -1))) +
  stroke([[432, 166], [432, 190]], C.coral, 28) +
  blob([[384, 184], [470, 168], [526, 214], [478, 252], [410, 256]], C.top) +
  blob([[408, 250], [478, 250], [534, 330], [462, 356], [358, 332]], C.purple) +
  profileHead('w', 432, 130, 30, 38, C.coral, -1, C.ink, {
    front: blob([[418, 98], [458, 92], [470, 118], [446, 112], [424, 112]], C.purple),
  }) +
  part('w-arm', stroke([[388, 190], [346, 114]], C.coral, 30), part('w-fore', stroke([[346, 114], [332, 46]], C.coral, 28), hand(330, 28, -96, C.coral, 19, -1)));

export default function homeCommunityScene(label) {
  return svg(640, 627,
    bubble('bubble-1', 62, 42, 112, 76, C.b1, [[118, 112], [146, 112], [146, 136]]) +
    bubble('bubble-2', 384, 2, 104, 72, C.b2, [[408, 68], [432, 68], [404, 90]]) +
    bubble('bubble-3', 530, 376, 98, 62, C.b3, [[548, 432], [570, 432], [552, 452]]) +
    part('pair', him(), her()),
    label);
}
