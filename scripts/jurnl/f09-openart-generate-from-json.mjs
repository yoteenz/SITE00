#!/usr/bin/env node
/**
 * Invoke OpenArt image generation via the Cursor MCP bridge (stdin JSON args file).
 * Usage: node f09-openart-generate-from-json.mjs /tmp/mcp-args-t01.json
 * Prints historyId on stdout when generation is submitted.
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const argsPath = process.argv[2];
if (!argsPath) {
  console.error('Usage: f09-openart-generate-from-json.mjs <args.json>');
  process.exit(1);
}
const payload = JSON.parse(readFileSync(argsPath, 'utf8'));

// Delegate to npx @openart/cli if present; otherwise emit payload for agent MCP handoff.
const which = spawnSync('npx', ['--yes', '@openart/cli', '--version'], { encoding: 'utf8' });
if (which.status === 0) {
  const run = spawnSync(
    'npx',
    ['--yes', '@openart/cli', 'generate', 'image', '--json', argsPath],
    { encoding: 'utf8', stdio: 'inherit' },
  );
  process.exit(run.status ?? 1);
}

console.log(JSON.stringify({ mcpHandoff: true, payload }));
