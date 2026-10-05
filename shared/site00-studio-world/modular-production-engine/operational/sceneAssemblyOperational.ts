/**
 * Scene assembly, generation packet, ungrounded guard, asset gaps.
 */

import type { CameraCoverageKind, StudioWorldSet } from './environmentSetOperational.js';
import type { CharacterLookAuthority } from './wardrobeDepartment.js';
import type { PerformanceStackAssembly } from './performanceLayers.js';

export type SceneAssembly = {
  sceneId: string;
  narrativeBeatId: string;
  shotRequirementId: string;
  characterIds: readonly string[];
  performanceSkinIds: readonly string[];
  characterLookAuthorityIds: readonly string[];
  environmentId: string;
  setId: string;
  setZoneId: string;
  cameraCoverage: CameraCoverageKind;
  propIds: readonly string[];
  graphicIds: readonly string[];
  lightingMode: string;
  shotDirectionId: string;
};

export type SceneGenerationPacket = {
  packetId: string;
  assembly: SceneAssembly;
  referenceAssetIds: readonly string[];
  actorIdentityAuthorityIds: readonly string[];
  characterLookAuthorityIds: readonly string[];
  setAuthorityId: string;
  propAssetIds: readonly string[];
  graphicAssetIds: readonly string[];
  generationDeltaPrompt: string;
  proseOnlyForbidden: true;
};

export type UngroundedAssetFlag = {
  kind: 'SIGNAGE' | 'BRANDED_GRAPHIC' | 'MAJOR_PROP' | 'CLOTHING' | 'SET_FEATURE' | 'RECOGNIZABLE_PERSON';
  description: string;
  blocking: boolean;
};

export type AssetGapKind =
  | 'ACTOR'
  | 'WARDROBE'
  | 'HAIR'
  | 'MAKEUP'
  | 'PROP'
  | 'GRAPHIC'
  | 'SET'
  | 'ENVIRONMENT'
  | 'TEXT_ASSET'
  | 'PERFORMANCE';

export type AssetGap = {
  gapId: string;
  kind: AssetGapKind;
  description: string;
  resolved: boolean;
  intentionalBillable: boolean;
};

export function compileSceneGenerationPacket(args: {
  assembly: SceneAssembly;
  performances: readonly PerformanceStackAssembly[];
  looks: readonly CharacterLookAuthority[];
  set: StudioWorldSet;
  deltaPrompt: string;
}): SceneGenerationPacket {
  return {
    packetId: `packet-${args.assembly.sceneId}`,
    assembly: args.assembly,
    referenceAssetIds: [
      ...args.looks.flatMap((l) => [l.lookAuthorityId]),
      args.set.setId,
    ],
    actorIdentityAuthorityIds: args.performances.map((p) => p.actorIdentityAuthorityId),
    characterLookAuthorityIds: args.looks.map((l) => l.lookAuthorityId),
    setAuthorityId: args.set.setId,
    propAssetIds: args.assembly.propIds,
    graphicAssetIds: args.assembly.graphicIds,
    generationDeltaPrompt: args.deltaPrompt,
    proseOnlyForbidden: true,
  };
}

export function sceneUngroundedAssetGuard(
  deltaPrompt: string,
  approvedAnchorIds: readonly string[],
): { grounded: boolean; flags: UngroundedAssetFlag[] } {
  const flags: UngroundedAssetFlag[] = [];
  const lower = deltaPrompt.toLowerCase();
  if ((lower.includes('new sign') || lower.includes('store sign')) && approvedAnchorIds.length === 0) {
    flags.push({
      kind: 'SIGNAGE',
      description: 'Prompt requests signage without TextAnchor approval',
      blocking: true,
    });
  }
  if (lower.includes('new outfit') || lower.includes('different dress')) {
    flags.push({
      kind: 'CLOTHING',
      description: 'Prompt invents clothing without CharacterLookAuthority',
      blocking: true,
    });
  }
  if (lower.includes('random person') || lower.includes('new face')) {
    flags.push({
      kind: 'RECOGNIZABLE_PERSON',
      description: 'Prompt introduces untracked person',
      blocking: true,
    });
  }
  return { grounded: flags.filter((f) => f.blocking).length === 0, flags };
}

export function assetGapMustResolveBeforeGeneration(gaps: readonly AssetGap[]): boolean {
  return gaps.some((g) => !g.resolved && !g.intentionalBillable);
}

export type StoryboardPanelSlots = {
  panelId: string;
  castCharacterIds: readonly string[];
  environmentId: string;
  setId: string;
  zoneId: string;
  cameraCoverage: CameraCoverageKind;
  propIds: readonly string[];
  graphicIds: readonly string[];
};

export type KeyframeAssemblyPacket = {
  actorReferenceIds: readonly string[];
  characterLookAuthorityIds: readonly string[];
  performanceSkinIds: readonly string[];
  setAuthorityId: string;
  zoneId: string;
  propIds: readonly string[];
  graphicAnchorIds: readonly string[];
  shotDirectionId: string;
};

export type VideoAssemblyPacket = KeyframeAssemblyPacket & {
  animationSkinId: string | null;
  movementSkinId: string | null;
  performanceAction: string;
  timingNotes: string;
  cameraMovement: string;
  startFrameAuthorityId: string;
  endFrameAuthorityId: string;
};
