/**
 * P0.VR.DIAG.1 / P0.VR.DIAG.1R1 — Authority-relative visual forensics engine.
 */

import { FORENSIC_DELTA_HIGH_PX, FORENSIC_DELTA_MEDIUM_PX, TOP_IMPACT_ITEM_LIMIT } from './constants.js';
import {
  buildFullPageRegionCoverageMap,
  buildPageGutterProfile,
  buildRegionSequenceComparison,
  buildVerticalRhythmProfile,
  computeForensicCoverageScore,
  discoverExtraCurrentRegions,
  evaluateForensicCoverageGate,
  resolveCaptureScopes,
} from './fullPageRegionCoverage.js';
import { alignCapturePair } from './imageAlignment.js';
import { reconcileForensicReportScoring } from './forensicReconciliation.js';
import { buildRegionForensicsBundle } from './multiDimensionForensics.js';
import { buildGlobalPageMeasurementProfile } from './regionMeasurementDepth.js';
import { buildNormalizedViewportGeometry } from './normalizedViewportGeometry.js';
import {
  discoverAuthorityRegions,
  resolvePageRegionLayoutProfile,
  type PageRegionLayoutDefinition,
} from './pageRegionLayoutProfiles.js';
import {
  buildStackedRegionBounds,
  resolveStackLayoutContext,
} from './stackLayout.js';
import { pickTopImpactItems, scoreGeometryImpact } from './visualImpactScore.js';
import type {
  AssetVisualMatch,
  AuthorityRelativeForensicsInput,
  AuthorityRelativeForensicsReport,
  CorrectionDirection,
  DensityDelta,
  DomRegionMeasurement,
  ForensicConfidence,
  FunctionalRiskAssessment,
  GeometryDelta,
  HierarchyDifference,
  NavigationForensics,
  OrderStackForensics,
  RegionForensicsBundle,
  SpacingDelta,
  TypographyDelta,
  TypographyHierarchyProfile,
  VisualRegionBounds,
  VisualRegionMatch,
} from './types.js';

let evidenceCounter = 0;
function nextEvidenceId(prefix: string): string {
  evidenceCounter += 1;
  return `${prefix}_${evidenceCounter}`;
}

export function resetForensicsEvidenceCounterForTest(): void {
  evidenceCounter = 0;
}

