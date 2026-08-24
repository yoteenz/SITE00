import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { NdxFounderWorkspacePage } from '../components/founderWorkspace/NdxFounderWorkspacePage';
import { RealismLabOperateLayer } from '../components/realismLab/RealismLabOperateLayer';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import type { RealismLabState } from '../../../shared/site00-studio-world-production/cinematicRealismLab/types';
import '../styles/site00-realism-lab.css';
import '../styles/site00-founder-workspace.css';

/** P0.CR.1 — Cinematic Realism Lab routes share this page shell. */

export default function ProjectRealismLabPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const location = useLocation();
  const [state, setState] = useState<RealismLabState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!projectSlug) return;
    try {
      const result = await site00ProjectsApi.cinematicRealismLabGet(projectSlug);
      setState(result.state as unknown as RealismLabState);
    } catch {
      setState(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const act = async (fn: () => Promise<{ state: Record<string, unknown> }>) => {
    setBusy(true);
    try {
      const result = await fn();
      setState(result.state as unknown as RealismLabState);
    } finally {
      setBusy(false);
    }
  };

  const sectionTitle = location.pathname.includes('/brief')
    ? 'EXPERIMENT BRIEF'
    : location.pathname.includes('/providers')
      ? 'PROVIDER MATRIX'
      : location.pathname.includes('/review')
        ? 'RUN REVIEW'
        : location.pathname.includes('/continuity')
          ? 'CONTINUITY'
          : location.pathname.includes('/decision')
            ? 'DECISION'
            : location.pathname.includes('/runs')
              ? 'LANE RUNS'
              : 'REALISM LAB';

  return (
    <NdxFounderWorkspacePage
      projectSlug={projectSlug}
      title={sectionTitle}
      subtitle="Cinematic Realism Engine — multi-provider evaluation"
      attentionBadge={state?.experiments[0]?.status === 'REVIEW' ? 'READY TO REVIEW' : 'DEVELOPING'}
      loading={loading}
      loadingLabel="Loading Realism Lab…"
      operate={
        <RealismLabOperateLayer
          projectSlug={projectSlug}
          state={state}
          busy={busy}
          onQueueLanes={(experimentId) => void act(() => site00ProjectsApi.cinematicRealismLabQueueLanes(projectSlug, experimentId))}
          onSimulateOutputs={(experimentId) => void act(() => site00ProjectsApi.cinematicRealismLabSimulateOutputs(projectSlug, experimentId))}
          onJudgment={(experimentId, runId, assetId, judgment) =>
            void act(() => site00ProjectsApi.cinematicRealismLabJudgment(projectSlug, experimentId, runId, assetId, judgment))
          }
          onFinalize={(experimentId) => void act(() => site00ProjectsApi.cinematicRealismLabFinalizeDecision(projectSlug, experimentId))}
        />
      }
      inspect={
        <dl>
          <dt>ARCHITECTURE</dt>
          <dd>P0.CR.1</dd>
          <dt>PROVIDER REQUESTS</dt>
          <dd>{state?.accounting.providerRequests ?? 0}</dd>
          <dt>FAL REQUESTS</dt>
          <dd>{state?.accounting.falRequests ?? 0}</dd>
          <dt>EST. COST</dt>
          <dd>${state?.accounting.totalEstimatedUsd.toFixed(2) ?? '0.00'}</dd>
        </dl>
      }
      nonNdxFallback={<p>Realism Lab is enabled for configured Studio World projects (NDXBOOK, Frontal Slayer).</p>}
    />
  );
}
