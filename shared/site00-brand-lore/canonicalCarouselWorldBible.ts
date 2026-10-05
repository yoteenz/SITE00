/**
 * Direction-derived carousel world bible and slide role planning.
 */

import type { CanonicalNdxbookDirectionName } from './canonicalCreativeRangeConstants.js';
import type { DirectionDnaEnvelope } from './canonicalCreativeRangeTypes.js';
import type {
  CarouselSlideCopy,
  CarouselSlideRecord,
  CarouselSlideTypography,
  DirectionCarouselWorldBible,
  PreservedCarouselCover,
  SharedCarouselTopicContext,
} from './canonicalCarouselExpansionTypes.js';
import {
  CAROUSEL_EXPERIMENT_VERSION,
  CAROUSEL_TOTAL_SLIDES,
  COMPOSITION_MODES,
  type CarouselCompositionMode,
} from './canonicalCarouselExpansionConstants.js';

const DIRECTION_SLIDE_ROLE_SEEDS: Record<
  CanonicalNdxbookDirectionName,
  Array<{ role: string; purpose: string; compositionMode: CarouselCompositionMode }>
> = {
  'THE MARKED-UP COPY': [
    { role: 'CANONICAL_CAROUSEL_COVER', purpose: 'Stop-scroll cover — preserved hero', compositionMode: 'ARTIFACT_DOMINANT' },
    { role: 'ORIGINAL CLAIM', purpose: 'State the conventional utilization advice cleanly', compositionMode: 'TYPE_DOMINANT' },
    { role: 'STRIKE / CORRECTION', purpose: 'Cross out the oversimple rule', compositionMode: 'ANNOTATION_DOMINANT' },
    { role: 'MARGIN ARGUMENT', purpose: 'Add the timing/reporting nuance in margin voice', compositionMode: 'ANNOTATION_DOMINANT' },
    { role: 'RECEIPT / EVIDENCE', purpose: 'Show what actually gets reported', compositionMode: 'DATA_DOMINANT' },
    { role: 'FINAL REVISION', purpose: 'Deliver the corrected takeaway', compositionMode: 'TYPE_DOMINANT' },
  ],
  'THE COUNTDOWN ROOM': [
    { role: 'CANONICAL_CAROUSEL_COVER', purpose: 'Stop-scroll cover — preserved hero', compositionMode: 'SPATIAL_ENVIRONMENTAL' },
    { role: 'RANKING ENTRY', purpose: 'Place utilization on the score-factor board', compositionMode: 'DATA_DOMINANT' },
    { role: 'NEXT PLACEMENT', purpose: 'Show what moves when utilization spikes', compositionMode: 'DATA_DOMINANT' },
    { role: 'SCOREBOARD SHIFT', purpose: 'Animate the reorder with evidence', compositionMode: 'IMAGE_DOMINANT' },
    { role: 'ARGUMENT OVER ORDER', purpose: 'Debate what deserves higher rank', compositionMode: 'ANNOTATION_DOMINANT' },
    { role: 'UPDATED COUNTDOWN', purpose: 'Lock the new ranking logic', compositionMode: 'TYPE_DOMINANT' },
  ],
  'THE PERSONAL ARCHIVE': [
    { role: 'CANONICAL_CAROUSEL_COVER', purpose: 'Stop-scroll cover — preserved hero', compositionMode: 'ARTIFACT_DOMINANT' },
    { role: 'SCREENSHOT', purpose: 'Saved app screen with utilization highlighted', compositionMode: 'ARTIFACT_DOMINANT' },
    { role: 'SAVED NOTE', purpose: 'Personal note questioning the 30% rule', compositionMode: 'MINIMAL_QUIET' },
    { role: 'OLD RECEIPT', purpose: 'Payment proof that did not move the reported number', compositionMode: 'ARTIFACT_DOMINANT' },
    { role: 'SAVED LINK', purpose: 'Bookmarked explainer on statement dates', compositionMode: 'DENSE_REFERENCE' },
    { role: 'WHY THIS STAYED', purpose: 'Explain why the folder kept this story', compositionMode: 'TYPE_DOMINANT' },
  ],
  'THE ANNOTATED COPY': [
    { role: 'CANONICAL_CAROUSEL_COVER', purpose: 'Stop-scroll cover — preserved hero', compositionMode: 'ARTIFACT_DOMINANT' },
    { role: 'SOURCE PASSAGE', purpose: 'Quote the generic utilization advice', compositionMode: 'TYPE_DOMINANT' },
    { role: 'INLINE ANNOTATION', purpose: 'Layer skeptical notes on the passage', compositionMode: 'ANNOTATION_DOMINANT' },
    { role: 'CROSS-REFERENCE', purpose: 'Link to reporting-cycle context', compositionMode: 'DENSE_REFERENCE' },
    { role: 'SECOND SOURCE', purpose: 'Contrasting take enters the margin', compositionMode: 'ANNOTATION_DOMINANT' },
    { role: 'ANNOTATED VERDICT', purpose: 'What the annotated read concludes', compositionMode: 'TYPE_DOMINANT' },
  ],
  'THE ROOM WHERE IT HAPPENS': [
    { role: 'CANONICAL_CAROUSEL_COVER', purpose: 'Stop-scroll cover — preserved hero', compositionMode: 'SPATIAL_ENVIRONMENTAL' },
    { role: 'WORKING BOARD', purpose: 'Utilization story pinned on the wall', compositionMode: 'SPATIAL_ENVIRONMENTAL' },
    { role: 'EDITORIAL DEBATE', purpose: 'Two voices argue timing vs percentage', compositionMode: 'ANNOTATION_DOMINANT' },
    { role: 'SOURCE ENTERS', purpose: 'New data point joins the room', compositionMode: 'IMAGE_DOMINANT' },
    { role: 'DECISION SHIFT', purpose: 'Board changes after the argument', compositionMode: 'SPATIAL_ENVIRONMENTAL' },
    { role: 'BOARD AFTER', purpose: 'Final room state — what we publish', compositionMode: 'TYPE_DOMINANT' },
  ],
  'THE INDEX': [
    { role: 'CANONICAL_CAROUSEL_COVER', purpose: 'Stop-scroll cover — preserved hero', compositionMode: 'MINIMAL_QUIET' },
    { role: 'ENTRY', purpose: 'Index line for UTILIZATION', compositionMode: 'TYPE_DOMINANT' },
    { role: 'CROSS-REFERENCE', purpose: 'See also: STATEMENT DATE, AGGREGATE LIMIT', compositionMode: 'DENSE_REFERENCE' },
    { role: 'RELATED ENTRY', purpose: 'Linked concept expands the definition', compositionMode: 'DATA_DOMINANT' },
    { role: 'CLASSIFICATION', purpose: 'Where utilization sits in the taxonomy', compositionMode: 'MINIMAL_QUIET' },
    { role: 'UPDATED INDEX POSITION', purpose: 'Reclassified after new evidence', compositionMode: 'TYPE_DOMINANT' },
  ],
};