export function runAuthorityRelativeForensics(
  input: AuthorityRelativeForensicsInput,
): AuthorityRelativeForensicsReport {
  const profile = resolvePageRegionLayoutProfile({
    pageArchetype: input.pageArchetype,
    screenId: input.screenId,
    isRootPage: input.pageArchetype.includes('overview'),
  });

  const authorityRegions = discoverAuthorityRegions(profile);
  const alignment = alignCapturePair({
    currentWidth: input.currentCapture.width,
    currentHeight: input.currentCapture.height,
    authorityWidth: input.designAuthority.width,
    authorityHeight: input.designAuthority.height,
    viewport: input.viewport === 'desktop' ? 'desktop' : input.viewport === 'tablet' ? 'tablet' : 'mobile',
    authorityReferenceType: input.designAuthority.referenceType ?? 'VIEWPORT_SCREENSHOT',
  });

  const scopes = resolveCaptureScopes({
    authorityReferenceType: input.designAuthority.referenceType,
    currentHeight: input.currentCapture.height,
    authorityHeight: input.designAuthority.height,
  });

  const domMap = buildDomMap(input.domMeasurements ?? input.currentCapture.domMeasurements ?? []);
  const shell = input.designAuthority.visualShellSpec;
  const cssSnapshot = input.currentCapture.cssSnapshot;

  const shellForStack = shell ?? null;

  const authCtx = resolveStackLayoutContext({
    usableWidth: alignment.authorityUsable.width,
    usableHeight: alignment.authorityUsable.height,
    shell: shellForStack,
    cssSnapshot: undefined,
    domMap: new Map(),
  });

  const curCtx = resolveStackLayoutContext({
    usableWidth: alignment.currentUsable.width,
    usableHeight: alignment.currentUsable.height,
    shell: shellForStack,
    cssSnapshot,
    domMap,
  });

  const middleRegions = profile.regions.filter((r) => !r.shellBound);

  const regionMatches: VisualRegionMatch[] = [];
  const regionForensics: RegionForensicsBundle[] = [];
  const geometryDiffs: GeometryDelta[] = [];
  const spacingDiffs: SpacingDelta[] = [];
  const typographyDiffs: TypographyDelta[] = [];
  const assetDiffs: AssetVisualMatch[] = [];
  const navigationDiffs: NavigationForensics[] = [];
  const orderDiffs: OrderStackForensics[] = [];
  const densityDiffs: DensityDelta[] = [];
  const missingRegions: string[] = [];
  const extraRegions: string[] = [];

  for (const regionDef of authorityRegions) {
    const dom = domMap.get(regionDef.regionId);

    const authorityRegion = buildStackedRegionBounds({
      def: regionDef,
      ctx: authCtx,
      middleRegions,
      dom: undefined,
      side: 'authority',
      shell: shellForStack,
    });

    let currentRegion: VisualRegionBounds | null = null;
    if (dom && dom.actualHeight >= 4) {
      currentRegion = buildStackedRegionBounds({
        def: regionDef,
        ctx: curCtx,
        middleRegions,
        dom,
        side: 'current',
        shell: shellForStack,
      });
    } else if (regionDef.shellBound || domMap.size === 0 || !hasDomForMiddleRegions(domMap, regionDef)) {
      currentRegion = buildStackedRegionBounds({
        def: regionDef,
        ctx: curCtx,
        middleRegions,
        dom: undefined,
        side: 'current',
        shell: shellForStack,
      });
    }

    const match = matchRegions(regionDef, authorityRegion, currentRegion, Boolean(dom));
    regionMatches.push({
      ...match,
      regionType: regionDef.regionType,
      significance: regionDef.significance,
    });

    const bundle = buildRegionForensicsBundle({
      def: regionDef,
      status: match.status,
      authority: authorityRegion,
      current: currentRegion,
      dom,
      shell: shell
        ? { headerPaddingX: shell.headerPaddingX, contentPaddingX: shell.contentPaddingX, sectionGap: shell.sectionGap }
        : null,
      cssSnapshot,
      matchConfidence: match.matchConfidence,
      route: input.route ?? null,
      viewportWidth: input.currentCapture.width,
      viewportHeight: input.currentCapture.height,
    });
    regionForensics.push(bundle);

    if (match.status === 'MISSING_CURRENT') {
      missingRegions.push(regionDef.regionName);
      assetDiffs.push(buildMissingCurrentAssetDiff(regionDef, authorityRegion));
      continue;
    }
    if (match.status === 'MISSING_AUTHORITY') {
      extraRegions.push(regionDef.regionName);
      continue;
    }
    if (match.status === 'AMBIGUOUS' || !authorityRegion || !currentRegion) continue;

    geometryDiffs.push(...dimensionsToGeometryDiffs(bundle, regionDef, match.matchConfidence));
    spacingDiffs.push(...dimensionsToSpacingDiffs(bundle, regionDef));

    if (regionDef.regionType === 'NAVIGATION' || regionDef.regionType === 'PERSISTENT_NAV') {
      navigationDiffs.push(buildNavigationForensics(regionDef, authorityRegion, currentRegion, shell, dom));
    }

    if (regionDef.regionType === 'MEDIA' || regionDef.category === 'ASSET') {
      assetDiffs.push(buildAssetMatch(regionDef, authorityRegion, currentRegion, dom));
    }

    if (regionDef.category === 'DENSITY' || regionDef.regionType === 'LIST' || regionDef.regionType === 'CARD_RAIL') {
      densityDiffs.push(buildDensityDelta(regionDef, authorityRegion, currentRegion));
    }
  }

  for (const extraDef of discoverExtraCurrentRegions({ profile, domMap })) {
    const dom = domMap.get(extraDef.regionId)!;
    const currentRegion: VisualRegionBounds = {
      regionId: extraDef.regionId,
      regionName: extraDef.regionName,
      category: extraDef.category,
      geometry: buildNormalizedViewportGeometry({
        x: dom.actualX,
        y: dom.actualY,
        width: dom.actualWidth,
        height: dom.actualHeight,
        viewportWidth: alignment.currentUsable.width,
        viewportHeight: alignment.currentUsable.height,
      }),
      componentId: dom.componentId ?? null,
      selectorHint: null,
    };
    regionMatches.push({
      regionId: extraDef.regionId,
      regionName: extraDef.regionName,
      regionType: extraDef.regionType,
      significance: extraDef.significance,
      authorityRegion: null,
      currentRegion,
      matchConfidence: 'MEDIUM',
      matchMethod: 'DOM_ID',
      status: 'MISSING_AUTHORITY',
    });
    extraRegions.push(extraDef.regionName);
    regionForensics.push(
      buildRegionForensicsBundle({
        def: extraDef,
        status: 'MISSING_AUTHORITY',
        authority: null,
        current: currentRegion,
        dom,
        matchConfidence: 'MEDIUM',
        route: input.route ?? null,
      }),
    );
  }

  if (shell) {
    spacingDiffs.push(...buildShellSpacingDiffs(shell, cssSnapshot, profile));
  }

  typographyDiffs.push(...buildTypographyDiffs(profile.regions, domMap, alignment, regionForensics));

  const verticalRhythm = buildVerticalRhythmProfile({
    profile,
    regionMatches,
    sectionGapAuthority: shell?.sectionGap ?? 10,
    sectionGapCurrent: curCtx.sectionGapPx,
  });
  const gutterProfile = buildPageGutterProfile({ shell: shellForStack, cssSnapshot });
  const regionSequence = buildRegionSequenceComparison({ profile, regionMatches });
  orderDiffs.push(...sequenceToOrderDiff(regionSequence));

  const typographyHierarchy = buildTypographyHierarchyProfile(regionForensics);

  const hierarchyDiffs = buildHierarchyDiffs(regionMatches, geometryDiffs);
  const controlDiffs = buildControlDiffs(regionMatches, shell, cssSnapshot);
  const functionalRiskSummary = buildFunctionalRiskSummary(geometryDiffs, navigationDiffs, regionForensics);
  const confidenceSummary = summarizeConfidence([
    ...geometryDiffs.map((d) => d.confidence),
    ...spacingDiffs.map((d) => d.confidence),
    ...regionForensics.flatMap((b) => b.dimensions.map((d) => d.confidence)),
  ]);

  const impactScores = geometryDiffs.map((d) => {
    const weight = profile.regions.find((r) => r.regionId === d.regionId)?.hierarchyWeight ?? 0.5;
    return scoreGeometryImpact(d, weight);
  });
  const topImpactItems = pickTopImpactItems(impactScores, TOP_IMPACT_ITEM_LIMIT);

  const globalPageProfile = buildGlobalPageMeasurementProfile({
    viewportWidth: input.currentCapture.width,
    shell: shellForStack,
    cssSnapshot,
    regionCount: profile.regions.length,
  });

  const draftCoverageScore = computeForensicCoverageScore({ profile, regionForensics, regionMatches });
  const draftCoverageMap = buildFullPageRegionCoverageMap({
    pageId: input.pageId,
    viewport: input.viewport,
    authorityVersionId: input.designAuthority.authorityVersionId,
    captureId: input.currentCapture.captureId,
    profile,
    regionMatches,
    regionForensics,
    currentScope: scopes.currentScope,
    authorityScope: scopes.authorityScope,
    scopeMismatch: scopes.scopeMismatch,
    coverageScore: draftCoverageScore,
    coverageGate: evaluateForensicCoverageGate(draftCoverageScore),
  });

  const draftReport: AuthorityRelativeForensicsReport = {
    reportId: `forensics_${input.pageId.replace(/[:/]/g, '_')}_${Date.now()}`,
    pageId: input.pageId,
    viewport: input.viewport,
    authorityVersionId: input.designAuthority.authorityVersionId,
    captureId: input.currentCapture.captureId,
    alignmentStatus: alignment.alignmentStatus,
    regionMatches,
    regionForensics,
    coverageMap: draftCoverageMap,
    coverageGate: evaluateForensicCoverageGate(draftCoverageScore),
    measurementDepthGate: {
      status: 'BLOCK',
      reason: 'Pending reconciliation',
      blockApproveDirection: true,
      founderMayProceedWithWarning: false,
      majorSufficient: 0,
      majorTotal: draftCoverageScore.majorAuthorityTotal,
      shallowMajorRegions: [],
    },
    globalPageProfile,
    verticalRhythm,
    gutterProfile,
    typographyHierarchy,
    regionSequence,
    geometryDiffs,
    spacingDiffs,
    typographyDiffs,
    assetDiffs: assetDiffs.filter(Boolean),
    navigationDiffs,
    orderDiffs,
    densityDiffs,
    controlDiffs,
    hierarchyDiffs,
    missingRegions,
    extraRegions,
    topImpactItems,
    confidenceSummary,
    functionalRiskSummary,
    fullPageStatus: draftCoverageMap.status,
    generatedAt: new Date().toISOString(),
  };

  const { report } = reconcileForensicReportScoring({ report: draftReport, profile });
  return {
    ...report,
    fullPageStatus: report.coverageMap.status,
  };
}

