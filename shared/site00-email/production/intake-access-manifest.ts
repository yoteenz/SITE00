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
import { INTAKE_ACCESS_ASSET_URLS, INTAKE_ACCESS_LINEAGE_URLS } from './intake-access-asset-urls.generated.js';

export type ProductionAssetClassification = 'CODE_NATIVE' | 'GENERATED_ASSET' | 'EXISTING_ASSET' | 'HYBRID_COMPOSITION';

export type ProductionFidelityMode = 'EXACT_RECONSTRUCTION' | 'DIRECTED_VARIATION' | 'NET_NEW_GENERATION';

export type ProductionGenerationMethod =
  | 'FAL_TEXT_TO_IMAGE'
  | 'FAL_REFERENCE_CONDITIONED'
  | 'DETERMINISTIC_COMPOSITE'
  | 'NONE_CODE_ONLY';

export type ProductionApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_APPLICABLE';

/**
 * Rendering-medium doctrine (see docs/site00/REFERENCE_TO_PRODUCTION_ASSET_PIPELINE.md §Rendering
 * Medium Decision). The question every element answers is not "can this be built with code" but
 * "which medium reproduces the approved art direction most faithfully, deterministically,
 * responsively and efficiently".
 */
export type RenderingMedium =
  | 'HTML_TEXT'
  | 'CSS_NATIVE'
  | 'SVG_NATIVE'
  | 'CODE_GENERATED_GRAPHIC'
  | 'FAL_GENERATED_ASSET'
  | 'FAL_GENERATED_AND_ISOLATED_ASSET'
  | 'EXISTING_CANONICAL_ASSET'
  | 'DETERMINISTIC_COMPOSITE'
  | 'HYBRID_COMPOSITION';

export type ProductionCompositingRole =
  | 'BACKGROUND_FIELD'
  | 'ATMOSPHERIC_LAYER'
  | 'PRIMARY_SUBJECT'
  | 'FOREGROUND_OVERLAY'
  | 'DOCUMENT_FRAGMENT'
  | 'EVIDENCE_OBJECT'
  | 'DECORATIVE_DETAIL'
  | 'TECHNICAL_OVERLAY'
  | 'CONTENT_CONTAINER'
  | 'STRUCTURAL_UI';

export type ProductionBackgroundMode =
  | 'KEEP'
  | 'REMOVE'
  | 'GENERATE_TRANSPARENT'
  | 'REMOVE_AND_REFINE'
  | 'MASK_CUSTOM'
  | 'COMPOSITE_ONLY'
  | 'NOT_APPLICABLE';

export type ProductionEdgePolicy =
  | 'HARD_OBJECT'
  | 'SOFT_OBJECT'
  | 'PAPER_TORN'
  | 'PHOTOGRAPHIC_CROP'
  | 'HAIR_DETAIL'
  | 'GLASS_TRANSLUCENT'
  | 'SHADOW_PRESERVE'
  | 'SHADOW_REBUILD_IN_CODE'
  | 'CUSTOM_MASK'
  | 'NOT_APPLICABLE';

export type ProductionShadowPolicy = 'ASSET_INTRINSIC' | 'PRESERVE' | 'REMOVE' | 'REBUILD_IN_CODE' | 'COMPOSITION_MASTER' | 'NONE';

export type ProductionFidelityLock = 'LOCKED' | 'RESPONSIVE' | 'BREAKPOINT_SPECIFIC' | 'DECORATIVE_FLEX';

/** Measured (not eyeballed) placement of one asset within its parent composition/canvas. */
export type ProductionCompositeMap =
  | {
      parentRegion: string;
      anchorTarget: string;
      anchorPoint: string;
      x: string;
      y: string;
      width: string;
      height?: string;
      aspectRatio?: string;
      rotation: string;
      cropMode: string;
      objectPosition: string;
      zIndex: number;
      opacity: number;
      blendBehavior: string;
      overlapTarget: string | null;
      overlapAmount: string | null;
      safeBounds: string;
      responsiveBehavior: string;
      fidelityLock: ProductionFidelityLock;
    }
  | 'N/A';

