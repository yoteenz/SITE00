// Page compositions — one markup per destination; ws.css recomposes it from the stage width.
// Every value is fictional DEMO data; backend-dependent cells carry their gap id (G-xx).
import { DF, PHASES, money, icon, CHEV, CHECK, PLUS, SORT, mk, st, chip, count, gap, kbd, btn, iconbtn, plate, ident, seg, journey, tabs, segctl, kv, act, field, banner, arch, panel, phead, inspHead, DEMO, SYNTH, byName } from './ws-kit.js';

const H = byName('Horizon Freight');
const C = byName('Carter & Lane');
const A = byName('Atelier Bloom');
const SW = byName('Summit Wellness');
const FE = byName('Field & Ember');
const V = byName('Vela Boutique');
const AV = byName('Avery Studio');
const N = byName('Nova Creative');
export { H, C, A, SW, FE, V, AV, N };

const ownerCls = (c) => (c.who === 'FOUNDER' ? 'reg__owner reg__owner--founder' : 'reg__owner');
const BASE = DF.config.base_price_minor;

// ═══ 01 OVERVIEW · RELAXED ═══════════════════════════════════════════════════
export function overview({ st: state = 'default' } = {}) {
  const head = phead({
    n: '01',
    title: 'DIGITAL FOUNDATION',
    sub: '6 ACTIVE · 3 NEED YOU · UPDATED 2 MIN AGO',
    archHtml: arch('crown', 'right:0;top:6px;width:60px;height:104px;opacity:.9'),
    mHideActs: true,
  });
  if (state === 'empty')
    return `<div class="ws-page">${head}<div class="ws-empty"><span class="ws-label">NO FOUNDATIONS YET</span><h2 class="ws-h2">CREATE THE FIRST FOUNDATION<i class="ws-period"></i></h2><p class="ws-meta" style="margin:0;max-width:52ch">A FOUNDATION CREATES THE CLIENT ARTIFACT AND A PERSONAL LINK. NOTHING IS EMAILED UNTIL YOU SEND IT.</p>${btn('NEW FOUNDATION', { tone: 'red', ic: 'add' })}</div></div>`;
  if (state === 'error' || state === 'error-detail')
    return `<div class="ws-page">${head}${banner('OVERVIEW COULD NOT LOAD · THE PIPELINE REQUEST FAILED. NOTHING WAS CHANGED.', { tone: 'red', ic: 'warning' })}<div style="margin-top:12px" class="ws-btn-row">${btn('RETRY', { ic: 'retry' })}</div>
    <details ${state === 'error-detail' ? 'open' : ''} class="ws-panel" style="margin-top:14px;max-width:760px"><summary class="ws-panel__h ws-label" style="cursor:pointer;list-style:none">TECHNICAL DETAIL ${icon('next', '', 'style="width:14px;height:14px;transform:rotate(90deg)"')}</summary><div class="ws-panel__b">${kv([['ACTION', 'pipeline', true], ['STATUS', 'HTTP 503 · SERVICE UNAVAILABLE'], ['REQUEST ID', 'req_7f3a…c21', true], ['AT', 'OCT 19 · 10:42:07'], ['ORIGIN', 'reliable-creation (staging API)', true]])}<p class="ws-meta" style="margin:10px 0 0">COPY THIS DETAIL INTO A SUPPORT NOTE. NO SECRET VALUES OR TOKENS ARE EVER SHOWN.</p></div></details></div>`;
  const loading = state === 'loading';
  const sk = (w) => `<span class="ws-skel" style="width:${w}"></span>`;
  const focus = loading
    ? `<div class="ws-focus">${sk('40%')}${sk('70%')}${sk('55%')}</div>`
    : `<section class="ws-focus" aria-label="CURRENT FOCUS">
      <div class="ws-focus__k">${st('founder', 'CURRENT FOCUS · FOUNDER DECISION')}<span class="ws-meta">${H.last}</span></div>
      ${ident(H, { size: '' })}
      <p class="ws-statement">INTAKE COMPLETE — READY FOR YOUR REVIEW<i class="ws-period"></i></p>
      <div class="ws-focus__act">${btn('REVIEW INTAKE', { arrow: true })}<span class="ws-meta">1 OF 3 DECISIONS</span></div>
    </section>`;
  const sigs = [
    ['ACTIVE', 6, 50, ''],
    ['NEEDS REVIEW', 3, 25, 'attn'],
    ['AWAITING CLIENT', 4, 33, ''],
    ['COMPLETE', 12, 100, ''],
  ];
  const signals = `<section class="ws-signals ov__signals" aria-label="PORTFOLIO SIGNALS">${sigs
    .map(([l, v, p, k]) => `<div class="ws-sig ${k ? `ws-sig--${k}` : ''}"><span class="ws-num">${loading ? '—' : v}</span><span class="ws-label">${l}</span><span class="ws-sig__bar"><i style="width:${p}%"></i></span></div>`)
    .join('')}</section>`;
  const needs = panel(
    'NEEDS YOU',
    [C, SW, V]
      .map((c, i) => `<div class="q-item" style="padding-left:0;padding-right:0">${plate(c.name, { attn: i < 2, size: 'sm' })}<span class="ws-who"><b>${c.name}</b><span>${['QUOTE · NOT YET APPROVED', 'CLIENT REQUEST · CHANGE REQUESTED', 'EXCEPTION · TASK BLOCKED'][i]}</span></span><span class="ws-meta">${['3H', '2D', '4D'][i]}</span></div>`)
      .join(''),
    { right: `<span class="ws-meta">OLDEST FIRST</span>`, cls: 'ov__needs' },
  );
  const work = `<section class="ov__work"><div class="ws-sechead"><h2 class="ws-h3">ACTIVE WORK</h2><a class="ws-link-quiet">ALL FOUNDATIONS →</a></div><div class="reg-box">${registry([C, A, FE, V], { compactHead: true })}</div></section>`;
  const move = panel('RECENT MOVEMENT', `${act('40M', 'work', 'FIELD & EMBER', 'SPF RECORD COMPLETED')}${act('2H', 'client', 'ATELIER BLOOM', 'INTAKE SAVED · DOMAIN')}${act('3H', 'founder', 'CARTER & LANE', 'QUOTE V2 CREATED')}${act('5H', 'client', 'AVERY STUDIO', 'INVITATION LINK CREATED')}${act('1D', 'founder', 'HORIZON FREIGHT', 'INTAKE COMPLETED')}`, { right: `<span class="ws-meta">TODAY ${gap('G-03')}</span>`, cls: 'ov__move' });
  const mile = panel('NEXT MILESTONE · FIELD & EMBER', `<div style="display:grid;gap:12px">${stageRail(3)}<span class="ws-meta">04 DNS + SECURITY · 2 OF 6 TASKS LEFT · PROJECTED OCT 24</span></div>`, { cls: 'ov__mile' });
  return `<div class="ws-page">${head}<div class="ov"><div class="ov__focus">${focus}</div>${signals}${needs}${work}${move}${mile}</div></div>`;
}

