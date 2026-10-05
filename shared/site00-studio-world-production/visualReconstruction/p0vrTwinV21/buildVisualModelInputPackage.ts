import type { ConceptDirectedTwinSession } from './types.js';
import { TWIN_V2_VISUAL_PROVIDER, TWIN_V2_VISUAL_PROVIDER_LABEL } from './constants.js';

export type TwinV2VisualModelInputPackage = {
  pageIntent: ConceptDirectedTwinSession['pageIntent'];
  functionGraph: ConceptDirectedTwinSession['functionGraph'];
  brandContext: ConceptDirectedTwinSession['brandContext'];
  blueprintGrammar: ConceptDirectedTwinSession['blueprintGrammar'];
  creativeDirection: ConceptDirectedTwinSession['creativeDirection'];
  referenceAssets: string[];
  viewport: 'mobile';
  provider: typeof TWIN_V2_VISUAL_PROVIDER_LABEL;
  model: typeof TWIN_V2_VISUAL_PROVIDER;
  brandColors: string[];
  typographicBehavior: string[];
};

export function buildVisualModelInputPackage(session: ConceptDirectedTwinSession): TwinV2VisualModelInputPackage {
  if (!session.creativeDirection) {
    throw new Error('TWIN_V2_VISUAL_INPUT: creative direction required');
  }
  return {
    pageIntent: session.pageIntent,
    functionGraph: session.functionGraph,
    brandContext: session.brandContext,
    blueprintGrammar: session.blueprintGrammar,
    creativeDirection: session.creativeDirection,
    referenceAssets: session.referenceAssets,
    viewport: session.viewport,
    provider: TWIN_V2_VISUAL_PROVIDER_LABEL,
    model: TWIN_V2_VISUAL_PROVIDER,
    brandColors: session.brandContext.colorLanguage,
    typographicBehavior: session.brandContext.typographicGrammar,
  };
}
