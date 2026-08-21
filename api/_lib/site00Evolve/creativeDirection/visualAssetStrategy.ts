/**
 * NDXBOOK Creative Direction — Visual Asset Strategy (reference-locked pass)
 *
 * Territory-native photographic/graphic/material language for each of the three
 * founder-approved reference boards (Editorial Utility / SIGNAL LIME, Index Signal /
 * ELECTRIC COBALT, Kinetic Field / rose-orange-purple motion field). This is the
 * "strategy first" artifact required before any FAL dispatch — see
 * docs/site00/CREATIVE_DIRECTION_METHODOLOGY.md and
 * docs/studio-world/ndxbook/NDXBOOK_CD_REFERENCE_DECOMPOSITION.md for the full
 * per-asset manifest this strategy implements.
 *
 * Nothing here calls FAL directly — this is pure creative-direction data + prompt
 * construction, consumed by generateNdxbookAssets.mjs.
 */

import type { TerritoryRendererKey, TerritorySpecimenType, BackgroundTreatment, FidelityMode } from './types.js';

export type CreativeAssetAspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';

export type TerritoryVisualStrategy = {
  territoryKey: TerritoryRendererKey;
  thesis: string;
  photographicLanguage: string;
  materialLanguage: string;
  lighting: string;
  accentUsage: string;
  prohibitedCliches: string[];
};

export const TERRITORY_VISUAL_STRATEGY: Record<TerritoryRendererKey, TerritoryVisualStrategy> = {
  editorial_utility: {
    territoryKey: 'editorial_utility',
    thesis: 'THE BOOK ON EVERYTHING — a modern, culturally alive publication with Burn-Book-derived attitude (annotation, receipts, redaction, artifact) matured into contemporary editorial production, never antique or archival-beige.',
    photographicLanguage: 'Contemporary editorial still-life and documentary photography — commissioned-magazine quality, one clear subject per image, styled with intent.',
    materialLanguage: 'Premium uncoated publication paper, clean torn edges, translucent tape, receipt paper, black marker, modern archive material — physical without feeling old.',
    lighting: 'Confident, even editorial studio light or clean daylight — never sepia, never candle-warm, never distressed.',
    accentUsage: 'SIGNAL LIME (#D6FF3B) used only as marker/highlight/underline/selected-state interruption against black/white/paper-neutral foundation — never a flood fill, never the dominant field color.',
    prohibitedCliches: [
      'antique parchment',
      'medieval manuscript',
      'sepia wash',
      'cottage-core scrapbook',
      'fake readable AI paragraphs',
      'excessive distressing',
      'school-project aesthetic',
      'generic Pinterest collage',
      'pink accent',
      'ecommerce layout',
      'website UI chrome',
      'vintage nostalgia treatment',
    ],
  },
  index_signal: {
    territoryKey: 'index_signal',
    thesis: 'FIND THE SIGNAL — NDX BOOK as an editorial intelligence layer over everyday life: patterns, shifts, anomalies, trajectories made visually authored, not a SaaS dashboard.',
    photographicLanguage: 'Documentary/archival still-life photography of real physical or real-world objects, interrupted by a cobalt analysis layer — never generic charts on navy cards.',
    materialLanguage: 'Archival card stock, measuring/scanning instruments, macro texture, light-based mapping, optical scan artifacts.',
    lighting: 'Flat, even, cool archival/instrument light — precise, not moody.',
    accentUsage: 'ELECTRIC COBALT (#2457F7, secondary #0EA5FF) as the proprietary signal color on a graphite/instrument-white/ice foundation — distinct from Editorial\u2019s lime.',
    prohibitedCliches: [
      'generic SaaS dashboard',
      'fintech app UI',
      'cyan-on-navy cliche',
      'random stock chart',
      'generic HUD',
      'gamer interface',
      'Matrix digital rain',
      'meaningless numbers',
    ],
  },
  kinetic_field: {
    territoryKey: 'kinetic_field',
    thesis: 'INFORMATION IN MOTION — choices produce momentum, ideas collide, culture shifts; each still image is a frozen frame from a named motion principle (attraction, collision, flow, trajectory, compression, convergence), never decorative neon.',
    photographicLanguage: 'Stylized dimensional render / sculptural object photography implying motion — never a literal photo, never a generic light-particle wallpaper.',
    materialLanguage: 'Matte sculptural surfaces, directional motion-blur streaks, controlled light falloff, deep near-black field.',
    lighting: 'Single or dual controlled directional light sources with real falloff into the dark field — never a flat neon wash, never a lens-flare starburst.',
    accentUsage: 'Rose (#FF2E7E), orange (#FF7A2E) and deep purple (#5B21B6) used across the *kinetic spectrum* depending on the motion principle in play — never one flat purple gradient applied uniformly.',
    prohibitedCliches: [
      'generic purple gradient wallpaper',
      'screensaver',
      'gaming wallpaper',
      'random neon ribbons',
      'cyberpunk city',
      'generic particle-burst wallpaper',
      'static decorative glow with no named motion principle',
    ],
  },
};

