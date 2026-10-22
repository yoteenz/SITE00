// REFERRALS authority kit (Opus 3). Seven-destination shell + referral data + card + QR placeholder.
// Builds on the OPUS2 responsive kit; the OPUS2 files are not modified.
// Every partner, client, amount and date below is FICTIONAL and ILLUSTRATIVE. No rate, fee, window or term is proposed.
import { DF, icon, ARROW, CHEV, PLUS, CHECK, esc, mk, st, chip, count, gap, kbd, btn, iconbtn, plate, ident, seg, tabs, segctl, kv, act, field, banner, panel, inspHead, money, DEMO, byName } from '../../../founder-workspace-responsive-authority-opus2/boards/src/ws-kit.js';

export { DF, icon, ARROW, CHEV, PLUS, CHECK, esc, mk, st, chip, count, gap, kbd, btn, iconbtn, plate, ident, seg, tabs, segctl, kv, act, field, banner, panel, inspHead, money, DEMO, byName };

// ─── Navigation: REFERRALS becomes destination 06; SYSTEM keeps the last position (07) ───────────
export const NAV7 = [
  { id: 'overview', n: '01', label: 'OVERVIEW', m: 'HOME', icon: 'home' },
  { id: 'foundations', n: '02', label: 'FOUNDATIONS', m: 'FOUNDATIONS', icon: 'users' },
  { id: 'reviews', n: '03', label: 'REVIEWS', m: 'REVIEWS', icon: 'approval' },
  { id: 'operations', n: '04', label: 'OPERATIONS', m: 'OPS', icon: 'checklist' },
  { id: 'correspondence', n: '05', label: 'CORRESPONDENCE', m: 'MAIL', icon: 'email' },
  { id: 'referrals', n: '06', label: 'REFERRALS', m: 'REFERRALS', icon: 'share' },
  { id: 'system', n: '07', label: 'SYSTEM', m: 'SYSTEM', icon: 'server' },
];
const BADGE = { reviews: 4, referrals: 2 };
const BY = Object.fromEntries(NAV7.map((n) => [n.id, n]));

export const brand = (env = 'STAGING') => `<span class="ws-brand"><b>SITE 00</b><span>FOUNDER <span class="ws-env">${env}</span></span></span>`;

function sidebar(active) {
  return `<div class="ws-side">${brand()}
    <div class="ws-side__create">${btn('NEW FOUNDATION', { tone: 'red', block: true, ic: 'add', attrs: 'data-anchor="create"' })}</div>
    <ul class="ws-side__list">${NAV7.map((n) => `<li><a class="ws-side__i ${active === n.id ? 'ws-side__i--on' : ''}" ${active === n.id ? 'aria-current="page"' : ''}><span class="ws-idx">${n.n}</span><i></i><span>${n.label}</span>${BADGE[n.id] ? count(BADGE[n.id]) : ''}</a></li>`).join('')}</ul>
    <div class="ws-side__sep"></div>
    <a class="ws-side__tool">${icon('checklist')}<span>READINESS DESK</span>${icon('external')}</a>
    <a class="ws-side__tool">${icon('email')}<span>CORRESPONDENCE STUDIO</span>${icon('external')}</a>
    <div class="ws-side__foot" data-anchor="account"><span class="ws-plate ws-plate--xs" aria-hidden="true">K</span><span class="ws-who"><b style="font-size:12px">FOUNDER</b><span>ADMIN · SIGNED IN</span></span><span style="margin-left:auto;color:var(--ws-muted)">${icon('more', '', 'style="width:18px;height:18px"')}</span></div>
  </div>`;
}

