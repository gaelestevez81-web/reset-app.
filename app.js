'use strict';
/* =========================================================
   RESET — calm daily wellness companion
   Vanilla JS, no build step. All data stays on the device.
   ========================================================= */

/* ---------- utilities ---------- */
const KEY = 'reset-app-v5';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = n => String(n).padStart(2, '0');
const dk = (d = new Date()) => { d = new Date(d); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const pd = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addD = (k, n) => { const d = pd(k); d.setDate(d.getDate() + n); return dk(d); };
const TODAY = () => dk();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (k, o = { weekday: 'short', day: 'numeric', month: 'short' }) => pd(k).toLocaleDateString('en-GB', o);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sum = a => a.reduce((x, y) => x + y, 0);
const avg = a => a.length ? sum(a) / a.length : 0;
const daysBack = (n, end = TODAY()) => Array.from({ length: n }, (_, i) => addD(end, i - n + 1));
const dow = k => pd(k).getDay();
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const val = s => ($(s)?.value ?? '');
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : (/(ch|sh|s|x)$/.test(w) ? 'es' : 's')}`;
const relDay = k => {
  if (!k) return 'Anytime';
  const t = TODAY();
  if (k === t) return 'Today';
  if (k === addD(t, 1)) return 'Tomorrow';
  if (k === addD(t, -1)) return 'Yesterday';
  return fmt(k);
};
const hours = h => { const H = Math.floor(h), M = Math.round((h - H) * 60); return !H ? `${M}m` : M ? `${H}h ${M}m` : `${H}h`; };

/* ---------- icons ---------- */
const svg = (p, fill) => `<svg viewBox="0 0 24 24" fill="${fill ? 'currentColor' : 'none'}" stroke="${fill ? 'none' : 'currentColor'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I = {
  home: svg('<path d="M3.5 10.5 12 3.5l8.5 7V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19z"/>'),
  plan: svg('<rect x="3.5" y="4.5" width="17" height="16" rx="3.5"/><path d="M3.5 9.5h17M8 2.8v3.4M16 2.8v3.4M9 15l2 2 4-4"/>'),
  health: svg('<path d="M12 20s-7.5-4.4-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.6 12 20 12 20z"/>'),
  growth: svg('<path d="M12 21v-8.5"/><path d="M12 12.5C12 8.4 9 5.5 4.5 5.5c0 4.3 3 7 7.5 7z"/><path d="M12 14.5c0-4.1 3-7 7.5-7 0 4.3-3 7-7.5 7z"/>'),
  progress: svg('<path d="M4 20h16"/><path d="M7 16v-4M12 16V6M17 16v-7"/>'),
  profile: svg('<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.4-3.6 4.2-5.5 7.5-5.5s6.1 1.9 7.5 5.5"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  check: svg('<path d="M5 12.5l4.2 4.2L19 7"/>'),
  left: svg('<path d="M15 5l-7 7 7 7"/>'),
  right: svg('<path d="M9 5l7 7-7 7"/>'),
  x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  drop: svg('<path d="M12 3.2s6.3 6.8 6.3 11.3a6.3 6.3 0 0 1-12.6 0C5.7 10 12 3.2 12 3.2z"/>'),
  dropFill: svg('<path d="M12 2.5s7 7.4 7 12.2a7 7 0 0 1-14 0C5 9.9 12 2.5 12 2.5z"/>', true),
  moon: svg('<path d="M19.5 14.6A8 8 0 1 1 9.4 4.5a6.5 6.5 0 0 0 10.1 10.1z"/>'),
  move: svg('<path d="M3 12h3.5l2.8-7 5 14 2.8-7H21"/>'),
  smile: svg('<circle cx="12" cy="12" r="8.5"/><path d="M8.7 14.3c.9 1.2 2 1.8 3.3 1.8s2.4-.6 3.3-1.8M9 9.6h.01M15 9.6h.01"/>'),
  food: svg('<path d="M6.5 3v7a2 2 0 0 0 2 2v9M10.5 3v7M6.5 3v0M17.5 21V3c-2.2 1-3.3 3.6-3.3 7.2 0 1.6 1 2.8 3.3 2.8"/>'),
  wind: svg('<path d="M3 8.5h10.5a2.75 2.75 0 1 0-2.7-3.2M3 15.5h14a2.75 2.75 0 1 1-2.7 3.2M3 12h6"/>'),
  book: svg('<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/>'),
  pen: svg('<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>'),
  play: svg('<path d="M8 5.5v13l10.5-6.5z"/>', true),
  spark: svg('<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/>'),
  share: svg('<path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12"/>'),
  shuffle: svg('<path d="M4 7h3.5c4.5 0 4.5 10 9 10H20M4 17h3.5c1.5 0 2.5-1.1 3.3-2.6M13.2 9.6C14 8.1 15 7 16.5 7H20M17.5 4.5 20 7l-2.5 2.5M17.5 14.5 20 17l-2.5 2.5"/>'),
  edit: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
  target: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>'),
};

/* ---------- content (original copy) ---------- */
const QUOTES = [
  'Small steps, taken daily, become the path.',
  'You don’t have to do it all. Just do the next kind thing.',
  'Rest is part of the work.',
  'Progress, not perfection.',
  'Every day is a fresh page. Write gently.',
  'Your pace is the right pace.',
  'Show up for yourself the way you show up for others.',
  'Consistency is a quiet kind of courage.',
  'Breathe first. Then begin.',
  'Little by little, a little becomes a lot.',
  'You are allowed to start again — as many times as you need.',
  'Care for your body like it’s the only home you’ll ever have.',
  'Done with love beats done perfectly.',
  'One good choice makes the next one easier.',
  'Slow is smooth, and smooth is steady.',
  'Today, choose what future-you will thank you for.',
  'Make space for what matters.',
  'Celebrate the small wins. They add up.',
  'Water, movement, rest, kindness. Repeat.',
  'You’re not behind. You’re on your way.',
];
const PROMPTS = [
  'What would make today feel meaningful?',
  'What is one thing you are proud of this week?',
  'What drained your energy recently — and what restored it?',
  'Describe a small moment that made you smile today.',
  'What are you ready to let go of?',
  'How did you take care of yourself today?',
  'What does your ideal ordinary day look like?',
  'What is something you learned about yourself lately?',
  'Who made a difference in your life this week, and how?',
  'What is one habit you want to strengthen, and why?',
  'What are you looking forward to?',
  'If your body could talk, what would it ask you for?',
  'Write about a challenge you handled better than you expected.',
  'What does “enough” look like for you right now?',
  'What would you tell a friend who felt the way you feel today?',
  'Which part of your routine feels most like “you”?',
  'Name three things that went well today and why.',
  'What boundary would make your life easier?',
  'Where did you feel most at peace this week?',
  'What is a dream you have quietly been carrying?',
];
const dayNum = k => Math.floor(pd(k).getTime() / 864e5);
const quoteFor = k => QUOTES[dayNum(k) % QUOTES.length];
const promptFor = (k, shift = 0) => PROMPTS[(dayNum(k) + shift) % PROMPTS.length];

const MOODS = [
  { v: 1, e: '😞', t: 'Low' }, { v: 2, e: '😕', t: 'Meh' }, { v: 3, e: '😐', t: 'Okay' },
  { v: 4, e: '🙂', t: 'Good' }, { v: 5, e: '😄', t: 'Great' },
];
const SLEEPQ = ['😫', '😴', '😐', '🙂', '🤩'];
const OLD_HCOLORS = ['#5B7B6A', '#5E9BC4', '#8A80C2', '#D4855A', '#CF9E3E', '#B0789A', '#4F9A94', '#C0574B'];
const HCOLORS = ['#7A9E68', '#7FA8B8', '#9B94BC', '#C99B6E', '#C9A867', '#A98A9C', '#6FA39A', '#C08478'];
const EMOJIS = ['💧', '🚶', '🏃', '💪', '🧘', '🤸', '🚴', '🏊', '📖', '✍️', '🥗', '🍎', '😴', '🛏️', '🌿', '☀️', '🧠', '🎵', '🎤', '📵', '🙏', '🦷', '🧹', '🐾'];
const ACTIVITIES = [['walk', '🚶', 'Walk'], ['run', '🏃', 'Run'], ['yoga', '🧘', 'Yoga'], ['strength', '💪', 'Strength'], ['cycle', '🚴', 'Cycling'], ['dance', '💃', 'Dance'], ['stretch', '🤸', 'Stretch'], ['other', '✨', 'Other']];
const AREAS = [['health', '💪', 'Health', '#C99B6E'], ['mind', '🧠', 'Mind', '#9B94BC'], ['work', '💼', 'Work', '#6E9AAA'], ['love', '❤️', 'Relationships', '#C08478'], ['money', '💰', 'Money', '#C9A867'], ['personal', '🌱', 'Personal', '#7A9E68']];
const area = id => AREAS.find(a => a[0] === id) || AREAS[5];
const MEALS = [['breakfast', '🥣', 'Breakfast'], ['lunch', '🥗', 'Lunch'], ['dinner', '🍲', 'Dinner'], ['snacks', '🍎', 'Snacks']];
const ROUTINE_META = { morning: ['☀️', 'Morning'], day: ['🌤️', 'Day'], evening: ['🌙', 'Evening'] };
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/* ---------- state ---------- */
function fresh() {
  const t = TODAY();
  const step = (title, mins) => ({ id: uid(), title, mins });
  return {
    v: 5, created: t,
    profile: { name: '', waterGoal: 8, sleepGoal: 8, moveGoal: 30, kcalGoal: 2000, proteinGoal: 90, carbGoal: 230, fatGoal: 70, theme: 'auto', accent: 'sage', onboarded: false },
    tasks: [], habits: [], habitLog: {},
    routines: {
      morning: [step('Glass of water', 1), step('Gentle stretch', 5), step('Set today’s intention', 2), step('Make the bed', 2)],
      day: [step('Midday walk', 15), step('Lunch away from screens', 20), step('Three deep breaths', 1)],
      evening: [step('Tidy up for 10 minutes', 10), step('Write in journal', 5), step('Screens off', 0), step('Read before sleep', 15)],
    },
    routineLog: {}, goals: [], water: {}, sleep: {}, moves: [], meals: {}, mood: {},
    journal: [], gratitude: {}, intention: {}, reading: [], vision: [], breaths: {},
    food: {}, foodRecent: [], mealPlan: {}, recipes: [], shopping: [], workouts: [], workoutLog: [], mobilityLog: [], practiceLog: [], selfcare: {},
    learning: [], courses: [], resources: [], readLog: [], affirmations: [], affFav: [], reframes: [], projects: [], ideas: [], skillsDone: [], skillNotes: [],
  };
}
const guessEmoji = t => {
  t = (t || '').toLowerCase();
  const map = [['water', '💧'], ['walk', '🚶'], ['run', '🏃'], ['workout', '💪'], ['gym', '💪'], ['move', '🤸'], ['stretch', '🤸'], ['read', '📖'], ['sleep', '😴'], ['medit', '🧘'], ['yoga', '🧘'], ['journal', '✍️'], ['write', '✍️'], ['sing', '🎤'], ['music', '🎵'], ['eat', '🥗'], ['fruit', '🍎'], ['phone', '📵'], ['pray', '🙏'], ['grat', '🙏'], ['clean', '🧹'], ['dog', '🐾']];
  return (map.find(([k]) => t.includes(k)) || [0, '✨'])[1];
};
function migrateOld(s) {
  let old = null;
  for (const k of ['reset-v3', 'reset-v2', 'reset-v1']) { try { old = JSON.parse(localStorage.getItem(k)); } catch (e) { } if (old) break; }
  if (!old) return false;
  try {
    (old.tasks || []).forEach(t => t && (t.t || t.title) && s.tasks.push({ id: uid(), title: t.t || t.title, date: t.date || '', time: '', priority: 'medium', note: '', done: !!t.done, created: TODAY() }));
    (old.habits || []).forEach((h, i) => {
      if (!h || !(h.t || h.title)) return;
      const id = uid(), hist = h.history || {};
      const dates = Object.keys(hist).filter(d => hist[d]).sort();
      dates.forEach(d => { (s.habitLog[d] = s.habitLog[d] || []).push(id); });
      s.habits.push({ id, title: h.t || h.title, emoji: guessEmoji(h.t || h.title), color: HCOLORS[i % HCOLORS.length], days: h.freq === 'Weekly' && h.days?.length ? h.days : [0, 1, 2, 3, 4, 5, 6], created: dates[0] && dates[0] < TODAY() ? dates[0] : TODAY() });
    });
    (old.goals || []).forEach(g => g && (g.t || g.title) && s.goals.push({ id: uid(), title: g.t || g.title, area: 'personal', deadline: '', steps: [], done: false, created: TODAY() }));
    const rec = old.records || {};
    (rec['Growth:Journal'] || []).forEach(r => s.journal.push({ id: uid(), date: r.date || TODAY(), prompt: '', text: [r.t, r.detail].filter(Boolean).join('\n\n') }));
    (rec['Growth:Vision Board'] || []).forEach((r, i) => s.vision.push({ id: uid(), text: r.t, area: AREAS[i % AREAS.length][0] }));
    if (rec['Profile:Personal Information']?.[0]?.t) s.profile.name = rec['Profile:Personal Information'][0].t;
  } catch (e) { console.warn('migration', e); }
  return true;
}
function seedHabits(s) {
  [['💧', 'Drink water'], ['🚶', 'Move for 20 minutes'], ['🧘', 'Stretch'], ['📖', 'Read 10 pages']].forEach(([e, t], i) =>
    s.habits.push({ id: uid(), title: t, emoji: e, color: HCOLORS[i], days: [0, 1, 2, 3, 4, 5, 6], created: TODAY() }));
}
function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { }
  if (!s || typeof s !== 'object') {
    s = fresh();
    if (!migrateOld(s) || !s.habits.length) { if (!s.habits.length) seedHabits(s); }
  }
  const f = fresh();
  for (const k in f) if (s[k] === undefined) s[k] = f[k];
  s.profile = { ...f.profile, ...s.profile };
  s.routines = { ...f.routines, ...s.routines };
  if ((s.v || 5) < 6) {
    s.habits.forEach(h => { const i = OLD_HCOLORS.indexOf(h.color); if (i >= 0) h.color = HCOLORS[i]; });
    Object.entries(s.meals || {}).forEach(([k, m]) => { MEALS.forEach(([id]) => { if ((m[id] || '').trim()) { const d = s.food[k] = s.food[k] || {}; (d[id] = d[id] || []).push({ id: uid(), name: m[id].trim(), kcal: 0, p: 0, c: 0, f: 0 }); } }); if (m.feel) (s.food[k] = s.food[k] || {}).feel = m.feel; });
    s.v = 6;
  }
  return s;
}
let S = load();
let saveT = null;
function save() { clearTimeout(saveT); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Could not save — storage is full'); } }
function saveSoon() { clearTimeout(saveT); saveT = setTimeout(save, 350); }
function commit() { save(); render(); }
addEventListener('pagehide', save);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); else render(); });

/* ---------- domain helpers ---------- */
const sched = (h, k) => h.days.includes(dow(k)) && k >= (h.created || '0');
const isDone = (h, k) => (S.habitLog[k] || []).includes(h.id);
const habitsFor = k => S.habits.filter(h => sched(h, k));
function toggleHabit(id, k) {
  const a = S.habitLog[k] = S.habitLog[k] || [];
  const i = a.indexOf(id);
  if (i >= 0) a.splice(i, 1); else a.push(id);
  return i < 0;
}
function streak(h) {
  let k = TODAY(), n = 0;
  if (!isDone(h, k)) k = addD(k, -1);
  for (let i = 0; i < 1000 && k >= h.created; i++) {
    if (sched(h, k)) { if (isDone(h, k)) n++; else break; }
    k = addD(k, -1);
  }
  return n;
}
function bestStreak(h) {
  let best = 0, cur = 0, k = h.created, t = TODAY();
  for (let i = 0; i < 2000 && k <= t; i++) {
    if (sched(h, k)) { if (isDone(h, k)) { cur++; best = Math.max(best, cur); } else if (k !== t) cur = 0; }
    k = addD(k, 1);
  }
  return best;
}
const tasksOn = k => S.tasks.filter(x => x.date === k);
const routineDone = (rk, k) => (S.routineLog[k]?.[rk]) || [];
const currentRoutine = () => { const h = new Date().getHours(); return h < 11 ? 'morning' : h < 17 ? 'day' : 'evening'; };
const moveMins = k => sum(S.moves.filter(m => m.date === k).map(m => +m.mins || 0));
function dayScore(k) {
  const hs = habitsFor(k), ts = tasksOn(k);
  const wg = S.profile.waterGoal || 8;
  const done = hs.filter(h => isDone(h, k)).length + ts.filter(t => t.done).length + Math.min(1, (S.water[k] || 0) / wg);
  const total = hs.length + ts.length + 1;
  return done / total;
}

/* ---------- theme ---------- */
const mq = matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  const p = S.profile, dark = p.theme === 'dark' || (p.theme === 'auto' && mq.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.accent = p.accent || 'sage';
  $$('meta[name="theme-color"]').forEach(m => m.setAttribute('content', dark ? '#171A16' : '#F7F2EA'));
}
mq.addEventListener?.('change', applyTheme);

/* ---------- router ---------- */
const TABS = [['home', 'Home', I.home], ['plan', 'Plan', I.plan], ['health', 'Health', I.health], ['growth', 'Growth', I.growth], ['progress', 'Progress', I.progress], ['profile', 'Profile', I.profile]];
const route = () => { const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean); return { tab: p[0] || 'home', sub: p[1] || '', id: p[2] || '' }; };
const go = h => { location.hash = '#/' + h; };
let lastPath = '';
addEventListener('hashchange', () => { closeSheet(true); render(); });

const ui = { planSeg: 'tasks', taskFilter: 'today', routine: null, rEdit: false, calMonth: null, selDay: null, prange: 7, foodDay: null, writeId: null, promptShift: 0 };

function render() {
  applyTheme();
  const r = route();
  const path = r.tab + '/' + r.sub + '/' + r.id;
  const scr = $('#screen');
  const fn = SCREENS[r.tab] || SCREENS.home;
  scr.innerHTML = fn(r) + fabFor(r);
  if (path !== lastPath) {
    scr.classList.remove('enter'); void scr.offsetWidth; scr.classList.add('enter');
    window.scrollTo(0, 0);
    lastPath = path;
  }
  $('#tabbar').innerHTML = TABS.map(([id, label, ic]) => `<button class="tab ${r.tab === id ? 'on' : ''}" data-a="tab" data-to="${id}" aria-label="${label}"><span class="tic">${ic}</span><span>${label}</span></button>`).join('');
}

/* ---------- shared UI pieces ---------- */
function ring(pct, size = 116, stroke = 11, color = 'var(--accent)', label = '') {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, p = clamp(pct, 0, 1);
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--bg2)" stroke-width="${stroke}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - p)).toFixed(2)}" opacity="${p > 0 ? 1 : 0}"/></svg><div class="ring-label">${label}</div></div>`;
}
const back = (to, label) => `<div class="topbar"><button class="backbtn" data-a="go" data-to="${to}">${I.left}${esc(label)}</button></div>`;
const head = (eyebrow, title, sub) => `${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}<h1 class="title">${title}</h1>${sub ? `<p class="subtitle">${sub}</p>` : ''}`;
const emptyState = (e, t) => `<div class="empty"><div class="e">${e}</div>${t}</div>`;
const checkBtn = (on, a, attrs) => `<button class="check ${on ? 'on' : ''}" data-a="${a}" ${attrs} aria-label="Toggle">${I.check}</button>`;
const softOf = c => `color-mix(in srgb, ${c} 16%, var(--card))`;

function bars(vals, labels, { color = 'var(--accent)', goal = null, max = null, h = 130, fmtv = v => v } = {}) {
  const W = 320, H = h, pb = 20, pt = 14, n = vals.length;
  const mx = max || Math.max(goal || 0, ...vals, 1) * 1.08;
  const bw = W / n, barW = Math.min(24, bw * .62), ih = H - pt - pb;
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">`;
  vals.forEach((v, i) => {
    const x = i * bw + (bw - barW) / 2, bh = ih * (v / mx);
    s += `<rect x="${x}" y="${pt}" width="${barW}" height="${ih}" rx="${Math.min(7, barW / 2)}" fill="var(--bg2)"/>`;
    if (v > 0) s += `<rect x="${x}" y="${pt + ih - Math.max(bh, 4)}" width="${barW}" height="${Math.max(bh, 4)}" rx="${Math.min(7, barW / 2)}" fill="${color}"/>`;
    if (n <= 7 && v > 0) s += `<text x="${x + barW / 2}" y="${pt + ih - Math.max(bh, 4) - 4}" text-anchor="middle" style="font-weight:600;fill:var(--ink2)">${fmtv(v)}</text>`;
    if (n <= 14 || i % 5 === 0 || i === n - 1) s += `<text x="${x + barW / 2}" y="${H - 4}" text-anchor="middle">${labels[i]}</text>`;
  });
  if (goal) { const y = pt + ih * (1 - goal / mx); s += `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="var(--ink2)" stroke-dasharray="3 5" stroke-width="1" opacity=".45"/>`; }
  return s + '</svg>';
}
function line(vals, labels, { color = 'var(--mood)', min = 1, max = 5, h = 130 } = {}) {
  const W = 320, H = h, pb = 20, pt = 12, px = 10, n = vals.length, ih = H - pt - pb;
  const X = i => px + (W - 2 * px) * (n === 1 ? .5 : i / (n - 1)), Y = v => pt + ih * (1 - (v - min) / (max - min));
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">`;
  for (let g = min; g <= max; g++) s += `<line x1="0" x2="${W}" y1="${Y(g)}" y2="${Y(g)}" stroke="var(--line)" stroke-width="1"/>`;
  let d = '', pen = false;
  vals.forEach((v, i) => { if (v == null) { pen = false; return; } d += `${pen ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)} `; pen = true; });
  s += `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  vals.forEach((v, i) => { if (v != null) s += `<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" fill="var(--card)" stroke="${color}" stroke-width="2"/>`; });
  labels.forEach((l, i) => { if (n <= 14 || i % 5 === 0 || i === n - 1) s += `<text x="${X(i)}" y="${H - 4}" text-anchor="middle">${l}</text>`; });
  return s + '</svg>';
}
const shortLbl = (k, n) => n <= 7 ? DAY_LETTER[dow(k)] : String(pd(k).getDate());

/* =========================================================
   SCREENS
   ========================================================= */
const SCREENS = {};

