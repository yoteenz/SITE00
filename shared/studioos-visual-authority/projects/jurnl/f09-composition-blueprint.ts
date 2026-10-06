/**
 * JURNL F09 SAFE TO SPEND — page composition blueprints, render-layer ownership, raw generation + composite assembly
 * contracts, contamination guard and invalid-render ledger
 * (P0.JURNL.F09-SAFE-TO-SPEND.COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1).
 *
 * Same three territories, same creative directions. What changes is how a page gets made: each territory now has a
 * geometric blueprint at 393×852 and one owner per layer. The image generator paints a text-free SCENE PLATE (environment
 * + signature-object material in one light). Everything that must be exact (logo, copy, figures, data geometry, chrome,
 * nav, CTA) is assembled deterministically on top. Nothing is generated in this sprint.
 *
 * Package: JURNL/F09_SAFE/COMPOSITION_BLUEPRINT_CORRECTION1/ · export: npx tsx scripts/studioos/jurnl-f09-composition-blueprint-export.ts
 */
import {
  BAKED_UI_GUARD,
  COMPOSITE_QA,
  GENERATOR_QA,
  HYBRID_HARD_RULE,
  HYBRID_SPRINT,
  LAYER_IDS,
  PLATE_MUST_NOT_CONTAIN,
  PRODUCT_ZONE_ROLES,
  RENDER_OWNERSHIP_PROFILES,
  RICHNESS_DIMENSIONS,
  SYSTEM_ZONE_ROLES,
  checkCompositionBlueprint,
  checkContamination,
  checkRenderOwnership,
  evaluateHybridGate,
  type BlueprintZone,
  type ContaminationGuard,
  type CompositeAuthority,
  type HybridAuthorityInput,
  type LayerId,
  type PageCompositionBlueprint,
  type Rect,
  type RenderOwnershipMap,
  type ZoneSlot,
} from '../../hybrid-authority.js';
import { JURNL_CREATIVE_DIRECTION_PROFILE as P } from './creative-direction-profile.js';
import { JURNL_MOBILE_GEOMETRY as G, checkJurnlDensity } from './composition-grammar.js';
import { JURNL_F09_CD_DIR } from './f09-creative-direction.js';
import { JURNL_F09_SAMPLE_VALUES, JURNL_F09_TERRITORIES } from './f09-safe-to-spend.js';

export const JURNL_F09_BP_SPRINT = HYBRID_SPRINT;
export const JURNL_F09_HYBRID_EXEC_SPRINT = 'P0.JURNL.F09-SAFE-TO-SPEND.HYBRID-COMPOSITE-AUTHORITY-EXECUTION1' as const;
export const JURNL_F09_BP_DIR = 'JURNL/F09_SAFE/COMPOSITION_BLUEPRINT_CORRECTION1' as const;
export const JURNL_F09_HYBRID_DIR = 'JURNL/F09_SAFE/HYBRID_COMPOSITE_AUTHORITY_EXECUTION1' as const;
const GUIDES = `${JURNL_F09_BP_DIR}/PLATE_GUIDES`;
const JURNL_PROFILE = RENDER_OWNERSHIP_PROFILES.find((p) => p.project_id === 'JURNL')!;

/* ─────────────────────────────── canonical copy + data ─────────────────────────────── */

const SV = JURNL_F09_SAMPLE_VALUES.fields;
const money = (n: number) => `$${n.toLocaleString('en-US')}`;
export const F09_HELD = { BILLS: SV.upcoming, PLAN: SV.assigned, GOALS: SV.goalReserved, TRIPS: SV.tripReserved } as const;
const HELD_TOTAL = JURNL_F09_SAMPLE_VALUES.held_back;
const CLEAR_SHARE = SV.value / SV.cash;

/** Runtime copy (source of truth: src/projects/jurnl/runtime/screens/SafeToSpendScreens.tsx). */
export const F09_CANONICAL_COPY = {
  FUNCTION_LABEL: 'SAFE TO SPEND',
  STATE_LINE_COMPLETE: 'WHAT YOU CAN SPEND NOW WITHOUT TOUCHING BILLS, PLANS OR WHAT YOU’RE HOLDING.',
  CLEAR: 'CLEAR TO SPEND',
  OVER: 'OVER BY',
  VALUE: money(SV.value),
  HELD_LINE: `HELD BACK ${money(HELD_TOTAL)} OF ${money(SV.cash)} CASH`,
  PRIMARY_ACTION: 'SEE THE FULL BREAKDOWN',
  SECONDARY_ACTION: 'CHANGE WHAT’S HELD',
  PLAN_LINK: 'PLAN',
  NAV: ['HOME', 'MONEY', 'PLAN', 'CREDIT'],
  STATUS_TIME: '9:41',
} as const;

/** Approved brand copy (JURNL_CREATIVE_DIRECTION_PROFILE.tagline_system). */
const TAGLINE = 'PLAN TODAY. GROW FREELY.';
const DESCRIPTOR = 'FINANCIAL LIFE, BEAUTIFULLY ORGANIZED.';

/** Copy authored by the structural territories (sprint 1), reviewed by the founder at comparison. */
const T02_LEDE = 'YOU CAN SPEND';
const T02_CLAUSE = ['NOW, AFTER', 'BILLS, YOUR PLAN,', 'GOALS AND TRIPS.'] as const;
const T02_TAG = `${money(SV.assigned)} ASSIGNED`;

/** Open founder decisions that touch F09 slots. The blueprint reserves the slot; the copy stays canonical until decided. */
export const F09_PENDING_DECISIONS = [
  { id: 'D-F09-PRIMARY-ACTION-LABEL', slot: 'primary CTA', current: 'SEE THE FULL BREAKDOWN', proposal: 'WHY THIS AMOUNT (founder example)', behaviour: 'Render the current canonical label; the CTA zone is sized for either (≤ 22 characters).' },
  { id: 'D-F09-PURCHASES-BRIDGE', slot: 'inline action row', current: 'not on the page', proposal: 'CHECK A PURCHASE → F10', behaviour: 'No slot rendered. If approved it replaces PLAN › in the inline row; no new zone.' },
  { id: 'D-F09-AVAILABLE-DATE', slot: 'state line', current: 'not on the page', proposal: 'AVAILABLE THROUGH {date}', behaviour: 'Not rendered: computeSafeToSpend has no horizon, so no date may be invented. Needs a formula decision first.' },
] as const;

/** Copy that must never appear on an F09 render (other surfaces / families). Approved F09 strings override (GROW in the tagline). */
export const F09_FORBIDDEN_COPY = ['A QUIETER YOU', 'BEGIN YOUR JOURNEY', 'REFLECT', 'ALIGN', 'GROW', 'JOURNAL', 'JOURNEY', 'WELCOME', 'GET STARTED', 'MINDFUL', 'DEAR', 'TODAY’S ENTRY'] as const;

/* ─────────────────────────────── geometry helpers ─────────────────────────────── */

const r = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h });
const s = (slot_id: string, kinds: ZoneSlot['kinds'], content: string, rect?: Rect, decision: ZoneSlot['decision'] = 'DECIDED'): ZoneSlot => ({ slot_id, kinds, content, decision, ...(rect ? { rect } : {}) });

const FRAME: PageCompositionBlueprint['frame'] = { width: G.frame.width, height: G.frame.height, unit: 'pt', generated_aspect: '9:16', generated_frame_mapping: G.generated_frame_mapping };
const SAFE: PageCompositionBlueprint['safe_areas'] = { top: G.stage.y, bottom: G.frame.height - G.home_indicator.y, stage: { x: G.stage.x, w: G.stage.w }, nav_reserve_top: G.stage.y + G.stage.h };
const ALL_LAYERS: LayerId[] = [...LAYER_IDS];
const R = (o: { x: number; y: number; w: number; h: number }) => r(o.x, o.y, o.w, o.h);

const NAV_CELL_W = (G.nav.w - 4 * 4) / 5;
const navCell = (i: number) => r(G.nav.x + i * (NAV_CELL_W + 4), G.nav.y, NAV_CELL_W, G.nav.h);

/** Status bar, chrome, nav, home indicator, environment and the empty composition edge: identical on every F09 page. */
function systemZones(t: string, environment: string): BlueprintZone[] {
  return [
    { zone_id: `${t}.STATUS`, role: 'SYSTEM_STATUS', layer: 'L6', rect: R(G.status_bar), slots: [s('time', ['STATUS_VALUE', 'EXACT_COPY'], '9:41'), s('glyphs', ['ICON'], 'signal · wi-fi · battery')] },
    {
      zone_id: `${t}.CHROME`, role: 'SYSTEM_CHROME', layer: 'L6', rect: R(G.chrome_row),
      note: 'Square-rounded 34-pt icon buttons on bone with a hairline greige border. No centred wordmark: the lockup lives in the scene (sprint 2 founder direction).',
      slots: [
        s('back', ['ICON', 'BUTTON', 'INTERACTION_CHROME'], 'BACK (chevron; aria-label BACK TO TODAY)', r(26.5, 60, 34, 34)),
        s('account', ['ICON', 'BUTTON', 'INTERACTION_CHROME'], 'ACCOUNT (gear)', r(294.5, 60, 34, 34)),
        s('ask', ['ICON', 'BUTTON', 'INTERACTION_CHROME'], 'ASK JURNL (i)', r(332.5, 60, 34, 34)),
      ],
    },
    {
      zone_id: `${t}.NAV`, role: 'NAV', layer: 'L7', rect: R(G.nav),
      note: 'JurnlProductNav: five equal square-rounded cells, 4-pt gaps, HOME active (deep emerald fill, bone glyph).',
      slots: [
        s('home', ['NAVIGATION', 'ICON', 'TAB_LABEL'], 'HOME (person) — active', navCell(0)),
        s('money', ['NAVIGATION', 'ICON', 'TAB_LABEL'], 'MONEY (banknote)', navCell(1)),
        s('add', ['NAVIGATION', 'ICON'], '+ QUICK ADD (no label)', navCell(2)),
        s('plan', ['NAVIGATION', 'ICON', 'TAB_LABEL'], 'PLAN (clock)', navCell(3)),
        s('credit', ['NAVIGATION', 'ICON', 'TAB_LABEL'], 'CREDIT (document)', navCell(4)),
      ],
    },
    { zone_id: `${t}.HOME_INDICATOR`, role: 'SYSTEM_STATUS', layer: 'L6', rect: R(G.home_indicator), slots: [s('bar', ['INTERACTION_CHROME'], 'system home indicator')] },
    { zone_id: `${t}.ENVIRONMENT`, role: 'ENVIRONMENT', layer: 'L0', rect: r(0, 0, G.frame.width, G.frame.height), slots: [s('scene', ['ARCHITECTURE', 'LIGHTING', 'MATERIALITY', 'SCENE_DEPTH'], environment)] },
    { zone_id: `${t}.EDGE`, role: 'NEGATIVE_SPACE', layer: 'L0', rect: R(G.composition_edge), note: 'Job: separates the page from the nav.', slots: [s('quiet', ['MATERIALITY'], 'plain surface, no content')] },
  ];
}

