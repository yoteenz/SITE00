/**
 * SITE 00 authority firewall — host vs project-in-SITE-00 vs standalone brand product.
 */

export const SITE00_AUTHORITY_SCOPES = [
  'SITE00_HOST',
  'SITE00_PROJECT_CONTEXT',
  'BRAND_STANDALONE_PRODUCT',
  'CROSS_CONTEXT_REFERENCE',
] as const;

export type Site00AuthorityScope = (typeof SITE00_AUTHORITY_SCOPES)[number];

export type DesignTargetProduct = 'SITE00' | 'BRAND_STANDALONE';

export type DesignTargetContext = 'HOST' | 'PROJECTS' | 'STANDALONE_WEBSITE' | 'STANDALONE_APP';

export type DesignTargetDescriptor = {
  targetProduct: DesignTargetProduct;
  targetContext: DesignTargetContext;
  projectId?: string | null;
};

export type AuthorityDeliveryMode = 'AUTHORITY' | 'CROSS_CONTEXT_REFERENCE';

export const SITE00_HOST_PRODUCT = 'SITE00' as const;
export const SITE00_PROJECTS_CONTEXT = 'PROJECTS' as const;

/** Pages owned by SITE 00 host/product (not Projects > brand expression). */
export function isSite00HostOwnedPageId(pageId: string): boolean {
  const id = pageId.toLowerCase();
  if (id.startsWith('site00:')) return true;
  if (id.startsWith('host:')) return true;
  if (/^site00-(homepage|identity|builder|system|guide|about|account)/.test(id)) return true;
  return false;
}

export function classifyDesignTargetForPageConcept(input: {
  pageId: string;
  projectId: string;
  /** Override when caller knows the surface is host-owned. */
  forceHostContext?: boolean;
}): DesignTargetDescriptor {
  if (input.forceHostContext || isSite00HostOwnedPageId(input.pageId)) {
    return { targetProduct: SITE00_HOST_PRODUCT, targetContext: 'HOST', projectId: null };
  }
  return {
    targetProduct: SITE00_HOST_PRODUCT,
    targetContext: SITE00_PROJECTS_CONTEXT,
    projectId: input.projectId,
  };
}

export function validateAuthorityScopeForTarget(input: {
  designTarget: DesignTargetDescriptor;
  authorityScope: Site00AuthorityScope;
  deliveryMode: AuthorityDeliveryMode;
}): { ok: boolean; reason?: string } {
  const { designTarget, authorityScope, deliveryMode } = input;

  if (authorityScope === 'SITE00_HOST') {
    if (designTarget.targetProduct !== 'SITE00' || designTarget.targetContext !== 'HOST') {
      return { ok: false, reason: 'SITE00_HOST authority applies only to SITE 00 host/product pages' };
    }
    return { ok: true };
  }

  if (authorityScope === 'SITE00_PROJECT_CONTEXT') {
    if (deliveryMode === 'AUTHORITY') {
      if (designTarget.targetProduct !== 'SITE00' || designTarget.targetContext !== 'PROJECTS') {
        return {
          ok: false,
          reason:
            'SITE 00 project expression authority applies only to Projects > brand pages inside SITE 00',
        };
      }
      return { ok: true };
    }
    if (deliveryMode === 'CROSS_CONTEXT_REFERENCE') {
      return { ok: true };
    }
    return { ok: false, reason: 'Invalid delivery mode for SITE00_PROJECT_CONTEXT' };
  }

  if (authorityScope === 'BRAND_STANDALONE_PRODUCT') {
    if (
      designTarget.targetProduct !== 'BRAND_STANDALONE' ||
      (designTarget.targetContext !== 'STANDALONE_WEBSITE' &&
        designTarget.targetContext !== 'STANDALONE_APP')
    ) {
      return {
        ok: false,
        reason: 'Brand standalone digital authority applies only to independent website/app products',
      };
    }
    return { ok: true };
  }

  if (authorityScope === 'CROSS_CONTEXT_REFERENCE') {
    if (deliveryMode !== 'CROSS_CONTEXT_REFERENCE') {
      return { ok: false, reason: 'Cross-context material must use CROSS_CONTEXT_REFERENCE delivery' };
    }
    return { ok: true };
  }

  return { ok: false, reason: 'Unknown authority scope' };
}

/** Block using Projects expression as automatic authority on standalone products. */
export function validateProjectExpressionInheritance(input: {
  designTarget: DesignTargetDescriptor;
  crossContextReference?: boolean;
}): { ok: boolean; reason?: string } {
  if (input.designTarget.targetContext === 'HOST') {
    return {
      ok: false,
      reason: 'SITE 00 host pages must not inherit brand project expression authority',
    };
  }
  if (
    input.designTarget.targetProduct === 'BRAND_STANDALONE' &&
    !input.crossContextReference
  ) {
    return {
      ok: false,
      reason: 'Standalone brand products must not auto-inherit SITE 00 Projects expression',
    };
  }
  return { ok: true };
}

export function compileSite00HostAuthorityPromptStub(): string {
  return [
    'SITE00 HOST AUTHORITY (global shell — not brand project expression):',
    'Owns workspace navigation, Projects environment chrome, account/system UI, breadcrumbs,',
    'compiler states, SITE 00 host typography, red/system signaling, host interaction grammar.',
    'Do not replace host UI with promoted project expression.',
  ].join('\n');
}

export function compileComposerScopeGuardBlock(input: {
  designTarget: DesignTargetDescriptor;
  appliedAuthorityScope: Site00AuthorityScope | null;
}): string {
  const scope = input.appliedAuthorityScope ?? 'NONE';
  return `SCOPE GUARD: ${input.designTarget.targetProduct}/${input.designTarget.targetContext}; authority=${scope}; SITE 00×project fusion — not standalone brand website.`;
}

export function compileOpusScopeHandoffBlock(input: {
  designTarget: DesignTargetDescriptor;
  includesSite00ProjectExpression: boolean;
}): string {
  const lines = [
    'OPUS AUTHORITY SCOPE HANDOFF:',
    '1) SITE00_HOST_AUTHORITY',
  ];
  if (input.includesSite00ProjectExpression && input.designTarget.targetContext === 'PROJECTS') {
    lines.push('2) PROJECT_IN_SITE00_EXPRESSION_AUTHORITY (fusion grammar — not standalone NDXBOOK website)');
  } else {
    lines.push('2) PROJECT_IN_SITE00_EXPRESSION_AUTHORITY — OMIT (wrong context or standalone product)');
  }
  lines.push('3) PAGE FUNCTION MAP · 4) PAGE ARCHITECTURE · 5) PAGE FAMILY · 6) VIEWPORT AUTHORITY');
  return lines.join('\n');
}
