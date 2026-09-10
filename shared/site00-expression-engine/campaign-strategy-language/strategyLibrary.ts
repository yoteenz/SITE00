/**
 * P0.CSI.1 — Campaign strategy taxonomy (20 strategies).
 * Each strategy describes narrative/world behavior — NOT visual style.
 */

import type {
  CampaignSequenceStep,
  CampaignStrategyDefinition,
  CampaignStrategyType,
} from './types.js';

const LIVED_IN_SEQUENCE: CampaignSequenceStep[] = [
  { order: 1, beat: 'SET THE WORLD', shotRhythm: 'ESTABLISHING' },
  { order: 2, beat: 'INTRODUCE A CLUE', shotRhythm: 'DETAIL' },
  { order: 3, beat: 'REPEAT THE MOTIF', shotRhythm: 'OBJECT' },
  { order: 4, beat: 'SHOW PRODUCT INDIRECTLY', shotRhythm: 'PRODUCT_CLOSEUP' },
  { order: 5, beat: 'INTRODUCE HUMAN PRESENCE', shotRhythm: 'HANDS' },
  { order: 6, beat: 'REVEAL PRODUCT MORE CLEARLY', shotRhythm: 'INTERACTION' },
  { order: 7, beat: 'EXPAND TO LIFESTYLE', shotRhythm: 'FULL_BODY' },
  { order: 8, beat: 'PAYOFF / FULL REVEAL', shotRhythm: 'PAYOFF' },
];

function baseProfile(
  overrides: Partial<CampaignStrategyDefinition['defaultProfile']>,
): CampaignStrategyDefinition['defaultProfile'] {
  return {
    strategyTypes: [],
    expressionLanguages: ['ORGANIC'],
    energyLevel: 'MEDIUM',
    polishLevel: 'MEDIUM',
    productProminence: 'MEDIUM',
    personalityProminence: 'MEDIUM',
    environmentProminence: 'MEDIUM',
    narrativeDensity: 'MEDIUM',
    copyDensity: 'LOW',
    humorLevel: 'LOW',
    abstractionLevel: 'LOW',
    intimacyLevel: 'MEDIUM',
    surpriseLevel: 'MEDIUM',
    culturalSpecificity: 'MEDIUM',
    visualRisk: 'MEDIUM',
    pace: 'MEDIUM',
    revealStyle: 'PROGRESSIVE',
    ...overrides,
  };
}

function def(
  strategyType: CampaignStrategyType,
  name: string,
  description: string,
  traits: string[],
  partial: Omit<Partial<CampaignStrategyDefinition>, 'defaultProfile'> & {
    defaultProfile?: Partial<CampaignStrategyDefinition['defaultProfile']>;
  },
): CampaignStrategyDefinition {
  const profile = baseProfile({
    strategyTypes: [strategyType],
    ...partial.defaultProfile,
  });
  return {
    strategyType,
    name,
    description,
    traits,
    defaultProfile: profile,
    defaultProductRole: partial.defaultProductRole ?? 'CO_STAR',
    defaultHumanRole: partial.defaultHumanRole ?? 'CO_STAR',
    defaultEnvironmentRole: partial.defaultEnvironmentRole ?? 'STORY_ENGINE',
    defaultRevealStrategy: partial.defaultRevealStrategy ?? 'PROGRESSIVE',
    defaultShotRhythm: partial.defaultShotRhythm ?? ['ESTABLISHING', 'DETAIL', 'PAYOFF'],
    defaultSequenceGrammar: partial.defaultSequenceGrammar ?? [],
    defaultCopyBehavior: partial.defaultCopyBehavior ?? 'NO_COPY',
    compatibleExpressionLanguages: partial.compatibleExpressionLanguages ?? ['ORGANIC'],
    exampleVisualStyles: partial.exampleVisualStyles ?? [],
  };
}

