import type { GenericFallbackAudit, GenericFallbackInventoryEntry } from './implementationExpressionTypes.js';

/** Inventory of R8M2 compiler defaults (pre-expression-IR). */
export function inventoryPreR8M2R1GenericFallbacks(): GenericFallbackAudit {
  const entries: GenericFallbackInventoryEntry[] = [
    { id: 'r8m2-default-black-surface', location: 'materialStylesForSurface', property: 'background', classification: 'PROJECT_CONTRACT_DERIVED', critical: false },
    { id: 'r8m2-default-lime-primary', location: 'materialStylesForControl:PRIMARY', property: 'background', classification: 'PROJECT_CONTRACT_DERIVED', critical: true },
    { id: 'r8m2-default-flex-column', location: 'visualImplementationTranslatorR8M2', property: 'display', classification: 'GENERIC_FALLBACK', critical: false },
    { id: 'r8m2-default-section-gap-6', location: 'NDXBOOK_IMPLEMENTATION_SPATIAL_RHYTHM', property: 'sectionGapPx', classification: 'PROJECT_CONTRACT_DERIVED', critical: true },
    { id: 'r8m2-default-border-radius-4', location: 'materialStylesForSurface', property: 'borderRadius', classification: 'GENERIC_FALLBACK', critical: true },
    { id: 'r8m2-default-generic-card', location: 'componentMapping:ARTIFACT', property: 'componentName', classification: 'GENERIC_FALLBACK', critical: true },
    { id: 'r8m2-default-font-scale', location: 'typographyStylesForRole', property: 'fontSize', classification: 'PROJECT_CONTRACT_DERIVED', critical: true },
    { id: 'r8m2-default-image-fit', location: 'resolveCanonicalRuntimeAsset', property: 'objectFit', classification: 'GENERIC_FALLBACK', critical: true },
    { id: 'r8m2-visual-style-source-project', location: 'translateVisualImplementationR8M2', property: 'visualStyleSource', classification: 'GENERIC_FALLBACK', critical: true },
    { id: 'r8m2-void-authorities', location: 'translateVisualImplementationR8M2', property: 'authorities', classification: 'GENERIC_FALLBACK', critical: true },
  ];
  const criticalGenericFallbacks = entries.filter(
    (e) => e.critical && e.classification === 'GENERIC_FALLBACK',
  );
  return { entries, criticalGenericFallbacks };
}

export function inventoryExpressionCompileFallbacks(input: {
  objectExpressions: Array<{ objectId: string; styleSources: Record<string, string> }>;
  visualImportanceByObject: Map<string, string>;
}): GenericFallbackAudit {
  const entries: GenericFallbackInventoryEntry[] = [];
  for (const obj of input.objectExpressions) {
    for (const [prop, source] of Object.entries(obj.styleSources)) {
      const critical = input.visualImportanceByObject.get(obj.objectId) === 'CRITICAL';
      entries.push({
        id: `expr-${obj.objectId}-${prop}`,
        location: 'ImplementationExpressionObject',
        property: prop,
        classification: source as GenericFallbackInventoryEntry['classification'],
        critical,
      });
    }
  }
  const criticalGenericFallbacks = entries.filter(
    (e) => e.critical && e.classification === 'GENERIC_FALLBACK',
  );
  return { entries, criticalGenericFallbacks };
}
