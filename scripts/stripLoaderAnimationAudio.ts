import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  SITE00_LOADER_ENVIRONMENT_ANIMATION_DESKTOP_REMOTE,
  SITE00_LOADER_ENVIRONMENT_ANIMATION_MOBILE_REMOTE,
} from '../src/site00/components/loader/site00LoaderMedia';

const BUCKET = process.env.STUDIO_ASSETS_BUCKET?.trim() || 'live-preview';

const ASSETS = [
  { label: 'mobile', remote: SITE00_LOADER_ENVIRONMENT_ANIMATION_MOBILE_REMOTE },
  { label: 'desktop', remote: SITE00_LOADER_ENVIRONMENT_ANIMATION_DESKTOP_REMOTE },
] as const;

function stripAudioFromMp4(input: Buffer): Buffer {
  const dir = mkdtempSync(join(tmpdir(), 'site00-loader-strip-'));
  const inPath = join(dir, 'in.mp4');
  const outPath = join(dir, 'out.mp4');
  try {
    writeFileSync(inPath, input);
    execSync(`ffmpeg -y -i ${JSON.stringify(inPath)} -an -c:v copy ${JSON.stringify(outPath)}`, {
      stdio: 'pipe',
    });
    return readFileSync(outPath);
  } finally {
    try {
      unlinkSync(inPath);
      unlinkSync(outPath);
    } catch {
      /* ignore */
    }
  }
}

function hasAudioTrack(buffer: Buffer): boolean {
  const dir = mkdtempSync(join(tmpdir(), 'site00-loader-probe-'));
  const path = join(dir, 'probe.mp4');
  try {
    writeFileSync(path, buffer);
    const raw = execSync(`ffprobe -v quiet -print_format json -show_streams ${JSON.stringify(path)}`, {
      encoding: 'utf8',
    });
    const parsed = JSON.parse(raw) as { streams?: Array<{ codec_type?: string }> };
    return parsed.streams?.some((stream) => stream.codec_type === 'audio') ?? false;
  } finally {
    try {
      unlinkSync(path);
    } catch {
      /* ignore */
    }
  }
}

async function main(): Promise<void> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing VITE_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  for (const asset of ASSETS) {
    const storagePath = `site00/${asset.remote}`;
    const publicUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${BUCKET}/${storagePath}`;
    console.log(`Processing ${asset.label}: ${publicUrl}`);

    const res = await fetch(publicUrl);
    if (!res.ok) throw new Error(`Download failed (${res.status}) for ${asset.label}`);
    const source = Buffer.from(await res.arrayBuffer());

    if (!hasAudioTrack(source)) {
      console.log(`  ${asset.label}: already silent (no audio track)`);
      continue;
    }

    const silent = stripAudioFromMp4(source);
    if (hasAudioTrack(silent)) {
      throw new Error(`Audio strip failed for ${asset.label}`);
    }

    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, silent, {
      contentType: 'video/mp4',
      upsert: true,
      cacheControl: '3600',
    });
    if (error) throw new Error(`Upload failed for ${asset.label}: ${error.message}`);

    console.log(`  ${asset.label}: uploaded silent MP4 (${silent.length} bytes)`);
  }

  console.log('Loader animation audio strip complete.');
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
