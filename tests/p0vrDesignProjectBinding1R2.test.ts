/**
 * P0.VR.DESIGN-PROJECT-BINDING1R2 — visual rollback + intelligence preservation
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  DESIGN_VISUAL_COMPOSITION_MUTATION_ALLOWED,
  buildDesignModuleHierarchy,
  formatDesignModuleBreadcrumb,
} from '../shared/site00-design-workspace-production/index.js';
import {
  defaultConceptPageTargetForShell,
  designPageTargetLines,
  resolveDesignPageTargetForShell,
} from '../src/site00/components/designBench/production/designProductionPageTarget';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-PROJECT-BINDING1R2', () => {
  it('preserves PROJECTS > DESIGN > ACTIVE PROJECT hierarchy', () => {
    const crumb = formatDesignModuleBreadcrumb(
      buildDesignModuleHierarchy({ activeProjectId: 'ndxbook', activeProjectLabel: 'NDXBOOK' }),
    );
    expect(crumb).toBe('PROJECTS > DESIGN > NDXBOOK');
  });

  it('restores approved TARGET band line geometry for default shell', () => {
    const target = defaultConceptPageTargetForShell('ndxbook');
    expect(designPageTargetLines(target)).toEqual(['ENTRY 001', 'ENTRY COVER', 'HOMEPAGE HERO']);
    expect(resolveDesignPageTargetForShell('ndxbook').entryId).toBe('ENTRY-001');
  });

  it('does not mount card-stack overview on main twin screen', () => {
    const screen = read('src/site00/components/designBench/opusDirect/TwinOpusDirectScreen.tsx');
    expect(screen).not.toContain('DesignProjectOverviewPanel');
    expect(screen).not.toContain('showProjectOverview');
    expect(screen).toContain('ViewBody workspace={workspace}');
  });

  it('keeps page registry on PAGES section', () => {
    const pages = read('src/site00/components/designBench/production/DesignProductionSectionPages.tsx');
    expect(pages).toContain('buildProjectDesignPageRegistry');
  });

  it('visual composition freeze guard is active', () => {
    expect(DESIGN_VISUAL_COMPOSITION_MUTATION_ALLOWED).toBe(false);
  });

  it('authority errors use compact toast without mandatory overlay layer', () => {
    const overlays = read('src/site00/components/designBench/opusDirect/TwinOpusDirectOverlays.tsx');
    expect(overlays).toContain('tod-dcs-toast--compact');
    expect(overlays).toContain('dismissProductionError');
  });
});
