/**
 * P0.5C.4B.1 — Signature lime restraint, chromatic attention hierarchy, prominence governance.
 * Canonical: LIME PRESENCE IS REQUIRED. LIME PROMINENCE IS PROHIBITED.
 */

import { createHash } from 'node:crypto';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type {
  ArtBoardRetainedFirstSlideContract,
  HumanMadeArtifactEvaluation,
  SignatureLimeArtifactEvaluation,
} from './types.js';
import {
  CHROMATIC_ROLES,
  HUMAN_MADE_MARKS_DO_NOT_IMPLY_LIME,
  LIME_PROMINENCE_EVALUATION_RESULTS,
  LIME_PROMINENCE_PROHIBITED,
  NDX_SIGNATURE_LIME_REQUIRED,
  SIGNATURE_LIME_RESTRAINT_MODES,
} from './constants.js';
import { NDX_SIGNATURE_LIME, selectSignatureLimeAccent } from './signatureLime.js';

export type ChromaticRole = (typeof CHROMATIC_ROLES)[number];
export type SignatureLimeRestraintMode = (typeof SIGNATURE_LIME_RESTRAINT_MODES)[number];
export type LimeProminenceResult = (typeof LIME_PROMINENCE_EVALUATION_RESULTS)[number];

export type SignatureLimeBehavior = {
  principle: 'LIME_PRESENCE_REQUIRED_LIME_PROMINENCE_PROHIBITED';
  limeIs: string[];
  limeIsNot: string[];
};

export const SIGNATURE_LIME_BEHAVIOR: SignatureLimeBehavior = {
  principle: 'LIME_PRESENCE_REQUIRED_LIME_PROMINENCE_PROHIBITED',
  limeIs: [
    'SIGNATURE',
    'ACCENT',
    'INTERRUPTION',
    'ATTENTION',
    'INTERVENTION',
    'CORRECTION',
    'CONNECTION',
    'SIGNAL',
    'PUNCHLINE',
    'SELECTIVE HUMAN MARK',
  ],
  limeIsNot: [
    'PRIMARY_TEXT_COLOR',
    'DEFAULT_HANDWRITING_COLOR',
    'DEFAULT_ICON_COLOR',
    'DEFAULT_DOCUMENT_COLOR',
    'DEFAULT_METADATA_COLOR',
    'BACKGROUND_SYSTEM',
    'FULL_INFORMATION_LAYER',
    'DECORATIVE_FILL',
    'PAGE-WIDE INK SYSTEM',
  ],
};

export type ChromaticAttentionHierarchy = {
  limeAttentionTarget: string;
  whyLimeIsUsedHere: string;
  whatViewerNoticesBecauseOfLime: string;
  whyAdditionalLimeWouldReduceHierarchy: string;
  primaryLimeRole: ChromaticRole;
  humanTraceDefaultRole: ChromaticRole;
  structuralNeutralRole: ChromaticRole;
};

export type HumanMadeMarkColorBehavior = {
  humanMadeMarksDoNotImplyLime: true;
  defaultHumanTraceColor: 'BLACK_PEN' | 'GRAPHITE' | 'CHARCOAL' | 'PHOTOCOPY_INK' | 'SOURCE_AUTHENTIC';
  limeAsOneInstrument: true;
  handDrawnIconsDoNotImplyLime: true;
};

export type LimeProminenceEvaluation = {
  evaluationId: string;
  artifactId: string;
  result: LimeProminenceResult;
  signaturePresence: boolean;
  attentionTargetClarity: boolean;
  limeCompetition: 'NONE' | 'LOW' | 'HIGH';
  neutralDominance: boolean;
  informationHierarchyPreserved: boolean;
  materialIntegration: boolean;
  semanticJustification: boolean;
  accentScarcity: boolean;
  passesLimeRestraintGate: boolean;
  failureStates: string[];
  evaluatedAt: string;
};

export type SignatureLimeRestraintEvaluation = {
  evaluationId: string;
  artifactId: string;
  behavior: SignatureLimeBehavior;
  restraintMode: SignatureLimeRestraintMode;
  attentionHierarchy: ChromaticAttentionHierarchy;
  humanMadeMarkColor: HumanMadeMarkColorBehavior;
  prominence: LimeProminenceEvaluation;
  humanTraceColorMedium: string;
  passesLimeRestraintGate: boolean;
  evaluatedAt: string;
};

