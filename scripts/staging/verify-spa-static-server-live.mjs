#!/usr/bin/env node
/** Regression against running site00SpaStaticServer (Railway start:spa parity). */
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const PORT = 4188;
const BASE = `http://127.0.0.1:${PORT}`;

function fetchHead(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE}${urlPath}`, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () =>
        resolve({
          status: res.statusCode,
          type: res.headers['content-type'],
          cache: res.headers['cache-control'],
          body: Buffer.concat(chunks).toString('utf8').slice(0, 200),
        }),
      );
    }).on('error', reject);
  });
}

const child = spawn('npm', ['run', 'start:spa'], {
  cwd: ROOT,
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'pipe',
});

await new Promise((r) => setTimeout(r, 2500));

try {
  const indexHtml = fs.readFileSync(path.join(ROOT, 'dist/index.html'), 'utf8');
  const js = indexHtml.match(/\/assets\/index\.[^"]+\.js/)?.[0];
  if (!js) throw new Error('no index js in dist/index.html');

  const okJs = await fetchHead(js);
  const missJs = await fetchHead('/assets/chunk.deleted-by-deploy.js');
  const shell = await fetchHead('/admin/site00/foundation-readiness');
  const missCss = await fetchHead('/assets/chunk.deleted.css');

  const report = { okJs, missJs, missCss, shell };
  console.log(JSON.stringify(report, null, 2));

  const pass =
    okJs.status === 200 &&
    String(okJs.type).includes('javascript') &&
    missJs.status === 404 &&
    !missJs.body.includes('<!doctype') &&
    missCss.status === 404 &&
    shell.status === 200 &&
    String(shell.type).includes('html');

  if (!pass) process.exit(1);
} finally {
  child.kill('SIGTERM');
}
