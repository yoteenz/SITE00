import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IDNTY_ASSESSMENT_STORAGE_KEY,
  IDNTY_LEGACY_NEEDS_COHESION_SLUG,
  migrateLegacyNeedsCohesionStep,
  type IdntyAssessmentStateId,
  getIdntyAssessmentState,
} from '../config/idnty-assessment';
import { useIntakeSync } from './useIntakeSync';

export type IdntyStepAnswers = Record<string, string | string[]>;

export type IdntyAssessmentRecord = {
  identityState: IdntyAssessmentStateId | null;
  currentStep: string | null;
  completedSteps: string[];
  answers: Record<string, IdntyStepAnswers>;
  /** Brand World / Lore layer — shared across all identity states. */
  loreAnswers: Record<string, string | string[]>;
  loreCompletedSteps: string[];
  freeformNotes: string;
  submissionStatus: 'draft' | 'complete';
  updatedAt: string;
  startedAt: string;
};

const EMPTY: IdntyAssessmentRecord = {
  identityState: null,
  currentStep: null,
  completedSteps: [],
  answers: {},
  loreAnswers: {},
  loreCompletedSteps: [],
  freeformNotes: '',
  submissionStatus: 'draft',
  updatedAt: new Date().toISOString(),
  startedAt: new Date().toISOString(),
};

function migrateRecord(record: IdntyAssessmentRecord): IdntyAssessmentRecord {
  if ((record.identityState as string | null) !== IDNTY_LEGACY_NEEDS_COHESION_SLUG) return record;

  const legacyAnswers = record.answers[IDNTY_LEGACY_NEEDS_COHESION_SLUG] ?? {};
  const piecesAnswers = record.answers['some-pieces-exist'] ?? {};
  const migratedPiecesAnswers = {
    ...piecesAnswers,
    ...legacyAnswers,
    'cohesion-diagnostic':
      piecesAnswers['cohesion-diagnostic'] ??
      legacyAnswers['cohesion-diagnostic'] ??
      'mostly-cohesive',
  };

  const { [IDNTY_LEGACY_NEEDS_COHESION_SLUG]: _removed, ...restAnswers } = record.answers;

  return {
    ...record,
    identityState: 'some-pieces-exist',
    currentStep: migrateLegacyNeedsCohesionStep(record.currentStep),
    answers: {
      ...restAnswers,
      'some-pieces-exist': migratedPiecesAnswers,
    },
    completedSteps: record.completedSteps.map((key) =>
      key.startsWith(`${IDNTY_LEGACY_NEEDS_COHESION_SLUG}:`)
        ? key.replace(`${IDNTY_LEGACY_NEEDS_COHESION_SLUG}:`, 'some-pieces-exist:')
        : key,
    ),
  };
}

function writeRecord(record: IdntyAssessmentRecord) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(IDNTY_ASSESSMENT_STORAGE_KEY, JSON.stringify(record));
}

function readRecord(): IdntyAssessmentRecord {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = localStorage.getItem(IDNTY_ASSESSMENT_STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = { ...EMPTY, ...JSON.parse(raw) } as IdntyAssessmentRecord;
    const migrated = migrateRecord(parsed);
    if (migrated.identityState !== parsed.identityState) writeRecord(migrated);
    return migrated;
  } catch {
    return EMPTY;
  }
}

