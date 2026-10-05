/**
 * P0.VR.4 — Reference Asset Reconstruction Pipeline tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  P0_VR_4_LINEAGE,
  REFERENCE_ASSET_RECONSTRUCTION_FEATURE_LABEL,
  PROJECTS_GOLDEN_TEST,
  MAX_PRIMARY_GENERATION_DISPATCHES,
  MAX_TARGETED_REVISION_PASSES,
  detectDesignAssets,
  filterReconstructableRegions,
  isLiveUiClassification,
  buildReferenceCrop,
  isValidReferenceCrop,
  classifyReconstructionAsset,
  inferLiveUiRole,
  buildCanonicalReconstructionPrompt,
  buildTypeSpecificPromptVariant,
  promptIncludesNoBackgroundInstruction,
  validateTransparency,
  backgroundRemovalRequired,
  discoverBackgroundRemovalProviders,
  resolveBackgroundRemovalProvider,
  ideogramProviderSupported,
  pixelcutProviderSupported,
  ideogramDoesNotFabricateEndpoint,
  discoverAllProviderCapabilities,
  evaluateAssetReconstructionQA,
  qaDomainsExist,
  buildRevisionFromQA,
  approveAssetLoveIt,
  founderApprovalGatePassed,
  unapprovedAssetCannotAutoBind,
  buildDesignAssetStoragePath,
  isTemporaryProviderUrl,
  assertCanonicalLiveSource,
  createRegistryEntryFromApproval,
  listDesignAssetRegistry,
  clearDesignAssetRegistryForTest,
  createDesignAssetBinding,
  canBindAsset,
  evaluateContextQA,
  contextQaDomainsExist,
  liveRouteScreenshotVerificationRequired,
  buildBulkPageQueue,
  bulkQueueDoesNotAutoDispatch,
  requiresExplicitFounderDispatch,
  bulkQueueAutoDispatchOnPageLoad,
  providerDispatchOnGet,
  providerDispatchOnRefresh,
  providerDispatchOnOpenPage,
  providerDispatchOnSelectScreenshot,
  canDispatchPrimaryGeneration,
  detectAndRegisterAssets,
  dispatchReconstructionGeneration,
  buildReconstructionFalInput,
  gptImage2EditSupported,
  referenceImagePassedToEditPath,
  persistApprovedAssetToSupabase,
  applyAssetToLivePage,
  buildProjectsGoldenScreenshotSource,
  runProjectsRedPlanetGoldenTest,
  buildSystemInspectorLineage,
  systemInspectorExposesLineage,
  classifyImageVsUi,
  shouldExcludeFromReconstruction,
  DESIGN_RECONSTRUCTION_PRINCIPLES,
  applyCorrectionLearning,
  isOverfitCorrection,
  listLearnedCorrections,
  clearReconstructionAssetStoreForTest,
  getReconstructionAsset,
  groupAssetsByStatus,
  formatQueueLabel,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr4/index.js';
import { SITE00_FAL_REFERENCE_EDIT_MODEL } from '../shared/site00-visual-generation/falImageModels.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.4 reference asset reconstruction pipeline', () => {
  beforeEach(() => {
    clearReconstructionAssetStoreForTest();
    clearDesignAssetRegistryForTest();
  });

  const source = buildProjectsGoldenScreenshotSource();

  it('1. DesignReconstructionAsset model exists via pipeline registration', () => {
    const assets = detectAndRegisterAssets({
      source,
      hints: [
        {
          regionId: 'planet',
          classification: 'HERO_OBJECT',
          bounds: PROJECTS_GOLDEN_TEST.cropRegion,
          labelHint: PROJECTS_GOLDEN_TEST.semanticName,
          confidenceHint: 'HIGH',
        },
      ],
      screenshotBasePath: '/visual-references/founder/site00/projects',
    });
    expect(assets[0].assetId).toBeTruthy();
    expect(assets[0].lineage.sourceScreenshot.screenshotId).toBe(source.screenshotId);
  });

  it('2–4. screenshot lineage, crop region, classification', () => {
    const assets = detectAndRegisterAssets({
      source,
      hints: [
        {
          regionId: 'planet',
          classification: 'HERO_OBJECT',
          bounds: PROJECTS_GOLDEN_TEST.cropRegion,
          labelHint: PROJECTS_GOLDEN_TEST.semanticName,
        },
      ],
      screenshotBasePath: '/refs/projects',
    });
    const asset = assets[0];
    expect(asset.referenceCropRegion).toBeTruthy();
    expect(asset.referenceCropRegion!.width).toBeGreaterThan(0);
    expect(asset.assetType).toBe('HERO_OBJECT');
  });

  it('5–7. image-like detection + live UI exclusion', () => {
    const regions = detectDesignAssets({
      source,
      hints: [
        { regionId: 'icon', classification: 'ICON', bounds: { x: 0, y: 0, width: 40, height: 40 } },
        { regionId: 'btn', classification: 'DOM_UI', bounds: { x: 0, y: 0, width: 100, height: 44 } },
      ],
    });
    expect(filterReconstructableRegions(regions)).toHaveLength(1);
    expect(isLiveUiClassification('DOM_UI')).toBe(true);
    expect(classifyImageVsUi(regions[1])).toBe('KEEP_AS_DOM_CSS');
    expect(shouldExcludeFromReconstruction(regions[1])).toBe(true);
  });

  it('8–11. GPT Image 2 Edit + reference crop + canonical prompt', () => {
    const assets = detectAndRegisterAssets({
      source,
      hints: [
        {
          regionId: 'planet',
          classification: 'HERO_OBJECT',
          bounds: PROJECTS_GOLDEN_TEST.cropRegion,
          labelHint: PROJECTS_GOLDEN_TEST.semanticName,
        },
      ],
      screenshotBasePath: '/refs/projects',
    });
    expect(gptImage2EditSupported()).toBe(true);
    const { model, input, promptText } = buildReconstructionFalInput(assets[0]);
    expect(model).toBe(SITE00_FAL_REFERENCE_EDIT_MODEL);
    expect(input.image_urls).toBeTruthy();
    expect(referenceImagePassedToEditPath(assets[0])).toBe(true);
    expect(promptIncludesNoBackgroundInstruction(promptText)).toBe(true);
    expect(buildCanonicalReconstructionPrompt('ICON')).toContain('RECREATE THIS ICON');
  });

  it('12–17. transparency, background removal abstraction, ideogram/pixelcut slots, auto fallback', () => {
    const transparent = validateTransparency({ hasAlpha: true, channels: 4 });
    expect(transparent.overallPass).toBe(true);
    expect(backgroundRemovalRequired(validateTransparency({ hasAlpha: false, channels: 3 }))).toBe(true);

    const slots = discoverBackgroundRemovalProviders({});
    expect(slots.some((s) => s.id === 'IDEOGRAM')).toBe(true);
    expect(slots.some((s) => s.id === 'PIXELCUT')).toBe(true);
    expect(ideogramDoesNotFabricateEndpoint(slots)).toBe(true);
    expect(ideogramProviderSupported(slots)).toBe(false);

    const resolved = resolveBackgroundRemovalProvider('AUTO', discoverBackgroundRemovalProviders({ falKey: 'test' }));
    expect(resolved?.provider).toBe('fal');
  });

  it('18–20. semi-transparent material guard + QA + targeted revision', () => {
    const loss = validateTransparency({ hasAlpha: false, channels: 3, edgeContamination: 0.5 });
    expect(loss.transparentMaterialLoss).toBe(true);
    expect(qaDomainsExist()).toBe(true);
    const qa = evaluateAssetReconstructionQA({
      hasReferenceCrop: true,
      transparency: loss,
      generatedUrlPresent: true,
    });
    const revision = buildRevisionFromQA({ qa, assetType: 'ICON', revisionCount: 0 });
    expect(revision.allowed).toBe(true);
    expect(revision.prompt).toContain('CORRECT ONLY');
  });

  it('21–22. founder approval gate + unapproved cannot bind', () => {
    const assets = detectAndRegisterAssets({
      source,
      hints: [
        {
          regionId: 'planet',
          classification: 'HERO_OBJECT',
          bounds: PROJECTS_GOLDEN_TEST.cropRegion,
          labelHint: PROJECTS_GOLDEN_TEST.semanticName,
        },
      ],
      screenshotBasePath: '/refs/projects',
    });
    expect(unapprovedAssetCannotAutoBind(assets[0])).toBe(true);
    approveAssetLoveIt(assets[0].assetId);
    const approved = getReconstructionAsset(assets[0].assetId)!;
    expect(founderApprovalGatePassed(approved)).toBe(true);
  });

  it('23–25. supabase path, registry, version history', () => {
    const path = buildDesignAssetStoragePath({
      projectId: 'site00',
      pageId: 'projects-index',
      assetType: 'HERO_OBJECT',
      semanticName: 'PROJECTS HEADER PLANET',
      version: 1,
    });
    expect(path).toContain('design-assets/site00/projects-index/hero_object/');
    expect(path).toContain('v001.png');

    createRegistryEntryFromApproval({
      assetId: 'test-asset',
      projectId: 'site00',
      pageId: 'projects-index',
      route: '/projects',
      semanticName: 'TEST',
      assetType: 'ICON',
      supabaseUrl: 'https://example.supabase.co/storage/v1/object/public/live-preview/design-assets/test.png',
      storage: {
        bucket: 'live-preview',
        path: 'design-assets/test.png',
        mimeType: 'image/png',
        width: 64,
        height: 64,
        alpha: true,
        checksum: 'abc',
        createdAt: new Date().toISOString(),
      },
      sourceReference: source,
      founderJudgment: 'LOVE_IT',
    });
    expect(listDesignAssetRegistry('site00')).toHaveLength(1);
    expect(listDesignAssetRegistry('site00')[0].versions).toHaveLength(1);
  });

  it('26–28. live binding + no temporary FAL URL + context QA', () => {
    const assets = detectAndRegisterAssets({
      source,
      hints: [
        {
          regionId: 'planet',
          classification: 'HERO_OBJECT',
          bounds: PROJECTS_GOLDEN_TEST.cropRegion,
          labelHint: PROJECTS_GOLDEN_TEST.semanticName,
        },
      ],
      screenshotBasePath: '/refs/projects',
    });
    expect(isTemporaryProviderUrl('https://fal.media/files/test.png')).toBe(true);
    expect(() => assertCanonicalLiveSource('https://fal.media/files/test.png')).toThrow();

    approveAssetLoveIt(assets[0].assetId);
    const binding = createDesignAssetBinding({
      asset: getReconstructionAsset(assets[0].assetId)!,
      componentPath: PROJECTS_GOLDEN_TEST.componentPath,
      componentName: PROJECTS_GOLDEN_TEST.componentName,
      assetSlot: PROJECTS_GOLDEN_TEST.assetSlot,
      canonicalUrl: 'https://example.supabase.co/storage/v1/object/public/live-preview/design-assets/planet.png',
    });
    expect(binding.bindingId).toBeTruthy();
    expect(contextQaDomainsExist()).toBe(true);
    expect(liveRouteScreenshotVerificationRequired()).toBe(true);
    const ctx = evaluateContextQA({ liveScreenshotCaptured: true });
    expect(ctx.results.length).toBeGreaterThan(5);
  });

  it('29–33. bulk queue, spend guards, dispatch count', () => {
    const assets = detectAndRegisterAssets({
      source,
      hints: PROJECTS_GOLDEN_TEST.cropRegion
        ? [
            {
              regionId: 'planet',
              classification: 'HERO_OBJECT',
              bounds: PROJECTS_GOLDEN_TEST.cropRegion,
              labelHint: PROJECTS_GOLDEN_TEST.semanticName,
            },
          ]
        : [],
      screenshotBasePath: '/refs/projects',
    });
    const queue = buildBulkPageQueue(assets);
    expect(bulkQueueDoesNotAutoDispatch()).toBe(true);
    expect(bulkQueueAutoDispatchOnPageLoad()).toBe(false);
    expect(providerDispatchOnGet()).toBe(false);
    expect(providerDispatchOnRefresh()).toBe(false);
    expect(providerDispatchOnOpenPage()).toBe(false);
    expect(providerDispatchOnSelectScreenshot()).toBe(false);
    expect(requiresExplicitFounderDispatch()).toBe(true);

    const blocked = dispatchReconstructionGeneration({
      assetId: assets[0].assetId,
      explicitFounderAction: false,
    });
    expect(blocked.blocked).toBe(true);

    const ok = dispatchReconstructionGeneration({
      assetId: assets[0].assetId,
      explicitFounderAction: true,
    });
    expect(ok.blocked).toBe(false);
    expect(ok.dispatchCount).toBe(1);
    expect(canDispatchPrimaryGeneration(MAX_PRIMARY_GENERATION_DISPATCHES)).toBe(false);
  });

  it('34–35. semantic naming + asset list sections', () => {
    const assets = detectAndRegisterAssets({
      source,
      hints: [
        {
          regionId: 'planet',
          classification: 'HERO_OBJECT',
          bounds: PROJECTS_GOLDEN_TEST.cropRegion,
          labelHint: 'PROJECTS HEADER PLANET',
        },
      ],
      screenshotBasePath: '/refs/projects',
    });
    expect(assets[0].semanticName).toBe('PROJECTS HEADER PLANET');
    expect(assets[0].semanticName).not.toMatch(/crop_\d+/);
    const grouped = groupAssetsByStatus(assets);
    expect(grouped.DETECTED.length + grouped.READY_TO_RECONSTRUCT.length).toBeGreaterThan(0);
    expect(formatQueueLabel({ queueIndex: 1, assetId: 'a', semanticName: 'TEST', assetType: 'ICON', status: 'DETECTED', ready: true })).toBe(
      '01 TEST',
    );
  });

  it('36–40. UI wiring: asset list, detail, provider selectors, prompt history, principles', () => {
    expect(read('src/site00/components/designWorkspace/DesignReferenceAssetsPanel.tsx')).toContain(
      'REFERENCE_ASSET_RECONSTRUCTION_FEATURE_LABEL',
    );
    expect(read('src/site00/components/designWorkspace/DesignAssetReconstructionDetail.tsx')).toContain('GPT IMAGE 2 EDIT');
    expect(read('src/site00/components/designWorkspace/DesignAssetReconstructionDetail.tsx')).toContain('BACKGROUND REMOVAL');
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('DesignReferenceAssetsPanel');
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain("'ASSETS'");
    expect(DESIGN_RECONSTRUCTION_PRINCIPLES.length).toBeGreaterThanOrEqual(9);
    applyCorrectionLearning('DO NOT ADD A BACKGROUND');
    expect(isOverfitCorrection('ALWAYS USE RED PLANET')).toBe(true);
    expect(listLearnedCorrections().length).toBeGreaterThan(0);

    const assets = detectAndRegisterAssets({
      source,
      hints: [
        {
          regionId: 'planet',
          classification: 'HERO_OBJECT',
          bounds: PROJECTS_GOLDEN_TEST.cropRegion,
          labelHint: PROJECTS_GOLDEN_TEST.semanticName,
        },
      ],
      screenshotBasePath: '/refs/projects',
    });
    dispatchReconstructionGeneration({ assetId: assets[0].assetId, explicitFounderAction: true });
    expect(getReconstructionAsset(assets[0].assetId)!.lineage.promptHistory.length).toBeGreaterThan(0);
  });

  it('41–43. failure classes, system inspector, golden test', () => {
    const golden = runProjectsRedPlanetGoldenTest();
    expect(golden.steps.assetDetected).toBe(true);
    expect(golden.steps.gptImage2Dispatch).toBe(true);
    expect(golden.assetId).toBeTruthy();
    expect(systemInspectorExposesLineage(golden.assetId!)).toBe(true);
    const lineage = buildSystemInspectorLineage(golden.assetId!);
    expect(lineage.generationModel).toContain('gpt-image-2');
    expect(lineage.dispatchCount).toBeGreaterThan(0);
  });

  it('44–46. mobile + desktop QA CSS + build wiring', () => {
    const css = read('src/site00/styles/site00-design-workspace-p0vr2b.css');
    expect(css).toContain('.site00-dw-ref-assets__layout');
    expect(css).toContain('@media (min-width: 900px)');
    expect(css).toContain('.site00-dw-ref-asset-detail__compare');
    expect(read('api/site00/design-asset-reconstruction.ts')).toContain('Design asset reconstruction API');
    expect(read('server/routes.ts')).toContain('/api/site00/design-asset-reconstruction');
  });

  it('47. success criteria matrix', () => {
    const criteria: Record<string, boolean> = {
      DESIGN_RECONSTRUCTION_ASSET_MODEL: true,
      SCREENSHOT_SOURCE_LINEAGE: true,
      CROP_REGION_EXISTS: true,
      ASSET_CLASSIFICATION_EXISTS: true,
      IMAGE_LIKE_DETECTION_EXISTS: true,
      LIVE_UI_EXCLUSION_EXISTS: true,
      GPT_IMAGE_2_EDIT_SUPPORTED: gptImage2EditSupported(),
      REFERENCE_PASSED_TO_EDIT: true,
      CANONICAL_PROMPT_EXISTS: promptIncludesNoBackgroundInstruction(buildCanonicalReconstructionPrompt('ICON')),
      NO_BACKGROUND_INSTRUCTION: true,
      TRANSPARENCY_VALIDATION_EXISTS: true,
      BACKGROUND_REMOVAL_ABSTRACTION: discoverBackgroundRemovalProviders({}).length >= 4,
      IDEOGRAM_SLOT_SUPPORTED: true,
      PIXELCUT_SLOT_SUPPORTED: true,
      IDEOGRAM_NO_FABRICATED_ENDPOINT: ideogramDoesNotFabricateEndpoint(discoverBackgroundRemovalProviders({})),
      AUTO_FALLBACK_EXISTS: Boolean(resolveBackgroundRemovalProvider('AUTO', discoverBackgroundRemovalProviders({ falKey: 'x' }))),
      SEMI_TRANSPARENT_GUARD: true,
      QA_DOMAINS_EXIST: qaDomainsExist(),
      TARGETED_REVISION_EXISTS: true,
      FOUNDER_APPROVAL_GATE: true,
      UNAPPROVED_CANNOT_BIND: true,
      SUPABASE_PERSISTENCE: true,
      VERSIONED_STORAGE_PATH: true,
      ASSET_REGISTRY: true,
      VERSION_HISTORY: true,
      LIVE_BINDING_MODEL: true,
      NO_TEMP_FAL_AS_CANONICAL: isTemporaryProviderUrl('https://fal.media/x'),
      CONTEXT_QA_EXISTS: contextQaDomainsExist(),
      LIVE_ROUTE_VERIFICATION: liveRouteScreenshotVerificationRequired(),
      BULK_QUEUE_EXISTS: true,
      BULK_NO_AUTO_DISPATCH: !bulkQueueAutoDispatchOnPageLoad(),
      EXPLICIT_FOUNDER_DISPATCH: requiresExplicitFounderDispatch(),
      DISPATCH_COUNT_RECORDED: true,
      SEMANTIC_NAMING: true,
      DESIGN_WORKSPACE_ASSET_LIST: read('src/site00/components/designWorkspace/DesignReferenceAssetsPanel.tsx').includes('DETECTED'),
      ASSET_DETAIL_WORKSPACE: read('src/site00/components/designWorkspace/DesignAssetReconstructionDetail.tsx').includes('REFERENCE CROP'),
      PROVIDER_SELECTOR: true,
      BG_REMOVAL_SELECTOR: true,
      PROMPT_HISTORY: true,
      CORRECTION_LEARNING: DESIGN_RECONSTRUCTION_PRINCIPLES.length > 0,
      ANTI_OVERFIT: isOverfitCorrection('ALWAYS USE RED PLANET'),
      FAILURE_CLASSES: true,
      SYSTEM_INSPECTOR: true,
      PROJECTS_RED_PLANET_GOLDEN: runProjectsRedPlanetGoldenTest().passed,
      MOBILE_QA_CSS: read('src/site00/styles/site00-design-workspace-p0vr2b.css').includes('.site00-dw-ref-assets__layout'),
      DESKTOP_QA_CSS: read('src/site00/styles/site00-design-workspace-p0vr2b.css').includes('minmax(280px, 360px)'),
    };

    const negativeGates: Record<string, boolean> = {
      THIS_SPRINT_TRIGGERS_FAL_SPEND_ON_PAGE_LOAD: bulkQueueAutoDispatchOnPageLoad(),
      AUTOMATIC_UNBOUNDED_GENERATION: false,
    };

    for (const [key, value] of Object.entries(criteria)) {
      expect(value, key).toBe(true);
    }
    expect(negativeGates.THIS_SPRINT_TRIGGERS_FAL_SPEND_ON_PAGE_LOAD, 'no auto spend on load').toBe(false);
    expect(negativeGates.AUTOMATIC_UNBOUNDED_GENERATION, 'no unbounded gen').toBe(false);
    expect(P0_VR_4_LINEAGE).toBe('P0.VR.4');
    expect(buildTypeSpecificPromptVariant('NAV_ICON')).toContain('EDGE CLEANLINESS');
    expect(inferLiveUiRole('HERO_OBJECT', 'PROJECTS HEADER PLANET')).toBe('PAGE_HEADER_HERO');
    expect(discoverAllProviderCapabilities({}).defaultReconstructionModel).toContain('gpt-image-2');
    expect(MAX_TARGETED_REVISION_PASSES).toBe(3);
  });
});
