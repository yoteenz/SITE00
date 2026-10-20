// YOUR FOUNDATION — page specimens (families A–S). Each returns { area, badge, body, aside, pre, nav, banner }.
// Copy is client language. Every number, date and name is fictional and illustrative; nothing simulates live activity.
import { C, STAGES, PHASES, ic, hero, sec, st, ACTION_ST, cta, link, trust, alert, row, spec, asof, foot, roadmap, strip, ticks, hl, rail } from './cf-kit.js';

const DF = window.__DF;
const money = (minor) => `$${(minor / 100).toLocaleString('en-US')}`;
const wide = (t) => t === 'd' || t === 'uw';
const notM = (t) => t !== 'm';

// ─── shared pieces ─────────────────────────────────────────────────────────────────────────────
const nextStep = (t, s, action = '') =>
  `<div class="cf-panel cf-panel--white"><div class="cf-panel__h">WHAT HAPPENS NEXT <small>FROM YOUR FOUNDATION RECORD</small></div><div class="cf-row__t">${t}</div><p class="cf-note">${s}</p>${action}</div>`;

const accessPanel = (compact = false) =>
  `<div class="cf-panel"><div class="cf-panel__h">COME BACK ANYTIME</div><ul class="cf-rows">${row({ icon: 'download', t: 'SAVE YOUR FOUNDATION', s: compact ? 'HOME SCREEN · ONE TAP' : 'ADD MY FOUNDATION TO YOUR HOME SCREEN. OPTIONAL.', arrow: true })}${row({ icon: 'email', t: 'EMAIL', s: compact ? '' : `EVERY SITE 00 EMAIL TO ${C.email} HAS VIEW MY FOUNDATION.`, arrow: true })}</ul></div>`;

const truthStrip = (items, tail = '') =>
  `<div class="cf-truth">${items.map(([k, v]) => `<div class="cf-truth__i"><span class="cf-truth__k">${k}</span><span class="cf-truth__v">${v}</span></div>`).join('')}<span class="cf-truth__sp"></span>${tail}</div>`;

const activityList = (events) =>
  `<ol class="cf-tl">${events.map(([w, t, s, kind = '', src = '']) => `<li class="cf-tl__e${kind ? ` cf-tl__e--${kind}` : ''}"><div class="cf-tl__w">${w}</div><div class="cf-tl__t">${t}</div>${s ? `<div class="cf-tl__s">${s}</div>` : ''}${src ? `<span class="cf-tl__src">${src}</span>` : ''}</li>`).join('')}</ol>`;

export const EVENTS = {
  review: [
    ['OCT 14 · 4:12 PM', 'INTAKE RECEIVED', 'YOUR REQUIREMENTS WERE SUBMITTED FROM THIS LINK.', 'red', 'INTAKE_COMPLETED'],
    ['OCT 14 · 3:58 PM', 'INTAKE STARTED', '', '', 'INTAKE_STARTED'],
    ['OCT 14 · 3:51 PM', 'FOUNDATION LINK OPENED', '', 'sys', 'LINK_OPENED'],
  ],
  proposal: [
    ['OCT 15 · 10:06 AM', 'PERSONALIZED PROPOSAL READY', 'SITE 00 APPROVED YOUR SCOPE. PROPOSAL V2.', 'red', 'QUOTE_CREATED'],
    ['OCT 15 · 9:40 AM', 'SCOPE ADJUSTED BY SITE 00', 'DNS CLEANUP ADDED AFTER REVIEW.', '', 'QUOTE_UPDATED'],
    ['OCT 14 · 4:12 PM', 'INTAKE RECEIVED', '', '', 'INTAKE_COMPLETED'],
  ],
  underway: [
    ['OCT 17 · 11:20 AM', 'DOMAIN ACCESS REQUESTED', 'SITE 00 NEEDS YOUR REGISTRAR APPROVAL.', 'red', 'CLIENT_ACTION_REQUESTED'],
    ['OCT 16 · 2:03 PM', 'FOUNDATION SETUP STARTED', '', '', 'STAGE_STARTED'],
    ['OCT 16 · 1:58 PM', 'PAYMENT CONFIRMED BY STRIPE', 'PROPOSAL V2 · $1,075.', '', 'PAYMENT_CONFIRMED'],
    ['OCT 16 · 1:51 PM', 'PROPOSAL V2 ACCEPTED', '', '', 'QUOTE_ACCEPTED'],
    ['OCT 15 · 10:06 AM', 'PERSONALIZED PROPOSAL READY', '', '', 'QUOTE_CREATED'],
    ['OCT 14 · 4:12 PM', 'INTAKE RECEIVED', '', 'sys', 'INTAKE_COMPLETED'],
  ],
  complete: [
    ['OCT 21 · 3:30 PM', 'FOUNDATION ESTABLISHED', 'ALL RECORDS ARE IN YOUR RECORDS AREA.', 'red', 'FOUNDATION_COMPLETED'],
    ['OCT 21 · 1:12 PM', 'FINAL VERIFICATION PASSED', '', '', 'FOUNDATION_VERIFIED'],
    ['OCT 20 · 9:44 AM', 'SECURITY SETTINGS CONFIRMED', '', '', 'STAGE_COMPLETED'],
  ],
};

// Proposal lines: base + example add-ons (sprint example pricing; NOT live charges).
export const LINES = [
  { id: 'base', n: 'DIGITAL FOUNDATION', d: 'DOMAIN · BUSINESS EMAIL · DNS · SECURITY · RECORDS', p: 50000, req: true, base: true },
  { id: 'domain', n: 'NEW DOMAIN SETUP', d: 'REGISTER NORTHLINETRANSPORT.CO IN YOUR NAME', p: 10000, req: true },
  { id: 'mailbox', n: 'ADDITIONAL MAILBOX × 1', d: 'DISPATCH@ FOR YOUR OPERATIONS DESK', p: 7500 },
  { id: 'dns', n: 'DNS CLEANUP', d: 'OLD RECORDS FROM A PREVIOUS PROVIDER', p: 15000, req: true, founder: true },
  { id: 'device', n: 'DEVICE SETUP × 1', d: 'YOUR PRIMARY PHONE', p: 5000 },
  { id: 'signature', n: 'EMAIL SIGNATURE', d: 'CONSISTENT SIGNATURE ACROSS MAILBOXES', p: 15000 },
];
export const EXAMPLE_PRICES = [
  ['ADDITIONAL MAILBOX', 75], ['NEW DOMAIN', 100], ['DOMAIN TRANSFER', 100], ['DOMAIN RECOVERY', 150], ['EMAIL MIGRATION', 200], ['MULTI-USER SETUP', 150],
  ['EMAIL ROUTING', 100], ['EMAIL SIGNATURE', 150], ['DEVICE SETUP', 50], ['DNS CLEANUP', 150], ['SITE CONFLICT', 150],
];
const total = (ids) => LINES.filter((l) => ids.includes(l.id)).reduce((a, l) => a + l.p, 0);
const ACCEPTED = ['base', 'domain', 'mailbox', 'dns', 'device'];

// ─── A. POST-INTAKE REVIEW ─────────────────────────────────────────────────────────────────────
export function review({ st: s = 'received' }, t) {
  const closer = s === 'closer';
  const lede = "YOUR INTAKE HAS BEEN RECEIVED. WE'RE REVIEWING YOUR REQUIREMENTS AND PREPARING YOUR PERSONALIZED FOUNDATION PROPOSAL.";
  const route = closer
    ? alert('SOME OF YOUR REQUIREMENTS NEED A CLOSER LOOK', 'SITE 00 WILL REVIEW THEM PERSONALLY BEFORE YOUR PROPOSAL IS READY. YOU DON’T NEED TO DO ANYTHING RIGHT NOW.', { kind: 'ink', icon: 'review' })
    : s === 'info'
      ? alert('SITE 00 HAS ONE QUESTION FOR YOU', 'ANSWER IT IN NEEDS YOU SO YOUR PROPOSAL CAN BE FINISHED.', { icon: 'attention' })
      : '';
  const now = `<div class="cf-sec">${t === 'm' ? ticks(closer || s === 'info' ? 'review' : 'review') : strip('review')}</div>`;
  const what = sec(
    'WHAT WE RECEIVED',
    `<ul class="cf-rows">${row({ icon: 'business', t: C.biz, s: 'TRANSPORT & LOGISTICS · 4 PEOPLE' })}${row({ icon: 'domain', t: 'DOMAIN', s: 'YOU NEED A NEW DOMAIN' })}${row({ icon: 'email', t: 'BUSINESS EMAIL', s: '2 MAILBOXES REQUESTED' })}${row({ icon: 'device', t: 'DEVICES', s: '1 PHONE TO SET UP' })}</ul><p class="cf-note">SUBMITTED ${C.received} · YOUR ANSWERS ARE LOCKED WHILE SITE 00 REVIEWS THEM. <b>NEED TO CHANGE SOMETHING?</b> REPLY TO YOUR CONFIRMATION EMAIL.</p>`,
  );
  const next = sec('WHAT HAPPENS NEXT', `<ol class="cf-rows">${row({ icon: 'review', t: '01  SITE 00 REVIEWS YOUR REQUIREMENTS', s: closer ? 'A PERSONAL REVIEW — SOME ITEMS NEED A CLOSER LOOK.' : 'EVERY PROPOSAL IS APPROVED BY SITE 00 BEFORE YOU SEE IT.' })}${row({ icon: 'document', t: '02  YOUR PERSONALIZED PROPOSAL', s: 'SCOPE AND PRICE FOR YOUR BUSINESS — WE EMAIL YOU WHEN IT’S READY.' })}${row({ icon: 'payment', t: '03  APPROVE AND PAY SECURELY', s: 'ON STRIPE. NOTHING IS CHARGED UNTIL YOU ACCEPT.' })}</ol>`);
  const body = `${hero({ i: '01', l: 'FOUNDATION REVIEW', lines: t === 'm' ? ['YOUR', 'FOUNDATION', 'IS TAKING', 'SHAPE'] : ['YOUR FOUNDATION', 'IS TAKING SHAPE'], lede, etch: 'UNDER REVIEW' })}
    ${truthStrip([['STATUS', closer ? 'IN PERSONAL REVIEW' : 'IN REVIEW'], ['RECEIVED', C.received], ['LAST UPDATE', s === 'info' ? 'OCT 15 · 9:02 AM' : C.received], ['REFERENCE', C.ref]], notM(t) ? asof('4:31 PM') : '')}
    ${route ? `<div class="cf-sec">${route}</div>` : ''}${now}
    ${wide(t) ? `<div class="cf-cols"><div>${next}</div><div>${what}</div></div>` : next + what}
    ${t === 'm' ? sec('COME BACK ANYTIME', accessPanel(true).replace('<div class="cf-panel"><div class="cf-panel__h">COME BACK ANYTIME</div>', '<div>')) : ''}
    ${t === 'tp' || t === 'tl' ? sec('COME BACK ANYTIME', accessPanel()) : ''}
    ${trust('NO PAYMENT IS TAKEN DURING REVIEW.')}${foot('001')}`;
  return { area: 'overview', badge: s === 'info' ? 1 : 0, pre: true, body, aside: `${nextStep('SITE 00 REVIEWS YOUR REQUIREMENTS', 'WE EMAIL YOU WHEN YOUR PROPOSAL IS READY. NO DATE IS PROMISED UNTIL REVIEW IS DONE.')}<div style="height:14px"></div>${accessPanel()}<div class="cf-sec"><h2 class="cf-sec__h">ACTIVITY</h2>${activityList(EVENTS.review)}</div>` };
}

