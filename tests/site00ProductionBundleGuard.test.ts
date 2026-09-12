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
  it('dist assets omit Playwright and chromium-bidi (run npm run build first in CI)', () => {
    const files = listJsAssets();
    expect(files.length).toBeGreaterThan(0);
    const forbidden = ['chromium-bidi', 'import"playwright"', "import'playwright'"];
    for (const file of files) {
      const src = readFileSync(join(DIST_ASSETS, file), 'utf8');
      for (const needle of forbidden) {
        expect(src, `${file} must not reference ${needle}`).not.toContain(needle);
      }
    }
  });

  it('vite aliases Playwright to browser stubs', () => {
    const vite = readFileSync(join(ROOT, 'vite.config.ts'), 'utf8');
    expect(vite).toContain('scripts/vite-browser-stubs/playwright.ts');
    expect(vite).toMatch(/chromium-bidi/);
  });
});
