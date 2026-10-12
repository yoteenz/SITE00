import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Digital Foundation shell exports', () => {
  it('re-exports DfSheet for intake parent screens', () => {
    const shell = readFileSync('src/site00/foundation-client/shell.tsx', 'utf8');
    expect(shell).toMatch(/export function DfSheet/);
    for (const file of [
      'src/site00/foundation-client/parents/EntryIntake.tsx',
      'src/site00/foundation-client/parents/Recommendation.tsx',
      'src/site00/foundation-client/parents/CheckoutActivation.tsx',
    ]) {
      const src = readFileSync(file, 'utf8');
      expect(src, file).toContain("DfSheet");
      expect(src, file).toContain("from '../shell'");
    }
  });

  it('exposes completeClientAction on the client API wrapper', () => {
    const api = readFileSync('src/site00/foundation-client/api.ts', 'utf8');
    expect(api).toContain('export function completeClientAction');
  });

  it('keeps correspondence marks on headlines only, not df-lede body', () => {
    const shell = readFileSync('src/site00/foundation-client/shell.tsx', 'utf8');
    expect(shell).toContain('CorrespondenceDisplayLine');
    expect(shell).not.toContain('CorrespondenceProse');
    expect(shell).toMatch(/export function DfLede[\s\S]*className="df-lede"\>\{children\}/);
  });
});
