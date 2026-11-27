// feeds — a woman calling out through a megaphone, paper planes flying off.
// 480 × 555, the artboard of the old feeds.png.
import { blob, ellipse, hand, part, plane, poly, profileHead, shoe, stroke, svg } from './draw.mjs';

const C = {
  skin: '#ef6343', hair: '#363a4a', top: '#f3e8c9', pants: '#5490c9', shoe: '#6aa53a',
  horn: '#ef6343', hornIn: '#c9452a', ink: '#363a4a', yellow: '#f6c039', yellowFold: '#d9a020',
  blue: '#4a8fce', blueFold: '#336fa8',
};

const caller = () =>
  part('leg1', stroke([[150, 284], [128, 376], [80, 476]], C.pants, 62), shoe(72, 498, 150, C.shoe, 62, 32)) +
  part('leg2', stroke([[222, 288], [300, 346], [252, 466]], C.pants, 62), shoe(258, 490, 20, C.shoe, 62, 32)) +
  // the free arm swinging back
  part('arm2', stroke([[120, 204], [70, 262]], C.top, 36), part('fore2', stroke([[70, 262], [42, 310]], C.skin, 28), hand(36, 326, 112, C.skin, 20, 1))) +
  stroke([[160, 168], [160, 192]], C.skin, 30) +
  blob([[106, 190], [206, 180], [266, 216], [252, 284], [150, 280], [98, 240]], C.top) +
  profileHead('c', 164, 132, 33, 40, C.skin, 1, C.ink, {
    cap: C.hair,
    back: part('c-hair', blob([[150, 96], [118, 104], [84, 146], [82, 178], [122, 176], [148, 150], [174, 108]], C.hair)),
  });

// megaphone and the arm that holds it: shoulder → elbow → horn
const horn = () =>
  part('arm', stroke([[232, 200], [258, 238]], C.top, 36),
    part('horn',
      stroke([[258, 238], [262, 176]], C.skin, 28),
      poly([[232, 126], [296, 64], [334, 132], [262, 156]], C.horn),
      ellipse(315, 98, 22, 40, C.hornIn, -44),
      `<rect x="248" y="140" width="26" height="22" rx="6" fill="${C.hornIn}" transform="rotate(-44 261 151)"/>`,
      hand(262, 166, -88, C.skin, 19, -1)));

const waves = () =>
  part('wave-1', `<path d="M314,62 Q342,86 330,120" fill="none" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>`) +
  part('wave-2', `<path d="M322,34 Q370,70 350,126" fill="none" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>`);

export default function feedsScene(label) {
  return svg(480, 555,
    part('plane-1', plane(410, 32, 96, C.yellow, C.yellowFold, -28)) +
    part('plane-2', plane(436, 108, 84, C.blue, C.blueFold, -26)) +
    caller() + horn() + waves(),
    label);
}
