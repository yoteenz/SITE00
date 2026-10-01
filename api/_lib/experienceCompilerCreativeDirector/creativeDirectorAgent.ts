import { compileCreativeContextPack } from '../../../shared/studioos-experience-compiler/creativeDirector/contextPackCompiler.js';
import { downstreamGateReadiness } from '../../../shared/studioos-experience-compiler/creativeDirector/handoffs.js';
import { judgmentToRevision, translateFounderMessageToRevision } from '../../../shared/studioos-experience-compiler/creativeDirector/revisionTranslator.js';
import type {
  CreativeArtifact,
  CreativeDirectorRunResult,
  CreativeDirectorTaskMode,
  CreativeThread,
  FounderJudgment,
  WorkspaceCreativeDirectorSnapshot,
} from '../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import { creativeModelGateway } from './creativeModelGateway.js';
import { getCreativeDirectorModelId } from './config.js';
import { getThread, saveRun, saveThread, stashRawResponse } from './store.js';

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function rejectedDirections(thread: CreativeThread): string[] {
  return thread.judgments
    .filter((j) => j.action === 'WRONG_DIRECTION' || j.action === 'REMOVE')
    .flatMap((j) => [...j.reject, j.founder_note])
    .filter(Boolean);
}

function approvedPayloads(thread: CreativeThread): Record<string, unknown>[] {
  return thread.artifacts.filter((a) => a.approval_state === 'APPROVED').map((a) => a.payload);
}

export function createCreativeThread(args: {
  project_id: string;
  project_slug: string;
  title: string;
  task_mode: CreativeDirectorTaskMode;
}): CreativeThread {
  const now = new Date().toISOString();
  const thread: CreativeThread = {
    thread_id: uid('cd_thread'),
    project_id: args.project_id,
    project_slug: args.project_slug,
    title: args.title,
    task_mode: args.task_mode,
    created_at: now,
    updated_at: now,
    messages: [],
    artifacts: [],
    judgments: [],
    active_artifact_id: null,
    run_status: 'READY',
    last_context_pack_id: null,
    downstream_readiness: {
      visual_authority_model: false,
      sonnet: false,
      opus: false,
      asset_surgery: false,
      composer: false,
    },
  };
  saveThread(thread);
  return thread;
}

export function appendFounderMessage(threadId: string, text: string): CreativeThread | null {
  const thread = getThread(threadId);
  if (!thread) return null;
  const next: CreativeThread = {
    ...thread,
    updated_at: new Date().toISOString(),
    messages: [
      ...thread.messages,
      { message_id: uid('msg'), role: 'founder', text, created_at: new Date().toISOString(), run_id: null },
    ],
  };
  saveThread(next);
  return next;
}

