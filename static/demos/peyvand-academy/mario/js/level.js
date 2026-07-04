/* ============================================================
 * level.js — World 1-1 风格关卡（212 格宽，经典节奏编排）
 * 网格：15 行（0~14），地面占 13、14 两行；1 格 = 16px
 * ============================================================ */
(function () {
  'use strict';

  var W = 212, H = 15;
  var GROUND_ROW = 13;

  // 瓦片类型
  var T = {
    EMPTY: 0, GROUND: 1, BRICK: 2, QBLOCK: 3, USED: 4, HARD: 5,
    PIPE_TL: 6, PIPE_TR: 7, PIPE_BL: 8, PIPE_BR: 9,
    INVIS: 10,          // 隐形 1UP 块
    COINBRICK: 11,      // 多金币砖
    FLAG_BASE: 12
  };

  function build() {
    // tiles[col][row] = { t, item, hits... }
    var tiles = [];
    for (var x = 0; x < W; x++) {
      tiles[x] = [];
      for (var y = 0; y < H; y++) tiles[x][y] = null;
    }
    var enemies = [];
    var decor = [];

    function set(x, y, t, item) {
      if (x < 0 || x >= W || y < 0 || y >= H) return;
      tiles[x][y] = { t: t, item: item || null, bump: 0, coins: 0 };
    }
    function ground(x0, x1) {
      for (var x = x0; x <= x1; x++) { set(x, 13, T.GROUND); set(x, 14, T.GROUND); }
    }
    function pipe(x, h) {
      var top = GROUND_ROW - h;
      set(x, top, T.PIPE_TL); set(x + 1, top, T.PIPE_TR);
      for (var y = top + 1; y < GROUND_ROW; y++) { set(x, y, T.PIPE_BL); set(x + 1, y, T.PIPE_BR); }
    }
    function brick(x, y) { set(x, y, T.BRICK); }
    function q(x, y, item) { set(x, y, T.QBLOCK, item || 'coin'); }
    function stairUp(x0, hMax) { // 左低右高
      for (var i = 0; i < hMax; i++) {
        for (var h = 0; h <= i; h++) set(x0 + i, GROUND_ROW - 1 - h, T.HARD);
      }
    }
    function stairDown(x0, hMax) { // 左高右低
      for (var i = 0; i < hMax; i++) {
        for (var h = 0; h < hMax - i; h++) set(x0 + i, GROUND_ROW - 1 - h, T.HARD);
      }
    }
    function col(x, h) { // 实心方块柱
      for (var i = 1; i <= h; i++) set(x, GROUND_ROW - i, T.HARD);
    }
    function goomba(x) { enemies.push({ type: 'goomba', x: x * 16, y: (GROUND_ROW - 1) * 16 }); }
    function koopa(x)  { enemies.push({ type: 'koopa',  x: x * 16, y: (GROUND_ROW - 1) * 16 - 8 }); }

    /* ================= 地面与坑 ================= */
    ground(0, 68);
    ground(71, 85);
    ground(89, 152);
    ground(155, 211);

    /* ================= 第一幕：起步区 ================= */
    q(16, 9, 'coin');
    brick(20, 9); q(21, 9, 'power'); brick(22, 9); q(23, 9, 'coin'); brick(24, 9);
    q(22, 5, 'coin');
    pipe(28, 2);
    pipe(38, 3);
    pipe(46, 4);
    pipe(57, 4);
    set(64, 9, T.INVIS, '1up');   // 隐形 1UP

    goomba(22); goomba(40); goomba(51); goomba(53);

    /* ================= 第二幕：砖块长廊 ================= */
    brick(77, 9); q(78, 9, 'power'); brick(79, 9);
    for (var i = 80; i <= 87; i++) brick(i, 5);
    goomba(80); goomba(82);

    brick(91, 5); brick(92, 5); brick(93, 5);
    q(94, 5, 'coin');
    set(94, 9, T.COINBRICK, 'multicoin');  // 多金币砖

    goomba(97); goomba(99);

    /* ================= 第三幕：?块与乌龟 ================= */
    q(106, 9, 'coin'); q(109, 9, 'power'); q(112, 9, 'coin');
    q(109, 5, 'coin');
    koopa(107);
    brick(118, 9); brick(121, 9);
    goomba(114); goomba(116);

    brick(128, 5); brick(129, 5);
    q(129, 9, 'coin');
    goomba(124); goomba(126);

    /* ================= 第四幕：阶梯群 ================= */
    stairUp(134, 4);
    stairDown(140, 4);
    goomba(138.5);

    stairUp(148, 4);
    col(152, 4);                 // 坑前的悬崖柱
    // 坑 153~154
    col(155, 4); stairDown(156, 4);

    pipe(163, 2);
    goomba(168); goomba(170);

    brick(168, 9); q(170, 9, 'coin'); brick(172, 9);
    pipe(179, 2);

    /* ================= 终幕：大阶梯与旗杆 ================= */
    stairUp(181, 8);
    col(189, 8);
    set(198, GROUND_ROW - 1, T.FLAG_BASE);

    /* ================= 背景装饰（按原作 48 格周期）========= */
    for (var base = 0; base < W; base += 48) {
      decor.push({ type: 'hillBig',  x: base + 0 });
      decor.push({ type: 'hillSmall', x: base + 16 });
      decor.push({ type: 'bush', x: base + 11, w: 3 });
      decor.push({ type: 'bush', x: base + 23, w: 1 });
      decor.push({ type: 'bush', x: base + 41, w: 2 });
      decor.push({ type: 'cloud', x: base + 8,  row: 2, w: 1 });
      decor.push({ type: 'cloud', x: base + 19, row: 1, w: 1 });
      decor.push({ type: 'cloud', x: base + 27, row: 2, w: 3 });
      decor.push({ type: 'cloud', x: base + 36, row: 1, w: 2 });
    }

    return {
      W: W, H: H, T: T,
      tiles: tiles,
      enemies: enemies,
      decor: decor,
      groundRow: GROUND_ROW,
      flagX: 198,
      castleX: 202,
      checkpoint: 86,       // 中途重生点（过第一坑后）
      spawnX: 40,
      time: 400
    };
  }

  window.LEVEL = { build: build, T: T };
})();