export type FeedChromaticRhythmEvaluation = {
  boardId: string;
  restraintModes: SignatureLimeRestraintMode[];
  uniqueModeCount: number;
  identicalModeRepetition: boolean;
  nineIdenticalLimeTreatment: boolean;
  cohesionFromChromaticDna: boolean;
  passesFeedRhythmGate: boolean;
  evaluatedAt: string;
};

const TOPIC_RESTRAINT_MODE: Record<number, SignatureLimeRestraintMode> = {
  1: 'OBJECT_ACCENT',
  2: 'SINGLE_EMPHASIS',
  3: 'SINGLE_EMPHASIS',
  4: 'SINGLE_EMPHASIS',
  5: 'SINGLE_EMPHASIS',
  6: 'MICRO_MARK',
  7: 'MICRO_MARK',
  8: 'SELECTIVE_TRACE',
  9: 'SINGLE_EMPHASIS',
};

const TOPIC_ATTENTION: Record<
  number,
  Pick<ChromaticAttentionHierarchy, 'limeAttentionTarget' | 'whyLimeIsUsedHere' | 'whatViewerNoticesBecauseOfLime' | 'whyAdditionalLimeWouldReduceHierarchy' | 'primaryLimeRole'>
> = {
  1: {
    limeAttentionTarget: 'one owned-object symbol in the subscription comparison grid',
    whyLimeIsUsedHere: 'NDX wants the eye on the ownership-vs-access pivot object — not every icon',
    whatViewerNoticesBecauseOfLime: 'which object category NDX is calling out in the comparison',
    whyAdditionalLimeWouldReduceHierarchy: 'fifteen lime icons collapse into a lime icon system, not an accent',
    primaryLimeRole: 'ATTENTION_INTERRUPTION',
  },
  2: {
    limeAttentionTarget: 'elapsed minutes tally or number',
    whyLimeIsUsedHere: 'time evidence is the single datapoint worth interrupting the receipt read',
    whatViewerNoticesBecauseOfLime: 'how long the checkout actually took',
    whyAdditionalLimeWouldReduceHierarchy: 'lime tallies everywhere would become a lime annotation layer',
    primaryLimeRole: 'EMPHASIS',
  },
  3: {
    limeAttentionTarget: 'APOLOGY word in headline',
    whyLimeIsUsedHere: 'semantic payoff — the judgment word completes the cultural reassessment',
    whatViewerNoticesBecauseOfLime: 'the punchline word NDX is judging',
    whyAdditionalLimeWouldReduceHierarchy: 'a lime headline would dominate before the archival material reads',
    primaryLimeRole: 'SIGNATURE_ACCENT',
  },
  4: {
    limeAttentionTarget: 'THEORY word',
    whyLimeIsUsedHere: 'open investigation hook — one thesis word earns the interruption',
    whatViewerNoticesBecauseOfLime: 'what NDX is still testing',
    whyAdditionalLimeWouldReduceHierarchy: 'lime body copy would erase notebook neutrality',
    primaryLimeRole: 'EMPHASIS',
  },
  5: {
    limeAttentionTarget: 'WRONG judgment word',
    whyLimeIsUsedHere: 'corporate euphemism translation — the corrected word is the reveal',
    whatViewerNoticesBecauseOfLime: 'the contradiction NDX is naming',
    whyAdditionalLimeWouldReduceHierarchy: 'all-lime margin copy would become decorative saturation',
    primaryLimeRole: 'CORRECTION_MARK',
  },
  6: {
    limeAttentionTarget: 'single exclamation mark',
    whyLimeIsUsedHere: 'absurdity reaction — micro punctuation signature only',
    whatViewerNoticesBecauseOfLime: 'NDX disbelief at the wait time',
    whyAdditionalLimeWouldReduceHierarchy: 'more lime would turn a receipt into a highlighter exercise',
    primaryLimeRole: 'ATTENTION_INTERRUPTION',
  },
  7: {
    limeAttentionTarget: 'one underline on key memo phrase',
    whyLimeIsUsedHere: 'minimal artifact — one intentional underline is enough signature',
    whatViewerNoticesBecauseOfLime: 'the phrase NDX marked as the hook',
    whyAdditionalLimeWouldReduceHierarchy: 'extra lime marks would break the sparse composition',
    primaryLimeRole: 'SIGNATURE_ACCENT',
  },
  8: {
    limeAttentionTarget: 'one handwritten margin reaction',
    whyLimeIsUsedHere: 'character reaction beside screenshot — selective trace not full annotation system',
    whatViewerNoticesBecauseOfLime: 'NDX live response to digital behavior',
    whyAdditionalLimeWouldReduceHierarchy: 'lime paragraphs would overpower the screenshot evidence',
    primaryLimeRole: 'ATTENTION_INTERRUPTION',
  },
  9: {
    limeAttentionTarget: 'FAIR judgment word',
    whyLimeIsUsedHere: 'fair-judgment headline — one semantic word accent',
    whatViewerNoticesBecauseOfLime: 'the judgment NDX is making',
    whyAdditionalLimeWouldReduceHierarchy: 'lime art-board copy would fight the photographic material',
    primaryLimeRole: 'EMPHASIS',
  },
};

