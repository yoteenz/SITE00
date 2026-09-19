import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import type { ActiveProjectNotificationCenterState } from '../../../shared/site00-studio-world-production/projectNotifications/types.js';

const EMPTY_STATE: ActiveProjectNotificationCenterState = {
  projectId: '',
  notifications: [],
  messages: [],
  unreadCount: 0,
  messagesTransportBlocked: true,
  messagesTransportBlockReason: null,
};

export function useActiveProjectNotifications(
  projectSlug: string,
  options?: { enabled?: boolean; refreshOnOpen?: boolean; variant?: 'dropdown' | 'full' },
) {
  const enabled = options?.enabled ?? Boolean(projectSlug);
  const variant = options?.variant ?? 'dropdown';
  const location = useLocation();
  const [state, setState] = useState<ActiveProjectNotificationCenterState>(EMPTY_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const openRefreshRef = useRef(false);

  const refresh = useCallback(async (limit?: number | null) => {
    if (!enabled || !projectSlug) return;
    setLoading(true);
    setError(null);
    try {
      if (variant === 'full') {
        const payload = await site00ProjectsApi.projectNotificationsAll(projectSlug);
        setState({
          projectId: projectSlug,
          notifications: payload.notifications,
          messages: [],
          unreadCount: payload.notifications.filter((n) => n.status === 'UNREAD').length,
          messagesTransportBlocked: true,
          messagesTransportBlockReason: null,
        });
      } else {
        const payload = await site00ProjectsApi.projectNotificationsList(projectSlug, limit);
        setState(payload.center);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [enabled, projectSlug, variant]);

  const refreshAll = useCallback(async () => refresh(null), [refresh]);

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!projectSlug) return;
      await site00ProjectsApi.projectNotificationMarkRead(projectSlug, notificationId);
      await refresh();
    },
    [projectSlug, refresh],
  );

  const markAllRead = useCallback(async () => {
    if (!projectSlug) return;
    await site00ProjectsApi.projectNotificationsMarkAllRead(projectSlug);
    await refresh();
  }, [projectSlug, refresh]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [enabled, projectSlug, location.pathname, refresh]);

  const refreshOnOpen = useCallback(() => {
    openRefreshRef.current = true;
    void refresh();
  }, [refresh]);

  return {
    state,
    loading,
    error,
    refresh,
    refreshAll,
    refreshOnOpen,
    markRead,
    markAllRead,
  };
}
