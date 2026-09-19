import { buildNdxOverviewVisualObjectCatalog } from '../p0vrTwinV25/ndxOverviewObjectCatalog.js';
import type { ConceptVisualObject } from '../p0vrTwinV25/types.js';
import { buildNdxOverviewBlueprintRelationships } from './buildBlueprintRelationships.js';
import type { ConceptCompositionState, SurgicalBlueprintObject, SurgicalBlueprintTwin } from './types.js';

function mapAssetType(o: ConceptVisualObject): SurgicalBlueprintObject['type'] {
  return o.type;
}

function toSurgicalObject(o: ConceptVisualObject, conceptId: string): SurgicalBlueprintObject {
  const isDivider = o.type === 'DIVIDER';
  const isMedia = o.type === 'IMAGE' || o.type === 'GRAPHIC' || o.type === 'ICON';
  const contractId = o.assetSlotId ? `agc-${conceptId}-${o.objectId.replace(/\./g, '-')}` : null;
  return {
    objectId: o.objectId,
    parentId: o.parentId,
    role: o.role,
    semanticRole: o.semanticRole,
    type: mapAssetType(o),
    renderPrimitive: o.renderPrimitive,
    x: o.x,
    y: o.y,
    width: o.width,
    height: o.height,
    anchorX: 0,
    anchorY: 0,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    gap: 0,
    zIndex: o.zIndex,
    opacity: o.opacity,
    textContent: o.textContent,
    fontAssetId: o.fontRole ? `font-${o.fontRole}` : null,
    fontFamily: o.fontFamily,
    fontRole: o.fontRole,
    fontSize: o.fontSize,
    fontWeight: o.fontWeight,
    fontStyle: null,
    lineHeight: o.lineHeight,
    letterSpacing: o.letterSpacing,
    textTransform: o.textTransform,
    textAlign: o.textAlign,
    lineBreaks: o.lineBreaks,
    lineCount: o.lineBreaks.length || (o.textContent ? 1 : null),
    maxWidth: o.width,
    overflowBehavior: 'visible',
    color: o.color,
    background: o.background,
    gradient: null,
    borderColor: o.border ?? o.color,
    borderWidth: o.borderWidth,
    borderStyle: o.border ? 'solid' : null,
    borderRadius: o.borderRadius,
    dividerThickness: isDivider ? o.height : null,
    dividerLength: isDivider ? o.width : null,
    iconGeometry: o.type === 'ICON' ? 'ndx-icon-placeholder' : null,
    svgPathRef: null,
    assetSlotId: o.assetSlotId,
    canonicalAssetId: o.canonicalAssetId,
    assetVersionId: o.canonicalAssetId ? `${o.canonicalAssetId}-v1` : null,
    assetGenerationContractId: contractId,
    objectFit: o.objectFit,
    objectPosition: o.objectPosition,
    cropWindow: o.crop,
    alphaExpected: isMedia && o.sourceType.includes('TRANSPARENT'),
    interactionRole: o.interactionRole,
    functionBindingTarget: o.functionBindingTarget,
    route: o.functionBindingTarget?.includes('section_nav') ? o.functionBindingTarget : null,
    action: o.interactionRole === 'cta' ? 'quick_action' : null,
    stateContractId: o.functionBindingTarget ? `state-${o.objectId}` : null,
    responsiveContractId: 'mobile-375-v1',
    ownership: o.ownership,
    visualImportance: o.objectId.includes('hero.headline') ? 'CRITICAL' : 'NORMAL',
    fidelityTolerance: 0.015,
    dataVisualState: o.type === 'METRIC' || o.objectId.includes('progress') ? 'UNKNOWN' : 'KNOWN',
    status: 'PLANNED',
  };
}

export function buildSurgicalBlueprintTwin(input: {
  compositionState: ConceptCompositionState;
}): SurgicalBlueprintTwin {
  const catalog = buildNdxOverviewVisualObjectCatalog();
  const objects = catalog.map((o) => toSurgicalObject(o, input.compositionState.conceptId));
  const relationships = buildNdxOverviewBlueprintRelationships(input.compositionState.conceptId);
  const now = new Date().toISOString();

  return {
    blueprintTwinId: `sbt-${input.compositionState.conceptId}`,
    compositionStateId: input.compositionState.compositionStateId,
    conceptId: input.compositionState.conceptId,
    conceptVersionId: input.compositionState.conceptVersionId,
    viewport: 'mobile',
    canvas: { width: 375, height: 812 },
    objects,
    relationships,
    typographyTokens: [
      { role: 'headline', family: 'ndx_condensed', size: 0.042, weight: '700' },
      { role: 'body', family: 'ndx_condensed', size: 0.028, weight: '400' },
      { role: 'metric', family: 'ndx_condensed', size: 0.022, weight: '600' },
    ],
    colorTokens: [
      { role: 'lime', value: '#c8ff00' },
      { role: 'hero_bg', value: '#0a0a0a' },
      { role: 'surface', value: '#ffffff' },
    ],
    surfaceTokens: ['white_band', 'black_hero'],
    assetBindings: objects
      .filter((o) => o.assetSlotId)
      .map((o) => ({
        objectId: o.objectId,
        assetSlotId: o.assetSlotId,
        canonicalAssetId: o.canonicalAssetId,
      })),
    functionBindings: objects
      .filter((o) => o.functionBindingTarget)
      .map((o) => ({ objectId: o.objectId, functionKey: o.functionBindingTarget! })),
    stateContracts: objects.filter((o) => o.stateContractId).map((o) => o.stateContractId!),
    responsiveContracts: ['mobile-375-v1'],
    ownershipContracts: ['CLIENT_CANVAS_ONLY'],
    status: 'DRAFT',
    createdAt: now,
  };
}
