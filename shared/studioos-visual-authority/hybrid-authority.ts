/**
 * Page Composition Blueprint + Render-Layer Ownership + Hybrid (composite) authority — Studio OS visual authority methodology
 * (P0.JURNL.F09-SAFE-TO-SPEND.COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1).
 *
 * Known failure (JURNL F09, two rounds): the methodology defined what a territory MEANS and what the brand FEELS like, but
 * not how the page is COMPOSED nor WHICH RENDERER OWNS WHICH LAYER. The image model had to infer page architecture,
 * hierarchy, UI geometry, brand placement, navigation, typography and the signature object; it over-expanded the metaphor
 * (METAPHOR → ENTIRE PAGE) and under-delivered the product (mutated wordmark, dropped copy, invented logo geometry, blank
 * nav, concept bleed from other surfaces).
 *
 * Supersedes: A COMPLETE SUNBURST PROMPT = A COMPLETE PRODUCT AUTHORITY; IMAGE GENERATOR = SOLE RENDERER OF THE SCREEN.
 *
 * HARD RULE: AN IMAGE GENERATOR MAY CONTRIBUTE TO A PRODUCT AUTHORITY, BUT IT MAY NOT BE THE SOLE RENDERER OF PRECISION
 * PRODUCT UI. Generated art supplies art-directed visual truth; deterministic assembly renders product truth; the
 * composite authority combines both.
 */
import type { AntiAiFlag } from './creative-direction.js';
import type { CompositionTerritory } from './schema.js';

export const HYBRID_SPRINT = 'P0.JURNL.F09-SAFE-TO-SPEND.COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1' as const;
export const HYBRID_HARD_RULE = 'AN IMAGE GENERATOR MAY CONTRIBUTE TO A PRODUCT AUTHORITY, BUT IT MAY NOT BE THE SOLE RENDERER OF PRECISION PRODUCT UI.' as const;
export const METAPHOR_CONTAINMENT_RULE = 'THE METAPHOR MAY DEFINE A SIGNATURE OBJECT OR ZONE. IT SHOULD NOT AUTOMATICALLY DEFINE THE ENTIRE PAGE.' as const;

export const HYBRID_PIPELINE = [
  'STRUCTURAL TERRITORY',
  'CREATIVE DIRECTION',
  'BRAND EXPRESSION',
  'PAGE COMPOSITION BLUEPRINT',
  'RENDER-LAYER OWNERSHIP',
  'IMAGE-GENERATED ART LAYERS',
  'DETERMINISTIC UI / BRAND ASSEMBLY',
  'COMPOSITE AUTHORITY',
  'FOUNDER REVIEW',
] as const;

/** The eight execution steps (sprint §23). */
export const HYBRID_RENDERING_STEPS = [
  { step: 1, id: 'LOCK_COMPOSITION_BLUEPRINT', gate: 'checkCompositionBlueprint → BLUEPRINT_READY' },
  { step: 2, id: 'LOCK_RENDER_OWNERSHIP', gate: 'checkRenderOwnership → OWNERSHIP_READY' },
  { step: 3, id: 'GENERATE_ART_LAYERS', gate: 'RawGenerationContract (environment / signature-object / material plates only; contamination guard locked: prompt + reference + blueprint hashes)' },
  { step: 4, id: 'QA_ART_LAYERS', gate: 'GENERATOR_QA + BAKED_UI_GUARD + contamination scan → plate accepted / rejected' },
  { step: 5, id: 'ASSEMBLE_DETERMINISTIC_UI', gate: 'CompositeAssemblyContract (official logo, type system, nav, icons, exact copy, exact data, components)' },
  { step: 6, id: 'QA_EXACT_PRODUCT_TRUTH', gate: 'COMPOSITE_QA (exact logo / copy / nav / icons / CTA / value; no overflow, collisions, baked UI under live UI, doubles)' },
  { step: 7, id: 'CREATE_COMPOSITE_AUTHORITY', gate: 'checkCompositeAuthority → AUTHORITY_READY (incl. richness audit, density, 2-second product clarity)' },
  { step: 8, id: 'FOUNDER_REVIEW', gate: 'Board shows the COMPOSITE authority; raw plates appear as provenance only.' },
] as const;

/* ─────────────────────────────── canonical layer model ─────────────────────────────── */

export const COMPOSITION_LAYERS = {
  L0: 'ENVIRONMENT',
  L1: 'BRAND FRAME',
  L2: 'PRIMARY PRODUCT SIGNAL',
  L3: 'SIGNATURE PHYSICAL / GRAPHIC OBJECT',
  L4: 'SECONDARY PRODUCT MODULE',
  L5: 'ACTION / CTA',
  L6: 'SYSTEM CHROME',
  L7: 'NAVIGATION',
  L8: 'OVERLAYS / SHEETS / TRANSIENT STATES',
} as const;
export type LayerId = keyof typeof COMPOSITION_LAYERS;
export const LAYER_IDS = Object.keys(COMPOSITION_LAYERS) as LayerId[];

export const RENDER_OWNERS = ['IMAGE_GENERATOR', 'DETERMINISTIC_UI', 'DETERMINISTIC_VECTOR', 'COMPOSITE', 'NO_RENDER'] as const;
export type RenderOwner = (typeof RENDER_OWNERS)[number];

/** Precision product UI — never owned by the image generator, never baked into a plate (sprint §5). */
export const PRECISION_UI_KINDS = [
  'EXACT_COPY', 'EXACT_NUMBER', 'LOGO_GEOMETRY', 'ICON', 'NAVIGATION', 'BUTTON', 'TAB_LABEL', 'STATE_LABEL', 'STATUS_VALUE',
  'PROGRESS', 'FINANCIAL_VALUE', 'SPACING_GRID', 'INTERACTION_CHROME',
] as const;
export type PrecisionUiKind = (typeof PRECISION_UI_KINDS)[number];

