#!/usr/bin/env node
/**
 * Founder-initiated live CONCEPT_TERRITORIES proof against local or Railway API.
 * Usage: SITE00_CREATIVE_DIRECTOR_API_BASE=http://127.0.0.1:8787 node scripts/studioos/run-creative-director-live-proof.mjs
 * Does not log secrets or full context payloads.
 */
import { readFileSync } from 'node:fs';

const API_BASE = (process.env.SITE00_CREATIVE_DIRECTOR_API_BASE || 'https://api.site00.com').replace(/\/$/, '');

async function api(action, body = {}) {
  const isGet = !Object.keys(body).length && action !== 'run';
  const url = isGet
    ? `${API_BASE}/api/site00/experience-compiler-creative-director?action=${action}`
    : `${API_BASE}/api/site00/experience-compiler-creative-director?action=${action}`;
  const res = await fetch(url, {
    method: isGet ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: isGet ? undefined : JSON.stringify({ ...body, action }),
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

const snapshotPath = new URL('../../src/studioos/experience-compiler/__tests__/fixtures/creative-director-site00-snapshot.json', import.meta.url);
let snapshot;
try {
  snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
} catch {
  console.error('SNAPSHOT_FIXTURE_MISSING — build snapshot in workspace bootstrap or pass SITE00_CD_SNAPSHOT_PATH');
  process.exit(1);
}

const status = await api('runtime-status');
console.log(
  JSON.stringify({
    OPENAI_API_KEY_PRESENT: status.json.OPENAI_API_KEY_PRESENT,
    model: status.json.model,
    reasoning_effort: status.json.reasoning_effort,
    persistence_backend: status.json.persistence_backend,
    http: status.status,
  }),
);

const { json: created } = await api('create-thread', {
  project_id: snapshot.project_id,
  project_slug: 'site00',
  title: 'SITE 00 → YOUR SPACE → CREATIVE ARCHITECTURE',
  task_mode: 'CONCEPT_TERRITORIES',
});

const thread_id = created.thread?.thread_id;
if (!thread_id) {
  console.error('CREATE_THREAD_FAILED', created);
  process.exit(2);
}

const run = await api('run', {
  thread_id,
  snapshot,
  founder_initiated: true,
  task_mode: 'CONCEPT_TERRITORIES',
});

const territories = run.json.artifact?.payload?.territories;
console.log(
  JSON.stringify({
    thread_id,
    run_id: run.json.run?.run_id,
    model: run.json.run?.model,
    reasoning: run.json.run?.reasoning_level,
    task_mode: run.json.run?.task_mode,
    status: run.json.runtime_state ?? (run.json.ok ? 'LIVE_RUN_SUCCEEDED' : 'LIVE_RUN_FAILED'),
    artifact_count: Array.isArray(territories) ? territories.length : 0,
    http: run.status,
  }),
);

if (!run.json.ok) process.exit(3);
