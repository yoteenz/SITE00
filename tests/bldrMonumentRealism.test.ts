/**
 * Monument realism pass: materials get thicker glass, honed stone, and a contact shadow.
 * Composition, rooms, and selection stay untouched.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const engine = readFileSync(new URL('../src/site00/builder-studio/buildObject/engine.ts', import.meta.url), 'utf8');
const rooms = readFileSync(new URL('../src/site00/builder-studio/rooms.tsx', import.meta.url), 'utf8');

describe('BLDR monument realism pass', () => {
  it('keeps glass painted over the photographic plate and holds the brand red', () => {
    expect(engine).toContain('Painted glass, not transmission');
    expect(engine).not.toContain('transmission:');
    expect(engine).toContain('color: 0xe50107');
    expect(engine).toContain('opacity: 0.4');
  });

  it('keeps stone procedural and adds a polish coat', () => {
    expect(engine).toContain('function polishedStone');
    expect(engine).toContain('clearcoat: opts.clearcoat');
    expect(engine).not.toContain('df-plate-');
  });

  it('grounds the object with a stronger contact shadow', () => {
    expect(engine).toContain('opacity: 0.24');
  });

  it('does not change the room choice structure', () => {
    expect(rooms).toContain('WHAT ARE WE CREATING');
    expect(rooms).toContain('aria-checked={selected}');
  });
});
