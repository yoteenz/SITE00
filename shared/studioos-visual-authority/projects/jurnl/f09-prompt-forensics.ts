/**
 * JURNL F09 SAFE TO SPEND — prompt forensics + creative-logic audit (P0.JURNL.F09.PROMPT-FORENSICS-AND-CREATIVE-LOGIC-AUDIT1).
 * Analysis only: no image generated, no screen implemented, no concept round started. F09 visual generation is paused
 * until a new brief is written against the architecture below.
 *
 * Evidence lives in JURNL/F09_SAFE/PROMPT_FORENSICS_AND_CREATIVE_LOGIC_AUDIT1/ (verbatim founder briefs in SOURCES/,
 * measurements, the generated report). Every finding cites a path.
 */
import type { FreedomLevel, PromptFailureClass } from '../../prompt-forensics.js';

export const F09_FORENSICS_SPRINT = 'P0.JURNL.F09.PROMPT-FORENSICS-AND-CREATIVE-LOGIC-AUDIT1' as const;
export const F09_FORENSICS_DIR = 'JURNL/F09_SAFE/PROMPT_FORENSICS_AND_CREATIVE_LOGIC_AUDIT1' as const;
const SRC = `${F09_FORENSICS_DIR}/SOURCES`;
export const F09_GENERATION_PAUSED = { paused: true, until: 'A new F09 brief written against F09_PROMPT_ARCHITECTURE and its missing logic', by: F09_FORENSICS_SPRINT } as const;

/* ─────────────── 1. lineage ─────────────── */

export type LineageEntry = {
  id: string;
  sprint: string;
  kind: 'FOUNDER_BRIEF' | 'GENERATOR_PROMPT' | 'GENERATOR_INPUT_IMAGE' | 'ASSEMBLY_CODE' | 'METHOD_RULESET';
  author: 'FOUNDER' | 'OPUS' | 'COMPOSER (Cursor)' | 'FOUNDER (ChatGPT run)';
  source: string;
  reconstructed: boolean;
  intended_job: string;
  reached_model: string;
  output: string;
};

export const F09_PROMPT_LINEAGE: LineageEntry[] = [
  { id: 'L01', sprint: 'VISUAL-AUTHORITY-3-TERRITORY-PROOF1', kind: 'FOUNDER_BRIEF', author: 'FOUNDER', source: `${SRC}/01_VISUAL-AUTHORITY-3-TERRITORY-PROOF1.founder-brief.txt`, reconstructed: false, intended_job: 'Test whether upstream contracts alone produce three distinct, brand-true territories without legacy leakage.', reached_model: 'Opus only (no image model: OpenArt banned, local renders used).', output: 'Three structural territories + local HTML/CSS 393×852 candidates (founder: good concepts, clean UI studies, not JURNL).' },
  { id: 'L02', sprint: 'CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1', kind: 'FOUNDER_BRIEF', author: 'FOUNDER', source: `${SRC}/02_CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1.founder-brief.txt`, reconstructed: false, intended_job: 'Insert creative direction + brand expression gates; regenerate three 4K Sunburst candidates.', reached_model: 'Opus (methodology + prompts); renderer blocked in-session.', output: 'Gates, 22-field translations, Sunburst prompts, value studies.' },
  { id: 'L02a', sprint: 'CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1', kind: 'METHOD_RULESET', author: 'OPUS', source: 'shared/studioos-visual-authority/projects/jurnl/creative-direction-profile.ts', reconstructed: false, intended_job: 'JURNL creative-direction profile (identity load).', reached_model: 'Embedded into every Sunburst / ChatGPT prompt (anti-generic, anti-AI, renderer).', output: 'Rules incl. “no sea-view balconies”, “a single justified plant”.' },
  { id: 'L02b', sprint: 'CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1', kind: 'GENERATOR_PROMPT', author: 'OPUS', source: 'JURNL/F09_SAFE/CREATIVE_DIRECTION_CORRECTION1/SUNBURST_PROMPTS/*.txt', reconstructed: false, intended_job: 'Full-screen Sunburst prompt per territory (renderer executes the locked translation).', reached_model: 'OpenArt gpt-image-2.5-sunburst image2image (Composer, SUNBURST-3-TERRITORY-RENDER1), ≈ 2,000 words each.', output: 'Three 4K whole-screen renders: JURL wordmark, dropped TRIPS., invented 3-leaf mark, metaphor-as-page, iPhone status bar.' },
  { id: 'L02c', sprint: 'CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1', kind: 'GENERATOR_INPUT_IMAGE', author: 'OPUS', source: 'JURNL/F09_SAFE/CREATIVE_DIRECTION_CORRECTION1/COMPOSITION_LOCKS/*_VALUE_STUDY_9x16.png', reconstructed: false, intended_job: 'Tonal composition reference for reference-guided rendering.', reached_model: 'Attached as the image2image reference (with the logo) in the OpenArt render and the founder ChatGPT run.', output: 'Composition followed; world as thin as the study.' },
  { id: 'L02d', sprint: 'CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1', kind: 'GENERATOR_PROMPT', author: 'OPUS', source: 'JURNL/F09_SAFE/CREATIVE_DIRECTION_CORRECTION1/CHATGPT_PROMPTS/*.txt', reconstructed: false, intended_job: 'Same prompts phrased for a founder-run ChatGPT pass.', reached_model: 'ChatGPT image generation (founder), value study + logo attached, inside a chat that had other JURNL context.', output: 'RUN A: T03 contaminated (A QUIETER YOU, BEGIN YOUR JOURNEY, journal cover), blank / broken nav.' },
  { id: 'L03', sprint: 'COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1', kind: 'FOUNDER_BRIEF', author: 'FOUNDER', source: `${SRC}/03_COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1.founder-brief.txt`, reconstructed: false, intended_job: 'Add page blueprint + render ownership; generator renders art layers only.', reached_model: 'Opus (methodology).', output: 'Blueprints at 393×852 (incl. a 9:41 status bar + home indicator), ownership L0–L8, plate prompts, plate guides, contamination guard.' },
  { id: 'L03a', sprint: 'COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1', kind: 'GENERATOR_PROMPT', author: 'OPUS', source: 'JURNL/F09_SAFE/COMPOSITION_BLUEPRINT_CORRECTION1/PLATE_PROMPTS/*.txt (later edited by Composer)', reconstructed: false, intended_job: 'Text-free scene plate prompt with BLANK SURFACES and QUIET REGIONS.', reached_model: 'OpenArt image2image (Composer scripts/jurnl/f09-scene-plate-generate-one.py) with the PREFIX “The attached image is the ONLY geometry authority (tonal blocking — not style)”.', output: 'Plates that photographically reproduce the guides: empty courtyard frame, blank brass tag and plate, blank paper slip and plaques.' },
  { id: 'L03b', sprint: 'COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1', kind: 'GENERATOR_INPUT_IMAGE', author: 'OPUS', source: 'JURNL/F09_SAFE/COMPOSITION_BLUEPRINT_CORRECTION1/PLATE_GUIDES/*.png', reconstructed: false, intended_job: 'Geometry-only guide; declared “the only reference”.', reached_model: 'The only image the plate generator ever saw.', output: 'Became the de-facto style authority (flat tonal blocks → flat sparse plates).' },
  { id: 'L03c', sprint: 'COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1', kind: 'METHOD_RULESET', author: 'OPUS', source: 'JURNL/F09_SAFE/COMPOSITION_BLUEPRINT_CORRECTION1/F09_RENDER_CONTAMINATION_GUARD.json', reconstructed: false, intended_job: 'Stop copy contamination.', reached_model: 'Governed which references could be attached.', output: 'Forbade “JURNL F01 entry / journal / onboarding references” — i.e. the approved world reference.' },
  { id: 'L04', sprint: 'HYBRID-COMPOSITE-AUTHORITY-EXECUTION1', kind: 'ASSEMBLY_CODE', author: 'COMPOSER (Cursor)', source: 'scripts/jurnl/f09-hybrid-composite-assemble.mjs · JURNL/F09_SAFE/HYBRID_COMPOSITE_AUTHORITY_EXECUTION1/', reconstructed: true, intended_job: 'Execute the hybrid method: plates + deterministic UI at 393×852 (brief not in repo; reconstructed from commit 5e1daf53, ledger, MEMORY).', reached_model: 'OpenArt plates as above; HTML/CSS overlay.', output: 'Composites with iOS status bar + home indicator, sparse plates, UI cards over photos; only one concept resolved. Founder-rejected.' },
  { id: 'L05', sprint: 'THREE-DISTINCT-COMPOSITE-AUTHORITY-RERUN1', kind: 'ASSEMBLY_CODE', author: 'COMPOSER (Cursor)', source: 'scripts/jurnl/f09-three-distinct-composite-rerun.mjs · JURNL/F09_SAFE/THREE_DISTINCT_COMPOSITE_AUTHORITY_RERUN1/ · F09_FOUNDER_REVIEW_PAYLOAD.json', reconstructed: true, intended_job: 'Three finished, distinct composites without device chrome (brief reconstructed from commit 69557290, RERUN1_REPORT, MEMORY).', reached_model: 'No new generation: the execution-1 plates reused; only the overlay layout changed.', output: 'Same sparse plates, new card layouts, dashed debug border, blank brass plates visible, self-QA pass:true. Founder-rejected.' },
  { id: 'L06', sprint: 'THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1', kind: 'FOUNDER_BRIEF', author: 'FOUNDER', source: `${SRC}/06_THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1.founder-brief.txt`, reconstructed: false, intended_job: 'Fully re-authored, benchmark-rich, chrome-free candidates.', reached_model: 'Opus.', output: 'Methodology (finish audit), text-free scene prompts, 3 Figma Sunburst text2image scenes (not retrievable), layout proof only.' },
  { id: 'L06a', sprint: 'THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1', kind: 'GENERATOR_PROMPT', author: 'OPUS', source: 'JURNL/F09_SAFE/THREE_CONCEPT_ART_DIRECTION_REGEN_CORRECTION1/SCENE_PROMPTS/*.txt', reconstructed: false, intended_job: 'Benchmark-rich world per territory, text-free.', reached_model: 'Figma generate_image gpt-image-2.5-sunburst text2image (no image input possible), 864×1536.', output: 'Richer scenes (arches, sea, olive) but still three invented worlds, not the approved one; never reviewed.' },
];

/* ─────────────── 2. pipeline ─────────────── */

