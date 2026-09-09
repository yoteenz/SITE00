/**
 * Expression Engine workspace load must not block on Meridian live jobs.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const HOOK = readFileSync(
  join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/useExpressionEngineEntry002.ts'),
  'utf8',
);
const LOADER = readFileSync(
  join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/loadC19R3MeridianComparisonViaJob.ts'),
  'utf8',
);

describe('Expression Engine non-blocking Meridian load', () => {
  it('loadCore does not await Meridian comparison', () => {
    expect(HOOK).toContain('const loadCore = useCallback');
    expect(HOOK).toContain('const loadMeridian = useCallback');
    expect(HOOK).not.toMatch(/loadCore[\s\S]*await loadC19R3MeridianComparisonViaJob/);
    expect(HOOK).not.toMatch(/loadCore[\s\S]*await loadMeridianComparisonForWorkspace/);
    expect(HOOK).toMatch(/void loadMeridian\(\)/);
    expect(HOOK).toContain('c19r1Loading');
  });

  it('workspace Meridian loader never auto-starts live job on hydrate', () => {
    const fnMatch = LOADER.match(
      /export async function loadMeridianComparisonForWorkspace\(\)[\s\S]*?(?=\n\/\*\* @deprecated|\nexport async function startMeridianLiveComparisonJob)/,
    );
    expect(fnMatch).toBeTruthy();
    const body = fnMatch![0];
    expect(body).toContain('loadMeridianComparisonSnapshot');
    expect(body).toContain('loadMeridianComparisonFallback');
    expect(body).not.toContain('startMeridianLiveComparisonJob');
  });

  it('live job start is explicit founder-triggered only', () => {
    expect(LOADER).toContain('startMeridianLiveComparisonJob');
    expect(LOADER).toContain("action: 'START_C19R3_MERIDIAN_LIVE_JOB'");
  });
});
