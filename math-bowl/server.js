const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (_req, res) => res.redirect('/host.html'));

// ── Defaults ──────────────────────────────────────────────────────────────────
const DEFAULT_QUESTIONS = [
  { text: 'What is 7 × 8?',                                            answer: '56',    points: 100, unit: 'Multiplication' },
  { text: 'What is 144 ÷ 12?',                                         answer: '12',    points: 100, unit: 'Division' },
  { text: 'What is 15² ?',                                             answer: '225',   points: 150, unit: 'Exponents' },
  { text: 'What is √169 ?',                                            answer: '13',    points: 150, unit: 'Square Roots' },
  { text: 'Solve for x:  3x + 7 = 22',                                 answer: '5',     points: 200, unit: 'Algebra' },
  { text: 'What is 25% of 200?',                                       answer: '50',    points: 100, unit: 'Percents' },
  { text: 'Area of a circle with radius 4?\n(Use π ≈ 3.14)',           answer: '50.24', points: 200, unit: 'Geometry' },
  { text: 'What is 1/2 + 1/3 ?',                                       answer: '5/6',   points: 200, unit: 'Fractions' },
  { text: 'What is 2.5 × 4?',                                          answer: '10',    points: 100, unit: 'Decimals' },
  { text: 'How many degrees are in a triangle?',                       answer: '180',   points: 100, unit: 'Geometry' },
];

const ANSWER_MS = 30000;
const STEAL_MS  = 10000;
const VERDICT_PAUSE_MS = 1800;

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  phase:          'lobby',  // lobby | question | answering | judging | steal | game_over
  teams:          {},        // { teamId: { id, name, avatar, color, score, connected } }
  questions:      [...DEFAULT_QUESTIONS],
  qIndex:         0,
  currentQ:       null,
  currentAnswer:  '',
  activeBuzzTeam: null,
  buzzedTeams:    [],
  timerEnd:       null,
  isSteal:        false,
};

let phaseTimer = null;

function broadcast() { io.emit('state', state); }

function clearPhaseTimer() {
  if (phaseTimer) { clearTimeout(phaseTimer); phaseTimer = null; }
  state.timerEnd = null;
}

function loadQuestion(i) {
  clearPhaseTimer();
  state.qIndex         = i;
  state.currentQ       = state.questions[i] || null;
  state.currentAnswer  = '';
  state.activeBuzzTeam = null;
  state.buzzedTeams    = [];
  state.isSteal        = false;
}

function nextQuestion() {
  clearPhaseTimer();
  if (state.qIndex + 1 >= state.questions.length) {
    state.currentQ = null;
    state.phase    = 'game_over';
    broadcast();
    return;
  }
  loadQuestion(state.qIndex + 1);
  state.phase = 'question';
  broadcast();
}

function startAnswering(teamId, isSteal) {
  if (!state.buzzedTeams.includes(teamId)) state.buzzedTeams.push(teamId);
  state.activeBuzzTeam = teamId;
  state.currentAnswer  = '';
  state.isSteal        = !!isSteal;
  state.timerEnd       = Date.now() + ANSWER_MS;
  state.phase          = 'answering';

  clearTimeout(phaseTimer);
  phaseTimer = setTimeout(() => handleWrong(teamId), ANSWER_MS);

  io.emit('buzz', { teamId });
  broadcast();
}

function startSteal() {
  clearPhaseTimer();
  const eligible = Object.keys(state.teams).filter(id => !state.buzzedTeams.includes(id));
  if (eligible.length === 0) {
    io.emit('no_steal');
    setTimeout(nextQuestion, 1500);
    return;
  }
  state.activeBuzzTeam = null;
  state.currentAnswer  = '';
  state.isSteal        = true;
  state.timerEnd       = Date.now() + STEAL_MS;
  state.phase          = 'steal';

  phaseTimer = setTimeout(() => {
    io.emit('no_steal');
    setTimeout(nextQuestion, 1500);
  }, STEAL_MS);

  broadcast();
}

function handleWrong(teamId) {
  clearPhaseTimer();
  io.emit('wrong', { teamId });
  const wasSteal = state.isSteal;
  setTimeout(() => {
    if (wasSteal) {
      io.emit('no_steal');
      setTimeout(nextQuestion, 1200);
    } else {
      startSteal();
    }
  }, VERDICT_PAUSE_MS);
}

