import { site00ClientApiUrl } from '../../site00ClientApiBase.js';
import type { RemoteStorageGenerationRecord } from './discoverExistingV2ConceptGenerations.js';

export type RemoteTwinV2GenerationsResponse = {
  ok: boolean;
  sessionId?: string | null;
  projectId?: string | null;
  records: RemoteStorageGenerationRecord[];
  error?: string;
  code?: 'LEGACY_V2_DISCOVERY_FAILED';
  searchedSessionIds?: string[];
};

export async function fetchRemoteTwinV2Generations(sessionId: string): Promise<RemoteTwinV2GenerationsResponse> {
  const url = site00ClientApiUrl(
    `/api/site00/twin-v2-concept-generations?sessionId=${encodeURIComponent(sessionId)}`,
  );
  const res = await fetch(url, { credentials: 'omit' });
  const data = (await res.json()) as RemoteTwinV2GenerationsResponse;
  if (!res.ok) {
    return {
      ok: false,
      sessionId,
      records: [],
      error: data.error ?? `HTTP ${res.status}`,
      code: data.code,
      searchedSessionIds: data.searchedSessionIds,
    };
  }
  return { ...data, sessionId };
}

export async function fetchRemoteTwinV2GenerationsForProject(
  projectId: string,
): Promise<RemoteTwinV2GenerationsResponse> {
  const url = site00ClientApiUrl(
    `/api/site00/twin-v2-concept-generations?projectId=${encodeURIComponent(projectId)}`,
  );
  const res = await fetch(url, { credentials: 'omit' });
  const data = (await res.json()) as RemoteTwinV2GenerationsResponse;
  if (!res.ok) {
    return {
      ok: false,
      projectId,
      records: [],
      error: data.error ?? `HTTP ${res.status}`,
      code: data.code,
      searchedSessionIds: data.searchedSessionIds,
    };
  }
  return { ...data, projectId };
}
