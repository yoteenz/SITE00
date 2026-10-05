import type { ImageRequirement, ReferenceCrop, SceneDecomposition } from './visualSurgeryTypes';

export function compileReferenceCrops(
  requirements: ImageRequirement[],
  decompositions: SceneDecomposition[],
): ReferenceCrop[] {
  const decompByAuth = new Map(decompositions.map((d) => [d.authority_id, d]));
  return requirements
    .filter((r) => r.reference_crop)
    .map((r) => {
      const decomp = decompByAuth.get(r.authority_id);
      const layer = decomp?.layers.find((l) => l.asset_slot_id === r.asset_id);
      return {
        asset_id: r.asset_id,
        authority_id: r.authority_id,
        relative_path: r.reference_crop!,
        source_bbox: layer?.bbox ?? r.source_bbox,
        purpose: 'Visual reference for Grok — not final production resolution or isolation',
      };
    });
}