// ─── B. OVERVIEW (lifecycle-aware) ─────────────────────────────────────────────────────────────
const OV = {
  review: { lines: ['YOUR FOUNDATION', 'IS TAKING SHAPE'], ml: ['YOUR', 'FOUNDATION', 'IS TAKING', 'SHAPE'], lede: "YOUR INTAKE HAS BEEN RECEIVED. WE'RE REVIEWING YOUR REQUIREMENTS AND PREPARING YOUR PERSONALIZED FOUNDATION PROPOSAL.", etch: 'UNDER REVIEW' },
  proposal: { lines: ['YOUR PROPOSAL', 'IS READY'], ml: ['YOUR', 'PROPOSAL', 'IS READY'], lede: 'SITE 00 HAS APPROVED A PERSONALIZED SCOPE FOR NORTHLINE TRANSPORT. REVIEW IT, CHOOSE YOUR OPTIONS AND ACCEPT WHEN YOU’RE READY.', etch: 'PROPOSAL V2' },
  payment: { lines: ['YOUR FOUNDATION', 'IS READY TO BEGIN'], ml: ['YOUR', 'FOUNDATION', 'IS READY', 'TO BEGIN'], lede: 'YOU ACCEPTED PROPOSAL V2. PAY SECURELY ON STRIPE TO START YOUR FOUNDATION SETUP.', etch: 'AWAITING PAYMENT' },
  underway: { lines: ['YOUR FOUNDATION', 'IS UNDERWAY'], ml: ['YOUR', 'FOUNDATION', 'IS', 'UNDERWAY'], lede: 'PAYMENT CONFIRMED BY STRIPE. SITE 00 IS SETTING UP YOUR DOMAIN, EMAIL AND SECURITY.', etch: 'FOUNDATION SETUP' },
  waiting: { lines: ['YOUR FOUNDATION', 'NEEDS YOU'], ml: ['YOUR', 'FOUNDATION', 'NEEDS YOU'], lede: 'SETUP IS PAUSED ON ONE STEP ONLY YOU CAN TAKE. IT TAKES ABOUT TWO MINUTES.', etch: 'WAITING ON YOU' },
  provider: { lines: ['YOUR FOUNDATION', 'IS UNDERWAY'], ml: ['YOUR', 'FOUNDATION', 'IS', 'UNDERWAY'], lede: 'WE’RE WAITING ON YOUR DOMAIN REGISTRAR TO CONFIRM A CHANGE. NOTHING IS NEEDED FROM YOU.', etch: 'WAITING ON PROVIDER' },
  verification: { lines: ['FINAL', 'VERIFICATION'], ml: ['FINAL', 'VERIFI-', 'CATION'], lede: 'EVERY PART OF YOUR FOUNDATION IS BEING CHECKED BEFORE HANDOFF.', etch: 'VERIFYING' },
  complete: { lines: ['YOUR FOUNDATION', 'IS ESTABLISHED'], ml: ['YOUR', 'FOUNDATION', 'IS', 'ESTABLISHED'], lede: 'YOUR DOMAIN, EMAIL AND SECURITY ARE IN PLACE AND VERIFIED. YOUR RECORDS ARE READY.', etch: 'ESTABLISHED' },
};

export function overview({ st: s = 'underway' }, t) {
  const o = OV[s];
  const p = PHASES[s];
  const pre = p.cur <= 3;
  const needs =
    s === 'waiting'
      ? [['CONNECT YOUR DOMAIN REGISTRAR', 'APPROVE REGISTRAR ACCESS SO WE CAN POINT YOUR DOMAIN.', 'open']]
      : s === 'underway'
        ? [['CHOOSE YOUR EMAIL ADDRESS', 'PICK THE ADDRESS FOR YOUR MAIN MAILBOX.', 'open'], ['CONFIRM RECOVERY EMAIL', 'SUBMITTED OCT 17 · SITE 00 IS CHECKING IT.', 'sub']]
        : s === 'proposal'
          ? [['REVIEW YOUR PROPOSAL', 'PROPOSAL V2 · READY OCT 15.', 'open']]
          : s === 'payment'
            ? [['COMPLETE PAYMENT', 'PROPOSAL V2 · $1,075 · ON STRIPE.', 'open']]
            : [];
  const needsHtml = needs.length
    ? sec(`NEEDS YOU · ${needs.filter((n) => n[2] === 'open').length}`, `<ul class="cf-rows">${needs.map(([a, b, k]) => row({ icon: k === 'open' ? 'attention' : 'pending', t: a, s: b, red: k === 'open', arrow: true })).join('')}</ul>`, { red: true })
    : sec('NEEDS YOU', `<ul class="cf-rows">${row({ icon: 'check', t: 'NOTHING NEEDS YOU RIGHT NOW', s: s === 'provider' ? 'WE’RE WAITING ON YOUR REGISTRAR, NOT ON YOU.' : 'WE’LL EMAIL YOU IF THAT CHANGES.', dash: true })}</ul>`);
  const facts =
    s === 'complete'
      ? spec([['domain', 'DOMAIN', 'YOURS, VERIFIED', 'NORTHLINETRANSPORT.CO'], ['email', 'BUSINESS EMAIL', '2 MAILBOXES', 'ACTIVE'], ['security', 'SECURITY', 'SPF · DKIM · DMARC · 2-STEP', 'VERIFIED', 'OCT 21'], ['folder', 'RECORDS', 'OWNERSHIP + SETUP', '6 READY']])
      : pre
        ? spec([['business', 'CLIENT', 'BUSINESS NAME', C.short], ['document', 'PROPOSAL', s === 'review' ? 'IN PREPARATION' : 'CURRENT VERSION', s === 'review' ? 'NOT YET READY' : 'V2 · $1,075', s === 'review' ? '' : 'EXAMPLE PRICING'], ['time', 'TURNAROUND', 'BEGINS AFTER PAYMENT + WHAT WE NEED', s === 'review' ? 'SET IN YOUR PROPOSAL' : '2–3', s === 'review' ? '' : 'BUSINESS DAYS']])
        : spec([['business', 'CLIENT', 'BUSINESS NAME', C.short], ['payment', 'PAYMENT', 'VERIFIED BY STRIPE', 'CONFIRMED', 'OCT 16 · PROPOSAL V2'], ['stage', 'CURRENT STAGE', 'FROM YOUR PROJECT RECORD', STAGES[p.cur].n, s === 'waiting' ? 'NEEDS YOU' : s === 'provider' ? 'WAITING ON PROVIDER' : 'IN PROGRESS'], ['time', 'TURNAROUND', s === 'waiting' ? 'PAUSED UNTIL YOUR STEP IS DONE' : 'ONCE WE HAVE WHAT WE NEED', '2–3', 'BUSINESS DAYS · NOT A GUARANTEE']]);
  const primary =
    s === 'proposal' ? cta('REVIEW MY PROPOSAL', { auto: true }) : s === 'payment' ? cta('CONTINUE TO SECURE PAYMENT', { auto: true, icon: 'lock' }) : s === 'waiting' ? cta('CONNECT MY REGISTRAR', { auto: true }) : s === 'complete' ? cta('VIEW MY RECORDS', { auto: true, icon: 'folder' }) : '';
  const progressHtml = `<div class="cf-sec">${t === 'm' ? ticks(s) : strip(s)}</div>`;
  const body = `${hero({ i: '01', l: 'OVERVIEW', lines: t === 'm' ? o.ml : o.lines, lede: o.lede, etch: o.etch })}
    ${truthStrip([['STAGE', s === 'complete' ? 'COMPLETE' : `${p.cur + 1} OF 7 · ${STAGES[p.cur].n}`], ['REFERENCE', C.ref]], notM(t) ? asof('4:31 PM') : '')}
    ${primary ? `<div class="cf-acts">${primary}</div>` : ''}${progressHtml}
    ${wide(t) ? `<div class="cf-cols"><div>${needsHtml}</div><div>${sec('YOUR FOUNDATION', facts)}</div></div>` : needsHtml + sec('YOUR FOUNDATION', facts)}
    ${t === 'm' ? `<div class="cf-sec">${asof('4:31 PM')}</div>` : ''}${trust(pre ? 'PAYMENT IS NEVER TAKEN ON THIS PAGE.' : 'SAFE. SECURE. ON TRACK.')}${foot('007')}`;
  const aside = `${nextStep(
    s === 'complete' ? 'NOTHING ELSE IS REQUIRED' : s === 'waiting' ? 'CONNECT YOUR DOMAIN REGISTRAR' : s === 'provider' ? 'REGISTRAR CONFIRMATION' : s === 'payment' ? 'SECURE PAYMENT ON STRIPE' : s === 'proposal' ? 'REVIEW AND ACCEPT YOUR PROPOSAL' : s === 'verification' ? 'SITE 00 FINISHES VERIFICATION' : s === 'review' ? 'SITE 00 REVIEWS YOUR REQUIREMENTS' : 'SITE 00 SETS UP YOUR EMAIL',
    s === 'provider' ? 'PROVIDERS USUALLY CONFIRM WITHIN A BUSINESS DAY. WE CAN’T SPEED THIS UP, AND WE WON’T GUESS A TIME.' : 'THIS COMES FROM YOUR PROJECT RECORD, NOT AN ESTIMATE.',
  )}<div style="height:14px"></div>${t === 'uw' ? '' : accessPanel(true)}${t === 'uw' ? `<div class="cf-sec"><h2 class="cf-sec__h">ACTIVITY <small>REAL EVENTS ONLY</small></h2>${activityList(s === 'complete' ? EVENTS.complete : pre ? (s === 'review' ? EVENTS.review : EVENTS.proposal) : EVENTS.underway)}</div>` : ''}`;
  return { area: 'overview', badge: needs.filter((n) => n[2] === 'open').length, pre, body, aside };
}

