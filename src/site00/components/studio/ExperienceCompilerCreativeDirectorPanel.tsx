import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ConceptTerritoryArtifact, CreativeThread, FounderJudgmentAction } from '../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import { buildCreativeDirectorSnapshot } from '../../../studioos/experience-compiler/creativeDirector/workspaceSnapshot';
import type { ExperienceCompilerWorkspaceState } from '../../../studioos/experience-compiler/workspace/types';
import { experienceCompilerCreativeDirectorApi, type RuntimeStatus } from '../../services/experienceCompilerCreativeDirectorApi';

const THREAD_STORAGE_KEY = (slug: string) => `site00:ec-creative-thread:${slug}`;

const JUDGMENT_ACTIONS: { action: FounderJudgmentAction; label: string }[] = [
  { action: 'LOVE_IT', label: 'LOVE IT' },
  { action: 'PROMISING', label: 'PROMISING' },
  { action: 'TOO_CLOSE', label: 'TOO CLOSE' },
  { action: 'WRONG_DIRECTION', label: 'WRONG DIRECTION' },
  { action: 'PUSH_FURTHER', label: 'PUSH FURTHER' },
  { action: 'REGENERATE', label: 'REGENERATE' },
  { action: 'COMBINE_WITH', label: 'COMBINE WITH' },
  { action: 'DEFER', label: 'DEFER' },
];

type Props = {
  state: ExperienceCompilerWorkspaceState;
};

