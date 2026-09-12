/**
 * Production SPA must boot in the browser — no Playwright / chromium-bidi in dist assets.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');
const DIST_ASSETS = join(ROOT, 'dist', 'assets');

function listJsAssets(): string[] {
  try {
    return readdirSync(DIST_ASSETS).filter((name) => name.endsWith('.js'));
  } catch {
    return [];
  }
}

describe('SITE 00 production bundle guard', () => {
  const distJsAssets = listJsAssets();

  // CI `test` job runs before `npm run build`; dist scan runs in build via scripts/verify-production-dist.mjs
  it.skipIf(distJsAssets.length === 0)(
    'dist assets omit Playwright and chromium-bidi (local: npm run build first)',
    () => {
      const forbidden = ['chromium-bidi', 'import"playwright"', "import'playwright'"];
      for (const file of distJsAssets) {
        const src = readFileSync(join(DIST_ASSETS, file), 'utf8');
        for (const needle of forbidden) {
          expect(src, `${file} must not reference ${needle}`).not.toContain(needle);
        }
      }
    },
  );

  it('CI build runs verify-production-dist.mjs after npm run build', () => {
    const workflow = readFileSync(join(ROOT, '.github/workflows/site00-production-deploy.yml'), 'utf8');
    expect(workflow).toContain('node scripts/verify-production-dist.mjs');
    expect(readFileSync(join(ROOT, 'scripts/verify-production-dist.mjs'), 'utf8')).toContain('chromium-bidi');
  });

  it('vite aliases Playwright to browser stubs', () => {
    const vite = readFileSync(join(ROOT, 'vite.config.ts'), 'utf8');
    expect(vite).toContain('scripts/vite-browser-stubs/playwright.ts');
    expect(vite).toMatch(/chromium-bidi/);
  });
});
