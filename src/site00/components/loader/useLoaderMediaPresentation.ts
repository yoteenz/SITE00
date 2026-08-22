import { useEffect, useState } from 'react';
import {
  getSite00OriginWideViewportSnapshot,
  subscribeSite00OriginWideViewport,
} from '../shell/site00OriginViewport';
import type { LoaderPresentation } from './loader-composition-resolver';

/** Viewport-driven loader media — desktop static + animation at ≥768px; mobile below. */
export function useLoaderMediaPresentation(): LoaderPresentation {
  const [presentation, setPresentation] = useState<LoaderPresentation>(() =>
    getSite00OriginWideViewportSnapshot() ? 'desktop' : 'mobile',
  );

  useEffect(() => {
    const sync = () => {
      setPresentation(getSite00OriginWideViewportSnapshot() ? 'desktop' : 'mobile');
    };

    sync();
    return subscribeSite00OriginWideViewport(sync);
  }, []);

  return presentation;
}
