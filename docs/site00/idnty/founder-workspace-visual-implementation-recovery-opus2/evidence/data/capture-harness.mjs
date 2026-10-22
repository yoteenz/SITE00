// node cap4.mjs <outDir> <jobs.json>
// jobs: [{ label, route, mode: 'mock'|'empty'|'error'|'live', sizes: ['390x844', ...], steps?: [{click?: sel, wait?: ms, key?: k, type?: [sel, text]}], expectSel?: sel }]
// mock/empty/error intercept /api/admin/site00-foundation with FICTIONAL rows (OPUS1 demo names). The React code is the real app.
import { readFileSync, mkdirSync } from 'node:fs';
import { chromium } from '/home/user/SITE00/node_modules/playwright/index.mjs';

const [out, jobsPath] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const jobs = JSON.parse(readFileSync(jobsPath, 'utf8'));
const now = Date.now();
const iso = (mins) => new Date(now - mins * 60000).toISOString();
const SRC = [
  ['11111111-1111-4111-8111-111111111101', 'AIO', 'AIO'],
  ['11111111-1111-4111-8111-111111111102', 'SISTER_REA', 'Sister / REA'],
  ['11111111-1111-4111-8111-111111111103', 'DIRECT', 'Direct'],
  ['11111111-1111-4111-8111-111111111104', 'CLIENT_REFERRAL', 'Client referral'],
  ['11111111-1111-4111-8111-111111111105', 'SITE00', 'SITE 00'],
].map(([referral_source_id, kind, label]) => ({ referral_source_id, kind, label, active: true }));
const A = [
  ['Horizon Freight', 'INTAKE_COMPLETE', 'NONE', 'COMPLETE', 600, 0],
  ['Carter & Lane', 'QUOTE_READY', 'NONE', 'COMPLETE', 180, 3],
  ['Atelier Bloom', 'INTAKE_IN_PROGRESS', 'NONE', 'IN_PROGRESS', 120, 2],
  ['Field & Ember', 'IN_PROGRESS', 'PAID', 'COMPLETE', 40, 3],
  ['Vela Boutique', 'WAITING_ON_PROVIDER', 'PAID', 'COMPLETE', 5760, 2],
  ['Avery Studio', 'INVITED', 'NONE', 'NOT_STARTED', 300, null],
  ['Summit Wellness', 'AWAITING_PAYMENT', 'CHECKOUT_PENDING', 'COMPLETE', 2880, 0],
  ['Nova Creative', 'COMPLETE', 'PAID', 'COMPLETE', 30000, 4],
].map(([n, s, p, i, m, src], k) => ({ artifact_id: `fx${k}0000-0000-4000-8000-00000000000${k}`, public_token: `fxtok${k}abcdef`, state: s, payment_state: p, intake_state: i, business_name: n, referral_source_id: src === null ? null : SRC[src].referral_source_id, created_at: iso(m + 4000), last_activity_at: iso(m) }));
const STAGE = { 'Field & Ember': '04_DNS_SECURITY', 'Vela Boutique': '02_DOMAIN', 'Nova Creative': '07_FOUNDATION_COMPLETE' };
const pipe = A.map((a) => ({ artifact_id: a.artifact_id, business_name: a.business_name, payment_state: a.payment_state, current_stage: STAGE[a.business_name] ?? (a.state === 'QUOTE_READY' ? 'quote' : null), next_action: a.state === 'INTAKE_COMPLETE' ? 'Review intake' : null, blocker: a.state === 'WAITING_ON_PROVIDER' ? 'DNS provider ticket open' : null }));
const task = (id, t, type, mode, status, stage = '04_DNS_SECURITY') => ({ task_id: id, title: t, task_type: type, execution_mode: mode, status, project_stage: stage, dependency_task_ids: [], description: `${t} — fictional runbook task for capture.`, started_at: status === 'IN_PROGRESS' ? iso(90) : null, completed_at: status === 'COMPLETE' ? iso(600) : null });
const TASKS = [
  task('t1', 'MX records', 'MX_CONFIGURE', 'ASSISTED', 'COMPLETE'),
  task('t2', 'SPF record', 'SPF_CONFIGURE', 'ASSISTED', 'COMPLETE'),
  task('t3', 'DKIM record', 'DKIM_CONFIGURE', 'EXTERNAL_MANUAL', 'IN_PROGRESS'),
  task('t4', 'DMARC policy', 'DMARC_CONFIGURE', 'ASSISTED', 'READY'),
  task('t5', 'Approve DNS change', 'APPROVE_DNS_CHANGE', 'CLIENT_ACTION', 'WAITING_CLIENT'),
  task('t6', 'DNS verification', 'DNS_VERIFY', 'VERIFICATION', 'NOT_READY'),
  task('t7', 'Mailbox provisioning', 'MAILBOX_PROVISION', 'AUTOMATED', 'COMPLETE', '03_PROFESSIONAL_EMAIL'),
];
const byMode = {};
for (const t of TASKS) (byMode[t.execution_mode] ??= []).push(t);
function detail(id) {
  const a = A.find((x) => x.artifact_id === id) ?? A[0];
  const quote = ['QUOTE_READY', 'AWAITING_PAYMENT', 'IN_PROGRESS', 'WAITING_ON_PROVIDER', 'COMPLETE'].includes(a.state)
    ? { quote_id: 'q1', artifact_id: id, base_service_version: 'v1', base_price_minor: 50000, selected_addons: [{ addon_id: 'ADDITIONAL_MAILBOX', quantity: 5, unit_price_minor: 7500, line_total_minor: 37500, requires_manual_review: false }, { addon_id: 'DOMAIN_TRANSFER', quantity: 1, unit_price_minor: 10000, line_total_minor: 10000, requires_manual_review: true }], addon_total_minor: 47500, manual_adjustments_minor: 0, subtotal_minor: 97500, currency: 'USD', projected_min_days: 5, projected_max_days: 9, timeline_custom_review: false, third_party_cost_notice: '', quote_version: 2, status: 'READY', founder_commercial_ready: a.state !== 'QUOTE_READY', created_at: iso(200), expires_at: new Date(now + 14 * 86400000).toISOString() }
    : null;
  return {
    artifact: { ...a, lead_id: 'l', client_org_id: null, contact_id: null, service_id: 'df', quote_id: quote ? 'q1' : null, project_state: 'NONE', completion_state: 'NONE', build_interest: 'NONE', build_recommendation: 'NONE', foundation_credit_id: null, opened_at: iso(5000), completed_at: null, intake: { business_name: a.business_name, industry: 'TRANSPORTATION_LOGISTICS', contact_name: 'Jordan Hale', current_email: `ops@${a.business_name.toLowerCase().replace(/[^a-z]/g, '')}.invalid`, phone: '202-555-0143', existing_domain: `${a.business_name.toLowerCase().replace(/[^a-z]/g, '')}.invalid`, existing_registrar: 'GODADDY', existing_email_provider: 'GOOGLE_WORKSPACE', team_size: 6, needs: ['OWN_DOMAIN', 'NEED_MULTI_MAILBOX'] } },
    lead: { lead_id: 'l', contact_email: null, referral_funnel_stage: 'INTAKE' },
    referral_source: a.referral_source_id ? SRC.find((s) => s.referral_source_id === a.referral_source_id) : null,
    quote,
    recommendation: a.intake_state === 'COMPLETE' ? { title: 'Recommended', recommended_addons: [{ addon_id: 'ADDITIONAL_MAILBOX', quantity: 5, unit_price_minor: 7500, line_total_minor: 37500, requires_manual_review: false }, { addon_id: 'DOMAIN_TRANSFER', quantity: 1, unit_price_minor: 10000, line_total_minor: 10000, requires_manual_review: true }], site00_handles: [], client_must_provide: ['REGISTRAR_ACCESS'], third_party_costs: [], projected_investment_minor: 97500, projected_min_days: 5, projected_max_days: 9, timeline_custom_review: false, dependencies: [], manual_review: true, manual_review_reasons: ['REGISTRAR_ACCESS_UNCONFIRMED'] } : null,
    acceptance: null,
    stages: STAGE[a.business_name] ? [{ stage_code: '01_DETAILS_RECEIVED', status: 'COMPLETE', updated_at: iso(3000) }, { stage_code: '02_DOMAIN', status: 'COMPLETE', updated_at: iso(2000) }, { stage_code: '03_PROFESSIONAL_EMAIL', status: 'COMPLETE', updated_at: iso(900) }, { stage_code: '04_DNS_SECURITY', status: 'IN_PROGRESS', updated_at: iso(60) }] : [],
    client_actions: a.state === 'IN_PROGRESS' ? [{ request_id: 'r1', artifact_id: id, action_type: 'APPROVE_DNS_CHANGE', title: 'Approve DNS change', detail: '', status: 'OPEN', created_at: iso(120), completed_at: null, response: null }] : [],
    approvals: a.state === 'INTAKE_COMPLETE' ? [{ approval_id: 'ap1', artifact_id: id, subject: 'Intake review', version: 1, status: 'REQUESTED', actor: 'SYSTEM', note: null, created_at: iso(600), resolved_at: null }] : [],
    ownership_record: null, build_readiness: null, credit: null,
    events: [{ event_id: 'e1', artifact_id: id, event_type: 'ARTIFACT_CREATED', actor: 'FOUNDER', payload: {}, created_at: iso(5000) }, { event_id: 'e2', artifact_id: id, event_type: 'LINK_OPENED', actor: 'CLIENT', payload: {}, created_at: iso(4000) }, { event_id: 'e3', artifact_id: id, event_type: 'INTAKE_COMPLETED', actor: 'CLIENT', payload: {}, created_at: iso(700) }],
    surface: 'PORTAL',
  };
}
const READINESS = {
  overall_status: 'ACTION_REQUIRED',
  ready: ['Staging Supabase isolated', 'Founder admin verified on API', 'Persistence flag on'],
  needs_founder: ['Confirm GoDaddy DKIM + Resend domain'],
  blocked: [],
  unverified: ['Stripe webhook probe', 'Live email delivery'],
  env_var_groups: [{ id: 'resend', primary: 'RESEND_API_KEY', aliases: [], purpose: 'Transactional email provider', required: true, satisfied: true, present_names: ['RESEND_API_KEY'], status: 'READY' }, { id: 'send', primary: 'SITE00_DF_TRANSACTIONAL_EMAIL_SEND', aliases: [], purpose: 'Transactional send flag', required: false, satisfied: false, present_names: [], status: 'UNVERIFIED' }],
  database_security: { supabase_project_ref: 'stagingref', project_messages_table: { anon_select: 'denied', service_role_select: 'allowed_rows' }, persistence_safe: true, notes: ['RLS probe on project messages'] },
  activation: { e2e_authorized: false, synthetic_intake_ready: true, remote_migration_applied: true, deployment_performed: true, founder_login_verified: true },
  staging_identities: { expected_frontend_origin: 'https://carefree-luck.example.invalid', expected_api_origin: 'https://reliable-creation.example.invalid', configured_public_origin: null, effective_public_origin: 'https://site00.com', supabase_project_ref: 'stagingref', supabase_staging_isolation_verified: true, persistence_store: 'supabase', email_sending_enabled: false, stripe_key_mode: 'test', e2e_passed: false },
  env: { founder_test_mode: true, transactional_send_flag: false, resend_configured: true, allowlist_configured: true, supabase_persistence: true, stripe_secret_present: true, stripe_webhook_secret_present: true, resend_webhook_secret_present: true, transactional_from_present: true, transactional_reply_to_present: false },
  deployment: { commit_short: 'fx00000', pr1642_reference: '', package_marker: 'founder-readiness-e2e-v1' },
  env_vars: [],
};
const TIMELINE = [
  { intent_id: 'i1', artifact_id: A[5].artifact_id, event_type: 'ARTIFACT_CREATED', template_id: 'personal-foundation-invitation', status: 'DRY_RUN', created_at: iso(300), recipient_email: 'jo•••@avery-studio.invalid' },
  { intent_id: 'i2', artifact_id: A[0].artifact_id, event_type: 'INTAKE_COMPLETED', template_id: 'intake-completed', status: 'DRY_RUN', created_at: iso(600), recipient_email: 'op•••@horizonfreight.invalid' },
  { intent_id: 'i3', artifact_id: A[1].artifact_id, event_type: 'QUOTE_CREATED', template_id: 'quote-ready', status: 'DRY_RUN', created_at: iso(180), recipient_email: 'ha•••@carterlane.invalid' },
];
const MESSAGES = [
  { message_id: 'm1', author_role: 'FOUNDER', body: 'We need access to your registrar to connect the domain. You can approve it from your portal.', created_at: iso(6000), delivery_state: 'DELIVERED' },
  { message_id: 'm2', author_role: 'CLIENT', body: 'Thanks — I will find the login this week.', created_at: iso(5900), delivery_state: 'DELIVERED' },
];

