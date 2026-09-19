/**
 * P0.CBI.1 — BrandCreativeContextReadiness evaluation + generation gate.
 */

import type {
  BrandCreativeContext,
  BrandCreativeContextReadiness,
  BrandCreativeContextReadinessDimension,
  BrandCreativeContextReadinessStatus,
} from './types.js';

function dimStatus(hasCritical: boolean, hasPartial: boolean): BrandCreativeContextReadinessStatus {
  if (hasCritical) return 'MISSING_CRITICAL';
  if (hasPartial) return 'PARTIAL';
  return 'READY';
}

function fieldPresent<T>(f: { value: T; isUnknown?: boolean } | undefined, empty: T): boolean {
  if (!f || f.isUnknown) return false;
  if (Array.isArray(f.value)) return f.value.length > 0;
  if (typeof f.value === 'string') return f.value.trim().length > 0;
  return f.value !== empty;
}

export function evaluateBrandCreativeContextReadiness(
  ctx: BrandCreativeContext,
): BrandCreativeContextReadiness {
  const dimensions: BrandCreativeContextReadiness['dimensions'] = {
    identity: evaluateIdentity(ctx),
    audience: evaluateAudience(ctx),
    offer: evaluateOffer(ctx),
    visual: evaluateVisual(ctx),
    voice: evaluateVoice(ctx),
    experience: evaluateExperience(ctx),
    creativeHistory: evaluateHistory(ctx),
    founderIntent: evaluateFounderIntent(ctx),
  };

  const statuses = Object.values(dimensions).map((d) => d.status);
  const hasConflict = ctx.conflicts.some((c) => c.resolution === 'NEEDS_REVIEW');
  const missingCritical = Object.entries(dimensions)
    .filter(([, d]) => d.status === 'MISSING_CRITICAL')
    .flatMap(([k, d]) => d.missing.map((m) => `${k}: ${m}`));

  let overall: BrandCreativeContextReadinessStatus = 'READY';
  if (hasConflict) overall = 'CONFLICTED';
  else if (statuses.includes('MISSING_CRITICAL')) overall = 'MISSING_CRITICAL';
  else if (statuses.includes('PARTIAL')) overall = 'PARTIAL';

  const safePartialDims: BrandCreativeContextReadinessDimension[] = ['creativeHistory', 'founderIntent'];
  const blockingPartial = Object.entries(dimensions)
    .filter(([k, d]) => d.status === 'MISSING_CRITICAL' && !safePartialDims.includes(k as BrandCreativeContextReadinessDimension))
    .flatMap(([, d]) => d.missing);

  return {
    overall,
    dimensions,
    canProceedWithLimitedContext:
      overall === 'PARTIAL' &&
      missingCritical.every((m) => m.startsWith('creativeHistory') || m.startsWith('founderIntent')),
    blockingReasons: blockingPartial,
    missingCritical,
  };
}

function evaluateIdentity(ctx: BrandCreativeContext) {
  const missing: string[] = [];
  if (!fieldPresent(ctx.category, null)) missing.push('category');
  if (!fieldPresent(ctx.positioning, null)) missing.push('positioning');
  if (!fieldPresent(ctx.brandPromise, null)) missing.push('brandPromise');
  const hasCritical = missing.includes('category') && missing.includes('positioning');
  return { status: dimStatus(hasCritical, missing.length > 0), missing };
}

function evaluateAudience(ctx: BrandCreativeContext) {
  const missing: string[] = [];
  if (!fieldPresent(ctx.audience.primary, null)) missing.push('primary audience');
  return { status: dimStatus(false, missing.length > 0), missing };
}

function evaluateOffer(ctx: BrandCreativeContext) {
  const missing: string[] = [];
  const eligible = ctx.offers.filter((o) => o.campaignEligible && o.status !== 'DISCONTINUED' && o.status !== 'DEFERRED');
  if (eligible.length === 0) missing.push('campaign-eligible offer');
  const hasCritical = eligible.length === 0;
  return { status: dimStatus(hasCritical, missing.length > 0 && !hasCritical), missing };
}

