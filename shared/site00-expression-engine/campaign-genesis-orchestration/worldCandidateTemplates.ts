/**
 * P0.CGO.1 — Original high-yield world templates (NOT billiards copy).
 */

import type {
  AssociationChain,
  CampaignWorldCandidate,
  HumanExpressionLayer,
  ProductCategory,
  WorldCandidateTier,
} from './types.js';
import {
  buildConceptualConvergenceMap,
  computeConceptualYieldScore,
} from './conceptualYieldScore.js';

type WorldTemplate = {
  id: string;
  tier: WorldCandidateTier;
  coreConcept: string;
  title: string;
  setting: string;
  chain: AssociationChain;
  dimensions: Parameters<typeof buildConceptualConvergenceMap>[0]['dimensions'];
  humanExpression: HumanExpressionLayer;
  motifs: string[];
  props: string[];
  copy: string[];
  productIntegration: string[];
  whyItWorks: string;
  risk: CampaignWorldCandidate['risk'];
  originality: number;
};

export function generateOriginalWorlds(input: {
  brandSlug: string;
  productCategory: ProductCategory;
  brandContext?: import('../../site00-brand-lore/brandCreativeContext/types.js').BrandCreativeContext | null;
}): CampaignWorldCandidate[] {
  const templates = selectTemplates(input.brandSlug, input.productCategory, input.brandContext);
  return templates.map((t) => templateToCandidate(t, input.brandSlug, input.brandContext));
}

function selectTemplates(
  brandSlug: string,
  category: ProductCategory,
  brandContext?: import('../../site00-brand-lore/brandCreativeContext/types.js').BrandCreativeContext | null,
): WorldTemplate[] {
  if (brandSlug.includes('ndx') || brandSlug === 'ndxbook') {
    return NDXBOOK_TEMPLATES;
  }
  if (brandSlug.includes('site-00') || brandSlug === 'site00') {
    return SITE00_TEMPLATES;
  }
  if (brandSlug === 'aio' || brandSlug.includes('all-in-one')) {
    return AIO_TEMPLATES;
  }
  if (brandSlug.includes('astral')) {
    return ASTRAL_TEMPLATES;
  }
  if (category === 'HAIR' || brandSlug.includes('frontal')) {
    return FRONTAL_SLAYER_HAIR_TEMPLATES;
  }
  if (category === 'JEWELRY') {
    return JEWELRY_ORIGINAL_TEMPLATES;
  }
  if (brandContext && !brandContext.category.isUnknown) {
    return GENERAL_TEMPLATES;
  }
  return GENERAL_TEMPLATES;
}