export function useIdntyAssessment() {
  const [record, setRecord] = useState<IdntyAssessmentRecord>(() => readRecord());
  const intakeSync = useIntakeSync('IDENTITY', 'site00-idnty');

  useEffect(() => {
    const refresh = () => setRecord(readRecord());
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const persist = useCallback((next: IdntyAssessmentRecord) => {
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    writeRecord(stamped);
    setRecord(stamped);
  }, []);

  const startState = useCallback(
    (stateId: IdntyAssessmentStateId, firstStep?: string | null) => {
      persist({
        ...readRecord(),
        identityState: stateId,
        currentStep: firstStep ?? null,
        startedAt: new Date().toISOString(),
        submissionStatus: 'draft',
      });
      void intakeSync.ensureStarted({
        domainLabel: stateId,
        sourceRoute: typeof window !== 'undefined' ? window.location.pathname : undefined,
      });
    },
    [persist, intakeSync],
  );

  const setStepAnswers = useCallback(
    (stateId: IdntyAssessmentStateId, stepId: string, answers: IdntyStepAnswers) => {
      const current = readRecord();
      const mergedForState = { ...(current.answers[stateId] ?? {}), ...answers };
      persist({
        ...current,
        identityState: stateId,
        currentStep: stepId,
        answers: {
          ...current.answers,
          [stateId]: mergedForState,
        },
      });
      intakeSync.autosave({ currentStep: stepId, draftPayload: { identityState: stateId, answers: mergedForState } });
    },
    [persist, intakeSync],
  );

  const markStepComplete = useCallback(
    (stateId: IdntyAssessmentStateId, stepId: string) => {
      const current = readRecord();
      const completed = new Set(current.completedSteps);
      completed.add(`${stateId}:${stepId}`);
      persist({
        ...current,
        completedSteps: Array.from(completed),
        currentStep: stepId,
      });
      intakeSync.autosave({ currentStep: stepId, draftPayload: { completedSteps: Array.from(completed) } });
    },
    [persist, intakeSync],
  );

  const setCurrentStep = useCallback(
    (stateId: IdntyAssessmentStateId, stepId: string | null) => {
      persist({ ...readRecord(), identityState: stateId, currentStep: stepId });
      intakeSync.autosave({ currentStep: stepId });
    },
    [persist, intakeSync],
  );

  const completeAssessment = useCallback(
    (stateId: IdntyAssessmentStateId) => {
      persist({ ...readRecord(), identityState: stateId, submissionStatus: 'complete', currentStep: 'complete' });
      void intakeSync.submit();
    },
    [persist, intakeSync],
  );

  const setLoreAnswers = useCallback(
    (stepId: string, value: string | string[]) => {
      const current = readRecord();
      const loreAnswers = { ...current.loreAnswers, [stepId]: value };
      persist({ ...current, loreAnswers, currentStep: `world:${stepId}` });
      intakeSync.autosave({
        currentStep: `world:${stepId}`,
        draftPayload: {
          identityState: current.identityState,
          answers: current.identityState ? current.answers[current.identityState] ?? {} : {},
          loreAnswers,
          loreCompletedSteps: current.loreCompletedSteps,
        },
      });
    },
    [persist, intakeSync],
  );

  const markLoreStepComplete = useCallback(
    (stepId: string) => {
      const current = readRecord();
      const loreCompletedSteps = Array.from(new Set([...current.loreCompletedSteps, stepId]));
      persist({ ...current, loreCompletedSteps, currentStep: `world:${stepId}` });
      intakeSync.autosave({
        currentStep: `world:${stepId}`,
        draftPayload: { loreCompletedSteps, loreAnswers: current.loreAnswers },
      });
    },
    [persist, intakeSync],
  );

  const getLoreAnswers = useCallback((): Record<string, string | string[]> => record.loreAnswers ?? {}, [record.loreAnswers]);

  const clearAssessment = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(IDNTY_ASSESSMENT_STORAGE_KEY);
    setRecord(EMPTY);
    intakeSync.reset();
  }, [intakeSync]);

  const getAnswersForState = useCallback(
    (stateId: IdntyAssessmentStateId): IdntyStepAnswers => record.answers[stateId] ?? {},
    [record.answers],
  );

  const resumeTarget = useMemo(() => {
    if (!record.identityState || record.submissionStatus === 'complete') return null;
    const config = getIdntyAssessmentState(record.identityState);
    if (!config) return null;
    if (record.currentStep && record.currentStep !== 'complete') {
      return `/idnty/${config.slug}/${record.currentStep}`;
    }
    return `/idnty/${config.slug}`;
  }, [record]);

  return {
    record,
    startState,
    setStepAnswers,
    markStepComplete,
    setCurrentStep,
    completeAssessment,
    clearAssessment,
    getAnswersForState,
    getLoreAnswers,
    setLoreAnswers,
    markLoreStepComplete,
    resumeTarget,
    hasResume: Boolean(resumeTarget),
    /** Canonical server persistence state — truthful save state for the UI (IX). */
    serverSaveState: intakeSync.saveState,
    serverLastSavedAt: intakeSync.lastSavedAt,
    serverSaveError: intakeSync.errorMessage,
    serverIntake: intakeSync.serverIntake,
    serverIntakeId: intakeSync.serverIntakeId,
    requestGuestAccess: intakeSync.requestGuestAccess,
  };
}
