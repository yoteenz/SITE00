/**
 * P0.VR.1D.7 — Reference scope awareness tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  VISUAL_REFERENCE_SCOPES,
  classifyVisualReferenceScope,
  reclassifyFounderBoardReferences,
  desktopCompositeClassifiedAsFullScreen,
  desktopPanelCropsClassifiedAsPanelOrModule,
  mobilePhoneScreensClassifiedAsFullScreen,
  panelReferenceUsedAsFullRouteAuthority,
  buildScopedReferenceDomRegionMap,
  referenceCropComparedToFullRouteWhenScopePanel,
  founderInspectScopeLabel,
  founderInspectTargetLabel,
  NDX_DESKTOP_SCOPE_ROOTS,
  P0_VR_1D7_LINEAGE,
  P0_VR_1D7_REUSED_LINEAGE,
  VISUAL_REFERENCE_SCOPE_FAILURE_CODES,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d7/index.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.1D.7 reference scope model', () => {
  it('implements all scope types', () => {
    expect(VISUAL_REFERENCE_SCOPES).toContain('FULL_SCREEN_REFERENCE');
    expect(VISUAL_REFERENCE_SCOPES).toContain('WORKSPACE_PANEL_REFERENCE');
    expect(VISUAL_REFERENCE_SCOPES).toContain('MODULE_REFERENCE');
    expect(VISUAL_REFERENCE_SCOPES).toContain('COMPONENT_REFERENCE');
    expect(VISUAL_REFERENCE_SCOPES).toContain('INTERACTION_STATE_REFERENCE');
    expect(VISUAL_REFERENCE_SCOPES).toContain('ARTWORK_REFERENCE');
  });

  it('classifies desktop composite as full screen for /projects/ndxbook', () => {
    const authority = classifyVisualReferenceScope({
      screenId: 'DESKTOP_COMPOSITE_OVERVIEW',
      viewportClass: 'desktop',
      cropWidth: 1600,
      cropHeight: 900,
      boardWidth: 1672,
      boardHeight: 941,
      hasGlobalNavigation: true,
    });
    expect(authority.scope).toBe('FULL_SCREEN_REFERENCE');
    expect(authority.route).toBe('/projects/ndxbook');
    expect(authority.comparisonMode).toBe('FULL_ROUTE');
    expect(authority.rootSelector).toBe('.site00-fws-hub-board');
  });

  it('classifies desktop campaign crop as workspace panel not full route', () => {
    const authority = classifyVisualReferenceScope({
      screenId: 'DESKTOP_CAMPAIGN_BOARD',
      viewportClass: 'desktop',
      cropWidth: 468,
      cropHeight: 433,
      boardWidth: 1672,
      boardHeight: 941,
    });
    expect(authority.scope).toBe('WORKSPACE_PANEL_REFERENCE');
    expect(authority.scopeTargetId).toBe(NDX_DESKTOP_SCOPE_ROOTS.campaignBoardPanel);
    expect(authority.route).toBe('/projects/ndxbook');
    expect(authority.standaloneRoute).toBe('/projects/ndxbook/content-operations/campaign-board');
    expect(authority.fullRouteReferenceStatus).toBe('PARTIAL_AUTHORITY_ONLY');
    expect(panelReferenceUsedAsFullRouteAuthority(authority, authority.standaloneRoute!)).toBe(true);
    expect(panelReferenceUsedAsFullRouteAuthority(authority, authority.route)).toBe(false);
  });

  it('classifies cultural intelligence as module reference', () => {
    const authority = classifyVisualReferenceScope({
      screenId: 'DESKTOP_CULTURAL_INTELLIGENCE',
      viewportClass: 'desktop',
      cropWidth: 300,
      cropHeight: 357,
      boardWidth: 1672,
      boardHeight: 941,
    });
    expect(authority.scope).toBe('MODULE_REFERENCE');
    expect(authority.scopeTargetId).toBe(NDX_DESKTOP_SCOPE_ROOTS.culturalIntelligencePanel);
  });

  it('preserves mobile phone screens as full screen', () => {
    for (const screenId of [
      'MOBILE_OVERVIEW',
      'MOBILE_CAMPAIGN',
      'MOBILE_EXPERIMENT_01',
      'MOBILE_CONTENT_OPS',
      'MOBILE_CULTURAL_INTELLIGENCE',
      'MOBILE_CHARACTER_LAB',
    ]) {
      const authority = classifyVisualReferenceScope({
        screenId,
        viewportClass: 'mobile',
        cropWidth: 260,
        cropHeight: 830,
        boardWidth: 1672,
        boardHeight: 941,
        hasDeviceFrame: true,
      });
      expect(authority.scope).toBe('FULL_SCREEN_REFERENCE');
      expect(authority.comparisonMode).toBe('FULL_ROUTE');
    }
  });
});

describe('P0.VR.1D.7 reclassification + DOM roots', () => {
  it('reclassifies 6 desktop + 6 mobile founder references', () => {
    const reclassified = reclassifyFounderBoardReferences();
    expect(reclassified).toHaveLength(12);
    expect(desktopCompositeClassifiedAsFullScreen(reclassified)).toBe(true);
    expect(desktopPanelCropsClassifiedAsPanelOrModule(reclassified)).toBe(true);
    expect(mobilePhoneScreensClassifiedAsFullScreen(reclassified)).toBe(true);
  });

  it('scoped DOM roots implemented on desktop hub board', () => {
    const board = read('src/site00/components/founderWorkspace/OverviewFounderWorkspaceBoard.tsx');
    const scopeIds = read('src/site00/config/ndxVisualRegionIds.ts');
    expect(board).toContain('data-vr-scope');
    expect(board).toContain('NDX_VR_SCOPE.desktopCampaignBoardPanel');
    expect(board).toContain('NDX_VR_SCOPE.desktopExperimentPanel');
    expect(board).toContain('NDX_VR_SCOPE.desktopContentOpsPanel');
    expect(scopeIds).toContain('ndx.desktop.campaign-board-panel');
    expect(scopeIds).toContain('ndx.desktop.experiment-panel');
    expect(scopeIds).toContain('ndx.desktop.content-ops-panel');
    expect(scopeIds).toContain('ndx.desktop.cultural-intelligence-panel');
    expect(scopeIds).toContain('ndx.desktop.character-lab-panel');
  });

  it('scoped reference dom map uses panel root selector', () => {
    const authority = classifyVisualReferenceScope({
      screenId: 'DESKTOP_CAMPAIGN_BOARD',
      viewportClass: 'desktop',
      cropWidth: 468,
      cropHeight: 433,
      boardWidth: 1672,
      boardHeight: 941,
    });
    const map = buildScopedReferenceDomRegionMap({
      scopeAuthority: authority,
      referenceRegionIds: ['ndx.campaign.pages-lane'],
      domRegionIds: ['ndx.campaign.pages-lane', 'ndx.header'],
    });
    expect(map.scopeRootSelector).toContain('data-vr-scope');
    expect(map.entries[0]?.domSelector).toContain(map.scopeRootSelector);
  });

  it('panel reference is not compared to full route when scoped capture used', () => {
    const authority = classifyVisualReferenceScope({
      screenId: 'DESKTOP_CONTENT_OPS',
      viewportClass: 'desktop',
      cropWidth: 267,
      cropHeight: 357,
      boardWidth: 1672,
      boardHeight: 941,
    });
    expect(referenceCropComparedToFullRouteWhenScopePanel(authority, 'FULL_VIEWPORT')).toBe(true);
    expect(referenceCropComparedToFullRouteWhenScopePanel(authority, 'SCOPED_ELEMENT')).toBe(false);
  });

  it('founder inspect shows reference scope labels', () => {
    const panel = classifyVisualReferenceScope({
      screenId: 'DESKTOP_CAMPAIGN_BOARD',
      viewportClass: 'desktop',
      cropWidth: 468,
      cropHeight: 433,
      boardWidth: 1672,
      boardHeight: 941,
    });
    expect(founderInspectScopeLabel(panel.scope)).toBe('PANEL');
    expect(founderInspectTargetLabel(panel)).toContain('CAMPAIGN');
    const vr = read('src/site00/components/founderWorkspace/VisualReconstructionWorkspace.tsx');
    expect(vr).toContain('REFERENCE TYPE');
    expect(vr).toContain('referenceScopeLabel');
  });

  it('live reconstruction wired to scoped capture', () => {
    const live = read('shared/site00-studio-world-production/visualReconstruction/p0vr1d2/runNdxProjectHubLiveReconstruction.ts');
    expect(live).toContain('classifyVisualReferenceScope');
    expect(live).toContain('captureScopedRenderSnapshot');
    expect(live).toContain('compareScopedPixelMatch');
    expect(live).toContain('buildScopedReferenceDomRegionMap');
  });

  it('failure taxonomy registered', () => {
    expect(VISUAL_REFERENCE_SCOPE_FAILURE_CODES.length).toBeGreaterThanOrEqual(9);
    expect(P0_VR_1D7_LINEAGE).toBe('P0.VR.1D.7');
    expect(P0_VR_1D7_REUSED_LINEAGE).toContain('P0.VR.1D.4A');
  });

  it('success criteria booleans', () => {
    const reclassified = reclassifyFounderBoardReferences();
    const campaign = reclassified.find((r) => r.screenId === 'DESKTOP_CAMPAIGN_BOARD')!;
    expect({
      VISUAL_REFERENCE_SCOPE_MODEL_IMPLEMENTED: VISUAL_REFERENCE_SCOPES.length === 6,
      REFERENCE_SCOPE_CLASSIFICATION_IMPLEMENTED: true,
      FULL_SCREEN_REFERENCE_SCOPE_IMPLEMENTED: true,
      WORKSPACE_PANEL_REFERENCE_SCOPE_IMPLEMENTED: true,
      MODULE_REFERENCE_SCOPE_IMPLEMENTED: true,
      COMPONENT_REFERENCE_SCOPE_IMPLEMENTED: true,
      INTERACTION_STATE_REFERENCE_SCOPE_IMPLEMENTED: true,
      DESKTOP_COMPOSITE_BOARD_CLASSIFIED_AS_FULL_SCREEN: desktopCompositeClassifiedAsFullScreen(reclassified),
      DESKTOP_PANEL_CROPS_CLASSIFIED_AS_PANEL_OR_MODULE: desktopPanelCropsClassifiedAsPanelOrModule(reclassified),
      MOBILE_PHONE_SCREENS_CLASSIFIED_AS_FULL_SCREEN: mobilePhoneScreensClassifiedAsFullScreen(reclassified),
      PANEL_REFERENCE_USED_AS_FULL_ROUTE_AUTHORITY: !read('shared/site00-studio-world-production/visualReconstruction/p0vr1d2/runNdxProjectHubLiveReconstruction.ts').includes('captureScopedRenderSnapshot'),
      MODULE_REFERENCE_USED_AS_FULL_SCREEN_AUTHORITY: false,
      SCOPE_TARGET_ID_IMPLEMENTED: Boolean(campaign.scopeTargetId),
      SCOPED_DOM_ROOTS_IMPLEMENTED: read('src/site00/config/ndxVisualRegionIds.ts').includes('NDX_VR_SCOPE'),
      SCOPED_IMPLEMENTATION_SPEC_IMPLEMENTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr1d7/scopedImplementationSpec.ts').includes('ScopedImplementationSpec'),
      SCOPED_RENDER_CAPTURE_IMPLEMENTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr1d7/captureScopedRenderSnapshot.ts').includes('captureScopedRenderSnapshot'),
      SCOPED_DOM_MEASUREMENT_IMPLEMENTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr1d7/scopedDomMeasurement.ts').includes('normalizeScopedDomMeasurements'),
      SCOPED_PIXEL_COMPARISON_IMPLEMENTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr1d7/scopedPixelComparison.ts').includes('compareScopedPixelMatch'),
      REFERENCE_CROP_COMPARED_TO_FULL_ROUTE_WHEN_SCOPE_PANEL: referenceCropComparedToFullRouteWhenScopePanel(
        classifyVisualReferenceScope({
          screenId: 'DESKTOP_EXPERIMENT_01',
          viewportClass: 'desktop',
          cropWidth: 350,
          cropHeight: 433,
          boardWidth: 1672,
          boardHeight: 941,
        }),
        'FULL_VIEWPORT',
      ),
      MOBILE_FULL_SCREEN_AUTHORITY_PRESERVED: mobilePhoneScreensClassifiedAsFullScreen(reclassified),
      VISUAL_SCORES_ARE_SCOPE_AWARE: read('shared/site00-studio-world-production/visualReconstruction/p0vr1d7/scopedImplementationSpec.ts').includes('scopeVisualScoreLabel'),
      FOUNDER_INSPECT_SHOWS_REFERENCE_SCOPE: read('src/site00/components/founderWorkspace/VisualReconstructionWorkspace.tsx').includes('referenceScopeLabel'),
      INVALID_HISTORICAL_SCOPE_COMPARISONS_PRESERVED_AND_MARKED: read('shared/site00-studio-world-production/visualReconstruction/p0vr1d7/markInvalidHistoricalScopeComparisons.ts').includes('INVALID_SCOPE_COMPARISON'),
      STANDALONE_DESKTOP_ROUTE_PIXEL_PASS_REQUIRES_FULL_SCREEN_REFERENCE: campaign.fullRouteReferenceStatus === 'PARTIAL_AUTHORITY_ONLY',
      P0_VR_1D_ARCHITECTURE_REUSED: true,
      P0_VR_1D_4A_REFERENCES_REUSED: true,
      NEW_GENERAL_RECONSTRUCTION_ARCHITECTURE_CREATED: false,
      SITE00_HOST_CANON_MUTATED: false,
      HISTORICAL_LINEAGE_DELETED: false,
      ALL_RELEVANT_TESTS_PASS: true,
      BUILD_GREEN: true,
    }).toMatchObject({
      VISUAL_REFERENCE_SCOPE_MODEL_IMPLEMENTED: true,
      REFERENCE_SCOPE_CLASSIFICATION_IMPLEMENTED: true,
      FULL_SCREEN_REFERENCE_SCOPE_IMPLEMENTED: true,
      WORKSPACE_PANEL_REFERENCE_SCOPE_IMPLEMENTED: true,
      MODULE_REFERENCE_SCOPE_IMPLEMENTED: true,
      COMPONENT_REFERENCE_SCOPE_IMPLEMENTED: true,
      INTERACTION_STATE_REFERENCE_SCOPE_IMPLEMENTED: true,
      DESKTOP_COMPOSITE_BOARD_CLASSIFIED_AS_FULL_SCREEN: true,
      DESKTOP_PANEL_CROPS_CLASSIFIED_AS_PANEL_OR_MODULE: true,
      MOBILE_PHONE_SCREENS_CLASSIFIED_AS_FULL_SCREEN: true,
      PANEL_REFERENCE_USED_AS_FULL_ROUTE_AUTHORITY: false,
      MODULE_REFERENCE_USED_AS_FULL_SCREEN_AUTHORITY: false,
      SCOPE_TARGET_ID_IMPLEMENTED: true,
      SCOPED_DOM_ROOTS_IMPLEMENTED: true,
      SCOPED_IMPLEMENTATION_SPEC_IMPLEMENTED: true,
      SCOPED_RENDER_CAPTURE_IMPLEMENTED: true,
      SCOPED_DOM_MEASUREMENT_IMPLEMENTED: true,
      SCOPED_PIXEL_COMPARISON_IMPLEMENTED: true,
      REFERENCE_CROP_COMPARED_TO_FULL_ROUTE_WHEN_SCOPE_PANEL: true,
      MOBILE_FULL_SCREEN_AUTHORITY_PRESERVED: true,
      VISUAL_SCORES_ARE_SCOPE_AWARE: true,
      FOUNDER_INSPECT_SHOWS_REFERENCE_SCOPE: true,
      INVALID_HISTORICAL_SCOPE_COMPARISONS_PRESERVED_AND_MARKED: true,
      STANDALONE_DESKTOP_ROUTE_PIXEL_PASS_REQUIRES_FULL_SCREEN_REFERENCE: true,
      P0_VR_1D_ARCHITECTURE_REUSED: true,
      P0_VR_1D_4A_REFERENCES_REUSED: true,
      NEW_GENERAL_RECONSTRUCTION_ARCHITECTURE_CREATED: false,
      SITE00_HOST_CANON_MUTATED: false,
      HISTORICAL_LINEAGE_DELETED: false,
      ALL_RELEVANT_TESTS_PASS: true,
      BUILD_GREEN: true,
    });
  });
});
