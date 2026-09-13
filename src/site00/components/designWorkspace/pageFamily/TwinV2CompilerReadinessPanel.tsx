import type { ConceptDirectedTwinSession } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import type { ConceptCandidate } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/types.js';

type Props = {
  session: ConceptDirectedTwinSession;
  candidate: ConceptCandidate;
};

function mark(ok: boolean | undefined): string {
  return ok ? '✓' : '—';
}

export function TwinV2CompilerReadinessPanel({ session, candidate }: Props) {
  const bundle = session.conceptGallery?.designCompilerBundles?.[candidate.conceptId];
  if (!bundle) return null;

  const r = bundle.compilerReadiness;
  const header = bundle.reviewVersionHeader;

  return (
    <section className="site00-twin-v2-compiler-readiness" aria-label="Compiler readiness">
      <h4 className="site00-twin-v2-compiler-readiness__title">COMPILER READINESS</h4>
      {header ? (
        <p className="site00-twin-v2-compiler-readiness__version">
          VERSION {header.conceptVersionId.slice(0, 24)} · CHECKSUM {header.bundleChecksum.slice(0, 12)}
          {header.stale ? ' · STALE REVIEW' : ''}
        </p>
      ) : null}
      <ul className="site00-twin-v2-compiler-readiness__list">
        <li>VISUAL SYNCHRONIZED {mark(r?.visualSync)}</li>
        <li>BLUEPRINT COVERAGE {mark(r?.blueprintCoverage)}</li>
        <li>TYPOGRAPHY {mark(r?.typographyCoverage)}</li>
        <li>ASSETS {mark(r?.assetCoverage)}</li>
        <li>FUNCTIONS {mark(r?.functionCoverage)}</li>
        <li>HOST OWNERSHIP {mark(r?.ownershipCoverage)}</li>
        <li>RESPONSIVE {mark(r?.responsiveCoverage)}</li>
        <li>STATES {mark(r?.stateCoverage)}</li>
        <li>NO AUTHORITY RASTER DEPENDENCY {mark(r?.rasterIndependence)}</li>
        <li>BUNDLE CHECKSUM {mark(r?.bundleChecksumValid)}</li>
      </ul>
      <p className="site00-twin-v2-compiler-readiness__status">
        STATUS: {r?.status ?? 'PENDING'}
        {r?.status === 'FAIL' && r.blockingReasons.length ? ` — ${r.blockingReasons.join(', ')}` : ''}
      </p>
      <p className="site00-twin-v2-compiler-readiness__mode">
        EXECUTION: {bundle.executionIntent} · APPROVAL: {bundle.acceptanceStatus}
      </p>
      <details className="site00-twin-v2-compiler-readiness__debug">
        <summary>DESIGN COMPILER (advanced)</summary>
        <pre className="site00-twin-v2-compiler-readiness__pre">
          {JSON.stringify(
            {
              irChain: Object.fromEntries(
                Object.entries(bundle.irChain).map(([k, v]) => [k, { irId: v.irId, checksum: v.checksum }]),
              ),
              lineageCount: bundle.objectLineage.length,
              relationships: bundle.visualRelationships.length,
            },
            null,
            2,
          )}
        </pre>
      </details>
    </section>
  );
}
