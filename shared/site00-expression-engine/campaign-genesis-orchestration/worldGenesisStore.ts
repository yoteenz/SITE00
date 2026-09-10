/**
 * P0.CGO.1 — In-memory world bible + orchestration state.
 */

import type {
  CampaignContentSequenceItem,
  CampaignCoverageCell,
  CampaignExecutionBible,
  CampaignShotRole,
  CampaignWorldBible,
  CreativeNextBestAction,
  CreativeTaskNode,
  FounderApprovalStage,
  LocationStoryPotential,
  MotifPropagationMap,
} from './types.js';

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
};

const bibles = new Map<string, CampaignWorldBible>();
const orchestrations = new Map<string, OrchestrationState>();

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

export function clearWorldGenesisStoreForTest(): void {
  bibles.clear();
  orchestrations.clear();
}
