// Founder workspace board kit. Emits fw- proposal markup (fw.css) inside board chrome (board.css).
// Real values come from window.__DF (loaded from source by render-boards.mjs). Client identities are fictional DEMO data.

export const DF = window.__DF;

export function icon(name, cls = '', attrs = '') {
  const id = DF.aliases[name] ?? name;
  const raw = DF.glyphs[id];
  if (!raw) throw new Error(`unknown DF icon ${name}`);
  const markup = raw.split('{{step}}').join('').split('{{progress}}').join('8');
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" ${attrs}>${markup}</svg>`;
}
export const ARROW = '<svg viewBox="0 0 24 12" aria-hidden="true"><path d="M1 6h21m-5-5 5 5-5 5"/></svg>';
export const CHEV = '<svg class="fw-row__chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
export const PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
export const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
export const money = (minor, cur = DF.config.base_currency) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(minor / 100);

// ─── Board chrome ─────────────────────────────────────────────────────────────
const st = (kind, text) => `<span class="st st--${kind}">${text}</span>`;
export const S = {
  locked: (t = 'LOCKED') => st('locked', t),
  impl: (t = 'IMPLEMENTED') => st('implemented', t),
  ref: (t = 'FOUNDER REFERENCE') => st('locked', t),
  prop: (t = 'PROPOSED') => st('proposed', t),
  alt: (t = 'ALTERNATIVE') => st('alt', t),
  con: (t = 'TECHNICAL CONSTRAINT') => st('constraint', t),
  dec: (t = 'FOUNDER DECISION') => st('decision', t),
  unres: (t = 'UNRESOLVED') => st('unresolved', t),
  dep: (t = 'DEPENDS ON PERSISTENCE FIX') => st('constraint', t),
  gap: (t = 'DATA GAP') => st('unresolved', t),
  rec: (t = 'OPUS RECOMMENDS') => st('rec', t),
};

export function header({ num, title, sub, round }) {
  return `
  <header class="bd-head">
    <div class="bd-num">${num}</div>
    <div>
      <div class="bd-kicker">SITE 00 / IDNTY / FOUNDER WORKSPACE / VISUAL AUTHORITY${round ? ` / REVIEW ROUND ${round}` : ''}</div>
      <h1 class="bd-title">${title}<i></i></h1>
    </div>
    <div class="bd-meta">SPRINT P0.SITE00.IDNTY.FOUNDER-WORKSPACE.VISUAL-AUTHORITY-OPUS1<br>FOUNDER REFERENCES: 6 MOBILE SCREENS (ATTACHED)<br>STATUS — PROPOSED · FOUNDER REVIEW REQUIRED</div>
  </header>
  <div class="bd-legend">${S.locked('LOCKED — APPROVED')} ${S.ref('FOUNDER REFERENCE')} ${S.impl()} ${S.prop()} ${S.alt()} ${S.con()} ${S.gap()} ${S.dec()} ${S.unres()}</div>
  <p class="bd-sub">${sub ?? ''} <b>Client names, counts and times on this board are fictional DEMO values</b> used to show layout; production values come only from the data contracts in DATA_CONTRACT_MAPPING.md.</p>`;
}

export const section = (n, title, inner, chips = '') =>
  `<section class="bd-section"><h2 class="bd-h2"><b>${n}</b>${title}<span class="bd-rule"></span>${chips}</h2>${inner}</section>`;

export const frame = ({ title, chips = '', body, note = '', width }) =>
  `<div class="bd-frame" ${width ? `style="width:${width}px"` : ''}><div class="bd-cap"><span class="bd-cap__t">${title}</span><span>${chips}</span></div>${body}${note ? `<div class="bd-note">${note}</div>` : ''}</div>`;

export const foot = (left, right) => `<div class="bd-foot"><span>${left}</span><span>${right}</span></div>`;

// ─── Devices ─────────────────────────────────────────────────────────────────
export function phone({ body, nav, overlay = '', h = 844, w = 390, label }) {
  return `<div class="bd-device" style="width:${w + 2}px">
    <div class="bd-device__bar"><b>${label ?? `IPHONE SAFARI · ${w} × ${h}`}</b><span>FOUNDER WORKSPACE</span></div>
    <div class="fw" style="position:relative;height:${h}px;overflow:hidden;background:var(--fw-page)">
      <div style="height:${h - (nav === false ? 0 : 84)}px;overflow:hidden">${body}</div>
      ${nav === false ? '' : mnav(nav ?? 'home')}
      ${overlay}
    </div></div>`;
}

