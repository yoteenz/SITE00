/**
 * Experience Engine V0 — orchestrates reference resolution, capture, compare, iteration.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import type {
  ExperienceEngineRouteProof,
  Site00FidelityIterationRecord,
  Site00RouteReferenceRecord,
} from '../../../shared/site00-experience-engine/types.js';
import {
  ENTER_DESKTOP_PROOF_REGIONS,
  ENTER_DESKTOP_VIEWPORT,
  ENTER_PROOF_ROUTE,
  EXPERIENCE_ENGINE_MAX_ITERATIONS,
  EXPERIENCE_ENGINE_PIXEL_PASS_THRESHOLD,
} from '../../../shared/site00-experience-engine/constants.js';
import { renderControlledReference } from '../../../shared/site00-studio-world-production/visualReconstruction/render/ControlledReferenceRenderer.js';
import { compareCropRegions, scoreToFidelityStatus } from './cropRegionComparison.js';
import { createEnterDesktopDecomposition } from './enterDecomposition.js';
import { composeReferenceFrame, fetchEnterDesktopAuthorityAsset } from './enterReferenceFrame.js';
import { evaluatePromotionEligibility } from './promotionEligibility.js';
import { resolveSite00HostProjectScope } from './projectScope.js';
import {
  listFidelityIterations,
  listRouteReferences,
  saveFidelityIteration,
  seedEnterDesktopReference,
  seedEnterMobileBlockedReference,
  upsertRouteReference,
} from './routeReferenceStore.js';

export type ResolveRouteReferenceInput = {
  routeId: string;
  viewportClass: Site00RouteReferenceRecord['viewportClass'];
  projectKey?: string;
};

export async function resolveRouteReference(
  input: ResolveRouteReferenceInput,
): Promise<Site00RouteReferenceRecord | null> {
  const scope = await resolveSite00HostProjectScope();
  const refs = await listRouteReferences({
    projectKey: input.projectKey ?? scope.projectKey,
    routeId: input.routeId,
    viewportClass: input.viewportClass,
  });

  const designAuthority = refs.find(
    (r) => r.authorityLevel === 'DESIGN_AUTHORITY' && r.status === 'ACTIVE',
  );
  if (designAuthority) return designAuthority;

  const blocked = refs.find((r) => r.status === 'BLOCKED_PENDING_REFERENCE_AUTHORITY');
  if (blocked) return blocked;

  return refs[0] ?? null;
}

export async function ensureEnterRouteReferences(projectId: string): Promise<{
  desktop: Site00RouteReferenceRecord;
  mobile: Site00RouteReferenceRecord;
}> {
  if (process.env.EXPERIENCE_ENGINE_MEMORY_STORE === '1' || process.env.VITEST === 'true') {
    return {
      desktop: seedEnterDesktopReference(projectId),
      mobile: seedEnterMobileBlockedReference(projectId),
    };
  }

  const desktop =
    (await resolveRouteReference({ routeId: ENTER_PROOF_ROUTE, viewportClass: 'DESKTOP' })) ??
    (await upsertRouteReference({
      projectId,
      projectKey: 'site00',
      routeId: ENTER_PROOF_ROUTE,
      viewportClass: 'DESKTOP',
      referenceStoragePath: 'live-preview/site00/89319E70-D080-4798-9BCA-E53B137F2387.png',
      authorityLevel: 'DESIGN_AUTHORITY',
      referenceKind: 'ENVIRONMENT_ASSET',
      status: 'ACTIVE',
      metadata: { environmentId: 'ENTER_00_WAITING_ROOM', focal: 'center 75%', blockedRegionIds: ['status-strip'] },
    }));

  const mobile =
    (await resolveRouteReference({ routeId: ENTER_PROOF_ROUTE, viewportClass: 'MOBILE' })) ??
    (await upsertRouteReference({
      projectId,
      projectKey: 'site00',
      routeId: ENTER_PROOF_ROUTE,
      viewportClass: 'MOBILE',
      referenceStoragePath: '',
      authorityLevel: 'UNAPPROVED',
      referenceKind: 'FULL_VIEWPORT',
      status: 'BLOCKED_PENDING_REFERENCE_AUTHORITY',
      metadata: { reason: 'NO_FOUNDER_APPROVED_MOBILE_REFERENCE' },
    }));

  return { desktop, mobile };
}

export function decomposeReference(reference: Site00RouteReferenceRecord) {
  if (reference.routeId === ENTER_PROOF_ROUTE && reference.viewportClass === 'DESKTOP') {
    return createEnterDesktopDecomposition();
  }
  return null;
}

export type CaptureRouteRenderInput = {
  routeId: string;
  viewportClass: 'DESKTOP' | 'MOBILE';
  baseUrl?: string;
  iterationNumber: number;
  artifactDir?: string;
};

export async function captureRouteRender(input: CaptureRouteRenderInput): Promise<{
  renderBuffer: Buffer;
  renderStoragePath: string;
  screenshotPath: string;
}> {
  const viewport =
    input.viewportClass === 'DESKTOP'
      ? { width: ENTER_DESKTOP_VIEWPORT.width, height: ENTER_DESKTOP_VIEWPORT.height, deviceScaleFactor: 1 }
      : { width: 390, height: 844, deviceScaleFactor: 2 };

  const outputDir = input.artifactDir ?? join(tmpdir(), `ee-capture-${Date.now()}`);
  mkdirSync(outputDir, { recursive: true });

  const render = await renderControlledReference({
    route: input.routeId,
    baseUrl: input.baseUrl ?? process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5174',
    viewport,
    outputDir,
    reconstructionIteration: input.iterationNumber,
    blueprintVersion: 'experience-engine-v0',
    previewDeviceMode: input.viewportClass === 'MOBILE' ? 'mobile' : 'desktop',
    routeSearch: input.viewportClass === 'MOBILE' ? '?site00MobileLayout=1' : undefined,
  });

  const renderBuffer = readFileSync(render.screenshotPath);
  const renderStoragePath = `experience-engine/renders/enter/${input.viewportClass.toLowerCase()}/iteration-${input.iterationNumber}.png`;
  writeFileSync(join(outputDir, `iteration-${input.iterationNumber}-artifact.png`), renderBuffer);

  return {
    renderBuffer,
    renderStoragePath,
    screenshotPath: render.screenshotPath,
  };
}

export type CompareRouteInput = {
  reference: Site00RouteReferenceRecord;
  renderBuffer: Buffer;
  artifactDir?: string;
};

export async function compareRouteToReference(input: CompareRouteInput): Promise<{
  comparison: Awaited<ReturnType<typeof compareCropRegions>>;
  referenceBuffer: Buffer;
  heatmapStoragePath: string;
}> {
  const assetBuffer = await fetchEnterDesktopAuthorityAsset();
  const focal = (input.reference.metadata.focal as string | undefined) ?? 'center 75%';
  const referenceBuffer = await composeReferenceFrame({
    assetBuffer,
    width: ENTER_DESKTOP_VIEWPORT.width,
    height: ENTER_DESKTOP_VIEWPORT.height,
    focal,
  });

  const artifactDir = input.artifactDir ?? join(tmpdir(), `ee-compare-${Date.now()}`);
  mkdirSync(artifactDir, { recursive: true });

  const comparison = await compareCropRegions({
    referenceBuffer,
    renderBuffer: input.renderBuffer,
    viewportWidth: ENTER_DESKTOP_VIEWPORT.width,
    viewportHeight: ENTER_DESKTOP_VIEWPORT.height,
    regions: ENTER_DESKTOP_PROOF_REGIONS,
    threshold: 0.12,
  });

  const heatmapStoragePath = join(artifactDir, 'heatmap.png');
  await sharp(comparison.heatmapBuffer, {
    raw: { width: ENTER_DESKTOP_VIEWPORT.width, height: ENTER_DESKTOP_VIEWPORT.height, channels: 4 },
  })
    .png()
    .toFile(heatmapStoragePath);

  return { comparison, referenceBuffer, heatmapStoragePath };
}

export async function recordFidelityIteration(params: {
  routeReference: Site00RouteReferenceRecord;
  iterationNumber: number;
  renderStoragePath: string;
  heatmapStoragePath: string;
  comparison: Awaited<ReturnType<typeof compareCropRegions>>;
}): Promise<Site00FidelityIterationRecord> {
  const score = params.comparison.fullViewportPixelScore;
  const status = scoreToFidelityStatus(score, EXPERIENCE_ENGINE_PIXEL_PASS_THRESHOLD);
  const blockedRegions = new Set(['status-strip']);
  const failedRegions = params.comparison.regionScores.filter(
    (r) => !r.passed && !blockedRegions.has(r.regionId),
  );
  const finalStatus = failedRegions.length > 0 ? 'FOUNDER_REVIEW' : status;

  return saveFidelityIteration({
    routeReferenceId: params.routeReference.id,
    iterationNumber: params.iterationNumber,
    renderStoragePath: params.renderStoragePath,
    heatmapStoragePath: params.heatmapStoragePath,
    pixelScore: score,
    structuralScore: score,
    status: finalStatus,
    comparisonMetadata: {
      fullViewportPixelScore: score,
      structuralScore: score,
      regionScores: params.comparison.regionScores,
      heatmapStoragePath: params.heatmapStoragePath,
      comparisonEngine: 'crop_region_pixelmatch_v0',
      threshold: EXPERIENCE_ENGINE_PIXEL_PASS_THRESHOLD,
      mismatches: failedRegions.map(
        (r) => `${r.regionId}:${(1 - r.pixelScore).toFixed(4)} diff (${r.label})`,
      ),
    },
  });
}

export async function runEnterDesktopProofLoop(options?: {
  baseUrl?: string;
  maxIterations?: number;
  artifactRoot?: string;
}): Promise<ExperienceEngineRouteProof> {
  const scope = await resolveSite00HostProjectScope();
  const projectId = scope.managedProjectDbId ?? scope.projectId;
  const { desktop, mobile } = await ensureEnterRouteReferences(projectId);
  const decomposition = decomposeReference(desktop);
  const maxIterations = options?.maxIterations ?? EXPERIENCE_ENGINE_MAX_ITERATIONS;
  const artifactRoot = options?.artifactRoot ?? join(tmpdir(), `enter-proof-${Date.now()}`);
  mkdirSync(artifactRoot, { recursive: true });

  const iterations: Site00FidelityIterationRecord[] = [];

  for (let i = 0; i < maxIterations; i++) {
    const capture = await captureRouteRender({
      routeId: ENTER_PROOF_ROUTE,
      viewportClass: 'DESKTOP',
      baseUrl: options?.baseUrl,
      iterationNumber: i,
      artifactDir: join(artifactRoot, `iteration-${i}`),
    });

    const { comparison, heatmapStoragePath } = await compareRouteToReference({
      reference: desktop,
      renderBuffer: capture.renderBuffer,
      artifactDir: join(artifactRoot, `iteration-${i}`),
    });

    const iteration = await recordFidelityIteration({
      routeReference: desktop,
      iterationNumber: i,
      renderStoragePath: capture.renderStoragePath,
      heatmapStoragePath,
      comparison,
    });
    iterations.push(iteration);

    if (iteration.status === 'PIXEL_PASS') break;
  }

  const latest = iterations[iterations.length - 1] ?? null;
  const promotion = evaluatePromotionEligibility({ reference: desktop, latestIteration: latest });

  return {
    routeId: ENTER_PROOF_ROUTE,
    viewportClass: 'DESKTOP',
    references: [desktop, mobile],
    decomposition,
    iterations,
    promotion,
  };
}

export async function getEnterProofState(): Promise<ExperienceEngineRouteProof> {
  const scope = await resolveSite00HostProjectScope();
  const projectId = scope.managedProjectDbId ?? scope.projectId;
  const { desktop, mobile } = await ensureEnterRouteReferences(projectId);
  const iterations = await listFidelityIterations(desktop.id);
  const latest = iterations[iterations.length - 1] ?? null;
  return {
    routeId: ENTER_PROOF_ROUTE,
    viewportClass: 'DESKTOP',
    references: [desktop, mobile],
    decomposition: decomposeReference(desktop),
    iterations,
    promotion: evaluatePromotionEligibility({ reference: desktop, latestIteration: latest }),
  };
}

export {
  evaluatePromotionEligibility,
  resolveSite00HostProjectScope,
  createEnterDesktopDecomposition,
};
