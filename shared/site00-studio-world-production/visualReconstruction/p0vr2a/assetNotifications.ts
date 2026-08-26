/**
 * P0.VR.2A — Design workspace asset-ready notifications.
 */

import { DESIGN_WORKSPACE_DEEP_LINK } from './constants.js';
import type { ReferenceAssetRole } from './types.js';

export type DesignAssetNotification = {
  id: string;
  projectId: string;
  category: 'GENERATION_COMPLETE';
  title: string;
  message: string;
  actionTarget: string;
  dedupeKey: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

const notificationStore: DesignAssetNotification[] = [];

function formatRoleLabel(role: ReferenceAssetRole): string {
  return role.replace(/_/g, ' ').toUpperCase();
}

export function createDesignAssetReadyNotification(input: {
  projectId: string;
  screenId: string;
  slotId: string;
  assetRole: ReferenceAssetRole;
  assetUrl: string;
}): DesignAssetNotification {
  const notification: DesignAssetNotification = {
    id: `notify-${input.slotId}-${Date.now()}`,
    projectId: input.projectId,
    category: 'GENERATION_COMPLETE',
    title: `${formatRoleLabel(input.assetRole)} READY`,
    message: `${formatRoleLabel(input.assetRole)} generated for Design workspace.`,
    actionTarget: `${DESIGN_WORKSPACE_DEEP_LINK}?project=${input.projectId}&screen=${input.screenId}`,
    dedupeKey: `design-asset-ready:${input.slotId}`,
    createdAt: new Date().toISOString(),
    metadata: {
      slotId: input.slotId,
      screenId: input.screenId,
      assetUrl: input.assetUrl,
      sourceSystem: 'P0.VR.2A',
    },
  };
  notificationStore.push(notification);
  return notification;
}

export function createBatchAssetsReadyNotification(input: {
  projectId: string;
  screenId: string;
  count: number;
}): DesignAssetNotification {
  const notification: DesignAssetNotification = {
    id: `notify-batch-${input.screenId}-${Date.now()}`,
    projectId: input.projectId,
    category: 'GENERATION_COMPLETE',
    title: `${input.count} DESIGN ASSETS READY FOR REVIEW`,
    message: `${input.count} visual assets finished generating.`,
    actionTarget: `${DESIGN_WORKSPACE_DEEP_LINK}?project=${input.projectId}&screen=${input.screenId}`,
    dedupeKey: `design-assets-batch:${input.screenId}:${input.count}`,
    createdAt: new Date().toISOString(),
    metadata: { screenId: input.screenId, count: input.count, sourceSystem: 'P0.VR.2A' },
  };
  notificationStore.push(notification);
  return notification;
}

export function listDesignAssetNotifications(projectId?: string): DesignAssetNotification[] {
  return projectId
    ? notificationStore.filter((n) => n.projectId === projectId)
    : [...notificationStore];
}

export function clearDesignAssetNotificationsForTest(): void {
  notificationStore.length = 0;
}

export function notificationDeepLinksToDesignWorkspace(notification: DesignAssetNotification): boolean {
  return notification.actionTarget.includes('/studio-world/design');
}
