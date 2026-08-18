import { useEffect, useRef, useState, type ReactNode } from 'react';
import { EnvironmentalStage, getLockedCompositionDocument, lockedCompositionCssVars } from '../../composition';
import { documentToEnvironmentMap } from '../../composition/studio/types';
import { ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1 } from '../../compositions/assts-library-corridor-v1';
import { ASSTS_ENVIRONMENT_SLOTS } from '../config/slots';
import { resolveAsstsSlot } from '../services/asstsApi';

type AsstsLibraryShellProps = {
  children: ReactNode;
  /** Scroll document flow (Library Home) instead of absolute composition zones */
  scrollLayout?: boolean;
};

const FALLBACK_CLASS = 'site00-assts-env-fallback--library';

/** Library route — composition-aware environment shell. */
export function AsstsLibraryShell({ children, scrollLayout = false }: AsstsLibraryShellProps) {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [source, setSource] = useState<'locked' | 'fallback'>('fallback');
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const lockedDoc = scrollLayout ? null : getLockedCompositionDocument(ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1.environmentId);
  const composition = lockedDoc ? documentToEnvironmentMap(lockedDoc) : ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1;
  const compositionLocked = Boolean(lockedDoc);

  useEffect(() => {
    if (scrollLayout) {
      setSource('fallback');
      setBgUrl(null);
      return;
    }
    let cancelled = false;
    resolveAsstsSlot(ASSTS_ENVIRONMENT_SLOTS.library)
      .then((res) => {
        if (cancelled) return;
        setSource(res.resolved.source);
        setBgUrl(res.resolved.url);
      })
      .catch(() => {
        if (!cancelled) {
          setSource('fallback');
          setBgUrl(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [scrollLayout]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !lockedDoc || size.w <= 0) return;
    const vars = lockedCompositionCssVars(lockedDoc, size.w, size.h, 'mobile');
    for (const [key, value] of Object.entries(vars)) {
      el.style.setProperty(key, value);
    }
    el.dataset.compositionContract = 'locked';
  }, [lockedDoc, size.w, size.h]);

  return (
    <div
      ref={rootRef}
      className={
        scrollLayout
          ? 'assts-library-shell assts-library-shell--scroll'
          : compositionLocked
            ? 'assts-library-shell assts-library-shell--contract'
            : 'assts-library-shell'
      }
    >
      <EnvironmentalStage
        composition={composition}
        backgroundUrl={bgUrl}
        fallbackClass={FALLBACK_CLASS}
        source={source}
        className="site00-assts-shell assts-library-stage"
      >
        {children}
      </EnvironmentalStage>
    </div>
  );
}
