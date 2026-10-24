import type { ApprovalDomain, ApprovalState } from './types.js';

export const PIPELINE_STAGES = [
  { id: 'STORY_APPROVED', name: 'Story approved', input: ['Master release row'], output: 'SEASON1_86_RELEASE_MASTER_V1.json row', approval: 'STORY_STRUCTURE', spends: false, provider: null },
  { id: 'SCREENPLAY_DRAFTED', name: 'Screenplay drafted', input: ['Approved master row', 'Dialogue registry', 'Asset registry'], output: 'SCREENPLAYS/<release>.fountain', approval: null, spends: false, provider: 'SCREENWRITING' },
  { id: 'CONTINUITY_VALIDATED', name: 'Continuity validated', input: ['Screenplay', 'Master', 'Knowledge ledger', 'Registries'], output: 'CONTINUITY_VALIDATION_REPORT_V1.json entries', approval: null, spends: false, provider: null },
  { id: 'FOUNDER_SCRIPT_APPROVAL', name: 'Founder script approval', input: ['Validated screenplay (0 hard conflicts)'], output: 'APPROVAL_STATE_V1.json SCREENPLAY record', approval: 'SCREENPLAY', spends: false, provider: null },
  { id: 'SHOT_LIST_GENERATED', name: 'Shot list generated', input: ['Approved screenplay', 'Asset registry', 'Price quotes'], output: 'SHOT_LISTS/<release>.json', approval: 'SHOT_PLAN', spends: false, provider: null },
  { id: 'ASSETS_RESOLVED', name: 'Assets resolved', input: ['Approved shot list', 'Character, set, wardrobe and prop approvals'], output: 'PRODUCTION_MANIFESTS/<release>.json assets', approval: null, spends: false, provider: null },
  { id: 'VOICE_RECORDINGS_PREPARED', name: 'Voice recordings prepared', input: ['Approved screenplay lines', 'Approved character voices'], output: 'Dialogue recordings keyed by line ID', approval: 'CHARACTER_VOICE', spends: true, provider: 'VOICE' },
  { id: 'KEYFRAMES_GENERATED', name: 'Keyframes generated', input: ['Resolved assets', 'Shot start-frame specs'], output: 'Start and end frames keyed by shot ID', approval: null, spends: true, provider: 'IMAGE' },
  { id: 'SHOT_ANIMATION', name: 'Shot animation', input: ['Approved keyframes', 'Shot specs ≤10 s'], output: 'Video clips keyed by shot ID', approval: null, spends: true, provider: 'VIDEO' },
  { id: 'AUDIO_DRIVEN_LIP_SYNC', name: 'Audio-driven lip-sync', input: ['Dialogue clips', 'Approved recordings'], output: 'Lip-synced clips keyed by shot ID', approval: null, spends: true, provider: 'LIP_SYNC' },
  { id: 'SCENE_ASSEMBLY', name: 'Scene assembly', input: ['All clips', 'Recordings', 'Music and effects cues'], output: 'Edit decision list / CapCut manifest', approval: null, spends: false, provider: 'EDITING' },
  { id: 'CONTINUITY_QUALITY_REVIEW', name: 'Continuity / quality review', input: ['Assembled cut', 'Shot list', 'Continuity rules'], output: 'GENERATED_VIDEO approval per shot', approval: 'GENERATED_VIDEO', spends: false, provider: null },
  { id: 'FOUNDER_FINAL_APPROVAL', name: 'Founder final approval', input: ['Reviewed cut'], output: 'FINAL_EDIT approval', approval: 'FINAL_EDIT', spends: false, provider: null },
  { id: 'EXPORT_RELEASE_PACKAGE', name: 'Export / release package', input: ['Approved final edit'], output: 'Release package (not published by this system)', approval: null, spends: false, provider: 'EDITING' },
] as const satisfies ReadonlyArray<{ id: string; name: string; input: string[]; output: string; approval: ApprovalDomain | null; spends: boolean; provider: string | null }>;

export type StageId = (typeof PIPELINE_STAGES)[number]['id'];

export const STAGE_FAILURE_STATES = ['FAILED_RETRYABLE', 'FAILED_TERMINAL', 'BLOCKED'] as const;

export type StageStatus = 'COMPLETE' | 'AWAITING_APPROVAL' | 'DRAFT_PENDING_UPSTREAM' | 'READY' | 'BLOCKED' | 'NOT_STARTED' | 'FAILED_RETRYABLE' | 'FAILED_TERMINAL';

export type StageEvaluation = {
  stage: StageId;
  order: number;
  status: StageStatus;
  blockers: string[];
  artifact: string | null;
  artifactSha256: string | null;
  version: number;
  lineage: string[];
  estimatedCost: { usd: number | null; credits: number | null } | null;
  actualCost: { usd: number | null; credits: number | null } | null;
};

