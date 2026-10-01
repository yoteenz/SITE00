import type { AppRelationship, ExperienceFamily, ExperienceSurface, FamilySurfaceExpression, ProjectExperienceIntelligence } from './map2Types';

export function buildSurfaceExpressionsForFamilies(
  families: ExperienceFamily[],
  intelligence: ProjectExperienceIntelligence,
): FamilySurfaceExpression[] {
  const surfaces: ExperienceSurface[] = ['MOBILE_WEB', 'TABLET_WEB', 'DESKTOP_WEB'];
  if (intelligence.app_intent !== 'NOT_REQUIRED' && intelligence.app_intent !== 'FUTURE') surfaces.push('APP');

  const out: FamilySurfaceExpression[] = [];
  for (const family of families) {
    for (const surface of surfaces) {
      const isConfigurator = family.family_id.includes('CONFIGURATOR');
      const isImmersive = family.family_id.includes('IMMERSIVE');
      out.push({
        family_id: family.family_id,
        surface,
        composition_model: isConfigurator && surface === 'DESKTOP_WEB' ? 'Simultaneous panels' : 'Sequential focus',
        navigation_model: surface === 'APP' ? 'Tab + stack' : surface === 'MOBILE_WEB' ? 'Bottom sheet + back stack' : 'Persistent chrome',
        information_density: isImmersive ? 'LOW' : isConfigurator ? 'HIGH' : 'MEDIUM',
        interaction_model: isConfigurator ? 'Step + preview' : 'Browse + drill',
        responsive_relationship:
          surface === 'MOBILE_WEB' && isConfigurator
            ? 'SAME_FAMILY_DIFFERENT_COMPOSITION'
            : surface === 'APP'
              ? 'DEVICE_SPECIFIC'
              : 'SAME_EXPERIENCE_ADAPTED',
        mobile_authority_required: surface === 'MOBILE_WEB' && (isConfigurator || isImmersive),
        tablet_strategy: isConfigurator ? 'HYBRID_LAYOUT' : 'DERIVED_FROM_MOBILE',
        desktop_authority_required: surface === 'DESKTOP_WEB' && isConfigurator,
        app_relationship: surface === 'APP' ? intelligence.app_intent : 'NOT_REQUIRED',
      });
    }
  }
  return out;
}

export function classifyAppIntent(intent: AppRelationship): string {
  return intent;
}
