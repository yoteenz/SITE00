/**
 * Resolve uploaded / Supabase / vault reference assets for reconstruction.
 */

import { createHash } from 'node:crypto';
import type { ResolvedWebVisualReferenceAsset, WebVisualReferenceSourceType } from './types.js';

export type ResolveWebVisualReferenceAssetInput = {
  assetId: string;
  sourceType: WebVisualReferenceSourceType;
  /** Local path, Supabase storage path, or HTTPS URL */
  source: string;
  mimeType?: string;
  width?: number;
  height?: number;
  /** When set, used to build public Supabase URL */
  supabasePublicBase?: string;
};

function inferMime(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/png';
}

function checksum(source: string): string {
  return createHash('sha256').update(source).digest('hex').slice(0, 16);
}

function resolveUrl(input: ResolveWebVisualReferenceAssetInput): { url: string; storagePath: string | null } {
  const { source, supabasePublicBase } = input;
  if (source.startsWith('http://') || source.startsWith('https://')) {
    return { url: source, storagePath: null };
  }
  if (source.startsWith('site00/') || source.startsWith('visual-references/')) {
    const base = supabasePublicBase?.replace(/\/$/, '') ?? 'https://storage.example.test';
    return { url: `${base}/${source}`, storagePath: source };
  }
  return { url: source.startsWith('file://') ? source : `file://${source}`, storagePath: source };
}

export function resolveWebVisualReferenceAsset(
  input: ResolveWebVisualReferenceAssetInput,
): ResolvedWebVisualReferenceAsset {
  const { url, storagePath } = resolveUrl(input);
  const width = input.width ?? 390;
  const height = input.height ?? 844;
  return {
    assetId: input.assetId,
    storagePath,
    resolvedUrl: url,
    mimeType: input.mimeType ?? inferMime(input.source),
    width,
    height,
    checksum: checksum(`${input.assetId}:${url}:${width}x${height}`),
    sourceType: input.sourceType,
  };
}

/** Reject text-only reconstruction when image asset is missing. */
export function referenceImageRequiredForReconstruction(
  asset: ResolvedWebVisualReferenceAsset | null,
): boolean {
  return Boolean(asset?.resolvedUrl?.trim());
}