function hasDomForMiddleRegions(domMap: Map<string, DomRegionMeasurement>, def: PageRegionLayoutDefinition): boolean {
  if (def.shellBound) return domMap.has(def.regionId);
  return [...domMap.keys()].some((k) => k.includes('overview') || k.includes('hero') || k.includes('kpis'));
}

function dimensionsToGeometryDiffs(
  bundle: RegionForensicsBundle,
  def: PageRegionLayoutDefinition,
  confidence: ForensicConfidence,
): GeometryDelta[] {
  const diffs: GeometryDelta[] = [];
  const geomDims = ['height', 'width', 'leftOffset', 'topOffset', 'leftInset', 'bottomEdgeY', 'controlSize', 'containerHeight', 'aspectRatio'];
  for (const dim of bundle.dimensions.filter((d) => geomDims.includes(d.dimension))) {
    const abs = parseDeltaPx(dim.delta);
    const direction = inferDirection(dim.delta, dim.dimension);
    diffs.push({
      evidenceId: dim.evidenceId,
      regionId: def.regionId,
      regionName: def.regionName,
      metric: dim.dimension,
      authority: String(dim.authorityValue),
      current: String(dim.currentValue),
      absoluteDelta: abs,
      relativeDeltaPct: dim.deltaPct,
      severity: abs != null && Math.abs(abs) >= FORENSIC_DELTA_HIGH_PX ? 'HIGH' : abs != null && Math.abs(abs) >= FORENSIC_DELTA_MEDIUM_PX ? 'MEDIUM' : 'LOW',
      confidence: dim.confidence ?? confidence,
      direction,
      correction: bundle.corrections.find((c) => c.toLowerCase().includes(dim.dimension.toLowerCase())) ?? bundle.corrections[0] ?? `Align ${def.regionName.toLowerCase()} ${dim.dimension}`,
    });
  }
  return diffs;
}

