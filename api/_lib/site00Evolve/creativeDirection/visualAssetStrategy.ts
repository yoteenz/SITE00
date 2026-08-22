/**
 * NDXBOOK Creative Direction — Visual Asset Strategy
 *
 * This module is the "strategy first" artifact required before any FAL dispatch:
 * for each of the three locked territories it defines the photographic / graphic /
 * texture language, subject treatment, and how that language flexes across the five
 * NDXBOOK launch volumes while staying recognizably one brand.
 *
 * It also defines the curated set of production-grade generation briefs used by
 * assetGeneration.ts. Nothing here calls FAL directly — this is pure creative
 * direction data + prompt construction, reused by the governed generation module.
 */

import type { TerritoryRendererKey, TerritorySpecimenType } from './types.js';

export const NDXBOOK_VOLUMES = ['MONEY', 'BODY', 'MIND', 'TECH', 'CONSUMER'] as const;
export type NdxbookVolume = (typeof NDXBOOK_VOLUMES)[number];

export type CreativeAssetAspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';

export type TerritoryVisualStrategy = {
  territoryKey: TerritoryRendererKey;
  thesis: string;
  photographicLanguage: string;
  graphicLanguage: string;
  illustrationLanguage: string;
  textureMaterial: string;
  subjectTreatment: string;
  scale: string;
  framing: string;
  depth: string;
  lighting: string;
  contrast: string;
  visualMetaphorSystem: string;
  imageTypographyRelationship: string;
  taxonomyRelationship: string;
  volumeTreatment: Record<NdxbookVolume, string>;
  crossVolumeConsistency: string;
  prohibitedCliches: string[];
};

/**
 * The full five-volume visual strategy per territory. Only a subset of these are
 * currently backed by generated imagery (see NDXBOOK_CREATIVE_ASSET_BRIEFS below) —
 * the remainder document how the language extends so the system is provably
 * multi-volume even where a real asset has not yet been produced/approved.
 */