/** Art-directed visual truth — what the image generator is for (sprint §6). */
export const ART_TRUTH_KINDS = [
  'ARCHITECTURE', 'LIGHTING', 'MATERIALITY', 'PAPER_OBJECT', 'FOLDER', 'ENVELOPE', 'STONE_STRUCTURE', 'BRANDED_PHYSICAL_METAPHOR',
  'SCENE_DEPTH', 'SHADOW', 'ENVIRONMENTAL_FOLIAGE', 'TACTILE_OBJECT',
] as const;
export type ArtTruthKind = (typeof ART_TRUTH_KINDS)[number];

/** Layers whose content is product truth: their owner must be deterministic. */
export const DETERMINISTIC_LAYERS: readonly LayerId[] = ['L2', 'L4', 'L5', 'L6', 'L7'];

/* ─────────────────────────────── page composition blueprint ─────────────────────────────── */

export const ZONE_ROLES = [
  'SYSTEM_STATUS', 'SYSTEM_CHROME', 'BRAND_FRAME', 'PRIMARY_SIGNAL', 'SIGNATURE_OBJECT', 'SECONDARY_PRODUCT', 'CTA', 'NAV',
  'ENVIRONMENT', 'PERIMETER', 'NEGATIVE_SPACE', 'OVERLAY',
] as const;
export type ZoneRole = (typeof ZONE_ROLES)[number];
export const REQUIRED_ZONE_ROLES: readonly ZoneRole[] = ['SYSTEM_CHROME', 'BRAND_FRAME', 'PRIMARY_SIGNAL', 'SIGNATURE_OBJECT', 'SECONDARY_PRODUCT', 'CTA', 'NAV', 'ENVIRONMENT', 'PERIMETER', 'NEGATIVE_SPACE'];
/** Product zones must never collide with system chrome / nav / status. */
export const PRODUCT_ZONE_ROLES: readonly ZoneRole[] = ['BRAND_FRAME', 'PRIMARY_SIGNAL', 'SECONDARY_PRODUCT', 'CTA'];
export const SYSTEM_ZONE_ROLES: readonly ZoneRole[] = ['SYSTEM_STATUS', 'SYSTEM_CHROME', 'NAV'];

export const METAPHOR_SCOPES = ['OBJECT', 'ZONE', 'ENVIRONMENT', 'BACKGROUND', 'INTERACTION', 'WHOLE_PAGE'] as const;
export type MetaphorScope = (typeof METAPHOR_SCOPES)[number];

export type Rect = { x: number; y: number; w: number; h: number };

/** One content slot inside a zone, bound to data or exact copy, with its precision kinds. */
export type ZoneSlot = {
  slot_id: string;
  kinds: (PrecisionUiKind | ArtTruthKind)[];
  /** Exact copy, a data binding (`breakdown.value`), or an art description. */
  content: string;
  /** DECIDED, or the open founder decision id when the copy / feature is not settled. */
  decision?: 'DECIDED' | string;
  rect?: Rect;
};

export type BlueprintZone = {
  zone_id: string;
  role: ZoneRole;
  layer: LayerId;
  rect: Rect;
  slots: ZoneSlot[];
  note?: string;
};

export type PageCompositionBlueprint = {
  blueprint_id: string;
  project_id: string;
  territory_id: string;
  translation_id: string;
  frame: { width: number; height: number; unit: 'pt'; generated_aspect: string; generated_frame_mapping: string };
  safe_areas: { top: number; bottom: number; stage: { x: number; w: number }; nav_reserve_top: number };
  metaphor_scope: MetaphorScope;
  metaphor_scope_justification: string;
  /** Required when metaphor_scope === WHOLE_PAGE. */
  founder_whole_page_decision?: string | null;
  layers_present: LayerId[];
  zones: BlueprintZone[];
  /** Pairs of zone ids allowed to intersect, with how (e.g. "L2 type over L3 object, on a reserved quiet field"). */
  overlap_relationships: { a: string; b: string; relation: string }[];
  depth_order: LayerId[];
  visual_focal_order: string[];
  scroll_behavior: 'NO_SCROLL' | 'ATOMIC_PAGINATION';
  responsive_logic: string;
  density_intent: string;
};

/* ─────────────────────────────── render ownership ─────────────────────────────── */

export type LayerOwnership = {
  layer: LayerId;
  owner: RenderOwner;
  /** What the owner renders; for COMPOSITE, which parts are generated and which are deterministic. */
  renders: string;
  generated_part?: string;
  deterministic_part?: string;
  source?: string;
};

export type RenderOwnershipMap = {
  ownership_id: string;
  project_id: string;
  territory_id: string;
  blueprint_id: string;
  profile_id: string;
  layers: LayerOwnership[];
};

/** Project-specific default render ratio (sprint §28) — the profile constrains, the territory map decides. */
export type RenderOwnershipProfile = {
  profile_id: string;
  project_id: string;
  status: 'READY' | 'DRAFT_NEEDS_FOUNDER';
  stance: string;
  /** Allowed owners per layer for this project. */
  allowed: Partial<Record<LayerId, RenderOwner[]>>;
};

