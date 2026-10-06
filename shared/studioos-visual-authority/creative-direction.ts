/**
 * Creative Direction Translation + Brand Expression gates — Studio OS visual authority methodology
 * (P0.JURNL.F09-SAFE-TO-SPEND.CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1).
 *
 * Known failure (JURNL F09, territory proof 1): three structurally valid territories went straight to reference
 * candidates and read as GOOD PRODUCT CONCEPTS + CLEAN UI STUDIES, not creative-directed brand authorities.
 * A strong functional concept is not yet a visual authority.
 *
 *   STRUCTURAL TERRITORY → CREATIVE DIRECTION TRANSLATION → BRAND EXPRESSION GATE → IMAGE-GENERATED AUTHORITY CANDIDATE
 *
 * The layer is project-specific: every project supplies its own CreativeDirectionProfile (identity, logo system, material
 * and environment world, graphic-design rules, wit, anti-generic and anti-AI rules, renderer). There is no universal
 * "luxury" profile — a translation checked against another project's profile, or a generic one, fails.
 *
 * IMAGE GENERATION IS A RENDERER, NOT THE DESIGNER: the translation locks object, zones, hierarchy, text, logo, nav, CTA,
 * focal points, materials, negative space and environment before any generation call.
 */
import type { CompositionTerritory, ReferenceAuthority } from './schema.js';

/* ─────────────────────────────── canonical pipeline insert ─────────────────────────────── */

export const CREATIVE_DIRECTION_SPRINT = 'P0.JURNL.F09-SAFE-TO-SPEND.CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1' as const;
export const CREATIVE_DIRECTION_DOCTRINE = 'A STRONG FUNCTIONAL CONCEPT IS NOT YET A VISUAL AUTHORITY. IMAGE GENERATION IS A RENDERER, NOT THE DESIGNER.' as const;

export const CREATIVE_PIPELINE = [
  'BRAND DNA',
  'EXPERIENCE CONTRACT',
  'FAMILY CONTRACT',
  'STRUCTURAL TERRITORIES',
  'CREATIVE DIRECTION TRANSLATION',
  'BRAND EXPRESSION GATE',
  'IMAGE-GENERATED AUTHORITY CANDIDATES',
  'FOUNDER REVIEW',
  'FAMILY AUTHORITY LOCK',
  'RESPONSIVE / STATE EXPLOSION',
  'IMPLEMENTATION',
] as const;

/** The four layers the methodology keeps apart (each has its own artifact and its own readiness). */
export const AUTHORITY_LAYERS = {
  STRUCTURAL_TERRITORY: 'What the page IS: primary object, page logic, zones, structural dimensions (CompositionTerritory). Proven by checkTerritoryDistinctness.',
  CREATIVE_DIRECTION: 'How the territory becomes this brand: art-direction premise, world, materials, objects, type, logo, light, depth, wit, locks (CreativeDirectionTranslation). Proven by checkCreativeDirection → CREATIVE_DIRECTION_READY.',
  BRAND_EXPRESSION: 'Pre-generation proof the direction carries the whole brand, not palette + font (BrandExpressionCheck). Proven by checkBrandExpression → BRAND_EXPRESSION_READY.',
  REFERENCE_AUTHORITY: 'The rendered candidate (image-generated, renderer only) that passed the anti-AI audit and typography guard. Proven by checkCandidateAuthority → REFERENCE_AUTHORITY_READY.',
} as const;

export type CreativeGateStatus =
  | 'CREATIVE_DIRECTION_READY'
  | 'CREATIVE_DIRECTION_REQUIRED'
  | 'BRAND_EXPRESSION_READY'
  | 'BRAND_EXPRESSION_REQUIRED'
  | 'REFERENCE_AUTHORITY_READY'
  | 'CANDIDATE_REQUIRED'
  | 'ANTI_AI_FAILURE'
  | 'TYPOGRAPHY_FAILURE'
  | 'RENDERER_MISMATCH';

/* ─────────────────────────────── project creative-direction profile ─────────────────────────────── */

