#!/usr/bin/env node
/**
 * P0.B — Replace NDXBOOK architectural guards in api/site00/projects.ts
 * with capability-based checks; replace hardcoded projectId: 'ndxbook'.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PROJECTS_TS = join(process.cwd(), 'api/site00/projects.ts');

let src = readFileSync(PROJECTS_TS, 'utf8');

if (!src.includes('denyUnlessActionCapability')) {
  const importAnchor = "import { isFounderProjectSlug } from '../_lib/site00Projects/projectRegistry.js';";
  src = src.replace(
    importAnchor,
    `${importAnchor}\nimport { denyUnlessActionCapability } from '../_lib/site00Projects/projectCapabilityGuard.js';`,
  );
}

// Replace simple single-line ndxbook guards inside case blocks (with following access check intact)
src = src.replace(
  /if \(slug !== 'ndxbook'\) \{\s*return json\(res, 400, \{[\s\S]*?\}\);\s*\}/g,
  (match, offset) => {
    // Find nearest preceding case 'action':
    const before = src.slice(Math.max(0, offset - 400), offset);
    const caseMatch = before.match(/case '([^']+)':\s*\{/g);
    const action = caseMatch ? caseMatch[caseMatch.length - 1].match(/case '([^']+)'/)?.[1] : null;
    const sourceMatch = match.match(/source: '([^']+)'/);
    const source = sourceMatch?.[1] ?? 'site00_projects';
    if (!action) return match;
    return `if (!denyUnlessActionCapability(res, slug, '${action}', '${source}')) return;`;
  },
);

// Replace compound guards: slug !== 'ndxbook' || !something
src = src.replace(
  /if \(slug !== 'ndxbook' \|\| ([^)]+)\) \{\s*return json\(res, 400, \{[\s\S]*?\}\);\s*\}/g,
  (match, condition, offset) => {
    const before = src.slice(Math.max(0, offset - 400), offset);
    const caseMatch = before.match(/case '([^']+)':\s*\{/g);
    const action = caseMatch ? caseMatch[caseMatch.length - 1].match(/case '([^']+)'/)?.[1] : null;
    const sourceMatch = match.match(/source: '([^']+)'/);
    const source = sourceMatch?.[1] ?? 'site00_projects';
    if (!action) return match;
    return `if (!${condition.trim()}) {
          return json(res, 400, { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid request' }, source: '${source}' });
        }
        if (!denyUnlessActionCapability(res, slug, '${action}', '${source}')) return;`;
  },
);

// Replace hardcoded projectId: 'ndxbook' with dynamic slug (when in scope)
src = src.replace(/projectId: 'ndxbook'/g, 'projectId: slug');

writeFileSync(PROJECTS_TS, src);

const remaining = src.split('\n').filter((l) => /slug\s*!==\s*['"]ndxbook['"]/.test(l)).length;
const hardcoded = (src.match(/projectId: 'ndxbook'/g) ?? []).length;
console.log(`Refactor complete. Remaining ndxbook slug guards: ${remaining}. Hardcoded projectId: ${hardcoded}`);
