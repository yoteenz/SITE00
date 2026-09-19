import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
/**
 * P0.CB.1B — Guided founder creative ingestion workflow page.
 */

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from '../components/founderWorkspace/FounderWorkspaceShell';
import { QuietAction, WorkspaceField } from '../components/founderWorkspace/WorkspaceCompositionPrimitives';
import { FounderCreativeIngestionWorkflow } from '../components/founderCreativeIngestion/FounderCreativeIngestionWorkflow';
import { site00ProjectsApi, Site00ProjectsApiError } from '../services/site00ProjectsApi';
import type { FounderCreativeIngestionState } from '../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import '../styles/site00-founder-creative-ingestion.css';

export default function ProjectFounderCreativeIngestionPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [ingestion, setIngestion] = useState<FounderCreativeIngestionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!hasProjectCapability(projectSlug, 'FOUNDER_CREATIVE_INGESTION')) return;
    try {
      const result = await site00ProjectsApi.founderCreativeIngestionGet(projectSlug);
      setIngestion((result.ingestion as FounderCreativeIngestionState | null) ?? null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (!hasProjectCapability(projectSlug, 'FOUNDER_CREATIVE_INGESTION')) {
    return (
      <EcosystemShell hidePageHeader>
        <p>Founder creative ingestion is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title="GUIDED CREATIVE INGESTION"
        subtitle={ingestion?.campaignLabel ?? 'Upload → Decompose → Review → Complete'}
        hideWorkspaceHeader
        operate={
          <WorkspaceField className="site00-fci site00-fci-gw-page">
            {actionError ? (
              <p className="site00-fci__error" role="alert">
                {actionError}
              </p>
            ) : null}

            {!ingestion ? (
              <div className="site00-fci__hero">
                <p className="site00-fci__lead">
                  Bring founder-created carousel direction into Studio World one step at a time.
                </p>
                <QuietAction
                  disabled={busy || loading}
                  onClick={async () => {
                    setBusy(true);
                    setActionError(null);
                    try {
                      const result = await site00ProjectsApi.founderCreativeIngestionInitializeRow01(projectSlug);
                      if (result.ingestion) setIngestion(result.ingestion as FounderCreativeIngestionState);
                    } catch (err) {
                      setActionError(err instanceof Site00ProjectsApiError ? err.message : 'Could not initialize');
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Start launch row 01 →
                </QuietAction>
              </div>
            ) : (
              <FounderCreativeIngestionWorkflow
                projectSlug={projectSlug}
                ingestion={ingestion}
                onIngestionChange={setIngestion}
                loading={loading}
              />
            )}
          </WorkspaceField>
        }
        understand={
          <p style={{ margin: 0, fontSize: 11, color: '#999' }}>
            One screen, one decision. Upload a board, review slides one by one, then complete the sequence.
          </p>
        }
        inspect={
          <p style={{ margin: 0, fontSize: 11, color: '#999' }}>
            Methodology and system details live in Inspect — not on the working surface.
          </p>
        }
      />
    </EcosystemShell>
  );
}
