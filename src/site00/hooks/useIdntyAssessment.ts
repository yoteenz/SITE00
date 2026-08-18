import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IDNTY_ASSESSMENT_STORAGE_KEY,
  type IdntyAssessmentStateId,
  getIdntyAssessmentState,
} from '../config/idnty-assessment';

export type IdntyStepAnswers = Record<string, string | string[]>;

export type IdntyAssessmentRecord = {
  identityState: IdntyAssessmentStateId | null;
  currentStep: string | null;
  completedSteps: string[];
  answers: Record<string, IdntyStepAnswers>;
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
  freeformNotes: '',
  submissionStatus: 'draft',
  updatedAt: new Date().toISOString(),
  startedAt: new Date().toISOString(),
};

function readRecord(): IdntyAssessmentRecord {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = localStorage.getItem(IDNTY_ASSESSMENT_STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) } as IdntyAssessmentRecord;
  } catch {
    return EMPTY;
  }
}

function writeRecord(record: IdntyAssessmentRecord) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(IDNTY_ASSESSMENT_STORAGE_KEY, JSON.stringify(record));
}

export function useIdntyAssessment() {
  const [record, setRecord] = useState<IdntyAssessmentRecord>(() => readRecord());

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
    },
    [persist],
  );

  const setStepAnswers = useCallback(
    (stateId: IdntyAssessmentStateId, stepId: string, answers: IdntyStepAnswers) => {
      const current = readRecord();
      persist({
        ...current,
        identityState: stateId,
        currentStep: stepId,
        answers: {
          ...current.answers,
          [stateId]: {
            ...(current.answers[stateId] ?? {}),
            ...answers,
          },
        },
      });
    },
    [persist],
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
    },
    [persist],
  );

  const setCurrentStep = useCallback(
    (stateId: IdntyAssessmentStateId, stepId: string | null) => {
      persist({ ...readRecord(), identityState: stateId, currentStep: stepId });
    },
    [persist],
  );

  const completeAssessment = useCallback(
    (stateId: IdntyAssessmentStateId) => {
      persist({ ...readRecord(), identityState: stateId, submissionStatus: 'complete', currentStep: 'complete' });
    },
    [persist],
  );

  const clearAssessment = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(IDNTY_ASSESSMENT_STORAGE_KEY);
    setRecord(EMPTY);
  }, []);

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
    resumeTarget,
    hasResume: Boolean(resumeTarget),
  };
}
