/** R7MF2 — explicit reference vs implementation render roles (provider contract). */

export const MOBILE_DESIGN_REFERENCE_AUTHORITY_ROLE = 'DESIGN_REFERENCE_AUTHORITY' as const;
export const MOBILE_IMPLEMENTATION_RENDER_ROLE = 'MOBILE_IMPLEMENTATION_RENDER' as const;

export const REFERENCE_IMAGE_PROVIDER_LABEL =
  'ATTACHED_IMAGE_ROLE=DESIGN_REFERENCE_AUTHORITY — composition/spatial/hierarchy/atmosphere guidance ONLY. NOT a screenshot to recreate.' as const;

export const REFERENCE_MUST_NOT_BE = [
  'literal final runtime screenshot',
  'image to recreate pixel-for-pixel',
  'final content authority',
  'direct full-page clone target',
] as const;

export const REFERENCE_MUST_BE = [
  'composition authority',
  'spatial and hierarchy authority',
  'design direction and atmosphere authority',
  'layout/hierarchy guideline',
  'interaction grouping reference',
] as const;

export const IMPLEMENTATION_RENDER_MUST = [
  'resolve the page as the actual mobile DESIGN workspace product surface',
  'preserve chosen composition direction without verbatim restaging',
  'reflect feature manifest and project truth in page structure',
  'show implementation-ready page state (active/review/selected/stage semantics)',
] as const;

export const ANTI_CLONE_PROHIBITIONS = [
  'DO NOT replicate the reference image verbatim',
  'DO NOT redraw or restage the same exact placeholder visual as the final page',
  'DO NOT treat the source image as the final page itself',
  'DO NOT copy fake metrics/placeholder boards without resolution',
] as const;

export const PRESERVE_VS_EVOLVE_BLOCK = `
PRESERVE: overall mobile layout system, dominant creative surface, SITE 00 host shell, NDXBOOK atmosphere,
authority-pair workflow, candidate gallery, structured output/readiness placement, action hierarchy.
EVOLVE/RESOLVE: page-level implementation state, feature-manifest completeness, placeholder-to-page resolution,
canonical control semantics, implementation-ready detail, believable product finish.
SIMILARITY ALONE IS NOT SUCCESS — TRANSLATION IS REQUIRED.
`.trim();
