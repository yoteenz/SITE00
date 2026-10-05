#!/usr/bin/env node
/**
 * Geometry-complete OpenArt pipeline — 14 new frames × 8 residents (skip front portrait + front full-body regen).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const PACK = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE');
const MASTER = path.join(PACK, 'geometry_complete_master_manifest.json');
const REFS = path.join(PACK, 'geometry_complete_openart_refs.json');
const REGISTRY = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION/source-binding-registry.json');
const UNIFORM_MANIFEST = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FULL_BODY_UNIFORM_REGEN/full_body_uniform_regen_manifest.json');
const PROJECT = 'Q7IHYCEK3RPn2c1ConEG';
const PUBLIC_ROOT = path.join(ROOT, 'public/site00/studio-world-residents/geometry-complete-v1');
const QUEUE = path.join(PACK, '_job_queue.json');
const STATE = path.join(PACK, '_autogen_state.json');

const RESIDENTS = [
  { id: 'SW-001', folder: 'SW-001_ETTA_VALE', name: 'ETTA VALE', outfit: 'WOMEN' },
  { id: 'SW-002', folder: 'SW-002_ZURI_XU', name: 'ZURI XU', outfit: 'WOMEN' },
  { id: 'SW-003', folder: 'SW-003_JULES_MERCER', name: 'JULES MERCER', outfit: 'MEN' },
  { id: 'SW-004', folder: 'SW-004_NOA_KLINE', name: 'NOA KLINE', outfit: 'MEN' },
  { id: 'SW-005', folder: 'SW-005_CASPIAN_REED', name: 'CASPIAN REED', outfit: 'MEN' },
  { id: 'SW-006', folder: 'SW-006_IONA_WELLS', name: 'IONA WELLS', outfit: 'WOMEN' },
  { id: 'SW-007', folder: 'SW-007_MARLOWE_SAINT', name: 'MARLOWE SAINT', outfit: 'MEN' },
  { id: 'SW-008', folder: 'SW-008_ELIO_VAHN', name: 'ELIO VAHN', outfit: 'MEN' },
];

const NEW_SLOTS = [
  '01_PORTRAIT_LEFT_3Q',
  '02_PORTRAIT_RIGHT_3Q',
  '03_PROFILE_LEFT',
  '04_PROFILE_RIGHT',
  '05_REAR_HEAD',
  '06_FULL_BODY_LEFT_3Q',
  '07_FULL_BODY_RIGHT_3Q',
  '08_FULL_BODY_LEFT_PROFILE',
  '09_FULL_BODY_RIGHT_PROFILE',
  '10_FULL_BODY_BACK',
  '11_SEATED_NEUTRAL',
  '12_STANDING_CONVERSATIONAL',
  '13_NATURAL_WALK',
  '14_DOCUMENTARY_CAMERA_AWARE',
];

function sha256File(abs) {
  return crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
}

function loadBinding(id) {
  const r = spawnSync(
    'npx',
    [
      'tsx',
      '-e',
      `import { resolveValidationSourceBinding } from './shared/site00-studio-world/resident-fabrication/validationSourceBinding.ts'; console.log(JSON.stringify(resolveValidationSourceBinding('${id}')));`,
    ],
    { cwd: ROOT, encoding: 'utf8' },
  );
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return JSON.parse(r.stdout.trim());
}

async function importTs() {
  const { buildGeometryCompletePrompt } = await import(
    '../shared/site00-studio-world/resident-fabrication/geometryPrompts.ts'
  );
  const { RESIDENT_GEOMETRY_FRAMES, STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES } = await import(
    '../shared/site00-studio-world/resident-fabrication/residentGeometryFrames.ts'
  );
  const {
    GEOMETRY_COMPLETE_SLOT_TO_FRAME_ID,
    RESIDENT_OUTFIT_SYSTEM,
  } = await import('../shared/site00-studio-world/resident-fabrication/residentGeometryCompletePack.ts');
  const { buildMasterGeometryCompleteManifest } = await import(
    '../shared/site00-studio-world/resident-fabrication/residentGeometryCompleteRegistry.ts'
  );
  return {
    buildGeometryCompletePrompt,
    RESIDENT_GEOMETRY_FRAMES,
    STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES,
    GEOMETRY_COMPLETE_SLOT_TO_FRAME_ID,
    RESIDENT_OUTFIT_SYSTEM,
    buildMasterGeometryCompleteManifest,
  };
}

function aspectForSlot(slot) {
  if (slot.includes('PORTRAIT') || slot.includes('PROFILE') || slot.includes('REAR_HEAD')) return '3:4';
  if (slot.includes('SEATED') || slot.includes('DOCUMENTARY')) return '4:3';
  return '9:16';
}

function portraitOnlySlot(slot) {
  return slot.includes('PORTRAIT') || slot.includes('PROFILE') || slot.includes('REAR_HEAD');
}

function loadRefs() {
  if (!fs.existsSync(REFS)) throw new Error(`Missing ${REFS} — run sync-refs`);
  return JSON.parse(fs.readFileSync(REFS, 'utf8'));
}

function syncRefsFromUniformManifest() {
  const reg = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const uniform = JSON.parse(fs.readFileSync(UNIFORM_MANIFEST, 'utf8'));
  const out = { projectId: PROJECT, residents: {} };
  for (const r of RESIDENTS) {
    const bind = reg.residents[r.id];
    const urow = uniform.residents.find((x) => x.resident_id === r.id);
    if (!bind?.workLook?.visualReference) throw new Error(`Missing workLook ref for ${r.id}`);
    out.residents[r.id] = {
      portrait: bind.workLook.visualReference,
      uniformFullBody: {
        type: 'image',
        id: urow.openart_generation_id,
        url: urow.output_url,
        label: `${r.id} uniform full-body front`,
      },
    };
  }
  fs.mkdirSync(PACK, { recursive: true });
  fs.writeFileSync(REFS, `${JSON.stringify(out, null, 2)}\n`);
  console.error('Wrote', REFS);
}

async function scaffold() {
  const { buildMasterGeometryCompleteManifest } = await importTs();
  fs.mkdirSync(PACK, { recursive: true });
  const master = buildMasterGeometryCompleteManifest();
  fs.writeFileSync(MASTER, `${JSON.stringify(master, null, 2)}\n`);
  for (const r of RESIDENTS) {
    const dir = path.join(PACK, r.folder);
    fs.mkdirSync(dir, { recursive: true });
    const bind = loadBinding(r.id);
    const portraitSrc = path.join(ROOT, bind.workLookAuthority.repoPath);
    const uniformSrc = path.join(
      ROOT,
      'artifacts/STUDIO_WORLD_RESIDENT_FULL_BODY_UNIFORM_REGEN',
      r.folder,
      '01_FULL_BODY_UNIFORM_FRONT.png',
    );
    const portraitDst = path.join(dir, '00_APPROVED_PORTRAIT_FRONT.png');
    const bodyDst = path.join(dir, '00_APPROVED_FULL_BODY_FRONT.png');
    fs.copyFileSync(portraitSrc, portraitDst);
    if (fs.existsSync(uniformSrc)) fs.copyFileSync(uniformSrc, bodyDst);
    const pubDir = path.join(PUBLIC_ROOT, r.folder);
    fs.mkdirSync(pubDir, { recursive: true });
    fs.copyFileSync(portraitDst, path.join(pubDir, '00_APPROVED_PORTRAIT_FRONT.png'));
    if (fs.existsSync(bodyDst)) fs.copyFileSync(bodyDst, path.join(pubDir, '00_APPROVED_FULL_BODY_FRONT.png'));
    fs.writeFileSync(path.join(dir, 'manifest.json'), `${JSON.stringify(master.residents.find((x) => x.resident_id === r.id), null, 2)}\n`);
  }
  if (!fs.existsSync(REFS)) syncRefsFromUniformManifest();
  console.error('Scaffolded', PACK);
}

async function buildQueue(onlyResidents) {
  const {
    buildGeometryCompletePrompt,
    STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES,
    RESIDENT_GEOMETRY_FRAMES,
    GEOMETRY_COMPLETE_SLOT_TO_FRAME_ID,
    RESIDENT_OUTFIT_SYSTEM,
  } = await importTs();
  const refs = loadRefs();
  const jobs = [];
  for (const r of RESIDENTS) {
    if (onlyResidents?.length && !onlyResidents.includes(r.id)) continue;
    const profile = STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES.find((p) => p.residentId === r.id);
    const outfit = RESIDENT_OUTFIT_SYSTEM[r.id];
    const refRow = refs.residents[r.id];
    for (const slot of NEW_SLOTS) {
      const frameId = GEOMETRY_COMPLETE_SLOT_TO_FRAME_ID[slot];
      const frame = RESIDENT_GEOMETRY_FRAMES.find((f) => f.frameId === frameId);
      const sourceRole = portraitOnlySlot(slot) ? 'PORTRAIT_ONLY' : 'PORTRAIT_AND_UNIFORM_BODY';
      const visualReferences =
        sourceRole === 'PORTRAIT_ONLY'
          ? [refRow.portrait]
          : [refRow.portrait, refRow.uniformFullBody];
      jobs.push({
        residentId: r.id,
        slot,
        aspectRatio: aspectForSlot(slot),
        prompt: buildGeometryCompletePrompt(profile, frame, outfit, sourceRole),
        visualReferences,
        relative_path: `artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE/${r.folder}/${slot}.png`,
      });
    }
  }
  fs.writeFileSync(QUEUE, `${JSON.stringify(jobs, null, 2)}\n`);
  console.log(JSON.stringify({ count: jobs.length, queue: QUEUE }, null, 2));
}

async function runOnePayload(residentId, slot) {
  if (!fs.existsSync(QUEUE)) await buildQueue();
  const jobs = JSON.parse(fs.readFileSync(QUEUE, 'utf8'));
  const job = jobs.find((j) => j.residentId === residentId && j.slot === slot);
  if (!job) throw new Error(`No job for ${residentId} ${slot}`);
  console.log(
    JSON.stringify({
      model: 'gpt-image-2-5-sunburst',
      mode: 'image2image',
      projectId: PROJECT,
      params: {
        prompt: job.prompt,
        visualReferences: job.visualReferences,
        aspectRatio: job.aspectRatio,
        resolutionTier: '2k',
        quality: 'high',
        autoEnhancePrompt: false,
        outputFormat: 'png',
        variant: 'sunburst',
      },
      meta: { residentId, slot, relative_path: job.relative_path },
    }),
  );
}

function record(entry) {
  const { residentId, slot, historyId, outputUrl, retryCount = 0, status = 'IN_REVIEW' } = entry;
  const r = RESIDENTS.find((x) => x.id === residentId);
  const dest = path.join(PACK, r.folder, `${slot}.png`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  execSync(`curl -fsSL "${outputUrl}" -o "${dest}"`, { stdio: 'inherit' });
  const pubDest = path.join(PUBLIC_ROOT, r.folder, `${slot}.png`);
  fs.mkdirSync(path.dirname(pubDest), { recursive: true });
  fs.copyFileSync(dest, pubDest);
  const sha = sha256File(dest);
  const master = JSON.parse(fs.readFileSync(MASTER, 'utf8'));
  const res = master.residents.find((x) => x.resident_id === residentId);
  const asset = res.assets.find((a) => a.slot === slot);
  Object.assign(asset, {
    openart_generation_id: historyId,
    sha256: sha,
    approval_status: status,
    geometry_status: status === 'FOUNDER_REVIEW_REQUIRED' ? 'FAILED' : 'VALID',
    retry_count: retryCount,
    created_at: new Date().toISOString(),
    openart_reference_ids: entry.referenceIds ?? [],
  });
  fs.writeFileSync(MASTER, `${JSON.stringify(master, null, 2)}\n`);
  fs.writeFileSync(path.join(PACK, r.folder, 'manifest.json'), `${JSON.stringify(res, null, 2)}\n`);
  console.error('Recorded', residentId, slot, sha.slice(0, 12));
}

async function finalize() {
  const sharp = (await import('sharp')).default;
  for (const r of RESIDENTS) {
    const dir = path.join(PACK, r.folder);
    const tiles = [];
    const order = ['00_APPROVED_PORTRAIT_FRONT', '00_APPROVED_FULL_BODY_FRONT', ...NEW_SLOTS];
    for (const slot of order) {
      const p = path.join(dir, `${slot}.png`);
      if (fs.existsSync(p) && fs.statSync(p).size > 500) tiles.push({ slot, p });
    }
    const cols = 4;
    const tw = 200;
    const th = 280;
    const pad = 6;
    const composites = [];
    for (let i = 0; i < tiles.length; i++) {
      const buf = await sharp(tiles[i].p).resize(tw, th, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer();
      composites.push({
        input: buf,
        left: pad + (i % cols) * (tw + pad),
        top: 36 + pad + Math.floor(i / cols) * (th + pad),
      });
    }
    const rows = Math.ceil(tiles.length / cols);
    const w = cols * (tw + pad) + pad;
    const h = 36 + rows * (th + pad) + pad;
    const title = Buffer.from(
      `<svg width="${w}" height="36"><text x="8" y="24" font-family="sans-serif" font-size="13">${r.id} ${r.name} geometry</text></svg>`,
    );
    await sharp({ create: { width: w, height: h, channels: 3, background: '#e8e8e8' } })
      .composite([{ input: title, top: 0, left: 0 }, ...composites])
      .jpeg({ quality: 88 })
      .toFile(path.join(dir, `${r.id}_GEOMETRY_CONTACT_SHEET.jpg`));
  }
  const overviewSlots = ['00_APPROVED_PORTRAIT_FRONT', '01_PORTRAIT_LEFT_3Q', '02_PORTRAIT_RIGHT_3Q', '03_PROFILE_LEFT', '00_APPROVED_FULL_BODY_FRONT', '10_FULL_BODY_BACK'];
  const tileW = 120;
  const tileH = 180;
  const pad = 4;
  const cols = 6;
  const sheetW = cols * (tileW + pad) + pad + 48;
  const sheetH = 2 * (tileH + pad) + pad + 28;
  const composites = [];
  for (let ri = 0; ri < RESIDENTS.length; ri++) {
    const r = RESIDENTS[ri];
    for (let ci = 0; ci < overviewSlots.length; ci++) {
      const slot = overviewSlots[ci];
      const p = path.join(PACK, r.folder, `${slot}.png`);
      if (!fs.existsSync(p)) continue;
      const buf = await sharp(p).resize(tileW, tileH, { fit: 'cover' }).jpeg({ quality: 82 }).toBuffer();
      const col = ci;
      const row = ri;
      composites.push({ input: buf, left: 48 + pad + col * (tileW + pad), top: 28 + pad + row * (tileH + pad) });
    }
  }
  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#ddd' } })
    .composite(composites)
    .jpeg({ quality: 85 })
    .toFile(path.join(PACK, '01_MASTER_RESIDENT_GEOMETRY_OVERVIEW.jpg'));
  const fullZip = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE_REVIEW.zip');
  execSync(`cd "${path.dirname(PACK)}" && zip -qr "${fullZip}" STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE`, {
    stdio: 'inherit',
  });
  const liteDir = path.join(ROOT, 'artifacts/_geo_complete_lite');
  fs.rmSync(liteDir, { recursive: true, force: true });
  fs.mkdirSync(liteDir, { recursive: true });
  fs.cpSync(PACK, path.join(liteDir, 'STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE'), { recursive: true });
  for (const r of RESIDENTS) {
    const d = path.join(liteDir, 'STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE', r.folder);
    for (const slot of NEW_SLOTS) {
      const png = path.join(d, `${slot}.png`);
      if (fs.existsSync(png) && fs.statSync(png).size > 500) {
        const jpg = png.replace('.png', '.jpg');
        execSync(`ffmpeg -y -i "${png}" -vf "scale=720:-1" -q:v 4 "${jpg}"`, { stdio: 'ignore' });
        fs.unlinkSync(png);
      }
    }
  }
  const liteZip = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE_REVIEW_LITE.zip');
  execSync(`cd "${liteDir}" && zip -qr "${liteZip}" .`, { stdio: 'inherit' });
  fs.rmSync(liteDir, { recursive: true, force: true });
  console.error('Finalized contact sheets + ZIPs');
}

const cmd = process.argv[2];
if (cmd === 'scaffold') scaffold();
else if (cmd === 'sync-refs') syncRefsFromUniformManifest();
else if (cmd === 'build-queue') buildQueue(process.argv[3]?.split(','));
else if (cmd === 'run-one') runOnePayload(process.argv[3], process.argv[4]);
else if (cmd === 'record') record(JSON.parse(process.argv[3]));
else if (cmd === 'finalize') finalize();
else {
  console.error(
    'Usage: geometry-complete-openart.mjs scaffold|sync-refs|build-queue|run-one SW-00X SLOT|record|finalize',
  );
  process.exit(1);
}
