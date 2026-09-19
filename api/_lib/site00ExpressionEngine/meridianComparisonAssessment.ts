/**
 * C1.9R1 — Deterministic vs FULL_REASONING material improvement assessment.
 */

import type { MultiUnitBlindCampaignOutput } from './seniorCreativeJudgment/multiUnitCampaignArchitect.js';

export type MeridianOverallComparisonJudgment =
  | 'FULL_REASONING_MATERIALLY_BETTER'
  | 'FULL_REASONING_SOMEWHAT_BETTER'
  | 'ROUGHLY_EQUIVALENT'
  | 'DETERMINISTIC_BETTER'
  | 'FULL_REASONING_LIVE_TEST_BLOCKED';

export type MeridianComparisonDimension = {
  dimension: string;
  control: string;
  fullReasoning: string;
  delta: 'BETTER' | 'WORSE' | 'SAME' | 'BLOCKED';
};

export type MeridianMaterialImprovementAssessment = {
  overallJudgment: MeridianOverallComparisonJudgment;
  materialImprovement: boolean;
  dimensions: MeridianComparisonDimension[];
  whatChanged: string[];
  whyItChanged: string[];
  whatFullReasoningChallenged: string[];
  whatItKept: string[];
  recommendation: string;
};

function tierScore(tier: string | undefined): number {
  if (tier === 'EXCEPTIONAL') return 3;
  if (tier === 'STRONG') return 2;
  if (tier === 'VALID') return 1;
  return 0;
}

function handholdingScore(risk: string | undefined): number {
  if (risk === 'LOW') return 2;
  if (risk === 'MODERATE') return 1;
  return 0;
}