// ═══ 02 FOUNDATIONS REGISTRY · STANDARD ═══════════════════════════════════════
export function registry(rows, { sel = -1, compactHead = false, sort = 'NEXT ACTION' } = {}) {
  const head = `<div class="reg__h" role="row">
    <span class="c-client" role="columnheader">CLIENT</span>
    <span class="c-status" role="columnheader">STATUS</span>
    <span class="c-life" role="columnheader">LIFECYCLE</span>
    <span class="c-intake" role="columnheader">INTAKE ${gap('G-01')}</span>
    <span class="c-next ${sort === 'NEXT ACTION' ? 'sort' : ''}" role="columnheader" aria-sort="${sort === 'NEXT ACTION' ? 'ascending' : 'none'}">NEXT ACTION ${sort === 'NEXT ACTION' ? SORT : ''}</span>
    <span class="c-last" role="columnheader" style="justify-content:flex-end">LAST ACTIVITY</span>
    <span class="c-chev" aria-hidden="true"></span></div>`;
  const row = (c, i) => `<div class="reg__r ${i === sel ? 'reg__r--sel' : ''} ${c.test ? 'reg__r--test' : ''}" role="row" ${i === sel ? 'aria-selected="true"' : ''}>
    <span class="c-client" role="cell">${plate(c.name, { attn: c.k === 'founder', test: c.test })}<span class="ws-who"><b title="${c.name}">${c.name}</b><span>${c.test ? 'TEST CLIENT · SYNTHETIC' : c.cat}</span></span></span>
    <span class="reg__msub">${st(c.k, c.state)}<span class="ws-meta">${c.last}</span></span>
    <span class="reg__mseg">${seg(c.phase, c.k)}</span>
    <span class="c-status reg__cell" role="cell">${st(c.k, c.state)}${seg(c.phase, c.k, 'ws-seg--w')}<span class="reg__sub">${c.last} · STEP ${c.phase + 1} OF 8</span></span>
    <span class="c-life reg__cell" role="cell">${st(c.k, c.state)}${seg(c.phase, c.k, 'ws-seg--w')}<span class="reg__sub">STEP ${c.phase + 1} OF 8 · ${PHASES[c.phase]}</span></span>
    <span class="c-intake reg__cell" role="cell"><span class="ws-body">${c.intake[0]}</span><span class="reg__sub">${c.intake[1]}</span></span>
    <span class="c-next reg__cell reg__next" role="cell"><span class="${ownerCls(c)}">${c.who === '—' ? 'NO ACTION' : c.who}</span><b class="ws-2l" title="${c.next}">${c.action}</b></span>
    <span class="c-last" role="cell"><span class="ws-meta ws-num-tab">${c.last}</span></span>
    <span class="c-chev" role="cell" ${i === sel ? 'data-anchor="rowmenu"' : ''}>${CHEV}</span></div>`;
  return `<div class="reg" role="table" aria-label="FOUNDATIONS" aria-rowcount="${rows.length + 1}">${compactHead ? head : head}${rows.map(row).join('')}</div>`;
}

export const STATUS_VIEWS = [['ALL', '8'], ['NEEDS YOU', '3'], ['INVITED', ''], ['INTAKE', ''], ['QUOTE', ''], ['ACTIVE', ''], ['COMPLETE', ''], ['TEST', '']];

export function foundations({ sel = -1, st: state = 'default', rows = DEMO } = {}) {
  const head = phead({ n: '02', title: 'FOUNDATIONS', sub: `${rows.length} FOUNDATIONS · 6 ACTIVE · 3 NEED YOU` });
  const search = state === 'search' ? 'fie' : '';
  const toolbar = `<div class="reg-toolbar"><span class="ws-search ${search ? 'ws-search--focus' : ''}" role="search">${icon('search')}<span class="${search ? 'ws-data' : ''}" style="${search ? 'color:var(--ws-ink);font-size:14px' : ''}">${search || 'NAME, EMAIL OR DOMAIN'}</span>${search ? iconbtn('close', 'CLEAR SEARCH') : kbd('/')}</span>
    ${tabs(STATUS_VIEWS, state === 'filtered' ? 1 : 0, { label: 'STATUS VIEWS' })}
    <span class="reg-toolbar__tools"><span data-anchor="filter">${btn('FILTER', { tone: 'out', size: 'sm', ic: 'filter' }).replace('<span>FILTER</span>', '<span class="lbl">FILTER</span>')}</span><span data-anchor="sort">${btn('SORT', { tone: 'out', size: 'sm' }).replace('<span>SORT</span>', `${SORT.replace('width:12px;height:12px', 'width:16px;height:16px')}<span class="lbl">SORT · NEXT ACTION</span>`)}</span></span></div>`;
  let body;
  if (state === 'loading') body = `<div class="reg" role="table" aria-busy="true">${Array.from({ length: 6 }, () => `<div class="reg__r"><span class="c-client"><span class="ws-plate ws-plate--sm"></span><span class="ws-skel" style="width:60%"></span></span><span class="c-next"><span class="ws-skel" style="width:70%"></span></span></div>`).join('')}</div>`;
  else if (state === 'empty') body = `<div class="ws-empty"><span class="ws-label">NO MATCHES</span><h2 class="ws-h2">NO FOUNDATION MATCHES “<span class="ws-data">zzq</span>”<i class="ws-period"></i></h2><p class="ws-meta" style="margin:0">SEARCH LOOKS AT NAME, EMAIL AND DOMAIN. CLEAR THE SEARCH OR THE STATUS VIEW.</p>${btn('CLEAR SEARCH', { tone: 'out', size: 'sm' })}</div>`;
  else if (state === 'error') body = `${banner('THE REGISTRY COULD NOT REFRESH · SHOWING THE LIST FROM 10:42. NOTHING WAS CHANGED.', { tone: 'red', ic: 'warning' })}<div style="margin-top:12px">${registry(rows, { sel })}</div>`;
  else {
    const list = state === 'search' ? [FE] : state === 'filtered' ? [H, C, SW] : state === 'test' ? [...rows, SYNTH] : rows;
    body = registry(list, { sel });
  }
  return `<div class="ws-page">${head}${toolbar}<div class="reg-box">${body}</div><div class="reg-foot"><span class="ws-meta">${rows.length} OF ${rows.length} · SYNTHETIC CLIENTS HIDDEN (FD-W12)</span><span class="ws-meta">${kbd('J')} ${kbd('K')} MOVE · ${kbd('↵')} OPEN · ${kbd('/')} SEARCH</span></div></div>`;
}

export function clientInspector(c = H) {
  return `${inspHead('CLIENT PREVIEW', `<div class="ws-ident" style="gap:14px">${plate(c.name, { attn: c.k === 'founder', size: 'lg', test: c.test })}<span class="ws-who"><b style="font-size:16px;white-space:normal">${c.name}</b><span>${c.cat}</span><span class="ws-data--nowrap" style="font-size:13px;color:var(--ws-ink-2)" title="${c.email}">${c.email}</span></span></div>`)}
  <div class="ws-insp__body">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">${st(c.k, c.state)}<span class="ws-meta">STEP ${c.phase + 1} OF 8</span></div>
    ${journey(c.phase, { kind: c.k === 'client' ? 'client' : c.k === 'blocked' ? 'blocked' : 'cur', abbr: true })}
    <div class="ws-focus" style="padding:14px 16px;gap:8px;box-shadow:inset 3px 0 0 ${c.k === 'founder' ? 'var(--ws-red)' : 'var(--ws-ink)'}"><span class="ws-label">NEXT ACTION · ${c.who}</span><span class="ws-name">${c.action}</span></div>
    ${kv([
      ['PERSONAL LINK', '/foundation/ab12…9zQ', true],
      ['INTAKE', `${c.intake[0]} · ${c.intake[1]}`],
      ['QUOTE', c.phase >= 3 ? `${money(BASE + 10000)} · V2` : 'NOT YET'],
      ['LAST ACTIVITY', c.last],
    ])}
    <div><span class="ws-label">RECENT MOVEMENT ${gap('G-03')}</span><div style="margin-top:6px">${act('2H', 'client', 'INTAKE SAVED', 'BUSINESS INFORMATION')}${act('1D', 'client', 'LINK OPENED')}${act('2D', 'work', 'FOUNDATION CREATED', 'BY FOUNDER')}</div></div>
  </div>
  <div class="ws-insp__foot">${btn('OPEN FOUNDATION', { block: true, arrow: true })}${btn('COPY LINK', { tone: 'out', only: true, ic: 'link' })}<span data-anchor="rowmenu">${btn('MORE ACTIONS', { tone: 'out', only: true, ic: 'more' })}</span></div>`;
}

// ═══ CLIENT RECORD · RELAXED ══════════════════════════════════════════════════
export const SECTIONS = ['OVERVIEW', 'INTAKE', 'RECOMMENDATIONS', 'QUOTE', 'OPERATIONS', 'RECORDS', 'COMMUNICATIONS', 'ACTIVITY'];
const DATES = ['OCT 10', 'OCT 14', 'TODAY', '', '', '', '', ''];

export function recordHead(c = H) {
  return `<header class="rec-head">${plate(c.name, { attn: c.k === 'founder', size: 'lg', test: c.test })}
    <div class="rec-head__name"><h1 class="ws-title">${c.name.toUpperCase()}<i aria-hidden="true"></i></h1><div class="rec-head__sub"><span class="ws-meta">${c.cat}</span><span class="ws-data ws-meta" style="color:var(--ws-ink-2)">${c.email}</span></div></div>
    <div class="rec-head__acts">${btn('COPY LINK', { tone: 'out', size: 'sm', ic: 'link' })}${btn('CLIENT VIEW', { tone: 'out', size: 'sm', ic: 'external' })}${btn('MESSAGE', { tone: 'out', size: 'sm', ic: 'message' })}<span data-anchor="rowmenu">${btn('MORE', { tone: 'out', size: 'sm', ic: 'more' })}</span></div></header>`;
}

