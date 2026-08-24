import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectContentOperationsPath, site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { MarketingCampaignProductionRun } from '../../../shared/site00-studio-world-production/marketingCampaignProduction/types';
import type { BoardViewMode } from '../../../shared/site00-studio-world-production/marketingCampaignProduction/types';
import '../styles/site00-replay-execution.css';

export default function ProjectContentOperationsCampaignBoardPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<MarketingCampaignProductionRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [viewMode, setViewMode] = useState<BoardViewMode>('CAMPAIGN_WALL');
  const [clientMode, setClientMode] = useState(false);
  const [selectedRound, setSelectedRound] = useState(1);

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

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Campaign board is NDXBOOK-only for this proof.</p>
      </EcosystemShell>
    );
  }

  const board = run?.board;
  const campaign = run?.campaign;
  const slate = run?.slate;
  const slide01Assets = board?.assets.filter((a) => a.sequencePosition === 1) ?? [];
  const lockedCount = slide01Assets.filter((a) => a.status === 'LOCKED').length;
  const generatedCount = slide01Assets.filter((a) => a.generatedAssetUrl).length;
  const round01 = board?.rounds.find((r) => r.sequencePosition === 1);
  const round02 = board?.rounds.find((r) => r.sequencePosition === 2);
  const maxDepth = board?.maxSequenceDepth ?? 1;

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <ProjectExperimentsHubNav projectSlug={projectSlug} />
            <p className="site00-project-lore-calibration__kicker">P0.5E — CAMPAIGN PRODUCTION BOARD</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">
              {clientMode ? 'YOUR CONTENT PLAN' : campaign?.name ?? 'MARKET TEST 01'}
            </p>
            <Link to={site00ProjectContentOperationsPath(projectSlug)}>← CONTENT OPERATIONS</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p>Loading campaign board…</p>
          ) : (
            <>
              <section className="site00-experiment-g__panel">
                <h2>{clientMode ? 'OVERVIEW' : 'CAMPAIGN STATUS'}</h2>
                <ul>
                  <li>Content pieces: {slate?.entries.length ?? 0}</li>
                  <li>Current round: SLIDE {board?.currentRoundSequencePosition ?? 1}</li>
                  <li>Slide 01 generated: {generatedCount}/{slide01Assets.length}</li>
                  <li>Slide 01 locked: {lockedCount}/{slide01Assets.length}</li>
                  <li>Round 01: {round01?.status ?? '—'}</li>
                  <li>Round 02: {round02?.status ?? 'LOCKED UNTIL ROUND 01 APPROVED'}</li>
                </ul>
                <button type="button" className="site00-btn" disabled={busy} onClick={() => setClientMode((v) => !v)}>
                  {clientMode ? 'SHOW PRODUCTION DETAIL' : 'CLIENT REVIEW MODE'}
                </button>
              </section>

              {!board && (
                <section className="site00-experiment-g__panel">
                  <p>Initialize campaign board from Experiment 01 V2.3 (same nine topics, horizontal production).</p>
                  <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.campaignProductionInitialize(projectSlug))}>
                    INITIALIZE CAMPAIGN BOARD
                  </button>
                </section>
              )}

              {board && (
                <>
                  <section className="site00-experiment-g__panel">
                    <h2>VIEW</h2>
                    {(['CAMPAIGN_WALL', 'ROUND_VIEW', 'FEED_PREVIEW', 'CONTENT_PLAN'] as BoardViewMode[]).map((mode) => (
                      <button key={mode} type="button" className={viewMode === mode ? 'site00-btn site00-btn--primary' : 'site00-btn'} disabled={busy} onClick={() => setViewMode(mode)}>
                        {mode.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </section>

                  <section className="site00-experiment-g__panel">
                    <h2>PRODUCTION</h2>
                    {round01?.status !== 'LOCKED' && (
                      <button type="button" className="site00-btn site00-btn--primary" disabled={busy || generatedCount < slide01Assets.length} onClick={() => void act(() => site00ProjectsApi.campaignProductionLockRound01(projectSlug))}>
                        LOCK ROUND 01 (SLIDE 01)
                      </button>
                    )}
                    {round01?.status === 'LOCKED' && round02?.status === 'PLANNED' && (
                      <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.campaignProductionFormulateRound02(projectSlug))}>
                        FORMULATE ROUND 02 (SLIDE 02)
                      </button>
                    )}
                    <p style={{ marginTop: '8px' }}>
                      Generate Slide 01 assets on{' '}
                      <Link to={`/projects/${projectSlug}/marketing-expression/experiment-01`}>Experiment 01</Link> first.
                    </p>
                  </section>

                  {viewMode === 'FEED_PREVIEW' && (
                    <section className="site00-experiment-g__panel">
                      <h2>FEED PREVIEW — FIRST SLIDES</h2>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {slide01Assets.map((a) => (
                          <div key={a.assetId} style={{ aspectRatio: '1', background: '#111', color: '#eee', padding: '8px' }}>
                            {a.generatedAssetUrl ? (
                              <img src={a.generatedAssetUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span>{slate?.entries.find((e) => e.contentPieceId === a.contentPieceId)?.title ?? a.contentPieceId}</span>
                            )}
                            <span style={{ display: 'block', fontSize: '10px', marginTop: '4px' }}>{a.status}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {viewMode === 'CONTENT_PLAN' && slate && (
                    <section className="site00-experiment-g__panel">
                      <h2>CONTENT PLAN</h2>
                      <ul>
                        {slate.entries.map((e) => (
                          <li key={e.contentPieceId}>
                            {e.title} — {e.sequenceLength} slides — {e.productionStatus}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {(viewMode === 'CAMPAIGN_WALL' || viewMode === 'ROUND_VIEW') && (
                    <section className="site00-experiment-g__panel">
                      <h2>{viewMode === 'ROUND_VIEW' ? `ROUND VIEW — SLIDE ${selectedRound}` : 'CAMPAIGN WALL'}</h2>
                      {viewMode === 'ROUND_VIEW' && (
                        <div style={{ marginBottom: '12px' }}>
                          {Array.from({ length: maxDepth }, (_, i) => i + 1).map((pos) => (
                            <button key={pos} type="button" className={selectedRound === pos ? 'site00-btn site00-btn--primary' : 'site00-btn'} onClick={() => setSelectedRound(pos)}>
                              SLIDE {pos}
                            </button>
                          ))}
                        </div>
                      )}
                      <div style={{ overflowX: 'auto' }}>
                        <table className="site00-campaign-board" style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '8px', textAlign: 'left' }}>SLIDE</th>
                              {board.contentPieceIds.map((id, i) => (
                                <th key={id} style={{ padding: '8px', minWidth: '100px' }}>{String(i + 1).padStart(2, '0')}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: viewMode === 'ROUND_VIEW' ? 1 : maxDepth }, (_, idx) => {
                              const pos = viewMode === 'ROUND_VIEW' ? selectedRound : idx + 1;
                              return (
                                <tr key={pos}>
                                  <td style={{ padding: '8px' }}>SLIDE {pos}</td>
                                  {board.contentPieceIds.map((pieceId) => {
                                    const depth = board.sequenceDepthByPiece[pieceId] ?? 0;
                                    if (pos > depth) {
                                      return <td key={pieceId} style={{ padding: '8px', opacity: 0.3 }}>—</td>;
                                    }
                                    const asset = board.assets.find((a) => a.contentPieceId === pieceId && a.sequencePosition === pos);
                                    return (
                                      <td key={pieceId} style={{ padding: '8px', verticalAlign: 'top' }}>
                                        {asset?.generatedAssetUrl ? (
                                          <img src={asset.generatedAssetUrl} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                                        ) : (
                                          <span style={{ fontSize: '11px' }}>{asset?.status ?? 'PLANNED'}</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {run?.sequenceContracts.filter((c) => c.sequencePosition === 2).length ? (
                    <section className="site00-experiment-g__panel">
                      <h2>ROUND 02 CONTRACTS — SLIDE 02</h2>
                      <ul>
                        {run.sequenceContracts.filter((c) => c.sequencePosition === 2).map((c) => (
                          <li key={c.id}>
                            {c.contentPieceId}: {c.viewerShouldLearn.slice(0, 60)}… — {c.semanticRole}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  <section className="site00-experiment-g__panel">
                    <h2>CAPTIONS — P0.5C.5</h2>
                    <p>Synthesize Instagram captions after slides are locked. Captions use first-person NDX authorship — not internal contract labels.</p>
                    <button
                      type="button"
                      className="site00-btn site00-btn--primary"
                      disabled={busy || !board}
                      onClick={() => void act(() => site00ProjectsApi.campaignProductionSynthesizeCaptions(projectSlug))}
                    >
                      SYNTHESIZE CAPTIONS
                    </button>
                    {(run?.captions ?? []).length === 0 ? (
                      <p style={{ marginTop: '8px' }}>No captions yet — lock slides first, then synthesize.</p>
                    ) : (
                      <ul style={{ marginTop: '12px' }}>
                        {(run?.captions ?? []).map((cap) => {
                          const entry = slate?.entries.find((e) => e.contentPieceId === cap.contentPieceId);
                          return (
                            <li key={cap.captionId} style={{ marginBottom: '12px' }}>
                              <strong>{entry?.title ?? cap.contentPieceId}</strong>
                              <p style={{ margin: '4px 0' }}>{cap.text}</p>
                              <span style={{ fontSize: '11px' }}>
                                {cap.readiness} · {cap.approvalState} · {cap.strategy}
                              </span>
                              {!clientMode && (
                                <div style={{ marginTop: '6px' }}>
                                  {(['THAT_SOUNDS_LIKE_ME', 'LOVE_THE_CAPTION', 'TOO_ANALYTICAL', 'TOO_BRAND_LIKE', 'NOT_NDX'] as const).map((j) => (
                                    <button
                                      key={j}
                                      type="button"
                                      className="site00-btn"
                                      disabled={busy}
                                      style={{ marginRight: '4px', marginBottom: '4px', fontSize: '10px' }}
                                      onClick={() =>
                                        void act(() =>
                                          site00ProjectsApi.campaignProductionCaptionJudgment(projectSlug, cap.contentPieceId, j),
                                        )
                                      }
                                    >
                                      {j.replace(/_/g, ' ')}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
