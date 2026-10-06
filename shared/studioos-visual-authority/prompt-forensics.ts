/**
 * Prompt forensics — Studio OS methodology for auditing a prompt system when APPROVED CREATIVE INTENT ≠ MODEL OUTPUT
 * (P0.JURNL.F09.PROMPT-FORENSICS-AND-CREATIVE-LOGIC-AUDIT1).
 *
 * Use it before adding another corrective instruction. Each corrective sprint that only adds constraints makes the prompt
 * longer, more negative and more internally contradictory; this method finds the defect instead. Project-agnostic: the
 * first application is JURNL F09 (projects/jurnl/f09-prompt-forensics.ts).
 */

export const PROMPT_FORENSICS_SPRINT = 'P0.JURNL.F09.PROMPT-FORENSICS-AND-CREATIVE-LOGIC-AUDIT1' as const;

/** Where a gap between intent and output can come from. A finding names one primary class. */
export const PROMPT_FAILURE_CLASSES = {
  PROMPT_CONTRADICTION: 'Two instructions cannot both be satisfied; the model satisfies one and silently drops the other.',
  PROMPT_OMISSION: 'The decisive requirement was never stated (often because it lived only in an image the prompt did not attach).',
  PROMPT_OVER_CONSTRAINT: 'Locked variables leave no meaningful creative freedom; the model varies whatever is still free (usually the background).',
  PROMPT_PRIORITY_DILUTION: 'Critical instructions are buried among process, QA, rationale and negatives; the model weights them like noise.',
  PROMPT_ROLE_COLLAPSE: 'One agent is asked to be creative director, methodology engineer, renderer operator, compositor and QA at once; creative decisions lose.',
  PIPELINE_ORDER: 'Steps happen in an order that prevents the intended result (e.g. art generated before the composition it must serve).',
  RENDER_OWNERSHIP: 'The wrong system owns a layer (the generator drawing exact text, or flat UI owning what should be in-world).',
  REFERENCE_AMBIGUITY: 'References are attached without a role, the wrong reference is attached, or the right one is named but never supplied.',
  IMPLEMENTATION_LIMITATION: 'The assembly / compositing step cannot reach the finish the brief asks for.',
  MODEL_RENDERER_LIMITATION: 'The model cannot do it even with a correct prompt. Must be proven (same prompt class succeeds elsewhere → not this).',
  ASSET_LIMITATION: 'A required asset (logo, font, reference, route) is missing or unreachable.',
  AUTHORITY_AMBIGUITY: 'It is unclear which image or rule is the authority, or two authorities disagree.',
} as const;
export type PromptFailureClass = keyof typeof PROMPT_FAILURE_CLASSES;

/** Instruction categories for the inventory. Similar instructions are not merged. */
export const INSTRUCTION_CATEGORIES = [
  'PRODUCT_TRUTH', 'BRAND_TRUTH', 'VISUAL_AUTHORITY', 'COMPOSITION', 'CONCEPT_FREEDOM', 'RESPONSIVE', 'RENDER_OWNERSHIP',
  'TYPOGRAPHY', 'LOGO', 'DATA', 'CTA', 'NAVIGATION', 'MATERIALS', 'ENVIRONMENT', 'IMAGE_GENERATION', 'DETERMINISTIC_UI', 'QA',
  'DELIVERY', 'ANTI_FAILURE', 'PROCESS', 'IMPLEMENTATION',
] as const;
export type InstructionCategory = (typeof INSTRUCTION_CATEGORIES)[number];

