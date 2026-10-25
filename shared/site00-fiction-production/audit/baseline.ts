import crypto from 'node:crypto';
import fs from 'node:fs';
import { EXCHANGE_PATHS, repoPath } from '../paths.js';
import { withoutLivingWorldAmendments } from '../promotion/amendments.js';
import { scenePath, SCENE_FILES } from '../scenes/index.js';

const S101 = (f: keyof typeof SCENE_FILES) => scenePath('S1-01', SCENE_FILES[f]);
const FOUNTAIN = (name: string) => `${EXCHANGE_PATHS.screenplays}/${name}.fountain`;

/** sha256 of every file the audit must leave untouched, read at AUDIT_BASELINE_COMMIT. */
export const PROTECTED_BASELINE: Array<{ path: string; sha256: string }> = [
  { path: EXCHANGE_PATHS.master, sha256: '9a9039bef2384d9a7fa6633ccf789b90fa026c9b3aebf9ec3580cb9e78fd52ef' },
  { path: S101('packet'), sha256: 'a5ebb48547bdaf440a5372b97310c0334b30ac2160e5d79faffa38883802cf4b' },
  { path: S101('cueSheet'), sha256: '0e5962de8f65f292f0fdc51eae938f4ab34c9c03bffb9a9fe8d137bc29acccec' },
  { path: S101('keyframes'), sha256: 'c42c79b99b9527cbbca8a435039aeec1f0dd874a6dadca06e67782a147d0d8b2' },
  { path: S101('multitrack'), sha256: 'bf57b52ea7918a4f9f5e006b6229fb497122c0262485ea5490accffe62d1945c' },
  { path: S101('budget'), sha256: '917d75364b7cf2824745effffb0cb72fba79b41beebebe6d93fed8a9ce30d1e9' },
  { path: S101('review'), sha256: 'dfecd85bb9e162c627a9bb5b0d3b2b37d319685a44b0ba6d39454d17edd2fe9f' },
  { path: S101('shotListCsv'), sha256: '9d59cef480988fff31aa0e8891f644fc8505130e8ea1c465117555fbae0652af' },
  { path: S101('shotList'), sha256: 'cf18080f3b9ed19cb0acf8f8a1b4619b3c92ae89c95ca9a3e56ba81c3023f29e' },
  { path: S101('timeline'), sha256: '8b6d95d096df32cee8bc7086b892310a88fdbfdaac04719dd1c891f73091db73' },
  { path: FOUNTAIN('S1-01_DUSK'), sha256: 'bf14febace441fde29823294ac5329656b7e31c8b933553573f88bdef443537e' },
  { path: FOUNTAIN('S1-02_GETTING_READY'), sha256: 'b7f982d2a0d181ac3e0bafc82ce94e087d71a8ebdcb67d2503bf0a7430488147' },
  { path: FOUNTAIN('S1-03_THE_DOOR'), sha256: '8431d71dfb32ab7fcc98b3657245a38bca4282851034a7fcafb1692cea38e8c6' },
  { path: FOUNTAIN('S1-04_THE_HOST'), sha256: '73e943b347173e797f27cb2eaa33837a0f9d275476ba66c5ec67fe90cd23dad7' },
  { path: FOUNTAIN('S1-05_UNUSUAL_REQUEST'), sha256: '0db6d6b21b6d3edb1a9331e687d29abb7a8e9d6f168e93855d43c261e951c743' },
];

/**
 * sha256 of the S1-01 packet files that the founder-authorized patch moved (PATCH-S101-01 to -07, 2026-10-25). The audit
 * hashes above stay as the record of what the audit read; a file may match either, and nothing else.
 */
export const FOUNDER_S101_PATCH_BASELINE: Record<string, string> = {
  [S101('packet')]: '4509b8aa667252abf3b72bbfa695d605f4ac1f67a4f27efb3f6f7813ae5c5e95',
  [S101('keyframes')]: 'a63d928ff38097554f73e4099424cb76d440f74ef5ea662872fe4f26a2994472',
  [S101('shotListCsv')]: '9942a4d270a37c42f30d0d0752fc8f2ed465f37b85f4326a259addc4c702db49',
  [S101('shotList')]: 'db61d903d669d60ef77dacb15bd1127f33368e7551c406ce5885246c70215935',
  [S101('timeline')]: 'ab26861564ac7c286787f7ac784603c56132bc55b4c9722d8bdbe307765f7e0a',
};

export type BaselineState = 'UNCHANGED' | 'UNCHANGED_EXCEPT_FOUNDER_PROMOTION' | 'FOUNDER_S101_PATCH' | 'CHANGED';

/**
 * A protected file compared with its baseline. The master may since have gained the founder-promoted living-world
 * amendments (2026-10-25); with those removed it must still be byte-identical. An S1-01 packet file may instead match
 * its founder-authorized patched hash. Any other difference is CHANGED.
 */
export function baselineState(f: { path: string; sha256: string }, root = process.cwd()): BaselineState {
  const body = fs.readFileSync(repoPath(f.path, root));
  const hash = (b: string | Buffer) => crypto.createHash('sha256').update(b).digest('hex');
  if (hash(body) === f.sha256) return 'UNCHANGED';
  if (FOUNDER_S101_PATCH_BASELINE[f.path] === hash(body)) return 'FOUNDER_S101_PATCH';
  if (f.path !== EXCHANGE_PATHS.master) return 'CHANGED';
  const view = `${JSON.stringify(withoutLivingWorldAmendments(JSON.parse(body.toString('utf8'))), null, 2)}\n`;
  return hash(view) === f.sha256 ? 'UNCHANGED_EXCEPT_FOUNDER_PROMOTION' : 'CHANGED';
}