export function buildChromaticAttentionHierarchy(params: {
  topicIndex: number;
  accent: SignatureLimeArtifactEvaluation['accentSelection'];
}): ChromaticAttentionHierarchy {
  const profile = TOPIC_ATTENTION[params.topicIndex] ?? {
    limeAttentionTarget: params.accent.targetText,
    whyLimeIsUsedHere: params.accent.reason,
    whatViewerNoticesBecauseOfLime: 'one intentional NDX signature moment',
    whyAdditionalLimeWouldReduceHierarchy: 'scarcity creates hierarchy — saturation removes emphasis',
    primaryLimeRole: 'SIGNATURE_ACCENT' as ChromaticRole,
  };

  return {
    ...profile,
    humanTraceDefaultRole: 'HUMAN_TRACE_NEUTRAL',
    structuralNeutralRole: 'STRUCTURAL_NEUTRAL',
  };
}

export function selectSignatureLimeRestraintMode(topicIndex: number): SignatureLimeRestraintMode {
  return TOPIC_RESTRAINT_MODE[topicIndex] ?? 'SINGLE_EMPHASIS';
}

export function buildHumanMadeMarkColorBehavior(): HumanMadeMarkColorBehavior {
  return {
    humanMadeMarksDoNotImplyLime: HUMAN_MADE_MARKS_DO_NOT_IMPLY_LIME,
    defaultHumanTraceColor: 'BLACK_PEN',
    limeAsOneInstrument: true,
    handDrawnIconsDoNotImplyLime: true,
  };
}

