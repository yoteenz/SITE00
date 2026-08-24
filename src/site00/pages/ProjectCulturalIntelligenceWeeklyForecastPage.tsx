import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectCulturalIntelligencePath, site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { LiveCulturalIntelligenceRun } from '../../../shared/site00-studio-world-production/liveCulturalIntelligence/types';
import '../styles/site00-replay-execution.css';

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
      <EcosystemShell hidePageHeader>
        <p>Weekly cultural forecast is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <ProjectExperimentsHubNav projectSlug={projectSlug} />
            <p className="site00-project-lore-calibration__kicker">P0.5D.1 — WEEKLY CULTURAL FORECAST</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <Link to={site00ProjectCulturalIntelligencePath(projectSlug)}>← CULTURAL INTELLIGENCE</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p>Loading forecast…</p>
          ) : (
            <>
              <section className="site00-experiment-g__panel">
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
              </section>

              {forecast ? (
                <>
                  <section className="site00-experiment-g__panel">
                    <h2>WEEK OF {forecast.weekStart}</h2>
                    <p>OPEN CAPACITY: {forecast.openCapacity.unallocatedCapacity} unallocated · {forecast.openCapacity.rapidResponseCapacity} rapid response</p>
                  </section>
                  <section className="site00-experiment-g__panel">
                    <h2>01 — KNOWN MOMENTS</h2>
                    {forecast.knownMoments.map((m) => (
                      <p key={m.id}>{m.name} — {m.certainty}</p>
                    ))}
                  </section>
                  <section className="site00-experiment-g__panel">
                    <h2>02 — ACCELERATING</h2>
                    {forecast.acceleratingConversations.map((s) => (
                      <p key={s.id}>{s.title}</p>
                    ))}
                  </section>
                  <section className="site00-experiment-g__panel">
                    <h2>03 — CULTURAL WEATHER</h2>
                    {forecast.culturalWeather.map((w) => (
                      <p key={w.id}>{w.pattern}</p>
                    ))}
                  </section>
                  <section className="site00-experiment-g__panel">
                    <h2>07 — NDX OPPORTUNITIES</h2>
                    {forecast.brandOpportunities.map((o) => (
                      <p key={o.id}>{o.reasoning}</p>
                    ))}
                  </section>
                  <section className="site00-experiment-g__panel">
                    <h2>08 — SATURATED / SKIP</h2>
                    {forecast.saturatedSkip.map((s) => (
                      <p key={s.id}>{s.rejectionReason ?? s.reasoning}</p>
                    ))}
                  </section>
                </>
              ) : (
                <p>No weekly forecast generated yet.</p>
              )}
            </>
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
