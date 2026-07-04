/* ============================================================
 * sprites.js — 全部像素美术（手工绘制，经典 8-bit 风格）
 * 字符画 -> 离屏 canvas，支持调色板换色（火力形态 / 1UP 等）
 * ============================================================ */
(function () {
  'use strict';

  // ---------- 经典调色板 ----------
  var C = {
    SKY:   '#5c94fc',
    WHITE: '#fcfcfc',
    BLACK: '#000000',
    RED:   '#d82800',   // 马里奥红
    SKIN:  '#fc9838',   // 皮肤 / 金币 / ?块
    BROWN: '#6b3304',   // 头发 / 鞋 / 衬衫
    CREAM: '#fcbcb0',   // 砖块高光 / 蘑菇茎
    TAN:   '#c84c0c',   // 砖块 / 地面 / 板栗仔
    DTAN:  '#7c2a00',   // 砖块深色
    GREEN: '#00a800',   // 水管深绿 / 乌龟壳
    LGREEN:'#80d010',   // 水管亮绿 / 灌木
    CLOUD: '#3cbcfc',   // 云朵描边
    GRAY:  '#bcbcbc'
  };

  // ---------- 工具：字符画 -> canvas ----------
  function make(rows, pal, w, h) {
    w = w || 16;
    h = h || rows.length;
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    for (var y = 0; y < h; y++) {
      var row = rows[y] || '';
      for (var x = 0; x < w; x++) {
        var ch = row.charAt(x);
        if (!ch || ch === '.') continue;
        var col = pal[ch];
        if (!col) continue;
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    }
    return c;
  }

  // 给位图加 1px 外描边 + 底部阴影（云朵 / 灌木用）
  function outlined(src, outline, bottomShade) {
    var w = src.width, h = src.height;
    var c = document.createElement('canvas');
    c.width = w + 2; c.height = h + 2;
    var g = c.getContext('2d');
    g.drawImage(src, 1, 1);
    var img = g.getImageData(0, 0, w + 2, h + 2);
    var d = img.data;
    function alpha(x, y) {
      if (x < 0 || y < 0 || x >= w + 2 || y >= h + 2) return 0;
      return d[(y * (w + 2) + x) * 4 + 3];
    }
    var oc = hex(outline), sc = hex(bottomShade || outline);
    var out = g.createImageData(w + 2, h + 2);
    var o = out.data;
    for (var y = 0; y < h + 2; y++) {
      for (var x = 0; x < w + 2; x++) {
        var i = (y * (w + 2) + x) * 4;
        if (alpha(x, y)) {
          // 底边像素染成阴影色
          if (!alpha(x, y + 1) && bottomShade) {
            o[i] = sc[0]; o[i + 1] = sc[1]; o[i + 2] = sc[2]; o[i + 3] = 255;
          } else {
            o[i] = d[i]; o[i + 1] = d[i + 1]; o[i + 2] = d[i + 2]; o[i + 3] = 255;
          }
        } else if (alpha(x - 1, y) || alpha(x + 1, y) || alpha(x, y - 1) || alpha(x, y + 1)) {
          o[i] = oc[0]; o[i + 1] = oc[1]; o[i + 2] = oc[2]; o[i + 3] = 255;
        }
      }
    }
    g.putImageData(out, 0, 0);
    return c;
  }
  function hex(s) {
    return [parseInt(s.substr(1, 2), 16), parseInt(s.substr(3, 2), 16), parseInt(s.substr(5, 2), 16)];
  }

  /* ============================================================
   * 小马里奥 16x16 — R红帽/背带裤  N棕发衫/鞋  S皮肤
   * ============================================================ */
  var SM_HEAD = [
    '....RRRRR.......',
    '...RRRRRRRRR....',
    '...NNNSSN.S.....',
    '..NSNSSSNSSS....',
    '..NSNNSSSNSSS...',
    '..NNSSSSNNNN....',
    '....SSSSSSS.....'
  ];
  function smBody(rows) { return SM_HEAD.concat(rows); }

  var SM = {
    idle: smBody([
      '...NNNRNNN......',
      '..NNNNRRNNNN....',
      '..NNNRRRRRRNNN..',
      '..SSNRRRRRRNSS..',
      '..SSRRRRRRRRSS..',
      '....RRRRRRRR....',
      '....RRR..RRR....',
      '...NNNN..NNNN...',
      '..NNNNN..NNNNN..'
    ]),
    run1: smBody([
      '...NNNRNN.......',
      '..NNNNRRNNSS....',
      '.SSNNRRRRRRNSS..',
      '.SSNRRRRRRRRS...',
      '....RRRRRRRR....',
      '...RRRR.RRRR....',
      '..RRR....RRRR...',
      '.NNNN......NNN..',
      'NNNNN......NNNN.'
    ]),
    run2: smBody([
      '...NNNRNNN......',
      '..NNNNRRNNNN....',
      '..NNNRRRRRRNN...',
      '..SSRRRRRRRRS...',
      '....RRRRRRRR....',
      '....RRRRRRR.....',
      '.....RRRRR......',
      '....NNNNNN......',
      '...NNNNNNN......'
    ]),
    run3: smBody([
      '...NNNRNNN......',
      '.SSNNNRRNNNN....',
      '.SSNRRRRRRNNN...',
      '....RRRRRRRR....',
      '....RRRRRRRR....',
      '...RRRRRR.......',
      '...RRR.RRR......',
      '..NNNN..NNNN....',
      '..NNNN..NNNNN...'
    ]),
    jump: smBody([
      '...NNNRNNN..SS..',
      '..NNNNRRNNN.SS..',
      '.SSNNRRRRRRNSS..',
      '.SSNRRRRRRRRN...',
      '.SS.RRRRRRRR....',
      '...RRRRRRRRR....',
      '..RRRR..RRRR....',
      '.NNNN....NNNN...',
      'NNNN......NNNN..'
    ]),
    skid: smBody([
      '...NNNRNN.SS....',
      '..NNNNRRNNSS....',
      '..NNRRRRRRRNN...',
      '..SSRRRRRRRR....',
      '....RRRRRRRR....',
      '...RRRRRRRR.....',
      '...RRR..RRR.....',
      '..NNNN..NNNN....',
      '..NNNNN.NNNNN...'
    ]),
    dead: [
      '....RRRRR.......',
      '...RRRRRRRRR....',
      '...NNSSSSNN.....',
      '..NSSNSSNSSN....',
      '..NSSSSSSSSN....',
      '...SSNSSNSS.....',
      '....SSSSSS......',
      '.SS.NNRRNN.SS...',
      '.SSNNNRRNNNSS...',
      '..NNNRRRRNNN....',
      '....RRRRRR......',
      '....RRRRRR......',
      '...RRRRRRRR.....',
      '...RRR..RRR.....',
      '..NNNN..NNNN....',
      '..NNNN..NNNN....'
    ]
  };

  /* ============================================================
   * 大马里奥 16x32
   * ============================================================ */
  var BM_HEAD = [
    '....RRRRRR......',
    '...RRRRRRRRRR...',
    '...RRRRRRRRRR...',
    '...NNNSSSN.SS...',
    '..NSNSSSSSNSSS..',
    '..NSNNSSSSSNSSS.',
    '..NSNNSSSSSNSSS.',
    '..NNSSSSSSNNNN..',
    '....SSSSSSSSS...',
    '...SSSSSSSS.....'
  ];
  function bmBody(rows) { return BM_HEAD.concat(rows); }

  var BM = {
    idle: bmBody([
      '...NNNNRRNNNN...',
      '..NNNNNRRNNNNN..',
      '.NNNNNRRRRNNNNN.',
      '.NNNNRRRRRRNNNN.',
      '.NNNRRRRRRRRNNN.',
      '.SSNNRRRRRRNNSS.',
      '.SSSNRRRRRRNSSS.',
      '.SSSRRRRRRRRSSS.',
      '.SS.RRRRRRRR.SS.',
      '....RRRRRRRR....',
      '....RRRRRRRR....',
      '...RRRRRRRRRR...',
      '...RRRR..RRRR...',
      '...RRRR..RRRR...',
      '...RRR....RRR...',
      '...RRR....RRR...',
      '...NNN....NNN...',
      '..NNNN....NNNN..',
      '..NNNN....NNNN..',
      '.NNNNN....NNNNN.',
      '.NNNNN....NNNNN.',
      '.NNNNN....NNNNN.'
    ]),
    run1: bmBody([
      '...NNNNRRNNN....',
      '..NNNNNRRNNNNSS.',
      '.NNNNNRRRRNNNSS.',
      '.NNNNRRRRRRNNSS.',
      'SSNNRRRRRRRRNN..',
      'SSNNRRRRRRRRN...',
      'SSNRRRRRRRRRR...',
      '...RRRRRRRRRR...',
      '...RRRRRRRRRR...',
      '...RRRRRRRRRR...',
      '..RRRRRRRRRRR...',
      '..RRRRR.RRRRR...',
      '..RRRR...RRRR...',
      '.RRRR.....RRRR..',
      '.RRR.......RRR..',
      '.NNN........NNN.',
      'NNNN........NNNN',
      'NNNN........NNNN',
      'NNNNN......NNNNN',
      'NNNNN......NNNNN',
      '................',
      '................'
    ]),
    run2: bmBody([
      '...NNNNRRNNNN...',
      '..NNNNNRRNNNNN..',
      '.NNNNNRRRRNNNNN.',
      '.NNNNRRRRRRNNNN.',
      '.SSNRRRRRRRRNSS.',
      '.SSSRRRRRRRRSSS.',
      '.SS.RRRRRRRR.SS.',
      '....RRRRRRRR....',
      '....RRRRRRRR....',
      '....RRRRRRRR....',
      '....RRRRRRR.....',
      '....RRRRRR......',
      '.....RRRRR......',
      '.....RRRR.......',
      '....NNNNN.......',
      '....NNNNNN......',
      '...NNNNNNN......',
      '...NNNNNN.......',
      '................',
      '................',
      '................',
      '................'
    ]),
    run3: bmBody([
      '...NNNNRRNNN....',
      '.SSNNNNRRNNNNN..',
      '.SSNNNRRRRNNNNN.',
      '.SSNNRRRRRRNNNN.',
      '..NNRRRRRRRRNNN.',
      '...RRRRRRRRRRNN.',
      '...RRRRRRRRRR...',
      '...RRRRRRRRRR...',
      '...RRRRRRRRRR...',
      '....RRRRRRRR....',
      '....RRRRRRRR....',
      '...RRRRRRRR.....',
      '...RRRR.RRRR....',
      '...RRR...RRR....',
      '..NNNN...NNNN...',
      '..NNNN...NNNN...',
      '..NNNN...NNNNN..',
      '.NNNNN...NNNNN..',
      '................',
      '................',
      '................',
      '................'
    ]),
    jump: bmBody([
      '...NNNNRRNNN.SS.',
      '..NNNNNRRNNN.SS.',
      '.NNNNNRRRRNNNSS.',
      '.NNNNRRRRRRNNSS.',
      'SSNNRRRRRRRRNS..',
      'SSNNRRRRRRRRN...',
      'SSNRRRRRRRRRR...',
      '...RRRRRRRRRR...',
      '...RRRRRRRRRR...',
      '...RRRRRRRRRRR..',
      '..RRRRRRRRRRRR..',
      '..RRRRR..RRRRR..',
      '..RRRR....RRRR..',
      '..RRRR....RRRR..',
      '..NNNN.....NNNN.',
      '.NNNN.......NNNN',
      '.NNNN.......NNNN',
      'NNNN........NNNN',
      '................',
      '................',
      '................',
      '................'
    ]),
    skid: bmBody([
      '...NNNNRRNN.SS..',
      '..NNNNNRRNN.SS..',
      '.NNNNNRRRRNNSS..',
      '.NNNNRRRRRRNSS..',
      '.NNNRRRRRRRRN...',
      '.SSRRRRRRRRRR...',
      '.SSRRRRRRRRR....',
      '....RRRRRRRR....',
      '....RRRRRRRR....',
      '....RRRRRRRR....',
      '...RRRRRRRRR....',
      '...RRRRRRRR.....',
      '...RRRR.RRRR....',
      '...RRR...RRR....',
      '..NNNN...NNNN...',
      '..NNNN...NNNN...',
      '.NNNNN...NNNNN..',
      '.NNNNN...NNNNN..',
      '................',
      '................',
      '................',
      '................'
    ]),
    crouch: [
      '................', '................', '................',
      '................', '................', '................',
      '................', '................', '................',
      '................',
      '....RRRRRR......',
      '...RRRRRRRRRR...',
      '...RRRRRRRRRR...',
      '...NNNSSSN.SS...',
      '..NSNSSSSSNSSS..',
      '..NSNNSSSSSNSSS.',
      '..NNSSSSSSNNNN..',
      '....SSSSSSSSS...',
      '..NNNNNRRNNNN...',
      '.NNNNNRRRRNNNNN.',
      '.SSNNRRRRRRNNSS.',
      '.SSNRRRRRRRRNSS.',
      '....RRRRRRRR....',
      '...RRRRRRRRRR...',
      '...RRRR..RRRR...',
      '...RRR....RRR...',
      '...NNN....NNN...',
      '..NNNN....NNNN..',
      '..NNNN....NNNN..',
      '.NNNNN....NNNNN.',
      '.NNNNN....NNNNN.',
      '.NNNNN....NNNNN.'
    ]
  };

  // 调色板：普通 / 火力（红->白，棕->红）
  var PAL_NORMAL = { R: C.RED, S: C.SKIN, N: C.BROWN };
  var PAL_FIRE   = { R: C.WHITE, S: C.SKIN, N: C.RED };

  function buildMario(frames, pal, h) {
    var o = {};
    for (var k in frames) o[k] = make(frames[k], pal, 16, h);
    return o;
  }

  /* ============================================================
   * 板栗仔 Goomba — D身体 K黑 W白
   * ============================================================ */
  var GOOMBA = [
    '.....DDDDDD.....',
    '....DDDDDDDD....',
    '...DDDDDDDDDD...',
    '..DDWWDDDDWWDD..',
    '.DDKWWDDDDWWKDD.',
    '.DKWWWDDDDWWWKD.',
    'DDKWWKDDDDKWWKDD',
    'DDDWWKDDDDKWWDDD',
    'DDDDDDDDDDDDDDDD',
    'DDDDDDDDDDDDDDDD',
    '.DDDDDDDDDDDDDD.',
    '.DDDDDDDDDDDDDD.',
    '..KKKKKDDKKKKK..',
    '.KKKKKK..KKKKKK.',
    'KKKKKKK..KKKKKKK',
    '................'
  ];
  var GOOMBA_FLAT = [
    '................', '................', '................', '................',
    '................', '................', '................', '................',
    '................', '................',
    '...DDDDDDDDDD...',
    '.DDDDDDDDDDDDDD.',
    '.DDWWDDDDDDWWDD.',
    'KKKKKKKKKKKKKKKK',
    'KKKKKK....KKKKKK',
    '................'
  ];
  var PAL_GOOMBA = { D: C.TAN, K: C.BLACK, W: C.CREAM };

  /* ============================================================
   * 乌龟 Koopa 16x24 — G壳绿 W壳边奶白 S四肢 E眼白 K黑
   * ============================================================ */
  var KOOPA1 = [
    '................', '................', '................', '................',
    '.........SSS....',
    '........SSSSS...',
    '........SEEKS...',
    '.......SSEEKS...',
    '.......SSSSSS...',
    '....GGG.SSSS....',
    '..GGGGGGGSSS....',
    '.GGGGGGGGGSS....',
    '.GWGGWGGWGGS....',
    'GGWGGWGGWGGG....',
    'GGWGGWGGWGGG....',
    'GGGGGGGGGGGG....',
    'GWWGGWWGGWWG....',
    'GGGGGGGGGGGG....',
    '.WWWWWWWWWW.....',
    '.WWWWWWWWWW.....',
    '..SSS...SSS.....',
    '..SSS...SSS.....',
    '.SSSS..SSSS.....',
    '................'
  ];
  var KOOPA2 = [
    '................', '................', '................', '................', '................',
    '.........SSS....',
    '........SSSSS...',
    '........SEEKS...',
    '.......SSEEKS...',
    '.......SSSSSS...',
    '....GGG.SSSS....',
    '..GGGGGGGSSS....',
    '.GGGGGGGGGSS....',
    '.GWGGWGGWGGS....',
    'GGWGGWGGWGGG....',
    'GGWGGWGGWGGG....',
    'GGGGGGGGGGGG....',
    'GWWGGWWGGWWG....',
    '.WWWWWWWWWW.....',
    '.WWWWWWWWWW.....',
    '...SSS..SSS.....',
    '...SSS..SSS.....',
    '...SSSS.SSSS....',
    '................'
  ];
  var SHELL = [
    '................', '................',
    '....GGGGGGGG....',
    '..GGGGGGGGGGGG..',
    '.GGWGGWGGWGGWG..',
    '.GGWGGWGGWGGWGG.',
    'GGWGGWGGWGGWGGGG',
    'GGGGGGGGGGGGGGGG',
    'GWWGGWWGGWWGGWWG',
    'GGGGGGGGGGGGGGGG',
    '.WWWWWWWWWWWWWW.',
    '.WWWWWWWWWWWWWW.',
    '................', '................', '................', '................'
  ];
  var PAL_KOOPA = { G: C.GREEN, W: C.WHITE, S: C.SKIN, E: C.WHITE, K: C.BLACK };

  /* ============================================================
   * 地形砖块 16x16
   * ============================================================ */
  var PAL_TILE = { P: C.TAN, H: C.CREAM, K: C.BLACK, D: C.DTAN, Q: C.SKIN, W: C.WHITE, M: C.DTAN };

  var GROUND = [
    'HHHHHHHHHHHHHHHK',
    'HPPPPPPPPPPPPPPK',
    'PPPPPPPPPPPPPPPK',
    'PPPPPPPPPPPPPPPK',
    'PPPPPPPPPPPPPPPK',
    'PPPPPPPPPPPPPPPK',
    'PPPPPPPPPPPPPPPK',
    'KKKKKKKKKKKKKKKK',
    'HHHHHHHKHHHHHHHK',
    'PPPPPPHKPPPPPPPK',
    'PPPPPPPKPPPPPPPK',
    'PPPPPPPKPPPPPPPK',
    'PPPPPPPKPPPPPPPK',
    'PPPPPPPKPPPPPPPK',
    'PPPPPPPKPPPPPPPK',
    'KKKKKKKKKKKKKKKK'
  ];

  var BRICK = [
    'HHHHHHHHHHHHHHHH',
    'PPPPPPPPPPPKPPPP',
    'PPPPPPPPPPPKPPPP',
    'KKKKKKKKKKKKKKKK',
    'PPPKPPPPPPPPPPPP',
    'PPPKPPPPPPPPPPPP',
    'PPPKPPPPPPPPPPPP',
    'KKKKKKKKKKKKKKKK',
    'PPPPPPPPPPPKPPPP',
    'PPPPPPPPPPPKPPPP',
    'PPPPPPPPPPPKPPPP',
    'KKKKKKKKKKKKKKKK',
    'PPPKPPPPPPPPPPPP',
    'PPPKPPPPPPPPPPPP',
    'PPPKPPPPPPPPPPPP',
    'KKKKKKKKKKKKKKKK'
  ];

  var QBLOCK = [
    'KKKKKKKKKKKKKKKK',
    'KQQQQQQQQQQQQQDK',
    'KQKQQQQQQQQQQKDK',
    'KQQQQQWWWWQQQQDK',
    'KQQQQWWQQWWQQQDK',
    'KQQQQQQQQWWQQQDK',
    'KQQQQQQQWWQQQQDK',
    'KQQQQQQWWQQQQQDK',
    'KQQQQQQWWQQQQQDK',
    'KQQQQQQQQQQQQQDK',
    'KQQQQQQWWQQQQQDK',
    'KQQQQQQWWQQQQQDK',
    'KQQQQQQQQQQQQQDK',
    'KQKQQQQQQQQQQKDK',
    'KDDDDDDDDDDDDDDK',
    'KKKKKKKKKKKKKKKK'
  ];

  var USED = [
    'KKKKKKKKKKKKKKKK',
    'KPPPPPPPPPPPPPDK',
    'KPKPPPPPPPPPPKDK',
    'KPPPPPPPPPPPPPDK',
    'KPPPPPPPPPPPPPDK',
    'KPPPPPPPPPPPPPDK',
    'KPPPPPPPPPPPPPDK',
    'KPPPPPPPPPPPPPDK',
    'KPPPPPPPPPPPPPDK',
    'KPPPPPPPPPPPPPDK',
    'KPPPPPPPPPPPPPDK',
    'KPPPPPPPPPPPPPDK',
    'KPPPPPPPPPPPPPDK',
    'KPKPPPPPPPPPPKDK',
    'KDDDDDDDDDDDDDDK',
    'KKKKKKKKKKKKKKKK'
  ];

  var HARD = [
    'HHHHHHHHHHHHHHHK',
    'HPPPPPPPPPPPPPKK',
    'HPPPPPPPPPPPPPKK',
    'HPPPPPPPPPPPPPKK',
    'HPPPPPPPPPPPPPKK',
    'HPPPPPPPPPPPPPKK',
    'HPPPPPPPPPPPPPKK',
    'HPPPPPPPPPPPPPKK',
    'HPPPPPPPPPPPPPKK',
    'HPPPPPPPPPPPPPKK',
    'HPPPPPPPPPPPPPKK',
    'HPPPPPPPPPPPPPKK',
    'HPPPPPPPPPPPPPKK',
    'HPPPPPPPPPPPPPKK',
    'HKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKK'
  ];

  // 水管：L亮绿 G深绿 K黑
  var PAL_PIPE = { L: C.LGREEN, G: C.GREEN, K: C.BLACK };
  var PIPE_TL = [
    '.KKKKKKKKKKKKKKK',
    'KLLLGLLGGGGGGGGG',
    'KLLLGLLGGGGGGGGG',
    'KLLLGLLGGGGGGGGG',
    'KLLLGLLGGGGGGGGG',
    'KLLLGLLGGGGGGGGG',
    'KLLLGLLGGGGGGGGG',
    'KLLLGLLGGGGGGGGG',
    'KLLLGLLGGGGGGGGG',
    'KLLLGLLGGGGGGGGG',
    'KLLLGLLGGGGGGGGG',
    'KLLLGLLGGGGGGGGG',
    'KLLLGLLGGGGGGGGG',
    'KLLLGLLGGGGGGGGG',
    'KLLLGLLGGGGGGGGG',
    '.KKKKKKKKKKKKKKK'
  ];
  var PIPE_TR = [
    'KKKKKKKKKKKKKKK.',
    'GGGGLGGGGGGGGGGK',
    'GGGGLGGGGGGGGGGK',
    'GGGGLGGGGGGGGGGK',
    'GGGGLGGGGGGGGGGK',
    'GGGGLGGGGGGGGGGK',
    'GGGGLGGGGGGGGGGK',
    'GGGGLGGGGGGGGGGK',
    'GGGGLGGGGGGGGGGK',
    'GGGGLGGGGGGGGGGK',
    'GGGGLGGGGGGGGGGK',
    'GGGGLGGGGGGGGGGK',
    'GGGGLGGGGGGGGGGK',
    'GGGGLGGGGGGGGGGK',
    'GGGGLGGGGGGGGGGK',
    'KKKKKKKKKKKKKKK.'
  ];
  var PIPE_BL = [
    '..KLLGLLGGGGGGGG',
    '..KLLGLLGGGGGGGG',
    '..KLLGLLGGGGGGGG',
    '..KLLGLLGGGGGGGG',
    '..KLLGLLGGGGGGGG',
    '..KLLGLLGGGGGGGG',
    '..KLLGLLGGGGGGGG',
    '..KLLGLLGGGGGGGG',
    '..KLLGLLGGGGGGGG',
    '..KLLGLLGGGGGGGG',
    '..KLLGLLGGGGGGGG',
    '..KLLGLLGGGGGGGG',
    '..KLLGLLGGGGGGGG',
    '..KLLGLLGGGGGGGG',
    '..KLLGLLGGGGGGGG',
    '..KLLGLLGGGGGGGG'
  ];
  var PIPE_BR = [
    'GGGLGGGGGGGGGK..',
    'GGGLGGGGGGGGGK..',
    'GGGLGGGGGGGGGK..',
    'GGGLGGGGGGGGGK..',
    'GGGLGGGGGGGGGK..',
    'GGGLGGGGGGGGGK..',
    'GGGLGGGGGGGGGK..',
    'GGGLGGGGGGGGGK..',
    'GGGLGGGGGGGGGK..',
    'GGGLGGGGGGGGGK..',
    'GGGLGGGGGGGGGK..',
    'GGGLGGGGGGGGGK..',
    'GGGLGGGGGGGGGK..',
    'GGGLGGGGGGGGGK..',
    'GGGLGGGGGGGGGK..',
    'GGGLGGGGGGGGGK..'
  ];

  /* ============================================================
   * 道具
   * ============================================================ */
  var MUSHROOM = [
    '.....RRWWRR.....',
    '...RRRWWWWRRR...',
    '..RRRRWWWWRRRR..',
    '.WWWRRRRRRRRWWW.',
    '.WWWRRRRRRRRWWW.',
    '.WWRRRRRRRRRRWW.',
    '.RRRRRRRRRRRRRR.',
    '.RRRRRRRRRRRRRR.',
    '..RRRRRRRRRRRR..',
    '...TTTTTTTTTT...',
    '..TTTTTTTTTTTT..',
    '..TTKTTTTTTKTT..',
    '..TTKTTTTTTKTT..',
    '..TTTTTTTTTTTT..',
    '...TTTTTTTTTT...',
    '....TTTTTTTT....'
  ];
  var PAL_MUSH  = { R: C.RED,   W: C.WHITE, T: C.CREAM, K: C.BLACK };
  var PAL_1UP   = { R: C.GREEN, W: C.WHITE, T: C.CREAM, K: C.BLACK };

  var FLOWER = [
    '....PPPPPPP.....',
    '...PPWWWWWPP....',
    '..PPWWWWWWWPP...',
    '..PPWWWWWWWPP...',
    '...PPWWWWWPP....',
    '....PPPPPPP.....',
    '.......GG.......',
    '.......GG.......',
    '..GG...GG...GG..',
    '..GGG..GG..GGG..',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '.......GG.......',
    '.......GG.......',
    '................',
    '................'
  ];

  var COIN1 = [
    '................',
    '.....QQQQQQ.....',
    '....QQQQQQQQ....',
    '...QQHHQQQDQQ...',
    '...QHHQQQQQDQ...',
    '...QHHQQQQQDQ...',
    '...QHQQDDQQDQ...',
    '...QHQQDDQQDQ...',
    '...QHQQDDQQDQ...',
    '...QHQQDDQQDQ...',
    '...QHHQQQQQDQ...',
    '...QHHQQQQQDQ...',
    '...QQHHQQQDQQ...',
    '....QQQQQQQQ....',
    '.....QQQQQQ.....',
    '................'
  ];
  var COIN2 = [
    '................',
    '......QQQQ......',
    '......QQQQ......',
    '.....QHQQDQ.....',
    '.....QHQQDQ.....',
    '.....QHQQDQ.....',
    '.....QHQQDQ.....',
    '.....QHQQDQ.....',
    '.....QHQQDQ.....',
    '.....QHQQDQ.....',
    '.....QHQQDQ.....',
    '.....QHQQDQ.....',
    '.....QHQQDQ.....',
    '......QQQQ......',
    '......QQQQ......',
    '................'
  ];
  var COIN3 = [
    '................',
    '.......QQ.......',
    '.......QQ.......',
    '.......HH.......',
    '.......HH.......',
    '.......HH.......',
    '.......HH.......',
    '.......HH.......',
    '.......HH.......',
    '.......HH.......',
    '.......HH.......',
    '.......HH.......',
    '.......HH.......',
    '.......QQ.......',
    '.......QQ.......',
    '................'
  ];
  var PAL_COIN = { Q: C.SKIN, H: C.CREAM, D: C.TAN };

  var FIREBALL = [
    '..RR....',
    '.RRRR.O.',
    'RROOORR.',
    '.ROWWOR.',
    '.ROWWOR.',
    '.RROOORR',
    '.O.RRRR.',
    '....RR..'
  ];
  var PAL_FIRE_BALL = { R: C.RED, O: C.SKIN, W: C.WHITE };

  var POOF = [
    'W..W..W.',
    '.W.W.W..',
    '..WWW...',
    'WW.O.WW.',
    '..WWW...',
    '.W.W.W..',
    'W..W..W.',
    '........'
  ];

  var DEBRIS = [
    'HHHH....',
    'HPPPP...',
    'PPPPP...',
    'PPPPK...',
    '.PPKK...',
    '..KK....',
    '........',
    '........'
  ];

  /* ============================================================
   * 云朵 / 灌木 位图（同形换色，原作同款技巧）
   * ============================================================ */
  var CLOUD_SHAPE = [
    '............WWWW............',
    '..........WWWWWWW...........',
    '.........WWWWWWWWW..........',
    '.........WWWWWWWWWW.........',
    '....WWW..WWWWWWWWWW.........',
    '...WWWWWWWWWWWWWWWWW...WW...',
    '..WWWWWWWWWWWWWWWWWWW.WWWW..',
    '.WWWWWWWWWWWWWWWWWWWWWWWWWW.',
    '.WWWWWWWWWWWWWWWWWWWWWWWWWW.',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    '.WWWWWWWWWWWWWWWWWWWWWWWWWW.',
    '..WWWWWWWWWWWWWWWWWWWWWWWW..'
  ];

  /* ============================================================
   * 导出
   * ============================================================ */
  var SPR = {
    C: C,

    marioS:  buildMario(SM, PAL_NORMAL, 16),
    marioB:  buildMario(BM, PAL_NORMAL, 32),
    marioF:  buildMario(BM, PAL_FIRE, 32),

    goomba:     make(GOOMBA, PAL_GOOMBA),
    goombaFlat: make(GOOMBA_FLAT, PAL_GOOMBA),
    koopa1:     make(KOOPA1, PAL_KOOPA, 16, 24),
    koopa2:     make(KOOPA2, PAL_KOOPA, 16, 24),
    shell:      make(SHELL, PAL_KOOPA),

    ground: make(GROUND, PAL_TILE),
    brick:  make(BRICK, PAL_TILE),
    used:   make(USED, PAL_TILE),
    hard:   make(HARD, PAL_TILE),
    qblock: [
      make(QBLOCK, { K: C.BLACK, Q: C.SKIN,  W: C.WHITE, D: C.TAN }),
      make(QBLOCK, { K: C.BLACK, Q: '#e07000', W: C.WHITE, D: C.TAN }),
      make(QBLOCK, { K: C.BLACK, Q: C.TAN,   W: C.CREAM, D: C.DTAN })
    ],
    pipeTL: make(PIPE_TL, PAL_PIPE),
    pipeTR: make(PIPE_TR, PAL_PIPE),
    pipeBL: make(PIPE_BL, PAL_PIPE),
    pipeBR: make(PIPE_BR, PAL_PIPE),

    mushroom: make(MUSHROOM, PAL_MUSH),
    oneup:    make(MUSHROOM, PAL_1UP),
    flower: [
      make(FLOWER, { P: C.RED,  W: C.WHITE, G: C.GREEN }),
      make(FLOWER, { P: C.SKIN, W: C.WHITE, G: C.GREEN })
    ],
    coin: [
      make(COIN1, PAL_COIN), make(COIN2, PAL_COIN),
      make(COIN3, PAL_COIN), make(COIN2, PAL_COIN)
    ],
    fireball: make(FIREBALL, PAL_FIRE_BALL, 8, 8),
    poof:     make(POOF, { W: C.WHITE, O: C.SKIN }, 8, 8),
    debris:   make(DEBRIS, PAL_TILE, 8, 8),

    cloud: null, bush: null,

    /* ---------- 程序绘制：山丘 ---------- */
    drawHill: function (g, x, baseY, big) {
      var h = big ? 35 : 19;
      var topW = 10;
      g.fillStyle = C.GREEN;
      // 阶梯式山体
      for (var r = 0; r < h; r++) {
        var half = Math.min(topW / 2 + r, topW / 2 + (h - 4)) ;
        half = topW / 2 + Math.max(0, r - 3);
        g.fillRect(Math.round(x - half), baseY - h + r, Math.round(half * 2), 1);
      }
      // 描边
      g.fillStyle = C.BLACK;
      for (r = 3; r < h; r++) {
        var hf = topW / 2 + (r - 3);
        g.fillRect(Math.round(x - hf), baseY - h + r, 1, 1);
        g.fillRect(Math.round(x + hf - 1), baseY - h + r, 1, 1);
      }
      // 圆顶描边
      g.fillRect(Math.round(x - topW / 2), baseY - h + 1, topW, 1);
      g.fillRect(Math.round(x - topW / 2) - 1, baseY - h + 2, 1, 1);
      g.fillRect(Math.round(x + topW / 2), baseY - h + 2, 1, 1);
      g.fillStyle = C.GREEN;
      g.fillRect(Math.round(x - topW / 2) + 1, baseY - h, topW - 2, 1);
      // 黑色斑点（山的眼睛纹理）
      g.fillStyle = C.BLACK;
      var spots = big ? [[-8, 14], [6, 10], [-2, 22]] : [[-4, 9], [4, 12]];
      for (var i = 0; i < spots.length; i++) {
        var sx = Math.round(x + spots[i][0]), sy = baseY - h + spots[i][1];
        g.fillRect(sx, sy, 1, 1); g.fillRect(sx + 1, sy + 1, 1, 1); g.fillRect(sx - 1, sy + 1, 1, 1);
      }
    },

    /* ---------- 程序绘制：城堡 80x80 ---------- */
    drawCastle: function (g, x, groundY) {
      var y0 = groundY - 80;
      function bricks(bx, by, bw, bh) {
        g.fillStyle = C.TAN; g.fillRect(bx, by, bw, bh);
        g.fillStyle = C.DTAN;
        for (var yy = by; yy < by + bh; yy += 8) g.fillRect(bx, yy + 7, bw, 1);
        for (var r2 = 0; r2 < bh / 8; r2++) {
          for (var xx = bx + ((r2 % 2) ? 8 : 0); xx < bx + bw; xx += 16) {
            g.fillRect(xx, by + r2 * 8, 1, 8);
          }
        }
        g.fillStyle = C.CREAM; g.fillRect(bx, by, bw, 1);
      }
      function merlons(bx, by, n) { // 城垛
        for (var i2 = 0; i2 < n; i2++) {
          g.fillStyle = C.TAN;  g.fillRect(bx + i2 * 16, by, 8, 8);
          g.fillStyle = C.CREAM; g.fillRect(bx + i2 * 16, by, 8, 1);
          g.fillStyle = C.BLACK; g.fillRect(bx + i2 * 16 + 8, by, 8, 8);
        }
      }
      // 下层主体 80 宽
      bricks(x, y0 + 40, 80, 40);
      merlons(x, y0 + 32, 5);
      // 上层塔楼 48 宽
      bricks(x + 16, y0 + 8, 48, 24);
      merlons(x + 16, y0, 3);
      // 大门
      g.fillStyle = C.BLACK;
      g.fillRect(x + 32, y0 + 56, 16, 24);
      g.fillRect(x + 34, y0 + 52, 12, 4);
      g.fillRect(x + 36, y0 + 50, 8, 2);
      // 窗户
      g.fillRect(x + 22, y0 + 14, 6, 10);
      g.fillRect(x + 52, y0 + 14, 6, 10);
      // 顶部小窗
      g.fillRect(x + 37, y0 + 42, 6, 8);
    }
  };

  // 云朵：白色 + 浅蓝描边；灌木：同形状换绿色
  SPR.cloud = outlined(make(CLOUD_SHAPE, { W: C.WHITE }, 28, 13), C.CLOUD, C.CLOUD);
  SPR.bush  = outlined(make(CLOUD_SHAPE, { W: C.LGREEN }, 28, 13), C.GREEN, C.GREEN);

  window.SPR = SPR;
})();