export const TERRITORY_VISUAL_STRATEGY: Record<TerritoryRendererKey, TerritoryVisualStrategy> = {
  index_signal: {
    territoryKey: 'index_signal',
    thesis: 'NDXBOOK as a living indexed knowledge archive — every page is a catalogued, cross-referenced artifact.',
    photographicLanguage:
      'Documentary macro still life. Real physical index artifacts photographed close, never staged as generic stock photography.',
    graphicLanguage:
      'Registration marks, coordinate rules, archive stamps, cross-reference lines — always thin, precise, monochrome-first with a single signal-red accent.',
    illustrationLanguage:
      'None as a primary device — diagrams only, drawn as technical annotation over photography, never decorative illustration.',
    textureMaterial: 'Uncoated paper, archival card stock, thread/string cross-references, light film grain, subtle scan artifacts.',
    subjectTreatment:
      'The subject is always a physical, indexable object (a document, a card, a folded paper, a measuring instrument) — never a person, never a screen.',
    scale: 'Macro to close-up — the object fills the frame; the viewer reads it like an artifact under glass.',
    framing: 'Tight, deliberate crops with generous top or side margin reserved for index numerals and metadata.',
    depth: 'Shallow depth of field — one plane in sharp focus, everything else falls to soft blur, like a loupe over a catalog card.',
    lighting: 'Flat, even, slightly cool daylight — archival reading-room light, no drama, no warm glow.',
    contrast: 'High tonal contrast, near-monochrome with a single spot of accent red where a stamp or tab would sit.',
    visualMetaphorSystem: 'The page/volume/chapter coordinate system made physical — every image looks like it has a catalog number.',
    imageTypographyRelationship:
      'Typography sits ON the artifact, like a registration stamp or catalog label — never floating over empty sky.',
    taxonomyRelationship: 'Each volume gets its own physical artifact type so the archive metaphor stays literal, not just color-coded.',
    volumeTreatment: {
      MONEY: 'Financial paper artifacts — statement fragments, receipt edges, a credit card corner — cropped so no real numbers/PII are legible.',
      BODY: 'Clinical/health reference artifacts — an anatomy chart fragment, a measuring tape coil, an index tab labeled by body system.',
      MIND: 'Annotated notebook and psychology reference pages — margin notes, underlines, a dog-eared page corner.',
      TECH: 'Technical schematic fragments and spec-sheet paper — grid paper, a punch-card-like index tab, wire-bound edge.',
      CONSUMER: 'Product spec cards and warranty/receipt paper — a price tag string, a product index card.',
    },
    crossVolumeConsistency: 'Same macro-photography treatment, same registration-mark graphic system, same monochrome+accent palette — only the physical artifact subject changes per volume.',
    prohibitedCliches: [
      'government form aesthetics',
      'spreadsheet/database UI',
      'generic brutalist web design',
      'sterile SaaS dashboard imagery',
      'stock photography of people pointing at charts',
    ],
  },
  editorial_utility: {
    territoryKey: 'editorial_utility',
    thesis: 'NDXBOOK as a premium modern publication — a media brand people actually want to read, not an explainer template.',
    photographicLanguage:
      'Art-directed conceptual still life, commissioned-magazine quality — one strong subject, considered styling, never a decorative stock photo.',
    graphicLanguage: 'Section dividers, volume color ribbons, chapter chips, pull-quote rules — restrained, never busy.',
    illustrationLanguage: 'Editorial illustration used sparingly for abstract concepts (e.g. a debt-payoff timeline), rendered with warm linework, never cartoonish.',
    textureMaterial: 'Warm matte paper tone, soft studio shadow, subtle print-inspired grain — the feeling of a physical page, not a screen.',
    subjectTreatment:
      'One clear conceptual subject per image, styled and lit like a commissioned editorial shoot for the specific topic — object-led, not lifestyle-model-led.',
    scale: 'Generous, feature-opener scale — the image is allowed to dominate the page, with the headline sharing the frame.',
    framing: 'Wide, breathable crops with deliberate negative space reserved for a headline or deck.',
    depth: 'Soft, shallow depth — a single hero object sharp against a softly blurred styled surface.',
    lighting: 'Warm, directional studio light with soft shadow — inviting, confident, never harsh or clinical.',
    contrast: 'Moderate contrast, warm neutral palette, volume accent used only as a small color band, never as an overlay wash.',
    visualMetaphorSystem: 'Every image should read as "the object this article is actually about," styled the way a serious magazine would style it.',
    imageTypographyRelationship: 'Serif/display headline shares the frame with the image — image and headline are laid out together as one composed page, not stacked as separate blocks.',
    taxonomyRelationship: 'Volume color ribbon plus subject choice signal the volume; layout grammar (headline + deck + hero image) stays constant across volumes.',
    volumeTreatment: {
      MONEY: 'Considered financial still life — a wallet, folded bills, a calculator, or a credit card laid with intent, warm directional light, no visible account numbers.',
      BODY: 'Editorial wellness still life — a stethoscope, running shoes, a glass of water and vitamins styled like a health-feature shoot, not a stock-wellness cliché.',
      MIND: 'Conceptual still life for psychology topics — a notebook and pen, a chessboard mid-game, light through a window onto a desk.',
      TECH: 'Considered device/object still life — a phone face-down on a desk with warm light, cables coiled with intent, never a generic "hands on laptop" stock shot.',
      CONSUMER: 'Styled product-choice still life — a shopping bag, price tags, a small considered array of products, warm flat-lay light.',
    },
    crossVolumeConsistency: 'Same commissioned-photography styling, same warm light and shallow depth, same headline/deck/hero layout grammar — only subject and accent ribbon color shift per volume.',
    prohibitedCliches: [
      'generic wellness magazine gloss',
      'Medium/Substack template look',
      'corporate explainer graphics',
      'lifestyle-blog softness with smiling stock models',
      'childish educational clip-art',
    ],
  },
  kinetic_field: {
    territoryKey: 'kinetic_field',
    thesis: 'NDXBOOK as a modern knowledge signal moving through culture — motion-native, dark-field, controlled energy.',
    photographicLanguage: 'None as photography for its own sake — imagery here is dimensional/abstract, built to imply motion in a static frame.',
    graphicLanguage: 'Sculptural oversized kinetic type/numerals as the dominant subject, paired with a small system of layered illuminated index-card or ledger-tab planes stacked in depth — never generic converging light rays, never a starburst node, never a fiber-optic bundle.',
    illustrationLanguage: 'Abstract dimensional graphics built from stacked, backlit paper/card planes and torn ledger edges — a physical, indexable object made luminous — never literal icons, never generic 3D renders, never a particle/light-trail mesh.',
    textureMaterial: 'Deep near-black field, soft volumetric light falloff on physical card/paper edges, occasional fine grain — feels like a title card from a well-produced knowledge film, not a screensaver or a startup keynote slide.',
    subjectTreatment: 'The subject is the concept itself made kinetic — an oversized numeral or word mid-transition, a stack of illuminated index tabs resolving into order — never a literal object photo, and never a generic glowing-line abstraction.',
    scale: 'Oversized, cropped — type and forms bleed past the frame edge to imply continued motion off-canvas.',
    framing: 'Asymmetric hook zones — one dominant diagonal or directional axis per frame, frame-edge crops instead of centered compositions.',
    depth: 'Layered z-axis — a dark background field, a midground signal/graphic layer, and a foreground kinetic type or number.',
    lighting: 'Single controlled light source or glow, directional, with real falloff — never a flat neon wash.',
    contrast: 'High contrast dark field with one accent hue glow; light is used sparingly and with purpose, not as decoration.',
    visualMetaphorSystem: 'Financial/knowledge state-change made visual — thresholds crossing, numbers resolving, signal locking in.',
    imageTypographyRelationship: 'Type is a physical object in the depth field — it sits in front of or behind the graphic layer, never simply overlaid flat on top.',
    taxonomyRelationship: 'Volume is expressed as an accent-hue shift on the same dark field and signal grammar — never a different composition system.',
    volumeTreatment: {
      MONEY: 'A number resolving from red to a settled state — balance/debt visual state-change, directional light implying "before/after."',
      BODY: 'A pulse/vital-signal line resolving into a steady rhythm — heartbeat-like signal geometry in the dark field.',
      MIND: 'A scattered node field converging into a single clear point — cognitive clarity made kinetic.',
      TECH: 'Sharp signal geometry — clean directional lines and a resolving node, precise and controlled, never cluttered.',
      CONSUMER: 'A choice-field of directional marks narrowing to one highlighted path — decision clarity made kinetic.',
    },
    crossVolumeConsistency: 'Same dark field, same layered depth, same single-accent-glow discipline, same type-in-depth grammar — only the accent hue and signal motif shift per volume.',
    prohibitedCliches: [
      'generic cyberpunk neon',
      'gaming UI / HUD overlays',
      'crypto aesthetic',
      'random glowing blobs',
      'noisy motion-graphics clutter',
      'generic AI-startup abstract mesh',
      'converging fiber-optic light rays to a single point',
      'lens-flare starburst',
      'digital rain / falling numerals matrix effect',
      'particle-burst screensaver',
      'generic SaaS keynote abstract background',
    ],
  },
};

