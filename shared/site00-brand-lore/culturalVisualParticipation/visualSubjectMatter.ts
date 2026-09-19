/**
 * Visual subject matter decision — per topic reasoning.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { MarketingContentThesis } from '../brandMarketingExpression/types.js';
import type { Experiment01TopicSpec } from '../brandMarketingExpression/characterEventFormulation.js';
import type {
  CulturalVisualEvidence,
  CulturalVisualEvidenceClass,
  CulturalVisualRole,
  ImageParticipationRequirement,
  VisualParticipationMode,
  VisualSubjectMatterDecision,
} from './types.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export type TopicVisualProfile = {
  mode: VisualParticipationMode;
  requirement: ImageParticipationRequirement;
  subject: string;
  evidenceClass: CulturalVisualEvidenceClass;
  visualRole: CulturalVisualRole;
  whyBelongs: string;
  humanPresence: boolean;
  imageHero: boolean;
  objectHero: boolean;
};

const TOPIC_VISUAL_PROFILES: Record<number, TopicVisualProfile> = {
  1: {
    mode: 'IMAGE_PLUS_EVIDENCE',
    requirement: 'STRONGLY_RECOMMENDED',
    subject: 'product ownership ecosystem — objects that used to be bought once',
    evidenceClass: 'PRODUCT',
    visualRole: 'SUBJECT',
    whyBelongs: 'Subscription normalization is felt through objects and ownership history, not only UI screenshots',
    humanPresence: false,
    imageHero: false,
    objectHero: true,
  },
  2: {
    mode: 'IMAGE_PLUS_EVIDENCE',
    requirement: 'STRONGLY_RECOMMENDED',
    subject: 'documentary photograph of checkout queue vs self-checkout experience',
    evidenceClass: 'DOCUMENTARY_PHOTOGRAPHY',
    visualRole: 'EMOTIONAL_ENTRY',
    whyBelongs: 'The human experience of waiting makes the failed promise visceral before the time evidence',
    humanPresence: true,
    imageHero: true,
    objectHero: false,
  },
  3: {
    mode: 'IMAGE_DOMINANT',
    requirement: 'REQUIRED',
    subject: 'archival portrait / cultural figure at center of reassessment',
    evidenceClass: 'ARCHIVAL_PHOTOGRAPHY',
    visualRole: 'HERO',
    whyBelongs: 'Cultural reassessment — the person embodies the argument; evidence supports the image',
    humanPresence: true,
    imageHero: true,
    objectHero: false,
  },
  4: {
    mode: 'MIXED_MEDIA',
    requirement: 'STRONGLY_RECOMMENDED',
    subject: 'rabbit-hole collage — feeds, screens, cultural fragments connected',
    evidenceClass: 'COLLAGE_FRAGMENT',
    visualRole: 'PATTERN',
    whyBelongs: 'Theory unfolding benefits from visual curiosity and mixed cultural residue',
    humanPresence: false,
    imageHero: false,
    objectHero: false,
  },
  5: {
    mode: 'TYPOGRAPHY_DOMINANT',
    requirement: 'NOT_HELPFUL',
    subject: 'N/A',
    evidenceClass: 'TYPOGRAPHIC_OBJECT',
    visualRole: 'SUBJECT',
    whyBelongs: 'Corporate euphemism — the language itself is the visual subject',
    humanPresence: false,
    imageHero: false,
    objectHero: false,
  },
  6: {
    mode: 'IMAGE_PLUS_TYPOGRAPHY',
    requirement: 'STRONGLY_RECOMMENDED',
    subject: 'archival screenshot/tweet juxtaposed with current headline',
    evidenceClass: 'HISTORICAL_IMAGE',
    visualRole: 'CONTRAST',
    whyBelongs: 'Receipt behavior — then/now visual comparison is the catch',
    humanPresence: false,
    imageHero: true,
    objectHero: false,
  },
  7: {
    mode: 'ARTIFACT_DOMINANT',
    requirement: 'REQUIRED',
    subject: 'standing desk / lifestyle object at center',
    evidenceClass: 'OBJECT',
    visualRole: 'SUBJECT',
    whyBelongs: 'Self-correction about a product — the object carries the admission',
    humanPresence: false,
    imageHero: false,
    objectHero: true,
  },
  8: {
    mode: 'PHOTOGRAPHIC_ASSEMBLAGE',
    requirement: 'STRONGLY_RECOMMENDED',
    subject: 'Blockbuster-era late fee imagery vs streaming cancellation visual',
    evidenceClass: 'ARCHIVAL_PHOTOGRAPHY',
    visualRole: 'CONTRAST',
    whyBelongs: 'Historical callback across decades — photographic comparison is the argument',
    humanPresence: true,
    imageHero: true,
    objectHero: false,
  },
  9: {
    mode: 'IMAGE_PLUS_TYPOGRAPHY',
    requirement: 'OPTIONAL',
    subject: 'minimal visual interruption — deadpan contrast',
    evidenceClass: 'SYMBOLIC_IMAGE',
    visualRole: 'HUMOR',
    whyBelongs: 'Playful side-eye — sparse typographic interruption may suffice',
    humanPresence: false,
    imageHero: false,
    objectHero: false,
  },
};

export function buildVisualSubjectMatterDecision(params: {
  artifact: BrandMarketingArtifact;
  thesis: MarketingContentThesis;
  spec: Experiment01TopicSpec;
}): VisualSubjectMatterDecision {
  const profile = TOPIC_VISUAL_PROFILES[params.spec.topicIndex] ?? TOPIC_VISUAL_PROFILES[1]!;
  const notHelpful = profile.requirement === 'NOT_HELPFUL';

  const decision: VisualSubjectMatterDecision = {
    decisionId: `vsm-${randomUUID().slice(0, 8)}`,
    artifactId: params.artifact.id,
    participationMode: profile.mode,
    imageParticipationRequired: profile.requirement,
    culturalVisualSubject: notHelpful ? 'N/A — typography carries slide' : profile.subject,
    whyImageBelongs: notHelpful ? null : profile.whyBelongs,
    whyImageDoesNotBelong: notHelpful ? 'Pure language contradiction — image would weaken the artifact' : null,
    humanPresence: profile.humanPresence,
    imageHero: profile.imageHero,
    objectHero: profile.objectHero,
    culturalContextVisible: profile.requirement === 'REQUIRED' || profile.requirement === 'STRONGLY_RECOMMENDED',
    visualSubjectMatterReasoning: [
      `Topic: ${params.spec.topic}`,
      `Behavioral mode: ${params.spec.behavioralModeId}`,
      `Thesis: ${params.thesis.whatNDXNoticed}`,
    ],
    fingerprint: '',
  };
  decision.fingerprint = fp(decision);
  return decision;
}

export function buildCulturalVisualEvidence(params: {
  artifactId: string;
  profile: TopicVisualProfile;
}): CulturalVisualEvidence {
  return {
    evidenceId: `cve-${randomUUID().slice(0, 8)}`,
    evidenceClass: params.profile.evidenceClass,
    visualRole: params.profile.visualRole,
    subjectDescription: params.profile.subject,
    sourceProvenance: params.profile.requirement === 'NOT_HELPFUL' ? null : 'TOPIC-SPECIFIC — sourced or generated as permitted',
    usageStatus: 'ILLUSTRATIVE',
    licensingStatus: null,
    referenceDate: null,
    referenceId: null,
    transformationStatus: null,
    evidenceClassification:
      params.profile.mode === 'TYPOGRAPHY_DOMINANT' ? 'SYMBOLIC_EXPRESSION' : 'CULTURAL_SOURCE_EVIDENCE',
    servesThesis: true,
    decorativeOnly: false,
  };
}

export function getTopicVisualProfile(topicIndex: number): TopicVisualProfile {
  return TOPIC_VISUAL_PROFILES[topicIndex] ?? TOPIC_VISUAL_PROFILES[1]!;
}

export function imageDominantSupported(mode: VisualParticipationMode): boolean {
  return ['IMAGE_DOMINANT', 'IMAGE_PLUS_TYPOGRAPHY', 'IMAGE_PLUS_EVIDENCE', 'PHOTOGRAPHIC_ASSEMBLAGE', 'ARTIFACT_DOMINANT', 'MIXED_MEDIA', 'ILLUSTRATION_DOMINANT'].includes(mode);
}

export function typographyDominantRemainsSupported(mode: VisualParticipationMode): boolean {
  return mode === 'TYPOGRAPHY_DOMINANT';
}

export function decorativeOnlyCulturalImageFails(evidence: CulturalVisualEvidence): boolean {
  return evidence.decorativeOnly && evidence.visualRole !== 'ATMOSPHERE';
}

export function randomCelebrityImageFails(subject: string, thesisSubject: string): boolean {
  return /random celebrity|unnamed celebrity|stock model portrait/i.test(subject) && !thesisSubject.toLowerCase().includes('celebrity');
}

export function imageParticipationDecisionExistsBeforeGeneration(decision: VisualSubjectMatterDecision | null): boolean {
  return decision !== null && Boolean(decision.participationMode);
}