const FRONTAL_SLAYER_HAIR_TEMPLATES: WorldTemplate[] = [
  {
    id: 'fs-wind-tunnel-commute',
    tier: 'FRESH',
    coreConcept: 'IN TRANSIT',
    title: 'IN TRANSIT',
    setting: 'SUBWAY PLATFORM / MOVING AIR',
    chain: {
      chainId: 'fs-transit',
      links: [
        { domain: 'PRODUCT', term: 'Hair', distance: 'LITERAL', rationale: 'Product' },
        { domain: 'MOTION', term: 'Wind from train arrival', distance: 'LATERAL', rationale: 'Environmental motion' },
        { domain: 'ENVIRONMENT', term: 'Transit platform', distance: 'LATERAL', rationale: 'Real location' },
        { domain: 'HUMAN_BEHAVIOR', term: 'Commute ritual', distance: 'UNEXPECTED', rationale: 'Daily life' },
        { domain: 'PHRASE', term: 'In transit', distance: 'UNEXPECTED', rationale: 'Title' },
      ],
      connectiveLogic: 'Hair → Wind → Platform → Commute → In transit',
    },
    dimensions: {
      SETTING: 'Subway platform — tile, signage, arriving train wind',
      TITLE: 'IN TRANSIT',
      COPY: 'Minimal — movement speaks',
      PROP_SYSTEM: 'Metro card, bag strap, platform edge',
      PRODUCT_ROLE: 'Hair revealed through motion — co-star not hero',
      BODY_INTERACTION: 'Head turn, hair lift from wind',
      HUMAN_BEHAVIOR: 'Waiting, boarding — not posing',
      HAIR: 'Primary campaign surface — texture in motion',
      WARDROBE: 'Commute layers — coat, scarf',
      MOTION: 'Train arrival gust, walking pace',
      SHOT_VARIETY: 'Wide platform, detail hair macro, motion blur, reflection in train window',
      TEASER_POTENTIAL: 'Hair movement before face reveal',
      REVEAL_POTENTIAL: 'Full texture payoff on platform',
      CHANNEL_ADAPTATION: 'Reel = motion; Feed = still wind moment',
    },
    humanExpression: {
      hair: ['Wind-revealed texture', 'Silhouette against platform light', 'Macro strand detail'],
      nails: ['Subtle — commuter practical'],
      makeup: ['Natural commuter — not studio glam'],
      jewelry: ['Minimal earring catch in wind'],
      wardrobe: ['Coat collar framing hair'],
      hands: ['Grip rail, hold metro card'],
      bodyLanguage: ['Weight shift, turn toward train'],
      gesture: ['Hair tuck interrupted by wind'],
      movement: ['Platform walk, boarding step'],
      attitude: ['In-between moments — lived not staged'],
    },
    motifs: ['Platform tiles', 'Wind lines', 'Yellow safety edge', 'Transit signage'],
    props: ['Metro card', 'Headphones', 'Tote bag'],
    copy: ['In transit', 'Next stop', 'Hold on'],
    productIntegration: ['Hair is the hero surface — product in motion context'],
    whyItWorks: 'Environment generates motion; hair is active campaign element; witty commute truth.',
    risk: 'MEDIUM',
    originality: 0.82,
  },
  {
    id: 'fs-elevator-mirror',
    tier: 'SAFE',
    coreConcept: 'FLOOR BY FLOOR',
    title: 'FLOOR BY FLOOR',
    setting: 'VINTAGE ELEVATOR',
    chain: {
      chainId: 'fs-elevator',
      links: [
        { domain: 'PRODUCT', term: 'Hair', distance: 'LITERAL', rationale: 'Product' },
        { domain: 'MATERIAL', term: 'Brass / copper', distance: 'LATERAL', rationale: 'Warm metal echoes tone' },
        { domain: 'ENVIRONMENT', term: 'Vintage elevator', distance: 'LATERAL', rationale: 'Confined reflective box' },
        { domain: 'GEOMETRY', term: 'Vertical lines', distance: 'LATERAL', rationale: 'Mirror panels' },
        { domain: 'PHRASE', term: 'Floor by floor', distance: 'UNEXPECTED', rationale: 'Elevator ritual' },
      ],
      connectiveLogic: 'Hair → Brass → Elevator → Vertical lines → Floor by floor',
    },
    dimensions: {
      SETTING: 'Brass elevator with mirror panels and floor indicator',
      TITLE: 'FLOOR BY FLOOR',
      PROP_SYSTEM: 'Floor dial, mirror, brass buttons',
      HAIR: 'Reflection multiples — length and shine in mirrors',
      GRAPHIC_LANGUAGE: 'Vertical lines, floor numbers',
      SHOT_VARIETY: 'Wide elevator, mirror reflection, detail floor dial, hair macro',
      TEASER_POTENTIAL: 'Floor number clue',
      REVEAL_POTENTIAL: 'Hair payoff in mirror stack',
    },
    humanExpression: {
      hair: ['Mirror stack reflections', 'Length visible in vertical panels'],
      nails: ['Hand on brass button'],
      makeup: ['Soft elevator light'],
      jewelry: [],
      wardrobe: ['Elevator-appropriate silhouette'],
      hands: ['Press floor button'],
      bodyLanguage: ['Contained space posture'],
      gesture: ['Watch floor indicator'],
      movement: ['Ascent — subtle sway'],
      attitude: ['Private public moment'],
    },
    motifs: ['Floor numbers', 'Brass', 'Mirror panels', 'Vertical lines'],
    props: ['Floor indicator', 'Brass buttons'],
    copy: ['Floor by floor', 'Going up'],
    productIntegration: ['Hair shine in warm elevator light'],
    whyItWorks: 'One location — many shot types; hair integrated through reflection geometry.',
    risk: 'LOW',
    originality: 0.75,
  },
  {
    id: 'fs-roofline-golden-hour',
    tier: 'WILD_CARD',
    coreConcept: 'LAST LIGHT LINE',
    title: 'LAST LIGHT LINE',
    setting: 'ROOFTOP PARAPET AT GOLDEN HOUR',
    chain: {
      chainId: 'fs-roofline',
      links: [
        { domain: 'PRODUCT', term: 'Hair', distance: 'LITERAL', rationale: 'Product' },
        { domain: 'GEOMETRY', term: 'Horizon line', distance: 'LATERAL', rationale: 'Visual metaphor' },
        { domain: 'ENVIRONMENT', term: 'Rooftop parapet', distance: 'UNEXPECTED', rationale: 'Height + edge' },
        { domain: 'TENSION', term: 'Last light before dark', distance: 'UNEXPECTED', rationale: 'Time pressure' },
        { domain: 'PHRASE', term: 'Last light line', distance: 'UNEXPECTED', rationale: 'Title' },
      ],
      connectiveLogic: 'Hair → Horizon → Rooftop → Last light → Last light line',
    },
    dimensions: {
      SETTING: 'Rooftop edge at golden hour — city horizon',
      TITLE: 'LAST LIGHT LINE',
      HAIR: 'Backlit halo, edge-lit strands against sky',
      MOTION: 'Wind at height',
      SHOT_VARIETY: 'Silhouette wide, backlit macro, horizon detail, wind motion',
      COLOR: 'Gold hour amber, sky gradient',
    },
    humanExpression: {
      hair: ['Backlit halo', 'Wind at height', 'Edge-lit strands'],
      nails: [],
      makeup: ['Silhouette-friendly'],
      jewelry: [],
      wardrobe: ['Wind-responsive fabric'],
      hands: ['On parapet edge'],
      bodyLanguage: ['Looking outward'],
      gesture: ['Hair lift in rooftop wind'],
      movement: ['Turn toward light'],
      attitude: ['Edge-of-day confidence'],
    },
    motifs: ['Horizon line', 'Parapet edge', 'Golden gradient', 'City grid below'],
    props: ['Parapet', 'City skyline'],
    copy: ['Last light line', 'Before dark'],
    productIntegration: ['Hair as light-catcher against sky'],
    whyItWorks: 'Wild card — high visual surprise with strong hair-as-hero logic.',
    risk: 'HIGH',
    originality: 0.88,
  },
];

