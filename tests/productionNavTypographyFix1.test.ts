import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

describe('P0 production nav typography fix', () => {
  it('preserves canonical bottom nav order and labels', () => {
    const labels = ['HUB', 'INBOX', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'ACTIVITY'];
    const src = read('src/site00/components/productionHub/nav.tsx');
    for (const label of labels) {
      expect(src).toContain(`label: '${label}'`);
    }
  });

  it('does not apply hub root zoom to system chrome typography', () => {
    const authority = read('src/site00/styles/site00-production-hub-authority.css');
    expect(authority).toMatch(/\.ph--hub\s*\{[\s\S]*zoom:\s*1;/);
    expect(authority).toContain('.ph--hub > .ph-scroll');
    expect(authority).toMatch(/\.ph--hub > \.ph-scroll[\s\S]*zoom:\s*var\(--phz/);
  });

  it('forces zoom:1 on header, footer, and fixed chrome strips', () => {
    const typo = read('src/site00/styles/site00-production-system-chrome-typography.css');
    expect(typo).toContain('.ph--hub > .ph-top');
    expect(typo).toContain('.ph--hub > .ph-nav');
    expect(typo).toContain('ph--system-chrome');
    expect(typo).toContain('zoom: 1 !important');
    expect(typo).not.toMatch(/font-size:\s*[\d.]+vw/);
    expect(typo).not.toMatch(/font-size:\s*[\d.]+vh/);
    expect(typo).not.toMatch(/font-size:\s*[\d.]+cqw/);
    expect(typo).not.toMatch(/transform:\s*scale\(/);
  });

  it('marks production chrome strip as system chrome', () => {
    expect(read('src/site00/components/productionHub/chrome.tsx')).toContain('ph--system-chrome');
  });

  it('bottom nav labels stay uppercase in source', () => {
    const nav = read('src/site00/components/productionHub/nav.tsx');
    expect(nav).not.toMatch(/label:\s*'[a-z]/);
  });
});
