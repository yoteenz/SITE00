#!/usr/bin/env node
/**
 * P0.B pass 2 — compound ndxbook guards (multiline return blocks)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PROJECTS_TS = join(process.cwd(), 'api/site00/projects.ts');
let src = readFileSync(PROJECTS_TS, 'utf8');

const compoundRe =
  /if \(slug !== 'ndxbook' \|\| ([^)]+)\) \{\s*return json\(res, 400, \{[\s\S]*?source: '([^']+)'[\s\S]*?\}\);\s*\}/g;

src = src.replace(compoundRe, (match, condition, source, offset) => {
  const before = src.slice(Math.max(0, offset - 800), offset);
  const cases = [...before.matchAll(/case '([^']+)':/g)];
  const action = cases.length ? cases[cases.length - 1][1] : 'unknown_action';
  return `if (!(${condition.trim()})) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_REQUEST', message: 'Invalid request' },
            source: '${source}',
          });
        }
        if (!denyUnlessActionCapability(res, slug, '${action}', '${source}')) return;`;
});

writeFileSync(PROJECTS_TS, src);
const remaining = src.split('\n').filter((l) => /slug\s*!==\s*['"]ndxbook['"]/.test(l)).length;
console.log(`Pass 2 multiline complete. Remaining ndxbook slug guards: ${remaining}`);
