import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';
import { classifyRuntimeImageSource } from './runtimeAuthorityRasterFirewall.js';

export const IMPLEMENTATION_ASSET_BINDING_MISSING = 'IMPLEMENTATION_ASSET_BINDING_MISSING' as const;

/** Bundled NDXBOOK runtime assets — never authority page renders. */
export const NDXBOOK_CANONICAL_RUNTIME_ASSET_BY_SLOT: Record<string, string> = {
  'asset-dominant-artifact-image':
    '/visual-references/founder/ndxbook/mobile-cultural-intelligence-fullscreen-reference.png',
  'asset-dominant-artifact-frame':
    '/site00/skins/canonical/mobile/brand_family_ndxbook.webp',
  'asset-gallery-thumb-1': '/site00/skins/canonical/mobile/brand_family_ndxbook.webp',
  'asset-gallery-thumb-2': '/visual-references/founder/ndxbook/icon-crops/cultural_intelligence.png',
  'asset-gallery-thumb-3': '/visual-references/founder/ndxbook/mobile-cultural-intelligence-fullscreen-reference.png',
  'asset-gallery-thumb-4': '/visual-references/founder/ndxbook/icon-crops/cultural_intelligence.png',
  'asset-grounding-card': '/visual-references/founder/ndxbook/icon-crops/cultural_intelligence.png',
  'asset-blueprint-card': '/visual-references/founder/ndxbook/icon-crops/cultural_intelligence.png',
  'asset-overlay-card': '/site00/skins/canonical/mobile/brand_family_ndxbook.webp',
  'asset-assets-card': '/site00/skins/canonical/mobile/brand_family_ndxbook.webp',
  'asset-function-card': '/visual-references/founder/ndxbook/icon-crops/cultural_intelligence.png',
};

export type RuntimeAssetTraceability = {
  runtimeElement: string;
  objectId: string;
  assetSlotId: string | null;
  canonicalAssetId: string | null;
  source: string;
  sourceCategory: ReturnType<typeof classifyRuntimeImageSource>;
};

export function resolveCanonicalRuntimeAsset(input: {
  objectId: string;
  assetRef: string | null;
  objectType: string;
  bundle: MobileStructuredArtifactBundle;
}): { uri: string | null; trace: RuntimeAssetTraceability; missing: boolean } {
  const key = resolveTemplateKeyFromObjectId(input.objectId);
  const slotId = input.assetRef ?? `asset-${key}`;
  const manifestHit = input.bundle.canonicalAssetManifest.assets.find((a) => a.objectId === input.objectId);
  const canonicalAssetId = manifestHit?.assetId ?? slotId;
  const mapped = NDXBOOK_CANONICAL_RUNTIME_ASSET_BY_SLOT[slotId] ?? NDXBOOK_CANONICAL_RUNTIME_ASSET_BY_SLOT[`asset-${key}`];

  if (input.objectType !== 'IMAGE' && input.objectType !== 'THUMBNAIL' && input.objectType !== 'ARTIFACT') {
    return {
      uri: null,
      missing: false,
      trace: {
        runtimeElement: input.objectId,
        objectId: input.objectId,
        assetSlotId: slotId,
        canonicalAssetId,
        source: 'none',
        sourceCategory: 'UNKNOWN',
      },
    };
  }

  if (!mapped) {
    return {
      uri: null,
      missing: input.objectType === 'IMAGE' || input.objectType === 'THUMBNAIL',
      trace: {
        runtimeElement: input.objectId,
        objectId: input.objectId,
        assetSlotId: slotId,
        canonicalAssetId,
        source: IMPLEMENTATION_ASSET_BINDING_MISSING,
        sourceCategory: 'UNKNOWN',
      },
    };
  }

  const sourceCategory = classifyRuntimeImageSource(mapped);
  return {
    uri: mapped,
    missing: false,
    trace: {
      runtimeElement: input.objectId,
      objectId: input.objectId,
      assetSlotId: slotId,
      canonicalAssetId,
      source: mapped,
      sourceCategory,
    },
  };
}
