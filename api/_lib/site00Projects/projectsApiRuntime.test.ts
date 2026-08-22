import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { evaluateProjectsApiResponse } from '../../../src/site00/services/site00ProjectsApi';

const VITE_LOCAL_API = readFileSync(join(process.cwd(), 'scripts/vite-site00-local-api.mjs'), 'utf8');
const SERVER_ROUTES = readFileSync(join(process.cwd(), 'server/routes.ts'), 'utf8');
const PROJECTS_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectsPage.tsx'), 'utf8');

describe('site00ProjectsApi response handling', () => {
  it('registers /api/site00/projects in vite local API plugin', () => {
    expect(VITE_LOCAL_API).toContain("path: '/api/site00/projects'");
    expect(VITE_LOCAL_API).toContain('api/site00/projects.ts');
  });

  it('registers /api/site00/projects in server routes', () => {
    expect(SERVER_ROUTES).toContain("path: '/api/site00/projects'");
    expect(SERVER_ROUTES).toContain('site00ProjectsHandler');
  });

  it('ProjectsPage does not hardcode LIVE metrics during error state', () => {
    expect(PROJECTS_PAGE).toContain("showMetrics = state === 'ready' || state === 'partial'");
    expect(PROJECTS_PAGE).toContain('sourceLabel');
    expect(PROJECTS_PAGE).not.toMatch(/value="LIVE"/);
  });

  it('classifies valid JSON success body', () => {
    const { category } = evaluateProjectsApiResponse({
      raw: JSON.stringify({ ok: true, projects: [] }),
      contentType: 'application/json',
      status: 200,
      endpoint: '/api/site00/projects?action=index',
    });
    expect(category).toBe('json');
  });

  it('classifies HTML SPA fallback', () => {
    const { category, diagnostics } = evaluateProjectsApiResponse({
      raw: '<!DOCTYPE html><html><body>SPA</body></html>',
      contentType: 'text/html',
      status: 200,
      endpoint: '/api/site00/projects?action=index',
    });
    expect(category).toBe('html');
    expect(diagnostics.responseCategory).toBe('html');
  });

  it('classifies malformed JSON body category as json then parse would fail separately', () => {
    const { category } = evaluateProjectsApiResponse({
      raw: '{not-json',
      contentType: 'application/json',
      status: 200,
      endpoint: '/api/site00/projects?action=index',
    });
    expect(category).toBe('json');
  });

  it('classifies empty body', () => {
    const { category } = evaluateProjectsApiResponse({
      raw: '',
      contentType: null,
      status: 502,
      endpoint: '/api/site00/projects?action=index',
    });
    expect(category).toBe('empty');
  });

  it('classifies 404 HTML', () => {
    const { category, diagnostics } = evaluateProjectsApiResponse({
      raw: '<html>Not Found</html>',
      contentType: 'text/html',
      status: 404,
      endpoint: '/api/site00/projects?action=index',
    });
    expect(category).toBe('html');
    expect(diagnostics.status).toBe(404);
  });

  it('classifies non-json content type', () => {
    const { category } = evaluateProjectsApiResponse({
      raw: 'plain text error',
      contentType: 'text/plain',
      status: 500,
      endpoint: '/api/site00/projects?action=index',
    });
    expect(category).toBe('non_json');
  });
});