export type RendererSpec = {
  model: string;
  quality: string;
  aspect_ratio: string;
  auto_enhance: boolean;
  /** How the generated frame maps to the canonical product viewport (e.g. 9:16 frame ↔ 393×852 viewport). */
  viewport_mapping: string;
  generation_mode: 'REFERENCE_GUIDED' | 'TEXT_TO_IMAGE' | 'EITHER';
  forbidden_providers: string[];
  /** Final candidates may not be local HTML/CSS renders. */
  local_render_allowed_as_final: boolean;
};

export type CreativeDirectionProfile = {
  profile_id: string;
  project_id: string;
  /** What the project is about, in its own words (never a generic luxury register). */
  brand_lines: string[];
  product_philosophy: string[];
  logo_system: { marks: string[]; lockups: string[]; placement_rules: string[]; forbidden: string[]; asset_paths: string[] };
  tagline_system: string[];
  color_world: string[];
  material_world: string[];
  environment_world: string[];
  object_language: string[];
  typography_direction: string[];
  graphic_design_rules: string[];
  /** What wit means for this brand (a smart visual idea, never jokes / cute copy / novelty UI). */
  wit_definition: string;
  must_not_become: string[];
  anti_generic_rules: string[];
  anti_ai_rules: string[];
  renderer: RendererSpec;
  /** Where each line came from (repo canon, founder sprint directive, …). */
  provenance: string[];
};

export const PROJECT_PROFILE_REQUIRED_FIELDS: readonly (keyof CreativeDirectionProfile)[] = [
  'brand_lines', 'product_philosophy', 'logo_system', 'tagline_system', 'color_world', 'material_world', 'environment_world',
  'object_language', 'typography_direction', 'graphic_design_rules', 'wit_definition', 'must_not_become', 'anti_generic_rules',
  'anti_ai_rules', 'renderer',
];

/* ─────────────────────────────── 2. creative direction translation ─────────────────────────────── */

/** The translation fields every territory must define before generation (sprint §2). */
export const CREATIVE_DIRECTION_FIELDS = [
  'art_direction_premise',
  'brand_world_translation',
  'graphic_design_language',
  'environmental_role',
  'material_language',
  'tactile_object_language',
  'typographic_art_direction',
  'logo_behavior',
  'brand_lockup_behavior',
  'color_hierarchy',
  'lighting_direction',
  'depth_model',
  'compositional_tension',
  'negative_space_strategy',
  'editorial_wit',
  'custom_designed_element',
  'bespoke_detail',
  'imagery_role',
  'focal_priority',
  'motion_implication',
  'anti_generic_rules',
  'anti_ai_look_rules',
] as const;
export type CreativeDirectionField = (typeof CREATIVE_DIRECTION_FIELDS)[number];

/** What must be locked before the renderer is called (sprint §9). */
export const GENERATION_LOCKS = [
  'primary_object',
  'major_zones',
  'visual_hierarchy',
  'text_hierarchy',
  'logo_placement',
  'bottom_nav_placement',
  'cta_placement',
  'image_focal_points',
  'material_hierarchy',
  'negative_space_regions',
  'environmental_geometry',
  'custom_object_logic',
] as const;
export type GenerationLock = (typeof GENERATION_LOCKS)[number];

/** Graphic-design authorship devices (sprint §5); a translation must use several. */
export const GRAPHIC_AUTHORSHIP_DEVICES = [
  'BESPOKE_TYPOGRAPHIC_RELATIONSHIP',
  'EDITORIAL_SCALE_CONTRAST',
  'CUSTOM_MATERIAL_INFORMATION_OBJECT',
  'DESIGNED_PHYSICAL_METAPHOR',
  'INTENTIONAL_GRID_BREAK',
  'BESPOKE_LABELS_TABS',
  'CUSTOM_HIERARCHY',
  'TACTILE_DATA_ENCODING',
  'CONTROLLED_OBJECT_COMPOSITION',
  'LAYERED_PHYSICAL_GRAPHIC_STRUCTURE',
  'ASYMMETRIC_BRANDED_FRAMING',
  'ENVIRONMENT_INTERFACE_TENSION',
  'CUSTOM_STATE_TRANSITION',
] as const;
export type GraphicAuthorshipDevice = (typeof GRAPHIC_AUTHORSHIP_DEVICES)[number];
export const MIN_AUTHORSHIP_DEVICES = 4;

