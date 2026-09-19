/**
 * P0.CSI.1 — CampaignStrategyLanguageSystem orchestrator.
 */

import type {
  CampaignChannel,
  CampaignExpressionBrief,
  CampaignFlavorRecommendation,
  CampaignFlavorRecommendationResult,
  CampaignObjective,
  CampaignRecommendationTier,
  CampaignStrategyLanguageSystemInput,
  CampaignStrategyType,
  RecurringCampaignMotif,
} from './types.js';
import { resolveCampaignBrandCompatibility } from './campaignBrandCompatibility.js';
import { computeCampaignNoveltyScore } from './campaignNoveltyScore.js';
import { planCampaignRotation } from './campaignRotationPlanner.js';
import { buildCampaignStrategyStack } from './campaignStrategyStack.js';
import {
  applyAntiOverfitPenalty,
  getCampaignExpressionHistory,
} from './campaignExpressionHistoryStore.js';
import { getBrandCampaignRange } from './brandRangeProfiles.js';
import { getStrategyDefinition } from './strategyLibrary.js';
import {
  buildCreativeVariationPolicy,
  detectVarietyWarnings,
  filterStrategiesForVariety,
} from './campaignVarietyEngine.js';
import {
  checkCampaignGenerationGate,
} from '../../site00-brand-lore/brandCreativeContext/readiness.js';
import { buildBrandSpecificFitExplanation } from '../../site00-brand-lore/brandCreativeContext/brandInfluenceTrace.js';
import { getBrandCampaignHistorySummary } from '../../site00-brand-lore/brandCreativeContext/campaignHistoryStore.js';

const CHANNEL_ADAPTATIONS: Record<CampaignChannel, { role: string; adaptation: string }> = {
  INSTAGRAM_FEED: { role: 'Visual tease', adaptation: 'Lead with world-establishing frame; product subtle' },
  CAROUSEL: { role: 'Sequence reveal', adaptation: 'Each slide advances narrative grammar step' },
  STORY: { role: 'Behind-the-scenes / clue', adaptation: 'Casual framing; interactive sticker optional' },
  REEL: { role: 'Narrative reveal', adaptation: 'Motion-led progressive reveal with payoff end card' },
  TIKTOK: { role: 'Hook-first', adaptation: 'Open on behavior or detail; faster pacing' },
  YOUTUBE_SHORT: { role: 'Mini-documentary', adaptation: 'Slightly longer arc; voice or text optional' },
  EMAIL: { role: 'Campaign payoff', adaptation: 'Copy can carry what visuals teased' },
  LANDING_PAGE: { role: 'Full world', adaptation: 'Complete environment + product story' },
  OOH: { role: 'Single iconic frame', adaptation: 'One strong world or product moment' },
  PRINT: { role: 'Editorial spread', adaptation: 'High-concept or environmental still' },
  EDITORIAL_CHANNEL: { role: 'Long-form story', adaptation: 'Expanded narrative with art direction' },
  UGC: { role: 'Participation layer', adaptation: 'Invite audience into game or discovery mechanic' },
  PAID_SOCIAL: { role: 'Retargeting beat', adaptation: 'Product-forward variant of organic sequence' },
};

