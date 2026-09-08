import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  bootstrapB49R4,
  resetFinalCinematicStoryboardStore,
  resetFinalCinematicStoryboardJudgmentStore,
  hasValidFinalCinematicStoryboard,
  getStoryboard004HistoricalRecord,
} from '../api/_lib/site00ExpressionEngine/entry002B49R4Bootstrap.js';
import {
  resetPreStoryboardAuthorityStore,
  persistEntry002PreStoryboardFounderApprovals,
} from '../api/_lib/site00ExpressionEngine/preStoryboardAuthorityStore.js';
import { ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardFounderApproval.js';
import {
  compileEntry002StoryboardVisualAuthorityManifest,
  extractProviderReferenceUrlsFromManifest,
  isDeterministicStoryboardProvider,
} from '../api/_lib/site00ExpressionEngine/entry002StoryboardVisualAuthorityManifest.js';
import {
  evaluateDeterministicStoryboardFounderReviewEligibility,
  evaluateVisualAuthorityBindingWithoutImages,
  runVisualAuthorityFidelityQA,
} from '../api/_lib/site00ExpressionEngine/entry002VisualAuthorityFidelityQA.js';
import { dispatchReelFirstStoryboardArtifact } from '../api/_lib/site00ExpressionEngine/entry002ReelStoryboardSingleArtifact.js';
import { compileEntry002ReelVisualConception } from '../api/_lib/site00ExpressionEngine/entry002ReelVisualConception.js';
import { compileEntry002FinalCinematicStoryboardPanelManifest } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardPanelManifest.js';
import { compileEntry002FinalCinematicStoryboardBrief } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardBrief.js';
import { buildEntry002ReelTreatmentAuthority } from '../api/_lib/site00ExpressionEngine/entry002ReelTreatment.js';
import { buildEntry002PreStoryboardVisualAuthorities } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardVisualAuthorities.js';
import { attachEntry002PreStoryboardFounderAssets } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityAssets.js';
import { attachPreStoryboardAuthorityRecords } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityRecordBuilder.js';
import { applyStoredPreStoryboardJudgments } from '../api/_lib/site00ExpressionEngine/preStoryboardFounderJudgment.js';
import { buildEntry002PreStoryboardVisualAuthorityPack } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityRecord.js';
import {
  resolveFinalStoryboardCompilationContract,
  assertStoryboardCompilationFailClosed,
} from '../api/_lib/site00ExpressionEngine/entry002FinalStoryboardCompilationContract.js';
import { compileReelFirstStoryboardPrompt } from '../api/_lib/site00ExpressionEngine/entry002ReelStoryboardPrompt.js';
import { B49R4_VISUAL_AUTHORITY_BINDING_FAILURE_REASON } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardHistory.js';
import {
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_004_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_005_ID,
  buildEntry002FinalCinematicStoryboardPublicStripPath,
} from '../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
import { resetLineageStore } from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';
import { ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION, ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION } from '../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';

function compileBrief() {
  const treatment = buildEntry002ReelTreatmentAuthority();
  const authorities = attachPreStoryboardAuthorityRecords(
    applyStoredPreStoryboardJudgments(
      attachEntry002PreStoryboardFounderAssets(buildEntry002PreStoryboardVisualAuthorities()),
    ),
  );
  const pack = buildEntry002PreStoryboardVisualAuthorityPack(authorities);
  assertStoryboardCompilationFailClosed(resolveFinalStoryboardCompilationContract(pack));
  return compileEntry002FinalCinematicStoryboardBrief({ treatment, preStoryboardAuthorityPack: pack });
}

describe('Expression Engine Sprint B4.9R4 — Visual authority binding', { timeout: 60000 }, () => {
  beforeEach(async () => {
    process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_REEL_STORYBOARD = '1';
    delete process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_STORYBOARD;
    resetPreStoryboardAuthorityStore();
    resetFinalCinematicStoryboardStore();
    resetFinalCinematicStoryboardJudgmentStore();
    resetLineageStore();
    persistEntry002PreStoryboardFounderApprovals();
  });

  it('1. visual authority manifest resolves five readable assets', async () => {
    const manifest = await compileEntry002StoryboardVisualAuthorityManifest();
    expect(manifest.requiredAuthorityImageCount).toBe(5);
    expect(manifest.resolvedAuthorityImageCount).toBe(5);
    expect(manifest.validated).toBe(true);
    expect(manifest.entries).toHaveLength(5);
  });

  it('2. authority record resolution distinct from image resolution binding', async () => {
    const manifest = await compileEntry002StoryboardVisualAuthorityManifest();
    expect(manifest.entries.every((e) => e.authorityId && e.assetReadable)).toBe(true);
    const refs = extractProviderReferenceUrlsFromManifest(manifest);
    expect(refs).toHaveLength(5);
    refs.forEach((url) => expect(url).toMatch(/^https:\/\//));
  });

  it('3–5. each authority has explicit reference role preserved', async () => {
    const manifest = await compileEntry002StoryboardVisualAuthorityManifest();
    const roles = manifest.entries.map((e) => e.referenceRole);
    expect(roles).toEqual([
      'NDX_IDENTITY_PRESENCE',
      'SUBJECT_WOMAN_IDENTITY',
      'NDX_HANDS_LIME_NAILS_INTERACTIONS',
      'SUBJECT_WARDROBE_FASHION_CONTINUITY',
      'PHONE_PROFILE_CULTURAL_GLITCH',
    ]);
  });

  it('6. prompt includes five attached images doctrine and excludes board layouts', async () => {
    const manifest = await compileEntry002StoryboardVisualAuthorityManifest();
    const conception = compileEntry002ReelVisualConception();
    const prompt = compileReelFirstStoryboardPrompt({ conception, brief: compileBrief(), visualAuthorityManifest: manifest });
    expect(prompt).toContain('FIVE ATTACHED IMAGES ARE STRICT VISUAL AUTHORITIES');
    expect(prompt).toContain('DO NOT COPY THEIR BOARD LAYOUTS');
    expect(prompt).toContain('REFERENCE 1 = NDX IDENTITY / PRESENCE');
    expect(prompt.indexOf('ONE CONTINUOUS REEL')).toBeLessThan(prompt.indexOf('NINE SELECTED STILLS'));
  });

  it('7. regression: five IDs with zero provider image refs fails binding', async () => {
    const binding = evaluateVisualAuthorityBindingWithoutImages({
      authorityRecordCount: 5,
      providerAuthorityImageInputCount: 0,
    });
    expect(binding.bindingPass).toBe(false);
    expect(binding.founderReviewEligible).toBe(false);
  });

  it('8. deterministic provider cannot enter founder review', () => {
    const eligibility = evaluateDeterministicStoryboardFounderReviewEligibility('deterministic-reel-storyboard-v1');
    expect(eligibility.founderReviewActive).toBe(false);
    expect(eligibility.readinessState).toBe('PIPELINE_TEST_ONLY');
  });

  it('9. deterministic storyboard cannot claim visual fidelity PASS', async () => {
    const result = await bootstrapB49R4();
    expect(result.visualAuthorityFidelityQA.passed).toBe(false);
    expect(result.visualAuthorityFidelityQA.result).toBe('INVALID_FOR_FOUNDER_REVIEW');
    expect(isDeterministicStoryboardProvider(result.reelArtifact?.provider ?? '')).toBe(true);
  });

  it('10. bootstrap creates storyboard 005 with PIPELINE_TEST_ONLY in CI', async () => {
    const result = await bootstrapB49R4();
    expect(result.finalCinematicStoryboard?.storyboardId).toBe(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID);
    expect(result.finalCinematicStoryboard?.version).toBe('005');
    expect(result.finalCinematicStoryboard?.status).toBe('PIPELINE_TEST_ONLY');
    expect(result.finalCinematicStoryboard?.readinessState).toBe('PIPELINE_TEST_ONLY');
  });

  it('11. storyboard 004 preserved as FAILED_VISUAL_AUTHORITY_BINDING historical', async () => {
    await bootstrapB49R4();
    const h = getStoryboard004HistoricalRecord();
    expect(h?.storyboardId).toBe(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_004_ID);
    expect(h?.status).toBe('FAILED_VISUAL_AUTHORITY_BINDING');
    expect(h?.failureReason).toBe(B49R4_VISUAL_AUTHORITY_BINDING_FAILURE_REASON);
    expect(h?.founderJudgment).toBe('UNREVIEWED');
    expect(h?.canon).toBe(false);
    expect(h?.visualAuthority).toBe(false);
    expect(h?.referenceOnly).toBe(true);
  });

  it('12. founder review inactive in CI; repair/regenerate next action', async () => {
    const result = await bootstrapB49R4();
    expect(hasValidFinalCinematicStoryboard()).toBe(false);
    expect(result.finalStoryboardReviewGate.active).toBe(false);
    expect(result.nextAction).toBe(ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION);
    expect(result.nextAction).not.toBe(ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION);
  });

  it('13. telemetry records authority image counts separately from record IDs', async () => {
    const result = await bootstrapB49R4();
    const t = result.finalCinematicStoryboard?.telemetry;
    expect(t?.requiredAuthorityImageCount).toBe(5);
    expect(t?.resolvedAuthorityImageCount).toBe(5);
    expect(t?.providerAuthorityImageInputCount).toBe(0);
    expect(t?.independentStoryboardPanelDispatchCount).toBe(0);
    expect(t?.independentStoryboardPanelRenderCount).toBe(0);
  });

  it('14. skipAuthorityImageBinding path fails closed for FAL eligibility', async () => {
    const manifest = await compileEntry002StoryboardVisualAuthorityManifest();
    const conception = compileEntry002ReelVisualConception();
    const brief = compileBrief();
    delete process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_REEL_STORYBOARD;
    const artifact = await dispatchReelFirstStoryboardArtifact({
      conception,
      brief,
      visualAuthorityManifest: manifest,
      narrativeBeatCount: compileEntry002FinalCinematicStoryboardPanelManifest().length,
      skipAuthorityImageBinding: true,
      dispatchFal: true,
    });
    expect(artifact.failure).toContain('VISUAL_AUTHORITY_BINDING_FAIL');
    expect(artifact.telemetry.providerAuthorityImageInputCount).toBe(0);
  });

  it('15. five authority IDs alone cannot satisfy visual fidelity QA', async () => {
    const manifest = await compileEntry002StoryboardVisualAuthorityManifest();
    const qa = await runVisualAuthorityFidelityQA({
      manifest,
      provider: 'fal-gpt-image-edit',
      dispatched: true,
      rendered: true,
      providerAuthorityImageInputCount: 0,
      storyboardImagePath: buildEntry002FinalCinematicStoryboardPublicStripPath(
        ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_005_ID,
      ),
    });
    expect(qa.passed).toBe(false);
    expect(qa.inspectionMethod).not.toBe('RENDER_OUTPUT_INSPECTION');
  });

  it('16. subject identity drift fails visual fidelity domain', async () => {
    const manifest = await compileEntry002StoryboardVisualAuthorityManifest();
    const qa = await runVisualAuthorityFidelityQA({
      manifest,
      provider: 'fal-gpt-image-edit',
      dispatched: true,
      rendered: false,
      providerAuthorityImageInputCount: 5,
      storyboardImagePath: null,
      driftSimulation: { subjectIdentityFidelity: true },
    });
    expect(qa.domains.subjectIdentityFidelity).not.toBe('PASS');
  });

  it('17. strip 005 written to disk in CI deterministic run', async () => {
    await bootstrapB49R4();
    const stripPath = path.join(
      process.cwd(),
      'public',
      buildEntry002FinalCinematicStoryboardPublicStripPath(
        ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_005_ID,
      ).replace(/^\//, ''),
    );
    await expect(fs.access(stripPath)).resolves.toBeUndefined();
  });

  it('18. all five founder-approved authority IDs present in manifest', async () => {
    const manifest = await compileEntry002StoryboardVisualAuthorityManifest();
    for (const expected of ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS) {
      expect(manifest.entries.some((e) => e.authorityId === expected.authorityId)).toBe(true);
    }
  });

  it('19–36. reel-first single artifact constraints preserved', async () => {
    const result = await bootstrapB49R4();
    expect(result.finalCinematicStoryboard?.generationMode).toBe('REEL_FIRST_SINGLE_ARTIFACT');
    expect(result.finalCinematicStoryboard?.telemetry.storyboardRenderCount).toBe(1);
    expect(result.finalCinematicStoryboard?.telemetry.panelRenderCount).toBe(0);
    expect(result.reelVisualConception.selectedStoryboardMoments).toHaveLength(9);
    expect(result.structuralQA.passed).toBe(true);
    expect(result.reelCoherenceQA.passed).toBe(true);
    expect(result.boardTypeQA.passed).toBe(true);
    expect(result.keyframes).toBe('BLOCKED_PENDING_FINAL_STORYBOARD_APPROVAL');
    expect(result.video).toBe('BLOCKED');
  });
});
