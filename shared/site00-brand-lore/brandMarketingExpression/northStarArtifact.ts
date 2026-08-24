/**
 * Founder North Star 3×3 — persisted as CHARACTER_EXPRESSION_CALIBRATION.
 */

import { createHash } from 'node:crypto';
import type { FounderMarketingNorthStarArtifact, MarketingNorthStarForensicEvaluation } from './types.js';
import { FOUNDER_NORTH_STAR_CLASSIFICATION } from './constants.js';
import { NORTH_STAR_SURFACE_CAUSE_SEED } from './surfaceCauseClassification.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function buildFounderMarketingNorthStarArtifact(projectId = 'ndxbook'): FounderMarketingNorthStarArtifact {
  const panels = [
    {
      panelIndex: 1,
      panelCode: 'CR-01',
      title: 'Contradiction Log',
      topicDomain: 'corporate language',
      behavioralModeId: 'mode-01-side-eye',
      headline: 'interesting.',
      characterBehaviors: ['contradiction detection', 'comparison', 'withheld judgment'],
      makerTraces: ['circled conflicting statements', 'arrow connecting claims'],
      surfaceNotes: ['cream paper', 'lime emphasis on reaction word'],
      whyFeelsLikeNdx: 'NDX caught the lie between eras without performing outrage.',
    },
    {
      panelIndex: 2,
      panelCode: 'CR-02',
      title: 'Subscription Pattern',
      topicDomain: 'consumer behavior / money',
      behavioralModeId: 'mode-02-question',
      headline: 'WHY DOES EVERYTHING HAVE A SUBSCRIPTION NOW?',
      characterBehaviors: ['pattern notice', 'assumption challenge'],
      makerTraces: ['UI blocks collected', 'handwritten "we used to just buy things???"'],
      surfaceNotes: ['split layout', 'lime field + interface collage'],
      whyFeelsLikeNdx: 'Topic is mundane; character event is the irritation at recurring billing normalization.',
    },
    {
      panelIndex: 3,
      panelCode: 'CR-03',
      title: 'Cultural Reassessment',
      topicDomain: 'culture',
      behavioralModeId: 'mode-03-cultural-reassessment',
      headline: 'WE OWE HER AN APOLOGY. actually.',
      characterBehaviors: ['memory retrieval', 'cultural fluency', 'rejudgment'],
      makerTraces: ['archive headlines', 'sticky note callback'],
      surfaceNotes: ['newspaper clippings', 'portrait intervention'],
      whyFeelsLikeNdx: 'NDX participates in culture from inside shared memory, not trend commentary.',
    },
    {
      panelIndex: 4,
      panelCode: 'CR-04',
      title: 'Failed Promise',
      topicDomain: 'technology / retail',
      behavioralModeId: 'mode-04-failed-promise',
      headline: 'THIS WAS SUPPOSED TO SAVE US TIME.',
      characterBehaviors: ['promise vs reality', 'skepticism'],
      makerTraces: ['checkout timestamp log', 'photo annotation'],
      surfaceNotes: ['dark panel + kiosk photo'],
      whyFeelsLikeNdx: 'Evidence of broken efficiency claim, not generic tech criticism.',
    },
    {
      panelIndex: 5,
      panelCode: 'CR-05',
      title: 'Rabbit Hole',
      topicDomain: 'internet behavior',
      behavioralModeId: 'mode-05-rabbit-hole',
      headline: 'I HAVE A THEORY.',
      characterBehaviors: ['investigation', 'pattern suspicion', 'open conclusion'],
      makerTraces: ['detective wall graph', 'research snippets taped'],
      surfaceNotes: ['density shift', 'handwritten theory evolution'],
      whyFeelsLikeNdx: 'NDX holds the question open — does not manufacture certainty.',
    },
    {
      panelIndex: 6,
      panelCode: 'CR-06',
      title: 'Translation',
      topicDomain: 'business / work',
      behavioralModeId: 'mode-06-translation',
      headline: 'BE SERIOUS.',
      characterBehaviors: ['euphemism detection', 'plain judgment'],
      makerTraces: ['circled corporate memo phrase'],
      surfaceNotes: ['lime slanted shout over memo screenshot'],
      whyFeelsLikeNdx: 'NDX translates institutional language into human reaction.',
    },
    {
      panelIndex: 7,
      panelCode: 'CR-07',
      title: 'The Receipt',
      topicDomain: 'technology / memory',
      behavioralModeId: 'mode-07-receipt',
      headline: 'REMEMBER THIS?',
      characterBehaviors: ['memory', 'then/now comparison', 'callback'],
      makerTraces: ['2024 tweet vs 2025 headline', 'filed-away sticky dates'],
      surfaceNotes: ['archival layout'],
      whyFeelsLikeNdx: 'NDX saves evidence because context may change — receipt returns.',
    },
    {
      panelIndex: 8,
      panelCode: 'CR-08',
      title: 'Self-Correction',
      topicDomain: 'lifestyle / work',
      behavioralModeId: 'mode-08-self-correction',
      headline: 'I THOUGHT THIS WAS STUPID. I was wrong.',
      characterBehaviors: ['old belief preserved', 'new evidence', 'revision'],
      makerTraces: ['Feb opinion note', 'May revision sticky'],
      surfaceNotes: ['cross-out + handwritten update'],
      whyFeelsLikeNdx: 'Maturation visible — younger certainty revised without erasure.',
    },
    {
      panelIndex: 9,
      panelCode: 'CR-09',
      title: 'Connection',
      topicDomain: 'business / history',
      behavioralModeId: 'mode-09-connection',
      headline: 'different decade. same model.',
      characterBehaviors: ['structural similarity', 'synthesis'],
      makerTraces: ['Blockbuster card vs streaming UI', 'equals sign between eras'],
      surfaceNotes: ['comparative layout'],
      whyFeelsLikeNdx: 'NDX connects Thing A and Thing B through structure, not nostalgia.',
    },
  ];

  const artifact: FounderMarketingNorthStarArtifact = {
    id: 'north-star-ndxbook-3x3',
    projectId,
    classification: FOUNDER_NORTH_STAR_CLASSIFICATION,
    founderJudgment: 'THIS_IS_NDX',
    gridLayout: '3x3',
    panels,
    characterExpressionAuthority: 'HIGH',
    identityAuthority: 'NONE',
    surfaceAestheticsCanonized: false,
    persistedAt: new Date().toISOString(),
    fingerprint: '',
  };
  artifact.fingerprint = fp(artifact);
  return artifact;
}

