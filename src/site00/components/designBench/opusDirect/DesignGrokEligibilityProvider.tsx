import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DESIGN_PAGE_CAPTURE_UPDATED_EVENT } from '../../../../../shared/site00-design-workspace-production/designPageCapture.js';
import type { GrokEligibilityResult } from '../../../../../shared/site00-design-workspace-production/designGrokAssetEligibility.js';
import type { PageViewportId } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/pageViewportAuthority.js';
import type { DesignProductionState } from '../../../../../shared/site00-design-workspace-production/types.js';
import { useGrokAssetEligibility } from './useGrokAssetEligibility';

type Ctx = {
  eligibility: GrokEligibilityResult;
  refresh: () => void;
};

const DesignGrokEligibilityContext = createContext<Ctx | null>(null);

export function DesignGrokEligibilityProvider({
  projectSlug,
  pageId,
  viewport,
  productionState,
  children,
}: {
  projectSlug: string;
  pageId: string;
  viewport: PageViewportId;
  productionState: DesignProductionState;
  children: ReactNode;
}) {
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((n) => n + 1), []);
  const eligibility = useGrokAssetEligibility(projectSlug, pageId, viewport, productionState, revision);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onCapture = (ev: Event) => {
      const detail = (ev as CustomEvent<{ projectId: string; pageId: string; viewport: string }>).detail;
      if (!detail) return;
      if (detail.projectId === projectSlug && detail.pageId === pageId && detail.viewport === viewport) {
        refresh();
      }
    };
    window.addEventListener(DESIGN_PAGE_CAPTURE_UPDATED_EVENT, onCapture);
    return () => window.removeEventListener(DESIGN_PAGE_CAPTURE_UPDATED_EVENT, onCapture);
  }, [pageId, projectSlug, refresh, viewport]);

  const value = useMemo(() => ({ eligibility, refresh }), [eligibility, refresh]);
  return (
    <DesignGrokEligibilityContext.Provider value={value}>{children}</DesignGrokEligibilityContext.Provider>
  );
}

export function useDesignGrokEligibility(): Ctx {
  const ctx = useContext(DesignGrokEligibilityContext);
  if (!ctx) {
    return {
      eligibility: {
        eligibility: 'BLOCKED_TWIN_NOT_CREATED',
        canGenerateProductionAssets: false,
        shortReason: 'TWIN PAGE REQUIRED',
        nextAction: null,
        assetProductionStatus: 'BLOCKED',
        gates: [],
        twinRoute: null,
      },
      refresh: () => undefined,
    };
  }
  return ctx;
}
