// Page composers for the six destinations (mobile + desktop). Fictional DEMO identities only.
import { DF, icon, CHEV, ARROW, PLUS, CHECK, mk, status, chip, btn, plate, seg, journey, tabs, segctl, kv, nrow, act, field, mhead, mtitle, topbar, arch, money, PHASES } from './fw-kit.js';
import { DEMO, SYNTH, segFor, mRow, dTable, clientInspector, signals, focusBlock, REVIEWS, reviewItem, STAGES, stageRail, TASKS, taskRow, MODULES, moduleCard } from './fw-parts.js';

const H = DEMO[0]; // Horizon Freight — the running example (intake complete, founder review)
const A = DEMO[2]; // Atelier Bloom — client move (intake in progress)

export const deskTitle = (title, sub, archHtml = '', right = '') =>
  `<div class="fw-deskhead" style="min-height:112px">${archHtml}<div><h1 class="fw-h1 fw-h1--desk">${title}<i></i></h1>${sub ? `<div class="fw-sub" style="margin-top:12px">${sub}</div>` : ''}</div>${right}</div>`;

// ═══ 01 OVERVIEW ════════════════════════════════════════════════════════════
export function mOverview({ scroll = 0 } = {}) {
  return `<div style="margin-top:-${scroll}px">${mhead()}${mtitle({ n: '01', title: 'DIGITAL<br>FOUNDATION', sub: 'CLIENTS · PROGRESS · NEXT ACTIONS', arch: arch('crown', 'right:-10px;top:0;width:128px;height:228px') })}
  <div class="fw-mbody fw-col fw-gap14">
    ${focusBlock(H, { compact: true })}
    ${signals()}
    <div class="fw-between fw-mt8"><span class="fw-h3">ACTIVE WORK</span><span class="fw-meta">ALL FOUNDATIONS →</span></div>
    <div class="fw-list">${mRow(DEMO[1])}${mRow(A)}${mRow(DEMO[4])}</div>
    <div class="fw-between fw-mt8"><span class="fw-h3">RECENT MOVEMENT</span><span class="fw-meta">TODAY</span></div>
    <div>${act('40M', 'work', 'FIELD & EMBER', 'SPF RECORD COMPLETED')}${act('2H', 'client', 'ATELIER BLOOM', 'INTAKE SAVED · BUSINESS INFORMATION')}${act('3H', 'founder', 'CARTER & LANE', 'QUOTE V2 CREATED · AWAITING APPROVAL')}${act('1D', 'founder', 'HORIZON FREIGHT', 'INTAKE COMPLETED')}</div>
    <div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">NEXT MILESTONE</span><span class="fw-meta">FIELD & EMBER</span></div><div class="fw-panel__b fw-col fw-gap10">${stageRail(STAGES.slice(2, 6))}<span class="fw-meta">04 DNS + SECURITY · 2 OF 6 TASKS LEFT</span></div></div>
  </div></div>`;
}

export function dOverview() {
  return `${topbar({ n: '01', title: 'OVERVIEW' })}
  <div class="fw-stage">
    ${deskTitle('DIGITAL FOUNDATION', 'CLIENTS · PROGRESS · NEXT ACTIONS', arch('hero', 'right:0;top:-18px;width:260px;height:208px'), '')}
    <div style="display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:22px;margin-top:22px">
      <div class="fw-col fw-gap14">
        ${focusBlock(H)}
        <div class="fw-panel"><div class="fw-panel__h"><span class="fw-h3">NEEDS YOU</span><span class="fw-meta">3 DECISIONS · OLDEST FIRST</span></div>
          <div class="fw-panel__b" style="padding-top:2px;padding-bottom:2px">${REVIEWS.slice(1)
            .map((r) => `<div class="fw-row">${plate(r.c.name, { attn: !r.exc, size: 'sm' })}<div class="fw-who"><b>${r.c.name}</b><span>${r.type} · ${r.why}</span></div><span class="fw-row-flex"><span class="fw-meta">${r.when}</span>${CHEV}</span></div>`)
            .join('')}</div></div>
      </div>
      <div class="fw-col fw-gap14">
        ${signals(-1)}
        <div class="fw-panel"><div class="fw-panel__h"><span class="fw-h3">RECENT MOVEMENT</span><span class="fw-meta">VIEW ALL →</span></div><div class="fw-panel__b" style="padding-top:2px">
          ${act('40M', 'work', 'FIELD & EMBER', 'SPF RECORD COMPLETED')}${act('2H', 'client', 'ATELIER BLOOM', 'INTAKE SAVED')}${act('3H', 'founder', 'CARTER & LANE', 'QUOTE V2 CREATED')}${act('5H', 'client', 'AVERY STUDIO', 'INVITATION LINK CREATED')}${act('1D', 'founder', 'HORIZON FREIGHT', 'INTAKE COMPLETED')}</div></div>
      </div>
    </div>
    <div class="fw-between fw-mt20"><span class="fw-h3">ACTIVE WORK</span><span class="fw-meta">6 ACTIVE · ALL FOUNDATIONS →</span></div>
    <div class="fw-mt8">${dTable([DEMO[1], A, DEMO[4]], -1)}</div>
  </div>`;
}

