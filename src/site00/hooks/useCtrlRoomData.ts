import { useEffect, useMemo, useState } from 'react';
import { readLocalActivityForEmail } from '../../utils/activity';
import { canAccessAdminPages } from '../../utils/adminAuth';
import { useSite00CurrentUser } from './useSite00CurrentUser';
import {
  formatAccountReference,
  formatActivityClockTime,
  formatMemberSince,
  formatRelativeTime,
  readStoredUserFields,
} from '../utils/site00AccountMeta';
import {
  site00ClientProductionApi,
  type CtrlRoomClientPayload,
  type CtrlRoomSignalPayload,
  type CtrlRoomSitePayload,
} from '../services/clientProductionApi';
import { SITE00_ROUTES } from '../config/routes';

export type CtrlRoomLoadState = 'loading' | 'ready' | 'error';

export type CtrlRoomMetricState = 'loading' | 'empty' | 'loaded';

export type CtrlRoomMetrics = {
  activeSites: { state: CtrlRoomMetricState; value: string };
  domains: { state: CtrlRoomMetricState; value: string };
  projects: { state: CtrlRoomMetricState; value: string };
  plan: { state: CtrlRoomMetricState; value: string };
  nextBilling: { state: CtrlRoomMetricState; value: string };
};

export type CtrlRoomActivityRow = {
  id: string;
  system: string;
  event: string;
  detail: string;
  clockTime: string;
  timeAgo: string;
  createdAt: string;
};

export type CtrlRoomSiteRow = {
  id: string;
  name: string;
  domain: string;
  status: string;
};

export type CtrlRoomOperatorMeta = {
  displayName: string;
  initials: string;
  accountReference: string | null;
  memberSince: string | null;
  securityStatus: string | null;
};

export type CtrlRoomOperatingSignal = {
  label: string;
  value: string;
  sublabel: string;
  state: 'active' | 'neutral' | 'loading';
};

function mapActivityEvent(eventType: string, payload?: Record<string, unknown>): { system: string; event: string; detail: string } {
  const method = typeof payload?.method === 'string' ? payload.method : undefined;
  switch (eventType) {
    case 'sign_in':
      return {
        system: 'CTRL ROOM',
        event: 'SIGNED IN',
        detail: method ? `${method.toUpperCase()} AUTHENTICATION` : 'SESSION STARTED',
      };
    case 'sign_out':
      return { system: 'CTRL ROOM', event: 'SIGNED OUT', detail: 'SESSION ENDED' };
    case 'sign_up':
      return { system: 'IDNTY', event: 'ACCOUNT CREATED', detail: 'REGISTRATION COMPLETE' };
    case 'profile_update':
      return { system: 'IDNTY', event: 'PROFILE UPDATED', detail: 'ACCOUNT INFORMATION CHANGED' };
    case 'view_page':
      return { system: 'SITE 00', event: 'PAGE VIEWED', detail: 'NAVIGATION EVENT' };
    default:
      return {
        system: 'SITE 00',
        event: eventType.replace(/_/g, ' ').toUpperCase(),
        detail: 'SYSTEM EVENT',
      };
  }
}

function mapSiteStatus(status: string | null): string {
  if (!status) return 'UNKNOWN';
  const normalized = status.toUpperCase();
  if (normalized === 'LIVE' || normalized === 'PUBLISHED') return 'ACTIVE';
  if (normalized === 'DRAFT') return 'DRAFT';
  return normalized;
}

function mapSiteRow(site: CtrlRoomSitePayload): CtrlRoomSiteRow {
  return {
    id: site.id,
    name: site.name,
    domain: site.domain?.trim() || '—',
    status: mapSiteStatus(site.status),
  };
}

