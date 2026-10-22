// Composite founder-workspace parts, built from fw-kit primitives. Fictional DEMO identities only.
import { DF, DEMO, SYNTH, icon, CHEV, ARROW, PLUS, CHECK, mk, status, chip, btn, plate, seg, journey, tabs, kv, nrow, act, mhead, mtitle, money, PHASES } from './fw-kit.js';

export const segFor = (phase, k) =>
  seg(PHASES.map((_, i) => (i < phase ? 'd' : i === phase ? (k === 'founder' ? 'c' : k === 'blocked' ? 'b' : 'd') : '')));

// ─── Registry ───────────────────────────────────────────────────────────────
export function mRow(c, { sel = false } = {}) {
  return `<div class="fw-row ${sel ? 'fw-row--sel' : ''}">${plate(c.name, { attn: c.k === 'founder', test: c.test })}
    <div class="fw-who"><b>${c.name}</b><span>${c.cat}</span>
      <div class="fw-row__status">${status(c.k, c.state)}<span class="fw-meta">${c.last ?? ''}</span></div>
      <div style="margin-top:8px">${segFor(c.phase, c.k)}</div>
    </div>${CHEV}</div>`;
}

export function dTable(rows, sel = -1) {
  return `<table class="fw-table"><thead><tr><th>CLIENT</th><th>PHASE</th><th style="width:150px">JOURNEY</th><th>WHOSE MOVE</th><th>NEXT ACTION</th><th>LAST ACTIVITY</th><th></th></tr></thead><tbody>${rows
    .map(
      (c, i) => `<tr class="${i === sel ? 'sel' : ''}"><td><span class="fw-row-flex">${plate(c.name, { attn: c.k === 'founder', size: 'sm', test: c.test })}<span class="fw-who"><b style="font-size:10px">${c.name}</b><span>${c.cat}</span></span></span></td>
      <td>${status(c.k, c.state)}</td><td>${segFor(c.phase, c.k)}<div class="fw-meta" style="margin-top:6px">STEP ${c.phase + 1} OF 8 · ${PHASES[c.phase]}</div></td>
      <td><span class="fw-meta" style="color:var(--fw-ink)">${c.who}</span></td><td class="wrap" style="max-width:190px">${c.next}</td><td class="fw-meta">${c.last}</td><td>${CHEV}</td></tr>`,
    )
    .join('')}</tbody></table>`;
}

// ─── Client inspector (desktop) ─────────────────────────────────────────────
export function clientInspector(c, { foot = true } = {}) {
  return `<div class="fw-insp__head">
      <div class="fw-insp__bar"><span class="fw-label">CLIENT PREVIEW</span><span class="fw-row-flex">${icon('external', '', 'style="width:15px;height:15px"')}${icon('close', '', 'style="width:16px;height:16px"')}</span></div>
      <div class="fw-row-flex" style="gap:14px">${plate(c.name, { attn: c.k === 'founder', size: 'lg' })}<div class="fw-who"><b style="font-size:15px">${c.name}</b><span>${c.cat}</span><span class="fw-data" style="font-size:10px;color:var(--fw-ink-2)">${c.email}</span></div></div>
    </div>
    <div class="fw-insp__body">
      <div class="fw-between">${status(c.k, c.state)}<span class="fw-meta">STEP ${c.phase + 1} OF 8</span></div>
      ${journey(c.phase, { kind: c.k === 'client' ? 'client' : 'cur', labels: ['INV', 'INT', 'REC', 'QTE', 'PAY', 'SET', 'VER', 'DONE'] })}
      <div class="fw-focus" style="box-shadow:inset 3px 0 0 ${c.k === 'founder' ? 'var(--fw-red)' : 'var(--fw-ink)'}"><div class="fw-focus__k"><span class="fw-label">NEXT ACTION · ${c.who}</span></div><div style="font-size:12px;font-weight:700;letter-spacing:.14em">${c.next}</div></div>
      ${kv([
        ['PERSONAL LINK', '/foundation/ab12…9zQ', true],
        ['LAST ACTIVITY', c.last],
        ['QUOTE', c.phase >= 3 ? `${money(DF.config.base_price_minor + 10000)} · V2` : 'NOT YET'],
      ])}
      <div><span class="fw-label">RECENT MOVEMENT</span><div class="fw-mt8">${act('2H', 'client', 'INTAKE SAVED', 'BUSINESS INFORMATION')}${act('1D', 'client', 'LINK OPENED')}${act('2D', 'work', 'FOUNDATION CREATED', 'BY FOUNDER')}</div></div>
    </div>
    ${foot ? `<div class="fw-insp__foot">${btn('OPEN FOUNDATION', { block: true })}<span class="fw-btn fw-btn--out" style="width:44px;padding:0">${icon('link', '', 'style="width:16px;height:16px"')}</span><span class="fw-btn fw-btn--out" style="width:44px;padding:0">${icon('more', '', 'style="width:16px;height:16px"')}</span></div>` : ''}`;
}

