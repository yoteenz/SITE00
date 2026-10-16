#!/usr/bin/env node
/**
 * Mobile render smoke — foundation readiness with mocked admin session + readiness API.
 */
import { chromium, devices } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PORT = 4179;
const BASE = `http://127.0.0.1:${PORT}`;

const mockReport = {
  overall_status: 'ACTION_REQUIRED',
  ready: ['Staging API deployment verified'],
  needs_founder: [],
  blocked: [],
  unverified: [],
  env_var_groups: [],
  database_security: {
    supabase_project_ref: 'soocqbyjkxeubfjnuwvf',
    project_messages_table: { anon_select: 'denied', service_role_select: 'denied' },
    persistence_safe: true,
    notes: [],
  },
  activation: {
    e2e_authorized: false,
    synthetic_intake_ready: true,
    remote_migration_applied: true,
    deployment_performed: true,
    founder_login_verified: true,
  },
  staging_identities: {
    expected_frontend_origin: 'https://carefree-luck-staging.up.railway.app',
    expected_api_origin: 'https://reliable-creation-staging.up.railway.app',
    configured_public_origin: 'https://carefree-luck-staging.up.railway.app',
    effective_public_origin: 'https://carefree-luck-staging.up.railway.app',
    supabase_project_ref: 'soocqbyjkxeubfjnuwvf',
    supabase_staging_isolation_verified: true,
    persistence_store: 'supabase',
    email_sending_enabled: false,
    stripe_key_mode: 'unrecognized',
    e2e_passed: false,
  },
  env: {
    founder_test_mode: true,
    transactional_send_flag: false,
    resend_configured: true,
    allowlist_configured: true,
    supabase_persistence: true,
    stripe_secret_present: true,
    stripe_webhook_secret_present: true,
    resend_webhook_secret_present: true,
    transactional_from_present: true,
    transactional_reply_to_present: true,
  },
  deployment: { commit_short: 'local', pr1642_reference: 'PR #1642', package_marker: 'test' },
  env_vars: [],
};

function startPreview() {
  return spawn('npm', ['run', 'preview', '--', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env },
  });
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${BASE}/`);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('preview server did not start');
}

const preview = startPreview();
try {
  await waitForServer();
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 13'],
  });
  await context.addInitScript(() => {
    localStorage.setItem('isSignedIn', 'true');
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ email: 'kateenaarmstrong@gmail.com', role: 'admin', firstName: 'Founder' }),
    );
  });
  const page = await context.newPage();
  await page.route('**/api/admin/site00-foundation?action=readiness-report**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockReport),
    });
  });
  await page.goto(`${BASE}/admin/site00/foundation-readiness`, { waitUntil: 'networkidle' });
  const heading = page.locator('h1.site00-admin-page-title');
  await heading.waitFor({ timeout: 15000 });
  const text = await heading.textContent();
  if (!text || !text.includes('DIGITAL FOUNDATION')) {
    throw new Error(`Expected readiness heading, got: ${text}`);
  }
  const intake = page.getByText('Synthetic intake');
  if ((await intake.count()) < 1) throw new Error('Missing Synthetic intake label');
  await page.screenshot({ path: '/opt/cursor/artifacts/foundation-readiness-mobile-render.png', fullPage: true });
  await browser.close();
  console.log('OK: foundation readiness rendered on mobile viewport');
} finally {
  preview.kill('SIGTERM');
}
