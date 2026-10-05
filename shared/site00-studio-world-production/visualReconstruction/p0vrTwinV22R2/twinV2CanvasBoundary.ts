import type { TwinV2CanvasBoundary, TwinV2CanvasBoundaryRegion } from './types.js';

function region(
  regionId: string,
  ownership: TwinV2CanvasBoundaryRegion['ownership'],
  label: string,
  boundsNorm: TwinV2CanvasBoundaryRegion['boundsNorm'],
): TwinV2CanvasBoundaryRegion {
  return { regionId, ownership, label, boundsNorm };
}

/** Mobile Twin V2 — host locked vs client creative vs excluded device chrome. */
export function buildNdxbookMobileTwinV2CanvasBoundary(pageId: string): TwinV2CanvasBoundary {
  const hostRegions: TwinV2CanvasBoundaryRegion[] = [
    region('host-global-header', 'HOST_OWNED_LOCKED', 'SITE 00 global top header', { x: 0, y: 0, w: 1, h: 0.07 }),
    region('host-wordmark', 'HOST_OWNED_LOCKED', 'SITE 00 wordmark / host identity', { x: 0, y: 0, w: 0.35, h: 0.07 }),
    region('host-global-controls', 'HOST_OWNED_LOCKED', 'Global system controls', { x: 0.65, y: 0, w: 0.35, h: 0.07 }),
    region('host-account-control', 'HOST_OWNED_LOCKED', 'Account / avatar control', { x: 0.82, y: 0, w: 0.18, h: 0.07 }),
    region('host-notification-control', 'HOST_OWNED_LOCKED', 'Notification control', { x: 0.7, y: 0, w: 0.12, h: 0.07 }),
    region('host-bottom-nav', 'HOST_OWNED_LOCKED', 'Persistent SITE 00 bottom navigation', { x: 0, y: 0.88, w: 1, h: 0.12 }),
    region('host-wayfinding', 'HOST_OWNED_LOCKED', 'Host-level global wayfinding', { x: 0, y: 0.88, w: 1, h: 0.12 }),
    region('host-safe-area', 'HOST_OWNED_LOCKED', 'Host safe-area handling', { x: 0, y: 0, w: 1, h: 1 }),
  ];

  const clientRegions: TwinV2CanvasBoundaryRegion[] = [
    region('client-project-identity', 'CLIENT_OWNED_CREATIVE', 'NDXBOOK project identity', { x: 0.04, y: 0.08, w: 0.92, h: 0.06 }),
    region('client-masthead', 'CLIENT_OWNED_CREATIVE', 'Page-specific masthead', { x: 0.04, y: 0.1, w: 0.92, h: 0.12 }),
    region('client-module-nav', 'CLIENT_OWNED_CREATIVE', 'NDXBOOK section/module navigation', { x: 0.04, y: 0.2, w: 0.92, h: 0.06 }),
    region('client-hero', 'CLIENT_OWNED_CREATIVE', 'Hero band', { x: 0.04, y: 0.26, w: 0.92, h: 0.22 }),
    region('client-progress', 'CLIENT_OWNED_CREATIVE', 'Progress', { x: 0.04, y: 0.48, w: 0.92, h: 0.08 }),
    region('client-metrics', 'CLIENT_OWNED_CREATIVE', 'Metrics', { x: 0.04, y: 0.56, w: 0.92, h: 0.1 }),
    region('client-focus', 'CLIENT_OWNED_CREATIVE', 'Current focus', { x: 0.04, y: 0.66, w: 0.92, h: 0.08 }),
    region('client-milestone', 'CLIENT_OWNED_CREATIVE', 'Milestone', { x: 0.04, y: 0.74, w: 0.92, h: 0.08 }),
    region('client-activity', 'CLIENT_OWNED_CREATIVE', 'Activity', { x: 0.04, y: 0.82, w: 0.92, h: 0.06 }),
  ];

  const sharedRegions: TwinV2CanvasBoundaryRegion[] = [
    region('shared-module-nav-ambiguous', 'SHARED_BOUNDARY', 'NDXBOOK module nav vs global wayfinding (explicit per object)', {
      x: 0.04,
      y: 0.18,
      w: 0.92,
      h: 0.08,
    }),
  ];

  const excludedRegions: TwinV2CanvasBoundaryRegion[] = [
    region('device-bezel', 'DEVICE_CHROME_EXCLUDED', 'iPhone bezel', { x: 0, y: 0, w: 1, h: 1 }),
    region('ios-status-bar', 'DEVICE_CHROME_EXCLUDED', 'iOS status bar', { x: 0, y: 0, w: 1, h: 0.04 }),
    region('safari-toolbar', 'DEVICE_CHROME_EXCLUDED', 'Safari toolbar', { x: 0, y: 0.96, w: 1, h: 0.04 }),
    region('browser-controls', 'DEVICE_CHROME_EXCLUDED', 'Browser controls', { x: 0, y: 0, w: 1, h: 0.05 }),
    region('home-indicator', 'DEVICE_CHROME_EXCLUDED', 'Home indicator', { x: 0.35, y: 0.97, w: 0.3, h: 0.03 }),
  ];

  return {
    pageId,
    viewport: 'mobile',
    hostRegions,
    clientRegions,
    sharedRegions,
    excludedRegions,
    contentCanvasBounds: { x: 0, y: 0.07, w: 1, h: 0.81 },
    status: 'LOCKED',
  };
}
