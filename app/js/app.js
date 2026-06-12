/**
 * Miti Pro — advanced cross-platform (desktop + mobile) Nepali calendar app
 * Views: Home, Calendar, Convert, Events, More (Tools / Holidays / Settings)
 */

const conv = new DateConverter();
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------- State & storage ---------- */
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem('miti.' + key); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem('miti.' + key, JSON.stringify(value)); },
};

const state = {
  view: 'home',
  theme: store.get('theme', null), // null = follow system theme
  lang: store.get('lang', 'en'),       // 'en' | 'np'
  cal: null,                            // { year, month } BS
  convMode: 'bs2ad',
  events: store.get('events', []),      // { id, title, bs:{y,m,d}, note }
  deferredInstall: null,
};

/* ---------- i18n ---------- */
const I18N = {
  en: {
    home: 'Home', calendar: 'Calendar', convert: 'Convert', events: 'Events', more: 'More',
    install: 'Install App', today: 'Today', upcoming: 'Upcoming Festivals', myEvents: 'My Events',
    copy: 'Copy', share: 'Share', copied: 'Copied to clipboard', daysLeft: 'days', viewAll: 'View all',
    quickTools: 'Quick Tools', ageCalc: 'Age Calculator', dateDiff: 'Date Difference',
    addEvent: 'Add Event', noEvents: 'No events yet. Tap “Add Event” to create a reminder.',
    holidays: 'Holidays & Festivals', settings: 'Settings', theme: 'Dark theme', language: 'Nepali language',
    notify: 'Event notifications', clear: 'Clear all data', about: 'Miti Pro v2 — works offline on desktop & mobile.',
    saturday: 'Saturday Holiday', save: 'Save', cancel: 'Cancel', delete: 'Delete',
    eventTitle: 'Event title', eventDate: 'Date (BS)', eventNote: 'Note (optional)',
    yearsOld: 'years', months: 'months', days: 'days', totalDays: 'Total days', weeks: 'weeks', hours: 'hours',
    dob: 'Date of birth (AD)', from: 'From (AD)', to: 'To (AD)', calc: 'Calculate', nextBirthday: 'Next birthday in',
    todayEvents: 'Today', inDays: (n) => n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `in ${n} days`,
    glance: 'Year at a Glance', holLeft: 'Holidays left', daysLeftYr: 'Days left in', fy: 'FY',
  },
  np: {
    home: 'गृह', calendar: 'पात्रो', convert: 'रूपान्तरण', events: 'कार्यक्रम', more: 'थप',
    install: 'एप इन्स्टल', today: 'आज', upcoming: 'आगामी चाडपर्व', myEvents: 'मेरा कार्यक्रम',
    copy: 'कपी', share: 'सेयर', copied: 'कपी भयो', daysLeft: 'दिन', viewAll: 'सबै हेर्नुहोस्',
    quickTools: 'उपकरणहरू', ageCalc: 'उमेर गणना', dateDiff: 'मिति फरक',
    addEvent: 'कार्यक्रम थप्नुहोस्', noEvents: 'कुनै कार्यक्रम छैन। रिमाइन्डर बनाउन “थप्नुहोस्” थिच्नुहोस्।',
    holidays: 'बिदा तथा चाडपर्व', settings: 'सेटिङ', theme: 'डार्क थिम', language: 'नेपाली भाषा',
    notify: 'सूचना', clear: 'सबै डाटा मेट्नुहोस्', about: 'मिति प्रो v2 — डेस्कटप र मोबाइलमा अफलाइन चल्छ।',
    saturday: 'शनिबार बिदा', save: 'सेभ', cancel: 'रद्द', delete: 'मेट्नुहोस्',
    eventTitle: 'कार्यक्रमको नाम', eventDate: 'मिति (वि.सं.)', eventNote: 'टिप्पणी (ऐच्छिक)',
    yearsOld: 'वर्ष', months: 'महिना', days: 'दिन', totalDays: 'जम्मा दिन', weeks: 'हप्ता', hours: 'घण्टा',
    dob: 'जन्म मिति (ई.सं.)', from: 'देखि (ई.सं.)', to: 'सम्म (ई.सं.)', calc: 'गणना गर्नुहोस्', nextBirthday: 'अर्को जन्मदिन',
    todayEvents: 'आज', inDays: (n) => n === 0 ? 'आज' : n === 1 ? 'भोलि' : `${toNp(n)} दिनमा`,
    glance: 'वर्ष एक नजरमा', holLeft: 'बाँकी बिदा', daysLeftYr: 'बाँकी दिन', fy: 'आ.व.',
  },
};
const t = (key) => I18N[state.lang][key] ?? I18N.en[key] ?? key;