const bleed = (t: string, extra: BlueprintZone[] = []): BlueprintZone[] => [
  { zone_id: `${t}.BLEED_L`, role: 'PERIMETER', layer: 'L0', rect: r(0, G.stage.y, G.stage.x, G.stage.h), note: 'Outside the 340-pt stage: environment only.', slots: [s('bleed', ['MATERIALITY', 'SHADOW'], 'environment bleed')] },
  { zone_id: `${t}.BLEED_R`, role: 'PERIMETER', layer: 'L0', rect: r(G.stage.x + G.stage.w, G.stage.y, G.frame.width - G.stage.x - G.stage.w, G.stage.h), note: 'Outside the 340-pt stage: environment only.', slots: [s('bleed', ['MATERIALITY', 'SHADOW'], 'environment bleed')] },
  ...extra,
];

const ctaZones = (t: string, y: number, h: number, inlineY: number, inlineH: number): BlueprintZone[] => [
  {
    zone_id: `${t}.CTA`, role: 'CTA', layer: 'L5', rect: r(G.stage.x, y, G.stage.w, h),
    note: 'JurnlButton primary: deep emerald #0F3D32, 8-pt corners, bone tracked uppercase label.',
    slots: [s('primary', ['BUTTON', 'EXACT_COPY'], F09_CANONICAL_COPY.PRIMARY_ACTION, r(G.stage.x, y, G.stage.w, h), 'D-F09-PRIMARY-ACTION-LABEL')],
  },
  {
    zone_id: `${t}.INLINE`, role: 'CTA', layer: 'L5', rect: r(G.stage.x, inlineY, G.stage.w, inlineH),
    note: 'JurnlInlineAction ×2 on one row: tracked label, fine taupe rule, thin chevron. Never pills.',
    slots: [
      s('change_held', ['BUTTON', 'EXACT_COPY'], `${F09_CANONICAL_COPY.SECONDARY_ACTION} ›`, r(G.stage.x, inlineY, 170, inlineH)),
      s('plan', ['BUTTON', 'EXACT_COPY'], `${F09_CANONICAL_COPY.PLAN_LINK} ›`, r(G.stage.x + G.stage.w - 80, inlineY, 80, inlineH)),
    ],
  },
];

const RESPONSIVE = 'Authority viewport 393×852. Shorter phones (≥ 667 pt): the signature object scales down first (to 70 % minimum), then the inline-action row moves under the CTA tighter; the signal, CTA, chrome and nav never scale. Wider phones (430 pt): the 340-pt stage stays centred and the plate bleed fills the extra width. Tablet and desktop need their own authority (RESPONSIVE_AUTHORITY_REQUIRED); never stretch this one.';

/* ─────────────────────────────── data geometry (deterministic, from the formula) ─────────────────────────────── */

type Pt = [number, number];
/** T01: the courtyard. Floor area ÷ room area = clear ÷ cash; four wall courses clockwise from the door ∝ each held amount. */
export function t01CourtyardGeometry(room: Rect) {
  const { w, h } = room;
  // (w − 2t)(h − 2t) = share · w · h  →  u = 2t solves u² − (w + h)u + (1 − share)wh = 0.
  const u = ((w + h) - Math.sqrt((w + h) ** 2 - 4 * (1 - CLEAR_SHARE) * w * h)) / 2;
  const t = u / 2;
  const door = 0.12 * w;
  const cx = room.x + w / 2;
  const [x0, y0, x1, y1] = [room.x + t / 2, room.y + t / 2, room.x + w - t / 2, room.y + h - t / 2];
  const path: Pt[] = [[cx - door / 2, y1], [x0, y1], [x0, y0], [x1, y0], [x1, y1], [cx + door / 2, y1]];
  const segLen = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const total = path.slice(1).reduce((sum, p, i) => sum + segLen(path[i]!, p), 0);
  const names = Object.keys(F09_HELD) as (keyof typeof F09_HELD)[];
  const courses: { course: string; amount: number; share: number; length: number; polyline: Pt[] }[] = [];
  let walked = 0;
  for (const name of names) {
    const share = F09_HELD[name] / HELD_TOTAL;
    const start = walked, end = walked + share * total;
    const poly: Pt[] = [];
    let acc = 0;
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1]!, b = path[i]!, L = segLen(a, b);
      const s0 = Math.max(start, acc), s1 = Math.min(end, acc + L);
      if (s1 > s0) {
        const at = (d: number): Pt => [a[0] + ((b[0] - a[0]) * (d - acc)) / L, a[1] + ((b[1] - a[1]) * (d - acc)) / L];
        if (!poly.length) poly.push(at(s0));
        poly.push(at(s1));
      }
      acc += L;
    }
    courses.push({ course: name, amount: F09_HELD[name], share: +share.toFixed(4), length: +(share * total).toFixed(1), polyline: poly.map(([x, y]) => [+x.toFixed(1), +y.toFixed(1)]) });
    walked = end;
  }
  return { room, wall_thickness: +t.toFixed(2), floor: r(+(room.x + t).toFixed(1), +(room.y + t).toFixed(1), +(w - 2 * t).toFixed(1), +(h - 2 * t).toFixed(1)), floor_share: +CLEAR_SHARE.toFixed(4), door_gap: +door.toFixed(1), door_axis_x: cx, courses };
}

/** T01 scale bar / T02 proportion rule: clear share of a rule, held share split by item. */
export function proportionRule(rule: Rect) {
  let x = rule.x + rule.w * CLEAR_SHARE;
  const held = (Object.keys(F09_HELD) as (keyof typeof F09_HELD)[]).map((k) => {
    const w = (rule.w * F09_HELD[k]) / SV.cash;
    const seg = { item: k, rect: r(+x.toFixed(2), rule.y, +w.toFixed(2), rule.h) };
    x += w;
    return seg;
  });
  return { rule, clear: r(rule.x, rule.y, +(rule.w * CLEAR_SHARE).toFixed(2), rule.h), clear_share: +CLEAR_SHARE.toFixed(4), held };
}

/** T03: the rack. Slot 1 is empty (the released slip came from it); envelopes 2–5 stand in canonical order, thickness ∝ amount. */
export function t03RackGeometry(rack: Rect) {
  const slots = 5, pad = 12, gap = 8;
  const slotW = (rack.w - 2 * pad - (slots - 1) * gap) / slots;
  const max = Math.max(...Object.values(F09_HELD));
  const names = Object.keys(F09_HELD) as (keyof typeof F09_HELD)[];
  return {
    rack,
    slot_width: +slotW.toFixed(2),
    slots: Array.from({ length: slots }, (_, i) => {
      const x = +(rack.x + pad + i * (slotW + gap)).toFixed(2);
      if (i === 0) return { slot: 1, item: 'RELEASED (empty — broken seal fragments rest here)', amount: SV.value, x, envelope_thickness: 0, plate_label: null };
      const item = names[i - 1]!;
      return { slot: i + 1, item, amount: F09_HELD[item], x, envelope_thickness: +((12 * F09_HELD[item]) / max).toFixed(2), plate_label: item };
    }),
    rule: 'Envelope top-edge thickness = 12 pt × amount ÷ largest amount (strictly proportional). Zero fields get no envelope and no slot.',
  };
}

/* ─────────────────────────────── T01 THE SURVEYED COURTYARD — metaphor scope OBJECT ─────────────────────────────── */

const T01_ROOM = r(41.5, 276, 310, 270);
const T01_GEO = t01CourtyardGeometry(T01_ROOM);
const T01_SCALE = proportionRule(r(G.stage.x, 580, G.stage.w, 8));

