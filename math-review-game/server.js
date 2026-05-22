const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// ── Default Question Bank ────────────────────────────────────────────────────
const DEFAULT_QUESTIONS = [
  { text: 'Solve for x:  2x + 5 = 13', answer: 'x = 4', points: 100 },
  { text: 'Factor completely:  x² − 9', answer: '(x + 3)(x − 3)', points: 100 },
  { text: 'Simplify:  (3x²)(2x³)', answer: '6x⁵', points: 100 },
  { text: 'What is the slope of the line  y = −3x + 7?', answer: '−3', points: 100 },
  { text: 'Solve:  x² − 5x + 6 = 0', answer: 'x = 2  or  x = 3', points: 100 },
  { text: 'Find the y-intercept of  2x − 3y = 12', answer: '(0, −4)  or  y = −4', points: 100 },
  { text: 'Evaluate  f(x) = x² + 2x − 1  at  x = 3', answer: '14', points: 100 },
  { text: 'Simplify:  √48', answer: '4√3', points: 100 },
  { text: 'Area of a circle with radius 5  (leave in terms of π)', answer: '25π', points: 100 },
  { text: 'Distance between  (1, 2)  and  (4, 6)', answer: '5', points: 100 },
  { text: 'Solve the system:  x + y = 7  and  x − y = 3', answer: 'x = 5,  y = 2', points: 200 },
  { text: 'What is the vertex of  y = x² − 4x + 1?', answer: '(2, −3)', points: 200 },
  { text: 'Expand:  (x + 3)²', answer: 'x² + 6x + 9', points: 100 },
  { text: 'Find the equation of a line with slope 2 passing through (0, 5)', answer: 'y = 2x + 5', points: 100 },
  { text: 'What is the sum of interior angles of a pentagon?', answer: '540°', points: 100 },
  { text: 'Simplify:  (x² − 4) ÷ (x + 2)', answer: 'x − 2', points: 200 },
  { text: 'If f(x) = 2x + 1 and g(x) = x², find  f(g(3))', answer: '19', points: 200 },
  { text: 'Solve:  |2x − 3| = 7', answer: 'x = 5  or  x = −2', points: 200 },
  { text: 'What is the median of:  3, 7, 1, 9, 4, 8, 2?', answer: '4', points: 100 },
  { text: 'Simplify:  (2³)² ÷ 2⁴', answer: '4  or  2²', points: 100 },
];

