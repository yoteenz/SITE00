/**
 * Device-local store for structured Project → Production requests.
 * There is no queue API yet; requests created from Projects are kept here and read by the
 * Production queue so the hand-off is real end to end on this device.
 */

import { useCallback, useEffect, useState } from 'react';
import { createProductionWorkspaceRequest } from '../../../shared/site00-production-workspace/projectProductionSummary.js';
import type {
  ProductionWorkspaceRequest,
  ProductionWorkspaceRequestKind,
} from '../../../shared/site00-production-workspace/types.js';

const KEY = 'site00.production.requests.v1';
const EVENT = 'site00:production-requests';

export type StoredProductionRequest = ProductionWorkspaceRequest & {
  status: 'QUEUED' | 'IN_PROGRESS' | 'AWAITING_APPROVAL' | 'COMPLETE';
};

function read(): StoredProductionRequest[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredProductionRequest[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: StoredProductionRequest[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage unavailable */
  }
}

export function submitProductionRequest(args: {
  projectSlug: string;
  kind: ProductionWorkspaceRequestKind;
  note?: string;
}): StoredProductionRequest {
  const req: StoredProductionRequest = {
    ...createProductionWorkspaceRequest(args),
    status: 'QUEUED',
  };
  write([req, ...read()]);
  return req;
}

export function useProductionRequests(projectSlug?: string): StoredProductionRequest[] {
  const [list, setList] = useState<StoredProductionRequest[]>(() =>
    typeof window === 'undefined' ? [] : read(),
  );
  const refresh = useCallback(() => setList(read()), []);
  useEffect(() => {
    refresh();
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);
  return projectSlug ? list.filter((r) => r.projectSlug === projectSlug.toLowerCase()) : list;
}