export function recordProgress(c = H) {
  return `<section class="rec-progress" aria-label="CLIENT JOURNEY"><div class="rec-progress__k">${st(c.k, c.state)}<span class="ws-meta">STEP ${c.phase + 1} OF 8 · NEXT: <b class="ws-ink">${c.action}</b> · ${c.who}</span></div>${journey(c.phase, { kind: c.k === 'client' ? 'client' : 'cur', dates: DATES.map((d, i) => (i <= c.phase ? d || 'TODAY' : '')) })}</section>`;
}

const side = (c) => `<aside class="rec-side">
  ${panel('PERSONAL LINK', `<div class="ws-link"><code class="ws-data">site00.com/foundation/ab12…9zQ</code>${btn('COPY', { tone: 'ghost', size: 'xs', ic: 'link' })}</div><p class="ws-meta" style="margin:10px 0 0">THE LINK NEVER EXPIRES · QUOTES EXPIRE AFTER ${DF.config.quote_expiry_days} DAYS</p>`, { right: chip('ok', 'ACTIVE') })}
  ${panel('CONTACT', kv([['PRIMARY', 'Jordan Hale', true], ['EMAIL', c.email, true], ['CONTACT NUMBER', '901-236-2647', true], ['REFERRAL', 'DIRECT']]))}
  ${panel('RECENT MOVEMENT', `${act('1D', 'founder', 'INTAKE COMPLETED')}${act('2D', 'client', 'INTAKE SAVED', 'DOMAIN · CONNECT A DOMAIN I OWN')}${act('4D', 'client', 'LINK OPENED')}${act('5D', 'work', 'FOUNDATION CREATED', 'BY FOUNDER')}`, { right: `<a class="ws-link-quiet">ACTIVITY → ${gap('G-03')}</a>` })}
</aside>`;

export function recordOverview(c = H) {
  return `<div class="rec-main">
    <section class="ws-focus ws-focus--plain" aria-label="NEXT ACTION"><div class="ws-focus__k">${st('founder', 'FOUNDER DECISION')}<span class="ws-meta">${c.last}</span></div><p class="ws-statement" style="grid-column:1/-1">INTAKE COMPLETE — REVIEW BEFORE QUOTING<i class="ws-period"></i></p><div class="ws-btn-row" style="grid-column:1/-1">${btn('REVIEW INTAKE', { arrow: true })}${btn('OPEN QUOTE', { tone: 'out' })}</div></section>
    <div class="rec-sum"><div><span class="ws-label">INTAKE</span><span class="ws-name">COMPLETE</span><span class="ws-meta">OCT 14 · 12 ANSWERS</span></div><div><span class="ws-label">RECOMMENDATION</span><span class="ws-name">MANUAL REVIEW</span><span class="ws-meta">2 REASONS</span></div><div><span class="ws-label">QUOTE</span><span class="ws-name ws-num-tab">${money(BASE + 10000)} · V1</span><span class="ws-meta">NOT APPROVED</span></div></div>
    ${panel('SUBMITTED INTAKE · SUMMARY', `<div class="ws-kvgrid ws-kvgrid--2">${kv([['BUSINESS', 'HORIZON FREIGHT'], ['INDUSTRY', 'TRANSPORTATION + LOGISTICS'], ['DOMAIN PATH', 'CONNECT A DOMAIN I OWN']])}${kv([['YOUR DOMAIN', 'horizon-freight.invalid', true], ['MAILBOXES', '6'], ['EMAIL TODAY', 'GOOGLE WORKSPACE']])}</div>`, { right: `<a class="ws-link-quiet">ALL ANSWERS →</a>` })}
  </div>`;
}

export function recordIntake() {
  const g = (t, n, rows, edited) => `<section class="ans-group"><div class="ans-group__h"><h3 class="ws-h3"><span class="ws-idx" style="margin-right:10px">${n}</span>${t}</h3><span class="ws-meta">${edited}</span></div><div class="ans-grid">${rows.map((r) => kv([r])).join('')}</div></section>`;
  return `<div class="rec-main">
    ${g('BUSINESS INFORMATION', '01', [['BUSINESS NAME', 'Horizon Freight', true], ['INDUSTRY', 'TRANSPORTATION + LOGISTICS'], ['PRIMARY CONTACT', 'Jordan Hale', true], ['EMAIL ADDRESS', 'ops@horizon-freight.invalid', true], ['CONTACT NUMBER', '901-236-2647', true], ['TEAM SIZE', '6 PEOPLE']], 'SAVED OCT 12')}
    ${g('DOMAIN', '02', [['DOMAIN PATH', 'CONNECT A DOMAIN I OWN'], ['YOUR DOMAIN', 'horizon-freight.invalid', true], ['REGISTRAR', 'GODADDY'], ['DNS ACCESS', 'CLIENT CAN APPROVE']], 'SAVED OCT 13')}
    ${g('EMAIL + SERVICES', '03', [['MAILBOXES', '6'], ['CURRENT EMAIL', 'GOOGLE WORKSPACE'], ['MIGRATION', 'YES · 4 MAILBOXES'], ['SIGNATURES', 'YES']], 'SAVED OCT 14')}
  </div>`;
}

export function recordRecommendations() {
  const item = (on, t, p, why) => `<div class="rec-item"><span class="ws-check__b ${on ? 'ws-check__b--on' : ''}" aria-hidden="true"></span><span><span class="ws-name">${t}</span><span class="rec-item__why">${why.map((w) => `<span class="ws-meta">${w}</span>`).join('')}</span></span><span class="ws-body ws-num-tab" style="white-space:nowrap">${p}</span></div>`;
  return `<div class="rec-main">${banner('AUTOMATED RECOMMENDATION · NOT YET REVIEWED BY YOU. NOTHING IS SENT TO THE CLIENT UNTIL YOU APPROVE A QUOTE.', { ic: 'info' })}
    ${panel('RECOMMENDED SERVICES', `${item(true, 'BASE DIGITAL FOUNDATION', money(BASE), ['INCLUDED IN EVERY FOUNDATION'])}${item(true, 'ADDITIONAL MAILBOX × 5', money(5 * 1200), ['6 MAILBOXES REQUESTED · 1 INCLUDED'])}${item(true, 'EMAIL MIGRATION × 4', money(4 * 2500), ['MIGRATION REQUESTED · GOOGLE WORKSPACE'])}${item(false, 'DOMAIN TRANSFER', 'MANUAL REVIEW', ['REGISTRAR ACCESS UNCONFIRMED', 'REQUIRES FOUNDER REVIEW'])}`, { flush: true, right: chip('req', '1 MANUAL REVIEW') })}
  </div>`;
}

export function recordQuote({ state = 'draft' } = {}) {
  const lines = [
    ['BASE DIGITAL FOUNDATION', 'BASE', 1, BASE],
    ['ADDITIONAL MAILBOX', 'ADD-ON', 5, 1200],
    ['EMAIL MIGRATION', 'ADD-ON', 4, 2500],
    ['DOMAIN TRANSFER', 'MANUAL', 1, 10000],
  ];
  const sub = lines.reduce((s, l) => s + l[2] * l[3], 0);
  return `<div class="qt-wrap">
    <section class="ws-panel"><div class="ws-panel__h"><h2 class="ws-h3">QUOTE V2 · DRAFT</h2>${chip(state === 'sent' ? 'muted' : 'req', state === 'sent' ? 'SENT · AWAITING CLIENT' : 'NOT APPROVED')}</div>
      <table class="qt"><thead><tr><th>ITEM</th><th class="c-type">TYPE</th><th class="n">QTY</th><th class="n c-unit">UNIT</th><th class="n">AMOUNT</th></tr></thead><tbody>${lines
        .map(([t, k, q, u]) => `<tr><td>${t}</td><td class="c-type"><span class="ws-mode">${k}</span></td><td class="n">${q}</td><td class="n c-unit">${money(u)}</td><td class="n">${money(q * u)}</td></tr>`)
        .join('')}</tbody><tfoot><tr class="tot"><td colspan="2">SUBTOTAL</td><td class="n" colspan="3">${money(sub)}</td></tr></tfoot></table>
      <div class="ws-panel__b ws-meta">AMOUNTS COME FROM THE QUOTE RECORD · THIS SURFACE NEVER RECALCULATES · EXPIRES ${DF.config.quote_expiry_days} DAYS AFTER SENDING</div></section>
    <aside class="rec-side">${panel('DECISION', `<div style="display:grid;gap:12px"><span class="ws-meta">APPROVING MARKS THE QUOTE COMMERCIALLY READY. THE CLIENT SEES IT IN THEIR PORTAL.</span>${btn('APPROVE QUOTE', { block: true, attrs: 'data-anchor="approve"' })}${btn('REVISE · CREATE V3', { tone: 'out', block: true })}</div>`)}
    ${panel('VERSIONS', `${act('3H', 'founder', 'V2 CREATED', 'DOMAIN TRANSFER ADDED')}${act('1D', 'done', 'V1 SUPERSEDED')}`)}</aside>
  </div>`;
}

