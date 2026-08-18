import { recordActivity as apiRecordActivity } from './api';

const LOCAL_ACTIVITY_KEY = 'site00_activity_local_backup';
const MAX_LOCAL_ACTIVITY = 500;

export type ClientActivityRow = {
  id: string;
  eventType: string;
  payload?: Record<string, unknown>;
  createdAt: string;
};

type LocalActivityStored = ClientActivityRow & { userEmail: string };

function getCurrentUserEmailLower(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('currentUser');
    const u = raw ? (JSON.parse(raw) as { email?: string }) : null;
    const e = (u?.email || '').trim().toLowerCase();
    return e || null;
  } catch {
    return null;
  }
}

function appendLocalActivityBackup(eventType: string, payload?: Record<string, unknown>): void {
  const email = getCurrentUserEmailLower();
  if (!email) return;
  try {
    const entry: LocalActivityStored = {
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      userEmail: email,
      eventType,
      payload: payload && typeof payload === 'object' ? { ...payload } : undefined,
      createdAt: new Date().toISOString(),
    };
    const raw = localStorage.getItem(LOCAL_ACTIVITY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const arr: LocalActivityStored[] = Array.isArray(parsed) ? parsed : [];
    const next = [entry, ...arr].slice(0, MAX_LOCAL_ACTIVITY);
    localStorage.setItem(LOCAL_ACTIVITY_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function readLocalActivityForEmail(emailLower: string): ClientActivityRow[] {
  if (typeof window === 'undefined' || !emailLower) return [];
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVITY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const arr: LocalActivityStored[] = Array.isArray(parsed) ? parsed : [];
    const e = emailLower.trim().toLowerCase();
    return arr
      .filter((r) => (r.userEmail || '').trim().toLowerCase() === e)
      .map((r) => ({
        id: r.id,
        eventType: r.eventType,
        payload: r.payload,
        createdAt: r.createdAt,
      }));
  } catch {
    return [];
  }
}

export function trackActivity(event: string, meta?: Record<string, unknown>): void {
  appendLocalActivityBackup(event, meta);
  void apiRecordActivity(event, meta).catch(() => {});
}
