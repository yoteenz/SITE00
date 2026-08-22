import { describe, expect, it } from 'vitest';
import {
  ALLOWED_INTAKE_STATUS_TRANSITIONS,
  canTransitionIntakeStatus,
  intakeReferencePrefix,
  isIntakeType,
  normalizeIntakeStatus,
} from './types.js';

describe('shared/site00-intakes/types — canonical intake status model', () => {
  it('normalizes legacy Builder/Identity status values to the canonical lifecycle', () => {
    expect(normalizeIntakeStatus('IN_PROGRESS')).toBe('ACTIVE');
    expect(normalizeIntakeStatus('REVIEWED')).toBe('IN_REVIEW');
    expect(normalizeIntakeStatus('COMPLETE')).toBe('SUBMITTED');
    expect(normalizeIntakeStatus('DRAFT')).toBe('DRAFT');
    expect(normalizeIntakeStatus('SUBMITTED')).toBe('SUBMITTED');
  });

  it('allows every canonical status to transition to itself (idempotent no-op)', () => {
    for (const status of Object.keys(ALLOWED_INTAKE_STATUS_TRANSITIONS) as Array<keyof typeof ALLOWED_INTAKE_STATUS_TRANSITIONS>) {
      expect(canTransitionIntakeStatus(status, status)).toBe(true);
    }
  });

  it('rejects illegal transitions server-side (e.g. ARCHIVED cannot resurrect to ACTIVE)', () => {
    expect(canTransitionIntakeStatus('ARCHIVED', 'ACTIVE')).toBe(false);
    expect(canTransitionIntakeStatus('CONVERTED', 'DRAFT')).toBe(false);
    expect(canTransitionIntakeStatus('SUBMITTED', 'DRAFT')).toBe(false);
  });

  it('allows the canonical forward lifecycle path', () => {
    expect(canTransitionIntakeStatus('DRAFT', 'AWAITING_EMAIL_VERIFICATION')).toBe(true);
    expect(canTransitionIntakeStatus('AWAITING_EMAIL_VERIFICATION', 'ACTIVE')).toBe(true);
    expect(canTransitionIntakeStatus('ACTIVE', 'SUBMITTED')).toBe(true);
    expect(canTransitionIntakeStatus('SUBMITTED', 'IN_REVIEW')).toBe(true);
    expect(canTransitionIntakeStatus('IN_REVIEW', 'CONVERTED')).toBe(true);
    expect(canTransitionIntakeStatus('CONVERTED', 'ARCHIVED')).toBe(true);
  });

  it('isIntakeType narrows only IDENTITY/BUILDER', () => {
    expect(isIntakeType('IDENTITY')).toBe(true);
    expect(isIntakeType('BUILDER')).toBe(true);
    expect(isIntakeType('EVOLVE')).toBe(false);
    expect(isIntakeType(undefined)).toBe(false);
  });

  it('Identity and Builder remain distinguishable via reference prefix', () => {
    expect(intakeReferencePrefix('IDENTITY')).toBe('IDN');
    expect(intakeReferencePrefix('BUILDER')).toBe('BLD');
  });
});
