/**
 * P0.5C.7 — Notebook carousel prompt compiler sections.
 */

import type { NDXPageObjectContract } from './ndxPageObjectContract.js';
import type { NDXConstructionHistory } from './ndxConstructionHistory.js';
import type { CarouselSequencePageRole } from './ndxPageObjectContract.js';
import { NDX_NOTEBOOK_CAROUSEL_AUTHORITY_CHAIN } from './notebookCarouselGrammarP05C7.js';
import { NEGATIVE_NOTEBOOK_TEMPLATE_CONSTRAINTS } from './constants.js';

export function buildPhysicalPageObjectSection(pageObject: NDXPageObjectContract): string {
  return [
    `PHYSICAL PAGE OBJECT`,
    `THE PAGE IS A PHYSICAL OBJECT FIRST. THE GRAPHIC IS THE RESULT OF ITS CONSTRUCTION.`,
    `NDX CAROUSELS MUST LOOK LIKE THEY EXIST INSIDE THE BOOK — NOT LIKE TEMPLATES WITH HANDWRITTEN MARKS ADDED AFTERWARD.`,
    `PAGE MATERIAL: ${pageObject.pageMaterial.replace(/_/g, ' ')} — age: ${pageObject.pageAge}`,
    `EDGE BEHAVIOR: ${pageObject.edgeBehavior.replace(/_/g, ' ')} — tear: ${pageObject.tearBehavior.replace(/_/g, ' ')} — fold: ${pageObject.foldBehavior.replace(/_/g, ' ')}`,
    `BINDING / EDGE: ${pageObject.bindingEvidence.replace(/_/g, ' ')} — punched holes: ${pageObject.punchedHoleBehavior.replace(/_/g, ' ')}`,
    `LAYER DEPTH: ${pageObject.layerDepth} layers — attachment: ${pageObject.attachmentMethod.replace(/_/g, ' ')}`,
    `PHYSICAL LINEAGE SIGNALS (REQUIRED): ${pageObject.physicalLineageSignals.map((s) => s.replace(/_/g, ' ')).join(', ')}`,
    `SURFACE MARKS: ${pageObject.surfaceMarks.join(', ') || 'handled wear, subtle crease'}`,
  ].join('\n');
}

export function buildPageMaterialSection(pageObject: NDXPageObjectContract): string {
  return [
    `PAGE MATERIAL`,
    `Material: ${pageObject.pageMaterial.replace(/_/g, ' ')} — not generic beige template.`,
    `Do not force every slide to identical cream lined paper. The Book must feel expansive.`,
    `Approved materials: cream notebook paper, off-white copier, graph paper, lined paper, black paper, receipt stock, newsprint, index cards, photocopy sheets, scanned forms, kraft inserts, aged paper, matte photo paper.`,
  ].join('\n');
}

export function buildBindingEdgeSection(pageObject: NDXPageObjectContract): string {
  return [
    `BINDING / EDGE`,
    `Binding evidence: ${pageObject.bindingEvidence.replace(/_/g, ' ')}`,
    `Edge: ${pageObject.edgeBehavior.replace(/_/g, ' ')} — tear: ${pageObject.tearBehavior.replace(/_/g, ' ')}`,
    `Vary across sequence: left punched edge, right torn edge, spiral edge, notebook gutter, stacked insert, black page, photo page.`,
    `Sequence must still feel like one Book — cohesive ≠ identical.`,
  ].join('\n');
}

export function buildConstructionHistorySection(history: NDXConstructionHistory): string {
  return [
    `CONSTRUCTION HISTORY`,
    `HOW NDX MADE THIS PAGE: ${history.narrative}`,
    `ORIGIN ACTION: ${history.originAction.replace(/_/g, ' ')}`,
    `MODIFICATIONS: ${history.modificationActions.map((a) => a.replace(/_/g, ' ')).join(' → ')}`,
    `SURVIVING EVIDENCE: ${history.survivingEvidence.join('; ')}`,
    `THE PAGE MUST VISUALLY PRESERVE EVIDENCE OF ASSEMBLY — torn, taped, written, circled, crossed-out, folded, stacked, clipped, highlighted, inserted.`,
    `Examples: tore page from notebook; taped article clipping; added photo later; circled claim; wrote margin note; crossed out prior thought; stapled receipt; added index tab; folded corner; highlighted phrase; layered correction over earlier copy.`,
  ].join('\n');
}

export function buildPhotoIntegrationSection(pageObject: NDXPageObjectContract): string {
  return [
    `PHOTO INTEGRATION`,
    `MODE: ${pageObject.photoIntegrationMode.replace(/_/g, ' ')}`,
    `Photography must be integrated INTO the physical page — not pasted into a generic layout.`,
    `Allowed: torn photo, taped photo, full bleed on page, polaroid insert, newspaper clip, contact sheet, partial overlap, photo beneath torn layer, photo with handwritten border, photo cropped by page edge.`,
    `Avoid: clean centered image box, rounded digital card, generic poster photo block, perfect equal margins.`,
    `Image should support the thought — cultural photography, observational lifestyle, archival imagery, editorial portraiture, evidence imagery, objects with meaning.`,
    `Avoid: generic stock, visual filler, AI glamour portrait as decoration, photography unrelated to thesis.`,
  ].join('\n');
}

