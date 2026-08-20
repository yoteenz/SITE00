import { useEffect, useState } from 'react';

export type AccessRecognitionPhase =
  | 'init'
  | 'lines'
  | 'credential'
  | 'recognized'
  | 'authorized'
  | 'ready';

const PHASE_MS: Record<AccessRecognitionPhase, number> = {
  init: 0,
  lines: 280,
  credential: 560,
  recognized: 840,
  authorized: 1120,
  ready: 1400,
};

export function useAccessRecognitionSequence(enabled: boolean) {
  const [phase, setPhase] = useState<AccessRecognitionPhase>('init');

  useEffect(() => {
    if (!enabled) {
      setPhase('ready');
      return;
    }

    setPhase('init');
    const timers = (Object.keys(PHASE_MS) as AccessRecognitionPhase[])
      .filter((p) => p !== 'init')
      .map((p) => window.setTimeout(() => setPhase(p), PHASE_MS[p]));

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [enabled]);

  return phase;
}