export type CreativeAssetBrief = {
  briefId: string;
  territoryKey: TerritoryRendererKey;
  specimenType: TerritorySpecimenType;
  volume: NdxbookVolume;
  role: 'PAGE_001_PRIMARY' | 'PAGE_001_SECONDARY' | 'VOLUME_PROOF' | 'TEXTURE_MATERIAL';
  aspectRatio: CreativeAssetAspectRatio;
  subject: string;
  visualMetaphor: string;
  composition: string;
  crop: string;
  lighting: string;
  materialLanguage: string;
  cameraPerspective: string;
  negativeSpaceRequirement: string;
  textSafeZone: string;
  realismLevel: string;
};

function prohibitedForTerritory(key: TerritoryRendererKey): string[] {
  return TERRITORY_VISUAL_STRATEGY[key].prohibitedCliches;
}

/** Builds the full territory-specific, NDXBOOK-specific FAL prompt from a structured brief. */
export function buildGenerationPrompt(brief: CreativeAssetBrief): { prompt: string; negativePrompt: string } {
  const strategy = TERRITORY_VISUAL_STRATEGY[brief.territoryKey];
  const prompt = [
    `Subject: ${brief.subject}`,
    `Visual metaphor: ${brief.visualMetaphor}`,
    `Composition: ${brief.composition}`,
    `Crop: ${brief.crop}`,
    `Camera perspective: ${brief.cameraPerspective}`,
    `Lighting: ${brief.lighting}`,
    `Material / texture language: ${brief.materialLanguage}`,
    `Territory visual language: ${strategy.photographicLanguage} ${strategy.contrast}`,
    `Negative space requirement: ${brief.negativeSpaceRequirement}`,
    `Text-safe zone: ${brief.textSafeZone}`,
    `Realism / stylization level: ${brief.realismLevel}`,
    'No rendered words, letters, numerals, logos, watermarks, or captions anywhere in the image unless they are illegible incidental texture on a physical prop.',
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
  ].join(', ');

  return { prompt, negativePrompt };
}

