/**
 * Digital Foundation Board 01 + 02 — live browser QA.
 *
 *   npx tsx scripts/site00/df-client-qa/qa-df-api-server.ts      # memory-store harness on :3110
 *   npx vite --port 5174 --host 127.0.0.1                         # app
 *   OUT=docs/site00/idnty/df-client-board-01-02-qa node scripts/site00/df-client-qa/df-client-flow.cjs
 *
 * Every check reads the server (Composer's real handler) and compares it to what the browser shows.
 */
const fs = require('fs');
const path = require('path');
const L = require('./df-qa-lib.cjs');

const OUT = path.resolve(process.env.OUT || 'docs/site00/idnty/df-client-board-01-02-qa');
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function record(id, name, pass, detail = '') {
  results.push({ id, name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ` — ${detail}` : ''}`);
}
async function check(id, name, fn) {
  if (ONLY && !ONLY.includes(id.split('.')[0])) return;
  try {
    const detail = await fn();
    record(id, name, true, typeof detail === 'string' ? detail : '');
  } catch (e) {
    record(id, name, false, String(e && e.message).split('\n')[0]);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
async function shot(page, name, full = false) {
  await page.evaluate(() => document.fonts.ready);
  await L.settle(page, 350);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: full });
}
async function payload(token) {
  const r = await L.api('GET', 'payload', { token });
  return r.json;
}
const money = (minor) => `$${(minor / 100).toLocaleString('en-US', { minimumFractionDigits: minor % 100 ? 2 : 0 })}`;
const textOf = (page, sel) => page.locator(sel).first().innerText();

const LEAD = { business_name: 'Anthony Transport LLC', contact_name: 'Anthony Reyes', contact_email: 'anthony@example.com' };

(async () => {
  const browser = await L.launch();
  const vp = process.env.VP || 'm390';

  // ── Board 01 ────────────────────────────────────────────────────────────────────────────────
  const { token } = await L.qa('create', LEAD);
  const { page, errors, log, failed } = await L.newPage(browser, vp);
  await check('Q01', 'P01 renders on a fresh link and the server marks it OPENED', async () => {
    await page.goto(`${L.BASE}/foundation/${token}`);
    await L.waitView(page, 'P01', 90000);
    const p = await payload(token);
    assert(p.artifact.state === 'OPENED', `state ${p.artifact.state}`);
    const lede = await textOf(page, '.df-lede');
    assert(/TYPICALLY 2–3 BUSINESS DAYS/.test(lede), 'turnaround copy bound to config');
    assert(!page.url().includes('Anthony') && !page.url().includes('example.com'), 'no PII in URL');
    await shot(page, '01-p01-foundation-entry');
    await shot(page, '01-p01-foundation-entry-full', true);
    return `state=OPENED url=/foundation/<token>`;
  });

  await check('Q02', 'BEGIN starts intake server-side and opens P02 prefilled from the lead', async () => {
    await page.getByRole('button', { name: /BEGIN MY FOUNDATION/ }).click();
    await L.waitView(page, 'P02');
    const p = await payload(token);
    assert(p.artifact.state === 'INTAKE_IN_PROGRESS', `state ${p.artifact.state}`);
    assert((await page.inputValue('#df-business_name')) === LEAD.business_name, 'business name prefilled');
    assert((await page.inputValue('#df-current_email')) === LEAD.contact_email, 'email prefilled');
    assert(page.url().endsWith(`/foundation/${token}`), 'same URL');
    return 'INTAKE_IN_PROGRESS';
  });

  await check('Q03', 'P02 required-field validation blocks CONTINUE', async () => {
    await page.fill('#df-current_email', '');
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await page.waitForSelector('#df-current_email-error');
    assert((await textOf(page, '#df-current_email-error')).includes('ENTER AN EMAIL'), 'error copy');
    assert((await L.view(page)).view === 'P02', 'stayed on P02');
  });

  await check('Q04', 'P02 autosave reports SAVED only after the server holds the fields', async () => {
    await page.fill('#df-current_email', 'anthony@anthonytransport.co');
    await page.selectOption('#df-industry', 'TRANSPORTATION + LOGISTICS');
    await page.fill('#df-phone', '(555) 201-4410');
    await page.waitForSelector('.df-save--saved', { timeout: 15000 });
    const p = await payload(token);
    assert(p.artifact.intake.current_email === 'anthony@anthonytransport.co', `server email ${p.artifact.intake.current_email}`);
    assert(p.artifact.intake.industry === 'TRANSPORTATION + LOGISTICS', 'server industry');
    assert(p.artifact.intake.phone === '(555) 201-4410', 'server phone');
    await page.locator('.df-field').first().scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(page, '02-p02-business-intake');
    await shot(page, '02-p02-business-intake-full', true);
    return 'saved to server';
  });

  await check('Q05', 'Reload resumes P02 with the saved answers (one URL, server-resolved)', async () => {
    await page.reload();
    await L.waitView(page, 'P02', 60000);
    assert((await page.inputValue('#df-current_email')) === 'anthony@anthonytransport.co', 'resumed email');
    assert((await page.inputValue('#df-phone')) === '(555) 201-4410', 'resumed phone');
  });

  await check('Q06', 'P02 save failure is shown as NOT SAVED, never SAVED', async () => {
    const ctx = page.context();
    const e0 = errors.length;
    const f0 = failed.length;
    await ctx.route(/digital-foundation-artifact\?action=update-intake/, (r) => r.abort('connectionrefused'));
    await page.fill('#df-phone', '(555) 201-4411');
    await page.waitForSelector('.df-save--error', { timeout: 15000 });
    await ctx.unroute(/digital-foundation-artifact\?action=update-intake/);
    // The refused request above is the injected failure, not an app error.
    errors.splice(e0);
    failed.splice(f0);
    await page.click('.df-save--error');
    await page.waitForSelector('.df-save--saved', { timeout: 15000 });
    const p = await payload(token);
    assert(p.artifact.intake.phone === '(555) 201-4411', 'retry persisted');
  });

  await check('Q07', 'CONTINUE opens P03 with core services locked as included', async () => {
    await page.getByRole('button', { name: /^CONTINUE/ }).click();
    await L.waitView(page, 'P03');
    const core = await page.locator('.df-row--locked').count();
    assert(core === 4, `core rows ${core}`);
    await shot(page, '03-p03-foundation-configurator');
    await shot(page, '03-p03-foundation-configurator-full', true);
  });

  await check('Q07b', 'Menu lists the parents this surface allows; additional services sheet opens', async () => {
    await page.getByRole('button', { name: 'OPEN MENU' }).click();
    await page.waitForSelector('#df-menu');
    const enabled = await page.locator('.df-menu__item:not([disabled])').allInnerTexts();
    assert(enabled.length === 3, `enabled ${enabled.length}`);
    await shot(page, '03c-menu-drawer');
    await page.getByRole('button', { name: 'CLOSE', exact: true }).click();
    await page.locator('.df-row', { hasText: 'ADDITIONAL SERVICES' }).locator('.df-row__main').click();
    await page.waitForSelector('.df-sheet__panel');
    await shot(page, '03d-p03-additional-services-sheet');
    await page.getByRole('button', { name: 'CLOSE', exact: true }).click();
    return enabled.map((t) => t.replace(/\s+/g, ' ')).join(' | ');
  });

  await check('Q08', 'P03 requires exactly one domain path', async () => {
    await page.locator('.df-row').first().locator('.df-row__main').click(); // close reveal
    await page.getByRole('button', { name: /VIEW MY RECOMMENDATION/ }).click();
    await page.waitForSelector('text=CHOOSE HOW WE HANDLE YOUR DOMAIN');
    const p = await payload(token);
    assert(p.artifact.intake_state === 'IN_PROGRESS', 'not completed');
  });

  await check('Q09', 'P03 selections: own domain, 2 people, migration, device setup', async () => {
    await page.locator('label.df-path', { hasText: 'CONNECT A DOMAIN I OWN' }).click();
    await page.getByRole('button', { name: /VIEW MY RECOMMENDATION/ }).click();
    await page.waitForSelector('#df-existing_domain-error');
    await page.fill('#df-existing_domain', 'anthonytransport.co');
    await page.fill('#df-existing_registrar', 'GoDaddy');
    await page.getByRole('button', { name: 'DONE' }).click();
    await page.locator('.df-row', { hasText: 'PROFESSIONAL EMAIL' }).locator('.df-row__main').click();
    await page.getByRole('button', { name: /MORE — PEOPLE WHO NEED EMAIL/ }).click();
    await page.locator('.df-row', { hasText: 'PROFESSIONAL EMAIL' }).locator('.df-row__main').click();
    await page.locator('.df-row', { hasText: 'EMAIL MIGRATION' }).locator('.df-row__main').first().click();
    await page.fill('#df-existing_email_provider', 'Gmail');
    await page.locator('.df-row', { hasText: 'DEVICE SETUP' }).locator('.df-row__main').click();
    await page.waitForSelector('.df-save--saved', { timeout: 15000 });
    const p = await payload(token);
    const needs = p.artifact.intake.needs;
    for (const n of ['OWN_DOMAIN', 'NEED_MULTI_MAILBOX', 'NEED_MIGRATION', 'NEED_DEVICE']) assert(needs.includes(n), `missing ${n}`);
    assert(!needs.includes('NEED_DOMAIN'), 'NEED_DOMAIN must not be set with OWN_DOMAIN');
    assert(p.artifact.intake.team_size === 2, `team ${p.artifact.intake.team_size}`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(page, '03b-p03-selected-add-ons');
    await shot(page, '03b-p03-selected-add-ons-full', true);
    return needs.join(',');
  });

  let quote1;
  await check('Q10', 'VIEW MY RECOMMENDATION completes intake and P04 shows the server quote', async () => {
    await page.getByRole('button', { name: /VIEW MY RECOMMENDATION/ }).click();
    await L.waitView(page, 'P04');
    const p = await payload(token);
    quote1 = p.quote;
    assert(p.artifact.state === 'QUOTE_READY', `state ${p.artifact.state}`);
    const total = await textOf(page, '.df-split__cell:first-child .df-split__value');
    assert(total === money(p.quote.subtotal_minor), `shown ${total} vs server ${money(p.quote.subtotal_minor)}`);
    const days = await textOf(page, '.df-split__cell:nth-child(2) .df-split__value');
    assert(days === `${p.quote.projected_min_days}–${p.quote.projected_max_days}`, `days ${days}`);
    await shot(page, '04-p04-recommendation');
    await shot(page, '04-p04-recommendation-full', true);
    return `v${p.quote.quote_version} ${total} ${days}d lines=${p.quote.selected_addons.map((l) => `${l.addon_id}×${l.quantity}`).join(',')}`;
  });

  await check('Q11', 'P04 manual-review notice for reviewed add-ons', async () => {
    const p = await payload(token);
    const manual = p.quote.selected_addons.some((l) => l.requires_manual_review);
    assert(manual, 'expected a reviewed line (migration)');
    await page.waitForSelector('text=SOME ITEMS ARE CONFIRMED BY SITE 00 BEFORE CHECKOUT');
    await page.locator('.df-alert', { hasText: 'SOME ITEMS ARE CONFIRMED' }).scrollIntoViewIfNeeded();
    await shot(page, '04c-p04-manual-review-state');
  });

  await check('Q12', 'P04 add DOMAIN TRANSFER: one update-quote, totals + timeline recalculated by the server', async () => {
    const before = log.length;
    await page.locator('[data-addon="DOMAIN_TRANSFER"] .df-addon__main').click();
    await page.waitForFunction(() => document.querySelector('.df-screen')?.getAttribute('data-state') === 'idle');
    const p = await payload(token);
    assert(p.quote.quote_version === quote1.quote_version + 1, `version ${p.quote.quote_version}`);
    assert(p.quote.selected_addons.some((l) => l.addon_id === 'DOMAIN_TRANSFER'), 'server has transfer');
    const total = await textOf(page, '.df-split__cell:first-child .df-split__value');
    assert(total === money(p.quote.subtotal_minor), `shown ${total} vs ${money(p.quote.subtotal_minor)}`);
    const days = await textOf(page, '.df-split__cell:nth-child(2) .df-split__value');
    assert(days === `${p.quote.projected_min_days}–${p.quote.projected_max_days}`, `days ${days}`);
    const calls = log.slice(before).filter((l) => l.startsWith('POST')).join(',');
    assert(calls === 'POST update-quote', `calls ${calls}`);
    await page.locator('.df-split').scrollIntoViewIfNeeded();
    await shot(page, '04b-p04-recalculated-estimate');
    return `${money(quote1.subtotal_minor)}→${total}, ${quote1.projected_min_days}–${quote1.projected_max_days}→${days}`;
  });

  await check('Q13', 'P04 mailbox stepper sets quantity on the server', async () => {
    const p0 = await payload(token);
    const q0 = p0.quote.selected_addons.find((l) => l.addon_id === 'ADDITIONAL_MAILBOX')?.quantity ?? 0;
    await page.getByRole('button', { name: 'MORE — ADDITIONAL MAILBOX' }).click();
    await page.waitForFunction(() => document.querySelector('.df-screen')?.getAttribute('data-state') === 'idle');
    const p = await payload(token);
    const q = p.quote.selected_addons.find((l) => l.addon_id === 'ADDITIONAL_MAILBOX');
    assert(q && q.quantity === q0 + 1, `qty ${q && q.quantity}`);
    return `${q0}→${q.quantity}`;
  });

  await check('Q14', 'P04 removing a line uses remove-addon (server dependency check)', async () => {
    const before = log.length;
    await page.locator('[data-addon="DOMAIN_TRANSFER"] .df-addon__main').click();
    await page.waitForFunction(() => document.querySelector('.df-screen')?.getAttribute('data-state') === 'idle');
    const calls = log.slice(before).filter((l) => l.startsWith('POST')).join(',');
    assert(calls === 'POST remove-addon', `calls ${calls}`);
    const p = await payload(token);
    assert(!p.quote.selected_addons.some((l) => l.addon_id === 'DOMAIN_TRANSFER'), 'removed');
  });

  await check('Q15', 'P04 dependency lock: STAFF SIGNATURE needs MULTI-USER', async () => {
    await page.getByRole('button', { name: /VIEW ALL ADD-ONS/ }).click();
    const staff = page.locator('[data-addon="STAFF_SIGNATURE_SYSTEM"] .df-addon__main');
    assert(await staff.isDisabled(), 'staff locked');
    assert((await textOf(page, '#df-lock-STAFF_SIGNATURE_SYSTEM')).includes('REQUIRES MULTI-USER WORKSPACE'), 'reason');
    await shot(page, '04d-p04-all-add-ons-sheet');
    await page.getByRole('button', { name: 'CLOSE', exact: true }).click();
  });

  // ── Board 02: review + checkout ─────────────────────────────────────────────────────────────
  await check('Q16', 'P05 READY TO REVIEW with canonical disclosures and quote-bound rows', async () => {
    await page.getByRole('button', { name: /CONTINUE TO REVIEW/ }).click();
    await L.waitView(page, 'P05');
    const s = await L.view(page);
    assert(s.review === 'READY_TO_REVIEW', s.review);
    const p = await payload(token);
    const inv = await page.locator('.df-spec', { hasText: 'INVESTMENT' }).locator('.df-spec__main').innerText();
    assert(inv === money(p.quote.subtotal_minor), `investment ${inv}`);
    const acks = await page.locator('.df-ack__text').allInnerTexts();
    assert(acks.length === 3 && acks[2].startsWith('I UNDERSTAND THAT THE PROJECTED TURNAROUND BEGINS'), 'canonical text');
    await shot(page, '05-p05-review-checkout');
    await shot(page, '05-p05-review-checkout-full', true);
  });

  await check('Q17', 'P05 manual review: acceptance recorded, checkout blocked (AWAITING FOUNDER PRICING)', async () => {
    for (const t of await page.locator('.df-ack').all()) await t.click();
    assert((await L.view(page)).review === 'AWAITING_ACCEPTANCE', 'awaiting acceptance');
    await page.getByRole('button', { name: /SUBMIT FOR CONFIRMATION/ }).click();
    await page.waitForFunction(() => document.querySelector('[data-review-state]')?.getAttribute('data-review-state') === 'AWAITING_FOUNDER_PRICING');
    const p = await payload(token);
    assert(p.artifact.state === 'AWAITING_PAYMENT' && p.quote.status === 'ACCEPTED', `server ${p.artifact.state}/${p.quote.status}`);
    const direct = await L.api('POST', 'start-checkout', { token, origin: 'http://qa' });
    assert(direct.status === 500 && direct.json.error === 'MANUAL_REVIEW_PENDING', `server gate ${direct.status} ${direct.json.error}`);
    assert(!(await page.locator('.df-cta', { hasText: 'AWAITING CONFIRMATION' }).isEnabled()), 'CTA disabled');
    await page.locator('.df-status').scrollIntoViewIfNeeded();
    await shot(page, '05b-p05-checkout-blocked');
    return 'server refuses checkout: MANUAL_REVIEW_PENDING';
  });

  await check('Q18', 'Founder confirms pricing → P05 READY FOR CHECKOUT', async () => {
    await L.qa('founder-ready', { token });
    await page.getByRole('button', { name: 'CHECK FOR UPDATES' }).click();
    await page.waitForFunction(() => document.querySelector('[data-review-state]')?.getAttribute('data-review-state') === 'READY_FOR_CHECKOUT');
    await page.locator('.df-status').scrollIntoViewIfNeeded();
    await shot(page, '05c-p05-ready-for-checkout');
  });

  await check('Q19', 'PROCEED TO CHECKOUT hands off to the hosted checkout URL; return shows VERIFYING, not paid', async () => {
    await page.getByRole('button', { name: /PROCEED TO CHECKOUT/ }).click();
    await page.waitForURL(/checkout=return/, { timeout: 30000 });
    await L.waitView(page, 'P06', 60000);
    const s = await L.view(page);
    assert(s.activation === 'VERIFYING_PAYMENT', s.activation);
    const p = await payload(token);
    assert(p.artifact.payment_state === 'CHECKOUT_PENDING', `payment ${p.artifact.payment_state}`);
    assert(/simulated_checkout=1/.test(page.url()), 'simulated adapter (no Stripe key) in QA');
    await shot(page, '06a-p06-verifying-payment');
    return 'redirect alone did not mark PAID';
  });

  await check('Q20', 'Poll exhausts → PAYMENT CONFIRMATION PENDING (still not paid)', async () => {
    await page.waitForFunction(
      () => document.querySelector('[data-activation-state]')?.getAttribute('data-activation-state') === 'PAYMENT_CONFIRMATION_PENDING',
      null,
      { timeout: 60000 },
    );
    await shot(page, '06b-p06-payment-confirmation-pending');
    await shot(page, '06b-p06-payment-confirmation-pending-full', true);
  });

  await check('Q21', 'Webhook confirms payment → P06 verified activation from server data', async () => {
    await L.qa('webhook-paid', { token });
    await page.getByRole('button', { name: 'CHECK AGAIN' }).click();
    await page.waitForFunction(() => {
      const s = document.querySelector('[data-activation-state]')?.getAttribute('data-activation-state');
      return s && !['VERIFYING_PAYMENT', 'PAYMENT_CONFIRMATION_PENDING'].includes(s);
    }, null, { timeout: 60000 });
    const p = await payload(token);
    assert(p.artifact.payment_state === 'PAID', 'server PAID');
    await page.waitForFunction(() => !location.search.includes('checkout='));
    const s = await L.view(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(page, '06c-p06-verified-activation');
    await shot(page, '06c-p06-verified-activation-full', true);
    return `${s.activation}; needs_you=${p.operations_summary?.needs_you_count}; stage=${p.operations_summary?.current_stage}`;
  });

  await check('Q22', 'VIEW PROJECT OVERVIEW → interim overview from server stages; reload lands there', async () => {
    await page.getByRole('button', { name: /VIEW PROJECT OVERVIEW/ }).click();
    await L.waitView(page, 'OVERVIEW');
    const p = await payload(token);
    const shown = await page.locator('.df-stage').count();
    assert(shown === p.stages.length, `stages ${shown}/${p.stages.length}`);
    await shot(page, '07-interim-project-overview');
    await shot(page, '07-interim-project-overview-full', true);
    await page.reload();
    await L.waitView(page, 'OVERVIEW', 60000);
  });

  await check('Q23', 'Client payload carries no events, referral accounting or secrets', async () => {
    const p = await payload(token);
    assert(!('events' in p) && !('referral_source' in p), 'internal keys present');
    const dom = await page.content();
    for (const bad of ['referral_source', 'Sister', 'internal_description', 'public_token', 'evt_', 'cs_sim']) {
      assert(!dom.includes(bad), `DOM contains ${bad}`);
    }
  });
  await page.context().close();

  // ── Child / error states on separate links ────────────────────────────────────────────────
  async function acceptedLink(opts = {}) {
    const { token: t } = await L.qa('create', LEAD);
    await L.api('POST', 'update-intake', {
      token: t,
      intake: { business_name: LEAD.business_name, contact_name: LEAD.contact_name, current_email: LEAD.contact_email, team_size: 1 },
      needs: ['NEED_DOMAIN'],
      markComplete: true,
    });
    if (opts.accept !== false) {
      await L.api('POST', 'accept-quote', {
        token: t,
        disclosures: [
          'I HAVE REVIEWED MY DIGITAL FOUNDATION SCOPE.',
          'I UNDERSTAND THAT DOMAIN / EMAIL PROVIDER SUBSCRIPTIONS AND OTHER THIRD-PARTY FEES MAY BE SEPARATE.',
          'I UNDERSTAND THAT THE PROJECTED TURNAROUND BEGINS AFTER REQUIRED INFORMATION, ACCESS AND PAYMENT ARE RECEIVED.',
        ],
      });
    }
    return t;
  }

  await check('Q24', 'P05 PAYMENT CANCELLED on ?checkout=cancel', async () => {
    const t = await acceptedLink();
    await L.api('POST', 'start-checkout', { token: t, origin: 'http://qa' });
    const { page: p2, ctx } = await L.newPage(browser, vp);
    await p2.goto(`${L.BASE}/foundation/${t}?checkout=cancel`);
    await L.waitView(p2, 'P05', 60000);
    assert((await L.view(p2)).review === 'PAYMENT_CANCELLED', 'cancelled');
    await p2.locator('.df-status').scrollIntoViewIfNeeded();
    await shot(p2, '05d-p05-payment-cancelled');
    await ctx.close();
  });

  await check('Q25', 'P05 PAYMENT PENDING when a checkout is open without a return', async () => {
    const t = await acceptedLink();
    await L.api('POST', 'start-checkout', { token: t, origin: 'http://qa' });
    const { page: p2, ctx } = await L.newPage(browser, vp);
    await p2.goto(`${L.BASE}/foundation/${t}`);
    await L.waitView(p2, 'P05', 60000);
    assert((await L.view(p2)).review === 'PAYMENT_PENDING', 'pending');
    await p2.locator('.df-status').scrollIntoViewIfNeeded();
    await shot(p2, '05e-p05-payment-pending');
    await ctx.close();
  });

  await check('Q26', 'P05 CHECKOUT ERROR when the checkout call fails; nothing charged', async () => {
    const t = await acceptedLink();
    const { page: p2, ctx } = await L.newPage(browser, vp, { failActions: ['start-checkout'] });
    await p2.goto(`${L.BASE}/foundation/${t}`);
    await L.waitView(p2, 'P05', 60000);
    assert((await L.view(p2)).review === 'READY_FOR_CHECKOUT', 'ready');
    await p2.getByRole('button', { name: /PROCEED TO CHECKOUT/ }).click();
    await p2.waitForFunction(() => document.querySelector('[data-review-state]')?.getAttribute('data-review-state') === 'CHECKOUT_ERROR');
    const p = await payload(t);
    assert(p.artifact.payment_state === 'NONE', `payment ${p.artifact.payment_state}`);
    await p2.locator('.df-status').scrollIntoViewIfNeeded();
    await shot(p2, '05f-p05-checkout-error');
    await ctx.close();
  });

  await check('Q27', 'P06 AWAITING CLIENT AUTHORIZATION from an open authorization request', async () => {
    const t = await acceptedLink();
    await L.qa('webhook-paid', { token: t });
    await L.qa('client-action', { token: t, action_type: 'AUTHORIZE_PROVIDER', title: 'Authorize Google Workspace access' });
    const { page: p2, ctx } = await L.newPage(browser, vp);
    await p2.goto(`${L.BASE}/foundation/${t}`);
    await L.waitView(p2, 'P06', 60000);
    const s = await L.view(p2);
    assert(s.activation === 'AWAITING_CLIENT_AUTHORIZATION', s.activation);
    await shot(p2, '06d-p06-awaiting-client-authorization');
    await ctx.close();
  });

  await check('Q28', 'P06 PROJECT PAUSED after a recorded refund', async () => {
    const t = await acceptedLink();
    await L.qa('webhook-paid', { token: t });
    await L.qa('refund', { token: t });
    const { page: p2, ctx } = await L.newPage(browser, vp);
    await p2.goto(`${L.BASE}/foundation/${t}`);
    await L.waitView(p2, 'P06', 60000);
    assert((await L.view(p2)).activation === 'PROJECT_PAUSED', 'paused');
    await shot(p2, '06e-p06-project-paused');
    await ctx.close();
  });

  await check('Q29', 'Founder scope change after acceptance → P05 asks to accept again, then checkout at the new price', async () => {
    const t = await acceptedLink();
    let gap = '';
    try {
      await L.qa('adjust', { token: t, minor: 5000 });
    } catch (e) {
      gap = ` (Composer gap: adjust returned ${String(e.message).replace('qa adjust: ', '')} but applied the new version)`;
    }
    const p0 = await payload(t);
    const { page: p2, ctx } = await L.newPage(browser, vp);
    await p2.goto(`${L.BASE}/foundation/${t}`);
    await L.waitView(p2, 'P05', 60000);
    assert((await L.view(p2)).review === 'SCOPE_CHANGED', (await L.view(p2)).review);
    const inv = await p2.locator('.df-spec', { hasText: 'INVESTMENT' }).locator('.df-spec__main').innerText();
    assert(inv === money(p0.quote.subtotal_minor), `investment ${inv}`);
    await p2.locator('.df-status').scrollIntoViewIfNeeded();
    await shot(p2, '05g-p05-scope-changed');
    for (const a of await p2.locator('.df-ack').all()) await a.click();
    await p2.getByRole('button', { name: /PROCEED TO CHECKOUT/ }).click();
    await p2.waitForURL(/checkout=return/, { timeout: 30000 });
    const p1 = await payload(t);
    assert(p1.acceptance.quote_version === p1.quote.quote_version, 'accepted current version');
    await ctx.close();
    return `re-accepted v${p1.quote.quote_version} at ${money(p1.quote.subtotal_minor)}${gap}`;
  });

  await check('Q30', 'Invalid link shows the closed-link panel, no data', async () => {
    const { page: p2, ctx } = await L.newPage(browser, vp);
    await p2.goto(`${L.BASE}/foundation/not-a-real-token-000`);
    await p2.waitForSelector('text=ISN\'T ACTIVE', { timeout: 60000 });
    await shot(p2, '00-invalid-link');
    await ctx.close();
  });

  {
    // Requests the sandbox proxy refuses (third-party hosts) are environment noise, not app errors; list them.
    const external = failed.filter((f) => !/\/\/(127\.0\.0\.1|localhost)[:/]/.test(f));
    const appErrors = errors.filter((e) => !/ERR_TUNNEL_CONNECTION_FAILED|ERR_PROXY|ERR_CERT/.test(e));
    const appFailed = failed.filter((f) => /\/\/(127\.0\.0\.1|localhost)[:/]/.test(f) && !/ERR_ABORTED/.test(f));
    record(
      'Q31',
      'No app console errors or failed app requests on the main flow',
      appErrors.length === 0 && appFailed.length === 0,
      `${[...appErrors, ...appFailed].slice(0, 3).join(' | ')}${external.length ? ` · proxy-blocked external: ${[...new Set(external.map((f) => f.replace(/^\S+ /, '').replace(/^(https?:\/\/[^/]+).*/, '$1')))].join(', ')}` : ''}`,
    );
  }

  fs.writeFileSync(path.join(OUT, `results-${vp}.json`), JSON.stringify({ vp, results }, null, 2));
  const failedCount = results.filter((r) => !r.pass).length;
  console.log(`\n${results.length - failedCount}/${results.length} passed`);
  await browser.close();
  process.exit(failedCount ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
