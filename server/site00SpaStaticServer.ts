/**
 * Railway / Node static host for SITE 00 SPA (staging founder frontend).
 *
 * Replaces `npx serve dist -s` which rewrites missing /assets/*.js to index.html (Safari blank screen).
 */
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DIST = path.resolve(__dirname, '..', 'dist');

const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable';
const SHELL_CACHE = 'no-cache, no-store, must-revalidate';

function isAssetPath(urlPath: string): boolean {
  return urlPath === '/assets' || urlPath.startsWith('/assets/');
}

function hasStaticExtension(urlPath: string): boolean {
  const ext = path.extname(urlPath.split('?')[0] ?? '');
  return Boolean(ext && ext.toLowerCase() !== '.html');
}

function sendSpaShell(distRoot: string, res: Response): void {
  res.setHeader('Cache-Control', SHELL_CACHE);
  res.setHeader('Pragma', 'no-cache');
  res.type('html');
  res.sendFile(path.join(distRoot, 'index.html'));
}

export function createSite00SpaStaticApp(distRoot: string = DEFAULT_DIST): Express {
  const app = express();
  const assetsDir = path.join(distRoot, 'assets');
  const indexPath = path.join(distRoot, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.warn(`[site00-spa-static] dist/index.html missing at ${distRoot} — build before start`);
  }

  app.disable('x-powered-by');

  /** Hashed bundles — plain 404 when missing (never SPA HTML or Express HTML error pages). */
  app.use('/assets', (req: Request, res: Response) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.status(405).type('text/plain').send('Method Not Allowed');
      return;
    }
    const rel = decodeURIComponent(req.path.replace(/^\/+/, ''));
    const normalized = path.normalize(rel);
    if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
      res.status(404).type('text/plain').send('Not Found');
      return;
    }
    const file = path.join(assetsDir, normalized);
    const assetsRoot = path.resolve(assetsDir);
    if (!path.resolve(file).startsWith(assetsRoot) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.status(404).type('text/plain').send('Not Found');
      return;
    }
    res.setHeader('Cache-Control', IMMUTABLE_CACHE);
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.sendFile(file);
  });

  /** Root-level static files (boot scripts, favicon, index.html by path). */
  app.use(
    express.static(distRoot, {
      index: false,
      fallthrough: true,
      maxAge: 0,
      setHeaders(res, filePath) {
        const base = path.basename(filePath);
        if (base === 'index.html' || base === 'release-manifest.json') {
          res.setHeader('Cache-Control', SHELL_CACHE);
          res.setHeader('Pragma', 'no-cache');
        }
      },
    }),
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }
    const urlPath = req.path;

    if (isAssetPath(urlPath)) {
      res.status(404).type('text/plain').send('Not Found');
      return;
    }

    if (hasStaticExtension(urlPath)) {
      res.status(404).type('text/plain').send('Not Found');
      return;
    }

    sendSpaShell(distRoot, res);
  });

  return app;
}

function listen(): void {
  const distRoot = process.env.SITE00_SPA_DIST?.trim()
    ? path.resolve(process.env.SITE00_SPA_DIST.trim())
    : DEFAULT_DIST;
  const port = Number(process.env.PORT || 8080);
  const app = createSite00SpaStaticApp(distRoot);
  app.listen(port, '0.0.0.0', () => {
    console.log(`[site00-spa-static] listening on ${port} dist=${distRoot}`);
  });
}

const isMain =
  process.argv[1] &&
  (path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('site00SpaStaticServer.ts'));

if (isMain) {
  listen();
}
