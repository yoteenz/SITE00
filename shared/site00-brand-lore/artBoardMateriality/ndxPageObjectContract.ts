/**
 * P0.5C.7 — NDXPageObjectContract
 * Every carousel slide resolves as a physical page object inside The Book.
 */

import type { ArtBoardRetainedFirstSlideContract } from './types.js';
import type { BaseSurfaceClass, PageEdgeBehavior, TornEdgeBehavior } from './types.js';
import { PHYSICAL_PAGE_LINEAGE_SIGNALS, type PhysicalPageLineageSignal } from './constants.js';

export type PageMaterial = BaseSurfaceClass | string;
export type PageAge = 'FRESH' | 'HANDLED' | 'AGED' | 'ARCHIVAL' | 'SCANNED' | 'COPIED';
export type BindingEvidence = 'NONE' | 'SPIRAL' | 'PUNCHED_HOLES' | 'STAPLED' | 'GLUED' | 'BOUND_GUTTER' | 'CLIP';
export type PunchedHoleBehavior = 'NONE' | 'LEFT_MARGIN' | 'TOP_EDGE' | 'DOUBLE_PUNCH' | 'PARTIAL_PUNCH';
export type FoldBehavior = 'NONE' | 'CORNER_FOLD' | 'HORIZONTAL_CREASE' | 'VERTICAL_CREASE' | 'DOG_EAR';
export type AttachmentMethod = 'INTEGRATED_PRINT' | 'TAPE' | 'PAPER_CLIP' | 'STAPLE' | 'GLUE' | 'FOLD_POCKET' | 'LAYERED';
export type PhotoIntegrationMode =
  | 'TORN_PHOTO'
  | 'TAPED_PHOTO'
  | 'FULL_BLEED_ON_PAGE'
  | 'POLAROID_STYLE_INSERT'
  | 'NEWSPAPER_CLIP'
  | 'CONTACT_SHEET'
  | 'PARTIAL_OVERLAP'
  | 'PHOTO_BENEATH_TORN_LAYER'
  | 'PHOTO_WITH_HANDWRITTEN_BORDER'
  | 'PHOTO_CROPPED_BY_PAGE_EDGE'
  | 'NONE';
export type EvidenceIntegrationMode =
  | 'TAPED_CLIPPING'
  | 'STAPLED_RECEIPT'
  | 'SCREENSHOT_PRINT'
  | 'MARGIN_ATTACHMENT'
  | 'FOLDED_INSERT'
  | 'HIGHLIGHTED_SOURCE'
  | 'CIRCLED_EVIDENCE'
  | 'STACKED_INSERT'
  | 'NONE';
export type HandMarkMode = 'MINIMAL' | 'ANNOTATED' | 'CORRECTED' | 'CIRCLED' | 'CROSSED_OUT' | 'HIGHLIGHTED' | 'MARGIN_NOTES';
export type LimeMode = 'HIGHLIGHTER' | 'UNDERLINE' | 'CIRCLE' | 'TAPE' | 'STICKY_NOTE' | 'PEN' | 'PAGE_TAB' | 'SELECTION_MARK';

export type NDXPageObjectContract = {
  pageMaterial: PageMaterial;
  pageAge: PageAge;
  edgeBehavior: PageEdgeBehavior;
  bindingEvidence: BindingEvidence;
  punchedHoleBehavior: PunchedHoleBehavior;
  tearBehavior: TornEdgeBehavior;
  foldBehavior: FoldBehavior;
  surfaceMarks: string[];
  layerDepth: number;
  attachmentMethod: AttachmentMethod;
  constructionHistory: string[];
  photoIntegrationMode: PhotoIntegrationMode;
  evidenceIntegrationMode: EvidenceIntegrationMode;
  handMarkMode: HandMarkMode;
  limeMode: LimeMode;
  /** At least one required physical-page lineage signal per slide. */
  physicalLineageSignals: PhysicalPageLineageSignal[];
};

