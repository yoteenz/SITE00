/**
 * Open evidence vocabulary — evidence appears because thesis requires it.
 */

export const EVIDENCE_VOCABULARY = [
  'screenshots',
  'interfaces',
  'receipts',
  'charts',
  'spreadsheets',
  'photographs',
  'archival imagery',
  'advertisements',
  'books',
  'magazines',
  'newspapers',
  'transcripts',
  'statistics',
  'maps',
  'diagrams',
  'messages',
  'comments',
  'posts',
  'timelines',
  'packaging',
  'tickets',
  'forms',
  'policies',
  'contracts',
  'labels',
  'research fragments',
  'historical artifacts',
  'cultural ephemera',
  'original illustrations',
  'generated explanatory graphics',
] as const;

export type EvidenceVocabularyItem = (typeof EVIDENCE_VOCABULARY)[number];

export function evidenceVocabularyOpen(): true {
  return true;
}

export function decorativeEvidenceFails(evidence: string[]): boolean {
  return evidence.length > 0 && evidence.every((e) => /for editorial|decorative|mood/i.test(e));
}
