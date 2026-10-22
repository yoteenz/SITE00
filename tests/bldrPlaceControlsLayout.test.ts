import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('BLDR PLACE controls layout', () => {
  it('matches FEEL horizontal strip with caption above cards', () => {
    const rooms = readFileSync('src/site00/builder-studio/rooms.tsx', 'utf8');
    const place = rooms.slice(rooms.indexOf('export function PlaceControls'), rooms.indexOf('/* ─────────────────────────────── 02 FEEL'));
    expect(place).toContain('bs-feel-caption');
    expect(place).toContain('bs-strip');
    expect(place).not.toContain('bs-cards');
    expect(place).not.toContain('bs-card__sub');
  });
});
