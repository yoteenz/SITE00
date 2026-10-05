#!/usr/bin/env node
/**
 * One-shot: read _mcp_active_request.json, print what the cloud agent should call (for manual/debug).
 * The cloud agent loop should watch REQ and write RES using OpenArt CallDynamicTool.
 */
import fs from 'node:fs';
import path from 'node:path';

const REQ = path.join(process.cwd(), 'artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE/_mcp_active_request.json');
if (!fs.existsSync(REQ)) {
  console.error('no active request');
  process.exit(1);
}
console.log(fs.readFileSync(REQ, 'utf8'));