export const RENDER_OWNERSHIP_PROFILES: readonly RenderOwnershipProfile[] = [
  {
    profile_id: 'JURNL.RENDER_OWNERSHIP.v1', project_id: 'JURNL', status: 'READY',
    stance: 'Environment / object generation heavy; precision UI deterministic.',
    allowed: { L0: ['IMAGE_GENERATOR'], L1: ['DETERMINISTIC_VECTOR', 'DETERMINISTIC_UI', 'COMPOSITE'], L2: ['DETERMINISTIC_UI'], L3: ['COMPOSITE', 'IMAGE_GENERATOR'], L4: ['DETERMINISTIC_UI'], L5: ['DETERMINISTIC_UI'], L6: ['DETERMINISTIC_UI'], L7: ['DETERMINISTIC_UI'], L8: ['DETERMINISTIC_UI', 'NO_RENDER'] },
  },
  { profile_id: 'AIO.RENDER_OWNERSHIP.draft', project_id: 'AIO', status: 'DRAFT_NEEDS_FOUNDER', stance: 'Mostly deterministic operational UI; selective cinematic imagery (L0 optional).', allowed: { L0: ['IMAGE_GENERATOR', 'NO_RENDER'], L1: ['DETERMINISTIC_VECTOR'], L2: ['DETERMINISTIC_UI'], L3: ['DETERMINISTIC_UI', 'COMPOSITE', 'NO_RENDER'], L4: ['DETERMINISTIC_UI'], L5: ['DETERMINISTIC_UI'], L6: ['DETERMINISTIC_UI'], L7: ['DETERMINISTIC_UI'], L8: ['DETERMINISTIC_UI', 'NO_RENDER'] } },
  { profile_id: 'FRONTAL_SLAYER.RENDER_OWNERSHIP.draft', project_id: 'FRONTAL_SLAYER', status: 'DRAFT_NEEDS_FOUNDER', stance: 'High generated environment and product imagery; deterministic commerce UI (price, cart, variants).', allowed: { L0: ['IMAGE_GENERATOR'], L1: ['DETERMINISTIC_VECTOR'], L2: ['DETERMINISTIC_UI'], L3: ['IMAGE_GENERATOR', 'COMPOSITE'], L4: ['DETERMINISTIC_UI'], L5: ['DETERMINISTIC_UI'], L6: ['DETERMINISTIC_UI'], L7: ['DETERMINISTIC_UI'], L8: ['DETERMINISTIC_UI', 'NO_RENDER'] } },
  { profile_id: 'ASTRAL_WORLD.RENDER_OWNERSHIP.draft', project_id: 'ASTRAL_WORLD', status: 'DRAFT_NEEDS_FOUNDER', stance: 'World generation heavy; deterministic interaction overlay.', allowed: { L0: ['IMAGE_GENERATOR'], L1: ['DETERMINISTIC_VECTOR', 'COMPOSITE'], L2: ['DETERMINISTIC_UI'], L3: ['IMAGE_GENERATOR', 'COMPOSITE'], L4: ['DETERMINISTIC_UI'], L5: ['DETERMINISTIC_UI'], L6: ['DETERMINISTIC_UI'], L7: ['DETERMINISTIC_UI'], L8: ['DETERMINISTIC_UI', 'NO_RENDER'] } },
  { profile_id: 'NDXBOOK.RENDER_OWNERSHIP.draft', project_id: 'NDXBOOK', status: 'DRAFT_NEEDS_FOUNDER', stance: 'Editorial asset generation; deterministic workspace / product UI.', allowed: { L0: ['IMAGE_GENERATOR', 'NO_RENDER'], L1: ['DETERMINISTIC_VECTOR'], L2: ['DETERMINISTIC_UI'], L3: ['IMAGE_GENERATOR', 'COMPOSITE'], L4: ['DETERMINISTIC_UI'], L5: ['DETERMINISTIC_UI'], L6: ['DETERMINISTIC_UI'], L7: ['DETERMINISTIC_UI'], L8: ['DETERMINISTIC_UI', 'NO_RENDER'] } },
  { profile_id: 'SITE00.RENDER_OWNERSHIP.draft', project_id: 'SITE00', status: 'DRAFT_NEEDS_FOUNDER', stance: 'Host / operator UI is deterministic; generation only for client-facing media.', allowed: { L0: ['NO_RENDER', 'IMAGE_GENERATOR'], L1: ['DETERMINISTIC_VECTOR'], L2: ['DETERMINISTIC_UI'], L3: ['DETERMINISTIC_UI', 'COMPOSITE', 'NO_RENDER'], L4: ['DETERMINISTIC_UI'], L5: ['DETERMINISTIC_UI'], L6: ['DETERMINISTIC_UI'], L7: ['DETERMINISTIC_UI'], L8: ['DETERMINISTIC_UI', 'NO_RENDER'] } },
];

/* ─────────────────────────────── raw generation + assembly + guards ─────────────────────────────── */

/** SCENE_PLATE = environment + signature object generated together in one light (L0 + L3, plus blank brand surfaces), so nothing looks pasted on. */
export const PLATE_KINDS = ['SCENE_PLATE', 'ENVIRONMENT_PLATE', 'SIGNATURE_OBJECT_PLATE', 'MATERIAL_OBJECT_ASSET', 'BACKGROUND_DEPTH_LAYER'] as const;
export type PlateKind = (typeof PLATE_KINDS)[number];

/** What a raw plate must never contain (sprint §17). */
export const PLATE_MUST_NOT_CONTAIN = ['FINAL_NAV', 'FINAL_BUTTON_COPY', 'EXACT_FINANCIAL_TEXT', 'FINAL_LOGO', 'SYSTEM_ICONS', 'ANY_LEGIBLE_TEXT', 'DEVICE_CHROME', 'UI_CONTROLS'] as const;

/** Generator QA (sprint §25) — every item must pass for a plate to be accepted. */
export const GENERATOR_QA = ['NO_RANDOM_COPY', 'NO_RANDOM_LOGO', 'NO_NAV', 'NO_UI_BUTTONS', 'NO_WRONG_APP', 'NO_WRONG_FAMILY', 'NO_TYPOGRAPHY_DEPENDENCY', 'NO_BROKEN_DEVICE_CHROME', 'NO_UNRELATED_CONTENT'] as const;
export type GeneratorQaItem = (typeof GENERATOR_QA)[number];

/** Composite QA (sprint §26). */
export const COMPOSITE_QA = ['EXACT_LOGO', 'EXACT_COPY', 'EXACT_NAV', 'EXACT_ICONS', 'EXACT_CTA', 'EXACT_FINANCIAL_VALUE', 'NO_OVERFLOW', 'NO_COLLISIONS', 'NO_GLITCHING', 'NO_MISSING_NAV_ITEMS', 'NO_BAKED_UI_UNDER_LIVE_UI', 'NO_DOUBLE_LOGO', 'NO_DOUBLE_TEXT'] as const;
export type CompositeQaItem = (typeof COMPOSITE_QA)[number];

