import type {
  ConceptTerritoryArtifact,
  CreativeArtifact,
  CreativeDirectorTaskMode,
  CreativeThread,
  FounderJudgment,
} from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';

export type JourneyStageStatus =
  | 'NOT_STARTED'
  | 'ACTIVE'
  | 'AWAITING_FOUNDER'
  | 'APPROVED'
  | 'BLOCKED'
  | 'SUPERSEDED'
  | 'DOWNSTREAM_UNLOCKED';

export const JOURNEY_STAGES = [
  'INTELLIGENCE',
  'CONCEPT',
  'EXPERIENCE',
  'FAMILIES',
  'EXPRESSIONS',
  'AUTHORITY',
  'PRODUCTION',
] as const;

export function parseTerritories(artifact: CreativeArtifact | null): ConceptTerritoryArtifact[] {
  if (!artifact?.payload?.territories || !Array.isArray(artifact.payload.territories)) return [];
  return artifact.payload.territories as ConceptTerritoryArtifact[];
}

export function taskModeForThread(thread: CreativeThread | null): CreativeDirectorTaskMode {
  return thread?.task_mode ?? 'CONCEPT_TERRITORIES';
}

export function judgmentForArtifact(judgments: FounderJudgment[], artifactId: string): FounderJudgment | undefined {
  return [...judgments].reverse().find((j) => j.artifact_id === artifactId);
}

export function journeyStageStatus(
  stage: (typeof JOURNEY_STAGES)[number],
  thread: CreativeThread | null,
  taskMode: CreativeDirectorTaskMode,
): JourneyStageStatus {
  if (!thread) return stage === 'INTELLIGENCE' ? 'ACTIVE' : 'NOT_STARTED';
  const modeStage: Record<CreativeDirectorTaskMode, (typeof JOURNEY_STAGES)[number]> = {
    CONCEPT_TERRITORIES: 'CONCEPT',
    HYBRIDIZE_TERRITORIES: 'CONCEPT',
    EXPERIENCE_ARCHITECTURE: 'EXPERIENCE',
    EXPERIENCE_GRAPH: 'EXPERIENCE',
    FAMILY_ARCHITECTURE: 'FAMILIES',
    SURFACE_EXPRESSION: 'EXPRESSIONS',
    AUTHORITY_BRIEF: 'AUTHORITY',
    AUTHORITY_GAP_ANALYSIS: 'AUTHORITY',
    CREATIVE_CRITIQUE: 'CONCEPT',
    FOUNDER_REVISION: 'CONCEPT',
  };
  const active = modeStage[taskMode] ?? 'CONCEPT';
  const idx = JOURNEY_STAGES.indexOf(stage);
  const activeIdx = JOURNEY_STAGES.indexOf(active);
  if (idx < activeIdx) return 'APPROVED';
  if (idx === activeIdx) {
    if (thread.run_status === 'AWAITING_FOUNDER') return 'AWAITING_FOUNDER';
    if (thread.run_status === 'APPROVED') return 'APPROVED';
    return 'ACTIVE';
  }
  return 'NOT_STARTED';
}

export function sonnetHandoffBlocked(thread: CreativeThread | null): boolean {
  if (!thread) return true;
  return !thread.downstream_readiness.sonnet;
}
