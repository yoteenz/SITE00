import { describe, expect, it } from 'vitest';
import {
  isSite00ClientAppPreviewPath,
} from '../src/site00/auth/clientAppPreviewState';

describe('client app preview QA paths', () => {
  it('recognizes fixture preview routes', () => {
    expect(isSite00ClientAppPreviewPath('/app/preview/select')).toBe(true);
    expect(isSite00ClientAppPreviewPath('/app/preview/fixture-app-ndxbook/reviews')).toBe(true);
    expect(isSite00ClientAppPreviewPath('/app/projects/ndxbook')).toBe(false);
  });
});