export const F09_PIPELINE = {
  believed: ['BRAND DNA', 'EXPERIENCE CONTRACT', 'FAMILY CONTRACT', 'STRUCTURAL TERRITORY ×3', 'CREATIVE DIRECTION', 'BRAND EXPRESSION', 'PAGE COMPOSITION BLUEPRINT', 'RENDER-LAYER OWNERSHIP', 'TEXT-FREE ART PLATE', 'DETERMINISTIC UI', 'COMPOSITE AUTHORITY', 'FOUNDER REVIEW'],
  actual: ['TERRITORY METAPHOR (data-encoding object)', '→ prose translation (adjectives + material nouns)', '→ tonal guide drawn by the agent', '→ image2image from the guide (the ONLY reference)', '→ plate = photographed guide', '→ app-style HTML cards on top', '→ self-certified QA', '→ founder rejects'],
  approved_jurnl_pipeline: ['APPROVED WORLD AUTHORITY (F01.00 WELCOME APPROVED)', '→ image2image Sunburst 4K, full screen (world + UI in one pass)', '→ family authority (F02 / F03 / F04 share the world; structure and type differ)'],
  coherent: false,
  why: 'Every step is locally sensible, but the chain never connects the output to the one input that carries JURNL’s richness — the approved world image. The richness the founder asks for lives in that image; the pipeline only ever passes adjectives and agent-drawn diagrams to the renderer.',
} as const;

/* ─────────────── 3. instruction inventory (generated from SOURCES by the export) — see F09_INSTRUCTION_INVENTORY.json ─────────────── */

/* ─────────────── 4. contradictions ─────────────── */

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Contradiction = { id: string; a: string; b: string; why: string; failure: string; severity: Severity; sources: string[] };

export const F09_CONTRADICTIONS: Contradiction[] = [
  { id: 'C01', a: 'Legacy firewall: prior JURNL visuals may not inform composition, image placement, background treatment or materials (L01 §2).', b: 'Use the approved art-driven JURNL image as the richness benchmark (L06).', why: 'The firewall did not separate legacy UI layout (to exclude) from approved brand-world authority (to inherit); the benchmark is prior JURNL visual work.', failure: 'The approved world was never consumed; three thinner worlds were invented from text.', severity: 'CRITICAL', sources: ['L01', 'L06', 'shared/.../f09-safe-to-spend.ts (PLATE_LOGGIA “image not opened”)'] },
  { id: 'C02', a: 'Known failure = PRETTY BACKGROUND + TEXT + STACKED CARDS; do not let decorative imagery overpower comprehension; no card stacks on pretty backgrounds (L01, L02).', b: 'The benchmark (F01 / F03 world) is a rich photographic background + display type + one panel (L06).', why: 'The named anti-pattern and the benchmark are visually the same genre; the line between “pretty background” (bad) and “environmental richness” (good) was never defined.', failure: 'Environment systematically suppressed → blank plaster, single object.', severity: 'CRITICAL', sources: ['L01', 'L02', 'L06'] },
  { id: 'C03', a: 'Family identity must survive blurred imagery; distinctness is structural (L01 §11).', b: 'Creative distinctness ≥ 8/10 dimensions incl. environment, material and depth strategy (L02 §17).', why: 'Approved JURNL families share one world and differ in structure; the gate forced three different worlds.', failure: 'Each concept had to invent a new world from text; none reached the shared world’s richness.', severity: 'HIGH', sources: ['L01', 'L02', 'creative-direction.ts CREATIVE_DISTINCTNESS'] },
  { id: 'C04', a: 'Lock text, logo, nav and CTA; the generator renders the full screen (L02 §9–10).', b: 'The generator may not render precision UI (L03 §5).', why: 'Sequential reversal: L02 gave the generator ~19 exact strings incl. tiny labels; L03 removed text entirely. Neither tried the method that produced the approved images (reference-bound full screen + exact-text correction).', failure: 'Round 2 typography failures; round 3+ lost UI–world integration.', severity: 'HIGH', sources: ['L02', 'L03', 'L02b'] },
  { id: 'C05', a: 'The generator may create negative space / placeholders for UI (L03 §16) → plate BLANK SURFACES.', b: 'Do not use placeholder brass plates / empty wall zones as visible final output (L06).', why: 'Placeholders were requested upstream and forbidden downstream; the assembly could not convincingly fill them.', failure: 'Blank tags, plaques, slips and strips visible in composites.', severity: 'HIGH', sources: ['L03', 'L03a', 'L05', 'L06'] },
  { id: 'C06', a: 'Do not use / access OpenArt (L01 DO NOT; L02 DO NOT).', b: 'Use Sunburst 4K (L02 §8); use the most appropriate workflow in Opus’s environment; “no OpenArt from ChatGPT” (L01 §17, L06).', why: 'The only 4K Sunburst route was banned in the same brief; the ban was later clarified as ChatGPT-only.', failure: 'Round 1 local HTML renders; round 2 blocked → founder ChatGPT pass (contamination); later routes without reference input.', severity: 'HIGH', sources: ['L01', 'L02', 'L06'] },
  { id: 'C07', a: 'The image generator is not the final designer (L03, L06).', b: 'Produce a fully re-authored finished authority; the founder must not see the scaffolding (L06).', why: 'No method was specified that makes a plate + overlay read as one image (no shared light, plane or occlusion rules).', failure: 'Assembled, pasted-on look.', severity: 'HIGH', sources: ['L03', 'L06'] },
  { id: 'C08', a: 'Deterministic UI owns product truth (L03).', b: 'The final image must feel coherent and not assembled (L06).', why: 'Ownership was implemented as flat app components (bordered cards, pills, frosted boxes) in one top plane.', failure: 'UI reads as a separate construction system.', severity: 'HIGH', sources: ['L03', 'L04', 'L05'] },
  { id: 'C09', a: 'CENTER_STAGE: nav-bearing screens centre the field; background frames from the perimeter; no left-column drift (L01 §8, canonical refinement 3).', b: 'Benchmark composition: left-led editorial column with the world on the open side (F01 approved is EDGE_LED; F03 parent is IN_REVIEW and pre-dates CENTER_STAGE).', why: 'Centred product sits on the scene’s most valuable area; a rich world must then live only at the perimeter — no rule says how.', failure: 'Scenes generated with quiet empty centres → plain walls, empty floors.', severity: 'HIGH', sources: ['L01', 'docs/jurnl/refinements/mobile-center-stage3/JURNL_CENTER_STAGE_QA_REPORT.md'] },
  { id: 'C10', a: 'SYSTEM CHROME ZONE; L6 SYSTEM CHROME; overlay TOP BAR / BACK / SETTINGS / INFO (L03).', b: 'No device chrome (RERUN1, L06).', why: '“System chrome” was undefined; the agent’s own canonical geometry defined a 9:41 status bar and home indicator.', failure: 'Execution-1 composites rendered iOS chrome.', severity: 'HIGH', sources: ['L03', 'f09-creative-direction.ts F09_FRAME_GEOMETRY', 'f09-composition-blueprint.ts systemZones'] },
  { id: 'C11', a: 'Three distinct concepts (all briefs).', b: 'One fixed payload with identical presentation: same CTA slab under the object, same purchase card, same top chrome, same label→amount→date stack, same nav (RERUN1, L06).', why: 'Presentation was locked along with truth, so only the background could differ.', failure: 'Concepts collapse into one UI stack over three backdrops.', severity: 'HIGH', sources: ['F09_FOUNDER_REVIEW_PAYLOAD.json', 'L05', 'L06'] },
  { id: 'C12', a: 'Strict brand fidelity (palette / material lists, must-not lists).', b: 'Conceptual novelty: a visual idea no generic UI generator could produce (L02 §6).', why: 'Novelty was routed into data-encoding metaphors (floor area, metal words, envelope thickness); fidelity into palette nouns.', failure: 'Clever diagrams in correct colours; neither rich nor editorial.', severity: 'MEDIUM', sources: ['L02', 'f09-creative-direction.ts'] },
  { id: 'C13', a: 'Use the founder comparison concept as the quality bar; extract its lessons (L02 §15, L03 §9).', b: 'The image was never supplied to the agent or committed to the repo.', why: 'An unconsumable reference; lessons were extracted from prose only.', failure: 'The quality bar never reached the renderer.', severity: 'HIGH', sources: ['L02', 'L03'] },
  { id: 'C14', a: 'Preserve the three structural territories; do not create new concepts (L02, L03, L06).', b: 'Concepts read as diagrams / unfinished — re-author fully (L03, L06).', why: 'The premises themselves (overhead plan, wall inscription, sorting rack) demand diagrammatic depiction; preserving them preserved the failure mode.', failure: 'Each correction re-rendered the same diagram energy.', severity: 'MEDIUM', sources: ['L02', 'L03', 'L06'] },
  { id: 'C15', a: 'Do not pre-bias the concepts; every number must map to a real F09 field (L01 §12, §14).', b: 'The comparison concept’s features became the payload: AVAILABLE THROUGH OCT 18, BUFFER, CHECK A PURCHASE, $1,284 (L03 §6 examples, RERUN1 payload).', why: 'Product truth was imported from a concept image outside the data contract (no date horizon exists in computeSafeToSpend).', failure: 'Product-truth churn between rounds; not the visual failure itself.', severity: 'MEDIUM', sources: ['L01', 'L03', 'F09_FOUNDER_REVIEW_PAYLOAD.json', 'src/projects/jurnl/data/f09/safeToSpend.ts'] },
  { id: 'C16', a: 'The environment IS the data object (L02 translation T01).', b: 'Metaphor contained to OBJECT or ZONE (L03 §10).', why: 'Sequential reversal of where the metaphor lives.', failure: 'Round 2 metaphor-as-page; round 3 object floating in an empty world.', severity: 'MEDIUM', sources: ['L02', 'L03'] },
  { id: 'C17', a: 'Logo integrated in the scene — carved, cast, embossed (profile).', b: 'The generator may not render logo geometry (L03).', why: 'In-scene branding then requires compositing onto 3D surfaces, which the assembly could not do well.', failure: 'Logo as a flat stamp or pasted box; mutated marks when the generator tried.', severity: 'MEDIUM', sources: ['creative-direction-profile.ts', 'L03'] },
  { id: 'C18', a: 'Witty, bespoke, rich (L02 §6, L06).', b: 'Anti-generic / anti-AI bans on botanicals, gold, 3D objects, gradients, glass, “material overload”, arches, sea views.', why: 'The bans cover the vocabulary of richness without defining justified use.', failure: 'Model plays safe → sparse.', severity: 'HIGH', sources: ['L02', 'creative-direction-profile.ts', 'SUNBURST_PROMPTS/T01 FORBIDDEN ELEMENTS'] },
  { id: 'C19', a: '393×852 product canvas.', b: '9:16 generation with the viewport as the central 82 % (L02 §8).', why: 'Different aspect ratios invite bleed confusion and device-shaped framing.', failure: 'Minor crop / framing drift; status-bar thinking.', severity: 'LOW', sources: ['L02'] },
  { id: 'C20', a: 'Image generation is a renderer, not the designer (L02).', b: 'Approved JURNL images were designed by reference: the renderer inherited composition, world and type from an approved image.', why: 'The rule was read as “describe everything in words”; the approved method is “show the renderer the authority”.', failure: 'Prompts grew to ~2,000 words of description instead of one attached authority.', severity: 'HIGH', sources: ['L02', 'F03_GENERATION_LEDGER.json'] },
];

/* ─────────────── 5. over-constraint ─────────────── */

