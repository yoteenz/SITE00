#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { chromium, devices } from 'playwright';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const PORT = 4189;
const READINESS = `http://127.0.0.1:${PORT}/admin/site00/foundation-readiness`;

const child = spawn('npm', ['run', 'start:spa'], {
  cwd: ROOT,
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'pipe',
});
await new Promise((r) => setTimeout(r, 2500));

try {
  const browser = await chromium.launch();
  const page = await browser.newPage({ ...devices['iPhone 13'] });
  await page.addInitScript(() => {
    localStorage.setItem('isSignedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify({ email: 'kateenaarmstrong@gmail.com', role: 'admin' }));
  });
  await page.goto(READINESS, { waitUntil: 'networkidle', timeout: 60000 });
  const text = await page.locator('body').innerText();
  const ok =
    text.includes('DIGITAL FOUNDATION') &&
    text.includes('Create test client') &&
    text.trim().length > 80;
  await page.screenshot({ path: '/opt/cursor/artifacts/spa-static-server-mobile-readiness.png', fullPage: true });
  await browser.close();
  if (!ok) {
    console.error('FAIL', text.slice(0, 400));
    process.exit(1);
  }
  console.log('OK mobile readiness on start:spa');
} finally {
  child.kill('SIGTERM');
}
