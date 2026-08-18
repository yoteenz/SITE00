import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EVOLVE_ASSESSMENT_STORAGE_KEY,
  evolveAssessmentPath,
  type EvolveAssessmentRouteSlug,
} from '../config/evolve-assessment';
import { computeEvolveScopeAssessment } from '../config/evolve-assessment-scope';
import type { EvolvePathId } from '../config/evolve';
import type { EvolveScopeAssessment } from '../config/evolve-assessment-scope';

export type EvolveStepAnswers = Record<string, string | string[]>;

export type EvolveAssessmentRecord = {
  evolvePath: EvolvePathId | null;
  currentStep: string | null;
  completedSteps: string[];
  answers: Record<string, EvolveStepAnswers>;
  scopeAssessment: EvolveScopeAssessment | null;
  submissionStatus: 'draft' | 'complete';
  assessmentStatus: 'PENDING_ASSESSMENT' | 'IN_REVIEW' | 'COMPLETE';
  accessStatus: 'NOT_CONNECTED' | 'INVITATION_PENDING' | 'ACTION_REQUIRED' | 'CONNECTED';
  updatedAt: string;
  startedAt: string;
};

const EMPTY: EvolveAssessmentRecord = {
  evolvePath: null,
  currentStep: null,
  completedSteps: [],
  answers: {},
  scopeAssessment: null,
  submissionStatus: 'draft',
  assessmentStatus: 'PENDING_ASSESSMENT',
  accessStatus: 'NOT_CONNECTED',
  updatedAt: new Date().toISOString(),
  startedAt: new Date().toISOString(),
};

function readRecord(): EvolveAssessmentRecord {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = localStorage.getItem(EVOLVE_ASSESSMENT_STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) } as EvolveAssessmentRecord;
  } catch {
    return EMPTY;
  }
}

function writeRecord(record: EvolveAssessmentRecord) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EVOLVE_ASSESSMENT_STORAGE_KEY, JSON.stringify(record));
}

export function useEvolveAssessment() {
  const [record, setRecord] = useState<EvolveAssessmentRecord>(() => readRecord());

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === EVOLVE_ASSESSMENT_STORAGE_KEY) {
        setRecord(readRecord());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const persist = useCallback((next: EvolveAssessmentRecord) => {
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    writeRecord(stamped);
    setRecord(stamped);
  }, []);

  const startPath = useCallback(
    (pathId: EvolvePathId, stepId?: string) => {
      persist({
        ...readRecord(),
        evolvePath: pathId,
        currentStep: stepId ?? 'property',
        startedAt: readRecord().startedAt || new Date().toISOString(),
        submissionStatus: 'draft',
      });
    },
    [persist],
  );

  const setStepAnswers = useCallback(
    (pathId: EvolvePathId, stepId: string, answers: EvolveStepAnswers) => {
      const current = readRecord();
      persist({
        ...current,
        evolvePath: pathId,
        answers: {
          ...current.answers,
          [stepId]: answers,
        },
      });
    },
    [persist],
  );

  const markStepComplete = useCallback(
    (pathId: EvolvePathId, stepId: string) => {
      const current = readRecord();
      const completed = new Set(current.completedSteps);
      completed.add(`${pathId}:${stepId}`);
      persist({
        ...current,
        evolvePath: pathId,
        completedSteps: Array.from(completed),
        currentStep: stepId,
      });
    },
    [persist],
  );

  const getAnswersForPath = useCallback(
    (pathId: EvolvePathId): EvolveStepAnswers => {
      const merged: EvolveStepAnswers = {};
      const pathAnswers = record.answers;
      for (const [stepId, stepAnswers] of Object.entries(pathAnswers)) {
        void stepId;
        Object.assign(merged, stepAnswers);
      }
      void pathId;
      return merged;
    },
    [record.answers],
  );

  const getStepAnswers = useCallback(
    (stepId: string): EvolveStepAnswers => record.answers[stepId] ?? {},
    [record.answers],
  );

  const generateScope = useCallback(
    (pathId: EvolvePathId) => {
      const scope = computeEvolveScopeAssessment(pathId, record.answers);
      persist({ ...readRecord(), scopeAssessment: scope, evolvePath: pathId });
      return scope;
    },
    [persist, record.answers],
  );

  const completeIntake = useCallback(
    (pathId: EvolvePathId) => {
      const scope = computeEvolveScopeAssessment(pathId, readRecord().answers);
      persist({
        ...readRecord(),
        evolvePath: pathId,
        scopeAssessment: scope,
        submissionStatus: 'complete',
        assessmentStatus: 'PENDING_ASSESSMENT',
      });
    },
    [persist],
  );

  const hasResume = useMemo(
    () => record.submissionStatus === 'draft' && Boolean(record.evolvePath && record.currentStep),
    [record],
  );

  const resumeTarget = useMemo(() => {
    if (!record.evolvePath || !record.currentStep) return null;
    return evolveAssessmentPath(record.evolvePath as EvolveAssessmentRouteSlug, record.currentStep);
  }, [record]);

  return {
    record,
    hasResume,
    resumeTarget,
    startPath,
    setStepAnswers,
    markStepComplete,
    getAnswersForPath,
    getStepAnswers,
    generateScope,
    completeIntake,
  };
}
