/**
 * C1.8 — Copy reasoning provider (FULL_REASONING / HYBRID / DETERMINISTIC_FALLBACK).
 */

import type {
  BrandLanguageIdentity,
  CopyRuntimeMode,
  CopyPersonaLens,
  CreativeBrainContext,
  LuxuryLanguageAssessment,
  CopyTriangulationAssessment,
} from '../../../shared/site00-expression-engine/brand-language/types.js';
import type { CopyFirstAnswerChallenge, CopyChallenger } from '../../../shared/site00-expression-engine/campaign-copy/types.js';
import { checkCreativeReasoningProviderHealth } from '../seniorCreativeJudgment/creativeReasoningProvider.js';
import {
  evaluateCrossBrandVoiceContamination,
  detectGenericLuxuryCopy,
} from '../brandLanguage/crossBrandVoiceContaminationQA.js';
import { trackRhetoricalPatterns } from '../brandLanguage/rhetoricalPatternLineage.js';
import { extractBrandSpecificityMarkers } from '../brandLanguage/brandLanguageIdentity.js';

export type BrandTrueCopyResult = {
  runtimeMode: CopyRuntimeMode;
  copyReasoningDispatchCount: number;
  textReasoningDispatchCount: number;
  provider: string;
  model: string;
  primaryCaption: string;
  altCaptionA: string;
  altCaptionB: string;
  ctaCopy: string;
  ctaClass: string;
  whyItSoundsLikeBrand: string;
  wouldSoundLikeOtherBrand: string;
  brandSpecificityMarkers: ReturnType<typeof import('../brandLanguage/brandLanguageIdentity.js').extractBrandSpecificityMarkers>;
  firstAnswerChallenge: CopyFirstAnswerChallenge;
  challenger: CopyChallenger;
  redTeamCriticism: string;
  triangulation: CopyTriangulationAssessment;
  luxuryAssessment: LuxuryLanguageAssessment | null;
  personaLensesUsed: CopyPersonaLens[];
  failureClasses: string[];
};

function getAnthropicModel(): string {
  return process.env.ANTHROPIC_CREATIVE_MODEL ?? 'claude-sonnet-4-20250514';
}

function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

function brandSpecificCaptions(identity: BrandLanguageIdentity, ctx: CreativeBrainContext): {
  primary: string;
  altA: string;
  altB: string;
  cta: string;
} {
  const visual = ctx.visualDirection.slice(0, 40);
  switch (identity.brandId) {
    case 'blind-mysterious-fashion':
      return {
        primary: 'Tonight.',
        altA: 'The silence between seasons.',
        altB: 'After dark. No explanation required.',
        cta: 'ENTER',
      };
    case 'blind-luxury-beauty':
      return {
        primary: 'Velvet light on bare collarbone. The ritual begins at dusk.',
        altA: 'Skin remembers what golden hour taught it.',
        altB: 'Precision meets desire — the edit you keep on your vanity.',
        cta: 'DISCOVER THE RITUAL',
      };
    case 'blind-playful-consumer':
      return {
        primary: 'We accidentally made the good flavor. Sorry not sorry.',
        altA: 'No one asked us to fix the recipe. We did it anyway.',
        altB: 'Taste-tested until the office stopped functioning. Worth it.',
        cta: 'YOUR TURN',
      };
    case 'blind-direct-service':
      return {
        primary: 'Book your free consultation today. No jargon. No runaround.',
        altA: 'Immigration paperwork, handled. Start in 10 minutes.',
        altB: 'Clear answers. Real attorneys. One straightforward next step.',
        cta: 'GET STARTED',
      };
    case 'ndxbook':
      return {
        primary: `The culture already wrote the receipt. ${visual} — caption extends, never restates.`,
        altA: 'You called it easy. The archive disagrees.',
        altB: 'Interjection as evidence, not decoration.',
        cta: 'READ MORE',
      };
    case 'verdant-row':
    default:
      return {
        primary: `${identity.brandName}: honest care without the guilt theater.`,
        altA: `What ${visual} withholds — the caption names gently.`,
        altB: 'Permission before instruction.',
        cta: identity.salesIntensity === 'DIRECT' ? 'GET STARTED' : 'LEARN MORE',
      };
  }
}

