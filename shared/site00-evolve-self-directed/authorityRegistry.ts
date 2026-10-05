/**
 * P0.VR.6R9 — Registered screen authorities for Evolve service + self-directed client product.
 * Reuses existing reference assets; does not create duplicates.
 */

import type { EvolveSelfDirectedScreenId, EvolveSelfDirectedViewport, ScreenAuthorityRecord } from './types.js';

const REGISTERED_AT = '2026-09-09T00:00:00.000Z';

/** Reference asset paths relative to project assets folder. */
const AUTHORITY_ASSETS: Record<
  EvolveSelfDirectedScreenId,
  { mobile: string; desktop: string; mobileRoute: string; desktopRoute: string }
> = {
  EVOLVE_SERVICE: {
    mobile: 'assets/01a08737-5455-7d03-8b94-71a7f7f01b73.jpg',
    desktop: 'assets/01a08737-5463-72b8-a2f6-3c0a45f40dd2.jpg',
    mobileRoute: '/evolve',
    desktopRoute: '/evolve/desktop',
  },
  HOME: {
    mobile: 'assets/01a08737-5472-795d-b9e2-43254635b8a9.jpg',
    desktop: 'assets/01a08737-54a3-70d7-aa28-e43282972110.jpg',
    mobileRoute: '/app/projects/:slug',
    desktopRoute: '/app/projects/:slug/desktop',
  },
  PROJECTS: {
    mobile: 'assets/01a08737-5480-7d2d-a380-cb9022cc1b09.jpg',
    desktop: 'assets/01a08737-54b0-7f53-9b64-6dcd81579129.jpg',
    mobileRoute: '/app/projects/:slug/projects',
    desktopRoute: '/app/projects/:slug/projects/desktop',
  },
  REVIEWS: {
    mobile: 'assets/01a08737-54bb-7282-b984-8ed711aedd47.jpg',
    desktop: 'assets/01a08737-54bb-7282-b984-8ed711aedd47.jpg',
    mobileRoute: '/app/projects/:slug/reviews',
    desktopRoute: '/app/projects/:slug/reviews/desktop',
  },
  INBOX: {
    mobile: 'assets/01a08737-54c7-7dfa-a3cc-88e26f086ede.jpg',
    desktop: 'assets/01a08737-54c7-7dfa-a3cc-88e26f086ede.jpg',
    mobileRoute: '/app/projects/:slug/inbox',
    desktopRoute: '/app/projects/:slug/inbox/desktop',
  },
  PROFILE: {
    mobile: 'assets/01a08737-5497-72af-a3fa-a7127dd41dd0.jpg',
    desktop: 'assets/01a08737-54c7-7dfa-a3cc-88e26f086ede.jpg',
    mobileRoute: '/app/projects/:slug/profile',
    desktopRoute: '/app/projects/:slug/profile/desktop',
  },
};

function authorityId(screenId: EvolveSelfDirectedScreenId, viewport: EvolveSelfDirectedViewport): string {
  return `esa-${screenId.toLowerCase().replace(/_/g, '-')}-${viewport.toLowerCase()}`;
}

const REGISTRY: ScreenAuthorityRecord[] = (Object.keys(AUTHORITY_ASSETS) as EvolveSelfDirectedScreenId[]).flatMap(
  (screenId) => {
    const cfg = AUTHORITY_ASSETS[screenId];
    return ([
      {
        authorityId: authorityId(screenId, 'MOBILE'),
        screenId,
        viewport: 'MOBILE' as const,
        route: cfg.mobileRoute,
        referenceAssetPath: cfg.mobile,
        registeredAt: REGISTERED_AT,
        fidelityMode: 'EXACT' as const,
      },
      {
        authorityId: authorityId(screenId, 'DESKTOP'),
        screenId,
        viewport: 'DESKTOP' as const,
        route: cfg.desktopRoute,
        referenceAssetPath: cfg.desktop,
        registeredAt: REGISTERED_AT,
        fidelityMode: 'EXACT' as const,
      },
    ] satisfies ScreenAuthorityRecord[]);
  },
);

export function listEvolveSelfDirectedAuthorities(): ScreenAuthorityRecord[] {
  return [...REGISTRY];
}

export function getEvolveSelfDirectedAuthority(
  screenId: EvolveSelfDirectedScreenId,
  viewport: EvolveSelfDirectedViewport,
): ScreenAuthorityRecord | null {
  return REGISTRY.find((a) => a.screenId === screenId && a.viewport === viewport) ?? null;
}

export function countRegisteredAuthorities(): number {
  return REGISTRY.length;
}
