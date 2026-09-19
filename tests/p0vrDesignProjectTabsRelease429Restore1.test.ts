/**
 * P0.VR.DESIGN-PROJECT-TABS-RELEASE429-RESTORE1
 *
 * Project tab components match release #429 grammar; flex fix for `.tod-child-embedded`.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { gitDiffNames, resolveRelease429Ref } from './helpers/release429Git';

const ROOT = join(import.meta.dirname, '..');
const release429Ref = resolveRelease429Ref(ROOT);
const itWithRelease429Git = release429Ref ? it : it.skip;

const TAB_FILES = [
  'src/site00/components/designBench/production/projectTabs/ProjectReferencesSurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectAssetsSurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectPagesSurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectSkinsSurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectHistorySurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectMoreSurface.tsx',
] as const;

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-PROJECT-TABS-RELEASE429-RESTORE1', () => {
  itWithRelease429Git('tab surface components unchanged since release #429', () => {
    for (const file of TAB_FILES) {
      const diff = gitDiffNames(ROOT, release429Ref!, [file]);
      expect(diff, file).toEqual([]);
    }
  });

  it('each tab mounts rich Release #429 project surface grammar', () => {
    const markers: Record<(typeof TAB_FILES)[number], string> = {
      [TAB_FILES[0]]: 'ProjectPanes',
      [TAB_FILES[1]]: 'ProjectPanes',
      [TAB_FILES[2]]: 'ProjectPanes',
      [TAB_FILES[3]]: 'ProjectPanes',
      [TAB_FILES[4]]: 'ProjectTimeline',
      [TAB_FILES[5]]: 'ProjectModules',
    };
    for (const file of TAB_FILES) {
      const src = read(file);
      expect(src, file).toContain('ProjectSurface');
      expect(src, file).toContain('ProjectActionBar');
      expect(src, file).toContain(markers[file]);
    }
  });

  it('embedded shell wrapper participates in project-tab flex column', () => {
    const css = read('src/site00/styles/site00-design-project-surface.css');
    expect(css).toMatch(
      /\.tod-dcs--workspace-inline:has\(\.tod-ps\) \.tod-child-embedded[\s\S]*flex:\s*1\s*1\s*0/,
    );
    expect(css).toMatch(/\.tod-child-embedded > \.tod-ps[\s\S]*min-height:\s*0/);
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
    expect(read(TAB_FILES[5])).toContain('ProjectModules');
  });
});