function evaluateVisual(ctx: BrandCreativeContext) {
  const missing: string[] = [];
  if (!fieldPresent(ctx.visualIdentity.palette, [])) missing.push('palette');
  if (!fieldPresent(ctx.visualIdentity.recurringSignatures, [])) missing.push('visual signatures');
  return { status: dimStatus(false, missing.length > 0), missing };
}

function evaluateVoice(ctx: BrandCreativeContext) {
  const missing: string[] = [];
  if (!fieldPresent(ctx.toneVoice.preferredPatterns, [])) missing.push('voice patterns');
  return { status: dimStatus(false, missing.length > 0), missing };
}

function evaluateExperience(ctx: BrandCreativeContext) {
  const missing: string[] = [];
  if (!fieldPresent(ctx.experiencePrinciples, [])) missing.push('experience principles');
  return { status: dimStatus(false, missing.length > 0), missing };
}

function evaluateHistory(ctx: BrandCreativeContext) {
  const missing: string[] = [];
  if (ctx.campaignHistory.recentCampaigns.length === 0) missing.push('campaign history');
  return { status: dimStatus(false, missing.length > 0), missing };
}

function evaluateFounderIntent(ctx: BrandCreativeContext) {
  const missing: string[] = [];
  if (!fieldPresent(ctx.founderIntent.desiredBecoming, null)) missing.push('founder desired becoming');
  return { status: dimStatus(false, missing.length > 0), missing };
}

export type GenerationGateResult = {
  allowed: boolean;
  readiness: BrandCreativeContextReadiness;
  message: string | null;
  showIntake: boolean;
  showPartialWarning: boolean;
};

export function checkCampaignGenerationGate(ctx: BrandCreativeContext | null): GenerationGateResult {
  if (!ctx) {
    return {
      allowed: false,
      readiness: emptyReadiness('MISSING_CRITICAL'),
      message: 'NO BRAND CONTEXT — campaign generation blocked.',
      showIntake: true,
      showPartialWarning: false,
    };
  }

  const readiness = ctx.readiness ?? evaluateBrandCreativeContextReadiness(ctx);

  if (readiness.overall === 'MISSING_CRITICAL') {
    return {
      allowed: false,
      readiness,
      message: `${ctx.brandName} NEEDS CREATIVE CONTEXT — we need brand foundations before generating campaign directions.`,
      showIntake: !listHasBootstrap(ctx.brandId),
      showPartialWarning: false,
    };
  }

  if (readiness.overall === 'CONFLICTED') {
    return {
      allowed: false,
      readiness,
      message: `${ctx.brandName} has conflicting brand sources — review context before generating.`,
      showIntake: false,
      showPartialWarning: false,
    };
  }

  if (readiness.overall === 'PARTIAL') {
    return {
      allowed: readiness.canProceedWithLimitedContext,
      readiness,
      message: readiness.canProceedWithLimitedContext
        ? `BRAND CONTEXT PARTIAL — missing: ${readiness.missingCritical.join(', ') || 'non-critical gaps'}`
        : `PARTIAL context with critical gaps — generation blocked.`,
      showIntake: false,
      showPartialWarning: readiness.canProceedWithLimitedContext,
    };
  }

  return {
    allowed: true,
    readiness,
    message: null,
    showIntake: false,
    showPartialWarning: false,
  };
}

function listHasBootstrap(brandId: string): boolean {
  return ['frontal-slayer', 'ndxbook', 'site-00', 'aio', 'astral-world'].includes(brandId);
}

function emptyReadiness(status: BrandCreativeContextReadinessStatus): BrandCreativeContextReadiness {
  const dim = { status, missing: ['all'] as string[] };
  return {
    overall: status,
    dimensions: {
      identity: dim,
      audience: dim,
      offer: dim,
      visual: dim,
      voice: dim,
      experience: dim,
      creativeHistory: dim,
      founderIntent: dim,
    },
    canProceedWithLimitedContext: false,
    blockingReasons: ['No brand context loaded'],
    missingCritical: ['all'],
  };
}
