import { describe, expect, it } from 'vitest';
import {
  formatSyntheticBusinessNameWithRunId,
  isSyntheticBusinessName,
} from '../shared/site00-digital-foundation/founderTestMode.js';

describe('founder test mode synthetic naming', () => {
  it('embeds test run id in synthetic business name', () => {
    const name = formatSyntheticBusinessNameWithRunId('IDNTY-E2E-20261021-001', 'Acme Test');
    expect(name).toBe('SYNTH · Acme Test [IDNTY-E2E-20261021-001]');
    expect(isSyntheticBusinessName(name)).toBe(true);
  });
});
