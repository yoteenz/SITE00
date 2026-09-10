/**
 * P0.CGO.1 — In-memory world bible + orchestration state.
 */

import type {
  CampaignContentSequenceItem,
  CampaignCoverageCell,
  CampaignExecutionBible,
  CampaignShotRole,
  CampaignWorldBible,
  CampaignWorldCandidate,
  CreativeNextBestAction,
  CreativeTaskNode,
  FounderApprovalStage,
  LocationStoryPotential,
  MotifPropagationMap,
} from './types.js';
import type { ConceptualEfficiencyEnrichment, CreativeReductionPass } from './conceptualEfficiencyTypes.js';

export type OrchestrationState = {
  execution: CampaignExecutionBible;
  shots: CampaignShotRole[];
  sequence: CampaignContentSequenceItem[];
  tasks: CreativeTaskNode[];
  nextAction: CreativeNextBestAction;
  diversity: ReturnType<typeof import('./shotDiversityPlanner.js').planShotDiversity>;
  motifs: MotifPropagationMap[];
  location: LocationStoryPotential;
  coverage: CampaignCoverageCell[];
  reductionPass?: CreativeReductionPass | null;
  highConceptLowComplexity?: boolean;
};

export type CampaignRunPersistence = {
  worldId: string;
  candidateId: string;
  efficiencyEnrichment: ConceptualEfficiencyEnrichment;
  reductionPass?: CreativeReductionPass | null;
  recordedAt: string;
};

const bibles = new Map<string, CampaignWorldBible>();
const orchestrations = new Map<string, OrchestrationState>();
const campaignRuns = new Map<string, CampaignRunPersistence>();
const approvedCandidates = new Map<string, CampaignWorldCandidate>();

export function saveWorldBible(bible: CampaignWorldBible): void {
  bibles.set(bible.worldId, bible);
}

export function getWorldBible(worldId: string): CampaignWorldBible | null {
  return bibles.get(worldId) ?? null;
}

export function saveOrchestration(worldId: string, state: OrchestrationState): void {
  orchestrations.set(worldId, state);
}

export function getOrchestration(worldId: string): OrchestrationState | null {
  return orchestrations.get(worldId) ?? null;
}

export function advanceApprovalStage(worldId: string, stage: FounderApprovalStage): CampaignWorldBible | null {
  const bible = bibles.get(worldId);
  if (!bible) return null;
  bible.approvalStage = stage;
  return bible;
}

export function saveApprovedCandidate(worldId: string, candidate: CampaignWorldCandidate): void {
  approvedCandidates.set(worldId, candidate);
  if (candidate.efficiencyEnrichment) {
    campaignRuns.set(worldId, {
      worldId,
      candidateId: candidate.candidateId,
      efficiencyEnrichment: candidate.efficiencyEnrichment,
      recordedAt: new Date().toISOString(),
    });
  }
}

export function getApprovedCandidate(worldId: string): CampaignWorldCandidate | null {
  return approvedCandidates.get(worldId) ?? null;
}

export function getCampaignRunPersistence(worldId: string): CampaignRunPersistence | null {
  return campaignRuns.get(worldId) ?? null;
}

export function updateCampaignRunReduction(worldId: string, reductionPass: CreativeReductionPass): void {
  const run = campaignRuns.get(worldId);
  if (run) {
    run.reductionPass = reductionPass;
    campaignRuns.set(worldId, run);
  }
}

export function clearWorldGenesisStoreForTest(): void {
  bibles.clear();
  orchestrations.clear();
  campaignRuns.clear();
  approvedCandidates.clear();
}
