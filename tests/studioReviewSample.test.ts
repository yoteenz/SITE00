import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { reviewSampleFromQuery, studioPathForReviewRoom } from '../src/site00/builder-studio/studioReviewSample';

describe('BLDR studio design-review sample', () => {
  it('builds a frozen FEEL room with MODERN selected', () => {
    const sample = reviewSampleFromQuery('FEEL');
    expect(sample?.room).toBe('FEEL');
    expect(sample?.feelVibe).toBe('MODERN');
    expect(sample?.placePath).toBe('ADVANCED');
  });

  it('maps review room ids to studio route segments', () => {
    expect(studioPathForReviewRoom('FEEL')).toBe('feel');
    expect(studioPathForReviewRoom('BLUEPRINT')).toBe('blueprint');
  });

  it('foundation review embeds hybrid studio with reviewRoom query', () => {
    const embed = readFileSync(
      'src/site00/pages/foundation/DigitalFoundationReviewBuilderStudioEmbed.tsx',
      'utf8',
    );
    expect(embed).toContain('reviewRoom=');
    expect(embed).toContain('studioPathForReviewRoom');
    expect(embed).toContain('df-review__studio');
  });
});
