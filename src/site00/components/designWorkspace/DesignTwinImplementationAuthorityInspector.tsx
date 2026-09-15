import type { CompiledMobileTwinImplementationDocument } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';

type Props = {
  document: CompiledMobileTwinImplementationDocument;
};

export function DesignTwinImplementationAuthorityInspector({ document }: Props) {
  const plan = document.visualReconstructionPlan;
  const drifts = document.actualToLiveRegionDrifts ?? [];
  const directive = document.actualToCodeReconstructionDirective;

  return (
    <section className="site00-dw-v3-twin-impl-review" data-testid="twin-implementation-authority-inspector">
      <h3>IMPLEMENTATION AUTHORITY INSPECTOR</h3>
      <dl>
        <dt>ACTUAL TARGET</dt>
        <dd>{directive?.visualAuthority ?? '—'} · {document.actualAuthorityContentHashAtAuthoring ?? '—'}</dd>
        <dt>BLUEPRINT GUIDE</dt>
        <dd>{document.blueprintAvailableToReconstruction ? 'GEOMETRY REINFORCEMENT' : 'MISSING'}</dd>
        <dt>TRANSLATION</dt>
        <dd>{document.translationBriefRole ?? '—'}</dd>
        <dt>RECONSTRUCTION PLAN</dt>
        <dd>{plan?.id ?? '—'} · {plan?.hash.slice(0, 12)}</dd>
        <dt>LIVE COMPONENT</dt>
        <dd>{document.actualFirstComponentTree?.rootClass ?? '—'} · {document.actualFirstComponentTree?.hash.slice(0, 12)}</dd>
        <dt>DRIFT REPORT</dt>
        <dd>{drifts.filter((d) => d.severity === 'HIGH_DRIFT').length} high-drift regions</dd>
      </dl>
      <ul>
        {drifts.slice(0, 6).map((d) => (
          <li key={d.regionId}>
            {d.regionId}: {d.severity} — {d.recommendedCorrection}
          </li>
        ))}
      </ul>
    </section>
  );
}
