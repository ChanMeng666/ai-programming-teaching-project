/* ============================================================
 * audio.js — Web Audio 合成音效 + 自创 8-bit 背景音乐循环
 * 不加载任何外部音频资源
 * ============================================================ */
(function () {
  'use strict';

  var ctx = null;
  var masterGain = null;
  var musicGain = null;
  var musicOn = true;
  var noiseBuf = null;

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = musicOn ? 0.42 : 0;
    musicGain.connect(masterGain);
    // 噪声缓冲
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  // ---------- 基础合成 ----------
  function tone(opt) {
    if (!ensure()) return;
    var t0 = ctx.currentTime + (opt.delay || 0);
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = opt.type || 'square';
    osc.frequency.setValueAtTime(opt.f0, t0);
    if (opt.f1) {
      if (opt.step) osc.frequency.linearRampToValueAtTime(opt.f1, t0 + opt.dur);
      else osc.frequency.exponentialRampToValueAtTime(Math.max(1, opt.f1), t0 + opt.dur);
    }
    var v = opt.vol || 0.2;
    g.gain.setValueAtTime(v, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + opt.dur);
    osc.connect(g); g.connect(masterGain);
    osc.start(t0); osc.stop(t0 + opt.dur + 0.02);
  }

  function noise(opt) {
    if (!ensure()) return;
    var t0 = ctx.currentTime + (opt.delay || 0);
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    var f = ctx.createBiquadFilter();
    f.type = opt.filter || 'lowpass';
    f.frequency.setValueAtTime(opt.f0 || 800, t0);
    if (opt.f1) f.frequency.exponentialRampToValueAtTime(opt.f1, t0 + opt.dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(opt.vol || 0.25, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + opt.dur);
    src.connect(f); f.connect(g); g.connect(masterGain);
    src.start(t0); src.stop(t0 + opt.dur + 0.02);
  }

  function blipSeq(notes, step, type, vol) {
    for (var i = 0; i < notes.length; i++) {
      if (notes[i] > 0) {
        tone({ type: type || 'square', f0: notes[i], dur: step * 1.6, vol: vol || 0.16, delay: i * step });
      }
    }
  }

  var N = { // 音名 -> 频率
    C3:130.8,D3:146.8,E3:164.8,F3:174.6,G3:196,A3:220,B3:246.9,
    C4:261.6,D4:293.7,E4:329.6,F4:349.2,G4:392,A4:440,B4:493.9,
    C5:523.3,D5:587.3,E5:659.3,F5:698.5,G5:784,A5:880,B5:987.8,
    C6:1046.5,D6:1174.7,E6:1318.5,G6:1568,A6:1760
  };

  // ---------- 游戏音效 ----------
  var SFX = {
    jumpSmall: function () { tone({ f0: 240, f1: 750, dur: 0.16, vol: 0.18 }); },
    jumpBig:   function () { tone({ f0: 160, f1: 560, dur: 0.2,  vol: 0.2 }); },
    coin: function () {
      tone({ f0: N.B5, dur: 0.08, vol: 0.18 });
      tone({ f0: N.E6, dur: 0.45, vol: 0.18, delay: 0.08 });
    },
    stomp: function () {
      noise({ f0: 900, f1: 150, dur: 0.14, vol: 0.3 });
      tone({ f0: 340, f1: 90, dur: 0.14, vol: 0.14 });
    },
    bump: function () {
      tone({ f0: 110, f1: 70, dur: 0.09, vol: 0.25 });
    },
    breakBrick: function () {
      noise({ f0: 1400, f1: 200, dur: 0.3, vol: 0.35 });
      tone({ f0: 320, f1: 90, dur: 0.18, vol: 0.12 });
    },
    sprout: function () { // 道具钻出
      tone({ f0: 180, f1: 760, dur: 0.45, vol: 0.14, step: true, type: 'square' });
    },
    powerup: function () { // 吃到道具
      blipSeq([N.C5, N.E5, N.G5, N.C6, N.E5, N.G5, N.C6, N.E6, N.G5, N.C6, N.E6, N.G6], 0.045, 'square', 0.15);
    },
    oneup: function () {
      blipSeq([N.C5, N.D5, N.G5, N.C6, N.G6], 0.09, 'square', 0.16);
    },
    fireball: function () { tone({ f0: 880, f1: 240, dur: 0.09, vol: 0.14, type: 'square' }); },
    kick: function () {
      noise({ f0: 1200, f1: 300, dur: 0.09, vol: 0.25 });
      tone({ f0: 620, f1: 150, dur: 0.08, vol: 0.12 });
    },
    shrink: function () { // 受伤变小
      blipSeq([N.G4, 0, N.E4, 0, N.C4], 0.07, 'square', 0.16);
    },
    die: function () {
      blipSeq([N.C5, N.B4, N.G4, 0, N.E4, 0, N.C4, 0, N.G3], 0.12, 'square', 0.18);
    },
    flag: function () { // 滑旗：下行琶音
      var seq = [N.G6, N.E6, N.C6, N.A5, N.G5, N.E5, N.C5, N.A4, N.G4, N.E4, N.C4];
      blipSeq(seq, 0.07, 'square', 0.13);
    },
    clear: function () { // 通关号角（自创）
      blipSeq([N.C4, N.E4, N.G4, N.C5, N.E5, N.G5, N.C6, 0, N.E6, 0, N.G6], 0.085, 'square', 0.17);
      blipSeq([N.C3, N.G3, N.C4, N.G4, N.C5], 0.187, 'triangle', 0.2);
    },
    pause: function () { blipSeq([N.E6, N.C6, N.E6, N.C6], 0.06, 'square', 0.12); },
    tick: function () { tone({ f0: N.A5, dur: 0.04, vol: 0.08 }); },
    firework: function () { noise({ f0: 600, f1: 60, dur: 0.6, vol: 0.35 }); },
    gameover: function () {
      blipSeq([N.C5, 0, N.G4, 0, N.E4, N.D4, N.C4, 0, 0, N.G3, 0, N.C3], 0.13, 'square', 0.17);
    },
    warning: function () { blipSeq([N.A5, N.A5, N.A5], 0.12, 'square', 0.12); }
  };

  /* ============================================================
   * 背景音乐 — 自创轻快芯片循环（双声部 + 鼓点）
   * ============================================================ */
  var BPM = 152;
  var STEP = 60 / BPM / 4; // 16分音符
  // 主旋律（每项 [音名, 持续步数]，0 为休止）— 自创旋律
  var LEAD = [
    // A 段
    ['E5',1],[0,1],['E5',1],[0,1],['G5',2],['E5',2],['C5',2],['D5',2],['E5',2],[0,2],
    ['D5',1],[0,1],['D5',1],[0,1],['F5',2],['D5',2],['B4',2],['C5',2],['D5',2],[0,2],
    ['C5',1],[0,1],['C5',1],[0,1],['E5',2],['G5',2],['A5',2],['G5',2],['E5',2],[0,2],
    ['D5',2],['E5',2],['F5',2],['D5',2],['B4',2],['D5',2],['C5',4],
    // B 段
    ['G5',2],[0,2],['E5',2],['C5',2],['A5',2],['G5',2],['E5',2],['C5',2],
    ['F5',2],[0,2],['D5',2],['B4',2],['G5',2],['F5',2],['D5',2],['B4',2],
    ['E5',2],['G5',2],['C6',2],['G5',2],['A5',2],['C6',2],['E6',2],['C6',2],
    ['D6',2],['C6',2],['A5',2],['G5',2],['E5',2],['D5',2],['C5',4]
  ];
  // 低音（每拍两个八分音符根音）
  var BASSLINE = [
    'C3','G3','C3','G3','G3','D3','G3','D3','A3','E3','A3','E3','F3','C3','G3','G3',
    'C3','G3','C3','G3','G3','D3','G3','D3','F3','C3','F3','C3','G3','G3','C3','C3'
  ];

  var seq = { running: false, timer: null, nextT: 0, leadIdx: 0, leadStep: 0, bassIdx: 0, hatStep: 0 };

  function schedNote(freq, t, dur, type, vol) {
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.setValueAtTime(vol, t + dur * 0.7);
    g.gain.linearRampToValueAtTime(0.001, t + dur);
    osc.connect(g); g.connect(musicGain);
    osc.start(t); osc.stop(t + dur + 0.01);
  }
  function schedHat(t) {
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    var f = ctx.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 6000;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    src.connect(f); f.connect(g); g.connect(musicGain);
    src.start(t); src.stop(t + 0.05);
  }

  function pump() {
    if (!seq.running) return;
    var ahead = ctx.currentTime + 0.15;
    while (seq.nextT < ahead) {
      var t = seq.nextT;
      // 主旋律推进
      if (seq.leadStep <= 0) {
        var item = LEAD[seq.leadIdx];
        seq.leadIdx = (seq.leadIdx + 1) % LEAD.length;
        seq.leadStep = item[1];
        if (item[0]) schedNote(N[item[0]], t, STEP * item[1] * 0.9, 'square', 0.085);
      }
      seq.leadStep--;
      // 低音：每 2 步一个八分音符
      if (seq.hatStep % 2 === 0) {
        var b = BASSLINE[seq.bassIdx % BASSLINE.length];
        if (seq.hatStep % 4 === 0) seq.bassIdx = (seq.hatStep / 4) % BASSLINE.length | 0;
        schedNote(N[BASSLINE[(Math.floor(seq.hatStep / 4)) % BASSLINE.length]], t, STEP * 1.7, 'triangle', 0.22);
        schedHat(t);
      }
      seq.hatStep = (seq.hatStep + 1) % (BASSLINE.length * 4);
      seq.nextT += STEP;
    }
  }

  var MUSIC = {
    start: function () {
      if (!ensure()) return;
      if (seq.running) return;
      seq.running = true;
      seq.nextT = ctx.currentTime + 0.05;
      seq.leadIdx = 0; seq.leadStep = 0; seq.hatStep = 0;
      seq.timer = setInterval(pump, 40);
    },
    stop: function () {
      seq.running = false;
      if (seq.timer) { clearInterval(seq.timer); seq.timer = null; }
    },
    toggleMute: function () {
      musicOn = !musicOn;
      if (musicGain) musicGain.gain.value = musicOn ? 0.42 : 0;
      return musicOn;
    },
    isOn: function () { return musicOn; }
  };

  window.AUD = { sfx: SFX, music: MUSIC, unlock: ensure };
})();