const NDXBOOK_TEMPLATES: WorldTemplate[] = [
  {
    id: 'ndx-margin-notes',
    tier: 'FRESH',
    coreConcept: 'MARGIN NOTES',
    title: 'MARGIN NOTES',
    setting: 'LIBRARY TABLE / ANNOTATED BOOKS',
    chain: {
      chainId: 'ndx-margin',
      links: [
        { domain: 'PRODUCT', term: 'Brand', distance: 'LITERAL', rationale: 'NDXBOOK cultural brand' },
        { domain: 'HUMAN_BEHAVIOR', term: 'Annotating', distance: 'ADJACENT', rationale: 'Intellectual behavior' },
        { domain: 'OBJECT', term: 'Margin notes', distance: 'LATERAL', rationale: 'Visual system' },
        { domain: 'CULTURAL_REFERENCE', term: 'Reader culture', distance: 'LATERAL', rationale: 'Audience truth' },
        { domain: 'PHRASE', term: 'Margin notes', distance: 'UNEXPECTED', rationale: 'Title' },
      ],
      connectiveLogic: 'Brand → Annotating → Margin notes → Reader culture → Margin notes',
    },
    dimensions: {
      SETTING: 'Library table with annotated books, pencils, margin marks',
      TITLE: 'MARGIN NOTES',
      COPY: 'Observational, intellectual — not luxury glam',
      GRAPHIC_LANGUAGE: 'Margin marks, underlines, footnotes',
      HUMAN_BEHAVIOR: 'Reading, annotating, arguing with text',
      SHOT_VARIETY: 'Detail margins, hands writing, wide table, book stack',
    },
    humanExpression: {
      hair: ['Incidental — not beauty focus'],
      nails: ['Ink-stained optional'],
      makeup: ['Natural'],
      jewelry: ['Minimal'],
      wardrobe: ['Reader casual — intellectual'],
      hands: ['Writing in margin', 'Page turn'],
      bodyLanguage: ['Leaning into text'],
      gesture: ['Underline', 'Circle passage'],
      movement: ['Page flip'],
      attitude: ['Curious, sharp'],
    },
    motifs: ['Margin marks', 'Underlines', 'Footnotes', 'Pencil'],
    props: ['Books', 'Pencil', 'Reading glasses'],
    copy: ['Margin notes', 'See note', 'Argued elsewhere'],
    productIntegration: ['Brand as cultural commentary — not product hero'],
    whyItWorks: 'NDXBOOK observational/intellectual range — not FS hair logic.',
    risk: 'MEDIUM',
    originality: 0.8,
  },
  {
    id: 'ndx-receipt-wall',
    tier: 'SAFE',
    coreConcept: 'RECEIPT WALL',
    title: 'RECEIPT WALL',
    setting: 'STUDIO WALL OF RECEIPTS / PROOF',
    chain: {
      chainId: 'ndx-receipt',
      links: [
        { domain: 'PRODUCT', term: 'Proof', distance: 'LITERAL', rationale: 'Receipt/proof campaign' },
        { domain: 'OBJECT', term: 'Receipts', distance: 'LITERAL', rationale: 'Documentation' },
        { domain: 'ENVIRONMENT', term: 'Pinned wall', distance: 'LATERAL', rationale: 'Proof display' },
        { domain: 'PHRASE', term: 'Receipt wall', distance: 'UNEXPECTED', rationale: 'Title' },
      ],
      connectiveLogic: 'Proof → Receipts → Pinned wall → Receipt wall',
    },
    dimensions: {
      SETTING: 'Wall covered in pinned receipts, annotations, dates',
      TITLE: 'RECEIPT WALL',
      PROP_SYSTEM: 'Receipts, pins, red string optional',
      SHOT_VARIETY: 'Wide wall, detail receipt, hands pinning',
    },
    humanExpression: {
      hair: [], nails: [], makeup: [], jewelry: [], wardrobe: [],
      hands: ['Pin receipt', 'Point at date'],
      bodyLanguage: ['Examining proof'],
      gesture: ['Pin', 'Compare receipts'],
      movement: [], attitude: ['Evidence-minded'],
    },
    motifs: ['Receipts', 'Dates', 'Pins', 'Annotations'],
    props: ['Receipts', 'Push pins'],
    copy: ['Receipt wall', 'Dated', 'Proof'],
    productIntegration: ['Evidence-first — documentation campaign'],
    whyItWorks: 'NDXBOOK proof/receipt strategy alignment.',
    risk: 'LOW',
    originality: 0.7,
  },
  {
    id: 'ndx-deadpan-observation',
    tier: 'WILD_CARD',
    coreConcept: 'NOTED',
    title: 'NOTED',
    setting: 'EVERYDAY CAFE CORNER',
    chain: {
      chainId: 'ndx-deadpan',
      links: [
        { domain: 'SOCIAL_SITUATION', term: 'Overheard conversation', distance: 'LITERAL', rationale: 'Observation entry' },
        { domain: 'HUMOR', term: 'Deadpan', distance: 'LATERAL', rationale: 'Anti-campaign tone' },
        { domain: 'PHRASE', term: 'Noted', distance: 'UNEXPECTED', rationale: 'One-word title' },
      ],
      connectiveLogic: 'Overheard → Deadpan → Noted',
    },
    dimensions: {
      SETTING: 'Cafe corner — mundane, not styled',
      TITLE: 'NOTED',
      COPY: 'One word or none',
      HUMAN_BEHAVIOR: 'Observational — not performing',
    },
    humanExpression: {
      hair: [], nails: [], makeup: [], jewelry: [], wardrobe: ['Mundane'],
      hands: ['Coffee cup'], bodyLanguage: ['Slouched listen'],
      gesture: ['Pen tap'], movement: [], attitude: ['Deadpan wit'],
    },
    motifs: ['Coffee cup', 'Notebook', 'Overheard'],
    props: ['Coffee', 'Notebook'],
    copy: ['Noted.', 'Hm.'],
    productIntegration: ['Cultural observation — minimal product'],
    whyItWorks: 'NDXBOOK deadpan/social observation wild card.',
    risk: 'EXPERIMENTAL' as CampaignWorldCandidate['risk'],
    originality: 0.85,
  },
];

