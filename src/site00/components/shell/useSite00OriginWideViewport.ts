import { useSyncExternalStore } from 'react';
import {
  getSite00OriginWideViewportSnapshot,
  subscribeSite00OriginWideViewport,
} from './site00OriginViewport';

/** True when the browser viewport is wide enough for native desktop presentation. */
export function useSite00OriginWideViewport(): boolean {
  return useSyncExternalStore(
    subscribeSite00OriginWideViewport,
    getSite00OriginWideViewportSnapshot,
    () => false,
  );
}
