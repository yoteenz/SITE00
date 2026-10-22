// REFERRALS page compositions. One markup per surface; ws.css + rf.css recompose it by width.
// Fictional, illustrative values only (labelled on every page). No commission rate, fee or window is proposed.
import { icon, CHEV, CHECK, mk, st, chip, count, gap, kbd, btn, iconbtn, plate, tabs, segctl, kv, act, field, banner, panel, inspHead, money, byName, P, PARTNERS, REFS, COMMS, PAYOUTS, ACTIVITY, pStatus, cs, CSTATE, partnerThumb, amt, qrPlaceholder, card, TERRITORY, signals, secnav, rfHead, specTag, img } from './rf-kit.js';

const BASE = 50000;

// ─── Generic ledger: columns choose their tier (tablet / desktop); phones get a two-cell composite ───
export function ledger({ label, cols, rows, mobile, sel = -1, anchorSel = '', wide = false }) {
  const t = cols.filter((c) => c.t).map((c) => c.t).join(' ');
  const d = cols.filter((c) => c.d).map((c) => c.d).join(' ');
  const cls = (c) => (c.t ? 'x-t' : 'x-d');
  const head = `<div class="ldg__h" role="row">${cols.map((c) => `<span class="${cls(c)} ${c.n ? 'n' : ''}" role="columnheader">${c.h}</span>`).join('')}</div>`;
  const body = rows
    .map((r, i) => {
      const [ml, mr] = mobile(r);
      return `<div class="ldg__r ${i === sel ? 'ldg__r--sel' : ''}" role="row" ${i === sel ? 'aria-selected="true"' : ''} ${i === sel && anchorSel ? `data-anchor="${anchorSel}"` : ''}><span class="x-m cell" role="cell">${ml}</span><span class="x-m cell" role="cell" style="align-items:flex-end">${mr}</span>${cols.map((c) => `<span class="${cls(c)} cell ${c.n ? 'n' : ''}" role="cell">${c.r(r)}</span>`).join('')}</div>`;
    })
    .join('');
  return `<div class="ldg ${wide ? 'ldg--wide' : ''}" role="table" aria-label="${label}" style="--cols-m:minmax(0,1fr) auto;--cols-t:${t};--cols-d:${d}">${head}${body}</div>`;
}
const pname = (id) => P[id].name;
const twoLine = (a, b) => `<span class="ws-name">${a}</span><span class="ws-meta ws-1l">${b}</span>`;

// ═══ OVERVIEW ═══════════════════════════════════════════════════════════════
export function overview({ st: state = 'default' } = {}) {
  const head = rfHead({ acts: `${btn('CARD STUDIO', { tone: 'out', size: 'sm', ic: 'qr' })}${btn('NEW PARTNER', { size: 'sm', ic: 'add', attrs: 'data-anchor="newpartner"' })}` });
  if (state === 'empty')
    return `<div class="ws-page">${head}${secnav(0, {})}<div class="ws-empty"><span class="ws-label">NO ACTIVE PARTNERS YET</span><h2 class="ws-h2">PREPARE THE FIRST REFERRAL PARTNER<i class="ws-period"></i></h2><p class="ws-meta" style="margin:0;max-width:60ch">ALL IN ONE ENTERPRISES INC IS PLANNED AS THE FIRST PARTNER. A PARTNER CAN REFER ONLY AFTER THE REFERRAL POLICY (FD-R01–R10) AND THEIR TERMS ARE APPROVED AND A DURABLE LINK IS ISSUED.</p><div class="ws-btn-row">${btn('REVIEW REFERRAL POLICY', { tone: 'out' })}${btn('PREPARE AIO RECORD', { arrow: true })}</div></div></div>`;
  if (state === 'error')
    return `<div class="ws-page">${head}${secnav(0, {})}${banner('REFERRAL DATA COULD NOT LOAD · THE LAST GOOD SNAPSHOT IS FROM 10:42 AND IS SHOWN READ-ONLY. NO FINANCIAL ACTION IS AVAILABLE UNTIL IT REFRESHES.', { tone: 'red', ic: 'warning' })}<div style="margin-top:12px">${btn('RETRY', { ic: 'retry' })}</div></div>`;
  const loading = state === 'loading';
  const sig = signals(['partners', 'leads', 'converted', 'pending', 'paid'], loading ? ['—', '—', '—', '—', '—'] : ['2', '8', '3', '$55.00', '$90.00'], { attn: ['pending'] });
  const focus = `<section class="ws-focus rfo__focus" style="box-shadow:inset 3px 0 0 var(--ws-red)"><div class="ws-focus__k">${st('founder', 'NEEDS YOU · 1 COMMISSION AWAITS APPROVAL')}<span class="ws-meta">OCT 12</span></div><p class="ws-statement" style="font-size:22px">VELA BOUTIQUE · MERIDIAN BOOKKEEPING<i class="ws-period"></i></p>${btn('REVIEW COMMISSION', { arrow: true, size: 'sm' })}</section>`;
  const prows = [P.mer, P.har, P.aio, P.kes]
    .map((p, i) => `<div class="prt__r ${i === 0 ? 'prt__r--sel' : ''}" role="row"><span class="prt__who">${partnerThumb(p)}<span class="ws-who"><b>${p.name}</b><span>${p.type}</span><span style="margin-top:2px">${pStatus(p)}</span></span></span><span class="prt__n"><span class="ws-num">${p.refs}</span><span class="ws-label">REFERRALS</span></span><span class="c-chev">${CHEV}</span></div>`)
    .join('');
  const partners = panel('PARTNERS', `<div class="prt" role="table" aria-label="PARTNERS PREVIEW">${prows}</div>`, { flush: true, right: `<a class="ws-link-quiet">VIEW ALL · 5 →</a>`, cls: 'rfo__partners' });
  const money = panel('COMMISSIONS / PAYOUTS', ledger({
    label: 'COMMISSION PREVIEW',
    cols: [
      { h: 'CLIENT', t: 'minmax(140px,1.3fr)', d: 'minmax(140px,1.3fr)', r: (c) => twoLine(c.c.toUpperCase(), pname(c.p).toUpperCase()) },
      { h: 'COMMISSION', t: '96px', d: '96px', n: true, r: (c) => amt(c.amt) },
      { h: 'STATUS', t: 'minmax(132px,auto)', d: 'minmax(132px,auto)', r: (c) => cs(c.s) },
    ],
    rows: COMMS.slice(0, 4),
    mobile: (c) => [twoLine(c.c.toUpperCase(), pname(c.p).toUpperCase()), `${amt(c.amt)}${cs(c.s)}`],
  }), { flush: true, right: `<a class="ws-link-quiet">LEDGER →</a>`, cls: 'rfo__money' });
  const actv = panel('REFERRAL ACTIVITY', ACTIVITY.slice(0, 5).map(([t, e, s, , , k]) => act(t.split(' · ')[0], k === 'red' ? 'founder' : k === 'done' ? 'work' : 'client', e, s)).join(''), { right: `<a class="ws-link-quiet">ALL →</a>`, cls: 'rfo__act' });
  const cards = `<section class="ws-panel rfo__cards"><div class="ws-panel__h"><h2 class="ws-h3">CARD STUDIO</h2><span class="ws-meta">CREATE · SHARE · PRINT (GATED)</span></div><div class="ws-panel__b" style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center">${card({ t: 'A', side: 'back', partner: P.mer, w: 230 })}<div class="ws-btn-row" style="flex-direction:column;align-items:stretch">${btn('OPEN STUDIO', { size: 'sm', ic: 'qr' })}${btn('COPY LINK', { tone: 'out', size: 'sm', ic: 'link' })}${btn('PAYOUTS', { tone: 'out', size: 'sm', ic: 'payment' })}</div></div></section>`;
  return `<div class="ws-page">${head}${secnav(0)}<div class="rfo"><div class="rfo__sig">${sig}</div>${focus}${partners}${money}${actv}${cards}</div></div>`;
}