export function buildDirectionCarouselWorldBible(params: {
  cover: PreservedCarouselCover;
  dna: DirectionDnaEnvelope | null;
  topic: SharedCarouselTopicContext;
}): DirectionCarouselWorldBible {
  const { cover, dna, topic } = params;
  const name = cover.directionName;
  const thesis = dna?.centralThesis ?? `${name} interprets ${topic.topicName} through its native editorial grammar.`;
  return {
    directionId: cover.directionId,
    directionName: name,
    carouselThesis: `${name} CONTINUES THE CREDIT UTILIZATION STORY FROM ITS COVER — ${thesis}`,
    whatTheReaderLearns: `HOW ${name} RE-ORDERS THE SAME FACTS ABOUT UTILIZATION.`,
    emotionalArc: dna?.emotionalTerritory ?? 'Curiosity → friction → clarity',
    editorialArc: 'Cover hook → complicate → evidence → payoff',
    whyThisDirectionNeedsMultipleSlides: `${name} CANNOT FINISH THE UTILIZATION ARGUMENT IN ONE FRAME — ITS GRAMMAR REQUIRES SEQUENCE.`,
    coverBehavior: 'Preserved Experiment B hero — immutable stop-scroll cover',
    continuationBehavior: dna?.contentBehavior ?? 'Deepen the same topic without repeating cover composition',
    evidenceBehavior: dna?.visualGrammar ?? 'Direction-native evidence presentation',
    transitionBehavior: 'Each swipe advances the editorial argument, not a template step',
    revealBehavior: dna?.socialBehavior ?? 'Second-read discovery on later slides',
    payoffBehavior: 'Final slide delivers direction-specific takeaway on utilization',
    endingBehavior: 'Reward completion — saveable insight, not CTA wallpaper',
    contentOrder: DIRECTION_SLIDE_ROLE_SEEDS[name].map((s) => s.role),
    argumentProgression: topic.coreClaim,
    evidenceProgression: topic.knownEvidence.join(' → '),
    pacing: 'Mobile-native — one idea per swipe',
    densityBySlide: Object.fromEntries(
      DIRECTION_SLIDE_ROLE_SEEDS[name].map((_seed, i) => [`slide${i + 1}`, i === 0 ? 'cover density' : 'variable']),
    ),
    whereContextLives: 'Slides 2–3',
    whereContradictionLives: 'Slides 3–4',
    wherePayoffLives: 'Slide 6',
    compositionSystem: dna?.compositionLogic ?? 'Direction-derived grid',
    recurringGridBehavior: 'System stays; composition mode shifts',
    deliberateGridBreaks: 'At least one quiet slide and one dense slide per carousel',
    typographyBehavior: dna?.typographicAttitude ?? 'Uppercase editorial display',
    paletteBehavior: dna?.colorBehavior ?? dna?.palette ?? 'Direction-native palette',
    graphicGrammar: dna?.visualGrammar ?? 'Direction devices',
    imageBehavior: dna?.imageLanguage ?? 'Documentary editorial',
    artifactBehavior: dna?.materialLanguage ?? 'Paper and screen artifacts',
    annotationBehavior: dna?.annotationLanguage ?? 'Margin and strike behaviors',
    recurringDevices: dna?.signatureDevices ?? [],
    escalationRules: ['Increase information density mid-carousel', 'Resolve on slide 6'],
    restraintRules: ['No cover layout cloning', 'No generic hook-problem-solution template'],
    confidenceBehavior: dna?.personalityTranslation ?? 'Assured but specific',
    witBehavior: 'Direction-native — not generic social humor',
    disagreementBehavior: 'Challenge the simple utilization rule',
    humanityBehavior: 'Founder-adjacent observation voice',
    observationBehavior: 'Notice what others skip about reporting timing',
    selfCorrectionBehavior: 'Revise earlier slide assumptions visibly',
    memorabilityBehavior: 'One line worth saving per carousel',
    whatMustRepeatAcrossSlides: [
      dna?.dominantColor ?? 'palette anchor',
      dna?.typographicAttitude ?? 'type attitude',
      topic.topicName,
    ],
    whatMustChangeAcrossSlides: ['composition mode', 'typography hierarchy', 'artifact emphasis'],
    visualAnchors: [dna?.visualWorld ?? name, dna?.materialLanguage ?? 'material'],
    typographyAnchors: [dna?.typographyRoleBehavior ?? 'display hierarchy'],
    colorAnchors: [dna?.dominantColor ?? 'dominant', dna?.accentColors ?? 'accent'],
    artifactAnchors: [dna?.materialLanguage ?? 'artifact'],
    narrativeAnchors: [topic.coreClaim],
    whatWouldMakeThisFeelLikeGenericCarouselDesign: [
      'Identical layout six times',
      'Hook-problem-solution-CTA template',
      'Stock finance infographic',
    ],
    whatWouldMakeThisFeelLikeAnotherDirection: ['Borrowing another direction margin grammar'],
    whatWouldMakeThisFeelLikeSimpleResizing: ['Same cover crop with smaller text'],
    whatWouldMakeThisFeelLikeRepeatedCoverVariations: ['Same headline scale on every slide'],
    dominant: dna?.dominantColor ?? 'INK',
    secondary: dna?.supportingColors ?? 'PAPER',
    accent: dna?.accentColors ?? 'DIRECTION ACCENT',
    functionalColors: ['STRIKE', 'HIGHLIGHT', 'METADATA'],
    backgrounds: [dna?.palette ?? 'direction background'],
    contrastRules: 'Display type must read at mobile feed scale',
    frequencyRules: 'Dominant color visible on ≥3 slides; accent on ≥2',
  };
}

