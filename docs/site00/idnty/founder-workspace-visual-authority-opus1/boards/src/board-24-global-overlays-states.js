import { header, section, frame, phone, desktop, S, foot, mount, btn, icon, chip, mk, kv, field, mhead, mtitle, topbar, plate, CHEV } from './fw-kit.js';
import { DEMO, sheet, menu, toast, mRow } from './fw-parts.js';
import { dRegistry, mRegistry } from './fw-pages.js';

// A loose specimen panel (proposal components outside a device).
const spec = (inner, w = 420, pad = 22) => `<div class="fw" style="width:${w}px;background:var(--fw-page);border:1px solid #0c0c0c;padding:${pad}px;display:flex;flex-direction:column;gap:12px">${inner}</div>`;

const rowMenu = frame({
  title: 'ROW MENU · CLIENT',
  chips: S.prop(),
  body: phone({
    nav: 'foundations',
    body: mRegistry({ sel: 1 }),
    overlay: `<div class="fw-scrim" style="background:rgba(12,12,12,.18)"></div>${menu(
      [
        ['view', 'OPEN RECORD', 'act'],
        ['link', 'COPY CLIENT LINK', ''],
        ['external', 'OPEN CLIENT VIEW', ''],
        ['message', 'MESSAGE', ''],
        '-',
        ['send', 'RESEND INVITATION', 'off', 'N/A · G-05'],
        ['delete', 'ARCHIVE', 'off', 'N/A · G-06'],
      ],
      'right:16px;top:388px;width:300px',
    )}`,
  }),
  note: 'Long-press or ⋯ on a row. Unavailable actions are shown <b>disabled with their reason</b> (FD-W5 decides shown-disabled vs hidden). Destructive items sit last, after a rule, and are red only when available.',
});

const destructive = frame({
  title: 'DESTRUCTIVE CONFIRM · DIALOG',
  chips: S.prop(),
  width: 760,
  body: desktop({
    w: 760,
    h: 560,
    active: 'foundations',
    body: `${topbar({ n: '02', title: 'FOUNDATIONS' })}`,
    overlay: `<div class="fw-scrim"></div><div class="fw-dialog" style="width:440px"><div class="fw-sheet__h"><h2 class="fw-h2" style="font-size:26px">MARK FOUNDATION COMPLETE<i class="fw-period"></i></h2><span class="fw-iconbtn">${icon('close')}</span></div>
      <div class="fw-sheet__b">${kv([['CLIENT', 'NOVA CREATIVE'], ['PAYMENT', 'PAID'], ['COMPLETION GATE', '2 REASONS OPEN']])}<div class="fw-banner fw-banner--red">${mk('blocked')}COMPLETION GATE: DNS VERIFICATION NOT PASSED · OWNERSHIP RECORD MISSING</div>${field({ label: 'REGISTRAR', ph: 'REQUIRED · NO DEFAULT' })}</div>
      <div class="fw-sheet__f" style="padding-bottom:18px">${btn('CANCEL', { tone: 'out', arrow: false })}<span class="fw-btn fw-btn--off fw-btn--block">${icon('lock', '', 'style="width:14px;height:14px"')}MARK COMPLETE · GATE OPEN</span></div></div>`,
  }),
  note: 'Replaces R2’s one-click “Mark foundation complete” with hard-coded <code>registrar:\'TBD\'</code>. The dialog shows the real completion-gate reasons and asks for the ownership values instead of inventing them.',
});

const toasts = frame({
  title: 'TOASTS',
  chips: S.prop(),
  width: 420,
  body: spec(`${toast('LINK COPIED')}${toast('QUOTE V2 APPROVED')}${toast('NOTE SAVED · MEMORY ONLY', { err: false })}${toast('COULD NOT LOAD FOUNDATIONS · RETRY', { err: true })}<div class="fw-meta">BOTTOM-CENTRE ON MOBILE (ABOVE NAV) · BOTTOM-LEFT OF STAGE ON DESKTOP · 4 S · ERRORS PERSIST UNTIL DISMISSED</div>`),
  note: 'Replaces <code>window.prompt</code> for links: copy is one tap, confirmed by a toast; the link remains visible in the record.',
});

