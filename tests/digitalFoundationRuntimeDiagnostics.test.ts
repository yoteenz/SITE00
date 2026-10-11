import { describe, expect, it } from 'vitest';
import { getDigitalFoundationRuntimeDiagnostics } from '../api/_lib/digitalFoundation/runtimeDiagnostics.js';

describe('Digital Foundation runtime diagnostics', () => {
  it('returns non-secret flag snapshot for health', () => {
    const d = getDigitalFoundationRuntimeDiagnostics();
    expect(typeof d.persistSupabaseEnv).toBe('boolean');
    expect(typeof d.launchGateIntakeOnly).toBe('boolean');
    expect(d.migrationFilesExpected.length).toBeGreaterThanOrEqual(2);
  });
});
