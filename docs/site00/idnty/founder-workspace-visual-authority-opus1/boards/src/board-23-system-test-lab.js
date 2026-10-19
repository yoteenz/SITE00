import { header, section, frame, phone, desktop, S, foot, mount, btn, icon, chip, mk, status, kv, tabs, field, mhead, mtitle, topbar, seg, plate, CHECK } from './fw-kit.js';
import { SYNTH, sheet, toast } from './fw-parts.js';
import { deskTitle } from './fw-pages.js';

// Square checkbox in the proposal grammar (ink when ticked).
const cbox = (on, label, sub = '') =>
  `<div class="fw-row-flex" style="align-items:flex-start;padding:10px 12px;border:1px solid ${on ? 'var(--fw-ink)' : 'var(--fw-rule-strong)'};border-radius:var(--fw-r);background:#fff"><span style="flex:0 0 16px;width:16px;height:16px;border:1.5px solid var(--fw-ink);border-radius:2px;background:${on ? 'var(--fw-ink)' : '#fff'};color:#fff;display:flex;align-items:center;justify-content:center">${on ? CHECK.replace('<svg ', '<svg style="width:12px;height:12px;stroke-width:2.4" ') : ''}</span><span class="fw-who"><b style="font-size:9px">${label}</b>${sub ? `<span>${sub}</span>` : ''}</span></div>`;

// Email timeline rows: real SendIntentStatus values + real template ids (data).
const EVENTS = [
  ['DRY_RUN', 'personal-foundation-invitation', 'ARTIFACT_CREATED', '—'],
  ['DRY_RUN', 'intake-completed', 'INTAKE_COMPLETED', '—'],
  ['QUEUED', 'quote-ready', 'QUOTE_CREATED', '—'],
  ['ACCEPTED', 'personal-foundation-invitation', 'FOUNDER TEST SEND', 're_9f2…41c'],
];
const sk = (s) => (s === 'ACCEPTED' ? 'ok' : s === 'QUEUED' ? 'req' : s === 'FAILED' ? 'fail' : 'muted');
const evRow = ([s, t, trig, id]) =>
  `<div class="fw-between" style="padding:9px 0;border-bottom:1px solid var(--fw-hair)"><span class="fw-who"><b class="fw-data" style="font-size:10px">${t}</b><span>${trig}${id !== '—' ? ` · <span class="fw-data">${id}</span>` : ''}</span></span>${chip(sk(s), s.replace('_', ' '))}</div>`;

const synthHead = `<div class="fw-row-flex">${plate(SYNTH.name, { test: true })}<span class="fw-who"><b class="fw-data" style="font-size:11px;letter-spacing:.04em">${SYNTH.name}</b><span class="fw-data">${SYNTH.email}</span></span>${chip('test', 'TEST')}</div>`;

const journeyCard = (step = 1) =>
  `<div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">TEST JOURNEY</span>${status('client', 'INTAKE IN PROGRESS')}</div><div class="fw-panel__b fw-col fw-gap10">${synthHead}${seg(['done', 'cur', '', '', '', '', '', ''].map((x, i) => (i < step ? 'done' : i === step ? 'cur' : '')))}
  ${kv([['STATE', 'INTAKE_IN_PROGRESS'], ['INTAKE', 'NOT SUBMITTED'], ['PAYMENT', 'NONE'], ['SURFACE', 'INTAKE']])}
  <div class="fw-col fw-gap6">${btn('SUBMIT INTAKE (TEST)', { block: true, tone: 'out' })}${btn('QUOTE READY + QUEUE EMAIL', { block: true, tone: 'out' })}${btn('OPEN CLIENT LINK', { block: true, tone: 'ghost', arrow: false, ic: 'external' })}</div></div></div>`;

const mLab = (inner) => `${mhead()}${mtitle({ n: '06', title: 'SYSTEM' })}<div style="padding:0 16px" class="fw-col fw-gap14">${tabs(['OVERVIEW', 'STACK', 'INTEGRATIONS', 'SECURITY', 'TEST LAB'], 4)}${inner}</div>`;

