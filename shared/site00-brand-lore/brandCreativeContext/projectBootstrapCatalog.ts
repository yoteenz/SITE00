/**
 * P0.CBI.1 — Canonical project bootstrap sources (distilled, not dumped).
 * Data derived from actual SITE 00 project sources — UNKNOWN where not evidenced.
 */

import ndxbookHandoff from '../../../docs/studio-world/ndxbook/NDXBOOK_SITE00_HANDOFF.json';
import { AIO_BRAND_FAMILY } from '../projectSkin/brandFamily/registry.js';
import { buildProjectWorkspaceBible } from '../projectWorkspace/projectWorkspaceBible.js';
import type { BrandOfferContext, BrandCreativeBoundary } from './types.js';
import { field, sourceRef, unknownField } from './fieldHelpers.js';

export type ProjectBootstrapSlice = {
  brandId: string;
  brandName: string;
  category: ReturnType<typeof field<string | null>>;
  positioning: ReturnType<typeof field<string | null>>;
  brandPromise: ReturnType<typeof field<string | null>>;
  brandLore: ReturnType<typeof field<string | null>>;
  differentiation: ReturnType<typeof field<string | null>>;
  audiencePrimary: ReturnType<typeof field<string | null>>;
  audienceSecondary: ReturnType<typeof field<string | null>>;
  audienceAge: ReturnType<typeof field<string | null>>;
  productsServices: ReturnType<typeof field<string[]>>;
  offers: BrandOfferContext[];
  pricePositioning: ReturnType<typeof field<string | null>>;
  visualPalette: ReturnType<typeof field<string[]>>;
  visualSignatures: ReturnType<typeof field<string[]>>;
  toneTraits: ReturnType<typeof field<string[]>>;
  toneAvoid: ReturnType<typeof field<string[]>>;
  experiencePrinciples: ReturnType<typeof field<string[]>>;
  worldLocations: ReturnType<typeof field<string[]>>;
  worldLore: ReturnType<typeof field<string | null>>;
  nonNegotiables: ReturnType<typeof field<string[]>>;
  doNotUse: ReturnType<typeof field<string[]>>;
  boundaries: BrandCreativeBoundary[];
  currentObjectives: ReturnType<typeof field<string[]>>;
};

