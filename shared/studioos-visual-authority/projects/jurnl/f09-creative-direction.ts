/**
 * JURNL F09 SAFE TO SPEND — Creative Direction Translation + Brand Expression (correction round 1).
 * Sprint P0.JURNL.F09-SAFE-TO-SPEND.CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1.
 *
 * The three structural territories (T01 THE OPEN FLOOR · T02 THE PLAIN ANSWER · T03 THE OPEN ENVELOPE) are preserved
 * unchanged. Each is translated into the JURNL world through JURNL_CREATIVE_DIRECTION_PROFILE, locked, checked against
 * the brand-expression checklist, and only then turned into a renderer prompt. The renderer executes; it does not design.
 *
 * Package: JURNL/F09_SAFE/CREATIVE_DIRECTION_CORRECTION1/ · export: npx tsx scripts/studioos/jurnl-f09-creative-direction-export.ts
 */
import {
  BRAND_EXPRESSION_CHECKLIST,
  checkBrandExpression,
  checkCreativeDirection,
  checkCreativeDistinctness,
  evaluateCreativeGate,
  type AntiAiAudit,
  type BrandExpressionCheck,
  type BrandExpressionItem,
  type CreativeDirectionGateInput,
  type CreativeDirectionTranslation,
  type CreativeDistinctnessRow,
  type GeneratedCandidate,
} from '../../creative-direction.js';
import { JURNL_CREATIVE_DIRECTION_PROFILE as P } from './creative-direction-profile.js';
import { JURNL_F09_REFERENCES, JURNL_F09_TERRITORIES } from './f09-safe-to-spend.js';

export const JURNL_F09_CD_SPRINT = 'P0.JURNL.F09-SAFE-TO-SPEND.CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1' as const;
export const JURNL_F09_CD_DIR = 'JURNL/F09_SAFE/CREATIVE_DIRECTION_CORRECTION1' as const;

const territory = (id: string) => JURNL_F09_TERRITORIES.find((t) => t.territory_id === id)!;

/* ─────────────────────────────── shared mobile geometry (9:16 frame ↔ 393×852 viewport) ─────────────────────────────── */

/** Percentages of the 9:16 frame. The 393-pt viewport is x 9.0–91.0 %; the stage (CENTER_STAGE, nav footprint) is x 14.5–85.5 %. */
export const F09_FRAME_GEOMETRY = {
  frame: '9:16 portrait. Height = the 852-pt JURNL mobile viewport. The 393-pt viewport is the central 82 % of the width (x 9.0–91.0 %); the outer 9 % on each side is environment bleed only — no text, control or data object there.',
  status_bar: 'y 0–6.9 %: iPhone status bar inside the viewport — time 9:41 at left, signal / wi-fi / battery glyphs at right, in obsidian ink.',
  chrome_row: 'y 6.9–11.2 %: three square-rounded 34-pt icon buttons on bone with a hairline greige border — BACK (left chevron) at the left edge of the stage; ACCOUNT (gear) and ASK JURNL (lowercase-free "i" glyph) side by side at the right edge of the stage. No centred wordmark in the chrome (the lockup lives in the scene).',
  stage: 'x 14.5–85.5 %, y 12.7–83.8 %: the functional field, centred on the vertical axis x 50 % (the + axis).',
  composition_edge: 'y 83.8–88.5 %: empty.',
  nav: 'y 89.4–94.6 %, x 14.5–85.5 %: the JURNL product nav — five equal square-rounded cells (8-pt corner radius) with 4-pt gaps, exactly in this order: HOME (active: deep emerald #0F3D32 fill, bone person icon over the label HOME), MONEY (banknote icon), the centre cell with a single thin plus sign and no label (QUICK ADD), PLAN (clock icon), CREDIT (document icon). Inactive cells: bone #F9F6EF fill at 90 % opacity, 1-pt greige border, obsidian thin-line icon above a tiny tracked uppercase label. Never circles, never pills, never a sixth item.',
  home_indicator: 'y ≈ 97.5 %: the short dark system home-indicator bar, centred.',
} as const;

const NAV_TEXT = ['HOME', 'MONEY', 'PLAN', 'CREDIT'];
const CHROME_TEXT = ['9:41'];

/* ─────────────────────────────── T01 THE OPEN FLOOR → THE SURVEYED COURTYARD ─────────────────────────────── */

