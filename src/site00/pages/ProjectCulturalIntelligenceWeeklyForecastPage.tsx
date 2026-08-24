import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { NdxFounderWorkspacePage, FounderWorkspacePanel } from '../components/founderWorkspace';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import type { LiveCulturalIntelligenceRun } from '../../../shared/site00-studio-world-production/liveCulturalIntelligence/types';

export default function ProjectCulturalIntelligenceWeeklyForecastPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<LiveCulturalIntelligenceRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [weekStart, setWeekStart] = useState(new Date().toISOString().slice(0, 10));

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

  const forecast = run?.weeklyForecast;

  if (projectSlug !== 'ndxbook') {
    return (
      <NdxFounderWorkspacePage
        projectSlug={projectSlug}
        title="WEEKLY FORECAST"
        nonNdxFallback={<p>Weekly cultural forecast is NDXBOOK-only.</p>}
        operate={null}
      />
    );
  }

  return (
    <NdxFounderWorkspacePage
      projectSlug={projectSlug}
      title="WEEKLY CULTURAL FORECAST"
      subtitle="PLANNING CAPACITY + OPEN CULTURAL WEATHER"
      loading={loading}
      loadingLabel="LOADING FORECAST…"
      operate={
        <>
          <FounderWorkspacePanel title="GENERATE">
            <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
            <button
              type="button"
              className="site00-btn site00-btn--primary"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void site00ProjectsApi
                  .culturalIntelligenceWeeklyForecast(projectSlug, weekStart)
                  .then((r) => setRun(r.run as LiveCulturalIntelligenceRun))
                  .finally(() => setBusy(false));
              }}
            >
              GENERATE WEEKLY FORECAST
            </button>
          </FounderWorkspacePanel>

          {forecast ? (
            <>
              <FounderWorkspacePanel title={`WEEK OF ${forecast.weekStart}`}>
                <p>
                  OPEN CAPACITY: {forecast.openCapacity.unallocatedCapacity} unallocated ·{' '}
                  {forecast.openCapacity.rapidResponseCapacity} rapid response
                </p>
              </FounderWorkspacePanel>
              <FounderWorkspacePanel title="01 — KNOWN MOMENTS">
                {forecast.knownMoments.map((m) => (
                  <p key={m.id}>
                    {m.name} — {m.certainty}
                  </p>
                ))}
              </FounderWorkspacePanel>
              <FounderWorkspacePanel title="02 — ACCELERATING">
                {forecast.acceleratingConversations.map((s) => (
                  <p key={s.id}>{s.title}</p>
                ))}
              </FounderWorkspacePanel>
              <FounderWorkspacePanel title="03 — CULTURAL WEATHER">
                {forecast.culturalWeather.map((w) => (
                  <p key={w.id}>{w.pattern}</p>
                ))}
              </FounderWorkspacePanel>
              <FounderWorkspacePanel title="07 — NDX OPPORTUNITIES">
                {forecast.brandOpportunities.map((o) => (
                  <p key={o.id}>{o.reasoning}</p>
                ))}
              </FounderWorkspacePanel>
              <FounderWorkspacePanel title="08 — SATURATED / SKIP">
                {forecast.saturatedSkip.map((s) => (
                  <p key={s.id}>{s.rejectionReason ?? s.reasoning}</p>
                ))}
              </FounderWorkspacePanel>
            </>
          ) : (
            <p>No weekly forecast generated yet.</p>
          )}
        </>
      }
    />
  );
}
