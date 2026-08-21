/**
 * SITE 00 — Intake Access Email Family — FAL-native visual production manifest.
 *
 * PILOT of a reusable "reference → production asset" methodology (see
 * docs/site00/REFERENCE_TO_PRODUCTION_ASSET_PIPELINE.md). This file is the machine-readable
 * decomposition of the founder-approved concept board for:
 *   - BUILDER INTAKE ACCESS  (desktop + mobile)
 *   - IDENTITY INTAKE ACCESS (desktop + mobile)
 *
 * Every visual element is classified before generation:
 *   CODE_NATIVE       — rules, frames, typography, buttons, progress UI, metadata (HTML/CSS only)
 *   GENERATED_ASSET    — architecture, photography, paper, fingerprints, seals, collage material
 *   EXISTING_ASSET     — a canonical asset already in the repo, reused as-is
 *   HYBRID_COMPOSITION — a generated asset deterministically composited with a canonical/code asset
 *
 * Fidelity mode for every asset in this manifest is EXACT / RECONSTRUCTION — FAL is reproducing
 * the founder-approved reference's category, composition, lighting, material, crop and tonality,
 * not inventing new creative direction.
 *
 * Do not treat this manifest as a place to add prompts for something better represented as
 * semantic HTML — CODE_NATIVE elements are documented here for completeness of the decomposition
 * but are NOT generation targets.
 */

export type ProductionAssetClassification = 'CODE_NATIVE' | 'GENERATED_ASSET' | 'EXISTING_ASSET' | 'HYBRID_COMPOSITION';

export type ProductionFidelityMode = 'EXACT_RECONSTRUCTION' | 'DIRECTED_VARIATION' | 'NET_NEW_GENERATION';

export type ProductionGenerationMethod =
  | 'FAL_TEXT_TO_IMAGE'
  | 'FAL_REFERENCE_CONDITIONED'
  | 'DETERMINISTIC_COMPOSITE'
  | 'NONE_CODE_ONLY';

export type ProductionApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_APPLICABLE';

export type ProductionAssetEntry = {
  assetId: string;
  emailFamily: 'BUILDER_INTAKE_ACCESS' | 'IDENTITY_INTAKE_ACCESS';
  visualRole: string;
  referenceRegion: string;
  classification: ProductionAssetClassification;
  fidelityLevel: ProductionFidelityMode;
  generationMethod: ProductionGenerationMethod;
  aspectRatio: string;
  backgroundRequirement: 'TRANSPARENT' | 'WHITE_DISAPPEARS_INTO_CANVAS' | 'NOT_APPLICABLE';
  alphaRequirement: boolean;
  desktopUsage: string;
  mobileUsage: string;
  prompt: string | null;
  negativeConstraints: string[];
  outputFilename: {
    master: string | null;
    desktop: string | null;
    mobile: string | null;
  };
  generationResult: 'GENERATED' | 'COMPOSITED' | 'NOT_GENERATED_CODE_NATIVE';
  inspectionResult: string;
  approvalStatus: ProductionApprovalStatus;
  falModel?: string;
  falRequestId?: string;
  generatedAtIso?: string;
  sourceMasterPath?: string;
  derivedPaths?: { desktop?: string; mobile?: string };
};

const NO_TEXT_LOGO_UI_CONSTRAINTS = [
  'no readable text',
  'no logos',
  'no UI elements',
  'no watermark',
  'no borders/frames (added in code)',
  'no emoji',
  'no generic stock icon aesthetic',
];