export function buildUppercaseAuthorshipSection(): string {
  return [
    `UPPERCASE AUTHORSHIP`,
    `NDX_AUTHORED_TEXT = UPPERCASE`,
    `Applies to: headlines, subheads, body copy, margin notes, captions, annotations, labels, questions, character beats, handwritten notes, page titles.`,
    `Exception — AUTHENTIC_SOURCE_TEXT may preserve source casing: article clippings, screenshots, text messages, receipts, quoted posts, publication mastheads.`,
    `Do NOT automatically uppercase source material.`,
    `FAIL_NDX_AUTHORSHIP_CASE if NDX-authored text contains unintended lowercase.`,
  ].join('\n');
}

export function buildTypographyBehaviorSection(): string {
  return [
    `TYPOGRAPHY`,
    `Do NOT create one universal font treatment. NDX authored type may use: condensed display, typewriter/mono, handwritten uppercase, serif editorial, stamp/label, annotation marks.`,
    `All NDX-authored copy remains UPPERCASE regardless of typeface.`,
    `Variation must feel like page-making, not style roulette.`,
  ].join('\n');
}

export function buildHandMarksSection(): string {
  return [
    `HAND MARKS`,
    `Handwritten marks should be imperfect: uneven pressure, natural line wobble, off-center circles, partial highlights, cross-outs, arrows, underlines, margin notes, quick symbols.`,
    `Avoid: perfect vector handwriting, symmetrical scribbles, AI-generated decorative handwriting with no meaning.`,
    `DECORATIVE HANDWRITING WITHOUT FUNCTION IS PROHIBITED — every mark answers WHY NDX DID THIS.`,
  ].join('\n');
}

export function buildLimeInterruptionSection(): string {
  return [
    `LIME INTERRUPTION`,
    `LIME REQUIRED SOMEWHERE — LIME PROMINENCE PROHIBITED`,
    `Lime functions as: highlighter, underline, circle, small tape, sticky note, pen, page tab, annotation, tiny object, selection mark.`,
    `Do NOT use lime as: full-page background, dominant text color, large color block, default border system.`,
  ].join('\n');
}

export function buildEvidenceSection(pageObject: NDXPageObjectContract): string {
  return [
    `EVIDENCE`,
    `Evidence integration mode: ${pageObject.evidenceIntegrationMode.replace(/_/g, ' ')}`,
    `Evidence SUPPORTS the thesis — placed where NDX would actually attach it: taped clipping, stapled receipt, margin note, folded insert, highlighted source.`,
    `Do NOT reserve clean rectangular evidence panels.`,
  ].join('\n');
}

export function buildNegativeTemplateConstraintsSection(): string {
  return [
    `NEGATIVE TEMPLATE CONSTRAINTS`,
    ...NEGATIVE_NOTEBOOK_TEMPLATE_CONSTRAINTS.map((c) => `NO ${c.replace(/_/g, ' ')}`),
  ].join('\n');
}

export function buildSequenceRoleSection(role: CarouselSequencePageRole): string {
  return [
    `SEQUENCE PAGE ROLE`,
    `This slide role: ${role.replace(/_/g, ' ')}`,
    `Do NOT generate 9–12 versions of the same composition. Each slide composed around its specific thought.`,
    `Banned across sequence: SAME_HEADER_ZONE, SAME_IMAGE_ZONE, SAME_BODY_ZONE, SAME_FOOTER_ZONE.`,
  ].join('\n');
}

export function buildVisualAuthorityChainSection(): string {
  return [
    `VISUAL AUTHORITY CHAIN (P0.5C.7)`,
    NDX_NOTEBOOK_CAROUSEL_AUTHORITY_CHAIN.join(' → '),
    `DO NOT REVERT TO: BACKGROUND → TEXT → PHOTO → ANNOTATION`,
  ].join('\n');
}

export function buildNotebookCarouselPromptSections(params: {
  pageObject: NDXPageObjectContract;
  constructionHistory: NDXConstructionHistory;
  sequenceRole: CarouselSequencePageRole;
}): string[] {
  return [
    buildVisualAuthorityChainSection(),
    buildPhysicalPageObjectSection(params.pageObject),
    buildPageMaterialSection(params.pageObject),
    buildBindingEdgeSection(params.pageObject),
    buildConstructionHistorySection(params.constructionHistory),
    buildPhotoIntegrationSection(params.pageObject),
    buildTypographyBehaviorSection(),
    buildUppercaseAuthorshipSection(),
    buildHandMarksSection(),
    buildLimeInterruptionSection(),
    buildEvidenceSection(params.pageObject),
    buildSequenceRoleSection(params.sequenceRole),
    buildNegativeTemplateConstraintsSection(),
  ];
}
