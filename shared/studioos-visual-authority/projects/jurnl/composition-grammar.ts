/**
 * JURNL composition grammar — how a JURNL page is composed, as rules a blueprint can be checked against
 * (P0.JURNL.F09-SAFE-TO-SPEND.COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1).
 *
 * The creative-direction profile says what JURNL is made of (plaster, stone, paper, light, the botanical mark). This
 * grammar says how those things are arranged on a 393×852 phone page so the product reads first and the world enriches
 * it. The lessons the founder drew from the comparison concept are recorded as rules, never as a layout to copy.
 */
import type { LayerId, PageCompositionBlueprint, ZoneRole } from '../../hybrid-authority.js';

export const JURNL_COMPOSITION_GRAMMAR_ID = 'JURNL.COMPOSITION_GRAMMAR.v1' as const;

export type GrammarRule = { rule_id: string; name: string; rule: string; layers: LayerId[]; check: string };

export const JURNL_COMPOSITION_GRAMMAR: readonly GrammarRule[] = [
  {
    rule_id: 'G01', name: 'ARCHITECTURAL FRAME',
    rule: 'The page sits inside a built place (a wall, a room, a reveal, a niche). Architecture frames the stage from the perimeter; it never sits behind the primary signal as busy texture.',
    layers: ['L0'], check: 'ENVIRONMENT zone is full-bleed; PERIMETER zones carry the architecture; reserved regions under L2 / L4 / L5 are quiet surfaces.',
  },
  {
    rule_id: 'G02', name: 'TACTILE FINANCIAL OBJECT',
    rule: 'One made object carries the territory’s metaphor and real data (course lengths, envelope thickness, an inlaid rule). It is contained: 12–50 % of the stage, never the whole page.',
    layers: ['L3'], check: 'Exactly one SIGNATURE_OBJECT zone; metaphor_scope OBJECT or ZONE; its data-bearing geometry is deterministic.',
  },
  {
    rule_id: 'G03', name: 'EDITORIAL HIERARCHY',
    rule: 'Function label → state → figure → why. One display figure in the serif; everything else tracked condensed sans capitals. Never more than five type sizes on the page.',
    layers: ['L2', 'L4', 'L5'], check: 'Focal order starts at PRIMARY_SIGNAL; the figure is the largest type; ≤ 5 sizes.',
  },
  {
    rule_id: 'G04', name: 'QUIET CENTRAL CLARITY',
    rule: 'The primary signal sits in the upper half of the stage on a quiet field and is understood in under two seconds without reading the metaphor.',
    layers: ['L2'], check: 'PRIMARY_SIGNAL centre in the upper 60 % of the frame; reserved region edge score ≤ 0.12; 2-second clarity check.',
  },
  {
    rule_id: 'G05', name: 'PERIPHERAL ENVIRONMENTAL RICHNESS',
    rule: 'Richness lives at the edges and in depth: foliage entering the frame, a window reveal, light falling across plaster, the bleed outside the 393-pt viewport. The centre stays legible.',
    layers: ['L0'], check: 'PERIMETER zones present on at least two sides; ENVIRONMENT_DEPTH and LIGHT_SHADOW richness ≥ 3.',
  },
  {
    rule_id: 'G06', name: 'CONTROLLED MATERIAL LAYERING',
    rule: 'At most four material families per page (for example plaster, stone, paper, brass). Each one has a job: field, object, inlay, plate. No material appears only as decoration.',
    layers: ['L0', 'L3'], check: 'material families ≤ 4 in the raw generation contract; every material named against a job.',
  },
  {
    rule_id: 'G07', name: 'BESPOKE GRAPHIC DESIGN',
    rule: 'Product modules are designed for this page: survey rules, inlaid proportion rules, plate labels, legend swatches drawn from the object. No stock cards, pills or chart widgets.',
    layers: ['L2', 'L4'], check: 'SECONDARY_PRODUCT zone has a designed component (not a list of cards); CUSTOM_ELEMENTS richness ≥ 3.',
  },
  {
    rule_id: 'G08', name: 'FUNCTIONAL NEGATIVE SPACE',
    rule: 'Empty space is a reserved, named region that does a job (the open floor is what you can spend, the uncut stone is calm). It is never leftover.',
    layers: ['L0', 'L3'], check: 'NEGATIVE_SPACE zones ≥ 6 % of the stage, each with a stated job.',
  },
  {
    rule_id: 'G09', name: 'SUBTLE WIT',
    rule: 'One relationship that rewards a second look (a broken seal, an empty groove, the emptiest space being the money). Never a joke, cute copy or novelty UI.',
    layers: ['L3'], check: 'VISUAL_WIT richness ≥ 3; the wit is in the object, not in the copy.',
  },
];

/**
 * What the founder’s comparison concept taught, as rules. It is a lesson source, not a template: none of its layout,
 * copy or objects are reused.
 */
