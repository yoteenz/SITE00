import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { MobileTwinCompositionState, MobileTwinPackage } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';
import type { ImplementationExpressionIR } from '../p0vrTwinV30R8M2R1/implementationExpressionTypes.js';
import type { ImplementationTranslationBrief, VisualImplementationCodingPrompt } from '../p0vrTwinV30R8M2R2/implementationTranslationBriefTypes.js';
import { CRITICAL_TRANSLATION_REGIONS } from './constants.js';
import type { TranslationDrivenImplementationPlan, TranslationDrivenPlanSection } from './translationDrivenTypes.js';

function regionForKey(key: string): string {
  if (key.startsWith('host-')) return 'HOST_SHELL';
  if (key.startsWith('context-')) return 'PROJECT_CONTEXT';
  if (key.includes('gallery')) return 'CANDIDATE_GALLERY';
  if (key.includes('readiness')) return 'READINESS';
  if (key.includes('history') || key.includes('amendment') || key.includes('concept')) return 'CONCEPT_DATA_HISTORY';
  if (key.startsWith('mobile-nav-') || key === 'mobile-bottom-nav-shell') return 'BOTTOM_NAV';
  if (['grounding-card', 'blueprint-card', 'overlay-card', 'assets-card', 'function-card'].includes(key)) {
    return 'STRUCTURED_OUTPUT';
  }
  if (['refine-btn', 'regen-btn', 'inspect-btn', 'primary-next-action', 'compare-control', 'decision-bar'].includes(key)) {
    return 'DECISION_BAR';
  }
  if (key.includes('authority') || key.includes('select-') || key.includes('promote-') || key.includes('lock-pair') || key.includes('replace-')) {
    return 'AUTHORITY_PANEL';
  }
  return 'HERO_WORKSPACE';
}

function layoutModeForRegion(regionId: string): TranslationDrivenPlanSection['layoutMode'] {
  switch (regionId) {
    case 'HOST_SHELL':
      return 'host-bar';
    case 'PROJECT_CONTEXT':
      return 'context-strip';
    case 'HERO_WORKSPACE':
      return 'hero-editorial-grid';
    case 'AUTHORITY_PANEL':
      return 'authority-rail';
    case 'CANDIDATE_GALLERY':
      return 'gallery-contact-sheet';
    case 'DECISION_BAR':
      return 'decision-row';
    case 'STRUCTURED_OUTPUT':
      return 'structured-band';
    case 'READINESS':
      return 'readiness-system-row';
    case 'CONCEPT_DATA_HISTORY':
      return 'metadata-strip';
    case 'BOTTOM_NAV':
      return 'bottom-nav-compact';
    default:
      return 'context-strip';
  }
}

export function buildTranslationDrivenImplementationPlan(input: {
  brief: ImplementationTranslationBrief;
  codingPrompt: VisualImplementationCodingPrompt;
  expressionIr: ImplementationExpressionIR;
  pkg: MobileTwinPackage;
  composition: MobileTwinCompositionState;
  bundle: MobileStructuredArtifactBundle;
}): TranslationDrivenImplementationPlan {
  void input.bundle;
  const byRegion = new Map<string, string[]>();
  for (const obj of input.composition.objectDefinitions) {
    const key = resolveTemplateKeyFromObjectId(obj.objectId);
    const region = regionForKey(key);
    const list = byRegion.get(region) ?? [];
    list.push(obj.objectId);
    byRegion.set(region, list);
  }

  const sections: TranslationDrivenPlanSection[] = [];
  for (const regionId of CRITICAL_TRANSLATION_REGIONS) {
    const objectIds = byRegion.get(regionId) ?? [];
    const briefSection = input.brief.sectionTranslations.find((s) => s.sectionId === regionId);
    sections.push({
      regionId,
      translationSectionId: regionId,
      expressionRegionId: regionId,
      structuredRegionId: regionId,
      layoutMode: layoutModeForRegion(regionId),
      responsiveRule: input.brief.responsiveTranslation.slice(0, 120),
      componentTreeNodeIds: objectIds.map((id) => `tdc-${id}`),
      styleContractIds: [`tdcss-${regionId.toLowerCase()}`],
      assetBindings: objectIds
        .map((id) => input.composition.objectDefinitions.find((o) => o.objectId === id)?.assetRef)
        .filter(Boolean) as string[],
      functionBindings: objectIds
        .map((id) => input.composition.objectDefinitions.find((o) => o.objectId === id)?.functionTarget)
        .filter(Boolean) as string[],
    });
    void briefSection;
  }

  const partial = {
    id: `tdip-${input.brief.id}`,
    translationBriefId: input.brief.id,
    codingPromptId: input.codingPrompt.id,
    expressionIrId: input.expressionIr.id,
    packageId: input.pkg.id,
    pageComposition: input.brief.globalTranslation.slice(0, 200),
    sections,
    typographyPlan: input.brief.typographyTranslation,
    spacingPlan: input.brief.responsiveTranslation,
    controlHierarchyPlan: input.brief.controlTranslation,
    responsivePlan: input.brief.responsiveTranslation,
  };

  return { ...partial, hash: fnv1aHex(JSON.stringify(partial)) };
}
