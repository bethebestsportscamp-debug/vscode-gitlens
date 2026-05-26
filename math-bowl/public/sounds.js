// sounds.js — Funny synthesized sound effects (Web Audio API, no audio files needed)
// Each sound is pure synthesis — no downloads, works offline.

let _ctx = null;

function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

// Play a single oscillator that sweeps from freq1 to freq2 over dur seconds.
// start is seconds from now. All params optional with sensible defaults.
function sweep(c, { type = 'sawtooth', freq1, freq2, start = 0, dur = 0.2, vol = 0.25 } = {}) {
  const t   = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq1, t);
  if (freq2) osc.frequency.exponentialRampToValueAtTime(freq2, t + dur * 0.8);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

// ── Sound Library ─────────────────────────────────────────────────────────────
const Sounds = {

  // 🦆 Duck quack × 2  ——  plays when any team buzzes in
  quack() {
    const c = getCtx();
    sweep(c, { type: 'sawtooth', freq1: 520, freq2: 210, start: 0.00, dur: 0.17, vol: 0.38 });
    sweep(c, { type: 'sawtooth', freq1: 490, freq2: 195, start: 0.24, dur: 0.17, vol: 0.33 });
  },

  // 😢 Sad trombone  ——  plays on wrong answer  ("wah  wah  wah  waaaaaah")
  sadTrombone() {
    const c = getCtx();
    const notes = [
      { freq1: 466, freq2: 440, start: 0.00, dur: 0.28 },
      { freq1: 440, freq2: 392, start: 0.28, dur: 0.28 },
      { freq1: 392, freq2: 349, start: 0.56, dur: 0.28 },
      { freq1: 349, freq2: 220, start: 0.84, dur: 0.75 }, // long final note
    ];
    notes.forEach(n => sweep(c, { type: 'sawtooth', vol: 0.22, ...n }));
  },

  // 🎺 Fanfare + 🐱 cat meow  ——  plays on correct answer
  fanfare() {
    const c = getCtx();
    // Ascending trumpet arpeggio: C5 → E5 → G5 → C6
    [523, 659, 784, 1047].forEach((f, i) =>
      sweep(c, { type: 'square', freq1: f, start: i * 0.10, dur: 0.22, vol: 0.10 })
    );
    // Cat meow: glide up then settle back down
    sweep(c, { type: 'sine', freq1: 650,  freq2: 1350, start: 0.58, dur: 0.16, vol: 0.22 });
    sweep(c, { type: 'sine', freq1: 1350, freq2: 820,  start: 0.74, dur: 0.32, vol: 0.19 });
  },

  // 🪿 Goose honk × 2  ——  steal opportunity starts
  gooseHonk() {
    const c = getCtx();
    sweep(c, { type: 'sawtooth', freq1: 360, freq2: 275, start: 0.00, dur: 0.22, vol: 0.38 });
    sweep(c, { type: 'sawtooth', freq1: 345, freq2: 262, start: 0.30, dur: 0.22, vol: 0.34 });
  },

  // 💨 Deflating fart  ——  nobody stole the question
  deflate() {
    const c = getCtx();
    sweep(c, { type: 'sawtooth', freq1: 480, freq2: 55, start: 0, dur: 1.0, vol: 0.28 });
  },

  // 🐘 Elephant trumpet × 2  ——  game over / final winner reveal
  elephant() {
    const c = getCtx();
    // First blast: rise then fall
    sweep(c, { type: 'sawtooth', freq1: 280,  freq2: 850,  start: 0.00, dur: 0.28, vol: 0.30 });
    sweep(c, { type: 'sawtooth', freq1: 850,  freq2: 480,  start: 0.28, dur: 0.42, vol: 0.25 });
    sweep(c, { type: 'sawtooth', freq1: 480,  freq2: 320,  start: 0.70, dur: 0.40, vol: 0.20 });
    // Second blast after a pause
    setTimeout(() => {
      const c2 = getCtx();
      sweep(c2, { type: 'sawtooth', freq1: 350,  freq2: 1100, start: 0.00, dur: 0.22, vol: 0.28 });
      sweep(c2, { type: 'sawtooth', freq1: 1100, freq2: 620,  start: 0.22, dur: 0.55, vol: 0.22 });
    }, 1300);
  },

  // 🔔 Single tick beep  ——  last 5 seconds of timer
  timerBeep(urgent = false) {
    const c = getCtx();
    sweep(c, { type: 'square', freq1: urgent ? 1100 : 880, start: 0, dur: 0.07, vol: urgent ? 0.14 : 0.09 });
  },

  // 🎉 Short crowd cheer stinger  ——  plays alongside confetti on correct
  cheer() {
    const c = getCtx();
    // Rising noise-like burst using detuned oscillators
    [330, 420, 528, 660].forEach((f, i) =>
      sweep(c, { type: 'triangle', freq1: f, freq2: f * 1.5, start: i * 0.06, dur: 0.25, vol: 0.07 })
    );
  },
};
