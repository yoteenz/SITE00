/**
 * P0.VR.DESIGN-VIEWPORT-AUTHORITY1 — page-scoped viewport design authority lookup.
 */

import {
  getPageConceptSourceCaptures,
  isPageCaptureDisplayableArtifact,
} from '../designPageCapture.js';
import type { DesignBoundPageRecord } from './types.js';
import { getDesignBoundPage } from './designPageRegistry.js';
import type { DesignReadinessReceipt, ReadinessGateCheck } from '../types.js';

export type PageViewportId = 'MOBILE' | 'TABLET' | 'DESKTOP';

export type ViewportAuthorityStatus =
  | 'AVAILABLE'
  | 'APPROVED'
  | 'IN_REVIEW'
  | 'DESIGN_NEEDED'
  | 'DERIVED'
  | 'OVERRIDE'
  | 'WAITING'
  | 'MISSING'
  | 'LOCKED';

export type PageViewportAuthorities = {
  projectId: string;
  pageId: string;
  mobileAuthorityUrl: string | null;
  desktopAuthorityUrl: string | null;
  tabletOverrideUrl: string | null;
  tabletDerivedUrl: string | null;
};

export type HeroPreviewResolution =
  | {
      kind: 'image';
      src: string;
      viewport: PageViewportId;
      status: ViewportAuthorityStatus;
    }
  | {
      kind: 'manifest-hero';
      viewport: 'MOBILE';
      status: ViewportAuthorityStatus;
    }
  | {
      kind: 'missing-design';
      viewport: 'DESKTOP';
      title: string;
      statusLine: string;
      actionLabel: string;
      actionDisabled: boolean;
      actionReason: string | null;
    }
  | {
      kind: 'tablet-waiting';
      viewport: 'TABLET';
      title: string;
      statusLine: string;
      message: string;
    };

export type ViewportControlPresentation = {
  viewport: PageViewportId;
  status: ViewportAuthorityStatus;
  statusShort: string;
};

export type AuthorityRailViewportRow = {
  label: string;
  version: string;
  state: string;
  previewSrc: string | null;
  missing: boolean;
};

export function loadPageViewportAuthorities(
  projectId: string,
  pageId: string,
): PageViewportAuthorities | null {
  const page = getDesignBoundPage(projectId, pageId);
  if (!page) return null;
  return pageRecordToAuthorities(page);
}

export function pageRecordToAuthorities(page: DesignBoundPageRecord): PageViewportAuthorities {
  return enrichAuthoritiesWithImplementationCaptures({
    projectId: page.projectId,
    pageId: page.pageId,
    mobileAuthorityUrl: page.mobilePreviewUrl,
    desktopAuthorityUrl: page.desktopPreviewUrl,
    tabletOverrideUrl: page.tabletOverridePreviewUrl ?? null,
    tabletDerivedUrl: page.tabletDerivedPreviewUrl ?? null,
  });
}

/** Overlay Supabase/Railway implementation captures when static registry refs are missing. */
export function enrichAuthoritiesWithImplementationCaptures(
  auth: PageViewportAuthorities,
): PageViewportAuthorities {
  const { mobile, desktop } = getPageConceptSourceCaptures(auth.projectId, auth.pageId);
  const pick = (registry: string | null, capture: string | null | undefined): string | null => {
    if (registry?.trim()) return registry;
    const path = capture?.trim();
    if (path && isPageCaptureDisplayableArtifact(path)) return path;
    return null;
  };
  return {
    ...auth,
    mobileAuthorityUrl: pick(auth.mobileAuthorityUrl, mobile?.artifactPath),
    desktopAuthorityUrl: pick(auth.desktopAuthorityUrl, desktop?.artifactPath),
  };
}

