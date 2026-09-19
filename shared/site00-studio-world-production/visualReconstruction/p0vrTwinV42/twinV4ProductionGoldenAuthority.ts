import { site00IsBrowser, site00IsVitest } from '../../runtime/site00RuntimeEnv.js';
import { validateTwinV4GoldenAuthority } from './twinV4GoldenAuthority.js';
import type { TwinV4GoldenAuthority } from './twinV42Types.js';
import { PRODUCTION_GOLDEN_AUTHORITY_UNAVAILABLE } from './constants.js';
import { TwinV42GoldenBootError } from './twinV42GoldenBootError.js';

export type TwinV4ProductionGoldenAuthority = {
  explicitArtifactId: string;
  explicitHttpsUrl: string;
  exactSha256: string;
  exactWidth: number;
  exactHeight: number;
  founderApproved: true;
  immutable: true;
  productionGolden: true;
};

let testProductionGoldenOverride: TwinV4ProductionGoldenAuthority | null = null;

export function setTwinV4ProductionGoldenForTests(manifest: TwinV4ProductionGoldenAuthority | null): void {
  testProductionGoldenOverride = manifest;
}

function readManifestFromViteEnv(): TwinV4ProductionGoldenAuthority | null {
  const env = import.meta.env ?? {};
  const url = String(env.VITE_NDXBOOK_TWIN_V4_PRODUCTION_GOLDEN_URL ?? '').trim();
  const sha256 = String(env.VITE_NDXBOOK_TWIN_V4_PRODUCTION_GOLDEN_SHA256 ?? '').trim();
  const artifactId = String(env.VITE_NDXBOOK_TWIN_V4_PRODUCTION_GOLDEN_ARTIFACT_ID ?? '').trim();
  const width = Number(env.VITE_NDXBOOK_TWIN_V4_PRODUCTION_GOLDEN_WIDTH ?? 0);
  const height = Number(env.VITE_NDXBOOK_TWIN_V4_PRODUCTION_GOLDEN_HEIGHT ?? 0);
  if (!url || !sha256 || !artifactId || !width || !height) return null;
  if (!url.startsWith('https://')) return null;
  return {
    explicitArtifactId: artifactId,
    explicitHttpsUrl: url,
    exactSha256: sha256,
    exactWidth: width,
    exactHeight: height,
    founderApproved: true,
    immutable: true,
    productionGolden: true,
  };
}

export function isTwinV4ProductionGoldenProofRequired(): boolean {
  if (site00IsVitest()) return false;
  if (site00IsBrowser() && import.meta.env?.PROD) return true;
  return String(import.meta.env?.VITE_TWIN_V4_REQUIRE_PRODUCTION_GOLDEN ?? '') === '1';
}

export function readTwinV4ProductionGoldenManifest(): TwinV4ProductionGoldenAuthority | null {
  if (testProductionGoldenOverride) return testProductionGoldenOverride;
  return readManifestFromViteEnv();
}

export async function resolveTwinV4ProductionGoldenAuthority(input: {
  projectId: string;
}): Promise<{ manifest: TwinV4ProductionGoldenAuthority; authority: TwinV4GoldenAuthority }> {
  if (input.projectId !== 'ndxbook') {
    throw new TwinV42GoldenBootError(
      PRODUCTION_GOLDEN_AUTHORITY_UNAVAILABLE,
      'Production golden is ndxbook-only.',
    );
  }
  const manifest = readTwinV4ProductionGoldenManifest();
  if (!manifest) {
    throw new TwinV42GoldenBootError(
      PRODUCTION_GOLDEN_AUTHORITY_UNAVAILABLE,
      'Set VITE_NDXBOOK_TWIN_V4_PRODUCTION_GOLDEN_* at build time.',
    );
  }
  const authority: TwinV4GoldenAuthority = {
    artifactId: manifest.explicitArtifactId,
    artifactUrl: manifest.explicitHttpsUrl,
    sha256: manifest.exactSha256,
    width: manifest.exactWidth,
    height: manifest.exactHeight,
    mimeType: 'image/png',
    approvedByFounder: true,
    approvedAt: 'production-manifest',
    immutable: true,
    authorityVersion: 'v42r1-production-golden',
  };
  await validateTwinV4GoldenAuthority(authority);
  return { manifest, authority };
}

export function productionGoldenForbiddenFirstValidSeal(): true {
  return true;
}
