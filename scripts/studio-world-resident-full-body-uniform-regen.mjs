#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { execSync } from 'node:child_process';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const PACK = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FULL_BODY_UNIFORM_REGEN');
const MANIFEST = path.join(PACK, 'full_body_uniform_regen_manifest.json');
const REGISTRY = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION/source-binding-registry.json');
const OUTFIT_REFS = path.join(PACK, 'uniform_outfit_openart_refs.json');
const PROJECT = 'Q7IHYCEK3RPn2c1ConEG';

const RESIDENTS = [
  { id: 'SW-001', name: 'ETTA VALE', folder: 'SW-001_ETTA_VALE', outfit: 'WOMEN' },
  { id: 'SW-002', name: 'ZURI XU', folder: 'SW-002_ZURI_XU', outfit: 'WOMEN' },
  { id: 'SW-003', name: 'JULES MERCER', folder: 'SW-003_JULES_MERCER', outfit: 'MEN' },
  { id: 'SW-004', name: 'NOA KLINE', folder: 'SW-004_NOA_KLINE', outfit: 'MEN' },
  { id: 'SW-005', name: 'CASPIAN REED', folder: 'SW-005_CASPIAN_REED', outfit: 'MEN' },
  { id: 'SW-006', name: 'IONA WELLS', folder: 'SW-006_IONA_WELLS', outfit: 'WOMEN' },
  { id: 'SW-007', name: 'MARLOWE SAINT', folder: 'SW-007_MARLOWE_SAINT', outfit: 'MEN' },
  { id: 'SW-008', name: 'ELIO VAHN', folder: 'SW-008_ELIO_VAHN', outfit: 'MEN' },
];

const WOMEN_UNIFORM = 'public/site00/studio-world-residents/uniform-authority-v1/WOMENS_FULL_BODY_UNIFORM_AUTHORITY.jpg';
const MEN_UNIFORM = 'public/site00/studio-world-residents/uniform-authority-v1/MENS_FULL_BODY_UNIFORM_AUTHORITY.jpg';

const IDENTITY_LOCK = `REFERENCE IMAGES = STRICT IDENTITY AUTHORITY. SAME PERSON. DO NOT CHANGE face, face shape, age, skin tone, ethnicity, eye shape, nose, lips, jaw, hairline, hair color, hair texture, body type, or body proportions. Only change wardrobe to the specified athletic uniform system.`;

