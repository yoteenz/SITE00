import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import {
  GROK_TWIN_TEST_A_API_PATH,
  GROK_TWIN_TEST_A_PRODUCTION_API_ORIGIN,
  P0_VR_DESIGNBENCH_GROK1_BUILD,
  P0_VR_DESIGNBENCH_GROK1F2_LINEAGE,
} from '../shared/site00-design-bench/grokTwinTestA/constants.js';
import { GROK_DESIGN_BENCH_MODEL_ID } from '../shared/site00-design-bench/grokTwinTestA/modelContract.js';
import {
  grokDesignBenchApiKey,
  grokDesignBenchHostDiagnostic,
} from '../api/_lib/site00GrokDesignBench/grokVisionProvider.js';
import {
  grokTwinTestAPayloadReportsMissingHostKey,
  listGrokTwinTestAApiUrls,
} from '../src/site00/services/grokTwinTestAClient.js';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

const BENCH_PATHS = [
  'api/_lib/site00GrokDesignBench/grokVisionProvider.ts',
  'api/_lib/site00GrokDesignBench/service.ts',
  'api/site00/twin-test-a-design-bench.ts',
  'src/site00/services/grokTwinTestAClient.ts',
  'src/site00/pages/DesignTwinTestAPage.tsx',
];

describe('P0.VR.DESIGNBENCH.GROK1F2 API host boundary', () => {
  afterEach(() => {
    delete process.env.XAI_API_KEY;
    delete process.env.RAILWAY_ENVIRONMENT;
    delete process.env.RAILWAY_SERVICE_NAME;
    delete process.env.RAILWAY_PUBLIC_DOMAIN;
    delete process.env.RAILWAY_PROJECT_ID;
    delete process.env.RAILWAY_GIT_COMMIT_SHA;
    delete process.env.SITE00_VITE_LOCAL_API;
  });

  it('1. Railway production API is first for preview hosts', () => {
    const railway = `${GROK_TWIN_TEST_A_PRODUCTION_API_ORIGIN}${GROK_TWIN_TEST_A_API_PATH}`;
    const preview = listGrokTwinTestAApiUrls('preview.fsbw-dev.com', 'https://preview.fsbw-dev.com');
    expect(preview[0]).toBe(railway);
    expect(preview).toContain(`https://preview.fsbw-dev.com${GROK_TWIN_TEST_A_API_PATH}`);
    expect(P0_VR_DESIGNBENCH_GROK1F2_LINEAGE).toBe('P0.VR.DESIGNBENCH.GROK1F2');
    expect(P0_VR_DESIGNBENCH_GROK1_BUILD).toBe('v485');
  });

  it('2. missing-key 200 is not treated as a usable host', () => {
    expect(
      grokTwinTestAPayloadReportsMissingHostKey({
        ok: true,
        readiness: {
          state: 'BLOCKED',
          reason: 'XAI_API_KEY missing on the API host. Grok 4.6 cannot start.',
          xaiApiKeyPresent: false,
        },
        hostDiagnostic: { xaiKeyPresent: false, modelId: 'grok-4.6' },
      }),
    ).toBe(true);
    expect(
      grokTwinTestAPayloadReportsMissingHostKey({
        ok: true,
        readiness: { state: 'READY', reason: null, xaiApiKeyPresent: true },
        hostDiagnostic: { xaiKeyPresent: true, modelId: 'grok-4.6' },
      }),
    ).toBe(false);
  });

  it('3. env read is XAI_API_KEY only — no name mismatch', () => {
    expect(read('api/_lib/site00GrokDesignBench/grokVisionProvider.ts')).toContain('process.env.XAI_API_KEY');
    for (const file of BENCH_PATHS) {
      const src = read(file);
      expect(src).not.toMatch(/\bXAI_KEY\b/);
      expect(src).not.toMatch(/\bGROK_API_KEY\b/);
      expect(src).not.toMatch(/\bXAI_TOKEN\b/);
      expect(src).not.toContain('VITE_XAI_API_KEY');
    }
    expect(read('.env.example')).toContain('XAI_API_KEY=');
    expect(read('.env.example')).not.toContain('VITE_XAI_API_KEY');
    process.env.XAI_API_KEY = 'secret-must-not-leak';
    expect(grokDesignBenchApiKey()).toBe('secret-must-not-leak');
  });

  it('4. host diagnostic is boolean-only and never leaks the key', () => {
    process.env.XAI_API_KEY = 'sk-super-secret-value-do-not-emit';
    process.env.RAILWAY_ENVIRONMENT = 'production';
    process.env.RAILWAY_SERVICE_NAME = 'SITE00';
    const diagnostic = grokDesignBenchHostDiagnostic({ requestHost: 'api.site00.com' });
    expect(diagnostic.xaiKeyPresent).toBe(true);
    expect(diagnostic.modelId).toBe(GROK_DESIGN_BENCH_MODEL_ID);
    expect(diagnostic.runtime).toBe('railway-node-express');
    expect(diagnostic.host).toBe('api.site00.com');
    expect(diagnostic.environment).toBe('production');
    const serialized = JSON.stringify(diagnostic);
    expect(serialized).not.toContain('sk-super-secret');
    expect(serialized).not.toContain('secret-must-not');
    expect(serialized).not.toMatch(/xaiKeyLength/i);
    expect(Object.keys(diagnostic).sort()).toEqual([
      'environment',
      'host',
      'modelId',
      'runtime',
      'xaiKeyPresent',
    ]);
  });

  it('5. Vite local runtime is labeled when SITE00_VITE_LOCAL_API=1', () => {
    delete process.env.XAI_API_KEY;
    process.env.SITE00_VITE_LOCAL_API = '1';
    const diagnostic = grokDesignBenchHostDiagnostic({ requestHost: 'localhost' });
    expect(diagnostic.runtime).toBe('vite-local-api');
    expect(diagnostic.xaiKeyPresent).toBe(false);
    expect(diagnostic.modelId).toBe('grok-4.6');
  });

  it('6. client never ships the secret name or a VITE_ key', () => {
    const client = read('src/site00/services/grokTwinTestAClient.ts') + read('src/site00/pages/DesignTwinTestAPage.tsx');
    expect(client).not.toContain('XAI_API_KEY');
    expect(client).not.toContain('VITE_XAI');
    expect(client).toContain('GROK_TWIN_TEST_A_PRODUCTION_API_ORIGIN');
    expect(client).toContain('twin-test-a-host-diagnostic');
  });

  it('7. Express Railway mount and Vite local plugin still bind the same path', () => {
    expect(read('server/routes.ts')).toContain("path: '/api/site00/twin-test-a-design-bench'");
    expect(read('scripts/vite-site00-local-api.mjs')).toContain("path: '/api/site00/twin-test-a-design-bench'");
    expect(read('railway.toml')).toContain('npm run start:api');
    expect(read('api/site00/twin-test-a-design-bench.ts')).toContain('hostDiagnostic');
  });
});
