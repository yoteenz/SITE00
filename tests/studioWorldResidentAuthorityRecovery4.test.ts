import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildCurrentFabricationSourceAuthority,
  listFabricationSourceAuthorities,
} from '../shared/site00-studio-world/resident-fabrication/fabricationSourceAuthority.js';

describe('studioWorldResidentAuthorityRecovery4', () => {
  it('maps 8 residents to casting-thumbnails-v1 + approved uniform full-body on disk', () => {
    const authorities = listFabricationSourceAuthorities();
    expect(authorities).toHaveLength(8);
    for (const a of authorities) {
      expect(a.portraitAuthority.repoPath).toContain('casting-thumbnails-v1');
      expect(a.fullBodyAuthority.repoPath).toContain('STUDIO_WORLD_RESIDENT_FULL_BODY_UNIFORM_REGEN');
      expect(a.outfitSystem).toMatch(/WOMEN_LEGGINGS|MEN_COMPRESSION_SHORTS/);
      expect(fs.existsSync(path.join(process.cwd(), a.portraitAuthority.repoPath))).toBe(true);
      expect(fs.existsSync(path.join(process.cwd(), a.fullBodyAuthority.repoPath))).toBe(true);
    }
  });

  it('SW-001 recovered portrait is white-studio casting thumbnail file', () => {
    const a = buildCurrentFabricationSourceAuthority('SW-001');
    expect(a?.portraitAuthority.repoPath).toMatch(/SW-RESIDENT-001_ETTA_VALE\.jpg$/);
  });
});