// ═══ 02 FOUNDATIONS ═════════════════════════════════════════════════════════
export const STATUS_VIEWS = [['ALL', ''], ['INVITED', ''], ['INTAKE', ''], ['REVIEW', '3'], ['QUOTE', ''], ['ACTIVE', ''], ['COMPLETE', '']];

export function mRegistry({ on = 0, rows = DEMO.slice(0, 6), search = '', sel = -1 } = {}) {
  return `${mhead()}${mtitle({ n: '02', title: 'FOUNDATIONS', sub: '' })}
  <div style="padding:0 16px">
    <div class="fw-row-flex"><span class="fw-search ${search ? 'fw-search--focus' : ''}" style="flex:1">${icon('search')}${search ? `<span class="fw-data" style="color:var(--fw-ink);font-size:11px">${search}</span>` : 'SEARCH NAME, EMAIL, DOMAIN'}</span><span class="fw-btn fw-btn--out" style="width:40px;height:36px;padding:0">${icon('filter', '', 'style="width:16px;height:16px"')}</span></div>
    <div class="fw-mt8">${tabs(STATUS_VIEWS.slice(0, 5), on)}</div>
    <div class="fw-list" style="border-top:0">${rows.map((c, i) => mRow(c, { sel: i === sel })).join('')}</div>
  </div>`;
}

export function dRegistry({ sel = 0, rows = DEMO, toolbarExtra = '' } = {}) {
  return `${topbar({ n: '02', title: 'FOUNDATIONS' })}
  <div class="fw-stage">
    ${deskTitle('FOUNDATIONS', `${rows.length} FOUNDATIONS · 6 ACTIVE · 3 NEED YOU`, '', btn('NEW FOUNDATION', { tone: 'red', ic: 'add', arrow: false }))}
    <div class="fw-between fw-mt20" style="gap:16px">
      <span class="fw-search" style="width:300px">${icon('search')}SEARCH NAME, EMAIL, DOMAIN</span>
      <div style="flex:1">${tabs(STATUS_VIEWS, 0)}</div>
      <span class="fw-btn fw-btn--out fw-btn--sm">${icon('filter', '', 'style="width:14px;height:14px"')}FILTERS</span>
      <span class="fw-btn fw-btn--out fw-btn--sm">SORT · NEEDS YOU FIRST ${icon('next', '', 'style="width:12px;height:12px;transform:rotate(90deg)"')}</span>
      ${toolbarExtra}
    </div>
    <div class="fw-mt14">${dTable(rows, sel)}</div>
  </div>`;
}

// ═══ CLIENT RECORD ══════════════════════════════════════════════════════════
export const RECORD_SECTIONS = ['OVERVIEW', 'INTAKE', 'RECOMMENDATIONS', 'QUOTE', 'OPERATIONS', 'RECORDS', 'COMMUNICATIONS', 'ACTIVITY'];

export const quickActions = (resendOff = true) =>
  `<div class="fw-qa">
    <span class="fw-qa__i">${icon('link')}COPY<br>LINK</span>
    <span class="fw-qa__i">${icon('external')}CLIENT<br>VIEW</span>
    <span class="fw-qa__i">${icon('message')}MESSAGE</span>
    <span class="fw-qa__i ${resendOff ? 'fw-qa__i--off' : ''}">${icon('send')}RESEND<br>${resendOff ? 'N/A' : 'INVITE'}</span>
    <span class="fw-qa__i">${icon('more')}MORE</span>
  </div>`;

export function mRecordHead(c, { band = true } = {}) {
  return `${mhead({ back: 'FOUNDATIONS' })}
  ${band ? `<div class="fw-band" style="height:96px">${arch('corner', 'right:12px;bottom:-4px;width:150px;height:112px')}${arch('crown', 'left:-30px;top:-70px;width:120px;height:213px;opacity:.5')}</div>` : ''}
  <div style="padding:${band ? '0' : '6px'} 22px 0;${band ? 'margin-top:-26px;' : ''}position:relative">
    ${plate(c.name, { attn: c.k === 'founder', size: 'lg', test: c.test })}
    <h1 class="fw-h2" style="margin-top:12px;font-size:36px">${c.name.toUpperCase()}</h1>
    <div class="fw-sub" style="margin-top:8px">${c.cat}</div>
    <div class="fw-between fw-mt14">${status(c.k, c.state)}<span class="fw-meta">STEP ${c.phase + 1} OF 8 · ${PHASES[c.phase]}</span></div>
    <div class="fw-mt8">${segFor(c.phase, c.k)}</div>
  </div>`;
}

