#!/usr/bin/env node
/** Poll active MCP request and mirror to /tmp/geo_mcp_pending.json for cloud agent fulfillment. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const PACK = path.join(process.cwd(), 'artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE');
const REQ = path.join(PACK, '_mcp_active_request.json');
const PENDING = '/tmp/geo_mcp_pending.json';
const DONE = '/tmp/geo_mcp_done.json';

let lastKey = '';
while (true) {
  if (!fs.existsSync(REQ)) {
    spawnSync('sleep', ['0.3'], { stdio: 'ignore' });
    continue;
  }
  const raw = fs.readFileSync(REQ, 'utf8');
  const key = raw;
  if (key !== lastKey) {
    lastKey = key;
    try {
      fs.unlinkSync(DONE);
    } catch {
      /* ok */
    }
    fs.writeFileSync(PENDING, raw);
    console.error('[fulfill-daemon] pending updated', JSON.parse(raw).type);
  }
  if (fs.existsSync(DONE)) {
    const result = fs.readFileSync(DONE, 'utf8').trim();
    spawnSync('node', ['scripts/geo-complete-mcp-handshake-agent-run.mjs', 'write-result'], {
      cwd: process.cwd(),
      input: result,
      stdio: ['pipe', 'inherit', 'inherit'],
    });
    try {
      fs.unlinkSync(DONE);
    } catch {
      /* ok */
    }
    lastKey = '';
    console.error('[fulfill-daemon] wrote response');
  }
  spawnSync('sleep', ['0.2'], { stdio: 'ignore' });
}