export function record({ c = H, sec = 0, qstate } = {}) {
  const body = [recordOverview, recordIntake, recordRecommendations, () => recordQuote({ state: qstate })][sec]?.(c) ?? recordPlaceholder(SECTIONS[sec]);
  const twoCol = sec !== 3;
  return `<div class="ws-page">${recordHead(c)}${recordProgress(c)}
    <div style="margin-top:var(--ws-gap)">${tabs(SECTIONS, sec, { label: 'RECORD SECTIONS' })}</div>
    ${twoCol ? `<div class="rec-body">${body}${side(c)}</div>` : `<div style="margin-top:var(--ws-gap)">${body}</div>`}</div>`;
}

function recordPlaceholder(name) {
  return `<div class="rec-main">${panel(name, `<p class="ws-meta" style="margin:0">${name} FOLLOWS THE SAME TWO-ZONE COMPOSITION: SECTION CONTENT LEFT, CONTEXT COLUMN RIGHT (SEE PAGE_BY_PAGE_RESPONSIVE_MAPPING.md).</p>`)}</div>`;
}

// ═══ 03 REVIEWS · STANDARD (queue / context / decision) ═══════════════════════
export const REVIEWS = [
  { c: H, type: 'INTAKE', why: 'INTAKE COMPLETE', sub: 'AWAITING YOUR REVIEW', when: '1D', cta: 'REVIEW INTAKE', k: 'founder' },
  { c: C, type: 'QUOTE', why: 'QUOTE NOT YET APPROVED', sub: 'MANUAL-REVIEW ADD-ON', when: '3H', cta: 'REVIEW QUOTE', k: 'founder' },
  { c: SW, type: 'REQUEST', why: 'CHANGE REQUESTED', sub: 'SIGNATURE · VERSION 2', when: '2D', cta: 'REVIEW REQUEST', k: 'founder' },
  { c: V, type: 'EXCEPTION', why: 'TASK BLOCKED', sub: 'CLIENT AUTH · REGISTRAR', when: '4D', cta: 'OPEN EXCEPTION', k: 'blocked' },
];
const RV_TABS = [['ALL', '4'], ['INTAKES', '1'], ['QUOTES', '1'], ['REQUESTS', '1'], ['EXCEPTIONS', '1'], 'HISTORY'];

const qItem = (r, sel) => `<div class="q-item ${sel ? 'q-item--sel' : ''}" role="option" aria-selected="${sel}">${plate(r.c.name, { attn: r.k === 'founder', size: 'sm' })}<span class="ws-who"><b>${r.c.name}</b><span>${r.type} REVIEW</span></span><span class="ws-meta ws-num-tab">${r.when}</span><span class="q-item__why">${st(r.k, r.why)}<span class="ws-meta">${r.sub}</span></span></div>`;

export function reviewContext(r = REVIEWS[0]) {
  if (r.type === 'QUOTE')
    return `<div class="ctx-sec"><span class="ws-label">QUOTE REVIEW · ${r.c.name.toUpperCase()}</span><h2 class="ws-h2" style="margin-top:10px">QUOTE V2 — ${money(BASE + 16000 + 10000)}<i class="ws-period"></i></h2></div><div class="ctx-sec">${recordQuote().replace('class="qt-wrap"', 'class="qt-wrap" style="grid-template-columns:minmax(0,1fr)"').replace(/<aside class="rec-side">[\s\S]*<\/aside>/, '')}</div>`;
  return `<div class="ctx-sec"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">${ident(r.c, { size: '' })}<span class="ws-meta">${r.when} AGO</span></div><div style="margin-top:14px">${st(r.k, r.why)}</div></div>
    <div class="ctx-sec"><div class="ws-sechead"><h3 class="ws-h3">SUBMITTED INTAKE</h3><span class="ws-meta">12 ANSWERS · OCT 14</span></div><div class="ws-kvgrid ws-kvgrid--2">${kv([['BUSINESS', 'HORIZON FREIGHT'], ['INDUSTRY', 'TRANSPORTATION + LOGISTICS'], ['CONTACT EMAIL', 'ops@horizon-freight.invalid', true], ['CONTACT NUMBER', '901-236-2647', true]])}${kv([['DOMAIN PATH', 'CONNECT A DOMAIN I OWN'], ['YOUR DOMAIN', 'horizon-freight.invalid', true], ['MAILBOXES', '6'], ['MIGRATION', 'YES · 4']])}</div></div>
    <div class="ctx-sec"><div class="ws-sechead"><h3 class="ws-h3">AUTOMATED RECOMMENDATION</h3>${chip('req', '1 MANUAL REVIEW')}</div>${['BASE DIGITAL FOUNDATION · ' + money(BASE), 'ADDITIONAL MAILBOX × 5', 'EMAIL MIGRATION × 4', 'DOMAIN TRANSFER · MANUAL REVIEW'].map((t) => `<div class="ws-act" style="grid-template-columns:10px minmax(0,1fr)">${mk(t.includes('MANUAL') ? 'founder' : 'idle')}<p>${t}</p></div>`).join('')}</div>`;
}

export function decision({ r = REVIEWS[0], state = 'default' } = {}) {
  const opt = (on, t, d) => `<div class="ws-choice ${on ? 'ws-choice--on' : ''}" role="radio" aria-checked="${on}"><span class="ws-choice__dot"></span><span><b>${t}</b><span class="d">${d}</span></span></div>`;
  const revising = state === 'revise';
  const busy = state === 'saving';
  return `<div class="dec" aria-label="DECISION"><div class="dec__hint"><span class="ws-label">YOUR DECISION</span></div>
    <div class="dec__opts">${opt(!revising, 'APPROVE INTAKE', 'MOVES TO RECOMMENDATION · CLIENT IS NOT NOTIFIED')}${opt(revising, 'REQUEST REVISION', 'RETURNS TO THE CLIENT WITH YOUR NOTE')}</div>
    <div class="dec__note">${field({ label: 'NOTE TO CLIENT', value: revising ? 'Please confirm who manages the registrar account.' : '', ph: revising ? '' : 'OPTIONAL FOR APPROVAL', state: revising ? 'focus' : '', area: true, data: revising, opt: !revising })}</div>
    <div class="dec__acts">${busy ? `<button class="ws-btn ws-btn--busy" aria-busy="true"><span>SAVING…</span></button>` : btn(revising ? 'SEND REVISION REQUEST' : 'CONFIRM DECISION', { arrow: true })}${btn('CANCEL', { tone: 'ghost', size: 'sm' })}</div>
    ${state === 'error' ? banner('NOT SAVED — THE DECISION DID NOT REACH THE SERVER. RETRY; YOUR NOTE IS KEPT.', { tone: 'red', ic: 'warning' }) : ''}</div>`;
}

export function reviews({ sel = 0, detail = false, state = 'default' } = {}) {
  const r = REVIEWS[sel] ?? REVIEWS[0];
  return `<div class="ws-page ws-page--flush">${phead({ n: '03', title: 'REVIEWS', sub: '4 DECISIONS WAITING · OLDEST 4D', mHideActs: true })}
    <div style="padding-bottom:12px">${tabs(RV_TABS, 0, { label: 'REVIEW CATEGORIES' })}</div>
    <div class="wb wb--decide ${detail ? 'wb--detail' : ''}" style="margin:0 calc(var(--ws-gutter) * -1)">
      <div class="wb__queue" role="listbox" aria-label="REVIEW QUEUE"><div class="wb__pane-h"><span class="ws-label">QUEUE · OLDEST FIRST</span><span class="ws-meta">${kbd('J')} ${kbd('K')}</span></div>${REVIEWS.map((x, i) => qItem(x, i === sel)).join('')}</div>
      <div class="wb__ctx"><div class="wb__pane-h" style="background:#fff"><span class="ws-label">CONTEXT · ${r.type}</span>${btn('OPEN RECORD', { tone: 'ghost', size: 'xs', ic: 'external' })}</div>${reviewContext(r)}</div>
      <div class="wb__dec">${decision({ r, state })}</div>
    </div>
    ${detail ? `<div class="wb-mbar">${btn('REQUEST REVISION', { tone: 'out', size: 'sm' })}${btn('APPROVE INTAKE', { block: true, arrow: true })}</div>` : ''}</div>`;
}