export const F09_OVER_CONSTRAINT = [
  { area: 'PRODUCT LAYER', locked: ['copy', 'amount', 'date line', 'CTA label + full-width emerald slab', 'purchase module copy + card form', 'top chrome', 'label → amount → date order', 'nav', 'blueprint pt rectangles'], free: ['background'], sufficient: false, failure: 'Concepts become backdrop swaps under one UI stack.' },
  { area: 'WORLD', locked: ['no arches (T01)', 'no sea-view balconies', 'one justified plant / olive only in the bleed', 'no gold, glass, gradients, 3D objects', '≤ 4 material families', 'orthographic or frontal depth models', 'environment must differ per territory'], free: ['which smooth beige surface'], sufficient: false, failure: 'Sparse, cold, generic Mediterranean-by-noun.' },
  { area: 'COMPOSITION', locked: ['CENTER_STAGE', 'stage x 26.5–366.5', 'nav footprint', 'reserved quiet regions per zone', 'signature object 12–50 % of stage', 'density metrics'], free: ['object choice inside the centre'], sufficient: false, failure: 'No editorial layouts possible; the world is pushed into thin perimeters.' },
  { area: 'TYPOGRAPHY', locked: ['two fonts', 'uppercase', '≤ 5 sizes', 'colours'], free: ['scale', 'placement'], sufficient: true, failure: 'None in itself — but type was never allowed to touch the world (all text in one top plane).' },
  { area: 'LOGO', locked: ['official asset', 'never redrawn', 'not generator-rendered'], free: ['position'], sufficient: true, failure: 'In practice locked to a top-left stamp; in-world brand cues (book spine, seal) impossible without compositing skill.' },
] as const;

/* ─────────────── 6. under-specification ─────────────── */

export const F09_UNDER_SPECIFIED = [
  { word: 'MEDITERRANEAN', visual: 'Arched architecture opening to sea / coast; limewash and rough travertine; olive; hard warm sun with long shadows.', minimum: '≥ 1 arch, ≥ 1 view out, ≥ 2 botanical placements, a directional sun shadow.', structure: 'The world has an inside and an outside (a view).', satisfied_badly_by: 'Beige plaster wall + one olive sprig.' },
  { word: 'EDITORIAL', visual: 'Magazine-cover grammar: masthead lockup, one huge condensed serif word or figure, a tracked deck, a staged still life.', minimum: 'Display element ≥ 56 pt; a tracked deck; one deliberate asymmetry.', structure: 'Type is the hero of one zone; the image is the hero of another.', satisfied_badly_by: 'Serif headline centred over a photo.' },
  { word: 'LUXURY / QUIET LUXURY', visual: 'Material contrast (rough stone vs sheer linen vs velvet), restraint in UI, generous space that is lit, not empty.', minimum: '≥ 4 materials incl. 1 soft, 1 rough, 1 translucent.', structure: 'Space comes from light and architecture, not from blank areas.', satisfied_badly_by: 'Generic beige minimalism.' },
  { word: 'CALM', visual: 'Few focal points, soft light, slow rhythm, no competing objects near the figure.', minimum: '≤ 2 focal points above the fold.', structure: 'Calm product zone, rich world zone — not calm everywhere.', satisfied_badly_by: 'Empty.' },
  { word: 'RICH', visual: 'Depth planes, object relationships, texture, accent colour masses.', minimum: '≥ 3 planes; ≥ 5 distinct objects in the world; ≥ 1 accent colour mass (burgundy / sea blue / olive).', structure: 'Richness concentrated in the world zone and the foreground frame.', satisfied_badly_by: '“Rich” palette words with a single object.' },
  { word: 'BESPOKE / CUSTOM-DESIGNED', visual: 'Something drawn for this page that a template would not contain (a cut, a crop, a type–object relationship).', minimum: '1 element whose form only makes sense for SAFE TO SPEND.', structure: 'Designed at composition level, not as a data metaphor.', satisfied_badly_by: 'A clever data diagram.' },
  { word: 'ARTISTIC / WITTY', visual: 'A visual relationship that rewards a second look.', minimum: '1 relationship, stated in one sentence, that is visible without reading copy.', structure: 'Lives in the world or the type–world relationship.', satisfied_badly_by: 'An explanation in the prompt the viewer never sees.' },
  { word: 'ANTI-AI', visual: 'Exact letters, physically plausible light, no plastic surfaces, no symmetric default layout.', minimum: 'Zero glyph errors; light consistent across product and world.', structure: 'Exactness via correction, not via banning content.', satisfied_badly_by: 'Removing everything that could fail.' },
  { word: 'FULLY AUTHORED / FINISHED', visual: 'One image, one light, no seams (FULLY_AUTHORED_DEFINITION).', minimum: 'Passes ANTI_ASSEMBLY_TEST.', structure: 'Generate whole, correct parts.', satisfied_badly_by: 'Checklist PASS on a visibly assembled image.' },
] as const;

/* ─────────────── 7–8. Mediterranean + richness ─────────────── */

type Req = 'MANDATORY' | 'OPTIONAL' | 'ABSENT' | 'FORBIDDEN';
export const F09_MEDITERRANEAN_AUDIT: { cue: string; L02_sunburst: Req; L03_plates: Req; L06_scenes: Req; benchmark: string }[] = [
  { cue: 'Arched architecture', L02_sunburst: 'FORBIDDEN', L03_plates: 'ABSENT', L06_scenes: 'OPTIONAL', benchmark: 'Arcade of arches framing the sea (every approved image).' },
  { cue: 'View out to sea / coast', L02_sunburst: 'FORBIDDEN', L03_plates: 'ABSENT', L06_scenes: 'OPTIONAL', benchmark: 'Amalfi-style cliffs and sea through the arches.' },
  { cue: 'Limewashed plaster', L02_sunburst: 'MANDATORY', L03_plates: 'MANDATORY', L06_scenes: 'MANDATORY', benchmark: 'Present, but secondary to the view and objects.' },
  { cue: 'Travertine / limestone with irregular texture', L02_sunburst: 'OPTIONAL', L03_plates: 'OPTIONAL', L06_scenes: 'OPTIONAL', benchmark: 'Rough-hewn travertine plinth, heavy texture.' },
  { cue: 'Olive / plant life', L02_sunburst: 'FORBIDDEN', L03_plates: 'OPTIONAL', L06_scenes: 'OPTIONAL', benchmark: 'Out-of-focus olive leaves framing both bottom corners + plants on the terrace.' },
  { cue: 'Coastal light', L02_sunburst: 'MANDATORY', L03_plates: 'MANDATORY', L06_scenes: 'MANDATORY', benchmark: 'Bright exterior light through openings, warm interior bounce.' },
  { cue: 'Mediterranean shadow behaviour', L02_sunburst: 'OPTIONAL', L03_plates: 'OPTIONAL', L06_scenes: 'OPTIONAL', benchmark: 'Curtain and arch shadows across surfaces.' },
  { cue: 'Warm mineral palette', L02_sunburst: 'MANDATORY', L03_plates: 'MANDATORY', L06_scenes: 'MANDATORY', benchmark: 'Plus burgundy and sea-blue counter-masses.' },
  { cue: 'Architectural depth', L02_sunburst: 'FORBIDDEN', L03_plates: 'FORBIDDEN', L06_scenes: 'OPTIONAL', benchmark: 'Deep perspective: foreground leaves → still life → arcade → sea → sky.' },
  { cue: 'Sun-washed surfaces', L02_sunburst: 'MANDATORY', L03_plates: 'MANDATORY', L06_scenes: 'MANDATORY', benchmark: 'Sheer curtain glowing with backlight.' },
  { cue: 'Material irregularity', L02_sunburst: 'ABSENT', L03_plates: 'ABSENT', L06_scenes: 'ABSENT', benchmark: 'Rough stone, crumpled velvet, carved bust.' },
  { cue: 'Natural wood', L02_sunburst: 'OPTIONAL', L03_plates: 'OPTIONAL', L06_scenes: 'OPTIONAL', benchmark: 'Not essential.' },
  { cue: 'Linen / paper tactility', L02_sunburst: 'OPTIONAL', L03_plates: 'OPTIONAL', L06_scenes: 'OPTIONAL', benchmark: 'Sheer linen curtain; books.' },
  { cue: 'Coastal / estate spatial cues', L02_sunburst: 'FORBIDDEN', L03_plates: 'ABSENT', L06_scenes: 'OPTIONAL', benchmark: 'Terrace loggia of a cliff villa.' },
];

export const F09_RICHNESS_AUDIT = [
  { element: 'Foreground', status: 'ABSENT in every F09 prompt', benchmark: 'Blurred olive leaves at both bottom corners' },
  { element: 'Midground', status: 'One metaphor object only', benchmark: 'Staged still life: bust, marble bowl, JURNL book, velvet cushions on a travertine plinth' },
  { element: 'Background', status: 'Plain wall / overhead floor', benchmark: 'Arcade, sea, cliffs, sky' },
  { element: 'Material layering', status: '≤ 4 smooth materials, mostly beige', benchmark: 'Rough / smooth / soft / translucent + burgundy and blue masses' },
  { element: 'Light / shadow', status: 'Described; present', benchmark: 'Backlit curtain, directional sun' },
  { element: 'Spatial depth', status: 'Designed out (orthographic, frontal, “shallow relief”)', benchmark: 'Deep perspective' },
  { element: 'Environmental framing', status: 'Bleed only', benchmark: 'Curtain + arch + leaves frame the type column' },
  { element: 'Object relationships', status: 'Single functional object', benchmark: 'Culturally coded objects in relation (bust ↔ book ↔ bowl)' },
  { element: 'Editorial staging', status: 'ABSENT', benchmark: 'Still-life staging like a magazine set' },
  { element: 'Peripheral interest', status: 'One olive canopy in the bleed', benchmark: 'Every edge carries something' },
] as const;

export const F09_RICHNESS_WHY = 'Outputs became blank plaster + single object + text + card because the prompts made the object the only content, banned or omitted the view, the foreground and the still life, reserved “quiet regions” for every product zone, and (from round 3) anchored the renderer to a flat agent-drawn guide.' as const;

/* ─────────────── 9. art-direction density (measured — see PROMPT_DENSITY_MEASUREMENT.json) ─────────────── */

export const F09_DENSITY = {
  method: 'Founder briefs split by section and bucketed (creative / product truth / process / render / QA / negative); generator prompts split by section. Counts are words.',
  briefs_creative_share: { L01: 0.12, L02: 0.34, L03: 0.24, L06: 0.33 },
  briefs_process_qa_render_negative_share: { L01: 0.75, L02: 0.66, L03: 0.75, L06: 0.59 },
  sunburst_prompt: { words: 2000, creative_share: 0.44, product_ui_text_logo_share: 0.29, geometry_chrome_share: 0.12, negative_share: 0.12, note: 'A third of the “creative” words are rationale for humans (“No UI generator puts the answer in the empty space”).' },
  plate_prompt: { words: 455, creative_share: 0.31, geometry_share: 0.31, placeholder_share: 0.05, negative_share: 0.14, render_share: 0.19 },
  regen_scene_prompt: { words: 391, creative_share: 0.92, note: 'Creative, but text2image with no world reference.' },
  verdict: 'STRUCTURALLY BIASED TOWARD CORRECTNESS. Creative direction is 12–34 % of every founder brief and ~30–44 % of generator prompts; the decisive creative input (the approved world image) is 0 %.',
} as const;

