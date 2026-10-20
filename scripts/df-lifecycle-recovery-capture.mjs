import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const out = '/opt/cursor/artifacts/df-lifecycle-recovery';
mkdirSync(out, { recursive: true });
const base = process.env.DF_REVIEW_BASE ?? 'http://127.0.0.1:5174';

const shots = [
  { hash: 'df-r-needs-you-approval', name: 'screen-10-approval' },
  { hash: 'df-r-complete', name: 'screen-11-complete' },
  { hash: 'df-r-RECORDS', name: 'screen-13a-records' },
  { hash: 'df-r-record-domain', name: 'screen-13a-domain-detail' },
  { hash: 'df-r-founder-foundation_pipeline', name: 'screen-13-pipeline' },
  { hash: 'df-r-founder-project_command', name: 'screen-14-project-command' },
  { hash: 'df-r-founder-execution_workbench', name: 'screen-15-workbench' },
  { hash: 'df-r-post-intake-submitted', name: 'client-queue-post-intake' },
  { hash: 'df-r-OVERVIEW', name: 'client-portal-overview' },
];

const widths = [
  { w: 390, tag: '390' },
  { w: 834, tag: '834' },
  { w: 1440, tag: '1440' },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const { hash, name } of shots) {
  for (const { w, tag } of widths) {
    await page.setViewportSize({ width: w, height: Math.min(1200, w === 390 ? 844 : 1000) });
    await page.goto(`${base}/foundation/review#${hash}`, { waitUntil: 'networkidle', timeout: 120_000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${out}/${name}-${tag}.png`, fullPage: true });
  }
}
await browser.close();
console.log('Wrote lifecycle recovery screenshots to', out);
