import { header, section, frame, phone, S, foot, mount, btn, icon, mk, status, kv, act, tabs, CHEV } from './fw-kit.js';
import { DEMO, menu, sheet, toast } from './fw-parts.js';
import { mRecord, mRecordHead, quickActions, H, A } from './fw-pages.js';

const a = frame({ title: 'RECORD · FOUNDER MOVE', chips: S.ref('REF D') + ' ' + S.prop('GEOMETRY'), body: phone({ nav: 'foundations', body: mRecord(H) }),
  note: 'Slim threshold band (DF corner object) instead of a client photo. Status, step and an eight-phase bar replace “70% COMPLETE”. RESEND is shown unavailable (no API, G-05).' });
const b = frame({ title: 'RECORD · CLIENT MOVE', chips: S.prop(), body: phone({ nav: 'foundations', body: mRecord(A) }), note: 'Hollow ink mark = waiting on the client. No founder CTA appears when nothing is the founder’s to do.' });
const more = frame({ title: 'MORE SECTIONS + ACTIONS', chips: S.prop(), body: phone({ nav: 'foundations', body: mRecord(H), overlay: sheet('HORIZON FREIGHT', `
  <div class="fw-label">SECTIONS</div>${['RECOMMENDATIONS · MANUAL REVIEW', 'RECORDS · NOT YET', 'COMMUNICATIONS · 3 MESSAGES', 'ACTIVITY · 6 EVENTS'].map((t) => `<div class="fw-between" style="padding:11px 0;border-bottom:1px solid var(--fw-hair)"><b style="font-size:9.5px;letter-spacing:.18em">${t.split(' · ')[0]}</b><span class="fw-row-flex"><span class="fw-meta">${t.split(' · ')[1]}</span>${CHEV}</span></div>`).join('')}
  <div class="fw-label fw-mt8">ACTIONS</div>${['COPY PERSONAL LINK', 'OPEN CLIENT VIEW', 'MESSAGE CLIENT'].map((t) => `<div style="padding:11px 0;border-bottom:1px solid var(--fw-hair)"><b style="font-size:9.5px;letter-spacing:.18em">${t}</b></div>`).join('')}
  <div class="fw-between" style="padding:11px 0;color:var(--fw-faint)"><b style="font-size:9.5px;letter-spacing:.18em">RESEND INVITATION · ARCHIVE</b><span class="fw-meta">NOT AVAILABLE</span></div>`, '', { top: '130px' }) }),
  note: 'Eight sections do not fit one phone row: OVERVIEW / INTAKE / QUOTE / OPS stay as tabs, the rest live under MORE.' });
const copied = frame({ title: 'COPY LINK · CONFIRMED', chips: S.prop(), body: phone({ nav: 'foundations', body: mRecord(H), overlay: toast('PERSONAL LINK COPIED', { style: 'position:absolute;left:16px;right:16px;bottom:100px;z-index:40' }) }), note: 'The quick action shows a toast and a 2 s ink underline on the button (fw-qa__i--done). Clipboard failure shows the link in a selectable field instead.' });

mount(`${header({ num: '09', title: 'Client foundation record · mobile', round: 'C', sub: 'Opening a client feels like opening their Digital Foundation: identity, where they are, whose move it is, and the one next action.' })}
${section('01', 'RECORD', `<div class="bd-row">${a}${b}</div>`)}${section('02', 'SECTIONS · ACTIONS', `<div class="bd-row">${more}${copied}</div>`)}
${foot('BOARD 09 / 28 · CLIENT RECORD · MOBILE', 'JOURNEY PHASES MAP TO artifact.state (DATA_CONTRACT_MAPPING.md §2)')}`);
