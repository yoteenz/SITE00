import { describe, expect, it } from 'vitest';
import { isChunkLoadError } from '../src/utils/lazyWithChunkRecovery';

describe('lazyWithChunkRecovery helpers', () => {
  it('detects Safari / Vite dynamic import failures', () => {
    expect(isChunkLoadError(new Error('Failed to fetch dynamically imported module'))).toBe(true);
    expect(isChunkLoadError(new Error('Importing a module script failed'))).toBe(true);
    expect(isChunkLoadError(new Error('network'))).toBe(false);
  });
});
