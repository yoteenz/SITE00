/**
 * P0.VR.DESIGN-PROJECT-TABS-RELEASE429-RESTORE1
 *
 * Project tab *components* match 441ae433; regression was flex chain through
 * `.tod-child-embedded` collapsing scroll main to zero height.
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');
const SOURCE = '441ae433';

const TAB_FILES = [
  'src/site00/components/designBench/production/projectTabs/ProjectReferencesSurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectAssetsSurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectPagesSurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectSkinsSurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectHistorySurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectMoreSurface.tsx',
];

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-PROJECT-TABS-RELEASE429-RESTORE1', () => {
  it('tab surface components unchanged since release #429', () => {
    for (const file of TAB_FILES) {
      const diff = execSync(`git diff ${SOURCE} HEAD -- ${file}`, { cwd: ROOT, encoding: 'utf8' });
      expect(diff, file).toBe('');
    }
  });

  it('embedded shell wrapper participates in project-tab flex column', () => {
    const css = read('src/site00/styles/site00-design-project-surface.css');
    expect(css).toMatch(
      /\.tod-dcs--workspace-inline:has\(\.tod-ps\) \.tod-child-embedded[\s\S]*flex:\s*1\s*1\s*0/,
    );
    expect(css).toMatch(
      /\.tod-child-embedded > \.tod-ps[\s\S]*min-height:\s*0/,
    );
  });

  it('scroll main + local dock structure preserved', () => {
    const css = read('src/site00/styles/site00-design-project-surface.css');
    expect(css).toContain('.tod-ps__main');
    const action = css.slice(css.indexOf('.tod-ps-actionbar'), css.indexOf('.tod-ps-actionbar__btn'));
    expect(action).toMatch(/flex:\s*0\s*0\s*auto/);
  });

  it('routes still mount rich project tab surfaces', () => {
    const sections = read('src/site00/components/designBench/production/DesignProductionSections.tsx');
    expect(sections).toContain('ProjectReferencesSurface');
    expect(sections).toContain('ProjectMoreSurface');
    expect(read(TAB_FILES[5]!)).toContain('ProjectModules');
  });
});
