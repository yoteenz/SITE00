/**
 * EditableCropWorkspace — founder crop editor with source context + QA.
 * P0.VR.6R7
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import type { CropReviewState } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/types.js';
import {
  applyFounderCropEdit,
  adjustCropPadding,
  fitObjectToCrop,
  getActiveCrop,
  resetCropToDetector,
  setAssetIdentity,
  SOURCE_HEIGHT_MOBILE,
  SOURCE_WIDTH_MOBILE,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/founderCropIntelligence.js';
import type { NormalizedBbox } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/types.js';

type Props = {
  review: CropReviewState;
  sourceImageUrl: string;
  cropPreviewUrl: string;
  isMobile?: boolean;
  onReviewChange: (review: CropReviewState) => void;
  onApproveCrop: () => void;
  onWrongAsset: () => void;
};

function bboxStyle(bbox: NormalizedBbox, color: string): React.CSSProperties {
  return {
    position: 'absolute',
    left: `${bbox.x * 100}%`,
    top: `${bbox.y * 100}%`,
    width: `${bbox.width * 100}%`,
    height: `${bbox.height * 100}%`,
    border: `2px solid ${color}`,
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
    pointerEvents: 'none',
  };
}

export function EditableCropWorkspace({
  review,
  sourceImageUrl,
  cropPreviewUrl,
  isMobile = false,
  onReviewChange,
  onApproveCrop,
  onWrongAsset,
}: Props) {
  const [zoom, setZoom] = useState(1);
  const [manualMode, setManualMode] = useState(false);
  const sourceRef = useRef<HTMLDivElement>(null);

  const activeCrop = useMemo(() => getActiveCrop(review), [review]);

  const applyCrop = useCallback(
    (bbox: NormalizedBbox, action: 'FOUNDER_DRAG' | 'MANUAL_CROP') => {
      onReviewChange(applyFounderCropEdit(review, bbox, action, SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE));
    },
    [onReviewChange, review],
  );

  const handleSourceClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!manualMode || !sourceRef.current) return;
      const rect = sourceRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      const w = activeCrop.width;
      const h = activeCrop.height;
      applyCrop(
        {
          x: Math.max(0, Math.min(1 - w, nx - w / 2)),
          y: Math.max(0, Math.min(1 - h, ny - h / 2)),
          width: w,
          height: h,
        },
        'MANUAL_CROP',
      );
      setManualMode(false);
    },
    [activeCrop.height, activeCrop.width, applyCrop, manualMode],
  );

  const nudgeCrop = (dx: number, dy: number) => {
    applyCrop(
      {
        ...activeCrop,
        x: activeCrop.x + dx,
        y: activeCrop.y + dy,
      },
      'FOUNDER_DRAG',
    );
  };

  const resizeCrop = (dw: number, dh: number) => {
    applyCrop(
      {
        ...activeCrop,
        width: activeCrop.width + dw,
        height: activeCrop.height + dh,
      },
      'FOUNDER_DRAG',
    );
  };

  const canApprove =
    review.assetIdentity === 'CONFIRMED' &&
    !review.preflight.blocksApproval &&
    review.reviewStatus !== 'APPROVED';

  return (
    <div className={`site00-dw-crop-editor${isMobile ? ' site00-dw-crop-editor--mobile' : ''}`} data-visual-authority="VISUAL_AUTHORITY_REQUIRED">
      <div className={`site00-dw-crop-editor__panes${isMobile ? ' is-stacked' : ''}`}>
        <section className="site00-dw-crop-editor__source">
          <header>
            <h3>REFERENCE CONTEXT</h3>
            <div className="site00-dw-crop-editor__zoom">
              <button type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>−</button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>+</button>
            </div>
          </header>
          <div
            ref={sourceRef}
            className="site00-dw-crop-editor__source-frame"
            style={{ transform: `scale(${zoom})` }}
            onClick={handleSourceClick}
            role="presentation"
          >
            <img src={sourceImageUrl} alt="Reference source" />
            <div style={bboxStyle(review.detectorCrop, 'rgba(120,180,255,0.9)')} title="Detector region" />
            <div style={bboxStyle(activeCrop, 'rgba(255,90,60,0.95)')} title="Active crop" />
          </div>
          <p className="site00-dw-crop-editor__hint">BOUNDING BOX HIGHLIGHT · DIMMED OUTSIDE · {manualMode ? 'CLICK TO PLACE MANUAL CROP' : 'USE CONTROLS TO EDIT'}</p>
        </section>

        <section className="site00-dw-crop-editor__preview">
          <header>
            <h3>EDITED CROP PREVIEW</h3>
            <span className={`site00-dw-crop-editor__status is-${review.reviewStatus.toLowerCase().replace(/_/g, '-')}`}>
              {review.reviewStatus.replace(/_/g, ' ')}
            </span>
          </header>
          <div className="site00-dw-crop-editor__preview-frame">
            <img src={cropPreviewUrl} alt="Crop preview" />
          </div>
          <p className="site00-dw-crop-editor__pipeline">SOURCE CROP → RECONSTRUCTED ASSET → QA → APPROVAL → CANONICAL → LIVE BIND</p>
        </section>
      </div>

      <section className="site00-dw-crop-editor__intel">
        <div>
          <h4>
            ASSET {review.assetNumber} — {review.assetName}
          </h4>
          <dl>
            <div><dt>TARGET SLOT</dt><dd>{review.targetSlot}</dd></div>
            <div><dt>DETECTED TYPE</dt><dd>{review.detectionExplanation.detectedType}</dd></div>
            <div><dt>DETECTION BASIS</dt><dd>{review.detectionExplanation.detectionBasis}</dd></div>
            <div><dt>CONFIDENCE</dt><dd>{review.detectionExplanation.confidencePercent}%</dd></div>
            <div><dt>WHY SELECTED</dt><dd>{review.detectionExplanation.summary}</dd></div>
            <div><dt>EXPECTED CONTENT</dt><dd>{review.detectionExplanation.expectedContent}</dd></div>
            <div><dt>OBJECT COVERAGE</dt><dd>{review.preflight.objectCoverage}</dd></div>
            <div><dt>EDGE CONTACT</dt><dd>{review.preflight.edgeContact}</dd></div>
            <div><dt>UNWANTED CONTEXT</dt><dd>{review.preflight.unwantedContext.join(' · ')}</dd></div>
            <div><dt>RECOMMENDATION</dt><dd>{review.preflight.recommendedAction}</dd></div>
          </dl>
        </div>
        <div className="site00-dw-crop-editor__issues">
          <h4>CROP QUALITY</h4>
          <ul>
            {review.preflight.issues.map((issue) => (
              <li key={issue.code} className={`is-${issue.severity.toLowerCase()}`}>
                {issue.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="site00-dw-crop-editor__identity">
        <h4>1. IS THIS THE RIGHT ASSET?</h4>
        <div className="site00-dw-crop-editor__identity-btns">
          <button
            type="button"
            className={review.assetIdentity === 'CONFIRMED' ? 'is-active' : ''}
            onClick={() => onReviewChange(setAssetIdentity(review, 'CONFIRMED'))}
          >
            YES — RIGHT ASSET
          </button>
          <button type="button" className={review.assetIdentity === 'WRONG_ASSET' ? 'is-active' : ''} onClick={onWrongAsset}>
            NO — WRONG ASSET
          </button>
          <button
            type="button"
            className={review.assetIdentity === 'UNSURE' ? 'is-active' : ''}
            onClick={() => onReviewChange(setAssetIdentity(review, 'UNSURE'))}
          >
            UNSURE
          </button>
        </div>
      </section>

      <section className="site00-dw-crop-editor__controls">
        <h4>2. IS THIS THE RIGHT CROP?</h4>
        <div className="site00-dw-crop-editor__control-grid">
          <button type="button" onClick={() => nudgeCrop(-0.005, 0)}>← DRAG</button>
          <button type="button" onClick={() => nudgeCrop(0.005, 0)}>DRAG →</button>
          <button type="button" onClick={() => nudgeCrop(0, -0.005)}>↑ DRAG</button>
          <button type="button" onClick={() => nudgeCrop(0, 0.005)}>DRAG ↓</button>
          <button type="button" onClick={() => resizeCrop(0.01, 0)}>RESIZE W+</button>
          <button type="button" onClick={() => resizeCrop(-0.01, 0)}>RESIZE W−</button>
          <button type="button" onClick={() => onReviewChange(fitObjectToCrop(review))}>FIT OBJECT</button>
          <button type="button" onClick={() => onReviewChange(adjustCropPadding(review, 10))}>ADD PADDING</button>
          <button type="button" onClick={() => onReviewChange(adjustCropPadding(review, -10))}>REMOVE PADDING</button>
          <button type="button" onClick={() => onReviewChange(resetCropToDetector(review))}>RESET</button>
          <button type="button" onClick={() => setManualMode(true)}>MANUAL CROP</button>
          <button type="button" onClick={() => onReviewChange(applyFounderCropEdit(review, review.detectorCrop, 'FIT_OBJECT'))}>
            USE FULL DETECTED REGION
          </button>
        </div>
      </section>

      <section className="site00-dw-crop-editor__approve">
        <h4>3. IS THIS READY TO GENERATE?</h4>
        <p className="site00-dw-crop-editor__human-summary">{review.humanSummary}</p>
        <details>
          <summary>PROVIDER PROMPT PREVIEW</summary>
          <pre className="site00-dw-crop-editor__prompt-tech">{review.humanSummary}</pre>
        </details>
        {review.reviewStatus === 'APPROVED' ? (
          <p className="site00-dw-crop-editor__approved">CROP APPROVED ✓ · CHECKSUM {review.cropChecksum}</p>
        ) : (
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled={!canApprove} onClick={onApproveCrop}>
            APPROVE CROP
          </button>
        )}
        <p className="site00-dw-crop-editor__gate-note">CROP APPROVAL DOES NOT START GENERATION</p>
      </section>
    </div>
  );
}