function fsBootstrap(): ProjectBootstrapSlice {
  const regRef = sourceRef('PROJECT_REGISTRY', 'api/_lib/site00Projects/projectRegistry.ts', ['category', 'positioning']);
  const adapterRef = sourceRef('PROJECT_IDENTITY', 'shared/site00-projects/adapters/frontalSlayerProjectAdapter.ts', ['brandPromise', 'tagline']);
  const familyRef = sourceRef('BRAND_FAMILY', 'shared/site00-brand-lore/projectSkin/brandFamily/registry.ts', ['category', 'visual']);
  const productRef = sourceRef('PRODUCT_SERVICE', 'shared/frontal-slayer-product-assets/contract/types.ts', ['offers']);

  return {
    brandId: 'frontal-slayer',
    brandName: 'FRONTAL SLAYER',
    category: field('Luxury raw human hair / beauty commerce', 'MEDIUM', [familyRef, regRef]),
    positioning: field(
      'Flagship commerce and immersive Mansion experience brand — woman-centered luxury positioning',
      'MEDIUM',
      [regRef, adapterRef],
    ),
    brandPromise: field('BEAUTY BEHAVES DIFFERENTLY HERE.', 'HIGH', [adapterRef]),
    brandLore: field(
      'Commerce + Mansion experience — salon-at-home transformation, education, community ecosystem',
      'MEDIUM',
      [regRef, adapterRef],
    ),
    differentiation: field(
      'Luxury raw human hair with signature unit catalog, phone/salon-at-home experience, immersive Mansion world',
      'MEDIUM',
      [productRef, regRef],
    ),
    audiencePrimary: unknownField<string | null>(null),
    audienceSecondary: unknownField<string | null>(null),
    audienceAge: unknownField<string | null>(null),
    productsServices: field(
      ['Raw human hair units', 'Build-A-Wig configuration', 'Product page color derivatives', 'Mansion / showroom experience'],
      'MEDIUM',
      [productRef],
    ),
    offers: [
      {
        offerId: 'fs-build-a-wig',
        name: 'Build-A-Wig',
        type: 'PRODUCT',
        status: 'ACTIVE',
        priority: 'HERO',
        priceTier: field('Luxury tier', 'MEDIUM', [productRef]),
        campaignEligible: true,
        constraints: ['Do not create new SKUs in campaign without approval'],
      },
      {
        offerId: 'fs-product-page',
        name: 'Product Page Heroes',
        type: 'PRODUCT',
        status: 'ACTIVE',
        priority: 'HERO',
        priceTier: field('Luxury tier', 'MEDIUM', [productRef]),
        campaignEligible: true,
        constraints: ['Do not alter face/skin in product photo'],
      },
      {
        offerId: 'fs-mansion',
        name: 'Desktop Mansion Experience',
        type: 'EXPERIENCE',
        status: 'ACTIVE',
        priority: 'STANDARD',
        priceTier: unknownField<string | null>(null),
        campaignEligible: true,
        constraints: [],
      },
    ],
    pricePositioning: field('Luxury / raw Cambodian high-end positioning', 'LOW', [productRef]),
    visualPalette: field(['White', 'Red accent', 'Chrome'], 'LOW', [familyRef]),
    visualSignatures: field(['Luxury editorial', 'Immersive Mansion environments', 'White/chrome/red luxury language'], 'LOW', [familyRef, regRef]),
    toneTraits: field(['Luxury', 'Direct', 'Intimate when appropriate'], 'LOW', [adapterRef]),
    toneAvoid: field(['Generic SaaS visuals', 'Category-generic beauty clichés'], 'MEDIUM', [adapterRef]),
    experiencePrinciples: field(
      ['Salon-at-home transformation', 'Phone-first commerce experience', 'Education for beginners', 'Community / membership ecosystem'],
      'LOW',
      [regRef],
    ),
    worldLocations: field(['Mansion', 'Showroom', 'Salon-at-home'], 'MEDIUM', [regRef, productRef]),
    worldLore: field('Immersive Mansion world — rewards, Slay Cam, education surfaces', 'LOW', [regRef]),
    nonNegotiables: field(
      ['Do not change logo', 'Do not alter face/skin in product photo', 'Do not break Mansion world continuity', 'Do not use generic SaaS visuals'],
      'HIGH',
      [productRef],
    ),
    doNotUse: field(['Generic wig brand language', 'Interchangeable luxury hair clichés'], 'MEDIUM', [familyRef]),
    boundaries: [
      { rule: 'Do not create new SKUs in campaign', scope: 'PRODUCT', severity: 'BLOCK', reason: 'Product catalog authority', source: 'PRODUCT_SERVICE' },
      { rule: 'Do not change logo', scope: 'VISUAL', severity: 'BLOCK', reason: 'Brand identity lock', source: 'PROJECT_IDENTITY' },
      { rule: 'Do not alter face/skin in product photo', scope: 'VISUAL', severity: 'BLOCK', reason: 'Product integrity', source: 'PRODUCT_SERVICE' },
      { rule: 'Do not break brand world', scope: 'WORLD', severity: 'BLOCK', reason: 'Mansion continuity', source: 'PROJECT_LORE' },
    ],
    currentObjectives: field(['Pre-launch commerce + Mansion experience'], 'MEDIUM', [regRef]),
  };
}