/* ─────────────── 10. role collapse ─────────────── */

export const F09_ROLE_COLLAPSE = {
  verdict: 'YES',
  roles_per_sprint: {
    L01: ['source auditor', 'experience analyst', 'creative director', 'renderer (local HTML)', 'methodology scorer', 'QA'],
    L02: ['methodology engineer (gates, schemas, docs)', 'creative director', 'prompt engineer', 'renderer operator', 'QA / anti-AI auditor', 'board designer'],
    L03: ['methodology engineer (6 gates, 13 artifacts)', 'layout geometer', 'prompt engineer', 'pipeline architect', 'QA'],
    L06: ['methodology engineer', 'creative director', 'prompt engineer', 'renderer operator', 'compositor', 'QA', 'board designer'],
  },
  effect: 'Every corrective sprint spent most of its output on methodology (gates, schemas, exports, tests) and the least on the image. Creative decisions were made last, by geometry, and then self-certified by the same agent.',
  decision_levels: {
    CREATIVE_DIRECTION: ['which world (inherit the approved one)', 'concept thesis', 'what makes the concept different', 'in-world brand cue'],
    COMPOSITION: ['where product sits relative to world', 'planes', 'figure scale and position', 'quiet field source'],
    RENDER: ['route, model, resolution, references attached', 'what the generator renders vs what is corrected'],
    IMPLEMENTATION: ['runtime components, tokens, states — after authority lock only'],
    QA: ['benchmark side-by-side', 'anti-generic / anti-assembly', 'exact text and logo', 'founder verdict'],
  },
} as const;

/* ─────────────── 11. territory distinctness ─────────────── */

export const F09_DISTINCTNESS_AUDIT = {
  attributes: [
    { attribute: 'PRIMARY OBJECT', shared: false, note: 'courtyard · inscription · rack' },
    { attribute: 'SILHOUETTE', shared: false, note: 'square frame · text column · row of slots' },
    { attribute: 'SPATIAL MODEL', shared: false, note: 'overhead · frontal wall · frontal still life' },
    { attribute: 'TYPOGRAPHIC MODEL', shared: true, note: 'Same fonts and the same label → figure → date stack in all three (T02 slightly more editorial).' },
    { attribute: 'MEDIA MODEL', shared: true, note: 'Photographic plate + flat overlay in all three.' },
    { attribute: 'CTA PLACEMENT', shared: true, note: 'Full-width emerald slab below the object, purchase card below it.' },
    { attribute: 'BRAND PLACEMENT', shared: true, note: 'Top-left in the rerun and regen.' },
    { attribute: 'NAV RELATIONSHIP', shared: true, note: 'Canonical (correctly shared).' },
    { attribute: 'INFORMATION DENSITY', shared: true, note: 'Same modules, same count.' },
    { attribute: 'INTERACTION EMPHASIS', shared: true, note: 'Same CTA, same bridge.' },
  ],
  distinct_count: 3,
  verdict: 'Distinctness collapses: 3 of 10 attributes differ, and all three differences live in the object / background. The product layer — where SAFE TO SPEND identity should live — is identical.',
} as const;

/* ─────────────── 12. product-truth pressure ─────────────── */

export const F09_PRODUCT_TRUTH_PRESSURE = {
  must_be_exact: ['$1,284', 'AVAILABLE THROUGH OCT 18 (sample; no formula yet)', 'SAFE TO SPEND label', 'SEE WHY THIS AMOUNT', 'WANT TO SPEND ON SOMETHING? / CHECK HOW IT FITS YOUR PLAN BEFORE YOU BUY. / CHECK A PURCHASE', 'BILLS · PLANS · GOALS · BUFFER', 'nav items, order, HOME active, icons', 'official logo asset'],
  wrongly_locked_as_identical: ['CTA as a full-width slab below the object', 'purchase module as a bordered card under the CTA', 'top chrome row', 'label → figure → date vertical order', 'category presentation as a caption list', 'blueprint pt rectangles reused as a layout'],
  rule: 'Lock the string, not the form. Each concept chooses where and how the amount, CTA, categories and bridge appear, within the priority tiers.',
} as const;

/* ─────────────── 13. deterministic UI scope ─────────────── */

type Own = 'MUST_BE_DETERMINISTIC' | 'SHOULD_BE_DETERMINISTIC' | 'CAN_BE_COMPOSITED' | 'CAN_BE_GENERATED' | 'SHOULD_BE_ART_DIRECTED';
export const F09_UI_OWNERSHIP: { element: string; ownership: Own[]; note: string }[] = [
  { element: 'logo', ownership: ['MUST_BE_DETERMINISTIC', 'SHOULD_BE_ART_DIRECTED'], note: 'Asset exact; placement, scale and surface art-directed.' },
  { element: 'amount', ownership: ['MUST_BE_DETERMINISTIC', 'SHOULD_BE_ART_DIRECTED'], note: 'Exact digits set deterministically, but designed as image (scale, crop, relation to surfaces).' },
  { element: 'date', ownership: ['MUST_BE_DETERMINISTIC'], note: 'Exact string.' },
  { element: 'labels (SAFE TO SPEND)', ownership: ['SHOULD_BE_DETERMINISTIC'], note: 'Short; may be generated large if verified.' },
  { element: 'navigation', ownership: ['MUST_BE_DETERMINISTIC'], note: 'Runtime nav; never generated.' },
  { element: 'CTA', ownership: ['MUST_BE_DETERMINISTIC', 'SHOULD_BE_ART_DIRECTED'], note: 'Label exact; shape square-rounded; material and position art-directed.' },
  { element: 'category names', ownership: ['SHOULD_BE_DETERMINISTIC', 'CAN_BE_COMPOSITED'], note: 'Exact strings; may sit on scene surfaces with perspective.' },
  { element: 'material signage', ownership: ['CAN_BE_COMPOSITED', 'CAN_BE_GENERATED'], note: 'Non-product lettering only if verified.' },
  { element: 'editorial typography (headline)', ownership: ['SHOULD_BE_ART_DIRECTED', 'SHOULD_BE_DETERMINISTIC'], note: 'The biggest lever for “authored”; may be occluded by objects.' },
  { element: 'physical labels (plates, tags, seals)', ownership: ['CAN_BE_COMPOSITED'], note: 'Never left blank; if the text cannot be composited convincingly, the object should not carry text.' },
  { element: 'decorative lettering', ownership: ['CAN_BE_GENERATED'], note: 'Avoid unless verified; never product copy.' },
];
export const F09_UI_OWNERSHIP_VERDICT = 'Ownership was right about exactness and wrong about scope: it put every product element in one flat top plane, styled as app components, over a world that had been emptied to receive it. That is the pasted-on look.' as const;

/* ─────────────── 14–15. coherence + order ─────────────── */

export const F09_COHERENCE_CAUSES = [
  { cause: 'Scene generated before the composition it serves', evidence: 'Plates made from guides whose product zones were “quiet regions” — no designed relationship between type and world.', confidence: 'HIGH' },
  { cause: 'Placeholders requested, then left visible', evidence: 'BLANK SURFACES in plate prompts; blank plates / tags / slip in RAW_PLATES and composites.', confidence: 'HIGH' },
  { cause: 'App components used as authority UI', evidence: 'Rerun composites: bordered chips and panels, 999-px pill seals, translucent boxes and a dashed bridge border (scripts/jurnl/f09-three-distinct-composite-rerun.mjs, built on f09-product-canvas.css).', confidence: 'HIGH' },
  { cause: 'No shared light / plane / occlusion rule', evidence: 'No brief or contract specifies shadow direction, perspective or occlusion for overlays.', confidence: 'HIGH' },
  { cause: 'Perspective mismatch', evidence: 'T01 overhead floor with frontal flat type; T03 three-quarter objects with flat labels.', confidence: 'MEDIUM' },
  { cause: 'Typographic flatness', evidence: 'Type never interacts with the world (no occlusion, no surface).', confidence: 'MEDIUM' },
] as const;

export const F09_ORDER_OF_OPERATIONS = {
  current: 'Concept → prose → geometry → plate from guide → overlay → QA.',
  approved_jurnl: 'Approved world image → full-screen image2image (world + UI together) → founder review.',
  recommended: 'World authority + composition comp first (an annotated layout over the approved world), then reference-bound full-frame generation with UI geometry and the few large exact strings, then targeted correction (logo swap, exact text and nav repaint by region / inpainting), then QA. Generate the whole; correct the parts.',
  answer: 'Yes — generation must happen after the final composition is designed, and from the approved world reference, not from an agent-drawn guide.',
} as const;

/* ─────────────── 16–18. references ─────────────── */

type Role = 'STYLE' | 'COMPOSITION' | 'BRAND' | 'MATERIAL' | 'TYPOGRAPHY' | 'WORLD' | 'PRODUCT' | 'QUALITY_BAR';
export const F09_REFERENCE_AUDIT: { reference: string; intended_role: Role[]; actual_effect: string; attached: boolean }[] = [
  { reference: 'Official logo (jurnl-logo-official.png)', intended_role: ['BRAND'], actual_effect: 'Correct where composited; redrawn as a 3-leaf sprig when the generator saw it as an attachment.', attached: true },
  { reference: 'Value studies / lock boards (round 2)', intended_role: ['COMPOSITION'], actual_effect: 'Became STYLE authority: tonal blocking transferred.', attached: true },
  { reference: 'Plate guides (round 3+)', intended_role: ['COMPOSITION'], actual_effect: 'Declared “geometry only, not style”, but image2image transfers style: the plates are photographs of the guides.', attached: true },
  { reference: 'Runtime components / CSS', intended_role: ['PRODUCT'], actual_effect: 'Used as VISUAL authority for the overlay → app-card look.', attached: true },
  { reference: 'Founder comparison concept', intended_role: ['QUALITY_BAR'], actual_effect: 'Never supplied; described in prose only.', attached: false },
  { reference: 'F03.00 TODAY parent (named benchmark in REGEN)', intended_role: ['WORLD', 'QUALITY_BAR'], actual_effect: 'Text2image route could not take it as input; status IN_REVIEW, not approved.', attached: false },
  { reference: 'F01.00 WELCOME APPROVED (the approved world)', intended_role: ['WORLD', 'BRAND', 'TYPOGRAPHY'], actual_effect: 'Never used; forbidden by the contamination guard (“F01 entry / journal / onboarding references”).', attached: false },
  { reference: 'REFERENCE_MASTER_VISUAL_AUTHORITY (locked design system board)', intended_role: ['STYLE', 'TYPOGRAPHY', 'MATERIAL'], actual_effect: 'Never consulted by any F09 prompt.', attached: false },
  { reference: 'F09.00 SAFE parent plate (loggia)', intended_role: ['WORLD'], actual_effect: 'Firewalled as legacy; “image not opened”.', attached: false },
];
export const F09_REFERENCE_VERDICT = 'AMBIGUOUS AND INVERTED: the references that reached the model were agent-drawn diagrams; the references that carry JURNL were never attached, and one was actively forbidden.' as const;

