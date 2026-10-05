/**
 * P0.CBI.1 — BrandCreativeContextAssembler
 * Discovers sources, ranks authority, distills context, detects conflicts.
 */

import type { BrandLoreProfile } from '../types.js';
import type { FounderCreativeAppetiteProfile } from '../founderCreativeAppetite/types.js';
import { getProjectBootstrap } from './projectBootstrapCatalog.js';
import { diffBrandCreativeContext } from './contextDiff.js';
import { evaluateBrandCreativeContextReadiness } from './readiness.js';
import { unknownField, field, sourceRef, distillList } from './fieldHelpers.js';
import { normalizeBrandId, projectIdForBrand } from './constants.js';
import type {
  BrandContextConflict,
  BrandCreativeContext,
  BrandCreativeContextAssemblerInput,
  BrandCreativeContextAssemblerResult,
  BrandCampaignHistorySummary,
  ContextConfidence,
} from './types.js';

export class BrandCreativeContextAssembler {
  assemble(input: BrandCreativeContextAssemblerInput): BrandCreativeContextAssemblerResult {
    const brandId = normalizeBrandId(input.brandId);
    const bootstrap = getProjectBootstrap(brandId);
    const prior = getStoredContext(brandId);

    if (!bootstrap && !input.loreProfile) {
      const empty = buildEmptyContext(brandId, input);
      empty.readiness = evaluateBrandCreativeContextReadiness(empty);
      return {
        context: empty,
        diff: null,
        assembled: false,
        blocked: true,
        blockReason: 'No canonical sources available — complete Brand Context Intake.',
      };
    }

    const ctx = bootstrap
      ? buildFromBootstrap(brandId, bootstrap, input)
      : buildFromLoreOnly(brandId, input);

    enrichFromLoreProfile(ctx, input.loreProfile ?? null);
    wireCreativeAppetite(ctx, input.appetiteProfile ?? null);
    applyFounderOverrides(ctx, input.founderOverrides ?? {});

    ctx.conflicts = detectConflicts(ctx, input.loreProfile ?? null);
    ctx.readiness = evaluateBrandCreativeContextReadiness(ctx);
    ctx.confidence = computeOverallConfidence(ctx);
    ctx.version = prior ? prior.version + 1 : 1;
    ctx.lastAssembledAt = new Date().toISOString();
    ctx.contextUpdateAvailable = false;

    const diff = prior ? diffBrandCreativeContext(prior, ctx) : null;

    return {
      context: ctx,
      diff,
      assembled: true,
      blocked: ctx.readiness.overall === 'MISSING_CRITICAL',
      blockReason: ctx.readiness.overall === 'MISSING_CRITICAL' ? 'Missing critical brand context' : null,
    };
  }

  refresh(brandId: string, input: BrandCreativeContextAssemblerInput): BrandCreativeContextAssemblerResult {
    return this.assemble({ ...input, brandId });
  }
}

