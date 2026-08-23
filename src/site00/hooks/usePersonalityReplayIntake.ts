/**
 * Shadow personality replay intake — autosave to validation record, not canonical profile.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { site00ProjectsApi } from '../services/site00ProjectsApi';

const LOCAL_KEY_PREFIX = 'site00-personality-replay:';

export type PersonalityReplayIntakeState = {
  projectSlug: string;
  replayId: string | null;
  answers: Record<string, string | string[]>;
  completedSteps: string[];
  status: string | null;
  saveState: 'idle' | 'saving' | 'saved' | 'error';
  saveError: string | null;
  lastSavedAt: string | null;
  bootstrapping: boolean;
  bootstrapError: string | null;
};

function localKey(projectSlug: string): string {
  return `${LOCAL_KEY_PREFIX}${projectSlug}`;
}

function readLocal(projectSlug: string): Partial<PersonalityReplayIntakeState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(localKey(projectSlug));
    return raw ? (JSON.parse(raw) as Partial<PersonalityReplayIntakeState>) : null;
  } catch {
    return null;
  }
}

function writeLocal(projectSlug: string, data: Partial<PersonalityReplayIntakeState>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(localKey(projectSlug), JSON.stringify(data));
}

export function usePersonalityReplayIntake(projectSlug: string): PersonalityReplayIntakeState & {
  setAnswer: (stepId: string, value: string | string[]) => void;
  markStepComplete: (stepId: string) => void;
  submitIntake: () => Promise<void>;
  reload: () => Promise<void>;
  bootstrap: () => Promise<string | null>;
} {
  const local = useMemo(() => readLocal(projectSlug), [projectSlug]);
  const [replayId, setReplayId] = useState<string | null>(local?.replayId ?? null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(local?.answers ?? {});
  const [completedSteps, setCompletedSteps] = useState<string[]>(local?.completedSteps ?? []);
  const [status, setStatus] = useState<string | null>(local?.status ?? null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(local?.lastSavedAt ?? null);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const persistLocal = useCallback(
    (next: Partial<PersonalityReplayIntakeState>) => {
      writeLocal(projectSlug, {
        projectSlug,
        replayId: next.replayId ?? replayId,
        answers: next.answers ?? answers,
        completedSteps: next.completedSteps ?? completedSteps,
        status: next.status ?? status,
        lastSavedAt: next.lastSavedAt ?? lastSavedAt,
      });
    },
    [projectSlug, replayId, answers, completedSteps, status, lastSavedAt],
  );

  const reload = useCallback(async () => {
    if (!replayId) return;
    const result = await site00ProjectsApi.personalityReplayGet(projectSlug, replayId);
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
  }, [projectSlug, replayId, persistLocal]);

  const bootstrap = useCallback(async (): Promise<string | null> => {
    setBootstrapping(true);
    setBootstrapError(null);
    try {
      const result = await site00ProjectsApi.personalityReplayBootstrap(projectSlug);
      setReplayId(result.replay.replayId);
      setAnswers(result.replay.rawPersonalityAnswers ?? {});
      setStatus(result.replay.status);
      persistLocal({
        replayId: result.replay.replayId,
        answers: result.replay.rawPersonalityAnswers ?? {},
        status: result.replay.status,
      });
      return result.resumeStepId;
    } catch (err) {
      setBootstrapError(err instanceof Error ? err.message : 'Unable to start personality intake');
      return null;
    } finally {
      setBootstrapping(false);
    }
  }, [persistLocal, projectSlug]);

  useEffect(() => {
    if (replayId) {
      void reload().catch(() => undefined);
    }
  }, [replayId, reload]);

  const saveToServer = useCallback(
    async (nextAnswers: Record<string, string | string[]>, nextCompleted: string[]) => {
      if (!replayId) return;
      setSaveState('saving');
      setSaveError(null);
      try {
        const result = await site00ProjectsApi.personalityReplaySave(projectSlug, replayId, {
          answers: nextAnswers,
          completedSteps: nextCompleted,
        });
        const ts = new Date().toISOString();
        setStatus(result.replay.status);
        setLastSavedAt(ts);
        setSaveState('saved');
        persistLocal({
          answers: nextAnswers,
          completedSteps: nextCompleted,
          status: result.replay.status,
          lastSavedAt: ts,
        });
      } catch (err) {
        setSaveState('error');
        setSaveError(err instanceof Error ? err.message : 'Save failed');
      }
    },
    [projectSlug, replayId, persistLocal],
  );

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
    if (!replayId) return;
    await site00ProjectsApi.personalityReplayComplete(projectSlug, replayId);
    await reload();
  }, [projectSlug, replayId, reload]);

  return {
    projectSlug,
    replayId,
    answers,
    completedSteps,
    status,
    saveState,
    saveError,
    lastSavedAt,
    bootstrapping,
    bootstrapError,
    setAnswer,
    markStepComplete,
    submitIntake,
    reload,
    bootstrap,
  };
}