const TOPIC_LINEAGE: Record<number, PhysicalPageLineageSignal[]> = {
  1: ['RECEIPT_ATTACHMENT', 'STACKED_PAPER', 'STAPLED_INSERT'],
  2: ['GRAPH_PAPER', 'NOTEBOOK_MARGIN', 'CREASED_NOTE'],
  3: ['RIPPED_INSERT', 'FOLDED_CORNER', 'COFFEE_RING'],
  4: ['TORN_SPIRAL_EDGE', 'VISIBLE_SPIRAL_BINDING', 'ROUGH_DECKLE_EDGE'],
  5: ['LINED_PAPER', 'NOTEBOOK_MARGIN', 'PUNCHED_HOLES'],
  6: ['RECEIPT_ATTACHMENT', 'STAPLED_INSERT', 'TAPED_PHOTO'],
  7: ['INDEX_CARD', 'PAPER_CLIP', 'STACKED_PAPER'],
  8: ['SCANNED_PAGE', 'TAPED_PHOTO', 'RIPPED_INSERT'],
  9: ['PUNCHED_HOLES', 'STACKED_PAPER', 'SCANNED_PAGE'],
};

const TOPIC_PHOTO_MODES: Record<number, PhotoIntegrationMode> = {
  1: 'PARTIAL_OVERLAP',
  2: 'NONE',
  3: 'PHOTO_BENEATH_TORN_LAYER',
  4: 'TORN_PHOTO',
  5: 'FULL_BLEED_ON_PAGE',
  6: 'TAPED_PHOTO',
  7: 'POLAROID_STYLE_INSERT',
  8: 'PHOTO_CROPPED_BY_PAGE_EDGE',
  9: 'CONTACT_SHEET',
};

const TOPIC_PAGE_ROLES = [
  'HOOK_PAGE',
  'THESIS_PAGE',
  'EVIDENCE_PAGE',
  'CONTRADICTION_PAGE',
  'PHOTO_PAGE',
  'MARGIN_NOTE_PAGE',
  'RECEIPT_PAGE',
  'LIST_PAGE',
  'CORRECTION_PAGE',
  'PAUSE_PAGE',
  'CALLBACK_PAGE',
  'CLOSING_PAGE',
] as const;

export type CarouselSequencePageRole = (typeof TOPIC_PAGE_ROLES)[number];

export function resolveCarouselSequencePageRole(topicIndex: number): CarouselSequencePageRole {
  const roles: CarouselSequencePageRole[] = [
    'HOOK_PAGE',
    'THESIS_PAGE',
    'EVIDENCE_PAGE',
    'CONTRADICTION_PAGE',
    'PHOTO_PAGE',
    'MARGIN_NOTE_PAGE',
    'RECEIPT_PAGE',
    'LIST_PAGE',
    'CLOSING_PAGE',
  ];
  return roles[(topicIndex - 1) % roles.length] ?? 'THESIS_PAGE';
}

