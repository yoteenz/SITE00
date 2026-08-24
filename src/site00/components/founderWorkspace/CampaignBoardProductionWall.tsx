/**
 * Campaign Board — visual production wall (P0.VR.1C structural empty state + artwork authority).
 */

import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { MarketingCampaignProductionRun } from '../../../../shared/site00-studio-world-production/marketingCampaignProduction/types';
import { CampaignDaySelector, CreativeAssetCard } from './FounderWorkspaceShell';
import { WorkspaceLoadingState } from './WorkspaceLoadingState';
import {
  ArtworkLane,
  AsymmetricGrid,
  EditorialRail,
  GhostSlot,
  InlineMeta,
  MediaBand,
  QuietAction,
  SpatialSection,
  WorkspaceField,
} from './WorkspaceCompositionPrimitives';
import {
  resolveCampaignBoardLanes,
  resolveCampaignIdentity,
  type CampaignBoardLane,
} from './campaignBoardLaneSchema';
import { site00ProjectBrandMarketingExpressionExperiment01Path } from '../../config/routes';

const WEEK_DAYS = [
  { id: 'mon', label: 'Monday', shortLabel: 'MON' },
  { id: 'tue', label: 'Tuesday', shortLabel: 'TUE' },
  { id: 'wed', label: 'Wednesday', shortLabel: 'WED' },
  { id: 'thu', label: 'Thursday', shortLabel: 'THU' },
  { id: 'fri', label: 'Friday', shortLabel: 'FRI' },
  { id: 'sat', label: 'Saturday', shortLabel: 'SAT' },
  { id: 'sun', label: 'Sunday', shortLabel: 'SUN' },
];

type Props = {
  projectSlug: string;
  run: MarketingCampaignProductionRun | null;
  loading: boolean;
  busy: boolean;
  selectedDay: string;
  onSelectDay: (id: string) => void;
  onInitialize: () => void;
  onLockRound01: () => void;
  onFormulateRound02: () => void;
  onSelectAsset?: (assetId: string) => void;
};

function renderLaneSlots(lane: CampaignBoardLane, slateTitle: (id: string, fallback: string) => string) {
  return lane.slots.map((slot) => {
    if (slot.asset) {
      const title = slateTitle(slot.contentPieceId, slot.title);
      return (
        <CreativeAssetCard
          key={slot.slotId}
          title={title}
          previewUrl={slot.asset.generatedAssetUrl}
          format={slot.format}
          statusLabel={slot.asset.status.replace(/_/g, ' ')}
        />
      );
    }
    return <GhostSlot key={slot.slotId} variant={lane.ghostVariant} label={slot.title.slice(0, 40)} />;
  });
}

export function CampaignBoardProductionWall({
  projectSlug,
  run,
  loading,
  busy,
  selectedDay,
  onSelectDay,
  onInitialize,
  onLockRound01,
  onFormulateRound02,
}: Props) {
  const board = run?.board;
  const slate = run?.slate;
  const identity = resolveCampaignIdentity(run);
  const lanes = resolveCampaignBoardLanes(run);
  const pagesLane = lanes.find((l) => l.laneId === 'PAGES')!;
  const marginsLane = lanes.find((l) => l.laneId === 'MARGINS')!;
  const motionLane = lanes.find((l) => l.laneId === 'MOTION')!;

  const slide01Assets = board?.assets.filter((a) => a.sequencePosition === 1) ?? [];
  const generatedCount = slide01Assets.filter((a) => a.generatedAssetUrl).length;
  const round01 = board?.rounds.find((r) => r.sequencePosition === 1);

  const slateTitle = (contentPieceId: string, fallback: string) =>
    slate?.entries.find((e) => e.contentPieceId === contentPieceId)?.title ?? fallback;

  if (loading) {
    return (
      <WorkspaceLoadingState
        label="Loading production wall…"
        preserveGeometry
        rows={4}
      />
    );
  }

  return (
    <WorkspaceField className="site00-fws-campaign-wall" data-visual-reconstruction="campaign-board">
      <SpatialSection mode="dense">
        <EditorialRail
          identity={identity.campaignLabel}
          period={identity.periodLabel}
          status={identity.statusLabel}
          cadence={identity.cadenceLabel}
          meta={
            board ? (
              <InlineMeta
                label="Slide 01"
                value={`${generatedCount}/${slide01Assets.length} generated · Round 01 ${round01?.status ?? '—'}`}
              />
            ) : null
          }
          navigation={
            <CampaignDaySelector days={WEEK_DAYS} selectedDay={selectedDay} onSelect={onSelectDay} />
          }
        />
      </SpatialSection>

      <SpatialSection mode="focal" ariaLabel="The Pages">
        <ArtworkLane title={pagesLane.label} authority="primary">
          <AsymmetricGrid variant="pages">{renderLaneSlots(pagesLane, slateTitle)}</AsymmetricGrid>
        </ArtworkLane>
      </SpatialSection>

      <SpatialSection mode="standard" ariaLabel="The Margins">
        <ArtworkLane title={marginsLane.label} authority="secondary">
          <AsymmetricGrid variant="margins">{renderLaneSlots(marginsLane, slateTitle)}</AsymmetricGrid>
        </ArtworkLane>
      </SpatialSection>

      <SpatialSection mode="breathing" ariaLabel="Book in Motion">
        <ArtworkLane title={motionLane.label} authority="secondary">
          <MediaBand label={motionLane.label}>
            <AsymmetricGrid variant="motion">{renderLaneSlots(motionLane, slateTitle)}</AsymmetricGrid>
          </MediaBand>
        </ArtworkLane>
      </SpatialSection>

      <SpatialSection mode="break" className="site00-fws-campaign-wall__periphery">
        {!board ? (
          <QuietAction onClick={onInitialize} disabled={busy}>
            INITIALIZE CAMPAIGN BOARD →
          </QuietAction>
        ) : (
          <div className="site00-fws-campaign-wall__actions">
            {round01?.status !== 'LOCKED' ? (
              <QuietAction
                onClick={onLockRound01}
                disabled={busy || generatedCount < slide01Assets.length}
              >
                LOCK ROUND 01 (SLIDE 01) →
              </QuietAction>
            ) : null}
            {round01?.status === 'LOCKED' ? (
              <QuietAction onClick={onFormulateRound02} disabled={busy}>
                FORMULATE ROUND 02 →
              </QuietAction>
            ) : null}
            <InlineMeta
              label="Generate"
              value={
                <>
                  Slide 01 on{' '}
                  <Link
                    to={site00ProjectBrandMarketingExpressionExperiment01Path(projectSlug)}
                    className="site00-fws-quiet-action__link"
                  >
                    Experiment 01
                  </Link>{' '}
                  first
                </>
              }
            />
          </div>
        )}
      </SpatialSection>
    </WorkspaceField>
  );
}

