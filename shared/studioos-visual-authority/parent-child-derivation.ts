/**
 * Parent → Child Visual Derivation Protocol (P0.JURNL.PARENT-CHILD.VISUAL-DERIVATION.PROTOCOL1).
 *
 * Child pages, drawers, modals and continuation states are DERIVED from an approved parent authority. They are not
 * standalone screens. This module holds the project-agnostic rules, the selection-sheet sizing system with a sibling
 * check, and a brief builder that writes a child-derivation prompt inside the prompt-forensics budget.
 * First application: JURNL SAFE TO SPEND / CHECK A PURCHASE (projects/jurnl/safe-to-spend-family.ts).
 */
import { GENERATOR_PROMPT_BUDGET } from './prompt-forensics.js';

export const PARENT_CHILD_SPRINT = 'P0.JURNL.PARENT-CHILD.VISUAL-DERIVATION.PROTOCOL1' as const;

/* ─────────────── A. core rule ─────────────── */

export const DERIVATION_CORE_RULE = {
  rule: 'ABSORB THE INFORMATION ARCHITECTURE OF THE CURRENT SCREEN. DO NOT COPY ITS VISUAL TREATMENT. RE-EXPRESS THAT INFORMATION THROUGH THE APPROVED PARENT AUTHORITY.',
  keep: ['product meaning', 'route meaning', 'interaction meaning', 'content hierarchy', 'shell logic where relevant'],
  target: 'Same app family, same world, same DNA, different screen.',
  not: ['the same content pasted into a different pretty mockup', 'the old weak design with small cosmetic improvements'],
} as const;

/* ─────────────── B. authority hierarchy ─────────────── */

export type AuthorityKind = 'APPROVED_PARENT' | 'APPROVED_CHILD_EXPLORATION' | 'CURRENT_SCREEN';
export const AUTHORITY_HIERARCHY: { rank: number; kind: AuthorityKind; governs: 'VISUAL' | 'VISUAL_SUBORDINATE' | 'INFORMATION'; rule: string }[] = [
  { rank: 1, kind: 'APPROVED_PARENT', governs: 'VISUAL', rule: 'Top visual authority for the whole family. Attached to every child generation as the world / brand / type reference.' },
  { rank: 2, kind: 'APPROVED_CHILD_EXPLORATION', governs: 'VISUAL_SUBORDINATE', rule: 'May set direction for one specific child. Never overrides the parent.' },
  { rank: 3, kind: 'CURRENT_SCREEN', governs: 'INFORMATION', rule: 'Defines what content, actions and states must exist. Its layout and styling are not inherited unless the founder says so.' },
];

/* ─────────────── C. what every child inherits ─────────────── */

export const INHERITED_DNA = [
  'the world (environment, era, place)',
  'architectural framing and openness',
  'material language',
  'palette and accent',
  'depth and physical environment',
  'the product feeling (luxury / editorial level)',
  'panel language (fill, edge, translucency)',
  'spacing rhythm',
  'button style family',
  'corner radius family',
  'panel stacking logic',
  'navigation dock language',
  'balance between editorial drama and utility clarity',
] as const;

/** Family constants every project declares (values live in the project file). */
export const FAMILY_CONSTANT_KEYS = ['BRAND', 'TYPOGRAPHY', 'DECORATIVE_LOGO', 'SHELL', 'RATIO'] as const;
export type FamilyConstantKey = (typeof FAMILY_CONSTANT_KEYS)[number];

/* ─────────────── E. derivation method ─────────────── */

export const DERIVATION_METHOD = [
  { step: 1, id: 'IDENTIFY_PARENT_DNA', ask: ['main object metaphor', 'composition strategy', 'material language', 'what makes it special', 'visual grammar'] },
  { step: 2, id: 'IDENTIFY_CHILD_JOB', ask: ['function', 'information it must communicate', 'actions it must support', 'expression: FULL_PAGE · DRAWER · MODAL · CONTINUATION · OVERLAY'] },
  { step: 3, id: 'TRANSLATE_NOT_COPY', ask: ['how this function would exist inside the parent’s world', 'which parent motifs stay literal', 'which become abstracted', 'which become component logic'] },
  { step: 4, id: 'PRESERVE_FAMILY_RECOGNITION', ask: ['is it recognisably the same family before any text is read?'] },
] as const;

/* ─────────────── F. content absorption ─────────────── */

