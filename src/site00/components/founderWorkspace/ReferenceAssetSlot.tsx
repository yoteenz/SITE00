/**
 * P0.VR.2A — Geometry-locked reference asset slot placeholder.
 * Renders reserved DOM geometry before generation completes — no layout shift on bind.
 */

import type { CSSProperties } from 'react';
import type { ReferenceVisualAssetSlot } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2a/client.js';

export type ReferenceAssetSlotProps = {
  slot: ReferenceVisualAssetSlot;
  className?: string;
  onGenerate?: (slotId: string) => void;
  onPromote?: (slotId: string) => void;
  showControls?: boolean;
};

function statusLabel(status: ReferenceVisualAssetSlot['assetStatus']): string {
  switch (status) {
    case 'MISSING':
      return 'ASSET PENDING';
    case 'GENERATING':
    case 'QUEUED':
      return 'GENERATING';
    case 'READY':
      return 'ASSET READY';
    case 'FAILED':
      return 'GENERATION FAILED';
    case 'BLOCKED':
      return 'BLOCKED';
    case 'EXISTING_ASSET_FOUND':
      return 'EXISTING ASSET';
    default:
      return status.replace(/_/g, ' ');
  }
}

export function ReferenceAssetSlot({
  slot,
  className = '',
  onGenerate,
  onPromote,
  showControls = false,
}: ReferenceAssetSlotProps) {
  const style: CSSProperties = {
    position: 'absolute',
    left: slot.x,
    top: slot.y,
    width: slot.width,
    height: slot.height,
    zIndex: slot.zIndex,
    borderRadius: slot.borderRadius,
    objectFit: slot.objectFit,
    objectPosition: slot.objectPosition,
    clipPath: slot.clipPath ?? undefined,
  };

  const hasImage = Boolean(slot.resolvedAssetUrl);
  const isGenerating = slot.generationStatus === 'GENERATING' || slot.generationStatus === 'QUEUED';
  const isFailed = slot.assetStatus === 'FAILED';

  return (
    <div
      className={`site00-ref-asset-slot${hasImage ? ' site00-ref-asset-slot--ready' : ''}${isGenerating ? ' site00-ref-asset-slot--generating' : ''}${isFailed ? ' site00-ref-asset-slot--failed' : ''} ${className}`.trim()}
      style={style}
      data-slot-id={slot.slotId}
      data-region-id={slot.regionId}
      data-asset-status={slot.assetStatus}
      data-generation-status={slot.generationStatus}
      data-bind-mode={slot.bindMode ?? 'none'}
      aria-label={`${slot.assetRole} asset slot ${slot.width} by ${slot.height}`}
    >
      {hasImage ? (
        <img
          className="site00-ref-asset-slot__image"
          src={slot.resolvedAssetUrl!}
          alt=""
          width={slot.width}
          height={slot.height}
          style={{ objectFit: slot.objectFit, objectPosition: slot.objectPosition }}
        />
      ) : (
        <div className="site00-ref-asset-slot__placeholder" aria-hidden="true">
          <span className="site00-ref-asset-slot__ratio">{slot.aspectRatio}:1</span>
        </div>
      )}

      {showControls ? (
        <div className="site00-ref-asset-slot__meta">
          <span className="site00-ref-asset-slot__status">{statusLabel(slot.assetStatus)}</span>
          <span className="site00-ref-asset-slot__geometry">
            {slot.width} × {slot.height} · {slot.objectFit.toUpperCase()} · {slot.objectPosition}
          </span>
          {slot.generationStatus === 'READY_TO_GENERATE' && onGenerate ? (
            <button type="button" onClick={() => onGenerate(slot.slotId)}>
              GENERATE THIS ASSET
            </button>
          ) : null}
          {slot.bindMode === 'PREVIEW_BIND' && onPromote ? (
            <button type="button" onClick={() => onPromote(slot.slotId)}>
              PROMOTE ASSET
            </button>
          ) : null}
          {isFailed && onGenerate ? (
            <button type="button" onClick={() => onGenerate(slot.slotId)}>
              RETRY
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function referenceAssetSlotPreservesGeometry(
  slot: ReferenceVisualAssetSlot,
  renderedWidth: number,
  renderedHeight: number,
): boolean {
  return slot.width === renderedWidth && slot.height === renderedHeight;
}
