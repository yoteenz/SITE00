import { describe, expect, it, vi, afterEach } from 'vitest';
import { resolveSite00ApiBase, site00ApiUrl } from './site00ApiBase';

describe('resolveSite00ApiBase', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses Railway on fsbw-dev preview hosts', () => {
    vi.stubGlobal('window', { location: { hostname: 'site00.fsbw-dev.com' } });
    expect(resolveSite00ApiBase()).toBe('https://api.site00.com');
  });

  it('uses Railway on cloudflare tunnel hosts', () => {
    vi.stubGlobal('window', { location: { hostname: 'abc.trycloudflare.com' } });
    expect(resolveSite00ApiBase()).toBe('https://api.site00.com');
  });

  it('builds absolute project API urls on preview hosts', () => {
    vi.stubGlobal('window', { location: { hostname: 'site00.fsbw-dev.com' } });
    expect(site00ApiUrl('/api/site00/projects?action=index')).toBe(
      'https://api.site00.com/api/site00/projects?action=index',
    );
  });
});
