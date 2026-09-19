import { describe, it, expect, beforeEach } from 'vitest';
import {
  bootstrapB1Phase1,
  evaluateEntryProductionReadiness,
  resolveEntry,
} from '../api/_lib/site00ExpressionEngine/expressionEngineService.js';
import {
  buildEntry001TikTokTranslationPlan,
  buildEntry001XThreadExpression,
  closeEntry001Phase1,
  entry001TikTokIsReeditNotRepost,
  exposeEntry001FounderJudgmentReadiness,
} from '../api/_lib/site00ExpressionEngine/entry001Close.js';
import {
  compileEntry002TerritoryBrief,
  entry002HasNoGeneratedAssets,
  entry002ProductionDispatchBlocked,
  entry002TerritoryCountIsMaxThree,
  prepareEntry002ForTerritoryJudgment,
  runEntry002ConceptCollapseGate,
} from '../api/_lib/site00ExpressionEngine/entry002Territories.js';
import { resetExpressionEntryStore } from '../api/_lib/site00ExpressionEngine/entryStore.js';
import { resetExpressionEngineMemoryStore } from '../api/_lib/site00ExpressionEngine/projectScope.js';

process.env.EXPRESSION_ENGINE_MEMORY_STORE = '1';

describe('Expression Engine Sprint B1 Phase 1', () => {
  beforeEach(() => {
    resetExpressionEntryStore();
    resetExpressionEngineMemoryStore();
  });

  it('ENTRY 001 TikTok plan is REEDIT not reel repost', () => {
    expect(entry001TikTokIsReeditNotRepost()).toBe(true);
    const plan = buildEntry001TikTokTranslationPlan();
    expect(plan.adaptationDecision).toBe('REEDIT');
    expect(plan.openingHook).toContain('WHO');
    expect(plan.runtimeTargetSec.max).toBeLessThanOrEqual(34);
    expect(plan.assetReuseVsReedit.requiresReedit.length).toBeGreaterThan(0);
  });

  it('ENTRY 001 X expression follows 6-beat thread structure', () => {
    const x = buildEntry001XThreadExpression();
    expect(x.beats.map((b) => b.beat)).toEqual([
      'DROP',
      'JOKE',
      'RECEIPT',
      'QUESTION',
      'SYNTHESIS',
      'BREADCRUMB',
    ]);
    expect(x.status).toBe('COMPLETE');
    expect(x.thesis).toContain('WHO TF IS WE');
  });

  it('ENTRY 001 founder judgment readiness exposes UNREVIEWED without fabrication', () => {
    const readiness = exposeEntry001FounderJudgmentReadiness();
    expect(readiness.length).toBe(9);
    expect(readiness.every((r) => r.state === 'UNREVIEWED')).toBe(true);
    expect(readiness.every((r) => r.explicitRecord === false)).toBe(true);
  });

  it('closeEntry001Phase1 completes platform translations without regenerating assets', () => {
    const closed = closeEntry001Phase1();
    const tiktok = closed.entry.platformTranslations.find((t) => t.platform === 'TIKTOK');
    const x = closed.entry.platformTranslations.find((t) => t.platform === 'X');
    expect(tiktok?.status).toBe('COMPLETE');
    expect(x?.status).toBe('COMPLETE');
    expect(closed.entry.generationReceipts.length).toBeGreaterThan(0);
  });

  it('ENTRY 001 readiness blocked after B1 close — founder judgment remains gate', async () => {
    const b1 = await bootstrapB1Phase1();
    expect(b1.entry001Readiness.ready).toBe(false);
    expect(b1.entry001Readiness.blockers.some((b) => b.includes('founder judgment UNREVIEWED'))).toBe(
      true,
    );
    expect(b1.entry001.status).toBe('IN_PRODUCTION');
  });

  it('ENTRY 002 has exactly 3 orthogonal territory candidates', () => {
    expect(entry002TerritoryCountIsMaxThree()).toBe(true);
    const brief = compileEntry002TerritoryBrief();
    expect(brief.candidates.length).toBe(3);
    const names = brief.candidates.map((c) => c.name);
    expect(new Set(names).size).toBe(3);
  });

  it('ENTRY 002 concept collapse gate passes for all three territories', () => {
    const gate = runEntry002ConceptCollapseGate();
    expect(gate.passed).toBe(true);
    expect(gate.blocking).toBe(false);
  });

  it('ENTRY 002 awaits territory judgment with zero assets and blocked dispatch', () => {
    const entry = prepareEntry002ForTerritoryJudgment();
    expect(entry.status).toBe('AWAITING_TERRITORY_JUDGMENT');
    expect(entry002HasNoGeneratedAssets()).toBe(true);
    expect(entry002ProductionDispatchBlocked()).toBe(true);
    expect(entry.territoryId).toBeNull();
  });

  it('resolveEntry returns locked ENTRY 002 blueprint state', async () => {
    const entry = await resolveEntry({ brandId: 'ndxbook', projectId: 'ndxbook', entryNumber: 2 });
    expect(entry?.territoryId).toBe('entry-002-territory-edit-suite');
    expect(entry?.status).toBe('IN_PRODUCTION');
    expect(entry?.generationReceipts.length).toBe(0);
  });

  it('prepareEntry002ForTerritoryJudgment still available for Phase 1 proof', () => {
    const entry = prepareEntry002ForTerritoryJudgment();
    expect(entry.status).toBe('AWAITING_TERRITORY_JUDGMENT');
    expect(entry.territoryId).toBeNull();
  });

  it('ENTRY 002 readiness blocked on territory judgment', async () => {
    const entry = prepareEntry002ForTerritoryJudgment();
    const readiness = evaluateEntryProductionReadiness(entry);
    expect(readiness.ready).toBe(false);
    expect(readiness.blockers.some((b) => b.includes('territory judgment'))).toBe(true);
  });

  it('bootstrapB1Phase1 returns full Phase 1 proof bundle', async () => {
    const b1 = await bootstrapB1Phase1();
    expect(b1.entry002.status).toBe('AWAITING_TERRITORY_JUDGMENT');
    expect(b1.entry002TerritoryBrief.assetsGenerated).toBe(0);
    expect(b1.entry002TerritoryBrief.collapseGate.passed).toBe(true);
    expect(b1.founderJudgmentReadiness.every((j) => j.state === 'UNREVIEWED')).toBe(true);
  });
});
