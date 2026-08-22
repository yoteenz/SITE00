import { describe, expect, it, vi } from 'vitest';
import { LORE_SKIP_VALUE } from '../../../../shared/site00-brand-lore/adaptivity';
import { resolveProjectLoreCalibrationStepIndex } from '../../../../shared/site00-brand-lore/adaptivity';
import type { LoreQuestionStep } from '../../../../shared/site00-brand-lore/idnty-lore-questions';
import { missingDomainsToLoreSteps } from '../../../../shared/site00-brand-lore/readiness';
import {
  bootstrapCalibrationSession,
  readProjectLoreCalibrationResume,
  resolveCalibrationSessionStepIds,
  resolveProjectLoreCalibrationResume,
  writeProjectLoreCalibrationResume,
} from './projectLoreCalibrationResume';

const SESSION_STEP_IDS = ['role', 'feeling', 'enemy'];

const STEPS: LoreQuestionStep[] = [
  { id: 'role', domain: 'AUDIENCE_RELATIONSHIP', title: 'ROLE', type: 'multi', required: false, skippable: true },
  { id: 'feeling', domain: 'EMOTIONAL_FIRST_IMPRESSION', title: 'FEELING', type: 'multi', required: false, skippable: true },
  { id: 'enemy', domain: 'CULTURAL_OPPOSITION', title: 'ENEMY', type: 'multi', required: false, skippable: true },
];

function mockLocalStorage() {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
  });
  return storage;
}

describe('missingDomainsToLoreSteps', () => {
  it('returns steps in canonical lore flow order', () => {
    const steps = missingDomainsToLoreSteps([
      'REFERENCE_CONTEXT',
      'EMOTIONAL_PROMISE',
      'AUDIENCE_RELATIONSHIP',
    ]);
    expect(steps).toEqual(['feeling', 'role', 'objects', 'lineage', 'now']);
  });
});

describe('resolveProjectLoreCalibrationStepIndex', () => {
  it('starts at first step when nothing saved', () => {
    expect(resolveProjectLoreCalibrationStepIndex(STEPS, {})).toBe(0);
  });

  it('resumes at first unanswered step after server saves', () => {
    expect(resolveProjectLoreCalibrationStepIndex(STEPS, { role: ['guide'] })).toBe(1);
    expect(
      resolveProjectLoreCalibrationStepIndex(STEPS, { role: ['guide'], feeling: ['curious'] }),
    ).toBe(2);
  });

  it('treats skip as answered and advances', () => {
    expect(resolveProjectLoreCalibrationStepIndex(STEPS, { role: LORE_SKIP_VALUE })).toBe(1);
  });

  it('lands on last step when every step is saved', () => {
    expect(
      resolveProjectLoreCalibrationStepIndex(STEPS, {
        role: ['guide'],
        feeling: ['curious'],
        enemy: ['boring'],
      }),
    ).toBe(2);
  });
});

describe('resolveCalibrationSessionStepIds', () => {
  it('freezes the initial step list for the session', () => {
    mockLocalStorage();
    bootstrapCalibrationSession('ndxbook', SESSION_STEP_IDS, {});

    const shrunkMissing = missingDomainsToLoreSteps(['AUDIENCE_RELATIONSHIP']);
    expect(shrunkMissing).toEqual(['role']);
    expect(resolveCalibrationSessionStepIds('ndxbook', ['AUDIENCE_RELATIONSHIP'])).toEqual(
      SESSION_STEP_IDS,
    );

    vi.unstubAllGlobals();
  });
});

describe('resolveProjectLoreCalibrationResume', () => {
  it('uses server-only resume when no local draft exists', () => {
    const result = resolveProjectLoreCalibrationResume(
      STEPS,
      { role: ['guide'] },
      'ndxbook',
    );
    expect(result.stepIndex).toBe(1);
    expect(result.answers).toEqual({ role: ['guide'] });
  });

  it('restores in-progress draft from localStorage on refresh', () => {
    mockLocalStorage();

    writeProjectLoreCalibrationResume('ndxbook', {
      stepIds: SESSION_STEP_IDS,
      stepId: 'feeling',
      answers: { role: ['guide'], feeling: ['curious', 'calm'] },
    });

    const result = resolveProjectLoreCalibrationResume(STEPS, { role: ['guide'] }, 'ndxbook');
    expect(result.stepIndex).toBe(1);
    expect(result.answers.feeling).toEqual(['curious', 'calm']);

    vi.unstubAllGlobals();
  });

  it('keeps full questionnaire progress after domains shrink on the server', () => {
    mockLocalStorage();

    writeProjectLoreCalibrationResume('ndxbook', {
      stepIds: SESSION_STEP_IDS,
      stepId: 'enemy',
      answers: {
        role: ['guide'],
        feeling: ['curious'],
        enemy: ['boring'],
      },
    });

    const shrunkSteps = STEPS.filter((step) => step.id === 'role');
    const result = resolveProjectLoreCalibrationResume(
      shrunkSteps,
      { role: ['guide'], feeling: ['curious'] },
      'ndxbook',
    );

    expect(result.stepIndex).toBe(2);
    expect(readProjectLoreCalibrationResume('ndxbook')?.stepIds).toEqual(SESSION_STEP_IDS);

    vi.unstubAllGlobals();
  });
});
