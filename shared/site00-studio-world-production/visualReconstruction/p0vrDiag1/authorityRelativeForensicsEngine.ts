/**
 * P0.VR.DIAG.1 — Authority-relative visual forensics engine.
 */

import { FORENSIC_DELTA_HIGH_PX, FORENSIC_DELTA_MEDIUM_PX, TOP_IMPACT_ITEM_LIMIT } from './constants.js';
import { alignCapturePair } from './imageAlignment.js';
import { buildNormalizedViewportGeometry, geometryFromDom } from './normalizedViewportGeometry.js';
import { resolvePageRegionLayoutProfile, type PageRegionLayoutDefinition } from './pageRegionLayoutProfiles.js';
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
  SpacingDelta,
  TypographyDelta,
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

  const alignment = alignCapturePair({
    currentWidth: input.currentCapture.width,
    currentHeight: input.currentCapture.height,
    authorityWidth: input.designAuthority.width,
    authorityHeight: input.designAuthority.height,
    viewport: input.viewport === 'desktop' ? 'desktop' : input.viewport === 'tablet' ? 'tablet' : 'mobile',
    authorityReferenceType: input.designAuthority.referenceType ?? 'VIEWPORT_SCREENSHOT',
  });

  const domMap = buildDomMap(input.domMeasurements ?? input.currentCapture.domMeasurements ?? []);
  const shell = input.designAuthority.visualShellSpec;

  const regionMatches: VisualRegionMatch[] = [];
  const geometryDiffs: GeometryDelta[] = [];
  const spacingDiffs: SpacingDelta[] = [];
  const typographyDiffs: TypographyDelta[] = [];
  const assetDiffs: AssetVisualMatch[] = [];
  const navigationDiffs: NavigationForensics[] = [];
  const orderDiffs: OrderStackForensics[] = [];
  const densityDiffs: DensityDelta[] = [];
  const missingRegions: string[] = [];
  const extraRegions: string[] = [];

  for (const regionDef of profile.regions) {
    const componentMeta = input.componentMap?.find((c) => c.regionId === regionDef.regionId);
    const authorityRegion = buildAuthorityRegion(regionDef, alignment.authorityUsable, shell, componentMeta);
    const currentRegion = buildCurrentRegion(
      regionDef,
      alignment.currentUsable,
      domMap.get(regionDef.regionId),
      input.currentCapture.cssSnapshot,
      componentMeta,
    );

    const match = matchRegions(regionDef, authorityRegion, currentRegion, domMap.has(regionDef.regionId));
    regionMatches.push(match);

    if (match.status === 'MISSING_CURRENT') {
      missingRegions.push(regionDef.regionName);
      assetDiffs.push(buildMissingCurrentAssetDiff(regionDef, authorityRegion));
      continue;
    }
    if (match.status === 'MISSING_AUTHORITY') {
      extraRegions.push(regionDef.regionName);
      continue;
    }
    if (!authorityRegion || !currentRegion) continue;

    const heightDiff = buildHeightGeometryDelta(regionDef, authorityRegion, currentRegion, match.matchConfidence);
    if (heightDiff) geometryDiffs.push(heightDiff);

    const widthDiff = buildWidthGeometryDelta(regionDef, authorityRegion, currentRegion, match.matchConfidence);
    if (widthDiff) geometryDiffs.push(widthDiff);

    if (regionDef.category === 'NAVIGATION' || regionDef.regionId.includes('nav') || regionDef.regionId.includes('kpis')) {
      navigationDiffs.push(buildNavigationForensics(regionDef, authorityRegion, currentRegion, shell, domMap.get(regionDef.regionId)));
    }

    if (regionDef.regionId.includes('production') || regionDef.regionId.includes('hero')) {
      assetDiffs.push(buildAssetMatch(regionDef, authorityRegion, currentRegion, domMap.get(regionDef.regionId)));
    }

    if (regionDef.category === 'DENSITY') {
      densityDiffs.push(buildDensityDelta(regionDef, authorityRegion, currentRegion));
    }
  }

  if (shell) {
    spacingDiffs.push(...buildShellSpacingDiffs(shell, input.currentCapture.cssSnapshot, profile));
  }

  typographyDiffs.push(...buildTypographyDiffs(profile.regions, domMap, alignment));

  orderDiffs.push(...buildStackOrderDiff(profile, domMap));

  const hierarchyDiffs = buildHierarchyDiffs(regionMatches, geometryDiffs);
  const controlDiffs = buildControlDiffs(regionMatches, shell, input.currentCapture.cssSnapshot);
  const functionalRiskSummary = buildFunctionalRiskSummary(geometryDiffs, navigationDiffs);
  const confidenceSummary = summarizeConfidence([
    ...geometryDiffs.map((d) => d.confidence),
    ...spacingDiffs.map((d) => d.confidence),
    ...typographyDiffs.map((d) => d.confidence),
  ]);

  const impactScores = geometryDiffs.map((d) => {
    const weight = profile.regions.find((r) => r.regionId === d.regionId)?.hierarchyWeight ?? 0.5;
    return scoreGeometryImpact(d, weight);
  });
  const topImpactItems = pickTopImpactItems(impactScores, TOP_IMPACT_ITEM_LIMIT);

  return {
    reportId: `forensics_${input.pageId.replace(/[:/]/g, '_')}_${Date.now()}`,
    pageId: input.pageId,
    viewport: input.viewport,
    authorityVersionId: input.designAuthority.authorityVersionId,
    captureId: input.currentCapture.captureId,
    alignmentStatus: alignment.alignmentStatus,
    regionMatches,
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
    generatedAt: new Date().toISOString(),
  };
}