/* ---------- HOME ---------- */
SCREENS.home = () => {
  const t = TODAY(), p = S.profile, hr = new Date().getHours();
  const greet = hr < 5 ? 'Good night' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const hs = habitsFor(t), hd = hs.filter(h => isDone(h, t)).length;
  const due = S.tasks.filter(x => !x.done && x.date && x.date <= t).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const anytime = S.tasks.filter(x => !x.done && !x.date);
  const doneToday = tasksOn(t).filter(x => x.done);
  const tt = tasksOn(t), td = tt.filter(x => x.done).length;
  const w = S.water[t] || 0, wg = p.waterGoal || 8;
  const pct = dayScore(t);
  const msg = pct === 0 ? 'Small steps. Big changes. Start with one.' : pct < .5 ? 'Nice start — keep the momentum going.' : pct < 1 ? 'More than halfway there. You’ve got this.' : 'Everything done. Be proud of today. 🌿';
  const rk = currentRoutine(), rs = S.routines[rk], rdn = routineDone(rk, t).filter(id => rs.some(s => s.id === id)).length;
  const rmins = sum(rs.map(s => +s.mins || 0));
  const m = S.mood[t]?.mood;
  const name = (p.name || '').trim().split(' ')[0];
  const taskList = [...due, ...anytime.slice(0, 3), ...doneToday].slice(0, 6);

  return `
  ${WAVES}${appHead()}
  ${head(fmt(t, { weekday: 'long', day: 'numeric', month: 'long' }), `${greet}${name ? ', ' + esc(name) : ''}.`, msg)}

  <section class="card hero">
    ${ring(pct, 116, 11, 'var(--accent)', `<div><b>${Math.round(pct * 100)}%</b><small>today</small></div>`)}
    <div class="hero-stats">
      <div class="hstat"><span class="dot" style="background:var(--accent)"></span>Habits<b>${hd}/${hs.length}</b></div>
      <div class="hstat"><span class="dot" style="background:var(--mood)"></span>Tasks<b>${td}/${tt.length}</b></div>
      <div class="hstat"><span class="dot" style="background:var(--water)"></span>Water<b>${w}/${wg}</b></div>
      <div class="hstat"><span class="dot" style="background:var(--move)"></span>Move<b>${moveMins(t)}′</b></div>
    </div>
  </section>

  <section class="card tint-mood">
    <div class="card-head"><span class="eyebrow">How are you feeling?</span>${m ? `<span class="small muted">${MOODS[m - 1].t}</span>` : ''}</div>
    <div class="moods">${MOODS.map(x => `<button class="moodbtn ${m === x.v ? 'on' : ''}" data-a="mood" data-v="${x.v}" aria-label="${x.t}">${x.e}</button>`).join('')}</div>
  </section>

  <section class="card">
    <div class="card-head"><span class="eyebrow">Today’s habits</span><button class="link" data-a="plan" data-seg="habits">Manage</button></div>
    ${hs.length ? `<div class="habit-grid">${hs.map(h => { const on = isDone(h, t), s = streak(h); return `<button class="hchip ${on ? 'on' : ''}" style="--hc:${h.color}" data-a="habit" data-id="${h.id}" data-d="${t}"><span class="emo">${h.emoji}</span><span><span class="t">${esc(h.title)}</span><span class="s">${s ? `🔥 ${s} day${s > 1 ? 's' : ''}` : on ? 'Done ✓' : 'Not yet'}</span></span></button>`; }).join('')}</div>`
      : emptyState('🌱', `No habits for today.<br><button class="link" data-a="newHabit">Create your first habit</button>`)}
  </section>

  <section class="card tint-water">
    <div class="card-head"><span class="eyebrow">Hydration</span><span class="small" style="font-weight:700;color:var(--water)">${w} of ${wg} glasses</span></div>
    <div class="row"><div class="drops" style="flex:1">${Array.from({ length: Math.max(wg, w) }, (_, i) => `<button class="drop ${i < w ? 'on' : ''}" data-a="waterSet" data-v="${i + 1}" aria-label="Glass ${i + 1}">${I.dropFill}</button>`).join('')}</div>
    <button class="iconbtn" data-a="water" data-v="1" aria-label="Add a glass" style="color:var(--water)">${I.plus}</button></div>
  </section>

  <section class="card">
    <div class="card-head"><span class="eyebrow">Up next</span><button class="link" data-a="newTask">+ Add</button></div>
    ${taskList.length ? `<ul class="list">${taskList.map(taskItem).join('')}</ul>` : emptyState('☕', 'Nothing planned. Enjoy the space — or add a task.')}
  </section>

  <section class="card">
    <button class="feature" data-a="plan" data-seg="routines" data-r="${rk}">
      <span class="ic" style="background:var(--accent-soft);font-size:24px">${ROUTINE_META[rk][0]}</span>
      <span class="body"><span class="h3">${ROUTINE_META[rk][1]} routine</span><br><span class="small muted">${rdn} of ${rs.length} steps · ${rmins} min</span></span>
      ${ring(rs.length ? rdn / rs.length : 0, 44, 5)}
    </button>
    ${rs.length && rdn < rs.length ? `<button class="btn soft" style="margin-top:14px" data-a="runRoutine" data-r="${rk}">${I.play} Start ${ROUTINE_META[rk][1].toLowerCase()} routine</button>` : ''}
  </section>

  <div class="grid2">
    <button class="tile t-accent" data-a="breathe"><span class="ic">${I.wind}</span><span class="lbl">Breathe</span><span class="val">1 min <small>calm</small></span></button>
    <button class="tile t-mind" data-a="go" data-to="growth/write${S.journal.find(j => j.date === t) ? '/' + S.journal.find(j => j.date === t).id : ''}"><span class="ic">${I.pen}</span><span class="lbl">Journal</span><span class="val" style="font-size:17px;line-height:1.25">${S.journal.some(j => j.date === t) ? 'Keep writing' : 'Today’s prompt'}</span></button>
  </div>

  <section class="card tint-accent">
    <div class="eyebrow" style="margin-bottom:8px">Thought for today</div>
    <div class="quote">“${esc(quoteFor(t))}”</div>
  </section>`;
};

function taskItem(x) {
  const t = TODAY(), late = !x.done && x.date && x.date < t;
  return `<li class="item ${x.done ? 'done' : ''}">${checkBtn(x.done, 'task', `data-id="${x.id}"`)}
  <button class="body" style="text-align:left" data-a="editTask" data-id="${x.id}"><div class="t">${esc(x.title)}</div>
  <div class="m"><span class="prio ${x.priority || 'medium'}"></span><span style="${late ? 'color:var(--danger);font-weight:600' : ''}">${late ? 'Overdue · ' : ''}${relDay(x.date)}${x.time ? ' · ' + x.time : ''}</span>${x.note ? '<span>· 📝</span>' : ''}</div></button></li>`;
}

/* ---------- PLAN ---------- */
SCREENS.plan = r => {
  if (r.sub === 'goal' && r.id) return goalDetail(r.id);
  const seg = ['tasks', 'habits', 'routines', 'goals', 'calendar'].includes(r.sub) ? r.sub : ui.planSeg;
  ui.planSeg = seg;
  const segs = [['tasks', 'Tasks'], ['habits', 'Habits'], ['routines', 'Routines'], ['goals', 'Goals'], ['calendar', 'Calendar']];
  return `${WAVES}${appHead()}${head('', 'Your Plan', 'Organize your life, one step at a time.')}
  <div class="seg" role="tablist">${segs.map(([id, l]) => `<button class="${seg === id ? 'on' : ''}" data-a="go" data-to="plan/${id}">${l}</button>`).join('')}</div>
  ${({ tasks: planTasks, habits: planHabits, routines: planRoutines, goals: planGoals, calendar: planCalendar })[seg]()}`;
};

function planTasks() {
  const t = TODAY(), f = ui.taskFilter;
  const chips = [['today', 'Today'], ['upcoming', 'Upcoming'], ['all', 'All'], ['done', 'Done']];
  const sortT = a => a.sort((x, y) => ((x.date || '9') + (x.time || '')).localeCompare((y.date || '9') + (y.time || '')));
  const group = (title, arr) => arr.length ? `<div class="section-title"><span class="eyebrow">${title}</span><span class="small muted">${arr.length}</span></div><section class="card" style="padding:4px 18px"><ul class="list">${arr.map(taskItem).join('')}</ul></section>` : '';
  let body = '';
  const open = S.tasks.filter(x => !x.done);
  if (f === 'today') {
    body = group('Overdue', sortT(open.filter(x => x.date && x.date < t))) + group('Today', sortT(S.tasks.filter(x => x.date === t))) + group('Anytime', open.filter(x => !x.date));
  } else if (f === 'upcoming') {
    const by = {}; sortT(open.filter(x => x.date > t)).forEach(x => (by[x.date] = by[x.date] || []).push(x));
    body = Object.keys(by).map(k => group(fmt(k, { weekday: 'long', day: 'numeric', month: 'short' }), by[k])).join('');
  } else if (f === 'all') {
    body = group('Open', sortT(open));
  } else {
    body = group('Completed', S.tasks.filter(x => x.done).sort((a, b) => (b.doneAt || '').localeCompare(a.doneAt || '')).slice(0, 60));
    if (S.tasks.some(x => x.done)) body += `<button class="btn danger" data-a="clearDone">Clear completed</button>`;
  }
  return `<div class="chips">${chips.map(([id, l]) => `<button class="chip ${f === id ? 'on' : ''}" data-a="taskFilter" data-v="${id}">${l}</button>`).join('')}</div>
  ${body || `<section class="card">${emptyState(f === 'done' ? '✨' : '🌤️', f === 'done' ? 'No completed tasks yet.' : 'You’re all clear. Tap + to add a task.')}</section>`}`;
}

function planHabits() {
  if (!S.habits.length) return `<section class="card">${emptyState('🌱', 'Habits are the small things you repeat.<br>Tap + to create your first one.')}</section>`;
  const t = TODAY(), monday = addD(t, -((dow(t) + 6) % 7));
  const week = Array.from({ length: 7 }, (_, i) => addD(monday, i));
  return `<p class="small muted" style="margin:-4px 2px 12px">Tap a day to mark it done. Tap a habit to edit it.</p>` + S.habits.map(h => {
    const s = streak(h);
    return `<section class="card"><div class="habit-card">
      <button class="emo" style="background:${softOf(h.color)}" data-a="editHabit" data-id="${h.id}">${h.emoji}</button>
      <button class="body" style="flex:1;text-align:left" data-a="editHabit" data-id="${h.id}"><div class="h3">${esc(h.title)}</div><div class="small muted">${h.days.length === 7 ? 'Every day' : DAY_ORDER.filter(d => h.days.includes(d)).map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}</div></button>
      ${s ? `<span class="streak">🔥 ${s}</span>` : ''}
    </div>
    <div class="week" style="--hc:${h.color}">${week.map(k => {
      const sc = h.days.includes(dow(k)), fut = k > t, on = isDone(h, k);
      return `<button class="wd ${on ? 'on' : ''} ${!sc || fut ? 'off' : ''} ${k === t ? 'today' : ''}" ${fut ? 'disabled' : `data-a="habit" data-id="${h.id}" data-d="${k}"`} aria-label="${fmt(k)}">${DAY_LETTER[dow(k)]}</button>`;
    }).join('')}</div></section>`;
  }).join('');
}

function planRoutines() {
  const rk = ui.routine || currentRoutine(), t = TODAY();
  ui.routine = rk;
  const rs = S.routines[rk], dn = routineDone(rk, t), mins = sum(rs.map(s => +s.mins || 0));
  return `<div class="rtabs">${Object.keys(ROUTINE_META).map(k => {
    const a = S.routines[k], d = routineDone(k, t).filter(id => a.some(s => s.id === id)).length;
    return `<button class="rtab ${k === rk ? 'on' : ''}" data-a="routineTab" data-v="${k}"><span class="e">${ROUTINE_META[k][0]}</span>${ROUTINE_META[k][1]}<small>${d}/${a.length}</small></button>`;
  }).join('')}</div>
  <section class="card">
    <div class="card-head"><div><div class="h2">${ROUTINE_META[rk][1]} routine</div><div class="small muted">${plural(rs.length, 'step')} · about ${mins} min</div></div>
    <button class="link" data-a="routineEdit">${ui.rEdit ? 'Done' : 'Edit'}</button></div>
    ${rs.length ? `<ul class="list">${rs.map(s => `<li class="item steprow ${dn.includes(s.id) ? 'done' : ''}">
      ${ui.rEdit ? `<button class="delx" data-a="delStep" data-id="${s.id}" aria-label="Remove">${I.x}</button>` : checkBtn(dn.includes(s.id), 'routineStep', `data-id="${s.id}"`)}
      <div class="body"><div class="t">${esc(s.title)}</div></div><span class="mins">${s.mins ? s.mins + ' min' : '—'}</span></li>`).join('')}</ul>`
      : emptyState('🕊️', 'No steps yet. Add the first one below.')}
    ${ui.rEdit || !rs.length ? `<div class="row" style="margin-top:12px;gap:8px"><input class="input" id="r-step" placeholder="New step" style="flex:1"><select class="input" id="r-mins" style="width:96px">${[0, 1, 2, 5, 10, 15, 20, 30, 45, 60].map(m => `<option value="${m}" ${m === 5 ? 'selected' : ''}>${m ? m + ' min' : 'no time'}</option>`).join('')}</select></div>
    <button class="btn soft" style="margin-top:10px" data-a="addStep">${I.plus} Add step</button>` : ''}
  </section>
  ${rs.length && !ui.rEdit ? `<button class="btn" data-a="runRoutine" data-r="${rk}">${I.play} ${dn.length && dn.length < rs.length ? 'Continue' : 'Start'} routine</button>` : ''}
  ${dn.length && !ui.rEdit ? `<button class="btn danger" style="margin-top:6px" data-a="resetRoutine" data-r="${rk}">Reset today’s progress</button>` : ''}`;
}

function planGoals() {
  if (!S.goals.length) return `<section class="card">${emptyState('🎯', 'Goals give your days direction.<br>Tap + to set your first goal.')}</section>`;
  const open = S.goals.filter(g => !g.done), done = S.goals.filter(g => g.done);
  const card = g => {
    const a = area(g.area), n = g.steps.length, d = g.steps.filter(s => s.done).length, p = g.done ? 1 : n ? d / n : 0;
    return `<button class="card goal pressable" style="display:block;width:100%;text-align:left" data-a="go" data-to="plan/goal/${g.id}">
      <div class="top"><div><span class="tag" style="background:${softOf(a[3])};color:${a[3]}">${a[1]} ${a[2]}</span><div class="h3" style="margin-top:8px">${esc(g.title)}</div>
      <div class="small muted">${g.deadline ? 'By ' + fmt(g.deadline, { day: 'numeric', month: 'short', year: 'numeric' }) : 'No deadline'} · ${d}/${n} steps</div></div>
      <span class="pct">${Math.round(p * 100)}%</span></div>
      <div class="bar" style="--c:${a[3]}"><i style="width:${p * 100}%"></i></div></button>`;
  };
  return open.map(card).join('') + (done.length ? `<div class="section-title"><span class="eyebrow">Achieved 🎉</span></div>${done.map(card).join('')}` : '');
}

function goalDetail(id) {
  const g = S.goals.find(x => x.id === id);
  if (!g) return back('plan/goals', 'Goals') + emptyState('🔍', 'This goal no longer exists.');
  const a = area(g.area), n = g.steps.length, d = g.steps.filter(s => s.done).length, p = g.done ? 1 : n ? d / n : 0;
  return `${back('plan/goals', 'Goals')}
  <span class="tag" style="background:${softOf(a[3])};color:${a[3]}">${a[1]} ${a[2]}</span>
  <h1 class="title" style="margin-top:10px">${esc(g.title)}</h1>
  <p class="subtitle">${g.deadline ? 'Target: ' + fmt(g.deadline, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'No deadline — and that’s okay.'}</p>
  <section class="card hero">${ring(p, 104, 10, a[3], `<div><b>${Math.round(p * 100)}%</b><small>done</small></div>`)}
    <div class="hero-stats"><div class="hstat">Steps done<b>${d}/${n}</b></div><div class="hstat">Started<b>${fmt(g.created, { day: 'numeric', month: 'short' })}</b></div>
    ${g.deadline ? `<div class="hstat">Days left<b>${Math.max(0, Math.round((pd(g.deadline) - pd(TODAY())) / 864e5))}</b></div>` : ''}</div></section>
  <section class="card"><div class="card-head"><span class="eyebrow">Steps to get there</span></div>
    ${n ? `<ul class="list">${g.steps.map(s => `<li class="item ${s.done ? 'done' : ''}">${checkBtn(s.done, 'goalStep', `data-g="${g.id}" data-id="${s.id}"`)}<div class="body"><div class="t">${esc(s.title)}</div></div><button class="delx" data-a="delGoalStep" data-g="${g.id}" data-id="${s.id}" aria-label="Remove">${I.x}</button></li>`).join('')}</ul>` : '<p class="small muted" style="margin:0 0 6px">Break your goal into small, doable steps.</p>'}
    <div class="row" style="margin-top:10px;gap:8px"><input class="input" id="g-step" placeholder="Add a step" style="flex:1"><button class="iconbtn" data-a="addGoalStep" data-g="${g.id}" aria-label="Add step">${I.plus}</button></div>
  </section>
  <button class="btn ${g.done ? 'ghost' : ''}" data-a="goalDone" data-g="${g.id}">${g.done ? 'Mark as in progress' : '🎉 Mark goal achieved'}</button>
  <div class="btn-row" style="margin-top:8px"><button class="btn ghost" data-a="editGoal" data-g="${g.id}">Edit</button><button class="btn danger" data-a="delGoal" data-g="${g.id}">Delete</button></div>`;
}