export function evaluateLimeProminence(params: {
  artifactId: string;
  topicIndex: number;
  humanMade: HumanMadeArtifactEvaluation | null;
  signatureLime: SignatureLimeArtifactEvaluation | null;
  attentionHierarchy: ChromaticAttentionHierarchy;
}): LimeProminenceEvaluation {
  const failureStates: string[] = [];
  const density = params.humanMade?.limeIntervention.density ?? 'SUBTLE';
  const limeMarkCount = params.humanMade?.limeIntervention.semanticallyJustifiedCount ?? 0;
  const iconCount = params.humanMade?.markSystem.handDrawnIcons.filter((i) => i.limeApplied).length ?? 0;
  const allIconsLime =
    (params.humanMade?.markSystem.handDrawnIcons.length ?? 0) > 2 &&
    iconCount === (params.humanMade?.markSystem.handDrawnIcons.length ?? 0);

  const signaturePresence =
    Boolean(params.signatureLime?.presence.signaturePresent) ||
    Boolean(params.signatureLime?.accentSelection.wordLevelAccent) ||
    Boolean(params.signatureLime?.accentSelection.punctuationAccent);
  if (!signaturePresence) failureStates.push('FAIL_NO_SIGNATURE_LIME');

  let result: LimeProminenceResult = 'PASS_SIGNATURE_RESTRAINT';
  if (!signaturePresence) {
    result = 'FAIL_NO_SIGNATURE_LIME';
  } else if (density === 'OVERUSED' || density === 'STRONG') {
    result = 'FAIL_LIME_DOMINANT';
    failureStates.push('FAIL_LIME_DOMINANT');
  } else if (allIconsLime) {
    result = 'FAIL_LIME_ICON_SYSTEM';
    failureStates.push('FAIL_ALL_ICONS_SIGNATURE_LIME');
  } else if (limeMarkCount > 4 && params.topicIndex !== 1) {
    result = 'FAIL_LIME_HANDWRITING_SYSTEM';
    failureStates.push('FAIL_LIME_HANDWRITING_SYSTEM');
  } else if (density === 'MODERATE' && limeMarkCount > 2) {
    result = 'FAIL_LIME_DECORATIVE_SATURATION';
    failureStates.push('FAIL_LIME_DECORATIVE_SATURATION');
  } else if (limeMarkCount <= 1 && signaturePresence) {
    result = 'PASS_MINIMAL_SIGNATURE';
  } else if (density === 'MODERATE') {
    result = 'PASS_CONTROLLED_EMPHASIS';
  }

  const attentionTargetClarity = params.attentionHierarchy.limeAttentionTarget.length > 8;
  if (!attentionTargetClarity) failureStates.push('FAIL_ACCENT_WITHOUT_CAUSALITY');

  const limeCompetition =
    limeMarkCount > 3 ? 'HIGH' : limeMarkCount > 1 ? 'LOW' : ('NONE' as const);
  if (limeCompetition === 'HIGH') failureStates.push('FAIL_MULTIPLE_COMPETING_LIME_TARGETS');

  const neutralDominance = density !== 'OVERUSED' && density !== 'STRONG';
  const informationHierarchyPreserved = params.humanMade?.markSystem.headlineHierarchyPreserved ?? true;
  const materialIntegration = Boolean(params.attentionHierarchy.whyLimeIsUsedHere);
  const semanticJustification = Boolean(params.signatureLime?.accentSelection.reason);
  const accentScarcity = limeMarkCount <= 3 || params.topicIndex === 1;

  const passesLimeRestraintGate =
    signaturePresence &&
    result !== 'FAIL_LIME_DOMINANT' &&
    result !== 'FAIL_NO_SIGNATURE_LIME' &&
    result !== 'FAIL_LIME_ICON_SYSTEM' &&
    result !== 'FAIL_LIME_HANDWRITING_SYSTEM' &&
    result !== 'FAIL_LIME_DECORATIVE_SATURATION' &&
    attentionTargetClarity &&
    neutralDominance;

  return {
    evaluationId: `lpr-${params.artifactId}`,
    artifactId: params.artifactId,
    result,
    signaturePresence,
    attentionTargetClarity,
    limeCompetition,
    neutralDominance,
    informationHierarchyPreserved,
    materialIntegration,
    semanticJustification,
    accentScarcity,
    passesLimeRestraintGate,
    failureStates: [...new Set(failureStates)],
    evaluatedAt: new Date().toISOString(),
  };
}

export function buildSignatureLimeRestraintEvaluation(params: {
  artifactId: string;
  topicIndex: number;
  contract: ArtBoardRetainedFirstSlideContract;
  humanMade: HumanMadeArtifactEvaluation | null;
  signatureLime: SignatureLimeArtifactEvaluation | null;
}): SignatureLimeRestraintEvaluation {
  const accent =
    params.signatureLime?.accentSelection ??
    selectSignatureLimeAccent({
      topicIndex: params.topicIndex,
      artifact: { id: params.artifactId } as BrandMarketingArtifact,
      contract: params.contract,
    });
  const attentionHierarchy = buildChromaticAttentionHierarchy({
    topicIndex: params.topicIndex,
    accent,
  });
  const prominence = evaluateLimeProminence({
    artifactId: params.artifactId,
    topicIndex: params.topicIndex,
    humanMade: params.humanMade,
    signatureLime: params.signatureLime,
    attentionHierarchy,
  });

  return {
    evaluationId: `slre-${params.artifactId}`,
    artifactId: params.artifactId,
    behavior: SIGNATURE_LIME_BEHAVIOR,
    restraintMode: selectSignatureLimeRestraintMode(params.topicIndex),
    attentionHierarchy,
    humanMadeMarkColor: buildHumanMadeMarkColorBehavior(),
    prominence,
    humanTraceColorMedium: 'black pen / graphite (lime only at attention target)',
    passesLimeRestraintGate: prominence.passesLimeRestraintGate,
    evaluatedAt: new Date().toISOString(),
  };
}