export const CONTENT_ABSORPTION_RULE = {
  trigger: 'The founder supplies a current design and says “absorb its info & derive its visual language from the mobile authority”.',
  must: ['read the content structure', 'list every panel, section, action and state', 'keep that meaning', 'rebuild the screen from the approved authority'],
  must_not: ['repaint the old screen', 'flatten the parent into generic cards', 'copy a weak hierarchy 1:1 when the parent suggests a stronger one'],
} as const;

/* ─────────────── G–I. family levels, siblings, continuation ─────────────── */

export const FAMILY_LEVELS = [
  { level: 'PARENT', rule: 'The approved root authority screen.' },
  { level: 'DIRECT_DESCENDANT', rule: 'Launched from the parent. Closest tie to the parent: same world, panel and type system at full strength.' },
  { level: 'SECONDARY_DESCENDANT', rule: 'Launched from a child (drawers, continuations). May simplify, never leaves the family.' },
] as const;
export type FamilyLevel = (typeof FAMILY_LEVELS)[number]['level'];

export type Expression = 'FULL_PAGE' | 'DRAWER' | 'MODAL' | 'CONTINUATION' | 'OVERLAY';

export const EXPRESSION_PAIR_RULE = {
  when: 'A child is asked for as both a full page and a drawer.',
  drawer: 'A compact extension of the system.',
  full_page: 'A fuller, more complete expression of the same concept.',
  rule: 'Siblings: not replicas, not unrelated.',
} as const;

export const CONTINUATION_RULE = [
  'Keep the shell and the composition system fixed across continuation screens.',
  'Split overflow into continuation screens with BACK / NEXT.',
  'Continuation controls are integrated, never floating.',
  'A lone BACK or NEXT takes its own single-control position without drift.',
  'Do not overload the first screen with panels.',
] as const;

/* ─────────────── J. selection-sheet sizing system ─────────────── */

/**
 * Every selection sheet (SELECT A CATEGORY, PAY WITH / SELECT AN ACCOUNT, …) declares this system. Sizes are fractions
 * of the sheet's inner width so two sheets can be compared on any screen or image scale.
 */
export type SelectionSheetSystem = {
  sheet: string;
  header: { title: string; subtext: string; align: 'CENTER' | 'START'; close: boolean; drag_handle: boolean };
  grid: { columns: number; rows_visible: number; overflow: 'SCROLL' | 'CONTINUATION' | 'NONE' };
  tile: { width: number; aspect: number; radius: number; crop: string };
  gap: { column: number; row: number };
  label: { cap_height: number; tracking_em: number; position: 'BELOW_TILE' | 'ON_TILE'; case: 'UPPERCASE' };
  padding: { side: number; top: number; bottom: number };
};

export const SELECTION_SHEET_REQUIRED = ['header (title + subtext)', 'close affordance', 'drag handle when the sheet drags', 'tile size', 'tile aspect and crop logic', 'corner radius', 'column and row gaps', 'row density (columns × visible rows)', 'label size and tracking', 'sheet padding'] as const;

export const SIBLING_SHEET_RULE = 'Two selection sheets in the same parent flow share one sizing system unless the founder asks otherwise. Only the content differs.' as const;

/** Tolerances for “same apparent size” between sibling sheets (relative difference). */
export const SIBLING_TOLERANCE = { tile_width: 0.06, tile_aspect: 0.06, radius: 0.25, gap: 0.15, label_cap_height: 0.1, tracking_em: 0.25, padding: 0.15 } as const;

export type SiblingCheck = { verdict: 'MATCHED' | 'DRIFT'; drift: string[] };

/** Compares a sheet against its approved sibling. Header structure and grid must match exactly; sizes within tolerance. */
export function checkSiblingSheets(approved: SelectionSheetSystem, candidate: SelectionSheetSystem): SiblingCheck {
  const drift: string[] = [];
  const rel = (a: number, b: number) => (a === 0 && b === 0 ? 0 : Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b)));
  const near = (name: string, a: number, b: number, tol: number) => { if (rel(a, b) > tol) drift.push(`${name}: ${b} vs approved ${a} (> ${Math.round(tol * 100)} %)`); };
  for (const k of ['align', 'close', 'drag_handle'] as const) if (approved.header[k] !== candidate.header[k]) drift.push(`header.${k}: ${String(candidate.header[k])} vs approved ${String(approved.header[k])}`);
  if (approved.grid.columns !== candidate.grid.columns) drift.push(`grid.columns: ${candidate.grid.columns} vs approved ${approved.grid.columns}`);
  if (approved.label.position !== candidate.label.position) drift.push(`label.position: ${candidate.label.position} vs approved ${approved.label.position}`);
  if (candidate.label.case !== 'UPPERCASE') drift.push('label.case must be UPPERCASE');
  near('tile.width', approved.tile.width, candidate.tile.width, SIBLING_TOLERANCE.tile_width);
  near('tile.aspect', approved.tile.aspect, candidate.tile.aspect, SIBLING_TOLERANCE.tile_aspect);
  near('tile.radius', approved.tile.radius, candidate.tile.radius, SIBLING_TOLERANCE.radius);
  near('gap.column', approved.gap.column, candidate.gap.column, SIBLING_TOLERANCE.gap);
  near('gap.row', approved.gap.row, candidate.gap.row, SIBLING_TOLERANCE.gap);
  near('label.cap_height', approved.label.cap_height, candidate.label.cap_height, SIBLING_TOLERANCE.label_cap_height);
  near('label.tracking_em', approved.label.tracking_em, candidate.label.tracking_em, SIBLING_TOLERANCE.tracking_em);
  near('padding.side', approved.padding.side, candidate.padding.side, SIBLING_TOLERANCE.padding);
  return { verdict: drift.length ? 'DRIFT' : 'MATCHED', drift };
}

