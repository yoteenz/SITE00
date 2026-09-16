/**
 * P0.VR.OPUS-NATIVE1 — static preview server for demos and screenshot QA.
 *
 * Serves the built `dist/` SPA and proxies `/api` to the runtime. This exists
 * because the Vite dev server's HMR socket cannot reach the shared tunnel host
 * in this environment and falls back to full page reloads, which destroys any
 * in-progress panel state mid-demo. A production build has no HMR, so the
 * panel behaves exactly as it will for the founder.
 */

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const DIST = path.join(ROOT, 'dist');
const API_TARGET = process.env.DEMO_API_TARGET ?? 'http://127.0.0.1:3000';
const PORT = Number(process.env.DEMO_PORT ?? 5176);

const app = express();

app.use('/api', express.raw({ type: '*/*', limit: '32mb' }), async (req, res) => {
  const url = `${API_TARGET}/api${req.url}`;
  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: { 'content-type': req.headers['content-type'] ?? 'application/json' },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('content-type', upstream.headers.get('content-type') ?? 'application/json');
    res.send(text);
  } catch (error) {
    res.status(502).json({ ok: false, error: 'PROXY_FAILED', detail: String(error) });
  }
});

app.use(express.static(DIST));
app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[opus-native-demo] serving ${DIST} on http://127.0.0.1:${PORT} (api → ${API_TARGET})`);
});
