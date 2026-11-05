/**
 * F05 MONEY parent route. The cabinet hub stays the default; the layered motion pilot is opt-in for founder review:
 * open /money?parent=motion (remembered for this browser session) and /money?parent=cabinet to return.
 * The choice is a per-viewer display preference only; it never touches financial records.
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MoneyHubScreen } from '../MoneyScreens';
import { MoneyMotionParent } from './MoneyMotionParent';
import { patchF05Nav } from './f05NavPersistence';

export type F05ParentVariant = 'cabinet' | 'motion';
const KEY = 'jurnl.f05.parent';

export function resolveF05ParentVariant(param: string | null): F05ParentVariant {
  if (param === 'motion' || param === 'cabinet') {
    try {
      sessionStorage.setItem(KEY, param);
    } catch {
      /* private mode: the query alone decides */
    }
    patchF05Nav({ parent: param });
    return param;
  }
  try {
    const remembered = sessionStorage.getItem(KEY) === 'motion' ? 'motion' : 'cabinet';
    patchF05Nav({ parent: remembered });
    return remembered;
  } catch {
    return 'cabinet';
  }
}

export function MoneyParentRoute() {
  const [params, setParams] = useSearchParams();
  const variant = resolveF05ParentVariant(params.get('parent'));
  useEffect(() => {
    if (params.get('parent')) return;
    const next = new URLSearchParams(params);
    next.set('parent', variant);
    setParams(next, { replace: true });
  }, [params, setParams, variant]);
  return variant === 'motion' ? <MoneyMotionParent /> : <MoneyHubScreen />;
}
