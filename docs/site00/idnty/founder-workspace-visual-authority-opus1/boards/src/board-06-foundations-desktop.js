import { header, section, frame, desktop, S, foot, mount, btn } from './fw-kit.js';
import { DEMO, clientInspector, menu } from './fw-parts.js';
import { dRegistry } from './fw-pages.js';

const a = frame({ title: 'REGISTRY + INSPECTOR', chips: S.prop() + ' ' + S.gap('G-01'), body: desktop({ active: 'foundations', body: dRegistry({ sel: 0 }), inspector: clientInspector(DEMO[0]) }),
  note: 'Columns by default: client · phase status · journey · whose move · next action · last activity. Hidden by default (column menu): referral source, created, quote total, payment. Selecting keeps the registry in place; double-click / ENTER opens the full record.' });
const b = frame({ title: 'SORT MENU + ROW ACTIONS', chips: S.prop(), body: desktop({ active: 'foundations', body: dRegistry({ sel: 2 }), overlay: menu([['next', 'NEEDS YOU FIRST', 'act', '✓'], ['time', 'RECENT ACTIVITY'], ['date', 'NEWEST'], ['business', 'BUSINESS A–Z']], 'right:40px;top:262px;width:230px') + menu([['external', 'OPEN FOUNDATION'], ['link', 'COPY PERSONAL LINK'], ['view', 'OPEN CLIENT VIEW'], ['message', 'MESSAGE CLIENT'], '-', ['send', 'RESEND INVITATION', 'off', 'N/A'], ['delete', 'ARCHIVE', 'off', 'N/A']], 'left:700px;top:440px;width:250px') }),
  note: 'Row action menu shows only supported actions live. RESEND INVITATION (G-05) and ARCHIVE (G-06) have no API today; they are listed disabled with “N/A” so the founder knows they are not missing by accident — or removed entirely if FD-W5 says so.' });
mount(`${header({ num: '06', title: 'Foundations · desktop', round: 'B', sub: 'A refined registry with selective columns, status views, sort, and a contextual preview that never destroys registry context.' })}
${section('01', 'REGISTRY', `<div class="bd-row">${a}</div>`)}
${section('02', 'MENUS', `<div class="bd-row">${b}</div>`)}
${foot('BOARD 06 / 28 · FOUNDATIONS · DESKTOP', 'FD-W5 UNAVAILABLE ACTIONS: SHOW DISABLED OR HIDE')}`);
