import { apiFetch } from '../../utils/api';

export class ClientProductionApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ClientProductionApiError';
    this.status = status;
  }
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';
  const raw = await res.text();

  if (!raw.trim()) {
    if (!res.ok) {
      throw new ClientProductionApiError(`Request failed (${res.status})`, res.status);
    }
    return {} as T;
  }

  const looksJson =
    contentType.includes('application/json') || contentType.includes('+json') || /^[\[{]/.test(raw.trim());

  if (!looksJson) {
    if (import.meta.env.DEV) {
      console.warn('[clientProductionApi] Non-JSON response', { status: res.status, contentType, preview: raw.slice(0, 120) });
    }
    throw new ClientProductionApiError(
      res.ok ? 'Unexpected response format' : `Service unavailable (${res.status})`,
      res.status,
    );
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ClientProductionApiError('Invalid JSON response', res.status);
  }
}

async function clientProductionFetch<T>(path: string, init?: { method?: string; body?: Record<string, unknown> }): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await parseJsonResponse<T & { error?: string }>(res);
  if (!res.ok) {
    throw new ClientProductionApiError(data.error ?? `Client production API ${res.status}`, res.status);
  }
  return data;
}

export type CtrlRoomSignalPayload = {
  id: string;
  project_name: string;
  signal_type: string;
  title: string;
  reason: string;
  owner: string;
  age_days: number;
  action_route: string;
  action_label: string;
};

export type CtrlRoomSitePayload = {
  id: string;
  name: string;
  domain: string | null;
  status: string | null;
  updated_at: string | null;
};

export type CtrlRoomClientPayload = {
  signals?: CtrlRoomSignalPayload[];
  projects?: Array<{ id: string; name: string; slug: string; client_email?: string }>;
  sites?: CtrlRoomSitePayload[];
  counts?: { properties: number; projects: number; domains: number };
};

export type ClientStudioStage = {
  id: string;
  index: string;
  label: string;
  status: string;
};

export type ClientStudioInputTask = {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  route: string;
  type: string;
};

export type ClientStudioOperation = {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  route: string;
};

export type ClientStudioSignalMetric = {
  id: string;
  label: string;
  pct: number | null;
  stateLabel: string;
};

export type ClientStudioReview = {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  status: string;
  route: string;
  variantCount: number | null;
};

export type ClientStudioMilestone = {
  id: string;
  title: string;
  statusLabel: string;
  timestamp: string;
  stage: string | null;
};

export type ClientStudioActivityEvent = {
  id: string;
  summary: string;
  eventType: string;
  timestamp: string;
  clockTime: string;
};

export type ClientStudioPayload = {
  project: {
    id: string;
    slug: string;
    name: string;
    projectNumber: string;
    buildClass: string | null;
    buildType: string | null;
    currentPhase: string;
    paymentState: string;
    provisioningState: string;
    status: string;
    productionReadinessPct: number;
    environmentReadinessPct: number;
  };
  studioStatus: string;
  studioStatusKey: string;
  stages: ClientStudioStage[];
  currentOperation: {
    title: string;
    description: string;
    resolved: number;
    total: number;
    route: string;
  } | null;
  clientInput: {
    requiredCount: number;
    route: string;
  };
  signalMetrics: ClientStudioSignalMetric[];
  clientOperations: ClientStudioInputTask[];
  studioOperations: ClientStudioOperation[];
  latestMilestone: ClientStudioMilestone | null;
  activity: ClientStudioActivityEvent[];
  nextReview: ClientStudioReview | null;
  readiness: {
    blockedCount: number;
    readyCount: number;
    totalDeliverables: number;
  };
};

export type ClientProjectSummary = {
  id: string;
  slug: string;
  name: string;
  buildClass: string | null;
  buildType: string | null;
  currentPhase: string;
  paymentState: string;
  status: string;
  productionReadinessPct: number;
  studioRoute: string;
  updatedAt: string;
};

export const site00ClientProductionApi = {
  provisioning: (projectSlug: string) =>
    clientProductionFetch(`/api/site00/client-production?action=provisioning&projectSlug=${encodeURIComponent(projectSlug)}`),
  ctrlRoom: () => clientProductionFetch<CtrlRoomClientPayload>('/api/site00/client-production?action=ctrl-room'),
  projects: () => clientProductionFetch<{ projects: ClientProjectSummary[] }>('/api/site00/client-production?action=projects'),
  studio: (projectSlug: string) =>
    clientProductionFetch<ClientStudioPayload>(
      `/api/site00/client-production?action=studio&projectSlug=${encodeURIComponent(projectSlug)}`,
    ),
  activateProject: (body: {
    slug: string;
    name: string;
    buildClass?: string;
    buildType?: string;
    recipeKey?: string;
    metadata?: Record<string, unknown>;
  }) =>
    clientProductionFetch<{ projectId: string; slug: string; created: boolean; studioRoute: string }>(
      '/api/site00/client-production',
      { method: 'POST', body: { action: 'activate-project', ...body } },
    ),
  connectService: (projectId: string, providerKey: string, connectionState = 'CONNECTED', projectSlug?: string) =>
    clientProductionFetch('/api/site00/client-production', {
      method: 'POST',
      body: { action: 'connect-service', projectId, providerKey, connectionState, projectSlug },
    }),
};
