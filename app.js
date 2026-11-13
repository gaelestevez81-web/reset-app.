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
const EMOJIS = ['💧', '🥤', '🍵', '☕', '🍎', '🥗', '🥦', '🍳', '🥑', '🍌', '🍽️', '🚫',
  '🚶', '🏃', '💪', '🧘', '🤸', '🚴', '🏊', '🏋️', '🥾', '🧗', '💃', '⚽',
  '😴', '🛏️', '🌙', '☀️', '🌅', '⏰', '📵', '📱', '💻', '🧠', '📖', '📚',
  '✍️', '📝', '🎓', '🗣️', '🌍', '🎵', '🎤', '🎸', '🎹', '🎨', '📷', '🧶',
  '🙏', '❤️', '😊', '🧴', '🦷', '🚿', '💊', '🌿', '🌸', '🌱', '🌳', '🕯️',
  '🧹', '🧺', '🛒', '💰', '📈', '🗓️', '✅', '🎯', '⭐', '🔥', '✨', '🎁',
  '🐾', '🐕', '🐈', '👨‍👩‍👧', '📞', '💌', '🤝', '🏠', '🚗', '✈️', '🧳', '🎬'];
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
    v: 7, created: t,
    profile: { name: '', waterGoal: 8, sleepGoal: 8, moveGoal: 30, kcalGoal: 2000, proteinGoal: 90, carbGoal: 230, fatGoal: 70, waterUnit: 'glasses', glassMl: 250, waterGoalMl: 2000, fastPlan: '16:8', equip: 'body', home: null, healthOrder: null, healthHidden: [], theme: 'auto', accent: 'sage', onboarded: false },
    tasks: [], habits: [], habitLog: {},
    routines: {
      morning: [step('Glass of water', 1), step('Gentle stretch', 5), step('Set today’s intention', 2), step('Make the bed', 2)],
      day: [step('Midday walk', 15), step('Lunch away from screens', 20), step('Three deep breaths', 1)],
      evening: [step('Tidy up for 10 minutes', 10), step('Write in journal', 5), step('Screens off', 0), step('Read before sleep', 15)],
    },
    routineLog: {}, goals: [], water: {}, sleep: {}, moves: [], meals: {}, mood: {},
    journal: [], gratitude: {}, intention: {}, reading: [], vision: [], breaths: {},
    waterMl: {}, fasts: [], steps: {}, bodyLog: [], body: { sex: '', birthYear: '', heightCm: '', activity: 'light', goal: 'maintain' }, healthSync: null,
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
  if ((s.v || 5) < 7) {
    if (!Object.keys(s.waterMl || {}).length) { s.waterMl = {}; Object.entries(s.water || {}).forEach(([k, v]) => { s.waterMl[k] = (+v || 0) * 250; }); }
    s.profile.waterGoalMl = (+s.profile.waterGoal || 8) * 250;
    s.body = { ...f.body, ...(s.body || {}) };
    s.v = 7;
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
const isDone = (h, k) => h.type === 'build' ? hCount(h, k) >= (+h.target || 1) : h.type === 'quit' ? hCount(h, k) <= (+h.target || 0) : h.type === 'auto' ? autoDone(h, k) : (S.habitLog[k] || []).includes(h.id);
const autoDone = (h, k) => h.auto === 'steps' ? (S.steps[k] || 0) >= (+h.target || 8000) : h.auto === 'water' ? wml(k) >= waterGoalMl() : h.auto === 'workout' ? (progDone(k) || S.workoutLog.some(l => l.date === k)) : false;
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
  const done = hs.filter(h => isDone(h, k)).length + ts.filter(t => t.done).length + Math.min(1, (+S.waterMl[k] || 0) / (+S.profile.waterGoalMl || 2000));
  const total = hs.length + ts.length + 1;
  return done / total;
}

/* ---------- theme ---------- */
const mq = matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  const p = S.profile, dark = p.theme === 'dark' || (p.theme === 'auto' && mq.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.accent = p.accent || 'sage';
  $$('meta[name="theme-color"]').forEach(m => m.setAttribute('content', dark ? '#171A16' : '#EAE2D4'));
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
SCREENS.home = r => {
  if (r.sub === 'edit') return homeEdit();
  const t = TODAY(), p = S.profile, hr = new Date().getHours();
  const greet = hr < 5 ? 'Good night' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const pct = dayScore(t);
  const msg = pct === 0 ? 'Small steps. Big changes. Start with one.' : pct < .5 ? 'Nice start — keep the momentum going.' : pct < 1 ? 'More than halfway there. You’ve got this.' : 'Everything done. Be proud of today. 🌿';
  const name = (p.name || '').trim().split(' ')[0];
  const cards = homeLayout().filter(c => c[1]).map(([id]) => HOME_RENDER[id]()).join('');
  return `${WAVES}${appHead()}
  ${head(fmt(t, { weekday: 'long', day: 'numeric', month: 'long' }), `${greet}${name ? ', ' + esc(name) : ''}.`, msg)}
  ${cards}
  <div class="pill-wrap"><button class="pill" data-a="go" data-to="home/edit">${I.editHome} Customize Home</button></div>`;
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
  const chips = [['today', 'Today'], ['anytime', 'To-do'], ['upcoming', 'Upcoming'], ['all', 'All'], ['done', 'Done']];
  const sortT = a => a.sort((x, y) => ((x.date || '9') + (x.time || '')).localeCompare((y.date || '9') + (y.time || '')));
  const group = (title, arr) => arr.length ? `<div class="section-title"><span class="eyebrow">${title}</span><span class="small muted">${arr.length}</span></div><section class="card" style="padding:4px 18px"><ul class="list">${arr.map(taskItem).join('')}</ul></section>` : '';
  let body = '';
  const open = S.tasks.filter(x => !x.done);
  if (f === 'today') {
    body = group('Overdue', sortT(open.filter(x => x.date && x.date < t))) + group('Today', sortT(S.tasks.filter(x => x.date === t))) + group('Anytime', open.filter(x => !x.date));
  } else if (f === 'anytime') {
    body = group('To-do · no date', open.filter(x => !x.date)) + `<button class="btn soft" data-a="newTodo">${I.plus} Add a to-do</button>`;
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
      <button class="emo" style="background:${softOf(h.color)}" data-a="editHabit" data-id="${h.id}">${hIco(h)}</button>
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
  const md = S.mood[sel]?.mood, sl = S.sleep[sel], w = S.profile.waterUnit === 'liters' ? Math.round((+S.waterMl[sel] || 0) / 100) / 10 + ' L' : Math.round((+S.waterMl[sel] || 0) / (+S.profile.glassMl || 250)), mv = moveMins(sel);
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
  const wDays = days.filter(k => (+S.waterMl[k] || 0) >= (+p.waterGoalMl || 2000)).length;
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
    return `<li class="item"><span class="emo" style="width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:${softOf(h.color)};font-size:19px;overflow:hidden">${hIco(h)}</span><div class="body"><div class="t">${esc(h.title)}</div><div class="bar" style="--c:${h.color};margin-top:6px"><i style="width:${ds.length ? d / ds.length * 100 : 0}%"></i></div></div><span class="small" style="text-align:right;white-space:nowrap"><b>🔥 ${streak(h)}</b><br><span class="muted">best ${bestStreak(h)}</span></span></li>`;
  }).join('')}</ul></section>` : ''}

  ${medalsHTML()}
  <div class="section-title"><span class="h2">Milestones</span><span class="small muted">${achievements().filter(a => a.got).length}/${achievements().length}</span></div>
  <div class="badges">${achievements().map(a => `<div class="badge ${a.got ? 'got' : 'locked'}"><div class="e">${a.e}</div><b>${a.t}</b><small>${a.got ? a.d : a.prog}</small></div>`).join('')}</div>`;
};

function achievements() {
  const allDays = Object.keys(S.habitLog).filter(k => S.habitLog[k].length);
  const best = Math.max(0, ...S.habits.map(bestStreak));
  const g = S.profile;
  const waterDays = Object.keys(S.waterMl).filter(k => S.waterMl[k] >= (+g.waterGoalMl || 2000)).length;
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
    A('🏋️', 'Strong start', '10 workouts', S.workoutLog.length, 10),
    A('⏳', 'First fast', 'Completed a fast', S.fasts.filter(f => f.end && fastHours(f) >= f.goalH).length, 1),
    A('📚', 'Bookworm', 'Finished a book', S.reading.filter(b => b.status === 'done').length, 1),
    A('💯', 'Centurion', '100 tasks done', tasks, 100),
    A('📏', 'Checking in', '5 body check-ins', S.bodyLog.length, 5),
  ];
}

