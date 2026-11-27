// name → scene drawn as code. A name listed here no longer uses its raster image.
import hero from './hero.mjs';
import homeLearn from './home-learn.mjs';
import homeBuild from './home-build.mjs';
import homeCommunity from './home-community.mjs';
import messageBoard from './message-board.mjs';
import capstone from './capstone.mjs';
import feeds from './feeds.mjs';
import notFound from './not-found.mjs';

export default {
  hero,
  'home-learn': homeLearn,
  'home-build': homeBuild,
  'home-community': homeCommunity,
  'message-board': messageBoard,
  capstone,
  feeds,
  'not-found': notFound,
};
