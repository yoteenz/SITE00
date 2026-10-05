/**
 * Non-negotiable modular engine rules — layer separation, approval, generation discipline.
 */

import type { SceneAssemblyPacket } from './pipelines.js';
import type { StudioWorldLibraryUnion } from './libraryTypes.js';

export type LayerViolation = {
  ruleId: string;
  message: string;
  blocking: boolean;
};

export function assertPerformerLayerSeparation(args: {
  actorIdentityLocked: boolean;
  wardrobeBakedIntoIdentity: boolean;
  personalitySwappable: boolean;
}): LayerViolation[] {
  const issues: LayerViolation[] = [];
  if (args.wardrobeBakedIntoIdentity) {
    issues.push({
      ruleId: 'PERFORMER_WARDROBE_NOT_IDENTITY',
      message: 'Wardrobe must not be hard-baked into actor identity',
      blocking: true,
    });
  }
  if (!args.actorIdentityLocked) {
    issues.push({
      ruleId: 'ACTOR_IDENTITY_REQUIRED',
      message: 'Canonical actor identity must be approved before scene assembly',
      blocking: true,
    });
  }
  if (!args.personalitySwappable) {
    issues.push({
      ruleId: 'PERSONALITY_SKIN_SWAPPABLE',
      message: 'Personality/behavior skins must be independently swappable from identity',
      blocking: false,
    });
  }
  return issues;
}

export function assertApprovedTruthBeforeGeneration(
  assets: readonly StudioWorldLibraryUnion[],
): LayerViolation[] {
  const issues: LayerViolation[] = [];
  for (const asset of assets) {
    if (asset.approvalStatus !== 'APPROVED' && asset.approvalStatus !== 'CANON') {
      issues.push({
        ruleId: 'APPROVED_TRUTH_ONLY',
        message: `${asset.libraryKind} ${libraryRecordId(asset)} not approved for generation grounding`,
        blocking: true,
      });
    }
  }
  return issues;
}

export function assertSceneAssemblyDiscipline(packet: SceneAssemblyPacket): LayerViolation[] {
  const issues: LayerViolation[] = [];
  if (!packet.libraryAssemblyFirst) {
    issues.push({
      ruleId: 'LIBRARY_ASSEMBLY_FIRST',
      message: 'Scene generation must assemble from approved layers before provider dispatch',
      blocking: true,
    });
  }
  if (packet.generationDeltaPrompt.length > 2000) {
    issues.push({
      ruleId: 'DELTA_PROMPT_NOT_FULL_REINVENTION',
      message: 'Generation delta prompt is too large — likely re-describing whole world instead of missing delta',
      blocking: false,
    });
  }
  if (packet.providerDispatchAllowed && packet.stage !== 'GENERATE_SCENE_OUTPUT') {
    issues.push({
      ruleId: 'NO_PREMATURE_PROVIDER',
      message: 'Provider dispatch only at GENERATE_SCENE_OUTPUT after packet assembly',
      blocking: true,
    });
  }
  return issues;
}

function libraryRecordId(asset: StudioWorldLibraryUnion): string {
  switch (asset.libraryKind) {
    case 'ACTING_CATALOGUE':
      return asset.actorId;
    case 'CHARACTER_PROFILE':
      return asset.characterId;
    case 'ENVIRONMENT_LIBRARY':
      return asset.environmentId;
    case 'SET_LIBRARY':
      return asset.setId;
    case 'WARDROBE_LIBRARY':
      return asset.wardrobeId;
    case 'PROP_GRAPHIC':
      return asset.assetId;
    case 'PERFORMANCE_SKIN':
      return asset.performanceSkinId;
    default:
      return 'unknown';
  }
}

export function validateModularProductionRules(
  performer: Parameters<typeof assertPerformerLayerSeparation>[0],
  assets: readonly StudioWorldLibraryUnion[],
  packet: SceneAssemblyPacket | null,
): { valid: boolean; violations: LayerViolation[] } {
  const violations = [
    ...assertPerformerLayerSeparation(performer),
    ...assertApprovedTruthBeforeGeneration(assets),
    ...(packet ? assertSceneAssemblyDiscipline(packet) : []),
  ];
  return {
    valid: !violations.some((v) => v.blocking),
    violations,
  };
}
