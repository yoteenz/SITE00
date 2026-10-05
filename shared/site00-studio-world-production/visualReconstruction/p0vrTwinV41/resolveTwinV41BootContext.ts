import {
  findCachedForensicBlueprintForTwinV41Boot,
  forensicBlueprintCacheKey,
  readForensicBlueprintFromCache,
} from '../p0vrTwinV30R8M2R5/forensicBlueprintCache.js';
import type { ForensicUiBlueprintAuthority } from '../p0vrTwinV30R8M2R5/forensicTypes.js';

/** Resolve actualHash + authority for V4 route boot (browser-friendly). */
export function resolveTwinV41BootContext(input: {
  projectId: string;
  queryActualHash: string | null;
}): { sourceActualHash: string; authority: ForensicUiBlueprintAuthority | null } {
  if (input.queryActualHash) {
    const key = forensicBlueprintCacheKey({ actualHash: input.queryActualHash });
    const authority = readForensicBlueprintFromCache(key);
    return { sourceActualHash: input.queryActualHash, authority };
  }

  const cached = findCachedForensicBlueprintForTwinV41Boot(input.projectId);
  if (cached) {
    return { sourceActualHash: cached.sourceActualHash, authority: cached };
  }

  return { sourceActualHash: '', authority: null };
}
