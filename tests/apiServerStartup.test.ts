/**
 * Railway deploy guard — critical API modules must import without missing exports.
 */

import { describe, expect, it } from 'vitest';

describe('API server startup imports', () => {
  it('appService resolves review queue export', async () => {
    await expect(import('../api/_lib/site00ClientApp/appService.ts')).resolves.toBeTruthy();
  });

  it('server route registry loads', async () => {
    await expect(import('../server/routes.ts')).resolves.toBeTruthy();
  });
});
