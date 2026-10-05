#!/usr/bin/env node
/**
 * Single-angle source test — proof sheets + audit JSON (no OpenArt; generation via MCP separately).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const PACK = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION');
const AUDIT_DIR = path.join(ROOT, 'artifacts/studio-world-resident-fabrication-validation');
const REGISTRY = path.join(PACK, 'source-binding-registry.json');

const EXPECTED_WORK =
  'public/site00/studio-world-residents/casting-thumbnails-v1/SW-RESIDENT-001_ETTA_VALE.jpg';
const EXPECTED_BODY =
  'public/site00/studio-world-residents/season1-v1/SW-RESIDENT-001__etta-vale/01-natural-authority/etta-vale__natural-full-body__sophisticated-fashionista.jpg';

function sha256File(abs) {
  return crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
}

function loadBinding() {
  const r = spawnSync('npx', ['tsx', '-e', `
    import { resolveValidationSourceBinding } from './shared/site00-studio-world/resident-fabrication/validationSourceBinding.ts';
    console.log(JSON.stringify(resolveValidationSourceBinding('SW-001')));
  `], { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return JSON.parse(r.stdout.trim());
}

async function sheet(outPath, title, workPath, bodyPath, workSha, bodySha, thirdBuf, thirdLabel) {
  const w = 300;
  const h = 380;
  const pad = 10;
  const cols = thirdBuf ? 3 : 2;
  const sheetW = cols * (w + pad) + pad;
  const headerH = 100;
  const svg = Buffer.from(
    `<svg width="${sheetW}" height="${headerH}" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="22" font-family="sans-serif" font-size="15" font-weight="bold">${title}</text>
      <text x="10" y="44" font-family="monospace" font-size="9">WORK: ${workPath}</text>
      <text x="10" y="58" font-family="monospace" font-size="9">SHA: ${workSha}</text>
      <text x="10" y="76" font-family="monospace" font-size="9">BODY: ${bodyPath}</text>
      <text x="10" y="90" font-family="monospace" font-size="9">SHA: ${bodySha}</text>
    </svg>`,
  );
  const workBuf = await sharp(path.join(ROOT, workPath)).resize(w, h, { fit: 'cover' }).jpeg({ quality: 88 }).toBuffer();
  const bodyBuf = await sharp(path.join(ROOT, bodyPath)).resize(w, h, { fit: 'cover' }).jpeg({ quality: 88 }).toBuffer();
  const labels = Buffer.from(
    `<svg width="${sheetW}" height="22" xmlns="http://www.w3.org/2000/svg">
      <text x="${pad}" y="16" font-size="11">SOURCE WORK LOOK</text>
      <text x="${pad + w + pad}" y="16" font-size="11">SOURCE BODY GEOMETRY</text>
      ${thirdLabel ? `<text x="${pad + 2 * (w + pad)}" y="16" font-size="11">${thirdLabel}</text>` : ''}
    </svg>`,
  );
  const composites = [
    { input: svg, top: 0, left: 0 },
    { input: labels, top: headerH, left: 0 },
    { input: workBuf, top: headerH + 22, left: pad },
    { input: bodyBuf, top: headerH + 22, left: pad + w + pad },
  ];
  if (thirdBuf) {
    composites.push({ input: thirdBuf, top: headerH + 22, left: pad + 2 * (w + pad) });
  }
  const sheetH = headerH + 22 + h + pad;
  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#eee' } })
    .composite(composites)
    .jpeg({ quality: 90 })
    .toFile(outPath);
}

const cmd = process.argv[2];
if (cmd === 'source-proof') {
  const binding = loadBinding();
  const resolvedWork = binding.workLookAuthority.repoPath;
  const resolvedBody = binding.bodyGeometryAuthority.repoPath;
  const workSha = sha256File(path.join(ROOT, resolvedWork));
  const bodySha = sha256File(path.join(ROOT, resolvedBody));
  const pathsOk = resolvedWork === EXPECTED_WORK && resolvedBody === EXPECTED_BODY;
  const reg = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const upload = reg.residents['SW-001']?.workLook?.visualReference;
  const shaOk = reg.residents['SW-001']?.workLook?.sha256 === workSha;
  const source_binding_status = pathsOk && shaOk ? 'PASS' : 'FAIL';
  const generation_allowed = source_binding_status === 'PASS';

  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  fs.mkdirSync(PACK, { recursive: true });
  const audit = {
    sprint: 'P0.STUDIOWORLD.RESIDENT-FABRICATION.SINGLE-ANGLE-SOURCE-TEST.OPENART1',
    resident_id: 'SW-001',
    resident_name: 'ETTA VALE',
    expected_worklook_path: EXPECTED_WORK,
    resolved_worklook_path: resolvedWork,
    worklook_sha256: workSha,
    expected_body_path: EXPECTED_BODY,
    resolved_body_path: resolvedBody,
    body_sha256: bodySha,
    openart_reference_upload_id: upload?.id ?? null,
    openart_reference_upload_url_if_available: upload?.url ?? null,
    source_binding_status,
    generation_allowed,
  };
  fs.writeFileSync(path.join(AUDIT_DIR, 'single-angle-source-test.json'), JSON.stringify(audit, null, 2));

  if (!generation_allowed) {
    console.error('SOURCE PROOF FAILED — generation blocked');
    process.exit(1);
  }
  await sheet(
    path.join(PACK, 'SW-001_ETTA_SINGLE_TEST_SOURCE_PROOF.jpg'),
    'SW-001 ETTA — SINGLE TEST SOURCE PROOF',
    resolvedWork,
    resolvedBody,
    workSha,
    bodySha,
  );
  console.log(JSON.stringify(audit, null, 2));
} else if (cmd === 'review-sheet') {
  const genPath = process.argv[3];
  const binding = loadBinding();
  const workSha = sha256File(path.join(ROOT, binding.workLookAuthority.repoPath));
  const bodySha = sha256File(path.join(ROOT, binding.bodyGeometryAuthority.repoPath));
  const genBuf = await sharp(genPath).resize(300, 380, { fit: 'cover' }).jpeg({ quality: 88 }).toBuffer();
  await sheet(
    path.join(PACK, 'SW-001_ETTA_SINGLE_TEST_REVIEW.jpg'),
    'SW-001 ETTA — SINGLE ANGLE TEST REVIEW',
    binding.workLookAuthority.repoPath,
    binding.bodyGeometryAuthority.repoPath,
    workSha,
    bodySha,
    genBuf,
    'GENERATED LEFT 3/4 TEST',
  );
} else {
  console.error('Usage: single-angle-source-test.mjs source-proof|review-sheet <gen.png>');
  process.exit(1);
}
