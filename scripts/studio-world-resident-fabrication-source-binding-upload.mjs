#!/usr/bin/env node
/**
 * Emit upload instructions / JSON for sha256-keyed OpenArt re-uploads (no stale identity cache).
 * Usage: node ... upload-plan [SW-001]  — prints file sizes for MCP openart_upload_sign
 *        node ... write-registry '<json>' — merge upload results into source-binding-registry.json
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const PACK = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION');
const REGISTRY = path.join(PACK, 'source-binding-registry.json');
const LEGACY = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION/openart_identity_references.json');
const PROJECT = 'Q7IHYCEK3RPn2c1ConEG';

function loadBindings(ids) {
  const r = spawnSync('npx', ['tsx', '-e', `
    import { listValidationSourceBindings, resolveValidationSourceBinding } from './shared/site00-studio-world/resident-fabrication/validationSourceBinding.ts';
    const ids = ${JSON.stringify(ids)};
    const list = ids?.length ? ids.map(id => resolveValidationSourceBinding(id)) : listValidationSourceBindings();
    console.log(JSON.stringify(list));
  `], { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return JSON.parse(r.stdout.trim());
}

function sha256File(abs) {
  return crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
}

const cmd = process.argv[2];
if (cmd === 'upload-plan') {
  const only = process.argv[3] ? [process.argv[3]] : null;
  const bindings = loadBindings(only);
  const legacy = fs.existsSync(LEGACY) ? JSON.parse(fs.readFileSync(LEGACY, 'utf8')) : { residents: {} };
  const plan = [];
  for (const b of bindings) {
    const workAbs = path.join(ROOT, b.workLookAuthority.repoPath);
    const bodyAbs = path.join(ROOT, b.bodyGeometryAuthority.repoPath);
    const workSha = sha256File(workAbs);
    const bodySha = sha256File(bodyAbs);
    plan.push({
      residentId: b.residentId,
      workLook: {
        localPath: b.workLookAuthority.repoPath,
        sha256: workSha,
        size: fs.statSync(workAbs).size,
        filename: path.basename(workAbs),
        label: `${b.residentId} workLook sha256:${workSha.slice(0, 16)}`,
        supersededUploadId: legacy.residents?.[b.residentId]?.uploadId ?? null,
      },
      bodyGeometry: {
        localPath: b.bodyGeometryAuthority.repoPath,
        sha256: bodySha,
        size: fs.statSync(bodyAbs).size,
        filename: path.basename(bodyAbs),
        label: `${b.residentId} bodyGeometry sha256:${bodySha.slice(0, 16)}`,
      },
    });
  }
  console.log(JSON.stringify({ projectId: PROJECT, plan }, null, 2));
} else if (cmd === 'write-registry') {
  const payload = JSON.parse(process.argv[3]);
  fs.mkdirSync(PACK, { recursive: true });
  const existing = fs.existsSync(REGISTRY) ? JSON.parse(fs.readFileSync(REGISTRY, 'utf8')) : { projectId: PROJECT, residents: {} };
  for (const row of payload.residents) {
    existing.residents[row.residentId] = {
      supersededOpenArtUploadIds: row.supersededOpenArtUploadIds ?? [],
      workLook: row.workLook,
      bodyGeometry: row.bodyGeometry,
    };
  }
  fs.writeFileSync(REGISTRY, JSON.stringify(existing, null, 2));
  console.log('Wrote', REGISTRY);
} else {
  console.error('Usage: source-binding-upload.mjs upload-plan [SW-001]|write-registry \'{"residents":[...]}\'');
  process.exit(1);
}