export type CreativeDirectionTranslation = {
  translation_id: string;
  project_id: string;
  profile_id: string;
  territory_id: string;
  /** Carried from the structural territory — the translation may not change them. */
  structural_premise: string;
  primary_object: string;
  functional_metaphor: string;
  /** The one visual idea a generic UI generator could not have produced (sprint §6). */
  bespoke_visual_idea: string;
  /** Plain-language description of the finished image, read first by the renderer (the locks follow). */
  render_brief: string;
  fields: Record<CreativeDirectionField, string>;
  authorship_devices: GraphicAuthorshipDevice[];
  locks: Record<GenerationLock, string>;
  /** Text the render must carry exactly, and text that may be representational. */
  text_must_render: string[];
  text_representational: string[];
  forbidden_elements: string[];
  prompt_path: string;
};

/* ─────────────────────────────── 3. brand expression gate ─────────────────────────────── */

/** Pre-generation checklist (sprint §16). Every item must PASS. The last is critical. */
export const BRAND_EXPRESSION_CHECKLIST = [
  'VISUAL_WORLD_PRESENT',
  'PRODUCT_PHILOSOPHY_PRESENT',
  'FAMILY_SPECIFIC_LOGIC_PRESENT',
  'CUSTOM_GRAPHIC_DESIGN_IDEA_PRESENT',
  'BESPOKE_MATERIAL_OBJECT_PRESENT',
  'MEANINGFUL_ENVIRONMENTAL_ROLE',
  'LOGO_PLACEMENT_ART_DIRECTED',
  'TAGLINE_DESCRIPTORS_HANDLED',
  'PRIMARY_SIGNAL_UNMISTAKABLE',
  'SECONDARY_DATA_DOES_NOT_COMPETE',
  'NO_GENERIC_DASHBOARD',
  'NO_GENERIC_CARD_STACK',
  'NO_DEFAULT_AI_COMPOSITION',
  'NO_UNRELATED_DECORATION',
  'IDEA_SURVIVES_WITHOUT_MARKETING_COPY',
  'MOBILE_GEOMETRY_WORKS',
  'BOTTOM_NAV_WORKS',
  'NO_CIRCULAR_TAPPABLE_BUTTONS',
  'BRAND_EVIDENT_WITH_LOGO_HIDDEN',
] as const;
export type BrandExpressionItem = (typeof BRAND_EXPRESSION_CHECKLIST)[number];

export type BrandExpressionCheck = {
  territory_id: string;
  translation_id: string;
  items: Record<BrandExpressionItem, { pass: boolean; evidence: string }>;
};

/* ─────────────────────────────── 4. anti-AI visual audit + typography guard ─────────────────────────────── */

export const ANTI_AI_FLAGS = [
  'GENERIC_LUXURY_APP',
  'GENERIC_FINTECH',
  'GENERIC_MEDITERRANEAN',
  'CARD_STACK_DRIFT',
  'GLASSMORPHISM_DEFAULT',
  'OVERLY_CENTERED_AI_LAYOUT',
  'DECORATIVE_ICON_NOISE',
  'RANDOM_BOTANICALS',
  'RANDOM_GOLD_ACCENTS',
  'FAKE_EDITORIAL_COPY',
  'MATERIAL_OVERLOAD',
  'UNJUSTIFIED_3D_OBJECT',
  'PHOTOREAL_SCENE_WITH_UI_PASTED_ON',
  'AI_TYPOGRAPHY_ARTIFACTS',
  'ILLEGIBLE_TEXT',
  'GENERIC_PROMO_LAYOUT',
  'TEMPLATE_DASHBOARD',
  'MOODBOARD_NOT_PRODUCT',
  /** Composition-blueprint correction: the metaphor became the whole page instead of an object or zone. */
  'METAPHOR_CONSUMED_PAGE',
  /** Composition-blueprint correction: an object that should encode data (lengths, thickness, fill) does not. */
  'DATA_NOT_ENCODED',
] as const;
export type AntiAiFlag = (typeof ANTI_AI_FLAGS)[number];