export function desktop({ body, active = 'overview', inspector = '', w = 1440, h = 900, label, rail = false, overlay = '' }) {
  return `<div class="bd-device" style="width:${w + 2}px">
    <div class="bd-device__bar"><b>${label ?? `DESKTOP · ${w} × ${h}`}</b><span>FOUNDER WORKSPACE</span></div>
    <div class="fw" style="position:relative;height:${h}px;overflow:hidden">
      <div class="fw-desk ${inspector ? 'fw-desk--insp' : ''} ${rail ? 'fw-desk--rail' : ''}">
        ${rail ? railnav(active) : sidebar(active)}
        <div class="fw-main">${body}</div>
        ${inspector ? `<aside class="fw-insp">${inspector}</aside>` : ''}
      </div>
      ${overlay}
    </div></div>`;
}

// ─── Shell ───────────────────────────────────────────────────────────────────
export const NAV = [
  { id: 'overview', n: '01', label: 'OVERVIEW', m: 'HOME', icon: 'home' },
  { id: 'foundations', n: '02', label: 'FOUNDATIONS', m: 'FOUNDATIONS', icon: 'users' },
  { id: 'reviews', n: '03', label: 'REVIEWS', m: 'REVIEWS', icon: 'review' },
  { id: 'operations', n: '04', label: 'OPERATIONS', m: 'OPERATIONS', icon: 'checklist' },
  { id: 'correspondence', n: '05', label: 'CORRESPONDENCE', m: 'MAIL', icon: 'email' },
  { id: 'system', n: '06', label: 'SYSTEM', m: 'SYSTEM', icon: 'server' },
];

export function brand(env = 'STAGING') {
  return `<span class="fw-brand"><b>SITE 00</b><span>FOUNDER ${env ? `<span class="fw-env">${env}</span>` : ''}</span></span>`;
}

export function mhead({ dot = true, back = false, more = false } = {}) {
  if (back)
    return `<div class="fw-mhead"><span class="fw-iconbtn">${icon('back')}</span><span class="fw-label" style="letter-spacing:.24em">${back === true ? '' : back}</span><span class="fw-iconbtn">${icon('more')}</span></div>`;
  return `<div class="fw-mhead">${brand()}<span class="fw-mhead__acts"><span class="fw-iconbtn">${icon('search')}</span><span class="fw-iconbtn">${icon('notification')}${dot ? '<span class="fw-iconbtn__dot"></span>' : ''}</span><span class="fw-iconbtn">${icon('menu')}</span></span></div>`;
}

export function mtitle({ n, title, sub, arch = '' }) {
  return `<div class="fw-mtitle">${arch}<div class="fw-rail"><b>${n}</b><span></span></div><h1 class="fw-h1">${title}<i></i></h1>${sub ? `<div class="fw-sub">${sub}</div>` : ''}</div>`;
}

export function mnav(active, badges = { reviews: 3 }) {
  const item = (n) =>
    `<span class="fw-mnav__i ${active === n.id ? 'fw-mnav__i--on' : ''}">${icon(n.icon)}${n.m}${badges[n.id] ? `<span class="fw-mnav__badge">${badges[n.id]}</span>` : ''}</span>`;
  return `<nav class="fw-mnav">${item(NAV[0])}${item(NAV[1])}<span class="fw-create"><span class="fw-create__btn">${PLUS}</span>CREATE</span>${item(NAV[2])}${item(NAV[5])}</nav>`;
}

export function sidebar(active, { reviews = 3 } = {}) {
  const items = NAV.map(
    (n) =>
      `<li class="fw-side__i ${active === n.id ? 'fw-side__i--on' : ''}"><span class="fw-idx">${n.n}</span><span class="c"></span><span>${n.label}</span>${
        n.id === 'reviews' && reviews ? `<span class="fw-chip fw-chip--count">${reviews}</span>` : ''
      }</li>`,
  ).join('');
  return `<nav class="fw-side">${brand()}
    <button class="fw-btn fw-btn--red fw-btn--block" style="margin-top:26px">${PLUS.replace('<svg', '<svg style="width:16px;height:16px"')}NEW FOUNDATION</button>
    <ul class="fw-side__nav">${items}</ul>
    <div class="fw-side__sep"></div>
    <div class="fw-side__i"><span class="fw-idx">—</span><span class="c"></span><span>READINESS DESK</span></div>
    <div class="fw-side__i"><span class="fw-idx">—</span><span class="c"></span><span>CORRESPONDENCE STUDIO</span></div>
    <div class="fw-side__foot"><span class="fw-plate fw-plate--sm">K</span><span class="fw-who"><b style="font-size:9px">FOUNDER</b><span>ADMIN · SIGNED IN</span></span></div>
  </nav>`;
}

