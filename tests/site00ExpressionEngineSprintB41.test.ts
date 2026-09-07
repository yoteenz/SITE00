import { describe, it, expect, beforeEach } from 'vitest';
import { bootstrapB41 } from '../api/_lib/site00ExpressionEngine/entry002B41Bootstrap.js';
import {
  ENTRY_002_REEL_KF_END_001,
  ENTRY_002_REEL_KF_MID_001,
  ENTRY_002_REEL_KF_START_001,
  buildEntry002ReelKeyframeAssetId,
} from '../shared/site00-expression-engine/entry002ReelKeyframeIds.js';
import { compileEntry002ReelKeyframePrompt } from '../api/_lib/site00ExpressionEngine/entry002ReelKeyframePrompts.js';
import { compileEntry002ReelKeyframes } from '../api/_lib/site00ExpressionEngine/entry002ReelKeyframes.js';
import {
  listGenerationReceiptsForEntry,
  orphanAssetCannotReachProductionReady,
  resetLineageStore,
} from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';
import { resetExpressionEntryStore } from '../api/_lib/site00ExpressionEngine/entryStore.js';
import { resetExpressionEngineMemoryStore } from '../api/_lib/site00ExpressionEngine/projectScope.js';
import { resetChapterStore } from '../api/_lib/site00ExpressionEngine/chapterStore.js';
import { resetCoverAnnotationHistoryStore } from '../api/_lib/site00ExpressionEngine/coverAnnotationHistoryStore.js';

process.env.EXPRESSION_ENGINE_MEMORY_STORE = '1';

describe('Expression Engine Sprint B4.1 — Entry 002 REEL Keyframe Rasterization', () => {
  beforeEach(() => {
    resetExpressionEntryStore();
    resetExpressionEngineMemoryStore();
    resetLineageStore();
    resetChapterStore();
    resetCoverAnnotationHistoryStore();
  });

  it('1. pins canonical non-ephemeral asset IDs', () => {
    expect(ENTRY_002_REEL_KF_START_001).toBe('NDX-ENTRY-002-REEL-KF-START-001');
    expect(ENTRY_002_REEL_KF_MID_001).toBe('NDX-ENTRY-002-REEL-KF-MID-001');
    expect(ENTRY_002_REEL_KF_END_001).toBe('NDX-ENTRY-002-REEL-KF-END-001');
    expect(buildEntry002ReelKeyframeAssetId('START', 2)).toBe('NDX-ENTRY-002-REEL-KF-START-002');
  });

  it('2. B4 compile uses pinned IDs not random suffixes', () => {
    const a = compileEntry002ReelKeyframes();
    const b = compileEntry002ReelKeyframes();
    expect(a.map((k) => k.assetId)).toEqual([
      ENTRY_002_REEL_KF_START_001,
      ENTRY_002_REEL_KF_MID_001,
      ENTRY_002_REEL_KF_END_001,
    ]);
    expect(b.map((k) => k.assetId)).toEqual(a.map((k) => k.assetId));
  });

  it('3. generates exactly 3 first-pass rasters with lineage', async () => {
    const b41 = await bootstrapB41({ dispatchFal: false });
    expect(b41.assetsGenerated).toBe(3);
    expect(b41.telemetry.generationAttempts).toBe(3);
    expect(b41.keyframeRasters.map((k) => k.role)).toEqual(['START', 'MID', 'END']);
    expect(b41.keyframeRasters.every((k) => k.founderJudgment === 'UNREVIEWED')).toBe(true);
    expect(b41.keyframeRasters.every((k) => k.canonState === 'NON_CANON')).toBe(true);
  });

  it('4. no orphan assets or LEGACY_UNTRACKED', async () => {
    const b41 = await bootstrapB41({ dispatchFal: false });
    expect(b41.lineage.orphanAssets).toBe(0);
    expect(b41.lineage.legacyUntracked).toBe(0);
    for (const frame of b41.keyframeRasters) {
      expect(orphanAssetCannotReachProductionReady(frame.generationReceipt)).toBe(false);
    }
  });

  it('5. QA is advisory only — not founder approval', async () => {
    const b41 = await bootstrapB41({ dispatchFal: false });
    expect(b41.qa.advisoryOnly).toBe(true);
    expect(b41.qa.notFounderApproval).toBe(true);
    expect(b41.founderGates.find((g) => g.gateId === 'GATE_1_KEYFRAME')?.founderJudgment).toBe('UNREVIEWED');
  });

  it('6. motion / Kling / rough cut / downstream remain blocked', async () => {
    const b41 = await bootstrapB41({ dispatchFal: false });
    expect(b41.klingBlocked).toBe(true);
    expect(b41.roughCutBlocked).toBe(true);
    expect(b41.videoDispatched).toBe(false);
    expect(b41.downstreamHold.every((d) => d.produced === false)).toBe(true);
  });

  it('7. prompts enforce text discipline and Entry 001 differentiation', () => {
    const prompts = (['START', 'MID', 'END'] as const).map(compileEntry002ReelKeyframePrompt);
    const positive = prompts.map((p) => p.prompt).join(' ').toLowerCase();
    expect(positive).not.toContain('television');
    expect(positive).not.toContain('broadcast room');
    expect(prompts[0].prompt.toLowerCase()).toContain('phone');
    expect(prompts[1].prompt.toLowerCase()).toContain('same');
    expect(prompts[2].prompt.toLowerCase()).toContain('rebrand');
    expect(prompts.every((p) => p.negativePrompt.toLowerCase().includes('television'))).toBe(true);
  });

  it('8. continuity analysis structure present', async () => {
    const b41 = await bootstrapB41({ dispatchFal: false });
    expect(b41.qa.continuity.startToMid.persists.length).toBeGreaterThan(0);
    expect(b41.qa.continuity.midToEnd.changes.length).toBeGreaterThan(0);
  });

  it('9. registers planning + generation receipts for REEL format', async () => {
    await bootstrapB41({ dispatchFal: false });
    const receipts = listGenerationReceiptsForEntry('entry-002').filter((r) => r.format === 'REEL');
    expect(receipts.length).toBeGreaterThanOrEqual(6);
    expect(receipts.some((r) => r.model === 'COMPILED_SPEC')).toBe(true);
  });
});