export const TYPOGRAPHY_DEFECTS = ['MISSPELLING', 'FAKE_WORD', 'RANDOM_LABEL', 'DUPLICATED_NAV_ITEM', 'MUTATED_WORDMARK', 'GARBLED_AMOUNT', 'BROKEN_TAGLINE', 'MISSING_COPY', 'MUTATED_MARK'] as const;
export type TypographyDefect = (typeof TYPOGRAPHY_DEFECTS)[number];

export type AntiAiAudit = {
  candidate_id: string;
  territory_id: string;
  flags: { flag: AntiAiFlag; severity: 'MATERIAL' | 'MINOR'; note: string }[];
  typography_defects: { defect: TypographyDefect; text: string; repaired: boolean; repair: string }[];
};

/** A rendered candidate (the renderer's output after any recorded repair). */
export type GeneratedCandidate = {
  candidate_id: string;
  territory_id: string;
  translation_id: string;
  model: string;
  quality: string;
  aspect_ratio: string;
  auto_enhance: boolean;
  generation_mode: 'REFERENCE_GUIDED' | 'TEXT_TO_IMAGE';
  provider: string;
  local_render: boolean;
  image_path: string;
  prompt_path: string;
  /** Founder-recorded exceptions to the profile's renderer spec (e.g. resolution ceiling of an approved route). */
  renderer_exceptions?: string[];
};

/* ─────────────────────────────── 5. creative-direction distinctness ─────────────────────────────── */

export const CREATIVE_DISTINCTNESS_DIMENSIONS = [
  'art_direction_premise',
  'environmental_strategy',
  'material_strategy',
  'object_language',
  'typographic_strategy',
  'depth_model',
  'brand_lockup_strategy',
  'visual_wit',
  'data_encoding',
  'cta_expression',
] as const;
export type CreativeDistinctnessDimension = (typeof CREATIVE_DISTINCTNESS_DIMENSIONS)[number];
export const MIN_CREATIVE_DISTINCT_DIMENSIONS = 8;
/** These must always differ: two territories with one art-direction premise / depth model / material strategy are one look. */
export const CREATIVE_DISTINCTNESS_ANCHORS: readonly CreativeDistinctnessDimension[] = ['art_direction_premise', 'depth_model', 'material_strategy'];

export type CreativeDistinctnessRow = { territory_id: string } & Record<CreativeDistinctnessDimension, string>;

/* ─────────────────────────────── evaluators ─────────────────────────────── */

const filled = (v: unknown): boolean =>
  v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === '') && !(Array.isArray(v) && v.length === 0) &&
  !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length === 0);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export type ProfileCheck = { status: 'PROFILE_READY' | 'PROFILE_REQUIRED'; missing: string[] };

export function checkCreativeDirectionProfile(p: CreativeDirectionProfile | null | undefined): ProfileCheck {
  if (!p) return { status: 'PROFILE_REQUIRED', missing: ['creative_direction_profile'] };
  const missing = PROJECT_PROFILE_REQUIRED_FIELDS.filter((k) => !filled(p[k])).map(String);
  if (!filled(p.logo_system?.marks) || !filled(p.logo_system?.placement_rules)) missing.push('logo_system.marks / placement_rules');
  if (/^(generic|universal|default)/i.test(p.profile_id) || p.project_id === '*') missing.push('project-specific profile (no universal luxury layer)');
  return { status: missing.length ? 'PROFILE_REQUIRED' : 'PROFILE_READY', missing };
}

export type CreativeDirectionCheck = { territory_id: string; status: 'CREATIVE_DIRECTION_READY' | 'CREATIVE_DIRECTION_REQUIRED'; missing: string[] };

/**
 * A translation is ready only when: it is bound to its own project's ready profile, it carries the territory's structure
 * unchanged, every translation field and every generation lock is filled, it names a bespoke visual idea, and it uses at
 * least MIN_AUTHORSHIP_DEVICES graphic-design authorship devices.
 */