function tabletPreviewFromAuthorities(auth: PageViewportAuthorities): {
  mode: 'override' | 'derived' | 'waiting';
  src: string | null;
} {
  if (auth.tabletOverrideUrl) {
    return { mode: 'override', src: auth.tabletOverrideUrl };
  }
  if (auth.mobileAuthorityUrl && auth.desktopAuthorityUrl) {
    if (auth.tabletDerivedUrl) {
      return { mode: 'derived', src: auth.tabletDerivedUrl };
    }
    return { mode: 'derived', src: auth.desktopAuthorityUrl };
  }
  return { mode: 'waiting', src: null };
}

export function viewportControlPresentations(auth: PageViewportAuthorities): ViewportControlPresentation[] {
  const tablet = tabletPreviewFromAuthorities(auth);
  const mobileStatus: ViewportAuthorityStatus =
    auth.mobileAuthorityUrl ? (auth.mobileAuthorityUrl.includes('master') ? 'APPROVED' : 'AVAILABLE') : 'DESIGN_NEEDED';
  const desktopStatus: ViewportAuthorityStatus = auth.desktopAuthorityUrl ? 'AVAILABLE' : 'DESIGN_NEEDED';
  const tabletStatus: ViewportAuthorityStatus =
    tablet.mode === 'override' ? 'OVERRIDE'
    : tablet.mode === 'derived' ? 'DERIVED'
    : auth.mobileAuthorityUrl ? 'WAITING'
    : 'DESIGN_NEEDED';

  return [
    { viewport: 'MOBILE', status: mobileStatus, statusShort: shortStatus(mobileStatus) },
    { viewport: 'TABLET', status: tabletStatus, statusShort: shortStatus(tabletStatus) },
    { viewport: 'DESKTOP', status: desktopStatus, statusShort: shortStatus(desktopStatus) },
  ];
}

function shortStatus(status: ViewportAuthorityStatus): string {
  switch (status) {
    case 'DESIGN_NEEDED':
      return 'NEEDED';
    case 'WAITING':
      return 'WAITING';
    case 'DERIVED':
      return 'DERIVED';
    case 'OVERRIDE':
      return 'OVERRIDE';
    case 'APPROVED':
      return 'APPROVED';
    case 'IN_REVIEW':
      return 'REVIEW';
    case 'LOCKED':
      return 'LOCKED';
    default:
      return 'OK';
  }
}

export function resolveHeroPreviewForViewport(
  auth: PageViewportAuthorities,
  viewport: PageViewportId,
): HeroPreviewResolution {
  if (viewport === 'MOBILE') {
    if (auth.mobileAuthorityUrl) {
      return {
        kind: 'image',
        src: auth.mobileAuthorityUrl,
        viewport: 'MOBILE',
        status: 'APPROVED',
      };
    }
    return { kind: 'manifest-hero', viewport: 'MOBILE', status: 'AVAILABLE' };
  }

  if (viewport === 'DESKTOP') {
    if (auth.desktopAuthorityUrl) {
      return {
        kind: 'image',
        src: auth.desktopAuthorityUrl,
        viewport: 'DESKTOP',
        status: 'AVAILABLE',
      };
    }
    return {
      kind: 'missing-design',
      viewport: 'DESKTOP',
      title: 'DESKTOP DESIGN',
      statusLine: 'DESIGN NEEDED',
      actionLabel: 'CREATE DESKTOP DESIGN',
      actionDisabled: true,
      actionReason: 'DESIGN INCEPTION FLOW NOT YET IMPLEMENTED',
    };
  }

  const tablet = tabletPreviewFromAuthorities(auth);
  if (tablet.mode === 'waiting') {
    return {
      kind: 'tablet-waiting',
      viewport: 'TABLET',
      title: 'TABLET PREVIEW',
      statusLine: 'WAITING FOR DESKTOP AUTHORITY',
      message: 'Tablet derives from Mobile + Desktop once Desktop authority exists.',
    };
  }
  return {
    kind: 'image',
    src: tablet.src!,
    viewport: 'TABLET',
    status: tablet.mode === 'override' ? 'OVERRIDE' : 'DERIVED',
  };
}