function dimensionsToSpacingDiffs(bundle: RegionForensicsBundle, def: PageRegionLayoutDefinition): SpacingDelta[] {
  return bundle.dimensions
    .filter((d) => ['itemGap', 'paddingTop'].includes(d.dimension))
    .map((dim) => ({
      evidenceId: dim.evidenceId,
      regionId: def.regionId,
      regionName: def.regionName,
      metric: dim.dimension,
      authority: String(dim.authorityValue),
      current: String(dim.currentValue),
      absoluteDelta: parseDeltaPx(dim.delta),
      relativeDeltaPct: dim.deltaPct,
      severity: 'MEDIUM' as const,
      confidence: dim.confidence,
      direction: inferDirection(dim.delta, dim.dimension),
      correction: bundle.corrections[0] ?? `Adjust ${def.regionName.toLowerCase()} spacing`,
      spacingKind: dim.dimension === 'itemGap' ? 'ROW_GAP' : 'PADDING',
    }));
}

function parseDeltaPx(delta: string | null): number | null {
  if (!delta) return null;
  const m = /(-?\d+(?:\.\d+)?)px/.exec(delta);
  return m ? Number(m[1]) : null;
}

function inferDirection(delta: string | null, dimension: string): CorrectionDirection {
  if (!delta) return 'RESIZE';
  if (delta.includes('MISSING')) return 'ADD';
  if (delta.includes('EXTRA')) return 'REMOVE';
  const m = /(-?\d)/.exec(delta);
  if (!m) return 'RESIZE';
  const n = Number(m[1]);
  if (dimension.includes('height') || dimension.includes('width') || dimension.includes('Inset') || dimension.includes('gap')) {
    return n < 0 ? 'INCREASE' : 'DECREASE';
  }
  return 'RESIZE';
}

function buildDomMap(measurements: DomRegionMeasurement[]): Map<string, DomRegionMeasurement> {
  const map = new Map<string, DomRegionMeasurement>();
  for (const m of measurements) map.set(m.regionId, m);
  return map;
}

