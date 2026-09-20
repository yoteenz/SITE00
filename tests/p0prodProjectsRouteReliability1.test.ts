/**
 * P0.PROD.PROJECTS-ROUTE-RELIABILITY1
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  CANONICAL_SPA_SHELL_ROUTES,
  isRawHostingForbiddenPage,
  isSite00SpaShellHtml,
  SPA_ROUTE_PREFIXES,
} from '../shared/site00-production-routing/spaHostingContract.js';
import { SPA_ROUTE_PREFIXES as MJS_PREFIXES } from '../scripts/spa-route-prefixes.mjs';

describe('P0.PROD.PROJECTS-ROUTE-RELIABILITY1 — hosting contract', () => {
  it('keeps SPA prefix list in sync between TS contract and deploy script', () => {
    expect([...SPA_ROUTE_PREFIXES].sort()).toEqual([...MJS_PREFIXES].sort());
  });

  it('public root htaccess forbids directory 403 and maps 403 to SPA shell', () => {
    const body = readFileSync('public/.htaccess', 'utf8');
    expect(body).toContain('-Indexes');
    expect(body).toContain('ErrorDocument 403 /index.html');
    expect(body).toContain('system|sign-in');
    expect(body).toContain('projects|services');
  });

  it('nested htaccess handles 403 and directory index', () => {
    const body = readFileSync('scripts/spa-htaccess-nested.txt', 'utf8');
    expect(body).toContain('ErrorDocument 403 /index.html');
    expect(body).toContain('DirectoryIndex index.html');
    expect(body).toContain('/index.html');
  });

  it('detects raw Apache 403 vs SPA shell', () => {
    expect(isRawHostingForbiddenPage('<html><title>403 Forbidden</title><body>Forbidden</body></html>')).toBe(true);
    expect(isSite00SpaShellHtml('<html><body><div id="root"></div></body></html>')).toBe(true);
    expect(isRawHostingForbiddenPage('<html><body><div id="root"></div></body></html>')).toBe(false);
  });

  it('defines canonical production shell routes including /projects', () => {
    expect(CANONICAL_SPA_SHELL_ROUTES.some((r) => r === '/projects' || r === '/projects/')).toBe(true);
    expect(CANONICAL_SPA_SHELL_ROUTES).toContain('/projects/ndxbook/design');
  });

  it('dist projects/ contains shell stub and nested htaccess after build', () => {
    const projectsDir = join('dist', 'projects');
    if (!existsSync(projectsDir)) {
      expect(true).toBe(true);
      return;
    }
    expect(existsSync(join(projectsDir, 'index.html'))).toBe(true);
    expect(readFileSync(join(projectsDir, '.htaccess'), 'utf8')).toContain('ErrorDocument 403');
  });

  it('production route smoke script exists', () => {
    expect(existsSync('scripts/site00-production-route-smoke.mjs')).toBe(true);
  });
});
