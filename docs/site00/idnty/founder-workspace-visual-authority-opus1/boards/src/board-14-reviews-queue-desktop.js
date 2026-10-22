import { header, section, frame, desktop, S, foot, mount } from './fw-kit.js';
import { REVIEWS } from './fw-parts.js';
import { dReviews, reviewInspector } from './fw-pages.js';
const a = frame({ title: 'REVIEW WORKBENCH', chips: S.prop(), body: desktop({ active: 'reviews', body: dReviews({ sel: 0 }), inspector: reviewInspector(REVIEWS[0]) }),
  note: 'Prioritised table (oldest decision first; exceptions after decisions of the same age). Selecting a row opens the evidence summary; J/K move the selection; ENTER opens the full review. The last-event column names the real event type behind each item.' });
mount(`${header({ num: '14', title: 'Reviews queue · desktop', round: 'C', sub: 'A review workbench: queue, selection and inspector in one view.' })}
${section('01', 'WORKBENCH', `<div class="bd-row">${a}</div>`)}
${foot('BOARD 14 / 28 · REVIEWS QUEUE · DESKTOP', 'TIMESTAMPS FROM EVENTS · MEMORY-ONLY UNTIL G-03')}`);