/* ---------- PROFILE ---------- */
SCREENS.profile = r => {
  if (r && r.sub === 'body') return pBody();
  if (r && r.sub === 'health') return pHealthSync();
  const p = S.profile, name = (p.name || '').trim();
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const stp = (k, step, unit, min, max) => `<div class="stepper"><button data-a="goal" data-k="${k}" data-v="${-step}" aria-label="Less">−</button><b>${p[k]}${unit}</b><button data-a="goal" data-k="${k}" data-v="${step}" aria-label="More">+</button></div>`;
  return `${WAVES}${appHead()}${head('', 'Profile', 'Your personal RESET space.')}
  <button class="profile-head" style="width:100%;text-align:left" data-a="editName"><span class="avatar">${esc((name || '✿')[0].toUpperCase())}</span><span><span class="h2">${esc(name || 'Add your name')}</span><br><span class="small muted">With RESET since ${fmt(S.created, { day: 'numeric', month: 'long', year: 'numeric' })}</span></span></button>

  <div class="section-title"><span class="eyebrow">Body & health</span></div>
  <section class="card" style="padding:4px 18px">
    <button class="setting" style="width:100%;text-align:left" data-a="go" data-to="profile/body"><span style="font-size:22px">📏</span><div class="body"><div class="t">Body & measurements</div><div class="m">${[ageNow() ? ageNow() + ' years' : '', bodyLatest('weight') ? bodyLatest('weight') + ' kg' : '', S.body.heightCm ? S.body.heightCm + ' cm' : ''].filter(Boolean).join(' · ') || 'Age, weight, measurements & calorie targets'}</div></div><span class="chev">${I.right}</span></button>
    <button class="setting" style="width:100%;text-align:left" data-a="go" data-to="profile/health"><span style="font-size:22px">❤️</span><div class="body"><div class="t">Apple Health</div><div class="m">${S.healthSync?.last ? 'Last import ' + fmtWhen(S.healthSync.last) : 'Import steps, exercise, water, weight & sleep'}</div></div><span class="chev">${I.right}</span></button>
  </section>
  <div class="section-title"><span class="eyebrow">Daily goals</span></div>
  <section class="card" style="padding:4px 18px">
    <button class="setting" style="width:100%;text-align:left" data-a="go" data-to="health/water"><span style="font-size:22px">💧</span><div class="body"><div class="t">Water</div><div class="m">${S.profile.waterUnit === 'liters' ? 'litres' : 'glasses of ' + (S.profile.glassMl || 250) + ' ml'} · tap for options</div></div><b>${fmtL(waterGoalMl())}</b><span class="chev">${I.right}</span></button>
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
  <p class="small muted" style="text-align:center;margin-top:20px">RESET · v7 · Exercise photos: Free Exercise DB (public domain)<br>Everything you enter stays private on this device.</p>`;
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
    <div class="chips" style="margin:10px 0 14px">${(() => { const dv = x ? x.date : (preset ?? TODAY()); return [['tToday', 'Today', dv === TODAY()], ['tTomorrow', 'Tomorrow', dv === addD(TODAY(), 1)], ['tNoDate', 'No date · to-do', !dv]].map(([a, l, on]) => `<button class="chip ${on ? 'on' : ''}" data-a="${a}">${l}</button>`).join(''); })()}</div>
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
  form = { htype: h?.type || 'check', hauto: h?.auto || 'steps', img: h?.img || '', emoji: h?.emoji || '🌿', color: h?.color || HCOLORS[S.habits.length % HCOLORS.length], days: (h?.days || [0, 1, 2, 3, 4, 5, 6]).map(String) };
  const s = openSheet(h ? 'Edit habit' : 'New habit', `
    <label class="field"><span>Habit</span><input class="input" id="f-title" value="${esc(h?.title || '')}" placeholder="e.g. Morning walk" autocomplete="off" enterkeyhint="done"></label>
    <div class="field"><span>Icon</span>
      <div class="row" style="gap:10px;margin-bottom:10px"><label class="btn soft sm" style="cursor:pointer;margin:0">📷 Image or GIF<input type="file" accept="image/*" id="habitImg" hidden></label><span id="habitImgPrev">${form.img ? `<img class="habit-prev" src="${form.img}" alt=""> <button class="link" data-a="habitImgClear">Remove</button>` : ''}</span></div>
      <div class="emoji-grid emoji-scroll">${pickGroup('emoji', EMOJIS.map(e => [e, e]), form.emoji)}</div></div>
    <div class="field"><span>Type</span><div class="seg" style="margin:0">${[['check', '✓ Once'], ['build', '＋ Count up'], ['quit', '－ Limit'], ['auto', '✨ Auto']].map(([v, l]) => `<button class="${form.htype === v ? 'on' : ''}" data-a="hType" data-v="${v}">${l}</button>`).join('')}</div>
      <div class="small muted htype-opt" data-for="check" ${form.htype === 'check' ? '' : 'hidden'} style="margin-top:8px">Tap once a day to mark it done.</div>
      <div class="small muted htype-opt" data-for="build" ${form.htype === 'build' ? '' : 'hidden'} style="margin-top:8px">Each tap adds 1 until you reach your goal — e.g. 8 glasses of water.</div>
      <div class="small muted htype-opt" data-for="quit" ${form.htype === 'quit' ? '' : 'hidden'} style="margin-top:8px">Set a daily maximum. Each tap counts 1 and shows how many you have left — e.g. 10 cigarettes.</div>
      <div class="htype-opt" data-for="auto" ${form.htype === 'auto' ? '' : 'hidden'} style="margin-top:8px"><div class="chips" style="margin:0">${[['steps', '👟 Steps goal'], ['water', '💧 Water goal'], ['workout', '💪 Workout done']].map(([v, l]) => `<button class="chip ${form.hauto === v ? 'on' : ''}" data-a="hAuto" data-v="${v}">${l}</button>`).join('')}</div><div class="small muted" style="margin-top:6px">Ticks itself when your data reaches the goal.</div></div>
      <div class="grid2 htype-opt" data-for="build quit auto" ${['build', 'quit', 'auto'].includes(form.htype) ? '' : 'hidden'} style="margin-top:10px"><label class="field" style="margin:0"><span>Goal / limit</span><input class="input" id="f-target" type="number" inputmode="numeric" min="0" value="${h?.target ?? ''}" placeholder="e.g. 8"></label><label class="field" style="margin:0"><span>Unit (optional)</span><input class="input" id="f-unit" value="${esc(h?.unit || '')}" placeholder="glasses, pages…"></label></div></div>
    <div class="field"><span>Colour</span><div class="swatches">${HCOLORS.map(c => `<button class="sw ${form.color === c ? 'on' : ''}" style="--c:${c}" data-a="pick" data-g="color" data-v="${c}" aria-label="colour"></button>`).join('')}</div></div>
    <div class="field"><span>Repeat on</span><div class="days">${pickGroup('days', DAY_ORDER.map(d => [String(d), DAY_LETTER[d]]), form.days, true)}</div>
    <div class="row" style="gap:14px;margin-top:8px"><button class="link" data-a="allDays">Every day</button><button class="link" data-a="weekdays">Weekdays</button></div></div>
    <button class="btn" data-a="save">${h ? 'Save changes' : 'Create habit'}</button>
    ${h ? `<button class="btn danger" style="margin-top:6px" data-a="del">Delete habit</button>` : ''}`, {
    save() {
      const title = val('#f-title').trim(); if (!title) return shake('#f-title');
      if (!form.days.length) { toast('Choose at least one day'); return; }
      const o = h || { id: uid(), created: TODAY() };
      const tg = +val('#f-target');
      if (['build', 'quit'].includes(form.htype) && !(tg > 0 || (form.htype === 'quit' && val('#f-target') === '0'))) { toast('Set a goal or limit'); return shake('#f-target'); }
      Object.assign(o, { title, emoji: form.emoji, img: form.img || '', color: form.color, days: form.days.map(Number).sort(), type: form.htype, auto: form.htype === 'auto' ? form.hauto : '', target: form.htype === 'check' ? '' : (val('#f-target') === '' ? (form.hauto === 'steps' ? 8000 : 1) : tg), unit: val('#f-unit').trim() });
      if (!h) S.habits.push(o);
      closeSheet(); commit(); toast(h ? 'Habit updated' : 'Habit created 🌱');
    },
    del() { confirmSheet('Delete habit?', `“${esc(h.title)}” and its history will be removed.`, 'Delete habit', () => { S.habits = S.habits.filter(x => x !== h); Object.values(S.habitLog).forEach(a => { const i = a.indexOf(h.id); if (i >= 0) a.splice(i, 1); }); commit(); toast('Habit deleted'); }); },
    allDays() { form.days = ['0', '1', '2', '3', '4', '5', '6']; $$('[data-g="days"]', s).forEach(b => b.classList.add('on')); },
    habitImgClear() { form.img = ''; const pv = $('#habitImgPrev'); if (pv) pv.innerHTML = ''; },
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
    if (h.type === 'build' || h.type === 'quit') { if (el.classList.contains('wd')) habitDaySheet(h, k); else hStep(h, k, +1); return; }
    if (h.type === 'auto') { toast('This habit completes automatically ✨'); return; }
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
  habitsFor(t).filter(h => !isDone(h, t)).forEach(h => r.push([h.img ? `<img src="${h.img}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:14px">` : h.emoji, h.title, 'Habit', 'plan/habits']));
  S.tasks.filter(x => !x.done && x.date && x.date <= t).forEach(x => r.push(['✅', x.title, x.date < t ? 'Overdue task' : 'Task' + (x.time ? ' · ' + x.time : ''), 'plan/tasks']));
  const w = +S.waterMl[t] || 0, wg = +S.profile.waterGoalMl || 2000; if (w < wg) r.push(['💧', S.profile.waterUnit === 'liters' ? `${Math.round((wg - w) / 10) / 100} L more water` : `${Math.ceil((wg - w) / (+S.profile.glassMl || 250))} more glasses of water`, 'Hydration', 'health/water']);
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
  const d = openFull(`<div class="eyebrow">${label}</div><div class="run-progress" style="margin-top:22px"></div><div class="small muted run-of"></div><div class="run-img"></div><div class="run-step"></div><div class="run-note muted"></div><div class="run-timer"></div>
    <div class="actions"><button class="btn" data-a="runDone">${I.check} ${auto ? 'Next' : 'Done'}</button><button class="btn ghost" style="margin-top:8px" data-a="runSkip">Skip</button></div>`, {
    runDone() { onStep && onStep(steps[i]); buzz(); i++; show(); },
    runSkip() { i++; show(); },
  }, () => clearInterval(iv));
  const ri = $('.run-img', d), pg = $('.run-progress', d), st = $('.run-step', d), nt = $('.run-note', d), tm = $('.run-timer', d), of = $('.run-of', d), acts = $('.actions', d);
  const paint = () => { tm.textContent = steps[i].secs ? `${Math.floor(left / 60)}:${pad(left % 60)}` : (steps[i].reps || '✓'); };
  function show() {
    clearInterval(iv);
    if (i >= steps.length) {
      ri.innerHTML = ''; pg.innerHTML = ''; of.textContent = ''; nt.textContent = 'Take a moment to notice how you feel.'; st.textContent = doneTitle; tm.textContent = '🎉';
      acts.innerHTML = `<button class="btn" data-a="closeFull">Finish</button>`;
      onFinish && onFinish(Math.max(1, Math.round((Date.now() - t0) / 60000))); save(); confetti(); return;
    }
    pg.innerHTML = steps.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('');
    of.textContent = `Step ${i + 1} of ${steps.length}`; ri.innerHTML = steps[i].img ? exImg(steps[i].img, 'run') : ''; d.classList.toggle('has-img', !!steps[i].img); st.textContent = steps[i].title; nt.textContent = steps[i].note || '';
    left = steps[i].secs || 0; paint();
    if (left) iv = setInterval(() => { if (left > 0) { left--; paint(); if (!left) { buzz(); if (auto) { onStep && onStep(steps[i]); i++; show(); } } } }, 1000);
  }
  show();
}

/* ---------- built-in content (original) ---------- */
const WORKOUT_TEMPLATES = [
  { id: 't-full', name: 'Full Body Beginner', mins: 25, ex: [['squat', 3, '12'], ['push', 3, '10'], ['glutes', 3, '15'], ['lunge', 3, '10 / leg'], ['plank', 3, '30 sec']] },
  { id: 't-tone', name: 'Strength & Tone', mins: 35, equip: 'weights', ex: [['squat', 3, '12'], ['row', 3, '12'], ['glutes', 3, '12'], ['press', 3, '10'], ['lateral', 3, '12'], ['triceps', 3, '12']] },
  { id: 't-bands', name: 'Resistance Band Session', mins: 25, equip: 'bands', ex: [['squat', 3, '15'], ['row', 3, '15'], ['press', 3, '12'], ['kickback', 3, '12 / leg'], ['lateral', 3, '12'], ['abduction', 2, '20 steps']] },
  { id: 't-weights', name: 'Dumbbell Basics', mins: 30, equip: 'weights', ex: [['squat', 3, '12'], ['push', 3, '10'], ['row', 3, '12'], ['glutes', 3, '12'], ['press', 3, '10'], ['biceps', 2, '12']] },
  { id: 't-core', name: 'Core & Posture', mins: 15, ex: [['deadbug', 3, '10 / side'], ['plank', 3, '30 sec'], ['superman', 3, '20 sec'], ['crunch', 2, '15'], ['glutes', 2, '12']] },
  { id: 't-cardio', name: 'Low-Impact Cardio', mins: 20, ex: [['starjump', 3, '40 sec'], ['climbers', 3, '30 sec'], ['squat', 3, '15'], ['stepup', 3, '10 / leg'], ['abduction', 3, '12 / side']] },
];
const MOBILITY = [
  { id: 'm-full', name: 'Full Body Mobility', steps: [['Neck stretch', 45, 'Ear toward shoulder, slow and gentle. Switch sides halfway.', 'Side_Neck_Stretch'], ['Shoulder circles', 45, 'Big, relaxed circles backward and forward.', 'Shoulder_Circles'], ['Cat stretch', 60, 'On all fours, round and arch your back with your breath.', 'Cat_Stretch'], ['World’s greatest stretch — left', 45, 'Lunge, hand down inside your front foot, rotate and reach up.', 'Worlds_Greatest_Stretch'], ['World’s greatest stretch — right', 45, 'Same on the other side.', 'Worlds_Greatest_Stretch'], ['Hip flexor stretch — left', 45, 'Half-kneel, tuck your pelvis, lean gently forward.', 'Kneeling_Hip_Flexor'], ['Hip flexor stretch — right', 45, 'Same on the other side.', 'Kneeling_Hip_Flexor'], ['Standing forward fold', 60, 'Soft knees, let your head and arms hang heavy.', 'Standing_Toe_Touches'], ['Upper back stretch', 60, 'Clasp your hands in front and round your upper back.', 'Upper_Back_Stretch'], ['Child’s pose', 60, 'Knees wide, arms long, breathe into your back.', 'Childs_Pose']] },
  { id: 'm-morning', name: 'Morning Wake-Up', steps: [['Full-body reach', 30, 'Stretch your arms overhead and lengthen through your sides.', 'Upward_Stretch'], ['Side bends', 40, 'Reach one arm over and lean gently. Alternate sides.', 'Standing_Lateral_Stretch'], ['Cat stretch', 45, 'Move slowly with your breath.', 'Cat_Stretch'], ['Hip circles', 40, 'Hands on hips, draw big circles both ways.', 'Standing_Hip_Circles'], ['Ankle circles', 30, 'Circle each ankle a few times.', 'Ankle_Circles'], ['Deep breaths', 30, 'Three slow breaths in through the nose, out through the mouth.', '']] },
  { id: 'm-desk', name: 'Desk Reset', steps: [['Chin to chest', 30, 'Let your chin drop gently and feel the back of your neck lengthen.', 'Chin_To_Chest_Stretch'], ['Side neck stretch', 40, 'Ear toward shoulder, opposite hand reaching down. Switch halfway.', 'Side_Neck_Stretch'], ['Torso rotation', 40, 'Sit or stand tall and rotate gently to each side.', 'Torso_Rotation'], ['Chest opener', 40, 'Open your arms wide and lift your chest.', 'Chest_And_Front_Of_Shoulder_Stretch'], ['Wrist stretch', 30, 'Gently pull each hand to the side to stretch your wrist.', 'Side_Wrist_Pull'], ['Triceps stretch', 30, 'Reach one hand down your back, other hand on the elbow. Switch.', 'Triceps_Stretch']] },
  { id: 'm-evening', name: 'Evening Unwind', steps: [['Seated forward fold', 60, 'Legs long, fold forward without forcing.', 'Seated_Floor_Hamstring_Stretch'], ['Figure-four stretch', 60, 'Ankle over opposite knee, gently draw in. Switch halfway.', 'Ankle_On_The_Knee'], ['Lying twist', 60, 'Knee across your body, shoulders on the floor. Switch halfway.', 'Lying_Crossover'], ['Knees to chest', 45, 'Hug your knees in and rock gently.', 'Hug_Knees_To_Chest'], ['Child’s pose', 60, 'Rest and breathe slowly.', 'Childs_Pose']] },
  { id: 'm-posture', name: 'Posture & Alignment', steps: [['Elbows back', 45, 'Hands on lower back, draw your elbows back and open the chest.', 'Elbows_Back'], ['Wall chest stretch', 45, 'Arm on a wall, turn gently away. Switch halfway.', 'One_Arm_Against_Wall'], ['Dynamic back stretch', 45, 'Reach up and open your chest, then return.', 'Dynamic_Back_Stretch'], ['Glute bridge hold', 40, 'Lift your hips and hold, breathing steadily.', 'Butt_Lift_Bridge'], ['Pelvic tilt', 30, 'Gently tilt your pelvis forward and back, standing tall.', 'Standing_Pelvic_Tilt']] },
  { id: 'm-legs', name: 'Legs & Hips Release', steps: [['Quad stretch — left', 40, 'Hold your foot behind you, knees together.', 'Quad_Stretch'], ['Quad stretch — right', 40, 'Same on the other side.', 'Quad_Stretch'], ['Calf stretch', 45, 'Hands on the wall, back leg straight, heel down.', 'Calf_Stretch_Hands_Against_Wall'], ['Hip flexor stretch', 60, 'Half-kneel and lean gently forward. Switch halfway.', 'Kneeling_Hip_Flexor'], ['Figure-four stretch', 60, 'Ankle over opposite knee. Switch halfway.', 'Ankle_On_The_Knee']] },
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
/* ---------- Movement ---------- */
const ACT = id => ACTIVITIES.find(a => a[0] === id) || ACTIVITIES[7];
function hMovement() {
  const [h, tab] = modHead('movement', 'Movement', 'health', [['today', 'Today'], ['week', 'Week'], ['month', 'Month']]);
  const t = TODAY(), g = S.profile.moveGoal;
  if (tab === 'today') {
    const mv = moveMins(t), list = S.moves.filter(m => m.date === t);
    return h + `<section class="card hero">${ring(mv / g, 124, 11, 'var(--accent)', `<div>${I.steps.replace('<svg', '<svg style="width:22px;height:22px;margin:0 auto 2px;color:var(--accent-strong)"')}<b>${mv}</b><small>min</small></div>`)}
      <div class="hero-stats">${kv('', 'Daily goal', `${g} min`)}${kv('', 'Activities', list.length)}${S.steps[t] ? kv('', '👣 Steps', S.steps[t].toLocaleString('en-GB')) : ''}${kv('', 'Progress', Math.round(clamp(mv / g, 0, 1) * 100) + '%')}</div></section>
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
const parseEx = txt => txt.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const m = l.match(/^(.*?)\s*[—\-–:]?\s*(\d+)\s*[x×]\s*(.+)$/i); const e = m ? { id: uid(), name: m[1].trim(), sets: +m[2], reps: m[3].trim() } : { id: uid(), name: l, sets: 1, reps: '' }; const p = patternFor(e); if (p) e.pid = p[0]; return e; });
const exText = ex => ex.map(e => `${e.name} ${e.sets}x${e.reps}`).join('\n');
function workoutSheet(id) {
  const w = id ? S.workouts.find(x => x.id === id) : null;
  itemSheet({
    title: w ? 'Edit workout' : 'New workout', item: w ? { ...w, exs: exText(w.exercises), days: w.days, equip: w.equip || S.profile.equip || 'body' } : { days: [], equip: S.profile.equip || 'body' },
    fields: [{ k: 'name', l: 'Name', req: 1, ph: 'e.g. Strength & Tone' }, { k: 'equip', l: 'Equipment', t: 'pick', opts: EQUIP.map(([e, l, ic]) => [e, `${ic} ${l}`]) }, { k: 'days', l: 'Planned days', t: 'multi', cls: 'days', ocls: '', opts: DAY_ORDER.map(d => [d, DAY_LETTER[d]]) }, { k: 'mins', l: 'Approx. minutes', t: 'number', def: 30 }, { k: 'exs', l: 'Exercises — one per line, e.g. “Squat 3x12”', t: 'textarea', rows: 6, ph: 'Squat 3x12\nRow 3x12\nPlank 3x30 sec' }],
    extra: '<p class="small muted" style="margin:-6px 2px 14px">Names like Squat, Lunge, Row, Push-up, Shoulder press, Plank or Crunch show photo guides automatically.</p>',
    onSave: o => { const data = { name: o.name, equip: o.equip || 'body', days: o.days.map(Number), mins: o.mins || 30, exercises: parseEx(o.exs) }; if (w) Object.assign(w, data); else S.workouts.push({ id: uid(), created: TODAY(), ...data }); },
    onDel: () => { S.workouts = S.workouts.filter(x => x !== w); },
  });
}
function startWorkout(w) {
  const eq = w.equip || S.profile.equip || 'body';
  const steps = w.exercises.map(e => { const p = patternFor(e), vid = p ? variantOf(p, eq) : null, info = vid ? exInfo(vid) : null; return { title: e.name, reps: e.reps ? `${e.sets} × ${e.reps}` : '✓', img: vid || '', note: info ? ((info.steps[0] || '').split(/(?<=\.)\s/)[0]) : '' }; });
  if (!steps.length) return toast('Add some exercises first');
  needMedia();
  runSteps({ label: '💪 ' + w.name + ' · ' + EQUIP.find(x => x[0] === eq)[1], steps, onFinish: mins => { const m = Math.max(mins, 5); S.workoutLog.push({ id: uid(), date: TODAY(), wid: w.id, name: w.name, mins: m }); S.moves.push({ id: uid(), date: TODAY(), type: 'strength', mins: m, label: w.name }); }, doneTitle: 'Workout complete!' });
}
function hWorkout() {
  const [h, tab] = modHead('workout', 'Workout Planner', 'health', [['program', 'Program'], ['mine', 'My Workouts'], ['library', 'Library'], ['progress', 'Progress']]);
  const t = TODAY();
  if (tab === 'program') return h + progScreen();
  needMedia();
  if (tab === 'mine') {
    const todays = S.workouts.filter(w => w.days?.includes(dow(t)));
    const cur = todays[0] || S.workouts[0];
    const weekDone = S.workoutLog.filter(l => l.date >= addD(t, -6)).length;
    const curImgs = cur ? cur.exercises.map(e => { const p = patternFor(e); return p ? variantOf(p, cur.equip || 'body') : null; }).filter(Boolean).slice(0, 4) : [];
    return h + `<div class="seg">${EQUIP.map(([e, l, ic]) => `<button class="${(S.profile.equip || 'body') === e ? 'on' : ''}" data-a="setEquip" data-v="${e}">${ic} ${l}</button>`).join('')}</div>`
      + (cur ? `<div class="art-card">${curImgs.length ? `<div class="thumbs">${curImgs.map(thumb).join('')}</div>` : art('sunrise')}<div class="inner"><div class="eyebrow">${todays.length ? 'Today’s workout' : 'Current program'}</div><div class="h2" style="margin:4px 0 2px">${esc(cur.name)}</div><div class="small muted">${EQUIP.find(x => x[0] === (cur.equip || 'body'))[2]} ${EQUIP.find(x => x[0] === (cur.equip || 'body'))[1]} · ${plural(cur.exercises.length, 'exercise')} · about ${cur.mins} min</div>
      <div class="row small" style="margin-top:12px"><span class="muted">This week</span><span class="spacer"></span><b>${weekDone}/${cur.days?.length || 3} sessions</b></div>${pbar(weekDone / (cur.days?.length || 3))}
      <button class="btn" style="margin-top:14px" data-a="wStart" data-id="${cur.id}">${I.play} Start workout</button></div></div>` : `<div class="art-card">${art('sunrise')}<div class="inner"><div class="h3">Build your first workout</div><p class="small muted" style="margin:4px 0 12px">Create your own, or add a ready-made plan from the Library.</p><button class="btn soft" data-a="mtab" data-k="workout" data-v="library">Browse library</button></div></div>`)
      + (S.workouts.length ? sectionT('My workouts') + listCard(S.workouts.map(w => `<div class="item"><span class="ni" style="width:42px;height:42px;border-radius:14px;background:var(--accent-soft);display:grid;place-items:center;font-size:20px">${EQUIP.find(x => x[0] === (w.equip || 'body'))[2]}</span><button class="body" style="text-align:left" data-a="wEdit" data-id="${w.id}"><div class="t">${esc(w.name)}</div><div class="m">${plural(w.exercises.length, 'exercise')} · ${w.mins} min${w.days?.length ? ' · ' + DAY_ORDER.filter(d => w.days.includes(d)).map(d => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d]).join(' ') : ''}</div></button><button class="iconbtn" data-a="wStart" data-id="${w.id}" aria-label="Start" style="color:var(--accent-strong)">${I.play}</button></div>`).join('')) : '')
      + pill('wNew', 'New workout');
  }
  if (tab === 'library') {
    const eq = S.profile.equip || 'body', groups = [...new Set(PATTERNS.map(p => p[2]))];
    return h + `<div class="seg">${EQUIP.map(([e, l, ic]) => `<button class="${eq === e ? 'on' : ''}" data-a="setEquip" data-v="${e}">${ic} ${l}</button>`).join('')}</div>`
      + sectionT('Ready-made plans') + listCard(WORKOUT_TEMPLATES.map(w => `<div class="item"><span class="ni" style="width:42px;height:42px;border-radius:14px;background:var(--sand-soft);display:grid;place-items:center;font-size:20px">${EQUIP.find(x => x[0] === (w.equip || eq))[2]}</span><div class="body"><div class="t">${w.name}</div><div class="m">${plural(w.ex.length, 'exercise')} · ${w.mins} min${w.equip ? ' · ' + EQUIP.find(x => x[0] === w.equip)[1] : ''}</div></div><button class="btn soft sm" data-a="wAdd" data-id="${w.id}">${S.workouts.some(x => x.tpl === w.id) ? 'Added ✓' : 'Add'}</button></div>`).join(''))
      + sectionT('Exercise library', '<span class="small muted">tap for photos & steps</span>')
      + groups.map(g => `<div class="eyebrow" style="margin:14px 2px 8px">${g}</div>` + listCard(PATTERNS.filter(p => p[2] === g).map(p => { const vid = p[EQI[eq]] || variantOf(p, eq); return `<button class="nrow" data-a="exOpen" data-p="${p[0]}">${thumb(vid)}<span class="body"><span class="t">${p[1]}</span><span class="m">${EQUIP.filter(([e]) => p[EQI[e]]).map(([, l, ic]) => ic + ' ' + l).join(' · ')}</span></span><span class="chev">${I.right}</span></button>`; }).join(''))).join('');
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
  setEquip(el) { S.profile.equip = el.dataset.v; commit(); },
  wAdd(el) { const tp = WORKOUT_TEMPLATES.find(x => x.id === el.dataset.id); if (S.workouts.some(x => x.tpl === tp.id)) return toast('Already in My Workouts'); S.workouts.push({ id: uid(), tpl: tp.id, name: tp.name, mins: tp.mins, equip: tp.equip || S.profile.equip || 'body', days: [1, 3, 5], created: TODAY(), exercises: tp.ex.map(([pid, sets, reps]) => ({ id: uid(), pid, name: pat(pid)[1], sets, reps })) }); commit(); toast('Added to My Workouts ✓'); },
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
      ${calorieEstimate() ? `<section class="card tint-accent"><div class="row"><div class="body" style="flex:1"><div class="eyebrow">From your body profile</div><div class="small" style="color:var(--ink2);margin-top:4px">Suggested ${calorieEstimate().kcal} kcal · P ${calorieEstimate().protein} g · C ${calorieEstimate().carbs} g · F ${calorieEstimate().fat} g</div></div><button class="btn soft sm" data-a="applyCalories">Apply</button></div></section>` : `<section class="card tint-accent"><div class="small" style="color:var(--ink2)">Add your age, height and weight in <button class="link" data-a="go" data-to="profile/body">Body & measurements</button> to get personalised targets.</div></section>`}
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
    return h + kitchenScreen();
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
  needMedia();
  runSteps({ label: '🧘 ' + r.name, steps: r.steps.map(([t, s, n, img]) => ({ title: t, secs: s, note: n, img: img || '' })), auto: true, onFinish: m => { S.mobilityLog.push({ id: uid(), date: TODAY(), rid: r.id, name: r.name, mins: Math.max(m, mobMins(r)) }); S.moves.push({ id: uid(), date: TODAY(), type: 'stretch', mins: Math.max(m, mobMins(r)), label: r.name }); } });
}
function hMobility() {
  const [h, tab] = modHead('mobility', 'Mobility & Flexibility', 'health', [['routines', 'Routines'], ['library', 'Library'], ['progress', 'Progress']]);
  const t = TODAY(), today = MOBILITY[dayNum(t) % MOBILITY.length], doneToday = S.mobilityLog.some(l => l.date === t);
  needMedia();
  if (tab === 'routines') {
    const imgs = today.steps.map(x => x[3]).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
    return h + `<div class="art-card">${imgs.length ? `<div class="thumbs">${imgs.map(thumb).join('')}</div>` : art('leaves')}<div class="inner"><div class="row"><div><div class="eyebrow">Today’s routine</div><div class="h2" style="margin:4px 0 2px">${today.name}</div><div class="small muted">${mobMins(today)} min · ${plural(today.steps.length, 'stretch')}${doneToday ? ' · done today ✓' : ''}</div></div><span class="spacer"></span><button class="fab" style="position:static;width:54px;height:54px;border-radius:50%" data-a="mobStart" data-id="${today.id}" aria-label="Start">${I.play}</button></div></div></div>`
      + sectionT('All routines') + listCard(MOBILITY.map(r => nrow(I.stretch, r.name, `${mobMins(r)} min · ${plural(r.steps.length, 'stretch')}`.replace('stretchs', 'stretches'), `data-a="mobStart" data-id="${r.id}"`, I.play)).join('')).replace(/stretchs/g, 'stretches');
  }
  if (tab === 'library') {
    const seen = new Set(), list = [];
    MOBILITY.forEach(r => r.steps.forEach(([n, , d, img]) => { const base = n.replace(/ — (left|right)$/, ''); if (!seen.has(base) && d && !d.startsWith('Same')) { seen.add(base); list.push([base, d, img]); } }));
    return h + listCard(list.map(([n, d, img], i) => `<button class="nrow" data-a="stretchOpen" data-i="${i}" ${img ? '' : 'disabled'}>${img ? thumb(img) : `<span class="thumb ph">${I.stretch}</span>`}<span class="body"><span class="t">${n}</span><span class="m">${d}</span></span>${img ? `<span class="chev">${I.right}</span>` : ''}</button>`).join(''));
  }
  const weeks = 8, mon = addD(t, -((dow(t) + 6) % 7) - (weeks - 1) * 7);
  const wk = Array.from({ length: weeks }, (_, i) => { const s = addD(mon, i * 7), e = addD(s, 6); return sum(S.mobilityLog.filter(l => l.date >= s && l.date <= e).map(l => l.mins)); });
  let st = 0, k = doneToday ? t : addD(t, -1); while (S.mobilityLog.some(l => l.date === k)) { st++; k = addD(k, -1); }
  return h + `<div class="grid2"><div class="card stat" style="margin:0"><div class="v">${S.mobilityLog.length}</div><div class="k">Sessions</div></div><div class="card stat" style="margin:0"><div class="v">🔥 ${st}</div><div class="k">Day streak</div></div></div>
    <section class="card"><div class="card-head"><span class="eyebrow">Minutes per week</span></div>${bars(wk, wk.map((_, i) => i === weeks - 1 ? 'Now' : `-${weeks - 1 - i}w`), { color: 'var(--accent)' })}</section>`;
}
A.mobStart = el => startMobility(el.dataset.id);
A.stretchOpen = el => {
  const seen = new Set(), list = [];
  MOBILITY.forEach(r => r.steps.forEach(([n, , d, img]) => { const base = n.replace(/ — (left|right)$/, ''); if (!seen.has(base) && d && !d.startsWith('Same')) { seen.add(base); list.push([base, d, img]); } }));
  const [n, d, img] = list[+el.dataset.i]; const info = exInfo(img);
  openSheet(n, `${exImg(img)}<p style="font-size:16px;margin:14px 2px 8px">${esc(d)}</p>${info ? `<ol class="steps">${info.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}<p class="small muted">Breathe slowly and never push into pain.</p>`);
};

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

/* =========================================================
   v7 — water units, fasting, body, medals, home editor,
        exercise photos, Apple Health bridge
   ========================================================= */
Object.assign(I, {
  editHome: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
  up: svg('<path d="M6 15l6-6 6 6"/>'),
  down: svg('<path d="M6 9l6 6 6-6"/>'),
  timer: svg('<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 1.5M9.5 3h5"/>'),
  body: svg('<circle cx="12" cy="5" r="2"/><path d="M5 9l7 1.5L19 9M12 10.5V15l-3 6M12 15l3 6"/>'),
  heartPulse: svg('<path d="M12 20s-7.5-4.4-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8c0 1-.2 1.9-.6 2.7"/><path d="M3 13h4l2-3 3 6 2-3h7"/>'),
});

/* ---------- water (stored in millilitres) ---------- */
const glassMl = () => +S.profile.glassMl || 250;
const waterGoalMl = () => +S.profile.waterGoalMl || 2000;
const wml = k => +S.waterMl[k] || 0;
const isLiters = () => S.profile.waterUnit === 'liters';
const fmtL = ml => { const v = Math.round(ml / 10) / 100; return (Number.isInteger(v) ? String(v) : String(v)) + ' L'; };
const glassesOf = ml => Math.round(ml / glassMl() * 10) / 10;
function waterLabel(ml, withGoal = true) {
  if (isLiters()) return withGoal ? `${fmtL(ml).replace(' L', '')} / ${fmtL(waterGoalMl())}` : fmtL(ml);
  const G = Math.round(waterGoalMl() / glassMl());
  return withGoal ? `${glassesOf(ml)} / ${G} glasses` : `${glassesOf(ml)} ${glassesOf(ml) === 1 ? 'glass' : 'glasses'}`;
}
function addWater(delta) {
  const t = TODAY(), before = wml(t), goal = waterGoalMl();
  S.waterMl[t] = clamp(before + delta, 0, 10000); buzz(); commit();
  if (before < goal && S.waterMl[t] >= goal) { confetti(); toast('Hydration goal reached 💧'); }
}
Object.assign(A, {
  water(el) { addWater(+el.dataset.v * glassMl()); },
  waterAdd(el) { addWater(+el.dataset.v); },
  waterGlass(el) { const t = TODAY(), gm = glassMl(), n = +el.dataset.v, cur = Math.floor(wml(t) / gm + 0.001); addWater((cur === n ? n - 1 : n) * gm - wml(t)); },
  waterUnit(el) { S.profile.waterUnit = el.dataset.v; commit(); },
  waterGoal(el) { S.profile.waterGoalMl = clamp(waterGoalMl() + +el.dataset.v, 500, 6000); commit(); },
});
function waterCardHTML() {
  const t = TODAY(), ml = wml(t), goal = waterGoalMl(), gm = glassMl();
  const head = `<div class="card-head"><span class="eyebrow">Hydration</span><button class="small" style="font-weight:700;color:var(--water)" data-a="go" data-to="health/water">${waterLabel(ml)} ›</button></div>`;
  if (isLiters()) {
    return `<section class="card tint-water">${head}<div class="bar" style="--c:var(--water);height:12px"><i style="width:${clamp(ml / goal, 0, 1) * 100}%"></i></div>
    <div class="row" style="gap:8px;margin-top:14px;flex-wrap:wrap"><button class="chip" data-a="waterAdd" data-v="-250">− 250 ml</button><span class="spacer"></span><button class="chip" data-a="waterAdd" data-v="250">+ 250 ml</button><button class="chip" data-a="waterAdd" data-v="500">+ 500 ml</button></div></section>`;
  }
  const G = Math.max(1, Math.round(goal / gm)), n = Math.floor(ml / gm + 0.001);
  return `<section class="card tint-water">${head}<div class="row"><div class="drops" style="flex:1">${Array.from({ length: Math.max(G, n) }, (_, i) => `<button class="drop ${i < n ? 'on' : ''}" data-a="waterGlass" data-v="${i + 1}" aria-label="Glass ${i + 1}">${I.dropFill}</button>`).join('')}</div>
  <button class="iconbtn" data-a="waterAdd" data-v="${gm}" aria-label="Add a glass" style="color:var(--water)">${I.plus}</button></div></section>`;
}
function hWater() {
  const [h] = modHead('water', 'Water', 'home');
  const t = TODAY(), ml = wml(t), goal = waterGoalMl(), f = clamp(ml / goal, 0, 1), gm = glassMl(), L = isLiters();
  const days = daysBack(7), vals = days.map(k => L ? Math.round(wml(k) / 100) / 10 : glassesOf(wml(k)));
  const btns = L ? [[-250, '− 250 ml'], [250, '+ 250 ml'], [500, '+ 500 ml'], [750, '+ 750 ml']] : [[-gm, '− 1 glass'], [gm, '+ 1 glass'], [gm * 2, '+ 2 glasses']];
  return h + `<div class="seg">${[['glasses', 'Glasses'], ['liters', 'Liters']].map(([v, l]) => `<button class="${(S.profile.waterUnit || 'glasses') === v ? 'on' : ''}" data-a="waterUnit" data-v="${v}">${l}</button>`).join('')}</div>
  <section class="card"><div class="glass-wrap">
    <svg viewBox="0 0 120 160" width="120" aria-hidden="true"><defs><clipPath id="gc"><path d="M18 12h84l-11 136H29z"/></clipPath></defs>
    <path d="M18 12h84l-11 136H29z" fill="var(--water-soft)"/><rect clip-path="url(#gc)" x="0" y="${12 + 136 * (1 - f)}" width="120" height="160" fill="var(--water)" opacity=".8"/>
    <path d="M18 12h84l-11 136H29z" fill="none" stroke="var(--water)" stroke-width="2.5" stroke-linejoin="round"/></svg>
    <div class="bigstat">${L ? fmtL(ml).replace(' L', '') : glassesOf(ml)}<small> ${L ? '/ ' + fmtL(goal) : '/ ' + Math.round(goal / gm) + ' glasses'}</small></div>
    <div class="chips" style="justify-content:center;margin:0">${btns.map(([v, l]) => `<button class="chip" data-a="waterAdd" data-v="${v}">${l}</button>`).join('')}</div>
  </div></section>
  <section class="card" style="padding:4px 18px">
    <div class="setting"><div class="body"><div class="t">Glass size</div><div class="m">How much one of your glasses holds</div></div><select class="input" style="width:auto;min-height:40px;padding:8px 12px" data-change="glassMl" aria-label="Glass size">${[150, 200, 250, 300, 330, 400, 500].map(v => `<option value="${v}" ${gm === v ? 'selected' : ''}>${v} ml</option>`).join('')}</select></div>
    <div class="setting"><div class="body"><div class="t">Daily goal</div><div class="m">about ${Math.round(goal / gm)} glasses</div></div><div class="stepper"><button data-a="waterGoal" data-v="-250" aria-label="Less">−</button><b>${fmtL(goal)}</b><button data-a="waterGoal" data-v="250" aria-label="More">+</button></div></div>
  </section>
  <section class="card"><div class="card-head"><span class="eyebrow">Last 7 days</span><span class="small muted">Goal reached ${days.filter(k => wml(k) >= goal).length}/7</span></div>${bars(vals, days.map(k => shortLbl(k, 7)), { color: 'var(--water)', goal: L ? goal / 1000 : Math.round(goal / gm), fmtv: v => String(v) })}</section>`;
}
const CHANGERS = {
  glassMl(el) { S.profile.glassMl = +el.value; commit(); },
};

/* ---------- habit icons (emoji or your own photo) ---------- */
const hIco = h => h.img ? `<img src="${h.img}" alt="">` : h.emoji;
function resizeImage(file, size, cb) {
  const r = new FileReader();
  r.onload = () => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const s = Math.min(im.width, im.height), x = (im.width - s) / 2, y = (im.height - s) / 2;
      c.getContext('2d').drawImage(im, x, y, s, s, 0, 0, size, size);
      cb(c.toDataURL('image/jpeg', 0.82));
    };
    im.onerror = () => toast('Couldn’t read that image');
    im.src = r.result;
  };
  r.readAsDataURL(file);
}

/* ---------- exercise photos (lazy-loaded media.js) ---------- */
let mediaState = 0;
function needMedia() {
  if (window.RESET_MEDIA) { mediaState = 2; return true; }
  if (mediaState) return false;
  mediaState = 1;
  const s = document.createElement('script');
  s.src = 'media.js';
  s.onload = () => { mediaState = 2; $$('[data-wait]').forEach(el => { el.outerHTML = exImg(el.dataset.wait, el.dataset.cls || ''); }); if (!sheetActs && !fullEl) render(); };
  s.onerror = () => { mediaState = 0; $$('[data-wait]').forEach(el => { el.innerHTML = '<span class="small muted">Photos unavailable offline</span>'; }); };
  document.head.appendChild(s);
  return false;
}
function exImg(id, cls = '') {
  if (!id) return '';
  needMedia();
  const m = (window.RESET_MEDIA || {})[id];
  if (!m) return `<div class="exph ${cls}" data-wait="${id}" data-cls="${cls}"><span class="small muted">Loading photos…</span></div>`;
  return `<div class="exph ${cls}"><img src="${m[0]}" alt="Start position"><img src="${m[1]}" alt="End position" class="b"></div>`;
}
const exInfo = id => (window.RESET_EXINFO || {})[id];
const EQUIP = [['body', 'No equipment', '🧍'], ['weights', 'Weights', '🏋️'], ['bands', 'Bands', '➰']];
const EQI = { body: 3, weights: 4, bands: 5 };
const PATTERNS = [
  ['squat', 'Squat', 'Legs', 'Bodyweight_Squat', 'Dumbbell_Squat', 'Squats_-_With_Bands'],
  ['lunge', 'Lunge', 'Legs', 'Bodyweight_Walking_Lunge', 'Dumbbell_Lunges', null],
  ['glutes', 'Glutes & hamstrings', 'Legs', 'Butt_Lift_Bridge', 'Stiff-Legged_Dumbbell_Deadlift', 'Hip_Lift_with_Band'],
  ['calf', 'Calf raise', 'Legs', null, 'Calf_Raise_On_A_Dumbbell', 'Calf_Raises_-_With_Bands'],
  ['kickback', 'Glute kickback', 'Legs', 'Glute_Kickback', null, 'Hip_Extension_with_Bands'],
  ['abduction', 'Hip abduction', 'Legs', 'Side_Leg_Raises', null, 'Monster_Walk'],
  ['stepup', 'Step-up', 'Legs', 'Step-up_with_Knee_Raise', null, null],
  ['push', 'Push-up / chest press', 'Upper body', 'Pushups', 'Dumbbell_Bench_Press', 'Bench_Press_-_With_Bands'],
  ['fly', 'Chest fly', 'Upper body', 'Isometric_Chest_Squeezes', 'Dumbbell_Flyes', 'Cross_Over_-_With_Bands'],
  ['row', 'Row', 'Upper body', 'Inverted_Row', 'Bent_Over_Two-Dumbbell_Row', 'Band_Pull_Apart'],
  ['reardelt', 'Rear shoulder fly', 'Upper body', null, 'Reverse_Flyes', 'Back_Flyes_-_With_Bands'],
  ['press', 'Shoulder press', 'Upper body', 'Push_Up_to_Side_Plank', 'Standing_Dumbbell_Press', 'Shoulder_Press_-_With_Bands'],
  ['lateral', 'Lateral raise', 'Upper body', 'Arm_Circles', 'Side_Lateral_Raise', 'Lateral_Raise_-_With_Bands'],
  ['upright', 'Upright row', 'Upper body', null, 'Standing_Dumbbell_Upright_Row', 'Upright_Row_-_With_Bands'],
  ['triceps', 'Triceps', 'Upper body', 'Bench_Dips', 'Tricep_Dumbbell_Kickback', 'Band_Skull_Crusher'],
  ['biceps', 'Biceps curl', 'Upper body', null, 'Dumbbell_Bicep_Curl', null],
  ['plank', 'Plank', 'Core', 'Plank', 'Dumbbell_Side_Bend', null],
  ['deadbug', 'Dead bug', 'Core', 'Dead_Bug', null, null],
  ['crunch', 'Crunch', 'Core', 'Crunches', null, null],
  ['superman', 'Superman', 'Core', 'Superman', null, null],
  ['climbers', 'Mountain climbers', 'Cardio', 'Mountain_Climbers', null, null],
  ['starjump', 'Star jump', 'Cardio', 'Star_Jump', null, null],
];
const pat = id => PATTERNS.find(p => p[0] === id);
const variantOf = (p, eq) => p[EQI[eq] || 3] || p[3] || p[4] || p[5];
const PATTERN_WORDS = [['squat', 'squat'], ['lunge', 'lunge'], ['bridge', 'glutes'], ['deadlift', 'glutes'], ['hinge', 'glutes'], ['calf', 'calf'], ['kickback', 'kickback'], ['abduct', 'abduction'], ['monster', 'abduction'], ['side leg', 'abduction'], ['step', 'stepup'], ['push', 'push'], ['chest press', 'push'], ['bench', 'push'], ['fly', 'fly'], ['rear', 'reardelt'], ['row', 'row'], ['pull', 'row'], ['shoulder press', 'press'], ['overhead', 'press'], ['lateral', 'lateral'], ['upright', 'upright'], ['tricep', 'triceps'], ['dip', 'triceps'], ['curl', 'biceps'], ['bicep', 'biceps'], ['plank', 'plank'], ['dead bug', 'deadbug'], ['crunch', 'crunch'], ['sit-up', 'crunch'], ['superman', 'superman'], ['bird dog', 'superman'], ['climber', 'climbers'], ['jack', 'starjump'], ['star', 'starjump'], ['jump', 'starjump']];
function patternFor(e) {
  if (e.pid && pat(e.pid)) return pat(e.pid);
  const n = (e.name || '').toLowerCase();
  const hit = PATTERN_WORDS.find(([w]) => n.includes(w));
  return hit ? pat(hit[1]) : null;
}
function exBody(pid, eq) {
  const p = pat(pid), vid = p[EQI[eq]], info = vid ? exInfo(vid) : null;
  return `<div class="seg">${EQUIP.map(([e, l, ic]) => `<button class="${eq === e ? 'on' : ''} ${p[EQI[e]] ? '' : 'dim'}" data-a="exEq" data-p="${pid}" data-v="${e}">${ic} ${l}</button>`).join('')}</div>
  ${vid ? exImg(vid) + (info ? `<div class="small muted" style="margin:10px 2px 6px">${esc(info.name)}${info.muscles?.length ? ' · ' + esc(info.muscles.join(', ')) : ''}</div><ol class="steps">${info.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : '<p class="small muted">Instructions load with the photos.</p>')
    : emptyState('🤷', `No ${EQUIP.find(x => x[0] === eq)[1].toLowerCase()} version of this one yet. Try another tab.`)}
  <p class="small muted">Photos show the start and end position. Move within a comfortable range and stop if anything hurts.</p>`;
}
function exSheet(pid, eq) {
  const p = pat(pid);
  eq = eq || (p[EQI[S.profile.equip || 'body']] ? S.profile.equip || 'body' : EQUIP.find(([e]) => p[EQI[e]])[0]);
  openSheet(p[1], exBody(pid, eq), { exEq(el) { const b = $('.sheet-body'); if (b) b.innerHTML = exBody(el.dataset.p, el.dataset.v); } });
}
A.exOpen = el => exSheet(el.dataset.p);
const thumb = id => { const m = (window.RESET_MEDIA || {})[id]; return m ? `<span class="thumb"><img src="${m[0]}" alt=""></span>` : `<span class="thumb ph">${I.dumbbell}</span>`; };

/* ---------- fasting ---------- */
const FAST_PLANS = [['12:12', 12], ['14:10', 14], ['16:8', 16], ['18:6', 18], ['20:4', 20], ['OMAD', 23]];
const activeFast = () => S.fasts.find(f => !f.end);
const fastHours = f => Math.max(0, ((f.end ? new Date(f.end) : new Date()) - new Date(f.start)) / 36e5);
const hms = h => { const s = Math.max(0, Math.floor(h * 3600)); return `${Math.floor(s / 3600)}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}`; };
const fmtWhen = d => new Date(d).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
const toLocalInput = d => { d = new Date(d); return `${dk(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const kvRow = (k, v) => `<div class="kv"><span class="k">${k}</span><b>${v}</b></div>`;
function fastStage(h) {
  if (h < 4) return ['🍽️', 'Digesting', 'Your body is still using energy from your last meal.'];
  if (h < 12) return ['🌙', 'Early fast', 'Things are settling. Sip water and keep busy.'];
  if (h < 16) return ['🔥', 'Fasting zone', 'Many people notice calm focus around now.'];
  if (h < 20) return ['✨', 'Deep fast', 'Listen to your body and break your fast gently.'];
  return ['🌿', 'Extended fast', 'Long fasts aren’t for everyone — check in with a professional.'];
}
const planText = p => { const h = (FAST_PLANS.find(x => x[0] === p) || FAST_PLANS[2])[1]; return `Fast for ${h} hours, eat within ${24 - h} ${24 - h === 1 ? 'hour' : 'hours'}.`; };
function fastRingHTML(f, size = 180) {
  const h = fastHours(f);
  return `<div class="js-fast-ring" data-goal="${f.goalH}">${ring(h / f.goalH, size, 12, 'var(--accent)', `<div><small>ELAPSED</small><b class="js-fast-elapsed">${hms(h)}</b><small class="js-fast-pct">${Math.round(h / f.goalH * 100)}% of ${f.goalH}h</small></div>`)}</div>`;
}
function fastTick() {
  const f = activeFast(); if (!f) return;
  const h = fastHours(f);
  $$('.js-fast-elapsed').forEach(e => { e.textContent = hms(h); });
  $$('.js-fast-pct').forEach(e => { e.textContent = `${Math.round(h / f.goalH * 100)}% of ${f.goalH}h`; });
  $$('.js-fast-ring').forEach(w => {
    const c = w.querySelectorAll('circle')[1]; if (!c) return;
    const C = 2 * Math.PI * +c.getAttribute('r'), p = clamp(h / f.goalH, 0, 1);
    c.setAttribute('stroke-dashoffset', (C * (1 - p)).toFixed(2)); c.setAttribute('opacity', p > 0 ? 1 : 0);
  });
}
setInterval(fastTick, 1000);
function hFasting() {
  const [h, tab] = modHead('fasting', 'Fasting', 'health', [['now', 'Now'], ['history', 'History']]);
  const f = activeFast();
  if (tab === 'now') {
    if (f) {
      const hh = fastHours(f), st = fastStage(hh), endAt = new Date(new Date(f.start).getTime() + f.goalH * 36e5);
      return h + `<section class="card" style="display:flex;flex-direction:column;align-items:center;padding:24px 18px">${fastRingHTML(f)}<div class="h3" style="margin-top:14px">${st[0]} ${st[1]}</div><div class="small muted" style="text-align:center;max-width:300px">${st[2]}</div></section>
      <section class="card" style="padding:4px 18px">${kvRow('Plan', f.plan)}${kvRow('Started', fmtWhen(f.start))}${kvRow('Goal reached at', fmtWhen(endAt))}</section>
      <button class="btn" data-a="fastEnd">End fast</button><button class="btn ghost" style="margin-top:8px" data-a="fastEdit">Edit start time</button>`;
    }
    const plan = S.profile.fastPlan || '16:8', last = [...S.fasts].filter(x => x.end).sort((a, b) => b.end.localeCompare(a.end))[0];
    return h + `<div class="art-card">${art('mountain')}<div class="inner"><div class="eyebrow">Choose your plan</div><div class="chips" style="margin:10px 0 10px">${FAST_PLANS.map(([p]) => `<button class="chip ${plan === p ? 'on' : ''}" data-a="fastPlan" data-v="${p}">${p}</button>`).join('')}</div>
      <div class="small muted" style="margin-bottom:14px">${planText(plan)}</div><button class="btn" data-a="fastStart">${I.play} Start fasting now</button><button class="btn ghost" style="margin-top:8px" data-a="fastEdit">I started earlier</button></div></div>
      ${last ? `<section class="card"><div class="card-head"><span class="eyebrow">Last fast</span><span class="small muted">${fmtWhen(last.end)}</span></div><div class="row"><span class="bigstat" style="font-size:34px">${hoursFmt(fastHours(last))}</span><span class="spacer"></span><span class="tag ${fastHours(last) >= last.goalH ? 'green' : ''}">${fastHours(last) >= last.goalH ? 'Goal reached ✓' : last.plan}</span></div></section>` : ''}
      <section class="card tint-mood"><div class="small" style="color:var(--ink2)">Fasting isn’t right for everyone. If you’re pregnant, have diabetes or another health condition, or have a history of disordered eating, talk to a doctor first. Drink water while you fast.</div></section>`;
  }
  const done = [...S.fasts].filter(x => x.end).sort((a, b) => b.end.localeCompare(a.end));
  const last10 = done.slice(0, 10).reverse(), hrs = done.map(fastHours);
  return h + `<div class="grid2"><div class="card stat" style="margin:0"><div class="v">${done.length}</div><div class="k">Fasts completed</div></div><div class="card stat" style="margin:0"><div class="v">${done.filter(x => fastHours(x) >= x.goalH).length}</div><div class="k">Goals reached</div></div>
    <div class="card stat" style="margin:0"><div class="v">${hrs.length ? hoursFmt(avg(hrs)) : '—'}</div><div class="k">Average fast</div></div><div class="card stat" style="margin:0"><div class="v">${hrs.length ? hoursFmt(Math.max(...hrs)) : '—'}</div><div class="k">Longest fast</div></div></div>
    ${last10.length ? `<section class="card"><div class="card-head"><span class="eyebrow">Last ${last10.length} fasts · hours</span></div>${bars(last10.map(x => Math.round(fastHours(x) * 10) / 10), last10.map(x => String(new Date(x.end).getDate())), { color: 'var(--accent)', goal: S.fasts.length ? (FAST_PLANS.find(p => p[0] === (S.profile.fastPlan || '16:8')) || FAST_PLANS[2])[1] : null, fmtv: v => String(Math.round(v)) })}</section>` : ''}
    ${done.length ? listCard(done.slice(0, 30).map(x => `<div class="item" data-a="fastEditPast" data-id="${x.id}" style="cursor:pointer"><span style="font-size:22px">${fastHours(x) >= x.goalH ? '✅' : '⏳'}</span><div class="body"><div class="t">${hoursFmt(fastHours(x))} <span class="small muted">· ${x.plan}</span></div><div class="m">${fmtWhen(x.start)} → ${fmtWhen(x.end)}</div></div><button class="delx" data-a="fastDel" data-id="${x.id}" aria-label="Remove">${I.x}</button></div>`).join('')) : `<section class="card">${emptyState('⏳', 'Your completed fasts will appear here.')}</section>`}`;
}
const hoursFmt = h => { const H = Math.floor(h), M = Math.round((h - H) * 60); return M === 60 ? `${H + 1}h` : M ? `${H}h ${M}m` : `${H}h`; };
Object.assign(A, {
  fastPlan(el) { S.profile.fastPlan = el.dataset.v; commit(); },
  fastStart() { const p = S.profile.fastPlan || '16:8'; S.fasts.push({ id: uid(), start: new Date().toISOString(), end: null, plan: p, goalH: (FAST_PLANS.find(x => x[0] === p) || FAST_PLANS[2])[1] }); buzz(); commit(); toast('Fast started — you’ve got this 🌿'); },
  fastEnd() {
    const f = activeFast(); if (!f) return;
    const finish = () => { f.end = new Date().toISOString(); commit(); if (fastHours(f) >= f.goalH) { confetti(); toast(`Fast complete: ${hoursFmt(fastHours(f))} 🎉`); } else toast(`Fast ended at ${hoursFmt(fastHours(f))}`); };
    if (fastHours(f) < f.goalH) confirmSheet('End your fast early?', `You’ve fasted ${hoursFmt(fastHours(f))} of ${f.goalH}h. Ending early is completely okay — listen to your body.`, 'End fast', finish);
    else finish();
  },
  fastEdit() {
    const f = activeFast();
    form = {};
    openSheet(f ? 'Edit start time' : 'When did you start?', `<label class="field"><span>Started fasting at</span><input class="input" type="datetime-local" id="ff-start" value="${toLocalInput(f ? f.start : Date.now() - 2 * 36e5)}" max="${toLocalInput(Date.now())}"></label><button class="btn" data-a="save">Save</button>`, {
      save() {
        const v = val('#ff-start'); const d = new Date(v);
        if (!v || isNaN(d) || d > new Date()) return shake('#ff-start');
        if (f) f.start = d.toISOString();
        else { const p = S.profile.fastPlan || '16:8'; S.fasts.push({ id: uid(), start: d.toISOString(), end: null, plan: p, goalH: (FAST_PLANS.find(x => x[0] === p) || FAST_PLANS[2])[1] }); }
        closeSheet(); commit();
      },
    });
  },
  fastDel(el) { S.fasts = S.fasts.filter(x => x.id !== el.dataset.id); commit(); },
});

/* ---------- health hub (re-orderable) ---------- */
const HEALTH_MODS = {
  movement: ['Movement', () => I.steps, t => `${moveMins(t)} of ${S.profile.moveGoal} min`],
  workout: ['Workout Planner', () => I.dumbbell, t => { const p = progInfo(t); return p.kind === 'rest' ? 'Rest day today' : (progDone(t) ? '✓ ' : 'Today: ') + p.name; }],
  mobility: ['Mobility & Flexibility', () => I.stretch, t => `Today: ${MOBILITY[dayNum(t) % MOBILITY.length].name}`],
  nutrition: ['Nutrition', () => I.apple, t => { const k = sum(foodItems(t).map(f => +f.kcal || 0)); return k ? `${k} kcal today` : 'Food diary'; }],
  meals: ['Meal Planner & Recipes', () => I.mealcal, () => '200 recipes · plan · shopping'],
  sleep: ['Sleep', () => I.bed, t => S.sleep[t] ? hours(S.sleep[t].hours) + ' last night' : 'Log last night'],
  fasting: ['Fasting', () => I.timer, () => { const f = activeFast(); return f ? `<span class="js-fast-elapsed">${hms(fastHours(f))}</span>` : `Plan ${S.profile.fastPlan || '16:8'}`; }],
  wellness: ['Wellness', () => I.lotus, t => S.mood[t]?.mood ? MOODS[S.mood[t].mood - 1].e + ' ' + MOODS[S.mood[t].mood - 1].t : 'Mood & mindfulness'],
  water: ['Water', () => I.drop, t => waterLabel(wml(t))],
};
const DEFAULT_HEALTH = ['movement', 'workout', 'mobility', 'nutrition', 'meals', 'sleep', 'fasting', 'wellness'];
function healthOrder() {
  const o = (S.profile.healthOrder || DEFAULT_HEALTH).filter(id => HEALTH_MODS[id]);
  DEFAULT_HEALTH.forEach(id => { if (!o.includes(id) && !(S.profile.healthHidden || []).includes(id)) o.push(id); });
  return o;
}
const moveIn = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return arr; const a = [...arr]; [a[i], a[j]] = [a[j], a[i]]; return a; };
SCREENS.health = r => {
  const map = { move: 'movement', mood: 'wellness', food: 'nutrition' };
  const sub = map[r.sub] || r.sub;
  const fn = { movement: hMovement, workout: hWorkout, nutrition: hNutrition, meals: hMeals, sleep: hSleep, water: hWater, wellness: hWellness, mobility: hMobility, fasting: hFasting }[sub];
  if (fn) return fn(r);
  const t = TODAY(), order = healthOrder();
  const headRow = `<div class="row" style="align-items:flex-end"><h1 class="title" style="flex:1">Health</h1><button class="chip ${ui.arrange ? 'on' : ''}" data-a="arrangeHealth">${ui.arrange ? 'Done' : '↕ Arrange'}</button></div><p class="hub-sub">Care for your body, mind and energy.</p>`;
  if (ui.arrange) {
    const hidden = Object.keys(HEALTH_MODS).filter(id => !order.includes(id));
    return `${WAVES}${appHead()}${headRow}<p class="small muted" style="margin:-8px 2px 12px">Use the arrows to reorder. Hide what you don’t use.</p>`
      + listCard(order.map((id, i) => `<div class="item"><span class="ni" style="width:40px;height:40px;border-radius:12px;background:var(--accent-soft);display:grid;place-items:center;color:var(--accent-strong);flex:none">${HEALTH_MODS[id][1]()}</span><div class="body"><div class="t">${HEALTH_MODS[id][0]}</div></div><button class="mv" data-a="hMove" data-i="${i}" data-v="-1" aria-label="Move up" ${i === 0 ? 'disabled' : ''}>${I.up}</button><button class="mv" data-a="hMove" data-i="${i}" data-v="1" aria-label="Move down" ${i === order.length - 1 ? 'disabled' : ''}>${I.down}</button><button class="mv" data-a="hHide" data-id="${id}" aria-label="Hide">${I.x}</button></div>`).join(''))
      + (hidden.length ? sectionT('Hidden') + listCard(hidden.map(id => `<div class="item"><div class="body"><div class="t" style="color:var(--muted)">${HEALTH_MODS[id][0]}</div></div><button class="chip" data-a="hShow" data-id="${id}">+ Show</button></div>`).join('')) : '');
  }
  return `${WAVES}${appHead()}${headRow}${hubTiles(order.map(id => ['health/' + id, HEALTH_MODS[id][0], HEALTH_MODS[id][1](), HEALTH_MODS[id][2](t)]))}
  <section class="card tint-accent"><div class="small" style="color:var(--ink2)">RESET is a gentle companion, not medical advice. Listen to your body and check in with a professional when something doesn’t feel right.</div></section>`;
};
Object.assign(A, {
  arrangeHealth() { ui.arrange = !ui.arrange; if (!S.profile.healthOrder) S.profile.healthOrder = healthOrder(); commit(); },
  hMove(el) { S.profile.healthOrder = moveIn(healthOrder(), +el.dataset.i, +el.dataset.v); commit(); },
  hHide(el) { S.profile.healthOrder = healthOrder().filter(x => x !== el.dataset.id); S.profile.healthHidden = [...new Set([...(S.profile.healthHidden || []), el.dataset.id])]; commit(); },
  hShow(el) { S.profile.healthHidden = (S.profile.healthHidden || []).filter(x => x !== el.dataset.id); S.profile.healthOrder = [...healthOrder().filter(x => x !== el.dataset.id), el.dataset.id]; commit(); },
});

/* ---------- home (customisable) ---------- */
const HOME_CARDS = { quote: 'Thought for today', today: 'Today’s progress', habits: 'Today’s habits', water: 'Hydration', tasks: 'Up next (tasks)', routine: 'Current routine', shortcuts: 'Breathe & Journal', fasting: 'Fasting timer', mood: 'Mood check-in', intention: 'Today’s intention' };
const DEFAULT_HOME = [['quote', 1], ['today', 1], ['habits', 1], ['water', 1], ['tasks', 1], ['routine', 1], ['shortcuts', 1], ['fasting', 0], ['mood', 0], ['intention', 0]];
function homeLayout() {
  const l = (S.profile.home || []).filter(([id]) => HOME_CARDS[id]).map(x => [...x]);
  DEFAULT_HOME.forEach(dft => { if (!l.some(x => x[0] === dft[0])) l.push([...dft]); });
  return l;
}
const HOME_RENDER = {
  quote: () => `<section class="card quote-card"><div class="eyebrow" style="margin-bottom:8px;color:var(--accent-strong)">Thought for today</div><div class="quote">“${esc(quoteFor(TODAY()))}”</div></section>`,
  today: () => {
    const t = TODAY(), hs = habitsFor(t), hd = hs.filter(h => isDone(h, t)).length, tt = tasksOn(t), td = tt.filter(x => x.done).length, pct = dayScore(t);
    return `<section class="card hero">${ring(pct, 116, 11, 'var(--accent)', `<div><b>${Math.round(pct * 100)}%</b><small>today</small></div>`)}
    <div class="hero-stats"><div class="hstat"><span class="dot" style="background:var(--accent)"></span>Habits<b>${hd}/${hs.length}</b></div><div class="hstat"><span class="dot" style="background:var(--mood)"></span>Tasks<b>${td}/${tt.length}</b></div>
    <div class="hstat"><span class="dot" style="background:var(--water)"></span>Water<b>${isLiters() ? fmtL(wml(t)) : glassesOf(wml(t)) + '/' + Math.round(waterGoalMl() / glassMl())}</b></div><div class="hstat"><span class="dot" style="background:var(--move)"></span>Move<b>${moveMins(t)}′</b></div></div></section>`;
  },
  habits: () => {
    const t = TODAY(), hs = habitsFor(t);
    return `<section class="card"><div class="card-head"><span class="eyebrow">Today’s habits</span><button class="link" data-a="plan" data-seg="habits">Manage</button></div>
    ${hs.length ? `<div class="habit-grid">${hs.map(h => { const on = isDone(h, t), s = streak(h); return `<button class="hchip ${on ? 'on' : ''}" style="--hc:${h.color}" data-a="habit" data-id="${h.id}" data-d="${t}"><span class="emo">${hIco(h)}</span><span><span class="t">${esc(h.title)}</span><span class="s">${s ? `🔥 ${s} day${s > 1 ? 's' : ''}` : on ? 'Done ✓' : 'Not yet'}</span></span></button>`; }).join('')}</div>`
      : emptyState('🌱', `No habits for today.<br><button class="link" data-a="newHabit">Create your first habit</button>`)}</section>`;
  },
  water: () => waterCardHTML(),
  tasks: () => {
    const t = TODAY();
    const due = S.tasks.filter(x => !x.done && x.date && x.date <= t).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const list = [...due, ...S.tasks.filter(x => !x.done && !x.date).slice(0, 3), ...tasksOn(t).filter(x => x.done)].slice(0, 6);
    return `<section class="card"><div class="card-head"><span class="eyebrow">Up next</span><button class="link" data-a="newTask">+ Add</button></div>${list.length ? `<ul class="list">${list.map(taskItem).join('')}</ul>` : emptyState('☕', 'Nothing planned. Enjoy the space — or add a task.')}</section>`;
  },
  routine: () => {
    const t = TODAY(), rk = currentRoutine(), rs = S.routines[rk], rdn = routineDone(rk, t).filter(id => rs.some(s => s.id === id)).length, mins = sum(rs.map(s => +s.mins || 0));
    return `<section class="card"><button class="feature" data-a="plan" data-seg="routines" data-r="${rk}"><span class="ic" style="background:var(--accent-soft);font-size:24px">${ROUTINE_META[rk][0]}</span><span class="body"><span class="h3">${ROUTINE_META[rk][1]} routine</span><br><span class="small muted">${rdn} of ${rs.length} steps · ${mins} min</span></span>${ring(rs.length ? rdn / rs.length : 0, 44, 5)}</button>
    ${rs.length && rdn < rs.length ? `<button class="btn soft" style="margin-top:14px" data-a="runRoutine" data-r="${rk}">${I.play} Start ${ROUTINE_META[rk][1].toLowerCase()} routine</button>` : ''}</section>`;
  },
  shortcuts: () => {
    const je = S.journal.find(j => j.date === TODAY());
    return `<div class="grid2"><button class="tile t-accent" data-a="breathe"><span class="ic">${I.wind}</span><span class="lbl">Breathe</span><span class="val">1 min <small>calm</small></span></button>
    <button class="tile t-mind" data-a="go" data-to="growth/write${je ? '/' + je.id : ''}"><span class="ic">${I.pen}</span><span class="lbl">Journal</span><span class="val" style="font-size:17px;line-height:1.25">${je ? 'Keep writing' : 'Today’s prompt'}</span></button></div>`;
  },
  fasting: () => {
    const f = activeFast();
    if (f) return `<section class="card"><div class="row" style="gap:16px">${fastRingHTML(f, 92).replace('ELAPSED', '')}<div class="body" style="flex:1"><div class="eyebrow">Fasting · ${f.plan}</div><div class="small muted" style="margin:4px 0 10px">${fastStage(fastHours(f))[0]} ${fastStage(fastHours(f))[1]}</div><div class="row" style="gap:8px"><button class="btn soft sm" data-a="go" data-to="health/fasting">Details</button><button class="btn sm" data-a="fastEnd">End</button></div></div></div></section>`;
    return `<section class="card"><div class="row"><span class="ic" style="width:46px;height:46px;border-radius:15px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent-strong)">${I.timer}</span><div class="body" style="flex:1"><div class="h3">Fasting</div><div class="small muted">Plan ${S.profile.fastPlan || '16:8'}</div></div><button class="btn sm" data-a="fastStart">${I.play} Start</button></div></section>`;
  },
  mood: () => { const m = S.mood[TODAY()]?.mood; return `<section class="card tint-mood"><div class="card-head"><span class="eyebrow">How are you feeling?</span>${m ? `<span class="small muted">${MOODS[m - 1].t}</span>` : ''}</div><div class="moods">${MOODS.map(x => `<button class="moodbtn ${m === x.v ? 'on' : ''}" data-a="mood" data-v="${x.v}" aria-label="${x.t}">${x.e}</button>`).join('')}</div></section>`; },
  intention: () => `<section class="card tint-accent"><div class="eyebrow" style="margin-bottom:4px">Today’s intention</div><input class="inline-input" style="font-family:var(--serif);font-size:20px;width:100%;border-color:rgba(0,0,0,.08)" placeholder="Today I choose to…" value="${esc(S.intention[TODAY()] || '')}" data-save="intention"></section>`,
};
function homeEdit() {
  const l = homeLayout();
  return `${back('home', 'Home')}${head('', 'Customize Home', 'Choose what you see and in which order.')}`
    + listCard(l.map(([id, on], i) => `<div class="item"><button class="switch ${on ? 'on' : ''}" data-a="hcToggle" data-i="${i}" role="switch" aria-checked="${on ? 'true' : 'false'}" aria-label="${HOME_CARDS[id]}"></button><div class="body"><div class="t" style="${on ? '' : 'color:var(--muted)'}">${HOME_CARDS[id]}</div></div><button class="mv" data-a="hcMove" data-i="${i}" data-v="-1" aria-label="Move up" ${i === 0 ? 'disabled' : ''}>${I.up}</button><button class="mv" data-a="hcMove" data-i="${i}" data-v="1" aria-label="Move down" ${i === l.length - 1 ? 'disabled' : ''}>${I.down}</button></div>`).join(''))
    + `<button class="btn ghost" data-a="hcReset">Reset to default</button>`;
}
Object.assign(A, {
  hcToggle(el) { const l = homeLayout(); l[+el.dataset.i][1] = l[+el.dataset.i][1] ? 0 : 1; S.profile.home = l; commit(); },
  hcMove(el) { S.profile.home = moveIn(homeLayout(), +el.dataset.i, +el.dataset.v); commit(); },
  hcReset() { S.profile.home = null; commit(); toast('Home reset'); },
});

/* ---------- medals (bronze 1 month · silver 3 · gold 6) ---------- */
const MEDAL_TIERS = [[30, '🥉', 'Bronze', '1 month'], [90, '🥈', 'Silver', '3 months'], [180, '🥇', 'Gold', '6 months']];
function medalCats() {
  const uniq = a => new Set(a).size;
  const keys = (o, fn) => Object.keys(o).filter(k => fn(o[k], k)).length;
  return [
    ['habits', '🌱', 'Habits', keys(S.habitLog, v => v.length > 0)],
    ['water', '💧', 'Hydration', keys(S.waterMl, v => v >= waterGoalMl())],
    ['move', '🏃', 'Movement', uniq(S.moves.map(m => m.date).filter(d => moveMins(d) >= S.profile.moveGoal))],
    ['workout', '💪', 'Workouts', uniq(S.workoutLog.map(l => l.date))],
    ['mobility', '🤸', 'Mobility', uniq(S.mobilityLog.map(l => l.date))],
    ['sleep', '🌙', 'Sleep log', Object.keys(S.sleep).length],
    ['mindful', '🫧', 'Mindfulness', uniq([...Object.keys(S.breaths).filter(k => S.breaths[k] > 0), ...S.practiceLog.map(p => p.date)])],
    ['journal', '✍️', 'Journaling', uniq(S.journal.map(j => j.date))],
    ['gratitude', '🙏', 'Gratitude', keys(S.gratitude, v => v.filter(x => (x || '').trim()).length >= 3)],
    ['checkin', '🙂', 'Check-ins', keys(S.mood, v => v.mood > 0)],
    ['nutrition', '🍎', 'Food diary', Object.keys(S.food).filter(k => foodItems(k).length).length],
    ['fasting', '⏳', 'Fasting', uniq(S.fasts.filter(f => f.end && fastHours(f) >= f.goalH).map(f => dk(new Date(f.end))))],
    ['reading', '📚', 'Reading', uniq(S.readLog.map(l => l.date))],
    ['planning', '✅', 'Planning', uniq(S.tasks.filter(x => x.done && x.doneAt).map(x => x.doneAt))],
  ];
}
function medalsHTML() {
  const cats = medalCats();
  const earned = cats.reduce((n, c) => n + MEDAL_TIERS.filter(t => c[3] >= t[0]).length, 0);
  return `<div class="section-title"><span class="h2">Medals</span><span class="small muted">${earned}/${cats.length * 3}</span></div>
  <p class="small muted" style="margin:-4px 2px 12px">Practise on 30 days for bronze, 90 for silver and 180 for gold.</p>
  <div class="medals">${cats.map(([id, e, l, n]) => {
    const got = MEDAL_TIERS.filter(t => n >= t[0]), cur = got[got.length - 1], next = MEDAL_TIERS.find(t => n < t[0]);
    const prev = cur ? cur[0] : 0;
    return `<div class="medal ${cur ? 'got-' + cur[2].toLowerCase() : ''}"><div class="row" style="gap:8px"><span style="font-size:22px">${e}</span><b style="flex:1;font-size:14px">${l}</b><span class="mtier">${cur ? cur[1] : '<span style="opacity:.3">🥉</span>'}</span></div>
    ${next ? `<div class="bar" style="margin-top:10px"><i style="width:${clamp((n - prev) / (next[0] - prev), 0, 1) * 100}%"></i></div><div class="small muted" style="margin-top:6px">${n}/${next[0]} days · ${next[2]}</div>` : `<div class="small" style="margin-top:10px;font-weight:700;color:var(--gold)">All medals earned ✨</div>`}</div>`;
  }).join('')}</div>`;
}

/* ---------- body profile, measurements & calorie estimate ---------- */
const BODY_FIELDS = [['weight', 'Weight', 'kg'], ['waist', 'Waist', 'cm'], ['hips', 'Hips', 'cm'], ['chest', 'Chest', 'cm'], ['arm', 'Arm', 'cm'], ['thigh', 'Thigh', 'cm']];
const bodySorted = () => [...S.bodyLog].sort((a, b) => a.date.localeCompare(b.date));
const bodyLatest = k => { const e = bodySorted().reverse().find(x => +x[k] > 0); return e ? +e[k] : null; };
const bodyFirst = k => { const e = bodySorted().find(x => +x[k] > 0); return e ? +e[k] : null; };
const ageNow = () => S.body.birthYear ? new Date().getFullYear() - +S.body.birthYear : null;
const ACTIVITY = [['sedentary', 'Mostly sitting', 1.2], ['light', 'Lightly active', 1.375], ['moderate', 'Active', 1.55], ['active', 'Very active', 1.725]];
const BODY_GOALS = [['lose', 'Lose gently', -300], ['maintain', 'Maintain', 0], ['gain', 'Gain', 250]];
function calorieEstimate() {
  const w = bodyLatest('weight'), hgt = +S.body.heightCm, a = ageNow(), sex = S.body.sex;
  if (!w || !hgt || !a || !sex) return null;
  const bmr = 10 * w + 6.25 * hgt - 5 * a + (sex === 'male' ? 5 : -161);
  const tdee = bmr * (ACTIVITY.find(x => x[0] === (S.body.activity || 'light')) || ACTIVITY[1])[2];
  const kcal = Math.round((tdee + (BODY_GOALS.find(x => x[0] === (S.body.goal || 'maintain')) || BODY_GOALS[1])[2]) / 10) * 10;
  const protein = Math.round(w * 1.4), fat = Math.round(kcal * 0.28 / 9), carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, protein, fat, carbs };
}
function bodyProfileSheet() {
  itemSheet({
    title: 'Body profile', item: { ...S.body },
    fields: [
      { k: 'sex', l: 'Sex (used for the calorie formula)', t: 'pick', opts: [['female', 'Female'], ['male', 'Male']] },
      { k: 'birthYear', l: 'Year of birth', t: 'number', ph: 'e.g. 1986' },
      { k: 'heightCm', l: 'Height (cm)', t: 'number', ph: 'e.g. 165' },
      { k: 'activity', l: 'Daily activity', t: 'pick', opts: ACTIVITY.map(a => [a[0], a[1]]) },
      { k: 'goal', l: 'Goal', t: 'pick', opts: BODY_GOALS.map(g => [g[0], g[1]]) },
    ],
    saveLabel: 'Save', onSave: o => { S.body = { ...S.body, ...o, birthYear: o.birthYear || '', heightCm: o.heightCm || '' }; },
  });
}
function bodyLogSheet(id) {
  const x = id ? S.bodyLog.find(e => e.id === id) : null;
  itemSheet({
    title: x ? 'Edit measurements' : 'New measurements', item: x || { date: TODAY() },
    fields: [{ k: 'date', l: 'Date', t: 'date' }, ...BODY_FIELDS.map(([k, l, u]) => ({ k, l: `${l} (${u})`, t: 'number', ph: 'optional' }))],
    onSave: o => { if (!o.date) o.date = TODAY(); if (x) Object.assign(x, o); else S.bodyLog.push({ id: uid(), ...o }); },
    onDel: () => { S.bodyLog = S.bodyLog.filter(e => e !== x); },
  });
}
function pBody() {
  const [h, tab] = modHead('body', 'Body & measurements', 'profile', [['overview', 'Overview'], ['log', 'Log'], ['calories', 'Calories']]);
  const w = bodyLatest('weight'), w0 = bodyFirst('weight'), a = ageNow();
  if (tab === 'overview') {
    const series = bodySorted().filter(e => +e.weight > 0).slice(-14);
    const ws = series.map(e => +e.weight), lo = ws.length ? Math.floor(Math.min(...ws) - 1) : 0, hi = ws.length ? Math.ceil(Math.max(...ws) + 1) : 1;
    const diff = (k) => { const l = bodyLatest(k), f = bodyFirst(k); if (l == null || f == null || S.bodyLog.filter(e => +e[k] > 0).length < 2) return '—'; const d = Math.round((l - f) * 10) / 10; return `${d > 0 ? '+' : ''}${d}`; };
    return h + `<div class="grid2"><div class="card stat" style="margin:0"><div class="v">${w ?? '—'}<small> kg</small></div><div class="k">Weight${w0 != null && w != null && series.length > 1 ? ` · ${diff('weight')} kg since start` : ''}</div></div>
      <div class="card stat" style="margin:0"><div class="v">${a ?? '—'}</div><div class="k">Age</div></div><div class="card stat" style="margin:0"><div class="v">${S.body.heightCm || '—'}<small> cm</small></div><div class="k">Height</div></div>
      <div class="card stat" style="margin:0"><div class="v" style="font-size:20px">${(ACTIVITY.find(x => x[0] === S.body.activity) || ACTIVITY[1])[1]}</div><div class="k">Activity</div></div></div>
      <button class="btn soft" data-a="bodyProfile">${I.edit} Edit body profile</button><div style="height:14px"></div>
      ${ws.length > 1 ? `<section class="card"><div class="card-head"><span class="eyebrow">Weight trend</span><span class="small muted">kg</span></div>${line(ws, series.map(e => String(pd(e.date).getDate())), { color: 'var(--accent)', min: lo, max: hi })}</section>` : ''}
      <section class="card"><div class="card-head"><span class="eyebrow">Measurements</span><span class="small muted">latest · change</span></div>
      ${BODY_FIELDS.map(([k, l, u]) => `<div class="kv"><span class="k">${l}</span><b>${bodyLatest(k) ?? '—'}${bodyLatest(k) != null ? ' ' + u : ''}</b><span class="small muted" style="width:60px;text-align:right">${diff(k)}</span></div>`).join('')}</section>
      <button class="btn" data-a="bodyLog">${I.plus} Add measurements</button>`;
  }
  if (tab === 'log') {
    const list = bodySorted().reverse();
    return h + `<button class="btn" data-a="bodyLog">${I.plus} Add measurements</button><div style="height:14px"></div>`
      + (list.length ? listCard(list.map(e => `<button class="foodrow" data-a="bodyLog" data-id="${e.id}"><span style="flex:1"><b>${relDay(e.date)}</b><br><span class="small muted">${BODY_FIELDS.filter(([k]) => +e[k] > 0).map(([k, l, u]) => `${l} ${e[k]} ${u}`).join(' · ') || 'No values'}</span></span><span class="chev">${I.right}</span></button>`).join('')) : `<section class="card">${emptyState('📏', 'Log your weight and measurements to see your progress over time.')}</section>`);
  }
  const est = calorieEstimate();
  if (!est) return h + `<section class="card">${emptyState('🍽️', 'Add your sex, year of birth, height and a weight entry to get a daily calorie estimate for your Nutrition targets.')}<button class="btn soft" data-a="bodyProfile">Complete body profile</button><button class="btn ghost" style="margin-top:8px" data-a="bodyLog">Add weight</button></section>`;
  return h + `<section class="card"><div class="eyebrow">Suggested daily calories</div><div class="bigstat" style="margin:8px 0 4px">${est.kcal}<small> kcal</small></div><div class="small muted">${(BODY_GOALS.find(x => x[0] === (S.body.goal || 'maintain')) || BODY_GOALS[1])[1]} · ${(ACTIVITY.find(x => x[0] === (S.body.activity || 'light')) || ACTIVITY[1])[1].toLowerCase()}</div>
    <div style="margin-top:14px">${kvRow('Protein', est.protein + ' g')}${kvRow('Carbs', est.carbs + ' g')}${kvRow('Fat', est.fat + ' g')}${kvRow('Resting energy (BMR)', est.bmr + ' kcal')}${kvRow('Maintenance', est.tdee + ' kcal')}</div></section>
    <button class="btn" data-a="applyCalories">Use these targets in Nutrition</button>
    <p class="small muted" style="margin-top:12px">Estimated with the Mifflin–St Jeor formula. It’s a starting point, not medical advice — adjust it to how you feel, or ask a dietitian.</p>`;
}
Object.assign(A, {
  bodyProfile() { bodyProfileSheet(); },
  bodyLog(el) { bodyLogSheet(el.dataset.id); },
  applyCalories() { const e = calorieEstimate(); if (!e) return; Object.assign(S.profile, { kcalGoal: e.kcal, proteinGoal: e.protein, carbGoal: e.carbs, fatGoal: e.fat }); commit(); toast('Nutrition targets updated ✓'); },
});

