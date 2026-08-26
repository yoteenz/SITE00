/**
 * P0.R.1 — Unified Reader world presence + destination routing model.
 * One canonical location state — no conflicting per-feature location fields.
 */

import type { DestinationSlug } from '../types.js';
import type { ReaderAccountProfile } from './types.js';

export type ReaderWorldPresence = {
  readerId: string;
  status: ReaderAccountProfile['presence'];
  currentDestination: DestinationSlug | null;
  currentRoomId: string | null;
  lastPresenceUpdate: string;
  sessionState: 'IDLE' | 'IN_SESSION' | 'AWAY';
};

export function readerPresenceFromProfile(profile: ReaderAccountProfile): ReaderWorldPresence {
  return {
    readerId: profile.readerId,
    status: profile.presence,
    currentDestination: profile.currentDestination,
    currentRoomId: profile.currentRoomId,
    lastPresenceUpdate: profile.updatedAt,
    sessionState: profile.presence === 'READING_NOW' ? 'IN_SESSION' : profile.presence === 'OFFLINE' ? 'AWAY' : 'IDLE',
  };
}

export function destinationLabel(slug: DestinationSlug | null): string {
  switch (slug) {
    case 'tarot-suite':
      return 'Tarot Suite';
    case 'astral-mall':
      return 'Astral Mall';
    case 'coffee-shop':
      return 'Coffee Shop';
    default:
      return 'Astréa';
  }
}

export function checkInReaderAtDestination(
  profile: ReaderAccountProfile,
  destination: DestinationSlug,
  roomId?: string | null,
): ReaderAccountProfile {
  const now = new Date().toISOString();
  return {
    ...profile,
    currentDestination: destination,
    currentRoomId: roomId ?? null,
    presence: profile.presence === 'OFFLINE' ? 'AVAILABLE' : profile.presence,
    updatedAt: now,
  };
}

export function syncReaderFixturePresence(
  _readerId: string,
  presence: ReaderWorldPresence,
): { currentDestination: DestinationSlug | null; presence: ReaderAccountProfile['presence'] } {
  return {
    currentDestination: presence.currentDestination,
    presence: presence.status,
  };
}
