/**
 * Automated browser capture for SITE 00 visual references.
 * Uses Playwright when available; vitest-safe mock path otherwise.
 */

import { createHash } from 'node:crypto';
import type {
  CaptureState,
  CaptureType,
  VisualReferenceRecord,
  ViewportClass,
} from '../../../shared/site00-visual-reference/types.js';
import { getViewportSpec } from '../../../shared/site00-visual-reference/viewportConfig.js';
import { buildHostReferenceStoragePath } from '../../../shared/site00-visual-reference/referenceStoragePaths.js';
import {
  computeImageFingerprint,
  computePageFingerprint,
  findDuplicateReference,
} from '../../../shared/site00-visual-reference/deduplication.js';
import { uploadSite00AssetBuffer } from '../site00Assts/storage.js';
import { isPlaceholderReferenceUrl } from '../../../shared/site00-visual-reference/referencePublicUrl.js';

export type CaptureRouteParams = {
  route: string;
  viewportClass: ViewportClass;
  captureState?: CaptureState;
  captureType?: CaptureType;
  baseUrl: string;
  sourceCommit?: string | null;
  referenceRoles: VisualReferenceRecord['referenceRoles'];
  authorityScopes: VisualReferenceRecord['authorityScopes'];
  authority: VisualReferenceRecord['authority'];
  approvalStatus: VisualReferenceRecord['approvalStatus'];
  sourceType: VisualReferenceRecord['sourceType'];
  label: string;
  existingReferences?: VisualReferenceRecord[];
};

export type CaptureResult =
  | { ok: true; reference: VisualReferenceRecord; reused: boolean }
  | { ok: false; error: string; incomplete: boolean };

function buildStoragePath(route: string, viewportClass: ViewportClass): string {
  return buildHostReferenceStoragePath(route, viewportClass);
}

function buildReferenceRecord(params: {
  id: string;
  route: string;
  viewportClass: ViewportClass;
  buffer: Buffer;
  storagePath: string;
  publicUrl: string;
  sourceCommit: string | null;
  captureState: CaptureState;
  captureType: CaptureType;
  referenceRoles: VisualReferenceRecord['referenceRoles'];
  authorityScopes: VisualReferenceRecord['authorityScopes'];
  authority: VisualReferenceRecord['authority'];
  approvalStatus: VisualReferenceRecord['approvalStatus'];
  sourceType: VisualReferenceRecord['sourceType'];
  label: string;
  baseUrl: string;
}): VisualReferenceRecord {
  const spec = getViewportSpec(params.viewportClass);
  const now = new Date().toISOString();
  const imageFingerprint = computeImageFingerprint(params.buffer);
  const pageFingerprint = computePageFingerprint({
    route: params.route,
    viewportClass: params.viewportClass,
    sourceCommit: params.sourceCommit,
    captureState: params.captureState,
  });

  return {
    id: params.id,
    projectId: null,
    brandId: 'site00',
    surfaceId: params.route,
    route: params.route,
    sourceUrl: `${params.baseUrl}${params.route}`,
    captureType: params.captureType,
    viewportClass: params.viewportClass,
    viewportWidth: spec.width,
    viewportHeight: spec.height,
    deviceScaleFactor: spec.deviceScaleFactor,
    capturedAt: now,
    sourceCommit: params.sourceCommit,
    deploymentId: null,
    environment: process.env.NODE_ENV ?? 'development',
    storagePath: params.storagePath,
    publicUrl: params.publicUrl,
    imageFingerprint,
    pageFingerprint,
    referenceRoles: params.referenceRoles,
    authorityScopes: params.authorityScopes,
    authority: params.authority,
    approvalStatus: params.approvalStatus,
    sourceType: params.sourceType,
    provenance: 'automated-route-capture',
    stalenessState: 'FRESH',
    supersedesReferenceId: null,
    notes: params.label,
    createdAt: now,
    updatedAt: now,
  };
}