/** Visual richness audit (sprint §21): 1–5 each; a sparse layout with correct colours is not sufficient. */
export const RICHNESS_DIMENSIONS = ['ENVIRONMENT_DEPTH', 'MATERIAL_VARIETY', 'OBJECT_DETAIL', 'GRAPHIC_DESIGN_DETAIL', 'LIGHT_SHADOW', 'BRAND_INTEGRATION', 'PRODUCT_LAYERING', 'CUSTOM_ELEMENTS', 'COMPOSITIONAL_TENSION', 'VISUAL_WIT'] as const;
export type RichnessDimension = (typeof RICHNESS_DIMENSIONS)[number];
export const MIN_RICHNESS_SCORE = 3;
export const MIN_RICHNESS_MEAN = 3.8;
/** SAFE TO SPEND–class product clarity (sprint §22): the primary signal understood without interpreting the metaphor. */
export const MAX_PRODUCT_CLARITY_SECONDS = 2;

/**
 * Authored-authority standard (P0.JURNL.F09-SAFE-TO-SPEND.THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1). Two F09 rounds
 * passed every mechanical check and still failed the founder: they read as scene plates with UI laid on top.
 * SCENE PLATE + OVERLAY ≠ FINISHED AUTHORITY. A blueprint may guide geometry; the final image must feel authored.
 */
export const AUTHORED_AUTHORITY_RULE = 'COMPOSITION INTENT + BRAND WORLD + OFFICIAL LOGO/TYPE + BESPOKE ART DIRECTION + DETERMINISTIC PRODUCT UI = FINISHED AUTHORITY. SCENE PLATE + OVERLAY IS NOT.' as const;

/** Finish audit — every item must pass, judged on the composite at review size and at 100 %. */
export const FINISH_QA = [
  'NO_VISIBLE_SCAFFOLDING', // no blank plates / tags / panels, empty mockup zones, guide boxes, debug borders, placeholder primitives
  'NO_DEVICE_CHROME', // no status bar, home indicator, phone or browser frame inside the authority view
  'OBJECT_FULLY_REALIZED', // the signature object is finished and premium, not a blank construction
  'WORLD_AT_BENCHMARK', // environment richness and credibility at or above the project's approved art-driven benchmark
  'UNIFIED_LIGHT_GRADE_GRAIN', // overlays share the scene's light direction, colour grade and grain; nothing reads pasted
  'TYPE_INTEGRITY', // exact copy, no warped / glitched / hallucinated letters, no broken kerning
  'LOGO_OFFICIAL_INTEGRATED', // the official asset, placed with intent and blended into its surface
  'CONCEPT_DISTINCT', // a different page from its siblings, not a variation of one layout
] as const;
export type FinishQaItem = (typeof FINISH_QA)[number];

export type BakedUiGuard = {
  method: string[];
  reserved_region_rule: string;
  edge_score_threshold: number;
  reject_on: string[];
};

export const BAKED_UI_GUARD: BakedUiGuard = {
  method: [
    'Every deterministic zone (PRODUCT_ZONE_ROLES + SYSTEM_ZONE_ROLES + any slot with a precision kind) becomes a RESERVED REGION on the plate.',
    'OCR the plate: any legible glyph anywhere → reject (plates carry no text).',
    'Score each reserved region with the CENTER_STAGE salience method (0.55 × local edge energy + 0.30 × saturation + 0.15 × bright luminance); mean must stay ≤ the threshold.',
    'Human check of every reserved region at 100 %: no button shapes, pills, nav cells, icon glyphs, logo-like marks, ghost labels.',
  ],
  reserved_region_rule: 'A reserved region may carry material and light only (plaster, paper, stone, shadow) — the quiet surface the deterministic UI sits on.',
  edge_score_threshold: 0.12,
  reject_on: ['UI_ON_UI', 'DUPLICATE_BUTTON', 'DUPLICATE_LOGO', 'DUPLICATE_NAV', 'GHOST_LABEL', 'LEGIBLE_TEXT', 'ICON_GLYPH'],
};

export type ContaminationGuard = {
  guard_id: string;
  territory_id: string;
  family_id: string;
  product_job: string;
  required_copy: string[];
  forbidden_copy: string[];
  allowed_reference_assets: { path: string; sha256: string; role: string }[];
  forbidden_reference_assets: string[];
  prompt_hashes: Record<string, string>;
  blueprint_hash: string;
  run_rules: string[];
};

export type ArtLayerRecord = {
  plate_id: string;
  /** Layers whose generated part this plate supplies (a SCENE_PLATE covers L0 + L3 and any blank brand surface). */
  layers: LayerId[];
  plate_kind: PlateKind;
  model: string;
  provider: string;
  generation_mode: 'REFERENCE_GUIDED' | 'TEXT_TO_IMAGE';
  local_render: boolean;
  image_path: string;
  sha256: string;
  generator_qa: Record<GeneratorQaItem, boolean>;
  baked_ui: { pass: boolean; findings: string[] };
  contamination: { pass: boolean; found: string[] };
};

export type CompositeAuthority = {
  composite_id: string;
  territory_id: string;
  blueprint_id: string;
  ownership_id: string;
  art_layers: ArtLayerRecord[];
  deterministic_layers: { layer: LayerId; source: string }[];
  composite_qa: Record<CompositeQaItem, boolean>;
  /** Anti-AI audit of the assembled composite (material flags block). */
  anti_ai_flags: { flag: AntiAiFlag; severity: 'MATERIAL' | 'MINOR'; note: string }[];
  richness: Record<RichnessDimension, number>;
  product_clarity_seconds: number;
  image_path: string;
  /** Authored-authority finish audit (FINISH_QA). Missing = not audited = not ready. */
  finish?: Record<FinishQaItem, boolean>;
  /** The founder's verdict on this composite, once reviewed. REJECTED blocks authority whatever the mechanical QA says. */
  founder_verdict?: 'PENDING' | 'APPROVED' | 'REJECTED';
  founder_findings?: string[];
};

/* ─────────────────────────────── evaluators ─────────────────────────────── */

const filled = (v: unknown): boolean =>
  v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === '') && !(Array.isArray(v) && v.length === 0);
