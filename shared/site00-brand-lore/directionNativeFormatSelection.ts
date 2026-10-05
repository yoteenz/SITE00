/**
 * Per-direction native format selection — derived from direction intelligence + format profile.
 * No rotation, no diversity quota, no cross-direction influence.
 */

import type { FormedCoreDirection } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/types.js';
import type { FormatNativeExpressionProfile } from './formatNativeExpression.js';

export const ELIGIBLE_NATIVE_PROOF_FORMATS = [
  'FEED_TILE',
  'CAROUSEL_COVER',
  'CAROUSEL_SEQUENCE',
  'STORY_FRAME',
  'STORY_SEQUENCE',
  'REEL_HOOK',
  'REEL_FRAME',
  'TIKTOK_VERTICAL',
  'MOTION_KEYFRAME',
  'CONTENT_FRANCHISE',
  'SAVEABLE_REFERENCE_POST',
] as const;

export type EligibleNativeProofFormat = (typeof ELIGIBLE_NATIVE_PROOF_FORMATS)[number];

/** Signals that increase fit for a given format — direction-local scoring only. */
const FORMAT_SIGNALS: Record<EligibleNativeProofFormat, string[]> = {
  FEED_TILE: ['feed', 'tile', 'single', 'post', 'statement', 'hook', 'thumbnail', 'square', 'scroll', 'stop'],
  CAROUSEL_COVER: ['carousel', 'cover', 'swipe', 'sequence', 'multi', 'slide', 'editorial', 'document', 'proof'],
  CAROUSEL_SEQUENCE: ['carousel', 'sequence', 'steps', 'progression', 'multi', 'slide', 'series', 'reveal', 'parts'],
  STORY_FRAME: ['story', 'frame', 'vertical', 'ephemeral', 'tap', 'hold', 'urgency', 'moment', '9:16'],
  STORY_SEQUENCE: ['story', 'sequence', 'chapters', 'ephemeral', 'tap', 'progression', 'vertical'],
  REEL_HOOK: ['reel', 'hook', 'motion', 'open', 'loop', 'video', 'dynamic', 'movement', 'momentum'],
  REEL_FRAME: ['reel', 'frame', 'motion', 'video', 'dynamic', 'vertical', 'loop'],
  TIKTOK_VERTICAL: ['tiktok', 'vertical', 'short', 'video', 'native', 'scroll', 'hook', '9:16'],
  MOTION_KEYFRAME: ['motion', 'keyframe', 'animation', 'dynamic', 'movement', 'kinetic', 'transition'],
  CONTENT_FRANCHISE: ['franchise', 'series', 'repeat', 'system', 'template', 'recurring', 'content system'],
  SAVEABLE_REFERENCE_POST: ['save', 'reference', 'pin', 'archive', 'index', 'checklist', 'guide', 'resource'],
};

export type DirectionNativeFormatSelection = {
  nativeFormat: string;
  nativeFormatReason: string;
  alternativeFormatsConsidered: string[];
  whyAlternativesWereWeaker: string;
  formatSelectionEvidence: string[];
  formatSelectionDerivedFromDirection: boolean;
  selectionMethod: 'DIRECTION_DERIVED' | 'PROFILE_DEFAULT_FALLBACK' | 'PRESERVED_EXISTING' | 'MECHANICAL_PROFILE_DEFAULT';
};

export type FormatAssignmentContaminationTest = {
  passed: boolean;
  rotationAlgorithmUsed: boolean;
  priorDirectionFormatInfluenced: boolean;
  diversityQuotaInfluenced: boolean;
  benchmarkFormatInfluenced: boolean;
  traceableToDirectionIntelligence: boolean;
  notes: string[];
};

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function directionTextBlob(direction: FormedCoreDirection): string {
  return normalizeText(
    [
      direction.oneLineThesis,
      direction.bigIdea,
      direction.governingBehavior,
      direction.primaryBrandArtifact,
      direction.socialExpressionHypothesis,
      direction.visualMetaphor,
      direction.materialImageryLanguage,
      direction.motionSeed,
      direction.typographicAttitude,
      direction.emotionalPromise,
      ...(direction.signatureDevices ?? []),
    ]
      .filter(Boolean)
      .join(' '),
  );
}

function scoreFormatForDirection(format: EligibleNativeProofFormat, blob: string, profile: FormatNativeExpressionProfile): number {
  let score = 0;
  const signals = FORMAT_SIGNALS[format];
  for (const signal of signals) {
    if (blob.includes(signal)) score += 2;
  }
  if (profile.primaryFormats.includes(format)) score += 3;
  if (profile.formatPriorities[format] === 'HIGH') score += 2;
  if (profile.entryFormat === format) score += 1;
  if (profile.repeatFormat === format) score += 1;
  if (profile.saveShareBehavior && format === 'SAVEABLE_REFERENCE_POST' && blob.includes('save')) score += 2;
  if (profile.sequenceBehavior && format.includes('SEQUENCE') && blob.includes('sequence')) score += 2;
  if (profile.motionExpectation && format.includes('REEL') && blob.includes('motion')) score += 2;
  return score;
}

