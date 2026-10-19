import { header, section, frame, phone, S, icon, mhead, mtitle, NAV, brand, field, btn, mk, status, foot, plate, arch, CHEV } from './fw-kit.js';
import { DEMO, focusBlock, signals, mRow, sheet, menu } from './fw-parts.js';

const home = frame({
  title: 'SHELL ANATOMY · HOME',
  chips: S.ref('REF B') + ' ' + S.prop('GEOMETRY'),
  body: phone({
    nav: 'overview',
    body: `${mhead()}${mtitle({ n: '01', title: 'DIGITAL<br>FOUNDATION', sub: 'CLIENTS · PROGRESS · NEXT ACTIONS', arch: arch('crown', 'right:-10px;top:0;width:128px;height:228px') })}
      <div class="fw-mbody fw-col fw-gap14">${focusBlock(DEMO[0], { compact: true })}${signals()}<div class="fw-between"><span class="fw-h3">ACTIVE WORK</span><span class="fw-meta">VIEW ALL →</span></div><div class="fw-list">${mRow(DEMO[1])}${mRow(DEMO[4])}</div></div>`,
  }),
  note: '<b>Header:</b> SITE 00 / FOUNDER wordmark in Saira 600 (the DF client header treatment, not the reference monospace), STAGING environment tag, search, notifications, workspace menu. <b>Title:</b> index rail + display headline + red period. <b>Bottom nav:</b> HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM (reference), with a red 3 px-radius create block instead of a circle.',
});

const drawer = frame({
  title: 'WORKSPACE MENU · ALL SIX DESTINATIONS',
  chips: S.prop() + ' ' + S.rec(),
  body: phone({
    nav: 'overview',
    body: `${mhead()}${mtitle({ n: '01', title: 'DIGITAL<br>FOUNDATION' })}`,
    overlay: `<div class="fw-scrim"></div><div class="fw-drawer"><div class="fw-mhead" style="padding-right:12px">${brand()}<span class="fw-iconbtn">${icon('close')}</span></div>
      <div style="padding:10px 22px">
        <div class="fw-label" style="margin:6px 0 4px">WORKSPACE</div>
        ${NAV.map((n, i) => `<div class="fw-side__i ${i === 0 ? 'fw-side__i--on' : ''}" style="height:46px"><span class="fw-idx">${n.n}</span><span class="c"></span><span>${n.label}</span>${n.id === 'reviews' ? '<span class="fw-chip fw-chip--count">3</span>' : CHEV}</div>`).join('')}
        <div class="fw-side__sep"></div>
        <div class="fw-label" style="margin:2px 0 4px">TOOLS</div>
        <div class="fw-side__i" style="height:42px"><span class="fw-idx">—</span><span class="c"></span><span>READINESS DESK</span>${CHEV}</div>
        <div class="fw-side__i" style="height:42px"><span class="fw-idx">—</span><span class="c"></span><span>CORRESPONDENCE STUDIO</span>${CHEV}</div>
        <div class="fw-side__sep"></div>
        <div class="fw-row-flex" style="padding:6px 0">${plate('Founder', { size: 'sm' })}<span class="fw-who"><b style="font-size:9.5px">FOUNDER</b><span class="fw-data" style="font-size:9px">founder@site00.com</span></span></div>
        <div class="fw-side__i" style="height:40px"><span class="fw-idx">—</span><span class="c"></span><span>SIGN OUT</span></div>
      </div></div>`,
  }),
  note: 'OPERATIONS and CORRESPONDENCE are never hidden behind an unlabelled icon: the labelled MENU (top right) opens the approved DF drawer grammar listing all six destinations by index, the two existing tools, founder identity and sign-out (none exist in the admin shell today).',
});

const notif = frame({
  title: 'NOTIFICATION CENTER',
  chips: S.prop() + ' ' + S.gap('G-10 · DERIVED'),
  body: phone({
    nav: 'overview',
    body: `${mhead()}${mtitle({ n: '01', title: 'DIGITAL<br>FOUNDATION' })}`,
    overlay: sheet(
      'NEEDS YOU',
      `<div class="fw-label">3 FOUNDER DECISIONS · 2 CHANGES SINCE YOU LOOKED</div>
       ${[
         ['founder', 'HORIZON FREIGHT', 'INTAKE COMPLETE · REVIEW', '1D'],
         ['founder', 'CARTER & LANE', 'QUOTE AWAITING APPROVAL', '3H'],
         ['blocked', 'VELA BOUTIQUE', 'TASK BLOCKED · REGISTRAR ACCESS', '4D'],
         ['client', 'ATELIER BLOOM', 'INTAKE SAVED', '2H'],
         ['work', 'FIELD & EMBER', 'SPF RECORD COMPLETED', '40M'],
       ]
         .map(([k, n, t, w]) => `<div class="fw-between" style="padding:10px 0;border-bottom:1px solid var(--fw-hair)"><span class="fw-row-flex">${mk(k)}<span class="fw-who"><b style="font-size:9.5px">${n}</b><span>${t}</span></span></span><span class="fw-meta">${w}</span></div>`)
         .join('')}`,
      `${btn('OPEN REVIEWS', { block: true })}`,
      { top: '120px' },
    ),
  }),
  note: 'There is no notification store today (G-10). The center is derived: founder-decision items first (the review queue), then recent movement (events — memory-only until G-03). The red dot on the bell means “a founder decision exists”, nothing else.',
});

