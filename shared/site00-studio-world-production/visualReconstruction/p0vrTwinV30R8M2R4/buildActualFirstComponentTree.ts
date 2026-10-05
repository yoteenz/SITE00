import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';
import type { ImplementationExpressionIR } from '../p0vrTwinV30R8M2R1/implementationExpressionTypes.js';
import type { VisualReconstructionPlan } from './actualFirstTypes.js';
import { ACTUAL_FIRST_CSS_PREFIX } from './constants.js';

export type ActualFirstComponentTreeNode = {
  componentId: string;
  structuredObjectId: string;
  layoutRole: string;
  cssClass: string;
  parentComponentId: string | null;
  actualEvidenceRegion: string;
  blueprintEvidenceRegion: string;
};

export type ActualFirstComponentTree = {
  id: string;
  hash: string;
  nodes: ActualFirstComponentTreeNode[];
};

function layoutRoleFor(key: string, regionId: string): string {
  if (regionId === 'HERO_WORKSPACE' || regionId.includes('HERO')) {
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
  if (regionId === 'CONCEPT_DATA') return 'METADATA_CELL';
  if (regionId === 'BOTTOM_NAV') return 'BOTTOM_NAV_ITEM';
  if (regionId === 'DECISION_BAR') return 'DECISION_ACTION';
  if (regionId === 'HOST_HEADER' || regionId === 'HOST_SHELL') return 'HOST_CHROME';
  return 'PROJECT_CONTEXT_CHIP';
}

export function buildActualFirstComponentTree(input: {
  plan: VisualReconstructionPlan;
  composition: MobileTwinCompositionState;
  expressionIr: ImplementationExpressionIR;
}): ActualFirstComponentTree {
  const nodes: ActualFirstComponentTreeNode[] = [];
  for (const obj of input.composition.objectDefinitions) {
    const key = resolveTemplateKeyFromObjectId(obj.objectId);
    const expr = input.expressionIr.objectExpressions.find((e) => e.objectId === obj.objectId);
    const regionId = expr?.regionId ?? 'HERO_WORKSPACE';
    const layoutRole = layoutRoleFor(key, regionId);
    const decision = input.plan.decisions.find((d) => d.structuredObjectIds.includes(obj.objectId));
    nodes.push({
      componentId: `afc-${obj.objectId}`,
      structuredObjectId: obj.objectId,
      layoutRole,
      cssClass: `${ACTUAL_FIRST_CSS_PREFIX}__role-${layoutRole.toLowerCase().replace(/_/g, '-')}`,
      parentComponentId: null,
      actualEvidenceRegion: decision?.actualEvidenceRegion ?? 'HERO_WORKSPACE',
      blueprintEvidenceRegion: decision?.blueprintEvidenceRegion ?? 'HERO_WORKSPACE',
    });
  }
  const body = JSON.stringify(nodes.map((n) => ({ id: n.componentId, r: n.layoutRole })));
  return {
    id: `afct-${fnv1aHex(body).slice(0, 12)}`,
    hash: fnv1aHex(body),
    nodes,
  };
}
