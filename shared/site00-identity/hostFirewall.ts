/**
 * Host vs client identity firewall — SITE 00 host traits must not become client canon.
 */

export const SITE00_HOST_TRAIT_MARKERS = [
  'martian mono',
  'site 00 red',
  'site00 red',
  'site 00 shell',
  'host typography',
  'host ui',
  'site00 host',
  'ndxbook lime',
  'historical lime',
  'cream paper substrate',
  'correction marks chrome',
] as const;

const NEGATION_PREFIXES = ['not ', 'avoid ', 'exclude ', 'without ', 'never ', 'no '] as const;

function isNegatedContext(text: string, markerIndex: number): boolean {
  const windowStart = Math.max(0, markerIndex - 24);
  const prefix = text.slice(windowStart, markerIndex).toLowerCase();
  return NEGATION_PREFIXES.some((p) => prefix.endsWith(p));
}

export function containsHostIdentityLeak(text: string): boolean {
  const lower = text.toLowerCase();
  for (const marker of SITE00_HOST_TRAIT_MARKERS) {
    let searchFrom = 0;
    while (searchFrom < lower.length) {
      const idx = lower.indexOf(marker, searchFrom);
      if (idx === -1) break;
      if (!isNegatedContext(lower, idx)) return true;
      searchFrom = idx + marker.length;
    }
  }
  return false;
}

export function assertNoHostIdentityInClientCanon(content: Record<string, unknown>): boolean {
  const serialized = JSON.stringify(content).toLowerCase();
  return !containsHostIdentityLeak(serialized);
}

export function filterHostTraitsFromExploration(text: string): string {
  let result = text;
  for (const marker of SITE00_HOST_TRAIT_MARKERS) {
    if (result.toLowerCase().includes(marker)) {
      result = result.replace(new RegExp(marker, 'gi'), '[HOST_TRAIT_BLOCKED]');
    }
  }
  return result;
}
