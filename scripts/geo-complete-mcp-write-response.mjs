#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const RES = path.join(process.cwd(), 'artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE/_mcp_active_response.json');
const body = fs.readFileSync(0, 'utf8').trim();
JSON.parse(body);
fs.writeFileSync(RES, `${body}\n`);