export function resolveAuthorityRailRows(
  auth: PageViewportAuthorities,
  mobileVersion: string,
  desktopVersion: string,
  mobileState: string,
  desktopState: string,
): { mobile: AuthorityRailViewportRow; desktop: AuthorityRailViewportRow; tabletLabel: string } {
  const tablet = tabletPreviewFromAuthorities(auth);
  const tabletLabel =
    tablet.mode === 'override' ? 'TABLET: OVERRIDE'
    : tablet.mode === 'derived' ? 'TABLET: DERIVED'
    : tablet.mode === 'waiting' ? 'TABLET: WAITING'
    : 'TABLET: MISSING';

  return {
    mobile: {
      label: 'MOBILE MASTER',
      version: mobileVersion,
      state: mobileState,
      previewSrc: auth.mobileAuthorityUrl,
      missing: !auth.mobileAuthorityUrl,
    },
    desktop: {
      label: 'DESKTOP MASTER',
      version: auth.desktopAuthorityUrl ? desktopVersion : '—',
      state: auth.desktopAuthorityUrl ? desktopState : 'MISSING',
      previewSrc: auth.desktopAuthorityUrl,
      missing: !auth.desktopAuthorityUrl,
    },
    tabletLabel,
  };
}

export type PageViewportCoverageSummary = {
  mobile: boolean;
  desktop: boolean;
  tablet: 'DERIVED' | 'OVERRIDE' | 'WAITING' | 'MISSING';
};

export function summarizePageViewportCoverage(auth: PageViewportAuthorities): PageViewportCoverageSummary {
  const tablet = tabletPreviewFromAuthorities(auth);
  return {
    mobile: Boolean(auth.mobileAuthorityUrl),
    desktop: Boolean(auth.desktopAuthorityUrl),
    tablet:
      tablet.mode === 'override' ? 'OVERRIDE'
      : tablet.mode === 'derived' ? 'DERIVED'
      : auth.mobileAuthorityUrl ? 'WAITING'
      : 'MISSING',
  };
}

export function mergePageViewportIntoReadiness(
  receipt: DesignReadinessReceipt,
  coverage: PageViewportCoverageSummary,
): DesignReadinessReceipt {
  const checks: ReadinessGateCheck[] = receipt.checks.map((check) => {
    if (check.id === 'desktop_authority_ready' && !coverage.desktop) {
      return {
        ...check,
        result: 'BLOCKED',
        reason: 'Desktop design not created for active page',
        blocking: true,
      };
    }
    if (check.id === 'tablet_responsive') {
      if (coverage.tablet === 'WAITING') {
        return {
          ...check,
          result: 'NOT_APPLICABLE',
          reason: 'Tablet derivation waits for Desktop authority on this page',
          blocking: false,
        };
      }
      if (coverage.tablet === 'MISSING' && !coverage.mobile) {
        return { ...check, result: 'BLOCKED', reason: 'No mobile authority on page', blocking: true };
      }
    }
    return check;
  });

  const blockers = checks.filter((c) => c.blocking && (c.result === 'BLOCKED' || c.result === 'FAIL'));
  const warnings = checks.filter((c) => !c.blocking && (c.result === 'BLOCKED' || c.result === 'FAIL'));
  const passedGates = checks.filter((c) => c.result === 'PASS').length;
  const applicable = checks.filter((c) => c.result !== 'NOT_APPLICABLE');
  const readinessPercent =
    applicable.length === 0 ? 0 : Math.round((passedGates / applicable.length) * 100);
  const buildEligible = blockers.length === 0 && coverage.desktop && receipt.buildEligible;

  return {
    ...receipt,
    checks,
    blockers,
    warnings,
    passedGates,
    applicableGates: applicable.length,
    readinessPercent,
    buildEligible,
    readyLabel: blockers.length === 0 && buildEligible ? receipt.readyLabel : 'BLOCKED',
  };
}

export function resolvePageViewportBundle(projectId: string, pageId: string) {
  const auth = loadPageViewportAuthorities(projectId, pageId);
  if (!auth) return null;
  return {
    auth,
    controls: viewportControlPresentations(auth),
    coverage: summarizePageViewportCoverage(auth),
  };
}
