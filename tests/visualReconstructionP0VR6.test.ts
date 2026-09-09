/**
 * P0.VR.6 — Design workspace UX reconstruction tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ASSET_PIPELINE_STEP_LABELS,
  DESIGN_WORKSPACE_PRIMARY_TABS,
  LEGACY_TAB_TO_PRIMARY,
  P0_VR_6_FAILURE_CODES,
  normalizeDesignWorkspacePrimaryTab,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6/index.js';
import {
  buildDesignWorkspacePrimaryUrlState,
  parseDesignWorkspacePrimaryUrlState,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6/designWorkspacePrimaryUrlState.js';
import { requiresExplicitFounderDispatch } from '../shared/site00-studio-world-production/visualReconstruction/p0vr4/spendGuard.js';
import { uploadNeverTriggersGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vr5/spendGuard.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.6 design workspace UX reconstruction', () => {
  it('1-6. primary tabs exist and legacy mapping works', () => {
    expect(DESIGN_WORKSPACE_PRIMARY_TABS).toEqual(['REFERENCES', 'ASSETS', 'PAGES', 'HISTORY', 'MORE']);
    expect(normalizeDesignWorkspacePrimaryTab('compare')).toBe('REFERENCES');
    expect(normalizeDesignWorkspacePrimaryTab('assets')).toBe('ASSETS');
    expect(LEGACY_TAB_TO_PRIMARY.INSPECT).toBe('MORE');
  });

  it('7-9. disclosure + viewport components wired', () => {
    const ui = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    expect(ui).toContain('DesignWorkspaceDisclosurePanel');
    expect(ui).toContain('DesignWorkspaceViewportRail');
    expect(ui).toContain('DesignWorkspacePrimaryTabRail');
    expect(read('src/site00/components/designWorkspace/DesignWorkspaceDisclosurePanel.tsx')).toContain('RECENT ACTIVITY');
    expect(read('src/site00/components/designWorkspace/DesignWorkspaceDisclosurePanel.tsx')).toContain('QUICK ACTIONS');
  });

  it('10-12. assets stepper + single active stage', () => {
    const job = read('src/site00/components/designWorkspace/DesignAssetJobWorkspace.tsx');
    expect(job).toContain('site00-dw-v3-stepper');
    expect(job).toContain('renderActiveStage');
    expect(job).not.toContain('site00-dw-job-workspace__grid');
    expect(Object.keys(ASSET_PIPELINE_STEP_LABELS)).toHaveLength(7);
  });

  it('13-19. tab panels exist', () => {
    expect(read('src/site00/components/designWorkspace/DesignReferencesTab.tsx')).toContain('REFERENCE LIBRARY');
    expect(read('src/site00/components/designWorkspace/DesignPagesTabPanel.tsx')).toContain('SEARCH PAGES');
    expect(read('src/site00/components/designWorkspace/DesignHistoryTab.tsx')).toContain('HISTORY TIMELINE');
    expect(read('src/site00/components/designWorkspace/DesignMoreTab.tsx')).toContain('SPEND GUARD');
  });

  it('20-22. crop gate + spend guard preserved', () => {
    expect(read('src/site00/components/designWorkspace/DesignAssetJobWorkspace.tsx')).toContain(
      'NO GENERATION HAPPENS BEFORE CROP APPROVAL',
    );
    expect(requiresExplicitFounderDispatch()).toBe(true);
    expect(uploadNeverTriggersGeneration()).toBe(true);
  });

  it('23-25. URL state uses primary tabs', () => {
    const parsed = parseDesignWorkspacePrimaryUrlState('?project=site00&screen=guide&viewport=mobile&tab=assets');
    expect(parsed.tab).toBe('ASSETS');
    const built = buildDesignWorkspacePrimaryUrlState({
      project: 'site00',
      screen: 'guide',
      viewport: 'mobile',
      tab: 'REFERENCES',
    });
    expect(built).toContain('tab=references');
  });

  it('26-28. v3 css + uppercase + no permanent activity footer', () => {
    const css = read('src/site00/styles/site00-design-workspace-v3.css');
    expect(css).toContain('site00-dw-v3-disclosure');
    expect(css).toContain('text-transform: uppercase');
    expect(css).toContain('.site00-dw-shell__bottom-panel');
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('bottomPanel={null}');
  });

  it('29. failure classes registered', () => {
    expect(P0_VR_6_FAILURE_CODES).toContain('DESIGN_ACTIVITY_NOT_COLLAPSIBLE');
    expect(P0_VR_6_FAILURE_CODES).toContain('DESIGN_ASSETS_STAGE_STACKING');
  });

  it('30. pipeline logic preserved in panel', () => {
    expect(read('src/site00/components/designWorkspace/DesignReferenceAssetsPanel.tsx')).toContain('DesignAssetJobWorkspace');
    expect(read('src/site00/components/designWorkspace/DesignAssetJobWorkspace.tsx')).toContain('runJobDetection');
    expect(read('src/site00/components/designWorkspace/DesignAssetJobWorkspace.tsx')).toContain('reconstructJobAssets');
  });
});
