/**
 * P0.VR.DESIGN-RELEASE429-EXACT-RESTORE1
 *
 * SOURCE: production release #429 / commit 441ae433
 * ("GROK: staged visual support pack for the seven project-level tabs")
 *
 * Selective restore: DESIGN bench matches 441ae433 except intentional post-429 layers
 * (dock/scroll, Grok view-mode icons, EXPERIENCE Site00Layout).
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');

const SOURCE_RELEASE429 = '441ae433';

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

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function gitDiffNames(base: string): string[] {
  const out = execSync(`git diff --name-only ${base} HEAD -- ${DESIGN_DIFF_PATHS.join(' ')}`, {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return out
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .sort();
}

describe('P0.VR.DESIGN-RELEASE429-EXACT-RESTORE1', () => {
  it('documents release #429 source commit', () => {
    expect(SOURCE_RELEASE429).toBe('441ae433');
    expect(read('docs/design-release429-restore-manifest.md')).toContain(SOURCE_RELEASE429);
  });

  it('only allowlisted DESIGN paths differ from 441ae433 (no stale bench drift)', () => {
    const changed = gitDiffNames(SOURCE_RELEASE429);
    expect(changed).toEqual(POST429_DESIGN_ALLOWLIST);
  });

  it('441ae433 ProjectSurface baseline is preserved inside dock/scroll split', () => {
    const kitAt429 = execSync(`git show ${SOURCE_RELEASE429}:src/site00/components/designBench/production/designProjectSurfaceKit.tsx`, {
      cwd: ROOT,
      encoding: 'utf8',
    });
    expect(kitAt429).toMatch(/return \(\s*\n\s*<div className="tod-ps"/);
    expect(kitAt429).not.toContain('tod-ps__main');

    const kit = read('src/site00/components/designBench/production/designProjectSurfaceKit.tsx');
    expect(kit).toContain('tod-ps__main');
    expect(kit).toContain('tod-ps__main-zoom');
    expect(kit).toContain('child.type === ProjectActionBar');
  });

  it('reapplies dock fix + release #429 wide zoom on main-zoom (not frame)', () => {
    const css = read('src/site00/styles/site00-design-project-surface.css');
    expect(css).toContain('.tod-dcs--workspace-inline:has(.tod-ps[data-format=\'wide\'])');
    expect(css).toMatch(/\.tod-ps__main-zoom[\s\S]*zoom:\s*calc/);
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
