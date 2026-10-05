#!/usr/bin/env node
/**
 * P0.E.FT5.1 — Astral World production preflight (no secret values printed).
 */
import { getProductionPreflight } from '../api/_lib/site00AstralWorld/generationService.js';
import { countByPriority } from '../shared/site00-astral-world/generation/generationManifest.js';

const preflight = getProductionPreflight();
console.log('ASTRAL WORLD FAL PREFLIGHT');
console.log(JSON.stringify(preflight, null, 2));

const counts = countByPriority();
console.log('MANIFEST COUNTS', counts);

if (preflight.falKey === 'MISSING') {
  console.error('BLOCKED: Configure FAL_KEY on Railway API service (api.site00.com).');
  process.exit(1);
}

console.log('READY: FAL runtime preflight passed.');
