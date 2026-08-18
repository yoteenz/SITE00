import { useMemo } from 'react';
import { readLocalActivityForEmail } from '../../utils/activity';
import { useSite00CurrentUser } from './useSite00CurrentUser';

export type CtrlRoomMetricState = 'loading' | 'empty' | 'loaded';

export type CtrlRoomMetrics = {
  activeSites: { state: CtrlRoomMetricState; value: string };
  domains: { state: CtrlRoomMetricState; value: string };
  plan: { state: CtrlRoomMetricState; value: string };
  nextBilling: { state: CtrlRoomMetricState; value: string };
};

export type CtrlRoomActivityRow = {
  id: string;
  label: string;
  action: string;
  timeAgo: string;
};

export type CtrlRoomSiteRow = {
  id: string;
  name: string;
  status: 'Published' | 'Draft' | 'Unknown';
};

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function mapActivityLabel(eventType: string, payload?: Record<string, unknown>): { label: string; action: string } {
  const method = typeof payload?.method === 'string' ? payload.method : undefined;
  switch (eventType) {
    case 'sign_in':
      return { label: 'CTRL ROOM', action: method ? `Signed in (${method})` : 'Signed in' };
    case 'sign_out':
      return { label: 'CTRL ROOM', action: 'Signed out' };
    case 'sign_up':
      return { label: 'IDNTY', action: 'Account created' };
    case 'view_page':
      return { label: 'SITE', action: 'Page viewed' };
    default:
      return { label: 'SITE 00', action: eventType.replace(/_/g, ' ') };
  }
}

/** Best-effort CTRL ROOM data — real profile/activity where available; empty states otherwise. */
export function useCtrlRoomData() {
  const user = useSite00CurrentUser();

  const metrics: CtrlRoomMetrics = useMemo(() => {
    const planValue = user?.membershipType?.trim();
    return {
      activeSites: { state: 'empty', value: '—' },
      domains: { state: 'empty', value: '—' },
      plan: planValue ? { state: 'loaded', value: planValue } : { state: 'empty', value: '—' },
      nextBilling: { state: 'empty', value: '—' },
    };
  }, [user?.membershipType]);

  const activity: CtrlRoomActivityRow[] = useMemo(() => {
    const email = (user?.email || '').trim().toLowerCase();
    if (!email) return [];
    return readLocalActivityForEmail(email)
      .slice(0, 6)
      .map((row) => {
        const mapped = mapActivityLabel(row.eventType, row.payload);
        return {
          id: row.id,
          label: mapped.label,
          action: mapped.action,
          timeAgo: formatRelativeTime(row.createdAt),
        };
      });
  }, [user?.email]);

  const sites: CtrlRoomSiteRow[] = useMemo(() => [], []);

  return { user, metrics, activity, sites };
}
