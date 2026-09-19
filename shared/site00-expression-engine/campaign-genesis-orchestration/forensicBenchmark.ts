/**
 * P0.CGO.1 — Forensic creative reconstruction benchmark (NOT a default template).
 * Labels explicitly as forensic reconstruction of observed jewelry/billiards logic.
 */

import type { CampaignWorldCandidate } from './types.js';
import {
  buildConceptualConvergenceMap,
  computeConceptualYieldScore,
} from './conceptualYieldScore.js';

export const FORENSIC_BENCHMARK_LABEL = 'FORENSIC CREATIVE RECONSTRUCTION' as const;

export function buildForensicBilliardsBenchmark(): CampaignWorldCandidate {
  const chain = {
    chainId: 'forensic-billiards',
    links: [
      { domain: 'PRODUCT' as const, term: 'Jewelry', distance: 'LITERAL' as const, rationale: 'Product category' },
      { domain: 'BODY_RELATIONSHIP' as const, term: 'Hands', distance: 'LITERAL' as const, rationale: 'Wear surface' },
      { domain: 'HUMAN_GESTURE' as const, term: 'Gameplay', distance: 'ADJACENT' as const, rationale: 'Hand-centric action' },
      { domain: 'GAME' as const, term: 'Billiards', distance: 'LATERAL' as const, rationale: 'Competitive hand game' },
      { domain: 'RISK' as const, term: 'Wager', distance: 'LATERAL' as const, rationale: 'Stakes' },
      { domain: 'PHRASE' as const, term: 'Double or nothing', distance: 'UNEXPECTED' as const, rationale: 'Title language' },
    ],
    connectiveLogic: 'Jewelry → Hands → Gameplay → Billiards → Wager → Double or nothing',
  };

  const convergence = buildConceptualConvergenceMap({
    centralIdea: 'DOUBLE OR NOTHING',
    dimensions: {
      SETTING: 'Pool hall — green felt, numbered balls, cues',
      TITLE: 'DOUBLE OR NOTHING',
      COPY: 'Wager language, numbered motifs',
      PROP_SYSTEM: 'Balls, cues, racks, chalk, felt',
      PRODUCT_ROLE: 'Co-star discovered through hands in play',
      BODY_INTERACTION: 'Hands gripping cue, stacking rings mid-shot',
      HUMAN_BEHAVIOR: 'Active gameplay — not posing',
      NAILS: 'Pool-ball / dice geometry nail art',
      HAIR: 'Visible in lifestyle wide shots, not beauty-portrait only',
      GRAPHIC_LANGUAGE: 'Circles, dots, numbers',
      COLOR: 'Green felt, ivory, chrome',
      MOTION: 'Cue strike, ball roll',
      SHOT_VARIETY: 'Wide hall, detail hands, macro nails, object balls',
      TEASER_POTENTIAL: 'Numbered ball clue before product reveal',
      REVEAL_POTENTIAL: 'Jewelry visible mid-wager',
      CHANNEL_ADAPTATION: 'Feed clue → Story BTS → Reel motion → Email payoff',
    },
  });

  return {
    candidateId: 'forensic-double-or-nothing',
    tier: 'FRESH',
    coreConcept: 'DOUBLE OR NOTHING',
    campaignTitleLanguage: 'DOUBLE OR NOTHING',
    setting: 'POOL HALL',
    associationChain: chain,
    convergenceMap: convergence,
    conceptualYield: computeConceptualYieldScore(convergence),
    brandFit: 0.85,
    originality: 0.9,
    humanExpression: {
      hair: ['Lifestyle visibility in wide gameplay shots'],
      nails: ['Pool-ball / dice geometry nail art'],
      makeup: ['Natural — not beauty-portrait dominant'],
      jewelry: ['Rings, bracelets in motion during play'],
      wardrobe: ['Casual luxe — not gown'],
      hands: ['Primary storytelling surface'],
      bodyLanguage: ['Leaning, aiming, wagering — active'],
      gesture: ['Cue grip, ball placement, coin flip'],
      movement: ['Strike, roll, celebrate'],
      attitude: ['Confident risk — witty not glam'],
    },
    productIntegration: [
      'Jewelry discovered through hand interaction',
      'Partial visibility before payoff',
      'Never centered in clue frames',
    ],
    motifs: ['Numbered balls', 'Green felt', 'Cues', 'Racks', 'Circles', 'Dots', 'Wager language'],
    copyLanguage: ['Double or nothing', 'All in', 'Call it'],
    propSystem: ['Pool balls', 'Cue sticks', 'Chalk', 'Coin', 'Rack'],
    risk: 'MEDIUM',
    whyItWorks: `${FORENSIC_BENCHMARK_LABEL}: One lateral chain generates setting, props, nails, copy, motion, and shot sequence coherently.`,
    isForensicBenchmark: true,
  };
}

export function buildWeakLuxuryBenchmark(): CampaignWorldCandidate {
  const convergence = buildConceptualConvergenceMap({
    centralIdea: 'LUXURY JEWELRY IN A STYLISH LOCATION',
    dimensions: {
      SETTING: 'Generic stylish interior',
      PRODUCT_ROLE: 'Hero centered in frame',
    },
  });

  return {
    candidateId: 'weak-luxury-location',
    tier: 'SAFE',
    coreConcept: 'LUXURY JEWELRY IN A STYLISH LOCATION',
    campaignTitleLanguage: 'TIMELESS LUXURY',
    setting: 'COOL HOTEL LOBBY',
    associationChain: {
      chainId: 'weak-literal',
      links: [
        { domain: 'PRODUCT', term: 'Jewelry', distance: 'LITERAL', rationale: 'Product only' },
        { domain: 'ENVIRONMENT', term: 'Stylish hotel', distance: 'LITERAL', rationale: 'Generic backdrop' },
      ],
      connectiveLogic: 'Jewelry → Stylish hotel (no behavioral chain)',
    },
    convergenceMap: convergence,
    conceptualYield: computeConceptualYieldScore(convergence),
    brandFit: 0.5,
    originality: 0.15,
    humanExpression: {
      hair: [],
      nails: [],
      makeup: ['Full glam portrait'],
      jewelry: ['Centered hero'],
      wardrobe: ['Generic editorial'],
      hands: [],
      bodyLanguage: ['Static pose'],
      gesture: [],
      movement: [],
      attitude: [],
    },
    productIntegration: ['Product centered every frame'],
    motifs: [],
    copyLanguage: ['Timeless luxury', 'Elevate your look'],
    propSystem: [],
    risk: 'LOW',
    whyItWorks: 'Weak benchmark — high aesthetic potential but LOW conceptual yield. Environment is backdrop only.',
  };
}
