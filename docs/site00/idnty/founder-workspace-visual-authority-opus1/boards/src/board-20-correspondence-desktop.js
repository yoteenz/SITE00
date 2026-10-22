import { header, section, frame, desktop, S, foot, mount } from './fw-kit.js';
import { dCorr, corrInspector } from './fw-pages.js';
const a = frame({ title: 'LIFECYCLE EMAIL · DELIVERY + PREVIEW', chips: S.prop() + ' ' + S.gap('G-09 INTENTS IN MEMORY'), body: desktop({ active: 'correspondence', body: dCorr(), inspector: corrInspector() }),
  note: 'One table for every send intent with its real status (DRY RUN, SIMULATED, ACCEPTED, DELIVERED, BOUNCED…). The inspector previews the FNDATN-01 template and shows exactly which gate blocks sending. TEMPLATES ↗ opens Correspondence Studio (unchanged), not a second editor.' });
mount(`${header({ num: '20', title: 'Correspondence · desktop', round: 'D', sub: 'A correspondence workspace that ties templates, send intents, delivery and client threads to each client — not a Gmail clone and not a hidden button.' })}
${section('01', 'WORKSPACE', `<div class="bd-row">${a}</div>`)}
${foot('BOARD 20 / 28 · CORRESPONDENCE · DESKTOP', 'CORRESPONDENCE STUDIO STAYS THE TEMPLATE AUTHORITY (CANNOT SEND)')}`);
