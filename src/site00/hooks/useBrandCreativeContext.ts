/**
 * P0.CBI.1 — Load/assemble brand creative context for campaign surfaces.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  brandCreativeContextAssembler,
  loadPersistedContext,
  persistAssembledContext,
  type BrandCreativeContext,
} from '../../../shared/site00-brand-lore/brandCreativeContext/index.js';
import { normalizeBrandId } from '../../../shared/site00-brand-lore/brandCreativeContext/constants.js';
import { checkCampaignGenerationGate } from '../../../shared/site00-brand-lore/brandCreativeContext/readiness.js';

export function useBrandCreativeContext(brandSlug: string) {
  const brandId = normalizeBrandId(brandSlug);
  const [context, setContext] = useState<BrandCreativeContext | null>(() => loadPersistedContext(brandId));
  const [loading, setLoading] = useState(!context);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const run = async () => {
      const cached = loadPersistedContext(brandId);
      if (cached && !cancelled) {
        setContext(cached);
        setLoading(false);
        return;
      }

      const result = brandCreativeContextAssembler.assemble({ brandId });
      persistAssembledContext(result.context);
      if (!cancelled) {
        setContext(result.context);
        setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  const gate = useMemo(() => checkCampaignGenerationGate(context), [context]);

  const refresh = () => {
    const result = brandCreativeContextAssembler.refresh(brandId, { brandId });
    persistAssembledContext(result.context);
    setContext(result.context);
  };

  return {
    context,
    loading,
    gate,
    viewOpen,
    setViewOpen,
    refresh,
  };
}
