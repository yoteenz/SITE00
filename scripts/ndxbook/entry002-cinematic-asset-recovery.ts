#!/usr/bin/env tsx
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { recoverEntry002Assets } from '../../shared/site00-ndxbook-cinematic-execution/entry002/assetRecovery.js';
import { writeBenchmarkPacketJson } from '../../shared/site00-ndxbook-cinematic-execution/entry002/benchmarkShotPacket.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(repoRoot, 'docs/site00/ndxbook/cinematic-execution/generated');
fs.mkdirSync(outDir, { recursive: true });

const recovery = recoverEntry002Assets(repoRoot);
fs.writeFileSync(path.join(outDir, 'ENTRY002_ASSET_RECOVERY.json'), JSON.stringify(recovery, null, 2));

writeBenchmarkPacketJson(repoRoot, path.join(outDir, 'ENTRY002_BENCHMARK_EXECUTION_PACKET.json'));

console.log(`Wrote ${outDir}/ENTRY002_ASSET_RECOVERY.json`);
console.log(`Wrote ${outDir}/ENTRY002_BENCHMARK_EXECUTION_PACKET.json`);
