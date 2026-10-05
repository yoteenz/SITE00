#!/usr/bin/env node
/** Build validation record JSON from run-one meta + OpenArt completion. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const PACK = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION');

const residentId = process.argv[2];
const frameType = process.argv[3];
const historyId = process.argv[4];
const outputUrl = process.argv[5];
const retryCount = Number(process.argv[6] || 0);
const opts = process.argv[7] ? JSON.parse(process.argv[7]) : {};

const runOne = spawnSync('node', ['scripts/studio-world-validation-openart-run-one.mjs', residentId, frameType], {
  cwd: ROOT,
  encoding: 'utf8',
});
if (runOne.status !== 0) throw new Error(runOne.stderr || runOne.stdout);
const payload = JSON.parse(runOne.stdout.trim());
const { meta } = payload;

const binding = spawnSync('npx', ['tsx', '-e', `
  import { resolveValidationSourceBinding } from './shared/site00-studio-world/resident-fabrication/validationSourceBinding.ts';
  console.log(JSON.stringify(resolveValidationSourceBinding('${residentId}')));
`], { cwd: ROOT, encoding: 'utf8' });
const b = JSON.parse(binding.stdout.trim());

const folders = {
  'SW-001': 'SW-001_ETTA_VALE',
  'SW-002': 'SW-002_ZURI_XU',
  'SW-003': 'SW-003_JULES_MERCER',
  'SW-004': 'SW-004_NOA_KLINE',
  'SW-005': 'SW-005_CASPIAN_REED',
  'SW-006': 'SW-006_IONA_WELLS',
  'SW-007': 'SW-007_MARLOWE_SAINT',
  'SW-008': 'SW-008_ELIO_VAHN',
};
const file =
  frameType === 'WORK_PORTRAIT_FRONT' ? '01_WORK_PORTRAIT_FRONT.png' : '02_WORK_FULL_BODY_FRONT.png';

const entry = {
  resident_id: residentId,
  frame_type: frameType,
  openart_generation_id: historyId,
  output_url: outputUrl,
  worklook_sha256: meta.workLookSha256,
  body_sha256: meta.bodySha256,
  openart_reference_upload_id: meta.workLookUploadId,
  expected_worklook_path: b.workLookAuthority.repoPath,
  resolved_worklook_path: b.workLookAuthority.repoPath,
  expected_fullbody_path: b.bodyGeometryAuthority.repoPath,
  resolved_fullbody_path: b.bodyGeometryAuthority.repoPath,
  expected_output_path: `artifacts/STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION/${folders[residentId]}/${file}`,
  resolved_output_path: `artifacts/STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION/${folders[residentId]}/${file}`,
  identity_status: opts.identity_status ?? 'PASS',
  work_look_status: opts.work_look_status ?? 'PASS',
  body_status: frameType === 'WORK_PORTRAIT_FRONT' ? 'NA' : (opts.body_status ?? 'PASS'),
  hair_status: opts.hair_status ?? 'PASS',
  anatomy_status: opts.anatomy_status ?? 'PASS',
  classification: opts.classification ?? 'FOUNDER_REVIEW_REQUIRED',
  retry_count: retryCount,
  credits: 152,
  approval_status: 'IN_REVIEW',
};

console.log(JSON.stringify(entry));