export function checkCreativeDirection(t: CreativeDirectionTranslation | null | undefined, territory: CompositionTerritory, profile: CreativeDirectionProfile | null | undefined): CreativeDirectionCheck {
  const missing: string[] = [];
  if (!t) return { territory_id: territory.territory_id, status: 'CREATIVE_DIRECTION_REQUIRED', missing: ['translation'] };
  const prof = checkCreativeDirectionProfile(profile);
  if (prof.status !== 'PROFILE_READY') missing.push(...prof.missing.map((m) => `profile: ${m}`));
  if (profile && (profile.project_id !== t.project_id || profile.profile_id !== t.profile_id)) missing.push('profile belongs to another project');
  if (t.territory_id !== territory.territory_id || t.project_id !== territory.project_id) missing.push('translation is bound to another territory');
  if (norm(t.primary_object) !== norm(territory.primary_object)) missing.push('primary object changed (the translation may not redesign the structure)');
  for (const f of CREATIVE_DIRECTION_FIELDS) if (!filled(t.fields?.[f])) missing.push(`field ${f}`);
  for (const l of GENERATION_LOCKS) if (!filled(t.locks?.[l])) missing.push(`lock ${l}`);
  if (!filled(t.bespoke_visual_idea)) missing.push('bespoke_visual_idea');
  if (!filled(t.render_brief)) missing.push('render_brief');
  if (new Set(t.authorship_devices ?? []).size < MIN_AUTHORSHIP_DEVICES) missing.push(`≥ ${MIN_AUTHORSHIP_DEVICES} graphic-design authorship devices`);
  if (!filled(t.text_must_render)) missing.push('text_must_render');
  if (!filled(t.forbidden_elements)) missing.push('forbidden_elements');
  if (!filled(t.prompt_path)) missing.push('prompt_path');
  return { territory_id: territory.territory_id, status: missing.length ? 'CREATIVE_DIRECTION_REQUIRED' : 'CREATIVE_DIRECTION_READY', missing };
}

export type BrandExpressionResult = { territory_id: string; status: 'BRAND_EXPRESSION_READY' | 'BRAND_EXPRESSION_REQUIRED'; failed: string[] };

export function checkBrandExpression(c: BrandExpressionCheck | null | undefined, territory_id: string): BrandExpressionResult {
  if (!c) return { territory_id, status: 'BRAND_EXPRESSION_REQUIRED', failed: ['brand_expression_check'] };
  const failed = BRAND_EXPRESSION_CHECKLIST.filter((k) => !c.items?.[k]?.pass || !filled(c.items?.[k]?.evidence)).map(String);
  return { territory_id, status: failed.length ? 'BRAND_EXPRESSION_REQUIRED' : 'BRAND_EXPRESSION_READY', failed };
}

export type CreativeDistinctnessCheck = {
  status: 'CREATIVE_DIRECTIONS_DISTINCT' | 'CREATIVE_DIRECTION_COLLAPSE';
  pairs: { a: string; b: string; differing: CreativeDistinctnessDimension[]; distinct: boolean }[];
};

/** Distinct artistically, not only structurally: every pair differs on ≥ 8 of 10 dimensions including all anchors. */
export function checkCreativeDistinctness(rows: CreativeDistinctnessRow[]): CreativeDistinctnessCheck {
  const pairs: CreativeDistinctnessCheck['pairs'] = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i]!, b = rows[j]!;
      const differing = CREATIVE_DISTINCTNESS_DIMENSIONS.filter((d) => filled(a[d]) && filled(b[d]) && norm(a[d]) !== norm(b[d]));
      const distinct = differing.length >= MIN_CREATIVE_DISTINCT_DIMENSIONS && CREATIVE_DISTINCTNESS_ANCHORS.every((d) => differing.includes(d));
      pairs.push({ a: a.territory_id, b: b.territory_id, differing, distinct });
    }
  }
  return { status: pairs.length && pairs.every((p) => p.distinct) ? 'CREATIVE_DIRECTIONS_DISTINCT' : 'CREATIVE_DIRECTION_COLLAPSE', pairs };
}

export type CandidateAuthorityCheck = { territory_id: string; status: CreativeGateStatus; reasons: string[] };

/**
 * REFERENCE_AUTHORITY_READY needs CREATIVE_DIRECTION_READY + BRAND_EXPRESSION_READY + a generated (not local-render)
 * candidate on the profile's renderer + no MATERIAL anti-AI flag + no unrepaired typography defect.
 */
