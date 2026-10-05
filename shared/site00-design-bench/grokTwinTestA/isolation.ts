import type { GrokDesignBenchIsolationContract } from './types.js';
import { GROK_TWIN_TEST_A_FORBIDDEN_IMPORT_FRAGMENTS, GROK_TWIN_TEST_A_FORBIDDEN_STORAGE_PREFIXES } from './constants.js';

export const GROK_TWIN_TEST_A_ISOLATION_CONTRACT: GrokDesignBenchIsolationContract = {
  inheritsTwinV3: false,
  inheritsTwinV4: false,
  inheritsTestB: false,
  inheritsSolOutput: false,
  composerInvoked: false,
  alternateProviderFallback: false,
};

export function assertGrokTwinTestASourceIsolation(source: string): string[] {
  return GROK_TWIN_TEST_A_FORBIDDEN_IMPORT_FRAGMENTS.filter((frag) => source.includes(frag));
}

export function isForbiddenTwinTestAStorageKey(key: string): boolean {
  return GROK_TWIN_TEST_A_FORBIDDEN_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix));
}