function rail(active) {
  return `<div class="ws-rail"><span class="ws-plate ws-plate--xs" aria-hidden="true">00</span>
    <a class="ws-rail__create" data-anchor="create"><span>${PLUS}</span>NEW</a>
    ${NAV7.map((n) => `<a class="ws-rail__i ${active === n.id ? 'ws-rail__i--on' : ''}" ${active === n.id ? 'aria-current="page"' : ''} aria-label="${n.label}">${icon(n.icon)}<span>${n.m}</span>${BADGE[n.id] ? count(BADGE[n.id]) : ''}</a>`).join('')}
    <span class="ws-rail__foot" data-anchor="account"><span class="ws-plate ws-plate--xs" aria-hidden="true">K</span></span></div>`;
}

/** Phone bottom nav — LOCKED: HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM. A secondary destination (REFERRALS)
 *  highlights nothing here; it is marked in the page header and in the MENU drawer instead. */
function bnav(active) {
  const item = (n) => `<a class="ws-bnav__i ${active === n.id ? 'ws-bnav__i--on' : ''}" ${active === n.id ? 'aria-current="page"' : ''}>${icon(n.icon)}${n.m}${BADGE[n.id] ? count(BADGE[n.id]) : ''}</a>`;
  return `<nav class="ws-bnav" aria-label="PRIMARY">${item(BY.overview)}${item(BY.foundations)}<a class="ws-bnav__c" data-anchor="create-m"><span>${PLUS}</span>CREATE</a>${item(BY.reviews)}${item(BY.system)}</nav>`;
}

function topbar({ crumb, back, search }) {
  const [n, ...parts] = crumb;
  const trail = parts.map((p, i) => (i < parts.length - 1 ? `<a>${p}</a><span class="sep">/</span>` : `<span class="cur">${p}</span>`)).join('');
  const m = back
    ? `<div class="ws-top__m">${iconbtn('back', 'BACK')}<span class="ws-label" style="letter-spacing:.2em">${back}</span>${iconbtn('more', 'MORE ACTIONS')}</div>`
    : `<div class="ws-top__m">${brand()}<span class="ws-top__acts">${iconbtn('search', 'SEARCH')}${iconbtn('notification', 'NOTIFICATIONS', true)}<span data-anchor="menu">${iconbtn('menu', 'MENU')}</span></span></div>`;
  return `<header class="ws-top">${m}
    <div class="ws-top__d"><nav class="ws-crumb" aria-label="BREADCRUMB"><b>${n}</b><i></i>${trail}</nav>
      <span class="ws-search ws-search--top ${search ? 'ws-search--focus' : ''}" data-anchor="search">${icon('search')}<span>${search || 'SEARCH CLIENTS, PARTNERS, REFERRALS'}</span>${kbd('⌘K')}</span>
      <span data-anchor="bell">${iconbtn('notification', 'NOTIFICATIONS · 4 NEW', true)}</span></div></header>`;
}

export function app({ active, crumb, back = '', body, insp = '', density = 'standard', search = '', after = '' }) {
  return `<div class="ws-app ${insp ? 'ws-app--insp' : ''}">
    <nav class="ws-nav" aria-label="PRIMARY">${sidebar(active)}${rail(active)}</nav>
    ${topbar({ crumb, back, search })}
    <main class="ws-stage ws-${density}" id="stage">${body}</main>
    ${insp ? `<aside class="ws-insp ws-${density}" aria-label="INSPECTOR">${insp}</aside>` : ''}
    ${bnav(active)}
  </div>${after}`;
}

/** Phone MENU drawer content — REFERRALS lives here (marked current when active); SYSTEM stays in the bottom bar. */
export function menuDrawer(active) {
  const row = (n, cur) => `<div class="ws-menu__i ${cur ? 'ws-menu__i--act' : ''}" role="menuitem" ${cur ? 'aria-current="page"' : ''}>${icon(n.icon)}<span>${n.n} · ${n.label}</span><span class="ws-meta">${BADGE[n.id] ? count(BADGE[n.id]) : ''}</span></div>`;
  return `${row(BY.operations, active === 'operations')}${row(BY.correspondence, active === 'correspondence')}${row(BY.referrals, active === 'referrals')}<div class="ws-menu__sep"></div>
    <div class="ws-menu__i" role="menuitem">${icon('checklist')}<span>READINESS DESK</span><span class="ws-meta">↗</span></div><div class="ws-menu__i" role="menuitem">${icon('email')}<span>CORRESPONDENCE STUDIO</span><span class="ws-meta">↗</span></div><div class="ws-menu__sep"></div>
    <div class="ws-menu__i" role="menuitem">${icon('user')}<span>FOUNDER · ADMIN</span><span></span></div><div class="ws-menu__i ws-menu__i--danger" role="menuitem">${icon('back')}<span>SIGN OUT</span><span></span></div>`;
}

