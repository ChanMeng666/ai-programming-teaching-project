// message-board — someone posting a big envelope into a mailbox.
// 560 × 511, the artboard of the old message-board.png.
import { blob, card, hand, part, profileHead, shoe, stroke, svg } from './draw.mjs';

const C = {
  skin: '#f37963', hair: '#1f3745', shirt: '#b199b9', pants: '#6aa84f', shoe: '#f4b740',
  front: '#3e94c8', side: '#235575', slot: '#1c2b3a', letter: '#f37963', ink: '#1f3745',
};

const mailbox = () =>
  part('mailbox',
    // the shaded side, the back legs, then the face with its rounded top and front legs
    `<path d="M380,4 L470,4 Q560,6 560,90 L556,346 L440,346 Z" fill="${C.side}"/>`,
    card(424, 414, 22, 140, 4, C.slot), card(548, 412, 16, 136, 4, C.side),
    `<path d="M306,92 Q306,4 384,4 Q462,4 462,92 L462,346 L306,346 Z" fill="${C.front}"/>`,
    card(320, 410, 24, 136, 5, C.front), card(446, 414, 24, 144, 5, C.front),
    part('slot', card(384, 92, 108, 18, 6, C.slot)),
  );

const sender = () =>
  part('s-leg1', stroke([[112, 292], [88, 380], [30, 440]], C.pants, 58), shoe(20, 456, 150, C.shoe, 64, 32)) +
  part('s-leg2', stroke([[164, 292], [232, 360], [266, 466]], C.pants, 58), shoe(270, 482, 10, C.shoe, 64, 32)) +
  // the back arm, behind the envelope
  stroke([[150, 196], [206, 248], [238, 204]], C.shirt, 36) +
  stroke([[142, 150], [140, 178]], C.skin, 30) +
  blob([[72, 180], [160, 168], [244, 214], [254, 270], [160, 286], [70, 282]], C.shirt) +
  stroke([[122, 222], [156, 244]], C.ink, 4) +
  profileHead('s', 140, 118, 38, 45, C.skin, 1, C.ink, {
    cap: C.hair,
    back: part('s-hair', blob([[96, 96], [118, 66], [150, 62], [140, 84], [112, 112], [104, 142], [92, 128]], C.hair)),
  });

// the envelope, with the front hand on it, slides toward the slot
const letter = () =>
  part('letter',
    `<g transform="rotate(-18 346 214)">`,
    card(346, 214, 230, 142, 6, C.letter),
    stroke([[236, 148], [346, 226], [456, 148]], C.ink, 5),
    stroke([[236, 282], [318, 206]], C.ink, 5),
    stroke([[456, 282], [374, 206]], C.ink, 5),
    `</g>`,
    part('s-fore', stroke([[196, 252], [262, 226]], C.shirt, 34), hand(278, 220, -28, C.skin, 21, -1)));

export default function messageBoardScene(label) {
  return svg(560, 511,
    mailbox() + sender() + letter() + stroke([[112, 198], [196, 252]], C.shirt, 36),
    label);
}
