import { useEffect, useMemo, useState } from 'react';
import { Site00LoaderConstruction } from './Site00LoaderConstruction';
import '../../styles/site00-loader.css';

export type Site00LoaderContext =
  | 'general'
  | 'site00'
  | 'enter'
  | 'assts'
  | 'idnty'
  | 'bldr'
  | 'bluprnt'
  | 'build';

type ContextCopy = { primary: string; secondary?: string };

const CONTEXT_COPY: Record<Site00LoaderContext, ContextCopy> = {
  general: { primary: 'ASSEMBLING SITE 00', secondary: 'EVERYTHING STARTS AT 00.' },
  site00: { primary: 'ASSEMBLING SITE 00', secondary: 'PREPARING YOUR DESTINATION.' },
  enter: { primary: 'ENTERING 00', secondary: 'PREPARING THE DIRECTORY.' },
  assts: { primary: 'PREPARING THE ASSET VAULT', secondary: 'RESOLVING PRODUCTION ASSETS.' },
  idnty: { primary: 'ASSEMBLING YOUR FOUNDATION', secondary: 'PREPARING IDNTY.' },
  bldr: { primary: 'PREPARING YOUR BUILD', secondary: 'ASSEMBLING BUILD DATA.' },
  bluprnt: { primary: 'GENERATING THE BLUPRNT', secondary: 'PREPARING DIRECTIONS.' },
  build: { primary: 'BUILD IN PROGRESS', secondary: 'ASSEMBLING SURFACES.' },
};

export type Site00LoaderProps = {
  context?: Site00LoaderContext;
  message?: string;
  secondaryMessage?: string;
  /** 0–100 when measurable; omit for indeterminate construction loop */
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  /** Delay before showing (avoids flicker on instant routes) */
  showDelayMs?: number;
  error?: boolean;
  onRetry?: () => void;
  className?: string;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

function useDelayedVisible(delayMs: number): boolean {
  const [visible, setVisible] = useState(delayMs <= 0);
  useEffect(() => {
    if (delayMs <= 0) {
      setVisible(true);
      return;
    }
    const t = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);
  return visible;
}

export function contextFromLoadingSource(source?: string): Site00LoaderContext {
  const s = (source ?? '').toLowerCase();
  if (s.includes('assts')) return 'assts';
  if (s.includes('idnty')) return 'idnty';
  if (s.includes('bldr')) return 'bldr';
  if (s.includes('enter')) return 'enter';
  if (s.includes('bluprnt')) return 'bluprnt';
  if (s.includes('build')) return 'build';
  if (s.includes('site00') || s === 'site00') return 'site00';
  return 'general';
}

export function Site00Loader({
  context = 'general',
  message,
  secondaryMessage,
  progress,
  size = 'md',
  fullScreen = false,
  showDelayMs = 0,
  error = false,
  onRetry,
  className = '',
}: Site00LoaderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const visible = useDelayedVisible(showDelayMs);
  const copy = CONTEXT_COPY[context];
  const primary = message ?? copy.primary;
  const secondary = secondaryMessage ?? copy.secondary;
  const determinate = typeof progress === 'number' && Number.isFinite(progress);
  const progressValue = determinate ? Math.min(100, Math.max(0, progress)) : undefined;

  const ariaLabel = useMemo(() => {
    if (error) return 'Build interrupted';
    return `${primary}${secondary ? `. ${secondary}` : ''}`;
  }, [error, primary, secondary]);

  if (!visible) return null;

  const rootClass = [
    'site00-loader',
    fullScreen ? 'site00-loader--fullscreen' : '',
    size !== 'md' ? `site00-loader--${size}` : '',
    error ? 'site00-loader--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} role="status" aria-live="polite" aria-label={ariaLabel}>
      {!error ? (
        <>
          <Site00LoaderConstruction size={size} reducedMotion={reducedMotion} />
          <p className="site00-loader__message">{primary}</p>
          {secondary ? <p className="site00-loader__secondary">{secondary}</p> : null}
          <div
            className={`site00-loader__progress ${determinate ? 'site00-loader__progress--determinate' : 'site00-loader__progress--indeterminate'}`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={determinate ? progressValue : undefined}
            aria-label={determinate ? `${progressValue}% complete` : 'Loading in progress'}
          >
            <div
              className="site00-loader__progress-fill"
              style={determinate ? { width: `${progressValue}%` } : undefined}
            />
          </div>
        </>
      ) : (
        <>
          <Site00LoaderConstruction size={size} reducedMotion />
          <p className="site00-loader__message">BUILD INTERRUPTED.</p>
          <p className="site00-loader__secondary">WE COULDN&apos;T COMPLETE THIS STEP.</p>
          {onRetry ? (
            <button type="button" className="site00-loader__retry" onClick={onRetry}>
              TRY AGAIN →
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