export function assessMeridianMaterialImprovement(args: {
  control: MultiUnitBlindCampaignOutput;
  full: MultiUnitBlindCampaignOutput | null;
  liveBlocked: boolean;
}): MeridianMaterialImprovementAssessment {
  const { control, full, liveBlocked } = args;

  if (liveBlocked || !full) {
    return {
      overallJudgment: 'FULL_REASONING_LIVE_TEST_BLOCKED',
      materialImprovement: false,
      dimensions: [],
      whatChanged: [],
      whyItChanged: ['FULL_REASONING not executed — provider unavailable'],
      whatFullReasoningChallenged: [],
      whatItKept: [],
      recommendation: 'Configure ANTHROPIC_API_KEY on Railway and re-run C1.9R1 live proof.',
    };
  }

  const controlCaptions =
    control.copyPackage?.unitCopyDirections.map((u) => u.primaryCaption).join(' ') ?? '';
  const fullCaptions = full.copyPackage?.unitCopyDirections.map((u) => u.primaryCaption).join(' ') ?? '';
  const sameSurface = controlCaptions === fullCaptions && full.textReasoningDispatchCount === 0;

  const dimensions: MeridianComparisonDimension[] = [
    {
      dimension: 'CREATIVE DEPTH',
      control: control.packageJudgment.packageQualityTier,
      fullReasoning: full.packageJudgment.packageQualityTier,
      delta:
        tierScore(full.packageJudgment.packageQualityTier) > tierScore(control.packageJudgment.packageQualityTier)
          ? 'BETTER'
          : tierScore(full.packageJudgment.packageQualityTier) < tierScore(control.packageJudgment.packageQualityTier)
            ? 'WORSE'
            : 'SAME',
    },
    {
      dimension: 'COPY SPECIFICITY',
      control: control.copyPackage?.packageCopyQualityTier ?? 'UNKNOWN',
      fullReasoning: full.copyPackage?.packageCopyQualityTier ?? 'UNKNOWN',
      delta:
        tierScore(full.copyPackage?.packageCopyQualityTier) > tierScore(control.copyPackage?.packageCopyQualityTier)
          ? 'BETTER'
          : 'SAME',
    },
    {
      dimension: 'FOUNDER HANDHOLDING',
      control: control.packageJudgment.packageFounderHandholdingRisk,
      fullReasoning: full.packageJudgment.packageFounderHandholdingRisk,
      delta:
        handholdingScore(full.packageJudgment.packageFounderHandholdingRisk) >
        handholdingScore(control.packageJudgment.packageFounderHandholdingRisk)
          ? 'BETTER'
          : 'SAME',
    },
    {
      dimension: 'REASONING DISPATCH',
      control: String(control.textReasoningDispatchCount),
      fullReasoning: String(full.textReasoningDispatchCount),
      delta: full.textReasoningDispatchCount > control.textReasoningDispatchCount ? 'BETTER' : 'SAME',
    },
    {
      dimension: 'COPY DISPATCH',
      control: String(control.copyPackage?.copyReasoningDispatchCount ?? 0),
      fullReasoning: String(full.copyPackage?.copyReasoningDispatchCount ?? 0),
      delta:
        (full.copyPackage?.copyReasoningDispatchCount ?? 0) > (control.copyPackage?.copyReasoningDispatchCount ?? 0)
          ? 'BETTER'
          : 'SAME',
    },
  ];

  const betterCount = dimensions.filter((d) => d.delta === 'BETTER').length;
  const worseCount = dimensions.filter((d) => d.delta === 'WORSE').length;

  let overallJudgment: MeridianOverallComparisonJudgment;
  if (sameSurface) {
    overallJudgment = worseCount > 0 ? 'DETERMINISTIC_BETTER' : 'ROUGHLY_EQUIVALENT';
  } else if (betterCount >= 3 && full.textReasoningDispatchCount > 0) {
    overallJudgment = 'FULL_REASONING_MATERIALLY_BETTER';
  } else if (betterCount >= 1 && full.textReasoningDispatchCount > 0) {
    overallJudgment = 'FULL_REASONING_SOMEWHAT_BETTER';
  } else if (worseCount > betterCount) {
    overallJudgment = 'DETERMINISTIC_BETTER';
  } else {
    overallJudgment = 'ROUGHLY_EQUIVALENT';
  }

  const materialImprovement =
    overallJudgment === 'FULL_REASONING_MATERIALLY_BETTER' ||
    (overallJudgment === 'FULL_REASONING_SOMEWHAT_BETTER' && betterCount >= 2);

  const whatChanged: string[] = [];
  if (control.initialCampaignWinner !== full.initialCampaignWinner) {
    whatChanged.push(`Initial winner: ${control.initialCampaignWinner} → ${full.initialCampaignWinner}`);
  }
  if (control.packageJudgment.finalCampaignDirection !== full.packageJudgment.finalCampaignDirection) {
    whatChanged.push('Final campaign direction revised');
  }
  for (const unit of full.units.filter((u) => u.reviewType === 'SENIOR_CREATIVE_JUDGMENT')) {
    const controlUnit = control.units.find((c) => c.unitId === unit.unitId);
    if (controlUnit && controlUnit.finalDirection !== unit.finalDirection) {
      whatChanged.push(`${unit.medium}: direction changed`);
    }
  }

  const whatFullReasoningChallenged = full.units
    .filter((u) => u.judgment?.firstAnswerChallenge?.attackVectors?.length)
    .flatMap((u) => u.judgment!.firstAnswerChallenge.attackVectors.map((a) => `${u.medium}: ${a.vector}`))
    .slice(0, 6);

  const whatItKept = whatChanged.length === 0 ? ['Campaign thesis and unit structure retained'] : [];

  return {
    overallJudgment,
    materialImprovement,
    dimensions,
    whatChanged,
    whyItChanged:
      full.textReasoningDispatchCount > 0
        ? ['Live provider challenged first answers and revised copy/direction']
        : ['No live dispatch — comparison is structural only'],
    whatFullReasoningChallenged,
    whatItKept,
    recommendation:
      overallJudgment === 'FULL_REASONING_MATERIALLY_BETTER'
        ? 'Consider FULL_REASONING as production default for major Studio World creative work.'
        : overallJudgment === 'DETERMINISTIC_BETTER' || overallJudgment === 'ROUGHLY_EQUIVALENT'
          ? 'Do not add architecture — diagnose live reasoning orchestration from actual failures.'
          : 'Founder should review side-by-side before choosing production default.',
  };
}