/** CTRL ROOM command center data — profile, API telemetry, and local activity. */
export function useCtrlRoomData() {
  const user = useSite00CurrentUser();
  const [apiState, setApiState] = useState<CtrlRoomLoadState>('loading');
  const [apiPayload, setApiPayload] = useState<CtrlRoomClientPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    setApiState('loading');

    site00ClientProductionApi
      .ctrlRoom()
      .then((data) => {
        if (cancelled) return;
        setApiPayload(data);
        setApiState('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setApiPayload(null);
        setApiState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const operator: CtrlRoomOperatorMeta = useMemo(() => {
    const stored = readStoredUserFields();
    const parts = [user?.firstName, user?.lastName].filter(Boolean);
    const displayName = parts.length ? parts.join(' ') : (user?.email || '').split('@')[0] || '';
    const first = (user?.firstName || '').trim();
    const last = (user?.lastName || '').trim();
    const initials =
      first || last
        ? `${first.charAt(0) || ''}${last.charAt(0) || ''}`.toUpperCase()
        : (user?.email || '').trim().slice(0, 2).toUpperCase();

    return {
      displayName,
      initials,
      accountReference: formatAccountReference(stored?.id),
      memberSince: formatMemberSince(stored?.createdAt),
      securityStatus: user?.email ? 'SESSION ACTIVE' : null,
    };
  }, [user]);

  const counts = apiPayload?.counts;
  const metricsLoading = apiState === 'loading';

  const metrics: CtrlRoomMetrics = useMemo(() => {
    const planValue = user?.membershipType?.trim();
    const propertiesCount = counts?.properties ?? 0;
    const domainsCount = counts?.domains ?? 0;
    const projectsCount = counts?.projects ?? 0;

    return {
      activeSites: metricsLoading
        ? { state: 'loading', value: '—' }
        : { state: propertiesCount > 0 ? 'loaded' : 'empty', value: String(propertiesCount) },
      domains: metricsLoading
        ? { state: 'loading', value: '—' }
        : { state: domainsCount > 0 ? 'loaded' : 'empty', value: String(domainsCount) },
      projects: metricsLoading
        ? { state: 'loading', value: '—' }
        : { state: projectsCount > 0 ? 'loaded' : 'empty', value: String(projectsCount) },
      plan: planValue
        ? { state: 'loaded', value: planValue.toUpperCase() }
        : { state: 'empty', value: '—' },
      nextBilling: { state: 'empty', value: '—' },
    };
  }, [counts?.domains, counts?.properties, counts?.projects, metricsLoading, user?.membershipType]);

  const operatingSignals: CtrlRoomOperatingSignal[] = useMemo(() => {
    const loading = metricsLoading;
    return [
      {
        label: 'PROPERTIES',
        value: loading ? '—' : String(counts?.properties ?? 0),
        sublabel: 'ACTIVE',
        state: loading ? 'loading' : (counts?.properties ?? 0) > 0 ? 'active' : 'neutral',
      },
      {
        label: 'PROJECTS',
        value: loading ? '—' : String(counts?.projects ?? 0),
        sublabel: 'ACTIVE',
        state: loading ? 'loading' : (counts?.projects ?? 0) > 0 ? 'active' : 'neutral',
      },
      {
        label: 'DOMAINS',
        value: loading ? '—' : String(counts?.domains ?? 0),
        sublabel: 'CONNECTED',
        state: loading ? 'loading' : (counts?.domains ?? 0) > 0 ? 'active' : 'neutral',
      },
      {
        label: 'ACCOUNT',
        value: operator.securityStatus ? 'ACTIVE' : '—',
        sublabel: 'STATUS',
        state: operator.securityStatus ? 'active' : 'neutral',
      },
    ];
  }, [counts?.domains, counts?.projects, counts?.properties, metricsLoading, operator.securityStatus]);

  const activity: CtrlRoomActivityRow[] = useMemo(() => {
    const email = (user?.email || '').trim().toLowerCase();
    if (!email) return [];
    return readLocalActivityForEmail(email)
      .slice(0, 6)
      .map((row) => {
        const mapped = mapActivityEvent(row.eventType, row.payload);
        return {
          id: row.id,
          system: mapped.system,
          event: mapped.event,
          detail: mapped.detail,
          clockTime: formatActivityClockTime(row.createdAt),
          timeAgo: formatRelativeTime(row.createdAt),
          createdAt: row.createdAt,
        };
      });
  }, [user?.email]);

  const sites: CtrlRoomSiteRow[] = useMemo(() => {
    if (apiState !== 'ready' || !apiPayload?.sites) return [];
    return apiPayload.sites.map(mapSiteRow);
  }, [apiPayload?.sites, apiState]);

  const signals: CtrlRoomSignalPayload[] = useMemo(() => {
    if (apiState !== 'ready') return [];
    return apiPayload?.signals ?? [];
  }, [apiPayload?.signals, apiState]);

  const billingHint = null;
  const showAdminAccess = canAccessAdminPages();

  return {
    user,
    operator,
    metrics,
    operatingSignals,
    activity,
    sites,
    signals,
    apiState,
    billingHint,
    showAdminAccess,
    controlSitesHref: SITE00_ROUTES.controlSites,
    projectsHref: SITE00_ROUTES.projects,
    buildHref: SITE00_ROUTES.bldrState,
    settingsHref: SITE00_ROUTES.controlSettings,
  };
}

/** @deprecated Use CtrlRoomActivityRow fields directly in new components. */
export type LegacyCtrlRoomActivityRow = {
  id: string;
  label: string;
  action: string;
  timeAgo: string;
};

export function toLegacyActivityRows(rows: CtrlRoomActivityRow[]): LegacyCtrlRoomActivityRow[] {
  return rows.map((row) => ({
    id: row.id,
    label: row.system,
    action: row.event,
    timeAgo: row.timeAgo,
  }));
}
