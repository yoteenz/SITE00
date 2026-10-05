import type {
  AssetFabricationSpec,
  ContinuityGroup,
  GrokAssetPack,
  ImageRequirementManifest,
  ImageSurfaceVariant,
  LayerOwnershipManifest,
} from './visualSurgeryTypes';

export const GROK_ASSET_PACK_FILES = [
  '00_START_HERE.md',
  'IMAGE_ASSET_MANIFEST.json',
  'IMAGE_RULES.md',
  'LAYER_OWNERSHIP_MANIFEST.json',
  'CONTINUITY_GROUPS.json',
  'SURFACE_VARIANTS.json',
  'ASSET_DEPENDENCIES.json',
] as const;

export function grokStartHereMarkdown(): string {
  return `# Grok asset pack — Visual Asset Surgery

DO NOT RECREATE THE PAGE.
DO NOT INFER THE PAGE STRUCTURE.
DO NOT ADD UI.
DO NOT ADD TEXT.
DO NOT ADD ICONS UNLESS THE ASSET SPEC EXPLICITLY REQUIRES THEM.
DO NOT CHANGE CAMERA / WORLD / MATERIAL LANGUAGE OUTSIDE THE ASSIGNED FAMILY.

CREATE ONLY THE ASSIGNED ASSET per \`fabrication-specs/\`.

Use \`reference-crops/\` as language reference — not as final pixels.
Use \`safe-zones/\` overlays to keep detail out of UI overlap regions.
`;
}

export function imageRulesMarkdown(): string {
  return `# Image rules

- Live UI and live SVG regions are excluded in LAYER_OWNERSHIP_MANIFEST.json
- Every fabrication spec includes must_include and must_exclude
- Environments share continuity groups — do not invent a new world per surface
- Transparent objects require true alpha; shadows may be separate or CSS per spec
`;
}

export function compileGrokAssetPack(input: {
  project_id: string;
  image_requirements: ImageRequirementManifest;
  layer_ownership: LayerOwnershipManifest;
  continuity_groups: ContinuityGroup[];
  surface_variants: ImageSurfaceVariant[];
  fabrication_specs: AssetFabricationSpec[];
  asset_dependencies: import('./visualSurgeryTypes').AssetDependency[];
}): GrokAssetPack {
  const root = 'GROK_ASSET_PACK';
  const files: string[] = [
    `${root}/00_START_HERE.md`,
    `${root}/IMAGE_ASSET_MANIFEST.json`,
    `${root}/IMAGE_RULES.md`,
    `${root}/LAYER_OWNERSHIP_MANIFEST.json`,
    `${root}/CONTINUITY_GROUPS.json`,
    `${root}/SURFACE_VARIANTS.json`,
    `${root}/ASSET_DEPENDENCIES.json`,
    `${root}/icons/ICON_MANIFEST.json`,
    `${root}/icons/ICON_RULES.md`,
  ];
  for (const spec of input.fabrication_specs) {
    files.push(`${root}/fabrication-specs/${spec.asset_id.replace(/\./g, '_')}.json`);
  }
  for (const spec of input.fabrication_specs) {
    if (spec.reference_crop) files.push(`${root}/${spec.reference_crop}`);
    if (spec.safe_zone_map) files.push(`${root}/${spec.safe_zone_map}`);
    files.push(`${root}/${spec.scene_decomposition_sheet}`);
  }
  files.push(`${root}/image-families/README.md`);
  return {
    project_id: input.project_id,
    pack_version: '1.0.0',
    root,
    files: [...new Set(files)],
    image_asset_manifest: input.image_requirements,
    continuity_groups: input.continuity_groups,
    surface_variants: input.surface_variants,
    layer_ownership: input.layer_ownership,
    fabrication_specs: input.fabrication_specs,
  };
}
