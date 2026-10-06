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
  /** The project the action was taken in — required for project-scoped ACTIVITY. */
  projectId?: string | null;
}): HubActivityItem {
  const item: HubActivityItem = {
    id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    category: args.category,
    title: args.title,
    detail: args.detail,
    at: new Date().toISOString(),
    actor: args.actor ?? null,
    assetSlotId: args.assetSlotId ?? null,
    projectId: args.projectId ?? null,
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

/**
 * The project an activity record belongs to. New records carry `projectId`; legacy records (written before the
 * project key existed) are attributed only by evidence — the asset slot they reference (`production.<p>.…`,
 * `project.<p>.…`) or the project name every legacy writer embedded in the detail (`NDXBOOK · …`, `NDXBOOK / …`).
 * Anything else is unattributable and is shown under NO project.
 */
export function activityProjectOf(item: Pick<HubActivityItem, 'projectId' | 'assetSlotId' | 'detail'>, projects: readonly { projectId: string; name: string }[]): string | null {
  if (item.projectId) return item.projectId.toLowerCase();
  const slot = item.assetSlotId ? /^(?:production|project)\.([a-z0-9-]+)\./.exec(item.assetSlotId) : null;
  if (slot) return slot[1]!;
  const detail = (item.detail ?? '').toUpperCase();
  const named = projects.filter((p) => new RegExp(`(^|[\\s·/])${p.name.toUpperCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[·/]`).test(detail));
  return named.length === 1 ? named[0]!.projectId : null;
}
