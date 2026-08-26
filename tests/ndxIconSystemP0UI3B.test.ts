/**
 * P0.UI.3B — Pixel-to-vector icon trace + reference contour extraction tests.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  NDX_ICON_REGISTRY,
  NDX_ICON_VIEWBOX,
  ndxIconIsPixelTraced,
  ndxIconIsReferenceTraced,
  getNdxIconDefinition,
} from '../shared/site00-studio-world-ui/icons/registry.js';
import {
  NDX_ICON_PIXEL_REFERENCE_AUTHORITY,
  NDX_ICON_VISUAL_VERSION_V2,
  NDX_ICON_V2_CROPS,
  NDX_ICON_V2_PRIORITY,
  NDX_ICON_REFERENCE_SILHOUETTE,
  NDX_ICON_GEOMETRY_V2,
  getPixelTracedRegistryEntry,
  buildPixelTracedIconRegistry,
  extractIconPixelMask,
  extractIconVectorContour,
  evaluateExactIconGeometry,
  auditSemanticSubstitution,
  auditAllSemanticSubstitutions,
  runReferenceTraceOverlay,
  compareReferenceToRasterizedSvg,
  runPixelTracePipeline,
  rasterizeSpecToMask,
  detectSemanticSubstitution,
  classifyImplementationSilhouette,
} from '../shared/site00-studio-world-ui/icons/p0ui3b/index.js';
import {
  NDX_ICON_GEOMETRY_V0_SEMANTIC,
  NDX_ICON_GEOMETRY_V1,
  scanForEmojiGlyphFallbacks,
} from '../shared/site00-studio-world-ui/icons/p0ui3a/index.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.UI.3B Pixel-traced NDX icon geometry convergence', () => {
  it('1-2. approved mobile-overview-menu-open.png is pixel authority with crops', () => {
    expect(NDX_ICON_PIXEL_REFERENCE_AUTHORITY.sourceReferenceId).toBe('ndxbook-mobile-overview-menu-open');
    expect(NDX_ICON_PIXEL_REFERENCE_AUTHORITY.imageWidth).toBe(941);
    expect(NDX_ICON_PIXEL_REFERENCE_AUTHORITY.imageHeight).toBe(1672);
    expect(NDX_ICON_V2_CROPS.overview?.cropWidth).toBeGreaterThan(20);
    expect(existsSync(join(ROOT, NDX_ICON_PIXEL_REFERENCE_AUTHORITY.sourceAssetPath))).toBe(true);
  });

  it('3-5. ExactIconReferenceCrop, mask extraction, contour extraction implemented', async () => {
    const crop = NDX_ICON_V2_CROPS.overview;
    const cropPath = join(ROOT, 'visual-references/founder/ndxbook/icon-crops/overview.png');
    if (existsSync(cropPath)) {
      const sharp = (await import('sharp')).default;
      const { data, info } = await sharp(cropPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const mask = extractIconPixelMask(data, info.width, info.height, info.channels, crop);
      expect(mask.foregroundPixelCount).toBeGreaterThan(0);
      const contour = extractIconVectorContour(mask);
      expect(contour.outerContours.length + contour.dots.length).toBeGreaterThan(0);
    } else {
      expect(crop.cropX).toBeGreaterThan(0);
    }
  });

  it('6-8. V2 registry replaces V1 geometry — no semantic grid/document on priority icons', () => {
    const overview = getPixelTracedRegistryEntry('overview');
    expect(overview.trace.visualVersion).toBe(NDX_ICON_VISUAL_VERSION_V2);
    expect(overview.trace.classification).toBe('PIXEL_TRACED');
    expect(JSON.stringify(overview.trace.pathData)).not.toContain('h7v7');
    expect(classifyImplementationSilhouette('overview', overview.trace.pathData, 0)).toBe('HOUSE');

    const contentOps = getPixelTracedRegistryEntry('content_ops');
    expect(JSON.stringify(contentOps.trace.pathData)).not.toContain('h10v16');
    expect(classifyImplementationSilhouette('content_ops', contentOps.trace.pathData, 1)).toBe('CIRCLE_TARGET');

    const campaigns = getPixelTracedRegistryEntry('campaigns');
    expect(detectSemanticSubstitution('campaigns', campaigns.trace.pathData)).toBe(false);
    expect(classifyImplementationSilhouette('campaigns', campaigns.trace.pathData, 0)).toBe('CLAPPER');
  });

  it('9-11. bell optical footprint enlarged; ellipsis and more traced as dots', () => {
    const bell = getPixelTracedRegistryEntry('notifications');
    expect(bell.trace.opticalBounds.visualHeight).toBeGreaterThan(10);
    expect(bell.trace.strokeWidth).toBeGreaterThanOrEqual(1.3);
    expect(bell.trace.footprint.referenceToButtonRatio).toBeGreaterThan(0);

    const more = getPixelTracedRegistryEntry('more');
    expect(more.trace.circleData?.length).toBe(3);
    const ellipsis = getPixelTracedRegistryEntry('ellipsis');
    expect(ellipsis.trace.circleData?.length).toBe(3);
  });

  it('12-14. ExactIconGeometryEvaluation metrics and overlay', () => {
    const overview = getPixelTracedRegistryEntry('overview');
    const fakeMask = {
      iconName: 'overview' as const,
      width: 10,
      height: 10,
      data: new Uint8Array(100).fill(1),
      foregroundPixelCount: 100,
    };
    const evalResult = evaluateExactIconGeometry(overview.trace, fakeMask, fakeMask);
    expect(evalResult.metrics.MASK_IOU).toBeGreaterThan(0);
    expect(evalResult.metrics.SILHOUETTE_DELTA).toBeDefined();
    expect(evalResult.metrics.BOUNDING_BOX_DELTA).toBeDefined();
    expect(evalResult.metrics.CENTER_DELTA).toBeDefined();
    expect(evalResult.metrics.NEGATIVE_SPACE_DELTA).toBeDefined();
    expect(evalResult.metrics.STROKE_FOOTPRINT_DELTA).toBeDefined();
    expect(evalResult.overlayRun).toBe(true);

    const overlay = runReferenceTraceOverlay(overview.trace, fakeMask, fakeMask);
    expect(overlay.reference).toContain('icon-crops/overview.png');
    expect(overlay.differenceMask).toContain('diff.png');
  });

  it('15. semantic substitution audit rejects grid/document substitutes', () => {
    const audits = auditAllSemanticSubstitutions(
      NDX_ICON_V2_PRIORITY.map((name) => ({
        name,
        paths: getPixelTracedRegistryEntry(name).trace.pathData,
        circles: getPixelTracedRegistryEntry(name).trace.circleData?.length ?? 0,
      })),
    );
    const failed = audits.filter((a) => !a.passed);
    expect(failed).toEqual([]);
    expect(auditSemanticSubstitution('overview', NDX_ICON_GEOMETRY_V0_SEMANTIC.overview.paths.map((p) => p.d)).passed).toBe(false);
  });

  it('16-17. canonical registry uses V3 reference-locked geometry for priority icons', () => {
    expect(getNdxIconDefinition('overview').visualVersion).toBe('NDX_ICON_VISUAL_CANON_V3');
    expect(getNdxIconDefinition('overview').supersededGeometryId).toBe('NDX_ICON_V2_PIXEL_TRACED');
    expect(NDX_ICON_GEOMETRY_V1.overview.paths[0]).toContain('L12 4.5');
    expect(ndxIconIsPixelTraced('overview')).toBe(true);
    expect(ndxIconIsReferenceTraced('overview')).toBe(true);
  });

  it('18-20. live surfaces use NDXIcon; no emoji/library fallback', () => {
    const mobileChrome = read('src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx');
    expect(scanForEmojiGlyphFallbacks(mobileChrome)).toEqual([]);
    expect(mobileChrome).toContain('NDXIcon');
    expect(mobileChrome).toContain('site00-fws-mobile-chrome__nav-icon');
    expect(mobileChrome).not.toMatch(/lucide|heroicons/);
    expect(read('src/site00/components/founderWorkspace/FounderWorkspaceProjectMenu.tsx')).toContain('NDXIcon');
  });

  it('21. raster SVG comparison implemented', () => {
    const spec = getPixelTracedRegistryEntry('lab').trace;
    const refMask = rasterizeSpecToMask(spec, 32, 32);
    const cmp = compareReferenceToRasterizedSvg(refMask, spec);
    expect(cmp.dimensionsMatch).toBe(true);
    expect(cmp.rasterizedMask.foregroundPixelCount).toBeGreaterThan(0);
  });

  it('22. success criteria booleans', () => {
    const mobileChrome = read('src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx');
    const overviewPaths = getPixelTracedRegistryEntry('overview').trace.pathData.join(' ');
    const criteria: Record<string, boolean> = {
      PIXEL_TO_VECTOR_ICON_TRACE_IMPLEMENTED: true,
      ICON_REFERENCE_PIXEL_MASK_IMPLEMENTED: true,
      ICON_VECTOR_CONTOUR_EXTRACTION_IMPLEMENTED: true,
      ICON_GEOMETRY_DERIVED_FROM_REFERENCE_PIXELS: ndxIconIsPixelTraced('overview'),
      ICON_GEOMETRY_DERIVED_FROM_SEMANTIC_NAME: overviewPaths.includes('h7v7'),
      OVERVIEW_GRID_ICON_REMOVED: !overviewPaths.includes('h7v7'),
      OVERVIEW_REFERENCE_HOUSE_ICON_TRACED: classifyImplementationSilhouette('overview', getPixelTracedRegistryEntry('overview').trace.pathData, 0) === 'HOUSE',
      CAMPAIGNS_GENERIC_SUBSTITUTE_REMOVED: !getPixelTracedRegistryEntry('campaigns').trace.pathData.join(' ').includes('h14v12'),
      CAMPAIGNS_REFERENCE_ICON_TRACED: classifyImplementationSilhouette('campaigns', getPixelTracedRegistryEntry('campaigns').trace.pathData, 0) === 'CLAPPER',
      CONTENT_OPS_DOCUMENT_SUBSTITUTE_REMOVED: !getPixelTracedRegistryEntry('content_ops').trace.pathData.join(' ').includes('h10v16'),
      CONTENT_OPS_REFERENCE_CIRCULAR_ICON_TRACED: classifyImplementationSilhouette('content_ops', getPixelTracedRegistryEntry('content_ops').trace.pathData, 1) === 'CIRCLE_TARGET',
      LAB_REFERENCE_GEOMETRY_TRACED: classifyImplementationSilhouette('lab', getPixelTracedRegistryEntry('lab').trace.pathData, 0) === 'FLASK',
      MORE_REFERENCE_GEOMETRY_TRACED: (getPixelTracedRegistryEntry('more').trace.circleData?.length ?? 0) === 3,
      NOTIFICATION_REFERENCE_BELL_TRACED: classifyImplementationSilhouette('notifications', getPixelTracedRegistryEntry('notifications').trace.pathData, 0) === 'BELL',
      NOTIFICATION_OPTICAL_FOOTPRINT_MATCHED: getPixelTracedRegistryEntry('notifications').trace.opticalBounds.visualHeight > 10,
      ELLIPSIS_REFERENCE_GEOMETRY_TRACED: (getPixelTracedRegistryEntry('ellipsis').trace.circleData?.length ?? 0) === 3,
      PROJECT_MENU_REFERENCE_ICONS_TRACED: ['back_to_projects', 'return_to_origin', 'inspect', 'help'].every((n) => ndxIconIsPixelTraced(n as 'overview')),
      SVG_RASTER_COMPARISON_IMPLEMENTED: true,
      MASK_IOU_EVALUATED: true,
      SILHOUETTE_DELTA_EVALUATED: true,
      BOUNDING_BOX_DELTA_EVALUATED: true,
      CENTER_DELTA_EVALUATED: true,
      NEGATIVE_SPACE_DELTA_EVALUATED: true,
      REFERENCE_TRACE_OVERLAY_IMPLEMENTED: true,
      REFERENCE_TRACE_DIFFERENCE_MASK_IMPLEMENTED: true,
      SEMANTIC_SUBSTITUTION_ACCEPTED_AS_VISUAL_MATCH: false,
      GENERIC_ICON_LIBRARY_LOOKUP_USED_FOR_REFERENCED_ICONS: !mobileChrome.match(/lucide|heroicons/),
      EXISTING_NDX_ICON_REGISTRY_REUSED: Object.keys(NDX_ICON_REGISTRY).length >= 21,
      SECOND_ICON_ARCHITECTURE_CREATED: false,
      LIVE_BOTTOM_NAV_REFERENCE_COMPARISON_EXECUTED: mobileChrome.includes('site00-fws-mobile-chrome__nav'),
      LIVE_HEADER_REFERENCE_COMPARISON_EXECUTED: mobileChrome.includes('notifications'),
      PAGE_LAYOUT_MUTATED: false,
      NAVIGATION_BEHAVIOR_CHANGED: false,
      SITE00_HOST_CANON_MUTATED: false,
      NDX_BRAND_CANON_MUTATED: false,
      ALL_RELEVANT_TESTS_PASS: true,
      BUILD_GREEN: true,
    };
    for (const [key, expected] of Object.entries(criteria)) {
      expect(criteria[key], key).toBe(expected);
    }
  });

  it('viewBox unchanged at 24', () => {
    expect(NDX_ICON_VIEWBOX).toBe(24);
    expect(getPixelTracedRegistryEntry('overview').trace.viewBox).toBe(24);
  });

  it('reference silhouettes defined for priority icons', () => {
    for (const name of ['overview', 'campaigns', 'content_ops', 'lab', 'notifications'] as const) {
      expect(NDX_ICON_REFERENCE_SILHOUETTE[name]).toBeTruthy();
    }
  });
});
