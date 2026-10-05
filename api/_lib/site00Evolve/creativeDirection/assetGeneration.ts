/**
 * NDXBOOK Creative Direction — governed FAL asset generation.
 *
 * Reuses the existing SITE 00 pipeline rather than inventing a second one:
 *   - same FAL client (@fal-ai/client), GPT Image 2 (openai/gpt-image-2 via FAL)
 *   - same Supabase storage upload helper pattern as ASSTS
 *     (api/_lib/site00Assts/storage.ts — uploadSite00AssetBuffer/downloadUrlToBuffer)
 *
 * This module never runs on the client. FAL_KEY and SUPABASE_SERVICE_ROLE_KEY stay
 * server-side. Every result carries truthful provenance and an approval state that
 * starts at GENERATED — never APPROVED. Nothing here can promote an asset to canon;
 * only the existing founder-decision service (engagementService.recordFounderDecision)
 * can move Visual DNA toward APPROVED.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { downloadUrlToBuffer, uploadSite00AssetBuffer, SITE00_ASSETS_BUCKET } from '../../site00Assts/storage.js';
import { getSupabaseAdmin } from '../../supabase.js';
import { buildGenerationPrompt, NDXBOOK_CREATIVE_ASSET_BRIEFS, type CreativeAssetBrief } from './visualAssetStrategy.js';
import type { TerritorySpecimenImageAsset } from './types.js';

export const CREATIVE_DIRECTION_FAL_MODEL = 'openai/gpt-image-2';
const CREATIVE_DIRECTION_STORAGE_ROOT = 'site00/creative-direction';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_DIR = join(__dirname, 'generatedAssets');

function manifestPathFor(orgSlug: string): string {
  return join(MANIFEST_DIR, `${orgSlug}.assets.json`);
}

export function manifestKey(territoryKey: string, specimenType: string): string {
  return `${territoryKey}:${specimenType}`;
}

/**
 * On disk we persist everything about a generated asset EXCEPT its public url —
 * the Supabase project domain is a secret value and must never be committed to
 * git. The url is reconstructed at load time from storagePath + the configured
 * bucket, so the manifest stays portable across Supabase projects/environments.
 */
type PersistedAsset = Omit<TerritorySpecimenImageAsset, 'url'>;

/**
 * Reads the persisted manifest of previously-generated assets for an org.
 * Returns {} (never throws) when no manifest exists yet — territories.ts falls
 * back to the existing SVG specimen rendering when no entry is present.
 */
export function loadGeneratedAssetManifest(orgSlug: string): Record<string, TerritorySpecimenImageAsset> {
  const path = manifestPathFor(orgSlug);
  if (!existsSync(path)) return {};
  try {
    const raw = readFileSync(path, 'utf8');
    const persisted = JSON.parse(raw) as Record<string, PersistedAsset>;
    const supabase = getSupabaseAdmin();
    const resolved: Record<string, TerritorySpecimenImageAsset> = {};
    for (const [key, entry] of Object.entries(persisted)) {
      const { data } = supabase.storage.from(SITE00_ASSETS_BUCKET).getPublicUrl(entry.storagePath);
      resolved[key] = { ...entry, url: data.publicUrl };
    }
    return resolved;
  } catch {
    return {};
  }
}

function saveGeneratedAssetManifest(orgSlug: string, manifest: Record<string, TerritorySpecimenImageAsset>): void {
  if (!existsSync(MANIFEST_DIR)) mkdirSync(MANIFEST_DIR, { recursive: true });
  const persisted: Record<string, PersistedAsset> = {};
  for (const [key, asset] of Object.entries(manifest)) {
    const { url: _url, ...rest } = asset;
    persisted[key] = rest;
  }
  writeFileSync(manifestPathFor(orgSlug), `${JSON.stringify(persisted, null, 2)}\n`, 'utf8');
}

