/* ============================================================
 * game.js — 主引擎：物理 / 实体 / 状态机 / 渲染 / HUD
 * 帧率锁定 60fps 逻辑步进，物理参数贴近经典手感
 * ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  var VIEW_W = 256, VIEW_H = 240, TILE = 16;
  var DT = 1 / 60;
  var T = LEVEL.T;
  var C = SPR.C;

  /* ================= 物理常数（贴近经典） ================= */
  var PHYS = {
    MAX_WALK: 1.6,
    MAX_RUN: 2.6,
    ACC_WALK: 0.038,
    ACC_RUN: 0.057,
    FRICTION: 0.05,
    SKID: 0.11,
    JUMP_V: 4.05,
    JUMP_V_FAST: 4.7,
    G_HOLD: 0.125,     // 上升且按住跳跃
    G_FALL: 0.4375,
    MAX_FALL: 4.5,
    ENEMY_G: 0.38,
    ENEMY_VX: 0.46,
    SHELL_VX: 3.1,
    ITEM_VX: 0.95,
    FIREBALL_VX: 3.0
  };

  /* ================= 输入 ================= */
  var keys = {}, prevKeys = {};
  // Makey Makey layout is primary: the 6 front pads emit Arrow keys + Space + mouse
  // Click. A plain keyboard sends identical codes, so this one map serves both.
  var KEYMAP = {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowDown: 'down', KeyS: 'down',
    ArrowUp: 'jump', KeyW: 'jump', KeyZ: 'jump', KeyK: 'jump',          // Makey Makey UP pad
    Space: 'run', ShiftLeft: 'run', ShiftRight: 'run', KeyX: 'run', KeyJ: 'run', // Makey Makey SPACE pad
    Enter: 'start', KeyP: 'pause', KeyM: 'mute'
  };
  window.addEventListener('keydown', function (e) {
    var k = KEYMAP[e.code];
    if (k) {
      e.preventDefault();
      keys[k] = true;
      AUD.unlock();
    }
  });
  window.addEventListener('keyup', function (e) {
    var k = KEYMAP[e.code];
    if (k) { e.preventDefault(); keys[k] = false; }
  });
  // Makey Makey CLICK pad emits a left mouse click. Click on the screen = jump,
  // and starts the game from the title screen.
  (function () {
    var canvasEl = document.getElementById('game');
    if (!canvasEl) return;
    canvasEl.addEventListener('mousedown', function (e) {
      e.preventDefault();
      keys.jump = true;
      AUD.unlock();
      if (game.state === 'title') keys.start = true;
    });
    window.addEventListener('mouseup', function () { keys.jump = false; keys.start = false; });
  })();
  function pressed(k) { return !!keys[k]; }
  function justPressed(k) { return !!keys[k] && !prevKeys[k]; }

  // 触屏
  (function () {
    var touchEl = document.getElementById('touch');
    if (!('ontouchstart' in window)) return;
    touchEl.classList.remove('hidden');
    var map = { left: 'left', right: 'right', down: 'down', jump: 'jump', run: 'run' };
    touchEl.querySelectorAll('.tbtn').forEach(function (btn) {
      var k = map[btn.dataset.k];
      function on(e) { e.preventDefault(); keys[k] = true; AUD.unlock(); if (game.state === 'title') keys.start = true; }
      function off(e) { e.preventDefault(); keys[k] = false; keys.start = false; }
      btn.addEventListener('touchstart', on);
      btn.addEventListener('touchend', off);
      btn.addEventListener('touchcancel', off);
    });
  })();

  /* ================= 游戏全局状态 ================= */
  var game = {
    state: 'title',     // title / inter / playing / dying / flag / gameover
    score: 0, coins: 0, lives: 3, world: '1-1',
    time: 400, timeAcc: 0, warned: false,
    t: 0, frame: 0,
    camX: 0, reached: 0,
    freeze: 0,           // 变身动画期间冻结世界
    stateT: 0,
    level: null,
    player: null,
    entities: [],
    effects: [],
    flagY: 52, castleFlag: 0,
    clearPhase: 0, fireworks: 0,
    top: 0
  };

  /* ================= 瓦片工具 ================= */
  function tileAt(col, row) {
    if (col < 0 || col >= game.level.W || row < 0 || row >= game.level.H) return null;
    return game.level.tiles[col][row];
  }
  function isSolidTile(tile, forPlayer) {
    if (!tile) return false;
    var t = tile.t;
    if (t === T.INVIS) return false; // 仅顶头特判
    return t === T.GROUND || t === T.BRICK || t === T.QBLOCK || t === T.USED ||
           t === T.HARD || t === T.COINBRICK || t === T.FLAG_BASE ||
           t === T.PIPE_TL || t === T.PIPE_TR || t === T.PIPE_BL || t === T.PIPE_BR;
  }
  function solidAt(px, py) {
    return isSolidTile(tileAt(px >> 4, py >> 4));
  }

  /* ================= 实体基础 ================= */
  function moveEntity(e, opts) {
    opts = opts || {};
    var hitWall = false, onGround = false, headTile = null;

    // 水平
    e.x += e.vx;
    if (e.vx > 0) {
      var rx = e.x + e.w;
      if (solidAt(rx, e.y + 2) || solidAt(rx, e.y + e.h / 2) || solidAt(rx, e.y + e.h - 2)) {
        e.x = ((rx >> 4) << 4) - e.w - 0.01;
        hitWall = true;
      }
    } else if (e.vx < 0) {
      var lx = e.x;
      if (solidAt(lx, e.y + 2) || solidAt(lx, e.y + e.h / 2) || solidAt(lx, e.y + e.h - 2)) {
        e.x = ((lx >> 4) + 1) << 4;
        hitWall = true;
      }
    }

    // 垂直
    e.y += e.vy;
    if (e.vy > 0) {
      var by = e.y + e.h;
      if (solidAt(e.x + 1, by) || solidAt(e.x + e.w - 1, by)) {
        e.y = ((by >> 4) << 4) - e.h;
        e.vy = 0;
        onGround = true;
      }
    } else if (e.vy < 0) {
      var ty = e.y;
      var c1 = (e.x + 1) >> 4, c2 = (e.x + e.w - 1) >> 4, row = ty >> 4;
      var t1 = tileAt(c1, row), t2 = tileAt(c2, row);
      var s1 = isSolidTile(t1) || (opts.player && t1 && t1.t === T.INVIS);
      var s2 = isSolidTile(t2) || (opts.player && t2 && t2.t === T.INVIS);
      if (s1 || s2) {
        e.y = ((row + 1) << 4);
        e.vy = 0;
        // 头撞选取重叠更多的那块
        var col;
        if (s1 && s2) {
          var mid = (e.x + e.w / 2) / 16;
          col = (mid - c1 < c2 - mid + 1) && (mid % 1 < 0.5) ? c1 : c2;
          col = (e.x + e.w / 2) >> 4;
          if (!isSolidTile(tileAt(col, row)) && !(opts.player && tileAt(col, row) && tileAt(col, row).t === T.INVIS)) col = s1 ? c1 : c2;
        } else col = s1 ? c1 : c2;
        headTile = { col: col, row: row };
      }
    }
    return { hitWall: hitWall, onGround: onGround, headTile: headTile };
  }

  /* ================= 玩家 ================= */
  function makePlayer(x) {
    return {
      x: x, y: 13 * 16 - 14, w: 12, h: 14,
      vx: 0, vy: 0,
      power: 0,          // 0小 1大 2火
      facing: 1,
      onGround: true,
      jumping: false, jumpHeld: false,
      skidding: false, crouching: false,
      runTimer: 0,
      invuln: 0,
      growAnim: 0, growMode: 0,   // 1 变大 / -1 变小
      fireCool: 0,
      hidden: false
    };
  }

  function setPower(p, anim) {
    var pl = game.player;
    var old = pl.power;
    pl.power = p;
    var bottom = pl.y + pl.h;
    pl.h = (p > 0 && !pl.crouching) ? 26 : 14;
    pl.y = bottom - pl.h;
    if (anim) {
      game.freeze = 0.75;
      pl.growAnim = 0.75;
      pl.growMode = p > old ? 1 : -1;
    }
  }

  function hurtPlayer() {
    var pl = game.player;
    if (pl.invuln > 0 || game.state !== 'playing') return;
    if (pl.power > 0) {
      AUD.sfx.shrink();
      setPower(0, true);
      pl.invuln = 2.2;
    } else {
      killPlayer();
    }
  }

  function killPlayer() {
    if (game.state !== 'playing') return;
    var pl = game.player;
    game.state = 'dying';
    game.stateT = 0;
    pl.vy = 0;
    AUD.music.stop();
    AUD.sfx.die();
  }

  function updatePlayer() {
    var pl = game.player;
    if (pl.invuln > 0) pl.invuln -= DT;
    if (pl.fireCool > 0) pl.fireCool -= DT;

    var left = pressed('left'), right = pressed('right');
    var run = pressed('run'), jump = pressed('jump');

    // 蹲下（仅大马里奥）
    var wasCrouch = pl.crouching;
    pl.crouching = pl.power > 0 && pressed('down') && pl.onGround;
    if (pl.crouching !== wasCrouch) {
      var bottom = pl.y + pl.h;
      pl.h = pl.crouching ? 14 : (pl.power > 0 ? 26 : 14);
      pl.y = bottom - pl.h;
    }
    if (pl.crouching) { left = false; right = false; }

    // 水平加速度
    var max = run ? PHYS.MAX_RUN : PHYS.MAX_WALK;
    var acc = run ? PHYS.ACC_RUN : PHYS.ACC_WALK;
    pl.skidding = false;
    if (left && !right) {
      if (pl.vx > 0 && pl.onGround) { pl.vx -= PHYS.SKID; pl.skidding = true; }
      else if (pl.vx > -max) pl.vx = Math.max(-max, pl.vx - acc);
      pl.facing = -1;
    } else if (right && !left) {
      if (pl.vx < 0 && pl.onGround) { pl.vx += PHYS.SKID; pl.skidding = true; }
      else if (pl.vx < max) pl.vx = Math.min(max, pl.vx + acc);
      pl.facing = 1;
    } else if (pl.onGround) {
      if (pl.vx > 0) pl.vx = Math.max(0, pl.vx - PHYS.FRICTION);
      else if (pl.vx < 0) pl.vx = Math.min(0, pl.vx + PHYS.FRICTION);
    }
    // 空中超速衰减
    if (Math.abs(pl.vx) > max) pl.vx *= 0.98;

    // 跳跃
    if (justPressed('jump') && pl.onGround) {
      pl.vy = -(Math.abs(pl.vx) > 2.1 ? PHYS.JUMP_V_FAST : PHYS.JUMP_V);
      pl.jumping = true;
      pl.jumpHeld = true;
      pl.onGround = false;
      if (pl.power > 0) AUD.sfx.jumpBig(); else AUD.sfx.jumpSmall();
    }
    if (!jump) pl.jumpHeld = false;

    // 重力
    var g = (pl.vy < 0 && pl.jumpHeld) ? PHYS.G_HOLD : PHYS.G_FALL;
    pl.vy = Math.min(PHYS.MAX_FALL, pl.vy + g);

    // 发射火球
    if (pl.power === 2 && justPressed('run') && pl.fireCool <= 0 && !pl.crouching) {
      var count = 0;
      for (var i = 0; i < game.entities.length; i++) {
        if (game.entities[i].type === 'fireball') count++;
      }
      if (count < 2) {
        game.entities.push({
          type: 'fireball',
          x: pl.x + (pl.facing > 0 ? pl.w : -8), y: pl.y + 4,
          w: 8, h: 8, vx: PHYS.FIREBALL_VX * pl.facing, vy: 1.2, t: 0
        });
        pl.fireCool = 0.18;
        AUD.sfx.fireball();
      }
    }

    // 移动 & 碰撞
    var res = moveEntity(pl, { player: true });
    pl.onGround = res.onGround || (pl.vy === 0 && res.onGround);
    if (res.onGround) pl.jumping = false;
    else if (pl.vy > 1) pl.onGround = false;
    if (res.headTile) {
      hitBlock(res.headTile.col, res.headTile.row);
      AUD.unlock();
    }

    // 屏幕左缘限制（经典：不能回头）
    if (pl.x < game.camX) { pl.x = game.camX; pl.vx = Math.max(0, pl.vx); }

    // 跑动动画计时
    if (res.onGround) pl.runTimer += Math.abs(pl.vx) * 0.14 + (Math.abs(pl.vx) > 0.2 ? 0.06 : 0);

    // 掉坑
    if (pl.y > VIEW_H + 16) killPlayer();

    // 记录最远进度
    game.reached = Math.max(game.reached, pl.x);

    // 旗杆判定
    if (pl.x + pl.w >= game.level.flagX * 16 + 6) startFlag();
  }

  /* ================= 砖块交互 ================= */
  function bumpKillEnemies(col, row) {
    // 顶砖震死站在上面的敌人
    for (var i = 0; i < game.entities.length; i++) {
      var e = game.entities[i];
      if (e.type !== 'goomba' && e.type !== 'koopa' && e.type !== 'shell') continue;
      if (e.dead) continue;
      var feet = e.y + e.h;
      if (Math.abs(feet - row * 16) < 4 && e.x + e.w > col * 16 && e.x < col * 16 + 16) {
        flipKill(e, 100);
      }
    }
  }

  function hitBlock(col, row) {
    var tile = tileAt(col, row);
    if (!tile) return;
    var pl = game.player;
    var t = tile.t;

    if (t === T.QBLOCK || t === T.INVIS) {
      tile.bump = 0.25;
      bumpKillEnemies(col, row);
      var item = tile.item;
      tile.t = T.USED;
      tile.item = null;
      if (item === 'coin') {
        popCoin(col, row);
      } else if (item === 'power') {
        spawnItem(col, row, pl.power === 0 ? 'mushroom' : 'flower');
      } else if (item === '1up') {
        spawnItem(col, row, 'oneup');
      }
    } else if (t === T.COINBRICK) {
      tile.bump = 0.25;
      bumpKillEnemies(col, row);
      if (!tile.deadline) tile.deadline = game.t + 4.5;
      tile.coins++;
      popCoin(col, row);
      if (tile.coins >= 10 || game.t > tile.deadline) tile.t = T.USED;
    } else if (t === T.BRICK) {
      bumpKillEnemies(col, row);
      if (pl.power > 0) {
        // 顶碎
        game.level.tiles[col][row] = null;
        addScore(50, null);
        AUD.sfx.breakBrick();
        for (var i = 0; i < 4; i++) {
          game.effects.push({
            type: 'debris',
            x: col * 16 + (i % 2) * 8, y: row * 16 + (i > 1 ? 8 : 0),
            vx: (i % 2 ? 1 : -1) * (0.7 + Math.random() * 0.4),
            vy: i > 1 ? -2.2 : -3.6,
            t: 0, flip: i % 2
          });
        }
      } else {
        tile.bump = 0.25;
        AUD.sfx.bump();
      }
    } else {
      AUD.sfx.bump();
    }
  }

  function popCoin(col, row) {
    game.effects.push({ type: 'coinpop', x: col * 16, y: row * 16 - 16, vy: -3.4, t: 0, startY: row * 16 - 16 });
    game.coins++;
    addScore(200, null);
    AUD.sfx.coin();
    if (game.coins >= 100) { game.coins -= 100; addLife(col * 16, row * 16); }
  }

  function addLife(x, y) {
    game.lives++;
    AUD.sfx.oneup();
    game.effects.push({ type: 'popup', x: x, y: y, text: '1UP', color: '#80d010', t: 0 });
  }

  function spawnItem(col, row, kind) {
    AUD.sfx.sprout();
    game.entities.push({
      type: kind,
      x: col * 16 + 2, y: row * 16, w: 12, h: 14,
      vx: 0, vy: 0,
      emerging: 16,      // 还需上升的像素
      sprite: kind,
      active: true
    });
  }

  function addScore(v, popupAt) {
    game.score += v;
    if (popupAt) {
      game.effects.push({ type: 'popup', x: popupAt.x, y: popupAt.y, text: String(v), color: '#fcfcfc', t: 0 });
    }
  }

  /* ================= 敌人 / 道具 / 火球 ================= */
  function activateEnemies() {
    var specs = game.level.enemies;
    for (var i = 0; i < specs.length; i++) {
      var s = specs[i];
      if (s.spawned) continue;
      if (s.x < game.camX + VIEW_W + 16) {
        s.spawned = true;
        if (s.type === 'goomba') {
          game.entities.push({ type: 'goomba', x: s.x + 1, y: s.y + 1, w: 14, h: 14, vx: -PHYS.ENEMY_VX, vy: 0 });
        } else {
          game.entities.push({ type: 'koopa', x: s.x + 1, y: s.y, w: 14, h: 22, vx: -PHYS.ENEMY_VX, vy: 0 });
        }
      }
    }
  }

  function flipKill(e, score) {
    e.dead = true;
    e.flipping = true;
    e.vy = -3.2;
    e.vx = (e.vx >= 0 ? 0.8 : -0.8);
    addScore(score, { x: e.x, y: e.y - 8 });
    AUD.sfx.kick();
  }

  function updateEntity(e) {
    var pl = game.player;

    // 翻面坠落的尸体
    if (e.flipping) {
      e.vy += PHYS.ENEMY_G;
      e.x += e.vx; e.y += e.vy;
      if (e.y > VIEW_H + 32) e.remove = true;
      return;
    }

    switch (e.type) {
      case 'goomba':
      case 'koopa': {
        e.vy = Math.min(PHYS.MAX_FALL, e.vy + PHYS.ENEMY_G);
        var r = moveEntity(e);
        if (r.hitWall) e.vx = -e.vx;
        if (e.y > VIEW_H + 32) e.remove = true;
        if (e.squashT !== undefined) {
          e.squashT -= DT;
          if (e.squashT <= 0) e.remove = true;
        }
        break;
      }
      case 'shell': {
        e.vy = Math.min(PHYS.MAX_FALL, e.vy + PHYS.ENEMY_G);
        var r2 = moveEntity(e);
        if (r2.hitWall) { e.vx = -e.vx; if (Math.abs(e.vx) > 1) AUD.sfx.bump(); }
        if (e.grace > 0) e.grace -= DT;
        if (e.y > VIEW_H + 32) e.remove = true;
        // 静止壳过段时间苏醒
        if (Math.abs(e.vx) < 0.1) {
          e.wake = (e.wake || 0) + DT;
          if (e.wake > 6) {
            game.entities.push({ type: 'koopa', x: e.x, y: e.y - 8, w: 14, h: 22, vx: -PHYS.ENEMY_VX, vy: 0 });
            e.remove = true;
          }
        } else e.wake = 0;
        // 移动的壳杀死其他敌人
        if (Math.abs(e.vx) > 1) {
          for (var i = 0; i < game.entities.length; i++) {
            var o = game.entities[i];
            if (o === e || o.dead || o.flipping) continue;
            if (o.type !== 'goomba' && o.type !== 'koopa' && o.type !== 'shell') continue;
            if (aabb(e, o)) {
              e.combo = (e.combo || 1);
              flipKill(o, 100 * Math.pow(2, Math.min(e.combo - 1, 4)));
              e.combo++;
            }
          }
        }
        break;
      }
      case 'mushroom':
      case 'oneup': {
        if (e.emerging > 0) { e.y -= 0.33; e.emerging -= 0.33; if (e.emerging <= 0) e.vx = PHYS.ITEM_VX; break; }
        e.vy = Math.min(PHYS.MAX_FALL, e.vy + PHYS.ENEMY_G);
        var r3 = moveEntity(e);
        if (r3.hitWall) e.vx = -e.vx;
        if (e.y > VIEW_H + 32) e.remove = true;
        break;
      }
      case 'flower': {
        if (e.emerging > 0) { e.y -= 0.33; e.emerging -= 0.33; }
        break;
      }
      case 'fireball': {
        e.t += DT;
        e.vy = Math.min(4.2, e.vy + 0.32);
        var r4 = moveEntity(e);
        if (r4.onGround) e.vy = -2.6;
        if (r4.hitWall || e.t > 3 || e.x < game.camX - 16 || e.x > game.camX + VIEW_W + 16) {
          e.remove = true;
          game.effects.push({ type: 'poof', x: e.x, y: e.y, t: 0 });
        }
        if (e.y > VIEW_H + 16) e.remove = true;
        // 击中敌人
        for (var j = 0; j < game.entities.length; j++) {
          var o2 = game.entities[j];
          if (o2.dead || o2.flipping) continue;
          if (o2.type !== 'goomba' && o2.type !== 'koopa' && o2.type !== 'shell') continue;
          if (aabb(e, o2)) {
            flipKill(o2, o2.type === 'koopa' ? 200 : 100);
            e.remove = true;
            game.effects.push({ type: 'poof', x: e.x, y: e.y, t: 0 });
            break;
          }
        }
        break;
      }
    }
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // 敌人互相碰撞转向
  function enemyPairs() {
    var list = game.entities;
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if ((a.type !== 'goomba' && a.type !== 'koopa') || a.dead || a.flipping || a.squashT !== undefined) continue;
      for (var j = i + 1; j < list.length; j++) {
        var b = list[j];
        if ((b.type !== 'goomba' && b.type !== 'koopa') || b.dead || b.flipping || b.squashT !== undefined) continue;
        if (aabb(a, b)) {
          var tmp = a.vx; a.vx = b.vx; b.vx = tmp;
          if (a.x < b.x) { a.x -= 1; b.x += 1; } else { a.x += 1; b.x -= 1; }
        }
      }
    }
  }

  // 玩家与实体交互
  function playerCollisions() {
    var pl = game.player;
    if (game.state !== 'playing') return;
    for (var i = 0; i < game.entities.length; i++) {
      var e = game.entities[i];
      if (e.remove || e.flipping) continue;

      if (e.type === 'mushroom' || e.type === 'oneup' || e.type === 'flower') {
        if (e.emerging > 0) continue;
        if (aabb(pl, e)) {
          e.remove = true;
          if (e.type === 'oneup') { addLife(e.x, e.y); }
          else {
            addScore(1000, { x: e.x, y: e.y - 8 });
            AUD.sfx.powerup();
            if (e.type === 'mushroom') { if (pl.power === 0) setPower(1, true); }
            else { if (pl.power < 2) setPower(pl.power + 1, true); }
          }
        }
        continue;
      }

      if (e.type === 'goomba' || e.type === 'koopa' || e.type === 'shell') {
        if (e.dead || e.squashT !== undefined) continue;
        if (!aabb(pl, e)) continue;

        var stomp = pl.vy > 0.5 && (pl.y + pl.h - e.y) < 10;

        if (e.type === 'goomba') {
          if (stomp) {
            e.squashT = 0.4; e.vx = 0; e.dead = true;
            pl.vy = pressed('jump') ? -4.0 : -2.4;
            addScore(100, { x: e.x, y: e.y - 8 });
            AUD.sfx.stomp();
          } else hurtPlayer();
        } else if (e.type === 'koopa') {
          if (stomp) {
            // 变壳
            game.entities.push({ type: 'shell', x: e.x, y: e.y + e.h - 14, w: 14, h: 14, vx: 0, vy: 0, grace: 0 });
            e.remove = true;
            pl.vy = pressed('jump') ? -4.0 : -2.4;
            addScore(100, { x: e.x, y: e.y - 8 });
            AUD.sfx.stomp();
          } else hurtPlayer();
        } else { // shell
          if (Math.abs(e.vx) < 0.1) {
            // 静止壳：踢出去
            e.vx = (pl.x + pl.w / 2 < e.x + e.w / 2 ? 1 : -1) * PHYS.SHELL_VX;
            e.grace = 0.22;
            e.combo = 1;
            addScore(400, { x: e.x, y: e.y - 8 });
            AUD.sfx.kick();
          } else if (stomp) {
            e.vx = 0;
            pl.vy = pressed('jump') ? -4.0 : -2.4;
            AUD.sfx.stomp();
          } else if (e.grace <= 0) {
            hurtPlayer();
          }
        }
      }
    }
  }

  /* ================= 特效 ================= */
  function updateEffects() {
    for (var i = game.effects.length - 1; i >= 0; i--) {
      var f = game.effects[i];
      f.t += DT;
      switch (f.type) {
        case 'coinpop':
          f.vy += 0.21;
          f.y += f.vy;
          if (f.vy > 0 && f.y >= f.startY) {
            game.effects.splice(i, 1);
            game.effects.push({ type: 'popup', x: f.x + 2, y: f.startY, text: '200', color: '#fcfcfc', t: 0 });
          }
          break;
        case 'popup':
          f.y -= 0.7;
          if (f.t > 0.8) game.effects.splice(i, 1);
          break;
        case 'debris':
          f.vy += 0.3; f.x += f.vx; f.y += f.vy;
          if (f.y > VIEW_H + 16) game.effects.splice(i, 1);
          break;
        case 'poof':
          if (f.t > 0.18) game.effects.splice(i, 1);
          break;
        case 'firework':
          if (f.t > 0.7) game.effects.splice(i, 1);
          break;
      }
    }
  }

  /* ================= 旗杆 / 通关 ================= */
  function startFlag() {
    if (game.state !== 'playing') return;
    var pl = game.player;
    game.state = 'flag';
    game.stateT = 0;
    game.clearPhase = 0;
    AUD.music.stop();
    AUD.sfx.flag();
    // 按高度给分
    var y = pl.y;
    var pts = y < 64 ? 5000 : y < 96 ? 2000 : y < 128 ? 800 : y < 160 ? 400 : 100;
    addScore(pts, { x: game.level.flagX * 16 - 8, y: pl.y - 8 });
    pl.x = game.level.flagX * 16 - 6;
    pl.vx = 0; pl.vy = 0;
  }

  function updateFlag() {
    var pl = game.player;
    var baseY = 12 * 16 - pl.h;
    game.stateT += DT;

    if (game.clearPhase === 0) {           // 滑杆
      pl.y = Math.min(baseY, pl.y + 2.2);
      game.flagY = Math.min(11 * 16, game.flagY + 2.6);
      if (pl.y >= baseY && game.flagY >= 11 * 16) {
        game.clearPhase = 1; game.stateT = 0;
      }
    } else if (game.clearPhase === 1) {    // 跳下旗杆
      if (game.stateT > 0.35) {
        pl.x = game.level.flagX * 16 + 10;
        pl.facing = 1;
        pl.vy = -1.6;
        game.clearPhase = 2;
      }
    } else if (game.clearPhase === 2) {    // 走向城堡
      pl.vy = Math.min(PHYS.MAX_FALL, pl.vy + PHYS.G_FALL);
      pl.vx = 1.2;
      var r = moveEntity(pl, { player: true });
      pl.onGround = r.onGround;
      pl.runTimer += 0.18;
      if (pl.x + pl.w / 2 >= game.level.castleX * 16 + 40) {
        pl.hidden = true;
        game.clearPhase = 3;
        game.stateT = 0;
        AUD.sfx.clear();
      }
    } else if (game.clearPhase === 3) {    // 升城堡旗 + 时间结算
      game.castleFlag = Math.min(1, game.castleFlag + DT * 1.5);
      if (game.stateT > 1.2) {
        if (game.time > 0) {
          var step = Math.min(game.time, 4);
          game.time -= step;
          game.score += 50 * step;
          if ((game.frame % 4) === 0) AUD.sfx.tick();
        } else {
          game.clearPhase = 4;
          game.stateT = 0;
          // 尾数 1/3/6 放烟花（经典彩蛋）
          var d = game.score % 10;
          game.fireworks = (d === 1 || d === 3 || d === 6) ? d : 3;
        }
      }
    } else if (game.clearPhase === 4) {    // 烟花
      if (game.fireworks > 0 && game.stateT > 0.55) {
        game.stateT = 0;
        game.fireworks--;
        game.effects.push({
          type: 'firework',
          x: game.camX + 60 + Math.random() * 130,
          y: 48 + Math.random() * 56, t: 0
        });
        AUD.sfx.firework();
      }
      if (game.fireworks <= 0 && game.stateT > 2.4) {
        game.top = Math.max(game.top, game.score);
        game.state = 'title';
        resetAll();
      }
    }
  }

  /* ================= 重置 ================= */
  function resetLevel(spawnX) {
    game.level = LEVEL.build();
    game.entities = [];
    game.effects = [];
    game.time = 400;
    game.timeAcc = 0;
    game.warned = false;
    game.flagY = 52;
    game.castleFlag = 0;
    game.freeze = 0;
    var px = spawnX || game.level.spawnX;
    game.player = makePlayer(px);
    game.camX = Math.max(0, Math.min(px - 96, game.level.W * 16 - VIEW_W));
  }

  function resetAll() {
    game.score = 0; game.coins = 0; game.lives = 3;
    game.reached = 0;
    resetLevel();
  }

  /* ================= 主更新 ================= */
  function update() {
    game.frame++;
    game.t += DT;

    switch (game.state) {
      case 'title':
        if (justPressed('start') || justPressed('jump') || justPressed('run')) {
          game.state = 'inter';
          game.stateT = 0;
          AUD.unlock();
        }
        break;

      case 'inter':
        game.stateT += DT;
        if (game.stateT > 2.0) {
          game.state = 'playing';
          AUD.music.start();
        }
        break;

      case 'playing': {
        if (game.freeze > 0) {
          game.freeze -= DT;
          game.player.growAnim -= DT;
          break;
        }
        updatePlayer();
        activateEnemies();
        for (var i = 0; i < game.entities.length; i++) updateEntity(game.entities[i]);
        enemyPairs();
        playerCollisions();
        updateEffects();
        // 清理
        game.entities = game.entities.filter(function (e) { return !e.remove; });
        // 摄像机
        var target = game.player.x - 96;
        if (target > game.camX) game.camX = Math.min(target, game.level.W * 16 - VIEW_W);
        // 时间
        game.timeAcc += DT;
        if (game.timeAcc >= 0.4) {
          game.timeAcc -= 0.4;
          game.time--;
          if (game.time === 100 && !game.warned) { game.warned = true; AUD.sfx.warning(); }
          if (game.time <= 0) killPlayer();
        }
        break;
      }

      case 'dying': {
        game.stateT += DT;
        var pl = game.player;
        if (game.stateT > 0.5) {
          if (game.stateT < 0.52) pl.vy = -4.2;
          pl.vy = Math.min(PHYS.MAX_FALL, pl.vy + PHYS.G_FALL);
          pl.y += pl.vy;
        }
        updateEffects();
        if (game.stateT > 3) {
          game.lives--;
          if (game.lives > 0) {
            var sp = game.reached >= game.level.checkpoint * 16 ? game.level.checkpoint * 16 : game.level.spawnX;
            resetLevel(sp);
            game.state = 'inter';
            game.stateT = 0;
          } else {
            game.state = 'gameover';
            game.stateT = 0;
            AUD.sfx.gameover();
          }
        }
        break;
      }

      case 'flag':
        updateFlag();
        updateEffects();
        break;

      case 'gameover':
        game.stateT += DT;
        if (game.stateT > 4 || justPressed('start')) {
          game.top = Math.max(game.top, game.score);
          resetAll();
          game.state = 'title';
        }
        break;
    }

    // 暂停 / 静音
    if (justPressed('pause') && (game.state === 'playing' || game.state === 'paused')) {
      if (game.state === 'playing') { game.state = 'paused'; AUD.music.stop(); AUD.sfx.pause(); }
      else { game.state = 'playing'; AUD.music.start(); }
    } else if (game.state === 'paused' && justPressed('start')) {
      game.state = 'playing'; AUD.music.start();
    }
    if (justPressed('mute')) AUD.music.toggleMute();

    prevKeys = {};
    for (var k in keys) prevKeys[k] = keys[k];
  }

  /* ================= 渲染 ================= */
  function px(v) { return Math.round(v); }

  function drawSprite(img, x, y, flipX, flipY) {
    x = px(x - game.camX); y = px(y);
    if (x + img.width < 0 || x > VIEW_W) return;
    if (!flipX && !flipY) { ctx.drawImage(img, x, y); return; }
    ctx.save();
    ctx.translate(x + img.width / 2, y + img.height / 2);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  }

  function drawBackground() {
    ctx.fillStyle = C.SKY;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    var groundY = 13 * 16;
    var decor = game.level.decor;
    for (var i = 0; i < decor.length; i++) {
      var d = decor[i];
      var dx = d.x * 16 - game.camX;
      if (dx < -120 || dx > VIEW_W + 40) continue;
      if (d.type === 'hillBig') SPR.drawHill(ctx, dx + 24, groundY, true);
      else if (d.type === 'hillSmall') SPR.drawHill(ctx, dx + 16, groundY, false);
      else if (d.type === 'bush') {
        for (var j = 0; j < d.w; j++) ctx.drawImage(SPR.bush, px(dx + j * 21), groundY - 15);
      } else if (d.type === 'cloud') {
        for (var j2 = 0; j2 < d.w; j2++) ctx.drawImage(SPR.cloud, px(dx + j2 * 21), d.row * 16 + 8);
      }
    }
  }

  function drawFlagAndCastle() {
    var L = game.level;
    var poleX = L.flagX * 16 + 7 - game.camX;
    if (poleX > -20 && poleX < VIEW_W + 20) {
      // 杆
      ctx.fillStyle = SPR.C.LGREEN;
      ctx.fillRect(px(poleX), 48, 2, 144);
      ctx.fillStyle = SPR.C.GREEN;
      ctx.fillRect(px(poleX) + 1, 48, 1, 144);
      // 顶球
      ctx.fillStyle = '#000';
      ctx.fillRect(px(poleX) - 2, 43, 6, 6);
      ctx.fillStyle = SPR.C.WHITE;
      ctx.fillRect(px(poleX) - 1, 44, 4, 4);
      // 旗
      ctx.fillStyle = SPR.C.GREEN;
      for (var r = 0; r < 14; r++) {
        var w = Math.max(0, 12 - Math.abs(r - 7) * 1.4 - (r > 7 ? 0 : 0));
        w = r < 8 ? 12 : Math.max(0, 12 - (r - 7) * 2);
        ctx.fillRect(px(poleX) - w, px(game.flagY) + r, w, 1);
      }
    }
    // 城堡
    var cx = L.castleX * 16 - game.camX;
    if (cx > -100 && cx < VIEW_W + 20) {
      SPR.drawCastle(ctx, px(cx), 13 * 16);
      if (game.castleFlag > 0) {
        var fh = Math.round(game.castleFlag * 14);
        var fy = 13 * 16 - 80 - fh + 8;
        ctx.fillStyle = SPR.C.WHITE;
        ctx.fillRect(px(cx) + 38, fy, 1, fh);
        if (game.castleFlag >= 1) {
          ctx.fillRect(px(cx) + 39, fy, 6, 4);
          ctx.fillStyle = SPR.C.RED;
          ctx.fillRect(px(cx) + 40, fy + 1, 4, 2);
        }
      }
    }
  }

  function tileImage(tile) {
    switch (tile.t) {
      case T.GROUND: return SPR.ground;
      case T.BRICK: case T.COINBRICK: return SPR.brick;
      case T.USED: return SPR.used;
      case T.HARD: case T.FLAG_BASE: return SPR.hard;
      case T.QBLOCK: {
        var seq = [0, 0, 0, 0, 1, 2, 1, 0];
        return SPR.qblock[seq[Math.floor(game.t * 8) % 8]];
      }
      case T.PIPE_TL: return SPR.pipeTL;
      case T.PIPE_TR: return SPR.pipeTR;
      case T.PIPE_BL: return SPR.pipeBL;
      case T.PIPE_BR: return SPR.pipeBR;
      default: return null;
    }
  }

  function drawTiles() {
    var c0 = Math.max(0, (game.camX >> 4) - 1);
    var c1 = Math.min(game.level.W - 1, c0 + 18);
    for (var col = c0; col <= c1; col++) {
      for (var row = 0; row < game.level.H; row++) {
        var tile = game.level.tiles[col][row];
        if (!tile || tile.t === T.EMPTY || tile.t === T.INVIS) continue;
        var img = tileImage(tile);
        if (!img) continue;
        var yOff = 0;
        if (tile.bump > 0) {
          tile.bump -= DT;
          yOff = -Math.sin(Math.max(0, tile.bump) / 0.25 * Math.PI) * 6;
        }
        ctx.drawImage(img, col * 16 - game.camX, px(row * 16 + yOff));
      }
    }
  }

  function entitySprite(e) {
    switch (e.type) {
      case 'goomba':
        if (e.squashT !== undefined) return { img: SPR.goombaFlat };
        return { img: SPR.goomba, flipX: Math.floor(game.t * 6) % 2 === 0 };
      case 'koopa':
        return { img: Math.floor(game.t * 6) % 2 ? SPR.koopa1 : SPR.koopa2, flipX: e.vx > 0 };
      case 'shell': {
        var shake = e.wake > 5 ? Math.sin(game.t * 40) * 1.5 : 0;
        return { img: SPR.shell, xOff: shake };
      }
      case 'mushroom': return { img: SPR.mushroom };
      case 'oneup': return { img: SPR.oneup };
      case 'flower': return { img: SPR.flower[Math.floor(game.t * 8) % 2] };
      case 'fireball': return { img: SPR.fireball, rot: true };
    }
    return null;
  }

  function drawEntity(e) {
    var s = entitySprite(e);
    if (!s) return;
    var img = s.img;
    var dx = e.x + e.w / 2 - img.width / 2 + (s.xOff || 0);
    var dy = e.y + e.h - img.height;
    if (e.type === 'fireball') {
      var rx = px(e.x - game.camX), ry = px(e.y);
      ctx.save();
      ctx.translate(rx + 4, ry + 4);
      ctx.rotate(Math.floor(game.t * 12) % 4 * Math.PI / 2);
      ctx.drawImage(img, -4, -4);
      ctx.restore();
      return;
    }
    drawSprite(img, dx, dy, s.flipX, e.flipping);
  }

  function marioSprite() {
    var pl = game.player;
    var set = pl.power === 2 ? SPR.marioF : (pl.power === 1 ? SPR.marioB : SPR.marioS);

    // 变身动画：大小形态交替
    if (pl.growAnim > 0 && game.freeze > 0) {
      var phase = Math.floor(pl.growAnim * 12) % 2;
      if (pl.growMode > 0) set = phase ? SPR.marioS : SPR.marioB;
      else set = phase ? SPR.marioB : SPR.marioS;
      return { set: set, frame: 'idle' };
    }

    if (game.state === 'dying') return { set: SPR.marioS, frame: 'dead' };
    if (game.state === 'flag' && game.clearPhase <= 1) return { set: set, frame: 'jump' };
    if (pl.crouching && pl.power > 0) return { set: set, frame: 'crouch' };
    if (!pl.onGround) return { set: set, frame: 'jump' };
    if (pl.skidding) return { set: set, frame: 'skid' };
    if (Math.abs(pl.vx) > 0.12) {
      var f = ['run1', 'run2', 'run3'][Math.floor(pl.runTimer) % 3];
      return { set: set, frame: f };
    }
    return { set: set, frame: 'idle' };
  }

  function drawPlayer() {
    var pl = game.player;
    if (pl.hidden) return;
    if (pl.invuln > 0 && Math.floor(game.frame / 4) % 2 === 0 && game.state === 'playing') return;
    var ms = marioSprite();
    var img = ms.set[ms.frame];
    var dx = pl.x + pl.w / 2 - 8;
    var dy = pl.y + pl.h - img.height;
    var flip = pl.facing < 0;
    if (game.state === 'flag' && game.clearPhase <= 1) flip = game.clearPhase === 1;
    drawSprite(img, dx, dy, flip);
  }

  function drawEffects() {
    for (var i = 0; i < game.effects.length; i++) {
      var f = game.effects[i];
      switch (f.type) {
        case 'coinpop': {
          var img = SPR.coin[Math.floor(game.t * 20) % 4];
          ctx.drawImage(img, px(f.x - game.camX), px(f.y));
          break;
        }
        case 'popup':
          FONT.draw(ctx, f.text, px(f.x - game.camX), px(f.y - f.t * 25), f.color, 1, '#000');
          break;
        case 'debris':
          drawSprite(SPR.debris, f.x, f.y, f.flip, f.t % 0.3 > 0.15);
          break;
        case 'poof':
          drawSprite(SPR.poof, f.x, f.y);
          break;
        case 'firework': {
          var rr = f.t * 46;
          for (var k = 0; k < 12; k++) {
            var a = k * Math.PI / 6;
            ctx.fillStyle = k % 2 ? '#fcfcfc' : (k % 4 === 0 ? '#d82800' : '#fc9838');
            ctx.fillRect(px(f.x - game.camX + Math.cos(a) * rr), px(f.y + Math.sin(a) * rr), 2, 2);
          }
          break;
        }
      }
    }
  }

  /* ---------- HUD ---------- */
  var hudCoin = (function () {
    var c = document.createElement('canvas');
    c.width = 8; c.height = 8;
    var g = c.getContext('2d');
    var rows = ['..QQQ...', '.QHQDQ..', '.QHQDQ..', '.QHQDQ..', '.QHQDQ..', '.QHQDQ..', '..QQQ...'];
    var pal = { Q: C.SKIN, H: C.CREAM, D: C.TAN };
    for (var y = 0; y < rows.length; y++)
      for (var x = 0; x < 8; x++) {
        var ch = rows[y][x];
        if (ch !== '.') { g.fillStyle = pal[ch]; g.fillRect(x, y, 1, 1); }
      }
    return c;
  })();

  function zpad(n, len) {
    n = String(Math.max(0, n | 0));
    while (n.length < len) n = '0' + n;
    return n;
  }

  function drawHUD() {
    FONT.draw(ctx, 'MARIO', 16, 8, '#fcfcfc', 1, '#000');
    FONT.draw(ctx, zpad(game.score, 6), 16, 17, '#fcfcfc', 1, '#000');

    var blink = Math.floor(game.t * 3) % 3 !== 2;
    if (blink) ctx.drawImage(hudCoin, 87, 16);
    FONT.draw(ctx, 'x' + zpad(game.coins, 2), 96, 17, '#fcfcfc', 1, '#000');

    FONT.draw(ctx, 'WORLD', 144, 8, '#fcfcfc', 1, '#000');
    FONT.draw(ctx, ' 1-1', 144, 17, '#fcfcfc', 1, '#000');

    FONT.draw(ctx, 'TIME', 204, 8, '#fcfcfc', 1, '#000');
    if (game.state !== 'title') {
      var tcol = game.time <= 100 ? '#fc9838' : '#fcfcfc';
      FONT.draw(ctx, zpad(game.time, 3), 207, 17, tcol, 1, '#000');
    }
  }

  /* ---------- 大场景画面 ---------- */
  function drawWorld() {
    drawBackground();
    drawFlagAndCastle();
    // 正在钻出的道具画在砖后
    for (var i = 0; i < game.entities.length; i++) {
      if (game.entities[i].emerging > 0) drawEntity(game.entities[i]);
    }
    drawTiles();
    for (var j = 0; j < game.entities.length; j++) {
      if (!(game.entities[j].emerging > 0)) drawEntity(game.entities[j]);
    }
    drawPlayer();
    drawEffects();
  }

  function panel(x, y, w, h) {
    ctx.fillStyle = '#9c4a00';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#c84c0c';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    ctx.fillStyle = '#fcbcb0';
    ctx.fillRect(x + 2, y + 2, w - 4, 1);
    ctx.fillRect(x + 2, y + 2, 1, h - 4);
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 1, y - 1, w + 2, 1);
    ctx.fillRect(x - 1, y + h, w + 2, 1);
    ctx.fillRect(x - 1, y - 1, 1, h + 2);
    ctx.fillRect(x + w, y - 1, 1, h + 2);
  }

  function drawTitle() {
    drawWorld();
    panel(24, 36, 208, 92);
    FONT.draw(ctx, 'SUPER', 64, 48, '#fcfcfc', 2, '#7c2a00');
    FONT.draw(ctx, 'MARIO', 64, 66, '#fcfcfc', 2, '#7c2a00');
    FONT.draw(ctx, 'WORLD 1-1 TRIBUTE', 78, 92, '#fcbcb0', 1);
    FONT.draw(ctx, 'TOP- ' + zpad(game.top, 6), 88, 110, '#fcbcb0', 1);
    if (Math.floor(game.t * 2) % 2 === 0) {
      FONT.draw(ctx, 'PRESS UP OR SPACE', 64, 152, '#fcfcfc', 1, '#000');
    }
    FONT.draw(ctx, '(C)1985 TRIBUTE EDITION', 60, 222, '#fcfcfc', 1, '#000');
  }

  function drawInter() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    FONT.draw(ctx, 'WORLD  1-1', 98, 92, '#fcfcfc', 1);
    var img = SPR.marioS.idle;
    ctx.drawImage(img, 104, 112);
    FONT.draw(ctx, 'x  ' + game.lives, 126, 117, '#fcfcfc', 1);
  }

  function drawGameOver() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    FONT.draw(ctx, 'GAME  OVER', 98, 108, '#fcfcfc', 1);
  }

  function render() {
    switch (game.state) {
      case 'title': drawTitle(); break;
      case 'inter': drawInter(); break;
      case 'gameover': drawGameOver(); break;
      case 'paused':
        drawWorld();
        FONT.draw(ctx, 'PAUSE', 113, 112, '#fcfcfc', 1, '#000');
        break;
      default:
        drawWorld();
    }
    if (game.state !== 'inter' && game.state !== 'gameover') drawHUD();
  }

  /* ================= 自适应缩放 ================= */
  function resize() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var maxW = Math.min(vw - 48, 860);
    var maxH = vh - 210;
    var scale = Math.min(maxW / VIEW_W, maxH / VIEW_H);
    if (scale >= 2) scale = Math.floor(scale);
    scale = Math.max(1.2, scale);
    canvas.style.width = (VIEW_W * scale) + 'px';
    canvas.style.height = (VIEW_H * scale) + 'px';
  }
  window.addEventListener('resize', resize);
  resize();

  /* ================= 主循环 ================= */
  resetAll();

  var last = performance.now(), acc = 0;
  function frame(now) {
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    while (acc >= DT) { update(); acc -= DT; }
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // 调试钩子
  window.__mario = game;
})();
