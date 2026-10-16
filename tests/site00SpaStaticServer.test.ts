import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createSite00SpaStaticApp } from '../server/site00SpaStaticServer.js';

function makeDist(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site00-spa-dist-'));
  const assets = path.join(root, 'assets');
  fs.mkdirSync(assets, { recursive: true });
  fs.writeFileSync(
    path.join(root, 'index.html'),
    '<!doctype html><html><head><title>SITE 00 SPA</title></head><body id="spa-shell">ok</body></html>',
    'utf8',
  );
  fs.writeFileSync(path.join(assets, 'index.testhash.js'), 'console.log("ok");', 'utf8');
  fs.writeFileSync(path.join(assets, 'index.testhash.css'), 'body{color:#000}', 'utf8');
  return root;
}

function request(
  server: http.Server,
  urlPath: string,
  method = 'GET',
): Promise<{ status: number; contentType: string; body: string }> {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    if (!addr || typeof addr === 'string') {
      reject(new Error('no server address'));
      return;
    }
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: addr.port,
        path: urlPath,
        method,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          resolve({
            status: res.statusCode ?? 0,
            contentType: String(res.headers['content-type'] ?? ''),
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

describe('site00 SPA static server (Railway staging parity)', () => {
  let distRoot: string;
  let server: http.Server;

  beforeAll(async () => {
    distRoot = makeDist();
    const app = createSite00SpaStaticApp(distRoot);
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    fs.rmSync(distRoot, { recursive: true, force: true });
  });

  it('A — existing JS asset returns 200 with JavaScript MIME', async () => {
    const res = await request(server, '/assets/index.testhash.js');
    expect(res.status).toBe(200);
    expect(res.contentType).toMatch(/javascript/);
    expect(res.body).toContain('console.log');
  });

  it('B — missing JS asset returns 404 (not HTML)', async () => {
    const res = await request(server, '/assets/deleted-chunk.oldhash.js');
    expect(res.status).toBe(404);
    expect(res.contentType).not.toMatch(/html/);
    expect(res.body).not.toContain('<!doctype html');
  });

  it('C — existing CSS asset returns 200 with CSS MIME', async () => {
    const res = await request(server, '/assets/index.testhash.css');
    expect(res.status).toBe(200);
    expect(res.contentType).toMatch(/css/);
  });

  it('D — missing CSS asset returns 404 (not HTML)', async () => {
    const res = await request(server, '/assets/missing.testhash.css');
    expect(res.status).toBe(404);
    expect(res.contentType).not.toMatch(/html/);
  });

  it('E — readiness deep link returns SPA shell', async () => {
    const res = await request(server, '/admin/site00/foundation-readiness');
    expect(res.status).toBe(200);
    expect(res.contentType).toMatch(/html/);
    expect(res.body).toContain('id="spa-shell"');
  });

  it('F — foundation intake deep link returns SPA shell', async () => {
    const res = await request(server, '/foundation/synthetic-token-example');
    expect(res.status).toBe(200);
    expect(res.contentType).toMatch(/html/);
    expect(res.body).toContain('id="spa-shell"');
  });

  it('G/H — stale lazy chunk URL returns 404 not SPA shell', async () => {
    const missing = await request(server, '/assets/FoundationReadinessPage.stale.js');
    expect(missing.status).toBe(404);
    expect(missing.body).not.toMatch(/<html/i);
    const shell = await request(server, '/admin/site00/foundation-readiness');
    expect(shell.status).toBe(200);
    expect(shell.body).toContain('spa-shell');
  });
});

describe('site00 SPA static server — production dist when built', () => {
  const distRoot = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distRoot, 'index.html'));

  it.skipIf(!hasDist)('uses real dist assets when present', async () => {
    const app = createSite00SpaStaticApp(distRoot);
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    try {
      const indexHtml = fs.readFileSync(path.join(distRoot, 'index.html'), 'utf8');
      const jsMatch = indexHtml.match(/\/assets\/index\.[^"]+\.js/);
      expect(jsMatch).toBeTruthy();
      const jsPath = jsMatch![0];
      const ok = await request(server, jsPath);
      expect(ok.status).toBe(200);
      expect(ok.contentType).toMatch(/javascript/);
      const missing = await request(server, '/assets/index.this-hash-does-not-exist.js');
      expect(missing.status).toBe(404);
      expect(missing.body).not.toContain('<!doctype html');
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