const intersects = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const inside = (r: Rect, f: { width: number; height: number }) => r.x >= 0 && r.y >= 0 && r.x + r.w <= f.width + 0.01 && r.y + r.h <= f.height + 0.01;
const area = (r: Rect) => r.w * r.h;

export type BlueprintCheck = { territory_id: string; status: 'BLUEPRINT_READY' | 'PAGE_COMPOSITION_BLUEPRINT_REQUIRED'; issues: string[] };

/**
 * A blueprint is geometry, not prose: every required role present, zones inside the frame, product zones clear of system
 * chrome and nav, intersections declared, metaphor contained (OBJECT / ZONE by default; WHOLE_PAGE only with a founder
 * decision), density balanced (signal in the upper 60 %, product content not crammed into one third, signature object
 * 12–50 % of the stage, ≥ 6 % negative space).
 */
export function checkCompositionBlueprint(b: PageCompositionBlueprint | null | undefined, territory?: CompositionTerritory): BlueprintCheck {
  const id = territory?.territory_id ?? b?.territory_id ?? '?';
  if (!b) return { territory_id: id, status: 'PAGE_COMPOSITION_BLUEPRINT_REQUIRED', issues: ['no blueprint'] };
  const issues: string[] = [];
  if (territory && b.territory_id !== territory.territory_id) issues.push('blueprint bound to another territory');
  const F = b.frame;
  for (const role of REQUIRED_ZONE_ROLES) if (!b.zones.some((z) => z.role === role)) issues.push(`missing zone ${role}`);
  for (const z of b.zones) {
    if (!inside(z.rect, F)) issues.push(`${z.zone_id} outside the frame`);
    if (!b.layers_present.includes(z.layer)) issues.push(`${z.zone_id} on undeclared layer ${z.layer}`);
  }
  const declared = (a: string, c: string) => b.overlap_relationships.some((o) => (o.a === a && o.b === c) || (o.a === c && o.b === a));
  const product = b.zones.filter((z) => PRODUCT_ZONE_ROLES.includes(z.role) || z.role === 'SIGNATURE_OBJECT');
  const system = b.zones.filter((z) => SYSTEM_ZONE_ROLES.includes(z.role));
  for (const p of product) for (const s of system) if (intersects(p.rect, s.rect)) issues.push(`${p.zone_id} collides with ${s.zone_id}`);
  for (let i = 0; i < product.length; i++) for (let j = i + 1; j < product.length; j++) {
    if (intersects(product[i]!.rect, product[j]!.rect) && !declared(product[i]!.zone_id, product[j]!.zone_id)) issues.push(`${product[i]!.zone_id} × ${product[j]!.zone_id} intersect without a declared relationship`);
  }
  for (const p of product.filter((z) => z.role !== 'SIGNATURE_OBJECT')) {
    if (p.rect.x < b.safe_areas.stage.x - 0.5 || p.rect.x + p.rect.w > b.safe_areas.stage.x + b.safe_areas.stage.w + 0.5) issues.push(`${p.zone_id} leaves the CENTER_STAGE field`);
    if (p.rect.y < b.safe_areas.top || p.rect.y + p.rect.h > b.safe_areas.nav_reserve_top) issues.push(`${p.zone_id} enters the top inset or nav reserve`);
  }
  if (!METAPHOR_SCOPES.includes(b.metaphor_scope)) issues.push('metaphor_scope invalid');
  if (b.metaphor_scope === 'WHOLE_PAGE' && !filled(b.founder_whole_page_decision)) issues.push('WHOLE_PAGE metaphor scope needs a founder decision');
  if (!filled(b.metaphor_scope_justification)) issues.push('metaphor_scope_justification');
  const stageArea = b.safe_areas.stage.w * (b.safe_areas.nav_reserve_top - b.safe_areas.top);
  const obj = b.zones.filter((z) => z.role === 'SIGNATURE_OBJECT').reduce((s, z) => s + area(z.rect), 0);
  if (b.metaphor_scope !== 'WHOLE_PAGE' && (obj / stageArea > 0.5 || obj / stageArea < 0.12)) issues.push(`signature object is ${(100 * obj / stageArea).toFixed(0)} % of the stage (contain to 12–50 %)`);
  const signal = b.zones.find((z) => z.role === 'PRIMARY_SIGNAL');
  if (signal && (signal.rect.y + signal.rect.h / 2) / F.height > 0.6) issues.push('primary signal below the upper 60 % of the frame');
  const productCentres = b.zones.filter((z) => ['PRIMARY_SIGNAL', 'SECONDARY_PRODUCT', 'CTA'].includes(z.role)).map((z) => (z.rect.y + z.rect.h / 2) / F.height);
  if (productCentres.length && (productCentres.every((c) => c < 1 / 3) || productCentres.every((c) => c > 2 / 3))) issues.push('product content crammed into one third of the frame');
  const neg = b.zones.filter((z) => z.role === 'NEGATIVE_SPACE').reduce((s, z) => s + area(z.rect), 0);
  if (neg / stageArea < 0.06) issues.push('less than 6 % reserved negative space (too busy)');
  if (!b.layers_present.every((l) => b.depth_order.includes(l))) issues.push('depth_order does not cover every layer present');
  if (b.visual_focal_order[0] !== signal?.zone_id) issues.push('focal order must start at the primary signal');
  if (!filled(b.responsive_logic)) issues.push('responsive_logic');
  return { territory_id: id, status: issues.length ? 'PAGE_COMPOSITION_BLUEPRINT_REQUIRED' : 'BLUEPRINT_READY', issues };
}

export type OwnershipCheck = { territory_id: string; status: 'OWNERSHIP_READY' | 'RENDER_LAYER_OWNERSHIP_REQUIRED'; issues: string[] };

