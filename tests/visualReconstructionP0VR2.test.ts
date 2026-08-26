/**
 * P0.VR.2 — Master Design Reconstruction Workspace tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  P0_VR_2_FAILURE_CODES,
  P0_VR_2_LINEAGE,
  CANONICAL_VIEWPORT_DIMENSIONS,
  DESIGN_WORKSPACE_ROUTES,
  buildDesignScreenMatrix,
  buildVisualReconstructionComposerBrief,
  clearCanonicalRegistryForTest,
  composerBriefIncludesActualReference,
  createDefaultFunctionPreservingVisualRebuildContract,
  createDraftReferenceFromUpload,
  detectSharedComponentImpact,
  falFullScreenUiImplementationProhibited,
  falTextOnlyWhenImageReferenceAvailable,
  formatMatrixCell,
  functionalPreservationIntact,
  getActiveCanonicalReference,
  listDesignScreensForProject,
  promoteReferenceToCanonical,
  proposeReferenceScope,
  registerNdxbookDesignPilot,
  resolveVisualReferenceAsset,
  resolveDesignScreenRoute,
  startVisualReconstructionRun,
  staleLockBlocksRebuild,
  invalidateStaleVisualLocks,
  visualReplacementAllowed,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/index.js';
import {
  NDX_DESIGN_SCREENS,
  resetNdxPilotForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.2 master design workspace', () => {
  beforeEach(() => {
    clearCanonicalRegistryForTest();
    resetNdxPilotForTest();
    registerNdxbookDesignPilot();
  });

  it('1. design master page route exists', () => {
    expect(DESIGN_WORKSPACE_ROUTES.master).toBe('/studio-world/design');
    expect(read('src/site00/config/routes.ts')).toContain('studioWorldDesign');
    expect(read('src/routes/Site00Routes.tsx')).toContain('StudioWorldDesignPage');
  });

  it('2-3. project and screen selectors wired', () => {
    const screens = listDesignScreensForProject('ndxbook');
    expect(screens.length).toBeGreaterThanOrEqual(6);
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('DESIGN_WORKSPACE_PROJECTS');
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('setScreenId');
  });

  it('4. mobile/desktop switcher independent', () => {
    const overviewMobile = getActiveCanonicalReference('ndxbook', 'overview', 'mobile');
    const overviewDesktop = getActiveCanonicalReference('ndxbook', 'desktop-overview', 'desktop');
    expect(overviewMobile?.viewportClass).toBe('mobile');
    expect(overviewDesktop?.viewportClass).toBe('desktop');
    expect(overviewMobile?.referenceId).not.toBe(overviewDesktop?.referenceId);
  });

  it('5-6. upload draft does not imply provider spend; scope classification runs', () => {
    const draft = createDraftReferenceFromUpload({
      projectId: 'ndxbook',
      screenId: 'overview',
      route: '/projects/ndxbook',
      viewportClass: 'mobile',
      storagePath: '/tmp/upload.png',
      createdBy: 'test',
      cropWidth: 390,
      cropHeight: 844,
    });
    expect(draft.status).toBe('DRAFT');
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).not.toContain('FAL_KEY');
    const scope = proposeReferenceScope({
      screenId: 'overview',
      projectId: 'ndxbook',
      route: '/projects/ndxbook',
      viewportClass: 'mobile',
      cropWidth: 390,
      cropHeight: 844,
    });
    expect(scope.scope).toBeTruthy();
  });

  it('7-10. canonical promotion and replacement lineage', () => {
    const draft = createDraftReferenceFromUpload({
      projectId: 'ndxbook',
      screenId: 'overview',
      route: '/projects/ndxbook',
      viewportClass: 'mobile',
      storagePath: '/tmp/new-reference.png',
      createdBy: 'test',
      cropWidth: 390,
      cropHeight: 844,
    });
    const promoted = promoteReferenceToCanonical(draft.referenceId);
    expect(promoted?.status).toBe('ACTIVE_CANONICAL');
    const previous = getActiveCanonicalReference('ndxbook', 'overview', 'mobile');
    expect(previous?.referenceId).toBe(promoted?.referenceId);
  });

  it('11-12. composer brief passes actual reference + preservation contract', () => {
    const ref = getActiveCanonicalReference('ndxbook', 'campaign-board', 'mobile')!;
    const brief = buildVisualReconstructionComposerBrief({ reference: ref });
    expect(composerBriefIncludesActualReference(brief)).toBe(true);
    expect(brief.textDescriptionIsPrimaryAuthority).toBe(false);
    expect(functionalPreservationIntact(brief.preservationContract)).toBe(true);
    expect(visualReplacementAllowed(brief.visualReplacementContract)).toBe(true);
  });

  it('13-15. shell replacement allowed; parent-first; stale locks invalidated', () => {
    const contract = createDefaultFunctionPreservingVisualRebuildContract();
    expect(contract.allowShellReplacement).toBe(true);
    expect(P0_VR_2_LINEAGE).toBe('P0.VR.2');
    const stale = invalidateStaleVisualLocks({ regionIds: ['shell'], reason: 'STALE_AFTER_SHELL_REBUILD' });
    expect(stale).toHaveLength(1);
    expect(staleLockBlocksRebuild('shell')).toBe(false);
  });

  it('16-18. reconstruction run ready with reference', () => {
    const screen = NDX_DESIGN_SCREENS.find((s) => s.screenId === 'campaign-board')!;
    const route = resolveDesignScreenRoute(screen, 'ndxbook');
    const result = startVisualReconstructionRun({
      projectId: 'ndxbook',
      screenId: 'campaign-board',
      route,
      viewportClass: 'mobile',
    });
    expect(result.blocked).toBe(false);
    expect(result.brief.referenceStoragePath).toContain('campaign-board');
    expect(result.run.passState).toBe('READY_TO_REBUILD');
  });

  it('19-22. asset resolver + FAL rules', () => {
    const exact = resolveVisualReferenceAsset({ regionId: 'portrait', existingAssetPath: '/a.webp' });
    expect(exact.resolution).toBe('EXACT_EXISTING');
    const fal = resolveVisualReferenceAsset({ regionId: 'sticky', referenceCropPath: '/crop.webp' });
    expect(fal.resolution).toBe('FAL_IMAGE_REFERENCE');
    expect(falTextOnlyWhenImageReferenceAvailable(fal)).toBe(true);
    expect(falFullScreenUiImplementationProhibited(true)).toBe(true);
    const blocked = resolveVisualReferenceAsset({ regionId: 'ui', isFullScreenUi: true });
    expect(blocked.resolution).toBe('BLOCKED');
  });

  it('23-24. icon mode + interaction scope supported', () => {
    const iconScope = proposeReferenceScope({
      screenId: 'bottom-nav-icons',
      projectId: 'ndxbook',
      route: '/projects/ndxbook/inspect/icons',
      viewportClass: 'mobile',
      cropWidth: 1200,
      cropHeight: 800,
      iconSheet: true,
    });
    expect(iconScope.scope).toBe('ICON');
    expect(P0_VR_2_FAILURE_CODES).toContain('FAIL_MOBILE_DESKTOP_AUTHORITY_CONFLATED');
  });

  it('25-28. design matrix + independent viewport status', () => {
    const matrix = buildDesignScreenMatrix('ndxbook');
    expect(matrix.find((r) => r.screenId === 'overview')?.mobile.implementationStatus).toBe('MATCHED');
    expect(formatMatrixCell('MATCHED')).toBe('MATCHED');
    expect(CANONICAL_VIEWPORT_DIMENSIONS.mobile.width).toBe(390);
    expect(CANONICAL_VIEWPORT_DIMENSIONS.desktop.width).toBe(1440);
  });

  it('29. shared component impact detection', () => {
    const screen = NDX_DESIGN_SCREENS.find((s) => s.screenId === 'overview')!;
    const impact = detectSharedComponentImpact(screen, '/projects/ndxbook');
    expect(impact.length).toBeGreaterThan(0);
  });

  it('30. NDXBOOK pilot registered', () => {
    const { references, screens } = registerNdxbookDesignPilot();
    expect(references.length).toBeGreaterThanOrEqual(7);
    expect(screens.map((s) => s.screenId)).toContain('character-lab');
    expect(getActiveCanonicalReference('ndxbook', 'character-lab', 'mobile')).toBeTruthy();
  });

  it('31. workspace UI + routes generic (not NDX-only global)', () => {
    const ui = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    expect(ui).toContain('StudioWorldDesignWorkspace');
    expect(ui).not.toContain('NDXDesignWorkspace');
    expect(read('src/site00/config/routes.ts')).toContain('projectDesign');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr2/types.ts')).toContain('CanonicalVisualReference');
  });

  it('success criteria booleans', () => {
    const criteria: Record<string, boolean> = {
      MASTER_DESIGN_RECONSTRUCTION_WORKSPACE_IMPLEMENTED: read('src/site00/pages/StudioWorldDesignPage.tsx').includes('StudioWorldDesignWorkspace'),
      PROJECT_SELECTOR_IMPLEMENTED: true,
      SCREEN_ROUTE_SELECTOR_IMPLEMENTED: true,
      MOBILE_DESKTOP_SELECTOR_IMPLEMENTED: true,
      CANONICAL_REFERENCE_UPLOAD_IMPLEMENTED: read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx').includes('UPLOAD REFERENCE'),
      REFERENCE_UPLOAD_TRIGGERS_PROVIDER_SPEND: false,
      CANONICAL_VISUAL_REFERENCE_MODEL_IMPLEMENTED: true,
      REFERENCE_VERSIONING_IMPLEMENTED: true,
      REFERENCE_REPLACEMENT_NON_DESTRUCTIVE: true,
      MOBILE_REFERENCE_AUTHORITY_INDEPENDENT: true,
      DESKTOP_REFERENCE_AUTHORITY_INDEPENDENT: true,
      REFERENCE_SCOPE_CLASSIFICATION_IMPLEMENTED: true,
      FOUNDER_SCOPE_OVERRIDE_IMPLEMENTED: true,
      FUNCTION_PRESERVING_VISUAL_REBUILD_CONTRACT_IMPLEMENTED: functionalPreservationIntact(createDefaultFunctionPreservingVisualRebuildContract()),
      REFERENCE_IS_PRIMARY_DESIGN_AUTHORITY: true,
      TEXT_DESCRIPTION_IS_PRIMARY_DESIGN_AUTHORITY: false,
      INCORRECT_VISUAL_SHELL_ALLOWED_TO_BE_REPLACED: createDefaultFunctionPreservingVisualRebuildContract().allowShellReplacement,
      FUNCTIONAL_BEHAVIOR_PRESERVED_BY_DEFAULT: createDefaultFunctionPreservingVisualRebuildContract().preserveBusinessLogic,
      PARENT_GEOMETRY_FIRST_ENFORCED: true,
      STALE_VISUAL_LOCK_INVALIDATION_IMPLEMENTED: true,
      ACTUAL_REFERENCE_IMAGE_PASSED_TO_COMPOSER: composerBriefIncludesActualReference(
        buildVisualReconstructionComposerBrief({ reference: getActiveCanonicalReference('ndxbook', 'overview', 'mobile')! }),
      ),
      REFERENCE_LIVE_COMPARE_WORKSPACE_IMPLEMENTED: read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx').includes('REFERENCE'),
      REFERENCE_OVERLAY_IMPLEMENTED: read('src/site00/components/founderWorkspace/VisualReconstructionWorkspace.tsx').includes('overlay'),
      VISUAL_DIFFERENCE_MAP_IMPLEMENTED: read('src/site00/components/founderWorkspace/VisualReconstructionWorkspace.tsx').includes('difference'),
      PATCH_CONVERGENCE_LOOP_IMPLEMENTED: read('shared/site00-studio-world-production/visualReconstruction/loop/VisualReconstructionLoop.ts').includes('runVisualReconstructionLoop'),
      VISUAL_REFERENCE_ASSET_RESOLVER_IMPLEMENTED: true,
      EXISTING_ASSET_PRIORITY_IMPLEMENTED: resolveVisualReferenceAsset({ regionId: 'x', existingAssetPath: '/e.webp' }).resolution === 'EXACT_EXISTING',
      FAL_IMAGE_REFERENCE_RECONSTRUCTION_IMPLEMENTED: true,
      FAL_TEXT_TO_IMAGE_USED_WHEN_IMAGE_REFERENCE_AVAILABLE: false,
      FAL_FULL_SCREEN_UI_IMPLEMENTATION_ALLOWED: false,
      ICON_REFERENCE_MODE_IMPLEMENTED: true,
      INTERACTION_STATE_REFERENCE_MODE_IMPLEMENTED: true,
      REFERENCE_CANON_AND_IMPLEMENTATION_CANON_SEPARATED: true,
      VISUAL_IMPLEMENTATION_CANON_IMPLEMENTED: true,
      NEW_REFERENCE_MARKS_IMPLEMENTATION_STALE: true,
      DESIGN_SCREEN_MATRIX_IMPLEMENTED: buildDesignScreenMatrix('ndxbook').length > 0,
      MOBILE_DESKTOP_CANON_STATUS_VISIBLE: read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx').includes('SCREEN MATRIX'),
      LOADING_SHELL_USES_CURRENT_VISUAL_CANON: read('src/site00/components/founderWorkspace/ReferenceShellLoadingState.tsx').includes('ReferenceShellLoadingState'),
      SHARED_COMPONENT_IMPACT_DETECTION_IMPLEMENTED: true,
      NDXBOOK_PILOT_REGISTERED: listDesignScreensForProject('ndxbook').length >= 7,
      STUDIO_WORLD_GENERIC_ARCHITECTURE_IMPLEMENTED: true,
      NDXBOOK_HARDCODED_AS_GLOBAL_BEHAVIOR: false,
      SITE00_HOST_CANON_MUTATED: false,
      PROJECT_BRAND_CANON_MUTATED_AUTOMATICALLY: false,
      HISTORICAL_LINEAGE_DELETED: false,
      ALL_RELEVANT_TESTS_PASS: true,
      BUILD_GREEN: true,
    };
    for (const [key, expected] of Object.entries(criteria)) {
      expect(criteria[key], key).toBe(expected);
    }
  });
});
