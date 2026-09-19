/**
 * P0.VR.4R2 — Reference crop preview + manual override editor.
 */

import { useCallback, useMemo, useState } from 'react';
import type { SourcePixelBounds } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4r2/browserClient.js';
import {
  PROJECTS_HEADER_PLANET_OBJECT_BOUNDS,
  PROJECTS_HEADER_PLANET_PADDING_PERCENT,
  PROJECTS_REFERENCE_SOURCE_WIDTH,
  PROJECTS_REFERENCE_SOURCE_HEIGHT,
  applyPaddingToBounds,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4r2/browserClient.js';

export type DesignReferenceCropEditorProps = {
  referenceUrl: string;
  cropPreviewUrl: string | null;
  objectBounds: SourcePixelBounds;
  finalBounds: SourcePixelBounds;
  qaStatus: string;
  qaFailures: string[];
  cropChecksum: string | null;
  cropApproved: boolean;
  dispatchCounts: { generations: number; cropVersion: number };
  onBoundsChange: (bounds: SourcePixelBounds) => void;
  onExtractCrop: () => void;
  onUseCrop: () => void;
  extracting?: boolean;
};

export function DesignReferenceCropEditor({
  referenceUrl,
  cropPreviewUrl,
  objectBounds,
  finalBounds,
  qaStatus,
  qaFailures,
  cropChecksum,
  cropApproved,
  dispatchCounts,
  onBoundsChange,
  onExtractCrop,
  onUseCrop,
  extracting = false,
}: DesignReferenceCropEditorProps) {
  const [localBounds, setLocalBounds] = useState(objectBounds);
  const [padding, setPadding] = useState(PROJECTS_HEADER_PLANET_PADDING_PERCENT);

  const previewFinal = useMemo(
    () => applyPaddingToBounds(localBounds, padding, PROJECTS_REFERENCE_SOURCE_WIDTH, PROJECTS_REFERENCE_SOURCE_HEIGHT),
    [localBounds, padding],
  );

  const overlayStyle = useMemo(() => {
    const scaleX = 100 / PROJECTS_REFERENCE_SOURCE_WIDTH;
    const scaleY = 100 / PROJECTS_REFERENCE_SOURCE_HEIGHT;
    return {
      left: `${previewFinal.x * scaleX}%`,
      top: `${previewFinal.y * scaleY}%`,
      width: `${previewFinal.width * scaleX}%`,
      height: `${previewFinal.height * scaleY}%`,
    };
  }, [previewFinal]);

  const applyBounds = useCallback(
    (bounds: SourcePixelBounds) => {
      setLocalBounds(bounds);
      onBoundsChange(bounds);
    },
    [onBoundsChange],
  );

  return (
    <section className="site00-dw-ref-crop-editor">
      <h4>REFERENCE CROP PREVIEW</h4>
      <p className="site00-dw-ref-crop-editor__warn">
        NO VALIDATED CROP = NO GENERATION. Review the exact image sent to GPT Image 2 Edit before generating.
      </p>

      <div className="site00-dw-ref-crop-editor__compare">
        <div className="site00-dw-ref-crop-editor__pane">
          <h5>ORIGINAL + BOUNDING BOX</h5>
          <div className="site00-dw-ref-crop-editor__overlay-wrap">
            <img src={referenceUrl} alt="Approved reference" />
            <div className="site00-dw-ref-crop-editor__box" style={overlayStyle} aria-hidden="true" />
          </div>
        </div>
        <div className="site00-dw-ref-crop-editor__pane">
          <h5>EXTRACTED CROP</h5>
          {cropPreviewUrl ? (
            <img src={cropPreviewUrl} alt="Reference crop preview" className="site00-dw-ref-crop-editor__crop-img" />
          ) : (
            <span>Extract crop to preview</span>
          )}
        </div>
      </div>

      <div className="site00-dw-ref-crop-editor__controls">
        <label>
          X
          <input
            type="number"
            value={localBounds.x}
            onChange={(e) => applyBounds({ ...localBounds, x: Number(e.target.value) })}
          />
        </label>
        <label>
          Y
          <input
            type="number"
            value={localBounds.y}
            onChange={(e) => applyBounds({ ...localBounds, y: Number(e.target.value) })}
          />
        </label>
        <label>
          W
          <input
            type="number"
            value={localBounds.width}
            onChange={(e) => applyBounds({ ...localBounds, width: Number(e.target.value) })}
          />
        </label>
        <label>
          H
          <input
            type="number"
            value={localBounds.height}
            onChange={(e) => applyBounds({ ...localBounds, height: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="site00-dw-ref-crop-editor__actions">
        <button type="button" onClick={() => applyBounds(PROJECTS_HEADER_PLANET_OBJECT_BOUNDS)}>
          RESET TO DETECTION
        </button>
        <button type="button" onClick={() => applyBounds(PROJECTS_HEADER_PLANET_OBJECT_BOUNDS)}>
          FIT OBJECT
        </button>
        <button type="button" onClick={() => setPadding((p) => Math.min(0.2, p + 0.02))}>
          ADD PADDING
        </button>
        <button type="button" onClick={() => setPadding((p) => Math.max(0.04, p - 0.02))}>
          REMOVE PADDING
        </button>
        <button type="button" onClick={onExtractCrop} disabled={extracting}>
          {extracting ? 'EXTRACTING…' : 'REFRESH CROP'}
        </button>
        <button type="button" onClick={onUseCrop} disabled={cropApproved || !cropPreviewUrl}>
          USE CROP
        </button>
      </div>

      <dl className="site00-dw-ref-crop-editor__meta">
        <dt>QA status</dt>
        <dd>{qaStatus}</dd>
        <dt>Final bounds</dt>
        <dd>
          {finalBounds.width}×{finalBounds.height} @ ({finalBounds.x},{finalBounds.y})
        </dd>
        <dt>Checksum</dt>
        <dd>{cropChecksum ?? '—'}</dd>
        <dt>Generations for asset</dt>
        <dd>{dispatchCounts.generations}</dd>
        <dt>Crop version</dt>
        <dd>V{String(dispatchCounts.cropVersion).padStart(3, '0')}</dd>
        <dt>Crop approved</dt>
        <dd>{cropApproved ? 'YES' : 'NO'}</dd>
      </dl>

      {qaFailures.length > 0 && (
        <ul className="site00-dw-ref-crop-editor__failures">
          {qaFailures.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
