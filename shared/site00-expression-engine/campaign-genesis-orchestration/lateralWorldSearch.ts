/**
 * P0.CGO.2 — LateralWorldSearch: worlds unrelated to product category with natural interaction.
 */

import type { CampaignFlavorProfile } from '../campaign-strategy-language/types.js';
import type { FounderCreativeAppetiteProfile } from '../../site00-brand-lore/founderCreativeAppetite/types.js';
import type { ToleranceBand } from '../../site00-brand-lore/founderCreativeAppetite/constants.js';
import type { BrandCampaignHistorySummary } from '../../site00-brand-lore/brandCreativeContext/types.js';
import type { ProductCategory } from './types.js';
import type {
  InteractionDomain,
  LateralWorldCandidate,
  ProductInteractionProfile,
  WorldCategoryDistance,
} from './conceptualEfficiencyTypes.js';
import { LITERAL_BEAUTY_WORLDS } from './conceptualEfficiencyTypes.js';

export type LateralWorldSearchInput = {
  brandSlug: string;
  productCategory: ProductCategory;
  interactionProfile: ProductInteractionProfile;
  objective: string;
  campaignFlavor?: CampaignFlavorProfile | null;
  creativeAppetite?: FounderCreativeAppetiteProfile | null;
  campaignHistory?: BrandCampaignHistorySummary;
};

const INTERACTION_DOMAIN_WORLDS: Record<string, Array<{ world: string; setting: string; distance: WorldCategoryDistance; domains: InteractionDomain[] }>> = {
  HANDS_GAMEPLAY: [
    { world: 'GAME TABLE', setting: 'COMPETITIVE GAME ROOM', distance: 'LATERAL', domains: ['GAMEPLAY', 'RITUAL', 'TOUCH'] },
    { world: 'WORK BENCH', setting: 'CRAFT / REPAIR TABLE', distance: 'LATERAL', domains: ['WORK', 'TOUCH', 'PRESSURE'] },
    { world: 'TRANSIT GATE', setting: 'TURNSTILE / TICKET BOOTH', distance: 'LATERAL', domains: ['TRANSIT', 'SPEED', 'PUBLIC_SPACE'] },
    { world: 'FOOD PREP', setting: 'KITCHEN PASS / PLATING', distance: 'UNEXPECTED', domains: ['FOOD', 'RITUAL', 'TOUCH'] },
  ],
  HAIR_MOTION: [
    { world: 'TRANSIT PLATFORM', setting: 'SUBWAY / TRAIN ARRIVAL', distance: 'LATERAL', domains: ['TRANSIT', 'WIND', 'SPEED'] },
    { world: 'ELEVATOR RITUAL', setting: 'VINTAGE ELEVATOR', distance: 'LATERAL', domains: ['TRANSIT', 'REFLECTION', 'RITUAL'] },
    { world: 'ROOFTOP EDGE', setting: 'PARAPET AT GOLDEN HOUR', distance: 'UNEXPECTED', domains: ['WIND', 'LIGHT', 'PERFORMANCE'] },
    { world: 'DANCE FLOOR', setting: 'CLUB / REHEARSAL', distance: 'LATERAL', domains: ['RHYTHM', 'MOTION', 'NIGHTLIFE'] },
    { world: 'POOL LANE', setting: 'SWIM START BLOCK', distance: 'UNEXPECTED', domains: ['WATER', 'SPEED', 'SPORT'] },
  ],
  GENERAL_OBSERVATION: [
    { world: 'LIBRARY TABLE', setting: 'ANNOTATED BOOKS', distance: 'LATERAL', domains: ['WORK', 'RITUAL', 'PUBLIC_SPACE'] },
    { world: 'CAFE CORNER', setting: 'MUNDANE CAFE', distance: 'LATERAL', domains: ['SOCIAL_BEHAVIOR', 'LEISURE'] },
    { world: 'RECEIPT WALL', setting: 'PROOF PINBOARD', distance: 'ADJACENT', domains: ['WORK', 'RITUAL'] },
  ],
};

function selectWorldPool(category: ProductCategory): typeof INTERACTION_DOMAIN_WORLDS.HANDS_GAMEPLAY {
  if (category === 'HAIR') return INTERACTION_DOMAIN_WORLDS.HAIR_MOTION;
  if (category === 'JEWELRY') return INTERACTION_DOMAIN_WORLDS.HANDS_GAMEPLAY;
  return INTERACTION_DOMAIN_WORLDS.GENERAL_OBSERVATION;
}

