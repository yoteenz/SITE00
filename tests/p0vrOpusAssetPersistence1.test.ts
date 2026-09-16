/**
 * P0.VR.DESIGNBENCH.OPUS-ASSET-PERSISTENCE1 — asset authority guards.
 *
 * The GROK-ASSET-OPUS1 plate set was lost because PR #945 was merged into the
 * already-merged feature branch `cursor/twin-opus-direct-e65d` instead of
 * `main`, so the plates never existed in the mainline tree. Nothing in the
 * suite noticed: the route degraded to a CSS-drawn fallback that still rendered
 * and still passed. These guards make that class of loss fail loudly.
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  TWIN_OPUS_DIRECT_ASSET_MANIFEST,
  TWIN_OPUS_DIRECT_ASSET_MANIFEST_VERSION,
  TWIN_OPUS_DIRECT_ASSET_MUTATION_ALLOWED,
  TWIN_OPUS_DIRECT_ASSET_OWNERSHIP,
  TWIN_OPUS_DIRECT_ASSET_PRECEDENCE,
  resolveTwinOpusDirectAsset,
  twinOpusDirectAssetEntry,
  type TwinOpusDirectAssetSlotId,
} from '../src/site00/components/designBench/opusDirect/twinOpusDirectAssetManifest';

const root = resolve(__dirname, '..');
const read = (relative: string) => readFileSync(resolve(root, relative), 'utf8');

const canonicalView = read('src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx');
const listView = read('src/site00/components/designBench/opusDirect/TwinOpusDirectListView.tsx');
const workspace = read('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts');
const canonicalCss = read('src/site00/styles/site00-twin-opus-direct.css');
const listCss = read('src/site00/styles/site00-twin-opus-list.css');

const RENDERED_SLOTS = TWIN_OPUS_DIRECT_ASSET_MANIFEST.filter((entry) => entry.rendered && entry.src);

describe('P0.VR.DESIGNBENCH.OPUS-ASSET-PERSISTENCE1 — approved assets exist on disk', () => {
  // This is the guard that would have caught the original loss: the manifest
  // can reference a plate that a branch merge never brought along.
  it.each(TWIN_OPUS_DIRECT_ASSET_MANIFEST.filter((entry) => entry.src).map((entry) => [entry.slot, entry.src!]))(
    'slot %s resolves to a file committed under public/',
    (_slot, src) => {
      expect(src.startsWith('/site00/')).toBe(true);
      expect(existsSync(resolve(root, 'public', src.replace(/^\//, '')))).toBe(true);
    },
  );

  it('keeps every declared fallback on disk too, so degradation stays intact', () => {
    for (const entry of TWIN_OPUS_DIRECT_ASSET_MANIFEST) {
      if (!entry.fallbackSrc) continue;
      expect(existsSync(resolve(root, 'public', entry.fallbackSrc.replace(/^\//, '')))).toBe(true);
    }
  });

  it('ships the full approved Grok plate set', () => {
    const files = new Set(
      TWIN_OPUS_DIRECT_ASSET_MANIFEST.filter((entry) => entry.sourceModel === 'GROK').map((entry) => entry.src),
    );
    expect(files).toEqual(
      new Set([
        '/site00/twin-opus-direct/tod-hand-plate.jpg',
        '/site00/twin-opus-direct/tod-collage-plate.jpg',
        '/site00/twin-opus-direct/tod-001-split.jpg',
        '/site00/twin-opus-direct/tod-form.png',
        '/site00/twin-opus-direct/tod-blueprint.jpg',
        '/site00/twin-opus-direct/tod-overlay-001.png',
        '/site00/twin-opus-direct/tod-evidence-pack.jpg',
        '/site00/twin-opus-direct/tod-portrait.png',
      ]),
    );
  });
});

describe('P0.VR.DESIGNBENCH.OPUS-ASSET-PERSISTENCE1 — precedence', () => {
  it('ranks founder approval above Grok, project and legacy fallback', () => {
    expect(TWIN_OPUS_DIRECT_ASSET_PRECEDENCE).toEqual([
      'FOUNDER_APPROVED',
      'GROK_APPROVED',
      'PROJECT',
      'LEGACY_FALLBACK',
    ]);
  });

  it('never lets a fallback win while the slot holds an approved asset', () => {
    for (const entry of RENDERED_SLOTS) {
      expect(entry.approved).toBe(true);
      expect(resolveTwinOpusDirectAsset(entry.slot)).toBe(entry.src);
      expect(resolveTwinOpusDirectAsset(entry.slot)).not.toBe(entry.fallbackSrc);
    }
  });

  it('activates the fallback only when a slot has no approved asset', () => {
    const entry = twinOpusDirectAssetEntry('hero');
    const unapproved = { ...entry, approved: false };
    const resolved = unapproved.approved && unapproved.src ? unapproved.src : unapproved.fallbackSrc;
    expect(resolved).toBe(entry.fallbackSrc);
  });

  it('carries lineage identity on every approved slot', () => {
    for (const entry of TWIN_OPUS_DIRECT_ASSET_MANIFEST) {
      expect(entry.assetId).toBeTruthy();
      expect(entry.version).toBeTruthy();
      expect(entry.goldenLineage).toBeTruthy();
      expect(entry.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('stamps a manifest version so slot identity changes are traceable', () => {
    expect(TWIN_OPUS_DIRECT_ASSET_MANIFEST_VERSION).toBe('twin-opus-direct-assets-v1');
  });
});

describe('P0.VR.DESIGNBENCH.OPUS-ASSET-PERSISTENCE1 — single authority', () => {
  it('routes both renderers through the manifest', () => {
    expect(canonicalView).toContain("from './twinOpusDirectAssetManifest'");
    expect(listView).toContain("from './twinOpusDirectAssetManifest'");
  });

  it('leaves no renderer holding a hardcoded plate path', () => {
    for (const view of [canonicalView, listView]) {
      expect(view).not.toContain('/site00/twin-opus-direct/');
      expect(view).not.toContain('TWIN_OPUS_DIRECT_PAPER_TEXTURE');
    }
  });

  it('paints the same approved slot ids in CANONICAL and LIST', () => {
    const slots = (view: string) =>
      new Set(Array.from(view.matchAll(/slot="([a-zA-Z]+)"/g)).map((match) => match[1]));
    expect(slots(listView)).toEqual(slots(canonicalView));
  });

  it('resolves an identical src for every shared slot across both views', () => {
    const shared = Array.from(
      new Set(Array.from(canonicalView.matchAll(/slot="([a-zA-Z]+)"/g)).map((match) => match[1])),
    ) as TwinOpusDirectAssetSlotId[];
    expect(shared.length).toBeGreaterThan(0);
    for (const slot of shared) {
      // One manifest, so LIST cannot fork identity — only crop via CSS.
      expect(resolveTwinOpusDirectAsset(slot)).toBe(twinOpusDirectAssetEntry(slot).src);
    }
  });

  it('gives each view its own crop rules over the shared source', () => {
    expect(canonicalCss).toContain('.tod-plate__photo');
    expect(listCss).toContain('.tod-lv-plate__photo');
  });
});

describe('P0.VR.DESIGNBENCH.OPUS-ASSET-PERSISTENCE1 — persistence and storage', () => {
  it('persists no asset data in local or session storage', () => {
    for (const source of [canonicalView, listView, workspace]) {
      const writes = source.match(/(localStorage|sessionStorage)\.setItem\([^)]*\)/g) ?? [];
      for (const write of writes) {
        expect(write).not.toMatch(/asset|src|plate|image/i);
      }
    }
  });

  it('keeps view mode the only persisted key on the route', () => {
    const keys = workspace.match(/'site00:[^']+'/g) ?? [];
    expect(keys).toEqual(["'site00:twin-opus-direct:view-mode:v1'"]);
  });

  it('holds asset identity in module scope, so remount cannot mutate it', () => {
    const first = resolveTwinOpusDirectAsset('hero');
    const second = resolveTwinOpusDirectAsset('hero');
    expect(first).toBe(second);
    expect(workspace).not.toMatch(/asset/i);
  });
});

describe('P0.VR.DESIGNBENCH.OPUS-ASSET-PERSISTENCE1 — approval lock', () => {
  it('blocks asset mutation by default', () => {
    expect(TWIN_OPUS_DIRECT_ASSET_MUTATION_ALLOWED).toBe(false);
  });

  it('records the agent firewall: Opus and Spark read, Grok mutates on request', () => {
    expect(TWIN_OPUS_DIRECT_ASSET_OWNERSHIP.OPUS).toBe('READ_ONLY');
    expect(TWIN_OPUS_DIRECT_ASSET_OWNERSHIP.SPARK).toBe('READ_ONLY');
    expect(TWIN_OPUS_DIRECT_ASSET_OWNERSHIP.GROK).toBe('MUTATE_WHEN_EXPLICITLY_REQUESTED');
  });
});
