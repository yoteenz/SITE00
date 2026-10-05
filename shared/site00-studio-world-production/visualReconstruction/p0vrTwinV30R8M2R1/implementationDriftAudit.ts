import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import type { ImplementationDriftAudit, ImplementationExpressionIR } from './implementationExpressionTypes.js';
import { PRE_R8M2R1_TRANSLATOR_BEHAVIOR } from './visualAuthorityIngestionAudit.js';

export function buildImplementationDriftAudit(input: {
  priorDocument: CompiledMobileTwinImplementationDocument;
  expressionIr: ImplementationExpressionIR;
}): ImplementationDriftAudit {
  const driftItems: ImplementationDriftAudit['driftItems'] = [];

  for (const node of input.priorDocument.nodes ?? []) {
    const expr = input.expressionIr.objectExpressions.find((o) => o.objectId === node.objectId);
    if (!expr) continue;
    const priorSource = node.visualStyleSource ?? 'PROJECT_CONTEXT';
    if (priorSource !== 'ACTUAL_AUTHORITY') {
      driftItems.push({
        objectId: node.objectId,
        cause: 'generic_project_context_styling',
        priorSource,
        expressionSource: 'ACTUAL_AUTHORITY',
      });
    }
    if (node.sectionId?.includes('authority') || node.objectId.includes('authority')) {
      driftItems.push({
        objectId: node.objectId,
        cause: 'authority_panel_hierarchy_flattened',
        priorSource: 'objectType defaults',
        expressionSource: expr.controlTreatment?.role ?? expr.visualRole,
      });
    }
  }

  const primaryDriftCauses = [
    PRE_R8M2R1_TRANSLATOR_BEHAVIOR.primaryVisualInput,
    'control_hierarchy_not_from_actual',
    'spacing_from_generic_section_contract_not_authority',
    'typography_merged_from_catalog_not_per_object_actual',
  ];

  return {
    id: `drift-${input.expressionIr.id}`,
    priorCompilerGeneration: input.priorDocument.compilerGeneration ?? 'R8M2',
    expressionIrId: input.expressionIr.id,
    driftItems,
    primaryDriftCauses,
  };
}