// ─── Overview parts ─────────────────────────────────────────────────────────
export function signals(on = -1, vals = [6, 3, 4, 12]) {
  const items = [
    ['ACTIVE', vals[0], 'd'],
    ['NEEDS REVIEW', vals[1], 'attn'],
    ['AWAITING CLIENT', vals[2], 'c'],
    ['COMPLETE', vals[3], 'done'],
  ];
  return `<div class="fw-signals">${items
    .map(
      ([l, v, k], i) => `<div class="fw-sig ${i === on ? 'fw-sig--on' : ''} ${k === 'attn' && i !== on ? 'fw-sig--attn' : ''}"><span class="fw-num">${v}</span><span class="fw-label">${l}</span></div>`,
    )
    .join('')}</div>`;
}

export function focusBlock(c, { compact = false } = {}) {
  return `<div class="fw-focus">
    <div class="fw-focus__k"><span class="fw-st fw-st--founder">${mk('founder')}CURRENT FOCUS · FOUNDER DECISION</span><span class="fw-meta">${c.last}</span></div>
    <div class="fw-row-flex" style="gap:12px">${plate(c.name, { attn: true })}<div class="fw-who"><b style="font-size:13px">${c.name}</b><span>${c.cat}</span></div></div>
    <div class="fw-focus__t" style="font-size:${compact ? 24 : 28}px">INTAKE COMPLETE —<br>READY FOR YOUR REVIEW<i class="fw-period"></i></div>
    <div class="fw-between">${btn('REVIEW INTAKE', { sm: compact })}<span class="fw-meta">1 OF 3 DECISIONS</span></div>
  </div>`;
}

// ─── Reviews ────────────────────────────────────────────────────────────────
export const REVIEWS = [
  { c: DEMO[0], type: 'INTAKE', why: 'INTAKE COMPLETE', sub: 'AWAITING YOUR REVIEW', when: '1D AGO', cta: 'REVIEW INTAKE' },
  { c: DEMO[1], type: 'QUOTE', why: 'QUOTE NOT YET APPROVED', sub: 'MANUAL-REVIEW ADD-ON · CUSTOM PRICING', when: '3H AGO', cta: 'REVIEW QUOTE' },
  { c: DEMO[3], type: 'CLIENT REQUEST', why: 'CHANGE REQUESTED', sub: 'SIGNATURE · VERSION 2', when: '2D AGO', cta: 'REVIEW REQUEST' },
  { c: DEMO[5], type: 'EXCEPTION', why: 'TASK BLOCKED', sub: 'CLIENT AUTH REQUIRED · REGISTRAR', when: '4D AGO', cta: 'OPEN EXCEPTION', exc: true },
];

export function reviewItem(r, { compact = false } = {}) {
  return `<div class="fw-rv">
    <div class="fw-rv__top">${plate(r.c.name, { attn: !r.exc, size: compact ? 'sm' : '' })}<div class="fw-who"><b>${r.c.name}</b><span>${r.type} REVIEW</span></div><span class="fw-meta">${r.when}</span></div>
    <div class="fw-rv__why"><b>${r.exc ? `<span class="fw-st fw-st--founder">${mk('blocked')}${r.why}</span>` : `<span class="fw-st fw-st--founder">${mk('founder')}${r.why}</span>`}</b><span>${r.sub}</span></div>
    ${btn(r.cta, { block: true, sm: compact, tone: r.exc ? 'out' : '' })}
  </div>`;
}

// ─── Operations ─────────────────────────────────────────────────────────────
export const STAGES = [
  ['01', 'DETAILS RECEIVED', 'done'],
  ['02', 'DOMAIN', 'done'],
  ['03', 'PROFESSIONAL EMAIL', 'done'],
  ['04', 'DNS + SECURITY', 'cur'],
  ['05', 'DEVICE + SIGNATURE', ''],
  ['06', 'FINAL VERIFICATION', ''],
  ['07', 'FOUNDATION COMPLETE', ''],
];
export const stageRail = (stages = STAGES) =>
  `<div class="fw-stages">${stages.map(([n, l, s]) => `<div class="fw-stg ${s ? `fw-stg--${s}` : ''}"><b>${n}</b>${l}</div>`).join('')}</div>`;