function planCalendar() {
  const t = TODAY();
  const m0 = ui.calMonth || t.slice(0, 8) + '01'; ui.calMonth = m0;
  const sel = ui.selDay || t; ui.selDay = sel;
  const first = pd(m0), start = addD(m0, -((first.getDay() + 6) % 7));
  const cells = Array.from({ length: 42 }, (_, i) => addD(start, i));
  const rows = cells[35].slice(0, 7) !== m0.slice(0, 7) ? cells.slice(0, 35) : cells;
  const ts = tasksOn(sel), hs = habitsFor(sel), hd = hs.filter(h => isDone(h, sel)).length;
  const md = S.mood[sel]?.mood, sl = S.sleep[sel], w = S.water[sel] || 0, mv = moveMins(sel);
  return `<section class="card">
    <div class="cal-head"><div class="h2">${first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>
    <div class="cal-nav"><button class="iconbtn" data-a="calMove" data-v="-1" aria-label="Previous month">${I.left}</button><button class="iconbtn" data-a="calMove" data-v="1" aria-label="Next month">${I.right}</button></div></div>
    <div class="cal-grid">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<div class="dow">${d}</div>`).join('')}
    ${rows.map(k => {
      const hasT = S.tasks.some(x => x.date === k), hasH = (S.habitLog[k] || []).length > 0;
      return `<button class="cday ${k.slice(0, 7) !== m0.slice(0, 7) ? 'out' : ''} ${k === t ? 'today' : ''} ${k === sel ? 'sel' : ''}" data-a="calSel" data-v="${k}">${pd(k).getDate()}<span class="dots">${hasT ? '<i></i>' : ''}${hasH ? '<i class="h"></i>' : ''}</span></button>`;
    }).join('')}</div>
    <div class="legend"><span><i style="background:var(--accent)"></i>Tasks</span><span><i style="background:var(--move)"></i>Habits done</span>${m0.slice(0, 7) !== t.slice(0, 7) ? `<button class="link" style="margin-left:auto" data-a="calToday">Today</button>` : ''}</div>
  </section>
  <div class="section-title"><span class="h2">${relDay(sel) === fmt(sel) ? fmt(sel, { weekday: 'long', day: 'numeric', month: 'long' }) : relDay(sel)}</span><button class="link" data-a="newTask" data-d="${sel}">+ Add task</button></div>
  <section class="card" style="padding:4px 18px">${ts.length ? `<ul class="list">${ts.map(taskItem).join('')}</ul>` : `<p class="muted small" style="margin:14px 0">No tasks planned for this day.</p>`}</section>
  ${sel <= t ? `<div class="grid3" style="margin-bottom:14px">
    <div class="card" style="margin:0;padding:12px;text-align:center"><div class="small muted">Habits</div><b>${hd}/${hs.length}</b></div>
    <div class="card" style="margin:0;padding:12px;text-align:center"><div class="small muted">Mood</div><b>${md ? MOODS[md - 1].e : '—'}</b></div>
    <div class="card" style="margin:0;padding:12px;text-align:center"><div class="small muted">Water</div><b>${w}</b></div>
    <div class="card" style="margin:0;padding:12px;text-align:center"><div class="small muted">Sleep</div><b>${sl ? hours(sl.hours) : '—'}</b></div>
    <div class="card" style="margin:0;padding:12px;text-align:center"><div class="small muted">Move</div><b>${mv}′</b></div>
    <div class="card" style="margin:0;padding:12px;text-align:center"><div class="small muted">Journal</div><b>${S.journal.some(j => j.date === sel) ? '✓' : '—'}</b></div></div>` : ''}`;
}

/* ---------- PROGRESS ---------- */
SCREENS.progress = () => {
  const n = ui.prange, days = daysBack(n), t = TODAY(), p = S.profile;
  let sch = 0, dn = 0;
  days.forEach(k => { const hs = habitsFor(k); sch += hs.length; dn += hs.filter(h => isDone(h, k)).length; });
  const cons = sch ? Math.round(dn / sch * 100) : 0;
  const tasksDone = S.tasks.filter(x => x.done && x.doneAt && x.doneAt >= days[0]).length;
  const sl = days.map(k => S.sleep[k]?.hours).filter(Boolean);
  const mvs = days.map(moveMins), mvTot = sum(mvs);
  const moods = days.map(k => S.mood[k]?.mood).filter(Boolean), am = avg(moods);
  const wDays = days.filter(k => (S.water[k] || 0) >= p.waterGoal).length;
  const jN = S.journal.filter(j => j.date >= days[0]).length;

  // heatmap: 15 weeks, Monday-start columns
  const weeks = 15, mon = addD(t, -((dow(t) + 6) % 7) - (weeks - 1) * 7);
  const heat = Array.from({ length: weeks * 7 }, (_, i) => {
    const k = addD(mon, i);
    if (k > t) return '<i style="opacity:.25"></i>';
    const hs = habitsFor(k);
    if (!hs.length) return '<i></i>';
    const f = hs.filter(h => isDone(h, k)).length / hs.length;
    const l = f === 0 ? 0 : f < .34 ? 1 : f < .67 ? 2 : f < 1 ? 3 : 4;
    return `<i class="l${l}" title="${k}"></i>`;
  }).join('');

  const stat = (v, k, c) => `<div class="card stat" style="margin:0"><div class="v" style="color:${c || 'var(--ink)'}">${v}</div><div class="k">${k}</div></div>`;
  return `${WAVES}${appHead()}${head('', 'Progress', 'Your journey, seen over time.')}
  <div class="seg">${[[7, 'This week'], [30, '30 days']].map(([v, l]) => `<button class="${n === v ? 'on' : ''}" data-a="prange" data-v="${v}">${l}</button>`).join('')}</div>
  <div class="grid2">
    ${stat(cons + '<small>%</small>', 'Habit consistency', 'var(--accent)')}
    ${stat(tasksDone, 'Tasks completed', 'var(--mood)')}
    ${stat(sl.length ? hours(avg(sl)) : '—', 'Average sleep', 'var(--sleep)')}
    ${stat(mvTot + '<small> min</small>', 'Active minutes', 'var(--move)')}
    ${stat(moods.length ? MOODS[Math.round(am) - 1].e + `<small> ${am.toFixed(1)}</small>` : '—', 'Average mood')}
    ${stat(`${wDays}<small>/${n}</small>`, 'Days hydrated', 'var(--water)')}
  </div>

  <section class="card"><div class="card-head"><span class="eyebrow">Habit consistency · 15 weeks</span></div>
    <div class="heat">${heat}</div>
    <div class="legend" style="justify-content:flex-end;align-items:center">Less <span class="heat" style="display:flex;gap:3px;grid-template-rows:none">${[0, 1, 2, 3, 4].map(l => `<i class="l${l}" style="width:11px"></i>`).join('')}</span> More</div></section>

  <section class="card"><div class="card-head"><span class="eyebrow">Mood</span></div>${line(days.map(k => S.mood[k]?.mood ?? null), days.map(k => shortLbl(k, n)))}</section>
  <section class="card"><div class="card-head"><span class="eyebrow">Sleep</span><span class="small muted">goal ${p.sleepGoal}h</span></div>${bars(days.map(k => S.sleep[k]?.hours || 0), days.map(k => shortLbl(k, n)), { color: 'var(--sleep)', goal: p.sleepGoal, fmtv: v => v.toFixed(1).replace('.0', '') })}</section>
  <section class="card"><div class="card-head"><span class="eyebrow">Movement</span><span class="small muted">goal ${p.moveGoal} min</span></div>${bars(mvs, days.map(k => shortLbl(k, n)), { color: 'var(--move)', goal: p.moveGoal })}</section>

  ${S.habits.length ? `<section class="card"><div class="card-head"><span class="eyebrow">Streaks</span><span class="small muted">current · best</span></div><ul class="list">${S.habits.map(h => {
    const ds = days.filter(k => sched(h, k)), d = ds.filter(k => isDone(h, k)).length;
    return `<li class="item"><span class="emo" style="width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:${softOf(h.color)};font-size:19px">${h.emoji}</span><div class="body"><div class="t">${esc(h.title)}</div><div class="bar" style="--c:${h.color};margin-top:6px"><i style="width:${ds.length ? d / ds.length * 100 : 0}%"></i></div></div><span class="small" style="text-align:right;white-space:nowrap"><b>🔥 ${streak(h)}</b><br><span class="muted">best ${bestStreak(h)}</span></span></li>`;
  }).join('')}</ul></section>` : ''}

  <div class="section-title"><span class="h2">Achievements</span><span class="small muted">${achievements().filter(a => a.got).length}/${achievements().length}</span></div>
  <div class="badges">${achievements().map(a => `<div class="badge ${a.got ? 'got' : 'locked'}"><div class="e">${a.e}</div><b>${a.t}</b><small>${a.got ? a.d : a.prog}</small></div>`).join('')}</div>`;
};

function achievements() {
  const allDays = Object.keys(S.habitLog).filter(k => S.habitLog[k].length);
  const best = Math.max(0, ...S.habits.map(bestStreak));
  const g = S.profile;
  const waterDays = Object.keys(S.water).filter(k => S.water[k] >= g.waterGoal).length;
  const sleepDays = Object.keys(S.sleep).filter(k => S.sleep[k].hours >= g.sleepGoal).length;
  const mins = sum(S.moves.map(m => +m.mins || 0));
  const gratDays = Object.keys(S.gratitude).filter(k => S.gratitude[k].filter(x => (x || '').trim()).length >= 3).length;
  const tasks = S.tasks.filter(x => x.done).length;
  const mornings = Object.keys(S.routineLog).filter(k => { const m = S.routines.morning; return m.length && m.every(s => (S.routineLog[k].morning || []).includes(s.id)); }).length;
  const breaths = sum(Object.values(S.breaths));
  const perfect = daysBack(90).filter(k => habitsFor(k).length && dayScore(k) >= 1).length;
  const A = (e, t, d, cur, goal) => ({ e, t, d, got: cur >= goal, prog: `${Math.min(cur, goal)}/${goal}` });
  return [
    A('🌱', 'First step', 'Completed a habit', allDays.length, 1),
    A('🔥', 'On fire', '7-day streak', best, 7),
    A('💧', 'Hydrated', 'Water goal 7×', waterDays, 7),
    A('🌙', 'Well rested', 'Sleep goal 5×', sleepDays, 5),
    A('🏃', 'Mover', '300 active min', mins, 300),
    A('✍️', 'Reflective', '10 journal entries', S.journal.length, 10),
    A('🙏', 'Grateful heart', '3 good things 7×', gratDays, 7),
    A('✅', 'Doer', '25 tasks done', tasks, 25),
    A('☀️', 'Early bird', '5 full mornings', mornings, 5),
    A('🫧', 'Calm mind', '5 breathing sessions', breaths, 5),
    A('🌈', 'Perfect day', 'Everything done', perfect, 1),
    A('🎯', 'Goal getter', 'Achieved a goal', S.goals.filter(x => x.done).length, 1),
  ];
}

/* ---------- PROFILE ---------- */
SCREENS.profile = () => {
  const p = S.profile, name = (p.name || '').trim();
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const stp = (k, step, unit, min, max) => `<div class="stepper"><button data-a="goal" data-k="${k}" data-v="${-step}" aria-label="Less">−</button><b>${p[k]}${unit}</b><button data-a="goal" data-k="${k}" data-v="${step}" aria-label="More">+</button></div>`;
  return `${WAVES}${appHead()}${head('', 'Profile', 'Your personal RESET space.')}
  <button class="profile-head" style="width:100%;text-align:left" data-a="editName"><span class="avatar">${esc((name || '✿')[0].toUpperCase())}</span><span><span class="h2">${esc(name || 'Add your name')}</span><br><span class="small muted">With RESET since ${fmt(S.created, { day: 'numeric', month: 'long', year: 'numeric' })}</span></span></button>

  <div class="section-title"><span class="eyebrow">Daily goals</span></div>
  <section class="card" style="padding:4px 18px">
    <div class="setting"><span style="font-size:22px">💧</span><div class="body"><div class="t">Water</div><div class="m">glasses per day</div></div>${stp('waterGoal', 1, '')}</div>
    <div class="setting"><span style="font-size:22px">🌙</span><div class="body"><div class="t">Sleep</div><div class="m">hours per night</div></div>${stp('sleepGoal', .5, 'h')}</div>
    <div class="setting"><span style="font-size:22px">🏃</span><div class="body"><div class="t">Movement</div><div class="m">active minutes per day</div></div>${stp('moveGoal', 5, '′')}</div>
  </section>
  <div class="section-title"><span class="eyebrow">Nutrition targets</span></div>
  <section class="card" style="padding:4px 18px">
    <div class="setting"><span style="font-size:22px">🍽️</span><div class="body"><div class="t">Calories</div><div class="m">kcal per day</div></div>${stp('kcalGoal', 50, '')}</div>
    <div class="setting"><span style="font-size:22px">🥚</span><div class="body"><div class="t">Protein</div><div class="m">grams per day</div></div>${stp('proteinGoal', 5, 'g')}</div>
    <div class="setting"><span style="font-size:22px">🍞</span><div class="body"><div class="t">Carbs</div><div class="m">grams per day</div></div>${stp('carbGoal', 10, 'g')}</div>
    <div class="setting"><span style="font-size:22px">🥑</span><div class="body"><div class="t">Fat</div><div class="m">grams per day</div></div>${stp('fatGoal', 5, 'g')}</div>
  </section>

  <div class="section-title"><span class="eyebrow">Appearance</span></div>
  <section class="card">
    <div class="seg" style="margin-bottom:16px">${[['auto', 'Automatic'], ['light', 'Light'], ['dark', 'Dark']].map(([v, l]) => `<button class="${p.theme === v ? 'on' : ''}" data-a="theme" data-v="${v}">${l}</button>`).join('')}</div>
    <div class="row" style="justify-content:space-between"><span class="t" style="font-weight:600">Accent colour</span><div class="swatches">${[['sage', '#7A9E68'], ['ocean', '#6E9AAA'], ['clay', '#C2906A'], ['plum', '#9C88A8']].map(([v, c]) => `<button class="sw ${p.accent === v ? 'on' : ''}" style="--c:${c}" data-a="accent" data-v="${v}" aria-label="${v}"></button>`).join('')}</div></div>
  </section>

  ${standalone ? '' : `<div class="section-title"><span class="eyebrow">Install</span></div>
  <section class="card tint-accent"><div class="h3" style="margin-bottom:6px">Add RESET to your Home Screen</div>
    <div class="small" style="color:var(--ink2)">In Safari, tap <b>Share</b> <span style="display:inline-block;width:16px;vertical-align:-3px">${I.share}</span> then <b>Add to Home Screen</b>. RESET will open full-screen like a real app and work offline.</div></section>`}

  <div class="section-title"><span class="eyebrow">Your data</span></div>
  <section class="card" style="padding:4px 18px">
    <button class="setting" style="width:100%;text-align:left" data-a="exportData"><span style="font-size:22px">📦</span><div class="body"><div class="t">Back up my data</div><div class="m">Save a file you can restore later</div></div><span class="chev">${I.right}</span></button>
    <label class="setting" style="cursor:pointer"><span style="font-size:22px">📥</span><div class="body"><div class="t">Restore from backup</div><div class="m">Choose a RESET backup file</div></div><span class="chev">${I.right}</span><input type="file" accept="application/json,.json" id="importFile" hidden></label>
    <button class="setting" style="width:100%;text-align:left" data-a="eraseAll"><span style="font-size:22px">🗑️</span><div class="body"><div class="t" style="color:var(--danger)">Erase everything</div><div class="m">Start over from a clean slate</div></div></button>
  </section>
  <p class="small muted" style="text-align:center;margin-top:20px">RESET · v6<br>Everything you enter stays private on this device.</p>`;
};

/* ---------- floating add button ---------- */
function fabFor(r) {
  let a = null;
  if (r.tab === 'plan' && !r.id) a = { tasks: 'newTask', habits: 'newHabit', goals: 'newGoal', calendar: 'newTask' }[ui.planSeg];
  if (!a) return '';
  const d = ui.planSeg === 'calendar' ? `data-d="${ui.selDay || TODAY()}"` : '';
  return `<button class="fab" data-a="${a}" ${d} aria-label="Add">${I.plus}</button>`;
}

/* =========================================================
   SHEETS & OVERLAYS
   ========================================================= */
let sheetActs = null, form = {};
function openSheet(title, html, acts = {}) {
  const L = $('#layer');
  L.innerHTML = `<div class="backdrop" data-a="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="grab"></div><div class="sheet-head"><h2 class="h2">${esc(title)}</h2><button class="closebtn" data-a="closeSheet" aria-label="Close">${I.x}</button></div><div class="sheet-body">${html}</div></div>`;
  sheetActs = acts;
  requestAnimationFrame(() => requestAnimationFrame(() => { $('.backdrop', L)?.classList.add('show'); $('.sheet', L)?.classList.add('show'); }));
  return $('.sheet', L);
}
function closeSheet(instant) {
  const L = $('#layer'); sheetActs = null;
  if (!L.firstChild) return;
  if (instant === true) { L.innerHTML = ''; return; }
  $('.backdrop', L)?.classList.remove('show'); $('.sheet', L)?.classList.remove('show');
  const snap = L.firstChild;
  setTimeout(() => { if (L.firstChild === snap) L.innerHTML = ''; }, 340);
}
function confirmSheet(title, msg, label, fn) {
  openSheet(title, `<p class="muted" style="margin:0 0 20px">${msg}</p><button class="btn" style="background:var(--danger);color:#fff" data-a="ok">${label}</button><button class="btn ghost" style="margin-top:8px" data-a="closeSheet">Cancel</button>`, { ok() { closeSheet(); fn(); } });
}
const pickGroup = (g, opts, cur, multi) => opts.map(([v, inner, cls = '']) => `<button class="${cls} ${multi ? (cur.includes(v) ? 'on' : '') : (cur === v ? 'on' : '')}" data-a="pick" data-g="${g}" data-v="${v}" ${multi ? 'data-multi' : ''}>${inner}</button>`).join('');

let fullEl = null, fullActs = null, fullCleanup = null;
function openFull(html, acts = {}, cleanup) {
  closeFull();
  const d = document.createElement('div');
  d.className = 'full';
  d.innerHTML = `<button class="closebtn x" data-a="closeFull" aria-label="Close" style="width:40px;height:40px">${I.x}</button>${html}`;
  document.body.appendChild(d);
  fullEl = d; fullActs = acts; fullCleanup = cleanup;
  requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('show')));
  return d;
}
function closeFull() {
  if (fullCleanup) { const f = fullCleanup; fullCleanup = null; f(); }
  const d = fullEl; fullEl = null; fullActs = null;
  if (d) { d.classList.remove('show'); setTimeout(() => d.remove(), 360); render(); }
}

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}
function confetti() {
  const c = document.createElement('div'); c.className = 'confetti';
  const cols = ['#5B7B6A', '#5E9BC4', '#8A80C2', '#D4855A', '#CF9E3E', '#B0789A'];
  c.innerHTML = Array.from({ length: 70 }, () => `<i style="left:${Math.random() * 100}%;background:${cols[Math.random() * cols.length | 0]};animation-delay:${Math.random() * .4}s;animation-duration:${1.2 + Math.random() * 1.2}s;transform:rotate(${Math.random() * 360}deg)"></i>`).join('');
  document.body.appendChild(c); setTimeout(() => c.remove(), 3000);
}
const buzz = () => navigator.vibrate?.(8);
function shake(sel) { const e = $(sel); if (!e) return; e.style.borderColor = 'var(--danger)'; e.animate?.([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 240 }); }

/* ---------- task sheet ---------- */
function taskSheet(id, preset) {
  const x = id ? S.tasks.find(t => t.id === id) : null;
  form = { prio: x?.priority || 'medium' };
  openSheet(x ? 'Edit task' : 'New task', `
    <label class="field"><span>Task</span><input class="input" id="f-title" value="${esc(x?.title || '')}" placeholder="What would you like to do?" autocomplete="off" enterkeyhint="done"></label>
    <div class="grid2"><label class="field" style="margin:0"><span>Date</span><input class="input" type="date" id="f-date" value="${x ? x.date : (preset ?? TODAY())}"></label>
    <label class="field" style="margin:0"><span>Time</span><input class="input" type="time" id="f-time" value="${x?.time || ''}"></label></div>
    <div class="field"><span>Priority</span><div class="seg" style="margin:0">${pickGroup('prio', [['low', '<span class="prio low"></span> Low'], ['medium', '<span class="prio medium"></span> Medium'], ['high', '<span class="prio high"></span> High']], form.prio)}</div></div>
    <label class="field"><span>Notes</span><textarea class="input" id="f-note" placeholder="Optional details">${esc(x?.note || '')}</textarea></label>
    <button class="btn" data-a="save">${x ? 'Save changes' : 'Add task'}</button>
    ${x ? `<button class="btn danger" style="margin-top:6px" data-a="del">Delete task</button>` : ''}`, {
    save() {
      const title = val('#f-title').trim(); if (!title) return shake('#f-title');
      const o = x || { id: uid(), done: false, created: TODAY() };
      Object.assign(o, { title, date: val('#f-date'), time: val('#f-time'), priority: form.prio, note: val('#f-note').trim() });
      if (!x) S.tasks.push(o);
      closeSheet(); commit(); toast(x ? 'Task updated' : 'Task added ✓');
    },
    del() { S.tasks = S.tasks.filter(t => t !== x); closeSheet(); commit(); toast('Task deleted'); },
  });
}

/* ---------- habit sheet ---------- */
function habitSheet(id) {
  const h = id ? S.habits.find(x => x.id === id) : null;
  form = { emoji: h?.emoji || '🌿', color: h?.color || HCOLORS[S.habits.length % HCOLORS.length], days: (h?.days || [0, 1, 2, 3, 4, 5, 6]).map(String) };
  const s = openSheet(h ? 'Edit habit' : 'New habit', `
    <label class="field"><span>Habit</span><input class="input" id="f-title" value="${esc(h?.title || '')}" placeholder="e.g. Morning walk" autocomplete="off" enterkeyhint="done"></label>
    <div class="field"><span>Icon</span><div class="emoji-grid">${pickGroup('emoji', EMOJIS.map(e => [e, e]), form.emoji)}</div></div>
    <div class="field"><span>Colour</span><div class="swatches">${HCOLORS.map(c => `<button class="sw ${form.color === c ? 'on' : ''}" style="--c:${c}" data-a="pick" data-g="color" data-v="${c}" aria-label="colour"></button>`).join('')}</div></div>
    <div class="field"><span>Repeat on</span><div class="days">${pickGroup('days', DAY_ORDER.map(d => [String(d), DAY_LETTER[d]]), form.days, true)}</div>
    <div class="row" style="gap:14px;margin-top:8px"><button class="link" data-a="allDays">Every day</button><button class="link" data-a="weekdays">Weekdays</button></div></div>
    <button class="btn" data-a="save">${h ? 'Save changes' : 'Create habit'}</button>
    ${h ? `<button class="btn danger" style="margin-top:6px" data-a="del">Delete habit</button>` : ''}`, {
    save() {
      const title = val('#f-title').trim(); if (!title) return shake('#f-title');
      if (!form.days.length) { toast('Choose at least one day'); return; }
      const o = h || { id: uid(), created: TODAY() };
      Object.assign(o, { title, emoji: form.emoji, color: form.color, days: form.days.map(Number).sort() });
      if (!h) S.habits.push(o);
      closeSheet(); commit(); toast(h ? 'Habit updated' : 'Habit created 🌱');
    },
    del() { confirmSheet('Delete habit?', `“${esc(h.title)}” and its history will be removed.`, 'Delete habit', () => { S.habits = S.habits.filter(x => x !== h); Object.values(S.habitLog).forEach(a => { const i = a.indexOf(h.id); if (i >= 0) a.splice(i, 1); }); commit(); toast('Habit deleted'); }); },
    allDays() { form.days = ['0', '1', '2', '3', '4', '5', '6']; $$('[data-g="days"]', s).forEach(b => b.classList.add('on')); },
    weekdays() { form.days = ['1', '2', '3', '4', '5']; $$('[data-g="days"]', s).forEach(b => b.classList.toggle('on', form.days.includes(b.dataset.v))); },
  });
}

/* ---------- goal sheet ---------- */
function goalSheet(id) {
  const g = id ? S.goals.find(x => x.id === id) : null;
  form = { area: g?.area || 'personal' };
  openSheet(g ? 'Edit goal' : 'New goal', `
    <label class="field"><span>Goal</span><input class="input" id="f-title" value="${esc(g?.title || '')}" placeholder="e.g. Run my first 5K" autocomplete="off"></label>
    <div class="field"><span>Life area</span><div class="opt-grid" style="grid-template-columns:repeat(3,1fr)">${pickGroup('area', AREAS.map(a => [a[0], `<span class="e">${a[1]}</span>${a[2]}`, 'opt']), form.area)}</div></div>
    <label class="field"><span>Target date (optional)</span><input class="input" type="date" id="f-date" value="${g?.deadline || ''}"></label>
    ${g ? '' : `<label class="field"><span>First steps — one per line</span><textarea class="input" id="f-steps" placeholder="Buy running shoes&#10;Run 2 km three times a week&#10;Sign up for a race"></textarea></label>`}
    <button class="btn" data-a="save">${g ? 'Save changes' : 'Create goal'}</button>`, {
    save() {
      const title = val('#f-title').trim(); if (!title) return shake('#f-title');
      if (g) Object.assign(g, { title, area: form.area, deadline: val('#f-date') });
      else S.goals.push({ id: uid(), title, area: form.area, deadline: val('#f-date'), created: TODAY(), done: false, steps: val('#f-steps').split('\n').map(s => s.trim()).filter(Boolean).map(t => ({ id: uid(), title: t, done: false })) });
      closeSheet(); commit(); toast(g ? 'Goal updated' : 'Goal created 🎯');
    },
  });
}

/* ---------- sleep / move sheets ---------- */
function sleepSheet(key) {
  const k = key || TODAY(), x = S.sleep[k];
  form = { q: String(x?.q || 4) };
  const calc = () => { const [bh, bm] = val('#f-bed').split(':').map(Number), [wh, wm] = val('#f-wake').split(':').map(Number); let m = (wh * 60 + wm) - (bh * 60 + bm); if (m <= 0) m += 1440; return Math.round(m / 60 * 4) / 4; };
  const s = openSheet('Log sleep', `
    <label class="field"><span>Night ending on</span><input class="input" type="date" id="f-date" value="${k}" max="${TODAY()}"></label>
    <div class="grid2"><label class="field" style="margin:0"><span>Went to bed</span><input class="input" type="time" id="f-bed" value="${x?.bed || '23:00'}"></label>
    <label class="field" style="margin:0"><span>Woke up</span><input class="input" type="time" id="f-wake" value="${x?.wake || '07:00'}"></label></div>
    <div class="card tint-sleep" style="text-align:center;margin-bottom:14px"><div class="bigstat" id="f-hours" style="font-size:34px">8h</div></div>
    <div class="field"><span>How did you sleep?</span><div class="moods">${pickGroup('q', SLEEPQ.map((e, i) => [String(i + 1), e, 'moodbtn']), form.q)}</div></div>
    <button class="btn" style="background:var(--sleep);color:#fff" data-a="save">Save</button>
    ${x ? `<button class="btn danger" style="margin-top:6px" data-a="del">Delete entry</button>` : ''}`, {
    save() {
      const d = val('#f-date') || k; if (d !== k) delete S.sleep[k];
      S.sleep[d] = { bed: val('#f-bed'), wake: val('#f-wake'), hours: calc(), q: +form.q };
      closeSheet(); commit(); toast('Sleep logged 🌙');
    },
    del() { delete S.sleep[k]; closeSheet(); commit(); },
  });
  const upd = () => { $('#f-hours', s).textContent = hours(calc()); };
  $('#f-bed', s).addEventListener('input', upd); $('#f-wake', s).addEventListener('input', upd); upd();
}
function moveSheet() {
  form = { type: 'walk', mins: 20 };
  const s = openSheet('Log activity', `
    <div class="field"><span>Activity</span><div class="opt-grid">${pickGroup('type', ACTIVITIES.map(a => [a[0], `<span class="e">${a[1]}</span>${a[2]}`, 'opt']), form.type)}</div></div>
    <div class="field"><span>Duration</span><div class="row" style="justify-content:center;gap:20px;padding:6px 0">
      <div class="stepper"><button data-a="m" data-v="-5">−</button><b id="f-mins" style="font-size:30px;min-width:70px;font-family:var(--serif)">20</b><button data-a="m" data-v="5">+</button></div></div>
      <div class="chips" style="justify-content:center;margin-top:8px">${[10, 20, 30, 45, 60].map(m => `<button class="chip" data-a="mset" data-v="${m}">${m} min</button>`).join('')}</div></div>
    <button class="btn" style="background:var(--move);color:#fff" data-a="save">Save activity</button>`, {
    m(el) { form.mins = clamp(form.mins + +el.dataset.v, 5, 600); $('#f-mins', s).textContent = form.mins; },
    mset(el) { form.mins = +el.dataset.v; $('#f-mins', s).textContent = form.mins; },
    save() { S.moves.push({ id: uid(), date: TODAY(), type: form.type, mins: form.mins }); closeSheet(); commit(); toast(`${form.mins} min logged 💪`); },
  });
}

/* ---------- growth sheets ---------- */
function visionSheet(id) {
  const v = id ? S.vision.find(x => x.id === id) : null;
  form = { area: v?.area || 'personal' };
  openSheet(v ? 'Edit vision' : 'New vision', `
    <label class="field"><span>Your vision</span><textarea class="input" id="f-text" placeholder="e.g. A calm home filled with music">${esc(v?.text || '')}</textarea></label>
    <div class="field"><span>Life area</span><div class="opt-grid" style="grid-template-columns:repeat(3,1fr)">${pickGroup('area', AREAS.map(a => [a[0], `<span class="e">${a[1]}</span>${a[2]}`, 'opt']), form.area)}</div></div>
    <button class="btn" data-a="save">${v ? 'Save' : 'Add to board'}</button>${v ? `<button class="btn danger" style="margin-top:6px" data-a="del">Remove</button>` : ''}`, {
    save() { const text = val('#f-text').trim(); if (!text) return shake('#f-text'); if (v) Object.assign(v, { text, area: form.area }); else S.vision.push({ id: uid(), text, area: form.area }); closeSheet(); commit(); },
    del() { S.vision = S.vision.filter(x => x !== v); closeSheet(); commit(); },
  });
}
function readSheet(id) {
  const x = id ? S.reading.find(r => r.id === id) : null;
  form = { type: x?.type || 'book', status: x?.status || 'todo' };
  openSheet(x ? 'Edit item' : 'Add to learning', `
    <label class="field"><span>Title</span><input class="input" id="f-title" value="${esc(x?.title || '')}" placeholder="Book, podcast or course" autocomplete="off"></label>
    <label class="field"><span>Author / source (optional)</span><input class="input" id="f-by" value="${esc(x?.by || '')}" autocomplete="off"></label>
    <div class="field"><span>Type</span><div class="opt-grid">${pickGroup('type', [['book', '<span class="e">📚</span>Book', 'opt'], ['podcast', '<span class="e">🎧</span>Podcast', 'opt'], ['course', '<span class="e">🎓</span>Course', 'opt'], ['video', '<span class="e">🎬</span>Video', 'opt']], form.type)}</div></div>
    <div class="field"><span>Status</span><div class="seg" style="margin:0">${pickGroup('status', [['todo', 'To start'], ['doing', 'In progress'], ['done', 'Finished']], form.status)}</div></div>
    <button class="btn" data-a="save">${x ? 'Save' : 'Add'}</button>${x ? `<button class="btn danger" style="margin-top:6px" data-a="del">Remove</button>` : ''}`, {
    save() { const title = val('#f-title').trim(); if (!title) return shake('#f-title'); const o = x || { id: uid() }; Object.assign(o, { title, by: val('#f-by').trim(), type: form.type, status: form.status }); if (!x) S.reading.push(o); closeSheet(); commit(); },
    del() { S.reading = S.reading.filter(r => r !== x); closeSheet(); commit(); },
  });
}
function nameSheet(first) {
  openSheet(first ? 'Welcome to RESET 🌿' : 'Your name', `
    ${first ? `<p class="muted" style="margin:-6px 0 18px">A calm space for your habits, health and growth. Everything stays private on this device.</p>` : ''}
    <label class="field"><span>What should we call you?</span><input class="input" id="f-name" value="${esc(S.profile.name)}" placeholder="Your first name" autocomplete="given-name" enterkeyhint="done"></label>
    <button class="btn" data-a="save">${first ? 'Let’s begin' : 'Save'}</button>`, {
    save() { S.profile.name = val('#f-name').trim(); S.profile.onboarded = true; closeSheet(); commit(); },
  });
}

