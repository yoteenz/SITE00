import type { DesignPageAuthorityReviewSession } from '../p0vrTwinV30/types.js';
import { site00ClientApiUrl } from '../../site00ClientApiBase.js';
import { MOBILE_TWIN_APPROVAL_PERSIST_FAILED } from './constants.js';
import type { MobileTwinImplementationApiAction, MobileTwinImplementationCorrectionReason, MobileTwinPackageApprovalRecord } from './types.js';
import { approveMobileTwinPackage } from '../p0vrTwinV30/mobileTwinPipeline/approveMobileTwinPackage.js';
import { applyBackendPackageApproval } from './applyImplementationPipelineUpdate.js';

type ApiResponse = {
  ok?: boolean;
  error?: string;
  approval?: MobileTwinPackageApprovalRecord;
  state?: unknown;
  build?: unknown;
  document?: unknown;
  visual?: unknown;
  structural?: unknown;
  promotion?: unknown;
};

async function postImplementationApi(input: {
  session?: DesignPageAuthorityReviewSession;
  action: MobileTwinImplementationApiAction;
  apiBase?: string;
  projectId?: string;
  buildId?: string;
  correctionReason?: MobileTwinImplementationCorrectionReason;
  correctionNote?: string;
}): Promise<ApiResponse> {
  const url =
    input.apiBase ?
      `${input.apiBase.replace(/\/$/, '')}/api/site00/twin-v3-mobile-twin-implementation`
    : site00ClientApiUrl('/api/site00/twin-v3-mobile-twin-implementation');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify({
      session: input.session,
      action: input.action,
      projectId: input.projectId,
      buildId: input.buildId,
      correctionReason: input.correctionReason,
      correctionNote: input.correctionNote,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as ApiResponse;
  if (!res.ok) {
    throw new Error(json.error ?? MOBILE_TWIN_APPROVAL_PERSIST_FAILED);
  }
  return json;
}

/** Local approve + durable backend record + reconcile session slice. */
export async function approveAndPersistMobileTwinPackage(input: {
  session: DesignPageAuthorityReviewSession;
  apiBase?: string;
}): Promise<DesignPageAuthorityReviewSession> {
  let session = approveMobileTwinPackage(input.session);
  try {
    const res = await postImplementationApi({
      session,
      action: 'PERSIST_PACKAGE_APPROVAL',
      apiBase: input.apiBase,
    });
    if (!res.approval) throw new Error(MOBILE_TWIN_APPROVAL_PERSIST_FAILED);
    session = applyBackendPackageApproval(session, res.approval);
    return session;
  } catch (err) {
    const message = err instanceof Error ? err.message : MOBILE_TWIN_APPROVAL_PERSIST_FAILED;
    return {
      ...session,
      mobileTwinPipeline: {
        ...session.mobileTwinPipeline!,
        mobileTwinImplementation: {
          packageApprovalStatus: 'PERSIST_FAILED',
          backendPackageApprovalId: null,
          implementationStatus: 'READY_TO_COMPILE',
          latestBuildId: null,
          latestImplementationVersion: null,
          previewRoute: null,
          promotionStatus: 'NOT_READY',
          history: [...(session.mobileTwinPipeline?.mobileTwinImplementation?.history ?? []), message],
        },
      },
    };
  }
}

export async function compileMobileTwinImplementationRoute(input: {
  session: DesignPageAuthorityReviewSession;
  apiBase?: string;
}) {
  return postImplementationApi({ session: input.session, action: 'COMPILE_IMPLEMENTATION', apiBase: input.apiBase });
}

export async function fetchMobileTwinImplementationState(projectId: string, apiBase?: string) {
  const url =
    apiBase ?
      `${apiBase.replace(/\/$/, '')}/api/site00/twin-v3-mobile-twin-implementation?projectId=${encodeURIComponent(projectId)}`
    : site00ClientApiUrl(`/api/site00/twin-v3-mobile-twin-implementation?projectId=${encodeURIComponent(projectId)}`);
  let res: Response;
  try {
    res = await fetch(url, {
      credentials: 'omit',
      headers: { Accept: 'application/json' },
    });
  } catch (cause) {
    const msg = cause instanceof Error ? cause.message : String(cause);
    if (msg.includes('Load failed') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      throw new Error('MOBILE_TWIN_IMPLEMENTATION_API_UNREACHABLE');
    }
    throw cause;
  }
  const json = (await res.json().catch(() => ({}))) as ApiResponse;
  if (!res.ok) throw new Error(json.error ?? 'MOBILE_TWIN_IMPLEMENTATION_STATE_FAILED');
  return json.state;
}

export async function approveMobileTwinImplementationOnServer(input: {
  projectId: string;
  buildId: string;
  apiBase?: string;
}) {
  return postImplementationApi({
    action: 'APPROVE_IMPLEMENTATION',
    projectId: input.projectId,
    buildId: input.buildId,
    apiBase: input.apiBase,
  });
}

export async function requestMobileTwinImplementationCorrectionOnServer(input: {
  projectId: string;
  buildId: string;
  reason: MobileTwinImplementationCorrectionReason;
  note?: string;
  apiBase?: string;
}) {
  return postImplementationApi({
    action: 'REQUEST_IMPLEMENTATION_CORRECTION',
    projectId: input.projectId,
    buildId: input.buildId,
    correctionReason: input.reason,
    correctionNote: input.note,
    apiBase: input.apiBase,
  });
}
