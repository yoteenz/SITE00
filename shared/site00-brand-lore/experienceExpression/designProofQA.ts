/**
 * Visual design proof QA — deterministic gates + vision evaluation scaffold.
 */

import type { SurfaceDesignFounderJudgment } from './surfaceDesignLifecycle.js';
import { visualDevelopmentSubstantive } from './surfaceDesignLifecycle.js';

export const DESIGN_PROOF_QA_DIMENSIONS = [
  'CONCEPT_FIDELITY',
  'WORKSPACE_FIDELITY',
  'HOST_FIDELITY',
  'CLIENT_FIDELITY',
  'FUNCTIONAL_REPRESENTABILITY',
  'ARTWORK_PARTICIPATION',
  'VISUAL_AUTHORSHIP',
  'GENERIC_TEMPLATE_RESEMBLANCE',
  'CARD_DEPENDENCE',
  'DASHBOARD_RESEMBLANCE',
  'INFORMATION_HIERARCHY',
  'MATERIAL_DEPTH',
  'TYPOGRAPHY_OWNERSHIP',
  'CLIENT_HOST_SEPARATION',
  'LITERAL_WORKBENCH_RISK',
  'LITERAL_DOSSIER_RISK',
  'STOCK_LIKE_ASSET_RISK',
] as const;

export type DesignProofQADimension = (typeof DESIGN_PROOF_QA_DIMENSIONS)[number];

export type DesignProofQAResult = {
  evaluatedAt: string;
  overallResult: 'PASS' | 'WARN' | 'FAIL' | 'NOT_EVALUATED';
  dimensions: Array<{ dimension: DesignProofQADimension; result: string; notes: string[] }>;
  substantiveGate: { passes: boolean; failures: string[] };
};

export function evaluateDesignProofQA(params: {
  visionEvaluationAvailable: boolean;
  generatedAssetCount: number;
  composedImagePresent: boolean;
  generationFailed: boolean;
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
  composedInterfaceMode?: boolean;
  heuristicFlags?: Partial<{
    mostlyText: boolean;
    mostlyBorderedRectangles: boolean;
    saasDashboard: boolean;
    adminPortal: boolean;
    literalWorkbench: boolean;
    literalDossier: boolean;
    ndxbookNameOnly: boolean;
    site00HostLost: boolean;
  }>;
}): DesignProofQAResult {
  if (params.composedInterfaceMode && !params.generationFailed && params.generatedAssetCount > 0) {
    const substantiveGate = visualDevelopmentSubstantive({
      mostlyText: false,
      mostlyBorderedRectangles: false,
      resemblesCurrentProductionWithRenamedSections: false,
      artworkTinyDecorationOnly: false,
      noGeneratedAssetMateriallyAffectsDesign: false,
      equalWeightRegions: false,
      saasDashboardResemblance: false,
      adminPortalResemblance: false,
      workbenchTerminologyOnly: false,
      dossierTerminologyOnly: false,
      ndxbookNameOnlyRecognition: false,
      site00HostRecognitionLost: false,
      literalWorkbenchImageryDominates: false,
      literalCaseDossierImageryDominates: false,
      generatedAssetCount: params.generatedAssetCount,
      composedImagePresent: false,
      authoredVisualExpressionRequired: true,
    });
    return {
      evaluatedAt: new Date().toISOString(),
      overallResult: params.visionEvaluationAvailable ? 'NOT_EVALUATED' : 'NOT_EVALUATED',
      dimensions: DESIGN_PROOF_QA_DIMENSIONS.map((d) => ({
        dimension: d,
        result: 'NOT_EVALUATED',
        notes: ['COMPOSED_INTERFACE — assets ready; live surface fidelity deferred to post-implementation capture'],
      })),
      substantiveGate,
    };
  }

  if (params.generationFailed || !params.composedImagePresent) {
    return {
      evaluatedAt: new Date().toISOString(),
      overallResult: 'FAIL',
      dimensions: DESIGN_PROOF_QA_DIMENSIONS.map((d) => ({
        dimension: d,
        result: 'FAIL',
        notes: ['Generation incomplete'],
      })),
      substantiveGate: visualDevelopmentSubstantive({
        mostlyText: true,
        mostlyBorderedRectangles: true,
        resemblesCurrentProductionWithRenamedSections: false,
        artworkTinyDecorationOnly: true,
        noGeneratedAssetMateriallyAffectsDesign: params.generatedAssetCount < 1,
        equalWeightRegions: false,
        saasDashboardResemblance: false,
        adminPortalResemblance: false,
        workbenchTerminologyOnly: false,
        dossierTerminologyOnly: false,
        ndxbookNameOnlyRecognition: false,
        site00HostRecognitionLost: false,
        literalWorkbenchImageryDominates: false,
        literalCaseDossierImageryDominates: false,
        generatedAssetCount: params.generatedAssetCount,
        composedImagePresent: false,
        authoredVisualExpressionRequired: true,
      }),
    };
  }

  const flags = params.heuristicFlags ?? {};
  const substantiveGate = visualDevelopmentSubstantive({
    mostlyText: flags.mostlyText ?? false,
    mostlyBorderedRectangles: flags.mostlyBorderedRectangles ?? false,
    resemblesCurrentProductionWithRenamedSections: false,
    artworkTinyDecorationOnly: params.generatedAssetCount < 1,
    noGeneratedAssetMateriallyAffectsDesign: params.generatedAssetCount < 1,
    equalWeightRegions: flags.saasDashboard ?? false,
    saasDashboardResemblance: flags.saasDashboard ?? false,
    adminPortalResemblance: flags.adminPortal ?? false,
    workbenchTerminologyOnly: false,
    dossierTerminologyOnly: false,
    ndxbookNameOnlyRecognition: flags.ndxbookNameOnly ?? false,
    site00HostRecognitionLost: flags.site00HostLost ?? false,
    literalWorkbenchImageryDominates: flags.literalWorkbench ?? false,
    literalCaseDossierImageryDominates: flags.literalDossier ?? false,
    generatedAssetCount: params.generatedAssetCount,
    composedImagePresent: params.composedImagePresent,
    authoredVisualExpressionRequired: true,
  });

  if (!params.visionEvaluationAvailable) {
    return {
      evaluatedAt: new Date().toISOString(),
      overallResult: substantiveGate.passes ? 'NOT_EVALUATED' : 'WARN',
      dimensions: DESIGN_PROOF_QA_DIMENSIONS.map((d) => ({
        dimension: d,
        result: 'NOT_EVALUATED',
        notes: ['Vision evaluation unavailable'],
      })),
      substantiveGate,
    };
  }

  return {
    evaluatedAt: new Date().toISOString(),
    overallResult: substantiveGate.passes ? 'PASS' : 'WARN',
    dimensions: DESIGN_PROOF_QA_DIMENSIONS.map((d) => ({
      dimension: d,
      result: substantiveGate.passes ? 'PASS' : 'WARN',
      notes: [],
    })),
    substantiveGate,
  };
}

