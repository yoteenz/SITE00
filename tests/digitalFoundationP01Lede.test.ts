import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('P01 entry lede', () => {
  it('uses default commercial config so turnaround copy does not flash in after catalog load', () => {
    const src = readFileSync('src/site00/foundation-client/parents/EntryIntake.tsx', 'utf8');
    expect(src).toContain('defaultDigitalFoundationCommercialConfig');
    expect(src).toContain('TYPICALLY {days} BUSINESS DAYS');
    expect(src).not.toMatch(/days \? ` TYPICALLY/);
  });
});
