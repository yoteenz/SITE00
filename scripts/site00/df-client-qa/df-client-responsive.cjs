/**
 * Digital Foundation Board 01 + 02 — responsive captures (393×852, tablet 834×1194, desktop 1440×900, and 390×844).
 * Links are prepared through Composer's real handler on the QA harness; the browser only renders them.
 *
 *   VPS=m393,tablet,desktop OUT=docs/site00/idnty/df-client-board-01-02-qa node scripts/site00/df-client-qa/df-client-responsive.cjs
 */
const fs = require('fs');
const path = require('path');
const L = require('./df-qa-lib.cjs');

const OUT = path.resolve(process.env.OUT || 'docs/site00/idnty/df-client-board-01-02-qa');
const VPS = (process.env.VPS || 'm393,tablet,desktop').split(',');
fs.mkdirSync(OUT, { recursive: true });

const LEAD = { business_name: 'Anthony Transport LLC', contact_name: 'Anthony Reyes', contact_email: 'anthony@example.com' };
const DISCLOSURES = [
  'I HAVE REVIEWED MY DIGITAL FOUNDATION SCOPE.',
  'I UNDERSTAND THAT DOMAIN / EMAIL PROVIDER SUBSCRIPTIONS AND OTHER THIRD-PARTY FEES MAY BE SEPARATE.',
  'I UNDERSTAND THAT THE PROJECTED TURNAROUND BEGINS AFTER REQUIRED INFORMATION, ACCESS AND PAYMENT ARE RECEIVED.',
];
const INTAKE = {
  business_name: LEAD.business_name,
  contact_name: LEAD.contact_name,
  current_email: 'anthony@anthonytransport.co',
  phone: '(555) 201-4410',
  industry: 'TRANSPORTATION + LOGISTICS',
  existing_domain: 'anthonytransport.co',
  team_size: 2,
};

async function link(stage) {
  const { token } = await L.qa('create', LEAD);
  if (stage === 'P01') return token;
  await L.api('POST', 'update-intake', { token, intake: INTAKE, needs: ['OWN_DOMAIN', 'NEED_MULTI_MAILBOX', 'NEED_MIGRATION'], markComplete: stage !== 'P02' });
  if (stage === 'P02' || stage === 'P04') return token;
  await L.api('POST', 'accept-quote', { token, disclosures: DISCLOSURES });
  await L.qa('founder-ready', { token });
  if (stage === 'P05') return token;
  await L.api('POST', 'start-checkout', { token, origin: 'http://qa' });
  await L.qa('webhook-paid', { token });
  return token;
}

async function capture(browser, vp, name, token, steps = async () => {}) {
  const { page, ctx, errors } = await L.newPage(browser, vp);
  await page.goto(`${L.BASE}/foundation/${token}`);
  await page.waitForSelector('.df-screen[data-view]:not([data-view="SYSTEM"])', { timeout: 90000 });
  await steps(page);
  await page.evaluate(() => document.fonts.ready);
  await L.settle(page, 500);
  await page.screenshot({ path: path.join(OUT, `r-${vp}-${name}.png`) });
  await page.screenshot({ path: path.join(OUT, `r-${vp}-${name}-full.png`), fullPage: true });
  // Desktop and tablet scroll inside the artifact (the presentation shell locks the document).
  const scrollH = await page.evaluate(() => {
    const r = document.querySelector('.df-root');
    return r ? Math.max(r.scrollHeight, document.documentElement.scrollHeight) : 0;
  });
  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  await ctx.close();
  return { name, errors: errors.filter((e) => !/ERR_TUNNEL_CONNECTION_FAILED/.test(e)).length, scrollH, overflowX };
}

(async () => {
  const browser = await L.launch();
  const report = [];
  for (const vp of VPS) {
    const t1 = await link('P01');
    report.push({ vp, ...(await capture(browser, vp, 'p01', t1)) });
    const t2 = await link('P02');
    report.push({ vp, ...(await capture(browser, vp, 'p02', t2)) });
    report.push({
      vp,
      ...(await capture(browser, vp, 'p03', t2, async (page) => {
        await page.getByRole('button', { name: /^CONTINUE/ }).click();
        await L.waitView(page, 'P03');
      })),
    });
    const t4 = await link('P04');
    report.push({ vp, ...(await capture(browser, vp, 'p04', t4)) });
    report.push({
      vp,
      ...(await capture(browser, vp, 'p05', t4, async (page) => {
        await page.getByRole('button', { name: /CONTINUE TO REVIEW/ }).click();
        await L.waitView(page, 'P05');
      })),
    });
    const t6 = await link('P06');
    report.push({ vp, ...(await capture(browser, vp, 'p06', t6)) });
    console.log(vp, 'done');
  }
  fs.writeFileSync(path.join(OUT, 'responsive-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
