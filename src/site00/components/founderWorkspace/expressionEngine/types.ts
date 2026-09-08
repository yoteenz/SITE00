/**
 * B5.0 — Expression Engine workspace shared types.
 */

import type { Entry002ProductionBlueprint } from '../../../../../shared/site00-expression-engine/types.js';
import type { ExpressionEngineB1Phase2Response } from '../../../../../shared/site00-expression-engine/campaignClientTypes.js';

export type WorkspaceNavId = 'work' | 'world' | 'continuity' | 'formats' | 'production' | 'history';

export type PreStoryboardAuthority = {
  boardNumber: number;
  boardId: string;
  boardTitle: string;
  role: string;
  purpose: string;
  continuityRules: string[];
  founderJudgment: string;
  previewUrl: string | null;
  record?: { status: string; visualAuthority: boolean; version: string; approvedAt?: string | null };
};

export type B48PipelineResponse = {
  pipelineState: {
    activeGate: { gateId: string; label: string; satisfied: boolean; gateStatus: string };
    nextAction: string;
    currentStage: string;
    activeProductionStep: string;
    preStoryboardVisualAuthorities: string;
    founderPreStoryboardAuthorityApproval: string;
    finalStoryboard: { status: string; promotionBlocked: boolean; approved: boolean; valid?: boolean };
    coverAuthority?: string;
    reelTreatment?: string;
    keyframes?: string;
    video?: string;
  };
  productionEligibility: {
    preStoryboardAuthorityGate: string;
    requiredAuthorityCount: number;
    approvedAuthorityCount: number;
    finalStoryboardEligibility: string;
    keyframeEligibility: string;
    videoEligibility: string;
    founderStoryboardApproval?: string;
  };
  gateSatisfaction: { satisfied: boolean; loveItCount: number };
  preStoryboardAuthorityPack: {
    authorities: PreStoryboardAuthority[];
    approvalState: { allAuthoritiesLoveIt: boolean };
  };
  preStoryboardGate: { gateStatus: string };
  nextAction: string;
  keyframes?: string;
  video?: string;
  cinematicSequence?: { status: string; visualAuthority: boolean };
};

export type B49R4PipelineResponse = {
  finalCinematicStoryboard: {
    storyboardId: string;
    version: string;
    status: string;
    readinessState: string;
    generationMode: string;
    founderJudgment: string;
    panelCount: number;
    storyboardStripUrl: string | null;
    storyboardSource?: 'GENERATED' | 'FOUNDER_SUPPLIED';
    sourceArtifactOrigin?: 'PROVIDER_GENERATED' | 'FOUNDER_SUPPLIED';
    structuralQaStatus: string;
    continuityQaStatus: string;
    renderModeQaStatus: string;
    reelCoherenceQaStatus: string;
    boardTypeQaStatus: string;
    visualAuthorityFidelityQaStatus: string;
    provider: string | null;
    telemetry: Record<string, unknown>;
  } | null;
  storyboard001Historical?: { status: string; failureReason: string | null };
  storyboard002Historical?: { status: string; failureReason: string | null };
  storyboard003Historical?: { status: string; failureReason: string | null };
  storyboard004Historical?: { status: string; failureReason: string | null };
  storyboard005Historical?: { status: string; failureReason: string | null; referenceOnly?: boolean };
  storyboardCostGuard?: {
    storyboardGenerationAttemptCount: number;
    storyboardProviderDispatchCount: number;
    storyboardImportedCount: number;
    storyboardAutoRetryCount: number;
  };
  visualAuthorityManifest?: {
    requiredAuthorityImageCount: number;
    resolvedAuthorityImageCount: number;
    validated: boolean;
  };
  reelVisualConception?: { selectedMomentCount: number; narrativeBeatCount: number };
  visualAuthorityFidelityQA?: { result: string; executed: boolean };
  productionEligibility: {
    founderStoryboardApproval: string;
    keyframeEligibility: string;
    videoEligibility?: string;
  };
  pipelineState?: B48PipelineResponse['pipelineState'];
  finalStoryboardReviewGate: { active: boolean; gateId: string };
  keyframes: string;
  video: string;
  nextAction: string;
  telemetryNote: string;
};

export type C1NarrativeSynthesisResponse = {
  sprint: string;
  architectureLayer: string;
  providerDispatchCount: 0;
  narrativeSynthesis: import('../../../../../shared/site00-expression-engine/narrative-synthesis/types.js').NarrativeSynthesis;
  nextAction: string;
};

export type C11CreativeDirectorResponse = {
  sprint: string;
  architectureLayer: string;
  providerDispatchCount: 0;
  imageProviderDispatchCount: 0;
  videoProviderDispatchCount: 0;
  creativeDirectorRun: import('../../../../../shared/site00-expression-engine/creative-director/types.js').CreativeDirectorRun;
  blindTestBrief: import('../../../../../shared/site00-expression-engine/creative-director/types.js').MinimalCreativeBrief;
  nextAction: string;
};

export type C12Entry003Response = {
  sprint: string;
  architectureLayer: string;
  architectureStack?: string[];
  providerDispatchCount: 0;
  imageProviderDispatchCount: 0;
  videoProviderDispatchCount: 0;
  falDispatchCount: 0;
  entry003Package: import('../../../../../shared/site00-expression-engine/entry-003/types.js').Entry003C14Package;
  seniorCreativeJudgment?: import('../../../../../shared/site00-expression-engine/senior-creative-judgment/types.js').SeniorCreativeJudgmentOutput;
  nextAction: string;
};

import type { MeridianComparisonViewData } from './MeridianDeterministicVsLiveComparison.js';

export type ExpressionEngineEntry002State = {
  phase2: ExpressionEngineB1Phase2Response;
  blueprint: Entry002ProductionBlueprint;
  b48: B48PipelineResponse | null;
  b49r4: B49R4PipelineResponse | null;
  c1: C1NarrativeSynthesisResponse | null;
  c11: C11CreativeDirectorResponse | null;
  c12: C12Entry003Response | null;
  c16: { multiUnitBlindCampaign: import('./MultiUnitCreativePackageReview.js').MultiUnitCampaignReviewData } | null;
  c19r1: { view: MeridianComparisonViewData } | null;
  loading: boolean;
  error: string | null;
  errorView: import('./expressionEngineErrorState').ExpressionEngineErrorView | null;
  reload: () => Promise<void>;
};