export const TASKS = [
  { t: 'MX RECORDS', s: 'MX_CONFIGURE · DEPENDS ON MAILBOX', mode: 'ASSISTED', box: 'done', st: 'COMPLETE' },
  { t: 'SPF RECORD', s: 'SPF_CONFIGURE', mode: 'ASSISTED', box: 'done', st: 'COMPLETE' },
  { t: 'DKIM RECORD', s: 'DKIM_CONFIGURE · PROVIDER KEY NEEDED', mode: 'EXTERNAL_MANUAL', box: '', st: 'IN PROGRESS', k: 'work' },
  { t: 'DMARC POLICY', s: 'DMARC_CONFIGURE', mode: 'ASSISTED', box: '', st: 'READY', k: 'idle' },
  { t: 'APPROVE DNS CHANGE', s: 'APPROVE_DNS_CHANGE · CLIENT ACTION', mode: 'CLIENT_ACTION', box: 'wait', st: 'WAITING ON CLIENT', k: 'client' },
  { t: 'DNS VERIFICATION', s: 'MX · SPF · DKIM · DMARC MUST PASS', mode: 'VERIFICATION', box: 'wait', st: 'NOT READY · 2 DEPENDENCIES', k: 'idle' },
];
const modeCls = (m) => (m === 'CLIENT_ACTION' ? 'client' : m === 'VERIFICATION' ? 'verify' : m === 'AUTOMATED' ? 'auto' : '');
export const taskRow = (t, sel = false) =>
  `<div class="fw-task" style="${sel ? 'background:#fff;box-shadow:inset 2px 0 0 var(--fw-red);padding-left:10px' : ''}"><span class="fw-task__box ${t.box ? `fw-task__box--${t.box}` : ''}">${t.box === 'done' ? CHECK : ''}</span><span class="fw-task__t"><b>${t.t}</b><span>${t.s}</span></span><span class="fw-col" style="align-items:flex-end;gap:6px"><span class="fw-mode fw-mode--${modeCls(t.mode)}">${t.mode.replace('_', ' ')}</span>${t.k ? status(t.k, t.st) : `<span class="fw-meta">${t.st}</span>`}</span></div>`;

// ─── System ─────────────────────────────────────────────────────────────────
export const MODULES = [
  { ic: 'server', t: 'STAGING STACK', c: ['ok', 'STAGING ISOLATED'], p: 'FRONTEND + API ORIGINS MATCH · SUPABASE REF = STAGING' },
  { ic: 'database', t: 'PERSISTENCE', c: ['ok', 'SUPABASE · FLAG ON'], p: 'DURABLE ARTIFACTS + TOKENS · EVENTS NOT YET PERSISTED' },
  { ic: 'security', t: 'DATABASE SECURITY', c: ['ok', 'ANON DENIED'], p: 'RLS PROBE ON PROJECT MESSAGES · SERVICE ROLE ALLOWED' },
  { ic: 'email', t: 'EMAIL SENDING', c: ['policy', 'DISABLED BY POLICY', 'lock'], p: 'TRANSACTIONAL SEND FLAG OFF · ALLOWLIST ONLY WHEN ON', policy: true },
  { ic: 'domain', t: 'EMAIL DOMAIN · DKIM', c: ['req', 'NEEDS FOUNDER'], p: 'GODADDY DKIM + RESEND DOMAIN · MANUAL CHECK', req: true },
  { ic: 'payment', t: 'STRIPE', c: ['test', 'TEST MODE'], p: 'KEY MODE BY PREFIX · WEBHOOK PROBE NOT RUN' },
  { ic: 'api', t: 'API HEALTH', c: ['unver', 'UNVERIFIED'], p: 'NO HEALTH PROBE IN THE READINESS REPORT YET' },
  { ic: 'checklist', t: 'E2E TEST MODE', c: ['test', 'SYNTHETIC ONLY'], p: 'FOUNDER TEST MODE ON · E2E NOT AUTHORIZED BY DESIGN' },
];
export const moduleCard = (m) =>
  `<div class="fw-mod ${m.policy ? 'fw-mod--policy' : ''} ${m.req ? 'fw-mod--req' : ''}"><div class="fw-mod__h">${icon(m.ic)}${chip(m.c[0], m.c[1], m.c[2])}</div><b>${m.t}</b><p>${m.p}</p></div>`;

// ─── Overlays ───────────────────────────────────────────────────────────────
export const sheet = (title, body, foot = '', { top = 'auto', rail = '' } = {}) =>
  `<div class="fw-scrim"></div><div class="fw-sheet" style="top:${top}"><div class="fw-sheet__h"><div>${rail ? `<div class="fw-rail" style="margin:0 0 8px"><b style="font-size:14px">${rail}</b><span style="flex-basis:30px"></span></div>` : ''}<h2 class="fw-h2" style="font-size:26px">${title}<i class="fw-period"></i></h2></div><span class="fw-iconbtn">${icon('close')}</span></div><div class="fw-sheet__b">${body}</div>${
    foot ? `<div class="fw-sheet__f">${foot}</div>` : ''
  }</div>`;

export const menu = (items, style) =>
  `<div class="fw-menu" style="${style}">${items
    .map((i) => (i === '-' ? '<div class="fw-menu__sep"></div>' : `<div class="fw-menu__i ${i[2] ? `fw-menu__i--${i[2]}` : ''}">${icon(i[0])}<span>${i[1]}</span><span class="fw-meta">${i[3] ?? ''}</span></div>`))
    .join('')}</div>`;

export const toast = (text, { err = false, style = '' } = {}) => `<div class="fw-toast ${err ? 'fw-toast--err' : ''}" style="${style}">${err ? icon('warning') : CHECK}${text}</div>`;

export { DEMO, SYNTH };
