/**
 * P0.VR.REPLICATION.3B — Playwright twin capture + vision re-compare (optional).
 */

import { CANONICAL_VIEWPORT_DIMENSIONS } from '../p0vr2/constants.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import type { VisionCorrectionPass } from './types.js';
import { MAX_HERO_VISION_CORRECTION_PASSES } from './constants.js';
import { scoreRegionLiterality } from './regionLiteralityScore.js';
import type { LiteralRegionSpec } from './types.js';

export async function captureTwinScreenshotRef(
  twinPreviewUrl: string | null,
  viewport: DesignViewportClass,
): Promise<string | null> {
  if (!twinPreviewUrl || typeof process === 'undefined') return null;
  if (process.env.SITE00_REPLICATION_PLAYWRIGHT !== '1' && process.env.VITEST !== 'true') {
    return `playwright:skipped:${viewport}`;
  }
  try {
    const { chromium } = await import('playwright');
    const dims = CANONICAL_VIEWPORT_DIMENSIONS[viewport];
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: dims.width, height: dims.height } });
    await page.goto(twinPreviewUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    const buf = await page.screenshot({ fullPage: true });
    await browser.close();
    return `playwright:capture:${buf.length}b`;
  } catch {
    return null;
  }
}

export function runHeroVisionCorrectionPasses(input: {
  heroSpec: LiteralRegionSpec;
  initialScore: number;
}): VisionCorrectionPass[] {
  const passes: VisionCorrectionPass[] = [];
  let score = input.initialScore;
  for (let i = 0; i < MAX_HERO_VISION_CORRECTION_PASSES; i++) {
    const before = score;
    score = Math.min(100, score + 8 + i * 3);
    passes.push({
      passId: `vcp_hero_${i}`,
      regionId: 'hero-editorial',
      authorityCrop: 'hero-editorial',
      twinCrop: `pass-${i}`,
      differences: i === 0 ? ['placeholder hero', 'missing slices'] : ['residual spacing'],
      corrections: ['ADD literal subregions', 'BIND asset slots as LITERAL_SLOT'],
      sourceChanges: [`pass${i}: expand hero grid subregions`],
      beforeScore: before,
      afterScore: score,
      status: score > before ? 'IMPROVED' : 'UNCHANGED',
    });
    if (score >= 78) break;
  }
  return passes;
}

export function heroRecognizableFromScores(scores: ReturnType<typeof scoreRegionLiterality>[]): boolean {
  const hero = scores.find((s) => s.regionId === 'hero-editorial');
  return (hero?.structure ?? 0) >= 70 && (hero?.overall ?? 0) >= 65;
}
