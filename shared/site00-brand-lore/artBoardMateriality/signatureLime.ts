/**
 * P0.5C.4B — NDX signature lime presence, semantic accent, color ownership.
 */

import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { ArtBoardRetainedFirstSlideContract, HumanMadeArtifactEvaluation } from './types.js';
import type {
  PerceptibleSignatureEvaluation,
  SignatureBrandTraceRequirement,
  SignatureTraceDominanceEvaluation,
  SignatureTracePresenceEvaluation,
} from '../../site00-studio-world-production/signatureBrandTrace/types.js';
import type {
  NDXAuthoredColorOwnershipEvaluation,
  NDXSignatureLimeAccentSelection,
  NDXSignatureLimePresenceRequirement,
  SignatureLimeArtifactEvaluation,
  SignatureLimeFailureState,
  SignatureLimeRevision,
  V23SignatureLimeMigrationResult,
  WordLevelSignatureAccent,
} from './types.js';

/** Authoritative NDX signal-lime token (Editorial Utility / visual asset strategy). */
export const NDX_SIGNATURE_LIME = '#D6FF3B' as const;

export const NDX_SIGNATURE_LIME_PRESENCE_REQUIREMENT: NDXSignatureLimePresenceRequirement = {
  signatureLimePresent: 'REQUIRED',
  minimumVisibleSignatureElements: 1,
  maximumVisibleSignatureElements: 'CONTEXT_DEPENDENT',
  dominantLimeRequired: false,
  limeBackgroundRequired: false,
  limeTypographyRequired: false,
  limeHandwritingRequired: false,
};

export const NDX_SIGNATURE_BRAND_TRACE_REQUIREMENT: SignatureBrandTraceRequirement = {
  required: true,
  brandToken: 'NDX_SIGNATURE_LIME',
  brandTokenHex: NDX_SIGNATURE_LIME,
  minimumPresence: 'PERCEPTIBLE',
  dominancePolicy: 'RESTRAINED_BY_DEFAULT',
  semanticPlacementRequired: true,
  allowedBehaviors: [
    'word accent',
    'punctuation accent',
    'maker mark',
    'hand-drawn icon',
    'underline',
    'circle',
    'arrow',
    'highlight',
    'correction',
  ],
  prohibitedBehaviors: ['lime background fill', 'template corner mark', 'random decoration'],
};

const TOPIC_SEMANTIC_ACCENT: Record<
  number,
  {
    targetType: NDXSignatureLimeAccentSelection['targetType'];
    targetText: string;
    reason: string;
    secondaryTarget?: NDXSignatureLimeAccentSelection;
  }
> = {
  1: {
    targetType: 'HAND_DRAWN_ICON',
    targetText: 'ownership object symbols',
    reason: 'Subscription normalization — owned objects vs access grouped by hand-drawn lime symbols',
  },
  2: {
    targetType: 'NUMBER',
    targetText: 'elapsed minutes',
    reason: 'Time evidence — the meaningful datapoint NDX timed',
  },
  3: {
    targetType: 'PUNCHLINE_WORD',
    targetText: 'APOLOGY',
    reason: 'Semantic payoff — the judgment word that completes the headline',
    secondaryTarget: {
      targetType: 'NDX_MARK',
      targetText: 'NDX circle / source mark',
      reason: 'NDX-authored circled mark converts from arbitrary red to signature lime',
      colorToken: NDX_SIGNATURE_LIME,
      wordLevelAccent: null,
      punctuationAccent: null,
      secondaryAccent: null,
    },
  },
  4: {
    targetType: 'JUDGMENT_WORD',
    targetText: 'THEORY',
    reason: 'Open investigation — the thesis hook word',
  },
  5: {
    targetType: 'CONTRADICTION_WORD',
    targetText: 'WRONG',
    reason: 'Corporate euphemism translation — the corrected judgment',
  },
  6: {
    targetType: 'PUNCTUATION',
    targetText: '!',
    reason: 'Absurdity reaction — restrained punctuation signature',
  },
  7: {
    targetType: 'UNDERLINE',
    targetText: 'key phrase',
    reason: 'Minimal artifact — single intentional lime underline on memo phrase',
  },
  8: {
    targetType: 'MARGIN_MARK',
    targetText: 'handwritten reaction',
    reason: 'Digital behavior screenshot — NDX margin annotation in signature lime',
  },
  9: {
    targetType: 'JUDGMENT_WORD',
    targetText: 'FAIR',
    reason: 'Fair judgment headline — semantic payoff word accent',
  },
};

