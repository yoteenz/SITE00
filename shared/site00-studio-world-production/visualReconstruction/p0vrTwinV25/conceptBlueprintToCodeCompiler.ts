import type { ConceptAssetManifest, ConceptBlueprint, ConceptFunctionBindingPlan } from '../p0vrTwinV22/types.js';
import type { BlueprintObjectCodeBinding } from './types.js';

export function compileConceptBlueprintToCode(input: {
  blueprint: ConceptBlueprint;
  manifest: ConceptAssetManifest;
  bindingPlan: ConceptFunctionBindingPlan;
}): { bindings: BlueprintObjectCodeBinding[]; sourceFiles: string[]; unboundPrimary: string[] } {
  const manifestByObject = new Map(input.manifest.slots.map((s) => [s.objectId, s]));
  const fnByRegion = new Map(input.bindingPlan.bindings.map((b) => [b.visualRegion, b.liveFunction]));

  const bindings: BlueprintObjectCodeBinding[] = input.blueprint.objects.map((o) => {
    const slot = manifestByObject.get(o.objectId);
    const canonicalAssetId = slot?.sourceAsset ?? null;
    const isMedia = o.type === 'image';
    return {
      objectId: o.objectId,
      renderPrimitive: isMedia ? 'MEDIA' : o.type === 'divider' ? 'CSS' : 'DOM',
      component: 'ConceptBlueprintObject',
      selector: `.site00-bp-obj--${o.objectId.replace(/\./g, '-')}`,
      sourceFile: 'src/site00/components/reconstruction/ConceptVisualCompilerTwinV2.tsx',
      styleSource: 'site00-twin-v2-concept.css',
      assetSlot: slot?.slotId ?? null,
      canonicalAssetId,
      functionBinding: fnByRegion.get(o.objectId) ?? null,
      status: 'BOUND',
    };
  });

  const primaryPrefixes = ['masthead', 'sectionNav', 'hero', 'progress', 'metrics', 'focus', 'milestone', 'activity'];
  const unboundPrimary = primaryPrefixes.filter((p) => !bindings.some((b) => b.objectId.startsWith(p)));

  return {
    bindings,
    sourceFiles: ['src/site00/components/reconstruction/ConceptVisualCompilerTwinV2.tsx'],
    unboundPrimary,
  };
}
