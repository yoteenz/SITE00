/**
 * First-login device → server snapshot merge (Wave 5 live proof).
 * Server snapshot wins when both exist and server is newer; device uploads when server empty.
 */
import type { RepositorySnapshot } from './types';
import type { JurnlDataMode } from './dataMode';

export type DeviceServerMergeDecision =
  | { action: 'USE_SERVER'; snapshot: RepositorySnapshot; reason: 'SERVER_EXISTS' }
  | { action: 'UPLOAD_DEVICE'; snapshot: RepositorySnapshot; reason: 'SERVER_EMPTY_DEVICE_HAS_DATA' }
  | { action: 'USE_DEVICE'; snapshot: RepositorySnapshot; reason: 'BOTH_EMPTY_DEVICE_SEEDED' }
  | { action: 'USE_SERVER'; snapshot: RepositorySnapshot; reason: 'SERVER_NEWER_THAN_DEVICE' };

/** @deprecated Timestamp-based merge (Wave 5). The runtime uses decideHydrate (server revision based) instead. */
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

export type HydrateInput =
  | { ok: true; snapshot: RepositorySnapshot | null; revision: number }
  | { ok: false; code: 'OFFLINE' | 'SERVER' | 'NOT_CONFIGURED' };

export type HydrateDecision =
  | { action: 'USE_SERVER'; snapshot: RepositorySnapshot; revision: number; keepDeviceAsConflictCopy: boolean; reason: 'SERVER_EXISTS' | 'DEVICE_CHANGES_ON_OLDER_REVISION' }
  | { action: 'UPLOAD_DEVICE'; snapshot: RepositorySnapshot; expectedRevision: number; reason: 'DEVICE_HAS_UNSYNCED_CHANGES' }
  | { action: 'START_EMPTY'; reason: 'NEW_ACCOUNT' }
  | { action: 'USE_DEVICE_OFFLINE'; snapshot: RepositorySnapshot; reason: 'SERVER_UNREACHABLE' }
  | { action: 'NONE'; reason: 'SERVER_UNREACHABLE_NO_DEVICE_COPY' };

/**
 * Sign-in hydrate for a real account (revision based; never timestamp based).
 *   - Only a device copy of the SAME user and SAME data mode is considered (never email-keyed, never preview data).
 *   - The server wins unless the device holds unsynced changes made on top of the server's current revision; those
 *     upload with that revision (compare-and-swap), so they can never overwrite anything newer.
 *   - Device changes made on an older revision are kept on the device as a conflict copy; the server copy loads.
 *   - When the server cannot be reached, the device copy is shown as an offline cache and nothing is uploaded.
 */
export function decideHydrate(pull: HydrateInput, device: RepositorySnapshot | null, mode: JurnlDataMode, userId: string): HydrateDecision {
  const dev = device && device.userId === userId && (device.dataMode ?? 'DESIGN_PREVIEW') === mode ? device : null;
  if (!pull.ok) return dev ? { action: 'USE_DEVICE_OFFLINE', snapshot: dev, reason: 'SERVER_UNREACHABLE' } : { action: 'NONE', reason: 'SERVER_UNREACHABLE_NO_DEVICE_COPY' };
  const dirty = Boolean(dev?.syncBase?.dirty);
  const base = dev?.syncBase?.revision ?? 0;
  if (pull.snapshot && pull.revision > 0) {
    if (dev && dirty && base === pull.revision) return { action: 'UPLOAD_DEVICE', snapshot: dev, expectedRevision: pull.revision, reason: 'DEVICE_HAS_UNSYNCED_CHANGES' };
    return { action: 'USE_SERVER', snapshot: pull.snapshot, revision: pull.revision, keepDeviceAsConflictCopy: Boolean(dev && dirty), reason: dev && dirty ? 'DEVICE_CHANGES_ON_OLDER_REVISION' : 'SERVER_EXISTS' };
  }
  if (dev && dirty && base === 0 && hasMaterialDeviceData(dev)) return { action: 'UPLOAD_DEVICE', snapshot: dev, expectedRevision: 0, reason: 'DEVICE_HAS_UNSYNCED_CHANGES' };
  return { action: 'START_EMPTY', reason: 'NEW_ACCOUNT' };
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
    || (snap.obligations?.length ?? 0) > 0
    || (snap.dailyEarnings?.length ?? 0) > 0
    || snap.setup.started
  );
}
