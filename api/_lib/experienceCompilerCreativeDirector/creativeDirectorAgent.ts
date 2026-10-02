import { compileCreativeContextPack } from '../../../shared/studioos-experience-compiler/creativeDirector/contextPackCompiler.js';
import { downstreamGateReadiness } from '../../../shared/studioos-experience-compiler/creativeDirector/handoffs.js';
import {
  activeFounderJudgmentsForContext,
  canPromoteJudgmentToApproval,
  isQuarantinedTestJudgment,
} from '../../../shared/studioos-experience-compiler/creativeDirector/judgmentQuarantine.js';
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
import { getCreativeDirectorModelId, getCreativeDirectorReasoningLevel } from './config.js';
import { getThread, saveContextPack, saveRun, saveThread, stashRawResponse } from './store.js';

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function rejectedDirections(thread: CreativeThread): string[] {
  return activeFounderJudgmentsForContext(thread.judgments)
    .filter((j) => j.action === 'WRONG_DIRECTION' || j.action === 'REMOVE')
    .flatMap((j) => [...j.reject, j.founder_note])
    .filter(Boolean);
}

function approvedPayloads(thread: CreativeThread): Record<string, unknown>[] {
  return thread.artifacts.filter((a) => a.approval_state === 'APPROVED').map((a) => a.payload);
}

export async function createCreativeThread(args: {
  project_id: string;
  project_slug: string;
  title: string;
  task_mode: CreativeDirectorTaskMode;
}): Promise<CreativeThread> {
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
  await saveThread(thread);
  return thread;
}

export async function appendFounderMessage(threadId: string, text: string): Promise<CreativeThread | null> {
  const thread = await getThread(threadId);
  if (!thread) return null;
  const next: CreativeThread = {
    ...thread,
    updated_at: new Date().toISOString(),
    messages: [
      ...thread.messages,
      { message_id: uid('msg'), role: 'founder', text, created_at: new Date().toISOString(), run_id: null },
    ],
  };
  await saveThread(next);
  return next;
}

