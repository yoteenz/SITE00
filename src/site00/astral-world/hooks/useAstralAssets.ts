import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { ReferenceCropKey } from '../../../../shared/site00-astral-world/referenceCropRegistry.js';
import {
  resolveAstralAssetForCrop,
  resolvePortraitAsset,
  type AstralAssetStoreSnapshot,
} from '../../../../shared/site00-astral-world/generation/assetResolver.js';
import type { AstralAssetSlotKey } from '../../../../shared/site00-astral-world/generation/assetSlotRegistry.js';
import { slotKeyFromCrop, portraitSlotFromPersonId } from '../../../../shared/site00-astral-world/generation/assetSlotRegistry.js';
import { cropToBackgroundStyle, getReferenceCrop } from '../../../../shared/site00-astral-world/referenceCropRegistry.js';

type ClientAssetMap = Record<string, { url: string; source: string }>;

let cachedAssets: ClientAssetMap | null = null;
let fetchPromise: Promise<ClientAssetMap> | null = null;

async function fetchClientAssets(): Promise<ClientAssetMap> {
  if (cachedAssets) return cachedAssets;
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch('/api/site00/astral-world-assets')
    .then((r) => (r.ok ? r.json() : { assets: {} }))
    .then((data: { assets?: ClientAssetMap }) => {
      cachedAssets = data.assets ?? {};
      return cachedAssets;
    })
    .catch(() => ({}));
  return fetchPromise;
}

export function invalidateAstralAssetCache(): void {
  cachedAssets = null;
  fetchPromise = null;
}

function storeFromClientMap(map: ClientAssetMap): AstralAssetStoreSnapshot {
  const store: AstralAssetStoreSnapshot = {};
  const now = new Date().toISOString();
  for (const [slotKey, entry] of Object.entries(map)) {
    store[slotKey] = {
      assetContractId: `${slotKey}@v1`,
      targetSlot: slotKey,
      status: entry.source === 'ACTIVE' ? 'ACTIVE' : 'READY',
      version: 1,
      approvalState: 'READY_FOR_VISUAL_REVIEW',
      canonState: 'FOUNDER_FAST_TRACK',
      outputUrl: entry.url,
      storagePath: null,
      provider: null,
      model: null,
      requestId: null,
      generationReceipt: null,
      referenceCropKey: null,
      error: null,
      createdAt: now,
      updatedAt: now,
      supersededByVersion: null,
    };
  }
  return store;
}

export function useAstralAssets() {
  const [assets, setAssets] = useState<ClientAssetMap>(cachedAssets ?? {});
  const [loaded, setLoaded] = useState(Boolean(cachedAssets));

  const refresh = useCallback(async () => {
    invalidateAstralAssetCache();
    const next = await fetchClientAssets();
    setAssets(next);
    setLoaded(true);
    return next;
  }, []);

  useEffect(() => {
    if (cachedAssets) {
      setAssets(cachedAssets);
      setLoaded(true);
      return;
    }
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const store = useMemo(() => storeFromClientMap(assets), [assets]);

  return { assets, store, loaded, refresh };
}

export function useAstralSceneBackground(
  crop: ReferenceCropKey,
  store: AstralAssetStoreSnapshot,
  overlay = true,
): CSSProperties {
  return useMemo(() => {
    const resolved = resolveAstralAssetForCrop(crop, store, '');
    if (resolved.source === 'ACTIVE' || resolved.source === 'READY') {
      const gradient = overlay
        ? 'linear-gradient(180deg, rgba(6,8,15,0.05) 0%, rgba(6,8,15,0.55) 55%, rgba(6,8,15,0.92) 100%), '
        : '';
      return {
        backgroundImage: `${gradient}url(${resolved.url})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat' as const,
      };
    }
    const spec = getReferenceCrop(crop);
    return cropToBackgroundStyle(spec, overlay);
  }, [crop, store, overlay]);
}

export function useAstralPortraitBackground(
  personId: string,
  store: AstralAssetStoreSnapshot,
): { url: string | null; style: CSSProperties | null } {
  return useMemo(() => {
    const resolved = resolvePortraitAsset(personId, store, '');
    if (resolved.source === 'ACTIVE' || resolved.source === 'READY') {
      return {
        url: resolved.url,
        style: {
          backgroundImage: `url(${resolved.url})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat' as const,
        },
      };
    }
    return { url: null, style: null };
  }, [personId, store]);
}

export function slotKeyForCrop(crop: ReferenceCropKey): AstralAssetSlotKey | null {
  return slotKeyFromCrop(crop);
}

export function slotKeyForPerson(personId: string): AstralAssetSlotKey {
  return portraitSlotFromPersonId(personId);
}
