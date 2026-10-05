import { createHash } from 'node:crypto';
import type {
  CreativeContextPack,
  CreativeDirectorRunRecord,
  CreativeThread,
  FounderJudgment,
} from '../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import { isQuarantinedTestJudgment } from '../../../shared/studioos-experience-compiler/creativeDirector/judgmentQuarantine.js';
import { getSupabaseAdmin, hasSupabaseServiceRole } from '../supabase.js';

export function creativeDirectorPersistenceEnabled(): boolean {
  if (process.env.VITEST === 'true' && process.env.SITE00_CREATIVE_DIRECTOR_TEST_PERSISTENCE !== '1') {
    return false;
  }
  return hasSupabaseServiceRole();
}

function hashManifest(manifest: unknown): string {
  return createHash('sha256').update(JSON.stringify(manifest)).digest('hex').slice(0, 32);
}

export async function persistThreadBundle(thread: CreativeThread): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error: threadErr } = await supabase.from('site00_ec_creative_threads').upsert({
    thread_id: thread.thread_id,
    project_id: thread.project_id,
    project_slug: thread.project_slug,
    title: thread.title,
    task_mode: thread.task_mode,
    run_status: thread.run_status,
    active_artifact_id: thread.active_artifact_id,
    last_context_pack_id: thread.last_context_pack_id,
    downstream_readiness: thread.downstream_readiness,
    created_at: thread.created_at,
    updated_at: thread.updated_at,
  });
  if (threadErr) throw new Error(`PERSISTENCE_FAILED:thread:${threadErr.message}`);

  if (thread.messages.length) {
    const { error } = await supabase.from('site00_ec_creative_messages').upsert(
      thread.messages.map((m) => ({
        message_id: m.message_id,
        thread_id: thread.thread_id,
        role: m.role,
        text: m.text,
        run_id: m.run_id,
        created_at: m.created_at,
      })),
    );
    if (error) throw new Error(`PERSISTENCE_FAILED:messages:${error.message}`);
  }

  if (thread.artifacts.length) {
    const { error } = await supabase.from('site00_ec_creative_artifacts').upsert(
      thread.artifacts.map((a) => ({
        artifact_id: a.artifact_id,
        thread_id: thread.thread_id,
        project_id: a.project_id,
        task_mode: a.task_mode,
        context_pack_id: a.context_pack_id,
        model: a.model,
        reasoning_effort: a.reasoning_effort ?? null,
        parent_artifact_ids: a.parent_artifact_ids,
        founder_judgment_ids: a.founder_judgment_ids,
        approval_state: a.approval_state,
        superseded_by: a.superseded_by,
        payload: a.payload,
        run_id: a.run_id ?? null,
        created_at: a.created_at,
      })),
    );
    if (error) throw new Error(`PERSISTENCE_FAILED:artifacts:${error.message}`);
  }

  if (thread.judgments.length) {
    const { error } = await supabase.from('site00_ec_founder_judgments').upsert(
      thread.judgments.map((j) => ({
        judgment_id: j.judgment_id,
        thread_id: thread.thread_id,
        artifact_id: j.artifact_id,
        project_id: j.project_id,
        action: j.action,
        founder_note: j.founder_note,
        preserve: j.preserve,
        reject: j.reject,
        combine_with: j.combine_with,
        requested_change: j.requested_change,
        quarantined: isQuarantinedTestJudgment(j.founder_note),
        created_at: j.created_at,
      })),
    );
    if (error) throw new Error(`PERSISTENCE_FAILED:judgments:${error.message}`);
  }
}

export async function persistContextPack(pack: CreativeContextPack, storeFull = false): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('site00_ec_creative_context_packs').upsert({
    context_pack_id: pack.context_pack_id,
    thread_id: pack.thread_id,
    project_id: pack.project_id,
    manifest: pack.manifest,
    manifest_hash: hashManifest(pack.manifest),
    compiled_at: pack.compiled_at,
    locked_decisions: pack.locked_decisions,
    rejected_directions: pack.rejected_directions,
    full_context: storeFull
      ? {
          core_context: pack.core_context,
          task_relevant_context: pack.task_relevant_context,
          current_creative_thread: pack.current_creative_thread,
        }
      : null,
  });
  if (error) throw new Error(`PERSISTENCE_FAILED:context_pack:${error.message}`);
}

