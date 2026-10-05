/**
 * P0.PAF.1 — Product Asset Factory batch notifications.
 */

import { PRODUCT_ASSET_FACTORY_ROUTE } from './constants.js';
import type { ProductAssetFactoryNotification } from './types.js';

const notificationStore: ProductAssetFactoryNotification[] = [];

export function createBatchReadyNotification(
  projectId: string,
  batchId: string,
  ready: number,
  total: number,
): ProductAssetFactoryNotification {
  const notification: ProductAssetFactoryNotification = {
    id: `paf-notify-${batchId}`,
    projectId,
    batchId,
    title: 'BUILD-A-WIG BATCH READY',
    message: `${ready} / ${total} GENERATED`,
    actionTarget: `${PRODUCT_ASSET_FACTORY_ROUTE}?batch=${batchId}`,
    createdAt: new Date().toISOString(),
    partialFailure: ready < total,
  };
  notificationStore.push(notification);
  return notification;
}

export function createPartialBatchNotification(
  projectId: string,
  batchId: string,
  passed: number,
  total: number,
): ProductAssetFactoryNotification {
  const notification: ProductAssetFactoryNotification = {
    id: `paf-notify-partial-${batchId}`,
    projectId,
    batchId,
    title: 'PRODUCT COLOR VARIANTS READY',
    message: `${passed} / ${total} PASSED QA`,
    actionTarget: `${PRODUCT_ASSET_FACTORY_ROUTE}?batch=${batchId}`,
    createdAt: new Date().toISOString(),
    partialFailure: true,
  };
  notificationStore.push(notification);
  return notification;
}

export function listProductAssetNotifications(projectId?: string): ProductAssetFactoryNotification[] {
  return projectId
    ? notificationStore.filter((n) => n.projectId === projectId)
    : [...notificationStore];
}

export function notificationDeepLinksToProductAssetFactory(notification: ProductAssetFactoryNotification): boolean {
  return notification.actionTarget.startsWith(PRODUCT_ASSET_FACTORY_ROUTE);
}

export function clearProductAssetNotificationsForTest(): void {
  notificationStore.length = 0;
}
