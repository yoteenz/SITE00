#!/usr/bin/env node
/**
 * P0.VR.DESIGN-PAGE-CONCEPT-PIPELINE-WIRING1 — DESIGN workspace button + confirm (no GENERATE spend).
 */
import { mkdir } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const OUT = '/opt/cursor/artifacts/founder-qa-page-concept-pipeline';
const OVERVIEW_PAGE_ID = 'ndxbook:overview';
const BASE = process.env.QA_BASE_URL ?? 'http://127.0.0.1:5174';
const ROUTE = '/projects/design/ndxbook';

const receipt = {
  ROUTE,
  GENERATE_BUTTON: 'FAIL',
  CONFIRMATION_OVERLAY: 'FAIL',
  TARGET_LABELS: 'FAIL',
  PIPELINE_PHASES: 'FAIL',
  PLAN_COUNTS: 'FAIL',
  CANCEL_NO_GENERATE: 'FAIL',
  MOBILE_VIEWPORT: 'FAIL',
  PROVIDER_GENERATE_CALLS: 0,
  PLAN_API_CALLS: 0,
  BLOCKERS: [],
};

function captureSeedScript(projectId, pageId) {
  const capPrefix = 'site00:design-page-capture:v1:';
  const mobileKey = `${capPrefix}${projectId}:${pageId}:MOBILE`;
  const desktopKey = `${capPrefix}${projectId}:${pageId}:DESKTOP`;
  const record = (captureId, viewport) => ({
    latest: {
      captureId,
      projectId,
      pageId,
      screenId: 'overview',
      viewport,
      route: '/projects/design/ndxbook/overview',
      timestamp: new Date().toISOString(),
      buildVersion: 'qa',
      artifactPath: 'data:image/png;base64,aaaa',
      createdBy: 'qa',
      source: 'LOCAL_FALLBACK',
    },
    history: [],
  });
  return { mobileKey, desktopKey, mobile: record('qa-mobile', 'MOBILE'), desktop: record('qa-desktop', 'DESKTOP') };
}

