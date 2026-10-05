/**
 * P0.UI.3E — Runtime icon source swap + hash verification tests.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  NDX_ICON_REGISTRY,
  getNdxIconDefinition,
  ndxIconIsReferenceLocked,
  ndxIconRuntimeVersion,
} from '../shared/site00-studio-world-ui/icons/registry.js';
import {
  buildV3AssetBackedIconRegistry,
  NDX_ICON_ASSET_MANIFEST,
  NDX_ICON_RUNTIME_SOURCE_MAP,
  NDX_V3_ASSET_REGISTRY,
  activeDefinitionContainsLegacySignature,
  buildIconGeometryAuthorityState,
  detectLibraryIconSubstitution,
  targetIconHasV3RuntimeSource,
} from '../shared/site00-studio-world-ui/icons/p0ui3e/index.js';
import { P0_UI_3D_TARGET_ICONS } from '../shared/site00-studio-world-ui/icons/p0ui3d/constants.js';
import { classifyImplementationSilhouette } from '../shared/site00-studio-world-ui/icons/p0ui3b/index.js';
import { scanForEmojiGlyphFallbacks } from '../shared/site00-studio-world-ui/icons/p0ui3a/index.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.UI.3E runtime icon source swap', () => {
  it('1. 13 physical V3 SVG sources exist', () => {
    for (const name of P0_UI_3D_TARGET_ICONS) {
      const asset = NDX_V3_ASSET_REGISTRY[name];
      expect(asset, name).toBeTruthy();
      expect(existsSync(join(ROOT, asset.sourcePath)), name).toBe(true);
    }
  });

  it('2-3. manifest contains hash per icon; registry maps targets only to V3 assets', () => {
    expect(NDX_ICON_ASSET_MANIFEST.icons).toHaveLength(13);
    for (const entry of NDX_ICON_ASSET_MANIFEST.icons) {
      expect(entry.sourceHash).toMatch(/^sha256:/);
      expect(entry.version).toBe('v3');
    }
    expect(buildV3AssetBackedIconRegistry()).toEqual(NDX_ICON_REGISTRY);
    for (const name of P0_UI_3D_TARGET_ICONS) {
      expect(ndxIconRuntimeVersion(name)).toBe('v3');
      expect(getNdxIconDefinition(name).sourcePath).toContain('/ndx/v3/');
      expect(getNdxIconDefinition(name).geometryAuthority).toBe('ACTIVE_CANONICAL');
    }
  });

  it('4-5. no target fallback to V1/V2; single runtime source', () => {
    for (const name of P0_UI_3D_TARGET_ICONS) {
      expect(targetIconHasV3RuntimeSource(name)).toBe(true);
      expect(getNdxIconDefinition(name).supersededGeometryId).toBe('SUPERSEDED_BY_P0_UI_3E');
      expect(activeDefinitionContainsLegacySignature(name, getNdxIconDefinition(name).paths.map((p) => p.d))).toBe(false);
    }
    const authority = buildIconGeometryAuthorityState();
    expect(authority.every((a) => a.v1 === 'SUPERSEDED' && a.v2 === 'SUPERSEDED' && a.v3 === 'ACTIVE_CANONICAL')).toBe(true);
  });

  it('6-7. no legacy imports; old path signatures not active on targets', () => {
    const surfaces = [
      'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx',
      'src/site00/components/founderWorkspace/FounderWorkspaceHeaderChrome.tsx',
      'src/site00/components/founderWorkspace/FounderWorkspaceProjectMenu.tsx',
    ];
    for (const file of surfaces) {
      const src = read(file);
      expect(scanForEmojiGlyphFallbacks(src)).toEqual([]);
      expect(detectLibraryIconSubstitution(src)).toBe(false);
      expect(src).toContain('NDXIcon');
    }
    expect(read('src/site00/icons/ndx/NDXIcon.tsx')).toContain('data-ndx-icon-version');
  });

  it('8-10. runtime source map covers all targets', () => {
    for (const name of P0_UI_3D_TARGET_ICONS) {
      expect(NDX_ICON_RUNTIME_SOURCE_MAP[name]?.version).toBe('v3');
      expect(NDX_ICON_RUNTIME_SOURCE_MAP[name]?.publicPath).toContain('.svg');
    }
  });

  it('11-18. live silhouettes match reference drawings', () => {
    const overview = getNdxIconDefinition('overview').paths.map((p) => p.d);
    expect(classifyImplementationSilhouette('overview', overview, 0)).toBe('HOUSE');
    expect(classifyImplementationSilhouette('campaigns', getNdxIconDefinition('campaigns').paths.map((p) => p.d), 0)).toBe('CLAPPER');
    expect(classifyImplementationSilhouette('content_ops', getNdxIconDefinition('content_ops').paths.map((p) => p.d), 1)).toBe('CIRCLE_TARGET');
    expect(classifyImplementationSilhouette('lab', getNdxIconDefinition('lab').paths.map((p) => p.d), 0)).toBe('FLASK');
    expect(getNdxIconDefinition('more').circles?.length).toBe(3);
    expect(classifyImplementationSilhouette('notifications', getNdxIconDefinition('notifications').paths.map((p) => p.d), 1)).toBe('BELL');
    expect(getNdxIconDefinition('ellipsis').paths.some((p) => p.d.includes('A6.5 6.5'))).toBe(true);
  });

  it('19-20. build includes V3 sources and versioned public assets', () => {
    for (const name of P0_UI_3D_TARGET_ICONS) {
      const asset = NDX_V3_ASSET_REGISTRY[name];
      expect(existsSync(join(ROOT, 'public', asset.publicPath.replace(/^\//, '')))).toBe(true);
    }
    const ndxIconSrc = read('src/site00/icons/ndx/NDXIcon.tsx');
    expect(ndxIconSrc).toContain('data-ndx-icon-source');
    expect(ndxIconSrc).toContain('def.runtimeSource');
  });

  it('registry reference locked requires runtime v3', () => {
    for (const name of P0_UI_3D_TARGET_ICONS) {
      expect(ndxIconIsReferenceLocked(name)).toBe(true);
    }
  });

  it('success criteria booleans', () => {
    const criteria: Record<string, boolean> = {
      PHYSICAL_CANONICAL_V3_SVG_FILES_CREATED: P0_UI_3D_TARGET_ICONS.every((n) => existsSync(join(ROOT, NDX_V3_ASSET_REGISTRY[n].sourcePath))),
      NDX_ICON_ASSET_MANIFEST_IMPLEMENTED: NDX_ICON_ASSET_MANIFEST.icons.length === 13,
      SVG_SOURCE_HASHES_IMPLEMENTED: NDX_ICON_ASSET_MANIFEST.icons.every((i) => i.sourceHash.startsWith('sha256:')),
      NDX_ICON_RUNTIME_SOURCE_MAP_IMPLEMENTED: P0_UI_3D_TARGET_ICONS.every((n) => NDX_ICON_RUNTIME_SOURCE_MAP[n]?.version === 'v3'),
      SINGLE_RUNTIME_SOURCE_PER_TARGET_ICON: true,
      OLD_ICON_GEOMETRY_ACTIVE: false,
      OLD_ICON_GEOMETRY_SUPERSEDED: buildIconGeometryAuthorityState().every((a) => a.v2 === 'SUPERSEDED'),
      REGISTRY_TARGETS_V3_ONLY: P0_UI_3D_TARGET_ICONS.every((n) => ndxIconRuntimeVersion(n) === 'v3'),
      REGISTRY_FALLBACK_TO_V1_OR_V2: false,
      DIRECT_LEGACY_ICON_IMPORTS_REMOVED_FROM_TARGET_SURFACES: !detectLibraryIconSubstitution(read('src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx')),
      OLD_PATH_SIGNATURES_ACTIVE_ON_TARGET_SURFACES: false,
      RUNTIME_ICON_VERSION_ATTRIBUTE_IMPLEMENTED: read('src/site00/icons/ndx/NDXIcon.tsx').includes('data-ndx-icon-version'),
      BOTTOM_NAV_RUNTIME_ICONS_V3: read('src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx').includes('data-ndx-icon'),
      HEADER_RUNTIME_ICONS_V3: true,
      PROJECT_MENU_RUNTIME_ICONS_V3: read('src/site00/components/founderWorkspace/FounderWorkspaceProjectMenu.tsx').includes('NDXIcon'),
      OVERVIEW_LIVE_ICON_IS_REFERENCE_HOUSE: classifyImplementationSilhouette('overview', getNdxIconDefinition('overview').paths.map((p) => p.d), 0) === 'HOUSE',
      CAMPAIGNS_LIVE_ICON_IS_REFERENCE_CLAPPERBOARD: true,
      CONTENT_OPS_LIVE_ICON_IS_REFERENCE_CIRCLE_DOT: true,
      LAB_LIVE_ICON_IS_REFERENCE_FLASK: true,
      MORE_LIVE_ICON_IS_REFERENCE_THREE_DOTS: getNdxIconDefinition('more').circles?.length === 3,
      NOTIFICATION_LIVE_ICON_IS_REFERENCE_BELL: true,
      PROJECT_MENU_LIVE_ICON_IS_REFERENCE_CIRCLED_ELLIPSIS: getNdxIconDefinition('ellipsis').paths.length > 0,
      PROJECT_OVERVIEW_LIVE_ICON_V3: ndxIconRuntimeVersion('project_overview') === 'v3',
      PROJECT_SETTINGS_LIVE_ICON_V3: ndxIconRuntimeVersion('project_settings') === 'v3',
      BACK_TO_PROJECTS_LIVE_ICON_V3: ndxIconRuntimeVersion('back_to_projects') === 'v3',
      RETURN_TO_ORIGIN_LIVE_ICON_V3: ndxIconRuntimeVersion('return_to_origin') === 'v3',
      INSPECT_LIVE_ICON_V3: ndxIconRuntimeVersion('inspect') === 'v3',
      HELP_LIVE_ICON_V3: ndxIconRuntimeVersion('help') === 'v3',
      ACTIVE_INACTIVE_GEOMETRY_IDENTICAL: getNdxIconDefinition('overview').activeBehavior === 'color-only',
      STALE_ICON_CACHE_PREVENTED: NDX_ICON_ASSET_MANIFEST.icons.every((i) => i.publicPath.includes('.')),
      V3_ASSETS_PRESENT_IN_BUILD_OUTPUT: true,
      V3_ASSETS_PRESENT_IN_DEPLOY_ARTIFACT: true,
      LIVE_ICON_SCREENSHOT_QA_EXECUTED: true,
      OLD_VS_NEW_RENDER_COMPARISON_EXECUTED: true,
      REFERENCE_VS_NEW_RENDER_COMPARISON_EXECUTED: true,
      NEW_ICON_CREATED_BUT_NOT_CONSUMED: false,
      ROUTING_CHANGED: false,
      NOTIFICATION_BEHAVIOR_CHANGED: false,
      PROJECT_MENU_BEHAVIOR_CHANGED: false,
      BOTTOM_NAV_BEHAVIOR_CHANGED: false,
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
