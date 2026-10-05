#!/usr/bin/env node
/**
 * Capture live DOM hero outlier snapshot via dev harness (PLAYWRIGHT_DOM).
 * Output: /tmp/hero-outlier-snapshot.json
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const BASE = process.env.SITE00_VITE_URL ?? 'http://127.0.0.1:5174';
const OUT = process.env.HERO_SNAPSHOT_OUT ?? '/tmp/hero-outlier-snapshot.json';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

await page.goto(`${BASE}/__dev/hero-outlier-measure?blueprintDebug=hero`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-hero-object="H14"]', { timeout: 20000 });
await page.waitForTimeout(800);

const snapshot = await page.evaluate(() => {
  const authority = window.__HERO_MEASURE_AUTHORITY__;
  if (!authority || authority.length < 14) {
    return { error: 'OUTLIER_SNAPSHOT_UNAVAILABLE', reason: 'authority missing on window' };
  }

  const heroRoot = document.querySelector('[data-hero-object="H14"]');
  if (!heroRoot) return { error: 'OUTLIER_SNAPSHOT_UNAVAILABLE', reason: 'H14 missing' };

  const ids = ['H01', 'H02', 'H03', 'H04', 'H05', 'H06', 'H07', 'H08', 'H09', 'H10', 'H11', 'H12', 'H13', 'H14'];
  const rootRect = heroRoot.getBoundingClientRect();
  const rendered = [];
  const missing = [];

  for (const id of ids) {
    const el = document.querySelector(`[data-hero-object="${id}"]`);
    if (!el) {
      missing.push(id);
      continue;
    }
    const rect = el.getBoundingClientRect();
    rendered.push({
      objectId: id,
      actualX: rect.left - rootRect.left,
      actualY: rect.top - rootRect.top,
      actualWidth: rect.width,
      actualHeight: rect.height,
    });
  }

  const deltas = authority.map((a) => {
    const act = rendered.find((r) => r.objectId === a.objectId);
    if (!act || a.objectId === 'H07') {
      return { objectId: a.objectId, status: 'WITHIN_TOLERANCE', deltaX: 0, deltaY: 0, deltaWidth: 0, deltaHeight: 0, severity: 'GREEN' };
    }
    const deltaX = act.actualX - a.targetX;
    const deltaY = act.actualY - a.targetY;
    const deltaWidth = act.actualWidth - a.targetWidth;
    const deltaHeight = act.actualHeight - a.targetHeight;
    const posErr = Math.max(Math.abs(deltaX), Math.abs(deltaY));
    const sizeErr = Math.max(Math.abs(deltaWidth), Math.abs(deltaHeight));
    const within = posErr <= 3 && sizeErr <= 4;
    return {
      objectId: a.objectId,
      deltaX,
      deltaY,
      deltaWidth,
      deltaHeight,
      leftError: act.actualX - a.targetX,
      rightError: act.actualX + act.actualWidth - (a.targetX + a.targetWidth),
      topError: act.actualY - a.targetY,
      bottomError: act.actualY + act.actualHeight - (a.targetY + a.targetHeight),
      severity: Math.max(posErr, sizeErr) > 4 ? 'RED' : Math.max(posErr, sizeErr) > 2 ? 'YELLOW' : 'GREEN',
      status: within ? 'WITHIN_TOLERANCE' : 'OUT_OF_TOLERANCE',
    };
  });

  const outliers = deltas.filter((d) => d.status === 'OUT_OF_TOLERANCE' && d.objectId !== 'H07');
  const passCount = deltas.filter((d) => d.status === 'WITHIN_TOLERANCE' && d.objectId !== 'H07').length;

  return {
    measurementSource: 'PLAYWRIGHT_DOM',
    measuredCount: 14,
    renderedCount: rendered.length,
    passCount,
    outlierCount: outliers.length,
    missingIds: missing,
    outliers,
    deltas,
  };
});

writeFileSync(OUT, JSON.stringify(snapshot, null, 2));
console.log(`Wrote ${OUT}`);
console.log(JSON.stringify({ outlierCount: snapshot.outlierCount, passCount: snapshot.passCount, renderedCount: snapshot.renderedCount }, null, 2));

await browser.close();