const T01: CreativeDirectionTranslation = {
  translation_id: 'JURNL.F09.T01.CD.v1',
  project_id: 'JURNL',
  profile_id: P.profile_id,
  territory_id: 'JURNL.F09.T01',
  structural_premise: territory('JURNL.F09.T01').concept,
  primary_object: territory('JURNL.F09.T01').primary_object,
  functional_metaphor: 'Room = cash; walls = what is held back; open floor = what you can spend.',
  bespoke_visual_idea: 'NEGATIVE SPACE IS THE MONEY. The emptiest, sunniest part of the screen — the open travertine floor of a courtyard seen from directly above — is literally the amount you are free to spend, with the figure inlaid in bronze into that floor like a piazza inscription. The commitments are the courtyard walls, one stone course each, so "what is held back" is what holds the room up. No UI generator puts the answer in the empty space.',
  render_brief: 'A finished mobile app screen for JURNL, a calm Mediterranean personal-finance app, photographed straight down from above like an architect’s survey: a sunlit travertine courtyard enclosed by thin limewashed walls built from four limestone courses, each course with one small screwed brass plate (BILLS, PLAN, GOALS, TRIPS). In the middle of the empty, bright floor the amount $24,885 is inlaid flush in dark bronze like a piazza inscription, with CLEAR TO SPEND small above it and HELD BACK $6,075 small below it. A brass survey rule across the top of the courtyard reads CASH $30,960. A closed oak door in the bottom wall, on the centre line, leads down to a deep-emerald square-cornered button SEE THE FULL BREAKDOWN. A small carved limestone cornerstone with the JURNL botanical logo sits at the courtyard’s top-left corner; an olive canopy just enters the top-right edge. Small SAFE TO SPEND label and A FULL READING above the courtyard; iPhone status bar and square icon buttons at the top; the JURNL five-cell bottom navigation at the bottom.',
  fields: {
    art_direction_premise: 'THE SURVEYED COURTYARD — an orthographic, directly-overhead architectural photograph of one Mediterranean courtyard, annotated like a surveyor’s plan. Built, not drawn.',
    brand_world_translation: 'JURNL’s plaster-and-travertine world stops being a backdrop and becomes the measuring instrument: FINANCIAL LIFE, BEAUTIFULLY ORGANIZED is a well-proportioned room; GROW FREELY is the olive outside its walls.',
    graphic_design_language: 'Surveyor’s drafting over photography: a brass survey rule across the top wall reading CASH $30,960 with end ticks; engraved brass course plates; one monumental bronze floor inlay; hairline captions. Editorial scale contrast between the inlaid figure and the plates.',
    environmental_role: 'The environment IS the data object: courtyard proportions encode the breakdown (floor area ÷ room area = clear ÷ cash; wall course length = each held-back amount). Nothing in the scene is wallpaper.',
    material_language: 'Honed open-pored travertine floor; limewashed plaster walls in bone and greige with limestone copings, one limestone per course (honey, cream, grey, faint rose); dark bronze inlay; brushed champagne brass plates and rule; a natural oak door leaf.',
    tactile_object_language: 'Four stone courses joined by fine mortar lines, each with a small screwed brass plate; a flush bronze inlay you could run a finger over; an oak door leaf, closed.',
    typographic_art_direction: 'Figure: fashion-condensed high-contrast serif cast in dark bronze, inlaid flush. Labels: tracked condensed sans capitals engraved into brass or printed on the plaster wall-top. All uppercase.',
    logo_behavior: 'A small limestone CORNERSTONE plaque set into the top-left outer corner of the courtyard walls, carved with the official botanical mark and the vertical JURNL book-spine wordmark. The brand is the cornerstone of the room. Asymmetric; never in the chrome.',
    brand_lockup_behavior: 'Cornerstone = BOTANICAL MARK + JURNL. Tagline PLAN TODAY. GROW FREELY. engraved small along the outer face of the bottom wall, left of the door, on the paving band.',
    color_hierarchy: 'Travertine ivory (dominant field) → bone / greige plaster walls → ONE dark bronze-emerald figure → champagne brass only on plates and the survey rule → deep emerald only on the primary CTA and active nav cell.',
    lighting_direction: 'High late-morning Mediterranean sun from the upper right; short, soft shadows only along the inner wall faces; the open floor evenly bright — clear means lit.',
    depth_model: 'Orthographic top-down plan view (aerial). The only depth is wall height, read through the inner-face shadows.',
    compositional_tension: 'Rigid orthographic geometry against the organic olive canopy breaking the top-right outer frame; four unequal wall courses inside a symmetric room.',
    negative_space_strategy: 'The open floor is both the negative space and the answer; keep it empty except for the inlay. The bleed and the paving band stay quiet.',
    editorial_wit: 'The emptiest part of the screen is the most valuable one — the money you can spend is the space you have left.',
    custom_designed_element: 'The bronze floor inlay of the figure and the brass survey rule (CASH as the room’s measured width).',
    bespoke_detail: 'Each commitment is its own limestone course with its own brass plate — the commitments literally hold the room up; the closed oak door sits on the + axis and leads straight down to the breakdown.',
    imagery_role: 'Information, not decoration: the photographed courtyard carries the data. The olive canopy (top-right bleed only) is the single living element: GROW FREELY.',
    focal_priority: '1 bronze figure on the floor · 2 open-floor proportion · 3 SAFE TO SPEND + state · 4 course plates · 5 door → CTA · 6 cornerstone lockup · 7 tagline.',
    motion_implication: 'Spending moves the walls inward course by course (still, one settle); SEE THE FULL BREAKDOWN swings the oak door open and the plates reveal amounts.',
    anti_generic_rules: 'No isometric 3D dashboard, no floating cards over a photo, no pool, loungers or hotel courtyard, no tourist piazza, no fountains, no potted-plant clutter.',
    anti_ai_look_rules: 'True orthographic overhead (no tilted perspective); straight walls; no HDR; no glitter gold; no glass; only the specified words; no extra plaques or numbers.',
  },
  authorship_devices: ['CUSTOM_MATERIAL_INFORMATION_OBJECT', 'TACTILE_DATA_ENCODING', 'EDITORIAL_SCALE_CONTRAST', 'BESPOKE_LABELS_TABS', 'ASYMMETRIC_BRANDED_FRAMING', 'ENVIRONMENT_INTERFACE_TENSION', 'DESIGNED_PHYSICAL_METAPHOR'],
  locks: {
    primary_object: 'The courtyard seen from directly above: walls = held back, open floor = clear to spend, figure inlaid in the floor.',
    major_zones: 'TOP BAND (y 12.7–19.5 %): SAFE TO SPEND label + state + brass survey rule CASH $30,960 · COURTYARD (x 20–80 %, y 20.5–63 %) · PAVING BAND (y 63–83.8 %): oak door on axis, CTA, inline actions, tagline.',
    visual_hierarchy: 'Figure ≫ open floor ≫ state ≫ plates ≫ door + CTA ≫ cornerstone ≫ tagline.',
    text_hierarchy: '1 $24,885 (largest, bronze) · 2 CLEAR TO SPEND above it, HELD BACK $6,075 below it (small) · 3 SAFE TO SPEND + A FULL READING (top band) · 4 BILLS / PLAN / GOALS / TRIPS on brass plates · 5 CTA text · 6 inline actions · 7 tagline (smallest).',
    logo_placement: 'Cornerstone plaque at the courtyard’s top-left outer wall corner (x ≈ 20–31 %, y ≈ 20.5–27 %), carved official mark — composite the official asset if mutated.',
    bottom_nav_placement: 'Canonical JURNL nav (F09_FRAME_GEOMETRY.nav), HOME active.',
    cta_placement: 'Emerald square-rounded tile SEE THE FULL BREAKDOWN centred on the axis directly below the oak door (x 26–74 %, y 69–74 %); inline actions CHANGE WHAT’S HELD › (left) and PLAN › (right) on one row at y 77–80 %.',
    image_focal_points: 'Primary: floor inlay at x 50 %, y ≈ 40 %. Secondary: the door at x 50 %, y 63 %. Environmental: olive canopy in the top-right bleed only.',
    material_hierarchy: 'Travertine floor > plaster walls > limestone courses > bronze inlay > brass plates > oak door.',
    negative_space_regions: 'Open floor (apart from the inlay); left and right bleed; the paving band between CTA and nav.',
    environmental_geometry: 'Rectangular courtyard 60 % of frame width, walls ≈ 2.6 % of frame width thick (data: 80 % open), door gap ≈ 12 % wide on the axis in the bottom wall.',
    custom_object_logic: 'Four courses clockwise from the door: BILLS ≈ 31 % of the wall length, PLAN ≈ 39.5 %, GOALS ≈ 15 %, TRIPS ≈ 15 % (QA-seed sample). One brass plate per course, names only (amounts stay closed).',
  },
  text_must_render: ['SAFE TO SPEND', 'A FULL READING', 'CASH $30,960', 'CLEAR TO SPEND', '$24,885', 'HELD BACK $6,075', 'BILLS', 'PLAN', 'GOALS', 'TRIPS', 'SEE THE FULL BREAKDOWN', 'CHANGE WHAT’S HELD', 'PLAN TODAY. GROW FREELY.', 'JURNL', ...NAV_TEXT, ...CHROME_TEXT],
  text_representational: ['status-bar glyphs', 'botanical mark shape (official asset governs)', 'stone grain and mortar lines'],
  forbidden_elements: ['any other words or numbers', 'arched panels or arches', 'threshold lines or hatched bands', 'cards or panels floating over the photo', 'pool, loungers, umbrellas, fountain', 'circular buttons or round badges', 'a centred wordmark in the chrome', 'gold glitter', 'glass'],
  prompt_path: `${JURNL_F09_CD_DIR}/SUNBURST_PROMPTS/T01_OPEN_FLOOR.txt`,
};

/* ─────────────────────────────── T02 THE PLAIN ANSWER → THE ANSWER IN RAKING LIGHT ─────────────────────────────── */

