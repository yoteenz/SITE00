import type { CreativeArtifact, CreativeThread } from '../creativeDirectorTypes.js';
import { isQuarantinedTestJudgment } from './judgmentQuarantine.js';

export type CreativeHistoryLine = {
  line_id: string;
  kind: 'proposal' | 'judgment' | 'revision' | 'approval' | 'supersession' | 'handoff_gate';
  at: string;
  summary: string;
  artifact_id: string | null;
  judgment_id: string | null;
  quarantined: boolean;
};

/** View model for MAP2 HISTORY tab integration (data only — no UI redesign). */
export function buildCreativeHistoryLines(thread: CreativeThread): CreativeHistoryLine[] {
  const lines: CreativeHistoryLine[] = [];
  for (const a of thread.artifacts) {
    lines.push({
      line_id: `prop_${a.artifact_id}`,
      kind: 'proposal',
      at: a.created_at,
      summary: `${a.task_mode} artifact ${a.artifact_id.slice(-8)} (${a.approval_state})`,
      artifact_id: a.artifact_id,
      judgment_id: null,
      quarantined: false,
    });
    if (a.superseded_by) {
      lines.push({
        line_id: `sup_${a.artifact_id}`,
        kind: 'supersession',
        at: a.created_at,
        summary: `Superseded by ${a.superseded_by}`,
        artifact_id: a.artifact_id,
        judgment_id: null,
        quarantined: false,
      });
    }
    if (a.approval_state === 'APPROVED') {
      lines.push({
        line_id: `appr_${a.artifact_id}`,
        kind: 'approval',
        at: a.created_at,
        summary: `Approved ${a.task_mode}`,
        artifact_id: a.artifact_id,
        judgment_id: null,
        quarantined: false,
      });
    }
  }
  for (const j of thread.judgments) {
    const q = isQuarantinedTestJudgment(j.founder_note);
    lines.push({
      line_id: `jud_${j.judgment_id}`,
      kind: q ? 'revision' : j.action === 'LOVE_IT' ? 'approval' : 'judgment',
      at: j.created_at,
      summary: `${j.action}: ${j.founder_note.slice(0, 120)}`,
      artifact_id: j.artifact_id,
      judgment_id: j.judgment_id,
      quarantined: q,
    });
  }
  const readiness = thread.downstream_readiness;
  if (readiness.visual_authority_model || readiness.sonnet || readiness.opus) {
    lines.push({
      line_id: `handoff_${thread.thread_id}`,
      kind: 'handoff_gate',
      at: thread.updated_at,
      summary: `Downstream gates VAM=${readiness.visual_authority_model} Sonnet=${readiness.sonnet} Opus=${readiness.opus}`,
      artifact_id: thread.active_artifact_id,
      judgment_id: null,
      quarantined: false,
    });
  }
  return lines.sort((a, b) => a.at.localeCompare(b.at));
}

export function summarizeArtifactLineage(artifact: CreativeArtifact): string {
  return `parents=${artifact.parent_artifact_ids.join(',') || 'none'} judgments=${artifact.founder_judgment_ids.join(',') || 'none'}`;
}