function buildSlideCopy(params: {
  directionName: CanonicalNdxbookDirectionName;
  slideNumber: number;
  role: string;
  topic: SharedCarouselTopicContext;
}): CarouselSlideCopy {
  const { directionName, slideNumber, role, topic } = params;
  const headline = `${directionName.split(' ').slice(-2).join(' ')} · ${role.replace(/_/g, ' ')}`;
  return {
    headline: slideNumber === 1 ? 'PRESERVED COVER' : `${headline} — ${topic.topicName}`,
    supportingCopy:
      slideNumber === 1
        ? topic.coreClaim
        : `${topic.challengedClaim} — INTERPRETED THROUGH ${directionName}.`,
    microcopy: slideNumber === 6 ? topic.audienceTakeaway : `SLIDE ${slideNumber} / 6`,
    annotationCopy: role.includes('ANNOTATION') || role.includes('MARGIN') ? 'NOT SO FAST.' : '',
    metadataCopy: `NDXBOOK · ${topic.topicId.toUpperCase()}`,
    sourceCopy: topic.sourceBehavior,
    visualPunchline: slideNumber === 6 ? 'REMEMBER THE REPORTED BALANCE.' : '',
    copyPurpose: `Advance ${directionName} utilization argument on slide ${slideNumber}`,
  };
}