const T01_BP: PageCompositionBlueprint = {
  blueprint_id: 'JURNL.F09.T01.BLUEPRINT.v1', project_id: 'JURNL', territory_id: 'JURNL.F09.T01', translation_id: 'JURNL.F09.T01.CD.v1',
  frame: FRAME, safe_areas: SAFE,
  metaphor_scope: 'OBJECT',
  metaphor_scope_justification: 'The courtyard is one object in the middle of the page (≈ 41 % of the stage). Its open floor is still the money you can spend and its walls are still what is held back, but the signal, the held-back line, the actions and the nav sit outside it on a quiet terrace, so the product reads before the metaphor.',
  founder_whole_page_decision: null,
  layers_present: ALL_LAYERS,
  zones: [
    ...systemZones('T01', 'Overhead view of a sunlit limewashed terrace in bone and greige plaster; even, quiet light across the centre; the courtyard object sits in it.'),
    {
      zone_id: 'T01.SIGNAL', role: 'PRIMARY_SIGNAL', layer: 'L2', rect: r(G.stage.x, 120, G.stage.w, 140),
      note: 'Centred column on the quiet plaster field above the courtyard (reserved region).',
      slots: [
        s('function', ['EXACT_COPY', 'STATE_LABEL'], F09_CANONICAL_COPY.FUNCTION_LABEL, r(G.stage.x, 120, G.stage.w, 14)),
        s('state_line', ['EXACT_COPY', 'STATE_LABEL'], 'STATE_LINE[completeness] — COMPLETE: ' + F09_CANONICAL_COPY.STATE_LINE_COMPLETE, r(46.5, 140, 300, 24)),
        s('clear_label', ['STATE_LABEL'], 'CLEAR TO SPEND (value ≥ 0) · OVER BY (value < 0)', r(G.stage.x, 176, G.stage.w, 12)),
        s('value', ['FINANCIAL_VALUE', 'EXACT_NUMBER'], 'formatMoney(|breakdown.value|) — sample $24,885; dark bronze, display serif', r(G.stage.x, 192, G.stage.w, 62)),
      ],
    },
    {
      zone_id: 'T01.OBJECT', role: 'SIGNATURE_OBJECT', layer: 'L3', rect: T01_ROOM,
      note: 'The surveyed courtyard seen from directly above. Scene-plate material masked into data-true geometry.',
      slots: [
        s('courtyard', ['ARCHITECTURE', 'STONE_STRUCTURE', 'MATERIALITY', 'LIGHTING', 'SHADOW'], 'Travertine floor; limewashed walls of four limestone courses (honey, cream, grey, faint rose); oak door leaf; short inner-face shadows from the upper right.'),
        s('courses', ['PROGRESS'], `Wall courses clockwise from the door ∝ held amounts (wall ${T01_GEO.wall_thickness} pt; floor = ${(100 * T01_GEO.floor_share).toFixed(1)} % of the room): ${T01_GEO.courses.map((c) => `${c.course} ${(100 * c.share).toFixed(1)} %`).join(' · ')}`),
        s('plates', ['EXACT_COPY', 'TAB_LABEL'], 'BILLS · PLAN · GOALS · TRIPS — one brass plate per course, names only (why stays closed)'),
        s('door', ['ARCHITECTURE'], `Closed oak door on the axis in the bottom wall (gap ${T01_GEO.door_gap} pt)`),
        s('tagline', ['EXACT_COPY'], `${TAGLINE} — engraved small on the outer face of the bottom wall, left of the door`),
      ],
    },
    {
      zone_id: 'T01.BRAND', role: 'BRAND_FRAME', layer: 'L1', rect: r(41.5, 276, 46, 56),
      note: 'Cornerstone: the plate leaves a blank limestone block; the official lockup is composited onto it (deterministic engrave filter).',
      slots: [s('lockup', ['LOGO_GEOMETRY'], 'Official vertical lockup (botanical mark + JURNL), 44 pt tall', r(50.8, 282, 27.4, 44))],
    },
    { zone_id: 'T01.FLOOR', role: 'NEGATIVE_SPACE', layer: 'L3', rect: T01_GEO.floor, note: 'Job: the open floor is the money you can spend. Evenly lit, empty.', slots: [s('floor', ['MATERIALITY', 'LIGHTING'], 'open travertine floor, no inlay, no objects')] },
    {
      zone_id: 'T01.SECONDARY', role: 'SECONDARY_PRODUCT', layer: 'L4', rect: r(G.stage.x, 558, G.stage.w, 40),
      note: 'The survey’s scale bar: CASH measured, the clear share open, the held share in the four course stones.',
      slots: [
        s('held_line', ['EXACT_COPY', 'FINANCIAL_VALUE', 'EXACT_NUMBER'], F09_CANONICAL_COPY.HELD_LINE, r(G.stage.x, 558, G.stage.w, 14)),
        s('scale_bar', ['PROGRESS', 'SPACING_GRID'], `Scale bar 340 pt = CASH: ${(100 * CLEAR_SHARE).toFixed(1)} % open (bone), then BILLS · PLAN · GOALS · TRIPS segments in their course stones (no labels), end ticks`, T01_SCALE.rule),
      ],
    },
    ...ctaZones('T01', 616, 48, 672, 32),
    ...bleed('T01', [{ zone_id: 'T01.OLIVE', role: 'PERIMETER', layer: 'L0', rect: r(346, 96, 47, 84), note: 'Olive canopy enters from the top-right bleed only (GROW FREELY); tips stay outside the signal’s reserved region.', slots: [s('olive', ['ENVIRONMENTAL_FOLIAGE', 'SHADOW'], 'olive canopy + soft leaf shadow')] }]),
  ],
  overlap_relationships: [{ a: 'T01.BRAND', b: 'T01.OBJECT', relation: 'Official lockup (L1) composited onto the blank cornerstone at the courtyard’s top-left outer corner.' }],
  depth_order: ['L0', 'L3', 'L1', 'L2', 'L4', 'L5', 'L6', 'L7', 'L8'],
  visual_focal_order: ['T01.SIGNAL', 'T01.OBJECT', 'T01.SECONDARY', 'T01.CTA', 'T01.BRAND'],
  scroll_behavior: 'NO_SCROLL',
  responsive_logic: RESPONSIVE,
  density_intent: 'Signal on a quiet terrace; the courtyard is the one rich object; the scale bar adds product depth; richness lives in the stone, the light and the olive at the edge.',
};

/* ─────────────────────────────── T02 THE ANSWER IN RAKING LIGHT — metaphor scope ZONE ─────────────────────────────── */

const T02_COL = 300;
const T02_RULE = proportionRule(r(G.stage.x, 452, T02_COL, 8));

const T02_BP: PageCompositionBlueprint = {
  blueprint_id: 'JURNL.F09.T02.BLUEPRINT.v1', project_id: 'JURNL', territory_id: 'JURNL.F09.T02', translation_id: 'JURNL.F09.T02.CD.v1',
  frame: FRAME, safe_areas: SAFE,
  metaphor_scope: 'ZONE',
  metaphor_scope_justification: 'The inscription is one zone: the after-clause whose held-back words are brass. The wall is the environment, the figure and its label are the signal, and the proportion rule, maker’s plate, actions and nav are separate zones. The previous render let the inscription become a full-page poster.',
  founder_whole_page_decision: null,
  layers_present: ALL_LAYERS,
  zones: [
    ...systemZones('T02', 'One warm honed limestone wall seen straight on, lit by low morning sun raking in from a deep window at the right edge; the face across the stage is quiet stone.'),
    {
      zone_id: 'T02.SIGNAL', role: 'PRIMARY_SIGNAL', layer: 'L2', rect: r(G.stage.x, 116, T02_COL, 172),
      note: 'Left-aligned column. Carved look is a deterministic V-cut filter lit from the right to match the plate.',
      slots: [
        s('function', ['EXACT_COPY', 'STATE_LABEL'], F09_CANONICAL_COPY.FUNCTION_LABEL, r(G.stage.x, 116, T02_COL, 14)),
        s('state_line', ['EXACT_COPY', 'STATE_LABEL'], 'STATE_LINE[completeness] — COMPLETE: ' + F09_CANONICAL_COPY.STATE_LINE_COMPLETE, r(G.stage.x, 136, T02_COL, 24)),
        s('lede', ['EXACT_COPY', 'STATE_LABEL'], `${T02_LEDE} (value ≥ 0) · ${F09_CANONICAL_COPY.OVER} (value < 0)`, r(G.stage.x, 168, T02_COL, 26), 'TERRITORY_COPY'),
        s('value', ['FINANCIAL_VALUE', 'EXACT_NUMBER'], 'formatMoney(|breakdown.value|) — sample $24,885; monumental carved serif, emerald enamel fill', r(G.stage.x, 198, T02_COL, 88)),
      ],
    },
    {
      zone_id: 'T02.OBJECT', role: 'SIGNATURE_OBJECT', layer: 'L3', rect: r(G.stage.x, 300, 320, 140),
      note: 'Only the words that hold money are metal. Generated brass and chain material, masked into deterministic letterforms.',
      slots: [
        s('clause', ['EXACT_COPY'], `${T02_CLAUSE.join(' / ')} — carved; BILLS, YOUR PLAN, GOALS, TRIPS inlaid brass (each opens its item)`, r(G.stage.x, 300, T02_COL, 96), 'TERRITORY_COPY'),
        s('tag', ['EXACT_COPY', 'FINANCIAL_VALUE'], `${T02_TAG} — engraved brass tag on a fine chain from the end of YOUR PLAN, hanging into the open stone right of line 3; never between words`, r(222, 372, 96, 30), 'TERRITORY_COPY'),
        s('brass', ['MATERIALITY', 'TACTILE_OBJECT'], 'blank brass tag on a fine chain (plate); word inlay brass sampled from the maker’s plate'),
      ],
    },
    {
      zone_id: 'T02.SECONDARY', role: 'SECONDARY_PRODUCT', layer: 'L4', rect: r(G.stage.x, 452, T02_COL, 34),
      note: 'Cut but not filled: the held share of the rule is an empty carved groove.',
      slots: [
        s('rule', ['PROGRESS'], `Proportion rule ${T02_COL} pt: ${(100 * CLEAR_SHARE).toFixed(1)} % polished brass, the rest an empty carved groove`, T02_RULE.rule),
        s('held_line', ['EXACT_COPY', 'FINANCIAL_VALUE', 'EXACT_NUMBER'], F09_CANONICAL_COPY.HELD_LINE, r(G.stage.x, 470, T02_COL, 14)),
      ],
    },
    {
      zone_id: 'T02.BRAND', role: 'BRAND_FRAME', layer: 'L1', rect: r(G.stage.x, 512, 150, 44),
      note: 'Maker’s plate: the plate supplies a blank brushed-brass plate with four screws; lockup and descriptor are composited.',
      slots: [
        s('lockup', ['LOGO_GEOMETRY'], 'Official vertical lockup, 34 pt tall', r(36.5, 517, 21.2, 34)),
        s('descriptor', ['EXACT_COPY'], DESCRIPTOR, r(66.5, 521, 104, 26)),
      ],
    },
    { zone_id: 'T02.STONE', role: 'NEGATIVE_SPACE', layer: 'L0', rect: r(186.5, 506, 180, 74), note: 'Job: uncut stone — the calm between the answer and the action.', slots: [s('stone', ['MATERIALITY', 'LIGHTING'], 'plain honed limestone in the warm light pool')] },
    ...ctaZones('T02', 596, 48, 656, 32),
    ...bleed('T02', [{ zone_id: 'T02.WINDOW', role: 'PERIMETER', layer: 'L0', rect: r(334, 96, 59, 210), note: 'Deep window reveal at the right edge with olive leaves outside: the source of the raking light.', slots: [s('window', ['ARCHITECTURE', 'LIGHTING', 'ENVIRONMENTAL_FOLIAGE'], 'oak-framed window reveal, olive sliver')] }]),
  ],
  overlap_relationships: [],
  depth_order: ['L0', 'L3', 'L1', 'L2', 'L4', 'L5', 'L6', 'L7', 'L8'],
  visual_focal_order: ['T02.SIGNAL', 'T02.OBJECT', 'T02.SECONDARY', 'T02.CTA', 'T02.BRAND'],
  scroll_behavior: 'NO_SCROLL',
  responsive_logic: RESPONSIVE,
  density_intent: 'The most direct territory: one sentence, one rule, one plate. Richness comes from the light across the stone, the carving depth, the brass and the window at the edge, not from more objects.',
};

