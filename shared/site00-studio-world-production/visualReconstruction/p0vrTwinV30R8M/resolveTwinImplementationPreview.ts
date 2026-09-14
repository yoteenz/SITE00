import { readDesignPageAuthoritySession } from '../p0vrTwinV30/designPageAuthorityPersistence.js';
import { compileApprovedMobileTwinPackage } from './compileApprovedMobileTwinPackage.js';
import { isMobileTwinPackageApprovalConfirmed } from './confirmMobileTwinPackageApproval.js';
import { resolveLocalMobileTwinCompileInput } from './resolveLocalMobileTwinCompileInput.js';
import { fetchMobileTwinImplementationState } from './requestMobileTwinImplementation.js';
import { readTwinImplementationCache, writeTwinImplementationCache, type TwinImplementationCacheEntry } from './twinImplementationBrowserCache.js';
import { mobileTwinTwinPreviewRoute } from './constants.js';
import { isProductionReadyImplementationDocument } from './implementationDocumentValidity.js';
import {
  isMobileTwinImplementationServerUnavailableMessage,
  MOBILE_TWIN_SCHEMA_MISSING_FOUNDER_HINT,
} from './implementationApiAvailability.js';
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

function fromCache(entry: TwinImplementationCacheEntry): TwinImplementationPreviewLoad | null {
  if (!isProductionReadyImplementationDocument(entry.document)) return null;
  return {
    source: 'LOCAL_CACHE',
    buildId: entry.buildId,
    implementationVersion: entry.implementationVersion,
    previewRoute: entry.previewRoute,
    founderStatus: entry.founderStatus,
    promotionStatus: entry.promotionStatus,
    document: entry.document,
    notice:
      'Showing cached twin build (API unreachable). Cached output is real R8M1 implementation — redeploy Railway for durable server authority.',
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
  if (!isProductionReadyImplementationDocument(document)) return null;
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
    const serverUnavailable = isMobileTwinImplementationServerUnavailableMessage(msg);
    const cached = readTwinImplementationCache(key);
    const cachedLoad = cached ? fromCache(cached) : null;
    if (cachedLoad) {
      return {
        ...cachedLoad,
        notice:
          msg.includes('SCHEMA_MISSING') ?
            `${MOBILE_TWIN_SCHEMA_MISSING_FOUNDER_HINT} Showing cached twin build from this device.`
          : cachedLoad.notice,
      };
    }
    if (serverUnavailable) {
      const localInput = resolveLocalMobileTwinCompileInput(key);
      if (localInput) {
        try {
          const document = compileApprovedMobileTwinPackage({
            pipeline: localInput.pipeline,
            packageId: localInput.packageId,
          });
          const buildId = `local-compile-${document.sourceArtifactIds[0] ?? 'preview'}`;
          writeTwinImplementationCache({
            projectId: key,
            buildId,
            implementationVersion: 'mobile-twin-impl-local-preview',
            previewRoute: mobileTwinTwinPreviewRoute(key),
            founderStatus: 'PENDING',
            promotionStatus: 'NOT_READY',
            document,
            cachedAt: new Date().toISOString(),
          });
          const schemaMissing = msg.includes('SCHEMA_MISSING');
          return {
            source: 'LOCAL_COMPILE',
            buildId,
            implementationVersion: 'mobile-twin-impl-local-preview',
            previewRoute: mobileTwinTwinPreviewRoute(key),
            founderStatus: 'PENDING',
            promotionStatus: 'NOT_READY',
            document,
            notice: schemaMissing ?
              `${MOBILE_TWIN_SCHEMA_MISSING_FOUNDER_HINT} Loaded from local compile on this device (cache saved).`
            : 'API unreachable — showing local compile from approved package. Tap BUILD TWIN DESIGN ROUTE on Design when api.site00.com is on v446+.',
          };
        } catch (compileErr) {
          const compileMsg = compileErr instanceof Error ? compileErr.message : String(compileErr);
          if (msg.includes('SCHEMA_MISSING')) {
            throw new Error(
              `${msg} Local compile failed: ${compileMsg}. On Design stay on the same tab, tap REBUILD TWIN DESIGN ROUTE, then reopen twin. If package data is empty, RESTORE MOBILE TWIN FROM BROWSER BACKUP first.`,
            );
          }
          throw compileErr;
        }
      }
      if (msg.includes('SCHEMA_MISSING')) {
        throw new Error(
          `${msg} No approved package found in this browser (design session + mobile-twin storage). Open Design on this device, RESTORE backup if needed, approve package, REBUILD, then reopen twin. Ops: apply Supabase migration 20260914193000_site00_mobile_twin_implementation_r8m.sql.`,
        );
      }
      throw new Error(
        'MOBILE_TWIN_IMPLEMENTATION_API_UNREACHABLE — Railway may need redeploy (twin-v3-mobile-twin-implementation) or run BUILD TWIN DESIGN ROUTE on Design first.',
      );
    }
    if (msg.includes('TWIN_IMPLEMENTATION_NOT_BUILT') || msg.includes('NO_APPROVED')) throw err;
    throw err;
  }

  const cached = readTwinImplementationCache(key);
  const cachedLoad = cached ? fromCache(cached) : null;
  if (cachedLoad) return cachedLoad;

  const session = readDesignPageAuthoritySession(key);
  if (session && isMobileTwinPackageApprovalConfirmed(session)) {
    throw new Error('TWIN_IMPLEMENTATION_NOT_BUILT — return to Design and tap BUILD TWIN DESIGN ROUTE.');
  }
  throw new Error('NO_APPROVED_MOBILE_TWIN_PACKAGE');
}
