#!/usr/bin/env node
/**
 * Scaffold / finalize Studio World resident geometry fabrication pack:
 * folders, identity copies, manifest merge, contact sheets, review ZIPs.
 *
 * Generation is driven via OpenArt MCP (see artifacts/.../GENERATION_AUDIT.json).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import sharp from 'sharp';

const ROOT = process.cwd();
const PACK = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION');
const MANIFEST_PATH = path.join(PACK, 'resident_fabrication_manifest.json');
const AUDIT_PATH = path.join(PACK, 'GENERATION_AUDIT.json');
const README_PATH = path.join(PACK, 'README.md');

const RESIDENTS = [
  { id: 'SW-001', folder: 'SW-001_ETTA_VALE', portrait: 'studio-world-etta-vale-portrait.jpg' },
  { id: 'SW-002', folder: 'SW-002_ZURI_XU', portrait: 'studio-world-zuri-xu-portrait.jpg' },
  { id: 'SW-003', folder: 'SW-003_JULES_MERCER', portrait: 'studio-world-jules-mercer-portrait.jpg' },
  { id: 'SW-004', folder: 'SW-004_NOA_KLINE', portrait: 'studio-world-noa-kline-portrait.jpg' },
  { id: 'SW-005', folder: 'SW-005_CASPIAN_REED', portrait: 'studio-world-caspian-reed-portrait.jpg' },
  { id: 'SW-006', folder: 'SW-006_IONA_WELLS', portrait: 'studio-world-iona-wells-portrait.jpg' },
  { id: 'SW-007', folder: 'SW-007_MARLOWE_SAINT', portrait: 'studio-world-marlowe-saint-portrait.jpg' },
  { id: 'SW-008', folder: 'SW-008_ELIO_VAHN', portrait: 'studio-world-elio-vahn-portrait.jpg' },
];

const FRAME_SUFFIXES = [
  ['02_FACE_GEOMETRY', '01_FRONT_PORTRAIT'],
  ['02_FACE_GEOMETRY', '02_LEFT_3Q_PORTRAIT'],
  ['02_FACE_GEOMETRY', '03_RIGHT_3Q_PORTRAIT'],
  ['02_FACE_GEOMETRY', '04_LEFT_PROFILE'],
  ['02_FACE_GEOMETRY', '05_RIGHT_PROFILE'],
  ['02_FACE_GEOMETRY', '06_REAR_HEAD'],
  ['03_BODY_GEOMETRY', '07_FULL_FRONT'],
  ['03_BODY_GEOMETRY', '08_FULL_LEFT_3Q'],
  ['03_BODY_GEOMETRY', '09_FULL_RIGHT_3Q'],
  ['03_BODY_GEOMETRY', '10_FULL_LEFT_PROFILE'],
  ['03_BODY_GEOMETRY', '11_FULL_RIGHT_PROFILE'],
  ['03_BODY_GEOMETRY', '12_FULL_BACK'],
  ['04_NATURAL_POSE', '13_SEATED'],
  ['04_NATURAL_POSE', '14_CONVERSATIONAL'],
  ['04_NATURAL_POSE', '15_WALK'],
  ['04_NATURAL_POSE', '16_DOCUMENTARY'],
];

function frameBasename(residentId, suffix) {
  return `${residentId}_${suffix}`;
}

function scaffold() {
  fs.mkdirSync(PACK, { recursive: true });
  const portraitDir = path.join(ROOT, 'public/site00/production-authority-assets/shared/residents');
  for (const r of RESIDENTS) {
    const base = path.join(PACK, r.folder);
    for (const sub of ['01_IDENTITY_SOURCE', '02_FACE_GEOMETRY', '03_BODY_GEOMETRY', '04_NATURAL_POSE', '05_METADATA']) {
      fs.mkdirSync(path.join(base, sub), { recursive: true });
    }
    const src = path.join(portraitDir, r.portrait);
    const dest = path.join(base, '01_IDENTITY_SOURCE', `${r.id}_IDENTITY_SOURCE.jpg`);
    if (fs.existsSync(src)) fs.copyFileSync(src, dest);
  }
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.log('Manifest not found — run tests or ts import to generate resident_fabrication_manifest.json');
  }
}

async function contactSheetForResident(r) {
  const tiles = [];
  const labels = [];
  for (let i = 0; i < FRAME_SUFFIXES.length; i++) {
    const [folder, suffix] = FRAME_SUFFIXES[i];
    const file = path.join(PACK, r.folder, folder, frameBasename(r.id, suffix) + '.png');
    if (!fs.existsSync(file)) continue;
    tiles.push(file);
    labels.push(`${String(i + 1).padStart(2, '0')} ${suffix.replace(/_/g, ' ')}`);
  }
  const identity = path.join(PACK, r.folder, '01_IDENTITY_SOURCE', `${r.id}_IDENTITY_SOURCE.jpg`);
  if (fs.existsSync(identity)) {
    tiles.unshift(identity);
    labels.unshift('SRC IDENTITY');
  }
  if (!tiles.length) return null;
  const thumbW = 320;
  const thumbH = 400;
  const cols = 4;
  const rows = Math.ceil(tiles.length / cols);
  const pad = 8;
  const labelH = 28;
  const sheetW = cols * (thumbW + pad) + pad;
  const sheetH = rows * (thumbH + labelH + pad) + pad + 40;
  const composites = [];
  let idx = 0;
  for (const tile of tiles) {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const buf = await sharp(tile).resize(thumbW, thumbH, { fit: 'cover' }).jpeg({ quality: 82 }).toBuffer();
    composites.push({ input: buf, left: pad + col * (thumbW + pad), top: 40 + pad + row * (thumbH + labelH + pad) });
    idx++;
  }
  const title = Buffer.from(
    `<svg width="${sheetW}" height="40"><text x="8" y="28" font-family="sans-serif" font-size="18" fill="#111">${r.id} ${r.folder.split('_').slice(1).join(' ')} — geometry review (IN_REVIEW)</text></svg>`,
  );
  const out = path.join(PACK, r.folder, '05_METADATA', `${r.id}_CONTACT_SHEET.jpg`);
  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#f4f4f4' } })
    .composite([{ input: title, top: 0, left: 0 }, ...composites])
    .jpeg({ quality: 88 })
    .toFile(out);
  return out;
}

async function masterOverview() {
  const picks = ['01_FRONT_PORTRAIT', '02_LEFT_3Q_PORTRAIT', '03_RIGHT_3Q_PORTRAIT', '07_FULL_FRONT', '12_FULL_BACK'];
  const tileW = 200;
  const tileH = 260;
  const cols = picks.length + 1;
  const rows = RESIDENTS.length;
  const pad = 6;
  const sheetW = cols * (tileW + pad) + pad + 120;
  const sheetH = rows * (tileH + pad) + pad + 36;
  const composites = [];
  for (let ri = 0; ri < RESIDENTS.length; ri++) {
    const r = RESIDENTS[ri];
    const y = 36 + pad + ri * (tileH + pad);
    const label = Buffer.from(
      `<svg width="110" height="${tileH}"><text x="4" y="24" font-family="sans-serif" font-size="13" fill="#111">${r.id}</text></svg>`,
    );
    composites.push({ input: label, left: pad, top: y });
    const identity = path.join(PACK, r.folder, '01_IDENTITY_SOURCE', `${r.id}_IDENTITY_SOURCE.jpg`);
    if (fs.existsSync(identity)) {
      const buf = await sharp(identity).resize(tileW, tileH, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();
      composites.push({ input: buf, left: 120 + pad, top: y });
    }
    for (let pi = 0; pi < picks.length; pi++) {
      const suffix = picks[pi];
      const folder = suffix.startsWith('0') && Number(suffix.slice(0, 2)) <= 6 ? '02_FACE_GEOMETRY' : '03_BODY_GEOMETRY';
      const file = path.join(PACK, r.folder, folder, frameBasename(r.id, suffix) + '.png');
      if (!fs.existsSync(file)) continue;
      const buf = await sharp(file).resize(tileW, tileH, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();
      composites.push({ input: buf, left: 120 + pad + (pi + 1) * (tileW + pad), top: y });
    }
  }
  const out = path.join(PACK, 'MASTER_RESIDENT_GEOMETRY_OVERVIEW.jpg');
  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#ececec' } })
    .composite(composites)
    .jpeg({ quality: 85 })
    .toFile(out);
  return out;
}

function zipPack(lite) {
  const name = lite
    ? 'STUDIO_WORLD_RESIDENT_FABRICATION_GEOMETRY_REVIEW_LITE.zip'
    : 'STUDIO_WORLD_RESIDENT_FABRICATION_GEOMETRY_REVIEW.zip';
  const dest = path.join(ROOT, 'artifacts', name);
  if (lite) {
    const liteDir = path.join(PACK, '_lite_export');
    fs.rmSync(liteDir, { recursive: true, force: true });
    fs.mkdirSync(liteDir, { recursive: true });
    for (const r of RESIDENTS) {
      const d = path.join(liteDir, r.folder);
      fs.mkdirSync(d, { recursive: true });
      for (const sub of ['01_IDENTITY_SOURCE', '05_METADATA']) {
        const srcSub = path.join(PACK, r.folder, sub);
        if (fs.existsSync(srcSub)) {
          fs.cpSync(srcSub, path.join(d, sub), { recursive: true });
        }
      }
      for (const [folder, suffix] of FRAME_SUFFIXES) {
        const src = path.join(PACK, r.folder, folder, frameBasename(r.id, suffix) + '.png');
        if (!fs.existsSync(src)) continue;
        const outDir = path.join(d, folder);
        fs.mkdirSync(outDir, { recursive: true });
        execSync(
          `ffmpeg -y -i "${src}" -vf "scale=768:-1" -q:v 4 "${path.join(outDir, frameBasename(r.id, suffix) + '.jpg')}"`,
          { stdio: 'ignore' },
        );
      }
    }
    fs.copyFileSync(MANIFEST_PATH, path.join(liteDir, 'resident_fabrication_manifest.json'));
    if (fs.existsSync(AUDIT_PATH)) fs.copyFileSync(AUDIT_PATH, path.join(liteDir, 'GENERATION_AUDIT.json'));
    fs.copyFileSync(README_PATH, path.join(liteDir, 'README.md'));
    execSync(`cd "${liteDir}" && zip -qr "${dest}" .`, { stdio: 'inherit' });
  } else {
    execSync(`cd "${path.dirname(PACK)}" && zip -qr "${dest}" STUDIO_WORLD_RESIDENT_FABRICATION`, { stdio: 'inherit' });
  }
  return dest;
}

async function main() {
  const cmd = process.argv[2] ?? 'scaffold';
  if (cmd === 'scaffold') {
    scaffold();
    console.log('Scaffolded', PACK);
    return;
  }
  if (cmd === 'finalize') {
    for (const r of RESIDENTS) {
      const sheet = await contactSheetForResident(r);
      if (sheet) console.log('Contact sheet', sheet);
    }
    const master = await masterOverview();
    console.log('Master overview', master);
    const full = zipPack(false);
    const lite = zipPack(true);
    console.log('ZIP full', full);
    console.log('ZIP lite', lite);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