const T02: CreativeDirectionTranslation = {
  translation_id: 'JURNL.F09.T02.CD.v1',
  project_id: 'JURNL',
  profile_id: P.profile_id,
  territory_id: 'JURNL.F09.T02',
  structural_premise: territory('JURNL.F09.T02').concept,
  primary_object: territory('JURNL.F09.T02').primary_object,
  functional_metaphor: 'One plain sentence answers the question; each held-back thing is a word you can open.',
  bespoke_visual_idea: 'ONLY THE WORDS THAT HOLD MONEY ARE MADE OF METAL. The sentence is carved into a limestone wall and revealed by raking morning light, but the held-back words — BILLS, YOUR PLAN, GOALS, TRIPS — are inlaid in brass: the material itself says "this word opens". One opened word hangs a small engraved brass tag on a fine chain ($2,400 ASSIGNED). Under the figure, a brass rule fills only the share of cash that is clear; the rest is an empty carved groove — what is held back is cut but not filled.',
  render_brief: 'A finished mobile app screen for JURNL, a calm Mediterranean personal-finance app: one warm honed limestone wall seen straight on, lit by low morning sun raking in from a deep rectangular window cut into the right edge (olive leaves outside). Carved into the stone, left-aligned in elegant condensed high-contrast serif capitals: YOU CAN SPEND, then $24,885 at monumental size filled with deep emerald enamel, then a thin inlaid rule — four fifths polished brass, one fifth an empty carved groove — captioned OF $30,960 CASH, then NOW, AFTER BILLS, YOUR PLAN, GOALS AND TRIPS. The words BILLS, YOUR PLAN, GOALS and TRIPS are inlaid in polished brass instead of carved; a small engraved brass tag hangs on a fine chain beneath YOUR PLAN reading $2,400 ASSIGNED. Below: a small engraved reading line with a tiny emerald square, a brushed-brass maker’s plate at lower left with the JURNL botanical logo and FINANCIAL LIFE, BEAUTIFULLY ORGANIZED., a full-width deep-emerald square-cornered button SEE THE FULL BREAKDOWN, and the JURNL five-cell bottom navigation.',
  fields: {
    art_direction_premise: 'THE ANSWER IN RAKING LIGHT — a frontal elevation of one sunlit limestone wall carrying a single carved sentence, read the way you read an inscription on a Mediterranean building.',
    brand_world_translation: 'Calm confidence becomes architecture: the answer is permanent, plain and quietly assured; clarity is literal daylight raking across the letters from a deep window.',
    graphic_design_language: 'Monumental editorial typesetting in relief: carved V-cut capitals, a giant figure with emerald enamel infill, brass-inlaid interactive words, one brass proportion rule with an empty groove, a hanging brass tag as inline disclosure, a small brass maker’s plate.',
    environmental_role: 'Framing and meaning only: a deep window reveal at the top-right edge brings the light that makes the carving legible; outside it, a sliver of olive leaves. Nothing sits behind the text.',
    material_language: 'Warm honed limestone wall; carved letters with crisp shadows; emerald enamel in the figure; champagne brass inlays, rule, tag and plate; an oak window frame.',
    tactile_object_language: 'Inlaid brass letterforms flush in stone; a small rectangular brass tag with softened corners on a fine chain; a screwed brass maker’s plate.',
    typographic_art_direction: 'One fashion-condensed high-contrast serif for the whole sentence (carved), the figure at monumental scale; tracked condensed sans only for the small engraved captions. Left-aligned column inside the centred field. All uppercase.',
    logo_behavior: 'A small brushed-brass MAKER’S PLATE screwed to the wall at the lower left of the field — like an architect’s or foundry plate — engraved with the official botanical mark and JURNL. Quiet, asymmetric, never in the chrome.',
    brand_lockup_behavior: 'Maker’s plate = BOTANICAL MARK + JURNL + descriptor FINANCIAL LIFE, BEAUTIFULLY ORGANIZED. (engraved, tiny). No tagline elsewhere: this is the most direct territory.',
    color_hierarchy: 'Limestone cream (dominant) → taupe carving shadows → ONE emerald-enamel figure → champagne brass only on openable words, rule, tag and plate → deep emerald CTA and active nav cell.',
    lighting_direction: 'Low early-morning sun from a window at the right, grazing leftward across the wall so every carved letter casts a crisp short shadow; a soft warm pool fades toward the lower left.',
    depth_model: 'Frontal elevation, shallow relief (2.5D): one wall plane, carving and inlay depth only, plus the window reveal.',
    compositional_tension: 'A monumental carved figure against a tiny swinging brass tag; the diagonal of the raking light against the rigid left-aligned column.',
    negative_space_strategy: 'Generous untouched stone between the sentence and the CTA: the stone is the page; calm, not empty.',
    editorial_wit: 'Metal means "you can open this": the material of a word tells you whether it is a statement or a door.',
    custom_designed_element: 'The brass-inlaid openable words with the hanging engraved tag, and the half-filled brass proportion rule.',
    bespoke_detail: 'The held-back part of the rule is a carved groove left unfilled — cut but not filled.',
    imagery_role: 'Material and light, not a photo backdrop; the window and olive sliver justify the light and stay at the edge.',
    focal_priority: '1 $24,885 · 2 YOU CAN SPEND · 3 the brass words of the after-clause · 4 the proportion rule · 5 reading line · 6 CTA · 7 maker’s plate.',
    motion_implication: 'Tapping a brass word lowers its tag on the chain (inline disclosure); a recalculation re-cuts the figure (cross-fade, still); the hold sheet rises.',
    anti_generic_rules: 'No hero-number promo layout, no gradient background, no centred stack, no card, no stock wall texture, no marble.',
    anti_ai_look_rules: 'Every carved word exactly as specified; no extra inscriptions; consistent letter depth; no warped serifs; brass only where specified.',
  },
  authorship_devices: ['BESPOKE_TYPOGRAPHIC_RELATIONSHIP', 'EDITORIAL_SCALE_CONTRAST', 'TACTILE_DATA_ENCODING', 'BESPOKE_LABELS_TABS', 'CUSTOM_HIERARCHY', 'LAYERED_PHYSICAL_GRAPHIC_STRUCTURE', 'ASYMMETRIC_BRANDED_FRAMING'],
  locks: {
    primary_object: 'The carved answer sentence with the figure as its second line, held-back words inlaid in brass.',
    major_zones: 'WINDOW REVEAL (x 82–100 %, y 12–32 %, edge only) · SENTENCE COLUMN (x 14.5–80 %, y 13–56 %) · READING LINE (y 58–60 %) · MAKER’S PLATE (x 14.5–44 %, y 62–67 %) · CTA (y 70–75 %) · INLINE ACTIONS (y 77–80 %).',
    visual_hierarchy: 'Figure ≫ lead line ≫ brass words ≫ rule ≫ reading ≫ CTA ≫ plate.',
    text_hierarchy: '1 $24,885 (monumental, emerald enamel) · 2 YOU CAN SPEND (carved, large) · 3 NOW, AFTER BILLS, YOUR PLAN, GOALS AND TRIPS. (carved, brass for the four held-back words) · 4 OF $30,960 CASH (small caption right under the rule) · 5 brass tag $2,400 ASSIGNED · 6 SAFE TO SPEND (small label, top) and A FULL READING. EVERY BILL HAS AN AMOUNT. · 7 CTA and inline actions · 8 plate text.',
    logo_placement: 'Brass maker’s plate at the lower left of the field (x 14.5–44 %, y 62–67 %); composite the official asset if the mark mutates.',
    bottom_nav_placement: 'Canonical JURNL nav (F09_FRAME_GEOMETRY.nav), HOME active.',
    cta_placement: 'Full-stage-width emerald square-rounded tile SEE THE FULL BREAKDOWN (x 14.5–85.5 %, y 70–75 %); inline actions CHANGE WHAT’S HELD › and PLAN › at y 77–80 %.',
    image_focal_points: 'Primary: the figure at x ≈ 40 %, y ≈ 28 %. Light source: window at top right. Secondary: brass tag at x ≈ 30 %, y ≈ 50 %.',
    material_hierarchy: 'Limestone > carved shadow > emerald enamel > brass inlay > brass tag and plate > oak frame.',
    negative_space_regions: 'Untouched stone between the reading line and the CTA, right of the plate; the left bleed.',
    environmental_geometry: 'One flat wall plane filling the frame; deep rectangular window reveal cut into the right edge below the chrome; no floor, no ceiling.',
    custom_object_logic: 'Brass words = openable held-back fields (non-zero only, fixed order). Proportion rule length = full column width; brass-filled 80 % (24,885 ÷ 30,960), the remaining 20 % an empty groove.',
  },
  text_must_render: ['SAFE TO SPEND', 'YOU CAN SPEND', '$24,885', 'OF $30,960 CASH', 'NOW, AFTER', 'BILLS', 'YOUR PLAN', 'GOALS', 'AND TRIPS.', '$2,400 ASSIGNED', 'A FULL READING. EVERY BILL HAS AN AMOUNT.', 'SEE THE FULL BREAKDOWN', 'CHANGE WHAT’S HELD', 'PLAN', 'JURNL', 'FINANCIAL LIFE, BEAUTIFULLY ORGANIZED.', ...NAV_TEXT, ...CHROME_TEXT],
  text_representational: ['status-bar glyphs', 'botanical mark shape (official asset governs)', 'stone grain'],
  forbidden_elements: ['any other inscription or words', 'arched window or arches', 'threshold lines or hatched bands', 'marble veining', 'a card or panel behind the text', 'gradients', 'circular buttons or round badges', 'a centred wordmark in the chrome', 'sea view'],
  prompt_path: `${JURNL_F09_CD_DIR}/SUNBURST_PROMPTS/T02_PLAIN_ANSWER.txt`,
};

