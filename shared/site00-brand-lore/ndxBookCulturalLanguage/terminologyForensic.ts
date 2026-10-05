/**
 * P0.5E.2 — Terminology forensic audit.
 * Semantic synchronization — not destructive string replacement.
 */

import type { TerminologyForensicEntry } from './types.js';

export const NDX_TERMINOLOGY_FORENSIC: TerminologyForensicEntry[] = [
  {
    term: 'SLIDE',
    classification: 'INTERNAL_PRODUCTION',
    publicAlias: 'PAGE',
    persistedIdentifier: true,
    notes: 'Campaign board / Experiment 01 artifact unit — internal contracts retain SLIDE',
  },
  {
    term: 'FILE',
    classification: 'MIGRATE_TO_BOOK',
    publicAlias: 'PAGE',
    persistedIdentifier: true,
    notes: 'Typography/metadata label from investigation era — public editorial uses PAGE',
  },
  {
    term: 'FILED',
    classification: 'MIGRATE_TO_BOOK',
    publicAlias: null,
    persistedIdentifier: false,
    notes: 'Not canonical public completion language — not used as persisted identifier',
  },
  {
    term: 'CASE',
    classification: 'HISTORICAL_IMMUTABLE',
    publicAlias: null,
    persistedIdentifier: true,
    notes: 'Historical experiment records only — immutable',
  },
  {
    term: 'CASE FILE',
    classification: 'HISTORICAL_IMMUTABLE',
    publicAlias: null,
    persistedIdentifier: true,
    notes: 'Historical experiment terminology — do not rename persisted records',
  },
  {
    term: 'CASE NUMBER',
    classification: 'HISTORICAL_IMMUTABLE',
    publicAlias: null,
    persistedIdentifier: true,
    notes: 'Historical experiment identifier — immutable',
  },
  {
    term: 'INVESTIGATION FILE',
    classification: 'HISTORICAL_IMMUTABLE',
    publicAlias: null,
    persistedIdentifier: true,
    notes: 'Historical experiment terminology',
  },
  {
    term: 'INVESTIGATION',
    classification: 'INTERNAL_PRODUCTION',
    publicAlias: null,
    persistedIdentifier: true,
    notes: 'Editorial IA / carousel narrative role — internal production',
  },
  {
    term: 'ARCHIVE',
    classification: 'STUDIO_WORLD_GENERIC',
    publicAlias: 'THE_INDEX',
    persistedIdentifier: true,
    notes: 'Generic lifecycle status (ARCHIVED) and vault copy — NDX public memory uses THE INDEX',
  },
  {
    term: 'POST',
    classification: 'STUDIO_WORLD_GENERIC',
    publicAlias: 'PAGE',
    persistedIdentifier: false,
    notes: 'Generic social term — NDX public editorial prefers PAGE where branded',
  },
  {
    term: 'SAVE',
    classification: 'STUDIO_WORLD_GENERIC',
    publicAlias: 'BOOKMARK',
    persistedIdentifier: false,
    notes: 'Platform-native SAVE retained in UI when usability requires; NDX behavior is BOOKMARK',
  },
  {
    term: 'UPDATE',
    classification: 'STUDIO_WORLD_GENERIC',
    publicAlias: 'ERRATA',
    persistedIdentifier: false,
    notes: 'Generic update language — self-correction public behavior is ERRATA',
  },
  {
    term: 'PART 2',
    classification: 'HISTORICAL_IMMUTABLE',
    publicAlias: 'NEXT_PAGE',
    persistedIdentifier: true,
    notes: 'Historical sequence label in experiment records — alias NEXT_PAGE for new public copy',
  },
  {
    term: 'SOURCE',
    classification: 'INTERNAL_PRODUCTION',
    publicAlias: 'FOOTNOTE',
    persistedIdentifier: true,
    notes: 'Cultural intelligence / evidence lineage — public provenance may surface as FOOTNOTE',
  },
  {
    term: 'SERIES',
    classification: 'MIGRATE_TO_BOOK',
    publicAlias: 'CHAPTER',
    persistedIdentifier: true,
    notes: 'Recurring editorial subject maps to CHAPTER',
  },
  {
    term: 'FOLLOW-UP',
    classification: 'MIGRATE_TO_BOOK',
    publicAlias: 'TURN_THE_PAGE',
    persistedIdentifier: true,
    notes: 'Story unit purpose FOLLOW_UP — public continuation is TURN THE PAGE / NEXT PAGE',
  },
  {
    term: 'PAGE',
    classification: 'PUBLIC_NDX',
    publicAlias: 'PAGE',
    persistedIdentifier: false,
    notes: 'Canonical public unit — fundamental published NDX thought/artifact',
  },
  {
    term: 'BOOKMARK',
    classification: 'PUBLIC_NDX',
    publicAlias: 'BOOKMARK',
    persistedIdentifier: false,
    notes: 'Canonical save/remember behavior',
  },
  {
    term: 'FLIP BACK',
    classification: 'PUBLIC_NDX',
    publicAlias: 'FLIP BACK',
    persistedIdentifier: false,
    notes: 'Callback to prior Page or cultural memory',
  },
  {
    term: 'DOG-EAR',
    classification: 'PUBLIC_NDX',
    publicAlias: 'DOG-EAR',
    persistedIdentifier: false,
    notes: 'Developing subject worth revisiting',
  },
  {
    term: 'ERRATA',
    classification: 'PUBLIC_NDX',
    publicAlias: 'ERRATA',
    persistedIdentifier: false,
    notes: 'Explicit correction / self-correction',
  },
  {
    term: 'MARGIN NOTE',
    classification: 'PUBLIC_NDX',
    publicAlias: 'MARGIN NOTE',
    persistedIdentifier: false,
    notes: 'Immediate conversational observation — Stories behavior',
  },
  {
    term: 'FOOTNOTE',
    classification: 'PUBLIC_NDX',
    publicAlias: 'FOOTNOTE',
    persistedIdentifier: false,
    notes: 'Supporting context, provenance, source detail',
  },
  {
    term: 'ADD IT TO THE BOOK',
    classification: 'PUBLIC_NDX',
    publicAlias: 'ADD IT TO THE BOOK',
    persistedIdentifier: false,
    notes: 'Community submission behavior — organic only',
  },
];

export function getTerminologyForensic(): TerminologyForensicEntry[] {
  return [...NDX_TERMINOLOGY_FORENSIC];
}

export function historicalIdentifiersPreserved(): true {
  return true;
}

export function filedNotUsedAsPublicCompletionLanguage(): true {
  return true;
}

export function getPublicAliasForTerm(term: string): string | null {
  const entry = NDX_TERMINOLOGY_FORENSIC.find((e) => e.term.toUpperCase() === term.toUpperCase());
  return entry?.publicAlias ?? null;
}

export function classifyTerm(term: string): TerminologyForensicEntry | null {
  return NDX_TERMINOLOGY_FORENSIC.find((e) => e.term.toUpperCase() === term.toUpperCase()) ?? null;
}