function buildDomMap(measurements: DomRegionMeasurement[]): Map<string, DomRegionMeasurement> {
  const map = new Map<string, DomRegionMeasurement>();
  for (const m of measurements) map.set(m.regionId, m);
  return map;
}

function buildAuthorityRegion(
  def: PageRegionLayoutDefinition,
  usable: { width: number; height: number },
  shell: AuthorityRelativeForensicsInput['designAuthority']['visualShellSpec'],
  componentMeta?: { componentId: string; selectorHint?: string | null },
): VisualRegionBounds {
  let height = usable.height * def.normalizedHeight;
  let y = usable.height * def.normalizedY;

  if (shell && def.regionId.includes('header-shell')) {
    height = shell.headerHeightPx;
    y = 0;
  } else if (shell && def.regionId.includes('bottom-nav')) {
    height = shell.bottomNavHeightPx;
    y = usable.height - shell.bottomNavHeightPx;
  }

  return {
    regionId: def.regionId,
    regionName: def.regionName,
    category: def.category,
    geometry: buildNormalizedViewportGeometry({
      x: 0,
      y,
      width: usable.width,
      height,
      viewportWidth: usable.width,
      viewportHeight: usable.height,
    }),
    componentId: componentMeta?.componentId ?? def.componentId ?? null,
    selectorHint: componentMeta?.selectorHint ?? def.selectorHint ?? null,
  };
}