const JEWELRY_ORIGINAL_TEMPLATES: WorldTemplate[] = [
  {
    id: 'jewelry-vanity-ritual',
    tier: 'FRESH',
    coreConcept: 'ALMOST READY',
    title: 'ALMOST READY',
    setting: 'VANITY MIRROR / PRE-DEPARTURE',
    chain: {
      chainId: 'jewelry-vanity',
      links: [
        { domain: 'PRODUCT', term: 'Jewelry', distance: 'LITERAL', rationale: 'Product' },
        { domain: 'RITUAL', term: 'Last look', distance: 'ADJACENT', rationale: 'Departure ritual' },
        { domain: 'ENVIRONMENT', term: 'Vanity', distance: 'LATERAL', rationale: 'Intimate setting' },
        { domain: 'TENSION', term: 'Almost late', distance: 'UNEXPECTED', rationale: 'Behavioral tension' },
        { domain: 'PHRASE', term: 'Almost ready', distance: 'UNEXPECTED', rationale: 'Title' },
      ],
      connectiveLogic: 'Jewelry → Last look → Vanity → Almost late → Almost ready',
    },
    dimensions: {
      SETTING: 'Vanity with mirror, scattered objects, warm light',
      TITLE: 'ALMOST READY',
      PRODUCT_ROLE: 'Final piece being added — not yet complete',
      BODY_INTERACTION: 'Hands adjusting earring / clasp',
      NAILS: 'Visible in mirror detail',
      SHOT_VARIETY: 'Mirror reflection, hands detail, vanity wide, partial face',
    },
    humanExpression: {
      hair: ['Incidental in mirror'], nails: ['Detail in reflection'],
      makeup: ['In-progress — not finished'], jewelry: ['Being placed'],
      wardrobe: ['Half-dressed'], hands: ['Clasp earring', 'Adjust necklace'],
      bodyLanguage: ['Rushed elegance'], gesture: ['One last look'],
      movement: ['Turn from mirror'], attitude: ['Departure energy'],
    },
    motifs: ['Mirror', 'Scattered objects', 'Warm bulb', 'Clock'],
    props: ['Vanity items', 'Clock', 'Clutch'],
    copy: ['Almost ready', 'One sec'],
    productIntegration: ['Jewelry as final ritual step'],
    whyItWorks: 'Original jewelry world — not billiards. Ritual tension drives shots.',
    risk: 'MEDIUM',
    originality: 0.78,
  },
];

