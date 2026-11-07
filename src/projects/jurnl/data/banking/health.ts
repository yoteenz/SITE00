/**
 * Connection health in plain words. Built only from the server's connection record — a local account never makes an
 * institution look CONNECTED.
 */
import type { BankConnectionStatus, BankItemView } from './types';

export type HealthState =
  | 'NOT_CONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'SYNCING'
  | 'UP_TO_DATE'
  | 'DELAYED'
  | 'NEEDS_RECONNECTION'
  | 'PERMISSION_REVOKED'
  | 'INSTITUTION_UNAVAILABLE'
  | 'ERROR'
  | 'DISCONNECTED';

export type ConnectionHealth = {
  state: HealthState;
  label: string;
  message: string;
  actions: ('RETRY' | 'RECONNECT' | 'DISCONNECT' | 'CONNECT')[];
  asOf: string | null;
};

/** No successful sync for this long while the connection is otherwise fine → DELAYED. */
export const DELAYED_AFTER_HOURS = 24;

export function formatAsOf(iso: string | null, now: Date = new Date()): string {
  if (!iso) return 'NOT YET';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'NOT YET';
  const sameDay = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toUpperCase();
  if (sameDay) return `TODAY ${time}`;
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()} ${time}`;
}

export function connectionHealth(item: Pick<BankItemView, 'status' | 'last_successful_sync_at' | 'consent_expires_at' | 'institution_name'> | null, now: Date = new Date(), connecting = false): ConnectionHealth {
  if (connecting) return { state: 'CONNECTING', label: 'CONNECTING', message: 'FINISH THE STEPS WITH YOUR BANK.', actions: [], asOf: null };
  if (!item) return { state: 'NOT_CONNECTED', label: 'NOT CONNECTED', message: 'NO BANK IS CONNECTED. YOU CAN STILL RECORD EVERYTHING BY HAND.', actions: ['CONNECT'], asOf: null };
  const asOf = item.last_successful_sync_at;
  const name = item.institution_name ?? 'YOUR BANK';
  const status: BankConnectionStatus = item.status;
  switch (status) {
    case 'DISCONNECTED':
      return { state: 'DISCONNECTED', label: 'DISCONNECTED', message: `${name} IS NO LONGER CONNECTED. IMPORTED HISTORY STAYS UNLESS YOU REMOVED IT.`, actions: ['CONNECT'], asOf };
    case 'NEEDS_REAUTH':
      return { state: 'NEEDS_RECONNECTION', label: 'NEEDS RECONNECTION', message: `${name} ASKED YOU TO SIGN IN AGAIN. NOTHING NEW ARRIVES UNTIL YOU RECONNECT.`, actions: ['RECONNECT', 'DISCONNECT'], asOf };
    case 'PERMISSION_REVOKED':
      return { state: 'PERMISSION_REVOKED', label: 'ACCESS REMOVED', message: `ACCESS TO ${name} WAS REMOVED. RECONNECT TO KEEP IT UP TO DATE.`, actions: ['RECONNECT', 'DISCONNECT'], asOf };
    case 'INSTITUTION_UNAVAILABLE':
      return { state: 'INSTITUTION_UNAVAILABLE', label: 'BANK UNAVAILABLE', message: `${name} IS NOT RESPONDING RIGHT NOW. JURNL WILL TRY AGAIN.`, actions: ['RETRY'], asOf };
    case 'SYNC_ERROR':
      return { state: 'ERROR', label: 'SYNC PROBLEM', message: `THE LAST UPDATE FROM ${name} DID NOT FINISH. YOUR EARLIER DATA IS SAFE.`, actions: ['RETRY', 'DISCONNECT'], asOf };
    case 'SYNCING':
      return { state: 'SYNCING', label: 'UPDATING', message: `GETTING YOUR LATEST ACTIVITY FROM ${name}.`, actions: [], asOf };
    case 'ACTIVE':
    default: {
      if (!asOf) return { state: 'CONNECTED', label: 'CONNECTED', message: `${name} IS CONNECTED. THE FIRST UPDATE IS ON ITS WAY.`, actions: ['RETRY', 'DISCONNECT'], asOf };
      const ageH = (now.getTime() - Date.parse(asOf)) / 3_600_000;
      const expiring = item.consent_expires_at && Date.parse(item.consent_expires_at) - now.getTime() < 7 * 24 * 3_600_000;
      if (ageH > DELAYED_AFTER_HOURS)
        return { state: 'DELAYED', label: 'DELAYED', message: `LAST UPDATED ${formatAsOf(asOf, now)}. BALANCES MAY HAVE CHANGED SINCE.`, actions: ['RETRY', 'DISCONNECT'], asOf };
      return {
        state: 'UP_TO_DATE',
        label: `UP TO DATE AS OF ${formatAsOf(asOf, now)}`,
        message: expiring ? `RECONNECT ${name} BEFORE ${formatAsOf(item.consent_expires_at, now)} TO KEEP IT UPDATING.` : `BALANCES AND ACTIVITY FROM ${name}.`,
        actions: expiring ? ['RECONNECT', 'RETRY', 'DISCONNECT'] : ['RETRY', 'DISCONNECT'],
        asOf,
      };
    }
  }
}
