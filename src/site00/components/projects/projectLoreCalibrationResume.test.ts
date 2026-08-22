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
import { buildNdxbookReconciledProfile } from '../../../../api/_lib/site00BrandLore/ndxbookReconciliation.js';

const SESSION_STEP_IDS = ['feeling', 'role', 'enemy'];

const STEPS: LoreQuestionStep[] = [
  { id: 'feeling', domain: 'EMOTIONAL_FIRST_IMPRESSION', title: 'FEELING', type: 'multi', required: false, skippable: true },
  { id: 'role', domain: 'AUDIENCE_RELATIONSHIP', title: 'ROLE', type: 'multi', required: false, skippable: true },
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
    expect(resolveProjectLoreCalibrationStepIndex(STEPS, { feeling: ['curious'] })).toBe(1);
    expect(
      resolveProjectLoreCalibrationStepIndex(STEPS, { feeling: ['curious'], role: ['guide'] }),
    ).toBe(2);
  });

  it('treats skip as answered and advances', () => {
    expect(resolveProjectLoreCalibrationStepIndex(STEPS, { feeling: LORE_SKIP_VALUE })).toBe(1);
  });

  it('lands on last step when every step is saved', () => {
    expect(
      resolveProjectLoreCalibrationStepIndex(STEPS, {
        feeling: ['curious'],
        role: ['guide'],
        enemy: ['boring'],
      }),
    ).toBe(2);
  });
});

describe('NDXBOOK calibration manifest', () => {
  it('requires eight lore steps after content-brain reconciliation', () => {
    const profile = buildNdxbookReconciledProfile('org-ndxbook');
    const steps = missingDomainsToLoreSteps(profile.readinessMissingDomains);
    expect(steps).toHaveLength(8);
    expect(steps).toEqual([
      'feeling',
      'role',
      'enemy',
      'world',
      'objects',
      'lineage',
      'now',
      'contradiction',
    ]);
  });
});

describe('resolveCalibrationSessionStepIds', () => {
  it('reconstructs session steps from saved answers when no frozen session exists', () => {
    const ids = resolveCalibrationSessionStepIds(
      'ndxbook',
      ['AUDIENCE_RELATIONSHIP'],
      { feeling: ['curious'], world: 'an index of everything' },
    );
    expect(ids).toEqual(['feeling', 'role', 'world']);
  });

  it('expands a stale 6-step frozen session back to the full 8-step NDXBOOK scope', () => {
    mockLocalStorage();

    const sixStepSession = ['feeling', 'role', 'enemy', 'world', 'objects', 'contradiction'];
    writeProjectLoreCalibrationResume('ndxbook', {
      stepIds: sixStepSession,
      stepId: 'contradiction',
      answers: {
        feeling: ['curious'],
        role: ['guide'],
        world: 'an index',
        enemy: ['boring'],
      },
    });

    const merged = resolveCalibrationSessionStepIds(
      'ndxbook',
      ['REFERENCE_CONTEXT'],
      {
        feeling: ['curious'],
        role: ['guide'],
        world: 'an index',
        enemy: ['boring'],
        objects: ['tools'],
      },
    );

    expect(merged).toEqual([
      'feeling',
      'role',
      'enemy',
      'world',
      'objects',
      'lineage',
      'now',
      'contradiction',
    ]);
    expect(readProjectLoreCalibrationResume('ndxbook')?.stepIds).toHaveLength(8);

    vi.unstubAllGlobals();
  });

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
      { feeling: ['curious'] },
      'ndxbook',
    );
    expect(result.stepIndex).toBe(1);
    expect(result.answers).toEqual({ feeling: ['curious'] });
  });

  it('restores in-progress draft from localStorage on refresh', () => {
    mockLocalStorage();

    writeProjectLoreCalibrationResume('ndxbook', {
      stepIds: SESSION_STEP_IDS,
      stepId: 'role',
      answers: { feeling: ['curious'], role: ['guide', 'teacher'] },
    });

    const result = resolveProjectLoreCalibrationResume(STEPS, { feeling: ['curious'] }, 'ndxbook');
    expect(result.stepIndex).toBe(1);
    expect(result.answers.role).toEqual(['guide', 'teacher']);

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
