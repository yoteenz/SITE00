import type { ConceptVisualObject } from '../p0vrTwinV25/types.js';
import type { AssetGenerationContract, AssetGenerationContractSet, ConceptCompositionState } from './types.js';
import type { AssetTypeV27 } from './types.js';

function mapSourceToAssetType(o: ConceptVisualObject): AssetTypeV27 {
  if (o.sourceType === 'GENERATED_TRANSPARENT_ASSET') return 'GENERATED_TRANSPARENT_ASSET';
  if (o.sourceType === 'GENERATED_COMPLEX_MEDIA') return 'GENERATED_COMPLEX_MEDIA';
  if (o.sourceType === 'GENERATED_RASTER_ASSET') return 'GENERATED_RASTER_ASSET';
  if (o.sourceType === 'CSS_GRAPHIC') return 'CSS_GRAPHIC';
  if (o.sourceType === 'EXISTING_PROJECT_ASSET') return 'EXISTING_PROJECT_ASSET';
  if (o.type === 'ICON') return 'SVG_SYSTEM';
  return 'DOM_ONLY';
}

export function buildAssetGenerationContractSet(input: {
  compositionState: ConceptCompositionState;
  assetObjects: ConceptVisualObject[];
}): AssetGenerationContractSet {
  const now = new Date().toISOString();
  const contracts: AssetGenerationContract[] = input.assetObjects
    .filter((o) => o.assetSlotId)
    .map((o) => {
      const assetType = mapSourceToAssetType(o);
      const transparent =
        assetType === 'GENERATED_TRANSPARENT_ASSET' || o.type === 'ICON' || o.type === 'GRAPHIC';
      return {
        assetGenerationContractId: `agc-${input.compositionState.conceptId}-${o.objectId.replace(/\./g, '-')}`,
        conceptId: input.compositionState.conceptId,
        conceptVersionId: input.compositionState.conceptVersionId,
        compositionStateId: input.compositionState.compositionStateId,
        objectId: o.objectId,
        assetSlotId: o.assetSlotId!,
        canonicalAssetId: o.canonicalAssetId ?? `ca-${o.assetSlotId}`,
        assetVersionId: null,
        role: o.role,
        assetType,
        generationProvider: assetType.startsWith('GENERATED') ? 'fal' : 'local',
        generationModel: assetType.startsWith('GENERATED') ? 'flux-pro' : 'n/a',
        generationModelVersion: '2026-03',
        normalizedGenerationInstruction: `Isolated ${o.role} for ${o.objectId}; transparent=${transparent}`,
        negativeConstraints: ['no nav', 'no buttons', 'no baked UI text', 'no progress bars'],
        referenceAssetIds: [],
        referenceVisualId: null,
        transparentBackground: transparent,
        expectedAspectRatio: `${Math.round(o.width * 375)}:${Math.round(o.height * 812)}`,
        expectedWidth: Math.round(o.width * 375),
        expectedHeight: Math.round(o.height * 812),
        orientation: 'portrait',
        cameraAngle: null,
        lightingIntent: null,
        materialIntent: null,
        styleIntent: input.compositionState.colorIntent,
        colorIntent: input.compositionState.colorIntent,
        subjectIntent: o.role,
        isolationRules: ['single subject', 'no neighbor contamination'],
        backgroundRules: transparent ? ['alpha required'] : ['environment allowed'],
        approvedVisualFingerprint: null,
        assetChecksum: null,
        regenerationEligible: assetType.startsWith('GENERATED'),
        retryPolicy: 'founder_confirm',
        spendPolicy: 'FOUNDER_CONFIRM',
        status: 'READY',
        createdAt: now,
      };
    });

  return {
    contractSetId: `agcs-${input.compositionState.conceptId}`,
    compositionStateId: input.compositionState.compositionStateId,
    conceptId: input.compositionState.conceptId,
    conceptVersionId: input.compositionState.conceptVersionId,
    contracts,
    status: 'READY',
    createdAt: now,
  };
}
