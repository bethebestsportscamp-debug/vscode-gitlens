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
	const t = c.currentTime + start;
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

function sayAnimal(text, { pitch = 1, rate = 1 } = {}) {
	if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) return;
	const utterance = new SpeechSynthesisUtterance(text);
	utterance.volume = 0.85;
	utterance.pitch = pitch;
	utterance.rate = rate;
	window.speechSynthesis.cancel();
	window.speechSynthesis.speak(utterance);
}

// ── Sound Library ─────────────────────────────────────────────────────────────
const Sounds = {
	// Random animal buzzer  ——  plays when a team buzzes in
	animalBuzz() {
		const animals = [
			{
				emoji: '🐄',
				call: 'MOO!',
				name: 'Cow',
				spoken: 'Moooo!',
				voice: { pitch: 0.55, rate: 0.72 },
				play: () => this.moo(),
			},
			{
				emoji: '🦆',
				call: 'QUACK!',
				name: 'Duck',
				spoken: 'Quack quack!',
				voice: { pitch: 1.35, rate: 1.15 },
				play: () => this.quack(),
			},
			{
				emoji: '🐑',
				call: 'BAAA!',
				name: 'Sheep',
				spoken: 'Baaa!',
				voice: { pitch: 1.18, rate: 0.85 },
				play: () => this.baa(),
			},
			{
				emoji: '🐷',
				call: 'OINK!',
				name: 'Pig',
				spoken: 'Oink oink!',
				voice: { pitch: 0.82, rate: 1.05 },
				play: () => this.oink(),
			},
			{
				emoji: '🐔',
				call: 'CLUCK!',
				name: 'Chicken',
				spoken: 'Cluck cluck!',
				voice: { pitch: 1.5, rate: 1.25 },
				play: () => this.cluck(),
			},
			{
				emoji: '🐸',
				call: 'RIBBIT!',
				name: 'Frog',
				spoken: 'Ribbit!',
				voice: { pitch: 0.7, rate: 0.78 },
				play: () => this.ribbit(),
			},
		];
		const pick = animals[Math.floor(Math.random() * animals.length)];
		pick.play();
		sayAnimal(pick.spoken, pick.voice);
		return pick;
	},

	// 🐄 Cow moo
	moo() {
		const c = getCtx();
		sweep(c, { type: 'sine', freq1: 180, freq2: 92, start: 0.0, dur: 0.48, vol: 0.34 });
		sweep(c, { type: 'triangle', freq1: 140, freq2: 82, start: 0.18, dur: 0.62, vol: 0.25 });
	},

	// 🦆 Duck quack × 2
	quack() {
		const c = getCtx();
		sweep(c, { type: 'sawtooth', freq1: 520, freq2: 210, start: 0.0, dur: 0.17, vol: 0.38 });
		sweep(c, { type: 'sawtooth', freq1: 490, freq2: 195, start: 0.24, dur: 0.17, vol: 0.33 });
	},

	// 🐑 Sheep baa
	baa() {
		const c = getCtx();
		sweep(c, { type: 'sawtooth', freq1: 430, freq2: 310, start: 0.0, dur: 0.22, vol: 0.28 });
		sweep(c, { type: 'sawtooth', freq1: 455, freq2: 300, start: 0.18, dur: 0.24, vol: 0.24 });
		sweep(c, { type: 'triangle', freq1: 385, freq2: 270, start: 0.38, dur: 0.3, vol: 0.2 });
	},

	// 🐷 Pig oink
	oink() {
		const c = getCtx();
		sweep(c, { type: 'square', freq1: 245, freq2: 125, start: 0.0, dur: 0.13, vol: 0.3 });
		sweep(c, { type: 'sawtooth', freq1: 190, freq2: 92, start: 0.16, dur: 0.18, vol: 0.36 });
		sweep(c, { type: 'square', freq1: 260, freq2: 118, start: 0.36, dur: 0.12, vol: 0.26 });
	},

	// 🐔 Chicken cluck
	cluck() {
		const c = getCtx();
		sweep(c, { type: 'square', freq1: 820, freq2: 320, start: 0.0, dur: 0.07, vol: 0.22 });
		sweep(c, { type: 'square', freq1: 760, freq2: 280, start: 0.1, dur: 0.06, vol: 0.2 });
		sweep(c, { type: 'square', freq1: 900, freq2: 350, start: 0.2, dur: 0.08, vol: 0.24 });
	},

	// 🐸 Frog ribbit
	ribbit() {
		const c = getCtx();
		sweep(c, { type: 'sawtooth', freq1: 135, freq2: 78, start: 0.0, dur: 0.18, vol: 0.3 });
		sweep(c, { type: 'sawtooth', freq1: 145, freq2: 82, start: 0.26, dur: 0.22, vol: 0.34 });
	},

	// 😢 Sad trombone  ——  plays on wrong answer  ("wah  wah  wah  waaaaaah")
	sadTrombone() {
		const c = getCtx();
		const notes = [
			{ freq1: 466, freq2: 440, start: 0.0, dur: 0.28 },
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
			sweep(c, { type: 'square', freq1: f, start: i * 0.1, dur: 0.22, vol: 0.1 }),
		);
		// Cat meow: glide up then settle back down
		sweep(c, { type: 'sine', freq1: 650, freq2: 1350, start: 0.58, dur: 0.16, vol: 0.22 });
		sweep(c, { type: 'sine', freq1: 1350, freq2: 820, start: 0.74, dur: 0.32, vol: 0.19 });
	},

	// 🪿 Goose honk × 2  ——  steal opportunity starts
	gooseHonk() {
		const c = getCtx();
		sweep(c, { type: 'sawtooth', freq1: 360, freq2: 275, start: 0.0, dur: 0.22, vol: 0.38 });
		sweep(c, { type: 'sawtooth', freq1: 345, freq2: 262, start: 0.3, dur: 0.22, vol: 0.34 });
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
		sweep(c, { type: 'sawtooth', freq1: 280, freq2: 850, start: 0.0, dur: 0.28, vol: 0.3 });
		sweep(c, { type: 'sawtooth', freq1: 850, freq2: 480, start: 0.28, dur: 0.42, vol: 0.25 });
		sweep(c, { type: 'sawtooth', freq1: 480, freq2: 320, start: 0.7, dur: 0.4, vol: 0.2 });
		// Second blast after a pause
		setTimeout(() => {
			const c2 = getCtx();
			sweep(c2, { type: 'sawtooth', freq1: 350, freq2: 1100, start: 0.0, dur: 0.22, vol: 0.28 });
			sweep(c2, { type: 'sawtooth', freq1: 1100, freq2: 620, start: 0.22, dur: 0.55, vol: 0.22 });
		}, 1300);
	},

	// 🔔 Single tick beep  ——  last 5 seconds of timer
	timerBeep(urgent = false) {
		const c = getCtx();
		sweep(c, { type: 'square', freq1: urgent ? 1100 : 880, start: 0, dur: 0.07, vol: urgent ? 0.14 : 0.09 });
	},

	// ⏰ Short timeout gong  ——  plays when the answering clock hits zero
	timeoutHorn() {
		const c = getCtx();
		sweep(c, { type: 'sine', freq1: 260, freq2: 190, start: 0.0, dur: 0.34, vol: 0.23 });
		sweep(c, { type: 'triangle', freq1: 130, freq2: 112, start: 0.02, dur: 0.42, vol: 0.17 });
	},

	// 🎉 Short crowd cheer stinger  ——  plays alongside confetti on correct
	cheer() {
		const c = getCtx();
		// Rising noise-like burst using detuned oscillators
		[330, 420, 528, 660].forEach((f, i) =>
			sweep(c, { type: 'triangle', freq1: f, freq2: f * 1.5, start: i * 0.06, dur: 0.25, vol: 0.07 }),
		);
	},
};
