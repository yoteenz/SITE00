/**
 * Business Growth V1 inside the Foundation link — live browser QA.
 *
 *   SITE00_BUSINESS_GROWTH_INTELLIGENCE_V1=1 SITE00_BUSINESS_AMBITION_INTAKE_V1=1 \
 *     npx tsx scripts/site00/df-client-qa/qa-df-api-server.ts          # memory-store harness on :3110
 *   npx vite --port 5177 --host 127.0.0.1                                # app
 *   BASE=http://127.0.0.1:5177 VP=m390 OUT=docs/site00/business-growth/qa node scripts/site00/df-client-qa/df-growth-flow.cjs
 *
 * Every check compares what the browser shows with the payload Composer's real handler returns.
 */
const fs = require('fs');
const path = require('path');
const L = require('./df-qa-lib.cjs');

const VPN = process.env.VP || 'm390';
const OUT = path.resolve(process.env.OUT || 'docs/site00/business-growth/qa', VPN);
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function record(id, name, pass, detail = '') {
  results.push({ id, name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} [${VPN}] ${id} ${name}${detail ? ` — ${detail}` : ''}`);
}
let current = null;
async function check(id, name, fn) {
  if (process.env.ONLY && !process.env.ONLY.split(',').includes(id[0])) return;
  if (process.env.QA_DEBUG && current) current.setDefaultTimeout(10000);
  try {
    const detail = await fn();
    record(id, name, true, typeof detail === 'string' ? detail : '');
  } catch (e) {
    const msg = String(e && e.message);
    record(id, name, false, msg.split('\n')[0]);
    if (process.env.QA_DEBUG) {
      console.log(msg.split('\n').slice(0, 8).join('\n'));
      if (current) {
        await current.screenshot({ path: path.join(OUT, `FAIL-${id}.png`), fullPage: true }).catch(() => undefined);
        console.log('buttons:', JSON.stringify(await current.getByRole('button').allInnerTexts().catch(() => [])));
      }
    }
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
  return (await L.api('GET', 'payload', { token })).json;
}
async function noOverflow(page) {
  const o = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(o <= 1, `horizontal overflow ${o}px`);
}
const money = (minor) => `$${(minor / 100).toLocaleString('en-US', { minimumFractionDigits: minor % 100 ? 2 : 0 })}`;
const LEAD = { business_name: 'Anthony Transport LLC', contact_name: 'Anthony Reyes', contact_email: 'anthony@example.com' };

async function toP02(page, token) {
  await page.goto(`${L.BASE}/foundation/${token}`);
  await L.waitView(page, 'P01', 90000);
  await page.getByRole('button', { name: /BEGIN MY FOUNDATION/ }).click();
  await L.waitView(page, 'P02');
}

async function p03ToP04(page) {
  await L.waitView(page, 'P03');
  await page.getByRole('button', { name: /VIEW MY RECOMMENDATION/ }).click();
  await page.waitForSelector('text=CHOOSE HOW WE HANDLE YOUR DOMAIN');
  await page.locator('label.df-path', { hasText: 'REGISTER A NEW DOMAIN' }).click();
  await page.getByRole('button', { name: /VIEW MY RECOMMENDATION/ }).click();
  await L.waitView(page, 'P04');
}

/** Fast server-side path to a QUOTE-surface link (founder/test tooling, not the client UI). */
async function quotedLink(lead, referral_kind = 'DIRECT') {
  const { token } = await L.qa('create', { ...lead, referral_kind });
  await L.api('POST', 'update-intake', {
    action: 'update-intake',
    token,
    intake: { business_name: lead.business_name, contact_name: lead.contact_name, current_email: lead.contact_email, team_size: 1 },
    needs: ['NEED_DOMAIN', 'NEED_PRO_EMAIL'],
    markComplete: true,
  });
  return token;
}

(async () => {
  const browser = await L.launch();
  const allErrors = [];

  // ── A. Foundation + Growth: ambition → recommendation → growth path → plan → roadmap → review ─────
  {
    const { token } = await L.qa('create', LEAD);
    const { page, errors, ctx } = await L.newPage(browser, VPN);
    current = page;
    await toP02(page, token);

    await check('A01', 'P02 CONTINUE opens Business Ambition (G1) inside the same link', async () => {
      await page.getByRole('button', { name: /^CONTINUE/ }).click();
      await L.waitView(page, 'AMBITION');
      assert(page.url().endsWith(`/foundation/${token}`), 'same URL');
      const goals = await page.locator('.df-g-goal').count();
      assert(goals === 12, `goal tiles ${goals}`);
      await noOverflow(page);
      await shot(page, 'A01-g1-business-ambition');
      await shot(page, 'A01-g1-business-ambition-full', true);
      return `${goals} canonical goals`;
    });

    await check('A02', 'Multiple goals + adaptive follow-ups, saved to the server', async () => {
      await page.locator('[data-goal="BE_FOUND_ONLINE"]').click();
      await page.locator('[data-goal="FIND_GRANTS_FUNDING"]').click();
      await page.locator('[data-goal="IMPROVE_CREDIBILITY"]').click();
      assert((await page.locator('[data-goal][aria-checked="true"]').count()) === 3, '3 selected');
      await shot(page, 'A02-g1-goals-selected');
      await page.getByRole('button', { name: /^CONTINUE$/ }).click();
      await page.waitForSelector('.df-g-q');
      const qs = await page.locator('.df-g-q').evaluateAll((n) => n.map((x) => x.getAttribute('data-field')));
      assert(qs.length > 0, 'no follow-ups');
      const firstBool = page.locator('.df-g-q').filter({ has: page.locator('.df-g-seg__opt', { hasText: /^YES$/ }) }).first();
      if (await firstBool.count()) await firstBool.locator('.df-g-seg__opt', { hasText: /^YES$/ }).click();
      await noOverflow(page);
      await shot(page, 'A02-g1-adaptive-followups');
      await shot(page, 'A02-g1-adaptive-followups-full', true);
      await page.getByRole('button', { name: /CONTINUE TO MY FOUNDATION/ }).click();
      await L.waitView(page, 'P03');
      const p = await payload(token);
      const amb = p.business_growth.ambition;
      assert(amb.goals.join(',') === 'BE_FOUND_ONLINE,FIND_GRANTS_FUNDING,IMPROVE_CREDIBILITY', `goals ${amb.goals}`);
      assert(amb.completed_at, 'completed_at');
      return `follow-ups: ${qs.join(',')}`;
    });

    let p04;
    await check('A03', 'Foundation recommendation (P04) unchanged + Growth invite; nothing auto-added', async () => {
      await p03ToP04(page);
      const p = await payload(token);
      p04 = p;
      assert(p.quote.base_price_minor === 50000, `base ${p.quote.base_price_minor}`);
      assert(p.business_growth.selection.selected.length === 0, 'no auto-add');
      assert(p.business_growth.unified_quote.growth_lines.length === 0, 'no growth lines');
      await page.waitForSelector('[data-card="growth-invite"]');
      await shot(page, 'A03-p04-recommendation-with-growth-invite', true);
      return `quote ${money(p.quote.subtotal_minor)} · recs ${p.business_growth.recommendations.map((r) => r.service_id).join(',')}`;
    });

    await check('A04', 'CONTINUE goes to the Growth Path (G2): readiness, recommendations, draft pricing as status', async () => {
      await page.getByRole('button', { name: /CONTINUE TO REVIEW/ }).click();
      await L.waitView(page, 'GROWTH');
      const dims = await page.locator('[data-dimension]').count();
      assert(dims === 5, `readiness rows ${dims}`);
      const body = await page.locator('.df-screen__main').innerText();
      assert(!/\d+\s*%/.test(body), 'no numeric score');
      assert(/PLANNING RANGE · PRICING PENDING APPROVAL/.test(body), 'draft range labelled');
      assert(/ASSESSMENT PENDING/.test(body), 'opportunity pending card');
      await noOverflow(page);
      await shot(page, 'A04-g2-growth-path');
      await shot(page, 'A04-g2-growth-path-full', true);
      return `${await page.locator('.df-g-svc').count()} service cards`;
    });

    await check('A05', 'Explicit selection of one service: plan + full-project date update; Foundation ready unchanged', async () => {
      const before = await payload(token);
      await page.locator('[data-service="BGI.VISIBILITY_AUDIT"] .df-g-add').first().click();
      await page.waitForFunction(() => /PLAN SAVED/.test(document.querySelector('.df-g-plan__status')?.textContent || ''), null, { timeout: 15000 });
      const after = await payload(token);
      assert(after.business_growth.selection.selected.map((s) => s.service_id).join(',') === 'BGI.VISIBILITY_AUDIT', 'server selection');
      assert(after.business_growth.delivery.foundation_ready_max_days === before.business_growth.delivery.foundation_ready_max_days, 'foundation ready moved');
      assert(after.business_growth.delivery.full_project_max_days > before.business_growth.delivery.foundation_ready_max_days, 'full project not extended');
      assert(after.quote.subtotal_minor === before.quote.subtotal_minor, 'foundation quote changed');
      const plan = await page.locator('.df-g-plan').first().innerText();
      assert(/PENDING APPROVAL/.test(plan), 'plan shows pending approval');
      await shot(page, 'A05-g2-one-service-selected');
      return `full ${after.business_growth.unified_quote.full_project_display}`;
    });

    await check('A06', 'Service inspection sheet: includes, excludes, dependencies, not payable today', async () => {
      await page.locator('[data-service="BGI.OPPORTUNITY_READINESS"]').first().getByRole('button', { name: /WHAT'S INCLUDED/ }).click();
      await page.waitForSelector('.df-sheet__panel');
      const t = await page.locator('.df-sheet__panel').innerText();
      assert(/WHAT IT INCLUDES/.test(t) && /WHAT IT DOES NOT INCLUDE/.test(t), 'sections');
      assert(/NOT PAYABLE TODAY/.test(t), 'not payable copy');
      await shot(page, 'A06-g2-service-sheet');
      await page.getByRole('button', { name: 'CLOSE', exact: true }).click();
    });

    await check('A07', 'Multiple services + explore all families (SALES SYSTEMS empty, package hidden)', async () => {
      await page.locator('[data-service="BGI.OPPORTUNITY_READINESS"] .df-g-add').first().click();
      await page.waitForFunction(() => /PLAN SAVED/.test(document.querySelector('.df-g-plan__status')?.textContent || ''), null, { timeout: 15000 });
      await page.getByRole('button', { name: /VIEW 5 SERVICE FAMILIES/ }).click();
      await page.waitForSelector('#df-g-families');
      const sales = await page.locator('[data-family="SALES_SYSTEMS"]').innerText();
      assert(/OFFERED YET/.test(sales), `sales copy: ${sales.slice(0, 80)}`);
      assert((await page.locator('[data-service="BGI.BUSINESS_GROWTH_PACKAGE"]').count()) === 0, 'hidden package visible');
      const fut = page.locator('[data-service="BGI.GROWTH_OPERATIONS"] .df-g-add--na');
      assert((await fut.count()) >= 1, 'future service not marked unavailable');
      const p = await payload(token);
      assert(p.business_growth.selection.selected.length === 2, 'two selected');
      await shot(page, 'A07-g2-multiple-services-families', true);
      return p.business_growth.selection.selected.map((s) => s.service_id).join(',');
    });

    await check('A08', 'Investment + Delivery (G3): only Foundation in checkout; two distinct milestones', async () => {
      await page.getByRole('button', { name: /REVIEW INVESTMENT \+ DELIVERY/ }).first().click();
      await L.waitView(page, 'PLAN');
      const p = await payload(token);
      const total = (await page.locator('.df-g-plan__total').innerText()).trim();
      assert(total === money(p.quote.subtotal_minor), `total ${total} vs ${money(p.quote.subtotal_minor)}`);
      const inCheckout = await page.locator('.df-g-ledger__row--checkout').evaluateAll((n) => n.map((x) => x.getAttribute('data-section')));
      assert(inCheckout.join(',') === 'BASE,ADDONS', `in checkout ${inCheckout}`);
      const ms = await page.locator('.df-g-milestone__value').allInnerTexts();
      assert(ms.length === 2 && ms[0] !== ms[1], `milestones ${ms}`);
      assert(/BUSINESS DAY/.test(ms[0]) && !/WEEK/.test(ms[0]), `foundation window ${ms[0]}`);
      await noOverflow(page);
      await shot(page, 'A08-g3-investment-delivery');
      await shot(page, 'A08-g3-investment-delivery-full', true);
      return `total ${total} · ready ${ms[0]} · full ${ms[1]}`;
    });

    await check('A09', 'Growth Roadmap (G4) from the plan', async () => {
      await page.getByRole('button', { name: /VIEW MY GROWTH ROADMAP/ }).click();
      await L.waitView(page, 'ROADMAP');
      const t = await page.locator('.df-screen__main').innerText();
      assert(/ROADMAP V\d/.test(t), 'version line');
      assert(/AWAITING SCOPE \+ PRICING APPROVAL/.test(t), 'selected services pending');
      await noOverflow(page);
      await shot(page, 'A09-g4-roadmap');
      await shot(page, 'A09-g4-roadmap-full', true);
      await page.getByRole('button', { name: /BACK TO INVESTMENT/ }).click();
      await L.waitView(page, 'PLAN');
    });

    await check('A10', 'Review (P05) keeps the Foundation checkout and states Growth is not charged', async () => {
      await page.getByRole('button', { name: /CONTINUE TO REVIEW/ }).first().click();
      await L.waitView(page, 'P05');
      const t = await page.locator('.df-screen__main').innerText();
      assert(/GROWTH SERVICES ARE NOT PART OF THIS CHECKOUT/.test(t), 'growth checkout note');
      await shot(page, 'A10-p05-review-growth-note', true);
    });

    await check('A11', 'Returning client: a fresh visit restores goals + selections from the server', async () => {
      const p2 = await ctx.newPage();
      await p2.goto(`${L.BASE}/foundation/${token}`);
      await L.waitView(p2, 'P04', 60000);
      const invite = await p2.locator('[data-card="growth-invite"]').innerText();
      assert(/2 IN YOUR PLAN/.test(invite), `invite ${invite}`);
      await p2.locator('[data-card="growth-invite"]').click();
      await L.waitView(p2, 'GROWTH');
      const on = await p2.locator('.df-g-add--on').count();
      assert(on >= 2, `selected cards ${on}`);
      await shot(p2, 'A11-returning-client-growth-path');
      await p2.close();
      return invite.replace(/\s+/g, ' ');
    });

    await check('A12', 'Portal continuity after the real webhook: overview Growth panel + roadmap lifecycle', async () => {
      await L.qa('founder-ready', { token });
      const disclosures = await page.locator('.df-ack__text').allInnerTexts();
      const acc = await L.api('POST', 'accept-quote', { action: 'accept-quote', token, disclosures });
      assert(acc.status === 200, `accept ${acc.status} ${JSON.stringify(acc.json).slice(0, 120)}`);
      await L.qa('webhook-paid', { token });
      const p3 = await ctx.newPage();
      await p3.goto(`${L.BASE}/foundation/${token}`);
      await L.waitView(p3, 'P06', 60000);
      await p3.getByRole('button', { name: /OVERVIEW/ }).first().click();
      await L.waitView(p3, 'OVERVIEW');
      await p3.waitForSelector('[data-card="growth-portal"]');
      await shot(p3, 'A12-portal-overview-growth', true);
      await p3.locator('[data-card="growth-portal"]').getByRole('button', { name: /VIEW MY GROWTH ROADMAP/ }).click();
      await L.waitView(p3, 'ROADMAP');
      const life = await p3.locator('[data-lifecycle="foundation"]').innerText();
      assert(/IN PROGRESS/.test(life), `foundation lifecycle ${life}`);
      await shot(p3, 'A12-portal-roadmap', true);
      const after = await payload(token);
      assert(after.business_growth.selection.ambition_editable === false, 'ambition locked after payment');
      await p3.close();
      return life.replace(/\s+/g, ' ');
    });
    allErrors.push(...errors);
    await ctx.close();
  }

  // ── B. Foundation only: skip ambition, original journey ─────────────────────────────────────
  {
    const { token } = await L.qa('create', LEAD);
    const { page, errors, ctx } = await L.newPage(browser, VPN);
    await toP02(page, token);
    await check('B01', 'Skip ambition → P03 → P04 → P05 with no Growth lines', async () => {
      await page.getByRole('button', { name: /^CONTINUE/ }).click();
      await L.waitView(page, 'AMBITION');
      await page.getByRole('button', { name: /SKIP FOR NOW/ }).click();
      await p03ToP04(page);
      await shot(page, 'B01-foundation-only-p04', true);
      await page.getByRole('button', { name: /CONTINUE TO REVIEW/ }).click();
      await L.waitView(page, 'P05');
      const p = await payload(token);
      assert(p.business_growth.ambition.skipped === true, 'skipped recorded');
      assert(p.business_growth.selection.selected.length === 0, 'no selections');
      assert((await page.locator('.df-screen__main').innerText()).indexOf('GROWTH SERVICES ARE NOT PART') === -1, 'no growth note');
      await shot(page, 'B01-foundation-only-p05', true);
      return `quote ${money(p.quote.subtotal_minor)}`;
    });
    allErrors.push(...errors);
    await ctx.close();
  }

  // ── C. AIO-attributed client + BLDR handoff ─────────────────────────────────────────────────
  {
    const token = await quotedLink({ ...LEAD, business_name: 'Reyes Freight Co' }, 'AIO');
    await L.api('POST', 'update-growth', {
      action: 'update-growth',
      token,
      ambition: { goals: ['BUILD_WEBSITE', 'PURSUE_GOVERNMENT_CONTRACTS'], complete: true },
    });
    const { page, errors, ctx } = await L.newPage(browser, VPN);
    await check('C01', 'AIO client: partner card states separate company/billing; same SITE 00 base', async () => {
      await page.goto(`${L.BASE}/foundation/${token}`);
      await L.waitView(page, 'P04', 60000);
      await page.locator('[data-card="growth-invite"]').click();
      await L.waitView(page, 'GROWTH');
      const aio = await page.locator('[data-card="aio"]').innerText();
      assert(/SEPARATE COMPANY WITH SEPARATE BILLING/.test(aio), 'boundary copy');
      assert(/SHARES NOTHING ABOUT YOUR BUSINESS WITH AIO WITHOUT YOUR PERMISSION/.test(aio), 'data-sharing boundary');
      const p = await payload(token);
      assert(p.quote.base_price_minor === 50000, 'base unchanged');
      assert(!JSON.stringify(p.business_growth.unified_quote).includes('AIO'), 'no AIO charge line');
      await page.locator('[data-card="aio"]').scrollIntoViewIfNeeded();
      await shot(page, 'C01-aio-attributed-growth-path');
      return `referrals ${p.business_growth.aio.referrals.length}`;
    });
    await check('C02', 'BLDR handoff: month-scale, estimator-governed; interest recorded server-side', async () => {
      const card = page.locator('[data-card="bldr"]');
      await card.scrollIntoViewIfNeeded();
      const t = await card.innerText();
      assert(/BLDR ESTIMATOR/.test(t) && /MONTHS/.test(t), 'estimator + months copy');
      assert((await card.locator('a[href="/bldr"]').count()) === 1, 'link to /bldr');
      await card.getByRole('button', { name: /I'M INTERESTED IN BLDR/ }).click();
      await page.waitForSelector('[data-card="bldr"] .df-g-bridge__done');
      const p = await payload(token);
      assert(p.business_growth.bldr.interest_recorded === true, 'interest not recorded');
      await shot(page, 'C02-bldr-handoff');
    });
    allErrors.push(...errors);
    await ctx.close();
  }

  // ── D. Error honesty: a failed selection save is reverted and reported ──────────────────────
  {
    const token = await quotedLink(LEAD);
    await L.api('POST', 'update-growth', { action: 'update-growth', token, ambition: { goals: ['BE_FOUND_ONLINE'], complete: true } });
    const { page, errors, ctx } = await L.newPage(browser, VPN, { failActions: ['update-growth'] });
    await check('D01', 'Network failure on selection: NOT SAVED shown, selection reverted', async () => {
      await page.goto(`${L.BASE}/foundation/${token}`);
      await L.waitView(page, 'P04', 60000);
      await page.locator('[data-card="growth-invite"]').click();
      await L.waitView(page, 'GROWTH');
      await page.locator('[data-service="BGI.VISIBILITY_AUDIT"] .df-g-add').first().click();
      await page.waitForSelector('text=YOUR CHANGE WAS NOT SAVED', { timeout: 15000 });
      const on = await page.locator('[data-service="BGI.VISIBILITY_AUDIT"] .df-g-add--on').count();
      assert(on === 0, 'not reverted');
      const p = await payload(token);
      assert(p.business_growth.selection.selected.length === 0, 'server has no selection');
      await shot(page, 'D01-selection-save-error');
    });
    allErrors.push(...errors.filter((e) => !/Failed to load resource|ERR_CONNECTION_REFUSED/.test(e)));
    await ctx.close();
  }

  await check('Z01', 'No console errors across scenarios', async () => {
    // Vite's dev HMR socket targets the preview tunnel host; it is dev-server noise, not app output.
    const app = allErrors.filter((e) => !/WebSocket connection to .* failed|\[vite\]/.test(e));
    assert(app.length === 0, app.slice(0, 3).join(' | '));
  });

  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
  const failed = results.filter((r) => !r.pass);
  console.log(`\n[${VPN}] ${results.length - failed.length}/${results.length} passed`);
  await browser.close();
  process.exit(failed.length ? 1 : 0);
})();
