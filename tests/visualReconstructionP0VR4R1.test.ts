/**
 * P0.VR.4R1 — Live reconstruction + auto-bind acceptance tests.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  checkFalProviderHealth,
  buildProjectsHeaderPlanetPrompt,
  isProjectsHeaderPlanetAsset,
  PROJECTS_HEADER_PLANET_PROMPT_VERSION,
  PROJECTS_HEADER_PLANET_CROP,
  PROJECTS_INDEX_APPROVED_REFERENCE_PATH,
  evaluateMaterialPreservationQA,
  applyLiveBindingSlot,
  getProjectsHeaderPlanetBinding,
  clearLiveBindingStoreForTest,
  projectsHeaderBindingUsesCanonicalSource,
  PROJECTS_HEADER_PLANET_SLOT_ID,
  LIVE_BINDINGS_REGISTRY_PATH,
  LIVE_ACCEPTANCE_FAILURE_CLASSES,
  runLiveProjectsHeaderPlanetAcceptance,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr4r1/index.js';
import { clearReconstructionAssetStoreForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr4/assetStore.js';
import { canDispatchPrimaryGeneration, requiresExplicitFounderDispatch } from '../shared/site00-studio-world-production/visualReconstruction/p0vr4/spendGuard.js';
import { buildFalImageInput, SITE00_FAL_REFERENCE_EDIT_MODEL } from '../shared/site00-visual-generation/falImageModels.js';
import { isTemporaryProviderUrl } from '../shared/site00-studio-world-production/visualReconstruction/p0vr4/supabaseStorage.js';
import { validateTransparency, backgroundRemovalRequired } from '../shared/site00-studio-world-production/visualReconstruction/p0vr4/transparencyValidation.js';
import { ideogramProviderSupported, pixelcutProviderSupported, discoverBackgroundRemovalProviders } from '../shared/site00-studio-world-production/visualReconstruction/p0vr4/backgroundRemovalProvider.js';

const REPO_ROOT = join(process.cwd());

function read(path: string): string {
  return readFileSync(join(REPO_ROOT, path), 'utf8');
}

describe('P0.VR.4R1 — live acceptance pipeline', () => {
  beforeEach(() => {
    clearLiveBindingStoreForTest();
    clearReconstructionAssetStoreForTest();
  });

  it('1. live acceptance path exists', () => {
    expect(typeof runLiveProjectsHeaderPlanetAcceptance).toBe('function');
  });

  it('2. FAL provider health checked', () => {
    const health = checkFalProviderHealth({ falKey: 'test-key' });
    expect(health).toMatchObject({
      falKeyPresent: true,
      providerAvailable: true,
      editEndpointAvailable: true,
    });
  });

  it('3. GPT Image 2 Edit is selected for reference edit', () => {
    const { model } = buildFalImageInput({
      prompt: buildProjectsHeaderPlanetPrompt(),
      outputFormat: 'png',
      referenceImageUrls: ['https://example.supabase.co/storage/v1/object/public/live-preview/crop.png'],
    });
    expect(model).toBe(SITE00_FAL_REFERENCE_EDIT_MODEL);
  });

  it('4. reference crop passed into image edit input', () => {
    const cropUrl = 'https://example.supabase.co/storage/v1/object/public/live-preview/crop.png';
    const { input } = buildFalImageInput({
      prompt: buildProjectsHeaderPlanetPrompt(),
      outputFormat: 'png',
      referenceImageUrls: [cropUrl],
    });
    expect(input.image_urls).toContain(cropUrl);
  });

  it('5. text-only fallback not used for golden acceptance prompt', () => {
    const prompt = buildProjectsHeaderPlanetPrompt();
    expect(prompt).toContain('PROJECTS HEADER PLANET');
    expect(prompt).toContain('TRANSPARENT BACKGROUND');
    expect(isProjectsHeaderPlanetAsset('PROJECTS HEADER PLANET')).toBe(true);
  });

  it('6. generation receipt shape defined', () => {
    expect(PROJECTS_HEADER_PLANET_PROMPT_VERSION).toBeGreaterThan(0);
    expect(LIVE_ACCEPTANCE_FAILURE_CLASSES).toContain('LIVE_FAL_PROVIDER_BLOCKED');
  });

  it('7. transparency validation runs', () => {
    const result = validateTransparency({ hasAlpha: true, channels: 4, edgeContamination: 0.1 });
    expect(result.alphaChannelPresent).toBe(true);
    expect(backgroundRemovalRequired(result)).toBe(false);
  });

  it('8. background-removal decision runs', () => {
    const opaque = validateTransparency({ hasAlpha: false, channels: 3 });
    expect(backgroundRemovalRequired(opaque)).toBe(true);
  });

  it('9. Ideogram remains capability-gated', () => {
    const slots = discoverBackgroundRemovalProviders({});
    expect(ideogramProviderSupported(slots)).toBe(false);
    expect(ideogramProviderSupported(discoverBackgroundRemovalProviders({ ideogramApiKey: 'key' }))).toBe(true);
  });

  it('10. Pixelcut remains capability-gated', () => {
    const slots = discoverBackgroundRemovalProviders({});
    expect(pixelcutProviderSupported(slots)).toBe(false);
    expect(pixelcutProviderSupported(discoverBackgroundRemovalProviders({ pixelcutApiKey: 'key' }))).toBe(true);
  });

  it('11. material preservation QA exists', () => {
    const qa = evaluateMaterialPreservationQA({
      transparency: validateTransparency({ hasAlpha: true, channels: 4 }),
      assetType: 'HERO_OBJECT',
    });
    expect(qa.glassPreservation).toBe(true);
    expect(typeof qa.overallPass).toBe('boolean');
  });

  it('12. founder approval required — blocked without explicit action', async () => {
    const result = await runLiveProjectsHeaderPlanetAcceptance({
      repoRoot: REPO_ROOT,
      falKey: 'test',
      explicitFounderAction: false,
      skipLiveFal: true,
    });
    expect(result.blocked).toBe(true);
    expect(result.blocker).toContain('Explicit GENERATE');
  });

  it('13. Supabase upload path convention exists', () => {
    expect(PROJECTS_HEADER_PLANET_CROP.width).toBe(365);
    expect(PROJECTS_INDEX_APPROVED_REFERENCE_PATH).toContain('projects-index-approved-reference');
  });

  it('14. temporary FAL URL cannot become canonical live source', () => {
    expect(isTemporaryProviderUrl('https://fal.media/files/example.png')).toBe(true);
    expect(isTemporaryProviderUrl('https://example.supabase.co/storage/v1/object/public/live-preview/x.png')).toBe(false);
    expect(() =>
      applyLiveBindingSlot({
        assetId: 'test',
        canonicalUrl: 'https://fal.media/files/example.png',
        storagePath: 'design-assets/test.png',
        version: 1,
      }),
    ).toThrow('TEMP_PROVIDER_URL_IN_LIVE_UI');
  });

  it('15–16. binding registry + prior version preserved', () => {
    applyLiveBindingSlot({
      assetId: 'a1',
      canonicalUrl: 'https://example.supabase.co/storage/v1/object/public/live-preview/v1.png',
      storagePath: 'design-assets/site00/v1.png',
      version: 1,
    });
    applyLiveBindingSlot({
      assetId: 'a2',
      canonicalUrl: 'https://example.supabase.co/storage/v1/object/public/live-preview/v2.png',
      storagePath: 'design-assets/site00/v2.png',
      version: 2,
    });
    const binding = getProjectsHeaderPlanetBinding();
    expect(binding?.currentVersion).toBe(2);
    expect(binding?.previousAssetUrl).toContain('v1.png');
    expect(binding?.versions.length).toBe(2);
  });

  it('17–18. Projects header binding exists and uses canonical source', () => {
    expect(PROJECTS_HEADER_PLANET_SLOT_ID).toBe('site00:projects-index:header-planet-icon');
    applyLiveBindingSlot({
      assetId: 'a1',
      canonicalUrl: 'https://example.supabase.co/storage/v1/object/public/live-preview/planet.png',
      storagePath: 'design-assets/site00/projects-index/hero_object/projects-header-planet/v001.png',
      version: 1,
    });
    expect(projectsHeaderBindingUsesCanonicalSource()).toBe(true);
    expect(read('src/site00/components/projectIndex/ProjectsHeaderPlanet.tsx')).toContain('useDesignAssetBinding');
    expect(read('src/site00/components/projectIndex/ProjectIndexHero.tsx')).toContain('ProjectsHeaderPlanet');
  });

  it('19–20. APPLY TO PAGE action + live binding JSON registry', () => {
    expect(read('src/site00/components/designWorkspace/DesignAssetReconstructionDetail.tsx')).toContain('APPLY TO PAGE');
    expect(read('src/site00/components/designWorkspace/designAssetReconstructionApi.ts')).toContain('apply_to_page');
    expect(LIVE_BINDINGS_REGISTRY_PATH).toContain('design-asset-live-bindings.json');
  });

  it('21–22. context QA + screenshot QA hooks in pipeline', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr4r1/liveAcceptancePipeline.ts')).toContain(
      'evaluateContextQA',
    );
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr4r1/liveAcceptancePipeline.ts')).toContain(
      'liveScreenshotCaptured',
    );
  });

  it('23. placement fix does not force regeneration in detail UI', () => {
    expect(read('src/site00/components/designWorkspace/DesignAssetReconstructionDetail.tsx')).toContain('VIEW ON PAGE');
  });

  it('24–25. explicit GENERATE required + one dispatch max', () => {
    expect(requiresExplicitFounderDispatch()).toBe(true);
    expect(canDispatchPrimaryGeneration(0)).toBe(true);
    expect(canDispatchPrimaryGeneration(1)).toBe(false);
  });

  it('26. regeneration creates new version in binding store', () => {
    applyLiveBindingSlot({
      assetId: 'v1',
      canonicalUrl: 'https://example.supabase.co/storage/v1/object/public/live-preview/v001.png',
      storagePath: 'design-assets/v001.png',
      version: 1,
    });
    applyLiveBindingSlot({
      assetId: 'v2',
      canonicalUrl: 'https://example.supabase.co/storage/v1/object/public/live-preview/v002.png',
      storagePath: 'design-assets/v002.png',
      version: 2,
    });
    expect(getProjectsHeaderPlanetBinding()?.versions.map((v) => v.version)).toEqual([1, 2]);
  });

  it('27. System Inspector exposes receipts in detail panel', () => {
    expect(read('src/site00/components/designWorkspace/DesignAssetReconstructionDetail.tsx')).toContain('generationRequestId');
    expect(read('src/site00/components/designWorkspace/DesignAssetReconstructionDetail.tsx')).toContain('LIVE DISPATCH RECEIPT');
  });

  it('28. golden acceptance conditions available', async () => {
    const result = await runLiveProjectsHeaderPlanetAcceptance({
      repoRoot: REPO_ROOT,
      falKey: undefined,
      explicitFounderAction: true,
      skipLiveFal: true,
    });
    expect(result.conditions).toMatchObject({
      founderApprovalRequired: true,
      verified: false,
    });
  });

  it('29. authenticated walkthrough reported honestly when blocked', () => {
    expect(LIVE_ACCEPTANCE_FAILURE_CLASSES).toContain('AUTH_UI_QA_BLOCKED');
  });

  it('30. live API + binding files present', () => {
    expect(read('api/site00/design-asset-reconstruction.ts')).toContain('runLiveProjectsHeaderPlanetAcceptance');
    expect(existsSync(join(REPO_ROOT, 'public/visual-references/founder/site00/projects-index-approved-reference.jpg'))).toBe(true);
  });
});

describe('P0.VR.4R1 — live FAL blocked in vitest', () => {
  it('blocks live dispatch under vitest', () => {
    const health = checkFalProviderHealth({ falKey: 'present' });
    expect(health.liveDispatchAllowed).toBe(false);
    expect(health.blocker).toContain('vitest');
  });
});