const errorDetail = frame({
  title: 'ERROR · INLINE + DETAIL',
  chips: S.prop(),
  width: 420,
  body: spec(`<div class="fw-banner fw-banner--red" role="alert">${icon('warning', '', 'style="width:14px;height:14px;flex:0 0 auto"')}<span style="flex:1">COULD NOT LOAD THE READINESS REPORT</span><span class="fw-btn fw-btn--sm fw-btn--out" style="height:28px">RETRY</span></div>
    <details open class="fw-panel" style="padding:0"><summary class="fw-panel__h" style="list-style:none"><span class="fw-label">TECHNICAL DETAIL</span>${CHEV}</summary><div class="fw-panel__b">${kv([['ACTION', 'readiness-report', true], ['STATUS', '502'], ['REQUEST', 'req_7b1…e0', true], ['AT', '14:02:11']])}</div></details>`),
  note: 'Every R7 “Action failed / Reset failed / Prepare failed” becomes: plain-language line + RETRY + optional technical detail. Never a raw stack or a secret.',
});

const emptyLoad = frame({
  title: 'EMPTY · LOADING · STALE',
  chips: S.prop(),
  width: 420,
  body: spec(`<div class="fw-empty"><span class="fw-label">02 · FOUNDATIONS</span><h2 class="fw-h2">NO FOUNDATIONS YET<i class="fw-period"></i></h2><span class="fw-meta">CREATE THE FIRST CLIENT FOUNDATION AND SHARE ITS PERSONAL LINK.</span>${btn('NEW FOUNDATION', { tone: 'red', ic: 'add', arrow: false })}</div>
    <div class="fw-panel"><div class="fw-panel__b fw-col fw-gap10">${[0, 1, 2].map(() => `<div class="fw-row-flex"><span class="fw-skel" style="width:42px;height:42px"></span><span class="fw-col fw-gap6" style="flex:1"><span class="fw-skel" style="width:60%"></span><span class="fw-skel" style="width:40%;height:8px"></span></span></div>`).join('')}</div></div>
    <div class="fw-banner">${icon('time', '', 'style="width:14px;height:14px;flex:0 0 auto"')}SHOWING DATA FROM 6 MIN AGO · CONNECTION LOST · RETRYING</div>`),
  note: 'Empty states teach the one next action. Skeletons mirror the real row geometry. Stale data is labelled, never silently shown as live.',
});

const states = frame({
  title: 'CONTROL STATES',
  chips: S.prop(),
  width: 560,
  body: spec(
    `<div class="fw-label">BUTTONS</div><div class="fw-row-flex" style="flex-wrap:wrap">${btn('APPROVE')}${btn('APPROVE', { focus: true })}<span class="fw-btn fw-btn--busy">WORKING…</span>${btn('NEW', { tone: 'red', ic: 'add', arrow: false })}${btn('REVISE', { tone: 'out', arrow: false })}<span class="fw-btn fw-btn--off">${icon('lock', '', 'style="width:14px;height:14px"')}SEND DISABLED · POLICY</span></div>
     <div class="fw-label">FIELDS</div><div class="fw-grid2">${field({ label: 'BUSINESS NAME', ph: 'REQUIRED' })}${field({ label: 'CLIENT EMAIL', value: 'jo@avery-studio', data: true, state: 'err', err: 'ENTER A COMPLETE EMAIL ADDRESS' })}</div>
     <div class="fw-label">ROWS</div><div class="fw-list">${mRow(DEMO[3])}${mRow(DEMO[0], { sel: true })}</div>`,
    560,
  ),
  note: 'Focus = 1 px red frame + 1 px inset (form-control authority). Busy keeps width. Disabled-by-policy is hatched and names its reason. Selected row = red inset rule.',
});

const palette = frame({
  title: 'DESKTOP SEARCH · ⌘K',
  chips: S.prop() + ' ' + S.impl('⌘K EXISTS · PRODUCTION SEARCH'),
  body: desktop({
    active: 'foundations',
    body: dRegistry({ sel: -1 }),
    overlay: `<div class="fw-scrim"></div><div class="fw-dialog" style="top:120px;transform:translateX(-50%);width:620px"><div style="padding:14px 18px;border-bottom:1px solid var(--fw-ink)" class="fw-row-flex">${icon('search', '', 'style="width:18px;height:18px"')}<span class="fw-data" style="font-size:15px;flex:1">carter</span><span class="fw-chip fw-chip--muted">ESC</span></div>
      <div style="padding:8px 0">${[
        ['CLIENTS', [[plate('Carter & Lane', { size: 'sm' }), 'CARTER & LANE', 'QUOTE · FOUNDER']]],
        ['REVIEWS', [[icon('review', '', 'style="width:18px;height:18px"'), 'QUOTE · CARTER & LANE', 'AWAITING APPROVAL']]],
        ['GO TO', [[`<span class="fw-idx">02</span>`, 'FOUNDATIONS', ''], [`<span class="fw-idx">06</span>`, 'SYSTEM · READINESS REPORT', '']]],
      ]
        .map(([g, rows]) => `<div class="fw-label" style="padding:8px 18px 4px">${g}</div>${rows.map(([lead, t, s], i) => `<div class="fw-row-flex" style="height:44px;padding:0 18px;${g === 'CLIENTS' && i === 0 ? 'background:#f4f3f0;box-shadow:inset 2px 0 0 var(--fw-red)' : ''}">${lead}<b style="font-size:9.5px;letter-spacing:.16em;flex:1">${t}</b><span class="fw-meta">${s}</span></div>`).join('')}`)
        .join('')}</div></div>`,
  }),
  note: 'The admin shell’s ⌘K modal, scoped to Digital Foundation inside the workspace: clients, reviews, destinations. Keyboard: ↑↓ move, ↵ open, ESC close. Typed text stays as typed.',
});

