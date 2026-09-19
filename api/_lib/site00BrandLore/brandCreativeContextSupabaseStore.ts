/**
 * P0.CBI.1 — Supabase persistence for BrandCreativeContext.
 */

import { getSupabaseAdmin } from '../supabase.js';
import type { BrandCreativeContext } from '../../../shared/site00-brand-lore/brandCreativeContext/types.js';
import { normalizeBrandId } from '../../../shared/site00-brand-lore/brandCreativeContext/constants.js';

const TABLE = 'site00_brand_creative_context';

type Row = {
  id: string;
  brand_id: string;
  project_id: string | null;
  context_version: number;
  readiness_state: string;
  confidence: string | null;
  context: Record<string, unknown>;
  founder_overrides: Record<string, unknown>;
  campaign_history: unknown;
  created_at: string;
  updated_at: string;
};

export async function brandCreativeContextTableExists(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getBrandCreativeContextFromDb(brandId: string): Promise<BrandCreativeContext | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .eq('brand_id', normalizeBrandId(brandId))
    .maybeSingle();
  if (error) throw error;
  return data ? (data.context as unknown as BrandCreativeContext) : null;
}

export async function saveBrandCreativeContextToDb(ctx: BrandCreativeContext): Promise<BrandCreativeContext> {
  const brandId = normalizeBrandId(ctx.brandId);
  const { data: existing, error: findErr } = await getSupabaseAdmin()
    .from(TABLE)
    .select('id, context_version')
    .eq('brand_id', brandId)
    .maybeSingle();
  if (findErr) throw findErr;

  const columns = {
    brand_id: brandId,
    project_id: ctx.projectId,
    context_version: ctx.version,
    readiness_state: ctx.readiness.overall,
    confidence: ctx.confidence,
    context: ctx as unknown as Record<string, unknown>,
    founder_overrides: ctx.founderOverrides,
    campaign_history: ctx.campaignHistory.recentCampaigns,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await getSupabaseAdmin()
      .from(TABLE)
      .update(columns)
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error || !data) throw error ?? new Error('FAILED TO UPDATE BRAND CREATIVE CONTEXT');
    return mapRow(data as Row);
  }

  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .insert(columns)
    .select('*')
    .single();
  if (error || !data) throw error ?? new Error('FAILED TO CREATE BRAND CREATIVE CONTEXT');
  return mapRow(data as Row);
}

function mapRow(row: Row): BrandCreativeContext {
  return row.context as unknown as BrandCreativeContext;
}
