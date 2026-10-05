#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const REQ = path.join(process.cwd(), 'artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE/_mcp_active_request.json');
const maxMs = Number(process.argv[2] || 300000);
const start = Date.now();
while (Date.now() - start < maxMs) {
  if (fs.existsSync(REQ)) {
    process.stdout.write(fs.readFileSync(REQ, 'utf8'));
    process.exit(0);
  }
  spawnSync('sleep', ['0.25'], { stdio: 'ignore' });
}
process.exit(2);
