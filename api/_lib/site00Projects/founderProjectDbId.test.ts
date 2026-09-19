import { describe, expect, it } from 'vitest';
import { isUuid } from './founderProjectDbId.js';

describe('founderProjectDbId helpers', () => {
  it('isUuid accepts canonical project UUIDs', () => {
    expect(isUuid('7681ab75-bddc-43e5-b594-79fcf8168205')).toBe(true);
    expect(isUuid('89a0eb4f-b4e6-4951-aa60-45973b47aa2a')).toBe(true);
  });

  it('isUuid rejects founder slugs', () => {
    expect(isUuid('ndxbook')).toBe(false);
    expect(isUuid('NDXBOOK')).toBe(false);
    expect(isUuid('site00')).toBe(false);
  });
});
