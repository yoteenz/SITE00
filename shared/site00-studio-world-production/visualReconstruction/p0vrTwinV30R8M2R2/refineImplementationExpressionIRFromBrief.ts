import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';
import { materialStylesForControl } from '../p0vrTwinV30R8M2/implementationMaterialStyleResolver.js';
import type { ImplementationExpressionIR, ImplementationExpressionObject } from '../p0vrTwinV30R8M2R1/implementationExpressionTypes.js';
import type { ImplementationTranslationBrief } from './implementationTranslationBriefTypes.js';

export type ExpressionChangesFromBrief = {
  objectsAdjusted: number;
  regionsAdjusted: number;
  fieldsTouched: string[];
};

function applyBriefToObject(expr: ImplementationExpressionObject, brief: ImplementationTranslationBrief): boolean {
  let touched = false;
  const key = resolveTemplateKeyFromObjectId(expr.objectId);

  if (expr.regionId === 'HERO_WORKSPACE') {
    if (key.includes('headline')) {
      expr.typography.sizePx = Math.max(expr.typography.sizePx, 20);
      expr.typography.weight = 900;
      expr.typography.lineHeight = 1.05;
      expr.visualRole = 'DOMINANT_HEADLINE';
      touched = true;
    }
    if (key.includes('artifact') || key.includes('dominant-artifact')) {
      expr.assetTreatment = expr.assetTreatment ?
          {
            ...expr.assetTreatment,
            prominence: 'HIGH',
            focalPoint: { x: 0.5, y: 0.42 },
            borderTreatment: '1px solid #444',
          }
        : expr.assetTreatment;
      expr.spacing.paddingPx = Math.min(expr.spacing.paddingPx, 6);
      touched = true;
    }
  }

  if (expr.regionId === 'AUTHORITY_PANEL' && expr.controlTreatment) {
    if (key.includes('promote') || key.includes('primary')) {
      expr.controlTreatment.role = 'PRIMARY';
    } else {
      expr.controlTreatment.role = 'SECONDARY';
      Object.assign(expr.controlTreatment, { activeTreatment: 'neutral fill — not lime' });
    }
    touched = true;
  }

  if (expr.regionId === 'CANDIDATE_GALLERY') {
    expr.spacing.gapPx = Math.min(expr.spacing.gapPx, 6);
    expr.spacing.marginBottomPx = Math.min(expr.spacing.marginBottomPx, 8);
    touched = true;
  }

  if (expr.regionId === 'STRUCTURED_OUTPUT') {
    expr.surface.border = '1px solid #333';
    expr.surface.background = '#0d0d0d';
    touched = true;
  }

  if (expr.regionId === 'BOTTOM_NAV' && expr.controlTreatment) {
    expr.controlTreatment.role = 'NEUTRAL';
    touched = true;
  }

  if (expr.controlTreatment) {
    const role = expr.controlTreatment.role as 'PRIMARY' | 'SECONDARY' | 'SELECTED' | 'NEUTRAL' | 'LOCKED' | 'SYSTEM';
    const styles = materialStylesForControl(role, expr.ownership);
    if (role !== 'PRIMARY' && styles.background === '#c8ff00') {
      expr.controlTreatment.role = 'SECONDARY';
    }
  }

  void brief;
  return touched;
}

export function refineImplementationExpressionIRFromBrief(input: {
  expressionIr: ImplementationExpressionIR;
  brief: ImplementationTranslationBrief;
}): { expressionIr: ImplementationExpressionIR; changes: ExpressionChangesFromBrief } {
  const ir = structuredClone(input.expressionIr) as ImplementationExpressionIR;
  const fieldsTouched = new Set<string>();
  let objectsAdjusted = 0;

  ir.globalExpression = {
    ...ir.globalExpression,
    atmosphere: 'dark editorial workspace — translation-brief anchored',
    accentPolicy: input.brief.colorMaterialTranslation.includes('lime') ?
      'lime (#c8ff00) only for PRIMARY controls and selected locks — per translation brief'
    : ir.globalExpression.accentPolicy,
    densityProfile: 'compact dense information layout — brief enforced',
  };
  fieldsTouched.add('globalExpression');

  for (const obj of ir.objectExpressions) {
    if (applyBriefToObject(obj, input.brief)) {
      objectsAdjusted += 1;
      fieldsTouched.add('objectExpressions');
    }
  }

  for (const [regionId, regionExpr] of Object.entries(ir.regionExpressions)) {
    const section = input.brief.sectionTranslations.find((s) => s.sectionId.includes(regionId.replace('_', '')));
    if (section?.implementationGuidance.includes('PRIMARY') || section?.implementationGuidance.includes('dominant')) {
      regionExpr.dominance = 'PRIMARY';
      fieldsTouched.add('regionExpressions');
    }
  }

  ir.spatialRhythmSystem = {
    ...ir.spatialRhythmSystem,
    sectionGapPx: Math.min(ir.spatialRhythmSystem.sectionGapPx, 8),
    cardGapPx: Math.min(ir.spatialRhythmSystem.cardGapPx, 6),
    denseRegionBehavior: 'translation-brief editorial density',
  };
  fieldsTouched.add('spatialRhythmSystem');

  ir.hash = fnv1aHex(JSON.stringify({ ...ir, hash: undefined, readiness: ir.readiness }));

  return {
    expressionIr: ir,
    changes: {
      objectsAdjusted,
      regionsAdjusted: Object.keys(ir.regionExpressions).length,
      fieldsTouched: [...fieldsTouched],
    },
  };
}
