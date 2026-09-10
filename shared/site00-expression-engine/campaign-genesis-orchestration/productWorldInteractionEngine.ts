/**
 * P0.CGO.2 — ProductWorldInteractionEngine: interaction-first world reasoning.
 */

import type { CampaignWorldCandidate, ProductCategory } from './types.js';
import type {
  BodyStorySurfaceMap,
  CreativeLeapTrace,
  ProductInteractionProfile,
  WorldInteractionBridge,
} from './conceptualEfficiencyTypes.js';
import { buildProductInteractionProfile } from './productInteractionProfile.js';
import { searchLateralWorlds, type LateralWorldSearchInput } from './lateralWorldSearch.js';
export class ProductWorldInteractionEngine {
  buildInteractionProfile(productId: string, productCategory: ProductCategory): ProductInteractionProfile {
    return buildProductInteractionProfile({ productId, productCategory });
  }

  discoverInteractionSurfaces(profile: ProductInteractionProfile): string[] {
    return [
      ...profile.bodyInterfaces,
      ...profile.behaviorInterfaces.slice(0, 4),
      ...profile.motionInterfaces.slice(0, 3),
    ];
  }

  searchLateralWorlds(input: LateralWorldSearchInput) {
    return searchLateralWorlds(input);
  }

  buildInteractionBridgeFromCandidate(candidate: CampaignWorldCandidate, profile: ProductInteractionProfile): WorldInteractionBridge {
    const chain = candidate.associationChain;
    const bodyLink = chain.links.find((l) => l.domain === 'BODY_RELATIONSHIP' || l.term.toLowerCase().includes('hand') || l.term.toLowerCase().includes('hair'));
    const behaviorLink = chain.links.find((l) => l.domain === 'HUMAN_BEHAVIOR' || l.domain === 'HUMAN_GESTURE' || l.domain === 'MOTION');
    const worldLink = chain.links.find((l) => l.domain === 'ENVIRONMENT' || l.domain === 'GAME' || l.domain === 'SOCIAL_SITUATION');
    const motifLink = chain.links.find((l) => l.domain === 'OBJECT' || l.domain === 'MATERIAL' || l.domain === 'GEOMETRY');

    const bodyInterface = bodyLink?.term ?? profile.bodyInterfaces[0] ?? 'BODY';
    const behavior = behaviorLink?.term ?? profile.behaviorInterfaces[0] ?? 'ACTION';
    return {
      world: worldLink?.term ?? candidate.setting,
      product: profile.productCategory,
      interactionPoint: bodyInterface,
      requiredAction: behavior,
      bodyInterface,
      behavior,
      motif: candidate.motifs[0] ?? motifLink?.term ?? 'motif',
      whyNatural: `${bodyInterface} required for ${behavior} in ${candidate.setting}`,
      whyMemorable: candidate.whyItWorks.split('.')[0] ?? 'Lateral world with natural product intersection',
      riskOfForcedPlacement: candidate.tier === 'WILD_CARD' ? 0.28 : 0.12,
    };
  }

  buildCreativeLeapTrace(candidate: CampaignWorldCandidate, profile: ProductInteractionProfile): CreativeLeapTrace {
    const bridge = this.buildInteractionBridgeFromCandidate(candidate, profile);
    const steps: CreativeLeapTrace['steps'] = [
      { stage: 'PRODUCT', value: profile.productCategory },
      { stage: 'INTERACTION', value: bridge.interactionPoint },
      { stage: 'BEHAVIOR', value: bridge.behavior },
      { stage: 'WORLD', value: candidate.setting },
      { stage: 'MOTIF', value: bridge.motif },
      { stage: 'COPY', value: candidate.campaignTitleLanguage },
    ];
    return {
      steps,
      connectiveLogic: steps.map((s) => s.value).join(' → '),
      fromGenerationPath: true,
    };
  }

  buildBodyStorySurfaceMap(candidate: CampaignWorldCandidate, profile: ProductInteractionProfile): BodyStorySurfaceMap {
    const he = candidate.humanExpression;
    const map: BodyStorySurfaceMap = {};
    if (he.hair.length) map.hair = he.hair;
    if (he.hands.length) map.hands = he.hands;
    if (he.nails.length) map.nails = he.nails;
    if (profile.productCategory === 'HAIR') {
      map.shoulders = ['Hair movement across shoulders'];
      map.face = ['Face framed by hair in motion'];
    }
    if (he.gesture.length) map.gesture = he.gesture;
    if (he.bodyLanguage.length) map.posture = he.bodyLanguage;
    return map;
  }

  interactionFirstWorldPath(profile: ProductInteractionProfile): string[] {
    const behavior = profile.behaviorInterfaces[0] ?? 'ACTION';
    const body = profile.bodyInterfaces[0] ?? 'BODY';
    return [profile.productCategory, body, behavior, 'WORLD_FROM_INTERACTION'];
  }
}

export const productWorldInteractionEngine = new ProductWorldInteractionEngine();