export function resolveNDXPageObjectContract(
  contract: ArtBoardRetainedFirstSlideContract,
  topicIndex: number,
): NDXPageObjectContract {
  const ab = contract.artBoardDirection;
  const ms = ab.materialitySystem;
  const lineage = TOPIC_LINEAGE[topicIndex] ?? ['NOTEBOOK_MARGIN', 'LINED_PAPER'];

  const bindingEvidence: BindingEvidence =
    ms.baseSurface === 'BOUND_NOTEBOOK' || ab.pageConstructionMode === 'OPEN_NOTEBOOK'
      ? 'SPIRAL'
      : ab.edgeBehavior === 'BOUND_EDGE'
        ? 'BOUND_GUTTER'
        : ab.attachmentLogic.some((a) => a.mechanism === 'STAPLE')
          ? 'STAPLED'
          : ab.attachmentLogic.some((a) => a.mechanism === 'PAPER_CLIP')
            ? 'CLIP'
            : 'PUNCHED_HOLES';

  const punchedHoleBehavior: PunchedHoleBehavior =
    bindingEvidence === 'PUNCHED_HOLES' ? 'LEFT_MARGIN' : bindingEvidence === 'SPIRAL' ? 'NONE' : 'NONE';

  const foldBehavior: FoldBehavior =
    ab.edgeBehavior === 'FOLDED' ? 'CORNER_FOLD' : ab.constructionHistory.ndxAdded.some((a) => a.includes('fold')) ? 'DOG_EAR' : 'NONE';

  const attachmentMethod: AttachmentMethod = ab.attachmentLogic[0]?.mechanism === 'TAPE'
    ? 'TAPE'
    : ab.attachmentLogic[0]?.mechanism === 'PAPER_CLIP'
      ? 'PAPER_CLIP'
      : ab.attachmentLogic[0]?.mechanism === 'STAPLE'
        ? 'STAPLE'
        : 'INTEGRATED_PRINT';

  const pageAge: PageAge =
    ab.materialitySystem.printingBehavior === 'SCANNED'
      ? 'SCANNED'
      : ab.materialitySystem.printingBehavior === 'PHOTOCOPIED'
        ? 'COPIED'
        : ab.edgeBehavior === 'WORN'
          ? 'ARCHIVAL'
          : 'HANDLED';

  const handMarkMode: HandMarkMode = contract.humanMadeEvaluation?.markSystem?.marks.length
    ? contract.humanMadeEvaluation.markSystem.marks.some((m) => m.markClass === 'CORRECTION_MARK')
      ? 'CROSSED_OUT'
      : contract.humanMadeEvaluation.markSystem.marks.some((m) => m.markClass === 'CIRCLE')
        ? 'CIRCLED'
        : 'ANNOTATED'
    : 'MINIMAL';

  const limeMode: LimeMode = contract.limeFunction?.includes('highlight')
    ? 'HIGHLIGHTER'
    : contract.limeFunction?.includes('underline')
      ? 'UNDERLINE'
      : 'CIRCLE';

  const evidenceIntegrationMode: EvidenceIntegrationMode =
    ms.baseSurface === 'THERMAL_RECEIPT'
      ? 'STAPLED_RECEIPT'
      : ab.evidenceSurfaceInteraction.some((e) => e.includes('tape'))
        ? 'TAPED_CLIPPING'
        : ab.evidenceSurfaceInteraction.some((e) => e.includes('screenshot'))
          ? 'SCREENSHOT_PRINT'
          : ab.evidenceSurfaceInteraction.length
            ? 'MARGIN_ATTACHMENT'
            : 'NONE';

  return {
    pageMaterial: ms.baseSurface,
    pageAge,
    edgeBehavior: ab.edgeBehavior,
    bindingEvidence,
    punchedHoleBehavior,
    tearBehavior: ms.tearBehavior,
    foldBehavior,
    surfaceMarks: ab.constructionHistory.ndxAdded.slice(0, 4),
    layerDepth: ab.canvasObject.layerCount,
    attachmentMethod,
    constructionHistory: [
      ab.constructionHistory.firstPresent,
      ...ab.constructionHistory.ndxAdded,
    ].filter(Boolean),
    photoIntegrationMode: TOPIC_PHOTO_MODES[topicIndex] ?? 'PARTIAL_OVERLAP',
    evidenceIntegrationMode,
    handMarkMode,
    limeMode,
    physicalLineageSignals: lineage.filter((s) => PHYSICAL_PAGE_LINEAGE_SIGNALS.includes(s)),
  };
}

export function pageObjectHasPhysicalLineage(pageObject: NDXPageObjectContract): boolean {
  return pageObject.physicalLineageSignals.length >= 1;
}

export function pageObjectContractImplemented(): true {
  return true;
}