/** Everything the evaluator needs, gathered from repository files by the caller. */
export type ReleaseFacts = {
  releaseId: string;
  approval: (domain: ApprovalDomain) => ApprovalState[];
  screenplay: { path: string; sha256: string; version: number } | null;
  hardFindings: string[];
  shotList: { path: string; sha256: string; screenplaySha256: string; estimatedCost: { usd: number | null; credits: number | null } } | null;
  assetBlockers: string[];
  voiceBlockers: string[];
  spendAuthorized: (stage: StageId) => boolean;
  failures: Partial<Record<StageId, 'FAILED_RETRYABLE' | 'FAILED_TERMINAL'>>;
};

const approved = (states: ApprovalState[]) => states.length > 0 && states.every((s) => s === 'APPROVED');

export function evaluatePipeline(f: ReleaseFacts): StageEvaluation[] {
  const out: StageEvaluation[] = [];
  let upstreamComplete = true;
  for (const [i, stage] of PIPELINE_STAGES.entries()) {
    const ev: StageEvaluation = { stage: stage.id, order: i + 1, status: 'NOT_STARTED', blockers: [], artifact: null, artifactSha256: null, version: 1, lineage: [], estimatedCost: null, actualCost: null };
    const gate = stage.approval ? f.approval(stage.approval) : [];
    switch (stage.id) {
      case 'STORY_APPROVED':
        ev.status = approved(gate) ? 'COMPLETE' : 'AWAITING_APPROVAL';
        ev.artifact = `master:${f.releaseId}`;
        break;
      case 'SCREENPLAY_DRAFTED':
        if (f.screenplay) {
          Object.assign(ev, { artifact: f.screenplay.path, artifactSha256: f.screenplay.sha256, version: f.screenplay.version, lineage: [`master:${f.releaseId}`] });
          ev.status = upstreamComplete ? 'COMPLETE' : 'DRAFT_PENDING_UPSTREAM';
        }
        break;
      case 'CONTINUITY_VALIDATED':
        if (f.screenplay) {
          ev.lineage = [f.screenplay.sha256];
          ev.blockers = [...f.hardFindings];
          ev.status = ev.blockers.length ? 'BLOCKED' : upstreamComplete ? 'COMPLETE' : 'DRAFT_PENDING_UPSTREAM';
        }
        break;
      case 'FOUNDER_SCRIPT_APPROVAL':
        if (f.screenplay) ev.status = approved(gate) ? 'COMPLETE' : 'AWAITING_APPROVAL';
        break;
      case 'SHOT_LIST_GENERATED':
        if (f.shotList) {
          Object.assign(ev, { artifact: f.shotList.path, artifactSha256: f.shotList.sha256, lineage: [f.shotList.screenplaySha256], estimatedCost: f.shotList.estimatedCost });
          if (f.screenplay && f.shotList.screenplaySha256 !== f.screenplay.sha256) {
            ev.status = 'BLOCKED';
            ev.blockers.push('Shot list was generated from an older screenplay version; regenerate.');
          } else if (!upstreamComplete) ev.status = 'DRAFT_PENDING_UPSTREAM';
          else ev.status = approved(gate) ? 'COMPLETE' : 'AWAITING_APPROVAL';
        }
        break;
      case 'ASSETS_RESOLVED':
        ev.blockers = [...f.assetBlockers];
        ev.status = ev.blockers.length ? 'BLOCKED' : upstreamComplete ? 'COMPLETE' : 'NOT_STARTED';
        break;
      default: {
        if (stage.id === 'VOICE_RECORDINGS_PREPARED') ev.blockers.push(...f.voiceBlockers);
        if (stage.approval && !approved(gate) && stage.id !== 'VOICE_RECORDINGS_PREPARED') ev.status = upstreamComplete ? 'AWAITING_APPROVAL' : 'NOT_STARTED';
        if (stage.spends && !f.spendAuthorized(stage.id)) ev.blockers.push('UNAUTHORIZED_SPEND: no founder spend authorization for this stage.');
        if (stage.id === 'VOICE_RECORDINGS_PREPARED' && !approved(gate)) ev.blockers.push('CHARACTER_VOICE not approved for every speaking character.');
        const failure = f.failures[stage.id];
        if (failure) ev.status = failure;
        else if (ev.blockers.length) ev.status = 'BLOCKED';
        else if (ev.status === 'NOT_STARTED' && upstreamComplete) ev.status = 'READY';
      }
    }
    out.push(ev);
    upstreamComplete = upstreamComplete && ev.status === 'COMPLETE';
  }
  return out;
}

export function currentStage(evals: StageEvaluation[]): StageEvaluation {
  return evals.find((e) => e.status !== 'COMPLETE') ?? evals[evals.length - 1];
}
