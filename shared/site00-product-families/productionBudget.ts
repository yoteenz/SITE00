/**
 * Family production budget contract (P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1).
 *
 * Data contract only — no billing dashboard. From the second family of a project onward every family production
 * record tracks credits before/after, spend by generation kind, cumulative spend and safe-ceiling remaining.
 */

export type GenerationSettings = {
  model: string;
  resolution: string;
  aspect: string;
  autoEnhance: boolean;
  creditsPerGeneration: number;
};

export type ProjectBudgetBaseline = {
  projectId: string;
  generation: GenerationSettings;
  /** Price of one credit in USD. */
  creditPriceUsd: number;
  /** Purchase unit as observed (e.g. 5,000 credits = $15). */
  purchaseUnit: { credits: number; usd: number };
  baseEstimateCredits: number;
  realisticRangeCredits: [number, number];
  safeCeilingCredits: number;
};

export type FamilyBudgetRecord = {
  familyId: string;
  /** Families before the budget contract existed record what is known and flag the rest. */
  tracking: 'TRACKED' | 'LEGACY_PARTIAL';
  creditsBefore: number | null;
  creditsAfter: number | null;
  familyCredits: number;
  assetGenerations: number;
  screenGenerations: number;
  interactionGenerations: number;
  recoveryGenerations: number;
  cumulativeCredits: number;
  safeCeilingRemaining: number;
  notes?: string;
};

export const generationCostUsd = (b: ProjectBudgetBaseline) => +(b.generation.creditsPerGeneration * b.creditPriceUsd).toFixed(4);
export const creditsToUsd = (b: ProjectBudgetBaseline, credits: number) => +(credits * b.creditPriceUsd).toFixed(2);

/** Builds a family record; cumulative + ceiling come from the project's prior records. */
export function buildFamilyBudgetRecord(
  baseline: ProjectBudgetBaseline,
  prior: readonly FamilyBudgetRecord[],
  input: Omit<FamilyBudgetRecord, 'familyCredits' | 'cumulativeCredits' | 'safeCeilingRemaining'> & { familyCredits?: number },
): FamilyBudgetRecord {
  const derived =
    input.creditsBefore != null && input.creditsAfter != null ? Math.max(0, input.creditsBefore - input.creditsAfter) : null;
  const familyCredits = input.familyCredits ?? derived ?? 0;
  if (input.tracking === 'TRACKED' && (input.creditsBefore == null || input.creditsAfter == null)) {
    throw new Error(`${input.familyId}: TRACKED budget records require creditsBefore and creditsAfter`);
  }
  const cumulativeCredits = prior.reduce((sum, r) => sum + r.familyCredits, 0) + familyCredits;
  return { ...input, familyCredits, cumulativeCredits, safeCeilingRemaining: baseline.safeCeilingCredits - cumulativeCredits };
}