function bandToScore(band: ToleranceBand | null | undefined): number {
  const map: Record<ToleranceBand, number> = {
    CONSERVATIVE: 0.2,
    CONTROLLED: 0.4,
    OPEN: 0.6,
    ADVENTUROUS: 0.8,
    HIGH_EXPERIMENTATION: 0.95,
  };
  return band ? (map[band] ?? 0.5) : 0.5;
}

function appetiteLateralBoost(appetite?: FounderCreativeAppetiteProfile | null): number {
  if (!appetite) return 0;
  const abs = bandToScore(appetite.abstractionTolerance.value);
  const wit = bandToScore(appetite.witRiskTolerance.value);
  return (abs + wit) / 2;
}

function isOverusedWorld(world: string, history?: BrandCampaignHistorySummary): boolean {
  if (!history) return false;
  const used = history.lastUsedWorlds.map((w) => w.toUpperCase());
  return used.filter((w) => w.includes(world.split(' ')[0]!)).length >= 2;
}

function isLiteralBeautyWorld(setting: string): boolean {
  const upper = setting.toUpperCase();
  return LITERAL_BEAUTY_WORLDS.some((w) => upper.includes(w.replace(' ', '')) || upper.includes(w));
}

export function searchLateralWorlds(input: LateralWorldSearchInput): LateralWorldCandidate[] {
  const pool = selectWorldPool(input.productCategory);
  const boost = appetiteLateralBoost(input.creativeAppetite);
  const bodyPrimary = input.interactionProfile.bodyInterfaces[0] ?? 'BODY';
  const behaviorPrimary = input.interactionProfile.behaviorInterfaces[0] ?? 'ACTION';

  const candidates: LateralWorldCandidate[] = [];

  for (const entry of pool) {
    if (isOverusedWorld(entry.world, input.campaignHistory)) continue;
    if (input.productCategory === 'HAIR' && isLiteralBeautyWorld(entry.setting)) continue;

    let distance = entry.distance;
    if (boost > 0.7 && distance === 'LATERAL') distance = 'UNEXPECTED';
    if (boost < 0.35 && distance === 'UNEXPECTED') distance = 'LATERAL';

    const motif = entry.domains[0]?.toLowerCase().replace('_', ' ') ?? 'ritual';
    const copyHook = entry.world.split(' ').slice(0, 2).join(' ').toUpperCase();

    candidates.push({
      worldName: entry.world,
      setting: entry.setting,
      worldDistance: distance,
      interactionBridge: {
        world: entry.world,
        product: input.interactionProfile.productCategory,
        interactionPoint: bodyPrimary,
        requiredAction: behaviorPrimary,
        bodyInterface: bodyPrimary,
        behavior: behaviorPrimary,
        motif,
        whyNatural: `${bodyPrimary} required for ${behaviorPrimary} in ${entry.setting}`,
        whyMemorable: `Unexpected ${entry.world} — product visible through action not category`,
        riskOfForcedPlacement: distance === 'UNEXPECTED' ? 0.25 : 0.12,
      },
      connectiveLogic: `${input.interactionProfile.productCategory} → ${bodyPrimary} → ${behaviorPrimary} → ${entry.world} → ${motif} → ${copyHook}`,
      motifs: [motif, ...entry.domains.slice(1).map((d) => d.toLowerCase())],
      copyHooks: [copyHook],
    });
  }

  return candidates.sort((a, b) => distanceRank(b.worldDistance) - distanceRank(a.worldDistance));
}

function distanceRank(d: WorldCategoryDistance): number {
  const ranks: Record<WorldCategoryDistance, number> = {
    ABSURD: 5,
    UNEXPECTED: 4,
    LATERAL: 3,
    ADJACENT: 2,
    LITERAL: 1,
  };
  return ranks[d];
}

export function defaultCreativeRange(): WorldCategoryDistance[] {
  return ['ADJACENT', 'LATERAL', 'LATERAL', 'UNEXPECTED'];
}

export function hasRealConnectionPath(bridge: LateralWorldCandidate['interactionBridge']): boolean {
  return (
    bridge.interactionPoint.length > 0 &&
    bridge.requiredAction.length > 0 &&
    bridge.whyNatural.length > 10 &&
    bridge.riskOfForcedPlacement < 0.6
  );
}
