/**
 * P0.VR.GPT2-MOBILE-FUNCTIONAL-REFERENCE-ONLY-AND-FULL-PAGE-CAPTURE-FIX1
 */

export const GPT2_MOBILE_FUNCTIONAL_REFERENCE_CONTRACT_VERSION = 'gpt2-mobile-functional-reference-v1';

export const GPT2_MOBILE_MANIFEST_CAPTURE_PACKAGE_V1 = 'GPT2_FUNCTIONAL_REFERENCE_PACKAGE_V1' as const;

export type Gpt2MobileSourceAuthorityManifest = {
  capturePackageVersion: typeof GPT2_MOBILE_MANIFEST_CAPTURE_PACKAGE_V1;
  screenshotAuthorityMode: 'FUNCTIONAL_REFERENCE_ONLY';
  designAuthoritySource: 'CGPT_PLUS_PAGE_ARCHITECTURE_BRIEF';
  topStructuralAttached: boolean;
  middleStructuralAttached: boolean;
  bottomStructuralAttached: boolean;
  topAssetId: string | null;
  middleAssetId: string | null;
  bottomAssetId: string | null;
  stitchedFallbackUsed: boolean;
  stitchedAssetId: string | null;
  bottomContinuityLockActive: boolean;
  /** @deprecated v1 package does not attach full-page source to provider */
  fullPageSourceAttached: boolean;
  /** @deprecated */
  bottomHalfSourceAttached: boolean;
  /** @deprecated */
  bottomNavAuthorityAttached: boolean;
  /** @deprecated */
  fullPageAssetId: string | null;
  /** @deprecated */
  bottomHalfAssetId: string | null;
  /** @deprecated */
  bottomNavAssetId: string | null;
};

export function buildGpt2MobileFunctionalReferenceOnlyBlock(): string {
  return [
    'SCREENSHOT / STRUCTURAL CAPTURE USAGE (FUNCTIONAL_REFERENCE_ONLY):',
    'Structural Captures A/B/C show current page function and structure only — NOT visual design references.',
    'Use captures to understand: layout logic, page anatomy, section order, navigation placement, bottom continuity, interaction presence.',
    'Do NOT imitate capture styling, composition, colors, typography treatment, or exact visual treatment.',
    'SCREENSHOT_DESIGN_AUTHORITY: FORBIDDEN.',
  ].join('\n');
}

export function buildGpt2MobileDesignAuthoritySourceBlock(): string {
  return [
    'DESIGN AUTHORITY SOURCE:',
    'CGPT creative synthesis + page architecture brief + navigation contract + bottom continuity contract + SITE 00 system language.',
    'Redesign appearance from design authority — preserve function from structural captures.',
  ].join('\n');
}

export function buildGpt2MobileMobilePageFunctionAuthorityBlock(): string {
  return [
    'MOBILE PAGE FUNCTION (PRESERVE — DO NOT INVENT):',
    'Structural captures define NDXBOOK Overview page purpose, section logic, information architecture, and interaction intent.',
    'Keep the function; change the design.',
  ].join('\n');
}

export function buildGpt2MobileBottomContinuityAuthorityBlock(): string {
  return [
    'BOTTOM CONTINUITY (STRUCTURAL CAPTURE C):',
    'Structural Capture C includes the true bottom of the page — lower continuation, final content, and real bottom navigation / panel.',
    'Do not invent a new bottom nav system when Capture C shows the real pattern.',
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
    'Match bottom panel / navigation pattern from Structural Capture C — same destination count, order, roles; uppercase labels; visual restyle only.',
  ].join('\n');
}

export function buildGpt2MobileFullPageOutputRequirementBlock(): string {
  return [
    'FULL-PAGE OUTPUT REQUIREMENT:',
    'Generate one full portrait mobile product screen — not a poster, not a top-half graphic, not a cropped promo.',
    'Output must communicate lower-page continuity and bottom navigation context (from structural captures + architecture), not a floating hero plate.',
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
    '6) TRUE BOTTOM NAV / PANEL SYSTEM (from Capture C — no invention)',
  ].join('\n');
}

export function buildGpt2MobileContinuityLockDebugLines(manifest: Gpt2MobileSourceAuthorityManifest): string[] {
  return [
    `FUNCTIONAL REFERENCE CONTRACT: ${GPT2_MOBILE_FUNCTIONAL_REFERENCE_CONTRACT_VERSION}`,
    `CAPTURE PACKAGE: ${manifest.capturePackageVersion}`,
    `TOP STRUCTURAL ATTACHED: ${manifest.topStructuralAttached ? 'YES' : 'NO'} · ${manifest.topAssetId ?? '—'}`,
    `MIDDLE STRUCTURAL ATTACHED: ${manifest.middleStructuralAttached ? 'YES' : 'NO'} · ${manifest.middleAssetId ?? '—'}`,
    `BOTTOM STRUCTURAL ATTACHED: ${manifest.bottomStructuralAttached ? 'YES' : 'NO'} · ${manifest.bottomAssetId ?? '—'}`,
    `STITCHED FALLBACK USED: ${manifest.stitchedFallbackUsed ? 'YES' : 'NO'} · ${manifest.stitchedAssetId ?? '—'}`,
    `SCREENSHOT AUTHORITY MODE: ${manifest.screenshotAuthorityMode}`,
    `DESIGN AUTHORITY SOURCE: ${manifest.designAuthoritySource}`,
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
  if (!lower.includes('structural capture c') && !lower.includes('capture c')) {
    failedChecks.push('bottom_structural_capture_missing');
  }
  if (!lower.includes('functional_reference_only') && !lower.includes('functional reference only')) {
    failedChecks.push('functional_reference_only_missing');
  }
  if (!lower.includes('do not imitate') && !lower.includes('do not imitate capture')) {
    failedChecks.push('anti_mimicry_missing');
  }
  if (!lower.includes('do not invent a new mobile tab bar')) failedChecks.push('nav_invention_guard_missing');
  if (!lower.includes('screenshot_design_authority: forbidden')) {
    failedChecks.push('screenshot_design_authority_guard_missing');
  }
  return { ok: failedChecks.length === 0, failedChecks };
}
