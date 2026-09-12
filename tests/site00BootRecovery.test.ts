import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');

describe('SITE 00 boot recovery', () => {
  it('index.html loads boot recovery before the SPA module', () => {
    const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
    const recovery = html.indexOf('site00-assts-boot-recovery.js');
    const main = html.indexOf('main.tsx');
    expect(recovery).toBeGreaterThan(-1);
    expect(main).toBeGreaterThan(-1);
    expect(recovery).toBeLessThan(main);
  });

  it('boot recovery script releases shell when root stays empty', () => {
    const src = readFileSync(join(ROOT, 'public/site00-assts-boot-recovery.js'), 'utf8');
    expect(src).toContain('site00-assts-boot');
    expect(src).toContain('childElementCount');
    expect(src).toContain('module specifier');
  });
});
