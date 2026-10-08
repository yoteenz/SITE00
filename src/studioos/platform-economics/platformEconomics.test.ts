import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runFoundationHarness } from './harness';
import { canonicalPlatformFeeBasisPoints } from './rate';

describe('platform economics foundation', () => {
  const report = runFoundationHarness();

  it('runs every foundation case', () => {
    const failed = report.cases.filter((item) => !item.pass).map((item) => `${item.id} ${item.detail}`);
    expect(failed).toEqual([]);
  });

  it('keeps the default rate in one module', () => {
    expect(canonicalPlatformFeeBasisPoints()).toBe(200);
    expect(report.gate.DEFAULT_PLATFORM_RATE).toBe('2.00%');
    const directory = dirname(fileURLToPath(import.meta.url));
    const files = readdirSync(directory).filter((name) => name.endsWith('.ts') && name !== 'rate.ts' && name !== 'platformEconomics.test.ts');
    for (const name of files) {
      const source = readFileSync(join(directory, name), 'utf8');
      const floatRate = ['0', '02'].join('.');
      expect(source.includes(floatRate), name).toBe(false);
      expect(source.includes('DEFAULT_PLATFORM_FEE_BASIS_POINTS ='), name).toBe(false);
    }
  });

  it('matches the activation boundary', () => {
    expect(report.gate.LIVE_MONEY_MOVEMENT).toBe('NO');
    expect(report.gate.LIVE_PLATFORM_FEES_COLLECTED).toBe('NO');
    expect(report.gate.PUBLIC_TERMS_PUBLISHED).toBe('NO');
    expect(report.gate.LEGAL_REVIEW_REQUIRED).toBe('YES');
    expect(report.gate.AIO_USES_SHARED_ENGINE).toBe('YES');
    expect(report.gate.MULTI_CLIENT_ISOLATION).toBe('PASS');
    expect(report.gate.IDEMPOTENCY).toBe('PASS');
    expect(report.gate.MONEY_MINOR_UNITS).toBe('PASS');
    expect(report.version).toBe('1.0.0');
  });
});
