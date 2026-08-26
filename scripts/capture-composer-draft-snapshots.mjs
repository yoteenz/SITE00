#!/usr/bin/env node
/**
 * Capture all SITE 00 composer draft implementation snapshots (9 pages × 3 viewports).
 * Usage: node scripts/capture-composer-draft-snapshots.mjs [baseUrl]
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const baseUrl = process.argv[2] ?? process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5174';
const here = dirname(fileURLToPath(import.meta.url));
const tsScript = join(here, 'capture-composer-draft-snapshots.ts');

const result = spawnSync('npx', ['tsx', tsScript, baseUrl], { stdio: 'inherit', cwd: join(here, '..') });
process.exit(result.status ?? 1);