// ─── Referral section navigation ─────────────────────────────────────────────────────────────────
export const RF_SECTIONS = ['OVERVIEW', 'PARTNERS', 'ATTRIBUTION', 'COMMISSIONS', 'PAYOUTS', 'CARD STUDIO', 'ACTIVITY'];
export const secnav = (on, counts = { 3: '2' }) =>
  `<nav class="rf-secnav" aria-label="REFERRALS SECTIONS">${tabs(RF_SECTIONS.map((s, i) => [s, counts[i] ?? '']), on, { label: 'REFERRALS SECTIONS' })}
   <button class="rf-secnav__m" data-anchor="secsel" aria-haspopup="dialog"><span class="ws-label" style="color:var(--ws-ink)">SECTION · ${RF_SECTIONS[on]}</span>${icon('next', '', 'style="width:16px;height:16px;transform:rotate(90deg)"')}</button></nav>`;

export const specTag = (t = 'SPECIMEN · ILLUSTRATIVE VALUES · NO RATE PROPOSED') => `<span class="rf-spec">${t}</span>`;
export const img = (k, cls = '', style = '') => `<span class="rf-img rf-img--${k} ${cls}" style="${style}" aria-hidden="true"></span>`;

export function rfHead({ title = 'REFERRALS', sub = 'PARTNERS · ATTRIBUTION · COMMISSIONS · PAYOUTS', acts = '', imgKey = 'pav', n = '06' } = {}) {
  return `<div class="rf-head">${img(imgKey, 'rf-head__img')}<header class="ws-phead"><div><div class="ws-phead__rail"><b>${n}</b><span></span></div><h1 class="ws-title">${title}<i aria-hidden="true"></i></h1><div class="ws-meta ws-phead__sub">${sub}</div><div style="margin-top:10px">${specTag()}</div></div>${acts ? `<div class="ws-phead__acts">${acts}</div>` : ''}</header></div>`;
}

// ─── Fictional data ─────────────────────────────────────────────────────────────────────────────
// AIO is the first PLANNED partner: shown as a design specimen only, never as an active record.
export const PARTNERS = [
  { id: 'aio', name: 'All In One Enterprises Inc', type: 'STRATEGIC PARTNER', status: 'planned', stl: 'PLANNED · NOT ACTIVE', img: 'pav', owner: 'FOUNDER', refs: 0, conv: 0, owed: 0, card: 'DESIGN ONLY', link: 'NOT ISSUED', since: '—', email: 'contact@aio-example.invalid', terms: 'NOT SET · FD-R01–R07' },
  { id: 'mer', name: 'Meridian Bookkeeping', type: 'BUSINESS PARTNER', status: 'active', stl: 'ACTIVE', img: 'door', owner: 'FOUNDER', refs: 4, conv: 2, owed: 11500, card: 'V2 · APPROVED', link: 'ACTIVE', since: 'AUG 2026', email: 'office@meridian-books.invalid', terms: 'EXAMPLE TERMS · E-1' },
  { id: 'har', name: 'Harbor Permit Services', type: 'STRATEGIC PARTNER', status: 'active', stl: 'ACTIVE', img: 'tall', owner: 'FOUNDER', refs: 3, conv: 1, owed: 0, card: 'V1 · APPROVED', link: 'ACTIVE', since: 'SEP 2026', email: 'team@harbor-permits.invalid', terms: 'EXAMPLE TERMS · E-2' },
  { id: 'kes', name: 'Kestrel Dispatch Co', type: 'BUSINESS PARTNER', status: 'suspended', stl: 'SUSPENDED', img: 'inv', owner: 'FOUNDER', refs: 1, conv: 0, owed: 0, card: 'V1 · ON HOLD', link: 'PAUSED', since: 'SEP 2026', email: 'ops@kestrel-dispatch.invalid', terms: 'EXAMPLE TERMS · E-1' },
  { id: 'riv', name: 'J. Rivera', type: 'INDIVIDUAL REFERRER', status: 'invited', stl: 'ACTIVATION PENDING', img: 'door', owner: 'FOUNDER', refs: 0, conv: 0, owed: 0, card: 'NOT CREATED', link: 'NOT ISSUED', since: '—', email: 'j.rivera@example.invalid', terms: 'DRAFT' },
];
export const P = Object.fromEntries(PARTNERS.map((p) => [p.id, p]));
export const pStatus = (p) => (p.status === 'active' ? st('work', p.stl) : p.status === 'suspended' ? st('blocked', p.stl) : p.status === 'invited' ? st('client', p.stl) : `<span class="cs cs--planned">${p.stl}</span>`);