const create = frame({
  title: 'TEST LAB · CREATE SYNTHETIC CLIENT',
  chips: S.prop() + ' ' + S.impl('R7 CAPABILITY'),
  body: phone({
    nav: 'system',
    body: mLab(`<div class="fw-banner fw-banner--policy">${icon('lock', '', 'style="width:14px;height:14px;flex:0 0 auto"')}STAGING ONLY · SYNTHETIC CLIENTS · ALLOWLISTED EMAIL · NEVER A REAL CLIENT</div>
      ${field({ label: 'TEST RECIPIENT · MUST BE ON THE API ALLOWLIST', value: 'founder-test@site00.invalid', data: true, state: 'focus' })}
      ${field({ label: 'DISPLAY NAME', value: 'Founder E2E Client', data: true, hint: 'SAVED WITH THE SYNTH · PREFIX' })}
      ${btn('CREATE TEST CLIENT', { block: true })}`),
  }),
  note: '= <code>create-test-client</code>. The allowlist is enforced by the API; the field explains it before submission instead of after a failure.',
});

const journey = frame({
  title: 'TEST JOURNEY',
  chips: S.prop() + ' ' + S.impl('R7 CAPABILITY'),
  body: phone({ nav: 'system', body: mLab(journeyCard(1)) }),
  note: '= <code>test-journey</code>, <code>advance-test-intake</code>, <code>advance-test-quote</code>. Steps are labelled “(TEST)” and live only under TEST LAB.',
});

const timeline = frame({
  title: 'EMAIL TIMELINE + GATED SEND',
  chips: S.prop() + ' ' + S.gap('G-09 MEMORY'),
  body: phone({
    nav: 'system',
    body: mLab(`<div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">EMAIL EVENTS</span><span class="fw-meta">4</span></div><div class="fw-panel__b" style="padding-top:0">${EVENTS.map(evRow).join('')}</div></div>`),
    overlay: sheet(
      'SEND TEST INVITATION',
      `${kv([['TO', 'fo***@site00.invalid', true], ['TEMPLATE', 'personal-foundation-invitation', true], ['LINK', 'VALID · CONFIGURED ORIGIN'], ['GATES', '1–5 PASS · SYNTHETIC · ALLOWLISTED']])}
       ${cbox(true, 'FOUNDER APPROVES RESEND SEND', 'REQUIRED FOR EVERY SEND, INCLUDING QUEUED LIFECYCLE EMAILS')}`,
      `${btn('CANCEL', { tone: 'out', arrow: false })}${btn('SEND TEST', { block: true, ic: 'send' })}`,
      { top: '330px' },
    ),
  }),
  note: '= <code>email-timeline</code>, <code>prepare-test-invitation</code>, <code>dispatch-test-email</code>. <b>Fixes the R7 inconsistency:</b> “Send lifecycle email (approved)” today sends without the approval tick; here every send uses the same sheet and the same tick. DELIVERED only ever comes from the webhook.',
});

const reset = frame({
  title: 'RESET · DESTRUCTIVE CONFIRMATION',
  chips: S.prop(),
  body: phone({
    nav: 'system',
    body: mLab(journeyCard(1)),
    overlay: sheet(
      'RESET TEST DATA',
      `<div class="fw-banner fw-banner--red">${mk('blocked')}CLEARS THE IN-MEMORY STORE AND REHYDRATES FROM THE DATABASE. SYNTHETIC JOURNEY STATE AND MEMORY-ONLY EVENTS ARE LOST.</div>
       ${kv([['DATABASE ROWS', 'NOT DELETED'], ['REAL CLIENTS', 'NOT AFFECTED'], ['UNDO', 'NOT AVAILABLE']])}
       ${field({ label: 'TYPE RESET TO CONFIRM', value: 'RESET', data: true })}`,
      `${btn('CANCEL', { tone: 'out', arrow: false })}${btn('RESET TEST DATA', { block: true, tone: 'red', arrow: false })}`,
      { top: '250px' },
    ),
  }),
  note: '= <code>reset-test-data</code>. Today this fires on one click with no confirmation. The sheet names exactly what is and is not affected, from the API behaviour.',
});

