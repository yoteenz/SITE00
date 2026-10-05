/**
 * Founder preference evidence — patterns, not canon.
 */

import type {
  CreativeRevisionSpec,
  FounderCreativePreferenceEvidence,
  PreferenceLearningScope,
  RevisionCategoryKey,
} from './revisionTypes.js';

export function extractPreferenceEvidenceFromRevision(
  spec: CreativeRevisionSpec,
  brandSlug: string,
  projectId: string,
): FounderCreativePreferenceEvidence[] {
  const ts = new Date().toISOString();
  const evidence: FounderCreativePreferenceEvidence[] = [];

  for (const [cat, note] of Object.entries(spec.categoryNotes)) {
    if (!note?.trim()) continue;
    evidence.push({
      evidenceId: `evidence-${spec.revisionId}-${cat}`,
      brandSlug,
      projectId,
      sourceAssetId: spec.parentAssetId,
      revisionId: spec.revisionId,
      category: cat as RevisionCategoryKey,
      observation: note.trim(),
      confidence: 0.6,
      occurrenceCount: 1,
      learningScope: 'BRAND_SPECIFIC',
      firstObservedAt: ts,
      lastObservedAt: ts,
    });
  }

  if (spec.founderOriginalNote.trim()) {
    evidence.push({
      evidenceId: `evidence-${spec.revisionId}-overall`,
      brandSlug,
      projectId,
      sourceAssetId: spec.parentAssetId,
      revisionId: spec.revisionId,
      category: 'other',
      observation: spec.founderOriginalNote.trim(),
      confidence: 0.5,
      occurrenceCount: 1,
      learningScope: 'BRAND_SPECIFIC',
      firstObservedAt: ts,
      lastObservedAt: ts,
    });
  }

  return evidence;
}

export type AggregatedPreference = {
  category: string;
  observation: string;
  occurrenceCount: number;
  brandSlug: string;
  suggestion: string;
};

export function aggregateFounderCreativePreferenceEvidence(
  records: FounderCreativePreferenceEvidence[],
  scope: PreferenceLearningScope = 'BRAND_SPECIFIC',
): AggregatedPreference[] {
  const filtered = records.filter((r) => r.learningScope === scope);
  const map = new Map<string, AggregatedPreference>();

  for (const r of filtered) {
    const key = `${r.category}::${r.observation.toLowerCase()}`;
    const existing = map.get(key);
    if (existing) {
      existing.occurrenceCount += r.occurrenceCount;
    } else {
      map.set(key, {
        category: String(r.category),
        observation: r.observation,
        occurrenceCount: r.occurrenceCount,
        brandSlug: r.brandSlug,
        suggestion: 'POSSIBLE EMERGING PREFERENCE — requires explicit founder promotion to Brand Canon',
      });
    }
  }

  return [...map.values()].filter((a) => a.occurrenceCount >= 2).sort((a, b) => b.occurrenceCount - a.occurrenceCount);
}

export function preferenceIsNotCanon(_evidence: FounderCreativePreferenceEvidence): true {
  return true;
}
