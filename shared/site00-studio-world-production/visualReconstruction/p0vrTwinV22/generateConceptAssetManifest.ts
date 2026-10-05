import type { ConceptAssetManifest, ConceptAssetSlot, ConceptBlueprint } from './types.js';

export function generateConceptAssetManifest(input: {
  conceptId: string;
  blueprint: ConceptBlueprint;
  conceptImageUrl: string | null;
  referenceAssets: string[];
}): ConceptAssetManifest {
  const now = new Date().toISOString();
  const manifestId = `cam-${input.conceptId}`;

  const slots: ConceptAssetSlot[] = input.blueprint.objects
    .filter((o) => o.type === 'image' || o.assetRole)
    .map((o) => {
      const useConcept = Boolean(input.conceptImageUrl);
      return {
        slotId: `slot-${o.objectId}`,
        objectId: o.objectId,
        role: o.assetRole ?? o.role,
        assetType: o.type,
        visualDescription: o.role,
        sourceStrategy: useConcept
          ? ('CONCEPT_REGION_DERIVATION' as const)
          : input.referenceAssets[0]
            ? ('EXISTING_PROJECT_ASSET' as const)
            : ('GENERATED_CONCEPT_ASSET' as const),
        sourceAsset: useConcept ? input.conceptImageUrl : input.referenceAssets[0] ?? null,
        derivedAsset: null,
        generationRequired: useConcept,
        crop: o.bounds ? `${o.bounds.x},${o.bounds.y},${o.bounds.w},${o.bounds.h}` : null,
        fit: 'cover',
        position: 'center',
        resolution: '375w',
        status: useConcept ? ('PENDING_DERIVATION' as const) : ('RESOLVED' as const),
      };
    });

  if (input.conceptImageUrl) {
    slots.unshift({
      slotId: `slot-full-concept`,
      objectId: 'full_page',
      role: 'approved_visual_authority',
      assetType: 'image',
      visualDescription: 'Full generated concept frame',
      sourceStrategy: 'GENERATED_CONCEPT_ASSET',
      sourceAsset: input.conceptImageUrl,
      derivedAsset: input.conceptImageUrl,
      generationRequired: false,
      crop: null,
      fit: 'contain',
      position: 'top',
      resolution: '375x812',
      status: 'RESOLVED',
    });
  }

  const allResolved = slots.every((s) => s.status === 'RESOLVED' || s.sourceStrategy === 'CONCEPT_REGION_DERIVATION');

  return {
    manifestId,
    conceptId: input.conceptId,
    slots,
    createdAt: now,
    status: allResolved ? 'READY' : 'DRAFT',
  };
}