function buildSlideTypography(params: {
  dna: DirectionDnaEnvelope | null;
  slideNumber: number;
  compositionMode: CarouselCompositionMode;
}): CarouselSlideTypography {
  const { dna, slideNumber, compositionMode } = params;
  const hierarchy =
    compositionMode === 'TYPE_DOMINANT'
      ? 'DISPLAY DOMINATES'
      : compositionMode === 'DATA_DOMINANT'
        ? 'NUMERIC DOMINATES'
        : compositionMode === 'ANNOTATION_DOMINANT'
          ? 'MARGIN DOMINATES'
          : 'SECONDARY DOMINATES';
  return {
    fontRole: dna?.typographyRoleBehavior ?? 'direction display',
    typeScaleRole: slideNumber === 6 ? 'PAYOFF SCALE' : `SLIDE ${slideNumber} SCALE`,
    hierarchyRole: hierarchy,
    typographyDevice: dna?.typographicAttitude ?? 'uppercase editorial',
    whyThisTypographyHere: `Composition mode ${compositionMode} requires ${hierarchy}`,
  };
}

export function deriveCarouselSlidePlan(params: {
  cover: PreservedCarouselCover;
  worldBible: DirectionCarouselWorldBible;
  dna: DirectionDnaEnvelope | null;
  topic: SharedCarouselTopicContext;
}): CarouselSlideRecord[] {
  const { cover, worldBible, dna, topic } = params;
  const seeds = DIRECTION_SLIDE_ROLE_SEEDS[cover.directionName];
  const slides: CarouselSlideRecord[] = [];

  for (let i = 0; i < CAROUSEL_TOTAL_SLIDES; i += 1) {
    const slideNumber = i + 1;
    const seed = seeds[i]!;
    const idempotencyKey = `${cover.directionId}:${CAROUSEL_EXPERIMENT_VERSION}:${slideNumber}`;
    const isCover = slideNumber === 1;

    slides.push({
      slideNumber,
      slideRole: seed.role,
      slidePurpose: seed.purpose,
      readerQuestion: isCover ? 'DO I STOP?' : `WHAT DOES ${seed.role} REVEAL ABOUT UTILIZATION?`,
      readerTakeaway: isCover ? topic.coreClaim : worldBible.whatTheReaderLearns,
      whyThisSlideExists: seed.purpose,
      relationshipToPreviousSlide: slideNumber === 1 ? 'ENTRY' : `CONTINUES FROM SLIDE ${slideNumber - 1}`,
      relationshipToNextSlide:
        slideNumber === CAROUSEL_TOTAL_SLIDES ? 'PAYOFF END' : `SETS UP SLIDE ${slideNumber + 1}`,
      compositionMode: seed.compositionMode,
      copy: buildSlideCopy({
        directionName: cover.directionName,
        slideNumber,
        role: seed.role,
        topic,
      }),
      typography: buildSlideTypography({ dna, slideNumber, compositionMode: seed.compositionMode }),
      colorLogic: worldBible.paletteBehavior,
      worldSignals: worldBible.visualAnchors.slice(0, 3),
      visualBrief: null,
      asset: isCover
        ? {
            assetId: cover.existingHeroAssetId,
            storagePath: cover.existingHeroStoragePath,
            topic: topic.topicId,
            provider: 'openai/gpt-image-2',
            generatedAt: new Date().toISOString(),
          }
        : null,
      generationReceipt: isCover
        ? {
            firstGenerationResult: 'PRESERVED',
            creativeAttemptCount: 0,
            firstGenerationPromptHash: cover.existingHeroPromptLineage,
            firstGenerationModel: 'openai/gpt-image-2',
            firstGenerationCostUsd: 0,
            failureReason: null,
            generatedAt: null,
          }
        : null,
      preserved: isCover,
      idempotencyKey,
      founderJudgment: null,
    });
  }
  return slides;
}