/* ─────────────────────────────── T03 THE OPEN ENVELOPE → THE SORTING RACK ─────────────────────────────── */

const T03: CreativeDirectionTranslation = {
  translation_id: 'JURNL.F09.T03.CD.v1',
  project_id: 'JURNL',
  profile_id: P.profile_id,
  territory_id: 'JURNL.F09.T03',
  structural_premise: territory('JURNL.F09.T03').concept,
  primary_object: territory('JURNL.F09.T03').primary_object,
  functional_metaphor: 'One envelope is released and open — what you can spend; every held-back commitment stays sealed in its slot.',
  bespoke_visual_idea: 'THE BROKEN SEAL. Money you are free to spend is the only letter you have opened: it lies unfolded on the ledge, and its burgundy wax seal — pressed with the JURNL botanical mark — lies broken beside it. The held-back commitments stand sealed in an oak sorting rack, and their thickness is their amount: PLAN is visibly the fattest envelope, GOALS and TRIPS the slimmest. Data you can read by touch.',
  render_brief: 'A finished mobile app screen for JURNL, a calm Mediterranean personal-finance app: a quiet morning still life in an entry hall. On a limewashed plaster wall hangs an oak letter rack with four slots, each with an engraved brass label (BILLS, PLAN, GOALS, TRIPS); in each slot stands one sealed linen envelope closed with a burgundy wax seal pressed with a botanical sprig, and the envelopes differ in thickness — PLAN the fattest, GOALS and TRIPS the slimmest. A thin brass strip along the rack base reads HELD BACK $6,075 OF $30,960 CASH. Below, on a deep honed travertine console seen from slightly above, lies the one letter that has been opened, unfolded and slightly askew: a cotton-paper letterhead with the small JURNL botanical logo and PLAN TODAY. GROW FREELY., the words CLEAR TO SPEND and the amount $24,885 letterpressed in deep emerald, and a small square emerald stamp FULL READING; its broken wax seal lies beside it. A deep-emerald square-cornered button SEE THE FULL BREAKDOWN below, and the JURNL five-cell bottom navigation at the bottom.',
  fields: {
    art_direction_premise: 'THE SORTING RACK — a quiet corner of a Mediterranean entry hall at morning: an oak-and-brass letter rack on a limewashed wall above a deep travertine console, the household’s money sorted like post.',
    brand_world_translation: 'FINANCIAL LIFE, BEAUTIFULLY ORGANIZED as a physical habit: things already decided are sealed and put away carefully; the one released letter is life money. The botanical mark lives in the wax.',
    graphic_design_language: 'A stationer’s letterhead layout on the released letter (lockup, figure, stamp), engraved brass slot plates on the rack, thickness-encoded sealed envelopes, a grid break where the opened letter lies askew across the rack’s order.',
    environmental_role: 'The environment is the organising system — where the post lives. Wall, rack, console and letter are one layered information structure; nothing is wallpaper.',
    material_language: 'Limewashed plaster wall; natural oak rack with brushed brass slot plates; cotton-rag letter paper with soft fold creases; linen-weave envelopes in bone, greige, ivory and pale blush; burgundy wax seals; honed travertine console top.',
    tactile_object_language: 'Sealed envelopes of different thicknesses standing in slots; wax seals embossed with the botanical mark; broken seal fragments; a letterpress-debossed figure.',
    typographic_art_direction: 'Letterhead set like fine stationery: the vertical JURNL lockup small at the top, the figure letterpressed in deep emerald ink in fashion-condensed serif, captions in tracked condensed sans; slot plates engraved in condensed sans. All uppercase.',
    logo_behavior: 'The official lockup is the LETTERHEAD of the released letter (botanical mark + JURNL), and the botanical mark is pressed into every wax seal — even with the wordmark hidden, the seals say JURNL. Never in the chrome.',
    brand_lockup_behavior: 'Letterhead = BOTANICAL MARK + JURNL + tagline PLAN TODAY. GROW FREELY. in tiny tracked capitals beneath it.',
    color_hierarchy: 'Plaster bone (dominant) → oak and travertine warmth → ivory paper → ONE emerald figure → burgundy seals (the only strong red, and functional) → champagne brass only on slot plates → emerald CTA and active nav cell.',
    lighting_direction: 'Soft morning window light from the upper left; gentle long shadows of the envelopes on the wall; the open letter catches the most light.',
    depth_model: 'Three-quarter frontal still life with real depth: wall plane → rack → console top → open letter nearest the viewer, seen from slightly above.',
    compositional_tension: 'The orderly rhythm of the rack against the one released letter lying slightly askew — the intentional grid break is the release.',
    negative_space_strategy: 'Calm plaster above the rack and the bare travertine to the right of the letter; the bleed stays wall only.',
    editorial_wit: 'The broken seal: what you can spend is the only letter you have opened.',
    custom_designed_element: 'The oak sorting rack with engraved brass slot plates and thickness-encoded sealed envelopes.',
    bespoke_detail: 'The broken wax seal beside the released letter, embossed with the JURNL botanical mark.',
    imagery_role: 'Still life as information: every object carries data or frames it; no decorative props, no flowers.',
    focal_priority: '1 $24,885 on the letter · 2 CLEAR TO SPEND + FULL READING stamp · 3 the sealed envelopes and their plates · 4 HELD BACK total · 5 broken seal · 6 CTA · 7 letterhead lockup.',
    motion_implication: 'Tapping a sealed envelope lifts it from its slot and breaks its seal to show its amount; spending lowers the letter back toward the console; the hold sheet rises like a folio.',
    anti_generic_rules: 'Not a folio with labelled pockets, not a card grid, not cute stationery, no flowers or candles, no gold foil, no flat-lay desk clutter.',
    anti_ai_look_rules: 'Exactly four sealed envelopes and four plates; legible plate words; one opened letter; seals with one consistent botanical emboss; no extra papers, pens or props.',
  },
  authorship_devices: ['DESIGNED_PHYSICAL_METAPHOR', 'TACTILE_DATA_ENCODING', 'BESPOKE_LABELS_TABS', 'INTENTIONAL_GRID_BREAK', 'LAYERED_PHYSICAL_GRAPHIC_STRUCTURE', 'CONTROLLED_OBJECT_COMPOSITION', 'CUSTOM_STATE_TRANSITION'],
  locks: {
    primary_object: 'The released letter lying open on the console with CLEAR TO SPEND $24,885; the held-back commitments sealed in the rack above.',
    major_zones: 'SAFE TO SPEND label (top-left of field, y 13–15 %) · RACK (x 17–83 %, y 16–38 %) · HELD-BACK STRIP (brass strip along the rack base, y 38.5–40.5 %) · CONSOLE + RELEASED LETTER (x 18–82 %, y 43–66 %) · CTA (y 70–75 %) · INLINE ACTIONS (y 77–80 %).',
    visual_hierarchy: 'Letter figure ≫ stamp ≫ sealed envelopes ≫ held-back strip ≫ broken seal ≫ CTA ≫ letterhead.',
    text_hierarchy: '1 $24,885 (letterpress emerald, largest) · 2 CLEAR TO SPEND above it · 3 FULL READING stamp · 4 slot plates BILLS / PLAN / GOALS / TRIPS · 5 HELD BACK $6,075 OF $30,960 CASH on the brass strip · 6 SAFE TO SPEND label · 7 CTA and inline actions · 8 letterhead JURNL + PLAN TODAY. GROW FREELY.',
    logo_placement: 'Letterhead at the top centre of the released letter (small) + the botanical emboss on every seal; composite the official asset if mutated.',
    bottom_nav_placement: 'Canonical JURNL nav (F09_FRAME_GEOMETRY.nav), HOME active.',
    cta_placement: 'Emerald square-rounded tile SEE THE FULL BREAKDOWN across the field below the console (x 14.5–85.5 %, y 70–75 %); inline actions CHANGE WHAT’S HELD › and PLAN › at y 77–80 %.',
    image_focal_points: 'Primary: the letter’s figure at x 50 %, y ≈ 55 %. Secondary: the PLAN envelope (thickest) in the rack. Light: window off-frame upper left.',
    material_hierarchy: 'Paper > oak > linen envelopes > wax > travertine > brass > plaster.',
    negative_space_regions: 'Plaster above the rack; travertine right of the letter; the bleed.',
    environmental_geometry: 'Wall plane parallel to the frame; rack mounted at y 16–38 %; console top seen from slightly above occupying y 42–68 %.',
    custom_object_logic: 'Exactly four sealed envelopes, left to right BILLS · PLAN · GOALS · TRIPS, thickness ∝ amount (QA seed 1,875 · 2,400 · 900 · 900 → PLAN thickest, BILLS next, GOALS = TRIPS slimmest). Zero fields get no envelope.',
  },
  text_must_render: ['SAFE TO SPEND', 'CLEAR TO SPEND', '$24,885', 'FULL READING', 'BILLS', 'PLAN', 'GOALS', 'TRIPS', 'HELD BACK $6,075 OF $30,960 CASH', 'SEE THE FULL BREAKDOWN', 'CHANGE WHAT’S HELD', 'JURNL', 'PLAN TODAY. GROW FREELY.', ...NAV_TEXT, ...CHROME_TEXT],
  text_representational: ['status-bar glyphs', 'botanical emboss on seals (official mark governs)', 'paper and linen texture'],
  forbidden_elements: ['a folio or portfolio with labelled pockets', 'more or fewer than four sealed envelopes', 'pens, flowers, candles, coffee cups', 'gold foil', 'circular buttons or round badges (wax seals are objects, not controls)', 'a centred wordmark in the chrome', 'any other words or numbers', 'arches'],
  prompt_path: `${JURNL_F09_CD_DIR}/SUNBURST_PROMPTS/T03_OPEN_ENVELOPE.txt`,
};

