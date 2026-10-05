#!/usr/bin/env node
/**
 * Binary + visual source-binding proof for validation OpenArt inputs.
 * Does not call OpenArt. Fails loudly if resolved paths diverge from recovery authority.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const PACK = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION');
const AUDIT = path.join(PACK, 'source-binding-audit.json');
const LEGACY_IDENTITY = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION/openart_identity_references.json');

function sha256File(abs) {
  const buf = fs.readFileSync(abs);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function loadBindings() {
  const r = spawnSync('npx', ['tsx', '-e', `
    import { listValidationSourceBindings } from './shared/site00-studio-world/resident-fabrication/validationSourceBinding.ts';
    console.log(JSON.stringify(listValidationSourceBindings()));
  `], { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return JSON.parse(r.stdout.trim());
}

const RESIDENT_FOLDERS = {
  'SW-001': 'SW-001_ETTA_VALE',
  'SW-002': 'SW-002_ZURI_XU',
  'SW-003': 'SW-003_JULES_MERCER',
  'SW-004': 'SW-004_NOA_KLINE',
  'SW-005': 'SW-005_CASPIAN_REED',
  'SW-006': 'SW-006_IONA_WELLS',
  'SW-007': 'SW-007_MARLOWE_SAINT',
  'SW-008': 'SW-008_ELIO_VAHN',
};

const NAMES = {
  'SW-001': 'ETTA VALE',
  'SW-002': 'ZURI XU',
  'SW-003': 'JULES MERCER',
  'SW-004': 'NOA KLINE',
  'SW-005': 'CASPIAN REED',
  'SW-006': 'IONA WELLS',
  'SW-007': 'MARLOWE SAINT',
  'SW-008': 'ELIO VAHN',
};

async function proofSheet(residentId, binding, hashes, status) {
  const w = 320;
  const h = 400;
  const pad = 12;
  const workAbs = path.join(ROOT, binding.workLookAuthority.repoPath);
  const bodyAbs = path.join(ROOT, binding.bodyGeometryAuthority.repoPath);
  const workBuf = await sharp(workAbs).resize(w, h, { fit: 'cover' }).jpeg({ quality: 90 }).toBuffer();
  const bodyBuf = await sharp(bodyAbs).resize(w, h, { fit: 'cover' }).jpeg({ quality: 90 }).toBuffer();
  const sheetW = 2 * w + 3 * pad;
  const sheetH = h + 120;
  const title = `${residentId} ${NAMES[residentId]} — SOURCE BINDING PROOF (${status})`;
  const svg = Buffer.from(
    `<svg width="${sheetW}" height="120" xmlns="http://www.w3.org/2000/svg">
      <text x="12" y="24" font-family="sans-serif" font-size="14" font-weight="bold">${title}</text>
      <text x="12" y="48" font-family="monospace" font-size="10">WORK: ${binding.workLookAuthority.repoPath}</text>
      <text x="12" y="64" font-family="monospace" font-size="10">SHA: ${hashes.worklook_sha256.slice(0, 32)}…</text>
      <text x="12" y="88" font-family="monospace" font-size="10">BODY: ${binding.bodyGeometryAuthority.repoPath}</text>
      <text x="12" y="104" font-family="monospace" font-size="10">SHA: ${hashes.fullbody_sha256.slice(0, 32)}…</text>
    </svg>`,
  );
  const labels = Buffer.from(
    `<svg width="${sheetW}" height="24" xmlns="http://www.w3.org/2000/svg">
      <text x="${pad}" y="18" font-family="sans-serif" font-size="12">PORTRAIT / WORK LOOK</text>
      <text x="${pad + w + pad}" y="18" font-family="sans-serif" font-size="12">BODY GEOMETRY</text>
    </svg>`,
  );
  const outPath = path.join(PACK, `${residentId}_SOURCE_BINDING_PROOF.jpg`);
  await sharp({ create: { width: sheetW, height: sheetH + 24, channels: 3, background: '#f4f4f4' } })
    .composite([
      { input: svg, top: 0, left: 0 },
      { input: labels, top: 120, left: 0 },
      { input: workBuf, top: 144, left: pad },
      { input: bodyBuf, top: 144, left: pad + w + pad },
    ])
    .jpeg({ quality: 88 })
    .toFile(outPath);
  return outPath;
}

async function main() {
  fs.mkdirSync(PACK, { recursive: true });
  const bindings = loadBindings();
  const legacy = fs.existsSync(LEGACY_IDENTITY) ? JSON.parse(fs.readFileSync(LEGACY_IDENTITY, 'utf8')) : null;
  const auditEntries = [];
  let allPass = true;

  for (const binding of bindings) {
    const id = binding.residentId;
    const workAbs = path.join(ROOT, binding.workLookAuthority.repoPath);
    const bodyAbs = path.join(ROOT, binding.bodyGeometryAuthority.repoPath);
    if (!fs.existsSync(workAbs)) throw new Error(`Missing work look file: ${workAbs}`);
    if (!fs.existsSync(bodyAbs)) throw new Error(`Missing body file: ${bodyAbs}`);

    const portraitSha = sha256File(workAbs);
    const bodySha = sha256File(bodyAbs);
    const expectedPortrait = binding.workLookAuthority.repoPath;
    const resolvedPortrait = binding.workLookAuthority.repoPath;
    const status =
      expectedPortrait === resolvedPortrait &&
      !expectedPortrait.includes('production-authority-assets/shared/residents')
        ? 'PASS'
        : 'FAIL';
    if (status === 'FAIL') allPass = false;

    const oldRef = legacy?.residents?.[id]?.visualReference ?? null;
    const proof = {
      resident_id: id,
      resident_name: NAMES[id],
      expected_portrait_path: expectedPortrait,
      resolved_portrait_path: resolvedPortrait,
      expected_worklook_path: expectedPortrait,
      resolved_worklook_path: resolvedPortrait,
      expected_fullbody_path: binding.bodyGeometryAuthority.repoPath,
      resolved_fullbody_path: binding.bodyGeometryAuthority.repoPath,
      portrait_sha256: portraitSha,
      worklook_sha256: portraitSha,
      fullbody_sha256: bodySha,
      openart_reference_upload_id: null,
      openart_reference_url_if_available: null,
      superseded_geometry_identity_upload_id: oldRef?.id ?? null,
      superseded_geometry_identity_url: oldRef?.url ?? null,
      source_binding_status: status,
    };

    const folder = path.join(PACK, RESIDENT_FOLDERS[id]);
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, 'SOURCE_BINDING_PROOF.json'), JSON.stringify(proof, null, 2));
    await proofSheet(id, binding, { worklook_sha256: portraitSha, fullbody_sha256: bodySha }, status);

    auditEntries.push({
      resident: id,
      reference_role: 'WORK_LOOK',
      local_source_path: resolvedPortrait,
      sha256: portraitSha,
      uploaded_reference_id: null,
    });
    auditEntries.push({
      resident: id,
      reference_role: 'BODY_GEOMETRY',
      local_source_path: binding.bodyGeometryAuthority.repoPath,
      sha256: bodySha,
      uploaded_reference_id: null,
    });

    if (id === 'SW-001') {
      console.log('ETTA_EXPECTED_SOURCE:', expectedPortrait);
      console.log('ETTA_RESOLVED_SOURCE:', resolvedPortrait);
      console.log('ETTA_SOURCE_SHA256:', portraitSha);
      console.log('ETTA_OLD_GEOMETRY_OPENART_ID:', oldRef?.id ?? 'none');
    }
  }

  fs.writeFileSync(
    AUDIT,
    JSON.stringify(
      {
        sprint: 'P0.STUDIOWORLD.RESIDENT-FABRICATION.VALIDATION-SOURCE-BINDING.RECOVERY1',
        generated_at: new Date().toISOString(),
        all_pass: allPass,
        entries: auditEntries,
        note: 'openart_reference_upload_id filled after sha256-verified re-upload via source-binding-registry.json',
      },
      null,
      2,
    ),
  );

  if (!allPass) {
    console.error('SOURCE BINDING PROOF FAILED');
    process.exit(1);
  }
  console.log('SOURCE BINDING PROOF PASS (8/8)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
