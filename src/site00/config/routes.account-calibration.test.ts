import { describe, expect, it } from 'vitest';
import { SITE00_ROUTES, site00CreateAccountHrefWithReturnTo, site00ProjectLoreCalibrationPath } from '../config/routes';

describe('account + calibration routes', () => {
  it('canonical create account route is /origin/create-account', () => {
    expect(SITE00_ROUTES.createAccount).toBe('/origin/create-account');
  });

  it('create account href preserves returnTo', () => {
    const href = site00CreateAccountHrefWithReturnTo('/projects/ndxbook/calibrate');
    expect(href).toContain('/origin/create-account?returnTo=');
    expect(decodeURIComponent(href)).toContain('/projects/ndxbook/calibrate');
  });

  it('project lore calibration path resolves', () => {
    expect(site00ProjectLoreCalibrationPath('ndxbook')).toBe('/projects/ndxbook/calibrate');
  });
});