export const JURNL_F09_CREATIVE_DIRECTIONS: CreativeDirectionTranslation[] = [T01, T02, T03];

/* ─────────────────────────────── brand-expression checks (pre-generation) ─────────────────────────────── */

const pass = (evidence: string) => ({ pass: true, evidence });

const BE_EVIDENCE: Record<string, Record<BrandExpressionItem, string>> = {
  'JURNL.F09.T01': {
    VISUAL_WORLD_PRESENT: 'Travertine, limewashed plaster, limestone courses, bronze and brass, oak, olive, Mediterranean sun.',
    PRODUCT_PHILOSOPHY_PRESENT: 'Money in service of life: the open floor (space to live) is the answer; commitments are built in, not hidden.',
    FAMILY_SPECIFIC_LOGIC_PRESENT: 'Floor area ÷ room area = clear ÷ cash; one course per non-zero held-back field.',
    CUSTOM_GRAPHIC_DESIGN_IDEA_PRESENT: 'Bronze floor inlay + brass survey rule CASH $30,960.',
    BESPOKE_MATERIAL_OBJECT_PRESENT: 'Four limestone courses with screwed brass plates; oak door on the axis.',
    MEANINGFUL_ENVIRONMENTAL_ROLE: 'The courtyard is the data object (environment = information).',
    LOGO_PLACEMENT_ART_DIRECTED: 'Cornerstone plaque at the courtyard’s top-left corner.',
    TAGLINE_DESCRIPTORS_HANDLED: 'PLAN TODAY. GROW FREELY. engraved on the outer face of the bottom wall; the olive outside the walls carries GROW FREELY visually.',
    PRIMARY_SIGNAL_UNMISTAKABLE: 'Largest element, only dark-bronze mass, centred in the brightest empty area.',
    SECONDARY_DATA_DOES_NOT_COMPETE: 'Plates carry names only; amounts stay closed.',
    NO_GENERIC_DASHBOARD: 'No tiles, charts or KPI rows.',
    NO_GENERIC_CARD_STACK: 'No panels at all; information is built into stone.',
    NO_DEFAULT_AI_COMPOSITION: 'Locked zones; orthographic plan; asymmetric cornerstone and olive break.',
    NO_UNRELATED_DECORATION: 'The olive is the single living element and carries GROW FREELY.',
    IDEA_SURVIVES_WITHOUT_MARKETING_COPY: 'Remove the tagline and the room still says “this much space is left”.',
    MOBILE_GEOMETRY_WORKS: 'Courtyard inside the 340-pt stage on the + axis; bleed environment only.',
    BOTTOM_NAV_WORKS: 'Canonical five-cell nav, HOME active.',
    NO_CIRCULAR_TAPPABLE_BUTTONS: 'All controls square-rounded; no round plaques.',
    BRAND_EVIDENT_WITH_LOGO_HIDDEN: 'Travertine + plaster + bronze + olive + organised calm read as JURNL with the cornerstone covered.',
  },
  'JURNL.F09.T02': {
    VISUAL_WORLD_PRESENT: 'Honed limestone, carved serif, brass inlay, oak window, olive sliver, morning light.',
    PRODUCT_PHILOSOPHY_PRESENT: 'Calm confidence: one plain answer, reasons on request (brass words open).',
    FAMILY_SPECIFIC_LOGIC_PRESENT: 'Sentence generated from the breakdown; non-zero held-back fields only; proportion rule 80 % filled.',
    CUSTOM_GRAPHIC_DESIGN_IDEA_PRESENT: 'Metal words open; the held share is an empty groove.',
    BESPOKE_MATERIAL_OBJECT_PRESENT: 'Hanging engraved brass tag; brass maker’s plate.',
    MEANINGFUL_ENVIRONMENTAL_ROLE: 'The window’s raking light is what makes the answer legible (clarity).',
    LOGO_PLACEMENT_ART_DIRECTED: 'Brass maker’s plate at lower left of the field.',
    TAGLINE_DESCRIPTORS_HANDLED: 'FINANCIAL LIFE, BEAUTIFULLY ORGANIZED. engraved on the maker’s plate; no tagline elsewhere (most direct).',
    PRIMARY_SIGNAL_UNMISTAKABLE: 'Monumental emerald-enamel figure as the sentence’s second line.',
    SECONDARY_DATA_DOES_NOT_COMPETE: 'One tag open at a time; amounts otherwise closed.',
    NO_GENERIC_DASHBOARD: 'Type only, no charts.',
    NO_GENERIC_CARD_STACK: 'No panels; carved directly into the wall.',
    NO_DEFAULT_AI_COMPOSITION: 'Left-aligned column, window at the right edge, plate lower left — not centred.',
    NO_UNRELATED_DECORATION: 'Only the window and its olive sliver, which justify the light.',
    IDEA_SURVIVES_WITHOUT_MARKETING_COPY: 'The sentence is functional copy; the idea is material (metal = opens).',
    MOBILE_GEOMETRY_WORKS: 'Column inside the stage; window at the edge below the chrome.',
    BOTTOM_NAV_WORKS: 'Canonical five-cell nav, HOME active.',
    NO_CIRCULAR_TAPPABLE_BUTTONS: 'Tag is rectangular with softened corners; controls square-rounded.',
    BRAND_EVIDENT_WITH_LOGO_HIDDEN: 'Carved limestone, brass, morning light and the plain uppercase voice read as JURNL without the plate.',
  },
  'JURNL.F09.T03': {
    VISUAL_WORLD_PRESENT: 'Limewashed plaster, oak, brass, cotton paper, linen, burgundy wax, travertine, morning light.',
    PRODUCT_PHILOSOPHY_PRESENT: 'Financial life beautifully organised: decided things sealed and put away; one letter released for life.',
    FAMILY_SPECIFIC_LOGIC_PRESENT: 'Open = value; sealed = each non-zero held-back field; thickness ∝ amount.',
    CUSTOM_GRAPHIC_DESIGN_IDEA_PRESENT: 'Letterhead layout on the released letter; engraved slot plates; grid break.',
    BESPOKE_MATERIAL_OBJECT_PRESENT: 'Oak sorting rack; seals embossed with the botanical mark; broken seal.',
    MEANINGFUL_ENVIRONMENTAL_ROLE: 'The entry-hall corner is the organising system (where the post lives).',
    LOGO_PLACEMENT_ART_DIRECTED: 'Letterhead of the released letter + seal emboss.',
    TAGLINE_DESCRIPTORS_HANDLED: 'PLAN TODAY. GROW FREELY. under the letterhead.',
    PRIMARY_SIGNAL_UNMISTAKABLE: 'Largest figure, emerald letterpress on the brightest object nearest the viewer.',
    SECONDARY_DATA_DOES_NOT_COMPETE: 'Plates carry names; amounts sealed; one strip carries the total.',
    NO_GENERIC_DASHBOARD: 'Still life, no widgets.',
    NO_GENERIC_CARD_STACK: 'Envelopes stand in a rack with real thickness — not a row of equal cards.',
    NO_DEFAULT_AI_COMPOSITION: 'Layered depth, askew letter, light from the left.',
    NO_UNRELATED_DECORATION: 'No flowers, pens or cups; the botanical lives only in the seals and letterhead.',
    IDEA_SURVIVES_WITHOUT_MARKETING_COPY: 'Open vs sealed and the broken seal need no copy.',
    MOBILE_GEOMETRY_WORKS: 'Rack and console inside the stage; bleed is wall only.',
    BOTTOM_NAV_WORKS: 'Canonical five-cell nav, HOME active.',
    NO_CIRCULAR_TAPPABLE_BUTTONS: 'Wax seals are objects, not controls; every control is square-rounded.',
    BRAND_EVIDENT_WITH_LOGO_HIDDEN: 'The botanical seals, oak, linen and plaster organised calm read as JURNL with the letterhead hidden.',
  },
};