export function mRecord(c = H, { section = 0 } = {}) {
  const ov = `
    <div class="fw-focus" style="box-shadow:inset 3px 0 0 ${c.k === 'founder' ? 'var(--fw-red)' : 'var(--fw-ink)'}"><div class="fw-focus__k"><span class="fw-label">NEXT STEP · ${c.who}</span><span class="fw-meta">${c.last}</span></div><div style="font-size:12px;font-weight:700;letter-spacing:.14em">${c.next}</div>${c.k === 'founder' ? btn('REVIEW INTAKE', { block: true, sm: true }) : ''}</div>
    <div><span class="fw-label">CLIENT JOURNEY</span><div class="fw-mt14">${journey(c.phase, { kind: c.k === 'client' ? 'client' : c.k === 'blocked' ? 'blocked' : 'cur', labels: ['INV', 'INT', 'REC', 'QTE', 'PAY', 'SET', 'VER', 'DONE'], dates: ['OCT 10', 'OCT 14', '', '', '', '', '', ''].map((d, i) => (i <= c.phase ? d || 'TODAY' : '')) })}</div></div>`;
  return `${mRecordHead(c)}
  <div style="padding:14px 16px 0" class="fw-col fw-gap14">
    ${quickActions()}
    ${tabs(['OVERVIEW', 'INTAKE', 'QUOTE', 'OPS', ['MORE', '']], section)}
    ${ov}
  </div>`;
}

export function dRecord(c = H, { section = 0, body } = {}) {
  return `${topbar({ n: '02', title: `FOUNDATIONS / ${c.name.toUpperCase()}` })}
  <div class="fw-stage">
    <div class="fw-deskhead">
      <div class="fw-row-flex" style="gap:18px;align-items:flex-end">${plate(c.name, { attn: c.k === 'founder', size: 'lg' })}<div><h1 class="fw-h1" style="font-size:52px">${c.name.toUpperCase()}<i></i></h1><div class="fw-sub" style="margin-top:10px">${c.cat} · <span class="fw-data">${c.email}</span></div></div></div>
      <div class="fw-row-flex">${btn('COPY LINK', { tone: 'out', sm: true, ic: 'link', arrow: false })}${btn('CLIENT VIEW', { tone: 'out', sm: true, ic: 'external', arrow: false })}${btn('MESSAGE', { tone: 'out', sm: true, ic: 'message', arrow: false })}<span class="fw-btn fw-btn--out fw-btn--sm" style="width:32px;padding:0">${icon('more', '', 'style="width:15px;height:15px"')}</span></div>
    </div>
    <div class="fw-panel fw-mt20" style="padding:16px 18px 14px">
      <div class="fw-between" style="margin-bottom:14px">${status(c.k, c.state)}<span class="fw-meta">STEP ${c.phase + 1} OF 8 · NEXT: <b style="color:var(--fw-ink)">${c.next}</b> · ${c.who}</span></div>
      ${journey(c.phase, { kind: c.k === 'client' ? 'client' : 'cur', dates: ['OCT 10', 'OCT 14', '', '', '', '', '', ''].map((d, i) => (i <= c.phase ? d || 'TODAY' : '')) })}
    </div>
    <div class="fw-mt14">${tabs(RECORD_SECTIONS, section)}</div>
    <div class="fw-mt14">${body ?? recordOverviewDesk(c)}</div>
  </div>`;
}

export function recordOverviewDesk(c) {
  return `<div style="display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:18px">
    <div class="fw-col fw-gap14">
      <div class="fw-focus" style="box-shadow:inset 3px 0 0 var(--fw-red)"><div class="fw-focus__k"><span class="fw-st fw-st--founder">${mk('founder')}FOUNDER DECISION</span><span class="fw-meta">${c.last}</span></div><div class="fw-focus__t" style="font-size:24px">INTAKE COMPLETE — REVIEW BEFORE QUOTING<i class="fw-period"></i></div><div class="fw-row-flex">${btn('REVIEW INTAKE')}${btn('OPEN QUOTE', { tone: 'out' })}</div></div>
      <div class="fw-grid3">
        <div class="fw-panel"><div class="fw-panel__b fw-col fw-gap6"><span class="fw-label">INTAKE</span><b style="font-size:10px;letter-spacing:.16em">COMPLETE</b><span class="fw-meta">OCT 14 · 12 ANSWERS</span></div></div>
        <div class="fw-panel"><div class="fw-panel__b fw-col fw-gap6"><span class="fw-label">RECOMMENDATION</span><b style="font-size:10px;letter-spacing:.16em">MANUAL REVIEW</b><span class="fw-meta">2 REASONS</span></div></div>
        <div class="fw-panel"><div class="fw-panel__b fw-col fw-gap6"><span class="fw-label">QUOTE</span><b style="font-size:10px;letter-spacing:.16em">${money(DF.config.base_price_minor + 10000)} · V1</b><span class="fw-meta">NOT APPROVED</span></div></div>
      </div>
    </div>
    <div class="fw-col fw-gap14">
      <div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">PERSONAL LINK</span>${chip('ok', 'ACTIVE · NO EXPIRY')}</div><div class="fw-panel__b"><div class="fw-link"><code class="fw-data">site00.com/foundation/ab12…9zQ</code>${btn('COPY', { tone: 'ghost', arrow: false, sm: true })}</div><div class="fw-meta fw-mt8">THE LINK NEVER EXPIRES · QUOTES EXPIRE AFTER ${DF.config.quote_expiry_days} DAYS</div></div></div>
      <div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">RECENT MOVEMENT</span><span class="fw-meta">ACTIVITY →</span></div><div class="fw-panel__b" style="padding-top:2px">${act('1D', 'founder', 'INTAKE COMPLETED')}${act('2D', 'client', 'INTAKE SAVED', 'DOMAIN · CONNECT A DOMAIN I OWN')}${act('4D', 'client', 'LINK OPENED')}${act('5D', 'work', 'FOUNDATION CREATED', 'BY FOUNDER')}</div></div>
    </div>
  </div>`;
}