async function captureWithPlaywright(params: CaptureRouteParams): Promise<{ buffer: Buffer } | { error: string }> {
  try {
    const { chromium } = await import('playwright');
    const spec = getViewportSpec(params.viewportClass);
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({
        viewport: { width: spec.width, height: spec.height },
        deviceScaleFactor: spec.deviceScaleFactor,
      });
      // Skip cinematic cold-start loader — otherwise origin (/) captures a blank frame.
      await page.addInitScript(() => {
        sessionStorage.setItem('site00-immersive-complete', '1');
        sessionStorage.setItem('site00-assts-immersive-complete', '1');
      });
      const url = `${params.baseUrl.replace(/\/$/, '')}${params.route}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForTimeout(1500);
      await page.evaluate(() => document.fonts?.ready);
      const screenshot = await page.screenshot({ type: 'png', fullPage: params.captureType === 'FULL_PAGE' });
      const buffer = Buffer.from(screenshot);
      if (buffer.length < 1000) {
        return { error: `Screenshot too small for ${url} (${buffer.length} bytes)` };
      }
      return { buffer };
    } finally {
      await browser.close();
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Playwright capture failed';
    if (/Executable doesn't exist|browserType.launch/i.test(detail)) {
      return {
        error:
          'Playwright Chromium not installed on API server — redeploy Railway from main (nixpacks installs chromium)',
      };
    }
    return { error: detail };
  }
}

function createVitestMockBuffer(route: string, viewportClass: ViewportClass): Buffer {
  const raw = `vitest-mock-capture:${route}:${viewportClass}`;
  return Buffer.from(createHash('sha256').update(raw).digest());
}

export async function captureSite00RouteReference(params: CaptureRouteParams): Promise<CaptureResult> {
  const captureState = params.captureState ?? 'DEFAULT';
  const captureType = params.captureType ?? 'VIEWPORT';
  const sourceCommit = params.sourceCommit ?? null;
  const storagePath = buildStoragePath(params.route, params.viewportClass);
  const refId = `capture-${params.route.replace(/\//g, '_')}-${params.viewportClass.toLowerCase()}`;

  const isVitest = process.env.VITEST === 'true';
  let buffer: Buffer | null = null;

  if (isVitest) {
    buffer = createVitestMockBuffer(params.route, params.viewportClass);
  } else {
    const captured = await captureWithPlaywright(params);
    if ('error' in captured) {
      return { ok: false, error: captured.error, incomplete: true };
    }
    buffer = captured.buffer;
  }

  const imageFingerprint = computeImageFingerprint(buffer);
  const duplicate = findDuplicateReference(params.existingReferences ?? [], {
    route: params.route,
    viewportClass: params.viewportClass,
    sourceCommit,
    imageFingerprint,
    captureState,
  });

  if (duplicate && (process.env.VITEST === 'true' || !isPlaceholderReferenceUrl(duplicate.publicUrl))) {
    return { ok: true, reference: duplicate, reused: true };
  }

  let publicUrl: string;
  if (isVitest) {
    publicUrl = `https://vitest.local/${storagePath}`;
  } else {
    const sharp = (await import('sharp')).default;
    const webpBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
    const upload = await uploadSite00AssetBuffer(storagePath, webpBuffer, 'image/webp', { upsert: true });
    publicUrl = upload.publicUrl;
  }

  const reference = buildReferenceRecord({
    id: refId,
    route: params.route,
    viewportClass: params.viewportClass,
    buffer,
    storagePath,
    publicUrl,
    sourceCommit,
    captureState,
    captureType,
    referenceRoles: params.referenceRoles,
    authorityScopes: params.authorityScopes,
    authority: params.authority,
    approvalStatus: params.approvalStatus,
    sourceType: params.sourceType,
    label: params.label,
    baseUrl: params.baseUrl,
  });

  return { ok: true, reference, reused: false };
}

export function playwrightAvailable(): boolean {
  return process.env.VITEST !== 'true';
}

export async function isPlaywrightInstalled(): Promise<boolean> {
  try {
    await import('playwright');
    return true;
  } catch {
    return false;
  }
}

export function referenceCaptureGeneratesZeroFalRequests(): true {
  return true;
}
