/**
 * C1.5 — Blind marketing-package test fixtures (no encoded winning concept).
 */

import type { SeniorCreativeJudgmentInput } from '../../../shared/site00-expression-engine/senior-creative-judgment/types.js';

export type ThinMarketingBrief = {
  briefId: string;
  brandName: string;
  projectId: string;
  campaignId: string;
  productTruth: string;
  campaignObjective: string;
  audience: string;
  tone: string;
  constraints: string[];
  desiredOutcome: string;
  availableFormats: Array<SeniorCreativeJudgmentInput['formatTarget']>;
};

export const SOLSTICE_AUDIO_LAUNCH_BRIEF: ThinMarketingBrief = {
  briefId: 'solstice-nova-wave-launch-2026',
  brandName: 'Solstice Audio',
  projectId: 'solstice-audio',
  campaignId: 'nova-wave-launch-q1',
  productTruth:
    'Nova Wave earbuds deliver studio-grade spatial accuracy without audiophile gatekeeping or spec-sheet posturing.',
  campaignObjective:
    'Launch hero campaign that proves precision can feel human — not clinical.',
  audience: 'Design-conscious commuters and creative professionals, 22–38, urban, anti-hype.',
  tone: 'Precise, warm, anti-spec-sheet, quietly confident.',
  constraints: ['No celebrity talent', 'No decibel-war chest-beating', 'Must work as Reel + Carousel'],
  desiredOutcome: 'Drive pre-order consideration through cultural insight, not feature lists.',
  availableFormats: ['REEL', 'CAROUSEL'],
};

export function buildBlindTestInitialConcept(brief: ThinMarketingBrief): SeniorCreativeJudgmentInput {
  return {
    projectId: brief.projectId,
    campaignId: brief.campaignId,
    contentUnitId: `${brief.briefId}-hero-reel`,
    formatTarget: 'REEL',
    conceptName: 'THE FIRST LISTEN ROOM',
    oneSentenceIdea:
      'A commuter hears the city differently when the earbuds reveal layers she never noticed — but the campaign must prove this is Solstice, not generic mindfulness.',
    thesis: brief.productTruth,
    world: 'Morning commute — train, street, office threshold',
    worldFunction: 'Transitions between public performance and private listening',
    artifact: null,
    artifactFunction: null,
    interjection: '',
    openingImage: 'Closed eyes on platform — city blur',
    centralReveal: 'Sound layers peel open — not louder, more precise',
    turningPoint: 'Subject removes one bud — world flattens',
    climaxImage: 'Single earbud on café table — city noise returns muted',
    endingImage: 'Open — next commute unknown',
    handoffOut: 'What else becomes audible when we stop performing immunity to noise?',
    entry004Tease: '',
    deeperContradiction:
      'We buy clarity to escape noise, but we also use noise to avoid hearing ourselves.',
    culturalRead: `${brief.audience} — ${brief.tone}`,
  };
}

export function buildBlindCampaignResponsibility(brief: ThinMarketingBrief): {
  campaignObjective: string;
  audienceShift: string;
  brandTruthToProve: string;
  emotionalDestination: string;
  conversionDestination: string;
} {
  return {
    campaignObjective: brief.campaignObjective,
    audienceShift: 'From spec-comparison shoppers to believers in perceptual precision',
    brandTruthToProve: brief.productTruth,
    emotionalDestination: 'Quiet confidence — hearing without performing taste',
    conversionDestination: brief.desiredOutcome,
  };
}