function buildFromBootstrap(
  brandId: string,
  bootstrap: NonNullable<ReturnType<typeof getProjectBootstrap>>,
  input: BrandCreativeContextAssemblerInput,
): BrandCreativeContext {
  const allRefs = collectRefs(bootstrap);
  return {
    brandId,
    projectId: input.projectId ?? projectIdForBrand(brandId),
    brandName: bootstrap.brandName,
    category: bootstrap.category,
    positioning: bootstrap.positioning,
    brandPromise: bootstrap.brandPromise,
    brandLore: bootstrap.brandLore,
    differentiation: bootstrap.differentiation,
    brandPersonality: {},
    audience: {
      primary: bootstrap.audiencePrimary,
      secondary: bootstrap.audienceSecondary,
      ageRange: bootstrap.audienceAge,
      culturalContext: unknownField(null),
      mindset: unknownField(null),
      aspirations: unknownField([]),
      painPoints: unknownField([]),
      buyingBehavior: unknownField(null),
    },
    productsServices: bootstrap.productsServices,
    offers: bootstrap.offers,
    pricePositioning: bootstrap.pricePositioning,
    visualIdentity: {
      palette: bootstrap.visualPalette,
      typography: unknownField(null),
      logoBehavior: unknownField(null),
      materials: unknownField([]),
      lighting: unknownField(null),
      photography: unknownField(null),
      imageTreatment: unknownField(null),
      graphicLanguage: unknownField(null),
      environmentLanguage: field(
        bootstrap.visualSignatures.value?.slice(0, 2).join(' · ') ?? null,
        bootstrap.visualSignatures.confidence,
        bootstrap.visualSignatures.sourceRefs,
        bootstrap.visualSignatures.isUnknown,
      ),
      recurringSignatures: bootstrap.visualSignatures,
    },
    toneVoice: {
      formality: unknownField('UNKNOWN'),
      copyDensity: unknownField('UNKNOWN'),
      humor: unknownField(null),
      wit: unknownField(null),
      sentenceStyle: unknownField(null),
      captionBehavior: unknownField(null),
      tabooLanguage: bootstrap.toneAvoid,
      preferredPatterns: bootstrap.toneTraits,
    },
    experiencePrinciples: bootstrap.experiencePrinciples,
    worldBuilding: {
      locations: bootstrap.worldLocations,
      districts: unknownField([]),
      rooms: unknownField([]),
      recurringEnvironments: bootstrap.worldLocations,
      characters: unknownField([]),
      rituals: unknownField([]),
      objects: unknownField([]),
      lore: bootstrap.worldLore,
      spatialMetaphors: unknownField([]),
    },
    founderIntent: {
      desiredBecoming: unknownField(null),
      desiredAvoidance: bootstrap.doNotUse,
      repeatedlyApproves: unknownField([]),
      repeatedlyRejects: unknownField([]),
      creativeAmbition: unknownField(null),
      riskAppetite: unknownField(null),
      culturalPositioning: unknownField(null),
    },
    creativeAppetite: null,
    campaignHistory: emptyCampaignHistory(),
    approvedReferences: [],
    approvedMotifs: unknownField([]),
    approvedWorlds: unknownField([]),
    contentHistory: unknownField([]),
    doNotUse: bootstrap.doNotUse,
    creativeBoundaries: bootstrap.boundaries,
    nonNegotiables: bootstrap.nonNegotiables,
    currentObjectives: bootstrap.currentObjectives,
    sourceRefs: allRefs,
    conflicts: [],
    readiness: emptyReadiness(),
    confidence: 'MEDIUM',
    lastAssembledAt: new Date().toISOString(),
    version: 1,
    contextUpdateAvailable: false,
    founderOverrides: {},
  };
}

function buildFromLoreOnly(brandId: string, input: BrandCreativeContextAssemblerInput): BrandCreativeContext {
  const ctx = buildEmptyContext(brandId, input);
  enrichFromLoreProfile(ctx, input.loreProfile ?? null);
  return ctx;
}

function buildEmptyContext(brandId: string, input: BrandCreativeContextAssemblerInput): BrandCreativeContext {
  return {
    brandId,
    projectId: input.projectId ?? projectIdForBrand(brandId),
    brandName: brandId.toUpperCase(),
    category: unknownField(null),
    positioning: unknownField(null),
    brandPromise: unknownField(null),
    brandLore: unknownField(null),
    differentiation: unknownField(null),
    brandPersonality: {},
    audience: {
      primary: unknownField(null),
      secondary: unknownField(null),
      ageRange: unknownField(null),
      culturalContext: unknownField(null),
      mindset: unknownField(null),
      aspirations: unknownField([]),
      painPoints: unknownField([]),
      buyingBehavior: unknownField(null),
    },
    productsServices: unknownField([]),
    offers: [],
    pricePositioning: unknownField(null),
    visualIdentity: {
      palette: unknownField([]),
      typography: unknownField(null),
      logoBehavior: unknownField(null),
      materials: unknownField([]),
      lighting: unknownField(null),
      photography: unknownField(null),
      imageTreatment: unknownField(null),
      graphicLanguage: unknownField(null),
      environmentLanguage: unknownField(null),
      recurringSignatures: unknownField([]),
    },
    toneVoice: {
      formality: unknownField('UNKNOWN'),
      copyDensity: unknownField('UNKNOWN'),
      humor: unknownField(null),
      wit: unknownField(null),
      sentenceStyle: unknownField(null),
      captionBehavior: unknownField(null),
      tabooLanguage: unknownField([]),
      preferredPatterns: unknownField([]),
    },
    experiencePrinciples: unknownField([]),
    worldBuilding: {
      locations: unknownField([]),
      districts: unknownField([]),
      rooms: unknownField([]),
      recurringEnvironments: unknownField([]),
      characters: unknownField([]),
      rituals: unknownField([]),
      objects: unknownField([]),
      lore: unknownField(null),
      spatialMetaphors: unknownField([]),
    },
    founderIntent: {
      desiredBecoming: unknownField(null),
      desiredAvoidance: unknownField([]),
      repeatedlyApproves: unknownField([]),
      repeatedlyRejects: unknownField([]),
      creativeAmbition: unknownField(null),
      riskAppetite: unknownField(null),
      culturalPositioning: unknownField(null),
    },
    creativeAppetite: null,
    campaignHistory: emptyCampaignHistory(),
    approvedReferences: [],
    approvedMotifs: unknownField([]),
    approvedWorlds: unknownField([]),
    contentHistory: unknownField([]),
    doNotUse: unknownField([]),
    creativeBoundaries: [],
    nonNegotiables: unknownField([]),
    currentObjectives: unknownField([]),
    sourceRefs: [],
    conflicts: [],
    readiness: emptyReadiness(),
    confidence: 'UNKNOWN',
    lastAssembledAt: new Date().toISOString(),
    version: 0,
    contextUpdateAvailable: false,
    founderOverrides: {},
  };
}

