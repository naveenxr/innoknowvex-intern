/* =====================================================
   STYLISH CALCULATOR — script.js
   Concepts: Event handling, DOM manipulation, Logic
   ===================================================== */

// ── State ─────────────────────────────────────────────
let currentInput  = '';    // number being typed right now
let previousInput = '';    // number before the operator
let operator      = null;  // active operator: + − × ÷
let shouldReset   = false; // reset display on next digit after =

// ── DOM References ─────────────────────────────────────
const resultEl     = document.getElementById('result');
const expressionEl = document.getElementById('expression');
const displayEl    = document.getElementById('display');

// ── Update Display ─────────────────────────────────────
function updateDisplay(value) {
  resultEl.textContent = value;

  // Shrink font for long numbers
  const len = String(value).length;
  resultEl.classList.remove('shrink', 'shrink-more');
  if (len > 12) resultEl.classList.add('shrink-more');
  else if (len > 9) resultEl.classList.add('shrink');
}

function updateExpression(text) {
  expressionEl.textContent = text;
}

// ── Append a Digit ─────────────────────────────────────
function appendDigit(digit) {
  // After pressing =, start fresh
  if (shouldReset) {
    currentInput = '';
    shouldReset  = false;
  }

  // Prevent multiple leading zeros
  if (currentInput === '0' && digit === '0') return;
  if (currentInput === '0' && digit !== '.') currentInput = '';

  // Max 15 digits
  if (currentInput.replace('.', '').replace('-', '').length >= 15) return;

  currentInput += digit;
  updateDisplay(currentInput);
}

// ── Append Decimal Point ────────────────────────────────
function appendDot() {
  if (shouldReset) { currentInput = '0'; shouldReset = false; }
  if (currentInput === '') currentInput = '0';
  if (currentInput.includes('.')) return; // already has a dot
  currentInput += '.';
  updateDisplay(currentInput);
}

// ── Toggle Sign ─────────────────────────────────────────
function toggleSign() {
  if (currentInput === '' || currentInput === '0') return;
  currentInput = currentInput.startsWith('-')
    ? currentInput.slice(1)
    : '-' + currentInput;
  updateDisplay(currentInput);
}

// ── Handle Operator ─────────────────────────────────────
// Highlight the active operator button
function highlightOperator(op) {
  document.querySelectorAll('.btn-op').forEach(b => b.classList.remove('active-op'));
  if (op) {
    const map = { '+': 'btn-add', '−': 'btn-sub', '×': 'btn-mul', '÷': 'btn-div' };
    const el  = document.getElementById(map[op]);
    if (el) el.classList.add('active-op');
  }
}

function handleOperator(op) {
  // If we already have a previous input and operator, chain the calculation
  if (previousInput !== '' && currentInput !== '' && !shouldReset) {
    calculate();
  }

  if (currentInput !== '') {
    previousInput = currentInput;
    currentInput  = '';
  }

  operator     = op;
  shouldReset  = false;
  highlightOperator(op);
  updateExpression(`${previousInput} ${op}`);
}

// ── Perform Calculation ─────────────────────────────────
function calculate() {
  if (previousInput === '' || currentInput === '' || operator === null) return;

  const a = parseFloat(previousInput);
  const b = parseFloat(currentInput);
  let result;

  // Core arithmetic — the logical operations
  switch (operator) {
    case '+': result = a + b; break;
    case '−': result = a - b; break;
    case '×': result = a * b; break;
    case '÷':
      if (b === 0) {
        showError('Cannot divide by 0');
        return;
      }
      result = a / b;
      break;
    default:  return;
  }

  // Round off floating-point errors (e.g. 0.1 + 0.2 = 0.30000...004)
  result = parseFloat(result.toPrecision(12));

  updateExpression(`${previousInput} ${operator} ${currentInput} =`);
  updateDisplay(result);

  previousInput = String(result);
  currentInput  = '';
  operator      = null;
  shouldReset   = true;

  highlightOperator(null);
}

// ── Clear All ───────────────────────────────────────────
function clearAll() {
  currentInput  = '';
  previousInput = '';
  operator      = null;
  shouldReset   = false;
  updateDisplay('0');
  updateExpression('');
  highlightOperator(null);
}

// ── Delete Last Character ───────────────────────────────
function deleteLast() {
  if (shouldReset) return;
  currentInput = currentInput.slice(0, -1);
  updateDisplay(currentInput || '0');
}

// ── Error Feedback ──────────────────────────────────────
function showError(msg) {
  updateDisplay(msg);
  resultEl.classList.add('error-text');
  displayEl.classList.add('error');
  setTimeout(() => {
    resultEl.classList.remove('error-text');
    displayEl.classList.remove('error');
    clearAll();
  }, 1500);
}

// ── Button Press Animation ──────────────────────────────
function animateBtn(el) {
  el.classList.remove('pressed');
  void el.offsetWidth; // reflow
  el.classList.add('pressed');
}

// ── Button Click Events (Event Delegation) ─────────────
document.querySelector('.btn-grid').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  animateBtn(btn);

  const action = btn.dataset.action;
  const value  = btn.dataset.value;

  // Route to the correct handler
  switch (action) {
    case 'num':    appendDigit(value);  break;
    case 'dot':    appendDot();         break;
    case 'sign':   toggleSign();        break;
    case 'op':     handleOperator(value); break;
    case 'equals': calculate();         break;
    case 'delete': deleteLast();        break;
    case 'clear':  clearAll();          break;
  }
});

// ── Keyboard Support ────────────────────────────────────
// Maps keyboard keys to button IDs for visual feedback
const KEY_MAP = {
  '0': 'btn-0',   '1': 'btn-1',   '2': 'btn-2',   '3': 'btn-3',
  '4': 'btn-4',   '5': 'btn-5',   '6': 'btn-6',   '7': 'btn-7',
  '8': 'btn-8',   '9': 'btn-9',   '.': 'btn-dot',
  '+': 'btn-add', '-': 'btn-sub', '*': 'btn-mul',  '/': 'btn-div',
  'Enter': 'btn-eq',    '=': 'btn-eq',
  'Backspace': 'btn-delete',
  'Escape': 'btn-clear',
  'Delete': 'btn-clear',
};

document.addEventListener('keydown', (e) => {
  const btnId = KEY_MAP[e.key];
  if (!btnId) return;

  e.preventDefault(); // prevent browser shortcuts (e.g. / opening find)

  const btn = document.getElementById(btnId);
  if (btn) {
    animateBtn(btn);
    btn.click(); // trigger the same click handler
  }
});

// ── Initial State ────────────────────────────────────────
clearAll();
