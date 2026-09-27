/**
 * P0.VR.PROJECT-IN-SITE00-EXPRESSION-AUTHORITY-SCOPE-CORRECTION1
 */

import { describe, expect, it } from 'vitest';

import {
  classifyDesignTargetForPageConcept,
  isSite00HostOwnedPageId,
  validateAuthorityScopeForTarget,
  validateProjectExpressionInheritance,
  compileOpusScopeHandoffBlock,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/site00AuthorityScope.js';
import { compileBrandDigitalProductAuthorityStub } from '../shared/site00-design-workspace-production/pageConceptPipeline/brandDigitalProductAuthority.js';
import {
  compileOpusSite00ProjectExpressionBlock,
  compileSite00ProjectExpressionPromptBlock,
  createExplicitCrossContextDesignReference,
  emptyProjectVisualAuthorityRegistry,
  promoteProjectVisualAuthority,
  resolveProjectVisualAuthorityForPage,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/projectVisualAuthority.js';
import {
  compileFounderCreativePreferenceBlock,
  DEFAULT_FOUNDER_CREATIVE_PREFERENCE_PROFILE,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/founderCreativePreferenceProfile.js';

describe('P0.VR SITE 00 project expression authority scope', () => {
  it('defines authority scope enum values', () => {
    expect(
      validateAuthorityScopeForTarget({
        designTarget: { targetProduct: 'SITE00', targetContext: 'PROJECTS', projectId: 'ndxbook' },
        authorityScope: 'SITE00_PROJECT_CONTEXT',
        deliveryMode: 'AUTHORITY',
      }).ok,
    ).toBe(true);
  });

  it('allows NDXBOOK Projects page + SITE00 project expression', () => {
    const target = classifyDesignTargetForPageConcept({
      pageId: 'ndxbook:overview',
      projectId: 'ndxbook',
    });
    expect(
      validateAuthorityScopeForTarget({
        designTarget: target,
        authorityScope: 'SITE00_PROJECT_CONTEXT',
        deliveryMode: 'AUTHORITY',
      }).ok,
    ).toBe(true);
  });

  it('blocks SITE 00 host page from inheriting NDXBOOK project expression', () => {
    expect(isSite00HostOwnedPageId('site00:about')).toBe(true);
    const hostTarget = classifyDesignTargetForPageConcept({
      pageId: 'site00:about',
      projectId: 'ndxbook',
    });
    expect(hostTarget.targetContext).toBe('HOST');
    expect(
      validateProjectExpressionInheritance({ designTarget: hostTarget }).ok,
    ).toBe(false);
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
        projectId: 'ndxbook',
        pageId: 'site00:about',
        designTarget: hostTarget,
      }),
    ).toBeNull();
  });

  it('blocks standalone NDXBOOK website from auto-inheriting Projects expression', () => {
    const standaloneTarget = {
      targetProduct: 'BRAND_STANDALONE' as const,
      targetContext: 'STANDALONE_WEBSITE' as const,
      projectId: 'ndxbook',
    };
    expect(
      validateProjectExpressionInheritance({ designTarget: standaloneTarget }).ok,
    ).toBe(false);
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
        projectId: 'ndxbook',
        pageId: 'ndxbook:marketing-home',
        designTarget: standaloneTarget,
      }),
    ).toBeNull();
    expect(compileBrandDigitalProductAuthorityStub('ndxbook')).toContain('Does NOT auto-inherit');
  });

  it('requires founder action for cross-context reference', () => {
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
    registry = createExplicitCrossContextDesignReference({
      registry,
      sourceProjectId: 'ndxbook',
      targetProjectId: 'astral-world',
      targetContext: 'SITE00_PROJECTS',
      founderActionId: 'founder-explicit',
    });
    const ref = registry.crossContextReferences[0]!;
    const inherited = resolveProjectVisualAuthorityForPage({
      registry,
      projectId: 'astral-world',
      pageId: 'astral-world:overview',
      designTarget: classifyDesignTargetForPageConcept({
        pageId: 'astral-world:overview',
        projectId: 'astral-world',
      }),
      crossContextRef: ref,
    });
    expect(inherited?.projectId).toBe('ndxbook');
    expect(ref.deliveryMode).toBe('CROSS_CONTEXT_REFERENCE');
  });

  it('does not auto-inherit NDXBOOK expression into astral-world without explicit reference', () => {
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
        pageId: 'astral-world:overview',
        designTarget: classifyDesignTargetForPageConcept({
          pageId: 'astral-world:overview',
          projectId: 'astral-world',
        }),
      }),
    ).toBeNull();
  });

  it('scopes prompt blocks to SITE 00 project context fusion', () => {
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
    const block = compileSite00ProjectExpressionPromptBlock(contract);
    expect(block).toContain('SITE 00 PROJECT EXPRESSION');
    expect(block).toContain('SITE00_PROJECT_CONTEXT');
    expect(block).not.toContain('GLOBAL NDXBOOK');
    const opus = compileOpusSite00ProjectExpressionBlock(
      contract,
      classifyDesignTargetForPageConcept({ pageId: 'ndxbook:entry', projectId: 'ndxbook' }),
    );
    expect(opus).toContain('OPUS AUTHORITY SCOPE HANDOFF');
    expect(opus).toContain('SITE00_HOST_AUTHORITY');
    expect(compileOpusScopeHandoffBlock({
      designTarget: { targetProduct: 'BRAND_STANDALONE', targetContext: 'STANDALONE_WEBSITE' },
      includesSite00ProjectExpression: false,
    })).toContain('OMIT');
  });

  it('keeps founder creative preference cross-project without brand grammar copy', () => {
    expect(compileFounderCreativePreferenceBlock).toBeDefined();
    const block = compileFounderCreativePreferenceBlock(DEFAULT_FOUNDER_CREATIVE_PREFERENCE_PROFILE);
    expect(block).toContain('FOUNDER CREATIVE PREFERENCE');
    expect(block).not.toContain('NDXBOOK');
  });
});
