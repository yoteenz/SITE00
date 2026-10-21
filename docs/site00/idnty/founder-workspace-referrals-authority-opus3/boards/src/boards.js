// The 44 REFERRALS authority boards (R01–R44, groups A–H). One definition per board id; each board-*.html sets data-board.
// Frames are live specimens (board-kit vp) at true viewports. Card artwork frames use specimen page=cardart.
import { S, header, section, row, vp, note, callout, table, mount } from './board-kit.js';
import { RO, RO_NAMES } from './rf-overlays.js';

const id = document.body.dataset.board;
const W = 1442;
const POLICY = await (await fetch('../../data/policy-register.json')).json();
const EDGE = await (await fetch('../../data/attribution-edge-cases.json')).json();

const fit = (n, w, gap = 28) => Math.min(1, (W - gap * (n - 1)) / n / w);
const at = (w, h, q, n, o = {}) => vp({ w, h, q, scale: o.scale ?? fit(n, w), ...o });
const M = (q, n, o = {}) => at(390, 844, q, n, o);
const TP = (q, n, o = {}) => at(834, 1112, q, n, o);
const TL = (q, n, o = {}) => at(1194, 834, q, n, o);
const D = (q, n, o = {}) => at(1440, 900, q, n, o);
const art = (q, n, label, o = {}) => at(o.w ?? 1100, o.h ?? 640, q, n, { label, ...o });
const P = S.prop();
const IL = S.illus();
const OPEN = (t) => S.open(t);
const GAP = (t) => S.backend(t);
const NP = S.noprint();
const chips = (...c) => c.join(' ');
const pol = (...ids) => table(['DECISION', 'QUESTION', 'UNTIL DECIDED'], POLICY.filter((p) => ids.includes(p.id)).map((p) => [`<b>${p.id}</b>`, p.decision.toUpperCase(), p.until_decided]), W);
const bul = (items, w) => `<ul class="bd-bul" ${w ? `style="width:${w}px"` : ''}>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const grid = (cols, ...cells) => `<div class="bd-grid" style="grid-template-columns:${cols}">${cells.join('')}</div>`;

const CHAIN = [
  ['01', 'PARTNER', 'APPROVED · TERMS SIGNED'],
  ['02', 'LINK', 'OPAQUE CODE · /invite/:code'],
  ['03', 'QR', 'ENCODES THE LINK ONLY'],
  ['04', 'PROSPECT', 'SCANS · CONTEXT HELD SERVER-SIDE'],
  ['05', 'DF ARTIFACT', 'ATTRIBUTION PERSISTED ONCE'],
  ['06', 'PAYMENT', 'VERIFIED BY WEBHOOK'],
  ['07', 'ELIGIBILITY', 'TRIGGER FD-R04 · TERMS VERSION'],
  ['08', 'PAYOUT', 'APPROVED → RECORDED (NOT SENT)'],
  ['09', 'AUDIT', 'APPEND-ONLY EVENTS'],
];
const chain = (on = [], red = []) => `<div class="bd-chain" style="width:${W}px">${CHAIN.map(([n, t, d], i) => `<div class="${on.includes(i) ? 'on' : ''} ${red.includes(i) ? 'red' : ''}"><b>${n}</b><span>${t}</span><small>${d}</small></div>`).join('')}</div>`;

const s = (t, k = '') => `<span class="bd-sm__s ${k ? `bd-sm__s--${k}` : ''}">${t}</span>`;
const a = (t = '') => `<span class="bd-sm__a">${t}</span>`;
const STATE_MACHINE = `<div class="bd-sm" style="width:${W}px">
  <div class="bd-sm__row">${s('TRACKED')}${a('PAYMENT EVIDENCE')}${s('NOT YET ELIGIBLE')}${a('TRIGGER FD-R04')}${s('ELIGIBLE')}${a('SUBMIT')}${s('PENDING APPROVAL', 'red')}${a('FOUNDER')}${s('APPROVED')}${a('BATCH FD-R05')}${s('SCHEDULED')}${a('RECORD PAYMENT')}${s('PAID', 'term')}</div>
  <div class="bd-sm__row">${s('ANY STATE BEFORE PAID')}${a('REFUND / CORRECTION')}${s('ADJUSTED')}${a('RE-APPROVE')}${s('PENDING APPROVAL', 'red')}<span style="width:24px"></span>${s('ANY STATE')}${a('FULL REFUND · DISQUALIFY')}${s('REVERSED', 'term')}<span style="width:24px"></span>${s('PAID')}${a('CHARGEBACK')}${s('DISPUTED', 'red')}${a('FD-R06')}${s('ADJUSTED / REVERSED')}</div>
  <div class="bd-sm__row">${s('REFERRED ≠ CONVERTED ≠ ELIGIBLE ≠ APPROVED ≠ PAID', 'dash')}${s('A STATE NEVER ADVANCES ON A CLIENT REQUEST · ONLY ON SERVER EVIDENCE OR A FOUNDER ACTION WITH A REASON', 'dash')}</div></div>`;

const OVERLAYS = Object.keys(RO).filter((k) => /^RO-\d\d$/.test(k));
const modeOf = (k) => {
  if (k === 'RO-11' || k === 'RO-14') return ['sheet', 'sheet · dock ≥ 680 stage', 'inspector'];
  const h = RO[k]().html;
  const g = (t) => (h.match(new RegExp(`data-${t}="([a-z-]+)"`)) || [])[1] ?? '—';
  return [g('m'), g('t'), g('d')];
};

const BOARDS = {
  // ═══ A · REFERRALS OVERVIEW ════════════════════════════════════════════════
  R01: () => ({
    num: 'R01', group: 'A · OVERVIEW', title: 'Referrals overview · mobile', tier: 'MOBILE 320–767',
    sub: 'REFERRALS is reached from the workspace MENU; the bottom bar keeps HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM and shows no selected item while REFERRALS is open. A section selector replaces the tab row.',
    body: [
      section('01', 'DEFAULT · SCROLLED · MENU · SECTION SHEET', row(M('page=overview', 4, { title: 'OVERVIEW · FOLD', chips: chips(P, IL) }), M('page=overview&scroll=640', 4, { title: 'SCROLLED · PARTNERS + MONEY', chips: P }), M('ro=RO-M', 4, { title: 'MENU · REFERRALS ACTIVE', chips: P }), M('ro=RO-S', 4, { title: 'SECTION SHEET', chips: P }))),
      section('02', 'STATES', row(M('page=overview&st=loading', 4, { title: 'LOADING', chips: P }), M('page=overview&st=empty', 4, { title: 'NO PARTNERS YET', chips: P }), M('page=overview&st=error', 4, { title: 'ERROR · READ-ONLY SNAPSHOT', chips: P }), at(320, 700, 'page=overview', 4, { scale: fit(4, 390), title: '320 · SMALL PHONE', chips: P })) +
        callout('<b>Bottom bar is locked.</b> REFERRALS never replaces SYSTEM, never becomes a sixth item, and FOUNDATIONS is not renamed CLIENTS. The page header carries “06 REFERRALS”; the menu row is marked active with the red index and a badge for items needing the founder.', W)),
    ],
  }),
  R02: () => ({
    num: 'R02', group: 'A · OVERVIEW', title: 'Referrals overview · tablet portrait', tier: 'TABLET PORTRAIT 768–1023',
    sub: 'Rail navigation with REFERRALS as its own rail item. Two-column composition: signals strip, focus card, partners beside commissions/payouts, then cards and activity.',
    body: [
      section('01', 'DEFAULT AND SCROLLED', row(TP('page=overview', 2, { title: '834 × 1112 · RAIL · 2 COLUMNS', chips: chips(P, IL) }), TP('page=overview&scroll=700', 2, { title: 'SCROLLED · CARD STUDIO + ACTIVITY', chips: P }))),
      section('02', '768 AND MENU DRAWER', row(at(768, 1024, 'page=overview', 2, { title: '768 × 1024', chips: P }), TP('ro=RO-M', 2, { title: 'MENU DRAWER (TABLET)', chips: P }))),
    ],
  }),
  R03: () => ({
    num: 'R03', group: 'A · OVERVIEW', title: 'Referrals overview · tablet landscape', tier: 'TABLET LANDSCAPE 1024–1279',
    sub: 'Rail plus a wider stage: the focus card folds away (the queue is in the signals), partners sit left of money and activity. Header imagery appears from the medium container upward.',
    body: [
      section('01', '1194 × 834', row(TL('page=overview', 1, { scale: fit(1, 1194) * 0.9, title: 'OVERVIEW · RAIL · STAGE 1114', chips: chips(P, IL) }))),
      section('02', '1024 × 768 · SCROLLED', row(at(1024, 768, 'page=overview', 2, { title: '1024 × 768', chips: P }), at(1024, 768, 'page=overview&scroll=560', 2, { title: 'SCROLLED', chips: P }))),
    ],
  }),
  R04: () => ({
    num: 'R04', group: 'A · OVERVIEW', title: 'Referrals overview · desktop', tier: 'DESKTOP 1280–1919',
    sub: 'The reference composition, corrected: compact signals with definitions instead of sparklines, partner registry with architectural thumbnails, commissions/payouts list, activity, Card Studio entry. No 15% rate, no 30-day window, no invented totals.',
    body: [
      section('01', '1440 × 900', row(D('page=overview', 1, { title: 'OVERVIEW · SIDEBAR · 06 REFERRALS ACTIVE', chips: chips(P, IL), note: 'Signals: ACTIVE PARTNERS, REFERRED LEADS, CONVERTED CLIENTS, PENDING APPROVAL, TOTAL PAID OUT — each with its calculation under the number (doc 07). PENDING APPROVAL is red because it needs the founder. Values are illustrative and computed from the specimen ledger, not live.' }))),
      section('02', '1280 AND STATES', row(at(1280, 800, 'page=overview', 3, { title: '1280 × 800', chips: P }), at(1280, 800, 'page=overview&st=empty', 3, { title: 'EMPTY · FIRST PARTNER CTA', chips: P }), at(1280, 800, 'page=overview&st=error', 3, { title: 'ERROR', chips: P }))),
    ],
  }),
  R05: () => ({
    num: 'R05', group: 'A · OVERVIEW', title: 'Referrals overview · wide and ultra-wide', tier: '≥ 1920',
    sub: 'Three-column composition from a 1440 px stage: partners | money | activity. Content stays inside the OPUS2 max width; the remainder becomes quiet gutter.',
    body: [
      section('01', '1920 × 1080', row(at(1920, 1080, 'page=overview', 1, { scale: 0.74, title: 'WIDE · THREE COLUMNS', chips: chips(P, IL) }))),
      section('02', '2560 × 1440 · 3440 × 1440', row(at(2560, 1440, 'page=overview', 2, { title: '2560 · CONTENT MAX 1760', chips: P }), at(3440, 1440, 'page=overview', 2, { title: '3440 · QUIET GUTTERS', chips: P }))),
    ],
  }),
  // ═══ B · PARTNER MANAGEMENT ════════════════════════════════════════════════
  R06: () => ({
    num: 'R06', group: 'B · PARTNERS', title: 'Partner registry · mobile', tier: 'MOBILE',
    sub: 'Two-line partner rows (thumbnail, name, type, status) with the referral count on the right. Status filters scroll horizontally; NEW PARTNER opens a full-screen form.',
    body: [
      section('01', 'REGISTRY', row(M('page=partners', 4, { title: 'ALL PARTNERS', chips: chips(P, IL) }), M('page=partners&scroll=420', 4, { title: 'SCROLLED', chips: P }), M('ro=RO-01', 4, { title: 'NEW PARTNER · FULL SCREEN', chips: P }), M('ro=RO-04', 4, { title: 'STATUS CHANGE', chips: chips(P, OPEN('FD-R19')) }))),
      section('02', 'STATES', row(M('page=partners&st=loading', 4, { title: 'LOADING', chips: P }), M('page=partners&st=empty', 4, { title: 'EMPTY', chips: P }), M('ro=RO-03', 4, { title: 'INVITE · NOTHING SENT', chips: chips(P, OPEN('FD-R12')) }), M('ro=RO-20', 4, { title: 'REVOKE ACCESS', chips: P }))),
    ],
  }),
  R07: () => ({
    num: 'R07', group: 'B · PARTNERS', title: 'Partner registry · tablet', tier: 'TABLET PORTRAIT + LANDSCAPE',
    sub: 'From 600 px of registry width the table gains TYPE · STATUS and REFERRALS columns. The partner inspector is a bottom sheet in portrait and docks in landscape when the stage keeps ≥ 680 px.',
    body: [
      section('01', 'PORTRAIT', row(TP('page=partners', 2, { title: '834 · 4-COLUMN REGISTRY', chips: chips(P, IL) }), TP('page=partners&sel=1&insp=partner', 2, { title: '834 · INSPECTOR AS SHEET', chips: P }))),
      section('02', 'LANDSCAPE', row(TL('page=partners', 2, { title: '1194 · REGISTRY', chips: P }), TL('page=partners&sel=1&insp=partner', 2, { title: '1194 · INSPECTOR DOCKED', chips: P }))),
    ],
  }),
  R08: () => ({
    num: 'R08', group: 'B · PARTNERS', title: 'Partner registry · desktop', tier: 'DESKTOP',
    sub: 'Full registry: PARTNER · TYPE / STATUS · REFERRALS · CONVERTED · OWED · CARD. AIO is the first row as PLANNED · NOT ACTIVE with zero referrals and DESIGN ONLY card status.',
    body: [
      section('01', '1440', row(D('page=partners', 2, { title: 'REGISTRY · SEVEN COLUMNS', chips: chips(P, IL) }), D('page=partners&sel=1&insp=partner', 2, { title: 'SELECTED · INSPECTOR', chips: P }))),
      section('02', 'WIDE + ROW CONTEXT', row(at(1920, 1080, 'page=partners&sel=1&insp=partner', 2, { title: '1920 · REGISTRY + INSPECTOR', chips: P }), D('ro=RO-06', 2, { title: 'LINK PREVIEW POPOVER', chips: P }))),
    ],
  }),
  R09: () => ({
    num: 'R09', group: 'B · PARTNERS', title: 'Partner detail · mobile', tier: 'MOBILE',
    sub: 'One partner, seven sections — OVERVIEW · REFERRALS · COMMISSIONS · PAYOUTS · CARDS · TERMS · ACTIVITY. The reference’s four mobile tabs become a horizontally scrolling section row; actions SHARE CARD · COPY LINK · MESSAGE · MORE sit under the name.',
    body: [
      section('01', 'MERIDIAN · SECTIONS 1–4', row(M('page=partner&p=mer', 4, { title: 'OVERVIEW', chips: chips(P, IL) }), M('page=partner&p=mer&sec=1', 4, { title: 'REFERRALS', chips: P }), M('page=partner&p=mer&sec=2', 4, { title: 'COMMISSIONS', chips: P }), M('page=partner&p=mer&sec=3', 4, { title: 'PAYOUTS', chips: P }))),
      section('02', 'SECTIONS 5–7 + AIO PLANNED', row(M('page=partner&p=mer&sec=4', 4, { title: 'CARDS', chips: P }), M('page=partner&p=mer&sec=5', 4, { title: 'TERMS · NOTHING PRE-FILLED', chips: chips(P, OPEN('FD-R01–R08')) }), M('page=partner&p=mer&sec=6', 4, { title: 'ACTIVITY', chips: P }), M('page=partner&p=aio', 4, { title: 'AIO · PLANNED · NOT ACTIVE', chips: chips(P, OPEN('FD-R17')) }))),
    ],
  }),
  R10: () => ({
    num: 'R10', group: 'B · PARTNERS', title: 'Partner detail · desktop', tier: 'DESKTOP',
    sub: 'Header with architectural plate, status, type, owner and contact; actions on the same baseline; seven section tabs; content left, link + QR and card on the right.',
    body: [
      section('01', 'AIO · PLANNED (FIRST PARTNER)', row(D('page=partner&p=aio', 1, { title: 'BEFORE AIO CAN REFER CLIENTS · CHECKLIST + FIXTURE CONFLICT', chips: chips(P, OPEN('FD-R17'), GAP('FIXTURE ACTIVE · agreement_version NULL')), note: 'AIO is not verified active. The repository fixture aioInvitation001.ts marks AIO ACTIVE with agreement_version null; the page surfaces this as a red conflict instead of trusting it. No referral, commission or payment is shown for AIO.' }))),
      section('02', 'MERIDIAN · OVERVIEW · REFERRALS · TERMS · ACTIVITY', row(D('page=partner&p=mer', 2, { title: 'OVERVIEW', chips: chips(P, IL) }), D('page=partner&p=mer&sec=1', 2, { title: 'REFERRALS → CANONICAL CLIENT RECORDS', chips: P })) + row(D('page=partner&p=mer&sec=5', 2, { title: 'TERMS · VERSIONED', chips: chips(P, OPEN('FD-R01–R08')) }), D('page=partner&p=mer&sec=6', 2, { title: 'ACTIVITY', chips: P }))),
    ],
  }),
  R11: () => ({
    num: 'R11', group: 'B · PARTNERS', title: 'Partner creation and terms', tier: 'OVERLAYS RO-01 · RO-02 · RO-03 · RO-05',
    sub: 'Creating a partner records a DRAFT; it never issues a link, sends an invitation or asserts an agreement. Terms are a versioned editor with no pre-filled value — every field is a founder decision.',
    body: [
      section('01', 'CREATE · EDIT', row(D('ro=RO-01', 3, { title: 'NEW PARTNER · DRAFT', chips: P }), D('ro=RO-01&os=error', 3, { title: 'DUPLICATE / VALIDATION', chips: P }), D('ro=RO-02', 3, { title: 'EDIT PARTNER', chips: P }))),
      section('02', 'INVITE · TERMS', row(D('ro=RO-03', 2, { title: 'INVITE · SEND DISABLED UNTIL APPROVED', chips: chips(P, OPEN('FD-R12')) }), D('ro=RO-05', 2, { title: 'TERMS V3 (DRAFT) · NO DEFAULTS', chips: chips(P, OPEN('FD-R01–R07')) })) +
        pol('FD-R01', 'FD-R02', 'FD-R03', 'FD-R04', 'FD-R07', 'FD-R12')),
    ],
  }),
  // ═══ C · ATTRIBUTION ═══════════════════════════════════════════════════════
  R12: () => ({
    num: 'R12', group: 'C · ATTRIBUTION', title: 'Referral history · mobile', tier: 'MOBILE',
    sub: 'Who referred whom, by which card or link, with what result. Every row opens the canonical client in FOUNDATIONS; the source trace explains each step with its evidence class.',
    body: [
      section('01', 'LEDGER · TRACE · PARTNER VIEW', row(M('page=attribution', 4, { title: 'ATTRIBUTION · SIGNALS + LEDGER', chips: chips(P, IL) }), M('page=attribution&scroll=520', 4, { title: 'SCROLLED', chips: P }), M('page=trace', 4, { title: 'SOURCE TRACE', chips: P }), M('page=partner&p=mer&sec=1', 4, { title: 'PARTNER → REFERRALS', chips: P }))),
    ],
  }),
  R13: () => ({
    num: 'R13', group: 'C · ATTRIBUTION', title: 'Attribution ledger · desktop + tablet', tier: 'ALL TIERS ≥ 768',
    sub: 'REFERRAL · CLIENT · PARTNER · VIA · INTAKE · CONVERSION · COMMISSION. VIA states the touch (CARD V2 · QR, LINK) — never a partner id from the client.',
    body: [
      section('01', '1440', row(D('page=attribution', 1, { title: 'ATTRIBUTION LEDGER', chips: chips(P, IL) }))),
      section('02', 'TABLET', row(TP('page=attribution', 2, { title: '834 · FOUR COLUMNS', chips: P }), TL('page=attribution', 2, { title: '1194 · SEVEN COLUMNS', chips: P }))),
    ],
  }),
  R14: () => ({
    num: 'R14', group: 'C · ATTRIBUTION', title: 'Source trace', tier: 'EVIDENCE CLASSES',
    sub: 'From card to payout, each step tagged OBSERVED (recorded by the system), ATTRIBUTED (derived by policy), ESTIMATED (planned, not fact) or UNAVAILABLE (cannot be measured). Offline hand-out is always UNAVAILABLE.',
    body: [
      section('01', 'TRACE', row(D('page=trace', 2, { title: '1440 · TRACE + LINKED RECORDS', chips: chips(P, IL) }), TP('page=trace', 2, { scale: 0.5, title: '834', chips: P }))),
      section('02', 'EVIDENCE CONTRACT', table(['CLASS', 'MEANING', 'EXAMPLE', 'MAY DRIVE MONEY'], [['<b>OBSERVED</b>', 'RECORDED BY SITE 00 AT THE TIME', 'QR SCAN RESOLVED · PAYMENT WEBHOOK', 'YES'], ['<b>ATTRIBUTED</b>', 'DERIVED BY APPROVED POLICY FROM OBSERVED EVENTS', 'ARTIFACT LINKED TO LINK L-02', 'YES · ONCE POLICY IS APPROVED'], ['<b>ESTIMATED</b>', 'PLANNED OR EXPECTED', 'NEXT PAYOUT DATE', 'NO'], ['<b>UNAVAILABLE</b>', 'CANNOT BE MEASURED', 'CARD HANDED OUT · CROSS-DEVICE', 'NO · ONLY VIA RO-19 WITH EVIDENCE']], W)),
    ],
  }),
  R15: () => ({
    num: 'R15', group: 'C · ATTRIBUTION', title: 'Attribution exception', tier: 'RO-18 · RO-19 · 21 EDGE CASES',
    sub: 'Collisions, existing clients, self-referrals and cross-device gaps become exceptions for the founder. Corrections require a reason, create an event, and are blocked after a payout is paid unless FD-R18 allows it.',
    body: [
      section('01', 'EXCEPTION AND CORRECTION', row(D('ro=RO-18', 3, { title: 'EXCEPTION · TWO PARTNERS', chips: chips(P, OPEN('FD-R08')) }), D('ro=RO-19', 3, { title: 'MANUAL CORRECTION · REASON REQUIRED', chips: chips(P, OPEN('FD-R18')) }), M('ro=RO-18', 3, { scale: 0.6, title: 'MOBILE', chips: P }))),
      section('02', 'EDGE CASES', table(['ID', 'SCENARIO', 'SERVER SIGNAL', 'OUTCOME', 'POLICY'], EDGE.map((e) => [`<b>${e.id}</b>`, e.scenario.toUpperCase(), e.signal, e.outcome, e.policy]), W)),
    ],
  }),
  // ═══ D · COMMISSIONS ═══════════════════════════════════════════════════════
  R16: () => ({
    num: 'R16', group: 'D · COMMISSIONS', title: 'Commission ledger · mobile', tier: 'MOBILE',
    sub: 'Client and partner on the left, amount and state on the right. State labels never truncate. Approve and adjust are full-screen on phones.',
    body: [
      section('01', 'LEDGER · DETAIL · APPROVE · ADJUST', row(M('page=commissions', 4, { title: 'COMMISSIONS', chips: chips(P, IL) }), M('page=commissions&insp=commission', 4, { title: 'DETAIL SHEET', chips: P }), M('ro=RO-12', 4, { title: 'APPROVE', chips: P }), M('ro=RO-13', 4, { title: 'ADJUST · REASON REQUIRED', chips: chips(P, OPEN('FD-R06')) }))),
    ],
  }),
  R17: () => ({
    num: 'R17', group: 'D · COMMISSIONS', title: 'Commission ledger · tablet', tier: 'TABLET PORTRAIT + LANDSCAPE',
    sub: 'Portrait keeps CLIENT · AMOUNT · STATE · DATE; landscape adds partner, terms and basis. Detail is a sheet in portrait and docks in landscape.',
    body: [
      section('01', 'PORTRAIT', row(TP('page=commissions', 2, { title: '834', chips: chips(P, IL) }), TP('page=commissions&insp=commission', 2, { title: '834 · DETAIL SHEET', chips: P }))),
      section('02', 'LANDSCAPE', row(TL('page=commissions', 2, { title: '1194', chips: P }), TL('page=commissions&insp=commission', 2, { title: '1194 · DETAIL DOCKED', chips: P }))),
    ],
  }),
  R18: () => ({
    num: 'R18', group: 'D · COMMISSIONS', title: 'Commission ledger · desktop', tier: 'DESKTOP',
    sub: 'Every amount is integer minor units rendered at the edge; negative amounts are reversals, never deleted rows. Terms E-1 / E-2 are labelled EXAMPLE and NOT A PROPOSED RATE.',
    body: [
      section('01', '1440 · 1920', row(D('page=commissions', 2, { title: 'LEDGER', chips: chips(P, IL) }), at(1920, 1080, 'page=commissions&insp=commission', 2, { title: '1920 · LEDGER + DETAIL', chips: P }))),
      section('02', 'STATE MACHINE', STATE_MACHINE),
    ],
  }),
  R19: () => ({
    num: 'R19', group: 'D · COMMISSIONS', title: 'Commission detail', tier: 'CALCULATION · HISTORY',
    sub: 'The calculation is locked at eligibility: collected payment, pass-through deductions (FD-R02), refunds, basis, terms version, commission. History shows every transition with its evidence.',
    body: [
      section('01', 'DETAIL', row(D('page=commissions&insp=commission', 2, { title: 'INSPECTOR · CALCULATION', chips: chips(P, IL) }), D('ro=RO-11', 2, { title: 'RO-11 · DETAIL (DESKTOP INSPECTOR)', chips: P }))),
      section('02', 'MAPPING TO THE REPOSITORY', table(['SPRINT STATE', 'EXISTING CommissionEntryStatus', 'NOTE'], [['TRACKED', 'CANDIDATE', 'ATTRIBUTED, NO PAYMENT YET'], ['NOT YET ELIGIBLE', 'PENDING', 'PAYMENT SEEN; TRIGGER NOT MET'], ['ELIGIBLE', 'QUALIFIED', 'TRIGGER MET; AMOUNT LOCKED'], ['PENDING APPROVAL', '— (NEW)', 'ELIGIBLE ROW AWAITING FOUNDER'], ['APPROVED', 'APPROVED', ''], ['SCHEDULED', 'PAYABLE', 'IN A PAYOUT BATCH'], ['PAID', 'PAID', 'ONLY AFTER RECORD PAYMENT'], ['ADJUSTED', '— (NEW)', 'CORRECTION ENTRY, ORIGINAL KEPT'], ['REVERSED', 'REVERSED / DISQUALIFIED', 'DISQUALIFIED MAPS HERE WITH REASON'], ['DISPUTED', '— (NEW)', 'CHARGEBACK OR CONTESTED']], W)),
    ],
  }),
  R20: () => ({
    num: 'R20', group: 'D · COMMISSIONS', title: 'Commission approval', tier: 'RO-12 · RO-13',
    sub: 'APPROVAL DOES NOT PAY. Approving moves the amount to the next payout; payment is recorded separately. Adjustments keep the original and add a signed correction.',
    body: [
      section('01', 'APPROVE · ADJUST', row(D('ro=RO-12', 3, { title: 'APPROVE', chips: P }), D('ro=RO-13', 3, { title: 'ADJUST', chips: chips(P, OPEN('FD-R06')) }), TP('ro=RO-12', 3, { title: 'TABLET', chips: P }))),
      section('02', 'CONTROLS', bul(['Approver is the founder (FD-R18); approval stores actor, time, terms version and the calculation snapshot.', 'An approval cannot be edited — only superseded by an ADJUSTED entry with a reason.', 'Bulk approval is not proposed until a second reviewer rule exists.', 'Approving a commission whose payment is refunded or disputed is blocked.'], W)),
    ],
  }),
  // ═══ E · PAYOUTS ═══════════════════════════════════════════════════════════
  R21: () => ({
    num: 'R21', group: 'E · PAYOUTS', title: 'Payouts · mobile', tier: 'MOBILE',
    sub: 'SITE 00 has no payout provider. Payouts are paid outside the product and recorded here with a reference. SEND PAYMENT does not exist.',
    body: [
      section('01', 'LEDGER · DETAIL · RECORD', row(M('page=payouts', 4, { title: 'PAYOUTS', chips: chips(P, IL, OPEN('FD-R16')) }), M('page=payouts&insp=payout', 4, { title: 'DETAIL', chips: P }), M('ro=RO-15', 4, { title: 'RECORD PAYMENT', chips: P }), M('ro=RO-15&kb', 4, { title: 'KEYBOARD OPEN · FOOTER STAYS', chips: P }))),
    ],
  }),
  R22: () => ({
    num: 'R22', group: 'E · PAYOUTS', title: 'Payouts · tablet', tier: 'TABLET PORTRAIT + LANDSCAPE',
    sub: 'The policy banner stays above the ledger at every width. Detail docks in landscape.',
    body: [
      section('01', 'PORTRAIT + LANDSCAPE', row(TP('page=payouts', 2, { title: '834', chips: chips(P, IL) }), TL('page=payouts&insp=payout', 2, { title: '1194 · DETAIL', chips: P }))),
    ],
  }),
  R23: () => ({
    num: 'R23', group: 'E · PAYOUTS', title: 'Payouts · desktop', tier: 'DESKTOP',
    sub: 'PAYOUT · PARTNER · AMOUNT · METHOD · STATE · DATE. Method shows the type and the last four only; banking details never appear in the workspace, client records or cards.',
    body: [
      section('01', '1440 · 1920', row(D('page=payouts', 2, { title: 'LEDGER', chips: chips(P, IL) }), at(1920, 1080, 'page=payouts&insp=payout', 2, { title: '1920 · DETAIL', chips: P }))),
    ],
  }),
  R24: () => ({
    num: 'R24', group: 'E · PAYOUTS', title: 'Payout detail', tier: 'RO-14 · RO-17',
    sub: 'A payout groups approved commissions. It is never PAID because it was approved; it becomes PAID only when a payment is recorded with a reference. Reversal is founder-only and creates negative entries.',
    body: [
      section('01', 'DETAIL · REVERSAL', row(D('page=payouts&insp=payout', 3, { title: 'DETAIL', chips: P }), D('ro=RO-14', 3, { title: 'RO-14 · DETAIL', chips: P }), D('ro=RO-17', 3, { title: 'RO-17 · REVERSAL', chips: chips(P, OPEN('FD-R06')) }))),
    ],
  }),
  R25: () => ({
    num: 'R25', group: 'E · PAYOUTS', title: 'Record payment and confirmation', tier: 'RECORD ≠ SEND',
    sub: 'Record payment → confirm → recorded. An idempotency key (payout id + reference) stops a second submit creating a second payment. Nothing moves money.',
    body: [
      section('01', 'FLOW', row(D('ro=RO-15', 3, { title: '1 · RECORD', chips: P }), D('ro=RO-15&os=error', 3, { title: '1B · VALIDATION', chips: P }), D('ro=RO-16', 3, { title: '2 · CONFIRM', chips: P }))),
      section('02', 'FINANCIAL CONTROLS', bul(['RECORD PAYMENT ≠ SEND PAYMENT. No provider, no credentials, no transfer initiated from SITE 00 (FD-R16).', 'Amount must equal the payout total; partial recording creates an ADJUSTED payout, not a silent mismatch.', 'Reference is required and stored; receipts are optional uploads stored privately.', 'Payee documentation (FD-R10) must exist before the first recording.', 'Every recording writes an append-only event with actor, time, amount (minor units) and reference.'], W) + pol('FD-R05', 'FD-R10', 'FD-R16')),
    ],
  }),
  // ═══ F · CARD STUDIO ═══════════════════════════════════════════════════════
  R26: () => ({
    num: 'R26', group: 'F · CARD STUDIO', title: 'Card Studio · mobile', tier: 'MOBILE',
    sub: 'Partner, side toggle, the card at full width, template picker, link, print gate. Share and validation are full-screen. System B only — referral cards for Digital Foundation; SITE 00 studio cards are out of scope.',
    body: [
      section('01', 'STUDIO', row(M('page=cards', 4, { title: 'CARD STUDIO', chips: chips(P, NP) }), M('page=cards&scroll=560', 4, { title: 'SCROLLED · LINK + PRINT GATE', chips: P }), M('ro=RO-08', 4, { title: 'SHARE', chips: chips(P, OPEN('FD-R15')) }), M('ro=RO-07', 4, { title: 'QR VALIDATION', chips: P }))),
    ],
  }),
  R27: () => ({
    num: 'R27', group: 'F · CARD STUDIO', title: 'Card Studio · tablet', tier: 'TABLET PORTRAIT + LANDSCAPE',
    sub: 'Portrait stacks stage and controls; landscape puts the link and print-gate column beside the stage.',
    body: [
      section('01', 'PORTRAIT + LANDSCAPE', row(TP('page=cards', 2, { title: '834', chips: chips(P, NP) }), TL('page=cards', 2, { title: '1194', chips: P }))),
    ],
  }),
  R28: () => ({
    num: 'R28', group: 'F · CARD STUDIO', title: 'Card Studio · desktop', tier: 'DESKTOP',
    sub: 'Three columns from a 1440 stage: partner picker, card stage with templates, link and print gate. PRINT PACKAGE is disabled while any gate is open.',
    body: [
      section('01', 'TERRITORY A', row(D('page=cards', 1, { scale: 0.86, title: 'CARD STUDIO · A · BACK', chips: chips(P, NP) }))),
      section('02', 'B AND C', row(D('page=cards&t=B&side=front', 2, { title: 'B · FRONT', chips: P }), D('page=cards&t=C&side=front', 2, { title: 'C · FRONT', chips: P }))),
    ],
  }),
  R29: () => ({
    num: 'R29', group: 'F · CARD DESIGN', title: 'Referral card · front concepts', tier: 'THREE TERRITORIES · 3.5 × 2 IN',
    sub: 'Three genuine alternatives built from approved SITE 00 imagery and type. Partner shown: AIO, as DESIGN ONLY. Copy is PROPOSED (FD-R13).',
    body: [
      section('01', 'FLAT ARTWORK · FRONT', row(art('page=cardart&t=A&mode=front&w=900', 3, 'A · ARCHITECTURAL EDITORIAL', { title: 'A · ARCHITECTURAL EDITORIAL', chips: chips(P, OPEN('FD-R14')) }), art('page=cardart&t=B&mode=front&w=900', 3, 'B · MINIMAL ACCESS CARD', { title: 'B · MINIMAL ACCESS CARD', chips: P }), art('page=cardart&t=C&mode=front&w=900', 3, 'C · RED STRUCTURAL SIGNATURE', { title: 'C · RED STRUCTURAL SIGNATURE', chips: P }))),
      section('02', 'PHYSICAL MOCKUP', row(art('page=cardart&t=A&mode=mock&w=420', 3, 'A · MOCKUP', { w: 1000, h: 700, title: 'A · MOCKUP', chips: P }), art('page=cardart&t=B&mode=mock&w=420', 3, 'B · MOCKUP', { w: 1000, h: 700, title: 'B · MOCKUP', chips: P }), art('page=cardart&t=C&mode=mock&w=420', 3, 'C · MOCKUP', { w: 1000, h: 700, title: 'C · MOCKUP', chips: P }))),
      section('03', 'FINISH AND COMPLEXITY', table(['TERRITORY', 'CHARACTER', 'PROPOSED FINISH', 'PRINT COMPLEXITY'], [['<b>A</b> ARCHITECTURAL EDITORIAL', 'RED-GLASS PAVILION PHOTOGRAPH, SITE 00 WORDMARK, DISPLAY HEADLINE', '16 PT MATTE, SOFT-TOUCH LAMINATE FRONT', 'MEDIUM · FULL-BLEED PHOTO, COLOUR-MANAGED RED'], ['<b>B</b> MINIMAL ACCESS CARD', 'WHITE FIELD, BLACK TYPE, ONE RED RULE', '32 PT UNCOATED DUPLEX, RED EDGE PAINT (OPTIONAL)', 'LOW–MEDIUM · EDGE PAINT ADDS A VENDOR STEP'], ['<b>C</b> RED STRUCTURAL SIGNATURE', 'RED STRUCTURAL COLUMN + TALL RED-GLASS PHOTOGRAPH FRONT · SOLID RED BACK WITH WHITE TYPE', '16 PT MATTE, SPOT RED (PANTONE MATCH TO BE PROOFED)', 'MEDIUM–HIGH · LARGE SOLID RED NEEDS A PROOF']], W)),
    ],
  }),
  R30: () => ({
    num: 'R30', group: 'F · CARD DESIGN', title: 'Referral card · back concepts', tier: 'QR SIDE',
    sub: 'The back carries the call to action, the short URL with its code masked, the QR, and INTRODUCED BY <PARTNER>. The QR is a placeholder labelled NOT VALID FOR PRINT; no back can be exported for print with it.',
    body: [
      section('01', 'FLAT ARTWORK · BACK', row(art('page=cardart&t=A&mode=back&w=900', 3, 'A · BACK', { title: 'A · BACK', chips: chips(P, NP) }), art('page=cardart&t=B&mode=back&w=900', 3, 'B · BACK', { title: 'B · BACK', chips: NP }), art('page=cardart&t=C&mode=back&w=900', 3, 'C · BACK', { title: 'C · BACK', chips: NP }))),
      section('02', 'FRONT + BACK PAIRS', row(art('page=cardart&t=A&mode=flat&w=420', 3, 'A · PAIR', { w: 1000, h: 400, title: 'A', chips: P }), art('page=cardart&t=B&mode=flat&w=420', 3, 'B · PAIR', { w: 1000, h: 400, title: 'B', chips: P }), art('page=cardart&t=C&mode=flat&w=420', 3, 'C · PAIR', { w: 1000, h: 400, title: 'C', chips: P })) +
        callout('<b>Two card systems, never combined.</b> System A — SITE 00 studio business cards — is out of scope. System B — these IDNTY Digital Foundation referral cards — carries no partner terms, no rates, no banking data, no admin identifiers and no secret in the QR.', W)),
    ],
  }),
  R31: () => ({
    num: 'R31', group: 'F · CARD DESIGN', title: 'QR validation', tier: 'RO-07 · LINK CONTRACT',
    sub: 'The QR encodes only the public referral URL (https://site00.com/invite/<opaque code>). Validation checks HTTPS, resolution, target, production origin, absence of admin paths/secrets, and a recorded real-device scan.',
    body: [
      section('01', 'FAIL (STAGING) · PASS · MOBILE', row(D('ro=RO-07', 3, { title: 'STAGING ORIGIN · BLOCKED', chips: P }), D('ro=RO-07&os=ok', 3, { title: 'PRODUCTION · DEVICE SCAN PENDING', chips: P }), M('ro=RO-07', 3, { scale: 0.6, title: 'MOBILE', chips: P }))),
      section('02', 'QR + LINK CONTRACT', table(['RULE', 'REQUIREMENT'], [['PAYLOAD', 'PUBLIC URL ONLY · NO PARTNER ID, TERMS, EMAIL OR TOKEN'], ['CODE', '≥ 96 BITS OF ENTROPY, URL-SAFE, NOT DERIVED FROM NAME OR SEQUENCE; STORED HASHED OR UNIQUE-INDEXED'], ['ERROR CORRECTION', 'LEVEL H (EXISTING renderInvitationQrSvg) OR M IF DENSITY REQUIRES — DECIDE AT PROOF'], ['MINIMUM SIZE', '0.8 IN (20 MM) PRINTED, MODULE ≥ 0.5 MM'], ['QUIET ZONE', '4 MODULES ON EVERY SIDE, NOTHING PRINTED INSIDE'], ['CONTRAST', 'BLACK ON WHITE PANEL; NEVER RED-ON-RED OR OVER A PHOTOGRAPH'], ['REVOCATION', 'REVOKED CODE → PUBLIC “NO LONGER ACTIVE” PAGE; PRINTED CARDS DEGRADE GRACEFULLY'], ['AUTHENTICATION', 'POSSESSING A QR URL NEVER AUTHENTICATES A PARTNER']], W)),
    ],
  }),
  R32: () => ({
    num: 'R32', group: 'F · CARD DESIGN', title: 'Digital card sharing', tier: 'SHARE · COPY · DOWNLOAD',
    sub: 'Partners share their card from their own device. SITE 00 sends nothing. The prospect lands on the public entry, which names the introducing partner but no terms.',
    body: [
      section('01', 'SHARE · EXPORT · LANDING', row(TP('ro=RO-08', 4, { title: 'SHARE SHEET', chips: chips(P, OPEN('FD-R15')) }), D('ro=RO-09', 4, { scale: fit(4, 834) * 834 / 1440, title: 'EXPORT · DIGITAL ONLY', chips: P }), M('page=portal&view=card', 4, { title: 'PARTNER PORTAL · MY CARD', chips: P }), M('page=public&st=valid', 4, { title: 'PROSPECT LANDING', chips: P }))),
      section('02', 'PUBLIC ENTRY STATES', row(M('page=public&st=invalid', 3, { scale: 0.62, title: 'INVALID CODE', chips: P }), M('page=public&st=revoked', 3, { scale: 0.62, title: 'REVOKED', chips: P }), M('page=public&st=test', 3, { scale: 0.62, title: 'TEST / STAGING', chips: P }))),
    ],
  }),
  R33: () => ({
    num: 'R33', group: 'F · CARD DESIGN', title: 'Print preview and proof', tier: 'RO-10',
    sub: 'The proof shows trim, bleed and safe area with the real artwork. Print export stays blocked until the partner exists, the link is valid, the QR is verified, template and copy are approved and the print spec is confirmed.',
    body: [
      section('01', 'PROOF', row(D('ro=RO-10', 2, { title: 'PRINT PROOF · BLOCKED', chips: chips(P, NP) }), art('page=cardart&t=A&mode=print&w=560', 2, 'A · BLEED / TRIM / SAFE', { w: 1400, h: 520, title: 'A · PROOF CANVAS', chips: NP }))),
      section('02', 'PRINT PATH (ORDER IS MANDATORY)', `<div class="bd-chain" style="width:${W}px">${['POLICY APPROVED', 'PARTNER CREATED', 'DURABLE LINK', 'STAGING VERIFIED', 'PRODUCTION URL VERIFIED', 'TEMPLATE APPROVED', 'REAL QR', 'PHONE SCAN', 'EXPORT', 'PRINTER PROOF', 'PRINT'].map((t, i) => `<div class="${i > 8 ? 'red' : ''}"><b>${String(i + 1).padStart(2, '0')}</b><span>${t}</span></div>`).join('')}</div>`),
    ],
  }),
  R34: () => ({
    num: 'R34', group: 'F · CARD DESIGN', title: 'Print-production specimen', tier: 'BLEED · SAFE · CMYK · QR',
    sub: 'Specification for the printer once every gate is closed. The TEST band and NOT VALID FOR PRINT marks are part of every pre-approval file.',
    body: [
      section('01', 'B AND C ON THE PROOF CANVAS', row(art('page=cardart&t=B&mode=print&w=560', 2, 'B · PROOF', { w: 1400, h: 520, title: 'B', chips: NP }), art('page=cardart&t=C&mode=print&w=560', 2, 'C · PROOF', { w: 1400, h: 520, title: 'C', chips: NP }))),
      section('02', 'TEST-MARKED FILE', row(art('page=cardart&t=A&mode=flat&w=480&test=1', 1, 'A · TEST BAND · PRE-APPROVAL', { w: 1200, h: 420, scale: 0.9, title: 'PRE-APPROVAL ARTWORK CARRIES A TEST BAND', chips: NP }))),
      section('03', 'SPECIFICATION', table(['ITEM', 'SPECIFICATION'], [['TRIM', '3.5 × 2 IN (88.9 × 50.8 MM)'], ['BLEED', '0.125 IN EACH SIDE → 3.75 × 2.25 IN CANVAS'], ['SAFE AREA', '0.125 IN INSIDE TRIM; QR, URL AND PARTNER LINE INSIDE SAFE'], ['COLOUR', 'CMYK PDF/X-1a OR X-4; RED PROOFED AGAINST SITE 00 #CE1017 (SPOT OPTION FOR C); RICH BLACK 60/40/40/100 FOR LARGE AREAS, 100 K FOR TYPE'], ['IMAGES', '≥ 300 PPI AT PRINT SIZE; ONLY APPROVED SITE 00 ENVIRONMENT IMAGERY'], ['TYPE', 'SITE 00 DISPLAY + SAIRA SEMI CONDENSED, OUTLINED OR EMBEDDED; MIN 6 PT'], ['QR', '≥ 0.8 IN, 4-MODULE QUIET ZONE, 100 K ON WHITE, VECTOR'], ['STOCK / FINISH', 'FD-R14 · SEE R29'], ['FILES', 'ONE PDF PER SIDE PER PARTNER; FILENAME CARRIES PARTNER CODE HASH + TEMPLATE VERSION, NEVER AN ADMIN ID']], W)),
    ],
  }),
  // ═══ G · PARTNER PORTAL ════════════════════════════════════════════════════
  R35: () => ({
    num: 'R35', group: 'G · PARTNER PORTAL', title: 'Partner portal · mobile home', tier: 'SEPARATE SURFACE',
    sub: 'A separate, partner-facing surface — not the founder workspace. Four tabs: HOME · MY CARD · EARNINGS · TERMS. Client labels are masked (FD-R11). Access requires authentication (FD-R12), never a QR URL.',
    body: [
      section('01', 'HOME', row(M('page=portal&view=home', 4, { title: 'HOME', chips: chips(P, IL, OPEN('FD-R11')) }), M('page=portal&view=home&scroll=500', 4, { title: 'SCROLLED', chips: P }), M('page=portal&view=terms', 4, { title: 'TERMS', chips: P }), TP('page=portal&view=home', 4, { scale: fit(4, 390) * 390 / 834, title: 'TABLET', chips: P }))),
      section('02', 'PARTNER ACCESS STATES', table(['STATE', 'MEANING', 'PORTAL', 'LINKS / CARDS'], [['<b>INVITED</b>', 'INVITATION RECORDED · NOT YET SENT OR ACCEPTED', 'NO ACCESS', 'NONE ISSUED'], ['<b>ACTIVATION PENDING</b>', 'INVITATION ACCEPTED · IDENTITY OR TERMS INCOMPLETE', 'TERMS + PROFILE ONLY', 'NONE ISSUED'], ['<b>ACTIVE</b>', 'TERMS SIGNED · APPROVED BY FOUNDER', 'FULL', 'ACTIVE'], ['<b>SUSPENDED</b>', 'PAUSED BY FOUNDER', 'READ-ONLY', 'PAUSED · PROSPECTS BEGIN UNATTRIBUTED'], ['<b>REVOKED</b>', 'ACCESS REMOVED', 'NONE', 'REVOKED'], ['<b>ARCHIVED</b>', 'RELATIONSHIP ENDED · RECORDS KEPT', 'NONE', 'RETIRED']], W)),
    ],
  }),
  R36: () => ({
    num: 'R36', group: 'G · PARTNER PORTAL', title: 'Partner portal · my card', tier: 'MOBILE',
    sub: 'Front and back, SHARE CARD, COPY REFERRAL LINK, DOWNLOAD DIGITAL CARD. Printed cards are ordered by SITE 00 after QR verification.',
    body: [section('01', 'MY CARD', row(M('page=portal&view=card', 3, { scale: 0.95, title: 'MY CARD', chips: chips(P, NP) }), M('page=portal&view=card&scroll=520', 3, { scale: 0.95, title: 'SCROLLED · SHARE + LINK', chips: P }), M('ro=RO-08', 3, { scale: 0.95, title: 'SHARE (SAME PATTERN)', chips: P })))],
  }),
  R37: () => ({
    num: 'R37', group: 'G · PARTNER PORTAL', title: 'Partner portal · earnings', tier: 'MOBILE',
    sub: 'Pending, approved, paid all-time and the next planned payout (ESTIMATED). Commission rows show the masked client, the state and the amount; payout history shows the method type only.',
    body: [section('01', 'EARNINGS', row(M('page=portal&view=earnings', 3, { scale: 0.95, title: 'EARNINGS', chips: chips(P, IL) }), M('page=portal&view=earnings&scroll=520', 3, { scale: 0.95, title: 'PAYOUT HISTORY', chips: P }), M('page=portal&view=terms', 3, { scale: 0.95, title: 'TERMS · AS AGREED', chips: chips(P, OPEN('FD-R01–R06')) })))],
  }),
  R38: () => ({
    num: 'R38', group: 'G · PARTNER PORTAL', title: 'Partner portal · desktop', tier: 'DESKTOP',
    sub: 'Top navigation instead of a bottom bar; three columns (summary + referrals · card · support).',
    body: [
      section('01', 'HOME', row(D('page=portal&view=home', 1, { scale: 0.86, title: 'OVERVIEW', chips: chips(P, IL) }))),
      section('02', 'CARD · EARNINGS', row(D('page=portal&view=card', 2, { title: 'MY CARD', chips: P }), D('page=portal&view=earnings', 2, { title: 'EARNINGS', chips: P }))),
    ],
  }),
  // ═══ H · SHARED SYSTEMS ════════════════════════════════════════════════════
  R39: () => ({
    num: 'R39', group: 'H · SHARED', title: 'Referral activity', tier: 'ALL TIERS',
    sub: 'Recorded events only, never inferred. Filters: ALL · PARTNERS · ATTRIBUTION · COMMISSIONS · PAYOUTS · CARDS. Each event names its actor (SYSTEM · FOUNDER · CLIENT · PARTNER) and links to its record.',
    body: [section('01', 'ACTIVITY', row(D('page=activity', 3, { title: '1440', chips: chips(P, IL) }), TP('page=activity', 3, { title: '834', chips: P }), M('page=activity', 3, { scale: 0.6, title: '390', chips: P })))],
  }),
  R40: () => ({
    num: 'R40', group: 'H · SHARED', title: 'Overlay system', tier: 'RO-01 … RO-20',
    sub: 'Twenty referral overlays on the OPUS2 overlay grammar: full screen or sheet on phones, dialog/sheet/popover on tablet, dialog/popover/inspector on desktop. Mobile pickers follow FD-1…FD-6 (editorial selection sheet; square, 2 px red edge).',
    body: [
      section('01', 'ALL TWENTY AT 1440', `<div class="bd-grid" style="grid-template-columns:repeat(4,${(W - 66) / 4}px)">${OVERLAYS.map((k) => D(`ro=${k}`, 4, { scale: (W - 66) / 4 / 1440, title: `${k} · ${RO_NAMES[k]}`, chips: P })).join('')}</div>`),
      section('02', 'PRESENTATION BY TIER', table(['ID', 'NAME', 'MOBILE', 'TABLET', 'DESKTOP'], OVERLAYS.map((k) => [`<b>${k}</b>`, RO_NAMES[k], ...modeOf(k).map((m) => m.toUpperCase())]), W)),
    ],
  }),
  R41: () => ({
    num: 'R41', group: 'H · SHARED', title: 'Responsive component matrix', tier: 'M · TP · TL · D',
    sub: 'The same components at each tier. Container queries, not viewport breakpoints, decide the variant: the registry and ledgers read their own width.',
    body: [
      section('01', 'COMMISSIONS AT FOUR TIERS', row(M('page=commissions', 4, { scale: 0.36 * 1440 / 390 * 0.62, title: 'M 390', chips: P }), TP('page=commissions', 4, { scale: 0.36 * 1440 / 834 * 0.62, title: 'TP 834', chips: P }), TL('page=commissions', 4, { scale: 0.36 * 1440 / 1194 * 0.62, title: 'TL 1194', chips: P }), D('page=commissions', 4, { scale: 0.36 * 0.62, title: 'D 1440', chips: P }))),
      section('02', 'MATRIX', `<table class="bd-t bd-mat" style="width:${W}px"><thead><tr><th>COMPONENT</th><th>MOBILE &lt; 768</th><th>TABLET PORTRAIT</th><th>TABLET LANDSCAPE</th><th>DESKTOP ≥ 1280</th></tr></thead><tbody>${[
        ['NAVIGATION', 'MENU DRAWER · BOTTOM BAR UNCHANGED', 'RAIL ITEM “REFERRALS”', 'RAIL ITEM', 'SIDEBAR 06 REFERRALS'],
        ['SECTION NAV', 'SECTION SELECT → SHEET (RO-S)', 'TAB ROW', 'TAB ROW', 'TAB ROW'],
        ['SIGNALS', '2-UP, ODD LAST SPANS', '3 / 4 / 5-UP BY CONTAINER', '5-UP', '5-UP'],
        ['PARTNER REGISTRY', 'TWO-LINE ROW + COUNT', 'PARTNER · TYPE · REFERRALS', 'SAME / 7 COLS ≥ 900', '7 COLUMNS'],
        ['LEDGERS', 'COMPOSITE ROW · AMOUNT + STATE RIGHT', '4 COLUMNS', '7 COLUMNS', '7 COLUMNS'],
        ['INSPECTOR', 'BOTTOM SHEET', 'BOTTOM SHEET', 'DOCKED IF STAGE ≥ 680', 'DOCKED'],
        ['CARD STAGE', 'FULL WIDTH ≤ 520', 'STAGE + CONTROLS STACKED', 'STAGE | CONTROLS', 'PICKER | STAGE | CONTROLS'],
        ['DIALOGS', 'FULL SCREEN, STICKY FOOTER, KEYBOARD-SAFE', 'DIALOG 560–640', 'DIALOG', 'DIALOG / POPOVER'],
        ['PICKERS (FD-1…6)', 'EDITORIAL SELECTION SHEET', 'ANCHORED LISTBOX', 'ANCHORED LISTBOX', 'ANCHORED LISTBOX'],
      ].map((r) => `<tr>${r.map((c, i) => `<td class="${i ? 'y' : ''}">${i ? c : `<b>${c}</b>`}</td>`).join('')}</tr>`).join('')}</tbody></table>`),
    ],
  }),
  R42: () => ({
    num: 'R42', group: 'H · SHARED', title: 'Navigation and route tree', tier: 'SIDEBAR · RAIL · MENU · BOTTOM BAR',
    sub: 'REFERRALS is the seventh workspace destination (06, SYSTEM becomes 07 — FD-R20). The mobile bottom bar stays HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM; REFERRALS is reached from the MENU.',
    body: [
      section('01', 'THREE NAVIGATION FORMS', row(D('page=overview', 3, { title: 'DESKTOP SIDEBAR', chips: chips(P, OPEN('FD-R20')) }), TP('page=overview', 3, { scale: 0.45, title: 'TABLET RAIL', chips: P }), M('ro=RO-M', 3, { scale: 0.6, title: 'MOBILE MENU', chips: P }))),
      section('02', 'ROUTE TREE (PROPOSED)', `<div class="bd-tree" style="width:${W}px">/admin/idnty/workspace                       <i>EXISTING FOUNDER WORKSPACE SHELL</i>