function handleCorrect(teamId) {
  clearPhaseTimer();
  const pts = state.currentQ?.points || 0;
  if (state.teams[teamId]) state.teams[teamId].score += pts;
  io.emit('correct', { teamId, points: pts });
  broadcast();
  setTimeout(nextQuestion, 2200);
}

// ── Sockets ───────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  socket.emit('state', state);

  // ── Team events ─────────────────────────────────────────────────
  socket.on('team:register', ({ teamId, name, avatar, color } = {}) => {
    if (!teamId || !name) return;
    const safeName = String(name).slice(0, 24);
    if (state.teams[teamId]) {
      Object.assign(state.teams[teamId], { name: safeName, avatar, color, connected: true });
    } else {
      state.teams[teamId] = { id: teamId, name: safeName, avatar, color, score: 0, connected: true };
    }
    socket.data.teamId = teamId;
    broadcast();
  });

  socket.on('team:buzz', () => {
    const teamId = socket.data.teamId;
    if (!teamId || !state.teams[teamId]) return;
    if (state.buzzedTeams.includes(teamId)) return;

    if (state.phase === 'question') {
      startAnswering(teamId, false);
    } else if (state.phase === 'steal' && state.activeBuzzTeam == null) {
      clearPhaseTimer();
      startAnswering(teamId, true);
    }
  });

  socket.on('team:type', (answer) => {
    const teamId = socket.data.teamId;
    if (teamId !== state.activeBuzzTeam) return;
    if (state.phase !== 'answering') return;
    state.currentAnswer = String(answer ?? '').slice(0, 200);
    io.emit('answer_update', { answer: state.currentAnswer });
  });

  socket.on('team:submit', () => {
    const teamId = socket.data.teamId;
    if (teamId !== state.activeBuzzTeam) return;
    if (state.phase !== 'answering') return;
    clearPhaseTimer();
    state.phase = 'judging';
    broadcast();
  });

  // ── Host events ─────────────────────────────────────────────────
  socket.on('host:join', () => {
    socket.data.isHost = true;
    socket.emit('state', state);
  });

  socket.on('host:add_question', ({ text, answer, points } = {}) => {
    if (state.phase !== 'lobby') return;
    if (!text || !answer) return;
    state.questions.push({
      text:   String(text),
      answer: String(answer),
      points: parseInt(points, 10) || 100,
    });
    broadcast();
  });

  socket.on('host:remove_question', (i) => {
    if (state.phase !== 'lobby') return;
    if (Number.isInteger(i) && i >= 0 && i < state.questions.length) {
      state.questions.splice(i, 1);
      broadcast();
    }
  });

  socket.on('host:reset_questions', () => {
    if (state.phase !== 'lobby') return;
    state.questions = [...DEFAULT_QUESTIONS];
    broadcast();
  });

  socket.on('host:start_game', () => {
    if (state.phase !== 'lobby' || state.questions.length === 0) return;
    loadQuestion(0);
    state.phase = 'question';
    broadcast();
  });

  socket.on('host:judge', (correct) => {
    if (state.phase !== 'judging') return;
    const teamId = state.activeBuzzTeam;
    if (!teamId) return;
    if (correct) handleCorrect(teamId);
    else         handleWrong(teamId);
  });

  socket.on('host:skip', () => {
    if (!['question', 'answering', 'judging', 'steal'].includes(state.phase)) return;
    nextQuestion();
  });

  socket.on('host:adjust_score', ({ teamId, delta } = {}) => {
    if (!state.teams[teamId]) return;
    state.teams[teamId].score = (state.teams[teamId].score || 0) + (parseInt(delta, 10) || 0);
    broadcast();
  });

  socket.on('host:reset', () => {
    clearPhaseTimer();
    Object.values(state.teams).forEach(t => { t.score = 0; });
    state.qIndex         = 0;
    state.currentQ       = null;
    state.currentAnswer  = '';
    state.activeBuzzTeam = null;
    state.buzzedTeams    = [];
    state.isSteal        = false;
    state.phase          = 'lobby';
    broadcast();
  });

  socket.on('disconnect', () => {
    const teamId = socket.data.teamId;
    if (teamId && state.teams[teamId]) {
      state.teams[teamId].connected = false;
      broadcast();
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`⚡ Math Bowl running on http://localhost:${PORT}`);
  console.log(`   Host board:  http://localhost:${PORT}/host.html`);
  console.log(`   Team join:   http://localhost:${PORT}/team.html`);
});
