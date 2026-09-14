import { useMemo, useState } from 'react';
import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import { P0_VR_TWIN_V30R7MF3P7_LINEAGE } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { hydrateMobileTwinPackageInspector } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/hydrateMobileTwinPackageInspector.js';
import {
  requestMobileTwinPackageCorrection,
  type MobileTwinPackageCorrectionReason,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/requestMobileTwinPackageCorrection.js';
import { canApproveMobileTwinPackage } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/approveMobileTwinPackage.js';
import { approveAndPersistMobileTwinPackage } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/requestMobileTwinImplementation.js';
import { shouldShowBuildTwinDesignRoute } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/shouldShowBuildTwinDesignRoute.js';
import { DesignPageV3MobileTwinBuildRouteBlock } from './DesignPageV3MobileTwinBuildRouteBlock.js';
import { PACKAGE_ARTIFACT_MISSING } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinPackageIntegrityReceipt.js';

type Props = {
  session: DesignPageAuthorityReviewSession;
  projectId: string;
  onSessionUpdate: (session: DesignPageAuthorityReviewSession) => void;
  onFullscreen: (label: string, src: string) => void;
};

function resolveImageSrc(uri: string): string {
  if (uri.startsWith('data:') || uri.startsWith('blob:') || uri.startsWith('vitest-fal://')) return uri;
  if (uri.startsWith('http')) return uri;
  return `${window.location.origin}${uri.startsWith('/') ? uri : `/${uri}`}`;
}

export function DesignPageV3MobileTwinPackageInspector({ session, projectId, onSessionUpdate, onFullscreen }: Props) {
  const pipeline = session.mobileTwinPipeline;
  const view = useMemo(
    () => (pipeline ? hydrateMobileTwinPackageInspector(pipeline, projectId) : null),
    [pipeline, projectId],
  );
  const [objectFilter, setObjectFilter] = useState('');
  const [correctionReason, setCorrectionReason] = useState<MobileTwinPackageCorrectionReason>('OTHER');
  const [correctionNote, setCorrectionNote] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  if (!view) return null;

  const filteredObjects = (view.objectMap?.objects ?? []).filter((o) => {
    if (!objectFilter.trim()) return true;
    const q = objectFilter.toLowerCase();
    return (
      o.objectId.toLowerCase().includes(q) ||
      o.featureId?.toLowerCase().includes(q) ||
      o.functionTarget?.toLowerCase().includes(q)
    );
  });

  const submitCorrection = () => {
    setMsg(null);
    try {
      onSessionUpdate(requestMobileTwinPackageCorrection(session, { reason: correctionReason, note: correctionNote }));
      setMsg('Correction request recorded — no automatic regeneration.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  const approve = () => {
    setMsg(null);
    try {
      void approveAndPersistMobileTwinPackage({ session }).then((next) => {
        onSessionUpdate(next);
        setMsg('MOBILE TWIN PACKAGE APPROVED');
      });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="site00-dw-v3-mobile-twin-package-inspector" data-testid="v3-mobile-twin-package-inspector" data-lineage={P0_VR_TWIN_V30R7MF3P7_LINEAGE}>
      <header className="site00-dw-v3-mobile-twin-package-inspector__header">
        <strong>MOBILE TWIN PACKAGE INSPECTOR</strong>
        <span>{P0_VR_TWIN_V30R7MF3P7_LINEAGE.replace('P0.VR.', '')}</span>
      </header>

      <section className="site00-dw-v3-mobile-twin-package-inspector__summary" data-testid="v3-package-inspector-summary">
        <h3>MOBILE TWIN PACKAGE</h3>
        <ul>
          <li>STATUS · {view.summary.status}</li>
          <li>PROJECT · {view.summary.projectId.toUpperCase()}</li>
          <li>VIEWPORT · {view.summary.viewport}</li>
          <li>METHOD · {view.summary.method}</li>
          <li>ACTUAL PROVIDER · {view.summary.actualProvider}</li>
          <li>BLUEPRINT PROVIDER · {view.summary.blueprintProvider}</li>
          <li>BLUEPRINT STYLE · {view.summary.blueprintStyle}</li>
          <li>COMPOSITION · {view.summary.compositionStatus}</li>
          <li>PACKAGE ID · {view.summary.packageId}</li>
          <li>PACKAGE CHECKSUM · {view.summary.packageChecksum}</li>
        </ul>
      </section>

      {view.missingArtifacts.length ?
        <p className="site00-dw-v3-authority__error" data-testid="v3-package-artifact-missing" role="alert">
          {PACKAGE_ARTIFACT_MISSING}:{' '}
          {view.missingArtifacts.map((m) => `${m.label} (${m.artifactId})`).join(' · ')}
        </p>
      : null}

      <details open className="site00-dw-v3-mobile-twin-package-inspector__section" data-testid="v3-package-visual-twin">
        <summary>VISUAL TWIN</summary>
        <div className="site00-dw-v3-mobile-twin-package-inspector__cards">
          {(['REFERENCE', 'ACTUAL PAGE', 'BLUEPRINT TWIN'] as const).map((label) => {
            const ref = view.visualTwin.reference;
            const actual = view.visualTwin.actual;
            const bp = view.visualTwin.blueprint;
            const src =
              label === 'REFERENCE' ? ref?.sourceImageUri
              : label === 'ACTUAL PAGE' ? actual?.renderImageUri
              : bp?.twinImageUri;
            return (
              <article key={label} className="site00-dw-v3-mobile-twin-package-inspector__card">
                <h4>{label}</h4>
                {src ?
                  <>
                    <button type="button" onClick={() => onFullscreen(label, resolveImageSrc(src))}>
                      VIEW FULLSCREEN
                    </button>
                    <img src={resolveImageSrc(src)} alt={label} loading="lazy" />
                  </>
                : <p>Not available</p>}
              </article>
            );
          })}
        </div>
      </details>

      <details className="site00-dw-v3-mobile-twin-package-inspector__section" data-testid="v3-package-composition">
        <summary>COMPOSITION STATE</summary>
        {view.compositionStats ?
          <ul>
            <li>compositionStateId · {view.composition?.id}</li>
            <li>
              compositionHash ·{' '}
              {view.composition?.compositionHash ? `${view.composition.compositionHash.slice(0, 16)}…` : '—'}
            </li>
            <li>status · {view.composition?.status}</li>
            <li>regions · {view.compositionStats.regionCount}</li>
            <li>objects · {view.compositionStats.objectCount}</li>
            <li>feature bindings · {view.compositionStats.featureBindingCount}</li>
            <li>relationships · {view.compositionStats.relationshipCount}</li>
            <li>asset slots · {view.compositionStats.assetSlotCount}</li>
            <li>interactions · {view.compositionStats.interactionCount}</li>
          </ul>
        : <p>Composition not hydrated</p>}
      </details>

      <details className="site00-dw-v3-mobile-twin-package-inspector__section" data-testid="v3-package-surgical-blueprint">
        <summary>SURGICAL BLUEPRINT</summary>
        {view.surgicalBlueprint ?
          <ul>
            <li>id · {view.surgicalBlueprint.id}</li>
            <li>source · MobileTwinCompositionState</li>
            <li>objects · {view.surgicalBlueprint.objects.length}</li>
            <li>geometry mode · composition-normalized</li>
            <li>status · FROZEN</li>
          </ul>
        : <p>Missing surgical blueprint artifact</p>}
      </details>

      <details className="site00-dw-v3-mobile-twin-package-inspector__section" data-testid="v3-package-object-map">
        <summary>OBJECT MAP</summary>
        <input
          type="search"
          placeholder="Search objects…"
          value={objectFilter}
          onChange={(e) => setObjectFilter(e.target.value)}
          data-testid="v3-package-object-search"
        />
        <ul className="site00-dw-v3-mobile-twin-package-inspector__list">
          {filteredObjects.slice(0, 40).map((o) => (
            <li key={o.objectId}>
              {o.objectId} · {o.objectType} · {o.featureId ?? '—'} · {o.functionTarget ?? '—'} · {o.ownership} ·{' '}
              {o.implementationPrimitive}
            </li>
          ))}
        </ul>
      </details>

      <details className="site00-dw-v3-mobile-twin-package-inspector__section" data-testid="v3-package-asset-manifest">
        <summary>ASSET MANIFEST</summary>
        {Object.entries(view.assetManifestGrouped).map(([status, rows]) => (
          <div key={status}>
            <strong>{status}</strong> ({rows.length})
            <ul>
              {rows.slice(0, 12).map((a) => (
                <li key={`${status}-${a.assetId}`}>
                  {a.assetId} · {a.objectId} · {a.resolution}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </details>

      <details className="site00-dw-v3-mobile-twin-package-inspector__section" data-testid="v3-package-function-map">
        <summary>FUNCTION MAP</summary>
        <ul>
          {(view.functionMap?.bindings ?? []).slice(0, 30).map((b) => (
            <li key={b.objectId} className={b.status === 'MISSING' || b.status === 'PARTIAL' ? 'is-warn' : undefined}>
              {b.objectId} · {b.functionTarget} · {b.status}
            </li>
          ))}
        </ul>
      </details>

      <details className="site00-dw-v3-mobile-twin-package-inspector__section" data-testid="v3-package-ownership">
        <summary>HOST / PROJECT OWNERSHIP</summary>
        {Object.entries(view.ownershipGrouped).map(([group, rows]) => (
          <div key={group}>
            <strong>{group}</strong> ({rows.length})
          </div>
        ))}
      </details>

      <details className="site00-dw-v3-mobile-twin-package-inspector__section" data-testid="v3-package-primitives">
        <summary>IMPLEMENTATION PRIMITIVES</summary>
        <ul>
          {Object.entries(view.primitiveCounts).map(([k, v]) => (
            <li key={k}>
              {k}: {v}
            </li>
          ))}
        </ul>
        <p>Forbidden raster primitives violations: {view.forbiddenPrimitiveViolations.length}</p>
      </details>

      <details className="site00-dw-v3-mobile-twin-package-inspector__section" data-testid="v3-package-traceability">
        <summary>TRACEABILITY</summary>
        <ul>
          {(view.traceability?.traces ?? []).slice(0, 25).map((t, i) => (
            <li key={`${t.featureId}-${t.objectId}-${i}`}>
              {t.featureId} → {t.objectId} → {t.primitive} → {t.functionTarget ?? '—'}
            </li>
          ))}
        </ul>
      </details>

      <details className="site00-dw-v3-mobile-twin-package-inspector__section" data-testid="v3-package-validation">
        <summary>VALIDATION</summary>
        <ul>
          <li>Reference fidelity · {view.validation.referenceFidelity?.result ?? '—'}</li>
          <li>Twin visual composition · {view.validation.twinVisual?.result ?? '—'}</li>
          <li>Reconciliation · {view.validation.reconciliation?.result ?? '—'}</li>
          <li>Blueprint style · {view.validation.blueprintStyle?.result ?? '—'}</li>
          <li>Provider lock · {view.validation.providerLock ? 'LOCKED' : '—'}</li>
        </ul>
      </details>

      <details className="site00-dw-v3-mobile-twin-package-inspector__section" data-testid="v3-package-provider-lineage">
        <summary>PROVIDER LINEAGE</summary>
        {view.providerLineage ?
          <ul>
            <li>
              ACTUAL · {view.providerLineage.actual.provider} · {view.providerLineage.actual.model} ·{' '}
              {(view.providerLineage.actual.jobId ?? '').slice(-20)} · ${view.providerLineage.actual.costUsd.toFixed(2)}
            </li>
            <li>
              BLUEPRINT · {view.providerLineage.blueprint.provider} · {view.providerLineage.blueprint.styleContract} ·{' '}
              {(view.providerLineage.blueprint.jobId ?? '').slice(-20)}
            </li>
          </ul>
        : null}
      </details>

      <section data-testid="v3-package-gaps">
        <h4>GAPS &amp; BLOCKERS</h4>
        {view.gaps.length === 0 ?
          <p>NO CRITICAL PACKAGE GAPS</p>
        : <ul>{view.gaps.map((g, i) => <li key={i}>{g.severity}: {g.message}</li>)}</ul>}
      </section>

      <section data-testid="v3-package-approval-readiness">
        <h4>FOUNDER APPROVAL READINESS</h4>
        <ul>
          {view.approvalReadiness.map((r) => (
            <li key={r.label}>
              {r.label}: {r.status}
            </li>
          ))}
        </ul>
        <p>{view.readyToApprove ? 'READY TO APPROVE' : 'REVIEW REQUIRED'}</p>
      </section>

      {canApproveMobileTwinPackage(session) ?
        <button type="button" data-testid="v3-approve-mobile-twin-package-inspector" onClick={approve}>
          APPROVE MOBILE TWIN PACKAGE
        </button>
      : null}

      {shouldShowBuildTwinDesignRoute(session) ?
        <DesignPageV3MobileTwinBuildRouteBlock
          session={session}
          embedded
          buildTestId="v3-build-twin-design-route-inspector"
        />
      : null}

      <div className="site00-dw-v3-mobile-twin-package-inspector__correction" data-testid="v3-request-package-correction">
        <label>
          REQUEST PACKAGE CORRECTION
          <select value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value as MobileTwinPackageCorrectionReason)}>
            <option value="VISUAL_TWIN_ISSUE">VISUAL TWIN ISSUE</option>
            <option value="BLUEPRINT_ISSUE">BLUEPRINT ISSUE</option>
            <option value="OBJECT_MAP_ISSUE">OBJECT MAP ISSUE</option>
            <option value="ASSET_ISSUE">ASSET ISSUE</option>
            <option value="FUNCTION_ISSUE">FUNCTION ISSUE</option>
            <option value="OWNERSHIP_ISSUE">OWNERSHIP ISSUE</option>
            <option value="TRACEABILITY_ISSUE">TRACEABILITY ISSUE</option>
            <option value="OTHER">OTHER</option>
          </select>
        </label>
        <textarea value={correctionNote} onChange={(e) => setCorrectionNote(e.target.value)} placeholder="Optional note" rows={2} />
        <button type="button" onClick={submitCorrection}>
          SUBMIT CORRECTION REQUEST
        </button>
      </div>

      <details className="site00-dw-v3-mobile-twin-package-inspector__technical" data-testid="v3-package-technical-details">
        <summary>TECHNICAL DETAILS · VIEW RAW</summary>
        {view.integrity ?
          <p data-testid="v3-package-integrity-receipt">
            Integrity · {view.integrity.result} · missing {view.integrity.missingArtifactIds.length}
          </p>
        : null}
        <pre>{JSON.stringify(view.package, null, 2)}</pre>
      </details>

      {msg ?
        <p className="site00-dw-v3-authority__hint" role="status">
          {msg}
        </p>
      : null}
    </div>
  );
}
