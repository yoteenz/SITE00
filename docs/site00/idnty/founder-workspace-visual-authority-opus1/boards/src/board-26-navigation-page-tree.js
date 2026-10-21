import { header, section, S, foot, mount } from './fw-kit.js';

// Page tree: destination → pages → overlays. Every leaf names its source capability.
const TREE = [
  {
    n: '01', t: 'OVERVIEW', route: '/admin/site00/foundation/overview', tag: 'NEW',
    pages: [['HOME', 'Focus · signals · active work · movement']],
    over: ['NOTIFICATIONS (DERIVED)', 'SIGNAL → FILTERED FOUNDATIONS'],
  },
  {
    n: '02', t: 'FOUNDATIONS', route: '/admin/site00/foundation', tag: 'R1 KEPT',
    pages: [
      ['REGISTRY', '?view=invited|intake|review|quote|active|complete'],
      ['CLIENT RECORD', '/:id (R2) · ?section='],
      ['· OVERVIEW', 'journey · next action · quick actions'],
      ['· INTAKE', 'submitted intake'],
      ['· RECOMMENDATIONS', 'recommendation engine'],
      ['· QUOTE', 'versions · approve · revise'],
      ['· OPERATIONS', 'R4 command + R5 workbench'],
      ['· RECORDS', 'ownership · completion'],
      ['· COMMUNICATIONS', 'per-client messages'],
      ['· ACTIVITY', 'events (G-03)'],
    ],
    over: ['CREATE (SHEET / DIALOG)', 'LINK READY', 'ROW MENU', 'COPY LINK TOAST', 'MARK COMPLETE CONFIRM'],
  },
  {
    n: '03', t: 'REVIEWS', route: '/admin/site00/foundation/reviews', tag: 'NEW',
    pages: [['QUEUE', '?tab=intakes|recommend|quotes|requests|exceptions|history'], ['REVIEW DETAIL', '/reviews/:kind/:id']],
    over: ['APPROVE CONFIRM', 'REQUEST CHANGES', 'ADD NOTE'],
  },
  {
    n: '04', t: 'OPERATIONS', route: '/admin/site00/foundation/operations', tag: 'NEW · R3 →',
    pages: [['ACTIVE WORK', 'projects by state (R3 pipeline)'], ['PROJECT', '→ record ?section=operations'], ['TASK', 'inspector / sheet']],
    over: ['TASK DETAIL', 'SET BLOCKER', 'VERIFY RESULT'],
  },
  {
    n: '05', t: 'CORRESPONDENCE', route: '/admin/site00/foundation/communications', tag: 'R6 KEPT',
    pages: [['ACTIVITY', 'intents + delivery status'], ['THREAD', 'per client'], ['LIFECYCLE MAP', 'eventMap · all OFF'], ['STUDIO', 'link to Correspondence Studio']],
    over: ['EMAIL PREVIEW', 'COMPOSE MESSAGE', 'SEND (GATED)'],
  },
  {
    n: '06', t: 'SYSTEM', route: '/admin/site00/foundation/system', tag: 'NEW · R7 KEPT',
    pages: [['OVERVIEW', 'verdict + modules'], ['STACK', 'staging stack'], ['INTEGRATIONS', 'Stripe · Resend · DNS'], ['SECURITY', 'RLS probe · session'], ['TEST LAB', 'R7 synthetic harness'], ['READINESS REPORT', 'R7 report + config']],
    over: ['MODULE DETAIL', 'SEND TEST (APPROVAL TICK)', 'RESET CONFIRM'],
  },
];

const node = (t, sub, kind = '') =>
  `<div style="border:1px solid ${kind === 'dest' ? '#0c0c0c' : kind === 'over' ? '#ce1017' : '#c9c7c2'};background:${kind === 'dest' ? '#0c0c0c' : '#fff'};color:${kind === 'dest' ? '#fff' : kind === 'over' ? '#b30f17' : '#0c0c0c'};padding:8px 10px;border-radius:3px;${kind === 'over' ? 'border-style:dashed;' : ''}"><div style="font-size:9.5px;font-weight:700;letter-spacing:.16em">${t}</div>${sub ? `<div style="margin-top:4px;font-size:8.5px;letter-spacing:.04em;color:${kind === 'dest' ? '#c9c7c2' : '#75736e'};font-family:'Saira Semi Condensed'">${sub}</div>` : ''}</div>`;

const tree = `<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:14px;position:relative">
  <div style="grid-column:1/-1;display:flex;justify-content:center;margin-bottom:6px">${node('FOUNDER WORKSPACE SHELL', 'header · ⌘K search · notifications · account · nav (bottom / rail / sidebar) · CREATE', 'dest')}</div>
  <div style="grid-column:1/-1;height:1px;background:#0c0c0c;margin:0 8%"></div>
  ${TREE.map(
    (d) => `<div style="display:flex;flex-direction:column;gap:8px">
      <div style="width:1px;height:14px;background:#0c0c0c;margin-left:16px"></div>
      ${node(`${d.n} ${d.t}`, `<code style="font-size:8px">${d.route}</code>`, 'dest')}
      <div class="bd-kicker" style="margin:2px 0">${d.tag}</div>
      ${d.pages.map(([t, s]) => node(t, s)).join('')}
      <div class="bd-kicker" style="margin:6px 0 0">OVERLAYS</div>
      ${d.over.map((o) => node(o, '', 'over')).join('')}
    </div>`,
  ).join('')}
</div>
<div class="bd-row" style="margin-top:18px">${node('TOOLS (UNCHANGED)', 'Readiness Desk R7 · Correspondence Studio /admin/site00/correspondence-studio/* · email-pack debug')}${node('PUBLIC CLIENT (CONTEXT ONLY)', '/foundation/:token · /foundation/review · /invite/:code — never inside the workspace; opened in a new tab')}${node('PAGE', 'solid border')}${node('OVERLAY', 'dashed red', 'over')}</div>`;

