// Pi Flash - single-player memory mini-game for webxdc
// Core loop: START -> SHOW_DIGITS -> HIDE_DIGITS -> INPUT -> CHECK -> NEXT_ROUND or GAME_OVER
// Author: you

(function () {
  'use strict';

  // ------------------------------
  // Constants & Config
  // ------------------------------
  // Source with decimal, then converted to digits-only for gameplay (simpler UX: type digits only)
  const PI_SOURCE = (
    '3.14159265358979323846264338327950288419716939937510' +
    '58209749445923078164062862089986280348253421170679' +
    '82148086513282306647093844609550582231725359408128' +
    '48111745028410270193852110555964462294895493038196' +
    '44288109756659334461284756482337867831652712019091' +
    '45648566923460348610454326648213393607260249141273' +
    '72458700660631558817488152092096282925409171536436'
  ); // > 200 chars including one dot
  const PI_DIGITS = PI_SOURCE.replace(/\./g, ''); // digits only: 3141592...

  const STATES = {
    START: 'START',
    SHOW: 'SHOW_DIGITS',
    HIDE: 'HIDE_DIGITS',
    INPUT: 'INPUT',
    CHECK: 'CHECK',
    GAME_OVER: 'GAME_OVER',
  };

  const INPUT_BASE_TIME = 10; // seconds
  const INPUT_PER_DIGIT = 1; // + seconds per digit
  const LIVES_MAX = 3;
  const MILESTONES = [10, 20, 30];

  // ------------------------------
  // Elements
  // ------------------------------
  const el = {
    screenStart: document.getElementById('screen-start'),
    screenRound: document.getElementById('screen-round'),
    screenGameOver: document.getElementById('screen-gameover'),
    btnStart: document.getElementById('btn-start'),
  dbgLevel: document.getElementById('debug-level'),
  dbgInc: document.getElementById('dbg-inc'),
  dbgDec: document.getElementById('dbg-dec'),
  // submit button removed
    btnRetry: document.getElementById('btn-retry'),
  digits: document.getElementById('digits'),
  pad: document.getElementById('pad'),
  // hint removed
    lives: document.getElementById('lives'),
    score: document.getElementById('score'),
  timerBar: document.getElementById('timer-bar'),
  timerText: document.getElementById('timer-text'),
  // mode pill removed
  lifeOverlay: document.getElementById('life-overlay'),
  matrixBg: document.getElementById('matrix-bg'),
  };

  // ------------------------------
  // Game State
  // ------------------------------
  const state = {
    phase: STATES.START,
    round: 1, // number of digits to show this round
    lives: LIVES_MAX,
    score: 0, // number of digits remembered correctly overall (max streak)
    best: Number(localStorage.getItem('pi_flash_best') || 0),
    shown: '', // the digits shown for the round
  typed: '', // the digits typed via keypad
  typedIndex: 0, // current index for per-digit validation
    timerId: null,
    timeLeft: 0,
  // webxdc integration state
  lastSentScore: null,
  lastSentAt: 0,
  globalBestScore: 0,
  globalBestPlayer: '',
  globalBestAddr: '',
  };

  // ------------------------------
  // Utility functions
  // ------------------------------
  function setScreen(activeId) {
    const ids = ['screen-start', 'screen-round', 'screen-gameover'];
    ids.forEach((id) => {
      document.getElementById(id).classList.toggle('active', id === activeId);
    });
  }

  function updateHUD() {
  el.lives.textContent = '❤️'.repeat(state.lives) + '🖤'.repeat(LIVES_MAX - state.lives);
  // change score icon based on milestone tier
  let icon = '🔢';
  if (state.score >= 30) icon = '🥇';
  else if (state.score >= 20) icon = '🥈';
  else if (state.score >= 10) icon = '🥉';
  el.score.textContent = `${icon} ${state.score}`;
  // timer progress bar
  const total = state._timeTotal || 0;
  const left = Math.max(0, state.timeLeft);
  const pct = total > 0 ? (left / total) * 100 : 0;
  if (el.timerBar) el.timerBar.style.width = `${pct}%`;
  if (el.timerText) el.timerText.textContent = left > 0 ? `${left}s` : '—';
  }

  function getRoundDigits(n) {
    // Take first n digits (no decimal point)
    return PI_DIGITS.slice(0, n);
  }

  function clearTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function startTimer(seconds, onExpire) {
    clearTimer();
  state._timeTotal = Math.max(0, Math.floor(seconds));
  state.timeLeft = state._timeTotal;
    updateHUD();
    state.timerId = setInterval(() => {
      state.timeLeft -= 1;
      updateHUD();
      if (state.timeLeft <= 0) {
        clearTimer();
        onExpire?.();
      }
    }, 1000);
  }

  function milestoneClass(score) {
  if (score >= 30) return 'milestone-gold';
  if (score >= 20) return 'milestone-silver';
  if (score >= 10) return 'milestone-bronze';
    return '';
  }

  // Apply liquid style uniformly to all keypad buttons
  function updatePadLiquidStyles(){
    try {
      const buttons = el.pad?.querySelectorAll('.pad-btn');
      if(!buttons) return;
      buttons.forEach(b=> b.classList.add('liquid-btn'));
    } catch(_) { /* ignore */ }
  }

  function sizeTier(len) {
    if (len >= 40) return 'size-5';
    if (len >= 30) return 'size-4';
    if (len >= 20) return 'size-3';
    if (len >= 14) return 'size-2';
    return ''; 
  }

  function formatWithPiDot(s) {
    if (!s) return '';
    if (s.length === 1) return `${s}.`;
    return `${s[0]}.${s.slice(1)}`;
  }

  function renderShowWithBoldLast(s) {
    if (!s) return '';
    if (s.length === 1) {
      return `<strong class="new-digit">${s}</strong>.`;
    }
    const left = s.slice(0, -1);
    const last = s.slice(-1);
    const leftWithDot = `${left[0]}.${left.slice(1)}`;
    return `${leftWithDot}<strong class="new-digit">${last}</strong>`;
  }

  function autoScaleDigits() {
    const box = el.digits;
    if (!box) return;
    // store original size in dataset
    if (!box.dataset.baseSize) {
      const cs = getComputedStyle(box);
      box.dataset.baseSize = cs.fontSize;
    }
    // reset to base size
    box.style.fontSize = box.dataset.baseSize || '';
    // no-op now with wrapping approach; keep function for calls
  }

  function announceMilestoneIfAny() {
    const s = state.score;
    if (MILESTONES.includes(s)) {
  const tier = s === 10 ? T('milestone10') : s === 20 ? T('milestone20') : T('milestone30');
      el.digits.classList.add('flash');
      setTimeout(() => el.digits.classList.remove('flash'), 600);
      spawnFloatEmoji('🏆');
    }
  }

  function spawnFloatEmoji(emoji = '👍') {
    try {
      const origin = el.pad || el.digits || document.body;
      const rect = origin.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const elSpan = document.createElement('span');
      elSpan.className = 'float-emoji';
      elSpan.textContent = emoji;
      elSpan.style.left = `${x}px`;
      elSpan.style.top = `${y}px`;
      document.body.appendChild(elSpan);
      setTimeout(() => elSpan.remove(), 800);
    } catch (_) { /* ignore */ }
  }

  // Feedback helpers
  function vibrate(pattern){
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch(_) {}
  }
  function pulsePad(btn, cls){
    if(!btn) return;
    btn.classList.remove('pressed','ok','fail');
    void btn.offsetWidth; // force reflow
    btn.classList.add(cls);
    setTimeout(()=> btn.classList.remove(cls), 500);
  }

  // Confetti helper (simple DOM based)
  function runConfetti(duration = 2200, cb) {
    const layer = document.createElement('div');
    layer.className = 'confetti-layer';
    const colors = ['#f87171','#fb923c','#fbbf24','#34d399','#60a5fa','#a78bfa','#f472b6','#2dd4bf'];
    const pieces = 70;
    for (let i=0;i<pieces;i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      const color = colors[i % colors.length];
      p.style.background = color;
      const startX = (Math.random()*100); // vw
      const drift = (Math.random()*40 - 20); // -20..20 vw
      p.style.setProperty('--x', startX+'vw');
      p.style.setProperty('--x-end', (startX+drift)+'vw');
      const rot = Math.random()*180 - 90;
      const rotEnd = rot + (Math.random()*720 - 360);
      p.style.setProperty('--r', rot+'deg');
      p.style.setProperty('--r-end', rotEnd+'deg');
      const dur = 2.6 + Math.random()*1.5;
      p.style.setProperty('--dur', dur+'s');
      p.classList.add('animate');
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(()=>{
      layer.remove();
      cb && cb();
    }, duration);
  }

  // ------------------------------
  // webxdc score integration
  // Aligns with Pac-1D / CrappyBird update schema
  // ------------------------------
  function sendFinalScore(rawScore){
    try {
      if(!window.webxdc || typeof window.webxdc.sendUpdate !== 'function') return;
      let score = Math.floor(Number(rawScore));
      if(!Number.isFinite(score) || score <= 0) return;
      if(score > 100000000) score = 100000000; // clamp upper bound
      // dedupe: same score within 2s
      const now = Date.now();
      if(state.lastSentScore === score && (now - state.lastSentAt) < 2000) return;
      // ensure identity available; if not, delay slightly
      if(!window.webxdc.selfAddr || !window.webxdc.selfName){
        setTimeout(()=> sendFinalScore(score), 300);
        return;
      }
      const info = `${window.webxdc.selfName} scored ${score}`;
      const payload = {
        score,
        byAddr: window.webxdc.selfAddr,
        byName: window.webxdc.selfName
      };
      window.webxdc.sendUpdate({
        payload,
        info,
        summary: 'Score:' + score
      });
      state.lastSentScore = score;
      state.lastSentAt = now;
    } catch(_) { /* ignore send issues */ }
  }

  function handleIncomingUpdate(update){
    try {
      if(!update || !update.payload) return;
      const p = update.payload;
      const incomingScore = Math.floor(Number(p.score));
      if(!Number.isFinite(incomingScore) || incomingScore <= 0) return;
      if(incomingScore > state.globalBestScore){
        state.globalBestScore = incomingScore;
        state.globalBestPlayer = p.byName || p.byAddr || 'Player';
        state.globalBestAddr = p.byAddr || '';
      }
      // update local best if this user (defensive check)
      if(p.byAddr && window.webxdc?.selfAddr && p.byAddr === window.webxdc.selfAddr){
        if(incomingScore > state.best){
          state.best = incomingScore;
          localStorage.setItem('pi_flash_best', String(state.best));
        }
      }
    } catch(_) { /* ignore */ }
  }

  function initScoreUpdates(){
    try {
      if(window.webxdc && typeof window.webxdc.setUpdateListener === 'function'){
        window.webxdc.setUpdateListener((update) => {
          handleIncomingUpdate(update);
        });
      }
    } catch(_) { /* ignore */ }
  }

  // ------------------------------
  // State transitions
  // ------------------------------
  function toStart() {
    state.phase = STATES.START;
  state.round = 3; // start with 3 digits -> displays as 3.14
    state.lives = LIVES_MAX;
    state.score = 0;
    state.shown = '';
  state.typedIndex = 0;
  if (el.hint) el.hint.textContent = '';
  state.typed = '';
  el.digits.textContent = '';
  // reset overlay hearts
  if (el.lifeOverlay) {
    el.lifeOverlay.querySelectorAll('.life-heart').forEach((h,i) => {
      h.classList.remove('losing','lost');
    });
    el.lifeOverlay.classList.remove('active');
  }
    document.querySelector('.game').classList.remove('milestone-bronze', 'milestone-silver', 'milestone-gold');
  document.querySelector('.game').classList.remove('phase-memorize', 'phase-input');
    setScreen('screen-start');
    clearTimer();
    state.timeLeft = 0;
  updateHUD();
  }

  function toShowDigits() {
    state.phase = STATES.SHOW;
    setScreen('screen-round');
  const game = document.querySelector('.game');
  game.classList.add('phase-memorize');
  game.classList.remove('phase-input');
  // ensure liquid styling reflects upcoming round immediately
  updatePadLiquidStyles();
  // mode pill removed
  state.typed = '';
  state.typedIndex = 0;
  el.digits.textContent = '';
  // submit removed

  state.shown = getRoundDigits(state.round);
  // Show with the new (last) digit in bold and a dot after the first 3
  el.digits.innerHTML = renderShowWithBoldLast(state.shown);
  // apply size tier
  el.digits.classList.remove('size-2','size-3','size-4','size-5');
  const tier = sizeTier(state.round);
  if (tier) el.digits.classList.add(tier);
  requestAnimationFrame(autoScaleDigits);
  if (el.hint) el.hint.textContent = `Round ${state.round}: Remember these digits.`;

    // Show for a short delay: proportional to digits but capped
    const showMs = Math.min(5000, 800 + state.round * 250);
    setTimeout(toHideDigits, showMs);
  }

  function toHideDigits() {
    state.phase = STATES.HIDE;
  el.digits.textContent = '······';
  if (el.hint) el.hint.textContent = 'Now type the digits';

    // Move to input state shortly after hiding
  setTimeout(toInput, 300);
  }

  function toInput() {
    state.phase = STATES.INPUT;
  // submit removed; input is via keypad only
  const game = document.querySelector('.game');
  game.classList.remove('phase-memorize');
  game.classList.add('phase-input');
  // mode pill removed

  const time = INPUT_BASE_TIME + INPUT_PER_DIGIT * state.round;
    startTimer(time, () => {
      // Treat as wrong if time expires
      handleGuess(false);
    });
  }

  function toCheck() {
    state.phase = STATES.CHECK;
  const ok = state.typed === state.shown;
  handleGuess(ok);
  }

  function toNextRound() {
    state.round += 1;
    state.score = Math.max(state.score, state.round - 1); // score is max digits remembered
    document.querySelector('.game').classList.remove('milestone-bronze', 'milestone-silver', 'milestone-gold');
    const cls = milestoneClass(state.score);
    if (cls) document.querySelector('.game').classList.add(cls);
    const reachedMilestone = MILESTONES.includes(state.score);
  updatePadLiquidStyles();
    if (reachedMilestone && state.score === 10) {
      // celebrate first milestone with confetti, then continue
      runConfetti(2300, () => {
        announceMilestoneIfAny();
        toShowDigits();
      });
    } else {
      announceMilestoneIfAny();
      toShowDigits();
    }
    updateHUD();
  }

  function toGameOver() {
    state.phase = STATES.GAME_OVER;
    clearTimer();
  // Keep score as last successful length (already set on success)
    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem('pi_flash_best', String(state.best));
    }
    setScreen('screen-gameover');
  document.querySelector('.game').classList.remove('phase-memorize', 'phase-input');
  document.getElementById('final-score').textContent = `🔢 ${state.score}`;
  document.getElementById('best-score').textContent = `🏅 ${state.best}`;
  // Emit standardized score update (one per completed run)
  sendFinalScore(state.score);
  }

  function handleGuess(isCorrect) {
    clearTimer();
  // submit removed

    if (isCorrect) {
      if (el.hint) el.hint.textContent = 'Correct! +1 digit';
  spawnFloatEmoji('👍');
  setTimeout(() => toNextRound(), 800);
    } else {
      const prevLives = state.lives;
      state.lives -= 1;
  if (el.hint) el.hint.textContent = `Wrong. It was ${state.shown}`;
  vibrate([40,40,60]);
      updateHUD();
      // Trigger life loss overlay animation for the heart that was just lost
      try {
        if (el.lifeOverlay) {
          el.lifeOverlay.classList.add('active');
          const lostIndex = prevLives; // hearts numbered 1..3
          const heartEl = el.lifeOverlay.querySelector(`.life-heart[data-slot="${lostIndex}"]`);
          if (heartEl) {
            heartEl.classList.remove('lost');
            heartEl.classList.add('losing');
            setTimeout(() => {
              heartEl.classList.remove('losing');
              heartEl.classList.add('lost');
            }, 620);
          }
          // hide overlay after delay unless game over to allow cumulative view
          setTimeout(() => {
            if (state.lives > 0) {
              el.lifeOverlay.classList.remove('active');
            }
          }, 950);
        }
      } catch(_) { /* ignore */ }
      if (state.lives <= 0) {
        // wait for heart animation to finish before showing game over
        setTimeout(() => {
          toGameOver();
          // keep overlay active a touch longer for dramatic effect
          setTimeout(()=> el.lifeOverlay?.classList.remove('active'), 500);
        }, 700);
      } else {
        // retry same round (do not increase round) after animation wraps
        setTimeout(toShowDigits, 900);
      }
    }
  }
  
    // ------------------------------
  // Matrix Background
  // ------------------------------
  function setupMatrix() {
    const chars = ['π', '1', '4', '1', '5', '9', '2', '6', '5', '3', '5'];
    const columns = Math.floor(window.innerWidth / 30);

    for (let i = 0; i < columns; i++) {
      const span = document.createElement('span');
      span.className = 'matrix-char';
      span.textContent = chars[Math.floor(Math.random() * chars.length)];
      span.style.left = `${Math.random() * 100}vw`;
      span.style.animationDuration = `${Math.random() * 5 + 3}s`;
      span.style.animationDelay = `${Math.random() * 5}s`;
      el.matrixBg.appendChild(span);
    }
  }

  // ------------------------------
  // Event wiring
  // ------------------------------
  el.btnStart?.addEventListener('click', () => {
    // Use debug level if provided
    const v = Number(el.dbgLevel?.value ?? '');
    if (Number.isFinite(v) && v >= 1 && v <= PI_DIGITS.length) {
      state.round = Math.floor(v);
    } else {
      state.round = 3;
    }
    toShowDigits();
  });

  // Stepper controls for starting digits
  function clampStartValue(n){
    const min = Number(el.dbgLevel?.getAttribute('min')||1);
    const max = Number(el.dbgLevel?.getAttribute('max')||PI_DIGITS.length);
    if (!Number.isFinite(n)) n = 1;
    return Math.min(Math.max(n, min), max);
  }
  function adjustStart(delta){
    if(!el.dbgLevel) return;
    const cur = Number(el.dbgLevel.value || '0');
    const next = clampStartValue(cur + delta);
    el.dbgLevel.value = String(next);
  }
  el.dbgInc?.addEventListener('click', () => adjustStart(1));
  el.dbgDec?.addEventListener('click', () => adjustStart(-1));
  // Keyboard accessibility: arrow up/down when focused on number input
  el.dbgLevel?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); adjustStart(1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); adjustStart(-1); }
  });

  // Apply static translations to elements with data-i18n / data-i18n-label
  function applyTranslations(){
    try {
      document.querySelectorAll('[data-i18n]').forEach(node => {
        const key = node.getAttribute('data-i18n');
        if(key) node.textContent = T(key);
      });
      document.querySelectorAll('[data-i18n-label]').forEach(node => {
        const key = node.getAttribute('data-i18n-label');
        const txt = T(key);
        if(key && txt){
          node.setAttribute('aria-label', txt);
          node.setAttribute('title', txt);
        }
      });
    } catch(_) {}
  }

  // Keypad handling
  el.pad?.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (state.phase !== STATES.INPUT) return;
  const d = t.getAttribute('data-digit');
  if (d) {
      pulsePad(t,'pressed');
      // Per-digit validation: compare to expected digit
      const expected = state.shown[state.typedIndex];
      if (d === expected) {
  vibrate(20);
  state.typed += d;
  state.typedIndex += 1;
  el.digits.textContent = formatWithPiDot(state.typed);
  // keep size tier applied during input as well
  el.digits.classList.remove('size-2','size-3','size-4','size-5');
  const tier = sizeTier(state.typed.length);
  if (tier) el.digits.classList.add(tier);
  requestAnimationFrame(autoScaleDigits);
        // Completed all digits correctly -> success immediately
        if (state.typedIndex >= state.shown.length) {
          toCheck();
        }
      } else {
        pulsePad(t,'fail');
        vibrate([30,30,30]);
        // First mistake -> immediate failure
        toCheck();
      }
    }
  });

  el.btnRetry?.addEventListener('click', () => {
    toStart();
  });

  // (Chat message UI and listeners removed; game sends an optional status on game over only.)

  // ------------------------------
  // Initialize
  // ------------------------------
  function initLiquidPointerEffects(){
    const rootTargets = [document.querySelector('.game')];
    const btnTargets = () => Array.from(document.querySelectorAll('.liquid-btn'));
    let rafId = null;
    let lastEvent = null;
    function process(){
      rafId = null;
      const e = lastEvent; if(!e) return;
      const x = e.clientX, y = e.clientY;
      // only update hovered button (closest) + container to cut style recalcs
      let targetBtns = [];
      const hovered = document.elementFromPoint(x,y);
      if(hovered && hovered.classList && hovered.classList.contains('liquid-btn')) {
        targetBtns.push(hovered);
      }
      if(targetBtns.length === 0){
        // fallback: none hovered -> skip per-button updates
      }
      [...rootTargets, ...targetBtns].forEach(elm => {
        if(!elm) return;
        const r = elm.getBoundingClientRect();
        const hx = ((x - r.left) / r.width) * 100;
        const hy = ((y - r.top) / r.height) * 100;
        elm.style.setProperty('--hx', hx.toFixed(1)+'%');
        elm.style.setProperty('--hy', hy.toFixed(1)+'%');
        const cx = hx - 50; const cy = hy - 50;
        elm.style.setProperty('--tilt-x', (cx * 0.18).toFixed(1)+'deg');
        elm.style.setProperty('--tilt-y', (-cy * 0.18).toFixed(1)+'deg');
      });
    }
    function onMove(e){
      lastEvent = e;
      if(rafId == null){ rafId = requestAnimationFrame(process); }
    }
    window.addEventListener('pointermove', onMove, { passive: true });
  }
  function detectLowSpec(){
    try {
      const nav = navigator || {};
      const cores = (nav.hardwareConcurrency||4);
      const mem = (nav.deviceMemory||4);
      const low = cores <= 4 || mem <= 4; // heuristic
      if(low) document.body.classList.add('perf-low');
    } catch(_) {}
  }
  applyTranslations();
  setupMatrix();
  detectLowSpec();
  initLiquidPointerEffects();
  initScoreUpdates();
  toStart();
})();
