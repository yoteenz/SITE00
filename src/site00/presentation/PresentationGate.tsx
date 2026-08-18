import type { ReactNode } from 'react';
import { usePresentationMode } from './usePresentationMode';

type PresentationGateProps = {
  mobile: ReactNode;
  desktop: ReactNode;
  /** Optional compact/tablet treatment — defaults to mobile presentation */
  tablet?: ReactNode;
};

/**
 * Route-level presentation switch — one canonical URL, dedicated mobile/desktop trees.
 */
export function PresentationGate({ mobile, desktop, tablet }: PresentationGateProps) {
  const { mode, viewportBand } = usePresentationMode();

  if (mode === 'desktop') return <>{desktop}</>;
  if (viewportBand === 'tablet' && tablet) return <>{tablet}</>;
  return <>{mobile}</>;
}

type PresentationBranchProps = {
  when: 'mobile' | 'desktop';
  children: ReactNode;
};

/** Render children only when active presentation matches. */
export function PresentationBranch({ when, children }: PresentationBranchProps) {
  const { mode } = usePresentationMode();
  if (mode !== when) return null;
  return <>{children}</>;
}
