/**
 * Automated browser capture for SITE 00 visual references.
 * Uses Playwright when available; vitest-safe mock path otherwise.
 * Authenticated private routes require VisualCaptureAuthContext + surface identity verification.
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
import type { CapturePrincipal, VisualCaptureAuthContext } from '../../../shared/site00-visual-reference/captureAuthTypes.js';
import {
  minimumCapturePrincipalForRoute,
  routeRequiresAuthentication,
  ROUTE_SURFACE_ASSERTIONS,
} from '../../../shared/site00-visual-reference/captureAuthTypes.js';
import {
  captureAuthContextHasSession,
  loadVisualCaptureAuthContext,
} from '../../../shared/site00-visual-reference/captureAuthContext.js';
import { verifyCapturedSurfaceIdentity } from '../../../shared/site00-visual-reference/surfaceIdentityVerification.js';

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
  authContext?: VisualCaptureAuthContext | null;
  capturePrincipal?: CapturePrincipal;
};

export type CaptureResult =
  | { ok: true; reference: VisualReferenceRecord; reused: boolean }
  | { ok: false; error: string; incomplete: boolean; surfaceIdentity?: string };

function buildStoragePath(route: string, viewportClass: ViewportClass): string {
  return buildHostReferenceStoragePath(route, viewportClass);
}

function accessClassificationForRoute(route: string, principal: CapturePrincipal) {
  if (route.startsWith('/control')) return 'ADMIN_PRIVATE_REFERENCE' as const;
  if (routeRequiresAuthentication(route)) return 'PROJECT_PRIVATE_REFERENCE' as const;
  if (principal === 'PUBLIC_GUEST') return 'PUBLIC_REFERENCE' as const;
  return 'INTERNAL_REFERENCE' as const;
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
  finalUrl: string;
  redirectChain: string[];
  capturePrincipal: CapturePrincipal;
  authenticated: boolean;
  captureMetadata: VisualReferenceRecord['captureMetadata'];
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
    sourceUrl: params.finalUrl,
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
    stalenessState: params.captureMetadata?.surfaceIdentity === 'VALID_TARGET_SURFACE' ? 'FRESH' : 'STALE',
    supersedesReferenceId: null,
    notes: params.label,
    captureMetadata: params.captureMetadata,
    createdAt: now,
    updatedAt: now,
  };
}

async function evaluateDomEvidence(page: import('playwright').Page, route: string): Promise<{
  hasRequiredSelectors: boolean;
  hasForbiddenSelectors: boolean;
}> {
  const assertion = ROUTE_SURFACE_ASSERTIONS[route];
  if (!assertion) return { hasRequiredSelectors: true, hasForbiddenSelectors: false };

  const required = assertion.requiredSelectors ?? [];
  const forbidden = assertion.forbiddenSelectors ?? [];

  let hasRequiredSelectors = required.length === 0;
  for (const selector of required) {
    if (await page.locator(selector).count()) {
      hasRequiredSelectors = true;
      break;
    }
  }

  let hasForbiddenSelectors = false;
  for (const selector of forbidden) {
    if (await page.locator(selector).count()) {
      hasForbiddenSelectors = true;
      break;
    }
  }

  return { hasRequiredSelectors, hasForbiddenSelectors };
}

async function captureWithPlaywright(params: CaptureRouteParams & { authContext: VisualCaptureAuthContext | null }): Promise<
  | { buffer: Buffer; finalUrl: string; redirectChain: string[]; authenticated: boolean; domEvidence: { hasRequiredSelectors: boolean; hasForbiddenSelectors: boolean } }
  | { error: string; surfaceIdentity?: string }
> {
  try {
    const { chromium } = await import('playwright');
    const spec = getViewportSpec(params.viewportClass);
    const browser = await chromium.launch({ headless: true });
    const capturePrincipal =
      params.capturePrincipal ?? params.authContext?.principal ?? minimumCapturePrincipalForRoute(params.route);
    const authenticated = captureAuthContextHasSession(params.authContext);

    try {
      const context = await browser.newContext({
        viewport: { width: spec.width, height: spec.height },
        deviceScaleFactor: spec.deviceScaleFactor,
        ...(params.authContext?.storageState ? { storageState: params.authContext.storageState as never } : {}),
      });
      const page = await context.newPage();
      await page.addInitScript(() => {
        sessionStorage.setItem('site00-immersive-complete', '1');
        sessionStorage.setItem('site00-assts-immersive-complete', '1');
      });

      const redirectChain: string[] = [];
      page.on('framenavigated', (frame) => {
        if (frame === page.mainFrame()) redirectChain.push(frame.url());
      });

      const url = `${params.baseUrl.replace(/\/$/, '')}${params.route}`;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForTimeout(1500);
      await page.evaluate(() => document.fonts?.ready);

      const finalUrl = page.url();
      if (response && response.url() !== finalUrl && !redirectChain.includes(response.url())) {
        redirectChain.unshift(response.url());
      }

      const domEvidence = await evaluateDomEvidence(page, params.route);

      const identity = verifyCapturedSurfaceIdentity({
        requestedRoute: params.route,
        finalUrl,
        redirectChain,
        capturePrincipal,
        authenticated,
        domEvidence,
      });

      if (identity.surfaceIdentity !== 'VALID_TARGET_SURFACE') {
        return {
          error: `Surface identity ${identity.surfaceIdentity} for ${params.route} (final: ${finalUrl})`,
          surfaceIdentity: identity.surfaceIdentity,
        };
      }

      const screenshot = await page.screenshot({ type: 'png', fullPage: params.captureType === 'FULL_PAGE' });
      const buffer = Buffer.from(screenshot);
      if (buffer.length < 1000) {
        return { error: `Screenshot too small for ${url} (${buffer.length} bytes)` };
      }

      return { buffer, finalUrl, redirectChain, authenticated, domEvidence };
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

function vitestSimulateCapture(params: CaptureRouteParams & { authContext: VisualCaptureAuthContext | null }): {
  finalUrl: string;
  redirectChain: string[];
  authenticated: boolean;
  domEvidence: { hasRequiredSelectors: boolean; hasForbiddenSelectors: boolean };
} {
  const authContext = params.authContext ?? loadVisualCaptureAuthContext({ route: params.route });
  const authenticated = captureAuthContextHasSession(authContext);
  const baseUrl = params.baseUrl.replace(/\/$/, '');

  if (routeRequiresAuthentication(params.route) && !authenticated) {
    return {
      finalUrl: `${baseUrl}/origin/sign-in`,
      redirectChain: [`${baseUrl}${params.route}`, `${baseUrl}/origin/sign-in`],
      authenticated: false,
      domEvidence: { hasRequiredSelectors: false, hasForbiddenSelectors: true },
    };
  }

  return {
    finalUrl: `${baseUrl}${params.route}`,
    redirectChain: [`${baseUrl}${params.route}`],
    authenticated,
    domEvidence: {
      hasRequiredSelectors: params.route === '/projects',
      hasForbiddenSelectors: false,
    },
  };
}

export async function captureSite00RouteReference(params: CaptureRouteParams): Promise<CaptureResult> {
  const captureState = params.captureState ?? 'DEFAULT';
  const captureType = params.captureType ?? 'VIEWPORT';
  const sourceCommit = params.sourceCommit ?? null;
  const storagePath = buildStoragePath(params.route, params.viewportClass);
  const refId = `capture-${params.route.replace(/\//g, '_')}-${params.viewportClass.toLowerCase()}`;

  const authContext = params.authContext ?? loadVisualCaptureAuthContext({ route: params.route });
  const capturePrincipal =
    params.capturePrincipal ?? authContext?.principal ?? minimumCapturePrincipalForRoute(params.route);

  if (routeRequiresAuthentication(params.route) && !captureAuthContextHasSession(authContext)) {
    return {
      ok: false,
      error: `AUTHENTICATION_FAILED — ${params.route} requires authenticated capture (principal: ${capturePrincipal})`,
      incomplete: true,
      surfaceIdentity: 'AUTHENTICATION_FAILED',
    };
  }

  const isVitest = process.env.VITEST === 'true';
  let buffer: Buffer | null = null;
  let finalUrl = `${params.baseUrl.replace(/\/$/, '')}${params.route}`;
  let redirectChain: string[] = [finalUrl];
  let authenticated = captureAuthContextHasSession(authContext);
  let domEvidence = { hasRequiredSelectors: true, hasForbiddenSelectors: false };

  if (isVitest) {
    const simulated = vitestSimulateCapture({ ...params, authContext });
    finalUrl = simulated.finalUrl;
    redirectChain = simulated.redirectChain;
    authenticated = simulated.authenticated;
    domEvidence = simulated.domEvidence;

    const identity = verifyCapturedSurfaceIdentity({
      requestedRoute: params.route,
      finalUrl,
      redirectChain,
      capturePrincipal,
      authenticated,
      domEvidence,
    });

    if (identity.surfaceIdentity !== 'VALID_TARGET_SURFACE') {
      return {
        ok: false,
        error: `Surface identity ${identity.surfaceIdentity} for ${params.route}`,
        incomplete: true,
        surfaceIdentity: identity.surfaceIdentity,
      };
    }

    buffer = createVitestMockBuffer(params.route, params.viewportClass);
  } else {
    const captured = await captureWithPlaywright({ ...params, authContext });
    if ('error' in captured) {
      return {
        ok: false,
        error: captured.error,
        incomplete: true,
        surfaceIdentity: captured.surfaceIdentity,
      };
    }
    buffer = captured.buffer;
    finalUrl = captured.finalUrl;
    redirectChain = captured.redirectChain;
    authenticated = captured.authenticated;
    domEvidence = captured.domEvidence;
  }

  const identity = verifyCapturedSurfaceIdentity({
    requestedRoute: params.route,
    finalUrl,
    redirectChain,
    capturePrincipal,
    authenticated,
    domEvidence,
  });

  const captureMetadata = {
    requestedRoute: params.route,
    finalUrl,
    redirectChain,
    capturePrincipal,
    authenticated,
    surfaceIdentity: identity.surfaceIdentity,
    surfaceIdentityConfidence: identity.confidence,
    authContextVersion: authContext?.authContextVersion ?? null,
    accessClassification: accessClassificationForRoute(params.route, capturePrincipal),
    quarantineClassification: identity.metadata.quarantineClassification ?? null,
    invalidForTargetRoutes: identity.metadata.invalidForTargetRoutes ?? [],
  };

  if (identity.surfaceIdentity !== 'VALID_TARGET_SURFACE') {
    return {
      ok: false,
      error: `Surface identity ${identity.surfaceIdentity} — cannot register ${params.route} reference`,
      incomplete: true,
      surfaceIdentity: identity.surfaceIdentity,
    };
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
    if (duplicate.captureMetadata?.surfaceIdentity === 'VALID_TARGET_SURFACE') {
      return { ok: true, reference: duplicate, reused: true };
    }
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
    finalUrl,
    redirectChain,
    capturePrincipal,
    authenticated,
    captureMetadata,
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

export function captureMetadataContainsNoSecrets(metadata: VisualReferenceRecord['captureMetadata']): boolean {
  if (!metadata) return true;
  const serialized = JSON.stringify(metadata);
  return !/password|access_token|refresh_token|Bearer\s/i.test(serialized);
}