/**
 * Curated production set for this pass — the specimens most affected by
 * "placeholder gray box" / "wireframe" symptoms in the approved structural
 * baseline. Four per territory: the territory's Page 001 treatment(s) plus
 * at least one additional-volume proof and one texture/material specimen,
 * so the system demonstrates real imagery beyond MONEY without requiring
 * a full 5-volume x 3-territory generation run in a single pass.
 */
export const NDXBOOK_CREATIVE_ASSET_BRIEFS: CreativeAssetBrief[] = [
  // ---------------------------------------------------------------- INDEX SIGNAL
  {
    briefId: 'index_signal.page_001_indexed',
    territoryKey: 'index_signal',
    specimenType: 'page_001_indexed',
    volume: 'MONEY',
    role: 'PAGE_001_PRIMARY',
    aspectRatio: '3:4',
    subject:
      'A single cropped fragment of a folded financial statement and a plain credit card laid at a slight diagonal on uncoated archival card stock, alongside a short length of red cross-reference thread pinned at one corner.',
    visualMetaphor: 'The credit-score topic treated as a catalogued, indexable physical document — knowledge you can file, not a scary bill.',
    composition: 'Macro still life, one dominant diagonal formed by the statement edge, thread crossing it at a shallow angle, deliberate empty margin along the top third.',
    crop: 'Tight three-quarter portrait crop, object bleeding softly off the left and bottom edges.',
    lighting: 'Flat, even, cool archival reading-room light with a single soft shadow beneath the card.',
    materialLanguage: 'Uncoated paper grain, matte plastic card edge, fine cotton thread, very light film grain.',
    cameraPerspective: 'Overhead macro, near-flat lay, slight tilt for dynamism.',
    negativeSpaceRequirement: 'Reserve the top ~30% of the frame as clean, low-detail card stock for an index numeral and metadata line.',
    textSafeZone: 'Top third and a narrow strip along the left edge must stay low-contrast and uncluttered.',
    realismLevel: 'Photoreal macro photography, archival document texture, no illustration.',
  },
  {
    briefId: 'index_signal.cross_reference_map',
    territoryKey: 'index_signal',
    specimenType: 'cross_reference_map',
    volume: 'MONEY',
    role: 'TEXTURE_MATERIAL',
    aspectRatio: '16:9',
    subject:
      'Several archival index cards and a torn receipt edge fanned out on a light table, connected by taut red thread between three brass paper fasteners, viewed close.',
    visualMetaphor: 'Cross-referencing as a literal, physical filing act — the thread is the "link" between page, chapter and volume.',
    composition: 'Wide horizontal macro spread, thread lines forming a loose triangular network across the frame, cards overlapping at controlled angles.',
    crop: 'Wide crop with generous negative space on the right third.',
    lighting: 'Cool, even light-table glow from below plus soft top fill — no harsh shadows.',
    materialLanguage: 'Uncoated card stock, brass fastener texture, cotton thread, faint paper dust.',
    cameraPerspective: 'Low, near-eye-level macro across the surface of the light table.',
    negativeSpaceRequirement: 'Right third of frame kept clear card-stock surface for an overlaid diagram.',
    textSafeZone: 'Right third and a thin strip along the bottom.',
    realismLevel: 'Photoreal macro still life.',
  },
  {
    briefId: 'index_signal.social_knowledge_card_916',
    territoryKey: 'index_signal',
    specimenType: 'social_knowledge_card_916',
    volume: 'BODY',
    role: 'VOLUME_PROOF',
    aspectRatio: '9:16',
    subject:
      'A folded anatomical reference chart fragment and a cloth measuring tape coiled beside it, resting on a plain index card, photographed close in vertical format.',
    visualMetaphor: 'The BODY volume as a physical, indexable clinical reference artifact — precise, not alarming.',
    composition: 'Tall vertical macro composition, measuring tape coil forming a soft spiral in the lower half, chart fragment occupying the upper half at a slight angle.',
    crop: 'Full-bleed vertical 9:16 crop, tight on the two objects.',
    lighting: 'Flat, cool, even archival light matching the Index Signal territory language.',
    materialLanguage: 'Coated chart paper, woven cloth tape, matte card stock edge.',
    cameraPerspective: 'Overhead macro, near-flat lay.',
    negativeSpaceRequirement: 'Top fifth of the frame reserved as clean card stock for a rotated index numeral.',
    textSafeZone: 'Top fifth and bottom eighth of frame.',
    realismLevel: 'Photoreal macro photography.',
  },
  {
    briefId: 'index_signal.feed_index_tile',
    territoryKey: 'index_signal',
    specimenType: 'feed_index_tile',
    volume: 'MIND',
    role: 'VOLUME_PROOF',
    aspectRatio: '1:1',
    subject:
      'A well-worn spiral notebook page corner with dense handwritten margin annotations and a single underline, photographed extremely close, one plain index tab visible at the edge.',
    visualMetaphor: 'The MIND volume as an annotated, cross-referenced personal notebook — thinking made indexable.',
    composition: 'Square macro crop centered on the annotated corner, spiral binding visible along one edge for texture.',
    crop: 'Tight square crop, page corner filling most of the frame.',
    lighting: 'Flat, even, slightly warm reading-lamp light (still restrained, not golden-hour warm).',
    materialLanguage: 'Uncoated notebook paper with visible fiber texture, ballpoint ink, metal spiral binding.',
    cameraPerspective: 'Near-overhead macro, slight angle to show page texture.',
    negativeSpaceRequirement: 'Bottom-left quarter kept low-detail for a small stamp-style label.',
    textSafeZone: 'Bottom-left quarter of frame.',
    realismLevel: 'Photoreal macro photography.',
  },

  // ------------------------------------------------------------ EDITORIAL UTILITY
  {
    briefId: 'editorial_utility.page_001_editorial',
    territoryKey: 'editorial_utility',
    specimenType: 'page_001_editorial',
    volume: 'MONEY',
    role: 'PAGE_001_PRIMARY',
    aspectRatio: '3:4',
    subject:
      'A worn leather wallet lying open beside a small stack of folded bills and a single credit card, styled with intent on a warm neutral surface, as if commissioned for a serious personal-finance feature.',
    visualMetaphor: 'Credit score and debt payoff reframed as a calm, commissioned editorial subject rather than a scary warning graphic.',
    composition: 'Feature-opener still life, subject grouped in the lower two-thirds, generous clean surface in the upper third for a headline.',
    crop: 'Portrait crop with soft vignette at the edges, hero object sharply in focus.',
    lighting: 'Warm, directional studio light from the upper left with a soft, controlled shadow to the right.',
    materialLanguage: 'Worn leather grain, linen surface texture, matte paper bills, soft studio shadow.',
    cameraPerspective: 'Slightly elevated three-quarter angle, not flat overhead — gives the still life editorial depth.',
    negativeSpaceRequirement: 'Upper third of frame kept clean and low-contrast for a serif headline and deck line.',
    textSafeZone: 'Upper third of the frame.',
    realismLevel: 'Photoreal commissioned-editorial still life photography.',
  },
  {
    briefId: 'editorial_utility.feature_article_opener',
    territoryKey: 'editorial_utility',
    specimenType: 'feature_article_opener',
    volume: 'MONEY',
    role: 'PAGE_001_SECONDARY',
    aspectRatio: '4:3',
    subject:
      'A close, warmly lit shot of a hand-written budgeting notebook open beside a calculator, styled as a considered editorial companion image to a credit-score feature.',
    visualMetaphor: 'The practical, non-preachy tools of debt payoff — calm competence rather than anxiety.',
    composition: 'Wide feature-opener still life, notebook and calculator arranged along a soft diagonal, right third left clear for a pull quote.',
    crop: 'Landscape crop, subject occupying the left two-thirds.',
    lighting: 'Warm, soft directional light, gentle falloff toward the right third.',
    materialLanguage: 'Paper grain, brushed-metal calculator edge, linen tablecloth texture.',
    cameraPerspective: 'Three-quarter angle, slightly elevated.',
    negativeSpaceRequirement: 'Right third of the frame kept clean for a pull-quote panel.',
    textSafeZone: 'Right third of the frame.',
    realismLevel: 'Photoreal commissioned-editorial still life photography.',
  },
  {
    briefId: 'editorial_utility.social_carousel_cover',
    territoryKey: 'editorial_utility',
    specimenType: 'social_carousel_cover',
    volume: 'TECH',
    role: 'VOLUME_PROOF',
    aspectRatio: '9:16',
    subject:
      'A smartphone resting face-down on a warm wooden desk beside a neatly coiled charging cable, soft window light, styled as an editorial companion image for a TECH-volume carousel.',
    visualMetaphor: 'Technology treated as a calm, considered editorial subject rather than a generic "hands on laptop" stock cliché.',
    composition: 'Vertical carousel-cover still life, phone placed off-center along a soft diagonal, upper half left clean for a headline.',
    crop: 'Full-bleed vertical 9:16 crop.',
    lighting: 'Soft natural window light from the side, warm and even.',
    materialLanguage: 'Matte phone back, warm wood grain, woven cable texture.',
    cameraPerspective: 'Three-quarter elevated angle.',
    negativeSpaceRequirement: 'Upper half of frame kept clean for a headline.',
    textSafeZone: 'Upper half of the frame.',
    realismLevel: 'Photoreal commissioned-editorial still life photography.',
  },
  {
    briefId: 'editorial_utility.instagram_feed_tile',
    territoryKey: 'editorial_utility',
    specimenType: 'instagram_feed_tile',
    volume: 'CONSUMER',
    role: 'VOLUME_PROOF',
    aspectRatio: '1:1',
    subject:
      'A small, considered flat-lay of a shopping receipt curling at the edge beside two neutral price tags on a warm surface, styled for a CONSUMER-volume feed tile.',
    visualMetaphor: 'Everyday consumer decisions treated with the same editorial care as a finance or health feature — practical, not preachy.',
    composition: 'Square flat-lay, receipt and tags arranged along a gentle diagonal with balanced negative space in one corner.',
    crop: 'Tight square crop.',
    lighting: 'Warm, soft, even flat-lay light.',
    materialLanguage: 'Thermal receipt paper texture, matte cardstock tags, warm linen surface.',
    cameraPerspective: 'Near-overhead flat lay.',
    negativeSpaceRequirement: 'One corner (roughly a quarter of the frame) kept clean for a small label.',
    textSafeZone: 'Bottom-left quarter of the frame.',
    realismLevel: 'Photoreal commissioned-editorial flat-lay photography.',
  },

  // -------------------------------------------------------------- KINETIC FIELD
  {
    briefId: 'kinetic_field.hook_frame_916',
    territoryKey: 'kinetic_field',
    specimenType: 'hook_frame_916',
    volume: 'MONEY',
    role: 'PAGE_001_PRIMARY',
    aspectRatio: '9:16',
    subject:
      'One oversized, sculptural numeral "7" rendered as a solid dimensional object with a matte charcoal surface, lit from a single low warm-red side light on its left face and cooling to a calm blue-white on its right face, floating in a deep near-black field. A short stack of three backlit index-card tabs is wedged at its base, glowing faintly from within like paper held up to a light table.',
    visualMetaphor: 'A credit score in the physical instant it resolves from alarm-red to settled-calm — rendered as one solid, indexable numeral object, not a screen effect.',
    composition: 'Vertical hook-frame composition, the numeral occupies the upper two-thirds at a slight confident tilt, its own cast shadow falling toward the lower-left, index-card tabs anchoring the base.',
    crop: 'Full-bleed vertical 9:16, the numeral cropped tight at the top edge to imply it continues off-frame.',
    lighting: 'Two-source controlled light: warm red key on one face, cool blue-white rim on the other, real falloff into the dark field — no flat neon wash, no glow halo around the whole object.',
    materialLanguage: 'Matte charcoal solid surface with visible sculptural facets, thin uncoated card-stock tabs, fine film grain — no glass, no chrome, no glossy plastic.',
    cameraPerspective: 'Slightly low, dramatic hero angle on the solid numeral object, like a product shot of a physical sculpture, not an abstract camera-less composition.',
    negativeSpaceRequirement: 'Lower third of frame kept dark and low-detail for a bold kinetic headline.',
    textSafeZone: 'Lower third of the frame.',
    realismLevel: 'Stylized dimensional object render, cinematic title-card quality, sculptural and physical rather than a light-particle effect.',
  },
  {
    briefId: 'kinetic_field.page_001_kinetic',
    territoryKey: 'kinetic_field',
    specimenType: 'page_001_kinetic',
    volume: 'MONEY',
    role: 'PAGE_001_SECONDARY',
    aspectRatio: '9:16',
    subject:
      'A short stack of five backlit index-card tabs of increasing size, fanned upward in depth like a physical ledger, the topmost tab glowing brightest as if it just resolved into focus, set in a near-black field with a single cool accent glow from behind the stack.',
    visualMetaphor: 'A confusing score resolving into one clear, filed, indexable card — clarity as a physical object coming into focus, not a light burst.',
    composition: 'Vertical composition with a clear z-axis: dark background field, the fanned card stack rising through the midground, the brightest resolved tab in the upper third.',
    crop: 'Full-bleed vertical 9:16, the card stack cropped at the lower edge to imply it continues off-frame.',
    lighting: 'Single cool backlight glowing through the topmost card edge, soft falloff onto the cards beneath it, no ambient glow wash.',
    materialLanguage: 'Uncoated card stock with visible fiber texture and thin backlit edges, fine grain — physical paper made luminous, not glass or plastic.',
    cameraPerspective: 'Close three-quarter angle on the physical card stack, implied depth via the fan of overlapping tabs.',
    negativeSpaceRequirement: 'Lower half of frame kept dark and clear for stacked numeral/typography.',
    textSafeZone: 'Lower half of the frame.',
    realismLevel: 'Stylized dimensional object render, cinematic title-card quality, physical card materiality rather than an abstract light effect.',
  },
  {
    briefId: 'kinetic_field.signal_graphic',
    territoryKey: 'kinetic_field',
    specimenType: 'signal_graphic',
    volume: 'TECH',
    role: 'VOLUME_PROOF',
    aspectRatio: '16:9',
    subject:
      'A row of eight thin backlit index tabs of varying height, like an equalizer built from physical ledger tabs, one tab on the right third standing taller and glowing distinctly brighter than the rest, set in a near-black field.',
    visualMetaphor: 'The TECH volume as clean, resolving signal made from the same indexable-card language as the rest of the system — precision and control, not clutter, and never a generic light-mesh graphic.',
    composition: 'Wide horizontal composition, the row of tabs crossing the lower half of the frame left to right, the one standout tab positioned in the right third.',
    crop: 'Full-bleed 16:9, tabs cropped at the left edge to imply the row continues off-frame.',
    lighting: 'Single cool backlight through the standout tab, soft even glow on the rest, controlled falloff, no lens flare.',
    materialLanguage: 'Thin uncoated card stock with backlit edges, fine grain, no glass or chrome.',
    cameraPerspective: 'Low, near-eye-level on the row of physical tabs, implied depth via overlap and size variation.',
    negativeSpaceRequirement: 'Upper half of frame kept sparse and dark for overlaid typography.',
    textSafeZone: 'Upper half of the frame.',
    realismLevel: 'Stylized dimensional object render, sharp and controlled, physical card materiality rather than an abstract light-mesh effect.',
  },
  {
    briefId: 'kinetic_field.dark_light_inversion',
    territoryKey: 'kinetic_field',
    specimenType: 'dark_light_inversion',
    volume: 'BODY',
    role: 'VOLUME_PROOF',
    aspectRatio: '16:9',
    subject:
      'A thin pulse/vital-signal line moving across a near-black field, starting irregular on the left and resolving into a steady, even rhythm on the right, with a single warm-cool accent glow at the resolution point.',
    visualMetaphor: 'The BODY volume as a vital-signal line finding a steady rhythm — calm clarity, not clinical anxiety.',
    composition: 'Wide horizontal composition, pulse line as the dominant graphic element, irregular-to-steady left-to-right motion.',
    crop: 'Full-bleed 16:9, line cropped at both edges to imply continuation.',
    lighting: 'Single accent glow at the point the rhythm steadies, soft falloff elsewhere.',
    materialLanguage: 'Deep near-black field, thin luminous line work, fine grain.',
    cameraPerspective: 'Abstract dimensional composition, implied depth via subtle layered glow.',
    negativeSpaceRequirement: 'Top third of frame kept dark and clear for overlaid typography.',
    textSafeZone: 'Top third of the frame.',
    realismLevel: 'Stylized dimensional abstract graphic, cinematic and controlled, not photoreal.',
  },
];