export function ExperienceCompilerCreativeDirectorPanel({ state }: Props) {
  const snapshot = useMemo(() => buildCreativeDirectorSnapshot(state), [state]);
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null);
  const [thread, setThread] = useState<CreativeThread | null>(null);
  const [message, setMessage] = useState('');
  const [judgmentNote, setJudgmentNote] = useState('');
  const [contextExpanded, setContextExpanded] = useState(false);
  const [contextPreview, setContextPreview] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const activeArtifact = thread?.artifacts.find((a) => a.artifact_id === thread.active_artifact_id) ?? null;
  const territories = (activeArtifact?.payload?.territories as ConceptTerritoryArtifact[] | undefined) ?? [];

  useEffect(() => {
    void experienceCompilerCreativeDirectorApi.runtimeStatus().then(setRuntime);
  }, []);

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
      state.project_slug === 'site00' ? 'SITE 00 → YOUR SPACE → CREATIVE ARCHITECTURE' : `${state.project_name} creative architecture`;
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

  const refreshContextPreview = useCallback(async () => {
    const t = await ensureThread();
    const { context_pack } = await experienceCompilerCreativeDirectorApi.compileContextPreview(t.thread_id, snapshot);
    setContextPreview(JSON.stringify(context_pack.manifest, null, 2));
  }, [ensureThread, snapshot]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setBusy(true);
    try {
      const t = await ensureThread();
      const { thread: updated } = await experienceCompilerCreativeDirectorApi.founderMessage(t.thread_id, message.trim());
      setThread(updated);
      setMessage('');
    } finally {
      setBusy(false);
    }
  };

  const runCreative = async () => {
    setRunError(null);
    setBusy(true);
    try {
      const t = await ensureThread();
      const result = await experienceCompilerCreativeDirectorApi.run({
        thread_id: t.thread_id,
        snapshot,
        founder_initiated: true,
        revision_message: message.trim() || undefined,
        task_mode: 'CONCEPT_TERRITORIES',
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
    } finally {
      setBusy(false);
    }
  };

  const applyJudgment = async (action: FounderJudgmentAction) => {
    if (!thread?.active_artifact_id) return;
    setBusy(true);
    try {
      const { thread: updated } = await experienceCompilerCreativeDirectorApi.judgment({
        thread_id: thread.thread_id,
        artifact_id: thread.active_artifact_id,
        action,
        founder_note: judgmentNote || action,
      });
      setThread(updated);
      setJudgmentNote('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ec-cd" data-testid="ec-creative-director">
      <div className="ec-cd__grid">
        <aside className="ec-cd__col ec-cd__col--intel">
          <h3>Project intelligence</h3>
          <dl className="ec-cd__dl">
            <dt>Project</dt>
            <dd>{state.project_name}</dd>
            <dt>Mode</dt>
            <dd>{state.mode}</dd>
            <dt>Phase</dt>
            <dd>{snapshot.phase_label}</dd>
            <dt>Approved authorities</dt>
            <dd>{snapshot.approved_authority_count}</dd>
            <dt>Open gates</dt>
            <dd>{snapshot.open_founder_gates.join(', ') || '—'}</dd>
            <dt>Context pack</dt>
            <dd>{thread?.last_context_pack_id ?? 'Not compiled yet'}</dd>
          </dl>
          <button type="button" className="ec-btn ec-btn--ghost" onClick={() => void refreshContextPreview()}>
            Inspect context manifest
          </button>
          {contextExpanded || contextPreview ? (
            <pre className="ec-cd__manifest">{contextPreview || 'Run inspect to view manifest sections.'}</pre>
          ) : null}
          <button type="button" className="ec-btn ec-btn--ghost" onClick={() => setContextExpanded((v) => !v)}>
            {contextExpanded ? 'Hide manifest' : 'Show manifest area'}
          </button>
        </aside>

        <main className="ec-cd__col ec-cd__col--workspace">
          <h3>Creative workspace</h3>
          <p className="ec-cd__thread-title">{thread?.title ?? 'No thread yet — create on first action.'}</p>
          <p className="ec-cd__runtime">
            Model: {runtime?.model ?? '…'} · Reasoning: {runtime?.reasoning_effort ?? '…'} · Runtime:{' '}
            {runtime?.runtime_state ?? (runtime?.configured ? 'MODEL_RUNTIME_READY' : 'MODEL_RUNTIME_BLOCKED')} · Key:{' '}
            {runtime?.OPENAI_API_KEY_PRESENT ?? '—'} · Store: {runtime?.persistence_backend ?? '…'}
          </p>
          {activeArtifact ? (
            <p className="ec-cd__run-meta">
              Run {activeArtifact.run_id?.slice(-10) ?? '—'} · {activeArtifact.model} · {activeArtifact.reasoning_effort ?? '—'} ·{' '}
              {thread?.run_status}
              {activeArtifact.parent_artifact_ids.length ? ` · lineage ← ${activeArtifact.parent_artifact_ids.join(',')}` : ''}
            </p>
          ) : null}
          {runError ? <p className="ec-cd__error">{runError}</p> : null}

          <div className="ec-cd__messages">
            {(thread?.messages ?? []).slice(-8).map((m) => (
              <div key={m.message_id} className={`ec-cd__msg ec-cd__msg--${m.role}`}>
                <span>{m.role}</span>
                <p>{m.text}</p>
              </div>
            ))}
          </div>

          <label className="ec-field">
            Founder message
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="I like territory 2, but it feels too operational…" />
          </label>
          <div className="ec-cd__actions">
            <button type="button" className="ec-btn ec-btn--ghost" disabled={busy} onClick={() => void sendMessage()}>
              Send to thread
            </button>
            <button type="button" className="ec-btn" disabled={busy} onClick={() => void runCreative()}>
              Run Creative Director (founder-initiated)
            </button>
          </div>

          {territories.length > 0 ? (
            <div className="ec-cd__territories">
              {territories.map((t) => (
                <article key={t.territory_id} className="ec-cd__territory-card">
                  <h4>
                    {t.territory_id}: {t.name}
                  </h4>
                  <p>{t.core_idea}</p>
                  <dl className="ec-cd__territory-dl">
                    <dt>Spatial metaphor</dt>
                    <dd>{t.spatial_metaphor}</dd>
                    <dt>Emotional objective</dt>
                    <dd>{t.emotional_objective}</dd>
                    <dt>Experience logic</dt>
                    <dd>{t.experience_logic}</dd>
                    <dt>Information architecture</dt>
                    <dd>{t.information_architecture}</dd>
                    <dt>Interaction language</dt>
                    <dd>{t.interaction_language}</dd>
                    <dt>Visual language</dt>
                    <dd>{t.visual_language}</dd>
                    <dt>Mobile / tablet / desktop / app</dt>
                    <dd>
                      {t.mobile_expression} · {t.tablet_expression} · {t.desktop_expression} · {t.app_expression}
                    </dd>
                    <dt>Project alignment</dt>
                    <dd>{t.project_alignment}</dd>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <p className="ec-note">No structured territories yet. Live runs require server OPENAI_API_KEY — no fabricated outputs.</p>
          )}
        </main>

        <aside className="ec-cd__col ec-cd__col--judgment">
          <h3>Founder judgment</h3>
          <label className="ec-field">
            Note / preserve / reject
            <textarea value={judgmentNote} onChange={(e) => setJudgmentNote(e.target.value)} rows={3} />
          </label>
          <div className="ec-cd__judgment-grid">
            {JUDGMENT_ACTIONS.map(({ action, label }) => (
              <button key={action} type="button" className="ec-btn ec-btn--ghost" disabled={!activeArtifact || busy} onClick={() => void applyJudgment(action)}>
                {label}
              </button>
            ))}
          </div>
          {thread ? (
            <dl className="ec-cd__dl">
              <dt>Readiness</dt>
              <dd>
                VAM {thread.downstream_readiness.visual_authority_model ? '✓' : '—'} · Sonnet{' '}
                {thread.downstream_readiness.sonnet ? '✓' : '—'} · Opus {thread.downstream_readiness.opus ? '✓' : '—'}
              </dd>
            </dl>
          ) : null}
        </aside>
      </div>

      <nav className="ec-cd__rail" aria-label="Creative journey rail">
        {['INTELLIGENCE', 'CONCEPT', 'EXPERIENCE', 'FAMILIES', 'EXPRESSIONS', 'AUTHORITY', 'PRODUCTION'].map((s) => (
          <span key={s}>{s}</span>
        ))}
      </nav>
    </div>
  );
}
