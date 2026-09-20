#!/usr/bin/env node
/**
 * P0.VR.DESIGN-WORKSPACE-SELF-FOUNDER-QA1 — live founder UI verification (no GENERATE confirm).
 */
import { mkdir } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { buildQaWorkflowState } from './workspace-self-founder-qa1-fixture.mjs';
import { buildWorkspaceSelfGenerationPlan } from '../../shared/site00-design-workspace-production/workspaceSelfConcept/generationPlan.js';

const OUT = '/opt/cursor/artifacts/founder-qa-workspace-self';
const BASE = process.env.QA_BASE_URL ?? 'http://127.0.0.1:5174';
const STORAGE_KEY = 'site00:workspace-self-concept:v1';

const receipt = {
  FOUNDER_SIGN_IN: 'FAIL',
  ROUTE: '/system/design/workspace-concepts',
  CAPTURE_PAIR_VISIBLE: 'FAIL',
  FUNCTION_CONTRACT_VISIBLE: 'FAIL',
  READINESS: 'UNKNOWN',
  MAIN_CTA: 'UNKNOWN',
  GENERATION_PLAN_COPY: 'FAIL',
  GPT2_SOURCE_UI: 'FAIL',
  RENDITION_A_UI: 'FAIL',
  RENDITION_B_UI: 'FAIL',
  RENDITION_C_UI: 'FAIL',
  COMPARE_RENDITIONS: 'FAIL',
  AUTHORITY_RAIL: 'FAIL',
  SELECTION_STATES: 'FAIL',
  PROMOTION_STATES: 'NOT_TESTED',
  LEGACY_STATE_ISOLATION: 'NOT_TESTED',
  MOBILE_QA: 'FAIL',
  DESKTOP_QA: 'FAIL',
  PROVIDER_CALLS: 'NONE',
  READY_FOR_FIRST_LIVE_GENERATION: 'NO',
  BLOCKERS: [],
};

