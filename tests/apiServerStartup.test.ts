/**
 * Railway deploy guard — critical API modules must import without missing exports.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(process.cwd());

describe('API server startup imports', () => {
  it('appService resolves review queue export', async () => {
    await expect(import('../api/_lib/site00ClientApp/appService.ts')).resolves.toBeTruthy();
  });

  it('server route registry loads', async () => {
    await expect(import('../server/routes.ts')).resolves.toBeTruthy();
  });

  it('registers expression-engine and experience-engine on Railway server', () => {
    const src = readFileSync(join(ROOT, 'server/routes.ts'), 'utf8');
    expect(src).toContain("path: '/api/site00/expression-engine'");
    expect(src).toContain("path: '/api/site00/experience-engine'");
    expect(src).toContain('site00ExpressionEngineHandler');
    expect(src).toContain('site00ExperienceEngineHandler');
  });
});