/** One owner per declared layer; product-truth layers deterministic; precision slots never generator-owned; project profile respected. */
export function checkRenderOwnership(o: RenderOwnershipMap | null | undefined, b: PageCompositionBlueprint | null | undefined, profile?: RenderOwnershipProfile | null): OwnershipCheck {
  const id = b?.territory_id ?? o?.territory_id ?? '?';
  if (!o) return { territory_id: id, status: 'RENDER_LAYER_OWNERSHIP_REQUIRED', issues: ['no ownership map'] };
  const issues: string[] = [];
  if (b && o.blueprint_id !== b.blueprint_id) issues.push('ownership map bound to another blueprint');
  const byLayer = new Map<LayerId, LayerOwnership[]>();
  for (const l of o.layers) byLayer.set(l.layer, [...(byLayer.get(l.layer) ?? []), l]);
  for (const layer of b?.layers_present ?? []) {
    const owners = byLayer.get(layer) ?? [];
    if (owners.length !== 1) issues.push(`${layer} has ${owners.length} owners (exactly one required)`);
  }
  for (const l of o.layers) {
    if (DETERMINISTIC_LAYERS.includes(l.layer) && !['DETERMINISTIC_UI', 'DETERMINISTIC_VECTOR', 'NO_RENDER'].includes(l.owner)) issues.push(`${l.layer} (${COMPOSITION_LAYERS[l.layer]}) must be deterministic, not ${l.owner}`);
    if (l.layer === 'L1' && l.owner === 'IMAGE_GENERATOR') issues.push('L1 brand frame (logo geometry) may not be generator-owned');
    if (l.owner === 'COMPOSITE' && (!filled(l.generated_part) || !filled(l.deterministic_part))) issues.push(`${l.layer} COMPOSITE must split generated_part / deterministic_part`);
    if (profile && profile.allowed[l.layer] && !profile.allowed[l.layer]!.includes(l.owner)) issues.push(`${l.layer} owner ${l.owner} not allowed by ${profile.profile_id}`);
  }
  for (const z of b?.zones ?? []) {
    const owner = byLayer.get(z.layer)?.[0]?.owner;
    const precision = z.slots.filter((s) => s.kinds.some((k) => (PRECISION_UI_KINDS as readonly string[]).includes(k)));
    if (precision.length && owner === 'IMAGE_GENERATOR') issues.push(`${z.zone_id}: precision slots (${precision.map((s) => s.slot_id).join(', ')}) on a generator-owned layer`);
  }
  if (profile && profile.project_id !== o.project_id) issues.push('render ownership profile belongs to another project');
  return { territory_id: id, status: issues.length ? 'RENDER_LAYER_OWNERSHIP_REQUIRED' : 'OWNERSHIP_READY', issues };
}

export type ContaminationResult = { status: 'CLEAN' | 'INVALIDATED'; found: string[] };

/**
 * Text found in a render. Plates carry none: any glyph invalidates them. In a composite, every string must be contract copy;
 * a forbidden phrase (copy from another surface or family) invalidates it unless that exact string is approved F09 copy
 * (e.g. GROW is forbidden, PLAN TODAY. GROW FREELY. is the approved tagline).
 */
export function checkContamination(guard: ContaminationGuard, observedText: string[], plate = true): ContaminationResult {
  const found: string[] = [];
  const up = observedText.map((t) => t.toUpperCase().trim()).filter(Boolean);
  const approved = (t: string) => guard.required_copy.some((r) => r.toUpperCase() === t);
  const forbidden = (t: string) => guard.forbidden_copy.some((f) => new RegExp(`(^|[^A-Z])${f.toUpperCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Z]|$)`).test(t));
  for (const t of up) {
    if (plate) found.push(`${forbidden(t) ? 'forbidden copy' : 'text'} in a plate: ${t}`);
    else if (approved(t)) continue;
    else if (forbidden(t)) found.push(`forbidden copy: ${t}`);
    else found.push(`off-contract copy: ${t}`);
  }
  return { status: found.length ? 'INVALIDATED' : 'CLEAN', found };
}

export type CompositeCheck = { territory_id: string; status: 'AUTHORITY_READY' | 'COMPOSITE_AUTHORITY_REQUIRED'; issues: string[] };

/** AUTHORITY_READY = blueprint + ownership ready, art layers from the renderer and clean, deterministic layers present, composite QA all pass, rich, clear. */
export function checkCompositeAuthority(args: {
  blueprint: PageCompositionBlueprint | null | undefined;
  ownership: RenderOwnershipMap | null | undefined;
  profile?: RenderOwnershipProfile | null;
  composite: CompositeAuthority | null | undefined;
  renderer_model: string;
}): CompositeCheck {
  const id = args.blueprint?.territory_id ?? '?';
  const bp = checkCompositionBlueprint(args.blueprint);
  if (bp.status !== 'BLUEPRINT_READY') return { territory_id: id, status: 'COMPOSITE_AUTHORITY_REQUIRED', issues: bp.issues.map((i) => `blueprint: ${i}`) };
  const ow = checkRenderOwnership(args.ownership, args.blueprint, args.profile);
  if (ow.status !== 'OWNERSHIP_READY') return { territory_id: id, status: 'COMPOSITE_AUTHORITY_REQUIRED', issues: ow.issues.map((i) => `ownership: ${i}`) };
  const c = args.composite;
  if (!c) return { territory_id: id, status: 'COMPOSITE_AUTHORITY_REQUIRED', issues: ['no composite authority assembled yet'] };
  const issues: string[] = [];
  const owners = new Map(args.ownership!.layers.map((l) => [l.layer, l.owner]));
  for (const [layer, owner] of owners) {
    if ((owner === 'IMAGE_GENERATOR' || owner === 'COMPOSITE') && !c.art_layers.some((a) => a.layers.includes(layer))) issues.push(`${layer}: no generated art layer`);
    if ((owner === 'DETERMINISTIC_UI' || owner === 'DETERMINISTIC_VECTOR' || owner === 'COMPOSITE') && !c.deterministic_layers.some((d) => d.layer === layer)) issues.push(`${layer}: no deterministic layer`);
  }
  for (const a of c.art_layers) {
    if (a.local_render) issues.push(`${a.plate_id}: art layers must come from the image renderer, not a local approximation`);
    if (a.model !== args.renderer_model) issues.push(`${a.plate_id}: model ${a.model} ≠ ${args.renderer_model}`);
    const failed = GENERATOR_QA.filter((q) => !a.generator_qa[q]);
    if (failed.length) issues.push(`${a.plate_id}: generator QA failed ${failed.join(', ')}`);
    if (!a.baked_ui.pass) issues.push(`${a.plate_id}: baked UI ${a.baked_ui.findings.join(', ')}`);
    if (!a.contamination.pass) issues.push(`${a.plate_id}: contamination ${a.contamination.found.join(', ')}`);
  }
  for (const f of c.anti_ai_flags.filter((x) => x.severity === 'MATERIAL')) issues.push(`anti-AI ${f.flag}: ${f.note}`);
  if (!c.finish) issues.push('finish audit missing (authored-authority standard)');
  else {
    const unfinished = FINISH_QA.filter((q) => !c.finish![q]);
    if (unfinished.length) issues.push(`finish failed ${unfinished.join(', ')}`);
  }
  if (c.founder_verdict === 'REJECTED') issues.push(`founder rejected: ${(c.founder_findings ?? []).slice(0, 3).join('; ') || 'see review'}`);
  const qa = COMPOSITE_QA.filter((q) => !c.composite_qa[q]);
  if (qa.length) issues.push(`composite QA failed ${qa.join(', ')}`);
  const low = RICHNESS_DIMENSIONS.filter((d) => (c.richness[d] ?? 0) < MIN_RICHNESS_SCORE);
  const mean = RICHNESS_DIMENSIONS.reduce((s, d) => s + (c.richness[d] ?? 0), 0) / RICHNESS_DIMENSIONS.length;
  if (low.length || mean < MIN_RICHNESS_MEAN) issues.push(`richness: ${low.length ? `below ${MIN_RICHNESS_SCORE} on ${low.join(', ')}` : ''} mean ${mean.toFixed(1)} (needs ≥ ${MIN_RICHNESS_MEAN})`);
  if (!(c.product_clarity_seconds <= MAX_PRODUCT_CLARITY_SECONDS)) issues.push(`product clarity ${c.product_clarity_seconds}s > ${MAX_PRODUCT_CLARITY_SECONDS}s`);
  return { territory_id: id, status: issues.length ? 'COMPOSITE_AUTHORITY_REQUIRED' : 'AUTHORITY_READY', issues };
}

