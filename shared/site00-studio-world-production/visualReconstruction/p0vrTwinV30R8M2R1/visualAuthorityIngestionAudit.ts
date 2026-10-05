import type { MobileTwinCompositionState, MobileTwinPackage } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { ImplementationAuthorityBundle } from '../p0vrTwinV30R8M1/resolveImplementationAuthorities.js';
import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import { ingestAuthorityImageContent, ingestionProviderMetadata } from './authorityContentIngestion.js';
import { inventoryPreR8M2R1GenericFallbacks } from './genericFallbackInventory.js';
import type { VisualAuthorityIngestionAuditReceipt } from './implementationExpressionTypes.js';
import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../p0vrTwinV30/constants.js';

/** Documents R8M1/R8M2 path: URIs resolved; translator voided authorities; no vision model. */
export const PRE_R8M2R1_TRANSLATOR_BEHAVIOR = {
  actualReachCompile: 'resolveImplementationAuthorities → actualRenderUri string only',
  blueprintReachCompile: 'resolveImplementationAuthorities → blueprintRenderUri string only',
  pixelAnalysisAtCompile: false,
  translatorConsumesAuthorities: false,
  primaryVisualInput: 'objectType + PROJECT_CONTEXT material/typography defaults',
} as const;

export async function buildVisualAuthorityIngestionAuditReceipt(input: {
  authorities: ImplementationAuthorityBundle;
  composition: MobileTwinCompositionState;
  bundle: MobileStructuredArtifactBundle;
  pkg: MobileTwinPackage;
}): Promise<VisualAuthorityIngestionAuditReceipt> {
  const meta = ingestionProviderMetadata();
  const actual = await ingestAuthorityImageContent({
    uri: input.authorities.actualRenderUri,
    specWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    specHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
  });
  const blueprint = await ingestAuthorityImageContent({
    uri: input.authorities.blueprintRenderUri,
    specWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    specHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
  });

  const fallbackInventory = inventoryPreR8M2R1GenericFallbacks();
  const blockers: string[] = [];
  if (!actual.contentIngested) blockers.push('ACTUAL_AUTHORITY_CONTENT_NOT_INGESTED');
  if (!blueprint.contentIngested) blockers.push('BLUEPRINT_AUTHORITY_CONTENT_NOT_INGESTED');
  if (!actual.visuallyAnalyzed) blockers.push('ACTUAL_AUTHORITY_NOT_VISUALLY_ANALYZED');
  if (!blueprint.visuallyAnalyzed) blockers.push('BLUEPRINT_AUTHORITY_NOT_VISUALLY_ANALYZED');

  const conclusion =
    blockers.length === 0 ?
      'Authority images ingested and composition-anchored pixel analysis available for expression IR.'
    : 'Authority reference URIs present; full ingestion/analysis blocked until image bytes load.';

  return {
    actualAuthorityAvailable: actual.referenceAvailable,
    actualAuthorityBytesLoaded: actual.contentIngested,
    actualAuthorityAnalyzed: actual.visuallyAnalyzed,
    blueprintAuthorityAvailable: blueprint.referenceAvailable,
    blueprintAuthorityBytesLoaded: blueprint.contentIngested,
    blueprintAuthorityAnalyzed: blueprint.visuallyAnalyzed,
    compositionStateLoaded: Boolean(input.composition?.id),
    surgicalBlueprintLoaded: Boolean(input.bundle?.surgicalBlueprint?.id),
    projectContextLoaded: Boolean(input.pkg.projectCreativeContextVersion || input.authorities.projectContextVersion),
    visualPerceptionStageExists: true,
    typographyExtractionExists: true,
    spatialRelationshipExtractionExists: true,
    materialExtractionExists: true,
    stateTreatmentExtractionExists: true,
    assetTreatmentExtractionExists: true,
    genericFallbackCount: fallbackInventory.entries.filter((e) => e.classification === 'GENERIC_FALLBACK').length,
    hardcodedStyleDefaultCount: fallbackInventory.entries.length,
    unsupportedVisualPropertyCount: 0,
    conclusion,
    blockers,
    actualReference: actual,
    blueprintReference: blueprint,
    ingestionProvider: meta.provider,
    ingestionAnalysisMode: meta.analysisMode,
    ingestionVersion: meta.version,
  };
}