// ── Game State ────────────────────────────────────────────────────────────────
let state = {
  phase: 'lobby',      // lobby | question | answering | judging | steal | game_over
  teams: {},           // { [id]: { id, name, avatar, color, score, connected } }
  questions: [...DEFAULT_QUESTIONS],
  qIndex: -1,
  activeBuzzTeam: null,
  isSteal: false,
  buzzedTeams: [],     // ids of teams that have already buzzed on this question
  currentAnswer: '',
  timerEnd: null,
  timerHandle: null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function snapshot() {
  return {
    phase: state.phase,
    teams: state.teams,
    questions: state.questions,
    qIndex: state.qIndex,
    currentQ: state.qIndex >= 0 ? state.questions[state.qIndex] : null,
    activeBuzzTeam: state.activeBuzzTeam,
    isSteal: state.isSteal,
    buzzedTeams: state.buzzedTeams,
    currentAnswer: state.currentAnswer,
    timerEnd: state.timerEnd,
  };
}

function bcast(event, data) {
  io.emit(event, data);
}

function clearTimer() {
  if (state.timerHandle) {
    clearTimeout(state.timerHandle);
    state.timerHandle = null;
  }
  state.timerEnd = null;
}

function setTimer(ms, fn) {
  clearTimer();
  state.timerEnd = Date.now() + ms;
  state.timerHandle = setTimeout(fn, ms);
}

function advanceQuestion() {
  clearTimer();
  state.qIndex++;
  state.activeBuzzTeam = null;
  state.isSteal = false;
  state.buzzedTeams = [];
  state.currentAnswer = '';

  if (state.qIndex >= state.questions.length) {
    state.phase = 'game_over';
  } else {
    state.phase = 'question';
  }
  bcast('state', snapshot());
}

function beginAnswering(teamId, isSteal) {
  state.activeBuzzTeam = teamId;
  state.isSteal = isSteal;
  state.currentAnswer = '';
  state.phase = 'answering';
  if (!state.buzzedTeams.includes(teamId)) {
    state.buzzedTeams.push(teamId);
  }
  bcast('buzz', { teamId });
  bcast('state', snapshot());
  // 30 seconds to type answer
  setTimer(30000, () => {
    state.phase = 'judging';
    clearTimer();
    bcast('state', snapshot());
  });
}

function beginSteal() {
  clearTimer();
  state.phase = 'steal';
  bcast('state', snapshot());
  // 10 seconds for another team to buzz in
  setTimer(10000, () => {
    // Nobody stole — advance
    bcast('no_steal', {});
    setTimeout(() => advanceQuestion(), 1500);
  });
}

// ── Socket Handlers ───────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  socket.emit('state', snapshot());

  // ── HOST ──────────────────────────────────────────────────────────────────
  socket.on('host:join', () => {
    socket.join('host');
    socket.emit('state', snapshot());
  });

  socket.on('host:add_question', ({ text, answer, points }) => {
    if (!text || !answer) return;
    state.questions.push({ text, answer, points: points || 100 });
    bcast('state', snapshot());
  });

  socket.on('host:remove_question', (index) => {
    if (state.phase !== 'lobby') return;
    state.questions.splice(index, 1);
    bcast('state', snapshot());
  });

  socket.on('host:reset_questions', () => {
    if (state.phase !== 'lobby') return;
    state.questions = [...DEFAULT_QUESTIONS];
    bcast('state', snapshot());
  });

  socket.on('host:start_game', () => {
    if (state.phase !== 'lobby' || state.questions.length === 0) return;
    state.qIndex = -1;
    advanceQuestion();
  });

  socket.on('host:judge', (correct) => {
    if (state.phase !== 'judging') return;
    clearTimer();

    if (correct) {
      const base = state.questions[state.qIndex]?.points || 100;
      const awarded = state.isSteal ? Math.floor(base / 2) : base;
      if (state.teams[state.activeBuzzTeam]) {
        state.teams[state.activeBuzzTeam].score += awarded;
      }
      bcast('correct', { teamId: state.activeBuzzTeam, points: awarded });
      setTimeout(() => advanceQuestion(), 2500);
    } else {
      bcast('wrong', { teamId: state.activeBuzzTeam });
      if (!state.isSteal) {
        setTimeout(() => beginSteal(), 1200);
      } else {
        setTimeout(() => advanceQuestion(), 2000);
      }
    }
  });

  socket.on('host:skip', () => {
    if (!['question', 'judging', 'steal'].includes(state.phase)) return;
    clearTimer();
    advanceQuestion();
  });

  socket.on('host:adjust_score', ({ teamId, delta }) => {
    if (state.teams[teamId]) {
      state.teams[teamId].score = Math.max(0, state.teams[teamId].score + delta);
      bcast('state', snapshot());
    }
  });

  socket.on('host:reset', () => {
    clearTimer();
    Object.values(state.teams).forEach(t => {
      t.score = 0;
    });
    state.phase = 'lobby';
    state.qIndex = -1;
    state.activeBuzzTeam = null;
    state.isSteal = false;
    state.buzzedTeams = [];
    state.currentAnswer = '';
    bcast('state', snapshot());
  });

  socket.on('host:kick_team', (teamId) => {
    delete state.teams[teamId];
    bcast('state', snapshot());
  });

  // ── TEAM ──────────────────────────────────────────────────────────────────
  socket.on('team:register', ({ teamId, name, avatar, color }) => {
    const id = teamId || socket.id;
    state.teams[id] = {
      id,
      name: name || 'Team',
      avatar: avatar || '🦁',
      color: color || '#3498db',
      score: state.teams[id]?.score || 0,
      connected: true,
    };
    socket.data.teamId = id;
    socket.join(`team:${id}`);
    bcast('state', snapshot());
  });

  socket.on('team:buzz', () => {
    const teamId = socket.data.teamId;
    if (!teamId || !state.teams[teamId]) return;
    if (state.buzzedTeams.includes(teamId)) return;

    if (state.phase === 'question') {
      beginAnswering(teamId, false);
    } else if (state.phase === 'steal' && teamId !== state.activeBuzzTeam) {
      clearTimer();
      beginAnswering(teamId, true);
    }
  });

  socket.on('team:type', (text) => {
    const teamId = socket.data.teamId;
    if (teamId !== state.activeBuzzTeam || state.phase !== 'answering') return;
    state.currentAnswer = String(text).slice(0, 300);
    bcast('answer_update', { answer: state.currentAnswer });
  });

  socket.on('team:submit', () => {
    const teamId = socket.data.teamId;
    if (teamId !== state.activeBuzzTeam || state.phase !== 'answering') return;
    clearTimer();
    state.phase = 'judging';
    bcast('state', snapshot());
  });

  socket.on('disconnect', () => {
    const teamId = socket.data.teamId;
    if (teamId && state.teams[teamId]) {
      state.teams[teamId].connected = false;
      bcast('state', snapshot());
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('\n🎓  Math Review Game is running!');
  console.log(`\n   📺  Host/Board screen  →  http://localhost:${PORT}/host.html`);
  console.log(`   🖥️   Team screens       →  http://localhost:${PORT}/team.html`);
  console.log('\nPress Ctrl+C to stop.\n');
});