export function railnav(active) {
  return `<nav class="fw-railnav"><span class="fw-plate fw-plate--sm" style="margin-bottom:12px">00</span><span class="fw-create__btn" style="margin-bottom:10px">${PLUS}</span>${NAV.map(
    (n) => `<span class="fw-railnav__i ${active === n.id ? 'fw-railnav__i--on' : ''}">${icon(n.icon)}${n.n}</span>`,
  ).join('')}</nav>`;
}

export function topbar({ n, title, search = 'SEARCH CLIENTS, REVIEWS, TASKS', focus = false, extra = '' }) {
  return `<div class="fw-top"><div class="fw-rail" style="margin:0"><b>${n}</b><span style="flex-basis:32px"></span><em>${title}</em></div>
    <span class="fw-search ${focus ? 'fw-search--focus' : ''}" style="margin-left:auto;width:340px">${icon('search')}${search}<kbd>⌘K</kbd></span>
    ${extra}<span class="fw-iconbtn">${icon('notification')}<span class="fw-iconbtn__dot"></span></span></div>`;
}

// ─── Status language ────────────────────────────────────────────────────────
export const mk = (k) => `<span class="fw-mk fw-mk--${k}"></span>`;
export const status = (k, text) => `<span class="fw-st ${k === 'founder' || k === 'blocked' ? 'fw-st--founder' : k === 'done' || k === 'idle' ? 'fw-st--muted' : ''}">${mk(k)}${text}</span>`;
export const chip = (k, text, ic = '') => `<span class="fw-chip fw-chip--${k}">${ic ? icon(ic) : ''}${text}</span>`;
export const btn = (label, { tone = '', arrow = true, sm = false, block = false, focus = false, ic = '' } = {}) =>
  `<span class="fw-btn ${tone ? `fw-btn--${tone}` : ''} ${sm ? 'fw-btn--sm' : ''} ${block ? 'fw-btn--block' : ''} ${focus ? 'fw-btn--focus' : ''}">${ic ? icon(ic, '', 'style="width:15px;height:15px"') : ''}${label}${arrow && tone !== 'ghost' ? ARROW : ''}</span>`;