function enrichFromLoreProfile(ctx: BrandCreativeContext, lore: BrandLoreProfile | null): void {
  if (!lore) return;
  const loreRef = sourceRef('PROJECT_IDENTITY', `lore:${lore.id}`, ['lore'], String(lore.profileVersion));

  if (lore.brandBelief.value && !ctx.brandLore.isUnknown) {
    /* lore enriches if bootstrap missing */
  }
  if (lore.brandBelief.value) {
    ctx.brandLore = field(String(lore.brandBelief.value), lore.brandBelief.confidence as ContextConfidence, [loreRef]);
  }
  if (lore.audienceRelationship.value?.length) {
    ctx.audience.primary = field(
      lore.audienceRelationship.value.join('; '),
      lore.audienceRelationship.confidence as ContextConfidence,
      [loreRef],
    );
  }
  if (lore.authenticLanguageSamples.value?.length) {
    ctx.toneVoice.preferredPatterns = field(
      distillList(lore.authenticLanguageSamples.value),
      lore.authenticLanguageSamples.confidence as ContextConfidence,
      [loreRef],
    );
  }
  if (lore.antiLanguage.value?.length) {
    ctx.toneVoice.tabooLanguage = field(
      distillList(lore.antiLanguage.value),
      lore.antiLanguage.confidence as ContextConfidence,
      [loreRef],
    );
  }
  if (lore.materialVocabulary.value?.length) {
    ctx.visualIdentity.materials = field(
      distillList(lore.materialVocabulary.value),
      lore.materialVocabulary.confidence as ContextConfidence,
      [loreRef],
    );
  }
  if (lore.creativeAntiPatterns.value?.length) {
    ctx.doNotUse = field(
      distillList([...(ctx.doNotUse.value ?? []), ...lore.creativeAntiPatterns.value]),
      'MEDIUM',
      [loreRef],
    );
  }
  if (lore.worldMetaphor.value) {
    const worldLoreValue =
      typeof lore.worldMetaphor.value === 'string'
        ? lore.worldMetaphor.value
        : String(lore.worldMetaphor.value);
    ctx.worldBuilding.lore = field(worldLoreValue, lore.worldMetaphor.confidence as ContextConfidence, [loreRef]);
  }
  ctx.sourceRefs.push(loreRef);
}

function wireCreativeAppetite(ctx: BrandCreativeContext, appetite: FounderCreativeAppetiteProfile | null): void {
  if (!appetite) return;
  ctx.creativeAppetite = appetite;
  if (appetite.hardCreativeBoundaries.value) {
    ctx.creativeBoundaries.push({
      rule: String(appetite.hardCreativeBoundaries.value),
      scope: 'GLOBAL',
      severity: 'BLOCK',
      reason: 'Founder creative appetite hard boundary',
      source: 'FOUNDER_JUDGMENT',
    });
  }
}

function applyFounderOverrides(ctx: BrandCreativeContext, overrides: Record<string, unknown>): void {
  if (!Object.keys(overrides).length) return;
  const overrideRef = sourceRef('FOUNDER_OVERRIDE', 'founder-override', Object.keys(overrides));
  ctx.founderOverrides = { ...ctx.founderOverrides, ...overrides };
  if (typeof overrides.positioning === 'string') {
    ctx.positioning = field(overrides.positioning, 'HIGH', [overrideRef]);
  }
  if (typeof overrides.audiencePrimary === 'string') {
    ctx.audience.primary = field(overrides.audiencePrimary, 'HIGH', [overrideRef]);
  }
  ctx.sourceRefs.push(overrideRef);
}

