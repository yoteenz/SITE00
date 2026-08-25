import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell, FounderWorkspacePanel, FounderEmptyState } from '../components/founderWorkspace/FounderWorkspaceShell';
import { getProjectExperimentsHubEntries } from '../config/projectExperimentsHub';
import {
  site00ProjectBrandMarketingExpressionExperiment01Path,
  site00ProjectContentLibraryPath,
  site00ProjectExperimentsPath,
} from '../config/routes';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import type { BrandMarketingExpressionRun } from '../../../shared/site00-brand-lore/brandMarketingExpression/types';
import '../styles/site00-founder-workspace.css';

export default function ProjectFounderWorkspaceArchivePage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [marketingRun, setMarketingRun] = useState<BrandMarketingExpressionRun | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!hasProjectCapability(projectSlug, 'PROJECT_CORE')) return;
    try {
      const result = await site00ProjectsApi.marketingExpressionGet(projectSlug);
      setMarketingRun((result.run as BrandMarketingExpressionRun | null) ?? null);
    } catch {
      setMarketingRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (!hasProjectCapability(projectSlug, 'PROJECT_CORE')) {
    return (
      <EcosystemShell hidePageHeader>
        <p>Archive is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const hubEntries = getProjectExperimentsHubEntries(projectSlug);
  const v23 = marketingRun?.experiment01V23;
  const supersededCount = v23?.generationSupersessionForensic?.completedAssetsPreserved ?? 0;
  const historicalVersions = ['V1', 'V2', 'V2.1', 'V2.2', 'V2.3'].filter((v) => {
    if (v === 'V1') return (marketingRun?.experiment01?.artifacts.length ?? 0) > 0;
    if (v === 'V2') return (marketingRun?.experiment01V2?.generatedArtifacts.length ?? 0) > 0;
    if (v === 'V2.1') return (marketingRun?.experiment01V21?.generatedArtifacts.length ?? 0) > 0;
    if (v === 'V2.2') return (marketingRun?.experiment01V22?.generatedArtifacts.length ?? 0) > 0;
    return (v23?.generatedArtifacts.length ?? 0) > 0;
  });

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title="ARCHIVE"
        subtitle="HISTORICAL WORK · SUPERSEDED GENERATIONS · IMMUTABLE RECEIPTS"
        operate={
          loading ? (
            <p>Loading archive…</p>
          ) : (
            <>
              <FounderWorkspacePanel title="EXPERIMENT LINEAGE">
                {historicalVersions.length === 0 ? (
                  <FounderEmptyState title="NO ARCHIVED EXPERIMENTS" body="Completed methodology versions will appear here." />
                ) : (
                  <ul className="site00-fws-signal-list">
                    {historicalVersions.map((v) => (
                      <li key={v} className="site00-fws-signal-list__item">
                        <strong>EXPERIMENT 01 — {v}</strong>
                        <Link to={site00ProjectBrandMarketingExpressionExperiment01Path(projectSlug)}>INSPECT →</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </FounderWorkspacePanel>

              <FounderWorkspacePanel title="SUPERSEDED GENERATIONS">
                {supersededCount > 0 ? (
                  <p>
                    {supersededCount} assets preserved from methodology supersession (P0.5C.4B.1). Prompt receipts remain
                    inspectable on Experiment 01.
                  </p>
                ) : (
                  <FounderEmptyState title="NO SUPERSESSION EVENTS" body="Immutable generation lineage is intact." />
                )}
              </FounderWorkspacePanel>

              <FounderWorkspacePanel title="FULL EXPERIMENT INDEX">
                <Link to={site00ProjectExperimentsPath(projectSlug)} className="site00-fws-pulse__cta">
                  VIEW ALL EXPERIMENTS →
                </Link>
                <p style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
                  {hubEntries.length} methodology entries · {historicalVersions.length} Experiment 01 versions preserved
                </p>
              </FounderWorkspacePanel>

              <FounderWorkspacePanel title="CONTENT LIBRARY">
                <Link to={site00ProjectContentLibraryPath(projectSlug)} className="site00-fws-inspect-trigger">
                  HISTORICAL ASSETS + RECEIPTS →
                </Link>
              </FounderWorkspacePanel>
            </>
          )
        }
        inspect={
          <div className="site00-fws-legacy-inspect">
            <p>Archive inspect layer — all historical routes remain accessible via Experiments Hub and Content Library.</p>
            <ul>
              {hubEntries.map((e) => (
                <li key={e.id}>
                  <Link to={e.path}>{e.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        }
      />
    </EcosystemShell>
  );
}