export async function runCreativeDirectorAgent(args: {
  thread_id: string;
  snapshot: WorkspaceCreativeDirectorSnapshot;
  task_mode?: CreativeDirectorTaskMode;
  founder_initiated: boolean;
  revision_message?: string;
  revision_from_judgment?: FounderJudgment;
  reasoning_effort?: 'low' | 'medium' | 'high' | 'max';
}): Promise<CreativeDirectorRunResult> {
  const thread = await getThread(args.thread_id);
  if (!thread) {
    throw new Error('THREAD_NOT_FOUND');
  }

  if (thread.run_status === 'RUNNING' || thread.run_status === 'COMPILING_CONTEXT') {
    return {
      ok: false,
      run: {
        run_id: uid('cd_run'),
        thread_id: thread.thread_id,
        project_id: thread.project_id,
        task_mode: thread.task_mode,
        context_pack_id: thread.last_context_pack_id ?? 'pending',
        model: getCreativeDirectorModelId(),
        reasoning_level: getCreativeDirectorReasoningLevel(),
        status: 'FAILED',
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
        input_token_estimate: null,
        output_token_estimate: null,
        run_count_for_thread: thread.artifacts.length + 1,
        artifact_id: null,
        validation_error: 'DUPLICATE_RUN_BLOCKED',
        raw_response_storage_key: null,
      },
      validation_error: 'A creative run is already in progress for this thread.',
    };
  }

  const task_mode = args.task_mode ?? thread.task_mode;
  const run_id = uid('cd_run');
  const started = new Date().toISOString();

  let working: CreativeThread = { ...thread, run_status: 'COMPILING_CONTEXT', updated_at: started };
  await saveThread(working);

  const context_pack = compileCreativeContextPack({
    snapshot: args.snapshot,
    thread: working,
    task_mode,
    approved_artifacts: approvedPayloads(working),
    rejected_directions: rejectedDirections(working),
  });

  await saveContextPack(context_pack);

  working = {
    ...working,
    last_context_pack_id: context_pack.context_pack_id,
    run_status: 'RUNNING',
  };
  await saveThread(working);

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
    reasoning_effort: args.reasoning_effort,
  });

  const run_count = working.artifacts.length + 1;
  const reasoning_level = gateway.ok ? gateway.reasoning_effort : getCreativeDirectorReasoningLevel();

  if (!gateway.ok && 'blocked' in gateway && gateway.blocked) {
    const run = {
      run_id,
      thread_id: thread.thread_id,
      project_id: thread.project_id,
      task_mode,
      context_pack_id: context_pack.context_pack_id,
      model: getCreativeDirectorModelId(),
      reasoning_level,
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
    await saveRun(run);
    working = { ...working, run_status: 'FAILED' };
    await saveThread(working);
    return { ok: false, blocked: gateway.blocked };
  }

  if (!gateway.ok) {
    const rawKey = gateway.raw ? uid('raw') : null;
    if (rawKey && gateway.raw) await stashRawResponse(rawKey, gateway.raw, run_id);
    const run = {
      run_id,
      thread_id: thread.thread_id,
      project_id: thread.project_id,
      task_mode,
      context_pack_id: context_pack.context_pack_id,
      model: getCreativeDirectorModelId(),
      reasoning_level,
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
    await saveRun(run);
    working = { ...working, run_status: run.status };
    await saveThread(working);
    return { ok: false, run, validation_error: gateway.error };
  }

  const priorArtifactId = working.active_artifact_id;
  const artifact: CreativeArtifact = {
    artifact_id: uid('cd_art'),
    thread_id: thread.thread_id,
    project_id: thread.project_id,
    task_mode,
    context_pack_id: context_pack.context_pack_id,
    model: gateway.model,
    reasoning_effort: gateway.reasoning_effort,
    run_id,
    parent_artifact_ids: priorArtifactId ? [priorArtifactId] : [],
    founder_judgment_ids: activeFounderJudgmentsForContext(working.judgments).slice(-3).map((j) => j.judgment_id),
    created_at: new Date().toISOString(),
    approval_state: 'AWAITING_FOUNDER',
    superseded_by: null,
    payload: gateway.parsed,
  };

  const rawKey = uid('raw');
  await stashRawResponse(rawKey, gateway.raw, run_id);

  const run = {
    run_id,
    thread_id: thread.thread_id,
    project_id: thread.project_id,
    task_mode,
    context_pack_id: context_pack.context_pack_id,
    model: gateway.model,
    reasoning_level: gateway.reasoning_effort,
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

  await saveRun(run);

  const artifacts = [...working.artifacts, artifact].map((a) =>
    priorArtifactId && a.artifact_id === priorArtifactId && !a.superseded_by
      ? { ...a, superseded_by: artifact.artifact_id }
      : a,
  );

  working = {
    ...working,
    artifacts,
    active_artifact_id: artifact.artifact_id,
    run_status: 'AWAITING_FOUNDER',
    downstream_readiness: downstreamGateReadiness(artifacts),
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
  await saveThread(working);

  return { ok: true, run, artifact, context_pack };
}

export async function applyFounderJudgmentToThread(args: {
  thread_id: string;
  artifact_id: string;
  action: FounderJudgment['action'];
  founder_note: string;
  preserve?: string[];
  reject?: string[];
  combine_with?: string | null;
  requested_change?: string;
}): Promise<CreativeThread | null> {
  const thread = await getThread(args.thread_id);
  if (!thread) return null;

  if (args.action === 'LOVE_IT' && !canPromoteJudgmentToApproval(args.action, args.founder_note)) {
    throw new Error('QUARANTINED_JUDGMENT_CANNOT_APPROVE');
  }

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
    if (args.action === 'LOVE_IT' && canPromoteJudgmentToApproval(args.action, args.founder_note)) {
      approval_state = 'APPROVED';
    } else if (args.action === 'DEFER') approval_state = 'DEFERRED';
    else if (args.action === 'WRONG_DIRECTION' || args.action === 'REMOVE') approval_state = 'REJECTED';
    else if (args.action === 'PUSH_FURTHER' || args.action === 'AMEND' || args.action === 'REGENERATE') approval_state = 'AMEND_REQUESTED';
    else if (args.action === 'PROMISING') approval_state = 'AWAITING_FOUNDER';

    const payload = { ...a.payload };
    if (args.action === 'LOVE_IT' && a.task_mode === 'CONCEPT_TERRITORIES' && !isQuarantinedTestJudgment(args.founder_note)) {
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
    run_status:
      args.action === 'LOVE_IT' && canPromoteJudgmentToApproval(args.action, args.founder_note)
        ? 'APPROVED'
        : 'REVISION_REQUESTED',
    downstream_readiness: downstreamGateReadiness(artifacts),
  };
  await saveThread(next);
  return next;
}
