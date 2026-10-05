#!/usr/bin/env node
/**
 * OpenArt MCP companion: prompt plan, record completions, download PNGs, update manifest + audit.
 * Generation submits happen via OpenArt MCP (openart_generate_image + openart_creation_wait).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const PACK = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION');
const MANIFEST_PATH = path.join(PACK, 'resident_fabrication_manifest.json');
const AUDIT_PATH = path.join(PACK, 'GENERATION_AUDIT.json');
const IDENTITY_REFS_PATH = path.join(PACK, 'openart_identity_references.json');
const PROJECT_ID = 'Q7IHYCEK3RPn2c1ConEG';
const MODEL = 'gpt-image-2-5-sunburst';
const CREDITS_PER_FRAME = 152;

const RESIDENT_PRIORITY = ['SW-001', 'SW-002', 'SW-003', 'SW-004', 'SW-005', 'SW-006', 'SW-007', 'SW-008'];

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return { version: 1, frames: [] };
  const raw = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  if (Array.isArray(raw)) return { version: 1, frames: raw };
  return raw;
}

function saveManifest(manifest) {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

function loadJson(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
}

function aspectForFrameNumber(n) {
  if (n <= 6) return '3:4';
  if (n === 13 || n === 16) return '4:3';
  return '9:16';
}

function initAudit() {
  const audit = {
    projectId: PROJECT_ID,
    model: MODEL,
    mode: 'image2image',
    creditsPerFrameEstimate: CREDITS_PER_FRAME,
    startedAt: new Date().toISOString(),
    completedAt: null,
    residents: {},
    failures: [],
    creditsUsedEstimate: 0,
    framesCompleted: 0,
    framesFailed: 0,
    shortfallNotes: [],
  };
  for (const id of RESIDENT_PRIORITY) {
    audit.residents[id] = { frames: {}, status: 'PENDING' };
  }
  saveJson(AUDIT_PATH, audit);
  return audit;
}

async function importPromptBuilder() {
  const { buildResidentGeometryPrompt } = await import(
    '../shared/site00-studio-world/resident-fabrication/geometryPrompts.ts'
  );
  const { RESIDENT_GEOMETRY_FRAMES, STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES } = await import(
    '../shared/site00-studio-world/resident-fabrication/residentGeometryFrames.ts'
  );
  return { buildResidentGeometryPrompt, RESIDENT_GEOMETRY_FRAMES, STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES };
}

async function plan({ residents = RESIDENT_PRIORITY, maxFrames } = {}) {
  const { buildResidentGeometryPrompt, RESIDENT_GEOMETRY_FRAMES, STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES } =
    await importPromptBuilder();
  const refs = loadJson(IDENTITY_REFS_PATH, { residents: {} });
  const jobs = [];
  for (const rid of residents) {
    const profile = STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES.find((p) => p.residentId === rid);
    if (!profile) continue;
    const visualRef = refs.residents?.[rid]?.visualReference;
    if (!visualRef) {
      console.error(`Missing visualReference for ${rid}`);
      continue;
    }
    for (const frame of RESIDENT_GEOMETRY_FRAMES) {
      jobs.push({
        residentId: rid,
        frameNumber: frame.frameNumber,
        frameId: frame.frameId,
        folder: frame.folder,
        fileSuffix: frame.fileSuffix,
        aspectRatio: aspectForFrameNumber(frame.frameNumber),
        prompt: buildResidentGeometryPrompt(profile, frame),
        visualReference: visualRef,
        relative_path: `${PACK.replace(`${ROOT}/`, '')}/${profile.folderName}/${frame.folder}/${profile.residentId}_${frame.fileSuffix}.png`,
      });
    }
  }
  const capped = maxFrames ? jobs.slice(0, maxFrames) : jobs;
  process.stdout.write(`${JSON.stringify(capped, null, 2)}\n`);
  return capped;
}

function download(url, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  execSync(`curl -fsSL "${url}" -o "${dest}"`, { stdio: 'inherit' });
}

function record(entry) {
  const {
    residentId,
    frameNumber,
    historyId,
    outputUrl,
    retryCount = 0,
    status = 'COMPLETED',
    error = null,
  } = entry;
  const manifest = loadManifest();
  const row = manifest.frames.find((r) => r.resident_id === residentId && r.frame_number === frameNumber);
  if (!row) throw new Error(`No manifest row ${residentId} f${frameNumber}`);
  const audit = loadJson(AUDIT_PATH, null) ?? initAudit();

  const rel = row.relative_path;
  const abs = path.join(ROOT, rel);

  if (status === 'COMPLETED' && outputUrl) {
    download(outputUrl, abs);
    row.openart_generation_id = historyId;
    row.openart_output_url = outputUrl;
    row.retry_count = retryCount;
    row.created_at = new Date().toISOString();
    row.approval_status = 'IN_REVIEW';
    audit.residents[residentId].frames[String(frameNumber)] = {
      historyId,
      outputUrl,
      retryCount,
      status: 'COMPLETED',
      relative_path: rel,
    };
    audit.framesCompleted += 1;
    audit.creditsUsedEstimate += CREDITS_PER_FRAME;
  } else {
    row.retry_count = retryCount;
    if (retryCount >= 2) row.approval_status = 'FOUNDER_REVIEW_REQUIRED';
    audit.residents[residentId].frames[String(frameNumber)] = {
      historyId,
      outputUrl,
      retryCount,
      status: status === 'FAILED' ? 'FAILED' : status,
      error,
    };
    audit.failures.push({ residentId, frameNumber, historyId, error, retryCount, at: new Date().toISOString() });
    audit.framesFailed += 1;
    if (retryCount >= 2) row.approval_status = 'FOUNDER_REVIEW_REQUIRED';
  }

  const done = Object.keys(audit.residents[residentId].frames).length;
  audit.residents[residentId].status = done >= 16 ? 'COMPLETE' : done > 0 ? 'PARTIAL' : 'PENDING';

  saveManifest(manifest);
  saveJson(AUDIT_PATH, audit);
  console.log('Recorded', residentId, 'frame', frameNumber, status);
}

function summarize() {
  const audit = loadJson(AUDIT_PATH, {});
  const manifest = loadManifest();
  const byResident = {};
  for (const r of manifest.frames) {
    byResident[r.resident_id] ??= { total: 0, done: 0 };
    byResident[r.resident_id].total += 1;
    if (r.openart_output_url) byResident[r.resident_id].done += 1;
  }
  console.log(JSON.stringify({ audit, byResident }, null, 2));
}

const cmd = process.argv[2];
if (cmd === 'init-audit') initAudit();
else if (cmd === 'plan') {
  const residents = process.argv[3] ? process.argv[3].split(',') : RESIDENT_PRIORITY;
  const maxFrames = process.argv[4] ? Number(process.argv[4]) : undefined;
  await plan({ residents, maxFrames });
} else if (cmd === 'record') {
  record(JSON.parse(process.argv[3]));
} else if (cmd === 'summarize') summarize();
else {
  console.error(`Usage: ${path.basename(process.argv[1])} init-audit|plan [SW-001,...] [maxFrames]|record '<json>'|summarize`);
  process.exit(1);
}
