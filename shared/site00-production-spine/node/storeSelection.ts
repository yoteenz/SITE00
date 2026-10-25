import path from 'node:path';

/**
 * Which record store and media store a spine server opens (§12). The choice is explicit and never falls back: a
 * misconfigured or unreachable durable store is an error (HTTP 503), not a quiet switch to memory or to files.
 *
 *   SITE00_PRODUCTION_RECORD_STORE   unset | repository   repository JSON, read-only: the planning catalogue. Nothing
 *                                                         can be written, so no approval can land somewhere fragile.
 *                                    fixture              TEST FIXTURE records and media under
 *                                                         SITE00_PRODUCTION_SPINE_FIXTURE_ROOT (outside the repository);
 *                                                         refused when NODE_ENV=production
 *                                    supabase             durable Postgres records + private Storage bucket, through the
 *                                                         service role. Needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and
 *                                                         SITE00_PRODUCTION_SPINE_ENVIRONMENT=STAGING | PRODUCTION.
 *                                                         PRODUCTION also needs SITE00_PRODUCTION_SPINE_DEPLOYMENT=FOUNDER_APPROVED.
 *   SITE00_PRODUCTION_MEDIA_BUCKET   private bucket for masters (default site00-production-masters)
 *   SITE00_MEDIA_SIGNING_SECRET      32+ characters; signs the short-lived media links the API serves
 */

export const RECORD_STORE_ENV = 'SITE00_PRODUCTION_RECORD_STORE';
export const SPINE_ENVIRONMENT_ENV = 'SITE00_PRODUCTION_SPINE_ENVIRONMENT';
export const PRODUCTION_APPROVAL_ENV = 'SITE00_PRODUCTION_SPINE_DEPLOYMENT';
export const DEFAULT_MASTERS_BUCKET = 'site00-production-masters';

export type StorePlan =
  | { ok: true; mode: 'repository'; label: string; readOnlyReason: string }
  | { ok: true; mode: 'fixture'; label: string; root: string }
  | { ok: true; mode: 'supabase'; label: string; environment: 'STAGING' | 'PRODUCTION'; bucket: string }
  | { ok: false; code: string; error: string };

export function planSpineStore(env: Readonly<Record<string, string | undefined>>, repoRoot: string): StorePlan {
  const mode = (env[RECORD_STORE_ENV]?.trim() || 'repository').toLowerCase();
  const production = env.NODE_ENV === 'production';
  if (mode === 'repository')
    return {
      ok: true,
      mode,
      label: 'repository JSON (planning catalogue, read-only)',
      readOnlyReason: `DURABLE_STORE_NOT_CONFIGURED: ${RECORD_STORE_ENV} is not supabase; the repository catalogue is read-only, so no decision can be recorded`,
    };
  if (mode === 'fixture') {
    if (production) return { ok: false, code: 'FIXTURE_STORE_IN_PRODUCTION', error: 'the fixture store is for development and tests only' };
    const root = env.SITE00_PRODUCTION_SPINE_FIXTURE_ROOT?.trim();
    if (!root) return { ok: false, code: 'STORE_NOT_CONFIGURED', error: 'fixture mode needs SITE00_PRODUCTION_SPINE_FIXTURE_ROOT' };
    const abs = path.resolve(root);
    if (abs === path.resolve(repoRoot) || abs.startsWith(path.resolve(repoRoot) + path.sep)) return { ok: false, code: 'FIXTURE_ROOT_IN_REPOSITORY', error: 'test fixtures never live in the repository' };
    return { ok: true, mode, label: `TEST FIXTURE JSON at ${abs}`, root: abs };
  }
  if (mode === 'supabase') {
    const environment = env[SPINE_ENVIRONMENT_ENV]?.trim().toUpperCase();
    if (environment !== 'STAGING' && environment !== 'PRODUCTION') return { ok: false, code: 'STORE_NOT_CONFIGURED', error: `${SPINE_ENVIRONMENT_ENV} must be STAGING or PRODUCTION` };
    if (environment === 'PRODUCTION' && env[PRODUCTION_APPROVAL_ENV]?.trim() !== 'FOUNDER_APPROVED') return { ok: false, code: 'PRODUCTION_STORE_NOT_APPROVED', error: `the production record store opens only after the founder approves the deployment (${PRODUCTION_APPROVAL_ENV}=FOUNDER_APPROVED)` };
    if (environment === 'STAGING' && production && env.SITE00_ALLOW_STAGING_STORE_IN_PRODUCTION !== '1') return { ok: false, code: 'ENVIRONMENT_MISMATCH', error: 'a production server does not read the staging record store' };
    if (!env.SUPABASE_URL?.trim() || !env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return { ok: false, code: 'STORE_NOT_CONFIGURED', error: 'supabase mode needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server' };
    const bucket = env.SITE00_PRODUCTION_MEDIA_BUCKET?.trim() || DEFAULT_MASTERS_BUCKET;
    return { ok: true, mode, label: `${environment} Supabase`, environment, bucket };
  }
  return { ok: false, code: 'STORE_NOT_CONFIGURED', error: `${RECORD_STORE_ENV}=${mode} is not a record store (repository, fixture or supabase)` };
}
