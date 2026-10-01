/**
 * Studio OS Experience Compiler — CGPT Creative Director loop API (server-side model only).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { CreativeDirectorTaskMode, FounderJudgmentAction } from '../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import {
  appendFounderMessage,
  applyFounderJudgmentToThread,
  compileCreativeContextPack,
  compileOpusHandoff,
  compileSonnetHandoff,
  compileVisualAuthorityModelHandoff,
  createCreativeThread,
  creativeDirectorRuntimeBlocked,
  getCreativeDirectorModelId,
  getThread,
  listThreadsForProject,
  runCreativeDirectorAgent,
} from '../_lib/experienceCompilerCreativeDirector/service.js';

function readJsonBody(req: VercelRequest): Record<string, unknown> {
  if (req.body && typeof req.body === 'object') return req.body as Record<string, unknown>;
  return {};
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = String(req.query.action ?? readJsonBody(req).action ?? '');

  if (req.method === 'GET' && action === 'runtime-status') {
    const blocked = creativeDirectorRuntimeBlocked();
    return res.status(200).json({
      model: getCreativeDirectorModelId(),
      configured: !blocked,
      blocked,
    });
  }

  if (req.method === 'GET' && action === 'list-threads') {
    const projectId = String(req.query.projectId ?? '');
    if (!projectId) return res.status(400).json({ error: 'projectId required' });
    return res.status(200).json({ threads: listThreadsForProject(projectId) });
  }

  if (req.method === 'GET' && action === 'get-thread') {
    const threadId = String(req.query.threadId ?? '');
    const thread = threadId ? getThread(threadId) : null;
    if (!thread) return res.status(404).json({ error: 'thread not found' });
    return res.status(200).json({ thread });
  }

  if (req.method === 'POST' && action === 'create-thread') {
    const body = readJsonBody(req);
    const project_id = String(body.project_id ?? '');
    const project_slug = String(body.project_slug ?? '');
    const title = String(body.title ?? 'Creative thread');
    const task_mode = String(body.task_mode ?? 'CONCEPT_TERRITORIES') as CreativeDirectorTaskMode;
    if (!project_id || !project_slug) return res.status(400).json({ error: 'project_id and project_slug required' });
    const thread = createCreativeThread({ project_id, project_slug, title, task_mode });
    return res.status(201).json({ thread });
  }

  if (req.method === 'POST' && action === 'compile-context-preview') {
    const body = readJsonBody(req);
    const threadId = String(body.thread_id ?? '');
    const snapshot = body.snapshot as Record<string, unknown> | undefined;
    const thread = getThread(threadId);
    if (!thread || !snapshot) return res.status(400).json({ error: 'thread_id and snapshot required' });
    const pack = compileCreativeContextPack({
      snapshot: snapshot as never,
      thread,
      task_mode: thread.task_mode,
      approved_artifacts: [],
      rejected_directions: [],
    });
    return res.status(200).json({ context_pack: pack });
  }

  if (req.method === 'POST' && action === 'founder-message') {
    const body = readJsonBody(req);
    const threadId = String(body.thread_id ?? '');
    const text = String(body.text ?? '');
    const thread = appendFounderMessage(threadId, text);
    if (!thread) return res.status(404).json({ error: 'thread not found' });
    return res.status(200).json({ thread });
  }

  if (req.method === 'POST' && action === 'run') {
    const body = readJsonBody(req);
    const thread_id = String(body.thread_id ?? '');
    const founder_initiated = body.founder_initiated === true;
    const snapshot = body.snapshot;
    if (!founder_initiated) {
      return res.status(400).json({ error: 'founder_initiated must be true for model runs' });
    }
    if (!thread_id || !snapshot) return res.status(400).json({ error: 'thread_id and snapshot required' });

    const result = await runCreativeDirectorAgent({
      thread_id,
      snapshot: snapshot as never,
      founder_initiated: true,
      revision_message: body.revision_message ? String(body.revision_message) : undefined,
      task_mode: body.task_mode ? (String(body.task_mode) as CreativeDirectorTaskMode) : undefined,
    });

    if (!result.ok && 'blocked' in result && result.blocked) {
      return res.status(503).json(result);
    }
    if (!result.ok) {
      return res.status(422).json(result);
    }
    return res.status(200).json(result);
  }

  if (req.method === 'POST' && action === 'judgment') {
    const body = readJsonBody(req);
    const thread = applyFounderJudgmentToThread({
      thread_id: String(body.thread_id ?? ''),
      artifact_id: String(body.artifact_id ?? ''),
      action: String(body.action ?? 'PROMISING') as FounderJudgmentAction,
      founder_note: String(body.founder_note ?? ''),
      preserve: Array.isArray(body.preserve) ? body.preserve.map(String) : undefined,
      reject: Array.isArray(body.reject) ? body.reject.map(String) : undefined,
      combine_with: body.combine_with != null ? String(body.combine_with) : null,
      requested_change: body.requested_change ? String(body.requested_change) : undefined,
    });
    if (!thread) return res.status(404).json({ error: 'thread not found' });
    return res.status(200).json({ thread });
  }

  if (req.method === 'POST' && action === 'handoffs') {
    const body = readJsonBody(req);
    const threadId = String(body.thread_id ?? '');
    const thread = getThread(threadId);
    if (!thread) return res.status(404).json({ error: 'thread not found' });
    const constraints = thread.judgments.filter((j) => j.action === 'LOVE_IT' || j.action === 'PUSH_FURTHER').map((j) => j.founder_note);
    const visual = compileVisualAuthorityModelHandoff({ artifacts: thread.artifacts, founder_constraints: constraints });
    const sonnet = compileSonnetHandoff({
      graph: null,
      families: null,
      surfaces: null,
      approved_authority_ids: [],
      locked_decisions: thread.judgments.map((j) => j.judgment_id),
    });
    const opus = compileOpusHandoff(sonnet, visual ?? { note: 'awaiting visual authority model output' });
    return res.status(200).json({ visual_authority_model: visual, sonnet, opus, readiness: thread.downstream_readiness });
  }

  return res.status(405).json({ error: 'Unsupported method/action' });
}