├─ /referrals                                 <em>06 REFERRALS · OVERVIEW</em>
│  ├─ /partners                               <i>REGISTRY · ?status= ?q=</i>
│  │  └─ /partners/:partnerRef                <i>DETAIL · ?section=overview|referrals|commissions|payouts|cards|terms|activity</i>
│  ├─ /attribution                            <i>LEDGER · ?view=all|tracked|converted|exceptions</i>
│  │  └─ /attribution/:referralRef            <i>SOURCE TRACE</i>
│  ├─ /commissions                            <i>LEDGER · ?state=  · /commissions/:ref → INSPECTOR</i>
│  ├─ /payouts                                <i>LEDGER · /payouts/:ref → INSPECTOR</i>
│  ├─ /cards                                  <i>CARD STUDIO · ?partner= ?template= ?side=</i>
│  └─ /activity                               <i>EVENTS · ?filter=</i>
├─ /foundations/:clientRef                    <i>CLIENT RECORD → “REFERRAL SOURCE” LINK BACK TO /referrals/attribution/:ref</i>
/invite/:code                                 <em>EXISTING PUBLIC ENTRY (InvitationEntryPage) · NO NEW /r/ ROUTE</em>
/partner                                      <em>SEPARATE PARTNER PORTAL (FD-R12) · /partner/card · /partner/earnings · /partner/terms</em></div>`),
    ],
  }),
  R43: () => ({
    num: 'R43', group: 'H · SHARED', title: 'End-to-end attribution journey', tier: 'PARTNER → DF ARTIFACT',
    sub: 'Partner → link → QR → prospect → DF artifact. The referral context is resolved and held server-side; the artifact receives one immutable attribution; the client stays a normal Digital Foundation client.',
    body: [
      section('01', 'CHAIN', chain([0, 1, 2, 3, 4], [4])),
      section('02', 'FRAMES', row(art('page=cardart&t=A&mode=back&w=700', 4, 'CARD · BACK', { w: 900, h: 560, title: '01–03 · CARD + QR', chips: NP }), M('page=public&st=valid', 4, { scale: 0.62, title: '04 · PROSPECT LANDS', chips: P }), D('page=trace', 4, { title: '05 · TRACE', chips: P }), D('page=attribution&sel=1', 4, { title: 'LEDGER → FOUNDATIONS', chips: P }))),
      section('03', 'RULES', bul(['The public code is opaque and carries no partner id, terms or secret; the server resolves it.', 'A partner id supplied by the client is never attribution evidence (E13).', 'Attribution is written once, when the DF artifact is created, with an idempotency key; later touches cannot overwrite it (E06).', 'Referred clients use the existing DF entry, intake, quote and payment — no duplicate flows.', 'FOUNDATIONS → CLIENT shows REFERRAL SOURCE; REFERRALS → PARTNER → CLIENT opens the same record.'], W)),
    ],
  }),
  R44: () => ({
    num: 'R44', group: 'H · SHARED', title: 'End-to-end commission and payout journey', tier: 'PAYMENT → AUDIT',
    sub: 'Payment → eligibility → approval → payout → recorded payment → audit. Each transition needs server evidence or a founder action with a reason.',
    body: [
      section('01', 'CHAIN', chain([5, 6, 7, 8], [7])),
      section('02', 'FRAMES', row(D('page=commissions&insp=commission', 4, { title: '06–07 · ELIGIBLE · CALCULATION', chips: P }), D('ro=RO-12', 4, { title: 'APPROVE', chips: P }), D('ro=RO-15', 4, { title: '08 · RECORD PAYMENT', chips: P }), D('page=activity', 4, { title: '09 · AUDIT', chips: P }))),
      section('03', 'STATE MACHINE', STATE_MACHINE),
    ],
  }),
};

const def = BOARDS[id]();
mount(`${header(def)}${def.body.join('')}`);