function matchRegions(
  def: PageRegionLayoutDefinition,
  authority: VisualRegionBounds | null,
  current: VisualRegionBounds | null,
  hasDom: boolean,
): VisualRegionMatch {
  if (!authority && current) {
    return {
      regionId: def.regionId,
      regionName: def.regionName,
      authorityRegion: null,
      currentRegion: current,
      matchConfidence: 'LOW',
      matchMethod: 'AMBIGUOUS',
      status: 'MISSING_AUTHORITY',
    };
  }
  if (authority && !current) {
    return {
      regionId: def.regionId,
      regionName: def.regionName,
      authorityRegion: authority,
      currentRegion: null,
      matchConfidence: 'MEDIUM',
      matchMethod: 'LAYOUT_PROFILE',
      status: 'MISSING_CURRENT',
    };
  }
  if (!hasDom && !def.shellBound && def.significance === 'MAJOR') {
    return {
      regionId: def.regionId,
      regionName: def.regionName,
      authorityRegion: authority,
      currentRegion: current,
      matchConfidence: 'MEDIUM',
      matchMethod: 'LAYOUT_PROFILE',
      status: authority && current ? 'MATCHED' : 'AMBIGUOUS',
    };
  }
  return {
    regionId: def.regionId,
    regionName: def.regionName,
    authorityRegion: authority,
    currentRegion: current,
    matchConfidence: hasDom ? 'HIGH' : 'MEDIUM',
    matchMethod: hasDom ? 'DOM_ID' : 'LAYOUT_PROFILE',
    status: authority && current ? 'MATCHED' : 'AMBIGUOUS',
  };
}

function buildShellSpacingDiffs(
  shell: NonNullable<AuthorityRelativeForensicsInput['designAuthority']['visualShellSpec']>,
  cssSnapshot: Record<string, string | number> | undefined,
  profile: ReturnType<typeof resolvePageRegionLayoutProfile>,
): SpacingDelta[] {
  const diffs: SpacingDelta[] = [];
  const currentGutter = parseCssNumber(cssSnapshot?.contentPaddingX ?? cssSnapshot?.['--ndx-mobile-content-px']);
  const currentGap = parseCssNumber(cssSnapshot?.sectionGap ?? cssSnapshot?.['--ndx-mobile-section-gap']);

  if (currentGutter != null && Math.abs(currentGutter - shell.contentPaddingX) >= 2) {
    const abs = currentGutter - shell.contentPaddingX;
    diffs.push({
      evidenceId: nextEvidenceId('space_gutter'),
      regionId: 'page.content-gutter',
      regionName: 'SECTION GUTTERS',
      metric: 'horizontal gutter',
      authority: `${shell.contentPaddingX}px`,
      current: `${currentGutter}px`,
      absoluteDelta: round(abs),
      relativeDeltaPct: shell.contentPaddingX ? round((abs / shell.contentPaddingX) * 100) : null,
      severity: Math.abs(abs) >= 6 ? 'HIGH' : 'MEDIUM',
      confidence: 'HIGH',
      direction: abs < 0 ? 'INCREASE' : 'DECREASE',
      correction: `${abs < 0 ? 'Increase' : 'Decrease'} horizontal gutter toward ${shell.contentPaddingX}px`,
      spacingKind: 'GUTTER',
    });
  }

  if (currentGap != null && Math.abs(currentGap - shell.sectionGap) >= 2) {
    const abs = currentGap - shell.sectionGap;
    diffs.push({
      evidenceId: nextEvidenceId('space_gap'),
      regionId: profile.regions.find((r) => r.regionName.includes('NAV'))?.regionId ?? 'page.section-gap',
      regionName: 'VERTICAL SPACING RHYTHM',
      metric: 'section gap',
      authority: `${shell.sectionGap}px`,
      current: `${currentGap}px`,
      absoluteDelta: round(abs),
      relativeDeltaPct: shell.sectionGap ? round((abs / shell.sectionGap) * 100) : null,
      severity: 'MEDIUM',
      confidence: 'HIGH',
      direction: abs > 0 ? 'DECREASE' : 'INCREASE',
      correction: `${abs > 0 ? 'Reduce' : 'Increase'} section gap toward ${shell.sectionGap}px`,
      spacingKind: 'SECTION_GAP',
    });
  }

  return diffs;
}

