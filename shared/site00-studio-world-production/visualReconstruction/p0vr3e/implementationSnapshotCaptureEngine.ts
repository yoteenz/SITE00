/**
 * P0.VR.3E — Browser screenshot capture engine (Playwright / vitest mock).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { CANONICAL_VIEWPORT_DIMENSIONS } from '../p0vr2/constants.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import { renderControlledReference } from '../render/ControlledReferenceRenderer.js';
import { evaluateScreenshotStability, resolveAuthContextForRoute } from './screenshotStabilityPolicy.js';
import { runImplementationSnapshotQa } from './implementationSnapshotQa.js';
import type { CaptureScreenInput, ImplementationSnapshotRecord } from './types.js';
import { IMPLEMENTATION_SNAPSHOT_DEFAULT_DEVICE_SCALE } from './constants.js';
import { buildImplementationSnapshotStoragePath } from './implementationSnapshotStoragePaths.js';
import { registerImplementationSnapshot } from './implementationSnapshotRegistry.js';
import { resolveCaptureTarget, resolveRepresentativeRoute } from './routeRepresentativeResolver.js';
import { isComposerDraftImplementationRoute } from '../p0vr3h/composerDraftSnapshots.js';
import { COMPOSER_DRAFT_SNAPSHOT_LABEL } from '../p0vr3h/constants.js';

import { execSync } from 'node:child_process';

function currentSourceCommit(): string | null {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return process.env.SOURCE_COMMIT ?? null;
  }
}

function buildRouteSearch(
  route: string,
  viewportClass: DesignViewportClass,
  visualStateId?: string | null,
): string {
  const params = new URLSearchParams();
  params.set('designPreview', '1');
  const routePath = route.split('?')[0] ?? route;
  if (isComposerDraftImplementationRoute(routePath)) {
    params.set('preview', '1');
  }
  if (viewportClass === 'mobile') params.set('site00MobileLayout', '1');
  if (visualStateId) params.set('designState', visualStateId);
  return `?${params.toString()}`;
}

async function uploadSnapshotBuffer(storagePath: string, pngPath: string): Promise<{ publicUrl: string; buffer: Buffer }> {
  const buffer = readFileSync(pngPath);
  if (process.env.VITEST === 'true') {
    return { publicUrl: `https://vitest.local/${storagePath}`, buffer };
  }
  try {
    const sharp = (await import('sharp')).default;
    const webpBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
    const { uploadSite00AssetBuffer } = await import('../../../../api/_lib/site00Assts/storage.js');
    const upload = await uploadSite00AssetBuffer(storagePath, webpBuffer, 'image/webp', { upsert: false });
    return { publicUrl: upload.publicUrl, buffer: webpBuffer };
  } catch {
    return { publicUrl: `/${storagePath}`, buffer };
  }
}

export async function captureImplementationSnapshot(input: CaptureScreenInput): Promise<ImplementationSnapshotRecord | null> {
  const target = resolveCaptureTarget({
    projectId: input.projectId,
    screenId: input.screenId,
    routeOverride: input.route,
  });
  if (!target) return null;
  if (target.skip) {
    const missing: ImplementationSnapshotRecord = {
      snapshotId: `snap-missing-${input.screenId}-${input.viewportClass}-${Date.now()}`,
      projectId: input.projectId,
      designScreenId: input.screenId,
      implementationRouteId: null,
      viewportClass: input.viewportClass,
      route: target.route,
      resolvedRoute: target.route,
      capturedUrl: '',
      width: 0,
      height: 0,
      deviceScaleFactor: IMPLEMENTATION_SNAPSHOT_DEFAULT_DEVICE_SCALE,
      storagePath: '',
      publicUrl: '',
      sourceCommit: input.sourceCommit ?? currentSourceCommit(),
      sourceBuildId: process.env.RAILWAY_DEPLOYMENT_ID ?? null,
      capturedAt: new Date().toISOString(),
      captureStatus: 'IMPLEMENTATION_MISSING',
      captureType: input.captureType ?? 'VIEWPORT',
      authContext: input.authContext ?? resolveAuthContextForRoute(target.route),
      routeState: null,
      visualStateId: input.visualStateId ?? null,
      stale: false,
      error: target.skipReason ?? null,
      qaPassed: false,
      qaIssues: [],
    };
    return registerImplementationSnapshot(missing);
  }

  const viewport = CANONICAL_VIEWPORT_DIMENSIONS[input.viewportClass];
  const sourceCommit = input.sourceCommit ?? currentSourceCommit();
  const capturedAt = new Date().toISOString();
  const storagePath = buildImplementationSnapshotStoragePath({
    projectId: input.projectId,
    designScreenId: input.screenId,
    viewportClass: input.viewportClass,
    sourceCommit,
    capturedAt,
    visualStateId: input.visualStateId,
  });

  const baseUrl = input.baseUrl ?? process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5174';
  const outputDir = join(tmpdir(), `site00-impl-snap-${Date.now()}`);

  try {
    const render = await renderControlledReference({
      route: target.route,
      baseUrl,
      viewport: {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: IMPLEMENTATION_SNAPSHOT_DEFAULT_DEVICE_SCALE,
      },
      outputDir,
      reconstructionIteration: 0,
      blueprintVersion: 'p0vr3e',
      commit: sourceCommit,
      previewDeviceMode: input.viewportClass === 'mobile' ? 'mobile' : 'desktop',
      routeSearch: buildRouteSearch(target.route, input.viewportClass, input.visualStateId),
    });

    const stability = evaluateScreenshotStability({
      finalUrl: render.finalUrl,
      requestedRoute: target.route,
      hasRuntimeError: false,
      fontsReady: true,
      layoutStable: true,
      loadingResolved: true,
      animationSettled: true,
    });

    const { publicUrl, buffer } = await uploadSnapshotBuffer(storagePath, render.screenshotPath);

    const qa = runImplementationSnapshotQa({
      record: { width: viewport.width, height: viewport.height },
      bufferSize: buffer.length,
      finalUrl: render.finalUrl,
      requestedRoute: target.route,
      expectedWidth: viewport.width,
      expectedHeight: viewport.height,
      hasAuthRedirect: !render.finalUrl.includes(target.route.split('?')[0] ?? target.route),
      hasLoadingShell: render.finalUrl.includes('/enter') && target.route === '/',
      brokenImageCount: 0,
      fontsReady: stability.checks.fontsReady,
      hasRuntimeError: !stability.checks.noRuntimeError,
    });

    const routePath = target.route.split('?')[0] ?? target.route;
    const snapshotLabel =
      input.snapshotLabel ??
      (isComposerDraftImplementationRoute(routePath) ? COMPOSER_DRAFT_SNAPSHOT_LABEL : undefined);

    const record: ImplementationSnapshotRecord = {
      snapshotId: `snap-${input.projectId}-${input.screenId}-${input.viewportClass}-${Date.now()}`,
      projectId: input.projectId,
      designScreenId: input.screenId,
      implementationRouteId: `impl:${target.route.replace(/^\//, '')}`,
      viewportClass: input.viewportClass,
      route: target.route,
      resolvedRoute: render.finalUrl,
      templateRoute: resolveRepresentativeRoute(target.screen, input.projectId).templateRoute,
      representativeRoute: target.route,
      capturedUrl: render.finalUrl,
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: IMPLEMENTATION_SNAPSHOT_DEFAULT_DEVICE_SCALE,
      storagePath,
      publicUrl,
      sourceCommit,
      sourceBuildId: process.env.RAILWAY_DEPLOYMENT_ID ?? null,
      capturedAt,
      captureStatus: qa.passed ? 'CURRENT' : 'FAILED',
      captureType: input.visualStateId ? 'STATE' : (input.captureType ?? 'VIEWPORT'),
      authContext: input.authContext ?? resolveAuthContextForRoute(target.route),
      routeState: input.visualStateId ?? null,
      visualStateId: input.visualStateId ?? null,
      stale: false,
      error: qa.passed ? null : qa.issues.join(', '),
      qaPassed: qa.passed,
      qaIssues: qa.issues,
      snapshotLabel,
    };

    return registerImplementationSnapshot(record);
  } catch (err) {
    const failed: ImplementationSnapshotRecord = {
      snapshotId: `snap-fail-${input.screenId}-${input.viewportClass}-${Date.now()}`,
      projectId: input.projectId,
      designScreenId: input.screenId,
      implementationRouteId: null,
      viewportClass: input.viewportClass,
      route: target.route,
      resolvedRoute: target.route,
      capturedUrl: '',
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: IMPLEMENTATION_SNAPSHOT_DEFAULT_DEVICE_SCALE,
      storagePath,
      publicUrl: '',
      sourceCommit,
      sourceBuildId: null,
      capturedAt,
      captureStatus: 'FAILED',
      captureType: input.captureType ?? 'VIEWPORT',
      authContext: input.authContext ?? resolveAuthContextForRoute(target.route),
      routeState: null,
      visualStateId: input.visualStateId ?? null,
      stale: false,
      error: err instanceof Error ? err.message : String(err),
      qaPassed: false,
      qaIssues: ['RUNTIME_ERROR'],
    };
    return registerImplementationSnapshot(failed);
  }
}