// ─── C. ROADMAP ────────────────────────────────────────────────────────────────────────────────
export function roadmapPage({ st: s = 'underway' }, t) {
  const p = PHASES[s];
  const notes = {};
  if (s === 'underway') notes[4] = 'DOMAIN READY · EMAIL IN PROGRESS · DNS + SECURITY UPCOMING.';
  if (s === 'blocked') notes[4] = 'PAUSED: WE CAN’T REACH YOUR REGISTRAR WITHOUT YOUR APPROVAL.';
  if (s === 'review') notes[3] = 'AFTER YOU ACCEPT YOUR PROPOSAL.';
  const detail = s === 'underway' || s === 'blocked'
    ? sec('FOUNDATION SETUP · WORKSTREAMS', workstreams(s === 'blocked' ? 'blocked' : 'active', t, true))
    : '';
  const body = `${hero({ i: '02', l: 'ROADMAP', lines: t === 'm' ? ['YOUR', 'ROADMAP'] : ['YOUR ROADMAP'], lede: 'SEVEN STAGES FROM INTAKE TO AN ESTABLISHED FOUNDATION. EACH STAGE SHOWS WHAT IS TRUE NOW — NO PERCENTAGES, NO COUNTDOWNS.', obj: t === 'm' ? '' : 'crown', etch: STAGES[Math.min(p.cur, 6)].n, wide: t === 'm' })}
    ${notM(t) ? `<div class="cf-sec">${strip(s)}</div>` : ''}
    ${s === 'blocked' ? `<div class="cf-sec">${alert('SETUP IS PAUSED ON ONE STEP', 'CONNECT YOUR DOMAIN REGISTRAR IN NEEDS YOU. YOUR TURNAROUND RESUMES WHEN IT’S DONE.')}</div>` : ''}
    ${wide(t) && detail ? `<div class="cf-cols"><div>${sec('ALL STAGES', roadmap(s, { notes }))}</div><div>${detail}</div></div>` : sec('ALL STAGES', roadmap(s, { notes })) + detail}
    ${sec('TIMING', `<p class="cf-note">FOUNDATION SETUP TYPICALLY TAKES <b>2–3 BUSINESS DAYS</b>. IT STARTS ONLY AFTER PAYMENT IS CONFIRMED AND WE HAVE WHAT WE NEED FROM YOU. DATES ARE NEVER GUARANTEED.</p>`)}
    ${foot('008')}`;
  return { area: 'roadmap', badge: s === 'blocked' || s === 'waiting' ? 1 : 0, pre: p.cur <= 3, body, aside: `${nextStep(STAGES[Math.min(p.cur, 6)].n, STAGES[Math.min(p.cur, 6)].s)}` };
}

// ─── D. NEEDS YOU ──────────────────────────────────────────────────────────────────────────────
export const ACTIONS = [
  { t: 'CONNECT YOUR DOMAIN REGISTRAR', s: 'APPROVE REGISTRAR ACCESS SO WE CAN POINT NORTHLINETRANSPORT.CO TO YOUR EMAIL.', icon: 'domain', k: 'open', m: ['REQUESTED OCT 17', 'ABOUT 2 MINUTES'] },
  { t: 'CHOOSE YOUR EMAIL ADDRESS', s: 'YOU STARTED THIS · PICK THE ADDRESS FOR YOUR MAIN MAILBOX.', icon: 'email', k: 'prog', m: ['REQUESTED OCT 17', 'DRAFT SAVED'] },
  { t: 'CONFIRM YOUR RECOVERY EMAIL', s: 'SITE 00 IS CHECKING WHAT YOU SENT. NOTHING ELSE IS NEEDED.', icon: 'security', k: 'sub', m: ['SUBMITTED OCT 17 · 9:02 AM'] },
  { t: 'APPROVE DNS CHANGE', s: 'WAITING ON YOUR REGISTRAR STEP ABOVE BEFORE THIS CAN OPEN.', icon: 'dns', k: 'block', m: ['BLOCKED BY: CONNECT YOUR DOMAIN REGISTRAR'] },
  { t: 'CONFIRM YOUR BUSINESS DETAILS', s: 'CONFIRMED BY YOU.', icon: 'business', k: 'done', m: ['RESOLVED OCT 16 · 2:40 PM'] },
];
const actCard = (a, t) => {
  const go = a.k === 'open' ? `<button class="cf-act__go" type="button">START${ic('next')}</button>` : a.k === 'prog' ? `<button class="cf-act__go" type="button">CONTINUE${ic('next')}</button>` : a.k === 'sub' ? `<button class="cf-act__go cf-act__go--ink" type="button">VIEW WHAT YOU SENT${ic('next')}</button>` : '';
  return `<li class="cf-act cf-act--${a.k}">${ic(a.icon, 'i cf-act__ic')}<div class="cf-act__top"><span class="cf-act__t">${a.t}</span>${ACTION_ST[a.k]()}</div><div class="cf-act__s">${a.s}</div><div class="cf-act__m">${a.m.map((x) => `<span>${x}</span>`).join('')}</div>${go ? `<span></span>${go}` : ''}</li>`;
};
export function needs({ st: s = 'list' }, t) {
  let list;
  if (s === 'empty') list = `<ul class="cf-rows">${row({ icon: 'check', t: 'NOTHING NEEDS YOU RIGHT NOW', s: 'WHEN SITE 00 NEEDS A DECISION, ACCESS OR A DETAIL, IT APPEARS HERE AND WE EMAIL YOU.', dash: true })}</ul>`;
  else if (s === 'pre') list = `<ul class="cf-rows" style="gap:8px">${actCard({ t: 'REVIEW YOUR PROPOSAL', s: 'PROPOSAL V2 IS READY. REVIEW YOUR SCOPE AND OPTIONS.', icon: 'document', k: 'open', m: ['READY OCT 15 · 10:06 AM'] }, t)}${actCard({ t: 'ANSWER ONE QUESTION FROM SITE 00', s: 'DO YOU STILL HAVE ACCESS TO YOUR OLD EMAIL PROVIDER?', icon: 'help', k: 'done', m: ['ANSWERED OCT 15 · 9:12 AM'] }, t)}</ul>`;
  else {
    const open = ACTIONS.filter((a) => a.k !== 'done');
    const done = ACTIONS.filter((a) => a.k === 'done');
    list = `<ul class="cf-rows" style="gap:8px">${open.map((a) => actCard(a, t)).join('')}</ul>${sec('RESOLVED', `<ul class="cf-rows">${done.map((a) => actCard(a, t)).join('')}</ul>`)}`;
  }
  const legend = `<div class="cf-sec" style="display:flex;flex-wrap:wrap;gap:8px">${ACTION_ST.open()}${ACTION_ST.prog()}${ACTION_ST.sub()}${ACTION_ST.done()}${ACTION_ST.block()}</div>`;
  const body = `${hero({ i: '03', l: 'NEEDS YOU', lines: s === 'empty' ? ['ALL CLEAR'] : t === 'm' ? ['WHAT', 'NEEDS YOU'] : ['WHAT NEEDS YOU'], lede: s === 'empty' ? 'THERE IS NOTHING FOR YOU TO DO. SITE 00 IS WORKING ON YOUR FOUNDATION.' : 'ONLY THE STEPS THAT NEED YOUR DECISION, ACCESS OR DETAILS. EACH ONE SHOWS ITS REAL STATUS.', obj: '', wide: true })}
    ${s === 'list' ? legend : ''}<div class="cf-sec">${list}</div>
    ${s === 'list' ? `<p class="cf-note">BLOCKED STEPS OPEN AUTOMATICALLY WHEN THE STEP BEFORE THEM IS DONE. SUBMITTED STEPS ARE WITH SITE 00.</p>` : ''}${foot('010')}`;
  return { area: 'needs', badge: s === 'list' ? 1 : s === 'pre' ? 1 : 0, pre: s === 'pre', body, aside: s === 'list' ? nextStep('CONNECT YOUR DOMAIN REGISTRAR', 'THIS IS THE ONLY STEP HOLDING UP SETUP. YOUR TURNAROUND IS PAUSED UNTIL IT’S DONE.', cta('START', { auto: false })) : '' };
}

