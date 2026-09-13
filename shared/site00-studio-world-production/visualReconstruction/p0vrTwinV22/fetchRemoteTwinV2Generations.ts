import { site00ClientApiUrl } from '../../site00ClientApiBase.js';
import type { RemoteStorageGenerationRecord } from './discoverExistingV2ConceptGenerations.js';

const TWIN_V2_REMOTE_FETCH_TIMEOUT_MS = 8_000;

async function fetchJsonWithTimeout(url: string): Promise<Response> {
  if (typeof AbortController === 'undefined') {
    return fetch(url, { credentials: 'omit' });
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TWIN_V2_REMOTE_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { credentials: 'omit', signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

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
  try {
    const res = await fetchJsonWithTimeout(url);
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
  } catch (err) {
    return {
      ok: false,
      sessionId,
      records: [],
      error: err instanceof Error ? err.message : 'FETCH_TIMEOUT',
    };
  }
}

export async function fetchRemoteTwinV2GenerationsForProject(
  projectId: string,
): Promise<RemoteTwinV2GenerationsResponse> {
  const url = site00ClientApiUrl(
    `/api/site00/twin-v2-concept-generations?projectId=${encodeURIComponent(projectId)}`,
  );
  try {
    const res = await fetchJsonWithTimeout(url);
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
  } catch (err) {
    return {
      ok: false,
      projectId,
      records: [],
      error: err instanceof Error ? err.message : 'FETCH_TIMEOUT',
    };
  }
}