/** Gate input slice (AuthorityGateInput.hybrid). */
export type HybridAuthorityInput = {
  renderer_model: string;
  profile: RenderOwnershipProfile | null;
  blueprints: PageCompositionBlueprint[];
  ownership: RenderOwnershipMap[];
  composites: CompositeAuthority[];
};

export type HybridGateSummary = {
  status: 'COMPOSITES_READY' | 'PAGE_COMPOSITION_BLUEPRINT_REQUIRED' | 'RENDER_LAYER_OWNERSHIP_REQUIRED' | 'COMPOSITE_AUTHORITY_REQUIRED';
  blueprints: BlueprintCheck[];
  ownership: OwnershipCheck[];
  composites: CompositeCheck[];
};

export function evaluateHybridGate(territories: CompositionTerritory[], h: HybridAuthorityInput | null | undefined): HybridGateSummary {
  const live = territories.filter((t) => t.status !== 'REJECTED' && t.status !== 'SUPERSEDED');
  const blueprints = live.map((t) => checkCompositionBlueprint(h?.blueprints.find((b) => b.territory_id === t.territory_id), t));
  const ownership = live.map((t) => {
    const b = h?.blueprints.find((x) => x.territory_id === t.territory_id);
    return checkRenderOwnership(h?.ownership.find((o) => o.territory_id === t.territory_id), b, h?.profile);
  });
  const composites = live.map((t) => checkCompositeAuthority({
    blueprint: h?.blueprints.find((b) => b.territory_id === t.territory_id),
    ownership: h?.ownership.find((o) => o.territory_id === t.territory_id),
    profile: h?.profile,
    composite: h?.composites.find((c) => c.territory_id === t.territory_id),
    renderer_model: h?.renderer_model ?? '',
  }));
  const status: HybridGateSummary['status'] = blueprints.some((b) => b.status !== 'BLUEPRINT_READY')
    ? 'PAGE_COMPOSITION_BLUEPRINT_REQUIRED'
    : ownership.some((o) => o.status !== 'OWNERSHIP_READY')
      ? 'RENDER_LAYER_OWNERSHIP_REQUIRED'
      : composites.some((c) => c.status !== 'AUTHORITY_READY')
        ? 'COMPOSITE_AUTHORITY_REQUIRED'
        : 'COMPOSITES_READY';
  return { status, blueprints, ownership, composites };
}

/* ─────────────────────────────── exported contracts (docs/studioos/visual-authority-development) ─────────────────────────────── */

export const PAGE_COMPOSITION_BLUEPRINT_GATE_CONTRACT = {
  id: 'PAGE_COMPOSITION_BLUEPRINT_GATE',
  sprint: HYBRID_SPRINT,
  supersedes: 'A COMPLETE SUNBURST PROMPT = A COMPLETE PRODUCT AUTHORITY',
  gate_status: { ready: 'BLUEPRINT_READY', blocked: 'PAGE_COMPOSITION_BLUEPRINT_REQUIRED' },
  evaluator: 'checkCompositionBlueprint(blueprint, territory)',
  position: 'After creative direction + brand expression, before render ownership and before any generation.',
  layers: COMPOSITION_LAYERS,
  zone_roles: ZONE_ROLES,
  required_zone_roles: REQUIRED_ZONE_ROLES,
  product_zone_roles: PRODUCT_ZONE_ROLES,
  system_zone_roles: SYSTEM_ZONE_ROLES,
  blueprint_fields: ['frame (pt + generated aspect + frame mapping)', 'safe_areas (top, bottom, stage x/w, nav_reserve_top)', 'metaphor_scope + justification (+ founder decision for WHOLE_PAGE)', 'layers_present', 'zones (role, layer, rect, slots with precision kinds and decisions)', 'overlap_relationships', 'depth_order', 'visual_focal_order', 'scroll_behavior', 'responsive_logic', 'density_intent'],
  metaphor_containment: { rule: METAPHOR_CONTAINMENT_RULE, scopes: METAPHOR_SCOPES, default: ['OBJECT', 'ZONE'], whole_page: 'Only with a recorded founder decision.' },
  checks: [
    'every required zone role present',
    'every zone inside the frame and on a declared layer',
    'product and signature zones never collide with status, chrome or nav',
    'product zones intersect only with a declared relationship',
    'product zones stay inside the stage width and between the top inset and the nav reserve',
    'signature object 12–50 % of the stage (unless WHOLE_PAGE by founder decision)',
    'primary signal centred in the upper 60 % of the frame; focal order starts there',
    'product content not crammed into one third of the frame',
    '≥ 6 % of the stage reserved as named negative space',
    'depth order covers every layer present; responsive logic stated',
  ],
};

