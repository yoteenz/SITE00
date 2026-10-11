/**
 * QA-ONLY API harness for the Builder studio founder-review loop. Never deployed, never imported by the app.
 *
 *   SITE00_INTAKES_USE_MEMORY=1 npx tsx scripts/site00/builder-studio-qa/qa-api-server.ts
 *
 * - `/api/site00/intakes` is the REAL client handler (api/site00/intakes.ts) running on the intake service's
 *   in-memory store (the same store the service's own tests use). Nothing reaches Supabase.
 * - `/api/admin/site00-intakes` calls the REAL admin service functions (list / detail / applyAdminIntakeAction).
 *   Only the HTTP auth check is skipped, because admin auth needs a Supabase session this environment cannot reach.
 *   The harness refuses to start unless the memory store is active, so it can never touch real intake data.
 */
import express from 'express';
import intakesHandler from '../../../api/site00/intakes.js';
import {
  applyAdminIntakeAction,
  getIntakeForAdmin,
  listIntakeAuditEvents,
  listIntakesForAdmin,
} from '../../../api/_lib/site00Intakes/intakeService.js';
import { useMemoryStore } from '../../../api/_lib/site00Intakes/storeAdapter.js';
import { isIntakeType } from '../../../shared/site00-intakes/types.js';
import { createVercelRequest, createVercelResponse } from '../../../server/vercelAdapter.js';

if (!useMemoryStore()) {
  console.error('[qa-api] refusing to start: set SITE00_INTAKES_USE_MEMORY=1 (memory store only).');
  process.exit(1);
}

const QA_FOUNDER = process.env.QA_FOUNDER_EMAIL || 'founder-qa@site00.local';
const app = express();
app.use(express.json({ limit: '2mb' }));

app.all('/api/site00/intakes', async (req, res, next) => {
  try {
    await intakesHandler(createVercelRequest(req), createVercelResponse(res));
  } catch (err) {
    next(err);
  }
});

app.get('/api/admin/site00-intakes', async (req, res) => {
  try {
    const action = String(req.query.action ?? '');
    if (action === 'list') {
      const intakeType = isIntakeType(req.query.intakeType) ? req.query.intakeType : undefined;
      return res.json({ intakes: await listIntakesForAdmin({ intakeType, sort: 'recently_updated' }) });
    }
    if (action === 'detail') {
      const intakeType = req.query.intakeType;
      if (!isIntakeType(intakeType)) return res.status(400).json({ error: 'intakeType must be IDENTITY or BUILDER' });
      const id = String(req.query.id ?? '');
      const intake = await getIntakeForAdmin(intakeType, id);
      if (!intake) return res.status(404).json({ error: 'Intake not found' });
      return res.json({ intake, events: await listIntakeAuditEvents(intakeType, id), brandLore: null });
    }
    return res.status(400).json({ error: 'Unsupported action' });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

app.post('/api/admin/site00-intakes', async (req, res) => {
  try {
    const body = req.body ?? {};
    const action = String(body.action ?? '');
    if (!isIntakeType(body.intakeType)) return res.status(400).json({ error: 'intakeType must be IDENTITY or BUILDER' });
    const map = { 'mark-in-review': 'MARK_IN_REVIEW', archive: 'ARCHIVE', 'request-revision': 'REQUEST_REVISION' } as const;
    if (!(action in map)) return res.status(400).json({ error: 'Unsupported action' });
    const intake = await applyAdminIntakeAction(
      body.intakeType,
      String(body.id ?? ''),
      map[action as keyof typeof map],
      QA_FOUNDER,
      action === 'request-revision' ? { message: String(body.message ?? '') } : undefined,
    );
    return res.json({ intake });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true, store: 'memory', qa: true }));

const port = Number(process.env.QA_API_PORT) || 3100;
const server = app.listen(port, '127.0.0.1', () => console.log(`[qa-api] memory-store intake API on http://127.0.0.1:${port}`));
// Keep pooled client sockets valid between QA steps (a socket closed by the server mid-reuse stalls the forwarder).
server.keepAliveTimeout = 120_000;
server.headersTimeout = 125_000;