export type CreativeAssetBrief = {
  briefId: string;
  territoryKey: TerritoryRendererKey;
  specimenType: TerritorySpecimenType;
  role: 'HERO_TILE' | 'ISOLATED_PROP';
  aspectRatio: CreativeAssetAspectRatio;
  subject: string;
  composition: string;
  lighting: string;
  materialLanguage: string;
  cameraPerspective: string;
  backgroundTreatment: BackgroundTreatment;
  fidelityMode: FidelityMode;
  negativeSpaceRequirement: string;
};

function prohibitedForTerritory(key: TerritoryRendererKey): string[] {
  return TERRITORY_VISUAL_STRATEGY[key].prohibitedCliches;
}

/** Builds the full production-spec FAL prompt from a structured brief — no "generate a magazine page" shorthand. */
export function buildGenerationPrompt(brief: CreativeAssetBrief): { prompt: string; negativePrompt: string } {
  const strategy = TERRITORY_VISUAL_STRATEGY[brief.territoryKey];
  const isolation =
    brief.backgroundTreatment === 'REMOVE_BACKGROUND' || brief.backgroundTreatment === 'MASK_AND_COMPOSITE'
      ? 'The subject must be photographed fully isolated on a plain flat white or seamless background with no visible surface/table/studio texture at all, only the subject and a soft, subtle drop shadow — this image will be background-removed and composited elsewhere, so no environment, no props outside the subject itself.'
      : 'Full-bleed background image — the subject and its environment are both part of the final composition; do not isolate.';

  const prompt = [
    `Subject: ${brief.subject}`,
    `Composition: ${brief.composition}`,
    `Camera perspective: ${brief.cameraPerspective}`,
    `Lighting: ${brief.lighting}`,
    `Material / texture language: ${brief.materialLanguage}`,
    `Territory visual language: ${strategy.photographicLanguage} ${strategy.materialLanguage}`,
    isolation,
    `Negative space requirement: ${brief.negativeSpaceRequirement}`,
    'No rendered words, letters, numerals, logos, watermarks, or captions anywhere in the image.',
    'No visible real personal information, account numbers, or fake real-world credentials.',
  ].join(' ');

  const negativePrompt = [
    ...prohibitedForTerritory(brief.territoryKey),
    'text overlays',
    'watermark',
    'logo',
    'readable numbers or personal data',
    'stock photo smiling models',
    'low resolution',
    'clip art',
    'lens flare',
    'digital HUD overlay graphics baked into the photograph',
  ].join(', ');

  return { prompt, negativePrompt };
}

/**
 * Priority production set for this reference-fidelity pass — see manifest "Production
 * priority for this sprint". Six briefs: one full-bleed hero + one isolated prop per
 * territory, chosen as the highest fidelity-risk specimens (the ones most likely to
 * still read as placeholder/wireframe rather than brand).
 */
