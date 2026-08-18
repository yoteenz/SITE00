import { useEffect, useState } from 'react';
import {
  getSite00OriginWideViewportSnapshot,
  subscribeSite00OriginWideViewport,
} from '../shell/site00OriginViewport';
import type { LoaderPresentation } from './loader-composition-resolver';

/** Asset Vault loader presentation — desktop at ≥768px; mobile below. */
export function useLoaderPresentation(loaderId: string): LoaderPresentation {
  const [presentation, setPresentation] = useState<LoaderPresentation>(() =>
    loaderId === 'assts' && getSite00OriginWideViewportSnapshot() ? 'desktop' : 'mobile',
  );

  useEffect(() => {
    if (loaderId !== 'assts') {
      setPresentation('mobile');
      return;
    }

    const sync = () => {
      setPresentation(getSite00OriginWideViewportSnapshot() ? 'desktop' : 'mobile');
    };

    sync();
    return subscribeSite00OriginWideViewport(sync);
  }, [loaderId]);

  return presentation;
}