export function checkCandidateAuthority(args: {
  territory: CompositionTerritory;
  profile: CreativeDirectionProfile | null | undefined;
  translation: CreativeDirectionTranslation | null | undefined;
  brand_expression: BrandExpressionCheck | null | undefined;
  candidate?: GeneratedCandidate | null;
  audit?: AntiAiAudit | null;
}): CandidateAuthorityCheck {
  const id = args.territory.territory_id;
  const cd = checkCreativeDirection(args.translation, args.territory, args.profile);
  if (cd.status !== 'CREATIVE_DIRECTION_READY') return { territory_id: id, status: 'CREATIVE_DIRECTION_REQUIRED', reasons: cd.missing };
  const be = checkBrandExpression(args.brand_expression, id);
  if (be.status !== 'BRAND_EXPRESSION_READY') return { territory_id: id, status: 'BRAND_EXPRESSION_REQUIRED', reasons: be.failed };
  const c = args.candidate;
  if (!c) return { territory_id: id, status: 'CANDIDATE_REQUIRED', reasons: ['no generated candidate yet'] };
  const r = args.profile!.renderer;
  const rendererReasons: string[] = [];
  if (c.local_render && !r.local_render_allowed_as_final) rendererReasons.push('local HTML/CSS render cannot be the final authority candidate');
  if (r.forbidden_providers.map(norm).includes(norm(c.provider))) rendererReasons.push(`provider ${c.provider} is forbidden for this profile`);
  if (norm(c.model) !== norm(r.model)) rendererReasons.push(`model ${c.model} ≠ ${r.model}`);
  if (c.aspect_ratio !== r.aspect_ratio) rendererReasons.push(`aspect ${c.aspect_ratio} ≠ ${r.aspect_ratio}`);
  if (c.auto_enhance !== r.auto_enhance) rendererReasons.push('auto-enhance mismatch');
  if (norm(c.quality) !== norm(r.quality) && !filled(c.renderer_exceptions)) rendererReasons.push(`quality ${c.quality} ≠ ${r.quality} without a recorded exception`);
  if (r.generation_mode !== 'EITHER' && c.generation_mode !== r.generation_mode && !filled(c.renderer_exceptions)) rendererReasons.push(`mode ${c.generation_mode} ≠ ${r.generation_mode} without a recorded exception`);
  if (rendererReasons.length) return { territory_id: id, status: 'RENDERER_MISMATCH', reasons: rendererReasons };
  const a = args.audit;
  if (!a) return { territory_id: id, status: 'ANTI_AI_FAILURE', reasons: ['no anti-AI audit'] };
  const material = a.flags.filter((f) => f.severity === 'MATERIAL');
  if (material.length) return { territory_id: id, status: 'ANTI_AI_FAILURE', reasons: material.map((f) => `${f.flag}: ${f.note}`) };
  const typo = a.typography_defects.filter((d) => !d.repaired);
  if (typo.length) return { territory_id: id, status: 'TYPOGRAPHY_FAILURE', reasons: typo.map((d) => `${d.defect}: ${d.text}`) };
  return { territory_id: id, status: 'REFERENCE_AUTHORITY_READY', reasons: [] };
}

/** Gate input slice (AuthorityGateInput.creative_direction). */
export type CreativeDirectionGateInput = {
  profile: CreativeDirectionProfile | null;
  translations: CreativeDirectionTranslation[];
  brand_expression: BrandExpressionCheck[];
  candidates: GeneratedCandidate[];
  audits: AntiAiAudit[];
  distinctness: CreativeDistinctnessRow[];
};

/** Families whose page-family authority was founder-approved before this gate existed (lineage, not exemption by default). */
export const CREATIVE_DIRECTION_GRANDFATHERED: readonly { project_id: string; feature_id: string; reason: string }[] = [
  { project_id: 'AIO', feature_id: 'AIO.IFTA', reason: 'AIO IFTA authority bundle founder-approved and locked before the creative-direction gate (2026-10-06). The next AIO family enters the corrected pipeline.' },
];