function buildCurrentRegion(
  def: PageRegionLayoutDefinition,
  usable: { width: number; height: number },
  dom: DomRegionMeasurement | undefined,
  cssSnapshot: Record<string, string | number> | undefined,
  componentMeta?: { componentId: string; selectorHint?: string | null },
): VisualRegionBounds | null {
  if (dom) {
    return {
      regionId: def.regionId,
      regionName: def.regionName,
      category: def.category,
      geometry: geometryFromDom(dom, usable.width, usable.height),
      componentId: dom.componentId ?? componentMeta?.componentId ?? def.componentId ?? null,
      selectorHint: componentMeta?.selectorHint ?? def.selectorHint ?? null,
    };
  }

  const headerH = parseCssNumber(cssSnapshot?.headerHeightPx ?? cssSnapshot?.['--ndx-mobile-header-h']);
  const bottomH = parseCssNumber(cssSnapshot?.bottomNavHeightPx ?? cssSnapshot?.['--ndx-mobile-bottom-nav-h']);

  if (def.regionId.includes('header-shell') && headerH != null) {
    return {
      regionId: def.regionId,
      regionName: def.regionName,
      category: def.category,
      geometry: buildNormalizedViewportGeometry({
        x: 0,
        y: 0,
        width: usable.width,
        height: headerH,
        viewportWidth: usable.width,
        viewportHeight: usable.height,
      }),
      componentId: def.componentId ?? null,
      selectorHint: def.selectorHint ?? null,
    };
  }

  if (def.regionId.includes('bottom-nav') && bottomH != null) {
    return {
      regionId: def.regionId,
      regionName: def.regionName,
      category: def.category,
      geometry: buildNormalizedViewportGeometry({
        x: 0,
        y: usable.height - bottomH,
        width: usable.width,
        height: bottomH,
        viewportWidth: usable.width,
        viewportHeight: usable.height,
      }),
      componentId: def.componentId ?? null,
      selectorHint: def.selectorHint ?? null,
    };
  }

  return {
    regionId: def.regionId,
    regionName: def.regionName,
    category: def.category,
    geometry: buildNormalizedViewportGeometry({
      x: 0,
      y: usable.height * def.normalizedY,
      width: usable.width,
      height: usable.height * def.normalizedHeight,
      viewportWidth: usable.width,
      viewportHeight: usable.height,
    }),
    componentId: def.componentId ?? null,
    selectorHint: def.selectorHint ?? null,
  };
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

function buildHeightGeometryDelta(
  def: PageRegionLayoutDefinition,
  authority: VisualRegionBounds,
  current: VisualRegionBounds,
  confidence: ForensicConfidence,
): GeometryDelta | null {
  const authH = authority.geometry.heightPx;
  const curH = current.geometry.heightPx;
  const abs = curH - authH;
  if (Math.abs(abs) < 2) return null;

  const rel = authH > 0 ? (abs / authH) * 100 : null;
  const severity = Math.abs(abs) >= FORENSIC_DELTA_HIGH_PX ? 'HIGH' : Math.abs(abs) >= FORENSIC_DELTA_MEDIUM_PX ? 'MEDIUM' : 'LOW';
  const direction: CorrectionDirection = abs > 0 ? 'DECREASE' : 'INCREASE';

  return {
    evidenceId: nextEvidenceId('geom_h'),
    regionId: def.regionId,
    regionName: def.regionName,
    metric: 'height',
    authority: formatMeasure(authH, confidence),
    current: formatMeasure(curH, confidence),
    absoluteDelta: round(abs),
    relativeDeltaPct: rel != null ? round(rel) : null,
    severity,
    confidence,
    direction,
    correction: `${direction === 'DECREASE' ? 'Reduce' : 'Increase'} ${def.regionName.toLowerCase()} height toward ${formatMeasure(authH, confidence)} (current ${formatMeasure(curH, confidence)})`,
  };
}

function buildWidthGeometryDelta(
  def: PageRegionLayoutDefinition,
  authority: VisualRegionBounds,
  current: VisualRegionBounds,
  confidence: ForensicConfidence,
): GeometryDelta | null {
  const authW = authority.geometry.widthPct;
  const curW = current.geometry.widthPct;
  const absPct = curW - authW;
  if (Math.abs(absPct) < 3) return null;

  const direction: CorrectionDirection = absPct < 0 ? 'INCREASE' : 'DECREASE';
  return {
    evidenceId: nextEvidenceId('geom_w'),
    regionId: def.regionId,
    regionName: def.regionName,
    metric: 'width',
    authority: `${round(authW)}% viewport`,
    current: `${round(curW)}% viewport`,
    absoluteDelta: null,
    relativeDeltaPct: round(absPct),
    severity: Math.abs(absPct) >= 15 ? 'HIGH' : 'MEDIUM',
    confidence,
    direction,
    correction: `${direction === 'INCREASE' ? 'Increase' : 'Decrease'} ${def.regionName.toLowerCase()} width toward authority (${round(authW)}% vs current ${round(curW)}%)`,
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
      regionId: profile.regions.find((r) => r.regionName.includes('METRICS'))?.regionId ?? 'page.section-gap',
      regionName: 'SECTION GAP',
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
): TypographyDelta[] {
  const diffs: TypographyDelta[] = [];
  const hero = regions.find((r) => r.regionId.includes('hero'));
  const heroDom = hero ? domMap.get(hero.regionId) : undefined;
  if (!hero || !heroDom?.computedFontSize) return diffs;

  const fontSize = parseCssNumber(heroDom.computedFontSize);
  if (fontSize == null) return diffs;

  const authorityEstimate = alignment.authorityUsable.height * (hero.normalizedHeight * 0.35);
  const lineEstimate = heroDom.computedLineHeight ? parseCssNumber(heroDom.computedLineHeight) : null;
  const authorityLines = 2;
  const currentLines = lineEstimate && fontSize ? Math.max(1, Math.round((heroDom.actualHeight * 0.45) / lineEstimate)) : null;

  diffs.push({
    evidenceId: nextEvidenceId('type_hero'),
    regionId: hero.regionId,
    regionName: hero.regionName,
    authority: {
      evidenceId: nextEvidenceId('type_auth'),
      regionId: hero.regionId,
      fontFamily: null,
      fontSizePx: round(authorityEstimate * 0.12),
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
      maxWidthPct: round((heroDom.actualWidth / alignment.currentUsable.width) * 100),
      alignment: 'left',
      confidence: heroDom.computedFontSize ? 'HIGH' : 'MEDIUM',
      estimated: false,
    },
    wrapDifference:
      currentLines != null && currentLines > authorityLines
        ? `Current ${currentLines} lines vs authority ${authorityLines} lines`
        : null,
    correction: 'Adjust title scale and max width toward authority hierarchy',
    confidence: heroDom.computedFontSize ? 'HIGH' : 'MEDIUM',
    direction: 'RESIZE',
  });

  return diffs;
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
    itemCountAuthority: def.regionId.includes('kpis') ? 4 : null,
    itemCountCurrent: def.regionId.includes('kpis') ? 4 : null,
    spacingDeltaPx: shell ? (parseCssNumber(dom?.computedGap) ?? null) : null,
    heightDeltaPx: round(heightDelta),
    activeStateMismatch: false,
    orderMismatch: false,
    confidence: dom ? 'HIGH' : 'MEDIUM',
    correction:
      Math.abs(heightDelta) >= FORENSIC_DELTA_MEDIUM_PX
        ? `Align ${def.regionName.toLowerCase()} height and spacing to authority`
        : 'Review active-state and spacing against authority',
    functionalRisk: def.regionId.includes('bottom-nav') ? 'MEDIUM' : 'LOW',
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
      rel != null && rel > 10
        ? `Reduce ${def.regionName.toLowerCase()} vertical density toward authority (${round(authPct)}% vs ${round(curPct)}% viewport)`
        : `Review ${def.regionName.toLowerCase()} density against authority`,
    confidence: 'MEDIUM',
  };
}

function buildStackOrderDiff(
  profile: ReturnType<typeof resolvePageRegionLayoutProfile>,
  domMap: Map<string, DomRegionMeasurement>,
): OrderStackForensics[] {
  const present = profile.regions
    .filter((r) => domMap.has(r.regionId))
    .sort((a, b) => (domMap.get(a.regionId)?.actualY ?? 0) - (domMap.get(b.regionId)?.actualY ?? 0))
    .map((r) => r.regionName);

  const mismatch = present.length > 1 && present.join('|') !== profile.regions.map((r) => r.regionName).slice(0, present.length).join('|');

  return [
    {
      evidenceId: nextEvidenceId('order'),
      regionId: 'page.stack',
      authorityOrder: profile.stackOrder,
      currentOrder: present.length ? present : profile.stackOrder,
      mismatch,
      correction: mismatch ? 'Reorder mobile stack to match authority sequence' : 'Stack order matches authority',
      confidence: present.length ? 'HIGH' : 'LOW',
    },
  ];
}

function buildHierarchyDiffs(
  matches: VisualRegionMatch[],
  geometryDiffs: GeometryDelta[],
): HierarchyDifference[] {
  const hero = matches.find((m) => m.regionId.includes('hero'));
  const header = matches.find((m) => m.regionId.includes('header'));
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
  const bottom = matches.find((m) => m.regionId.includes('bottom-nav'));
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
): FunctionalRiskAssessment[] {
  const items: FunctionalRiskAssessment[] = [];
  for (const d of geometryDiffs.slice(0, 5)) {
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

function formatMeasure(px: number, confidence: ForensicConfidence): string {
  return confidence === 'LOW' ? `~${Math.round(px)}px` : `${Math.round(px)}px`;
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
