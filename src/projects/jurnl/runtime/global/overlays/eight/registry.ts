/**
 * The eight global overlays' production assets (P0.JURNL.GLOBAL-EIGHT-OVERLAYS). Generated from the handoff manifest;
 * do not edit by hand. Originals are installed byte-for-byte under JURNL/GLOBAL_EIGHT_OVERLAYS/ASSETS (source of record,
 * never bundled). The handoff quantized every PNG to a palette (mode P) to fit one download, so the installed bytes and
 * sha256 differ from the manifest's RGBA `bytes`; dimensions and visible-alpha bounds match the manifest exactly.
 * Runtime shells are uniform 1296×2304 WebP derivatives of the installed PNGs (exact 9:16, one scale factor, nothing
 * cropped or stretched). Foreground extracts (FG01–FG09) are already drawn inside their shells and are not mounted; SK04
 * is a candidate environment and is not mounted.
 */
import ov01 from './OV01_SHELL.webp';
import ov02 from './OV02_SHELL.webp';
import ov03 from './OV03_SHELL.webp';
import ov04 from './OV04_SHELL.webp';
import ov05 from './OV05_SHELL.webp';
import ov06 from './OV06_SHELL.webp';
import ov07 from './OV07_SHELL.webp';
import ov08 from './OV08_SHELL.webp';

export type OverlayAssetId = 'FG01' | 'FG02' | 'FG03' | 'FG04' | 'FG05' | 'FG06' | 'FG07' | 'FG08' | 'FG09' | 'OV01' | 'OV02' | 'OV03' | 'OV04' | 'OV05' | 'OV06' | 'OV07' | 'OV08' | 'SK04';
/** MOUNTED: drawn by a live overlay · INSTALLED_NOT_MOUNTED: installed with a ready runtime shell, `mountedIn` says why not yet */
export type OverlayAssetMount = 'MOUNTED' | 'INSTALLED_NOT_MOUNTED' | 'NOT_MOUNTED_PRESENT_IN_SHELL' | 'CANDIDATE_NOT_MOUNTED';
export type OverlayAsset = {
  id: OverlayAssetId;
  file: string;
  kind: string;
  width: number;
  height: number;
  /** inclusive pixel bounds where alpha > 16, on the installed PNG (equal to the manifest's) */
  alphaBounds: readonly [number, number, number, number];
  installedBytes: number;
  installedSha256: string;
  manifestBytes: number;
  historyId: string;
  model: string;
  mount: OverlayAssetMount;
  mountedIn: string | null;
  /** runtime derivative (shells only) */
  runtime: { src: string; width: number; height: number; sha256: string; bytes: number } | null;
};