export const RENDER_LAYER_OWNERSHIP_GATE_CONTRACT = {
  id: 'RENDER_LAYER_OWNERSHIP_GATE',
  sprint: HYBRID_SPRINT,
  supersedes: 'IMAGE GENERATOR = SOLE RENDERER OF THE SCREEN',
  hard_rule: HYBRID_HARD_RULE,
  gate_status: { ready: 'OWNERSHIP_READY', blocked: 'RENDER_LAYER_OWNERSHIP_REQUIRED' },
  evaluator: 'checkRenderOwnership(ownership, blueprint, profile)',
  owners: RENDER_OWNERS,
  precision_ui: PRECISION_UI_KINDS,
  art_truth: ART_TRUTH_KINDS,
  deterministic_layers: DETERMINISTIC_LAYERS,
  rules: [
    'Exactly one owner per layer present in the blueprint.',
    'L2, L4, L5, L6, L7 are deterministic (DETERMINISTIC_UI / DETERMINISTIC_VECTOR / NO_RENDER).',
    'L1 brand frame is never generator-owned: logo geometry is the official asset.',
    'A COMPOSITE layer names its generated_part and its deterministic_part.',
    'No zone with a precision slot sits on a generator-owned layer.',
    'Owners stay within the project’s render-ownership profile.',
  ],
  profiles: RENDER_OWNERSHIP_PROFILES,
};

export const HYBRID_AUTHORITY_RENDERING_METHOD = {
  id: 'HYBRID_AUTHORITY_RENDERING_METHOD',
  sprint: HYBRID_SPRINT,
  hard_rule: HYBRID_HARD_RULE,
  pipeline: HYBRID_PIPELINE,
  steps: HYBRID_RENDERING_STEPS,
  division_of_labour: {
    IMAGE_GENERATOR: 'Art-directed visual truth: architecture, light, materials, tactile objects, depth, shadow, foliage — as text-free plates with blank surfaces and quiet reserved regions.',
    DETERMINISTIC: 'Product truth: official logo, exact copy and figures, data geometry, chrome, nav, icons, buttons, spacing — assembled on top of the plates.',
    COMPOSITE: 'The reference authority the founder reviews. Raw plates are provenance, never the authority.',
  },
  plate_kinds: PLATE_KINDS,
  plate_must_not_contain: PLATE_MUST_NOT_CONTAIN,
  gate_integration: 'evaluateAuthorityGate: for every non-grandfathered material family, after creative direction + brand expression → PAGE_COMPOSITION_BLUEPRINT_REQUIRED / RENDER_LAYER_OWNERSHIP_REQUIRED stop the line before references; references count only when every territory’s composite is AUTHORITY_READY (else COMPOSITE_AUTHORITY_REQUIRED) and the creative directions are distinct.',
  hybrid_gate: 'evaluateHybridGate(territories, hybrid) → COMPOSITES_READY | PAGE_COMPOSITION_BLUEPRINT_REQUIRED | RENDER_LAYER_OWNERSHIP_REQUIRED | COMPOSITE_AUTHORITY_REQUIRED',
};

export const BAKED_UI_GUARD_CONTRACT = {
  id: 'BAKED_UI_GUARD',
  sprint: HYBRID_SPRINT,
  why: 'A plate that already contains a button, label, nav cell or logo produces UI on UI once the deterministic layer is placed over it.',
  ...BAKED_UI_GUARD,
  generator_qa: GENERATOR_QA,
  contamination: {
    evaluator: 'checkContamination(guard, observedText, plate)',
    plate_mode: 'Any glyph in a plate invalidates it.',
    composite_mode: 'Every string must be contract copy; forbidden phrases from other surfaces or families invalidate it unless that exact string is approved copy.',
    guard_fields: ['required_copy', 'forbidden_copy', 'allowed_reference_assets (path + sha256 + role)', 'forbidden_reference_assets', 'prompt_hashes', 'blueprint_hash', 'run_rules'],
  },
};

export const COMPOSITE_AUTHORITY_QA_CONTRACT = {
  id: 'COMPOSITE_AUTHORITY_QA',
  sprint: HYBRID_SPRINT,
  authored_authority: { rule: AUTHORED_AUTHORITY_RULE, finish_qa: FINISH_QA, founder_verdict: 'A founder REJECTED verdict blocks authority even when every mechanical check passes.' },
  gate_status: { ready: 'AUTHORITY_READY', blocked: 'COMPOSITE_AUTHORITY_REQUIRED' },
  evaluator: 'checkCompositeAuthority({ blueprint, ownership, profile, composite, renderer_model })',
  art_layers: 'One accepted plate per generator / COMPOSITE layer, from the profile renderer (never a local approximation), passing generator QA, the baked-UI guard and contamination.',
  composite_qa: COMPOSITE_QA,
  anti_ai: 'The creative-direction anti-AI flags apply to the composite; a MATERIAL flag blocks.',
  richness: { dimensions: RICHNESS_DIMENSIONS, scale: '1–5', min_each: MIN_RICHNESS_SCORE, min_mean: MIN_RICHNESS_MEAN, rule: 'A sparse layout with correct colours is not rich.' },
  product_clarity: { max_seconds: MAX_PRODUCT_CLARITY_SECONDS, rule: 'The primary signal is understood without interpreting the metaphor.' },
};
