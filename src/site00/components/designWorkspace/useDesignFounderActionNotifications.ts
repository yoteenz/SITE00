/**
 * Hook — founder action notifications derived from DesignFounderAction store.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProjectNotification } from '../../../../shared/site00-studio-world-production/projectNotifications/types.js';
import {
  countUnreadFounderActionNotifications,
  getAssetsAlertActions,
  loadFounderActionReadState,
  markAllFounderActionNotificationsRead,
  markFounderActionNotificationRead,
  syncFounderActionNotifications,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderActionNotifications.js';
import { subscribeReconstructionWorkflow } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/reconstructionWorkflowStore.js';
import { getReconstructionWorkflowState } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/reconstructionWorkflowStore.js';

export function useDesignFounderActionNotifications() {
  const [, setTick] = useState(0);
  const [readState, setReadState] = useState(loadFounderActionReadState);

  useEffect(() => subscribeReconstructionWorkflow(() => setTick((n) => n + 1)), []);

  const state = getReconstructionWorkflowState();
  const actions = state?.actions ?? [];

  const alertActions = useMemo(() => getAssetsAlertActions(actions), [actions]);
  const notifications = useMemo(
    () => syncFounderActionNotifications(actions, readState),
    [actions, readState],
  );
  const unreadCount = useMemo(
    () => countUnreadFounderActionNotifications(actions, readState),
    [actions, readState],
  );

  const markRead = useCallback((notificationId: string) => {
    const actionId = notificationId.replace(/^founder-action-/, '');
    setReadState(markFounderActionNotificationRead(actionId));
  }, []);

  const markAllRead = useCallback(() => {
    const ids = notifications.map((n) => n.id.replace(/^founder-action-/, ''));
    setReadState(markAllFounderActionNotificationsRead(ids));
  }, [notifications]);

  return {
    alertActions,
    notifications,
    unreadCount,
    markRead,
    markAllRead,
  };
}

export function mergeDesignWorkspaceNotifications(
  founderNotifications: ProjectNotification[],
  apiNotifications: ProjectNotification[],
): ProjectNotification[] {
  const founderKeys = new Set(founderNotifications.map((n) => n.dedupeKey).filter(Boolean));
  const filteredApi = apiNotifications.filter((n) => !n.dedupeKey || !founderKeys.has(n.dedupeKey));
  return [...founderNotifications, ...filteredApi].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