function buildTypographyDiffs(
  regions: PageRegionLayoutDefinition[],
  domMap: Map<string, DomRegionMeasurement>,
  alignment: ReturnType<typeof alignCapturePair>,
  regionForensics: RegionForensicsBundle[],
): TypographyDelta[] {
  const diffs: TypographyDelta[] = [];
  const hero = regions.find((r) => r.regionType === 'IDENTITY');
  const heroDom = hero ? domMap.get(hero.regionId) : undefined;
  const heroBundle = hero ? regionForensics.find((b) => b.regionId === hero.regionId) : undefined;
  const fontDim = heroBundle?.dimensions.find((d) => d.dimension === 'fontSize');

  if (!hero) return diffs;

  const fontSize = heroDom?.computedFontSize ? parseCssNumber(heroDom.computedFontSize) : null;
  if (fontSize == null && !fontDim) return diffs;

  const authorityEstimate = alignment.authorityUsable.height * (hero.normalizedHeight * 0.35);
  const lineEstimate = heroDom?.computedLineHeight ? parseCssNumber(heroDom.computedLineHeight) : null;
  const authorityLines = 2;
  const currentLines =
    lineEstimate && fontSize ? Math.max(1, Math.round(((heroDom?.actualHeight ?? 0) * 0.45) / lineEstimate)) : null;

  diffs.push({
    evidenceId: nextEvidenceId('type_hero'),
    regionId: hero.regionId,
    regionName: hero.regionName,
    authority: {
      evidenceId: nextEvidenceId('type_auth'),
      regionId: hero.regionId,
      fontFamily: null,
      fontSizePx: fontDim ? parseCssNumber(String(fontDim.authorityValue)) : round(authorityEstimate * 0.12),
      lineHeightPx: null,
      fontWeight: null,
      letterSpacing: null,
      textTransform: 'UPPERCASE',
      lineCount: authorityLines,
      maxWidthPct: 72,
      alignment: 'left',
      confidence: 'MEDIUM',
      estimated: true,
    },
    current: {
      evidenceId: nextEvidenceId('type_cur'),
      regionId: hero.regionId,
      fontFamily: null,
      fontSizePx: fontSize,
      lineHeightPx: lineEstimate,
      fontWeight: null,
      letterSpacing: null,
      textTransform: null,
      lineCount: currentLines,
      maxWidthPct: heroDom ? round((heroDom.actualWidth / alignment.currentUsable.width) * 100) : null,
      alignment: 'left',
      confidence: heroDom?.computedFontSize ? 'HIGH' : 'MEDIUM',
      estimated: !heroDom?.computedFontSize,
    },
    wrapDifference:
      currentLines != null && currentLines > authorityLines
        ? `Current ${currentLines} lines vs authority ${authorityLines} lines`
        : null,
    correction: 'Adjust title scale and max width toward authority hierarchy',
    confidence: heroDom?.computedFontSize ? 'HIGH' : 'MEDIUM',
    direction: 'RESIZE',
  });

  return diffs;
}

function buildTypographyHierarchyProfile(regionForensics: RegionForensicsBundle[]): TypographyHierarchyProfile {
  const levels = regionForensics
    .filter((b) => b.regionType === 'IDENTITY' || b.regionType === 'NAVIGATION' || b.regionType === 'STATUS')
    .map((b) => {
      const fontDim = b.dimensions.find((d) => d.dimension === 'fontSize');
      return {
        role: b.regionName,
        authorityFontSizePx: fontDim ? parseCssNumber(String(fontDim.authorityValue)) : null,
        currentFontSizePx: fontDim ? parseCssNumber(String(fontDim.currentValue)) : null,
        authorityLineCount: null,
        currentLineCount: null,
        scaleToBodyRatio: null,
        confidence: fontDim?.confidence ?? 'LOW',
      };
    });

  return {
    evidenceId: nextEvidenceId('type_hierarchy'),
    levels,
    correction: levels.some((l) => l.currentFontSizePx && l.authorityFontSizePx && l.currentFontSizePx !== l.authorityFontSizePx)
      ? 'Restore typographic hierarchy scale relative to authority'
      : null,
  };
}