/** One GENERATE -> OPEN -> COMPARE -> APPROVE/REJECT -> REPROMPT loop entry (§XXXVII). */
export type ProductionProcessingRecord = {
  iteration: number;
  reason: string;
  correctiveChange: string;
  finalState: 'APPROVED' | 'REJECTED' | 'SUPERSEDED';
};

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

  // -------------------------------------------------------------------------------------------
  // Production compositing + asset treatment + rendering-medium fidelity pass (§XXXIX manifest
  // upgrade). Every field below is populated from direct inspection performed this sprint (pixel
  // metadata, isolation QA renders, measured composite coordinates) — not inferred from asset
  // existence or prior approval notes.
  // -------------------------------------------------------------------------------------------
  renderingMedium: RenderingMedium;
  renderingMediumReason: string;
  sourceReference: string;
  concept: string;

  requiresPhysicalRealism: boolean;
  requiresExactGeometry: boolean;
  requiresExactText: boolean;
  containsDynamicData: boolean;
  requiresTransparency: boolean;
  requiresMaterialLighting: boolean;
  requiresReflection: boolean;
  requiresRefraction: boolean;
  requiresTexture: boolean;
  requiresDepth: boolean;
  requiresResponsiveRecomposition: boolean;

  compositingRole: ProductionCompositingRole;
  backgroundMode: ProductionBackgroundMode;
  backgroundRemovalRequired: boolean;
  edgePolicy: ProductionEdgePolicy;
  shadowPolicy: ProductionShadowPolicy;

  /** Production lineage — GENERATION MASTER -> ISOLATION MASTER -> COMPOSITION MASTER ->
   * DESKTOP/MOBILE DERIVATIVE -> EMAIL OPTIMIZED DERIVATIVE. null = stage not applicable. */
  generationMaster: string | null;
  isolationMaster: string | null;
  compositionMaster: string | null;
  desktopDerivative: string | null;
  mobileDerivative: string | null;
  emailDerivative: string | null;

  compositeMapDesktop: ProductionCompositeMap;
  compositeMapMobile: ProductionCompositeMap;

  processingHistory: ProductionProcessingRecord[];
  generationModel: string | null;
  processingModel: string | null;
  iterationCount: number;
  deliveryStrategy: string;
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
    renderingMedium: 'FAL_GENERATED_ASSET',
    renderingMediumReason:
      'Rule 4 (physical visual phenomena) — believable graphite/pale-blue drafting realism, layered construction-sketch density and architectural perspective cannot be reproduced deterministically in CSS/SVG. No exact brand/text on the object, so HYBRID_COMPOSITION is not required.',
    sourceReference: 'BUILDER_DESKTOP_REFERENCE / BUILDER_MOBILE_REFERENCE — founder-approved concept board, architecture region',
    concept: 'THE BRIEF HAS A LOCATION — architectural build blueprint atmosphere',
    requiresPhysicalRealism: true,
    requiresExactGeometry: false,
    requiresExactText: false,
    containsDynamicData: false,
    requiresTransparency: false,
    requiresMaterialLighting: true,
    requiresReflection: false,
    requiresRefraction: false,
    requiresTexture: true,
    requiresDepth: true,
    requiresResponsiveRecomposition: true,
    compositingRole: 'ATMOSPHERIC_LAYER',
    backgroundMode: 'COMPOSITE_ONLY',
    backgroundRemovalRequired: false,
    edgePolicy: 'PHOTOGRAPHIC_CROP',
    shadowPolicy: 'NONE',
    generationMaster: INTAKE_ACCESS_LINEAGE_URLS.builderBlueprintMaster,
    isolationMaster: null,
    compositionMaster: null,
    desktopDerivative: INTAKE_ACCESS_ASSET_URLS.builderBlueprintDesktop,
    mobileDerivative: INTAKE_ACCESS_ASSET_URLS.builderBlueprintMobile,
    emailDerivative: INTAKE_ACCESS_ASSET_URLS.builderBlueprintDesktop,
    compositeMapDesktop: {
      parentRegion: 'BUILDER_HERO_RIGHT_COLUMN',
      anchorTarget: 'S00-EMAIL-INTAKE-CODE-01 (Build Brief Record card)',
      anchorPoint: 'bottom-center of artwork meets top edge of card',
      x: 'right-aligned within 46%-width right column',
      y: 'top of right column',
      width: '280px css (560px master @2x, cover-cropped from 1024x768 master, position:right)',
      height: '210px css (420px master @2x)',
      rotation: '0deg',
      cropMode: 'cover, position:right',
      objectPosition: 'right',
      zIndex: 0,
      opacity: 1,
      blendBehavior: 'normal — pale off-white master background blends into the white email canvas (no visible box edge on inspection)',
      overlapTarget: 'S00-EMAIL-INTAKE-CODE-01',
      overlapAmount: '-46px negative top margin pulls the record card up over the artwork lower edge (shared <td>, not a separate <tr>, so the margin is respected)',
      safeBounds: 'right hero column only, does not bleed into the left headline column',
      responsiveBehavior: 'BREAKPOINT_SPECIFIC — independent mobile derivative, not a scaled-down copy',
      fidelityLock: 'BREAKPOINT_SPECIFIC',
    },
    compositeMapMobile: {
      parentRegion: 'BUILDER_MOBILE_HERO',
      anchorTarget: 'BUILDER INTAKE ACCESS label + headline block below',
      anchorPoint: 'top, full-bleed',
      x: '0 (full width)',
      y: '0 (top of mobile-only hero block, above the label)',
      width: '100% (1200x460 master crop, position: right top)',
      height: 'auto (~140px css at 375-430 viewport widths)',
      rotation: '0deg',
      cropMode: 'cover, position: right top',
      objectPosition: 'right top',
      zIndex: 0,
      opacity: 1,
      blendBehavior: 'lightened via modulate(brightness 1.08, saturation 0.9) + linear(0.82, 30) so overlaid text stays legible — restrained wash, not a loud hero image',
      overlapTarget: null,
      overlapAmount: null,
      safeBounds: 'full-bleed within the mobile-only hero <td>',
      responsiveBehavior: 'independent art-directed mobile derivative (wide/short crop with extended drafting-line atmosphere), not a resize of the desktop derivative',
      fidelityLock: 'BREAKPOINT_SPECIFIC',
    },
    processingHistory: [
      { iteration: 1, reason: 'N/A — approved on first generation/derivation pass', correctiveChange: 'none', finalState: 'APPROVED' },
    ],
    generationModel: 'openai/gpt-image-2',
    processingModel: 'sharp (deterministic crop/tone derivation) — scripts/site00-email-intake-assets/derive-builder.mjs',
    iterationCount: 1,
    deliveryStrategy:
      'Two independent breakpoint-specific raster derivatives (crop + tone adjusted from one approved master) delivered as a standard <img> with explicit width/height, composited against the live HTML record card via CSS negative margin (Section XXX Option A — INDEPENDENT_LAYERS) rather than flattened into it, because the record card carries dynamic intake data.',
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
    renderingMedium: 'FAL_GENERATED_ASSET',
    renderingMediumReason:
      'Rule 4 — photographic grain, skin texture, directional lighting and editorial realism cannot be reproduced deterministically in CSS/SVG. Rectangular photographic crop per reference, so BACKGROUND_MODE is KEEP (no isolation needed).',
    sourceReference: 'IDENTITY_PORTRAIT_REFERENCE / IDENTITY_DESKTOP_REFERENCE',
    concept: 'THE EVIDENCE IS IN — anonymous black-and-white portrait fragment, primary evidence subject',
    requiresPhysicalRealism: true,
    requiresExactGeometry: false,
    requiresExactText: false,
    containsDynamicData: false,
    requiresTransparency: false,
    requiresMaterialLighting: true,
    requiresReflection: false,
    requiresRefraction: false,
    requiresTexture: true,
    requiresDepth: false,
    requiresResponsiveRecomposition: false,
    compositingRole: 'PRIMARY_SUBJECT',
    backgroundMode: 'KEEP',
    backgroundRemovalRequired: false,
    edgePolicy: 'PHOTOGRAPHIC_CROP',
    shadowPolicy: 'NONE',
    generationMaster: INTAKE_ACCESS_LINEAGE_URLS.identityPortraitMaster,
    isolationMaster: null,
    compositionMaster: null,
    desktopDerivative: null,
    mobileDerivative: null,
    emailDerivative: null,
    compositeMapDesktop: {
      parentRegion: 'IDENTITY_EVIDENCE_CLUSTER_DESKTOP (I05-DESKTOP canvas, 1000x1100)',
      anchorTarget: 'PORTRAIT_ANCHOR — base layer of the evidence cluster',
      anchorPoint: 'top-left',
      x: '0.280',
      y: '0.218',
      width: '0.700',
      height: '0.782 (bleeds to the canvas bottom edge)',
      rotation: '0deg',
      cropMode: 'cover',
      objectPosition: 'center',
      zIndex: 0,
      opacity: 1,
      blendBehavior: 'normal',
      overlapTarget: 'I02 (archival note), I03 (fingerprint), I04 (seal) — all layer above',
      overlapAmount: 'see I02/I03/I04 compositeMapDesktop',
      safeBounds: 'right ~70% of the 1000x1100 canvas',
      responsiveBehavior: 'independent mobile crop (I05-MOBILE), not a resize of the desktop layer',
      fidelityLock: 'LOCKED',
    },
    compositeMapMobile: {
      parentRegion: 'IDENTITY_EVIDENCE_STRIP_MOBILE (I05-MOBILE canvas, 1100x620)',
      anchorTarget: 'PORTRAIT_ANCHOR',
      anchorPoint: 'top-left',
      x: '0.527',
      y: '0.029',
      width: '0.418',
      height: '0.944',
      rotation: '0deg',
      cropMode: 'cover',
      objectPosition: 'center',
      zIndex: 0,
      opacity: 1,
      blendBehavior: 'normal',
      overlapTarget: 'I04 (seal) overlaps the portrait left edge seam',
      overlapAmount: 'seal spans x:0.427-0.507 vs portrait start x:0.527 — direct seam contact',
      safeBounds: 'right ~42% of the 1100x620 canvas',
      responsiveBehavior: 'independent 1100x620 strip composition, not scaled from desktop',
      fidelityLock: 'LOCKED',
    },
    processingHistory: [
      {
        iteration: 1,
        reason: 'WRONG COMPOSITING ROLE / REFERENCE MISMATCH — composed a photorealistic manila folder, clipboard and wooden desk around the portrait; too much extraneous prop context for a compositable evidence fragment',
        correctiveChange: 'refined prompt to explicitly exclude props/desk/surface',
        finalState: 'SUPERSEDED',
      },
      { iteration: 2, reason: 'N/A', correctiveChange: 'clean edge-to-edge monochrome face fragment, no smile, no retouching sheen, no crime-scene markers, no readable text', finalState: 'APPROVED' },
    ],
    generationModel: 'openai/gpt-image-2',
    processingModel: null,
    iterationCount: 2,
    deliveryStrategy: 'Embedded as the base layer of DETERMINISTIC_COMPOSITE I05 (desktop + mobile); not shipped as a standalone email asset.',
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
      'v1 APPROVED on its own terms (warm ivory paper, illegible handwriting, deckled edge, no readable text, no seals) but photographed on a wood tabletop, which composited as a hard rectangular "box" behind the paper in the I05 collage. v3 regenerated the same art direction fully isolated on a flat white backdrop — RE-AUDITED this sprint: v3 is a "flat lay on white" *photograph*, not a true alpha-transparent isolation master (no alpha channel), and its own soft photographic vignette produced a visible rectangular halo on I05\'s pure-white canvas (confirmed by direct crop inspection of the rendered email, not assumed). Corrected via fal-ai/birefnet/v2 background removal into a true isolation master; white/black/gray isolation QA passed with no residue. Re-approved on the corrected isolation master.',
    approvalStatus: 'APPROVED',
    renderingMedium: 'FAL_GENERATED_AND_ISOLATED_ASSET',
    renderingMediumReason:
      'Rule 4 (paper fiber texture, irregular torn/deckled edge, ink) demands FAL generation; the physical-fragment compositing role additionally requires true alpha isolation (not a flat-lay photograph with its own background) so it layers as a torn-paper object rather than a soft rectangle.',
    sourceReference: 'IDENTITY_NOTE_REFERENCE / IDENTITY_DESKTOP_REFERENCE',
    concept: 'Archival handwritten evidence fragment layered over the portrait',
    requiresPhysicalRealism: true,
    requiresExactGeometry: false,
    requiresExactText: false,
    containsDynamicData: false,
    requiresTransparency: true,
    requiresMaterialLighting: true,
    requiresReflection: false,
    requiresRefraction: false,
    requiresTexture: true,
    requiresDepth: false,
    requiresResponsiveRecomposition: true,
    compositingRole: 'DOCUMENT_FRAGMENT',
    backgroundMode: 'REMOVE_AND_REFINE',
    backgroundRemovalRequired: true,
    edgePolicy: 'PAPER_TORN',
    shadowPolicy: 'REBUILD_IN_CODE',
    generationMaster: INTAKE_ACCESS_LINEAGE_URLS.identityArchivalNoteMaster,
    isolationMaster: INTAKE_ACCESS_LINEAGE_URLS.identityArchivalNoteIsolated,
    compositionMaster: null,
    desktopDerivative: null,
    mobileDerivative: null,
    emailDerivative: null,
    compositeMapDesktop: {
      parentRegion: 'IDENTITY_EVIDENCE_CLUSTER_DESKTOP (1000x1100)',
      anchorTarget: 'ARCHIVAL_NOTE overlapping the PORTRAIT upper-left (forehead/eye) region',
      anchorPoint: 'top-left',
      x: '0.040',
      y: '0.036',
      width: '0.460',
      height: '0.312',
      rotation: '-6deg',
      cropMode: 'none (fit:inside — full torn-paper silhouette preserved, never cropped)',
      objectPosition: 'n/a (absolute composite)',
      zIndex: 2,
      opacity: 1,
      blendBehavior: 'normal + code-synthesized offset drop shadow (tinted blur of its own alpha silhouette, not a rectangle)',
      overlapTarget: 'I01 portrait (below), I04 seal (bridges the note/portrait seam at the note\'s right edge)',
      overlapAmount: "note right edge (x=0.500) sits ~0.07 canvas-widths from the seal's left edge (x=0.430) — seal bridges the seam per reference",
      safeBounds: 'upper-left quadrant of the 1000x1100 canvas',
      responsiveBehavior: 'independent mobile placement (I05-MOBILE), not scaled from desktop',
      fidelityLock: 'LOCKED',
    },
    compositeMapMobile: {
      parentRegion: 'IDENTITY_EVIDENCE_STRIP_MOBILE (1100x620)',
      anchorTarget: 'overlaps FINGERPRINT (above-left) and the SEAL/PORTRAIT seam (right)',
      anchorPoint: 'top-left',
      x: '0.255',
      y: '0.306',
      width: '0.309',
      height: '0.410',
      rotation: '-5deg',
      cropMode: 'none',
      objectPosition: 'n/a',
      zIndex: 2,
      opacity: 1,
      blendBehavior: 'normal + code-synthesized drop shadow',
      overlapTarget: 'I03 fingerprint (above-left), I04 seal (overlaps the note\'s right portion)',
      overlapAmount: 'seal (x:0.427-0.507) overlaps the note (x:0.255-0.564) directly',
      safeBounds: 'center-left of the 1100x620 canvas',
      responsiveBehavior: 'independent 1100x620 strip placement, not scaled from desktop',
      fidelityLock: 'LOCKED',
    },
    processingHistory: [
      {
        iteration: 1,
        reason: 'BACKGROUND RESIDUE / WRONG COMPOSITING ROLE — approved on its own terms but photographed on a wood tabletop, which composited as a hard rectangular box behind the paper in I05',
        correctiveChange: 'regenerated the same art direction fully isolated on a flat white backdrop (v3)',
        finalState: 'SUPERSEDED',
      },
      {
        iteration: 2,
        reason: 'BACKGROUND RESIDUE (confirmed by direct pixel/crop inspection during this sprint\'s forensic audit, not assumed) — v3 is a flat-lay-on-white photograph with no alpha channel; its own soft photographic vignette produced a visible rectangular halo on I05\'s pure-white canvas',
        correctiveChange: 'processed v3 through fal-ai/birefnet/v2 (General Use Light) to produce a true alpha-transparent isolation master; verified white/black/gray isolation QA (clean torn-paper edge, no halo/residue)',
        finalState: 'APPROVED',
      },
    ],
    generationModel: 'openai/gpt-image-2',
    processingModel: 'fal-ai/birefnet/v2 (General Use Light)',
    iterationCount: 3,
    deliveryStrategy: 'Isolated alpha-transparent layer composited into DETERMINISTIC_COMPOSITE I05 (desktop + mobile); not shipped as a standalone email asset.',
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
      'v1 REJECTED — rendered a readable "IDENTITY" caption plus a linen-textured double mat/frame, violating the no-readable-text constraint. v2 REJECTED — removed the caption but still sat on a visible gray surface that composited as a hard box. v3 "APPROVED" — isolated on flat white, no text, authentic ridge texture, deckled paper edge. RE-AUDITED this sprint: like I02, v3 is a flat-lay photograph (no alpha channel) whose own vignette produced a rectangular halo in I05. Corrected via fal-ai/birefnet/v2; isolation QA passed with no residue. Re-approved on the corrected isolation master.',
    approvalStatus: 'APPROVED',
    renderingMedium: 'FAL_GENERATED_AND_ISOLATED_ASSET',
    renderingMediumReason:
      'Rule 4 (paper fiber, ink ridge texture, torn edge) demands FAL generation; the specimen card floats independently in the collage, so BACKGROUND_MODE REMOVE_AND_REFINE (true alpha isolation) is required rather than a flat photographic rectangle.',
    sourceReference: 'IDENTITY_FINGERPRINT_REFERENCE / IDENTITY_DESKTOP_REFERENCE',
    concept: 'Fingerprint specimen — small identity-evidence detail card',
    requiresPhysicalRealism: true,
    requiresExactGeometry: false,
    requiresExactText: false,
    containsDynamicData: false,
    requiresTransparency: true,
    requiresMaterialLighting: true,
    requiresReflection: false,
    requiresRefraction: false,
    requiresTexture: true,
    requiresDepth: false,
    requiresResponsiveRecomposition: true,
    compositingRole: 'EVIDENCE_OBJECT',
    backgroundMode: 'REMOVE_AND_REFINE',
    backgroundRemovalRequired: true,
    edgePolicy: 'PAPER_TORN',
    shadowPolicy: 'REBUILD_IN_CODE',
    generationMaster: INTAKE_ACCESS_LINEAGE_URLS.identityFingerprintMaster,
    isolationMaster: INTAKE_ACCESS_LINEAGE_URLS.identityFingerprintIsolated,
    compositionMaster: null,
    desktopDerivative: null,
    mobileDerivative: null,
    emailDerivative: null,
    compositeMapDesktop: {
      parentRegion: 'IDENTITY_EVIDENCE_CLUSTER_DESKTOP (1000x1100)',
      anchorTarget: 'FINGERPRINT_SPECIMEN overlapping the portrait lower/right region',
      anchorPoint: 'top-left',
      x: '0.760',
      y: '0.818',
      width: '0.210',
      height: '0.191 (extends ~10px past the canvas bottom edge; absorbed by the final cover-fit resize)',
      rotation: '7deg',
      cropMode: 'none (fit:inside)',
      objectPosition: 'n/a',
      zIndex: 2,
      opacity: 1,
      blendBehavior: 'normal + code-synthesized drop shadow',
      overlapTarget: 'I01 portrait (beneath, lower-right)',
      overlapAmount: 'fully contained within the portrait\'s lower-right quadrant',
      safeBounds: 'lower-right corner of the 1000x1100 canvas',
      responsiveBehavior: 'independent mobile placement (I05-MOBILE)',
      fidelityLock: 'LOCKED',
    },
    compositeMapMobile: {
      parentRegion: 'IDENTITY_EVIDENCE_STRIP_MOBILE (1100x620)',
      anchorTarget: 'left-most element of the evidence strip',
      anchorPoint: 'top-left',
      x: '0.100',
      y: '0.097',
      width: '0.145',
      height: '0.258',
      rotation: '-6deg',
      cropMode: 'none',
      objectPosition: 'n/a',
      zIndex: 2,
      opacity: 1,
      blendBehavior: 'normal + code-synthesized drop shadow',
      overlapTarget: 'I02 archival note (below-right)',
      overlapAmount: 'no direct overlap — anchors the strip\'s left edge, connected via proximity to the note',
      safeBounds: 'upper-left of the 1100x620 canvas',
      responsiveBehavior: 'independent 1100x620 strip placement',
      fidelityLock: 'LOCKED',
    },
    processingHistory: [
      { iteration: 1, reason: 'HALLUCINATED TEXT — rendered a readable "IDENTITY" caption plus a linen-textured double mat/frame', correctiveChange: 'removed caption/mat from prompt', finalState: 'SUPERSEDED' },
      { iteration: 2, reason: 'BACKGROUND RESIDUE — still sat on a visible gray surface that composited as a hard box', correctiveChange: 'regenerated fully isolated on flat white (v3)', finalState: 'SUPERSEDED' },
      {
        iteration: 3,
        reason: 'BACKGROUND RESIDUE (confirmed by direct pixel/crop inspection this sprint) — v3 flat-lay photograph carried its own vignette, producing a rectangular halo on I05\'s white canvas',
        correctiveChange: 'processed v3 through fal-ai/birefnet/v2 (General Use Light) into a true alpha-transparent isolation master; verified white/black/gray isolation QA',
        finalState: 'APPROVED',
      },
    ],
    generationModel: 'openai/gpt-image-2',
    processingModel: 'fal-ai/birefnet/v2 (General Use Light)',
    iterationCount: 3,
    deliveryStrategy: 'Isolated alpha-transparent layer composited into DETERMINISTIC_COMPOSITE I05 (desktop + mobile); not shipped as a standalone email asset.',
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
      'RE-AUDITED this sprint — direct pixel/metadata inspection (sharp metadata: channels:3, hasAlpha:false) proves the "isolated on a transparent background" note above was INCORRECT and never actually verified: the master\'s background is a literal opaque checkerboard PATTERN painted by the text-to-image model (a known failure mode of drawing the *symbol* of transparency instead of true alpha), not real transparency. This produced a visible checkerboard-tinted square behind the seal once composited. Corrected via fal-ai/birefnet/v2 (General Use Heavy) background removal into a true alpha-transparent isolation master; white/black/gray isolation QA passed (clean circular silhouette, no checkerboard/halo residue). The canonical "00 / SITE" mark remains composited on top deterministically in code (scripts/site00-email-intake-assets/composite-i05.mjs:buildSeal — an SVG text overlay, not a FAL logo render) and the sealed artifact is embedded directly into I05 (desktop + mobile) rather than shipped as a standalone email asset.',
    approvalStatus: 'APPROVED',
    renderingMedium: 'HYBRID_COMPOSITION',
    renderingMediumReason:
      'Rule 5 — physical wax realism (irregular edge, gloss highlight, embossed rim) + exact deterministic branding cannot both come from one medium: FAL generates the physical wax substrate, SVG_NATIVE composites the exact "00 / SITE" mark on top deterministically so FAL never owns brand typography.',
    sourceReference: 'IDENTITY_SEAL_REFERENCE / IDENTITY_DESKTOP_REFERENCE',
    concept: 'Dimensional SITE 00 evidence seal bridging the note/portrait seam',
    requiresPhysicalRealism: true,
    requiresExactGeometry: true,
    requiresExactText: true,
    containsDynamicData: false,
    requiresTransparency: true,
    requiresMaterialLighting: true,
    requiresReflection: true,
    requiresRefraction: false,
    requiresTexture: true,
    requiresDepth: true,
    requiresResponsiveRecomposition: true,
    compositingRole: 'EVIDENCE_OBJECT',
    backgroundMode: 'REMOVE_AND_REFINE',
    backgroundRemovalRequired: true,
    edgePolicy: 'HARD_OBJECT',
    shadowPolicy: 'ASSET_INTRINSIC',
    generationMaster: INTAKE_ACCESS_LINEAGE_URLS.identitySealMaster,
    isolationMaster: INTAKE_ACCESS_LINEAGE_URLS.identitySealIsolated,
    compositionMaster: null,
    desktopDerivative: null,
    mobileDerivative: null,
    emailDerivative: null,
    compositeMapDesktop: {
      parentRegion: 'IDENTITY_EVIDENCE_CLUSTER_DESKTOP (1000x1100)',
      anchorTarget: 'bridges the ARCHIVAL_NOTE / PORTRAIT seam',
      anchorPoint: 'top-left',
      x: '0.430',
      y: '0.300',
      width: '0.112',
      height: '0.102',
      rotation: '0deg',
      cropMode: 'cover (square canonical mark composited via SVG on top, 0,0 origin)',
      objectPosition: 'center',
      zIndex: 3,
      opacity: 1,
      blendBehavior: 'normal — no added shadow, relies on the wax\'s own rendered highlights/embossed rim for dimensionality',
      overlapTarget: 'I02 note (left), I01 portrait (below/right)',
      overlapAmount: 'seal x-span (0.430-0.542) overlaps the note\'s right edge (ends 0.500) by ~0.07 canvas-widths',
      safeBounds: 'center of the 1000x1100 canvas, at the note/portrait seam',
      responsiveBehavior: 'independent mobile placement (I05-MOBILE)',
      fidelityLock: 'LOCKED',
    },
    compositeMapMobile: {
      parentRegion: 'IDENTITY_EVIDENCE_STRIP_MOBILE (1100x620)',
      anchorTarget: 'bridges the ARCHIVAL_NOTE right edge and the PORTRAIT left edge',
      anchorPoint: 'top-left',
      x: '0.427',
      y: '0.274',
      width: '0.080',
      height: '0.142',
      rotation: '0deg',
      cropMode: 'cover',
      objectPosition: 'center',
      zIndex: 3,
      opacity: 1,
      blendBehavior: 'normal',
      overlapTarget: 'I02 note (left), I01 portrait (right edge, x=0.527)',
      overlapAmount: 'seal ends at x=0.507, ~0.02 canvas-widths short of the portrait\'s left edge — direct seam contact',
      safeBounds: 'center of the 1100x620 canvas',
      responsiveBehavior: 'independent 1100x620 strip placement',
      fidelityLock: 'LOCKED',
    },
    processingHistory: [
      {
        iteration: 1,
        reason: 'BACKGROUND RESIDUE (not caught at generation time — text-only "transparent background" prompt was trusted without pixel verification) — the model painted an opaque checkerboard pattern as background pixels (hasAlpha:false) instead of true alpha, confirmed by direct metadata/pixel inspection during this sprint\'s forensic audit',
        correctiveChange: 'processed the existing master through fal-ai/birefnet/v2 (General Use Heavy) to produce a true alpha-transparent isolation master; re-verified white/black/gray isolation QA',
        finalState: 'APPROVED',
      },
    ],
    generationModel: 'openai/gpt-image-2',
    processingModel: 'fal-ai/birefnet/v2 (General Use Heavy)',
    iterationCount: 2,
    deliveryStrategy:
      'HYBRID_COMPOSITION: isolated wax substrate + SVG_NATIVE "00/SITE" text overlay, flattened in code (buildSeal), then composited into DETERMINISTIC_COMPOSITE I05 (desktop + mobile); not shipped as a standalone email asset.',
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
      'v1 REJECTED on composition — paper/seal cluster and portrait read as two disconnected floating fragments with a large dead-white gap between them; did not read as one layered dossier. v2 APPROVED — repositioned so the archival paper overlaps the portrait\'s upper-left (forehead/eye) region and the seal sits at that overlap seam, per the reference\'s "paper layered over upper portrait" geometry. RE-BUILT this sprint (v3) from the corrected I02/I03/I04 isolation masters (no coordinate changes) — the flat-lay photographs\' own vignettes were previously (if inadvertently) softening some of the visible seams; rebuilding from true alpha confirms the locked coordinates still read as one connected dossier with no residue.',
    approvalStatus: 'APPROVED',
    renderingMedium: 'DETERMINISTIC_COMPOSITE',
    renderingMediumReason:
      'Rule 6 — complex static layer cluster (portrait + note + seal + fingerprint) needs a locked spatial relationship; flattened to one raster for email-client layering reliability while each source asset\'s isolation/generation masters remain independently preserved (Section XXX: HYBRID STATIC COMPOSITE + HTML, since the surrounding record card/CTA/dynamic fields stay live HTML).',
    sourceReference: 'IDENTITY_EVIDENCE_CLUSTER_REFERENCE / IDENTITY_DESKTOP_REFERENCE',
    concept: 'IDENTITY_EVIDENCE_CLUSTER — one composed evidence-file story, not four unrelated thumbnails',
    requiresPhysicalRealism: false,
    requiresExactGeometry: true,
    requiresExactText: false,
    containsDynamicData: false,
    requiresTransparency: false,
    requiresMaterialLighting: false,
    requiresReflection: false,
    requiresRefraction: false,
    requiresTexture: false,
    requiresDepth: false,
    requiresResponsiveRecomposition: true,
    compositingRole: 'PRIMARY_SUBJECT',
    backgroundMode: 'COMPOSITE_ONLY',
    backgroundRemovalRequired: false,
    edgePolicy: 'NOT_APPLICABLE',
    shadowPolicy: 'COMPOSITION_MASTER',
    generationMaster: null,
    isolationMaster: null,
    compositionMaster: INTAKE_ACCESS_LINEAGE_URLS.identityEvidenceDesktopCompositionMaster,
    desktopDerivative: INTAKE_ACCESS_ASSET_URLS.identityEvidenceDesktop,
    mobileDerivative: null,
    emailDerivative: INTAKE_ACCESS_ASSET_URLS.identityEvidenceDesktop,
    compositeMapDesktop: {
      parentRegion: 'IDENTITY_HERO_RIGHT_COLUMN',
      anchorTarget: 'S00-EMAIL-INTAKE-CODE-02 (Identity File record card)',
      anchorPoint: 'bottom-center of cluster meets top edge of card',
      x: 'right-aligned within 46%-width right column',
      y: 'top of right column',
      width: '280px css (600px master @2x, cover-cropped from the 1000x1100 composition master)',
      height: '308px css (660px master @2x)',
      rotation: '0deg',
      cropMode: 'cover',
      objectPosition: 'center',
      zIndex: 0,
      opacity: 1,
      blendBehavior: 'normal',
      overlapTarget: 'S00-EMAIL-INTAKE-CODE-02',
      overlapAmount: '-14px negative top margin (shallower than Builder\'s -46px — Identity\'s collage fills edge-to-edge, so a shallow overlap keeps the "touching" seam without covering the file reference/status fields)',
      safeBounds: 'right hero column only',
      responsiveBehavior: 'BREAKPOINT_SPECIFIC — see I05-MOBILE for the independently art-directed mobile strip',
      fidelityLock: 'BREAKPOINT_SPECIFIC',
    },
    compositeMapMobile: 'N/A',
    processingHistory: [
      {
        iteration: 1,
        reason: 'REFERENCE MISMATCH / WRONG COMPOSITING ROLE — paper/seal cluster and portrait read as two disconnected floating fragments with a large dead-white gap between them',
        correctiveChange: 'repositioned so the archival paper overlaps the portrait\'s upper-left (forehead/eye) region, seal at the overlap seam',
        finalState: 'SUPERSEDED',
      },
      {
        iteration: 2,
        reason: 'source layers (I02/I03/I04) later failed isolation QA under this sprint\'s stricter pixel-level inspection (background residue on paper/fingerprint, checkerboard on seal)',
        correctiveChange: 'rebuilt the identical locked coordinates from the corrected alpha-transparent isolation masters',
        finalState: 'APPROVED',
      },
    ],
    generationModel: null,
    processingModel: 'sharp (deterministic compositing) — scripts/site00-email-intake-assets/composite-i05.mjs',
    iterationCount: 2,
    deliveryStrategy: 'Flattened DETERMINISTIC_COMPOSITE raster, delivered as a standard <img> composited against the live HTML record card via CSS negative margin.',
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
      'v1 REJECTED on composition — same disconnected-fragments issue as the desktop v1. v2 "APPROVED" — tightened spacing so the fingerprint/paper/seal/portrait read as one continuous left-to-right strip. RE-AUDITED this sprint: v2 composited FAL\'s raw vignette-carrying photographs, which had (accidentally) visually softened the gap between the paper cluster and the portrait; once rebuilt with true alpha isolation masters the v2 x-offsets read as disconnected fragments again (fails "evidence pieces do not physically/visually interact"). v3 APPROVED — retightened fingerprint/paper/seal offsets so the seal overlaps both the paper and the portrait\'s left edge directly. Independently art-directed horizontal recomposition (not a resize of the desktop collage) — portrait, paper and fingerprint arranged for a 375px-safe strip.',
    approvalStatus: 'APPROVED',
    renderingMedium: 'DETERMINISTIC_COMPOSITE',
    renderingMediumReason:
      'Rule 6 — same locked-cluster requirement as I05-DESKTOP, independently art-directed for the mobile evidence strip rather than a scaled copy of the desktop composite (§XXVII: DO NOT SHRINK DESKTOP).',
    sourceReference: 'IDENTITY_EVIDENCE_CLUSTER_REFERENCE / IDENTITY_MOBILE_REFERENCE',
    concept: 'IDENTITY_EVIDENCE_CLUSTER — mobile horizontal evidence strip',
    requiresPhysicalRealism: false,
    requiresExactGeometry: true,
    requiresExactText: false,
    containsDynamicData: false,
    requiresTransparency: false,
    requiresMaterialLighting: false,
    requiresReflection: false,
    requiresRefraction: false,
    requiresTexture: false,
    requiresDepth: false,
    requiresResponsiveRecomposition: true,
    compositingRole: 'PRIMARY_SUBJECT',
    backgroundMode: 'COMPOSITE_ONLY',
    backgroundRemovalRequired: false,
    edgePolicy: 'NOT_APPLICABLE',
    shadowPolicy: 'COMPOSITION_MASTER',
    generationMaster: null,
    isolationMaster: null,
    compositionMaster: INTAKE_ACCESS_LINEAGE_URLS.identityEvidenceMobileCompositionMaster,
    desktopDerivative: null,
    mobileDerivative: INTAKE_ACCESS_ASSET_URLS.identityEvidenceMobile,
    emailDerivative: INTAKE_ACCESS_ASSET_URLS.identityEvidenceMobile,
    compositeMapDesktop: 'N/A',
    compositeMapMobile: {
      parentRegion: 'IDENTITY_MOBILE_HERO',
      anchorTarget: 'IDENTITY INTAKE ACCESS label + headline block below',
      anchorPoint: 'top, full-bleed',
      x: '0 (full width)',
      y: '0 (top of mobile-only hero block)',
      width: '100% (640x360 email derivative, cover-cropped from the 1100x620 composition master)',
      height: 'auto (~190px css at 375-430 viewport widths)',
      rotation: '0deg',
      cropMode: 'cover',
      objectPosition: 'center',
      zIndex: 0,
      opacity: 1,
      blendBehavior: 'normal',
      overlapTarget: null,
      overlapAmount: null,
      safeBounds: 'full-bleed within the mobile-only hero <td>',
      responsiveBehavior: 'independent art-directed mobile strip (portrait right, fingerprint/note/seal cluster left, seal bridging note+portrait), not a resize of I05-DESKTOP',
      fidelityLock: 'BREAKPOINT_SPECIFIC',
    },
    processingHistory: [
      { iteration: 1, reason: 'REFERENCE MISMATCH — same disconnected-fragments issue as the desktop v1', correctiveChange: 'tightened spacing for a continuous left-to-right strip', finalState: 'SUPERSEDED' },
      {
        iteration: 2,
        reason: 'WRONG COMPOSITING ROLE (found this sprint) — v2 composited FAL\'s raw vignette-carrying photographs, which had accidentally bridged the visual gap between the paper cluster and the portrait; once corrected to true alpha, the v2 offsets read as disconnected fragments',
        correctiveChange: 'rebuilt from isolation masters and retightened fingerprint/paper/seal offsets so the seal overlaps both the paper and the portrait\'s left edge directly',
        finalState: 'SUPERSEDED',
      },
      { iteration: 3, reason: 'N/A', correctiveChange: 'final tightened offsets verified by direct crop inspection — connected strip, no residue', finalState: 'APPROVED' },
    ],
    generationModel: null,
    processingModel: 'sharp (deterministic compositing) — scripts/site00-email-intake-assets/composite-i05.mjs',
    iterationCount: 3,
    deliveryStrategy: 'Flattened DETERMINISTIC_COMPOSITE raster, delivered as a standard full-bleed <img> above the mobile-only headline block.',
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
    renderingMedium: 'CSS_NATIVE',
    renderingMediumReason:
      'Rule 1 (exact/dynamic text: intake ID, status, last-saved, completion, CTA) + Rule 2 (simple geometry: frame, grid lines, progress rail) + Rule 3 (header technical marks, assurance icons). Coarse-grained catch-all; see RENDERING_MEDIUM_MATRIX in this file for the full per-element decomposition (headline, "LOCATION." red treatment, header ticks, coordinate marks, assurance icons/text).',
    sourceReference: 'BUILDER_DESKTOP_REFERENCE / BUILDER_MOBILE_REFERENCE — frame, typography and module regions',
    concept: 'THE BRIEF HAS A LOCATION — structural UI, dynamic record data',
    requiresPhysicalRealism: false,
    requiresExactGeometry: true,
    requiresExactText: true,
    containsDynamicData: true,
    requiresTransparency: false,
    requiresMaterialLighting: false,
    requiresReflection: false,
    requiresRefraction: false,
    requiresTexture: false,
    requiresDepth: false,
    requiresResponsiveRecomposition: true,
    compositingRole: 'STRUCTURAL_UI',
    backgroundMode: 'NOT_APPLICABLE',
    backgroundRemovalRequired: false,
    edgePolicy: 'NOT_APPLICABLE',
    shadowPolicy: 'NONE',
    generationMaster: null,
    isolationMaster: null,
    compositionMaster: null,
    desktopDerivative: null,
    mobileDerivative: null,
    emailDerivative: null,
    compositeMapDesktop: 'N/A',
    compositeMapMobile: 'N/A',
    processingHistory: [],
    generationModel: null,
    processingModel: null,
    iterationCount: 0,
    deliveryStrategy: 'Live table-safe HTML/CSS/SVG, inline styles, explicit dimensions — never rasterized. intakeReference/intakeStatusDisplay/intakeLastSavedAtDisplay/intakeCompletionPercent/ctaLabel/ctaUrl remain dynamic HTML text nodes.',
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
    renderingMedium: 'CSS_NATIVE',
    renderingMediumReason:
      'Rule 1 (exact/dynamic text) + Rule 2 (simple geometry) + Rule 3 (header technical marks, assurance icons). Coarse-grained catch-all; see RENDERING_MEDIUM_MATRIX in this file for the full per-element decomposition.',
    sourceReference: 'IDENTITY_DESKTOP_REFERENCE / IDENTITY_MOBILE_REFERENCE — frame, typography and module regions',
    concept: 'THE EVIDENCE IS IN — structural UI, dynamic record data',
    requiresPhysicalRealism: false,
    requiresExactGeometry: true,
    requiresExactText: true,
    containsDynamicData: true,
    requiresTransparency: false,
    requiresMaterialLighting: false,
    requiresReflection: false,
    requiresRefraction: false,
    requiresTexture: false,
    requiresDepth: false,
    requiresResponsiveRecomposition: true,
    compositingRole: 'STRUCTURAL_UI',
    backgroundMode: 'NOT_APPLICABLE',
    backgroundRemovalRequired: false,
    edgePolicy: 'NOT_APPLICABLE',
    shadowPolicy: 'NONE',
    generationMaster: null,
    isolationMaster: null,
    compositionMaster: null,
    desktopDerivative: null,
    mobileDerivative: null,
    emailDerivative: null,
    compositeMapDesktop: 'N/A',
    compositeMapMobile: 'N/A',
    processingHistory: [],
    generationModel: null,
    processingModel: null,
    iterationCount: 0,
    deliveryStrategy: 'Live table-safe HTML/CSS/SVG, inline styles, explicit dimensions — never rasterized. intakeReference/intakeStatusDisplay/intakeLastSavedAtDisplay/intakeCompletionPercent/ctaLabel/ctaUrl remain dynamic HTML text nodes.',
  },
];

