// home-learn — a reader sitting with an open book, sparks rising out of it.
// 640 × 654, the artboard of the old home-learn.png.
import { blob, circle, hand, part, poly, profileHead, shoe, star4, stroke, svg } from './draw.mjs';

const C = {
  hair: '#4f9497', skin: '#d9955a', shirt: '#f07a4e', pants: '#56a560', shoe: '#9a7fb3',
  page: '#fddb9b', edge: '#fbb928', ink: '#37342f', dot: '#f28a5b', gem: '#5aa55f', gold: '#fbb928',
};

const sparks = () =>
  part('star-big', star4(398, 46, 46, C.gold)) +
  part('star-small', star4(520, 78, 34, C.gold, 8)) +
  part('dot-1', circle(481, 26, 10, C.dot)) +
  part('dot-2', circle(329, 99, 10, C.dot)) +
  part('dot-3', circle(410, 134, 8, C.dot)) +
  part('dot-4', circle(505, 201, 9, C.dot)) +
  part('gem', `<rect x="438" y="98" width="25" height="25" rx="3" fill="${C.gem}" transform="rotate(8 450 110)"/>`) +
  part('diamond', `<rect x="350" y="140" width="32" height="32" rx="3" fill="${C.shoe}" transform="rotate(40 366 156)"/>`) +
  part('tri', poly([[522, 160], [556, 134], [555, 180]], C.dot)) +
  part('ray-1', stroke([[409, 186], [420, 212]], C.ink, 7)) +
  part('ray-2', stroke([[443, 162], [439, 226]], C.gold, 7)) +
  part('ray-3', stroke([[488, 150], [472, 182]], C.ink, 7)) +
  part('ray-4', stroke([[476, 208], [460, 236]], C.gold, 7));

const book = () =>
  // the page block's gold edge, then the two pages, the spine and the outline
  blob([[178, 384], [380, 444], [552, 448], [646, 240], [626, 234], [544, 428], [380, 432], [190, 370]], C.edge, 0.3) +
  blob([[188, 378], [276, 178], [358, 200], [440, 272], [380, 432]], C.page, 0.35) +
  blob([[440, 272], [520, 226], [616, 218], [626, 232], [542, 428], [380, 432]], C.page, 0.35) +
  stroke([[188, 378], [276, 178], [358, 200], [440, 272], [520, 226], [616, 218], [626, 232], [542, 428], [380, 432], [188, 378]], C.ink, 6) +
  stroke([[440, 272], [380, 432]], C.ink, 5);

const reader = () =>
  // legs crossed on the floor
  blob([[-4, 494], [140, 486], [330, 520], [478, 556], [496, 600], [424, 622], [300, 606], [150, 620], [-4, 612]], C.pants) +
  stroke([[104, 610], [312, 520], [444, 612]], C.ink, 6) +
  shoe(254, 626, 8, C.shoe, 90, 48) +
  shoe(486, 610, -62, C.shoe, 100, 52) +
  // body
  stroke([[132, 196], [124, 246]], C.skin, 46) +
  blob([[24, 250], [130, 216], [196, 252], [238, 384], [252, 490], [130, 500], [-4, 500], [-4, 330]], C.shirt) +
  stroke([[58, 302], [110, 420], [216, 446]], C.ink, 5) +
  stroke([[108, 276], [150, 352]], C.ink, 5) +
  profileHead('r', 150, 130, 60, 66, C.skin, 1, C.ink, {
    back: part('r-hair', circle(104, 92, 44, C.hair), circle(152, 62, 42, C.hair), circle(82, 140, 36, C.hair), circle(64, 104, 30, C.hair), circle(96, 176, 22, C.hair)),
  });

// the arm holding the book, drawn over the page edge
const arm = () =>
  part('r-arm', stroke([[96, 300], [168, 420], [232, 456]], C.shirt, 54)) +
  stroke([[70, 318], [150, 440], [322, 452]], C.ink, 5) +
  stroke([[124, 282], [196, 404], [244, 430]], C.ink, 5);

export default function homeLearnScene(label) {
  return svg(640, 654,
    sparks() + reader() + part('book', book(), stroke([[232, 456], [326, 458]], C.shirt, 46), hand(370, 440, -20, C.skin, 26, -1)) + arm(),
    label);
}
