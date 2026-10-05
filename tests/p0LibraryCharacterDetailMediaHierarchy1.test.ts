/**
 * P0.STUDIOOS.PRODUCTION.LIBRARY.CHARACTER-DETAIL.MEDIA-HIERARCHY-INSPECTOR1
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LibraryCharacterImageInspector } from '../src/site00/components/productionAuthority/realm/LibraryCharacterImageInspector';
import { characterMediaAssets } from '../src/site00/components/productionAuthority/realm/libraryCharacterMedia';
import type { RealmRecord } from '../src/site00/components/productionAuthority/realm/realmData';
import { productionAssetPublicPath } from '../src/site00/productionAssets';

const root = path.resolve(__dirname, '..');
const css = readFileSync(path.join(root, 'src/site00/styles/site00-production-realm.css'), 'utf8');
const libraryScreenSrc = readFileSync(path.join(root, 'src/site00/components/productionAuthority/realm/LibraryScreen.tsx'), 'utf8');

const noaPortrait = productionAssetPublicPath('resident.sw004.noa.portrait');

const noaRecord: RealmRecord = {
  id: 'SW-004',
  title: 'NOA KLINE',
  kicker: 'RESIDENT SW-004',
  sub: 'SYSTEMS ARCHITECT',
  img: noaPortrait,
  lifecycle: 'CANONICAL',
  status: 'PORTRAIT',
  tone: 'green',
  facts: [['ID', 'SW-004']],
  tags: [],
  source: 'STUDIO WORLD RESIDENTS',
  version: null,
  usedBy: [],
  from: [],
  to: [],
  open: null,
  metric: null,
};

describe('P0 library character detail media hierarchy', () => {
  it('resolves Noa portrait authority for character media assets', () => {
    expect(noaPortrait).toBeTruthy();
    const assets = characterMediaAssets(noaRecord);
    expect(assets[0]?.label).toBe('PORTRAIT');
    expect(assets[0]?.url).toBe(noaPortrait);
  });

  it('character detail implementation exposes focal media + inspector hooks', () => {
    expect(libraryScreenSrc).toContain('CharacterDetail');
    expect(libraryScreenSrc).toContain('library-character-media-open');
    expect(libraryScreenSrc).toContain('lbf--char-focus');
    expect(libraryScreenSrc).toContain('RelatedCharacterTile');
  });

  it('image inspector markup includes asset, navigation, and close control', () => {
    const html = renderToStaticMarkup(
      createElement(LibraryCharacterImageInspector, {
        assets: [
          ...characterMediaAssets(noaRecord),
          { id: 'v2', label: 'FULL BODY', url: '/site00/example/full.jpg', status: null },
        ],
        index: 0,
        title: 'NOA KLINE',
        onClose: () => {},
        onStep: () => {},
      }),
    );
    expect(html).toContain('library-character-inspector-image');
    expect(html).toContain('library-character-inspector-close');
    expect(html).toContain('library-character-inspector-prev');
    expect(html).toContain('library-character-inspector-next');
    expect(html).toContain(noaPortrait!);
  });

  it('stylesheet defines character detail grid and inspector overlay', () => {
    expect(css).toContain('.lbf-body--char-detail');
    expect(css).toContain('.lbf-char-media');
    expect(css).toContain('.lbf-char-inspect');
    expect(css).toContain('.lbf--char-focus');
    expect(css).toContain('.rk-tile--split');
    expect(css).toContain('.rk-tile__media-hit');
  });
});
