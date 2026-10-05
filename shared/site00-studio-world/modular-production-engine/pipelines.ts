/**
 * Staged generation pipelines — casting, wardrobe, environment/set, scene assembly.
 */

export const CASTING_PIPELINE_STAGES = [
  'CHARACTER_BRIEF',
  'HEADSHOT_OR_NEUTRAL_FULLBODY_EXPLORATION',
  'FOUNDER_APPROVAL',
  'CANONICAL_ACTOR_CREATION',
  'CHARACTER_ROLE_ASSIGNMENT',
] as const;

export type CastingPipelineStage = (typeof CASTING_PIPELINE_STAGES)[number];

export type CastingPipelineInput = {
  campaignContext: string;
  roleFunction: string;
  personalityRequirement: string;
  demographicGuidance: string;
  referenceAssetIds: readonly string[];
};

export type CastingPipelineState = {
  pipeline: 'CASTING';
  stage: CastingPipelineStage;
  input: CastingPipelineInput;
  explorationBatchSize: number;
  approved: boolean;
  actorId: string | null;
  characterId: string | null;
};

export const WARDROBE_PIPELINE_STAGES = [
  'DEFAULT_NEUTRAL_BASE',
  'ATTACH_WARDROBE_PACKS',
  'ROLE_SPECIFIC_STYLING',
] as const;

export type WardrobePipelineStage = (typeof WARDROBE_PIPELINE_STAGES)[number];

export type WardrobePipelineState = {
  pipeline: 'WARDROBE';
  stage: WardrobePipelineStage;
  actorId: string;
  characterId: string;
  wardrobePackIds: readonly string[];
  generateFromScratch: boolean;
};

export const ENVIRONMENT_SET_PIPELINE_STAGES = [
  'ENVIRONMENT_BRIEF',
  'SET_CONCEPT',
  'ZONE_COVERAGE_PLAN',
  'PROP_TEXT_SIGNAGE_MAP',
  'FOUNDER_APPROVAL',
  'CANONICAL_LIBRARY_ENTRY',
] as const;

export type EnvironmentSetPipelineStage = (typeof ENVIRONMENT_SET_PIPELINE_STAGES)[number];

export type EnvironmentSetPipelineState = {
  pipeline: 'ENVIRONMENT_SET';
  stage: EnvironmentSetPipelineStage;
  environmentBrief: string;
  environmentId: string | null;
  setId: string | null;
  zonePlanComplete: boolean;
};

export const SCENE_ASSEMBLY_STAGES = [
  'SELECT_PERFORMER',
  'SELECT_ENVIRONMENT_SET',
  'PULL_WARDROBE_BEHAVIOR',
  'PULL_PROP_GRAPHIC_PACKAGE',
  'ASSEMBLE_SHOT_BRIEF',
  'GENERATE_SCENE_OUTPUT',
] as const;

export type SceneAssemblyStage = (typeof SCENE_ASSEMBLY_STAGES)[number];

export type SceneAssemblyPacket = {
  pipeline: 'SCENE_ASSEMBLY';
  stage: SceneAssemblyStage;
  characterId: string;
  actorId: string;
  actorIdentityAuthorityId: string;
  environmentId: string;
  setId: string;
  zoneId: string | null;
  wardrobeLinkIds: readonly string[];
  performanceSkinIds: readonly string[];
  propGraphicAssetIds: readonly string[];
  /** Prompt should describe delta vs approved library truth — not reinvent whole world. */
  generationDeltaPrompt: string;
  libraryAssemblyFirst: true;
  providerDispatchAllowed: boolean;
};

export function initialCastingPipeline(input: CastingPipelineInput): CastingPipelineState {
  return {
    pipeline: 'CASTING',
    stage: 'CHARACTER_BRIEF',
    input,
    explorationBatchSize: 0,
    approved: false,
    actorId: null,
    characterId: null,
  };
}

export function advanceCastingStage(state: CastingPipelineState): CastingPipelineState {
  const idx = CASTING_PIPELINE_STAGES.indexOf(state.stage);
  if (idx < 0 || idx >= CASTING_PIPELINE_STAGES.length - 1) return state;
  return { ...state, stage: CASTING_PIPELINE_STAGES[idx + 1]! };
}

export function canEnterActingCatalogue(state: CastingPipelineState): boolean {
  return state.stage === 'CANONICAL_ACTOR_CREATION' && state.approved;
}

export function sceneAssemblyReadyForGeneration(packet: SceneAssemblyPacket): boolean {
  return (
    packet.stage === 'ASSEMBLE_SHOT_BRIEF' &&
    Boolean(packet.actorId && packet.setId && packet.generationDeltaPrompt.length > 0)
  );
}