export class CampaignStrategyLanguageSystem {
  recommendCampaignFlavors(
    input: CampaignStrategyLanguageSystemInput,
  ): CampaignFlavorRecommendationResult {
    const gate = input.skipGenerationGate
      ? { allowed: true, message: null, readiness: input.brandContext?.readiness ?? null }
      : checkCampaignGenerationGate(input.brandContext ?? null);

    if (!gate.allowed) {
      return {
        brandSlug: input.brandSlug,
        objective: input.objective,
        recommendations: [],
        safe: null,
        fresh: null,
        wildCard: null,
        rotationNote: '',
        varietyWarnings: [],
        generationBlocked: true,
        generationBlockMessage: gate.message,
        brandContextVersion: input.brandContext?.version ?? null,
      };
    }

    const brandHistory = input.brandContext
      ? getBrandCampaignHistorySummary(input.brandSlug)
      : null;
    const history = input.history ?? getCampaignExpressionHistory(input.brandSlug);
    const compatibility = resolveCampaignBrandCompatibility({
      brandSlug: input.brandSlug,
      objective: input.objective,
      channel: input.channel,
      appetite: input.brandContext?.creativeAppetite ?? input.appetite,
      recentHistory: history,
    });

    const policy = buildCreativeVariationPolicy({
      brandSlug: input.brandSlug,
      appetite: input.brandContext?.creativeAppetite ?? input.appetite,
      history,
      brandCampaignHistory: brandHistory ?? undefined,
    });

    const candidates = filterStrategiesForVariety(compatibility.recommendedStrategies, policy);
    const range = getBrandCampaignRange(input.brandSlug);
    const { rotationNote } = planCampaignRotation(input.brandSlug, history);

    const scored = candidates.map((strategy) => {
      const def = getStrategyDefinition(strategy);
      let fitScore = range.safeRange.includes(strategy)
        ? 0.9
        : range.stretchRange.includes(strategy)
          ? 0.75
          : 0.6;
      fitScore = applyAntiOverfitPenalty(input.brandSlug, strategy, fitScore);
      const novelty = computeCampaignNoveltyScore({
        brandSlug: input.brandSlug,
        strategyType: strategy,
        productRole: def.defaultProductRole,
        history,
      });
      return { strategy, fitScore, novelty, def };
    });

    scored.sort((a, b) => b.fitScore + b.novelty.overall * 0.3 - (a.fitScore + a.novelty.overall * 0.3));

    const pickTier = (
      tier: CampaignRecommendationTier,
      prefer: (s: typeof scored[0]) => boolean,
    ): CampaignFlavorRecommendation | null => {
      const item = scored.find(prefer) ?? scored[0];
      if (!item) return null;
      return buildRecommendation(input, item.strategy, item.novelty, item.fitScore, tier, history);
    };

    const safe = pickTier('SAFE', (s) => range.safeRange.includes(s.strategy));
    const fresh = pickTier(
      'FRESH',
      (s) =>
        !range.safeRange.includes(s.strategy) &&
        s.novelty.overall >= 0.55 &&
        s.strategy !== safe?.strategyType,
    );
    const wildCard = pickTier(
      'WILD_CARD',
      (s) =>
        range.experimentalRange.includes(s.strategy) &&
        s.strategy !== safe?.strategyType &&
        s.strategy !== fresh?.strategyType,
    );

    const recommendations: CampaignFlavorRecommendation[] = [];
    const seen = new Set<CampaignStrategyType>();
    for (const rec of [safe, fresh, wildCard]) {
      if (rec && !seen.has(rec.strategyType)) {
        recommendations.push(rec);
        seen.add(rec.strategyType);
      }
    }

    for (const item of scored) {
      if (recommendations.length >= 6) break;
      if (seen.has(item.strategy)) continue;
      recommendations.push(
        buildRecommendation(
          input,
          item.strategy,
          item.novelty,
          item.fitScore,
          'FRESH',
          history,
        ),
      );
      seen.add(item.strategy);
    }

    const varietyWarnings = recommendations.flatMap((r) =>
      detectVarietyWarnings(input.brandSlug, r.strategyType, history),
    );

    return {
      brandSlug: input.brandSlug,
      objective: input.objective,
      recommendations,
      safe,
      fresh,
      wildCard,
      rotationNote,
      varietyWarnings: [...new Set(varietyWarnings)],
      generationBlocked: false,
      brandContextVersion: input.brandContext?.version ?? null,
    };
  }

