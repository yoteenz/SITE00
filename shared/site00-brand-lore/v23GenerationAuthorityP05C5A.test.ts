/**
 * P0.5C.5A — V2.3 regeneration recompilation + current-contract authority (39 requirements).
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  AUTOMATIC_FAL_REGENERATION,
  BRAND_CANON_MUTATED,
  BRAND_CHARACTER_MUTATED,
  CONTRACT_MUTATION_INVALIDATES_PROMPT,
  GENERATION_CONTRACT_COVERAGE_GATE_IMPLEMENTED,
  PRODUCT_EXPRESSION_IMPLEMENTED,
  PROMPT_FRESHNESS_EVALUATION_IMPLEMENTED,
  PROMPT_SNAPSHOT_IMMUTABILITY_IMPLEMENTED,
  STALE_PROMPT_GENERATION_BLOCKED,
  V2_4_CREATED,
  WORLD_FORMATION_IMPLEMENTED,
} from '../site00-studio-world-production/generationAuthority/constants.js';
import {
  buildGenerationAuthorityModel,
  contractMutationDoesNotTriggerAnthropic,
  contractMutationDoesNotTriggerFal,
  generationRemainsFounderTriggered,
  evaluateGenerationContractCoverage,
  evaluatePublicAuthorship,
  internalProductionLabelsFailPublicCopyQa,
  thirdPersonNdxNarrationFails,
  classifyLegacySnapshot,
} from '../site00-studio-world-production/generationAuthority/index.js';
import {
  C4A_ACTIVE_IN_REGENERATION,
  C4B_ACTIVE_IN_REGENERATION,
  C5_ACTIVE_IN_REGENERATION,
  CURRENT_PUBLIC_COPY_ACTIVE,
  FIRST_PERSON_AUTHORSHIP_ACTIVE,
  HISTORICAL_PROMPT_REPLAY_SUPPORTED,
  HUMAN_MADE_MARKS_ACTIVE,
  INTERNAL_LABEL_QUARANTINE_ACTIVE,
  LEGACY_ASSET_LINEAGE_CLASSIFIED,
  ROUND_01_LOCK_REQUIRES_CURRENT_LINEAGE,
  SELECTED_ASSET_AUTHORITY_IMPLEMENTED,
  SIGNATURE_LIME_REQUIRED,
  V2_3_REGENERATION_RECOMPILES_PROMPT,
  V2_3_REGENERATION_USES_CURRENT_CONTRACTS,
  V2_3_STANDARD_REGENERATION_USES_STORED_PROMPT_SNAPSHOT,
} from './artBoardMateriality/v23GenerationAuthorityConstants.js';
import {
  assertV23GenerationReady,
  auditV23ArtifactLineage,
  compileCurrentV23FalPrompt,
  evaluateV23PromptFreshness,
  getLatestSnapshot,
  markV23ArtifactPromptStale,
  migrateV23ArtifactGenerationLineage,
  resolveV23DispatchPrompt,
  selectedAssetPassesCurrentLineage,
  v23RegenerationUsesStoredPromptSnapshotOnlyOnReplay,
  v24NotCreated,
} from './artBoardMateriality/v23GenerationAuthority.js';
import {
  materialFalPromptHasHumanMadeSection,
  materialFalPromptHasSignatureLimeRequirement,
} from './artBoardMateriality/falPromptCompilerV23.js';
import { formulateExperiment01V23 } from './artBoardMateriality/experiment01V23.js';
import { round01LockRequiresMaterialGate } from './artBoardMateriality/approvalGate.js';
import { v23ArtifactGenerationReadiness, v23BoardCurrentLineageReadyCount } from './artBoardMateriality/v23BoardReadiness.js';
import { applyV23PublicCopyRevision } from './firstPersonAuthorship/v23PublicCopyRevision.js';
import { compileBrandMarketingExpressionSystem } from './brandMarketingExpression/marketingExpressionCompiler.js';
import { buildVitestBrandCharacterSystemForMarketing } from './brandMarketingExpression/vitestFixtures.js';
import { buildFounderMarketingNorthStarArtifact } from './brandMarketingExpression/northStarArtifact.js';
import { formulateExperiment01Artifacts } from './brandMarketingExpression/characterEventFormulation.js';
import { formulateExperiment01V2 } from './editorialInformationArchitecture/experiment01V2.js';
import { formulateExperiment01V21 } from './culturalVisualParticipation/experiment01V21.js';
import { formulateExperiment01V22 } from './characterRetention/experiment01V22.js';
import {
  applyV23PublicCopyRevisionAll,
  compileBrandMarketingExpression,
  formulateMarketingExpressionExperiment01,
  formulateMarketingExpressionExperiment01V2,
  formulateMarketingExpressionExperiment01V21,
  formulateMarketingExpressionExperiment01V22,
  formulateMarketingExpressionExperiment01V23,
  generateExperiment01V23ArtifactAsset,
  prepareBrandMarketingExpression,
  replayExperiment01V23HistoricalPrompt,
  resetBrandMarketingExpressionWorkers,
  setExperiment01V23SelectedGenerationAsset,
} from '../../api/_lib/site00Evolve/creativeDirection/brandMarketingExpressionExperiment/brandMarketingExpressionService.js';
import {
  resetBrandMarketingExpressionMemory,
  saveBrandMarketingExpressionRun,
} from '../../api/_lib/site00Evolve/creativeDirection/brandMarketingExpressionExperiment/brandMarketingExpressionMemoryStore.js';

function buildV23Fixtures() {
  const characterSystem = buildVitestBrandCharacterSystemForMarketing();
  const expressionSystem = compileBrandMarketingExpressionSystem({
    characterSystem,
    northStarId: buildFounderMarketingNorthStarArtifact('ndxbook').id,
    projectId: 'ndxbook',
  });
  const { artifacts } = formulateExperiment01Artifacts({
    expressionSystem,
    characterSystemId: characterSystem.id,
  });
  const v2 = formulateExperiment01V2({ v1Artifacts: artifacts, expressionSystem, characterSystemId: characterSystem.id });
  const v21 = formulateExperiment01V21({ v1Artifacts: artifacts, v2Experiment: v2.experiment, expressionSystem, characterSystemId: characterSystem.id });
  const v22 = formulateExperiment01V22({ v1Artifacts: artifacts, v21Experiment: v21.experiment, expressionSystem, characterSystemId: characterSystem.id });
  const v23 = formulateExperiment01V23({ v1Artifacts: artifacts, v22Experiment: v22.experiment, expressionSystem });
  return { artifacts, v23, v1Artifacts: artifacts };
}

async function setupV23ServiceRun(projectId = 'ndxbook') {
  await prepareBrandMarketingExpression({ projectId });
  await compileBrandMarketingExpression({ projectId });
  await formulateMarketingExpressionExperiment01({ projectId });
  await formulateMarketingExpressionExperiment01V2({ projectId });
  await formulateMarketingExpressionExperiment01V21({ projectId });
  await formulateMarketingExpressionExperiment01V22({ projectId });
  await formulateMarketingExpressionExperiment01V23({ projectId });
}

describe('P0.5C.5A — V2.3 Generation Authority', () => {
  beforeEach(() => {
    resetBrandMarketingExpressionMemory();
    resetBrandMarketingExpressionWorkers();
  });

  it('1. Generation authority model — contract is authority, snapshot is receipt', () => {
    const model = buildGenerationAuthorityModel();
    expect(model.structuredContractIsCurrentAuthority).toBe(true);
    expect(model.compiledPromptSnapshotIsImmutableReceipt).toBe(true);
    expect(V2_3_REGENERATION_USES_CURRENT_CONTRACTS).toBe(true);
    expect(V2_3_REGENERATION_RECOMPILES_PROMPT).toBe(true);
    expect(V2_3_STANDARD_REGENERATION_USES_STORED_PROMPT_SNAPSHOT).toBe(false);
  });

  it('2. Newly formulated V2.3 includes C.4A, C.4B, C.5 in compiled prompt', () => {
    const { v23, v1Artifacts } = buildV23Fixtures();
    const artifact = v23.artifacts[0]!;
    const { falContract } = compileCurrentV23FalPrompt({
      artifact,
      v1Artifact: v1Artifacts[0]!,
      projectId: 'ndxbook',
      triggerSource: 'INITIAL_FORMULATION',
    });
    expect(materialFalPromptHasHumanMadeSection(falContract)).toBe(true);
    expect(materialFalPromptHasSignatureLimeRequirement(falContract)).toBe(true);
    expect(falContract.prompt.includes('PUBLIC AUTHORSHIP MODE')).toBe(true);
    expect(C4A_ACTIVE_IN_REGENERATION).toBe(true);
    expect(C4B_ACTIVE_IN_REGENERATION).toBe(true);
    expect(C5_ACTIVE_IN_REGENERATION).toBe(true);
  });

  it('3. Standard REGENERATE_CURRENT recompiles — does not blindly use stale stored prompt', async () => {
    await setupV23ServiceRun();
    const first = await generateExperiment01V23ArtifactAsset({
      projectId: 'ndxbook',
      artifactId: 'bma-exp01-v23-1',
      mode: 'REGENERATE_CURRENT',
    });
    const stalePrompt = 'STALE SNAPSHOT WITHOUT PUBLIC AUTHORSHIP';
    const staleHash = 'deadbeef00000000';
    const idx = first.experiment01V23!.generatedArtifacts.findIndex((a) => a.id === 'bma-exp01-v23-1');
    const staleArtifacts = [...first.experiment01V23!.generatedArtifacts];
    staleArtifacts[idx] = {
      ...staleArtifacts[idx]!,
      generationContract: {
        prompt: stalePrompt,
        negativePrompt: '',
        promptHash: staleHash,
        sectionOrder: [],
      },
    };
    await saveBrandMarketingExpressionRun({
      ...first,
      experiment01V23: {
        ...first.experiment01V23!,
        generatedArtifacts: staleArtifacts,
      },
    });
    const second = await generateExperiment01V23ArtifactAsset({
      projectId: 'ndxbook',
      artifactId: 'bma-exp01-v23-1',
      mode: 'REGENERATE_CURRENT',
    });
    const artifact2 = second.experiment01V23!.generatedArtifacts.find((a) => a.id === 'bma-exp01-v23-1')!;
    expect(artifact2.generationContract?.prompt).not.toBe(stalePrompt);
    expect(artifact2.generationContract?.prompt).toContain('PUBLIC AUTHORSHIP MODE');
    expect(artifact2.generationAssets?.length).toBeGreaterThan(1);
  });

  it('4. REPLAY_GENERATION uses historical snapshot intentionally', async () => {
    await setupV23ServiceRun();
    await generateExperiment01V23ArtifactAsset({ projectId: 'ndxbook', artifactId: 'bma-exp01-v23-2', mode: 'REGENERATE_CURRENT' });
    const run = await replayExperiment01V23HistoricalPrompt({ projectId: 'ndxbook', artifactId: 'bma-exp01-v23-2' });
    const artifact = run.experiment01V23!.generatedArtifacts.find((a) => a.id === 'bma-exp01-v23-2')!;
    expect(v23RegenerationUsesStoredPromptSnapshotOnlyOnReplay('REPLAY_GENERATION')).toBe(true);
    expect(artifact.promptSnapshots?.length).toBeGreaterThan(0);
    expect(HISTORICAL_PROMPT_REPLAY_SUPPORTED).toBe(true);
  });

  it('5. Contract mutation marks prompt stale — no automatic FAL', async () => {
    await setupV23ServiceRun();
    const run = await applyV23PublicCopyRevisionAll({ projectId: 'ndxbook' });
    const artifact = run.experiment01V23!.generatedArtifacts[0]!;
    expect(artifact.promptRecompileRequired).toBe(true);
    expect(artifact.promptFreshness?.promptRecompileRequired).toBe(true);
    expect(CONTRACT_MUTATION_INVALIDATES_PROMPT).toBe(true);
    expect(contractMutationDoesNotTriggerFal()).toBe(true);
    expect(contractMutationDoesNotTriggerAnthropic()).toBe(true);
    expect(AUTOMATIC_FAL_REGENERATION).toBe(false);
  });

  it('6. Public copy revision marks prompt stale', () => {
    const { v23 } = buildV23Fixtures();
    const { artifact } = applyV23PublicCopyRevision({ artifact: v23.artifacts[0]! });
    expect(artifact.promptRecompileRequired).toBe(true);
  });

  it('7. Coverage gate blocks incomplete prompt layers', () => {
    const coverage = evaluateGenerationContractCoverage({
      artifactId: 'test',
      prompt: 'minimal prompt',
      negativePrompt: '',
      contractPresent: {},
    });
    expect(coverage.passesGate).toBe(false);
    expect(GENERATION_CONTRACT_COVERAGE_GATE_IMPLEMENTED).toBe(true);
    expect(STALE_PROMPT_GENERATION_BLOCKED).toBe(true);
  });

  it('8. Legacy snapshot classification + lineage audit', () => {
    const { v23 } = buildV23Fixtures();
    const legacy = classifyLegacySnapshot({
      prompt: 'old prompt without authorship',
      contractFingerprint: 'abc',
      snapshotContractFingerprint: 'abc',
    });
    expect(legacy).toBe('STALE_C5');
    const migrated = migrateV23ArtifactGenerationLineage({
      ...v23.artifacts[0]!,
      generationContract: { prompt: 'old', negativePrompt: '', promptHash: 'x', sectionOrder: [] },
    });
    const audit = auditV23ArtifactLineage(migrated);
    expect(LEGACY_ASSET_LINEAGE_CLASSIFIED).toBe(true);
    expect(audit.snapshotClassification).toBeTruthy();
  });

  it('9. Selected asset authority + Round 01 current lineage requirement', async () => {
    await setupV23ServiceRun();
    for (let i = 1; i <= 9; i++) {
      await generateExperiment01V23ArtifactAsset({
        projectId: 'ndxbook',
        artifactId: `bma-exp01-v23-${i}`,
        mode: 'REGENERATE_CURRENT',
      });
    }
    const run = await generateExperiment01V23ArtifactAsset({
      projectId: 'ndxbook',
      artifactId: 'bma-exp01-v23-1',
      mode: 'REGENERATE_CURRENT',
    });
    const artifact = run.experiment01V23!.generatedArtifacts.find((a) => a.id === 'bma-exp01-v23-1')!;
    const assets = artifact.generationAssets ?? [];
    expect(assets.length).toBeGreaterThan(1);
    const selected = await setExperiment01V23SelectedGenerationAsset({
      projectId: 'ndxbook',
      artifactId: 'bma-exp01-v23-1',
      selectedGenerationAssetId: assets[assets.length - 1]!.assetId,
    });
    const updated = selected.experiment01V23!.generatedArtifacts.find((a) => a.id === 'bma-exp01-v23-1')!;
    expect(selectedAssetPassesCurrentLineage(updated)).toBe(true);
    expect(SELECTED_ASSET_AUTHORITY_IMPLEMENTED).toBe(true);
    const gate = round01LockRequiresMaterialGate({ v23Experiment: selected.experiment01V23 });
    expect(gate.allowed).toBe(true);
    expect(ROUND_01_LOCK_REQUIRES_CURRENT_LINEAGE).toBe(true);
    expect(v23BoardCurrentLineageReadyCount(selected.experiment01V23!.generatedArtifacts)).toBe(9);
  });

  it('10. Public authorship QA — internal labels and third-person fail', () => {
    expect(internalProductionLabelsFailPublicCopyQa('CHARACTER BEAT: something')).toBe(true);
    expect(thirdPersonNdxNarrationFails('NDX NOTICED this trend')).toBe(true);
    const pass = evaluatePublicAuthorship({
      artifactId: 't',
      visibleTexts: ['BE SERIOUS. I WAS WRONG ABOUT THIS.'],
    });
    expect(pass.passes).toBe(true);
    expect(FIRST_PERSON_AUTHORSHIP_ACTIVE).toBe(true);
    expect(INTERNAL_LABEL_QUARANTINE_ACTIVE).toBe(true);
    expect(CURRENT_PUBLIC_COPY_ACTIVE).toBe(true);
    expect(SIGNATURE_LIME_REQUIRED).toBe(true);
    expect(HUMAN_MADE_MARKS_ACTIVE).toBe(true);
  });

  it('11. Prompt snapshots immutable; freshness evaluation implemented', () => {
    const { v23, v1Artifacts } = buildV23Fixtures();
    const { snapshot } = compileCurrentV23FalPrompt({
      artifact: v23.artifacts[0]!,
      v1Artifact: v1Artifacts[0]!,
      projectId: 'ndxbook',
      triggerSource: 'INITIAL_FORMULATION',
    });
    expect(snapshot.immutableAfterDispatch).toBe(true);
    expect(PROMPT_SNAPSHOT_IMMUTABILITY_IMPLEMENTED).toBe(true);
    expect(PROMPT_FRESHNESS_EVALUATION_IMPLEMENTED).toBe(true);
    const freshness = evaluateV23PromptFreshness(v23.artifacts[0]!);
    expect(freshness.state).toBeDefined();
  });

  it('12. Generation remains founder-triggered; V2.4 not created; experimental integrity', () => {
    expect(generationRemainsFounderTriggered()).toBe(true);
    expect(v24NotCreated()).toBe(true);
    expect(V2_4_CREATED).toBe(false);
    expect(BRAND_CHARACTER_MUTATED).toBe(false);
    expect(BRAND_CANON_MUTATED).toBe(false);
    expect(PRODUCT_EXPRESSION_IMPLEMENTED).toBe(false);
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
  });

  it('13. Resolve dispatch — REGENERATE vs REPLAY behavior', () => {
    const { v23, v1Artifacts } = buildV23Fixtures();
    const artifact = migrateV23ArtifactGenerationLineage(v23.artifacts[0]!);
    const current = resolveV23DispatchPrompt({
      artifact,
      v1Artifact: v1Artifacts[0]!,
      projectId: 'ndxbook',
      mode: 'REGENERATE_CURRENT',
    });
    expect(current.replay).toBe(false);
    expect(assertV23GenerationReady({ artifact, falContract: current.falContract }).ready).toBe(true);
    const replay = resolveV23DispatchPrompt({
      artifact,
      v1Artifact: v1Artifacts[0]!,
      projectId: 'ndxbook',
      mode: 'REPLAY_GENERATION',
      replaySnapshotId: getLatestSnapshot(artifact)?.id,
    });
    expect(replay.replay).toBe(true);
  });

  it('14. Board readiness reflects prompt freshness state', async () => {
    await setupV23ServiceRun();
    const staleRun = await applyV23PublicCopyRevisionAll({ projectId: 'ndxbook' });
    const artifact = staleRun.experiment01V23!.generatedArtifacts[0]!;
    expect(v23ArtifactGenerationReadiness(artifact)).toBe('STALE');
  });
});
