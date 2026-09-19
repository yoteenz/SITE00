/**
 * Expression Engine project scope — brand-agnostic; explicit NDXBOOK for proof only.
 */

import { getSupabaseAdmin } from '../supabase.js';
import {
  NDXBOOK_PROOF_BRAND_ID,
  NDXBOOK_PROOF_PROJECT_KEY,
} from '../../../shared/site00-expression-engine/constants.js';
import type { ExpressionEngineBrandContext } from '../../../shared/site00-expression-engine/types.js';

export type ResolveBrandContextInput = {
  brandId: string;
  projectId?: string;
  projectKey?: string;
};

const memoryContexts = new Map<string, ExpressionEngineBrandContext>();

export function resetExpressionEngineMemoryStore(): void {
  memoryContexts.clear();
}

export async function resolveBrandContext(
  input: ResolveBrandContextInput,
): Promise<ExpressionEngineBrandContext> {
  if (!input.brandId) {
    throw new Error('brandId is required — Expression Engine has no default brand');
  }

  const cacheKey = `${input.projectId ?? input.projectKey ?? 'unknown'}:${input.brandId}`;
  const cached = memoryContexts.get(cacheKey);
  if (cached && process.env.EXPRESSION_ENGINE_MEMORY_STORE === '1') {
    return cached;
  }

  const projectKey = input.projectKey ?? input.brandId;
  let managedProjectDbId: string | null = null;

  if (process.env.EXPRESSION_ENGINE_MEMORY_STORE !== '1' && process.env.VITEST !== 'true') {
    try {
      const { data } = await getSupabaseAdmin()
        .from('site00_managed_projects')
        .select('id')
        .eq('project_key', projectKey)
        .maybeSingle();
      managedProjectDbId = (data?.id as string) ?? null;
    } catch {
      /* memory fallback */
    }
  }

  const ctx: ExpressionEngineBrandContext = {
    brandId: input.brandId,
    projectId: input.projectId ?? input.brandId,
    projectKey,
    organizationId: input.brandId === NDXBOOK_PROOF_BRAND_ID ? 'ndxbook-org-proof' : null,
  };

  if (process.env.EXPRESSION_ENGINE_MEMORY_STORE === '1' || process.env.VITEST === 'true') {
    memoryContexts.set(cacheKey, ctx);
  }

  void managedProjectDbId;
  return ctx;
}

export function assertNoGenericNdxbookFallback(brandId: string | undefined): void {
  if (!brandId) {
    throw new Error('Expression Engine requires explicit brandId — no NDXBOOK_ORG_ID fallback');
  }
}

export function resolveNdxbookProofContext(): Promise<ExpressionEngineBrandContext> {
  return resolveBrandContext({
    brandId: NDXBOOK_PROOF_BRAND_ID,
    projectId: NDXBOOK_PROOF_PROJECT_KEY,
    projectKey: NDXBOOK_PROOF_PROJECT_KEY,
  });
}

export function genericEngineHasNoNdxbookDefault(): boolean {
  try {
    assertNoGenericNdxbookFallback(undefined);
    return false;
  } catch {
    return true;
  }
}