/* ---------- breathing ---------- */
function breathe() {
  const phases = [['Breathe in', 4, 1], ['Hold', 4, 1], ['Breathe out', 4, .62], ['Hold', 4, .62]];
  const rounds = 4; let round = 0, pi = 0, to = null, iv = null;
  const d = openFull(`<div class="eyebrow">Box breathing</div><div style="height:46px"></div><div class="breath-orb"></div><div class="breath-phase">Get comfortable</div><div class="breath-count">Relax your shoulders…</div>`, {}, () => { clearTimeout(to); clearInterval(iv); });
  const orb = $('.breath-orb', d), ph = $('.breath-phase', d), ct = $('.breath-count', d);
  const step = () => {
    if (pi === 0 && round >= rounds) {
      ph.textContent = 'Well done 🌿'; ct.textContent = 'Notice how you feel right now.';
      orb.style.transitionDuration = '2s'; orb.style.transform = 'scale(.8)';
      const t = TODAY(); S.breaths[t] = (S.breaths[t] || 0) + 1; save(); return;
    }
    const [name, secs, sc] = phases[pi];
    ph.textContent = name; orb.style.transitionDuration = secs + 's'; orb.style.transform = `scale(${sc})`;
    let left = secs; ct.textContent = `Round ${round + 1} of ${rounds} · ${left}`;
    clearInterval(iv); iv = setInterval(() => { left--; if (left > 0) ct.textContent = `Round ${round + 1} of ${rounds} · ${left}`; }, 1000);
    to = setTimeout(() => { pi = (pi + 1) % 4; if (pi === 0) round++; step(); }, secs * 1000);
  };
  to = setTimeout(step, 1500);
}

/* ---------- guided routine ---------- */
function runRoutine(rk) {
  const t = TODAY(), done = routineDone(rk, t);
  const steps = S.routines[rk].filter(s => !done.includes(s.id));
  if (!steps.length) { toast('All steps already done today ✓'); return; }
  let i = 0, left = 0, iv = null;
  const d = openFull(`<div class="eyebrow">${ROUTINE_META[rk][0]} ${ROUTINE_META[rk][1]} routine</div>
    <div class="run-progress" style="margin-top:22px"></div><div class="small muted run-of"></div>
    <div class="run-step"></div><div class="run-timer"></div>
    <div class="actions"><button class="btn" data-a="runDone">${I.check} Done</button><button class="btn ghost" style="margin-top:8px" data-a="runSkip">Skip</button></div>`, {
    runDone() { const L = S.routineLog[t] = S.routineLog[t] || {}; (L[rk] = L[rk] || []).includes(steps[i].id) || L[rk].push(steps[i].id); save(); buzz(); i++; show(); },
    runSkip() { i++; show(); },
  }, () => clearInterval(iv));
  const pg = $('.run-progress', d), st = $('.run-step', d), tm = $('.run-timer', d), of = $('.run-of', d), acts = $('.actions', d);
  const paint = () => { tm.textContent = steps[i].mins ? `${Math.floor(left / 60)}:${pad(left % 60)}` : '✓'; tm.style.color = steps[i].mins && left === 0 ? 'var(--accent)' : ''; };
  function show() {
    clearInterval(iv);
    if (i >= steps.length) {
      pg.innerHTML = ''; of.textContent = ''; st.textContent = 'Routine complete!'; tm.textContent = '🎉'; tm.style.fontSize = '64px';
      acts.innerHTML = `<button class="btn" data-a="closeFull">Finish</button>`; confetti(); return;
    }
    pg.innerHTML = steps.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('');
    of.textContent = `Step ${i + 1} of ${steps.length}`; st.textContent = steps[i].title;
    left = (steps[i].mins || 0) * 60; paint();
    if (left) iv = setInterval(() => { if (left > 0) { left--; paint(); if (!left) buzz(); } }, 1000);
  }
  show();
}

/* =========================================================
   ACTIONS
   ========================================================= */
const A = {
  tab(el) { go(el.dataset.to); },
  go(el) { go(el.dataset.to); },
  plan(el) { if (el.dataset.r) ui.routine = el.dataset.r; go('plan/' + el.dataset.seg); },
  closeSheet() { closeSheet(); },
  closeFull() { closeFull(); },
  pick(el) {
    const g = el.dataset.g, v = el.dataset.v, wrap = el.closest('.sheet') || document;
    if (el.hasAttribute('data-multi')) { const s = new Set(form[g]); s.has(v) ? s.delete(v) : s.add(v); form[g] = [...s]; el.classList.toggle('on'); }
    else { form[g] = v; $$(`[data-g="${g}"]`, wrap).forEach(b => b.classList.toggle('on', b === el)); }
  },
  habit(el) {
    const h = S.habits.find(x => x.id === el.dataset.id), k = el.dataset.d || TODAY(); if (!h) return;
    const on = toggleHabit(h.id, k); buzz(); commit();
    if (on && k === TODAY()) {
      const hs = habitsFor(k);
      if (hs.length > 1 && hs.every(x => isDone(x, k))) { confetti(); toast('All habits done today! 🎉'); }
      else { const s = streak(h); if (s >= 3) toast(`🔥 ${s}-day streak!`); }
    }
  },
  task(el) {
    const x = S.tasks.find(t => t.id === el.dataset.id); if (!x) return;
    x.done = !x.done; x.doneAt = x.done ? TODAY() : ''; buzz(); commit();
  },
  newTask(el) { taskSheet(null, el.dataset.d); },
  editTask(el) { taskSheet(el.dataset.id); },
  taskFilter(el) { ui.taskFilter = el.dataset.v; render(); },
  clearDone() { confirmSheet('Clear completed tasks?', 'Completed tasks will be removed from your list.', 'Clear', () => { S.tasks = S.tasks.filter(t => !t.done); commit(); }); },
  newHabit() { habitSheet(); },
  editHabit(el) { habitSheet(el.dataset.id); },
  newGoal() { goalSheet(); },
  editGoal(el) { goalSheet(el.dataset.g); },
  goalStep(el) { const g = S.goals.find(x => x.id === el.dataset.g), s = g?.steps.find(x => x.id === el.dataset.id); if (!s) return; s.done = !s.done; buzz(); if (g.steps.every(x => x.done) && !g.done && s.done) toast('All steps done — mark the goal achieved? 🎯'); commit(); },
  addGoalStep(el) { const g = S.goals.find(x => x.id === el.dataset.g), t = val('#g-step').trim(); if (!t) return shake('#g-step'); g.steps.push({ id: uid(), title: t, done: false }); commit(); $('#g-step')?.focus(); },
  delGoalStep(el) { const g = S.goals.find(x => x.id === el.dataset.g); g.steps = g.steps.filter(s => s.id !== el.dataset.id); commit(); },
  goalDone(el) { const g = S.goals.find(x => x.id === el.dataset.g); g.done = !g.done; if (g.done) { confetti(); toast('Goal achieved! So proud of you 🎉'); } commit(); },
  delGoal(el) { const g = S.goals.find(x => x.id === el.dataset.g); confirmSheet('Delete goal?', `“${esc(g.title)}” will be permanently removed.`, 'Delete goal', () => { S.goals = S.goals.filter(x => x !== g); save(); go('plan/goals'); }); },
  routineTab(el) { ui.routine = el.dataset.v; ui.rEdit = false; render(); },
  routineEdit() { ui.rEdit = !ui.rEdit; render(); },
  routineStep(el) { const t = TODAY(), rk = ui.routine, L = S.routineLog[t] = S.routineLog[t] || {}, a = L[rk] = L[rk] || [], i = a.indexOf(el.dataset.id); i >= 0 ? a.splice(i, 1) : a.push(el.dataset.id); buzz(); commit(); if (S.routines[rk].every(s => a.includes(s.id)) && i < 0) { confetti(); toast(`${ROUTINE_META[rk][1]} routine complete ✨`); } },
  addStep() { const t = val('#r-step').trim(); if (!t) return shake('#r-step'); S.routines[ui.routine].push({ id: uid(), title: t, mins: +val('#r-mins') }); commit(); $('#r-step')?.focus(); },
  delStep(el) { S.routines[ui.routine] = S.routines[ui.routine].filter(s => s.id !== el.dataset.id); commit(); },
  resetRoutine(el) { const L = S.routineLog[TODAY()]; if (L) L[el.dataset.r] = []; commit(); },
  runRoutine(el) { runRoutine(el.dataset.r); },
  calMove(el) { const d = pd(ui.calMonth); d.setMonth(d.getMonth() + +el.dataset.v); ui.calMonth = dk(d); render(); },
  calSel(el) { ui.selDay = el.dataset.v; if (el.dataset.v.slice(0, 7) !== ui.calMonth.slice(0, 7)) ui.calMonth = el.dataset.v.slice(0, 8) + '01'; render(); },
  calToday() { ui.calMonth = TODAY().slice(0, 8) + '01'; ui.selDay = TODAY(); render(); },
  mood(el) { const t = TODAY(), v = +el.dataset.v; S.mood[t] = { ...(S.mood[t] || {}), mood: v }; buzz(); commit(); },
  energy(el) { const t = TODAY(); S.mood[t] = { ...(S.mood[t] || {}), energy: +el.dataset.v }; commit(); },
  water(el) {
    const t = TODAY(), g = S.profile.waterGoal, before = S.water[t] || 0;
    S.water[t] = clamp(before + +el.dataset.v, 0, 30); buzz(); commit();
    if (before < g && S.water[t] >= g) { confetti(); toast('Hydration goal reached 💧'); }
  },
  waterSet(el) {
    const t = TODAY(), v = +el.dataset.v, g = S.profile.waterGoal, before = S.water[t] || 0;
    S.water[t] = before === v ? v - 1 : v; buzz(); commit();
    if (before < g && S.water[t] >= g) { confetti(); toast('Hydration goal reached 💧'); }
  },
  logSleep(el) { sleepSheet(el.dataset.d); },
  logMove() { moveSheet(); },
  delMove(el) { S.moves = S.moves.filter(m => m.id !== el.dataset.id); commit(); },
  foodDay(el) { const k = addD(ui.foodDay || TODAY(), +el.dataset.v); if (k > TODAY()) return; ui.foodDay = k; render(); },
  foodFeel(el) { const k = ui.foodDay || TODAY(), m = S.meals[k] = S.meals[k] || {}; m.feel = m.feel === el.dataset.v ? '' : el.dataset.v; commit(); },
  breathe() { breathe(); },
  shufflePrompt() { ui.promptShift++; render(); },
  finishWrite() { save(); go('growth'); },
  delEntry() { confirmSheet('Delete entry?', 'This journal entry will be permanently removed.', 'Delete', () => { S.journal = S.journal.filter(j => j.id !== ui.writeId); save(); go('growth'); }); },
  editVision(el) { visionSheet(el.dataset.id); },
  editRead(el) { readSheet(el.dataset.id); },
  cycleRead(el) { const x = S.reading.find(r => r.id === el.dataset.id); x.status = { todo: 'doing', doing: 'done', done: 'todo' }[x.status]; commit(); },
  prange(el) { ui.prange = +el.dataset.v; render(); },
  editName() { nameSheet(false); },
  goal(el) { const k = el.dataset.k, lim = { waterGoal: [1, 20], sleepGoal: [4, 12], moveGoal: [5, 240], kcalGoal: [1000, 4000], proteinGoal: [20, 250], carbGoal: [50, 500], fatGoal: [20, 200] }[k]; S.profile[k] = clamp(+(S.profile[k] + +el.dataset.v).toFixed(1), ...lim); commit(); },
  theme(el) { S.profile.theme = el.dataset.v; commit(); },
  accent(el) { S.profile.accent = el.dataset.v; commit(); },
  async exportData() {
    const name = `reset-backup-${TODAY()}.json`, blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
    try {
      const file = new File([blob], name, { type: 'application/json' });
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'RESET backup' }); return; }
    } catch (e) { if (e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('Backup saved');
  },
  eraseAll() { confirmSheet('Erase everything?', 'All your habits, tasks, journal entries and history will be deleted from this device. Consider making a backup first.', 'Erase all data', () => { S = fresh(); seedHabits(S); S.profile.onboarded = true; commit(); toast('Fresh start 🌱'); go('home'); }); },
};

/* =========================================================
   v6 — BRAND, ART & MODULE FRAMEWORK
   ========================================================= */
const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="lgR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C9D9BC"/><stop offset=".6" stop-color="#8FB07C"/><stop offset="1" stop-color="#D9B97C"/></linearGradient></defs><path d="M26 7.2A14.5 14.5 0 1 0 34.3 22" fill="none" stroke="url(#lgR)" stroke-width="2.6" stroke-linecap="round"/><path d="M22.5 9.5c3.2-5.6 9.4-7.4 15-6.3-1.8 5.8-7.4 9-15 6.3z" fill="#88AC74"/><path d="M23.4 9.2c4-2.2 8-3.9 12.6-5" stroke="#EEF4E8" stroke-width=".9" fill="none" stroke-linecap="round"/></svg>`;
const WAVES = `<svg class="waves" viewBox="0 0 400 230" preserveAspectRatio="none" aria-hidden="true"><path d="M150 0C210 40 260 70 330 60 365 55 390 40 400 30V0Z" fill="var(--wave2)"/><path d="M220 0c30 50 80 95 140 90 18-1 32-6 40-12V0Z" fill="var(--wave1)"/><path d="M0 170c70-30 130 10 200-5s110-60 200-45" fill="none" stroke="var(--wave1)" stroke-width="2"/></svg>`;

Object.assign(I, {
  bell: svg('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.5 7.5 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a7.5 7.5 0 0 0-2.6 1.5L4.6 5.6l-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9a7.5 7.5 0 0 0 2.6 1.5l.5 2.5h4l.5-2.5a7.5 7.5 0 0 0 2.6-1.5l2.3.9 2-3.4z"/>'),
  steps: svg('<path d="M8.5 3.5c1.7 0 2.7 2 2.7 4.3S10 12 8.5 12 5.8 10.1 5.8 7.8s1-4.3 2.7-4.3zM6.3 14.6l4.4-.4.3 2.2a2.2 2.2 0 1 1-4.4.6zM15.5 7.5c1.7 0 2.7 2 2.7 4.3s-1.2 4.2-2.7 4.2-2.7-1.9-2.7-4.2 1-4.3 2.7-4.3zM13.3 18.6l4.4.4-.3 2.2a2.2 2.2 0 1 1-4.4-.5z"/>'),
  dumbbell: svg('<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>'),
  apple: svg('<path d="M12 7.6c-1.6-1-5.1-1.3-6.4 1.7-1.4 3.2.4 8.6 2.8 10.3 1.3.9 2.3.4 3.6.4s2.3.5 3.6-.4c2.4-1.7 4.2-7.1 2.8-10.3C17.1 6.3 13.6 6.6 12 7.6z"/><path d="M12 7.6c0-2 .8-3.6 2.8-4.6"/>'),
  mealcal: svg('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 9.5h17M8 3v4M16 3v4M9.5 12.5v5M8 12.5v1.8a1.5 1.5 0 0 0 3 0v-1.8M15 12.5v5M15 12.5c-1.2.6-1.7 1.6-1.7 2.8H15"/>'),
  bed: svg('<path d="M3 18.5V6M3 14h18v4.5M21 14v-2.5a3 3 0 0 0-3-3h-7.5V14"/><circle cx="7" cy="11" r="1.8"/>'),
  lotus: svg('<path d="M12 19c-3.5 0-7-2-8.5-5.5 2.5-.5 5.5.2 8.5 3 3-2.8 6-3.5 8.5-3C19 17 15.5 19 12 19z"/><path d="M12 16.5c-2-2.5-2.5-6.5 0-11 2.5 4.5 2 8.5 0 11zM8.2 14.6C6.8 12.2 7 9.6 7.6 8M15.8 14.6c1.4-2.4 1.2-5 .6-6.6"/>'),
  stretch: svg('<circle cx="12" cy="4.5" r="1.8"/><path d="M4 9l8 1.5L20 9M12 10.5V15l-3.5 6M12 15l3.5 6"/>'),
  grad: svg('<path d="M2.5 9 12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v4.5c1.5 1.5 3.5 2.2 5.5 2.2s4-.7 5.5-2.2V11M21.5 9v5"/>'),
  layers: svg('<path d="M12 3.5 21 8l-9 4.5L3 8z"/><path d="M3 12l9 4.5 9-4.5M3 16l9 4.5 9-4.5"/>'),
  palette: svg('<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.2-1-1.6-1-2.6 0-1 .8-1.7 1.8-1.7h2.2a3.7 3.7 0 0 0 3.7-3.7C20.5 6.9 16.7 3.5 12 3.5z"/><circle cx="7.8" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>'),
  brain: svg('<path d="M9.2 4.5A2.5 2.5 0 0 0 6.6 7a2.8 2.8 0 0 0-2 5 3 3 0 0 0 1.5 5 2.8 2.8 0 0 0 5 1.5V6.2a1.8 1.8 0 0 0-1.9-1.7zM14.8 4.5A2.5 2.5 0 0 1 17.4 7a2.8 2.8 0 0 1 2 5 3 3 0 0 1-1.5 5 2.8 2.8 0 0 1-5 1.5V6.2a1.8 1.8 0 0 1 1.9-1.7z"/>'),
  bookOpen: svg('<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5v13"/>'),
  star: svg('<path d="m12 3.8 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z"/>'),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  wallet: svg('<path d="M4 8a2 2 0 0 1 2-2h11.5v2.5"/><rect x="4" y="8.5" width="16.5" height="11" rx="2"/><path d="M16.5 14h.01"/>'),
  folder: svg('<path d="M3.5 7A1.5 1.5 0 0 1 5 5.5h4.5l2 2.5H19a1.5 1.5 0 0 1 1.5 1.5V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18z"/>'),
  chat: svg('<path d="M20 15a2 2 0 0 1-2 2H8l-4 3.5V6.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/>'),
  bulb: svg('<path d="M9 17.5h6M10 20.5h4M12 3.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-.6c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z"/>'),
  eye: svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
  cart: svg('<path d="M3 4h2.5l2 11h11l2-8H7"/><circle cx="9" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>'),
  leaf: svg('<path d="M5 19c0-8 5-13.5 15-14-.5 10-6 15-14 15M5 19l7-7"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'),
  list: svg('<path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01"/>'),
  heartHand: svg('<path d="M12 18.5s-6.5-3.8-6.5-8.8A3.7 3.7 0 0 1 12 7.4a3.7 3.7 0 0 1 6.5 2.3c0 5-6.5 8.8-6.5 8.8z"/>'),
});

/* soft illustrations (original, drawn in SVG) */
const ART = {
  stones: `<svg viewBox="0 0 320 120" aria-hidden="true"><defs><linearGradient id="aS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8F2E8"/><stop offset="1" stop-color="#EADFCC"/></linearGradient></defs><rect width="320" height="120" fill="url(#aS)"/><path d="M262 120c-2-28 6-54 24-74" stroke="#9DB58B" stroke-width="1.5" fill="none"/><path d="M270 82c-15-6-24-19-25-33 15 3 24 15 25 33zM279 63c9-13 23-18 35-17-3 13-17 20-35 17zM265 104c-16-1-29-10-34-24 16-1 29 8 34 24zM283 46c2-14 11-24 22-28 1 13-7 24-22 28z" fill="#BCCFAC"/><ellipse cx="150" cy="111" rx="62" ry="8" fill="#DDD0B9"/><ellipse cx="150" cy="98" rx="45" ry="14" fill="#B9AE9E"/><ellipse cx="148" cy="76" rx="34" ry="11.5" fill="#CCC2B2"/><ellipse cx="151" cy="57" rx="25" ry="9.5" fill="#ABA193"/><ellipse cx="149" cy="41" rx="16" ry="7.5" fill="#D6CDBE"/><path d="M30 120c10-20 20-30 34-36" stroke="#C7D6B9" stroke-width="1.2" fill="none"/><path d="M48 98c-10-3-16-11-16-20 10 2 16 10 16 20z" fill="#CFDCC2"/></svg>`,
  books: `<svg viewBox="0 0 320 120" aria-hidden="true"><defs><linearGradient id="aB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8F3EA"/><stop offset="1" stop-color="#ECE2D0"/></linearGradient></defs><rect width="320" height="120" fill="url(#aB)"/><rect x="88" y="94" width="128" height="16" rx="3" fill="#D8C9AE"/><rect x="96" y="78" width="112" height="16" rx="3" fill="#B9C8AA"/><rect x="92" y="62" width="120" height="16" rx="3" fill="#E3D7C2"/><rect x="100" y="46" width="104" height="16" rx="3" fill="#C9B79A"/><path d="M100 54h104M96 86h112" stroke="#fff" stroke-opacity=".5"/><path d="M244 110h28l-4-26h-20z" fill="#D9C7AA"/><path d="M258 84c-2-18 3-34 14-44M258 84c-8-10-18-14-28-12M258 84c8-10 20-12 30-9M260 66c-9-6-12-15-11-24" stroke="#93AE80" stroke-width="1.5" fill="none"/><path d="M272 40c4-8 11-12 18-12-2 8-9 13-18 12zM230 72c-6-6-7-13-5-19 6 4 8 11 5 19zM288 75c7-4 14-3 19 0-6 5-13 5-19 0zM249 42c-3-8-2-15 2-20 4 6 3 13-2 20z" fill="#B6CBA4"/></svg>`,
  lotus: `<svg viewBox="0 0 320 120" aria-hidden="true"><defs><linearGradient id="aL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7F1E6"/><stop offset="1" stop-color="#E7EEE0"/></linearGradient></defs><rect width="320" height="120" fill="url(#aL)"/><path d="M40 104c40-6 80 6 120 0s80-6 120 0" stroke="#C9D8BD" stroke-width="2" fill="none"/><path d="M70 114c30-4 60 4 90 0s60-4 90 0" stroke="#D9E3CF" stroke-width="2" fill="none"/><path d="M160 92c-10-14-12-36 0-58 12 22 10 44 0 58z" fill="#F2E3D3"/><path d="M160 92c-18-6-30-22-32-44 18 6 28 24 32 44zM160 92c18-6 30-22 32-44-18 6-28 24-32 44z" fill="#EAD3BF"/><path d="M160 94c-26 2-44-8-52-24 22-2 40 8 52 24zM160 94c26 2 44-8 52-24-22-2-40 8-52 24z" fill="#E2C6AF"/><ellipse cx="160" cy="96" rx="40" ry="5" fill="#B9CCA8"/></svg>`,
  sunrise: `<svg viewBox="0 0 320 120" aria-hidden="true"><defs><linearGradient id="aR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAF2E4"/><stop offset="1" stop-color="#F1E2C8"/></linearGradient></defs><rect width="320" height="120" fill="url(#aR)"/><circle cx="210" cy="78" r="26" fill="#EBCB92" opacity=".8"/><path d="M0 92c50-24 90-26 140-10s90 4 120-12 50-8 60-4v54H0z" fill="#C8D7B8"/><path d="M0 104c60-14 110-8 160 0s110 6 160-6v22H0z" fill="#A9C095"/><path d="M60 70c4-12 10-20 18-24M78 50c-2 6-1 12 2 16" stroke="#93AC80" stroke-width="1.2" fill="none"/></svg>`,
  leaves: `<svg viewBox="0 0 320 120" aria-hidden="true"><defs><linearGradient id="aV" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7F2E9"/><stop offset="1" stop-color="#E8EFE0"/></linearGradient></defs><rect width="320" height="120" fill="url(#aV)"/><path d="M40 120C90 80 150 60 230 54" stroke="#9DB58B" stroke-width="1.6" fill="none"/><g fill="#BED0AE"><path d="M80 92c-6-14-2-28 8-36 6 14 2 28-8 36zM112 76c-2-15 5-28 16-33 3 15-4 28-16 33zM146 66c1-15 10-26 22-29 0 15-9 26-22 29zM182 60c3-14 14-23 26-24-2 14-13 23-26 24z"/><path d="M96 96c14-6 28-4 36 4-14 6-28 4-36-4zM130 82c14-5 28-2 35 7-14 5-28 2-35-7zM166 72c14-4 27 0 34 9-14 4-27 0-34-9zM204 62c13-3 25 2 31 11-13 3-25-2-31-11z" fill="#CFDDC2"/></g><circle cx="272" cy="34" r="14" fill="#EBD7AE" opacity=".7"/></svg>`,
  mountain: `<svg viewBox="0 0 320 120" aria-hidden="true"><defs><linearGradient id="aM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6EEE2"/><stop offset="1" stop-color="#EFD9BC"/></linearGradient></defs><rect width="320" height="120" fill="url(#aM)"/><circle cx="160" cy="70" r="22" fill="#F0CF98"/><path d="M0 90l60-36 40 22 60-44 70 50 40-20 50 28v30H0z" fill="#B7C9A6"/><path d="M0 104l80-20 60 12 70-18 110 22v20H0z" fill="#93AE80"/></svg>`,
};
const art = k => `<div class="art">${ART[k]}</div>`;

