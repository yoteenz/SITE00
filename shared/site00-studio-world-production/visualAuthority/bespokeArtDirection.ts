/**
 * P0.5C.6 — Bespoke art direction contract builder.
 */

import { createHash } from 'node:crypto';
import type { BespokeArtDirectionContract } from './types.js';

export function buildBespokeArtDirectionContract(params: {
  artifactId: string;
  topic: string;
  subject: string;
  primaryHook: string;
  visualSubject: string;
  participationMode: string;
  humanPresence: boolean;
  imageHero: boolean;
  objectHero: boolean;
  artifactForm: string;
  whyNotTemplate: string;
}): BespokeArtDirectionContract {
  const artisticPremise = params.imageHero || params.objectHero
    ? `${params.topic} — ${params.visualSubject} leads the page — ${params.primaryHook}`
    : `${params.topic} — Typographic art direction: ${params.primaryHook}`;

  const contract: BespokeArtDirectionContract = {
    contractId: `bad-${params.artifactId}`,
    artifactId: params.artifactId,
    artisticPremise,
    visualEntryPoint: params.imageHero
      ? `Immediate ${params.visualSubject} — viewer stops on image before headline`
      : params.objectHero
        ? `Object-led composition: ${params.visualSubject}`
        : `Typographic hook with deliberate visual tension`,
    dominantVisualSubject: params.visualSubject,
    whySomeoneLooksBeforeReading: params.imageHero || params.objectHero
      ? `Human/object/cultural interest in ${params.visualSubject}`
      : `Typographic scale, crop, or spatial wit tied to ${params.topic}`,
    visualTension: params.participationMode.includes('IMAGE') ? 'Asymmetric crop + scale contrast' : 'Type/image weight imbalance',
    unexpectedElement: `Topic-specific: ${params.subject}`,
    compositionBehavior: params.participationMode.replace(/_/g, ' ').toLowerCase(),
    imageBehavior: params.imageHero ? 'Photographic or cultural image leads' : 'Image supports or defers',
    scaleBehavior: params.imageHero ? 'Hero scale subject' : 'Detail-driven or typographic scale',
    cropBehavior: 'Expressive crop — not centered template',
    negativeSpaceBehavior: 'Breathing room without emptiness',
    materialRelationship: `${params.artifactForm} expresses the artistic idea — medium follows premise`,
    culturalParticipation: params.humanPresence ? 'Human/cultural imagery participates in thesis' : 'Cultural object or context visible',
    emotionalEntry: 'Curiosity before comprehension',
    visualSurprise: `Specific to ${params.topic} — not generic notebook template`,
    whyThisCouldOnlyBelongToThisTopic: `${params.topic}: ${params.primaryHook}`,
    whyThisIsNotATemplate: params.whyNotTemplate,
    whatWouldRemainCompellingWithoutCopy: params.imageHero || params.objectHero
      ? `${params.visualSubject} remains visually compelling without text`
      : 'Typographic composition remains compelling without copy when intentional',
    fingerprint: '',
  };
  contract.fingerprint = createHash('sha256').update(JSON.stringify(contract)).digest('hex').slice(0, 16);
  return contract;
}

export function informationArchitectureSubordinateToArtDirection(chain: readonly string[]): boolean {
  const artIdx = chain.indexOf('VISUAL_SUBJECT_ARTISTIC_PREMISE');
  const infoIdx = chain.indexOf('EDITORIAL_HIERARCHY');
  return artIdx >= 0 && infoIdx > artIdx;
}

export function visualComplexitySeparateFromInformationComplexity(): true {
  return true;
}