/* ---------- Apple Health bridge (via the Shortcuts app) ---------- */
function parseHealth(txt) {
  const out = {};
  String(txt || '').split(/[;\n]+/).forEach(part => {
    const m = part.match(/^\s*([a-zA-Z]+)\s*[=:]\s*(.+)$/); if (!m) return;
    let raw = m[2].trim();
    if (/^\d{1,3}(,\d{3})+(\.\d+)?/.test(raw)) raw = raw.replace(/,/g, ''); else raw = raw.replace(',', '.');
    const n = parseFloat(raw.replace(/[^\d.\-]/g, ' ').trim().split(/\s+/)[0]);
    const key = m[1].toLowerCase();
    if (['steps', 'exercise', 'mindful'].includes(key)) { const d = m[2].replace(/\.\d{1,2}(?!\d)/, '').replace(/[^\d]/g, ''); if (d) out[key] = parseInt(d, 10); return; }
    if (key === 'date') out.date = m[2].trim().slice(0, 10);
    else if (!isNaN(n)) out[key] = n;
  });
  if (!Object.keys(out).length) { const only = String(txt || '').trim(); if (/^[\d.,\s\u00a0\u202f]+$/.test(only)) { const n = parseInt(only.replace(/[^\d]/g, ''), 10); if (n) out.raw = n; } }
  return out;
}
function applyHealth(d) {
  if (d.raw != null && d.steps == null) d.steps = d.raw;
  const k = /^\d{4}-\d{2}-\d{2}$/.test(d.date || '') ? d.date : TODAY(), done = [];
  if (d.steps != null) { S.steps[k] = Math.round(d.steps); done.push(`${S.steps[k].toLocaleString('en-GB')} steps`); }
  if (d.exercise != null && d.exercise > 0) { S.moves = S.moves.filter(m => m.id !== 'ah-' + k); S.moves.push({ id: 'ah-' + k, date: k, type: 'other', mins: Math.round(d.exercise), label: 'Apple Health exercise' }); done.push(`${Math.round(d.exercise)} active min`); }
  if (d.water != null && d.water > 0) { const ml = d.water < 20 ? d.water * 1000 : d.water; S.waterMl[k] = Math.max(wml(k), Math.round(ml)); done.push(fmtL(S.waterMl[k]) + ' water'); }
  if (d.weight != null && d.weight > 0) { const e = S.bodyLog.find(x => x.date === k); if (e) e.weight = Math.round(d.weight * 10) / 10; else S.bodyLog.push({ id: uid(), date: k, weight: Math.round(d.weight * 10) / 10 }); done.push(`${Math.round(d.weight * 10) / 10} kg`); }
  if (d.sleep != null && d.sleep > 0) { const hrs = d.sleep > 24 ? d.sleep / 60 : d.sleep; S.sleep[k] = { bed: S.sleep[k]?.bed || '—', wake: S.sleep[k]?.wake || '—', hours: Math.round(hrs * 4) / 4, q: S.sleep[k]?.q || 3 }; done.push(hours(S.sleep[k].hours) + ' sleep'); }
  if (d.mindful != null && d.mindful > 0) { S.practiceLog = S.practiceLog.filter(p => p.id !== 'ah-m-' + k); S.practiceLog.push({ id: 'ah-m-' + k, date: k, type: 'mindfulness', mins: Math.round(d.mindful) }); done.push(`${Math.round(d.mindful)} mindful min`); }
  if (!done.length) { toast('Nothing to import — check the format'); return; }
  S.healthSync = { last: new Date().toISOString(), what: done.join(' · ') };
  commit(); toast('Imported: ' + done.join(' · '));
}
function pHealthSync() {
  const [h] = modHead('hs', 'Apple Health', 'profile');
  const steps = [
    'Open the <b>Shortcuts</b> app and tap <b>+</b>. Name the shortcut <b>RESET Sync</b>.',
    'Add <b>Find Health Samples</b>: Type <b>Steps</b>, Start Date <b>is today</b>. Then add <b>Calculate Statistics</b> → <b>Sum</b>. Then <b>Set Variable</b> → name it <b>steps</b>.',
    'Repeat for <b>Exercise Minutes</b> (variable <b>exercise</b>) and <b>Water</b> (variable <b>water</b>).',
    'For weight: <b>Find Health Samples</b> → Type <b>Weight</b>, sort by <b>Start Date</b>, <b>Latest First</b>, limit <b>1</b>. Then <b>Set Variable</b> → <b>weight</b>.',
    'Add a <b>Text</b> action and type: <code>steps=</code>[steps]<code>; exercise=</code>[exercise]<code>; water=</code>[water]<code>; weight=</code>[weight] — tap each [name] to insert its variable.',
    'Add <b>Copy to Clipboard</b>, then <b>Show Notification</b> with the text “Copied — open RESET”.',
    'Optional, fully automatic: in Shortcuts open <b>Automation</b> → <b>+</b> → <b>Time of Day</b> (e.g. 21:00, Daily) → choose <b>Run Immediately</b> → action <b>Run Shortcut</b> → <b>RESET Sync</b>. Each evening your data is copied for you — RESET shows a <b>Sync Apple Health</b> button on Home: one tap and it’s in.',
    'Run it once and tap <b>Allow</b> when it asks for Health access. Add it to your Home Screen, or use <b>Back Tap</b> (Settings → Accessibility → Touch).',
  ];
  return h + `<section class="card tint-accent"><div class="h3" style="margin-bottom:6px">Bring your Apple Health data into RESET</div><p class="small" style="margin:0;color:var(--ink2)">Web apps can’t read Apple Health directly — only App Store apps can. This bridge uses Apple’s free <b>Shortcuts</b> app: it copies today’s numbers, then you paste them here with one tap.</p></section>
  <button class="btn" data-a="hsPaste">${I.heartPulse} Paste from Apple Health</button>
  <textarea class="input" id="hs-text" style="margin-top:10px" placeholder="Or paste here, e.g.  steps=8432; exercise=35; water=1.6; weight=68.2; sleep=7.5"></textarea>
  <button class="btn soft" style="margin-top:8px" data-a="hsApply">Import</button>
  ${S.healthSync?.last ? `<p class="small muted" style="margin-top:10px">Last import: ${fmtWhen(S.healthSync.last)} — ${esc(S.healthSync.what)}</p>` : ''}
  ${sectionT('Set up the shortcut (once)')}
  <section class="card"><ol class="steps">${steps.map(s => `<li>${s}</li>`).join('')}</ol>
  <p class="small muted" style="margin-bottom:0">Optional extras RESET understands: <code>sleep=</code> (hours), <code>mindful=</code> (minutes), <code>date=</code>YYYY-MM-DD. Data flows one way: Apple Health → RESET.</p></section>`;
}
Object.assign(A, {
  async hsPaste() {
    try { const t = await navigator.clipboard.readText(); if (!t || !t.trim()) throw new Error('empty'); applyHealth(parseHealth(t)); }
    catch (e) {
      openSheet('Paste your Health data', `<p class="small muted" style="margin-top:-4px">1. Run <b>RESET Sync</b> in Shortcuts.<br>2. Come back, <b>press and hold</b> in the box below and tap <b>Paste</b>.<br>3. Tap <b>Import</b>.</p><textarea class="input" id="hs-text2" rows="3" placeholder="Steps=6540"></textarea><button class="btn" style="margin-top:10px" data-a="save">Import</button><button class="link" style="margin-top:12px" data-a="guide">How do I set up the shortcut?</button>`, {
        save() { const t = val('#hs-text2'); if (!t.trim()) return shake('#hs-text2'); closeSheet(); applyHealth(parseHealth(t)); },
        guide() { closeSheet(); go('profile/health'); },
      });
    }
  },
  hsApply() { const t = val('#hs-text'); if (!t.trim()) return shake('#hs-text'); applyHealth(parseHealth(t)); },
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
  const ch = e.target.dataset?.change; if (ch && CHANGERS[ch]) { CHANGERS[ch](e.target); return; }
  if (e.target.id === 'habitImg') {
    const file = e.target.files?.[0]; if (!file) return;
    const setI = url => { form.img = url; const pv = $('#habitImgPrev'); if (pv) pv.innerHTML = `<img class="habit-prev" src="${url}" alt=""> <button class="link" data-a="habitImgClear">Remove</button>`; };
    if (file.type === 'image/gif') { if (file.size > 600000) { toast('That GIF is too big — try one under 600 KB'); e.target.value = ''; return; } const fr = new FileReader(); fr.onload = () => setI(fr.result); fr.readAsDataURL(file); e.target.value = ''; return; }
    resizeImage(file, 128, url => { form.img = url; const pv = $('#habitImgPrev'); if (pv) pv.innerHTML = `<img class="habit-prev" src="${url}" alt=""> <button class="link" data-a="habitImgClear">Remove</button>`; });
    e.target.value = ''; return;
  }
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


/* =========================================================
   v8 — PROGRAM, VIDEOS, COUNTER HABITS, SMART PROGRESS, KITCHEN
   ========================================================= */
const V8 = true;
/* ---------- 4-week program (repeats forever) ---------- */
const PROG = {"A": ["Squats", "Incline Push-Ups", "Upper Back Row (B)", "Bridges", "Shoulder Front Raise (B)", "Bicep Curls (B)", "Triceps Extension (B)", "Plank", "Rear Lunges", "Chest Press (B)", "Superman", "Clamshell (B)", "Upright Raises (B)", "Hammer Grip Curls (B)", "Tricep Pulls (B)", "Bird Dog"], "B": ["Squats (B)", "Push-Ups", "Seated Row (B)", "Glute Bridge (B)", "Squat & Press (B)", "Concentration Curl (B)", "Triceps Kickback (B)", "Crunches", "Lunges", "Chest Fly (B)", "Swimmer", "Hamstring Kickback", "Reverse Fly (B)", "Wide Curl (B)", "Skull Crusher (B)", "Side Plank"], "C": ["Side Lunges (B)", "Wide Arm Push-Ups", "Overhead Pulldown (B)", "Bridge Marching", "Y Raise", "Reverse Curl (B)", "Triceps Pushdown (B)", "Bicycle Crunches", "Wall Sit", "Chest Crossover (B)", "Air Row", "Backward Glute Raises (B)", "Standing Crawl Stroke", "Single Arm Curl (B)", "Narrow Push-Ups", "Shoulder Tap Plank"], "D": ["Resisted Lunge (B)", "Shoulder Tap Push-Ups", "Pull-Aparts (B)", "Bridge Kick", "T Raise", "Drag Curl (B)", "Close-Grip Press (B)", "Leg Lifts", "Bulgarian Squat", "Chest Fly (B)", "Archer (B)", "Back Plank & Kick", "Walking Plank", "21s Curl (B)", "Single Arm Overhead Extension (B)", "Russian Twist"], "E": ["Bulgarian Squat", "Decline Push-Ups", "Upper Back Row (B)", "Bridge Kicker", "Squat & Press (B)", "High Curl (B)", "Diamond Push-Ups", "Plank Jacks", "Side Lunge March", "Chest Press (B)", "Superman", "Glute Bridge (B)", "Reverse Fly (B)", "Hammer Grip Curls (B)", "Triceps Extension (B)", "Twisted Mountain Climber"], "F": ["Overhead Squat (B)", "Hindu Push-Ups", "Seated Row (B)", "Bridge Marching", "Shoulder Push-Ups", "Bicep Side Pull (B)", "Tricep Pikes", "Sit-Ups", "Rear Lunges", "Chest Fly (B)", "V Sit Rowing", "Backward Glute Raises (B)", "Upright Raises (B)", "21s Curl (B)", "Skull Crusher (B)", "Mountain Climbers"], "G": ["Squat & Reach", "Wide Arm Push-Ups", "Overhead Pulldown (B)", "Hamstring Kickback", "Y Raise", "Concentration Curl (B)", "Triceps Pushdown (B)", "Elevated Crunches", "Lunges", "Chest Crossover (B)", "Swimmer", "Clamshell (B)", "Walking Plank", "Drag Curl (B)", "Triceps Kickback (B)", "Side Plank"], "H": ["Toe Touch Squat", "Single Leg Push-Ups", "Archer (B)", "Bridges", "T Raise", "Wide Curl (B)", "Close-Grip Press (B)", "Heel Touches", "Wall Sit", "Shoulder Tap Push-Ups", "Pull-Aparts (B)", "Bridge Kick", "Shoulder Front Raise (B)", "Reverse Curl (B)", "Narrow Push-Ups", "Bird Dog"], "S1": ["Table Pose", "Threading the Needle", "Swan Pose", "Lazy Pigeon", "Hip Flexor Stretch", "Warrior II", "Triangle Pose", "Side Angle Extension", "Forward Fold", "Supine Hamstring Stretch", "Reclined Cobbler's Pose", "Fish Pose"], "S2": ["Neck Looking Around", "Side Neck Stretch", "Shoulder Opener", "Standing Chest Stretch", "Tricep Stretch", "Upper Back Stretch", "Chair Pose Twist", "Calf & Ham Stretch", "Hurdler Stretch", "Lying Glute Stretch", "Seated Forward Bend", "Wide Leg Bend"], "WU": ["Forward Arm Circles", "Backward Shoulder Circles", "Hip Circles", "Step Touch", "Standing Torso Twist", "Butt Kicks"]};
const PROG_NAME = { A: 'Full Body A', B: 'Full Body B', C: 'Full Body C', D: 'Full Body D', E: 'Full Body E', F: 'Full Body F', G: 'Full Body G', H: 'Full Body H', S1: 'Yoga Flow', S2: 'Full-Body Stretch', R: 'Rest day' };
const PROG_WORK = [30, 40, 40, 45], PROG_REST = [30, 20, 20, 15];
const mondayOf = k => addD(k, -((dow(k) + 6) % 7));
function progInfo(k = TODAY()) {
  if (!S.profile.progStart) S.profile.progStart = mondayOf(TODAY());
  const days = dayNum(k) - dayNum(S.profile.progStart);
  const wk = Math.floor(days / 7), w = ((wk % 4) + 4) % 4, round = Math.floor(Math.max(0, wk) / 4) + 1;
  const set = w < 2 ? ['A', 'B', 'C', 'D'] : ['E', 'F', 'G', 'H'];
  const code = { 1: set[0], 2: set[1], 3: w % 2 ? 'S2' : 'S1', 4: set[2], 5: set[3], 6: 'R', 0: 'R' }[dow(k)];
  const kind = code === 'R' ? 'rest' : code[0] === 'S' ? 'stretch' : 'full';
  return { week: w + 1, round, code, kind, name: PROG_NAME[code], work: PROG_WORK[w], rest: PROG_REST[w] };
}
const progRounds = () => +S.profile.progRounds || 1;
function progMins(p) {
  if (p.kind === 'rest') return 0;
  if (p.kind === 'stretch') return Math.round(PROG[p.code].length * 45 / 60);
  return Math.round((PROG.WU.length * 30 + PROG[p.code].length * progRounds() * (p.work + p.rest)) / 60);
}
const progDone = k => S.workoutLog.some(l => l.date === k && l.prog) || S.mobilityLog.some(l => l.date === k && l.prog);
const isBand = n => /\(B\)/.test(n);
const exLabel = n => n.replace(/\s*\(B\)/, '');

/* ---------- exercise videos: stored only on this device (IndexedDB) ---------- */
const VDB = { db: null, urls: {}, keys: null };
const vNorm = n => String(n).toLowerCase().replace(/^.*\//, '').replace(/\.(mp4|mov|m4v|webm|gif)$/i, '').replace(/^resistance band\s+/, '').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
const exKey = n => (isBand(n) ? 'bd:' : 'bw:') + vNorm(exLabel(n));
function vdb() {
  if (VDB.db) return Promise.resolve(VDB.db);
  return new Promise((res, rej) => { try { const r = indexedDB.open('reset-media', 1); r.onupgradeneeded = () => r.result.createObjectStore('vids'); r.onsuccess = () => { VDB.db = r.result; res(r.result); }; r.onerror = () => rej(r.error); } catch (e) { rej(e); } });
}
async function vKeys() {
  if (VDB.keys) return VDB.keys;
  try { const db = await vdb(); return await new Promise(res => { const q = db.transaction('vids').objectStore('vids').getAllKeys(); q.onsuccess = () => { VDB.keys = new Set(q.result); res(VDB.keys); }; q.onerror = () => res(new Set()); }); }
  catch (e) { return new Set(); }
}
async function vResolve(key) {
  const ks = await vKeys(); if (ks.has(key)) return key;
  const alt = (key.startsWith('bd:') ? 'bw:' : 'bd:') + key.slice(3); return ks.has(alt) ? alt : null;
}
async function vGet(key) {
  const k = await vResolve(key); if (!k) return null;
  if (VDB.urls[k]) return VDB.urls[k];
  const db = await vdb();
  return new Promise(res => { const q = db.transaction('vids').objectStore('vids').get(k); q.onsuccess = () => { const v = q.result; if (!v) return res(null); const u = { url: URL.createObjectURL(v.blob), type: v.type }; VDB.urls[k] = u; res(u); }; q.onerror = () => res(null); });
}
async function vPut(items) {
  const db = await vdb();
  await new Promise((res, rej) => { const tx = db.transaction('vids', 'readwrite'), st = tx.objectStore('vids'); items.forEach(([k, blob, type]) => st.put({ blob, type }, k)); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  VDB.keys = null;
}
async function vClear() { const db = await vdb(); await new Promise(res => { const tx = db.transaction('vids', 'readwrite'); tx.objectStore('vids').clear(); tx.oncomplete = res; tx.onerror = res; }); Object.values(VDB.urls).forEach(u => URL.revokeObjectURL(u.url)); VDB.urls = {}; VDB.keys = null; }
const mediaHTML = (u, cls, live) => u.type === 'image/gif' ? `<img class="${cls}" src="${u.url}" alt="">` : live ? `<video class="${cls}" src="${u.url}" autoplay muted loop playsinline></video>` : `<video class="${cls}" src="${u.url}#t=0.4" muted playsinline preload="metadata"></video>`;
async function hydrateVid(el) {
  if (el.dataset.done) return; el.dataset.done = '1';
  const u = await vGet(el.dataset.vk);
  if (!u) { el.classList.add('novid'); el.innerHTML = `<span>${el.dataset.ph || '🎬'}</span>`; return; }
  el.innerHTML = mediaHTML(u, 'vmedia', el.dataset.live === '1');
  const v = el.querySelector('video'); if (v && el.dataset.live === '1') v.play?.().catch(() => { });
}
new MutationObserver(() => { $$('[data-vk]:not([data-done])').forEach(hydrateVid); $$('[data-rkart]:not([data-done])').forEach(hydrateRecipeArt); }).observe(document.body, { childList: true, subtree: true });
const vbox = (n, cls = 'vthumb', live = 0) => `<div class="${cls}" data-vk="${esc(exKey(n))}" data-live="${live}" data-ph="${isBand(n) ? '➰' : '🧍'}"></div>`;
let zipState = 0;
function loadZip() {
  if (window.JSZip) return Promise.resolve();
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'jszip.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
}
const VTYPES = { mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', gif: 'image/gif' };
const keyForPath = p => { const band = /band/i.test(p); return (band ? 'bd:' : 'bw:') + vNorm(p); };
async function importVideoFiles(files) {
  const prog = openSheet('Importing videos', `<div class="small muted" id="imp-msg">Preparing…</div><div style="margin-top:12px">${pbar(0)}</div><p class="small muted" style="margin-top:14px">Keep RESET open until it finishes. Videos are saved only on this device.</p>`, {});
  const msg = t => { const m = $('#imp-msg'); if (m) m.textContent = t; }, bar = p => { const b = $('.sheet .bar i'); if (b) b.style.width = Math.round(p * 100) + '%'; };
  let n = 0, batch = [];
  const flush = async () => { if (batch.length) { await vPut(batch); batch = []; } };
  try {
    for (const f of files) {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      if (ext === 'zip') {
        msg('Opening ' + f.name + '…'); await loadZip();
        const z = await JSZip.loadAsync(f);
        const ents = Object.values(z.files).filter(e => !e.dir && !/__MACOSX|\/\._|^\._/.test(e.name) && VTYPES[(e.name.split('.').pop() || '').toLowerCase()]);
        for (let i = 0; i < ents.length; i++) {
          const e = ents[i], ex = e.name.split('.').pop().toLowerCase();
          const blob = await e.async('blob');
          batch.push([keyForPath(e.name), new Blob([blob], { type: VTYPES[ex] }), VTYPES[ex]]); n++;
          if (batch.length >= 15) await flush();
          msg(`Saving ${i + 1} of ${ents.length}…`); bar((i + 1) / ents.length);
        }
      } else if (VTYPES[ext]) { batch.push([keyForPath((f.webkitRelativePath || '') + '/' + f.name), f, VTYPES[ext]]); n++; }
    }
    await flush();
    closeSheet(); S.profile.videosAt = new Date().toISOString(); commit();
    toast(n ? `${n} exercise videos ready 🎬` : 'No videos found in that file');
  } catch (e) { console.warn(e); closeSheet(); toast('Import failed — try a smaller zip'); }
}
document.addEventListener('change', e => { if (e.target.id === 'vidImport') { const fs = [...(e.target.files || [])]; e.target.value = ''; if (fs.length) importVideoFiles(fs); } });

/* ---------- program player ---------- */
function progSteps(p) {
  const st = [];
  if (p.kind === 'full') {
    PROG.WU.forEach(n => st.push({ n, secs: 30, phase: 'Warm-up' }));
    for (let r = 0; r < progRounds(); r++) PROG[p.code].forEach((n, i) => { st.push({ n, secs: p.work, phase: progRounds() > 1 ? `Round ${r + 1}` : 'Work' }); st.push({ rest: true, secs: p.rest, phase: 'Rest' }); });
    st.pop();
  } else PROG[p.code].forEach(n => st.push({ n, secs: 45, phase: 'Stretch' }));
  return st;
}
let wakeLock = null;
function runProgram(p) {
  const st = progSteps(p); let i = 0, left = st[0].secs, paused = false, iv = null; const t0 = Date.now();
  try { navigator.wakeLock?.request('screen').then(w => { wakeLock = w; }).catch(() => { }); } catch (e) { }
  const nextEx = j => { for (let x = j + 1; x < st.length; x++) if (!st[x].rest) return st[x].n; return null; };
  const d = openFull(`<div class="pl"><div class="pl-top"><span class="eyebrow">${esc(p.name)}</span><span class="small muted pl-count"></span></div><div class="pl-bar"><i></i></div>
    <div class="pl-media"></div><div class="pl-phase"></div><div class="pl-title"></div><div class="pl-timer"></div><div class="pl-next small muted"></div>
    <div class="pl-ctrl"><button class="iconbtn big" data-a="plPrev" aria-label="Previous">⏮</button><button class="pl-play" data-a="plPause" aria-label="Pause">❚❚</button><button class="iconbtn big" data-a="plNext" aria-label="Next">⏭</button></div></div>`, {
    plPause() { paused = !paused; $('.pl-play', d).textContent = paused ? '▶' : '❚❚'; },
    plNext() { go2(i + 1); }, plPrev() { go2(Math.max(0, i - 1)); },
    plFinish() { finish(); },
  }, () => { clearInterval(iv); try { wakeLock?.release(); } catch (e) { } wakeLock = null; });
  const media = $('.pl-media', d), ph = $('.pl-phase', d), tt = $('.pl-title', d), tm = $('.pl-timer', d), nx = $('.pl-next', d), bar = $('.pl-bar i', d), cnt = $('.pl-count', d);
  const exCount = st.filter(s => !s.rest).length;
  function paint() { tm.textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`; }
  function go2(j) {
    if (j >= st.length) return done();
    i = j; left = st[i].secs; const s = st[i];
    const exNo = st.slice(0, i + 1).filter(x => !x.rest).length;
    cnt.textContent = `${exNo} / ${exCount}`; bar.style.width = (i / st.length * 100) + '%';
    ph.textContent = s.phase; ph.className = 'pl-phase ' + (s.rest ? 'rest' : '');
    const showN = s.rest ? nextEx(i) : s.n;
    tt.textContent = s.rest ? 'Breathe & get ready' : exLabel(s.n) + (isBand(s.n) ? ' · band' : '');
    media.innerHTML = showN ? vbox(showN, 'pl-vid' + (s.rest ? ' dim' : ''), 1) : '';
    const nn = nextEx(i); nx.textContent = s.rest ? `Next: ${exLabel(showN || '')}` : nn ? `Up next: ${exLabel(nn)}` : 'Last one — finish strong!';
    paint(); buzz();
  }
  function done() {
    clearInterval(iv); bar.style.width = '100%';
    media.innerHTML = `<div class="pl-done">🎉</div>`; ph.textContent = 'Complete'; tt.textContent = 'Well done 🌿'; tm.textContent = ''; nx.textContent = 'Take a moment to notice how you feel.';
    $('.pl-ctrl', d).innerHTML = `<button class="btn" data-a="plFinish">${I.check} Save &amp; finish</button>`;
  }
  let saved = false;
  function finish() {
    if (!saved) {
      saved = true; const mins = Math.max(5, Math.round((Date.now() - t0) / 60000)), k = TODAY();
      if (p.kind === 'stretch') S.mobilityLog.push({ id: uid(), date: k, rid: 'prog-' + p.code, name: p.name, mins, prog: p.code });
      else S.workoutLog.push({ id: uid(), date: k, wid: 'prog', name: p.name, mins, prog: p.code });
      S.moves.push({ id: uid(), date: k, type: p.kind === 'stretch' ? 'stretch' : 'strength', mins, label: p.name });
      save(); confetti();
    }
    closeFull(); render(); toast('Workout saved ✓');
  }
  iv = setInterval(() => { if (paused || i >= st.length) return; if (left > 0) { left--; paint(); if (left <= 3 && left > 0) buzz(); } if (!left) go2(i + 1); }, 1000);
  go2(0);
}
function progPreview(n) {
  openSheet(exLabel(n), `${vbox(n, 'pv-vid', 1)}<div class="row" style="gap:8px;margin:12px 0 4px"><span class="tag">${isBand(n) ? '➰ Resistance band' : '🧍 Bodyweight'}</span></div><p class="small muted">Move slowly and with control. Stop if anything hurts — an easier version is always fine.</p>`, {});
}

/* ---------- program screen (Workout ▸ Program) ---------- */
function progScreen() {
  const t = TODAY(), p = progInfo(t), mon = mondayOf(t);
  const week = Array.from({ length: 7 }, (_, i) => addD(mon, i)).map(k => ({ k, p: progInfo(k) }));
  const dn = progDone(t);
  let out = `<section class="card prog-hero"><div class="row"><span class="eyebrow">Week ${p.week} of 4 · Round ${p.round}</span><span class="spacer"></span><span class="small muted">↻ auto</span></div>
    <div class="h2" style="margin:8px 0 2px">${p.kind === 'rest' ? 'Rest day 🌿' : esc(p.name)}</div>
    <div class="small muted">${p.kind === 'rest' ? 'Recovery is part of training. Walk, stretch gently or simply rest.' : p.kind === 'stretch' ? `${PROG[p.code].length} stretches · ~${progMins(p)} min · 45 s each` : `Warm-up + 16 exercises · ~${progMins(p)} min · ${p.work}s work / ${p.rest}s rest`}</div>
    ${p.kind !== 'rest' ? `<button class="btn" style="margin-top:14px" data-a="progStart">${I.play} ${dn ? 'Do it again' : 'Start'}</button>${dn ? '<div class="small" style="margin-top:8px;color:var(--accent-strong);font-weight:600;text-align:center">✓ Done today</div>' : ''}` : ''}</section>
    <div class="weekstrip">${week.map(({ k, p: q }) => `<div class="wsd ${k === t ? 'today' : ''} ${progDone(k) ? 'ok' : ''}"><small>${DAY_LETTER[dow(k)]}</small><b>${q.code === 'R' ? '–' : q.code}</b>${progDone(k) ? '<i>✓</i>' : ''}</div>`).join('')}</div>`;
  if (p.kind !== 'rest') {
    const list = p.kind === 'full' ? PROG[p.code] : PROG[p.code];
    out += sectionT('Today’s exercises', `<span class="small muted">${list.length}</span>`) + `<div class="exgrid">${list.map((n, i) => `<button class="excard" data-a="progEx" data-n="${esc(n)}">${vbox(n)}<span class="exn"><b>${i + 1}</b> ${esc(exLabel(n))}${isBand(n) ? ' <em>band</em>' : ''}</span></button>`).join('')}</div>`;
  }
  const order = [[1, 'Mon'], [2, 'Tue'], [3, 'Wed'], [4, 'Thu'], [5, 'Fri']];
  out += sectionT('The 4-week plan') + listCard([1, 2, 3, 4].map(w => {
    const set = w < 3 ? ['A', 'B', 'C', 'D'] : ['E', 'F', 'G', 'H'];
    const codes = [set[0], set[1], w % 2 ? 'S1' : 'S2', set[2], set[3]];
    return `<div class="item"><div class="body"><div class="t">Week ${w}${p.week === w ? ' <span class="tag" style="margin-left:6px">now</span>' : ''}</div><div class="m">${codes.map((c, i) => `${order[i][1]} ${c[0] === 'S' ? (c === 'S1' ? 'Yoga' : 'Stretch') : c}`).join(' · ')} · Sat–Sun rest</div></div><span class="small muted">${PROG_WORK[w - 1]}s/${PROG_REST[w - 1]}s</span></div>`;
  }).join(''));
  out += sectionT('Settings') + `<section class="card"><div class="field" style="margin-bottom:12px"><span>Rounds per full-body session</span><div class="seg" style="margin:0">${[1, 2].map(r => `<button class="${progRounds() === r ? 'on' : ''}" data-a="progRounds" data-v="${r}">${r} round${r > 1 ? 's' : ''}</button>`).join('')}</div></div>
    <div class="h3" style="margin-bottom:4px">Exercise videos</div><p class="small muted js-vcount" style="margin:0 0 12px">Checking…</p>
    <label class="btn soft" style="cursor:pointer">🎬 Import videos (.zip)<input type="file" id="vidImport" accept=".zip,video/*,image/gif" multiple hidden></label>
    <button class="btn ghost" style="margin-top:8px" data-a="progVidClear">Remove videos from this device</button>
    <p class="small muted" style="margin:12px 0 0">Videos stay private on this phone — they’re never uploaded to GitHub. Each phone imports its own copy once.</p></section>`;
  vKeys().then(ks => { const e = $('.js-vcount'); if (e) e.textContent = ks.size ? `${ks.size} videos saved on this device.` : 'No videos yet — import your Exercises Videos zip.'; });
  return out;
}
Object.assign(A, {
  progStart() { const p = progInfo(); if (p.kind === 'rest') return toast('Rest day — enjoy it 🌿'); runProgram(p); },
  progEx(el) { progPreview(el.dataset.n); },
  progRounds(el) { S.profile.progRounds = +el.dataset.v; commit(); },
  progVidClear() { confirmSheet('Remove videos?', 'The exercise videos will be deleted from this device. You can import them again any time.', 'Remove', async () => { await vClear(); render(); toast('Videos removed'); }); },
});

/* ---------- habits: counters (build / quit) and automatic ---------- */
function hStep(h, k, d) {
  const c = S.habitCount = S.habitCount || {}, day = c[k] = c[k] || {};
  const before = isDone(h, k);
  day[h.id] = Math.max(0, (day[h.id] || 0) + d);
  buzz(); commit();
  const n = day[h.id], tg = +h.target || 1;
  if (h.type === 'build') { if (!before && isDone(h, k)) { confetti(); toast(`${esc(h.title)}: goal reached 🎉`); } else if (d > 0) toast(`${n} / ${tg}${h.unit ? ' ' + h.unit : ''}`); }
  if (h.type === 'quit' && d > 0) toast(n > tg ? `Over today’s limit (${n}/${tg}) — tomorrow is a new day` : `${tg - n} left today`);
}
const hCount = (h, k) => (S.habitCount?.[k]?.[h.id]) || 0;
function hCountLabel(h, k) {
  const n = hCount(h, k), tg = +h.target || 1, u = h.unit ? ' ' + esc(h.unit) : '';
  if (h.type === 'build') return `${n}/${tg}${u}`;
  if (h.type === 'quit') return n > tg ? `${n - tg} over` : `${tg - n} left`;
  if (h.auto === 'steps') return `${(S.steps[k] || 0).toLocaleString('en-GB')}/${(+h.target || 8000).toLocaleString('en-GB')}`;
  if (h.auto === 'water') return isLiters() ? fmtL(wml(k)) : `${glassesOf(wml(k))} glasses`;
  if (h.auto === 'workout') return progDone(k) || S.workoutLog.some(l => l.date === k) ? 'done' : 'auto';
  return '';
}
function habitDaySheet(h, k) {
  openSheet(esc(h.title), `<div class="counter"><button class="cbtn" data-a="hcMinus">−</button><div class="cval"><b id="hc-v">${hCount(h, k)}</b><small>${h.type === 'quit' ? 'limit ' : 'goal '}${+h.target || 1}${h.unit ? ' ' + esc(h.unit) : ''}</small></div><button class="cbtn" data-a="hcPlus">+</button></div><p class="small muted" style="text-align:center">${fmt(k, { weekday: 'long', day: 'numeric', month: 'short' })}</p>`, {
    hcMinus() { hStep(h, k, -1); const v = $('#hc-v'); if (v) v.textContent = hCount(h, k); },
    hcPlus() { hStep(h, k, +1); const v = $('#hc-v'); if (v) v.textContent = hCount(h, k); },
  });
}
Object.assign(A, {
  habitMinus(el) { const h = S.habits.find(x => x.id === el.dataset.id); if (h) hStep(h, el.dataset.d || TODAY(), -1); },
  hType(el) { form.htype = el.dataset.v; $$('[data-a="hType"]').forEach(b => b.classList.toggle('on', b === el)); $$('.htype-opt').forEach(b => { b.hidden = !b.dataset.for.split(' ').includes(form.htype); }); },
  hAuto(el) { form.hauto = el.dataset.v; $$('[data-a="hAuto"]').forEach(b => b.classList.toggle('on', b === el)); },
});

/* ---------- smart daily progress ---------- */
const SCORE_PARTS = [['habits', 'Habits'], ['tasks', 'Tasks due today'], ['water', 'Water goal'], ['program', 'Workout plan'], ['move', 'Movement minutes'], ['sleep', 'Sleep logged'], ['fasting', 'Fasting'], ['routine', 'Routines'], ['journal', 'Journal entry'], ['mood', 'Mood check-in']];
const DEFAULT_SCORE = ['habits', 'tasks', 'water', 'program'];
const scoreOn = () => S.profile.score || DEFAULT_SCORE;
function scoreItems(k) {
  const on = scoreOn(), out = [];
  const add = (id, d, t, v) => { if (t > 0) out.push({ id, l: SCORE_PARTS.find(x => x[0] === id)[1], d: clamp(d, 0, t), t, v }); };
  if (on.includes('habits')) { const hs = habitsFor(k), hd = hs.filter(h => isDone(h, k)).length; add('habits', hd, hs.length, `${hd}/${hs.length}`); }
  if (on.includes('tasks')) { const ts = tasksOn(k), td = ts.filter(x => x.done).length; add('tasks', td, ts.length, `${td}/${ts.length}`); }
  if (on.includes('water')) { const p = wml(k) / waterGoalMl(); add('water', Math.min(1, p), 1, Math.round(Math.min(1, p) * 100) + '%'); }
  if (on.includes('program')) { const p = progInfo(k); if (p.kind !== 'rest') add('program', progDone(k) ? 1 : 0, 1, progDone(k) ? '✓' : p.name); }
  if (on.includes('move')) { const p = moveMins(k) / (+S.profile.moveGoal || 30); add('move', Math.min(1, p), 1, `${moveMins(k)} min`); }
  if (on.includes('sleep')) add('sleep', S.sleep[k] ? 1 : 0, 1, S.sleep[k] ? hours(S.sleep[k].hours) : '—');
  if (on.includes('fasting')) { const f = activeFast(), fin = S.fasts.find(x => x.end && dk(new Date(x.end)) === k); const p = fin ? Math.min(1, fastHours(fin) / fin.goalH) : f && k === TODAY() ? Math.min(1, fastHours(f) / f.goalH) : 0; add('fasting', p, 1, Math.round(p * 100) + '%'); }
  if (on.includes('routine')) { const all = ['morning', 'day', 'evening'].flatMap(r => S.routines[r].map(s => [r, s.id])), dn = all.filter(([r, id]) => routineDone(r, k).includes(id)).length; add('routine', dn, all.length, `${dn}/${all.length}`); }
  if (on.includes('journal')) add('journal', S.journal.some(j => j.date === k) ? 1 : 0, 1, S.journal.some(j => j.date === k) ? '✓' : '—');
  if (on.includes('mood')) add('mood', S.mood[k]?.mood ? 1 : 0, 1, S.mood[k]?.mood ? MOODS[S.mood[k].mood - 1].e : '—');
  return out;
}
function dayScore(k) { const it = scoreItems(k), t = sum(it.map(x => x.t)); return t ? sum(it.map(x => x.d)) / t : 0; }
function scoreSheet() {
  const t = TODAY(), it = scoreItems(t), on = scoreOn();
  openSheet('Today’s progress', `${it.length ? listCard(it.map(x => `<div class="item"><span class="sdot ${x.d >= x.t ? 'ok' : ''}">${x.d >= x.t ? '✓' : ''}</span><div class="body"><div class="t">${x.l}</div></div><b>${x.v}</b></div>`).join('')) : ''}
    <div class="eyebrow" style="margin:16px 2px 8px">What counts toward 100%</div>
    ${listCard(SCORE_PARTS.map(([id, l]) => `<div class="item"><div class="body"><div class="t">${l}</div></div><button class="switch ${on.includes(id) ? 'on' : ''}" data-a="scoreTog" data-id="${id}" role="switch" aria-checked="${on.includes(id)}" aria-label="${l}"></button></div>`).join(''))}`, {
    scoreTog(el) { const s = new Set(scoreOn()); s.has(el.dataset.id) ? s.delete(el.dataset.id) : s.add(el.dataset.id); S.profile.score = [...s]; el.classList.toggle('on'); save(); render(); },
  });
}
Object.assign(A, { scoreSheet() { scoreSheet(); } });

/* ---------- Home: more cards ---------- */
Object.assign(HOME_CARDS, { sync: 'Apple Health sync reminder', program: 'Today’s workout', todos: 'To-dos (no date)', steps: 'Steps', sleep: 'Last night’s sleep', move: 'Movement', recipe: 'Recipe idea', gratitude: 'Gratitude', medals: 'Medals', reading: 'Currently reading' });
DEFAULT_HOME.splice(0, 0, ['sync', 1]);
DEFAULT_HOME.splice(3, 0, ['program', 1]);
DEFAULT_HOME.push(['todos', 0], ['steps', 0], ['sleep', 0], ['move', 0], ['recipe', 1], ['gratitude', 0], ['medals', 0], ['reading', 0]);
Object.assign(HOME_RENDER, {
  today: () => {
    const t = TODAY(), it = scoreItems(t), pct = dayScore(t);
    return `<section class="card hero"><button class="ringbtn" data-a="scoreSheet" aria-label="Progress details">${ring(pct, 116, 11, 'var(--accent)', `<div><b>${Math.round(pct * 100)}%</b><small>today</small></div>`)}</button>
    <div class="hero-stats">${it.slice(0, 4).map((x, i) => `<div class="hstat"><span class="dot" style="background:${['var(--accent)', 'var(--mood)', 'var(--water)', 'var(--move)'][i]}"></span>${x.l.replace(' due today', '').replace(' goal', '')}<b>${x.v}</b></div>`).join('') || '<div class="small muted">Tap the ring to choose what counts.</div>'}</div></section>`;
  },
  habits: () => {
    const t = TODAY(), hs = habitsFor(t);
    return `<section class="card"><div class="card-head"><span class="eyebrow">Today’s habits</span><button class="link" data-a="plan" data-seg="habits">Manage</button></div>
    ${hs.length ? `<div class="habit-grid">${hs.map(h => { const on = isDone(h, t), s = streak(h), cnt = h.type === 'build' || h.type === 'quit', lbl = hCountLabel(h, t);
      return `<div class="hchip-w"><button class="hchip ${on ? 'on' : ''} ${h.type === 'quit' && hCount(h, t) > (+h.target || 0) ? 'over' : ''}" style="--hc:${h.color}" data-a="habit" data-id="${h.id}" data-d="${t}"><span class="emo">${hIco(h)}</span><span><span class="t">${esc(h.title)}</span><span class="s">${lbl ? `<b>${lbl}</b>` : s ? `🔥 ${s}` : h.type === 'quit' ? '' : 'Tap when done'}</span></span></button>${cnt && hCount(h, t) > 0 ? `<button class="hminus" data-a="habitMinus" data-id="${h.id}" data-d="${t}" aria-label="Undo one">−</button>` : ''}</div>`; }).join('')}</div>`
      : emptyState('🌱', `No habits for today.<br><button class="link" data-a="newHabit">Create your first habit</button>`)}</section>`;
  },
  sync: () => {
    const hs = S.healthSync, today = hs && dk(new Date(hs.last)) === TODAY();
    if (!hs) return `<button class="syncbar" data-a="hsPaste">${I.heartPulse}<span><b>Sync Apple Health</b><small>Run RESET Sync, then tap here · tap “Paste” if asked</small></span><span class="syncic">↻</span></button>`;
    return `<button class="syncbar ${today ? 'soft' : ''}" data-a="hsPaste">${I.heartPulse}<span><b>${today ? 'Apple Health synced' : 'Sync Apple Health'}</b><small>${today ? 'Last: ' + new Date(hs.last).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' · tap to refresh' : 'Tap to bring in today’s data'}</small></span><span class="syncic">↻</span></button>`;
  },
  program: () => {
    const t = TODAY(), p = progInfo(t), dn = progDone(t);
    if (p.kind === 'rest') { const nxt = [1, 2].map(i => progInfo(addD(t, i))).find(q => q.kind !== 'rest') || progInfo(addD(t, 3)); return `<section class="card prog-home rest"><div class="row"><span class="pic">🌿</span><div class="body" style="flex:1"><div class="eyebrow">Week ${p.week} of 4</div><div class="h3">Rest day</div><div class="small muted">Recover, walk, enjoy. Next: ${esc(nxt.name)}</div></div></div></section>`; }
    const list = PROG[p.code];
    return `<section class="card prog-home"><div class="row" style="align-items:flex-start"><div class="body" style="flex:1"><div class="eyebrow">Today’s workout · Week ${p.week}/4</div><div class="h2" style="margin:4px 0 2px">${esc(p.name)}</div><div class="small muted">${list.length} ${p.kind === 'stretch' ? 'stretches' : 'exercises'} · ~${progMins(p)} min</div></div>${dn ? '<span class="tag">✓ Done</span>' : ''}</div>
    <div class="thumbrow">${list.slice(0, 4).map(n => vbox(n, 'vthumb sm')).join('')}<button class="more" data-a="go" data-to="health/workout">+${list.length - 4}</button></div>
    <button class="btn ${dn ? 'soft' : ''}" style="margin-top:12px" data-a="progStart">${I.play} ${dn ? 'Do it again' : 'Start workout'}</button></section>`;
  },
  todos: () => { const L = S.tasks.filter(x => !x.done && !x.date); return `<section class="card"><div class="card-head"><span class="eyebrow">To-dos · anytime</span><button class="link" data-a="newTodo">+ Add</button></div>${L.length ? `<ul class="list">${L.slice(0, 6).map(taskItem).join('')}</ul>` : emptyState('📝', 'No to-dos. Add things without a date here.')}</section>`; },
  steps: () => { const s = S.steps[TODAY()] || 0; return `<section class="card"><button class="feature" data-a="stepsSheet"><span class="ic" style="background:var(--accent-soft);font-size:22px">👟</span><span class="body"><span class="h3">${s.toLocaleString('en-GB')} steps</span><span class="small muted">${s ? 'Today' : 'Tap to add today’s steps'}</span></span></button></section>`; },
  sleep: () => { const s = S.sleep[TODAY()]; return `<section class="card"><button class="feature" data-a="logSleep" data-d="${TODAY()}"><span class="ic" style="background:var(--accent-soft);font-size:22px">🌙</span><span class="body"><span class="h3">${s ? hours(s.hours) + ' of sleep' : 'How did you sleep?'}</span><span class="small muted">${s ? SLEEPQ[(s.q || 3) - 1] + ' last night' : 'Tap to log last night'}</span></span></button></section>`; },
  move: () => { const m = moveMins(TODAY()), g = +S.profile.moveGoal || 30; return `<section class="card"><div class="card-head"><span class="eyebrow">Movement</span><button class="link" data-a="logMove">+ Log</button></div><div class="row"><span class="bigstat" style="font-size:30px">${m}<small> / ${g} min</small></span></div>${pbar(m / g, 'var(--move)')}</section>`; },
  recipe: () => `<section class="card"><div class="card-head"><span class="eyebrow">Recipe idea</span><button class="link" data-a="go" data-to="health/meals">All recipes</button></div><div class="js-rk-idea">${rkIdeaHTML()}</div></section>`,
  gratitude: () => { const g = S.gratitude[TODAY()] || ['', '', '']; return `<section class="card tint-accent"><div class="eyebrow" style="margin-bottom:8px">Three good things</div>${[0, 1, 2].map(i => `<input class="inline-input" style="width:100%;margin-bottom:6px" placeholder="${i + 1}. I’m grateful for…" value="${esc(g[i] || '')}" data-save="grat" data-args="${i}">`).join('')}</section>`; },
  medals: () => { const cats = medalCats(), got = cats.reduce((n, c) => n + MEDAL_TIERS.filter(t => c[3] >= t[0]).length, 0), near = cats.map(c => [c, MEDAL_TIERS.find(t => c[3] < t[0])]).filter(x => x[1]).sort((a, b) => (a[1][0] - a[0][3]) - (b[1][0] - b[0][3]))[0]; return `<section class="card"><button class="feature" data-a="go" data-to="progress"><span class="ic" style="background:var(--sand-soft);font-size:24px">🏅</span><span class="body"><span class="h3">${got} medals earned</span><span class="small muted">${near ? `${near[0][1]} ${near[0][2]}: ${near[1][0] - near[0][3]} days to ${near[1][2]}` : 'All medals earned!'}</span></span></button></section>`; },
  reading: () => { const b = S.reading.find(x => x.status === 'doing'); return `<section class="card"><button class="feature" data-a="go" data-to="growth/reading"><span class="ic" style="background:var(--sand-soft);font-size:22px">📖</span><span class="body"><span class="h3">${b ? esc(b.title) : 'Nothing on the go'}</span><span class="small muted">${b ? 'Currently reading' : 'Pick a book to start'}</span></span></button></section>`; },
});
function stepsSheet() {
  openSheet('Steps today', `<label class="field"><span>Steps</span><input class="input" id="st-v" type="number" inputmode="numeric" value="${S.steps[TODAY()] || ''}" placeholder="e.g. 7500"></label><button class="btn" data-a="save">Save</button>`, {
    save() { const v = Math.max(0, Math.round(+val('#st-v') || 0)); S.steps[TODAY()] = v; closeSheet(); commit(); toast('Steps saved'); },
  });
}
Object.assign(A, {
  stepsSheet() { stepsSheet(); },
  newTodo() { taskSheet(null, ''); },
  tNoDate() { const i = $('#f-date'); if (i) i.value = ''; $$('[data-a="tNoDate"],[data-a="tToday"],[data-a="tTomorrow"]').forEach(b => b.classList.toggle('on', b.dataset.a === 'tNoDate')); },
  tToday() { const i = $('#f-date'); if (i) i.value = TODAY(); $$('[data-a="tNoDate"],[data-a="tToday"],[data-a="tTomorrow"]').forEach(b => b.classList.toggle('on', b.dataset.a === 'tToday')); },
  tTomorrow() { const i = $('#f-date'); if (i) i.value = addD(TODAY(), 1); $$('[data-a="tNoDate"],[data-a="tToday"],[data-a="tTomorrow"]').forEach(b => b.classList.toggle('on', b.dataset.a === 'tTomorrow')); },
});

/* ---------- fasting: confirm the real end time ---------- */
function fastEndSheet(f, existing) {
  const start = new Date(f.start), now = new Date();
  openSheet(existing ? 'Edit fast' : 'End your fast', `<p class="small muted" style="margin-top:-4px">${existing ? 'Correct the times if needed.' : 'Did you break your fast just now, or earlier? Set the real time so your fast stays accurate.'}</p>
    ${existing ? `<label class="field"><span>Started</span><input class="input" type="datetime-local" id="fe-start" value="${toLocalInput(f.start)}" max="${toLocalInput(now)}"></label>` : `<div class="kv"><span class="k">Started</span><b>${fmtWhen(start)}</b></div>`}
    <label class="field" style="margin-top:10px"><span>Ended at</span><input class="input" type="datetime-local" id="fe-end" value="${toLocalInput(f.end || now)}" min="${toLocalInput(start)}" max="${toLocalInput(now)}"></label>
    <div class="row" style="gap:8px;margin:-4px 0 14px">${existing ? '' : [15, 30, 60].map(m => `<button class="chip" data-a="feAgo" data-v="${m}">${m} min ago</button>`).join('')}</div>
    <button class="btn" data-a="save">${existing ? 'Save changes' : 'End fast'}</button>${existing ? `<button class="btn danger" style="margin-top:6px" data-a="del">Delete fast</button>` : ''}`, {
    feAgo(el) { const i = $('#fe-end'); if (i) i.value = toLocalInput(Date.now() - +el.dataset.v * 6e4); },
    save() {
      const ev = new Date(val('#fe-end')), sv = existing ? new Date(val('#fe-start')) : start;
      if (isNaN(ev) || isNaN(sv) || ev <= sv || ev > new Date(Date.now() + 6e4)) return shake('#fe-end');
      f.start = sv.toISOString(); f.end = ev.toISOString(); closeSheet(); commit();
      if (!existing) { if (fastHours(f) >= f.goalH) { confetti(); toast(`Fast complete: ${hoursFmt(fastHours(f))} 🎉`); } else toast(`Fast saved: ${hoursFmt(fastHours(f))}`); } else toast('Fast updated');
    },
    del() { S.fasts = S.fasts.filter(x => x !== f); closeSheet(); commit(); },
  });
}
Object.assign(A, {
  fastEnd() { const f = activeFast(); if (f) fastEndSheet(f, false); },
  fastEditPast(el) { const f = S.fasts.find(x => x.id === el.dataset.id); if (f) fastEndSheet(f, true); },
});

/* ---------- RESET Kitchen (200 original recipes, lazy-loaded) ---------- */
let rkState = 0;
function needRK() {
  if (window.RK_DATA) return true;
  if (rkState) return false; rkState = 1;
  const s = document.createElement('script'); s.src = 'recipes.js';
  s.onload = () => { rkState = 2; if (!sheetActs && !fullEl) render(); $$('.js-rk-idea').forEach(e => { e.innerHTML = rkIdeaHTML(); }); };
  s.onerror = () => { rkState = 0; };
  document.head.appendChild(s); return false;
}
function hydrateRecipeArt(el) { if (!window.RK_ART) return; el.dataset.done = '1'; const r = RK_DATA[+el.dataset.rkart]; if (r) el.innerHTML = RK_ART(r, el.dataset.wide === '1'); }
const rkFav = () => S.rkFav || (S.rkFav = []);
const rkMeal = r => r.cat === 'Smoothies' ? 'breakfast' : r.cat.toLowerCase();
function rkIdeaHTML() {
  if (!needRK()) return '<div class="small muted">Loading recipes…</div>';
  const h = new Date().getHours(), cat = h < 11 ? 'Breakfast' : h < 16 ? 'Lunch' : 'Dinner';
  const L = RK_DATA.map((r, i) => [r, i]).filter(([r]) => r.cat === cat), [r, i] = L[dayNum(TODAY()) % L.length];
  return `<button class="rk-idea" data-a="rkOpen" data-i="${i}"><span class="rk-art" data-rkart="${i}"></span><span class="body"><span class="small muted">${cat} idea</span><span class="h3">${esc(r.title)}</span><span class="small muted">${r.kcal} kcal · ${r.protein} g protein · ${r.mins} min</span></span></button>`;
}
const RK_TAGS = { veg: 'Vegetarian', vegan: 'Vegan', fish: 'Fish', meat: 'Meat', highprotein: 'High protein', lowcarb: 'Low carb', quick: 'Quick', mealprep: 'Meal prep' };
function rkList() {
  const c = ui.rkCat || 'All', q = (ui.rkQ || '').toLowerCase(), tg = ui.rkTag || '';
  return RK_DATA.map((r, i) => [r, i]).filter(([r, i]) => (c === 'All' || (c === 'Saved' ? rkFav().includes(r.title) : r.cat === c)) && (!tg || r.tags.includes(tg)) && (!q || r.title.toLowerCase().includes(q) || r.ing.join(' ').toLowerCase().includes(q)));
}
const rkGrid = () => { const L = rkList(); return L.length ? L.map(([r, i]) => `<button class="rk-card" data-a="rkOpen" data-i="${i}"><span class="rk-art" data-rkart="${i}"></span>${rkFav().includes(r.title) ? '<i class="rk-heart">♥</i>' : ''}<span class="rk-t">${esc(r.title)}</span><span class="rk-m">${r.kcal} kcal · ${r.protein} g P · ${r.mins}′</span></button>`).join('') : `<div class="small muted" style="grid-column:1/-1;text-align:center;padding:30px">No recipes match.</div>`; };
function kitchenScreen() {
  if (!needRK()) return `<section class="card">${emptyState('🍲', 'Loading RESET Kitchen…')}</section>`;
  const c = ui.rkCat || 'All', cats = ['All', 'Breakfast', 'Smoothies', 'Lunch', 'Dinner', 'Saved', 'Mine'];
  if (c === 'Mine') return `<div class="chips rk-cats">${cats.map(x => `<button class="chip ${c === x ? 'on' : ''}" data-a="rkCat" data-v="${x}">${x === 'Saved' ? '♥ Saved' : x === 'Mine' ? '✍️ My recipes' : x}</button>`).join('')}</div>`
    + (S.recipes.length ? listCard(S.recipes.map(r => `<button class="nrow" data-a="recipe" data-id="${r.id}"><span class="ni">🍲</span><span class="body"><span class="t">${esc(r.name)}</span><span class="m">${r.mins ? r.mins + ' min' : 'Your recipe'}</span></span><span class="chev">${I.right}</span></button>`).join('')) : `<section class="card">${emptyState('✍️', 'Save your own favourite recipes here.')}</section>`) + pill('rkNewMine', 'New recipe');
  return `<div class="chips rk-cats">${cats.map(x => `<button class="chip ${c === x ? 'on' : ''}" data-a="rkCat" data-v="${x}">${x === 'Saved' ? '♥ Saved' : x === 'Mine' ? '✍️ My recipes' : x}</button>`).join('')}</div>
  <input class="input" id="rk-q" placeholder="Search recipes or ingredients…" value="${esc(ui.rkQ || '')}" autocomplete="off" style="margin-bottom:10px">
  <div class="chips" style="margin-bottom:12px">${Object.entries(RK_TAGS).map(([k, l]) => `<button class="chip sm ${ui.rkTag === k ? 'on' : ''}" data-a="rkTag" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="row" style="margin:0 2px 10px"><span class="small muted js-rk-count">${rkList().length} recipes</span><span class="spacer"></span><button class="link" data-a="rkRandom">✨ Surprise me</button></div>
  <div class="rk-grid" id="rk-grid">${rkGrid()}</div>`;
}
document.addEventListener('input', e => { if (e.target.id === 'rk-q') { ui.rkQ = e.target.value; const g = $('#rk-grid'); if (g) g.innerHTML = rkGrid(); const c = $('.js-rk-count'); if (c) c.textContent = rkList().length + ' recipes'; } });
function rkOpen(i) {
  const r = RK_DATA[i], fav = () => rkFav().includes(r.title);
  const d = openFull(`<div class="rk-full"><div class="rk-hero" data-rkart="${i}" data-wide="1"></div><div class="rk-body"><div class="eyebrow">${r.cat}</div><h1 class="title sm" style="margin:4px 0 12px">${esc(r.title)}</h1>
    <div class="rk-stats"><div><b>${r.kcal}</b><small>kcal</small></div><div><b>${r.protein} g</b><small>protein</small></div><div><b>${r.mins}</b><small>minutes</small></div></div>
    <div class="row" style="gap:6px;flex-wrap:wrap;margin:12px 0 4px">${r.tags.map(t => `<span class="tag">${RK_TAGS[t]}</span>`).join('')}</div>
    <div class="h3" style="margin:16px 0 6px">Ingredients</div><ul class="rk-ing">${r.ing.map(x => `<li><button data-a="rkTick"><i></i>${esc(x)}</button></li>`).join('')}</ul>
    <div class="h3" style="margin:16px 0 6px">Method</div><ol class="rk-steps">${r.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
    <div class="rk-actions"><button class="btn" data-a="rkShop">${I.cart} Add to shopping list</button><button class="btn soft" data-a="rkLog">🍽️ Log as today’s ${rkMeal(r)}</button><button class="btn ghost" data-a="rkPlan">📅 Plan for today’s ${r.cat === 'Dinner' ? 'dinner' : 'lunch'}</button><button class="btn ghost js-rkfav" data-a="rkFav">${fav() ? '♥ Saved' : '♡ Save recipe'}</button></div>
    <p class="small muted" style="margin-top:10px">Serves 1 unless noted · values are approximate per serving.</p></div></div>`, {
    rkTick(el) { el.classList.toggle('ck'); },
    rkShop() { r.ing.forEach(t => { if (!S.shopping.some(s => !s.done && s.text.toLowerCase() === t.toLowerCase())) S.shopping.push({ id: uid(), text: t, done: false }); }); save(); toast('Added to shopping list 🛒'); },
    rkLog() { const k = TODAY(), m = rkMeal(r), day = S.food[k] = S.food[k] || {}; (day[m] = day[m] || []).push({ id: uid(), name: r.title, kcal: r.kcal, p: r.protein, c: 0, f: 0 }); save(); toast(`Logged to ${m} ✓`); },
    rkPlan() { const k = TODAY(), m = S.mealPlan[k] = S.mealPlan[k] || {}; m[r.cat === 'Dinner' ? 'dinner' : 'lunch'] = r.title; save(); toast('Added to today’s meal plan 📅'); },
    rkFav() { const f = rkFav(), j = f.indexOf(r.title); j >= 0 ? f.splice(j, 1) : f.push(r.title); save(); const b = $('.js-rkfav', d); if (b) b.textContent = fav() ? '♥ Saved' : '♡ Save recipe'; },
  }, () => { if (route().tab === 'health') render(); });
}
Object.assign(A, {
  rkCat(el) { ui.rkCat = el.dataset.v; render(); },
  rkTag(el) { ui.rkTag = ui.rkTag === el.dataset.v ? '' : el.dataset.v; render(); },
  rkOpen(el) { if (needRK()) rkOpen(+el.dataset.i); },
  rkRandom() { const L = rkList(); if (L.length) rkOpen(L[Math.floor(Math.random() * L.length)][1]); },
  rkNewMine() { recipeSheet(); },
});

/* ---------- auto health sync on open (when the browser allows it) ---------- */
async function autoHealthSync() {
  try {
    if (!S.healthSync || !navigator.permissions || !navigator.clipboard?.readText) return;
    const st = await navigator.permissions.query({ name: 'clipboard-read' }).catch(() => null);
    if (!st || st.state !== 'granted') return;
    const t = await navigator.clipboard.readText(); if (!t || !/steps\s*[=:]/i.test(t)) return;
    const sig = t.trim().slice(0, 200); if (sig === S.healthSync.sig) return;
    applyHealth(parseHealth(t)); if (S.healthSync) { S.healthSync.sig = sig; save(); }
  } catch (e) { }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) autoHealthSync(); });
setTimeout(autoHealthSync, 1200);

/* ---------- v8 migration ---------- */
(function v8migrate() {
  if ((S.v || 7) < 8) {
    if (!S.profile.progStart) S.profile.progStart = mondayOf(TODAY());
    S.habitCount = S.habitCount || {};
    if (Array.isArray(S.profile.home)) {
      const l = S.profile.home;
      if (!l.some(x => x[0] === 'sync')) l.unshift(['sync', 1]);
      if (!l.some(x => x[0] === 'program')) { const i = l.findIndex(x => x[0] === 'today'); l.splice(i >= 0 ? i + 1 : 1, 0, ['program', 1]); }
      if (!l.some(x => x[0] === 'recipe')) l.push(['recipe', 1]);
    }
    S.v = 8; save();
  }
})();

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
