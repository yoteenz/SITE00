/**
 * P0.VR.REPLICATION.2 — Authority shell segmentation + macro geometry (NDXBOOK overview mobile).
 */

import { resolvePageRegionLayoutProfile } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import { CANONICAL_VIEWPORT_DIMENSIONS } from '../p0vr2/constants.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import { NDX_AUTHORITY_SHELL_BANDS, type NdxAuthorityShellBandId } from './constants.js';

export type ShellBandGeometry = {
  bandId: NdxAuthorityShellBandId;
  role: string;
  topPx: number;
  heightPx: number;
  leftPx: number;
  widthPx: number;
  contentType: string;
  buildMode: 'MEASURED' | 'DIRECTLY_RECONSTRUCTED' | 'CONTENT_BOUND' | 'INFERRED' | 'FALLBACK';
  nestedBandIds: string[];
};

export type AuthorityShellBlueprint = {
  blueprintId: string;
  pageId: string;
  viewport: DesignViewportClass;
  authorityVersionId: string;
  canvasWidth: number;
  canvasHeight: number;
  contentWidthPx: number;
  marginXPx: number;
  gutterPx: number;
  sectionGapPx: number;
  bottomNavHeightPx: number;
  bandOrder: NdxAuthorityShellBandId[];
  bands: ShellBandGeometry[];
  alignmentRules: string[];
  densityZones: string[];
  status: 'READY' | 'DRAFT';
  source: 'AUTHORITY_PROFILE_SEGMENTATION';
};

const HOST_HEADER_H = 52;
const BREADCRUMB_H = 28;
const BOTTOM_NAV_H = 56;

function bandFromProfile(input: {
  bandId: NdxAuthorityShellBandId;
  role: string;
  normalizedY: number;
  normalizedHeight: number;
  contentType: string;
  buildMode: ShellBandGeometry['buildMode'];
  canvasW: number;
  canvasH: number;
  marginX: number;
}): ShellBandGeometry {
  const widthPx = input.canvasW - input.marginX * 2;
  return {
    bandId: input.bandId,
    role: input.role,
    topPx: Math.round(input.normalizedY * input.canvasH),
    heightPx: Math.max(24, Math.round(input.normalizedHeight * input.canvasH)),
    leftPx: input.marginX,
    widthPx,
    contentType: input.contentType,
    buildMode: input.buildMode,
    nestedBandIds: [],
  };
}

