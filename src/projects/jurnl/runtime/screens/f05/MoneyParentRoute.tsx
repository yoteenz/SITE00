/**
 * F05 MONEY parent route. The cabinet hub stays the default; the layered motion pilot is opt-in for founder review:
 * open /money?parent=motion (remembered for this browser session) and /money?parent=cabinet to return.
 * The choice is a per-viewer display preference only; it never touches financial records.
 */

import { useSearchParams } from 'react-router-dom';
import { MoneyHubScreen } from '../MoneyScreens';
import { MoneyMotionParent } from './MoneyMotionParent';

export type F05ParentVariant = 'cabinet' | 'motion';
const KEY = 'jurnl.f05.parent';

export function resolveF05ParentVariant(param: string | null): F05ParentVariant {
  if (param === 'motion' || param === 'cabinet') {
    try {
      sessionStorage.setItem(KEY, param);
    } catch {
      /* private mode: the query alone decides */
    }
    return param;
  }
  try {
    return sessionStorage.getItem(KEY) === 'motion' ? 'motion' : 'cabinet';
  } catch {
    return 'cabinet';
  }
}

export function MoneyParentRoute() {
  const [params] = useSearchParams();
  return resolveF05ParentVariant(params.get('parent')) === 'motion' ? <MoneyMotionParent /> : <MoneyHubScreen />;
}
