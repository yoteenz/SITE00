/**
 * C1.6 — Fresh multi-unit blind campaign fixture (non-NDXBOOK, non-Solstice, thin brief only).
 */

export type ThinMultiUnitBrief = {
  briefId: string;
  brandName: string;
  projectId: string;
  campaignId: string;
  brandTruth: string;
  campaignObjective: string;
  targetAudience: string;
  productOrService: string;
  launchContext: string;
  tone: string;
  businessGoal: string;
  constraints: string[];
  requiredChannels: string[];
  founderCreativeAppetite: string;
};

/** Fictional brand — no encoded concept, world, or winning direction in fixture. */
export const VERDANT_ROW_LAUNCH_BRIEF: ThinMultiUnitBrief = {
  briefId: 'verdant-row-spring-rescue-2026',
  brandName: 'Verdant Row',
  projectId: 'verdant-row',
  campaignId: 'spring-plant-rescue-q2',
  brandTruth:
    'Most plant subscriptions assume competence. Verdant Row assumes guilt, panic, and hope in equal measure — and meets people where their leaves actually are.',
  campaignObjective:
    'Launch Spring Rescue subscription — convert chronic plant killers into believers that care can be taught, not performed.',
  targetAudience:
    'Urban millennials and Gen Z with dead or dying plants, apartment light anxiety, shame about easy plants dying.',
  productOrService:
    'Seasonal plant rescue subscription with diagnostic onboarding and adaptive care coaching.',
  launchContext: 'Spring reset window — people repot, confess, and retry.',
  tone: 'Warm, honest, lightly irreverent, anti-perfectionist.',
  businessGoal: 'Drive trial subscriptions without mockery or aspirational garden porn.',
  constraints: [
    'No influencer unboxings',
    'No hyper-lush greenhouse fantasy',
    'Must work across Reel + social + email',
  ],
  requiredChannels: ['REEL', 'CAROUSEL', 'STORY', 'X', 'EMAIL'],
  founderCreativeAppetite: 'Moderate risk — humor ok if human truth leads.',
};

export function buildCampaignResponsibilityFromBrief(brief: ThinMultiUnitBrief) {
  return {
    campaignThesis: `${brief.brandName} proves ${brief.productOrService} without pretending plant care is intuitive.`,
    audienceStartingBelief: 'I kill plants because I am bad at life, not because the system failed me.',
    audienceDesiredShift: 'Plant care is diagnosable — shame can become curiosity.',
    brandTruthToProve: brief.brandTruth,
    emotionalDestination: 'Relief that failure is data, not identity.',
    conversionDestination: brief.businessGoal,
    creativeRisk: brief.founderCreativeAppetite,
    campaignQuestion: 'What if the first honest step in plant care is admitting the leaf already told you?',
    campaignPayoff: 'Subscription trial driven by confession, not aspiration.',
  };
}
