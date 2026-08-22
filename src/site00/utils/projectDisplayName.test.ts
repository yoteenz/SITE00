import { describe, expect, it } from 'vitest';
import { projectDisplayName } from './projectDisplayName';

describe('projectDisplayName', () => {
  it('maps ndxbook slug to NDX BOOK', () => {
    expect(projectDisplayName('ndxbook')).toBe('NDX BOOK');
  });

  it('prefers API display name when provided', () => {
    expect(projectDisplayName('ndxbook', 'NDX Book')).toBe('NDX BOOK');
  });

  it('does not expose uuid-like slugs as raw ids', () => {
    expect(projectDisplayName('custom-brand')).toBe('CUSTOM BRAND');
  });
});