function ndxbookBootstrap(): ProjectBootstrapSlice {
  const handoff = ndxbookHandoff as {
    brand?: { positioning?: string; promise?: string; description?: string };
    voice?: { traits?: string[]; avoid?: string[]; copyBehavior?: string[] };
    taxonomy?: Record<string, string>;
    founderConfirmed?: { targetAudience?: string; primaryObjective?: string };
  };
  const handoffRef = sourceRef('CONTENT_BRAIN', 'docs/studio-world/ndxbook/NDXBOOK_SITE00_HANDOFF.json', ['identity', 'voice', 'audience']);
  const familyRef = sourceRef('BRAND_FAMILY', 'shared/site00-brand-lore/projectSkin/brandFamily/registry.ts', ['visual']);

  return {
    brandId: 'ndxbook',
    brandName: 'NDXBOOK',
    category: field('Educational media / cultural observation', 'HIGH', [handoffRef]),
    positioning: field(handoff.brand?.positioning ?? null, handoff.brand?.positioning ? 'HIGH' : 'UNKNOWN', [handoffRef]),
    brandPromise: field(handoff.brand?.promise ?? null, handoff.brand?.promise ? 'HIGH' : 'UNKNOWN', [handoffRef]),
    brandLore: field(
      handoff.brand?.description ?? null,
      handoff.brand?.description ? 'HIGH' : 'UNKNOWN',
      [handoffRef],
    ),
    differentiation: field(
      'Index for everyday knowledge — chapter/volume structure, concept-first editorial methodology, receipt/contradiction logic',
      'HIGH',
      [handoffRef],
    ),
    audiencePrimary: field(
      handoff.founderConfirmed?.targetAudience ?? null,
      handoff.founderConfirmed?.targetAudience ? 'HIGH' : 'UNKNOWN',
      [handoffRef],
    ),
    audienceSecondary: unknownField<string | null>(null),
    audienceAge: field('UNSPECIFIED / EVIDENCE_TO_BE_LEARNED', 'HIGH', [handoffRef]),
    productsServices: field(
      ['Short-form pages (volumes/chapters)', 'Multi-platform distribution derivatives', 'Instagram pilot pipeline'],
      'HIGH',
      [handoffRef],
    ),
    offers: [
      {
        offerId: 'ndx-instagram-pilot',
        name: 'Instagram Content Pilot',
        type: 'SERVICE',
        status: 'LAUNCH',
        priority: 'HERO',
        priceTier: unknownField<string | null>(null),
        campaignEligible: true,
        constraints: [],
      },
    ],
    pricePositioning: unknownField<string | null>(null),
    visualPalette: field(['#6366F1', '#0F172A', '#F8FAFC'], 'LOW', [handoffRef]),
    visualSignatures: field(['Editorial', 'Intelligent', 'High contrast', 'Slightly mysterious'], 'LOW', [handoffRef, familyRef]),
    toneTraits: field(handoff.voice?.traits ?? [], handoff.voice?.traits?.length ? 'HIGH' : 'UNKNOWN', [handoffRef]),
    toneAvoid: field(handoff.voice?.avoid ?? [], handoff.voice?.avoid?.length ? 'HIGH' : 'UNKNOWN', [handoffRef]),
    experiencePrinciples: field(
      handoff.voice?.copyBehavior ?? ['Short hooks', 'Fast explanations', 'Specific examples'],
      'HIGH',
      [handoffRef],
    ),
    worldLocations: field(['Volumes', 'Chapters', 'Pages'], 'HIGH', [handoffRef]),
    worldLore: field('Indexed educational universe — Money, Body, Mind, Tech, Consumer volumes', 'HIGH', [handoffRef]),
    nonNegotiables: field(
      ['No preachy or fearmongering tone', 'Concept-first — not visual template cloning', 'Receipt/contradiction logic preserved'],
      'HIGH',
      [handoffRef],
    ),
    doNotUse: field(['Hair/beauty category language', 'Generic luxury editorial'], 'HIGH', [handoffRef]),
    boundaries: [
      { rule: 'Do not use hair/beauty visual grammar', scope: 'VISUAL', severity: 'BLOCK', reason: 'Category firewall', source: 'PROJECT_LORE' },
      { rule: 'Do not clone reference environments literally', scope: 'CAMPAIGN', severity: 'WARN', reason: 'Learn mechanisms not locations', source: 'APPROVED_REFERENCE' },
    ],
    currentObjectives: field(
      [handoff.founderConfirmed?.primaryObjective ?? 'Launch awareness via Instagram pilot'],
      'HIGH',
      [handoffRef],
    ),
  };
}

