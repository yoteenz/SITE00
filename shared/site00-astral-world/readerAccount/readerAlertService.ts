/**
 * P0.R.1 — Client presence alerts with Seeker privacy override.
 */

import type { PresencePrivacy } from '../types.js';
import type { ReaderAccountProfile, ReaderAlertPreferences } from './types.js';
import { destinationLabel } from './readerPresenceModel.js';

export type ClientPresenceAlert = {
  alertId: string;
  type: 'CLIENT_ENTERED_WORLD' | 'CLIENT_ENTERED_DESTINATION';
  readerId: string;
  clientId: string;
  clientDisplayName: string;
  destination: string | null;
  message: string;
  createdAt: string;
};

export function defaultReaderAlertPreferences(): ReaderAlertPreferences {
  return {
    CLIENT_ENTERED_WORLD: true,
    CLIENT_ENTERED_DESTINATION: true,
    CLIENT_REQUESTED_ME: true,
    NEW_READING_REQUEST: true,
    NEW_FAVORITE_FOLLOW: true,
    TABLE_INVITATION: true,
  };
}

/** Seeker privacy ALWAYS overrides Reader alert preferences */
export function canNotifyReaderOfClientPresence(input: {
  clientPrivacy: PresencePrivacy;
  clientPermitsSharing: boolean;
  readerPrefs: ReaderAlertPreferences;
  alertType: keyof ReaderAlertPreferences;
  relationshipPermits: boolean;
}): boolean {
  if (input.clientPrivacy === 'HIDDEN') return false;
  if (!input.clientPermitsSharing) return false;
  if (!input.relationshipPermits) return false;
  if (!input.readerPrefs[input.alertType]) return false;
  return true;
}

export function buildClientPresenceAlert(input: {
  reader: ReaderAccountProfile;
  clientId: string;
  clientDisplayName: string;
  clientDestination: string | null;
  enteredWorld: boolean;
}): ClientPresenceAlert | null {
  const prefs = input.reader.alertPreferences;
  const type = input.clientDestination ? 'CLIENT_ENTERED_DESTINATION' : 'CLIENT_ENTERED_WORLD';
  const key = type === 'CLIENT_ENTERED_DESTINATION' ? 'CLIENT_ENTERED_DESTINATION' : 'CLIENT_ENTERED_WORLD';
  if (!prefs[key]) return null;

  const message =
    type === 'CLIENT_ENTERED_DESTINATION' && input.clientDestination
      ? `${input.clientDisplayName.toUpperCase()} IS AT ${destinationLabel(input.clientDestination as never).toUpperCase()}`
      : `${input.clientDisplayName.toUpperCase()} IS HERE`;

  return {
    alertId: `alert-${input.reader.readerId}-${input.clientId}-${Date.now()}`,
    type,
    readerId: input.reader.readerId,
    clientId: input.clientId,
    clientDisplayName: input.clientDisplayName,
    destination: input.clientDestination,
    message,
    createdAt: new Date().toISOString(),
  };
}
