import type { AuthorityRecord } from '../../../site00/authority/publicRedesignAuthorityManifest';
import { compileAssetDependencies } from './assetDependencies';
import { compileFabricationSpecs } from './assetFabricationSpec';
import { previewAssetQA } from './assetQA';
import { assignContinuityGroups } from './continuityGroups';
import { compileGrokAssetPack } from './grokAssetPackCompiler';
import { buildImageFamilies } from './imageFamilies';
import { deriveImageExpression } from './imageExpressions';
import { compileImageRequirements } from './imageRequirements';
import { compileImageSurfaceVariants } from './imageSurfaceVariants';
import { compileLayerOwnershipManifest, sceneLayersToOwnershipEntries } from './layerOwnership';
import { compileReferenceCrops } from './referenceCropCompiler';
import { compileSafeZoneMaps } from './safeZoneCompiler';
import { decomposeAuthorities } from './sceneDecomposition';
import { compileVisualFamilyPacks } from './visualFamilyPack';
import type { VisualSurgeryPipelineSlice } from './visualSurgeryTypes';

export function runVisualAssetSurgeryPipeline(input: {
  project_id: string;
  authorities: AuthorityRecord[];
  mode: 'INGEST' | 'GREENFIELD';
}): VisualSurgeryPipelineSlice {
  const scene_decompositions = decomposeAuthorities(input.authorities);
  const scenes: Record<string, import('./visualSurgeryTypes').LayerOwnershipEntry[]> = {};
  for (const d of scene_decompositions) {
    scenes[d.authority_id] = sceneLayersToOwnershipEntries(d.layers);
  }
  const layer_ownership = compileLayerOwnershipManifest(input.project_id, scenes);
  const image_requirements = compileImageRequirements({
    project_id: input.project_id,
    authorities: input.authorities,
    decompositions: scene_decompositions,
  });
  const image_expression = deriveImageExpression(input.project_id);
  const image_families = buildImageFamilies(image_expression, image_requirements.requirements);
  const continuity_groups = assignContinuityGroups(image_requirements.requirements);
  const surface_variants = compileImageSurfaceVariants(image_requirements.requirements);
  const reference_crops = compileReferenceCrops(image_requirements.requirements, scene_decompositions);
  const safe_zone_maps = compileSafeZoneMaps(image_requirements.requirements);
  let fabrication_specs = compileFabricationSpecs(image_requirements.requirements, safe_zone_maps);
  const asset_dependencies = compileAssetDependencies(image_requirements.requirements);
  const depChildren = new Map(asset_dependencies.map((d) => [d.child_asset, d.parent_asset]));
  fabrication_specs = fabrication_specs.map((s) => ({
    ...s,
    asset_dependencies: depChildren.has(s.asset_id) ? [depChildren.get(s.asset_id)!] : [],
  }));
  const grok_asset_pack = compileGrokAssetPack({
    project_id: input.project_id,
    image_requirements,
    layer_ownership,
    continuity_groups,
    surface_variants,
    fabrication_specs,
    asset_dependencies,
  });
  const visual_family_packs = compileVisualFamilyPacks(image_families, continuity_groups);
  const asset_qa_preview = previewAssetQA(image_requirements.requirements, fabrication_specs);
  const layers_discovered = scene_decompositions.reduce((n, d) => n + d.layers.length, 0);

  return {
    scene_decompositions,
    layer_ownership,
    image_requirements,
    image_expression,
    image_families,
    continuity_groups,
    surface_variants,
    reference_crops,
    safe_zone_maps,
    asset_dependencies,
    fabrication_specs,
    grok_asset_pack,
    visual_family_packs,
    asset_qa_preview,
    screens_analyzed: scene_decompositions.length,
    layers_discovered,
  };
}
