/**
 * P0.STUDIOOS.PRODUCTION.AUTHORITY-ASSET-RENDER.GROK1
 * The asset pass fills existing slots. It does not move chrome, auth, or the Expression floor order.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { AUTHORITY_ASSETS } from '../src/site00/components/productionAuthority/authorityAssets';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

describe('authority asset plates exist and stay in their slots', () => {
  it('ships every generated plate under public/site00', () => {
    const urls = [
      AUTHORITY_ASSETS.designAtrium,
      AUTHORITY_ASSETS.designCore,
      AUTHORITY_ASSETS.hubCrystal,
      AUTHORITY_ASSETS.experienceWorld,
      AUTHORITY_ASSETS.expressionStage,
      AUTHORITY_ASSETS.libraryCanon,
      AUTHORITY_ASSETS.viewportCorridor,
      ...AUTHORITY_ASSETS.libraryPlates,
      ...Object.values(AUTHORITY_ASSETS.boards),
    ];
    expect(urls).toHaveLength(16);
    for (const url of urls) {
      expect(existsSync(path.join(root, 'public', url)), url).toBe(true);
    }
  });

  it('hooks the atrium, corridor, and project core without removing the live viewport iframe', () => {
    const chamber = read('src/site00/components/productionAuthority/DesignChamber.tsx');
    expect(chamber).toContain('AUTHORITY_ASSETS.designAtrium');
    expect(chamber).toContain('AUTHORITY_ASSETS.viewportCorridor');
    expect(chamber).toContain('AUTHORITY_ASSETS.designCore');
    expect(chamber).toContain('<iframe');
  });

  it('does not touch auth or host-chrome scale', () => {
    const css = read('src/site00/styles/site00-production-authority-assets.css');
    expect(css).not.toMatch(/\.pxh-|\.ph-nav/);
    expect(css).not.toMatch(/\bzoom\s*:/);
    expect(read('src/site00/config/signInPaused.ts')).toContain('site00.com');
  });
});
