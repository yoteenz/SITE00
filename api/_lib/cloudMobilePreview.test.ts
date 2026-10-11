import { afterEach, describe, expect, it } from 'vitest';
import { isCloudMobilePreviewDev } from './cloudMobilePreview.js';

describe('isCloudMobilePreviewDev', () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
  });

  it('is false in production even when flag is set', () => {
    process.env.NODE_ENV = 'production';
    process.env.SITE00_CLOUD_MOBILE_PREVIEW = '1';
    expect(isCloudMobilePreviewDev()).toBe(false);
  });

  it('is true in non-production when SITE00_CLOUD_MOBILE_PREVIEW=1', () => {
    process.env.NODE_ENV = 'development';
    process.env.SITE00_CLOUD_MOBILE_PREVIEW = '1';
    expect(isCloudMobilePreviewDev()).toBe(true);
  });

  it('is false when flag unset', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.SITE00_CLOUD_MOBILE_PREVIEW;
    expect(isCloudMobilePreviewDev()).toBe(false);
  });
});
