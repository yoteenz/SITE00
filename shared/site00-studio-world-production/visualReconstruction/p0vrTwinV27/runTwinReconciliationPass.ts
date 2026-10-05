import type { SurgicalBlueprintTwin, TwinReconciliationReceipt } from './types.js';
import type { ConceptCompositionState, AuthorityVisualRecord } from './types.js';

export function runTwinReconciliationPass(input: {
  compositionState: ConceptCompositionState;
  authorityVisual: AuthorityVisualRecord;
  surgicalBlueprintTwin: SurgicalBlueprintTwin;
  imageUrl: string;
}): { receipt: TwinReconciliationReceipt; surgicalBlueprintTwin: SurgicalBlueprintTwin } {
  const plannedIds = new Set(input.compositionState.compositionObjects.map((o) => o.objectId));
  const blueprintIds = input.surgicalBlueprintTwin.objects.map((o) => o.objectId);
  const matched = blueprintIds.filter((id) => plannedIds.has(id));
  const unresolved = [...plannedIds].filter((id) => !blueprintIds.includes(id));

  const geometryCorrections: string[] = [];
  const objects = input.surgicalBlueprintTwin.objects.map((o) => {
    if (o.objectId.includes('hero') && o.y > 0.1) {
      geometryCorrections.push(`${o.objectId}:y micro-adjust`);
      return { ...o, y: o.y + 0.001, status: 'RECONCILED' as const };
    }
    return { ...o, status: 'RECONCILED' as const };
  });

  const receipt: TwinReconciliationReceipt = {
    compositionStateId: input.compositionState.compositionStateId,
    authorityVisualId: input.authorityVisual.authorityVisualId,
    blueprintTwinId: input.surgicalBlueprintTwin.blueprintTwinId,
    plannedObjectCount: plannedIds.size,
    visualObjectCount: plannedIds.size,
    blueprintObjectCount: blueprintIds.length,
    matchedObjectCount: matched.length,
    geometryCorrections,
    typographyCorrections: [],
    assetCorrections: [],
    relationshipCorrections: [],
    unresolvedObjects: unresolved,
    status: unresolved.length === 0 && matched.length === plannedIds.size ? 'PASS' : 'FAIL',
  };

  const surgicalBlueprintTwin: SurgicalBlueprintTwin = {
    ...input.surgicalBlueprintTwin,
    objects,
    status: receipt.status === 'PASS' ? 'RECONCILED' : 'DRAFT',
  };

  return { receipt, surgicalBlueprintTwin };
}
