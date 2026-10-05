import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from '../components/founderWorkspace/FounderWorkspaceShell';
import {
  ContentOperationsEditorialDesk,
  ContentOperationsInspectContent,
} from '../components/founderWorkspace/ContentOperationsEditorialDesk';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import type { ContentOperationsRun } from '../../../shared/site00-brand-lore/contentOperations/types';
import '../styles/site00-founder-workspace.css';

export default function ProjectContentOperationsPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<ContentOperationsRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!hasProjectCapability(projectSlug, 'CONTENT_OPERATIONS')) return;
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

  const act = async (fn: () => Promise<{ run: Record<string, unknown> }>) => {
    setBusy(true);
    try {
      const result = await fn();
      setRun((result.run as ContentOperationsRun) ?? null);
    } finally {
      setBusy(false);
    }
  };

  if (!hasProjectCapability(projectSlug, 'CONTENT_OPERATIONS')) {
    return (
      <EcosystemShell hidePageHeader>
        <p>Content Operations is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title="TODAY AT NDX"
        subtitle="CONTENT OPERATIONS + PERFORMANCE LEARNING"
        attentionBadge={run?.contentPackages.some((p) => p.status === 'FOUNDER_REVIEW') ? 'NEEDS YOUR EYE' : undefined}
        operate={
          <ContentOperationsEditorialDesk
            projectSlug={projectSlug}
            run={run}
            loading={loading}
            busy={busy}
            onPrepare={() => void act(() => site00ProjectsApi.contentOperationsPrepare(projectSlug))}
            onCompile={() => void act(() => site00ProjectsApi.contentOperationsCompile(projectSlug))}
            onDiscover={() => void act(() => site00ProjectsApi.contentOperationsDiscoverOpportunities(projectSlug))}
            onProposeSlate={() => void act(() => site00ProjectsApi.contentOperationsProposeSlate(projectSlug))}
            onApproveSlate={() => void act(() => site00ProjectsApi.contentOperationsApproveSlate(projectSlug, 'APPROVE_SLATE'))}
            onApprovePackage={(id) => void act(() => site00ProjectsApi.contentOperationsApprovePackage(projectSlug, id))}
          />
        }
        understand={
          run?.activeSlate ? (
            <p style={{ margin: 0, fontSize: 11, color: '#999' }}>
              Weekly slate: {run.activeSlate.contentCandidates.length} candidates · character range across{' '}
              {Object.keys(run.activeSlate.topicBalance).length} topics
            </p>
          ) : undefined
        }
        inspect={<ContentOperationsInspectContent run={run} />}
      />
    </EcosystemShell>
  );
}
