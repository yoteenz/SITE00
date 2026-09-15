import type { CompiledMobileTwinImplementationDocument } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';

type Props = {
  document: CompiledMobileTwinImplementationDocument;
};

export function DesignTwinForensicImplementationInspector({ document }: Props) {
  const objects = document.forensicUiObjectMap?.objects.slice(0, 8) ?? [];
  const lastIter = document.forensicDomCorrectionIterations?.[document.forensicDomCorrectionIterations.length - 1];
  return (
    <section data-testid="twin-forensic-implementation-inspector">
      <h3>FORENSIC IMPLEMENTATION</h3>
      <p>
        spec {document.forensicImplementationSpec?.id ?? '—'} · objects {document.forensicUiObjectMap?.objects.length ?? 0}
      </p>
      <ul>
        {objects.map((o) => {
          const m = lastIter?.measurements.find((x) => x.forensicObjectId === o.forensicObjectId);
          return (
            <li key={o.forensicObjectId}>
              {o.forensicObjectId} / {o.semanticObjectId}: target {Math.round(o.widthRatio * 100)}%w
              {m ? ` · live Δ ${m.positionDeltaRatio.toFixed(3)} · ${m.withinTolerance ? 'OK' : 'DRIFT'}` : ''}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
