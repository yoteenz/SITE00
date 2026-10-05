/**
 * P0.VR.OPUS-NATIVE2 — Phase 4: the agent targets what the founder is looking at.
 */

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import type { OpusNativeTargetRef } from '../../../../../shared/site00-opus-native/contracts';
import type { OpusNativeViewport } from '../../../../../shared/site00-opus-native/types';
import { readDesignPageTarget } from '../production/designProductionPageTarget';
import { fetchSurfaces } from '../opusNative/opusNativeClient';
import {
  readDesignAgentViewMode,
  readDesignAgentViewport,
} from './designAgentSessionPrefs';
import { resolveDesignAgentSurfaceMatch } from './resolveDesignAgentSurface';

export interface DesignAgentTarget {
  target: OpusNativeTargetRef;
  pageId: string | null;
  pageLabel: string | null;
  route: string;
  projectSlug: string;
  registered: boolean | null;
  registryError: string | null;
  standingWriteMode: string | null;
  firewallReason: string | null;
  goldenVersion: string | null;
}

function resolveProjectSlugFromRoute(route: string, paramSlug: string | undefined): string {
  const fromParam = paramSlug?.trim().toLowerCase();
  if (fromParam) return fromParam;
  const moduleMatch = route.match(/^\/projects\/design\/([^/]+)/);
  if (moduleMatch?.[1]) return moduleMatch[1].toLowerCase();
  const legacyMatch = route.match(/^\/projects\/([^/]+)\/design/);
  if (legacyMatch?.[1]) return legacyMatch[1].toLowerCase();
  return 'ndxbook';
}

export function useDesignAgentTarget(): DesignAgentTarget {
  const location = useLocation();
  const params = useParams<{ projectSlug?: string }>();
  const projectSlug = resolveProjectSlugFromRoute(location.pathname, params.projectSlug);
  const [surfaces, setSurfaces] = useState<Awaited<ReturnType<typeof fetchSurfaces>>['surfaces'] | null>(null);
  const [viewport, setViewport] = useState<OpusNativeViewport>(() => readDesignAgentViewport());
  const [viewMode, setViewMode] = useState<string>(() => readDesignAgentViewMode());
  const [pageRevision, setPageRevision] = useState(0);
  const [registryError, setRegistryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSurfaces()
      .then((response) => {
        if (cancelled) return;
        setSurfaces(response.surfaces);
        setRegistryError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setSurfaces([]);
        setRegistryError(error instanceof Error ? error.message : 'surface registry unreachable');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const refreshPresentation = () => {
      setViewport(readDesignAgentViewport());
      setViewMode(readDesignAgentViewMode());
      setPageRevision((n) => n + 1);
    };
    const onResize = () => {
      if (!window.sessionStorage.getItem('site00:twin-opus-direct:viewport:v1')) {
        setViewport(readDesignAgentViewport());
      }
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('storage', refreshPresentation);
    window.addEventListener('site00:design-viewport', refreshPresentation);
    window.addEventListener('site00:design-page-target', refreshPresentation);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('storage', refreshPresentation);
      window.removeEventListener('site00:design-viewport', refreshPresentation);
      window.removeEventListener('site00:design-page-target', refreshPresentation);
    };
  }, []);

  return useMemo(() => {
    const route = location.pathname;
    const surfaceMatch = surfaces ? resolveDesignAgentSurfaceMatch(route, surfaces) : null;
    const pageTarget = readDesignPageTarget(projectSlug);
    const activePageId = pageTarget?.pageId ?? surfaceMatch?.pageId ?? null;
    const pageLabel = pageTarget?.pageLabel ?? null;

    return {
      route,
      projectSlug,
      pageId: activePageId,
      pageLabel,
      registered: surfaces === null ? null : Boolean(surfaceMatch),
      registryError,
      standingWriteMode: surfaceMatch?.standingWriteMode ?? null,
      firewallReason: surfaceMatch?.writeFirewallReason ?? null,
      goldenVersion: surfaceMatch?.goldenReferenceVersion ?? null,
      target: {
        projectSlug,
        route,
        pageId: activePageId ?? undefined,
        viewport,
        viewMode,
      },
    };
  }, [location.pathname, pageRevision, projectSlug, surfaces, viewport, viewMode, registryError]);
}
