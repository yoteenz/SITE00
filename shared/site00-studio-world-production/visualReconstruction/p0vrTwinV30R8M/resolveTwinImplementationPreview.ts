import { readDesignPageAuthoritySession } from '../p0vrTwinV30/designPageAuthorityPersistence.js';
import { compileApprovedMobileTwinPackage } from './compileApprovedMobileTwinPackage.js';
import { isMobileTwinPackageApprovalConfirmed } from './confirmMobileTwinPackageApproval.js';
import { fetchMobileTwinImplementationState } from './requestMobileTwinImplementation.js';
import { readTwinImplementationCache, type TwinImplementationCacheEntry } from './twinImplementationBrowserCache.js';
import type { CompiledMobileTwinImplementationDocument } from './types.js';

export type TwinImplementationPreviewLoad = {
  source: 'API' | 'LOCAL_CACHE' | 'LOCAL_COMPILE';
  buildId: string;
  implementationVersion: string;
  previewRoute: string;
  founderStatus: string;
  promotionStatus: string;
  document: CompiledMobileTwinImplementationDocument;
  notice: string | null;
};

function fromCache(entry: TwinImplementationCacheEntry): TwinImplementationPreviewLoad {
  return {
    source: 'LOCAL_CACHE',
    buildId: entry.buildId,
    implementationVersion: entry.implementationVersion,
    previewRoute: entry.previewRoute,
    founderStatus: entry.founderStatus,
    promotionStatus: entry.promotionStatus,
    document: entry.document,
    notice: 'Showing cached twin build (API unreachable). Run BUILD TWIN DESIGN ROUTE on Design after Railway redeploy for server authority.',
  };
}

function fromApiState(state: {
  latestBuildId?: string | null;
  implementationPayload?: {
    latestBuild?: {
      id: string;
      implementationVersion: string;
      previewRoute: string;
      founderStatus: string;
      promotionStatus: string;
      compiledDocument?: CompiledMobileTwinImplementationDocument;
    };
  };
}): TwinImplementationPreviewLoad | null {
  const build = state.implementationPayload?.latestBuild;
  const document = build?.compiledDocument;
  if (!state.latestBuildId || !build || !document) return null;
  return {
    source: 'API',
    buildId: build.id,
    implementationVersion: build.implementationVersion,
    previewRoute: build.previewRoute,
    founderStatus: build.founderStatus,
    promotionStatus: build.promotionStatus,
    document,
    notice: null,
  };
}

export async function resolveTwinImplementationPreview(projectId: string): Promise<TwinImplementationPreviewLoad> {
  const key = projectId.toLowerCase();

  try {
    const state = (await fetchMobileTwinImplementationState(key)) as Parameters<typeof fromApiState>[0] | null;
    const fromApi = state ? fromApiState(state) : null;
    if (fromApi) return fromApi;
    if (state?.latestBuildId) {
      throw new Error('TWIN_IMPLEMENTATION_NOT_BUILT');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const network =
      msg.includes('Load failed') ||
      msg.includes('Failed to fetch') ||
      msg.includes('NetworkError') ||
      msg.includes('MOBILE_TWIN_IMPLEMENTATION_STATE_FAILED') ||
      msg.includes('MOBILE_TWIN_IMPLEMENTATION_API_UNREACHABLE');
    const cached = readTwinImplementationCache(key);
    if (cached) return fromCache(cached);
    if (network) {
      const session = readDesignPageAuthoritySession(key);
      if (session && isMobileTwinPackageApprovalConfirmed(session) && session.mobileTwinPipeline?.latestPackageId) {
        const document = compileApprovedMobileTwinPackage({
          pipeline: session.mobileTwinPipeline,
          packageId: session.mobileTwinPipeline.latestPackageId,
        });
        return {
          source: 'LOCAL_COMPILE',
          buildId: `local-compile-${document.sourceArtifactIds[0] ?? 'preview'}`,
          implementationVersion: 'mobile-twin-impl-local-preview',
          previewRoute: `/projects/${key}/design/twin`,
          founderStatus: 'PENDING',
          promotionStatus: 'NOT_READY',
          document,
          notice:
            'API unreachable — showing local compile from approved package. Tap BUILD TWIN DESIGN ROUTE on Design when api.site00.com is on v446+.',
        };
      }
      throw new Error(
        'MOBILE_TWIN_IMPLEMENTATION_API_UNREACHABLE — Railway may need redeploy (twin-v3-mobile-twin-implementation) or run BUILD TWIN DESIGN ROUTE on Design first.',
      );
    }
    if (msg.includes('TWIN_IMPLEMENTATION_NOT_BUILT') || msg.includes('NO_APPROVED')) throw err;
    throw err;
  }

  const cached = readTwinImplementationCache(key);
  if (cached) return fromCache(cached);

  const session = readDesignPageAuthoritySession(key);
  if (session && isMobileTwinPackageApprovalConfirmed(session)) {
    throw new Error('TWIN_IMPLEMENTATION_NOT_BUILT — return to Design and tap BUILD TWIN DESIGN ROUTE.');
  }
  throw new Error('NO_APPROVED_MOBILE_TWIN_PACKAGE');
}
