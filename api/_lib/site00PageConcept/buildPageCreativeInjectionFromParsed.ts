import type { PageCreativeInjection } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { normalizeCgptParsedToInjectionFields } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeSynthesis.js';
import type { PageCgptInput } from './generatePageCreativeInjection.js';

export function buildPageCreativeInjectionFromParsed(
  input: PageCgptInput,
  parsed: Record<string, unknown>,
  model: string,
  idSuffix?: string,
): PageCreativeInjection {
  const normalized = normalizeCgptParsedToInjectionFields(parsed);
  const now = new Date().toISOString();
  return {
    injectionId: idSuffix ?? `pinj-${Date.now()}`,
    projectId: input.pageContext.projectId,
    pageId: input.pageContext.pageId,
    projectContextVersion: input.projectContext.contextVersion,
    pageContextVersion: input.pageContext.contextVersion,
    functionContractVersion: input.functionContract.version,
    creativeThesis: normalized.creativeThesis ?? '',
    creativePremise: normalized.creativePremise,
    pageStory: normalized.pageStory,
    pagePurposeInterpretation: normalized.pagePurposeInterpretation ?? '',
    visualOpportunity: normalized.visualOpportunity ?? '',
    visualTerritory: normalized.visualTerritory,
    hierarchyDirection: normalized.hierarchyDirection ?? '',
    hierarchyStrategy: normalized.hierarchyStrategy,
    spatialDirection: normalized.spatialDirection ?? '',
    compositionStrategy: normalized.compositionStrategy,
    informationPriority: normalized.informationPriority ?? '',
    imageDataBalance: normalized.imageDataBalance ?? '',
    responsiveDirection: normalized.responsiveDirection ?? '',
    mobileDirection: normalized.mobileDirection ?? '',
    desktopDirection: normalized.desktopDirection ?? '',
    creativeLatitude: normalized.creativeLatitude ?? '',
    immutableRequirements: normalized.immutableRequirements ?? [],
    referenceStrategy: normalized.referenceStrategy ?? '',
    assetStrategy: normalized.assetStrategy ?? '',
    imageryStrategy: normalized.imageryStrategy,
    imageStrategy: normalized.imageStrategy,
    interactionCharacter: normalized.interactionCharacter,
    pageSurprise: normalized.pageSurprise,
    audienceIntent: normalized.audienceIntent,
    distinctiveMove: normalized.distinctiveMove,
    typographyStrategy: normalized.typographyStrategy,
    colorStrategy: normalized.colorStrategy,
    materialStrategy: normalized.materialStrategy,
    avoidList: normalized.avoidList,
    mandatoryBrandSignals: normalized.mandatoryBrandSignals,
    createdAt: now,
    cgptProvider: 'anthropic',
    cgptModel: model,
  };
}

export function mergeCgptParsedRecords(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value == null) continue;
    if (typeof value === 'string' && !value.trim()) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}