export function runCarouselWorldBibleTest(bible: DirectionCarouselWorldBible | null): {
  passed: boolean;
  notes: string[];
} {
  if (!bible) return { passed: false, notes: ['World bible missing'] };
  const required = ['carouselThesis', 'contentOrder', 'dominant', 'typographyBehavior'];
  const missing = required.filter((k) => !(bible as Record<string, unknown>)[k]);
  return { passed: missing.length === 0, notes: missing.length ? [`Missing: ${missing.join(', ')}`] : [] };
}

export function runSlideRoleDirectionDerivationTest(slides: CarouselSlideRecord[]): {
  passed: boolean;
  notes: string[];
} {
  if (slides.length !== 6) return { passed: false, notes: ['Expected 6 slides'] };
  const roles = slides.map((s) => s.slideRole);
  const uniqueRoles = new Set(roles);
  if (uniqueRoles.size < 5) return { passed: false, notes: ['Slide roles too repetitive'] };
  if (slides[0]?.slideRole !== 'CANONICAL_CAROUSEL_COVER') {
    return { passed: false, notes: ['Slide 01 must be cover'] };
  }
  return { passed: true, notes: ['Roles direction-derived'] };
}

export function runNoUniversalCarouselTemplateTest(slides: CarouselSlideRecord[]): {
  passed: boolean;
  notes: string[];
} {
  const forbidden = ['HOOK', 'PROBLEM', 'SOLUTION', 'CTA'];
  const hits = slides.filter((s) => forbidden.some((f) => s.slideRole.includes(f)));
  return {
    passed: hits.length === 0,
    notes: hits.length ? ['Universal template roles detected'] : ['No universal template'],
  };
}

export function runCompositionModeRangeTest(slides: CarouselSlideRecord[]): {
  passed: boolean;
  uniqueCount: number;
  notes: string[];
} {
  const modes = new Set(slides.map((s) => s.compositionMode));
  return {
    passed: modes.size >= 3,
    uniqueCount: modes.size,
    notes: modes.size >= 3 ? [] : [`Only ${modes.size} composition modes — need ≥3`],
  };
}

export function runTypographySystemContinuityTest(slides: CarouselSlideRecord[]): {
  passed: boolean;
  notes: string[];
} {
  const devices = slides.map((s) => s.typography.typographyDevice);
  const sameDevice = new Set(devices).size === 1;
  return { passed: sameDevice, notes: sameDevice ? [] : ['Typography device inconsistent'] };
}

export function runTypographyCompositionVariationTest(slides: CarouselSlideRecord[]): {
  passed: boolean;
  notes: string[];
} {
  const hierarchies = new Set(slides.map((s) => s.typography.hierarchyRole));
  return {
    passed: hierarchies.size >= 2,
    notes: hierarchies.size >= 2 ? [] : ['Typography hierarchy did not vary'],
  };
}

export function runPaletteRecognitionTest(slides: CarouselSlideRecord[], bible: DirectionCarouselWorldBible): {
  result: 'PASS' | 'PARTIAL' | 'FAIL';
  notes: string[];
} {
  const withColor = slides.filter((s) => s.colorLogic?.length > 0).length;
  if (withColor >= 5 && bible.dominant) return { result: 'PASS', notes: [] };
  if (withColor >= 3) return { result: 'PARTIAL', notes: ['Palette present but thin'] };
  return { result: 'FAIL', notes: ['Palette not visible enough'] };
}

export function runWithinDirectionContinuityTest(slides: CarouselSlideRecord[]): {
  passed: boolean;
  notes: string[];
} {
  for (let i = 1; i < slides.length; i += 1) {
    const prev = slides[i - 1]!;
    const curr = slides[i]!;
    if (!curr.relationshipToPreviousSlide.includes(String(prev.slideNumber))) {
      return { passed: false, notes: [`Slide ${curr.slideNumber} missing continuity link`] };
    }
  }
  return { passed: true, notes: [] };
}

export function countUniqueCompositionModes(slides: CarouselSlideRecord[]): CarouselCompositionMode[] {
  return [...new Set(slides.map((s) => s.compositionMode))];
}

export function isValidCompositionMode(mode: string): mode is CarouselCompositionMode {
  return (COMPOSITION_MODES as readonly string[]).includes(mode);
}
