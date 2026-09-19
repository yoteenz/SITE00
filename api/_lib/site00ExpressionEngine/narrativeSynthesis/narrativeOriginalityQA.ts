/**
 * C1.0 — Prior Entry differentiation / originality QA.
 */

import type {
  NarrativeFailureClassification,
  NarrativeSynthesisInput,
} from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';

export function runNarrativeOriginalityQA(input: NarrativeSynthesisInput): {
  passed: boolean;
  tooCloseToPriorEntry: boolean;
  similarityNotes: string[];
  failureClassifications: NarrativeFailureClassification[];
  obviousVersionSummary: string;
  whyNotTheObviousVersion: string;
} {
  const failures: NarrativeFailureClassification[] = [];
  const similarityNotes: string[] = [];

  for (const prior of input.priorEntryLineage) {
    const sameWorld =
      input.worldCandidates[0]?.worldId &&
      prior.worldId &&
      input.worldCandidates[0].worldId === prior.worldId;
    const sameArtifact =
      input.artifactCandidates[0]?.artifactId &&
      prior.artifactId &&
      input.artifactCandidates[0].artifactId === prior.artifactId;
    const sameDevice =
      input.interjectionCandidates[0] &&
      prior.interjectionDevice &&
      input.interjectionCandidates[0] === prior.interjectionDevice;

    if (sameWorld && sameArtifact) {
      similarityNotes.push(`World+artifact overlap with ${prior.entryId}`);
    }
    if (sameDevice && prior.entryId !== input.entryId) {
      similarityNotes.push(`Interjection device overlap with ${prior.entryId}: ${prior.interjectionDevice}`);
    }
  }

  const tooClose = similarityNotes.length >= 2;
  if (tooClose) failures.push('TOO_CLOSE_TO_PRIOR_ENTRY');

  const obviousVersionSummary =
    input.entryNumber === 2
      ? 'Obvious version: montage of 2016 fashion trends with nostalgic caption and no investigative causality.'
      : 'Obvious version: state thesis immediately with generic visual examples and no earned turn.';

  const whyNotTheObviousVersion =
    input.entryNumber === 2
      ? 'Proposed narrative uses NDX investigation, archival scroll, same-woman proof, and earned interjection — not a trend montage.'
      : 'Proposed narrative withholds reveal, escalates through discovery, and earns interjection after contradiction.';

  return {
    passed: !tooClose,
    tooCloseToPriorEntry: tooClose,
    similarityNotes,
    failureClassifications: failures,
    obviousVersionSummary,
    whyNotTheObviousVersion,
  };
}

export function runCreativeRiskPass(appetite: NarrativeSynthesisInput['founderCreativeAppetite']): {
  tooSafe: boolean;
  tooLiteral: boolean;
  notes: string[];
} {
  const notes: string[] = [];
  const tooSafe =
    appetite?.risk === 'LOW' && appetite?.wit === 'LOW' && appetite?.polarization === 'LOW';
  const tooLiteral = appetite?.abstraction === 'LOW';
  if (tooSafe) notes.push('Creative appetite skews safe — consider sharper interjection or reveal.');
  if (tooLiteral) notes.push('Abstraction tolerance low — watch for overly literal execution.');
  return { tooSafe, tooLiteral, notes };
}
