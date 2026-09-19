import { describe, it, expect, beforeEach } from 'vitest';
import {
  bootstrapB3CreativeAnchor,
  bootstrapB31,
} from '../api/_lib/site00ExpressionEngine/expressionEngineService.js';
import {
  B3_GENERATED_ANCHOR_ASSET_ID,
  applyFounderNotForMeOnB3Anchor,
  preserveB3GeneratedAnchor,
} from '../api/_lib/site00ExpressionEngine/entry002B3FounderOverride.js';
import {
  buildEntry002FounderCoverAuthority,
  registerEntry002FounderCoverAuthority,
} from '../api/_lib/site00ExpressionEngine/entry002CoverAuthority.js';
import {
  buildChapter01CoverPresentationGrammar,
  buildEntry001CoverPresentationSpec,
  buildEntry002FounderCoverPresentationSpec,
} from '../api/_lib/site00ExpressionEngine/chapterCoverPresentationGrammar.js';
import {
  buildDuplicateArtifactCoverFixture,
  buildDuplicatedAnnotationCoverFixture,
  buildGraphicFlyerCoverFixture,
  runChapterCoverCohesionQA,
  validateCoverAgainstGrammar,
} from '../api/_lib/site00ExpressionEngine/chapterCoverCohesionQA.js';
import { buildEntry002CreativeRevisionLearning } from '../api/_lib/site00ExpressionEngine/entry002CreativeRevisionLearning.js';
import { downstreamProductionUnlocked } from '../api/_lib/site00ExpressionEngine/entry002B31Bootstrap.js';
import {
  getGenerationReceipt,
  listGenerationReceiptsForEntry,
  notForMeCannotBecomeCanon,
  resetLineageStore,
} from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';
import { resetExpressionEntryStore, getEntry } from '../api/_lib/site00ExpressionEngine/entryStore.js';
import { resetExpressionEngineMemoryStore } from '../api/_lib/site00ExpressionEngine/projectScope.js';
import { resetChapterStore } from '../api/_lib/site00ExpressionEngine/chapterStore.js';

process.env.EXPRESSION_ENGINE_MEMORY_STORE = '1';

