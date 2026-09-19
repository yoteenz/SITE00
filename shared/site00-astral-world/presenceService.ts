/**
 * Prototype presence service — local state, realtime-ready abstraction.
 */

import type {
  CoffeeShopTable,
  DestinationSlug,
  EnergyState,
  PresencePrivacy,
  PresenceState,
  UserPresence,
} from './types.js';
import { PROTOTYPE_CURRENT_USER, PROTOTYPE_FRIENDS } from './fixtures.js';

export function createInitialUserPresence(): UserPresence {
  return {
    userId: PROTOTYPE_CURRENT_USER.id,
    state: 'IN_WORLD',
    district: null,
    destination: null,
    tableId: null,
    activity: null,
    privacy: PROTOTYPE_CURRENT_USER.privacy,
    joinable: true,
    updatedAt: new Date().toISOString(),
  };
}

export function joinTable(
  tables: CoffeeShopTable[],
  tableId: string,
  userId: string,
): { tables: CoffeeShopTable[]; error?: string } {
  const table = tables.find((t) => t.id === tableId);
  if (!table) return { tables, error: 'Table not found' };
  if (table.occupants.length >= table.capacity) return { tables, error: 'Table is full' };
  if (table.occupants.includes(userId)) return { tables };
  return {
    tables: tables.map((t) =>
      t.id === tableId ? { ...t, occupants: [...t.occupants, userId] } : t,
    ),
  };
}

export function leaveTable(tables: CoffeeShopTable[], tableId: string, userId: string): CoffeeShopTable[] {
  return tables.map((t) =>
    t.id === tableId ? { ...t, occupants: t.occupants.filter((id) => id !== userId) } : t,
  );
}

export function updateUserPresence(
  prev: UserPresence,
  patch: Partial<UserPresence>,
): UserPresence {
  return { ...prev, ...patch, updatedAt: new Date().toISOString() };
}

export function visibleFriends(privacy: PresencePrivacy) {
  if (privacy === 'HIDDEN') return [];
  return PROTOTYPE_FRIENDS.filter((f) => f.privacy !== 'HIDDEN');
}

export function friendLocationLabel(friendId: string): string | null {
  const friend = PROTOTYPE_FRIENDS.find((f) => f.id === friendId);
  if (!friend || friend.privacy === 'HIDDEN') return null;
  if (!friend.currentDestination) return 'In Astréa';
  const destLabels: Record<DestinationSlug, string> = {
    'coffee-shop': 'Coffee Shop',
    'astral-mall': 'Astral Mall',
    'tarot-suite': 'Tarot Suite',
  };
  return destLabels[friend.currentDestination];
}

export function canAlertRegularReturn(clientPermitsSharing: boolean): boolean {
  return clientPermitsSharing;
}

export function energyToIntent(energy: EnergyState) {
  const map: Record<EnergyState, string> = {
    ALIGNED_OPEN: 'NEED_CLARITY',
    NEED_CLARITY: 'NEED_CLARITY',
    NEED_COMFORT: 'NEED_COMFORT',
    CURIOUS: 'SOMETHING_ELSE',
    CELEBRATING: 'CELEBRATING',
    PRIVATE: 'DEEP_PRIVATE',
  };
  return map[energy];
}

export function presenceAtDestination(state: PresenceState): boolean {
  return ['AT_DESTINATION', 'AT_TABLE', 'READING', 'JOINABLE'].includes(state);
}