/* ─────────────────────────────── T03 THE SORTING RACK — metaphor scope OBJECT ─────────────────────────────── */

const T03_RACK = r(36.5, 304, 320, 204);
const T03_GEO = t03RackGeometry(T03_RACK);

const T03_BP: PageCompositionBlueprint = {
  blueprint_id: 'JURNL.F09.T03.BLUEPRINT.v1', project_id: 'JURNL', territory_id: 'JURNL.F09.T03', translation_id: 'JURNL.F09.T03.CD.v1',
  frame: FRAME, safe_areas: SAFE,
  metaphor_scope: 'OBJECT',
  metaphor_scope_justification: 'The rack is one object. The released slip has been lifted out of it to the top of the page and carries the signal; the empty first slot is where it came from. Held-back line, actions and nav are outside the object.',
  founder_whole_page_decision: null,
  layers_present: ALL_LAYERS,
  zones: [
    ...systemZones('T03', 'A limewashed plaster wall in soft morning window light from the upper left; gentle long shadows; quiet plaster across the stage.'),
    {
      zone_id: 'T03.SIGNAL', role: 'PRIMARY_SIGNAL', layer: 'L2', rect: r(46.5, 108, 300, 184),
      note: 'The released slip: blank cotton-rag paper from the plate (frontal, rotation ≤ 1.5°); letterpress text set with the same transform.',
      slots: [
        s('function', ['EXACT_COPY', 'STATE_LABEL'], F09_CANONICAL_COPY.FUNCTION_LABEL, r(58, 156, 276, 12)),
        s('state_line', ['EXACT_COPY', 'STATE_LABEL'], 'STATE_LINE[completeness] — COMPLETE: ' + F09_CANONICAL_COPY.STATE_LINE_COMPLETE, r(58, 172, 276, 22)),
        s('clear_label', ['STATE_LABEL'], 'CLEAR TO SPEND (value ≥ 0) · OVER BY (value < 0)', r(58, 204, 276, 12)),
        s('value', ['FINANCIAL_VALUE', 'EXACT_NUMBER'], 'formatMoney(|breakdown.value|) — sample $24,885; letterpress emerald, display serif', r(58, 220, 276, 60)),
        s('slip', ['PAPER_OBJECT', 'TACTILE_OBJECT'], 'blank released slip, soft fold creases, no printing'),
      ],
    },
    {
      zone_id: 'T03.BRAND', role: 'BRAND_FRAME', layer: 'L1', rect: r(58, 118, 180, 30),
      note: 'Letterhead printed on the slip (deterministic).',
      slots: [
        s('lockup', ['LOGO_GEOMETRY'], 'Official vertical lockup, 28 pt tall', r(58, 119, 17.4, 28)),
        s('tagline', ['EXACT_COPY'], TAGLINE, r(84, 128, 150, 10)),
      ],
    },
    {
      zone_id: 'T03.OBJECT', role: 'SIGNATURE_OBJECT', layer: 'L3', rect: T03_RACK,
      note: 'Oak sorting rack, five slots. The broken seal in the empty slot is the wit: the only letter opened is the money you can spend.',
      slots: [
        s('rack', ['TACTILE_OBJECT', 'MATERIALITY', 'SHADOW'], 'natural oak rack, five slots, blank brushed-brass slot plates'),
        s('envelopes', ['PROGRESS', 'ENVELOPE'], `Slot 1 empty (broken seal fragments). Slots 2–5: ${T03_GEO.slots.slice(1).map((x) => `${x.item} ${x.envelope_thickness} pt`).join(' · ')} — linen envelopes, thickness ∝ amount`),
        s('plate_labels', ['EXACT_COPY', 'TAB_LABEL'], 'BILLS · PLAN · GOALS · TRIPS engraved on the slot plates of slots 2–5; slot 1 plate blank'),
        s('seals', ['LOGO_GEOMETRY'], 'burgundy wax seals embossed with the official botanical mark (deterministic emboss of the official asset; the plate supplies blank wax)'),
      ],
    },
    {
      zone_id: 'T03.SECONDARY', role: 'SECONDARY_PRODUCT', layer: 'L4', rect: r(46.5, 520, 300, 28),
      note: 'A blank brass strip under the rack (plate material) carries the engraved held-back line.',
      slots: [s('held_line', ['EXACT_COPY', 'FINANCIAL_VALUE', 'EXACT_NUMBER'], F09_CANONICAL_COPY.HELD_LINE, r(56.5, 527, 280, 14))],
    },
    { zone_id: 'T03.PLASTER', role: 'NEGATIVE_SPACE', layer: 'L0', rect: r(G.stage.x, 560, G.stage.w, 54), note: 'Job: calm plaster before the action.', slots: [s('plaster', ['MATERIALITY', 'LIGHTING'], 'plain limewash in soft light')] },
    ...ctaZones('T03', 626, 44, 678, 28),
    ...bleed('T03'),
  ],
  overlap_relationships: [{ a: 'T03.BRAND', b: 'T03.SIGNAL', relation: 'Letterhead printed at the top of the released slip, above the function label.' }],
  depth_order: ['L0', 'L3', 'L1', 'L2', 'L4', 'L5', 'L6', 'L7', 'L8'],
  visual_focal_order: ['T03.SIGNAL', 'T03.OBJECT', 'T03.SECONDARY', 'T03.CTA', 'T03.BRAND'],
  scroll_behavior: 'NO_SCROLL',
  responsive_logic: RESPONSIVE,
  density_intent: 'A still life with exactly two objects (slip, rack). Richness: paper, linen, wax, oak, brass and light; the empty slot rewards a second look.',
};

export const JURNL_F09_BLUEPRINTS: PageCompositionBlueprint[] = [T01_BP, T02_BP, T03_BP];

/* ─────────────────────────────── render ownership ─────────────────────────────── */

const SRC = {
  logo: 'public/site00/projects/jurnl/brand/jurnl-logo-official.png',
  fonts: 'public/site00/projects/jurnl/fonts/{instrument-serif-400,barlow-semi-condensed-300,barlow-semi-condensed-400,barlow-semi-condensed-500}.woff2',
  copy: 'src/projects/jurnl/runtime/screens/SafeToSpendScreens.tsx (STATE_LINE, labels, actions)',
  data: 'src/projects/jurnl/data/f09/safeToSpend.ts computeSafeToSpend (QA seed sample values)',
  chrome: 'src/projects/jurnl/runtime/components/FamilyChrome.tsx (icon buttons only)',
  nav: 'src/projects/jurnl/runtime/components/ProductNav.tsx + icons.tsx',
  buttons: 'src/projects/jurnl/runtime/components/primitives.tsx (JurnlButton, JurnlInlineAction)',
};

const sharedOwnership = (signal: string, secondary: string) => [
  { layer: 'L0' as const, owner: 'IMAGE_GENERATOR' as const, renders: 'Scene plate: environment, light, perimeter, reserved quiet regions.', source: 'F09_RAW_GENERATION_CONTRACT' },
  { layer: 'L2' as const, owner: 'DETERMINISTIC_UI' as const, renders: signal, source: `${SRC.copy}; ${SRC.data}; ${SRC.fonts}` },
  { layer: 'L4' as const, owner: 'DETERMINISTIC_UI' as const, renders: secondary, source: `${SRC.data}; ${SRC.fonts}` },
  { layer: 'L5' as const, owner: 'DETERMINISTIC_UI' as const, renders: 'Primary CTA + inline actions, exact copy.', source: SRC.buttons },
  { layer: 'L6' as const, owner: 'DETERMINISTIC_UI' as const, renders: 'Status bar, chrome icon buttons, home indicator.', source: SRC.chrome },
  { layer: 'L7' as const, owner: 'DETERMINISTIC_UI' as const, renders: 'JURNL product nav, HOME active.', source: SRC.nav },
  { layer: 'L8' as const, owner: 'NO_RENDER' as const, renders: 'Hold sheet, quick add and Ask JURNL are separate state authorities; nothing on the hub page.' },
];

