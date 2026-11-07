/**
 * F05 MONEY navigation memory for this browser tab. Keeps motion vs cabinet, the active carousel collection,
 * and accounts-rail scroll across refresh and in-app hops that would otherwise drop query params.
 */
import type { CollectionId } from '../../../data/f05/moneyCarousel';
import type { F05ParentVariant } from './MoneyParentRoute';

export const F05_NAV_KEY = 'jurnl.f05.nav';

export type F05NavSnapshot = {
  parent?: F05ParentVariant;
  c?: CollectionId;
  railScroll?: number;
};

export function readF05Nav(): F05NavSnapshot {
  try {
    const raw = sessionStorage.getItem(F05_NAV_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as F05NavSnapshot;
  } catch {
    return {};
  }
}

export function patchF05Nav(patch: Partial<F05NavSnapshot>): void {
  try {
    sessionStorage.setItem(F05_NAV_KEY, JSON.stringify({ ...readF05Nav(), ...patch }));
  } catch {
    /* private mode */
  }
}

/** When routing to MONEY, carry parent + carousel from the live URL or the last saved tab state. */
export function mergeMoneySearchParams(incoming: URLSearchParams, current: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(incoming);
  const saved = readF05Nav();
  for (const key of ['parent', 'c'] as const) {
    if (next.has(key)) continue;
    const live = current.get(key);
    const remembered = saved[key];
    const v = live ?? remembered;
    if (v) next.set(key, v);
  }
  return next;
}
