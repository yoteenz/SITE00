import type { TwinV4GoldenAuthority, TwinV4CanonicalViewport } from './twinV42Types.js';
import { runTwinV4GoldenDiffConvergenceLoop } from './runTwinV4GoldenDiffConvergenceLoop.js';

/** V4.2R1 — diff-driven mutation convergence loop (replaces ceremonial fixed iterations). */
export async function runTwinV4GoldenDiffLoop(input: {
  goldenAuthority: TwinV4GoldenAuthority;
  goldenPng: Buffer;
  viewport: TwinV4CanonicalViewport;
  baseUrl: string;
  projectId: string;
  artifactDir?: string;
  queryActualHash?: string;
  localStorageSeed?: Record<string, string>;
}) {
  return runTwinV4GoldenDiffConvergenceLoop(input);
}
