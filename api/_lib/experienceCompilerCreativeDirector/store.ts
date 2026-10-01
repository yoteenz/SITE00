import type { CreativeDirectorRunRecord, CreativeThread, FounderJudgment } from '../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';

const threads = new Map<string, CreativeThread>();
const runs = new Map<string, CreativeDirectorRunRecord>();
const rawResponses = new Map<string, string>();

export function resetExperienceCompilerCreativeDirectorStore(): void {
  threads.clear();
  runs.clear();
  rawResponses.clear();
}

export function saveThread(thread: CreativeThread): void {
  threads.set(thread.thread_id, thread);
}

export function getThread(threadId: string): CreativeThread | null {
  return threads.get(threadId) ?? null;
}

export function listThreadsForProject(projectId: string): CreativeThread[] {
  return [...threads.values()].filter((t) => t.project_id === projectId);
}

export function saveRun(run: CreativeDirectorRunRecord): void {
  runs.set(run.run_id, run);
}

export function getRun(runId: string): CreativeDirectorRunRecord | null {
  return runs.get(runId) ?? null;
}

export function stashRawResponse(key: string, raw: string): void {
  rawResponses.set(key, raw);
}

export function getRawResponse(key: string): string | null {
  return rawResponses.get(key) ?? null;
}

export function appendJudgment(threadId: string, judgment: FounderJudgment): CreativeThread | null {
  const thread = threads.get(threadId);
  if (!thread) return null;
  const next: CreativeThread = {
    ...thread,
    judgments: [...thread.judgments, judgment],
    updated_at: new Date().toISOString(),
  };
  threads.set(threadId, next);
  return next;
}