function site00Bootstrap(): ProjectBootstrapSlice {
  const bible = buildProjectWorkspaceBible();
  const bibleRef = sourceRef('PROJECT_BIBLE', 'shared/site00-brand-lore/projectWorkspace/projectWorkspaceBible.ts', ['experience']);
  const regRef = sourceRef('PROJECT_REGISTRY', 'motherboard/CORE.md', ['positioning']);

  return {
    brandId: 'site-00',
    brandName: 'SITE 00',
    category: field('Digital location / website creation platform', 'HIGH', [bibleRef, regRef]),
    positioning: field('Active project workspace where work is made, inspected, revised, approved', 'HIGH', [bibleRef]),
    brandPromise: field('Digital location — system/host identity for client website creation', 'MEDIUM', [regRef]),
    brandLore: field(bible.workspaceThesis, 'HIGH', [bibleRef]),
    differentiation: field('Host/client firewall — SITE 00 owns workspace grammar; client expression inhabits surfaces', 'HIGH', [bibleRef]),
    audiencePrimary: field('Founders and clients building websites', 'MEDIUM', [regRef]),
    audienceSecondary: unknownField<string | null>(null),
    audienceAge: unknownField<string | null>(null),
    productsServices: field(['IDNTY intake', 'Builder', 'Evolve creative systems', 'Production pipeline'], 'MEDIUM', [regRef]),
    offers: [
      {
        offerId: 'site00-platform',
        name: 'SITE 00 Platform',
        type: 'SERVICE',
        status: 'ACTIVE',
        priority: 'HERO',
        priceTier: unknownField<string | null>(null),
        campaignEligible: true,
        constraints: ['Do not express client brand as SITE 00 host canon'],
      },
    ],
    pricePositioning: unknownField<string | null>(null),
    visualPalette: field(['Bright minimal', 'Red accent'], 'MEDIUM', [regRef]),
    visualSignatures: field(['Asymmetric hierarchy', 'Artifact-driven composition', 'No equal-card dashboard'], 'HIGH', [bibleRef]),
    toneTraits: field(['Direct', 'System-aware', 'Production-focused'], 'MEDIUM', [bibleRef]),
    toneAvoid: field(['Client brand voice leaking into host expression'], 'HIGH', [bibleRef]),
    experiencePrinciples: field(
      [...bible.interactionGrammar.slice(0, 4), 'Mobile: one dominant object; desktop: layered evidence'],
      'HIGH',
      [bibleRef],
    ),
    worldLocations: field(['Project workspace', 'Bench', 'Review tray', 'Dossier'], 'HIGH', [bibleRef]),
    worldLore: field('Digital location metaphor — production command center', 'MEDIUM', [bibleRef]),
    nonNegotiables: field(
      ['Host/client firewall', 'Client expression cannot mutate workspace canon', 'No fabricated project data'],
      'HIGH',
      [bibleRef],
    ),
    doNotUse: field(['Generic SaaS dashboard visuals', 'Client brand canon as host expression'], 'HIGH', [bibleRef]),
    boundaries: [
      { rule: 'Do not express client brand as SITE 00 host', scope: 'GLOBAL', severity: 'BLOCK', reason: 'Host/client firewall', source: 'PROJECT_BIBLE' },
    ],
    currentObjectives: field(['Website creation + production methodology'], 'MEDIUM', [regRef]),
  };
}

function aioBootstrap(): ProjectBootstrapSlice {
  const regRef = sourceRef('PROJECT_REGISTRY', 'api/_lib/site00Projects/projectRegistry.ts', ['category', 'services']);
  const familyRef = sourceRef('BRAND_FAMILY', 'shared/site00-brand-lore/projectSkin/brandFamily/registry.ts', ['visual']);

  return {
    brandId: 'aio',
    brandName: 'ALL IN ONE ENTERPRISES',
    category: field('Trucking business services / logistics', 'HIGH', [regRef, familyRef]),
    positioning: field('Trucking and logistics managed brand — core service operations active', 'HIGH', [regRef]),
    brandPromise: field('Operational / road-ready professional business identity', 'MEDIUM', [regRef]),
    brandLore: field(AIO_BRAND_FAMILY.description, 'MEDIUM', [familyRef]),
    differentiation: field('Woman-owned professional services — permitting, brokerage, dispatching, compliance', 'MEDIUM', [regRef]),
    audiencePrimary: field('Trucking operators and fleet owners needing back-office support', 'LOW', [regRef]),
    audienceSecondary: unknownField<string | null>(null),
    audienceAge: unknownField<string | null>(null),
    productsServices: field(
      ['Permitting', 'Brokerage', 'Dispatching', 'Compliance', 'Bookkeeping', 'Insurance / factoring'],
      'MEDIUM',
      [regRef],
    ),
    offers: [
      { offerId: 'aio-permitting', name: 'Permitting', type: 'SERVICE', status: 'ACTIVE', priority: 'HERO', priceTier: unknownField(null), campaignEligible: true, constraints: [] },
      { offerId: 'aio-dispatch', name: 'Dispatching', type: 'SERVICE', status: 'ACTIVE', priority: 'HERO', priceTier: unknownField(null), campaignEligible: true, constraints: [] },
      { offerId: 'aio-social', name: 'Social Marketing', type: 'SERVICE', status: 'DEFERRED', priority: 'LOW', priceTier: unknownField(null), campaignEligible: false, constraints: ['DEFERRED_BY_OWNER — not current offer'] },
    ],
    pricePositioning: unknownField<string | null>(null),
    visualPalette: field(['#1f4fd6', 'Gold family (distinct from Studio World)'], 'LOW', [familyRef]),
    visualSignatures: field(['Operational command', 'Professional', 'Road-ready'], 'MEDIUM', [familyRef]),
    toneTraits: field(['Professional', 'Relatable', 'Documentary when appropriate'], 'MEDIUM', [regRef]),
    toneAvoid: field(['Luxury editorial', 'Beauty/hair language', 'High-concept art house'], 'MEDIUM', [familyRef]),
    experiencePrinciples: field(['Service operations first', 'Social marketing deferred by owner'], 'HIGH', [regRef]),
    worldLocations: field(['Road', 'Dispatch desk', 'Compliance office'], 'LOW', [regRef]),
    worldLore: unknownField<string | null>(null),
    nonNegotiables: field(['Do not campaign deferred social marketing as current'], 'HIGH', [regRef]),
    doNotUse: field(['Generic luxury visuals', 'NDXBOOK editorial grammar'], 'MEDIUM', [familyRef]),
    boundaries: [
      { rule: 'Do not campaign deferred offers as current', scope: 'CAMPAIGN', severity: 'BLOCK', reason: 'Offer accuracy', source: 'PRODUCT_SERVICE' },
    ],
    currentObjectives: field(['Core service operations'], 'HIGH', [regRef]),
  };
}