const SITE00_TEMPLATES: WorldTemplate[] = [
  {
    id: 'site00-bench-session',
    tier: 'SAFE',
    coreConcept: 'ON THE BENCH',
    title: 'ON THE BENCH',
    setting: 'PROJECT WORKSPACE / ACTIVE PIECE',
    chain: {
      chainId: 'site00-bench',
      links: [
        { domain: 'PRODUCT', term: 'Website creation', distance: 'LITERAL', rationale: 'SITE 00 offer' },
        { domain: 'ENVIRONMENT', term: 'Workbench', distance: 'LITERAL', rationale: 'Workspace canon' },
        { domain: 'HUMAN_BEHAVIOR', term: 'Active production', distance: 'ADJACENT', rationale: 'Founder workflow' },
        { domain: 'PHRASE', term: 'On the bench', distance: 'UNEXPECTED', rationale: 'Title' },
      ],
      connectiveLogic: 'Website creation → Workbench → Active production → On the bench',
    },
    dimensions: {
      SETTING: 'Bright minimal workspace with active piece dominant',
      TITLE: 'ON THE BENCH',
      COLOR: 'White + red accent',
      SHOT_VARIETY: 'Bench wide, active piece detail, review tray',
    },
    humanExpression: {
      hair: [], nails: [], makeup: [], jewelry: [], wardrobe: ['Founder-director practical'],
      hands: ['Inspect artifact', 'Move piece on bench'],
      bodyLanguage: ['Director posture'], gesture: ['Approve', 'Revise'],
      movement: ['Shift focus between bench zones'], attitude: ['Production-focused'],
    },
    motifs: ['Bench', 'Active piece', 'Red accent', 'Review tray'],
    props: ['Artifacts', 'Production notes'],
    copy: ['On the bench', 'Active piece'],
    productIntegration: ['Process access — show how sites get made'],
    whyItWorks: 'SITE 00 digital location + production methodology — not client brand expression.',
    risk: 'LOW',
    originality: 0.75,
  },
];