/* ---------- framework ---------- */
ui.mt = ui.mt || {};
const curTab = (k, tabs) => tabs.some(t => t[0] === ui.mt[k]) ? ui.mt[k] : tabs[0][0];
function pendingReminders() {
  const t = TODAY(), r = [];
  habitsFor(t).filter(h => !isDone(h, t)).forEach(h => r.push([h.emoji, h.title, 'Habit', 'plan/habits']));
  S.tasks.filter(x => !x.done && x.date && x.date <= t).forEach(x => r.push(['✅', x.title, x.date < t ? 'Overdue task' : 'Task' + (x.time ? ' · ' + x.time : ''), 'plan/tasks']));
  const w = S.water[t] || 0; if (w < S.profile.waterGoal) r.push(['💧', `${S.profile.waterGoal - w} more glasses of water`, 'Hydration', 'health/water']);
  if (!S.mood[t]?.mood) r.push(['🌿', 'Check in with how you feel', 'Wellness', 'health/wellness']);
  return r;
}
function appHead() {
  const n = pendingReminders().length;
  return `<div class="apphead"><button class="logo" data-a="go" data-to="home" aria-label="RESET home">${LOGO}<span>RESET</span></button><div class="headicons"><button class="hicon" data-a="reminders" aria-label="Reminders">${I.bell}${n ? '<i class="hdot"></i>' : ''}</button><button class="hicon" data-a="go" data-to="profile" aria-label="Settings">${I.gear}</button></div></div>`;
}
function modHead(key, title, back, tabs = []) {
  const t = tabs.length ? curTab(key, tabs) : '';
  return [`${WAVES}${appHead()}<div class="subhead"><button class="backcirc" data-a="go" data-to="${back}" aria-label="Back">${I.left}</button><h1 class="title sm">${title}</h1><span class="sp"></span></div>${tabs.length ? `<div class="ptabs">${tabs.map(([id, l]) => `<button class="${t === id ? 'on' : ''}" data-a="mtab" data-k="${key}" data-v="${id}">${l}</button>`).join('')}</div>` : ''}`, t];
}
const hubTiles = mods => `<div class="tiles">${mods.map(([to, l, ic, sub], i) => `<button class="mtile ${mods.length % 2 && i === mods.length - 1 ? 'wide' : ''}" data-a="go" data-to="${to}">${ic}<span>${mods.length % 2 && i === mods.length - 1 ? `<b>${l}</b><br><small>${sub || ''}</small>` : `<b>${l}</b>`}</span>${!(mods.length % 2 && i === mods.length - 1) && sub ? `<small>${sub}</small>` : ''}</button>`).join('')}</div>`;
const nrow = (ic, t, sub, attrs, right = I.right) => `<button class="nrow" ${attrs}><span class="ni">${ic}</span><span class="body"><span class="t">${t}</span>${sub ? `<span class="m">${sub}</span>` : ''}</span><span class="chev">${right}</span></button>`;
const pbar = (p, c) => `<div class="bar" style="--c:${c || 'var(--accent)'}"><i style="width:${clamp(p, 0, 1) * 100}%"></i></div>`;
const listCard = inner => `<section class="card" style="padding:4px 18px">${inner}</section>`;
const pill = (a, label, attrs = '') => `<div class="pill-wrap"><button class="pill" data-a="${a}" ${attrs}>${I.plus} ${label}</button></div>`;
const sectionT = (t, right = '') => `<div class="section-title"><span class="h2">${t}</span>${right}</div>`;
const kv = (ic, k, v) => `<div class="kv">${ic}<span class="k">${k}</span><b>${v}</b></div>`;

/* generic form sheet */
function itemSheet({ title, item, fields, onSave, onDel, extra = '', saveLabel }) {
  form = {};
  const v = item || {};
  const html = fields.map(f => {
    const v0 = v[f.k] ?? f.def ?? '';
    if (f.t === 'pick' || f.t === 'multi') {
      form[f.k] = f.t === 'multi' ? (v0 || []).map(String) : String(v0);
      return `<div class="field"><span>${f.l}</span><div class="${f.cls || 'chips'}" style="margin:0">${pickGroup(f.k, f.opts.map(o => [String(o[0]), o[1], f.ocls || 'chip']), form[f.k], f.t === 'multi')}</div></div>`;
    }
    if (f.t === 'range') return `<label class="field"><span>${f.l} · <b id="rv-${f.k}">${v0 || 0}%</b></span><input type="range" class="range" id="ff-${f.k}" data-rv="rv-${f.k}" min="0" max="100" step="5" value="${v0 || 0}"></label>`;
    if (f.t === 'textarea') return `<label class="field"><span>${f.l}</span><textarea class="input" id="ff-${f.k}" placeholder="${esc(f.ph || '')}" rows="${f.rows || 3}">${esc(v0)}</textarea></label>`;
    return `<label class="field"><span>${f.l}</span><input class="input" id="ff-${f.k}" type="${f.t || 'text'}" ${f.t === 'number' ? 'inputmode="decimal" min="0"' : ''} placeholder="${esc(f.ph || '')}" value="${esc(v0)}" autocomplete="off"></label>`;
  }).join('');
  return openSheet(title, html + extra + `<button class="btn" data-a="save">${saveLabel || (item ? 'Save' : 'Add')}</button>` + (item && onDel ? `<button class="btn danger" style="margin-top:6px" data-a="del">Delete</button>` : ''), {
    save() {
      const out = {};
      for (const f of fields) {
        if (f.t === 'pick' || f.t === 'multi') out[f.k] = form[f.k];
        else { let x = val('#ff-' + f.k); if (f.t === 'number' || f.t === 'range') x = x === '' ? 0 : +x; else x = x.trim(); out[f.k] = x; }
        if (f.req && !out[f.k]) { shake('#ff-' + f.k); return; }
      }
      closeSheet(); onSave(out); commit();
    },
    del() { closeSheet(); onDel(); commit(); },
  });
}

/* guided steps player (routines, workouts, mobility, meditation) */
function runSteps({ label, steps, onStep, onFinish, auto = false, doneTitle = 'Well done 🌿' }) {
  let i = 0, left = 0, iv = null; const t0 = Date.now();
  const d = openFull(`<div class="eyebrow">${label}</div><div class="run-progress" style="margin-top:22px"></div><div class="small muted run-of"></div><div class="run-step"></div><div class="run-note muted"></div><div class="run-timer"></div>
    <div class="actions"><button class="btn" data-a="runDone">${I.check} ${auto ? 'Next' : 'Done'}</button><button class="btn ghost" style="margin-top:8px" data-a="runSkip">Skip</button></div>`, {
    runDone() { onStep && onStep(steps[i]); buzz(); i++; show(); },
    runSkip() { i++; show(); },
  }, () => clearInterval(iv));
  const pg = $('.run-progress', d), st = $('.run-step', d), nt = $('.run-note', d), tm = $('.run-timer', d), of = $('.run-of', d), acts = $('.actions', d);
  const paint = () => { tm.textContent = steps[i].secs ? `${Math.floor(left / 60)}:${pad(left % 60)}` : (steps[i].reps || '✓'); };
  function show() {
    clearInterval(iv);
    if (i >= steps.length) {
      pg.innerHTML = ''; of.textContent = ''; nt.textContent = 'Take a moment to notice how you feel.'; st.textContent = doneTitle; tm.textContent = '🎉';
      acts.innerHTML = `<button class="btn" data-a="closeFull">Finish</button>`;
      onFinish && onFinish(Math.max(1, Math.round((Date.now() - t0) / 60000))); save(); confetti(); return;
    }
    pg.innerHTML = steps.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('');
    of.textContent = `Step ${i + 1} of ${steps.length}`; st.textContent = steps[i].title; nt.textContent = steps[i].note || '';
    left = steps[i].secs || 0; paint();
    if (left) iv = setInterval(() => { if (left > 0) { left--; paint(); if (!left) { buzz(); if (auto) { onStep && onStep(steps[i]); i++; show(); } } } }, 1000);
  }
  show();
}

/* ---------- built-in content (original) ---------- */
const WORKOUT_TEMPLATES = [
  { id: 't-full', name: 'Full Body Beginner', mins: 25, ex: [['Bodyweight squats', 3, '12'], ['Knee push-ups', 3, '10'], ['Glute bridges', 3, '15'], ['Reverse lunges', 3, '10 / leg'], ['Plank', 3, '30 sec']] },
  { id: 't-tone', name: 'Strength & Tone', mins: 35, ex: [['Goblet squats', 3, '12'], ['Dumbbell rows', 3, '12 / arm'], ['Romanian deadlifts', 3, '12'], ['Shoulder press', 3, '10'], ['Walking lunges', 3, '10 / leg'], ['Dead bug', 3, '10 / side']] },
  { id: 't-core', name: 'Core & Posture', mins: 15, ex: [['Bird dog', 3, '10 / side'], ['Side plank', 2, '25 sec / side'], ['Dead bug', 3, '10 / side'], ['Superman hold', 3, '20 sec'], ['Glute bridge march', 2, '10 / side']] },
  { id: 't-cardio', name: 'Low-Impact Cardio', mins: 20, ex: [['March in place', 1, '2 min'], ['Step jacks', 3, '40 sec'], ['Standing knee drives', 3, '40 sec'], ['Squat to calf raise', 3, '12'], ['Side steps with arm reach', 3, '40 sec'], ['Cool-down walk', 1, '3 min']] },
];
const EXERCISES = [
  ['Bodyweight squats', 'Legs', 'Feet hip-width apart. Sit back as if into a chair, chest up, knees tracking over your toes.'],
  ['Reverse lunges', 'Legs', 'Step one foot back and lower both knees to about 90°. Push through the front heel to return.'],
  ['Glute bridges', 'Legs', 'Lie on your back, knees bent. Press through your heels and lift your hips, squeezing your glutes.'],
  ['Calf raises', 'Legs', 'Rise slowly onto the balls of your feet, pause, then lower with control.'],
  ['Knee push-ups', 'Upper body', 'Hands under shoulders, knees down, body in a straight line. Lower your chest, then press up.'],
  ['Dumbbell rows', 'Upper body', 'Hinge forward with a flat back and pull the weight toward your hip, elbow close to your body.'],
  ['Shoulder press', 'Upper body', 'Weights at shoulder height, press overhead without arching your lower back.'],
  ['Chair triceps dips', 'Upper body', 'Hands on a sturdy chair behind you. Bend your elbows to lower, then press back up.'],
  ['Plank', 'Core', 'Forearms down, body long from head to heels. Breathe steadily and keep your hips level.'],
  ['Dead bug', 'Core', 'On your back, arms and knees up. Lower opposite arm and leg slowly while your back stays flat.'],
  ['Bird dog', 'Core', 'On all fours, reach opposite arm and leg long. Pause, return, switch sides.'],
  ['Side plank', 'Core', 'Elbow under shoulder, hips lifted in a straight line. Knees down for an easier version.'],
  ['Step jacks', 'Cardio', 'A low-impact jumping jack: step one foot out at a time while raising your arms.'],
  ['March in place', 'Cardio', 'Lift your knees and swing your arms at a comfortable, steady pace.'],
  ['Standing knee drives', 'Cardio', 'Drive one knee up toward your chest while pulling your arms down. Alternate sides.'],
  ['Squat to calf raise', 'Cardio', 'Squat down, stand up tall, then rise onto your toes. Keep a smooth rhythm.'],
];
const MOBILITY = [
  { id: 'm-full', name: 'Full Body Mobility', steps: [['Neck rolls', 45, 'Slow circles, both directions. Keep your shoulders soft.'], ['Shoulder circles', 45, 'Big, relaxed circles backward and forward.'], ['Cat–cow', 60, 'On all fours, round and arch your back with your breath.'], ['World’s greatest stretch — left', 45, 'Lunge, hand down inside your front foot, rotate and reach up.'], ['World’s greatest stretch — right', 45, 'Same on the other side.'], ['Hip flexor stretch — left', 45, 'Half-kneel, tuck your pelvis, lean gently forward.'], ['Hip flexor stretch — right', 45, 'Same on the other side.'], ['Standing forward fold', 60, 'Soft knees, let your head and arms hang heavy.'], ['Thread the needle', 60, 'From all fours, slide one arm under your body. Switch halfway.'], ['Child’s pose', 60, 'Knees wide, arms long, breathe into your back.']] },
  { id: 'm-morning', name: 'Morning Wake-Up', steps: [['Full-body reach', 30, 'Stretch your arms overhead and rise onto your toes.'], ['Side bends', 40, 'Reach one arm over and lean gently. Alternate sides.'], ['Cat–cow', 45, 'Move slowly with your breath.'], ['Hip circles', 40, 'Hands on hips, draw big circles both ways.'], ['Ankle rolls', 30, 'Circle each ankle a few times.'], ['Deep breaths', 30, 'Three slow breaths in through the nose, out through the mouth.']] },
  { id: 'm-desk', name: 'Desk Reset', steps: [['Chin tucks', 30, 'Gently draw your chin back, lengthening the back of your neck.'], ['Upper-trap stretch', 40, 'Ear toward shoulder, opposite hand reaching down. Switch halfway.'], ['Seated twist', 40, 'Sit tall and rotate gently to each side.'], ['Chest opener', 40, 'Clasp hands behind you, lift your chest, squeeze shoulder blades.'], ['Wrist & finger stretch', 30, 'Extend an arm, gently pull your fingers back. Switch.']] },
  { id: 'm-evening', name: 'Evening Unwind', steps: [['Seated forward fold', 60, 'Legs long, fold forward without forcing.'], ['Figure-four stretch', 60, 'On your back, ankle over opposite knee. Switch halfway.'], ['Supine twist', 60, 'Knees to one side, arms wide. Switch halfway.'], ['Happy baby', 45, 'Hold the outsides of your feet and rock gently.'], ['Legs up the wall', 90, 'Rest and breathe slowly.']] },
  { id: 'm-posture', name: 'Posture & Alignment', steps: [['Wall angels', 45, 'Back against the wall, slide your arms up and down slowly.'], ['Doorway chest stretch', 45, 'Forearms on a door frame, step through gently.'], ['Thoracic extension', 45, 'Hands behind your head, lift your chest toward the ceiling.'], ['Glute bridge hold', 40, 'Lift your hips and hold, breathing steadily.'], ['Standing tall check', 30, 'Feet grounded, crown lifted, shoulders relaxed.']] },
];
const mobMins = r => Math.round(sum(r.steps.map(s => s[1])) / 60);
const AFFIRMATIONS = ['I am allowed to take up space.', 'I grow a little every day.', 'I can do hard things, gently.', 'My pace is enough.', 'I choose calm over hurry.', 'I am learning to trust myself.', 'Rest makes me stronger.', 'I am worthy of the care I give others.', 'Today I focus on what I can control.', 'I welcome new beginnings.', 'My voice matters.', 'I am proud of how far I have come.', 'I treat my body with kindness.', 'Small steps still move me forward.'];
const SELFCARE = ['Take a warm shower or bath', 'Step outside for fresh air', 'Tidy one small space', 'Message someone you love', 'Listen to a favourite album', 'Cook something nourishing', 'Go to bed 30 minutes earlier', 'Spend 10 minutes without your phone', 'Stretch for 5 minutes', 'Write down one thing you’re proud of'];
const GROUNDING = [['5 things you can see', 30, 'Look around slowly and name them quietly.'], ['4 things you can touch', 30, 'Notice their texture and temperature.'], ['3 things you can hear', 30, 'Near and far sounds.'], ['2 things you can smell', 25, 'Or two scents you love.'], ['1 thing you can taste', 20, 'Or one thing you’re grateful for.'], ['One slow breath', 15, 'In for 4, out for 6.']];
const CREATIVE_PROMPTS = ['Write a song verse about your morning.', 'Take 5 photos of one colour around you.', 'Rearrange a favourite song in a new style.', 'Sketch your view from where you are sitting.', 'Write a 6-word story about today.', 'Cook a dish using only 5 ingredients.', 'Make a playlist that tells a story.', 'Describe a memory using only sounds and smells.', 'Hum a melody and record it before you forget.', 'Design your dream creative space on paper.', 'Write a letter to yourself in 5 years.', 'Turn a mistake into a new idea.'];
const LIFE_SKILLS = [
  ['productivity', 'Productivity', I.target, ['Choose your top 3 tasks each morning', 'Work in 25-minute focus blocks', 'Batch similar tasks together', 'Turn off non-essential notifications', 'End the day by planning tomorrow']],
  ['time', 'Time Management', I.clock, ['Time-block your calendar for deep work', 'Use the 2-minute rule for tiny tasks', 'Compare estimates with real time spent', 'Leave buffers between appointments', 'Say no to one thing that doesn’t fit your priorities']],
  ['finance', 'Finance Basics', I.wallet, ['Track every expense for one week', 'Set a simple monthly budget', 'Automate a small saving each payday', 'Start an emergency fund, step by step', 'Review subscriptions and cancel unused ones']],
  ['organization', 'Organization', I.folder, ['Give everything a home', 'Do a 10-minute daily tidy', 'Keep one place for notes and ideas', 'Declutter one drawer this week', 'Prepare tomorrow’s essentials the night before']],
  ['communication', 'Communication', I.chat, ['Listen to understand, not to reply', 'Use “I feel… when…” statements', 'Ask one open question in each conversation', 'Summarise back what you heard', 'Give specific, kind feedback']],
  ['wellbeing', 'Well-being & Balance', I.leaf, ['Protect a consistent sleep window', 'Schedule one restful activity each week', 'Set a clear end to your workday', 'Spend time in nature', 'Check in with your feelings without judgement']],
];
const PRACTICES = {
  mindfulness: ['Mindfulness', I.sun, '5–10 min', 'Rest your attention on the present moment: your breath, your body, the sounds around you. When your mind wanders, gently come back.'],
  meditation: ['Meditation', I.lotus, '5–20 min', 'Sit comfortably, close your eyes and follow your breath. There is nothing to achieve — just be here.'],
};

/* ---------- reminders (bell) ---------- */
A.reminders = () => {
  const r = pendingReminders();
  openSheet('Today', r.length ? `<p class="muted" style="margin:-8px 0 10px">${plural(r.length, 'thing')} still waiting for you — no pressure.</p><div>${r.map(([e, t, m, to]) => `<button class="nrow" data-a="remGo" data-to="${to}"><span class="ni">${e}</span><span class="body"><span class="t">${esc(t)}</span><span class="m">${m}</span></span><span class="chev">${I.right}</span></button>`).join('')}</div>` : emptyState('🌿', 'All caught up. Enjoy your day.'), { remGo(el) { closeSheet(true); go(el.dataset.to); } });
};
A.mtab = el => { ui.mt[el.dataset.k] = el.dataset.v; render(); };

/* =========================================================
   HEALTH
   ========================================================= */
SCREENS.health = r => {
  const map = { move: 'movement', mood: 'wellness', food: 'nutrition' };
  const sub = map[r.sub] || r.sub;
  const fn = { movement: hMovement, workout: hWorkout, nutrition: hNutrition, meals: hMeals, sleep: hSleep, water: hWater, wellness: hWellness, mobility: hMobility }[sub];
  if (fn) return fn(r);
  const t = TODAY(), fk = sum(foodItems(t).map(f => +f.kcal || 0)), sl = S.sleep[t];
  return `${WAVES}${appHead()}<h1 class="title">Health</h1><p class="hub-sub">Care for your body, mind and energy.</p>
  ${hubTiles([
    ['health/movement', 'Movement', I.steps, `${moveMins(t)} of ${S.profile.moveGoal} min`],
    ['health/workout', 'Workout Planner', I.dumbbell, S.workouts.length ? plural(S.workouts.length, 'workout') : 'Start a plan'],
    ['health/nutrition', 'Nutrition', I.apple, fk ? `${fk} kcal today` : 'Food diary'],
    ['health/meals', 'Meal Planner', I.mealcal, 'Plan · recipes · shopping'],
    ['health/sleep', 'Sleep', I.bed, sl ? hours(sl.hours) + ' last night' : 'Log last night'],
    ['health/water', 'Water', I.drop, `${S.water[t] || 0} of ${S.profile.waterGoal} glasses`],
    ['health/wellness', 'Wellness', I.lotus, S.mood[t]?.mood ? MOODS[S.mood[t].mood - 1].e + ' ' + MOODS[S.mood[t].mood - 1].t : 'Mood & mindfulness'],
    ['health/mobility', 'Mobility & Flexibility', I.stretch, `Today: ${MOBILITY[dayNum(t) % MOBILITY.length].name}`],
  ])}
  <section class="card tint-accent"><div class="small" style="color:var(--ink2)">RESET is a gentle companion, not medical advice. Listen to your body and check in with a professional when something doesn’t feel right.</div></section>`;
};

