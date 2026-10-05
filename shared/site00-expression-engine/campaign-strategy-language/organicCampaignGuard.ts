/**
 * P0.CSI.1 — Organic campaign authenticity guard + score.
 */

import type {
  CampaignExpressionBrief,
  CampaignShotRhythmBeat,
  OrganicCampaignGuardIssue,
  OrganicCampaignScore,
} from './types.js';

export function runOrganicCampaignGuard(brief: CampaignExpressionBrief): OrganicCampaignGuardIssue[] {
  const issues: OrganicCampaignGuardIssue[] = [];

  if (brief.productRole === 'HERO' && brief.profile.productProminence === 'HIGH') {
    const productHeavy = brief.shotRhythm.filter((s) => s === 'PRODUCT_CLOSEUP').length;
    if (productHeavy >= brief.shotRhythm.length * 0.5) {
      issues.push({
        code: 'PRODUCT_IN_EVERY_FRAME',
        message: 'Too many product closeups — lived-in campaigns need environmental breathing room',
        severity: 'WARN',
      });
    }
  }

  if (brief.copyBehavior !== 'NO_COPY' && brief.profile.copyDensity === 'HIGH') {
    issues.push({
      code: 'COPY_OVEREXPLAINING',
      message: 'High copy density may break visual-sequence storytelling',
      severity: 'WARN',
    });
  }

  const uniqueShots = new Set(brief.shotRhythm);
  if (uniqueShots.size < 4 && brief.shotRhythm.length >= 4) {
    issues.push({
      code: 'IDENTICAL_SHOTS',
      message: 'Shot rhythm lacks diversity — add detail, hands, environment beats',
      severity: 'WARN',
    });
  }

  if (brief.profile.polishLevel === 'HIGH' && brief.profile.intimacyLevel === 'HIGH') {
    issues.push({
      code: 'OVER_STAGING',
      message: 'High polish + high intimacy without environmental grounding may feel sterile',
      severity: 'WARN',
    });
  }

  if (brief.doNotList.length === 0) {
    issues.push({
      code: 'MISSING_GUARDRAILS',
      message: 'Brief should include explicit do-not rules for authenticity',
      severity: 'WARN',
    });
  }

  return issues;
}

export function computeOrganicCampaignScore(brief: CampaignExpressionBrief): OrganicCampaignScore {
  const guardIssues = runOrganicCampaignGuard(brief);
  const penalty = guardIssues.filter((i) => i.severity === 'FAIL').length * 0.2 +
    guardIssues.filter((i) => i.severity === 'WARN').length * 0.08;

  const livedInFeeling =
    brief.environmentRole === 'STORY_ENGINE' ? 0.9 : brief.environmentRole === 'CO_STAR' ? 0.75 : 0.5;
  const environmentIntegration =
    brief.profile.environmentProminence === 'HIGH' ? 0.85 : 0.55;
  const shotDiversity = diversityScore(brief.shotRhythm);
  const humanSpecificity =
    brief.humanRole === 'HANDS_ONLY' || brief.humanRole === 'BODY_FRAGMENT' ? 0.8 : 0.6;
  const productSubtlety =
    brief.productRole === 'CO_STAR' || brief.productRole === 'CLUE' ? 0.85 : 0.45;
  const sequenceNaturalness = brief.sequence.length >= 5 ? 0.8 : 0.55;

  const raw =
    (livedInFeeling +
      environmentIntegration +
      shotDiversity +
      humanSpecificity +
      productSubtlety +
      sequenceNaturalness) /
    6;

  const overall = Math.max(0, Math.min(1, raw - penalty));

  return {
    livedInFeeling,
    environmentIntegration,
    shotDiversity,
    humanSpecificity,
    productSubtlety,
    sequenceNaturalness,
    overall: Math.round(overall * 100) / 100,
  };
}

function diversityScore(rhythm: CampaignShotRhythmBeat[]): number {
  const unique = new Set(rhythm).size;
  return Math.min(1, unique / Math.max(rhythm.length, 1) + 0.2);
}

export function runAntiCloningQA(posts: Array<{ composition?: string; captionRhythm?: string }>): {
  pass: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const compositions = posts.map((p) => p.composition).filter(Boolean) as string[];
  const dupComp = findDuplicates(compositions);
  if (dupComp.length) issues.push(`Repeated composition: ${dupComp.join(', ')}`);

  const captions = posts.map((p) => p.captionRhythm).filter(Boolean) as string[];
  const dupCap = findDuplicates(captions);
  if (dupCap.length) issues.push(`Repeated caption rhythm: ${dupCap.join(', ')}`);

  return { pass: issues.length === 0, issues };
}

function findDuplicates(arr: string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const v of arr) {
    if (seen.has(v)) dup.add(v);
    seen.add(v);
  }
  return [...dup];
}
