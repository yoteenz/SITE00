import { header, section, frame, desktop, S, foot, mount } from './fw-kit.js';
import { DEMO, clientInspector } from './fw-parts.js';
import { dOverview, reviewInspector } from './fw-pages.js';

const a = frame({ title: 'OVERVIEW · DESKTOP', chips: S.prop(), body: desktop({ active: 'overview', body: dOverview() }),
  note: 'Spatial composition: the threshold hero object frames the headline once (Overview only). Left: current focus + the founder decision queue. Right: portfolio signals + recent movement. Below: active work as a compact registry. No system reports.' });
const b = frame({ title: 'OVERVIEW · ITEM SELECTED', chips: S.prop(), body: desktop({ active: 'overview', body: dOverview(), inspector: clientInspector(DEMO[1]) }),
  note: 'Selecting any row or decision opens the inspector without leaving the Overview. OPEN FOUNDATION goes to the full record.' });
mount(`${header({ num: '04', title: 'Overview · desktop', round: 'B', sub: 'One dominant focus, a decision queue beside it, then work and movement — a command view, not a report.' })}
${section('01', 'DEFAULT', `<div class="bd-row">${a}</div>`)}
${section('02', 'WITH INSPECTOR', `<div class="bd-row">${b}</div>`)}
${foot('BOARD 04 / 28 · OVERVIEW · DESKTOP', 'FOCUS RULE · OVERVIEW_PAGE_SPECIFICATION.md')}`);
