import { TWIN_V41_STORAGE_PREFIX } from '../p0vrTwinV41/constants.js';
import { TWIN_V4_STORAGE_PREFIX } from '../p0vrTwinV40/constants.js';
import { TWIN_V42_GATE_BUNDLE_KEY } from './constants.js';
import type { TwinV4AuthorityPurgeReceipt, TwinV4GoldenAuthority } from './twinV42Types.js';

export function purgeStaleTwinV4AuthorityReferences(active: TwinV4GoldenAuthority): TwinV4AuthorityPurgeReceipt {
  const staleIdsRemoved: string[] = [];
  const staleHashesRemoved: string[] = [];

  if (typeof localStorage === 'undefined') {
    return {
      staleIdsRemoved,
      staleHashesRemoved,
      activeId: active.artifactId,
      activeHash: active.sha256,
    };
  }

  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    const isV41 = key.startsWith(TWIN_V41_STORAGE_PREFIX);
    const isV40 = key.startsWith(TWIN_V4_STORAGE_PREFIX);
    if (!isV41 && !isV40) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as {
        authorityLock?: { forensicBlueprintArtifactId?: string; forensicBlueprintHash?: string };
      };
      const id = parsed.authorityLock?.forensicBlueprintArtifactId;
      const hash = parsed.authorityLock?.forensicBlueprintHash;
      if (id && id !== active.artifactId) {
        staleIdsRemoved.push(id);
        localStorage.removeItem(key);
      } else if (hash && hash !== active.sha256 && hash.length < 64) {
        staleHashesRemoved.push(hash);
      }
    } catch {
      /* skip */
    }
  }

  const gateRaw = localStorage.getItem(TWIN_V42_GATE_BUNDLE_KEY);
  if (gateRaw) {
    try {
      const gate = JSON.parse(gateRaw) as { goldenAuthority?: { sha256?: string } };
      if (gate.goldenAuthority?.sha256 && gate.goldenAuthority.sha256 !== active.sha256) {
        localStorage.removeItem(TWIN_V42_GATE_BUNDLE_KEY);
        staleHashesRemoved.push(gate.goldenAuthority.sha256);
      }
    } catch {
      localStorage.removeItem(TWIN_V42_GATE_BUNDLE_KEY);
    }
  }

  return {
    staleIdsRemoved: [...new Set(staleIdsRemoved)],
    staleHashesRemoved: [...new Set(staleHashesRemoved)],
    activeId: active.artifactId,
    activeHash: active.sha256,
  };
}
