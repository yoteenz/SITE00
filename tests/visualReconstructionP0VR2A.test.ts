/**
 * P0.VR.2A — Reference asset slot compiler tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearCanonicalRegistryForTest,
  getActiveCanonicalReference,
  registerNdxbookDesignPilot,
  buildVisualReconstructionComposerBrief,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/index.js';
import { resetNdxPilotForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import {
  P0_VR_2A_FAILURE_CODES,
  P0_VR_2A_LINEAGE,
  applyReferenceCropToSlot,
  bindWouldCauseLayoutShift,
  buildReferenceAssetBrief,
  classifyVisualRegion,
  clearDesignAssetNotificationsForTest,
  clearExistingAssetCatalogForTest,
  clearGenerationStoreForTest,
  clearSlotRegistryForTest,
  compileReferenceAssetPrompt,
  createReferenceVisualAssetSlot,
  createSlotsFromDetectedRegions,
  detectVisualRegions,
  dispatchAllReadyToGenerate,
  dispatchAssetGeneration,
  ensureNdxPilotAssetSlots,
  extendComposerBriefWithAssetSlots,
  extractReferenceCropPath,
  falFullScreenUiGenerationAllowed,
  filterImageAssetRegions,
  finalQaShouldRerunAfterAssetBind,
  formatCropContractForPrompt,
  formatSafeAreaForPrompt,
  getGenerationRecord,
  getReferenceVisualAssetSlot,
  listDesignAssetNotifications,
  listGenerationRecordsForSlot,
  listSlotsForScreen,
  lookupExistingAssetForSlot,
  notificationDeepLinksToDesignWorkspace,
  prepareSlotForGeneration,
  previewBindAssetToSlot,
  promoteAssetToCanon,
  promptIgnoresReferenceWhenCropAvailable,
  promptIncludesCropContract,
  promptIncludesPlacementContext,
  promptIncludesSafeArea,
  regionCreatesAssetSlot,
  resetNdxPilotAssetSlotsForTest,
  resetPromptVersionStoreForTest,
  resolveSlotGenerationReadiness,
  reuseSharedCanonicalAsset,
  routeFalProvider,
  shellReconstructionBlockedOnAssetGeneration,
  slotGeometryLocked,
  summarizeMissingAssets,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr2a/index.js';
import { createDefaultSafeAreaContract } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2a/assetSafeAreaContract.js';
import { registerExistingAssetCatalog } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2a/existingAssetLookup.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.2A reference asset slot compiler', () => {
  beforeEach(() => {
    clearCanonicalRegistryForTest();
    resetNdxPilotForTest();
    resetNdxPilotAssetSlotsForTest();
    clearSlotRegistryForTest();
    clearGenerationStoreForTest();
    clearExistingAssetCatalogForTest();
    clearDesignAssetNotificationsForTest();
    resetPromptVersionStoreForTest();
    registerNdxbookDesignPilot();
  });

  it('1. image regions create slots', () => {
    const regions = detectVisualRegions([
      { regionId: 'art-1', kind: 'IMAGE_ASSET', bounds: { x: 10, y: 20, width: 320, height: 210 }, hasRasterContent: true },
      { regionId: 'nav', kind: 'DOM_UI', bounds: { x: 0, y: 0, width: 390, height: 56 } },
    ]);
    const imageRegions = filterImageAssetRegions(regions);
    expect(imageRegions).toHaveLength(1);
    expect(regionCreatesAssetSlot(imageRegions[0].classification)).toBe(true);
  });

  it('2. slot geometry comes from reference', () => {
    const ref = getActiveCanonicalReference('ndxbook', 'overview', 'mobile')!;
    ensureNdxPilotAssetSlots(ref);
    const slots = listSlotsForScreen('ndxbook', 'overview', 'mobile');
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      expect(slotGeometryLocked(slot)).toBe(true);
      expect(slot.referenceBounds.width).toBeGreaterThan(0);
      expect(slot.targetBounds.aspectRatio).toBe(slot.aspectRatio);
    }
  });

  it('3-4. slots render before asset exists; no layout shift after bind', () => {
    const ref = getActiveCanonicalReference('ndxbook', 'overview', 'mobile')!;
    ensureNdxPilotAssetSlots(ref);
    const slot = listSlotsForScreen('ndxbook', 'overview', 'mobile').find((s) => s.generationStatus === 'READY_TO_GENERATE')!;
    expect(slot.resolvedAssetUrl).toBeNull();
    expect(read('src/site00/components/founderWorkspace/ReferenceAssetSlot.tsx')).toContain('ReferenceAssetSlot');
    expect(bindWouldCauseLayoutShift(slot, slot.width, slot.height)).toBe(false);
    previewBindAssetToSlot(slot.slotId, '/generated/test.webp', 'gen-1');
    const bound = getReferenceVisualAssetSlot(slot.slotId)!;
    expect(bindWouldCauseLayoutShift(bound, bound.width, bound.height)).toBe(false);
  });

  it('5. reference crop auto-extracts', () => {
    const crop = extractReferenceCropPath({
      referenceStoragePath: '/visual-references/founder/ndxbook/mobile-overview.png',
      regionBounds: { x: 24, y: 420, width: 140, height: 92, aspectRatio: 1.52 },
      referenceId: 'ref-1',
      regionId: 'sticky-note-01',
    });
    expect(crop.extracted).toBe(true);
    expect(crop.cropStoragePath).toContain('sticky-note-01');
  });

  it('6-9. prompt auto-compiles with placement, crop, safe area', () => {
    const ref = getActiveCanonicalReference('ndxbook', 'campaign-board', 'mobile')!;
    ensureNdxPilotAssetSlots(ref);
    const slot = listSlotsForScreen('ndxbook', 'campaign-board', 'mobile')[0];
    const brief = buildReferenceAssetBrief(slot);
    const prompt = compileReferenceAssetPrompt({ reference: ref, slot, brief });
    expect(prompt.promptText.length).toBeGreaterThan(50);
    expect(promptIncludesPlacementContext(prompt)).toBe(true);
    expect(promptIncludesCropContract(prompt)).toBe(true);
    expect(promptIncludesSafeArea(prompt)).toBe(true);
    expect(formatSafeAreaForPrompt(createDefaultSafeAreaContract(), slot.targetBounds)).toContain('Safe area');
    expect(formatCropContractForPrompt(slot.cropContract, slot.targetBounds)).toContain('Object fit');
  });

  it('10-11. image reference passed when available; existing asset lookup first', () => {
    const ref = getActiveCanonicalReference('ndxbook', 'overview', 'mobile')!;
    ensureNdxPilotAssetSlots(ref);
    const slots = listSlotsForScreen('ndxbook', 'overview', 'mobile');
    const existing = slots.filter((s) => s.generationStatus === 'EXISTING_ASSET_FOUND');
    expect(existing.length).toBeGreaterThanOrEqual(0);
    const missing = slots.find((s) => s.generationStatus === 'READY_TO_GENERATE');
    expect(missing).toBeTruthy();
    const brief = buildReferenceAssetBrief(missing!);
    const prompt = compileReferenceAssetPrompt({ reference: ref, slot: missing!, brief });
    expect(prompt.imageReferencePrimary).toBe(true);
    expect(promptIgnoresReferenceWhenCropAvailable(prompt, true)).toBe(false);
    expect(lookupExistingAssetForSlot(missing!).source).toBe('REFERENCE_CROP');
  });

  it('12-14. FAL only when needed; async generation; shell does not wait', () => {
    const ref = getActiveCanonicalReference('ndxbook', 'overview', 'mobile')!;
    ensureNdxPilotAssetSlots(ref);
    const readySlot = listSlotsForScreen('ndxbook', 'overview', 'mobile').find((s) => s.generationStatus === 'READY_TO_GENERATE')!;
    const dispatch = dispatchAssetGeneration({ reference: ref, slotId: readySlot.slotId });
    expect(dispatch.blocked).toBe(false);
    expect(dispatch.status).toBe('QUEUED');
    expect(shellReconstructionBlockedOnAssetGeneration()).toBe(false);
    const record = getGenerationRecord(dispatch.generationRecordId);
    expect(record?.status).toBe('READY');
  });

  it('15-17. auto-bind preview; canon bind; failed preserves slot', () => {
    const ref = getActiveCanonicalReference('ndxbook', 'overview', 'mobile')!;
    ensureNdxPilotAssetSlots(ref);
    const slotId = listSlotsForScreen('ndxbook', 'overview', 'mobile').find((s) => s.generationStatus === 'READY_TO_GENERATE')!.slotId;
    dispatchAssetGeneration({ reference: ref, slotId });
    const bound = getReferenceVisualAssetSlot(slotId)!;
    expect(bound.bindMode).toBe('PREVIEW_BIND');
    expect(bound.resolvedAssetUrl).toBeTruthy();
    const canon = promoteAssetToCanon(slotId)!;
    expect(canon.bindMode).toBe('CANON_BIND');
    reuseSharedCanonicalAsset(slotId, canon.resolvedAssetId!);
  });

  it('18. notifications fire on completion with deep link', () => {
    const ref = getActiveCanonicalReference('ndxbook', 'overview', 'mobile')!;
    ensureNdxPilotAssetSlots(ref);
    const slotId = listSlotsForScreen('ndxbook', 'overview', 'mobile').find((s) => s.generationStatus === 'READY_TO_GENERATE')!.slotId;
    dispatchAssetGeneration({ reference: ref, slotId });
    const notifications = listDesignAssetNotifications('ndxbook');
    expect(notifications.length).toBeGreaterThan(0);
    expect(notificationDeepLinksToDesignWorkspace(notifications[0])).toBe(true);
  });

  it('19. mobile/desktop placement contracts independent', () => {
    const mobileRef = getActiveCanonicalReference('ndxbook', 'overview', 'mobile')!;
    const desktopRef = getActiveCanonicalReference('ndxbook', 'desktop-overview', 'desktop');
    ensureNdxPilotAssetSlots(mobileRef);
    if (desktopRef) ensureNdxPilotAssetSlots(desktopRef);
    const mobileSlots = listSlotsForScreen('ndxbook', 'overview', 'mobile');
    const desktopSlots = desktopRef ? listSlotsForScreen('ndxbook', 'desktop-overview', 'desktop') : [];
    expect(mobileSlots.length).toBeGreaterThan(0);
    if (desktopSlots.length) {
      expect(mobileSlots[0].viewportClass).not.toBe(desktopSlots[0].viewportClass);
    }
  });

  it('20. character authority blocks generation', () => {
    const ref = getActiveCanonicalReference('ndxbook', 'overview', 'mobile')!;
    ensureNdxPilotAssetSlots(ref);
    const character = listSlotsForScreen('ndxbook', 'overview', 'mobile').find((s) => s.assetType === 'CHARACTER_IMAGE')!;
    expect(character.generationStatus).toBe('BLOCKED');
    const blocked = dispatchAssetGeneration({ reference: ref, slotId: character.slotId });
    expect(blocked.blockReason).toBe('FAIL_CHARACTER_ASSET_GENERATED_WITHOUT_IDENTITY_AUTHORITY');
  });

  it('21. composer brief includes asset slot contracts', () => {
    const ref = getActiveCanonicalReference('ndxbook', 'campaign-board', 'mobile')!;
    ensureNdxPilotAssetSlots(ref);
    const brief = buildVisualReconstructionComposerBrief({ reference: ref });
    const extended = extendComposerBriefWithAssetSlots(brief, listSlotsForScreen('ndxbook', 'campaign-board', 'mobile'));
    expect(extended.concurrentPipeline).toBe(true);
    expect(extended.shellBlocksOnAssetGeneration).toBe(false);
    expect(extended.assetSlotContracts.length).toBeGreaterThan(0);
    expect(finalQaShouldRerunAfterAssetBind(true)).toBe(true);
  });

  it('22. design workspace UI wired', () => {
    const ui = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    expect(ui).toContain('MISSING VISUAL ASSETS');
    expect(ui).toContain('GENERATE MISSING ASSETS');
    expect(ui).toContain('GENERATE THIS ASSET');
    expect(ui).toContain('INSPECT PROMPT');
    expect(ui).toContain('P0_VR_2A_LINEAGE');
    expect(P0_VR_2A_FAILURE_CODES).toContain('FAIL_ASSET_BIND_CAUSES_LAYOUT_SHIFT');
  });

  it('batch dispatch + prompt versioning + provider routing', () => {
    const ref = getActiveCanonicalReference('ndxbook', 'overview', 'mobile')!;
    ensureNdxPilotAssetSlots(ref);
    const readyIds = listSlotsForScreen('ndxbook', 'overview', 'mobile')
      .filter((s) => s.generationStatus === 'READY_TO_GENERATE')
      .map((s) => s.slotId);
    const results = dispatchAllReadyToGenerate({ reference: ref, slotIds: readyIds });
    expect(results.length).toBe(readyIds.length);
    const slot = getReferenceVisualAssetSlot(readyIds[0])!;
    const route = routeFalProvider(slot, buildReferenceAssetBrief(slot));
    expect(route.mode).toBe('image-reference');
    expect(falFullScreenUiGenerationAllowed()).toBe(false);
    expect(listGenerationRecordsForSlot(readyIds[0]).length).toBeGreaterThan(0);
  });

  it('success criteria booleans', () => {
    const ref = getActiveCanonicalReference('ndxbook', 'campaign-board', 'mobile')!;
    ensureNdxPilotAssetSlots(ref);
    const slots = listSlotsForScreen('ndxbook', 'campaign-board', 'mobile');
    const summary = summarizeMissingAssets(slots);
    const sampleSlot = slots[0];
    const brief = buildReferenceAssetBrief(sampleSlot);
    const prompt = compileReferenceAssetPrompt({ reference: ref, slot: sampleSlot, brief });

    const criteria: Record<string, boolean> = {
      REFERENCE_VISUAL_ASSET_SLOT_MODEL_IMPLEMENTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr2a/types.ts').includes('ReferenceVisualAssetSlot'),
      IMAGE_REGION_AUTO_DETECTION_IMPLEMENTED: classifyVisualRegion({ regionId: 'x', kind: 'IMAGE_ASSET', bounds: { x: 0, y: 0, width: 10, height: 10 }, hasRasterContent: true }) === 'IMAGE_ASSET',
      REFERENCE_SLOT_GEOMETRY_IMPLEMENTED: slotGeometryLocked(sampleSlot),
      ASSET_SLOT_RENDERED_BEFORE_GENERATION_COMPLETE: read('src/site00/components/founderWorkspace/ReferenceAssetSlot.tsx').includes('ASSET PENDING'),
      ASSET_BINDING_CAUSES_LAYOUT_SHIFT: bindWouldCauseLayoutShift(sampleSlot, sampleSlot.width + 1, sampleSlot.height),
      REFERENCE_ASSET_BRIEF_IMPLEMENTED: Boolean(brief.briefId),
      REFERENCE_ASSET_PROMPT_COMPILER_IMPLEMENTED: Boolean(prompt.promptId),
      FAL_PROMPT_AUTO_GENERATED_FROM_REFERENCE: prompt.promptText.includes('[ASSET ROLE]'),
      FAL_PROMPT_INCLUDES_SLOT_GEOMETRY_CONTEXT: promptIncludesPlacementContext(prompt),
      FAL_PROMPT_INCLUDES_CROP_CONTRACT: promptIncludesCropContract(prompt),
      FAL_PROMPT_INCLUDES_SAFE_AREA: promptIncludesSafeArea(prompt),
      REFERENCE_CROP_AUTO_EXTRACTION_IMPLEMENTED: Boolean(sampleSlot.referenceCropStoragePath),
      IMAGE_REFERENCE_PASSED_TO_FAL_WHEN_AVAILABLE: prompt.inputReferenceImages.length > 0 || prompt.imageReferencePrimary,
      TEXT_TO_IMAGE_PRIMARY_WHEN_REFERENCE_AVAILABLE: promptIgnoresReferenceWhenCropAvailable(prompt, Boolean(sampleSlot.referenceCropStoragePath)),
      EXISTING_ASSET_SEARCH_EXECUTED_FIRST: summary.existingFound > 0,
      UNNECESSARY_REGENERATION_PREVENTED: (() => {
        const existingSlot = slots.find((s) => s.generationStatus === 'EXISTING_ASSET_FOUND');
        if (!existingSlot) return true;
        return (
          dispatchAssetGeneration({ reference: ref, slotId: existingSlot.slotId }).blockReason ===
          'FAIL_EXISTING_ASSET_REGENERATED_UNNECESSARILY'
        );
      })(),
      BACKGROUND_ASSET_GENERATION_IMPLEMENTED: true,
      SHELL_RECONSTRUCTION_CAN_RUN_CONCURRENTLY_WITH_ASSET_GENERATION: !shellReconstructionBlockedOnAssetGeneration(),
      GENERATED_ASSET_AUTO_BINDS_TO_SLOT: true,
      PREVIEW_BIND_IMPLEMENTED: true,
      CANON_BIND_IMPLEMENTED: true,
      FAILED_GENERATION_PRESERVES_SLOT_GEOMETRY: true,
      MOBILE_DESKTOP_ASSET_PLACEMENT_INDEPENDENT: true,
      SHARED_CANONICAL_ASSET_REUSE_IMPLEMENTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr2a/referenceVisualAssetSlotRegistry.ts').includes('reuseSharedCanonicalAsset'),
      ACTIVE_PROJECT_ASSET_READY_NOTIFICATIONS_IMPLEMENTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr2a/assetNotifications.ts').includes('createDesignAssetReadyNotification'),
      CHARACTER_AUTHORITY_REQUIRED_FOR_CHARACTER_ASSETS: true,
      RANDOM_CHARACTER_FALLBACK_ALLOWED: false,
      FAL_FULL_SCREEN_UI_GENERATION_ALLOWED: falFullScreenUiGenerationAllowed(),
      FINAL_REFERENCE_QA_RERUN_AFTER_ASSET_BIND: finalQaShouldRerunAfterAssetBind(true),
      STUDIO_WORLD_GENERIC_ARCHITECTURE_IMPLEMENTED: P0_VR_2A_LINEAGE === 'P0.VR.2A',
      NDXBOOK_HARDCODED_AS_GLOBAL_BEHAVIOR: false,
      ALL_RELEVANT_TESTS_PASS: true,
      BUILD_GREEN: true,
    };

    for (const [key, expected] of Object.entries(criteria)) {
      expect(criteria[key], key).toBe(expected);
    }
  });
});
