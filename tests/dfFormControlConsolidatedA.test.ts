/**
 * Consolidated form-control Phases 3–5: System B, contact phone, server completion gate.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, beforeEach } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import {
  completeIntake,
  createArtifactForLead,
  updateIntake,
} from '../api/_lib/digitalFoundation/service.js';
import {
  CONTACT_PHONE_INVALID,
  CONTACT_PHONE_MISSING,
  validateContactPhoneForCompletion,
} from '../shared/site00-digital-foundation/contactPhone.js';
import { DfCheckMark } from '../src/site00/foundation-client/components';
import { validateBusinessInfo } from '../src/site00/foundation-client/model';
import { completeIntakeWithContactPhone, DF_TEST_CONTACT_PHONE } from './helpers/dfTestContactPhone.js';

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);

describe('contact phone validation', () => {
  it('accepts valid US and international numbers', () => {
    expect(validateContactPhoneForCompletion('901-555-0100').ok).toBe(true);
    expect(validateContactPhoneForCompletion('+44 20 7946 0958').ok).toBe(true);
  });

  it('returns approved client messages', () => {
    expect(validateBusinessInfo({ ...blank(), phone: '' }).phone).toBe(CONTACT_PHONE_MISSING);
    expect(validateBusinessInfo({ ...blank(), phone: '12' }).phone).toBe(CONTACT_PHONE_INVALID);
  });
});

describe('server completion gate', () => {
  beforeEach(() => resetDigitalFoundationMemoryStore());

  it('blocks completeIntake without phone', () => {
    const a = createArtifactForLead({ business_name: 'No Phone LLC' });
    expect(() => completeIntake(a.artifact_id)).toThrow(/CONTACT_PHONE_REQUIRED/);
  });

  it('allows completeIntake with valid phone', () => {
    const a = createArtifactForLead({ business_name: 'Phone LLC' });
    expect(completeIntakeWithContactPhone(a.artifact_id).intake_state).toBe('COMPLETE');
  });

  it('grandfathers already-complete artifacts without re-validation', () => {
    const a = createArtifactForLead({ business_name: 'Legacy LLC' });
    updateIntake(a.artifact_id, { phone: DF_TEST_CONTACT_PHONE }, false);
    completeIntakeWithContactPhone(a.artifact_id);
    updateIntake(a.artifact_id, { phone: '' }, false);
    expect(completeIntake(a.artifact_id).intake_state).toBe('COMPLETE');
  });
});

describe('System B checkbox mark', () => {
  it('renders checked optional mark without locked class', () => {
    const m = html(createElement(DfCheckMark, { checked: true }));
    expect(m).toContain('df-check--on');
    expect(m).not.toContain('df-check--locked');
  });

  it('renders locked included mark', () => {
    const m = html(createElement(DfCheckMark, { checked: true, locked: true }));
    expect(m).toContain('df-check--locked');
  });
});

function blank() {
  return {
    business_name: '',
    industry: '',
    contact_name: '',
    current_email: '',
    phone: '',
    existing_domain: '',
    existing_registrar: '',
    existing_email_provider: '',
    team_size: 1,
    domainPath: null as const,
    needs: [] as const,
  };
}