export const F09_STRONGEST_REFERENCES = {
  approved_world: 'JURNL/F01_ENTRY/PARENT/REFERENCE_F01.00_WELCOME_APPROVED.jpg',
  same_world_family_parents: ['src/projects/jurnl/families/F02_SETUP/AUTHORITIES/F02.00_SETUP_PARENT.jpg', 'src/projects/jurnl/families/F03_TODAY/AUTHORITIES/F03.00_TODAY_PARENT.jpg (IN_REVIEW)', 'src/projects/jurnl/families/F04_ACTIVITY/AUTHORITIES/F04.00_ACTIVITY_PARENT.jpg'],
  design_system: 'JURNL/F01_ENTRY/ASSETS/REFERENCE_MASTER_VISUAL_AUTHORITY.jpg',
  method: 'gpt-image-2.5-sunburst image2image from REFERENCE_F01.00_WELCOME_APPROVED (F03_GENERATION_LEDGER.json; F01 openart_generation_log.json). The text-only F03 attempt was invalidated under REFERENCE_BINDING_FAILURE_F02_F03_2026: “TEXT ONLY. NOT THE REFERENCE WORLD.”',
  comparison: [
    { dimension: 'ENVIRONMENT', approved: 'Cliff-villa loggia: arcade of arches, sea and cliffs, sheer curtains', f09: 'A wall, an overhead courtyard or a cabinet; no view' },
    { dimension: 'DEPTH', approved: 'Foreground leaves → still life → arcade → sea → sky', f09: 'One plane' },
    { dimension: 'MATERIAL', approved: 'Rough travertine, sheer linen, burgundy velvet, marble, plaster bust, paper books', f09: 'Smooth plaster, honed stone, brass' },
    { dimension: 'COLOR', approved: 'Cream + burgundy masses + sea blue + olive green', f09: 'Beige + one emerald CTA' },
    { dimension: 'ARCHITECTURE', approved: 'Arches, columns, balustrade', f09: 'Arches forbidden (T01); a window (T02)' },
    { dimension: 'BOTANICAL PRESENCE', approved: 'Olive leaves framing the bottom corners; terrace plants', f09: 'One olive canopy in the bleed' },
    { dimension: 'TYPE', approved: 'Huge condensed serif word as hero (TODAY / ACTIVITY), tracked deck, figure in serif', f09: 'Small label + figure; no headline hero' },
    { dimension: 'LOGO', approved: 'Lockup top-left + JURNL on a book spine in the scene', f09: 'Top-left stamp; in-scene attempts mutated' },
    { dimension: 'SPATIAL FRAME', approved: 'Product column on the quiet lit side, world on the open side and bottom', f09: 'Product centred over an emptied scene' },
    { dimension: 'VISUAL DENSITY', approved: 'Dense world, quiet column', f09: 'Sparse everywhere' },
    { dimension: 'OBJECT RELATIONSHIPS', approved: 'Bust ↔ bowl ↔ books ↔ cushions staged', f09: 'Single functional object' },
    { dimension: 'NEGATIVE SPACE', approved: 'From light: curtain glow, sky, lit wall', f09: 'Blank plaster boxes' },
    { dimension: 'EDITORIAL CHARACTER', approved: 'Magazine cover', f09: 'Diagram / annotation' },
    { dimension: 'FUNCTIONAL CLARITY', approved: 'Clear: word, figure, CTA, one panel', f09: 'Clear (the one dimension F09 matched)' },
  ],
} as const;

/** Section 18 — the explicit answer. */
export const F09_IMPLICIT_SUCCESS_FACTORS = [
  'ONE INHERITED WORLD: every approved JURNL screen is the same place — the cliff-villa loggia of F01.00 WELCOME APPROVED — bound by image2image. F09 tried to invent a new place per concept from words.',
  'A VIEW OUT: an arched opening to sea and cliffs (horizon + architecture). F09 prompts forbade arches (T01) and “sea-view balconies”.',
  'THREE PLANES WITH A BOTANICAL FOREGROUND: out-of-focus olive leaves in the bottom corners, a staged still life mid-ground, arcade and sea behind. No F09 prompt asked for a foreground; two designed depth out.',
  'EDITORIAL STILL LIFE WITH CULTURAL OBJECTS: classical bust, marble bowl, JURNL-stamped books, burgundy velvet on rough travertine. F09 replaced still life with a single data-encoding object.',
  'MATERIAL AND COLOUR CONTRAST: rough vs sheer vs velvet; burgundy and sea-blue masses against cream. F09 specified smooth beige materials and one emerald accent.',
  'AN EDGE-LED EDITORIAL FRAME: product in a column on the quiet lit side; world on the open side. F09 centred product over the world (CENTER_STAGE) and emptied the centre.',
  'A MAGAZINE-COVER TYPE SYSTEM: one huge condensed serif word as hero, tracked deck, figure. F09 had no headline hero.',
  'IN-WORLD BRAND: JURNL on a book spine inside the scene, plus the lockup top-left. F09’s in-world attempts were composited plates or mutated marks.',
  'UI AND WORLD IN ONE PASS: the approved images were rendered whole, from a reference that already held UI in that world, so light, grain and scale match. F09 split them into plate + overlay.',
  'NO DEVICE CHROME: none of the approved images has a status bar. F09’s own geometry introduced one.',
] as const;

/* ─────────────── 19–21. dilution, negatives, quality bar ─────────────── */

export const F09_PRIORITY_DILUTION = {
  sunburst_prompt_sections: 22,
  critical_missing: ['attach the approved world', 'foreground / depth', 'view out', 'still life', 'edge-led frame'],
  classification: {
    CRITICAL: ['IMAGE brief (first)', 'primary object', 'exact large strings'],
    IMPORTANT: ['environment', 'materials', 'lighting', 'logo placement'],
    SUPPORTING: ['colour hierarchy', 'CTA / nav spec'],
    NOISE: ['hex codes for 11 colours', 'percent geometry for 15 zones', 'rationale prose', 'sample-data provenance (“QA-seed”)', 'anti-AI audit vocabulary', '19 exact strings incl. 8-pt labels', 'status-bar description'],
  },
  verdict: 'YES. At ~2,000 words and 22 sections the decisive visual instructions are a minority, and the most decisive input (an image) is absent.',
} as const;

export const F09_NEGATIVE_SATURATION = {
  founder_briefs: { L01: '65 creative-positive : 60 negative lines', L02: '170 : 84', L03: '145 : 59', L06: '69 : 34' },
  sunburst_prompt: '34 of 181 clauses negative (19 %); 52 negation tokens',
  plate_prompt: '6 of 59 clauses (10 %)',
  regen_scene_prompt: '5 of 25 clauses (20 %)',
  verdict: 'MODERATE IN VOLUME, HIGH IN EFFECT. Negatives are 1:1 to 1:2.5 against creative lines, but they target the richness vocabulary itself (arches, sea views, botanicals, gold, 3D objects, “pretty background”, “decorative imagery”). Avoidance dominated exactly where creation was needed.',
} as const;

export const F09_QUALITY_BAR = {
  current: 'Adjectives (high fidelity, rich, premium, bespoke, editorial) + an unavailable comparison image + self-attested checklists (brand expression 19/19, Composer pass:true).',
  verdict: 'NOT GROUNDED. Every checklist passed and the founder rejected every round.',
  recommended: ['Attach the approved world image and judge side-by-side at the same size.', 'Countable visual evidence (MANDATORY EVIDENCE).', 'Anti-generic and anti-assembly tests answered with crops, not ticks.', 'QA by an agent or person other than the author; founder verdict final.'],
} as const;

/* ─────────────── 22–23. device chrome + logo / type ─────────────── */

export const F09_DEVICE_CHROME_AUDIT = {
  definitions: {
    MOBILE_VIEWPORT: 'The 393×852 pt JURNL product canvas: everything JURNL draws, edge to edge. The authority format.',
    PHONE_SCREENSHOT: 'A capture of a device screen including the OS. Never an authority format.',
    DEVICE_CHROME: 'UI owned by the OS, browser or hardware (status bar, island / notch, home indicator, bezel, URL bar, keyboard). Always excluded.',
    PRODUCT_CHROME: 'Persistent UI owned by JURNL (bottom nav, lockup, product buttons such as back / ask). Included only as an approved authority or contract defines it.',
  },
  origin: [
    'L02 §8 framed generation as 9:16 with the viewport as the central 82 % (device-shaped thinking).',
    'The agent’s own canonical geometry defined status_bar (9:41) and home_indicator rows (f09-creative-direction.ts F09_FRAME_GEOMETRY), reused by the blueprints (systemZones).',
    'L03 named a SYSTEM CHROME ZONE / L6 SYSTEM CHROME without defining it; the Sunburst prompts asked for an “iPhone status bar”.',
    'Execution-1 assembly rendered a 9:41 status row (scripts/jurnl/f09-hybrid-composite-assemble.mjs).',
  ],
  approved_evidence: 'None of the approved JURNL authorities (F01 WELCOME, F02 / F03 / F04 parents) shows device chrome.',
} as const;

export const F09_TYPE_INTEGRATION = {
  why_glitches: [
    'Round 2 asked the generator for ≈ 19 exact strings including 8-pt labels, with no typographic reference (JURL wordmark, dropped TRIPS.).',
    'The official logo was attached as an image to reproduce; the generator redrew it (3-leaf sprig).',
    'The founder ChatGPT pass ran in a chat holding other JURNL context → onboarding copy leaked (A QUIETER YOU, BEGIN YOUR JOURNEY).',
  ],
  why_pasted_on: [
    'From round 3 every string sat in one flat top plane over a finished plate: no shared light, grain, perspective or occlusion.',
    'Type was styled as app UI (small labels, chips, bordered panels), never as a display element — no headline hero as in the approved F03 / F04 parents.',
    'The plates reserved quiet regions for text, so type floats in emptiness instead of relating to architecture.',
  ],
  separate: {
    EXACT_TEXT_RENDERING: 'Whether every letter and digit is right. Owner: correction (deterministic setting / region repaint) or the generator for ≤ 4 large strings verified by OCR.',
    TYPOGRAPHIC_ART_DIRECTION: 'Scale, crop, placement, alignment to architecture, relation to surfaces and objects. Owner: creative direction — decided in the composition comp over the approved world, before generation.',
  },
  recommendations: [
    'Design the type in the composition comp (over the approved world) before any generation.',
    'Let the generator render the large display strings in place so they share the scene’s light; correct letters afterwards by region repaint, not by pasting a layer.',
    'At least one product element shares a surface, plane or occlusion with the world (a figure behind a curtain edge, a label on stone in perspective).',
    'Small labels stay deterministic but align to the architecture’s lines and use the scene’s grade.',
    'No app-component chrome (borders, pills, frosted boxes) around authority type.',
    'Logo: the generator places the lockup; the compositor swaps in the official asset at the same position, scale and light. An in-world cue (book spine, seal) is rendered and then corrected against the asset.',
  ],
} as const;

