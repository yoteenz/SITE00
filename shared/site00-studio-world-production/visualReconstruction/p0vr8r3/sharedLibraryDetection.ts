/**
 * P0.VR.8R3R5 — Detect missing Linux shared libraries for Chromium via ldd.
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const LDD_MISSING_RE = /=>\s+not found/g;

export function detectMissingSharedLibraries(executablePath: string | null): string[] {
  if (!executablePath || !existsSync(executablePath)) return [];
  if (process.platform !== 'linux') return [];

  try {
    const output = execSync(`ldd "${executablePath}"`, {
      encoding: 'utf8',
      timeout: 10_000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (!LDD_MISSING_RE.test(output)) return [];
    const missing: string[] = [];
    for (const line of output.split('\n')) {
      const match = line.match(/^\s*(\S+)\s+=>\s+not found/);
      if (match?.[1]) missing.push(match[1]);
    }
    return [...new Set(missing)];
  } catch {
    return [];
  }
}

export function systemDependenciesReady(executablePath: string | null): boolean {
  return detectMissingSharedLibraries(executablePath).length === 0;
}