export const CAMPAIGN_STRATEGY_LIBRARY: Record<CampaignStrategyType, CampaignStrategyDefinition> = {
  LIVED_IN_ENVIRONMENTAL: def(
    'LIVED_IN_ENVIRONMENTAL',
    'LIVED-IN ENVIRONMENTAL STORYTELLING',
    'Product is embedded naturally inside a real or believable world. Setting does the storytelling. Product is discovered through the environment.',
    [
      'environmental narrative',
      'progressive reveal',
      'incidental product visibility',
      'recurring motifs',
      'personality integrated',
      'low-copy confidence',
      'authentic-feeling sequencing',
    ],
    {
      defaultProfile: {
        strategyTypes: ['LIVED_IN_ENVIRONMENTAL'],
        expressionLanguages: ['ORGANIC', 'WITTY', 'LUXURIOUS', 'ENVIRONMENTAL', 'INTIMATE'],
        environmentProminence: 'HIGH',
        productProminence: 'MEDIUM_VARIABLE',
        personalityProminence: 'HIGH',
        copyDensity: 'LOW',
        humorLevel: 'VARIABLE',
        polishLevel: 'POLISHED_BUT_NOT_STERILE',
        revealStyle: 'PROGRESSIVE',
      },
      defaultProductRole: 'CO_STAR',
      defaultHumanRole: 'HANDS_ONLY',
      defaultEnvironmentRole: 'STORY_ENGINE',
      defaultRevealStrategy: 'PROGRESSIVE',
      defaultShotRhythm: [
        'ESTABLISHING',
        'DETAIL',
        'HANDS',
        'PRODUCT_CLOSEUP',
        'ENVIRONMENT',
        'INTERACTION',
        'PAYOFF',
      ],
      defaultSequenceGrammar: LIVED_IN_SEQUENCE,
      defaultCopyBehavior: 'NO_COPY',
      compatibleExpressionLanguages: [
        'ORGANIC',
        'WITTY',
        'LUXURIOUS',
        'ENVIRONMENTAL',
        'INTIMATE',
        'WARM',
        'RELATABLE',
      ],
      exampleVisualStyles: ['Editorial flash photography', 'Natural light environmental'],
    },
  ),

  HERO_PRODUCT_REVEAL: def(
    'HERO_PRODUCT_REVEAL',
    'HERO PRODUCT REVEAL',
    'The product is the star. Campaign builds toward a strong product reveal.',
    ['product-forward', 'controlled composition', 'suspense', 'high visual polish', 'reveal moment'],
    {
      defaultProfile: {
        productProminence: 'HIGH',
        environmentProminence: 'LOW',
        copyDensity: 'LOW',
        polishLevel: 'HIGH',
        revealStyle: 'DELAYED',
      },
      defaultProductRole: 'HERO',
      defaultRevealStrategy: 'DELAYED',
      compatibleExpressionLanguages: ['CINEMATIC', 'LUXURIOUS', 'POLISHED', 'CONTROLLED'],
      exampleVisualStyles: ['Studio hero lighting', 'Macro product photography'],
    },
  ),

  CHARACTER_LED: def(
    'CHARACTER_LED',
    'CHARACTER-LED CAMPAIGN',
    'A person or persona carries the story. Product exists as part of their world.',
    ['personality-forward', 'character arc', 'lifestyle cues', 'recurring styling'],
    {
      defaultProductRole: 'CO_STAR',
      defaultHumanRole: 'HERO',
      defaultProfile: { personalityProminence: 'HIGH', productProminence: 'MEDIUM' },
      compatibleExpressionLanguages: ['INTIMATE', 'WARM', 'PLAYFUL', 'CINEMATIC'],
    },
  ),

  OBJECT_AS_CHARACTER: def(
    'OBJECT_AS_CHARACTER',
    'OBJECT-AS-CHARACTER',
    'Product or prop is treated like a character with its own presence.',
    ['anthropomorphic framing', 'recurring object behavior', 'visual wit'],
    {
      defaultProductRole: 'HERO',
      defaultHumanRole: 'NO_HUMAN',
      defaultProfile: { humorLevel: 'HIGH', surpriseLevel: 'HIGH', visualRisk: 'HIGH' },
      compatibleExpressionLanguages: ['PLAYFUL', 'WITTY', 'CAMP', 'POP'],
    },
  ),

  PROCESS_ACCESS: def(
    'PROCESS_ACCESS',
    'PROCESS / ACCESS CAMPAIGN',
    'Audience is invited behind the scenes or into the making.',
    ['insider access', 'process evidence', 'unfinished moments', 'workshop energy'],
    {
      defaultEnvironmentRole: 'REAL_LOCATION',
      defaultCopyBehavior: 'DOCUMENTARY',
      compatibleExpressionLanguages: ['DOCUMENTARY', 'RAW', 'INSIDER', 'ORGANIC'],
      exampleVisualStyles: ['Workshop documentary', 'Behind-the-scenes candid'],
    },
  ),

  RECEIPT_PROOF: def(
    'RECEIPT_PROOF',
    'RECEIPT / PROOF CAMPAIGN',
    'Campaign built around evidence, results, receipts, or before/after proof.',
    ['proof-first', 'documentation', 'measurable evidence', 'comparison'],
    {
      defaultCopyBehavior: 'DIRECT',
      defaultProfile: { copyDensity: 'MEDIUM', narrativeDensity: 'LOW' },
      compatibleExpressionLanguages: ['DOCUMENTARY', 'OBSERVATIONAL', 'INTELLECTUAL'],
    },
  ),

  CULTURAL_CALLBACK: def(
    'CULTURAL_CALLBACK',
    'CULTURAL CALLBACK',
    'Uses a recognizable era, memory, aesthetic, or cultural reference as the entry point.',
    ['nostalgia', 'remix', 'memory', 'cultural recognition'],
    {
      defaultProfile: { culturalSpecificity: 'HIGH' },
      compatibleExpressionLanguages: ['NOSTALGIC', 'POP', 'CAMP', 'STREET'],
    },
  ),

  SOCIAL_OBSERVATION: def(
    'SOCIAL_OBSERVATION',
    'SOCIAL OBSERVATION',
    'Campaign begins with a behavior, contradiction, or cultural truth.',
    ['observational', 'witty', 'relatable tension', 'commentary'],
    {
      defaultCopyBehavior: 'OBSERVATIONAL',
      defaultProfile: { humorLevel: 'HIGH', copyDensity: 'MEDIUM' },
      compatibleExpressionLanguages: ['WITTY', 'OBSERVATIONAL', 'DEADPAN', 'INTELLECTUAL'],
    },
  ),

  MICRO_NARRATIVE_SERIES: def(
    'MICRO_NARRATIVE_SERIES',
    'MICRO-NARRATIVE SERIES',
    'Campaign unfolds through small connected story beats over multiple posts.',
    ['episodic', 'breadcrumb storytelling', 'callbacks', 'serial structure'],
    {
      defaultRevealStrategy: 'SERIAL',
      defaultProfile: { narrativeDensity: 'HIGH', pace: 'MEDIUM' },
      compatibleExpressionLanguages: ['INTIMATE', 'MYSTERIOUS', 'PLAYFUL'],
    },
  ),

  ONE_LOCATION_STUDY: def(
    'ONE_LOCATION_STUDY',
    'ONE-LOCATION STUDY',
    'One location used repeatedly from many angles to create variety with cohesion.',
    ['environmental consistency', 'shot variety', 'economical production'],
    {
      defaultEnvironmentRole: 'RECURRING_WORLD',
      defaultProfile: { environmentProminence: 'HIGH' },
      compatibleExpressionLanguages: ['ENVIRONMENTAL', 'ORGANIC', 'EDITORIAL'],
    },
  ),

  VISUAL_GAME: def(
    'VISUAL_GAME',
    'VISUAL GAME / MECHANIC',
    'Campaign built around a simple repeatable game or rule.',
    ['repeatability', 'audience participation', 'visual logic', 'wit'],
    {
      defaultProfile: { humorLevel: 'HIGH', surpriseLevel: 'HIGH' },
      compatibleExpressionLanguages: ['PLAYFUL', 'WITTY', 'POP'],
    },
  ),

  INTIMATE_DOCUMENTARY: def(
    'INTIMATE_DOCUMENTARY',
    'INTIMATE DOCUMENTARY',
    'Feels personal, private, close, or observed rather than staged.',
    ['candid framing', 'quiet moments', 'imperfect polish', 'emotional closeness'],
    {
      defaultProfile: { intimacyLevel: 'HIGH', polishLevel: 'LOW' },
      defaultCopyBehavior: 'INTIMATE',
      compatibleExpressionLanguages: ['INTIMATE', 'RAW', 'DOCUMENTARY', 'QUIET'],
      exampleVisualStyles: ['Handheld documentary', 'Natural grain intimate'],
    },
  ),

  HIGH_CONCEPT_EDITORIAL: def(
    'HIGH_CONCEPT_EDITORIAL',
    'HIGH-CONCEPT EDITORIAL',
    'Campaign built around a strong visual idea or metaphor.',
    ['conceptual', 'stylized', 'art-directed', 'symbolic logic'],
    {
      defaultProfile: { abstractionLevel: 'HIGH', visualRisk: 'HIGH' },
      compatibleExpressionLanguages: ['EDITORIAL', 'ART_HOUSE', 'CINEMATIC', 'MAXIMAL'],
      exampleVisualStyles: ['Conceptual art direction', 'Fashion editorial staging'],
    },
  ),

  EVERYDAY_LUXURY: def(
    'EVERYDAY_LUXURY',
    'EVERYDAY LUXURY',
    'Luxury product appears in normal routines / real life.',
    ['relatability', 'aspiration without distance', 'incidental elegance'],
    {
      defaultProfile: { productProminence: 'MEDIUM', environmentProminence: 'MEDIUM' },
      compatibleExpressionLanguages: ['LUXURIOUS', 'RELATABLE', 'WARM', 'ORGANIC'],
    },
  ),

  EVENTIZED_DROP: def(
    'EVENTIZED_DROP',
    'EVENTIZED DROP',
    'Campaign turns a product release into a moment / occasion.',
    ['countdown', 'anticipation', 'time-based release', 'launch ritual'],
    {
      defaultRevealStrategy: 'DELAYED',
      defaultProfile: { pace: 'HIGH', energyLevel: 'HIGH' },
      compatibleExpressionLanguages: ['LOUD', 'CINEMATIC', 'GLAM'],
    },
  ),

  FOUND_OBJECT_DISCOVERY: def(
    'FOUND_OBJECT_DISCOVERY',
    'FOUND-OBJECT / ENVIRONMENTAL DISCOVERY',
    'Product or brand mark appears in unexpected places inside the world.',
    ['Easter eggs', 'discovery', 'subtle branding', 'visual surprise'],
    {
      defaultProductRole: 'EASTER_EGG',
      defaultRevealStrategy: 'HIDDEN_IN_PLAIN_SIGHT',
      compatibleExpressionLanguages: ['MYSTERIOUS', 'WITTY', 'ENVIRONMENTAL'],
    },
  ),

  TESTIMONIAL_AS_STORY: def(
    'TESTIMONIAL_AS_STORY',
    'TESTIMONIAL-AS-STORY',
    'Customer experience treated as narrative rather than a review card.',
    ['lived evidence', 'emotional specificity', 'authentic voice'],
    {
      defaultHumanRole: 'CUSTOMER',
      defaultCopyBehavior: 'INTIMATE',
      compatibleExpressionLanguages: ['INTIMATE', 'SENTIMENTAL', 'DOCUMENTARY'],
    },
  ),

  TRANSFORMATION_ARC: def(
    'TRANSFORMATION_ARC',
    'TRANSFORMATION ARC',
    'Campaign centers on change — before / during / after.',
    ['identity shift', 'visible transformation', 'emotional payoff'],
    {
      defaultProductRole: 'TRANSFORMATION_TRIGGER',
      defaultRevealStrategy: 'PROGRESSIVE',
      compatibleExpressionLanguages: ['CINEMATIC', 'SENTIMENTAL', 'ASPIRATIONAL'],
    },
  ),

  WORLD_BUILDING: def(
    'WORLD_BUILDING',
    'WORLD-BUILDING CAMPAIGN',
    'Brand creates a repeatable fictional or heightened world.',
    ['recurring locations', 'lore', 'visual continuity', 'expandable universe'],
    {
      defaultEnvironmentRole: 'RECURRING_WORLD',
      defaultProfile: { narrativeDensity: 'HIGH', environmentProminence: 'HIGH' },
      compatibleExpressionLanguages: ['CINEMATIC', 'FUTURISTIC', 'MYSTERIOUS', 'ART_HOUSE'],
    },
  ),

  ANTI_CAMPAIGN_DEADPAN: def(
    'ANTI_CAMPAIGN_DEADPAN',
    'ANTI-CAMPAIGN / DEADPAN',
    'Campaign deliberately undersells or acts casual.',
    ['restraint', 'irony', 'understatement', 'anti-ad energy'],
    {
      defaultCopyBehavior: 'DEADPAN',
      defaultProfile: { copyDensity: 'LOW', energyLevel: 'LOW', humorLevel: 'MEDIUM' },
      compatibleExpressionLanguages: ['DEADPAN', 'IRREVERENT', 'MINIMAL', 'COOL'],
    },
  ),
};

export function getStrategyDefinition(
  strategyType: CampaignStrategyType,
): CampaignStrategyDefinition {
  return CAMPAIGN_STRATEGY_LIBRARY[strategyType];
}

export function listAllStrategyTypes(): CampaignStrategyType[] {
  return Object.keys(CAMPAIGN_STRATEGY_LIBRARY) as CampaignStrategyType[];
}

export const LIVED_IN_ENVIRONMENTAL_ALIASES = [
  'ENVIRONMENTAL NARRATIVE',
  'WORLD-INTEGRATED PRODUCT STORYTELLING',
] as const;
