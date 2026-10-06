#!/usr/bin/env node
/**
 * P0.SITE00.PRODUCTION-WORKSPACE.PROJECT-ISOLATION-LOGIC-RECONCILIATION-PANEL-INTELLIGENCE1 — live isolation QA.
 *
 * For every viewport (393×852 · 834×1194 · 1440×900) × project × root tab it opens the scoped tab URL and records:
 *   leak        NDXBOOK strings (NDXBOOK / ENTRY 002 / SUBJECT WOMAN / NDX GROTESK) inside a non-NDX project's frame
 *   scope       every data-project attribute in the body equals the active project
 *   state       which surface rendered (graph projection / NDX body / NOT_ESTABLISHED empty state)
 *   counts      host ITEMS NEED YOU = the INBOX NEEDS YOU list it opens
 *   nav         every bottom / host nav link carries the active project
 *   overflow    document / scroll-pane horizontal overflow and any body element wider than the viewport
 * plus the route-validity flows (project switch keeps the tab, refresh, back / forward, direct URL without project,
 * no stored project → picker) and the CASTING overview media (AVAILABLE TALENT / LEAD AUTHORITY) for NDXBOOK.
 *
 *   BASE=http://127.0.0.1:5174 OUT=<dir> [VIEWPORTS=mobile,tablet,desktop] [SHOTS=1] \
 *     node scripts/production-workspace/project-isolation-qa.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5174';
const OUT = process.env.OUT ?? 'project-isolation-qa';
const CHROME = process.env.CHROME ?? '/opt/pw-browsers/chromium';
const SHOTS = process.env.SHOTS === '1';
const VIEWPORTS = {
  mobile: { width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  tablet: { width: 834, height: 1194, deviceScaleFactor: 1, isMobile: false, hasTouch: true },
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
};
const FAMILIES = (process.env.VIEWPORTS ?? 'mobile,tablet,desktop').split(',');
const PROJECTS = (process.env.PROJECTS ?? 'ndxbook,jurnl,all-in-one-enterprises,astral-world,frontal-slayer').split(',');
const TABS = {
  HUB: (p) => `/production?project=${p}`,
  INBOX: (p) => `/production/queue?project=${p}`,
  DESIGN: (p) => `/production/${p}/design`,
  EXPERIENCE: (p) => `/production/${p}/experience`,
  EXPRESSION: (p) => `/production/${p}/expression`,
  LIBRARY: (p) => `/production/libraries?project=${p}`,
  ACTIVITY: (p) => `/production/activity?project=${p}`,
};
const LEAK = /NDXBOOK|ENTRY 002|SUBJECT WOMAN|NDX GROTESK|OH, NOW IT WAS FUN/;

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const rows = [];
const flows = [];

async function nav(page, path) {
  await page.evaluate((p) => {
    window.history.pushState({}, '', p);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}
async function settle(page) {
  await page.waitForFunction(() => !!document.querySelector('[data-testid="production-authority-frame"] .pxa-body > *'), null, { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(1100);
}
async function open(page, path) {
  await page.goto(BASE + path, { waitUntil: 'load' });
  await settle(page);
  return page.evaluate(() => location.pathname + location.search);
}

function inspect() {
  const frame = document.querySelector('[data-testid="production-authority-frame"]');
  const body = frame?.querySelector('.pxa-body');
  const scroll = frame?.querySelector('.pxa-scroll');
  const vw = window.innerWidth;
  const text = (body?.innerText ?? '') + '\n' + (frame?.querySelector('[data-testid="production-chrome-project"]')?.textContent ?? '');
  const projects = [...(body?.querySelectorAll('[data-project]') ?? [])].map((e) => e.getAttribute('data-project'));
  const wide = [...(body?.querySelectorAll('*') ?? [])]
    .filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.right > vw + 1 && getComputedStyle(e).position !== 'fixed';
    })
    .slice(0, 5)
    .map((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]} ${Math.round(e.getBoundingClientRect().right)}`);
  const surface =
    body?.querySelector('[data-state="NOT_ESTABLISHED"]') ? `EMPTY:${body.querySelector('[data-state="NOT_ESTABLISHED"]').getAttribute('data-domain')}`
    : body?.querySelector('[data-testid="production-project-select"]') ? 'PROJECT_SELECT'
    : body?.querySelector('.pgx') ? `GRAPH:${body.querySelector('.pgx').getAttribute('data-testid')}`
    : body?.firstElementChild ? `BODY:${body.firstElementChild.getAttribute('data-testid') ?? body.firstElementChild.className}`
    : 'NONE';
  const attention = document.querySelector('[data-testid="production-attention-count"]')?.getAttribute('data-count') ?? null;
  // host chrome + bottom nav + sub-bar links (everything outside the scrolling body) must carry the project
  const navLinks = [...(frame?.querySelectorAll('a[href^="/production"]') ?? [])].filter((a) => !a.closest('.pxa-scroll')).map((a) => a.getAttribute('href'));
  const imgs = [...(body?.querySelectorAll('img') ?? [])];
  return {
    path: location.pathname + location.search,
    frame: !!frame,
    screen: frame?.getAttribute('data-screen') ?? null,
    surface,
    leakText: text,
    projects,
    docOverflow: document.scrollingElement.scrollWidth - vw,
    paneOverflow: scroll ? scroll.scrollWidth - scroll.clientWidth : 0,
    wide,
    attention,
    inboxList: body?.querySelector('[data-testid="project-inbox-list"]')?.getAttribute('data-count') ?? null,
    navLinks,
    imgs: imgs.length,
    imgsUntagged: imgs.filter((i) => !i.getAttribute('data-media-role')).length,
  };
}

for (const vpName of FAMILIES) {
  const vp = VIEWPORTS[vpName];
  mkdirSync(`${OUT}/${vpName}`, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem('site00-immersive-complete', '1');
    } catch {
      /* ignore */
    }
  });
  const page = await ctx.newPage();
  let errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  await page.goto(BASE + TABS.HUB(PROJECTS[0]), { waitUntil: 'load' });
  await settle(page);

  for (const project of PROJECTS) {
    for (const [tab, url] of Object.entries(TABS)) {
      errors = [];
      await nav(page, '/production/activity?project=' + project + '&__hop=1');
      await page.waitForTimeout(200);
      await nav(page, url(project));
      await settle(page);
      const d = await page.evaluate(inspect);
      const leak = project === 'ndxbook' ? null : (LEAK.exec(d.leakText)?.[0] ?? null);
      const foreign = d.projects.filter((p) => p !== project);
      const navUnscoped = d.navLinks.filter((h) => !h.includes(`project=${project}`) && !h.includes(`/production/${project}/`));
      const row = {
        viewport: vpName,
        project,
        tab,
        path: d.path,
        frame: d.frame,
        screen: d.screen,
        surface: d.surface,
        leak,
        foreignProjects: [...new Set(foreign)],
        attention: d.attention,
        inboxList: d.inboxList,
        navLinks: d.navLinks.length,
        navUnscoped,
        docOverflow: d.docOverflow,
        paneOverflow: d.paneOverflow,
        wide: d.wide,
        imgs: d.imgs,
        imgsUntagged: d.imgsUntagged,
        errors: [...errors],
      };
      row.pass = row.frame && !row.leak && !row.foreignProjects.length && !row.navUnscoped.length && row.docOverflow <= 1 && row.paneOverflow <= 1 && !row.wide.length && !row.errors.length;
      rows.push(row);
      if (SHOTS) await page.screenshot({ path: `${OUT}/${vpName}/${project}--${tab.toLowerCase()}.png` });
      console.log(`${vpName.padEnd(7)} ${project.padEnd(24)} ${tab.padEnd(10)} ${row.pass ? 'PASS' : 'FAIL'} ${row.surface}${row.leak ? ` LEAK:${row.leak}` : ''}${row.wide.length ? ` WIDE:${row.wide[0]}` : ''}${row.errors.length ? ` ERR:${row.errors[0]}` : ''}`);
    }
  }

  /* ── route validity flows (once per viewport) ── */
  const flow = async (name, fn) => {
    try {
      const res = await fn();
      flows.push({ viewport: vpName, name, ...res });
      console.log(`${vpName.padEnd(7)} FLOW ${name.padEnd(40)} ${res.pass ? 'PASS' : 'FAIL'} ${res.detail ?? ''}`);
    } catch (e) {
      flows.push({ viewport: vpName, name, pass: false, detail: String(e).slice(0, 200) });
      console.log(`${vpName.padEnd(7)} FLOW ${name.padEnd(40)} FAIL ${String(e).slice(0, 120)}`);
    }
  };
  // project switch from the host chip keeps the tab and drops child state
  for (const [tab, url] of Object.entries(TABS)) {
    await flow(`switch ndxbook→jurnl keeps ${tab}`, async () => {
      await open(page, url('ndxbook') + (tab === 'INBOX' ? '&item=attn.narrative' : ''));
      await page.locator('[data-testid="production-chrome-project"]').first().click();
      await page.waitForTimeout(400);
      await page.locator('[data-testid="production-project-menu"] a[href*="jurnl"]').first().click();
      await settle(page);
      const path = await page.evaluate(() => location.pathname + location.search);
      return { pass: path === url('jurnl'), detail: path };
    });
  }
  await flow('cold load of the same URL (new document, same tab) keeps the project', async () => {
    await open(page, TABS.INBOX('jurnl'));
    await open(page, TABS.INBOX('jurnl'));
    const d = await page.evaluate(inspect);
    return { pass: d.path === TABS.INBOX('jurnl') && d.surface.startsWith('GRAPH:project-inbox'), detail: `${d.path} ${d.surface}` };
  });
  // Browser reload replays the cold-start immersive loader (site00LoaderSession: navigation type 'reload'). In the
  // dev server that loader's DOM purge races React's portal unmount (pre-existing on main) — recorded, not hidden.
  await flow('browser reload (immersive loader path) keeps the project', async () => {
    const errs = [];
    const onErr = (e) => errs.push(String(e).slice(0, 120));
    page.on('pageerror', onErr);
    await open(page, TABS.INBOX('jurnl'));
    await page.reload({ waitUntil: 'load' });
    await settle(page);
    page.off('pageerror', onErr);
    const d = await page.evaluate(inspect);
    const loaderRace = errs.some((e) => e.includes('removeChild'));
    return { pass: d.path === TABS.INBOX('jurnl') && d.surface.startsWith('GRAPH:project-inbox'), preexisting: loaderRace ? 'IMMERSIVE_LOADER_REMOVECHILD_RACE (also on main)' : null, detail: `${d.path} ${d.surface}${loaderRace ? ' · loader removeChild race' : ''}` };
  });
  await flow('back / forward restore the project', async () => {
    await open(page, TABS.LIBRARY('jurnl'));
    await nav(page, TABS.LIBRARY('all-in-one-enterprises'));
    await settle(page);
    await page.goBack();
    await settle(page);
    const back = await page.evaluate(() => location.search);
    const backSurface = (await page.evaluate(inspect)).projects;
    await page.goForward();
    await settle(page);
    const fwd = await page.evaluate(() => location.search);
    return { pass: back.includes('project=jurnl') && backSurface.every((p) => p === 'jurnl') && fwd.includes('project=all-in-one-enterprises'), detail: `${back} → ${fwd}` };
  });
  await flow('direct URL without project → this tab’s project', async () => {
    await open(page, TABS.HUB('astral-world'));
    const path = await open(page, '/production/activity');
    return { pass: path === '/production/activity?project=astral-world', detail: path };
  });
  await flow('unscoped NDXBOOK lens link stays on NDXBOOK', async () => {
    await open(page, TABS.INBOX('ndxbook'));
    await page.locator('a[href="/production/queue?view=watching"]').first().click({ timeout: 8000 });
    await settle(page);
    const url = await page.evaluate(() => ({ path: location.pathname, project: new URLSearchParams(location.search).get('project'), view: new URLSearchParams(location.search).get('view') }));
    return { pass: url.path === '/production/queue' && url.project === 'ndxbook' && url.view === 'watching', detail: JSON.stringify(url) };
  });
  await flow('/production/<p> → that project’s HUB', async () => {
    const path = await open(page, '/production/jurnl');
    return { pass: path === '/production?project=jurnl', detail: path };
  });
  await flow('NDXBOOK reconstruction workspace never opens under JURNL', async () => {
    const path = await open(page, '/production/jurnl/design/workspace');
    return { pass: path === '/production/jurnl/design', detail: path };
  });
  await flow('a mode JURNL lacks never shows another chamber (AIO ?mode=brand → overview)', async () => {
    await open(page, '/production/all-in-one-enterprises/design?mode=brand');
    const d = await page.evaluate(inspect);
    return { pass: d.surface === 'GRAPH:project-design' && !LEAK.test(d.leakText), detail: d.surface };
  });
  await flow('CASTING overview media (NDXBOOK): available talent + lead authority declared + contained', async () => {
    await open(page, '/production/ndxbook/expression/casting');
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => {
      const pick = (id) =>
        [...document.querySelectorAll(`[data-testid="${id}"] [data-media-role]`)].map((e) => {
          const cs = getComputedStyle(e);
          return { tag: e.tagName.toLowerCase(), role: e.getAttribute('data-media-role'), fit: e.tagName === 'IMG' ? cs.objectFit : cs.backgroundSize, loaded: e.tagName === 'IMG' ? e.complete && e.naturalWidth > 0 : null };
        });
      return { talent: pick('casting-available-talent'), lead: pick('casting-lead-authority'), onPage: !!document.querySelector('[data-testid="casting-available-talent"]') };
    });
    const all = [...m.talent, ...m.lead];
    const pass = !m.onPage || (all.length > 0 && all.every((x) => x.role) && m.lead.every((x) => !/cover/.test(x.fit)));
    return { pass, detail: JSON.stringify({ onPage: m.onPage, talent: m.talent.length, talentRoles: [...new Set(m.talent.map((x) => x.role))], lead: m.lead }) };
  });
  await ctx.close();
}

