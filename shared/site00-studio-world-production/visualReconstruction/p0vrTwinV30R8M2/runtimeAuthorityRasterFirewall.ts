export type RuntimeImageSourceCategory =
  | 'CANONICAL_PROJECT_ASSET'
  | 'APPROVED_GENERATED_ASSET'
  | 'APP_ASSET'
  | 'SVG_ICON'
  | 'PROJECT_ARTIFACT'
  | 'ACTUAL_AUTHORITY_RENDER'
  | 'BLUEPRINT_AUTHORITY_RENDER'
  | 'REFERENCE_AUTHORITY_RENDER'
  | 'AUTHORITY_CROP'
  | 'SCREENSHOT_FRAGMENT'
  | 'UNKNOWN';

const FORBIDDEN: RuntimeImageSourceCategory[] = [
  'ACTUAL_AUTHORITY_RENDER',
  'BLUEPRINT_AUTHORITY_RENDER',
  'REFERENCE_AUTHORITY_RENDER',
  'AUTHORITY_CROP',
  'SCREENSHOT_FRAGMENT',
];

export const AUTHORITY_RASTER_REGION_RUNTIME_VIOLATION = 'AUTHORITY_RASTER_REGION_RUNTIME_VIOLATION' as const;

export function classifyRuntimeImageSource(uri: string | null | undefined): RuntimeImageSourceCategory {
  if (!uri) return 'UNKNOWN';
  const u = uri.toLowerCase();
  if (u.includes('fal.media') || u.includes('vitest-fal://')) return 'APPROVED_GENERATED_ASSET';
  if (u.includes('ndxbook-mobile-authority') || u.includes('ndxbook-mobile-light-technical')) {
    return 'ACTUAL_AUTHORITY_RENDER';
  }
  if (u.includes('ndxbook-mobile-forensic-blueprint')) return 'BLUEPRINT_AUTHORITY_RENDER';
  if (u.includes('authority.jpg') || u.includes('authority.png')) return 'REFERENCE_AUTHORITY_RENDER';
  if (u.includes('screenshot') || u.includes('crop=')) return 'SCREENSHOT_FRAGMENT';
  if (u.endsWith('.svg') || u.includes('/icons/')) return 'SVG_ICON';
  if (u.includes('/assets/ndxbook') || u.includes('/visual-references/founder/ndxbook')) {
    return 'CANONICAL_PROJECT_ASSET';
  }
  if (u.includes('/site00/skins/') || u.includes('/public/site00/')) return 'CANONICAL_PROJECT_ASSET';
  if (u.startsWith('/assets/')) return 'APP_ASSET';
  return 'PROJECT_ARTIFACT';
}

export function isForbiddenRuntimeImageSource(category: RuntimeImageSourceCategory): boolean {
  return FORBIDDEN.includes(category);
}

/** Validates runtime img / background sources — authority renders are QA-only. */
export function assertRuntimeImageSourceAllowed(uri: string | null | undefined): RuntimeImageSourceCategory {
  const category = classifyRuntimeImageSource(uri);
  if (isForbiddenRuntimeImageSource(category)) {
    throw new Error(`${AUTHORITY_RASTER_REGION_RUNTIME_VIOLATION}:${category}:${uri ?? ''}`);
  }
  return category;
}

export function scanDocumentForAuthorityRasterViolations(uris: (string | null | undefined)[]): string[] {
  const violations: string[] = [];
  for (const uri of uris) {
    if (!uri) continue;
    const cat = classifyRuntimeImageSource(uri);
    if (isForbiddenRuntimeImageSource(cat)) violations.push(`${cat}:${uri}`);
  }
  return violations;
}
