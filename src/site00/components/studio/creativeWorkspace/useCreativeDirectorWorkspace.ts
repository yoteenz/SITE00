import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ConceptTerritoryArtifact,
  CreativeDirectorTaskMode,
  CreativeThread,
  FounderJudgmentAction,
} from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import { buildCreativeDirectorSnapshot } from '../../../../studioos/experience-compiler/creativeDirector/workspaceSnapshot';
import type { ExperienceCompilerWorkspaceState } from '../../../../studioos/experience-compiler/workspace/types';
import { experienceCompilerCreativeDirectorApi, type RuntimeStatus } from '../../../services/experienceCompilerCreativeDirectorApi';
import { parseTerritories } from './creativeWorkspaceUtils';

const THREAD_STORAGE_KEY = (slug: string) => `site00:ec-creative-thread:${slug}`;

export function useCreativeDirectorWorkspace(state: ExperienceCompilerWorkspaceState) {
  const snapshot = useMemo(() => buildCreativeDirectorSnapshot(state), [state]);
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null);
  const [thread, setThread] = useState<CreativeThread | null>(null);
  const [threads, setThreads] = useState<CreativeThread[]>([]);
  const [message, setMessage] = useState('');
  const [judgmentNote, setJudgmentNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [runDetailsOpen, setRunDetailsOpen] = useState(false);
  const [territoryIndex, setTerritoryIndex] = useState(0);
  const [comparePair, setComparePair] = useState<[string, string] | null>(null);
  const [hybridizeOpen, setHybridizeOpen] = useState(false);
  const [hybridizeTarget, setHybridizeTarget] = useState<string | null>(null);
  const [lineageOpen, setLineageOpen] = useState(false);
  const [contextManifest, setContextManifest] = useState<string>('');

  const activeArtifact = thread?.artifacts.find((a) => a.artifact_id === thread.active_artifact_id) ?? null;
  const territories = parseTerritories(activeArtifact);
  const taskMode = thread?.task_mode ?? ('CONCEPT_TERRITORIES' as CreativeDirectorTaskMode);

  useEffect(() => {
    void experienceCompilerCreativeDirectorApi.runtimeStatus().then(setRuntime);
    void experienceCompilerCreativeDirectorApi.listThreads(state.project_id).then((r) => setThreads(r.threads ?? []));
  }, [state.project_id]);

  useEffect(() => {
    const stored = localStorage.getItem(THREAD_STORAGE_KEY(state.project_slug));
    if (stored) {
      void experienceCompilerCreativeDirectorApi.getThread(stored).then((r) => {
        if (r.thread) setThread(r.thread);
      });
    }
  }, [state.project_slug]);

  const ensureThread = useCallback(async () => {
    if (thread) return thread;
    const title =
      state.project_slug === 'site00'
        ? 'SITE 00 → YOUR SPACE → CREATIVE ARCHITECTURE'
        : `${state.project_name} → CREATIVE ARCHITECTURE`;
    const { thread: created } = await experienceCompilerCreativeDirectorApi.createThread({
      project_id: state.project_id,
      project_slug: state.project_slug,
      title,
      task_mode: 'CONCEPT_TERRITORIES',
    });
    localStorage.setItem(THREAD_STORAGE_KEY(state.project_slug), created.thread_id);
    setThread(created);
    return created;
  }, [state.project_id, state.project_slug, state.project_name, thread]);

  const selectThread = useCallback(
    async (threadId: string) => {
      const { thread: t } = await experienceCompilerCreativeDirectorApi.getThread(threadId);
      setThread(t);
      localStorage.setItem(THREAD_STORAGE_KEY(state.project_slug), t.thread_id);
    },
    [state.project_slug],
  );

  const sendMessage = async () => {
    if (!message.trim()) return;
    setBusy(true);
    try {
      const t = await ensureThread();
      const { thread: updated } = await experienceCompilerCreativeDirectorApi.founderMessage(t.thread_id, message.trim());
      setThread(updated);
      setMessage('');
      setConversationOpen(true);
    } finally {
      setBusy(false);
    }
  };

  const runCreative = async (mode?: CreativeDirectorTaskMode) => {
    setRunError(null);
    setBusy(true);
    try {
      const t = await ensureThread();
      const result = await experienceCompilerCreativeDirectorApi.run({
        thread_id: t.thread_id,
        snapshot,
        founder_initiated: true,
        revision_message: message.trim() || undefined,
        task_mode: mode ?? taskMode,
      });
      if (!result.ok && 'blocked' in result && result.blocked) {
        setRunError(result.blocked.message);
        return;
      }
      if (!result.ok) {
        setRunError('validation_error' in result ? result.validation_error : 'Run failed');
        return;
      }
      const refreshed = await experienceCompilerCreativeDirectorApi.getThread(t.thread_id);
      setThread(refreshed.thread);
      setTerritoryIndex(0);
    } finally {
      setBusy(false);
    }
  };

  const applyJudgment = async (action: FounderJudgmentAction, territoryId?: string) => {
    if (!thread?.active_artifact_id) return;
    if (action === 'COMBINE_WITH' || action === 'HYBRIDIZE') {
      setHybridizeTarget(territoryId ?? null);
      setHybridizeOpen(true);
      return;
    }
    setBusy(true);
    try {
      const note = judgmentNote || (territoryId ? `${action} · ${territoryId}` : action);
      const { thread: updated } = await experienceCompilerCreativeDirectorApi.judgment({
        thread_id: thread.thread_id,
        artifact_id: thread.active_artifact_id,
        action,
        founder_note: note,
      });
      setThread(updated);
      setJudgmentNote('');
    } finally {
      setBusy(false);
    }
  };

  const loadContextManifest = async () => {
    const t = await ensureThread();
    const { context_pack } = await experienceCompilerCreativeDirectorApi.compileContextPreview(t.thread_id, snapshot);
    setContextManifest(JSON.stringify(context_pack.manifest, null, 2));
  };

  const activeTerritory: ConceptTerritoryArtifact | null = territories[territoryIndex] ?? null;

  return {
    snapshot,
    runtime,
    thread,
    threads,
    message,
    setMessage,
    judgmentNote,
    setJudgmentNote,
    busy,
    runError,
    conversationOpen,
    setConversationOpen,
    runDetailsOpen,
    setRunDetailsOpen,
    territoryIndex,
    setTerritoryIndex,
    comparePair,
    setComparePair,
    hybridizeOpen,
    setHybridizeOpen,
    hybridizeTarget,
    lineageOpen,
    setLineageOpen,
    contextManifest,
    loadContextManifest,
    activeArtifact,
    territories,
    taskMode,
    activeTerritory,
    ensureThread,
    selectThread,
    sendMessage,
    runCreative,
    applyJudgment,
  };
}

export type CreativeDirectorWorkspaceModel = ReturnType<typeof useCreativeDirectorWorkspace>;
