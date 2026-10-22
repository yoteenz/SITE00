import { header, section, frame, phone, S, foot, mount, btn, icon, field, mk, chip, mhead, mtitle, plate, CHECK } from './fw-kit.js';
import { sheet, toast } from './fw-parts.js';
import { mOverview } from './fw-pages.js';

const choice = (on, t, s, test) => `<div class="fw-choice ${on ? 'fw-choice--on' : ''}"><span class="fw-choice__dot"></span><span><b>${t}${test ? ' <span class="fw-chip fw-chip--test" style="margin-left:6px">TEST</span>' : ''}</b><span>${s}</span></span></div>`;
const kindForm = (kind, body, footHtml) => phone({ nav: false, body: `${mhead({ back: 'CREATE' })}<div style="padding:0 22px"><div class="fw-rail"><b>+</b><span></span><em>NEW FOUNDATION</em></div><h1 class="fw-h2" style="font-size:34px">CREATE A<br>FOUNDATION<i class="fw-period"></i></h1></div><div style="padding:16px" class="fw-col fw-gap14">${body}</div><div class="fw-sheet__f" style="position:absolute;left:0;right:0;bottom:0;background:#fff">${footHtml}</div>` });

const entry = frame({ title: '01 · CHOOSE KIND', chips: S.prop(), body: kindForm('', `
  ${choice(true, 'CLIENT FOUNDATION', 'A REAL CLIENT. CREATES THE ARTIFACT AND A PERSONAL LINK. NO EMAIL IS SENT FROM HERE.')}
  ${choice(false, 'SYNTHETIC TEST CLIENT', 'STAGING ONLY. NAME IS PREFIXED “SYNTH ·”. THE EMAIL MUST BE ON THE FOUNDER ALLOWLIST.', true)}
  ${field({ label: 'BUSINESS NAME', ph: 'BUSINESS NAME' })}${field({ label: 'CONTACT NAME', ph: 'FULL NAME' })}${field({ label: 'CONTACT EMAIL', ph: 'NAME@BUSINESS.COM' })}
  ${field({ label: 'REFERRAL SOURCE', value: 'DIRECT' })}`, btn('CREATE FOUNDATION', { block: true, tone: 'red' })),
  note: 'Fields map to create-artifact (contact_email, contact_name, business_name, referral_kind). Replaces today’s hard-coded “prospect@example.com”.' });

const invalid = frame({ title: '02 · VALIDATION', chips: S.prop(), body: kindForm('', `
  ${choice(true, 'CLIENT FOUNDATION', 'A REAL CLIENT. CREATES THE ARTIFACT AND A PERSONAL LINK.')}
  ${field({ label: 'BUSINESS NAME', value: 'Harbor & Pine', data: true })}${field({ label: 'CONTACT NAME', ph: 'FULL NAME', err: 'ENTER THE CONTACT NAME' })}${field({ label: 'CONTACT EMAIL', value: 'jo@harborpine', data: true, state: 'focus', err: 'CHECK THIS EMAIL ADDRESS' })}`,
  `<span class="fw-err" style="flex:1">${mk('founder')}2 FIELDS NEED ATTENTION</span>${btn('CREATE', { tone: 'red', sm: true })}`) });

const synth = frame({ title: '03 · SYNTHETIC · NOT ALLOWLISTED', chips: S.prop() + ' ' + S.con('ALLOWLIST'), body: kindForm('', `
  ${choice(true, 'SYNTHETIC TEST CLIENT', 'STAGING ONLY. NAME IS PREFIXED “SYNTH ·”.', true)}
  ${field({ label: 'TEST RECIPIENT', value: 'someone@gmail.com', data: true, err: 'NOT ON THE FOUNDER TEST ALLOWLIST' })}
  ${field({ label: 'DISPLAY NAME', value: 'Founder E2E Client', data: true, hint: 'SAVED AS “SYNTH · FOUNDER E2E CLIENT”' })}
  <div class="fw-banner fw-banner--policy">${icon('lock', '', 'style="width:14px;height:14px;flex:0 0 auto"')}THE SERVER REJECTS ADDRESSES OUTSIDE SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST. TEST MODE MUST BE ON.</div>`,
  `<span class="fw-btn fw-btn--off fw-btn--block">CREATE TEST CLIENT</span>`) });