const notif = frame({
  title: 'DESKTOP NOTIFICATIONS',
  chips: S.prop() + ' ' + S.gap('G-10'),
  width: 560,
  body: desktop({
    w: 560,
    h: 560,
    active: 'overview',
    body: `${topbar({ n: '01', title: 'OVERVIEW', search: 'SEARCH' })}`,
    overlay: `<div class="fw-menu" style="right:16px;top:58px;width:360px;padding:0"><div class="fw-between" style="padding:12px 14px;border-bottom:1px solid var(--fw-ink)"><span class="fw-label">NEEDS YOU · 3</span><span class="fw-meta">MARK SEEN</span></div>${[
      ['founder', 'HORIZON FREIGHT', 'INTAKE COMPLETE · REVIEW', '1D'],
      ['founder', 'CARTER & LANE', 'QUOTE AWAITING APPROVAL', '3H'],
      ['blocked', 'VELA BOUTIQUE', 'TASK BLOCKED', '4D'],
      ['client', 'ATELIER BLOOM', 'INTAKE SAVED', '2H'],
    ]
      .map(([k, n, t, w]) => `<div class="fw-between" style="padding:10px 14px;border-bottom:1px solid var(--fw-hair)"><span class="fw-row-flex">${mk(k)}<span class="fw-who"><b style="font-size:9.5px">${n}</b><span>${t}</span></span></span><span class="fw-meta">${w}</span></div>`)
      .join('')}<div style="padding:10px 14px">${btn('OPEN REVIEWS', { sm: true, block: true })}</div></div>`,
  }),
  note: 'The same derived list as mobile (board 01), as a popover anchored to the bell. The bell finally has a handler.',
});

const sheetAnat = frame({
  title: 'SHEET ANATOMY',
  chips: S.prop(),
  body: phone({
    nav: 'foundations',
    body: `${mhead()}${mtitle({ n: '02', title: 'FOUNDATIONS' })}`,
    overlay: sheet('SHEET TITLE', `<div class="fw-meta" style="color:var(--fw-ink);line-height:1.7">ONE TASK PER SHEET. HEADER: TITLE + RED PERIOD + CLOSE. BODY SCROLLS. FOOTER HOLDS THE DECISION: SECONDARY LEFT (OUTLINE), PRIMARY RIGHT (INK, OR RED ONLY FOR CREATE / DESTRUCTIVE).</div>${kv([['MAX HEIGHT', 'VIEWPORT − 120 PX'], ['DISMISS', 'CLOSE · SCRIM · SWIPE DOWN'], ['FOCUS', 'TRAPPED · RETURNS TO TRIGGER']])}`, `${btn('SECONDARY', { tone: 'out', arrow: false })}${btn('PRIMARY', { block: true })}`, { top: '330px' }),
  }),
  note: 'Mobile sheets replace desktop dialogs and the desktop inspector one-for-one (board 25).',
});

mount(`${header({ num: '24', title: 'Global overlays + interaction states', round: 'E', sub: 'Every overlay and state the workspace uses, in one grammar: menus, sheets, dialogs, search, notifications, toasts, errors, empty, loading, stale, and control states. Replaces window.prompt, unconfirmed destructive clicks and bare error paragraphs.' })}
${section('01', 'MENUS, SHEETS, DIALOGS', `<div class="bd-row">${rowMenu}${sheetAnat}${destructive}</div>`)}
${section('02', 'SEARCH + NOTIFICATIONS', `<div class="bd-row">${palette}${notif}</div>`)}
${section('03', 'FEEDBACK + STATES', `<div class="bd-row">${toasts}${errorDetail}${emptyLoad}${states}</div>`)}
${foot('BOARD 24 / 28 · OVERLAYS + STATES', 'FD-W5 UNAVAILABLE ACTIONS · SHOWN DISABLED (RECOMMENDED) OR HIDDEN')}`);
