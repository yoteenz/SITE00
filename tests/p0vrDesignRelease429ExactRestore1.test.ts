/**
 * P0.VR.DESIGN-RELEASE429-EXACT-RESTORE1
 *
 * SOURCE: production release #429 / commit 441ae433
 * ("GROK: staged visual support pack for the seven project-level tabs")
 *
 * Git comparisons run only when the authority commit exists locally (full clone).
 * CI shallow checkouts use filesystem guards instead.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { gitDiffNames, gitShowFile, resolveRelease429Ref } from './helpers/release429Git';

const ROOT = join(import.meta.dirname, '..');

const SOURCE_RELEASE429_LABEL = '441ae433';

/** Paths allowed to differ from SOURCE_RELEASE429 on main (manifest). */
const POST429_DESIGN_ALLOWLIST = [
  'src/routes/Site00Routes.tsx',
  'src/site00/components/designBench/opusDirect/TwinOpusDirectViewModeControl.tsx',
  'src/site00/components/designBench/opusDirect/designViewModeGrokIcons.tsx',
  'src/site00/components/designBench/production/designProjectSurfaceKit.tsx',
  'src/site00/styles/site00-design-child-surface.css',
  'src/site00/styles/site00-design-project-surface.css',
  'src/site00/styles/site00-twin-opus-direct.css',
].sort();

const DESIGN_DIFF_PATHS = [
  'src/site00/components/designBench',
  'src/site00/styles/site00-design-child-surface.css',
  'src/site00/styles/site00-design-project-surface.css',
  'src/site00/styles/site00-twin-opus-direct.css',
  'src/routes/Site00Routes.tsx',
];

const release429Ref = resolveRelease429Ref(ROOT);
const itWithRelease429Git = release429Ref ? it : it.skip;

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-RELEASE429-EXACT-RESTORE1', () => {
  it('documents release #429 source commit', () => {
    expect(SOURCE_RELEASE429_LABEL).toBe('441ae433');
    const manifest = read('docs/design-release429-restore-manifest.md');
    expect(manifest).toContain('441ae433');
    expect(manifest).toContain('441ae43');
  });

  itWithRelease429Git('only allowlisted DESIGN paths differ from 441ae433 (no stale bench drift)', () => {
    const changed = gitDiffNames(ROOT, release429Ref!, DESIGN_DIFF_PATHS);
    expect(changed).toEqual(POST429_DESIGN_ALLOWLIST);
  });

  it('ProjectSurface dock/scroll split preserves release #429 content model', () => {
    const kit = read('src/site00/components/designBench/production/designProjectSurfaceKit.tsx');
    expect(kit).toContain('tod-ps__main');
    expect(kit).toContain('tod-ps__main-zoom');
    expect(kit).toContain('child.type === ProjectActionBar');
    expect(kit).toContain('ProjectIdentity');
    expect(kit).toContain('ProjectModules');
  });

  itWithRelease429Git('441ae433 ProjectSurface had flat children before dock split', () => {
    const kitAt429 = gitShowFile(
      ROOT,
      release429Ref!,
      'src/site00/components/designBench/production/designProjectSurfaceKit.tsx',
    );
    expect(kitAt429).toMatch(/return \(\s*\n\s*<div className="tod-ps"/);
    expect(kitAt429).not.toContain('tod-ps__main');
  });

  it('reapplies dock fix + release #429 wide zoom on main-zoom (not frame)', () => {
    const css = read('src/site00/styles/site00-design-project-surface.css');
    expect(css).toContain('.tod-dcs--workspace-inline:has(.tod-ps[data-format=\'wide\'])');
    expect(css).toMatch(/\.tod-ps__main-zoom[\s\S]*zoom:\s*calc/);
    expect(css).toMatch(/\.tod-child-embedded[\s\S]*flex:\s*1\s*1\s*0/);
    const frameBlock = css.slice(
      css.indexOf('.tod-dcs--workspace-inline:has(.tod-ps)'),
      css.indexOf('.tod-dcs--workspace-inline:has(.tod-ps) .tod-dcs__head'),
    );
    expect(frameBlock).not.toMatch(/\n\s*zoom:/);
    const action = css.slice(css.indexOf('.tod-ps-actionbar'), css.indexOf('.tod-ps-actionbar__btn'));
    expect(action).not.toMatch(/position:\s*sticky/);
    expect(action).toMatch(/flex:\s*0\s*0\s*auto/);
  });

  it('reapplies Grok Canonical/List icon-only control', () => {
    expect(read('src/site00/components/designBench/opusDirect/designViewModeGrokIcons.tsx')).toContain(
      'data-dvs-viewmode-grok',
    );
    const control = read('src/site00/components/designBench/opusDirect/TwinOpusDirectViewModeControl.tsx');
    expect(control).toContain('DesignViewModeGrokIcon');
    expect(control).not.toContain('>{TWIN_OPUS_DIRECT_VIEW_MODE_LABELS[candidate]}<');
  });

  it('preserves EXPERIENCE module wiring', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain('ProjectExperienceModuleGate');
    expect(routes).toMatch(/projectExperience[\s\S]*Site00Layout/);
  });

  it('production route targets Twin Opus Direct workspace (no duplicate winner)', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain('DesignTwinOpusDirectRouteGate');
    expect(routes).toContain('DesignTwinWorkspaceLayout');
    expect(read('src/site00/pages/DesignTwinOpusDirectPage.tsx')).toContain('DesignWorkspaceCore');
    expect(read('src/site00/components/designBench/production/DesignWorkspaceCore.tsx')).toContain(
      'TwinOpusDirectScreen',
    );
  });
});
