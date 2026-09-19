/**
 * Railway deploy guard — api/site00/projects.ts must parse and register key actions.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(process.cwd());

describe('projects API syntax + action registry', () => {
  it('projects.ts module imports without transform errors', async () => {
    await expect(import('../api/site00/projects.ts')).resolves.toBeTruthy();
  });

  it('registers canonical anchor and carousel judgment actions', () => {
    const src = readFileSync(join(ROOT, 'api/site00/projects.ts'), 'utf8');
    expect(src).toContain("case 'character_visual_casting_generate_canonical_anchor'");
    expect(src).toContain('await setCarouselSlideFounderJudgment');
    expect(src).toContain('await setCarouselDirectionFounderVerdict');
    expect(src).not.toMatch(/return;\s*catch/);
  });
});
