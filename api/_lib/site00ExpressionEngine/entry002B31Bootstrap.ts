/**
 * Sprint B3.1 — downstream unlock + bootstrap orchestrator.
 */

import type {
  DownstreamProductionState,
  Entry002B31BootstrapResult,
} from '../../../shared/site00-expression-engine/chapterCoverGrammarTypes.js';
import { seedChapter01Canon } from './chapterStore.js';
import { applyFounderNotForMeOnB3Anchor } from './entry002B3FounderOverride.js';
import { registerEntry002FounderCoverAuthority } from './entry002CoverAuthority.js';
import { buildEntry002CreativeRevisionLearning } from './entry002CreativeRevisionLearning.js';
import {
  buildChapter01CoverPresentationGrammar,
  getChapter01EntryCoverSpecs,
} from './chapterCoverPresentationGrammar.js';
import { runChapterCoverCohesionQA } from './chapterCoverCohesionQA.js';
import { recordFounderJudgment, saveEntry } from './entryStore.js';
import { compileEntry002LockedEntry } from './entry002Blueprint.js';

export function downstreamProductionUnlocked(): Record<string, DownstreamProductionState> {
  return {
    REEL: 'UNLOCKED_PENDING_PRODUCTION',
    CAROUSEL: 'UNLOCKED_PENDING_PRODUCTION',
    STORY: 'UNLOCKED_PENDING_PRODUCTION',
    CTA_STORY: 'UNLOCKED_PENDING_PRODUCTION',
    HIGHLIGHT: 'UNLOCKED_PENDING_PRODUCTION',
    TIKTOK: 'UNLOCKED_PENDING_PRODUCTION',
    X: 'UNLOCKED_PENDING_PRODUCTION',
  };
}

export async function bootstrapB31FounderCreativeOverride(): Promise<Entry002B31BootstrapResult> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';

  seedChapter01Canon();

  const baseEntry = compileEntry002LockedEntry();
  const { entry: entryWithB3Judgment, preserved, receipt, creativeAssetRecord } =
    applyFounderNotForMeOnB3Anchor({ entry: baseEntry });

  const founderAuthority = registerEntry002FounderCoverAuthority();
  const coverGrammar = buildChapter01CoverPresentationGrammar();
  const entryCovers = getChapter01EntryCoverSpecs();
  const creativeLearning = buildEntry002CreativeRevisionLearning();
  const coverCohesionQA = runChapterCoverCohesionQA({ covers: entryCovers });
  const downstreamUnlocked = downstreamProductionUnlocked();

  const withAuthority = recordFounderJudgment({
    entry: entryWithB3Judgment,
    scope: 'FORMAT',
    scopeId: 'COVER',
    action: 'LOVE_IT',
  });

  saveEntry({
    ...withAuthority,
    metadata: {
      ...(withAuthority.metadata as Record<string, unknown>),
      sprint: 'B3.1_FOUNDER_CREATIVE_OVERRIDE',
      b3PreservedAnchor: preserved,
      b3CreativeAssetRecord: creativeAssetRecord,
      b3GenerationReceipt: receipt,
      founderCoverAuthority: founderAuthority,
      coverPresentationGrammar: coverGrammar,
      creativeRevisionLearning: creativeLearning,
      downstreamUnlocked,
      creativeAnchorStatus: 'CREATIVE_ANCHOR_APPROVED',
      assetsGeneratedThisSprint: 0,
    } as never,
  });

  return {
    sprint: 'B3.1_FOUNDER_CREATIVE_OVERRIDE',
    b3PreservedAnchor: preserved,
    founderAuthority,
    coverGrammar,
    entryCovers,
    creativeLearning,
    coverCohesionQA,
    downstreamUnlocked,
    assetsGeneratedThisSprint: 0,
  };
}

export { bootstrapB31FounderCreativeOverride as bootstrapB31 };