/** D2. Single action detail (step form). */
export function action({ st: s = 'open' }, t) {
  const head = `<button class="cf-link" type="button" style="margin-top:18px">${ic('back')}NEEDS YOU</button>${rail('03', 'NEEDS YOU · ACTION')}`;
  let inner;
  if (s === 'submitted') inner = `${hl(['SUBMITTED'])}<p class="cf-lede">SITE 00 HAS WHAT YOU SENT AND IS CHECKING IT. YOU’LL SEE THIS MOVE TO RESOLVED HERE.</p><div class="cf-sec">${spec([['email', 'RECOVERY EMAIL', 'WHAT YOU SENT', 'M•••@GMAIL.INVALID', 'OCT 17 · 9:02 AM'], ['pending', 'STATUS', 'WITH SITE 00', 'SUBMITTED']])}</div>`;
  else if (s === 'blocked') inner = `${hl(['NOT YET', 'AVAILABLE'])}<p class="cf-lede">THIS STEP OPENS WHEN “CONNECT YOUR DOMAIN REGISTRAR” IS DONE. NOTHING YOU DO HERE IS LOST.</p><div class="cf-sec">${alert('BLOCKED BY ANOTHER STEP', 'CONNECT YOUR DOMAIN REGISTRAR FIRST.', { icon: 'blocked' })}</div>${cta('GO TO THAT STEP', { kind: 'out' })}`;
  else
    inner = `${hl(t === 'm' ? ['CONNECT', 'YOUR', 'REGISTRAR'] : ['CONNECT YOUR', 'REGISTRAR'])}<p class="cf-lede">WE NEED PERMISSION TO MANAGE DNS FOR NORTHLINETRANSPORT.CO. YOU STAY THE OWNER. YOU CAN REMOVE ACCESS AFTER HANDOFF.</p>
      <div class="cf-sec">${spec([['domain', 'DOMAIN', 'REGISTERED IN YOUR NAME', 'NORTHLINETRANSPORT.CO'], ['security', 'WHAT WE GET', 'DNS ONLY', 'NO BILLING ACCESS']])}</div>
      <div class="cf-field"><span class="cf-field__l">YOUR REGISTRAR</span><span class="cf-input">CHOOSE…</span></div>
      <div class="cf-sec"><div class="cf-chk"><span class="cf-box cf-box--on"></span><span>I APPROVE SITE 00 MANAGING DNS FOR THIS DOMAIN DURING SETUP.</span></div></div>
      <div class="cf-acts cf-acts--row">${cta('SUBMIT APPROVAL')}${cta('I NEED HELP', { kind: 'ghost', icon: 'help' })}</div>
      <p class="cf-note">NEVER SHARE A PASSWORD HERE. SITE 00 WILL NEVER ASK FOR ONE IN THIS PORTAL.</p>`;
  return { area: 'needs', badge: 1, body: `<div class="cf-hero cf-hero--wide" style="display:block">${head}${inner}</div>${foot('010')}`, aside: '' };
}

// ─── E. RECORDS ────────────────────────────────────────────────────────────────────────────────
const REC = [
  { t: 'INTAKE SUMMARY', s: 'WHAT YOU SUBMITTED · OCT 14', icon: 'document', ready: true, sens: false },
  { t: 'PROPOSAL V2 · ACCEPTED', s: 'SCOPE, PRICE AND TERMS · OCT 16', icon: 'receipt', ready: true, sens: false },
  { t: 'PAYMENT RECEIPT', s: 'FROM STRIPE · OCT 16', icon: 'payment', ready: true, sens: false },
  { t: 'DOMAIN OWNERSHIP RECORD', s: 'REGISTRANT, REGISTRAR, RENEWAL DATE', icon: 'domain', ready: true, sens: true },
  { t: 'EMAIL ACCOUNTS', s: 'MAILBOXES AND ADMIN CONTACT', icon: 'email', ready: false, sens: true },
  { t: 'SECURITY RECORD', s: 'SPF · DKIM · DMARC · RECOVERY', icon: 'security', ready: false, sens: true },
  { t: 'FOUNDATION HANDOFF', s: 'EVERYTHING YOU OWN, IN ONE DOCUMENT', icon: 'deliverable', ready: false, sens: true },
];
export function records({ st: s = 'some' }, t) {
  const set = s === 'early' ? REC.slice(0, 1) : s === 'full' ? REC.map((r) => ({ ...r, ready: true })) : REC;
  const ready = set.filter((r) => r.ready);
  const pend = s === 'early' ? [] : set.filter((r) => !r.ready);
  const recRow = (r) => `<li class="cf-rec${r.ready ? '' : ' cf-rec--pend'}">${ic(r.icon)}<div><div class="cf-rec__t">${r.t}</div><div class="cf-rec__s">${r.ready ? r.s : 'NOT CREATED YET · APPEARS WHEN IT EXISTS'}</div></div>${r.ready ? (r.sens ? `<span class="cf-lock">${ic('lock')}VERIFIED VIEW</span>` : `<span class="cf-lock">${ic('view')}VIEW</span>`) : st('none', 'PENDING')}</li>`;
  const body = `${hero({ i: '04', l: 'RECORDS', lines: t === 'm' ? ['YOUR', 'RECORDS'] : ['YOUR RECORDS'], lede: s === 'early' ? 'RECORDS APPEAR HERE ONLY WHEN THEY EXIST. RIGHT NOW THAT’S YOUR INTAKE SUMMARY.' : 'EVERYTHING YOU OWN, DOCUMENTED. SENSITIVE RECORDS ASK YOU TO CONFIRM IT’S YOU FIRST.', obj: '', wide: true })}
    ${sec(`READY · ${ready.length}`, `<ul class="cf-rows">${ready.map(recRow).join('')}</ul>`)}
    ${pend.length ? sec(`NOT CREATED YET · ${pend.length}`, `<ul class="cf-rows">${pend.map(recRow).join('')}</ul><p class="cf-note">PENDING RECORDS ARE LISTED SO YOU KNOW WHAT’S COMING. NONE OF THEM IS SHOWN AS READY UNTIL SITE 00 CREATES IT.</p>`) : ''}
    ${foot('REC')}`;
  return { area: 'records', badge: 0, pre: s === 'early', body, aside: `<div class="cf-panel"><div class="cf-panel__h">VERIFIED VIEW</div><p class="cf-note" style="margin:0">RECORDS WITH ACCOUNT DETAILS OPEN ONLY IN A VERIFIED SESSION. WE EMAIL A ONE-TIME LINK TO ${C.email}.</p></div>` };
}

export function record({ st: s = 'locked' }, t) {
  const head = `<button class="cf-link" type="button" style="margin-top:18px">${ic('back')}RECORDS</button>${rail('04', 'RECORD')}`;
  const inner =
    s === 'locked'
      ? `${hl(['CONFIRM', 'IT’S YOU'])}<p class="cf-lede">THE DOMAIN OWNERSHIP RECORD CONTAINS ACCOUNT DETAILS. WE’LL EMAIL A ONE-TIME LINK TO ${C.email} TO OPEN IT.</p>${cta('EMAIL ME A LINK', { icon: 'email' })}<p class="cf-note">THE LINK EXPIRES AFTER 15 MINUTES AND WORKS ONCE. YOUR CURRENT VIEW STAYS OPEN.</p>`
      : `${hl(t === 'm' ? ['DOMAIN', 'OWNERSHIP'] : ['DOMAIN OWNERSHIP'])}<p class="cf-lede">VERIFIED VIEW · OPENED OCT 21 · 3:44 PM · CLOSES WHEN YOU SIGN OUT OR AFTER 30 MINUTES IDLE.</p>
        <div class="cf-sec">${spec([['domain', 'DOMAIN', 'REGISTERED NAME', 'NORTHLINETRANSPORT.CO'], ['user', 'REGISTRANT', 'LEGAL OWNER', C.biz], ['business', 'REGISTRAR', 'WHERE IT LIVES', 'EXAMPLE REGISTRAR INC.'], ['calendar', 'RENEWAL', 'AUTO-RENEW ON', 'OCT 21, 2027']])}</div>
        <div class="cf-acts cf-acts--row">${cta('DOWNLOAD PDF', { kind: 'ghost', icon: 'download' })}</div><p class="cf-note">NO PASSWORDS ARE STORED IN RECORDS. SITE 00 NEVER SHOWS A PASSWORD HERE.</p>`;
  return { area: 'records', body: `<div class="cf-hero cf-hero--wide" style="display:block">${head}${inner}</div>${foot('REC')}` };
}

// ─── I–L. PROPOSAL · RECOMMENDATIONS · ACCEPTANCE · AWAITING PAYMENT ───────────────────────────
const qline = (l, { x = false, tag = '' } = {}) =>
  `<div class="cf-q__r${x ? ' cf-q__r--x' : ''}"><div><div class="cf-q__n">${l.n}${tag ? ` ${tag}` : ''}</div><div class="cf-q__d">${l.d}</div></div><div class="cf-q__p">${money(l.p)}<small>${l.base ? 'BASE' : l.req ? 'RECOMMENDED · REQUIRED' : 'OPTIONAL'}</small></div></div>`;
