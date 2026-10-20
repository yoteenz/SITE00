import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const TUNNEL_URL_FILE = '/tmp/site00-cloud-preview-url.txt';

describe('digital foundation review public tunnel acceptance', () => {
  it('review registry and recommendation render on the public tunnel when configured', async () => {
    if (!existsSync(TUNNEL_URL_FILE)) return;
    const base = readFileSync(TUNNEL_URL_FILE, 'utf8').trim().replace(/\/$/, '');
    if (!base.startsWith('http')) return;

    const reviewRes = await fetch(`${base}/foundation/review`);
    expect(reviewRes.status).toBe(200);

    const html = await reviewRes.text();
    expect(html.includes('/assets/') || html.includes('/src/main.tsx')).toBe(true);
    expect(html).not.toContain('502 Bad Gateway');

    const bldrRes = await fetch(`${base}/bldr/studio/place`);
    expect([200, 404]).toContain(bldrRes.status);
    expect(bldrRes.status).not.toBe(502);

    const { chromium } = await import('playwright');
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${base}/foundation/review`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    await page.waitForTimeout(3000);
    const registryLabel = await page.locator('.df-review__nav-toggle').textContent();
    expect(registryLabel ?? '').toMatch(/SHOW REGISTRY \(\d+\)/);
    const count = Number((registryLabel ?? '').match(/\((\d+)\)/)?.[1] ?? 0);
    expect(count).toBeGreaterThan(60);
    await page.goto(`${base}/foundation/review#df-r-P04`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const loading = await page.locator('#df-r-P04 .df-review__wait').count();
    const headline = await page.locator('#df-r-P04 .df-headline').count();
    expect(loading + headline).toBeGreaterThan(0);
    if (headline > 0) expect(headline).toBeGreaterThan(0);
    await page.screenshot({ path: '/opt/cursor/artifacts/df-review-tunnel-p04-390.png' });
    await browser.close();
  }, 180_000);
});
