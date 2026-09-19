/**
 * P0.DESIGN.IN-SHELL-DOCK-POSITIONING-FIX1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.DESIGN.IN-SHELL-DOCK-POSITIONING-FIX1', () => {
  it('project action bar is panel-docked, not viewport sticky', () => {
    const css = read('src/site00/styles/site00-design-project-surface.css');
    const actionBlock = css.slice(css.indexOf('.tod-ps-actionbar'), css.indexOf('.tod-ps-actionbar__btn'));
    expect(actionBlock).not.toMatch(/position:\s*sticky/);
    expect(actionBlock).toMatch(/position:\s*absolute/);
    expect(actionBlock).toMatch(/bottom:\s*0/);
    expect(css).toContain('.tod-ps__main');
  });

  it('ProjectSurface splits scroll main from action bar', () => {
    const kit = read('src/site00/components/designBench/production/designProjectSurfaceKit.tsx');
    expect(kit).toContain('tod-ps__main');
    expect(kit).toContain('child.type === ProjectActionBar');
  });

  it('zoom applies to scroll main only (not frame or action bar)', () => {
    const css = read('src/site00/styles/site00-design-project-surface.css');
    const psBlock = css.slice(css.indexOf('.tod-ps {'), css.indexOf('.tod-ps__main'));
    expect(psBlock).not.toMatch(/zoom:/);
    expect(css).toMatch(/\.tod-ps__main[\s\S]*zoom:/);
    const frameBlock = css.slice(
      css.indexOf('.tod-dcs--workspace-inline:has(.tod-ps)'),
      css.indexOf('.tod-dcs--workspace-inline:has(.tod-ps) .tod-dcs__head'),
    );
    expect(frameBlock).not.toMatch(/\n\s*zoom:/);
  });
});
