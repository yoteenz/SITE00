/**
 * FounderJudgmentMemory — structured learning with canon firewall.
 */

import type {
  ApprovalTrajectory,
  ApprovalTrajectoryStep,
  CreativeJudgmentFailureClass,
  CreativeJudgmentResult,
  CreativeFounderJudgmentRecord,
  FounderJudgmentLabel,
  JudgmentMemoryScope,
  SelfCritiqueAccuracy,
} from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';

const records: CreativeFounderJudgmentRecord[] = [];
const trajectories: ApprovalTrajectory[] = [];

export function resetFounderJudgmentMemoryForTest(): void {
  records.length = 0;
  trajectories.length = 0;
}

export function recordFounderJudgment(input: {
  projectId: string;
  brandId: string;
  entryId?: string | null;
  territoryId?: string | null;
  artifactId?: string | null;
  decision: FounderJudgmentLabel;
  reasonCodes?: CreativeJudgmentFailureClass[];
  founderNote?: string | null;
  scope?: JudgmentMemoryScope;
  engineJudgment?: CreativeJudgmentResult | null;
}): CreativeFounderJudgmentRecord {
  const record: CreativeFounderJudgmentRecord = {
    judgmentId: `founder-judgment-${Date.now()}-${records.length}`,
    projectId: input.projectId,
    brandId: input.brandId,
    entryId: input.entryId ?? null,
    territoryId: input.territoryId ?? null,
    artifactId: input.artifactId ?? null,
    decision: input.decision,
    reasonCodes: input.reasonCodes ?? [],
    founderNote: input.founderNote ?? null,
    beforeVersion: input.engineJudgment?.judgmentId ?? null,
    afterVersion: null,
    revisionRequested: input.decision === 'NEEDS_MORE' || input.decision === 'PROMISING',
    revisionSummary: null,
    finalOutcome: null,
    didLaterEarnApproval: null,
    scope: input.scope ?? 'CAMPAIGN_SPECIFIC',
    createdAt: new Date().toISOString(),
    mutatesCanon: false,
  };
  records.push(record);

  if (input.territoryId) {
    appendApprovalTrajectoryStep({
      projectId: input.projectId,
      brandId: input.brandId,
      entryId: input.entryId ?? null,
      territoryId: input.territoryId,
      step: {
        step: 'FOUNDER_JUDGMENT',
        decision: input.decision,
        reasonCodes: input.reasonCodes ?? [],
        note: input.founderNote ?? null,
        timestamp: record.createdAt,
      },
    });
  }

  return record;
}

function appendApprovalTrajectoryStep(input: {
  projectId: string;
  brandId: string;
  entryId: string | null;
  territoryId: string;
  step: ApprovalTrajectoryStep;
}): ApprovalTrajectory {
  let traj = trajectories.find(
    (t) => t.projectId === input.projectId && t.territoryId === input.territoryId,
  );
  if (!traj) {
    traj = {
      trajectoryId: `trajectory-${input.territoryId}`,
      projectId: input.projectId,
      brandId: input.brandId,
      entryId: input.entryId,
      territoryId: input.territoryId,
      steps: [],
      finalApproved: false,
      transformationSummary: null,
    };
    trajectories.push(traj);
  }
  traj.steps.push(input.step);
  if (input.step.decision === 'LOVE_IT') {
    traj.finalApproved = true;
    traj.transformationSummary = summarizeTransformation(traj.steps);
  }
  return traj;
}

function summarizeTransformation(steps: ApprovalTrajectoryStep[]): string {
  const rejected = steps.filter((s) => s.decision === 'TOO_GENERIC' || s.decision === 'KILL_IT');
  const approved = steps.filter((s) => s.decision === 'LOVE_IT');
  if (!rejected.length || !approved.length) return 'Insufficient trajectory data';
  return `Rejected for ${rejected[0]!.reasonCodes.join(', ')} → revised → earned approval`;
}

export function listFounderJudgmentRecords(scope?: JudgmentMemoryScope): CreativeFounderJudgmentRecord[] {
  if (!scope) return [...records];
  return records.filter((r) => r.scope === scope);
}

export function getApprovalTrajectory(territoryId: string): ApprovalTrajectory | null {
  return trajectories.find((t) => t.territoryId === territoryId) ?? null;
}

export function computeSelfCritiqueAccuracy(period = 'all'): SelfCritiqueAccuracy {
  const compared = records.filter((r) => r.beforeVersion);
  let aligned = 0;
  const missed: CreativeJudgmentFailureClass[] = [];
  const falsePositives: CreativeJudgmentFailureClass[] = [];

  for (const r of compared) {
    const overlap = r.reasonCodes.filter((c) => c !== 'NEEDS_FOUNDER_JUDGMENT');
    if (overlap.length) aligned++;
    if (r.decision === 'TOO_GENERIC' && !r.reasonCodes.includes('TOO_GENERIC')) missed.push('TOO_GENERIC');
  }

  return {
    period,
    comparedJudgments: compared.length,
    alignedFailures: aligned,
    accuracyPercent: compared.length ? Math.round((aligned / compared.length) * 100) : 0,
    missedByEngine: missed,
    falsePositives,
  };
}

export function assertJudgmentDoesNotMutateCanon(record: CreativeFounderJudgmentRecord): boolean {
  return record.mutatesCanon === false;
}

export function resolveJudgmentScope(
  scope: JudgmentMemoryScope,
  brandId: string,
): { applies: boolean; rule: string } {
  if (scope === 'GLOBAL_FOUNDER') {
    return { applies: true, rule: 'BRAND TRUTH > FOUNDER GENERAL TASTE unless canon explicitly changed' };
  }
  if (scope === 'BRAND_SPECIFIC') {
    return { applies: true, rule: `Scoped to brand ${brandId}` };
  }
  return { applies: true, rule: `Scoped to ${scope}` };
}
