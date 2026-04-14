/* =====================================================
   QUIZMASTER — script.js
   Concepts: Arrays, Objects, Event handling, DOM, Timer
   ===================================================== */

// ══════════════════════════════════════════════════════
// QUIZ DATA — Array of question objects
// Each object has: question, options[], correct (index),
//                  category, explanation
// ══════════════════════════════════════════════════════
const QUESTIONS = [
  {
    question: "Which method is used to add an element to the END of an array in JavaScript?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    correct: 0,
    category: "JavaScript",
    explanation: "push() adds one or more elements to the end of an array."
  },
  {
    question: "What does the 'typeof' operator return for a null value?",
    options: ["'null'", "'undefined'", "'object'", "'boolean'"],
    correct: 2,
    category: "JavaScript",
    explanation: "typeof null returns 'object' — a famous JavaScript bug kept for backward compatibility."
  },
  {
    question: "Which HTML tag is used to link an external JavaScript file?",
    options: ["<link>", "<script>", "<js>", "<javascript>"],
    correct: 1,
    category: "HTML",
    explanation: "<script src='file.js'></script> is used to link external JS files."
  },
  {
    question: "What does CSS stand for?",
    options: [
      "Computer Style Sheets",
      "Creative Style System",
      "Cascading Style Sheets",
      "Colorful Style Sheets"
    ],
    correct: 2,
    category: "CSS",
    explanation: "CSS stands for Cascading Style Sheets."
  },
  {
    question: "Which of the following is NOT a JavaScript data type?",
    options: ["String", "Boolean", "Float", "Symbol"],
    correct: 2,
    category: "JavaScript",
    explanation: "JavaScript has no 'Float' type. Numbers (integer & float) are covered by the 'Number' type."
  },
  {
    question: "What does the fetch() API return?",
    options: ["A JSON object", "A string", "A Promise", "An XMLHttpRequest"],
    correct: 2,
    category: "JavaScript",
    explanation: "fetch() returns a Promise that resolves to a Response object."
  },
  {
    question: "Which CSS property controls the space INSIDE an element's border?",
    options: ["margin", "spacing", "padding", "border-spacing"],
    correct: 2,
    category: "CSS",
    explanation: "padding controls the space between the content and the border of an element."
  },
  {
    question: "What is the correct way to declare a constant in JavaScript?",
    options: ["var x = 5;", "let x = 5;", "const x = 5;", "define x = 5;"],
    correct: 2,
    category: "JavaScript",
    explanation: "const declares a block-scoped constant that cannot be reassigned."
  },
  {
    question: "Which method converts a JSON string into a JavaScript object?",
    options: ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.decode()"],
    correct: 1,
    category: "JavaScript",
    explanation: "JSON.parse() converts a JSON-formatted string into a JavaScript object."
  },
  {
    question: "What is the output of: console.log(2 + '3')?",
    options: ["5", "23", "'23'", "Error"],
    correct: 1,
    category: "JavaScript",
    explanation: "JavaScript coerces 2 to a string and concatenates: 2 + '3' = '23' (string)."
  }
];

// ══════════════════════════════════════════════════════
// QUIZ STATE
// ══════════════════════════════════════════════════════
const TOTAL_QUESTIONS = QUESTIONS.length;
const TIME_PER_Q      = 20;  // seconds per question
const TIMER_CIRCUMF   = 113.1; // 2π × r (r=18) for the small ring

let currentIndex  = 0;   // which question we're on
let score         = 0;   // correct answers count
let wrongCount    = 0;
let timeoutCount  = 0;
let timerInterval = null;
let timeLeft      = TIME_PER_Q;
let answered      = false;
let userAnswers   = [];  // stores { chosen, correct, timedOut } for review

// ══════════════════════════════════════════════════════
// DOM REFERENCES
// ══════════════════════════════════════════════════════
const screens = {
  welcome:  document.getElementById('screenWelcome'),
  question: document.getElementById('screenQuestion'),
  result:   document.getElementById('screenResult'),
  review:   document.getElementById('screenReview'),
};

const qNumberEl    = document.getElementById('qNumber');
const qCategoryEl  = document.getElementById('qCategory');
const progressFill = document.getElementById('progressFill');
const questionText = document.getElementById('questionText');
const optionBtns   = [0,1,2,3].map(i => document.getElementById(`opt-${i}`));
const nextBtn      = document.getElementById('nextBtn');