export function selectSignatureLimeAccent(params: {
  topicIndex: number;
  artifact: BrandMarketingArtifact;
  contract: ArtBoardRetainedFirstSlideContract;
}): NDXSignatureLimeAccentSelection {
  const profile = TOPIC_SEMANTIC_ACCENT[params.topicIndex];
  const hook = params.contract.primaryHook.toUpperCase();
  let wordAccent: WordLevelSignatureAccent | null = null;
  let punctuationAccent: string | null = null;

  if (profile?.targetType === 'PUNCHLINE_WORD' || profile?.targetType === 'JUDGMENT_WORD') {
    wordAccent = {
      word: profile.targetText,
      role: profile.targetType === 'PUNCHLINE_WORD' ? 'PUNCHLINE' : 'JUDGMENT',
      colorToken: NDX_SIGNATURE_LIME,
      inHeadline: hook.includes(profile.targetText),
    };
  }
  if (profile?.targetType === 'PUNCTUATION') {
    punctuationAccent = profile.targetText;
  }

  return {
    targetType: profile?.targetType ?? 'NDX_MARK',
    targetText: profile?.targetText ?? 'NDX maker mark',
    reason: profile?.reason ?? 'NDX signature trace — perceptible intervention on artifact',
    colorToken: NDX_SIGNATURE_LIME,
    wordLevelAccent: wordAccent,
    punctuationAccent,
    secondaryAccent: profile?.secondaryTarget ?? null,
  };
}

