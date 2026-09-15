import type { CompiledMobileTwinImplementationDocument } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';

type Props = {
  document: CompiledMobileTwinImplementationDocument;
};

export function DesignTwinImplementationExpressionTrace({ document }: Props) {
  const ir = document.implementationExpressionIr;
  if (!ir) {
    return <p data-testid="twin-expression-trace-missing">IMPLEMENTATION EXPRESSION IR not attached to this build.</p>;
  }

  const sampleObjects = ir.objectExpressions.slice(0, 12);

  return (
    <details className="site00-dw-v3-twin-impl-expression" data-testid="twin-implementation-expression-trace">
      <summary>IMPLEMENTATION EXPRESSION</summary>
      <p>
        {ir.id} · v{ir.expressionVersion} · hash {ir.hash} · readiness {ir.readiness.status}
      </p>
      <ul>
        {sampleObjects.map((obj) => {
          const treeNode = document.renderTree?.nodes.find((n) => n.objectId === obj.objectId);
          return (
            <li key={obj.objectId} data-testid={`twin-expression-object-${obj.objectId}`}>
              <strong>{obj.objectId}</strong>
              <div>ACTUAL · {obj.authorityEvidence.actualRegion ?? '—'}</div>
              <div>BLUEPRINT · {obj.authorityEvidence.blueprintRegion ?? '—'}</div>
              <div>
                EXPRESSION · {obj.typography.familyRole} · {obj.surface.background} · control{' '}
                {obj.controlTreatment?.role ?? '—'}
              </div>
              <div>RUNTIME · {treeNode?.componentName ?? '—'} · style {treeNode?.styleSource ?? '—'}</div>
            </li>
          );
        })}
      </ul>
      {document.implementationDriftAudit ?
        <p data-testid="twin-expression-drift-summary">
          Drift items: {document.implementationDriftAudit.driftItems.length} · causes:{' '}
          {document.implementationDriftAudit.primaryDriftCauses.slice(0, 2).join('; ')}
        </p>
      : null}
    </details>
  );
}