// ═══ PARTNERS REGISTRY ══════════════════════════════════════════════════════
export function partners({ sel = -1, st: state = 'default' } = {}) {
  const rows = state === 'filtered' ? [P.mer, P.har] : PARTNERS;
  const toolbar = `<div class="reg-toolbar"><span class="ws-search" role="search">${icon('search')}<span>PARTNER NAME OR EMAIL</span>${kbd('/')}</span>${tabs([['ALL', '5'], ['ACTIVE', '2'], ['PLANNED', '1'], ['INVITED', '1'], ['SUSPENDED', '1'], 'ARCHIVED'], state === 'filtered' ? 1 : 0, { label: 'PARTNER STATUS' })}<span class="reg-toolbar__tools"><span data-anchor="filter">${btn('TYPE', { tone: 'out', size: 'sm', ic: 'filter' }).replace('<span>TYPE</span>', '<span class="lbl">TYPE · ALL</span>')}</span></span></div>`;
  const head = `<div class="prt__h" role="row"><span>PARTNER</span><span class="c-type">TYPE · STATUS</span><span class="c-ref" style="justify-content:flex-end">REFERRALS</span><span class="c-conv" style="justify-content:flex-end">CONVERTED</span><span class="c-owed" style="justify-content:flex-end">OWED</span><span class="c-card">CARD</span><span></span></div>`;
  const row = (p, i) => `<div class="prt__r ${i === sel ? 'prt__r--sel' : ''}" role="row" ${i === sel ? 'aria-selected="true"' : ''}>
    <span class="prt__who" role="cell">${partnerThumb(p)}<span class="ws-who"><b>${p.name}</b><span class="c-mref">${p.type}</span><span class="c-mref" style="margin-top:2px">${pStatus(p)}</span><span class="ws-data ws-meta ws-1l" style="text-transform:none">${p.email}</span></span></span>
    <span class="c-type" role="cell"><span class="ws-meta">${p.type}</span><span style="display:block;margin-top:6px">${pStatus(p)}</span></span>
    <span class="prt__n c-mref" role="cell"><span class="ws-num">${p.refs}</span><span class="ws-label">REFERRALS</span></span>
    <span class="c-ref ws-body" role="cell">${p.refs}</span><span class="c-conv ws-body" role="cell">${p.conv}</span><span class="c-owed" role="cell">${amt(p.owed || null)}</span>
    <span class="c-card ws-meta" role="cell" style="color:var(--ws-ink-2)">${p.card}</span><span class="c-chev" role="cell" ${i === sel ? 'data-anchor="rowmenu"' : ''}>${CHEV}</span></div>`;
  const list = state === 'empty' ? `<div class="ws-panel" style="padding:28px 20px;display:grid;gap:12px;justify-items:start"><span class="ws-h3">NO PARTNERS YET</span><p class="ws-meta" style="margin:0;line-height:1.6">ADD THE FIRST PARTNER AS A DRAFT. A DRAFT HAS NO LINK, NO CARD AND NO TERMS UNTIL THE FOUNDER APPROVES THEM.</p>${btn('NEW PARTNER', { size: 'sm', ic: 'add' })}</div>` : state === 'loading' ? `<div class="ws-panel" style="padding:20px">${'<span class="ws-skel" style="width:70%;margin:12px 0"></span>'.repeat(5)}</div>` : `<div class="prt" role="table" aria-label="PARTNERS">${head}${rows.map(row).join('')}</div>`;
  return `<div class="ws-page">${rfHead({ title: 'PARTNERS', sub: '5 RECORDS · 2 ACTIVE · 1 PLANNED (AIO)', acts: btn('NEW PARTNER', { size: 'sm', ic: 'add', attrs: 'data-anchor="newpartner"' }) })}${secnav(1)}${toolbar}${list}
    <div class="reg-foot"><span class="ws-meta">PARTNER TYPES ARE PROPOSED, NOT FINAL ENUMS · OWED = APPROVED + SCHEDULED, UNPAID</span><span class="ws-meta">${kbd('J')} ${kbd('K')} ${kbd('↵')}</span></div></div>`;
}