const AIO_TEMPLATES: WorldTemplate[] = [
  {
    id: 'aio-dispatch-dawn',
    tier: 'SAFE',
    coreConcept: 'DISPATCH AT DAWN',
    title: 'DISPATCH AT DAWN',
    setting: 'DISPATCH DESK / EARLY MORNING ROAD',
    chain: {
      chainId: 'aio-dispatch',
      links: [
        { domain: 'PRODUCT', term: 'Dispatching', distance: 'LITERAL', rationale: 'Core service' },
        { domain: 'ENVIRONMENT', term: 'Dispatch desk', distance: 'LITERAL', rationale: 'Operations' },
        { domain: 'HUMAN_BEHAVIOR', term: 'Route planning', distance: 'ADJACENT', rationale: 'Professional behavior' },
        { domain: 'PHRASE', term: 'Dispatch at dawn', distance: 'UNEXPECTED', rationale: 'Title' },
      ],
      connectiveLogic: 'Dispatching → Dispatch desk → Route planning → Dispatch at dawn',
    },
    dimensions: {
      SETTING: 'Dispatch desk with maps, radios, compliance docs',
      TITLE: 'DISPATCH AT DAWN',
      SHOT_VARIETY: 'Desk detail, road wide, hands on radio',
    },
    humanExpression: {
      hair: [], nails: [], makeup: [], jewelry: [], wardrobe: ['Professional operations'],
      hands: ['Mark route', 'Radio check'],
      bodyLanguage: ['Focused operator'], gesture: ['Point at map'],
      movement: ['Walk to truck'], attitude: ['Road-ready professional'],
    },
    motifs: ['Radio', 'Route map', 'Compliance stamp'],
    props: ['Clipboard', 'Permit folder'],
    copy: ['Dispatch at dawn', 'Road ready'],
    productIntegration: ['Service operations — permitting/dispatch proof'],
    whyItWorks: 'AIO operational positioning — not luxury editorial.',
    risk: 'LOW',
    originality: 0.72,
  },
];