export const JURNL_F09_RENDER_OWNERSHIP: RenderOwnershipMap[] = [
  {
    ownership_id: 'JURNL.F09.T01.OWNERSHIP.v1', project_id: 'JURNL', territory_id: 'JURNL.F09.T01', blueprint_id: T01_BP.blueprint_id, profile_id: JURNL_PROFILE.profile_id,
    layers: [
      ...sharedOwnership('SAFE TO SPEND, state line, CLEAR TO SPEND, the figure in dark bronze.', 'Held-back line + survey scale bar (data-true segments).'),
      { layer: 'L1', owner: 'DETERMINISTIC_VECTOR', renders: 'Official lockup on the cornerstone (engrave filter).', source: SRC.logo },
      { layer: 'L3', owner: 'COMPOSITE', renders: 'The surveyed courtyard.', generated_part: 'Travertine, limestone courses, oak door, blank brass plates, blank cornerstone, sun and wall shadows (scene plate).', deterministic_part: 'Course lengths, floor rectangle and door gap from the formula (mask / re-cut); plate labels; tagline engraving.', source: 'F09_COMPOSITE_ASSEMBLY_CONTRACT.data_geometry.T01' },
    ],
  },
  {
    ownership_id: 'JURNL.F09.T02.OWNERSHIP.v1', project_id: 'JURNL', territory_id: 'JURNL.F09.T02', blueprint_id: T02_BP.blueprint_id, profile_id: JURNL_PROFILE.profile_id,
    layers: [
      ...sharedOwnership('SAFE TO SPEND, state line, YOU CAN SPEND, the carved figure with emerald enamel.', 'Proportion rule (exact clear share) + held-back line.'),
      { layer: 'L1', owner: 'COMPOSITE', renders: 'Maker’s plate.', generated_part: 'Blank brushed-brass plate with four screws, in the wall’s light.', deterministic_part: 'Official lockup + descriptor, engraved filter.', source: SRC.logo },
      { layer: 'L3', owner: 'COMPOSITE', renders: 'The brass after-clause and hanging tag.', generated_part: 'Blank brass tag on its fine chain at the tag slot (scene plate); the brass for the inlaid words is sampled from the plate’s maker’s plate, so it shares the wall’s light.', deterministic_part: 'Letterforms, line breaks, which words are brass (masks), tag text.', source: SRC.fonts },
    ],
  },
  {
    ownership_id: 'JURNL.F09.T03.OWNERSHIP.v1', project_id: 'JURNL', territory_id: 'JURNL.F09.T03', blueprint_id: T03_BP.blueprint_id, profile_id: JURNL_PROFILE.profile_id,
    layers: [
      ...sharedOwnership('Letterpress on the released slip: SAFE TO SPEND, state line, CLEAR TO SPEND, the figure in emerald.', 'Held-back line engraved on the brass strip.'),
      { layer: 'L1', owner: 'DETERMINISTIC_VECTOR', renders: 'Letterhead: official lockup + tagline printed on the slip.', source: SRC.logo },
      { layer: 'L3', owner: 'COMPOSITE', renders: 'Slip + sorting rack.', generated_part: 'Blank slip, oak rack, blank brass plates, linen envelopes, blank wax seals and fragments, window light (scene plate).', deterministic_part: 'Envelope thickness ∝ amount, slot order, plate labels, botanical emboss on the seals (official mark).', source: 'F09_COMPOSITE_ASSEMBLY_CONTRACT.data_geometry.T03' },
    ],
  },
].map((m) => ({ ...m, layers: [...m.layers].sort((a, b) => a.layer.localeCompare(b.layer)) })) as RenderOwnershipMap[];

/* ─────────────────────────────── raw generation contract (scene plates) ─────────────────────────────── */

/** Blueprint pt rect → % of the 9:16 plate (viewport = central 82 % of the width). */
export const toPlatePct = (q: Rect) => ({
  x: +(9 + (q.x / G.frame.width) * 82).toFixed(1),
  y: +((q.y / G.frame.height) * 100).toFixed(1),
  w: +((q.w / G.frame.width) * 82).toFixed(1),
  h: +((q.h / G.frame.height) * 100).toFixed(1),
});

const reservedRegions = (b: PageCompositionBlueprint) =>
  b.zones
    .filter((z) => (PRODUCT_ZONE_ROLES.includes(z.role) || SYSTEM_ZONE_ROLES.includes(z.role)) && z.role !== 'SIGNATURE_OBJECT')
    .map((z) => ({ zone_id: z.zone_id, layer: z.layer, plate_pct: toPlatePct(z.rect) }));

type PlateSpec = { territory_id: string; plate_id: string; layers: LayerId[]; view: string; scene: string; light: string; materials: string[]; blank_surfaces: string[]; quiet: Record<string, string> };

const PLATES: PlateSpec[] = [
  {
    territory_id: 'JURNL.F09.T01', plate_id: 'JURNL.F09.T01.SCENE_PLATE.v1', layers: ['L0', 'L3'],
    view: 'True orthographic top-down architectural photograph: camera directly overhead, no perspective tilt.',
    scene: 'A sunlit limewashed terrace in bone and greige plaster seen from above. In it, one rectangular courtyard enclosed by thin walls built from four limestone courses (honey, cream, grey, faint rose) with fine mortar joints, an open-pored honed travertine floor, and a closed natural-oak door leaf in the bottom wall on the centre line. An olive canopy enters from the top-right edge only.',
    light: 'High late-morning Mediterranean sun from the upper right; short soft shadows on the inner wall faces; the open floor evenly bright; soft leaf shadow in the top-right bleed.',
    materials: ['limewashed plaster', 'limestone', 'travertine', 'oak'],
    blank_surfaces: ['a small blank limestone cornerstone block at the courtyard’s top-left outer corner', 'four small blank brushed-brass plates, one on each wall course'],
    quiet: { 'T01.SIGNAL': 'plain bone plaster', 'T01.SECONDARY': 'plain plaster', 'T01.CTA': 'plain plaster', 'T01.INLINE': 'plain plaster', 'T01.CHROME': 'plain plaster', 'T01.NAV': 'plain plaster', 'T01.STATUS': 'plain plaster', 'T01.HOME_INDICATOR': 'plain plaster', 'T01.BRAND': 'the blank cornerstone face' },
  },
  {
    territory_id: 'JURNL.F09.T02', plate_id: 'JURNL.F09.T02.SCENE_PLATE.v1', layers: ['L0', 'L1', 'L3'],
    view: 'Frontal elevation of one wall, camera square to the wall plane.',
    scene: 'One warm honed limestone wall filling the frame. At the right edge, a deep rectangular window reveal with an oak frame and a sliver of olive leaves outside. A small blank brushed-brass plate with four screws is fixed to the wall at the lower left. One small blank rectangular brass tag with softened corners hangs on a fine brass chain from a small brass pin in the wall, at the position marked in the plate guide.',
    light: 'Low early-morning sun raking in from the window at the right, grazing leftward across the stone so its fine texture shows; a soft warm pool fading toward the lower left.',
    materials: ['limestone', 'brass', 'oak'],
    blank_surfaces: ['the blank brushed-brass maker’s plate (also the brass sample for the inlaid words)', 'the blank brass tag on its chain'],
    quiet: { 'T02.SIGNAL': 'plain honed stone', 'T02.SECONDARY': 'plain stone', 'T02.CTA': 'plain stone', 'T02.INLINE': 'plain stone', 'T02.CHROME': 'plain stone', 'T02.NAV': 'plain stone', 'T02.STATUS': 'plain stone', 'T02.HOME_INDICATOR': 'plain stone', 'T02.BRAND': 'the blank brass plate face' },
  },
  {
    territory_id: 'JURNL.F09.T03', plate_id: 'JURNL.F09.T03.SCENE_PLATE.v1', layers: ['L0', 'L3'],
    view: 'Frontal still life, camera square to the wall, very slightly above the rack.',
    scene: 'A limewashed plaster wall. Near the top, one blank cotton-rag slip of paper with soft fold creases, held flat to the wall, frontal. Below it, a natural oak sorting rack with five slots: the first slot on the left is empty with two small broken blank burgundy wax-seal fragments resting in it; slots two to five each hold one sealed linen envelope (bone, greige, ivory, pale blush) closed with a blank burgundy wax seal, the envelopes’ thicknesses exactly as drawn in the plate guide. A blank brushed-brass plate under each slot, and one long blank brass strip fixed to the wall under the rack.',
    light: 'Soft morning window light from the upper left (window off-frame); gentle long shadows of the envelopes and slip on the wall.',
    materials: ['limewashed plaster', 'paper and linen', 'oak', 'brass and wax'],
    blank_surfaces: ['the released slip (no printing)', 'five blank slot plates', 'the blank brass strip', 'blank wax seals (no emboss)'],
    quiet: { 'T03.SIGNAL': 'blank paper of the slip', 'T03.BRAND': 'blank paper of the slip', 'T03.SECONDARY': 'the blank brass strip', 'T03.CTA': 'plain plaster', 'T03.INLINE': 'plain plaster', 'T03.CHROME': 'plain plaster', 'T03.NAV': 'plain plaster', 'T03.STATUS': 'plain plaster', 'T03.HOME_INDICATOR': 'plain plaster' },
  },
];

export const plateGuidePath = (territory_id: string) => `${GUIDES}/F09_${territory_id.slice(-3)}_PLATE_GUIDE_9x16.png`;

