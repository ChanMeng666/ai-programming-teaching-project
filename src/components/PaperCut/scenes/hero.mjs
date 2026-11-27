// hero — three friends building a site out of oversized blocks. Drawn as code on the
// 1200 × 837 artboard of the old illustration (static/img/illustrations/hero.png), same
// composition and palette, every arm and head jointed for the choreography in ../rigs/hero.js.
import { blob, card, circle, hand, part, profileHead, shoe, stroke, svg } from './draw.mjs';

const C = {
  yellow: '#fdd65e', pale: '#fdea9f', coral: '#fc835e', coralCard: '#f97a57', coralHair: '#f26a48',
  purple: '#797cb8', green: '#388770', greenDark: '#2a6a55', blue: '#6aaad6', lilac: '#c1afce',
  ink: '#363e4a', brown: '#9c654a', peach: '#f8ae7e',
};

// ---------------------------------------------------------------- props
const ladder = () => {
  const rails = [[[28, 860], [226, 318]], [[96, 860], [266, 330]]];
  let s = '';
  for (let i = 0; i < 8; i++) {
    const u = 0.12 + i * 0.115;
    const at = ([a, b]) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    s += stroke([at(rails[0]), at(rails[1])], C.green, 11);
  }
  return s + rails.map((r) => stroke(r, C.green, 15)).join('');
};

const playBlock = () =>
  card(385, 655, 332, 300, 16, C.lilac) +
  part('arrow-l', blob([[360, 588], [360, 726], [346, 734], [282, 668], [282, 644], [346, 580]], C.pale, 0.35)) +
  part('arrow-r', blob([[392, 566], [404, 560], [494, 642], [494, 664], [404, 746], [392, 740]], C.pale, 0.35));

const textBlock = () =>
  card(431, 391, 220, 240, 16, C.ink) +
  part('bar-1', card(431, 342, 142, 30, 5, C.pale)) +
  part('bar-2', card(406, 393, 96, 30, 5, C.pale)) +
  part('bar-3', card(393, 446, 72, 30, 5, C.pale));

const codeCard = () =>
  `<g transform="rotate(-6 555 138)">` +
  card(555, 138, 362, 248, 18, C.yellow) +
  part('code-lt', stroke([[522, 100], [466, 144], [522, 186]], C.ink, 23)) +
  part('code-slash', stroke([[580, 66], [548, 210]], C.ink, 23)) +
  part('code-gt', stroke([[606, 98], [664, 136], [612, 178]], C.ink, 23)) +
  `</g>`;

const layoutCard = () =>
  `<g transform="rotate(13 890 158)">` +
  card(890, 158, 252, 278, 20, C.coralCard) +
  part('tile-1', card(840, 76, 84, 56, 8, C.pale)) +
  part('tile-2', card(938, 76, 84, 56, 8, C.pale)) +
  part('tile-3', card(889, 152, 182, 60, 8, C.pale)) +
  part('tile-4', card(840, 228, 84, 56, 8, C.pale)) +
  part('tile-5', card(938, 228, 84, 56, 8, C.pale)) +
  `</g>`;

// ---------------------------------------------------------------- people
const head = (id, cx, cy, rx, ry, skin, dir, hair) => profileHead(id.split('-')[0], cx, cy, rx, ry, skin, dir, C.ink, hair);

