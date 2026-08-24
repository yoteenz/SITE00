/**
 * Internal label quarantine — contract language must not leak to public artifacts.
 */

import type { PublicMetadataEligibility } from './types.js';

/** Labels that must never appear verbatim on public marketing artifacts. */
export const QUARANTINED_INTERNAL_LABELS = [
  'CHARACTER BEAT',
  'PRIMARY EDITORIAL IDEA',
  'WHAT NDX NOTICED',
  'WHAT HAPPENED',
  'WHY NOW',
  'CONTENT THESIS',
  'CULTURAL PARTICIPATION',
  'HUMOR MECHANISM',
  'MAKER EVIDENCE',
  'CONTROLLED MISBEHAVIOR',
  'ART BOARD',
  'MATERIAL DENSITY',
  'CHARACTER DENSITY',
  'VIEWER NOTICES FIRST',
  'VIEWER-FIRST READ',
  'SOURCE ROLE',
  'TRACE CLASS',
  'NDX ADAPTER',
  'MARKETING EXPRESSION',
  'SELF_AWARE_COMMENT',
  'ANNOTATION',
  'EVIDENCE FOR',
  'ADDED:',
  'SELECTION',
  'CORRECTION',
  'WHY THIS ART BOARD',
] as const;

export type QuarantinedInternalLabel = (typeof QUARANTINED_INTERNAL_LABELS)[number];

const PUBLIC_METADATA_NATIVE = [
  'FILE',
  'DATE',
  'SOURCE',
  'ARCHIVE',
  'ISSUE',
  'RECEIPT',
  'THEN',
  'NOW',
  'EVIDENCE',
  'NOTE',
  'REVISION',
] as const;

export function classifyMetadataEligibility(label: string): PublicMetadataEligibility {
  const upper = label.toUpperCase().trim();
  if (QUARANTINED_INTERNAL_LABELS.some((q) => upper.includes(q))) return 'INTERNAL_ONLY';
  if (PUBLIC_METADATA_NATIVE.some((p) => upper.includes(p))) return 'PUBLIC_NATIVE';
  return 'PUBLIC_WITH_TRANSLATION';
}

export function scanTextForQuarantinedLabels(text: string): QuarantinedInternalLabel[] {
  const upper = text.toUpperCase();
  return QUARANTINED_INTERNAL_LABELS.filter((label) => upper.includes(label));
}

export function internalLabelLeakFails(text: string): boolean {
  return scanTextForQuarantinedLabels(text).length > 0;
}

export function internalLabelsValidInContracts(): true {
  return true;
}

export function quarantinedLabelCannotAppearPublicly(label: QuarantinedInternalLabel): boolean {
  return QUARANTINED_INTERNAL_LABELS.includes(label);
}
