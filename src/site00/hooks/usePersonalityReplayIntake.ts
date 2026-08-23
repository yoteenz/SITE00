/**
 * Shadow personality replay intake — autosave to validation record, not canonical profile.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { site00EvolveApi } from '../admin/services/evolveApi';

const LOCAL_KEY_PREFIX = 'site00-personality-replay:';

export type PersonalityReplayIntakeState = {
  replayId: string;
  answers: Record<string, string | string[]>;
  completedSteps: string[];
  status: string | null;
  saveState: 'idle' | 'saving' | 'saved' | 'error';
  saveError: string | null;
  lastSavedAt: string | null;
};

function localKey(replayId: string): string {
  return `${LOCAL_KEY_PREFIX}${replayId}`;
}

function readLocal(replayId: string): Partial<PersonalityReplayIntakeState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(localKey(replayId));
    return raw ? (JSON.parse(raw) as Partial<PersonalityReplayIntakeState>) : null;
  } catch {
    return null;
  }
}

function writeLocal(replayId: string, data: Partial<PersonalityReplayIntakeState>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(localKey(replayId), JSON.stringify(data));
}

export function usePersonalityReplayIntake(replayId: string): PersonalityReplayIntakeState & {
  setAnswer: (stepId: string, value: string | string[]) => void;
  markStepComplete: (stepId: string) => void;
  submitIntake: () => Promise<void>;
  reload: () => Promise<void>;
} {
  const local = useMemo(() => readLocal(replayId), [replayId]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(local?.answers ?? {});
  const [completedSteps, setCompletedSteps] = useState<string[]>(local?.completedSteps ?? []);
  const [status, setStatus] = useState<string | null>(local?.status ?? null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(local?.lastSavedAt ?? null);

  const persistLocal = useCallback(
    (next: Partial<PersonalityReplayIntakeState>) => {
      writeLocal(replayId, {
        replayId,
        answers: next.answers ?? answers,
        completedSteps: next.completedSteps ?? completedSteps,
        status: next.status ?? status,
        lastSavedAt: next.lastSavedAt ?? lastSavedAt,
      });
    },
    [replayId, answers, completedSteps, status, lastSavedAt],
  );

  const saveToServer = useCallback(
    async (nextAnswers: Record<string, string | string[]>, nextCompleted: string[]) => {
      setSaveState('saving');
      setSaveError(null);
      try {
        const result = await site00EvolveApi.personalityReplaySaveAnswers('ndxbook', replayId, {
          answers: nextAnswers,
          completedSteps: nextCompleted,
        });
        const replay = result.replay as {
          status: string;
        };
        const ts = new Date().toISOString();
        setStatus(replay.status);
        setLastSavedAt(ts);
        setSaveState('saved');
        persistLocal({ answers: nextAnswers, completedSteps: nextCompleted, status: replay.status, lastSavedAt: ts });
      } catch (err) {
        setSaveState('error');
        setSaveError(err instanceof Error ? err.message : 'Save failed');
      }
    },
    [replayId, persistLocal],
  );

  const reload = useCallback(async () => {
    const result = await site00EvolveApi.personalityReplayGet('ndxbook', replayId);
    const replay = result.replay as {
      rawPersonalityAnswers?: Record<string, string | string[]>;
      personalityCompletedSteps?: string[];
      status?: string;
    };
    setAnswers(replay.rawPersonalityAnswers ?? {});
    setCompletedSteps(replay.personalityCompletedSteps ?? []);
    setStatus(replay.status ?? null);
    persistLocal({
      answers: replay.rawPersonalityAnswers ?? {},
      completedSteps: replay.personalityCompletedSteps ?? [],
      status: replay.status ?? null,
    });
  }, [replayId, persistLocal]);

  useEffect(() => {
    void reload().catch(() => undefined);
  }, [reload]);

  const setAnswer = useCallback(
    (stepId: string, value: string | string[]) => {
      setAnswers((prev) => {
        const next = { ...prev, [stepId]: value };
        void saveToServer(next, completedSteps);
        return next;
      });
    },
    [completedSteps, saveToServer],
  );

  const markStepComplete = useCallback(
    (stepId: string) => {
      setCompletedSteps((prev) => {
        const next = prev.includes(stepId) ? prev : [...prev, stepId];
        void saveToServer(answers, next);
        return next;
      });
    },
    [answers, saveToServer],
  );

  const submitIntake = useCallback(async () => {
    await site00EvolveApi.personalityReplayCompleteIntake('ndxbook', replayId);
    await reload();
  }, [replayId, reload]);

  return {
    replayId,
    answers,
    completedSteps,
    status,
    saveState,
    saveError,
    lastSavedAt,
    setAnswer,
    markStepComplete,
    submitIntake,
    reload,
  };
}
