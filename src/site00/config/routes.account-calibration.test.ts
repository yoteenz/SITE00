import { describe, expect, it } from 'vitest';
import { SITE00_ROUTES, site00CreateAccountHrefWithReturnTo, site00CreateAccountLinkTarget, site00ProjectLoreCalibrationPath } from '../config/routes';

describe('account + calibration routes', () => {
  it('canonical create account route is /origin/create-account', () => {
    expect(SITE00_ROUTES.createAccount).toBe('/origin/create-account');
  });

  it('create account href preserves returnTo', () => {
    const href = site00CreateAccountHrefWithReturnTo('/projects/ndxbook/calibrate');
    expect(href).toContain('/origin/create-account?returnTo=');
    expect(decodeURIComponent(href)).toContain('/projects/ndxbook/calibrate');
  });

  it('create account link target preserves raw sign-in returnTo query', () => {
    const target = site00CreateAccountLinkTarget({
      pathname: '/origin/sign-in',
      search: '?returnTo=%2Fprojects%2Fndxbook%2Fcalibrate',
    });
    expect(target.pathname).toBe('/origin/create-account');
    expect(target.search).toBe('?returnTo=%2Fprojects%2Fndxbook%2Fcalibrate');
  });

  it('create account link target falls back to sign-in path when returnTo missing', () => {
    const target = site00CreateAccountLinkTarget({
      pathname: '/origin/sign-in',
      search: '',
    });
    expect(target.pathname).toBe('/origin/create-account');
    expect(target.search).toBe('?returnTo=%2Forigin%2Fsign-in');
  });

  it('project lore calibration path resolves', () => {
    expect(site00ProjectLoreCalibrationPath('ndxbook')).toBe('/projects/ndxbook/calibrate');
  });
});
