/**
 * Founder-level creative preferences — may inform generation without copying project brand visuals.
 */

export const FOUNDER_CREATIVE_PREFERENCE_PROFILE_VERSION = 'founder-creative-preference-v1' as const;

export type FounderCreativePreferenceProfile = {
  version: typeof FOUNDER_CREATIVE_PREFERENCE_PROFILE_VERSION;
  strongerGraphicAuthorship: boolean;
  dislikeSterileTemplates: boolean;
  deliberateTypography: boolean;
  visualStorytelling: boolean;
  asymmetryAppetite: 'LOW' | 'MEDIUM' | 'HIGH';
  imageIntegration: 'SUBTLE' | 'BALANCED' | 'DOMINANT';
  expressiveFunctionalSystems: boolean;
};

export const DEFAULT_FOUNDER_CREATIVE_PREFERENCE_PROFILE: FounderCreativePreferenceProfile = {
  version: FOUNDER_CREATIVE_PREFERENCE_PROFILE_VERSION,
  strongerGraphicAuthorship: true,
  dislikeSterileTemplates: true,
  deliberateTypography: true,
  visualStorytelling: true,
  asymmetryAppetite: 'MEDIUM',
  imageIntegration: 'BALANCED',
  expressiveFunctionalSystems: true,
};

export function compileFounderCreativePreferenceBlock(profile: FounderCreativePreferenceProfile): string {
  const tags: string[] = [];
  if (profile.strongerGraphicAuthorship) tags.push('graphic authorship');
  if (profile.dislikeSterileTemplates) tags.push('no sterile templates');
  if (profile.deliberateTypography) tags.push('deliberate typography');
  if (profile.visualStorytelling) tags.push('visual storytelling');
  tags.push(`asymmetry=${profile.asymmetryAppetite}`, `imagery=${profile.imageIntegration}`);
  if (profile.expressiveFunctionalSystems) tags.push('expressive+functional');
  return `FOUNDER PREFERENCE (cross-project, not brand copy): ${tags.join('; ')}.`;
}
