/**
 * Experiment 01 — artwork-first operate layer (V2.3 default).
 */

import type { Experiment01V23Artifact } from '../../../../shared/site00-brand-lore/artBoardMateriality/types';
import { V23_FOUNDER_JUDGMENTS, V23A_FOUNDER_JUDGMENTS, V23B_FOUNDER_JUDGMENTS } from '../../../../shared/site00-brand-lore/artBoardMateriality/constants';
import {
  ExperimentBoard,
  FounderWorkspacePanel,
  VersionTimeline,
} from './FounderWorkspaceShell';
import { NDX_VERSION_LINEAGE } from '../../config/ndxFounderWorkspace';

type Props = {
  artifacts: Experiment01V23Artifact[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  generatedCount: number;
  total: number;
  isGenerating: boolean;
  canGenerateRemaining: boolean;
  canRegenerateAll: boolean;
  busy: boolean;
  onGenerateRemaining: () => void;
  onRegenerateAll: () => void;
  onRegenerateCurrent: (artifactId: string) => void;
  selected: Experiment01V23Artifact | undefined;
  onJudgmentTap?: (artifactId: string, judgment: string) => void;
  onReplayHistorical?: (artifactId: string) => void;
  onInspectImage?: (url: string, alt: string) => void;
};

export function Experiment01OperateLayer({
  artifacts,
  selectedId,
  onSelect,
  generatedCount,
  total,
  isGenerating,
  canGenerateRemaining,
  canRegenerateAll,
  busy,
  onGenerateRemaining,
  onRegenerateAll,
  onRegenerateCurrent,
  selected,
  onJudgmentTap,
  onReplayHistorical,
  onInspectImage,
}: Props) {
  const boardArtifacts = artifacts.map((a) => ({
    id: a.id,
    title: a.contract.primaryHook,
    previewUrl: a.generatedAssetUrl,
    statusLabel:
      a.generationStatus === 'GENERATED'
        ? 'GENERATED'
        : a.generationStatus === 'GENERATING'
          ? 'GENERATING'
          : 'NOT GENERATED',
  }));

  return (
    <>
      <FounderWorkspacePanel title={`3×3 BOARD · ${generatedCount}/${total}`}>
        {isGenerating && <p style={{ fontSize: 11, color: '#c8ff00' }}>GENERATING… {generatedCount}/{total} COMPLETE</p>}
        {canGenerateRemaining && (
          <button type="button" className="site00-fws-pulse__cta" disabled={busy} onClick={onGenerateRemaining} style={{ marginBottom: 12 }}>
            {generatedCount > 0 ? `GENERATE REMAINING ${total - generatedCount}` : 'GENERATE ALL NINE'}
          </button>
        )}
        {canRegenerateAll && (
          <button type="button" className="site00-fws-pulse__cta" disabled={busy} onClick={onRegenerateAll} style={{ marginBottom: 12, width: '100%' }}>
            REGENERATE ALL V2.3 — NINE NEW TAKES
          </button>
        )}
        <div className="site00-fws-board site00-fws-board--large">
          <ExperimentBoard
            artifacts={boardArtifacts}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </div>
      </FounderWorkspacePanel>

      {selected && (
        <FounderWorkspacePanel title="SELECTED">
          <p style={{ fontSize: 12, margin: '0 0 12px' }}>{selected.contract.primaryHook}</p>
          {selected.generatedAssetUrl ? (
            <button
              type="button"
              className="site00-fws-asset__frame"
              style={{ border: 'none', padding: 0, background: 'none', cursor: 'pointer', width: '100%' }}
              onClick={() => onInspectImage?.(selected.generatedAssetUrl!, selected.contract.primaryHook)}
            >
              <img
                src={selected.generatedAssetUrl}
                alt={selected.contract.primaryHook}
                style={{ maxWidth: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 6 }}
              />
            </button>
          ) : null}
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="site00-fws-pulse__cta" disabled={busy} onClick={() => onRegenerateCurrent(selected.id)}>
              {selected.generatedAssetUrl ? 'REGENERATE CURRENT ROUND →' : 'GENERATE CURRENT'}
            </button>
            {selected.generatedAssetUrl && onReplayHistorical ? (
              <button type="button" className="site00-fws-inspect-trigger" disabled={busy} onClick={() => onReplayHistorical(selected.id)}>
                REPLAY HISTORICAL PROMPT
              </button>
            ) : null}
          </div>
          {onJudgmentTap ? (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 11, color: '#888', margin: '0 0 8px' }}>FOUNDER JUDGMENT</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {[...V23_FOUNDER_JUDGMENTS, ...V23A_FOUNDER_JUDGMENTS, ...V23B_FOUNDER_JUDGMENTS].map((j) => (
                  <button
                    key={j}
                    type="button"
                    className={selected.founderJudgment === j ? 'site00-fws-pulse__cta' : 'site00-fws-inspect-trigger'}
                    disabled={busy || selected.generationStatus === 'GENERATING'}
                    onClick={() => onJudgmentTap(selected.id, j)}
                  >
                    {j.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </FounderWorkspacePanel>
      )}
    </>
  );
}

export function Experiment01UnderstandLayer() {
  return (
    <>
      <VersionTimeline entries={NDX_VERSION_LINEAGE} />
      <div className="site00-fws-direction-grid" style={{ marginTop: 12 }}>
        <span>
          <strong>ARTISTIC ENERGY</strong>
          Bespoke premise leads
        </span>
        <span>
          <strong>EDITORIAL LOGIC</strong>
          Supports, not dominates
        </span>
        <span>
          <strong>HUMAN HISTORY</strong>
          Authored, not templated
        </span>
      </div>
    </>
  );
}
