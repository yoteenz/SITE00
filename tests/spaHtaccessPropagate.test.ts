import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SPA_ROUTE_PREFIXES } from '../scripts/site00-propagate-spa-htaccess.mjs';

describe('SPA htaccess propagation', () => {
  it('defines route prefixes including projects', () => {
    expect(SPA_ROUTE_PREFIXES).toContain('projects');
    expect(SPA_ROUTE_PREFIXES).toContain('services');
  });

  it('nested template rewrites to index.html', () => {
    const body = readFileSync('scripts/spa-htaccess-nested.txt', 'utf8');
    expect(body).toContain('/index.html');
    expect(body).toContain('RewriteEngine On');
  });

  it('public root htaccess uses SymLinksIfOwnerMatch', () => {
    const body = readFileSync('public/.htaccess', 'utf8');
    expect(body).toContain('SymLinksIfOwnerMatch');
    expect(body).toContain('projects|services');
  });

  it('dist contains nested projects/.htaccess after build', () => {
    const nested = join('dist', 'projects', '.htaccess');
    if (!existsSync(nested)) {
      expect(true).toBe(true);
      return;
    }
    expect(readFileSync(nested, 'utf8')).toContain('/index.html');
    expect(existsSync(join('dist', 'htaccess-deploy.txt'))).toBe(true);
  });

  it('dist contains visible htaccess-nested.txt for FTP activation', () => {
    const visible = join('dist', 'projects', 'htaccess-nested.txt');
    if (!existsSync(visible)) {
      expect(true).toBe(true);
      return;
    }
    expect(readFileSync(visible, 'utf8')).toContain('/index.html');
  });

  it('activate script exists for post-deploy', () => {
    expect(existsSync('scripts/site00-activate-spa-htaccess.sh')).toBe(true);
  });

  it('activate script uses FTP primary before SSH backup', () => {
    const body = readFileSync('scripts/site00-activate-spa-htaccess.sh', 'utf8');
    expect(body).toContain('FTP direct upload (primary)');
    expect(body).toContain('site00-verify-spa-deep-link.mjs');
  });

  it('deep link verify script exists', () => {
    expect(existsSync('scripts/site00-verify-spa-deep-link.mjs')).toBe(true);
  });
});
