/**
 * Phase 2 board captures. Real React on a local dev server (in-memory preview API — never production):
 *   1. client token routes `/foundation/:token` minted from preview fixtures, navigated through the real menu;
 *   2. founder admin routes `/admin/site00/foundation/...` (preview admin bypass on localhost only);
 *   3. `/foundation/review` gallery entries and registry navigation.
 * Widths 320 / 390 / 834 / 1440 / 1920; 320 also records horizontal overflow.
 * Run: DF_BASE=http://127.0.0.1:5180 node scripts/df-phase2-capture.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.env.DF_BASE ?? 'http://127.0.0.1:5180';
const out = process.env.DF_OUT ?? '/opt/cursor/artifacts/df-phase2';
const only = process.env.DF_ONLY ? new RegExp(process.env.DF_ONLY) : null;
const WIDTHS = (process.env.DF_WIDTHS ?? '320,390,834,1440,1920').split(',').map(Number);
const GALLERY_WIDTHS = (process.env.DF_GALLERY_WIDTHS ?? '390,1440').split(',').map(Number);
mkdirSync(`${out}/routes`, { recursive: true });
mkdirSync(`${out}/gallery`, { recursive: true });

const api = async (path, init) => {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${path}: ${JSON.stringify(json).slice(0, 300)}`);
  return json;
};
const mint = async (fixture_id) =>
  (await api('/api/dev/site00-digital-foundation-preview-bootstrap', { method: 'POST', body: JSON.stringify({ fixture_id }) })).artifact;

async function advanceFounderTasks(artifactId, count) {
  for (let i = 0; i < count; i++) {
    const view = await api(`/api/admin/site00-foundation?action=runbook&id=${artifactId}`);
    const ready = view.tasks.find((t) => t.status === 'READY' && t.execution_mode !== 'CLIENT_ACTION');
    if (!ready) return null;
    await api('/api/admin/site00-foundation', { method: 'POST', body: JSON.stringify({ action: 'start-task', artifact_id: artifactId, task_id: ready.task_id }) });
    await api('/api/admin/site00-foundation', { method: 'POST', body: JSON.stringify({ action: 'complete-task', artifact_id: artifactId, task_id: ready.task_id }) });
  }
  const view = await api(`/api/admin/site00-foundation?action=runbook&id=${artifactId}`);
  const next = view.tasks.find((t) => t.status === 'READY' && t.execution_mode !== 'CLIENT_ACTION');
  if (next) await api('/api/admin/site00-foundation', { method: 'POST', body: JSON.stringify({ action: 'start-task', artifact_id: artifactId, task_id: next.task_id }) });
  return next?.task_id ?? view.tasks[0]?.task_id;
}

/** Each local API endpoint holds its own memory store; a pipeline read merges the shared preview snapshot. */
const syncAdmin = () => api('/api/admin/site00-foundation?action=pipeline');

const paid = await mint('J_PAYMENT_SUCCESS');
const signature = await mint('J_PAYMENT_SUCCESS');
await syncAdmin();
const complete = await mint('M_COMPLETE_CREDIT');
const queue = await mint('A_BASE');
await syncAdmin();
const focusTask = await advanceFounderTasks(paid.artifact_id, 9);
await api('/api/admin/site00-foundation', {
  method: 'POST',
  body: JSON.stringify({
    action: 'client-action',
    artifact_id: signature.artifact_id,
    action_type: 'APPROVE_SIGNATURE',
    title: 'Professional email signature',
    detail: 'Review and approve the signature SITE 00 prepared for your primary mailbox.',
  }),
});
await api(`/api/site00/digital-foundation-artifact?action=payload&token=${signature.public_token}`);

const openMenu = async (page) => {
  await page.getByRole('button', { name: 'OPEN MENU' }).first().click();
  await page.waitForSelector('.df-drawer[data-state="open"]');
};
const menuPlace = (label) => async (page) => {
  await openMenu(page);
  await page.locator('.df-drawer__place', { hasText: label }).first().click();
};
const menuStep = (label) => async (page) => {
  await openMenu(page);
  await page.locator('.df-drawer__step', { hasText: label }).first().click();
};
const clickRow = (text) => async (page) => {
  await page.locator('.df-brow', { hasText: text }).first().locator('button').first().click();
};
const clickRowId = (id) => async (page) => {
  await page.locator(`[data-row-id="${id}"] button, button[data-row-id="${id}"]`).first().click();
};
const clickTab = (label) => async (page) => {
  await page.getByRole('tab', { name: new RegExp(`^${label}`) }).first().click();
};

