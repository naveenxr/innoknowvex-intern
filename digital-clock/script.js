/* =========================================================
   ANIMATED DIGITAL CLOCK — script.js
   Concepts: Date object, requestAnimationFrame, Web Audio API
   ========================================================= */

// ── DOM References ────────────────────────────────────────
const hoursEl    = document.getElementById('hours');
const minutesEl  = document.getElementById('minutes');
const secondsEl  = document.getElementById('seconds');
const ampmEl     = document.getElementById('ampmBadge');
const dayNameEl  = document.getElementById('dayName');
const fullDateEl = document.getElementById('fullDate');
const greetingEl = document.getElementById('greeting');
const progressEl = document.getElementById('progressBar');
const timezoneEl = document.getElementById('timezone');
const secBlockEl = document.getElementById('secBlock');
const bodyEl     = document.getElementById('body');
const toggleBtn  = document.getElementById('themeToggle');
const toggleIcon = document.getElementById('toggleIcon');

// ── Helpers ───────────────────────────────────────────────
const pad = n => String(n).padStart(2, '0');

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function getGreeting(h) {
  if (h >= 5  && h < 12) return '🌅 Good Morning';
  if (h >= 12 && h < 17) return '☀️ Good Afternoon';
  if (h >= 17 && h < 21) return '🌇 Good Evening';
  return '🌙 Good Night';
}

// ── Clock Logic ───────────────────────────────────────────
// Track previously displayed second — only update DOM when second changes
let lastSec = -1;

function updateClock() {
  const now = new Date();

  const h24  = now.getHours();
  const min  = now.getMinutes();
  const sec  = now.getSeconds();
  const h12  = h24 % 12 || 12;
  const isPM = h24 >= 12;

  // Update time digits
  hoursEl.textContent   = pad(h12);
  minutesEl.textContent = pad(min);
  secondsEl.textContent = pad(sec);
  ampmEl.textContent    = isPM ? 'PM' : 'AM';

  // Trigger glow on seconds block
  secBlockEl.classList.remove('tick');
  void secBlockEl.offsetWidth;
  secBlockEl.classList.add('tick');

  // Progress bar
  progressEl.style.width = ((sec / 59) * 100) + '%';

  // Date and greeting
  dayNameEl.textContent  = DAYS[now.getDay()];
  fullDateEl.textContent = `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  greetingEl.textContent = getGreeting(h24);

  // Timezone
  timezoneEl.textContent = '🌍 ' + Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Tick sound
  playTick();
}

// ── requestAnimationFrame loop ────────────────────────────
// Runs every browser frame (~60fps). Only triggers updateClock
// when the second actually changes — more reliable than setInterval.
function clockLoop() {
  const sec = new Date().getSeconds();
  if (sec !== lastSec) {
    lastSec = sec;
    updateClock();
  }
  requestAnimationFrame(clockLoop);  // schedule next frame
}

// Start the loop immediately
requestAnimationFrame(clockLoop);

// ── Dark / Light Mode Toggle ──────────────────────────────
let isDark = true;

toggleBtn.addEventListener('click', () => {
  isDark = !isDark;
  if (isDark) {
    bodyEl.classList.replace('light', 'dark');
    toggleIcon.textContent = '🌙';
  } else {
    bodyEl.classList.replace('dark', 'light');
    toggleIcon.textContent = '☀️';
  }
});

// ── Tick Sound — Web Audio API ────────────────────────────
let audioCtx = null;
let isMuted  = false;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Unlock AudioContext on first user interaction (browser policy)
document.addEventListener('click',   initAudio);
document.addEventListener('keydown', initAudio);

function playTick() {
  if (isMuted || !audioCtx || audioCtx.state !== 'running') return;
  try {
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1100, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(650, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.22, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.07);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (_) {}
}

// ── Mute Button ───────────────────────────────────────────
const muteBtn = document.createElement('button');
muteBtn.className = 'theme-toggle';
muteBtn.title     = 'Mute / Unmute tick sound';
muteBtn.style.cssText = 'top:24px; left:24px; right:auto;';
muteBtn.textContent   = '🔔';
document.body.appendChild(muteBtn);

muteBtn.addEventListener('click', () => {
  initAudio();
  isMuted = !isMuted;
  muteBtn.textContent = isMuted ? '🔕' : '🔔';
});

// ── Floating Particles ────────────────────────────────────
(function spawnParticles() {
  const wrap = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p  = document.createElement('div');
    p.className = 'particle';
    p.style.left = (Math.random() * 100) + 'vw';
    const sz = Math.random() * 3 + 1;
    p.style.width  = sz + 'px';
    p.style.height = sz + 'px';
    p.style.setProperty('--dur',   (Math.random() * 12 + 8) + 's');
    p.style.setProperty('--delay', (Math.random() * 10)     + 's');
    wrap.appendChild(p);
  }
})();
