import { DF, header, section, frame, desktop, S, foot, mount, btn, icon, mk, chip, status, kv, tabs, field, journey, plate, topbar, money } from './fw-kit.js';
import { REVIEWS } from './fw-parts.js';

const body = (variant) => `${topbar({ n: '03', title: variant === 'quote' ? 'REVIEWS / QUOTE · CARTER & LANE' : 'REVIEWS / CLIENT REQUEST · SUMMIT WELLNESS' })}
<div class="fw-stage"><div style="display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:22px">
  <div class="fw-col fw-gap14">
    <div class="fw-row-flex" style="gap:16px;align-items:flex-end">${plate(variant === 'quote' ? 'Carter & Lane' : 'Summit Wellness', { attn: true, size: 'lg' })}<div><h1 class="fw-h1" style="font-size:46px">${variant === 'quote' ? 'CARTER & LANE' : 'SUMMIT WELLNESS'}<i></i></h1><div class="fw-sub" style="margin-top:10px">${variant === 'quote' ? 'QUOTE REVIEW · V2 · 3H AGO' : 'CLIENT REQUEST · SIGNATURE V2 · 2D AGO'}</div></div></div>
    <div class="fw-rv__why"><b><span class="fw-st fw-st--founder">${mk('founder')}${variant === 'quote' ? 'QUOTE NOT YET APPROVED' : 'REVISION REQUESTED BY CLIENT'}</span></b><span>${variant === 'quote' ? 'CONTAINS A MANUAL-REVIEW ADD-ON (EMAIL MIGRATION)' : '“PLEASE USE OUR LEGAL NAME IN THE SIGNATURE.”'}</span></div>
    ${tabs(variant === 'quote' ? ['EVIDENCE', 'INTAKE', 'RECOMMENDATION', 'NOTES', 'HISTORY'] : ['REQUEST', 'CONTEXT', 'NOTES', 'HISTORY'], 0)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">${variant === 'quote' ? 'CLIENT ASKED FOR' : 'VERSION 1 (CURRENT)'}</span></div><div class="fw-panel__b">${variant === 'quote' ? kv([['TEAM SIZE', '3 MAILBOXES'], ['MIGRATION', 'FROM GMAIL'], ['DOMAIN', 'REGISTER NEW']]) : kv([['NAME LINE', 'Summit Wellness', true], ['TITLE', 'Care Team', true]])}</div></div>
      <div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">${variant === 'quote' ? 'QUOTE V2 PROPOSES' : 'REQUESTED CHANGE'}</span></div><div class="fw-panel__b">${variant === 'quote' ? kv([['BASE', money(DF.config.base_price_minor)], ['MAILBOX × 2', money(15000)], ['EMAIL MIGRATION', money(20000) + ' · MANUAL']]) : kv([['NAME LINE', 'Summit Wellness Group LLC', true], ['TITLE', 'Care Team', true]])}</div></div>
    </div>
  </div>
  <div class="fw-panel fw-col" style="border-color:var(--fw-ink)"><div class="fw-panel__h" style="border-bottom-color:var(--fw-ink)"><span class="fw-h3">DECISION</span>${status('founder', 'NOT STARTED')}</div><div class="fw-panel__b fw-col fw-gap10">
    <div class="fw-choice fw-choice--on"><span class="fw-choice__dot"></span><span><b>${variant === 'quote' ? 'APPROVE QUOTE' : 'APPROVE CHANGE'}</b><span>${variant === 'quote' ? 'quote-commercial-ready · CLIENT CAN ACCEPT AND PAY' : 'approval-resolve · APPROVED'}</span></span></div>
    <div class="fw-choice"><span class="fw-choice__dot"></span><span><b>REQUEST REVISION</b><span>${variant === 'quote' ? 'REVISE → NEW VERSION (update-quote / manual-adjustment)' : 'approval-resolve · REVISION_REQUESTED + NOTE'}</span></span></div>
    ${field({ label: 'NOTE', ph: 'VISIBLE TO YOU ONLY', opt: true })}
    ${btn('CONFIRM DECISION', { block: true })}<span class="fw-meta">YOU WILL BE ASKED TO CONFIRM. ${variant === 'quote' ? 'NO EMAIL IS SENT (DRY RUN).' : 'NOT SAVED ON SERVER RESTART YET (G-04).'}</span>
  </div></div>
</div></div>`;
const a = frame({ title: 'QUOTE APPROVAL', chips: S.prop(), body: desktop({ active: 'reviews', body: body('quote') }), note: 'Evidence on the left compares what the client asked for with what the quote proposes; the decision panel is a distinct ink-bordered surface on the right. Decision values shown in small type are the actual API actions.' });
const b = frame({ title: 'CLIENT REQUEST', chips: S.prop() + ' ' + S.gap('G-04'), body: desktop({ active: 'reviews', body: body('request') }) });
mount(`${header({ num: '16', title: 'Review detail · desktop', round: 'C', sub: 'Evidence, notes and decision controls side by side. Each review category has its own detail; two are shown — quote approval and client request.' })}
${section('01', 'QUOTE APPROVAL', `<div class="bd-row">${a}</div>`)}${section('02', 'CLIENT REQUEST', `<div class="bd-row">${b}</div>`)}
${foot('BOARD 16 / 28 · REVIEW DETAIL · DESKTOP', 'DECISIONS = quote-commercial-ready · update-quote · approval-resolve · client-action')}`);