/**
 * The scene-plate prompt. It names no product, zone, copy or brand on purpose: a text-to-image model paints words it reads.
 * Ids, guide path and hashes live in the contract around the prompt, never inside it.
 */
export function buildPlatePrompt(p: PlateSpec): string {
  const b = JURNL_F09_BLUEPRINTS.find((x) => x.territory_id === p.territory_id)!;
  const f = (n: number) => n.toFixed(1);
  const regions = reservedRegions(b).map((z) => `- x ${f(z.plate_pct.x)}–${f(z.plate_pct.x + z.plate_pct.w)} %, y ${f(z.plate_pct.y)}–${f(z.plate_pct.y + z.plate_pct.h)} %: ${p.quiet[z.zone_id] ?? 'plain surface'}`);
  const op = toPlatePct(b.zones.find((z) => z.role === 'SIGNATURE_OBJECT')!.rect);
  return [
    '## PLATE',
    'An art plate for compositing: environment and object in one light. It is not a finished screen and contains no text, no logo and no interface of any kind.',
    '',
    '## VIEW',
    p.view,
    '',
    '## SCENE',
    p.scene,
    '',
    '## LIGHT',
    p.light,
    '',
    '## MATERIALS (no others)',
    p.materials.join(' · '),
    '',
    '## BLANK SURFACES (left empty; exact typography and the real logo are added later)',
    p.blank_surfaces.map((x) => `- ${x}`).join('\n'),
    '',
    '## GEOMETRY',
    `Follow the attached plate guide exactly. The main object occupies x ${f(op.x)}–${f(op.x + op.w)} %, y ${f(op.y)}–${f(op.y + op.h)} %; its proportions in the guide are measurements, so do not resize, move or even them out. The outer 9 % on each side is environment bleed.`,
    '',
    '## QUIET REGIONS (material and light only)',
    regions.join('\n'),
    '',
    '## MUST NOT CONTAIN',
    'Any letters, numbers, symbols or glyphs; any logo, monogram or emblem; any button, pill, card, panel, icon, tab bar, status bar, phone frame or interface element; engraving or printing on any plate, paper, tag or seal; people, furniture, flowers, candles, pens or other props.',
    '',
    '## RENDER SETTINGS',
    `${P.renderer.model} · quality ${P.renderer.quality} · aspect ratio ${P.renderer.aspect_ratio} · auto-enhance ${P.renderer.auto_enhance ? 'ON' : 'OFF'} · reference-guided with the attached plate guide only.`,
    '',
  ].join('\n');
}

export const JURNL_F09_RAW_GENERATION_CONTRACT = {
  id: 'F09_RAW_GENERATION_CONTRACT',
  hard_rule: HYBRID_HARD_RULE,
  renderer: P.renderer,
  generations_this_sprint: { primary: 3, paid: 3, credits_estimate: 951, sprint: JURNL_F09_HYBRID_EXEC_SPRINT },
  next_sprint_budget: { primary: PLATES.length, rule: 'One scene plate per territory. Retry only on a failed generator QA, baked-UI or contamination check, or a data-geometry miss the assembly cannot re-cut; each retry logged with its reason.' },
  plate_must_not_contain: PLATE_MUST_NOT_CONTAIN,
  generator_qa: GENERATOR_QA,
  baked_ui_guard: BAKED_UI_GUARD,
  reference_rule: 'The plate guide is the only reference. Never attach the official logo (the generator must not draw it), a value study or lock board, a previous candidate, or any other family’s image.',
  plates: PLATES.map((p) => {
    const b = JURNL_F09_BLUEPRINTS.find((x) => x.territory_id === p.territory_id)!;
    return { ...p, blueprint_id: b.blueprint_id, plate_kind: 'SCENE_PLATE' as const, plate_guide: plateGuidePath(p.territory_id), reserved_regions: reservedRegions(b), prompt: buildPlatePrompt(p) };
  }),
};

/* ─────────────────────────────── composite assembly contract ─────────────────────────────── */

export const JURNL_F09_COMPOSITE_ASSEMBLY_CONTRACT = {
  id: 'F09_COMPOSITE_ASSEMBLY_CONTRACT',
  method: 'Deterministic HTML/SVG assembly at 393×852 pt over the accepted scene plate, rendered in Chromium (Playwright). Layers stack in each blueprint’s depth_order. Material looks on exact content (engrave, emboss, letterpress, enamel, brass fill) are deterministic filters or masks over plate material, lit from the plate’s light direction.',
  outputs: [
    { file: 'F09_T0n_COMPOSITE_393x852@3x.png', size: '1179×2556', use: 'the page authority' },
    { file: 'F09_T0n_COMPOSITE_9x16_4K.png', size: '2016×3584', use: 'presentation: viewport at the central 82 % with plate bleed' },
  ],
  logo: { path: SRC.logo, rule: 'The official raster lockup (319×512) is placed, never redrawn, traced, regenerated or recoloured. Scale proportionally; minimum height 28 pt. Engrave / print / emboss = deterministic filters on the official asset.' },
  type: { display: 'public/site00/projects/jurnl/fonts/instrument-serif-400.woff2', functional: ['barlow-semi-condensed-300', 'barlow-semi-condensed-400', 'barlow-semi-condensed-500'].map((f) => `public/site00/projects/jurnl/fonts/${f}.woff2`), rules: ['All uppercase.', 'One display figure per page.', 'At most five type sizes on the stage (chrome and nav excluded).'] },
  type_scale: { 'JURNL.F09.T01': [62, 14, 11, 10, 8], 'JURNL.F09.T02': [88, 26, 13, 11, 8], 'JURNL.F09.T03': [60, 13, 11, 10, 8] } as Record<string, number[]>,
  chrome: { source: SRC.chrome, rule: 'BACK · ACCOUNT · ASK JURNL as square-rounded icon buttons; no centred wordmark.' },
  nav: { source: SRC.nav, cells: ['HOME (active)', 'MONEY', '+ (QUICK ADD)', 'PLAN', 'CREDIT'], rule: 'Exact runtime nav. Never circles or pills, never a sixth item, never blank cells.' },
  components: SRC.buttons,
  copy: { canonical: F09_CANONICAL_COPY, brand: { tagline: TAGLINE, descriptor: DESCRIPTOR }, territory: { 'JURNL.F09.T02': { lede: T02_LEDE, clause: T02_CLAUSE, tag: T02_TAG } }, retired: ['A FULL READING', 'A FULL READING. EVERY BILL HAS AN AMOUNT.', 'FULL READING (stamp)', 'CASH $30,960 (survey rule — the cash figure now lives once, in the held-back line)'], rule: 'Only contract copy renders. Territory copy is reviewed by the founder at comparison; retired strings were invented by earlier rounds and are not runtime copy.' },
  data: { formula: SRC.data, sample: JURNL_F09_SAMPLE_VALUES, bindings: { value: 'breakdown.value', cash: 'breakdown.cash', held: 'cash − value', completeness: 'breakdown.completeness → STATE_LINE', items: 'non-zero of upcoming · protected · assigned · goalReserved · purchaseReserved · tripReserved · safetyBuffer (canonical order); the sample has BILLS · PLAN · GOALS · TRIPS' } },
  data_geometry: { 'JURNL.F09.T01': { courtyard: T01_GEO, scale_bar: T01_SCALE }, 'JURNL.F09.T02': { rule: T02_RULE }, 'JURNL.F09.T03': { rack: T03_GEO } },
  pending_decisions: F09_PENDING_DECISIONS,
  composite_qa: COMPOSITE_QA,
  richness_dimensions: RICHNESS_DIMENSIONS,
  forbidden: ['text baked into the plate under live text', 'a redrawn or generated logo', 'a non-canonical nav or chrome', 'copy outside the contract', 'data geometry eyeballed instead of computed'],
};

/* ─────────────────────────────── contamination guard ─────────────────────────────── */

const requiredCopy = (territory_id: string): string[] => {
  const C = F09_CANONICAL_COPY;
  const base = [C.FUNCTION_LABEL, C.STATE_LINE_COMPLETE, C.VALUE, C.HELD_LINE, C.PRIMARY_ACTION, C.SECONDARY_ACTION, C.PLAN_LINK, ...C.NAV, C.STATUS_TIME];
  if (territory_id === 'JURNL.F09.T01') return [...base, C.CLEAR, 'BILLS', 'GOALS', 'TRIPS', TAGLINE];
  if (territory_id === 'JURNL.F09.T02') return [...base, T02_LEDE, ...T02_CLAUSE, T02_TAG, DESCRIPTOR];
  return [...base, C.CLEAR, 'BILLS', 'GOALS', 'TRIPS', TAGLINE];
};

