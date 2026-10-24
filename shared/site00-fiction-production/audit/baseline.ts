import { EXCHANGE_PATHS } from '../paths.js';
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
