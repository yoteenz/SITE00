/**
 * Fail CI if git merge conflict markers were committed into source.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(process.cwd());
const SCAN_ROOTS = ['src', 'api', 'shared', 'server'];

function listSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) listSourceFiles(full, acc);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry)) acc.push(full);
  }
  return acc;
}

describe('merge conflict markers', () => {
  it('are absent from committed source files', () => {
    const offenders: string[] = [];
    for (const root of SCAN_ROOTS) {
      for (const file of listSourceFiles(join(ROOT, root))) {
        const content = readFileSync(file, 'utf8');
        if (/^<{7} |^={7}$|^>{7} /m.test(content)) {
          offenders.push(file.replace(`${ROOT}/`, ''));
        }
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });
});
