import { useMemo, useState } from 'react';
import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import {
  FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER,
  FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER,
  P0_VR_TWIN_V30R6F1_LINEAGE,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import type {
  AuthorityVisualCoverageReceipt,
  PixelGroundedAuthorityAnalysis,
  PixelMeasuredObject,
  WeightedAuthorityCoverageReceipt,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/pixelGroundedTypes.js';
import type {
  CompilerReadinessReceipt,
  CompletedMasterFeatureBinding,
  DesignWorkspaceImplementationPackage,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/types.js';
import {
  approveTranslationReview,
  requestDerivationCorrection,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/translationReview.js';
import { resolveDesignPageAuthorityImageSrc } from './designPageAuthorityR3PrototypeUrls.js';

type ReviewMode = 'AUTHORITY' | 'OBJECTS' | 'RELATIONSHIPS' | 'FEATURES' | 'ASSETS' | 'GAPS' | 'TYPOGRAPHY';

type Props = {
  session: DesignPageAuthorityReviewSession;
  onSessionUpdate: (session: DesignPageAuthorityReviewSession) => void;
};

export function DesignPageV3DerivationReviewPanel({ session, onSessionUpdate }: Props) {
  const derivation = session.designWorkspaceDerivation;
  const pkgId = derivation?.latestPackageId;
  const [viewport, setViewport] = useState<'MOBILE' | 'DESKTOP'>('MOBILE');
  const [mode, setMode] = useState<ReviewMode>('AUTHORITY');
  const [showOverlay, setShowOverlay] = useState(true);
  const [showObjectIds, setShowObjectIds] = useState(false);
  const [correctionNote, setCorrectionNote] = useState('');

  const pkg = useMemo(
    () => derivation?.packages.find((p) => p.id === pkgId) as DesignWorkspaceImplementationPackage | undefined,
    [derivation?.packages, pkgId],
  );

  if (!pkgId || !pkg) return null;

  const objectMap = derivation?.artifactsById[pkg.surgicalObjectMapId] as
    | { objects: PixelMeasuredObject[]; relationships: { id: string; type: string }[] }
    | undefined;
  const receipt = derivation?.artifactsById[pkg.compilerReadinessReceiptId] as CompilerReadinessReceipt | undefined;
  const mobileAnalysis = pkg.pixelGroundedAnalysisMobileId ?
    (derivation?.artifactsById[pkg.pixelGroundedAnalysisMobileId] as PixelGroundedAuthorityAnalysis | undefined)
  : undefined;
  const desktopAnalysis = pkg.pixelGroundedAnalysisDesktopId ?
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

  const mobileObjects = objectMap?.objects.filter((o) => o.viewport === 'MOBILE').length ?? 0;
  const desktopObjects = objectMap?.objects.filter((o) => o.viewport === 'DESKTOP').length ?? 0;

  const analysis = viewport === 'MOBILE' ? mobileAnalysis : desktopAnalysis;
  const coverage = viewport === 'MOBILE' ? mobileCoverage : desktopCoverage;
  const weighted = viewport === 'MOBILE' ? mobileWeighted : desktopWeighted;
  const authoritySrc =
    viewport === 'MOBILE' ?
      resolveDesignPageAuthorityImageSrc(FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.publicPath)
    : resolveDesignPageAuthorityImageSrc(FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER.publicPath);

  const viewportObjects =
    objectMap?.objects.filter((o) => o.viewport === viewport && (mode === 'OBJECTS' || mode === 'AUTHORITY')) ?? [];

  const featureBindings = pkg.masterFeatureBindingIds
    .map((id) => derivation?.artifactsById[id] as CompletedMasterFeatureBinding | undefined)
    .filter(Boolean) as CompletedMasterFeatureBinding[];

  const translationDecision = derivation?.translationReview?.founderDecision ?? 'PENDING';

  const onApprove = () => {
    onSessionUpdate(approveTranslationReview(session, 'Founder approved pixel-grounded translation'));
  };

  const onRequestCorrection = () => {
    const notes = correctionNote.trim() ? [correctionNote.trim()] : ['OBJECT MISSED'];
    onSessionUpdate(requestDerivationCorrection(session, notes));
    setCorrectionNote('');
  };

  return (
    <section
      className="site00-dw-v3-derivation-review"
      aria-label="Derivation package review"
      data-testid="v3-derivation-review-panel"
      data-lineage={P0_VR_TWIN_V30R6F1_LINEAGE}
    >
      <header className="site00-dw-v3-derivation-review__head">
        <strong>TRANSLATION REVIEW · {pkg.status.replace(/_/g, ' ')}</strong>
        <span>Algorithm {pkg.derivationAlgorithm ?? 'R6'} · checksum {pkg.packageChecksum.slice(0, 12)}…</span>
      </header>
      <p className="site00-dw-v3-authority__hint">
        Did SITE 00 see the page you approved? Toggle layers — overlays are review-only, not runtime UI.
      </p>

      <div className="site00-dw-v3-derivation-review__modes" role="tablist" aria-label="Review mode">
        {(['AUTHORITY', 'OBJECTS', 'FEATURES', 'GAPS'] as ReviewMode[]).map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'is-active' : undefined}
            data-testid={`v3-derivation-mode-${m.toLowerCase()}`}
            onClick={() => setMode(m)}
          >
            {m}
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
      </div>

      {(mode === 'AUTHORITY' || mode === 'OBJECTS') && (
        <div className="site00-dw-v3-derivation-review__authority-stage" data-testid="v3-derivation-authority-stage">
          <img src={authoritySrc} alt={`${viewport} locked founder authority`} className="site00-dw-v3-derivation-review__authority-img" />
          {showOverlay ?
            <div className="site00-dw-v3-derivation-review__overlay" aria-hidden>
              {viewportObjects.map((o) => (
                <div
                  key={o.objectId}
                  className="site00-dw-v3-derivation-review__overlay-box"
                  style={{
                    left: `${o.normalizedX * 100}%`,
                    top: `${o.normalizedY * 100}%`,
                    width: `${o.normalizedWidth * 100}%`,
                    height: `${o.normalizedHeight * 100}%`,
                  }}
                  title={o.objectId}
                  data-importance={o.visualImportance}
                >
                  {showObjectIds ?
                    <span className="site00-dw-v3-derivation-review__overlay-label">{o.objectId.replace(`${viewport.toLowerCase()}-`, '')}</span>
                  : null}
                </div>
              ))}
            </div>
          : null}
        </div>
      )}

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
          Translation gaps preserved when confidence is low — no invented replacements. Asset identity gaps remain
          separate from authority raster (forbidden at runtime).
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
          <strong>VISUAL COVERAGE ({viewport})</strong>
          <p>
            {coverage?.coveragePercent.toFixed(1) ?? '—'}% raw · critical{' '}
            {weighted?.criticalCoveragePercent.toFixed(0) ?? '—'}% · high {weighted?.highCoveragePercent.toFixed(0) ?? '—'}%
          </p>
        </div>
        <div>
          <strong>COMPILER READINESS</strong>
          <p>{receipt?.overall ?? 'UNKNOWN'}</p>
        </div>
        <div>
          <strong>TRANSLATION REVIEW</strong>
          <p data-testid="v3-translation-decision">{translationDecision.replace(/_/g, ' ')}</p>
        </div>
      </div>

      {pkg.status === 'FOUNDER_REVIEW_READY' && translationDecision === 'PENDING' ?
        <div className="site00-dw-v3-derivation-review__actions" data-testid="v3-translation-review-actions">
          <button type="button" data-testid="v3-approve-translation" onClick={onApprove}>
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
        </div>
      : null}

      {analysis ?
        <p className="site00-dw-v3-authority__hint">
          Measured {analysis.imageWidthPx}×{analysis.imageHeightPx}px · hash {analysis.authorityImageHash.slice(0, 20)}…
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
