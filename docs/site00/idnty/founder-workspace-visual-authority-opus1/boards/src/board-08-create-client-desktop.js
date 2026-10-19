import { header, section, frame, desktop, S, foot, mount, btn, icon, field, mk, plate } from './fw-kit.js';
import { DEMO } from './fw-parts.js';
import { dRegistry } from './fw-pages.js';

const choice = (on, t, s, test) => `<div class="fw-choice ${on ? 'fw-choice--on' : ''}"><span class="fw-choice__dot"></span><span><b>${t}${test ? ' <span class="fw-chip fw-chip--test" style="margin-left:6px">TEST</span>' : ''}</b><span>${s}</span></span></div>`;
const dialog = (inner, w = 560) => `<div class="fw-scrim"></div><div class="fw-dialog" style="width:${w}px">${inner}</div>`;
const form = dialog(`<div class="fw-sheet__h"><div><div class="fw-rail" style="margin:0 0 8px"><b style="font-size:14px">+</b><span style="flex-basis:30px"></span><em>NEW FOUNDATION</em></div><h2 class="fw-h2" style="font-size:30px">CREATE A FOUNDATION<i class="fw-period"></i></h2></div><span class="fw-iconbtn">${icon('close')}</span></div>
  <div class="fw-sheet__b"><div class="fw-grid2">${choice(true, 'CLIENT FOUNDATION', 'CREATES THE ARTIFACT + PERSONAL LINK')}${choice(false, 'SYNTHETIC TEST CLIENT', 'STAGING · ALLOWLISTED EMAIL ONLY', true)}</div>
  <div class="fw-grid2">${field({ label: 'BUSINESS NAME', value: 'Harbor & Pine', data: true })}${field({ label: 'CONTACT NAME', value: 'Jo Marlow', data: true })}</div>
  ${field({ label: 'CONTACT EMAIL', value: 'jo@harborpine.invalid', data: true, state: 'focus' })}${field({ label: 'REFERRAL SOURCE', value: 'DIRECT' })}</div>
  <div class="fw-sheet__f" style="padding-bottom:18px;justify-content:flex-end">${btn('CANCEL', { tone: 'out', arrow: false })}${btn('CREATE FOUNDATION', { tone: 'red' })}</div>`);
const ok = dialog(`<div class="fw-sheet__h"><h2 class="fw-h2" style="font-size:30px">HARBOR & PINE IS READY<i class="fw-period"></i></h2><span class="fw-iconbtn">${icon('close')}</span></div>
  <div class="fw-sheet__b"><div class="fw-row-flex">${mk('client')}<span class="fw-st">INVITED · WAITING FOR THE CLIENT</span></div><div class="fw-label">PERSONAL LINK · NEVER EXPIRES</div><div class="fw-link"><code class="fw-data">https://site00.com/foundation/Qm9tZ…x2a</code>${btn('COPY', { sm: true, arrow: false, ic: 'link' })}</div>
  <div class="fw-banner fw-banner--policy">${icon('lock', '', 'style="width:14px;height:14px;flex:0 0 auto"')}NO EMAIL WAS SENT.</div></div>
  <div class="fw-sheet__f" style="padding-bottom:18px;justify-content:flex-end">${btn('OPEN CLIENT VIEW', { tone: 'out', ic: 'external', arrow: false })}${btn('OPEN FOUNDATION')}</div>`);
const a = frame({ title: 'CREATE DIALOG', chips: S.prop(), body: desktop({ active: 'foundations', body: dRegistry({ sel: -1 }), overlay: form }), note: 'Opened from NEW FOUNDATION (navigation) or ⌘K “NEW”. Focus starts in BUSINESS NAME; ESC cancels; ENTER submits only from the last field.' });
const b = frame({ title: 'LINK READY · NEW ROW IN PLACE', chips: S.prop(), body: desktop({ active: 'foundations', body: dRegistry({ sel: -1, rows: [{ ...DEMO[6], name: 'Harbor & Pine', cat: 'NOT YET PROVIDED', state: 'INVITED', last: 'NOW' }, ...DEMO.slice(0, 6)] }), overlay: ok }), note: 'On success the registry already contains the new row (from the confirmed response, then a list refresh) behind the dialog.' });
mount(`${header({ num: '08', title: 'Create client · desktop', round: 'B', sub: 'The same create contract as mobile, presented as a dialog over the registry so context is never lost.' })}
${section('01', 'FORM', `<div class="bd-row">${a}</div>`)}${section('02', 'CONFIRMED', `<div class="bd-row">${b}</div>`)}
${foot('BOARD 08 / 28 · CREATE CLIENT · DESKTOP', 'SAME STATES AS BOARD 07')}`);