/* ── no stored project → picker (fresh context) ── */
{
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/production/queue', { waitUntil: 'load' });
  await settle(page);
  const d = await page.evaluate(inspect);
  flows.push({ viewport: 'mobile', name: 'no project chosen → picker (never a default project)', pass: d.surface === 'PROJECT_SELECT', detail: `${d.path} ${d.surface}` });
  console.log(`mobile  FLOW no project chosen → picker ${d.surface === 'PROJECT_SELECT' ? 'PASS' : 'FAIL'} ${d.surface}`);
  await ctx.close();
}

await browser.close();
const summary = {
  sprint: 'P0.SITE00.PRODUCTION-WORKSPACE.PROJECT-ISOLATION-LOGIC-RECONCILIATION-PANEL-INTELLIGENCE1',
  routes: rows.length,
  pass: rows.filter((r) => r.pass).length,
  leaks: rows.filter((r) => r.leak).length,
  foreign: rows.filter((r) => r.foreignProjects.length).length,
  overflow: rows.filter((r) => r.docOverflow > 1 || r.paneOverflow > 1 || r.wide.length).length,
  errors: rows.filter((r) => r.errors.length).length,
  flows: flows.length,
  flowsPass: flows.filter((f) => f.pass).length,
  flowsPreexisting: flows.filter((f) => !f.pass && f.preexisting).map((f) => `${f.viewport} ${f.name}: ${f.preexisting}`),
};
writeFileSync(`${OUT}/project-isolation-qa.json`, JSON.stringify({ summary, rows: rows.map(({ ...r }) => r), flows }, null, 2));
console.log(JSON.stringify(summary));