  generateCampaignExpressionBrief(input: {
    brandSlug: string;
    objective: CampaignObjective;
    primaryStrategy: CampaignStrategyType;
    secondaryStrategies?: CampaignStrategyType[];
    expressionLanguages?: CampaignFlavorRecommendation['flavorTags'];
  }): CampaignExpressionBrief {
    const def = getStrategyDefinition(input.primaryStrategy);
    const stack = buildCampaignStrategyStack({
      primaryStrategy: input.primaryStrategy,
      secondaryStrategies: input.secondaryStrategies,
      expressionLanguages: input.expressionLanguages,
    });

    const motifs = defaultMotifsForStrategy(input.primaryStrategy);
    const channels = Object.entries(CHANNEL_ADAPTATIONS).map(([channel, plan]) => ({
      channel: channel as CampaignChannel,
      role: plan.role,
      adaptation: plan.adaptation,
    }));

    return {
      briefId: `brief-${input.brandSlug}-${input.primaryStrategy}-${Date.now()}`,
      brandSlug: input.brandSlug,
      objective: input.objective,
      stack,
      profile: { ...def.defaultProfile, expressionLanguages: stack.expressionLanguages },
      productRole: def.defaultProductRole,
      humanRole: def.defaultHumanRole,
      environmentRole: def.defaultEnvironmentRole,
      revealStrategy: def.defaultRevealStrategy,
      shotRhythm: def.defaultShotRhythm,
      sequence: def.defaultSequenceGrammar,
      copyBehavior: def.defaultCopyBehavior,
      channelAdaptations: channels,
      doList: buildDoList(input.primaryStrategy),
      doNotList: buildDoNotList(input.primaryStrategy),
      recurringMotifs: motifs,
      createdAt: new Date().toISOString(),
    };
  }
}

function buildRecommendation(
  input: CampaignStrategyLanguageSystemInput,
  strategy: CampaignStrategyType,
  novelty: ReturnType<typeof computeCampaignNoveltyScore>,
  fitScore: number,
  tier: CampaignRecommendationTier,
  history: ReturnType<typeof getCampaignExpressionHistory>,
): CampaignFlavorRecommendation {
  const def = getStrategyDefinition(strategy);
  const stack = buildCampaignStrategyStack({
    primaryStrategy: strategy,
    expressionLanguages: def.compatibleExpressionLanguages.slice(0, 4),
  });

  const warnings = detectVarietyWarnings(input.brandSlug, strategy, history);
  const whyItFits = input.brandContext
    ? buildBrandSpecificFitExplanation(input.brandContext, def.name)
    : warnings.length > 0
      ? `High fit + different from last ${Math.min(history.length, 3)} campaigns`
      : `Strong match for ${input.objective.replace(/_/g, ' ').toLowerCase()} objective`;

  return {
    tier,
    strategyType: strategy,
    name: def.name,
    oneLineDescription: def.description,
    whyItFits,
    flavorTags: stack.expressionLanguages,
    novelty,
    risk: stack.risk,
    brandFitScore: Math.round(fitScore * 100) / 100,
    stack,
    profile: def.defaultProfile,
    productRole: def.defaultProductRole,
    humanRole: def.defaultHumanRole,
    environmentRole: def.defaultEnvironmentRole,
  };
}

function defaultMotifsForStrategy(strategy: CampaignStrategyType): RecurringCampaignMotif[] {
  if (strategy === 'LIVED_IN_ENVIRONMENTAL') {
    return [
      { motifId: 'mirror', label: 'Mirrors', variationRule: 'Reflect product or hands — never identical angle twice' },
      { motifId: 'vanity-objects', label: 'Vanity objects', variationRule: 'Recurring surface details with shifted placement' },
      { motifId: 'hands', label: 'Hands / nails / jewelry', variationRule: 'Secondary brand signals — vary gesture not formula' },
    ];
  }
  return [];
}

function buildDoList(strategy: CampaignStrategyType): string[] {
  const base = ['Preserve brand truth', 'Vary shot distance and focal point within campaign family'];
  if (strategy === 'LIVED_IN_ENVIRONMENTAL') {
    return [
      ...base,
      'Let environment carry story before product',
      'Use progressive reveal',
      'Allow hands, nails, hair, jewelry as secondary brand signals',
      'Mix wide and detail shots from one location',
      'Keep copy minimal — visual sequence leads',
    ];
  }
  return base;
}

function buildDoNotList(strategy: CampaignStrategyType): string[] {
  const base = ['Do not clone identical compositions', 'Do not collapse into generic house style'];
  if (strategy === 'LIVED_IN_ENVIRONMENTAL') {
    return [
      ...base,
      'Do not center product in every frame',
      'Do not over-explain in copy',
      'Do not repeat identical studio product placement',
      'Do not treat organic as unpolished — aim for polished but not sterile',
    ];
  }
  return base;
}

export const campaignStrategyLanguageSystem = new CampaignStrategyLanguageSystem();
