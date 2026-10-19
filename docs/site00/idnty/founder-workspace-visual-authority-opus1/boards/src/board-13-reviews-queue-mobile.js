import { header, section, frame, phone, S, foot, mount, btn, mk, mhead, mtitle, tabs } from './fw-kit.js';
import { REVIEWS, reviewItem } from './fw-parts.js';
import { mReviews, REVIEW_TABS } from './fw-pages.js';

const all = frame({ title: 'QUEUE · ALL', chips: S.ref('REF E') + ' ' + S.prop('GEOMETRY'), body: phone({ nav: 'reviews', body: mReviews() }),
  note: 'Each item: client · review type · why it needs you · since when · the one primary action (ink). Exceptions use an outline action and the hollow-red BLOCKED mark: colour carries meaning, not decoration.' });
const quotes = frame({ title: 'QUOTES', chips: S.prop(), body: phone({ nav: 'reviews', body: mReviews({ on: 3, items: [REVIEWS[1]] }) }), note: 'Tabs map to derivation rules (DATA_CONTRACT_MAPPING §4), not to stored queues.' });
const exc = frame({ title: 'EXCEPTIONS', chips: S.prop(), body: phone({ nav: 'reviews', body: `${mhead()}${mtitle({ n: '03', title: 'REVIEWS' })}<div style="padding:0 16px">${tabs(['ALL', 'INTAKES', 'QUOTES', 'REQUESTS', ['EXCEPTIONS', '1']], 4)}<div class="fw-mt14">${reviewItem(REVIEWS[3])}</div></div>` }) });
const empty = frame({ title: 'EMPTY · ALL CLEAR', chips: S.prop(), body: phone({ nav: 'reviews', body: `${mhead({ dot: false })}${mtitle({ n: '03', title: 'REVIEWS' })}<div style="padding:0 16px">${tabs(['ALL', 'INTAKES', 'QUOTES', 'REQUESTS', 'EXCEPTIONS'], 0)}<div class="fw-empty fw-mt14"><span class="fw-label">NOTHING WAITS ON YOU</span><h2 class="fw-h2">ALL CLEAR<i class="fw-period"></i></h2><span class="fw-meta">NEW INTAKES, QUOTES AND CLIENT REQUESTS APPEAR HERE.</span>${btn('VIEW HISTORY', { tone: 'out', sm: true })}</div></div>` }) });
mount(`${header({ num: '13', title: 'Reviews queue · mobile', round: 'C', sub: 'The founder decision workspace: only what needs a decision, by type, oldest first, each with one clear action. Urgency is never invented — the only ordering signal is how long it has waited.' })}
${section('01', 'QUEUE', `<div class="bd-row">${all}${quotes}${exc}${empty}</div>`)}
${foot('BOARD 13 / 28 · REVIEWS QUEUE · MOBILE', 'NO QUEUE TABLE EXISTS · QUEUE IS DERIVED (DATA_CONTRACT_MAPPING §4)')}`);
