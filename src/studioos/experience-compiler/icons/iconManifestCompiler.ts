import type { IconFamily, IconManifest, IconManifestEntry, IconRequirement } from './iconTypes';

export function canonicalIconFilename(req: IconRequirement, variant: string, state = 'default'): string {
  const cat = req.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const name = req.canonical_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const ext = req.implementation_class === 'LIVE_CODE_SVG' ? 'svg' : req.micro_asset_candidate ? 'webp' : 'svg';
  if (variant.startsWith('app')) return `icon-app-${name}-${state}.${ext}`;
  if (req.implementation_class === 'ILLUSTRATIVE_MICRO_ASSET') return `icon-${name}-micro.webp`;
  return `icon-${cat}-${name}.${ext}`;
}

export function compileIconManifest(project_id: string, family: IconFamily, requirements: IconRequirement[]): IconManifest {
  const entries: IconManifestEntry[] = requirements.map((req) => {
    const live = req.implementation_class === 'LIVE_CODE_SVG';
    const ext = req.implementation_class === 'ILLUSTRATIVE_MICRO_ASSET' ? 'webp' : 'svg';
    return {
      semantic_id: req.icon_semantic_id,
      canonical_name: req.canonical_name,
      family_id: family.icon_family_id,
      implementation_class: req.implementation_class,
      surfaces: req.surfaces,
      variants: [
        ...(req.compact_variant_required ? ['compact'] : []),
        ...(req.display_variant_required ? ['display'] : []),
        ...(req.app_nav_variant_required ? ['app-nav', 'app-active'] : []),
      ],
      sizes: req.required_sizes,
      states: req.interaction_states,
      output_format: ext,
      transparency: true,
      live_code_or_asset: live ? 'LIVE_CODE' : 'ASSET',
      source_authority: live ? 'NONE' : family.icon_family_id,
      grok_required: !live && req.implementation_class !== 'EXTERNAL_PLATFORM_ICON' && req.implementation_class !== 'EXISTING_BRAND_ASSET',
      filename: canonicalIconFilename(req, req.app_nav_variant_required ? 'app' : 'web'),
      usage_locations: req.routes,
      accessibility_semantics: req.accessibility_label_requirement,
    };
  });
  return { project_id, entries };
}

export function compileGrokIconHandoff(
  familyAuthorityId: string,
  manifest: IconManifest,
  microAuthorityId: string | null,
): import('./iconTypes').GrokIconHandoff {
  return {
    icon_family_authority_id: familyAuthorityId,
    micro_asset_family_authority_id: microAuthorityId,
    icon_manifest: manifest,
    rules_summary: 'Create each semantic as member of approved icon family Y. No slot-by-slot style invention.',
    assets: manifest.entries
      .filter((e) => e.grok_required)
      .map((e) => ({
        semantic_id: e.semantic_id,
        family_id: e.family_id,
        surface: e.surfaces[0] ?? 'MOBILE_WEB',
        variant: e.variants[0] ?? 'default',
        state: e.states[0] ?? 'DEFAULT',
        filename: e.filename,
        grok_required: true,
      })),
  };
}

export function iconRulesMarkdown(family: IconFamily): string {
  return `# ICON_RULES

Visual family: ${family.name}
Dimensionality: ${family.expression.dimensionality}
Stroke: ${family.expression.stroke_weight}
App simplification: ${family.expression.app_nav_expression}

Do not bake labels into icons.
Do not invent unrelated styles per slot.
Third-party logos: official marks only where EXTERNAL_PLATFORM_ICON.
`;
}
