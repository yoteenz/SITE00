#!/usr/bin/env node
/** Emit initial resident_fabrication_manifest.json from TS-built records (via vitest-less dynamic import). */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const outDir = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION');
fs.mkdirSync(outDir, { recursive: true });

const snippet = `
import { buildInitialResidentFabricationManifest } from '../src/site00/productionAssets/residentFabricationManifest.ts';
import { writeFileSync } from 'node:fs';
const m = buildInitialResidentFabricationManifest();
writeFileSync('artifacts/STUDIO_WORLD_RESIDENT_FABRICATION/resident_fabrication_manifest.json', JSON.stringify({ version: 1, frames: m }, null, 2));
console.log('frames', m.length);
`;
const tmp = path.join(ROOT, 'scripts/.tmp-export-manifest.ts');
fs.writeFileSync(tmp, snippet);
execSync(`npx tsx "${tmp}"`, { cwd: ROOT, stdio: 'inherit' });
fs.unlinkSync(tmp);
