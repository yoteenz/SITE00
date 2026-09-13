import type {
  BlueprintGrammar,
  CreativeBrandContext,
  PageCreativeDirection,
  PageFunctionGraph,
  PageIntentModel,
} from './types.js';

export function buildVisualConceptPrompt(input: {
  pageIntent: PageIntentModel;
  functionGraph: PageFunctionGraph;
  brandContext: CreativeBrandContext;
  blueprintGrammar: BlueprintGrammar;
  creativeDirection: PageCreativeDirection;
  viewport: 'mobile';
  refineInstruction?: string | null;
}): string {
  const refine = input.refineInstruction?.trim();
  return [
    'Design the correct NDXBOOK OVERVIEW mobile page experience using approved NDXBOOK / SITE 00 visual language.',
    'Full-page vertical composition, 375px wide mobile artboard, high fidelity UI design frame.',
    'NOT a screenshot recreation. NOT a generic SaaS dashboard. NOT modernized admin cards.',
    `Intent: ${input.pageIntent.summary}`,
    `User decision: ${input.pageIntent.primaryDecision}`,
    `Creative premise: ${input.creativeDirection.creativePremise}`,
    `Hero: ${input.creativeDirection.heroConcept}`,
    `Bands required: ${input.blueprintGrammar.informationBands.join(' → ')}`,
    `Function must support: ${input.functionGraph.sectionNavigation.join(', ')}; progress; metrics; focus; milestone; activity.`,
    `Brand: ${input.brandContext.projectIdentity}. Colors: ${input.brandContext.colorLanguage.join(', ')}.`,
    `Typography: ${input.brandContext.typographicGrammar.join('; ')}.`,
    `Host/client: ${input.brandContext.hostClientFirewall}`,
    refine ? `Founder refinement: ${refine}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