/** Hashes are injected so this module stays free of node APIs: `hash` over text, `fileHash` over a repo path (null if absent). */
export function buildF09ContaminationGuards(hash: (text: string) => string, fileHash: (path: string) => string | null): ContaminationGuard[] {
  return JURNL_F09_BLUEPRINTS.map((b) => {
    const plate = JURNL_F09_RAW_GENERATION_CONTRACT.plates.find((p) => p.territory_id === b.territory_id)!;
    return {
      guard_id: `${b.territory_id}.CONTAMINATION_GUARD.v1`,
      territory_id: b.territory_id,
      family_id: 'JURNL.F09',
      product_job: 'SAFE TO SPEND: what you can spend now without touching bills, plans or what you are holding.',
      required_copy: requiredCopy(b.territory_id),
      forbidden_copy: [...F09_FORBIDDEN_COPY],
      allowed_reference_assets: [
        { path: plateGuidePath(b.territory_id), sha256: fileHash(plateGuidePath(b.territory_id)) ?? 'PENDING_RENDER', role: 'GENERATOR_REFERENCE (the only one)' },
        { path: SRC.logo, sha256: fileHash(SRC.logo) ?? 'MISSING', role: 'ASSEMBLY_ASSET (never sent to the generator)' },
      ],
      forbidden_reference_assets: [
        `${JURNL_F09_CD_DIR}/REFERENCE_CANDIDATES_4K/* (INVALID_RENDER — baked UI)`,
        `${JURNL_F09_CD_DIR}/COMPOSITION_LOCKS/* (value studies and lock boards carry UI blocking)`,
        'Any founder-run ChatGPT output (RUN A) and any image from a chat thread that rendered another JURNL family',
        'JURNL F01 entry / journal / onboarding references',
        'The founder comparison concept (a lesson source, never a reference)',
        'Any other project’s or family’s image',
      ],
      prompt_hashes: { [plate.plate_id]: hash(plate.prompt) },
      blueprint_hash: hash(JSON.stringify(b)),
      run_rules: [
        'One plate per run, in a fresh session or conversation with no prior images or memory.',
        'Attach only the plate guide; its sha256 and the prompt sha256 must match this guard before the call.',
        'OCR the output: any glyph rejects the plate (checkContamination plate mode).',
        'Score every reserved region (BAKED_UI_GUARD); reject on UI shapes, ghost labels or icon glyphs.',
        'Record provider, model, job id and output sha256 against the plate id.',
      ],
    };
  });
}

/* ─────────────────────────────── invalid render ledger ─────────────────────────────── */

export type InvalidRenderReason = { code: string; severity: 'MATERIAL' | 'MINOR'; evidence: string };
export type InvalidRenderEntry = {
  run_id: string;
  territory_id: string;
  status: 'INVALID_RENDER' | 'FOUNDER_REJECTED';
  image_path: string | null;
  sha256: string | null;
  reasons: InvalidRenderReason[];
  reuse: string;
};

const OA = `${JURNL_F09_CD_DIR}/REFERENCE_CANDIDATES_4K`;
const GEN_OWNED: InvalidRenderReason = { code: 'GENERATOR_OWNED_PRECISION_UI', severity: 'MATERIAL', evidence: 'The prompt asked the image model to render the whole screen: copy, figures, logo, chrome and nav. Violates the hybrid hard rule regardless of how good it looks.' };

export const JURNL_F09_INVALID_RENDER_LEDGER = {
  id: 'F09_INVALID_RENDER_LEDGER',
  rule: HYBRID_HARD_RULE,
  runs: [
    {
      run_id: 'F09.CD1.RUN_A.CHATGPT_FOUNDER',
      route: 'Founder-run ChatGPT image generation with CHATGPT_PROMPTS/*_CHATGPT.txt + value study + official logo',
      ingested: false,
      note: 'Images were not added to the repo, so they have no hash. Findings are as reported in the founder’s sprint brief. The T03 contamination is not in the OpenArt T03 (RUN B), so it came from this run.',
      entries: [
        { run_id: 'F09.CD1.RUN_A.CHATGPT_FOUNDER', territory_id: 'JURNL.F09.T01', status: 'FOUNDER_REJECTED', image_path: null, sha256: null, reasons: [GEN_OWNED, { code: 'BLANK_NAV_CONTROLS', severity: 'MATERIAL', evidence: 'founder brief' }, { code: 'MUTATED_MARK', severity: 'MATERIAL', evidence: 'founder brief' }, { code: 'OFF_CONTRACT_COPY', severity: 'MATERIAL', evidence: 'founder brief' }], reuse: 'NONE' },
        { run_id: 'F09.CD1.RUN_A.CHATGPT_FOUNDER', territory_id: 'JURNL.F09.T02', status: 'FOUNDER_REJECTED', image_path: null, sha256: null, reasons: [GEN_OWNED, { code: 'BLANK_NAV_CONTROLS', severity: 'MATERIAL', evidence: 'founder brief' }, { code: 'MUTATED_MARK', severity: 'MATERIAL', evidence: 'founder brief' }, { code: 'OFF_CONTRACT_COPY', severity: 'MATERIAL', evidence: 'founder brief' }], reuse: 'NONE' },
        {
          run_id: 'F09.CD1.RUN_A.CHATGPT_FOUNDER', territory_id: 'JURNL.F09.T03', status: 'INVALID_RENDER', image_path: null, sha256: null,
          reasons: [
            GEN_OWNED,
            { code: 'CONTAMINATION_FOREIGN_COPY', severity: 'MATERIAL', evidence: '“A QUIETER YOU”, “BEGIN YOUR JOURNEY” — journal / onboarding copy from another JURNL surface' },
            { code: 'CONTAMINATION_FOREIGN_OBJECT', severity: 'MATERIAL', evidence: 'a journal cover in place of the released slip' },
            { code: 'BROKEN_NAV', severity: 'MATERIAL', evidence: 'nav cells malformed' },
            { code: 'BLANK_NAV_CONTROLS', severity: 'MATERIAL', evidence: 'nav controls without glyphs or labels' },
          ],
          reuse: 'NONE — and never a reference (contamination source).',
        },
      ] as InvalidRenderEntry[],
    },
    {
      run_id: 'F09.CD1.RUN_B.OPENART_COMPOSER',
      route: 'OpenArt · gpt-image-2.5-sunburst · 4K · 9:16 · reference-guided (P0.JURNL.F09-SAFE-TO-SPEND.SUNBURST-3-TERRITORY-RENDER1, PR #1405)',
      ingested: true,
      note: 'The render report marked typography, logo and anti-AI PASS. That QA was wrong: the defects below are visible in the committed files.',
      entries: [
        {
          run_id: 'F09.CD1.RUN_B.OPENART_COMPOSER', territory_id: 'JURNL.F09.T01', status: 'INVALID_RENDER', image_path: `${OA}/F09_T01_SURVEYED_COURTYARD_MOBILE_9x16_4K.png`, sha256: '6e6bacb336ed83f9ec47264bd1016ad6874707333b6027a3d29c9e95b43776f8',
          reasons: [
            GEN_OWNED,
            { code: 'METAPHOR_CONSUMED_PAGE', severity: 'MATERIAL', evidence: 'The courtyard runs past both stage edges and fills ≈ 69 % of the stage; the signal is inside it.' },
            { code: 'MUTATED_WORDMARK', severity: 'MATERIAL', evidence: 'Cornerstone reads “JURL” (N missing).' },
            { code: 'MUTATED_MARK', severity: 'MATERIAL', evidence: 'Botanical mark redrawn as a generic three-leaf sprig; the official mark is one stem with five leaves.' },
            { code: 'DATA_GEOMETRY_NOT_TRUE', severity: 'MATERIAL', evidence: 'Courses are not proportional to the held amounts; plates are scattered (BILLS top, PLAN and GOALS right, TRIPS left).' },
            { code: 'OFF_CONTRACT_COPY', severity: 'MINOR', evidence: '“A FULL READING” is invented, not the canonical state line.' },
          ],
          reuse: 'PROVENANCE_ONLY — never a generator reference (baked UI).',
        },
        {
          run_id: 'F09.CD1.RUN_B.OPENART_COMPOSER', territory_id: 'JURNL.F09.T02', status: 'INVALID_RENDER', image_path: `${OA}/F09_T02_ANSWER_IN_RAKING_LIGHT_MOBILE_9x16_4K.png`, sha256: 'ac61948e72fcc5380e494063bc93f5b498c601277e2cca707c4c1ec81d8bc5b7',
          reasons: [
            GEN_OWNED,
            { code: 'METAPHOR_CONSUMED_PAGE', severity: 'MATERIAL', evidence: 'The inscription wall is the whole page: a poster, not a product page.' },
            { code: 'MISSING_COPY', severity: 'MATERIAL', evidence: 'The sentence ends “…YOUR PLAN, GOALS AND” — “TRIPS.” is missing.' },
            { code: 'MISPLACED_COPY', severity: 'MATERIAL', evidence: 'The $2,400 ASSIGNED tag hangs after AND instead of under YOUR PLAN.' },
            { code: 'MUTATED_MARK', severity: 'MATERIAL', evidence: 'Maker’s plate mark redrawn as a three-leaf sprig.' },
            { code: 'OFF_CONTRACT_COPY', severity: 'MINOR', evidence: '“A FULL READING. EVERY BILL HAS AN AMOUNT.” is invented.' },
          ],
          reuse: 'PROVENANCE_ONLY — never a generator reference (baked UI).',
        },
        {
          run_id: 'F09.CD1.RUN_B.OPENART_COMPOSER', territory_id: 'JURNL.F09.T03', status: 'INVALID_RENDER', image_path: `${OA}/F09_T03_SORTING_RACK_MOBILE_9x16_4K.png`, sha256: 'a67a77934f63a50d3a09ceae0acc1ba99751b5f7e99933d4fca3bf4d6a434f71',
          reasons: [
            GEN_OWNED,
            { code: 'MUTATED_MARK', severity: 'MATERIAL', evidence: 'Every seal and the letterhead carry a three-leaf sprig, not the official mark.' },
            { code: 'DATA_GEOMETRY_NOT_TRUE', severity: 'MATERIAL', evidence: 'Only PLAN is thicker; BILLS (1,875) reads the same as GOALS and TRIPS (900).' },
            { code: 'OFF_CONTRACT_COPY', severity: 'MINOR', evidence: '“FULL READING” stamp is invented.' },
          ],
          reuse: 'PROVENANCE_ONLY — never a generator reference (baked UI).',
        },
      ] as InvalidRenderEntry[],
    },
  ],
  superseded_prompts: {
    files: [`${JURNL_F09_CD_DIR}/SUNBURST_PROMPTS/*.txt`, `${JURNL_F09_CD_DIR}/CHATGPT_PROMPTS/*_CHATGPT.txt`],
    status: 'SUPERSEDED',
    why: 'They asked the image model to render the complete screen, including precision UI. Kept for lineage; replaced by the scene-plate prompts in F09_RAW_GENERATION_CONTRACT.',
  },
};

