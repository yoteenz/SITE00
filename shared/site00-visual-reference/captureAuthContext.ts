/**
 * Load VisualCaptureAuthContext for authenticated Playwright capture.
 * Never embed raw credentials in prompts, logs, or VisualReferenceRecord metadata.
 */

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import type { CapturePrincipal, VisualCaptureAuthContext } from './captureAuthTypes.js';
import { minimumCapturePrincipalForRoute, routeRequiresAuthentication } from './captureAuthTypes.js';

function hashAuthContextVersion(payload: string): string {
  return createHash('sha256').update(payload).digest('hex').slice(0, 12);
}

export function loadVisualCaptureAuthContext(params: {
  route: string;
  principalOverride?: CapturePrincipal;
}): VisualCaptureAuthContext | null {
  const principal =
    params.principalOverride ??
    (process.env.SITE00_CAPTURE_PRINCIPAL?.trim() as CapturePrincipal | undefined) ??
    minimumCapturePrincipalForRoute(params.route);

  if (!routeRequiresAuthentication(params.route) && principal === 'PUBLIC_GUEST') {
    return {
      contextId: 'public-guest',
      principal: 'PUBLIC_GUEST',
      mechanism: 'UNAUTHENTICATED',
      authContextVersion: 'public-v1',
      projectScope: null,
      tenantScope: null,
    };
  }

  if (process.env.VITEST === 'true') {
    const vitestPrincipal =
      (process.env.VITEST_CAPTURE_PRINCIPAL?.trim() as CapturePrincipal | undefined) ?? 'PUBLIC_GUEST';
    const authenticated = vitestPrincipal !== 'PUBLIC_GUEST';
    return {
      contextId: `vitest-${vitestPrincipal.toLowerCase()}`,
      principal: vitestPrincipal,
      mechanism: 'VITEST_MOCK',
      authContextVersion: hashAuthContextVersion(`vitest:${vitestPrincipal}`),
      projectScope: process.env.VITEST_CAPTURE_PROJECT_SCOPE?.trim() ?? null,
      tenantScope: null,
      storageState: authenticated ? { cookies: [{ name: 'vitest-session' }], origins: [] } : undefined,
    };
  }

  const storageStatePath = process.env.SITE00_CAPTURE_STORAGE_STATE_PATH?.trim();
  const storageStateJson = process.env.SITE00_CAPTURE_STORAGE_STATE_JSON?.trim();

  let storageState: VisualCaptureAuthContext['storageState'];
  if (storageStatePath) {
    try {
      storageState = JSON.parse(readFileSync(storageStatePath, 'utf8')) as VisualCaptureAuthContext['storageState'];
    } catch {
      return null;
    }
  } else if (storageStateJson) {
    try {
      storageState = JSON.parse(storageStateJson) as VisualCaptureAuthContext['storageState'];
    } catch {
      return null;
    }
  } else {
    return null;
  }

  const versionSeed = storageStatePath ?? storageStateJson!.slice(0, 64);
  return {
    contextId: `storage-state-${hashAuthContextVersion(versionSeed)}`,
    principal,
    mechanism: 'STORAGE_STATE',
    authContextVersion: hashAuthContextVersion(versionSeed),
    projectScope: process.env.SITE00_CAPTURE_PROJECT_SCOPE?.trim() ?? null,
    tenantScope: null,
    storageState,
  };
}

export function captureAuthContextHasSession(auth: VisualCaptureAuthContext | null): boolean {
  if (!auth) return false;
  if (auth.mechanism === 'UNAUTHENTICATED') return false;
  if (auth.mechanism === 'VITEST_MOCK') return auth.principal !== 'PUBLIC_GUEST';
  return Boolean(auth.storageState?.cookies?.length || auth.storageState?.origins?.length);
}

export function redactSecretsFromCaptureMetadata(record: Record<string, unknown>): Record<string, unknown> {
  const clone = { ...record };
  delete clone.storageState;
  delete clone.password;
  delete clone.token;
  delete clone.accessToken;
  delete clone.refreshToken;
  return clone;
}
