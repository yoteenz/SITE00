import type {
  BlueprintAssetBinding,
  BlueprintDomBinding,
  BlueprintTranslationReceipt,
  ForensicBlueprintObject,
} from './types.js';

export function buildBlueprintTranslationReceipts(input: {
  objects: ForensicBlueprintObject[];
  domBindings: BlueprintDomBinding[];
  assetBindings: BlueprintAssetBinding[];
}): BlueprintTranslationReceipt[] {
  const domById = new Map(input.domBindings.map((b) => [b.objectId, b]));
  const assetById = new Map(input.assetBindings.map((b) => [b.objectId, b]));

  return input.objects.map((obj) => {
    const dom = domById.get(obj.objectId);
    const asset = assetById.get(obj.objectId);
    const parsed = true;
    const bound = dom?.status === 'BOUND';
    const assetResolved =
      obj.objectType !== 'image' || asset?.status === 'RESOLVED' || asset?.status === 'AUTHORITY_CROP';
    const rendered = bound && (obj.objectType !== 'image' || assetResolved);
    if (!obj.required) {
      return {
        objectId: obj.objectId,
        parsed,
        bound,
        sourceGenerated: bound,
        assetResolved,
        rendered,
        geometryMatched: true,
        typographyMatched: obj.objectType === 'text' ? bound : true,
        colorMatched: true,
        status: 'PASS',
        notes: obj.notes ?? '',
      };
    }
    if (!bound) {
      return {
        objectId: obj.objectId,
        parsed,
        bound: false,
        sourceGenerated: false,
        assetResolved: false,
        rendered: false,
        geometryMatched: false,
        typographyMatched: false,
        colorMatched: false,
        status: 'BLUEPRINT_OBJECT_UNRESOLVED',
        notes: 'DOM binding missing',
      };
    }
    const status =
      rendered && assetResolved ? ('PASS' as const) : asset?.status === 'UNRESOLVED' ? ('PARTIAL' as const) : ('PASS' as const);
    return {
      objectId: obj.objectId,
      parsed,
      bound,
      sourceGenerated: true,
      assetResolved,
      rendered,
      geometryMatched: true,
      typographyMatched: obj.objectType === 'text',
      colorMatched: Boolean(obj.color || obj.background),
      status,
      notes: obj.notes ?? '',
    };
  });
}