/** Every material family needs the creative-direction layer unless its authority predates the gate (explicit list above). */
export function creativeDirectionRequired(project_id: string, feature_id: string): boolean {
  return !CREATIVE_DIRECTION_GRANDFATHERED.some((g) => g.project_id === project_id && g.feature_id === feature_id);
}

export type CreativeGateSummary = {
  status: 'REFERENCE_AUTHORITIES_READY' | CreativeGateStatus | 'CREATIVE_DIRECTION_COLLAPSE';
  per_territory: CandidateAuthorityCheck[];
  distinctness: CreativeDistinctnessCheck;
};

/** Evaluate every live territory through creative direction → brand expression → candidate. */
export function evaluateCreativeGate(territories: CompositionTerritory[], cd: CreativeDirectionGateInput | null | undefined, references: ReferenceAuthority[] = []): CreativeGateSummary {
  const live = territories.filter((t) => t.status !== 'REJECTED' && t.status !== 'SUPERSEDED');
  const per = live.map((territory) =>
    checkCandidateAuthority({
      territory,
      profile: cd?.profile,
      translation: cd?.translations.find((t) => t.territory_id === territory.territory_id),
      brand_expression: cd?.brand_expression.find((b) => b.territory_id === territory.territory_id),
      candidate: cd?.candidates.find((c) => c.territory_id === territory.territory_id && references.some((r) => r.territory_id === territory.territory_id)) ?? cd?.candidates.find((c) => c.territory_id === territory.territory_id),
      audit: cd?.audits.find((a) => a.territory_id === territory.territory_id),
    }),
  );
  const distinctness = checkCreativeDistinctness(cd?.distinctness ?? []);
  const order: CreativeGateStatus[] = ['CREATIVE_DIRECTION_REQUIRED', 'BRAND_EXPRESSION_REQUIRED', 'RENDERER_MISMATCH', 'CANDIDATE_REQUIRED', 'ANTI_AI_FAILURE', 'TYPOGRAPHY_FAILURE'];
  const worst = order.find((s) => per.some((p) => p.status === s));
  const status: CreativeGateSummary['status'] = worst ?? (distinctness.status !== 'CREATIVE_DIRECTIONS_DISTINCT' ? 'CREATIVE_DIRECTION_COLLAPSE' : 'REFERENCE_AUTHORITIES_READY');
  return { status, per_territory: per, distinctness };
}

/* ─────────────────────────────── exported contracts (docs/studioos/visual-authority-development) ─────────────────────────────── */

/** Which projects have a creative-direction profile. Each needs its OWN translation layer — no shared luxury register. */
export const CREATIVE_DIRECTION_PROJECT_COVERAGE: readonly { project_id: string; status: 'PROFILE_READY' | 'PROFILE_REQUIRED'; profile?: string; must_know: string }[] = [
  { project_id: 'JURNL', status: 'PROFILE_READY', profile: 'shared/studioos-visual-authority/projects/jurnl/creative-direction-profile.ts', must_know: 'Financial organisation, calm confidence, editorial restraint, Mediterranean / coastal world, tactile financial objects, natural light, plaster / stone / paper / textile, botanical language, quiet intentional wit, custom hierarchy.' },
  { project_id: 'AIO', status: 'PROFILE_REQUIRED', must_know: 'The business office behind the truck: executive industrial × modern infrastructure, operational luxury, black / gold / silver / obsidian, road and filing-room objects. (AIO IFTA is grandfathered.)' },
  { project_id: 'SITE00', status: 'PROFILE_REQUIRED', must_know: 'Host / studio operator identity (Martian Mono host UI) — never a client brand.' },
  { project_id: 'FRONTAL_SLAYER', status: 'PROFILE_REQUIRED', must_know: 'Its own beauty / wig commerce world from the fsbw brand bible.' },
  { project_id: 'ASTRAL_WORLD', status: 'PROFILE_REQUIRED', must_know: 'Its own world identity (family lock pending).' },
  { project_id: 'NDXBOOK', status: 'PROFILE_REQUIRED', must_know: 'Its own creative lineage (docs/ndxbook-creative-lineage.md).' },
];