const ROUTES = [
  ['R1', '/admin/site00/foundation', 'Founder mini console (list)', '02 FOUNDATIONS · REGISTRY', 'PRESERVED · SAME PATH'],
  ['R2', '/admin/site00/foundation/:id', 'Detail (state, intake, quote, events, mark complete)', '02 · CLIENT RECORD', 'PRESERVED · SAME PATH'],
  ['R3', '/admin/site00/foundation/pipeline', 'Pipeline table', '04 OPERATIONS · ACTIVE WORK', 'REDIRECT (KEEP PATH)'],
  ['R4', '/admin/site00/foundation/:id/command', 'Project command (JSON)', 'RECORD · OPERATIONS', 'REDIRECT → ?section=operations'],
  ['R5', '/admin/site00/foundation/:id/workbench', 'Workbench (JSON)', 'RECORD · OPERATIONS · TASKS', 'REDIRECT → ?section=operations&view=tasks'],
  ['R6', '/admin/site00/foundation/communications', 'Static policy text', '05 CORRESPONDENCE', 'PRESERVED · SAME PATH'],
  ['R7', '/admin/site00/foundation-readiness', 'Readiness Desk (auth return path)', '06 SYSTEM · TEST LAB + REPORT', 'PRESERVED · RENDERS UNTIL FD-W7'],
  ['NEW', '/admin/site00/foundation/overview', '—', '01 OVERVIEW', 'ADDED · STATIC SEGMENT'],
  ['NEW', '/admin/site00/foundation/reviews', '—', '03 REVIEWS', 'ADDED · STATIC SEGMENT'],
  ['NEW', '/admin/site00/foundation/operations', '—', '04 OPERATIONS', 'ADDED · STATIC SEGMENT'],
  ['NEW', '/admin/site00/foundation/system', '—', '06 SYSTEM', 'ADDED · STATIC SEGMENT'],
];
const routes = `<div class="bd-panel"><table class="bd-table"><thead><tr><th>#</th><th>PATH</th><th>TODAY</th><th>PROPOSED DESTINATION</th><th>DISPOSITION</th></tr></thead><tbody>${ROUTES.map(
  ([n, p, a, b, d]) => `<tr><td>${n}</td><td><code>${p}</code></td><td>${a}</td><td>${b}</td><td>${d}</td></tr>`,
).join('')}</tbody></table><div class="bd-note">New paths are static segments under <code>/admin/site00/foundation</code>, the same pattern R3 (<code>/pipeline</code>) and R6 (<code>/communications</code>) already use beside <code>/:id</code>; React Router ranks static segments above <code>:id</code>. Every existing URL keeps resolving. FD-W6 decides the workspace landing route (recommended: admin nav “DIGITAL FOUNDATION” → <code>/overview</code>).</div></div>`;

const FLOWS = [
  ['DECIDE', 'OVERVIEW focus → REVIEW DETAIL → APPROVE (confirm) → toast → next decision'],
  ['CREATE', 'CREATE → form → LINK READY (copy / open client view) → RECORD'],
  ['FIND', '⌘K / search → client → RECORD section'],
  ['UNBLOCK', 'NOTIFICATION (blocked) → RECORD · OPERATIONS → TASK → set / clear blocker'],
  ['DIAGNOSE', 'SYSTEM verdict → module → next action → re-run report'],
  ['TEST', 'SYSTEM · TEST LAB → create synthetic → journey steps → gated send → reset (confirm)'],
];
const flows = `<div class="bd-panel" style="width:880px"><table class="bd-table"><thead><tr><th>FLOW</th><th>PATH THROUGH THE TREE</th><th>TAPS (PHONE)</th></tr></thead><tbody>${FLOWS.map(([f, p], i) => `<tr><td>${f}</td><td>${p}</td><td class="r">${[3, 3, 2, 4, 3, 5][i]}</td></tr>`).join('')}</tbody></table></div>`;

mount(`${header({ num: '26', title: 'Full navigation + page tree', round: 'F', sub: 'Every destination, page, section and overlay in the proposed workspace, with the route each one lives at and what happens to all seven existing founder routes.' })}
${section('01', 'PAGE TREE', tree, S.prop())}
${section('02', 'ROUTE MAPPING · NOTHING BREAKS', routes, S.prop() + ' ' + S.dec('FD-W6'))}
${section('03', 'PRIMARY FLOWS', `<div class="bd-row">${flows}</div>`)}
${foot('BOARD 26 / 28 · NAVIGATION + PAGE TREE', 'R7 AUTH RETURN PATH PRESERVED · ALL SEVEN ROUTES RESOLVE')}`);
