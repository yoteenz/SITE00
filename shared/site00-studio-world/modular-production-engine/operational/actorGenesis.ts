/**
 * Staged Actor Genesis — never one-shot complete actor package.
 */

export const ACTOR_GENESIS_STAGES = [
  'FACE_CANDIDATES',
  'IDENTITY_LOCK',
  'IDENTITY_ANGLES',
  'NEUTRAL_BODY_AUTHORITY',
  'CATALOGUE_ADMISSION',
] as const;

export type ActorGenesisStage = (typeof ACTOR_GENESIS_STAGES)[number];

export const ACTOR_LIFECYCLE_STATUS = ['ACTOR_CANDIDATE', 'ACTIVE_ACTOR'] as const;
export type ActorLifecycleStatus = (typeof ACTOR_LIFECYCLE_STATUS)[number];

export const MAX_FACE_CANDIDATES = 3 as const;

export const FACE_CANDIDATE_GENERATION_RULES = {
  maxCandidates: MAX_FACE_CANDIDATES,
  neutralLighting: true,
  neutralBackground: true,
  minimalMakeup: true,
  noCampaignStyling: true,
  noElaborateWardrobe: true,
  clearFacialVisibility: true,
} as const;

export const NEUTRAL_BODY_UNIFORM = {
  top: 'fitted black tank or tee',
  bottom: 'fitted black leggings or shorts',
  footwear: 'minimal neutral or barefoot',
  jewelry: 'none',
  bag: 'none',
  campaignCostume: 'forbidden',
  background: 'plain studio',
  views: ['FRONT', 'SIDE', 'BACK', 'THREE_QUARTER'] as const,
} as const;

export const IDENTITY_ANGLE_VIEWS = [
  'FRONT',
  'THREE_QUARTER_LEFT',
  'THREE_QUARTER_RIGHT',
  'PROFILE_LEFT',
  'PROFILE_RIGHT',
] as const;

export type FaceCandidate = {
  candidateId: 'A' | 'B' | 'C';
  previewAssetId: string | null;
  founderJudgment: 'UNREVIEWED' | 'LOVE' | 'SHORTLIST' | 'NOT_RIGHT' | 'SELECT_IDENTITY';
};

export type ActorGenesisState = {
  genesisId: string;
  castingRequirementId: string;
  stage: ActorGenesisStage;
  lifecycleStatus: ActorLifecycleStatus;
  faceCandidates: readonly FaceCandidate[];
  selectedCandidateId: 'A' | 'B' | 'C' | null;
  identityAuthorityId: string | null;
  identityAnglesComplete: boolean;
  neutralBodyAuthorityComplete: boolean;
  founderApprovedForCatalogue: boolean;
  actorId: string | null;
  providerDispatchCount: number;
  permanentWardrobeAssigned: boolean;
};

export function initialActorGenesis(castingRequirementId: string): ActorGenesisState {
  return {
    genesisId: `genesis-${castingRequirementId}`,
    castingRequirementId,
    stage: 'FACE_CANDIDATES',
    lifecycleStatus: 'ACTOR_CANDIDATE',
    faceCandidates: [],
    selectedCandidateId: null,
    identityAuthorityId: null,
    identityAnglesComplete: false,
    neutralBodyAuthorityComplete: false,
    founderApprovedForCatalogue: false,
    actorId: null,
    providerDispatchCount: 0,
    permanentWardrobeAssigned: false,
  };
}

export function canGenerateFaceCandidates(state: ActorGenesisState, batchSize: number): boolean {
  return state.stage === 'FACE_CANDIDATES' && batchSize <= MAX_FACE_CANDIDATES;
}

export function canAdvanceAfterFaceSelection(state: ActorGenesisState): boolean {
  return (
    state.stage === 'FACE_CANDIDATES' &&
    state.selectedCandidateId !== null &&
    state.faceCandidates.some(
      (c) => c.candidateId === state.selectedCandidateId && c.founderJudgment === 'SELECT_IDENTITY',
    )
  );
}

export function advanceActorGenesisStage(state: ActorGenesisState): ActorGenesisState {
  if (!canAdvanceStage(state)) return state;
  const idx = ACTOR_GENESIS_STAGES.indexOf(state.stage);
  const nextStage = ACTOR_GENESIS_STAGES[Math.min(idx + 1, ACTOR_GENESIS_STAGES.length - 1)]!;
  const lifecycleStatus: ActorLifecycleStatus =
    nextStage === 'CATALOGUE_ADMISSION' && state.founderApprovedForCatalogue ? 'ACTIVE_ACTOR' : state.lifecycleStatus;
  return { ...state, stage: nextStage, lifecycleStatus };
}

function canAdvanceStage(state: ActorGenesisState): boolean {
  switch (state.stage) {
    case 'FACE_CANDIDATES':
      return canAdvanceAfterFaceSelection(state);
    case 'IDENTITY_LOCK':
      return Boolean(state.identityAuthorityId);
    case 'IDENTITY_ANGLES':
      return state.identityAnglesComplete;
    case 'NEUTRAL_BODY_AUTHORITY':
      return state.neutralBodyAuthorityComplete;
    case 'CATALOGUE_ADMISSION':
      return false;
    default:
      return false;
  }
}

export function bodyAuthorityCannotPrecedeIdentityLock(state: ActorGenesisState): boolean {
  if (state.stage === 'NEUTRAL_BODY_AUTHORITY' || state.neutralBodyAuthorityComplete) {
    return Boolean(state.identityAuthorityId) && state.identityAnglesComplete;
  }
  return true;
}

export function catalogueAdmissionReady(state: ActorGenesisState): boolean {
  return (
    Boolean(state.identityAuthorityId) &&
    state.identityAnglesComplete &&
    state.neutralBodyAuthorityComplete &&
    state.founderApprovedForCatalogue &&
    !state.permanentWardrobeAssigned
  );
}

export function assertNoPermanentWardrobeInGenesis(state: ActorGenesisState): { valid: boolean; message: string | null } {
  if (state.permanentWardrobeAssigned) {
    return {
      valid: false,
      message: 'Actor Genesis must not assign campaign wardrobe — use Studio World Wardrobe Department',
    };
  }
  return { valid: true, message: null };
}
