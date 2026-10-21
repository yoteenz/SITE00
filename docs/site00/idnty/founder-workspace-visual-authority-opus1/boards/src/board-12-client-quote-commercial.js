import { DF, header, section, frame, phone, desktop, S, foot, mount, btn, icon, mk, chip, status, kv, tabs, money, field } from './fw-kit.js';
import { DEMO, sheet } from './fw-parts.js';
import { mRecordHead, dRecord } from './fw-pages.js';

const C = DEMO[1];
const mb = DF.addons.find((a) => a.id === 'ADDITIONAL_MAILBOX');
const mig = DF.addons.find((a) => a.id === 'LEGACY_EMAIL_MIGRATION');
const base = DF.config.base_price_minor;
const lines = [
  ['BASE DIGITAL FOUNDATION', 1, base, ''],
  [mb.title, 2, mb.price_minor_units * 2, `${money(mb.price_minor_units)} EACH`],
  [mig.title, 1, mig.price_minor_units, 'MANUAL REVIEW'],
];
const total = lines.reduce((s, l) => s + l[2], 0);
const quote = (adj = 0) => `<div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">QUOTE V2 · CLIENT REVIEW</span>${chip('req', 'NOT APPROVED')}</div><div class="fw-panel__b fw-col fw-gap10">
  ${lines.map(([t, q, p, s]) => `<div class="fw-between"><span class="fw-who"><b style="font-size:9.5px">${t}${q > 1 ? ` × ${q}` : ''}</b><span>${s}</span></span><b style="font-size:10px;letter-spacing:.1em">${money(p)}</b></div>`).join('')}
  ${adj ? `<div class="fw-between"><span class="fw-who"><b style="font-size:9.5px">MANUAL ADJUSTMENT</b><span>FOUNDER</span></span><b style="font-size:10px">${money(adj)}</b></div>` : ''}
  <div class="fw-between" style="border-top:1px solid var(--fw-ink);padding-top:10px"><b class="fw-h3">SUBTOTAL</b><span class="fw-num" style="font-size:30px">${money(total + adj)}</span></div>
  ${kv([['TURNAROUND', `${DF.config.base_min_business_days}–${DF.config.base_max_business_days} BUSINESS DAYS + MIGRATION REVIEW`], ['EXPIRES', `OCT 30 · ${DF.config.quote_expiry_days} DAYS AFTER ISSUE`], ['ACCEPTANCE', 'NOT ACCEPTED'], ['PAYMENT', 'NONE']])}
  <div class="fw-banner">${icon('info', '', 'style="width:14px;height:14px;flex:0 0 auto"')}${DF.config.third_party_cost_notice.toUpperCase()}</div>
</div></div>`;
const mQuote = frame({ title: 'QUOTE · AWAITING APPROVAL', chips: S.prop(), body: phone({ nav: 'foundations', body: `${mRecordHead(C, { band: false })}<div style="padding:12px 16px 0" class="fw-col fw-gap10">${tabs(['OVERVIEW', 'INTAKE', 'QUOTE', 'OPS', 'MORE'], 2)}${quote()}</div><div class="fw-sheet__f" style="position:absolute;left:0;right:0;bottom:84px;background:#fff">${btn('REVISE', { tone: 'out', arrow: false })}${btn('APPROVE QUOTE', { block: true })}</div>` }),
  note: 'Real line items, prices and notices from the catalog and commercial config. APPROVE = quote-commercial-ready; REVISE = update-quote / manual-adjustment. The decision bar is fixed and visually separate from navigation.' });
const mConfirm = frame({ title: 'APPROVE · CONFIRMATION', chips: S.prop(), body: phone({ nav: 'foundations', body: `${mRecordHead(C, { band: false })}`, overlay: sheet('APPROVE QUOTE V2', `<div class="fw-meta" style="color:var(--fw-ink);line-height:1.7">THE CLIENT WILL SEE THIS QUOTE AND CAN ACCEPT AND PAY ${money(total)}. YOU CAN STILL REVISE IT UNTIL THEY ACCEPT.</div>${kv([['CLIENT', 'CARTER & LANE'], ['VERSION', 'V2'], ['SUBTOTAL', money(total)], ['MANUAL REVIEW ITEMS', '1 · EMAIL MIGRATION']])}`, `${btn('CANCEL', { tone: 'out', arrow: false })}${btn('APPROVE', { block: true })}`, { top: '260px' }) }),
  note: 'Externally visible action → explicit confirmation sheet naming the consequence. No email is implied: quote-ready emails are DRY RUN on staging.' });
const mRevise = frame({ title: 'REVISE · ADJUSTMENT', chips: S.prop() + ' ' + S.gap('G-04 NOT PERSISTED'), body: phone({ nav: 'foundations', body: `${mRecordHead(C, { band: false })}`, overlay: sheet('REVISE QUOTE', `${field({ label: 'MANUAL ADJUSTMENT (USD)', value: '-50.00', data: true, hint: 'CREATES QUOTE V3 · V2 IS SUPERSEDED' })}${field({ label: 'NOTE TO SELF', ph: 'WHY THIS CHANGED', opt: true })}<div class="fw-banner fw-banner--red">${mk('founder')}MANUAL ADJUSTMENTS ARE NOT SAVED TO THE DATABASE YET (G-04). A RESTART LOSES THEM.</div>`, `${btn('CANCEL', { tone: 'out', arrow: false })}${btn('CREATE V3', { block: true })}`, { top: '220px' }) }),
  note: 'The UI states the persistence limit honestly until the persistence workstream closes G-04.' });
const dQuote = frame({ title: 'DESKTOP · QUOTE WORKSPACE', chips: S.prop(), body: desktop({ active: 'foundations', body: dRecord(C, { section: 3, body: `<div style="display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:18px">${quote()}<div class="fw-col fw-gap10"><div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">DECISION</span>${status('founder', 'FOUNDER')}</div><div class="fw-panel__b fw-col fw-gap10">${btn('APPROVE QUOTE', { block: true })}${btn('REVISE', { block: true, tone: 'out', arrow: false })}${btn('PREVIEW AS CLIENT', { block: true, tone: 'ghost', arrow: false, ic: 'view' })}</div></div><div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">VERSION HISTORY</span></div><div class="fw-panel__b fw-col fw-gap6">${[['V2', 'CLIENT REVIEW · 3H AGO', 'founder'], ['V1', 'SUPERSEDED · 1D AGO', 'done']].map(([v, t, k]) => `<div class="fw-between"><span class="fw-row-flex">${mk(k)}<b style="font-size:9.5px">${v}</b></span><span class="fw-meta">${t}</span></div>`).join('')}</div></div></div></div>` }) }),
  note: 'SEND is not a separate step: marking the quote ready is what the client sees in their link; quote emails follow the send policy (DRY RUN on staging).' });

mount(`${header({ num: '12', title: 'Client quote + commercial review', round: 'C', sub: 'A dedicated quote environment with real pricing, versions, expiry (never confused with the permanent link), and a decision boundary that cannot be mistaken for navigation.' })}
${section('01', 'MOBILE', `<div class="bd-row">${mQuote}${mConfirm}${mRevise}</div>`)}
${section('02', 'DESKTOP', `<div class="bd-row">${dQuote}</div>`)}
${foot('BOARD 12 / 28 · QUOTE + COMMERCIAL REVIEW', `BASE ${money(DF.config.base_price_minor)} · ${DF.config.base_min_business_days}–${DF.config.base_max_business_days} BUSINESS DAYS · EXPIRY ${DF.config.quote_expiry_days} DAYS`)}`);
