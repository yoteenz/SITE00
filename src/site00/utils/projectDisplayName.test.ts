import { describe, expect, it } from 'vitest';
import { projectDisplayName } from './projectDisplayName';

describe('projectDisplayName', () => {
  it('maps ndxbook slug to NDXBOOK', () => {
    expect(projectDisplayName('ndxbook')).toBe('NDXBOOK');
  });

  it('normalizes API display name to NDXBOOK for ndxbook', () => {
    expect(projectDisplayName('ndxbook', 'NDX Book')).toBe('NDXBOOK');
  });

  it('does not expose uuid-like slugs as raw ids', () => {
    expect(projectDisplayName('custom-brand')).toBe('CUSTOM BRAND');
  });
});
