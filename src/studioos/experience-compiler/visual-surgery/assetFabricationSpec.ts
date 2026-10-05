import type { AssetFabricationSpec, ImageRequirement, SafeZoneMap } from './visualSurgeryTypes';

export function compileFabricationSpecs(
  requirements: ImageRequirement[],
  safeZones: SafeZoneMap[],
): AssetFabricationSpec[] {
  const szByAsset = new Map(safeZones.map((s) => [s.asset_id, s]));
  return requirements
    .filter((r) => r.grok_required)
    .map((r) => {
      const sz = szByAsset.get(r.asset_id);
      return {
        asset_id: r.asset_id,
        purpose: r.must_include[0] ?? r.canonical_name,
        family_id: r.family,
        continuity_group_id: r.continuity_group,
        surface: r.surface,
        dimensions: r.target_output_size,
        aspect: r.aspect_ratio,
        reference_crop: r.reference_crop,
        scene_decomposition_sheet: `scene-decomposition/${r.authority_id}_DECOMPOSITION.md`,
        safe_zone_map: sz?.overlay_relative_path ?? null,
        must_include: r.must_include,
        must_exclude: r.must_exclude,
        camera: r.camera,
        lighting: r.lighting,
        materials: r.materials,
        perspective: r.perspective,
        negative_space: r.negative_space,
        crop_behavior: r.crop_mode,
        transparency: r.transparency,
        shadow_ownership: r.shadow_ownership,
        reflection_ownership: r.reflection_ownership,
        mask_ownership: r.mask,
        asset_dependencies: [],
        output_format: r.output_format,
        version: r.version,
      };
    });
}
