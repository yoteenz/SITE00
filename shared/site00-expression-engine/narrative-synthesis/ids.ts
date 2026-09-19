/**
 * C1.0 — Narrative Synthesis IDs.
 */

export const ENTRY_002_NARRATIVE_SYNTHESIS_001_ID =
  'NDX-ENTRY-002-NARRATIVE-SYNTHESIS-001' as const;

export const ENTRY_002_NARRATIVE_SYNTHESIS_001_VERSION = '001' as const;

export function buildNarrativeSynthesisId(entryId: string, version: string): string {
  const slug = entryId.replace(/^entry-/i, '').toUpperCase();
  return `NDX-ENTRY-${slug}-NARRATIVE-SYNTHESIS-${version.padStart(3, '0')}`;
}