export async function runCreativeDirectorAgent(args: {
  thread_id: string;
  snapshot: WorkspaceCreativeDirectorSnapshot;
  task_mode?: CreativeDirectorTaskMode;
  founder_initiated: boolean;
  revision_message?: string;
  revision_from_judgment?: FounderJudgment;
}): Promise<CreativeDirectorRunResult> {
  const thread = getThread(args.thread_id);
  if (!thread) {
    throw new Error('THREAD_NOT_FOUND');
  }

  const task_mode = args.task_mode ?? thread.task_mode;
  const run_id = uid('cd_run');
  const started = new Date().toISOString();

  let working: CreativeThread = { ...thread, run_status: 'COMPILING_CONTEXT', updated_at: started };
  saveThread(working);

  const context_pack = compileCreativeContextPack({
    snapshot: args.snapshot,
    thread: working,
    task_mode,
    approved_artifacts: approvedPayloads(working),
    rejected_directions: rejectedDirections(working),
  });

  working = {
    ...working,
    last_context_pack_id: context_pack.context_pack_id,
    run_status: 'RUNNING',
  };
  saveThread(working);

  const revision_context = args.revision_from_judgment
    ? judgmentToRevision(args.revision_from_judgment)
    : args.revision_message
      ? translateFounderMessageToRevision(args.revision_message)
      : undefined;

  const gateway = await creativeModelGateway({
    task_mode,
    context_pack,
    revision_context,
    founder_initiated: args.founder_initiated,
  });

  const run_count = working.artifacts.length + 1;

  if (!gateway.ok && 'blocked' in gateway && gateway.blocked) {
    const run = {
      run_id,
      thread_id: thread.thread_id,
      project_id: thread.project_id,
      task_mode,
      context_pack_id: context_pack.context_pack_id,
      model: getCreativeDirectorModelId(),
      reasoning_level: null,
      status: 'FAILED' as const,
      started_at: started,
      finished_at: new Date().toISOString(),
      input_token_estimate: null,
      output_token_estimate: null,
      run_count_for_thread: run_count,
      artifact_id: null,
      validation_error: gateway.blocked.message,
      raw_response_storage_key: null,
    };
    saveRun(run);
    working = { ...working, run_status: 'FAILED' };
    saveThread(working);
    return { ok: false, blocked: gateway.blocked };
  }

  if (!gateway.ok) {
    const rawKey = gateway.raw ? uid('raw') : null;
    if (rawKey && gateway.raw) stashRawResponse(rawKey, gateway.raw);
    const run = {
      run_id,
      thread_id: thread.thread_id,
      project_id: thread.project_id,
      task_mode,
      context_pack_id: context_pack.context_pack_id,
      model: getCreativeDirectorModelId(),
      reasoning_level: null,
      status: gateway.raw ? ('FAILED_VALIDATION' as const) : ('FAILED' as const),
      started_at: started,
      finished_at: new Date().toISOString(),
      input_token_estimate: null,
      output_token_estimate: null,
      run_count_for_thread: run_count,
      artifact_id: null,
      validation_error: gateway.error,
      raw_response_storage_key: rawKey,
    };
    saveRun(run);
    working = { ...working, run_status: run.status };
    saveThread(working);
    return { ok: false, run, validation_error: gateway.error };
  }

  const artifact: CreativeArtifact = {
    artifact_id: uid('cd_art'),
    thread_id: thread.thread_id,
    project_id: thread.project_id,
    task_mode,
    context_pack_id: context_pack.context_pack_id,
    model: gateway.model,
    parent_artifact_ids: working.active_artifact_id ? [working.active_artifact_id] : [],
    founder_judgment_ids: working.judgments.slice(-3).map((j) => j.judgment_id),
    created_at: new Date().toISOString(),
    approval_state: 'AWAITING_FOUNDER',
    superseded_by: null,
    payload: gateway.parsed,
  };

  const rawKey = uid('raw');
  stashRawResponse(rawKey, gateway.raw);

  const run = {
    run_id,
    thread_id: thread.thread_id,
    project_id: thread.project_id,
    task_mode,
    context_pack_id: context_pack.context_pack_id,
    model: gateway.model,
    reasoning_level: null,
    status: 'AWAITING_FOUNDER' as const,
    started_at: started,
    finished_at: new Date().toISOString(),
    input_token_estimate: gateway.input_token_estimate,
    output_token_estimate: gateway.output_token_estimate,
    run_count_for_thread: run_count,
    artifact_id: artifact.artifact_id,
    validation_error: null,
    raw_response_storage_key: rawKey,
  };

  saveRun(run);

  working = {
    ...working,
    artifacts: [...working.artifacts, artifact],
    active_artifact_id: artifact.artifact_id,
    run_status: 'AWAITING_FOUNDER',
    downstream_readiness: downstreamGateReadiness([...working.artifacts, artifact]),
    messages: [
      ...working.messages,
      {
        message_id: uid('msg'),
        role: 'creative_director',
        text: `Structured ${task_mode} output ready for founder review.`,
        created_at: new Date().toISOString(),
        run_id,
      },
    ],
  };
  saveThread(working);

  return { ok: true, run, artifact, context_pack };
}

export function applyFounderJudgmentToThread(args: {
  thread_id: string;
  artifact_id: string;
  action: FounderJudgment['action'];
  founder_note: string;
  preserve?: string[];
  reject?: string[];
  combine_with?: string | null;
  requested_change?: string;
}): CreativeThread | null {
  const thread = getThread(args.thread_id);
  if (!thread) return null;

  const judgment: FounderJudgment = {
    judgment_id: uid('judgment'),
    artifact_id: args.artifact_id,
    thread_id: args.thread_id,
    project_id: thread.project_id,
    action: args.action,
    founder_note: args.founder_note,
    preserve: args.preserve ?? [],
    reject: args.reject ?? [],
    combine_with: args.combine_with ?? null,
    requested_change: args.requested_change ?? args.founder_note,
    created_at: new Date().toISOString(),
  };

  const artifacts = thread.artifacts.map((a) => {
    if (a.artifact_id !== args.artifact_id) return a;
    let approval_state = a.approval_state;
    if (args.action === 'LOVE_IT') approval_state = 'APPROVED';
    else if (args.action === 'DEFER') approval_state = 'DEFERRED';
    else if (args.action === 'WRONG_DIRECTION' || args.action === 'REMOVE') approval_state = 'REJECTED';
    else if (args.action === 'PUSH_FURTHER' || args.action === 'AMEND' || args.action === 'REGENERATE') approval_state = 'AMEND_REQUESTED';
    else if (args.action === 'PROMISING') approval_state = 'AWAITING_FOUNDER';

    const payload = { ...a.payload };
    if (args.action === 'LOVE_IT' && a.task_mode === 'CONCEPT_TERRITORIES') {
      const match = args.founder_note.match(/territory\s*([A-C0-9]+)/i);
      if (match) payload.approved_territory_id = match[1].toUpperCase();
    }

    return { ...a, approval_state, payload };
  });

  const next: CreativeThread = {
    ...thread,
    artifacts,
    judgments: [...thread.judgments, judgment],
    updated_at: new Date().toISOString(),
    run_status: args.action === 'LOVE_IT' ? 'APPROVED' : 'REVISION_REQUESTED',
    downstream_readiness: downstreamGateReadiness(artifacts),
  };
  saveThread(next);
  return next;
}
