import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import type { MarketingCampaignProductionRun } from '../../../shared/site00-studio-world-production/marketingCampaignProduction/types';
import {
  FounderWorkspaceShell,
  CampaignProductionWall,
  InspectorKeyValue,
} from '../components/founderWorkspace';
import {
  buildCampaignFeedAssets,
  buildCampaignWallDays,
  campaignBoardInspectPayload,
} from '../../../shared/site00-brand-lore/founderWorkspace/campaignWallAdapter';
import '../styles/site00-founder-workspace.css';

export default function ProjectContentOperationsCampaignBoardPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<MarketingCampaignProductionRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [clientMode, setClientMode] = useState(false);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.campaignProductionGet(projectSlug);
      setRun((result.run as MarketingCampaignProductionRun | null) ?? null);
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
      setRun((result.run as MarketingCampaignProductionRun) ?? null);
    } finally {
      setBusy(false);
    }
  };

  const board = run?.board;
  const slide01Assets = board?.assets.filter((a) => a.sequencePosition === 1) ?? [];
  const generatedCount = slide01Assets.filter((a) => a.generatedAssetUrl).length;
  const round01 = board?.rounds.find((r) => r.sequencePosition === 1);
  const round02 = board?.rounds.find((r) => r.sequencePosition === 2);

  const days = useMemo(() => buildCampaignWallDays(run), [run]);
  const feedAssets = useMemo(() => buildCampaignFeedAssets(run), [run]);
  const weekLabel = run?.campaign?.name ?? 'NDXBOOK MARKET TEST 01';

  if (projectSlug !== 'ndxbook') {
    return <p>Campaign board is NDXBOOK-only.</p>;
  }

  const productionActions = (
    <div className="site00-fws-actions">
      <button type="button" className="site00-fws-btn" disabled={busy} onClick={() => setClientMode((v) => !v)}>
        {clientMode ? 'PRODUCTION DETAIL' : 'CLIENT REVIEW'}
      </button>
      {!board && (
        <button type="button" className="site00-fws-btn site00-fws-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.campaignProductionInitialize(projectSlug))}>
          INITIALIZE BOARD
        </button>
      )}
      {board && round01?.status !== 'LOCKED' && (
        <button
          type="button"
          className="site00-fws-btn site00-fws-btn--primary"
          disabled={busy || generatedCount < slide01Assets.length}
          onClick={() => void act(() => site00ProjectsApi.campaignProductionLockRound01(projectSlug))}
        >
          LOCK ROUND 01
        </button>
      )}
      {board && round01?.status === 'LOCKED' && round02?.status === 'PLANNED' && (
        <button type="button" className="site00-fws-btn site00-fws-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.campaignProductionFormulateRound02(projectSlug))}>
          FORMULATE ROUND 02
        </button>
      )}
      {board && (
        <button type="button" className="site00-fws-btn" disabled={busy} onClick={() => void act(() => site00ProjectsApi.campaignProductionSynthesizeCaptions(projectSlug))}>
          SYNTHESIZE CAPTIONS
        </button>
      )}
    </div>
  );

  return (
    <FounderWorkspaceShell
      projectSlug={projectSlug}
      workspaceTitle="CAMPAIGN BOARD"
      inspectTitle="CAMPAIGN PRODUCTION — SYSTEM"
      inspectContent={
        <>
          <InspectorKeyValue data={campaignBoardInspectPayload(run)} />
          {!clientMode && run?.sequenceContracts.length ? (
            <>
              <h3 className="site00-fws-section__title">ROUND 02 CONTRACTS</h3>
              <pre className="site00-fws-inspector__raw">
                {JSON.stringify(
                  run.sequenceContracts.filter((c) => c.sequencePosition === 2).slice(0, 3),
                  null,
                  2,
                )}
              </pre>
            </>
          ) : null}
        </>
      }
      navBadges={{ REVIEW: slide01Assets.filter((a) => a.status === 'GENERATED').length }}
    >
      {loading ? (
        <p className="site00-fws-empty">Loading production wall…</p>
      ) : !board ? (
        <>
          <p className="site00-fws-empty">
            Initialize from Experiment 01 V2.3 — nine topics, horizontal production.
          </p>
          <Link to={`/projects/${projectSlug}/marketing-expression/experiment-01`} className="site00-fws-journey__all">
            OPEN EXPERIMENT 01 →
          </Link>
        </>
      ) : (
        <>
          <CampaignProductionWall
            days={days}
            weekLabel={clientMode ? 'YOUR CONTENT PLAN' : weekLabel}
            feedAssets={feedAssets}
            productionActions={productionActions}
          />

          {!clientMode && (run?.captions ?? []).length > 0 ? (
            <section className="site00-fws-section">
              <h2 className="site00-fws-section__title">CAPTIONS</h2>
              <div className="site00-fws-lead-list">
                {(run?.captions ?? []).map((cap) => {
                  const entry = run?.slate?.entries.find((e) => e.contentPieceId === cap.contentPieceId);
                  return (
                    <article key={cap.captionId} className="site00-fws-lead">
                      <div>
                        <h3 className="site00-fws-lead__headline">{entry?.title ?? cap.contentPieceId}</h3>
                        <p className="site00-fws-lead__line">{cap.text.slice(0, 120)}…</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}
        </>
      )}
    </FounderWorkspaceShell>
  );
}
