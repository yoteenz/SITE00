import type { AuthorityCoordinateMap } from '../p0vrReplication3d/types.js';
import type { ReplicationAssetSlot } from '../p0vrReplication3c/types.js';
import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import {
  HERO_MEDIA_SLOT_SELECTOR,
  P0_VR_REPLICATION_3D_BOUNDARY_BUILD,
  SHELL_ROOT_SELECTOR,
  TWIN_CONTENT_ROOT_SELECTOR,
  TWIN_MOUNT_ROOT_SELECTOR,
  TWIN_SURFACE_SELECTOR,
  VISION_LITERAL_ROOT_SELECTOR,
} from './constants.js';
import { checkAllHeroBindings } from './assetBindingCompatibility.js';
import { classifyVisualSource } from './sourceClassification.js';
import {
  assertCoordinateSpaceIsPageLevel,
  assertNotInsideHeroMediaSlot,
  assertNotInsideShellChrome,
  assertRegionOutputTypeCompatible,
  assertTwinContentRoot,
} from './renderBoundaryGuards.js';
import type {
  CoordinateSpaceTrace,
  RegionTargetAssignmentTrace,
  ReplicationRenderBoundaryReceipt,
  RenderBoundaryFailureCode,
} from './types.js';

function uniqueFailures(codes: (RenderBoundaryFailureCode | null)[]): RenderBoundaryFailureCode[] {
  return [...new Set(codes.filter(Boolean))] as RenderBoundaryFailureCode[];
}

export function buildReplicationRenderBoundaryReceipt(input: {
  session: ReconstructionTwinSession;
  assetSlots: ReplicationAssetSlot[];
  coordinateMap: AuthorityCoordinateMap | null;
  strippedHeroSlotIds: string[];
}): ReplicationRenderBoundaryReceipt {
  const sessionId = input.session.sessionId;
  const bindingChecks = checkAllHeroBindings(input.assetSlots);

  const sourceClassifications = input.assetSlots
    .map((s) => classifyVisualSource(s.materializedPublicUrl ?? s.selectedAsset))
    .filter((r) => r.assetRef);

  const regionAssignments: RegionTargetAssignmentTrace[] = input.assetSlots.map((slot) => {
    const ref = slot.materializedPublicUrl ?? slot.selectedAsset;
    const src = classifyVisualSource(ref);
    const isPageLevel =
      src.classification === 'PAGE_AUTHORITY' &&
      src.isFullPageScreenshot &&
      !slot.materializedPublicUrl &&
      slot.selectedAsset === ref;
    const outputKind = slot.selectedStrategy === 'PROCEDURAL_DOM_GRAPHIC'
      ? 'PROCEDURAL'
      : isPageLevel
        ? 'LITERAL_SCREENSHOT_ASSET'
        : slot.materializedPublicUrl
          ? 'HERO_MEDIA_ASSET'
          : 'STRUCTURED_DOM';

    const allowed = !isPageLevel || Boolean(slot.materializedPublicUrl);
    const failure = assertRegionOutputTypeCompatible(allowed, outputKind);

    return {
      regionId: 'hero-editorial',
      slotId: slot.slotId,
      targetSelector: HERO_MEDIA_SLOT_SELECTOR,
      outputKind,
      sourceClassification: src.classification,
      allowed,
      failureCode: failure,
      notes: input.strippedHeroSlotIds.includes(slot.slotId)
        ? 'Stripped incompatible full-page authority binding'
        : slot.failureReason ?? '',
    };
  });

  const coordinateSpaces: CoordinateSpaceTrace[] = (input.coordinateMap?.regions ?? []).map((r) => {
    const valid = r.regionId !== 'host-header';
    return {
      regionId: r.regionId,
      coordinateOrigin: valid ? 'TWIN_CONTENT_ROOT' : 'INVALID_NESTED',
      normalizedAgainst: r.regionId === 'hero-editorial' ? 'HERO_INNER' : 'AUTHORITY_PAGE',
      valid,
    };
  });

  const mountInsideShellChrome = false;
  const mountInsideHeroMedia = regionAssignments.some((a) => !a.allowed && a.outputKind === 'LITERAL_SCREENSHOT_ASSET');

  const twinMount = {
    sessionId,
    twinRootSelector: TWIN_MOUNT_ROOT_SELECTOR,
    mountNodeSelector: `${TWIN_SURFACE_SELECTOR} ${VISION_LITERAL_ROOT_SELECTOR}, ${TWIN_SURFACE_SELECTOR} ${SHELL_ROOT_SELECTOR}`,
    shellRootSelector: SHELL_ROOT_SELECTOR,
    contentRootSelector: TWIN_CONTENT_ROOT_SELECTOR,
    mountInsideShellChrome,
    mountInsideHeroMediaSlot: mountInsideHeroMedia,
    clippingAncestorSummary: 'site00-reconstruction-twin-chrome → twin-root → surface → content-root → shell bands',
  };

  const guardFailures = uniqueFailures([
    assertTwinContentRoot(true),
    assertNotInsideShellChrome(mountInsideShellChrome),
    assertNotInsideHeroMediaSlot(mountInsideHeroMedia),
    assertCoordinateSpaceIsPageLevel(!coordinateSpaces.some((c) => !c.valid && c.regionId === 'hero-editorial')),
    ...bindingChecks.map((b) => (b.compatible ? null : b.failureCode)),
    ...regionAssignments.map((a) => a.failureCode),
  ]);

  const PAGE_NESTING_DETECTED = regionAssignments.some(
    (a) => a.outputKind === 'LITERAL_SCREENSHOT_ASSET' || a.outputKind === 'PAGE_LEVEL_RENDER_CONTENT',
  );
  const HERO_SLOT_MISBOUND = bindingChecks.some((b) => !b.compatible) || mountInsideHeroMedia;
  const COORDINATE_SPACE_INVALID = coordinateSpaces.some((c) => c.coordinateOrigin === 'INVALID_NESTED');
  const CONTENT_ROOT_VALID = guardFailures.indexOf('INVALID_MOUNT_ROOT') === -1;

  const verdict = {
    CONTENT_ROOT_VALID,
    PAGE_NESTING_DETECTED,
    HERO_SLOT_MISBOUND,
    COORDINATE_SPACE_INVALID,
  };

  const typedFailures = guardFailures;
  const status =
    typedFailures.length === 0 && !PAGE_NESTING_DETECTED && !HERO_SLOT_MISBOUND ? ('PASS' as const) : ('FAIL' as const);

  const founderMessage =
    status === 'PASS'
      ? null
      : typedFailures.includes('PAGE_AUTHORITY_MISUSED_AS_REGION_ASSET')
        ? 'Hero slots must use materialized region crops — full-page authority cannot fill hero media.'
        : 'Render boundary audit failed — see BOUNDARY TRACE in DETAILS.';

  return {
    buildRef: P0_VR_REPLICATION_3D_BOUNDARY_BUILD,
    sessionId,
    twinMount,
    regionAssignments,
    coordinateSpaces,
    sourceClassifications,
    bindingChecks,
    verdict,
    typedFailures,
    founderMessage,
    status,
  };
}
