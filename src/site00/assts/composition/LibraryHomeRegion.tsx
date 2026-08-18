import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import {
  type LibraryHomeRegionId,
  libraryHomeRegionStyleVars,
} from './library-home-composition-map';
import { useLibraryHomeCompositionOptional } from './LibraryHomeCompositionContext';

type LibraryHomeRegionProps = {
  id: LibraryHomeRegionId;
  children?: ReactNode;
  className?: string;
  /** Allow interaction overflow (e.g. dev panel) without expanding box */
  allowOverflow?: boolean;
  ariaLabel?: string;
};

/** Maps an approved reference rectangle onto the live composition canvas. */
export function LibraryHomeRegion({
  id,
  children,
  className,
  allowOverflow,
  ariaLabel,
}: LibraryHomeRegionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ctx = useLibraryHomeCompositionOptional();

  useEffect(() => {
    if (!ctx) return;
    ctx.registerRegion(id, ref.current);
    return () => ctx.registerRegion(id, null);
  }, [ctx, id]);

  const style: CSSProperties = {
    ...libraryHomeRegionStyleVars(id),
  };

  return (
    <div
      ref={ref}
      className={`assts-lib-region ${allowOverflow ? 'assts-lib-region--overflow' : ''} ${className ?? ''}`.trim()}
      data-composition-region={id}
      style={style}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
