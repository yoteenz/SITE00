import { DF, header, section, frame, phone, desktop, S, foot, mount, btn, icon, mk, chip, status, kv, tabs, CHEV, money } from './fw-kit.js';
import { DEMO } from './fw-parts.js';
import { mRecordHead, dRecord } from './fw-pages.js';

const H = DEMO[0];
const intakeSec = (t, rows, st = 'COMPLETE', open = true) => `<div class="fw-panel"><div class="fw-panel__h"><b style="font-size:9.5px;letter-spacing:.18em">${t}</b>${st === 'COMPLETE' ? chip('ok', 'COMPLETE') : chip('req', st)}</div>${open ? `<div class="fw-panel__b" style="padding-top:2px">${kv(rows)}</div>` : ''}</div>`;
const intakeBody = `
  ${intakeSec('BUSINESS INFORMATION', [['BUSINESS', 'HORIZON FREIGHT'], ['INDUSTRY', 'TRANSPORTATION + LOGISTICS'], ['CONTACT', 'Dana Ruiz', true], ['EMAIL', 'ops@horizon-freight.invalid', true], ['PHONE', '901-555-0142', true]])}
  ${intakeSec('DOMAIN', [['PATH', 'CONNECT A DOMAIN I OWN'], ['YOUR DOMAIN', 'horizon-freight.invalid', true], ['REGISTRAR', 'NOT PROVIDED']])}
  ${intakeSec('EMAIL + DEVICES', [], 'COMPLETE', false)}
  ${intakeSec('ADDITIONAL SERVICES', [], 'COMPLETE', false)}`;
const mIntake = frame({ title: 'INTAKE · REVIEW-READY', chips: S.prop() + ' ' + S.con('READ-ONLY'), body: phone({ nav: 'foundations', body: `${mRecordHead(H, { band: false })}<div style="padding:12px 16px 0" class="fw-col fw-gap10">${tabs(['OVERVIEW', 'INTAKE', 'QUOTE', 'OPS', 'MORE'], 1)}<div class="fw-between"><span class="fw-meta">SUBMITTED OCT 14 · 4 SECTIONS</span><span class="fw-meta">EXPAND ALL</span></div>${intakeBody}</div>` }),
  note: 'Founder sees the saved answers by section (intake JSON on the artifact). No founder editing is introduced. Case-sensitive values keep their case.' });
const mIncomplete = frame({ title: 'INTAKE · IN PROGRESS / MISSING', chips: S.prop(), body: phone({ nav: 'foundations', body: `${mRecordHead(DEMO[2], { band: false })}<div style="padding:12px 16px 0" class="fw-col fw-gap10">${tabs(['OVERVIEW', 'INTAKE', 'QUOTE', 'OPS', 'MORE'], 1)}<div class="fw-banner">${mk('client')}THE CLIENT IS STILL WORKING ON THEIR INTAKE · LAST SAVED 2H AGO</div>${intakeSec('BUSINESS INFORMATION', [['BUSINESS', 'ATELIER BLOOM'], ['EMAIL', 'studio@atelierbloom.invalid', true]])}${intakeSec('DOMAIN', [], 'NOT STARTED', false)}${intakeSec('EMAIL + DEVICES', [], 'NOT STARTED', false)}<div class="fw-banner fw-banner--red">${mk('founder')}COULDN'T LOAD THE INTAKE · RETRY</div></div>` }),
  note: 'Section status is derived from the intake fields present (deterministic, no percentage). Load failure is shown in place, never as empty answers.' });

const rec = `<div class="fw-col fw-gap10">
  <div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">AUTOMATED RECOMMENDATION</span>${chip('warn', 'MANUAL REVIEW · 2 REASONS')}</div><div class="fw-panel__b fw-col fw-gap10">
    ${[['BASE DIGITAL FOUNDATION', money(DF.config.base_price_minor), 'INCLUDED'], ['ADDITIONAL MAILBOX × 5', money(5 * DF.addons.find((a) => a.id === 'ADDITIONAL_MAILBOX').price_minor_units), 'FROM TEAM SIZE'], ['DOMAIN TRANSFER', money(DF.addons.find((a) => a.id === 'DOMAIN_TRANSFER').price_minor_units), 'FROM “CONNECT A DOMAIN I OWN”']].map(([t, p, why]) => `<div class="fw-between"><span class="fw-who"><b style="font-size:9.5px">${t}</b><span>${why}</span></span><b style="font-size:10px;letter-spacing:.1em">${p}</b></div>`).join('')}
    <div class="fw-banner">${icon('info', '', 'style="width:14px;height:14px;flex:0 0 auto"')}REASONS: MULTI-MAILBOX OVER 5 · EXISTING REGISTRAR UNKNOWN</div></div></div>
  <div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">FOUNDER DECISION</span>${status('founder', 'NOT REVIEWED')}</div><div class="fw-panel__b fw-col fw-gap10"><span class="fw-meta" style="color:var(--fw-ink)">ACCEPT THE SELECTIONS INTO THE QUOTE, OR CHANGE THEM FIRST.</span><div class="fw-row-flex">${btn('USE IN QUOTE', { sm: true })}${btn('EDIT SELECTIONS', { sm: true, tone: 'out', arrow: false })}</div></div></div>
  <div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">CLIENT-FACING RESULT</span>${chip('muted', 'NOT YET VISIBLE')}</div><div class="fw-panel__b"><span class="fw-meta">THE CLIENT SEES THE RECOMMENDATION ONLY AFTER THE QUOTE IS MARKED READY.</span></div></div>
</div>`;
const mRec = frame({ title: 'RECOMMENDATIONS · THREE LAYERS', chips: S.prop(), body: phone({ nav: 'foundations', body: `${mRecordHead(H, { band: false })}<div style="padding:12px 16px 0" class="fw-col fw-gap10">${tabs(['OVERVIEW', 'INTAKE', 'RECOMMEND', 'QUOTE', 'MORE'], 2)}${rec}</div>` }),
  note: '<b>Automated</b> (recommendation engine + manual_review_reasons) · <b>Founder decision</b> (update-quote selections) · <b>Client-facing</b> (visible after quote-commercial-ready). Never implies the automated set was approved.' });
const dBoth = frame({ title: 'DESKTOP · INTAKE BESIDE RECOMMENDATION', chips: S.prop(), body: desktop({ active: 'foundations', body: dRecord(H, { section: 2, body: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px"><div class="fw-col fw-gap10"><span class="fw-label">SUBMITTED INTAKE · WHAT THE CLIENT SAID</span>${intakeBody}</div><div class="fw-col fw-gap10"><span class="fw-label">RECOMMENDATION · WHAT WE PROPOSE</span>${rec}</div></div>` }) }),
  note: 'Side-by-side comparison of source (client answers) and outcome (recommended scope), the core founder judgement.' });

mount(`${header({ num: '11', title: 'Client intake + recommendations', round: 'C', sub: 'Founder inspection of what the client submitted and what the system recommends — with the automated suggestion, the founder decision and the client-facing result kept visibly separate.' })}
${section('01', 'INTAKE', `<div class="bd-row">${mIntake}${mIncomplete}${mRec}</div>`)}
${section('02', 'DESKTOP', `<div class="bd-row">${dBoth}</div>`)}
${foot('BOARD 11 / 28 · INTAKE + RECOMMENDATIONS', 'PRICES FROM addonCatalog.ts + commercialConfig.ts')}`);
