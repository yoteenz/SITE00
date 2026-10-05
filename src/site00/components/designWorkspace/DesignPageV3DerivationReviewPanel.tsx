import { useMemo, useState } from 'react';
import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import {
  FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER,
  FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER,
  P0_VR_TWIN_V30R6F2_LINEAGE,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import type {
  AuthorityVisualCoverageReceipt,
  PixelGroundedAuthorityAnalysis,
  PixelMeasuredObject,
  WeightedAuthorityCoverageReceipt,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/pixelGroundedTypes.js';
import type { ExactPixelMeasuredObject } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/geometryFidelityTypes.js';
import type { GeometryFidelityReceipt } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/geometryFidelityTypes.js';
import type {
  CompilerReadinessReceipt,
  CompletedMasterFeatureBinding,
  DesignWorkspaceImplementationPackage,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/types.js';
import {
  approveTranslationReview,
  evaluateTranslationApprovalGate,
  requestDerivationCorrection,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/translationReview.js';
import { listGeometryQaWeakObjects } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/exactBoundaryAnalysis.js';
import type { ExactBoundaryAnalysis } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/geometryFidelityTypes.js';
import { resolveDesignPageAuthorityImageSrc } from './designPageAuthorityR3PrototypeUrls.js';

type ReviewMode = 'AUTHORITY' | 'OBJECTS' | 'REGIONS' | 'GEOMETRY_QA' | 'FEATURES' | 'GAPS';

type Props = {
  session: DesignPageAuthorityReviewSession;
  onSessionUpdate: (session: DesignPageAuthorityReviewSession) => void;
};

function isExactObject(o: PixelMeasuredObject): o is ExactPixelMeasuredObject {
  return 'visualBounds' in o && 'derivationAlgorithm' in o;
}

export function DesignPageV3DerivationReviewPanel({ session, onSessionUpdate }: Props) {
  const derivation = session.designWorkspaceDerivation;
  const pkgId = derivation?.latestPackageId;
  const [viewport, setViewport] = useState<'MOBILE' | 'DESKTOP'>('MOBILE');
  const [mode, setMode] = useState<ReviewMode>('OBJECTS');
  const [showOverlay, setShowOverlay] = useState(true);
  const [showObjectIds, setShowObjectIds] = useState(false);
  const [correctionNote, setCorrectionNote] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [focusedObjectId, setFocusedObjectId] = useState<string | null>(null);

  const pkg = useMemo(
    () => derivation?.packages.find((p) => p.id === pkgId) as DesignWorkspaceImplementationPackage | undefined,
    [derivation?.packages, pkgId],
  );

  if (!pkgId || !pkg) return null;

  const objectMap = derivation?.artifactsById[pkg.surgicalObjectMapId] as
    | { objects: PixelMeasuredObject[]; relationships: { id: string; type: string }[] }
    | undefined;
  const receipt = derivation?.artifactsById[pkg.compilerReadinessReceiptId] as CompilerReadinessReceipt | undefined;
  const mobileAnalysis = pkg.exactBoundaryAnalysisMobileId ?
    (derivation?.artifactsById[pkg.exactBoundaryAnalysisMobileId] as ExactBoundaryAnalysis | undefined)
  : pkg.pixelGroundedAnalysisMobileId ?
    (derivation?.artifactsById[pkg.pixelGroundedAnalysisMobileId] as PixelGroundedAuthorityAnalysis | undefined)
  : undefined;
  const desktopAnalysis = pkg.exactBoundaryAnalysisDesktopId ?
    (derivation?.artifactsById[pkg.exactBoundaryAnalysisDesktopId] as ExactBoundaryAnalysis | undefined)
  : pkg.pixelGroundedAnalysisDesktopId ?
    (derivation?.artifactsById[pkg.pixelGroundedAnalysisDesktopId] as PixelGroundedAuthorityAnalysis | undefined)
  : undefined;
  const mobileCoverage = pkg.authorityVisualCoverageReceiptMobileId ?
    (derivation?.artifactsById[pkg.authorityVisualCoverageReceiptMobileId] as AuthorityVisualCoverageReceipt | undefined)
  : undefined;
  const desktopCoverage = pkg.authorityVisualCoverageReceiptDesktopId ?
    (derivation?.artifactsById[pkg.authorityVisualCoverageReceiptDesktopId] as AuthorityVisualCoverageReceipt | undefined)
  : undefined;
  const mobileWeighted = pkg.weightedAuthorityCoverageReceiptMobileId ?
    (derivation?.artifactsById[pkg.weightedAuthorityCoverageReceiptMobileId] as WeightedAuthorityCoverageReceipt | undefined)
  : undefined;
  const desktopWeighted = pkg.weightedAuthorityCoverageReceiptDesktopId ?
    (derivation?.artifactsById[pkg.weightedAuthorityCoverageReceiptDesktopId] as WeightedAuthorityCoverageReceipt | undefined)
  : undefined;
  const mobileGeometry = pkg.geometryFidelityReceiptMobileId ?
    (derivation?.artifactsById[pkg.geometryFidelityReceiptMobileId] as GeometryFidelityReceipt | undefined)
  : undefined;
  const desktopGeometry = pkg.geometryFidelityReceiptDesktopId ?
    (derivation?.artifactsById[pkg.geometryFidelityReceiptDesktopId] as GeometryFidelityReceipt | undefined)
  : undefined;

  const mobileObjects = objectMap?.objects.filter((o) => o.viewport === 'MOBILE').length ?? 0;
  const desktopObjects = objectMap?.objects.filter((o) => o.viewport === 'DESKTOP').length ?? 0;

  const analysis = viewport === 'MOBILE' ? mobileAnalysis : desktopAnalysis;
  const coverage = viewport === 'MOBILE' ? mobileCoverage : desktopCoverage;
  const weighted = viewport === 'MOBILE' ? mobileWeighted : desktopWeighted;
  const geometry = viewport === 'MOBILE' ? mobileGeometry : desktopGeometry;
  const authoritySrc =
    viewport === 'MOBILE' ?
      resolveDesignPageAuthorityImageSrc(FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.publicPath)
    : resolveDesignPageAuthorityImageSrc(FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER.publicPath);

  const viewportObjects = useMemo(() => {
    const all = objectMap?.objects.filter((o) => o.viewport === viewport) ?? [];
    if (mode === 'REGIONS') {
      return all.filter((o) => o.category === 'PANEL' || o.category === 'SURFACE');
    }
    if (mode === 'OBJECTS' || mode === 'AUTHORITY' || mode === 'GEOMETRY_QA') {
      return all.filter((o) => o.category !== 'PANEL' && o.category !== 'SURFACE');
    }
    return [];
  }, [objectMap?.objects, viewport, mode]);

  const weakObjectIds = useMemo(() => {
    if (!analysis || !('boundaryReceipts' in analysis)) return new Set<string>();
    const weak = listGeometryQaWeakObjects(analysis as ExactBoundaryAnalysis);
    return new Set(weak.map((o) => o.objectId));
  }, [analysis]);

  const featureBindings = pkg.masterFeatureBindingIds
    .map((id) => derivation?.artifactsById[id] as CompletedMasterFeatureBinding | undefined)
    .filter(Boolean) as CompletedMasterFeatureBinding[];

  const translationDecision = derivation?.translationReview?.founderDecision ?? 'PENDING';
  const approvalGate = evaluateTranslationApprovalGate(session);

  const focusedObject = focusedObjectId ?
    (objectMap?.objects.find((o) => o.objectId === focusedObjectId) as ExactPixelMeasuredObject | undefined)
  : undefined;

  const onApprove = () => {
    onSessionUpdate(approveTranslationReview(session, 'Founder approved exact-boundary translation'));
  };

  const onRequestCorrection = () => {
    const notes = correctionNote.trim() ? [correctionNote.trim()] : ['OBJECT_BOUNDARIES_NOT_PIXEL_EXACT'];
    onSessionUpdate(requestDerivationCorrection(session, notes));
    setCorrectionNote('');
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setFocusedObjectId(null);
  };

  return (
    <section
      className="site00-dw-v3-derivation-review"
      aria-label="Derivation package review"
      data-testid="v3-derivation-review-panel"
      data-lineage={P0_VR_TWIN_V30R6F2_LINEAGE}
    >
      <header className="site00-dw-v3-derivation-review__head">
        <strong>TRANSLATION REVIEW · {pkg.status.replace(/_/g, ' ')}</strong>
        <span>
          Algorithm {pkg.derivationAlgorithm ?? 'R6'} · v{pkg.derivationVersion ?? 1} · checksum{' '}
          {pkg.packageChecksum.slice(0, 12)}…
        </span>
      </header>
      <p className="site00-dw-v3-authority__hint">
        Object coverage ≠ geometry fidelity. Use OBJECTS layer for tight bounds; GEOMETRY QA highlights weak boxes.
      </p>

      <div className="site00-dw-v3-derivation-review__modes" role="tablist" aria-label="Review mode">
        {(['AUTHORITY', 'OBJECTS', 'REGIONS', 'GEOMETRY_QA', 'FEATURES', 'GAPS'] as ReviewMode[]).map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'is-active' : undefined}
            data-testid={`v3-derivation-mode-${m.toLowerCase().replace('_', '-')}`}
            onClick={() => setMode(m)}
          >
            {m.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="site00-dw-v3-derivation-review__viewport-toggle">
        <button type="button" className={viewport === 'MOBILE' ? 'is-active' : undefined} onClick={() => setViewport('MOBILE')}>
          MOBILE
        </button>
        <button type="button" className={viewport === 'DESKTOP' ? 'is-active' : undefined} onClick={() => setViewport('DESKTOP')}>
          DESKTOP
        </button>
        <label className="site00-dw-v3-derivation-review__toggle">
          <input type="checkbox" checked={showOverlay} onChange={(e) => setShowOverlay(e.target.checked)} />
          Blueprint overlay
        </label>
        <label className="site00-dw-v3-derivation-review__toggle">
          <input type="checkbox" checked={showObjectIds} onChange={(e) => setShowObjectIds(e.target.checked)} />
          Object IDs
        </label>
        <button type="button" onClick={() => setZoom((z) => Math.min(4, z + 0.25))} data-testid="v3-derivation-zoom-in">
          Zoom +
        </button>
        <button type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} data-testid="v3-derivation-zoom-out">
          Zoom −
        </button>
        <button type="button" onClick={resetView} data-testid="v3-derivation-reset-view">
          Reset view
        </button>
      </div>

      {(mode === 'AUTHORITY' || mode === 'OBJECTS' || mode === 'REGIONS' || mode === 'GEOMETRY_QA') && (
        <div
          className="site00-dw-v3-derivation-review__authority-stage"
          data-testid="v3-derivation-authority-stage"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            const start = { x: e.clientX - pan.x, y: e.clientY - pan.y };
            const move = (ev: PointerEvent) => setPan({ x: ev.clientX - start.x, y: ev.clientY - start.y });
            const up = () => {
              window.removeEventListener('pointermove', move);
              window.removeEventListener('pointerup', up);
            };
            window.addEventListener('pointermove', move);
            window.addEventListener('pointerup', up);
          }}
        >
          <div
            className="site00-dw-v3-derivation-review__zoom-layer"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            <img src={authoritySrc} alt={`${viewport} locked founder authority`} className="site00-dw-v3-derivation-review__authority-img" />
            {showOverlay ?
              <div className="site00-dw-v3-derivation-review__overlay" aria-hidden>
                {viewportObjects.map((o) => {
                  const layerClass =
                    o.category === 'PANEL' || o.category === 'SURFACE' ?
                      'site00-dw-v3-derivation-review__overlay-box--region'
                    : o.category === 'TEXT' ?
                      'site00-dw-v3-derivation-review__overlay-box--text'
                    : o.category === 'IMAGE' || o.category === 'ARTIFACT' ?
                      'site00-dw-v3-derivation-review__overlay-box--image'
                    : o.category === 'BUTTON' || o.category === 'CONTROL' || o.category === 'NAV_ITEM' ?
                      'site00-dw-v3-derivation-review__overlay-box--control'
                    : 'site00-dw-v3-derivation-review__overlay-box--object';
                  const qaWeak = mode === 'GEOMETRY_QA' && weakObjectIds.has(o.objectId);
                  return (
                    <button
                      key={o.objectId}
                      type="button"
                      className={`site00-dw-v3-derivation-review__overlay-box ${layerClass}${qaWeak ? ' is-geometry-weak' : ''}${o.parentObjectId ? ' is-child' : ''}`}
                      style={{
                        left: `${o.normalizedX * 100}%`,
                        top: `${o.normalizedY * 100}%`,
                        width: `${o.normalizedWidth * 100}%`,
                        height: `${o.normalizedHeight * 100}%`,
                      }}
                      title={o.objectId}
                      data-importance={o.visualImportance}
                      data-testid={`v3-overlay-${o.objectId}`}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setFocusedObjectId(o.objectId);
                      }}
                    >
                      {showObjectIds ?
                        <span className="site00-dw-v3-derivation-review__overlay-label">
                          {o.objectId.replace(`${viewport.toLowerCase()}-`, '')}
                        </span>
                      : null}
                    </button>
                  );
                })}
              </div>
            : null}
          </div>
        </div>
      )}

      {focusedObject ?
        <div className="site00-dw-v3-derivation-review__inspect" data-testid="v3-object-inspect">
          <strong>{focusedObject.objectId}</strong>
          <p>
            {focusedObject.category} · {focusedObject.featureId ?? '—'} · confidence{' '}
            {isExactObject(focusedObject) ? focusedObject.geometryConfidence.toFixed(2) : '—'} · source{' '}
            {isExactObject(focusedObject) ? focusedObject.geometrySource : '—'}
          </p>
          {isExactObject(focusedObject) ?
            <p>
              Visual {focusedObject.visualBounds.w}×{focusedObject.visualBounds.h}px · Interaction{' '}
              {focusedObject.interactionBounds.w}×{focusedObject.interactionBounds.h}px
            </p>
          : null}
        </div>
      : null}

      {mode === 'FEATURES' ?
        <ul className="site00-dw-v3-derivation-review__feature-list" data-testid="v3-derivation-feature-bindings">
          {featureBindings.slice(0, 12).map((f) => (
            <li key={f.id}>
              {f.featureId}: {f.objectIds.length} objects · {f.resolution}
            </li>
          ))}
          <li>… {featureBindings.length} total features</li>
        </ul>
      : null}

      {mode === 'GAPS' ?
        <p className="site00-dw-v3-authority__hint" data-testid="v3-derivation-gaps">
          Low-confidence geometry and STRUCTURAL_INFERENCE objects surface here via GEOMETRY QA — no invented
          replacements.
        </p>
      : null}

      <div className="site00-dw-v3-derivation-review__grid">
        <div data-testid="v3-derivation-object-map-summary">
          <strong>SURGICAL OBJECT MAP</strong>
          <p>
            {mobileObjects} mobile · {desktopObjects} desktop · {objectMap?.relationships.length ?? 0} relationships
          </p>
        </div>
        <div data-testid="v3-derivation-coverage-summary">
          <strong>OBJECT COVERAGE ({viewport})</strong>
          <p>{coverage?.coveragePercent.toFixed(1) ?? '—'}% mapped · critical {weighted?.criticalCoveragePercent.toFixed(0) ?? '—'}%</p>
        </div>
        <div data-testid="v3-derivation-geometry-summary">
          <strong>GEOMETRY FIDELITY ({viewport})</strong>
          <p>
            {geometry?.weightedGeometryFidelityPercent.toFixed(1) ?? '—'}% weighted · failures{' '}
            {geometry?.failedObjects ?? '—'} · {geometry?.result ?? '—'}
          </p>
        </div>
        <div>
          <strong>TRANSLATION REVIEW</strong>
          <p data-testid="v3-translation-decision">{translationDecision.replace(/_/g, ' ')}</p>
        </div>
      </div>

      {pkg.status === 'FOUNDER_REVIEW_READY' && translationDecision === 'PENDING' ?
        <div className="site00-dw-v3-derivation-review__actions" data-testid="v3-translation-review-actions">
          <button
            type="button"
            data-testid="v3-approve-translation"
            disabled={!approvalGate.allowed}
            title={approvalGate.reason ?? undefined}
            onClick={onApprove}
          >
            APPROVE TRANSLATION
          </button>
          <input
            type="text"
            placeholder="Correction note (optional)"
            value={correctionNote}
            onChange={(e) => setCorrectionNote(e.target.value)}
            aria-label="Derivation correction note"
          />
          <button type="button" data-testid="v3-request-derivation-correction" onClick={onRequestCorrection}>
            REQUEST DERIVATION CORRECTION
          </button>
          {!approvalGate.allowed ?
            <p className="site00-dw-v3-authority__hint" data-testid="v3-translation-gate-blocked">
              Approval blocked: {approvalGate.reason}
            </p>
          : null}
        </div>
      : null}

      {analysis && 'imageWidthPx' in analysis ?
        <p className="site00-dw-v3-authority__hint">
          Measured {analysis.imageWidthPx}×{analysis.imageHeightPx}px
        </p>
      : null}

      <details className="site00-dw-v3-derivation-review__technical">
        <summary>Technical depth · scoped readiness checks</summary>
        <ul>
          {receipt?.checks.map((c) => (
            <li key={c.gate}>
              {c.gate}: {c.result} — {c.detail}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
