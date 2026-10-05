#!/usr/bin/env node
/** Build OpenArt MCP payload from sha256-verified source-binding registry only. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const PACK = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION');
const REGISTRY = path.join(PACK, 'source-binding-registry.json');
const MANIFEST = path.join(PACK, 'validation_manifest.json');
const AUDIT = path.join(PACK, 'source-binding-audit.json');

function loadBinding(residentId) {
  const r = spawnSync('npx', ['tsx', '-e', `
    import { resolveValidationSourceBinding } from './shared/site00-studio-world/resident-fabrication/validationSourceBinding.ts';
    console.log(JSON.stringify(resolveValidationSourceBinding('${residentId}')));
  `], { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return JSON.parse(r.stdout.trim());
}

function sha256File(abs) {
  return crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
}

function appendAudit(entry) {
  const audit = fs.existsSync(AUDIT) ? JSON.parse(fs.readFileSync(AUDIT, 'utf8')) : { entries: [] };
  audit.entries.push({ ...entry, at: new Date().toISOString() });
  fs.writeFileSync(AUDIT, JSON.stringify(audit, null, 2));
}

const residentId = process.argv[2];
const frameType = process.argv[3];
if (!residentId || !frameType) {
  console.error('Usage: validation-openart-run-one.mjs SW-00X WORK_PORTRAIT_FRONT|WORK_FULL_BODY_FRONT');
  process.exit(1);
}

const binding = loadBinding(residentId);
const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
const reg = registry.residents?.[residentId];
if (!reg?.workLook?.visualReference || !reg?.bodyGeometry?.visualReference) {
  throw new Error(
    `Missing source-binding-registry OpenArt uploads for ${residentId}. Run source-binding-upload.mjs first.`,
  );
}

const workAbs = path.join(ROOT, binding.workLookAuthority.repoPath);
const bodyAbs = path.join(ROOT, binding.bodyGeometryAuthority.repoPath);
const workSha = sha256File(workAbs);
const bodySha = sha256File(bodyAbs);

if (reg.workLook.sha256 !== workSha) {
  throw new Error(
    `Registry SHA mismatch for ${residentId} work look: registry=${reg.workLook.sha256} file=${workSha}`,
  );
}
if (reg.bodyGeometry.sha256 !== bodySha) {
  throw new Error(
    `Registry SHA mismatch for ${residentId} body: registry=${reg.bodyGeometry.sha256} file=${bodySha}`,
  );
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const res = manifest.residents.find((x) => x.resident_id === residentId);
const frame = res.frames.find((f) => f.frame_type === frameType);

const visualReferences =
  frameType === 'WORK_PORTRAIT_FRONT'
    ? [reg.workLook.visualReference]
    : [reg.workLook.visualReference, reg.bodyGeometry.visualReference];

for (const ref of visualReferences) {
  appendAudit({
    resident: residentId,
    reference_role: ref === reg.workLook.visualReference ? 'WORK_LOOK' : 'BODY_GEOMETRY',
    local_source_path:
      ref === reg.workLook.visualReference ? binding.workLookAuthority.repoPath : binding.bodyGeometryAuthority.repoPath,
    sha256: ref === reg.workLook.visualReference ? workSha : bodySha,
    uploaded_reference_id: ref.id,
    openart_url: ref.url,
  });
}

console.log(
  JSON.stringify({
    model: 'gpt-image-2-5-sunburst',
    mode: 'image2image',
    projectId: 'Q7IHYCEK3RPn2c1ConEG',
    params: {
      prompt: frame.prompt,
      visualReferences,
      aspectRatio: frameType === 'WORK_PORTRAIT_FRONT' ? '3:4' : '9:16',
      resolutionTier: '2k',
      quality: 'high',
      autoEnhancePrompt: false,
      outputFormat: 'png',
      variant: 'sunburst',
    },
    meta: {
      residentId,
      frameType,
      workLookSha256: workSha,
      bodySha256: bodySha,
      workLookUploadId: reg.workLook.visualReference.id,
      supersededUploadIds: reg.supersededOpenArtUploadIds ?? [],
    },
  }),
);
