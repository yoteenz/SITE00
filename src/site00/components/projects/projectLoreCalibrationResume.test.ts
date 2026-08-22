import { describe, expect, it, vi } from 'vitest';
import { LORE_SKIP_VALUE } from '../../../../shared/site00-brand-lore/adaptivity';
import { resolveProjectLoreCalibrationStepIndex } from '../../../../shared/site00-brand-lore/adaptivity';
import type { LoreQuestionStep } from '../../../../shared/site00-brand-lore/idnty-lore-questions';
import {
  resolveProjectLoreCalibrationResume,
  writeProjectLoreCalibrationResume,
} from './projectLoreCalibrationResume';

const STEPS: LoreQuestionStep[] = [
  { id: 'role', domain: 'AUDIENCE_RELATIONSHIP', title: 'ROLE', type: 'multi', required: false, skippable: true },
  { id: 'feeling', domain: 'EMOTIONAL_FIRST_IMPRESSION', title: 'FEELING', type: 'multi', required: false, skippable: true },
  { id: 'enemy', domain: 'CULTURAL_OPPOSITION', title: 'ENEMY', type: 'multi', required: false, skippable: true },
];

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

    writeProjectLoreCalibrationResume('ndxbook', {
      stepId: 'feeling',
      answers: { role: ['guide'], feeling: ['curious', 'calm'] },
    });

    const result = resolveProjectLoreCalibrationResume(STEPS, { role: ['guide'] }, 'ndxbook');
    expect(result.stepIndex).toBe(1);
    expect(result.answers.feeling).toEqual(['curious', 'calm']);

    vi.unstubAllGlobals();
  });
});