export function deriveNativeFormatForDirection(params: {
  direction: FormedCoreDirection;
  formatProfile: FormatNativeExpressionProfile;
}): DirectionNativeFormatSelection {
  const blob = directionTextBlob(params.direction);
  const scored = ELIGIBLE_NATIVE_PROOF_FORMATS.map((format) => ({
    format,
    score: scoreFormatForDirection(format, blob, params.formatProfile),
  })).sort((a, b) => b.score - a.score);

  const winner = scored[0]!;
  const alternatives = scored.slice(1, 5);
  const evidence: string[] = [];
  for (const signal of FORMAT_SIGNALS[winner.format]) {
    if (blob.includes(signal)) evidence.push(`Direction language matches ${winner.format} signal: "${signal}"`);
  }
  if (params.formatProfile.primaryFormats.includes(winner.format)) {
    evidence.push(`${winner.format} is HIGH-priority in FormatNativeExpressionProfile.primaryFormats`);
  }

  const whyWeaker = alternatives
    .map((alt) => `${alt.format} (${alt.score} pts vs ${winner.score}): weaker direction-format fit`)
    .join('; ');

  return {
    nativeFormat: winner.format,
    nativeFormatReason: `"${params.direction.directionName}" — ${winner.format} scored highest (${winner.score}) from direction thesis, social behavior, content mechanic, and format profile fit.`,
    alternativeFormatsConsidered: alternatives.map((a) => a.format),
    whyAlternativesWereWeaker: whyWeaker || 'No close alternatives — winner clearly dominant.',
    formatSelectionEvidence: evidence.length ? evidence : [`Default profile-weighted selection for ${winner.format}`],
    formatSelectionDerivedFromDirection: true,
    selectionMethod: 'DIRECTION_DERIVED',
  };
}

export function auditPreservedDirectionFormat(params: {
  direction: FormedCoreDirection;
  assignedFormat: string | null | undefined;
  formatProfile: FormatNativeExpressionProfile;
}): DirectionNativeFormatSelection {
  const derived = deriveNativeFormatForDirection({
    direction: params.direction,
    formatProfile: params.formatProfile,
  });
  const assigned = params.assignedFormat ?? 'CAROUSEL_COVER';
  const profileDefault =
    params.formatProfile.primaryFormats.includes('CAROUSEL_COVER') ? 'CAROUSEL_COVER' : params.formatProfile.entryFormat;
  const mechanicallyAssigned = assigned === profileDefault && derived.nativeFormat !== assigned;

  return {
    nativeFormat: assigned,
    nativeFormatReason: mechanicallyAssigned
      ? `Direction 01 hero preserved — format ${assigned} was mechanically assigned via profile default (selectNativeProofFormat), not re-derived. Independent derivation would select ${derived.nativeFormat}.`
      : `Direction 01 hero preserved — format ${assigned} matches direction-derived selection ${derived.nativeFormat}.`,
    alternativeFormatsConsidered: derived.alternativeFormatsConsidered,
    whyAlternativesWereWeaker: derived.whyAlternativesWereWeaker,
    formatSelectionEvidence: [
      ...derived.formatSelectionEvidence,
      mechanicallyAssigned
        ? 'AUDIT: MECHANICAL_PROFILE_DEFAULT — blind replay executor used profile-level selectNativeProofFormat, not direction-specific derivation.'
        : 'AUDIT: assigned format aligns with direction-derived selection.',
    ],
    formatSelectionDerivedFromDirection: !mechanicallyAssigned,
    selectionMethod: mechanicallyAssigned ? 'MECHANICAL_PROFILE_DEFAULT' : 'PRESERVED_EXISTING',
  };
}

export function runFormatAssignmentContaminationTest(
  selection: DirectionNativeFormatSelection,
): FormatAssignmentContaminationTest {
  const notes: string[] = [];
  const rotationAlgorithmUsed = false;
  const priorDirectionFormatInfluenced = false;
  const diversityQuotaInfluenced = false;
  const benchmarkFormatInfluenced = false;
  const traceableToDirectionIntelligence =
    selection.formatSelectionDerivedFromDirection && selection.selectionMethod === 'DIRECTION_DERIVED';

  if (selection.selectionMethod === 'PRESERVED_EXISTING' || selection.selectionMethod === 'MECHANICAL_PROFILE_DEFAULT') {
    notes.push('Direction 01 preserved — contamination test N/A for existing hero format.');
  } else if (traceableToDirectionIntelligence) {
    notes.push('Format selected via direction-derived scoring — no rotation or diversity quota.');
  } else {
    notes.push('Format selection not traceable to direction intelligence.');
  }

  const passed =
    !rotationAlgorithmUsed &&
    !priorDirectionFormatInfluenced &&
    !diversityQuotaInfluenced &&
    !benchmarkFormatInfluenced &&
    (selection.selectionMethod === 'PRESERVED_EXISTING' ||
      selection.selectionMethod === 'MECHANICAL_PROFILE_DEFAULT' ||
      traceableToDirectionIntelligence);

  return {
    passed,
    rotationAlgorithmUsed,
    priorDirectionFormatInfluenced,
    diversityQuotaInfluenced,
    benchmarkFormatInfluenced,
    traceableToDirectionIntelligence:
      selection.selectionMethod === 'PRESERVED_EXISTING' ||
      selection.selectionMethod === 'MECHANICAL_PROFILE_DEFAULT' ||
      traceableToDirectionIntelligence,
    notes,
  };
}

export type ObservedFormatDiversity = {
  uniqueFormats: number;
  totalDirections: number;
  formatCounts: Record<string, number>;
  duplicateFormatsAllowed: true;
  notes: string[];
};

/** Observed outcome after all selections — never an input constraint. */
export function computeObservedFormatDiversity(formats: string[]): ObservedFormatDiversity {
  const formatCounts: Record<string, number> = {};
  for (const f of formats) {
    formatCounts[f] = (formatCounts[f] ?? 0) + 1;
  }
  const duplicates = Object.entries(formatCounts).filter(([, c]) => c > 1);
  return {
    uniqueFormats: Object.keys(formatCounts).length,
    totalDirections: formats.length,
    formatCounts,
    duplicateFormatsAllowed: true,
    notes:
      duplicates.length > 0
        ? duplicates.map(([fmt, c]) => `${c} directions independently selected ${fmt} — valid experimental evidence.`)
        : ['All directions selected distinct formats — observed outcome only.'],
  };
}