/* ─────────────── 41. forensics table ─────────────── */

export type ForensicsRow = { prompt: string; intended_job: string; key_instructions: string[]; contradictions: string[]; missing_logic: string[]; over_constraint: string[]; under_specification: string[]; likely_failure: string; severity: Severity };

export const F09_FORENSICS_TABLE: ForensicsRow[] = [
  { prompt: 'L01 · VISUAL-AUTHORITY-3-TERRITORY-PROOF1 (founder brief)', intended_job: 'Three brand-true structural territories from upstream contracts, no legacy leakage.', key_instructions: ['legacy visual firewall (composition, image placement, background, materials)', 'KNOWN FAILURE: pretty background + text + stacked cards', 'distinct by structure; blur test', 'CENTER_STAGE', 'every number maps to an F09 field', 'do not use OpenArt'], contradictions: ['C01', 'C02', 'C06', 'C09', 'C15'], missing_logic: ['legacy UI ≠ approved brand world', 'world binding', 'a render route'], over_constraint: ['firewall extends to backgrounds and materials'], under_specification: ['brand-true', 'JURNL world'], likely_failure: 'Clean UI studies that are not JURNL; sets the world-exclusion that persists.', severity: 'CRITICAL' },
  { prompt: 'L02 · CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1 (founder brief)', intended_job: 'Creative direction + brand expression gates; three 4K Sunburst candidates.', key_instructions: ['22-field creative translation per territory', 'creative distinctness ≥ 8/10 incl. environment, material, depth', 'Sunburst 4K, 9:16, viewport = central 82 %', 'generator renders full screen with locked text / logo / nav / CTA', 'anti-generic + anti-AI rules', 'comparison concept as quality bar', 'do not use OpenArt'], contradictions: ['C03', 'C04', 'C06', 'C12', 'C13', 'C16', 'C18', 'C19', 'C20'], missing_logic: ['attach the approved world', 'exact-text budget', 'what makes richness legitimate'], over_constraint: ['distinctness in the world layer', 'bans on richness vocabulary'], under_specification: ['witty', 'bespoke', 'rich', 'editorial', 'Mediterranean'], likely_failure: 'Metaphor-as-page renders; JURL wordmark, dropped TRIPS.; status bar.', severity: 'HIGH' },
  { prompt: 'L02b · Sunburst prompts ×3 (≈ 2,000 words, 22 sections)', intended_job: 'Execute the locked translation as one full-screen render.', key_instructions: ['orthographic overhead courtyard / frontal wall / frontal rack', 'iPhone status bar 9:41 + square icon buttons', '19 strings that must render', 'hex codes for 11 colours; percent geometry for ~15 zones', 'FORBIDDEN: arches, sea-view balconies, more than one plant'], contradictions: ['C04', 'C10', 'C18', 'C19', 'C20'], missing_logic: ['the world image', 'foreground / depth', 'a view out'], over_constraint: ['22 sections', 'zone geometry to the percent'], under_specification: ['environment in one paragraph of nouns'], likely_failure: 'Diagrammatic pages in correct colours; text errors; device chrome.', severity: 'HIGH' },
  { prompt: 'L02d · ChatGPT prompts ×3 (founder run)', intended_job: 'Same render via the founder’s ChatGPT.', key_instructions: ['value study = composition lock', 'logo = reproduce exactly', 'render only listed words'], contradictions: ['C06', 'C13'], missing_logic: ['a clean context (fresh chat)', 'the world image'], over_constraint: ['as L02b'], under_specification: ['as L02b'], likely_failure: 'Copy contamination (A QUIETER YOU, BEGIN YOUR JOURNEY), blank / broken nav.', severity: 'MEDIUM' },
  { prompt: 'L03 · COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1 (founder brief)', intended_job: 'Page blueprint + render ownership; generator renders art layers only.', key_instructions: ['blueprint at 393×852', 'ownership L0–L8', 'generator may not render precision UI', 'generator may create negative space / placeholders', 'metaphor contained to OBJECT / ZONE', 'SYSTEM CHROME ZONE'], contradictions: ['C04', 'C05', 'C07', 'C08', 'C10', 'C13', 'C16', 'C17'], missing_logic: ['integration rules (light, plane, occlusion)', 'definition of chrome', 'the world image'], over_constraint: ['pt rectangles per zone'], under_specification: ['composite', 'authority', 'finished'], likely_failure: 'Establishes plate + overlay; status bar in blueprints.', severity: 'HIGH' },
  { prompt: 'L03a/b · plate prompts ×3 + plate guides (image2image, “ONLY geometry authority”)', intended_job: 'Text-free scene plates matching the blueprint.', key_instructions: ['BLANK SURFACES', 'QUIET REGIONS', 'MATERIALS (no others)', 'MUST NOT CONTAIN', 'guide = the only reference (PREFIX)'], contradictions: ['C05', 'C18'], missing_logic: ['the world image', 'foreground', 'what fills the blanks'], over_constraint: ['material whitelist', 'quiet region per product zone'], under_specification: ['richness', 'view'], likely_failure: 'Plates are photographs of the diagrams, with blank tags and plaques.', severity: 'CRITICAL' },
  { prompt: 'L04 · HYBRID-COMPOSITE-AUTHORITY-EXECUTION1 (Composer; reconstructed)', intended_job: 'Plates + deterministic UI at 393×852.', key_instructions: ['assemble HTML/CSS over plates', 'render the blueprint’s system zones'], contradictions: ['C07', 'C08', 'C10'], missing_logic: ['integration rules', 'independent QA'], over_constraint: ['blueprint rectangles'], under_specification: ['finished'], likely_failure: 'iOS chrome, cards over photos, one concept resolved.', severity: 'HIGH' },
  { prompt: 'L05 · THREE-DISTINCT-COMPOSITE-AUTHORITY-RERUN1 (Composer; reconstructed)', intended_job: 'Three finished, distinct, chrome-free composites.', key_instructions: ['reuse execution-1 plates', 'new overlay layouts', 'fixed founder payload', 'self-QA'], contradictions: ['C05', 'C08', 'C11'], missing_logic: ['new generation', 'independent QA'], over_constraint: ['identical product stack'], under_specification: ['distinct'], likely_failure: 'Same sparse plates, blank brass plates, dashed border; pass:true vs founder REJECTED.', severity: 'HIGH' },
  { prompt: 'L06 · THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1 (founder brief)', intended_job: 'Fully re-authored, benchmark-rich, chrome-free candidates.', key_instructions: ['re-author fully; scaffolding invisible', 'benchmark = approved art-driven JURNL image', 'no device chrome', 'preserve territories', 'no OpenArt from ChatGPT'], contradictions: ['C01', 'C02', 'C05', 'C07', 'C14'], missing_logic: ['image2image route that can deliver', 'which image is the world authority', 'composition mode'], over_constraint: ['preserve the three premises'], under_specification: ['fully re-authored', 'benchmark-rich'], likely_failure: 'Methodology + text2image scenes; retrieval blocked; layout proof only.', severity: 'HIGH' },
  { prompt: 'L06a · scene prompts ×3 (Figma Sunburst text2image)', intended_job: 'Benchmark-rich, text-free world per territory.', key_instructions: ['editorial architectural photograph', 'important elements in the central 80 %', 'plain empty fields reserved for the product (T01 “completely empty” centre; T02 / T03 plain walls)', 'blank book covers and spines, blank wax-seal faces', 'DO NOT INCLUDE text / UI / device frames'], contradictions: ['C03', 'C05', 'C09'], missing_logic: ['the world image as input', 'what the blank objects become'], over_constraint: ['completely empty middle third (T01)'], under_specification: ['how product and world meet'], likely_failure: 'Three richer but invented worlds, not the approved one; blank objects carried over from the plate logic.', severity: 'MEDIUM' },
];

/* ─────────────── 25–26 + 42. root causes ─────────────── */

export type RootCause = { rank: number; id: string; cause: string; classes: PromptFailureClass[]; evidence: string[]; confidence: 'HIGH' | 'MEDIUM' | 'LOW'; impact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; failures: string[] };

