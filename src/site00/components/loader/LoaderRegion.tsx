import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { type LoaderRegionId } from './loader-composition-map';
import { useLoaderCompositionOptional } from './LoaderCompositionContext';

type LoaderRegionProps = {
  id: LoaderRegionId;
  children?: ReactNode;
  className?: string;
  allowOverflow?: boolean;
  ariaLabel?: string;
};

/** Maps an approved loader reference rectangle onto the live stage canvas. */
export function LoaderRegion({ id, children, className, allowOverflow, ariaLabel }: LoaderRegionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ctx = useLoaderCompositionOptional();

  useEffect(() => {
    if (!ctx) return;
    ctx.registerRegion(id, ref.current);
    return () => ctx.registerRegion(id, null);
  }, [ctx, id]);

  const style: CSSProperties = ctx
    ? ctx.composition.regionStyleVars(id)
    : {};

  return (
    <div
      ref={ref}
      className={`site00-loader-region ${allowOverflow ? 'site00-loader-region--overflow' : ''} ${className ?? ''}`.trim()}
      data-loader-region={id}
      style={style}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
