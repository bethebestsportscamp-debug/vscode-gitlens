const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// ── Default Question Bank (aligned to Final Review Packet 2026) ──────────────
const DEFAULT_QUESTIONS = [

  // ── UNIT 1: Basic Foundations ─────────────────────────────────────────────

  {
    unit: 'Unit 1 – Order of Operations',
    text: 'Simplify:  12 + 7 − 5 × 6 + 1',
    answer: '-10',
    points: 100,
  },
  {
    unit: 'Unit 1 – Order of Operations',
    text: 'What is the FIRST step when simplifying:  5 + 18 ÷ 3 × 2?',
    answer: '18 ÷ 3  (division before addition, left to right)',
    points: 100,
  },
  {
    unit: 'Unit 1 – Distributive Property',
    text: 'Simplify:  −4(3x − 9)',
    answer: '−12x + 36',
    points: 100,
  },
  {
    unit: 'Unit 1 – Distributive Property',
    text: 'Simplify:  5(x² − 6x + 2)',
    answer: '5x² − 30x + 10',
    points: 100,
  },
  {
    unit: 'Unit 1 – Combining Like Terms',
    text: 'Simplify:  2x + 8 − 7y + 2y − 1 − 9x',
    answer: '−7x − 5y + 7',
    points: 100,
  },
  {
    unit: 'Unit 1 – Combining Like Terms',
    text: 'Simplify:  x² + 9 − 8x + 3x² − 10',
    answer: '4x² − 8x − 1',
    points: 100,
  },
  {
    unit: 'Unit 1 – Evaluating Expressions',
    text: 'Evaluate  2x² + 3y  when  x = 4  and  y = 6',
    answer: '50',
    points: 100,
  },
  {
    unit: 'Unit 1 – Evaluating Expressions',
    text: 'Evaluate  a² − b  when  a = −2  and  b = 5',
    answer: '−1',
    points: 100,
  },
  {
    unit: 'Unit 1 – Evaluating Expressions',
    text: 'Evaluate  2a + 3b  when  a = −2  and  b = 5',
    answer: '11',
    points: 100,
  },

  // ── UNIT 2: Algebraic Equations ───────────────────────────────────────────

  {
    unit: 'Unit 2 – One & Two-Step Equations',
    text: 'Solve:  5x − 8 = 32',
    answer: 'x = 8',
    points: 100,
  },
  {
    unit: 'Unit 2 – One & Two-Step Equations',
    text: 'Solve:  4x + 3 − 2 = 6  (combine like terms first)',
    answer: 'x = 5/4  or  x = 1.25',
    points: 100,
  },
  {
    unit: 'Unit 2 – Multi-Step Equations',
    text: 'Solve:  9n − 6 = 5n + 18',
    answer: 'n = 6',
    points: 100,
  },
  {
    unit: 'Unit 2 – Multi-Step Equations',
    text: 'Solve:  3(x − 4) + 5 = 20',
    answer: 'x = 9',
    points: 200,
  },
  {
    unit: 'Unit 2 – Multi-Step Equations',
    text: 'Solve:  2(3x + 4) = 4x + 20',
    answer: 'x = 6',
    points: 200,
  },
  {
    unit: 'Unit 2 – Multi-Step Equations',
    text: 'Solve:  5(x − 2) + 3x = 2(x + 6)',
    answer: 'x = 3',
    points: 300,
  },

  // ── UNIT 3: Algebraic Inequalities ────────────────────────────────────────

  {
    unit: 'Unit 3 – Solving Inequalities',
    text: 'Solve:  −3x < 18',
    answer: 'x > −6  (inequality flips when dividing by negative)',
    points: 100,
  },
  {
    unit: 'Unit 3 – Solving Inequalities',
    text: 'Solve:  3(x − 5) ≤ 15',
    answer: 'x ≤ 10',
    points: 100,
  },
  {
    unit: 'Unit 3 – Solving Inequalities',
    text: 'Solve:  −6x − 4 > 2x − 20',
    answer: 'x < 2',
    points: 200,
  },
  {
    unit: 'Unit 3 – Compound Inequalities',
    text: 'Solve the compound inequality:  −2 < x − 2 ≤ 5',
    answer: '0 < x ≤ 7',
    points: 200,
  },
  {
    unit: 'Unit 3 – Inequality Word Problems',
    text: 'A movie ticket costs $16. You have at most $50. Which inequality shows how many tickets t you can buy?',
    answer: '16t ≤ 50',
    points: 100,
  },
  {
    unit: 'Unit 3 – Inequality Word Problems',
    text: 'Write the inequality: "Three more than a number is at least 10"',
    answer: 'x + 3 ≥ 10',
    points: 100,
  },

  // ── UNIT 4: Graphing ──────────────────────────────────────────────────────

  {
    unit: 'Unit 4 – Slope',
    text: 'What is the slope of the line  y = −2x + 3?',
    answer: '−2',
    points: 100,
  },
  {
    unit: 'Unit 4 – Slope',
    text: 'Find the slope between the points  (4, 3)  and  (8, 6)',
    answer: '3/4  or  0.75',
    points: 100,
  },
  {
    unit: 'Unit 4 – Slope',
    text: 'Find the slope between the points  (−1, −2)  and  (2, 7)',
    answer: '3',
    points: 100,
  },
  {
    unit: 'Unit 4 – Slope',
    text: 'What type of slope does a horizontal line have?',
    answer: 'Zero slope',
    points: 100,
  },
  {
    unit: 'Unit 4 – Slope-Intercept',
    text: 'What is the y-intercept of the line  y = (1/3)x − 1?',
    answer: '(0, −1)  or  −1',
    points: 100,
  },
  {
    unit: 'Unit 4 – Slope-Intercept',
    text: 'Write the equation of the line with slope −2 and y-intercept 5',
    answer: 'y = −2x + 5',
    points: 100,
  },

  // ── UNIT 5: Solving Systems ───────────────────────────────────────────────

  {
    unit: 'Unit 5 – Systems (Substitution)',
    text: 'Solve the system by substitution:\n  y = 4x + 1\n  y = 2x + 5',
    answer: '(2, 9)',
    points: 200,
  },
  {
    unit: 'Unit 5 – Systems (Substitution)',
    text: 'Solve the system by substitution:\n  3x − 2y = −11\n  x = −2y + 7',
    answer: '(−1, 4)',
    points: 300,
  },
  {
    unit: 'Unit 5 – Systems (Elimination)',
    text: 'Solve the system by elimination:\n  2x + 3y = 15\n  x − 3y = 3',
    answer: '(6, 1)',
    points: 200,
  },
  {
    unit: 'Unit 5 – Systems (Elimination)',
    text: 'Solve the system by elimination:\n  4x + 5y = 23\n  9x − 5y = −6',
    answer: '(1, 19/5)  or  (1, 3.8)',
    points: 300,
  },
  {
    unit: 'Unit 5 – Systems (Substitution)',
    text: 'Solve the system:\n  y = 3x − 21\n  y = −2x + 19',
    answer: '(8, 3)',
    points: 200,
  },

  // ── UNIT 6: Functions ─────────────────────────────────────────────────────

  {
    unit: 'Unit 6 – Identifying Functions',
    text: 'Is the relation  {(1, 2), (2, 4), (3, 2), (1, 5)}  a function?  Why or why not?',
    answer: 'No — the x-value 1 repeats with two different y-values',
    points: 100,
  },
  {
    unit: 'Unit 6 – Identifying Functions',
    text: 'What test do we use to determine if a GRAPH represents a function?',
    answer: 'The Vertical Line Test',
    points: 100,
  },
  {
    unit: 'Unit 6 – Domain & Range',
    text: 'What is the DOMAIN of the function  {(2, 5), (4, 8), (6, 11)}?',
    answer: '{2, 4, 6}',
    points: 100,
  },
  {
    unit: 'Unit 6 – Domain & Range',
    text: 'What is the RANGE of the function  {(−1, 3), (0, 3), (4, 7)}?',
    answer: '{3, 7}',
    points: 100,
  },
  {
    unit: 'Unit 6 – Types of Functions',
    text: 'A graph is shaped like a U (or upside-down U). What type of function is it?',
    answer: 'Quadratic',
    points: 100,
  },
  {
    unit: 'Unit 6 – Types of Functions',
    text: 'A graph grows rapidly — doubling or tripling. What type of function is it?',
    answer: 'Exponential',
    points: 100,
  },

  // ── UNIT 7: Polynomials ───────────────────────────────────────────────────

  {
    unit: 'Unit 7 – Degree & Leading Coefficient',
    text: 'What is the DEGREE of the polynomial:  3x³ + 2x² − 11?',
    answer: '3',
    points: 100,
  },
  {
    unit: 'Unit 7 – Degree & Leading Coefficient',
    text: 'What is the LEADING COEFFICIENT of:  −5x⁴ + 3x² − x + 8?',
    answer: '−5',
    points: 100,
  },
  {
    unit: 'Unit 7 – Exponent Rules',
    text: 'Simplify:  x³ · x⁵',
    answer: 'x⁸',
    points: 100,
  },
  {
    unit: 'Unit 7 – Exponent Rules',
    text: 'Simplify:  y⁷ ÷ y²',
    answer: 'y⁵',
    points: 100,
  },
  {
    unit: 'Unit 7 – Exponent Rules',
    text: 'Simplify:  (2a²)(3a⁵)',
    answer: '6a⁷',
    points: 100,
  },
  {
    unit: 'Unit 7 – Adding Polynomials',
    text: 'Find the sum:  (4x² − 3x + 6) + (−7x² + 3x + 6)',
    answer: '−3x² + 12',
    points: 100,
  },
  {
    unit: 'Unit 7 – Subtracting Polynomials',
    text: 'Find the difference:  (6y² − 3y + 1) − (2y² + 4y − 5)',
    answer: '4y² − 7y + 6',
    points: 200,
  },
  {
    unit: 'Unit 7 – Multiplying Polynomials',
    text: 'Multiply:  (x + 3)(x + 5)',
    answer: 'x² + 8x + 15',
    points: 200,
  },
  {
    unit: 'Unit 7 – Multiplying Polynomials',
    text: 'Multiply:  (2x + 5)(x − 4)',
    answer: '2x² − 3x − 20',
    points: 200,
  },
  {
    unit: 'Unit 7 – Standard Form',
    text: 'Put in standard form, then state its DEGREE:  4 − 2x³ + 7x − x²',
    answer: '−2x³ − x² + 7x + 4 ,  degree = 3',
    points: 200,
  },

  // ── UNIT 8: Factoring ─────────────────────────────────────────────────────

  {
    unit: 'Unit 8 – GCF',
    text: 'Factor using GCF:  6x³ + 9x²',
    answer: '3x²(2x + 3)',
    points: 100,
  },
  {
    unit: 'Unit 8 – GCF',
    text: 'Factor using GCF:  8y⁴ − 12y²',
    answer: '4y²(2y² − 3)',
    points: 100,
  },
  {
    unit: 'Unit 8 – Difference of Two Squares',
    text: 'Factor using DOTS:  x² − 49',
    answer: '(x + 7)(x − 7)',
    points: 100,
  },
  {
    unit: 'Unit 8 – Difference of Two Squares',
    text: 'Factor using DOTS:  9a² − 16b²',
    answer: '(3a + 4b)(3a − 4b)',
    points: 200,
  },
  {
    unit: 'Unit 8 – Factoring Trinomials',
    text: 'Factor:  x² + 7x + 12',
    answer: '(x + 3)(x + 4)',
    points: 100,
  },
  {
    unit: 'Unit 8 – Factoring Trinomials',
    text: 'Factor:  x² − 9x + 8',
    answer: '(x − 1)(x − 8)',
    points: 100,
  },
  {
    unit: 'Unit 8 – Factoring Trinomials',
    text: 'Factor:  x² + 10x + 25',
    answer: '(x + 5)²',
    points: 100,
  },
  {
    unit: 'Unit 8 – Factor Completely',
    text: 'Factor COMPLETELY:  2x³ − 32x',
    answer: '2x(x + 4)(x − 4)',
    points: 300,
  },
  {
    unit: 'Unit 8 – Factor Completely',
    text: 'Factor COMPLETELY:  5x² + 20x + 20',
    answer: '5(x + 2)²',
    points: 300,
  },
  {
    unit: 'Unit 8 – Factor Completely',
    text: 'Factor COMPLETELY:  3x² + 15x + 18',
    answer: '3(x + 2)(x + 3)',
    points: 300,
  },
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
