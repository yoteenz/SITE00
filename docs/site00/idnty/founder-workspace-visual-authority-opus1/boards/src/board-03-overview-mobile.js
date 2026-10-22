import { header, section, frame, phone, S, foot, mount, mhead, mtitle, btn, icon, mk } from './fw-kit.js';
import { DEMO, signals, mRow } from './fw-parts.js';
import { mOverview } from './fw-pages.js';

const a = frame({ title: 'OVERVIEW · FIRST SCREEN', chips: S.ref('REF B') + ' ' + S.prop('COMPOSITION'), body: phone({ nav: 'overview', body: mOverview() }),
  note: '<b>Zone A</b> identity · <b>Zone B</b> current focus (the oldest founder decision) · <b>Zone C</b> portfolio signals as one selectable rail, not four competing cards. Active work starts above the fold.' });
const b = frame({ title: 'OVERVIEW · SCROLLED', chips: S.prop(), body: phone({ nav: 'overview', body: mOverview({ scroll: 520 }) }),
  note: '<b>Zone D</b> active work (3 most relevant) · <b>Zone E</b> recent movement (events) · next milestone for the project nearest completion. Nothing from System lives here.' });
const c = frame({ title: 'SIGNAL SELECTED → FILTERED WORK', chips: S.prop(), body: phone({ nav: 'overview', body: `${mhead()}${mtitle({ n: '01', title: 'DIGITAL<br>FOUNDATION' })}<div class="fw-mbody fw-col fw-gap14">${signals(2)}<div class="fw-between"><span class="fw-h3">AWAITING CLIENT · 4</span><span class="fw-meta">CLEAR ×</span></div><div class="fw-list">${mRow(DEMO[2])}${mRow(DEMO[3])}${mRow(DEMO[5])}${mRow(DEMO[6])}</div></div>` }),
  note: 'Tapping a signal filters Active Work in place (no navigation). The selected segment inverts to ink. Tapping again clears.' });
const empty = frame({ title: 'EMPTY · NO FOUNDATIONS YET', chips: S.prop(), body: phone({ nav: 'overview', body: `${mhead({ dot: false })}${mtitle({ n: '01', title: 'DIGITAL<br>FOUNDATION' })}<div class="fw-mbody fw-col fw-gap14">${signals(-1, [0, 0, 0, 0])}<div class="fw-empty"><span class="fw-label">NOTHING IN PROGRESS</span><h2 class="fw-h2">CREATE THE FIRST<br>FOUNDATION<i class="fw-period"></i></h2><span class="fw-meta">A PERSONAL LINK IS CREATED WITH IT.</span>${btn('NEW FOUNDATION', { tone: 'red' })}</div></div>` }) });
const err = frame({ title: 'ERROR · BACKEND UNAVAILABLE', chips: S.prop(), body: phone({ nav: 'overview', body: `${mhead({ dot: false })}${mtitle({ n: '01', title: 'DIGITAL<br>FOUNDATION' })}<div class="fw-mbody fw-col fw-gap14"><div class="fw-banner fw-banner--red">${mk('founder')}WE COULDN'T LOAD YOUR FOUNDATIONS. NOTHING WAS CHANGED.<span style="margin-left:auto;text-decoration:underline">RETRY</span></div>${signals(-1, ['—', '—', '—', '—'])}<div class="fw-col fw-gap10">${'<span class="fw-skel" style="width:70%"></span><span class="fw-skel" style="width:90%"></span><span class="fw-skel" style="width:55%"></span>'}</div><span class="fw-meta">LAST SUCCESSFUL LOAD 09:14 · SYSTEM → API</span></div>` }),
  note: 'Signals show “—”, never zero, when the source failed (zero would be a false statement).' });

mount(`${header({ num: '03', title: 'Overview · mobile', round: 'B', sub: 'The founder opens the workspace and sees one thing first: the decision that is waiting longest. Everything else is compact and one tap from detail.' })}
${section('01', 'FOCUS → SIGNALS → WORK → MOVEMENT', `<div class="bd-row">${a}${b}${c}</div>`)}
${section('02', 'STATES', `<div class="bd-row">${empty}${err}</div>`)}
${foot('BOARD 03 / 28 · OVERVIEW · MOBILE', 'METRIC DEFINITIONS · DATA_CONTRACT_MAPPING.md §3–4')}`);
