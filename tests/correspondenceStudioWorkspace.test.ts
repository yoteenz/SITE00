import { describe, expect, it } from 'vitest';
import { applyOpusV2BenchmarkImport } from '../shared/site00-correspondence-studio/import/opusV2BenchmarkImport.js';
import type { ReviewState } from '../shared/site00-correspondence-studio/types.js';
import {
  classifyEmailBlocks,
  copyContractFor,
  countByClassification,
  filterLibraryRows,
  listLibraryRows,
  resolveVersion,
  type EmailBlockDescriptor,
} from '../shared/site00-correspondence-studio/workspaceLibrary.js';

const manifest = applyOpusV2BenchmarkImport({ apply: true });
const stateOf = (row: { current_version: { review_state: ReviewState } }) => row.current_version.review_state;

describe('Correspondence Studio library', () => {
  it('lists all 20 registered templates for the SITE 00 brand in campaign sequence', () => {
    const rows = listLibraryRows(manifest, { brandAuthorityId: 'site00-dna' });
    expect(rows).toHaveLength(20);
    expect(rows[0].template_id).toBe('personal-foundation-invitation');
    expect(countByClassification(rows)).toEqual({ all: 20, transactional: 12, operational: 3, marketing: 5 });
  });

  it('keeps another brand authority isolated from SITE 00 templates', () => {
    expect(listLibraryRows(manifest, { brandAuthorityId: 'client-brand-example' })).toHaveLength(0);
  });

  it('codes imported editorial compositions by benchmark id', () => {
    const rows = listLibraryRows(manifest, { brandAuthorityId: 'site00-dna' });
    const byId = Object.fromEntries(rows.map((r) => [r.template_id, r]));
    expect(byId['personal-foundation-invitation'].code).toBe('B01');
    expect(byId['foundation-complete'].code).toBe('B02');
    expect(byId.M06.code).toBe('B03');
    expect(byId.M06.composed).toBe(true);
    expect(byId['intake-started'].composed).toBe(false);
  });

  it('filters by family, search text and review state', () => {
    const rows = listLibraryRows(manifest, { brandAuthorityId: 'site00-dna' });
    expect(filterLibraryRows(rows, { classification: 'operational', query: '' }, stateOf)).toHaveLength(3);
    expect(filterLibraryRows(rows, { classification: 'all', query: 'bldr' }, stateOf).map((r) => r.template_id)).toEqual(
      expect.arrayContaining(['bldr-discovery', 'M06']),
    );
    expect(filterLibraryRows(rows, { classification: 'all', query: 'payment is confirmed' }, stateOf).map((r) => r.template_id)).toEqual([
      'payment-confirmed',
    ]);
    const review = filterLibraryRows(rows, { classification: 'all', query: '', reviewStates: ['founder_review'] }, stateOf);
    expect(review.map((r) => r.code).sort()).toEqual(['B01', 'B02', 'B03']);
  });

  it('resolves a requested version and falls back to the current version', () => {
    const entry = manifest.templates.M06;
    expect(resolveVersion(entry, 'M06@v1-pack-registry').version_id).toBe('M06@v1-pack-registry');
    expect(resolveVersion(entry, 'missing').version_id).toBe('B03@v2-editorial-benchmark');
    expect(resolveVersion(entry).version_id).toBe('B03@v2-editorial-benchmark');
  });

  it('reads the registry copy contract without inventing copy', () => {
    expect(copyContractFor('quote-ready')?.subject).toBe('YOUR QUOTE IS READY');
    expect(copyContractFor('not-a-template')).toBeNull();
  });
});

describe('Correspondence Studio content blocks', () => {
  const node = (partial: Partial<EmailBlockDescriptor>): EmailBlockDescriptor => ({
    tag: 'div',
    className: '',
    text: '',
    imageSrc: null,
    hasHeading1: false,
    hasHeading2: false,
    ...partial,
  });

  it('maps the B03 structure to editorial block kinds', () => {
    const blocks = classifyEmailBlocks([
      node({ className: 'mast', text: 'SITE 00 BLDR' }),
      node({ className: 'hero', imageSrc: '/hero.jpg' }),
      node({ className: 'idea', text: 'AN ADDRESS DESERVES A BUILDING.', hasHeading1: true }),
      node({ className: 'open', text: 'MOST WEBSITES ARE PLANNED LIKE BROCHURES' }),
      node({ className: 'walk', text: '01 THE APPROACH', imageSrc: '/place.jpg' }),
      node({ tag: 'a', className: 'band', text: 'TAKE A WALK THROUGH BLDR →' }),
      node({ className: 'foot', text: 'MANAGE PREFERENCES' }),
    ]);
    expect(blocks.map((b) => b.label)).toEqual(['HEADER', 'HERO', 'HEADLINE', 'MAIN COPY', 'FEATURE', 'PRIMARY CTA', 'FOOTER']);
  });

  it('treats image-only bands as images and records breakpoint-only blocks', () => {
    const [band, close] = classifyEmailBlocks([
      node({ className: 'band mob-only', imageSrc: '/door.jpg' }),
      node({ className: 'close', imageSrc: '/horizon.jpg' }),
    ]);
    expect(band.kind).toBe('image');
    expect(band.viewport).toBe('mobile');
    expect(close.kind).toBe('image');
  });

  it('falls back to structural heuristics for unknown classes', () => {
    const blocks = classifyEmailBlocks([
      node({ className: 'x1', text: 'BRAND' }),
      node({ className: 'x2', imageSrc: '/a.jpg' }),
      node({ className: 'x3', text: 'TITLE', hasHeading1: true }),
      node({ tag: 'a', className: 'x4', text: 'GO' }),
    ]);
    expect(blocks.map((b) => b.kind)).toEqual(['header', 'hero', 'headline', 'primary_cta']);
  });
});
