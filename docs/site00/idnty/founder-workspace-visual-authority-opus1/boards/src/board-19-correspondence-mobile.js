import { header, section, frame, phone, S, foot, mount, btn, icon, mk, chip, kv } from './fw-kit.js';
import { sheet } from './fw-parts.js';
import { mCorr, mThread } from './fw-pages.js';
const a = frame({ title: 'CORRESPONDENCE · MESSAGES', chips: S.prop(), body: phone({ nav: 'overview', body: mCorr() }), note: 'Policy banner first: staging email is disabled and the UI says so. Portal messages (send-message, persisted) are a separate, working channel.' });
const b = frame({ title: 'CLIENT THREAD', chips: S.prop(), body: phone({ nav: 'overview', body: mThread() }), note: 'Founder messages in ink, client in white. Message text keeps its case. Clients can reply only once PAID (API rule) — shown in the composer hint when relevant.' });
const c = frame({ title: 'INVITATION · PREPARE + SEND GATE', chips: S.prop() + ' ' + S.con('SEND POLICY'), body: phone({ nav: 'overview', body: mCorr(), overlay: sheet('INVITATION', `${kv([['TO', 'fo***@site00.invalid', true], ['CLIENT', 'SYNTH · FOUNDER E2E CLIENT'], ['SUBJECT', 'YOUR DIGITAL FOUNDATION IS READY'], ['LINK', 'VALID · CONFIGURED ORIGIN']])}
  <div class="fw-label">GATES</div>${[['SYNTHETIC CLIENT', 'ok', 'YES'], ['RECIPIENT ON ALLOWLIST', 'ok', 'YES'], ['SEND FLAG', 'policy', 'OFF']].map(([t, k, l]) => `<div class="fw-between"><span class="fw-meta" style="color:var(--fw-ink)">${t}</span>${chip(k, l)}</div>`).join('')}
  <div class="fw-choice" style="opacity:.55"><span class="fw-choice__dot"></span><span><b>I APPROVE THIS SEND</b><span>REQUIRED BEFORE ANY REAL SEND</span></span></div>`, `<span class="fw-btn fw-btn--off fw-btn--block">${icon('lock', '', 'style="width:14px;height:14px"')}SEND DISABLED · SEND FLAG OFF</span>`, { top: '120px' }) }),
  note: 'prepare-test-invitation renders the preview; dispatch-test-email sends only if every gate passes and the founder approves. The approval step applies to every send (today the lifecycle button skips it — fixed here).' });
mount(`${header({ num: '19', title: 'Correspondence · mobile', round: 'D', sub: 'Client communication as an operational function: portal messages, invitations and lifecycle email — honest about what the policy allows.' })}
${section('01', 'COMMUNICATION', `<div class="bd-row">${a}${b}${c}</div>`)}
${foot('BOARD 19 / 28 · CORRESPONDENCE · MOBILE', 'NO SIMULATED DELIVERY · DELIVERED ONLY FROM RESEND WEBHOOK STATUS')}`);
