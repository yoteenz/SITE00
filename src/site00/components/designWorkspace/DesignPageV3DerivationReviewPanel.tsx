import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import type {
  CompilerReadinessReceipt,
  DesignWorkspaceImplementationPackage,
  DesignWorkspaceStructuralBlueprint,
  SurgicalObjectMap,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceDerivation/types.js';

type Props = {
  session: DesignPageAuthorityReviewSession;
};

export function DesignPageV3DerivationReviewPanel({ session }: Props) {
  const derivation = session.designWorkspaceDerivation;
  const pkgId = derivation?.latestPackageId;
  if (!pkgId) return null;
  const pkg = derivation?.packages.find((p) => p.id === pkgId) as DesignWorkspaceImplementationPackage | undefined;
  if (!pkg) return null;

  const blueprint = derivation?.artifactsById[pkg.structuralBlueprintId] as DesignWorkspaceStructuralBlueprint | undefined;
  const objectMap = derivation?.artifactsById[pkg.surgicalObjectMapId] as SurgicalObjectMap | undefined;
  const receipt = derivation?.artifactsById[pkg.compilerReadinessReceiptId] as CompilerReadinessReceipt | undefined;

  const mobileObjects = objectMap?.objects.filter((o) => o.viewport === 'MOBILE').length ?? 0;
  const desktopObjects = objectMap?.objects.filter((o) => o.viewport === 'DESKTOP').length ?? 0;
  const mobileRegions = blueprint?.regions.filter((r) => r.viewport === 'MOBILE').length ?? 0;
  const desktopRegions = blueprint?.regions.filter((r) => r.viewport === 'DESKTOP').length ?? 0;

  return (
    <section
      className="site00-dw-v3-derivation-review"
      aria-label="Derivation package review"
      data-testid="v3-derivation-review-panel"
    >
      <header className="site00-dw-v3-derivation-review__head">
        <strong>DERIVATION PACKAGE · {pkg.status.replace(/_/g, ' ')}</strong>
        <span>Checksum {pkg.packageChecksum.slice(0, 12)}…</span>
      </header>
      <p className="site00-dw-v3-authority__hint">
        Visual-first summary — did translation match your locked masters? Raw structured data stays in technical
        inspector (desktop drawer / mobile sheet later).
      </p>
      <div className="site00-dw-v3-derivation-review__grid">
        <div data-testid="v3-derivation-blueprint-summary">
          <strong>STRUCTURAL BLUEPRINT</strong>
          <p>
            Mobile {mobileRegions} regions · Desktop {desktopRegions} regions
          </p>
        </div>
        <div data-testid="v3-derivation-object-map-summary">
          <strong>SURGICAL OBJECT MAP</strong>
          <p>
            {mobileObjects} mobile objects · {desktopObjects} desktop objects ·{' '}
            {objectMap?.relationships.length ?? 0} relationships
          </p>
        </div>
        <div>
          <strong>FEATURE BINDINGS</strong>
          <p>{pkg.masterFeatureBindingIds.length} required features mapped</p>
        </div>
        <div>
          <strong>COMPILER READINESS</strong>
          <p>{receipt?.overall ?? 'UNKNOWN'}</p>
        </div>
      </div>
      {receipt?.blockers.length ?
        <p className="site00-dw-v3-authority__hint" data-testid="v3-derivation-blockers">
          Blockers: {receipt.blockers.join(', ')}
        </p>
      : null}
      <details className="site00-dw-v3-derivation-review__technical">
        <summary>Technical depth · readiness checks</summary>
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
