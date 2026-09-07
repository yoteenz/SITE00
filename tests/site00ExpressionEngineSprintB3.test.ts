import { describe, it, expect, beforeEach } from 'vitest';
import {
  bootstrapB1Phase2,
  bootstrapB2ChapterSystem,
  bootstrapB3CreativeAnchor,
} from '../api/_lib/site00ExpressionEngine/expressionEngineService.js';
import {
  compileEntry002AnchorCompositionRoutes,
  selectEntry002AnchorRoute,
} from '../api/_lib/site00ExpressionEngine/entry002AnchorRoutes.js';
import {
  downstreamProductionBlocked,
  evaluateEntry002AnchorQA,
  runPreAnchorQAGates,
} from '../api/_lib/site00ExpressionEngine/entry002AnchorQA.js';
import { compileEntry002LockedEntry } from '../api/_lib/site00ExpressionEngine/entry002Blueprint.js';
import { resetExpressionEntryStore } from '../api/_lib/site00ExpressionEngine/entryStore.js';
import { resetLineageStore } from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';
import { resetExpressionEngineMemoryStore } from '../api/_lib/site00ExpressionEngine/projectScope.js';
import { resetChapterStore } from '../api/_lib/site00ExpressionEngine/chapterStore.js';

process.env.EXPRESSION_ENGINE_MEMORY_STORE = '1';

describe('Expression Engine Sprint B3 — ENTRY 002 creative anchor', () => {
  beforeEach(() => {
    resetExpressionEntryStore();
    resetExpressionEngineMemoryStore();
    resetLineageStore();
    resetChapterStore();
  });

  it('compiles up to 3 composition routes sharing locked territory', () => {
    const routes = compileEntry002AnchorCompositionRoutes();
    expect(routes.length).toBe(3);
    expect(routes.every((r) => r.fashionEvidence.length >= 3)).toBe(true);
    expect(new Set(routes.map((r) => r.routeId)).size).toBe(3);
  });

  it('selects one route only for generation', () => {
    const routes = compileEntry002AnchorCompositionRoutes();
    const selected = selectEntry002AnchorRoute(routes);
    expect(selected.routeId).toBe('ROUTE_A_TIMELINE_CLIP');
    expect(selected.selected).toBe(true);
  });

  it('pre-anchor QA passes all gates', () => {
    const entry = compileEntry002LockedEntry();
    const qa = runPreAnchorQAGates(entry);
    expect(qa.passed).toBe(true);
    expect(qa.chapterGrammarValidation.valid).toBe(true);
    expect(qa.conceptCollapsePassed).toBe(true);
    expect(qa.entry001DifferentiationPassed).toBe(true);
  });

  it('anchor composition QA passes for selected route', () => {
    const selected = selectEntry002AnchorRoute(compileEntry002AnchorCompositionRoutes());
    const qa = evaluateEntry002AnchorQA(selected);
    expect(qa.passed).toBe(true);
  });

  it('produces one COVER anchor with full TRACKED lineage — no LEGACY_UNTRACKED', async () => {
    const { entry, anchor } = await bootstrapB3CreativeAnchor({ dispatchFal: false });
    expect(anchor.taskId).toBe('t2-anchor-cover');
    expect(anchor.format).toBe('COVER');
    expect(anchor.generationReceipt.trackingState).toBe('TRACKED');
    expect(anchor.generationReceipt.trackingState).not.toBe('LEGACY_UNTRACKED');
    expect(anchor.founderJudgment).toBe('UNREVIEWED');
    expect(anchor.canonState).toBe('NON_CANON');
    expect(entry.generationReceipts.length).toBe(1);
    expect(entry.assetIds.length).toBe(1);
  });

  it('downstream formats remain BLOCKED_PENDING_ANCHOR_APPROVAL', async () => {
    const { anchor } = await bootstrapB3CreativeAnchor({ dispatchFal: false });
    const blocked = downstreamProductionBlocked();
    expect(anchor.downstreamBlocked).toEqual(blocked);
    expect(Object.values(anchor.downstreamBlocked).every((s) => s === 'BLOCKED_PENDING_ANCHOR_APPROVAL')).toBe(
      true,
    );
  });

  it('does not generate reel carousel story tiktok or x assets', async () => {
    const { entry } = await bootstrapB3CreativeAnchor({ dispatchFal: false });
    expect(entry.generationReceipts.every((r) => r.format === 'COVER')).toBe(true);
    expect(entry.generationReceipts.length).toBe(1);
  });

  it('selected route prioritizes 2016 baddie fashion focal point', async () => {
    const { anchor } = await bootstrapB3CreativeAnchor({ dispatchFal: false });
    expect(anchor.selectedRoute.fashionEvidence).toContain('CHOKER');
    expect(anchor.selectedRoute.focalMechanism.toLowerCase()).toContain('2016');
    expect(anchor.selectedRoute.phoneBehavior.toLowerCase()).toMatch(/evidence|archived|table/);
  });

  it('existing B1/B2 contracts remain compatible', async () => {
    const b1p2 = await bootstrapB1Phase2();
    expect(b1p2.entry002.generationReceipts.length).toBe(0);
    const b2 = await bootstrapB2ChapterSystem();
    expect(b2.entries.entry002.validation.valid).toBe(true);
  });
});
