import { describe, expect, it } from 'vitest';
import { dfInputDisplayUpper } from '../src/site00/foundation-client/dfInputText';
import { normalizeIntakeDraftText } from '../src/site00/foundation-client/model';

describe('dfInputDisplayUpper', () => {
  it('uppercases text and email values', () => {
    expect(dfInputDisplayUpper('Kateena Armstrong')).toBe('KATEENA ARMSTRONG');
    expect(dfInputDisplayUpper('ayoteenz@yahoo.com')).toBe('AYOTEENZ@YAHOO.COM');
  });

  it('leaves password values unchanged', () => {
    expect(dfInputDisplayUpper('Secret1!', 'password')).toBe('Secret1!');
  });
});

describe('normalizeIntakeDraftText', () => {
  it('normalizes all intake string fields', () => {
    const out = normalizeIntakeDraftText({
      business_name: 'jurnl',
      industry: 'professional services',
      contact_name: 'Kateena Armstrong',
      current_email: 'ayoteenz@yahoo.com',
      phone: '(901) 555-0100',
      existing_domain: 'example.com',
      existing_registrar: 'godaddy',
      existing_email_provider: 'gmail',
      team_size: 2,
      domainPath: 'NEW',
      needs: [],
    });
    expect(out.contact_name).toBe('KATEENA ARMSTRONG');
    expect(out.current_email).toBe('AYOTEENZ@YAHOO.COM');
    expect(out.business_name).toBe('JURNL');
  });
});
