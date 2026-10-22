import { header, section, frame, phone, S, foot, mount, btn, icon, chip, tabs, mhead, mtitle, arch } from './fw-kit.js';
import { MODULES, sheet } from './fw-parts.js';
import { mSystem } from './fw-pages.js';

// One diagnostic line: label, optional data value, status chip.
const chk = (t, sub, k, label, ic = '') =>
  `<div class="fw-between" style="padding:10px 0;border-bottom:1px solid var(--fw-hair)"><span class="fw-who"><b style="font-size:9.5px">${t}</b>${sub ? `<span>${sub}</span>` : ''}</span>${chip(k, label, ic)}</div>`;
const group = (title, rows, right = '') => `<div class="fw-panel"><div class="fw-panel__h"><span class="fw-label">${title}</span>${right}</div><div class="fw-panel__b" style="padding-top:0;padding-bottom:4px">${rows}</div></div>`;
const tabPage = (on, inner) =>
  `${mhead()}${mtitle({ n: '06', title: 'SYSTEM', arch: arch('corner', 'right:10px;top:4px;width:104px;height:78px') })}<div style="padding:0 16px" class="fw-col fw-gap14">${tabs(['OVERVIEW', 'STACK', 'INTEGRATIONS', 'SECURITY', 'TEST LAB'], on)}${inner}</div>`;

const overview = frame({
  title: 'SYSTEM · OVERVIEW',
  chips: S.ref('REF G') + ' ' + S.prop('CATEGORY-FIRST'),
  body: phone({ nav: 'system', body: mSystem() }),
  note: 'One verdict first (the readiness report’s overall status), then eight module cards. A card states its condition in words and a chip; nothing is green unless a check actually passed. API HEALTH stays UNVERIFIED until a real health probe exists (G-08) — a responding catalog endpoint is not health.',
});

const infra = frame({
  title: 'INFRASTRUCTURE',
  chips: S.prop() + ' ' + S.gap('G-08'),
  body: phone({
    nav: 'system',
    body: tabPage(
      1,
      group(
        'STAGING STACK',
        chk('FRONTEND', '<span class="fw-data">carefree-luck</span>', 'ok', 'STAGING') +
          chk('API', '<span class="fw-data">reliable-creation</span>', 'unver', 'UNVERIFIED') +
          chk('SUPABASE PROJECT', 'REF MATCHES STAGING', 'ok', 'ISOLATED') +
          chk('PERSISTENCE', 'SUPABASE · FLAG ON', 'ok', 'DURABLE') +
          chk('PUBLIC LINK ORIGIN', 'CONFIGURED ORIGIN', 'ok', 'SET') +
          chk('EXTERNAL E2E', 'BY DESIGN', 'muted', 'NOT PASSED'),
      ) + `<div class="fw-between"><span class="fw-meta">API BUILD <span class="fw-data">392ac76</span></span><span class="fw-meta">REPORT · 4 MIN AGO</span></div>`,
    ),
  }),
  note: 'Mobile tab label STACK = INFRASTRUCTURE (reference G label kept on desktop). The R7 “Staging stack” list, one line per check. Service names and the build commit are data (not uppercased). “External E2E · NOT PASSED” is the real fixed value today, shown neutrally rather than as a failure.',
});

const integ = frame({
  title: 'INTEGRATIONS',
  chips: S.prop(),
  body: phone({
    nav: 'system',
    body: tabPage(
      2,
      group('STRIPE', chk('KEY MODE', 'BY KEY PREFIX', 'test', 'TEST MODE') + chk('WEBHOOK', 'NO PROBE IN REPORT', 'unver', 'UNVERIFIED')) +
        group('RESEND', chk('API KEY', 'NAME ONLY · NEVER THE VALUE', 'ok', 'PRESENT') + chk('SEND FLAG', 'TRANSACTIONAL', 'policy', 'OFF BY POLICY', 'lock') + chk('DOMAIN', 'VERIFY IN RESEND', 'req', 'NEEDS FOUNDER')) +
        group('GODADDY DNS', chk('DKIM RECORD', 'MANUAL CHECK', 'req', 'NEEDS FOUNDER')),
    ),
  }),
  note: 'Grouped by provider. “Needs founder” (configuration required) is distinct from “off by policy” (deliberate, hatched) and from “unverified” (no check exists). No toggles live here: send policy is environment configuration, not a switch in the UI.',
});

