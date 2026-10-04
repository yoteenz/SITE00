#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'artifacts/studio-world-resident-authority-recovery4');
const FAB_MANIFEST = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION/resident_fabrication_manifest.json');

const RESIDENTS = [
  { sw: 'SW-001', casting: 'SW-RESIDENT-001_ETTA_VALE.jpg', oldPortrait: 'studio-world-etta-vale-portrait.jpg' },
  { sw: 'SW-002', casting: 'SW-RESIDENT-002_ZURI_XU.jpg', oldPortrait: 'studio-world-zuri-xu-portrait.jpg' },
  { sw: 'SW-003', casting: 'SW-RESIDENT-003_JULES_MERCER.jpg', oldPortrait: 'studio-world-jules-mercer-portrait.jpg' },
  { sw: 'SW-004', casting: 'SW-RESIDENT-004_NOA_KLINE.jpg', oldPortrait: 'studio-world-noa-kline-portrait.jpg' },
  { sw: 'SW-005', casting: 'SW-RESIDENT-005_CASPIAN_REED.jpg', oldPortrait: 'studio-world-caspian-reed-portrait.jpg' },
  { sw: 'SW-006', casting: 'SW-RESIDENT-006_IONA_WELLS.jpg', oldPortrait: 'studio-world-iona-wells-portrait.jpg' },
  { sw: 'SW-007', casting: 'SW-RESIDENT-007_MARLOWE_SAINT.jpg', oldPortrait: 'studio-world-marlowe-saint-portrait.jpg' },
  { sw: 'SW-008', casting: 'SW-RESIDENT-008_ELIO_EV_VAHN.jpg', oldPortrait: 'studio-world-elio-vahn-portrait.jpg' },
];

const SEASON1_FULL = {
  'SW-001': 'SW-RESIDENT-001__etta-vale/01-natural-authority/etta-vale__natural-full-body__sophisticated-fashionista.jpg',
  'SW-002': 'SW-RESIDENT-002__zuri-xu/01-natural-authority/zuri-xu__natural-full-body__architectural-fashion-strategist.jpg',
  'SW-003': 'SW-RESIDENT-003__jules-mercer/01-natural-authority/jules-mercer__natural-full-body__relaxed-romantic.jpg',
  'SW-004': 'SW-RESIDENT-004__noa-kline/01-natural-authority/noa-kline__natural-full-body__understated-systems-dad.jpg',
  'SW-005': 'SW-RESIDENT-005__caspian-reed/01-natural-authority/caspian-reed__natural-full-body__decadent-bohemian-aristocrat.jpg',
  'SW-006': 'SW-RESIDENT-006__iona-wells/01-natural-authority/iona-wells__natural-full-body__precision-utilitarian.jpg',
  'SW-007': 'SW-RESIDENT-007__marlowe-saint/01-natural-authority/marlowe-saint__natural-full-body__off-duty-cultural-icon.jpg',
  'SW-008': 'SW-RESIDENT-008__elio-vahn/01-natural-authority/elio-vahn__natural-full-body__private-club-strategist.jpg',
};

function p(...parts) {
  return path.join(ROOT, ...parts);
}

