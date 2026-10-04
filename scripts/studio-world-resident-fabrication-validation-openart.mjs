#!/usr/bin/env node
/**
 * Validation batch scaffold, record, contact sheets, ZIP — OpenArt gen via MCP + record CLI.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const PACK = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION');
const MANIFEST = path.join(PACK, 'validation_manifest.json');
const SOURCE_COMMIT = '4cdac10c6885de7482d82c4b39ee601eb3f604c8';
const SOURCE_PR = 1303;
const PROJECT = 'Q7IHYCEK3RPn2c1ConEG';

export const RESIDENTS = [
  {
    id: 'SW-001',
    name: 'ETTA VALE',
    folder: 'SW-001_ETTA_VALE',
    casting: 'public/site00/studio-world-residents/casting-thumbnails-v1/SW-RESIDENT-001_ETTA_VALE.jpg',
    fullBody:
      'public/site00/studio-world-residents/season1-v1/SW-RESIDENT-001__etta-vale/01-natural-authority/etta-vale__natural-full-body__sophisticated-fashionista.jpg',
  },
  {
    id: 'SW-002',
    name: 'ZURI XU',
    folder: 'SW-002_ZURI_XU',
    casting: 'public/site00/studio-world-residents/casting-thumbnails-v1/SW-RESIDENT-002_ZURI_XU.jpg',
    fullBody:
      'public/site00/studio-world-residents/season1-v1/SW-RESIDENT-002__zuri-xu/01-natural-authority/zuri-xu__natural-full-body__architectural-fashion-strategist.jpg',
  },
  {
    id: 'SW-003',
    name: 'JULES MERCER',
    folder: 'SW-003_JULES_MERCER',
    casting: 'public/site00/studio-world-residents/casting-thumbnails-v1/SW-RESIDENT-003_JULES_MERCER.jpg',
    fullBody:
      'public/site00/studio-world-residents/season1-v1/SW-RESIDENT-003__jules-mercer/01-natural-authority/jules-mercer__natural-full-body__relaxed-romantic.jpg',
  },
  {
    id: 'SW-004',
    name: 'NOA KLINE',
    folder: 'SW-004_NOA_KLINE',
    casting: 'public/site00/studio-world-residents/casting-thumbnails-v1/SW-RESIDENT-004_NOA_KLINE.jpg',
    fullBody:
      'public/site00/studio-world-residents/season1-v1/SW-RESIDENT-004__noa-kline/01-natural-authority/noa-kline__natural-full-body__understated-systems-dad.jpg',
  },
  {
    id: 'SW-005',
    name: 'CASPIAN REED',
    folder: 'SW-005_CASPIAN_REED',
    casting: 'public/site00/studio-world-residents/casting-thumbnails-v1/SW-RESIDENT-005_CASPIAN_REED.jpg',
    fullBody:
      'public/site00/studio-world-residents/season1-v1/SW-RESIDENT-005__caspian-reed/01-natural-authority/caspian-reed__natural-full-body__decadent-bohemian-aristocrat.jpg',
  },
  {
    id: 'SW-006',
    name: 'IONA WELLS',
    folder: 'SW-006_IONA_WELLS',
    casting: 'public/site00/studio-world-residents/casting-thumbnails-v1/SW-RESIDENT-006_IONA_WELLS.jpg',
    fullBody:
      'public/site00/studio-world-residents/season1-v1/SW-RESIDENT-006__iona-wells/01-natural-authority/iona-wells__natural-full-body__precision-utilitarian.jpg',
  },
  {
    id: 'SW-007',
    name: 'MARLOWE SAINT',
    folder: 'SW-007_MARLOWE_SAINT',
    casting: 'public/site00/studio-world-residents/casting-thumbnails-v1/SW-RESIDENT-007_MARLOWE_SAINT.jpg',
    fullBody:
      'public/site00/studio-world-residents/season1-v1/SW-RESIDENT-007__marlowe-saint/01-natural-authority/marlowe-saint__natural-full-body__off-duty-cultural-icon.jpg',
  },
  {
    id: 'SW-008',
    name: 'ELIO VAHN',
    folder: 'SW-008_ELIO_VAHN',
    casting: 'public/site00/studio-world-residents/casting-thumbnails-v1/SW-RESIDENT-008_ELIO_EV_VAHN.jpg',
    fullBody:
      'public/site00/studio-world-residents/season1-v1/SW-RESIDENT-008__elio-vahn/01-natural-authority/elio-vahn__natural-full-body__private-club-strategist.jpg',
  },
];

const IDENTITY_LOCK = `REFERENCE IMAGE = STRICT IDENTITY AUTHORITY. SAME PERSON. DO NOT CHANGE face, face shape, age, skin tone, ethnicity, eye shape, nose, lips, jaw, hairline, hair texture, hair color, body type, or body proportions. Only change framing, camera distance, and pose as specified. WORK OUTFIT LOCK: plain white T-shirt with thin SITE 00 red collar trim/detail — NOT black suit, NOT cream/ivory suit, NOT blazer-only formal look. Fabrication validation reference, not fashion editorial.`;

function portraitPrompt(r) {
  return `${IDENTITY_LOCK}\n\nSubject: ${r.name} (${r.id}) Studio World resident.\n\nVALIDATION FRAME A — WORK PORTRAIT FRONT: straight-on chest-up portrait, eye-level, neutral lightly confident expression, soft studio lighting, white tee with red collar trim visible, clean neutral background.`;
}

function fullBodyPrompt(r) {
  return `${IDENTITY_LOCK}\n\nSubject: ${r.name} (${r.id}) Studio World resident.\n\nUse portrait reference for FACE, HAIR, and WHITE TEE / RED COLLAR work look. Use full-body reference for BODY PROPORTIONS and HEIGHT READ only — replace outdated outfit clothing with the same white tee + red collar work look from portrait authority.\n\nVALIDATION FRAME B — WORK FULL BODY FRONT: full body standing straight-on, feet visible, natural neutral stance, white tee red collar, soft studio background.`;
}

function scaffold() {
  fs.mkdirSync(PACK, { recursive: true });
  const entries = [];
  for (const r of RESIDENTS) {
    const dir = path.join(PACK, r.folder);
    fs.mkdirSync(dir, { recursive: true });
    for (const f of ['01_WORK_PORTRAIT_FRONT.png', '02_WORK_FULL_BODY_FRONT.png']) {
      const p = path.join(dir, f);
      if (!fs.existsSync(p)) fs.writeFileSync(p, '');
    }
    entries.push({
      resident_id: r.id,
      resident_name: r.name,
      frames: [
        {
          frame_type: 'WORK_PORTRAIT_FRONT',
          file: '01_WORK_PORTRAIT_FRONT.png',
          portrait_source_path: r.casting,
          full_body_source_path: r.fullBody,
          source_authority_commit: SOURCE_COMMIT,
          source_authority_pr: SOURCE_PR,
          prompt: portraitPrompt(r),
          aspectRatio: '3:4',
          openart_generation_id: null,
          output_url: null,
          model: 'gpt-image-2-5-sunburst',
          resolution: '2k',
          identity_status: 'PENDING',
          work_look_status: 'PENDING',
          body_status: 'NA',
          hair_status: 'PENDING',
          anatomy_status: 'PENDING',
          retry_count: 0,
          approval_status: 'FABRICATION_VALIDATION_IN_REVIEW',
          classification: 'PENDING',
          notes: '',
        },
        {
          frame_type: 'WORK_FULL_BODY_FRONT',
          file: '02_WORK_FULL_BODY_FRONT.png',
          portrait_source_path: r.casting,
          full_body_source_path: r.fullBody,
          source_authority_commit: SOURCE_COMMIT,
          source_authority_pr: SOURCE_PR,
          prompt: fullBodyPrompt(r),
          aspectRatio: '9:16',
          openart_generation_id: null,
          output_url: null,
          model: 'gpt-image-2-5-sunburst',
          resolution: '2k',
          identity_status: 'PENDING',
          work_look_status: 'PENDING',
          body_status: 'PENDING',
          hair_status: 'PENDING',
          anatomy_status: 'PENDING',
          retry_count: 0,
          approval_status: 'FABRICATION_VALIDATION_IN_REVIEW',
          classification: 'PENDING',
          notes: '',
        },
      ],
    });
  }
  fs.writeFileSync(
    MANIFEST,
    JSON.stringify(
      {
        sprint: 'P0.STUDIOWORLD.RESIDENT-FABRICATION.AUTHORITY-VALIDATION.OPENART1',
        openart_project_id: PROJECT,
        recovery_verified: true,
        source_commit: SOURCE_COMMIT,
        source_pr: SOURCE_PR,
        credits_spent_estimate: 0,
        residents: entries,
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    path.join(PACK, 'README.md'),
    `# Resident fabrication authority validation (16 frames)\n\nOpenArt HIGH 2K validation only. Not canonical until founder review.\n`,
  );
}

function record(entry) {
  const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const res = m.residents.find((x) => x.resident_id === entry.resident_id);
  const frame = res.frames.find((f) => f.frame_type === entry.frame_type);
  Object.assign(frame, entry);
  if (entry.output_url) {
    const dest = path.join(PACK, res.resident_id.replace('SW-', 'SW-00').slice(0, 3) + '_' + res.resident_name.replace(/ /g, '_'));
    // fix folder lookup
  }
  const r = RESIDENTS.find((x) => x.id === entry.resident_id);
  const out = path.join(PACK, r.folder, frame.file);
  if (entry.output_url) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    execSync(`curl -fsSL "${entry.output_url}" -o "${out}"`, { stdio: 'inherit' });
  }
  m.credits_spent_estimate = (m.credits_spent_estimate || 0) + (entry.credits || 152);
  fs.writeFileSync(path.join(PACK, r.folder, 'validation.json'), JSON.stringify(res, null, 2));
  fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2));
  console.log('Recorded', entry.resident_id, entry.frame_type);
}

async function residentSheet(r, resEntry) {
  const w = 280;
  const h = 360;
  const pad = 8;
  const labels = ['SOURCE work look', 'SOURCE full body', 'GEN portrait', 'GEN full body'];
  const paths = [
    path.join(ROOT, r.casting),
    path.join(ROOT, r.fullBody),
    path.join(PACK, r.folder, '01_WORK_PORTRAIT_FRONT.png'),
    path.join(PACK, r.folder, '02_WORK_FULL_BODY_FRONT.png'),
  ];
  const composites = [];
  for (let i = 0; i < paths.length; i++) {
    if (!fs.existsSync(paths[i]) || fs.statSync(paths[i]).size < 100) continue;
    const buf = await sharp(paths[i]).resize(w, h, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer();
    composites.push({ input: buf, left: pad + (i % 2) * (w + pad), top: 48 + pad + Math.floor(i / 2) * (h + pad) });
  }
  const sheetW = 2 * (w + pad) + pad;
  const sheetH = 2 * (h + pad) + pad + 48;
  const title = Buffer.from(
    `<svg width="${sheetW}" height="48"><text x="8" y="28" font-family="sans-serif" font-size="15">${r.id} ${r.name} validation</text></svg>`,
  );
  const out = path.join(PACK, r.folder, `${r.id}_VALIDATION_SHEET.jpg`);
  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#f0f0f0' } })
    .composite([{ input: title, top: 0, left: 0 }, ...composites])
    .jpeg({ quality: 88 })
    .toFile(out);
}

async function finalize() {
  const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  for (const res of m.residents) {
    const r = RESIDENTS.find((x) => x.id === res.resident_id);
    await residentSheet(r, res);
  }
  // master overview — row per resident, 4 cols
  const tileW = 160;
  const tileH = 200;
  const cols = 4;
  const rows = RESIDENTS.length;
  const pad = 4;
  const sheetW = cols * (tileW + pad) + pad + 80;
  const sheetH = rows * (tileH + pad) + pad + 36;
  const composites = [];
  for (let ri = 0; ri < RESIDENTS.length; ri++) {
    const r = RESIDENTS[ri];
    const y = 36 + pad + ri * (tileH + pad);
    const paths = [
      path.join(ROOT, r.casting),
      path.join(PACK, r.folder, '01_WORK_PORTRAIT_FRONT.png'),
      path.join(PACK, r.folder, '02_WORK_FULL_BODY_FRONT.png'),
    ];
    for (let ci = 0; ci < paths.length; ci++) {
      if (!fs.existsSync(paths[ci]) || fs.statSync(paths[ci]).size < 100) continue;
      const buf = await sharp(paths[ci]).resize(tileW, tileH, { fit: 'cover' }).jpeg({ quality: 82 }).toBuffer();
      composites.push({ input: buf, left: 80 + pad + ci * (tileW + pad), top: y });
    }
  }
  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#eaeaea' } })
    .composite(composites)
    .jpeg({ quality: 85 })
    .toFile(path.join(PACK, '01_MASTER_VALIDATION_OVERVIEW.jpg'));

  const fullZip = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION_REVIEW.zip');
  execSync(`cd "${path.dirname(PACK)}" && zip -qr "${fullZip}" STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION`, { stdio: 'inherit' });
  const liteDir = path.join(ROOT, 'artifacts/_validation_lite_staging');
  fs.rmSync(liteDir, { recursive: true, force: true });
  fs.mkdirSync(liteDir, { recursive: true });
  fs.cpSync(PACK, path.join(liteDir, 'STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION'), { recursive: true });
  for (const r of RESIDENTS) {
    for (const png of ['01_WORK_PORTRAIT_FRONT.png', '02_WORK_FULL_BODY_FRONT.png']) {
      const src = path.join(liteDir, 'STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION', r.folder, png);
      if (fs.existsSync(src) && fs.statSync(src).size > 100) {
        const jpg = src.replace('.png', '.jpg');
        execSync(`ffmpeg -y -i "${src}" -vf "scale=768:-1" -q:v 4 "${jpg}"`, { stdio: 'ignore' });
        fs.unlinkSync(src);
      }
    }
  }
  const liteZip = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION_REVIEW_LITE.zip');
  execSync(`cd "${liteDir}" && zip -qr "${liteZip}" .`, { stdio: 'inherit' });
  fs.rmSync(liteDir, { recursive: true, force: true });
}

const cmd = process.argv[2];
if (cmd === 'scaffold') scaffold();
else if (cmd === 'record') record(JSON.parse(process.argv[3]));
else if (cmd === 'finalize') finalize();
else if (cmd === 'prompts') {
  scaffold();
  for (const r of RESIDENTS) {
    console.log(JSON.stringify({ id: r.id, portrait: portraitPrompt(r), fullBody: fullBodyPrompt(r) }));
  }
} else {
  console.error('Usage: validation-openart.mjs scaffold|record|finalize|prompts');
  process.exit(1);
}
