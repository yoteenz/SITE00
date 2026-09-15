import type { ForensicUiBlueprintAuthority } from './forensicTypes.js';
import { FORENSIC_BLUEPRINT_FAL_ENDPOINT, FORENSIC_BLUEPRINT_PROMPT_VERSION } from './constants.js';

const cache = new Map<string, ForensicUiBlueprintAuthority>();

export function forensicBlueprintCacheKey(input: {
  actualHash: string;
  promptVersion?: string;
  falEndpoint?: string;
}): string {
  return `${input.actualHash}|${input.promptVersion ?? FORENSIC_BLUEPRINT_PROMPT_VERSION}|${input.falEndpoint ?? FORENSIC_BLUEPRINT_FAL_ENDPOINT}`;
}

export function readForensicBlueprintFromCache(key: string): ForensicUiBlueprintAuthority | null {
  return cache.get(key) ?? null;
}

export function writeForensicBlueprintToCache(key: string, authority: ForensicUiBlueprintAuthority): void {
  cache.set(key, authority);
}

export function clearForensicBlueprintCacheForTests(): void {
  cache.clear();
}