// A — on the ladder, reaching for the code card
const personA = () =>
  // back leg (long, down the ladder) and front leg (bent, foot on a rung)
  stroke([[108, 290], [96, 420], [92, 548]], C.purple, 62) +
  shoe(96, 566, 14, C.greenDark, 64, 30) +
  stroke([[164, 288], [246, 376], [166, 470]], C.purple, 62) +
  shoe(166, 484, 24, C.greenDark, 64, 30) +
  // neck, torso
  stroke([[182, 104], [176, 150]], C.brown, 34) +
  blob([[124, 132], [198, 124], [236, 168], [222, 266], [150, 284], [80, 266], [88, 196]], C.coral) +
  stroke([[148, 188], [176, 200]], C.ink, 4) +
  // back arm: to the top of the ladder
  part('a-arm2', stroke([[126, 170], [180, 250], [240, 286]], C.coral, 38), hand(256, 292, 20, C.brown, 17, 1)) +
  head('a-head', 190, 80, 38, 46, C.brown, 1, {
    back: part('a-hair', circle(160, 50, 25, C.ink), circle(188, 38, 22, C.ink), circle(213, 46, 15, C.ink), circle(146, 76, 20, C.ink), circle(158, 100, 14, C.ink)),
  }) +
  // reaching arm: shoulder → elbow → hand on the card
  part('a-arm', stroke([[206, 148], [300, 204]], C.coral, 40),
    part('a-fore', stroke([[300, 204], [384, 164]], C.coral, 36), hand(402, 152, -24, C.brown, 19, -1)));

// B — in the middle, one hand up to the code card, one waving
const personB = () =>
  stroke([[742, 552], [858, 690], [918, 770]], C.green, 64) +
  shoe(924, 782, 18, C.ink, 70, 32) +
  stroke([[700, 556], [616, 650], [648, 790]], C.green, 64) +
  shoe(652, 806, 172, C.ink, 70, 32) +
  part('b-arm2', stroke([[772, 400], [746, 300], [704, 230]], C.peach, 30), stroke([[772, 400], [762, 352]], C.yellow, 40), hand(698, 214, -118, C.peach, 18, 1)) +
  part('b-hair', blob([[690, 340], [742, 340], [790, 380], [818, 444], [804, 490], [764, 476], [738, 434], [714, 404], [698, 372]], C.ink)) +
  blob([[656, 402], [728, 380], [778, 400], [772, 474], [750, 548], [698, 554], [662, 476]], C.yellow) +
  stroke([[700, 470], [716, 478]], C.ink, 4) +
  head('b-head', 696, 386, 32, 39, C.peach, -1, {
    front: blob([[676, 352], [716, 344], [740, 360], [724, 372], [700, 364]], C.ink),
  }) +
  // the waving arm
  part('b-arm', stroke([[652, 412], [604, 340]], C.peach, 30), stroke([[652, 412], [636, 388]], C.yellow, 40),
    part('b-fore', stroke([[604, 340], [598, 282]], C.peach, 28), hand(598, 266, -92, C.peach, 18, -1)));

// C — on the right, carrying the layout card, reaching back to B
const personC = () =>
  stroke([[934, 540], [904, 654], [890, 780]], C.purple, 62) +
  shoe(890, 796, 186, C.yellow, 70, 32) +
  stroke([[990, 542], [1046, 640], [1146, 610]], C.purple, 62) +
  shoe(1160, 608, -38, C.yellow, 70, 32) +
  part('c-arm2', stroke([[906, 432], [858, 500], [792, 546]], C.blue, 38), hand(776, 552, 168, C.peach, 18, 1)) +
  blob([[880, 412], [944, 390], [1004, 420], [1012, 502], [960, 528], [906, 520], [888, 470]], C.blue) +
  stroke([[892, 460], [902, 488]], C.ink, 4) +
  head('c-head', 882, 352, 33, 39, C.peach, -1, {
    back: part('c-hair', blob([[868, 314], [904, 300], [928, 326], [922, 366], [900, 378], [892, 346], [870, 332]], C.coralHair)),
  }) +
  part('c-arm', stroke([[986, 402], [1024, 330]], C.blue, 38),
    part('c-fore', stroke([[1024, 330], [1002, 244]], C.blue, 34), hand(996, 226, -100, C.peach, 18, -1)));

export default function heroScene(label) {
  return svg(
    1200,
    837,
    ladder() +
      playBlock() +
      textBlock() +
      codeCard() +
      personA() +
      part('c', layoutCard(), personC()) +
      personB(),
    label,
  );
}
