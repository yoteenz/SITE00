/**
 * Client-safe founder trait UI helpers (no node:crypto imports).
 */

import type { AuditedTrait } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/types.js';

const TRAIT_SECTION_ORDER = [
  'HOW SHE PAYS ATTENTION',
  'CONTRADICTIONS THAT MAKE HER REAL',
  'WHERE SHE IS SHARP VS BLIND',
  'FLAWS + PRIVATE HUMANITY',
  'HUMOR + VOICE',
  'BOOK + SOCIAL READ',
] as const;

export function groupFounderTraitsBySection(traits: AuditedTrait[]): { section: string; traits: AuditedTrait[] }[] {
  return TRAIT_SECTION_ORDER.map((section) => ({
    section,
    traits: traits.filter((t) => (t.sectionLabel ?? t.category) === section),
  })).filter((g) => g.traits.length > 0);
}

export function founderTraitJudgmentLabel(authority: AuditedTrait['authority']): string | null {
  switch (authority) {
    case 'FOUNDER_CONFIRMED':
      return 'You confirmed this';
    case 'FOUNDER_REVISED':
      return 'You revised this';
    case 'FOUNDER_ADDED':
      return 'You added your version';
    case 'FOUNDER_REJECTED':
      return 'You rejected this';
    case 'UNRESOLVED':
      return 'Not sure yet';
    default:
      return null;
  }
}
