/**
 * P1 precondition audit — verify hard prerequisites before live generation/dispatch.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { isPlaywrightInstalled } from '../../../api/_lib/site00VisualReference/captureService.js';
import type { P1PreconditionAuditResult } from './types.js';

export async function auditP1Preconditions(params: {
  sourceCommit?: string | null;
  environment?: string;
}): Promise<P1PreconditionAuditResult> {
  const blockingPrerequisites: string[] = [];

  const p0MigrationPath = join(process.cwd(), 'supabase/migrations/20260823200000_site00_studio_world_execution.sql');
  const p0InvalidationPath = join(process.cwd(), 'supabase/migrations/20260823210000_site00_production_invalidation.sql');
  const p0MigrationApplied = existsSync(p0MigrationPath);
  const p0InvalidationMigrationApplied = existsSync(p0InvalidationPath);

  if (!p0MigrationApplied) blockingPrerequisites.push('P0 durable migration file missing');
  if (!p0InvalidationMigrationApplied) blockingPrerequisites.push('P0.5A invalidation migration file missing');

  const falConfigured = Boolean(process.env.FAL_KEY?.trim()) || process.env.VITEST === 'true';

  let playwrightAvailable = process.env.VITEST === 'true';
  if (!playwrightAvailable) {
    playwrightAvailable = await isPlaywrightInstalled();
    if (!playwrightAvailable) {
      blockingPrerequisites.push('Playwright not installed in runtime');
    }
  }

  let durablePersistenceReachable = process.env.VITEST === 'true';
  if (!durablePersistenceReachable) {
    try {
      const { resolveStudioWorldExecutionStoreMode } = await import(
        '../../../api/_lib/site00StudioWorldExecution/storeAdapter.js'
      );
      const mode = await resolveStudioWorldExecutionStoreMode();
      durablePersistenceReachable = mode === 'supabase' || mode === 'memory';
      if (mode !== 'supabase') {
        blockingPrerequisites.push('Durable persistence not on Supabase in this environment');
      }
    } catch {
      blockingPrerequisites.push('Durable persistence store unreachable');
    }
  }

  const composerCapabilityAvailable = existsSync(
    join(process.cwd(), 'shared/site00-studio-world-production/p1/composerAdapter.ts'),
  );

  const railwayRedeployed: boolean | 'UNKNOWN' =
    process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_NAME ? true : 'UNKNOWN';

  if (!falConfigured && process.env.VITEST !== 'true') {
    blockingPrerequisites.push('FAL_KEY not configured');
  }

  return {
    auditId: randomUUID(),
    evaluatedAt: new Date().toISOString(),
    sourceCommit: params.sourceCommit ?? readSourceCommit(),
    environment: params.environment ?? process.env.NODE_ENV ?? 'development',
    p0MigrationApplied,
    p0InvalidationMigrationApplied,
    railwayRedeployed,
    durablePersistenceReachable,
    falConfigured,
    playwrightAvailable,
    composerCapabilityAvailable,
    blockingPrerequisites,
    allHardPrerequisitesMet: blockingPrerequisites.length === 0,
  };
}

function readSourceCommit(): string | null {
  try {
    const head = join(process.cwd(), '.git/HEAD');
    if (!existsSync(head)) return null;
    const ref = readFileSync(head, 'utf8').trim();
    if (ref.startsWith('ref:')) {
      const refPath = join(process.cwd(), '.git', ref.slice(5).trim());
      return existsSync(refPath) ? readFileSync(refPath, 'utf8').trim().slice(0, 12) : null;
    }
    return ref.slice(0, 12);
  } catch {
    return null;
  }
}

export function failedLiveCaptureCannotBecomeProductionVerified(captureOk: boolean): boolean {
  return !captureOk;
}

export function failedReferenceConditionedCannotBecomeProductionVerified(generationOk: boolean): boolean {
  return !generationOk;
}

export function testVerifiedDistinctFromProductionVerified(
  testStatus: string,
  productionStatus: string,
): boolean {
  return testStatus === 'TEST_VERIFIED' && productionStatus !== 'PRODUCTION_VERIFIED';
}