// ═══ 03 REVIEWS ═════════════════════════════════════════════════════════════
export const REVIEW_TABS = [['ALL', '4'], ['INTAKES', '1'], ['RECOMMEND', ''], ['QUOTES', '1'], ['REQUESTS', '1'], ['EXCEPTIONS', '1'], 'HISTORY'];

export function mReviews({ on = 0, items = REVIEWS } = {}) {
  return `${mhead()}${mtitle({ n: '03', title: 'REVIEWS', sub: 'INTAKES · QUOTES · REQUESTS · EXCEPTIONS' })}
  <div style="padding:0 16px">${tabs(REVIEW_TABS.slice(0, 5), on)}<div class="fw-mt14">${items.map((r) => reviewItem(r)).join('')}</div></div>`;
}

export function dReviews({ sel = 0 } = {}) {
  return `${topbar({ n: '03', title: 'REVIEWS' })}
  <div class="fw-stage">
    ${deskTitle('REVIEWS', '4 DECISIONS WAITING · OLDEST 4D')}
    <div class="fw-mt20">${tabs(REVIEW_TABS, 0)}</div>
    <table class="fw-table fw-mt8"><thead><tr><th>CLIENT</th><th>REVIEW</th><th>WHY IT NEEDS YOU</th><th>WAITING</th><th>LAST EVENT</th><th></th></tr></thead><tbody>${REVIEWS.map(
      (r, i) => `<tr class="${i === sel ? 'sel' : ''}"><td><span class="fw-row-flex">${plate(r.c.name, { attn: !r.exc, size: 'sm' })}<span class="fw-who"><b style="font-size:10px">${r.c.name}</b><span>${r.c.cat}</span></span></span></td><td>${chip(r.exc ? 'req' : 'muted', r.type)}</td><td class="wrap">${status(r.exc ? 'blocked' : 'founder', r.why)}<div class="fw-meta" style="margin-top:5px">${r.sub}</div></td><td class="fw-meta">${r.when}</td><td class="fw-meta">${['INTAKE_COMPLETED', 'QUOTE_UPDATED', 'REVISION REQUESTED (CLIENT)', 'TASK_BLOCKED'][i]}</td><td>${btn(r.cta.split(' ')[0], { sm: true })}</td></tr>`,
    ).join('')}</tbody></table>
  </div>`;
}

export function reviewInspector(r = REVIEWS[0]) {
  return `<div class="fw-insp__head"><div class="fw-insp__bar"><span class="fw-label">${r.type} REVIEW</span><span class="fw-row-flex">${icon('external', '', 'style="width:15px;height:15px"')}${icon('close', '', 'style="width:16px;height:16px"')}</span></div>
    <div class="fw-row-flex" style="gap:12px">${plate(r.c.name, { attn: true })}<div class="fw-who"><b style="font-size:13px">${r.c.name}</b><span>${r.c.cat}</span></div></div></div>
  <div class="fw-insp__body">
    <div class="fw-rv__why"><b><span class="fw-st fw-st--founder">${mk('founder')}${r.why}</span></b><span>${r.sub} · ${r.when}</span></div>
    <div><span class="fw-label">SUBMITTED INTAKE</span><div class="fw-mt8">${kv([['BUSINESS', 'HORIZON FREIGHT'], ['INDUSTRY', 'TRANSPORTATION + LOGISTICS'], ['CONTACT EMAIL', 'ops@horizon-freight.invalid', true], ['DOMAIN PATH', 'CONNECT A DOMAIN I OWN'], ['YOUR DOMAIN', 'horizon-freight.invalid', true], ['TEAM SIZE', '6 MAILBOXES']])}</div></div>
    <div><span class="fw-label">AUTOMATED RECOMMENDATION · NOT REVIEWED</span><div class="fw-mt8 fw-col fw-gap6">${['BASE FOUNDATION · ' + money(DF.config.base_price_minor), 'ADDITIONAL MAILBOX × 5', 'DOMAIN TRANSFER'].map((t) => `<span class="fw-row-flex fw-meta" style="color:var(--fw-ink)">${mk('idle')}${t}</span>`).join('')}</div></div>
  </div>
  <div class="fw-insp__foot">${btn('OPEN FULL REVIEW', { block: true })}</div>`;
}