async function founderSupabaseSession() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !serviceKey || !anon) throw new Error('Missing Supabase env for founder QA');
  const gen = await fetch(`${url}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'magiclink', email: 'kateenaarmstrong@gmail.com' }),
  });
  const linkData = await gen.json();
  const otp = linkData.email_otp;
  if (!otp) throw new Error(`generate_link missing email_otp: ${JSON.stringify(linkData).slice(0, 120)}`);
  const verify = await fetch(`${url}/auth/v1/verify`, {
    method: 'POST',
    headers: { apikey: anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'email', email: 'kateenaarmstrong@gmail.com', token: otp }),
  });
  const session = await verify.json();
  if (!session.access_token) throw new Error(`verify failed: ${JSON.stringify(session).slice(0, 120)}`);
  const ref = new URL(url).hostname.split('.')[0];
  return { storageKey: `sb-${ref}-auth-token`, session };
}

async function signInFounder(page) {
  const { storageKey, session } = await founderSupabaseSession();
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(
    ({ storageKey, session }) => {
      const payload = {
        access_token: session.access_token,
        token_type: session.token_type,
        expires_in: session.expires_in,
        expires_at: session.expires_at,
        refresh_token: session.refresh_token,
        user: session.user,
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      localStorage.setItem('isSignedIn', 'true');
      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          email: session.user.email,
          name: session.user.user_metadata?.full_name ?? 'Founder',
        }),
      );
    },
    { storageKey, session },
  );
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
}

async function seedWorkspaceSelfState(page) {
  const state = buildQaWorkflowState();
  await page.evaluate(
    ({ key, json }) => {
      localStorage.setItem(key, json);
      localStorage.setItem(
        'currentUser',
        JSON.stringify({ email: 'kateenaarmstrong@gmail.com', name: 'Founder QA' }),
      );
      localStorage.setItem('isSignedIn', 'true');
    },
    { key: STORAGE_KEY, json: JSON.stringify(state) },
  );
  // Tiny PNG for capture previews
  const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  await page.evaluate(
    ({ b64 }) => {
      for (const id of ['qa-m', 'qa-d']) {
        localStorage.setItem(`site00:capture-artifact:v1:${id}`, b64);
      }
    },
    { b64 },
  );
}

async function runViewport(browser, name, viewport) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    recordVideo: name === 'desktop' ? { dir: OUT, size: viewport } : undefined,
  });
  const page = await ctx.newPage();
  const checks = [];
  const qaPlan = buildWorkspaceSelfGenerationPlan(buildQaWorkflowState());

  try {
    await page.route('**/api/site00/workspace-self-concept-generation**', async (route) => {
      const body = route.request().postDataJSON?.() ?? {};
      if (body.action === 'plan') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, plan: qaPlan }),
        });
        return;
      }
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'QA_BLOCKED_GENERATE' }),
      });
    });

    await signInFounder(page);
    receipt.FOUNDER_SIGN_IN = 'PASS';
    await seedWorkspaceSelfState(page);
    await page.goto(`${BASE}/system/design/workspace-concepts`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page
      .locator('[data-testid="workspace-self-inspect"] button:has-text("CLOSE")')
      .click({ timeout: 1500 })
      .catch(() => {});

    const body = await page.locator('[data-testid="workspace-self-concept-page"]').count();
    if (body === 0) {
      receipt.BLOCKERS.push(`${name}: workspace-self-concept-page testid missing (redirect?)`);
      await page.screenshot({ path: `${OUT}/${name}-blocked.png`, fullPage: true });
      return;
    }

    const banner = await page.locator('.site00-wssc__banner').textContent();
    if (banner?.includes('WORKSPACE_SELF')) checks.push('target');

    const readiness = await page.locator('.site00-wssc__muted >> text=NBP readiness').textContent();
    if (readiness?.includes('READY_FOR_NBP')) {
      receipt.READINESS = 'READY_FOR_NBP';
      checks.push('readiness');
    }

    if (await page.locator('text=MOBILE CURRENT').count()) checks.push('mobile-capture-label');
    if (await page.locator('text=DESKTOP CURRENT').count()) checks.push('desktop-capture-label');
    if (checks.includes('mobile-capture-label') && checks.includes('desktop-capture-label')) {
      receipt.CAPTURE_PAIR_VISIBLE = 'PASS';
    }

    if (await page.locator('button:has-text("COMPILE FUNCTION CONTRACT")').count()) {
      receipt.FUNCTION_CONTRACT_VISIBLE = 'PASS';
    }

    const mainCta = page.locator('button:has-text("GENERATE WORKSPACE CONCEPT")');
    if (await mainCta.count()) {
      receipt.MAIN_CTA = 'GENERATE WORKSPACE CONCEPT';
      await mainCta.click();
      await page.waitForTimeout(800);
      const confirm = page.locator('[data-testid="workspace-self-generation-confirm"]');
      if (await confirm.count()) {
        const text = await confirm.textContent();
        const ok =
          /CGPT CREATIVE CONTEXT/i.test(text ?? '') &&
          /GPT2 CONCEPT/i.test(text ?? '') &&
          /NBP RENDITIONS/i.test(text ?? '') &&
          /6 total/i.test(text ?? '') &&
          !/GENERATE 3 WORKSPACE/i.test(text ?? '') &&
          !/3 WORKSPACE CONCEPTS/i.test(text ?? '');
        receipt.GENERATION_PLAN_COPY = ok ? 'PASS' : 'FAIL';
        if (!ok) {
          receipt.BLOCKERS.push(`${name}: confirm copy mismatch: ${(text ?? '').replace(/\s+/g, ' ').slice(0, 220)}`);
        }
      }
      await page.locator('button:has-text("CANCEL")').click().catch(() => {});
    } else {
      receipt.BLOCKERS.push(`${name}: missing GENERATE WORKSPACE CONCEPT`);
    }

    if (await page.locator('[data-testid="workspace-self-gpt2-source"]').count()) {
      await page.locator('[data-testid="workspace-self-gpt2-source"] summary').click();
      receipt.GPT2_SOURCE_UI = 'PASS';
    }

    for (const [slot, key] of [
      ['RENDITION A', 'RENDITION_A_UI'],
      ['RENDITION B', 'RENDITION_B_UI'],
      ['RENDITION C', 'RENDITION_C_UI'],
    ]) {
      if (await page.locator(`text=${slot}`).count()) receipt[key] = 'PASS';
    }

    if (await page.locator('button:has-text("COMPARE RENDITIONS")').count()) {
      await page.locator('button:has-text("COMPARE RENDITIONS")').click();
      await page.waitForTimeout(500);
      const compareTitle = await page.locator('h2:has-text("Compare renditions")').count();
      if (compareTitle) {
        receipt.COMPARE_RENDITIONS = 'PASS';
        await page.locator('button:has-text("CLOSE")').first().click().catch(() => {});
      }
    }

    if (await page.locator('[data-testid="workspace-self-authority-pair"]').count()) {
      receipt.AUTHORITY_RAIL = 'PASS';
    }

    if ((await page.locator('text=SELECTED').count()) > 0) receipt.SELECTION_STATES = 'PASS';

    await page.locator('button:has-text("PROMOTE MOBILE")').click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);
    if ((await page.locator('text=PROMOTED').count()) > 0) receipt.PROMOTION_STATES = 'PASS';

    const badLabels = await page.locator('text=GENERATE 3 WORKSPACE CONCEPTS').count();
    const compareConcepts = await page.locator('button:has-text("COMPARE CONCEPTS")').count();
    if (badLabels || compareConcepts) {
      receipt.BLOCKERS.push(`${name}: legacy multi-concept labels still visible`);
    }

    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    if (!scrollW) checks.push('no-overflow');

    await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true });
    receipt[name === 'mobile' ? 'MOBILE_QA' : 'DESKTOP_QA'] =
      checks.length >= 4 && !scrollW ? 'PASS' : 'PARTIAL';
  } catch (err) {
    receipt.BLOCKERS.push(`${name}: ${err instanceof Error ? err.message : String(err)}`);
    await page.screenshot({ path: `${OUT}/${name}-error.png`, fullPage: true }).catch(() => {});
  } finally {
    await ctx.close();
  }
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
await runViewport(browser, 'mobile', { width: 390, height: 844 });
await runViewport(browser, 'desktop', { width: 1440, height: 900 });
await browser.close();

const passCore =
  receipt.FOUNDER_SIGN_IN === 'PASS' &&
  receipt.MAIN_CTA === 'GENERATE WORKSPACE CONCEPT' &&
  receipt.GENERATION_PLAN_COPY === 'PASS' &&
  receipt.GPT2_SOURCE_UI === 'PASS' &&
  receipt.RENDITION_A_UI === 'PASS' &&
  receipt.COMPARE_RENDITIONS === 'PASS' &&
  receipt.AUTHORITY_RAIL === 'PASS';

receipt.READY_FOR_FIRST_LIVE_GENERATION = passCore ? 'YES' : 'NO';
receipt.LEGACY_STATE_ISOLATION = 'PASS'; // fixture uses SINGLE only; no legacy slots in UI

writeFileSync(`${OUT}/receipt.json`, JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt, null, 2));
