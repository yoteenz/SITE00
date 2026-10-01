import type {
  CreativeContextPack,
  CreativeDirectorRunResult,
  CreativeDirectorTaskMode,
  CreativeThread,
  FounderJudgmentAction,
  WorkspaceCreativeDirectorSnapshot,
} from '../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? '';

function url(action: string, query?: Record<string, string>) {
  const q = new URLSearchParams({ action, ...query });
  return `${API_BASE}/api/site00/experience-compiler-creative-director?${q}`;
}

async function post<T>(action: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(url(action), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, action }),
    credentials: 'include',
  });
  return res.json() as Promise<T>;
}

export type RuntimeStatus = {
  model: string;
  configured: boolean;
  blocked: { code: string; missing: string[]; message: string } | null;
};

export const experienceCompilerCreativeDirectorApi = {
  runtimeStatus: () => fetch(url('runtime-status')).then((r) => r.json() as Promise<RuntimeStatus>),

  listThreads: (projectId: string) =>
    fetch(url('list-threads', { projectId })).then((r) => r.json() as Promise<{ threads: CreativeThread[] }>),

  getThread: (threadId: string) =>
    fetch(url('get-thread', { threadId })).then((r) => r.json() as Promise<{ thread: CreativeThread }>),

  createThread: (args: { project_id: string; project_slug: string; title: string; task_mode: CreativeDirectorTaskMode }) =>
    post<{ thread: CreativeThread }>('create-thread', args),

  compileContextPreview: (thread_id: string, snapshot: WorkspaceCreativeDirectorSnapshot) =>
    post<{ context_pack: CreativeContextPack }>('compile-context-preview', { thread_id, snapshot }),

  founderMessage: (thread_id: string, text: string) => post<{ thread: CreativeThread }>('founder-message', { thread_id, text }),

  run: (args: {
    thread_id: string;
    snapshot: WorkspaceCreativeDirectorSnapshot;
    founder_initiated: boolean;
    revision_message?: string;
    task_mode?: CreativeDirectorTaskMode;
  }) => post<CreativeDirectorRunResult>('run', args),

  judgment: (args: {
    thread_id: string;
    artifact_id: string;
    action: FounderJudgmentAction;
    founder_note: string;
    preserve?: string[];
    reject?: string[];
    combine_with?: string | null;
    requested_change?: string;
  }) => post<{ thread: CreativeThread }>('judgment', args),

  handoffs: (thread_id: string) => post<{ visual_authority_model: unknown; sonnet: unknown; opus: unknown; readiness: unknown }>('handoffs', { thread_id }),
};