// Commission lifecycle (proposed, FD-gated): TRACKED → NOT YET ELIGIBLE → ELIGIBLE → PENDING APPROVAL → APPROVED → SCHEDULED → PAID; ADJUSTED · REVERSED · DISPUTED
export const CSTATE = { tracked: 'TRACKED', noteligible: 'NOT YET ELIGIBLE', eligible: 'ELIGIBLE', pending: 'PENDING APPROVAL', approved: 'APPROVED', scheduled: 'SCHEDULED', paid: 'PAID', adjusted: 'ADJUSTED', reversed: 'REVERSED', disputed: 'DISPUTED', failed: 'FAILED' };
export const cs = (k, t = CSTATE[k]) => `<span class="cs cs--${k}">${t}</span>`;

// Referred clients (attribution) — canonical client records stay in FOUNDATIONS; these are links to them.
export const REFS = [
  { id: 'R-0012', c: 'Nova Creative', p: 'har', at: 'AUG 21', via: 'CARD V1 · QR', intake: 'COMPLETE', conv: 'PAID · AUG 30', comm: 'paid', amt: 5000, next: 'NONE' },
  { id: 'R-0015', c: 'Field & Ember', p: 'mer', at: 'SEP 18', via: 'CARD V2 · QR', intake: 'COMPLETE', conv: 'PAID · OCT 02', comm: 'scheduled', amt: 6000, next: 'RECORD PAYOUT' },
  { id: 'R-0016', c: 'Vela Boutique', p: 'mer', at: 'SEP 20', via: 'LINK · SHARED', intake: 'COMPLETE', conv: 'PAID · SEP 29 · PART-REFUNDED', comm: 'pending', amt: 5500, next: 'APPROVE · ADJUSTED BASIS' },
  { id: 'R-0019', c: 'Carter & Lane', p: 'mer', at: 'OCT 04', via: 'CARD V2 · QR', intake: 'COMPLETE', conv: 'QUOTE READY', comm: 'noteligible', amt: null, next: 'AWAITS PAYMENT' },
  { id: 'R-0020', c: 'Summit Wellness', p: 'har', at: 'OCT 06', via: 'LINK · SHARED', intake: 'COMPLETE', conv: 'QUOTE SENT', comm: 'noteligible', amt: null, next: 'AWAITS PAYMENT' },
  { id: 'R-0021', c: 'Horizon Freight', p: 'har', at: 'OCT 10', via: 'CARD V1 · QR', intake: 'COMPLETE', conv: 'IN REVIEW', comm: 'tracked', amt: null, next: 'NONE YET' },
  { id: 'R-0023', c: 'Atelier Bloom', p: 'mer', at: 'OCT 15', via: 'CARD V2 · QR', intake: 'IN PROGRESS', conv: '—', comm: 'tracked', amt: null, next: 'NONE YET' },
  { id: 'R-0024', c: 'Avery Studio', p: 'kes', at: 'OCT 17', via: 'LINK · SHARED', intake: 'NOT STARTED', conv: '—', comm: 'tracked', amt: null, next: 'PARTNER SUSPENDED · REVIEW' },
];
export const COMMS = [
  { id: 'C-0007', c: 'Nova Creative', p: 'har', ev: 'PAYMENT VERIFIED · AUG 30', basis: 100000, term: 'E-2 · EXAMPLE FIXED', amt: 5000, s: 'paid', d: 'SEP 09', po: 'PO-0003' },
  { id: 'C-0009', c: 'Field & Ember', p: 'mer', ev: 'PAYMENT VERIFIED · OCT 02', basis: 114000, term: 'E-1 · EXAMPLE PERCENT', amt: 6000, s: 'scheduled', d: 'OCT 08', po: 'PO-0005' },
  { id: 'C-0010', c: 'Vela Boutique', p: 'mer', ev: 'PAYMENT VERIFIED · SEP 29', basis: 104000, term: 'E-1 · EXAMPLE PERCENT', amt: 5500, s: 'pending', d: 'OCT 12', adj: 'PARTIAL REFUND · −$140.00 BASIS' },
  { id: 'C-0006', c: 'Lumen Dental', p: 'har', ev: 'PAYMENT VERIFIED · AUG 12', basis: 50000, term: 'E-2 · EXAMPLE FIXED', amt: -5000, s: 'reversed', d: 'SEP 01', adj: 'FULL REFUND · AUG 28' },
  { id: 'C-0011', c: 'Carter & Lane', p: 'mer', ev: 'QUOTE READY · NO PAYMENT', basis: null, term: 'E-1 · EXAMPLE PERCENT', amt: null, s: 'noteligible', d: 'OCT 04' },
  { id: 'C-0012', c: 'Summit Wellness', p: 'har', ev: 'QUOTE SENT · NO PAYMENT', basis: null, term: 'E-2 · EXAMPLE FIXED', amt: null, s: 'noteligible', d: 'OCT 06' },
  { id: 'C-0008', c: 'Kestrel referral · Peak Freight', p: 'kes', ev: 'PAYMENT VERIFIED · SEP 15', basis: 50000, term: 'E-1 · EXAMPLE PERCENT', amt: 2500, s: 'disputed', d: 'SEP 22', adj: 'ATTRIBUTION EXCEPTION · X-0002' },
];
export const PAYOUTS = [
  { id: 'PO-0003', p: 'har', amt: 5000, s: 'paid', method: 'BANK TRANSFER · RECORDED', ref: 'ACH ••4821', d: 'SEP 09', lines: ['C-0007'] },
  { id: 'PO-0005', p: 'mer', amt: 6000, s: 'scheduled', method: 'BANK TRANSFER · TO RECORD', ref: '—', d: 'OCT 24 (PLANNED)', lines: ['C-0009'] },
  { id: 'PO-0004', p: 'mer', amt: 3500, s: 'failed', method: 'BANK TRANSFER · RECORDED', ref: 'RETURNED · R01', d: 'SEP 30', lines: ['C-0004'] },
  { id: 'PO-0002', p: 'har', amt: 4000, s: 'paid', method: 'CHECK · RECORDED', ref: 'CHK 1042', d: 'AUG 20', lines: ['C-0003'] },
];
export const ACTIVITY = [
  ['OCT 17 · 14:02', 'REFERRAL CAPTURED', 'AVERY STUDIO · VIA KESTREL LINK', 'kes', 'SYSTEM', 'gap'],
  ['OCT 16 · 09:40', 'PARTNER SUSPENDED', 'KESTREL DISPATCH CO · ATTRIBUTION EXCEPTION OPEN', 'kes', 'FOUNDER', 'red'],
  ['OCT 15 · 18:22', 'INTAKE STARTED', 'ATELIER BLOOM · CARD V2 · MERIDIAN', 'mer', 'CLIENT', ''],
  ['OCT 12 · 11:05', 'COMMISSION ELIGIBLE', 'C-0010 · VELA BOUTIQUE · AWAITS APPROVAL', 'mer', 'SYSTEM', 'red'],
  ['OCT 08 · 16:30', 'COMMISSION APPROVED', 'C-0009 · FIELD & EMBER', 'mer', 'FOUNDER', 'done'],
  ['OCT 02 · 10:12', 'PAYMENT VERIFIED', 'FIELD & EMBER · STRIPE CHECKOUT', 'mer', 'STRIPE WEBHOOK', 'done'],
  ['SEP 30 · 08:00', 'PAYOUT FAILED', 'PO-0004 · BANK RETURN R01', 'mer', 'FOUNDER (RECORDED)', 'red'],
  ['SEP 22 · 15:44', 'CARD APPROVED', 'MERIDIAN · CARD V2 · TERRITORY A', 'mer', 'FOUNDER', 'done'],
  ['SEP 09 · 12:00', 'PAYOUT CONFIRMED', 'PO-0003 · HARBOR PERMIT · ACH ••4821', 'har', 'FOUNDER (RECORDED)', 'done'],
];

