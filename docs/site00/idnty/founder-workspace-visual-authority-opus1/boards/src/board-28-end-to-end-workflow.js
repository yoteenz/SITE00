import { header, section, S, foot, mount, phone, mk, chip } from './fw-kit.js';
import { mOverview, mRecord, mReviews, mOpsProject, mSystem, H } from './fw-pages.js';

// Ten lifecycle steps. Evidence is from source (DATA_CONTRACT_MAPPING.md §5–6; service.ts schedulePersist call sites).
// persist: 'await' = awaited durable write · 'sched' = fire-and-forget write · 'no' = memory only · 'derived' = no write
const STEPS = [
  { t: 'CREATE', who: 'founder', f: 'Create foundation (name, email, business)', c: '—', s: 'Artifact + personal link', mail: 'ARTIFACT_CREATED → invitation · DRY RUN', api: 'create-artifact', p: 'await', today: 'R1 hard-codes prospect@example.com', b: '07 · 08' },
  { t: 'LINK', who: 'founder', f: 'Copy link · open client view', c: 'Receives link (founder-shared)', s: 'Token never expires', mail: 'Resend invite: none (G-05)', api: 'list → public_token', p: 'await', today: 'window.prompt', b: '08 · 09' },
  { t: 'INTAKE', who: 'client', f: 'Watches progress (phases, no %)', c: 'Opens link, completes six steps', s: 'Saves each step', mail: 'INTAKE_STARTED / COMPLETED · DRY RUN', api: 'open · update-intake', p: 'await', today: 'Detail page dl only', b: '09 · 11' },
  { t: 'REVIEW', who: 'founder', f: 'Reviews intake + recommendations', c: 'Waits', s: 'Queue is derived', mail: '—', api: '§4 derivation · approval-*', p: 'derived', today: 'No queue exists', b: '13–16' },
  { t: 'QUOTE', who: 'founder', f: 'Revise · approve (commercial ready)', c: 'Sees quote in link', s: 'Versions, 14-day expiry', mail: 'QUOTE_CREATED · DRY RUN', api: 'update-quote · quote-commercial-ready', p: 'sched', today: 'Subtotal text only', b: '12' },
  { t: 'ACCEPT', who: 'client', f: 'Sees acceptance', c: 'Accepts with disclosures', s: 'Quote locks', mail: 'QUOTE_ACCEPTED · DRY RUN', api: 'accept-quote (public)', p: 'sched', today: 'State field only', b: '10' },
  { t: 'PAYMENT', who: 'client', f: 'Sees payment state', c: 'Stripe checkout', s: 'Webhook confirms PAID', mail: 'PAYMENT_CONFIRMED · DRY RUN', api: 'start-checkout · Stripe webhook', p: 'sched', today: 'Payment field only', b: '10 · 21' },
  { t: 'OPERATIONS', who: 'work', f: 'Runbook · tasks · blockers', c: 'Client actions (DNS approval)', s: 'Stages 01–07', mail: 'CLIENT_ACTION_REQUESTED · DRY RUN', api: 'generate-runbook · *-task · client-action', p: 'no', today: 'Raw JSON (R4, R5)', b: '17 · 18' },
  { t: 'VERIFY', who: 'work', f: 'Verify DNS · send · receive · ownership', c: '—', s: 'Completion gate', mail: '—', api: 'verify-task · completion-gate', p: 'no', today: 'None', b: '18' },
  { t: 'COMPLETE', who: 'done', f: 'Mark complete (gate passes)', c: 'Records available', s: 'Credit issued', mail: 'FOUNDATION_COMPLETED · DRY RUN', api: 'mark-complete', p: 'no', today: 'One click, registrar “TBD”', b: '10 · 24' },
];
const P = {
  await: ['ok', 'PERSISTED · AWAITED'],
  sched: ['warn', 'PERSISTED · NOT AWAITED'],
  no: ['fail', 'MEMORY ONLY · G-04'],
  derived: ['muted', 'DERIVED · NO WRITE'],
};