function detectConflicts(ctx: BrandCreativeContext, lore: BrandLoreProfile | null): BrandContextConflict[] {
  const conflicts: BrandContextConflict[] = [];
  if (!lore) return conflicts;

  const loreTone = lore.authenticLanguageSamples.value?.join(' ').toLowerCase() ?? '';
  const ctxTone = ctx.toneVoice.preferredPatterns.value?.join(' ').toLowerCase() ?? '';
  if (loreTone.includes('formal luxury') && ctxTone.includes('casual meme')) {
    conflicts.push({
      field: 'toneVoice',
      canonicalValue: 'Formal luxury (IDNTY)',
      conflictingValue: 'Casual meme (campaign copy)',
      canonicalSource: 'PROJECT_IDENTITY',
      conflictingSource: 'CAMPAIGN_HISTORY',
      resolution: 'CANONICAL_WINS',
      surfaced: true,
    });
  }
  return conflicts;
}

function computeOverallConfidence(ctx: BrandCreativeContext): ContextConfidence {
  const fields = [ctx.category, ctx.positioning, ctx.brandPromise, ctx.audience.primary];
  const known = fields.filter((f) => !f.isUnknown && f.confidence !== 'UNKNOWN').length;
  if (known >= 3) return 'HIGH';
  if (known >= 1) return 'MEDIUM';
  return 'LOW';
}

function collectRefs(bootstrap: NonNullable<ReturnType<typeof getProjectBootstrap>>): import('./types.js').BrandContextSourceRef[] {
  const refs: import('./types.js').BrandContextSourceRef[] = [];
  const add = (f: { sourceRefs: import('./types.js').BrandContextSourceRef[] }) => {
    for (const r of f.sourceRefs) {
      if (!refs.some((x) => x.sourceId === r.sourceId && x.sourceType === r.sourceType)) {
        refs.push(r);
      }
    }
  };
  add(bootstrap.category);
  add(bootstrap.positioning);
  add(bootstrap.brandPromise);
  return refs;
}

function emptyCampaignHistory(): BrandCampaignHistorySummary {
  return {
    recentCampaigns: [],
    lastUsedStrategies: [],
    lastUsedWorlds: [],
    lastUsedMotifs: [],
    affinitySignals: [],
  };
}

function emptyReadiness(): BrandCreativeContext['readiness'] {
  return {
    overall: 'MISSING_CRITICAL',
    dimensions: {
      identity: { status: 'MISSING_CRITICAL', missing: [] },
      audience: { status: 'MISSING_CRITICAL', missing: [] },
      offer: { status: 'MISSING_CRITICAL', missing: [] },
      visual: { status: 'MISSING_CRITICAL', missing: [] },
      voice: { status: 'MISSING_CRITICAL', missing: [] },
      experience: { status: 'MISSING_CRITICAL', missing: [] },
      creativeHistory: { status: 'MISSING_CRITICAL', missing: [] },
      founderIntent: { status: 'MISSING_CRITICAL', missing: [] },
    },
    canProceedWithLimitedContext: false,
    blockingReasons: [],
    missingCritical: [],
  };
}

/** In-memory + localStorage persistence hook — replaced by store module */
const contextCache = new Map<string, BrandCreativeContext>();

export function getStoredContext(brandId: string): BrandCreativeContext | null {
  return contextCache.get(normalizeBrandId(brandId)) ?? null;
}

export function persistAssembledContext(ctx: BrandCreativeContext): BrandCreativeContext {
  contextCache.set(normalizeBrandId(ctx.brandId), ctx);
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(storageKey(ctx.brandId), JSON.stringify(ctx));
    } catch {
      /* quota / SSR */
    }
  }
  return ctx;
}

export function loadPersistedContext(brandId: string): BrandCreativeContext | null {
  const cached = contextCache.get(normalizeBrandId(brandId));
  if (cached) return cached;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(storageKey(brandId));
      if (raw) {
        const parsed = JSON.parse(raw) as BrandCreativeContext;
        contextCache.set(normalizeBrandId(brandId), parsed);
        return parsed;
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

function storageKey(brandId: string): string {
  return `site00-brand-creative-context:${normalizeBrandId(brandId)}`;
}

export function clearBrandCreativeContextStoreForTest(): void {
  contextCache.clear();
}

export const brandCreativeContextAssembler = new BrandCreativeContextAssembler();