export async function persistRun(run: CreativeDirectorRunRecord): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('site00_ec_creative_runs').upsert({
    run_id: run.run_id,
    thread_id: run.thread_id,
    project_id: run.project_id,
    task_mode: run.task_mode,
    context_pack_id: run.context_pack_id,
    model: run.model,
    reasoning_effort: run.reasoning_effort,
    status: run.status,
    started_at: run.started_at,
    finished_at: run.finished_at,
    input_tokens: run.input_token_estimate,
    output_tokens: run.output_token_estimate,
    run_count_for_thread: run.run_count_for_thread,
    artifact_id: run.artifact_id,
    validation_error: run.validation_error,
    raw_response_storage_key: run.raw_response_storage_key,
  });
  if (error) throw new Error(`PERSISTENCE_FAILED:run:${error.message}`);
}

export async function persistRawResponse(key: string, body: string, runId?: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('site00_ec_creative_raw_responses').upsert({
    storage_key: key,
    run_id: runId ?? null,
    body,
  });
  if (error) throw new Error(`PERSISTENCE_FAILED:raw:${error.message}`);
}

export async function loadThreadFromDb(threadId: string): Promise<CreativeThread | null> {
  const supabase = getSupabaseAdmin();
  const { data: head, error: headErr } = await supabase
    .from('site00_ec_creative_threads')
    .select('*')
    .eq('thread_id', threadId)
    .maybeSingle();
  if (headErr) throw new Error(`RESTORE_FAILED:${headErr.message}`);
  if (!head) return null;

  const [messages, artifacts, judgments] = await Promise.all([
    supabase.from('site00_ec_creative_messages').select('*').eq('thread_id', threadId).order('created_at'),
    supabase.from('site00_ec_creative_artifacts').select('*').eq('thread_id', threadId).order('created_at'),
    supabase.from('site00_ec_founder_judgments').select('*').eq('thread_id', threadId).order('created_at'),
  ]);

  if (messages.error) throw new Error(`RESTORE_FAILED:messages:${messages.error.message}`);
  if (artifacts.error) throw new Error(`RESTORE_FAILED:artifacts:${artifacts.error.message}`);
  if (judgments.error) throw new Error(`RESTORE_FAILED:judgments:${judgments.error.message}`);

  return {
    thread_id: head.thread_id,
    project_id: head.project_id,
    project_slug: head.project_slug,
    title: head.title,
    task_mode: head.task_mode,
    created_at: head.created_at,
    updated_at: head.updated_at,
    run_status: head.run_status,
    active_artifact_id: head.active_artifact_id,
    last_context_pack_id: head.last_context_pack_id,
    downstream_readiness: head.downstream_readiness,
    messages: (messages.data ?? []).map((m) => ({
      message_id: m.message_id,
      role: m.role,
      text: m.text,
      created_at: m.created_at,
      run_id: m.run_id,
    })),
    artifacts: (artifacts.data ?? []).map((a) => ({
      artifact_id: a.artifact_id,
      thread_id: a.thread_id,
      project_id: a.project_id,
      task_mode: a.task_mode,
      context_pack_id: a.context_pack_id,
      model: a.model,
      reasoning_effort: a.reasoning_effort ?? null,
      run_id: a.run_id ?? null,
      parent_artifact_ids: a.parent_artifact_ids ?? [],
      founder_judgment_ids: a.founder_judgment_ids ?? [],
      created_at: a.created_at,
      approval_state: a.approval_state,
      superseded_by: a.superseded_by,
      payload: a.payload ?? {},
    })),
    judgments: (judgments.data ?? []).map((j) => ({
      judgment_id: j.judgment_id,
      artifact_id: j.artifact_id,
      thread_id: j.thread_id,
      project_id: j.project_id,
      action: j.action,
      founder_note: j.founder_note,
      preserve: j.preserve ?? [],
      reject: j.reject ?? [],
      combine_with: j.combine_with,
      requested_change: j.requested_change,
      created_at: j.created_at,
    })),
  };
}

export async function listThreadsByProject(projectId: string): Promise<CreativeThread[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_ec_creative_threads')
    .select('thread_id')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(`RESTORE_FAILED:list:${error.message}`);
  const out: CreativeThread[] = [];
  for (const row of data ?? []) {
    const t = await loadThreadFromDb(row.thread_id);
    if (t) out.push(t);
  }
  return out;
}