// ═══ 04 OPERATIONS · STANDARD (production workbench) ══════════════════════════
export const STAGES = ['DETAILS RECEIVED', 'DOMAIN', 'PROFESSIONAL EMAIL', 'DNS + SECURITY', 'DEVICE + SIGNATURE', 'FINAL VERIFICATION', 'FOUNDATION COMPLETE'];
export const stageRail = (cur = 3, blocked = -1) =>
  `<ol class="stages" style="margin:0;padding:0;list-style:none" aria-label="STAGES · ${cur + 1} OF 7">${STAGES.map((l, i) => `<li class="stg ${i < cur ? 'stg--done' : i === cur ? (blocked === i ? 'stg--cur' : 'stg--cur') : ''}" ${i === cur ? 'aria-current="step"' : ''} title="${l}"><b>${String(i + 1).padStart(2, '0')}</b><span>${l}</span></li>`).join('')}</ol>`;

export const TASKS = [
  { t: 'MX RECORDS', s: 'MX_CONFIGURE · DEPENDS ON MAILBOX', mode: 'ASSISTED', box: 'done', st: ['done', 'COMPLETE'] },
  { t: 'SPF RECORD', s: 'SPF_CONFIGURE', mode: 'ASSISTED', box: 'done', st: ['done', 'COMPLETE'] },
  { t: 'DKIM RECORD', s: 'DKIM_CONFIGURE · PROVIDER KEY NEEDED', mode: 'EXTERNAL MANUAL', box: '', st: ['work', 'IN PROGRESS'] },
  { t: 'DMARC POLICY', s: 'DMARC_CONFIGURE', mode: 'ASSISTED', box: '', st: ['idle', 'READY'] },
  { t: 'APPROVE DNS CHANGE', s: 'APPROVE_DNS_CHANGE · CLIENT ACTION', mode: 'CLIENT ACTION', box: 'wait', st: ['client', 'WAITING ON CLIENT'] },
  { t: 'DNS VERIFICATION', s: 'MX · SPF · DKIM · DMARC MUST PASS', mode: 'VERIFICATION', box: 'wait', st: ['idle', '2 DEPENDENCIES'] },
];
const modeCls = (m) => (m === 'CLIENT ACTION' ? 'client' : m === 'VERIFICATION' ? 'verify' : '');
export const taskRow = (t, sel) =>
  `<div class="task ${sel ? 'task--sel' : ''}" role="row"><span class="task__box ${t.box ? `task__box--${t.box}` : ''}" aria-hidden="true">${t.box === 'done' ? CHECK : ''}</span><span class="task__t"><b>${t.t}</b><span>${t.s}</span></span><span class="task__s"><span class="ws-mode ws-mode--${modeCls(t.mode)}">${t.mode}</span>${st(t.st[0], t.st[1])}</span></div>`;

