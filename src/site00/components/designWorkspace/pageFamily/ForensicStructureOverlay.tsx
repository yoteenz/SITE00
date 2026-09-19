/**
 * P0.VR.DIAG.1R5A / 1R5B — Full-screen / mobile-safe internal structure inspector.
 */

import { createPortal } from 'react-dom';
import type { RegionForensicsSummary } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageVisualDiagnosis.js';
import { formatAnchorLine } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1R5/structureUiModel.js';
import { founderMessageForFailureCode } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1R5/founderStructureCopy.js';

type Props = {
  open: boolean;
  region: RegionForensicsSummary | null;
  onClose: () => void;
  onAnalyzeStructure?: (regionId: string) => void;
};

export function ForensicStructureOverlay({ open, region, onClose, onAnalyzeStructure }: Props) {
  if (!open || !region || typeof document === 'undefined') return null;

  const view = region.structureView;
  const trace = region.structureToDepthTrace;
  const status = region.internalStructureStatus ?? view?.structureStatus ?? 'UNRESOLVED';
  const zero = region.zeroAnchorDiagnosis;
  const side = region.anchorSideSummary;
  const failureCode = region.structureFailureCode ?? view?.failureCode ?? zero?.failureCode;
  const founderCopy = failureCode
    ? founderMessageForFailureCode(failureCode as import('../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1R5/types.js').EvidenceRecoveryFailureCode, region.regionName)
    : null;

  const nonContainerCurrent =
    view?.currentLines?.length ??
    region.internalStructureHierarchy?.filter((h) => !h.includes('CONTAINER')).length ??
    0;
  const hasStructureData = Boolean(view?.currentLines?.length || region.internalStructureHierarchy?.length);
  const showNotAnalyzed = !hasStructureData || status === 'UNRESOLVED';

  return createPortal(
    <div className="site00-pfw-forensic-overlay site00-pfw-forensic-overlay--structure" role="presentation">
      <button type="button" className="site00-pfw-forensic-overlay__backdrop" aria-label="Close structure" onClick={onClose} />
      <aside
        className="site00-pfw-forensic-overlay__panel site00-pfw-forensic-overlay__panel--sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Region internal structure"
      >
        <header className="site00-pfw-forensic-overlay__head">
          <strong>STRUCTURE — {region.regionName}</strong>
          <button type="button" className="site00-dw-wizard-drawer__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="site00-pfw-forensic-overlay__body">
          <p className="site00-pfw-upgrade-v2__evidence-status">
            STRUCTURE: {status.replace(/_/g, ' ')} · {region.measurementDepthStatus ?? 'UNMEASURED'} ·{' '}
            {region.dimensionCount} valid dimensions
          </p>
          {view ? (
            <p className="site00-pfw-forensic-overlay__structure-meta">
              FORENSICS ENGINE: {view.forensicsEngine} · STRUCTURE UI: {view.structureUiVersion}
            </p>
          ) : null}

          {side ? (
            <section className="site00-pfw-structure-side">
              <h4>CURRENT VS AUTHORITY</h4>
              <p>
                CURRENT: {side.current} — {side.currentDetail}
              </p>
              <p>
                AUTHORITY: {side.authority} — {side.authorityDetail}
              </p>
              {side.failureCode ? (
                <p className="site00-pfw-forensic-overlay__missing">FAILURE: {side.failureCode.replace(/_/g, ' ')}</p>
              ) : null}
            </section>
          ) : null}

          {founderCopy ? (
            <p className="site00-pfw-forensic-overlay__structure-founder">{founderCopy.headline}</p>
          ) : null}
          {failureCode ? (
            <p className="site00-pfw-forensic-overlay__missing site00-pfw-forensic-overlay__structure-detail">
              DETAILS: {failureCode.replace(/_/g, ' ')}
              {region.structureFailureDetail || view?.failureDetail ? ` — ${region.structureFailureDetail ?? view?.failureDetail}` : ''}
            </p>
          ) : null}

          {zero ? (
            <section className="site00-pfw-structure-zero">
              <h4>ZERO ANCHOR DIAGNOSIS</h4>
              <p>{zero.founderSummary}</p>
              <ul className="site00-pfw-structure-side__list">
                <li>NO INTERNAL ANCHORS RESOLVED (non-container count: 0)</li>
                <li>Child candidates: {zero.childCandidateCount} accepted · {zero.childCandidatesRejected} rejected</li>
                {zero.rejectionReasons.length ? <li>Rejected: {zero.rejectionReasons.join(' · ')}</li> : null}
                <li>Expected: {zero.expectedAnchorTypes.join(' · ')}</li>
                {zero.metricSubtype ? <li>Metric subtype: {zero.metricSubtype}</li> : null}
                {zero.metricSubtypeCandidates?.length ? (
                  <li>Confirm type: {zero.metricSubtypeCandidates.join(' vs ')}</li>
                ) : null}
              </ul>
            </section>
          ) : nonContainerCurrent === 0 && !showNotAnalyzed ? (
            <p className="site00-pfw-forensic-overlay__empty">NO INTERNAL ANCHORS RESOLVED</p>
          ) : null}

          {showNotAnalyzed ? (
            <p className="site00-pfw-forensic-overlay__empty">STRUCTURE NOT ANALYZED</p>
          ) : null}

          {view?.currentLines?.length ? (
            <section className="site00-pfw-structure-side">
              <h4>CURRENT ANCHORS</h4>
              <ul className="site00-pfw-structure-side__list">
                {view.currentLines.map((line) => (
                  <li key={`cur-${line.anchorKey}`}>
                    {formatAnchorLine(line, 'current')} · {line.anchorType}
                  </li>
                ))}
              </ul>
            </section>
          ) : region.internalStructureHierarchy?.length ? (
            <pre className="site00-pfw-forensic-overlay__structure-tree">{region.internalStructureHierarchy.join('\n')}</pre>
          ) : null}

          {view?.authorityLines?.length ? (
            <section className="site00-pfw-structure-side">
              <h4>AUTHORITY ANCHORS</h4>
              <ul className="site00-pfw-structure-side__list">
                {view.authorityLines.map((line) => (
                  <li key={`auth-${line.anchorKey}`}>
                    {formatAnchorLine(line, 'authority')} · {line.anchorType}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {view?.relationshipsSummary?.length ? (
            <section>
              <h4>RELATIONSHIPS</h4>
              <ul className="site00-pfw-structure-side__list">
                {view.relationshipsSummary.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {trace ? (
            <section className="site00-pfw-structure-trace">
              <h4>DEPTH TRACE</h4>
              <p>
                {trace.resolvedAnchors.length} anchors · {trace.generatedMeasurements.length} measurements generated ·{' '}
                {trace.qualifiedDimensions.length} qualified · {trace.depthBefore} → {trace.depthAfter}
              </p>
              {trace.blockingReason ? <p className="site00-pfw-forensic-overlay__missing">{trace.blockingReason}</p> : null}
            </section>
          ) : null}

          {(region.showAnalyzeStructure !== false && (showNotAnalyzed || zero || status === 'PARTIAL' || status === 'AMBIGUOUS')) &&
          onAnalyzeStructure ? (
            <button
              type="button"
              className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-v3-btn--compact"
              onClick={() => onAnalyzeStructure(region.regionId)}
            >
              ANALYZE STRUCTURE
            </button>
          ) : null}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
