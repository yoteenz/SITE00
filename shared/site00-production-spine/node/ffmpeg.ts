import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import type { ExtractedFrame, FrameExtractor, MediaProbe, MediaProbeResult } from '../frames.js';
import { SpineError } from '../types.js';

const run = promisify(execFile);

/** Bytes to a private temp file (never inside the repository), removed afterwards. */
async function withTemp<T>(bytes: Uint8Array, ext: string, fn: (file: string, dir: string) => Promise<T>): Promise<T> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'site00-spine-'));
  const file = path.join(dir, `in.${ext}`);
  fs.writeFileSync(file, bytes, { mode: 0o600 });
  try {
    return await fn(file, dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const EXT: Record<string, string> = { 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'image/png': 'png', 'image/jpeg': 'jpg' };

const rate = (r: string | undefined) => {
  const [n, d] = (r ?? '').split('/').map(Number);
  return n && d ? Math.round((n / d) * 1000) / 1000 : null;
};

export class FfprobeMediaProbe implements MediaProbe {
  constructor(private readonly bin = 'ffprobe') {}
  async probe(bytes: Uint8Array, mimeType: string): Promise<MediaProbeResult> {
    return withTemp(bytes, EXT[mimeType] ?? 'bin', async (file) => {
      const { stdout } = await run(this.bin, ['-v', 'error', '-count_frames', '-show_entries', 'format=duration:stream=codec_type,width,height,avg_frame_rate,nb_read_frames', '-of', 'json', file]);
      const j = JSON.parse(stdout) as { format?: { duration?: string }; streams?: Array<{ codec_type: string; width?: number; height?: number; avg_frame_rate?: string; nb_read_frames?: string }> };
      const v = j.streams?.find((s) => s.codec_type === 'video');
      const dur = Number(j.format?.duration);
      return {
        runtimeSec: Number.isFinite(dur) && dur > 0 ? Math.round(dur * 1000) / 1000 : 'UNKNOWN',
        width: v?.width ?? 'UNKNOWN',
        height: v?.height ?? 'UNKNOWN',
        frameRate: rate(v?.avg_frame_rate) ?? 'UNKNOWN',
        frameCount: v?.nb_read_frames ? Number(v.nb_read_frames) : 'UNKNOWN',
        audioPresent: j.streams ? j.streams.some((s) => s.codec_type === 'audio') : 'UNKNOWN',
      };
    });
  }
}

export class FfmpegFrameExtractor implements FrameExtractor {
  constructor(
    private readonly ffmpeg = 'ffmpeg',
    private readonly probe = new FfprobeMediaProbe(),
  ) {}
  async extract(bytes: Uint8Array, frameIndex: number): Promise<ExtractedFrame> {
    return withTemp(bytes, 'mp4', async (file, dir) => {
      const out = path.join(dir, 'frame.png');
      await run(this.ffmpeg, ['-v', 'error', '-i', file, '-vf', `select=eq(n\\,${frameIndex})`, '-frames:v', '1', '-fps_mode', 'passthrough', '-map_metadata', '-1', '-bitexact', out]);
      if (!fs.existsSync(out)) throw new SpineError('FRAME_INDEX', `frame ${frameIndex} is past the end of the take`);
      const png = new Uint8Array(fs.readFileSync(out));
      const p = await this.probe.probe(png, 'image/png');
      if (typeof p.width !== 'number' || typeof p.height !== 'number') throw new SpineError('FRAME_PROBE', 'extracted frame has no readable size');
      return { png, width: p.width, height: p.height };
    });
  }
}