export const OVERLAY_ASSETS: readonly OverlayAsset[] = [
  { id: 'FG01', file: 'FG01-AMPHORA.png', kind: 'FOREGROUND', width: 2048, height: 2048, alphaBounds: [438, 101, 1572, 1920], installedBytes: 1221484, installedSha256: '9fb6e9091773997d4fb0884ed6b98eb75b1920ca988bca5c1390b510198e4419', manifestBytes: 3271092, historyId: 'XrBJfF2cBUwEVtf3tbW5', model: 'gpt-image-2-5-sunburst', mount: 'NOT_MOUNTED_PRESENT_IN_SHELL', mountedIn: null, runtime: null },
  { id: 'FG02', file: 'FG02-ROMAN-PORTRAIT-COIN.png', kind: 'FOREGROUND', width: 2048, height: 2048, alphaBounds: [226, 212, 1821, 1803], installedBytes: 1878192, installedSha256: '99248fe9a2cdadcb36dbd95aa9d41f34cfcbe994bf6644f875ecbaad22d9082e', manifestBytes: 5293675, historyId: 'xafR6jujP33ce2vnHBS0', model: 'gpt-image-2-5-sunburst', mount: 'NOT_MOUNTED_PRESENT_IN_SHELL', mountedIn: null, runtime: null },
  { id: 'FG03', file: 'FG03-MONEY-BAG-LAUREL-MEDALLION.png', kind: 'FOREGROUND', width: 2048, height: 2048, alphaBounds: [65, 55, 1978, 1892], installedBytes: 2279565, installedSha256: '04948f6eb848b629e5382a8d20a86b339d466017eb27435749d20bd6973130c3', manifestBytes: 6127996, historyId: 'cbw3kdUdZzpen04Hx4KV', model: 'gpt-image-2-5-sunburst', mount: 'NOT_MOUNTED_PRESENT_IN_SHELL', mountedIn: null, runtime: null },
  { id: 'FG04', file: 'FG04-BRONZE-COIN-STACKS.png', kind: 'FOREGROUND', width: 2048, height: 2048, alphaBounds: [173, 517, 1881, 1624], installedBytes: 1003249, installedSha256: '1761fc418e9651354f44554224a39f88d3ab53e873ad003068d5e6860223fdfc', manifestBytes: 2666596, historyId: 'LWutXai0lUj9H5LgOg6f', model: 'gpt-image-2-5-sunburst', mount: 'NOT_MOUNTED_PRESENT_IN_SHELL', mountedIn: null, runtime: null },
  { id: 'FG05', file: 'FG05-OXBLOOD-DIRECTIONAL-WAX-SEAL.png', kind: 'FOREGROUND', width: 2048, height: 2048, alphaBounds: [265, 309, 1765, 1698], installedBytes: 1209724, installedSha256: 'bfcb9772ca6760bb5af06f9c6769e3b94b6918b893a6d3f355d10382ad74552a', manifestBytes: 2982697, historyId: 'K6G1CecROXnzRG6SnW1O', model: 'gpt-image-2-5-sunburst', mount: 'NOT_MOUNTED_PRESENT_IN_SHELL', mountedIn: null, runtime: null },
  { id: 'FG06', file: 'FG06-COPPER-PAPERCLIP.png', kind: 'FOREGROUND', width: 2048, height: 2048, alphaBounds: [525, 318, 1571, 1661], installedBytes: 436085, installedSha256: 'f9f255fd811bd916f03a8960ff15d7c4e9d56cd5bd3e2441e4835c61a9833ad3', manifestBytes: 1176066, historyId: 'MSeMHlZqTvYL2ZnSndqt', model: 'gpt-image-2-5-sunburst', mount: 'NOT_MOUNTED_PRESENT_IN_SHELL', mountedIn: null, runtime: null },
  { id: 'FG07', file: 'FG07-ARCHIVAL-LEDGER-STACK.png', kind: 'FOREGROUND', width: 2048, height: 2048, alphaBounds: [237, 350, 1828, 1762], installedBytes: 1637721, installedSha256: '5cc5968dc9bd72b70cc99d5714a6ec2cce21fdca7c5df18f51fcf572d304253f', manifestBytes: 4745095, historyId: 'blCpNEmDcN1FcBMuVs1K', model: 'gpt-image-2-5-sunburst', mount: 'NOT_MOUNTED_PRESENT_IN_SHELL', mountedIn: null, runtime: null },
  { id: 'FG08', file: 'FG08-CLASSICAL-HEAD-LAUREL-MEDALLION.png', kind: 'FOREGROUND', width: 2048, height: 2048, alphaBounds: [89, 152, 1958, 1864], installedBytes: 1976302, installedSha256: '9bd8f0043dc62439d4aeab8a2ac0dfa09a39597425c51a094bbcbc0fee73d633', manifestBytes: 5545763, historyId: 'AHgSCjymql73Po6KtNA2', model: 'gpt-image-2-5-sunburst', mount: 'NOT_MOUNTED_PRESENT_IN_SHELL', mountedIn: null, runtime: null },
  { id: 'FG09', file: 'FG09-CAUTION-LAUREL-MEDALLION.png', kind: 'FOREGROUND', width: 2048, height: 2048, alphaBounds: [101, 160, 1931, 1872], installedBytes: 1886790, installedSha256: '154a8059e1ad657a42138c9b460a87218848849061021721eeed6c1a2d475222', manifestBytes: 5255246, historyId: '29hdFnlGQlYJfdxflNDM', model: 'gpt-image-2-5-sunburst', mount: 'NOT_MOUNTED_PRESENT_IN_SHELL', mountedIn: null, runtime: null },
  { id: 'OV01', file: 'OV01-IS-MONEY-ACTION-SHEET.png', kind: 'INNER_SHELL', width: 2016, height: 3584, alphaBounds: [0, 0, 2015, 3577], installedBytes: 3887560, installedSha256: '9bec9816ffb9b2478f143f04c0aab5b1def624489a2ec77b973839c51bb7a3f4', manifestBytes: 12487909, historyId: 'HCqEEv9XKNKAd13vlVuk', model: 'gpt-image-2-5-sunburst', mount: 'MOUNTED', mountedIn: "MoneyActionSheet (Shell.tsx, composition action)", runtime: { src: ov01, width: 1296, height: 2304, sha256: 'ab34df90dedc95793cd94cd2217a2a7d8fbfc2c0f66f0ed6e43b5bf9363b9e95', bytes: 625950 } },
  { id: 'OV02', file: 'OV02-IS-ADD-A-POCKET-FOLIO.png', kind: 'INNER_SHELL', width: 2016, height: 3584, alphaBounds: [0, 0, 2015, 3583], installedBytes: 3845997, installedSha256: '831d26690b1cb5d94ac5b2b6c3ed14969158fb79a2d10d74f0438f06392a44e5', manifestBytes: 11486821, historyId: 'bHqxXgFiWmLGe6JGhTfF', model: 'gpt-image-2-5-sunburst', mount: 'MOUNTED', mountedIn: "AddPlaceSheet (Shell.tsx, composition register)", runtime: { src: ov02, width: 1296, height: 2304, sha256: '953457ea2a14caa60645c3c84b61b8bd66527c426c8591974a527988963807b7', bytes: 472450 } },
  { id: 'OV03', file: 'OV03-IS-MOVE-MONEY-FOLIO.png', kind: 'INNER_SHELL', width: 2016, height: 3584, alphaBounds: [0, 0, 2015, 3583], installedBytes: 3685690, installedSha256: '13a17100055e1e6883792b503db654fa879f8302d8cab93b8a180bec0cbaf03f', manifestBytes: 11590784, historyId: 'dOIl5QrHPyejsEI0XbV1', model: 'gpt-image-2-5-sunburst', mount: 'MOUNTED', mountedIn: "TransferSheet (Shell.tsx, composition transfer)", runtime: { src: ov03, width: 1296, height: 2304, sha256: '693d7343ef3322e0abf3d5c4178c59999210462e4e8d944aa0175d5cd6fc5f74', bytes: 531356 } },
  { id: 'OV04', file: 'OV04-IS-MANAGE-POCKET-POPOVER.png', kind: 'INNER_SHELL', width: 2016, height: 3584, alphaBounds: [37, 871, 1941, 2587], installedBytes: 1831668, installedSha256: 'c814ce67b02a3cd1d3de194081ac1c1082fe28b6578963c81d9be8b27f89179d', manifestBytes: 4862475, historyId: 'jYe03OpxiQMRc2Zlzg9Z', model: 'gpt-image-2-5-sunburst', mount: 'MOUNTED', mountedIn: "DOT 01 pocket manager menu (full-frame at 90 % width over a blur of the live page)", runtime: { src: ov04, width: 1296, height: 2304, sha256: '517bd214a34aaff6bf6ec0cdfc31f3ccab0de3bd59338dcd67a8571b775d9d4b', bytes: 223036 } },
  { id: 'OV05', file: 'OV05-IS-SEARCH-FOLIO.png', kind: 'INNER_SHELL', width: 2016, height: 3584, alphaBounds: [0, 0, 1995, 3583], installedBytes: 3636148, installedSha256: '8bd5041160eb76c5338b23b13f6fe662a3be5a63854700b09bfeba904b3f2dff', manifestBytes: 11611778, historyId: 'd02Sw3Z0iAw6mWhUQfJ0', model: 'gpt-image-2-5-sunburst', mount: 'MOUNTED', mountedIn: "GlobalSearchDrawer (Shell.tsx, composition search)", runtime: { src: ov05, width: 1296, height: 2304, sha256: 'ab78957400b5e93d7f076fb166222d23c4cf9a600aa72550f2b6263e3b2ed368', bytes: 525100 } },
  { id: 'OV06', file: 'OV06-IS-ACCOUNT-SETTINGS-DRAWER.png', kind: 'INNER_SHELL', width: 2016, height: 3584, alphaBounds: [0, 0, 2015, 3583], installedBytes: 3811127, installedSha256: '93aca6bfcbe65fd14910e04dc1da55f7e00355e53b7778f031f8276746c532c5', manifestBytes: 11252400, historyId: 'rFIcyqylgky4YFHDQybE', model: 'gpt-image-2-5-sunburst', mount: 'INSTALLED_NOT_MOUNTED', mountedIn: "Not mounted: the approved F09 AccountDrawer stays controlling; OV06 waits for a founder decision (FD-12).", runtime: { src: ov06, width: 1296, height: 2304, sha256: 'e3b4f7ce9b9bca70f3211822a06fb6843326824392f10be35d1d0ada6a8ed84f', bytes: 517194 } },
  { id: 'OV07', file: 'OV07-IS-ARCHIVE-BLOCKED-CAUTION.png', kind: 'INNER_SHELL', width: 2016, height: 3584, alphaBounds: [0, 0, 2015, 3583], installedBytes: 3568363, installedSha256: '162dfc763704e30023b346eca93b231c00508e40b660441046c99bbd2dc63ad4', manifestBytes: 11732103, historyId: 'rLEPKDpEhazPakzrosnY', model: 'gpt-image-2-5-sunburst', mount: 'MOUNTED', mountedIn: "DOT 01 archive / delete blocked caution (Shell.tsx)", runtime: { src: ov07, width: 1296, height: 2304, sha256: 'c0992a521da767b8a449fa067bec372318072858301235aeb18774afb52c0c51', bytes: 583748 } },
  { id: 'OV08', file: 'OV08-IS-GLOBAL-MENU-DRAWER.png', kind: 'INNER_SHELL', width: 2016, height: 3584, alphaBounds: [0, 0, 2015, 3583], installedBytes: 4098162, installedSha256: 'ad1e5e2a7c477c7aff6cb94aa41b5ad5bc4b1817dc8bd491a2c2683ff014b841', manifestBytes: 11885148, historyId: '35Tf54UFja4FjgVwZf2I', model: 'gpt-image-2-5-sunburst', mount: 'MOUNTED', mountedIn: "GlobalMenu (sectioned, olive scrollport)", runtime: { src: ov08, width: 1296, height: 2304, sha256: '63ec87e16a3171ae67eb04c8f40e396af2f7bb71dab6472a8bb523aecb4c279d', bytes: 522586 } },
  { id: 'SK04', file: 'SK04-INTELLIGENCE-STUDY.png', kind: 'ENVIRONMENT', width: 2016, height: 3584, alphaBounds: [0, 0, 2015, 3583], installedBytes: 3261446, installedSha256: '03d75373e08621b9cf5b142a4ab38960bd202b36ba7a7ce12b6a0727559d07e2', manifestBytes: 10887215, historyId: 'Zb6X4Nwon66Okwu1v7BJ', model: 'gpt-image-2-5-sunburst', mount: 'CANDIDATE_NOT_MOUNTED', mountedIn: null, runtime: null },
];

export function overlayAsset(id: OverlayAssetId): OverlayAsset {
  const a = OVERLAY_ASSETS.find((x) => x.id === id);
  if (!a) throw new Error(`unknown overlay asset ${id}`);
  return a;
}

/** A mounted shell's runtime image (throws for an asset that has none, so a mount can never silently miss its art). */
export function overlayShell(id: OverlayAssetId): { src: string; width: number; height: number } {
  const r = overlayAsset(id).runtime;
  if (!r) throw new Error(`overlay asset ${id} has no runtime shell`);
  return r;
}
