#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const PACK = path.join(process.cwd(), 'artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE');
const REQ = path.join(PACK, '_mcp_active_request.json');
const RES = path.join(PACK, '_mcp_active_response.json');
const mode = process.argv[2];

if (mode === 'read') {
  if (!fs.existsSync(REQ)) process.exit(2);
  process.stdout.write(fs.readFileSync(REQ, 'utf8'));
  process.exit(0);
}

if (mode === 'write') {
  const body = process.argv[3] || fs.readFileSync(0, 'utf8');
  JSON.parse(body);
  fs.writeFileSync(RES, `${body.trim()}\n`);
  process.exit(0);
}

if (mode === 'runner-alive') {
  const r = spawnSync('tmux', ['-f', '/exec-daemon/tmux.portal.conf', 'has-session', '-t', '=geo-complete-handshake'], {
    encoding: 'utf8',
  });
  process.exit(r.status === 0 ? 0 : 1);
}

console.error('Usage: handshake-step.mjs read|write [json]|runner-alive');
process.exit(1);
