/**
 * Live CONCEPT_TERRITORIES proof (founder-initiated). No secrets in stdout.
 * SITE00_CREATIVE_DIRECTOR_API_BASE defaults to http://127.0.0.1:8787
 */
import { bootstrapSite00IngestWorkspace } from '../../src/studioos/experience-compiler/workspace/bootstrap.js';
import { buildCreativeDirectorSnapshot } from '../../src/studioos/experience-compiler/creativeDirector/workspaceSnapshot.js';

const API_BASE = (process.env.SITE00_CREATIVE_DIRECTOR_API_BASE || 'http://127.0.0.1:8787').replace(/\/$/, '');

async function api(action: string, body: Record<string, unknown> = {}) {
  const isGet = action === 'runtime-status';
  const url = `${API_BASE}/api/site00/experience-compiler-creative-director?action=${action}`;
  const res = await fetch(url, {
    method: isGet ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: isGet ? undefined : JSON.stringify({ ...body, action }),
  });
  return { status: res.status, json: (await res.json().catch(() => ({}))) as Record<string, unknown> };
}

const ws = bootstrapSite00IngestWorkspace('site00');
const snapshot = buildCreativeDirectorSnapshot(ws);

const status = await api('runtime-status');
console.log(
  JSON.stringify({
    OPENAI_API_KEY_PRESENT: status.json.OPENAI_API_KEY_PRESENT,
    model: status.json.model,
    reasoning_effort: status.json.reasoning_effort,
    persistence_backend: status.json.persistence_backend,
    http: status.status,
  }),
);

const created = await api('create-thread', {
  project_id: ws.project_id,
  project_slug: 'site00',
  title: 'SITE 00 → YOUR SPACE → CREATIVE ARCHITECTURE',
  task_mode: 'CONCEPT_TERRITORIES',
});
const thread_id = (created.json.thread as { thread_id?: string } | undefined)?.thread_id;
if (!thread_id) {
  console.error('CREATE_THREAD_FAILED');
  process.exit(2);
}

const run = await api('run', {
  thread_id,
  snapshot,
  founder_initiated: true,
  task_mode: 'CONCEPT_TERRITORIES',
});

const artifact = run.json.artifact as { payload?: { territories?: unknown[] } } | undefined;
const runRec = run.json.run as { run_id?: string; model?: string; reasoning_level?: string; task_mode?: string } | undefined;
const territories = artifact?.payload?.territories;
console.log(
  JSON.stringify({
    thread_id,
    run_id: runRec?.run_id,
    model: runRec?.model,
    reasoning: runRec?.reasoning_level,
    task_mode: runRec?.task_mode,
    status: run.json.runtime_state ?? (run.json.ok ? 'LIVE_RUN_SUCCEEDED' : 'LIVE_RUN_FAILED'),
    artifact_count: Array.isArray(territories) ? territories.length : 0,
    http: run.status,
  }),
);

if (!run.json.ok) process.exit(3);
