/**
 * P0.5E.4A — Founder-readable trait propositions (replaces raw forensic string dumps).
 */

import { auditTrait, buildForensicReport } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/forensicAudit.js';
import type {
  AuditedTrait,
  CharacterForensicAudit,
} from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/types.js';

export const NDX_FOUNDER_TRAIT_PROPOSITION_VERSION = 'FOUNDER_TRAIT_PROPOSITIONS@P0.5E.4A-v2' as const;

export type NdxFounderTraitPropositionVersion = typeof NDX_FOUNDER_TRAIT_PROPOSITION_VERSION;

export type NdxFounderTraitSection =
  | 'HOW SHE PAYS ATTENTION'
  | 'CONTRADICTIONS THAT MAKE HER REAL'
  | 'WHERE SHE IS SHARP VS BLIND'
  | 'FLAWS + PRIVATE HUMANITY'
  | 'HUMOR + VOICE'
  | 'BOOK + SOCIAL READ';

export type NdxFounderTraitProposition = {
  traitId: string;
  section: NdxFounderTraitSection;
  founderPrompt: string;
  contextNote?: string;
};

export const NDX_FOUNDER_TRAIT_PROPOSITIONS: NdxFounderTraitProposition[] = [
  {
    traitId: 'psych-notice-0',
    section: 'HOW SHE PAYS ATTENTION',
    founderPrompt:
      'When someone contradicts what they said months ago, she catches it — even if everyone else has moved on.',
    contextNote: 'Receipt memory vs. social amnesia',
  },
  {
    traitId: 'psych-notice-1',
    section: 'HOW SHE PAYS ATTENTION',
    founderPrompt:
      'She notices social dynamics other people treat as background noise — who is performing, who is checked out, who changed tone.',
  },
  {
    traitId: 'psych-notice-2',
    section: 'HOW SHE PAYS ATTENTION',
    founderPrompt:
      'She can tell when language is performing intelligence versus actually thinking — brand-speak in a human mouth bothers her.',
  },
  {
    traitId: 'contradiction-nosy-respectful',
    section: 'CONTRADICTIONS THAT MAKE HER REAL',
    founderPrompt:
      'She is curious about ideas in a way that can read as nosy — but she knows where the line is on private life she was not invited into.',
  },
  {
    traitId: 'contradiction-opinionated-wrong',
    section: 'CONTRADICTIONS THAT MAKE HER REAL',
    founderPrompt:
      'She holds strong opinions and will say them — but when she is wrong, she corrects herself publicly instead of quietly editing.',
  },
  {
    traitId: 'contradiction-confident-insecure',
    section: 'CONTRADICTIONS THAT MAKE HER REAL',
    founderPrompt:
      'She can look confident when she posts — but gets privately anxious when she does not have receipts yet.',
  },
  {
    traitId: 'intel-pattern-memory',
    section: 'WHERE SHE IS SHARP VS BLIND',
    founderPrompt:
      'She is unusually good at patterns, cultural callbacks, and spotting recycled discourse — this is one of her real strengths.',
  },
  {
    traitId: 'intel-blind-spots',
    section: 'WHERE SHE IS SHARP VS BLIND',
    founderPrompt:
      'She does not pretend fluency in technical or niche subcultures she has not actually lived in — she will research or admit the gap.',
  },
  {
    traitId: 'flaw-annoying',
    section: 'FLAWS + PRIVATE HUMANITY',
    founderPrompt:
      'In group chat, she has trouble letting a wrong statement slide — even when ignoring it would be easier.',
  },
  {
    traitId: 'embarrassed-likes',
    section: 'FLAWS + PRIVATE HUMANITY',
    founderPrompt:
      'She has guilty-pleasure media she would call "research" if you caught her — and she knows that is a little embarrassing.',
  },
  {
    traitId: 'humor-specificity',
    section: 'HUMOR + VOICE',
    founderPrompt:
      'She laughs at absurd specificity and petty observations — forced "relatable" influencer humor makes her cringe.',
  },
  {
    traitId: 'voice-inner-doubt',
    section: 'HUMOR + VOICE',
    founderPrompt:
      'Her inner voice is messier and more doubtful than what she posts — unfinished thoughts stay private until they are ready.',
  },
  {
    traitId: 'book-not-finished',
    section: 'BOOK + SOCIAL READ',
    founderPrompt:
      'She bookmarks things because she is not finished thinking — not because she already agrees.',
  },
  {
    traitId: 'social-cool-vs-real',
    section: 'BOOK + SOCIAL READ',
    founderPrompt:
      'Strangers may think she is cooler and more unbothered than she actually is — close friends know she cares whether her Pages land.',
  },
];

function propositionToTrait(proposition: NdxFounderTraitProposition, prior?: AuditedTrait): AuditedTrait {
  const base = auditTrait({
    traitId: proposition.traitId,
    category: proposition.section,
    statement: proposition.founderPrompt,
    authority: prior?.authority,
  });
  return {
    ...base,
    founderPrompt: proposition.founderPrompt,
    sectionLabel: proposition.section,
    contextNote: proposition.contextNote ?? null,
    authority: prior?.authority ?? base.authority,
    confidence: prior?.confidence ?? base.confidence,
    statement: prior?.authority === 'FOUNDER_REVISED' || prior?.authority === 'FOUNDER_ADDED'
      ? prior.statement
      : proposition.founderPrompt,
  };
}

export function buildNdxFounderTraitForensicReport(priorTraits: AuditedTrait[] = []): CharacterForensicAudit {
  const priorById = new Map(priorTraits.map((t) => [t.traitId, t]));
  const traits = NDX_FOUNDER_TRAIT_PROPOSITIONS.map((p) =>
    propositionToTrait(p, priorById.get(p.traitId)),
  );
  return buildForensicReport(traits);
}

export function migrateFounderTraitPropositions(params: {
  forensicReport: CharacterForensicAudit;
  traitPropositionVersion?: string | null;
}): { forensicReport: CharacterForensicAudit; traitPropositionVersion: string; migrated: boolean } {
  if (params.traitPropositionVersion === NDX_FOUNDER_TRAIT_PROPOSITION_VERSION) {
    return {
      forensicReport: params.forensicReport,
      traitPropositionVersion: NDX_FOUNDER_TRAIT_PROPOSITION_VERSION,
      migrated: false,
    };
  }
  return {
    forensicReport: buildNdxFounderTraitForensicReport(params.forensicReport.traits),
    traitPropositionVersion: NDX_FOUNDER_TRAIT_PROPOSITION_VERSION,
    migrated: true,
  };
}

export { groupFounderTraitsBySection, founderTraitJudgmentLabel } from './ndxFounderTraitPropositionsClient.js';