async function lineageSheet(r) {
  const oldP = p('public/site00/production-authority-assets/shared/residents', r.oldPortrait);
  const newP = p('public/site00/studio-world-residents/casting-thumbnails-v1', r.casting);
  const fullP = p('public/site00/studio-world-residents/season1-v1', SEASON1_FULL[r.sw]);
  const w = 360;
  const h = 440;
  const pad = 8;
  const cols = 3;
  const sheetW = cols * (w + pad) + pad;
  const sheetH = h + pad * 2 + 48;
  const labels = ['OLD (forensics portrait)', 'RECOVERED work look (white tee / red collar)', 'RECOVERED full-body (season1-v1)'];
  const tiles = [oldP, newP, fullP];
  const composites = [];
  for (let i = 0; i < tiles.length; i++) {
    if (!fs.existsSync(tiles[i])) continue;
    const buf = await sharp(tiles[i]).resize(w, h, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer();
    composites.push({ input: buf, left: pad + i * (w + pad), top: 48 + pad });
  }
  const title = Buffer.from(
    `<svg width="${sheetW}" height="48"><text x="8" y="30" font-family="sans-serif" font-size="16" fill="#111">${r.sw} authority lineage</text></svg>`,
  );
  const out = path.join(OUT, 'lineage', `${r.sw}_AUTHORITY_LINEAGE.jpg`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#eee' } })
    .composite([{ input: title, top: 0, left: 0 }, ...composites])
    .jpeg({ quality: 88 })
    .toFile(out);
  return out;
}

async function masterOverview() {
  const w = 200;
  const h = 260;
  const pad = 6;
  const cols = 3;
  const rows = RESIDENTS.length;
  const sheetW = cols * (w + pad) + pad + 100;
  const sheetH = rows * (h + pad) + pad + 40;
  const composites = [];
  for (let ri = 0; ri < RESIDENTS.length; ri++) {
    const r = RESIDENTS[ri];
    const y = 40 + pad + ri * (h + pad);
    const label = Buffer.from(
      `<svg width="90" height="${h}"><text x="4" y="20" font-family="sans-serif" font-size="12">${r.sw}</text></svg>`,
    );
    composites.push({ input: label, left: pad, top: y });
    const paths = [
      p('public/site00/production-authority-assets/shared/residents', r.oldPortrait),
      p('public/site00/studio-world-residents/casting-thumbnails-v1', r.casting),
      p('public/site00/studio-world-residents/season1-v1', SEASON1_FULL[r.sw]),
    ];
    for (let ci = 0; ci < paths.length; ci++) {
      if (!fs.existsSync(paths[ci])) continue;
      const buf = await sharp(paths[ci]).resize(w, h, { fit: 'cover' }).jpeg({ quality: 82 }).toBuffer();
      composites.push({ input: buf, left: 100 + pad + ci * (w + pad), top: y });
    }
  }
  const out = path.join(OUT, '01_RESIDENT_AUTHORITY_RECOVERY_OVERVIEW.jpg');
  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#ececec' } })
    .composite(composites)
    .jpeg({ quality: 85 })
    .toFile(out);
  return out;
}

function patchFabricationManifest() {
  if (!fs.existsSync(FAB_MANIFEST)) return;
  const m = JSON.parse(fs.readFileSync(FAB_MANIFEST, 'utf8'));
  m.batch_status = 'SOURCE_AUTHORITY_RECOVERED_HALT_GENERATION';
  m.fabrication_source_authority = {
    white_tee_red_collar_root: 'public/site00/studio-world-residents/casting-thumbnails-v1/',
    full_body_root: 'public/site00/studio-world-residents/season1-v1/*/01-natural-authority/',
    source_commit_casting: '4cdac10c6885de7482d82c4b39ee601eb3f604c8',
    source_pr_casting: 1303,
    source_commit_season1: 'a59131ef',
    source_pr_season1: 1302,
    bundle_branch: 'origin/cursor/production-hub-descendants-opus1',
    superseded: 'public/site00/production-authority-assets/shared/residents/*-portrait.jpg',
  };
  let wrong = 0;
  for (const f of m.frames) {
    if (f.openart_output_url) {
      f.approval_status = 'SUPERSEDED_OUTPUT_WRONG_SOURCE';
      f.invalid_for_canonical_review = true;
      f.wrong_source_authority = true;
      wrong++;
    } else {
      f.approval_status = 'NOT_GENERATED';
      f.generation_halted_reason = 'SOURCE_AUTHORITY_RECOVERY4';
    }
    f.fabrication_identity_source_pending = `casting-thumbnails-v1 + season1-v1 (see recovery4 manifest)`;
  }
  m.generated_frames_invalidated = wrong;
  m.openart_generation_halted = true;
  fs.writeFileSync(FAB_MANIFEST, `${JSON.stringify(m, null, 2)}\n`);
  const statePath = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION/_autogen_state.json');
  if (fs.existsSync(statePath)) {
    const s = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    s.halted = true;
    s.haltReason = 'RECOVERY4_WHITE_TEE_RED_COLLAR';
    fs.writeFileSync(statePath, `${JSON.stringify(s, null, 2)}\n`);
  }
}

function zipPack(lite) {
  const name = lite
    ? 'STUDIO_WORLD_RESIDENT_AUTHORITY_RECOVERY4_REVIEW_LITE.zip'
    : 'STUDIO_WORLD_RESIDENT_AUTHORITY_RECOVERY4_REVIEW.zip';
  const dest = path.join(ROOT, 'artifacts', name);
  if (lite) {
    const liteDir = path.join(ROOT, 'artifacts/_recovery4_lite_staging');
    fs.rmSync(liteDir, { recursive: true, force: true });
    fs.mkdirSync(liteDir, { recursive: true });
    fs.cpSync(OUT, path.join(liteDir, 'studio-world-resident-authority-recovery4'), {
      recursive: true,
      filter: (src) => !src.endsWith('.png'),
    });
    const pubLite = path.join(liteDir, 'recovered_sources');
    fs.mkdirSync(pubLite, { recursive: true });
    fs.cpSync(p('public/site00/studio-world-residents/casting-thumbnails-v1'), path.join(pubLite, 'casting-thumbnails-v1'), {
      recursive: true,
    });
    execSync(`cd "${liteDir}" && zip -qr "${dest}" .`, { stdio: 'inherit' });
    fs.rmSync(liteDir, { recursive: true, force: true });
  } else {
    execSync(
      `cd "${path.dirname(OUT)}" && zip -qr "${dest}" studio-world-resident-authority-recovery4 && cd "${ROOT}" && zip -qr "${dest}" public/site00/studio-world-residents/casting-thumbnails-v1 public/site00/studio-world-residents/season1-v1`,
      { stdio: 'inherit', shell: '/bin/bash' },
    );
  }
  return dest;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  patchFabricationManifest();
  for (const r of RESIDENTS) await lineageSheet(r);
  await masterOverview();
  fs.writeFileSync(
    path.join(OUT, 'RECOVERY_REPORT.md'),
    `# RECOVERY4 — White tee / red collar resident fabrication authority\n\nSee RECOVERY4_MANIFEST.json and supersession map.\n`,
  );
  fs.writeFileSync(
    path.join(OUT, 'RECOVERY4_MANIFEST.json'),
    JSON.stringify(
      {
        sprint: 'P0.STUDIOWORLD.RESIDENT-AUTHORITY.RECOVERY4-WHITE-TEE-RED-COLLAR',
        whiteTeeRedCollarFound: true,
        sourceRoot: 'public/site00/studio-world-residents/casting-thumbnails-v1/',
        sourceCommit: '4cdac10c6885de7482d82c4b39ee601eb3f604c8',
        sourcePr: 1303,
        season1Root: 'public/site00/studio-world-residents/season1-v1/',
        season1Commit: 'a59131ef (PR #1302)',
        bundleBranch: 'cursor/production-hub-descendants-opus1',
        imagesGeneratedThisSprint: 0,
        openartCreditsSpent: 0,
      },
      null,
      2,
    ),
  );
  zipPack(false);
  zipPack(true);
  console.log('Recovery4 pack complete', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