function storagePathFor(orgSlug: string, brief: CreativeAssetBrief): string {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${CREATIVE_DIRECTION_STORAGE_ROOT}/${safe(orgSlug)}/${safe(brief.territoryKey)}/${safe(brief.specimenType)}.webp`;
}

export type GenerateAssetResult =
  | { ok: true; asset: TerritorySpecimenImageAsset }
  | { ok: false; briefId: string; error: string };

/** Generates and persists exactly one creative-direction visual asset. Server-only. */
export async function generateOneCreativeAsset(
  orgSlug: string,
  brief: CreativeAssetBrief,
  requestedBy: string,
): Promise<GenerateAssetResult> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) return { ok: false, briefId: brief.briefId, error: 'FAL_KEY not configured on server' };

  const { prompt, negativePrompt } = buildGenerationPrompt(brief);

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    const result = (await fal.subscribe(CREATIVE_DIRECTION_FAL_MODEL, {
      input: {
        prompt,
        negative_prompt: negativePrompt,
        aspect_ratio: brief.aspectRatio,
        output_format: 'webp',
        resolution: '2K',
        num_images: 1,
      },
      logs: false,
    })) as { data?: { images?: Array<{ url?: string }> } };

    const imageUrl = result?.data?.images?.[0]?.url;
    if (!imageUrl) return { ok: false, briefId: brief.briefId, error: 'FAL returned no image URL' };

    const buffer = await downloadUrlToBuffer(imageUrl);
    const storagePath = storagePathFor(orgSlug, brief);
    const { publicUrl } = await uploadSite00AssetBuffer(storagePath, buffer, 'image/webp');

    const asset: TerritorySpecimenImageAsset = {
      url: publicUrl,
      storagePath,
      model: CREATIVE_DIRECTION_FAL_MODEL,
      volume: brief.volume,
      role: brief.role,
      brief: prompt,
      negativePrompt,
      generatedAt: new Date().toISOString(),
      approvalState: 'GENERATED',
      provenance: {
        source: 'FAL',
        pipeline: 'ndxbook_creative_direction_visual_pass',
        briefId: brief.briefId,
        requestedBy,
      },
    };
    return { ok: true, asset };
  } catch (e) {
    return { ok: false, briefId: brief.briefId, error: e instanceof Error ? e.message : 'Creative Direction FAL generation failed' };
  }
}

export type VisualAssetPassResult = {
  skipped: boolean;
  requested: number;
  generated: Array<{ briefId: string; territoryKey: string; specimenType: string; volume: string }>;
  failed: Array<{ briefId: string; error: string }>;
};

/**
 * Governed batch dispatch — generates the curated NDXBOOK_CREATIVE_ASSET_BRIEFS set,
 * sequentially (avoids provider rate limits), and persists results to the on-disk
 * manifest that territories.ts reads when building specimens for this org.
 *
 * Truthful skip behavior: if FAL_KEY is not configured, no assets are fabricated —
 * the manifest is left untouched and skipped:true is returned.
 */
export async function generateNdxbookVisualAssetPass(
  orgSlug: string,
  requestedBy: string,
  opts?: { onlyMissing?: boolean; briefs?: CreativeAssetBrief[] },
): Promise<VisualAssetPassResult> {
  if (!process.env.FAL_KEY?.trim()) {
    return { skipped: true, requested: 0, generated: [], failed: [] };
  }

  const briefs = opts?.briefs ?? NDXBOOK_CREATIVE_ASSET_BRIEFS;
  const manifest = loadGeneratedAssetManifest(orgSlug);
  const generated: VisualAssetPassResult['generated'] = [];
  const failed: VisualAssetPassResult['failed'] = [];
  let requested = 0;

  for (const brief of briefs) {
    const key = manifestKey(brief.territoryKey, brief.specimenType);
    if (opts?.onlyMissing && manifest[key]) continue;
    requested++;
    const result = await generateOneCreativeAsset(orgSlug, brief, requestedBy);
    if (result.ok) {
      manifest[key] = result.asset;
      generated.push({ briefId: brief.briefId, territoryKey: brief.territoryKey, specimenType: brief.specimenType, volume: brief.volume });
    } else {
      failed.push({ briefId: result.briefId, error: result.error });
    }
  }

  if (generated.length > 0) saveGeneratedAssetManifest(orgSlug, manifest);
  return { skipped: false, requested, generated, failed };
}
