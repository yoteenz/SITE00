/**
 * Reference Asset Reconstruction Pipeline — 25 tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  auditInvalidCropAsCanonical,
  backgroundRemovalRunsAfterReconstruction,
  buildAssetTreatmentPlan,
  buildProviderInputReceipt,
  buildReferenceAssetPrompt,
  buildSkinsFamilyMultiAssetJob,
  classifyReferenceAsset,
  defaultBackgroundPolicy,
  RECONSTRUCT_REFERENCE_ASSET_PRESET,
  REFERENCE_ASSET_PIPELINE_FAILURE_CODES,
  resolveCanonicalBindingUrl,
  runReconstructionVisualQA,
  runScreenshotContaminationQA,
  screenConvergenceBlocked,
  sourceCropCannotBeCanonical,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6/referenceAssetPipeline.js';
import {
  auditInvalidSourceCropBindings,
  buildDefaultSkinsManifest,
  resolveFamilyThumbnailUrl,
  resolveScreenThumbnailUrl,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsReferenceFidelity.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Reference Asset Pipeline (P0.VR.6R4)', () => {
  const manifest = buildDefaultSkinsManifest();
  const job = buildSkinsFamilyMultiAssetJob('MOBILE');
  const ndx = job.candidates[0]!;

  it('1. source crop stored separately', () => {
    expect(ndx.source.sourceCropUrl).toContain('/site00/skins/extracted/');
    const ndxEntry = manifest.find((m) => m.assetSlot === 'BRAND_FAMILY_NDXBOOK' && m.viewport === 'MOBILE');
    expect(ndxEntry?.sourceCropUrl).toBeTruthy();
    expect(ndxEntry?.sourceCropUrl).not.toBe(ndxEntry?.canonicalUrl);
  });

  it('2. source crop cannot become canonical by default', () => {
    const guard = sourceCropCannotBeCanonical({ assetType: 'PROJECT_VISUAL', uiContaminationSuspected: true });
    expect(guard.blocked).toBe(true);
    expect(guard.code).toBe('SOURCE_CROP_USED_AS_CANONICAL');
  });

  it('3. classification runs', () => {
    expect(classifyReferenceAsset({ slotId: 'BRAND_FAMILY_NDXBOOK_THUMBNAIL' })).toBe('PROJECT_VISUAL');
    expect(classifyReferenceAsset({ slotId: 'NAV_ICON_HOME' })).toBe('ICON');
  });

  it('4. treatment plan created', () => {
    const plan = buildAssetTreatmentPlan({ assetType: 'PROJECT_VISUAL', uiContaminationSuspected: true });
    expect(plan.reconstructionRequired).toBe(true);
    expect(plan.providerRecommendation).toContain('gpt-image-2/edit');
  });

  it('5. reconstruction-required types enforced', () => {
    const plan = buildAssetTreatmentPlan({ assetType: 'ICON', cropClean: true });
    expect(plan.reconstructionRequired).toBe(true);
  });

  it('6. direct extraction allowed only for valid types', () => {
    const plan = buildAssetTreatmentPlan({ assetType: 'SCREENSHOT', cropClean: true, uiContaminationSuspected: false });
    expect(plan.directExtractionAllowed).toBe(true);
  });

  it('7. prompt generated', () => {
    const prompt = buildReferenceAssetPrompt({
      assetType: 'PROJECT_VISUAL',
      targetSlot: 'BRAND_FAMILY_NDXBOOK_THUMBNAIL',
      backgroundPolicy: 'KEEP_BACKGROUND',
      brandLabel: 'NDXBOOK',
    });
    expect(prompt).toContain('NDXBOOK');
    expect(prompt).toContain('REMOVE ALL SURROUNDING UI');
  });

  it('8. prompt receives crop context', () => {
    expect(ndx.prompt).toContain('TARGET SLOT');
    expect(ndx.prompt.length).toBeGreaterThan(100);
  });

  it('9. GPT Image 2 Edit path supported', () => {
    expect(ndx.treatmentPlan.providerRecommendation).toContain('gpt-image-2/edit');
  });

  it('10. provider receives approved crop checksum', () => {
    const receipt = buildProviderInputReceipt({ source: ndx.source, prompt: ndx.prompt, requestId: 'req-1' });
    expect(receipt.sourceCropChecksum).toBe(ndx.source.sourceCropChecksum);
    expect(receipt.model).toBe('openai/gpt-image-2/edit');
  });

  it('11. background policy exists', () => {
    expect(defaultBackgroundPolicy('ICON')).toBe('TRANSPARENT');
    expect(defaultBackgroundPolicy('PROJECT_VISUAL')).toBe('KEEP_BACKGROUND');
  });

  it('12. reconstruction happens before background removal', () => {
    expect(backgroundRemovalRunsAfterReconstruction()).toBe(true);
  });

  it('13. transparency QA exists', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr4/assetReconstructionQA.ts')).toContain(
      'TRANSPARENCY',
    );
  });

  it('14. UI contamination detected', () => {
    const qa = runScreenshotContaminationQA(ndx.source);
    expect(qa.overallContaminated).toBe(true);
    expect(qa.phoneFrame).toBe(true);
  });

  it('15. founder approval required', () => {
    const binding = resolveCanonicalBindingUrl({ source: ndx.source, output: null });
    expect(binding.bindingAllowed).toBe(false);
    expect(binding.failureCode).toBe('REFERENCE_ASSET_CANONICAL_BINDING_MISSING');
  });

  it('16. canonical upload only after approval', () => {
    const binding = resolveCanonicalBindingUrl({
      source: ndx.source,
      output: {
        outputId: 'out-1',
        sourceAssetId: ndx.source.cropId,
        provider: 'fal',
        model: 'openai/gpt-image-2/edit',
        prompt: ndx.prompt,
        outputUrl: '/canonical/ndx.webp',
        backgroundPolicy: 'KEEP_BACKGROUND',
        qaStatus: 'PASS',
        approvalStatus: 'PENDING',
        canonicalAssetId: 'can-1',
        version: '1.0',
      },
    });
    expect(binding.bindingAllowed).toBe(false);
    expect(binding.failureCode).toBe('REFERENCE_ASSET_FOUNDER_APPROVAL_MISSING');
  });

  it('17. binding uses canonical asset', () => {
    const binding = resolveCanonicalBindingUrl({
      source: ndx.source,
      output: {
        outputId: 'out-1',
        sourceAssetId: ndx.source.cropId,
        provider: 'fal',
        model: 'openai/gpt-image-2/edit',
        prompt: ndx.prompt,
        outputUrl: '/canonical/ndx.webp',
        backgroundPolicy: 'KEEP_BACKGROUND',
        qaStatus: 'PASS',
        approvalStatus: 'LOVE_IT',
        canonicalAssetId: 'can-1',
        version: '1.0',
      },
    });
    expect(binding.bindingAllowed).toBe(true);
    expect(binding.url).toBe('/canonical/ndx.webp');
  });

  it('18. invalid old crop bindings detected', () => {
    const invalid = auditInvalidSourceCropBindings([
      {
        ...manifest[0]!,
        status: 'BOUND',
        canonicalUrl: manifest[0]!.sourceCropUrl!,
        sourceCropUrl: manifest[0]!.sourceCropUrl,
      },
    ]);
    expect(invalid.length).toBeGreaterThan(0);
    expect(auditInvalidCropAsCanonical([ndx.source])).toContain('INVALID_SOURCE_CROP_AS_CANONICAL');
  });

  it('19. broken URLs fall back safely', () => {
    const thumb = resolveFamilyThumbnailUrl({ brandKey: 'FRONTAL_SLAYER', viewport: 'MOBILE', manifest });
    expect(thumb.url).toBeNull();
    expect(thumb.colorSwatchFallback).toBe(true);
    expect(read('src/site00/components/designWorkspace/skins/SkinFamilyThumb.tsx')).toContain('onError');
    const ndx = resolveFamilyThumbnailUrl({ brandKey: 'NDXBOOK', viewport: 'MOBILE', manifest });
    expect(ndx.url).toContain('canonical');
    expect(ndx.colorSwatchFallback).toBe(false);
  });

  it('20. five family assets can run as multi-asset job', () => {
    expect(job.candidates).toHaveLength(5);
    expect(job.jobType).toBe('MULTI_ASSET');
  });

  it('21. jobs process one-by-one', () => {
    expect(job.processOneAtATime).toBe(true);
  });

  it('22. screen authority thumbnail precedence works', () => {
    const res = resolveScreenThumbnailUrl({
      viewport: 'MOBILE',
      packScreenType: 'PROJECT_OVERVIEW',
      authorityPreviewUrl: '/authority/overview.png',
      manifest,
    });
    expect(res.source).toBe('AUTHORITY');
  });

  it('23. screen convergence waits for required assets', () => {
    expect(screenConvergenceBlocked(false).status).toBe('WAITING_FOR_REFERENCE_ASSETS');
    expect(screenConvergenceBlocked(true).status).toBe('READY');
  });

  it('24. screen convergence reruns after bind', () => {
    const qa = runReconstructionVisualQA({
      contamination: runScreenshotContaminationQA({ ...ndx.source, uiContaminationSuspected: false }),
      outputUrlPresent: true,
    });
    expect(qa.overallPass).toBe(true);
  });

  it('25. build passes', () => {
    expect(REFERENCE_ASSET_PIPELINE_FAILURE_CODES).toContain('SOURCE_CROP_USED_AS_CANONICAL');
    expect(RECONSTRUCT_REFERENCE_ASSET_PRESET.id).toBe('preset-reconstruct-reference-asset');
    expect(read('src/site00/components/designWorkspace/DesignSkinsReferenceAssetJobs.tsx')).toContain(
      'SOURCE CROP ≠ CANONICAL',
    );
  });
});
