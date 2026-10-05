import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const REPO = path.resolve(import.meta.dirname, '..');
const ALLOWLIST_PATH = path.join(REPO, 'docs/production/provider-gateway/PROVIDER_BYPASS_ALLOWLIST.json');

const APPROVED_PREFIXES = [
  'shared/site00-production-guardrails/providerGateway/',
  'shared/site00-jurnl-production/',
  'shared/site00-visual-generation/falImageViaProductionGateway.ts',
  'tests/',
  'scripts/production/',
];

function isApproved(file: string): boolean {
  return APPROVED_PREFIXES.some((p) => file.startsWith(p) || file.includes(p));
}

describe('direct provider bypass audit', () => {
  it('every @fal-ai/client import is allowlisted or in approved gateway paths', () => {
    const allowlist = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf8')) as {
      entries: { file: string }[];
    };
    const normalize = (f: string) => f.replace(/^\.\//, '');
    const allowedFiles = new Set(allowlist.entries.map((e) => normalize(e.file)));

    let hits: string[] = [];
    try {
      const out = execSync(`rg -l "@fal-ai/client" --glob '*.ts' --glob '*.tsx' .`, {
        cwd: REPO,
        encoding: 'utf8',
      });
      hits = out.trim().split('\n').filter(Boolean);
    } catch {
      hits = [];
    }

    const violations = hits.filter((f) => {
      const n = normalize(f);
      return !isApproved(n) && !allowedFiles.has(n);
    });
    expect(violations, `Unallowlisted direct FAL imports: ${violations.join(', ')}`).toEqual([]);
  });
});
