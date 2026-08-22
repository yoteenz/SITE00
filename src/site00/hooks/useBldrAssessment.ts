import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BLDR_ASSESSMENT_STORAGE_KEY,
  type BldrAssessmentStateId,
  getBldrAssessmentState,
  bldrAssessmentPath,
  bldrAssessmentReviewPath,
} from '../config/bldr-assessment';
import { bldrExperiencePath } from '../../../shared/site00-brand-lore/bldr-experience-questions';
import { IDNTY_ASSESSMENT_STORAGE_KEY } from '../config/idnty-assessment';
import { computeBldrRecommendation } from '../config/bldr-assessment-recommendation';
import { useIntakeSync } from './useIntakeSync';

export type BldrStepAnswers = Record<string, string | string[]>;

export type BldrAssessmentRecord = {
  buildClass: BldrAssessmentStateId | null;
  currentStep: string | null;
  completedSteps: string[];
  answers: Record<string, BldrStepAnswers>;
  experienceAnswers: Record<string, string | string[]>;
  experienceCompletedSteps: string[];
  /** Snapshot of Identity lore at Builder start — Builder does not re-ask these. */
  inheritedLoreSnapshot: Record<string, unknown> | null;
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
  experienceAnswers: {},
  experienceCompletedSteps: [],
  inheritedLoreSnapshot: null,
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

function readIdntyLoreSnapshot(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(IDNTY_ASSESSMENT_STORAGE_KEY);
    if (!raw) return null;
    const idnty = JSON.parse(raw) as { loreAnswers?: Record<string, string | string[]> };
    if (!idnty.loreAnswers || Object.keys(idnty.loreAnswers).length === 0) return null;
    return {
      emotionalPromise: idnty.loreAnswers.feeling,
      audienceRelationship: idnty.loreAnswers.role,
      brandBelief: idnty.loreAnswers.belief,
      culturalOpposition: idnty.loreAnswers.enemy,
      worldMetaphor: idnty.loreAnswers.world,
      creativeTensions: idnty.loreAnswers.contradiction,
      materialVocabulary: idnty.loreAnswers.objects,
      creativeAntiPatterns: idnty.loreAnswers['no-go'],
      socialSignal: idnty.loreAnswers.status,
    };
  } catch {
    return null;
  }
}

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
  const intakeSync = useIntakeSync('BUILDER', 'site00-bldr');

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
      const inheritedLoreSnapshot = readIdntyLoreSnapshot();
      const existingAnswers = current.answers[classId] ?? {};
      const merged = { ...idntyPrefill, ...existingAnswers };

      persist({
        ...current,
        buildClass: classId,
        currentStep: firstStep ?? null,
        startedAt: current.startedAt || new Date().toISOString(),
        submissionStatus: 'draft',
        inheritedLoreSnapshot,
        answers: {
          ...current.answers,
          [classId]: merged,
        },
      });
      void intakeSync.ensureStarted({
        domainLabel: classId,
        sourceRoute: typeof window !== 'undefined' ? window.location.pathname : undefined,
      });
      if (inheritedLoreSnapshot) {
        intakeSync.autosave({ draftPayload: { inheritedLoreSnapshot } });
      }
    },
    [persist, intakeSync],
  );

  const setStepAnswers = useCallback(
    (classId: BldrAssessmentStateId, stepId: string, answers: BldrStepAnswers) => {
      const current = readRecord();
      const mergedForClass = { ...(current.answers[classId] ?? {}), ...answers };
      persist({
        ...current,
        buildClass: classId,
        currentStep: stepId,
        answers: {
          ...current.answers,
          [classId]: mergedForClass,
        },
      });
      intakeSync.autosave({ currentStep: stepId, draftPayload: { buildClass: classId, answers: mergedForClass } });
    },
    [persist, intakeSync],
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
      intakeSync.autosave({ currentStep: stepId, draftPayload: { completedSteps: Array.from(completed) } });
    },
    [persist, intakeSync],
  );

  const setCurrentStep = useCallback(
    (classId: BldrAssessmentStateId, stepId: string | null) => {
      persist({ ...readRecord(), buildClass: classId, currentStep: stepId });
      intakeSync.autosave({ currentStep: stepId });
    },
    [persist, intakeSync],
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
      void intakeSync.submit();
    },
    [persist, intakeSync],
  );

  const setExperienceAnswers = useCallback(
    (stepId: string, value: string | string[]) => {
      const current = readRecord();
      const experienceAnswers = { ...current.experienceAnswers, [stepId]: value };
      persist({ ...current, experienceAnswers, currentStep: `experience:${stepId}` });
      intakeSync.autosave({
        currentStep: `experience:${stepId}`,
        draftPayload: {
          buildClass: current.buildClass,
          experienceAnswers,
          experienceCompletedSteps: current.experienceCompletedSteps,
          inheritedLoreSnapshot: current.inheritedLoreSnapshot,
        },
      });
    },
    [persist, intakeSync],
  );

  const markExperienceStepComplete = useCallback(
    (stepId: string) => {
      const current = readRecord();
      const experienceCompletedSteps = Array.from(new Set([...current.experienceCompletedSteps, stepId]));
      persist({ ...current, experienceCompletedSteps, currentStep: `experience:${stepId}` });
      intakeSync.autosave({
        currentStep: `experience:${stepId}`,
        draftPayload: { experienceCompletedSteps, experienceAnswers: current.experienceAnswers },
      });
    },
    [persist, intakeSync],
  );

  const clearAssessment = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(BLDR_ASSESSMENT_STORAGE_KEY);
    setRecord(EMPTY);
    intakeSync.reset();
  }, [intakeSync]);

  const getAnswersForClass = useCallback(
    (classId: BldrAssessmentStateId): BldrStepAnswers => record.answers[classId] ?? {},
    [record.answers],
  );

  const resumeTarget = useMemo(() => {
    if (!record.buildClass || record.submissionStatus === 'complete') return null;
    const config = getBldrAssessmentState(record.buildClass);
    if (!config) return null;
    if (record.currentStep?.startsWith('experience:')) {
      const experienceStepId = record.currentStep.slice('experience:'.length);
      // Resume the NEXT unanswered experience step, not the one already completed on save.
      return bldrExperiencePath(config.slug, experienceStepId);
    }
    if (record.currentStep === 'review') {
      return bldrAssessmentReviewPath(config.slug);
    }
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
    setExperienceAnswers,
    markExperienceStepComplete,
    inheritedLoreSnapshot: record.inheritedLoreSnapshot,
    resumeTarget,
    hasResume: Boolean(resumeTarget),
    idntyPrefillAvailable: Object.keys(readIdntyPrefill()).length > 0,
    /** Canonical server persistence state — truthful save state for the UI (IX). */
    serverSaveState: intakeSync.saveState,
    serverLastSavedAt: intakeSync.lastSavedAt,
    serverSaveError: intakeSync.errorMessage,
    serverIntake: intakeSync.serverIntake,
    serverIntakeId: intakeSync.serverIntakeId,
    requestGuestAccess: intakeSync.requestGuestAccess,
  };
}