export const partnerThumb = (p, size = '') => `<span class="rf-img rf-img--${p.img} rf-thumb ${size ? `rf-thumb--${size}` : ''}" aria-hidden="true">${plate(p.name, { size: 'xs' })}</span>`;
export const amt = (minor, { muted = false } = {}) => (minor === null || minor === undefined ? '<span class="amt amt--muted">—</span>' : `<span class="amt ${minor < 0 ? 'amt--neg' : ''} ${muted ? 'amt--muted' : ''}">${minor < 0 ? '−' : ''}${money(Math.abs(minor))}</span>`);

// ─── QR placeholder: a deterministic NON-SCANNABLE pattern (finder squares + noise). Never a real code. ───
export function qrPlaceholder(seed = 'SPECIMEN', { label = true } = {}) {
  const n = 29;
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
  const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#0c0c0c"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#0c0c0c"/>`;
  let cells = '';
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const inF = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
      if (!inF && rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1" fill="#0c0c0c"/>`;
    }
  return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" style="stroke:none" role="img" aria-label="QR PLACEHOLDER · NOT A SCANNABLE CODE" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/>${cells}${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}${label ? `<rect x="5" y="12.2" width="${n - 10}" height="4.6" fill="#fff" stroke="#ce1017" stroke-width=".5"/><text x="${n / 2}" y="15.6" font-size="2.4" font-family="Saira Semi Condensed" font-weight="700" fill="#ce1017" text-anchor="middle" letter-spacing=".2">NOT VALID FOR PRINT</text>` : ''}</svg>`;
}

