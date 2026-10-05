import { describe, it, expect, beforeEach } from 'vitest';
import {
  bootstrapB1Phase2,
  evaluateEntryProductionReadiness,
  resolveEntry,
} from '../api/_lib/site00ExpressionEngine/expressionEngineService.js';
import {
  compileEntry002ProductionBlueprint,
  entry002BlueprintHasZeroAssets,
  entry002TerritoryIsLocked,
  ENTRY_002_TERRITORY_ID,
  ENTRY_002_WORLD_ID,
} from '../api/_lib/site00ExpressionEngine/entry002Blueprint.js';
import { resetExpressionEntryStore } from '../api/_lib/site00ExpressionEngine/entryStore.js';
import { resetExpressionEngineMemoryStore } from '../api/_lib/site00ExpressionEngine/projectScope.js';

process.env.EXPRESSION_ENGINE_MEMORY_STORE = '1';

describe('Expression Engine Sprint B1 Phase 2 — ENTRY 002 locked blueprint', () => {
  beforeEach(() => {
    resetExpressionEntryStore();
    resetExpressionEngineMemoryStore();
  });

  it('territory 03 locked with founder LOVE IT judgment', () => {
    expect(entry002TerritoryIsLocked()).toBe(true);
    const blueprint = compileEntry002ProductionBlueprint();
    expect(blueprint.territoryId).toBe(ENTRY_002_TERRITORY_ID);
    expect(blueprint.territoryName).toBe('THE NOSTALGIA EDIT SUITE');
    expect(blueprint.territoryLockStatus).toBe('TERRITORY_LOCKED');
    expect(blueprint.founderJudgment).toBe('LOVE_IT');
  });

  it('blueprint compiles world, artifact, continuity, formats, audio, routing — zero assets', () => {
    const blueprint = compileEntry002ProductionBlueprint();
    expect(blueprint.worldExpressionSystem.expressionSystemId).toBe(ENTRY_002_WORLD_ID);
    expect(blueprint.entryArtifact.type).toBe('RAZOR_BLADE_2016_TIMELINE');
    expect(blueprint.continuityGraph.nodes.length).toBeGreaterThanOrEqual(8);
    expect(blueprint.formatExpressions.length).toBe(8);
    expect(blueprint.productionPlan.tasks.length).toBe(9);
    expect(blueprint.audioPlan.status).toBe('COMPLETE');
    expect(blueprint.audioPlan.layers.length).toBeGreaterThanOrEqual(6);
    expect(blueprint.platformTranslations.length).toBe(3);
    expect(blueprint.providerRouting.length).toBeGreaterThanOrEqual(10);
    expect(blueprint.assetsGenerated).toBe(0);
    expect(entry002BlueprintHasZeroAssets()).toBe(true);
  });

  it('creative anchor recommends COVER with production blocked pending approval', () => {
    const blueprint = compileEntry002ProductionBlueprint();
    expect(blueprint.creativeAnchorRecommendation.format).toBe('COVER');
    expect(blueprint.creativeAnchorRecommendation.taskId).toBe('t2-anchor-cover');
    expect(blueprint.creativeAnchorRecommendation.productionDispatch).toBe(
      'BLOCKED_PENDING_ANCHOR_APPROVAL',
    );
    const anchorTask = blueprint.productionPlan.tasks.find((t) => t.taskId === 't2-anchor-cover');
    expect(anchorTask?.status).toBe('BLOCKED');
  });

  it('audio plan compiled before video — reel audio task planned', () => {
    const blueprint = compileEntry002ProductionBlueprint();
    const audioTask = blueprint.productionPlan.tasks.find((t) => t.taskId === 't2-reel-audio');
    expect(audioTask?.status).toBe('PLANNED');
    expect(blueprint.audioPlan.requiredForFormats).toContain('REEL');
  });

  it('provider routing keeps autoDispatch false', () => {
    const blueprint = compileEntry002ProductionBlueprint();
    expect(blueprint.providerRouting.every((r) => r.autoDispatch === false)).toBe(true);
    expect(blueprint.providerRouting.some((r) => r.taskClass === 'IMAGE_GENERATION')).toBe(true);
    expect(blueprint.providerRouting.some((r) => r.taskClass === 'TTS_DIALOGUE')).toBe(true);
  });

  it('resolveEntry returns locked ENTRY 002 blueprint state', async () => {
    const entry = await resolveEntry({ brandId: 'ndxbook', projectId: 'ndxbook', entryNumber: 2 });
    expect(entry?.territoryId).toBe(ENTRY_002_TERRITORY_ID);
    expect(entry?.worldExpressionId).toBe(ENTRY_002_WORLD_ID);
    expect(entry?.status).toBe('IN_PRODUCTION');
    expect(entry?.generationReceipts.length).toBe(0);
    expect(entry?.founderJudgments[0]?.action).toBe('LOVE_IT');
  });

  it('bootstrapB1Phase2 returns full blueprint bundle', async () => {
    const b2 = await bootstrapB1Phase2();
    expect(b2.blueprint.status).toBe('BLUEPRINT_COMPILED');
    expect(b2.entry002.artifact?.artifactId).toBe('artifact-entry-002-razor-timeline');
    expect(b2.entry002Readiness.ready).toBe(false);
    expect(b2.entry002Readiness.blockers.some((b) => b.includes('no assets registered'))).toBe(true);
  });
});
