import type { IconFamily, IconRequirement, IconSurfaceVariant } from './iconTypes';

export function compileIconSurfaceVariants(family: IconFamily, requirements: IconRequirement[]): IconSurfaceVariant[] {
  const variants: IconSurfaceVariant[] = [];
  for (const req of requirements) {
    if (req.implementation_class === 'LIVE_CODE_SVG' || req.implementation_class === 'EXTERNAL_PLATFORM_ICON') continue;
    for (const surface of req.surfaces) {
      variants.push({
        semantic_id: req.icon_semantic_id,
        icon_family_id: family.icon_family_id,
        surface,
        variant_type: surface === 'APP' && req.app_nav_variant_required ? 'APP_NAV' : surface === 'MOBILE_WEB' ? 'COMPACT' : 'WEB_DISPLAY',
        size: surface === 'APP' ? 24 : surface === 'DESKTOP_WEB' ? 32 : 24,
        visual_complexity: req.micro_asset_candidate ? 'HIGH' : 'MEDIUM',
        simplification_level: surface === 'APP' ? 2 : 0,
        derivable: !req.display_variant_required,
        unique_authority_required: req.prominence === 'PRIMARY' && surface === 'DESKTOP_WEB',
      });
      if (req.app_nav_variant_required && surface === 'APP') {
        variants.push({
          semantic_id: req.icon_semantic_id,
          icon_family_id: family.icon_family_id,
          surface: 'APP',
          variant_type: 'APP_ACTIVE',
          size: 24,
          visual_complexity: 'LOW',
          simplification_level: 3,
          derivable: true,
          unique_authority_required: false,
        });
      }
    }
    if (req.micro_asset_candidate) {
      variants.push({
        semantic_id: req.icon_semantic_id,
        icon_family_id: family.icon_family_id,
        surface: 'DESKTOP_WEB',
        variant_type: 'MICRO_ASSET',
        size: 48,
        visual_complexity: 'HIGH',
        simplification_level: 0,
        derivable: false,
        unique_authority_required: true,
      });
    }
  }
  return variants;
}

export function appIconStrategy(requirements: IconRequirement[]): { master_to_app_simplification: number; active_states: number } {
  const appNav = requirements.filter((r) => r.app_nav_variant_required);
  return { master_to_app_simplification: appNav.length, active_states: appNav.length };
}