// ═══ 04 OPERATIONS ══════════════════════════════════════════════════════════
export function mOps() {
  const proj = (c, stg, left, k) => `<div class="fw-row">${plate(c.name, { attn: k === 'blocked', size: 'sm' })}<div class="fw-who"><b>${c.name}</b><span>${stg}</span><div style="margin-top:8px">${seg(['d', 'd', 'd', k === 'blocked' ? 'b' : 'c', '', '', ''])}</div></div><span class="fw-row__side">${status(k, left)}${CHEV}</span></div>`;
  return `${mhead()}${mtitle({ n: '04', title: 'OPERATIONS', sub: 'FULFILMENT · VERIFICATION · RECORDS' })}
  <div style="padding:0 16px" class="fw-col fw-gap14">
    ${segctl(['ACTIVE · 3', 'BLOCKED · 1', 'VERIFY · 0'], 0)}
    <div class="fw-list">${proj(DEMO[4], '04 DNS + SECURITY · DKIM IN PROGRESS', 'SITE 00', 'work')}${proj(DEMO[5], '02 DOMAIN · REGISTRAR ACCESS', 'BLOCKED', 'blocked')}${proj(DEMO[3], '01 DETAILS · AWAITING PAYMENT', 'CLIENT', 'client')}</div>
    <div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">NEXT FOR YOU · FIELD & EMBER</span></div><div class="fw-panel__b">${taskRow(TASKS[2])}${btn('START TASK', { block: true, sm: true })}</div></div>
  </div>`;
}

export function mOpsProject() {
  return `${mhead({ back: 'OPERATIONS' })}
  <div style="padding:6px 22px 0">${plate('Field & Ember', { size: 'lg' })}<h1 class="fw-h2" style="margin-top:12px;font-size:32px">FIELD & EMBER</h1><div class="fw-sub" style="margin-top:8px">RUNBOOK ACTIVE · 11 OF 17 TASKS</div></div>
  <div style="padding:14px 16px 0" class="fw-col fw-gap14">
    <div class="fw-between"><span class="fw-label">STAGE 04 OF 07</span><span class="fw-meta">PROJECTED OCT 24</span></div>
    ${stageRail(STAGES.map(([n, , s]) => [n, '', s]))}
    <div class="fw-h3" style="margin-top:4px">04 DNS + SECURITY</div>
    <div>${TASKS.map((t, i) => taskRow(t, i === 2)).join('')}</div>
  </div>`;
}

export function dOps() {
  return `${topbar({ n: '04', title: 'OPERATIONS / FIELD & EMBER' })}
  <div class="fw-stage">
    <div class="fw-deskhead"><div class="fw-row-flex" style="gap:16px;align-items:flex-end">${plate('Field & Ember', { size: 'lg' })}<div><h1 class="fw-h1" style="font-size:48px">FIELD & EMBER<i></i></h1><div class="fw-sub" style="margin-top:10px">RUNBOOK V1 · ACTIVE · 11 OF 17 TASKS · PROJECTED OCT 24</div></div></div>
      <div class="fw-row-flex">${chip('muted', 'EMAIL · GOOGLE WORKSPACE')}${chip('muted', 'DNS · GODADDY')}${btn('PROVIDERS', { tone: 'out', sm: true, arrow: false })}</div></div>
    <div class="fw-mt20">${stageRail()}</div>
    <div style="display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:22px;margin-top:20px">
      <div><div class="fw-between"><span class="fw-h3">04 DNS + SECURITY</span>${segctl(['TASKS', 'DEPENDENCIES', 'VERIFICATION'], 0).replace('class="fw-segctl"', 'class="fw-segctl" style="width:330px"')}</div><div class="fw-mt8">${TASKS.map((t, i) => taskRow(t, i === 2)).join('')}</div></div>
      <div class="fw-col fw-gap14">
        <div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">COMPLETION GATE</span>${chip('req', '3 REASONS')}</div><div class="fw-panel__b fw-col fw-gap6">${['TASKS_INCOMPLETE · 6', 'VERIFICATION_REQUIRED', 'OWNERSHIP_RECORD_MISSING'].map((t) => `<span class="fw-row-flex fw-meta" style="color:var(--fw-ink)">${mk('blocked')}${t}</span>`).join('')}</div></div>
        <div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">CLIENT ACTIONS</span><span class="fw-meta">1 OPEN</span></div><div class="fw-panel__b">${status('client', 'APPROVE DNS CHANGE')}<div class="fw-meta fw-mt8">REQUESTED 2H AGO · VISIBLE IN CLIENT PORTAL</div></div></div>
        <div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">VERIFICATION</span><span class="fw-meta">4 OF 12 PASS</span></div><div class="fw-panel__b fw-col fw-gap6">${[['MX_MATCHES_EXPECTED', 'ok', 'PASS'], ['SPF_MATCHES_EXPECTED', 'ok', 'PASS'], ['DKIM_PRESENT', 'unver', 'NOT RUN'], ['DMARC_PRESENT', 'unver', 'NOT RUN']].map(([t, k, l]) => `<span class="fw-between"><span class="fw-meta" style="color:var(--fw-ink)">${t}</span>${chip(k, l)}</span>`).join('')}</div></div>
      </div>
    </div>
  </div>`;
}

