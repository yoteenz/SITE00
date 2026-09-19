/**
 * P0.VR.CAPTURE.1R3A — Resolve live capture preview URLs for browser rendering.
 */

import { resolveAssetRenderableUrl } from './assetRenderableUrlResolver.js';
import { repairMishostedStorageHttpUrl } from './repairMishostedStorageHttpUrl.js';
import { mapPublicSitePathToStorageObjectPath } from './publicSiteUrlStrategy.js';

type ArtifactProofLike = {
  resolvedUrl?: string | null;
  storageRef?: string | null;
} | null | undefined;

function repairStorageObjectPath(raw: string): string | null {
  const trimmed = raw.trim();
  const normalized = trimmed.replace(/^\/+/, '');
  if (
    normalized.startsWith('studio-world/') ||
    normalized.startsWith('site00/') ||
    normalized.startsWith('visual-references/site00/') ||
    normalized.startsWith('visual-references/founder/')
  ) {
    return resolveAssetRenderableUrl(normalized).url;
  }
  if (trimmed.startsWith('/studio-world/') || trimmed.startsWith('/site00/visual-references/')) {
    return resolveAssetRenderableUrl(trimmed).url;
  }
  const mappedPublic = mapPublicSitePathToStorageObjectPath(trimmed);
  if (mappedPublic) {
    return resolveAssetRenderableUrl(mappedPublic).url;
  }
  return null;
}

function repairSameOriginStorageUrl(raw: string, siteOrigin: string | null): string | null {
  if (!raw.startsWith('http') || !siteOrigin) return null;
  try {
    const url = new URL(raw);
    const origin = siteOrigin.replace(/\/$/, '');
    if (url.origin !== origin) return null;
    const path = url.pathname.replace(/^\/+/, '');
    if (
      path.startsWith('studio-world/') ||
      path.startsWith('site00/') ||
      path.startsWith('visual-references/site00/') ||
      path.startsWith('visual-references/founder/')
    ) {
      return resolveAssetRenderableUrl(path).url;
    }
    const mappedPublic = mapPublicSitePathToStorageObjectPath(`/${path}`);
    if (mappedPublic) {
      return resolveAssetRenderableUrl(mappedPublic).url;
    }
  } catch {
    return null;
  }
  return null;
}

function resolveCandidate(raw: string | null | undefined, siteOrigin: string | null): string | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();
  const fromMishosted = repairMishostedStorageHttpUrl(trimmed);
  if (fromMishosted) return fromMishosted;
  const fromPath = repairStorageObjectPath(trimmed);
  if (fromPath) return fromPath;
  const fromOrigin = repairSameOriginStorageUrl(trimmed, siteOrigin);
  if (fromOrigin) return fromOrigin;
  const resolved = resolveAssetRenderableUrl(trimmed);
  if (resolved.url) return resolved.url;
  return trimmed.startsWith('http') ? trimmed : null;
}

export function resolveLiveCapturePreviewRef(input: {
  imageRef?: string | null;
  artifactProof?: ArtifactProofLike;
  siteOrigin?: string | null;
}): string | null {
  const siteOrigin =
    input.siteOrigin ??
    (typeof globalThis.window !== 'undefined' ? globalThis.window.location.origin : null);

  const candidates = [
    input.artifactProof?.resolvedUrl,
    input.artifactProof?.storageRef,
    input.imageRef,
  ];

  for (const candidate of candidates) {
    const resolved = resolveCandidate(candidate, siteOrigin);
    if (resolved) return resolved;
  }

  return null;
}
