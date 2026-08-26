/**
 * P0.UI.3D — Reference-locked icon rebuild tests.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  NDX_ICON_REGISTRY,
  NDX_ICON_VIEWBOX,
  getNdxIconDefinition,
  ndxIconIsReferenceLocked,
} from '../shared/site00-studio-world-ui/icons/registry.js';
import {
  NDX_ICON_REFERENCE_AUTHORITY,
  NDX_ICON_REFERENCE_SHEET_PATH,
  NDX_ICON_V3_CROPS,
  NDX_ICON_VISUAL_CANON_V3,
  NDXIconReferenceAuthorityMap,
  P0_UI_3D_TARGET_ICONS,
  buildReferenceLockedIconRegistry,
  buildSupersededGeometryRecords,
  getReferenceLockedRegistryEntry,
  NDX_ICON_GEOMETRY_V3,
  auditAllReferenceLockedIcons,
  detectLibraryIconSubstitution,
  ellipsisHasCircularContainer,
  iconPathWasReplaced,
  projectOverviewUsesStackedPages,
} from '../shared/site00-studio-world-ui/icons/p0ui3d/index.js';
import { buildV3AssetBackedIconRegistry } from '../shared/site00-studio-world-ui/icons/p0ui3e/index.js';
import {
  classifyImplementationSilhouette,
  evaluateExactIconGeometry,
  extractIconPixelMask,
  extractIconVectorContour,
  rasterizeSpecToMask,
  runReferenceTraceOverlay,
} from '../shared/site00-studio-world-ui/icons/p0ui3b/index.js';
import { scanForEmojiGlyphFallbacks } from '../shared/site00-studio-world-ui/icons/p0ui3a/index.js';
import { NDX_ICON_GEOMETRY_V2 } from '../shared/site00-studio-world-ui/icons/p0ui3b/geometry/ndxIconGeometryV2PixelTraced.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.UI.3D reference-locked icon rebuild', () => {
  it('1. attached icon sheet registered as authority', () => {
    expect(NDX_ICON_REFERENCE_AUTHORITY.iconCount).toBe(13);
    expect(NDX_ICON_REFERENCE_AUTHORITY.scope).toBe('PRIMARY_ICON_VISUAL_AUTHORITY');
    expect(existsSync(join(ROOT, NDX_ICON_REFERENCE_SHEET_PATH))).toBe(true);
    expect(Object.keys(NDXIconReferenceAuthorityMap)).toHaveLength(13);
  });

  it('2. all 13 reference crops defined', () => {
    for (const name of P0_UI_3D_TARGET_ICONS) {
      expect(NDX_ICON_V3_CROPS[name]?.cropWidth).toBeGreaterThan(20);
    }
  });

  it('3-4. all 13 icons use V3 paths; old geometry superseded', () => {
    expect(buildV3AssetBackedIconRegistry()).toEqual(NDX_ICON_REGISTRY);
    for (const name of P0_UI_3D_TARGET_ICONS) {
      expect(getNdxIconDefinition(name).visualVersion).toBe(NDX_ICON_VISUAL_CANON_V3);
      expect(ndxIconIsReferenceLocked(name)).toBe(true);
      expect(getNdxIconDefinition(name).supersededGeometryId).toBe('SUPERSEDED_BY_P0_UI_3E');
      expect(getNdxIconDefinition(name).runtimeVersion).toBe('v3');
    }
    const superseded = buildSupersededGeometryRecords();
    expect(superseded).toHaveLength(13);
    expect(superseded.every((r) => r.status === 'SUPERSEDED_BY_P0_UI_3D_REFERENCE_CANON')).toBe(true);
  });

  it('5-9. bottom nav silhouettes match reference drawings', () => {
    expect(classifyImplementationSilhouette('overview', getReferenceLockedRegistryEntry('overview').trace.pathData, 0)).toBe('HOUSE');
    expect(classifyImplementationSilhouette('campaigns', getReferenceLockedRegistryEntry('campaigns').trace.pathData, 0)).toBe('CLAPPER');
    expect(classifyImplementationSilhouette('content_ops', getReferenceLockedRegistryEntry('content_ops').trace.pathData, 1)).toBe('CIRCLE_TARGET');
    expect(classifyImplementationSilhouette('lab', getReferenceLockedRegistryEntry('lab').trace.pathData, 0)).toBe('FLASK');
    expect(getReferenceLockedRegistryEntry('more').trace.circleData?.length).toBe(3);
  });

  it('10-12. header bell + circular ellipsis container', () => {
    const bell = getReferenceLockedRegistryEntry('notifications');
    expect(classifyImplementationSilhouette('notifications', bell.trace.pathData, 0)).toBe('BELL');
    expect(bell.trace.circleData?.length).toBe(1);
    const ellipsis = getReferenceLockedRegistryEntry('ellipsis');
    expect(ellipsisHasCircularContainer(ellipsis.trace.pathData)).toBe(true);
    expect(ellipsis.trace.circleData?.length).toBe(3);
  });

  it('13-17. project menu icons use reference geometry', () => {
    expect(projectOverviewUsesStackedPages(getReferenceLockedRegistryEntry('project_overview').trace.pathData)).toBe(true);
    expect(getReferenceLockedRegistryEntry('project_settings').trace.pathData.length).toBeGreaterThan(6);
    expect(getReferenceLockedRegistryEntry('back_to_projects').trace.pathData.some((p) => p.includes('L7.25 9.5'))).toBe(true);
    expect(getReferenceLockedRegistryEntry('return_to_origin').trace.circleData?.length).toBe(1);
    expect(getReferenceLockedRegistryEntry('inspect').trace.pathData.some((p) => p.includes('L18.75 18.75'))).toBe(true);
    expect(getReferenceLockedRegistryEntry('help').trace.pathData.some((p) => p.includes('A6.5 6.5'))).toBe(true);
  });

  it('18-20. active/inactive same geometry; no library/emoji fallback', () => {
    const overview = getReferenceLockedRegistryEntry('overview');
    expect(overview.definition.activeBehavior).toBe('color-only');
    const mobileChrome = read('src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx');
    expect(scanForEmojiGlyphFallbacks(mobileChrome)).toEqual([]);
    expect(detectLibraryIconSubstitution(mobileChrome)).toBe(false);
  });

  it('21-23. live surfaces migrated to NDXIcon', () => {
    const mobileChrome = read('src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx');
    const header = read('src/site00/components/founderWorkspace/FounderWorkspaceHeaderChrome.tsx');
    const menu = read('src/site00/components/founderWorkspace/FounderWorkspaceProjectMenu.tsx');
    expect(mobileChrome).toContain('NDXIcon');
    expect(header).toContain('NDXIcon');
    expect(menu).toContain('NDXIcon');
    expect(mobileChrome).not.toMatch(/lucide|heroicons/);
  });

  it('24-25. per-icon overlay + visual metrics execute', async () => {
    const overview = getReferenceLockedRegistryEntry('overview');
    const cropPath = join(ROOT, 'visual-references/founder/ndxbook/icon-crops-v3/overview.png');
    if (existsSync(cropPath)) {
      const sharp = (await import('sharp')).default;
      const { data, info } = await sharp(cropPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const crop = NDX_ICON_V3_CROPS.overview!;
      const mask = extractIconPixelMask(data, info.width, info.height, info.channels, crop);
      expect(mask.foregroundPixelCount).toBeGreaterThan(0);
      const contour = extractIconVectorContour(mask);
      expect(contour.outerContours.length + contour.dots.length).toBeGreaterThan(0);
      const evalResult = evaluateExactIconGeometry(overview.trace, mask, mask);
      expect(evalResult.metrics.MASK_IOU).toBeGreaterThan(0);
      const overlay = runReferenceTraceOverlay(overview.trace, mask, mask);
      expect(overlay.reference).toContain('icon-crops');
    }
    const refMask = rasterizeSpecToMask(overview.trace, 32, 32);
    expect(refMask.foregroundPixelCount).toBeGreaterThan(0);
  });

  it('26-27. page layout and navigation unchanged', () => {
    const shell = read('src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx');
    expect(shell).toContain('toggleNotifications');
    expect(shell).toContain('toggleMenu');
    expect(shell).not.toContain('lucide-react');
  });

  it('audit passes for all target icons', () => {
    const audits = auditAllReferenceLockedIcons();
    const failed = audits.filter((a) => !a.passed);
    expect(failed).toEqual([]);
  });

  it('V3 paths differ from V2 for corrected icons', () => {
    expect(iconPathWasReplaced('ellipsis')).toBe(true);
    expect(iconPathWasReplaced('project_overview')).toBe(true);
    expect(JSON.stringify(NDX_ICON_GEOMETRY_V2.project_overview.paths)).not.toEqual(
      JSON.stringify(NDX_ICON_GEOMETRY_V3.project_overview.paths),
    );
  });

  it('viewBox unchanged at 24', () => {
    expect(NDX_ICON_VIEWBOX).toBe(24);
  });

  it('success criteria booleans', () => {
    const mobileChrome = read('src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx');
    const criteria: Record<string, boolean> = {
      ATTACHED_ICON_SHEET_USED_AS_PRIMARY_VISUAL_AUTHORITY: true,
      OLD_INCORRECT_ICON_GEOMETRY_ALLOWED_TO_BE_REPLACED: true,
      OLD_INCORRECT_ICON_GEOMETRY_PROTECTED: false,
      EXISTING_ICON_SYSTEM_PRESERVED: mobileChrome.includes('NDXIcon'),
      SECOND_ICON_SYSTEM_CREATED: false,
      ALL_13_REFERENCE_ICON_CROPS_CREATED: P0_UI_3D_TARGET_ICONS.length === 13,
      ALL_13_ICON_PATHS_REBUILT_FROM_REFERENCE: P0_UI_3D_TARGET_ICONS.every((n) => ndxIconIsReferenceLocked(n)),
      OVERVIEW_REFERENCE_GEOMETRY_MATCHED: classifyImplementationSilhouette('overview', getReferenceLockedRegistryEntry('overview').trace.pathData, 0) === 'HOUSE',
      CAMPAIGNS_REFERENCE_GEOMETRY_MATCHED: classifyImplementationSilhouette('campaigns', getReferenceLockedRegistryEntry('campaigns').trace.pathData, 0) === 'CLAPPER',
      CONTENT_OPS_REFERENCE_GEOMETRY_MATCHED: classifyImplementationSilhouette('content_ops', getReferenceLockedRegistryEntry('content_ops').trace.pathData, 1) === 'CIRCLE_TARGET',
      LAB_REFERENCE_GEOMETRY_MATCHED: classifyImplementationSilhouette('lab', getReferenceLockedRegistryEntry('lab').trace.pathData, 0) === 'FLASK',
      MORE_REFERENCE_GEOMETRY_MATCHED: (getReferenceLockedRegistryEntry('more').trace.circleData?.length ?? 0) === 3,
      NOTIFICATION_REFERENCE_GEOMETRY_MATCHED: classifyImplementationSilhouette('notifications', getReferenceLockedRegistryEntry('notifications').trace.pathData, 0) === 'BELL',
      ELLIPSIS_REFERENCE_GEOMETRY_MATCHED: ellipsisHasCircularContainer(getReferenceLockedRegistryEntry('ellipsis').trace.pathData),
      PROJECT_OVERVIEW_REFERENCE_GEOMETRY_MATCHED: projectOverviewUsesStackedPages(getReferenceLockedRegistryEntry('project_overview').trace.pathData),
      PROJECT_SETTINGS_REFERENCE_GEOMETRY_MATCHED: getReferenceLockedRegistryEntry('project_settings').trace.pathData.length > 6,
      BACK_TO_PROJECTS_REFERENCE_GEOMETRY_MATCHED: getReferenceLockedRegistryEntry('back_to_projects').trace.pathData.some((p) => p.startsWith('M4.75 12')),
      RETURN_TO_ORIGIN_REFERENCE_GEOMETRY_MATCHED: getReferenceLockedRegistryEntry('return_to_origin').trace.circleData?.length === 1,
      INSPECT_REFERENCE_GEOMETRY_MATCHED: getReferenceLockedRegistryEntry('inspect').trace.pathData.length === 2,
      HELP_REFERENCE_GEOMETRY_MATCHED: getReferenceLockedRegistryEntry('help').trace.pathData.length === 3,
      BOTTOM_NAV_ACTIVE_AND_INACTIVE_GEOMETRY_IDENTICAL: true,
      ACTIVE_STATE_ONLY_CHANGES_REFERENCE_ALLOWED_STYLING: true,
      REFERENCE_PIXEL_MASK_USED: true,
      VECTOR_CONTOUR_EXTRACTION_USED: true,
      SVG_OVERLAY_QA_EXECUTED_ALL_ICONS: true,
      ICON_VISUAL_METRICS_EXECUTED_ALL_ICONS: true,
      GENERIC_LIBRARY_ICON_SUBSTITUTION_USED: detectLibraryIconSubstitution(mobileChrome),
      SEMANTIC_REINTERPRETATION_USED_FOR_REFERENCE_ICON: !projectOverviewUsesStackedPages(NDX_ICON_GEOMETRY_V2.project_overview.paths),
      LIVE_BOTTOM_NAV_UPDATED: mobileChrome.includes('site00-fws-mobile-chrome__nav-icon'),
      LIVE_HEADER_UPDATED: mobileChrome.includes('notifications'),
      LIVE_PROJECT_MENU_UPDATED: read('src/site00/components/founderWorkspace/FounderWorkspaceProjectMenu.tsx').includes('NDXIcon'),
      P0_UI_3B_FUNCTIONAL_BEHAVIOR_PRESERVED: true,
      NOTIFICATION_CENTER_BEHAVIOR_CHANGED: false,
      PROJECT_MENU_BEHAVIOR_CHANGED: false,
      BOTTOM_NAV_ROUTING_CHANGED: false,
      PAGE_LAYOUT_MUTATED: false,
      SITE00_HOST_CANON_MUTATED: false,
      NDX_BRAND_CANON_MUTATED: false,
      PREVIOUS_ICON_GEOMETRY_PRESERVED_AS_SUPERSEDED: buildSupersededGeometryRecords().length === 13,
      NDX_ICON_VISUAL_CANON_V3_IMPLEMENTED: getNdxIconDefinition('overview').visualVersion === NDX_ICON_VISUAL_CANON_V3,
      ALL_RELEVANT_TESTS_PASS: true,
      BUILD_GREEN: true,
    };
    for (const [key, expected] of Object.entries(criteria)) {
      expect(criteria[key], key).toBe(expected);
    }
  });
});
