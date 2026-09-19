/**
 * P0.VR.DESIGN-MORNING-GOOD-STATE-RECOVERY1
 *
 * Chronology (2026-09-19 UTC):
 * - LAST_GOOD_MORNING: 441ae433 (merge #1010, before dock fix #1012)
 * - FIRST_DOCK_FIX: 438a196a
 * - FIRST_VIEW_ICON: 31344bbd
 * - STALE_RECOVERY guards: 977ca298 (EXPERIENCE Site00Layout + tests only)
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');

const LAST_GOOD_MORNING = '441ae433';
const FIRST_DOCK_FIX = '438a196a';
const FIRST_VIEW_ICON = '31344bbd';

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-MORNING-GOOD-STATE-RECOVERY1', () => {
  it('documents recovery boundary commits', () => {
    expect(LAST_GOOD_MORNING).toBe('441ae433');
    expect(FIRST_DOCK_FIX).toBe('438a196a');
    expect(FIRST_VIEW_ICON).toBe('31344bbd');
  });

  it('matches morning DESIGN code baseline + post-fix scroll/dock/icon layers', () => {
    const css = read('src/site00/styles/site00-design-project-surface.css');
    expect(css).toContain('.tod-dcs--workspace-inline:has(.tod-ps[data-format=\'wide\'])');
    expect(css).toContain('.tod-ps__main-zoom');
    const mainBlock = css.slice(css.indexOf('.tod-ps__main {'), css.indexOf('.tod-ps__main-zoom'));
    expect(mainBlock).toMatch(/overflow-y:\s*auto/);
    expect(mainBlock).not.toMatch(/zoom:/);
    expect(css).toMatch(/\.tod-ps__main-zoom[\s\S]*zoom:\s*calc/);
    const action = css.slice(css.indexOf('.tod-ps-actionbar'), css.indexOf('.tod-ps-actionbar__btn'));
    expect(action).not.toMatch(/position:\s*sticky/);
    expect(action).toMatch(/flex:\s*0\s*0\s*auto/);
    const kit = read('src/site00/components/designBench/production/designProjectSurfaceKit.tsx');
    expect(kit).not.toMatch(/return \(\s*\n\s*<div className="tod-ps"[^>]*>\s*\{children\}/);
  });

  it('keeps modern project tab surfaces and Grok view-mode icons', () => {
    expect(read('src/site00/components/designBench/production/projectTabs/ProjectAssetsSurface.tsx')).toContain(
      'ProjectSurface',
    );
    expect(read('src/site00/components/designBench/opusDirect/designViewModeGrokIcons.tsx')).toContain(
      'data-dvs-viewmode-grok',
    );
    expect(read('src/site00/components/designBench/opusDirect/TwinOpusDirectViewModeControl.tsx')).toContain(
      'DesignViewModeGrokIcon',
    );
  });

  it('preserves EXPERIENCE module shell wiring', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain('ProjectExperienceModuleGate');
    expect(routes).toMatch(/projectExperience[\s\S]*Site00Layout/);
  });
});
