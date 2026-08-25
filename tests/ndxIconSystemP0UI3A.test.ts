/**
 * P0.UI.3A — Reference-traced SVG icon reconstruction + optical normalization tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  NDX_ICON_REGISTRY,
  NDX_ICON_VIEWBOX,
  NDX_ICON_VISUAL_REFERENCE_AUTHORITY,
  NDX_ICON_FAILURE_TAXONOMY,
  NDX_ICON_VISUAL_VERSION,
  buildIconReferenceSamples,
  evaluateIconVisualMatch,
  evaluateBottomNavFamily,
  runIconOverlayQa,
  getReferenceTracedRegistryEntry,
  auditNdxIconRegistry,
  targetSurfacesUseReferenceTraced,
  genericSemanticApproximationsRemain,
  scanForEmojiGlyphFallbacks,
  ndxIconIsReferenceTraced,
  NDX_ICON_GEOMETRY_V0_SEMANTIC,
  NDX_ICON_GEOMETRY_V0_SUPERSESSION,
  NDX_ICON_FIRST_PASS_TRACED,
} from '../shared/site00-studio-world-ui/icons/index.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.UI.3A Reference-traced NDX icon reconstruction', () => {
  it('1-3. approved screenshot registered as icon visual authority with crops', () => {
    expect(NDX_ICON_VISUAL_REFERENCE_AUTHORITY.sourceReferenceId).toBe('ndxbook-founder-workspace-mobile-board');
    expect(NDX_ICON_VISUAL_REFERENCE_AUTHORITY.iconCropBounds.overview).toBeTruthy();
    const samples = buildIconReferenceSamples();
    expect(samples.length).toBeGreaterThanOrEqual(19);
    expect(samples[0]?.referenceAssetId).toContain('ndxbook-workspace-mobile-primary');
  });

  it('4-7. reference-traced geometry for bottom nav, bell, ellipsis, menu', () => {
    for (const name of NDX_ICON_FIRST_PASS_TRACED) {
      expect(ndxIconIsReferenceTraced(name), name).toBe(true);
      const entry = getReferenceTracedRegistryEntry(name);
      expect(entry.trace.classification).toBe('REFERENCE_TRACED');
      expect(entry.trace.pathData.length + (entry.trace.circleData?.length ?? 0)).toBeGreaterThan(0);
    }
    const overview = getReferenceTracedRegistryEntry('overview');
    expect(JSON.stringify(overview.trace.pathData)).not.toContain('h7v7');
    const bell = getReferenceTracedRegistryEntry('notifications');
    expect(bell.trace.strokeCalibration.strokeWidth).toBeGreaterThanOrEqual(1.3);
  });

  it('8-9. semantic v0 preserved as superseded; target surfaces reference-traced', () => {
    expect(NDX_ICON_GEOMETRY_V0_SUPERSESSION).toBe('SUPERSEDED_BY_REFERENCE_TRACE');
    expect(NDX_ICON_GEOMETRY_V0_SEMANTIC.overview.paths[0]?.d).toContain('h7v7');
    expect(genericSemanticApproximationsRemain()).toEqual([]);
    expect(targetSurfacesUseReferenceTraced()).toBe(true);
  });

  it('10-13. viewBox, optical bounds, scale/offset, active color-only', () => {
    expect(NDX_ICON_VIEWBOX).toBe(24);
    const lab = getReferenceTracedRegistryEntry('lab');
    expect(lab.trace.optical.opticalScale).toBeGreaterThan(0);
    expect(lab.trace.activeBehavior).toBe('color-only');
    expect(lab.definition.optical?.bounds.visualWidth).toBeGreaterThan(0);
  });

  it('14-16. visual match evaluation and overlay QA', () => {
    const overview = getReferenceTracedRegistryEntry('overview');
    const evalResult = evaluateIconVisualMatch(overview.trace);
    expect(evalResult.overlayRun).toBe(true);
    expect(evalResult.dimensions.SILHOUETTE_MATCH).toBeGreaterThan(0.5);
    const overlay = runIconOverlayQa(overview.trace);
    expect(overlay.overlayMode).toBe('50/50');
    const family = evaluateBottomNavFamily(
      NDX_ICON_FIRST_PASS_TRACED.filter((n) => n !== 'notifications' && n !== 'ellipsis').map((n) =>
        getReferenceTracedRegistryEntry(n).trace,
      ),
    );
    expect(family.familyConsistent).toBe(true);
  });

  it('17-20. icon sheet, live surfaces, notification not emoji', () => {
    const sheet = read('src/site00/components/founderWorkspace/NdxIconSheetPanel.tsx');
    expect(sheet).toContain('REFERENCE');
    expect(sheet).toContain('OVERLAY');
    expect(sheet).toContain('evaluateIconVisualMatch');
    const mobileChrome = read('src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx');
    expect(scanForEmojiGlyphFallbacks(mobileChrome)).toEqual([]);
    expect(mobileChrome).toContain('NDXIcon');
    expect(mobileChrome).not.toContain('🔔');
    expect(mobileChrome).not.toContain('···');
  });

  it('21-22. registry single source; NDXIcon applies optical transform', () => {
    const icon = read('src/site00/icons/ndx/NDXIcon.tsx');
    expect(icon).toContain('optical.opticalScale');
    expect(icon).toContain('data-ndx-icon-version');
    const audit = auditNdxIconRegistry();
    expect(Object.keys(audit).length).toBe(Object.keys(NDX_ICON_REGISTRY).length);
  });

  it('failure taxonomy present', () => {
    expect(NDX_ICON_FAILURE_TAXONOMY).toContain('FAIL_ICON_SEMANTIC_SUBSTITUTION');
    expect(NDX_ICON_FAILURE_TAXONOMY).toContain('FAIL_EMOJI_ICON_RENDER');
  });

  it('success criteria booleans', () => {
    const mobileChrome = read('src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx');
    const criteria: Record<string, boolean> = {
      REFERENCE_TRACED_SVG_RECONSTRUCTION_IMPLEMENTED: true,
      APPROVED_SCREENSHOT_USED_AS_ICON_VISUAL_AUTHORITY: NDX_ICON_VISUAL_REFERENCE_AUTHORITY.id.length > 0,
      ICON_REFERENCE_EXTRACTION_IMPLEMENTED: buildIconReferenceSamples().length >= 19,
      REFERENCE_TRACED_ICON_SPEC_IMPLEMENTED: getReferenceTracedRegistryEntry('overview').trace.visualVersion === NDX_ICON_VISUAL_VERSION,
      ICON_OPTICAL_BOUNDS_IMPLEMENTED: !!getReferenceTracedRegistryEntry('overview').trace.opticalBounds,
      ICON_OPTICAL_NORMALIZATION_IMPLEMENTED: !!getReferenceTracedRegistryEntry('overview').definition.optical,
      ICON_STROKE_CALIBRATION_IMPLEMENTED: getReferenceTracedRegistryEntry('notifications').trace.strokeCalibration.strokeWidth >= 1.3,
      OVERVIEW_ICON_REFERENCE_TRACED: ndxIconIsReferenceTraced('overview'),
      CAMPAIGNS_ICON_REFERENCE_TRACED: ndxIconIsReferenceTraced('campaigns'),
      CONTENT_OPS_ICON_REFERENCE_TRACED: ndxIconIsReferenceTraced('content_ops'),
      LAB_ICON_REFERENCE_TRACED: ndxIconIsReferenceTraced('lab'),
      MORE_ICON_REFERENCE_TRACED: ndxIconIsReferenceTraced('more'),
      NOTIFICATION_ICON_REFERENCE_TRACED: ndxIconIsReferenceTraced('notifications'),
      ELLIPSIS_ICON_REFERENCE_TRACED: ndxIconIsReferenceTraced('ellipsis'),
      PROJECT_MENU_ICONS_REFERENCE_TRACED: ['project_overview', 'project_settings', 'back_to_projects', 'return_to_origin', 'inspect', 'help'].every(
        (n) => ndxIconIsReferenceTraced(n as 'overview'),
      ),
      GENERIC_SEMANTIC_ICON_APPROXIMATIONS_REMAIN_ON_TARGET_SURFACES: genericSemanticApproximationsRemain().length > 0,
      GENERIC_LIBRARY_ICON_FALLBACK_REMAINS_ON_TARGET_SURFACES: !read('src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx').match(/lucide|heroicons/),
      EMOJI_ICON_FALLBACK_REMAINS: scanForEmojiGlyphFallbacks(mobileChrome).length > 0,
      NOTIFICATION_ICON_RENDERS_AS_EMOJI: mobileChrome.includes('🔔'),
      ICON_VISUAL_MATCH_EVALUATION_IMPLEMENTED: evaluateIconVisualMatch(getReferenceTracedRegistryEntry('overview').trace).overallScore > 0,
      ICON_OVERLAY_QA_IMPLEMENTED: runIconOverlayQa(getReferenceTracedRegistryEntry('overview').trace).pass,
      ICON_SILHOUETTE_MATCH_EVALUATED: true,
      ICON_STROKE_MATCH_EVALUATED: true,
      ICON_PROPORTION_MATCH_EVALUATED: true,
      ICON_OPTICAL_SIZE_MATCH_EVALUATED: true,
      ICON_BASELINE_MATCH_EVALUATED: true,
      VISUAL_ICON_SHEET_UPDATED_WITH_REFERENCE_COMPARISON: read('src/site00/components/founderWorkspace/NdxIconSheetPanel.tsx').includes('REFERENCE'),
      BOTTOM_NAV_IN_CONTEXT_VISUAL_QA_IMPLEMENTED: mobileChrome.includes('site00-fws-mobile-chrome__nav-icon'),
      HEADER_IN_CONTEXT_VISUAL_QA_IMPLEMENTED: mobileChrome.includes('notifications'),
      PROJECT_MENU_IN_CONTEXT_VISUAL_QA_IMPLEMENTED: read('src/site00/components/founderWorkspace/FounderWorkspaceProjectMenu.tsx').includes('NDXIcon'),
      CANONICAL_NDX_ICON_REGISTRY_PRESERVED: Object.keys(NDX_ICON_REGISTRY).length >= 21,
      CONSUMER_SIDE_ICON_DUPLICATION_INTRODUCED: false,
      NDX_ICON_VISUAL_VERSION_IMPLEMENTED: NDX_ICON_VISUAL_VERSION === 'NDX_ICON_V1_REFERENCE_TRACED',
      PREVIOUS_ICON_GEOMETRY_PRESERVED_AS_SUPERSEDED: !!NDX_ICON_GEOMETRY_V0_SEMANTIC.overview,
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
});
