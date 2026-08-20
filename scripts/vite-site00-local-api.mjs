/**
 * Vite dev middleware: serve core SITE 00 API routes locally (tsx + env from .env).
 * Prevents Vite from treating /api/* requests as frontend module imports.
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { loadEnv } from 'vite';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);

/** Express-style path → api handler module (relative to repo root) */
const LOCAL_API_ROUTES = [
  { path: '/api/profile', file: 'api/profile.ts' },
  { path: '/api/activity', file: 'api/activity.ts' },
  { path: '/api/session-cookie', file: 'api/session-cookie.ts' },
  { path: '/api/session-restore', file: 'api/session-restore.ts' },
  { path: '/api/site00-access', file: 'api/site00-access.ts' },
  { path: '/api/admin/site00-assts', file: 'api/admin/site00-assts.ts' },
  { path: '/api/admin/site00-production', file: 'api/admin/site00-production.ts' },
  { path: '/api/admin/site00-access-credentials', file: 'api/admin/site00-access-credentials.ts' },
];

function applyServerEnv() {
  const env = loadEnv('development', ROOT, '');
  const pairs = [
    ['SUPABASE_URL', env.SUPABASE_URL || env.VITE_SUPABASE_URL],
    ['SUPABASE_ANON_KEY', env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY],
    ['SUPABASE_SERVICE_ROLE_KEY', env.SUPABASE_SERVICE_ROLE_KEY],
    ['SESSION_COOKIE_SECRET', env.SESSION_COOKIE_SECRET],
    ['SESSION_COOKIE_SECURE', env.SESSION_COOKIE_SECURE],
    ['ADMIN_EMAILS', env.ADMIN_EMAILS || env.VITE_ADMIN_EMAILS],
    ['FAL_KEY', env.FAL_KEY],
    ['STUDIO_ASSETS_BUCKET', env.STUDIO_ASSETS_BUCKET],
    ['SITE00_ASSTS_BUCKET', env.SITE00_ASSTS_BUCKET],
    ['SITE00_ASSTS_LOADER_GEOMETRY_SECRET', env.SITE00_ASSTS_LOADER_GEOMETRY_SECRET],
  ];
  for (const [key, value] of pairs) {
    if (value && !process.env[key]) process.env[key] = value;
  }
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8') || ''));
    req.on('error', reject);
  });
}

function createVercelResponseAdapter(res) {
  let statusCode = 200;
  return {
    setHeader(key, value) {
      res.setHeader(key, value);
      return this;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      if (!res.headersSent) {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      res.end(JSON.stringify(payload));
    },
    end(data) {
      res.statusCode = statusCode;
      res.end(data);
    },
  };
}

export function site00LocalApiPlugin() {
  /** @type {Map<string, Promise<(req: unknown, res: unknown) => Promise<void>>>} */
  const handlerPromises = new Map();
  let tsxRegistered = false;

  async function ensureTsx() {
    if (!tsxRegistered) {
      const tsxApi = pathToFileURL(require.resolve('tsx/esm/api')).href;
      const { register } = await import(tsxApi);
      register();
      tsxRegistered = true;
    }
  }

  async function loadHandler(file) {
    let promise = handlerPromises.get(file);
    if (!promise) {
      promise = (async () => {
        await ensureTsx();
        const mod = await import(pathToFileURL(path.join(ROOT, file)).href);
        return mod.default;
      })();
      handlerPromises.set(file, promise);
    }
    return promise;
  }

  const routeByPath = new Map(LOCAL_API_ROUTES.map((r) => [r.path, r.file]));

  return {
    name: 'site00-local-api',
    configureServer(server) {
      applyServerEnv();

      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url ?? '';
        const pathname = rawUrl.split('?')[0] ?? '';
        const file = routeByPath.get(pathname);
        if (!file) return next();

        applyServerEnv();

        try {
          const handler = await loadHandler(file);
          const parsed = new URL(rawUrl, 'http://127.0.0.1');
          const query = Object.fromEntries(parsed.searchParams.entries());
          let body = '';
          if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            body = await readRequestBody(req);
          }

          const vercelReq = {
            method: req.method,
            url: rawUrl,
            query,
            headers: req.headers,
            body: body.trim()
              ? (() => {
                  try {
                    return JSON.parse(body);
                  } catch {
                    return body;
                  }
                })()
              : undefined,
          };

          await handler(vercelReq, createVercelResponseAdapter(res));
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
          }
          res.end(JSON.stringify({ error: message, code: 'LOCAL_API_ERROR' }));
        }
      });

      console.log(
        `[vite] Local API: ${LOCAL_API_ROUTES.map((r) => r.path).join(', ')} served on this dev server.`,
      );
    },
  };
}