/* ─────────────── quality check ─────────────── */

export const DERIVATION_QUALITY_CHECK = [
  'Does it clearly belong to the parent family before any text is read?',
  'Does it keep the parent’s world, materials, palette and panel language?',
  'Is the information architecture of the current screen complete?',
  'Is the typography uppercase only, with the family’s display / support contrast?',
  'Is the decorative logo rule respected where a logo appears?',
  'Is the shell kept (dock, world behind UI) with no device chrome or phone UX?',
  'Is the ratio the family’s ratio, with no bands, letterbox or careless crop?',
  'For a sibling sheet: does checkSiblingSheets return MATCHED?',
  'Did it avoid generic app drift and redesign drift?',
] as const;

/* ─────────────── brief builder (the prompting half of the protocol) ─────────────── */

export type ReferenceInput = { file: string; kind: AuthorityKind | 'APPROVED_SIBLING'; role: string };
export type ChildDerivationSpec = {
  family: string;
  child: string;
  level: FamilyLevel;
  expression: Expression;
  job: string;
  references: ReferenceInput[];
  parent_dna: string[];
  structure: string[];
  exact_strings: string[];
  content: { label: string; imagery: string }[];
  sizing_rule?: string;
  negatives: string[];
};

export type ChildDerivationBrief = { text: string; words: number; within_budget: boolean; negatives: number; exact_strings: number; exact_strings_over_budget: boolean; correction_needed_for: string[] };

/**
 * Writes the model-facing brief: references and their roles first, then the parent DNA, the child's job and structure,
 * content, exact strings and the critical negatives. Stays inside GENERATOR_PROMPT_BUDGET for words and negatives; exact
 * strings over the budget are returned so they are checked (and corrected if needed) after generation.
 */
export function buildChildDerivationBrief(spec: ChildDerivationSpec): ChildDerivationBrief {
  const refs = spec.references.map((r, i) => `IMAGE ${i + 1} (${r.file}): ${r.kind.replace(/_/g, ' ')} — ${r.role}.`);
  const lines = [
    ...refs,
    `Create the ${spec.child} ${spec.expression.toLowerCase().replace('_', ' ')} for ${spec.family}, derived from IMAGE 1. ${spec.job}`,
    `Keep from the parent: ${spec.parent_dna.join('; ')}.`,
    `Structure: ${spec.structure.join('; ')}.`,
    spec.sizing_rule ? `Sizing: ${spec.sizing_rule}` : '',
    `Pictures: ${spec.content.map((c) => `${c.label}: ${c.imagery}`).join('; ')}.`,
    `Text, uppercase, spelled exactly: ${spec.exact_strings.map((s) => `“${s}”`).join(', ')}.`,
    `Do not: ${spec.negatives.slice(0, GENERATOR_PROMPT_BUDGET.max_negatives).join('; ')}.`,
  ].filter(Boolean);
  const text = lines.join('\n');
  const words = text.split(/\s+/).filter(Boolean).length;
  const over = spec.exact_strings.length > GENERATOR_PROMPT_BUDGET.max_exact_strings_rendered_by_generator;
  return {
    text,
    words,
    within_budget: words <= GENERATOR_PROMPT_BUDGET.max_words,
    negatives: Math.min(spec.negatives.length, GENERATOR_PROMPT_BUDGET.max_negatives),
    exact_strings: spec.exact_strings.length,
    exact_strings_over_budget: over,
    correction_needed_for: over ? spec.exact_strings.slice(GENERATOR_PROMPT_BUDGET.max_exact_strings_rendered_by_generator) : [],
  };
}
