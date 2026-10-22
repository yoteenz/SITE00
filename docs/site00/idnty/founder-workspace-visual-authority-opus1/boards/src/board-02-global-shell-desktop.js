import { header, section, frame, desktop, S, icon, btn, foot, mount, plate, NAV } from './fw-kit.js';
import { DEMO, clientInspector, menu } from './fw-parts.js';
import { dOverview, dRegistry, mOverview } from './fw-pages.js';

const full = frame({
  title: 'DESKTOP · NAVIGATION + STAGE + CONTEXTUAL INSPECTOR',
  chips: S.prop() + ' ' + S.alt('NO DESKTOP REFERENCE ATTACHED'),
  body: desktop({ active: 'foundations', body: dRegistry({ sel: 0 }), inspector: clientInspector(DEMO[0]) }),
  note: '<b>Left 232 px:</b> SITE 00 / FOUNDER + STAGING tag, NEW FOUNDATION (the one create entry), six destinations in the approved drawer index grammar with a live review count, the two existing tools, founder identity. <b>Centre:</b> index rail + page title + global search (⌘K). <b>Right 392 px:</b> the inspector exists only while something is selected — here a registry row — and closes with ESC or ×. Rows never stretch beyond the stage width.',
});

const account = frame({
  title: 'ACCOUNT MENU + ENVIRONMENT',
  chips: S.prop(),
  width: 560,
  body: desktop({
    w: 560,
    h: 520,
    active: 'overview',
    body: `<div class="fw-top"><span class="fw-label">01 · OVERVIEW</span></div>`,
    overlay: menu(
      [
        ['user', 'FOUNDER', '', 'ADMIN'],
        ['server', 'ENVIRONMENT', '', 'STAGING'],
        '-',
        ['checklist', 'READINESS DESK', ''],
        ['email', 'CORRESPONDENCE STUDIO', ''],
        ['external', 'OPEN CLIENT EXPERIENCE', ''],
        '-',
        ['back', 'SIGN OUT', 'danger'],
      ],
      'left:22px;bottom:70px;width:250px',
    ),
  }),
  note: 'Opened from the founder identity at the foot of the navigation. Today the admin shell has no account menu, no sign-out and a static “ONLINE” label; the environment tag here reads the real deployment (STAGING) from the readiness report.',
});

const tabletP = frame({
  title: 'TABLET PORTRAIT · 834 × 1112',
  chips: S.prop(),
  body: desktop({ w: 834, h: 1112, rail: true, active: 'overview', label: 'IPAD PORTRAIT · 834 × 1112', body: `<div style="zoom:1">${dOverview()}</div>` }),
  note: 'Icon rail (72 px, labelled with indices) instead of the full navigation; one working column; no inspector — selections open as a full-height sheet from the right.',
});

const tabletL = frame({
  title: 'TABLET LANDSCAPE · 1194 × 834',
  chips: S.prop(),
  body: desktop({ w: 1194, h: 834, rail: true, active: 'foundations', label: 'IPAD LANDSCAPE · 1194 × 834', body: dRegistry({ sel: 0 }), inspector: clientInspector(DEMO[0], { foot: false }) }),
  note: 'Rail + registry + inspector (360 px) only when ≥ 1100 px of width remains for the stage; below that the inspector becomes a sheet. Width, not device class, decides.',
});

mount(`
${header({ num: '02', title: 'Global shell · desktop', round: 'A', sub: 'The desktop is an operational command centre: compact persistent navigation, a central stage, and an inspector that appears only with a selected context. Reference A (desktop) was not attached, so this layout is derived from the mobile references and the brief.' })}
${section('01', 'DESKTOP COMMAND CENTRE', `<div class="bd-row">${full}</div>`)}
${section('02', 'ACCOUNT · TABLET', `<div class="bd-row">${account}${tabletP}${tabletL}</div>`)}
${foot('BOARD 02 / 28 · GLOBAL SHELL · DESKTOP + TABLET', 'FD-W2 DESKTOP INSPECTOR MODEL OPEN')}`);