export function CampaignBoardInspectContent({
  run,
  clientMode,
  onToggleClientMode,
  busy,
  onSynthesizeCaptions,
  onCaptionJudgment,
}: {
  run: MarketingCampaignProductionRun | null;
  clientMode: boolean;
  onToggleClientMode: () => void;
  busy: boolean;
  onSynthesizeCaptions: () => void;
  onCaptionJudgment: (contentPieceId: string, judgment: string) => void;
}) {
  const board = run?.board;
  const slate = run?.slate;
  const [viewMode, setViewMode] = useState<'CAMPAIGN_WALL' | 'ROUND_VIEW' | 'FEED_PREVIEW' | 'CONTENT_PLAN'>('CAMPAIGN_WALL');
  const [selectedRound, setSelectedRound] = useState(1);
  if (!board) return <p>No board loaded.</p>;
  const slide01Assets = board.assets.filter((a) => a.sequencePosition === 1);
  const maxDepth = Math.max(...Object.values(board.sequenceDepthByPiece), 1);
  const round01 = board.rounds.find((r) => r.sequencePosition === 1);
  const round02 = board.rounds.find((r) => r.sequencePosition === 2);

  return (
    <>
      <button type="button" className="site00-fws-inspect-trigger" onClick={onToggleClientMode}>
        {clientMode ? 'SHOW PRODUCTION DETAIL' : 'CLIENT REVIEW MODE'}
      </button>
      <dl style={{ marginTop: 16 }}>
        <dt>CONTENT PIECES</dt>
        <dd>{slate?.entries.length ?? 0}</dd>
        <dt>CURRENT ROUND</dt>
        <dd>SLIDE {board.currentRoundSequencePosition ?? 1}</dd>
        <dt>SLIDE 01 GENERATED</dt>
        <dd>
          {slide01Assets.filter((a) => a.generatedAssetUrl).length}/{slide01Assets.length}
        </dd>
        <dt>ROUND 01</dt>
        <dd>{round01?.status ?? '—'}</dd>
        <dt>ROUND 02</dt>
        <dd>{round02?.status ?? '—'}</dd>
      </dl>

      <section className="site00-experiment-g__panel">
        <h2>VIEW</h2>
        {(['CAMPAIGN_WALL', 'ROUND_VIEW', 'FEED_PREVIEW', 'CONTENT_PLAN'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            className={viewMode === mode ? 'site00-btn site00-btn--primary' : 'site00-btn'}
            disabled={busy}
            onClick={() => setViewMode(mode)}
          >
            {mode.replace(/_/g, ' ')}
          </button>
        ))}
      </section>

      {(viewMode === 'CAMPAIGN_WALL' || viewMode === 'ROUND_VIEW') && (
        <section className="site00-experiment-g__panel">
          <h2>{viewMode === 'ROUND_VIEW' ? `ROUND VIEW — SLIDE ${selectedRound}` : 'CAMPAIGN WALL'}</h2>
          {viewMode === 'ROUND_VIEW' && (
            <div style={{ marginBottom: '12px' }}>
              {Array.from({ length: maxDepth }, (_, i) => i + 1).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  className={selectedRound === pos ? 'site00-btn site00-btn--primary' : 'site00-btn'}
                  onClick={() => setSelectedRound(pos)}
                >
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
                    <th key={id} style={{ padding: '8px', minWidth: '100px' }}>
                      {String(i + 1).padStart(2, '0')}
                    </th>
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
                          return (
                            <td key={pieceId} style={{ padding: '8px', opacity: 0.3 }}>
                              —
                            </td>
                          );
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

      <section className="site00-experiment-g__panel">
        <h2>CAPTIONS — P0.5C.5</h2>
        <p>Synthesize Instagram captions after slides are locked. Captions use first-person NDX authorship — not internal contract labels.</p>
        <button type="button" className="site00-btn site00-btn--primary" disabled={busy || !board} onClick={onSynthesizeCaptions}>
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
                  {!clientMode && (
                    <div style={{ marginTop: '6px' }}>
                      {(['THAT_SOUNDS_LIKE_ME', 'LOVE_THE_CAPTION', 'TOO_ANALYTICAL', 'TOO_BRAND_LIKE', 'NOT_NDX'] as const).map((j) => (
                        <button
                          key={j}
                          type="button"
                          className="site00-btn"
                          disabled={busy}
                          style={{ marginRight: '4px', marginBottom: '4px', fontSize: '10px' }}
                          onClick={() => onCaptionJudgment(cap.contentPieceId, j)}
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
  );
}