export function taskInspector() {
  return `<div class="fw-insp__head"><div class="fw-insp__bar"><span class="fw-label">TASK · 04 DNS + SECURITY</span>${icon('close', '', 'style="width:16px;height:16px"')}</div>
    <h2 class="fw-h2" style="font-size:28px">DKIM RECORD<i class="fw-period"></i></h2><div class="fw-row-flex fw-mt8"><span class="fw-mode">EXTERNAL MANUAL</span>${status('work', 'IN PROGRESS')}</div></div>
  <div class="fw-insp__body">
    ${kv([['TASK KEY', 'DKIM_CONFIGURE', true], ['STARTED', 'TODAY 09:12'], ['DEPENDS ON', 'PRIMARY MAILBOX · COMPLETE'], ['UNBLOCKS', 'DNS VERIFICATION']])}
    <div><span class="fw-label">INSTRUCTIONS · INTERNAL ONLY</span><p class="fw-meta" style="line-height:1.7;margin:8px 0 0">GENERATE THE DKIM KEY IN THE EMAIL PROVIDER, ADD THE TXT RECORD AT THE DNS HOST, THEN MARK COMPLETE. VERIFICATION RUNS AFTER COMPLETION.</p></div>
    <div><span class="fw-label">METADATA</span><div class="fw-mt8">${field({ label: 'SELECTOR', value: 'google', data: true })}</div></div>
  </div>
  <div class="fw-insp__foot">${btn('MARK COMPLETE', { block: true })}<span class="fw-btn fw-btn--out" style="padding:0 12px">${icon('blocked', '', 'style="width:15px;height:15px"')}BLOCK</span></div>`;
}

// ═══ 05 CORRESPONDENCE ══════════════════════════════════════════════════════
export function mCorr() {
  const th = (c, line, st, when) => `<div class="fw-row">${plate(c.name, { size: 'sm' })}<div class="fw-who"><b>${c.name}</b><span>${line}</span><div class="fw-row__status">${st}<span class="fw-meta">${when}</span></div></div>${CHEV}</div>`;
  return `${mhead()}${mtitle({ n: '05', title: 'CORRESPON&shy;DENCE', sub: 'MESSAGES · INVITATIONS · LIFECYCLE EMAIL' })}
  <div style="padding:0 16px" class="fw-col fw-gap14">
    <div class="fw-banner fw-banner--policy">${icon('lock', '', 'style="width:15px;height:15px;flex:0 0 auto"')}EMAIL SENDING IS DISABLED ON STAGING · MESSAGES IN THE CLIENT PORTAL STILL WORK</div>
    ${tabs(['MESSAGES', 'INVITATIONS', 'LIFECYCLE', 'TEMPLATES'], 0)}
    <div class="fw-list" style="border-top:0">${th(DEMO[4], 'DKIM IS LIVE — CHECK YOUR INBOX TOMORROW', status('work', 'YOU · SENT'), '40M')}${th(DEMO[5], 'WE NEED REGISTRAR ACCESS TO CONTINUE', status('client', 'AWAITING REPLY'), '4D')}${th(DEMO[7], 'YOUR RECORDS ARE READY', status('done', 'READ'), 'OCT 09')}</div>
  </div>`;
}

export function mThread() {
  const msg = (who, text, when, me) => `<div style="align-self:${me ? 'flex-end' : 'flex-start'};max-width:84%;padding:10px 12px;border:1px solid ${me ? 'var(--fw-ink)' : 'var(--fw-rule)'};background:${me ? 'var(--fw-ink)' : '#fff'};color:${me ? '#fff' : 'var(--fw-ink)'}"><div class="fw-label" style="color:${me ? 'rgba(255,255,255,.7)' : 'var(--fw-muted)'}">${who} · ${when}</div><div class="fw-data" style="margin-top:6px;font-size:12px;line-height:1.5">${text}</div></div>`;
  return `${mhead({ back: 'CORRESPONDENCE' })}
  <div style="padding:0 22px">${plate('Vela Boutique')}<h1 class="fw-h2" style="margin-top:10px;font-size:28px">VELA BOUTIQUE</h1><div class="fw-sub" style="margin-top:6px">PORTAL MESSAGES · <span class="fw-data">shop@velaboutique.invalid</span></div></div>
  <div class="fw-col fw-gap10" style="padding:16px">${msg('SITE 00', 'We need access to your registrar to connect the domain. You can approve it from your portal.', 'OCT 15', true)}${msg('CLIENT', 'Thanks — I’ll find the login this week.', 'OCT 15', false)}${msg('SITE 00', 'Reminder: the domain step is waiting on registrar access.', '4D AGO', true)}</div>
  <div style="position:absolute;left:0;right:0;bottom:84px;padding:10px 16px;border-top:1px solid var(--fw-rule);background:#fff" class="fw-row-flex"><span class="fw-input fw-input--ph" style="flex:1">WRITE A MESSAGE</span>${btn('SEND', { sm: true })}</div>`;
}

