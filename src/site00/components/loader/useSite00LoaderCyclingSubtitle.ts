import { useEffect, useMemo, useState } from 'react';
import type { Site00LoaderStage } from './site00LoaderConfig';

/** Gray subtitle rotation interval while the loader is active. */
export const LOADER_SUBTITLE_CYCLE_MS = 2000;

/**
 * Cycles through route stage subtitles on a fixed interval — the gray line
 * below the black header (e.g. ASSEMBLING ORIGIN).
 */
export function useSite00LoaderCyclingSubtitle(
  stages: Site00LoaderStage[],
  enabled: boolean,
  intervalMs: number = LOADER_SUBTITLE_CYCLE_MS,
): string {
  const subtitles = useMemo(
    () => stages.map((stage) => stage.subtitle).filter((line) => line.length > 0),
    [stages],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [subtitles]);

  useEffect(() => {
    if (!enabled || subtitles.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % subtitles.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [enabled, intervalMs, subtitles]);

  if (subtitles.length === 0) return '';
  return subtitles[Math.min(index, subtitles.length - 1)] ?? '';
}
