#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PACK = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE');
const QUEUE = path.join(PACK, '_job_queue.json');
const STATE = path.join(PACK, '_autogen_state.json');
const RESIDENTS = ['SW-001', 'SW-002', 'SW-003', 'SW-004', 'SW-005', 'SW-006', 'SW-007', 'SW-008'];

const jobs = JSON.parse(fs.readFileSync(QUEUE, 'utf8'));
const newSlots = jobs.map((j) => j.slot).filter((s, i, a) => a.indexOf(s) === i);

function exists(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) && fs.statSync(p).size > 500;
}

const generated = jobs.filter((j) => exists(j.relative_path)).length;
const pending = jobs.length - generated;
const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : null;
const retries = state?.retries_by_resident ?? Object.fromEntries(RESIDENTS.map((id) => [id, 0]));

console.log(
  JSON.stringify(
    {
      queue_total: jobs.length,
      on_disk_valid: generated,
      pending,
      failed: state?.failed ?? 0,
      retries_by_resident: retries,
      runner_alive: fs.existsSync('/tmp/geo-handshake-runner.log'),
    },
    null,
    2,
  ),
);
