import type { ConceptAssetManifest, ConceptAssetSlot } from '../p0vrTwinV22/types.js';
import type { ConceptAssetPlan, ConceptGeneratedAsset } from './types.js';

export function buildAssetManifestFromPairedGeneration(input: {
  conceptId: string;
  manifestId: string;
  assetPlan: ConceptAssetPlan;
  generatedAssets: ConceptGeneratedAsset[];
}): ConceptAssetManifest {
  const now = new Date().toISOString();
  const bySlot = new Map(input.generatedAssets.map((a) => [a.assetSlotId, a]));

  const slots: ConceptAssetSlot[] = input.assetPlan.assetSlots.map((plan) => {
    const gen = bySlot.get(plan.assetSlotId);
    return {
      slotId: plan.assetSlotId,
      objectId: plan.blueprintObjectId,
      role: plan.role,
      assetType: plan.assetType,
      visualDescription: plan.visualDescription,
      sourceStrategy: gen
        ? gen.transparentBackground
          ? 'NEW_GENERATED_ASSET'
          : 'GENERATED_CONCEPT_ASSET'
        : 'PROCEDURAL_DOM_GRAPHIC',
      sourceAsset: gen?.storageUrl ?? null,
      derivedAsset: null,
      generationRequired: plan.generationRequired,
      crop: null,
      fit: plan.fit,
      position: plan.position,
      resolution: `${plan.expectedWidth}`,
      status: gen || !plan.generationRequired ? 'RESOLVED' : 'PENDING_GENERATION',
    };
  });

  return {
    manifestId: input.manifestId,
    conceptId: input.conceptId,
    slots,
    createdAt: now,
    status: slots.every((s) => s.status === 'RESOLVED') ? 'READY' : 'DRAFT',
  };
}
