import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'node:fs';

const PREVIEW_FILE = '/tmp/site00-cloud-preview-url.txt';

describe('resolvePreviewTunnelUrl', () => {
  const originalEnv = { ...process.env };
  let hadFile = false;
  let previousContents = '';

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.SITE00_CLOUDFLARE_TUNNEL_HOSTNAME;
    delete process.env.CLOUDFLARE_TUNNEL_HOSTNAME;
    hadFile = existsSync(PREVIEW_FILE);
    if (hadFile) {
      previousContents = readFileSync(PREVIEW_FILE, 'utf8');
      unlinkSync(PREVIEW_FILE);
    }
  });

  afterEach(() => {
    process.env = originalEnv;
    if (existsSync(PREVIEW_FILE)) unlinkSync(PREVIEW_FILE);
    if (hadFile) writeFileSync(PREVIEW_FILE, previousContents);
  });

  it('prefers SITE00_CLOUDFLARE_TUNNEL_HOSTNAME env', async () => {
    process.env.SITE00_CLOUDFLARE_TUNNEL_HOSTNAME = 'preview.example.com';
    const { resolvePreviewTunnelUrl } = await import('./previewTunnel.js');
    const info = resolvePreviewTunnelUrl();
    expect(info.url).toBe('https://preview.example.com');
    expect(info.source).toBe('env');
  });

  it('falls back to preview url file', async () => {
    writeFileSync(PREVIEW_FILE, 'https://tunnel-from-file.example.com\n');
    const { resolvePreviewTunnelUrl } = await import('./previewTunnel.js');
    const info = resolvePreviewTunnelUrl();
    expect(info.url).toBe('https://tunnel-from-file.example.com');
    expect(info.source).toBe('file');
  });

  it('returns unavailable when no source exists', async () => {
    const { resolvePreviewTunnelUrl } = await import('./previewTunnel.js');
    const info = resolvePreviewTunnelUrl();
    expect(info.url).toBeNull();
    expect(info.source).toBe('unavailable');
  });
});
