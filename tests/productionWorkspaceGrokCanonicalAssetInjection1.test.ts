/**
 * P0.SITE00.PRODUCTION-WORKSPACE-GROK-CANONICAL-ASSET-INJECTION1
 * Registry lineage, firewall, and frozen roots. No screenshot-crop runtime plates.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  experienceHeroPlate,
  getProductionAsset,
  productionAssetPaths,
} from '../src/site00/productionAssets/productionAssetRegistry';

const root = path.resolve(__dirname, '..');

describe('SITE 00 workspace canonical asset injection', () => {
  it('mounts the atrium master for hub and design, not the screenshot hero crops', () => {
    expect(productionAssetPaths.atriumMaster).toContain('production-atrium-master-v1.jpg');
    expect(productionAssetPaths.designAtrium).toBe(productionAssetPaths.atriumMaster);
    expect(productionAssetPaths.hubHero.desktop).toBe(productionAssetPaths.atriumMaster);
    expect(productionAssetPaths.expressionStage).toContain('production-floor-master-v1.jpg');
    expect(productionAssetPaths.viewportCorridor).toContain('production-viewport-corridor-master-v1.jpg');
    const atrium = getProductionAsset('grok.site00.production.plate-atrium-master.v1');
    expect(atrium?.notes).toContain('rEs5fx0WwEZwjzqVljaD');
    expect(atrium?.notes).toContain('3584x2016');
  });

  it('freezes experience and library roots and keeps NDX world plates off the host', () => {
    expect(productionAssetPaths.experienceWorld).toContain('production-experience-world-hero-v1.jpg');
    expect(productionAssetPaths.libraryCanon).toContain('production-library-canon-hero-v1.jpg');
    expect(experienceHeroPlate('ndxbook', 'world', 'root')).toBeNull();
    expect(experienceHeroPlate('ndxbook', 'world', 'overview')).toContain('project-ndxbook-world-sphere');
    expect(expressionHero('zones')).toContain('project-ndxbook-world-archipelago');
    expect(expressionHero('world-arch')).toBeTruthy();
    expect(experienceHeroPlate('other-project', 'zones', 'root')).toBeNull();
    expect(productionAssetPaths.ndxCore).toContain('/projects/ndxbook/');
    expect(getProductionAsset('project.ndxbook.world.plaza')?.publicPath).toContain('/projects/ndxbook/');
  });

  it('restores the founder hub nav master (384×284), not the 48px substitute', () => {
    const buf = readFileSync(path.join(root, 'src/site00/components/productionHub/bottom-nav/masters/01_HUB.png'));
    expect(buf.readUInt32BE(16)).toBe(384);
    expect(buf.readUInt32BE(20)).toBe(284);
  });
});

function expressionHero(kind: 'zones' | 'world-arch') {
  if (kind === 'zones') return experienceHeroPlate('ndxbook', 'zones', 'root');
  return experienceHeroPlate('ndxbook', 'world', 'architecture');
}