function buildNavigationForensics(
  def: PageRegionLayoutDefinition,
  authority: VisualRegionBounds,
  current: VisualRegionBounds,
  shell: AuthorityRelativeForensicsInput['designAuthority']['visualShellSpec'],
  dom?: DomRegionMeasurement,
): NavigationForensics {
  const heightDelta = current.geometry.heightPx - authority.geometry.heightPx;
  return {
    evidenceId: nextEvidenceId('nav'),
    regionId: def.regionId,
    itemCountAuthority: def.regionType === 'NAVIGATION' ? 4 : null,
    itemCountCurrent: def.regionType === 'NAVIGATION' ? 4 : null,
    spacingDeltaPx: shell ? (parseCssNumber(dom?.computedGap) ?? null) : null,
    heightDeltaPx: round(heightDelta),
    activeStateMismatch: false,
    orderMismatch: false,
    confidence: dom ? 'HIGH' : 'MEDIUM',
    correction:
      Math.abs(heightDelta) >= FORENSIC_DELTA_MEDIUM_PX
        ? `Align ${def.regionName.toLowerCase()} height and spacing to authority`
        : 'Review active-state and spacing against authority',
    functionalRisk: def.regionType === 'PERSISTENT_NAV' ? 'MEDIUM' : 'LOW',
  };
}

function buildAssetMatch(
  def: PageRegionLayoutDefinition,
  authority: VisualRegionBounds,
  current: VisualRegionBounds,
  dom?: DomRegionMeasurement,
): AssetVisualMatch {
  const missing = dom && dom.actualHeight < 8;
  const heightDelta = current.geometry.heightPx - authority.geometry.heightPx;
  return {
    evidenceId: nextEvidenceId('asset'),
    regionId: def.regionId,
    authorityAssetRegion: authority,
    currentAssetRegion: current,
    matchStatus: missing ? 'MISSING_CURRENT' : Math.abs(heightDelta) > 24 ? 'SCALE_MISMATCH' : 'MATCH',
    cropDelta: null,
    scaleDelta: Math.abs(heightDelta) > 2 ? `${round(heightDelta)}px height drift` : null,
    positionDelta: Math.abs(current.geometry.yPx - authority.geometry.yPx) > 8 ? 'Vertical placement drift' : null,
    confidence: dom ? 'HIGH' : 'MEDIUM',
    correction:
      missing
        ? `Restore ${def.regionName.toLowerCase()} asset region to match authority`
        : Math.abs(heightDelta) > 8
          ? `Resize/reposition ${def.regionName.toLowerCase()} toward authority footprint`
          : 'Asset region aligned within tolerance',
  };
}

function buildMissingCurrentAssetDiff(
  def: PageRegionLayoutDefinition,
  authority: VisualRegionBounds | null,
): AssetVisualMatch {
  return {
    evidenceId: nextEvidenceId('asset_missing'),
    regionId: def.regionId,
    authorityAssetRegion: authority,
    currentAssetRegion: null,
    matchStatus: 'MISSING_CURRENT',
    cropDelta: null,
    scaleDelta: null,
    positionDelta: null,
    confidence: authority ? 'HIGH' : 'MEDIUM',
    correction: `Add/restore ${def.regionName.toLowerCase()} region present in authority`,
  };
}

function buildDensityDelta(
  def: PageRegionLayoutDefinition,
  authority: VisualRegionBounds,
  current: VisualRegionBounds,
): DensityDelta {
  const authPct = authority.geometry.heightPct;
  const curPct = current.geometry.heightPct;
  const rel = authPct > 0 ? ((curPct - authPct) / authPct) * 100 : null;
  return {
    evidenceId: nextEvidenceId('density'),
    regionId: def.regionId,
    regionName: def.regionName,
    authority: {
      regionId: def.regionId,
      elementsPerViewport: null,
      occupiedAreaRatio: authPct / 100,
      whiteSpaceRatio: null,
      cardCountVisible: null,
      confidence: 'MEDIUM',
    },
    current: {
      regionId: def.regionId,
      elementsPerViewport: null,
      occupiedAreaRatio: curPct / 100,
      whiteSpaceRatio: null,
      cardCountVisible: null,
      confidence: 'MEDIUM',
    },
    relativeDeltaPct: rel != null ? round(rel) : null,
    correction:
      rel != null && Math.abs(rel) > 8
        ? `Adjust ${def.regionName.toLowerCase()} vertical density toward authority (${round(authPct)}% vs ${round(curPct)}% viewport)`
        : `Review ${def.regionName.toLowerCase()} density against authority`,
    confidence: 'MEDIUM',
  };
}

function sequenceToOrderDiff(seq: import('./types.js').RegionSequenceComparison): OrderStackForensics[] {
  return [
    {
      evidenceId: seq.evidenceId,
      regionId: 'page.stack',
      authorityOrder: seq.authorityOrder,
      currentOrder: seq.currentOrder,
      mismatch: seq.mismatch,
      correction: seq.correction ?? 'Stack order matches authority',
      confidence: seq.confidence,
    },
  ];
}