const ASTRAL_TEMPLATES: WorldTemplate[] = [
  {
    id: 'aw-coffee-astrea',
    tier: 'FRESH',
    coreConcept: 'COFFEE IN ASTRÉA',
    title: 'COFFEE IN ASTRÉA',
    setting: 'ASTRÉA COFFEE SHOP / READER PRESENCE',
    chain: {
      chainId: 'aw-coffee',
      links: [
        { domain: 'PRODUCT', term: 'Reader platform', distance: 'LITERAL', rationale: 'Astral offer' },
        { domain: 'ENVIRONMENT', term: 'Coffee shop', distance: 'LITERAL', rationale: 'Canonical world' },
        { domain: 'SOCIAL_SITUATION', term: 'Joinable table', distance: 'LATERAL', rationale: 'Social experience' },
        { domain: 'PHRASE', term: 'Coffee in Astréa', distance: 'UNEXPECTED', rationale: 'Title' },
      ],
      connectiveLogic: 'Reader platform → Coffee shop → Joinable table → Coffee in Astréa',
    },
    dimensions: {
      SETTING: 'Magical coffee shop with reader avatars at tables',
      TITLE: 'COFFEE IN ASTRÉA',
      SHOT_VARIETY: 'Wide shop, table detail, tarot card glimpse',
    },
    humanExpression: {
      hair: ['Reader avatar styling'], nails: [], makeup: [], jewelry: [],
      wardrobe: ['Ethereal reader fashion'],
      hands: ['Hold cup', 'Turn tarot card'],
      bodyLanguage: ['Social presence'], gesture: ['Wave to friend'],
      movement: ['Enter shop'], attitude: ['Intimate magical social'],
    },
    motifs: ['Coffee steam', 'Tarot edge', 'Purple light'],
    props: ['Cup', 'Tarot deck'],
    copy: ['Coffee in Astréa', 'Join table'],
    productIntegration: ['Reader social experience — immersive world'],
    whyItWorks: 'Astral World themed environments + reader presence — not commerce hair logic.',
    risk: 'MEDIUM',
    originality: 0.82,
  },
];

const GENERAL_TEMPLATES: WorldTemplate[] = FRONTAL_SLAYER_HAIR_TEMPLATES.slice(0, 2);

function templateToCandidate(
  t: WorldTemplate,
  brandSlug: string,
  brandContext?: import('../../site00-brand-lore/brandCreativeContext/types.js').BrandCreativeContext | null,
): CampaignWorldCandidate {
  const convergence = buildConceptualConvergenceMap({
    centralIdea: t.coreConcept,
    dimensions: t.dimensions,
  });
  return {
    candidateId: `${brandSlug}-${t.id}`,
    tier: t.tier,
    coreConcept: t.coreConcept,
    campaignTitleLanguage: t.title,
    setting: t.setting,
    associationChain: t.chain,
    convergenceMap: convergence,
    conceptualYield: computeConceptualYieldScore(convergence),
    brandFit: 0.8,
    originality: t.originality,
    humanExpression: t.humanExpression,
    productIntegration: t.productIntegration,
    motifs: t.motifs,
    copyLanguage: t.copy,
    propSystem: t.props,
    risk: t.risk,
    whyItWorks: brandContext
      ? buildContextAwareWhyItWorks(t.whyItWorks, brandContext)
      : t.whyItWorks,
  };
}

function buildContextAwareWhyItWorks(
  base: string,
  ctx: import('../../site00-brand-lore/brandCreativeContext/types.js').BrandCreativeContext,
): string {
  const specifics: string[] = [];
  if (ctx.experiencePrinciples.value?.[0]) specifics.push(ctx.experiencePrinciples.value[0]!);
  if (ctx.visualIdentity.recurringSignatures.value?.[0]) specifics.push(ctx.visualIdentity.recurringSignatures.value[0]!);
  if (ctx.worldBuilding.locations.value?.[0]) specifics.push(ctx.worldBuilding.locations.value[0]!);
  if (!specifics.length) return base;
  return `${base} Specifically for ${ctx.brandName}: ${specifics.slice(0, 2).join(' + ')}.`;
}
