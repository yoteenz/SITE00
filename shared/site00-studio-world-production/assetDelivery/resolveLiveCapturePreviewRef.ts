/**
 * P0.VR.CAPTURE.1R3A — Resolve live capture preview URLs for browser rendering.
 */

import { resolveAssetRenderableUrl } from './assetRenderableUrlResolver.js';

type ArtifactProofLike = {
  resolvedUrl?: string | null;
  storageRef?: string | null;
} | null | undefined;

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
      path.startsWith('visual-references/site00/')
    ) {
      return resolveAssetRenderableUrl(path).url;
    }
  } catch {
    return null;
  }
  return null;
}

export function resolveLiveCapturePreviewRef(input: {
  imageRef?: string | null;
  artifactProof?: ArtifactProofLike;
  siteOrigin?: string | null;
}): string | null {
  const siteOrigin =
    input.siteOrigin ??
    (typeof globalThis.window !== 'undefined' ? globalThis.window.location.origin : null);

  const proofUrl = input.artifactProof?.resolvedUrl;
  if (proofUrl) {
    const repaired = repairSameOriginStorageUrl(proofUrl, siteOrigin);
    if (repaired) return repaired;
    const resolved = resolveAssetRenderableUrl(proofUrl);
    if (resolved.url) return resolved.url;
  }

  const storageRef = input.artifactProof?.storageRef;
  if (storageRef) {
    const resolved = resolveAssetRenderableUrl(storageRef);
    if (resolved.url) return resolved.url;
  }

  const raw = input.imageRef?.trim();
  if (!raw) return null;

  const repairedRaw = repairSameOriginStorageUrl(raw, siteOrigin);
  if (repairedRaw) return repairedRaw;

  const resolved = resolveAssetRenderableUrl(raw);
  return resolved.url ?? raw;
}
