/** Master clock. Plans store integer frames; timecodes are derived, never authored. */

export type FrameRate = { fps: number; status: 'PROVISIONAL' | 'APPROVED'; basis: string };

/** Kai's Note outputs read back as 241 and 193 frames at 24 fps (10.041667 s, 8.041667 s). Delivery rate is still a founder decision. */
export const PROVISIONAL_FRAME_RATE: FrameRate = {
  fps: 24,
  status: 'PROVISIONAL',
  basis: "OpenArt Kling outputs in the Kai's Note record last 10.041667 s and 8.041667 s, i.e. 241 and 193 frames at 24 fps. Founder confirms the delivery frame rate.",
};

const pad = (n: number, w: number) => String(n).padStart(w, '0');

export function framesToMs(frames: number, fps: number): number {
  return Math.round((frames * 1000) / fps);
}

export function framesToSec(frames: number, fps: number): number {
  return Math.round((frames / fps) * 1000) / 1000;
}

/** HH:MM:SS.mmm, rounded to the nearest millisecond. */
export function framesToTimecode(frames: number, fps: number): string {
  if (!Number.isInteger(frames) || frames < 0) throw new Error(`frames must be a non-negative integer: ${frames}`);
  const ms = framesToMs(frames, fps);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(ms % 1000, 3)}`;
}

/** SMPTE non-drop HH:MM:SS:FF for editorial tools. */
export function framesToSmpte(frames: number, fps: number): string {
  const whole = Math.round(fps);
  const ff = frames % whole;
  const totalSec = Math.floor(frames / whole);
  return `${pad(Math.floor(totalSec / 3600), 2)}:${pad(Math.floor((totalSec % 3600) / 60), 2)}:${pad(totalSec % 60, 2)}:${pad(ff, 2)}`;
}

/** Parses HH:MM:SS.mmm. Throws when the time does not fall on a frame boundary. */
export function timecodeToFrames(tc: string, fps: number): number {
  const m = /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/.exec(tc);
  if (!m) throw new Error(`not HH:MM:SS.mmm: ${tc}`);
  const ms = Number(m[1]) * 3_600_000 + Number(m[2]) * 60_000 + Number(m[3]) * 1000 + Number(m[4]);
  const frames = Math.round((ms * fps) / 1000);
  if (framesToMs(frames, fps) !== ms) throw new Error(`${tc} is not on a frame boundary at ${fps} fps`);
  return frames;
}

export function secToFrames(sec: number, fps: number): number {
  return Math.round(sec * fps);
}

export type Span = { start: string; end: string; duration: string; startFrame: number; endFrame: number; frames: number; durationSec: number };

export function span(at: number, frames: number, fps: number): Span {
  return {
    start: framesToTimecode(at, fps),
    end: framesToTimecode(at + frames, fps),
    duration: framesToTimecode(frames, fps),
    startFrame: at,
    endFrame: at + frames,
    frames,
    durationSec: framesToSec(frames, fps),
  };
}
