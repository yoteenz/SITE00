/**
 * Device-local record of consequential Production Hub actions (approvals, revisions).
 * Written ONLY when a real action succeeded. Read by the Hub's Recent Activity.
 */
import { useCallback, useEffect, useState } from 'react';
import type { HubActivityCategory, HubActivityItem } from '../../../shared/site00-production-hub/types.js';

const KEY = 'site00.production.activity.v1';
const EVENT = 'site00:production-activity';

function read(): HubActivityItem[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as HubActivityItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordProductionActivity(args: {
  category: HubActivityCategory;
  title: string;
  detail: string;
  actor?: string | null;
  assetSlotId?: string | null;
}): HubActivityItem {
  const item: HubActivityItem = {
    id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    category: args.category,
    title: args.title,
    detail: args.detail,
    at: new Date().toISOString(),
    actor: args.actor ?? null,
    assetSlotId: args.assetSlotId ?? null,
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify([item, ...read()].slice(0, 200)));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage unavailable */
  }
  return item;
}

export function useProductionActivity(): HubActivityItem[] {
  const [list, setList] = useState<HubActivityItem[]>(() => (typeof window === 'undefined' ? [] : read()));
  const refresh = useCallback(() => setList(read()), []);
  useEffect(() => {
    refresh();
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);
  return list;
}