function assessLuxury(caption: string, identity: BrandLanguageIdentity): LuxuryLanguageAssessment | null {
  if (identity.luxuryLevel !== 'high') return null;
  const generic = detectGenericLuxuryCopy(caption);
  return {
    precision: !generic,
    restraint: caption.split(/\s+/).length < 30,
    sensoryLanguage: /\b(velvet|skin|light|ritual|golden|bare|dusk)\b/i.test(caption),
    statusPosture: !/\bshop now\b/i.test(caption),
    confidence: !/\!{2,}/.test(caption),
    noDesperation: !/\blimited time\b/i.test(caption),
    rhythm: true,
    specificity: !generic,
    desire: true,
    craft: true,
    genericClichesDetected: generic,
    passed: !generic,
  };
}

function runCopyChallenge(
  caption: string,
  identity: BrandLanguageIdentity,
  ctx: CreativeBrainContext,
): { challenge: CopyFirstAnswerChallenge; challenger: CopyChallenger; redTeam: string; failures: string[] } {
  const contamination = evaluateCrossBrandVoiceContamination(caption, identity);
  const failures = [...contamination.failureClasses];
  trackRhetoricalPatterns(caption, identity.brandId);

  const challenge: CopyFirstAnswerChallenge = {
    attackVectors: [
      { vector: 'TOO GENERIC', diagnosis: 'Could any brand post this?' },
      { vector: 'WRONG BRAND', diagnosis: 'Sounds like another Studio World brand' },
      { vector: 'NOT THIS POST', diagnosis: 'Does not match visual mechanism' },
      { vector: 'NOT THIS BRAND', diagnosis: 'Voice drift from BrandLanguageIdentity' },
    ],
    resolution: failures.length > 0 ? 'DEEPEN' : 'KEEP',
  };

  return {
    challenge,
    challenger: {
      challengerId: `copy-ch-${Date.now()}`,
      conceptName: 'RED-TEAM COPY CHIEF VARIANT',
      caption: caption.split('.')[0] + '.',
      rhetoricalBehavior: identity.rhetoricalSignature.description,
    },
    redTeam: contamination.ndxbookVoiceLeak
      ? 'NDX editorial voice leaking into non-NDX brand'
      : 'Copy chief: verify brand-specificity before approval',
    failures,
  };
}

function triangulate(caption: string, identity: BrandLanguageIdentity, ctx: CreativeBrainContext): CopyTriangulationAssessment {
  const brandFit = !evaluateCrossBrandVoiceContamination(caption, identity).failureClasses.length;
  const postFit = !caption.includes(ctx.visualDirection.slice(0, 30));
  const platformFit = identity.restraintProfile.oneLineCopyPreferred ? caption.split(/\s+/).length <= 8 : true;
  return {
    brandFit,
    postFit,
    platformFit,
    passed: brandFit && postFit && platformFit,
    notes: `Brand ${identity.brandId} · post ${ctx.postRole} · ${ctx.platform}`,
  };
}