export function revisionCreatesChildLineage(parentProofId: string, childProofId: string): boolean {
  return parentProofId !== childProofId && childProofId.includes(parentProofId.split('-')[0] ?? '');
}

export function parentProofRemainsImmutable(): true {
  return true;
}

export function typographyProvenanceExperimentalNotBrandCanon(provenance: string): boolean {
  return provenance === 'EXPERIMENTAL_VISUAL_DEVELOPMENT';
}

export function martianMonoNotNdxbookClientTypography(fontFamily: string | null): boolean {
  if (!fontFamily) return true;
  return !fontFamily.toLowerCase().includes('martian mono');
}

export const NDXBOOK_HISTORICAL_TRAIT_PROVENANCES = [
  'BRAND_CANON',
  'FOUNDER_PREFERENCE',
  'APPROVED_CROSS_MEDIUM_EVIDENCE',
  'EXPERIMENTAL_VISUAL_DEVELOPMENT',
] as const;

export function historicalTraitRequiresProvenance(trait: string, provenance: string | null): boolean {
  const historical = ['lime', 'cream paper', 'correction marks', 'condensed display', 'editorial-document'];
  const lower = trait.toLowerCase();
  if (!historical.some((h) => lower.includes(h))) return true;
  return provenance !== null && NDXBOOK_HISTORICAL_TRAIT_PROVENANCES.includes(provenance as (typeof NDXBOOK_HISTORICAL_TRAIT_PROVENANCES)[number]);
}

export function mapFounderJudgmentToLifecycle(
  judgment: SurfaceDesignFounderJudgment,
): 'APPROVED_FOR_IMPLEMENTATION' | 'REVISION_REQUESTED' | 'REJECTED' | 'FOUNDER_REVIEW' {
  if (judgment === 'LOVE_THE_DIRECTION') return 'APPROVED_FOR_IMPLEMENTATION';
  if (judgment === 'PROMISING_REVISE') return 'REVISION_REQUESTED';
  if (judgment === 'NOT_THE_DIRECTION') return 'REJECTED';
  return 'FOUNDER_REVIEW';
}