export const plate = (name, { attn = false, test = false, size = '' } = {}) => {
  const init = name
    .replace(/[^A-Za-z0-9 &]/g, '')
    .split(/\s+|&/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  return `<span class="fw-plate ${attn ? 'fw-plate--attn' : ''} ${test ? 'fw-plate--test' : ''} ${size ? `fw-plate--${size}` : ''}">${init}</span>`;
};

export const prog = (pct, founder = false) => `<div class="fw-prog ${founder ? 'fw-prog--founder' : ''}"><i style="width:${pct}%"></i></div>`;
export const seg = (states) => `<div class="fw-seg">${states.map((s) => `<i class="${s}"></i>`).join('')}</div>`;

export const PHASES = ['INVITED', 'INTAKE', 'RECOMMEND', 'QUOTE', 'PAYMENT', 'SETUP', 'VERIFY', 'COMPLETE'];
export function journey(cur, { labels = PHASES, dates = [], kind = 'cur', blockedAt = -1 } = {}) {
  return `<ol class="fw-journey">${labels
    .map((l, i) => {
      const s = i === blockedAt ? 'blocked' : i < cur ? 'done' : i === cur ? kind : 'fut';
      const inner = s === 'done' ? CHECK : s === 'blocked' ? '!' : String(i + 1).padStart(2, '0');
      return `<li class="fw-jn fw-jn--${s}"><span class="fw-jn__n">${inner}</span><span class="fw-jn__l">${l}</span>${dates[i] !== undefined ? `<span class="fw-jn__d">${dates[i] || '—'}</span>` : ''}</li>`;
    })
    .join('')}</ol>`;
}

export const tabs = (items, on = 0) =>
  `<div class="fw-tabs">${items
    .map((t, i) => {
      const [label, count] = Array.isArray(t) ? t : [t];
      return `<span class="fw-tab ${i === on ? 'fw-tab--on' : ''}">${label}${count ? `<span class="fw-chip fw-chip--count">${count}</span>` : ''}</span>`;
    })
    .join('')}</div>`;

export const segctl = (items, on = 0) => `<div class="fw-segctl">${items.map((t, i) => `<span class="${i === on ? 'on' : ''}">${t}</span>`).join('')}</div>`;

export const kv = (rows) => `<dl style="margin:0">${rows.map(([k, v, data]) => `<div class="fw-kv"><dt>${k}</dt><dd class="${data ? 'fw-data' : ''}">${v}</dd></div>`).join('')}</dl>`;

export const nrow = (ic, title, sub = '', side = '') => `<div class="fw-nrow">${icon(ic)}<span class="fw-nrow__t"><b>${title}</b>${sub ? `<span>${sub}</span>` : ''}</span><span>${side}</span>${CHEV}</div>`;

export const act = (time, k, text, sub = '') => `<div class="fw-act"><time>${time}</time>${mk(k)}<p>${text}${sub ? `<br><span>${sub}</span>` : ''}</p></div>`;

export const field = ({ label, value = '', ph = '', state = '', err = '', hint = '', opt = false, data = false }) =>
  `<div class="fw-field"><span class="fw-field__l">${state.includes('focus') || err ? mk('founder') : ''}${label}${opt ? '<span class="opt">OPTIONAL</span>' : ''}</span><span class="fw-input ${value ? '' : 'fw-input--ph'} ${state.includes('focus') ? 'fw-input--focus' : ''} ${err ? 'fw-input--err' : ''} ${state.includes('ro') ? 'fw-input--ro' : ''}">${
    value ? `<span class="${data ? 'fw-data' : ''}">${value}</span>` : ph
  }</span>${err ? `<span class="fw-err">${mk('founder')}${err}</span>` : ''}${hint ? `<span class="fw-hint">${hint}</span>` : ''}</div>`;

export const arch = (which, style) => `<span class="fw-arch" style="${style}">${DF.objects[which]}</span>`;

// ─── Demo identities (fictional; never real clients) ─────────────────────────
export const DEMO = [
  // Fictional: founder-reference businesses + the FNDATN-01 fixture (Avery Studio). Never real clients.
  { name: 'Horizon Freight', cat: 'TRANSPORTATION + LOGISTICS', phase: 2, state: 'INTAKE COMPLETE', k: 'founder', who: 'FOUNDER', next: 'REVIEW INTAKE', last: '1D AGO', email: 'ops@horizon-freight.invalid' },
  { name: 'Carter & Lane', cat: 'REAL ESTATE', phase: 3, state: 'QUOTE READY', k: 'founder', who: 'FOUNDER', next: 'APPROVE QUOTE', last: '3H AGO', email: 'hello@carterlane.invalid' },
  { name: 'Atelier Bloom', cat: 'CREATIVE + MEDIA', phase: 1, state: 'INTAKE IN PROGRESS', k: 'client', who: 'CLIENT', next: 'CLIENT TO FINISH INTAKE', last: '2H AGO', email: 'studio@atelierbloom.invalid' },
  { name: 'Summit Wellness', cat: 'HEALTH + WELLNESS', phase: 3, state: 'QUOTE SENT', k: 'client', who: 'CLIENT', next: 'CLIENT TO ACCEPT QUOTE', last: '2D AGO', email: 'care@summitwellness.invalid' },
  { name: 'Field & Ember', cat: 'FOOD + HOSPITALITY', phase: 5, state: 'SETUP · DNS + SECURITY', k: 'work', who: 'SITE 00', next: 'CONFIGURE DKIM', last: '40M AGO', email: 'kitchen@fieldember.invalid' },
  { name: 'Vela Boutique', cat: 'RETAIL + E-COMMERCE', phase: 5, state: 'BLOCKED · DOMAIN ACCESS', k: 'blocked', who: 'CLIENT', next: 'CLIENT TO AUTHORIZE REGISTRAR', last: '4D AGO', email: 'shop@velaboutique.invalid' },
  { name: 'Avery Studio', cat: 'CREATIVE + MEDIA', phase: 0, state: 'INVITED', k: 'client', who: 'CLIENT', next: 'CLIENT TO OPEN LINK', last: '5H AGO', email: 'jordan@avery-studio.invalid' },
  { name: 'Nova Creative', cat: 'CREATIVE + MEDIA', phase: 7, state: 'COMPLETE', k: 'done', who: '—', next: 'RECORDS DELIVERED', last: 'OCT 09', email: 'team@novacreative.invalid' },
];
export const SYNTH = { name: 'SYNTH · Founder E2E Client', cat: 'TEST CLIENT', phase: 1, state: 'INTAKE IN PROGRESS', k: 'client', test: true, email: 'founder-test@site00.invalid' };

export function mount(html) {
  document.getElementById('board').innerHTML = html;
  document.fonts.ready.then(() => (document.body.dataset.ready = '1'));
}
