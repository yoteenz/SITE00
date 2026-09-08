/**
 * C1.8 — Shared creative brain context contract.
 */

import type { BrandLanguageIdentity, CreativeBrainContext } from '../../../shared/site00-expression-engine/brand-language/types.js';
import type { CampaignCreativeDNA } from '../../../shared/site00-expression-engine/package-creative-judgment/types.js';
import type { ThinMultiUnitBrief } from '../seniorCreativeJudgment/blindMultiUnitFixtures.js';
import type { UnitCreativeDirection } from '../../../shared/site00-expression-engine/package-creative-judgment/types.js';
import { deriveBrandLanguageIdentity } from '../brandLanguage/brandLanguageIdentity.js';

export function buildCreativeBrainContext(args: {
  brandIdentity?: BrandLanguageIdentity;
  brief?: ThinMultiUnitBrief;
  campaignCreativeDNA?: CampaignCreativeDNA;
  unit?: UnitCreativeDirection;
  campaignObjective?: string;
  postRole?: string;
  platform?: string;
  visualDirection?: string;
  onAssetCopy?: string | null;
  relevantCorrections?: string[];
  approvedPriorUnits?: string[];
}): CreativeBrainContext {
  const brief = args.brief;
  const brandIdentity =
    args.brandIdentity ??
    deriveBrandLanguageIdentity({
      brandId: brief?.projectId ?? 'generic',
      brandName: brief?.brandName ?? 'Brand',
      tone: brief?.tone,
      positioning: brief?.brandTruthToProve,
      founderCreativeAppetite: brief?.founderCreativeAppetite,
      projectId: brief?.projectId,
    });

  const unit = args.unit;
  const visualDirection = args.visualDirection ?? unit?.finalDirection ?? '';
  const onAsset = args.onAssetCopy ?? null;

  return {
    brandTruth: brief?.brandTruthToProve ?? brandIdentity.brandPersonalitySummary,
    brandLanguageIdentity: brandIdentity,
    campaignBrief: (brief ?? {}) as Record<string, unknown>,
    campaignCreativeDNA: args.campaignCreativeDNA ?? { coreTension: brief?.campaignObjective ?? '' },
    campaignNarrative: brief?.campaignObjective ?? '',
    unitRole: unit?.role.campaignRole ?? 'HERO',
    visualDirection,
    platform: args.platform ?? unit?.medium ?? 'HERO_REEL',
    audienceState: brief?.audienceStartingBelief ?? 'aware',
    approvedPriorUnits: args.approvedPriorUnits ?? [],
    relevantCorrections: args.relevantCorrections ?? [],
    founderCreativeAppetite: brief?.founderCreativeAppetite ?? '',
    postRole: args.postRole ?? 'PRODUCT_HERO',
    onAssetCopy: onAsset,
    visualMechanism: visualDirection.slice(0, 120),
    visualWithholds: 'Payoff withheld until cut — caption must not narrate scene beats',
  };
}

export type { CreativeBrainContext };
