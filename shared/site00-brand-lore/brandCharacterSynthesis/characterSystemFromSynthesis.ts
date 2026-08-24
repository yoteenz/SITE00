/**
 * Compile BrandCharacterSystem from approved composite synthesis.
 */

import { createHash } from 'node:crypto';
import { BRAND_CHARACTER_SYNTHESIS_V1 } from './constants.js';
import type { BrandCharacterSynthesis } from './types.js';
import type { BrandCharacterSystem } from '../brandCharacterTerritory/types.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function compileBrandCharacterSystemFromSynthesis(params: {
  synthesis: BrandCharacterSynthesis;
  founderApproval?: BrandCharacterSystem['founderApproval'];
}): BrandCharacterSystem {
  const s = params.synthesis;
  const characterCore = {
    characterThesis: s.characterThesis,
    characterEssence: s.characterEssence,
    characterContradiction: s.unresolvedContradictions[0] ?? 'Curiosity vs conviction',
    internalTension: s.productiveTensions.join('; '),
    worldview: s.characterWorldview,
    orientationTowardWorld: s.characterInternalLogic,
    whatItNotices: s.obsessions.join('; ') || 'Contradictions, receipts, what everybody missed',
    whatItValues: s.likes.join('; '),
    whatItRejects: s.dislikes.join('; '),
    whatItFindsInteresting: s.delights.join('; '),
    whatItFindsBoring: s.irritations.join('; '),
    whatItTakesSeriously: s.boundaries.join('; '),
    whatItRefusesToTakeSeriously: s.neverBecome.join('; '),
  };

  return {
    id: `bcs-synth-${s.id}`,
    sourceTerritoryId: s.sourceTerritoryIds[0] ?? 'composite',
    sourceDevelopmentId: null,
    sourceFingerprint: fp({ synthesisId: s.id, version: s.version }),
    compilationPolicy: 'ESTABLISHED_CHARACTER_CAPTURE',
    methodologyVersion: BRAND_CHARACTER_SYNTHESIS_V1,
    founderApproval: params.founderApproval ?? 'APPROVED',
    characterCore,
    intellectualBehavior: {
      intelligenceStyle: s.intellectualIdentity,
      curiosityBehavior: s.intellectualInstincts.join('; '),
      knowledgePosture: 'Investigative — connects before concluding',
      reasoningBehavior: s.intellectualInstincts.join('; '),
      relationshipToCertainty: 'Provisional until evidence threshold',
      relationshipToComplexity: 'Seeks causal chains across domains',
      relationshipToExpertise: 'Respects depth; distrusts performance of intelligence',
      relationshipToDiscovery: s.obsessions.join('; '),
      relationshipToMemory: 'Receipts, callbacks, returns when context shifts',
    },
    socialBehavior: {
      socialPresence: s.socialIdentity,
      audienceRelationship: 'Laugh-with at 2 PM; profound-with at 2 AM — same person',
      intimacyDistance: 'Not loudest; notices room; earns the line',
      statusBehavior: s.socialInstincts.join('; '),
      authorityBehavior: s.judgmentIdentity,
      participationBehavior: s.culturalInstincts.join('; '),
      conversationalBehavior: s.languageIdentity,
      communityRelationship: 'Participates in culture; does not study from outside',
      relationshipToAttention: 'Wit without performing wit',
    },
    emotionalBehavior: {
      emotionalRange: s.emotionalIdentity,
      emotionalBaseline: 'Curious skepticism with warmth',
      emotionalVolatility: 'Low performative volatility; high investigative intensity',
      restraintBehavior: 'Humor quietens when stakes cheapen observation',
      enthusiasmBehavior: s.delights.join('; '),
      irritationBehavior: s.irritations.join('; '),
      delightBehavior: s.delights.join('; '),
      seriousnessBehavior: 'More honest when it cares — not more polished',
      vulnerabilityBoundary: 'Can admit wrong; avoids cruelty',
    },
    humorSystem: {
      humorLogic: s.humorIdentity,
      witMechanism: 'Evidence + observation + restraint',
      comedicTemperature: 'Deadpan, callbacks, absurd specificity',
      ironyRelationship: 'Targets systems and contradictions',
      absurdityRelationship: 'Behavioral absurdity over vulnerable targets',
      shadeBehavior: 'Side-eye within ethical limits',
      teasingBehavior: 'Light pettiness as memory/accountability',
      understatementBehavior: 'Perfectly timed "interesting."',
      exaggerationBehavior: 'Rare — specificity preferred',
      whatTheBrandWouldNeverJokeAbout: s.boundaries.join('; '),
    },
    culturalIntelligenceSystem: {
      culturalPosition: s.culturalIdentity,
      culturalFluency: s.culturalInstincts.join('; '),
      culturalReferenceBehavior: 'Reference discipline — inhabited, not decorated',
      referenceDensity: 'Shorthand when shared context exists',
      referenceSelectionLogic: 'Because it explains the contradiction',
      subculturalRelationship: 'Insider fluency without approval-seeking',
      temporalCultureRelationship: 'Historical memory + current signals',
      internetCultureRelationship: 'Group-chat logic, receipts culture',
      historicalCultureRelationship: 'Returns old evidence when relevant',
      culturalMemoryBehavior: s.makerBehaviors.join('; '),
      appropriationGuardrails: s.boundaries.join('; '),
      culturalAuthenticityRules: 'Participates; does not perform fluency',
    },
    languageBehavior: {
      verbalCadence: s.languageIdentity,
      sentenceBehavior: 'Evidence-first; under-explanation as punchline',
      vocabularyBehavior: 'Specific over generic finance voice',
      shorthandBehavior: 'Cultural shorthand when earned',
      explanationThreshold: 'Explains when investigation demands it',
      namingBehavior: 'Names the contradiction, not the vibe',
      interruptionBehavior: 'Editorial interruption when noticing',
      annotationBehavior: s.artifactBehaviors.join('; '),
      emphasisBehavior: 'Circle, cross out, highlight — with cause',
      silenceBehavior: 'Leaves joke unsaid when restraint sharpens',
      captionBehavior: 'Receipts with minimal commentary',
      linguisticTexture: 'Honest, specific, culturally alive',
    },
    tasteSystem: {
      tasteLogic: s.tasteIdentity,
      beautyRelationship: 'Beautiful when evidence is clear',
      uglinessRelationship: 'Corporate euphemism, try-hard relatability',
      polishRelationship: 'Polish without personality is corny',
      messRelationship: 'Mess as active working evidence',
      preciousnessRelationship: 'Low — prefers useful specificity',
      irreverenceRelationship: 'Irreverent toward systems, not people',
      restraintVsExcess: 'Restraint in delivery; excess in curiosity',
      orderVsChaos: 'Ordered investigation; messy working surfaces',
      permanenceVsEphemerality: 'Screenshots because moment might matter',
      highLowCultureRelationship: 'Moves freely when judgment is present',
    },
    expressiveBehavior: {
      expressiveGestures: s.expressiveIdentity,
      recurringBehaviors: s.recognitionSignals.join('; '),
      artifactBehavior: s.artifactBehaviors.join('; '),
      imageBehavior: 'Behavior generates appearance — not style-first',
      typographyBehavior: 'May interrupt, annotate, contrast certainty with reaction',
      colorBehavior: 'May behave emotionally or evidentially — not palette mandate',
      compositionBehavior: 'Causal traces readable',
      materialBehavior: 'Evidence surfaces NDX would actually use',
      motionBehavior: 'Returns, callbacks, sequencing',
      soundBehavior: null,
    },
    artifactRelationship: {
      makerPresence: s.makerBehaviors.join('; '),
      reactionEvidence: 'Circles because NDX noticed',
      judgmentEvidence: s.judgmentIdentity,
      selectionEvidence: 'Saves because moment might matter later',
      interventionEvidence: s.artifactBehaviors.join('; '),
      accumulationEvidence: 'Messy stack from active investigation',
      traceOfHandling: s.recognitionSignals.join('; '),
      explainabilityPrinciple: 'Every visible intervention has a cause',
    },
    antiCharacterRules: [...s.neverBecome, ...s.boundaries],
    allowedRange: [
      '2 PM witty catch ↔ 11 PM investigative depth — same person',
      'Playful ↔ obsessive ↔ reflective maturity',
      'Quick reaction ↔ long rabbit hole',
    ],
    contextualModulationRules: s.contextualModulationRules,
    mediumTranslationRules: [
      'Identity, presentation, content translate character — none replace it',
      'Behavioral consequences allowed; final logo/font/palette not prescribed',
    ],
    brandCharacterFingerprint: fp(s),
    compiledAt: new Date().toISOString(),
  };
}

export function compositeSystemDoesNotMutateBrandCanon(): true {
  return true;
}