export const JURNL_F09_BRAND_EXPRESSION: BrandExpressionCheck[] = JURNL_F09_CREATIVE_DIRECTIONS.map((t) => ({
  territory_id: t.territory_id,
  translation_id: t.translation_id,
  items: Object.fromEntries(BRAND_EXPRESSION_CHECKLIST.map((k) => [k, pass(BE_EVIDENCE[t.territory_id]![k])])) as BrandExpressionCheck['items'],
}));

/* ─────────────────────────────── creative-direction distinctness ─────────────────────────────── */

export const JURNL_F09_CREATIVE_DISTINCTNESS: CreativeDistinctnessRow[] = [
  {
    territory_id: 'JURNL.F09.T01',
    art_direction_premise: 'THE SURVEYED COURTYARD — overhead architectural photograph annotated like a survey',
    environmental_strategy: 'Environment is the data object (courtyard proportions encode the breakdown)',
    material_strategy: 'Travertine floor, limewashed walls, limestone courses, bronze inlay, brass plates, oak door',
    object_language: 'Architecture: walls, courses, door, floor inlay',
    typographic_strategy: 'Figure cast and inlaid in bronze in the floor; engraved plate labels',
    depth_model: 'Orthographic top-down plan view',
    brand_lockup_strategy: 'Carved cornerstone plaque + tagline engraved on the wall face',
    visual_wit: 'Negative space is the money',
    data_encoding: 'Area ratio (floor ÷ room) and wall-course length',
    cta_expression: 'Emerald tile on the axis directly below the closed oak door — the door leads to the breakdown',
  },
  {
    territory_id: 'JURNL.F09.T02',
    art_direction_premise: 'THE ANSWER IN RAKING LIGHT — one carved sentence on a sunlit limestone wall',
    environmental_strategy: 'Environment frames and lights the answer (window at the edge supplies clarity)',
    material_strategy: 'Honed limestone, carving, emerald enamel, brass inlay, oak window',
    object_language: 'Inscription: carved letters, inlaid metal words, hanging tag, maker’s plate',
    typographic_strategy: 'Monumental carved serif sentence; metal vs stone distinguishes openable words',
    depth_model: 'Frontal elevation in shallow relief (2.5D)',
    brand_lockup_strategy: 'Brass maker’s plate with descriptor',
    visual_wit: 'Only the words that hold money are made of metal',
    data_encoding: 'Inline words + one half-filled brass rule (filled = clear, empty groove = held)',
    cta_expression: 'Full-width emerald slab closing the column, under generous stone',
  },
  {
    territory_id: 'JURNL.F09.T03',
    art_direction_premise: 'THE SORTING RACK — entry-hall still life where money is sorted like post',
    environmental_strategy: 'Environment is the organising system (rack, console, letter in layers)',
    material_strategy: 'Oak, brass, cotton paper, linen envelopes, burgundy wax, travertine console, plaster wall',
    object_language: 'Stationery and furniture: rack, sealed envelopes, released letter, broken seal',
    typographic_strategy: 'Letterhead stationery layout with letterpress figure; engraved slot plates',
    depth_model: 'Three-quarter frontal still life with real depth',
    brand_lockup_strategy: 'Letterhead lockup + botanical emboss on every wax seal',
    visual_wit: 'The broken seal — the only letter you have opened',
    data_encoding: 'Envelope thickness ∝ amount; open vs sealed',
    cta_expression: 'Emerald tile under the console, after the objects',
  },
];

/* ─────────────────────────────── prompt builder (renderer, not designer) ─────────────────────────────── */

export const SUNBURST_PROMPT_SECTIONS = [
  'IMAGE',
  'RENDER SETTINGS',
  'JURNL BRAND WORLD',
  'F09 PRODUCT JOB',
  'TERRITORY STRUCTURE',
  'PRIMARY OBJECT',
  'MOBILE COMPOSITION',
  'LOGO / LOCKUP PLACEMENT',
  'SAFE TO SPEND SIGNAL',
  'SECONDARY BREAKDOWN',
  'ENVIRONMENT',
  'MATERIALS',
  'LIGHTING',
  'GRAPHIC DESIGN ELEMENTS',
  'TACTILE OBJECTS',
  'BOTTOM NAV',
  'CTA',
  'ANTI-GENERIC RULES',
  'ANTI-AI RULES',
  'TEXT THAT MUST RENDER',
  'TEXT THAT MAY BE REPRESENTATIONAL',
  'FORBIDDEN ELEMENTS',
] as const;

