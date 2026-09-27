/**
 * P0.VR.PROMOTED-PROJECT-VISUAL-AUTHORITY-AND-CAPTURE-SANITATION1
 */

import { describe, expect, it } from 'vitest';

import {
  buildScreenshotSanitationMap,
  isDeviceOrBrowserChromeLabel,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptScreenshotSanitationMap.js';
import {
  assertRunMobileCanvasConsistency,
  SITE00_MOBILE_GENERATION_CANVAS,
  validateConceptCanvas,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportCanvasContract.js';
import { normalizeConceptArtifact } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptConceptArtifactNormalization.js';
import {
  compileOpusProjectVisualAuthorityBlock,
  compileProjectVisualAuthorityPromptBlock,
  createExplicitCrossProjectDesignFamilyReference,
  emptyProjectVisualAuthorityRegistry,
  getActiveProjectVisualAuthority,
  promoteProjectVisualAuthority,
  resolveProjectVisualAuthorityForPage,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/projectVisualAuthority.js';
import { compileFounderCreativePreferenceBlock } from '../shared/site00-design-workspace-production/pageConceptPipeline/founderCreativePreferenceProfile.js';
import { interpretScreenshotFunctionality } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptScreenshotFunctionalPageMap.js';
import { mockGpt2MobileProviderReferenceBundleForTest } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileReferenceAuthority.js';

describe('P0.VR capture sanitation + project visual authority', () => {
  it('excludes device chrome bands from product bounds on tall captures', () => {
    const map = buildScreenshotSanitationMap({
      captureId: 'cap-1',
      captureWidth: 390,
      captureHeight: 844,
    });
    expect(map.excludedRegions.some((r) => r.type === 'IOS_STATUS_BAR')).toBe(true);
    expect(map.productBounds.height).toBeLessThan(map.captureHeight);
    expect(map.productBounds.y).toBeGreaterThan(0);
  });

  it('flags browser/status chrome labels for function map exclusion', () => {
    expect(isDeviceOrBrowserChromeLabel('Safari address bar')).toBe(true);
    expect(isDeviceOrBrowserChromeLabel('PROJECT BOTTOM NAV')).toBe(false);
  });

  it('strips chrome-like registry labels from screenshot function map elements', () => {
    const bundle = mockGpt2MobileProviderReferenceBundleForTest();
    const map = interpretScreenshotFunctionality({
      captureSetId: 'cs-1',
      providerReferenceBundle: bundle,
      projectContext: { projectId: 'ndxbook', projectName: 'NDXBOOK', moduleLabel: 'DESIGN' },
      pageContext: {
        pageId: 'ndxbook:overview',
        pageName: 'Overview',
        pageRole: 'overview',
        projectId: 'ndxbook',
      },
      functionContract: {
        contractId: 'fc-1',
        route: '/projects/ndxbook/overview',
        requiredFunctions: [],
        optionalFunctions: [],
      },
      pageArchitectureBrief: null,
    });
    expect(map.elements.every((e) => !/safari|status bar|home indicator/i.test(e.label))).toBe(true);
    expect(map.functionalInvariants.some((l) => l.includes('DEVICE / BROWSER CHROME'))).toBe(true);
  });

  it('locks A/B/C to one canonical canvas size per run', () => {
    const check = assertRunMobileCanvasConsistency([
      { width: 780, height: 1688 },
      { width: 780, height: 1688 },
      { width: 780, height: 1688 },
    ]);
    expect(check.ok).toBe(true);
    expect(SITE00_MOBILE_GENERATION_CANVAS.width).toBe(780);
  });

  it('rejects mismatched aspect ratio and letterboxed canvases', () => {
    const badAspect = validateConceptCanvas({ width: 900, height: 900 });
    expect(badAspect.ok).toBe(false);
    const letterbox = validateConceptCanvas({ width: 1200, height: 1688 });
    expect(letterbox.ok).toBe(false);
  });

  it('creates project visual authority only on explicit promotion', () => {
    let registry = emptyProjectVisualAuthorityRegistry();
    expect(getActiveProjectVisualAuthority(registry, 'ndxbook')).toBeNull();
    const promoted = promoteProjectVisualAuthority({
      registry,
      projectId: 'ndxbook',
      sourcePageId: 'ndxbook:overview',
      sourceConceptId: 'mc-a',
      sourceTerritoryId: 'ter-a',
      sourceArtifactId: 'art-a',
      sourceViewport: 'MOBILE',
      artifactWidth: 780,
      artifactHeight: 1688,
      artifactStatus: 'READY',
      compile: { cgptBrief: null, skinContract: null, webTerritory: null, ndxBrief: null },
    });
    registry = promoted.registry;
    expect(promoted.record.version).toBe(1);
    expect(getActiveProjectVisualAuthority(registry, 'ndxbook')?.record.sourceConceptId).toBe('mc-a');
  });

  it('does not create authority from gallery selection alone (no promote call)', () => {
    const registry = emptyProjectVisualAuthorityRegistry();
    expect(getActiveProjectVisualAuthority(registry, 'ndxbook')).toBeNull();
  });

  it('inherits grammar to same-project pages without cloning layout language', () => {
    let registry = emptyProjectVisualAuthorityRegistry();
    const promoted = promoteProjectVisualAuthority({
      registry,
      projectId: 'ndxbook',
      sourcePageId: 'ndxbook:overview',
      sourceConceptId: 'mc-a',
      sourceTerritoryId: null,
      sourceArtifactId: 'art-a',
      sourceViewport: 'MOBILE',
      artifactWidth: 780,
      artifactHeight: 1688,
      artifactStatus: 'READY',
      compile: { cgptBrief: null, skinContract: null, webTerritory: null, ndxBrief: null },
    });
    registry = promoted.registry;
    const inherited = resolveProjectVisualAuthorityForPage({
      registry,
      projectId: 'ndxbook',
      pageId: 'ndxbook:entry-detail',
    });
    expect(inherited?.sourcePageId).toBe('ndxbook:overview');
    expect(inherited?.grammarOnlyNotice).toContain('not Overview layout');
  });

  it('does not auto-inherit NDXBOOK authority into astral-world', () => {
    let registry = emptyProjectVisualAuthorityRegistry();
    const promoted = promoteProjectVisualAuthority({
      registry,
      projectId: 'ndxbook',
      sourcePageId: 'ndxbook:overview',
      sourceConceptId: 'mc-a',
      sourceTerritoryId: null,
      sourceArtifactId: 'art-a',
      sourceViewport: 'MOBILE',
      artifactWidth: 780,
      artifactHeight: 1688,
      artifactStatus: 'READY',
      compile: { cgptBrief: null, skinContract: null, webTerritory: null, ndxBrief: null },
    });
    registry = promoted.registry;
    expect(
      resolveProjectVisualAuthorityForPage({
        registry,
        projectId: 'astral-world',
        pageId: 'astral-world:hub',
      }),
    ).toBeNull();
  });

  it('allows explicit cross-project reuse only via founder action record', () => {
    let registry = emptyProjectVisualAuthorityRegistry();
    const promoted = promoteProjectVisualAuthority({
      registry,
      projectId: 'ndxbook',
      sourcePageId: 'ndxbook:overview',
      sourceConceptId: 'mc-a',
      sourceTerritoryId: null,
      sourceArtifactId: 'art-a',
      sourceViewport: 'MOBILE',
      artifactWidth: 780,
      artifactHeight: 1688,
      artifactStatus: 'READY',
      compile: { cgptBrief: null, skinContract: null, webTerritory: null, ndxBrief: null },
    });
    registry = promoted.registry;
    registry = createExplicitCrossProjectDesignFamilyReference({
      registry,
      sourceProjectId: 'ndxbook',
      targetProjectId: 'astral-world',
      founderActionId: 'founder-explicit-cross-project',
    });
    const ref = registry.crossProjectReferences[0]!;
    const inherited = resolveProjectVisualAuthorityForPage({
      registry,
      projectId: 'astral-world',
      pageId: 'astral-world:hub',
      crossProjectRef: ref,
    });
    expect(inherited?.projectId).toBe('ndxbook');
  });

  it('versions authority on subsequent promotions', () => {
    let registry = emptyProjectVisualAuthorityRegistry();
    const v1 = promoteProjectVisualAuthority({
      registry,
      projectId: 'ndxbook',
      sourcePageId: 'ndxbook:overview',
      sourceConceptId: 'mc-a',
      sourceTerritoryId: null,
      sourceArtifactId: 'art-a',
      sourceViewport: 'MOBILE',
      artifactWidth: 780,
      artifactHeight: 1688,
      artifactStatus: 'READY',
      compile: { cgptBrief: null, skinContract: null, webTerritory: null, ndxBrief: null },
    });
    registry = v1.registry;
    const v2 = promoteProjectVisualAuthority({
      registry,
      projectId: 'ndxbook',
      sourcePageId: 'ndxbook:overview',
      sourceConceptId: 'mc-b',
      sourceTerritoryId: null,
      sourceArtifactId: 'art-b',
      sourceViewport: 'MOBILE',
      artifactWidth: 780,
      artifactHeight: 1688,
      artifactStatus: 'READY',
      compile: { cgptBrief: null, skinContract: null, webTerritory: null, ndxBrief: null },
    });
    expect(v2.record.version).toBe(2);
    expect(getActiveProjectVisualAuthority(v2.registry, 'ndxbook')?.record.sourceConceptId).toBe('mc-b');
  });

  it('feeds Composer/GPT2 and Opus prompt blocks from project authority contract', () => {
    const { contract } = promoteProjectVisualAuthority({
      registry: emptyProjectVisualAuthorityRegistry(),
      projectId: 'ndxbook',
      sourcePageId: 'ndxbook:overview',
      sourceConceptId: 'mc-a',
      sourceTerritoryId: null,
      sourceArtifactId: 'art-a',
      sourceViewport: 'MOBILE',
      artifactWidth: 780,
      artifactHeight: 1688,
      artifactStatus: 'READY',
      compile: { cgptBrief: null, skinContract: null, webTerritory: null, ndxBrief: null },
    });
    const composerBlock = compileProjectVisualAuthorityPromptBlock(contract);
    expect(composerBlock).toContain('PROJECT VISUAL AUTHORITY');
    expect(compileOpusProjectVisualAuthorityBlock(contract)).toContain('OPUS PROJECT VISUAL AUTHORITY');
    expect(compileFounderCreativePreferenceBlock).toBeDefined();
  });

  it('normalizeConceptArtifact rejects invalid canvas before promotion', () => {
    const bad = normalizeConceptArtifact({ width: 400, height: 400, artifactStatus: 'READY' });
    expect(bad.ok).toBe(false);
  });
});
