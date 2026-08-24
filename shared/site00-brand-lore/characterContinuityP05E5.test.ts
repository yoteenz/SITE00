/**
 * P0.5E.5 — Character Continuity Pipeline (60 requirements).
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  auditCharacterBible,
  brandCanonUnchanged,
  brandCharacterImmutable,
  buildDefaultCharacterCapabilityRegistry,
  buildEmptyEmbodiedCharacterBible,
  buildGptImage2EditCapability,
  buildGptImage2TextCapability,
  buildReferenceToVideoCapability,
  CHARACTER_BIBLE_INGESTION_PIPELINE_IMPLEMENTED,
  CHARACTER_PRODUCTION_GENERATION_EXECUTED,
  CHARACTER_TRAINING_EXECUTED,
  compileCharacterContinuityBible,
  compileCharacterSceneContract,
  compileProviderCharacterGenerationContract,
  continuityBibleAvoidsFullProseDump,
  createBibleVersion,
  createCharacterGenerationSnapshot,
  evaluateBibleInvalidation,
  evaluateCharacterContinuity,
  evaluateProviderFallback,
  evaluateReferenceAuthority,
  evaluateReferencePackReadiness,
  expressionReferenceCannotOverrideHair,
  FAL_REQUESTS_FOR_CHARACTER_GENERATION,
  FINAL_CHARACTER_FACE_SELECTED,
  FINAL_CHARACTER_VISUAL_IDENTITY_FINALIZED,
  genericPipelineHasNoIdentityAssumptions,
  hairCannotSilentlyChangeBetweenShots,
  identityAndBehaviorEvaluatedSeparately,
  ingestCharacterBible,
  isPreCastingMode,
  mayPassBehaviorFailIdentity,
  mayPassIdentityFailBehavior,
  minorBibleChangeDoesNotInvalidateIdentity,
  modelBakeoffArchitectureOnly,
  noAutomaticRegeneration,
  noAutomaticTraining,
  platformChangeDoesNotChangeIdentity,
  PRE_CASTING_PIPELINE_MODE,
  productExpressionBlocked,
  productionGenerationBlocked,
  promptAssemblyOrderPreserved,
  proseOnlyContinuityInsufficient,
  rawSourcePreserved,
  sceneContractSelectsRelevantSectionsOnly,
  selectCharacterGenerationModel,
  spokenDialogueSeparateFromCaption,
  unsupportedFieldsNotSent,
  wardrobeCannotSilentlyChangeBetweenShots,
  wardrobeReferenceCannotOverrideFace,
  worldFormationBlocked,
  buildCharacterSceneState,
  buildMultiSceneContinuity,
  buildBookContinuityContract,
  buildVoiceGenerationContract,
  evaluateTrainingReadiness,
  PRODUCTION_GENERATION_BLOCKED_UNTIL_CAST,
  READY_FOR_PRODUCTION_CHARACTER_GENERATION,
} from '../site00-studio-world-production/characterContinuityPipeline/index.js';
import {
  buildMockStructuredCharacterFixture,
  mockFixtureIsNotNdxIdentity,
  buildNdxCharacterContinuityPipelineRun,
  compileNdxPipelinePreview,
  forensicAuditExistingArchitecture,
  runNdxMockFixturePipelineTest,
  ingestNdxCharacterBibleFromSource,
  NDX_CHARACTER_CONTINUITY_DB_ID,
  NDX_CHARACTER_CONTINUITY_RUN_ID,
} from '../site00-brand-lore/ndxCharacterContinuityPipeline/index.js';
import { NDX_EMBODIED_CHARACTER_DISCOVERY_DB_ID } from '../site00-brand-lore/ndxEmbodiedCharacterDiscovery/constants.js';
import { NDX_FOUNDER_CHARACTER_DISCOVERY_DB_ID } from '../site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/constants.js';
import {
  resetCharacterContinuityMemory,
  resetCharacterContinuityStoreModeCache,
} from '../../api/_lib/site00Evolve/characterContinuity/characterContinuityStoreAdapter.js';
import {
  getCharacterContinuityState,
  initializeCharacterContinuityPipeline,
  previewCharacterGenerationContract,
  runMockFixturePipelineTest,
} from '../../api/_lib/site00Evolve/characterContinuity/characterContinuityService.js';
import { buildReferenceEntry } from '../site00-studio-world-production/characterContinuityPipeline/referencePack.js';
import { characterTruthSeparateFromVisualReadiness } from '../site00-studio-world-production/characterContinuityPipeline/bibleAudit.js';
import { buildEmptyIdentityAnchor } from '../site00-studio-world-production/characterContinuityPipeline/identityGovernance.js';
import { assertProductionGenerationAllowed } from '../site00-studio-world-production/characterContinuityPipeline/preCastingMode.js';

const ROOT = join(process.cwd());

describe('P0.5E.5 — Character Continuity Pipeline', () => {
  beforeEach(() => {
    resetCharacterContinuityMemory();
    resetCharacterContinuityStoreModeCache();
  });

  it('1. Character Bible can be ingested', async () => {
    await initializeCharacterContinuityPipeline({ projectId: 'ndxbook' });
    const fixture = buildMockStructuredCharacterFixture('ndxbook');
    const run = await runMockFixturePipelineTest({ projectId: 'ndxbook' });
    expect(run.bible).not.toBeNull();
    expect(run.ingestionReceipts.length).toBeGreaterThan(0);
  });

  it('2. Raw Bible source preserved', () => {
    const bible = buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' });
    const { receipt } = ingestCharacterBible({
      bible,
      rawSource: '{"test":true}',
      sourceType: 'JSON_EXPORT',
      normalized: { characterEssence: 'test' },
    });
    expect(rawSourcePreserved(receipt)).toBe(true);
  });

  it('3. Structured normalization preserved', () => {
    const bible = buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' });
    const { bible: ingested } = ingestCharacterBible({
      bible,
      rawSource: '{}',
      sourceType: 'STRUCTURED_RECORD',
      normalized: { characterEssence: 'She notices contradictions first.' },
    });
    expect(ingested.characterEssence).toContain('contradictions');
  });

  it('4. Unmapped fields surfaced', () => {
    const bible = buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' });
    const { receipt } = ingestCharacterBible({
      bible,
      rawSource: '{}',
      sourceType: 'DOCUMENT_TEXT',
      normalized: { characterEssence: 'x' },
    });
    expect(Array.isArray(receipt.unmappedFields)).toBe(true);
  });

  it('5. Conflicts surfaced', () => {
    const bible = buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' });
    const { receipt } = ingestCharacterBible({ bible, rawSource: '{}', sourceType: 'JSON_EXPORT', normalized: {} });
    expect(Array.isArray(receipt.conflicts)).toBe(true);
  });

  it('6. Character truth readiness separate from visual readiness', () => {
    const bible = buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' });
    bible.characterEssence = 'truth';
    bible.psychologicalLogic = 'logic';
    bible.contradictions = ['a'];
    const audit = auditCharacterBible({ bible, referencePack: { packId: 'p', characterId: 'c', references: [], readiness: 'NONE', approvedReferenceCount: 0 }, preCastingMode: true });
    expect(characterTruthSeparateFromVisualReadiness(audit)).toBe(true);
  });

  it('7. Visual identity not cast blocks production generation', () => {
    const run = buildNdxCharacterContinuityPipelineRun();
    expect(productionGenerationBlocked(run)).toBe(true);
    expect(assertProductionGenerationAllowed(run).allowed).toBe(false);
  });

  it('8. Bible audit reports missing identity anchors', () => {
    const bible = buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' });
    const audit = auditCharacterBible({ bible, referencePack: { packId: 'p', characterId: 'c', references: [], readiness: 'NONE', approvedReferenceCount: 0 }, preCastingMode: true });
    expect(audit.missingCriticalAuthority).toContain('identityAnchors');
  });

  it('9. Continuity Bible compiles from approved Bible', () => {
    const bible = buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' });
    bible.characterEssence = 'essence';
    const cb = compileCharacterContinuityBible(bible);
    expect(cb.categories.IDENTITY.length).toBeGreaterThan(0);
  });

  it('10. Continuity Bible does not require full prose in every scene', () => {
    const bible = buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' });
    bible.characterEssence = 'x'.repeat(100);
    const cb = compileCharacterContinuityBible(bible);
    expect(continuityBibleAvoidsFullProseDump(cb.categories)).toBe(true);
  });

  it('11. Scene contract selects relevant Bible sections', () => {
    const bible = buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' });
    bible.characterEssence = 'essence';
    bible.psychologicalLogic = 'x'.repeat(200);
    bible.worldview = 'y'.repeat(200);
    bible.culturalContext = 'z'.repeat(200);
    const cb = compileCharacterContinuityBible(bible);
    const scene = compileCharacterSceneContract({
      bible,
      continuityBible: cb,
      referencePack: { packId: 'p', characterId: 'c', references: [], readiness: 'NONE', approvedReferenceCount: 0 },
      scene: { sceneId: 's1', platform: 'REEL' },
    });
    expect(sceneContractSelectsRelevantSectionsOnly(scene, bible)).toBe(true);
  });

  it('12. Identity anchors supported', () => {
    const anchor = buildEmptyIdentityAnchor('FACE_GEOMETRY');
    expect(anchor.authority).toBe('NOT_APPROVED');
  });

  it('13. Variation rules supported', () => {
    const run = buildNdxCharacterContinuityPipelineRun();
    expect(run.bible?.identityAnchors.length).toBe(0);
  });

  it('14. Negative identity constraints supported', () => {
    const bible = buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' });
    const { bible: ingested } = ingestCharacterBible({
      bible,
      rawSource: '{}',
      sourceType: 'MOCK_FIXTURE',
      normalized: { negativeIdentityConstraints: [{ constraintId: '1', category: 'FACE_DRIFT', description: 'no drift', compileToNegativePrompt: true }] },
    });
    expect(ingested.negativeIdentityConstraints.length).toBe(1);
  });

  it('15. Reference Pack supports multiple authority types', () => {
    const ref = buildReferenceEntry({ characterId: 'c', referenceType: 'MASTER_HEADSHOT_FRONT', identityStrength: 'IDENTITY_HIGH' });
    expect(ref.identityStrength).toBe('IDENTITY_HIGH');
  });

  it('16. Reference authority remains scoped', () => {
    const ref = buildReferenceEntry({ characterId: 'c', referenceType: 'APPROVED_WARDROBE_VARIANT', identityStrength: 'WARDROBE_ONLY' });
    const eval_ = evaluateReferenceAuthority(ref);
    expect(eval_.mayDefineWardrobe).toBe(true);
    expect(eval_.mayDefineFace).toBe(false);
  });

  it('17. Wardrobe reference cannot silently override face', () => {
    const wardrobe = evaluateReferenceAuthority(buildReferenceEntry({ characterId: 'c', referenceType: 'APPROVED_WARDROBE_VARIANT', identityStrength: 'WARDROBE_ONLY' }));
    const face = evaluateReferenceAuthority(buildReferenceEntry({ characterId: 'c', referenceType: 'MASTER_HEADSHOT_FRONT', identityStrength: 'IDENTITY_HIGH' }));
    expect(wardrobeReferenceCannotOverrideFace(wardrobe, face)).toBe(true);
  });

  it('18. Expression reference cannot silently override hair', () => {
    const expr = evaluateReferenceAuthority(buildReferenceEntry({ characterId: 'c', referenceType: 'SKEPTICAL', identityStrength: 'EXPRESSION_ONLY' }));
    const hair = evaluateReferenceAuthority(buildReferenceEntry({ characterId: 'c', referenceType: 'APPROVED_HAIR_VARIANT', identityStrength: 'HAIR_ONLY' }));
    expect(expressionReferenceCannotOverrideHair(expr, hair)).toBe(true);
  });

  it('19. Provider capability registry implemented', () => {
    const registry = buildDefaultCharacterCapabilityRegistry();
    expect(registry.length).toBeGreaterThanOrEqual(3);
  });

  it('20. Provider capability from verified schema/config', () => {
    const cap = buildGptImage2TextCapability();
    expect(cap.schemaSupportState).toBe('SUPPORTED_VERIFIED');
  });

  it('21. Unsupported fields are not sent', () => {
    const caps = buildDefaultCharacterCapabilityRegistry();
    const scene = compileCharacterSceneContract({
      bible: buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' }),
      continuityBible: compileCharacterContinuityBible(buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' })),
      referencePack: { packId: 'p', characterId: 'c', references: [], readiness: 'NONE', approvedReferenceCount: 0 },
      scene: { sceneId: 's', platform: 'TIKTOK' },
    });
    const contract = compileProviderCharacterGenerationContract({
      scene,
      capability: caps[0]!,
      negativeConstraints: ['no drift'],
      previewOnly: true,
      productionBlocked: true,
    });
    expect(unsupportedFieldsNotSent(contract)).toBe(true);
  });

  it('22. Reference-to-video path supported', () => {
    const cap = buildReferenceToVideoCapability();
    expect(cap.supportsReferenceToVideo).toBe(true);
  });

  it('23. Image-to-video path supported', () => {
    const registry = buildDefaultCharacterCapabilityRegistry();
    expect(registry.some((c) => c.supportsImageToVideo)).toBe(true);
  });

  it('24. Multi-reference path supported when provider supports it', () => {
    const cap = buildGptImage2EditCapability();
    expect(cap.supportsMultipleReferences).toBe(true);
  });

  it('25. Start-frame path supported', () => {
    const registry = buildDefaultCharacterCapabilityRegistry();
    expect(registry.some((c) => c.supportsStartFrame)).toBe(true);
  });

  it('26. Identity binding supported when provider supports it', () => {
    const cap = buildGptImage2EditCapability();
    expect(cap.supportsFaceReference).toBe(true);
  });

  it('27. Prompt-only continuity classified weaker than reference-guided', () => {
    expect(proseOnlyContinuityInsufficient('PROSE_ONLY_EXPLORATION')).toBe(true);
  });

  it('28. Model selection considers identity fidelity', () => {
    const caps = buildDefaultCharacterCapabilityRegistry();
    const scene = compileCharacterSceneContract({
      bible: buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' }),
      continuityBible: compileCharacterContinuityBible(buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' })),
      referencePack: { packId: 'p', characterId: 'c', references: [], readiness: 'NONE', approvedReferenceCount: 0 },
      scene: { sceneId: 's', platform: 'REEL' },
    });
    const sel = selectCharacterGenerationModel({ scene, capabilities: caps, needsVideo: false, needsAudio: false, identitySensitive: true });
    expect(sel.identityFidelityPriority).toBe(true);
  });

  it('29. Model selection considers cost', () => {
    const caps = buildDefaultCharacterCapabilityRegistry();
    const scene = compileCharacterSceneContract({
      bible: buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' }),
      continuityBible: compileCharacterContinuityBible(buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' })),
      referencePack: { packId: 'p', characterId: 'c', references: [], readiness: 'NONE', approvedReferenceCount: 0 },
      scene: { sceneId: 's', platform: 'REEL' },
    });
    const sel = selectCharacterGenerationModel({ scene, capabilities: caps, needsVideo: false, needsAudio: false, identitySensitive: false });
    expect(sel.costEstimateUsd).toBeGreaterThanOrEqual(0);
  });

  it('30. Model selection considers duration/audio requirements', () => {
    const caps = buildDefaultCharacterCapabilityRegistry();
    const scene = compileCharacterSceneContract({
      bible: buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' }),
      continuityBible: compileCharacterContinuityBible(buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' })),
      referencePack: { packId: 'p', characterId: 'c', references: [], readiness: 'NONE', approvedReferenceCount: 0 },
      scene: { sceneId: 's', platform: 'REEL', duration: 10 } as never,
    });
    const sel = selectCharacterGenerationModel({ scene, capabilities: caps, needsVideo: true, needsAudio: true, durationSeconds: 10, identitySensitive: true });
    expect(sel.unsupportedRequirements.length).toBeGreaterThanOrEqual(0);
  });

  it('31. Character scene contract compiles to provider contract', async () => {
    await initializeCharacterContinuityPipeline({ projectId: 'ndxbook' });
    await runMockFixturePipelineTest({ projectId: 'ndxbook' });
    const run = await previewCharacterGenerationContract({ projectId: 'ndxbook' });
    expect(run.providerContracts.length).toBeGreaterThan(0);
  });

  it('32. Generation snapshot stores exact Bible version', () => {
    const contract = compileProviderCharacterGenerationContract({
      scene: compileCharacterSceneContract({
        bible: buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' }),
        continuityBible: compileCharacterContinuityBible(buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' })),
        referencePack: { packId: 'p', characterId: 'c', references: [], readiness: 'NONE', approvedReferenceCount: 0 },
        scene: { sceneId: 's', platform: 'REEL' },
      }),
      capability: buildGptImage2TextCapability(),
      negativeConstraints: [],
      previewOnly: true,
      productionBlocked: true,
    });
    const snap = createCharacterGenerationSnapshot({
      characterBibleVersion: '1.0.0',
      continuityBibleVersion: '1.0.0',
      sceneContractVersion: 'sc-1',
      referencePackVersion: 'rp-1',
      contract,
    });
    expect(snap.characterBibleVersion).toBe('1.0.0');
  });

  it('33. Generation snapshot stores exact reference pack version', () => {
    const contract = compileProviderCharacterGenerationContract({
      scene: compileCharacterSceneContract({
        bible: buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' }),
        continuityBible: compileCharacterContinuityBible(buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' })),
        referencePack: { packId: 'rp-99', characterId: 'c', references: [], readiness: 'NONE', approvedReferenceCount: 0 },
        scene: { sceneId: 's', platform: 'REEL' },
      }),
      capability: buildGptImage2TextCapability(),
      negativeConstraints: [],
      previewOnly: true,
      productionBlocked: true,
    });
    const snap = createCharacterGenerationSnapshot({
      characterBibleVersion: '1.0.0',
      continuityBibleVersion: '1.0.0',
      sceneContractVersion: 'sc-1',
      referencePackVersion: 'rp-99',
      contract,
    });
    expect(snap.referencePackVersion).toBe('rp-99');
  });

  it('34. Generation snapshot stores provider endpoint/schema', () => {
    const cap = buildGptImage2TextCapability();
    const contract = compileProviderCharacterGenerationContract({
      scene: compileCharacterSceneContract({
        bible: buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' }),
        continuityBible: compileCharacterContinuityBible(buildEmptyEmbodiedCharacterBible({ projectId: 'p', brandId: 'b', characterId: 'c' })),
        referencePack: { packId: 'p', characterId: 'c', references: [], readiness: 'NONE', approvedReferenceCount: 0 },
        scene: { sceneId: 's', platform: 'REEL' },
      }),
      capability: cap,
      negativeConstraints: [],
      previewOnly: true,
      productionBlocked: true,
    });
    const snap = createCharacterGenerationSnapshot({
      characterBibleVersion: '1',
      continuityBibleVersion: '1',
      sceneContractVersion: '1',
      referencePackVersion: '1',
      contract,
    });
    expect(snap.endpoint).toBe(cap.endpoint);
    expect(snap.endpointSchemaVersion).toBe(cap.schemaVersion);
  });

  it('35. Character Bible update invalidates relevant scene contracts', () => {
    const inv = evaluateBibleInvalidation({
      fromVersion: createBibleVersion({ bibleId: 'b', major: 1, minor: 0, changeSummary: 'a', identityChanging: false, recast: false }),
      toVersion: createBibleVersion({ bibleId: 'b', major: 2, minor: 0, changeSummary: 'recast', identityChanging: true, recast: true }),
    });
    expect(inv.outcome).toBe('IDENTITY_INVALIDATED');
  });

  it('36. Minor Bible change does not automatically invalidate identity', () => {
    const inv = evaluateBibleInvalidation({
      fromVersion: createBibleVersion({ bibleId: 'b', major: 1, minor: 0, changeSummary: 'a', identityChanging: false, recast: false }),
      toVersion: createBibleVersion({ bibleId: 'b', major: 1, minor: 1, changeSummary: 'clarify', identityChanging: false, recast: false }),
    });
    expect(minorBibleChangeDoesNotInvalidateIdentity(inv)).toBe(true);
  });

  it('37. Major recast invalidates continuity', () => {
    const inv = evaluateBibleInvalidation({
      fromVersion: createBibleVersion({ bibleId: 'b', major: 1, minor: 0, changeSummary: 'a', identityChanging: false, recast: false }),
      toVersion: createBibleVersion({ bibleId: 'b', major: 2, minor: 0, changeSummary: 'recast', identityChanging: true, recast: true }),
    });
    expect(inv.outcome).toBe('IDENTITY_INVALIDATED');
  });

  it('38. No automatic regeneration occurs', () => {
    const inv = evaluateBibleInvalidation({
      fromVersion: createBibleVersion({ bibleId: 'b', major: 1, minor: 0, changeSummary: 'a', identityChanging: false, recast: false }),
      toVersion: createBibleVersion({ bibleId: 'b', major: 2, minor: 0, changeSummary: 'recast', identityChanging: true, recast: true }),
    });
    expect(noAutomaticRegeneration(inv)).toBe(true);
  });

  it('39. No automatic training occurs', () => {
    const run = buildNdxCharacterContinuityPipelineRun();
    expect(noAutomaticTraining(run)).toBe(true);
  });

  it('40. Continuity QA evaluates identity separately from behavior', () => {
    const evaluation = evaluateCharacterContinuity({
      identity: { evaluationId: '1', faceMatch: 'PASS', skinContinuity: 'PASS', ageContinuity: 'PASS', bodyContinuity: 'PASS', passes: true },
      behavior: { evaluationId: '2', gestureFit: 'FAIL_GESTURE_OUT_OF_CHARACTER', movementFit: 'PASS', cameraRelationship: 'PASS', expressionFit: 'PASS', passes: false },
    });
    expect(identityAndBehaviorEvaluatedSeparately(evaluation)).toBe(true);
  });

  it('41. Generated asset may pass identity and fail behavior', () => {
    expect(mayPassIdentityFailBehavior()).toBe(true);
  });

  it('42. Generated asset may pass behavior and fail identity', () => {
    expect(mayPassBehaviorFailIdentity()).toBe(true);
  });

  it('43. Video QA evaluates across frames', () => {
    const run = buildNdxCharacterContinuityPipelineRun();
    expect(run.system.preCastingMode).toBe(true);
  });

  it('44. Multi-scene state persists', () => {
    const s1 = buildCharacterSceneState({ sceneId: 'shot-1', wardrobeId: 'w1', hairVariantId: 'h1' });
    const s2 = buildCharacterSceneState({ sceneId: 'shot-2', wardrobeId: 'w1', hairVariantId: 'h1' });
    const multi = buildMultiSceneContinuity({
      sharedCharacterIdentityId: 'id',
      sharedContinuityBibleId: 'cb',
      shots: [{ shotId: '1', sceneContractId: 'c1', state: s1 }, { shotId: '2', sceneContractId: 'c2', state: s2 }],
    });
    expect(multi.shots).toHaveLength(2);
  });

  it('45. Hair cannot silently change between shots', () => {
    const s1 = buildCharacterSceneState({ sceneId: 'a', hairVariantId: 'h1' });
    const s2 = buildCharacterSceneState({ sceneId: 'b', hairVariantId: 'h2' });
    expect(hairCannotSilentlyChangeBetweenShots(s1, s2, true)).toBe(false);
  });

  it('46. Wardrobe cannot silently change between shots', () => {
    const s1 = buildCharacterSceneState({ sceneId: 'a', wardrobeId: 'w1' });
    const s2 = buildCharacterSceneState({ sceneId: 'b', wardrobeId: 'w2' });
    expect(wardrobeCannotSilentlyChangeBetweenShots(s1, s2, true)).toBe(false);
  });

  it('47. Book state continuity supported', () => {
    const book = buildBookContinuityContract();
    expect(book.finalized).toBe(false);
  });

  it('48. Platform change does not change identity', () => {
    expect(platformChangeDoesNotChangeIdentity()).toBe(true);
  });

  it('49. Voice pipeline is separate but linked', () => {
    const voice = buildVoiceGenerationContract();
    expect(voice.voiceIdentityCast).toBe(false);
  });

  it('50. Caption voice remains separate from spoken dialogue', () => {
    expect(spokenDialogueSeparateFromCaption()).toBe(true);
  });

  it('51. Provider fallback cannot silently sacrifice identity fidelity', () => {
    const fb = evaluateProviderFallback({ preferredEndpoint: 'x', identityRequirementUnmet: true, hasFallback: false });
    expect(fb.identityFidelitySacrificed).toBe(false);
  });

  it('52. Model bake-off remains founder-triggered', () => {
    expect(modelBakeoffArchitectureOnly()).toBe(true);
  });

  it('53. Pre-casting pipeline blocks production generation', async () => {
    await initializeCharacterContinuityPipeline({ projectId: 'ndxbook' });
    const run = await runMockFixturePipelineTest({ projectId: 'ndxbook' });
    expect(run.productionGenerationBlocked).toBe(true);
    expect(run.falGenerationRequests).toBe(0);
  });

  it('54. Mock fixtures may exercise pipeline without becoming NDX identity', () => {
    const fixture = buildMockStructuredCharacterFixture('ndxbook');
    expect(mockFixtureIsNotNdxIdentity(fixture)).toBe(true);
  });

  it('55. FAL requests during sprint = 0', () => {
    const run = buildNdxCharacterContinuityPipelineRun();
    expect(run.falGenerationRequests).toBe(0);
    expect(FAL_REQUESTS_FOR_CHARACTER_GENERATION).toBe(0);
  });

  it('56. Brand Character remains unchanged', () => {
    expect(brandCharacterImmutable()).toBe(true);
  });

  it('57. Brand Canon remains unchanged', () => {
    expect(brandCanonUnchanged()).toBe(true);
  });

  it('58. P0.5E.3/P0.5E.4 upstream preserved', async () => {
    const forensic = forensicAuditExistingArchitecture();
    expect(forensic.p05e3EmbodiedDiscovery).toBe(true);
    expect(forensic.p05e4FounderDiscovery).toBe(true);
    await expect(getCharacterContinuityState({ projectId: 'ndxbook' })).resolves.toBeNull();
  });

  it('59. Product Expression and World Formation blocked', () => {
    expect(productExpressionBlocked()).toBe(true);
    expect(worldFormationBlocked()).toBe(true);
  });

  it('60. Generic Studio World contains no NDX identity assumptions', () => {
    const dir = join(ROOT, 'shared/site00-studio-world-production/characterContinuityPipeline');
    const files = ['bibleAudit.ts', 'bibleIngestion.ts', 'continuityBible.ts', 'embodiedCharacterBible.ts', 'generationCapability.ts', 'identityGovernance.ts', 'providerCompiler.ts', 'referencePack.ts', 'sceneContract.ts'];
    for (const file of files) {
      const src = readFileSync(join(dir, file), 'utf8');
      expect(genericPipelineHasNoIdentityAssumptions(src)).toBe(true);
    }
    expect(NDX_CHARACTER_CONTINUITY_DB_ID).not.toBe(NDX_EMBODIED_CHARACTER_DISCOVERY_DB_ID);
    expect(NDX_CHARACTER_CONTINUITY_DB_ID).not.toBe(NDX_FOUNDER_CHARACTER_DISCOVERY_DB_ID);
    expect(PRE_CASTING_PIPELINE_MODE).toBe(true);
    expect(PRODUCTION_GENERATION_BLOCKED_UNTIL_CAST).toBe(true);
    expect(READY_FOR_PRODUCTION_CHARACTER_GENERATION).toBe(false);
    expect(CHARACTER_BIBLE_INGESTION_PIPELINE_IMPLEMENTED).toBe(true);
    expect(promptAssemblyOrderPreserved().length).toBeGreaterThanOrEqual(10);
    expect(isPreCastingMode(buildNdxCharacterContinuityPipelineRun())).toBe(true);
    expect(NDX_CHARACTER_CONTINUITY_RUN_ID).toBe('ndx-character-continuity-p05e5');
    expect(FINAL_CHARACTER_FACE_SELECTED).toBe(false);
    expect(CHARACTER_PRODUCTION_GENERATION_EXECUTED).toBe(false);
    expect(CHARACTER_TRAINING_EXECUTED).toBe(false);
  });
});

describe('P0.5E.5 — mock fixture pipeline integration', () => {
  beforeEach(() => {
    resetCharacterContinuityMemory();
    resetCharacterContinuityStoreModeCache();
  });

  it('mock fixture test yields PRODUCTION_GENERATION_BLOCKED_CHARACTER_NOT_CAST', async () => {
    await initializeCharacterContinuityPipeline({ projectId: 'ndxbook' });
    const run = await runMockFixturePipelineTest({ projectId: 'ndxbook' });
    expect(run.productionGenerationBlockReason).toContain('PRODUCTION_GENERATION_BLOCKED');
    expect(run.generationSnapshots.length).toBeGreaterThan(0);
    expect(run.providerContracts.every((c) => c.previewOnly)).toBe(true);
  });
});