/* ---------- Movement ---------- */
const ACT = id => ACTIVITIES.find(a => a[0] === id) || ACTIVITIES[7];
function hMovement() {
  const [h, tab] = modHead('movement', 'Movement', 'health', [['today', 'Today'], ['week', 'Week'], ['month', 'Month']]);
  const t = TODAY(), g = S.profile.moveGoal;
  if (tab === 'today') {
    const mv = moveMins(t), list = S.moves.filter(m => m.date === t);
    return h + `<section class="card hero">${ring(mv / g, 124, 11, 'var(--accent)', `<div>${I.steps.replace('<svg', '<svg style="width:22px;height:22px;margin:0 auto 2px;color:var(--accent-strong)"')}<b>${mv}</b><small>min</small></div>`)}
      <div class="hero-stats">${kv('', 'Daily goal', `${g} min`)}${kv('', 'Activities', list.length)}${kv('', 'Progress', Math.round(clamp(mv / g, 0, 1) * 100) + '%')}</div></section>
      ${pbar(mv / g)}<div style="height:14px"></div>
      ${sectionT('Activity')}
      ${list.length ? listCard(list.map(m => `<div class="item"><span style="font-size:24px">${ACT(m.type)[1]}</span><div class="body"><div class="t">${m.label || ACT(m.type)[2]}</div><div class="m">${m.mins} min</div></div><button class="delx" data-a="delMove" data-id="${m.id}" aria-label="Remove">${I.x}</button></div>`).join('')) : `<section class="card">${emptyState('🚶', 'Any movement counts. A short walk is a beautiful start.')}</section>`}
      ${pill('logMove', 'Log activity')}`;
  }
  const n = tab === 'week' ? 7 : 30, days = daysBack(n), vals = days.map(moveMins), tot = sum(vals);
  const by = {}; S.moves.filter(m => m.date >= days[0]).forEach(m => by[m.type] = (by[m.type] || 0) + (+m.mins || 0));
  const top = Object.entries(by).sort((a, b) => b[1] - a[1]);
  return h + `<div class="grid2"><div class="card stat" style="margin:0"><div class="v">${tot}<small> min</small></div><div class="k">Total active time</div></div><div class="card stat" style="margin:0"><div class="v">${days.filter(k => moveMins(k) >= g).length}<small>/${n}</small></div><div class="k">Goal days</div></div></div>
    <section class="card"><div class="card-head"><span class="eyebrow">Active minutes</span><span class="small muted">goal ${g}</span></div>${bars(vals, days.map(k => shortLbl(k, n)), { color: 'var(--accent)', goal: g })}</section>
    ${top.length ? `<section class="card"><div class="card-head"><span class="eyebrow">Favourite activities</span></div>${top.map(([k, m]) => `<div class="kv"><span style="font-size:20px">${ACT(k)[1]}</span><span class="k">${ACT(k)[2]}</span><b>${m} min</b></div>`).join('')}</section>` : ''}`;
}

/* ---------- Workout planner ---------- */
const parseEx = txt => txt.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const m = l.match(/^(.*?)\s*[—\-–:]?\s*(\d+)\s*[x×]\s*(.+)$/i); return m ? { id: uid(), name: m[1].trim(), sets: +m[2], reps: m[3].trim() } : { id: uid(), name: l, sets: 1, reps: '' }; });
const exText = ex => ex.map(e => `${e.name} ${e.sets}x${e.reps}`).join('\n');
function workoutSheet(id) {
  const w = id ? S.workouts.find(x => x.id === id) : null;
  itemSheet({
    title: w ? 'Edit workout' : 'New workout', item: w ? { ...w, exs: exText(w.exercises), days: w.days } : { days: [] },
    fields: [{ k: 'name', l: 'Name', req: 1, ph: 'e.g. Strength & Tone' }, { k: 'days', l: 'Planned days', t: 'multi', cls: 'days', ocls: '', opts: DAY_ORDER.map(d => [d, DAY_LETTER[d]]) }, { k: 'mins', l: 'Approx. minutes', t: 'number', def: 30 }, { k: 'exs', l: 'Exercises — one per line, e.g. “Squats 3x12”', t: 'textarea', rows: 6, ph: 'Squats 3x12\nPush-ups 3x10\nPlank 3x30 sec' }],
    onSave: o => { const data = { name: o.name, days: o.days.map(Number), mins: o.mins || 30, exercises: parseEx(o.exs) }; if (w) Object.assign(w, data); else S.workouts.push({ id: uid(), created: TODAY(), ...data }); },
    onDel: () => { S.workouts = S.workouts.filter(x => x !== w); },
  });
}
function startWorkout(w) {
  const steps = w.exercises.map(e => ({ title: e.name, reps: e.reps ? `${e.sets} × ${e.reps}` : '✓', note: (EXERCISES.find(x => x[0].toLowerCase() === e.name.toLowerCase()) || [])[2] || '' }));
  if (!steps.length) return toast('Add some exercises first');
  runSteps({ label: '💪 ' + w.name, steps, onFinish: mins => { const m = Math.max(mins, 5); S.workoutLog.push({ id: uid(), date: TODAY(), wid: w.id, name: w.name, mins: m }); S.moves.push({ id: uid(), date: TODAY(), type: 'strength', mins: m, label: w.name }); }, doneTitle: 'Workout complete!' });
}
function hWorkout() {
  const [h, tab] = modHead('workout', 'Workout Planner', 'health', [['mine', 'My Workouts'], ['library', 'Library'], ['progress', 'Progress']]);
  const t = TODAY();
  if (tab === 'mine') {
    const todays = S.workouts.filter(w => w.days?.includes(dow(t)));
    const cur = todays[0] || S.workouts[0];
    const weekDone = S.workoutLog.filter(l => l.date >= addD(t, -6)).length;
    return h + (cur ? `<div class="art-card">${art('sunrise')}<div class="inner"><div class="eyebrow">${todays.length ? 'Today’s workout' : 'Current program'}</div><div class="h2" style="margin:4px 0 2px">${esc(cur.name)}</div><div class="small muted">${plural(cur.exercises.length, 'exercise')} · about ${cur.mins} min${cur.days?.length ? ' · ' + plural(cur.days.length, 'day') + ' per week' : ''}</div>
      <div class="row small" style="margin-top:12px"><span class="muted">This week</span><span class="spacer"></span><b>${weekDone}/${cur.days?.length || 3} sessions</b></div>${pbar(weekDone / (cur.days?.length || 3))}
      <button class="btn" style="margin-top:14px" data-a="wStart" data-id="${cur.id}">${I.play} Start workout</button></div></div>` : `<div class="art-card">${art('sunrise')}<div class="inner"><div class="h3">Build your first workout</div><p class="small muted" style="margin:4px 0 12px">Create your own, or add a ready-made plan from the Library.</p><button class="btn soft" data-a="mtab" data-k="workout" data-v="library">Browse library</button></div></div>`)
      + (S.workouts.length ? sectionT('My workouts') + listCard(S.workouts.map(w => `<div class="item"><span class="ni" style="width:42px;height:42px;border-radius:14px;background:var(--accent-soft);display:grid;place-items:center;color:var(--accent-strong)">${I.dumbbell}</span><button class="body" style="text-align:left" data-a="wEdit" data-id="${w.id}"><div class="t">${esc(w.name)}</div><div class="m">${plural(w.exercises.length, 'exercise')} · ${w.mins} min${w.days?.length ? ' · ' + DAY_ORDER.filter(d => w.days.includes(d)).map(d => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d]).join(' ') : ''}</div></button><button class="iconbtn" data-a="wStart" data-id="${w.id}" aria-label="Start" style="color:var(--accent-strong)">${I.play}</button></div>`).join('')) : '')
      + pill('wNew', 'New workout');
  }
  if (tab === 'library') {
    const cats = [...new Set(EXERCISES.map(e => e[1]))];
    return h + sectionT('Ready-made plans') + listCard(WORKOUT_TEMPLATES.map(w => `<div class="item"><span class="ni" style="width:42px;height:42px;border-radius:14px;background:var(--sand-soft);display:grid;place-items:center;font-size:20px">🏋️</span><div class="body"><div class="t">${w.name}</div><div class="m">${plural(w.ex.length, 'exercise')} · ${w.mins} min</div></div><button class="btn soft sm" data-a="wAdd" data-id="${w.id}">${S.workouts.some(x => x.tpl === w.id) ? 'Added ✓' : 'Add'}</button></div>`).join(''))
      + sectionT('Exercise library') + cats.map(c => `<div class="eyebrow" style="margin:14px 2px 8px">${c}</div>` + listCard(EXERCISES.filter(e => e[1] === c).map(e => `<button class="nrow" data-a="exInfo" data-n="${esc(e[0])}"><span class="body"><span class="t">${e[0]}</span><span class="m" style="display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden">${e[2]}</span></span><span class="chev">${I.right}</span></button>`).join(''))).join('');
  }
  const weeks = 8, mon = addD(t, -((dow(t) + 6) % 7) - (weeks - 1) * 7);
  const wk = Array.from({ length: weeks }, (_, i) => { const s = addD(mon, i * 7), e = addD(s, 6); return S.workoutLog.filter(l => l.date >= s && l.date <= e).length; });
  const recent = [...S.workoutLog].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  return h + `<div class="grid2"><div class="card stat" style="margin:0"><div class="v">${S.workoutLog.length}</div><div class="k">Workouts done</div></div><div class="card stat" style="margin:0"><div class="v">${sum(S.workoutLog.map(l => l.mins))}<small> min</small></div><div class="k">Training time</div></div></div>
    <section class="card"><div class="card-head"><span class="eyebrow">Sessions per week</span></div>${bars(wk, wk.map((_, i) => i === weeks - 1 ? 'Now' : `-${weeks - 1 - i}w`), { color: 'var(--accent)' })}</section>
    ${recent.length ? sectionT('Recent') + listCard(recent.map(l => `<div class="item"><span style="font-size:22px">💪</span><div class="body"><div class="t">${esc(l.name)}</div><div class="m">${relDay(l.date)} · ${l.mins} min</div></div></div>`).join('')) : `<section class="card">${emptyState('🌱', 'Your completed workouts will appear here.')}</section>`}`;
}
Object.assign(A, {
  wNew() { workoutSheet(); }, wEdit(el) { workoutSheet(el.dataset.id); },
  wStart(el) { const w = S.workouts.find(x => x.id === el.dataset.id); if (w) startWorkout(w); },
  wAdd(el) { const tp = WORKOUT_TEMPLATES.find(x => x.id === el.dataset.id); if (S.workouts.some(x => x.tpl === tp.id)) return toast('Already in My Workouts'); S.workouts.push({ id: uid(), tpl: tp.id, name: tp.name, mins: tp.mins, days: [1, 3, 5], created: TODAY(), exercises: tp.ex.map(([n, s, r]) => ({ id: uid(), name: n, sets: s, reps: r })) }); commit(); toast('Added to My Workouts ✓'); },
  exInfo(el) { const e = EXERCISES.find(x => x[0] === el.dataset.n); openSheet(e[0], `<span class="tag green">${e[1]}</span><p style="font-size:17px;line-height:1.5;margin:14px 0 20px">${e[2]}</p><p class="small muted">Move within a comfortable range. Stop if anything hurts.</p><button class="btn ghost" data-a="closeSheet">Close</button>`); },
});