const busy = frame({ title: '04 · CREATING (DURABLE WRITE)', chips: S.prop() + ' ' + S.dep('DEPENDS ON #1657'), body: kindForm('', `
  ${choice(true, 'CLIENT FOUNDATION', 'A REAL CLIENT.')}${field({ label: 'BUSINESS NAME', value: 'Harbor & Pine', data: true, state: 'ro' })}${field({ label: 'CONTACT EMAIL', value: 'jo@harborpine.invalid', data: true, state: 'ro' })}
  <div class="fw-banner">${'<span class="df-spinner df-spinner--sm"><svg viewBox="0 0 24 24"><circle class="df-spinner__track" cx="12" cy="12" r="10"/><circle class="df-spinner__arc" cx="12" cy="12" r="10"/></svg></span>'}SAVING TO THE DATABASE · DO NOT CLOSE</div>`,
  `<span class="fw-btn fw-btn--busy fw-btn--block">CREATING…</span>`),
  note: 'The button stays busy (and cannot be pressed twice) until the server confirms the durable write. No optimistic success.' });

const done = frame({ title: '05 · LINK READY', chips: S.prop(), body: phone({ nav: false, body: `${mhead({ back: 'CREATE' })}<div style="padding:0 22px" class="fw-col fw-gap14">${plate('Harbor & Pine', { size: 'lg' })}<h1 class="fw-h2" style="font-size:34px">HARBOR & PINE<br>IS READY<i class="fw-period"></i></h1>
  <div class="fw-row-flex">${mk('client')}<span class="fw-st">INVITED · WAITING FOR THE CLIENT TO OPEN THE LINK</span></div>
  <div class="fw-label">PERSONAL LINK · NEVER EXPIRES</div><div class="fw-link"><code class="fw-data">site00.com/foundation/Qm9…x2a</code></div>
  <div class="fw-grid2">${btn('COPY LINK', { ic: 'link', arrow: false })}${btn('OPEN CLIENT VIEW', { tone: 'out', ic: 'external', arrow: false })}</div>
  ${btn('OPEN FOUNDATION', { tone: 'out', block: true })}
  <div class="fw-banner fw-banner--policy">${icon('lock', '', 'style="width:14px;height:14px;flex:0 0 auto"')}NO EMAIL WAS SENT. SHARE THE LINK YOURSELF OR PREPARE THE INVITATION FROM CORRESPONDENCE.</div></div>
  ${toast('LINK COPIED', { style: 'position:absolute;left:16px;right:16px;bottom:24px' })}` }),
  note: 'The link comes from the server response (personalized_url). Copy uses the clipboard API with a visible confirmation; window.prompt is retired.' });

const fail = frame({ title: '06 · FAILURE / DUPLICATE', chips: S.prop(), body: phone({ nav: false, body: `${mhead({ back: 'CREATE' })}<div style="padding:0 22px" class="fw-col fw-gap14"><h1 class="fw-h2" style="font-size:34px">NOT CREATED<i class="fw-period"></i></h1>
  <div class="fw-banner fw-banner--red">${mk('founder')}THE DATABASE REJECTED THE SAVE (DATABASE_UNAVAILABLE). NOTHING WAS CREATED. YOUR ENTRIES ARE KEPT.</div>
  ${btn('TRY AGAIN', { block: true })}${btn('ERROR DETAILS', { tone: 'out', block: true, arrow: false })}
  <div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">EXISTING RECORD DETECTED</span>${chip('warn', 'POSSIBLE DUPLICATE')}</div><div class="fw-panel__b fw-col fw-gap10"><span class="fw-meta" style="color:var(--fw-ink)">A FOUNDATION WITH <span class="fw-data">jo@harborpine.invalid</span> WAS CREATED 2 MIN AGO.</span>${btn('OPEN EXISTING', { tone: 'out', sm: true })}</div></div></div>` }),
  note: 'Error codes come from DfPersistenceError (DATABASE_PERMISSION_DENIED, DATABASE_UNAVAILABLE, SAVE_FAILED, DATA_CONTRACT_INVALID). Duplicate detection is client-side over the list (by email) — the API does not dedupe (G-11).' });

mount(`${header({ num: '07', title: 'Create client · mobile', round: 'B', sub: 'One create flow that distinguishes a real client from a synthetic test client, never fakes success, and ends with a stable personal link.' })}
${section('01', 'ENTRY → VALIDATION → SYNTHETIC POLICY', `<div class="bd-row">${entry}${invalid}${synth}</div>`)}
${section('02', 'SUBMITTING → SUCCESS → FAILURE', `<div class="bd-row">${busy}${done}${fail}</div>`)}
${foot('BOARD 07 / 28 · CREATE CLIENT · MOBILE', 'APIs: create-artifact · create-test-client (DURABLE SINCE #1657)')}`);
