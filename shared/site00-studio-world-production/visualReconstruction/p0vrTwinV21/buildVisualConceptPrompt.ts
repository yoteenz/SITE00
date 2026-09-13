import type {
  BlueprintGrammar,
  CreativeBrandContext,
  PageCreativeDirection,
  PageFunctionGraph,
  PageIntentModel,
} from './types.js';
import { TWIN_V2_CLIENT_CANVAS_GENERATION_BOUNDARY } from '../p0vrTwinV22R2/visualConceptGenerationBoundary.js';

export function buildVisualConceptPrompt(input: {
  pageIntent: PageIntentModel;
  functionGraph: PageFunctionGraph;
  brandContext: CreativeBrandContext;
  blueprintGrammar: BlueprintGrammar;
  creativeDirection: PageCreativeDirection;
  viewport: 'mobile';
  refineInstruction?: string | null;
  clientCanvasOnly?: boolean;
}): string {
  const refine = input.refineInstruction?.trim();
  const clientCanvasOnly = input.clientCanvasOnly !== false;
  return [
    clientCanvasOnly
      ? 'Design the NDXBOOK client canvas only (content between SITE 00 host header and host bottom nav).'
      : 'Design the correct NDXBOOK OVERVIEW mobile page experience using approved NDXBOOK / SITE 00 visual language.',
    clientCanvasOnly
      ? '375px wide mobile client canvas artboard — do not include device frame or app shell chrome.'
      : 'Full-page vertical composition, 375px wide mobile artboard, high fidelity UI design frame.',
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
    clientCanvasOnly ? TWIN_V2_CLIENT_CANVAS_GENERATION_BOUNDARY : '',
    refine ? `Founder refinement: ${refine}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
