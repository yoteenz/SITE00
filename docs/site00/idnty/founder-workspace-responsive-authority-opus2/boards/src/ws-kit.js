// Responsive founder-workspace kit (Opus 2). Emits ws- markup (ws.css). One markup per page; CSS decides the tier.
// Icons, objects and commercial config come from source via window.__DF (render-boards.mjs / audit-layout.mjs).
// Client identities are the fictional OPUS1 DEMO set — never real clients, never "Anthony".
import { DF, icon as dfIcon, DEMO as BASE, SYNTH as BASE_SYNTH, PHASES, money } from '../../../founder-workspace-visual-authority-opus1/boards/src/fw-kit.js';

export { DF, PHASES, money };

export const icon = (name, cls = '', attrs = '') => dfIcon(name, cls, attrs);
export const ARROW = '<svg class="ws-arrow" viewBox="0 0 24 12" aria-hidden="true"><path d="M1 6h21m-5-5 5 5-5 5"/></svg>';
export const CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
export const PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
export const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
export const SORT = '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:12px;height:12px"><path d="m7 10 5-5 5 5M7 14l5 5 5-5"/></svg>';
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// ─── Fictional data (extends the OPUS1 DEMO set with intake + owner fields) ─────────────
const INTAKE = {
  'Horizon Freight': ['COMPLETE', 'OCT 14 · 12 ANSWERS'],
  'Carter & Lane': ['COMPLETE', 'OCT 12 · 11 ANSWERS'],
  'Atelier Bloom': ['IN PROGRESS', 'DOMAIN · SAVED 2H AGO'],
  'Summit Wellness': ['COMPLETE', 'OCT 08 · 12 ANSWERS'],
  'Field & Ember': ['COMPLETE', 'SEP 29 · 12 ANSWERS'],
  'Vela Boutique': ['COMPLETE', 'SEP 24 · 10 ANSWERS'],
  'Avery Studio': ['NOT STARTED', 'LINK NOT YET OPENED'],
  'Nova Creative': ['COMPLETE', 'AUG 30 · 12 ANSWERS'],
};
const strip = (next) => next.replace(/^CLIENT TO /, '');
export const DEMO = BASE.map((c) => ({ ...c, intake: INTAKE[c.name], action: strip(c.next) }));
export const SYNTH = { ...BASE_SYNTH, who: 'CLIENT', next: 'CLIENT TO FINISH INTAKE', action: 'FINISH INTAKE', last: '1H AGO', intake: ['IN PROGRESS', 'SERVICES · SAVED 1H AGO'] };
export const byName = (n) => DEMO.find((c) => c.name === n);

// ─── Primitives ─────────────────────────────────────────────────────────────
export const mk = (k) => `<span class="ws-mk ws-mk--${k}" aria-hidden="true"></span>`;
export const st = (k, text) => `<span class="ws-st ws-st--${k}">${mk(k)}<span>${text}</span></span>`;
export const chip = (k, text, ic = '') => `<span class="ws-chip ws-chip--${k}">${ic ? icon(ic) : ''}${text}</span>`;
export const count = (n, tone = '') => `<span class="ws-count ${tone ? `ws-count--${tone}` : ''}">${n}</span>`;
export const gap = (id) => `<span class="ws-gapmark" title="Backend dependency ${id}">${id}</span>`;
export const kbd = (k) => `<span class="ws-kbd">${k}</span>`;

export function btn(label, { tone = '', size = '', block = false, ic = '', arrow = false, only = false, aria = '', attrs = '' } = {}) {
  const cls = ['ws-btn', tone && `ws-btn--${tone}`, size && `ws-btn--${size}`, block && 'ws-btn--block', only && 'ws-btn--icon'].filter(Boolean).join(' ');
  const inner = only ? icon(ic) : `${ic ? icon(ic) : ''}<span>${label}</span>${arrow ? ARROW : ''}`;
  return `<button class="${cls}" ${only || aria ? `aria-label="${esc(aria || label)}"` : ''} ${attrs}>${inner}</button>`;
}
export const iconbtn = (ic, label, dot = false) => `<button class="ws-iconbtn" aria-label="${label}">${icon(ic)}${dot ? '<span class="ws-iconbtn__dot"></span>' : ''}</button>`;

