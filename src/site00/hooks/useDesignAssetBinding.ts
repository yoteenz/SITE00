/**
 * P0.VR.4R1 — Client hook for live design asset bindings.
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api.js';
import { PROJECTS_HEADER_PLANET_SLOT_ID } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr4r1/browserClient.js';

export type DesignAssetBindingView = {
  slotId: string;
  currentAssetUrl: string | null;
  currentVersion: number;
  previousAssetUrl: string | null;
  updatedAt: string | null;
};

export function useDesignAssetBinding(slotId: string = PROJECTS_HEADER_PLANET_SLOT_ID): {
  binding: DesignAssetBindingView | null;
  loading: boolean;
  refresh: () => void;
} {
  const [binding, setBinding] = useState<DesignAssetBindingView | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/site00/design-asset-reconstruction?action=bindings&slotId=${encodeURIComponent(slotId)}`);
      if (!res.ok) {
        setBinding(null);
        return;
      }
      const data = (await res.json()) as { ok: boolean; slot?: DesignAssetBindingView };
      setBinding(data.slot ?? null);
    } catch {
      setBinding(null);
    } finally {
      setLoading(false);
    }
  }, [slotId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { binding, loading, refresh };
}
