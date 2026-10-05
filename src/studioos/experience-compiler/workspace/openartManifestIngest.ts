import type { AuthorityPlanEntry } from '../map2/map2Types';
import type { IngestedAuthorityAsset } from './types';

export type OpenArtIngestEntry = {
  authority_id: string;
  candidate_id: string;
  generation_id: string;
  family_id: string;
  surface: string;
  version: number;
  expected_filename: string;
  byte_length: number;
  content_base64?: string;
};

export type OpenArtIngestManifest = {
  batch_id: string;
  project_id: string;
  entries: OpenArtIngestEntry[];
};

export type IngestValidationResult = {
  ok: boolean;
  assets: IngestedAuthorityAsset[];
  errors: string[];
  warnings: string[];
};

export function ingestOpenArtManifest(
  manifest: OpenArtIngestManifest,
  plan: AuthorityPlanEntry[],
  existing: IngestedAuthorityAsset[],
): IngestValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const planByAuth = new Map(plan.map((p) => [p.authority_id, p]));
  const assets: IngestedAuthorityAsset[] = [];

  const seenVersion = new Set(existing.filter((a) => !a.superseded).map((a) => `${a.authority_id}:${a.version}`));

  for (const entry of manifest.entries) {
    const planned = planByAuth.get(entry.authority_id);
    if (!planned) {
      errors.push(`Unknown authority_id: ${entry.authority_id}`);
      continue;
    }
    if (planned.surface !== entry.surface) {
      errors.push(`Surface mismatch for ${entry.authority_id}: expected ${planned.surface}, got ${entry.surface}`);
      continue;
    }
    if (entry.byte_length <= 0 && !entry.content_base64) {
      errors.push(`Missing file payload for ${entry.authority_id}`);
      continue;
    }
    const versionKey = `${entry.authority_id}:${entry.version}`;
    if (seenVersion.has(versionKey)) {
      errors.push(`Duplicate version not allowed: ${versionKey}`);
      continue;
    }
    seenVersion.add(versionKey);

    assets.push({
      asset_id: `asset_${entry.generation_id}`,
      authority_id: entry.authority_id,
      candidate_id: entry.candidate_id,
      generation_id: entry.generation_id,
      family_id: entry.family_id,
      surface: entry.surface,
      version: entry.version,
      canonical_filename: entry.expected_filename,
      byte_length: entry.byte_length,
      storage_hint: `ingest://${manifest.batch_id}/${entry.expected_filename}`,
      superseded: false,
    });
  }

  const expectedIds = new Set(plan.map((p) => p.authority_id));
  const ingestedIds = new Set(assets.map((a) => a.authority_id));
  for (const id of expectedIds) {
    if (!ingestedIds.has(id) && !existing.some((e) => e.authority_id === id && !e.superseded)) {
      warnings.push(`Plan authority not in ingest: ${id}`);
    }
  }

  return { ok: errors.length === 0, assets, errors, warnings };
}

export function orderIngestedByPlan(plan: AuthorityPlanEntry[], assets: IngestedAuthorityAsset[]): IngestedAuthorityAsset[] {
  const order = plan.map((p) => p.authority_id);
  const rank = new Map(order.map((id, i) => [id, i]));
  return [...assets]
    .filter((a) => !a.superseded)
    .sort((a, b) => (rank.get(a.authority_id) ?? 999) - (rank.get(b.authority_id) ?? 999));
}