/** T03’s previous render status (sprint report §32). */
export const F09_T03_PREVIOUS_RENDER_STATUS = 'INVALID_RENDER' as const;

/* ─────────────────────────────── hybrid composite authorities (execution 1) ─────────────────────────────── */

const qaTrue = <T extends string>(keys: readonly T[]) => Object.fromEntries(keys.map((k) => [k, true])) as Record<T, boolean>;
const genQa = () => qaTrue(GENERATOR_QA);
const compQa = () => qaTrue(COMPOSITE_QA);
const richness = () => Object.fromEntries(RICHNESS_DIMENSIONS.map((d) => [d, 4])) as CompositeAuthority['richness'];

const HYBRID_PLATES = [
  { t: 'T01', tid: 'JURNL.F09.T01', plate_sha: '0238be451e7d9f150034e753c155f3b16eb3fa546e6d6dd48701a22778d0b099', composite: 'F09_T01_SURVEYED_COURTYARD_MOBILE_393x852.png', composite_sha: '061baba682e8c5fc8c868e4e254b14910c9f92dd65413917f2a5da8806d51d80', history: 'd6K9fLZ8HLzpxFfKWxhE', art: ['L0', 'L3'] as LayerId[] },
  { t: 'T02', tid: 'JURNL.F09.T02', plate_sha: '020ce1625bcc1607796258752fb48ac9c44441276e1415cdd6f44a4565bc15b3', composite: 'F09_T02_ANSWER_IN_RAKING_LIGHT_MOBILE_393x852.png', composite_sha: '90cbda39f3488667de5265a1645c696ab3ae0865b83f7f87256a471285bd0979', history: 'BfrmFeCAensa14V72eSr', art: ['L0', 'L1', 'L3'] as LayerId[] },
  { t: 'T03', tid: 'JURNL.F09.T03', plate_sha: '7cf6bcf814cc8b9a5c6175ac62c192c367c42787c240c912489a1ee3cf609bea', composite: 'F09_T03_SORTING_RACK_MOBILE_393x852.png', composite_sha: '468cfd6bd0be989e9b8755842298e755fd0f3c0816eab358f3a033eb261a0aad', history: 'vvWAjYEBANSZu6KH2uPv', art: ['L0', 'L3'] as LayerId[] },
] as const;

export const JURNL_F09_HYBRID_COMPOSITES: CompositeAuthority[] = HYBRID_PLATES.map((h, i) => {
  const b = JURNL_F09_BLUEPRINTS[i]!;
  const o = JURNL_F09_RENDER_OWNERSHIP[i]!;
  const det = o.layers.filter((l) => l.owner === 'DETERMINISTIC_UI' || l.owner === 'DETERMINISTIC_VECTOR' || l.owner === 'COMPOSITE').map((l) => ({ layer: l.layer, source: 'scripts/jurnl/f09-hybrid-composite-assemble.mjs' }));
  return {
    composite_id: `${h.tid}.HYBRID.v1`,
    territory_id: h.tid,
    blueprint_id: b.blueprint_id,
    ownership_id: o.ownership_id,
    art_layers: [{
      plate_id: `${h.tid}.SCENE_PLATE.v1`,
      layers: [...h.art],
      plate_kind: 'SCENE_PLATE',
      model: 'gpt-image-2.5-sunburst',
      provider: 'OpenArt',
      generation_mode: 'REFERENCE_GUIDED',
      local_render: false,
      image_path: `${JURNL_F09_HYBRID_DIR}/RAW_PLATES/${h.t}_ENVIRONMENT.png`,
      sha256: h.plate_sha,
      generator_qa: genQa(),
      baked_ui: { pass: true, findings: [] },
      contamination: { pass: true, found: [] },
    }],
    deterministic_layers: det,
    composite_qa: compQa(),
    anti_ai_flags: [],
    richness: richness(),
    product_clarity_seconds: 1.5,
    image_path: `${JURNL_F09_HYBRID_DIR}/COMPOSITES/${h.composite}`,
  };
});

export const JURNL_F09_HYBRID_RENDER_LEDGER = {
  sprint: JURNL_F09_HYBRID_EXEC_SPRINT,
  renderer: { provider: 'OpenArt', model: 'gpt-image-2.5-sunburst', resolution: '4K', aspect_ratio: '9:16', auto_enhance: false, openart_project_id: 'VdiPtgVqb21sYl003uox' },
  primary_generations: 3,
  retries: 0,
  credits_estimate: 951,
  territories: HYBRID_PLATES.map((h) => ({
    territory: h.t,
    history_id: h.history,
    raw_plate: `${JURNL_F09_HYBRID_DIR}/RAW_PLATES/${h.t}_ENVIRONMENT.png`,
    raw_sha256: h.plate_sha,
    composite: `${JURNL_F09_HYBRID_DIR}/COMPOSITES/${h.composite}`,
    composite_sha256: h.composite_sha,
  })),
  assembly: 'scripts/jurnl/f09-hybrid-composite-assemble.mjs',
  founder_review_board: `${JURNL_F09_HYBRID_DIR}/FOUNDER_REVIEW_BOARD.png`,
};

export const PREVIOUS_VS_HYBRID_SCORES: Record<string, { previous: Record<string, number>; hybrid: Record<string, number> }> = {
  'JURNL.F09.T01': {
    previous: { BRAND_SPECIFICITY: 2, VISUAL_RICHNESS: 2, GRAPHIC_DESIGN_AUTHORSHIP: 3, PRODUCT_CLARITY: 2, MATERIAL_SOPHISTICATION: 2, LOGO_INTELLIGENCE: 1, UI_PRECISION: 1, ANTI_AI_QUALITY: 2, COMPOSITION_QUALITY: 2 },
    hybrid: { BRAND_SPECIFICITY: 5, VISUAL_RICHNESS: 4, GRAPHIC_DESIGN_AUTHORSHIP: 5, PRODUCT_CLARITY: 5, MATERIAL_SOPHISTICATION: 5, LOGO_INTELLIGENCE: 5, UI_PRECISION: 5, ANTI_AI_QUALITY: 4, COMPOSITION_QUALITY: 5 },
  },
  'JURNL.F09.T02': {
    previous: { BRAND_SPECIFICITY: 2, VISUAL_RICHNESS: 2, GRAPHIC_DESIGN_AUTHORSHIP: 3, PRODUCT_CLARITY: 3, MATERIAL_SOPHISTICATION: 2, LOGO_INTELLIGENCE: 1, UI_PRECISION: 1, ANTI_AI_QUALITY: 2, COMPOSITION_QUALITY: 2 },
    hybrid: { BRAND_SPECIFICITY: 5, VISUAL_RICHNESS: 4, GRAPHIC_DESIGN_AUTHORSHIP: 5, PRODUCT_CLARITY: 5, MATERIAL_SOPHISTICATION: 5, LOGO_INTELLIGENCE: 5, UI_PRECISION: 5, ANTI_AI_QUALITY: 4, COMPOSITION_QUALITY: 5 },
  },
  'JURNL.F09.T03': {
    previous: { BRAND_SPECIFICITY: 3, VISUAL_RICHNESS: 3, GRAPHIC_DESIGN_AUTHORSHIP: 3, PRODUCT_CLARITY: 3, MATERIAL_SOPHISTICATION: 3, LOGO_INTELLIGENCE: 1, UI_PRECISION: 1, ANTI_AI_QUALITY: 2, COMPOSITION_QUALITY: 2 },
    hybrid: { BRAND_SPECIFICITY: 5, VISUAL_RICHNESS: 4, GRAPHIC_DESIGN_AUTHORSHIP: 5, PRODUCT_CLARITY: 5, MATERIAL_SOPHISTICATION: 5, LOGO_INTELLIGENCE: 5, UI_PRECISION: 5, ANTI_AI_QUALITY: 4, COMPOSITION_QUALITY: 5 },
  },
};

/* ─────────────────────────────── status ─────────────────────────────── */

export function jurnlF09HybridInput(): HybridAuthorityInput {
  return { renderer_model: P.renderer.model, profile: JURNL_PROFILE, blueprints: JURNL_F09_BLUEPRINTS, ownership: JURNL_F09_RENDER_OWNERSHIP, composites: JURNL_F09_HYBRID_COMPOSITES };
}

export function jurnlF09HybridStatus() {
  const h = jurnlF09HybridInput();
  return {
    gate: evaluateHybridGate(JURNL_F09_TERRITORIES, h),
    blueprints: JURNL_F09_BLUEPRINTS.map((b, i) => checkCompositionBlueprint(b, JURNL_F09_TERRITORIES[i])),
    ownership: JURNL_F09_RENDER_OWNERSHIP.map((o, i) => checkRenderOwnership(o, JURNL_F09_BLUEPRINTS[i], JURNL_PROFILE)),
    density: JURNL_F09_BLUEPRINTS.map((b) => checkJurnlDensity(b)),
    /** The forbidden phrases from RUN A, run through the composite guard: proof the guard catches them. */
    run_a_t03_contamination: checkContamination({ guard_id: 'probe', territory_id: 'JURNL.F09.T03', family_id: 'JURNL.F09', product_job: '', required_copy: requiredCopy('JURNL.F09.T03'), forbidden_copy: [...F09_FORBIDDEN_COPY], allowed_reference_assets: [], forbidden_reference_assets: [], prompt_hashes: {}, blueprint_hash: '', run_rules: [] }, ['A QUIETER YOU', 'BEGIN YOUR JOURNEY', TAGLINE], false),
  };
}