export function buildSunburstPrompt(t: CreativeDirectionTranslation): string {
  const f = t.fields;
  const L = t.locks;
  const r = P.renderer;
  const terr = territory(t.territory_id);
  const sec: Record<(typeof SUNBURST_PROMPT_SECTIONS)[number], string> = {
    IMAGE: t.render_brief,
    'RENDER SETTINGS': `Model ${r.model} · quality ${r.quality} · aspect ratio ${r.aspect_ratio} · auto-enhance ${r.auto_enhance ? 'ON' : 'OFF'} · one finished mobile app screen (a JURNL visual-authority candidate), photographic-architectural rendering, not a mockup of a phone. ${F09_FRAME_GEOMETRY.frame}`,
    'JURNL BRAND WORLD': `JURNL — ${P.brand_lines.join(' ')} A personal finance and lifestyle app with calm confidence. World: ${P.environment_world.join('; ')}. Colour: ${P.color_world.join('; ')}. Materials: ${P.material_world.join(', ')}. Must not become: ${P.must_not_become.join(', ')}.`,
    'F09 PRODUCT JOB': 'SAFE TO SPEND: give one clear signal of what the user can spend now without undermining bills, plans or what they are holding. Under five seconds the user must see the amount, that it is a full reading, and that something is already held back. Details stay closed until asked.',
    'TERRITORY STRUCTURE': `${terr.name}: ${terr.concept} Creative direction — ${f.art_direction_premise} Bespoke idea: ${t.bespoke_visual_idea}`,
    'PRIMARY OBJECT': `${L.primary_object} ${L.custom_object_logic}`,
    'MOBILE COMPOSITION': `${F09_FRAME_GEOMETRY.status_bar} ${F09_FRAME_GEOMETRY.chrome_row} ${F09_FRAME_GEOMETRY.stage} Zones: ${L.major_zones} Hierarchy: ${L.visual_hierarchy} Focal points: ${L.image_focal_points} Negative space: ${L.negative_space_regions} Geometry: ${L.environmental_geometry} ${F09_FRAME_GEOMETRY.composition_edge}`,
    'LOGO / LOCKUP PLACEMENT': `${f.logo_behavior} ${f.brand_lockup_behavior} Placement lock: ${L.logo_placement} The mark is a single slender stem with five leaves in muted rose beside the letters J U R N L set vertically like a book spine in a high-contrast serif. Do not invent other letterforms.`,
    'SAFE TO SPEND SIGNAL': `${L.text_hierarchy} The figure $24,885 is the single largest element and the only one in its colour.`,
    'SECONDARY BREAKDOWN': `Held back: BILLS, PLAN, GOALS, TRIPS (four commitments, sample values). ${L.custom_object_logic} Amounts beyond those listed in TEXT THAT MUST RENDER stay closed.`,
    ENVIRONMENT: `${f.environmental_role} ${f.imagery_role}`,
    MATERIALS: `${f.material_language} Hierarchy: ${L.material_hierarchy}`,
    LIGHTING: f.lighting_direction,
    'GRAPHIC DESIGN ELEMENTS': `${f.graphic_design_language} Typography: ${f.typographic_art_direction} Colour hierarchy: ${f.color_hierarchy} Depth: ${f.depth_model} Tension: ${f.compositional_tension}`,
    'TACTILE OBJECTS': `${f.tactile_object_language} Bespoke detail: ${f.bespoke_detail}`,
    'BOTTOM NAV': `${F09_FRAME_GEOMETRY.nav} ${F09_FRAME_GEOMETRY.home_indicator}`,
    CTA: `${L.cta_placement} The CTA tile: deep emerald #0F3D32, 8-pt square-rounded corners, bone uppercase tracked label SEE THE FULL BREAKDOWN. Inline actions: tracked uppercase label, a fine taupe rule, and a thin chevron — never pills or circles.`,
    'ANTI-GENERIC RULES': [...P.anti_generic_rules, f.anti_generic_rules].join(' '),
    'ANTI-AI RULES': [...P.anti_ai_rules, f.anti_ai_look_rules].join(' '),
    'TEXT THAT MUST RENDER': `Only these words and figures may appear anywhere, uppercase and spelled exactly (a word may repeat only where the zones above place it): ${t.text_must_render.map((s) => `"${s}"`).join(', ')}. No other words, numbers or letters.`,
    'TEXT THAT MAY BE REPRESENTATIONAL': t.text_representational.join('; '),
    'FORBIDDEN ELEMENTS': t.forbidden_elements.join('; '),
  };
  return `${SUNBURST_PROMPT_SECTIONS.map((k) => `## ${k}\n${sec[k]}`).join('\n\n')}\n`;
}

/* ─────────────────────────────── previous round (territory proof 1) — baseline audit ─────────────────────────────── */

export const PREVIOUS_ROUND_CANDIDATES: GeneratedCandidate[] = JURNL_F09_REFERENCES.map((r) => ({
  candidate_id: `${r.reference_id}.PROOF1`,
  territory_id: r.territory_id,
  translation_id: 'NONE (no creative-direction layer existed)',
  model: 'local HTML/CSS/SVG (Playwright Chromium)',
  quality: '393×852 @3x',
  aspect_ratio: '393:852',
  auto_enhance: false,
  generation_mode: 'TEXT_TO_IMAGE',
  provider: 'LOCAL',
  local_render: true,
  image_path: r.reference_paths[0]!,
  prompt_path: r.reference_paths[1]!,
}));

export const PREVIOUS_ROUND_AUDIT: AntiAiAudit[] = [
  { candidate_id: 'JURNL.F09.T01.REF.MOBILE.PROOF1', territory_id: 'JURNL.F09.T01', flags: [
    { flag: 'GENERIC_LUXURY_APP', severity: 'MINOR', note: 'Beige plaster field + diagram reads as a clean UI study, not a JURNL world.' },
    { flag: 'OVERLY_CENTERED_AI_LAYOUT', severity: 'MINOR', note: 'Drawing, button and legend all centred on one axis.' },
  ], typography_defects: [] },
  { candidate_id: 'JURNL.F09.T02.REF.MOBILE.PROOF1', territory_id: 'JURNL.F09.T02', flags: [
    { flag: 'GENERIC_PROMO_LAYOUT', severity: 'MINOR', note: 'Hero number + sentence + full-width button on a texture is close to a promo layout.' },
    { flag: 'GENERIC_LUXURY_APP', severity: 'MINOR', note: 'Travertine texture alone carries the brand.' },
  ], typography_defects: [] },
  { candidate_id: 'JURNL.F09.T03.REF.MOBILE.PROOF1', territory_id: 'JURNL.F09.T03', flags: [
    { flag: 'CARD_STACK_DRIFT', severity: 'MINOR', note: 'The sealed row of four equal envelopes drifts toward a card grid.' },
    { flag: 'GENERIC_LUXURY_APP', severity: 'MINOR', note: 'Stationery motif without a JURNL world around it.' },
  ], typography_defects: [] },
];

/** Brand-expression items the previous round failed (honest baseline; none were checked before rendering). */
export const PREVIOUS_ROUND_BRAND_EXPRESSION_FAILURES: Record<string, BrandExpressionItem[]> = {
  'JURNL.F09.T01': ['LOGO_PLACEMENT_ART_DIRECTED', 'TAGLINE_DESCRIPTORS_HANDLED', 'MEANINGFUL_ENVIRONMENTAL_ROLE', 'BRAND_EVIDENT_WITH_LOGO_HIDDEN', 'BESPOKE_MATERIAL_OBJECT_PRESENT'],
  'JURNL.F09.T02': ['LOGO_PLACEMENT_ART_DIRECTED', 'TAGLINE_DESCRIPTORS_HANDLED', 'MEANINGFUL_ENVIRONMENTAL_ROLE', 'BRAND_EVIDENT_WITH_LOGO_HIDDEN', 'BESPOKE_MATERIAL_OBJECT_PRESENT', 'CUSTOM_GRAPHIC_DESIGN_IDEA_PRESENT'],
  'JURNL.F09.T03': ['LOGO_PLACEMENT_ART_DIRECTED', 'TAGLINE_DESCRIPTORS_HANDLED', 'MEANINGFUL_ENVIRONMENTAL_ROLE', 'BRAND_EVIDENT_WITH_LOGO_HIDDEN'],
};

/** 1–5 founder-review scale. Previous round scored now; corrected round scored after generation (null = pending). */
export const COMPARISON_DIMENSIONS = ['BRAND_SPECIFICITY', 'VISUAL_RICHNESS', 'PRODUCT_CLARITY', 'GRAPHIC_DESIGN_AUTHORSHIP', 'ENVIRONMENTAL_INTELLIGENCE', 'LOGO_INTELLIGENCE', 'MATERIAL_SOPHISTICATION', 'CUSTOM_DESIGN_QUALITY', 'ANTI_AI_QUALITY', 'FAMILY_DISTINCTNESS'] as const;
export type ComparisonDimension = (typeof COMPARISON_DIMENSIONS)[number];

export const PREVIOUS_ROUND_SCORES: Record<string, Record<ComparisonDimension, number>> = {
  'JURNL.F09.T01': { BRAND_SPECIFICITY: 2, VISUAL_RICHNESS: 2, PRODUCT_CLARITY: 4, GRAPHIC_DESIGN_AUTHORSHIP: 3, ENVIRONMENTAL_INTELLIGENCE: 2, LOGO_INTELLIGENCE: 1, MATERIAL_SOPHISTICATION: 2, CUSTOM_DESIGN_QUALITY: 3, ANTI_AI_QUALITY: 3, FAMILY_DISTINCTNESS: 4 },
  'JURNL.F09.T02': { BRAND_SPECIFICITY: 2, VISUAL_RICHNESS: 2, PRODUCT_CLARITY: 5, GRAPHIC_DESIGN_AUTHORSHIP: 3, ENVIRONMENTAL_INTELLIGENCE: 1, LOGO_INTELLIGENCE: 1, MATERIAL_SOPHISTICATION: 2, CUSTOM_DESIGN_QUALITY: 2, ANTI_AI_QUALITY: 3, FAMILY_DISTINCTNESS: 3 },
  'JURNL.F09.T03': { BRAND_SPECIFICITY: 3, VISUAL_RICHNESS: 3, PRODUCT_CLARITY: 4, GRAPHIC_DESIGN_AUTHORSHIP: 3, ENVIRONMENTAL_INTELLIGENCE: 2, LOGO_INTELLIGENCE: 1, MATERIAL_SOPHISTICATION: 3, CUSTOM_DESIGN_QUALITY: 3, ANTI_AI_QUALITY: 3, FAMILY_DISTINCTNESS: 4 },
};