export const F09_ROOT_CAUSES: RootCause[] = [
  { rank: 1, id: 'RC01', cause: 'The approved JURNL world was never bound — and was actively excluded. Every approved JURNL image is image2image from F01.00 WELCOME APPROVED; F09 never attached it, the legacy firewall banned prior background / material treatment, and the contamination guard forbade F01 references.', classes: ['PROMPT_OMISSION', 'REFERENCE_AMBIGUITY', 'PROMPT_CONTRADICTION'], evidence: ['F03_GENERATION_LEDGER.json (REFERENCE_BINDING_FAILURE_F02_F03_2026)', 'F01 openart_generation_log.json', 'F09_RENDER_CONTAMINATION_GUARD.json', 'f09-safe-to-spend.ts PLATE_LOGGIA “image not opened”'], confidence: 'HIGH', impact: 'CRITICAL', failures: ['generic', 'weak Mediterranean identity', 'missing richness', 'below benchmark'] },
  { rank: 2, id: 'RC02', cause: 'The wrong image was the reference: image2image from agent-drawn tonal guides / value studies, declared “the ONLY reference”. The renderer reproduced the diagrams.', classes: ['PIPELINE_ORDER', 'REFERENCE_AMBIGUITY'], evidence: ['RAW_PLATES/T01_ENVIRONMENT.png vs PLATE_GUIDES/F09_T01_PLATE_GUIDE_9x16.png', 'scripts/jurnl/f09-scene-plate-generate-one.py PREFIX'], confidence: 'HIGH', impact: 'CRITICAL', failures: ['scene plates became the design', 'plan-diagram energy', 'sparse plates'] },
  { rank: 3, id: 'RC03', cause: 'Rules forbade the benchmark’s signature: no arches, no sea-view balconies, one justified plant, olive only in the bleed, orthographic / frontal depth models, “pretty background” as the named failure.', classes: ['PROMPT_CONTRADICTION', 'PROMPT_OVER_CONSTRAINT'], evidence: ['SUNBURST_PROMPTS/T01 FORBIDDEN ELEMENTS', 'creative-direction-profile.ts anti_generic_rules', 'L01 KNOWN FAILURE'], confidence: 'HIGH', impact: 'HIGH', failures: ['weak Mediterranean identity', 'sparse / cold'] },
  { rank: 4, id: 'RC04', cause: 'Distinctness was placed in the wrong layer and presentation was locked: three different worlds demanded (≥ 8/10 creative dimensions incl. environment), while the product layer was identical across concepts.', classes: ['PROMPT_OVER_CONSTRAINT', 'PROMPT_CONTRADICTION'], evidence: ['creative-direction.ts CREATIVE_DISTINCTNESS', 'F09_FOUNDER_REVIEW_PAYLOAD.json', 'rerun composites'], confidence: 'HIGH', impact: 'HIGH', failures: ['three concepts collapse into variants', 'concepts feel unfinished'] },
  { rank: 5, id: 'RC05', cause: 'The plate + overlay method was specified without an integration method: placeholders requested then left visible; UI built from app components in one flat plane; no light / plane / occlusion rules.', classes: ['RENDER_OWNERSHIP', 'IMPLEMENTATION_LIMITATION', 'PROMPT_CONTRADICTION'], evidence: ['PLATE_PROMPTS BLANK SURFACES', 'scripts/jurnl/f09-three-distinct-composite-rerun.mjs (bordered chips, pill seals, dashed bridge)', 'rerun FOUNDER_REVIEW_BOARD.png'], confidence: 'HIGH', impact: 'HIGH', failures: ['assembled not authored', 'deterministic UI crude', 'pasted-on text'] },
  { rank: 6, id: 'RC06', cause: 'Role collapse and priority dilution: 59–75 % of each brief is process / QA / render / negatives; ~2,000-word generator prompts; the same agent wrote, rendered and passed its own QA.', classes: ['PROMPT_ROLE_COLLAPSE', 'PROMPT_PRIORITY_DILUTION'], evidence: ['PROMPT_DENSITY_MEASUREMENT.json', 'brand expression 19/19 PASS; RERUN1_REPORT pass:true; founder REJECTED'], confidence: 'HIGH', impact: 'HIGH', failures: ['implementation prompts over-index on mechanics', 'checklists pass, founder fails'] },
  { rank: 7, id: 'RC07', cause: 'Device chrome was injected by the agent’s own canonical geometry; “system chrome” was never defined.', classes: ['PROMPT_OMISSION', 'AUTHORITY_AMBIGUITY'], evidence: ['f09-creative-direction.ts F09_FRAME_GEOMETRY status_bar / home_indicator', 'f09-composition-blueprint.ts systemZones', 'scripts/jurnl/f09-hybrid-composite-assemble.mjs (9:41 status row)', 'HYBRID_COMPOSITE_AUTHORITY_EXECUTION1 composites'], confidence: 'HIGH', impact: 'MEDIUM', failures: ['phone chrome in authority view'] },
  { rank: 8, id: 'RC08', cause: 'Renderer access contradictions: the canonical 4K route was banned while being required; later routes could not take a reference image or deliver the file.', classes: ['PROMPT_CONTRADICTION', 'ASSET_LIMITATION'], evidence: ['L01 / L02 DO NOT use OpenArt vs §8 Sunburst 4K', 'REGEN_RENDER_LEDGER.json'], confidence: 'HIGH', impact: 'MEDIUM', failures: ['round 1 local renders', 'ChatGPT contamination', 'blocked regen'] },
  { rank: 9, id: 'RC09', cause: 'The quality bar was adjectives plus an image that never reached the agent.', classes: ['REFERENCE_AMBIGUITY', 'PROMPT_OMISSION'], evidence: ['L02 §15 / L03 §9 (comparison concept described, not attached)'], confidence: 'HIGH', impact: 'MEDIUM', failures: ['“reference fidelity” language without reference-level richness'] },
  { rank: 10, id: 'RC10', cause: 'Territories were authored as data-encoding metaphors (floor area = money, metal words, envelope thickness); depicting them literally reads as a diagram.', classes: ['PROMPT_OVER_CONSTRAINT'], evidence: ['f09-creative-direction.ts bespoke_visual_idea fields', 'round 2 renders'], confidence: 'MEDIUM', impact: 'MEDIUM', failures: ['metaphor-as-page', 'diagram energy'] },
  { rank: 11, id: 'RC11', cause: 'Too much exact text was given to the generator (≈ 19 strings incl. 8-pt labels) with no typographic reference.', classes: ['RENDER_OWNERSHIP', 'MODEL_RENDERER_LIMITATION'], evidence: ['SUNBURST_PROMPTS TEXT THAT MUST RENDER', 'JURL / dropped TRIPS. in round 2'], confidence: 'MEDIUM', impact: 'MEDIUM', failures: ['text glitches'] },
  { rank: 12, id: 'RC12', cause: 'Product truth drifted between rounds (QA-seed → founder payload; TRIPS → BUFFER; new date and bridge without a formula).', classes: ['AUTHORITY_AMBIGUITY'], evidence: ['F09_FOUNDER_REVIEW_PAYLOAD.json', 'safeToSpend.ts'], confidence: 'MEDIUM', impact: 'LOW', failures: ['churn, re-layout between rounds'] },
];

export const F09_FAILURE_MAP: Record<string, string[]> = {
  'outputs feel generic': ['RC01', 'RC03', 'RC09'],
  'Mediterranean identity is weak': ['RC01', 'RC03'],
  'environmental richness is missing': ['RC01', 'RC02', 'RC03'],
  'compositions feel assembled rather than authored': ['RC05', 'RC02'],
  'scene plates become the design': ['RC02'],
  'deterministic UI is correct but visually crude': ['RC05'],
  'text glitches or feels pasted-on': ['RC11', 'RC05'],
  'concepts feel unfinished': ['RC05', 'RC04', 'RC02'],
  'three concepts collapse into variants': ['RC04'],
  'generated backgrounds treated as finished visual thought': ['RC02', 'RC06'],
  'authority images are under-consumed': ['RC01', 'RC09'],
  '“reference fidelity” does not produce reference-level richness': ['RC01', 'RC09', 'RC02'],
  'implementation prompts over-index on mechanics': ['RC06'],
  'mobile viewport read as phone rendering': ['RC07'],
  'corrective prompts accumulate contradictory constraints': ['RC06', 'RC03', 'RC04'],
};

/* ─────────────── 27–35. architecture for F09 ─────────────── */

export const F09_FREEDOM_BUDGET: Record<string, { level: FreedomLevel; rule: string }> = {
  layout: { level: 'GUIDED', rule: 'Edge-led editorial or CENTER_STAGE per the founder decision below; nav zone and 2-second clarity fixed.' },
  primary_object: { level: 'FREE', rule: 'Each concept its own — inside the inherited world.' },
  logo_placement: { level: 'GUIDED', rule: 'Official asset; lockup top-left by default; one in-world brand cue allowed (book spine, seal, stationery).' },
  amount_placement: { level: 'GUIDED', rule: 'Largest numeral, in the upper 60 %, any alignment or scale.' },
  cta_placement: { level: 'GUIDED', rule: 'Label locked; square-rounded; position and material free above the nav.' },
  category_visualization: { level: 'FREE', rule: 'Names locked (BILLS · PLANS · GOALS · BUFFER); form free; never blank objects.' },
  brand_framing: { level: 'GUIDED', rule: 'Lockup + in-world cue; never a box.' },
  environment: { level: 'LOCKED', rule: 'The JURNL world (F01.00 WELCOME APPROVED family) — viewpoint, room and time of day may vary.' },
  materials: { level: 'GUIDED', rule: 'World palette incl. burgundy and sea-blue masses; rough / sheer / soft contrast required.' },
  typography: { level: 'GUIDED', rule: 'JURNL fonts and uppercase locked; scale, crop and relation to the world free.' },
  nav: { level: 'LOCKED', rule: 'Runtime nav, HOME active.' },
  secondary_modules: { level: 'GUIDED', rule: 'Purchase bridge copy locked; form free (card, note, object, inline).' },
};

export const F09_MANDATORY_EVIDENCE = [
  { category: 'MEDITERRANEAN EVIDENCE', minimum: '≥ 1 arch or arcade; ≥ 1 view out to sea / coast or sunlit exterior; limewash or rough travertine visible; directional sun with cast shadows.' },
  { category: 'ENVIRONMENTAL DEPTH', minimum: '≥ 3 planes: a foreground element (out-of-focus olive, drape), a mid-ground still life or object, a background (architecture / view).' },
  { category: 'MATERIAL RICHNESS', minimum: '≥ 4 materials incl. 1 rough mineral, 1 soft textile, 1 translucent; ≥ 1 accent colour mass (burgundy / rose / sea blue).' },
  { category: 'EDITORIAL DESIGN', minimum: 'One display element ≥ 56 pt (word or figure); a tracked deck; one deliberate asymmetry; type participates in the image.' },
  { category: 'BOTANICAL / NATURAL PRESENCE', minimum: 'Olive or greenery in ≥ 2 places, one of them foreground.' },
  { category: 'ARCHITECTURAL FRAMING', minimum: 'The product zone’s quiet field is produced by architecture or light (lit wall, curtain glow, sky), not by a panel.' },
  { category: 'BRAND PRESENCE', minimum: 'Official lockup exact; ≥ 1 in-world brand cue rendered faithfully.' },
  { category: 'PRODUCT CLARITY', minimum: 'Amount legible at 25 % thumbnail; SAFE TO SPEND within one glance of the amount; CTA contrast ≥ 4.5:1; nav exact.' },
  { category: 'NO SCAFFOLDING', minimum: 'Zero blank plates / tags / guide boxes / placeholder panels; zero device chrome.' },
] as const;

export const F09_MODEL_RESPONSIBILITIES = {
  OPUS: 'Creative direction, world inheritance, concept theses, composition comps over the approved world, generator briefs, reference extraction sheets.',
  IMAGE_MODEL: 'Full-frame image bound to the approved world: environment, objects, UI surfaces and the few large exact strings.',
  COMPOSITOR: 'Exactness only: logo swap, small text, nav, numbers — by region repaint with the scene’s light, grain and perspective.',
  COMPOSER: 'Production implementation after authority lock; never authority rendering.',
  QA: 'An agent or person other than the author: benchmark side-by-side, anti-generic, anti-assembly, reference consumption; the founder verdict is final.',
  correction: 'The division in the methodology is right in principle; it failed because the image model was never given the world and the compositor was asked to create the integration instead of correcting a whole image.',
} as const;

export const F09_FULLY_AUTHORED_REFINED = [
  'Stated thesis in one sentence, visible without the copy.',
  '≥ 3 planes, including a foreground that frames the product.',
  'The product zone’s quiet field comes from the world (light, architecture), not a box.',
  'Type is part of the image: scale, crop, alignment to architecture; at least one product element shares a surface, plane or occlusion with the world.',
  'One light: shadows, grain and colour grade continuous across product and world.',
  'JURNL-world specificity: arch / view / still life / burgundy / book — not a genre.',
  'Zero scaffolding, zero device chrome, zero filler.',
] as const;

/* ─────────────── 36–39. survivals ─────────────── */