export function operations({ sel = 2 } = {}) {
  const proj = (c, stage, k, selp, cur) => `<div class="proj ${selp ? 'proj--sel' : ''}">${plate(c.name, { attn: k === 'blocked', size: 'sm' })}<span class="ws-who"><b>${c.name}</b><span>${stage}</span></span>${st(k, k === 'blocked' ? 'BLOCKED' : k === 'client' ? 'CLIENT' : 'SITE 00')}${seg(cur, k)}</div>`;
  return `<div class="ws-page">${phead({ n: '04', title: 'OPERATIONS', sub: '3 ACTIVE RUNBOOKS · 1 BLOCKED · 0 IN VERIFICATION', acts: `${segctl(['ACTIVE · 3', 'BLOCKED · 1', 'VERIFY · 0'])}`, mHideActs: false })}
    <div class="ops">
      <section class="ops__proj" aria-label="ACTIVE RUNBOOKS"><div class="ws-sechead"><h2 class="ws-h3">RUNBOOKS</h2><span class="ws-meta">BY NEXT DUE</span></div><div class="proj-list ws-panel" style="border-bottom:0">${proj(FE, '04 DNS + SECURITY', 'work', true, 5)}${proj(V, '02 DOMAIN · REGISTRAR', 'blocked', false, 5)}${proj(SW, '01 DETAILS · AWAITING PAYMENT', 'client', false, 4)}</div></section>
      <section class="ops__main" aria-label="FIELD & EMBER RUNBOOK">
        <div class="ws-panel"><div class="ws-panel__h"><span class="ws-ident">${plate('Field & Ember', { size: 'sm' })}<span class="ws-who"><b>FIELD & EMBER</b><span>RUNBOOK V1 · 11 OF 17 TASKS · PROJECTED OCT 24</span></span></span><span class="ws-btn-row" style="gap:6px">${chip('muted', 'GOOGLE WORKSPACE')}${chip('muted', 'DNS · GODADDY')}</span></div><div class="ws-panel__b">${stageRail(3)}</div></div>
        <div class="ws-panel" style="margin-top:var(--ws-gap)"><div class="ws-panel__h"><h3 class="ws-h3">04 DNS + SECURITY</h3>${segctl(['TASKS', 'DEPENDENCIES', 'VERIFICATION'])}</div><div role="table" aria-label="TASKS">${TASKS.map((t, i) => taskRow(t, i === sel)).join('')}</div></div>
      </section>
      <aside class="ops__side">
        ${panel('COMPLETION GATE', ['TASKS_INCOMPLETE · 6', 'VERIFICATION_REQUIRED', 'OWNERSHIP_RECORD_MISSING'].map((t) => `<div class="ws-act" style="grid-template-columns:10px minmax(0,1fr);padding:7px 0">${mk('blocked')}<p class="ws-data" style="text-transform:uppercase">${t}</p></div>`).join(''), { right: chip('req', '3 REASONS') })}
        ${panel('CLIENT ACTIONS', `${st('client', 'APPROVE DNS CHANGE')}<p class="ws-meta" style="margin:8px 0 0">REQUESTED 2H AGO · VISIBLE IN THE CLIENT PORTAL</p>`, { right: '<span class="ws-meta">1 OPEN</span>' })}
        ${panel('VERIFICATION', [['MX_MATCHES_EXPECTED', 'ok', 'PASS'], ['SPF_MATCHES_EXPECTED', 'ok', 'PASS'], ['DKIM_PRESENT', 'unver', 'NOT RUN'], ['DMARC_PRESENT', 'unver', 'NOT RUN']].map(([t, k, l]) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:6px 0"><span class="ws-meta ws-1l" style="color:var(--ws-ink)">${t}</span>${chip(k, l)}</div>`).join(''), { right: '<span class="ws-meta">4 OF 12</span>' })}
      </aside>
    </div></div>`;
}

export function taskInspector() {
  return `${inspHead('TASK · 04 DNS + SECURITY', `<h2 class="ws-h2">DKIM RECORD<i class="ws-period"></i></h2><div class="ws-btn-row" style="margin-top:10px"><span class="ws-mode">EXTERNAL MANUAL</span>${st('work', 'IN PROGRESS')}</div>`, { ext: false })}
  <div class="ws-insp__body">${kv([['TASK KEY', 'DKIM_CONFIGURE', true], ['STARTED', 'TODAY 09:12'], ['DEPENDS ON', 'PRIMARY MAILBOX · COMPLETE'], ['UNBLOCKS', 'DNS VERIFICATION']])}
    <div><span class="ws-label">INSTRUCTIONS · INTERNAL ONLY</span><p class="ws-meta" style="line-height:1.6;margin:8px 0 0;color:var(--ws-ink-2)">GENERATE THE DKIM KEY IN THE EMAIL PROVIDER, ADD THE TXT RECORD AT THE DNS HOST, THEN MARK COMPLETE. VERIFICATION RUNS AFTER COMPLETION.</p></div>
    ${field({ label: 'SELECTOR', value: 'google', data: true })}</div>
  <div class="ws-insp__foot">${btn('MARK COMPLETE', { block: true })}${btn('BLOCK', { tone: 'out', ic: 'blocked', attrs: 'data-anchor="block"' })}</div>`;
}

// ═══ 05 CORRESPONDENCE · STANDARD (index / thread / context) ═════════════════
const THREADS = [
  [V, 'WE NEED REGISTRAR ACCESS TO CONTINUE', ['client', 'AWAITING REPLY'], '4D'],
  [FE, 'DKIM IS LIVE — CHECK YOUR INBOX TOMORROW', ['work', 'YOU · SENT'], '40M'],
  [C, 'YOUR QUOTE IS BEING PREPARED', ['done', 'READ'], '3H'],
  [N, 'YOUR RECORDS ARE READY', ['done', 'READ'], 'OCT 09'],
];

export function correspondence({ sel = 0, detail = false, view = 0 } = {}) {
  const idx = THREADS.map(([c, line, s, w], i) => `<div class="q-item ${i === sel ? 'q-item--sel' : ''}">${plate(c.name, { size: 'sm' })}<span class="ws-who"><b>${c.name}</b><span>${line}</span></span><span class="ws-meta">${w}</span><span class="q-item__why">${st(s[0], s[1])}</span></div>`).join('');
  const msg = (me, who, when, text) => `<div class="msg ${me ? 'msg--me' : ''}"><span class="ws-label">${who} · ${when}</span><p class="ws-read" style="margin-bottom:0">${text}</p></div>`;
  const thread = `<div class="thread">${msg(true, 'SITE 00', 'OCT 15', 'We need access to your registrar to connect the domain. You can approve it from your portal, or reply here and we will walk you through it.')}${msg(false, 'CLIENT · VELA BOUTIQUE', 'OCT 15', 'Thanks — I will find the login this week. Is it the same account I use for the website?')}${msg(true, 'SITE 00', '4D AGO', 'Reminder: the domain step is waiting on registrar access. Everything else is ready.')}</div>`;
  const context = `<div class="ctx-sec">${ident(V, { size: '' })}</div><div class="ctx-sec">${kv([['EMAIL', 'shop@velaboutique.invalid', true], ['STAGE', '02 DOMAIN · BLOCKED'], ['PREFERENCES', 'PORTAL + EMAIL'], ['LAST EMAIL', 'DRY RUN · SEND OFF']])}</div><div class="ctx-sec">${banner('EMAIL SENDING IS DISABLED BY POLICY ON STAGING. PORTAL MESSAGES ARE UNAFFECTED.', { tone: 'policy', ic: 'lock' })}</div>`;
  return `<div class="ws-page ws-page--flush">${phead({ n: '05', title: 'CORRESPONDENCE', sub: 'PORTAL MESSAGES · INVITATIONS · LIFECYCLE EMAIL', acts: btn('TEMPLATES · STUDIO', { tone: 'out', size: 'sm', ic: 'external' }), mHideActs: true })}
    <div style="padding-bottom:12px">${tabs(['MESSAGES', 'INVITATIONS', 'LIFECYCLE EMAIL', 'DELIVERY'], view, { label: 'CORRESPONDENCE VIEWS' })}</div>
    <div class="wb ${detail ? 'wb--detail' : ''}" style="margin:0 calc(var(--ws-gutter) * -1)">
      <div class="wb__queue"><div class="wb__pane-h"><span class="ws-label">THREADS · 4</span>${btn('FILTER', { tone: 'ghost', size: 'xs', ic: 'filter' })}</div>${idx}</div>
      <div class="wb__ctx" style="display:flex;flex-direction:column"><div class="wb__pane-h" style="background:#fff"><span class="ws-ident">${plate('Vela Boutique', { size: 'xs' })}<span class="ws-label" style="color:var(--ws-ink)">VELA BOUTIQUE · PORTAL</span></span><span class="ws-meta">3 MESSAGES</span></div><div style="flex:1 1 auto;overflow:auto">${thread}</div><div class="composer"><span class="ws-input ws-input--ph">WRITE A MESSAGE</span>${btn('SEND', { arrow: true })}</div></div>
      <div class="wb__dec">${context}</div>
    </div></div>`;
}

export function lifecycle() {
  const rows = [
    [AV, 'PERSONAL FOUNDATION INVITATION', 'ARTIFACT_CREATED', ['policy', 'DRY RUN'], '5H'],
    [H, 'INTAKE COMPLETED', 'INTAKE_COMPLETED', ['policy', 'DRY RUN'], '1D'],
    [C, 'QUOTE READY', 'QUOTE_CREATED', ['policy', 'DRY RUN'], '3H'],
    [SYNTH, 'PERSONAL FOUNDATION INVITATION', 'ARTIFACT_CREATED', ['ok', 'DELIVERED'], '2D'],
    [SYNTH, 'QUOTE READY', 'QUOTE_CREATED', ['fail', 'BOUNCED'], '2D'],
  ];
  return `<div class="ws-page">${phead({ n: '05', title: 'CORRESPONDENCE', sub: 'LIFECYCLE EMAIL · 5 RECORDED' })}${tabs(['MESSAGES', 'INVITATIONS', 'LIFECYCLE EMAIL', 'DELIVERY'], 2)}
    <div style="margin-top:14px">${banner('EMAIL SENDING IS DISABLED BY POLICY ON STAGING (SITE00_DF_TRANSACTIONAL_EMAIL_SEND OFF). LIFECYCLE EMAILS ARE RECORDED AS DRY RUN.', { tone: 'policy', ic: 'lock' })}</div>
    <div class="ws-panel" style="margin-top:14px;overflow:auto"><table class="lc-table"><thead><tr><th>CLIENT</th><th>TEMPLATE</th><th>TRIGGER</th><th>STATUS</th><th style="text-align:right">WHEN</th></tr></thead><tbody>${rows
      .map(([c, t, tr, [k, s], w], i) => `<tr style="${i === 0 ? 'box-shadow:inset 2px 0 0 var(--ws-red)' : ''}"><td>${ident(c, { size: 'xs', sub: c.test ? 'TEST CLIENT' : c.cat })}</td><td>${t}</td><td><span class="ws-data ws-meta">${tr}</span></td><td>${chip(k, s)}</td><td class="ws-meta" style="text-align:right">${w}</td></tr>`)
      .join('')}</tbody></table></div></div>`;
}

// ═══ 06 SYSTEM · COMPACT CONSOLE ═════════════════════════════════════════════
export const MODULES = [
  { ic: 'domain', t: 'EMAIL DOMAIN · DKIM', cat: 'INTEGRATIONS', c: ['req', 'NEEDS FOUNDER'], p: 'GODADDY DKIM + RESEND DOMAIN · MANUAL CHECK', when: '4 MIN' },
  { ic: 'api', t: 'API HEALTH', cat: 'STACK', c: ['unver', 'UNVERIFIED'], p: 'NO HEALTH PROBE IN THE READINESS REPORT YET (G-08)', when: '—' },
  { ic: 'payment', t: 'STRIPE WEBHOOK', cat: 'INTEGRATIONS', c: ['unver', 'UNVERIFIED'], p: 'KEY MODE BY PREFIX = TEST · WEBHOOK PROBE NOT RUN (G-08)', when: '—' },
  { ic: 'email', t: 'EMAIL SENDING', cat: 'INTEGRATIONS', c: ['policy', 'DISABLED BY POLICY', 'lock'], p: 'TRANSACTIONAL SEND FLAG OFF · ALLOWLIST ONLY WHEN ON', when: '4 MIN' },
  { ic: 'server', t: 'STAGING STACK', cat: 'STACK', c: ['ok', 'ISOLATED'], p: 'FRONTEND + API ORIGINS MATCH · SUPABASE REF = STAGING', when: '4 MIN' },
  { ic: 'database', t: 'PERSISTENCE', cat: 'STACK', c: ['ok', 'FLAG ON'], p: 'DURABLE ARTIFACTS + TOKENS · EVENTS NOT YET PERSISTED (G-03)', when: '4 MIN' },
  { ic: 'security', t: 'DATABASE SECURITY', cat: 'SECURITY', c: ['ok', 'ANON DENIED'], p: 'RLS PROBE ON PROJECT MESSAGES · SERVICE ROLE ALLOWED', when: '4 MIN' },
  { ic: 'checklist', t: 'E2E TEST MODE', cat: 'TEST LAB', c: ['test', 'SYNTHETIC ONLY'], p: 'FOUNDER TEST MODE ON · LIVE E2E NOT AUTHORIZED', when: '4 MIN' },
];

export function system({ sel = 3, tab = 0 } = {}) {
  const rows = MODULES.map(
    (m, i) => `<div class="con__r ${i === sel ? 'con__r--sel' : ''}" role="row">${icon(m.ic)}<span class="con__t"><b>${m.t}</b><span>${m.p}</span></span><span class="c-stat">${chip(m.c[0], m.c[1], m.c[2])}</span><span class="c-cat ws-label">${m.cat}</span><span class="c-detail">${m.p}</span><span class="c-checked">${m.when}</span></div>`,
  );
  return `<div class="ws-page">${phead({ n: '06', title: 'SYSTEM', sub: 'STAGING · <span class="ws-data">carefree-luck</span> · <span class="ws-data">reliable-creation</span> · REPORT 4 MIN AGO', archHtml: arch('corner', 'right:0;top:14px;width:112px;height:84px;opacity:.85') })}
    ${tabs(['OVERVIEW', 'STACK', 'INTEGRATIONS', 'SECURITY', 'TEST LAB', 'READINESS REPORT'], tab, { label: 'SYSTEM VIEWS' })}
    <div class="sys-grid" style="margin-top:var(--ws-gap)"><div style="display:flex;flex-direction:column;gap:var(--ws-gap);min-width:0">
      <section class="verdict" aria-label="READINESS VERDICT"><div><span class="ws-label">OVERALL · READINESS REPORT</span><p class="ws-statement" style="margin-top:8px;font-size:min(var(--ws-fs-statement),26px)">ACTION REQUIRED — 1 ITEM NEEDS YOU<i class="ws-period"></i></p></div><div class="verdict__chips">${chip('req', '1 NEEDS FOUNDER')}${chip('unver', '2 UNVERIFIED')}${chip('policy', '1 POLICY')}${chip('ok', '4 READY')}${btn('RE-RUN REPORT', { tone: 'out', size: 'xs', ic: 'retry' })}</div></section>
      <div class="con" role="table" aria-label="MODULES · STATUS FIRST"><div class="con__h" role="row"><span></span><span>MODULE</span><span class="c-stat">STATUS</span><span class="c-cat">AREA</span><span class="c-detail">DETAIL</span><span class="c-checked" style="text-align:right">CHECKED</span></div>${rows.join('')}</div>
      <div class="ws-meta">API BUILD <span class="ws-data">392ac76 · founder-readiness-e2e-v1</span> · ENVIRONMENT NAMES ONLY · NO SECRET VALUES ARE EVER SHOWN</div>
    </div>
    <aside class="sys-aside" style="display:flex;flex-direction:column;gap:var(--ws-gap)">${panel('ATTENTION ORDER', `${act('1', 'founder', 'EMAIL DOMAIN · DKIM', 'CONFIRM GODADDY DKIM + RESEND DOMAIN')}${act('2', 'idle', 'API HEALTH', 'PROBE NOT AVAILABLE (G-08)')}${act('3', 'idle', 'STRIPE WEBHOOK', 'PROBE NOT AVAILABLE (G-08)')}`)}</aside></div></div>`;
}

export function moduleInspector() {
  return `${inspHead('DIAGNOSTICS · EMAIL', `<h2 class="ws-h2">EMAIL SENDING<i class="ws-period"></i></h2><div style="margin-top:10px">${chip('policy', 'DISABLED BY POLICY', 'lock')}</div>`, { ext: false })}
  <div class="ws-insp__body"><div><span class="ws-label">SUMMARY</span><p class="ws-meta" style="line-height:1.6;margin:8px 0 0;color:var(--ws-ink-2)">TRANSACTIONAL SENDING IS OFF. LIFECYCLE EMAILS ARE RECORDED AS DRY RUN. WHEN ON, ONLY ALLOWLISTED SYNTHETIC CLIENTS RECEIVE MAIL.</p></div>
    <div><span class="ws-label">CHECKS</span><div style="margin-top:6px">${[
      ['SEND FLAG', 'policy', 'OFF'],
      ['RESEND KEY', 'ok', 'PRESENT'],
      ['WEBHOOK SECRET', 'ok', 'PRESENT'],
      ['FROM / REPLY-TO', 'ok', 'SET'],
      ['FOUNDER ALLOWLIST', 'ok', '1 ADDRESS'],
      ['GODADDY DKIM + DOMAIN', 'req', 'NEEDS FOUNDER'],
      ['LIVE DELIVERY', 'unver', 'UNVERIFIED'],
    ]
      .map(([t, k, l]) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;min-height:36px;border-bottom:1px solid var(--ws-hair)"><span class="ws-meta ws-1l" style="color:var(--ws-ink)">${t}</span>${chip(k, l)}</div>`)
      .join('')}</div></div>
    <details open style="border:1px solid var(--ws-rule);padding:10px 12px"><summary class="ws-label" style="cursor:pointer">ENVIRONMENT · NAMES ONLY</summary><div style="margin-top:8px;display:grid;gap:6px">${['SITE00_DF_TRANSACTIONAL_EMAIL_SEND', 'RESEND_API_KEY', 'RESEND_WEBHOOK_SECRET', 'SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST'].map((n) => `<span style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px"><span class="ws-data--nowrap ws-meta" style="color:var(--ws-ink)" title="${n}">${n}</span><span class="ws-meta">${n.includes('_SEND') ? 'NOT SET' : 'CONFIGURED'}</span></span>`).join('')}</div></details></div>
  <div class="ws-insp__foot">${btn('RE-RUN READINESS REPORT', { block: true, tone: 'out', ic: 'retry' })}</div>`;
}

// ═══ TEST LAB · COMPACT ══════════════════════════════════════════════════════
export function testlab() {
  const step = (n, t, s, b, k = 'idle') => `<div class="task" role="row"><span class="ws-idx">${n}</span><span class="task__t"><b>${t}</b><span style="text-transform:uppercase">${s}</span></span><span class="task__s">${st(k, k === 'done' ? 'DONE' : k === 'founder' ? 'NEXT' : 'WAITING')}${b}</span></div>`;
  return `<div class="ws-page">${phead({ n: '06', title: 'TEST LAB', sub: 'SYNTHETIC CLIENTS ONLY · STAGING · NOTHING HERE TOUCHES REAL CLIENTS', acts: btn('RESET TEST DATA…', { tone: 'danger', size: 'sm', attrs: 'data-anchor="reset"' }) })}
    ${tabs(['OVERVIEW', 'STACK', 'INTEGRATIONS', 'SECURITY', 'TEST LAB', 'READINESS REPORT'], 4)}
    <div class="lab" style="margin-top:var(--ws-gap)">
      ${panel('SYNTHETIC CLIENT', `<div style="display:grid;gap:12px">${ident(SYNTH, { size: 'sm', sub: 'TEST CLIENT · INTAKE IN PROGRESS' })}${kv([['RECIPIENT', 'founder-test@site00.invalid', true], ['CREATED', 'TODAY 08:40'], ['LINK', '/foundation/te57…k1Q', true]])}<div class="ws-btn-row">${btn('OPEN CLIENT LINK', { tone: 'out', size: 'sm', ic: 'external' })}${btn('CREATE TEST CLIENT', { size: 'sm', ic: 'add' })}</div></div>`, { right: chip('test', 'SYNTHETIC') })}
      ${panel('JOURNEY', `${step('01', 'PREPARE TEST INVITATION', 'INVITATION RECORDED · DRY RUN', btn('RUN', { tone: 'out', size: 'xs' }), 'done')}${step('02', 'SUBMIT INTAKE (TEST)', 'ADVANCE-TEST-INTAKE · FICTIONAL 202-555-0143', btn('RUN', { size: 'xs' }), 'founder')}${step('03', 'QUOTE READY + QUEUE EMAIL', 'QUEUES THE LIFECYCLE EMAIL · GATED SEND', btn('RUN', { tone: 'out', size: 'xs' }))}`, { flush: true, right: '<span class="ws-meta">STEP 2 OF 3</span>' })}
      ${panel('EMAIL EVENTS', `${act('2D', 'work', 'INVITATION · DELIVERED', 'RESEND · ALLOWLISTED')}${act('2D', 'blocked', 'QUOTE READY · BOUNCED', 'RESEND · HARD BOUNCE')}<div style="margin-top:10px" class="ws-btn-row">${btn('SEND TEST', { tone: 'out', size: 'sm', attrs: 'data-anchor="sendtest"' })}<span class="ws-meta">NEEDS THE APPROVAL TICK (FD-W16)</span></div>`, { right: `<span class="ws-meta">${gap('G-09')}</span>` })}
      ${panel('CONTINUITY CHECKS', ['RESTART · ARTIFACT SURVIVES', 'LINK RESOLVES AFTER RESTART', 'INTAKE RESUMES FROM SAVE'].map((t) => `<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;min-height:36px;border-bottom:1px solid var(--ws-hair)"><span class="ws-meta ws-1l" style="color:var(--ws-ink)">${t}</span>${chip('unver', 'UNVERIFIED')}</div>`).join(''), { right: '<span class="ws-meta">FD-W18</span>' })}
    </div></div>`;
}

export function reviewInspectorLite(r = REVIEWS[0]) {
  return `${inspHead(`${r.type} REVIEW`, ident(r.c, { size: '' }))}<div class="ws-insp__body">${st(r.k, r.why)}${reviewContext(r)}</div><div class="ws-insp__foot">${btn('OPEN FULL REVIEW', { block: true, arrow: true })}</div>`;
}

export function emailInspector() {
  return `${inspHead('LIFECYCLE EMAIL · PREVIEW', `<h2 class="ws-h2">PERSONAL FOUNDATION INVITATION<i class="ws-period"></i></h2>`, { ext: false })}
  <div class="ws-insp__body">${kv([['TO', 'jo***@avery-studio.invalid', true], ['FROM', 'hello@site00.com', true], ['SUBJECT', 'YOUR DIGITAL FOUNDATION IS READY'], ['STATUS', 'DRY RUN · SEND FLAG OFF']])}
    <div style="height:180px;border:1px solid var(--ws-rule);background:linear-gradient(180deg,#fff,#f3f2ef);display:flex;align-items:center;justify-content:center" class="ws-meta">FNDATN-01 · 01 INVITATION · RENDERED PREVIEW</div>
    ${banner('SEND IS UNAVAILABLE: NOT A SYNTHETIC CLIENT · SEND FLAG OFF', { tone: 'policy', ic: 'lock' })}</div>
  <div class="ws-insp__foot"><button class="ws-btn ws-btn--off ws-btn--block" disabled>${icon('lock')}<span>SEND DISABLED BY POLICY</span></button></div>`;
}

export { PLUS };

// ═══ COMPONENT GALLERY (measured live at the iframe's tier) ═══════════════════
export function components({ set = 'all' } = {}) {
  const T = [
    ['ws-title', 'DIGITAL FOUNDATION', 'TITLE · DISPLAY 900'],
    ['ws-h2', 'CREATE A FOUNDATION', 'H2 · DISPLAY 900'],
    ['ws-statement', 'INTAKE COMPLETE — READY FOR REVIEW', 'STATEMENT · DISPLAY 900'],
    ['ws-num', '12', 'NUMERAL · DISPLAY 900'],
    ['ws-name', 'HORIZON FREIGHT', 'NAME · SAIRA 700'],
    ['ws-body', 'CONNECT A DOMAIN I OWN', 'BODY · SAIRA 600'],
    ['ws-label', 'NEXT ACTION · FOUNDER', 'LABEL · SAIRA 700'],
    ['ws-meta', 'STEP 3 OF 8 · RECOMMEND', 'META · SAIRA 500'],
    ['ws-read', 'We need access to your registrar to connect the domain.', 'READING · SAIRA 400 · USER TEXT'],
  ];
  const type = `<section class="ws-panel"><div class="ws-panel__h"><h2 class="ws-h3">TYPE SCALE · MEASURED</h2><span class="ws-meta" data-vw></span></div><div class="ws-panel__b" style="display:grid;gap:4px">${T.map(
    ([c, t, l]) => `<div class="ty-row"><span class="${c} ${c === 'ws-num' ? '' : ''}" data-measure style="${c === 'ws-num' ? 'font-size:var(--ws-fs-num)' : ''}">${t}</span><span class="ws-meta"><b class="ws-ink">${l}</b><br><span data-out></span></span></div>`,
  ).join('')}</div></section>`;
  const buttons = panel('BUTTONS', `<div class="ws-btn-row">${btn('REVIEW INTAKE', { arrow: true })}${btn('NEW FOUNDATION', { tone: 'red', ic: 'add' })}${btn('OPEN QUOTE', { tone: 'out' })}${btn('CANCEL', { tone: 'ghost' })}${btn('SET BLOCKER', { tone: 'danger' })}<button class="ws-btn ws-btn--busy"><span>SAVING…</span></button><button class="ws-btn ws-btn--off" disabled><span>MARK COMPLETE</span></button></div><div class="ws-btn-row" style="margin-top:10px">${btn('FILTER', { tone: 'out', size: 'sm', ic: 'filter' })}${btn('COPY', { tone: 'ghost', size: 'xs', ic: 'link' })}${btn('MORE', { tone: 'out', only: true, ic: 'more' })}${btn('COPY LINK', { tone: 'out', size: 'sm', only: true, ic: 'link' })}</div>`);
  const status = panel('STATUS · CHIPS · COUNTS', `<div style="display:flex;flex-wrap:wrap;gap:14px 22px;align-items:center">${st('founder', 'INTAKE COMPLETE')}${st('client', 'AWAITING CLIENT')}${st('work', 'SETUP · DNS + SECURITY')}${st('blocked', 'BLOCKED · DOMAIN ACCESS')}${st('done', 'COMPLETE')}${st('idle', 'READY')}${st('test', 'SYNTHETIC')}</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">${chip('ok', 'READY')}${chip('req', 'NEEDS FOUNDER')}${chip('policy', 'DISABLED BY POLICY', 'lock')}${chip('unver', 'UNVERIFIED')}${chip('fail', 'BOUNCED')}${chip('test', 'TEST MODE')}${chip('warn', 'STALE')}${chip('muted', 'DNS · GODADDY')}${count(4)}${count(12, 'ink')}</div>`);
  const ident_ = panel('IDENTITY · PROGRESS', `<div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">${plate('Horizon Freight', { attn: true, size: 'lg' })}${plate('Horizon Freight', { attn: true })}${plate('Carter & Lane', { size: 'sm' })}${plate('Atelier Bloom', { size: 'xs' })}${plate('SYNTH · Founder E2E Client', { test: true })}${ident(H, { size: 'sm' })}</div><div style="margin-top:16px;display:grid;gap:18px">${seg(2, 'founder', 'ws-seg--w')}${journey(2, { dates: ['OCT 10', 'OCT 14', 'TODAY', '', '', '', '', ''] })}${journey(5, { kind: 'blocked', abbr: true })}</div>`);
  const nav = panel('NAVIGATION', `${tabs(STATUS_VIEWS, 1)}<div style="margin-top:14px">${segctl(['ACTIVE · 3', 'BLOCKED · 1', 'VERIFY · 0'])}</div>`);
  const fields = panel('FIELDS · FD-1…FD-6 APPROVED', `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">${field({ label: 'BUSINESS NAME', value: 'Harbor & Pine', data: true })}${field({ label: 'CONTACT EMAIL', value: 'jo@harborpine.invalid', data: true, state: 'focus' })}${field({ label: 'CONTACT NUMBER', ph: 'ENTER PHONE NUMBER', req: true, err: 'ENTER A CONTACT NUMBER' })}${field({ label: 'REFERRAL SOURCE', value: 'DIRECT', opt: true, state: 'ro' })}</div>`);
  const density = `<section class="ws-panel"><div class="ws-panel__h"><h2 class="ws-h3">DENSITY · ROW RHYTHM</h2><span class="ws-meta">RELAXED · STANDARD · COMPACT</span></div><div class="ws-panel__b" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px">${['relaxed', 'standard', 'compact']
    .map((d) => `<div class="ws-${d}" style="container-type:inline-size"><div class="ws-label" style="margin-bottom:6px">${d.toUpperCase()} · <span data-row></span></div>${TASKS.slice(1, 4).map((t) => taskRow(t)).join('')}</div>`)
    .join('')}</div></section>`;
  const blocks = { type, buttons, status, ident: ident_, nav, fields, density };
  const pick = set === 'all' ? Object.keys(blocks) : set.split(',');
  return `<div class="ws-page" style="padding-top:20px;display:grid;gap:18px">${pick.map((k) => blocks[k]).join('')}</div>`;
}
