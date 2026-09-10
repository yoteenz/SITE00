/**
 * P0.CBI.1 — Brand Creative Context API service.
 */

import type { BrandCreativeContext } from '../../../shared/site00-brand-lore/brandCreativeContext/types.js';
import {
  brandCreativeContextAssembler,
  getStoredContext,
  persistAssembledContext,
} from '../../../shared/site00-brand-lore/brandCreativeContext/brandCreativeContextAssembler.js';
import { normalizeBrandId, projectIdForBrand } from '../../../shared/site00-brand-lore/brandCreativeContext/constants.js';
import { checkCampaignGenerationGate } from '../../../shared/site00-brand-lore/brandCreativeContext/readiness.js';
import type { BrandContextDiff } from '../../../shared/site00-brand-lore/brandCreativeContext/types.js';
import { getOrReconcileBrandLoreForOrg } from './loreService.js';
import { orgIdFromSlug } from '../site00Evolve/orgRegistry.js';
import * as db from './brandCreativeContextSupabaseStore.js';

export function useMemoryBrandContextStore(): boolean {
  return process.env.SITE00_BRAND_CONTEXT_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

async function persist(ctx: BrandCreativeContext): Promise<BrandCreativeContext> {
  persistAssembledContext(ctx);
  if (!useMemoryBrandContextStore()) {
    try {
      const exists = await db.brandCreativeContextTableExists();
      if (exists) return db.saveBrandCreativeContextToDb(ctx);
    } catch {
      /* fall through to in-memory + localStorage via persistAssembledContext */
    }
  }
  return ctx;
}

async function load(brandId: string): Promise<BrandCreativeContext | null> {
  const cached = getStoredContext(brandId);
  if (cached) return cached;
  if (!useMemoryBrandContextStore()) {
    try {
      const exists = await db.brandCreativeContextTableExists();
      if (exists) {
        const fromDb = await db.getBrandCreativeContextFromDb(brandId);
        if (fromDb) {
          persistAssembledContext(fromDb);
          return fromDb;
        }
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

export async function getBrandCreativeContext(brandId: string): Promise<BrandCreativeContext | null> {
  return load(normalizeBrandId(brandId));
}

export async function assembleBrandCreativeContext(input: {
  brandId: string;
  projectSlug?: string;
  founderOverrides?: Record<string, unknown>;
}): Promise<{
  context: BrandCreativeContext;
  diff: BrandContextDiff | null;
  readiness: BrandCreativeContext['readiness'];
  gate: ReturnType<typeof checkCampaignGenerationGate>;
}> {
  const brandId = normalizeBrandId(input.brandId);
  const slug = input.projectSlug ?? projectIdForBrand(brandId);
  const orgId = orgIdFromSlug(slug);
  const loreProfile = orgId ? await getOrReconcileBrandLoreForOrg(orgId, slug) : null;

  let appetiteProfile = null;
  if (orgId) {
    try {
      const { getCreativeAppetiteInspectorPayload } = await import('./creativeAppetiteService.js');
      const payload = await getCreativeAppetiteInspectorPayload(slug, orgId);
      appetiteProfile = payload?.profile ?? null;
    } catch {
      /* appetite optional */
    }
  }

  const result = brandCreativeContextAssembler.assemble({
    brandId,
    projectId: slug,
    loreProfile,
    appetiteProfile,
    founderOverrides: input.founderOverrides,
  });

  const saved = await persist(result.context);
  const gate = checkCampaignGenerationGate(saved);

  return {
    context: saved,
    diff: result.diff,
    readiness: saved.readiness,
    gate,
  };
}

export async function refreshBrandCreativeContext(brandId: string, projectSlug?: string) {
  const prior = await load(normalizeBrandId(brandId));
  const assembled = await assembleBrandCreativeContext({ brandId, projectSlug });
  if (prior) {
    assembled.context.contextUpdateAvailable = assembled.context.version > prior.version;
  }
  return assembled;
}

export async function saveFounderContextOverride(
  brandId: string,
  overrides: Record<string, unknown>,
  projectSlug?: string,
): Promise<BrandCreativeContext> {
  const existing = await load(normalizeBrandId(brandId));
  const mergedOverrides = { ...(existing?.founderOverrides ?? {}), ...overrides };
  const { context } = await assembleBrandCreativeContext({
    brandId,
    projectSlug,
    founderOverrides: mergedOverrides,
  });
  return context;
}

export async function getBrandCreativeContextReadiness(brandId: string) {
  let ctx = await load(normalizeBrandId(brandId));
  if (!ctx) {
    const assembled = await assembleBrandCreativeContext({ brandId });
    ctx = assembled.context;
  }
  return {
    readiness: ctx.readiness,
    gate: checkCampaignGenerationGate(ctx),
    brandContextVersion: ctx.version,
  };
}
