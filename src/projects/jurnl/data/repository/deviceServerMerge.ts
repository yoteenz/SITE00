/**
 * First-login device → server snapshot merge (Wave 5 live proof).
 * Server snapshot wins when both exist and server is newer; device uploads when server empty.
 */
import type { RepositorySnapshot } from './types';

export type DeviceServerMergeDecision =
  | { action: 'USE_SERVER'; snapshot: RepositorySnapshot; reason: 'SERVER_EXISTS' }
  | { action: 'UPLOAD_DEVICE'; snapshot: RepositorySnapshot; reason: 'SERVER_EMPTY_DEVICE_HAS_DATA' }
  | { action: 'USE_DEVICE'; snapshot: RepositorySnapshot; reason: 'BOTH_EMPTY_DEVICE_SEEDED' }
  | { action: 'USE_SERVER'; snapshot: RepositorySnapshot; reason: 'SERVER_NEWER_THAN_DEVICE' };

export function decideDeviceServerMerge(
  server: RepositorySnapshot | null,
  device: RepositorySnapshot | null,
): DeviceServerMergeDecision | null {
  if (server && device) {
    const serverAt = Date.parse(server.updatedAt || '');
    const deviceAt = Date.parse(device.updatedAt || '');
    if (!Number.isNaN(serverAt) && !Number.isNaN(deviceAt) && deviceAt > serverAt) {
      return { action: 'UPLOAD_DEVICE', snapshot: { ...device, userId: server.userId }, reason: 'SERVER_EMPTY_DEVICE_HAS_DATA' };
    }
    return { action: 'USE_SERVER', snapshot: server, reason: 'SERVER_NEWER_THAN_DEVICE' };
  }
  if (server) return { action: 'USE_SERVER', snapshot: server, reason: 'SERVER_EXISTS' };
  if (device && hasMaterialDeviceData(device)) {
    return { action: 'UPLOAD_DEVICE', snapshot: device, reason: 'SERVER_EMPTY_DEVICE_HAS_DATA' };
  }
  if (device) return { action: 'USE_DEVICE', snapshot: device, reason: 'BOTH_EMPTY_DEVICE_SEEDED' };
  return null;
}

function hasMaterialDeviceData(snap: RepositorySnapshot): boolean {
  return (
    snap.accounts.length > 0
    || snap.transactions.length > 0
    || snap.incomeSources.length > 0
    || snap.planIntentions.length > 0
    || snap.purchases.length > 0
    || snap.trips.length > 0
    || snap.goals.length > 0
    || snap.records.length > 0
    || snap.setup.started
  );
}