function toNp(num) {
  return String(num).replace(/\d/g, (d) => NEPALI_DIGITS[+d]);
}
const fmtNum = (n) => state.lang === 'np' ? toNp(n) : String(n);
const monthName = (m) => BS_MONTHS[state.lang === 'np' ? 'np' : 'en'][m - 1];
const dayName = (dow) => BS_DAYS[state.lang === 'np' ? 'np' : 'en'][dow];

function fmtBS(bs, { np = false } = {}) {
  if (np || state.lang === 'np') return `${toNp(bs.day)} ${BS_MONTHS.np[bs.month - 1]} ${toNp(bs.year)}`;
  return `${BS_MONTHS.en[bs.month - 1]} ${bs.day}, ${bs.year}`;
}
function fmtAD(d) {
  return `${AD_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/* ---------- Toast ---------- */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('#toast-container').appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

/* ---------- Modal ---------- */
function openModal(html) {
  $('#modal').innerHTML = `<button class="modal-close" id="modal-x">✕</button>` + html;
  $('#modal-backdrop').hidden = false;
  $('#modal-x').onclick = closeModal;
}
function closeModal() { $('#modal-backdrop').hidden = true; }
$('#modal-backdrop')?.addEventListener('click', (e) => { if (e.target.id === 'modal-backdrop') closeModal(); });

/* ---------- Events helpers ---------- */
function saveEvents() { store.set('events', state.events); }
function eventDaysUntil(ev) {
  try {
    const ad = conv.bsToAD(ev.bs.y, ev.bs.m, ev.bs.d);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.round((ad - now) / 86400000);
  } catch { return null; }
}
function eventsOn(bsY, bsM, bsD) {
  return state.events.filter((e) => e.bs.y === bsY && e.bs.m === bsM && e.bs.d === bsD);
}

/* ---------- Live holiday data ----------
   Fetches data/holidays.json fresh from the server on every launch so holiday
   corrections reach all devices without a code update. Falls back to the last
   good copy (localStorage), then to the built-in HOLIDAYS data. */
function applyHolidayData(data) {
  let changed = false;
  for (const y of Object.keys(data)) {
    if (y.startsWith('_')) continue;
    if (JSON.stringify(HOLIDAYS[y]) !== JSON.stringify(data[y])) { HOLIDAYS[y] = data[y]; changed = true; }
  }
  return changed;
}
async function loadLiveHolidays() {
  const cached = store.get('holidaysData', null);
  if (cached) applyHolidayData(cached);
  try {
    const res = await fetch('data/holidays.json', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    store.set('holidaysData', data);
    if (applyHolidayData(data)) render();
  } catch { /* offline — cached/built-in data already applied */ }
}

/* Nepal fiscal year (Shrawan 1 – Ashadh end) + year stats */
function glance() {
  const today = conv.getToday().bs;
  const fyStart = today.month >= 4 ? today.year : today.year - 1;
  const fyLabel = `${fmtNum(fyStart)}/${fmtNum(String((fyStart + 1) % 100).padStart(2, '0'))}`;
  const q = Math.floor(((today.month - 4 + 12) % 12) / 3) + 1;
  let yrDaysLeft = '–';
  try { yrDaysLeft = conv.bsDateDiff(today.year, today.month, today.day, today.year, 12, conv.getBSMonthDays(today.year, 12)); } catch {}
  let holLeft = 0;
  for (const k of Object.keys(HOLIDAYS[today.year] || {})) {
    const [m, d] = k.split('-').map(Number);
    if (m > today.month || (m === today.month && d >= today.day)) holLeft++;
  }
  return { fyLabel, q, yrDaysLeft, holLeft };
}

/* ---------- Views ---------- */
const views = {

  home() {
    const today = conv.getToday();
    const bs = today.bs;
    const adDate = new Date();
    const holiday = HolidayManager.getHoliday(bs.year, bs.month, bs.day);
    const isSat = bs.dayOfWeek === 6;
    const upcoming = HolidayManager.getUpcomingHolidays(conv, 4);
    const todayEvs = eventsOn(bs.year, bs.month, bs.day);
    const nextEvs = state.events
      .map((e) => ({ ...e, du: eventDaysUntil(e) }))
      .filter((e) => e.du !== null && e.du >= 0)
      .sort((a, b) => a.du - b.du)
      .slice(0, 3);

    return `
      <div class="card hero">
        <div class="hero-day">${dayName(bs.dayOfWeek)} · ${t('today')}</div>
        <div class="hero-bs">${fmtBS(bs)}</div>
        <div class="hero-bs-np np">${state.lang === 'np' ? fmtAD(adDate) : fmtBS(bs, { np: true })}</div>
        <div class="hero-ad">${state.lang === 'np' ? '' : fmtAD(adDate)}</div>
        <div class="hero-clock" id="hero-clock"></div>
        ${holiday ? `<div class="hero-badge">${holiday.emoji} ${state.lang === 'np' ? holiday.name : holiday.nameEn}</div>`
        : isSat ? `<div class="hero-badge">🔴 ${t('saturday')}</div>` : ''}
        <div class="hero-actions">
          <button class="btn" id="copy-today">📋 ${t('copy')}</button>
          <button class="btn" id="share-today">📤 ${t('share')}</button>
        </div>
      </div>

      ${todayEvs.length ? `
      <div class="section-title">🔔 ${t('todayEvents')}</div>
      <div class="card">${todayEvs.map((e) => `
        <div class="list-item"><div class="list-emoji">🔔</div>
          <div class="list-body"><div class="list-title">${esc(e.title)}</div>
          ${e.note ? `<div class="list-sub">${esc(e.note)}</div>` : ''}</div>
        </div>`).join('')}
      </div>` : ''}

      <div class="section-title">📊 ${t('glance')}</div>
      <div class="card">
        <div class="stat-row" style="margin-top:0">
          <div class="stat"><b>${fmtNum(glance().holLeft)}</b><span>${t('holLeft')}</span></div>
          <div class="stat"><b>${fmtNum(glance().yrDaysLeft)}</b><span>${t('daysLeftYr')} ${fmtNum(bs.year)}</span></div>
          <div class="stat"><b>Q${fmtNum(glance().q)}</b><span>${t('fy')} ${glance().fyLabel}</span></div>
        </div>
      </div>

      <div class="section-title">🎉 ${t('upcoming')}</div>
      <div class="card">
        ${upcoming.map((h) => `
          <div class="list-item" data-goto="${h.bsYear}-${h.bsMonth}-${h.bsDay}">
            <div class="list-emoji">${h.emoji}</div>
            <div class="list-body">
              <div class="list-title">${state.lang === 'np' ? h.name : h.nameEn}</div>
              <div class="list-sub">${fmtNum(h.bsDay)} ${monthName(h.bsMonth)} · ${AD_MONTHS_SHORT[h.adDate.getMonth()]} ${h.adDate.getDate()}</div>
            </div>
            <div class="list-meta"><span class="badge ${h.daysUntil <= 7 ? '' : 'gold'}">${I18N[state.lang].inDays(h.daysUntil)}</span></div>
          </div>`).join('') || `<div class="empty">—</div>`}
      </div>

      ${nextEvs.length ? `
      <div class="section-title">🗓️ ${t('myEvents')}</div>
      <div class="card">${nextEvs.map((e) => `
        <div class="list-item"><div class="list-emoji">🔔</div>
          <div class="list-body"><div class="list-title">${esc(e.title)}</div>
          <div class="list-sub">${fmtNum(e.bs.d)} ${monthName(e.bs.m)} ${fmtNum(e.bs.y)}</div></div>
          <div class="list-meta"><span class="badge green">${I18N[state.lang].inDays(e.du)}</span></div>
        </div>`).join('')}
      </div>` : ''}
    `;
  },

  calendar() {
    if (!state.cal) {
      const today = conv.getToday().bs;
      state.cal = { year: today.year, month: today.month };
    }
    const { year, month } = state.cal;
    const today = conv.getToday().bs;
    const days = conv.getBSMonthWithAD(year, month);
    const firstDow = days[0].dayOfWeek;
    const monthHolidays = HolidayManager.getMonthHolidays(year, month);
    const adStart = days[0].adDate, adEnd = days[days.length - 1].adDate;
    const adRange = adStart.getMonth() === adEnd.getMonth()
      ? `${AD_MONTHS[adStart.getMonth()]} ${adStart.getFullYear()}`
      : `${AD_MONTHS_SHORT[adStart.getMonth()]}–${AD_MONTHS_SHORT[adEnd.getMonth()]} ${adEnd.getFullYear()}`;

    const years = Object.keys(BS_CALENDAR_DATA);
    const dows = BS_DAYS[state.lang === 'np' ? 'short_np' : 'short_en'];

    let cells = '';
    for (let i = 0; i < firstDow; i++) cells += `<div class="cal-cell blank"></div>`;
    for (const d of days) {
      const isToday = year === today.year && month === today.month && d.bsDay === today.day;
      const hol = HolidayManager.getHoliday(year, month, d.bsDay);
      const hasEv = eventsOn(year, month, d.bsDay).length > 0;
      cells += `
        <button class="cal-cell ${d.dayOfWeek === 6 ? 'sat' : ''} ${hol ? 'holiday' : ''} ${isToday ? 'today' : ''}"
                data-day="${d.bsDay}">
          <span class="bs-d">${fmtNum(d.bsDay)}</span>
          <span class="ad-d">${d.adDay} ${d.adDay === 1 ? d.adMonthName : ''}</span>
          ${hasEv ? '<span class="dot"></span>' : ''}
        </button>`;
    }

    return `
      <div class="card">
        <div class="cal-head">
          <button class="cal-nav-btn" id="cal-prev">‹</button>
          <div class="cal-month">${monthName(month)} ${fmtNum(year)}<small>${adRange}</small></div>
          <button class="cal-nav-btn" id="cal-next">›</button>
        </div>
        <div class="cal-controls">
          <select id="cal-year">${years.map((y) => `<option value="${y}" ${+y === year ? 'selected' : ''}>${fmtNum(y)}</option>`).join('')}</select>
          <select id="cal-month-sel">${BS_MONTHS[state.lang === 'np' ? 'np' : 'en'].map((m, i) => `<option value="${i + 1}" ${i + 1 === month ? 'selected' : ''}>${m}</option>`).join('')}</select>
          <button class="btn secondary" id="cal-today" style="flex:none">${t('today')}</button>
        </div>
        <div class="cal-grid">
          ${dows.map((d, i) => `<div class="cal-dow ${i === 6 ? 'sat' : ''}">${d}</div>`).join('')}
          ${cells}
        </div>
      </div>
      ${monthHolidays.length ? `
      <div class="section-title">🎊 ${t('holidays')}</div>
      <div class="card">${monthHolidays.map((h) => `
        <div class="list-item" data-goto="${year}-${month}-${h.day}">
          <div class="list-emoji">${h.emoji}</div>
          <div class="list-body"><div class="list-title">${state.lang === 'np' ? h.name : h.nameEn}</div>
          <div class="list-sub">${fmtNum(h.day)} ${monthName(month)}</div></div>
        </div>`).join('')}
      </div>` : ''}
    `;
  },

  convert() {
    const years = Object.keys(BS_CALENDAR_DATA);
    const bsMode = state.convMode === 'bs2ad';
    return `
      <div class="card">
        <div class="seg">
          <button id="seg-bs2ad" class="${bsMode ? 'active' : ''}">BS → AD</button>
          <button id="seg-ad2bs" class="${!bsMode ? 'active' : ''}">AD → BS</button>
        </div>
        ${bsMode ? `
        <div class="field"><label>${t('eventDate')}</label>
          <div class="field-row">
            <select id="cv-y">${years.map((y) => `<option ${+y === conv.getToday().bs.year ? 'selected' : ''}>${y}</option>`).join('')}</select>
            <select id="cv-m">${BS_MONTHS.en.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('')}</select>
            <select id="cv-d">${Array.from({ length: 32 }, (_, i) => `<option>${i + 1}</option>`).join('')}</select>
          </div>
        </div>` : `
        <div class="field"><label>AD</label><input type="date" id="cv-ad" value="${new Date().toISOString().slice(0, 10)}"></div>
        `}
        <button class="btn block" id="cv-go">${t('calc')}</button>
        <div id="cv-result"></div>
      </div>
    `;
  },

  events() {
    const list = state.events
      .map((e) => ({ ...e, du: eventDaysUntil(e) }))
      .sort((a, b) => (a.du ?? 9e9) - (b.du ?? 9e9));
    return `
      <button class="btn block" id="ev-add">➕ ${t('addEvent')}</button>
      <div class="card" style="margin-top:14px">
        ${list.length ? list.map((e) => `
          <div class="list-item">
            <div class="list-emoji">🔔</div>
            <div class="list-body">
              <div class="list-title">${esc(e.title)}</div>
              <div class="list-sub">${fmtNum(e.bs.d)} ${monthName(e.bs.m)} ${fmtNum(e.bs.y)}${e.note ? ' · ' + esc(e.note) : ''}</div>
            </div>
            <div class="list-meta">
              ${e.du !== null && e.du >= 0 ? `<span class="badge green">${I18N[state.lang].inDays(e.du)}</span>` : ''}
              <button class="icon-btn" data-del="${e.id}" style="margin-left:8px">🗑️</button>
            </div>
          </div>`).join('') : `<div class="empty">${t('noEvents')}</div>`}
      </div>
    `;
  },

  more() {
    const year = conv.getToday().bs.year;
    return `
      <div class="section-title">🧰 ${t('quickTools')}</div>
      <div class="grid-2">
        <div class="card">
          <div class="list-title" style="margin-bottom:10px">🎂 ${t('ageCalc')}</div>
          <div class="field"><label>${t('dob')}</label><input type="date" id="age-dob"></div>
          <button class="btn block secondary" id="age-go">${t('calc')}</button>
          <div id="age-result"></div>
        </div>
        <div class="card">
          <div class="list-title" style="margin-bottom:10px">📏 ${t('dateDiff')}</div>
          <div class="field"><label>${t('from')}</label><input type="date" id="diff-a" value="${new Date().toISOString().slice(0, 10)}"></div>
          <div class="field"><label>${t('to')}</label><input type="date" id="diff-b"></div>
          <button class="btn block secondary" id="diff-go">${t('calc')}</button>
          <div id="diff-result"></div>
        </div>
      </div>

      <div class="section-title">🎊 ${t('holidays')} — ${fmtNum(year)}</div>
      <div class="card">
        ${(Object.entries(HOLIDAYS[year] || {})).map(([key, h]) => {
          const [m, d] = key.split('-').map(Number);
          return `<div class="list-item" data-goto="${year}-${m}-${d}">
            <div class="list-emoji">${h.emoji}</div>
            <div class="list-body"><div class="list-title">${state.lang === 'np' ? h.name : h.nameEn}</div>
            <div class="list-sub">${fmtNum(d)} ${monthName(m)}</div></div>
          </div>`;
        }).join('')}
      </div>

      <div class="section-title">⚙️ ${t('settings')}</div>
      <div class="card">
        <div class="settings-row">
          <span class="list-title">🌙 ${t('theme')}</span>
          <input type="checkbox" id="set-theme" ${state.theme === 'dark' ? 'checked' : ''}>
        </div>
        <div class="settings-row">
          <span class="list-title">🇳🇵 ${t('language')}</span>
          <input type="checkbox" id="set-lang" ${state.lang === 'np' ? 'checked' : ''}>
        </div>
        <div class="settings-row">
          <span class="list-title">🔔 ${t('notify')}</span>
          <input type="checkbox" id="set-notify" ${store.get('notify', false) ? 'checked' : ''}>
        </div>
        <div class="settings-row">
          <button class="btn secondary" id="set-clear">🗑️ ${t('clear')}</button>
        </div>
        <div class="settings-row"><span class="list-sub">${t('about')}</span></div>
      </div>
    `;
  },
};

function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

/* ---------- View wiring ---------- */
function render() {
  $('#view-container').innerHTML = views[state.view]();
  $('#view-title').textContent = t(state.view === 'more' ? 'more' : state.view);
  $$('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === state.view));
  $$('.nav-label').forEach((el) => { el.textContent = t(el.dataset.i18n || el.closest('.nav-item')?.dataset.view); });
  bindView();
}

function bindView() {
  // tap any festival/holiday to jump to it in the calendar
  $$('[data-goto]').forEach((el) => el.addEventListener('click', () => {
    const [y, m, d] = el.dataset.goto.split('-').map(Number);
    if (!conv.isValidBSYear(y)) return;
    state.cal = { year: y, month: m };
    state.view = 'calendar';
    render();
    window.scrollTo({ top: 0 });
    const cell = $(`.cal-cell[data-day="${d}"]`);
    if (cell) { cell.classList.add('flash'); setTimeout(() => cell.classList.remove('flash'), 2600); }
  }));

  // live clock on the hero card
  clearInterval(bindView._clock);
  const clk = $('#hero-clock');
  if (clk) {
    const tick = () => { clk.textContent = new Date().toLocaleTimeString(state.lang === 'np' ? 'ne-NP' : 'en-US'); };
    tick();
    bindView._clock = setInterval(tick, 1000);
  }

  // home
  $('#copy-today')?.addEventListener('click', () => {
    const today = conv.getToday();
    const text = `${fmtBS(today.bs)} (${fmtBS(today.bs, { np: true })}) | ${fmtAD(new Date())}`;
    navigator.clipboard.writeText(text).then(() => toast(t('copied')));
  });
  $('#share-today')?.addEventListener('click', async () => {
    const today = conv.getToday();
    const text = `📅 ${fmtBS(today.bs)} | ${fmtAD(new Date())} — Miti`;
    if (navigator.share) { try { await navigator.share({ text }); } catch {} }
    else { navigator.clipboard.writeText(text).then(() => toast(t('copied'))); }
  });

  // calendar
  $('#cal-prev')?.addEventListener('click', () => stepMonth(-1));
  $('#cal-next')?.addEventListener('click', () => stepMonth(1));
  $('#cal-today')?.addEventListener('click', () => { state.cal = null; render(); });
  $('#cal-year')?.addEventListener('change', (e) => { state.cal.year = +e.target.value; render(); });
  $('#cal-month-sel')?.addEventListener('change', (e) => { state.cal.month = +e.target.value; render(); });
  $$('.cal-cell[data-day]').forEach((c) => c.addEventListener('click', () => openDayModal(+c.dataset.day)));
  // swipe on mobile
  const grid = $('.cal-grid');
  if (grid) {
    let x0 = null;
    grid.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    grid.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 60) stepMonth(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
  }

  // convert
  $('#seg-bs2ad')?.addEventListener('click', () => { state.convMode = 'bs2ad'; render(); });
  $('#seg-ad2bs')?.addEventListener('click', () => { state.convMode = 'ad2bs'; render(); });
  $('#cv-go')?.addEventListener('click', doConvert);

  // events
  $('#ev-add')?.addEventListener('click', openEventModal);
  $$('[data-del]').forEach((b) => b.addEventListener('click', () => {
    state.events = state.events.filter((e) => e.id !== b.dataset.del);
    saveEvents(); render();
  }));

  // tools
  $('#age-go')?.addEventListener('click', doAge);
  $('#diff-go')?.addEventListener('click', doDiff);

  // settings
  $('#set-theme')?.addEventListener('change', (e) => setTheme(e.target.checked ? 'dark' : 'light'));
  $('#set-lang')?.addEventListener('change', (e) => setLang(e.target.checked ? 'np' : 'en'));
  $('#set-notify')?.addEventListener('change', async (e) => {
    if (e.target.checked) {
      const perm = await Notification.requestPermission();
      store.set('notify', perm === 'granted');
      if (perm !== 'granted') { e.target.checked = false; toast('Notifications blocked'); }
      else { toast('🔔 OK'); checkEventNotifications(); }
    } else store.set('notify', false);
  });
  $('#set-clear')?.addEventListener('click', () => {
    if (confirm('Clear all Miti data?')) { localStorage.clear(); location.reload(); }
  });
}

function stepMonth(dir) {
  let { year, month } = state.cal;
  month += dir;
  if (month > 12) { month = 1; year++; }
  if (month < 1) { month = 12; year--; }
  if (!conv.isValidBSYear(year)) return;
  state.cal = { year, month };
  render();
}

/* ---------- Day modal ---------- */
function openDayModal(day) {
  const { year, month } = state.cal;
  const ad = conv.bsToAD(year, month, day);
  const hol = HolidayManager.getHoliday(year, month, day);
  const evs = eventsOn(year, month, day);
  openModal(`
    <h3>${fmtNum(day)} ${monthName(month)} ${fmtNum(year)}</h3>
    <div class="list-sub" style="margin-bottom:12px">${dayName(ad.getDay())} · ${fmtAD(ad)}</div>
    ${hol ? `<div class="hero-badge" style="background:var(--crimson-soft);color:var(--crimson)">${hol.emoji} ${state.lang === 'np' ? hol.name : hol.nameEn}</div>` : ''}
    ${evs.map((e) => `<div class="list-item"><div class="list-emoji">🔔</div><div class="list-body"><div class="list-title">${esc(e.title)}</div>${e.note ? `<div class="list-sub">${esc(e.note)}</div>` : ''}</div></div>`).join('')}
    <button class="btn block" id="modal-add-ev" style="margin-top:16px">➕ ${t('addEvent')}</button>
  `);
  $('#modal-add-ev').onclick = () => { closeModal(); openEventModal({ y: year, m: month, d: day }); };
}

/* ---------- Event modal ---------- */
function openEventModal(preset) {
  const today = conv.getToday().bs;
  const bs = preset || { y: today.year, m: today.month, d: today.day };
  const years = Object.keys(BS_CALENDAR_DATA);
  openModal(`
    <h3>➕ ${t('addEvent')}</h3>
    <div class="field"><label>${t('eventTitle')}</label><input type="text" id="ev-title" maxlength="60" style="width:100%;padding:10px 12px;border-radius:12px;background:var(--card);border:1px solid var(--border);color:var(--text)"></div>
    <div class="field"><label>${t('eventDate')}</label>
      <div class="field-row">
        <select id="ev-y">${years.map((y) => `<option ${+y === bs.y ? 'selected' : ''}>${y}</option>`).join('')}</select>
        <select id="ev-m">${BS_MONTHS.en.map((m, i) => `<option value="${i + 1}" ${i + 1 === bs.m ? 'selected' : ''}>${m}</option>`).join('')}</select>
        <select id="ev-d">${Array.from({ length: 32 }, (_, i) => `<option ${i + 1 === bs.d ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>
      </div>
    </div>
    <div class="field"><label>${t('eventNote')}</label><input type="text" id="ev-note" maxlength="120" style="width:100%;padding:10px 12px;border-radius:12px;background:var(--card);border:1px solid var(--border);color:var(--text)"></div>
    <div class="field-row">
      <button class="btn secondary" id="ev-cancel">${t('cancel')}</button>
      <button class="btn" id="ev-save">${t('save')}</button>
    </div>
  `);
  $('#ev-cancel').onclick = closeModal;
  $('#ev-save').onclick = () => {
    const title = $('#ev-title').value.trim();
    if (!title) { toast('⚠️ Title?'); return; }
    const y = +$('#ev-y').value, m = +$('#ev-m').value, d = +$('#ev-d').value;
    if (d > conv.getBSMonthDays(y, m)) { toast(`⚠️ Max ${conv.getBSMonthDays(y, m)} days`); return; }
    state.events.push({ id: 'e' + Math.random().toString(36).slice(2, 9), title, bs: { y, m, d }, note: $('#ev-note').value.trim() });
    saveEvents(); closeModal();
    state.view = 'events'; render();
    toast('✅ ' + t('save'));
  };
}

/* ---------- Converter / tools ---------- */
function doConvert() {
  const out = $('#cv-result');
  let main = '', sub = '';
  try {
    if (state.convMode === 'bs2ad') {
      const y = +$('#cv-y').value, m = +$('#cv-m').value, d = +$('#cv-d').value;
      const ad = conv.bsToAD(y, m, d);
      main = fmtAD(ad);
      sub = `${dayName(ad.getDay())} · ${toNp(d)} ${BS_MONTHS.np[m - 1]} ${toNp(y)}`;
    } else {
      const val = $('#cv-ad').value;
      if (!val) return;
      const [yy, mm, dd] = val.split('-').map(Number);
      const bs = conv.adToBS(new Date(yy, mm - 1, dd));
      main = fmtBS(bs);
      sub = `${dayName(bs.dayOfWeek)} · ${fmtBS(bs, { np: true })}`;
    }
    out.innerHTML = `<div class="result-card"><div class="result-main">${main}</div>
      <div class="result-sub">${sub}</div>
      <button class="btn secondary" id="cv-copy" style="margin-top:12px">📋 ${t('copy')}</button></div>`;
    $('#cv-copy').onclick = () => navigator.clipboard.writeText(`${main} (${sub})`).then(() => toast(t('copied')));
  } catch (e) {
    out.innerHTML = `<div class="result-card"><div class="result-sub">⚠️ ${e.message}</div></div>`;
  }
}

function doAge() {
  const val = $('#age-dob').value;
  const out = $('#age-result');
  if (!val) return;
  const [yy, mm, dd] = val.split('-').map(Number);
  const dob = new Date(yy, mm - 1, dd);
  const now = new Date();
  if (dob > now) { out.innerHTML = `<div class="result-card"><div class="result-sub">⚠️ Future date</div></div>`; return; }
  let y = now.getFullYear() - dob.getFullYear();
  let m = now.getMonth() - dob.getMonth();
  let d = now.getDate() - dob.getDate();
  if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  const total = Math.floor((now - dob) / 86400000);
  const next = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
  if (next < now) next.setFullYear(next.getFullYear() + 1);
  const nb = Math.ceil((next - now) / 86400000);
  let bsLine = '';
  try { const bs = conv.adToBS(dob); bsLine = `<div class="result-sub">BS: ${fmtBS(bs)}</div>`; } catch {}
  out.innerHTML = `<div class="result-card">
    <div class="result-main">${fmtNum(y)} ${t('yearsOld')} ${fmtNum(m)} ${t('months')} ${fmtNum(d)} ${t('days')}</div>
    ${bsLine}
    <div class="stat-row">
      <div class="stat"><b>${fmtNum(total)}</b><span>${t('totalDays')}</span></div>
      <div class="stat"><b>${fmtNum(Math.floor(total / 7))}</b><span>${t('weeks')}</span></div>
      <div class="stat"><b>${fmtNum(nb)}</b><span>${t('nextBirthday')} (${t('days')})</span></div>
    </div></div>`;
}

function doDiff() {
  const a = $('#diff-a').value, b = $('#diff-b').value;
  const out = $('#diff-result');
  if (!a || !b) return;
  const d1 = new Date(a), d2 = new Date(b);
  const days = Math.abs(Math.round((d2 - d1) / 86400000));
  out.innerHTML = `<div class="result-card">
    <div class="result-main">${fmtNum(days)} ${t('days')}</div>
    <div class="stat-row">
      <div class="stat"><b>${fmtNum(Math.floor(days / 7))}</b><span>${t('weeks')}</span></div>
      <div class="stat"><b>${fmtNum((days / 30.44).toFixed(1))}</b><span>${t('months')}</span></div>
      <div class="stat"><b>${fmtNum(days * 24)}</b><span>${t('hours')}</span></div>
    </div></div>`;
}

/* ---------- Theme / language ---------- */
function setTheme(theme, persist = true) {
  state.theme = theme;
  if (persist) store.set('theme', theme);
  document.documentElement.dataset.theme = theme;
  $('#theme-toggle').textContent = theme === 'dark' ? '🌙' : '☀️';
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#0D0D1A' : '#F4F4FA';
}
function setLang(lang) {
  state.lang = lang;
  store.set('lang', lang);
  $('#lang-toggle').textContent = lang === 'np' ? 'EN' : 'ने';
  render();
}

/* ---------- Notifications (event reminders) ---------- */
function checkEventNotifications() {
  if (!store.get('notify', false) || !('Notification' in window) || Notification.permission !== 'granted') return;
  const today = conv.getToday().bs;
  const key = `${today.year}-${today.month}-${today.day}`;
  if (store.get('notifiedOn') === key) return;
  const todayEvs = eventsOn(today.year, today.month, today.day);
  const hol = HolidayManager.getHoliday(today.year, today.month, today.day);
  const lines = [
    ...(hol ? [`${hol.emoji} ${hol.nameEn}`] : []),
    ...todayEvs.map((e) => `🔔 ${e.title}`),
  ];
  if (lines.length) {
    const title = `Miti — ${fmtBS(today)}`;
    const opts = { body: lines.join('\n'), icon: 'icons/icon-192.png' };
    // Android Chrome forbids page-context Notification; use the SW registration there
    navigator.serviceWorker?.getRegistration?.()
      .then((reg) => reg ? reg.showNotification(title, opts) : new Notification(title, opts))
      .catch(() => { try { new Notification(title, opts); } catch {} });
  }
  store.set('notifiedOn', key);
}

/* ---------- Boot ---------- */
function boot() {
  // Follow the phone/PC system theme unless the user picked one manually
  const mq = window.matchMedia('(prefers-color-scheme: light)');
  setTheme(state.theme || (mq.matches ? 'light' : 'dark'), state.theme !== null);
  mq.addEventListener('change', (e) => {
    if (store.get('theme', null) === null) { setTheme(e.matches ? 'light' : 'dark', false); render(); }
  });
  $('#lang-toggle').textContent = state.lang === 'np' ? 'EN' : 'ने';

  $$('.nav-item').forEach((b) => b.addEventListener('click', () => {
    state.view = b.dataset.view;
    location.hash = state.view;
    render();
    window.scrollTo({ top: 0 });
  }));
  $('#theme-toggle').addEventListener('click', () => setTheme(state.theme === 'dark' ? 'light' : 'dark'));
  $('#lang-toggle').addEventListener('click', () => setLang(state.lang === 'np' ? 'en' : 'np'));

  // deep link via hash (#calendar etc.)
  const hash = location.hash.slice(1);
  if (views[hash]) state.view = hash;

  // PWA install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredInstall = e;
    $('#install-btn').hidden = false;
  });
  $('#install-btn').addEventListener('click', async () => {
    if (!state.deferredInstall) return;
    state.deferredInstall.prompt();
    await state.deferredInstall.userChoice;
    state.deferredInstall = null;
    $('#install-btn').hidden = true;
  });

  // service worker with self-updating: check for a new deploy on launch,
  // every hour, and whenever the app comes back to the foreground; when a
  // new version activates, reload once so it takes effect immediately.
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      const check = () => reg.update().catch(() => {});
      check();
      setInterval(check, 60 * 60 * 1000);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
      let hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hadController) { toast('✨ New version — updating…'); setTimeout(() => location.reload(), 800); }
        hadController = true;
      });
    }).catch(() => {});
  }

  render();
  loadLiveHolidays();
  checkEventNotifications();

  // refresh "today" if the app stays open past midnight
  setInterval(() => {
    const today = conv.getToday().bs;
    const key = `${today.year}-${today.month}-${today.day}`;
    if (boot._dayKey && boot._dayKey !== key && state.view === 'home') render();
    boot._dayKey = key;
    checkEventNotifications();
  }, 60000);
}

document.addEventListener('DOMContentLoaded', boot);