function buildHierarchyDiffs(
  matches: VisualRegionMatch[],
  geometryDiffs: GeometryDelta[],
): HierarchyDifference[] {
  const hero = matches.find((m) => m.regionType === 'IDENTITY' || m.regionId.includes('hero'));
  const header = matches.find((m) => m.regionType === 'HEADER' || m.regionId.includes('header'));
  if (!hero?.authorityRegion || !hero.currentRegion) return [];

  const heroDrift = geometryDiffs.find((d) => d.regionId === hero.regionId && d.metric === 'height');
  return [
    {
      evidenceId: nextEvidenceId('hierarchy'),
      dominantAuthority: 'TITLE / HERO',
      dominantCurrent: heroDrift && heroDrift.severity === 'HIGH' ? 'HEADER SHELL' : 'TITLE / HERO',
      titleProminenceDelta: heroDrift ? heroDrift.correction : null,
      heroProminenceDelta: null,
      ctaProminenceDelta: null,
      navProminenceDelta: header
        ? geometryDiffs.find((d) => d.regionId === header.regionId)?.correction ?? null
        : null,
      confidence: heroDrift?.confidence ?? 'MEDIUM',
    },
  ];
}

function buildControlDiffs(
  matches: VisualRegionMatch[],
  shell: AuthorityRelativeForensicsInput['designAuthority']['visualShellSpec'],
  cssSnapshot: Record<string, string | number> | undefined,
) {
  const bottom = matches.find((m) => m.regionType === 'PERSISTENT_NAV' || m.regionId.includes('bottom-nav'));
  if (!bottom?.authorityRegion || !bottom.currentRegion || !shell) return [];

  const currentH = parseCssNumber(cssSnapshot?.bottomNavHeightPx) ?? bottom.currentRegion.geometry.heightPx;
  const delta = currentH - shell.bottomNavHeightPx;
  if (Math.abs(delta) < 2) return [];

  return [
    {
      evidenceId: nextEvidenceId('control_nav'),
      regionId: bottom.regionId,
      controlKind: 'bottom-nav',
      authorityHeightPx: shell.bottomNavHeightPx,
      currentHeightPx: round(currentH),
      authorityWidthPx: bottom.authorityRegion.geometry.widthPx,
      currentWidthPx: bottom.currentRegion.geometry.widthPx,
      borderRadiusDelta: null,
      correction: `${delta > 0 ? 'Reduce' : 'Increase'} bottom nav height toward ${shell.bottomNavHeightPx}px`,
      confidence: 'HIGH' as const,
    },
  ];
}

function buildFunctionalRiskSummary(
  geometryDiffs: GeometryDelta[],
  navigationDiffs: NavigationForensics[],
  regionForensics: RegionForensicsBundle[],
): FunctionalRiskAssessment[] {
  const items: FunctionalRiskAssessment[] = [];
  for (const d of geometryDiffs.slice(0, 8)) {
    items.push({
      evidenceId: d.evidenceId,
      changeSummary: d.correction,
      risk: d.regionName.includes('NAV') ? 'MEDIUM' : 'LOW',
      rationale: 'Geometry-only adjustment — routes and actions preserved by function contract',
    });
  }
  for (const n of navigationDiffs) {
    items.push({
      evidenceId: n.evidenceId,
      changeSummary: n.correction,
      risk: n.functionalRisk,
      rationale: 'Visual nav analysis only — route mapping protected separately',
    });
  }
  for (const b of regionForensics.filter((r) => r.functionalRisk !== 'LOW').slice(0, 3)) {
    items.push({
      evidenceId: b.dimensions[0]?.evidenceId ?? b.regionId,
      changeSummary: b.corrections[0] ?? b.regionName,
      risk: b.functionalRisk,
      rationale: 'Region-level functional risk from forensics bundle',
    });
  }
  return items;
}

function summarizeConfidence(levels: ForensicConfidence[]): Record<ForensicConfidence, number> {
  return {
    HIGH: levels.filter((l) => l === 'HIGH').length,
    MEDIUM: levels.filter((l) => l === 'MEDIUM').length,
    LOW: levels.filter((l) => l === 'LOW').length,
  };
}

function parseCssNumber(value: string | number | undefined | null): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const match = /^([\d.]+)/.exec(String(value).trim());
  return match ? Number(match[1]) : null;
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
