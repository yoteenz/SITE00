// YOUR FOUNDATION — specimen kit: icons, frame, hero, shared fictional client, lifecycle → client-stage mapping.
// Icons, threshold objects and commercial config arrive from source via window.__DF (boards/lib.mjs).
// Nothing here is imported by the application.

const DF = window.__DF;

export const ic = (id, cls = 'i') => {
  const g = DF.glyphs[DF.aliases[id] ?? id] ?? DF.glyphs.info;
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${g.replace(/\{\{step\}\}/g, '').replace(/\{\{progress\}\}/g, '0')}</svg>`;
};

/** Fictional illustrative client. Never a real business. No secrets: the reference is a display code, not a credential. */
export const C = {
  biz: 'NORTHLINE TRANSPORT LLC',
  short: 'NORTHLINE TRANSPORT',
  contact: 'MAREN OKAFOR',
  email: 'M•••@NORTHLINE-TRANSPORT.INVALID',
  ref: 'DF-7Q4M-K2',
  received: 'OCT 14 · 4:12 PM',
  quote: 'V2',
};

/** The seven client stages (sprint §roadmap). Labels are client language; keys map to canonical artifact states. */
export const STAGES = [
  { k: 'intake', n: 'INTAKE RECEIVED', s: 'YOUR REQUIREMENTS ARE WITH SITE 00.' },
  { k: 'review', n: 'FOUNDATION REVIEW', s: 'SITE 00 REVIEWS WHAT YOU NEED.' },
  { k: 'proposal', n: 'PERSONALIZED PROPOSAL', s: 'YOUR SCOPE, PRICED FOR YOUR BUSINESS.' },
  { k: 'pay', n: 'APPROVAL & PAYMENT', s: 'ACCEPT YOUR PROPOSAL AND PAY SECURELY.' },
  { k: 'setup', n: 'FOUNDATION SETUP', s: 'DOMAIN, EMAIL, DNS, SECURITY, DEVICES.' },
  { k: 'verify', n: 'FINAL VERIFICATION', s: 'EVERYTHING IS CHECKED BEFORE HANDOFF.' },
  { k: 'complete', n: 'COMPLETE', s: 'YOUR FOUNDATION IS ESTABLISHED.' },
];

/** Specimen phase → canonical DigitalFoundationArtifactState(s) and the current client stage index. */
export const PHASES = {
  review: { cur: 1, canon: 'INTAKE_COMPLETE', area: 'FOUNDATION REVIEW' },
  closer: { cur: 1, canon: 'INTAKE_COMPLETE', area: 'FOUNDATION REVIEW' },
  proposal: { cur: 2, canon: 'QUOTE_READY', area: 'PERSONALIZED PROPOSAL' },
  accept: { cur: 3, canon: 'AWAITING_ACCEPTANCE', area: 'APPROVAL & PAYMENT' },
  payment: { cur: 3, canon: 'AWAITING_PAYMENT', area: 'APPROVAL & PAYMENT' },
  underway: { cur: 4, canon: 'IN_PROGRESS', area: 'FOUNDATION SETUP' },
  waiting: { cur: 4, canon: 'WAITING_ON_CLIENT', area: 'FOUNDATION SETUP', you: true },
  provider: { cur: 4, canon: 'WAITING_ON_PROVIDER', area: 'FOUNDATION SETUP', wait: true },
  blocked: { cur: 4, canon: 'WAITING_ON_CLIENT', area: 'FOUNDATION SETUP', block: true },
  verification: { cur: 5, canon: 'FINAL_VERIFICATION', area: 'FINAL VERIFICATION' },
  complete: { cur: 7, canon: 'COMPLETE', area: 'COMPLETE' },
};

export const AREAS = [
  { id: 'overview', n: '01', l: 'OVERVIEW', icon: 'home' },
  { id: 'roadmap', n: '02', l: 'ROADMAP', icon: 'roadmap' },
  { id: 'needs', n: '03', l: 'NEEDS YOU', icon: 'attention' },
  { id: 'records', n: '04', l: 'RECORDS', icon: 'folder' },
];

export const tierOf = (w) => (w < 768 ? 'm' : w < 1024 ? 'tp' : w < 1280 ? 'tl' : w < 1920 ? 'd' : 'uw');

export function hl(lines) {
  const last = lines.length - 1;
  return `<h1 class="cf-hl">${lines.map((l, i) => `<span>${l}${i === last ? '<i aria-hidden="true"></i>' : ''}</span>`).join('')}</h1>`;
}

export function rail(i, l) {
  return `<div class="cf-rail"><span class="cf-rail__i">${i}</span><span class="cf-rail__r"></span><span class="cf-rail__l">${l}</span></div>`;
}

/** Hero: rail, headline, lede, crown object. `etch` names the object state shown on wide tiers. */
export function hero({ i, l, lines, lede, obj = 'crown', etch = '', wide = false, extra = '' }) {
  const o = obj ? `<div class="cf-obj" aria-hidden="true">${DF.objects[obj]}${etch ? `<span class="cf-obj__etch">${etch}</span>` : ''}</div>` : '';
  return `<section class="cf-hero${wide || !obj ? ' cf-hero--wide' : ''}"><div class="cf-hero__txt">${rail(i, l)}${hl(lines)}${lede ? `<p class="cf-lede">${lede}</p>` : ''}${extra}</div>${o}</section>`;
}

export const sec = (h, inner, { red = false, small = '' } = {}) =>
  `<section class="cf-sec"><h2 class="cf-sec__h${red ? ' cf-sec__h--red' : ''}">${h}${small ? ` <small>${small}</small>` : ''}</h2>${inner}</section>`;

export const st = (kind, label) => `<span class="cf-st cf-st--${kind}">${label}</span>`;
export const ACTION_ST = {
  open: () => st('open', 'OPEN'),
  prog: () => st('prog', 'IN PROGRESS'),
  sub: () => st('sub', 'SUBMITTED'),
  done: () => st('done', 'RESOLVED'),
  block: () => st('block', 'BLOCKED'),
};

export const cta = (label, { kind = '', icon = 'arrow', auto = false, dis = false } = {}) =>
  `<button class="cf-cta${kind ? ` cf-cta--${kind}` : ''}${auto ? ' cf-cta--auto' : ''}${dis ? ' cf-cta--dis' : ''}" type="button"${dis ? ' aria-disabled="true"' : ''}><span>${label}</span>${icon ? ic(icon) : ''}</button>`;

export const link = (label, red = false) => `<button class="cf-link${red ? ' cf-link--red' : ''}" type="button">${label}${ic('next')}</button>`;

export const trust = (t = 'SAFE. SECURE. ON TRACK.') => `<div class="cf-trust">${ic('lock')}<span>${t}</span></div>`;

export const alert = (t, s, { kind = '', icon = 'warning' } = {}) =>
  `<div class="cf-alert${kind ? ` cf-alert--${kind}` : ''}" role="${kind ? 'status' : 'alert'}">${ic(icon)}<div class="cf-alert__b"><div class="cf-alert__t">${t}</div>${s ? `<div class="cf-alert__s">${s}</div>` : ''}</div></div>`;

export const row = ({ icon, t, s = '', v = '', vs = '', red = false, dash = false, arrow = false }) =>
  `<li class="cf-row${red ? ' cf-row--red' : ''}${dash ? ' cf-row--dash' : ''}">${icon ? ic(icon, 'i cf-row__ic') : ''}<div class="cf-row__tx"><div class="cf-row__t">${t}</div>${s ? `<div class="cf-row__s">${s}</div>` : ''}</div>${v ? `<div class="cf-row__v">${v}${vs ? `<small>${vs}</small>` : ''}</div>` : ''}${arrow ? ic('next', 'i cf-row__ar') : ''}</li>`;

export const spec = (rows) =>
  `<div class="cf-spec">${rows
    .map(([icon, k, ks, v, vs = '']) => `<div class="cf-spec__r">${ic(icon)}<div class="cf-spec__k"><b>${k}</b><span>${ks}</span></div><div class="cf-spec__v">${v}${vs ? `<small>${vs}</small>` : ''}</div></div>`)
    .join('')}</div>`;

/** Status as-of: the time the client last fetched — never a fabricated "just updated". */
export const asof = (t = '4:31 PM', state = '') =>
  `<span class="cf-asof">${state === 'busy' ? 'CHECKING FOR UPDATES…' : state === 'fail' ? `COULDN'T REFRESH · SHOWING ${t}` : `STATUS AS OF ${t}`}<button type="button">${ic('retry')}REFRESH</button></span>`;

export const foot = (code = '007') => `<footer class="cf-foot"><span>SITE 00</span><span class="cf-foot__r"></span><span class="cf-foot__c">IDNTY <b>/ ${code}</b></span></footer>`;

/** Frame: header + tier-specific navigation + main + (desktop) aside. */
export function frame({ area = 'overview', badge = 0, body, aside = '', tier, pre = false, nav = true, banner = '', session = true }) {
  const areas = AREAS.map((a) => ({ ...a, cur: a.id === area, badge: a.id === 'needs' ? badge : 0 }));
  const acct =
    tier === 'd' || tier === 'uw' || tier === 'tl'
      ? `<div class="cf-acct">${tier === 'tl' ? '' : `<div class="cf-acct__b"><span class="cf-acct__n">${C.short}</span><span class="cf-acct__s">REF ${C.ref}</span></div>`}${session ? `<span class="cf-sess">${ic('lock')}${tier === 'tl' ? 'SECURE' : 'SECURE SESSION'}</span>` : ''}</div>`
      : '';
  const head = `<header class="cf-head"><div class="cf-brand"><span class="cf-brand__mark">SITE 00</span><span class="cf-brand__prod">${tier === 'm' ? 'YOUR FOUNDATION' : 'DIGITAL FOUNDATION · YOUR FOUNDATION'}</span></div><span class="cf-head__sp"></span>${acct}<button class="cf-menu" type="button" aria-label="MENU"><span></span><span></span></button></header>`;
  const tabs =
    nav && tier === 'tp'
      ? `<nav class="cf-tabs" aria-label="YOUR FOUNDATION">${areas.map((a) => `<button class="cf-tab" type="button"${a.cur ? ' aria-current="page"' : ''}>${a.l}${a.badge ? `<span class="cf-badge">${a.badge}</span>` : ''}</button>`).join('')}</nav>`
      : '';
  const side =
    nav && (tier === 'tl' || tier === 'd' || tier === 'uw')
      ? `<nav class="cf-side" aria-label="YOUR FOUNDATION">${tier === 'tl' ? '' : '<div class="cf-side__k">YOUR FOUNDATION</div>'}${areas
          .map((a) => `<button class="cf-nav" type="button"${a.cur ? ' aria-current="page"' : ''}>${tier === 'tl' ? ic(a.icon) : `<span class="cf-nav__n">${a.n}</span>`}<span class="cf-nav__l">${a.l}</span>${a.badge ? `<span class="cf-badge">${a.badge}</span>` : ''}</button>`)
          .join('')}${
          tier === 'tl'
            ? ''
            : `<div class="cf-side__sep"></div><button class="cf-util" type="button">${ic('download')}SAVE TO HOME SCREEN</button><button class="cf-util" type="button">${ic('qr')}ACCESS CARD</button><button class="cf-util" type="button">${ic('notification')}UPDATES BY EMAIL</button><div class="cf-side__foot">${pre ? 'PAYMENT IS NEVER TAKEN ON THIS PAGE. CHECKOUT OPENS ON STRIPE.' : 'QUESTIONS? REPLY TO ANY SITE 00 EMAIL.'}</div>`
        }</nav>`
      : '';
  const bnav =
    nav && tier === 'm'
      ? `<nav class="cf-bnav" aria-label="YOUR FOUNDATION">${areas.map((a) => `<button class="cf-bnav__i" type="button"${a.cur ? ' aria-current="page"' : ''}>${ic(a.icon)}<span>${a.l}</span>${a.badge ? `<span class="cf-badge">${a.badge}</span>` : ''}</button>`).join('')}</nav>`
      : '';
  const showAside = aside && (tier === 'd' || tier === 'uw');
  return `<div class="cf" data-area="${area}">${banner}${head}${tabs}<div class="cf-body">${side}<main class="cf-main" id="stage"><div class="cf-main__in">${body}</div></main>${showAside ? `<aside class="cf-aside">${aside}</aside>` : ''}</div>${bnav}</div>`;
}

/** Roadmap rows for a phase. */
export function roadmap(phase, { compact = false, notes = {} } = {}) {
  const p = PHASES[phase];
  return `<ol class="cf-road">${STAGES.map((s, i) => {
    let dot = 'cf-dot';
    let x = 'UPCOMING';
    let xc = '';
    if (i < p.cur) {
      dot += ' cf-dot--done';
      x = 'DONE';
      xc = 'ink';
    } else if (i === p.cur) {
      if (p.block) {
        dot += ' cf-dot--block';
        x = 'BLOCKED · NEEDS YOU';
        xc = 'red';
      } else if (p.you) {
        dot += ' cf-dot--you';
        x = 'NEEDS YOU';
        xc = 'red';
      } else if (p.wait) {
        dot += ' cf-dot--wait';
        x = 'WAITING ON PROVIDER';
        xc = 'ink';
      } else {
        dot += ' cf-dot--cur';
        x = 'IN PROGRESS';
        xc = 'red';
      }
    }
    if (phase === 'complete' && i === 6) {
      dot = 'cf-dot cf-dot--done';
      x = 'DONE';
      xc = 'ink';
    }
    const sub = notes[i] ?? (compact ? '' : s.s);
    return `<li class="cf-road__r${i === p.cur ? ' cf-road__r--cur' : ''}"><span class="${dot}" aria-hidden="true"></span><div class="cf-road__t"><span class="cf-road__n">${s.n}</span>${sub ? `<span class="cf-road__s">${sub}</span>` : ''}</div><span class="cf-road__x${xc ? ` cf-road__x--${xc}` : ''}">${x}</span></li>`;
  }).join('')}</ol>`;
}

export function strip(phase) {
  const p = PHASES[phase];
  return `<div class="cf-strip" role="list">${STAGES.map((s, i) => {
    const done = i < p.cur || phase === 'complete';
    const cur = i === p.cur && phase !== 'complete';
    const dot = done ? 'cf-dot cf-dot--done' : cur ? (p.block ? 'cf-dot cf-dot--block' : p.you ? 'cf-dot cf-dot--you' : p.wait ? 'cf-dot cf-dot--wait' : 'cf-dot cf-dot--cur') : 'cf-dot';
    return `<div class="cf-strip__s${cur ? ' cf-strip__s--cur' : ''}" role="listitem"><span class="${dot}"></span><span class="cf-strip__n">${s.n}</span><span class="cf-strip__x">${done ? 'DONE' : cur ? (p.you || p.block ? 'NEEDS YOU' : p.wait ? 'WAITING' : 'NOW') : '—'}</span></div>`;
  }).join('')}</div>`;
}

export function ticks(phase) {
  const p = PHASES[phase];
  const cur = Math.min(p.cur, 6);
  return `<div class="cf-ticks" aria-hidden="true">${STAGES.map((_, i) => `<span class="${i < p.cur || phase === 'complete' ? 'd' : i === p.cur ? 'c' : ''}"></span>`).join('')}</div><div class="cf-ticks__l"><span>${phase === 'complete' ? 'ALL 7 STAGES DONE' : `STAGE ${cur + 1} OF 7 · ${STAGES[cur].n}`}</span><span>NO PERCENTAGES. STAGES ONLY.</span></div>`;
}

export const objects = () => DF.objects;
export const config = () => DF.config;