export function dCorr() {
  return `${topbar({ n: '05', title: 'CORRESPONDENCE' })}
  <div class="fw-stage">
    ${deskTitle('CORRESPONDENCE', 'PORTAL MESSAGES · INVITATIONS · LIFECYCLE EMAIL · DELIVERY')}
    <div class="fw-banner fw-banner--policy fw-mt14">${icon('lock', '', 'style="width:15px;height:15px;flex:0 0 auto"')}EMAIL SENDING IS DISABLED BY POLICY ON STAGING (SITE00_DF_TRANSACTIONAL_EMAIL_SEND OFF). LIFECYCLE EMAILS ARE RECORDED AS DRY RUN. PORTAL MESSAGES ARE UNAFFECTED.</div>
    <div class="fw-mt14">${tabs(['MESSAGES', ['INVITATIONS', ''], 'LIFECYCLE EMAIL', 'DELIVERY', 'TEMPLATES ↗'], 2)}</div>
    <table class="fw-table fw-mt8"><thead><tr><th>CLIENT</th><th>TEMPLATE</th><th>TRIGGER</th><th>STATUS</th><th>CHANNEL</th><th>WHEN</th><th></th></tr></thead><tbody>
    ${[
      [DEMO[6], 'PERSONAL FOUNDATION INVITATION', 'ARTIFACT_CREATED', ['policy', 'DRY RUN'], 'NONE', '5H'],
      [DEMO[0], 'INTAKE COMPLETED', 'INTAKE_COMPLETED', ['policy', 'DRY RUN'], 'NONE', '1D'],
      [DEMO[1], 'QUOTE READY', 'QUOTE_CREATED', ['policy', 'DRY RUN'], 'NONE', '3H'],
      [{ name: 'SYNTH · Founder E2E Client' }, 'PERSONAL FOUNDATION INVITATION', 'ARTIFACT_CREATED', ['ok', 'DELIVERED'], 'RESEND', '2D'],
      [{ name: 'SYNTH · Founder E2E Client' }, 'QUOTE READY', 'QUOTE_CREATED', ['fail', 'BOUNCED'], 'RESEND', '2D'],
    ]
      .map(([c, t, tr, [k, s], ch, w], i) => `<tr class="${i === 0 ? 'sel' : ''}"><td><span class="fw-row-flex">${plate(c.name, { size: 'sm', test: c.name.startsWith('SYNTH') })}<b style="font-size:9.5px;letter-spacing:.14em">${c.name.toUpperCase()}</b></span></td><td>${t}</td><td class="fw-meta">${tr}</td><td>${chip(k, s)}</td><td class="fw-meta">${ch}</td><td class="fw-meta">${w}</td><td>${CHEV}</td></tr>`)
      .join('')}</tbody></table>
  </div>`;
}

export function corrInspector() {
  return `<div class="fw-insp__head"><div class="fw-insp__bar"><span class="fw-label">LIFECYCLE EMAIL · PREVIEW</span>${icon('close', '', 'style="width:16px;height:16px"')}</div><h2 class="fw-h2" style="font-size:24px">PERSONAL FOUNDATION INVITATION<i class="fw-period"></i></h2></div>
  <div class="fw-insp__body">
    ${kv([['TO', 'jo***@avery-studio.invalid', true], ['FROM', 'hello@site00.com', true], ['SUBJECT', 'YOUR DIGITAL FOUNDATION IS READY'], ['LINK', 'VALID · CONFIGURED ORIGIN'], ['STATUS', 'DRY RUN · SEND FLAG OFF']])}
    <div style="height:150px;border:1px solid var(--fw-rule);background:linear-gradient(180deg,#fff,#f3f2ef);display:flex;align-items:center;justify-content:center" class="fw-meta">FNDATN-01 · 01 INVITATION · RENDERED PREVIEW</div>
    <div class="fw-banner fw-banner--policy">${icon('lock', '', 'style="width:14px;height:14px;flex:0 0 auto"')}SEND IS UNAVAILABLE: NOT A SYNTHETIC CLIENT · SEND FLAG OFF</div>
  </div>
  <div class="fw-insp__foot"><span class="fw-btn fw-btn--off fw-btn--block">${icon('lock', '', 'style="width:14px;height:14px"')}SEND DISABLED BY POLICY</span></div>`;
}

// ═══ 06 SYSTEM ══════════════════════════════════════════════════════════════
export function mSystem({ on = 0 } = {}) {
  return `${mhead()}${mtitle({ n: '06', title: 'SYSTEM', sub: '', arch: arch('corner', 'right:10px;top:4px;width:104px;height:78px') })}
  <div style="padding:0 16px" class="fw-col fw-gap14">
    ${tabs(['OVERVIEW', 'STACK', 'INTEGRATIONS', 'SECURITY', 'TEST LAB'], on)}
    <div class="fw-focus" style="box-shadow:inset 3px 0 0 var(--fw-red)"><div class="fw-focus__k"><span class="fw-label">STAGING READINESS</span>${chip('req', 'ACTION REQUIRED')}</div><div class="fw-focus__t" style="font-size:22px">1 ITEM NEEDS YOU · 2 UNVERIFIED<i class="fw-period"></i></div><span class="fw-meta">DKIM + RESEND DOMAIN · API HEALTH · STRIPE WEBHOOK</span></div>
    <div class="fw-grid2">${MODULES.slice(0, 8).map(moduleCard).join('')}</div>
  </div>`;
}

