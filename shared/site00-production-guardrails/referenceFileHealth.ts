import fs from 'node:fs';
import path from 'node:path';
import type { ReferenceFileHealth } from './types.js';

const SUPPORTED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export function checkReferenceFileHealth(absolutePath: string): ReferenceFileHealth {
  try {
    const stat = fs.statSync(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    const exists = stat.isFile();
    const nonZeroByte = exists && stat.size > 0;
    const supportedFormat = SUPPORTED_EXT.has(ext);
    let readable = false;
    if (exists && nonZeroByte) {
      const fd = fs.openSync(absolutePath, 'r');
      try {
        const buf = Buffer.alloc(8);
        readable = fs.readSync(fd, buf, 0, 8, 0) > 0;
      } finally {
        fs.closeSync(fd);
      }
    }
    const ok = exists && readable && supportedFormat && nonZeroByte;
    return { exists, readable, supportedFormat, nonZeroByte, ok };
  } catch {
    return { exists: false, readable: false, supportedFormat: false, nonZeroByte: false, ok: false };
  }
}

export function resolveRepoAbsolutePath(repoRoot: string, candidate: string): string {
  if (path.isAbsolute(candidate)) return candidate;
  return path.join(repoRoot, candidate);
}