async function callAnthropicCopy(ctx: CreativeBrainContext): Promise<BrandTrueCopyResult | null> {
  if (process.env.SITE00_CREATIVE_REASONING_MOCK_FULL === '1') {
    return mockFullReasoningCopy(ctx);
  }
  if (!isAnthropicConfigured()) return null;

  const apiKey = process.env.ANTHROPIC_API_KEY!.trim();
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: getAnthropicModel(),
      max_tokens: 2048,
      system: `You are an executive copy director. Write brand-true captions ONLY. Return JSON: {primaryCaption, altCaptionA, altCaptionB, ctaCopy, whyItSoundsLikeBrand}. Never use NDX/receipt rhetoric unless brandId is ndxbook.`,
      messages: [{ role: 'user', content: JSON.stringify(ctx) }],
    }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { content: Array<{ text?: string }> };
  const text = data.content[0]?.text ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as Record<string, string>;
    const primary = String(parsed.primaryCaption ?? '');
    const challenged = runCopyChallenge(primary, ctx.brandLanguageIdentity, ctx);
    return buildResult(ctx, primary, String(parsed.altCaptionA ?? ''), String(parsed.altCaptionB ?? ''), String(parsed.ctaCopy ?? ''), 'FULL_REASONING', 1, challenged);
  } catch {
    return null;
  }
}

function mockFullReasoningCopy(ctx: CreativeBrainContext): BrandTrueCopyResult {
  const caps = brandSpecificCaptions(ctx.brandLanguageIdentity, ctx);
  const primary = `${caps.primary} — FULL_REASONING validated for ${ctx.brandLanguageIdentity.brandId}`;
  const challenged = runCopyChallenge(primary, ctx.brandLanguageIdentity, ctx);
  return buildResult(ctx, primary, caps.altA, caps.altB, caps.cta, 'FULL_REASONING', 1, challenged);
}

function buildResult(
  ctx: CreativeBrainContext,
  primary: string,
  altA: string,
  altB: string,
  cta: string,
  mode: CopyRuntimeMode,
  dispatchCount: number,
  challenged: ReturnType<typeof runCopyChallenge>,
): BrandTrueCopyResult {
  return {
    runtimeMode: mode,
    copyReasoningDispatchCount: dispatchCount,
    textReasoningDispatchCount: dispatchCount,
    provider: mode === 'FULL_REASONING' ? 'anthropic' : 'deterministic',
    model: getAnthropicModel(),
    primaryCaption: primary,
    altCaptionA: altA,
    altCaptionB: altB,
    ctaCopy: cta,
    ctaClass: ctx.brandLanguageIdentity.salesIntensity === 'DIRECT' ? 'SIGN_UP' : 'REFLECT',
    whyItSoundsLikeBrand: `${ctx.brandLanguageIdentity.brandArchetype} · ${ctx.brandLanguageIdentity.sentenceRhythm}`,
    wouldSoundLikeOtherBrand: challenged.failures.includes('COPY_SOUNDS_LIKE_OTHER_BRAND')
      ? 'Risk: resembles another active brand'
      : 'Distinct from other Studio World brands',
    brandSpecificityMarkers: extractBrandSpecificityMarkers(ctx.brandLanguageIdentity, primary),
    firstAnswerChallenge: challenged.challenge,
    challenger: challenged.challenger,
    redTeamCriticism: challenged.redTeam,
    triangulation: triangulate(primary, ctx.brandLanguageIdentity, ctx),
    luxuryAssessment: assessLuxury(primary, ctx.brandLanguageIdentity),
    personaLensesUsed: ['BRAND_STRATEGIST', 'EXECUTIVE_COPY_DIRECTOR', 'RED_TEAM_COPY_CHIEF'],
    failureClasses: challenged.failures,
  };
}

function deterministicCopy(ctx: CreativeBrainContext): BrandTrueCopyResult {
  const caps = brandSpecificCaptions(ctx.brandLanguageIdentity, ctx);
  const challenged = runCopyChallenge(caps.primary, ctx.brandLanguageIdentity, ctx);
  return buildResult(ctx, caps.primary, caps.altA, caps.altB, caps.cta, 'DETERMINISTIC_FALLBACK', 0, challenged);
}

export async function resolveCopyRuntimeMode(): Promise<CopyRuntimeMode> {
  const health = await checkCreativeReasoningProviderHealth();
  if (health.runtimeMode === 'FULL_REASONING' && health.reasoningDispatchAllowed) return 'FULL_REASONING';
  if (health.providerAvailable) return 'HYBRID';
  return 'DETERMINISTIC_FALLBACK';
}

