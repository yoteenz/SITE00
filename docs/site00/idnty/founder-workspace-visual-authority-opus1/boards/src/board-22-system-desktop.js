import { header, section, frame, desktop, S, foot, mount, btn, icon, chip, tabs, topbar, arch } from './fw-kit.js';
import { dSystem, systemInspector, deskTitle } from './fw-pages.js';

const main = frame({
  title: 'SYSTEM · OVERVIEW · MODULE INSPECTOR',
  chips: S.prop() + ' ' + S.ref('REF G · ADAPTED'),
  body: desktop({ active: 'system', body: dSystem(), inspector: systemInspector() }),
  note: 'Verdict band, eight modules in a 4-column grid, build marker. Selecting a module opens the inspector: summary, checks, next action, and the environment group by <b>name</b> only. OPEN READINESS DESK stays until the founder retires R7 (FD-W7).',
});

const col = (title, k, items) =>
  `<div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">${title}</span>${chip(k, String(items.length))}</div><div class="fw-panel__b fw-col fw-gap6">${items
    .map(([t, s]) => `<div style="padding:8px 0;border-bottom:1px solid var(--fw-hair)"><b style="font-size:9.5px;letter-spacing:.16em">${t}</b><div class="fw-meta" style="margin-top:4px">${s}</div></div>`)
    .join('')}</div></div>`;

const report = frame({
  title: 'READINESS REPORT',
  chips: S.prop(),
  body: desktop({
    active: 'system',
    body: `${topbar({ n: '06', title: 'SYSTEM' })}<div class="fw-stage">${deskTitle('SYSTEM', 'READINESS REPORT · GENERATED 4 MIN AGO', arch('corner', 'right:0;top:-10px;width:170px;height:128px'), btn('RE-RUN', { tone: 'out', sm: true }))}
      <div class="fw-mt14">${tabs(['OVERVIEW', 'INFRASTRUCTURE', 'INTEGRATIONS', 'SECURITY', 'TEST LAB', 'READINESS REPORT'], 5)}</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:16px">
        ${col('READY', 'ok', [['STAGING STACK', 'ORIGINS MATCH'], ['PERSISTENCE', 'SUPABASE'], ['DATABASE SECURITY', 'ANON DENIED'], ['FOUNDER SESSION', 'ADMIN'], ['RESEND KEY', 'PRESENT'], ['ALLOWLIST', '1 ADDRESS'], ['PUBLIC LINK ORIGIN', 'SET'], ['STRIPE KEY', 'TEST MODE'], ['SYNTHETIC INTAKE', 'AVAILABLE']])}
        ${col('ACTION REQUIRED', 'req', [['DKIM + RESEND DOMAIN', 'CONFIRM IN GODADDY + RESEND']])}
        ${col('BLOCKED', 'muted', [])}
        ${col('UNVERIFIED', 'unver', [['API HEALTH', 'NO PROBE'], ['STRIPE WEBHOOK', 'NO PROBE']])}
      </div>
      <details open class="fw-panel fw-mt14" style="padding:0"><summary class="fw-panel__h" style="cursor:pointer;list-style:none"><span class="fw-label">TECHNICAL CONFIGURATION · NAMES ONLY</span>${icon('arrow', '', 'style="width:14px;height:14px"')}</summary>
        <table class="fw-table"><thead><tr><th>STATUS</th><th>SETTING</th><th>PURPOSE</th><th>STATE</th></tr></thead><tbody>
        ${[
          ['policy', 'OFF', 'SITE00_DF_TRANSACTIONAL_EMAIL_SEND', 'LIFECYCLE SEND', 'NOT SET'],
          ['ok', 'OK', 'RESEND_API_KEY', 'PROVIDER', 'CONFIGURED'],
          ['ok', 'OK', 'SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST', 'SYNTHETIC SENDS', 'CONFIGURED'],
          ['ok', 'OK', 'STRIPE_SECRET_KEY', 'PAYMENTS', 'CONFIGURED · TEST'],
        ]
          .map(([k, l, n, p, s]) => `<tr><td>${chip(k, l)}</td><td class="fw-data">${n}</td><td>${p}</td><td>${s}</td></tr>`)
          .join('')}
        </tbody></table></details>
    </div>`,
  }),
  note: 'R7 “Readiness report” columns and the “Technical configuration” table, retained in full. Environment names are data (exact case). Values are never fetched to the browser.',
});

mount(`${header({ num: '22', title: 'System · desktop', round: 'E', sub: 'The full diagnostic surface at desktop width: verdict, modules, the readiness report and technical configuration — all of R7’s staging diagnostics, with category-first entry and no secret values.' })}
${section('01', 'OVERVIEW + INSPECTOR', `<div class="bd-row">${main}</div>`)}
${section('02', 'READINESS REPORT + TECHNICAL CONFIGURATION', `<div class="bd-row">${report}</div>`)}
${foot('BOARD 22 / 28 · SYSTEM · DESKTOP', 'FD-W7 READINESS DESK RETIREMENT OPEN · R7 ROUTE PRESERVED')}`);