export function evaluateNorthStarForensics(
  northStar: FounderMarketingNorthStarArtifact,
): MarketingNorthStarForensicEvaluation {
  return {
    evaluationId: `nsf-${northStar.id}`,
    northStarId: northStar.id,
    characterPresence: 'PASS',
    makerPresence: 'PASS',
    reaction: 'PASS',
    judgment: 'PASS',
    curiosity: 'PASS',
    synthesis: 'PASS',
    memory: 'PASS',
    culturalInteriority: 'PASS',
    humor: 'PASS',
    selfCorrection: 'PASS',
    graphicIntelligence: 'PASS',
    artisticAuthorship: 'PASS',
    surprise: 'PASS',
    informationDensityRange: 'PASS',
    humanResidue: 'PASS',
    surfaceCauseRecords: NORTH_STAR_SURFACE_CAUSE_SEED,
    notes: [
      'WHAT PROVES NDX WAS HERE: behavior, judgment, maker traces — not lime or collage alone.',
      'North Star authority: character presence level — NOT final palette, typography, or templates.',
    ],
    evaluatedAt: new Date().toISOString(),
  };
}

export function northStarNotFinalIdentity(artifact: FounderMarketingNorthStarArtifact): boolean {
  return artifact.identityAuthority === 'NONE' && artifact.surfaceAestheticsCanonized === false;
}

export function founderThisIsNdxJudgmentPersists(artifact: FounderMarketingNorthStarArtifact): boolean {
  return artifact.founderJudgment === 'THIS_IS_NDX';
}
