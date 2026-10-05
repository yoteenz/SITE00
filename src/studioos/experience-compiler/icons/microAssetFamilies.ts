import type { IconRequirement, MicroAssetFamily, MicroAssetRequirement } from './iconTypes';

export function compileMicroAssetFamily(project_id: string, requirements: IconRequirement[]): MicroAssetFamily | null {
  const micro = requirements.filter((r) => r.implementation_class === 'ILLUSTRATIVE_MICRO_ASSET');
  if (!micro.length) return null;
  const reqs: MicroAssetRequirement[] = micro.map((m) => ({
    semantic_id: m.icon_semantic_id,
    name: m.canonical_name,
    family_id: m.families[0] ?? 'MICRO_ASSET',
    surfaces: m.surfaces,
    expression: {
      materials: 'Brand satin + machined metal',
      lighting: 'Soft studio key + rim',
      perspective: 'Three-quarter product hero',
      depth: 'Moderate — readable at 48px',
      render_realism: 'Stylized realism — not photoreal clutter',
      brand_accents: 'Primary accent edge only',
    },
  }));
  return {
    micro_asset_family_id: `MICRO_${project_id.replace(/\W/g, '_').toUpperCase()}`,
    name: 'Micro-asset family',
    requirements: reqs,
  };
}
