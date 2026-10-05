/**
 * Release #429 authority commit — optional in CI shallow clones.
 */

import { execSync } from 'node:child_process';

/** Documented short SHAs (merge #1010). */
export const RELEASE429_REF_CANDIDATES = ['441ae433', '441ae43'] as const;

export function resolveRelease429Ref(cwd: string): string | null {
  for (const ref of RELEASE429_REF_CANDIDATES) {
    try {
      execSync(`git rev-parse --verify ${ref}^{commit}`, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      return ref;
    } catch {
      /* try next */
    }
  }
  return null;
}

export function gitDiffNames(cwd: string, base: string, paths: string[]): string[] {
  const out = execSync(`git diff --name-only ${base} HEAD -- ${paths.join(' ')}`, {
    cwd,
    encoding: 'utf8',
  });
  return out
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .sort();
}

export function gitShowFile(cwd: string, base: string, file: string): string {
  return execSync(`git show ${base}:${file}`, { cwd, encoding: 'utf8' });
}
