import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';
import type { ImplementationExpressionIR } from '../p0vrTwinV30R8M2R1/implementationExpressionTypes.js';
import { TRANSLATION_DRIVEN_CSS_PREFIX } from './constants.js';
import type { TranslationDrivenComponentTree, TranslationDrivenComponentTreeNode, TranslationDrivenImplementationPlan } from './translationDrivenTypes.js';

function layoutRoleFor(key: string, regionId: string): string {
  if (regionId === 'HERO_WORKSPACE') {
    if (key.includes('headline') || key.includes('subcopy')) return 'HERO_HEADLINE_COLUMN';
    if (key.includes('artifact') || key.includes('dominant-artifact')) return 'HERO_ARTIFACT_COLUMN';
    if (key.includes('authority') || key.includes('select-') || key.includes('promote-') || key.includes('lock')) {
      return 'HERO_AUTHORITY_RAIL';
    }
    return 'HERO_SUPPORT';
  }
  if (regionId === 'AUTHORITY_PANEL') return 'AUTHORITY_RAIL_GROUP';
  if (regionId === 'CANDIDATE_GALLERY') return 'GALLERY_CARD';
  if (regionId === 'STRUCTURED_OUTPUT') return 'STRUCTURED_NARROW_CARD';
  if (regionId === 'READINESS') return 'READINESS_CLUSTER';
  if (regionId === 'CONCEPT_DATA_HISTORY') return 'METADATA_CELL';
  if (regionId === 'BOTTOM_NAV') return 'BOTTOM_NAV_ITEM';
  if (regionId === 'DECISION_BAR') return 'DECISION_ACTION';
  if (regionId === 'HOST_SHELL') return 'HOST_CHROME';
  return 'PROJECT_CONTEXT_CHIP';
}

function cssClassFor(layoutRole: string): string {
  return `${TRANSLATION_DRIVEN_CSS_PREFIX}__role-${layoutRole.toLowerCase().replace(/_/g, '-')}`;
}

export function buildTranslationDrivenComponentTree(input: {
  plan: TranslationDrivenImplementationPlan;
  composition: MobileTwinCompositionState;
  expressionIr: ImplementationExpressionIR;
}): TranslationDrivenComponentTree {
  const exprById = new Map(input.expressionIr.objectExpressions.map((o) => [o.objectId, o]));
  const nodes: TranslationDrivenComponentTreeNode[] = [];

  for (const section of input.plan.sections) {
    for (const componentId of section.componentTreeNodeIds) {
      const objectId = componentId.replace(/^tdc-/, '');
      const obj = input.composition.objectDefinitions.find((o) => o.objectId === objectId);
      if (!obj) continue;
      const key = resolveTemplateKeyFromObjectId(objectId);
      const expr = exprById.get(objectId);
      const layoutRole = layoutRoleFor(key, section.regionId);
      const controlRole = expr?.controlTreatment?.role;
      let visualRole = expr?.visualRole ?? obj.semanticRole;
      if (layoutRole === 'HERO_HEADLINE_COLUMN') visualRole = 'DOMINANT_HEADLINE';
      if (layoutRole === 'HERO_ARTIFACT_COLUMN') visualRole = 'DOMINANT_ARTIFACT';

      nodes.push({
        componentId,
        componentType: obj.objectType,
        translationSource: section.translationSectionId,
        expressionSource: expr?.regionId ?? section.expressionRegionId,
        structuredSource: objectId,
        assetSource: obj.assetRef,
        functionSource: obj.functionTarget,
        ownership: obj.ownership,
        layoutRole,
        visualRole,
        cssClass: cssClassFor(layoutRole),
        parentComponentId: section.regionId === 'AUTHORITY_PANEL' ? 'td-region-authority-panel' : `td-region-${section.regionId.toLowerCase()}`,
        structuredObjectId: objectId,
      });
      void controlRole;
    }
  }

  const partial = {
    id: `tdct-${input.plan.id}`,
    planId: input.plan.id,
    nodes,
  };
  return {
    ...partial,
    hash: fnv1aHex(JSON.stringify(partial.nodes.map((n) => ({ id: n.componentId, role: n.layoutRole, class: n.cssClass })))),
  };
}
