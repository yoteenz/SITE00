import type { AuthorityPackManifest, AuthorityPlanEntry, OpenArtAuthorityBatch } from './map2Types';

export const AUTHORITY_PACK_FILES = [
  '00_START_HERE.md',
  'AUTHORITY_MANIFEST.md',
  'AUTHORITY_MANIFEST.json',
  'AUTHORITY_RULES.md',
  'EXPERIENCE_GRAPH.json',
  'EXPERIENCE_FAMILIES.json',
  'SURFACE_EXPRESSION_MANIFEST.json',
  'SONNET_IMPLEMENTATION_DIRECTIONS.md',
  'MODEL_PIPELINE.md',
  'ASSET_REQUIREMENT_MANIFEST.json',
] as const;

export function compileAuthorityPackManifest(
  project_id: string,
  plan: AuthorityPlanEntry[],
  batches: OpenArtAuthorityBatch[],
): AuthorityPackManifest {
  const filenameByAuth = new Map<string, string>();
  for (const b of batches) {
    b.authorities.forEach((id, i) => filenameByAuth.set(id, b.expected_filenames[i] ?? `${id}.jpg`));
  }
  return {
    project_id,
    pack_version: '1.0.0',
    authorities: plan.map((e) => ({
      authority_id: e.authority_id,
      filename: filenameByAuth.get(e.authority_id) ?? `${e.authority_id}.jpg`,
      surface: e.surface,
      family_id: e.family_id,
    })),
    lite_pack_target_mb: 25,
  };
}

export function sonnetBatchEligible(familyRouteCount: number, backendDependency: boolean): boolean {
  if (backendDependency && familyRouteCount > 12) return false;
  return familyRouteCount <= 24;
}

export function litePackStrategy(totalImages: number, targetMb: number): { compress: boolean; maxImages: number } {
  return { compress: totalImages > 8, maxImages: Math.min(totalImages, Math.floor(targetMb / 2)) };
}