export function dSystem() {
  return `${topbar({ n: '06', title: 'SYSTEM' })}
  <div class="fw-stage">
    ${deskTitle('SYSTEM', 'STAGING · carefree-luck · reliable-creation'.replace('carefree-luck', '<span class="fw-data">carefree-luck</span>').replace('reliable-creation', '<span class="fw-data">reliable-creation</span>'), arch('corner', 'right:0;top:-10px;width:170px;height:128px'))}
    <div class="fw-mt14">${tabs(['OVERVIEW', 'INFRASTRUCTURE', 'INTEGRATIONS', 'SECURITY', 'TEST LAB', 'READINESS REPORT'], 0)}</div>
    <div class="fw-focus fw-mt14" style="box-shadow:inset 3px 0 0 var(--fw-red);flex-direction:row;align-items:center;justify-content:space-between"><div class="fw-col fw-gap6"><span class="fw-label">OVERALL · READINESS REPORT</span><div class="fw-focus__t" style="font-size:26px">ACTION REQUIRED — 1 ITEM NEEDS YOU<i class="fw-period"></i></div></div><div class="fw-row-flex">${chip('ok', '9 READY')}${chip('req', '1 NEEDS FOUNDER')}${chip('unver', '2 UNVERIFIED')}${chip('muted', '0 BLOCKED')}</div></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px">${MODULES.map(moduleCard).join('')}</div>
    <div class="fw-between fw-mt20"><span class="fw-meta">API BUILD <span class="fw-data">392ac76 · founder-readiness-e2e-v1</span></span>${btn('OPEN READINESS DESK', { tone: 'out', sm: true })}</div>
  </div>`;
}

export function systemInspector() {
  return `<div class="fw-insp__head"><div class="fw-insp__bar"><span class="fw-label">DIAGNOSTICS · EMAIL</span>${icon('close', '', 'style="width:16px;height:16px"')}</div><h2 class="fw-h2" style="font-size:28px">EMAIL SENDING<i class="fw-period"></i></h2><div class="fw-mt8">${chip('policy', 'DISABLED BY POLICY', 'lock')}</div></div>
  <div class="fw-insp__body">
    <div><span class="fw-label">SUMMARY</span><p class="fw-meta" style="line-height:1.7;margin:8px 0 0;color:var(--fw-ink)">TRANSACTIONAL SENDING IS OFF. LIFECYCLE EMAILS ARE RECORDED AS DRY RUN. WHEN ON, ONLY ALLOWLISTED SYNTHETIC CLIENTS CAN RECEIVE MAIL.</p></div>
    <div><span class="fw-label">CHECKS</span><div class="fw-mt8 fw-col fw-gap6">${[
      ['SEND FLAG', 'policy', 'OFF'],
      ['RESEND KEY', 'ok', 'PRESENT'],
      ['WEBHOOK SECRET', 'ok', 'PRESENT'],
      ['FROM / REPLY-TO', 'ok', 'SET'],
      ['FOUNDER ALLOWLIST', 'ok', '1 ADDRESS'],
      ['GODADDY DKIM + DOMAIN', 'req', 'NEEDS FOUNDER'],
      ['LIVE DELIVERY', 'unver', 'UNVERIFIED'],
    ]
      .map(([t, k, l]) => `<span class="fw-between" style="padding:6px 0;border-bottom:1px solid var(--fw-hair)"><span class="fw-meta" style="color:var(--fw-ink)">${t}</span>${chip(k, l)}</span>`)
      .join('')}</div></div>
    <div><span class="fw-label">NEXT ACTION</span><p class="fw-meta" style="line-height:1.7;margin:8px 0 0;color:var(--fw-ink)">CONFIRM THE GODADDY DKIM RECORD AND THE RESEND DOMAIN, THEN RE-RUN THE REPORT.</p></div>
    <details open style="border:1px solid var(--fw-rule);padding:10px 12px"><summary class="fw-label" style="cursor:pointer">ENVIRONMENT · NAMES ONLY</summary><div class="fw-mt8 fw-col fw-gap6">${['SITE00_DF_TRANSACTIONAL_EMAIL_SEND', 'RESEND_API_KEY', 'RESEND_WEBHOOK_SECRET', 'SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST'].map((n) => `<span class="fw-between"><span class="fw-data fw-meta" style="color:var(--fw-ink)">${n}</span><span class="fw-meta">${n.includes('SEND') ? 'NOT SET' : 'CONFIGURED'}</span></span>`).join('')}</div></details>
  </div>
  <div class="fw-insp__foot">${btn('RE-RUN READINESS REPORT', { block: true, tone: 'out' })}</div>`;
}

export { H, A };