const RULES: [InstructionCategory, RegExp][] = [
  ['ANTI_FAILURE', /^(-\s*)?(do not|don't|no\b|not\b|never|avoid|forbid|must not|immediate fail)|\b(do not|must not|forbidden|anti-ai|anti-generic)\b/i],
  ['DETERMINISTIC_UI', /\b(deterministic|precision ui|ui layer|overlay|html\/css)\b/i],
  ['IMPLEMENTATION', /\b(implement|react|css|runtime|production jurnl|supabase|route[s]?\b|schema|rls)\b/i],
  ['RENDER_OWNERSHIP', /\b(owner|ownership|deterministic|generator may|image generator|l[0-8]\b|composite|baked|overlay|precision ui)\b/i],
  ['IMAGE_GENERATION', /\b(sunburst|4k|9:16|auto-enhance|openart|generate|generation|render|renderer|plate|prompt|image2image|text2image)\b/i],
  ['LOGO', /\b(logo|lockup|wordmark|botanical mark|tagline|descriptor)\b/i],
  ['NAVIGATION', /\b(nav|navigation|bottom-nav|bottom nav|tab bar|quick add)\b/i],
  ['CTA', /\b(cta|button|why this amount|check a purchase|see the full breakdown|primary action|secondary action)\b/i],
  ['TYPOGRAPHY', /\b(typograph|serif|sans|font|letterform|kerning|uppercase|text rendering|glyph)/i],
  ['DATA', /(\$[\d,]+|\b(amount|value|balance|financial values?|numbers?|data|percent|date|oct \d+)\b)/i],
  ['MATERIALS', /\b(plaster|limewash|travertine|limestone|linen|paper|oak|brass|bronze|stone|material|textile|wax|wood|velvet)\b/i],
  ['ENVIRONMENT', /\b(environment|mediterranean|coastal|architect|arch(es|ed)?|olive|botanical|scene|world|light|shadow|sea|courtyard|loggia)\b/i],
  ['COMPOSITION', /\b(composition|compose|zone|layout|hierarchy|negative space|focal|center_stage|stage|density|geometry|depth|grid|asymmetr|foreground|background|perimeter|column|align(ed)?|cent(red|ered)|graphic)\b/i],
  ['RESPONSIVE', /\b(responsive|tablet|desktop|viewport|393|852|mobile)\b/i],
  ['QA', /\b(qa|audit|test|check|guard|pass|verify|score|scorecard|criteria)\b/i],
  ['DELIVERY', /\b(deliverable|board|report|return|artifact|json|\.md|path|zip|package)\b/i],
  ['VISUAL_AUTHORITY', /\b(authority|reference|benchmark|quality bar|approved)\b/i],
  ['CONCEPT_FREEDOM', /\b(territor|concept|explore|freedom|metaphor|bespoke|witty|artistic|idea|premise|distinct)/i],
  ['BRAND_TRUTH', /\b(jurnl|brand|palette|bone|cream|ivory|greige|taupe|blush|rose|emerald|burgundy|champagne|obsidian|voice)\b/i],
  ['PRODUCT_TRUTH', /\b(safe to spend|product|function|state|user|decision|family|f09)\b/i],
];

const ANTI_SECTION = /DO NOT|FORBIDDEN|FAIL CONDITIONS|MUST NOT|ANTI-AI|ANTI-GENERIC|AVOID/i;
const QA_SECTION = /SUCCESS CRITERIA|PASS ONLY|SCORECARD|\bQA\b/i;
const DELIVERY_SECTION = /DELIVERABLE|FINAL REPORT|RETURN FORMAT|CONCLUSION/i;

/**
 * Deterministic first-pass classifier. Order: negative sections / wording → checklist and QA sections → delivery
 * sections → keywords in the line → keywords in the section heading → PROCESS. Reviewers may override per line.
 */
export function classifyInstruction(text: string, section = ''): InstructionCategory {
  if (ANTI_SECTION.test(section) || RULES[0]![1].test(text)) return 'ANTI_FAILURE';
  if (/^\[[ x]?\]/i.test(text) || QA_SECTION.test(section)) return 'QA';
  if (DELIVERY_SECTION.test(section)) return 'DELIVERY';
  for (const [cat, re] of RULES) if (re.test(text)) return cat;
  for (const [cat, re] of RULES.slice(1)) if (re.test(section)) return cat;
  return 'PROCESS';
}

/* ─────────────── the audit procedure ─────────────── */

export const PROMPT_FORENSICS_PROCEDURE = [
  { step: 1, id: 'COLLECT_LINEAGE', does: 'Recover every brief and every model-facing prompt from primary sources (transcripts, repo, commits, generation payloads). Mark anything reconstructed.' },
  { step: 2, id: 'RECONSTRUCT_PIPELINE', does: 'Write the pipeline the methodology believes in, then the pipeline that actually produced the outputs (which inputs reached the model).' },
  { step: 3, id: 'INVENTORY', does: 'Extract every instruction line; classify (INSTRUCTION_CATEGORIES); do not merge similar instructions.' },
  { step: 4, id: 'CONTRADICTIONS', does: 'Pair instructions that cannot both hold; name the output failure each causes and its severity.' },
  { step: 5, id: 'CONSTRAINT_BUDGET', does: 'Per variable: locked / guided / free. If free space is only the background, concepts will collapse into backdrop swaps.' },
  { step: 6, id: 'ADJECTIVE_GROUNDING', does: 'For every quality adjective: visual meaning, minimum evidence, structural consequence, and how a model satisfies the word but not the founder.' },
  { step: 7, id: 'DENSITY_AND_POLARITY', does: 'Measure words by bucket (creative / product truth / process / render / QA / negative) and negative vs positive creative lines.' },
  { step: 8, id: 'REFERENCE_AUDIT', does: 'List every reference: role, whether it was actually attached, and what the model could extract from it. Compare against the strongest approved references.' },
  { step: 9, id: 'OUTPUT_TRACE', does: 'Put each output beside the exact input that produced it (prompt + attached image). If the output reproduces the input, the input is the cause.' },
  { step: 10, id: 'ROOT_CAUSES', does: 'Assign a failure class per observed failure with evidence and HIGH / MEDIUM / LOW confidence. Blame the renderer only with proof.' },
  { step: 11, id: 'ARCHITECTURE', does: 'Rewrite the prompt architecture (layers, priority tiers, freedom budget, evidence minimums, tests) — not the next prompt.' },
] as const;

/** Model-renderer blame needs proof: the same model + method succeeding elsewhere in the project clears the model. */
export const RENDERER_BLAME_RULE = 'A renderer limitation is a root cause only when the same model, with a correct prompt and the right references, fails at the same task. If it succeeds on sibling authorities, the cause is upstream.' as const;

/* ─────────────── canonical prompt architecture ─────────────── */

/** Priority tiers. A lower tier never overrides a higher one. Methodology apparatus is not a tier of a generator prompt. */
export const PROMPT_PRIORITY_TIERS = [
  { tier: 0, id: 'HARD_TRUTH', holds: 'Exact product data and copy, nav items and order, official logo asset, no device chrome, project hard rules (e.g. uppercase, no circular controls).' },
  { tier: 1, id: 'VISUAL_AUTHORITY', holds: 'The approved world / design-system references, attached and bound (image-to-image where the renderer supports it), and the approved finish level.' },
  { tier: 2, id: 'CREATIVE_INTENT', holds: 'One compositional thesis per concept: what the page is, what the eye does, what the idea is.' },
  { tier: 3, id: 'CONCEPT_FREEDOM', holds: 'What each concept may change (declared freedom budget).' },
  { tier: 4, id: 'RENDER_EXECUTION', holds: 'Route, model, resolution, ownership of exact layers, correction method.' },
  { tier: 5, id: 'QA', holds: 'Evidence tests run after rendering. QA items are never pasted into the generator prompt.' },
] as const;

/** Layers of an agent brief, in order. A generator prompt is derived from A–G and stays short; H–J stay with the agent. */
export const PROMPT_ARCHITECTURE = [
  { layer: 'D', id: 'REFERENCE_AUTHORITY', order: 1, rule: 'First. Each reference has one role (WORLD · BRAND · COMPOSITION · TYPOGRAPHY · PRODUCT · QUALITY_BAR), is actually attached, and comes with an extraction sheet (REFERENCE_CONSUMPTION_TEST).' },
  { layer: 'C', id: 'BRAND_WORLD', order: 2, rule: 'The inherited world, named as a place with mandatory visual evidence — not adjectives.' },
  { layer: 'A', id: 'CREATIVE_BRIEF', order: 3, rule: 'One thesis per concept in plain positive language; what makes it this concept and not its siblings.' },
  { layer: 'B', id: 'NON_NEGOTIABLE_PRODUCT_TRUTH', order: 4, rule: 'Exact values and copy with provenance. Locks truth, not presentation.' },
  { layer: 'F', id: 'COMPOSITION_REQUIREMENTS', order: 5, rule: 'How product and world relate in space (frame, planes, where the quiet field comes from), for this concept.' },
  { layer: 'E', id: 'TERRITORY_FREEDOM', order: 6, rule: 'Declared LOCKED / GUIDED / FREE per variable.' },
  { layer: 'G', id: 'ART_DIRECTION_MINIMUMS', order: 7, rule: 'Mandatory visual evidence with countable minimums.' },
  { layer: 'H', id: 'RENDER_OWNERSHIP', order: 8, rule: 'Generate the whole; correct the parts. Deterministic only where exactness requires it.' },
  { layer: 'I', id: 'DELIVERY_CONTRACT', order: 9, rule: 'What counts as one concept (CONCEPT_DELIVERY_CONTRACT).' },
  { layer: 'J', id: 'QA', order: 10, rule: 'Benchmark side-by-side, anti-generic, anti-assembly, reference-consumption, product clarity.' },
] as const;

export const GENERATOR_PROMPT_BUDGET = {
  max_words: 300,
  max_negatives: 5,
  max_exact_strings_rendered_by_generator: 4,
  order: ['attached references and their roles', 'scene / world', 'composition and planes', 'concept object', 'exact large strings (if any)', 'critical negatives'],
  exclude: ['methodology names and gate ids', 'rationale for humans', 'QA lists', 'hex codes beyond the accent', 'percent geometry for more than the 3 main zones', 'sample-data provenance'],
} as const;

export const FREEDOM_LEVELS = ['LOCKED', 'GUIDED', 'FREE'] as const;
export type FreedomLevel = (typeof FREEDOM_LEVELS)[number];

/* ─────────────── tests ─────────────── */

export const ANTI_GENERIC_TEST = [
  { id: 'LOGO_SWAP', question: 'Replace the logo with another finance brand. Is the page still plausible for that brand?', fail_if: 'YES' },
  { id: 'WORLD_SWAP', question: 'Could this environment belong to a hotel, wellness or generic luxury app?', fail_if: 'YES — the world lacks the project’s own signifiers' },
  { id: 'TEMPLATE_ANATOMY', question: 'Strip the imagery: is the page anatomy a stock fintech / card template?', fail_if: 'YES' },
  { id: 'SIBLING_SWAP', question: 'Could this be a sibling family’s screen (e.g. TODAY) with the label changed?', fail_if: 'YES' },
  { id: 'ADJECTIVE_ONLY', question: 'Is every brand claim satisfied only by palette and material nouns?', fail_if: 'YES' },
] as const;

export const ANTI_ASSEMBLY_TEST = [
  { id: 'SEPARABLE_SYSTEMS', question: 'Can a viewer point to background plate, text layer and UI layer as separate construction systems?', fail_if: 'YES' },
  { id: 'LIGHT', question: 'Do UI shadows / highlights follow the scene’s light direction and softness?', fail_if: 'NO' },
  { id: 'GRAIN_SHARPNESS', question: 'Do UI and scene share grain, sharpness and colour grade?', fail_if: 'NO' },
  { id: 'PLANE', question: 'Does at least one product element sit on, in or behind a scene surface (occlusion, perspective, material) rather than floating above everything?', fail_if: 'NO' },
  { id: 'EDGES', question: 'Are there box edges, borders or panels unrelated to scene geometry?', fail_if: 'YES' },
  { id: 'PLACEHOLDERS', question: 'Is any blank plate, tag, card, guide box or empty mockup surface visible?', fail_if: 'YES' },
  { id: 'SCALE', question: 'Is UI scale consistent with the scene’s scale and viewpoint?', fail_if: 'NO' },
] as const;

export const REFERENCE_CONSUMPTION_TEST = {
  rule: 'Before generation the agent writes an extraction sheet per reference; the generator prompt cites the items it applies; QA checks the output against the sheet (≥ 80 % of WORLD and COMPOSITION items visibly present).',
  extract: ['composition (where product sits relative to world; planes; quiet field source)', 'environment inventory (architecture, view, foreground, still life)', 'material inventory (rough / smooth / soft / translucent / accent)', 'brand rules (lockup position, in-world brand cue)', 'density (objects per plane, empty vs designed space)', 'type scale (headline / figure / deck sizes and alignment)'],
} as const;

/** Canonical device-chrome rule (all projects). */
export const DEVICE_CHROME_RULE = {
  canvas: 'A mobile authority is a PRODUCT CANVAS (e.g. JURNL 393×852 pt), not a phone screenshot.',
  excluded: ['OS status bar (time, signal, Wi-Fi, battery)', 'dynamic island / notch', 'home indicator', 'phone frame or bezel', 'browser chrome (URL bar, tabs)', 'keyboard'],
  included: ['product-owned chrome only when an approved authority defines it (e.g. a product back / ask button, the product nav)'],
  geometry: 'OS safe-area insets may reserve empty space in the canvas; they never render content that imitates the OS.',
  term: '"System chrome" is ambiguous and must not appear in briefs; say DEVICE CHROME (excluded) or PRODUCT CHROME (named items).',
} as const;

/** What counts as one concept. */
export const CONCEPT_DELIVERY_CONTRACT = {
  is: 'One founder-review-ready authority image of the full product canvas: world, composition, exact product truth and brand, finished at the approved finish level, passing the anti-generic and anti-assembly tests.',
  is_not: ['raw plate', 'scene without product', 'partial layout', 'material study', 'prompt', 'wireframe', 'blueprint or zone map', 'background', 'layout proof', 'process artifact', 'a variant that shares its page anatomy with a sibling concept'],
} as const;

/** Operational definition of "fully authored". Every item is visible evidence, not intent. */
export const FULLY_AUTHORED_DEFINITION = [
  'One compositional thesis that a viewer can state in a sentence.',
  'Intentional foreground, midground and background (≥ 3 planes) or a declared flat thesis that is itself designed.',
  'A purposeful hierarchy: one figure, one action, everything else subordinate.',
  'Typography that participates in the image (scale, placement, relation to surfaces) rather than floating on it.',
  'Negative space that comes from the scene (a lit wall, a sky, a drape), not from an empty box.',
  'Material and light continuity across product and world.',
  'World specificity: signifiers that belong to this brand, not a genre.',
  'No visible scaffolding and no generic filler.',
] as const;