const cell = (s) => `<td style="white-space:normal;vertical-align:top;line-height:1.45">${s}</td>`;
const lane = (label, key, fmt = (x) => x) => `<tr><td style="vertical-align:top"><b>${label}</b></td>${STEPS.map((st) => cell(fmt(st[key], st))).join('')}</tr>`;
const table = `<div class="bd-panel" style="width:2280px;padding:10px 14px"><table class="bd-table" style="table-layout:fixed"><colgroup><col style="width:150px">${STEPS.map(() => '<col>').join('')}</colgroup>
<thead><tr><th></th>${STEPS.map((st, i) => `<th style="white-space:normal"><div class="fw" style="background:transparent;display:flex;align-items:center;gap:8px"><span class="fw-idx">${String(i + 1).padStart(2, '0')}</span>${mk(st.who)}<b style="font-size:10px;letter-spacing:.18em;color:#0c0c0c">${st.t}</b></div></th>`).join('')}</tr></thead>
<tbody>
${lane('FOUNDER', 'f')}
${lane('CLIENT', 'c')}
${lane('SITE 00 / SYSTEM', 's')}
${lane('EMAIL', 'mail')}
${lane('API ACTION', 'api', (x) => `<code>${x}</code>`)}
${lane('PERSISTENCE', 'p', (x) => `<div class="fw" style="background:transparent">${chip(P[x][0], P[x][1])}</div>`)}
${lane('UI TODAY', 'today')}
${lane('BOARDS', 'b')}
</tbody></table>
<div class="bd-note"><b>Evidence key.</b> AWAITED = durable write before the response (<code>createArtifactForLeadDurable</code>, <code>update-intake</code>, #1657). NOT AWAITED = <code>schedulePersist</code> fire-and-forget in <code>service.ts</code> (acceptQuote, markQuoteCommerciallyReady, createCheckoutSession, confirmPaymentFromWebhook): written, but a failed write is only logged. MEMORY ONLY = lost on API restart until the persistence workstream closes G-04. Every lifecycle email is <code>enabled:false</code> → DRY RUN. <b>Nothing on this board was executed against staging.</b></div></div>`;

// Key screens along the flow, at 50 %.
const mini = (t, body, nav) => `<div style="display:flex;flex-direction:column;gap:6px"><div class="bd-cap"><span class="bd-cap__t">${t}</span></div><div style="zoom:.5">${phone({ nav, body })}</div></div>`;
const strip = `<div class="bd-row" style="align-items:flex-start;gap:22px">
  ${mini('01 · OVERVIEW → FOCUS', mOverview(), 'overview')}<div class="bd-arrow">→</div>
  ${mini('04 · REVIEW QUEUE', mReviews(), 'reviews')}<div class="bd-arrow">→</div>
  ${mini('05 · CLIENT RECORD', mRecord(H, { section: 0 }), 'foundations')}<div class="bd-arrow">→</div>
  ${mini('08 · OPERATIONS', mOpsProject(), 'overview')}<div class="bd-arrow">→</div>
  ${mini('09 · SYSTEM GATES', mSystem(), 'system')}
</div>`;

mount(`${header({ num: '28', title: 'End-to-end founder workflow', round: 'F', sub: 'The whole Digital Foundation lifecycle from the founder’s seat: who moves at each step, which API action carries it, whether the result is saved today, which email it would trigger, what the founder sees today, and which board designs it.' })}
${section('01', 'LIFECYCLE · TEN STEPS · EVIDENCE', table, S.prop() + ' ' + S.dep())}
${section('02', 'THE FLOW ON A PHONE', strip, S.prop())}
${foot('BOARD 28 / 28 · END-TO-END FOUNDER WORKFLOW', '3 STEPS MEMORY-ONLY (G-04) · ALL EMAIL DRY RUN · PAYMENT LOGIC UNCHANGED')}`);
