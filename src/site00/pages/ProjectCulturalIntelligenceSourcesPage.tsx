import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { NdxFounderWorkspacePage, FounderWorkspacePanel } from '../components/founderWorkspace';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import type { LiveCulturalIntelligenceRun } from '../../../shared/site00-studio-world-production/liveCulturalIntelligence/types';

export default function ProjectCulturalIntelligenceSourcesPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<LiveCulturalIntelligenceRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [manualNote, setManualNote] = useState('');
  const [manualAttention, setManualAttention] = useState('');

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.culturalIntelligenceGet(projectSlug);
      setRun((result.run as LiveCulturalIntelligenceRun | null) ?? null);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (projectSlug !== 'ndxbook') {
    return (
      <NdxFounderWorkspacePage
        projectSlug={projectSlug}
        title="SOURCE HEALTH"
        nonNdxFallback={<p>Source health is NDXBOOK-only for this proof.</p>}
        operate={null}
      />
    );
  }

  const lastRefresh = run?.refreshRuns?.[run.refreshRuns.length - 1];

  return (
    <NdxFounderWorkspacePage
      projectSlug={projectSlug}
      title="SOURCE HEALTH"
      subtitle="LIVE CULTURAL INTELLIGENCE — SOURCE STACK"
      loading={loading}
      loadingLabel="LOADING SOURCE HEALTH…"
      operate={
        <>
          <FounderWorkspacePanel title="SOURCE FAMILIES">
            <p>The world as seen through the current source stack — not the entire internet.</p>
            {run?.sourceAdapters.map((a) => (
              <div key={a.adapterId}>
                <strong>{a.sourceFamily}</strong> · {a.provider} · {a.status}
                {a.lastSuccessAt ? ` · last success ${a.lastSuccessAt.slice(0, 16)}` : ''}
                {a.signalsFound != null ? ` · signals ${a.signalsFound}` : ''}
                {a.limitations?.length ? ` · ${a.limitations.join('; ')}` : ''}
              </div>
            )) ?? <p>Not configured.</p>}
          </FounderWorkspacePanel>

          {lastRefresh ? (
            <FounderWorkspacePanel title="LAST REFRESH">
              <p>
                Status: {lastRefresh.status} · Raw: {lastRefresh.rawRecordsFound} · Accepted: {lastRefresh.signalsAccepted} ·
                Deduped: {lastRefresh.signalsDeduplicated} · Clusters: {lastRefresh.clustersUpdated}
              </p>
              <p>
                Cost: ${lastRefresh.costUsd.toFixed(4)} · FAL: {lastRefresh.falRequests}
              </p>
              {lastRefresh.errors.length ? <p>Errors: {lastRefresh.errors.join('; ')}</p> : null}
            </FounderWorkspacePanel>
          ) : null}

          {run?.sourceCoverage ? (
            <FounderWorkspacePanel title="COVERAGE / BLIND SPOTS">
              <p>Covered: {run.sourceCoverage.coveredDomains.join(', ') || '—'}</p>
              <p>Weak: {run.sourceCoverage.weakDomains.join(', ') || '—'}</p>
              <p>Uncovered: {run.sourceCoverage.uncoveredDomains.join(', ') || '—'}</p>
              <p>{run.sourceCoverage.knownBlindSpots.join(' · ')}</p>
            </FounderWorkspacePanel>
          ) : null}

          <FounderWorkspacePanel title="REFRESH LIVE INTELLIGENCE">
            <button
              type="button"
              className="site00-btn site00-btn--primary"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void site00ProjectsApi
                  .culturalIntelligenceRefresh(projectSlug)
                  .then((r) => setRun(r.run as LiveCulturalIntelligenceRun))
                  .finally(() => setBusy(false));
              }}
            >
              REFRESH LIVE INTELLIGENCE
            </button>
          </FounderWorkspacePanel>

          <FounderWorkspacePanel title="ADD SOMETHING NDX SHOULD LOOK AT">
            <input type="text" placeholder="What caught attention" value={manualAttention} onChange={(e) => setManualAttention(e.target.value)} />
            <textarea placeholder="Founder note" value={manualNote} onChange={(e) => setManualNote(e.target.value)} rows={3} />
            <button
              type="button"
              className="site00-btn"
              disabled={busy || !manualNote.trim() || !manualAttention.trim()}
              onClick={() => {
                setBusy(true);
                void site00ProjectsApi
                  .culturalIntelligenceAddManualSignal(projectSlug, { founderNote: manualNote, whatCaughtAttention: manualAttention })
                  .then((r) => {
                    setRun(r.run as LiveCulturalIntelligenceRun);
                    setManualNote('');
                    setManualAttention('');
                  })
                  .finally(() => setBusy(false));
              }}
            >
              SUBMIT MANUAL SIGNAL
            </button>
          </FounderWorkspacePanel>
        </>
      }
    />
  );
}