const security = frame({
  title: 'SECURITY',
  chips: S.prop(),
  body: phone({
    nav: 'system',
    body: tabPage(
      3,
      group('DATABASE SECURITY PROBE', chk('ANON READ · PROJECT MESSAGES', 'RLS', 'ok', 'DENIED') + chk('SERVICE ROLE', 'SERVER ONLY', 'ok', 'ALLOWED') + chk('PERSISTENCE EXPOSURE', '', 'ok', 'SAFE')) +
        group('FOUNDER SESSION', chk('SIGNED IN', '<span class="fw-data">founder@site00.com</span>', 'ok', 'ADMIN')) +
        `<div class="fw-banner fw-banner--policy">${icon('lock', '', 'style="width:14px;height:14px;flex:0 0 auto"')}SECRETS ARE SHOWN BY NAME AND PRESENCE ONLY. NO KEY, TOKEN OR SERVICE-ROLE VALUE IS EVER RENDERED.</div>`,
    ),
  }),
  note: 'The R7 database security probe and founder session, unchanged in meaning. A probe failure would show FAIL with the probe note in the detail sheet.',
});

const detail = frame({
  title: 'MODULE DETAIL · EMAIL SENDING',
  chips: S.prop(),
  body: phone({
    nav: 'system',
    body: mSystem(),
    overlay: sheet(
      'EMAIL SENDING',
      `<div>${chip('policy', 'DISABLED BY POLICY', 'lock')}</div>
       <div class="fw-meta" style="color:var(--fw-ink);line-height:1.7">LIFECYCLE EMAILS ARE RECORDED AS DRY RUN. WHEN THE SEND FLAG IS ON, ONLY ALLOWLISTED SYNTHETIC CLIENTS CAN RECEIVE MAIL.</div>
       <div>${chk('SEND FLAG', '', 'policy', 'OFF') + chk('RESEND KEY', '', 'ok', 'PRESENT') + chk('FOUNDER ALLOWLIST', '', 'ok', '1 ADDRESS') + chk('DKIM + DOMAIN', '', 'req', 'NEEDS FOUNDER') + chk('LIVE DELIVERY', '', 'unver', 'UNVERIFIED')}</div>
       <div><span class="fw-label">NEXT ACTION</span><div class="fw-meta" style="color:var(--fw-ink);line-height:1.7;margin-top:6px">CONFIRM THE GODADDY DKIM RECORD AND THE RESEND DOMAIN, THEN RE-RUN THE REPORT.</div></div>`,
      `${btn('TECHNICAL DETAIL', { tone: 'out', arrow: false })}${btn('RE-RUN REPORT', { block: true })}`,
      { top: '110px' },
    ),
  }),
  note: 'Tap a module → sheet: verdict, checks, the one next action. TECHNICAL DETAIL pushes the env-group table (names only) from R7 “Technical configuration”.',
});

const legend = `<div class="bd-panel" style="width:640px"><table class="bd-table"><thead><tr><th>CHIP</th><th>MEANING</th><th>NEVER USED FOR</th></tr></thead><tbody>
<tr><td><div class="fw">${chip('ok', 'READY')}</div></td><td>A real check ran and passed</td><td>An endpoint merely responding</td></tr>
<tr><td><div class="fw">${chip('req', 'NEEDS FOUNDER')}</div></td><td>Configuration required; the founder can act</td><td>Deliberate policy</td></tr>
<tr><td><div class="fw">${chip('policy', 'OFF BY POLICY', 'lock')}</div></td><td>Disabled on purpose (send flag, E2E)</td><td>Errors</td></tr>
<tr><td><div class="fw">${chip('unver', 'UNVERIFIED')}</div></td><td>No check exists or it has not run</td><td>Passing</td></tr>
<tr><td><div class="fw">${chip('fail', 'FAILED')}</div></td><td>A check ran and failed</td><td>Unknown</td></tr>
<tr><td><div class="fw">${chip('test', 'TEST MODE')}</div></td><td>Synthetic / Stripe test keys</td><td>Real clients</td></tr>
</tbody></table></div>`;

mount(`${header({ num: '21', title: 'System · mobile', round: 'E', sub: 'Diagnostics organised by category, not by raw environment variable: a verdict, modules, and one next action per problem. Built from reference G and the Readiness Desk (R7), which it replaces only after founder approval.' })}
${section('01', 'CATEGORIES', `<div class="bd-row">${overview}${infra}${integ}${security}</div>`)}
${section('02', 'DETAIL + CHIP GRAMMAR', `<div class="bd-row">${detail}${legend}</div>`)}
${foot('BOARD 21 / 28 · SYSTEM · MOBILE', `${MODULES.length} MODULES FROM THE READINESS REPORT · NO SECRET VALUES`)}`);