export function buildNdxAuthorityShellBlueprint(input: {
  pageId: string;
  viewport: DesignViewportClass;
  authorityVersionId: string;
}): AuthorityShellBlueprint {
  const dims = CANONICAL_VIEWPORT_DIMENSIONS[input.viewport];
  const marginXPx = 14;
  const gutterPx = 12;
  const sectionGapPx = 10;
  const profile = resolvePageRegionLayoutProfile({
    pageArchetype: 'ndxbook-overview-mobile',
    screenId: 'overview',
  });

  const regionByHint = (hint: string) =>
    profile.regions.find((r) => r.regionId.includes(hint) || r.regionName.toLowerCase().includes(hint));

  const hero = regionByHint('production') ?? profile.regions[4];
  const progress = regionByHint('content-shell') ?? profile.regions[5];
  const metrics = regionByHint('kpi.audience') ?? profile.regions[6];
  const activity = regionByHint('radar') ?? profile.regions[7];
  const masthead = regionByHint('hero') ?? profile.regions[1];
  const meta = regionByHint('metrics') ?? profile.regions[2];
  const sectionNav = regionByHint('kpis') ?? profile.regions[3];
  const bottom = regionByHint('bottom-nav') ?? profile.regions.at(-1)!;

  let cursorY = 0;
  const pushFixed = (
    bandId: NdxAuthorityShellBandId,
    role: string,
    heightPx: number,
    contentType: string,
    buildMode: ShellBandGeometry['buildMode'],
  ): ShellBandGeometry => {
    const band: ShellBandGeometry = {
      bandId,
      role,
      topPx: cursorY,
      heightPx,
      leftPx: marginXPx,
      widthPx: dims.width - marginXPx * 2,
      contentType,
      buildMode,
      nestedBandIds: [],
    };
    cursorY += heightPx + sectionGapPx;
    return band;
  };

  const bands: ShellBandGeometry[] = [
    pushFixed('host-header', 'SITE 00 host chrome', HOST_HEADER_H, 'host-chrome', 'DIRECTLY_RECONSTRUCTED'),
    pushFixed('breadcrumb', 'PROJECTS › NDXBOOK', BREADCRUMB_H, 'breadcrumb', 'DIRECTLY_RECONSTRUCTED'),
    bandFromProfile({
      bandId: 'masthead',
      role: 'Project identity / masthead',
      normalizedY: masthead.normalizedY,
      normalizedHeight: masthead.normalizedHeight,
      contentType: 'masthead-title-block',
      buildMode: 'MEASURED',
      canvasW: dims.width,
      canvasH: dims.height,
      marginX: marginXPx,
    }),
    bandFromProfile({
      bandId: 'masthead-context-column',
      role: 'Founder owned / culture column',
      normalizedY: meta.normalizedY,
      normalizedHeight: meta.normalizedHeight,
      contentType: 'context-column',
      buildMode: 'MEASURED',
      canvasW: dims.width,
      canvasH: dims.height,
      marginX: marginXPx,
    }),
    bandFromProfile({
      bandId: 'section-nav',
      role: 'Module navigation row',
      normalizedY: sectionNav.normalizedY,
      normalizedHeight: sectionNav.normalizedHeight,
      contentType: 'section-nav',
      buildMode: 'MEASURED',
      canvasW: dims.width,
      canvasH: dims.height,
      marginX: marginXPx,
    }),
    bandFromProfile({
      bandId: 'hero-editorial',
      role: 'Hero / editorial media block',
      normalizedY: hero.normalizedY,
      normalizedHeight: hero.normalizedHeight,
      contentType: 'hero-editorial',
      buildMode: 'MEASURED',
      canvasW: dims.width,
      canvasH: dims.height,
      marginX: marginXPx,
    }),
    bandFromProfile({
      bandId: 'progress-phase',
      role: 'Progress / current phase band',
      normalizedY: progress.normalizedY,
      normalizedHeight: progress.normalizedHeight,
      contentType: 'progress-phase',
      buildMode: 'MEASURED',
      canvasW: dims.width,
      canvasH: dims.height,
      marginX: marginXPx,
    }),
    bandFromProfile({
      bandId: 'metric-status-row',
      role: 'Metric / status cells',
      normalizedY: metrics.normalizedY,
      normalizedHeight: metrics.normalizedHeight,
      contentType: 'metric-row',
      buildMode: 'CONTENT_BOUND',
      canvasW: dims.width,
      canvasH: dims.height,
      marginX: marginXPx,
    }),
    bandFromProfile({
      bandId: 'focus-milestone',
      role: 'Current focus / next milestone',
      normalizedY: activity.normalizedY * 0.92,
      normalizedHeight: Math.min(0.12, activity.normalizedHeight * 0.55),
      contentType: 'focus-milestone',
      buildMode: 'CONTENT_BOUND',
      canvasW: dims.width,
      canvasH: dims.height,
      marginX: marginXPx,
    }),
    bandFromProfile({
      bandId: 'recent-activity',
      role: 'Recent activity block',
      normalizedY: activity.normalizedY,
      normalizedHeight: activity.normalizedHeight,
      contentType: 'activity-list',
      buildMode: 'CONTENT_BOUND',
      canvasW: dims.width,
      canvasH: dims.height,
      marginX: marginXPx,
    }),
    {
      bandId: 'bottom-nav',
      role: 'SITE 00 bottom navigation shell',
      topPx: dims.height - BOTTOM_NAV_H,
      heightPx: BOTTOM_NAV_H,
      leftPx: 0,
      widthPx: dims.width,
      contentType: 'persistent-bottom-nav',
      buildMode: 'DIRECTLY_RECONSTRUCTED',
      nestedBandIds: bottom.childLandmarks ?? [],
    },
  ];

  return {
    blueprintId: `asb_${input.pageId}_${input.viewport}_${Date.now()}`,
    pageId: input.pageId,
    viewport: input.viewport,
    authorityVersionId: input.authorityVersionId,
    canvasWidth: dims.width,
    canvasHeight: dims.height,
    contentWidthPx: dims.width - marginXPx * 2,
    marginXPx,
    gutterPx,
    sectionGapPx,
    bottomNavHeightPx: BOTTOM_NAV_H,
    bandOrder: [...NDX_AUTHORITY_SHELL_BANDS],
    bands,
    alignmentRules: ['single-column-stack', 'masthead-split-context', 'hero-full-bleed-width', 'metrics-four-up'],
    densityZones: ['host-compact', 'masthead-editorial', 'content-rhythm-10'],
    status: 'READY',
    source: 'AUTHORITY_PROFILE_SEGMENTATION',
  };
}