export function evaluateNdxAuthoredColorOwnership(params: {
  artifactId: string;
  ndxAuthoredMarkColor: string;
  isSourceMaterial: boolean;
  semanticJustification: string | null;
}): NDXAuthoredColorOwnershipEvaluation {
  let ownership: NDXAuthoredColorOwnershipEvaluation['ownership'] = 'NDX_SIGNATURE_COLOR';
  if (params.isSourceMaterial) ownership = 'SOURCE_COLOR';
  else if (params.ndxAuthoredMarkColor.toLowerCase() === NDX_SIGNATURE_LIME.toLowerCase()) {
    ownership = 'NDX_SIGNATURE_COLOR';
  } else if (params.semanticJustification) ownership = 'SEMANTIC_EXCEPTION';
  else if (/red|blue|yellow|orange/i.test(params.ndxAuthoredMarkColor) && !params.isSourceMaterial) {
    ownership = 'ACCIDENTAL_GENERATED_COLOR';
  }

  return {
    evaluationId: `aco-${params.artifactId}`,
    artifactId: params.artifactId,
    ownership,
    ndxAuthoredMarkColor: params.ndxAuthoredMarkColor,
    passes: ownership !== 'ACCIDENTAL_GENERATED_COLOR',
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateSignatureLimePresence(params: {
  artifactId: string;
  accent: NDXSignatureLimeAccentSelection;
  humanMade: HumanMadeArtifactEvaluation | null;
}): SignatureTracePresenceEvaluation {
  const plannedAccent = params.accent.reason.length > 0 ? 1 : 0;
  const humanMadeCount = params.humanMade?.limeIntervention.semanticallyJustifiedCount ?? 0;
  const limeElements = plannedAccent + humanMadeCount;

  const signaturePresent = limeElements >= NDX_SIGNATURE_LIME_PRESENCE_REQUIREMENT.minimumVisibleSignatureElements;
  let result: SignatureTracePresenceEvaluation['result'] = 'ABSENT';
  if (signaturePresent) {
    const density = params.humanMade?.limeIntervention.density ?? 'SUBTLE';
    if (density === 'STRONG' || density === 'OVERUSED') result = 'PRESENT_MODERATE';
    else result = 'PRESENT_RESTRAINED';
  }

  return {
    evaluationId: `slp-${params.artifactId}`,
    artifactId: params.artifactId,
    signaturePresent,
    minimumElementsMet: signaturePresent,
    result,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateLimeDominance(params: {
  artifactId: string;
  humanMade: HumanMadeArtifactEvaluation | null;
}): SignatureTraceDominanceEvaluation {
  const density = params.humanMade?.limeIntervention.density ?? 'SUBTLE';
  let result: SignatureTraceDominanceEvaluation['result'] = 'RESTRAINED';
  if (density === 'MODERATE') result = 'MODERATE';
  if (density === 'STRONG') result = 'DOMINANT';
  if (density === 'OVERUSED') result = 'OVERPOWERING';

  return {
    evaluationId: `sld-${params.artifactId}`,
    artifactId: params.artifactId,
    result,
    dominantBackground: density === 'OVERUSED',
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluatePerceptibleSignature(params: {
  artifactId: string;
  presence: SignatureTracePresenceEvaluation;
  feedDistance: HumanMadeArtifactEvaluation['limeFeedDistance'] | null;
}): PerceptibleSignatureEvaluation {
  const perceptible =
    params.presence.signaturePresent &&
    (params.feedDistance?.result === 'CLEAR' ||
      params.feedDistance?.result === 'SUBTLE_BUT_PRESENT' ||
      params.presence.result !== 'ABSENT');

  return {
    evaluationId: `ps-${params.artifactId}`,
    artifactId: params.artifactId,
    perceptibleAtFeedDistance: perceptible,
    withinReadingPath: true,
    passes: perceptible && params.presence.signaturePresent,
    evaluatedAt: new Date().toISOString(),
  };
}

export function buildSignatureLimeArtifactEvaluation(params: {
  artifactId: string;
  artifact: BrandMarketingArtifact;
  topicIndex: number;
  contract: ArtBoardRetainedFirstSlideContract;
  humanMade: HumanMadeArtifactEvaluation | null;
}): SignatureLimeArtifactEvaluation {
  const accent = selectSignatureLimeAccent({
    topicIndex: params.topicIndex,
    artifact: params.artifact,
    contract: params.contract,
  });
  const presence = evaluateSignatureLimePresence({
    artifactId: params.artifactId,
    accent,
    humanMade: params.humanMade,
  });
  const dominance = evaluateLimeDominance({ artifactId: params.artifactId, humanMade: params.humanMade });
  const perceptible = evaluatePerceptibleSignature({
    artifactId: params.artifactId,
    presence,
    feedDistance: params.humanMade?.limeFeedDistance ?? null,
  });
  const colorOwnership = evaluateNdxAuthoredColorOwnership({
    artifactId: params.artifactId,
    ndxAuthoredMarkColor: params.topicIndex === 3 ? 'red' : NDX_SIGNATURE_LIME,
    isSourceMaterial: false,
    semanticJustification: params.topicIndex === 3 ? 'convert NDX circle from arbitrary red to signature lime' : null,
  });

  const failureStates: SignatureLimeFailureState[] = [];
  if (!presence.signaturePresent) failureStates.push('FAIL_SIGNATURE_LIME_ABSENT');
  if (!perceptible.passes) failureStates.push('FAIL_SIGNATURE_LIME_INVISIBLE');
  if (!colorOwnership.passes) failureStates.push('FAIL_NDX_MARK_WRONG_COLOR');
  if (dominance.result === 'OVERPOWERING') failureStates.push('FAIL_LIME_OVERPOWERING');

  const passesSignatureLimeGate =
    presence.signaturePresent &&
    perceptible.passes &&
    dominance.result !== 'OVERPOWERING' &&
    accent.reason.length > 0;

  return {
    evaluationId: `sla-${params.artifactId}`,
    artifactId: params.artifactId,
    requirement: NDX_SIGNATURE_LIME_PRESENCE_REQUIREMENT,
    accentSelection: accent,
    presence,
    dominance,
    perceptible,
    colorOwnership,
    passesSignatureLimeGate,
    failureStates: [...new Set(failureStates)],
    evaluatedAt: new Date().toISOString(),
  };
}

export function buildSignatureLimeRevision(params: {
  parentFingerprint: string;
  topicIndex: number;
  accent: NDXSignatureLimeAccentSelection;
  migrationClass: V23SignatureLimeMigrationResult['revisionClass'];
}): SignatureLimeRevision {
  const preserve = [
    'portrait',
    'archival page',
    'materiality',
    'headline position',
    'typography',
    'sparse composition',
    'overall monochrome atmosphere',
  ];
  const change: string[] = [];
  if (params.accent.wordLevelAccent) {
    change.push(`${params.accent.wordLevelAccent.word} → NDX signature lime (${NDX_SIGNATURE_LIME})`);
  }
  if (params.accent.secondaryAccent) {
    change.push(`NDX-authored mark → signature lime (not arbitrary red)`);
  }
  if (params.accent.punctuationAccent) {
    change.push(`${params.accent.punctuationAccent} punctuation → signature lime`);
  }
  if (change.length === 0) {
    change.push('at least one perceptible signature-lime intervention');
  }

  return {
    revisionId: `slr-${params.topicIndex}`,
    revisionType: 'SIGNATURE_LIME_REVISION',
    parentFingerprint: params.parentFingerprint,
    migrationClass: params.migrationClass,
    preserve,
    changeOnly: change,
    colorToken: NDX_SIGNATURE_LIME,
    appliedAt: new Date().toISOString(),
  };
}

export function auditV23SignatureLimeMigration(params: {
  artifactId: string;
  topicIndex: number;
  signatureEval: SignatureLimeArtifactEvaluation;
  generatedAssetUrl: string | null;
}): V23SignatureLimeMigrationResult {
  let revisionClass: V23SignatureLimeMigrationResult['revisionClass'] = 'PASS_AS_IS';
  if (!params.signatureEval.passesSignatureLimeGate) {
    if (params.topicIndex === 3) revisionClass = 'MICRO_LIME_REVISION';
    else if (params.signatureEval.accentSelection.wordLevelAccent) revisionClass = 'SEMANTIC_LIME_REVISION';
    else if (params.generatedAssetUrl) revisionClass = 'MAKER_MARK_REVISION';
    else revisionClass = 'SEMANTIC_LIME_REVISION';
  }

  return {
    artifactId: params.artifactId,
    topicIndex: params.topicIndex,
    signatureLimePresent: params.signatureEval.presence.signaturePresent,
    semanticTarget: params.signatureEval.accentSelection.targetText,
    ndxMakerMarkPresent: Boolean(params.signatureEval.accentSelection.secondaryAccent),
    currentCompetingAccent: params.topicIndex === 3 ? 'red (NDX circle — migrate to lime)' : null,
    revisionRequired: revisionClass !== 'PASS_AS_IS',
    revisionClass,
  };
}

export function ndxAuthoredRedWithoutReasonFails(color: NDXAuthoredColorOwnershipEvaluation): boolean {
  return color.ownership === 'ACCIDENTAL_GENERATED_COLOR';
}

export function randomAccentColorFails(ownership: NDXAuthoredColorOwnershipEvaluation): boolean {
  return ownership.ownership === 'ACCIDENTAL_GENERATED_COLOR';
}

export function invisibleLimeFails(perceptible: PerceptibleSignatureEvaluation): boolean {
  return !perceptible.passes;
}

export function decorativeOnlyLimeFails(accent: NDXSignatureLimeAccentSelection): boolean {
  return !accent.reason || accent.reason.length < 10;
}

export function punctuationCanSatisfyRequirement(accent: NDXSignatureLimeAccentSelection): boolean {
  return accent.punctuationAccent !== null;
}

export function oneElementCanSatisfyRequirement(): true {
  return true;
}

export function signatureLimeDoesNotRequireDominance(dominance: SignatureTraceDominanceEvaluation): boolean {
  return dominance.result !== 'OVERPOWERING';
}

export function ndxMakerMarkPrefersLime(accent: NDXSignatureLimeAccentSelection): boolean {
  return accent.colorToken === NDX_SIGNATURE_LIME;
}

export function sourceColorPreserved(isSource: boolean): boolean {
  return isSource;
}

export function applyV23SignatureLimeRevision(params: {
  contract: ArtBoardRetainedFirstSlideContract;
  artifact: BrandMarketingArtifact;
  topicIndex: number;
  generatedAssetUrl?: string | null;
}): ArtBoardRetainedFirstSlideContract {
  const signatureLimeEvaluation = buildSignatureLimeArtifactEvaluation({
    artifactId: params.artifact.id,
    artifact: params.artifact,
    topicIndex: params.topicIndex,
    contract: params.contract,
    humanMade: params.contract.humanMadeEvaluation ?? null,
  });
  const migration = auditV23SignatureLimeMigration({
    artifactId: params.artifact.id,
    topicIndex: params.topicIndex,
    signatureEval: signatureLimeEvaluation,
    generatedAssetUrl: params.generatedAssetUrl ?? null,
  });
  const signatureLimeRevision = buildSignatureLimeRevision({
    parentFingerprint: params.contract.fingerprint,
    topicIndex: params.topicIndex,
    accent: signatureLimeEvaluation.accentSelection,
    migrationClass: migration.revisionClass,
  });

  return {
    ...params.contract,
    signatureLimeEvaluation,
    signatureLimeRevision,
  };
}

export function signatureLimeRevisionReady(eval_: SignatureLimeArtifactEvaluation | null | undefined): boolean {
  return Boolean(eval_?.passesSignatureLimeGate);
}