export function buildFeedChromaticRhythm(params: {
  boardId: string;
  evaluations: SignatureLimeRestraintEvaluation[];
}): FeedChromaticRhythmEvaluation {
  const modes = params.evaluations.map((e) => e.restraintMode);
  const uniqueModeCount = new Set(modes).size;
  const modeCounts = modes.reduce<Record<string, number>>((acc, m) => {
    acc[m] = (acc[m] ?? 0) + 1;
    return acc;
  }, {});
  const maxSameMode = Math.max(0, ...Object.values(modeCounts));
  const identicalModeRepetition = maxSameMode >= 7;
  const nineIdenticalLimeTreatment = maxSameMode === 9;

  return {
    boardId: params.boardId,
    restraintModes: modes,
    uniqueModeCount,
    identicalModeRepetition,
    nineIdenticalLimeTreatment,
    cohesionFromChromaticDna: uniqueModeCount >= 4 && !nineIdenticalLimeTreatment,
    passesFeedRhythmGate: !nineIdenticalLimeTreatment && uniqueModeCount >= 3,
    evaluatedAt: new Date().toISOString(),
  };
}

export function applyV23SignatureLimeRestraintRevision(params: {
  contract: ArtBoardRetainedFirstSlideContract;
  artifact: BrandMarketingArtifact;
  topicIndex: number;
}): ArtBoardRetainedFirstSlideContract {
  const signatureLimeRestraint = buildSignatureLimeRestraintEvaluation({
    artifactId: params.artifact.id,
    topicIndex: params.topicIndex,
    contract: params.contract,
    humanMade: params.contract.humanMadeEvaluation ?? null,
    signatureLime: params.contract.signatureLimeEvaluation ?? null,
  });

  const revised: ArtBoardRetainedFirstSlideContract = {
    ...params.contract,
    signatureLimeRestraint,
    fingerprint: '',
  };
  revised.fingerprint = createHash('sha256')
    .update(JSON.stringify({ ...revised, fingerprint: undefined }))
    .digest('hex')
    .slice(0, 16);
  return revised;
}

export function limeForensicAuditRootCause(): {
  rootCause: string;
  humanMadeLimeCouplingFound: boolean;
  typographyCouplingFound: boolean;
  iconCouplingFound: boolean;
} {
  return {
    rootCause:
      'P0.5C.4B interpreted SIGNATURE_LIME_REQUIRED as default NDX ink: FAL compiler defaulted all hand-drawn icons, annotations, corrections, and underlines to signature lime; human-made mark system defaulted limeApplied=true on every mark; lime intervention density defaulted MODERATE from icon/mark counts.',
    humanMadeLimeCouplingFound: true,
    typographyCouplingFound: true,
    iconCouplingFound: true,
  };
}

export function signatureLimeRestraintGatePasses(
  evaluation: SignatureLimeRestraintEvaluation | null | undefined,
): boolean {
  return Boolean(evaluation?.passesLimeRestraintGate);
}

export function limePresenceRequired(): boolean {
  return NDX_SIGNATURE_LIME_REQUIRED;
}

export function limeProminenceProhibited(): boolean {
  return LIME_PROMINENCE_PROHIBITED;
}

export function falPromptHasLimeRestraintSection(prompt: string): boolean {
  return prompt.includes('SIGNATURE LIME RESTRAINT + CHROMATIC ATTENTION');
}

export function prominenceLabel(evaluation: LimeProminenceEvaluation): 'RESTRAINED' | 'BORDERLINE' | 'DOMINANT' {
  if (evaluation.result === 'FAIL_LIME_DOMINANT' || evaluation.result === 'FAIL_LIME_DECORATIVE_SATURATION') {
    return 'DOMINANT';
  }
  if (evaluation.result === 'PASS_CONTROLLED_EMPHASIS') return 'BORDERLINE';
  return 'RESTRAINED';
}

export function canonicalLimeToken(): string {
  return NDX_SIGNATURE_LIME;
}
