/**
 * EditableCropWorkspace — visual-first direct-manipulation crop editor.
 * P0.VR.6R8
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
import type { NormalizedBbox } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/types.js';
import { CropBoxOverlay } from './CropBoxOverlay.js';

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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [wrongAssetOpen, setWrongAssetOpen] = useState(false);
  const [qaDebounce, setQaDebounce] = useState(review.preflight.issues);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const qaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeCrop = useMemo(() => getActiveCrop(review), [review]);
  const chip = statusChip(review);
  const brandShort = review.assetName.replace(/ FAMILY VISUAL$/i, '');

  const pointerToNormalized = useCallback((clientX: number, clientY: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect?.width || !rect.height) return { x: 0, y: 0 };
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  }, []);

  const applyCrop = useCallback(
    (bbox: NormalizedBbox, action: 'FOUNDER_DRAG' | 'FOUNDER_RESIZE' | 'MANUAL_CROP') => {
      onReviewChange(applyFounderCropEdit(review, bbox, action, SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE));
    },
    [onReviewChange, review],
  );

  useEffect(() => {
    if (qaTimerRef.current) clearTimeout(qaTimerRef.current);
    qaTimerRef.current = setTimeout(() => setQaDebounce(review.preflight.issues), 280);
    return () => {
      if (qaTimerRef.current) clearTimeout(qaTimerRef.current);
    };
  }, [review.preflight.issues]);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;
    const px = {
      x: Math.round(activeCrop.x * img.naturalWidth),
      y: Math.round(activeCrop.y * img.naturalHeight),
      width: Math.max(1, Math.round(activeCrop.width * img.naturalWidth)),
      height: Math.max(1, Math.round(activeCrop.height * img.naturalHeight)),
    };
    canvas.width = px.width;
    canvas.height = px.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, px.x, px.y, px.width, px.height, 0, 0, px.width, px.height);
  }, [activeCrop, sourceImageUrl]);

  const hasBlocks = review.preflight.issues.some((i) => i.severity === 'BLOCK');
  const hasWarns = review.preflight.issues.some((i) => i.severity === 'WARN');
  const canApprove =
    review.assetIdentity === 'CONFIRMED' && !hasBlocks && review.reviewStatus !== 'APPROVED';
  const showWarningOverride = canApprove && hasWarns;

  const snapTargets = useMemo(() => {
    const sb = review.semanticBoundary;
    if (!sb) return [];
    return [sb.mediaRegion, sb.cardRegion];
  }, [review.semanticBoundary]);

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
        {review.assetIdentity !== 'CONFIRMED' ? (
          <button type="button" className="site00-dw-crop-editor__identity-chip" onClick={() => onReviewChange(setAssetIdentity(review, 'CONFIRMED'))}>
            CONFIRM ASSET
          </button>
        ) : (
          <span className="site00-dw-crop-editor__identity-chip is-confirmed">ASSET ✓</span>
        )}
      </header>

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
            <div ref={frameRef} className="site00-dw-crop-editor__source-frame" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
              <img ref={imgRef} src={sourceImageUrl} alt="Reference source" crossOrigin="anonymous" />
              <CropBoxOverlay
                bbox={activeCrop}
                snapTargets={snapTargets}
                manualDrawMode={manualDraw}
                onChange={applyCrop}
                onDrawStart={() => setManualDraw(true)}
                pointerToNormalized={pointerToNormalized}
              />
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

          <details className="site00-dw-crop-editor__details" open={detailsOpen}>
            <summary onClick={() => setDetailsOpen((v) => !v)}>DETAILS</summary>
            <dl>
              <div><dt>TARGET SLOT</dt><dd>{review.targetSlot}</dd></div>
              <div><dt>DETECTED TYPE</dt><dd>{review.detectionExplanation.detectedType}</dd></div>
              <div><dt>CONFIDENCE</dt><dd>{review.detectionExplanation.confidencePercent}%</dd></div>
              <div><dt>BOUNDARY CONF</dt><dd>{review.semanticBoundary?.boundaryConfidence ?? '—'}%</dd></div>
              <div><dt>EXPECTED</dt><dd>{review.detectionExplanation.expectedContent}</dd></div>
              <div><dt>COVERAGE</dt><dd>{review.preflight.objectCoverage}</dd></div>
              <div><dt>SOURCE</dt><dd>{SOURCE_WIDTH_MOBILE}×{SOURCE_HEIGHT_MOBILE}</dd></div>
              <div><dt>CROP NORM</dt><dd>{activeCrop.x.toFixed(3)},{activeCrop.y.toFixed(3)} · {activeCrop.width.toFixed(3)}×{activeCrop.height.toFixed(3)}</dd></div>
              <div><dt>EXPLANATION</dt><dd>{review.detectionExplanation.summary}</dd></div>
            </dl>
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