export function proposal({ st: s = 'ready' }, t) {
  const ids = s === 'superseded' ? ['base', 'domain', 'mailbox', 'device'] : ACCEPTED;
  const sum = total(ids);
  const ver = s === 'superseded' ? `<span class="cf-ver cf-ver--old">PROPOSAL V1</span> <span class="cf-ver">PROPOSAL V2 · CURRENT</span>` : `<span class="cf-ver">PROPOSAL V2 · OCT 15</span>`;
  const q = `<div class="cf-q">${LINES.filter((l) => ids.includes(l.id)).map((l) => qline(l, { tag: l.founder ? st('prog', 'ADDED BY SITE 00') : '' })).join('')}<div class="cf-q__r cf-q__r--tot"><div><div class="cf-q__n">TOTAL · ONE TIME</div><div class="cf-q__d">USD · THIRD-PARTY SUBSCRIPTIONS MAY BE SEPARATE</div></div><div class="cf-q__p">${money(sum)}</div></div></div>`;
  const note =
    s === 'superseded'
      ? alert('YOUR PROPOSAL WAS UPDATED', 'SITE 00 ADDED DNS CLEANUP AFTER REVIEW (+$150). PROPOSAL V1 CAN NO LONGER BE ACCEPTED OR PAID. NOTHING CHANGED WITHOUT TELLING YOU.', { icon: 'updated' })
      : s === 'founder'
        ? alert('A NOTE FROM SITE 00', '“YOUR OLD PROVIDER LEFT RECORDS THAT WILL CONFLICT WITH NEW EMAIL. I’VE ADDED DNS CLEANUP SO DELIVERY IS RELIABLE.”', { kind: 'ink', icon: 'message' })
        : '';
  const body = `${hero({ i: '03', l: 'PERSONALIZED PROPOSAL', lines: t === 'm' ? ['YOUR', 'PROPOSAL', 'IS READY'] : ['YOUR PROPOSAL', 'IS READY'], lede: `PREPARED FOR ${C.biz}. APPROVED BY SITE 00 BEFORE IT REACHED YOU.`, etch: 'PROPOSAL V2', extra: `<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">${ver}</div>` })}
    ${note ? `<div class="cf-sec">${note}</div>` : ''}
    ${wide(t) ? `<div class="cf-cols"><div>${sec('YOUR SCOPE', q)}</div><div>${sec('WHY THIS SCOPE', `<ul class="cf-rows">${row({ icon: 'domain', t: 'YOU NEED A NEW DOMAIN', s: 'SO YOUR EMAIL MATCHES YOUR BUSINESS.' })}${row({ icon: 'dns', t: 'OLD DNS RECORDS FOUND', s: 'THEY WOULD BREAK EMAIL DELIVERY.' })}${row({ icon: 'device', t: 'ONE PHONE TO SET UP', s: 'SO YOU CAN SEND FROM DAY ONE.' })}</ul>`)}${sec('TIMING', `<p class="cf-note"><b>2–3 BUSINESS DAYS</b> AFTER PAYMENT AND WHAT WE NEED FROM YOU.</p>`)}</div></div>` : sec('YOUR SCOPE', q) + sec('TIMING', `<p class="cf-note"><b>2–3 BUSINESS DAYS</b> AFTER PAYMENT AND WHAT WE NEED FROM YOU. NOT A GUARANTEED DATE.</p>`)}
    <div class="cf-acts cf-acts--row">${cta('REVIEW MY OPTIONS', { kind: 'out' })}${cta('ACCEPT PROPOSAL V2')}</div>
    <button class="cf-link" type="button">${ic('message')}REQUEST CLARIFICATION</button>
    <p class="cf-note">EXAMPLE PRICING FOR AUTHORITY REVIEW — NOT A LIVE CHARGE. THE LIVE CATALOG IS THE SOURCE OF TRUTH.</p>${foot('004')}`;
  return { area: 'overview', badge: 1, pre: true, body, aside: `${nextStep('ACCEPT, THEN PAY ON STRIPE', 'YOU ACCEPT THIS EXACT VERSION. IF SITE 00 CHANGES ANYTHING, YOU’LL SEE A NEW VERSION AND ACCEPT AGAIN.')}` };
}

const REC_CARDS = [
  { n: 'DNS CLEANUP', p: 15000, icon: 'dns', req: true, what: 'REMOVE OLD RECORDS LEFT BY A PREVIOUS PROVIDER.', why: 'WE FOUND 4 CONFLICTING RECORDS ON YOUR DOMAIN.', nec: 'REQUIRED FOR RELIABLE EMAIL.', dec: 'SENDS YOUR PROPOSAL BACK TO SITE 00 FOR REVIEW.' },
  { n: 'ADDITIONAL MAILBOX', p: 7500, icon: 'email', req: false, what: 'A SECOND MAILBOX — DISPATCH@.', why: 'YOU SAID TWO PEOPLE ANSWER CUSTOMERS.', nec: 'OPTIONAL.', dec: 'ONE MAILBOX ONLY. YOU CAN ADD ONE LATER.' },
  { n: 'EMAIL SIGNATURE', p: 15000, icon: 'signature', req: false, what: 'ONE SIGNATURE DESIGN ON EVERY MAILBOX.', why: 'CONSISTENT CONTACT DETAILS ON EVERY EMAIL.', nec: 'OPTIONAL.', dec: 'NO SIGNATURE IS SET UP.' },
];
export function recs({ st: s = 'default' }, t) {
  const card = (r, on, warn) => `<div class="cf-rec5"${warn ? ' style="border-color:var(--red)"' : ''}><div class="cf-rec5__h">${ic(r.icon)}<div style="flex:1"><div class="cf-row__t">${r.n}</div></div>${r.req ? st('open', 'RECOMMENDED · REQUIRED') : st('none', 'OPTIONAL')}</div>
    ${[['WHAT IT IS', r.what], ['WHY FOR YOU', r.why], ['NECESSARY?', r.nec], ['COST', `${money(r.p)} · ONE TIME · EXAMPLE`], ['IF YOU DECLINE', r.dec]].map(([k, v]) => `<div class="cf-rec5__r"><b>${k}</b><span>${v}</span></div>`).join('')}
    <div class="cf-rec5__f"><span class="cf-note" style="margin:0">${warn ? '<b style="color:var(--red)">DECLINED · NEEDS SITE 00 REVIEW</b>' : on ? 'INCLUDED IN YOUR PROPOSAL' : 'NOT INCLUDED'}</span><span class="cf-sw"><span class="${on ? 'on' : ''}">INCLUDE</span><span class="${on ? '' : 'on'}">DECLINE</span></span></div></div>`;
  const decReq = s === 'declined-required';
  const cards = REC_CARDS.map((r, i) => card(r, decReq && i === 0 ? false : i !== 2 || s === 'declined-optional' ? i !== 2 : false, decReq && i === 0)).join('');
  const body = `${hero({ i: '03', l: 'YOUR OPTIONS', lines: t === 'm' ? ['CHOOSE', 'WHAT FITS'] : ['CHOOSE WHAT FITS'], lede: 'EVERY RECOMMENDATION SAYS WHAT IT IS, WHY WE SUGGEST IT, WHETHER YOU NEED IT, WHAT IT COSTS AND WHAT HAPPENS IF YOU SAY NO.', obj: '', wide: true })}
    ${decReq ? `<div class="cf-sec">${alert('DNS CLEANUP IS REQUIRED FOR RELIABLE EMAIL', 'IF YOU DECLINE IT, SITE 00 REVIEWS YOUR PROPOSAL AGAIN BEFORE YOU CAN PAY. YOU’LL GET A NEW VERSION — NOTHING CHANGES SILENTLY.')}</div>` : ''}
    <div class="cf-sec cf-grid cf-grid--3">${cards}</div>
    <div class="cf-sec">${truthStrip([['PROPOSAL', decReq ? 'V2 → REVIEW' : 'V2'], ['TOTAL', decReq ? 'SET AFTER REVIEW' : money(total(ACCEPTED))]])}</div>
    <div class="cf-acts cf-acts--row">${decReq ? cta('SEND TO SITE 00 FOR REVIEW', { kind: 'ink', icon: 'send' }) + cta('KEEP DNS CLEANUP', { kind: 'out' }) : cta('CONTINUE TO ACCEPTANCE')}</div>${foot('004')}`;
  return { area: 'overview', badge: 1, pre: true, body };
}

export function accept({ st: s = 'ready' }, t) {
  const n = s === 'ready' ? 0 : s === 'partial' ? 2 : 3;
  const discl = window.__DF.DF_DISCLOSURES.map((d, i) => `<div class="cf-chk"><span class="cf-box${i < n ? ' cf-box--on' : ''}"></span><span>${d}</span></div>`).join('');
  const blocked = s === 'changed' || s === 'expired';
  const body = `${hero({ i: '04', l: 'APPROVAL', lines: s === 'accepted' ? ['ACCEPTED'] : t === 'm' ? ['ACCEPT', 'PROPOSAL V2'] : ['ACCEPT PROPOSAL V2'], lede: s === 'accepted' ? 'YOU ACCEPTED PROPOSAL V2 ON OCT 16 · 1:51 PM. NEXT: SECURE PAYMENT ON STRIPE.' : 'YOU ARE ACCEPTING THIS EXACT VERSION — ITS SCOPE, PRICE AND TERMS. IF ANYTHING CHANGES, YOU’LL ACCEPT A NEW VERSION.', obj: '', wide: true })}
    ${s === 'changed' ? `<div class="cf-sec">${alert('YOUR PROPOSAL CHANGED SINCE YOU OPENED THIS PAGE', 'SITE 00 PUBLISHED PROPOSAL V3. V2 CAN NO LONGER BE ACCEPTED. REVIEW V3 BEFORE ACCEPTING.', { icon: 'updated' })}</div>` : ''}
    ${s === 'expired' ? `<div class="cf-sec">${alert('THIS PROPOSAL HAS EXPIRED', 'PROPOSALS ARE VALID FOR 14 DAYS. ASK SITE 00 FOR A FRESH ONE — IT ONLY TAKES A REPLY.', { icon: 'time' })}</div>` : ''}
    <div class="${wide(t) ? 'cf-cols' : ''}"><div>${sec('YOU ARE ACCEPTING', spec([['document', 'PROPOSAL', 'VERSION · ISSUED', blocked ? '<s>V2</s>' : 'V2', 'OCT 15 · 10:06 AM'], ['price', 'TOTAL', 'ONE TIME · USD · EXAMPLE', money(total(ACCEPTED))], ['time', 'TURNAROUND', 'AFTER PAYMENT + WHAT WE NEED', '2–3', 'BUSINESS DAYS'], ['text', 'TERMS', 'DIGITAL FOUNDATION TERMS', 'DF-TERMS-V1']]))}</div>
    <div>${s === 'accepted' ? sec('RECORDED', spec([['signed', 'ACCEPTED BY', 'FROM THIS LINK', C.contact], ['date', 'WHEN', 'RECORDED BY SITE 00', 'OCT 16 · 1:51 PM']])) : sec('CONFIRM', `<div class="cf-panel">${discl}</div>`)}</div></div>
    <div class="cf-acts cf-acts--row">${s === 'accepted' ? cta('CONTINUE TO SECURE PAYMENT', { icon: 'lock' }) : blocked ? cta(s === 'expired' ? 'ASK FOR A FRESH PROPOSAL' : 'REVIEW PROPOSAL V3', { kind: 'ink' }) : cta('ACCEPT PROPOSAL V2', { dis: n < 3 })}</div>
    ${s === 'ready' || s === 'partial' ? `<p class="cf-note">CONFIRM ALL THREE TO CONTINUE · ${n} OF 3 CONFIRMED.</p>` : ''}${foot('005')}`;
  return { area: 'overview', badge: 1, pre: true, body };
}

export function pay({ st: s = 'ready' }, t) {
  const L = {
    ready: ['YOUR FOUNDATION', 'IS READY TO BEGIN'], redirect: ['OPENING', 'SECURE CHECKOUT'], cancelled: ['PAYMENT', 'NOT COMPLETED'], failed: ['PAYMENT', 'DIDN’T GO THROUGH'], pending: ['CHECKOUT', 'IS OPEN'], blocked: ['ALMOST', 'READY'],
  }[s];
  const ML = { ready: ['YOUR', 'FOUNDATION', 'IS READY', 'TO BEGIN'] }[s] ?? L;
  const lede = {
    ready: 'YOU ACCEPTED PROPOSAL V2. PAYMENT HAPPENS ON STRIPE’S SECURE PAGE — NEVER ON THIS ONE.',
    redirect: 'TAKING YOU TO STRIPE. DON’T CLOSE THIS PAGE.',
    cancelled: 'YOU LEFT CHECKOUT BEFORE PAYING. NOTHING WAS CHARGED. YOUR ACCEPTED PROPOSAL IS STILL HERE.',
    failed: 'YOUR LAST PAYMENT DID NOT GO THROUGH. NOTHING WAS CHARGED. TRY AGAIN OR USE ANOTHER CARD ON STRIPE.',
    pending: 'A CHECKOUT FOR PROPOSAL V2 IS ALREADY OPEN. FINISH IT ON STRIPE, OR START A NEW ONE.',
    blocked: 'SITE 00 CONFIRMS PART OF THIS SCOPE BEFORE CHECKOUT OPENS. WE’LL EMAIL YOU WHEN YOU CAN PAY.',
  }[s];
  const btn = { ready: cta('PAY SECURELY ON STRIPE', { icon: 'lock' }), redirect: `<button class="cf-cta cf-cta--busy" type="button" aria-busy="true"><span>OPENING STRIPE…</span></button>`, cancelled: cta('RETURN TO SECURE PAYMENT', { icon: 'lock' }), failed: cta('TRY PAYMENT AGAIN', { icon: 'retry' }), pending: cta('CONTINUE ON STRIPE', { icon: 'external' }), blocked: cta('PAY SECURELY ON STRIPE', { dis: true, icon: 'lock' }) }[s];
  const body = `${hero({ i: '04', l: 'APPROVAL & PAYMENT', lines: t === 'm' ? ML : L, lede, etch: 'AWAITING PAYMENT' })}
    ${s === 'failed' ? `<div class="cf-sec">${alert('NOTHING WAS CHARGED', 'STRIPE REPORTED THE PAYMENT AS FAILED. YOUR PROPOSAL AND ACCEPTANCE ARE UNCHANGED.')}</div>` : ''}
    ${s === 'cancelled' ? `<div class="cf-sec">${alert('CHECKOUT CANCELLED', 'NOTHING WAS CHARGED.', { kind: 'muted', icon: 'info' })}</div>` : ''}
    <div class="${wide(t) ? 'cf-cols' : ''}"><div>${sec('YOU ARE PAYING FOR', spec([['document', 'PROPOSAL V2', 'ACCEPTED OCT 16 · 1:51 PM', money(total(ACCEPTED)), 'USD · ONE TIME · EXAMPLE'], ['time', 'TURNAROUND', 'STARTS AFTER PAYMENT + WHAT WE NEED', '2–3', 'BUSINESS DAYS'], ['payment', 'PAID ON', 'STRIPE HOSTED CHECKOUT', 'CARD DETAILS NEVER TOUCH SITE 00']]))}</div>
    <div>${sec('HOW PAYMENT IS CONFIRMED', `<ol class="cf-rows">${row({ icon: 'external', t: '01  YOU PAY ON STRIPE', s: 'A STRIPE PAGE OPENS FOR THIS EXACT PROPOSAL.' })}${row({ icon: 'security', t: '02  STRIPE CONFIRMS TO SITE 00', s: 'ONLY STRIPE’S CONFIRMATION STARTS YOUR PROJECT.' })}${row({ icon: 'bolt', t: '03  YOUR SETUP STARTS', s: 'YOU’LL SEE IT HERE AND BY EMAIL.' })}</ol>`)}</div></div>
    <div class="cf-acts">${btn}</div>${trust('SECURE CHECKOUT BY STRIPE · NOTHING IS CHARGED HERE')}${foot('005')}`;
  return { area: 'overview', badge: 1, pre: true, body, aside: nextStep('PAY ON STRIPE', 'THE AMOUNT AND VERSION ARE LOCKED TO YOUR ACCEPTANCE. IF SITE 00 CHANGES THE PROPOSAL, THIS CHECKOUT CLOSES AND YOU ACCEPT AGAIN.') };
}

// ─── M. PAYMENT CONFIRMATION ───────────────────────────────────────────────────────────────────
export function confirm({ st: s = 'verifying' }, t) {
  const L = { verifying: ['CONFIRMING', 'YOUR PAYMENT'], delayed: ['STILL', 'CONFIRMING'], confirmed: ['YOUR FOUNDATION', 'IS UNDERWAY'], error: ['WE COULDN’T', 'CONFIRM YET'] }[s];
  const ML = { confirmed: ['YOUR', 'FOUNDATION', 'IS', 'UNDERWAY'] }[s] ?? L;
  const lede = {
    verifying: 'YOU’RE BACK FROM STRIPE. WE’RE WAITING FOR STRIPE TO CONFIRM YOUR PAYMENT TO SITE 00. RETURNING HERE DOES NOT MARK IT PAID.',
    delayed: 'STRIPE HASN’T CONFIRMED YET. THIS CAN TAKE A FEW MINUTES. YOU CAN CLOSE THIS PAGE — WE’LL EMAIL YOU WHEN IT’S CONFIRMED.',
    confirmed: 'PAYMENT CONFIRMED BY STRIPE. YOUR FOUNDATION SETUP HAS STARTED.',
    error: 'WE COULDN’T CHECK YOUR PAYMENT STATUS. IF YOU PAID, NOTHING IS LOST — STRIPE’S CONFIRMATION STILL REACHES US.',
  }[s];
  const status = s === 'confirmed' ? `<div class="cf-alert cf-alert--ink" role="status">${ic('confirmed')}<div class="cf-alert__b"><div class="cf-alert__t">PAYMENT CONFIRMED</div><div class="cf-alert__s">VERIFIED BY STRIPE · OCT 16 · 1:58 PM · PROPOSAL V2</div></div></div>` : s === 'error' ? alert('STATUS CHECK FAILED', 'TRY AGAIN, OR WAIT FOR OUR EMAIL.') : `<div class="cf-alert cf-alert--muted" role="status">${ic('pending')}<div class="cf-alert__b"><div class="cf-alert__t">${s === 'delayed' ? 'WAITING FOR STRIPE' : 'CHECKING WITH STRIPE…'}</div><div class="cf-alert__s">${s === 'delayed' ? 'CHECKED 10 TIMES · NOT CONFIRMED YET' : 'CHECK 3 OF 10'}</div></div></div>`;
  const body = `${hero({ i: s === 'confirmed' ? '05' : '04', l: s === 'confirmed' ? 'FOUNDATION SETUP' : 'PAYMENT', lines: t === 'm' ? ML : L, lede, etch: s === 'confirmed' ? 'UNDERWAY' : 'CONFIRMING' })}
    <div class="cf-sec">${status}</div>
    ${s === 'confirmed' ? `<div class="cf-sec">${t === 'm' ? ticks('underway') : strip('underway')}</div>${sec('NEEDS YOU · 1', `<ul class="cf-rows">${row({ icon: 'attention', t: 'CHOOSE YOUR EMAIL ADDRESS', s: 'THE FIRST THING WE NEED FROM YOU.', red: true, arrow: true })}</ul>`, { red: true })}${sec('YOUR FOUNDATION', spec([['payment', 'PAYMENT', 'VERIFIED BY STRIPE', 'CONFIRMED'], ['stage', 'CURRENT STAGE', 'FROM YOUR PROJECT RECORD', 'FOUNDATION SETUP'], ['time', 'TURNAROUND', 'ONCE WE HAVE WHAT WE NEED', '2–3', 'BUSINESS DAYS']]))}<div class="cf-acts cf-acts--row">${cta('GO TO MY FOUNDATION', { icon: 'home' })}${cta('SAVE YOUR FOUNDATION', { kind: 'out', icon: 'download' })}</div>` : `<div class="cf-acts cf-acts--row">${s === 'verifying' ? `<button class="cf-cta cf-cta--dis" type="button" aria-disabled="true"><span>CHECKING…</span></button>` : cta('CHECK AGAIN', { icon: 'retry' })}</div><p class="cf-note">WE NEVER MARK A PAYMENT AS PAID FROM THIS PAGE. ONLY STRIPE’S SIGNED CONFIRMATION DOES.</p>`}
    ${foot('006')}`;
  return { area: 'overview', badge: s === 'confirmed' ? 1 : 0, pre: s !== 'confirmed', body, nav: s === 'confirmed' };
}

// ─── N. PROJECT IN PROGRESS (workstreams) ──────────────────────────────────────────────────────
export const WORKSTREAMS = [
  ['domain', 'DOMAIN', 'NORTHLINETRANSPORT.CO REGISTERED IN YOUR NAME.', 'done'],
  ['user', 'OWNERSHIP', 'YOU ARE THE REGISTRANT AND ADMIN CONTACT.', 'done'],
  ['email', 'EMAIL', 'SETTING UP 2 MAILBOXES.', 'prog'],
  ['dns', 'DNS', 'WAITING ON YOUR REGISTRAR APPROVAL.', 'open'],
  ['security', 'SECURITY', 'SPF, DKIM, DMARC AND 2-STEP SIGN-IN.', 'none'],
  ['device', 'DEVICE', 'YOUR PHONE, ONCE EMAIL WORKS.', 'none'],
  ['check', 'VERIFICATION', 'EVERYTHING TESTED BEFORE HANDOFF.', 'none'],
  ['folder', 'RECORDS', '3 READY · 4 NOT CREATED YET.', 'prog'],
];
const WS_LABEL = { done: ['done', 'DONE'], prog: ['prog', 'IN PROGRESS'], open: ['open', 'NEEDS YOU'], none: ['none', 'NOT STARTED'], block: ['block', 'BLOCKED'], wait: ['wait', 'WAITING ON PROVIDER'] };
export function workstreams(mode = 'active', t = 'd', compact = false) {
  const list = WORKSTREAMS.map((w) => (mode === 'blocked' && w[1] === 'DNS' ? [w[0], w[1], 'PAUSED — WE NEED YOUR REGISTRAR APPROVAL.', 'block'] : mode === 'provider' && w[1] === 'DNS' ? [w[0], w[1], 'YOUR REGISTRAR IS CONFIRMING A CHANGE.', 'wait'] : w));
  return `<div class="cf-grid ${compact ? 'cf-grid--2' : 'cf-grid--4'}">${list.map(([icon, n, s, k]) => `<div class="cf-ws${k === 'none' ? ' cf-ws--quiet' : ''}">${ic(icon)}<span class="cf-ws__n">${n}</span><span class="cf-ws__s">${s}</span><span class="cf-ws__f">${st(...WS_LABEL[k])}</span></div>`).join('')}</div>`;
}
export function progress({ st: s = 'active' }, t) {
  const phase = s === 'provider' ? 'provider' : s === 'blocked' ? 'blocked' : 'underway';
  const body = `${hero({ i: '05', l: 'FOUNDATION SETUP', lines: t === 'm' ? ['YOUR', 'FOUNDATION', 'IS', 'UNDERWAY'] : ['YOUR FOUNDATION', 'IS UNDERWAY'], lede: s === 'provider' ? 'WE’RE WAITING ON YOUR DOMAIN REGISTRAR. NOTHING IS NEEDED FROM YOU.' : s === 'blocked' ? 'SETUP IS PAUSED ON ONE STEP ONLY YOU CAN TAKE.' : 'EIGHT WORKSTREAMS. EACH SHOWS ITS REAL STATE FROM YOUR PROJECT RECORD.', etch: 'SETUP' })}
    ${truthStrip([['STAGE', '5 OF 7 · FOUNDATION SETUP'], ['STARTED', 'OCT 16 · 2:03 PM'], ['TURNAROUND', s === 'blocked' ? 'PAUSED' : '2–3 BUSINESS DAYS']], notM(t) ? asof('4:31 PM') : '')}
    ${s === 'blocked' ? `<div class="cf-sec">${alert('PAUSED ON YOUR REGISTRAR APPROVAL', 'YOUR TURNAROUND RESUMES WHEN IT’S DONE.')}</div>` : ''}
    ${sec('WORKSTREAMS', workstreams(s === 'blocked' ? 'blocked' : s === 'provider' ? 'provider' : 'active', t))}
    <p class="cf-note">WORKSTREAMS WITH NO RECORDED WORK SHOW “NOT STARTED”. WE NEVER ANIMATE PROGRESS THAT ISN’T HAPPENING.</p>${foot('009')}`;
  return { area: 'roadmap', badge: s === 'provider' ? 0 : 1, body, aside: `<div class="cf-sec" style="margin-top:0"><h2 class="cf-sec__h">ACTIVITY <small>REAL EVENTS</small></h2>${activityList(EVENTS.underway.slice(0, 4))}</div>` };
}

// ─── O. FINAL VERIFICATION ─────────────────────────────────────────────────────────────────────
export function verify({ st: s = 'checking' }, t) {
  const checks = [['domain', 'DOMAIN RESOLVES', 'PASSED · OCT 20', 'done'], ['email', 'EMAIL SENDS AND RECEIVES', 'PASSED · OCT 20', 'done'], ['security', 'SPF · DKIM · DMARC', s === 'review' ? 'PASSED · OCT 21' : 'CHECKING', s === 'review' ? 'done' : 'prog'], ['device', 'YOUR PHONE SIGNS IN', s === 'review' ? 'PASSED · OCT 21' : 'NOT STARTED', s === 'review' ? 'done' : 'none'], ['folder', 'RECORDS COMPLETE', s === 'review' ? 'READY FOR YOUR REVIEW' : 'NOT STARTED', s === 'review' ? 'open' : 'none']];
  const body = `${hero({ i: '06', l: 'FINAL VERIFICATION', lines: t === 'm' ? ['FINAL', 'VERIFI-', 'CATION'] : ['FINAL', 'VERIFICATION'], lede: s === 'review' ? 'EVERY CHECK PASSED. ONE LAST STEP: REVIEW YOUR FOUNDATION HANDOFF RECORD.' : 'SITE 00 IS CHECKING EVERY PART OF YOUR FOUNDATION BEFORE HANDOFF.', etch: 'VERIFYING' })}
    ${sec('CHECKS', `<ul class="cf-rows">${checks.map(([i, n, x, k]) => row({ icon: i, t: n, s: x, v: st(...WS_LABEL[k]), red: k === 'open' })).join('')}</ul>`)}
    ${s === 'review' ? `<div class="cf-acts cf-acts--row">${cta('REVIEW MY HANDOFF RECORD', { icon: 'document' })}</div>` : ''}${foot('011')}`;
  return { area: 'roadmap', badge: s === 'review' ? 1 : 0, body };
}

// ─── P. COMPLETION ─────────────────────────────────────────────────────────────────────────────
export function complete({ st: s = 'established' }, t) {
  const build = s === 'build';
  const body = `${hero({ i: '07', l: 'COMPLETE', lines: t === 'm' ? ['YOUR', 'FOUNDATION', 'IS', 'ESTABLISHED'] : ['YOUR FOUNDATION', 'IS ESTABLISHED'], lede: 'YOUR DOMAIN, EMAIL AND SECURITY ARE IN PLACE, VERIFIED AND OWNED BY YOU. YOUR RECORDS ARE READY.', etch: 'ESTABLISHED' })}
    <div class="cf-sec">${t === 'm' ? ticks('complete') : strip('complete')}</div>
    <div class="${wide(t) ? 'cf-cols' : ''}"><div>${sec('WHAT YOU OWN', spec([['domain', 'DOMAIN', 'REGISTERED TO YOU', 'NORTHLINETRANSPORT.CO'], ['email', 'BUSINESS EMAIL', '2 MAILBOXES', 'ACTIVE'], ['security', 'SECURITY', 'SPF · DKIM · DMARC · 2-STEP', 'VERIFIED'], ['folder', 'RECORDS', 'HANDOFF + 6 RECORDS', 'READY']]))}<div class="cf-acts cf-acts--row">${cta('VIEW MY RECORDS', { icon: 'folder' })}</div></div>
    <div>${sec('WHEN YOU’RE READY', `<div class="cf-panel${build ? ' cf-panel--red' : ''}"><div class="cf-row__t">BUILD ON YOUR FOUNDATION</div><p class="cf-note">A WEBSITE OR STOREFRONT ON THE DOMAIN YOU NOW OWN. ${build ? '<b>YOU ASKED US ABOUT THIS ON OCT 21. SITE 00 WILL REPLY BY EMAIL.</b>' : 'NOTHING IS SCHEDULED OR CHARGED. TELL US ONLY IF YOU’RE INTERESTED.'}</p>${build ? st('sub', 'INTEREST SENT') : `<button class="cf-link" type="button">I’M INTERESTED${ic('next')}</button>`}</div>`)}</div></div>
    ${trust('YOUR FOUNDATION STAYS YOURS. THIS LINK STAYS OPEN FOR YOUR RECORDS.')}${foot('012')}`;
  return { area: 'overview', badge: 0, body, aside: `<div class="cf-sec" style="margin-top:0"><h2 class="cf-sec__h">ACTIVITY</h2>${activityList(EVENTS.complete)}</div>` };
}

// ─── Q. ACTIVITY TIMELINE ──────────────────────────────────────────────────────────────────────
export function activity({ st: s = 'full' }, t) {
  const ev = s === 'early' ? EVENTS.review : EVENTS.underway;
  const body = `${hero({ i: '—', l: 'ACTIVITY', lines: t === 'm' ? ['WHAT', 'HAPPENED'] : ['WHAT HAPPENED'], lede: 'EVERY ENTRY IS A RECORDED EVENT WITH ITS TIME. NOTHING HERE IS SIMULATED, AND INTERNAL NOTES NEVER APPEAR.', obj: '', wide: true })}
    <div class="cf-sec">${activityList(ev)}</div>${s === 'early' ? `<p class="cf-note">MORE APPEARS HERE AS YOUR FOUNDATION MOVES.</p>` : ''}${foot('ACT')}`;
  return { area: 'roadmap', badge: s === 'early' ? 0 : 1, body };
}

// ─── R. NOTIFICATION / STATUS (email design + preferences + refresh) ───────────────────────────
export function email({ st: s = 'review' }, t) {
  const subj = { review: 'YOUR FOUNDATION IS TAKING SHAPE', proposal: 'YOUR PERSONALIZED PROPOSAL IS READY', underway: 'YOUR FOUNDATION IS UNDERWAY', needs: 'YOUR FOUNDATION NEEDS ONE THING FROM YOU', link: 'YOUR SITE 00 SIGN-IN LINK' }[s];
  const pre = { review: 'WE’VE RECEIVED YOUR INTAKE AND ARE PREPARING YOUR PERSONALIZED PROPOSAL.', proposal: 'REVIEW YOUR SCOPE AND OPTIONS, THEN ACCEPT WHEN YOU’RE READY.', underway: 'PAYMENT CONFIRMED BY STRIPE. SETUP HAS STARTED.', needs: 'CONNECT YOUR DOMAIN REGISTRAR — ABOUT TWO MINUTES.', link: 'THIS LINK WORKS ONCE AND EXPIRES IN 15 MINUTES.' }[s];
  const lines = { review: ['YOUR FOUNDATION', 'IS TAKING SHAPE'], proposal: ['YOUR PROPOSAL', 'IS READY'], underway: ['YOUR FOUNDATION', 'IS UNDERWAY'], needs: ['ONE THING', 'NEEDS YOU'], link: ['SIGN IN TO', 'YOUR FOUNDATION'] }[s];
  const ctaL = s === 'link' ? 'OPEN MY FOUNDATION' : 'VIEW MY FOUNDATION';
  const body = `<div class="em"><div class="em__meta"><b>SUBJECT</b><span>${subj}</span><b>PREHEADER</b><span>${pre}</span><b>TO</b><span>${C.email}</span><b>STATUS</b><span style="color:var(--red)">DESIGN ONLY · NOT SENT · SENDING DISABLED</span></div>
    <div class="em__body"><div class="cf-brand"><span class="cf-brand__mark">SITE 00</span><span class="cf-brand__prod">DIGITAL FOUNDATION</span></div>
    <div class="em__obj">${DF.objects.crown}</div>
    <div style="position:relative;z-index:1;max-width:72%;margin-top:22px">${rail('—', s === 'link' ? 'SECURE SIGN-IN' : s === 'review' ? 'INTAKE RECEIVED' : 'YOUR FOUNDATION')}${hl(lines)}<p class="cf-lede">${s === 'review' ? "YOUR INTAKE HAS BEEN RECEIVED. WE'RE REVIEWING YOUR REQUIREMENTS AND PREPARING YOUR PERSONALIZED FOUNDATION PROPOSAL." : pre}</p></div>
    <div style="position:relative;z-index:1">${s === 'review' ? spec([['business', 'BUSINESS', 'FROM YOUR INTAKE', C.short], ['date', 'RECEIVED', 'OCT 14', '4:12 PM'], ['review', 'NEXT', 'SITE 00 REVIEW', 'PROPOSAL BY EMAIL']]) : ''}
    ${s === 'review' ? `<div class="cf-sec"><h2 class="cf-sec__h">WHAT HAPPENS NEXT</h2><p class="cf-note">SITE 00 REVIEWS YOUR REQUIREMENTS AND PREPARES YOUR PERSONALIZED PROPOSAL. EVERY PROPOSAL IS APPROVED BY SITE 00 BEFORE YOU SEE IT. NOTHING IS CHARGED UNTIL YOU ACCEPT.</p></div><div class="cf-sec"><h2 class="cf-sec__h">WHEN WE’LL BE IN TOUCH</h2><p class="cf-note">WE EMAIL YOU WHEN YOUR PROPOSAL IS READY, OR SOONER IF WE NEED ANYTHING FROM YOU.</p></div><div class="cf-sec"><h2 class="cf-sec__h">HOW TO RETURN</h2><p class="cf-note">TAP VIEW MY FOUNDATION IN ANY SITE 00 EMAIL. ON YOUR PHONE, SAVE YOUR FOUNDATION TO YOUR HOME SCREEN FOR ONE-TAP ACCESS.</p></div>` : ''}
    ${cta(ctaL)}<p class="cf-note">${s === 'link' ? 'IF YOU DIDN’T ASK FOR THIS, IGNORE IT. NO ONE CAN SIGN IN WITHOUT THIS EMAIL.' : 'THIS BUTTON ASKS YOU TO CONFIRM YOUR EMAIL IF YOU’RE ON A NEW DEVICE. IT IS NOT A PASSWORD.'}</p></div>
    <div class="em__foot">SITE 00 · DIGITAL FOUNDATION · REF ${C.ref}<br>YOU’RE RECEIVING THIS BECAUSE YOU STARTED A DIGITAL FOUNDATION WITH SITE 00. ESSENTIAL PROJECT EMAILS CAN’T BE TURNED OFF WHILE YOUR PROJECT IS OPEN.</div></div></div>`;
  return { raw: body };
}

export function prefs({ st: s = 'default' }, t) {
  const r = (n, d, on, lock = false) => `<li class="cf-row"><div class="cf-row__tx"><div class="cf-row__t">${n}</div><div class="cf-row__s">${d}</div></div><span class="cf-sw${lock ? ' cf-sw--lock' : ''}"><span class="${on ? 'on' : ''}">ON</span><span class="${on ? '' : 'on'}">OFF</span></span></li>`;
  const body = `${hero({ i: '—', l: 'UPDATES', lines: t === 'm' ? ['HOW WE', 'REACH YOU'] : ['HOW WE REACH YOU'], lede: `EMAIL IS HOW SITE 00 KEEPS YOU UPDATED AND HOW YOU SIGN BACK IN. UPDATES GO TO ${C.email}.`, obj: '', wide: true })}
    ${sec('EMAIL', `<ul class="cf-rows">${r('PROJECT ESSENTIALS', 'PROPOSAL, PAYMENT, NEEDS YOU, COMPLETION, SIGN-IN LINKS. REQUIRED WHILE YOUR PROJECT IS OPEN.', true, true)}${r('STAGE UPDATES', 'WHEN YOUR FOUNDATION MOVES TO A NEW STAGE.', true)}${r('FROM SITE 00 LATER', 'IDEAS FOR BUILDING ON YOUR FOUNDATION. OFF UNLESS YOU TURN IT ON.', false)}</ul>`)}
    ${sec('ON THIS DEVICE', `<ul class="cf-rows">${row({ icon: 'notification', t: 'PUSH NOTIFICATIONS', s: s === 'push' ? 'NOT AVAILABLE YET. WE’LL NEVER ASK FOR PERMISSION WHEN YOU FIRST OPEN YOUR FOUNDATION.' : 'NOT AVAILABLE YET · A FUTURE OPTION. EMAIL STAYS PRIMARY.', v: st('none', 'NOT OFFERED'), dash: true })}</ul>`)}
    <div class="cf-acts cf-acts--row">${cta('SAVE PREFERENCES', { kind: 'ink', icon: 'check' })}</div>${foot('COM')}`;
  return { area: 'overview', body };
}

// ─── S. EMPTY / ERROR / BLOCKED ────────────────────────────────────────────────────────────────
export const ERRORS = {
  offline: { i: '00', l: 'OFFLINE', lines: ['YOU’RE', 'OFFLINE'], b: 'YOUR FOUNDATION WILL LOAD WHEN YOU’RE BACK ONLINE. NOTHING YOU SAVED IS LOST.', a: 'TRY AGAIN', icon: 'network' },
  load: { i: '00', l: 'YOUR FOUNDATION', lines: ['WE COULDN’T', 'LOAD THIS'], b: 'SOMETHING WENT WRONG ON OUR SIDE. NOTHING YOU SAVED WAS LOST. PLEASE TRY AGAIN.', a: 'TRY AGAIN', icon: 'retry' },
  unavailable: { i: '00', l: 'YOUR FOUNDATION', lines: ['BACK', 'SHORTLY'], b: 'YOUR FOUNDATION IS TEMPORARILY UNAVAILABLE. YOUR PROJECT IS SAFE AND KEEPS MOVING. TRY AGAIN IN A FEW MINUTES.', a: 'TRY AGAIN', icon: 'time' },
  paused: { i: '00', l: 'PROJECT PAUSED', lines: ['PROJECT', 'PAUSED'], b: 'YOUR PAYMENT WAS REFUNDED OR DISPUTED, SO WORK IS PAUSED. SITE 00 WILL CONTACT YOU BY EMAIL.', a: 'CONTACT SITE 00', icon: 'blocked' },
  closed: { i: '00', l: 'FOUNDATION LINK', lines: ['THIS LINK', 'HAS BEEN', 'CLOSED'], b: 'THIS DIGITAL FOUNDATION LINK IS NO LONGER ACTIVE. IF YOU THINK THAT’S A MISTAKE, REPLY TO THE MESSAGE IT CAME IN.', a: '', icon: 'lock' },
  action: { i: '03', l: 'NEEDS YOU', lines: ['THAT DIDN’T', 'SEND'], b: 'WE COULDN’T SUBMIT YOUR ANSWER. IT’S STILL HERE — TRY AGAIN.', a: 'TRY AGAIN', icon: 'warning' },
  checkout: { i: '04', l: 'PAYMENT', lines: ['CHECKOUT IS', 'UNAVAILABLE'], b: 'SECURE CHECKOUT IS UNAVAILABLE RIGHT NOW. NOTHING WAS CHARGED. PLEASE TRY AGAIN SHORTLY.', a: 'TRY AGAIN', icon: 'payment' },
  record: { i: '04', l: 'RECORDS', lines: ['RECORD', 'NOT FOUND'], b: 'THIS RECORD ISN’T AVAILABLE. IT MAY NOT HAVE BEEN CREATED YET.', a: 'BACK TO RECORDS', icon: 'folder' },
};
export function error({ k = 'load' }, t) {
  const e = ERRORS[k];
  const body = `<div class="cf-sys">${hero({ i: e.i, l: e.l, lines: e.lines, lede: e.b, obj: t === 'm' ? '' : 'corner', etch: '' })}${e.a ? `<div class="cf-acts cf-acts--row">${cta(e.a, { icon: e.icon === 'retry' || e.a === 'TRY AGAIN' ? 'retry' : 'next' })}</div>` : ''}${trust(k === 'closed' ? 'NO DATA IS SHOWN ON A CLOSED LINK.' : 'YOUR PROJECT IS SAFE.')}${foot('000')}</div>`;
  return { area: 'overview', body, nav: k === 'action' || k === 'record' };
}
