/**
 * EditableCropWorkspace — visual-first crop editor with coordinate convergence.
 * P0.VR.6R9
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CropReviewState } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/types.js';
import {
  applyFounderCropEdit,
  fitObjectToCrop,
  getActiveCrop,
  resetCropToDetector,
  selectCropDetectionCandidate,
  setAssetIdentity,
  SOURCE_HEIGHT_MOBILE,
  SOURCE_WIDTH_MOBILE,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/founderCropIntelligence.js';
import {
  canonicalFromNormalized,
  type CanonicalCropRect,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/canonicalCropRect.js';
import type { NormalizedBbox } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/types.js';
import { CropBoxOverlay } from './CropBoxOverlay.js';
import { useCropEditorGeometry } from './useCropEditorGeometry.js';

type Props = {
  review: CropReviewState;
  sourceImageUrl: string;
  isMobile?: boolean;
  assetIndex?: number;
  assetTotal?: number;
  onReviewChange: (review: CropReviewState) => void;
  onApproveCrop: (overrideWarnings?: boolean) => void;
  onWrongAsset: () => void;
};

function statusChip(review: CropReviewState): { label: string; tone: string } {
  if (review.reviewStatus === 'APPROVED') return { label: 'APPROVED', tone: 'pass' };
  if (review.reviewStatus === 'EDIT_REQUIRED') return { label: 'EDIT REQUIRED', tone: 'block' };
  if (review.semanticBoundary?.needsFounderPlacement) return { label: 'NEEDS PLACEMENT', tone: 'warn' };
  if (review.reviewStatus === 'READY_FOR_APPROVAL') return { label: 'READY', tone: 'pass' };
  return { label: review.reviewStatus.replace(/_/g, ' '), tone: 'neutral' };
}

export function EditableCropWorkspace({
  review,
  sourceImageUrl,
  isMobile = false,
  assetIndex = 1,
  assetTotal = 5,
  onReviewChange,
  onApproveCrop,
  onWrongAsset,
}: Props) {
  const [zoom, setZoom] = useState(review.editorState?.zoom ?? 1);
  const [manualDraw, setManualDraw] = useState(false);
  const [wrongAssetOpen, setWrongAssetOpen] = useState(false);
  const [qaDebounce, setQaDebounce] = useState(review.preflight.issues);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const qaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const activeCrop = useMemo(() => getActiveCrop(review), [review]);
  const chip = statusChip(review);
  const brandShort = review.assetName.replace(/ FAMILY VISUAL$/i, '');

  const {
    canonical,
    geometry,
    screenGeometry,
    overlayCss,
    alignment,
    naturalWidth,
    naturalHeight,
    remeasure,
    recalibrate,
    drawPreview,
    canonicalToNormalized,
  } = useCropEditorGeometry({
    normalizedCrop: activeCrop,
    sourceImageUrl,
    candidateId: review.candidateId,
    zoom,
    imgRef,
    stageRef,
  });

  const applyCanonical = useCallback(
    (crop: CanonicalCropRect, action: 'FOUNDER_DRAG' | 'FOUNDER_RESIZE' | 'MANUAL_CROP') => {
      const bbox = canonicalToNormalized(crop);
      onReviewChange(applyFounderCropEdit(review, bbox, action, naturalWidth || SOURCE_WIDTH_MOBILE, naturalHeight || SOURCE_HEIGHT_MOBILE));
    },
    [canonicalToNormalized, naturalHeight, naturalWidth, onReviewChange, review],
  );

  const applyCrop = useCallback(
    (bbox: NormalizedBbox, action: 'FOUNDER_DRAG' | 'FOUNDER_RESIZE' | 'MANUAL_CROP') => {
      onReviewChange(applyFounderCropEdit(review, bbox, action, naturalWidth || SOURCE_WIDTH_MOBILE, naturalHeight || SOURCE_HEIGHT_MOBILE));
    },
    [naturalHeight, naturalWidth, onReviewChange, review],
  );

  useEffect(() => {
    if (qaTimerRef.current) clearTimeout(qaTimerRef.current);
    qaTimerRef.current = setTimeout(() => setQaDebounce(review.preflight.issues), 280);
    return () => {
      if (qaTimerRef.current) clearTimeout(qaTimerRef.current);
    };
  }, [review.preflight.issues]);

  useEffect(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => drawPreview(previewCanvasRef.current));
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [drawPreview, canonical, sourceImageUrl]);

  const hasBlocks = review.preflight.issues.some((i) => i.severity === 'BLOCK');
  const hasWarns = review.preflight.issues.some((i) => i.severity === 'WARN');
  const alignmentBlocked = alignment == null || alignment.blocksApproval;
  const canApprove =
    review.assetIdentity === 'CONFIRMED' &&
    !hasBlocks &&
    !alignmentBlocked &&
    review.reviewStatus !== 'APPROVED' &&
    naturalWidth > 0;
  const showWarningOverride = canApprove && hasWarns;

  const snapTargetsCanonical = useMemo(() => {
    const sb = review.semanticBoundary;
    if (!sb || naturalWidth <= 0 || naturalHeight <= 0) return [];
    return [
      canonicalFromNormalized(sb.mediaRegion, naturalWidth, naturalHeight),
      canonicalFromNormalized(sb.cardRegion, naturalWidth, naturalHeight),
    ];
  }, [review.semanticBoundary, naturalWidth, naturalHeight]);

  const candidates = review.semanticBoundary
    ? [review.semanticBoundary.primaryCandidate, ...review.semanticBoundary.alternateCandidates]
    : [];

  return (
    <div className={`site00-dw-crop-editor site00-dw-crop-editor--visual${isMobile ? ' site00-dw-crop-editor--mobile' : ''}`}>
      <header className="site00-dw-crop-editor__topbar">
        <span className="site00-dw-crop-editor__counter">
          {String(assetIndex).padStart(2, '0')} OF {String(assetTotal).padStart(2, '0')}
        </span>
        <strong>{brandShort}</strong>
        <span className={`site00-dw-crop-editor__chip is-${chip.tone}`}>{chip.label}</span>
        {alignmentBlocked ? (
          <span className="site00-dw-crop-editor__chip is-block">PREVIEW ALIGNMENT ERROR</span>
        ) : null}
        {review.assetIdentity !== 'CONFIRMED' ? (
          <button type="button" className="site00-dw-crop-editor__identity-chip" onClick={() => onReviewChange(setAssetIdentity(review, 'CONFIRMED'))}>
            CONFIRM ASSET
          </button>
        ) : (
          <span className="site00-dw-crop-editor__identity-chip is-confirmed">ASSET ✓</span>
        )}
      </header>

      {alignmentBlocked ? (
        <div className="site00-dw-crop-editor__alignment-error">
          <p>{alignment?.message ?? 'THE CROP BOX AND PREVIEW ARE OUT OF SYNC. APPROVAL IS PAUSED.'}</p>
          <button type="button" onClick={() => { recalibrate(); remeasure(); }}>RECALIBRATE</button>
        </div>
      ) : null}

      {candidates.length > 1 && review.semanticBoundary?.needsFounderPlacement ? (
        <div className="site00-dw-crop-editor__candidates">
          {candidates.map((c) => (
            <button
              key={c.candidateId}
              type="button"
              className={review.selectedCandidateId === c.candidateId ? 'is-active' : ''}
              onClick={() => onReviewChange(selectCropDetectionCandidate(review, c.candidateId))}
            >
              {c.label} · {c.confidencePercent}%
            </button>
          ))}
        </div>
      ) : null}

      <div className={`site00-dw-crop-editor__layout${isMobile ? ' is-mobile' : ''}`}>
        <section className="site00-dw-crop-editor__canvas">
          <div className="site00-dw-crop-editor__canvas-toolbar">
            <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>−</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>+</button>
            <button type="button" onClick={() => setZoom(1)}>FIT</button>
          </div>
          <div className="site00-dw-crop-editor__viewport">
            <div
              ref={stageRef}
              className="site00-dw-crop-editor__image-stage"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
              <img ref={imgRef} src={sourceImageUrl} alt="Reference source" crossOrigin="anonymous" draggable={false} />
              {canonical && screenGeometry && overlayCss ? (
                <CropBoxOverlay
                  canonical={canonical}
                  overlayCss={overlayCss}
                  geometry={screenGeometry}
                  snapTargets={snapTargetsCanonical}
                  manualDrawMode={manualDraw}
                  onCanonicalChange={applyCanonical}
                  onDrawStart={() => setManualDraw(true)}
                />
              ) : null}
            </div>
          </div>
        </section>

        <aside className="site00-dw-crop-editor__sidebar">
          <div className="site00-dw-crop-editor__live-preview">
            <span>LIVE CROP PREVIEW</span>
            <canvas ref={previewCanvasRef} />
          </div>

          <div className="site00-dw-crop-editor__qa-chips">
            {qaDebounce.length === 0 ? (
              <span className="site00-dw-crop-editor__qa-chip is-pass">CLEAR</span>
            ) : (
              qaDebounce.map((issue) => (
                <button
                  key={issue.code}
                  type="button"
                  className={`site00-dw-crop-editor__qa-chip is-${issue.severity.toLowerCase()}`}
                  title={issue.label}
                >
                  {issue.code.replace(/_/g, ' ')}
                </button>
              ))
            )}
          </div>

          <div className="site00-dw-crop-editor__actions">
            <button type="button" onClick={() => onReviewChange(fitObjectToCrop(review))}>FIT OBJECT</button>
            <button type="button" onClick={() => onReviewChange(resetCropToDetector(review))}>REVERT DETECTED</button>
            <button type="button" onClick={() => setManualDraw((v) => !v)}>{manualDraw ? 'DRAWING…' : 'MANUAL'}</button>
            <button type="button" onClick={() => setWrongAssetOpen((v) => !v)}>WRONG ASSET</button>
          </div>

          {wrongAssetOpen ? (
            <div className="site00-dw-crop-editor__wrong-asset">
              <button type="button" onClick={() => candidates[1] && onReviewChange(selectCropDetectionCandidate(review, candidates[1]!.candidateId))}>
                TRY ANOTHER CANDIDATE
              </button>
              <button type="button" onClick={() => { setManualDraw(true); setWrongAssetOpen(false); }}>DRAW REGION MANUALLY</button>
              <button type="button" onClick={() => onReviewChange(resetCropToDetector(review))}>RE-DETECT INSIDE CARD</button>
              <button type="button" onClick={onWrongAsset}>REMOVE FROM JOB</button>
            </div>
          ) : null}

          {review.reviewStatus === 'APPROVED' ? (
            <p className="site00-dw-crop-editor__approved">CROP APPROVED ✓</p>
          ) : (
            <>
              <button
                type="button"
                className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-crop-editor__approve"
                disabled={!canApprove}
                onClick={() => onApproveCrop(hasWarns)}
              >
                {hasWarns ? 'APPROVE WITH WARNING' : 'APPROVE CROP'}
              </button>
              {showWarningOverride ? (
                <p className="site00-dw-crop-editor__warn-note">Warnings present — approval will be audited.</p>
              ) : null}
            </>
          )}

          <details className="site00-dw-crop-editor__details">
            <summary>DETAILS</summary>
            <dl>
              <div><dt>TARGET SLOT</dt><dd>{review.targetSlot}</dd></div>
              <div><dt>SOURCE NATURAL</dt><dd>{naturalWidth || '—'}×{naturalHeight || '—'}</dd></div>
              <div><dt>CANONICAL PX</dt><dd>{canonical ? `${Math.round(canonical.x)},${Math.round(canonical.y)} · ${Math.round(canonical.width)}×${Math.round(canonical.height)}` : '—'}</dd></div>
              <div><dt>ALIGNMENT</dt><dd>{alignment?.status ?? 'PENDING'}</dd></div>
              <div><dt>ROUND-TRIP ERR</dt><dd>{alignment?.roundTripErrorPx?.toFixed(2) ?? '—'} px</dd></div>
            </dl>
            <details className="site00-dw-crop-editor__geometry">
              <summary>GEOMETRY</summary>
              <dl>
                <div><dt>RENDERED</dt><dd>{geometry ? `${Math.round(geometry.width)}×${Math.round(geometry.height)}` : '—'}</dd></div>
                <div><dt>SCALE</dt><dd>{geometry ? `${geometry.scaleX.toFixed(4)} × ${geometry.scaleY.toFixed(4)}` : '—'}</dd></div>
                <div><dt>LETTERBOX</dt><dd>{geometry ? `${geometry.letterboxX.toFixed(1)}, ${geometry.letterboxY.toFixed(1)}` : '—'}</dd></div>
                <div><dt>DPR</dt><dd>{geometry?.devicePixelRatio ?? '—'}</dd></div>
                <div><dt>ZOOM</dt><dd>{zoom}</dd></div>
                <div><dt>OVERLAY CSS</dt><dd>{overlayCss ? `${overlayCss.left.toFixed(1)},${overlayCss.top.toFixed(1)} ${overlayCss.width.toFixed(1)}×${overlayCss.height.toFixed(1)}` : '—'}</dd></div>
              </dl>
            </details>
            <details className="site00-dw-crop-editor__nudge">
              <summary>ADVANCED NUDGE</summary>
              <div className="site00-dw-crop-editor__nudge-grid">
                <button type="button" onClick={() => applyCrop({ ...activeCrop, x: activeCrop.x - 0.005 }, 'FOUNDER_DRAG')}>←</button>
                <button type="button" onClick={() => applyCrop({ ...activeCrop, x: activeCrop.x + 0.005 }, 'FOUNDER_DRAG')}>→</button>
                <button type="button" onClick={() => applyCrop({ ...activeCrop, y: activeCrop.y - 0.005 }, 'FOUNDER_DRAG')}>↑</button>
                <button type="button" onClick={() => applyCrop({ ...activeCrop, y: activeCrop.y + 0.005 }, 'FOUNDER_DRAG')}>↓</button>
              </div>
            </details>
          </details>
        </aside>
      </div>
    </div>
  );
}