const checks = (k1) =>
  `<div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">CONTINUITY CHECKS</span>${chip('unver', 'NOT RUN')}</div><div class="fw-panel__b fw-col fw-gap6">${[
    ['ARTIFACT SURVIVES API RESTART', k1],
    ['PUBLIC LINK RESOLVES AFTER RESTART', 'unver'],
    ['INTAKE RESUMES FROM SAVED STEP', 'unver'],
    ['EVENTS SURVIVE RESTART', 'muted'],
  ]
    .map(([t, k]) => `<div class="fw-between" style="padding:6px 0;border-bottom:1px solid var(--fw-hair)"><span class="fw-meta" style="color:var(--fw-ink)">${t}</span>${chip(k, k === 'muted' ? 'NOT PERSISTED · G-03' : 'UNVERIFIED')}</div>`)
    .join('')}</div></div>`;

const desk = frame({
  title: 'DESKTOP · TEST LAB',
  chips: S.prop(),
  body: desktop({
    active: 'system',
    h: 1000,
    body: `${topbar({ n: '06', title: 'SYSTEM' })}<div class="fw-stage">${deskTitle('TEST LAB', 'SYNTHETIC CLIENTS ONLY · ALLOWLISTED EMAIL · STAGING SUPABASE')}
      <div class="fw-mt14">${tabs(['OVERVIEW', 'INFRASTRUCTURE', 'INTEGRATIONS', 'SECURITY', 'TEST LAB', 'READINESS REPORT'], 4)}</div>
      <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:16px;margin-top:16px">
        <div class="fw-col fw-gap14">${journeyCard(1)}${checks('unver')}</div>
        <div class="fw-col fw-gap14"><div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">EMAIL EVENTS</span>${btn('PREPARE TEST INVITATION', { sm: true, tone: 'out', arrow: false })}</div><div class="fw-panel__b" style="padding-top:0">${EVENTS.map(evRow).join('')}</div></div>
        <div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">INVITATION PREVIEW · NO SEND</span>${chip('ok', 'READY TO SEND')}</div><div class="fw-panel__b">${kv([['SUBJECT', 'YOUR DIGITAL FOUNDATION IS READY'], ['TO', 'fo***@site00.invalid', true], ['FROM', 'hello@site00.com', true], ['LINK VALID', 'YES'], ['CONFIGURED ORIGIN', 'YES']])}</div></div>
        <div class="fw-between"><span class="fw-meta">DANGER ZONE</span>${btn('RESET TEST DATA…', { sm: true, tone: 'out', arrow: false })}</div></div>
      </div></div>`,
  }),
  note: 'Every R7 test capability in one tab: create, journey, email events, invitation preview, gated sends, reset (confirmed). Continuity checks are drawn <b>UNVERIFIED</b> — they are a proposed addition for the persistence workstream; nothing here claims they have run.',
});

const states = frame({
  title: 'RESULTS',
  chips: S.prop(),
  width: 430,
  body: `<div class="fw" style="background:var(--fw-page);border:1px solid #0c0c0c;padding:22px;display:flex;flex-direction:column;gap:12px">${toast('TEST CLIENT CREATED · SYNTH · Founder E2E Client'.replace('Founder E2E Client', '<span class="fw-data">Founder E2E Client</span>'))}${toast('TEST INVITATION ACCEPTED BY RESEND')}${toast('RECIPIENT NOT ON ALLOWLIST', { err: true })}${toast('RESET FAILED · TRY AGAIN', { err: true })}</div>`,
  note: 'Outcome language mirrors API outcomes (ACCEPTED, not “delivered”). Errors keep the form filled.',
});

mount(`${header({ num: '23', title: 'System · test lab', round: 'E', sub: 'The Readiness Desk’s working test harness, kept whole and made safe: synthetic client creation, the test journey, the email timeline, one consistent approval gate for every send, and a confirmed reset.' })}
${section('01', 'MOBILE', `<div class="bd-row">${create}${journey}${timeline}${reset}</div>`)}
${section('02', 'DESKTOP + OUTCOMES', `<div class="bd-row">${desk}${states}</div>`)}
${foot('BOARD 23 / 28 · SYSTEM TEST LAB', 'NO LIVE SEND ON THIS BOARD · ALL EVENT ROWS FICTIONAL · TEMPLATE IDS FROM eventMap.ts')}`);
