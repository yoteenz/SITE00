/**
 * P0.VR.DIAG.1R1 — Full-screen forensic breakdown overlays (mobile-safe, portaled above wizard drawer).
 */

import { createPortal } from 'react-dom';
import type {
  PageVisualDiagnosis,
  RegionForensicsSummary,
  TopVisualDifference,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageVisualDiagnosis.js';
import type { ReconstructionPlan } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/reconstructionPlan.js';

export function resolveAllRegionForensics(
  diagnosis: PageVisualDiagnosis | null | undefined,
): RegionForensicsSummary[] {
  if (!diagnosis) return [];
  if (diagnosis.allRegionForensics?.length) return diagnosis.allRegionForensics;
  return (diagnosis.topVisualDifferences ?? []).map((t) => ({
    regionId: t.evidenceId,
    regionName: t.regionName,
    status: 'ANALYZED',
    confidence: t.confidence,
    dimensionCount: 1,
    topDelta: t.delta,
    dimensions: [
      {
        dimension: t.metric,
        authority: t.authority,
        current: t.current,
        delta: t.delta,
        confidence: t.confidence,
      },
    ],
  }));
}

type AllForensicsProps = {
  open: boolean;
  diagnosis: PageVisualDiagnosis | null | undefined;
  onClose: () => void;
  onSelectRegion: (regionId: string) => void;
};

export function AllForensicsOverlay({ open, diagnosis, onClose, onSelectRegion }: AllForensicsProps) {
  if (!open || typeof document === 'undefined') return null;

  const regions = resolveAllRegionForensics(diagnosis);
  const coverage = diagnosis?.forensicCoverage;

  return createPortal(
    <div className="site00-pfw-forensic-overlay" role="presentation">
      <button type="button" className="site00-pfw-forensic-overlay__backdrop" aria-label="Close all forensics" onClick={onClose} />
      <aside className="site00-pfw-forensic-overlay__panel" role="dialog" aria-modal="true" aria-label="All forensics">
        <header className="site00-pfw-forensic-overlay__head">
          <strong>ALL FORENSICS</strong>
          <button type="button" className="site00-dw-wizard-drawer__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="site00-pfw-forensic-overlay__body">
          {coverage ? (
            <p className="site00-pfw-forensic-overlay__coverage">
              {coverage.majorAccounted} / {coverage.majorTotal} major regions · {coverage.measurementDepthPct}% multi-dimension
              depth · {coverage.gateStatus}: {coverage.gateReason}
            </p>
          ) : null}
          {regions.length === 0 ? (
            <p className="site00-pfw-forensic-overlay__empty">No region forensics available — recapture and reopen upgrade.</p>
          ) : (
            <ul className="site00-pfw-upgrade-v2__all-forensics">
              {regions.map((region) => (
                <li key={region.regionId}>
                  <strong>{region.regionName}</strong>
                  <span className={`site00-pfw-upgrade-v2__region-status is-${region.status.toLowerCase()}`}>
                    {region.status.replace(/_/g, ' ')}
                  </span>
                  <span>
                    {region.measurementDepthStatus ?? 'ANALYZED'} · {region.dimensionCount} dimensions · {region.confidence}
                  </span>
                  {region.missingDimensions?.length ? (
                    <span className="site00-pfw-forensic-overlay__missing">
                      MISSING: {region.missingDimensions.slice(0, 5).join(' · ')}
                    </span>
                  ) : null}
                  {region.topDelta ? <span className="site00-pfw-upgrade-v2__forensics-delta">{region.topDelta}</span> : null}
                  {region.dimensions?.length ? (
                    <ul className="site00-pfw-forensic-overlay__dim-preview">
                      {region.dimensions.slice(0, 4).map((d, idx) => (
                        <li key={`${region.regionId}-${d.dimension}-${idx}`}>
                          <span>{d.dimension}</span>
                          <span>{d.authority} → {d.current}</span>
                          <span>{d.delta}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <button
                    type="button"
                    className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact"
                    onClick={() => onSelectRegion(region.regionId)}
                  >
                    VIEW EVIDENCE
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
}

type EvidenceDetailProps = {
  open: boolean;
  evidenceId: string | null;
  regionId: string | null;
  diagnosis: PageVisualDiagnosis | null | undefined;
  plan: ReconstructionPlan | null | undefined;
  onClose: () => void;
};

function resolveTopMatch(
  diagnosis: PageVisualDiagnosis | null | undefined,
  evidenceId: string | null,
): TopVisualDifference | undefined {
  if (!evidenceId || !diagnosis?.topVisualDifferences) return undefined;
  return diagnosis.topVisualDifferences.find((d) => d.evidenceId === evidenceId);
}

export function ForensicEvidenceDetailOverlay({
  open,
  evidenceId,
  regionId,
  diagnosis,
  plan,
  onClose,
}: EvidenceDetailProps) {
  if (!open || typeof document === 'undefined') return null;
  if (!evidenceId && !regionId) return null;

  const regions = resolveAllRegionForensics(diagnosis);
  const regionSummary = regions.find((r) => r.regionId === regionId || r.regionId === evidenceId);
  const top = resolveTopMatch(diagnosis, evidenceId);
  const resolvedRegionId = regionId ?? regionSummary?.regionId ?? top?.evidenceId ?? evidenceId;

  const regionSpecs = plan
    ? plan.geometryChanges
        .concat(plan.spacingChanges, plan.componentChanges)
        .filter((c) =>
          resolvedRegionId ? c.regionId === resolvedRegionId : c.evidenceId === evidenceId,
        )
    : [];

  const item =
    regionSpecs[0] ??
    plan?.geometryChanges
      .concat(plan.spacingChanges, plan.componentChanges)
      .find((c) => c.evidenceId === evidenceId);

  const dimensionRows =
    regionSummary?.dimensions ??
    (top
      ? [
          {
            dimension: top.metric,
            authority: top.authority,
            current: top.current,
            delta: top.delta,
            confidence: top.confidence,
          },
        ]
      : []);

  const title =
    item?.regionName ?? regionSummary?.regionName ?? top?.regionName ?? evidenceId ?? regionId ?? 'EVIDENCE';

  return createPortal(
    <div className="site00-pfw-forensic-overlay" role="presentation">
      <button type="button" className="site00-pfw-forensic-overlay__backdrop" aria-label="Close evidence" onClick={onClose} />
      <aside className="site00-pfw-forensic-overlay__panel" role="dialog" aria-modal="true" aria-label="Forensic evidence">
        <header className="site00-pfw-forensic-overlay__head">
          <strong>EVIDENCE — {title}</strong>
          <button type="button" className="site00-dw-wizard-drawer__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="site00-pfw-forensic-overlay__body">
          {regionSummary ? (
            <p className="site00-pfw-upgrade-v2__evidence-status">
              {regionSummary.status.replace(/_/g, ' ')} · {regionSummary.measurementDepthStatus ?? 'MEASURED'} ·{' '}
              {regionSummary.dimensionCount} dimensions · {regionSummary.confidence}
            </p>
          ) : null}
          {regionSummary?.missingDimensions?.length ? (
            <p className="site00-pfw-forensic-overlay__missing">
              MISSING EVIDENCE: {regionSummary.missingDimensions.join(' · ')}
            </p>
          ) : null}
          {(regionSummary?.disqualifiedDimensionCount ?? 0) > 0 ? (
            <p className="site00-pfw-forensic-overlay__missing">
              NOT COUNTED: {regionSummary!.disqualifiedDimensionCount} dimension(s) — see profile / unit rules
            </p>
          ) : null}

          {dimensionRows.length > 0 ? (
            <ul className="site00-pfw-forensic-overlay__dimensions">
              {dimensionRows.map((d, idx) => (
                <li key={`${d.dimension}-${idx}`}>
                  <strong>{d.dimension}</strong>
                  <dl>
                    <div>
                      <dt>AUTHORITY</dt>
                      <dd>{d.authority}</dd>
                    </div>
                    <div>
                      <dt>CURRENT</dt>
                      <dd>{d.current}</dd>
                    </div>
                    <div>
                      <dt>DELTA</dt>
                      <dd>{d.delta}</dd>
                    </div>
                    <div>
                      <dt>CONFIDENCE</dt>
                      <dd>{d.confidence}</dd>
                    </div>
                    {d.authoritySource || d.currentSource ? (
                      <div className="site00-pfw-forensic-overlay__sources">
                        <dt>SOURCE</dt>
                        <dd>
                          AUTH {d.authoritySource ?? '—'} · CUR {d.currentSource ?? '—'}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </li>
              ))}
            </ul>
          ) : (
            <dl className="site00-pfw-forensic-overlay__summary-dl">
              <div>
                <dt>AUTHORITY</dt>
                <dd>{item?.authorityValue ?? top?.authority ?? '—'}</dd>
              </div>
              <div>
                <dt>CURRENT</dt>
                <dd>{item?.currentValue ?? top?.current ?? '—'}</dd>
              </div>
              <div>
                <dt>DELTA</dt>
                <dd>{item?.delta ?? top?.delta ?? '—'}</dd>
              </div>
              <div>
                <dt>CORRECTION</dt>
                <dd>{item?.correction ?? top?.correction ?? '—'}</dd>
              </div>
              <div>
                <dt>CONFIDENCE</dt>
                <dd>{item?.confidence ?? top?.confidence ?? '—'}</dd>
              </div>
              <div>
                <dt>FUNCTIONAL RISK</dt>
                <dd>{item?.functionalRisk ?? 'LOW'}</dd>
              </div>
            </dl>
          )}

          {regionSpecs.length > 1 ? (
            <section>
              <h4>RECONSTRUCTION TARGETS</h4>
              <ul className="site00-pfw-upgrade-v2__evidence-dimensions">
                {regionSpecs.map((spec) => (
                  <li key={spec.id}>
                    <strong>{spec.authorityValue?.split(':')[0] ?? spec.label}</strong>
                    <span>
                      {spec.authorityValue?.split(':').slice(1).join(':').trim() ?? spec.authorityValue} →{' '}
                      {spec.currentValue?.split(':').slice(1).join(':').trim() ?? spec.currentValue}
                    </span>
                    <span className="site00-pfw-upgrade-v2__forensics-delta">{spec.delta}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