const timerNum     = document.getElementById('timerNum');
const timerRing    = document.getElementById('timerRing');

const scoreNumEl   = document.getElementById('scoreNum');
const scoreRingEl  = document.getElementById('scoreRingFill');
const resultEmoji  = document.getElementById('resultEmoji');
const resultTitle  = document.getElementById('resultTitle');
const resultSub    = document.getElementById('resultSub');
const rsCorrect    = document.getElementById('rsCorrect');
const rsWrong      = document.getElementById('rsWrong');
const rsSkip       = document.getElementById('rsSkip');
const reviewList   = document.getElementById('reviewList');

// ══════════════════════════════════════════════════════
// SCREEN MANAGER
// ══════════════════════════════════════════════════════
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ══════════════════════════════════════════════════════
// SHUFFLE ARRAY (Fisher-Yates)
// ══════════════════════════════════════════════════════
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ══════════════════════════════════════════════════════
// TIMER
// ══════════════════════════════════════════════════════
function startTimer() {
  timeLeft = TIME_PER_Q;
  updateTimerUI();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimerUI() {
  timerNum.textContent = timeLeft;
  // SVG ring: shrink dashoffset as time reduces
  const ratio      = timeLeft / TIME_PER_Q;
  const dashOffset = TIMER_CIRCUMF * (1 - ratio);
  timerRing.style.strokeDashoffset = dashOffset;

  // Turn red in last 5 seconds
  const danger = timeLeft <= 5;
  timerRing.classList.toggle('danger', danger);
  timerNum.classList.toggle('danger', danger);
}

function handleTimeout() {
  answered = true;
  timeoutCount++;
  const q = QUESTIONS[currentIndex];

  // Record as timed-out
  userAnswers.push({ chosen: -1, correct: q.correct, timedOut: true });

  // Reveal correct answer
  optionBtns[q.correct].classList.add('correct');
  optionBtns.forEach(b => b.disabled = true);

  nextBtn.style.display = 'block';
  nextBtn.textContent   = currentIndex < TOTAL_QUESTIONS - 1
    ? 'Next →'
    : 'See Results →';
}

// ══════════════════════════════════════════════════════
// LOAD QUESTION
// ══════════════════════════════════════════════════════
// LABELS for option prefix
const LABELS = ['A', 'B', 'C', 'D'];

function loadQuestion() {
  answered = false;
  const q = QUESTIONS[currentIndex];

  // Meta
  qNumberEl.textContent   = `Question ${currentIndex + 1} / ${TOTAL_QUESTIONS}`;
  qCategoryEl.textContent = q.category;
  progressFill.style.width = `${((currentIndex + 1) / TOTAL_QUESTIONS) * 100}%`;

  // Question
  questionText.textContent = q.question;

  // Options
  optionBtns.forEach((btn, i) => {
    btn.textContent = q.options[i];
    btn.dataset.label = LABELS[i];
    btn.className    = 'option-btn';   // reset classes
    btn.disabled     = false;
  });

  // Hide next button
  nextBtn.style.display = 'none';

  // Start timer
  stopTimer();
  startTimer();
}

// ══════════════════════════════════════════════════════
// HANDLE ANSWER
// ══════════════════════════════════════════════════════
function handleAnswer(chosenIndex) {
  if (answered) return;
  answered = true;
  stopTimer();

  const q = QUESTIONS[currentIndex];
  const isCorrect = (chosenIndex === q.correct);

  // Record answer for review
  userAnswers.push({ chosen: chosenIndex, correct: q.correct, timedOut: false });

  // Update stats
  if (isCorrect) {
    score++;
    optionBtns[chosenIndex].classList.add('correct');
  } else {
    wrongCount++;
    optionBtns[chosenIndex].classList.add('wrong');
    optionBtns[q.correct].classList.add('correct'); // reveal correct
  }

  // Disable all options
  optionBtns.forEach(b => b.disabled = true);

  // Show next / finish button
  nextBtn.style.display = 'block';
  nextBtn.textContent   = currentIndex < TOTAL_QUESTIONS - 1
    ? 'Next →'
    : 'See Results →';
}

// ══════════════════════════════════════════════════════
// SHOW RESULTS
// ══════════════════════════════════════════════════════
const RESULT_LEVELS = [
  { min:9, emoji:'🏆', title:'Outstanding!',   sub:'You are a JavaScript master!' },
  { min:7, emoji:'🌟', title:'Excellent!',     sub:'You really know your stuff.' },
  { min:5, emoji:'👍', title:'Good Job!',      sub:'You have a solid foundation.' },
  { min:3, emoji:'📖', title:'Keep Learning!', sub:'More practice will get you there.' },
  { min:0, emoji:'💪', title:"Don't Give Up!", sub:'Review the basics and try again.' },
];

function showResults() {
  const pct = score / TOTAL_QUESTIONS;

  // Score ring animation
  const circumf   = 326.7; // 2π × 52
  const dashOffset = circumf * (1 - pct);
  // Delay so the screen transition completes first
  setTimeout(() => {
    scoreRingEl.style.strokeDashoffset = dashOffset;
    // Animate count-up
    let n = 0;
    const interval = setInterval(() => {
      n++;
      scoreNumEl.textContent = n;
      if (n >= score) clearInterval(interval);
    }, 80);
  }, 400);

  // Badge
  const level = RESULT_LEVELS.find(l => score >= l.min);
  resultEmoji.textContent = level.emoji;
  resultTitle.textContent = level.title;
  resultSub.textContent   = level.sub;

  // Stats
  rsCorrect.textContent = score;
  rsWrong.textContent   = wrongCount;
  rsSkip.textContent    = timeoutCount;

  showScreen('result');
}

// ══════════════════════════════════════════════════════
// BUILD REVIEW LIST
// ══════════════════════════════════════════════════════
function buildReview() {
  reviewList.innerHTML = '';

  QUESTIONS.forEach((q, i) => {
    const ua     = userAnswers[i];
    const isOk   = !ua.timedOut && ua.chosen === ua.correct;
    const isTO   = ua.timedOut;
    const isWrong = !ua.timedOut && ua.chosen !== ua.correct;

    const statusClass = isOk ? 'r-correct' : isTO ? 'r-timeout' : 'r-wrong';
    const badge       = isOk ? 'badge-correct' : isTO ? 'badge-timeout' : 'badge-wrong';
    const badgeLabel  = isOk ? '✅ Correct' : isTO ? '⏱ Timed Out' : '❌ Wrong';

    const yourAns = isTO
      ? 'No answer (timed out)'
      : q.options[ua.chosen];
    const rightAns = q.options[ua.correct];

    const div = document.createElement('div');
    div.className = `review-item ${statusClass}`;
    div.innerHTML = `
      <span class="ri-badge ${badge}">${badgeLabel}</span>
      <p class="ri-q">Q${i+1}. ${q.question}</p>
      <p class="ri-meta">Your answer: <strong>${yourAns}</strong></p>
      ${!isOk ? `<p class="ri-correct-ans">✅ Correct: <strong>${rightAns}</strong></p>` : ''}
    `;
    reviewList.appendChild(div);
  });
}

// ══════════════════════════════════════════════════════
// RESET / RESTART QUIZ
// ══════════════════════════════════════════════════════
function resetQuiz() {
  currentIndex  = 0;
  score         = 0;
  wrongCount    = 0;
  timeoutCount  = 0;
  answered      = false;
  userAnswers   = [];
  // Reset score ring
  scoreRingEl.style.strokeDashoffset = '326.7';
  scoreNumEl.textContent = '0';
  stopTimer();
}

// ══════════════════════════════════════════════════════
// EVENT LISTENERS
// ══════════════════════════════════════════════════════

// Start quiz
document.getElementById('startBtn').addEventListener('click', () => {
  resetQuiz();
  showScreen('question');
  loadQuestion();
});

// Answer options — event delegation on the options grid
document.getElementById('optionsGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('.option-btn');
  if (!btn || btn.disabled) return;
  const idx = optionBtns.indexOf(btn);
  if (idx !== -1) handleAnswer(idx);
});

// Next / Finish button
nextBtn.addEventListener('click', () => {
  currentIndex++;
  if (currentIndex < TOTAL_QUESTIONS) {
    loadQuestion();
  } else {
    showResults();
  }
});

// Retry
document.getElementById('retryBtn').addEventListener('click', () => {
  resetQuiz();
  showScreen('question');
  loadQuestion();
});

// Review answers
document.getElementById('reviewBtn').addEventListener('click', () => {
  buildReview();
  showScreen('review');
});

// Back to results from review
document.getElementById('backBtn').addEventListener('click', () => {
  showScreen('result');
});

// ══════════════════════════════════════════════════════
// INIT — show welcome screen
// ══════════════════════════════════════════════════════
showScreen('welcome');
