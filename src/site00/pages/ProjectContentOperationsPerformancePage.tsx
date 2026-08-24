import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from '../components/founderWorkspace/FounderWorkspaceShell';
import {
  PerformanceLearningInspectContent,
  PerformanceLearningRoom,
} from '../components/founderWorkspace/PerformanceLearningRoom';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectContentOperationsPath, site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { ContentOperationsRun } from '../../../shared/site00-brand-lore/contentOperations/types';
import '../styles/site00-replay-execution.css';
import '../styles/site00-founder-workspace.css';

export default function ProjectContentOperationsPerformancePage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<ContentOperationsRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.contentOperationsGet(projectSlug);
      setRun((result.run as ContentOperationsRun | null) ?? null);
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
      <EcosystemShell hidePageHeader>
        <p>Performance review is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const legacyInspect = (
    <>
      <header className="site00-project-lore-calibration__hero">
        <ProjectExperimentsHubNav projectSlug={projectSlug} />
        <p className="site00-project-lore-calibration__kicker">PERFORMANCE + LEARNING</p>
        <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
        <Link to={site00ProjectContentOperationsPath(projectSlug)}>← CONTENT OPERATIONS</Link>
        <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
      </header>
      <PerformanceLearningInspectContent run={run} />
    </>
  );

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title="PERFORMANCE + LEARNING"
        subtitle="OBSERVATION ROOM"
        operate={
          <PerformanceLearningRoom
            run={run}
            loading={loading}
            busy={busy}
            onAcceptLearning={async (learningId) => {
              setBusy(true);
              try {
                const result = await site00ProjectsApi.contentOperationsAcceptLearning(projectSlug, learningId);
                setRun((result.run as ContentOperationsRun) ?? null);
              } finally {
                setBusy(false);
              }
            }}
          />
        }
        inspect={<div className="site00-cd site00-cd--project-calibration">{legacyInspect}</div>}
      />
    </EcosystemShell>
  );
}
