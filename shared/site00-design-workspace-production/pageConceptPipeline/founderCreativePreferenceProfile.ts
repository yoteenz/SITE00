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
  return [
    'FOUNDER CREATIVE PREFERENCE (cross-project — not brand identity copy):',
    profile.strongerGraphicAuthorship ? '- Prefer stronger graphic authorship' : '',
    profile.dislikeSterileTemplates ? '- Avoid sterile template layouts' : '',
    profile.deliberateTypography ? '- Deliberate typography over generic UI defaults' : '',
    profile.visualStorytelling ? '- Visual storytelling over flat dashboards' : '',
    `- Asymmetry appetite: ${profile.asymmetryAppetite}`,
    `- Image integration: ${profile.imageIntegration}`,
    profile.expressiveFunctionalSystems ? '- Expressive but functional systems' : '',
    'Does NOT copy any single project brand palette or marks.',
  ]
    .filter(Boolean)
    .join('\n');
}
