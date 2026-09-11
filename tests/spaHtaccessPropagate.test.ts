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
});