export const INTAKE_ACCESS_PRODUCTION_MANIFEST: ProductionAssetEntry[] = [
  // ---------------------------------------------------------------------
  // BUILDER — B01 — Architectural Build Blueprint
  // ---------------------------------------------------------------------
  {
    assetId: 'S00-EMAIL-INTAKE-BLD-B01',
    emailFamily: 'BUILDER_INTAKE_ACCESS',
    visualRole: 'Primary Builder hero artwork — architectural line drawing',
    referenceRegion:
      'Large architectural line drawing occupying the lower-right of the desktop Builder hero and the upper background of the mobile Builder composition.',
    classification: 'GENERATED_ASSET',
    fidelityLevel: 'EXACT_RECONSTRUCTION',
    generationMethod: 'FAL_TEXT_TO_IMAGE',
    aspectRatio: '4:3',
    backgroundRequirement: 'WHITE_DISAPPEARS_INTO_CANVAS',
    alphaRequirement: false,
    desktopUsage: 'Behind/below the Build Brief Record card, right hero column, restrained scale, generous white space.',
    mobileUsage: 'Restrained upper-background wash behind the BUILDER INTAKE ACCESS label and headline.',
    prompt:
      "Create a premium architectural concept drawing for a luxury digital build brief. A refined contemporary two-story modern structure shown in precise three-quarter architectural perspective. Extremely fine graphite-gray and pale cool-blue construction lines on a clean white background. The structure should feel like a sophisticated architect's presentation drawing: glass curtain walls, clean rectilinear volumes, cantilevered planes, structural grid, subtle foundation lines, perspective guides and extremely restrained drafting marks. Layer faint secondary construction sketches behind and around the primary building, including barely visible elevation fragments, measurement guides and architectural planning lines. The primary building remains concentrated toward the lower-right area with generous white negative space around it. Very light, technical, elegant, editorial and expensive. No photorealistic environment, no sky, no landscaping, no people, no vehicles, no furniture.",
    negativeConstraints: [
      'no photorealistic environment',
      'no sky',
      'no landscaping',
      'no people',
      'no vehicles',
      'no furniture',
      'no generic house icon',
      'no thick CAD lines',
      'no heavy blue blueprint background',
      'no saturated colors',
      ...NO_TEXT_LOGO_UI_CONSTRAINTS,
    ],
    outputFilename: {
      master: 'site00-email-intake-builder-blueprint-master.png',
      desktop: 'site00-email-intake-builder-blueprint-desktop.png',
      mobile: 'site00-email-intake-builder-blueprint-mobile.png',
    },
    generationResult: 'GENERATED',
    inspectionResult:
      'Reviewed at full resolution via direct visual inspection. Fine graphite/pale-blue drafting lines, three-quarter architectural perspective, restrained density, generous negative space, no readable text or hallucinated logos, no photorealistic rendering. Reads as an architect presentation drawing, not a stock house render.',
    approvalStatus: 'APPROVED',
  },

  // ---------------------------------------------------------------------
  // IDENTITY — I01 — Identity Portrait Fragment
  // ---------------------------------------------------------------------
  {
    assetId: 'S00-EMAIL-INTAKE-ID-I01',
    emailFamily: 'IDENTITY_INTAKE_ACCESS',
    visualRole: 'Primary human editorial image — anonymous portrait fragment',
    referenceRegion: 'Cropped monochrome face fragment beneath the archival paper, lower-right of the Identity hero.',
    classification: 'GENERATED_ASSET',
    fidelityLevel: 'EXACT_RECONSTRUCTION',
    generationMethod: 'FAL_TEXT_TO_IMAGE',
    aspectRatio: '4:5',
    backgroundRequirement: 'NOT_APPLICABLE',
    alphaRequirement: false,
    desktopUsage: 'Base layer of the I05 desktop evidence collage — occupies lower-right of the Identity File card region.',
    mobileUsage: 'Base layer of the I05 mobile evidence strip.',
    prompt:
      'Create a tightly cropped black-and-white editorial portrait fragment for a premium creative identity dossier. Show only a partial anonymous adult face, closely framed, with emphasis on one eye, cheek texture, nose and partial lips. Natural skin texture, visible pores, editorial realism, quiet expression, no smile. High-resolution monochrome photography with soft directional light and restrained contrast. The portrait must feel like a fragment of visual evidence rather than a traditional headshot — cropped, intimate, partially obscured by surrounding dossier materials.',
    negativeConstraints: [
      'no glamour retouching',
      'no beauty campaign styling',
      'no jewelry',
      'no dramatic fashion makeup',
      'no police mugshot aesthetic',
      'no crime-scene aesthetic',
      ...NO_TEXT_LOGO_UI_CONSTRAINTS,
    ],
    outputFilename: {
      master: 'site00-email-intake-identity-portrait-master-v2.png',
      desktop: null,
      mobile: null,
    },
    generationResult: 'GENERATED',
    inspectionResult:
      'v1 REJECTED — composed a photorealistic manila folder, clipboard and wooden desk around the portrait; too much extraneous prop context for a compositable evidence fragment. v2 APPROVED — refined prompt to explicitly exclude props/desk/surface; result is a clean edge-to-edge monochrome face fragment (one eye/cheek/nose emphasis), no smile, no retouching sheen, no crime-scene markers, no readable text.',
    approvalStatus: 'APPROVED',
  },

  // ---------------------------------------------------------------------
  // IDENTITY — I02 — Archival Written Evidence
  // ---------------------------------------------------------------------
  {
    assetId: 'S00-EMAIL-INTAKE-ID-I02',
    emailFamily: 'IDENTITY_INTAKE_ACCESS',
    visualRole: 'Handwritten paper fragment layered above the portrait',
    referenceRegion: 'Archival note overlapping the upper portion of the portrait in the Identity evidence collage.',
    classification: 'GENERATED_ASSET',
    fidelityLevel: 'EXACT_RECONSTRUCTION',
    generationMethod: 'FAL_TEXT_TO_IMAGE',
    aspectRatio: '4:3',
    backgroundRequirement: 'NOT_APPLICABLE',
    alphaRequirement: false,
    desktopUsage: 'Layered above the portrait in the I05 desktop collage.',
    mobileUsage: 'Layered above the portrait fragment in the I05 mobile strip.',
    prompt:
      'Create a small archival handwritten document fragment for a sophisticated creative identity dossier. Warm ivory aged paper with subtle natural fibers, gentle edge wear and imperfect torn or deckled edges. Several lines of elegant but largely illegible handwritten notes in dark graphite/ink suggesting personal observations, without containing important readable language. Very restrained aging, premium editorial prop photography, soft realistic shadow.',
    negativeConstraints: [
      'no dramatic stains',
      'no burned edges',
      'no treasure-map styling',
      'no government seal',
      'no typed headline',
      'no readable personal data',
      ...NO_TEXT_LOGO_UI_CONSTRAINTS,
    ],
    outputFilename: {
      master: 'site00-email-intake-identity-archival-note-v3.png',
      desktop: null,
      mobile: null,
    },
    generationResult: 'GENERATED',
    inspectionResult:
      'v1 APPROVED on its own terms (warm ivory paper, illegible handwriting, deckled edge, no readable text, no seals) but photographed on a wood tabletop, which composited as a hard rectangular "box" behind the paper in the I05 collage. v3 regenerated the same art direction fully isolated on a flat white backdrop so it composites as a clean layered print. Re-approved.',
    approvalStatus: 'APPROVED',
  },

  // ---------------------------------------------------------------------
  // IDENTITY — I03 — Fingerprint Specimen
  // ---------------------------------------------------------------------
  {
    assetId: 'S00-EMAIL-INTAKE-ID-I03',
    emailFamily: 'IDENTITY_INTAKE_ACCESS',
    visualRole: 'Identity evidence detail — fingerprint specimen card',
    referenceRegion: 'Small fingerprint card near the outer-right/lower region of the Identity evidence collage.',
    classification: 'GENERATED_ASSET',
    fidelityLevel: 'EXACT_RECONSTRUCTION',
    generationMethod: 'FAL_TEXT_TO_IMAGE',
    aspectRatio: '1:1',
    backgroundRequirement: 'NOT_APPLICABLE',
    alphaRequirement: false,
    desktopUsage: 'Small fragment layered near the outer edge of the I05 desktop collage.',
    mobileUsage: 'Small fragment layered near the outer edge of the I05 mobile strip.',
    prompt:
      'Create a refined monochrome fingerprint specimen printed on a small warm-white archival paper fragment. Single detailed human fingerprint impression in graphite-black ink with slight analog imperfection and authentic ridge texture. Minimal editorial presentation, designed as an artistic symbol of identity within a premium creative brand dossier.',
    negativeConstraints: [
      'no police evidence labels',
      'no crime-scene markers',
      'no personal name',
      'no numbers resembling real identifying information',
      'no colored background',
      ...NO_TEXT_LOGO_UI_CONSTRAINTS,
    ],
    outputFilename: {
      master: 'site00-email-intake-identity-fingerprint-v3.png',
      desktop: null,
      mobile: null,
    },
    generationResult: 'GENERATED',
    inspectionResult:
      'v1 REJECTED — rendered a readable "IDENTITY" caption plus a linen-textured double mat/frame, violating the no-readable-text constraint. v2 REJECTED — removed the caption but still sat on a visible gray surface that composited as a hard box. v3 APPROVED — isolated on flat white, no text, authentic ridge texture, deckled paper edge.',
    approvalStatus: 'APPROVED',
  },

  // ---------------------------------------------------------------------
  // IDENTITY — I04 — SITE 00 Evidence Seal (HYBRID_COMPOSITION)
  // ---------------------------------------------------------------------
  {
    assetId: 'S00-EMAIL-INTAKE-ID-I04',
    emailFamily: 'IDENTITY_INTAKE_ACCESS',
    visualRole: 'Dimensional red artifact connecting the collage to SITE 00',
    referenceRegion: 'Small red wax-seal artifact near the paper/portrait overlap in the Identity evidence collage.',
    classification: 'HYBRID_COMPOSITION',
    fidelityLevel: 'EXACT_RECONSTRUCTION',
    generationMethod: 'FAL_TEXT_TO_IMAGE',
    aspectRatio: '1:1',
    backgroundRequirement: 'TRANSPARENT',
    alphaRequirement: true,
    desktopUsage: 'Composited near the paper/portrait overlap in the I05 desktop collage.',
    mobileUsage: 'Composited near the paper/portrait overlap in the I05 mobile strip.',
    prompt:
      'Create a small premium circular red wax seal viewed almost straight-on with slight natural dimensional perspective. Deep SITE 00 red wax, subtle glossy highlights, pressed center, realistic irregular wax edge, luxury stationery quality, clean isolated object on a transparent background. No letters, no logo, no symbols, no decorative crest — the canonical SITE 00 mark is applied separately in code.',
    negativeConstraints: ['no letters', 'no logo', 'no symbols', 'no decorative crest', ...NO_TEXT_LOGO_UI_CONSTRAINTS],
    outputFilename: {
      master: 'site00-email-intake-identity-seal-base.png',
      desktop: null,
      mobile: null,
    },
    generationResult: 'GENERATED',
    inspectionResult:
      'Blank red wax seal, glossy highlight, irregular pressed edge, isolated on a transparent background. The canonical "00 / SITE" mark is composited on top deterministically in code (scripts/site00-email-intake-assets/composite-i05.mjs:buildSeal — an SVG text overlay, not a FAL logo render, to avoid logo hallucination) and the sealed artifact is embedded directly into I05 (desktop + mobile) rather than shipped as a standalone email asset.',
    approvalStatus: 'APPROVED',
  },

  // ---------------------------------------------------------------------
  // IDENTITY — I05 — Identity Evidence Composition (deterministic composite)
  // ---------------------------------------------------------------------
  {
    assetId: 'S00-EMAIL-INTAKE-ID-I05-DESKTOP',
    emailFamily: 'IDENTITY_INTAKE_ACCESS',
    visualRole: 'Desktop hero evidence collage — deterministic composite of I01–I04',
    referenceRegion: 'Archival paper layered over the upper portrait; portrait lower-right; fingerprint outer-right/lower; seal at paper/portrait overlap.',
    classification: 'HYBRID_COMPOSITION',
    fidelityLevel: 'EXACT_RECONSTRUCTION',
    generationMethod: 'DETERMINISTIC_COMPOSITE',
    aspectRatio: '4:5',
    backgroundRequirement: 'NOT_APPLICABLE',
    alphaRequirement: false,
    desktopUsage: 'Right hero column, overlapping the Identity File record card per reference geometry.',
    mobileUsage: 'Not used — see I05-MOBILE for the art-directed mobile crop.',
    prompt: null,
    negativeConstraints: [],
    outputFilename: {
      master: null,
      desktop: 'site00-email-intake-identity-evidence-desktop.png',
      mobile: null,
    },
    generationResult: 'COMPOSITED',
    inspectionResult:
      'v1 REJECTED on composition — paper/seal cluster and portrait read as two disconnected floating fragments with a large dead-white gap between them; did not read as one layered dossier. v2 APPROVED — repositioned so the archival paper overlaps the portrait\'s upper-left (forehead/eye) region and the seal sits at that overlap seam, per the reference\'s "paper layered over upper portrait" geometry. Composited deterministically from approved I01–I04 masters — each treated as a small pinned/laid-out print with a code-synthesized drop shadow (scripts/site00-email-intake-assets/composite-i05.mjs), not a full-collage FAL regeneration, avoiding logo/text hallucination or portrait drift across iterations.',
    approvalStatus: 'APPROVED',
  },
  {
    assetId: 'S00-EMAIL-INTAKE-ID-I05-MOBILE',
    emailFamily: 'IDENTITY_INTAKE_ACCESS',
    visualRole: 'Mobile evidence strip — art-directed horizontal crop composited from I01–I04',
    referenceRegion: 'Horizontal evidence strip visible at the top of the mobile Identity composition.',
    classification: 'HYBRID_COMPOSITION',
    fidelityLevel: 'EXACT_RECONSTRUCTION',
    generationMethod: 'DETERMINISTIC_COMPOSITE',
    aspectRatio: '16:9',
    backgroundRequirement: 'NOT_APPLICABLE',
    alphaRequirement: false,
    desktopUsage: 'Not used — see I05-DESKTOP.',
    mobileUsage: 'Horizontal strip beneath the SITE 00 / IDENTITY INTAKE ACCESS label, above the headline.',
    prompt: null,
    negativeConstraints: [],
    outputFilename: {
      master: null,
      desktop: null,
      mobile: 'site00-email-intake-identity-evidence-mobile.png',
    },
    generationResult: 'COMPOSITED',
    inspectionResult:
      'v1 REJECTED on composition — same disconnected-fragments issue as the desktop v1. v2 APPROVED — tightened spacing so the fingerprint/paper/seal/portrait read as one continuous left-to-right strip. Independently art-directed horizontal recomposition (not a resize of the desktop collage) — portrait, paper and fingerprint arranged for a 375px-safe strip.',
    approvalStatus: 'APPROVED',
  },

  // ---------------------------------------------------------------------
  // CODE_NATIVE elements — documented for decomposition completeness, NOT generation targets
  // ---------------------------------------------------------------------
  {
    assetId: 'S00-EMAIL-INTAKE-CODE-01',
    emailFamily: 'BUILDER_INTAKE_ACCESS',
    visualRole: 'Frame, drafting grid, coordinate marks, Build Brief Record card, four assurance modules, buttons, progress rail',
    referenceRegion: 'All outer frame, typography, record card and module grid regions in both Builder desktop and mobile.',
    classification: 'CODE_NATIVE',
    fidelityLevel: 'EXACT_RECONSTRUCTION',
    generationMethod: 'NONE_CODE_ONLY',
    aspectRatio: 'NOT_APPLICABLE',
    backgroundRequirement: 'NOT_APPLICABLE',
    alphaRequirement: false,
    desktopUsage: 'table-safe HTML/CSS — shared/site00-email/design/compositions/lifecycle.ts:composeIntakeAccess (BUILDER branch)',
    mobileUsage: 'Same composition function, mobile media-query rules in art-direction/primitives.ts:emailDoc',
    prompt: null,
    negativeConstraints: [],
    outputFilename: { master: null, desktop: null, mobile: null },
    generationResult: 'NOT_GENERATED_CODE_NATIVE',
    inspectionResult: 'N/A — semantic HTML/CSS, not raster.',
    approvalStatus: 'NOT_APPLICABLE',
  },
  {
    assetId: 'S00-EMAIL-INTAKE-CODE-02',
    emailFamily: 'IDENTITY_INTAKE_ACCESS',
    visualRole: 'Frame, coordinate marks, Identity File Record card, four assurance modules, buttons, progress rail',
    referenceRegion: 'All outer frame, typography, record card and module grid regions in both Identity desktop and mobile.',
    classification: 'CODE_NATIVE',
    fidelityLevel: 'EXACT_RECONSTRUCTION',
    generationMethod: 'NONE_CODE_ONLY',
    aspectRatio: 'NOT_APPLICABLE',
    backgroundRequirement: 'NOT_APPLICABLE',
    alphaRequirement: false,
    desktopUsage: 'table-safe HTML/CSS — shared/site00-email/design/compositions/lifecycle.ts:composeIntakeAccess (IDENTITY branch)',
    mobileUsage: 'Same composition function, mobile media-query rules in art-direction/primitives.ts:emailDoc',
    prompt: null,
    negativeConstraints: [],
    outputFilename: { master: null, desktop: null, mobile: null },
    generationResult: 'NOT_GENERATED_CODE_NATIVE',
    inspectionResult: 'N/A — semantic HTML/CSS, not raster.',
    approvalStatus: 'NOT_APPLICABLE',
  },
];

export function getManifestEntry(assetId: string): ProductionAssetEntry | undefined {
  return INTAKE_ACCESS_PRODUCTION_MANIFEST.find((e) => e.assetId === assetId);
}

export function generatedAssetIds(): string[] {
  return INTAKE_ACCESS_PRODUCTION_MANIFEST.filter((e) => e.classification !== 'CODE_NATIVE').map((e) => e.assetId);
}