export const F09_SURVIVAL = {
  three_territory_model: { verdict: 'REFINE', why: 'Three concepts remain useful for founder choice, but they must differ in page architecture and product idea while sharing the inherited JURNL world, type system and nav. Remove environment / material / depth from the distinctness test; add product-layer anatomy to it.' },
  plates: { verdict: 'REMOVE', why: 'Text-free plates + overlay is the method that produced every rejected round. Replace with reference-bound full-frame generation + targeted correction (region repaint / inpainting). Keep plate generation only for harvesting isolated assets.' },
  deterministic_ui: { verdict: 'NARROW', why: 'Keep deterministic exactness for logo, numbers, dates, small labels, CTA labels and nav. Stop using it as the visual layer: product surfaces (buttons, panels, objects carrying labels) are art-directed in the image and corrected, not pasted.' },
  sunburst: { verdict: 'NO', why: 'Sunburst produced every approved JURNL image (image2image, 4K). The F09 plates faithfully executed the inputs they were given. Text rendering at small sizes is a real but secondary limitation, handled by correction.' },
} as const;

/* ─────────────── 44. keep / rewrite / remove ─────────────── */

export const F09_RULE_DISPOSITIONS: { rule: string; disposition: 'KEEP' | 'REWRITE' | 'REMOVE' | 'FOUNDER_DECISION'; note: string }[] = [
  { rule: 'REFERENCE = DESIGN AUTHORITY', disposition: 'REWRITE', note: 'Typed references with one role each; the approved JURNL world is a mandatory WORLD authority bound by image2image.' },
  { rule: 'LEGACY VISUAL FIREWALL', disposition: 'REWRITE', note: 'Firewall legacy UI layout and components; never the approved brand world.' },
  { rule: 'THREE TERRITORIES', disposition: 'REWRITE', note: 'Distinct in structure, shared in world.' },
  { rule: 'CREATIVE DISTINCTNESS ≥ 8/10 (incl. environment, material, depth)', disposition: 'REMOVE', note: 'Replace with product-layer anatomy distinctness.' },
  { rule: 'RAW PLATES', disposition: 'REMOVE', note: 'As the authority method.' },
  { rule: 'PLATE GUIDE AS THE ONLY REFERENCE', disposition: 'REMOVE', note: 'Agent-drawn guides transfer style.' },
  { rule: 'BLANK SURFACES / PLACEHOLDERS', disposition: 'REMOVE', note: 'Objects either carry composited text or carry none.' },
  { rule: 'DETERMINISTIC UI', disposition: 'REWRITE', note: 'Narrow to exactness; art-direct product surfaces.' },
  { rule: 'COMPOSITE AUTHORITY', disposition: 'REWRITE', note: 'Composite = whole-frame generation + correction, not plate + overlay.' },
  { rule: 'NO DEVICE CHROME', disposition: 'KEEP', note: 'With DEVICE_CHROME_RULE wording; delete status bar / home indicator from all F09 geometry.' },
  { rule: 'BLUR TEST', disposition: 'KEEP', note: 'Structure must carry identity — but it must never be used to suppress the world. Pair with the benchmark-richness test.' },
  { rule: 'ANTI-TEMPLATE TEST', disposition: 'REWRITE', note: 'Becomes ANTI_GENERIC_TEST + ANTI_ASSEMBLY_TEST with crops as evidence.' },
  { rule: 'METAPHOR CONTAINMENT', disposition: 'KEEP', note: 'OBJECT / ZONE default stands.' },
  { rule: 'FIXED PRODUCT PAYLOAD', disposition: 'REWRITE', note: 'Lock values and copy; free the presentation; record formula status (date has none).' },
  { rule: 'JURNL PROFILE: no sea-view balconies; single justified plant', disposition: 'REMOVE', note: 'Contradicts the approved world.' },
  { rule: 'T01 FORBIDDEN: arches', disposition: 'REMOVE', note: 'Imported from a legacy anti-convergence note.' },
  { rule: 'ANTI-AI FLAGS', disposition: 'KEEP', note: 'As an audit after rendering; not as generator-prompt content.' },
  { rule: 'CONTAMINATION GUARD', disposition: 'REWRITE', note: 'Guard copy and concept bleed; allow world references by role (WORLD, not COPY).' },
  { rule: 'BRAND EXPRESSION CHECKLIST (self-attested)', disposition: 'REWRITE', note: 'Evidence-based minimums judged by someone other than the author.' },
  { rule: 'FINISH_QA + FOUNDER VERDICT BLOCKS', disposition: 'KEEP', note: 'Judged with crops and a benchmark side-by-side.' },
  { rule: 'GENERATOR ~2,000-WORD PROMPTS', disposition: 'REMOVE', note: 'GENERATOR_PROMPT_BUDGET: ≤ 300 words, ≤ 5 negatives, references attached.' },
  { rule: 'SUNBURST · 4K · 9:16 · AUTO-ENHANCE OFF', disposition: 'KEEP', note: 'Add: image2image from the approved world; route preflight before the sprint.' },
  { rule: 'CENTER_STAGE for F09', disposition: 'FOUNDER_DECISION', note: 'Canonical for nav-bearing screens, but the approved world composition is edge-led. Either grant F09 a COMPOSITION_OVERRIDES entry or define a CENTER_STAGE richness grammar (world framing all four edges).' },
];

/* ─────────────── 45. missing logic ─────────────── */

export const F09_MISSING_LOGIC = [
  'WORLD BINDING: the approved JURNL world (F01.00 WELCOME APPROVED; same-world family parents) is attached as image2image WORLD authority for every F09 generation.',
  'LEGACY ≠ BRAND WORLD: a rule separating legacy UI (firewalled) from approved brand-world authority (inherited).',
  'WHERE DISTINCTNESS LIVES: shared world + type system + nav; distinct page anatomy, product object, type–world relationship, CTA form.',
  'COUNTABLE VISUAL EVIDENCE: depth planes, arch / view, foreground botanical, material contrast, accent masses, in-world brand (F09_MANDATORY_EVIDENCE).',
  'A PRODUCT ↔ WORLD COMPOSITION MODEL: where the quiet field comes from and how the world frames the product (edge-led or centre-stage-with-rich-edges, by founder decision).',
  'ORDER: composition comp over the approved world → whole-frame generation → targeted correction → QA.',
  'EXACT-TEXT STRATEGY: which ≤ 4 large strings the generator renders; everything else corrected by region repaint in the scene’s light; repair loop with OCR.',
  'INTEGRATION RULES for corrections: light direction, grain, perspective, occlusion; no app-component styling in authority images.',
  'PRODUCT TRUTH RECORD: one payload with provenance and formula status (AVAILABLE THROUGH has no formula yet; BUFFER vs safetyBuffer naming).',
  'REFERENCE CONSUMPTION: an extraction sheet per reference before generation; QA against it.',
  'INDEPENDENT QA: not the author; benchmark side-by-side; crops as evidence.',
  'DEVICE_CHROME_RULE wording everywhere; delete status bar / home indicator from F09 geometry.',
  'RENDER-ROUTE PREFLIGHT: confirm image2image + 4K + file retrieval in the executing environment before the sprint starts.',
  'CONCEPT_DELIVERY_CONTRACT: what counts as one concept.',
  'PROMPT BUDGETS: generator prompt ≤ 300 words, ≤ 5 negatives; methodology changes not bundled into creative sprints.',
  'FREEDOM BUDGET declared in the brief (F09_FREEDOM_BUDGET).',
];

/* ─────────────── 46. next-sprint spec ─────────────── */

export const F09_NEXT_SPRINT_SPEC = {
  must: [
    'Resolve D-F09-COMPOSITION-MODE, D-F09-WORLD-AUTHORITY and D-F09-AVAILABLE-DATE-FORMULA first.',
    'Attach the approved world as WORLD authority — F01.00 WELCOME APPROVED unless D-F09-WORLD-AUTHORITY decides otherwise, optionally with the same-world parents — image2image, in an environment that can deliver 4K files.',
    'State one thesis per concept and the product-layer anatomy that makes it distinct; share world, type system and nav.',
    'Include the exact payload with provenance; lock strings, not forms.',
    'Declare the freedom budget and the mandatory visual evidence.',
    'Specify generate-whole-then-correct ownership and the exact-text strategy.',
    'Require a reference extraction sheet before generation and a benchmark side-by-side after.',
    'Define QA by someone other than the author and the delivery contract (three finished concepts or fewer, never proofs).',
    'Keep the generator prompt ≤ 300 words and ≤ 5 negatives.',
  ],
  must_not: [
    'Add new gates, schemas or methodology layers inside the creative sprint.',
    'Use plates, plate guides or value studies as generator references.',
    'Ask the generator for blank surfaces or placeholders.',
    'Ban arches, sea views or botanicals; demand different worlds per concept.',
    'Include status bar, home indicator or “system chrome” language.',
    'Use app components (bordered cards, pills, frosted boxes) as authority UI.',
    'Exceed the negative budget or paste QA lists into the generator prompt.',
    'Self-certify QA or present proofs as candidates.',
    'Invent product truth (a date formula, new categories) without a recorded decision.',
  ],
} as const;

export const F09_FOUNDER_DECISIONS_REQUIRED = [
  { id: 'D-F09-COMPOSITION-MODE', question: 'May F09 leave CENTER_STAGE for an edge-led editorial composition like the approved world (COMPOSITION_OVERRIDES), or must it stay centre-stage with a world framing all four edges?' },
  { id: 'D-F09-WORLD-AUTHORITY', question: 'Is F01.00 WELCOME APPROVED the world authority for F09 (the explicitly approved image), with F02 / F03 / F04 parents as same-world examples? (The previous round named the F03 parent, which is IN_REVIEW.)' },
  { id: 'D-F09-AVAILABLE-DATE-FORMULA', question: 'AVAILABLE THROUGH OCT 18 is a sample with no formula in computeSafeToSpend. Keep it as an authority sample only, or define the horizon?' },
] as const;

/* ─────────────── 40. synthesis + verdict ─────────────── */

export const F09_SYNTHESIS = [
  '1. JURNL’s richness lives in one approved image — the F01 Welcome cliff-villa loggia — and every successful JURNL screen was rendered from it, image to image.',
  '2. F09 never gave that image to the renderer. Sprint 1 firewalled prior visuals (including backgrounds and materials) and named “pretty background + text + cards” as the failure; the contamination guard later forbade F01 references outright.',
  '3. Without it, every round tried to invent a JURNL world in words. The words that would have recovered it were banned (arches, sea views, botanicals, depth), and the distinctness gate demanded three different worlds.',
  '4. From round 3 the only image the renderer saw was the agent’s own tonal guide, declared “the only reference”; image-to-image copied it, so the plates were photographs of diagrams with blank placeholders.',
  '5. Product truth was then laid on top as app components in one flat plane with an OS status bar, in an identical stack for all three concepts — assembled, not authored, and not distinct.',
  '6. Each correction added methodology and negatives rather than restoring the reference, and the same agent certified its own checklists, so every round passed QA and failed the founder.',
] as const;

export const F09_FORENSICS_VERDICT = {
  PROMPT_SYSTEM_ROOT_CAUSE_IDENTIFIED: true,
  READY_TO_REWRITE_F09_GENERATION_PROMPT: false,
  why_not_ready: 'Three founder decisions (composition mode, world authority, date formula) and a render-route preflight (image2image + 4K + retrieval in the executing environment) must come first.',
  generation_performed: false,
  implementation_performed: false,
} as const;