export function plate(name, { attn = false, test = false, size = '' } = {}) {
  const init = name.replace(/^SYNTH · /, 'S ').replace(/[^A-Za-z0-9 &]/g, '').split(/\s+|&/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return `<span class="ws-plate ${attn ? 'ws-plate--attn' : ''} ${test ? 'ws-plate--test' : ''} ${size ? `ws-plate--${size}` : ''}" aria-hidden="true">${init}</span>`;
}
export const ident = (c, { size = 'sm', sub = c.cat } = {}) =>
  `<span class="ws-ident">${plate(c.name, { attn: c.k === 'founder', test: c.test, size })}<span class="ws-who"><b title="${esc(c.name)}">${c.name}</b><span>${sub}</span></span></span>`;

export const seg = (phase, k, cls = '') =>
  `<span class="ws-seg ${cls}" role="img" aria-label="STEP ${phase + 1} OF 8">${PHASES.map((_, i) => `<i class="${i < phase ? 'd' : i === phase ? (k === 'founder' ? 'c' : k === 'blocked' ? 'b' : 'd') : ''}"></i>`).join('')}</span>`;

export const SHORT = ['INV', 'INT', 'REC', 'QTE', 'PAY', 'SET', 'VER', 'DONE'];
export function journey(cur, { kind = 'cur', dates = [], abbr = false, auto = false } = {}) {
  return `<ol class="ws-journey ${abbr ? 'ws-journey--abbr' : ''} ${auto ? 'ws-journey--auto' : ''}" aria-label="CLIENT JOURNEY · STEP ${cur + 1} OF 8">${PHASES.map((l, i) => {
    const s = i < cur ? 'done' : i === cur ? kind : 'fut';
    const inner = s === 'done' ? CHECK : s === 'blocked' ? '!' : String(i + 1).padStart(2, '0');
    return `<li class="ws-jn ws-jn--${s}" ${i === cur ? 'aria-current="step"' : ''}><span class="ws-jn__n">${inner}</span><span class="ws-jn__l"><span class="f">${l}</span><span class="s" aria-hidden="true">${SHORT[i]}</span></span>${dates.length ? `<span class="ws-jn__d">${dates[i] || '—'}</span>` : ''}</li>`;
  }).join('')}</ol>`;
}

export const tabs = (items, on = 0, { fit = false, label = 'SECTIONS' } = {}) =>
  `<div class="ws-tabs ${fit ? 'ws-tabs--fit' : ''}" role="tablist" aria-label="${label}">${items
    .map((t, i) => {
      const [l, n] = Array.isArray(t) ? t : [t];
      return `<span class="ws-tab ${i === on ? 'ws-tab--on' : ''}" role="tab" aria-selected="${i === on}">${l}${n ? count(n, i === on ? '' : 'ink') : ''}</span>`;
    })
    .join('')}</div>`;

export const segctl = (items, on = 0, block = false) => `<div class="ws-segctl ${block ? 'ws-segctl--block' : ''}" role="radiogroup">${items.map((t, i) => `<span class="${i === on ? 'on' : ''}" role="radio" aria-checked="${i === on}">${t}</span>`).join('')}</div>`;

export const kv = (rows) => `<dl style="margin:0">${rows.map(([k, v, data]) => `<div class="ws-kv"><dt>${k}</dt><dd class="${data ? 'ws-data' : ''}">${v}</dd></div>`).join('')}</dl>`;

export const act = (time, k, text, sub = '') => `<div class="ws-act"><time>${time}</time>${mk(k)}<p>${text}${sub ? `<span>${sub}</span>` : ''}</p></div>`;

export function field({ label, value = '', ph = '', state = '', err = '', hint = '', opt = false, req = false, data = false, area = false }) {
  const focus = state.includes('focus');
  return `<div class="ws-field"><span class="ws-field__l">${focus || err ? mk('founder') : ''}${label}${req ? '<span class="req" aria-hidden="true">*</span>' : ''}${opt ? '<span class="opt">OPTIONAL</span>' : ''}</span><span class="ws-input ${value ? '' : 'ws-input--ph'} ${focus ? 'ws-input--focus' : ''} ${err ? 'ws-input--err' : ''} ${state.includes('ro') ? 'ws-input--ro' : ''} ${area ? 'ws-input--area' : ''}">${
    value ? `<span class="${data ? 'ws-data' : ''}">${value}</span>` : ph
  }</span>${err ? `<span class="ws-err">${mk('founder')}${err}</span>` : ''}${hint ? `<span class="ws-hint">${hint}</span>` : ''}</div>`;
}

export const banner = (text, { tone = '', ic = '' } = {}) => `<div class="ws-banner ${tone ? `ws-banner--${tone}` : ''}" role="${tone === 'red' ? 'alert' : 'status'}">${ic ? icon(ic) : ''}<span>${text}</span></div>`;
export const arch = (which, style) => `<span class="ws-arch" aria-hidden="true" style="${style}">${DF.objects[which]}</span>`;
export const panel = (title, body, { right = '', flush = false, cls = '' } = {}) =>
  `<section class="ws-panel ${cls}"><div class="ws-panel__h"><h2 class="ws-h3">${title}</h2>${right}</div><div class="ws-panel__b ${flush ? 'ws-panel__b--flush' : ''}">${body}</div></section>`;

// ─── Shell ──────────────────────────────────────────────────────────────────
export const NAV = [
  { id: 'overview', n: '01', label: 'OVERVIEW', m: 'HOME', icon: 'home' },
  { id: 'foundations', n: '02', label: 'FOUNDATIONS', m: 'FOUNDATIONS', icon: 'users' },
  { id: 'reviews', n: '03', label: 'REVIEWS', m: 'REVIEWS', icon: 'approval' },
  { id: 'operations', n: '04', label: 'OPERATIONS', m: 'OPS', icon: 'checklist' },
  { id: 'correspondence', n: '05', label: 'CORRESPONDENCE', m: 'MAIL', icon: 'email' },
  { id: 'system', n: '06', label: 'SYSTEM', m: 'SYSTEM', icon: 'server' },
];
const BADGE = { reviews: 4 };

export const brand = (env = 'STAGING') => `<span class="ws-brand"><b>SITE 00</b><span>FOUNDER <span class="ws-env">${env}</span></span></span>`;

function sidebar(active) {
  const items = NAV.map(
    (n) => `<li><a class="ws-side__i ${active === n.id ? 'ws-side__i--on' : ''}" ${active === n.id ? 'aria-current="page"' : ''}><span class="ws-idx">${n.n}</span><i></i><span>${n.label}</span>${BADGE[n.id] ? count(BADGE[n.id]) : ''}</a></li>`,
  ).join('');
  return `<div class="ws-side">${brand()}
    <div class="ws-side__create">${btn('NEW FOUNDATION', { tone: 'red', block: true, ic: 'add', attrs: 'data-anchor="create"' })}</div>
    <ul class="ws-side__list">${items}</ul>
    <div class="ws-side__sep"></div>
    <a class="ws-side__tool">${icon('checklist')}<span>READINESS DESK</span>${icon('external')}</a>
    <a class="ws-side__tool">${icon('email')}<span>CORRESPONDENCE STUDIO</span>${icon('external')}</a>
    <div class="ws-side__foot" data-anchor="account"><span class="ws-plate ws-plate--xs" aria-hidden="true">K</span><span class="ws-who"><b style="font-size:12px">FOUNDER</b><span>ADMIN · SIGNED IN</span></span><span style="margin-left:auto;color:var(--ws-muted)">${icon('more', '', 'style="width:18px;height:18px"')}</span></div>
  </div>`;
}

function rail(active) {
  return `<div class="ws-rail"><span class="ws-plate ws-plate--xs" aria-hidden="true">00</span>
    <a class="ws-rail__create" data-anchor="create"><span>${PLUS}</span>NEW</a>
    ${NAV.map((n) => `<a class="ws-rail__i ${active === n.id ? 'ws-rail__i--on' : ''}" ${active === n.id ? 'aria-current="page"' : ''} aria-label="${n.label}">${icon(n.icon)}<span>${n.m}</span>${BADGE[n.id] ? count(BADGE[n.id]) : ''}</a>`).join('')}
    <span class="ws-rail__foot" data-anchor="account"><span class="ws-plate ws-plate--xs" aria-hidden="true">K</span></span></div>`;
}

function bnav(active) {
  const item = (n) => `<a class="ws-bnav__i ${active === n.id ? 'ws-bnav__i--on' : ''}" ${active === n.id ? 'aria-current="page"' : ''}>${icon(n.icon)}${n.m}${BADGE[n.id] ? count(BADGE[n.id]) : ''}</a>`;
  return `<nav class="ws-bnav" aria-label="PRIMARY">${item(NAV[0])}${item(NAV[1])}<a class="ws-bnav__c" data-anchor="create-m"><span>${PLUS}</span>CREATE</a>${item(NAV[2])}${item(NAV[5])}</nav>`;
}

function topbar({ crumb, back, search }) {
  const n = crumb[0];
  const parts = crumb.slice(1);
  const trail = parts.map((p, i) => (i < parts.length - 1 ? `<a>${p}</a><span class="sep">/</span>` : `<span class="cur">${p}</span>`)).join('');
  const m = back
    ? `<div class="ws-top__m">${iconbtn('back', 'BACK')}<span class="ws-label" style="letter-spacing:.2em">${back}</span>${iconbtn('more', 'MORE ACTIONS')}</div>`
    : `<div class="ws-top__m">${brand()}<span class="ws-top__acts">${iconbtn('search', 'SEARCH')}${iconbtn('notification', 'NOTIFICATIONS', true)}${iconbtn('menu', 'MENU')}</span></div>`;
  return `<header class="ws-top">${m}
    <div class="ws-top__d"><nav class="ws-crumb" aria-label="BREADCRUMB"><b>${n}</b><i></i>${trail}</nav>
      <span class="ws-search ws-search--top ${search ? 'ws-search--focus' : ''}" data-anchor="search">${icon('search')}<span>${search || 'SEARCH CLIENTS, REVIEWS, TASKS'}</span>${kbd('⌘K')}</span>
      <span data-anchor="bell">${iconbtn('notification', 'NOTIFICATIONS · 4 NEW', true)}</span></div></header>`;
}

/** Full workspace frame. `insp` = inspector markup (docked or sheet by width). */
export function app({ active, crumb, back = '', body, insp = '', density = 'standard', search = '', after = '' }) {
  return `<div class="ws-app ${insp ? 'ws-app--insp' : ''}">
    <nav class="ws-nav" aria-label="PRIMARY">${sidebar(active)}${rail(active)}</nav>
    ${topbar({ crumb, back, search })}
    <main class="ws-stage ws-${density}" id="stage">${body}</main>
    ${insp ? `<aside class="ws-insp ws-${density}" aria-label="INSPECTOR">${insp}</aside>` : ''}
    ${bnav(active)}
  </div>${after}`;
}

export function phead({ n, title, sub = '', acts = '', archHtml = '', mHideActs = false }) {
  return `<header class="ws-phead ${mHideActs ? 'ws-phead--m-hide-acts' : ''}">${archHtml}<div><div class="ws-phead__rail"><b>${n}</b><span></span></div><h1 class="ws-title">${title}<i aria-hidden="true"></i></h1>${sub ? `<div class="ws-meta ws-phead__sub">${sub}</div>` : ''}</div>${acts ? `<div class="ws-phead__acts">${acts}</div>` : ''}</header>`;
}

export const inspHead = (kicker, inner, { ext = true } = {}) =>
  `<div class="ws-insp__head"><div class="ws-insp__bar"><span class="ws-label">${kicker}</span><span style="display:flex">${ext ? iconbtn('external', 'OPEN IN FULL') : ''}${iconbtn('close', 'CLOSE INSPECTOR')}</span></div>${inner}</div>`;