// ─── Referral card (3.5 × 2 in). Copy below is PROPOSED (FD-R13 / U-copy) — no tagline is final. ───
export function card({ t = 'A', side = 'front', partner = P.aio, w = 420, test = false, voidMark = true } = {}) {
  const svc = 'DOMAIN · PROFESSIONAL EMAIL<br>SECURITY · OWNERSHIP RECORDS';
  const url = `site00.com/invite/<span style="letter-spacing:.2em">• • • • • •</span>`;
  const by = `<div class="rcard__ref">INTRODUCED BY<b>${partner.name.toUpperCase()}</b></div>`;
  const testBand = test ? '<div class="rcard__test">STAGING TEST · NOT FOR PRINT</div>' : '';
  if (side === 'back') {
    return `<div class="rcard rcard--${t} rcard--back" style="--cw:${w}px" role="img" aria-label="REFERRAL CARD BACK · TERRITORY ${t}">${testBand}${t === 'A' ? img('tall', 'rcard__img') : ''}${t === 'B' ? '<span class="rcard__rule" style="top:9%"></span>' : ''}
      <div class="rcard__body"><div><div class="rcard__cta">SCAN TO BEGIN<br>YOUR DIGITAL FOUNDATION</div><div class="rcard__svc" style="margin-top:2.6cqw">THE SITE 00 SETUP FOR YOUR<br>BUSINESS IDENTITY ONLINE</div></div>
      <div><div class="rcard__url">${url}</div><div style="margin-top:2.4cqw">${by}</div></div></div>
      <div class="rcard__qr">${qrPlaceholder(`${partner.id}-${t}`, { label: false })}${voidMark ? '<span class="rcard__void">NOT VALID FOR PRINT</span>' : ''}</div></div>`;
  }
  const head = `<div><div class="rcard__brand">SITE 00</div><div class="rcard__df">DIGITAL<br>FOUNDATION<i></i></div></div>`;
  const foot = `<div class="rcard__svc">${svc}</div>`;
  if (t === 'A') return `<div class="rcard rcard--A rcard--front" style="--cw:${w}px" role="img" aria-label="REFERRAL CARD FRONT · TERRITORY A">${testBand}${img('pav', 'rcard__img')}<div class="rcard__body">${head}${foot}</div></div>`;
  if (t === 'B') return `<div class="rcard rcard--B rcard--front" style="--cw:${w}px" role="img" aria-label="REFERRAL CARD FRONT · TERRITORY B">${testBand}<span class="rcard__rule" style="bottom:9%"></span><div class="rcard__body"><div class="rcard__brand">SITE 00</div><div class="rcard__df">DIGITAL FOUNDATION<i></i></div><div class="rcard__svc" style="padding-bottom:3cqw">${svc}</div></div></div>`;
  return `<div class="rcard rcard--C rcard--front" style="--cw:${w}px" role="img" aria-label="REFERRAL CARD FRONT · TERRITORY C">${testBand}${img('tall', 'rcard__img')}<div class="rcard__body">${head}${foot}</div></div>`;
}
export const TERRITORY = { A: 'ARCHITECTURAL EDITORIAL', B: 'MINIMAL ACCESS CARD', C: 'RED STRUCTURAL SIGNATURE' };

