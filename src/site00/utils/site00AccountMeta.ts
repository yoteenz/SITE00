/**
 * Shared safe account metadata helpers — used by IDNTY control center and CTRL ROOM.
 */
import type { Site00CurrentUser } from '../hooks/useSite00CurrentUser';

export type StoredUserFields = Site00CurrentUser & {
  id?: string;
  createdAt?: string;
};

export function readStoredUserFields(): StoredUserFields | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    return JSON.parse(raw) as StoredUserFields;
  } catch {
    return null;
  }
}

export function formatMemberSince(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

/** Public-safe masked account reference — never exposes full Supabase UUID. */
export function formatAccountReference(id?: string): string | null {
  if (!id || typeof id !== 'string') return null;
  const compact = id.replace(/-/g, '').toUpperCase();
  if (compact.length < 8) return null;
  return `${compact.slice(0, 2)}-${compact.slice(2, 6)}-${compact.slice(6, 10)}`;
}

export function formatBillingEventDate(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

export function formatActivityClockTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
