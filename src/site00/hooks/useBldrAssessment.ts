import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BLDR_ASSESSMENT_STORAGE_KEY,
  type BldrAssessmentStateId,
  getBldrAssessmentState,
  bldrAssessmentPath,
} from '../config/bldr-assessment';
import { IDNTY_ASSESSMENT_STORAGE_KEY } from '../config/idnty-assessment';
import { computeBldrRecommendation } from '../config/bldr-assessment-recommendation';

export type BldrStepAnswers = Record<string, string | string[]>;

export type BldrAssessmentRecord = {
  buildClass: BldrAssessmentStateId | null;
  currentStep: string | null;
  completedSteps: string[];
  answers: Record<string, BldrStepAnswers>;
  recommendedBuildClass: BldrAssessmentStateId | null;
  recommendationReasons: string[];
  submissionStatus: 'draft' | 'complete';
  updatedAt: string;
  startedAt: string;
};

const EMPTY: BldrAssessmentRecord = {
  buildClass: null,
  currentStep: null,
  completedSteps: [],
  answers: {},
  recommendedBuildClass: null,
  recommendationReasons: [],
  submissionStatus: 'draft',
  updatedAt: new Date().toISOString(),
  startedAt: new Date().toISOString(),
};

function readRecord(): BldrAssessmentRecord {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = localStorage.getItem(BLDR_ASSESSMENT_STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) } as BldrAssessmentRecord;
  } catch {
    return EMPTY;
  }
}

function writeRecord(record: BldrAssessmentRecord) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BLDR_ASSESSMENT_STORAGE_KEY, JSON.stringify(record));
}

/** Map IDNTY project types → BLDR site type hints for prefill */
const IDNTY_TO_BLDR_SITE_TYPE: Record<string, string> = {
  site: 'business',
  ecommerce: 'ecommerce',
  portfolio: 'portfolio',
  booking: 'booking',
  membership: 'membership',
  'web-app': 'web-app',
};

function readIdntyPrefill(): BldrStepAnswers {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(IDNTY_ASSESSMENT_STORAGE_KEY);
    if (!raw) return {};
    const idnty = JSON.parse(raw) as { identityState?: string; answers?: Record<string, BldrStepAnswers> };
    if (!idnty.identityState || !idnty.answers) return {};

    const stateAnswers = idnty.answers[idnty.identityState] ?? {};
    const prefill: BldrStepAnswers = {};

    const project = stateAnswers.project;
    if (project) {
      const ids = Array.isArray(project) ? project : [project];
      const mapped = ids.map((id) => IDNTY_TO_BLDR_SITE_TYPE[id] ?? id).filter(Boolean);
      if (mapped.length) prefill.type = mapped[0] as string;
    }

    if (stateAnswers.audience && typeof stateAnswers.audience === 'string') {
      prefill.content = `IDNTY AUDIENCE: ${stateAnswers.audience}`;
    }
    if (stateAnswers.timeline) prefill.timeline = stateAnswers.timeline as string;
    if (stateAnswers.budget) prefill.budget = stateAnswers.budget as string;

    return prefill;
  } catch {
    return {};
  }
}

export function useBldrAssessment() {
  const [record, setRecord] = useState<BldrAssessmentRecord>(() => readRecord());

  useEffect(() => {
    const refresh = () => setRecord(readRecord());
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const persist = useCallback((next: BldrAssessmentRecord) => {
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    writeRecord(stamped);
    setRecord(stamped);
  }, []);

  const startClass = useCallback(
    (classId: BldrAssessmentStateId, firstStep?: string | null) => {
      const current = readRecord();
      const idntyPrefill = readIdntyPrefill();
      const existingAnswers = current.answers[classId] ?? {};
      const merged = { ...idntyPrefill, ...existingAnswers };

      persist({
        ...current,
        buildClass: classId,
        currentStep: firstStep ?? null,
        startedAt: current.startedAt || new Date().toISOString(),
        submissionStatus: 'draft',
        answers: {
          ...current.answers,
          [classId]: merged,
        },
      });
    },
    [persist],
  );

  const setStepAnswers = useCallback(
    (classId: BldrAssessmentStateId, stepId: string, answers: BldrStepAnswers) => {
      const current = readRecord();
      persist({
        ...current,
        buildClass: classId,
        currentStep: stepId,
        answers: {
          ...current.answers,
          [classId]: {
            ...(current.answers[classId] ?? {}),
            ...answers,
          },
        },
      });
    },
    [persist],
  );

  const markStepComplete = useCallback(
    (classId: BldrAssessmentStateId, stepId: string) => {
      const current = readRecord();
      const completed = new Set(current.completedSteps);
      completed.add(`${classId}:${stepId}`);
      persist({
        ...current,
        completedSteps: Array.from(completed),
        currentStep: stepId,
      });
    },
    [persist],
  );

  const setCurrentStep = useCallback(
    (classId: BldrAssessmentStateId, stepId: string | null) => {
      persist({ ...readRecord(), buildClass: classId, currentStep: stepId });
    },
    [persist],
  );

  const completeAssessment = useCallback(
    (classId: BldrAssessmentStateId) => {
      const current = readRecord();
      let recommendedBuildClass = current.recommendedBuildClass;
      let recommendationReasons = current.recommendationReasons;

      if (classId === 'not-sure') {
        const result = computeBldrRecommendation(current.answers['not-sure'] ?? {});
        recommendedBuildClass = result.recommended;
        recommendationReasons = result.reasons;
      }

      persist({
        ...current,
        buildClass: classId,
        submissionStatus: 'complete',
        currentStep: 'complete',
        recommendedBuildClass,
        recommendationReasons,
      });
    },
    [persist],
  );

  const clearAssessment = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(BLDR_ASSESSMENT_STORAGE_KEY);
    setRecord(EMPTY);
  }, []);

  const getAnswersForClass = useCallback(
    (classId: BldrAssessmentStateId): BldrStepAnswers => record.answers[classId] ?? {},
    [record.answers],
  );

  const resumeTarget = useMemo(() => {
    if (!record.buildClass || record.submissionStatus === 'complete') return null;
    const config = getBldrAssessmentState(record.buildClass);
    if (!config) return null;
    if (record.currentStep && record.currentStep !== 'complete') {
      return bldrAssessmentPath(config.slug, record.currentStep);
    }
    return bldrAssessmentPath(config.slug);
  }, [record]);

  return {
    record,
    startClass,
    setStepAnswers,
    markStepComplete,
    setCurrentStep,
    completeAssessment,
    clearAssessment,
    getAnswersForClass,
    resumeTarget,
    hasResume: Boolean(resumeTarget),
    idntyPrefillAvailable: Object.keys(readIdntyPrefill()).length > 0,
  };
}