export function partnerInspector(p = P.mer) {
  const planned = p.status === 'planned';
  return `${inspHead('PARTNER', `<div style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:14px;align-items:center">${img(p.img, 'rf-thumb', 'width:84px;height:64px')}<span class="ws-who"><b style="font-size:16px;white-space:normal">${p.name}</b><span>${p.type}</span><span style="margin-top:4px">${pStatus(p)}</span></span></div>`)}
  <div class="ws-insp__body">
    <div class="msum" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div><span class="ws-label">REFERRALS</span><span class="ws-num" style="font-size:28px">${p.refs}</span></div><div><span class="ws-label">CONVERTED</span><span class="ws-num" style="font-size:28px">${p.conv}</span></div><div><span class="ws-label">OWED</span>${amt(p.owed || null)}</div><div><span class="ws-label">PAID</span>${amt(p.id === 'har' ? 9000 : p.id === 'mer' ? 0 : null)}</div></div>
    ${kv([['REFERRAL LINK', p.link === 'ACTIVE' ? 'site00.com/invite/•••••• · ACTIVE' : p.link, p.link === 'ACTIVE'], ['CARD', p.card], ['TERMS', p.terms], ['OWNER', p.owner], ['SINCE', p.since]])}
    ${planned ? banner('PLANNED PARTNER · NO RECORD EXISTS YET. NOTHING HERE IS A REFERRAL AGREEMENT. ACTIVATION NEEDS FD-R01–R10, SIGNED TERMS AND A VERIFIED LINK.', { tone: 'policy', ic: 'lock' }) : `<div><span class="ws-label">RECENT</span><div style="margin-top:6px">${ACTIVITY.filter((a) => a[3] === p.id).slice(0, 3).map(([t, e, s]) => act(t.split(' · ')[0], 'client', e, s)).join('') || '<span class="ws-meta">NO EVENTS</span>'}</div></div>`}
  </div>
  <div class="ws-insp__foot">${btn('OPEN PARTNER', { block: true, arrow: true })}${btn('COPY LINK', { tone: 'out', only: true, ic: 'link' })}<span data-anchor="rowmenu">${btn('MORE', { tone: 'out', only: true, ic: 'more' })}</span></div>`;
}

// ═══ PARTNER DETAIL ═════════════════════════════════════════════════════════
export const PSECTIONS = ['OVERVIEW', 'REFERRALS', 'COMMISSIONS', 'PAYOUTS', 'CARDS', 'TERMS', 'ACTIVITY'];
export function partner({ p = P.mer, sec = 0 } = {}) {
  const planned = p.status === 'planned';
  const head = `<header class="pd-head">${img(p.img, '')}<div class="pd-head__name"><h1 class="ws-title">${p.name.toUpperCase()}<i aria-hidden="true"></i></h1><div class="pd-head__meta">${pStatus(p)}<span class="ws-meta">${p.type}</span><span class="ws-meta">OWNER · ${p.owner}</span><span class="ws-data ws-meta" style="color:var(--ws-ink-2)">${p.email}</span>${specTag()}</div></div>
    <div class="pd-head__acts">${planned ? `${btn('PREPARE RECORD', { size: 'sm', arrow: true })}${btn('INVITE', { tone: 'out', size: 'sm', ic: 'send' })}` : `${btn('SHARE CARD', { size: 'sm', ic: 'share', attrs: 'data-anchor="share"' })}${btn('COPY LINK', { tone: 'out', size: 'sm', ic: 'link' })}${btn('MESSAGE', { tone: 'out', size: 'sm', ic: 'message' })}`}<span data-anchor="rowmenu">${btn('MORE', { tone: 'out', size: 'sm', ic: 'more' })}</span></div></header>`;
  const body = [pOverview, pReferrals, pCommissions, pPayouts, pCards, pTerms, pActivity][sec](p);
  return `<div class="ws-page">${head}${tabs(PSECTIONS, sec, { label: 'PARTNER SECTIONS' })}<div style="margin-top:var(--ws-gap)">${body}</div></div>`;
}

function linkBlock(p) {
  const ok = p.link === 'ACTIVE';
  return panel('REFERRAL LINK + QR', `<div class="qsw"><div class="qrsplit"><div style="display:grid;gap:10px;min-width:0"><div class="ws-link"><code class="ws-data">${ok ? 'site00.com/invite/••••••' : 'NOT ISSUED'}</code>${ok ? btn('COPY', { tone: 'ghost', size: 'xs', ic: 'link' }) : ''}</div>${kv([['ROUTE', 'EXISTING /invite/:code ENTRY'], ['TARGET', 'DIGITAL FOUNDATION ACTIVATION'], ['STATUS', ok ? 'ACTIVE · VERIFIED ON STAGING' : p.link], ['SCAN CHECK', 'NOT YET DONE ON A DEVICE']])}</div><div class="qrsplit__qr">${qrPlaceholder(p.id)}</div></div></div>`, { right: chip(ok ? 'unver' : 'muted', ok ? 'PRODUCTION URL UNVERIFIED' : 'NO LINK') });
}

function pOverview(p) {
  if (p.status === 'planned') {
    const steps = [
      ['REFERRAL POLICY APPROVED', 'FD-R01 … FD-R10', 'wait'],
      ['PARTNER AGREEMENT IN PLACE', 'OUTSIDE THE PRODUCT · FOUNDER', 'wait'],
      ['PARTNER RECORD CREATED', 'REQUIRES PHASE 1 DATA MODEL', 'wait'],
      ['TERMS VERSION 1 SET', 'FD-R01 · R02 · R03', 'wait'],
      ['DURABLE REFERRAL LINK ISSUED', 'PHASE 2', 'wait'],
      ['QR VERIFIED ON A REAL PHONE', 'PHASE 9', 'wait'],
      ['CARD TEMPLATE APPROVED', 'FD-R13', 'wait'],
    ];
    return `<div class="pd"><div>${banner('ALL IN ONE ENTERPRISES INC IS THE FIRST PLANNED PARTNER. THIS PAGE IS A DESIGN SPECIMEN — NO PARTNER RECORD, AGREEMENT, LINK OR PAYMENT EXISTS.', { tone: 'policy', ic: 'lock' })}${banner('CONFLICT · THE IN-MEMORY INVITATION 001 FIXTURE (aioInvitation001.ts) MARKS AIO ACTIVE WITH agreement_version NULL. AUTHORITY: TREAT AS DRAFT UNTIL AN AGREEMENT IS RECORDED.', { tone: 'red', ic: 'warning' })}${panel('BEFORE AIO CAN REFER CLIENTS', `<div class="ck">${steps.map(([t, s, k]) => `<div class="ck__i"><span class="ck__b ck__b--${k}"></span><span>${'<span class="ws-name" style="display:block">' + t + '</span><span class="ws-meta">' + s + '</span>'}</span>${chip('muted', 'OPEN')}</div>`).join('')}</div>`, { flush: true })}</div>
      <div>${panel('WHY AIO', `<p class="ws-meta" style="margin:0;line-height:1.6;color:var(--ws-ink-2)">AIO SERVES TRUCKING BUSINESSES (PERMITS, AUTHORITIES, DISPATCH, BOOKKEEPING, COMPLIANCE). ITS CLIENTS OFTEN NEED A DOMAIN, PROFESSIONAL EMAIL AND EMAIL SECURITY — THE DIGITAL FOUNDATION SCOPE.</p>`)}${panel('CARD PREVIEW · DESIGN ONLY', `<div style="display:grid;place-items:center;padding:8px 0">${card({ t: 'A', side: 'back', partner: p, w: 300 })}</div>`)}</div></div>`;
  }
  const mine = COMMS.filter((c) => c.p === p.id);
  const sum = (s) => mine.filter((c) => s.includes(c.s)).reduce((a, c) => a + (c.amt || 0), 0);
  return `<div class="pd"><div>
      <div class="msum"><div><span class="ws-label">ATTRIBUTED REFERRALS</span><span class="ws-num" style="font-size:30px">${p.refs}</span></div><div><span class="ws-label">QUALIFYING CONVERSIONS</span><span class="ws-num" style="font-size:30px">${p.conv}</span></div><div><span class="ws-label">PENDING · APPROVED</span>${amt(sum(['pending']))} · ${amt(sum(['approved', 'scheduled']))}</div><div><span class="ws-label">PAID</span>${amt(sum(['paid']) || null)}</div></div>
      ${panel('REFERRED CLIENTS', pReferralsTable(p), { flush: true, right: '<a class="ws-link-quiet">ALL →</a>' })}
    </div><div>${linkBlock(p)}${panel('CARD · ' + p.card, `<div style="display:grid;place-items:center">${card({ t: 'A', side: 'back', partner: p, w: 300 })}</div>`, { right: '<a class="ws-link-quiet">STUDIO →</a>' })}</div></div>`;
}

function pReferralsTable(p) {
  return ledger({
    label: 'REFERRED CLIENTS',
    cols: [
      { h: 'CLIENT', t: 'minmax(150px,1.2fr)', d: 'minmax(150px,1.2fr)', r: (r) => twoLine(r.c.toUpperCase(), `${r.id} · ${r.at}`) },
      { h: 'INTAKE', t: null, d: '110px', r: (r) => `<span class="ws-body">${r.intake}</span>` },
      { h: 'CONVERSION', t: 'minmax(120px,1fr)', d: 'minmax(120px,1fr)', r: (r) => `<span class="ws-body ws-2l">${r.conv}</span>` },
      { h: 'COMMISSION', t: 'minmax(130px,auto)', d: 'minmax(130px,auto)', r: (r) => cs(r.comm) },
      { h: 'NEXT', t: null, d: 'minmax(120px,0.9fr)', r: (r) => `<span class="ws-meta">${r.next}</span>` },
    ],
    rows: REFS.filter((r) => r.p === p.id),
    mobile: (r) => [twoLine(r.c.toUpperCase(), r.conv), cs(r.comm)],
  });
}
const pReferrals = (p) => panel('REFERRALS · ATTRIBUTED TO ' + p.name.toUpperCase(), pReferralsTable(p), { flush: true });
const pCommissions = (p) => panel('COMMISSIONS', commissionLedger(COMMS.filter((c) => c.p === p.id)), { flush: true });
const pPayouts = (p) => panel('PAYOUTS', payoutLedger(PAYOUTS.filter((x) => x.p === p.id)), { flush: true });
function pCards(p) {
  return `<div class="pd"><div>${panel('CARD VERSIONS', ledger({
    label: 'CARD VERSIONS',
    cols: [
      { h: 'VERSION', t: '90px', d: '90px', r: (v) => `<span class="ws-name">${v[0]}</span>` },
      { h: 'TEMPLATE', t: 'minmax(140px,1fr)', d: 'minmax(140px,1fr)', r: (v) => `<span class="ws-body">${v[1]}</span>` },
      { h: 'QR TARGET', t: null, d: 'minmax(140px,1fr)', r: (v) => `<span class="ws-meta">${v[2]}</span>` },
      { h: 'STATUS', t: 'minmax(120px,auto)', d: 'minmax(120px,auto)', r: (v) => chip(v[3], v[4]) },
    ],
    rows: [['V2', 'A · ARCHITECTURAL EDITORIAL', 'LINK L-02 · ACTIVE', 'ok', 'APPROVED'], ['V1', 'A · ARCHITECTURAL EDITORIAL', 'LINK L-01 · REVOKED', 'muted', 'ARCHIVED']],
    mobile: (v) => [twoLine(v[0], v[1]), chip(v[3], v[4])],
  }), { flush: true })}${panel('EXISTING ASSETS', kv([['SHARED OFFICE CARD', 'INVITATION 001 · AIO FRONT OFFICE (FIXTURE)'], ['BATCH', 'AIO-OFFICE-BATCH-001 · print_status'], ['QR RENDERER', 'renderInvitationQrSvg · EC LEVEL H']]))}${panel('PRINT STATUS', `<div class="ck">${[['PROOF APPROVED', 'ok'], ['QR SCANNED ON DEVICE', 'wait'], ['PRODUCTION URL VERIFIED', 'wait'], ['BATCH ORDERED', 'wait']].map(([t, k]) => `<div class="ck__i"><span class="ck__b ck__b--${k}">${k === 'ok' ? CHECK : ''}</span><span class="ws-name">${t}</span>${chip(k === 'ok' ? 'ok' : 'unver', k === 'ok' ? 'DONE' : 'OPEN')}</div>`).join('')}</div>`, { flush: true })}</div>
    <div>${panel('CURRENT · V2', `<div style="display:grid;gap:12px;justify-items:center">${card({ t: 'A', side: 'front', partner: p, w: 320 })}${card({ t: 'A', side: 'back', partner: p, w: 320 })}<div class="ws-btn-row">${btn('SHARE', { size: 'sm', ic: 'share' })}${btn('DIGITAL PNG', { tone: 'out', size: 'sm', ic: 'download' })}<button class="ws-btn ws-btn--off ws-btn--sm" disabled>${icon('lock')}<span>PRINT PACKAGE</span></button></div></div>`)}</div></div>`;
}
function pTerms(p) {
  return `<div class="pd"><div>${banner('TERMS SHOWN ARE AN EXAMPLE STRUCTURE (E-1). NO RATE, FEE, BASIS OR WINDOW IS PROPOSED — THEY ARE FOUNDER DECISIONS FD-R01 … FD-R10.', { tone: 'policy', ic: 'lock' })}
    ${panel('TERMS · VERSION 2 · EFFECTIVE OCT 01', kv([['COMPENSATION', 'TYPE · FD-R01 (PERCENT / FIXED / PARTNER-SPECIFIC)'], ['RATE OR AMOUNT', 'FD-R03 · NOT SET'], ['BASIS', 'FD-R02 · e.g. COLLECTED SITE 00 SERVICE REVENUE'], ['TRIGGER', 'FD-R04 · e.g. VERIFIED PAYMENT'], ['ATTRIBUTION WINDOW', 'FD-R07 · NOT SET'], ['TOUCH MODEL', 'FD-R08 · NOT SET'], ['REFUND RULE', 'FD-R06 · NOT SET'], ['PAYOUT TIMING', 'FD-R05 · NOT SET']]), { right: btn('EDIT TERMS', { tone: 'out', size: 'xs', ic: 'edit', attrs: 'data-anchor="terms"' }) })}</div>
    <div>${panel('HISTORY', `${act('OCT 01', 'work', 'V2 EFFECTIVE', 'APPLIES TO REFERRALS ATTRIBUTED FROM OCT 01')}${act('AUG 14', 'done', 'V1 SUPERSEDED', 'EARLIER REFERRALS KEEP V1')}`)}${panel('NEVER ON THE CARD', '<p class="ws-meta" style="margin:0;line-height:1.6">COMMISSION TERMS ARE PRIVATE BETWEEN SITE 00 AND THE PARTNER. THEY NEVER APPEAR ON CARDS, PUBLIC LINKS OR THE PROSPECT ENTRY.</p>')}</div></div>`;
}
const pActivity = (p) => panel('ACTIVITY · ' + p.name.toUpperCase(), timeline(ACTIVITY.filter((a) => a[3] === p.id)));

// ═══ ATTRIBUTION ════════════════════════════════════════════════════════════
export function attribution({ sel = 1 } = {}) {
  return `<div class="ws-page">${rfHead({ title: 'ATTRIBUTION', sub: 'WHO REFERRED WHOM · BY WHICH CARD OR LINK · WITH WHAT RESULT' })}${secnav(2)}
    ${banner('EVERY ROW LINKS TO THE CANONICAL CLIENT RECORD IN FOUNDATIONS. ATTRIBUTION ADDS SOURCE METADATA; IT NEVER COPIES INTAKE, QUOTES OR PAYMENTS.', { ic: 'info' })}
    <div style="margin-top:var(--ws-gap)">${signals(['leads', 'converted', 'rate', 'revenue', 'exceptions'], ['8', '3', '38%', '$2,180.00', '1'], { attn: ['exceptions'] })}</div>
    <div style="margin-top:var(--ws-gap)">${tabs([['ALL', '8'], ['TRACKED', '3'], ['CONVERTED', '3'], ['EXCEPTIONS', '1']], 0, { label: 'ATTRIBUTION VIEWS' })}</div>
    ${ledger({
      label: 'ATTRIBUTION LEDGER', sel, anchorSel: 'rowmenu',
      cols: [
        { h: 'REFERRAL', t: '84px', d: '84px', r: (r) => `<span class="ws-name">${r.id}</span>` },
        { h: 'CLIENT', t: 'minmax(140px,1.2fr)', d: 'minmax(150px,1.2fr)', r: (r) => twoLine(r.c.toUpperCase(), r.at) },
        { h: 'PARTNER', t: 'minmax(130px,1fr)', d: 'minmax(150px,1fr)', r: (r) => `<span class="ws-body">${pname(r.p).toUpperCase()}</span>` },
        { h: 'VIA', t: null, d: 'minmax(110px,0.8fr)', r: (r) => `<span class="ws-meta">${r.via}</span>` },
        { h: 'INTAKE', t: null, d: '110px', r: (r) => `<span class="ws-body">${r.intake}</span>` },
        { h: 'CONVERSION', t: null, d: 'minmax(120px,1fr)', r: (r) => `<span class="ws-body ws-2l">${r.conv}</span>` },
        { h: 'COMMISSION', t: 'minmax(130px,auto)', d: 'minmax(130px,auto)', r: (r) => cs(r.comm) },
      ],
      rows: REFS,
      mobile: (r) => [twoLine(r.c.toUpperCase(), `${pname(r.p).toUpperCase()} · ${r.via}`), cs(r.comm)],
    })}</div>`;
}

export function timeline(items) {
  return `<ol class="tl">${items.map(([t, e, s, , actor, k]) => `<li class="tl__i tl__i--${k || 'x'}"><time>${t}</time><span class="dot"><i></i></span><span class="tl__b"><b>${e}</b><span>${s}</span><span class="ev">${chip('muted', actor)}</span></span></li>`).join('')}</ol>`;
}

export function trace() {
  const tag = (k) => chip(k === 'OBSERVED' ? 'ok' : k === 'ATTRIBUTED' ? 'test' : k === 'ESTIMATED' ? 'warn' : 'unver', k);
  const steps = [
    ['SEP 14', 'CARD V2 HANDED OUT', 'MERIDIAN BOOKKEEPING · OFFLINE', 'UNAVAILABLE', 'gap'],
    ['SEP 18 · 19:04', 'QR SCANNED · LINK L-02 RESOLVED', 'TOKEN VALID · PARTNER ACTIVE · REDIRECT TO ENTRY', 'OBSERVED', 'done'],
    ['SEP 18 · 19:06', 'DIGITAL FOUNDATION ENTRY OPENED', 'REFERRAL CONTEXT HELD SERVER-SIDE · NOT IN THE URL', 'OBSERVED', 'done'],
    ['SEP 18 · 19:21', 'ARTIFACT CREATED · ATTRIBUTION PERSISTED', 'ONE ATTRIBUTION PER ARTIFACT · IDEMPOTENT', 'ATTRIBUTED', 'done'],
    ['SEP 25', 'INTAKE COMPLETED', 'CLIENT · PERMANENT LINK (SAME ARTIFACT)', 'OBSERVED', 'done'],
    ['OCT 02', 'PAYMENT VERIFIED', 'STRIPE CHECKOUT · WEBHOOK', 'OBSERVED', 'done'],
    ['OCT 02', 'COMMISSION ELIGIBLE · C-0009', 'TERMS E-1 APPLIED · CALCULATION LOCKED', 'ATTRIBUTED', 'red'],
    ['OCT 08', 'COMMISSION APPROVED', 'FOUNDER', 'OBSERVED', 'done'],
    ['OCT 24', 'PAYOUT PO-0005 · PLANNED', 'NOT PAID UNTIL RECORDED', 'ESTIMATED', 'gap'],
  ];
  return `<div class="ws-page">${rfHead({ title: 'SOURCE TRACE', sub: 'R-0015 · FIELD & EMBER · MERIDIAN BOOKKEEPING' })}${secnav(2)}
    <div class="pd"><div>${panel('FROM CARD TO PAYOUT', `<ol class="tl">${steps.map(([t, e, s, k, d]) => `<li class="tl__i tl__i--${d}"><time>${t}</time><span class="dot"><i></i></span><span class="tl__b"><b>${e}</b><span>${s}</span><span class="ev">${tag(k)}</span></span></li>`).join('')}</ol>`)}</div>
    <div>${panel('EVIDENCE CLASSES', kv([['OBSERVED', 'RECORDED BY THE SYSTEM AT THE TIME'], ['ATTRIBUTED', 'DERIVED BY POLICY FROM OBSERVED EVENTS'], ['ESTIMATED', 'PLANNED / EXPECTED · NOT A FACT'], ['UNAVAILABLE', 'CANNOT BE MEASURED (OFFLINE, CROSS-DEVICE)']]))}${panel('LINKED RECORDS', kv([['CLIENT', 'FIELD & EMBER → FOUNDATIONS'], ['ARTIFACT', 'df_art_••••', true], ['LINK', 'L-02 · CARD V2'], ['COMMISSION', 'C-0009'], ['PAYOUT', 'PO-0005']]))}</div></div></div>`;
}

// ═══ COMMISSIONS ════════════════════════════════════════════════════════════
export function commissionLedger(rows, sel = -1) {
  return ledger({
    label: 'COMMISSION LEDGER', sel, anchorSel: 'rowmenu', wide: true,
    cols: [
      { h: 'PARTNER', t: null, d: 'minmax(140px,1fr)', r: (c) => `<span class="ws-body">${pname(c.p).toUpperCase()}</span>` },
      { h: 'CLIENT', t: 'minmax(150px,1.3fr)', d: 'minmax(140px,1fr)', r: (c) => twoLine(c.c.toUpperCase(), `${c.id} · ${pname(c.p).toUpperCase()}`) },
      { h: 'QUALIFYING EVENT', t: null, d: 'minmax(150px,1.1fr)', r: (c) => `<span class="ws-meta ws-2l" style="color:var(--ws-ink-2)">${c.ev}</span>` },
      { h: 'BASIS', t: null, d: '96px', n: true, r: (c) => amt(c.basis, { muted: true }) },
      { h: 'TERM', t: null, d: 'minmax(120px,0.8fr)', r: (c) => `<span class="ws-meta">${c.term}</span>` },
      { h: 'COMMISSION', t: '100px', d: '100px', n: true, r: (c) => amt(c.amt) },
      { h: 'STATUS', t: 'minmax(140px,auto)', d: 'minmax(140px,auto)', r: (c) => cs(c.s) },
      { h: 'DATE', t: '70px', d: '70px', r: (c) => `<span class="ws-meta">${c.d}</span>` },
    ],
    rows,
    mobile: (c) => [twoLine(c.c.toUpperCase(), `${pname(c.p).toUpperCase()} · ${c.d}`), `${amt(c.amt)}${cs(c.s)}`],
  });
}
export function commissions({ sel = 2 } = {}) {
  return `<div class="ws-page">${rfHead({ title: 'COMMISSIONS', sub: 'ELIGIBILITY · APPROVAL · ADJUSTMENTS · NEVER EQUAL TO PAID' })}${secnav(3)}
    ${signals(['pending', 'unpaid', 'paid', 'reversed'], ['$55.00', '$60.00', '$90.00', '−$50.00'], { cls: 'rf-signals--4', attn: ['pending'] })}
    <div style="margin:var(--ws-gap) 0 12px">${tabs([['ALL', '7'], ['PENDING APPROVAL', '1'], ['APPROVED', '1'], ['NOT YET ELIGIBLE', '2'], ['PAID', '1'], ['REVERSED', '1'], ['DISPUTED', '1']], 0, { label: 'COMMISSION STATES' })}</div>
    ${commissionLedger(COMMS, sel)}
    <div class="reg-foot"><span class="ws-meta">AMOUNTS IN INTEGER MINOR UNITS (USD CENTS) · BASIS = FD-R02 · TERMS ARE EXAMPLES, NOT PROPOSALS</span><span class="ws-meta">SORT · DATE ↓</span></div></div>`;
}

export function commissionInspector(c = COMMS[2]) {
  return `${inspHead('COMMISSION · ' + c.id, `<h2 class="ws-h2">${amt(c.amt).replace('class="amt', 'style="font-family:var(--ws-display);font-size:34px" class="amt')}<i class="ws-period"></i></h2><div class="ws-btn-row" style="margin-top:10px">${cs(c.s)}<span class="ws-meta">${c.c.toUpperCase()} · ${pname(c.p).toUpperCase()}</span></div>`)}
  <div class="ws-insp__body">
    <div><span class="ws-label">CALCULATION · LOCKED AT ELIGIBILITY</span><div class="calc" style="margin-top:8px">
      <div class="calc__r"><span>COLLECTED PAYMENT<span class="ws-meta">STRIPE · SEP 29</span></span>${amt(118000)}</div>
      <div class="calc__r"><span>LESS PASS-THROUGH FEES<span class="ws-meta">FD-R02 · DOMAIN REGISTRATION</span></span>${amt(-14000)}</div>
      <div class="calc__r"><span>PARTIAL REFUND<span class="ws-meta">OCT 05 · BASIS ADJUSTED</span></span>${amt(-14000)}</div>
      <div class="calc__r"><span>BASIS</span>${amt(90000)}</div>
      <div class="calc__r"><span>TERM E-1 · EXAMPLE<span class="ws-meta">NOT A PROPOSED RATE</span></span><span class="ws-meta">EXAMPLE</span></div>
      <div class="calc__r calc__r--tot"><span>COMMISSION</span>${amt(c.amt)}</div></div></div>
    <div><span class="ws-label">HISTORY</span><div style="margin-top:6px">${act('OCT 12', 'founder', 'ELIGIBLE', 'PAYMENT VERIFIED + BASIS ADJUSTED')}${act('OCT 05', 'blocked', 'BASIS ADJUSTED', 'PARTIAL REFUND −$140.00')}${act('SEP 29', 'work', 'NOT YET ELIGIBLE → TRACKED', 'PAYMENT RECEIVED')}</div></div>
    ${kv([['QUALIFYING EVENT', c.ev], ['TERMS', c.term], ['CLIENT RECORD', c.c.toUpperCase() + ' → FOUNDATIONS'], ['IDEMPOTENCY', 'ONE ENTRY PER QUALIFYING PAYMENT', ]])}
  </div>
  <div class="ws-insp__foot">${btn('APPROVE', { block: true, attrs: 'data-anchor="approve"' })}${btn('ADJUST', { tone: 'out', ic: 'edit' })}</div>`;
}

// ═══ PAYOUTS ════════════════════════════════════════════════════════════════
export function payoutLedger(rows, sel = -1) {
  return ledger({
    label: 'PAYOUT QUEUE', sel,
    cols: [
      { h: 'PAYOUT', t: '84px', d: '84px', r: (x) => `<span class="ws-name">${x.id}</span>` },
      { h: 'PARTNER', t: 'minmax(150px,1.2fr)', d: 'minmax(150px,1.2fr)', r: (x) => twoLine(pname(x.p).toUpperCase(), `${x.lines.length} COMMISSION · ${x.lines.join(', ')}`) },
      { h: 'METHOD', t: null, d: 'minmax(160px,1fr)', r: (x) => `<span class="ws-meta" style="color:var(--ws-ink-2)">${x.method}</span>` },
      { h: 'REFERENCE', t: null, d: '120px', r: (x) => `<span class="ws-meta ws-data" style="text-transform:none">${x.ref}</span>` },
      { h: 'AMOUNT', t: '100px', d: '100px', n: true, r: (x) => amt(x.amt) },
      { h: 'STATUS', t: 'minmax(120px,auto)', d: 'minmax(120px,auto)', r: (x) => cs(x.s) },
      { h: 'DATE', t: null, d: '120px', r: (x) => `<span class="ws-meta">${x.d}</span>` },
    ],
    rows,
    mobile: (x) => [twoLine(pname(x.p).toUpperCase(), `${x.id} · ${x.d}`), `${amt(x.amt)}${cs(x.s)}`],
  });
}
export function payouts({ sel = 1 } = {}) {
  return `<div class="ws-page">${rfHead({ title: 'PAYOUTS', sub: 'RECORDED PAYMENTS TO PARTNERS · APPROVE ≠ PAID' })}${secnav(4)}
    ${banner('SITE 00 HAS NO CONNECTED PAYOUT PROVIDER. PAYOUTS ARE PAID OUTSIDE THE PRODUCT AND RECORDED HERE WITH A REFERENCE. "SEND PAYMENT" IS NOT AVAILABLE (FD-R16).', { tone: 'policy', ic: 'lock' })}
    <div style="margin-top:var(--ws-gap)">${signals(['unpaid', 'paid', 'reversed', 'pending'], ['$60.00', '$90.00', '−$50.00', '$55.00'], { cls: 'rf-signals--4' })}</div>
    <div style="margin:var(--ws-gap) 0 12px">${tabs([['ALL', '4'], ['SCHEDULED', '1'], ['PAID', '2'], ['FAILED', '1'], 'REVERSED'], 0, { label: 'PAYOUT STATES' })}</div>
    ${payoutLedger(PAYOUTS, sel)}</div>`;
}
export function payoutInspector(x = PAYOUTS[1]) {
  return `${inspHead('PAYOUT · ' + x.id, `<h2 class="ws-h2" style="display:flex;gap:10px;align-items:baseline">${amt(x.amt).replace('class="amt', 'style="font-family:var(--ws-display);font-size:34px" class="amt')}</h2><div class="ws-btn-row" style="margin-top:10px">${cs(x.s)}<span class="ws-meta">${pname(x.p).toUpperCase()}</span></div>`)}
  <div class="ws-insp__body">
    <div><span class="ws-label">LINE ITEMS</span><div class="calc" style="margin-top:8px"><div class="calc__r"><span>C-0009 · FIELD & EMBER<span class="ws-meta">APPROVED OCT 08</span></span>${amt(6000)}</div><div class="calc__r calc__r--tot"><span>TOTAL</span>${amt(x.amt)}</div></div></div>
    ${kv([['METHOD', 'BANK TRANSFER · OUTSIDE SITE 00'], ['PAYEE DETAILS', 'ON FILE · LAST 4 ONLY · ••21'], ['PLANNED', 'OCT 24'], ['RECONCILIATION', 'NOT YET MATCHED']])}
    <div class="ck">${[['APPROVED', 'ok'], ['PAID OUTSIDE SITE 00', 'wait'], ['PAYMENT RECORDED WITH REFERENCE', 'wait'], ['RECONCILED TO STATEMENT', 'wait']].map(([t, k]) => `<div class="ck__i"><span class="ck__b ck__b--${k}">${k === 'ok' ? CHECK : ''}</span><span class="ws-name">${t}</span>${chip(k === 'ok' ? 'ok' : 'unver', k === 'ok' ? 'DONE' : 'OPEN')}</div>`).join('')}</div>
  </div>
  <div class="ws-insp__foot">${btn('RECORD PAYMENT', { block: true, attrs: 'data-anchor="record"' })}<button class="ws-btn ws-btn--off" disabled title="NO PAYOUT PROVIDER (FD-R16)">${icon('lock')}<span>SEND</span></button></div>`;
}

// ═══ CARD STUDIO ════════════════════════════════════════════════════════════
export function cards({ p = P.mer, t = 'A', side = 'back' } = {}) {
  const ok = p.link === 'ACTIVE';
  const gate = [
    ['PARTNER EXISTS + ACTIVE', p.status === 'active'],
    ['REFERRAL LINK VALID', ok],
    ['QR DESTINATION VERIFIED (PRODUCTION)', false],
    ['TEMPLATE APPROVED (FD-R13)', false],
    ['CARD COPY APPROVED', false],
    ['PRINT SPEC CONFIRMED (FD-R14)', false],
    ['SCAN TESTED ON A REAL PHONE', false],
  ];
  const picker = `<section class="ws-panel cs-pick"><div class="ws-panel__h"><h2 class="ws-h3">PARTNER</h2></div><div>${PARTNERS.map((x) => `<div class="q-item ${x.id === p.id ? 'q-item--sel' : ''}" style="grid-template-columns:auto minmax(0,1fr)">${partnerThumb(x, 'sm')}<span class="ws-who"><b>${x.name}</b><span>${x.card}</span></span></div>`).join('')}</div></section>`;
  return `<div class="ws-page">${rfHead({ title: 'CARD STUDIO', sub: 'PARTNER REFERRAL CARDS · CONNECTED TO ATTRIBUTION, NOT DECORATIVE', imgKey: 'door' })}${secnav(5)}
    <div class="cs-wb">${picker}
      <div style="display:flex;flex-direction:column;gap:var(--ws-gap);min-width:0">
        <div class="ws-btn-row" style="justify-content:space-between"><span class="ws-btn-row"><span class="ws-label">PARTNER</span><span class="ws-name">${p.name.toUpperCase()}</span></span>${segctl(['FRONT', 'BACK'], side === 'front' ? 0 : 1)}</div>
        <div class="cs-stage">${card({ t, side, partner: p, w: 520 })}<span class="ws-meta">3.5 × 2 IN · ${TERRITORY[t]} · QR IS A NON-SCANNABLE PLACEHOLDER</span></div>
        <div class="tpl" role="radiogroup" aria-label="TEMPLATE">${['A', 'B', 'C'].map((k) => `<div class="tpl__i ${k === t ? 'tpl__i--on' : ''}" role="radio" aria-checked="${k === t}">${card({ t: k, side: 'front', partner: p, w: 200 })}<span class="ws-label" style="color:var(--ws-ink)">${k} · ${TERRITORY[k]}</span></div>`).join('')}</div>
      </div>
      <aside style="display:flex;flex-direction:column;gap:var(--ws-gap);min-width:0">
        ${panel('REFERRAL LINK', kv([['URL', ok ? 'site00.com/invite/•••••• (L-02)' : 'NOT ISSUED', ok], ['TARGET', 'DIGITAL FOUNDATION ENTRY'], ['ROUTE', 'EXISTING /invite/:code'], ['QR PAYLOAD', 'HTTPS · PUBLIC CODE ONLY · NO SECRETS']]), { right: chip(ok ? 'unver' : 'muted', ok ? 'STAGING VERIFIED' : 'MISSING') })}
        ${panel('PRINT GATE', `<div class="ck">${gate.map(([g, v]) => `<div class="ck__i"><span class="ck__b ck__b--${v ? 'ok' : 'wait'}">${v ? CHECK : ''}</span><span class="ws-body">${g}</span>${chip(v ? 'ok' : 'unver', v ? 'PASS' : 'OPEN')}</div>`).join('')}</div>`, { flush: true, right: chip('req', 'BLOCKED · 5 OPEN') })}
        <div class="ws-btn-row">${btn('SHARE CARD', { ic: 'share', attrs: 'data-anchor="share"' })}${btn('DIGITAL PNG', { tone: 'out', ic: 'download' })}<button class="ws-btn ws-btn--off" disabled aria-disabled="true" data-anchor="export">${icon('lock')}<span>PRINT PACKAGE</span></button></div>
      </aside></div></div>`;
}

// ═══ ACTIVITY ═══════════════════════════════════════════════════════════════
export function activity() {
  return `<div class="ws-page">${rfHead({ title: 'ACTIVITY', sub: 'RECORDED EVENTS ONLY · NEVER INFERRED' })}${secnav(6)}
    <div class="reg-toolbar"><span class="ws-search">${icon('search')}<span>PARTNER, CLIENT OR EVENT</span></span>${tabs([['ALL', ''], 'PARTNERS', 'ATTRIBUTION', 'COMMISSIONS', 'PAYOUTS', 'CARDS'], 0, { label: 'EVENT FILTERS' })}<span class="reg-toolbar__tools">${btn('EXPORT', { tone: 'out', size: 'sm', ic: 'export' }).replace('<span>EXPORT</span>', '<span class="lbl">EXPORT CSV</span>')}</span></div>
    <div class="pd"><div>${panel('TIMELINE', timeline(ACTIVITY), { right: '<span class="ws-meta">TIMES IN FOUNDER TIME ZONE</span>' })}</div>
    <div>${panel('EVENT DETAIL · COMMISSION ELIGIBLE', kv([['EVENT', 'commission.eligible', true], ['AT', 'OCT 12 · 11:05:41'], ['ACTOR', 'SYSTEM (PAYMENT RULE)'], ['SUBJECT', 'C-0010'], ['PARTNER', 'MERIDIAN BOOKKEEPING'], ['CLIENT', 'VELA BOUTIQUE (AUTHORIZED)'], ['RESULT', 'ELIGIBLE · AWAITS APPROVAL'], ['AUDIT ID', 'evt_••••', true]]))}</div></div></div>`;
}

// ═══ PUBLIC REFERRAL ENTRY (prospect) ═══════════════════════════════════════
export function publicEntry({ st: s = 'valid' } = {}) {
  const msg = {
    valid: ['INTRODUCED BY MERIDIAN BOOKKEEPING', 'BEGIN YOUR DIGITAL FOUNDATION', 'A DOMAIN, PROFESSIONAL EMAIL, SECURITY AND OWNERSHIP RECORDS — SET UP FOR YOUR BUSINESS BY SITE 00.', btn('BEGIN', { arrow: true, block: true })],
    invalid: ['THIS REFERRAL LINK IS NOT RECOGNISED', 'YOU CAN STILL BEGIN', 'THE CODE MAY BE MISTYPED. YOU CAN START WITHOUT IT — NO REFERRAL WILL BE RECORDED.', btn('BEGIN WITHOUT A REFERRAL', { tone: 'out', block: true })],
    revoked: ['THIS REFERRAL CARD IS NO LONGER ACTIVE', 'YOU CAN STILL BEGIN', 'ASK THE PERSON WHO GAVE YOU THE CARD FOR A NEW ONE, OR CONTINUE WITHOUT A REFERRAL.', btn('BEGIN WITHOUT A REFERRAL', { tone: 'out', block: true })],
    test: ['STAGING TEST LINK', 'TEST ENTRY · NOT FOR CLIENTS', 'THIS CARD POINTS AT STAGING. IT MUST NEVER BE PRINTED FOR DISTRIBUTION.', btn('CONTINUE (TEST)', { tone: 'out', block: true })],
  }[s];
  return `<div class="pub ws">${s === 'test' ? '<div class="rcard__test" style="position:static;height:28px;font-size:11px">STAGING TEST · NOT FOR PRINT</div>' : ''}${img('pav', 'pub__band')}<div class="pub__body"><div class="pub__card"><div class="ws-brand"><b>SITE 00</b><span>DIGITAL FOUNDATION</span></div><span class="ws-label" style="color:${s === 'valid' ? 'var(--ws-ink)' : 'var(--ws-red-ink)'}">${msg[0]}</span><h1 class="ws-title" style="font-size:40px">${msg[1]}<i></i></h1><p class="ws-meta" style="margin:0;line-height:1.6;color:var(--ws-ink-2)">${msg[2]}</p>${msg[3]}<span class="ws-meta">NO ACCOUNT NEEDED · YOUR PROGRESS IS SAVED TO A PERMANENT PRIVATE LINK</span></div></div></div>`;
}

// ═══ PARTNER PORTAL (separate product surface) ══════════════════════════════
export function portal({ view = 'home' } = {}) {
  const p = P.mer;
  const nav = [['home', 'HOME', 'home'], ['card', 'MY CARD', 'qr'], ['earnings', 'EARNINGS', 'payment'], ['terms', 'TERMS', 'document']];
  const top = `<header class="pt-top"><span class="pt-brand"><b>SITE 00</b><span>PARTNER</span></span><nav class="pt-top__d">${nav.map(([k, l]) => `<a class="${k === view ? 'on' : ''}">${l}</a>`).join('')}</nav><span style="display:flex;align-items:center;gap:6px">${img(p.img, 'rf-thumb--sm rf-thumb', 'width:36px;height:30px')}${iconbtn('help', 'SUPPORT')}</span></header>`;
  const bn = `<nav class="pt-bnav">${nav.map(([k, l, ic]) => `<a class="${k === view ? 'on' : ''}">${icon(ic)}${l}</a>`).join('')}</nav>`;
  const masked = [['REFERRAL · SEP 18', 'TRANSPORTATION · F•••• & E••••', 'PAID', 'paid'], ['REFERRAL · SEP 20', 'RETAIL · V•••• B••••', 'PENDING APPROVAL', 'pending'], ['REFERRAL · OCT 04', 'REAL ESTATE · C•••• & L••••', 'NOT YET ELIGIBLE', 'noteligible'], ['REFERRAL · OCT 15', 'CREATIVE · A•••• B••••', 'IN PROGRESS', 'tracked']];
  const refs = `<div class="ldg" style="--cols-m:minmax(0,1fr) auto">${masked.map(([a, b, c, k]) => `<div class="ldg__r"><span class="x-m cell">${twoLine(a, b)}</span><span class="x-m cell" style="align-items:flex-end">${cs(k, c)}</span></div>`).join('')}</div>`;
  const head = (t, s) => `<header class="ws-phead"><div><h1 class="ws-title" style="font-size:min(var(--ws-fs-title),46px)">${t}<i></i></h1><div class="ws-meta ws-phead__sub">${s}</div><div style="margin-top:10px">${specTag('SPECIMEN · MASKED CLIENT LABELS · DISCLOSURE FD-R11')}</div></div></header>`;
  let body;
  if (view === 'card')
    body = `${head('MY CARD', 'MERIDIAN BOOKKEEPING · CARD V2')}<div class="pt-grid"><div><div class="cs-stage">${card({ t: 'A', side: 'front', partner: p, w: 460 })}${card({ t: 'A', side: 'back', partner: p, w: 460 })}</div></div><div>${panel('SHARE', `<div style="display:grid;gap:10px">${btn('SHARE CARD', { block: true, ic: 'share' })}${btn('COPY REFERRAL LINK', { tone: 'out', block: true, ic: 'link' })}${btn('DOWNLOAD DIGITAL CARD', { tone: 'out', block: true, ic: 'download' })}</div><p class="ws-meta" style="margin:12px 0 0">PRINTED CARDS ARE ORDERED BY SITE 00 AFTER QR VERIFICATION.</p>`)}${panel('LINK', kv([['LINK', 'site00.com/invite/••••••', true], ['STATUS', 'ACTIVE']]))}</div></div>`;
  else if (view === 'earnings')
    body = `${head('EARNINGS', 'YOUR COMMISSIONS AND PAYOUTS ONLY')}<div class="pt-grid"><div><div class="msum"><div><span class="ws-label">PENDING</span>${amt(5500)}</div><div><span class="ws-label">APPROVED</span>${amt(6000)}</div><div><span class="ws-label">PAID · ALL TIME</span>${amt(null)}</div><div><span class="ws-label">NEXT PAYOUT</span><span class="ws-body">OCT 24 (PLANNED)</span></div></div>${panel('COMMISSIONS', refs, { flush: true })}</div><div>${panel('PAYOUT HISTORY', `<div class="ldg" style="--cols-m:minmax(0,1fr) auto"><div class="ldg__r"><span class="x-m cell">${twoLine('PO-0005', 'BANK TRANSFER · PLANNED OCT 24')}</span><span class="x-m cell" style="align-items:flex-end">${amt(6000)}${cs('scheduled')}</span></div><div class="ldg__r"><span class="x-m cell">${twoLine('PO-0004', 'RETURNED · UPDATE PAYMENT DETAILS')}</span><span class="x-m cell" style="align-items:flex-end">${amt(3500)}${cs('failed')}</span></div></div>`, { flush: true })}</div></div>`;
  else if (view === 'terms')
    body = `${head('TERMS', 'YOUR CURRENT REFERRAL ARRANGEMENT')}${panel('VERSION 2 · EFFECTIVE OCT 01', kv([['COMPENSATION', 'AS AGREED WITH SITE 00 (FD-R01–R03)'], ['WHAT COUNTS', 'A CLIENT WHO PAYS FOR A DIGITAL FOUNDATION (FD-R04)'], ['REFUNDS', 'FD-R06'], ['PAYOUT TIMING', 'FD-R05']]))}`;
  else
    body = `${head('WELCOME BACK', 'MERIDIAN BOOKKEEPING · PARTNER SINCE AUG 2026')}<div class="pt-grid"><div><div class="msum"><div><span class="ws-label">REFERRALS</span><span class="ws-num" style="font-size:30px">4</span></div><div><span class="ws-label">PAID CLIENTS</span><span class="ws-num" style="font-size:30px">2</span></div><div><span class="ws-label">PENDING</span>${amt(5500)}</div><div><span class="ws-label">PAID OUT</span>${amt(null)}</div></div>${panel('YOUR REFERRALS', refs, { flush: true })}</div><div>${panel('YOUR CARD', `<div style="display:grid;gap:12px;justify-items:center">${card({ t: 'A', side: 'back', partner: p, w: 340 })}${btn('SHARE CARD', { block: true, ic: 'share' })}</div>`)}</div><div>${panel('SUPPORT', '<p class="ws-meta" style="margin:0;line-height:1.6">QUESTIONS ABOUT A REFERRAL OR PAYOUT GO TO SITE 00 DIRECTLY. CLIENT DETAILS ARE PRIVATE AND NOT SHOWN HERE.</p>' + `<div style="margin-top:12px">${btn('CONTACT SITE 00', { tone: 'out', block: true, ic: 'message' })}</div>`)}</div></div>`;
  return `<div class="pt-app ws">${top}<main class="pt-stage ws-standard" id="stage"><div class="ws-page">${body}</div></main>${bn}</div>`;
}

// ═══ CARD ART (board-only) ══════════════════════════════════════════════════
export function cardArt({ t = 'A', mode = 'flat', w = 560, test = false } = {}) {
  const p = P.aio;
  if (mode === 'mock')
    return `<div class="mock" style="width:100%;height:100vh"><div class="mock__a">${card({ t, side: 'front', partner: p, w })}</div><div class="mock__b" style="left:52%;top:46%">${card({ t, side: 'back', partner: p, w: Math.round(w * 0.86) })}</div></div>`;
  if (mode === 'print') {
    const W = w; const H = (W / 3.75) * 2.25; const s = W / 3.75; // bleed canvas 3.75 × 2.25 in
    // Background is extended into the bleed by a copy behind, stretched about the trim centre so trim edges land on bleed edges; the artwork itself sits at trim size on the trim box,
    // so type and QR keep their designed margins relative to trim (safe area 0.125 in inside trim).
    return `<div style="display:flex;gap:40px;padding:40px;align-items:flex-start;justify-content:center;background:#fff;height:100vh">${['front', 'back'].map((side) => `<div style="display:grid;gap:10px"><span class="ws-label" style="color:#0c0c0c">${side.toUpperCase()} · BLEED 3.75 × 2.25 IN · TRIM 3.5 × 2 IN</span><div class="pspec" style="width:${W}px;height:${H}px;background:#f3f2ef"><div class="pspec__ext" aria-hidden="true" style="left:${s * 0.125}px;top:${s * 0.125}px">${card({ t, side, partner: p, w: Math.round(s * 3.5) })}</div><div class="pspec__art" style="left:${s * 0.125}px;top:${s * 0.125}px">${card({ t, side, partner: p, w: Math.round(s * 3.5) })}</div><span class="pspec__bleed"></span><span class="pspec__trim" style="left:${s * 0.125}px;top:${s * 0.125}px;width:${s * 3.5}px;height:${s * 2}px"></span><span class="pspec__safe" style="left:${s * 0.25}px;top:${s * 0.25}px;width:${s * 3.25}px;height:${s * 1.75}px"></span><span class="pspec__lab" style="left:4px;top:4px;color:#ce1017">BLEED 0.125 IN</span><span class="pspec__lab" style="right:${s * 0.13}px;bottom:${s * 0.13}px">TRIM</span><span class="pspec__lab" style="left:${s * 0.27}px;top:${H + 6}px;color:#2e7a4b">SAFE · 0.125 IN INSIDE TRIM (GREEN DASH)</span></div></div>`).join('')}</div>`;
  }
  if (mode === 'front' || mode === 'back')
    return `<div style="display:flex;padding:28px;align-items:center;justify-content:center;background:linear-gradient(180deg,#fff,#efeeeb);height:100vh">${card({ t, side: mode, partner: p, w, test })}</div>`;
  return `<div style="display:flex;gap:32px;padding:32px;align-items:center;justify-content:center;background:linear-gradient(180deg,#fff,#efeeeb);height:100vh">${card({ t, side: 'front', partner: p, w, test })}${card({ t, side: 'back', partner: p, w, test })}</div>`;
}
