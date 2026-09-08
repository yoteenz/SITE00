/**
 * B5.6 — Carousel / Story format workspace with drag-reorder + live preview.
 */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Entry001CampaignAsset } from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import { site00ProjectCampaignBoardEntryPath } from '../../../config/routes';

type Props = {
  projectSlug: string;
  formatFamily: 'CAROUSEL' | 'STORY';
  title: string;
  assets: Entry001CampaignAsset[];
  saveState: string;
  saveError: string | null;
  onReorder: (orderedIds: string[]) => void;
  onMove: (assetId: string, direction: 'left' | 'right') => void;
};

export function Entry001FormatSequenceWorkspace({
  projectSlug,
  formatFamily,
  title,
  assets,
  saveState,
  saveError,
  onReorder,
  onMove,
}: Props) {
  const [reorderMode, setReorderMode] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  const packagePath = site00ProjectCampaignBoardEntryPath(projectSlug, '001');

  const handleDrop = useCallback(
    (targetId: string) => {
      if (!dragId || dragId === targetId) return;
      const ids = assets.map((a) => a.assetId);
      const from = ids.indexOf(dragId);
      const to = ids.indexOf(targetId);
      if (from < 0 || to < 0) return;
      ids.splice(from, 1);
      ids.splice(to, 0, dragId);
      onReorder(ids);
      setDragId(null);
    },
    [assets, dragId, onReorder],
  );

  const previewAsset = assets[previewIndex] ?? assets[0];

  useEffect(() => {
    if (!assets.length) {
      setPreviewIndex(0);
      return;
    }
    if (previewIndex >= assets.length) {
      setPreviewIndex(assets.length - 1);
    }
  }, [assets, previewIndex]);

  return (
    <div className="site00-e001-format-workspace site00-fws-mobile-content-shell">
      <nav className="site00-e001-package__breadcrumb">
        <Link to={packagePath}>← ENTRY 001 PACKAGE</Link>
      </nav>

      <header className="site00-e001-format-workspace__head">
        <span className="site00-e001-package__entry-tag">{formatFamily}</span>
        <h1>{title}</h1>
        <p className="site00-e001-format-workspace__save">
          {saveState === 'saving' && 'SAVING…'}
          {saveState === 'saved' && 'SAVED'}
          {saveState === 'failed' && (saveError ?? 'SAVE FAILED')}
        </p>
      </header>

      <section className="site00-e001-format-workspace__preview">
        <h2>LIVE PREVIEW</h2>
        {previewAsset ? (
          <div className="site00-e001-format-workspace__preview-frame">
            <img
              src={previewAsset.filePath}
              alt={previewAsset.title}
              onError={(e) => {
                (e.target as HTMLImageElement).alt = 'ASSET UNAVAILABLE';
              }}
            />
            <p>{String(previewIndex + 1).padStart(2, '0')} — {previewAsset.title}</p>
          </div>
        ) : (
          <p>ASSET UNAVAILABLE</p>
        )}
        {formatFamily === 'CAROUSEL' && assets.length > 1 && (
          <div className="site00-e001-format-workspace__preview-nav">
            <button type="button" disabled={previewIndex <= 0} onClick={() => setPreviewIndex((i) => i - 1)}>
              PREV
            </button>
            <button
              type="button"
              disabled={previewIndex >= assets.length - 1}
              onClick={() => setPreviewIndex((i) => i + 1)}
            >
              NEXT
            </button>
          </div>
        )}
      </section>

      <section className="site00-e001-format-workspace__assets">
        <div className="site00-e001-format-workspace__toolbar">
          <h2>ASSETS</h2>
          <button type="button" onClick={() => setReorderMode((v) => !v)}>
            {reorderMode ? 'DONE' : 'REORDER'}
          </button>
        </div>

        <div className="site00-e001-format-workspace__strip" role="list">
          {assets.map((asset, index) => (
            <div
              key={asset.assetId}
              role="listitem"
              className={`site00-e001-format-workspace__card${dragId === asset.assetId ? ' is-dragging' : ''}`}
              draggable={reorderMode}
              onDragStart={() => reorderMode && setDragId(asset.assetId)}
              onDragOver={(e) => reorderMode && e.preventDefault()}
              onDrop={() => reorderMode && handleDrop(asset.assetId)}
              onClick={() => setPreviewIndex(index)}
            >
              {reorderMode && <span className="site00-e001-format-workspace__grip" aria-hidden>⋮⋮</span>}
              <span className="site00-e001-format-workspace__num">{String(index + 1).padStart(2, '0')}</span>
              <img src={asset.filePath} alt="" loading="lazy" />
              <p>{asset.title}</p>
              <div className="site00-e001-format-workspace__move">
                <button type="button" aria-label="Move left" onClick={() => onMove(asset.assetId, 'left')}>
                  ←
                </button>
                <button type="button" aria-label="Move right" onClick={() => onMove(asset.assetId, 'right')}>
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {saveError && saveState === 'failed' && (
        <div className="site00-e001-format-workspace__error" role="alert">
          <p>{saveError}</p>
          <p>Your change could not be saved.</p>
        </div>
      )}
    </div>
  );
}
