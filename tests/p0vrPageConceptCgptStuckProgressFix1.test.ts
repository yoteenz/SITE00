/**
 * P0 fix — CGPT run progress must persist durably for cross-instance poll; Anthropic guard.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(process.cwd(), 'api/_lib/site00PageConcept');

describe('P0 page concept CGPT stuck progress fix', () => {
  it('awaits durable upsert on progress patches', () => {
    const store = readFileSync(join(ROOT, 'pageConceptGenerationRunStore.ts'), 'utf8');
    expect(store).toContain('await upsertPageConceptServerRunDurable(next)');
  });

  it('persists run row before background worker starts', () => {
    const start = readFileSync(join(ROOT, 'startPageConceptGenerationRun.ts'), 'utf8');
    expect(start).toContain('await upsertPageConceptServerRunDurable(run)');
  });

  it('fails fast when Anthropic is not configured', () => {
    const cgpt = readFileSync(join(ROOT, 'executePageConceptCgptStage.ts'), 'utf8');
    expect(cgpt).toContain('isAnthropicConfigured');
    expect(cgpt).toContain('ANTHROPIC_API_KEY missing');
  });

  it('inlines capture base64 on client dispatch when readable', () => {
    const hook = readFileSync(
      join(process.cwd(), 'src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts'),
      'utf8',
    );
    expect(hook).toContain('artifactBase64 = await artifactPathToBase64(path)');
  });

  it('timeouts Anthropic CGPT fetch', () => {
    const gen = readFileSync(join(ROOT, 'generatePageCreativeInjection.ts'), 'utf8');
    expect(gen).toContain('PAGE_CONCEPT_CGPT_PROVIDER_TIMEOUT_MS');
    expect(gen).toContain('AbortSignal.timeout');
  });
});
