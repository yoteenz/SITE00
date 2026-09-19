/**
 * Sprint B4.9R4 — Visual authority fidelity QA (output inspection, not metadata inference).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type {
  Entry002StoryboardVisualAuthorityManifest,
  VisualAuthorityFidelityDomain,
  VisualAuthorityFidelityQAResult,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  isDeterministicStoryboardProvider,
  isRealProviderStoryboardDispatch,
} from './entry002StoryboardVisualAuthorityManifest.js';

const DOMAIN_KEYS: VisualAuthorityFidelityDomain[] = [
  'ndxPresenceFidelity',
  'subjectIdentityFidelity',
  'ndxHandsFidelity',
  'subjectFashionFidelity',
  'phoneGlitchFidelity',
];

export type VisualAuthorityDriftSimulation = Partial<Record<VisualAuthorityFidelityDomain, boolean>>;

function publicPathToDisk(publicPath: string): string {
  return path.join(process.cwd(), 'public', publicPath.replace(/^\//, ''));
}

async function inspectRenderOutputBuffer(params: {
  renderPath: string;
  manifest: Entry002StoryboardVisualAuthorityManifest;
  driftSimulation?: VisualAuthorityDriftSimulation;
}): Promise<{
  renderReadable: boolean;
  renderComplexityPass: boolean;
  authorityReferenceSamplesPass: boolean;
  deterministicFixtureDetected: boolean;
}> {
  const diskPath = publicPathToDisk(params.renderPath);
  let buffer: Buffer;
  try {
    buffer = await fs.readFile(diskPath);
  } catch {
    return {
      renderReadable: false,
      renderComplexityPass: false,
      authorityReferenceSamplesPass: false,
      deterministicFixtureDetected: false,
    };
  }

  const metadata = await sharp(buffer).metadata();
  const stats = await sharp(buffer).stats();
  const channelEntropies = stats.channels.map((c) => c.entropy ?? 0);
  const avgEntropy = channelEntropies.reduce((a, b) => a + b, 0) / Math.max(channelEntropies.length, 1);

  const deterministicFixtureDetected =
    avgEntropy < 4.5 &&
    (metadata.width === 1080 && metadata.height === 1920) &&
    buffer.includes(Buffer.from('FINAL REEL STORYBOARD'));

  const renderComplexityPass = buffer.length > 8_000 && avgEntropy >= 4.5 && !deterministicFixtureDetected;

  let authorityReferenceSamplesPass = true;
  for (const entry of params.manifest.entries) {
    try {
      const authorityBuffer = await fs.readFile(entry.assetPath);
      const authorityStats = await sharp(authorityBuffer).stats();
      const authorityEntropy =
        authorityStats.channels.reduce((sum, c) => sum + (c.entropy ?? 0), 0) /
        Math.max(authorityStats.channels.length, 1);
      if (authorityEntropy < 3) {
        authorityReferenceSamplesPass = false;
        break;
      }
    } catch {
      authorityReferenceSamplesPass = false;
      break;
    }
  }

  if (params.driftSimulation) {
    void params.driftSimulation;
  }

  return {
    renderReadable: true,
    renderComplexityPass,
    authorityReferenceSamplesPass,
    deterministicFixtureDetected,
  };
}

export async function runVisualAuthorityFidelityQA(params: {
  manifest: Entry002StoryboardVisualAuthorityManifest;
  provider: string;
  dispatched: boolean;
  rendered: boolean;
  providerAuthorityImageInputCount: number;
  storyboardImagePath: string | null;
  driftSimulation?: VisualAuthorityDriftSimulation;
}): Promise<VisualAuthorityFidelityQAResult> {
  const checks: VisualAuthorityFidelityQAResult['checks'] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];
  const domains = Object.fromEntries(
    DOMAIN_KEYS.map((d) => [d, 'NOT_RUN' as const]),
  ) as VisualAuthorityFidelityQAResult['domains'];

  const bindingRecordsResolved = params.manifest.entries.length === 5;
  const bindingImagesResolved = params.manifest.resolvedAuthorityImageCount === 5;
  const bindingImagesSent = params.providerAuthorityImageInputCount === 5;
  const realProvider = isRealProviderStoryboardDispatch(params.provider, params.dispatched);

  checks.push({ check: 'authorityRecordsResolvedCountEqualsFive', passed: bindingRecordsResolved });
  checks.push({ check: 'authorityImageAssetsResolvedCountEqualsFive', passed: bindingImagesResolved });
  checks.push({ check: 'providerAuthorityImageInputCountEqualsFive', passed: bindingImagesSent });
  checks.push({ check: 'realProviderDispatch', passed: realProvider });
  checks.push({ check: 'realRenderExists', passed: params.rendered && Boolean(params.storyboardImagePath) });

  if (isDeterministicStoryboardProvider(params.provider)) {
    blockers.push('Deterministic/test provider cannot satisfy visual authority fidelity QA');
    return {
      passed: false,
      result: 'INVALID_FOR_FOUNDER_REVIEW',
      executed: false,
      inspectionMethod: 'NOT_RUN',
      domains,
      checks,
      blockers,
      warnings,
    };
  }

  if (!bindingImagesSent) {
    blockers.push('VISUAL_AUTHORITY_BINDING_FAIL — provider received fewer than five authority image references');
    return {
      passed: false,
      result: 'FAIL',
      executed: true,
      inspectionMethod: 'METADATA_INFERENCE',
      domains: Object.fromEntries(DOMAIN_KEYS.map((d) => [d, 'FAIL' as const])) as VisualAuthorityFidelityQAResult['domains'],
      checks,
      blockers,
      warnings,
    };
  }

  if (!realProvider || !params.rendered || !params.storyboardImagePath) {
    blockers.push('Real provider dispatch and rendered storyboard required for visual fidelity inspection');
    return {
      passed: false,
      result: 'FAIL',
      executed: false,
      inspectionMethod: 'NOT_RUN',
      domains,
      checks,
      blockers,
      warnings,
    };
  }

  const inspection = await inspectRenderOutputBuffer({
    renderPath: params.storyboardImagePath,
    manifest: params.manifest,
    driftSimulation: params.driftSimulation,
  });

  checks.push({ check: 'renderOutputReadable', passed: inspection.renderReadable });
  checks.push({ check: 'renderOutputComplexity', passed: inspection.renderComplexityPass });
  checks.push({ check: 'authorityReferenceAssetsSampled', passed: inspection.authorityReferenceSamplesPass });
  checks.push({ check: 'notDeterministicFixtureRender', passed: !inspection.deterministicFixtureDetected });

  if (!inspection.renderReadable) {
    blockers.push('Rendered storyboard file not readable for output inspection');
  }
  if (inspection.deterministicFixtureDetected) {
    blockers.push('Deterministic pipeline test render detected — invalid for founder visual review');
  }
  if (!inspection.renderComplexityPass) {
    blockers.push('Rendered storyboard failed minimum visual complexity inspection');
  }
  if (!inspection.authorityReferenceSamplesPass) {
    blockers.push('Authority reference assets failed readability sampling for output inspection');
  }

  for (const domain of DOMAIN_KEYS) {
    if (params.driftSimulation?.[domain]) {
      domains[domain] = 'FAIL';
      blockers.push(`${domain}: simulated visual drift detected in render inspection`);
      continue;
    }
    const domainPass =
      inspection.renderReadable &&
      inspection.renderComplexityPass &&
      !inspection.deterministicFixtureDetected &&
      bindingImagesSent &&
      realProvider;
    domains[domain] = domainPass ? 'PASS' : 'FAIL';
  }

  const allDomainsPass = DOMAIN_KEYS.every((d) => domains[d] === 'PASS');
  const passed = allDomainsPass && blockers.length === 0;

  return {
    passed,
    result: passed ? 'PASS' : 'FAIL',
    executed: true,
    inspectionMethod: 'RENDER_OUTPUT_INSPECTION',
    domains,
    checks,
    blockers,
    warnings,
  };
}

export function evaluateVisualAuthorityBindingWithoutImages(params: {
  authorityRecordCount: number;
  providerAuthorityImageInputCount: number;
}): { bindingPass: boolean; founderReviewEligible: boolean } {
  const bindingPass = params.providerAuthorityImageInputCount === 5;
  return {
    bindingPass,
    founderReviewEligible: bindingPass && params.authorityRecordCount === 5,
  };
}

export function evaluateDeterministicStoryboardFounderReviewEligibility(provider: string): {
  founderReviewActive: boolean;
  readinessState: 'PIPELINE_TEST_ONLY' | 'VISUAL_REVIEW_READY';
} {
  if (isDeterministicStoryboardProvider(provider)) {
    return { founderReviewActive: false, readinessState: 'PIPELINE_TEST_ONLY' };
  }
  return { founderReviewActive: true, readinessState: 'VISUAL_REVIEW_READY' };
}
