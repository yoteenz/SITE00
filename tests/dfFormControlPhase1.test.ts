/**
 * IDNTY form control Phase 1: required/optional labels, error associations, CSS regression guards.
 */
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DfField } from '../src/site00/foundation-client/components';
import { P02Intake } from '../src/site00/foundation-client/parents/EntryIntake';
import { BUSINESS_TYPES } from '../src/site00/foundation-client/model';

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);

describe('DfField label primitives', () => {
  it('renders required asterisk without changing the label string', () => {
    const m = html(
      createElement(
        DfField,
        { id: 'df-x', label: 'BUSINESS NAME', required: true },
        createElement('input', { id: 'df-x', className: 'df-input' }),
      ),
    );
    expect(m).toContain('df-field__required');
    expect(m).toContain('BUSINESS NAME');
    expect(m).toMatch(/>\s*\*\s*</);
  });

  it('renders optional marker on its own line', () => {
    const m = html(
      createElement(
        DfField,
        { id: 'df-y', label: 'CONTACT NUMBER', optional: true, hint: 'HELP COPY' },
        createElement('input', { id: 'df-y', className: 'df-input' }),
      ),
    );
    expect(m).toContain('df-field__optional');
    expect(m).toContain('OPTIONAL');
    expect(m).toContain('id="df-y-hint"');
    expect(m).toContain('aria-describedby="df-y-hint"');
  });

  it('associates errors with aria-describedby and aria-invalid on the control', () => {
    const m = html(
      createElement(
        DfField,
        { id: 'df-z', label: 'EMAIL ADDRESS', required: true, error: 'ENTER AN EMAIL ADDRESS' },
        createElement('input', {
          id: 'df-z',
          className: 'df-input',
          'aria-invalid': true,
        }),
      ),
    );
    expect(m).toContain('id="df-z-error"');
    expect(m).toContain('role="alert"');
    expect(m).toContain('aria-describedby="df-z-error"');
  });
});

describe('P02 intake Phase 1 markup', () => {
  const draft = {
    business_name: '',
    industry: '',
    contact_name: '',
    current_email: '',
    phone: '',
    existing_domain: '',
    existing_registrar: '',
    existing_email_provider: '',
    team_size: 1,
    domainPath: null,
    needs: [] as const,
  };

  it('keeps native business type select and enum values', () => {
    const m = html(
      createElement(P02Intake, {
        draft,
        update: () => undefined,
        editable: true,
        onContinue: () => undefined,
        save: null,
      }),
    );
    expect(m).toContain('id="df-industry"');
    expect(m).toContain('<select');
    expect(m).toContain('df-native-select__chev');
    expect(m).not.toContain('df-select__chev');
    for (const t of BUSINESS_TYPES) {
      expect(m).toContain(`>${t}<`);
    }
  });

  it('prepares contact number label without aria-required', () => {
    const m = html(
      createElement(P02Intake, {
        draft,
        update: () => undefined,
        editable: true,
        onContinue: () => undefined,
        save: null,
      }),
    );
    expect(m).toContain('CONTACT NUMBER');
    expect(m).toContain('ENTER PHONE NUMBER');
    expect(m).not.toMatch(/id="df-phone"[^>]*aria-required="true"/);
  });
});

describe('Phase 1 stylesheet guards', () => {
  const css = readFileSync(new URL('../src/site00/styles/site00-df-components.css', import.meta.url), 'utf8');
  const client = readFileSync(new URL('../src/site00/styles/site00-df-client.css', import.meta.url), 'utf8');

  it('NF-01: coarse-pointer editable inputs use 16px token', () => {
    expect(css).toMatch(/--df-input-touch-size:\s*16px/);
    expect(css).toMatch(/@media \(pointer: coarse\)[\s\S]*\.df-input[\s\S]*var\(--df-input-touch-size\)/);
  });

  it('NF-02: portal chips are styled in the component sheet', () => {
    expect(css).toMatch(/^\.df-chip\b/m);
    expect(css).toMatch(/appearance:\s*none/);
  });

  it('C-1: native select chevron class lives in the client sheet only', () => {
    expect(client).toMatch(/\.df-native-select__chev/);
  });

  it('NF-06: unchecked checkbox edge uses approved 1.5px #8f8d88 token', () => {
    expect(css).toMatch(/--df-check-edge:\s*#8f8d88/);
    expect(css).toMatch(/border:\s*var\(--df-check-border\)/);
  });

  it('focus ring uses solid SITE 00 red', () => {
    expect(css).toMatch(/--df-focus-ring:\s*2px solid var\(--df-red\)/);
    expect(css).toMatch(/\.df-input:focus-visible[\s\S]*outline:\s*var\(--df-focus-ring\)/);
  });
});
