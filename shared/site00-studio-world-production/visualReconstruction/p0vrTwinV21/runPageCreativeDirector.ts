import type {
  BlueprintGrammar,
  CreativeBrandContext,
  PageCreativeDirection,
  PageFunctionGraph,
  PageIntentModel,
} from './types.js';

export function runPageCreativeDirector(input: {
  pageIntent: PageIntentModel;
  functionGraph: PageFunctionGraph;
  brandContext: CreativeBrandContext;
  blueprintGrammar: BlueprintGrammar;
}): PageCreativeDirection {
  const { pageIntent, functionGraph, blueprintGrammar, brandContext } = input;
  return {
    creativePremise: `Design the correct ${pageIntent.pageType} for a founder inside NDXBOOK — not a generic dashboard.`,
    experienceGoal: pageIntent.primaryDecision,
    visualHierarchy: [
      'SITE 00 host chrome (minimal)',
      'NDXBOOK identity + phase masthead',
      'module navigation',
      'hero editorial + media tension',
      'progress + readiness metrics',
      'current focus + milestone',
      'recent activity',
      'host bottom navigation',
    ],
    heroConcept:
      'Asymmetric editorial hero: left copy stack, center grayscale media, right utility column, filled-lime NDX overlay — unmistakably NDXBOOK inside SITE 00.',
    sectionOrder: blueprintGrammar.informationBands,
    sectionRoles: Object.fromEntries(
      blueprintGrammar.informationBands.map((band) => [band, `Preserve function: ${band}`]),
    ),
    imageStrategy: 'editorial crops and segmented photography — no stock dashboard illustrations',
    typeStrategy: brandContext.typographicGrammar.join('; '),
    accentStrategy: brandContext.colorLanguage.join('; '),
    informationDensity: blueprintGrammar.density,
    interactionEmphasis: functionGraph.linksAndCtas,
    contentPriorities: pageIntent.primaryPurposes,
    assetPlan: [
      'approved project authority/reference stills',
      'generated full-page concept frame',
      'supporting band crops from concept',
    ],
    rationale:
      'Inside-out: function graph + NDXBOOK world language + forensic grammar → creative direction before any DOM coding.',
    constraints: [
      'NO SaaS dashboard cards',
      'NO beige editorial admin UI',
      'NO generic rounded startup analytics',
      'MUST read NDXBOOK inside SITE 00',
      'DO NOT recreate current twin V1 pixels',
      brandContext.hostClientFirewall,
    ],
  };
}