export const JURNL_COMPARISON_LESSONS: readonly { lesson: string; rule: string }[] = [
  { lesson: 'The product read first even though the page was rich.', rule: 'Keep the primary signal on a reserved quiet field in the upper half; richness goes to the perimeter and the object.' },
  { lesson: 'The environment framed the page instead of becoming the page.', rule: 'metaphor_scope defaults to OBJECT or ZONE; WHOLE_PAGE needs a founder decision.' },
  { lesson: 'Every word, number, icon and nav cell was exact.', rule: 'Precision UI is deterministic (L2, L4–L7 DETERMINISTIC_UI; L1 DETERMINISTIC_VECTOR). The generator never renders text.' },
  { lesson: 'The logo was the real mark, placed with intent.', rule: 'The official asset is composited; the scene may give it a surface (plaque, plate, letterhead) but never redraws it.' },
  { lesson: 'There was a secondary module with real depth below the signal.', rule: 'Every blueprint has a SECONDARY_PRODUCT zone with real data, so the page is not a number on a wallpaper.' },
  { lesson: 'Density was balanced: neither a sparse stack nor a busy poster.', rule: 'Apply JURNL_DENSITY_RULE.' },
  { lesson: 'Its copy and features were its own.', rule: 'Its labels (WHY THIS AMOUNT, CHECK A PURCHASE, AVAILABLE THROUGH …) enter only through founder decisions D-F09-PRIMARY-ACTION-LABEL, D-F09-PURCHASES-BRIDGE and D-F09-AVAILABLE-DATE.' },
];

/** Density: rich enough to feel authored, quiet enough to read in two seconds. */
export const JURNL_DENSITY_RULE = {
  rule: 'Product content spans at least two thirds of the stage height; the signature object is 12–50 % of the stage; reserved negative space is ≥ 6 % of the stage; at most four material families and five type sizes.',
  min_product_zones: ['PRIMARY_SIGNAL', 'SECONDARY_PRODUCT', 'CTA'] as ZoneRole[],
  product_span_min: 0.66,
  signature_object_share: [0.12, 0.5] as const,
  negative_space_min: 0.06,
  max_material_families: 4,
  max_type_sizes: 5,
  too_sparse: 'A number, a button and a wallpaper. Correct colours do not make it rich.',
  too_busy: 'Text competing with texture, an object that eats the stage, more than one focal point above the fold.',
} as const;

/** JURNL fixed page geometry (pt), shared by every F09 blueprint. Source: FamilyChrome / ProductNav runtime + F09_FRAME_GEOMETRY. */
export const JURNL_MOBILE_GEOMETRY = {
  frame: { width: 393, height: 852 },
  status_bar: { x: 0, y: 0, w: 393, h: 54 },
  chrome_row: { x: 26.5, y: 59, w: 340, h: 36 },
  stage: { x: 26.5, y: 108, w: 340, h: 606 },
  composition_edge: { x: 26.5, y: 714, w: 340, h: 40 },
  nav: { x: 26.5, y: 762, w: 340, h: 44 },
  home_indicator: { x: 0, y: 820, w: 393, h: 32 },
  generated_frame_mapping: '9:16 plate: height = 852 pt; the 393-pt viewport is the central 82 % of the plate width (x 9–91 %); the outer 9 % each side is environment bleed only.',
} as const;

export type DensityCheck = {
  blueprint_id: string;
  status: 'DENSITY_BALANCED' | 'DENSITY_FAILURE';
  metrics: { product_span: number; signature_object_share: number; negative_space_share: number };
  issues: string[];
};

/** JURNL_DENSITY_RULE over a blueprint’s geometry (material families and type sizes are checked on the contracts). */
export function checkJurnlDensity(b: PageCompositionBlueprint): DensityCheck {
  const stageH = b.safe_areas.nav_reserve_top - b.safe_areas.top;
  const stageArea = b.safe_areas.stage.w * stageH;
  const area = (role: ZoneRole) => b.zones.filter((z) => z.role === role).reduce((sum, z) => sum + z.rect.w * z.rect.h, 0);
  const product = b.zones.filter((z) => JURNL_DENSITY_RULE.min_product_zones.includes(z.role));
  const top = Math.min(...product.map((z) => z.rect.y));
  const bottom = Math.max(...product.map((z) => z.rect.y + z.rect.h));
  const metrics = {
    product_span: +((bottom - top) / stageH).toFixed(3),
    signature_object_share: +(area('SIGNATURE_OBJECT') / stageArea).toFixed(3),
    negative_space_share: +(area('NEGATIVE_SPACE') / stageArea).toFixed(3),
  };
  const issues: string[] = [];
  for (const role of JURNL_DENSITY_RULE.min_product_zones) if (!b.zones.some((z) => z.role === role)) issues.push(`missing ${role}`);
  if (metrics.product_span < JURNL_DENSITY_RULE.product_span_min) issues.push(`product content spans ${(100 * metrics.product_span).toFixed(0)} % of the stage (too sparse)`);
  const [lo, hi] = JURNL_DENSITY_RULE.signature_object_share;
  if (metrics.signature_object_share < lo || metrics.signature_object_share > hi) issues.push(`signature object ${(100 * metrics.signature_object_share).toFixed(0)} % of the stage`);
  if (metrics.negative_space_share < JURNL_DENSITY_RULE.negative_space_min) issues.push('reserved negative space < 6 % (too busy)');
  return { blueprint_id: b.blueprint_id, status: issues.length ? 'DENSITY_FAILURE' : 'DENSITY_BALANCED', metrics, issues };
}

export const JURNL_COMPOSITION_GRAMMAR_CONTRACT = {
  id: JURNL_COMPOSITION_GRAMMAR_ID,
  rules: JURNL_COMPOSITION_GRAMMAR,
  comparison_lessons: JURNL_COMPARISON_LESSONS,
  density: JURNL_DENSITY_RULE,
  geometry: JURNL_MOBILE_GEOMETRY,
};
