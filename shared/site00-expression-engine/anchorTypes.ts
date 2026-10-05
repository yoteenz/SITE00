/**
 * Expression Engine — creative anchor production types (Sprint B3).
 */

import type { CreativeAssetRecord } from '../site00-brand-lore/creativeLineage/types.js';
import type { GenerationReceipt } from './types.js';
import type { ChapterGrammarValidationResult, ChapterRepetitionQAResult } from './chapterGrammarTypes.js';
import type { FormatNativeQAResult } from './types.js';

export type Entry002AnchorRouteId = 'ROUTE_A_TIMELINE_CLIP' | 'ROUTE_B_FITTING_ROOM_EDIT' | 'ROUTE_C_PHONE_EXTRACTION';

export type Entry002AnchorCompositionRoute = {
  routeId: Entry002AnchorRouteId;
  title: string;
  focalMechanism: string;
  cameraMechanism: string;
  fashionEvidence: string[];
  phoneBehavior: string;
  editSuiteBehavior: string;
  artifactBehavior: string;
  visibleCopy: string[];
  marginalInterjection: string;
  selectionScore: number;
  selected: boolean;
};

export type Entry002AnchorQACheck = {
  check: string;
  passed: boolean;
  detail?: string;
};

export type Entry002AnchorQAResult = {
  passed: boolean;
  checks: Entry002AnchorQACheck[];
  blockers: string[];
};

export type Entry002PreAnchorQAResult = {
  passed: boolean;
  formatNativeQA: FormatNativeQAResult;
  chapterGrammarValidation: ChapterGrammarValidationResult;
  chapterRepetitionQA: ChapterRepetitionQAResult;
  conceptCollapsePassed: boolean;
  entry001DifferentiationPassed: boolean;
};

export type Entry002AnchorProductionResult = {
  sprint: 'B3_CREATIVE_ANCHOR';
  entryId: 'entry-002';
  taskId: 't2-anchor-cover';
  format: 'COVER';
  selectedRoute: Entry002AnchorCompositionRoute;
  compositionRoutes: Entry002AnchorCompositionRoute[];
  preAnchorQA: Entry002PreAnchorQAResult;
  anchorQA: Entry002AnchorQAResult;
  assetId: string;
  previewUrl: string;
  storagePath: string;
  generationReceipt: GenerationReceipt;
  creativeAssetRecord: CreativeAssetRecord;
  provider: string;
  model: string;
  promptLineage: string[];
  referenceLineage: string[];
  canonState: 'NON_CANON';
  founderJudgment: 'UNREVIEWED';
  productionDispatch: 'BLOCKED_PENDING_ANCHOR_APPROVAL';
  downstreamBlocked: Record<string, 'BLOCKED_PENDING_ANCHOR_APPROVAL'>;
  generatedAt: string;
};