function fixture(action, url, mode) {
  if (mode === 'empty') {
    if (action === 'list') return { artifacts: [], referral_sources: SRC };
    if (action === 'pipeline') return { rows: [] };
    if (action === 'email-timeline') return { events: [] };
    if (action === 'readiness-report') return READINESS;
    return {};
  }
  switch (action) {
    case 'list': return { artifacts: A, referral_sources: SRC };
    case 'pipeline': return { rows: pipe };
    case 'detail': return detail(url.searchParams.get('id'));
    case 'workbench': return { buckets: {}, by_mode: byMode, command: { what_client_owes: ['Approve DNS change'], what_is_blocked: [], current_forecast: { current_min_days: 3, current_max_days: 5 } } };
    case 'completion-gate': return { ok: false, code: 'COMPLETION_GATE_FAILED', reasons: ['TASKS_INCOMPLETE:4', 'VERIFICATION_REQUIRED', 'OWNERSHIP_RECORD_MISSING'] };
    case 'messages': return { messages: MESSAGES };
    case 'email-timeline': return { events: TIMELINE };
    case 'readiness-report': return READINESS;
    case 'test-journey': return { artifact_id: 'fxtest', state: 'INVITED', intake_state: 'NOT_STARTED', payment_state: 'NONE', surface: 'INTAKE', personalized_url: '/foundation/fxtesttok', token_masked: 'fxte…tok', event_count: 2, email_events: [{ intent_id: 'ti1', artifact_id: 'fxtest', event_type: 'ARTIFACT_CREATED', template_id: 'personal-foundation-invitation', status: 'DRY_RUN', recipient_email: 'fo•••@site00.invalid', provider_message_id: null, last_error: null }] };
    default: return {};
  }
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
const results = [];
for (const job of jobs) {
  for (const s of job.sizes) {
    const [w, h] = s.split('x').map(Number);
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: job.dpr ?? 1 });
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    const posted = [];
    if (job.mode !== 'live')
      await page.route('**/api/admin/site00-foundation**', (r) => {
        const u = new URL(r.request().url());
        if (r.request().method() !== 'GET') {
          const body = JSON.parse(r.request().postData() || '{}');
          posted.push(body.action);
          // Capture-only fixtures for the two flows that must succeed to reach OL-02 and the Test Lab journey. Nothing leaves the browser.
          if (job.fixturePosts && body.action === 'create-artifact') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ personalized_url: '/foundation/fxtok0abcdef' }) });
          if (job.fixturePosts && body.action === 'create-test-client') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ artifact: { artifact_id: 'fxtest', public_token: 'fxtesttok' }, personalized_url: '/foundation/fxtesttok' }) });
          return r.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ error: 'CAPTURE_HARNESS_REFUSES_MUTATIONS' }) });
        }
        if (job.mode === 'error') return r.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'SERVICE_UNAVAILABLE (capture)' }) });
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture(u.searchParams.get('action'), u, job.mode)) });
      });
    await page.goto(`http://127.0.0.1:5310${job.route}`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForFunction(() => !document.querySelector('.ws--fonts-pending'), null, { timeout: 12000 }).catch(() => undefined);
    await page.waitForTimeout(500);
    let stepErr = '';
    for (const st of job.steps ?? []) {
      try {
        if (st.click) await page.locator(st.click).first().click({ timeout: 5000 });
        if (st.type) await page.locator(st.type[0]).first().fill(st.type[1]);
        if (st.key) await page.keyboard.press(st.key);
        await page.waitForTimeout(st.wait ?? 450);
      } catch (e) {
        stepErr = `step ${JSON.stringify(st)} failed: ${String(e).slice(0, 120)}`;
      }
    }
    const info = await page.evaluate((expectSel) => {
      const f = (sel) => { const e = document.querySelector(sel); if (!e) return null; const c = getComputedStyle(e); return `${c.fontFamily.split(',')[0].replace(/"/g, '')} ${c.fontWeight} ${c.fontSize}`; };
      const rgb = (c) => (c.match(/\d+(\.\d+)?/g) || []).map(Number);
      const blue = [...document.querySelectorAll('.ws button, .ws a, .ws input, .ws select')].filter((e) => { const m = rgb(getComputedStyle(e).color); return m.length >= 3 && m[2] > 150 && m[0] < 100; }).length;
      const native = [...document.querySelectorAll('.ws select, .ws input[type=checkbox], .ws input[type=radio]')].filter((e) => e.offsetParent !== null).length;
      const ov = document.querySelector('[data-ifw-overlay]');
      const ovBox = ov ? document.querySelector('.ws-ov')?.getBoundingClientRect() : null;
      const fonts = [...new Set([...document.querySelectorAll('.ws *')].slice(0, 4000).map((e) => getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g, '').trim()))];
      return {
        h1: document.querySelector('h1')?.textContent?.slice(0, 40) ?? null,
        h1Font: f('h1'),
        overflow: document.scrollingElement.scrollWidth > innerWidth + 1,
        stageOverflow: (() => { const st = document.getElementById('stage'); return st ? st.scrollWidth > st.clientWidth + 1 : null; })(),
        blueControls: blue,
        nativeControls: native,
        fonts,
        overlay: ov ? ov.getAttribute('data-ifw-overlay') : null,
        overlayMode: ov ? ov.getAttribute('data-ifw-tier-mode') : null,
        overlayBox: ovBox ? [Math.round(ovBox.left), Math.round(ovBox.top), Math.round(ovBox.width), Math.round(ovBox.height)] : null,
        overlayInView: ovBox ? ovBox.left >= -1 && ovBox.top >= -1 && ovBox.right <= innerWidth + 1 && ovBox.bottom <= innerHeight + 1 : null,
        expect: expectSel ? Boolean(document.querySelector(expectSel)) : null,
        insp: Boolean(document.querySelector('.ws-app--insp')),
        toasts: [...document.querySelectorAll('[data-toast-tone]')].map((t) => t.getAttribute('data-toast-tone')),
      };
    }, job.expectSel ?? null);
    const file = `${out}/${job.label}-${w}x${h}.png`;
    await page.screenshot({ path: file, fullPage: false });
    const rec = { label: job.label, size: s, ...info, errors: errs, stepErr, posted };
    results.push(rec);
    console.log(JSON.stringify(rec));
    await page.close();
  }
}
await browser.close();