// Metric definitions (doc 07 / 16 carry the full contract)
export const METRICS = {
  partners: ['ACTIVE PARTNERS', 'STATUS = ACTIVE · NOW', 'users'],
  leads: ['REFERRED LEADS', 'ATTRIBUTED ARTIFACTS · ALL TIME', 'document'],
  converted: ['CONVERTED CLIENTS', 'VERIFIED QUALIFYING PAYMENT', 'complete'],
  pending: ['PENDING APPROVAL', 'ELIGIBLE · NOT YET APPROVED', 'time'],
  unpaid: ['APPROVED UNPAID', 'APPROVED + SCHEDULED · NOT PAID', 'payment'],
  paid: ['TOTAL PAID OUT', 'RECORDED COMPLETED PAYOUTS', 'receipt'],
  reversed: ['REVERSED / ADJUSTED', 'REFUND OR CORRECTION · NET', 'refund'],
  rate: ['CONVERSION RATE', 'CONVERTED ÷ REFERRED LEADS', 'analytics'],
  revenue: ['REFERRED REVENUE', 'COLLECTED SERVICE REVENUE · NET', 'price'],
  exceptions: ['OPEN EXCEPTIONS', 'ATTRIBUTION CONFLICTS · UNRESOLVED', 'warning'],
};
export function signals(keys, vals, { cls = 'rf-signals--5', attn = [] } = {}) {
  return `<section class="rf-signals ${cls}" aria-label="REFERRAL SIGNALS">${keys.map((k, i) => { const [l, d, ic] = METRICS[k]; return `<div class="rf-sig ${attn.includes(k) ? 'rf-sig--attn' : ''}">${icon(ic)}<span class="ws-label">${l}</span><span class="ws-num">${vals[i]}</span><span class="ws-meta">${d}</span></div>`; }).join('')}</section>`;
}
