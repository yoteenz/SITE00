/**
 * P0.VR.PAGE-CONCEPT-GPT2-CANONICAL-VIEWPORT-FAMILY1R1
 */

export const PAGE_CONCEPT_CANONICAL_PIPELINE_ID = 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE' as const;
export const PAGE_CONCEPT_LEGACY_PIPELINE_ID = 'LEGACY_NBP_CONCEPT_PIPELINE' as const;

export type PageConceptPipelineLineageId =
  | typeof PAGE_CONCEPT_CANONICAL_PIPELINE_ID
  | typeof PAGE_CONCEPT_LEGACY_PIPELINE_ID;

export function pageConceptInitialSpendNote(): string {
  return '1 CGPT · 3 GPT2 MOBILE CONCEPTS (staged approval gates apply)';
}

export function pageConceptTabletDesktopSpendNote(): string {
  return '1 GPT2 TABLET INTERPRETATION · 1 GPT2 DESKTOP INTERPRETATION';
}

export function pageConceptShellMicroSummary(): string {
  return '1 CGPT + 3 GPT2 MOBILE · VIEWPORT FAMILY → TWIN';
}

export function inferPageConceptPipelineLineage(input: {
  generationJobs: readonly { provider?: string; artifactId?: string }[];
  pipelineLineage?: PageConceptPipelineLineageId | null;
}): PageConceptPipelineLineageId {
  const hasGpt2Mobile = input.generationJobs.some((j) => j.provider === 'GPT2_MOBILE');
  if (hasGpt2Mobile) return PAGE_CONCEPT_CANONICAL_PIPELINE_ID;
  if (input.pipelineLineage) return input.pipelineLineage;
  const hasNbp = input.generationJobs.some((j) => j.provider === 'NBP' || j.artifactId?.includes('RENDITION_'));
  return hasNbp ? PAGE_CONCEPT_LEGACY_PIPELINE_ID : PAGE_CONCEPT_CANONICAL_PIPELINE_ID;
}

export function pageConceptLegacyNbpEnabled(): boolean {
  return process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP === 'true';
}

/** Canonical GPT2 viewport-family pipeline is default; legacy NBP requires explicit env. */
/** When true, a CGPT review stop should chain into GPT2 mobile in the same confirmed run. */
export function pageConceptChainGpt2MobileAfterCgptReviewGate(): boolean {
  return !pageConceptLegacyNbpEnabled();
}

export function pageConceptCanonicalNbpDisabled(): boolean {
  return !pageConceptLegacyNbpEnabled();
}
