#!/usr/bin/env node
/**
 * Agent-side helper: wait for REQ, emit action JSON on stdout; after MCP, pass result on stdin to `write`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const PACK = path.join(process.cwd(), 'artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE');
const REQ = path.join(PACK, '_mcp_active_request.json');
const RES = path.join(PACK, '_mcp_active_response.json');
const cmd = process.argv[2];

if (cmd === 'wait-action') {
  const maxMs = Number(process.argv[3] || 300000);
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (fs.existsSync(REQ)) {
      const req = JSON.parse(fs.readFileSync(REQ, 'utf8'));
      if (req.type === 'generate') {
        console.log(JSON.stringify({ action: 'generate', call: req.call, job: req.job }));
        process.exit(0);
      }
      if (req.type === 'wait') {
        console.log(
          JSON.stringify({ action: 'wait', historyId: req.historyId, timeoutSeconds: req.timeoutSeconds ?? 90 }),
        );
        process.exit(0);
      }
    }
    spawnSync('sleep', ['0.25'], { stdio: 'ignore' });
  }
  process.exit(2);
}

if (cmd === 'write-result') {
  const resultJson = fs.readFileSync(0, 'utf8').trim();
  JSON.parse(resultJson);
  fs.writeFileSync(RES, `${resultJson}\n`);
  process.exit(0);
}

console.error('Usage: handshake-agent-run.mjs wait-action [maxMs] | write-result < stdin');
process.exit(1);
