/**
 * P0.VR.REPLICATION.3B-R1 — Browser process crash patch + failure classification.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  isVitestRuntime,
  resolveClientApiBase,
  classifyReplicationBuildError,
  visionStagesForRuntimeCrash,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3b/index.js';
import { initReplicationExecutionReceipt } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication1R1/replicationExecutionReceipt.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

describe('P0.VR.REPLICATION.3B-R1', () => {
  it('clientSafeRuntime does not reference bare process.env in source', () => {
    const client = read('shared/site00-studio-world-production/visualReconstruction/p0vrReplication3b/visionReplicationClient.ts');
    const exec = read('shared/site00-studio-world-production/visualReconstruction/p0vrReplication3b/executeVisionLiteralNdxReplication.ts');
    const playwright = read('shared/site00-studio-world-production/visualReconstruction/p0vrReplication3b/playwrightVisionLoop.ts');
    expect(client).not.toMatch(/process\.env\.VITEST/);
    expect(exec).not.toMatch(/process\.env\.VITEST/);
    expect(playwright).not.toMatch(/process\.env/);
    expect(client).toContain('isVitestRuntime');
  });

  it('isVitestRuntime is true under vitest', () => {
    expect(isVitestRuntime()).toBe(true);
  });

  it('classifies process ReferenceError as CLIENT_RUNTIME_REPLICATION_ERROR', () => {
    const c = classifyReplicationBuildError("Can't find variable: process");
    expect(c.errorCode).toBe('CLIENT_RUNTIME_REPLICATION_ERROR');
    expect(c.failureClass).toBe('CLIENT_RUNTIME_ERROR');
    expect(c.showSwitchImplementationStrategy).toBe(false);
  });

  it('vision stages for runtime crash stop before vision request', () => {
    const stages = visionStagesForRuntimeCrash();
    expect(stages.visionRequestPreparation).toBe('FAIL');
    expect(stages.visionRequest).toBe('NOT_STARTED');
  });

  it('init receipt does not default to SWITCH_IMPLEMENTATION_APPROACH', () => {
    const receipt = initReplicationExecutionReceipt('s1');
    expect(receipt.nextStrategy).toBeNull();
  });

  it('server vision module is not imported from client twin components', () => {
    const ui = read('src/site00/components/reconstruction/VisionLiteralNdxOverviewTwin.tsx');
    expect(ui).not.toContain('visionReplicationAnthropic');
    expect(ui).not.toContain('ANTHROPIC_API_KEY');
  });

  it('vision API route remains server-only boundary', () => {
    const api = read('api/site00/vision-replication.ts');
    expect(api).toContain('visionReplicationAnthropic');
    expect(resolveClientApiBase).toBeDefined();
  });
});
