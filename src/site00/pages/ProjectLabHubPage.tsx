import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { CharacterVisualCastingState } from '../../../shared/site00-studio-world-production/characterVisualCasting/types.js';
import { summarizeCharacterReadiness } from '../../../shared/site00-studio-world-production/characterAuthority/readinessSummary.js';
import { buildLabHubSummaries } from '../../../shared/site00-studio-world-production/founderWorkspace/labNavigation/index.js';
import { NdxFounderWorkspacePage } from '../components/founderWorkspace/NdxFounderWorkspacePage';
import { LabHubOperateLayer } from '../components/founderWorkspace/LabHubOperateLayer';
import { getProjectExperimentsHubEntries } from '../config/projectExperimentsHub';
import {
  NDX_EXPERIMENT_01_CANONICAL_TITLE,
  ndxFounderWorkspaceEnabled,
} from '../config/ndxFounderWorkspace';
import {
  site00ProjectExperimentsPath,
  site00ProjectFounderCharacterDiscoveryPath,
} from '../config/routes';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import '../styles/site00-founder-workspace.css';

function findExperiment01Entry(projectSlug: string) {
  const entries = getProjectExperimentsHubEntries(projectSlug);
  for (const entry of entries) {
    const child = entry.children?.find((c) => c.id === 'marketing-expression-experiment-01');
    if (child) {
      return { parent: entry, child };
    }
  }
  return null;
}

function countExperiment01Progress(payload: unknown): { complete: number; total: number } | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  const v23 = record.experiment01V23 ?? record.v23;
  if (!v23 || typeof v23 !== 'object') return null;
  const artifacts = (v23 as Record<string, unknown>).artifacts;
  if (!Array.isArray(artifacts) || artifacts.length === 0) return null;
  const total = artifacts.length;
  const complete = artifacts.filter((a) => {
    if (!a || typeof a !== 'object') return false;
    const art = a as Record<string, unknown>;
    return Boolean(art.selectedGenerationAssetId || art.status === 'COMPLETE' || art.generationStatus === 'COMPLETE');
  }).length;
  return { complete, total };
}

export default function ProjectLabHubPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const enabled = ndxFounderWorkspaceEnabled(projectSlug);
  const experimentEntry = useMemo(() => findExperiment01Entry(projectSlug), [projectSlug]);

  const [castingState, setCastingState] = useState<Awaited<
    ReturnType<typeof site00ProjectsApi.characterVisualCastingGet>
  > | null>(null);
  const [marketingState, setMarketingState] = useState<Awaited<
    ReturnType<typeof site00ProjectsApi.marketingExpressionGet>
  > | null>(null);

  useEffect(() => {
    if (!enabled || !projectSlug) return;
    let cancelled = false;
    void (async () => {
      try {
        const [casting, marketing] = await Promise.all([
          site00ProjectsApi.characterVisualCastingGet(projectSlug),
          site00ProjectsApi.marketingExpressionGet(projectSlug),
        ]);
        if (!cancelled) {
          setCastingState(casting);
          setMarketingState(marketing);
        }
      } catch {
        /* summary falls back to hub registry defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, projectSlug]);

  if (!enabled) {
    return (
      <EcosystemShell hidePageHeader>
        <p className="site00-body">Lab Hub is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const casting = (castingState?.visualCastingState ?? null) as CharacterVisualCastingState | null;
  const readiness = summarizeCharacterReadiness(casting);
  const progress = countExperiment01Progress(marketingState);

  const summaries = buildLabHubSummaries({
    experimentsHubHref: site00ProjectExperimentsPath(projectSlug),
    characterLabHref: site00ProjectFounderCharacterDiscoveryPath(projectSlug),
    experiment01Title: experimentEntry?.child.title ?? NDX_EXPERIMENT_01_CANONICAL_TITLE,
    experiment01StatusNote: experimentEntry?.parent.statusNote ?? 'IN PRODUCTION',
    experiment01Progress: progress,
    characterReadiness: readiness,
    characterBiblePackStatus: casting?.characterBibleAssetPack?.status ?? null,
    continuityReady: casting?.continuityTestReady ?? null,
  });

  return (
    <NdxFounderWorkspacePage
      projectSlug={projectSlug}
      title="LAB"
      subtitle="EXPERIMENTS · CHARACTER"
      operate={<LabHubOperateLayer experiments={summaries.experiments} character={summaries.character} />}
    />
  );
}