export const CREATIVE_DIRECTION_GATE_CONTRACT = {
  id: 'CREATIVE_DIRECTION_GATE',
  sprint: CREATIVE_DIRECTION_SPRINT,
  doctrine: CREATIVE_DIRECTION_DOCTRINE,
  pipeline: CREATIVE_PIPELINE,
  layers: AUTHORITY_LAYERS,
  gate_status: { ready: 'CREATIVE_DIRECTION_READY', blocked: 'CREATIVE_DIRECTION_REQUIRED' },
  evaluator: 'checkCreativeDirection(translation, territory, profile)',
  profile: { required_fields: PROJECT_PROFILE_REQUIRED_FIELDS, rule: 'Project-specific. A profile with a generic / universal id or another project’s id fails. Coverage below.', coverage: CREATIVE_DIRECTION_PROJECT_COVERAGE },
  translation: {
    carried_from_territory: ['structural_premise', 'primary_object (unchanged)', 'functional_metaphor'],
    required_fields: CREATIVE_DIRECTION_FIELDS,
    bespoke_visual_idea: 'Required: the one visual idea a generic UI generator could not have produced (recorded verbatim).',
    authorship_devices: { options: GRAPHIC_AUTHORSHIP_DEVICES, minimum: MIN_AUTHORSHIP_DEVICES, rule: 'Never simply place UI cards over an image.' },
    locks_before_generation: GENERATION_LOCKS,
    text: ['text_must_render (exact)', 'text_representational', 'forbidden_elements'],
    prompt: 'Built from the locked translation; renderer executes, never designs.',
  },
  distinctness: { dimensions: CREATIVE_DISTINCTNESS_DIMENSIONS, min_differing: MIN_CREATIVE_DISTINCT_DIMENSIONS, anchors: CREATIVE_DISTINCTNESS_ANCHORS, on_failure: 'CREATIVE_DIRECTION_COLLAPSE' },
  grandfathered: CREATIVE_DIRECTION_GRANDFATHERED,
  wit: 'WITTY = a smart visual idea, a meaningful metaphor, a subtle relationship, a composition that rewards attention. Never jokes, cute copy or novelty UI.',
};

export const BRAND_EXPRESSION_GATE_CONTRACT = {
  id: 'BRAND_EXPRESSION_GATE',
  sprint: CREATIVE_DIRECTION_SPRINT,
  gate_status: { ready: 'BRAND_EXPRESSION_READY', blocked: 'BRAND_EXPRESSION_REQUIRED' },
  evaluator: 'checkBrandExpression(check, territory_id)',
  checklist: BRAND_EXPRESSION_CHECKLIST,
  critical: 'BRAND_EVIDENT_WITH_LOGO_HIDDEN — if the logo is hidden, the screen must still feel like the brand.',
  rule: 'Every item PASS with evidence before any generation call.',
  candidate_authority: {
    evaluator: 'checkCandidateAuthority({ territory, profile, translation, brand_expression, candidate, audit })',
    ready: 'REFERENCE_AUTHORITY_READY',
    blocked: ['CREATIVE_DIRECTION_REQUIRED', 'BRAND_EXPRESSION_REQUIRED', 'CANDIDATE_REQUIRED', 'RENDERER_MISMATCH', 'ANTI_AI_FAILURE', 'TYPOGRAPHY_FAILURE'],
    renderer_rule: 'The profile renderer (model, quality, aspect, auto-enhance, mode). Local HTML/CSS renders are never final candidates. A deviation counts only with a recorded founder exception.',
  },
  anti_ai_audit: { flags: ANTI_AI_FLAGS, material_flag_blocks: true, typography_defects: TYPOGRAPHY_DEFECTS, typography_rule: 'Regenerate or repair (repair = composite the official asset, recorded); no candidate passes with an unrepaired defect.' },
  gate_integration: 'evaluateAuthorityGate: for every non-grandfathered material family, CREATIVE_DIRECTION_REQUIRED / BRAND_EXPRESSION_REQUIRED stop the line before references. Since the composition-blueprint correction the whole-screen candidate no longer counts as the reference authority: the composite does (HYBRID_AUTHORITY_RENDERING_METHOD); checkCandidateAuthority remains the audit for any whole-screen render.',
};