const client = (token) => `/foundation/${token}`;
const founder = (path) => `/admin/site00/foundation${path}`;
const routeShots = [
  { name: 'queue-quote-recommendation', path: client(queue.public_token), steps: [] },
  { name: 'queue-06-activation', path: client(paid.public_token), steps: [] },
  { name: 'portal-07-overview-active', path: client(paid.public_token), steps: [menuPlace('PROJECT OVERVIEW')] },
  { name: 'portal-08-roadmap', path: client(paid.public_token), steps: [menuPlace('ROADMAP')] },
  { name: 'portal-10-needs-you-active', path: client(paid.public_token), steps: [menuPlace('NEEDS YOU')] },
  { name: 'board-10-approval', path: client(signature.public_token), steps: [menuPlace('NEEDS YOU')] },
  { name: 'portal-13a-records-active', path: client(paid.public_token), steps: [menuPlace('VIEW MY RECORDS')] },
  { name: 'portal-07-overview-complete', path: client(complete.public_token), steps: [] },
  { name: 'board-11-complete', path: client(complete.public_token), steps: [clickRow('YOUR FOUNDATION IS COMPLETE')] },
  { name: 'board-12-location', path: client(complete.public_token), steps: [menuPlace('VIEW MY DIGITAL LOCATION')] },
  { name: 'board-13a-records', path: client(complete.public_token), steps: [menuPlace('VIEW MY RECORDS')] },
  { name: 'board-13a-record-detail', path: client(complete.public_token), steps: [menuPlace('VIEW MY RECORDS'), clickRowId('record-domain')] },
  { name: 'board-13a-record-history', path: client(complete.public_token), steps: [menuPlace('VIEW MY RECORDS'), clickRowId('record-domain'), clickTab('HISTORY')] },
  { name: 'post-complete-roadmap', path: client(complete.public_token), steps: [menuPlace('ROADMAP')] },
  { name: 'post-complete-needs-you', path: client(complete.public_token), steps: [menuPlace('NEEDS YOU')] },
  { name: 'board-13-pipeline', path: founder('/pipeline'), steps: [] },
  { name: 'board-14-project-command', path: founder(`/${paid.artifact_id}/command`), steps: [] },
  { name: 'board-15-workbench', path: founder(`/${paid.artifact_id}/workbench`), steps: [] },
  { name: 'board-15a-runbook', path: founder(`/${paid.artifact_id}/runbook`), steps: [] },
  { name: 'board-15b-runbook-detail', path: founder(`/${paid.artifact_id}/runbook/tasks`), steps: [] },
  { name: 'board-15c-task-detail', path: founder(`/${paid.artifact_id}/runbook/tasks/${focusTask}`), steps: [] },
];

const galleryShots = [
  'df-r-needs-you-approval',
  'df-r-complete',
  'df-r-location',
  'df-r-RECORDS',
  'df-r-record-domain',
  'df-r-client-portal',
  'df-r-client-portal-complete',
  'df-r-founder-foundation_pipeline',
  'df-r-founder-project_command',
  'df-r-founder-execution_workbench',
  'df-r-founder-runbook_overview',
  'df-r-founder-runbook_detail',
  'df-r-founder-runbook_task_detail',
];

const report = { base, generated_at: new Date().toISOString(), routes: [], gallery: [], overflow: [], errors: [] };
const browser = await chromium.launch();

async function settle(page) {
  await page.waitForFunction(() => !document.querySelector('.df-screen[data-state="LOADING"]') && Boolean(document.querySelector('.df-screen')), null, { timeout: 60_000 }).catch(() => undefined);
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(600);
}

for (const shot of routeShots) {
  if (only && !only.test(shot.name)) continue;
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 844 : 1000 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on('pageerror', (e) => consoleErrors.push(String(e)));
    try {
      await page.goto(`${base}${shot.path}`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
      await page.waitForSelector('.df-screen', { timeout: 120_000 });
      await settle(page);
      for (const step of shot.steps) {
        await step(page);
        await settle(page);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      const file = `${out}/routes/${shot.name}-${w}.png`;
      await page.screenshot({ path: file, fullPage: true });
      const metrics = await page.evaluate(() => ({
        view: document.querySelector('.df-screen')?.getAttribute('data-view') ?? null,
        state: document.querySelector('.df-screen')?.getAttribute('data-state') ?? null,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      report.routes.push({ name: shot.name, width: w, file, ...metrics, pageErrors: consoleErrors });
      if (metrics.scrollWidth > metrics.clientWidth) report.overflow.push({ name: shot.name, width: w, ...metrics });
    } catch (e) {
      report.errors.push({ name: shot.name, width: w, error: String(e).slice(0, 400) });
    }
    await ctx.close();
  }
}

for (const anchor of galleryShots) {
  if (only && !only.test(anchor)) continue;
  for (const w of GALLERY_WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 844 : 1000 } });
    const page = await ctx.newPage();
    try {
      await page.goto(`${base}/foundation/review#${anchor}`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
      const el = page.locator(`[data-review-anchor="${anchor}"]`).first();
      await el.waitFor({ timeout: 120_000 });
      await el.locator('.df-screen').first().waitFor({ timeout: 60_000 });
      await settle(page);
      await el.scrollIntoViewIfNeeded();
      const file = `${out}/gallery/${anchor}-${w}.png`;
      await el.screenshot({ path: file });
      report.gallery.push({ anchor, width: w, file });
    } catch (e) {
      report.errors.push({ name: `gallery:${anchor}`, width: w, error: String(e).slice(0, 400) });
    }
    await ctx.close();
  }
}

if (!only) {
  for (const w of [390, 1440]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 844 : 1000 } });
    const page = await ctx.newPage();
    await page.goto(`${base}/foundation/review#df-r-founder-foundation_pipeline`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    await page.waitForSelector('[data-review-anchor="df-r-founder-foundation_pipeline"] .df-screen', { timeout: 120_000 });
    await settle(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${out}/gallery/review-page-founder-zone-${w}.png` });
    await ctx.close();
  }
}

await browser.close();
writeFileSync(`${out}/capture-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ routes: report.routes.length, gallery: report.gallery.length, overflow: report.overflow, errors: report.errors }, null, 2));
