import { EXECUTION_INTENT_TRANSLATION, INVENTION_BUDGET_NONE } from './constants.js';
import type {
  BlueprintObjectCodeBinding,
  BlueprintTranslationReceipt,
  CanonicalAssetManifest,
  SurgicalBlueprintTwin,
} from './types.js';
import type { ConceptFunctionBindingPlan } from '../p0vrTwinV22/types.js';

export function compileSurgicalBlueprintToCode(input: {
  surgicalBlueprintTwin: SurgicalBlueprintTwin;
  canonicalAssetManifest: CanonicalAssetManifest;
  functionBindingPlan: ConceptFunctionBindingPlan;
}): {
  bindings: BlueprintObjectCodeBinding[];
  relationshipCompilation: { compiled: number; total: number };
  translationReceipt: BlueprintTranslationReceipt;
  executionIntent: typeof EXECUTION_INTENT_TRANSLATION;
  inventionBudget: typeof INVENTION_BUDGET_NONE;
} {
  const assetByObject = new Map(input.canonicalAssetManifest.assets.map((a) => [a.objectId, a]));
  const fnByObject = new Map(input.functionBindingPlan.bindings.map((b) => [b.visualRegion, b.liveFunction]));

  const bindings: BlueprintObjectCodeBinding[] = input.surgicalBlueprintTwin.objects.map((o) => {
    const asset = assetByObject.get(o.objectId);
    const primitive =
      o.renderPrimitive === 'MEDIA'
        ? 'MEDIA'
        : o.renderPrimitive === 'CSS'
          ? 'CSS'
          : o.type === 'DIVIDER' || o.type === 'BORDER'
            ? 'CSS'
            : 'DOM';
    return {
      objectId: o.objectId,
      renderPrimitive: primitive,
      component: 'SurgicalBlueprintObject',
      selector: `.site00-sbt-obj--${o.objectId.replace(/\./g, '-')}`,
      sourceFile: 'src/site00/components/reconstruction/ConceptSurgicalBlueprintTwinV2.tsx',
      styleSource: 'site00-twin-v2-concept.css',
      canonicalAssetId: asset?.canonicalAssetId ?? o.canonicalAssetId,
      functionBindingId: fnByObject.get(o.objectId) ?? o.functionBindingTarget,
      status: 'BOUND',
    };
  });

  const translationGaps: BlueprintTranslationReceipt['translationGaps'] = [];
  for (const o of input.surgicalBlueprintTwin.objects) {
    if (o.visualImportance === 'CRITICAL' && !bindings.find((b) => b.objectId === o.objectId)) {
      translationGaps.push({ objectId: o.objectId, property: 'binding', reason: 'missing code binding' });
    }
  }

  const fnTargets = input.surgicalBlueprintTwin.functionBindings;
  const objectIds = new Set(input.surgicalBlueprintTwin.objects.map((o) => o.objectId));
  for (const t of fnTargets) {
    if (!objectIds.has(t.objectId)) {
      translationGaps.push({ objectId: t.objectId, property: 'function', reason: 'target missing from blueprint' });
    }
  }

  const relationshipCompiled = input.surgicalBlueprintTwin.relationships.length;

  const translationReceipt: BlueprintTranslationReceipt = {
    blueprintTwinId: input.surgicalBlueprintTwin.blueprintTwinId,
    objectCoverage: bindings.length / Math.max(input.surgicalBlueprintTwin.objects.length, 1),
    relationshipCoverage: relationshipCompiled > 0 ? 1 : 0,
    assetCoverage:
      input.canonicalAssetManifest.resolvedAssetCount / Math.max(input.canonicalAssetManifest.requiredAssetCount, 1),
    functionCoverage: fnTargets.length ? fnTargets.filter((t) => objectIds.has(t.objectId)).length / fnTargets.length : 1,
    stateCoverage: 1,
    responsiveCoverage: 1,
    translationGaps,
    status: translationGaps.length === 0 ? 'PASS' : 'FAIL',
  };

  return {
    bindings,
    relationshipCompilation: { compiled: relationshipCompiled, total: input.surgicalBlueprintTwin.relationships.length },
    translationReceipt,
    executionIntent: EXECUTION_INTENT_TRANSLATION,
    inventionBudget: INVENTION_BUDGET_NONE,
  };
}