/* ---------- Nutrition ---------- */
const foodItems = k => MEALS.flatMap(([m]) => (S.food[k]?.[m] || []));
function foodSheet(meal, id) {
  const k = ui.foodDay || TODAY(), arr = ((S.food[k] = S.food[k] || {})[meal] = S.food[k][meal] || []);
  const x = id ? arr.find(f => f.id === id) : null;
  const recent = S.foodRecent.slice(0, 10);
  itemSheet({
    title: x ? 'Edit food' : 'Add to ' + MEALS.find(m => m[0] === meal)[2].toLowerCase(), item: x,
    fields: [{ k: 'name', l: 'Food', req: 1, ph: 'e.g. Greek yogurt with berries' }, { k: 'kcal', l: 'Calories (kcal)', t: 'number', ph: 'optional' }, { k: 'p', l: 'Protein (g)', t: 'number', ph: '0' }, { k: 'c', l: 'Carbs (g)', t: 'number', ph: '0' }, { k: 'f', l: 'Fat (g)', t: 'number', ph: '0' }],
    extra: !x && recent.length ? `<div class="field"><span>Recent — tap to add</span><div class="chips" style="margin:0">${recent.map((r, i) => `<button class="chip" data-a="recentFood" data-i="${i}">${esc(r.name)}${r.kcal ? ` · ${r.kcal}` : ''}</button>`).join('')}</div></div>` : '',
    onSave: o => { if (x) Object.assign(x, o); else { arr.push({ id: uid(), ...o }); S.foodRecent = [{ name: o.name, kcal: o.kcal, p: o.p, c: o.c, f: o.f }, ...S.foodRecent.filter(r => r.name.toLowerCase() !== o.name.toLowerCase())].slice(0, 20); } },
    onDel: () => { const i = arr.indexOf(x); if (i >= 0) arr.splice(i, 1); },
  });
  sheetActs.recentFood = el => { const r = recent[+el.dataset.i]; arr.push({ id: uid(), ...r }); closeSheet(); commit(); toast(`${r.name} added`); };
}
function macroDonut(p, c, f, size = 132) {
  const tot = p * 4 + c * 4 + f * 9, r = (size - 16) / 2, C = 2 * Math.PI * r;
  if (!tot) return ring(0, size, 14, 'var(--accent)', `<div><b>—</b><small>no data</small></div>`);
  let off = 0; const seg = (v, col) => { const len = C * v / tot; const s = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="14" stroke-dasharray="${len.toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"/>`; off += len; return s; };
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--bg2)" stroke-width="14"/>${seg(p * 4, 'var(--accent)')}${seg(c * 4, 'var(--gold)')}${seg(f * 9, 'var(--move)')}</svg><div class="ring-label"><div><b>${Math.round(tot)}</b><small>kcal</small></div></div></div>`;
}
function hNutrition() {
  const [h, tab] = modHead('nutrition', 'Nutrition', 'health', [['diary', 'Diary'], ['macros', 'Macros'], ['stats', 'Stats']]);
  const k = ui.foodDay || TODAY(), P = S.profile, items = foodItems(k);
  const tk = sum(items.map(f => +f.kcal || 0)), tp = sum(items.map(f => +f.p || 0)), tc = sum(items.map(f => +f.c || 0)), tf = sum(items.map(f => +f.f || 0));
  const nav = `<section class="card" style="padding:10px 14px"><div class="cal-head" style="margin:0"><button class="iconbtn" data-a="foodDay" data-v="-1" aria-label="Previous day">${I.left}</button><div class="h3">${relDay(k)}</div><button class="iconbtn" data-a="foodDay" data-v="1" aria-label="Next day" ${k >= TODAY() ? 'disabled style="opacity:.3"' : ''}>${I.right}</button></div></section>`;
  if (tab === 'diary') {
    return h + nav + `<section class="card hero">${ring(tk / P.kcalGoal, 124, 11, 'var(--accent)', `<div>${I.apple.replace('<svg', '<svg style="width:20px;height:20px;margin:0 auto 2px;color:var(--accent-strong)"')}<b>${tk}</b><small>/ ${P.kcalGoal} kcal</small></div>`)}
      <div class="hero-stats"><div class="macro"><i style="background:var(--accent)"></i>Protein<b>${tp} g</b></div><div class="macro"><i style="background:var(--gold)"></i>Carbs<b>${tc} g</b></div><div class="macro"><i style="background:var(--move)"></i>Fat<b>${tf} g</b></div></div></section>`
      + MEALS.map(([id, e, l]) => { const a = S.food[k]?.[id] || []; return `<section class="card"><div class="meal-head"><span class="e">${e}</span><div class="body"><div class="h3">${l}</div><div class="small muted">${a.length ? sum(a.map(f => +f.kcal || 0)) + ' kcal' : 'Nothing logged'}</div></div><button class="addc" data-a="foodAdd" data-m="${id}" aria-label="Add food">${I.plus}</button></div>${a.length ? `<div style="margin-top:8px">${a.map(f => `<button class="foodrow" data-a="foodEdit" data-m="${id}" data-id="${f.id}"><span class="body" style="flex:1"><span class="t" style="font-weight:550">${esc(f.name)}</span>${f.p || f.c || f.f ? `<br><span class="small muted">P ${f.p || 0} · C ${f.c || 0} · F ${f.f || 0}</span>` : ''}</span><span class="small muted">${f.kcal ? f.kcal + ' kcal' : ''}</span></button>`).join('')}</div>` : ''}</section>`; }).join('')
      + `<section class="card tint-move"><div class="eyebrow" style="margin-bottom:8px">After eating, I felt…</div><div class="chips" style="margin:0">${['😌 Satisfied', '⚡ Energized', '😴 Sleepy', '🎈 Bloated', '😋 Still hungry'].map(f => `<button class="chip ${S.food[k]?.feel === f ? 'on' : ''}" data-a="foodFeel" data-v="${f}">${f}</button>`).join('')}</div></section>`;
  }
  if (tab === 'macros') {
    const row = (l, v, g, c) => `<div style="margin:12px 0"><div class="row small"><span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c};margin-right:6px"></i>${l}</span><span class="spacer"></span><b>${v} / ${g} g</b></div>${pbar(v / g, c)}</div>`;
    return h + nav + `<section class="card" style="display:flex;flex-direction:column;align-items:center">${macroDonut(tp, tc, tf, 150)}<div class="legend" style="margin-top:14px"><span><i style="background:var(--accent)"></i>Protein</span><span><i style="background:var(--gold)"></i>Carbs</span><span><i style="background:var(--move)"></i>Fat</span></div></section>
      <section class="card"><div class="card-head"><span class="eyebrow">Daily targets</span><button class="link" data-a="go" data-to="profile">Edit</button></div>${row('Protein', tp, P.proteinGoal, 'var(--accent)')}${row('Carbs', tc, P.carbGoal, 'var(--gold)')}${row('Fat', tf, P.fatGoal, 'var(--move)')}</section>`;
  }
  const days = daysBack(7), vals = days.map(d => sum(foodItems(d).map(f => +f.kcal || 0))), logged = vals.filter(Boolean);
  return h + `<div class="grid2"><div class="card stat" style="margin:0"><div class="v">${logged.length ? Math.round(avg(logged)) : '—'}<small> kcal</small></div><div class="k">Daily average</div></div><div class="card stat" style="margin:0"><div class="v">${days.filter(d => foodItems(d).length).length}<small>/7</small></div><div class="k">Days logged</div></div></div>
    <section class="card"><div class="card-head"><span class="eyebrow">Calories · last 7 days</span><span class="small muted">goal ${P.kcalGoal}</span></div>${bars(vals, days.map(d => shortLbl(d, 7)), { color: 'var(--accent)', goal: P.kcalGoal })}</section>
    <section class="card tint-accent"><div class="small" style="color:var(--ink2)">Numbers are just information. Notice how food makes you feel — energy, mood, sleep — as much as what it adds up to.</div></section>`;
}
Object.assign(A, {
  foodAdd(el) { foodSheet(el.dataset.m); }, foodEdit(el) { foodSheet(el.dataset.m, el.dataset.id); },
  foodFeel(el) { const k = ui.foodDay || TODAY(), m = S.food[k] = S.food[k] || {}; m.feel = m.feel === el.dataset.v ? '' : el.dataset.v; commit(); },
});

/* ---------- Meal planner ---------- */
function recipeSheet(id) {
  const x = id ? S.recipes.find(r => r.id === id) : null;
  itemSheet({
    title: x ? 'Recipe' : 'New recipe', item: x,
    fields: [{ k: 'name', l: 'Recipe', req: 1, ph: 'e.g. Lentil bowl' }, { k: 'mins', l: 'Time (minutes)', t: 'number', ph: '30' }, { k: 'ing', l: 'Ingredients — one per line', t: 'textarea', rows: 5, ph: '1 cup lentils\n1 onion\n2 carrots' }, { k: 'steps', l: 'Method', t: 'textarea', rows: 5 }],
    extra: x && x.ing ? `<button class="btn soft" style="margin-bottom:10px" data-a="toShop">${I.cart} Add ingredients to shopping list</button>` : '',
    onSave: o => { if (x) Object.assign(x, o); else S.recipes.push({ id: uid(), ...o }); },
    onDel: () => { S.recipes = S.recipes.filter(r => r !== x); },
  });
  if (x) sheetActs.toShop = () => { x.ing.split('\n').map(s => s.trim()).filter(Boolean).forEach(t => { if (!S.shopping.some(s => !s.done && s.text.toLowerCase() === t.toLowerCase())) S.shopping.push({ id: uid(), text: t, done: false }); }); closeSheet(); commit(); toast('Added to shopping list 🛒'); };
}
function hMeals() {
  const [h, tab] = modHead('meals', 'Meal Planner', 'health', [['plan', 'Plan'], ['recipes', 'Recipes'], ['shopping', 'Shopping']]);
  const t = TODAY();
  if (tab === 'plan') {
    const mon = ui.mpWeek || addD(t, -((dow(t) + 6) % 7)); ui.mpWeek = mon;
    const days = Array.from({ length: 7 }, (_, i) => addD(mon, i));
    return h + `<section class="card" style="padding:10px 14px"><div class="cal-head" style="margin:0"><button class="iconbtn" data-a="mpWeek" data-v="-7" aria-label="Previous week">${I.left}</button><div class="h3">${addD(t, -((dow(t) + 6) % 7)) === mon ? 'This week' : fmt(mon, { day: 'numeric', month: 'short' }) + ' – ' + fmt(days[6], { day: 'numeric', month: 'short' })}</div><button class="iconbtn" data-a="mpWeek" data-v="7" aria-label="Next week">${I.right}</button></div></section>`
      + listCard(days.map(d => { const p = S.mealPlan[d] || {}; return `<div class="dayplan ${d === t ? 'today' : ''}"><div class="dl">${fmt(d, { weekday: 'short' })}<small>${pd(d).getDate()}</small></div><div><input class="mini-input" placeholder="Lunch" value="${esc(p.lunch || '')}" data-save="mplan:${d}:lunch"><input class="mini-input" placeholder="Dinner" value="${esc(p.dinner || '')}" data-save="mplan:${d}:dinner"></div></div>`; }).join(''))
      + `<p class="small muted" style="text-align:center">Tip: plan a “free / flexible” night — it makes the rest easier to keep.</p>`;
  }
  if (tab === 'recipes') {
    return h + (S.recipes.length ? listCard(S.recipes.map(r => `<button class="nrow" data-a="recipe" data-id="${r.id}"><span class="ni">🍲</span><span class="body"><span class="t">${esc(r.name)}</span><span class="m">${r.mins ? r.mins + ' min · ' : ''}${plural((r.ing || '').split('\n').filter(s => s.trim()).length, 'ingredient')}</span></span><span class="chev">${I.right}</span></button>`).join('')) : `<div class="art-card">${art('leaves')}<div class="inner">${emptyState('🥗', 'Save the recipes you love so planning is easy.')}</div></div>`) + pill('recipe', 'New recipe');
  }
  const open = S.shopping.filter(s => !s.done), done = S.shopping.filter(s => s.done);
  return h + `<section class="card"><div class="row" style="gap:8px"><input class="input" id="shop-in" placeholder="Add an item" style="flex:1" enterkeyhint="done"><button class="addc" data-a="shopAdd" aria-label="Add">${I.plus}</button></div></section>`
    + (S.shopping.length ? listCard([...open, ...done].map(s => `<div class="item ${s.done ? 'done' : ''}">${checkBtn(s.done, 'shopToggle', `data-id="${s.id}"`)}<div class="body"><div class="t">${esc(s.text)}</div></div><button class="delx" data-a="shopDel" data-id="${s.id}" aria-label="Remove">${I.x}</button></div>`).join('')) + (done.length ? `<button class="btn danger" data-a="shopClear">Clear checked items</button>` : '') : `<section class="card">${emptyState('🛒', 'Your shopping list is empty.')}</section>`);
}
Object.assign(A, {
  mpWeek(el) { ui.mpWeek = addD(ui.mpWeek, +el.dataset.v); render(); },
  recipe(el) { recipeSheet(el.dataset.id); },
  shopAdd() { const t = val('#shop-in').trim(); if (!t) return shake('#shop-in'); S.shopping.push({ id: uid(), text: t, done: false }); commit(); $('#shop-in')?.focus(); },
  shopToggle(el) { const s = S.shopping.find(x => x.id === el.dataset.id); s.done = !s.done; buzz(); commit(); },
  shopDel(el) { S.shopping = S.shopping.filter(x => x.id !== el.dataset.id); commit(); },
  shopClear() { S.shopping = S.shopping.filter(x => !x.done); commit(); },
});

/* ---------- Sleep ---------- */
function hSleep() {
  const [h, tab] = modHead('sleep', 'Sleep', 'health', [['today', 'Today'], ['trends', 'Trends'], ['insights', 'Insights']]);
  const g = S.profile.sleepGoal, keys = Object.keys(S.sleep).sort().reverse(), lk = keys[0], last = lk ? S.sleep[lk] : null;
  if (tab === 'today') {
    return h + `<section class="card" style="display:flex;flex-direction:column;align-items:center;padding:24px 18px">${ring(last ? last.hours / g : 0, 170, 12, 'var(--accent)', `<div>${I.bed.replace('<svg', '<svg style="width:26px;height:26px;margin:0 auto 4px;color:var(--accent-strong)"')}<b style="font-size:30px">${last ? hours(last.hours) : '—'}</b><small>sleep time</small></div>`)}
      <div class="small muted" style="margin-top:10px">${last ? 'Night ending ' + relDay(lk).toLowerCase() : 'No sleep logged yet'}</div></section>
      ${last ? `<section class="card"><div class="row"><div><div class="small muted">Sleep quality</div><div class="h2" style="margin-top:2px">${['Poor', 'Restless', 'Okay', 'Good', 'Excellent'][(last.q || 3) - 1]}</div></div><span class="spacer"></span><span style="font-size:34px">${SLEEPQ[(last.q || 3) - 1]}</span></div></section>
      <section class="card" style="padding:4px 18px">${kv(I.moon, 'In bed', last.bed)}${kv(I.sun, 'Awake', last.wake)}${kv(I.target, 'Sleep goal', `${g} h ${last.hours >= g ? '✓' : ''}`)}</section>` : ''}
      <button class="btn" data-a="logSleep">${I.moon} Log sleep</button>`;
  }
  if (tab === 'trends') {
    const d7 = daysBack(7), d30 = daysBack(30);
    return h + `<section class="card"><div class="card-head"><span class="eyebrow">Last 7 nights</span><span class="small muted">goal ${g}h</span></div>${bars(d7.map(k => S.sleep[k]?.hours || 0), d7.map(k => shortLbl(k, 7)), { color: 'var(--accent)', goal: g, fmtv: v => v.toFixed(1).replace('.0', '') })}</section>
      <section class="card"><div class="card-head"><span class="eyebrow">Last 30 nights</span></div>${bars(d30.map(k => S.sleep[k]?.hours || 0), d30.map(k => shortLbl(k, 30)), { color: 'var(--sleep)', goal: g })}</section>
      ${keys.length ? sectionT('History') + listCard(keys.slice(0, 14).map(k => `<button class="foodrow" data-a="logSleep" data-d="${k}"><span style="font-size:22px">${SLEEPQ[(S.sleep[k].q || 3) - 1]}</span><span style="flex:1"><b>${hours(S.sleep[k].hours)}</b> <span class="small muted">· ${S.sleep[k].bed}–${S.sleep[k].wake}</span><br><span class="small muted">${relDay(k)}</span></span><span class="chev">${I.right}</span></button>`).join('')) : ''}`;
  }
  const d14 = daysBack(14).filter(k => S.sleep[k]), hs = d14.map(k => S.sleep[k].hours);
  const ins = [];
  if (!hs.length) ins.push(['🌙', 'Log a few nights to see your patterns here.']);
  else {
    const a = avg(hs); ins.push(['⏱️', `You average <b>${hours(a)}</b> a night over the last ${plural(hs.length, 'logged night')}.`]);
    ins.push([a >= g ? '🌿' : '💭', a >= g ? 'You’re meeting your sleep goal — lovely consistency.' : `That’s about ${hours(g - a)} below your goal. Try moving bedtime 15 minutes earlier this week.`]);
    const beds = d14.map(k => { const [H, M] = S.sleep[k].bed.split(':').map(Number); let m = H * 60 + M; if (m < 720) m += 1440; return m; });
    const spread = Math.max(...beds) - Math.min(...beds);
    ins.push(['🛏️', spread <= 60 ? 'Your bedtime is very consistent — your body loves that.' : `Your bedtime varies by about ${hours(spread / 60)}. A steadier bedtime often improves sleep quality.`]);
    const best = d14.reduce((b, k) => (S.sleep[k].q || 0) > (S.sleep[b].q || 0) ? k : b, d14[0]);
    ins.push(['✨', `Your best-rated night recently was ${relDay(best).toLowerCase()} — ${hours(S.sleep[best].hours)}, to bed at ${S.sleep[best].bed}.`]);
  }
  return h + `<div class="art-card">${art('mountain')}</div>` + listCard(ins.map(([e, t]) => `<div class="insight"><span class="e">${e}</span><div>${t}</div></div>`).join(''));
}

/* ---------- Water ---------- */
function hWater() {
  const [h] = modHead('water', 'Water', 'health');
  const t = TODAY(), w = S.water[t] || 0, g = S.profile.waterGoal, f = clamp(w / g, 0, 1);
  const days = daysBack(7), vals = days.map(k => S.water[k] || 0);
  return h + `<section class="card"><div class="glass-wrap">
    <svg viewBox="0 0 120 160" width="120" aria-hidden="true"><defs><clipPath id="gc"><path d="M18 12h84l-11 136H29z"/></clipPath></defs>
    <path d="M18 12h84l-11 136H29z" fill="var(--water-soft)"/><rect clip-path="url(#gc)" x="0" y="${12 + 136 * (1 - f)}" width="120" height="160" fill="var(--water)" opacity=".8"/>
    <path d="M18 12h84l-11 136H29z" fill="none" stroke="var(--water)" stroke-width="2.5" stroke-linejoin="round"/></svg>
    <div class="bigstat">${w}<small> / ${g} glasses</small></div>
    <div class="stepper"><button data-a="water" data-v="-1" aria-label="Remove a glass">−</button><b>${Math.round(f * 100)}%</b><button data-a="water" data-v="1" aria-label="Add a glass">+</button></div>
  </div></section>
  <section class="card"><div class="card-head"><span class="eyebrow">Last 7 days</span><span class="small muted">Goal reached ${vals.filter(v => v >= g).length}/7</span></div>${bars(vals, days.map(k => shortLbl(k, 7)), { color: 'var(--water)', goal: g })}</section>`;
}

/* ---------- Wellness ---------- */
function timerPractice(type) {
  const [name, , , note] = PRACTICES[type];
  openSheet(name, `<p class="muted" style="margin:-6px 0 16px">${note}</p><div class="field"><span>How long?</span><div class="opt-grid">${[3, 5, 10, 15].map(m => `<button class="opt" data-a="pStart" data-v="${m}"><span class="e" style="font-family:var(--serif)">${m}</span>min</button>`).join('')}</div></div>`, {
    pStart(el) { const m = +el.dataset.v; closeSheet(true); runSteps({ label: name, steps: [{ title: type === 'meditation' ? 'Follow your breath' : 'Be here, now', secs: m * 60, note }], auto: true, onFinish: () => S.practiceLog.push({ id: uid(), date: TODAY(), type, mins: m }) }); },
  });
}
function selfcareSheet() {
  const t = TODAY(), done = S.selfcare[t] = S.selfcare[t] || [];
  openSheet('Self-care ideas', `<p class="muted" style="margin:-6px 0 10px">Pick one or two that feel good today.</p>` + SELFCARE.map((s, i) => `<div class="item ${done.includes(i) ? 'done' : ''}">${checkBtn(done.includes(i), 'scT', `data-i="${i}"`)}<div class="body"><div class="t">${s}</div></div></div>`).join(''), {
    scT(el) { const i = +el.dataset.i, j = done.indexOf(i); j >= 0 ? done.splice(j, 1) : done.push(i); el.classList.toggle('on'); el.closest('.item').classList.toggle('done'); save(); },
  });
}
function hWellness() {
  const [h, tab] = modHead('wellness', 'Wellness', 'health', [['today', 'Today'], ['practices', 'Practices'], ['journal', 'Journal']]);
  const t = TODAY(), md = S.mood[t] || {};
  if (tab === 'today') {
    const sug = md.mood && md.mood <= 2 ? ['stress', 'Stress relief', 'A 3-minute grounding exercise can help right now.'] : md.energy && md.energy <= 2 ? ['selfcare', 'Self-care', 'Low energy? Choose one small kind thing for yourself.'] : ['breathing', 'Breathing', 'One minute of box breathing to reset.'];
    return h + `<div class="art-card">${art('stones')}<div class="inner">
      <div class="eyebrow" style="margin-bottom:10px">How are you feeling?</div>
      <div class="moods">${MOODS.map(x => `<button class="moodbtn ${md.mood === x.v ? 'on' : ''}" data-a="mood" data-v="${x.v}" aria-label="${x.t}">${x.e}</button>`).join('')}</div>
      <div class="eyebrow" style="margin:18px 0 10px">Energy</div>
      <div class="scale">${[1, 2, 3, 4, 5].map(v => `<button class="${md.energy === v ? 'on' : ''}" data-a="energy" data-v="${v}">${v}</button>`).join('')}</div>
      <div class="row small muted" style="justify-content:space-between;margin-top:6px"><span>Drained</span><span>Full of energy</span></div>
      <textarea class="input" style="margin-top:14px" placeholder="What’s on your mind? (optional)" data-save="moodnote">${esc(md.note || '')}</textarea></div></div>
      ${sectionT('Suggested for you')}${listCard(nrow(sug[0] === 'breathing' ? I.wind : sug[0] === 'stress' ? I.heartHand : I.leaf, sug[1], sug[2], `data-a="practice" data-v="${sug[0]}"`, I.play))}`;
  }
  if (tab === 'practices') {
    const cnt = ty => S.practiceLog.filter(p => p.type === ty).length + (ty === 'breathing' ? sum(Object.values(S.breaths)) : 0);
    return h + `<div class="art-card">${art('lotus')}</div>` + listCard([
      nrow(I.sun, 'Mindfulness', '5–10 min · present-moment awareness', 'data-a="practice" data-v="mindfulness"'),
      nrow(I.wind, 'Breathing', '1 min · box breathing', 'data-a="practice" data-v="breathing"'),
      nrow(I.lotus, 'Meditation', '5–20 min · quiet timer', 'data-a="practice" data-v="meditation"'),
      nrow(I.heartHand, 'Stress Relief', '3 min · 5-4-3-2-1 grounding', 'data-a="practice" data-v="stress"'),
      nrow(I.leaf, 'Self-Care', 'Small, kind ideas for today', 'data-a="practice" data-v="selfcare"'),
    ].join('')) + `<p class="small muted" style="text-align:center">${sum(['mindfulness', 'breathing', 'meditation', 'stress'].map(cnt))} practice sessions so far</p>`;
  }
  const days = daysBack(14), hist = Object.keys(S.mood).filter(k => S.mood[k]?.mood).sort().reverse().slice(0, 20);
  return h + `<section class="card"><div class="card-head"><span class="eyebrow">Mood · 14 days</span></div>${line(days.map(k => S.mood[k]?.mood ?? null), days.map(k => shortLbl(k, 14)))}</section>`
    + (hist.length ? listCard(hist.map(k => `<div class="item"><span style="font-size:26px">${MOODS[S.mood[k].mood - 1].e}</span><div class="body"><div class="t">${relDay(k)} <span class="small muted">· ${MOODS[S.mood[k].mood - 1].t}${S.mood[k].energy ? ' · energy ' + S.mood[k].energy + '/5' : ''}</span></div>${S.mood[k].note ? `<div class="m">${esc(S.mood[k].note)}</div>` : ''}</div></div>`).join('')) : `<section class="card">${emptyState('🌿', 'Your check-ins will appear here.')}</section>`);
}
A.practice = el => {
  const v = el.dataset.v;
  if (v === 'breathing') return breathe();
  if (v === 'selfcare') return selfcareSheet();
  if (v === 'stress') return runSteps({ label: '5-4-3-2-1 grounding', steps: GROUNDING.map(([t, s, n]) => ({ title: t, secs: s, note: n })), auto: true, onFinish: m => S.practiceLog.push({ id: uid(), date: TODAY(), type: 'stress', mins: m }) });
  timerPractice(v);
};

/* ---------- Mobility & flexibility ---------- */
function startMobility(id) {
  const r = MOBILITY.find(x => x.id === id);
  runSteps({ label: '🧘 ' + r.name, steps: r.steps.map(([t, s, n]) => ({ title: t, secs: s, note: n })), auto: true, onFinish: m => { S.mobilityLog.push({ id: uid(), date: TODAY(), rid: r.id, name: r.name, mins: Math.max(m, mobMins(r)) }); S.moves.push({ id: uid(), date: TODAY(), type: 'stretch', mins: Math.max(m, mobMins(r)), label: r.name }); } });
}
function hMobility() {
  const [h, tab] = modHead('mobility', 'Mobility & Flexibility', 'health', [['routines', 'Routines'], ['library', 'Library'], ['progress', 'Progress']]);
  const t = TODAY(), today = MOBILITY[dayNum(t) % MOBILITY.length], doneToday = S.mobilityLog.some(l => l.date === t);
  if (tab === 'routines') {
    return h + `<div class="art-card">${art('leaves')}<div class="inner"><div class="row"><div><div class="eyebrow">Today’s routine</div><div class="h2" style="margin:4px 0 2px">${today.name}</div><div class="small muted">${mobMins(today)} min · ${plural(today.steps.length, 'stretch')}${doneToday ? ' · done today ✓' : ''}</div></div><span class="spacer"></span><button class="fab" style="position:static;width:54px;height:54px;border-radius:50%" data-a="mobStart" data-id="${today.id}" aria-label="Start">${I.play}</button></div></div></div>`
      + sectionT('All routines') + listCard(MOBILITY.map(r => nrow(I.stretch, r.name, `${mobMins(r)} min · ${plural(r.steps.length, 'stretch')}`.replace('stretchs', 'stretches'), `data-a="mobStart" data-id="${r.id}"`, I.play)).join('')).replace(/stretchs/g, 'stretches');
  }
  if (tab === 'library') {
    const seen = new Set(), list = [];
    MOBILITY.forEach(r => r.steps.forEach(([n, , d]) => { const base = n.replace(/ — (left|right)$/, ''); if (!seen.has(base) && d && !d.startsWith('Same')) { seen.add(base); list.push([base, d, r.name]); } }));
    return h + listCard(list.map(([n, d, r]) => `<div class="item"><span class="ni" style="width:38px;height:38px;border-radius:12px;background:var(--accent-soft);display:grid;place-items:center;color:var(--accent-strong);flex:none">${I.stretch}</span><div class="body"><div class="t">${n}</div><div class="m">${d}</div></div></div>`).join(''));
  }
  const weeks = 8, mon = addD(t, -((dow(t) + 6) % 7) - (weeks - 1) * 7);
  const wk = Array.from({ length: weeks }, (_, i) => { const s = addD(mon, i * 7), e = addD(s, 6); return sum(S.mobilityLog.filter(l => l.date >= s && l.date <= e).map(l => l.mins)); });
  let st = 0, k = doneToday ? t : addD(t, -1); while (S.mobilityLog.some(l => l.date === k)) { st++; k = addD(k, -1); }
  return h + `<div class="grid2"><div class="card stat" style="margin:0"><div class="v">${S.mobilityLog.length}</div><div class="k">Sessions</div></div><div class="card stat" style="margin:0"><div class="v">🔥 ${st}</div><div class="k">Day streak</div></div></div>
    <section class="card"><div class="card-head"><span class="eyebrow">Minutes per week</span></div>${bars(wk, wk.map((_, i) => i === weeks - 1 ? 'Now' : `-${weeks - 1 - i}w`), { color: 'var(--accent)' })}</section>`;
}
A.mobStart = el => startMobility(el.dataset.id);

/* =========================================================
   GROWTH
   ========================================================= */
SCREENS.growth = r => {
  if (r.sub === 'write') return growthWrite(r.id);
  const fn = { learning: gLearning, reading: gReading, journaling: gJournaling, journal: gJournaling, mindset: gMindset, creativity: gCreativity, skills: gSkills }[r.sub];
  if (fn) return fn(r);
  const t = TODAY(), reading = S.reading.filter(b => b.status === 'doing').length;
  return `${WAVES}${appHead()}<h1 class="title">Growth</h1><p class="hub-sub">Learn, reflect, create and evolve.</p>
  ${hubTiles([
    ['growth/learning', 'Learning', I.grad, S.learning.length ? plural(S.learning.length, 'goal') : 'Set a goal'],
    ['growth/reading', 'Reading', I.bookOpen, reading ? `${reading} in progress` : 'Your library'],
    ['growth/journaling', 'Journaling', I.pen, S.journal.some(j => j.date === t) ? 'Written today ✓' : 'Today’s prompt'],
    ['growth/mindset', 'Mindset', I.brain, 'Gratitude & affirmations'],
    ['growth/creativity', 'Creativity', I.palette, S.projects.length ? plural(S.projects.length, 'project') : 'Ideas & projects'],
    ['growth/skills', 'Life Skills', I.layers, `${skillsDone()}/${LIFE_SKILLS.length * 5} lessons`],
  ])}
  <section class="card tint-accent"><div class="eyebrow" style="margin-bottom:4px">Today’s intention</div>
    <input class="inline-input" style="font-family:var(--serif);font-size:20px;width:100%;border-color:rgba(0,0,0,.08)" placeholder="Today I choose to…" value="${esc(S.intention[t] || '')}" data-save="intention"></section>`;
};
const skillsDone = () => S.skillsDone.length;

/* generic progress items (learning goals, courses, projects) */
const PROG_CFG = {
  learning: { name: 'learning goal', fields: [{ k: 'title', l: 'Goal', req: 1, ph: 'e.g. Reach B2 in Spanish' }, { k: 'provider', l: 'Area (optional)', ph: 'Language, music, work…' }, { k: 'progress', l: 'Progress', t: 'range' }] },
  courses: { name: 'course', fields: [{ k: 'title', l: 'Course', req: 1, ph: 'e.g. Vocal technique' }, { k: 'provider', l: 'Platform or teacher', ph: 'optional' }, { k: 'progress', l: 'Progress', t: 'range' }] },
  projects: { name: 'project', fields: [{ k: 'title', l: 'Project', req: 1, ph: 'e.g. Record a demo' }, { k: 'provider', l: 'Notes', ph: 'optional' }, { k: 'progress', l: 'Progress', t: 'range' }] },
};
function progSheet(k, id) {
  const c = PROG_CFG[k], x = id ? S[k].find(i => i.id === id) : null;
  itemSheet({ title: (x ? 'Edit ' : 'New ') + c.name, item: x, fields: c.fields, onSave: o => { if (x) Object.assign(x, o); else S[k].push({ id: uid(), created: TODAY(), ...o }); }, onDel: () => { S[k] = S[k].filter(i => i !== x); } });
}
const progList = (k, empty) => S[k].length ? listCard(S[k].map(x => `<button class="prow" data-a="progEdit" data-k="${k}" data-id="${x.id}"><div class="row"><span class="t">${esc(x.title)}</span><span class="pct">${x.progress || 0}%</span></div>${x.provider ? `<div class="m">${esc(x.provider)}</div>` : ''}${pbar((x.progress || 0) / 100)}</button>`).join('')) : `<section class="card">${emptyState('🌱', empty)}</section>`;
A.progEdit = el => progSheet(el.dataset.k, el.dataset.id);
A.progNew = el => progSheet(el.dataset.k);

/* ---------- Learning ---------- */
function gLearning() {
  const [h, tab] = modHead('learning', 'Learning', 'growth', [['goals', 'My Learning'], ['courses', 'Courses'], ['resources', 'Resources']]);
  if (tab === 'goals') {
    const a = S.learning, prog = a.filter(x => (x.progress || 0) > 0 && x.progress < 100).length, av = a.length ? avg(a.map(x => x.progress || 0)) : 0;
    return h + `<section class="card"><div class="row">${ring(av / 100, 64, 7)}<div><div class="h3">Learning goals</div><div class="small muted">${prog} of ${a.length} in progress</div></div><span class="spacer"></span><b style="color:var(--accent-strong)">${Math.round(av)}%</b></div></section>` + progList('learning', 'What would you love to learn?') + pill('progNew', 'New learning goal', 'data-k="learning"');
  }
  if (tab === 'courses') return h + progList('courses', 'Track the courses and classes you’re taking.') + pill('progNew', 'Add course', 'data-k="courses"');
  return h + (S.resources.length ? listCard(S.resources.map(r => `<div class="item"><span class="ni" style="width:38px;height:38px;border-radius:12px;background:var(--sand-soft);display:grid;place-items:center;flex:none">🔖</span><button class="body" style="text-align:left" data-a="resEdit" data-id="${r.id}"><div class="t">${esc(r.title)}</div>${r.note ? `<div class="m">${esc(r.note)}</div>` : ''}</button>${/^https?:\/\//.test(r.url || '') ? `<a class="link" href="${esc(r.url)}" target="_blank" rel="noopener">Open</a>` : ''}</div>`).join('')) : `<section class="card">${emptyState('🔖', 'Save useful links, videos and notes here.')}</section>`) + pill('resEdit', 'Add resource');
}
A.resEdit = el => { const x = el.dataset.id ? S.resources.find(r => r.id === el.dataset.id) : null; itemSheet({ title: x ? 'Resource' : 'New resource', item: x, fields: [{ k: 'title', l: 'Title', req: 1 }, { k: 'url', l: 'Link (optional)', t: 'url', ph: 'https://' }, { k: 'note', l: 'Note', t: 'textarea', rows: 2 }], onSave: o => { if (x) Object.assign(x, o); else S.resources.push({ id: uid(), ...o }); }, onDel: () => { S.resources = S.resources.filter(r => r !== x); } }); };

/* ---------- Reading ---------- */
const BSTAT = [['todo', 'To read'], ['doing', 'Reading'], ['done', 'Read']];
function bookSheet(id) {
  const b = id ? S.reading.find(x => x.id === id) : null;
  itemSheet({
    title: b ? 'Book' : 'Add book', item: b ? { ...b, fav: b.fav ? '1' : '0' } : { status: 'todo', fav: '0' },
    fields: [{ k: 'title', l: 'Title', req: 1, ph: 'Book title' }, { k: 'by', l: 'Author', ph: 'optional' }, { k: 'status', l: 'Status', t: 'pick', opts: BSTAT }, { k: 'page', l: 'Current page', t: 'number', ph: '0' }, { k: 'pages', l: 'Total pages', t: 'number', ph: 'e.g. 320' }, { k: 'fav', l: 'Favourite', t: 'pick', opts: [['0', 'No'], ['1', '♥ Yes']] }],
    onSave: o => { const d = { ...o, fav: o.fav === '1', type: 'book' }; if (d.pages && d.page >= d.pages) d.status = 'done'; if (b) { if (d.status === 'done' && b.status !== 'done') d.finished = TODAY(); Object.assign(b, d); } else S.reading.push({ id: uid(), added: TODAY(), finished: d.status === 'done' ? TODAY() : '', ...d }); },
    onDel: () => { S.reading = S.reading.filter(x => x !== b); },
  });
}
function readLogSheet() {
  const open = S.reading.filter(b => b.status !== 'done');
  if (!open.length) return toast('Add a book to your library first');
  itemSheet({
    title: 'Log reading', fields: [{ k: 'book', l: 'Book', t: 'pick', opts: open.map(b => [b.id, esc(b.title)]), def: (open.find(b => b.status === 'doing') || open[0]).id }, { k: 'pages', l: 'Pages read', t: 'number', ph: '10' }, { k: 'mins', l: 'Minutes', t: 'number', ph: '20' }], saveLabel: 'Save',
    onSave: o => { const b = S.reading.find(x => x.id === o.book); S.readLog.push({ id: uid(), date: TODAY(), bookId: b.id, title: b.title, pages: o.pages || 0, mins: o.mins || 0 }); b.status = b.status === 'todo' ? 'doing' : b.status; b.page = (+b.page || 0) + (o.pages || 0); if (b.pages && b.page >= b.pages) { b.page = b.pages; b.status = 'done'; b.finished = TODAY(); toast('Book finished! 📚'); } },
  });
}
function hBook(b) {
  const p = b.pages ? clamp((+b.page || 0) / b.pages, 0, 1) : 0;
  return `<button class="prow" data-a="book" data-id="${b.id}"><div class="row" style="gap:12px;justify-content:flex-start"><span style="width:38px;height:52px;border-radius:6px;background:linear-gradient(135deg,var(--accent-soft),var(--sand));display:grid;place-items:center;font-size:18px;flex:none">${b.fav ? '♥' : '📖'}</span><span style="flex:1;min-width:0"><span class="t">${esc(b.title)}</span>${b.by ? `<br><span class="m">${esc(b.by)}</span>` : ''}${b.status === 'doing' && b.pages ? pbar(p) : ''}</span>${b.status === 'doing' && b.pages ? `<span class="pct">${Math.round(p * 100)}%</span>` : ''}</div></button>`;
}
function gReading() {
  const [h, tab] = modHead('reading', 'Reading', 'growth', [['library', 'Library'], ['log', 'Reading Log'], ['stats', 'Stats']]);
  if (tab === 'library') {
    const f = ui.bookFilter || 'all', doing = S.reading.filter(b => b.status === 'doing');
    const shown = f === 'all' ? [] : f === 'fav' ? S.reading.filter(b => b.fav) : S.reading.filter(b => b.status === f);
    return h + `<div class="art-card">${art('books')}<div class="inner"><div class="eyebrow" style="margin-bottom:4px">Currently reading</div>${doing.length ? doing.map(hBook).join('') : '<p class="small muted" style="margin:6px 0 0">Nothing in progress — pick your next book below.</p>'}</div></div>`
      + listCard([['todo', 'To Read', I.bookOpen], ['done', 'Read', I.check], ['fav', 'Favourites', I.heartHand]].map(([k, l, ic]) => nrow(ic, `${l} (${k === 'fav' ? S.reading.filter(b => b.fav).length : S.reading.filter(b => b.status === k).length})`, '', `data-a="bookFilter" data-v="${f === k ? 'all' : k}"`, f === k ? '▾' : I.right)).join(''))
      + (shown.length ? listCard(shown.map(hBook).join('')) : f !== 'all' ? `<section class="card">${emptyState('📚', 'Nothing here yet.')}</section>` : '')
      + pill('book', 'Add book');
  }
  if (tab === 'log') {
    const log = [...S.readLog].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
    return h + `<button class="btn" data-a="readLog">${I.plus} Log reading session</button><div style="height:14px"></div>` + (log.length ? listCard(log.map(l => `<div class="item"><span style="font-size:22px">📖</span><div class="body"><div class="t">${esc(l.title)}</div><div class="m">${relDay(l.date)}${l.pages ? ' · ' + l.pages + ' pages' : ''}${l.mins ? ' · ' + l.mins + ' min' : ''}</div></div></div>`).join('')) : `<section class="card">${emptyState('📖', 'Log your reading sessions to see your progress.')}</section>`);
  }
  const y = TODAY().slice(0, 4), m = TODAY().slice(0, 7), d14 = daysBack(14);
  const pd14 = d14.map(k => sum(S.readLog.filter(l => l.date === k).map(l => +l.pages || 0)));
  return h + `<div class="grid2"><div class="card stat" style="margin:0"><div class="v">${S.reading.filter(b => b.status === 'done' && (b.finished || '').startsWith(y)).length}</div><div class="k">Books read in ${y}</div></div><div class="card stat" style="margin:0"><div class="v">${sum(S.readLog.filter(l => l.date.startsWith(m)).map(l => +l.pages || 0))}</div><div class="k">Pages this month</div></div>
    <div class="card stat" style="margin:0"><div class="v">${sum(S.readLog.filter(l => l.date.startsWith(m)).map(l => +l.mins || 0))}<small> min</small></div><div class="k">Reading time this month</div></div><div class="card stat" style="margin:0"><div class="v">${S.reading.filter(b => b.status === 'todo').length}</div><div class="k">On your list</div></div></div>
    <section class="card"><div class="card-head"><span class="eyebrow">Pages · 14 days</span></div>${bars(pd14, d14.map(k => shortLbl(k, 14)), { color: 'var(--accent)' })}</section>`;
}
Object.assign(A, { book(el) { bookSheet(el.dataset.id); }, readLog() { readLogSheet(); }, bookFilter(el) { ui.bookFilter = el.dataset.v; render(); } });

/* ---------- Journaling ---------- */
const entryRow = j => `<button class="entry" data-a="go" data-to="growth/write/${j.id}"><div class="d">${fmt(j.date, { weekday: 'long', day: 'numeric', month: 'long' })}</div>${j.prompt ? `<div class="small" style="font-style:italic;color:var(--accent-strong);margin-top:2px">${esc(j.prompt)}</div>` : ''}<div class="x">${esc(j.text)}</div></button>`;
function gJournaling() {
  const [h, tab] = modHead('journaling', 'Journaling', 'growth', [['entries', 'Entries'], ['prompts', 'Prompts'], ['insights', 'Insights']]);
  const t = TODAY(), je = S.journal.find(j => j.date === t);
  if (tab === 'entries') {
    const all = [...S.journal].sort((a, b) => b.date.localeCompare(a.date));
    return h + `<div class="art-card">${art('mountain')}<div class="inner"><div class="eyebrow">${fmt(t, { weekday: 'long', day: 'numeric', month: 'short' })}</div><div class="prompt" style="margin:6px 0 12px">${esc(je?.prompt || promptFor(t, ui.promptShift))}</div>
      ${je ? `<div class="small" style="color:var(--ink2);margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(je.text)}</div>` : ''}
      <div class="btn-row"><button class="btn" data-a="go" data-to="growth/write${je ? '/' + je.id : ''}">${I.pen} ${je ? 'Continue' : 'Write'}</button>${je ? '' : `<button class="btn ghost" style="flex:0 0 56px" data-a="shufflePrompt" aria-label="Another prompt">${I.shuffle}</button>`}</div></div></div>`
      + (all.length ? sectionT('Entries', `<span class="small muted">${all.length}</span>`) + listCard(all.slice(0, 40).map(entryRow).join('')) : '');
  }
  if (tab === 'prompts') return h + `<p class="small muted" style="margin:-6px 2px 12px">Tap a prompt to start writing with it.</p>` + listCard(PROMPTS.map((p, i) => `<button class="nrow" data-a="usePrompt" data-i="${i}"><span class="body"><span class="t" style="font-family:var(--serif);font-weight:500;font-size:17px">${p}</span></span><span class="chev">${I.pen}</span></button>`).join(''));
  const words = S.journal.map(j => (j.text.trim().match(/\S+/g) || []).length);
  let st = 0, k = je ? t : addD(t, -1); while (S.journal.some(j => j.date === k)) { st++; k = addD(k, -1); }
  const m30 = daysBack(30).filter(d => S.journal.some(j => j.date === d)).length;
  return h + `<div class="grid2"><div class="card stat" style="margin:0"><div class="v">${S.journal.length}</div><div class="k">Entries</div></div><div class="card stat" style="margin:0"><div class="v">🔥 ${st}</div><div class="k">Day streak</div></div><div class="card stat" style="margin:0"><div class="v">${sum(words)}</div><div class="k">Words written</div></div><div class="card stat" style="margin:0"><div class="v">${m30}<small>/30</small></div><div class="k">Days journaled</div></div></div>
    <section class="card tint-accent"><div class="small" style="color:var(--ink2)">${S.journal.length ? `On average you write <b>${Math.round(avg(words))}</b> words per entry. Even three sentences a day builds real self-awareness.` : 'Start with just three sentences. Consistency matters more than length.'}</div></section>`;
}
function growthWrite(id) {
  const j = id ? S.journal.find(x => x.id === id) : null;
  ui.writeId = j ? j.id : null;
  const date = j ? j.date : TODAY();
  const prompt = j ? j.prompt : (ui.forcePrompt ?? promptFor(TODAY(), ui.promptShift));
  ui.writePrompt = prompt;
  return `<div class="topbar"><button class="backbtn" data-a="finishWrite">${I.left}Done</button>${j ? `<button class="link" style="color:var(--danger)" data-a="delEntry">Delete</button>` : ''}</div>
  <div class="eyebrow" style="margin-top:8px">${fmt(date, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
  ${prompt ? `<div class="prompt" style="color:var(--accent-strong)">${esc(prompt)}</div>` : '<div style="height:14px"></div>'}
  <textarea class="writer" placeholder="Start writing… there’s no wrong way to do this." data-save="journal">${esc(j?.text || '')}</textarea>
  <p class="small muted">Saved automatically · private to this device</p>`;
}
Object.assign(A, {
  usePrompt(el) { ui.forcePrompt = PROMPTS[+el.dataset.i]; go('growth/write'); },
  finishWrite() { save(); ui.forcePrompt = null; go('growth/journaling'); },
  delEntry() { confirmSheet('Delete entry?', 'This journal entry will be permanently removed.', 'Delete', () => { S.journal = S.journal.filter(j => j.id !== ui.writeId); save(); go('growth/journaling'); }); },
});

/* ---------- Mindset ---------- */
function reframeSheet(id) {
  const x = id ? S.reframes.find(r => r.id === id) : null;
  itemSheet({
    title: 'Reframe a thought', item: x,
    fields: [{ k: 'situation', l: 'What happened?', t: 'textarea', rows: 2, req: 1 }, { k: 'thought', l: 'The thought that showed up', t: 'textarea', rows: 2, ph: 'e.g. I always mess things up' }, { k: 'reframe', l: 'A kinder, more balanced thought', t: 'textarea', rows: 2, ph: 'e.g. One mistake doesn’t define me. I can learn from it.' }],
    onSave: o => { if (x) Object.assign(x, o); else S.reframes.push({ id: uid(), date: TODAY(), ...o }); },
    onDel: () => { S.reframes = S.reframes.filter(r => r !== x); },
  });
}
function gMindset() {
  const [h, tab] = modHead('mindset', 'Mindset', 'growth', [['practices', 'Practices'], ['affirmations', 'Affirmations'], ['tools', 'Tools']]);
  const t = TODAY();
  if (tab === 'practices') {
    const g = S.gratitude[t] || ['', '', ''];
    return h + `<div class="art-card">${art('lotus')}<div class="inner"><div class="card-head" style="margin-bottom:6px"><span class="eyebrow">Gratitude · three good things</span><span class="small muted">${g.filter(x => (x || '').trim()).length}/3</span></div>
      ${[0, 1, 2].map(i => `<div class="gline"><span class="n" style="background:var(--accent-soft);color:var(--accent-strong)">${i + 1}</span><input class="inline-input" placeholder="${['Something that made me smile…', 'Someone I appreciate…', 'A small win today…'][i]}" value="${esc(g[i] || '')}" data-save="grat:${i}"></div>`).join('')}</div></div>
      ${sectionT('Visualization', '<span class="small muted">Your vision board</span>')}
      <div class="vision" style="margin-bottom:14px">${S.vision.map(v => { const a = area(v.area); return `<button class="vcard pressable" style="background:linear-gradient(160deg,${a[3]}CC,${a[3]})" data-a="editVision" data-id="${v.id}"><small>${a[1]} ${a[2]}</small><p>${esc(v.text)}</p></button>`; }).join('')}<button class="vcard vadd" data-a="editVision">${I.plus}<span>Add a vision</span></button></div>
      ${listCard(nrow(I.wind, 'Breathing', 'Calm and clarity in one minute', 'data-a="breathe"', I.play) + nrow(I.chat, 'Reframe a thought', 'Turn a harsh thought into a kinder one', 'data-a="reframe"'))}`;
  }
  if (tab === 'affirmations') {
    const all = [...AFFIRMATIONS.map((a, i) => ({ id: 'b' + i, text: a })), ...S.affirmations];
    const today = AFFIRMATIONS[dayNum(t) % AFFIRMATIONS.length];
    return h + `<section class="card tint-accent"><div class="eyebrow" style="text-align:center">Affirmation of the day</div><div class="bigquote">${today}</div></section>`
      + listCard(all.map(a => `<div class="item"><div class="body"><div class="t" style="font-family:var(--serif);font-weight:500;font-size:17px">${esc(a.text)}</div></div><button class="fav ${S.affFav.includes(a.id) ? 'on' : ''}" data-a="affFav" data-id="${a.id}" aria-label="Favourite">${S.affFav.includes(a.id) ? '♥' : '♡'}</button>${a.id.startsWith('b') ? '' : `<button class="delx" data-a="affDel" data-id="${a.id}" aria-label="Remove">${I.x}</button>`}</div>`).join(''))
      + pill('affNew', 'Write your own');
  }
  return h + listCard(nrow(I.chat, 'Reframe a thought', 'Notice it, question it, soften it', 'data-a="reframe"') + nrow(I.heartHand, '5-4-3-2-1 grounding', 'Come back to the present', 'data-a="practice" data-v="stress"', I.play) + nrow(I.wind, 'Box breathing', '1 minute', 'data-a="breathe"', I.play))
    + (S.reframes.length ? sectionT('My reframes') + listCard([...S.reframes].reverse().map(r => `<button class="entry" data-a="reframe" data-id="${r.id}"><div class="d">${relDay(r.date)}</div><div class="x" style="text-decoration:line-through;opacity:.6">${esc(r.thought || r.situation)}</div><div class="x" style="color:var(--accent-strong)">→ ${esc(r.reframe || '…')}</div></button>`).join('')) : '');
}
Object.assign(A, {
  reframe(el) { reframeSheet(el.dataset.id); },
  affFav(el) { const i = S.affFav.indexOf(el.dataset.id); i >= 0 ? S.affFav.splice(i, 1) : S.affFav.push(el.dataset.id); commit(); },
  affDel(el) { S.affirmations = S.affirmations.filter(a => a.id !== el.dataset.id); commit(); },
  affNew() { itemSheet({ title: 'New affirmation', fields: [{ k: 'text', l: 'Affirmation', t: 'textarea', rows: 2, req: 1, ph: 'I am…' }], onSave: o => S.affirmations.push({ id: uid(), text: o.text }) }); },
});

/* ---------- Creativity ---------- */
function gCreativity() {
  const [h, tab] = modHead('creativity', 'Creativity', 'growth', [['projects', 'Projects'], ['ideas', 'Ideas'], ['inspiration', 'Inspiration']]);
  if (tab === 'projects') return h + `<div class="art-card">${art('leaves')}<div class="inner"><div class="h3">My projects (${S.projects.length})</div><div class="small muted">Songs, sets, recipes, anything you’re making.</div></div></div>` + progList('projects', 'Start your first creative project.') + pill('progNew', 'New project', 'data-k="projects"');
  if (tab === 'ideas') return h + `<section class="card"><div class="row" style="gap:8px"><input class="input" id="idea-in" placeholder="Catch an idea before it flies away…" style="flex:1" enterkeyhint="done"><button class="addc" data-a="ideaAdd" aria-label="Add">${I.plus}</button></div></section>`
    + (S.ideas.length ? listCard([...S.ideas].reverse().map(i => `<div class="item"><span style="font-size:20px">💡</span><div class="body"><div class="t">${esc(i.text)}</div><div class="m">${relDay(i.date)}</div></div><button class="delx" data-a="ideaDel" data-id="${i.id}" aria-label="Remove">${I.x}</button></div>`).join('')) : `<section class="card">${emptyState('💡', 'No ideas yet — they’ll come.')}</section>`);
  const t = TODAY(), p = CREATIVE_PROMPTS[(dayNum(t) + (ui.cShift || 0)) % CREATIVE_PROMPTS.length];
  return h + `<section class="card tint-mood"><div class="card-head"><span class="eyebrow">Today’s creative spark</span><button class="iconbtn" style="width:34px;height:34px" data-a="cShift" aria-label="Another">${I.shuffle}</button></div><div class="bigquote" style="text-align:left;padding:0 0 12px">${p}</div><button class="btn soft" data-a="sparkIdea" data-v="${esc(p)}">${I.bulb} Save as idea</button></section>`
    + sectionT('More sparks') + listCard(CREATIVE_PROMPTS.filter(x => x !== p).map(x => `<div class="item"><span style="font-size:18px">✨</span><div class="body"><div class="t" style="font-weight:500">${x}</div></div></div>`).join(''));
}
Object.assign(A, {
  ideaAdd() { const t = val('#idea-in').trim(); if (!t) return shake('#idea-in'); S.ideas.push({ id: uid(), text: t, date: TODAY() }); commit(); },
  ideaDel(el) { S.ideas = S.ideas.filter(i => i.id !== el.dataset.id); commit(); },
  cShift() { ui.cShift = (ui.cShift || 0) + 1; render(); },
  sparkIdea(el) { S.ideas.push({ id: uid(), text: el.dataset.v, date: TODAY() }); commit(); toast('Saved to ideas 💡'); },
});

/* ---------- Life skills ---------- */
function skillSheet(id) {
  const s = LIFE_SKILLS.find(x => x[0] === id);
  openSheet(s[1], `<p class="muted" style="margin:-6px 0 10px">Small practices. Tick them off as you try them.</p>` + s[3].map((tip, i) => { const k = id + ':' + i, on = S.skillsDone.includes(k); return `<div class="item ${on ? 'done' : ''}">${checkBtn(on, 'skT', `data-k="${k}"`)}<div class="body"><div class="t">${tip}</div></div></div>`; }).join(''), {
    skT(el) { const k = el.dataset.k, i = S.skillsDone.indexOf(k); i >= 0 ? S.skillsDone.splice(i, 1) : S.skillsDone.push(k); el.classList.toggle('on'); el.closest('.item').classList.toggle('done'); save(); render(); },
  });
}
function gSkills() {
  const [h, tab] = modHead('skills', 'Life Skills', 'growth', [['library', 'Library'], ['progress', 'Progress'], ['notes', 'Notes']]);
  const cnt = id => S.skillsDone.filter(k => k.startsWith(id + ':')).length;
  if (tab === 'library') return h + `<div class="art-card">${art('stones')}</div>` + listCard(LIFE_SKILLS.map(([id, l, ic]) => nrow(ic, l, `${cnt(id)}/5 practices`, `data-a="skill" data-id="${id}"`)).join(''));
  if (tab === 'progress') return h + `<section class="card"><div class="row">${ring(skillsDone() / (LIFE_SKILLS.length * 5), 70, 8)}<div><div class="h3">${skillsDone()} of ${LIFE_SKILLS.length * 5}</div><div class="small muted">practices tried</div></div></div></section>` + listCard(LIFE_SKILLS.map(([id, l]) => `<button class="prow" data-a="skill" data-id="${id}"><div class="row"><span class="t">${l}</span><span class="pct">${cnt(id)}/5</span></div>${pbar(cnt(id) / 5)}</button>`).join(''));
  return h + (S.skillNotes.length ? listCard([...S.skillNotes].reverse().map(n => `<button class="entry" data-a="noteEdit" data-id="${n.id}"><div class="d">${relDay(n.date)}</div><div class="x">${esc(n.text)}</div></button>`).join('')) : `<section class="card">${emptyState('📝', 'Write down what you’re learning about life.')}</section>`) + pill('noteEdit', 'New note');
}
Object.assign(A, {
  skill(el) { skillSheet(el.dataset.id); },
  noteEdit(el) { const x = el.dataset.id ? S.skillNotes.find(n => n.id === el.dataset.id) : null; itemSheet({ title: x ? 'Note' : 'New note', item: x, fields: [{ k: 'text', l: 'Note', t: 'textarea', rows: 5, req: 1 }], onSave: o => { if (x) Object.assign(x, o); else S.skillNotes.push({ id: uid(), date: TODAY(), text: o.text }); }, onDel: () => { S.skillNotes = S.skillNotes.filter(n => n !== x); } }); },
});

/* ---------- autosave fields ---------- */
const SAVERS = {
  intention(el) { S.intention[TODAY()] = el.value; },
  grat(el, [i]) { const t = TODAY(), g = S.gratitude[t] = S.gratitude[t] || ['', '', '']; g[+i] = el.value; },
  mplan(el, [d, slot]) { const m = S.mealPlan[d] = S.mealPlan[d] || {}; m[slot] = el.value; },
  meal(el, [slot]) { const k = ui.foodDay || TODAY(), m = S.meals[k] = S.meals[k] || {}; m[slot] = el.value; },
  moodnote(el) { const t = TODAY(); S.mood[t] = { ...(S.mood[t] || {}), note: el.value }; },
  journal(el) {
    const text = el.value;
    let j = S.journal.find(x => x.id === ui.writeId);
    if (!j) { if (!text.trim()) return; j = { id: uid(), date: TODAY(), prompt: ui.writePrompt || '', text: '' }; S.journal.push(j); ui.writeId = j.id; history.replaceState(null, '', '#/growth/write/' + j.id); lastPath = 'growth/write/' + j.id; }
    j.text = text;
    if (!text.trim()) { S.journal = S.journal.filter(x => x !== j); ui.writeId = null; }
  },
};

/* ---------- global listeners ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  const a = el.dataset.a;
  const fn = (fullActs && fullEl?.contains(el) && fullActs[a]) || (sheetActs && el.closest('#layer') && sheetActs[a]) || A[a];
  if (fn) { e.preventDefault(); fn(el, e); }
});
document.addEventListener('input', e => {
  if (e.target.dataset?.rv) { const l = document.getElementById(e.target.dataset.rv); if (l) l.textContent = e.target.value + '%'; }
  const s = e.target.dataset?.save; if (!s) return;
  const [k, ...args] = s.split(':'); SAVERS[k]?.(e.target, args); saveSoon();
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
  const sh = e.target.closest('.sheet');
  if (sh) { e.preventDefault(); $('[data-a="save"]', sh)?.click(); return; }
  if (e.target.id === 'r-step') { e.preventDefault(); A.addStep(); }
  if (e.target.id === 'shop-in') { e.preventDefault(); A.shopAdd(); }
  if (e.target.id === 'idea-in') { e.preventDefault(); A.ideaAdd(); }
  if (e.target.id === 'g-step') { e.preventDefault(); $('[data-a="addGoalStep"]')?.click(); }
  if (e.target.dataset.save) e.target.blur();
});
document.addEventListener('change', e => {
  if (e.target.id !== 'importFile') return;
  const f = e.target.files?.[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || typeof d !== 'object' || !Array.isArray(d.habits) || !d.profile) throw new Error('bad');
      confirmSheet('Restore backup?', 'This will replace what’s currently in the app with the backup.', 'Restore', () => { localStorage.setItem(KEY, JSON.stringify(d)); S = load(); commit(); toast('Backup restored ✓'); });
    } catch (err) { toast('That file isn’t a RESET backup'); }
  };
  r.readAsText(f); e.target.value = '';
});

/* ---------- day rollover: refresh when the date changes ---------- */
let lastDay = TODAY();
setInterval(() => { if (TODAY() !== lastDay) { lastDay = TODAY(); if (!sheetActs && !fullEl) render(); } }, 60000);

/* ---------- boot ---------- */
render();
if (!S.profile.onboarded) { S.profile.onboarded = true; if (!S.profile.name) setTimeout(() => nameSheet(true), 450); }
save();
try { navigator.storage?.persist?.(); } catch (e) { }
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => { });
}