describe('Expression Engine Sprint B3.1 — Founder Creative Override + Chapter Cover Grammar', () => {
  beforeEach(() => {
    resetExpressionEntryStore();
    resetExpressionEngineMemoryStore();
    resetLineageStore();
    resetChapterStore();
  });

  it('1. B3 generated asset remains NON_CANON', async () => {
    const b31 = await bootstrapB31();
    expect(b31.b3PreservedAnchor.assetId).toBe(B3_GENERATED_ANCHOR_ASSET_ID);
    expect(b31.b3PreservedAnchor.canonState).toBe('NON_CANON');
    expect(b31.b3PreservedAnchor.founderJudgment).toBe('NOT_FOR_ME');
  });

  it('2. founder NOT_FOR_ME preserves lineage', () => {
    const { receipt, creativeAssetRecord, preserved } = preserveB3GeneratedAnchor();
    expect(preserved.lineagePreserved).toBe(true);
    expect(receipt.trackingState).toBe('TRACKED');
    expect(receipt.trackingState).not.toBe('LEGACY_UNTRACKED');
    expect(creativeAssetRecord.assetId).toBe(B3_GENERATED_ANCHOR_ASSET_ID);
    expect(creativeAssetRecord.generationLineage.provider).toBe('fal-flux');
    expect(creativeAssetRecord.generationLineage.model).toBe('fal-ai/flux-pro');

    applyFounderNotForMeOnB3Anchor({});
    const updated = getGenerationReceipt(receipt.receiptId)!;
    expect(updated.judgmentState).toBe('NOT_FOR_ME');
    expect(notForMeCannotBecomeCanon(updated)).toBe(true);
    expect(preserved.doNotPropagate).toBe(true);
  });

  it('3. new Entry 002 cover authority is 9:16', () => {
    const authority = buildEntry002FounderCoverAuthority();
    expect(authority.aspect).toBe('9:16');
    expect(authority.format).toBe('COVER');
    expect(authority.authorityType).toBe('CREATIVE_ANCHOR_AUTHORITY');
  });

  it('4. black field required', () => {
    const spec = buildEntry002FounderCoverPresentationSpec();
    expect(spec.background).toBe('PURE_BLACK');
    const qa = validateCoverAgainstGrammar(spec);
    expect(qa.checks.find((c) => c.check === 'black field required')?.passed).toBe(true);
  });

  it('5. artifact-first required', () => {
    const spec = buildEntry002FounderCoverPresentationSpec();
    expect(spec.heroArtifact.isolated).toBe(true);
    expect(spec.heroArtifact.noEnvironmentVisible).toBe(true);
    const qa = validateCoverAgainstGrammar(spec);
    expect(qa.checks.find((c) => c.check === 'artifact-first — isolated hero on black')?.passed).toBe(true);
  });

  it('6. Entry 001 TV and Entry 002 phone both pass ChapterCoverPresentationGrammar', () => {
    const e1 = buildEntry001CoverPresentationSpec();
    const e2 = buildEntry002FounderCoverPresentationSpec();
    expect(e1.heroArtifact.artifactClass).toBe('VINTAGE_BOX_TELEVISION');
    expect(e2.heroArtifact.artifactClass).toBe('PHONE');

    const qa = runChapterCoverCohesionQA({ covers: [e1, e2] });
    expect(qa.passed).toBe(true);
    expect(qa.blocking).toBe(false);
  });

  it('7. duplicated artifact fails', () => {
    const e1 = buildEntry001CoverPresentationSpec();
    const duplicate = buildDuplicateArtifactCoverFixture();
    const qa = runChapterCoverCohesionQA({ covers: [e1, duplicate] });
    expect(qa.passed).toBe(false);
    expect(qa.blockers.some((b) => b.includes('artifact'))).toBe(true);
  });

  it('8. duplicated annotation pattern can warn/block', () => {
    const e1 = buildEntry001CoverPresentationSpec();
    const duplicated = buildDuplicatedAnnotationCoverFixture();
    const qa = runChapterCoverCohesionQA({ covers: [e1, duplicated] });
    expect(qa.passed).toBe(false);
    expect(
      qa.blockers.some((b) => b.includes('annotation') || b.includes('circle/underline')),
    ).toBe(true);
  });

  it('9. excessive environmental composition fails', () => {
    const flyer = buildGraphicFlyerCoverFixture();
    const qa = validateCoverAgainstGrammar(flyer);
    expect(qa.passed).toBe(false);
    expect(qa.blockers.length).toBeGreaterThan(0);
  });

  it('10. lower entry identity placement is consistent', () => {
    const e2 = buildEntry002FounderCoverPresentationSpec();
    expect(e2.entryLabel).toBe('ENTRY 002');
    expect(e2.entryLabelUnderline).toBe('HAND_DRAWN_LIME');
    expect(e2.subjectLabel).toBe('2016 IG BADDIE FASHION');
    expect(e2.hierarchyOrder[2]).toBe('ENTRY_NUMBER');
    expect(e2.hierarchyOrder[3]).toBe('SUBJECT_LABEL');
  });

  it('11. annotation behavior remains entry-specific', () => {
    const e1 = buildEntry001CoverPresentationSpec();
    const e2 = buildEntry002FounderCoverPresentationSpec();
    expect(e1.annotations[0].type).toBe('CIRCLE_UNDERLINE');
    expect(e2.annotations[0].type).toBe('ASTERISK_UPWARD_ARROW');
    expect(e1.annotations[0].type).not.toBe(e2.annotations[0].type);
  });

  it('12. no NDX logo at Entry 002 bottom', () => {
    const e2 = buildEntry002FounderCoverPresentationSpec();
    expect(e2.bottomLogo).toBe(false);
    const qa = validateCoverAgainstGrammar(e2);
    expect(qa.checks.find((c) => c.check === 'no NDX logo at bottom')?.passed).toBe(true);
  });

  it('13. no downstream generation occurs in B3.1 sprint', async () => {
    const receiptsBefore = listGenerationReceiptsForEntry('entry-002').length;
    const b31 = await bootstrapB31();
    const receiptsAfter = listGenerationReceiptsForEntry('entry-002').length;
    expect(b31.assetsGeneratedThisSprint).toBe(0);
    expect(receiptsAfter).toBe(receiptsBefore + 1);
    expect(receiptsAfter).toBe(1);
    const entry = getEntry('entry-002');
    expect(entry?.generationReceipts.every((r) => r.format === 'COVER')).toBe(true);
    expect(entry?.generationReceipts.length).toBe(1);
  });

  it('bootstrap registers founder authority with LOVE_IT and unlocks downstream', async () => {
    const b31 = await bootstrapB31();
    expect(b31.founderAuthority.founderJudgment).toBe('LOVE_IT');
    expect(b31.founderAuthority.canonState).toBe('CREATIVE_ANCHOR_APPROVED');
    expect(b31.founderAuthority.title).toBe('OH, NOW IT WAS FUN?');
    expect(Object.values(b31.downstreamUnlocked).every((s) => s === 'UNLOCKED_PENDING_PRODUCTION')).toBe(
      true,
    );
  });

  it('chapter cover grammar is Chapter 01 scoped only', () => {
    const grammar = buildChapter01CoverPresentationGrammar();
    expect(grammar.scope).toBe('CHAPTER_01_ONLY');
    expect(grammar.chapterTitle).toBe('WHICH ONE IS IT?');
    expect(grammar.status).toBe('LOCKED');
  });

  it('creative revision learning captures B3 vs founder difference', () => {
    const learning = buildEntry002CreativeRevisionLearning();
    expect(learning.scope).toBe('CHAPTER_01_ONLY');
    expect(learning.failureTypes).toContain('ARTIFACT_HIERARCHY');
    expect(learning.lesson).toContain('PRESENTATION GRAMMAR');
    expect(learning.supersededAssetId).toBe(B3_GENERATED_ANCHOR_ASSET_ID);
  });

  it('B3 sprint asset generation still works independently', async () => {
    const { anchor } = await bootstrapB3CreativeAnchor({ dispatchFal: false });
    expect(anchor.format).toBe('COVER');
    expect(anchor.canonState).toBe('NON_CANON');
  });

  it('downstream unlock helper returns all formats', () => {
    const unlocked = downstreamProductionUnlocked();
    expect(Object.keys(unlocked)).toEqual([
      'REEL',
      'CAROUSEL',
      'STORY',
      'CTA_STORY',
      'HIGHLIGHT',
      'TIKTOK',
      'X',
    ]);
  });

  it('founder authority registers without generating new asset', () => {
    const authority = registerEntry002FounderCoverAuthority();
    expect(authority.supersedesAssetId).toBe(B3_GENERATED_ANCHOR_ASSET_ID);
    expect(authority.propagateDownstream).toBe(false);
    expect(authority.presentation.heroArtifact.artifactClass).toBe('PHONE');
  });
});