async function runViewport(page, viewportName) {
  const name = viewportName === 'MOBILE' ? 'mobile' : 'desktop';
  await page.setViewportSize(viewportName === 'MOBILE' ? { width: 390, height: 844 } : { width: 1440, height: 900 });

  await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('[data-testid="twin-opus-direct-screen"]', { timeout: 60000 });
  await page.waitForTimeout(800);

  const pageId = await page.evaluate((fallback) => {
    try {
      const raw = sessionStorage.getItem('site00:design-production:page-target:v2:ndxbook');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.pageId) return parsed.pageId;
      }
    } catch {
      /* use fallback */
    }
    return fallback;
  }, OVERVIEW_PAGE_ID);

  const seed = captureSeedScript('ndxbook', pageId);
  await page.evaluate((payload) => {
    localStorage.setItem(payload.mobileKey, JSON.stringify(payload.mobile));
    localStorage.setItem(payload.desktopKey, JSON.stringify(payload.desktop));
    const detail = { projectId: 'ndxbook', pageId: payload.pageId };
    window.dispatchEvent(new CustomEvent('site00:design-page-capture-updated', { detail: { ...detail, viewport: 'MOBILE' } }));
    window.dispatchEvent(new CustomEvent('site00:design-page-capture-updated', { detail: { ...detail, viewport: 'DESKTOP' } }));
  }, { ...seed, pageId });
  await page.waitForTimeout(600);

  const btn = page.locator('[data-interaction-id="generate-page-concepts"]');
  const btnCount = await btn.count();
  if (btnCount === 0) {
    receipt.BLOCKERS.push(`${name}: generate button missing`);
    return;
  }
  const activePageId = await btn.first().getAttribute('data-active-page-id');
  const readiness = await btn.first().getAttribute('data-page-concept-readiness');
  if (activePageId && activePageId !== pageId) {
    const resync = captureSeedScript('ndxbook', activePageId);
    await page.evaluate((payload) => {
      localStorage.setItem(payload.mobileKey, JSON.stringify(payload.mobile));
      localStorage.setItem(payload.desktopKey, JSON.stringify(payload.desktop));
      const detail = { projectId: 'ndxbook', pageId: payload.pageId };
      window.dispatchEvent(new CustomEvent('site00:design-page-capture-updated', { detail: { ...detail, viewport: 'MOBILE' } }));
      window.dispatchEvent(new CustomEvent('site00:design-page-capture-updated', { detail: { ...detail, viewport: 'DESKTOP' } }));
    }, { ...resync, pageId: activePageId });
    await page.waitForTimeout(600);
  }

  const disabled = await btn.first().isDisabled();
  if (disabled) {
    const reason = await page.locator('[data-testid="generate-page-concepts-blocked-reason"]').textContent().catch(() => '');
    const debug = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter((k) => k.includes('design-page-capture'));
      const header = document.querySelector('.tod-header__page')?.textContent ?? '';
      let targetPageId = null;
      try {
        const raw = sessionStorage.getItem('site00:design-production:page-target:v2:ndxbook');
        targetPageId = raw ? JSON.parse(raw).pageId : null;
      } catch {
        targetPageId = null;
      }
      const mobileKey = keys.find((k) => k.endsWith(':MOBILE'));
      const mobilePath = mobileKey ? JSON.parse(localStorage.getItem(mobileKey) || '{}').latest?.artifactPath : null;
      return { keys, header, targetPageId, mobilePath };
    });
    receipt.BLOCKERS.push(
      `${name}: button disabled — ${reason} · activePageId=${activePageId} · readiness=${readiness} · mobilePath=${debug.mobilePath ?? 'null'}`,
    );
    return;
  }
  receipt.GENERATE_BUTTON = 'PASS';

  await btn.first().click({ force: true });
  await page.waitForTimeout(2000);

  const overlay = page.locator('[data-testid="page-concept-generation-overlay"]');
  if ((await overlay.count()) === 0) {
    const tick = await page.evaluate(() => window.__site00PageConceptConfirmTick ?? null);
    const blockedMsg = await page.locator('[data-testid="page-concept-generation-blocked"]').textContent().catch(() => '');
    await page.screenshot({ path: `${OUT}/after-click-${name}.png`, fullPage: true });
    receipt.BLOCKERS.push(`${name}: overlay missing after click · confirmTick=${tick} · blockedPanel=${blockedMsg}`);
    return;
  }
  receipt.CONFIRMATION_OVERLAY = 'PASS';

  const text = await overlay.innerText();
  if (text.includes('NDXBOOK') && text.includes('OVERVIEW')) receipt.TARGET_LABELS = 'PASS';
  if (text.includes('CGPT') && text.includes('GPT2') && text.includes('NBP')) receipt.PIPELINE_PHASES = 'PASS';
  if (text.includes('1 source concept') && text.includes('3 renditions')) receipt.PLAN_COUNTS = 'PASS';

  const cancel = overlay.locator('button', { hasText: 'CANCEL' });
  await cancel.first().click();
  await page.waitForTimeout(400);
  if ((await overlay.count()) === 0) receipt.CANCEL_NO_GENERATE = 'PASS';

  if (viewportName === 'MOBILE') receipt.MOBILE_VIEWPORT = 'PASS';
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let generateCalls = 0;
  let planCalls = 0;
  await page.route('**/api/site00/page-concept-generation**', async (route) => {
    const body = route.request().postDataJSON?.() ?? {};
    if (body.action === 'plan') {
      planCalls += 1;
      const plan = {
        targetType: 'PAGE',
        projectId: body.state.projectId,
        pageId: body.state.pageId,
        projectLabel: 'NDXBOOK',
        pageLabel: 'OVERVIEW',
        cgptCalls: 1,
        gpt2Calls: 1,
        nbpRenditions: 3,
        nbpJobs: 6,
        outputCount: 6,
        captureSetId: 'qa-cap',
        functionContractId: 'pfc-ndxbook-ndxbook:overview',
        estimatedCostNote: 'QA mock plan — confirm before spend.',
      };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, plan }) });
      return;
    }
    if (body.action === 'generate') {
      generateCalls += 1;
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'QA_BLOCKED' }) });
      return;
    }
    await route.continue();
  });

  try {
    await runViewport(page, 'DESKTOP');
    await runViewport(page, 'MOBILE');
  } catch (e) {
    receipt.BLOCKERS.push(e instanceof Error ? e.message : String(e));
  }

  receipt.PLAN_API_CALLS = planCalls;
  receipt.PROVIDER_GENERATE_CALLS = generateCalls;

  writeFileSync(`${OUT}/receipt.json`, JSON.stringify(receipt, null, 2));
  await page.screenshot({ path: `${OUT}/design-page-concept-confirm-desktop.png`, fullPage: true });
  await browser.close();
  console.log(JSON.stringify(receipt, null, 2));
  if (receipt.BLOCKERS.length) process.exitCode = 1;
}

main();