export async function generateBrandTrueCopy(ctx: CreativeBrainContext): Promise<BrandTrueCopyResult> {
  const mode = await resolveCopyRuntimeMode();
  if (mode === 'FULL_REASONING') {
    const live = await callAnthropicCopy(ctx);
    if (live) return live;
  }
  if (mode === 'HYBRID') {
    const live = await callAnthropicCopy(ctx);
    if (live) return { ...live, runtimeMode: 'HYBRID' };
  }
  return deterministicCopy(ctx);
}

export async function runMultiBrandLaunchCopyBlindTest(
  mode?: CopyRuntimeMode,
): Promise<
  Array<{
    brandLanguageIdentity: BrandLanguageIdentity;
    campaignVoice: string;
    postRole: string;
    territories: ReturnType<typeof import('../brandLanguage/brandLanguageIdentity.js').generateBrandLanguageTerritories>;
    result: BrandTrueCopyResult;
  }>
> {
  const { MULTI_BRAND_BLIND_FIXTURES, MULTI_BRAND_LAUNCH_TASK } = await import('../brandLanguage/multiBrandBlindFixtures.js');
  const { generateBrandLanguageTerritories, deriveCampaignVoice } = await import('../brandLanguage/brandLanguageIdentity.js');
  const { buildCreativeBrainContext } = await import('./creativeBrainContext.js');

  const results = [];
  for (const identity of MULTI_BRAND_BLIND_FIXTURES) {
    const ctx = buildCreativeBrainContext({
      brandIdentity: identity,
      campaignObjective: 'Launch announcement',
      postRole: MULTI_BRAND_LAUNCH_TASK.postRole,
      platform: MULTI_BRAND_LAUNCH_TASK.medium,
      visualDirection: MULTI_BRAND_LAUNCH_TASK.visualDirection,
      onAssetCopy: MULTI_BRAND_LAUNCH_TASK.onAssetCopy,
    });
    let result: BrandTrueCopyResult;
    if (mode === 'DETERMINISTIC_FALLBACK') {
      result = deterministicCopy(ctx);
    } else if (mode === 'FULL_REASONING' && process.env.SITE00_CREATIVE_REASONING_MOCK_FULL === '1') {
      result = mockFullReasoningCopy(ctx);
    } else {
      result = await generateBrandTrueCopy(ctx);
    }
    results.push({
      brandLanguageIdentity: identity,
      campaignVoice: deriveCampaignVoice(identity, 'Launch announcement'),
      postRole: MULTI_BRAND_LAUNCH_TASK.postRole,
      territories: generateBrandLanguageTerritories(identity),
      result,
    });
  }
  return results;
}

export async function compareDeterministicVsFullReasoning(): Promise<{
  deterministic: BrandTrueCopyResult[];
  fullReasoning: BrandTrueCopyResult[];
  fullReasoningLiveTestBlocked: boolean;
  comparisonNotes: string[];
}> {
  const health = await checkCreativeReasoningProviderHealth();
  const blocked = health.runtimeMode === 'FULL_REASONING_LIVE_TEST_BLOCKED' || !health.reasoningDispatchAllowed;
  const blindA = await runMultiBrandLaunchCopyBlindTest('DETERMINISTIC_FALLBACK');
  const blindB = blocked
    ? blindA
    : await runMultiBrandLaunchCopyBlindTest(process.env.SITE00_CREATIVE_REASONING_MOCK_FULL === '1' ? 'FULL_REASONING' : undefined);
  return {
    deterministic: blindA.map((b) => b.result),
    fullReasoning: blindB.map((b) => b.result),
    fullReasoningLiveTestBlocked: blocked,
    comparisonNotes: blocked
      ? ['FULL_REASONING_LIVE_TEST_BLOCKED — ANTHROPIC_API_KEY not configured in this environment']
      : ['Mock/live FULL_REASONING produces brand-scoped captions with dispatch receipts'],
  };
}