function loadBinding(id) {
  const r = spawnSync('npx', ['tsx', '-e', `
    import { resolveValidationSourceBinding } from './shared/site00-studio-world/resident-fabrication/validationSourceBinding.ts';
    console.log(JSON.stringify(resolveValidationSourceBinding('${id}')));
  `], { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return JSON.parse(r.stdout.trim());
}

function outfitPrompt(r) {
  const women = r.outfit === 'WOMEN';
  return `${IDENTITY_LOCK}

Subject: ${r.name} (${r.id}) Studio World resident.

Use casting/work-look reference for FACE, HAIR, and identity. Use season1 full-body reference for BODY PROPORTIONS and HEIGHT only. Use attached ${women ? "WOMEN'S" : "MEN'S"} uniform authority for OUTFIT SYSTEM only.

FULL-BODY UNIFORM REGEN — FRONT:
- full body standing straight-on, feet visible, neutral upright stance
- clean studio backdrop, soft even lighting
- white fitted short-sleeve top with red collar trim
${women ? '- white leggings with subtle red trim, white toe shoes with red trim (NOT sneakers)' : '- white compression shorts with red trim, white toe shoes with red trim (NOT leggings, NOT sneakers)'}
- minimal athletic uniform presentation, reference quality not editorial fashion
- do NOT use cream suit, black suit, or prior fashion outfit`;
}

function scaffold() {
  fs.mkdirSync(PACK, { recursive: true });
  const entries = RESIDENTS.map((r) => {
    const b = loadBinding(r.id);
    fs.mkdirSync(path.join(PACK, r.folder), { recursive: true });
    return {
      resident_id: r.id,
      resident_name: r.name,
      outfit_system: r.outfit === 'WOMEN' ? 'WOMEN_LEGGINGS' : 'MEN_COMPRESSION_SHORTS',
      identity_worklook_path: b.workLookAuthority.repoPath,
      body_geometry_path: b.bodyGeometryAuthority.repoPath,
      outfit_authority_path: r.outfit === 'WOMEN' ? WOMEN_UNIFORM : MEN_UNIFORM,
      file: '01_FULL_BODY_UNIFORM_FRONT.png',
      prompt: outfitPrompt(r),
      openart_generation_id: null,
      output_url: null,
      retry_count: 0,
      classification: 'PENDING',
      approval_status: 'IN_REVIEW',
    };
  });
  fs.writeFileSync(
    MANIFEST,
    JSON.stringify(
      {
        sprint: 'P0.STUDIOWORLD.RESIDENT-FABRICATION.FULL-BODY-UNIFORM-REGEN.OPENART1',
        openart_project_id: PROJECT,
        source_binding_pr: 1324,
        portraits_regenerated: false,
        credits_spent_estimate: 0,
        residents: entries,
      },
      null,
      2,
    ),
  );
}

function record(entry) {
  const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const row = m.residents.find((x) => x.resident_id === entry.resident_id);
  Object.assign(row, entry);
  const r = RESIDENTS.find((x) => x.id === entry.resident_id);
  const out = path.join(PACK, r.folder, '01_FULL_BODY_UNIFORM_FRONT.png');
  if (entry.output_url) {
    execSync(`curl -fsSL "${entry.output_url}" -o "${out}"`, { stdio: 'inherit' });
  }
  fs.writeFileSync(path.join(PACK, r.folder, 'regen.json'), JSON.stringify(row, null, 2));
  m.credits_spent_estimate = (m.credits_spent_estimate || 0) + (entry.credits || 152);
  fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2));
}

function buildPayload(residentId) {
  const reg = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const outfits = JSON.parse(fs.readFileSync(OUTFIT_REFS, 'utf8'));
  const r = RESIDENTS.find((x) => x.id === residentId);
  const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const row = m.residents.find((x) => x.resident_id === residentId);
  const bind = reg.residents[residentId];
  const outfitRef = r.outfit === 'WOMEN' ? outfits.women : outfits.men;
  return {
    model: 'gpt-image-2-5-sunburst',
    mode: 'image2image',
    projectId: PROJECT,
    params: {
      prompt: row.prompt,
      visualReferences: [bind.workLook.visualReference, bind.bodyGeometry.visualReference, outfitRef],
      aspectRatio: '9:16',
      resolutionTier: '2k',
      quality: 'high',
      autoEnhancePrompt: false,
      outputFormat: 'png',
      variant: 'sunburst',
    },
  };
}