export const NDXBOOK_PRIORITY_ASSET_BRIEFS: CreativeAssetBrief[] = [
  // --------------------------------------------------------------- EDITORIAL UTILITY
  {
    briefId: 'eu_centerfold_hero',
    territoryKey: 'editorial_utility',
    specimenType: 'branch_centerfold',
    role: 'HERO_TILE',
    aspectRatio: '3:4',
    subject:
      'A single considered editorial still life for a personal-finance feature: a worn leather wallet lying open beside a neat stack of folded bills and one plain credit card, arranged with intent on a warm neutral surface, as if shot for a serious contemporary magazine feature — not a scary warning graphic.',
    composition: 'Feature-opener still life, subject grouped in the lower two-thirds, clean surface in the upper third reserved for a headline.',
    lighting: 'Confident directional studio light from the upper left, soft controlled shadow to the right — modern, not warm-nostalgic.',
    materialLanguage: 'Worn leather grain, linen surface texture, matte paper bills, soft studio shadow, premium uncoated print feel.',
    cameraPerspective: 'Slightly elevated three-quarter angle — editorial depth, not a flat product shot.',
    backgroundTreatment: 'KEEP_BACKGROUND',
    fidelityMode: 'DIRECTED_VARIATION',
    negativeSpaceRequirement: 'Upper third of frame kept clean and low-contrast for a serif/sans headline and deck line.',
  },
  {
    briefId: 'eu_receipt_prop',
    territoryKey: 'editorial_utility',
    specimenType: 'branch_receipts',
    role: 'ISOLATED_PROP',
    aspectRatio: '3:4',
    subject:
      'A single curling thermal receipt, slightly creased and torn at the top edge, photographed close and straight-down, as physical evidence/documentation material for a modern editorial "receipts" feature.',
    composition: 'Single object, centered, slight natural curl at the bottom edge for realism.',
    lighting: 'Flat, even, neutral daylight.',
    materialLanguage: 'Thermal receipt paper texture, faint natural creasing, no printed legible text.',
    cameraPerspective: 'Overhead macro, near-flat lay.',
    backgroundTreatment: 'REMOVE_BACKGROUND',
    fidelityMode: 'DIRECTED_VARIATION',
    negativeSpaceRequirement: 'Generous margin around the object on all sides for clean background removal.',
  },

  // ------------------------------------------------------------------- INDEX SIGNAL
  {
    briefId: 'is_scan_hero',
    territoryKey: 'index_signal',
    specimenType: 'signal_scan',
    role: 'HERO_TILE',
    aspectRatio: '4:3',
    subject:
      'A quiet archival library reading room with tall shelving receding into soft cool light, photographed as a plain documentary interior with absolutely no digital graphic elements — the kind of space where NDX BOOK would go to find a signal in the noise, before any signal has been drawn onto it.',
    composition: 'Wide interior shot, shelving forming a strong receding vanishing point, generous plain negative space along the top third with nothing added there.',
    lighting: 'Flat, even, slightly cool daylight — precise archival reading-room light, no drama, no glow, no flare.',
    materialLanguage: 'Aged wood/metal shelving, paper spines, fine architectural texture. Pure, unaltered photographic plate.',
    cameraPerspective: 'Eye-level, centered vanishing point, slight wide-angle.',
    backgroundTreatment: 'KEEP_BACKGROUND',
    fidelityMode: 'DIRECTED_VARIATION',
    negativeSpaceRequirement: 'Top third of frame kept completely plain and empty — a cobalt scan-line graphic and headline will be added separately in code, so this plate must contain zero graphic overlays, zero lines, zero glow, zero lens flare of its own.',
  },
  {
    briefId: 'is_card_prop',
    territoryKey: 'index_signal',
    specimenType: 'signal_pattern',
    role: 'ISOLATED_PROP',
    aspectRatio: '4:3',
    subject:
      'A single archival index card with a punched corner and a small brass paper fastener, photographed close and straight-down, as a real physical indexing artifact.',
    composition: 'Single object, centered, slight diagonal tilt.',
    lighting: 'Flat, even, cool archival light.',
    materialLanguage: 'Uncoated card stock, brass fastener texture, no printed legible text.',
    cameraPerspective: 'Overhead macro, near-flat lay.',
    backgroundTreatment: 'REMOVE_BACKGROUND',
    fidelityMode: 'DIRECTED_VARIATION',
    negativeSpaceRequirement: 'Generous margin around the object on all sides for clean background removal.',
  },

  // ------------------------------------------------------------------ KINETIC FIELD
  {
    briefId: 'kf_push_hero',
    territoryKey: 'kinetic_field',
    specimenType: 'motion_push',
    role: 'HERO_TILE',
    aspectRatio: '4:3',
    subject:
      'A solid, sculptural human silhouette frozen mid-sprint, rendered with directional motion-blur streaks trailing behind it in rose and orange light against a deep near-black field — momentum made physical, not a literal photograph.',
    composition: 'The figure occupies the lower two-thirds at a forward-leaning angle, motion streaks trailing to the left to read as leftward momentum, dark clear space in the upper third.',
    lighting: 'Single warm rose-orange rim light on the leading edge of the figure, real falloff into the dark field — no flat neon wash.',
    materialLanguage: 'Matte sculptural surface, fine film grain, real directional blur (not a flat gradient).',
    cameraPerspective: 'Low, dramatic hero angle, like a product shot of a physical sculpture.',
    backgroundTreatment: 'KEEP_BACKGROUND',
    fidelityMode: 'DIRECTED_VARIATION',
    negativeSpaceRequirement: 'Upper third of frame kept dark and low-detail for a bold kinetic headline.',
  },
  {
    briefId: 'kf_numeral_prop',
    territoryKey: 'kinetic_field',
    specimenType: 'motion_momentum',
    role: 'ISOLATED_PROP',
    aspectRatio: '1:1',
    subject:
      'A single oversized sculptural numeral object with a matte charcoal surface, lit with a rose-to-orange gradient light wrapping one face and a deep purple glow on the other, photographed as a physical dimensional object mid-rotation.',
    composition: 'Single object, centered, slight confident tilt.',
    lighting: 'Two-source controlled light: rose-orange key on one face, deep-purple rim on the other, real falloff — no flat neon wash, no glow halo.',
    materialLanguage: 'Matte charcoal solid surface with visible sculptural facets — no glass, no chrome, no glossy plastic.',
    cameraPerspective: 'Slightly low hero angle on the solid object.',
    backgroundTreatment: 'REMOVE_BACKGROUND',
    fidelityMode: 'DIRECTED_VARIATION',
    negativeSpaceRequirement: 'Generous margin around the object on all sides for clean background removal.',
  },
];