const search = frame({
  title: 'SEARCH / COMMAND',
  chips: S.prop(),
  body: phone({
    nav: false,
    body: `<div class="fw-mhead"><span class="fw-label" style="letter-spacing:.24em">SEARCH</span><span class="fw-iconbtn">${icon('close')}</span></div>
      <div style="padding:0 16px">${field({ label: 'FIND A CLIENT, REVIEW OR TASK', value: 'carter', state: 'focus', data: true })}
      <div class="fw-label fw-mt14">CLIENTS</div><div class="fw-list fw-mt8">${mRow(DEMO[1])}</div>
      <div class="fw-label fw-mt14">REVIEWS</div><div class="fw-list fw-mt8"><div class="fw-row"><span>${icon('review', '', 'style="width:18px;height:18px"')}</span><div class="fw-who"><b>QUOTE · CARTER & LANE</b><span>AWAITING APPROVAL · 3H</span></div>${CHEV}</div></div>
      <div class="fw-label fw-mt14">GO TO</div><div class="fw-list fw-mt8">${['02 FOUNDATIONS', '04 OPERATIONS', '06 SYSTEM · READINESS'].map((t) => `<div class="fw-row"><span class="fw-idx">${t.slice(0, 2)}</span><div class="fw-who"><b>${t.slice(3)}</b></div>${CHEV}</div>`).join('')}</div></div>
      <div class="bd-system" style="position:absolute;left:0;right:0;bottom:0;height:300px">IOS KEYBOARD · SYSTEM UI · SCHEMATIC</div>`,
  }),
  note: 'Full-screen on phones (keyboard-aware: results sit above the keyboard). Grouped results: clients (business name, email), reviews, destinations. Case-sensitive input is never uppercased (the typed value stays as typed).',
});

const create = frame({
  title: 'CREATE · ENTRY',
  chips: S.prop() + ' ' + S.ref('CENTER CREATE'),
  body: phone({
    nav: 'overview',
    body: `${mhead()}${mtitle({ n: '01', title: 'DIGITAL<br>FOUNDATION' })}`,
    overlay: sheet(
      'CREATE',
      `<div class="fw-nrow">${icon('client')}<span class="fw-nrow__t"><b>NEW CLIENT FOUNDATION</b><span>CREATE ARTIFACT + PERSONAL LINK</span></span><span></span>${CHEV}</div>
       <div class="fw-nrow">${icon('tools')}<span class="fw-nrow__t"><b>SYNTHETIC TEST CLIENT</b><span>STAGING · ALLOWLISTED EMAIL ONLY</span></span><span>${'<span class="fw-chip fw-chip--test">TEST</span>'}</span>${CHEV}</div>
       <div class="fw-nrow" style="opacity:.55">${icon('email')}<span class="fw-nrow__t"><b>PREPARE INVITATION</b><span>AFTER A FOUNDATION EXISTS · OPEN A CLIENT</span></span><span></span>${CHEV}</div>`,
      '',
      { rail: '+' },
    ),
  }),
  note: 'One create entry for the whole workspace (today: a “Create lead + link” button with a hard-coded email, and a separate test-client form on the Readiness Desk). Only actions the API supports appear.',
});

const rules = `<div class="bd-panel" style="width:760px"><table class="bd-table"><thead><tr><th>SLOT</th><th>MOBILE BEHAVIOUR</th><th>SOURCE / STATUS</th></tr></thead><tbody>
<tr><td>HOME</td><td>01 OVERVIEW</td><td>REF B · PROPOSED</td></tr>
<tr><td>FOUNDATIONS</td><td>02 registry → client record (push)</td><td>REF C/D</td></tr>
<tr><td>CREATE</td><td>Bottom sheet (not a page); red 44×40 block, label below</td><td>REF · geometry PROPOSED</td></tr>
<tr><td>REVIEWS</td><td>03 queue; badge = founder decisions count (§4 DATA_CONTRACT_MAPPING)</td><td>REF E</td></tr>
<tr><td>SYSTEM</td><td>06 category-first diagnostics</td><td>REF G</td></tr>
<tr><td>MENU (header)</td><td>All six destinations incl. 04 OPERATIONS, 05 CORRESPONDENCE; tools; account; sign-out</td><td>PROPOSED · FD-W1</td></tr>
<tr><td>BACK</td><td>Pushed views (record, review detail, task) show ← in the header; bottom nav stays</td><td>PROPOSED</td></tr>
</tbody></table></div>`;

document.getElementById('board').innerHTML = `
${header({ num: '01', title: 'Global shell · mobile', round: 'A', sub: 'One shell for all six destinations on iPhone Safari. Built from founder references B–G; geometry refined to SITE 00 rectilinear controls; typography restricted to SITE 00 Display + Saira Semi Condensed.' })}
${section('01', 'SHELL, MENU, NOTIFICATIONS', `<div class="bd-row">${home}${drawer}${notif}</div>`)}
${section('02', 'SEARCH AND CREATE ENTRY', `<div class="bd-row">${search}${create}${rules}</div>`)}
${foot('BOARD 01 / 28 · GLOBAL SHELL · MOBILE', 'FD-W1 MOBILE NAVIGATION OPEN · NOTHING APPROVED')}`;
document.fonts.ready.then(() => (document.body.dataset.ready = '1'));
