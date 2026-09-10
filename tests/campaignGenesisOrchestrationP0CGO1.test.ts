/**
 * P0.CGO.1 — Campaign World Genesis + Creative Direction Orchestration tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  associativeCreativeReasoningEngine,
  campaignWorldGenesisEngine,
  creativeDirectionOrchestrationSystem,
  P0_CGO_1_BUILD,
  ALL_ASSOCIATION_DOMAINS,
  buildForensicBilliardsBenchmark,
  buildWeakLuxuryBenchmark,
  computeConceptualYieldScore,
  buildConceptualConvergenceMap,
  isWeakConcept,
  detectGenericExecution,
  runConceptExecutionFidelityQA,
  diagnoseConceptDrift,
  directCreativeRevision,
  computeExecutionWitScore,
  clearWorldGenesisStoreForTest,
  planShotDiversity,
  detectShotRepetitionDrift,
  scoreLocationStoryPotential,
  compileProductionDirection,
  FORENSIC_BENCHMARK_LABEL,
} from '../shared/site00-expression-engine/campaign-genesis-orchestration/index.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.CGO.1 — Campaign Genesis + Orchestration', () => {
  beforeEach(() => clearWorldGenesisStoreForTest());

  it('1. build v273', () => {
    expect(P0_CGO_1_BUILD).toBe('v273');
  });

  it('2. CampaignWorldGenesisEngine exists', () => {
    expect(read('shared/site00-expression-engine/campaign-genesis-orchestration/campaignWorldGenesisEngine.ts')).toContain(
      'CampaignWorldGenesisEngine',
    );
  });

  it('3. association domains defined', () => {
    expect(ALL_ASSOCIATION_DOMAINS.length).toBeGreaterThanOrEqual(30);
    expect(ALL_ASSOCIATION_DOMAINS).toContain('METAPHOR');
    expect(ALL_ASSOCIATION_DOMAINS).toContain('GAME');
  });

  it('4. AssociationChain from jewelry reasoning', () => {
    const chains = associativeCreativeReasoningEngine.expandFromProduct({ productCategory: 'JEWELRY' });
    expect(chains[0]?.links.some((l) => l.term.toLowerCase().includes('hand'))).toBe(true);
    expect(chains[0]?.links.some((l) => l.distance === 'LATERAL' || l.distance === 'UNEXPECTED')).toBe(true);
  });

  it('5. conceptual yield — forensic beats weak', () => {
    const forensic = buildForensicBilliardsBenchmark();
    const weak = buildWeakLuxuryBenchmark();
    expect(forensic.conceptualYield.overall).toBeGreaterThan(weak.conceptualYield.overall);
    expect(weak.conceptualYield.classification).toBe('LOW_CONCEPTUAL_YIELD');
  });

  it('6. weak concept detection', () => {
    expect(isWeakConcept('LUXURY')).toBe(true);
    expect(isWeakConcept('DOUBLE OR NOTHING')).toBe(false);
  });

  it('7. FRONTAL SLAYER original worlds — not billiards copy', () => {
    const result = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
    });
    expect(result.safe).toBeTruthy();
    expect(result.fresh).toBeTruthy();
    expect(result.wildCard).toBeTruthy();
    const concepts = result.candidates.map((c) => c.coreConcept);
    expect(concepts.some((c) => c.includes('DOUBLE OR NOTHING'))).toBe(false);
    expect(concepts.some((c) => c.includes('IN TRANSIT') || c.includes('FLOOR'))).toBe(true);
  });

  it('8. FS pilot has hair as active element', () => {
    const fresh = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
    }).fresh!;
    expect(fresh.humanExpression.hair.length).toBeGreaterThan(0);
    expect(fresh.conceptualYield.overall).toBeGreaterThan(0.4);
  });

  it('9. NDXBOOK different from FRONTAL SLAYER', () => {
    const fs = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
    });
    const ndx = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'ndxbook',
      productCategory: 'GENERAL',
      objective: 'LAUNCH',
    });
    expect(fs.fresh?.coreConcept).not.toBe(ndx.fresh?.coreConcept);
    expect(ndx.candidates.some((c) => c.coreConcept.includes('MARGIN') || c.coreConcept.includes('RECEIPT'))).toBe(true);
  });

  it('10. CampaignWorldBible from approved candidate', () => {
    const candidate = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
    }).fresh!;
    const bible = campaignWorldGenesisEngine.approveWorldToBible({
      candidate,
      brandId: 'frontal-slayer',
      campaignId: 'test-campaign',
    });
    expect(bible.conceptThesis).toBeTruthy();
    expect(bible.nonNegotiables.length).toBeGreaterThan(0);
    expect(bible.sequenceGrammar.length).toBeGreaterThan(0);
  });

  it('11. CreativeDirectionOrchestrationSystem derives execution bible', () => {
    const candidate = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
    }).safe!;
    const bible = campaignWorldGenesisEngine.approveWorldToBible({
      candidate,
      brandId: 'frontal-slayer',
      campaignId: 'test',
    });
    const orch = creativeDirectionOrchestrationSystem.orchestrate(bible);
    expect(orch.execution.antiGenericRules.length).toBeGreaterThan(0);
    expect(orch.shots.length).toBeGreaterThanOrEqual(7);
    expect(orch.shots.every((s) => s.purpose)).toBe(true);
  });

  it('12. shot roles include CLUE with anti-hero rules', () => {
    const candidate = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
    }).fresh!;
    const bible = campaignWorldGenesisEngine.approveWorldToBible({
      candidate,
      brandId: 'fs',
      campaignId: 'c1',
    });
    const clue = creativeDirectionOrchestrationSystem.orchestrate(bible).shots.find((s) => s.role === 'CLUE')!;
    expect(clue.avoidances.some((a) => a.toLowerCase().includes('center'))).toBe(true);
    expect(clue.productProminence).toBe('LOW');
  });

  it('13. prompt compiler avoids generic beautiful woman prompt', () => {
    const candidate = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
    }).fresh!;
    const bible = campaignWorldGenesisEngine.approveWorldToBible({ candidate, brandId: 'fs', campaignId: 'c1' });
    const orch = creativeDirectionOrchestrationSystem.orchestrate(bible);
    const clue = orch.shots.find((s) => s.role === 'CLUE')!;
    const compiled = compileProductionDirection({ world: bible, execution: orch.execution, shot: clue });
    expect(compiled.promptSummary).toContain('SHOT ROLE');
    expect(compiled.promptSummary.toLowerCase()).not.toContain('beautiful woman');
    expect(compiled.doNot.length).toBeGreaterThan(0);
  });

  it('14. beautiful but generic fails fidelity QA', () => {
    const forensic = buildForensicBilliardsBenchmark();
    const bible = campaignWorldGenesisEngine.approveWorldToBible({
      candidate: forensic,
      brandId: 'forensic',
      campaignId: 'bench',
    });
    const exec = creativeDirectionOrchestrationSystem.deriveExecutionBible(bible);
    const qa = runConceptExecutionFidelityQA({
      assetDescription: 'Beautiful woman posing at pool table — centered product hero',
      visualQualityScore: 0.92,
      shotRole: 'CLUE',
      worldBible: bible,
      executionBible: exec,
    });
    expect(qa.beautifulButGeneric).toBe(true);
    expect(qa.pass).toBe(false);
  });

  it('15. revision director gives specific directions', () => {
    const drift = diagnoseConceptDrift({
      conceptSummary: 'Product discovered through gameplay',
      executionSummary: 'Woman posing at pool table backdrop',
    });
    const rev = directCreativeRevision({ diagnosis: drift, worldConcept: 'DOUBLE OR NOTHING' });
    expect(rev.specificDirections.some((d) => d.length > 20)).toBe(true);
    expect(rev.summary.toLowerCase()).not.toContain('more creative');
  });

  it('16. generic execution detector', () => {
    const issues = detectGenericExecution('Centered product hero editorial pose', 'CLUE');
    expect(issues.length).toBeGreaterThan(0);
  });

  it('17. shot repetition drift', () => {
    const shots = Array.from({ length: 5 }, (_, i) => ({
      shotId: `s${i}`,
      role: 'BEAUTY' as const,
      purpose: 'p',
      narrativeBeat: 'b',
      productProminence: 'HIGH' as const,
      humanProminence: 'HIGH' as const,
      environmentProminence: 'LOW' as const,
      motifsRequired: [],
      motifsOptional: [],
      cameraDistance: 'MEDIUM' as const,
      cameraBehavior: 'static',
      compositionRule: 'center',
      behaviorRule: 'pose',
      avoidances: [],
      sequencePosition: i,
      requirement: 'REQUIRED' as const,
    }));
    expect(detectShotRepetitionDrift(shots).some((w) => w.includes('REPETITION'))).toBe(true);
  });

  it('18. location story potential — backdrop scores lower', () => {
    const hall = scoreLocationStoryPotential('POOL HALL');
    const lobby = scoreLocationStoryPotential('COOL HOTEL LOBBY');
    expect(hall.overall).toBeGreaterThan(lobby.overall);
  });

  it('19. forensic benchmark labeled correctly', () => {
    const forensic = buildForensicBilliardsBenchmark();
    expect(forensic.isForensicBenchmark).toBe(true);
    expect(forensic.whyItWorks).toContain(FORENSIC_BENCHMARK_LABEL);
  });

  it('20. Campaign Director UI component', () => {
    expect(read('src/site00/components/founderWorkspace/campaignDirector/CampaignDirectorWorkspace.tsx')).toContain(
      'CAMPAIGN DIRECTOR',
    );
  });

  it('21. execution wit score', () => {
    const wit = computeExecutionWitScore({
      motifCount: 3,
      behaviorPresent: true,
      surprisePresent: true,
      lateralConnection: true,
    });
    expect(wit.overall).toBeGreaterThan(0.7);
  });

  it('22. shot diversity coverage', () => {
    const candidate = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
    }).safe!;
    const bible = campaignWorldGenesisEngine.approveWorldToBible({ candidate, brandId: 'fs', campaignId: 'c1' });
    const diversity = planShotDiversity(creativeDirectionOrchestrationSystem.orchestrate(bible).shots);
    expect(diversity.coverageComplete).toBe(true);
  });
});