function astralBootstrap(): ProjectBootstrapSlice {
  const routesRef = sourceRef('PROJECT_LORE', 'shared/site00-astral-world/routes.ts', ['world']);
  const familyRef = sourceRef('BRAND_FAMILY', 'shared/site00-brand-lore/projectSkin/brandFamily/registry.ts', ['visual']);

  return {
    brandId: 'astral-world',
    brandName: 'ASTRAL WORLD',
    category: field('Reader platform / themed immersive worlds', 'MEDIUM', [familyRef]),
    positioning: field('Immersive magical social reader experience', 'MEDIUM', [familyRef]),
    brandPromise: field('Themed worlds with reader presence and social experience', 'LOW', [routesRef]),
    brandLore: field('Astréa district — tarot, mall, coffee shop environments', 'MEDIUM', [routesRef]),
    differentiation: field('Reader platform with social presence — not commerce-first', 'MEDIUM', [familyRef]),
    audiencePrimary: unknownField<string | null>(null),
    audienceSecondary: unknownField<string | null>(null),
    audienceAge: unknownField<string | null>(null),
    productsServices: field(['Reader accounts', 'Themed world exploration', 'Social presence'], 'LOW', [routesRef]),
    offers: [
      { offerId: 'aw-reader-platform', name: 'Reader Platform', type: 'EXPERIENCE', status: 'ACTIVE', priority: 'HERO', priceTier: unknownField(null), campaignEligible: true, constraints: [] },
    ],
    pricePositioning: unknownField<string | null>(null),
    visualPalette: field(['#7b4fd4', 'Purple ethereal family'], 'MEDIUM', [familyRef]),
    visualSignatures: field(['Ethereal portal', 'Mystic reader platform', 'Art house cinematic'], 'MEDIUM', [familyRef]),
    toneTraits: field(['Mysterious', 'Intimate', 'Magical'], 'LOW', [familyRef]),
    toneAvoid: field(['Operational/logistics language', 'Generic SaaS'], 'MEDIUM', [familyRef]),
    experiencePrinciples: field(['Immersive exploration', 'Reader social presence', 'Joinable destinations'], 'MEDIUM', [routesRef]),
    worldLocations: field(['Astréa', 'Tarot suite', 'Astral mall', 'Coffee shop'], 'MEDIUM', [routesRef]),
    worldLore: field('Themed worlds with reader presence — prototype fixtures, replaceable', 'LOW', [routesRef]),
    nonNegotiables: field(['Preserve magical/social positioning', 'Do not import commerce-brand grammar'], 'MEDIUM', [familyRef]),
    doNotUse: field(['Hair/beauty visuals', 'Trucking operational grammar'], 'MEDIUM', [familyRef]),
    boundaries: [
      { rule: 'Do not break immersive world continuity', scope: 'WORLD', severity: 'WARN', reason: 'World integrity', source: 'PROJECT_LORE' },
    ],
    currentObjectives: field(['Reader platform experience'], 'LOW', [routesRef]),
  };
}

const BOOTSTRAP_BY_BRAND: Record<string, () => ProjectBootstrapSlice> = {
  'frontal-slayer': fsBootstrap,
  ndxbook: ndxbookBootstrap,
  'site-00': site00Bootstrap,
  site00: site00Bootstrap,
  aio: aioBootstrap,
  'all-in-one-enterprises': aioBootstrap,
  'astral-world': astralBootstrap,
};

export function getProjectBootstrap(brandId: string): ProjectBootstrapSlice | null {
  const fn = BOOTSTRAP_BY_BRAND[brandId.toLowerCase()];
  return fn ? fn() : null;
}

export function listBootstrappedBrandIds(): string[] {
  return ['frontal-slayer', 'ndxbook', 'site-00', 'aio', 'astral-world'];
}
