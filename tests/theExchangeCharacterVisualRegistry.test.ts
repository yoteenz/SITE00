import { describe, expect, it } from 'vitest';
import {
  loadCharacterVisualRegistry,
  validateCharacterVisualRegistry,
} from '../shared/site00-fiction-canon/characterVisualRegistry.js';
import fs from 'node:fs';
import path from 'node:path';

describe('THE EXCHANGE character visual registry Oct 2026', () => {
  it('loads registry with five characters and seven assets including Executive Gideon', () => {
    const reg = loadCharacterVisualRegistry();
    expect(reg.propertySlug).toBe('the-exchange');
    expect(reg.characters).toHaveLength(5);
    const assets = reg.characters.flatMap((c) => c.assets);
    expect(assets).toHaveLength(7);
    const gideon = reg.characters.find((c) => c.characterId === 'gideon-shaw')!;
    expect(gideon.assets.some((a) => a.runtimePublicPath.includes('gideon_executive_portrait'))).toBe(true);
    expect((gideon as { founderApprovedAgeRange?: string }).founderApprovedAgeRange).toBe('42-45');
  });

  it('validates public asset integrity and hashes', () => {
    const result = validateCharacterVisualRegistry();
    expect(result.assetCount).toBe(7);
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('marks Sloane and Gideon facial identity locked in registry', () => {
    const reg = loadCharacterVisualRegistry();
    const sloane = reg.characters.find((c) => c.characterId === 'sloane-lockwood')!;
    expect(sloane.assets.every((a) => a.visualApprovalStatus === 'FACIAL_IDENTITY_LOCKED')).toBe(true);
    const gideon = reg.characters.find((c) => c.characterId === 'gideon-shaw')!;
    expect(gideon.assets[0].visualApprovalStatus).toBe('FACIAL_IDENTITY_LOCKED');
  });

  it('preserves founder source archive copy', () => {
    const base = path.join(
      process.cwd(),
      'THE_EXCHANGE/FOUNDER_SOURCE/CHARACTER_VISUAL_HANDOFF_OCT22_2026/assets',
    );
    expect(fs.readdirSync(base).filter((f) => f.endsWith('.jpeg'))).toHaveLength(6);
  });
});
