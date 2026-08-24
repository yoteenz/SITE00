import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from '../components/founderWorkspace/FounderWorkspaceShell';
import {
  CulturalIntelligenceInspectContent,
  CulturalIntelligenceRadarRoom,
} from '../components/founderWorkspace/CulturalIntelligenceRadarRoom';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import {
  site00ProjectContentOperationsPath,
  site00ProjectCulturalIntelligenceWeeklyForecastPath,
} from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { LiveCulturalIntelligenceRun } from '../../../shared/site00-studio-world-production/liveCulturalIntelligence/types';
import '../styles/site00-replay-execution.css';
import '../styles/site00-founder-workspace.css';

type ViewSection = 'LIVE_NOW' | 'COMING' | 'ACCELERATING' | 'WATCHING' | 'OPPORTUNITIES' | 'SKIP' | 'SOURCES';

export default function ProjectCulturalIntelligencePage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<LiveCulturalIntelligenceRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [view] = useState<ViewSection>('LIVE_NOW');

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

  const act = async (fn: () => Promise<{ run?: Record<string, unknown>; intelRun?: Record<string, unknown> }>) => {
    setBusy(true);
    try {
      const result = await fn();
      const next = (result.run ?? result.intelRun) as LiveCulturalIntelligenceRun | undefined;
      if (next) setRun(next);
      else await reload();
    } finally {
      setBusy(false);
    }
  };

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Cultural intelligence is NDXBOOK-only for this proof.</p>
      </EcosystemShell>
    );
  }

  const accelerating = run?.signals.filter((s) => s.velocity >= 0.6 && s.saturation < 0.7) ?? [];
  const opportunities = run?.brandInterpretations.filter((i) => i.decision === 'STRONG_OPPORTUNITY' || i.decision === 'CALLBACK_OPPORTUNITY') ?? [];
  const skip = run?.brandInterpretations.filter((i) => i.decision === 'TOO_SATURATED' || i.decision === 'FORCED_PARTICIPATION') ?? [];

  const legacyInspect = (
    <>
      <header className="site00-project-lore-calibration__hero">
        <ProjectExperimentsHubNav projectSlug={projectSlug} />
        <p className="site00-project-lore-calibration__kicker">P0.5D.2 — LIVE CULTURAL INTELLIGENCE</p>
        <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
        <Link to={site00ProjectContentOperationsPath(projectSlug)}>← CONTENT OPERATIONS</Link>
      </header>
      <CulturalIntelligenceInspectContent
        run={run}
        busy={busy}
        onConfigure={() => void act(() => site00ProjectsApi.culturalIntelligenceConfigure(projectSlug))}
        onRefresh={() => void act(() => site00ProjectsApi.culturalIntelligenceRefresh(projectSlug))}
        onProvingRun={() => void act(() => site00ProjectsApi.culturalIntelligenceProvingRun(projectSlug))}
        onPromoteOpportunities={() => void act(() => site00ProjectsApi.culturalIntelligencePromoteOpportunities(projectSlug))}
        view={view}
        accelerating={accelerating}
        opportunities={opportunities}
        skip={skip}
      />
    </>
  );

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title="CULTURAL INTELLIGENCE"
        subtitle="RADAR ROOM · LIVE SIGNALS"
        attentionBadge={opportunities.length > 0 ? 'INFORMATIONAL' : undefined}
        operate={
          <CulturalIntelligenceRadarRoom
            projectSlug={projectSlug}
            run={run}
            loading={loading}
            busy={busy}
            onConfigure={() => void act(() => site00ProjectsApi.culturalIntelligenceConfigure(projectSlug))}
            onRefresh={() => void act(() => site00ProjectsApi.culturalIntelligenceRefresh(projectSlug))}
            onPromoteOpportunities={() => void act(() => site00ProjectsApi.culturalIntelligencePromoteOpportunities(projectSlug))}
            onPromoteItem={(id) => void act(() => site00ProjectsApi.culturalIntelligencePromoteItem(projectSlug, id))}
          />
        }
        understand={
          run?.watchQueue?.entries.length ? (
            <p style={{ fontSize: 11, color: '#888' }}>
              Watching {run.watchQueue.entries.length} subjects ·{' '}
              <Link to={site00ProjectCulturalIntelligenceWeeklyForecastPath(projectSlug)}>weekly forecast →</Link>
            </p>
          ) : undefined
        }
        inspect={<div className="site00-cd site00-cd--project-calibration">{legacyInspect}</div>}
      />
    </EcosystemShell>
  );
}
