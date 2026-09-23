/**
 * P0.VR.GPT2-MOBILE-FULL-PAGE-CONTINUITY-AND-BOTTOM-NAV-LOCK1
 */

export const GPT2_MOBILE_FULL_PAGE_CONTINUITY_CONTRACT_VERSION = 'gpt2-mobile-full-page-continuity-v1';

export type Gpt2MobileSourceAuthorityManifest = {
  fullPageSourceAttached: boolean;
  bottomHalfSourceAttached: boolean;
  bottomNavAuthorityAttached: boolean;
  stitchedFallbackUsed: boolean;
  bottomContinuityLockActive: boolean;
  fullPageAssetId: string | null;
  bottomHalfAssetId: string | null;
  bottomNavAssetId: string | null;
  stitchedAssetId: string | null;
};

export function buildGpt2MobileMobilePageFunctionAuthorityBlock(): string {
  return [
    'MOBILE PAGE FUNCTION AUTHORITY:',
    'Image A (full-page source) is the structural + functional authority for the entire NDXBOOK Overview mobile screen.',
    'Preserve page purpose, section logic, information architecture, and interaction intent from the capture.',
  ].join('\n');
}

export function buildGpt2MobileBottomContinuityAuthorityBlock(): string {
  return [
    'BOTTOM CONTINUITY AUTHORITY:',
    'Image B (lower-half source) + Image C (bottom-nav crop) are mandatory continuity authorities.',
    'They define the real lower-page context and the true bottom panel / navigation system.',
    'Do not treat the page as ending at the hero — lower sections and bottom nav are part of the same product page.',
  ].join('\n');
}

export function buildGpt2MobileConceptualFreedomBoundaryBlock(): string {
  return [
    'CONCEPTUAL FREEDOM BOUNDARY:',
    'MAY redesign: layout treatment, spacing, hierarchy, typography scale, composition, materials, containers, rhythm, light/dark balance.',
    'MAY NOT redesign: page function, page identity, real section structure, bottom navigation pattern, app-shell continuity, information architecture.',
  ].join('\n');
}

export function buildGpt2MobileBottomNavLockBlock(): string {
  return [
    'BOTTOM NAV LOCK (INVALID IF VIOLATED):',
    'Do not invent a new mobile tab bar, footer, substitute bottom chips, or alternate app navigation.',
    'Match the bottom panel / navigation pattern from source Images A+B+C — same destination count, order, roles; uppercase labels; visual restyle only.',
  ].join('\n');
}

export function buildGpt2MobileFullPageOutputRequirementBlock(): string {
  return [
    'FULL-PAGE OUTPUT REQUIREMENT:',
    'Generate one full portrait mobile product screen — not a poster, not a top-half graphic, not a cropped promo.',
    'Output must communicate lower-page continuity and bottom navigation context (inherited from source), not a floating hero plate.',
  ].join('\n');
}

export function buildGpt2MobileLowerPageRegionMapBlock(): string {
  return [
    'AUTHORITATIVE REGION MAP (STRUCTURE LOCKED — STYLE FLEXIBLE):',
    '1) TOP CHROME / HOST BAR',
    '2) PAGE HEADER / IDENTITY',
    '3) OVERVIEW HERO / STATUS SUMMARY',
    '4) ENTRY INDEX / CORE CONTENT REGION',
    '5) LOWER CONTINUITY REGION (mid-page modules leading to shell handoff)',
    '6) TRUE BOTTOM NAV / PANEL SYSTEM (source-locked — no invention)',
  ].join('\n');
}

export function buildGpt2MobileContinuityLockDebugLines(manifest: Gpt2MobileSourceAuthorityManifest): string[] {
  return [
    `FULL PAGE CONTINUITY CONTRACT: ${GPT2_MOBILE_FULL_PAGE_CONTINUITY_CONTRACT_VERSION}`,
    `FULL PAGE SOURCE ATTACHED: ${manifest.fullPageSourceAttached ? 'YES' : 'NO'} · ${manifest.fullPageAssetId ?? '—'}`,
    `BOTTOM HALF SOURCE ATTACHED: ${manifest.bottomHalfSourceAttached ? 'YES' : 'NO'} · ${manifest.bottomHalfAssetId ?? '—'}`,
    `BOTTOM NAV AUTHORITY ATTACHED: ${manifest.bottomNavAuthorityAttached ? 'YES' : 'NO'} · ${manifest.bottomNavAssetId ?? '—'}`,
    `STITCHED FALLBACK USED: ${manifest.stitchedFallbackUsed ? 'YES' : 'NO'} · ${manifest.stitchedAssetId ?? '—'}`,
    `BOTTOM CONTINUITY LOCK: ${manifest.bottomContinuityLockActive ? 'ACTIVE' : 'OFF'}`,
  ];
}

export function evaluateGpt2MobileBottomNavContinuityHandoffValidity(prompt: string): {
  ok: boolean;
  failedChecks: string[];
} {
  const failedChecks: string[] = [];
  const lower = prompt.toLowerCase();
  if (!lower.includes('bottom nav lock')) failedChecks.push('bottom_nav_lock_missing');
  if (!lower.includes('full-page output')) failedChecks.push('full_page_output_missing');
  if (!lower.includes('bottom half') && !lower.includes('lower-half') && !lower.includes('lower 50%')) {
    failedChecks.push('bottom_half_authority_missing');
  }
  if (!lower.includes('bottom_nav_authority_crop') && !lower.includes('bottom nav authority')) {
    failedChecks.push('bottom_nav_authority_missing');
  }
  if (!lower.includes('do not invent a new mobile tab bar')) failedChecks.push('nav_invention_guard_missing');
  if (!lower.includes('true bottom nav')) failedChecks.push('region_map_bottom_nav_missing');
  return { ok: failedChecks.length === 0, failedChecks };
}