/* ─────────────────────────────── generation state ─────────────────────────────── */

/** Corrected-round candidates. Empty until the renderer route is decided (see GENERATION_LEDGER.json). */
export const JURNL_F09_CORRECTED_CANDIDATES: GeneratedCandidate[] = [];
export const JURNL_F09_CORRECTED_AUDITS: AntiAiAudit[] = [];

export function jurnlF09CreativeGateInput(): CreativeDirectionGateInput {
  return {
    profile: P,
    translations: JURNL_F09_CREATIVE_DIRECTIONS,
    brand_expression: JURNL_F09_BRAND_EXPRESSION,
    candidates: JURNL_F09_CORRECTED_CANDIDATES,
    audits: JURNL_F09_CORRECTED_AUDITS,
    distinctness: JURNL_F09_CREATIVE_DISTINCTNESS,
  };
}

export function jurnlF09CreativeStatus() {
  const input = jurnlF09CreativeGateInput();
  return {
    creative_direction: JURNL_F09_CREATIVE_DIRECTIONS.map((t) => checkCreativeDirection(t, territory(t.territory_id), P)),
    brand_expression: JURNL_F09_BRAND_EXPRESSION.map((b) => checkBrandExpression(b, b.territory_id)),
    distinctness: checkCreativeDistinctness(JURNL_F09_CREATIVE_DISTINCTNESS),
    gate: evaluateCreativeGate(JURNL_F09_TERRITORIES, input, JURNL_F09_REFERENCES),
    previous_round_gate: evaluateCreativeGate(JURNL_F09_TERRITORIES, { ...input, translations: [], brand_expression: [], candidates: PREVIOUS_ROUND_CANDIDATES, audits: PREVIOUS_ROUND_AUDIT }, JURNL_F09_REFERENCES),
  };
}

/* ─────────────────────────────── generation ledger ─────────────────────────────── */

/** Renderer route record. No paid generation has run in this round yet; the route is a founder decision. */
export const JURNL_F09_CD_GENERATION_LEDGER = {
  renderer_spec: P.renderer,
  status: 'BLOCKED_ON_RENDERER_ROUTE' as 'BLOCKED_ON_RENDERER_ROUTE' | 'GENERATED',
  primary_generations: 0,
  retries: 0,
  credits_spent: 0,
  openart_accessed: false,
  routes_checked: [
    { route: 'OpenArt (JURNL’s canonical provider: per-family projects, gpt-image-2-5-sunburst, 4K, image2image)', status: 'ALLOWED FOR OPUS — the founder clarified the no-OpenArt rule applies to ChatGPT only. Not yet connected: needs an OpenArt credential or connector available to a NEW session.' },
    { route: 'ChatGPT image generation (founder-run, interim)', status: 'IN USE BY THE FOUNDER UNTIL OPENART IS CONNECTED — CHATGPT_PROMPTS/*.txt + the territory value study + the official logo as attachments. Outputs come back for the anti-AI audit, review board and comparison.' },
    { route: 'Figma MCP generate_image (model gpt-image-2.5-sunburst)', status: 'AVAILABLE NOW — text-only (no reference image), max 2048 px per side (≈1152×2048 at 9:16, not 4K), paid Figma AI credits on the founder’s starter plan. Breaks JURNL REFERENCE_GUIDED canon and the 4K spec unless the founder records an exception.' },
    { route: 'Figma Weave model run', status: 'UNAVAILABLE — the Figma account is not linked to Weave.' },
    { route: 'Repo provider gateway (FAL / Railway)', status: 'NOT AVAILABLE in this session (no provider credential; production systems out of scope).' },
  ],
  reference_inputs_ready: ['COMPOSITION_LOCKS/F09_T01_SURVEYED_COURTYARD_VALUE_STUDY_9x16.png', 'COMPOSITION_LOCKS/F09_T02_ANSWER_IN_RAKING_LIGHT_VALUE_STUDY_9x16.png', 'COMPOSITION_LOCKS/F09_T03_SORTING_RACK_VALUE_STUDY_9x16.png', 'public/site00/projects/jurnl/brand/jurnl-logo-official.png'],
  plan: [
    'One primary generation per territory (3 total) from SUNBURST_PROMPTS/*.txt, reference-guided with the territory value study (+ the official logo) where the route allows.',
    'Inspect every word against text_must_render; regenerate or repair (composite the official logo / canonical nav, recorded) on any typography defect.',
    'Corrective retries only for: typography corruption, broken logo, malformed object, wrong ratio, nav corruption, composition failure, major brand-expression failure. Each retry logged with its reason.',
    'Then: anti-AI audit per candidate, founder review board, previous-vs-corrected scores.',
  ],
};

/* ─────────────────────────────── ChatGPT hand-off prompts (founder-run, interim) ─────────────────────────────── */

export const CHATGPT_REFERENCE_FILES: Record<string, string> = {
  'JURNL.F09.T01': 'F09_T01_SURVEYED_COURTYARD_VALUE_STUDY_9x16.png',
  'JURNL.F09.T02': 'F09_T02_ANSWER_IN_RAKING_LIGHT_VALUE_STUDY_9x16.png',
  'JURNL.F09.T03': 'F09_T03_SORTING_RACK_VALUE_STUDY_9x16.png',
};

/**
 * The same locked translation, phrased for a founder pasting it into ChatGPT image generation with two attachments:
 * the territory's composition value study (layout to follow) and the official JURNL logo (mark to reproduce exactly).
 * Pipeline-internal wording is removed; nothing about the design changes.
 */
export function buildChatGptPrompt(t: CreativeDirectionTranslation): string {
  const body = buildSunburstPrompt(t)
    .replace(/^## RENDER SETTINGS\n.*$/m, `## RENDER SETTINGS\nGPT Image 2.5 (Sunburst) at its highest quality, 9:16 portrait, no auto-enhancement or style preset. ${F09_FRAME_GEOMETRY.frame}`)
    .replace(/ — composite the official asset if mutated/g, ' — reproduce the attached official JURNL logo exactly')
    .replace(/; composite the official asset if mutated/g, '; reproduce the attached official JURNL logo exactly')
    .replace(/; composite the official asset if the mark mutates/g, '; reproduce the attached official JURNL logo exactly')
    .replace(/\(official asset governs\)/g, '(match the attached logo)')
    .replace(/\(official mark governs\)/g, '(match the attached logo)')
    .replace(/ \(QA-seed sample\)/g, ' (sample values)')
    .replace(/QA seed /g, 'sample ');
  const head = [
    'Create ONE image only: a finished mobile app screen for JURNL, in 9:16 portrait. It is a flat screen design, not a photo of a phone and not a mockup.',
    '',
    'ATTACHMENTS',
    `1. ${CHATGPT_REFERENCE_FILES[t.territory_id]} is the composition lock. Follow its layout exactly: where each zone sits, how big it is, the hierarchy, the centred field, the top chrome and the five-cell bottom navigation. It is a tonal blocking study, not the style. Render the real materials, light and type described below.`,
    '2. JURNL_LOGO_OFFICIAL.png is the official logo. Wherever the JURNL logo appears, reproduce this mark and its lettering exactly. Never invent other letterforms.',
    '',
    'TEXT RULE: render only the words listed under TEXT THAT MUST RENDER, spelled exactly in uppercase. If a word cannot be rendered cleanly, leave that surface plain rather than inventing letters.',
    '',
    '',
  ].join('\n');
  return `${head}${body}`;
}