/**
 * RENDERING MEDIUM MATRIX (§XI) — every meaningful visible element, including the fine-grained
 * HTML/CSS/SVG pieces the two CODE_NATIVE catch-all entries above summarize. Produced BEFORE
 * touching any generation/implementation this sprint, per §II (do not collapse pipeline stages).
 *
 * This is intentionally separate from INTAKE_ACCESS_PRODUCTION_MANIFEST: the manifest tracks
 * *assets with production lineage* (things that can be generated/isolated/composited), while this
 * matrix documents *every visible element's medium decision*, including elements that were never
 * candidates for generation (a headline, a divider, a progress rail).
 */
export type RenderingMediumMatrixRow = {
  element: string;
  emailFamily: 'BUILDER_INTAKE_ACCESS' | 'IDENTITY_INTAKE_ACCESS' | 'BOTH';
  referenceRegion: string;
  visualRole: string;
  renderingMedium: RenderingMedium;
  reason: string;
  requiresFal: boolean;
  requiresBackgroundRemoval: boolean;
  requiresSvgOrCodeHybrid: boolean;
  desktopStrategy: string;
  mobileStrategy: string;
};

export const INTAKE_ACCESS_RENDERING_MEDIUM_MATRIX: RenderingMediumMatrixRow[] = [
  {
    element: 'SITE 00 wordmark',
    emailFamily: 'BOTH',
    referenceRegion: 'Header, top-left',
    visualRole: 'Brand identity',
    renderingMedium: 'EXISTING_CANONICAL_ASSET',
    reason: 'Rule 1/Brand ownership — site00Wordmark() is the canonical wordmark helper already shared across every SITE 00 email family; FAL must never own exact brand geometry.',
    requiresFal: false,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: true,
    desktopStrategy: 'shared site00Wordmark(\'light\') helper',
    mobileStrategy: 'same helper, no breakpoint variation',
  },
  {
    element: 'Header technical crosshair ticks',
    emailFamily: 'BOTH',
    referenceRegion: 'Flanking the wordmark and tagline in the header row',
    visualRole: 'Technical/drafting brand accent',
    renderingMedium: 'SVG_NATIVE',
    reason: 'Rule 3 — exact vector crosshair geometry; deterministic, resolution-independent, zero-weight compared to a raster asset for a 10x10 mark.',
    requiresFal: false,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: true,
    desktopStrategy: 'intakeHeaderTick(color) inline SVG, one stone-colored left of wordmark, one accent-colored right of tagline',
    mobileStrategy: 'left tick only (right tick + tagline hidden via .intake-desktop-only)',
  },
  {
    element: 'Header tagline ("BUILDER ACCESS" / "IDENTITY ACCESS")',
    emailFamily: 'BOTH',
    referenceRegion: 'Header, right of wordmark',
    visualRole: 'Technical label',
    renderingMedium: 'HTML_TEXT',
    reason: 'Rule 1 — exact uppercase label copy.',
    requiresFal: false,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: false,
    desktopStrategy: 'inline <td> text, letter-spacing 0.1em',
    mobileStrategy: 'hidden (.intake-desktop-only) — mobile header stays minimal per reference',
  },
  {
    element: 'Vertical "BUILDER INTAKE ACCESS" / "IDENTITY INTAKE ACCESS" hero label',
    emailFamily: 'BOTH',
    referenceRegion: 'Hero, above headline',
    visualRole: 'Section label',
    renderingMedium: 'HTML_TEXT',
    reason: 'Rule 1 — exact label copy; letter-spacing/size handled by CSS_NATIVE, not a raster.',
    requiresFal: false,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: false,
    desktopStrategy: 'HTML_TEXT + CSS_NATIVE letter-spacing',
    mobileStrategy: 'same, smaller font-size via responsive rule',
  },
  {
    element: 'Headline ("THE BRIEF HAS A" / "THE EVIDENCE" + red emphasis word)',
    emailFamily: 'BOTH',
    referenceRegion: 'Hero, primary headline',
    visualRole: 'Primary message',
    renderingMedium: 'HTML_TEXT',
    reason: 'Rule 1 — exact copy; the SITE 00 red emphasis word is a <span> color override, not an image.',
    requiresFal: false,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: false,
    desktopStrategy: 'HTML_TEXT with inline <span style="color:accent">',
    mobileStrategy: 'same markup, smaller font-size',
  },
  {
    element: 'Body copy',
    emailFamily: 'BOTH',
    referenceRegion: 'Hero, below headline',
    visualRole: 'Supporting copy',
    renderingMedium: 'HTML_TEXT',
    reason: 'Rule 1 — exact copy.',
    requiresFal: false,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: false,
    desktopStrategy: 'HTML_TEXT paragraph',
    mobileStrategy: 'same',
  },
  {
    element: 'CTA button',
    emailFamily: 'BOTH',
    referenceRegion: 'Hero, below body copy',
    visualRole: 'Primary action',
    renderingMedium: 'HTML_TEXT',
    reason: 'Rule 1 (ctaLabel/ctaUrl are dynamic) + Rule 2 (button box is a simple flat rectangle) — HTML anchor + CSS_NATIVE background, never an image (avoids CTA wrapping/image-blocked failure).',
    requiresFal: false,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: false,
    desktopStrategy: 'HTML_TEXT + CSS_NATIVE (black bg for Builder, red bg for Identity, white-space:nowrap)',
    mobileStrategy: 'same, full-width block on narrow viewports',
  },
  {
    element: 'Build Brief Record / Identity File record card',
    emailFamily: 'BOTH',
    referenceRegion: 'Hero, right column card',
    visualRole: 'Dynamic record container',
    renderingMedium: 'CSS_NATIVE',
    reason: 'Rule 1 (intake ID/status/last-saved/completion are dynamic) + Rule 2 (card is a simple bordered rectangle) — must stay live HTML so intake data is never rasterized.',
    requiresFal: false,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: false,
    desktopStrategy: 'CSS_NATIVE bordered <table> card overlapping the blueprint/evidence artwork via negative margin',
    mobileStrategy: 'same card, full column width below the hero artwork',
  },
  {
    element: 'Intake ID / status / last-saved fields',
    emailFamily: 'BOTH',
    referenceRegion: 'Inside the record card',
    visualRole: 'Dynamic record fields',
    renderingMedium: 'HTML_TEXT',
    reason: 'Rule 1 — intakeReference/intakeStatusDisplay/intakeLastSavedAtDisplay are user-specific dynamic data; must never be baked into a generated image.',
    requiresFal: false,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: false,
    desktopStrategy: 'HTML_TEXT rows',
    mobileStrategy: 'same rows, stacked',
  },
  {
    element: 'Completion percentage + progress rail',
    emailFamily: 'BOTH',
    referenceRegion: 'Inside the record card',
    visualRole: 'Dynamic progress indicator',
    renderingMedium: 'CSS_NATIVE',
    reason: 'Rule 1 (intakeCompletionPercent is dynamic) + Rule 2 (progress bar is a simple flat rectangle) — width set inline from the live percentage, never an image.',
    requiresFal: false,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: false,
    desktopStrategy: 'CSS_NATIVE <td> track + inline-width fill <td>',
    mobileStrategy: 'same',
  },
  {
    element: 'Coordinate / drafting marks (Builder)',
    emailFamily: 'BUILDER_INTAKE_ACCESS',
    referenceRegion: 'Scattered across the blueprint atmosphere and frame corners',
    visualRole: 'Technical decoration',
    renderingMedium: 'SVG_NATIVE',
    reason: 'Rule 3 — exact vector geometry (crosshairs, coordinate ticks); deterministic and resolution-independent.',
    requiresFal: false,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: true,
    desktopStrategy: 'inline SVG marks positioned via CSS_NATIVE absolute/table offsets',
    mobileStrategy: 'reduced mark count to preserve typography as the dominant mobile hierarchy (§XXIX)',
  },
  {
    element: 'Assurance icons (4x, both families)',
    emailFamily: 'BOTH',
    referenceRegion: 'Assurance rail, below the hero',
    visualRole: 'Trust/reassurance iconography',
    renderingMedium: 'SVG_NATIVE',
    reason: 'Rule 3 — simple geometric icon symbols; deterministic, tiny, infinitely scalable, no photographic realism required.',
    requiresFal: false,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: true,
    desktopStrategy: 'intakeIcon() inline SVG helper in a 4-column CSS_NATIVE grid',
    mobileStrategy: 'intakeAssuranceGrid() reflows to 2x2 via mobile media query, same SVGs',
  },
  {
    element: 'Assurance copy (4x, both families)',
    emailFamily: 'BOTH',
    referenceRegion: 'Assurance rail, below each icon',
    visualRole: 'Trust/reassurance copy',
    renderingMedium: 'HTML_TEXT',
    reason: 'Rule 1 — exact copy.',
    requiresFal: false,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: false,
    desktopStrategy: 'HTML_TEXT under each icon',
    mobileStrategy: 'same, 2x2 grid',
  },
  {
    element: 'Divider / rule lines',
    emailFamily: 'BOTH',
    referenceRegion: 'Frame borders, section separators',
    visualRole: 'Structural separation',
    renderingMedium: 'CSS_NATIVE',
    reason: 'Rule 2 — simple straight lines; a border-top/border-bottom is deterministic and free, never worth a raster asset (§VII visual physics override example).',
    requiresFal: false,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: false,
    desktopStrategy: 'CSS_NATIVE border-top/border-bottom',
    mobileStrategy: 'same',
  },
  {
    element: 'Outer email frame + background field',
    emailFamily: 'BOTH',
    referenceRegion: 'Whole-document canvas',
    visualRole: 'Background/structural field',
    renderingMedium: 'CSS_NATIVE',
    reason: 'Rule 2 — flat background color/table frame; simplest deterministic medium.',
    requiresFal: false,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: false,
    desktopStrategy: 'emailDoc() shared table shell',
    mobileStrategy: 'same shell, mobile media queries in primitives.ts',
  },
  {
    element: 'Architectural building blueprint drawing (B01)',
    emailFamily: 'BUILDER_INTAKE_ACCESS',
    referenceRegion: 'Hero, right column, behind/beside the record card',
    visualRole: 'Atmospheric hero artwork',
    renderingMedium: 'FAL_GENERATED_ASSET',
    reason: 'Rule 4 — drafting-line realism, layered perspective and construction-sketch density; see manifest entry S00-EMAIL-INTAKE-BUILD-B01.',
    requiresFal: true,
    requiresBackgroundRemoval: false,
    requiresSvgOrCodeHybrid: false,
    desktopStrategy: 'cover-cropped 2x derivative, right-aligned, negative-margin overlap with the record card',
    mobileStrategy: 'independently art-directed wide/short crop, full-bleed above the headline',
  },
  {
    element: 'Identity evidence cluster (portrait + note + fingerprint + seal, I05)',
    emailFamily: 'IDENTITY_INTAKE_ACCESS',
    referenceRegion: 'Hero, right column (desktop) / full-bleed strip (mobile)',
    visualRole: 'Primary evidence-file composition',
    renderingMedium: 'DETERMINISTIC_COMPOSITE',
    reason: 'Rule 6 — locked spatial relationship between four independently generated/isolated layers; see manifest entries S00-EMAIL-INTAKE-ID-I05 / -I05-MOBILE.',
    requiresFal: true,
    requiresBackgroundRemoval: true,
    requiresSvgOrCodeHybrid: true,
    desktopStrategy: 'flattened 1000x1100 composition master, cover-cropped 2x derivative, negative-margin overlap with the record card',
    mobileStrategy: 'independently art-directed 1100x620 composition master, full-bleed above the headline',
  },
];

export function getManifestEntry(assetId: string): ProductionAssetEntry | undefined {
  return INTAKE_ACCESS_PRODUCTION_MANIFEST.find((e) => e.assetId === assetId);
}

export function generatedAssetIds(): string[] {
  return INTAKE_ACCESS_PRODUCTION_MANIFEST.filter((e) => e.classification !== 'CODE_NATIVE').map((e) => e.assetId);
}