async function residentSheet(r, row) {
  const w = 240;
  const h = 320;
  const pad = 8;
  const bind = loadBinding(r.id);
  const outfitPath = r.outfit === 'WOMEN' ? WOMEN_UNIFORM : MEN_UNIFORM;
  const paths = [
    path.join(ROOT, bind.workLookAuthority.repoPath),
    path.join(ROOT, bind.bodyGeometryAuthority.repoPath),
    path.join(ROOT, outfitPath),
    path.join(PACK, r.folder, '01_FULL_BODY_UNIFORM_FRONT.png'),
  ];
  const labels = ['IDENTITY', 'OLD FULL BODY', 'OUTFIT AUTH', 'REGEN'];
  const composites = [];
  for (let i = 0; i < paths.length; i++) {
    if (!fs.existsSync(paths[i]) || fs.statSync(paths[i]).size < 100) continue;
    const buf = await sharp(paths[i]).resize(w, h, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer();
    composites.push({ input: buf, left: pad + (i % 2) * (w + pad), top: 40 + pad + Math.floor(i / 2) * (h + pad) });
  }
  const sheetW = 2 * (w + pad) + pad;
  const sheetH = 2 * (h + pad) + pad + 40;
  const title = Buffer.from(
    `<svg width="${sheetW}" height="40"><text x="8" y="26" font-family="sans-serif" font-size="14">${r.id} ${r.name} uniform regen</text></svg>`,
  );
  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#ececec' } })
    .composite([{ input: title, top: 0, left: 0 }, ...composites])
    .jpeg({ quality: 88 })
    .toFile(path.join(PACK, r.folder, `${r.id}_FULL_BODY_UNIFORM_SHEET.jpg`));
}

async function finalize() {
  const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  for (const r of RESIDENTS) {
    const row = m.residents.find((x) => x.resident_id === r.id);
    await residentSheet(r, row);
  }
  const tileW = 140;
  const tileH = 220;
  const pad = 4;
  const sheetW = 4 * (tileW + pad) + pad + 60;
  const sheetH = 2 * (tileH + pad) + pad + 32;
  const composites = [];
  for (let i = 0; i < RESIDENTS.length; i++) {
    const r = RESIDENTS[i];
    const p = path.join(PACK, r.folder, '01_FULL_BODY_UNIFORM_FRONT.png');
    if (!fs.existsSync(p) || fs.statSync(p).size < 100) continue;
    const buf = await sharp(p).resize(tileW, tileH, { fit: 'cover' }).jpeg({ quality: 82 }).toBuffer();
    const col = i % 4;
    const row = Math.floor(i / 4);
    composites.push({ input: buf, left: 60 + pad + col * (tileW + pad), top: 32 + pad + row * (tileH + pad) });
  }
  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#ddd' } })
    .composite(composites)
    .jpeg({ quality: 85 })
    .toFile(path.join(PACK, '01_MASTER_FULL_BODY_UNIFORM_OVERVIEW.jpg'));
  const fullZip = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FULL_BODY_UNIFORM_REGEN_REVIEW.zip');
  execSync(`cd "${path.dirname(PACK)}" && zip -qr "${fullZip}" STUDIO_WORLD_RESIDENT_FULL_BODY_UNIFORM_REGEN`, { stdio: 'inherit' });
  const liteDir = path.join(ROOT, 'artifacts/_fb_uniform_lite');
  fs.rmSync(liteDir, { recursive: true, force: true });
  fs.mkdirSync(liteDir, { recursive: true });
  fs.cpSync(PACK, path.join(liteDir, 'STUDIO_WORLD_RESIDENT_FULL_BODY_UNIFORM_REGEN'), { recursive: true });
  for (const r of RESIDENTS) {
    const src = path.join(liteDir, 'STUDIO_WORLD_RESIDENT_FULL_BODY_UNIFORM_REGEN', r.folder, '01_FULL_BODY_UNIFORM_FRONT.png');
    if (fs.existsSync(src) && fs.statSync(src).size > 100) {
      const jpg = src.replace('.png', '.jpg');
      execSync(`ffmpeg -y -i "${src}" -vf "scale=720:-1" -q:v 4 "${jpg}"`, { stdio: 'ignore' });
      fs.unlinkSync(src);
    }
  }
  const liteZip = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FULL_BODY_UNIFORM_REGEN_REVIEW_LITE.zip');
  execSync(`cd "${liteDir}" && zip -qr "${liteZip}" .`, { stdio: 'inherit' });
  fs.rmSync(liteDir, { recursive: true, force: true });
}

const cmd = process.argv[2];
if (cmd === 'scaffold') scaffold();
else if (cmd === 'record') record(JSON.parse(process.argv[3]));
else if (cmd === 'payload') console.log(JSON.stringify(buildPayload(process.argv[3])));
else if (cmd === 'finalize') finalize();
else {
  console.error('Usage: uniform-regen.mjs scaffold|payload SW-00X|record|finalize');
  process.exit(1);
}
