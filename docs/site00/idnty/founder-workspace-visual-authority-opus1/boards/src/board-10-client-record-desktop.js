import { header, section, frame, desktop, S, foot, mount, act } from './fw-kit.js';
import { DEMO } from './fw-parts.js';
import { dRecord, reviewInspector } from './fw-pages.js';
import { REVIEWS } from './fw-parts.js';

const a = frame({ title: 'CLIENT WORKSPACE · OVERVIEW', chips: S.prop(), body: desktop({ active: 'foundations', body: dRecord(DEMO[0]) }),
  note: 'Header: plate, name, category, email (case preserved), actions. Journey panel: eight phases with dates from events, the current one in red. Section tabs (all eight). Overview: founder decision, intake / recommendation / quote summaries, personal link (never expires; quotes expire after 14 days — stated separately), recent movement.' });
const b = frame({ title: 'WITH CONTEXT INSPECTOR', chips: S.prop(), body: desktop({ active: 'foundations', body: dRecord(DEMO[0]), inspector: reviewInspector(REVIEWS[0]) }), note: 'Opening the decision keeps the record visible; the inspector carries the evidence summary and OPEN FULL REVIEW.' });
mount(`${header({ num: '10', title: 'Client foundation record · desktop', round: 'C', sub: 'A workspace for one client: progress system, contextual data and section relationships in one view.' })}
${section('01', 'RECORD', `<div class="bd-row">${a}</div>`)}${section('02', 'INSPECTOR', `<div class="bd-row">${b}</div>`)}
${foot('BOARD 10 / 28 · CLIENT RECORD · DESKTOP', 'DETAIL READS MEMORY UNTIL G-07 · EVENTS UNTIL G-03')}`);
