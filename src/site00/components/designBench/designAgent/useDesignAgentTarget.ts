/**
 * P0.VR.OPUS-NATIVE2 — Phase 4: the agent targets what the founder is looking at.
 *
 * The NATIVE1 panel made the founder type a route. That is acceptable on a
 * laboratory page and absurd inside the workspace: the founder is already
 * standing on the page, and the route, project, view mode and viewport are all
 * on screen. Requiring them to be restated is how a native surface ends up
 * feeling worse than a chat window.
 *
 * The target is derived from the router, the registry and the presentation
 * state the DESIGN shell already persists, and it recomputes when any of them
 * change — so switching view mode or viewport retargets the agent without a
 * second thought from the founder.
 */

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import type { OpusNativeTargetRef } from '../../../../../shared/site00-opus-native/contracts';
import type { OpusNativeViewport } from '../../../../../shared/site00-opus-native/types';
import { fetchSurfaces } from '../opusNative/opusNativeClient';

export interface DesignAgentTarget {
  target: OpusNativeTargetRef;
  pageId: string | null;
  route: string;
  projectSlug: string;
  /** Null while the registry is loading, false when this route is unregistered. */
  registered: boolean | null;
  standingWriteMode: string | null;
  firewallReason: string | null;
  goldenVersion: string | null;
}

/** Matches a concrete route against a registry pattern containing :params. */
function routeMatches(pattern: string, actual: string): boolean {
  const expression = pattern.replace(/:[A-Za-z]+/g, '[^/]+').replace(/\/+$/, '');
  return new RegExp(`^${expression}$`).test(actual.replace(/\/+$/, ''));
}

/**
 * The DESIGN shell keeps presentation preferences in sessionStorage rather
 * than the URL, so they are read from there rather than re-plumbed through
 * props from a component the dock does not own.
 */
function readViewMode(): string {
  try {
    return window.sessionStorage.getItem('site00:twin-opus-direct:view-mode:v1') ?? 'canonical';
  } catch {
    return 'canonical';
  }
}

function readViewport(): OpusNativeViewport {
  if (typeof window === 'undefined') return 'MOBILE';
  const width = window.innerWidth;
  if (width >= 1200) return 'DESKTOP';
  if (width >= 820) return 'TABLET';
  return 'MOBILE';
}

export function useDesignAgentTarget(): DesignAgentTarget {
  const location = useLocation();
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const [surfaces, setSurfaces] = useState<Awaited<ReturnType<typeof fetchSurfaces>>['surfaces'] | null>(null);
  const [viewport, setViewport] = useState<OpusNativeViewport>(() => readViewport());
  const [viewMode, setViewMode] = useState<string>(() => readViewMode());

  useEffect(() => {
    let cancelled = false;
    fetchSurfaces()
      .then((response) => {
        if (!cancelled) setSurfaces(response.surfaces);
      })
      .catch(() => {
        // An unreachable registry means the dock renders as unavailable
        // rather than as an unregistered page, which would be a lie.
        if (!cancelled) setSurfaces([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onResize = () => setViewport(readViewport());
    const onStorage = () => setViewMode(readViewMode());
    window.addEventListener('resize', onResize);
    window.addEventListener('storage', onStorage);
    // The shell writes view mode in the same tab, where `storage` does not
    // fire, so the value is also re-read whenever the dock is interacted with.
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return useMemo(() => {
    const route = location.pathname;
    const match = surfaces?.find((surface) => routeMatches(surface.route, route)) ?? null;
    return {
      route,
      projectSlug,
      pageId: match?.pageId ?? null,
      registered: surfaces === null ? null : Boolean(match),
      standingWriteMode: match?.standingWriteMode ?? null,
      firewallReason: match?.writeFirewallReason ?? null,
      goldenVersion: match?.goldenReferenceVersion ?? null,
      target: {
        projectSlug,
        route,
        pageId: match?.pageId,
        viewport,
        viewMode,
      },
    };
  }, [location.pathname, projectSlug, surfaces, viewport, viewMode]);
}
